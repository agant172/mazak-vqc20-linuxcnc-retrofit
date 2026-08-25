#!/usr/bin/env bash
# install_health.sh — disk-health monitoring for the OptiPlex.
#
# Installs three things:
#   1. an hourly SMART snapshot   -> /var/lib/mazak-health/smart.json (netwatch reads it)
#   2. a real smartd alert path   -> journal + flag file + optional push
#   3. weekly + monthly self-tests so failures surface before you need the disk
#
# The point of 2 is that Debian's stock smartd.conf ends in `-m root`, and this
# box has no MTA — so out of the box every SMART warning it will ever produce is
# written to a mailbox nobody opens.
#
# Usage:  sudo bash scripts/health/install_health.sh
#
# Push channel is configured separately and deliberately NOT in this repo
# (the repo is public); see scripts/health/notify.sh for the file format.

set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
    echo "install_health.sh must be run with sudo/root." >&2
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
STATE_DIR=/var/lib/mazak-health
UNIT_DIR=/etc/systemd/system

command -v smartctl >/dev/null || { echo "smartmontools not installed" >&2; exit 1; }

echo "Installing disk-health monitoring"
echo "  state dir: $STATE_DIR"
echo

python3 -c "import ast,sys; ast.parse(open(sys.argv[1]).read())" "$SCRIPT_DIR/smart_collect.py"
bash -n "$SCRIPT_DIR/smart_alert.sh"
bash -n "$SCRIPT_DIR/notify.sh"

install -d -m 0755 "$STATE_DIR"
install -m 0755 -o root -g root "$SCRIPT_DIR/smart_collect.py" /usr/local/bin/mazak-smart-collect.py
install -m 0755 -o root -g root "$SCRIPT_DIR/smart_alert.sh"   /usr/local/bin/mazak-smart-alert.sh
install -m 0755 -o root -g root "$SCRIPT_DIR/notify.sh"        /usr/local/bin/mazak-notify.sh

sed -e "s|/home/andy/mazak-vqc20-linuxcnc-retrofit|$REPO_ROOT|g" \
    "$SCRIPT_DIR/mazak-smart-collect.service" > "$UNIT_DIR/mazak-smart-collect.service"
cp "$SCRIPT_DIR/mazak-smart-collect.timer" "$UNIT_DIR/mazak-smart-collect.timer"
chmod 0644 "$UNIT_DIR"/mazak-smart-collect.{service,timer}

# --- smartd: replace the mail-to-nowhere default -----------------------------
# -a            monitor everything smartd knows how to monitor
# -o on/-S on   enable offline data collection and attribute autosave
# -s (S/../.././02|L/../../6/03)
#               short self-test daily at 02:00, long self-test Saturdays 03:00.
#               A disk that is never exercised fails silently the day you need
#               to read from it, which on this box is the day you lost the other
#               copy of your G-code.
# -M exec       our alert script, instead of mailing a root mailbox that has no
#               MTA behind it and is never read.
SMARTD_CONF=/etc/smartd.conf
if ! grep -q "mazak-smart-alert" "$SMARTD_CONF"; then
    cp "$SMARTD_CONF" "$SMARTD_CONF.bak.$(date +%Y%m%d)"
    # Comment out any active DEVICESCAN so ours is the only one.
    sed -i 's|^\s*DEVICESCAN|#&|' "$SMARTD_CONF"
    cat >> "$SMARTD_CONF" <<'CONF'

# --- Mazak retrofit: real alerting, added by scripts/health/install_health.sh
# Replaces the stock `DEVICESCAN ... -m root`, which mails a local root mailbox
# that has no MTA behind it and that nobody reads.
DEVICESCAN -a -o on -S on -n standby,q \
    -s (S/../.././02|L/../../6/03) \
    -m <nomailer> -M exec /usr/local/bin/mazak-smart-alert.sh
CONF
    echo "  smartd.conf updated (backup alongside it)"
else
    echo "  smartd.conf already wired to mazak-smart-alert.sh"
fi

# --- per-hop network latency history (PingPlotter-style) --------------------
if command -v mtr >/dev/null 2>&1; then
    bash -n "$SCRIPT_DIR/netpath_log.sh"
    python3 -c "import ast,sys; ast.parse(open(sys.argv[1]).read())" "$SCRIPT_DIR/netpath_report.py"
    install -m 0755 -o root -g root "$SCRIPT_DIR/netpath_log.sh"    /usr/local/bin/mazak-netpath-log.sh
    install -m 0755 -o root -g root "$SCRIPT_DIR/netpath_report.py" /usr/local/bin/mazak-netpath-report.py
    sed -e "s|/home/andy/mazak-vqc20-linuxcnc-retrofit|$REPO_ROOT|g" \
        "$SCRIPT_DIR/mazak-netpath-log.service" > "$UNIT_DIR/mazak-netpath-log.service"
    cp "$SCRIPT_DIR/mazak-netpath-log.timer" "$UNIT_DIR/mazak-netpath-log.timer"
    chmod 0644 "$UNIT_DIR"/mazak-netpath-log.{service,timer}
    systemctl daemon-reload
    systemctl enable --now mazak-netpath-log.timer
    echo "  netpath history enabled (every 5 min)"
else
    echo "  netpath history SKIPPED: mtr not installed (apt-get install mtr)" >&2
fi

systemctl daemon-reload
systemctl enable --now mazak-smart-collect.timer
systemctl restart smartmontools

echo
echo "First snapshot..."
systemctl start mazak-smart-collect.service || true
sleep 1
journalctl -u mazak-smart-collect -n 8 --no-pager -o cat || true

echo
echo "Installed. Useful commands:"
echo "  cat $STATE_DIR/smart.json | python3 -m json.tool | head -40"
echo "  systemctl list-timers 'mazak-*'"
echo "  journalctl -t mazak-smart-alert -n 20        # any alerts that fired"
echo "  sudo /usr/local/bin/mazak-notify.sh 'test' 'hello'   # test the push channel"
