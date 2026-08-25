#!/usr/bin/env bash
# Keep the Mazak retrofit working copy current with origin.
#
# Deliberately conservative: it fetches always, but only advances the checked-out
# branch when doing so cannot lose or reorder work. It will SKIP (not force) when
#   - the working tree or index is dirty
#   - a merge/rebase/bisect is in progress
#   - the current branch has no upstream
#   - the upstream is not a fast-forward of the current branch
# Anything it skips is left for a human to resolve with a real `git pull`.
#
# Source of truth:  scripts/host_status/repo_pull.sh (this repo)
# Installed to:     /usr/local/bin/mazak-repo-pull.sh by install_repo_pull.sh
#                   — a copy on purpose; see the comment on ExecStart in
#                   mazak-repo-pull.service. Edit here, then re-run the installer.
# Log:              journalctl -u mazak-repo-pull

set -uo pipefail

REPO_DIR="${REPO_DIR:-/home/andy/mazak-vqc20-linuxcnc-retrofit}"

log() { echo "$(date -Is) $*"; }

cd "$REPO_DIR" || { log "FAIL cannot cd to $REPO_DIR"; exit 3; }

if ! git rev-parse --git-dir >/dev/null 2>&1; then
	log "FAIL $REPO_DIR is not a git repository"
	exit 3
fi

branch="$(git symbolic-ref --quiet --short HEAD 2>/dev/null || echo DETACHED)"

if ! timeout 60 git fetch --prune --quiet origin; then
	log "FAIL fetch from origin (branch=$branch) — network, key, or lock"
	exit 4
fi

git_dir="$(git rev-parse --git-dir)"
if [ -d "$git_dir/rebase-merge" ] || [ -d "$git_dir/rebase-apply" ] ||
	[ -f "$git_dir/MERGE_HEAD" ] || [ -f "$git_dir/BISECT_LOG" ]; then
	log "SKIP fetched; merge/rebase/bisect in progress (branch=$branch)"
	exit 0
fi

if [ "$branch" = DETACHED ]; then
	log "SKIP fetched; HEAD is detached"
	exit 0
fi

if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
	log "SKIP fetched; working tree dirty (branch=$branch)"
	exit 0
fi

if ! upstream="$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null)"; then
	log "SKIP fetched; branch=$branch has no upstream"
	exit 0
fi

local_sha="$(git rev-parse HEAD)"
remote_sha="$(git rev-parse '@{u}')"

if [ "$local_sha" = "$remote_sha" ]; then
	log "OK    up to date (branch=$branch upstream=$upstream)"
	exit 0
fi

if ! git merge-base --is-ancestor HEAD '@{u}'; then
	log "SKIP fetched; $branch has diverged from $upstream — resolve by hand"
	exit 0
fi

if git merge --ff-only --quiet '@{u}'; then
	log "OK    fast-forwarded $branch ${local_sha:0:7} -> ${remote_sha:0:7} ($upstream)"
else
	log "FAIL fast-forward of $branch to $upstream refused"
	exit 5
fi
