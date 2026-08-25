# Retired — automated host status reporter

**Removed from the OptiPlex 2026-08-17 (owner decision).** Nothing in here runs. It is
kept because it never lived in a repo while it *was* running: these files existed only
on the OptiPlex's disk, so removing the service would otherwise have destroyed the only
copy. Archived byte-for-byte from `/usr/local/bin` and `/etc/systemd/system` at removal
time.

## What it did

A 5-minute systemd timer collected host, LinuxCNC, HAL, and Mesa state and committed a
snapshot. A daily timer rolled snapshots older than 14 days into compressed archives.

Snapshots went to a **separate repository**, `agant172/mazak-vqc20-status`, checked out
at `~/mazak-vqc20-status` on the OptiPlex (~58 MB by retirement). That repo and clone
were **not** deleted with the service — the snapshot history is still there.

This is worth stating plainly because the retrofit repo's own docs said otherwise:
`CLAUDE.md` claimed the OptiPlex pushed `status/host_status.{md,json}` to `main` here
every five minutes. It never did. `status/` in this repo only ever held a README
describing output that never arrived, and the checked-in `collect_status.sh` +
`mazak-host-status.*` units were an earlier generation that was superseded on disk and
never re-synced. Both have been removed along with the service.

## Files

| File | Was installed at |
|---|---|
| `mazak-status.sh` | `/usr/local/bin/mazak-status.sh` |
| `mazak-status.service` / `.timer` | `/etc/systemd/system/` — every 5 min on the `:00/:05/:10` grid |
| `mazak-retention` | `/usr/local/bin/mazak-retention` |
| `mazak-retention.service` / `.timer` | `/etc/systemd/system/` — daily 03:17 |
| `mazak-watchdog` | `/usr/local/bin/mazak-watchdog` — runtime on/off switch for Mesa ping probing |

## Known defect, if you ever revive this

`mazak-status.service` line 22 has an **unquoted `Environment=GIT_SSH_COMMAND=…`**.
systemd splits an unquoted value on whitespace and discards the fragments —
`systemd-analyze verify` reports `Invalid environment assignment, ignoring: -i` and
friends — so the setting silently collapsed to bare `ssh`. The dedicated deploy key at
`~/.ssh/mazak_status_deploy` was therefore **never actually used**; pushes worked only
because they fell back to the default identity `~/.ssh/id_ed25519`, which also has
access. Quote the whole value before trusting that key.

The same bug was found and fixed in `../mazak-repo-pull.service`.

## Restoring it

```bash
sudo install -m 0755 mazak-status.sh mazak-retention mazak-watchdog /usr/local/bin/
sudo install -m 0644 mazak-status.{service,timer} mazak-retention.{service,timer} \
     /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now mazak-status.timer mazak-retention.timer
```

The scripts expect `STATUS_REPO_DIR=/home/andy/mazak-vqc20-status` to be a working
clone with a push-capable remote. Fix the quoting defect above first.
