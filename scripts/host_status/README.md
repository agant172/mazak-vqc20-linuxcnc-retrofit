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
