#!/usr/bin/env python3
"""backup_watch.py — notice a backup that has quietly STOPPED running.

The OnFailure hook covers a job that runs and fails. It cannot cover the more
insidious case: a job that stops running at all. A masked unit, a disabled
timer, a laptop asleep every night for a week -- nothing fails, nothing logs,
and the backup silently ages out. That is the failure most likely to be
discovered on the day you need the backup.

For each watched unit this asks systemd two questions: did the last run
succeed, and how long ago was it? Either answer being wrong is a problem.

Notifications are deduplicated to at most one per unit per DEDUP_HOURS, so a
Mac that stays asleep produces one message rather than a nightly nag.

Source of truth:  scripts/health/backup_watch.py (this repo)
Installed to:     /usr/local/bin/mazak-backup-watch.py
Log:              journalctl -u mazak-backup-watch
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
import time
from pathlib import Path

STATE = Path(os.environ.get("MAZAK_HEALTH_DIR", "/var/lib/mazak-health"))
SEEN = STATE / "backup_watch_seen.json"
NOTIFY = os.environ.get("MAZAK_NOTIFY", "/usr/local/bin/mazak-notify.sh")
DEDUP_HOURS = float(os.environ.get("DEDUP_HOURS", "24"))

# unit -> (max age in hours before it counts as stale, human cadence)
# Thresholds are generous on purpose. The daily jobs that reach another machine
# legitimately miss a night when a Mac is asleep; three days means something is
# actually wrong rather than someone closed a lid.
WATCH = {
    "mazak-gcode-backup.service":         (6,   "hourly"),
    "mazak-smart-collect.service":        (6,   "hourly"),
    "mazak-gcode-backup-remote.service":  (72,  "daily -> iMac"),
    "mazak-photos-backup.service":        (72,  "daily <- Google Drive"),
    "mazak-video-projects-backup.service":(72,  "daily <- USB Video Drive"),
}


def show(unit: str, prop: str) -> str:
    try:
        return subprocess.run(
            ["systemctl", "show", unit, "-p", prop, "--value"],
            capture_output=True, text=True, timeout=15).stdout.strip()
    except Exception:
        return ""


def last_run_epoch(unit: str) -> float | None:
    """Seconds since epoch of the last run, or None if it has never run."""
    raw = show(unit, "ExecMainExitTimestamp")          # e.g. 'Sun 2026-08-23 12:40:00 MDT'
    if not raw:
        return None
    for fmt in ("%a %Y-%m-%d %H:%M:%S %Z", "%a %Y-%m-%d %H:%M:%S"):
        try:
            return time.mktime(time.strptime(raw, fmt))
        except ValueError:
            continue
    # Fall back to the monotonic-microseconds property.
    us = show(unit, "ExecMainExitTimestampMonotonic")
    if us.isdigit() and int(us):
        with open("/proc/uptime") as fh:
            up = float(fh.read().split()[0])
        return time.time() - (up - int(us) / 1e6)
    return None


def main() -> int:
    STATE.mkdir(parents=True, exist_ok=True)
    try:
        seen = json.loads(SEEN.read_text())
    except Exception:
        seen = {}

    now = time.time()
    problems = []

    for unit, (max_age_h, cadence) in WATCH.items():
        if show(unit, "LoadState") != "loaded":
            problems.append((unit, "unit is not installed", cadence))
            continue
        # A timer that is not enabled will never fire again.
        timer = unit.replace(".service", ".timer")
        if show(timer, "LoadState") == "loaded" and show(timer, "ActiveState") != "active":
            problems.append((unit, f"{timer} is not active — it will never run again", cadence))
            continue

        status = show(unit, "ExecMainStatus")
        last = last_run_epoch(unit)

        if last is None:
            problems.append((unit, "has never run", cadence))
            continue
        age_h = (now - last) / 3600
        if status not in ("0", ""):
            problems.append((unit, f"last run FAILED (exit {status}), {age_h:.1f} h ago", cadence))
        elif age_h > max_age_h:
            problems.append(
                (unit, f"last success was {age_h:.1f} h ago (expected within {max_age_h} h)", cadence))

    if not problems:
        SEEN.write_text(json.dumps({}))
        print(f"OK    all {len(WATCH)} backup jobs current")
        return 0

    fresh = []
    for unit, why, cadence in problems:
        last_notified = seen.get(unit, 0)
        if now - last_notified >= DEDUP_HOURS * 3600:
            fresh.append((unit, why, cadence))
            seen[unit] = now
        print(f"STALE {unit}: {why}")

    SEEN.write_text(json.dumps(seen))

    if fresh and os.access(NOTIFY, os.X_OK):
        body = "\n\n".join(f"{u.replace('.service','')} ({c})\n  {w}" for u, w, c in fresh)
        subprocess.run([
            NOTIFY,
            f"Backup stale on {os.uname().nodename}",
            f"{len(fresh)} backup job(s) not running as expected:\n\n{body}\n\n"
            f"Check:\n  systemctl list-timers 'mazak-*'\n"
            f"  journalctl -u <unit> -n 30 --no-pager",
            "high",
        ], timeout=60)
        print(f"notified about {len(fresh)} of {len(problems)} problem(s)")
    else:
        print(f"{len(problems)} problem(s), none newly notifiable (dedup {DEDUP_HOURS} h)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
