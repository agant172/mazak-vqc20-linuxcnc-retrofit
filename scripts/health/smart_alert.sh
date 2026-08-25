#!/usr/bin/env bash
# smart_alert.sh — what smartd runs when a drive reports trouble.
#
# Wired in as the `-M exec` target in /etc/smartd.conf. smartd hands us the
# details in the environment (SMARTD_DEVICE, SMARTD_MESSAGE, SMARTD_FAILTYPE...).
#
# Three things happen, in order of how reliably they reach a human:
#   1. journal   — always, so `journalctl` and netwatch can find it
#   2. flag file — a durable marker netwatch renders on the dashboard, so the
#                  alert survives a reboot and does not need anyone to have been
#                  watching at the moment it fired
#   3. push      — best effort, via notify.sh, if a channel is configured
#
# Stock Debian smartd mails local root. There is no MTA on this box, so that
# path silently discards every warning it ever produces. This replaces it.
#
# Source of truth:  scripts/health/smart_alert.sh (this repo)
# Installed to:     /usr/local/bin/mazak-smart-alert.sh
# Log:              journalctl -t mazak-smart-alert

set -uo pipefail

STATE_DIR="${MAZAK_HEALTH_DIR:-/var/lib/mazak-health}"
NOTIFY="${MAZAK_NOTIFY:-/usr/local/bin/mazak-notify.sh}"
ALERTS="$STATE_DIR/alerts.jsonl"
FLAG="$STATE_DIR/ALERT"

dev="${SMARTD_DEVICE:-unknown}"
devstr="${SMARTD_DEVICESTRING:-$dev}"
failtype="${SMARTD_FAILTYPE:-unknown}"
message="${SMARTD_MESSAGE:-no message}"
stamp="$(date -Is)"

mkdir -p "$STATE_DIR"

# 1. journal
logger -t mazak-smart-alert "SMART ALERT device=$devstr type=$failtype: $message"

# 2. durable record + flag, written atomically enough that a reader never sees
#    a torn line.
python3 - "$ALERTS" "$stamp" "$devstr" "$failtype" "$message" <<'PY'
import json, sys
path, stamp, dev, failtype, message = sys.argv[1:6]
with open(path, "a") as fh:
    fh.write(json.dumps({
        "at": stamp, "device": dev, "failtype": failtype, "message": message,
    }) + "\n")
PY

printf '%s %s (%s): %s\n' "$stamp" "$devstr" "$failtype" "$message" > "$FLAG"
chmod 0644 "$ALERTS" "$FLAG" 2>/dev/null

# 3. push, best effort — never let a dead network turn into a failed alert
if [ -x "$NOTIFY" ]; then
	"$NOTIFY" \
		"SMART alert on $(hostname -s): $devstr" \
		"$failtype

$message

Machine: $(hostname -s)
Time:    $stamp

This is the LinuxCNC control PC. Check:
  journalctl -t mazak-smart-alert -n 20
  smartctl -a $devstr" \
		"urgent" || true
fi

exit 0
