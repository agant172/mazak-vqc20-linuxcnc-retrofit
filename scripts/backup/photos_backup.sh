#!/usr/bin/env bash
# photos_backup.sh — pull the Mazak photo archive out of Google Drive onto /mnt/media.
#
# WHY THIS EXISTS
#   Google Drive is the SOLE copy of the retrofit's technical photos. OneDrive
#   was cleared on 2026-08-21 after verification, and both Google Photos albums
#   were folded in and unshared, so there is no second store — see CLAUDE.md
#   "Photos and large media". A cloud folder with no local copy is one account
#   problem away from gone, and these are photos of a machine that is being
#   taken apart: many of them are unrepeatable.
#
#   Neither Mac is a substitute. Both mount Drive via Drive-for-Desktop, which
#   STREAMS -- on 2026-08-23 the iMac held 4.1 GB of the 7.4 GB on disk and the
#   MacBook only 490 MB, the rest being online-only placeholders. Copying from
#   a Mac would have silently backed up a partial set.
#
# READ-ONLY BY CONSTRUCTION
#   The rclone remote is authorized with scope=drive.readonly. This job cannot
#   modify or delete anything in Drive no matter how wrong it goes -- which is
#   the right property when the source is the only copy.
#
# MIRROR WITH A SAFETY NET
#   rclone sync keeps the local copy exact, but --backup-dir diverts anything
#   that would be deleted or overwritten into history/<timestamp>/ first. If a
#   Drive-side accident deletes a folder, this job would otherwise faithfully
#   replicate the deletion within a day.
#
# Source of truth:  scripts/backup/photos_backup.sh (this repo)
# Installed to:     /usr/local/bin/mazak-photos-backup.sh
# Credentials:      ~/.config/rclone/rclone.conf (mode 600, NEVER in this repo --
#                   it holds a Google refresh token and the repo is public)
# Log:              journalctl -u mazak-photos-backup

set -uo pipefail

REMOTE_PATH="${REMOTE_PATH:-gdrive:Mazak}"
DEST_MOUNT="${DEST_MOUNT:-/mnt/media}"
DEST="${DEST:-$DEST_MOUNT/mazak-photos}"
HISTORY="${HISTORY:-$DEST_MOUNT/mazak-photos-history}"
RETAIN_DAYS="${RETAIN_DAYS:-180}"
MIN_FILES="${MIN_FILES:-500}"

log() { echo "$(date -Is) $*"; }
stamp="$(date +%Y-%m-%dT%H%M%S)"

# 1. Same guard as the G-code job, and for the same reason: /mnt/media exists as
#    an empty directory on the ROOT disk when the media SSD is not mounted, and
#    an unguarded sync would quietly fill the root filesystem with 7.4 GB while
#    looking like it worked.
if ! mountpoint -q "$DEST_MOUNT"; then
	log "FAIL $DEST_MOUNT is not mounted — refusing to write onto the root disk"
	exit 4
fi

if ! rclone listremotes 2>/dev/null | grep -q "^${REMOTE_PATH%%:*}:"; then
	log "FAIL rclone remote '${REMOTE_PATH%%:*}' is not configured"
	exit 3
fi

# 2. Ask Drive what it holds before trusting a sync that can delete local files.
#    An auth failure or an empty listing must not be allowed to look like "the
#    user deleted everything".
remote_count="$(rclone size "$REMOTE_PATH" --json 2>/dev/null | python3 -c 'import json,sys
try: print(json.load(sys.stdin)["count"])
except Exception: print(0)')"
if [ "${remote_count:-0}" -lt "$MIN_FILES" ]; then
	log "SKIP Drive reports $remote_count objects, below MIN_FILES=$MIN_FILES — refusing to mirror what looks like a failed listing or a mass deletion"
	exit 0
fi

mkdir -p "$DEST" "$HISTORY" || { log "FAIL cannot create $DEST"; exit 5; }

# 3. Sync. --tpslimit keeps us from hammering the Drive API; low priority I/O so
#    a 7 GB pull can never contend with motion on this control PC.
out="$(rclone sync "$REMOTE_PATH" "$DEST/" \
	--backup-dir "$HISTORY/$stamp" \
	--transfers 8 --checkers 16 --fast-list --tpslimit 10 \
	--stats-one-line --stats 5m \
	2>&1)"
rc=$?
if [ $rc -ne 0 ]; then
	log "FAIL rclone sync exited $rc"
	printf '%s\n' "$out" | tail -20
	exit 6
fi

# 4. An empty history dir just means nothing was deleted or overwritten.
[ -d "$HISTORY/$stamp" ] && [ -z "$(ls -A "$HISTORY/$stamp" 2>/dev/null)" ] && rmdir "$HISTORY/$stamp" 2>/dev/null

# 5. Bound the history.
pruned=0
while IFS= read -r -d '' old; do
	rm -rf "$old" && pruned=$((pruned + 1))
done < <(find "$HISTORY" -mindepth 1 -maxdepth 1 -type d -mtime "+$RETAIN_DAYS" -print0 2>/dev/null)

local_count="$(find "$DEST" -type f 2>/dev/null | wc -l)"
local_size="$(du -sh "$DEST" 2>/dev/null | cut -f1)"
log "OK    drive=$remote_count local=$local_count ($local_size), history snapshots=$(find "$HISTORY" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l) pruned=$pruned"

# 6. Count drift is worth knowing about but is not a failure: rclone exports
#    Google-native docs, and macOS clients sprinkle .DS_Store, so small
#    differences are normal. A large gap is not.
if [ "$local_count" -lt "$((remote_count - 10))" ]; then
	log "WARN local copy is $((remote_count - local_count)) files short of Drive — check the log"
fi
