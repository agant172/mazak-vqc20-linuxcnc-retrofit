> This directory holds **two** independent OptiPlex timers. The **host status
> reporter** (below) pushes machine state *out* to a repo. The **working-copy pull
> timer** ([jump](#working-copy-pull-timer)) fast-forwards this working copy *in*
> from origin. They share nothing but a home and an install pattern.

# LinuxCNC Host Status Reporter

Automated status upload from the LinuxCNC control PC (Dell OptiPlex 7050, Debian 13,
PREEMPT-RT) into this repo. A systemd timer runs `collect_status.sh` every 5 minutes;
the script writes `status/host_status.md` and `status/host_status.json` and pushes
them to `main` when values change.

## What it reports

- **Host** — hostname, OS, kernel, uptime, load, memory, disk.
- **LinuxCNC** — running state, PIDs, version, latest latency note from the journal.
- **HAL snapshot** — read-only sample of a small signal list (estop, machine-on,
  spindle-on, X/Y/Z position feedback). Only sampled while LinuxCNC is up.
- **Mesa** — configured IP (192.168.1.121 by default), ping reachability, and a short
  `mesaflash --readhmid` block when LinuxCNC is *not* running (so the two never race
  for the board).
- **Repo** — current HEAD short-sha, HEAD message, uncommitted file count.

The collector is **strictly read-only** toward LinuxCNC. It never writes HAL pins,
never launches `latency-test`, and never issues motion.

## Files

| File | Purpose |
|---|---|
| `collect_status.sh` | Gathers data and commits `status/host_status.{md,json}`. |
| `mazak-host-status.service` | One-shot systemd service that runs the collector. |
| `mazak-host-status.timer` | Fires the service 2 min after boot, then every 5 min. |
| `install.sh` | Root installer — copies units, sets user, enables the timer. |

## Install on the LinuxCNC host

```bash
cd ~/mazak-vqc20-linuxcnc-retrofit
git pull
sudo bash scripts/host_status/install.sh
```

Overrides (optional):

```bash
sudo MAZAK_USER=andy \
     MAZAK_MESA_IP=192.168.1.121 \
     MAZAK_REPO_DIR=/home/andy/mazak-vqc20-linuxcnc-retrofit \
     bash scripts/host_status/install.sh
```

The installer:

1. Installs `git`, `jq`, `python3`, `iputils-ping` if missing.
2. Renders the systemd unit with the correct user + repo path.
3. Sets a fallback git identity (`LinuxCNC Host <linuxcnc-host@localhost>`).
4. Enables + starts `mazak-host-status.timer` and kicks off the first run.

## Verify

```bash
systemctl list-timers mazak-host-status.timer
journalctl -u mazak-host-status.service -n 50 --no-pager
cat status/host_status.md
```

Then check the repo on github.com — you should see a `status: automated host status …`
commit within about seven minutes of first boot after install.

## Push authentication

The reporter runs as the `andy` user and pushes over whatever remote the working copy
already uses. The two common options:

- **SSH remote** — recommended. Ensure `~andy/.ssh/id_ed25519` is loaded and
  `git remote -v` shows `git@github.com:agant172/mazak-vqc20-linuxcnc-retrofit.git`.
- **HTTPS with `gh auth`** — run `gh auth login` once as `andy`; the `gh`
  credential helper will supply the token to git.

If pushes fail, the local commit still lands and will push on the next successful run.

## Turn it off

```bash
sudo systemctl disable --now mazak-host-status.timer
```

## Tune what's reported

Edit `HAL_SIGNALS` at the top of `collect_status.sh` to sample a different set of HAL
signals as bring-up progresses. Anything `halcmd -s show sig <name>` can read is fair
game, and unknown signals will be reported as `unavailable` rather than erroring.

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

The `:07` offset keeps it off the status collector's `:00/:05/:10` grid so the two
never contend for the network in the same instant.

**The service runs `/usr/local/bin/mazak-repo-pull.sh`, a copy** — unlike
`mazak-host-status.service`, which execs straight out of the working copy. This script
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
