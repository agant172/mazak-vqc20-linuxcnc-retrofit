#!/usr/bin/env bash
# gcode_backup_remote.sh — daily offsite copy of ~/linuxcnc to the iMac.
#
# The SECOND tier. /mnt/media (see gcode_backup.sh) survives the root disk
# dying; it does not survive theft, fire, or a power event that takes both
# drives in this chassis. This does.
#
# WHY A TARBALL, NOT rsync
#   The iMac ships openrsync ("rsync version 2.6.9 compatible"), not GNU rsync.
#   --backup-dir and several other flags this project would want are unreliable
#   there. ~/linuxcnc is ~23 MB, so a dated compressed tarball is cheap and buys
#   something a mirror cannot: real point-in-time snapshots. A mirror of a
#   mistake is still a mistake.
#
# WHY DAILY, NOT HOURLY
#   The tailnet path measured 1.57 MB/s (relayed, 2026-08-23). Fine for ~10 MB
#   compressed; not something to do 24x a day. The hourly local mirror is the
#   fine-grained tier. This one is the "the shop burned down" tier.
#
# INTEGRITY
#   Every transfer is verified by comparing SHA-256 computed on both ends. An
#   unverified backup is a rumour -- silent truncation is exactly the failure a
#   backup is supposed to not have.
#
# Source of truth:  scripts/backup/gcode_backup_remote.sh (this repo)
# Installed to:     /usr/local/bin/mazak-gcode-backup-remote.sh
# Log:              journalctl -u mazak-gcode-backup-remote

set -uo pipefail

SRC="${SRC:-/home/andy/linuxcnc}"
REMOTE="${REMOTE:-andygant@andys-imac}"
REMOTE_DIR="${REMOTE_DIR:-Backups/mazak-linuxcnc}"
KEEP="${KEEP:-30}"
MIN_FILES="${MIN_FILES:-50}"
SSH_OPTS=(-o BatchMode=yes -o ConnectTimeout=15 -o ServerAliveInterval=10 -o ServerAliveCountMax=6)

log() { echo "$(date -Is) $*"; }

stamp="$(date +%Y-%m-%d)"
name="linuxcnc-$stamp.tar.gz"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

# 1. Source sanity, same guards as the local job.
[ -d "$SRC" ] || { log "FAIL source $SRC does not exist"; exit 3; }
n_files="$(find "$SRC" -type f 2>/dev/null | wc -l)"
if [ "$n_files" -lt "$MIN_FILES" ]; then
	log "SKIP source has $n_files files, below MIN_FILES=$MIN_FILES"
	exit 0
fi

# 2. Preflight the hop. BatchMode means this fails fast instead of hanging on a
#    password prompt no timer can answer.
if ! ssh "${SSH_OPTS[@]}" "$REMOTE" true 2>/dev/null; then
	log "FAIL cannot ssh to $REMOTE (key auth, tailnet, or the Mac is asleep)"
	exit 4
fi

# 3. Build and checksum locally.
if ! tar -czf "$tmp/$name" -C "$(dirname "$SRC")" "$(basename "$SRC")" 2>"$tmp/tar.err"; then
	log "FAIL tar: $(head -3 "$tmp/tar.err")"
	exit 5
fi
size="$(stat -c %s "$tmp/$name")"
local_sha="$(sha256sum "$tmp/$name" | awk '{print $1}')"

# 4. Ship it.
ssh "${SSH_OPTS[@]}" "$REMOTE" "mkdir -p '$REMOTE_DIR'" || { log "FAIL cannot create $REMOTE_DIR"; exit 6; }
if ! scp "${SSH_OPTS[@]}" -q "$tmp/$name" "$REMOTE:$REMOTE_DIR/$name"; then
	log "FAIL transfer of $name"
	exit 7
fi

# 5. Verify on the far end. macOS has shasum, not sha256sum.
remote_sha="$(ssh "${SSH_OPTS[@]}" "$REMOTE" "shasum -a 256 '$REMOTE_DIR/$name' 2>/dev/null | awk '{print \$1}'")"
if [ "$remote_sha" != "$local_sha" ]; then
	log "FAIL checksum mismatch for $name (local=$local_sha remote=${remote_sha:-none}) — removing bad copy"
	ssh "${SSH_OPTS[@]}" "$REMOTE" "rm -f '$REMOTE_DIR/$name'" || true
	exit 8
fi

# 6. Prune, keeping the newest $KEEP.
pruned="$(ssh "${SSH_OPTS[@]}" "$REMOTE" \
	"cd '$REMOTE_DIR' 2>/dev/null && ls -1t linuxcnc-*.tar.gz 2>/dev/null | tail -n +$((KEEP+1)) | tee /dev/stderr | xargs -r rm -f" 2>&1 >/dev/null | wc -l)"

kept="$(ssh "${SSH_OPTS[@]}" "$REMOTE" "ls -1 '$REMOTE_DIR'/linuxcnc-*.tar.gz 2>/dev/null | wc -l" | tr -d ' ')"

log "OK    $name $(numfmt --to=iec "$size") verified sha256 on $REMOTE, snapshots kept=$kept pruned=$pruned"
