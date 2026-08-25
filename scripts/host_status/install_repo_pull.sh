#!/usr/bin/env bash
# install_repo_pull.sh — Install the working-copy pull timer on the OptiPlex.
#
# Idempotent: safe to re-run, and re-running is how you deploy an edit to
# repo_pull.sh (the timer runs an installed copy under /usr/local/bin, not the
# script in the working copy — see mazak-repo-pull.service for why).
#
# Usage (from the repo working copy on the LinuxCNC host):
#     sudo bash scripts/host_status/install_repo_pull.sh
#
# Environment overrides (optional):
#   MAZAK_USER       user that will run the timer       (default: andy)
#   MAZAK_REPO_DIR   path to this repo on the host      (default: repo where script lives)
#   MAZAK_SSH_KEY    key used for the fetch             (default: ~MAZAK_USER/.ssh/id_ed25519)

set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
    echo "install_repo_pull.sh must be run with sudo/root." >&2
    exit 1
fi

MAZAK_USER="${MAZAK_USER:-andy}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
MAZAK_REPO_DIR="${MAZAK_REPO_DIR:-$REPO_ROOT}"
USER_HOME="$(getent passwd "$MAZAK_USER" | cut -d: -f6)"
MAZAK_SSH_KEY="${MAZAK_SSH_KEY:-$USER_HOME/.ssh/id_ed25519}"

BIN_DST=/usr/local/bin/mazak-repo-pull.sh
UNIT_DIR=/etc/systemd/system

echo "Installing Mazak working-copy pull timer"
echo "  user:       $MAZAK_USER"
echo "  repo:       $MAZAK_REPO_DIR"
echo "  ssh key:    $MAZAK_SSH_KEY"
echo

# 1. Sanity checks
if ! id "$MAZAK_USER" >/dev/null 2>&1; then
    echo "user $MAZAK_USER does not exist" >&2; exit 1
fi
if [[ ! -d "$MAZAK_REPO_DIR/.git" ]]; then
    echo "$MAZAK_REPO_DIR is not a git working copy" >&2; exit 1
fi
if [[ ! -r "$MAZAK_SSH_KEY" ]]; then
    echo "ssh key $MAZAK_SSH_KEY not readable" >&2; exit 1
fi

# The timer has no ssh-agent and BatchMode is on, so a passphrase-protected key
# would fail every run with an unhelpful "Permission denied". Catch it here.
if ! sudo -u "$MAZAK_USER" ssh-keygen -y -P "" -f "$MAZAK_SSH_KEY" >/dev/null 2>&1; then
    echo "$MAZAK_SSH_KEY appears to be passphrase-protected or unreadable by" >&2
    echo "$MAZAK_USER. The timer runs without an ssh-agent and cannot unlock it." >&2
    echo "Point MAZAK_SSH_KEY at a passphrase-free key (a deploy key is fine)." >&2
    exit 1
fi

bash -n "$SCRIPT_DIR/repo_pull.sh"

# 2. Install the script copy the units actually exec.
install -m 0755 -o root -g root "$SCRIPT_DIR/repo_pull.sh" "$BIN_DST"

# 3. Render systemd units with the resolved paths.
sed \
    -e "s|/home/andy/mazak-vqc20-linuxcnc-retrofit|$MAZAK_REPO_DIR|g" \
    -e "s|^User=.*|User=$MAZAK_USER|" \
    -e "s|^Group=.*|Group=$MAZAK_USER|" \
    -e "s|^Environment=HOME=.*|Environment=HOME=$USER_HOME|" \
    -e "s|-i /home/andy/.ssh/id_ed25519|-i $MAZAK_SSH_KEY|" \
    "$SCRIPT_DIR/mazak-repo-pull.service" > "$UNIT_DIR/mazak-repo-pull.service"

cp "$SCRIPT_DIR/mazak-repo-pull.timer" "$UNIT_DIR/mazak-repo-pull.timer"
chmod 0644 "$UNIT_DIR/mazak-repo-pull.service" "$UNIT_DIR/mazak-repo-pull.timer"

# 4. Enable + start.
systemctl daemon-reload
systemctl enable --now mazak-repo-pull.timer
echo
echo "Kicking off a first run now..."
systemctl start mazak-repo-pull.service || true
sleep 1
journalctl -u mazak-repo-pull -n 5 --no-pager -o cat || true

echo
echo "Installed. Useful commands:"
echo "  systemctl list-timers mazak-repo-pull.timer"
echo "  journalctl -u mazak-repo-pull -n 50 --no-pager"
echo "  systemctl start mazak-repo-pull.service     # run once on demand"
echo "  sudo systemctl disable --now mazak-repo-pull.timer   # turn it off"
