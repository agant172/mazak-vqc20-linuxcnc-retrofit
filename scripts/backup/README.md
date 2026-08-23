# LinuxCNC backup timer

Hourly mirror of the LinuxCNC working directory onto the second SSD, so the one
thing on this box that is **not** reproducible from git survives losing the root
disk.

## What is protected, and why this set

| | |
|---|---|
| Source | `/home/andy/linuxcnc` (~23 MB, ~1050 files) |
| Destination | `/mnt/media/linuxcnc-backup/` on `/dev/sdb1` |
| Schedule | hourly at `:40`, plus 5 min after boot |

The G-code in `nc_files/` is the headline, but it is backed up together with
`configs/` — the tool tables, `.var` files, and HAL/INI the machine actually
loads. A proven part program is worth much less without the tool table it was
proven against, so the two are backed up as one unit.

Everything *else* on this machine is a git clone and can be re-fetched. This
directory cannot.

## Layout on the media drive

```
/mnt/media/linuxcnc-backup/
├── current/                     mirror of ~/linuxcnc as of the last run
└── history/
    └── 2026-08-23T094500/       only files that run deleted or overwrote
```

It is a mirror, not an archive — but `--backup-dir` means anything `--delete`
would have destroyed is moved into a timestamped `history/` directory first. A
plain mirror would faithfully replicate a mistake within the hour; this gives
you `RETAIN_DAYS` (default 365) to notice. Snapshots older than that are pruned
on the next run.

## Recovering a file

```bash
# find every retained copy
find /mnt/media/linuxcnc-backup/history -name 'myprogram.ngc'

# or take the current mirror
cp /mnt/media/linuxcnc-backup/current/nc_files/myprogram.ngc ~/linuxcnc/nc_files/
```

Verified end-to-end on 2026-08-23: a file was created, backed up, deleted from
the source, and recovered intact from `history/` after the mirror ran.

## When it refuses to run

It exits non-zero rather than producing a worthless backup if:

1. **`/mnt/media` is not mounted.** The important one. `/mnt/media` still exists
   as an empty directory on the *root* disk when the media SSD is absent, and an
   unguarded rsync would fill it — leaving a "backup" on the very drive it exists
   to survive, with a `df` that looks perfectly healthy. Checked with
   `mountpoint(1)`, which asks the kernel rather than looking for files.
2. The source directory is missing.
3. The source holds fewer than `MIN_FILES` (default 50) files — a guard against
   mirroring a catastrophic deletion over the last good copy.

The installer additionally refuses if source and destination resolve to the same
block device, because that is a copy, not a backup.

## Realtime safety

The service runs `Nice=19` and `IOSchedulingClass=idle`, so a backup can never
contend with running motion. The timer fires at `:40`, off the `:07/15` grid used
by `mazak-repo-pull.timer`, so the two never wake together.

## Install / update

```bash
sudo bash scripts/backup/install_gcode_backup.sh
```

Idempotent, and re-running is how you deploy an edit to `gcode_backup.sh` — the
service execs an installed copy at `/usr/local/bin/mazak-gcode-backup.sh`, not
the working-copy script, because `mazak-repo-pull` rewrites this working copy on
its own timer and bash reads scripts incrementally.

## Operating

```bash
systemctl list-timers mazak-gcode-backup.timer
journalctl -u mazak-gcode-backup -n 50 --no-pager
systemctl start mazak-gcode-backup.service            # run once on demand
sudo systemctl disable --now mazak-gcode-backup.timer # turn it off
```

## What this is NOT

A single copy on a second drive **in the same chassis**. It survives a dead root
disk; it does not survive theft, fire, or a power event that takes both drives.
The media SSD is also a reconditioned SanDisk SD8SN8U with no SMART baseline
captured yet. Treat this as the first tier, not the only one.
