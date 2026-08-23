#!/usr/bin/env bash
# install_gcode_backup.sh — Install the LinuxCNC backup timer on the OptiPlex.
#
# Idempotent: safe to re-run, and re-running is how you deploy an edit to
# gcode_backup.sh (the timer runs an installed copy under /usr/local/bin, not
# the script in the working copy — see mazak-gcode-backup.service for why).
#
# Usage (from the repo working copy on the LinuxCNC host):
#     sudo bash scripts/backup/install_gcode_backup.sh
#
# Environment overrides (optional):
#   MAZAK_USER    user that will run the timer   (default: andy)
#   BACKUP_SRC    directory to protect           (default: ~MAZAK_USER/linuxcnc)
#   BACKUP_MOUNT  mount point that must be live  (default: /mnt/media)
#   BACKUP_DEST   backup root on that mount      (default: $BACKUP_MOUNT/linuxcnc-backup)

set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
    echo "install_gcode_backup.sh must be run with sudo/root." >&2
    exit 1
fi

MAZAK_USER="${MAZAK_USER:-andy}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
USER_HOME="$(getent passwd "$MAZAK_USER" | cut -d: -f6)"
BACKUP_SRC="${BACKUP_SRC:-$USER_HOME/linuxcnc}"
BACKUP_MOUNT="${BACKUP_MOUNT:-/mnt/media}"
BACKUP_DEST="${BACKUP_DEST:-$BACKUP_MOUNT/linuxcnc-backup}"

BIN_DST=/usr/local/bin/mazak-gcode-backup.sh
UNIT_DIR=/etc/systemd/system

echo "Installing LinuxCNC backup timer"
echo "  user:    $MAZAK_USER"
echo "  source:  $BACKUP_SRC"
echo "  mount:   $BACKUP_MOUNT"
echo "  dest:    $BACKUP_DEST"
echo

# 1. Sanity checks
if ! id "$MAZAK_USER" >/dev/null 2>&1; then
    echo "user $MAZAK_USER does not exist" >&2; exit 1
fi
if [[ ! -d "$BACKUP_SRC" ]]; then
    echo "source $BACKUP_SRC does not exist" >&2; exit 1
fi
if ! command -v rsync >/dev/null 2>&1; then
    echo "rsync is not installed — apt-get install rsync" >&2; exit 1
fi
# A backup onto the same physical disk as the source is not a backup. Catch the
# mistake at install time, where it is obvious, instead of discovering it the
# day the root disk dies.
if ! mountpoint -q "$BACKUP_MOUNT"; then
    echo "$BACKUP_MOUNT is not a mount point — the backup would land on the root disk" >&2
    exit 1
fi
src_dev="$(findmnt -no SOURCE --target "$BACKUP_SRC")"
dst_dev="$(findmnt -no SOURCE --target "$BACKUP_MOUNT")"
if [[ "$src_dev" == "$dst_dev" ]]; then
    echo "source and destination are both on $src_dev — that is a copy, not a backup" >&2
    exit 1
fi
echo "  source lives on $src_dev, destination on $dst_dev — separate devices, good"
echo

bash -n "$SCRIPT_DIR/gcode_backup.sh"

# 2. Install the script copy the units actually exec.
install -m 0755 -o root -g root "$SCRIPT_DIR/gcode_backup.sh" "$BIN_DST"

# 3. Render systemd units with the resolved paths.
sed \
    -e "s|/home/andy/mazak-vqc20-linuxcnc-retrofit|$REPO_ROOT|g" \
    -e "s|^User=.*|User=$MAZAK_USER|" \
    -e "s|^Group=.*|Group=$MAZAK_USER|" \
    -e "s|^Environment=HOME=.*|Environment=HOME=$USER_HOME|" \
    -e "s|^Environment=SRC=.*|Environment=SRC=$BACKUP_SRC|" \
    -e "s|^Environment=DEST_MOUNT=.*|Environment=DEST_MOUNT=$BACKUP_MOUNT|" \
    -e "s|^Environment=DEST_ROOT=.*|Environment=DEST_ROOT=$BACKUP_DEST|" \
    -e "s|^RequiresMountsFor=.*|RequiresMountsFor=$BACKUP_MOUNT|" \
    "$SCRIPT_DIR/mazak-gcode-backup.service" > "$UNIT_DIR/mazak-gcode-backup.service"

cp "$SCRIPT_DIR/mazak-gcode-backup.timer" "$UNIT_DIR/mazak-gcode-backup.timer"
chmod 0644 "$UNIT_DIR/mazak-gcode-backup.service" "$UNIT_DIR/mazak-gcode-backup.timer"

# 4. Make sure the destination root exists and belongs to the user.
install -d -o "$MAZAK_USER" -g "$MAZAK_USER" -m 0755 "$BACKUP_DEST"

# 5. Enable + start.
systemctl daemon-reload
systemctl enable --now mazak-gcode-backup.timer
echo
echo "Kicking off a first run now..."
systemctl start mazak-gcode-backup.service || true
sleep 2
journalctl -u mazak-gcode-backup -n 5 --no-pager -o cat || true

echo
echo "Installed. Useful commands:"
echo "  systemctl list-timers mazak-gcode-backup.timer"
echo "  journalctl -u mazak-gcode-backup -n 50 --no-pager"
echo "  systemctl start mazak-gcode-backup.service          # run once on demand"
echo "  sudo systemctl disable --now mazak-gcode-backup.timer   # turn it off"
