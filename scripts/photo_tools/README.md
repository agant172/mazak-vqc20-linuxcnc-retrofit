# Camera roll grouping

Groups a folder of exported iPhone photos two ways at once, and writes a report
you read before anything is touched.

* **Sessions** — photos in capture-time order, split wherever there is a long
  pause or a large jump in location. This is the *"these belong together"*
  grouping: one afternoon, one trip, one evening.
* **Near-duplicate sets** — photos whose perceptual hashes are nearly equal.
  This is the *"you shot this same thing nine times"* grouping: bursts, retakes,
  edited copies. Byte-identical files are reported separately, since those need
  no judgement.

Nothing is moved, renamed, or deleted by the analysis. It produces a proposal;
acting on it is a second step you take yourself.

## Scope note

This is a **general-purpose camera-roll tool**, not a Mazak one. It lives here
because the project already carries a photo-management problem and the same
clustering will serve the shop batches later, but it knows nothing about the
retrofit and does not implement the eight-folder scheme in
[`docs/README_photo_sorting.md`](../../docs/README_photo_sorting.md). Sorting
project photos into `01_Cabinet`…`07_Reference` is still a human judgement about
*subject*, which this tool does not attempt.

## Covering every Apple device

**Start here, because it usually collapses the problem:** with iCloud Photos
enabled, your iPhone, iPad and Macs are not separate sets of photos. They are
caches of *one* library, differing only in which originals are stored locally.
Reading one Mac's library therefore covers every device that syncs to it — a
photo taken on the iPhone this morning is in the MacBook's library already, even
if only as a derivative.

An iOS device is never read directly; nothing on an iPhone runs this. Its photos
arrive through iCloud, and that is enough.

Three things genuinely sit outside that:

| Gap | What to do |
|---|---|
| **A second or archived library** (an old library, one on an external drive, a pre-iCloud library) | Pass `--photos-library` once per library. Assets shared between them are collapsed automatically. |
| **Folders that were never in Photos** — SD-card dumps, exports, old backups | Pass `--source` once per folder. Combine freely with `--photos-library`. |
| **Photos on a device that never reached iCloud** — iCloud Photos off, a different Apple ID, excluded from a shared library | Must be imported to a Mac first. Nothing can read them in place. Use **Image Capture.app** to copy them to a folder, then pass that folder with `--source`. |

Scanning several sources at once:

```sh
python3 group_photos.py \
    --photos-library ~/Pictures/Photos\ Library.photoslibrary \
    --photos-library /Volumes/Archive/Old.photoslibrary \
    --source ~/Pictures/SDCardDump
```

`--photos-library` with no path uses **every** library found in `~/Pictures`.

### Photos that Photos never named

Assets migrated out of an older library carry a UUID as their stored
"original filename" — e.g. `E238A261-704E-4097-B5D2-AD721899FD4C.JPG`, which is
that previous library's identifier rather than anything a person chose. It is a
truthful value and a useless label, so those are filed by **capture time**
instead: `2015-08-03_195300.jpeg`, which also sorts correctly in Finder. Photos
with a real filename keep it untouched.

Confirmed on a 2,714-asset library where the whole 2015 range is named this way.

### How duplicates across libraries are handled

Photos gives an asset the same UUID on every device that syncs it, so the same
photo in two libraries is matched by id — exactly, with no hashing — and
collapsed to one item. Where both libraries hold a copy, the better local file
wins: **a true original always beats a derivative**, so a fully-optimised Mac
never drags down a library that still has the real file.

Photos in separate, *unsynced* libraries have different ids. Those are not
collapsed by id; they fall through to ordinary near-duplicate detection and
appear as a duplicate set for you to judge.

## Two ways in

### Reading a Photos library directly (usually what you want)

```sh
python3 group_photos.py --photos-library
```

It reads capture times and locations out of `Photos.sqlite` and hashes whichever
local file is best — the original when on disk, otherwise the derivative JPEG.

This matters on an iCloud-optimised library, where most originals live in the
cloud and exporting forces a slow, unreliable download of every one. A derivative
is entirely adequate for finding duplicates, and because dates come from the
database rather than the file, **the timeline stays correct even for photos whose
originals are not on this Mac**.

The library is opened read-only from a temporary copy of the database. Nothing in
the bundle is modified, which is asserted by a test that fingerprints every file
before and after a run. Assets present in the database but with no local file are
counted and reported, not silently dropped.

### Pointing at a folder

```sh
python3 group_photos.py --source ~/Pictures/CameraRollExport
```

For photos outside any Photos library. When you want full-size originals rather
than derivatives, export with **File → Export → _Export Unmodified Original_**;
the plain *Export* re-encodes and can rewrite metadata. From a phone over a
cable, **Image Capture.app** copies originals with EXIF intact.

Metadata is what makes session grouping work. If capture times are missing the
tool falls back to file modification dates, which on a fresh copy are all the
copy date — every photo collapses into one session. The report says so at the top
when it detects this.

## Running it

```sh
python3 group_photos.py --source ~/Pictures/CameraRollExport
open photo-grouping-report/report.html
```

Read the report. Then, only if you agree with it:

```sh
sh photo-grouping-report/apply_plan.sh
```

`apply_plan.sh` **copies** into a new tree — it never deletes or moves, so
running it cannot lose a photo. The cost is that it needs room for a second
copy. Redundant duplicates are copied to `_review_duplicates/` rather than
discarded; delete the originals yourself once you have looked.

