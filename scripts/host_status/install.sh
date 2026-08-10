#!/usr/bin/env bash
# install.sh — Install the LinuxCNC host status reporter on the OptiPlex.
#
# Idempotent: safe to re-run. Installs the systemd service + 5-minute timer
# that call collect_status.sh from this repo working copy.
#
# Usage (from the repo working copy on the LinuxCNC host):
#     sudo bash scripts/host_status/install.sh
#
# Environment overrides (optional):
#   MAZAK_USER       user that will run the reporter    (default: andy)
#   MAZAK_REPO_DIR   path to this repo on the host      (default: repo where script lives)
#   MAZAK_MESA_IP    Mesa 7i80HDT IP                    (default: 192.168.1.121)

set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
    echo "install.sh must be run with sudo/root." >&2
    exit 1
fi

MAZAK_USER="${MAZAK_USER:-andy}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
MAZAK_REPO_DIR="${MAZAK_REPO_DIR:-$REPO_ROOT}"
MAZAK_MESA_IP="${MAZAK_MESA_IP:-192.168.1.121}"

echo "Installing Mazak host-status reporter"
echo "  user:       $MAZAK_USER"
echo "  repo:       $MAZAK_REPO_DIR"
echo "  Mesa IP:    $MAZAK_MESA_IP"
echo

# 1. Sanity checks
if ! id "$MAZAK_USER" >/dev/null 2>&1; then
    echo "user $MAZAK_USER does not exist" >&2; exit 1
fi
if [[ ! -d "$MAZAK_REPO_DIR/.git" ]]; then
    echo "$MAZAK_REPO_DIR is not a git working copy" >&2; exit 1
fi
if [[ ! -x "$MAZAK_REPO_DIR/scripts/host_status/collect_status.sh" ]]; then
    chmod +x "$MAZAK_REPO_DIR/scripts/host_status/collect_status.sh"
fi

# 2. Dependencies
missing=()
for bin in git jq python3 ping; do
    command -v "$bin" >/dev/null 2>&1 || missing+=("$bin")
done
if (( ${#missing[@]} > 0 )); then
    echo "Installing missing packages: ${missing[*]}"
    apt-get update -qq
    apt-get install -y --no-install-recommends git jq python3 iputils-ping
fi

# 3. Render systemd units with the resolved paths.
UNIT_DIR=/etc/systemd/system
SERVICE_SRC="$SCRIPT_DIR/mazak-host-status.service"
TIMER_SRC="$SCRIPT_DIR/mazak-host-status.timer"

sed \
    -e "s|/home/andy/mazak-vqc20-linuxcnc-retrofit|$MAZAK_REPO_DIR|g" \
    -e "s|^User=.*|User=$MAZAK_USER|" \
    -e "s|^Group=.*|Group=$MAZAK_USER|" \
    -e "s|MAZAK_MESA_IP=.*|MAZAK_MESA_IP=$MAZAK_MESA_IP|" \
    "$SERVICE_SRC" > "$UNIT_DIR/mazak-host-status.service"

cp "$TIMER_SRC" "$UNIT_DIR/mazak-host-status.timer"

chmod 0644 "$UNIT_DIR/mazak-host-status.service" "$UNIT_DIR/mazak-host-status.timer"

# 4. Verify git identity + remote for the user running the timer.
sudo -u "$MAZAK_USER" git -C "$MAZAK_REPO_DIR" config user.email >/dev/null 2>&1 || \
    sudo -u "$MAZAK_USER" git -C "$MAZAK_REPO_DIR" config user.email "linuxcnc-host@localhost"
sudo -u "$MAZAK_USER" git -C "$MAZAK_REPO_DIR" config user.name  >/dev/null 2>&1 || \
    sudo -u "$MAZAK_USER" git -C "$MAZAK_REPO_DIR" config user.name  "LinuxCNC Host"

echo
echo "git remote:"
sudo -u "$MAZAK_USER" git -C "$MAZAK_REPO_DIR" remote -v || true
echo

# 5. Enable + start.
systemctl daemon-reload
systemctl enable --now mazak-host-status.timer
echo
echo "Kicking off a first run now..."
systemctl start mazak-host-status.service || true

echo
echo "Installed. Useful commands:"
echo "  systemctl status mazak-host-status.timer"
echo "  systemctl list-timers mazak-host-status.timer"
echo "  journalctl -u mazak-host-status.service -n 50 --no-pager"
echo "  systemctl start mazak-host-status.service     # run once on demand"
