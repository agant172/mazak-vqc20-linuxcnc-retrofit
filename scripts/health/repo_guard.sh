#!/usr/bin/env bash
# repo_guard.sh — catch work that exists locally but never reached origin.
#
# WHY: on 2026-08-23 a commit made on main in this working copy was orphaned
# before it was ever pushed. Cause was not a force-push or a merge strategy --
# it was a SECOND SESSION working in the SAME clone concurrently, doing
# checkouts and a rebase while this one committed to main. Git's HEAD, index and
# branch refs are single-threaded state; two sessions in one working copy will
# clobber each other, and the reflog shows one interleaved history.
#
# The failure was invisible: the installed systemd units kept running from
# /usr/local/bin, so the job worked fine while its source had vanished from the
# repo. Only an unrelated bug hunt turned it up.
#
# This checks the opposite of what `git status` checks. A clean tree says
# nothing about whether your commits survived.
#
#   1. Is the local branch ahead of origin?  -> unpushed work
#   2. Has the branch diverged?              -> a rewrite happened under us
#   3. Is another git process live here?     -> concurrent session, the root cause
#
# Read-only: it fetches, and never modifies a ref.
#
# Source of truth:  scripts/health/repo_guard.sh (this repo)
# Installed to:     /usr/local/bin/mazak-repo-guard.sh
# Log:              journalctl -u mazak-repo-guard

set -uo pipefail

REPO="${REPO_DIR:-/home/andy/mazak-vqc20-linuxcnc-retrofit}"
NOTIFY="${MAZAK_NOTIFY:-/usr/local/bin/mazak-notify.sh}"
# Under the invoking user's cache, not /var/lib: this runs as andy (it needs
# the ssh key to fetch) and /var/lib/mazak-health is root-owned.
STATE="${XDG_CACHE_HOME:-$HOME/.cache}/mazak-repo-guard-seen"
DEDUP_HOURS="${DEDUP_HOURS:-12}"

log() { echo "$(date -Is) $*"; }
cd "$REPO" || { log "FAIL cannot cd to $REPO"; exit 3; }

problems=()

# A live index.lock, or a rebase/merge in progress, means another session is
# mid-operation in this clone right now. That is the condition that caused the
# original loss.
gd="$(git rev-parse --git-dir)"
if [ -f "$gd/index.lock" ]; then
	problems+=("another git process holds index.lock — a second session is operating in this clone")
fi
for d in rebase-merge rebase-apply; do
	[ -d "$gd/$d" ] && problems+=("a rebase is in progress ($d) — another session left this clone mid-operation")
done

if ! timeout 60 git fetch --quiet origin 2>/dev/null; then
	log "WARN fetch failed; cannot verify against origin"
	exit 0
fi

branch="$(git symbolic-ref --quiet --short HEAD 2>/dev/null || echo DETACHED)"
if [ "$branch" = DETACHED ]; then
	problems+=("HEAD is detached — commits made here belong to no branch and will be lost")
elif upstream="$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null)"; then
	ahead="$(git rev-list --count "$upstream".."$branch")"
	behind="$(git rev-list --count "$branch".."$upstream")"
	if [ "$ahead" -gt 0 ] && [ "$behind" -gt 0 ]; then
		problems+=("$branch has DIVERGED from $upstream ($ahead local / $behind remote) — history was rewritten")
	elif [ "$ahead" -gt 0 ]; then
		oldest="$(git log --format='%cr' "$upstream".."$branch" | tail -1)"
		problems+=("$ahead commit(s) on $branch never pushed, oldest $oldest")
	fi
fi

# Dangling commits are the fingerprint of the loss this exists to catch, but
# most are benign: an amend or rebase leaves the pre-rewrite commit dangling,
# stashes are dangling by design, and Obsidian autosaves churn. Reporting all of
# them means the alert is ignored, which is worse than not checking.
#
# So every orphan must be reviewed ONCE and either recovered or written into
# orphans_acknowledged.txt with a reason. Anything not on that list is new, and
# new is the only thing worth waking someone for.
ACK="$REPO/scripts/health/orphans_acknowledged.txt"
orphans="$(git fsck --no-progress --lost-found 2>/dev/null | awk '/dangling commit/ {print $3}' \
	| while read -r sha; do
		age=$(( ($(date +%s) - $(git log -1 --format=%ct "$sha" 2>/dev/null || echo 0)) / 86400 ))
		[ "$age" -le 7 ] || continue
		git merge-base --is-ancestor "$sha" HEAD 2>/dev/null && continue
		grep -q "^${sha:0:7}" "$ACK" 2>/dev/null && continue
		subj="$(git log -1 --format=%s "$sha")"
		case "$subj" in "WIP on "*|"index on "*|"autosave from "*) continue;; esac
		printf '%s %s\n' "${sha:0:7}" "$(printf '%s' "$subj" | cut -c1-52)"
	done | head -5)"
if [ -n "$orphans" ]; then
	problems+=("UNREVIEWED orphaned commit(s) from the last 7 days:
$orphans

Recover with:  git show <sha>   /   git cherry-pick -n <sha>
Or record why it is safe in scripts/health/orphans_acknowledged.txt")
fi

if [ ${#problems[@]} -eq 0 ]; then
	log "OK    $branch in sync with origin, no orphans, no concurrent git process"
	rm -f "$STATE"
	exit 0
fi

body="$(printf '%s\n\n' "${problems[@]}")"
log "PROBLEM $(printf '%s | ' "${problems[@]}")"

now=$(date +%s)
last=$(cat "$STATE" 2>/dev/null || echo 0)
if [ $(( now - last )) -ge $(( DEDUP_HOURS * 3600 )) ] && [ -x "$NOTIFY" ]; then
	mkdir -p "$(dirname "$STATE")"; echo "$now" > "$STATE"
	"$NOTIFY" "Repo needs attention on $(hostname -s)" \
		"$REPO

$body
Check:
  cd $REPO && git status && git log --oneline -5
  git fsck --lost-found" "high" || true
	log "notified"
fi
exit 0