### Options

| Flag | Default | What it does |
|---|---|---|
| `--source` | *at least one* | Folder of photos, searched recursively. Repeatable. |
| `--photos-library` | *at least one* | Read an Apple Photos library directly. Repeatable; omit the path to use every library in `~/Pictures`. Combines with `--source`. |
| `--out` | `photo-grouping-report` | Where the report is written |
| `--dest` | `<out>/organised` | Target tree for `apply_plan.sh` |
| `--gap-hours` | `3` | Pause that starts a new session |
| `--jump-km` | `25` | Location jump that starts a new session; `0` disables |
| `--threshold` | `5` | Hash distance counted as a near-duplicate (0–16) |
| `--include-videos` | off | Place standalone videos in sessions too |
| `--no-thumbs` | off | Skip thumbnails — much faster, less useful report |
| `--max-groups` | `300` | Near-duplicate sets drawn in the HTML |

Tuning `--threshold`: `0` catches only visually identical frames, `5` catches a
typical burst, `10`+ starts grouping merely *similar* scenes and will produce
false pairs. Raise `--gap-hours` if one continuous outing is being cut up;
lower it if separate events are running together.

## What it does not do

It does not recognise **content**. It cannot tell you that a photo shows a
terminal strip or a dog — it groups by *pixel similarity* and *when and where
the shutter fired*. That is the honest limit of what runs locally with no model
and no network, and it is enough to collapse bursts and rebuild the timeline,
which is most of the mess in a camera roll.

## How it works

* **Perceptual hash** — each image is reduced to 9×8 grayscale and turned into a
  64-bit difference hash, one bit per "is this pixel brighter than its right
  neighbour". Robust to re-encoding, small exposure shifts, and resizing.
* **Finding the near-duplicates** — comparing all pairs is quadratic and far too
  slow for a real roll. The hash is instead cut into `threshold + 1` blocks; two
  hashes differing by at most `threshold` bits must agree exactly on at least one
  whole block, so indexing the blocks yields every true match as a candidate.
  Verified against brute force: **zero missed pairs**. 30,000 photos cluster in
  about two seconds.
* **Exact duplicates** — byte-identical files must share a size, so SHA-256 is
  computed only within same-size groups. On a camera roll that skips the full
  read for almost every file.
* **Live Photos** — a still and a same-stem `.MOV` are treated as one item, and
  the clip follows its still when the plan is applied.
* **Photos libraries** — metadata comes from `Photos.sqlite`, never from the
  file, because a derivative carries no usable EXIF and its filename is a bare
  UUID. Core Data stores capture time in UTC with a separate timezone offset;
  the two are recombined into local wall-clock time, so an evening shot stays on
  the day it was taken instead of sliding into the next one. Files are filed
  under their real original names, with collisions disambiguated.

## Decoding

An iPhone roll is mostly HEIC, which plain Pillow cannot read. Three backends
are tried in order:

1. **Pillow + `pillow_heif`**, if installed — fastest, handles everything.
2. **`sips`**, the macOS system image tool, which has native HEIC support and is
   on every Mac. Its PNG output is decoded by a small pure-Python reader, so
   this path needs **no `pip install` at all**.
3. **Pillow alone**, for JPEG/PNG off a Mac.

The report header prints which backends are live. See
[What is not verified](#what-is-not-verified) for the caveat on the `sips` path.

## Tests

```sh
python3 test_group_photos.py     # 24 tests -- folder mode
python3 test_photos_library.py   # 35 tests -- library mode, merging, naming, end-to-end
```

Both run against synthetic fixtures with known answers. Between them they cover
EXIF parsing including GPS hemisphere signs, hash behaviour, burst clustering,
both session-split rules, Live Photo folding, unreadable-file handling, the Core
Data date conversion, derivative fallback, schema tolerance, and — most
importantly — that the generated plan contains no destructive command, that
executing it leaves the source tree byte-for-byte unchanged, and that reading a
Photos library does not modify it.

The tests need Pillow to build fixtures and skip cleanly without it, so they do
not affect the repo's CI gate.

## Verified on a real library

A full run on a 2,714-asset library (MacBook Pro, macOS, 2026-08-25) reported
`Backends: Pillow (no HEIC), sips` and **hashed 2,442/2,442 images with no decode
failures**, so the `sips` path — previously the one piece never exercised on a
Mac — works on real HEIC. It produced 427 sessions, 32 near-duplicate sets and 1
identical set.

The Photos schema, the `ZASSET` join, the Core Data date conversion and the
read-only guarantee were confirmed against that same library.

## What is still not verified

- **Other macOS releases.** Everything above is one library on one machine.
  Photos' schema shifts between releases, which is why the reader probes it with
  `PRAGMA table_info` rather than assuming. `photos_library.py --schema` prints
  what a given library actually contains, and `--probe` shows the raw values
  behind a specific row.
- **Whether excluding video sources recovers the missing duplicates.** The run
  above reported `hashed 2442/2442`, which counted *attempts*: 159 assets had
  resolved to their Live Photo `.mov` clip rather than the still, could not be
  decoded, and so took no part in duplicate detection. Both are fixed — video
  suffixes are never offered as a pixel source, and decode failures are now
  counted and named — but the corrected numbers have not been measured yet.
