#!/usr/bin/env bash
# gcode_backup.sh — Mirror the LinuxCNC working directory to the media SSD.
#
# WHAT IT PROTECTS
#   ~/linuxcnc — the G-code in nc_files/ plus the machine state that makes that
#   G-code mean anything: tool tables, .var files, and the configs LinuxCNC
#   actually loads. Roughly 23 MB / 1000 files as of 2026-08-23. Small enough
#   that copying all of it costs nothing, and the one thing on this box that is
#   NOT reproducible from git — everything else here can be re-cloned.
#
# WHAT IT IS
#   A mirror, not an archive, with one safety net: anything the mirror would
#   delete or overwrite is moved into history/<timestamp>/ first. So a bad edit
#   or an accidental rm stays recoverable for RETAIN_DAYS. A plain --delete
#   mirror would faithfully replicate your mistake within the hour; this does
#   not.
#
# WHEN IT REFUSES TO RUN
#   It exits non-zero rather than producing a worthless backup when:
#     - DEST_MOUNT is not actually a mount point. THIS IS THE IMPORTANT ONE.
#       If the media SSD is unplugged, failed, or simply not mounted yet, the
#       /mnt/media directory still exists as an empty dir ON THE ROOT DISK, and
#       rsync would cheerfully fill it — giving you a "backup" living on the
#       very drive it exists to survive, and a df that looks fine.
#     - the source directory is missing.
#     - the source holds fewer than MIN_FILES files, which guards against
#       mirroring a catastrophic deletion over the last good copy.
#
# Source of truth:  scripts/backup/gcode_backup.sh (this repo)
# Installed to:     /usr/local/bin/mazak-gcode-backup.sh by install_gcode_backup.sh
#                   — a copy on purpose, so a mid-run `git pull` that rewrites
#                   this file cannot make bash resume at a stale byte offset.
#                   Edit here, then re-run the installer.
# Log:              journalctl -u mazak-gcode-backup

set -uo pipefail

SRC="${SRC:-/home/andy/linuxcnc}"
DEST_MOUNT="${DEST_MOUNT:-/mnt/media}"
DEST_ROOT="${DEST_ROOT:-$DEST_MOUNT/linuxcnc-backup}"
MIN_FILES="${MIN_FILES:-50}"
RETAIN_DAYS="${RETAIN_DAYS:-365}"

log() { echo "$(date -Is) $*"; }

stamp="$(date +%Y-%m-%dT%H%M%S)"
current="$DEST_ROOT/current"
history="$DEST_ROOT/history/$stamp"

# 1. The guard that matters. mountpoint(1) asks the kernel, so it is true even
#    if the directory is populated with junk from an earlier mistake.
if ! mountpoint -q "$DEST_MOUNT"; then
	log "FAIL $DEST_MOUNT is not mounted — refusing to write a backup onto the root disk"
	exit 4
fi

# 2. Source must exist and look intact.
if [ ! -d "$SRC" ]; then
	log "FAIL source $SRC does not exist"
	exit 3
fi

n_files="$(find "$SRC" -type f 2>/dev/null | wc -l)"
if [ "$n_files" -lt "$MIN_FILES" ]; then
	log "SKIP source $SRC has $n_files files, below MIN_FILES=$MIN_FILES — not mirroring a possible mass deletion"
	exit 0
fi

mkdir -p "$current" "$DEST_ROOT/history" || { log "FAIL cannot create $DEST_ROOT"; exit 5; }

# 3. Mirror. --backup-dir catches everything --delete would otherwise destroy.
#    No -z: this is a local SATA copy, compression would only burn CPU on a
#    box whose spare cycles belong to the realtime threads.
out="$(rsync -a --delete \
	--backup --backup-dir="$history" \
	--human-readable --stats \
	"$SRC/" "$current/" 2>&1)"
rc=$?

if [ $rc -ne 0 ]; then
	log "FAIL rsync exited $rc"
	printf '%s\n' "$out"
	exit 6
fi

xferred="$(printf '%s\n' "$out" | awk '/Number of regular files transferred:/ {print $NF}')"
size="$(printf '%s\n' "$out" | awk '/Total transferred file size:/ {print $(NF-1), $NF}')"

# 4. An empty history dir just means nothing was deleted or overwritten.
if [ -d "$history" ] && [ -z "$(ls -A "$history" 2>/dev/null)" ]; then
	rmdir "$history" 2>/dev/null
fi

# 5. Bound the history. Tiny at this size, but unbounded growth is how a backup
#    volume quietly fills and starts failing.
pruned=0
if [ -d "$DEST_ROOT/history" ]; then
	while IFS= read -r -d '' old; do
		rm -rf "$old" && pruned=$((pruned + 1))
	done < <(find "$DEST_ROOT/history" -mindepth 1 -maxdepth 1 -type d -mtime "+$RETAIN_DAYS" -print0 2>/dev/null)
fi

kept="$(find "$DEST_ROOT/history" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l)"
log "OK    $n_files files in source, ${xferred:-0} transferred (${size:-0 bytes}), history snapshots=$kept pruned=$pruned"
