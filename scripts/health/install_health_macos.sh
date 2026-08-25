#!/usr/bin/env bash
# install_health_macos.sh — hourly SMART snapshot on a Mac, macOS counterpart
# to install_health.sh (which is systemd/Linux-only).
#
# Installs just the snapshot: /var/lib/mazak-health/smart.json, which netwatch
# reads the same way on every machine. Deliberately does NOT try to replicate
# install_health.sh's smartd continuous-monitoring + push-alert path -- macOS
# has no equivalent to `-M exec` wired into a system daemon out of the box,
# and that is a bigger lift than "netwatch can see drive health here too."
#
# Requires smartmontools from Homebrew (`brew install smartmontools`) and
# passwordless sudo for the user running this script.
#
# Usage:  bash scripts/health/install_health_macos.sh

set -euo pipefail

if [[ "$(uname -s)" != "Darwin" ]]; then
    echo "install_health_macos.sh is for macOS; use install_health.sh on Linux." >&2
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
STATE_DIR=/var/lib/mazak-health
PLIST_LABEL=com.andygant.mazak-smart-collect
PLIST_DEST="/Library/LaunchDaemons/${PLIST_LABEL}.plist"

BREW_PREFIX="$(brew --prefix 2>/dev/null || echo /opt/homebrew)"
command -v "$BREW_PREFIX/bin/smartctl" >/dev/null || {
    echo "smartmontools not installed -- run: brew install smartmontools" >&2
    exit 1
}

echo "Installing SMART snapshot monitoring (macOS)"
echo "  state dir: $STATE_DIR"
echo

python3 -c "import ast,sys; ast.parse(open(sys.argv[1]).read())" "$SCRIPT_DIR/smart_collect.py"

sudo install -d -m 0755 "$STATE_DIR"
sudo install -m 0755 -o root -g wheel "$SCRIPT_DIR/smart_collect.py" /usr/local/bin/mazak-smart-collect.py
sudo install -m 0644 -o root -g wheel "$SCRIPT_DIR/${PLIST_LABEL}.plist" "$PLIST_DEST"

sudo launchctl bootout system "$PLIST_DEST" 2>/dev/null || true
sudo launchctl bootstrap system "$PLIST_DEST"
sudo launchctl enable "system/${PLIST_LABEL}"

echo
echo "First snapshot..."
sudo launchctl kickstart -k "system/${PLIST_LABEL}"
sleep 2
cat "$STATE_DIR/smart.json" 2>/dev/null | python3 -m json.tool | head -40 || \
    echo "no smart.json yet -- check /var/log/mazak-smart-collect.log"

echo
echo "Installed. Useful commands:"
echo "  cat $STATE_DIR/smart.json | python3 -m json.tool | head -40"
echo "  sudo launchctl print system/${PLIST_LABEL}"
echo "  cat /var/log/mazak-smart-collect.log"
