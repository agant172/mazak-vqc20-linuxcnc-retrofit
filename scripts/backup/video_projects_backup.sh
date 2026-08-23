#!/usr/bin/env bash
# video_projects_backup.sh — snapshot the video EDIT DECISIONS off the USB Video Drive.
#
# WHAT AND WHY
#   The USB Video Drive holds ~603 GB, of which ~463 GB is irreplaceable footage
#   with exactly one copy. That is a second-drive problem, not a
#   back-it-up-over-the-network problem, and a second drive is on order.
#
#   This job takes the ~15 MB that is worth far more than its size: the Premiere
#   project files, the auto-save history, and the Projects tree. Those are every
#   cut, sequence and edit decision Andy has made -- work measured in evenings,
#   not gigabytes. Footage can at worst be re-shot or lived without; a lost
#   .prproj means redoing the edit by hand from scratch.
#
#   `Shop & Property` (11 MB of roof video) rides along because it is small,
#   real footage, and would otherwise be in the 463 GB single-copy pile.
#   Skipped deliberately: `Videos/` is an empty macOS TV Library scaffold and
#   `Captures/` holds one stray desktop.ini.
#
# WHY tar-over-ssh RATHER THAN rsync
#   The MacBook ships openrsync, not GNU rsync (same reason as the iMac job).
#   At ~15 MB a dated, checksum-verified tarball is simpler, gives real
#   point-in-time snapshots of edit history, and cannot trip over filter-rule
#   incompatibilities.
#
# Source of truth:  scripts/backup/video_projects_backup.sh (this repo)
# Installed to:     /usr/local/bin/mazak-video-projects-backup.sh
# Log:              journalctl -u mazak-video-projects-backup

set -uo pipefail

REMOTE="${REMOTE:-andygant@andys-macbook-pro-16}"
VOLUME="${VOLUME:-/Volumes/USB Video Drive}"
DEST_MOUNT="${DEST_MOUNT:-/mnt/media}"
DEST="${DEST:-$DEST_MOUNT/video-projects}"
KEEP="${KEEP:-60}"
MIN_FILES="${MIN_FILES:-20}"
SSH_OPTS=(-o BatchMode=yes -o ConnectTimeout=15 -o ServerAliveInterval=10 -o ServerAliveCountMax=6)

log() { echo "$(date -Is) $*"; }
stamp="$(date +%Y-%m-%d)"
name="video-projects-$stamp.tar.gz"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

if ! mountpoint -q "$DEST_MOUNT"; then
	log "FAIL $DEST_MOUNT is not mounted — refusing to write onto the root disk"
	exit 4
fi
if ! ssh "${SSH_OPTS[@]}" "$REMOTE" true 2>/dev/null; then
	log "FAIL cannot ssh to $REMOTE (key auth, LAN, or the Mac is asleep)"
	exit 5
fi

# The drive is normally always attached to the CalDigit dock. If it is not, the
# file list would come back empty and we would happily snapshot nothing, then
# prune a good snapshot to make room for it. Refuse instead.
if ! ssh "${SSH_OPTS[@]}" "$REMOTE" "test -d '$VOLUME'" 2>/dev/null; then
	log "FAIL '$VOLUME' is not mounted on $REMOTE — drive unplugged or dock down"
	exit 6
fi

# Build the file list ON the Mac. -print0 throughout: these paths contain
# spaces, ampersands and unicode, and a newline-delimited list would corrupt.
list="$tmp/list"
ssh "${SSH_OPTS[@]}" "$REMOTE" "cd '$VOLUME' && {
	find . -maxdepth 1 -type f \\( -name '*.prproj' -o -name '*.prin' -o -name '*.fcpxml' \\) -print0
	find ./Projects -type f -print0 2>/dev/null
	find './Adobe Premiere Pro Auto-Save' -type f -print0 2>/dev/null
	find './Shop & Property' -type f -not -name '.DS_Store' -print0 2>/dev/null
	}" > "$list" 2>/dev/null

n="$(tr -cd '\0' < "$list" | wc -c)"
if [ "$n" -lt "$MIN_FILES" ]; then
	log "SKIP found only $n project files, below MIN_FILES=$MIN_FILES — refusing to snapshot what looks like a failed listing"
	exit 0
fi

# Stream a tarball built from that list.
if ! ssh "${SSH_OPTS[@]}" "$REMOTE" "cd '$VOLUME' && tar -czf - --null -T -" \
	< "$list" > "$tmp/$name" 2>"$tmp/tar.err"; then
	log "FAIL tar over ssh: $(head -3 "$tmp/tar.err")"
	exit 7
fi
size="$(stat -c %s "$tmp/$name")"
if [ "$size" -lt 10000 ]; then
	log "FAIL tarball is only $size bytes — refusing to keep it"
	exit 8
fi

mkdir -p "$DEST"
sha="$(sha256sum "$tmp/$name" | awk '{print $1}')"
mv "$tmp/$name" "$DEST/$name"
echo "$sha  $name" > "$DEST/$name.sha256"

# Verify what actually landed, not what we think we wrote.
if ! (cd "$DEST" && sha256sum -c "$name.sha256" >/dev/null 2>&1); then
	log "FAIL checksum verification failed for $name — removing"
	rm -f "$DEST/$name" "$DEST/$name.sha256"
	exit 9
fi
# And prove the archive is actually readable, not just intact bytes.
if ! tar -tzf "$DEST/$name" >/dev/null 2>&1; then
	log "FAIL $name is not a readable tar archive — removing"
	rm -f "$DEST/$name" "$DEST/$name.sha256"
	exit 10
fi

pruned=0
while IFS= read -r old; do
	rm -f "$DEST/$old" "$DEST/$old.sha256" && pruned=$((pruned + 1))
done < <(cd "$DEST" && ls -1t video-projects-*.tar.gz 2>/dev/null | tail -n +$((KEEP + 1)))

kept="$(ls -1 "$DEST"/video-projects-*.tar.gz 2>/dev/null | wc -l)"
log "OK    $name $(numfmt --to=iec "$size") from $n files, sha256 verified, archive readable, snapshots=$kept pruned=$pruned"
