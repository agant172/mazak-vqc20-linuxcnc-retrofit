#!/usr/bin/env bash
# notify_failure.sh — what systemd runs when one of our units fails.
#
# Wired in as `OnFailure=mazak-notify-failure@%n.service` on each backup and
# health unit, rather than by editing every exit path in every script. systemd's
# definition of failure is broader than any script's: it also catches timeouts,
# the process being killed, OOM, and a unit that never started. Those are
# exactly the failures a script cannot report on its own, because it is not
# running any more.
#
# Argument is the failed unit name, passed by the template's %i.
#
# Source of truth:  scripts/health/notify_failure.sh (this repo)
# Installed to:     /usr/local/bin/mazak-notify-failure.sh

set -uo pipefail

unit="${1:-unknown.service}"
NOTIFY="${MAZAK_NOTIFY:-/usr/local/bin/mazak-notify.sh}"

result="$(systemctl show "$unit" -p Result --value 2>/dev/null)"
status="$(systemctl show "$unit" -p ExecMainStatus --value 2>/dev/null)"
desc="$(systemctl show "$unit" -p Description --value 2>/dev/null)"

# The last few log lines are usually the whole diagnosis: our scripts print a
# one-line FAIL with the reason.
tail_lines="$(journalctl -u "$unit" -n 6 --no-pager -o cat 2>/dev/null | grep -v '^$' | tail -4)"

logger -t mazak-notify-failure "unit=$unit result=$result status=$status"

[ -x "$NOTIFY" ] || exit 0
"$NOTIFY" \
	"Backup failed on $(hostname -s): ${unit%.service}" \
	"$desc

result=$result exit=$status

$tail_lines

Investigate:
  journalctl -u $unit -n 40 --no-pager
  systemctl status $unit" \
	"high" || true
exit 0
