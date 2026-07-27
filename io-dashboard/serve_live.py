#!/usr/bin/env python3
"""
serve_live.py - optional read-only live bridge for the Mazak I/O Navigator.

Serves the static navigator from this directory and adds ONE extra endpoint:

    GET /api/io   -> JSON snapshot of HAL signal values

It is deliberately read-only:

  * The only external command it ever runs is `halcmd -s show sig`
    (plus `halcmd -s show pin` when --pins is given).
  * There is no code path that calls `halcmd setp`, `sets`, `net`, `unlinkp`,
    `loadrt`, `start`, `stop` or anything else that can change machine state.
  * Requests other than GET are refused.

If halcmd is missing, or LinuxCNC is not running, /api/io returns HTTP 200 with
{"ok": false, "error": "..."} and the frontend falls back to planning mode.

Run it on the LinuxCNC host, in this folder:

    python3 serve_live.py                 # http://127.0.0.1:8765/
    python3 serve_live.py --port 9000
    python3 serve_live.py --host 0.0.0.0  # reachable from another machine on the shop LAN

Python 3 standard library only. No third-party packages, no network access.
"""

import argparse
import json
import os
import shutil
import subprocess
import sys
import time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE_TTL = 0.5          # seconds; protects halcmd from a hammering browser
HALCMD_TIMEOUT = 4.0     # seconds


# --------------------------------------------------------------------------- #
# halcmd reading
# --------------------------------------------------------------------------- #

def _run_halcmd(args):
    """Run halcmd read-only and return (stdout, error_string)."""
    exe = shutil.which("halcmd")
    if not exe:
        return None, ("halcmd not found on PATH. This bridge only does anything on the "
                      "LinuxCNC host. The navigator still works fully in planning mode.")
    try:
        proc = subprocess.run(
            [exe, "-s"] + list(args),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=HALCMD_TIMEOUT,
            check=False,
        )
    except subprocess.TimeoutExpired:
        return None, "halcmd timed out after %.0f s." % HALCMD_TIMEOUT
    except OSError as exc:
        return None, "Could not execute halcmd: %s" % exc

    out = proc.stdout.decode("utf-8", "replace")
    err = proc.stderr.decode("utf-8", "replace").strip()

    if proc.returncode != 0:
        low = (err or out).lower()
        if "realtime" in low or "hal_lib" in low or "shmem" in low or "not loaded" in low:
            return None, ("LinuxCNC is not running (HAL shared memory is not available). "
                          "Start LinuxCNC with the Mazak config, then retry.")
        return None, "halcmd exited %d: %s" % (proc.returncode, err or out.strip() or "no output")

    return out, None


def _parse_show_sig(text):
    """Parse `halcmd -s show sig` output into {name: value}.

    Script mode emits one signal per line, whitespace separated:
        bit   FALSE  x-limit-plus
        float 0      x-vel-cmd
    Some builds append the driving pin; the signal name is the third field.
    """
    values = {}
    for raw in text.splitlines():
        line = raw.strip()
        if not line:
            continue
        parts = line.split()
        if len(parts) < 3:
            continue
        typ, val, name = parts[0], parts[1], parts[2]
        if typ not in ("bit", "s32", "u32", "float", "s64", "u64", "port"):
            continue
        if val in ("TRUE", "True", "true"):
            val = "1"
        elif val in ("FALSE", "False", "false"):
            val = "0"
        values[name] = val
    return values


_cache = {"t": 0.0, "payload": None}


def read_io(force=False):
    now = time.time()
    if not force and _cache["payload"] is not None and (now - _cache["t"]) < CACHE_TTL:
        return _cache["payload"]

    out, err = _run_halcmd(["show", "sig"])
    if err:
        payload = {
            "ok": False,
            "error": err,
            "mode": "offline",
            "signals": {},
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        }
    else:
        sigs = _parse_show_sig(out)
        payload = {
            "ok": True,
            "mode": "live",
            "source": "halcmd -s show sig",
            "read_only": True,
            "count": len(sigs),
            "signals": sigs,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        }

    _cache["t"] = now
    _cache["payload"] = payload
    return payload


# --------------------------------------------------------------------------- #
# HTTP
# --------------------------------------------------------------------------- #

class Handler(SimpleHTTPRequestHandler):
    server_version = "MazakIONavigator/1.0"

    def __init__(self, *a, **kw):
        super().__init__(*a, directory=HERE, **kw)

    def _json(self, payload, code=200):
        body = json.dumps(payload, indent=1).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path = self.path.split("?", 1)[0].rstrip("/")
        if path in ("/api/io", "/api/io.json"):
            try:
                self._json(read_io())
            except Exception as exc:                      # never take the server down
                self._json({"ok": False, "mode": "offline",
                            "error": "bridge error: %s" % exc, "signals": {}})
            return
        if path == "/api/health":
            self._json({"ok": True, "service": "mazak-io-navigator",
                        "halcmd": bool(shutil.which("halcmd")), "read_only": True})
            return
        super().do_GET()

    # Explicitly refuse anything that is not a read.
    def do_POST(self):
        self._json({"ok": False, "error": "This bridge is read-only. No writes accepted."}, 405)

    do_PUT = do_POST
    do_DELETE = do_POST
    do_PATCH = do_POST

    def log_message(self, fmt, *args):
        if "/api/io" in (args[0] if args else ""):
            return                                        # don't spam on 2 s polling
        sys.stderr.write("%s  %s\n" % (self.log_date_time_string(), fmt % args))


def main():
    ap = argparse.ArgumentParser(description="Read-only live bridge for the Mazak I/O Navigator.")
    ap.add_argument("--port", type=int, default=8765, help="listen port (default 8765)")
    ap.add_argument("--host", default="127.0.0.1",
                    help="bind address (default 127.0.0.1; use 0.0.0.0 for the shop LAN)")
    args = ap.parse_args()

    have = shutil.which("halcmd")
    print("Mazak VQC-20/40 I/O Navigator - read-only live bridge")
    print("  serving   : %s" % HERE)
    print("  url       : http://%s:%d/" % (args.host, args.port))
    print("  halcmd    : %s" % (have or "NOT FOUND - /api/io will report offline"))
    print("  writes    : disabled (this process never sets a HAL pin)")
    print("  stop with : Ctrl-C")

    httpd = ThreadingHTTPServer((args.host, args.port), Handler)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nstopped")
        httpd.server_close()


if __name__ == "__main__":
    main()
