#!/usr/bin/env bash
# install_photos_backup.sh — daily Google Drive -> /mnt/media photo mirror.
#
# Prerequisite, done once by hand because it needs a browser and the owner's
# Google consent:
#     rclone authorize "drive" --drive-scope drive.readonly
#     rclone config create gdrive drive scope drive.readonly token '<json>'
# Read-only scope is deliberate: Drive is the sole copy of these photos, so the
# backup job must be structurally incapable of changing it.
#
# Usage:  sudo bash scripts/backup/install_photos_backup.sh

set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
    echo "install_photos_backup.sh must be run with sudo/root." >&2
    exit 1
fi

MAZAK_USER="${MAZAK_USER:-andy}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
USER_HOME="$(getent passwd "$MAZAK_USER" | cut -d: -f6)"
BACKUP_MOUNT="${BACKUP_MOUNT:-/mnt/media}"
UNIT_DIR=/etc/systemd/system

command -v rclone >/dev/null || { echo "rclone is not installed" >&2; exit 1; }
mountpoint -q "$BACKUP_MOUNT" || { echo "$BACKUP_MOUNT is not mounted" >&2; exit 1; }

# The remote must exist AND be read-only. A read-write remote here would mean a
# bug in this job could delete the only copy of the photos.
scope="$(sudo -u "$MAZAK_USER" rclone config show gdrive 2>/dev/null | awk -F' = ' '/^scope/{print $2}')"
if [[ -z "$scope" ]]; then
    echo "rclone remote 'gdrive' is not configured for $MAZAK_USER — see header" >&2
    exit 1
fi
if [[ "$scope" != "drive.readonly" ]]; then
    echo "REFUSING: remote 'gdrive' has scope '$scope', not drive.readonly." >&2
    echo "Drive is the sole copy of these photos; the backup job must not be able to write to it." >&2
    exit 1
fi
echo "  rclone remote 'gdrive' present, scope=$scope"

bash -n "$SCRIPT_DIR/photos_backup.sh"
install -m 0755 -o root -g root "$SCRIPT_DIR/photos_backup.sh" /usr/local/bin/mazak-photos-backup.sh
install -d -o "$MAZAK_USER" -g "$MAZAK_USER" -m 0755 \
    "$BACKUP_MOUNT/mazak-photos" "$BACKUP_MOUNT/mazak-photos-history"

sed -e "s|/home/andy/mazak-vqc20-linuxcnc-retrofit|$REPO_ROOT|g" \
    -e "s|^User=.*|User=$MAZAK_USER|" \
    -e "s|^Group=.*|Group=$MAZAK_USER|" \
    -e "s|^Environment=HOME=.*|Environment=HOME=$USER_HOME|" \
    "$SCRIPT_DIR/mazak-photos-backup.service" > "$UNIT_DIR/mazak-photos-backup.service"
cp "$SCRIPT_DIR/mazak-photos-backup.timer" "$UNIT_DIR/mazak-photos-backup.timer"
chmod 0644 "$UNIT_DIR"/mazak-photos-backup.{service,timer}

systemctl daemon-reload
systemctl enable --now mazak-photos-backup.timer
echo
echo "Installed. Useful commands:"
echo "  systemctl list-timers mazak-photos-backup.timer"
echo "  journalctl -u mazak-photos-backup -n 30 --no-pager"
echo "  systemctl start mazak-photos-backup.service   # run once on demand"
