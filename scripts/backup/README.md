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
| Second tier | daily 03:15 to the iMac — see below |

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

## Tier 2 — daily verified snapshot to the iMac

Added 2026-08-23, because tier 1 lives in the same chassis as the thing it
protects. It survives a dead root disk; it does not survive theft, fire, or a
power event that takes both drives.

| | |
|---|---|
| Unit | `mazak-gcode-backup-remote.timer`, daily 03:15 (+ up to 10 min jitter) |
| Destination | `andygant@andys-imac:Backups/mazak-linuxcnc/` |
| Form | dated `linuxcnc-YYYY-MM-DD.tar.gz`, ~9 MB compressed |
| Retention | newest 30 (`KEEP`) |

**Why a tarball instead of rsync.** The iMac ships **openrsync** — it reports
"rsync version 2.6.9 compatible" — not GNU rsync, and `--backup-dir` plus
several other flags this project wants are unreliable there. At 23 MB a dated
tarball is cheap, sidesteps the whole compatibility question, and buys something
a mirror cannot: real point-in-time snapshots. A mirror of a mistake is still a
mistake.

**Why daily, not hourly.** The tailnet path measured **1.57 MB/s** on
2026-08-23 (relayed). Fine for ~9 MB; not something to do 24 times a day. Tier 1
is the fine-grained tier; this is the "the shop burned down" tier. It should get
substantially faster once both machines share a LAN and Tailscale goes direct —
see the subnet caveat below.

**Every transfer is verified.** SHA-256 is computed on both ends and compared;
a mismatch deletes the bad copy and fails loudly. An unverified backup is a
rumour, and silent truncation is precisely the failure a backup must not have.

`BatchMode=yes` throughout, so a missing key fails fast instead of hanging on a
prompt no timer can answer. The install script *skips* this tier rather than
failing if the hop does not work — the local backup must never be blocked by a
network problem.

### Restoring from it

```bash
ssh andygant@andys-imac 'ls -1t Backups/mazak-linuxcnc/'
ssh andygant@andys-imac 'cat Backups/mazak-linuxcnc/linuxcnc-2026-08-23.tar.gz' \
    > /tmp/restore.tar.gz
tar -xzf /tmp/restore.tar.gz -C /tmp        # extracts a linuxcnc/ tree
```

Verified end to end on 2026-08-23: the snapshot was pulled back, extracted, and
a config file compared byte-for-byte against the live one. 1179 files.

### Caveats

- **The iMac has 41 GB free (80% full).** 30 snapshots is ~280 MB, which is
  fine, but this destination is not a candidate for bulk media.
- **The iMac must be awake.** A sleeping Mac means the run fails and retries
  tomorrow; `Persistent=true` also catches up after a boot. Repeated failures
  show in `journalctl -u mazak-gcode-backup-remote`.
- **The destination is a hostname, resolved over Tailscale**, not a LAN address,
  and that is deliberate — it works from anywhere and survives either machine
  moving networks. The Mesa subnet collision that used to make `192.168.1.19`
  unreachable from this box was fixed on 2026-08-23 (Mesa moved to
  `10.10.10.0/24`), so a LAN address would work now too once both machines share
  a network — but the hostname is still the better choice.

## What this is NOT

Two copies, one of them offsite, both derived from the same source by the same
automation. That is a real improvement over one copy, and it is still not an
archive: if a corruption goes unnoticed for 30 days it reaches every tier. The
`history/` directory in tier 1 and the dated snapshots in tier 2 are what buy
you time to notice.
