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

## Tier 3 — the Mazak photo archive from Google Drive

Different source, same problem. **Google Drive was the sole copy** of the
retrofit's technical photos: OneDrive was cleared 2026-08-21 after verification
and both Google Photos albums were folded in and unshared, so nothing else held
them. These are photos of a machine being taken apart — many are unrepeatable.

| | |
|---|---|
| Unit | `mazak-photos-backup.timer`, daily 04:10 |
| Source | `gdrive:Mazak` (rclone, **read-only scope**) |
| Destination | `/mnt/media/mazak-photos/` |
| First run | 2026-08-23 — **1142 files / 7.5 GB, zero errors** |

**Neither Mac was usable as the source.** Both mount Drive via Drive-for-Desktop,
which *streams*: on 2026-08-23 the iMac held 4.1 GB of the 7.4 GB on disk and the
MacBook only 490 MB, the rest online-only placeholders. Copying from a Mac would
have silently backed up a partial set. Pulling from Drive directly also ran at
~19 MiB/s versus ~1.6 MB/s over the tailnet.

**Read-only by construction.** The rclone remote is authorized `scope=drive.readonly`,
so this job cannot alter or delete anything in Drive however wrong it goes — the
right property when the source is the only copy. `install_photos_backup.sh`
*refuses to install* if the remote ever has a broader scope.

**Credentials live outside this repo** at `~/.config/rclone/rclone.conf`, mode
600. It holds a Google refresh token and this repo is public.

Same `--backup-dir` safety net as tier 1: anything a sync would delete or
overwrite lands in `mazak-photos-history/<timestamp>/` first, kept 180 days. And
the job refuses to sync at all if Drive reports fewer than `MIN_FILES` (500)
objects, so a failed listing or an auth problem can never be mistaken for "the
user deleted everything" and mirrored.

### Count drift

Drive is authoritative. On 2026-08-23 it reported **1142 objects**, while the
iMac enumerated 1143, the MacBook 938, and `CLAUDE.md` recorded 844 — four
different numbers for one folder. The script logs `drive=` and `local=` every
run and warns if the local copy falls more than 10 files short.

## Tier 4 — video project files off the USB Video Drive

The USB Video Drive holds ~603 GB, of which **~463 GB is irreplaceable footage
with exactly one copy**. That is a second-drive problem, not a
back-it-up-over-the-network problem, and a second drive is on order (2026-08-23).

This job takes the ~15 MB worth far more than its size: the Premiere project
files, the auto-save history, and the `Projects/` tree — every cut and sequence,
work measured in evenings rather than gigabytes. Footage can at worst be
re-shot; a lost `.prproj` means redoing the edit by hand.

| | |
|---|---|
| Unit | `mazak-video-projects-backup.timer`, daily 04:40 |
| Source | `andygant@andys-macbook-pro-16:/Volumes/USB Video Drive` |
| Destination | `/mnt/media/video-projects/` |
| First run | 2026-08-23 — 33 files, 15 MB |
| Retention | 60 dated snapshots |

`Shop & Property` (11 MB of roof video) rides along because it is small, real
footage that would otherwise sit in the 463 GB single-copy pile. Deliberately
skipped: `Videos/` is an empty macOS TV Library scaffold and `Captures/` holds
one stray `desktop.ini`.

**Three guards, because an empty snapshot is worse than none** — it would prune
a good one to make room for itself:

1. `/mnt/media` must be a real mount point.
2. The **USB volume must be present on the Mac.** Unplugged or dock down means
   the file list comes back empty; the job refuses rather than snapshotting
   nothing.
3. Fewer than `MIN_FILES` (20) files, or a tarball under 10 KB, fails the run.

Every snapshot is SHA-256 verified **after** landing, and then `tar -tzf`-tested
to prove the archive is readable rather than merely intact bytes.

**File lists are NUL-delimited throughout** (`find -print0` / `tar --null -T -`).
These paths contain spaces, ampersands and unicode; a newline-delimited list
would corrupt them.

### Restoring

```bash
ls -1t /mnt/media/video-projects/
cd /mnt/media/video-projects && sha256sum -c video-projects-2026-08-23.tar.gz.sha256
tar -xzf video-projects-2026-08-23.tar.gz -C /tmp/restore
```

Drilled 2026-08-23: a restored `.prproj` decompressed to valid Premiere XML with
its sequences and clip names intact. (`.prproj` files are gzipped XML, so
`gunzip -c` is a quick validity check.) Expect `tar: Ignoring unknown extended
header keyword` warnings — macOS extended attributes GNU tar does not recognise,
harmless.

## Off-machine: the shop media cloud upload

Not run from this box, but recorded here because it shares the rclone
credentials and the same failure mode.

The USB Video Drive's ~546 GiB of irreplaceable footage uploads to Google Drive
from **the MacBook**, where the drive is attached to the Thunderbolt dock —
`~/bin/shop-cloud-backup`, nightly at 23:30 via launchd. It uses `rclone copy`,
never `sync`, so a local deletion cannot erase the cloud copy, and the remote is
scoped **`drive.file`**: verified 2026-08-23 that `rclone lsd gdrive-backup:`
sees only its own `ShopBackup` folder and cannot see the Mazak photos at all.

⚠️ **Both rclone remotes use rclone's shared Google client ID, which rclone warns
is being retired during 2026.** When it lapses, the Mazak photo backup here
fails too. Tracked in `docs/project_status.md`.

## What this is NOT

Two copies, one of them offsite, both derived from the same source by the same
automation. That is a real improvement over one copy, and it is still not an
archive: if a corruption goes unnoticed for 30 days it reaches every tier. The
`history/` directory in tier 1 and the dated snapshots in tier 2 are what buy
you time to notice.
