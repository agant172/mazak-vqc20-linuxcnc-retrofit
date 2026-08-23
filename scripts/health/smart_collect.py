#!/usr/bin/env python3
"""smart_collect.py — snapshot SMART health for every ATA/NVMe disk to JSON.

Writes STATE_DIR/smart.json, which netwatch reads so drive health shows up on
the shop dashboard alongside everything else. Read-only: it runs smartctl and
writes one file. It never starts a self-test and never touches a disk.

Why a snapshot file at all, when smartd is already running? smartd only speaks
up when something goes WRONG, and its stock Debian config mails local root on a
box with no MTA — so silence is indistinguishable from "nobody is looking."
This makes the good case visible too: if smart.json is stale, the monitoring
itself has stopped, and that is the failure you actually want to catch.

Source of truth:  scripts/health/smart_collect.py (this repo)
Installed to:     /usr/local/bin/mazak-smart-collect.py
Log:              journalctl -u mazak-smart-collect
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import time
from pathlib import Path

STATE_DIR = Path(os.environ.get("MAZAK_HEALTH_DIR", "/var/lib/mazak-health"))
OUT = STATE_DIR / "smart.json"

# Attributes worth surfacing, mapped to a friendlier key. Anything non-zero in
# the first group is a genuine "look at this now" signal.
# Raw values here are trustworthy across vendors and mean what they say, so a
# non-zero reading is worth surfacing.
CRITICAL = {
    5: "reallocated_sectors",
    187: "reported_uncorrectable",
    197: "pending_sectors",
    198: "offline_uncorrectable",
    199: "sata_crc_errors",
}

# Informational. Attribute 188 lives here deliberately: many controllers pack
# three counters into its raw field, so a large number is usually a decoding
# artifact rather than real timeouts -- this box's SanDisk reports 8261 with a
# normalized value of 100 and no failure flag. Judge it by NORMALIZED, below.
INFO = {
    9: "power_on_hours",
    12: "power_cycles",
    173: "avg_erase_count",
    188: "command_timeout_raw",
    194: "temperature_c",
    202: "percent_lifetime_used",
    241: "total_lbas_written",
}

# Read these from the NORMALIZED value, not the raw field. Vendors encode raw
# life-remaining inconsistently -- the SanDisk in this box reports a raw
# 8589934610 (0x200000012) for attribute 201, which is meaningless, while its
# normalized value is a perfectly sensible 98.
NORMALIZED = {
    201: "lifetime_remaining_pct",
    231: "ssd_life_left_pct",
    233: "media_wearout_pct",
}


def run(args: list[str]) -> tuple[int, str]:
    try:
        p = subprocess.run(args, capture_output=True, text=True, timeout=60)
        return p.returncode, p.stdout
    except (subprocess.TimeoutExpired, FileNotFoundError) as exc:
        return 1, str(exc)


def list_disks() -> list[str]:
    rc, out = run(["smartctl", "--scan"])
    disks = []
    for line in out.splitlines():
        line = line.strip()
        if line and not line.startswith("#"):
            disks.append(line.split()[0])
    return disks


def parse_disk(dev: str) -> dict:
    d: dict = {"device": dev}

    rc, info = run(["smartctl", "-i", "-H", dev])
    for key, pat in (
        ("model", r"Device Model:\s+(.+)"),
        ("serial", r"Serial Number:\s+(.+)"),
        ("firmware", r"Firmware Version:\s+(.+)"),
        ("capacity", r"User Capacity:.*\[(.+?)\]"),
    ):
        m = re.search(pat, info)
        if m:
            d[key] = m.group(1).strip()

    m = re.search(r"SMART overall-health self-assessment test result:\s+(\S+)", info)
    d["health"] = m.group(1) if m else "UNKNOWN"

    # Attributes
    rc, attrs = run(["smartctl", "-A", dev])
    crit, meta = {}, {}
    for line in attrs.splitlines():
        m = re.match(r"\s*(\d+)\s+(\S+)\s+0x\S+\s+(\d+)\s+(\d+)\s+(\S+)\s+\S+\s+\S+\s+(\S+)\s+(.*)$", line)
        if not m:
            continue
        aid, _name, value, _worst, _thresh, when_failed, raw = m.groups()
        aid = int(aid)
        raw_first = raw.strip().split()[0] if raw.strip() else "0"
        try:
            raw_val = int(raw_first)
        except ValueError:
            continue
        if aid in CRITICAL:
            crit[CRITICAL[aid]] = raw_val
        if aid in INFO:
            meta[INFO[aid]] = raw_val
        if aid in NORMALIZED:
            meta[NORMALIZED[aid]] = int(value)
        if when_failed not in ("-", ""):
            d.setdefault("failing_attributes", []).append(_name)

    d["critical"] = crit
    d["info"] = meta

    # Most recent self-test
    rc, st = run(["smartctl", "-l", "selftest", dev])
    m = re.search(r"^#\s*1\s+(\S.*?\S)\s{2,}(\S.*?\S)\s{2,}(\d+%)", st, re.M)
    if m:
        d["last_self_test"] = {"type": m.group(1), "status": m.group(2)}
    elif "No self-tests have been logged" in st:
        d["last_self_test"] = {"type": None, "status": "never run"}

    # Verdict: PASSED plus every critical counter at zero, or say why not.
    problems = [k for k, v in crit.items() if v]
    if d["health"] != "PASSED":
        d["verdict"] = "FAIL"
    elif d.get("failing_attributes"):
        d["verdict"] = "FAIL"
    elif problems:
        d["verdict"] = "WATCH"
        d["watch_reason"] = problems
    else:
        d["verdict"] = "OK"
    return d


def main() -> int:
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    disks = list_disks()
    if not disks:
        print("no disks reported by `smartctl --scan`", file=sys.stderr)
        return 1

    result = {
        "collected_at": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "collected_at_epoch": int(time.time()),
        "host": os.uname().nodename,
        "disks": [parse_disk(dev) for dev in disks],
    }
    worst = "OK"
    for disk in result["disks"]:
        if disk["verdict"] == "FAIL":
            worst = "FAIL"
        elif disk["verdict"] == "WATCH" and worst == "OK":
            worst = "WATCH"
    result["overall"] = worst

    tmp = OUT.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(result, indent=2) + "\n")
    tmp.replace(OUT)          # atomic, so netwatch never reads a half-written file
    os.chmod(OUT, 0o644)

    for disk in result["disks"]:
        print(f"{disk['device']:10} {disk.get('model','?'):28} "
              f"{disk['verdict']:6} fw={disk.get('firmware','?')}")
    print(f"overall={worst}  ->  {OUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
