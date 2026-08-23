# OptiPlex host scripts

Systemd timers that run on the LinuxCNC control PC (Dell OptiPlex 7050, Debian 13,
PREEMPT-RT). Two timers live here today, both driven by the same script: the
**working-copy pull timer**, which fast-forwards this repo's checkout on the host
from `origin`, and a second unit that does the same for the personal Obsidian vault
(see [Second consumer](#second-consumer-the-obsidian-vault) below).

The directory is named `host_status` for the status reporter that used to live here.
That reporter was **removed from the OptiPlex on 2026-08-17** (owner decision); its
scripts and units are archived, unrunning, in [`retired/`](retired/) along with why it
went and how to bring it back. Nothing in this repo writes `status/` any more, and that
directory has been removed.

---

# Working-Copy Pull Timer

Keeps `~/mazak-vqc20-linuxcnc-retrofit` on the OptiPlex current with `origin`, so a
session that starts at the machine is less likely to act on facts that have already
been superseded from a desk session. Installed 2026-08-17.

It is **not** a substitute for `git pull` at the start of a session — it declines to
act in exactly the cases where a human should look (see below), so a stale checkout is
still possible. Treat it as a floor, not a guarantee.

## What it does

Every 15 minutes it fetches, then fast-forwards the **currently checked-out branch** —
whatever that is, not just `main` — and only when doing so cannot lose or reorder work.
It **skips**, never forces, when:

| Condition | Logged as |
|---|---|
| Working tree or index dirty (untracked files ignored) | `SKIP fetched; working tree dirty` |
| Merge, rebase, or bisect in progress | `SKIP fetched; merge/rebase/bisect in progress` |
| HEAD detached | `SKIP fetched; HEAD is detached` |
| Branch has no upstream (e.g. a local topic branch not yet pushed) | `SKIP fetched; … has no upstream` |
| Branch has diverged — not a fast-forward | `SKIP fetched; … has diverged … resolve by hand` |

Everything it skips is left for a human to resolve with a real `git pull`. The fetch
still happens in every one of those cases, so `origin/*` refs and VS Code's "↓ N"
indicator stay honest even when the branch itself can't move.

There is no push side and no commit side: this timer only ever fast-forwards.

## Files

| File | Purpose |
|---|---|
| `repo_pull.sh` | The logic. Fetch, then fast-forward if provably safe. |
| `mazak-repo-pull.service` | One-shot systemd service; runs as `andy`. |
| `mazak-repo-pull.timer` | `*:07/15` → :07 :22 :37 :52, plus 3 min after boot. |
| `install_repo_pull.sh` | Root installer — copies script + units, enables the timer. |

The `:07` offset was chosen to stay off the retired status collector's `:00/:05/:10`
grid; with that collector gone it no longer avoids anything, and is kept only because
changing it would buy nothing.

**The service runs `/usr/local/bin/mazak-repo-pull.sh`, a copy** rather than execing
straight out of the working copy, as the retired collector's units did. This script
fast-forwards the very working copy it would otherwise be read from, and bash reads a
script incrementally: a merge that rewrote the file mid-run would resume at a stale
byte offset. **Edit `repo_pull.sh` here, then re-run the installer to deploy it.**

## Install

```bash
cd ~/mazak-vqc20-linuxcnc-retrofit
sudo bash scripts/host_status/install_repo_pull.sh
```

Overrides (optional):

```bash
sudo MAZAK_USER=andy \
     MAZAK_REPO_DIR=/home/andy/mazak-vqc20-linuxcnc-retrofit \
     MAZAK_SSH_KEY=/home/andy/.ssh/id_ed25519 \
     bash scripts/host_status/install_repo_pull.sh
```

## Fetch authentication

The repo is private (owner decision 2026-08-16), so the fetch needs a key — and a
timer-launched shell has **no ssh-agent**. The unit therefore names the key explicitly
via `GIT_SSH_COMMAND`, with `IdentitiesOnly=yes` and `BatchMode=yes` so a failure is a
clean error instead of a hung prompt. The key must be **passphrase-free**; the
installer refuses to proceed otherwise rather than leaving you a timer that fails every
15 minutes with `Permission denied`.

## Verify

```bash
systemctl list-timers mazak-repo-pull.timer
journalctl -u mazak-repo-pull -n 20 --no-pager     # one line per run
```

A healthy log is one line per run, e.g.:

```
OK    up to date (branch=main upstream=origin/main)
OK    fast-forwarded main 7e9508e -> df3258d (origin/main)
SKIP  fetched; branch=docs/7i49hv-correction has no upstream
```

## Turn it off

```bash
sudo systemctl disable --now mazak-repo-pull.timer
```


## Second consumer: the Obsidian vault

Installed 2026-08-22. `repo_pull.sh` takes its target from `REPO_DIR`, so a second
pair of units reuses the **same installed copy** at `/usr/local/bin/mazak-repo-pull.sh`
to keep a clone of the personal Obsidian vault current on this host:

| File | Value |
|---|---|
| Units | `/etc/systemd/system/obsidian-vault-pull.{service,timer}` (not in this repo — they are not retrofit artifacts) |
| Working copy | `/home/andy/Projects/obsidian-vault` (same path as both Macs) |
| Remote | `git@github.com:agant172/obsidian-vault.git`, private, **Git LFS** |
| Schedule | `*:12/15` → :12 :27 :42 :57, offset 5 min off this repo's `:07/15` grid |
| Timeout | 600 s, not 120 s — the vault carries ~380 MB of LFS objects, two of them ~123 MB |

Why it is written down here: editing `repo_pull.sh` or re-running `install_repo_pull.sh`
now affects **two** services, not one. The installer refreshes the shared copy, which is
what both `ExecStart=` lines point at.

Two extra `Environment=` lines that this repo's unit does not need:

- `PATH=/home/andy/.local/bin:…` — `git-lfs` is a userspace install on this host. The
  global `filter.lfs.*` config names it by absolute path so checkout works regardless,
  but `git-lfs` shells out to `git`, so the PATH is set anyway.
- The same explicit-key `GIT_SSH_COMMAND` — `git-lfs` honours it too, which it needs for
  `git-lfs-authenticate` over SSH.

**Divergence risk to know about:** the vault has the Obsidian Git plugin's auto-commit
enabled on at least one other machine (`omarchy`), so commits arrive there without a
human pushing. This host only ever fast-forwards and skips on a dirty tree, so it cannot
lose that work — but do not start hand-editing the vault on the OptiPlex, or the timer
will silently stop advancing it. The prohibition on auto-commit **in this repo**
(`CLAUDE.md`, Obsidian section) is unchanged and unaffected.
