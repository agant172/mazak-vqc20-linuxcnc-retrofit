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

## Two ways in

### Reading the Photos library directly (usually what you want)

If the roll already syncs to a Mac through iCloud Photos, **you do not need to
export anything, and you do not need the phone**:

```sh
python3 group_photos.py --photos-library
```

That autodetects the library in `~/Pictures`; pass a path if you keep it
elsewhere or have more than one. It reads capture times and locations out of
`Photos.sqlite` and hashes whichever local file is best — the original when it is
on disk, otherwise the derivative JPEG.

This matters on an iCloud-optimised library, where most originals live in the
cloud and exporting forces a slow, unreliable download of every one. A derivative
is entirely adequate for finding duplicates, and because the dates come from the
database rather than the file, **the timeline stays correct even for photos whose
originals are not on this Mac**.

The library is opened read-only from a temporary copy of the database. Nothing in
the bundle is modified, which is asserted by a test that fingerprints every file
before and after a run.

Assets present in the database but with no local file at all are counted and
reported, not silently dropped, so the report tells you what it could not see.

### Exporting to a folder

If the photos are not in a Photos library — a directory of files, a card, a
download — point it at the folder instead:

```sh
python3 group_photos.py --source ~/Pictures/CameraRollExport
```

Exporting from Photos.app is also the route when you want the full-size originals
rather than derivatives. Use **File → Export → _Export Unmodified Original_**;
the plain *Export* re-encodes and can rewrite metadata. From a phone over a cable,
**Image Capture.app** copies originals with EXIF intact.

Whatever the route, metadata is what makes session grouping work. If capture
times are missing the tool falls back to file modification dates, which on a
fresh copy are all the copy date — every photo collapses into one session. The
report says so at the top when it detects this.

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
| `--source` | *one of these* | Folder of photos, searched recursively |
| `--photos-library` | *one of these* | Read an Apple Photos library directly; omit the path to autodetect in `~/Pictures` |
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
python3 test_photos_library.py   # 21 tests -- Photos library mode
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

## What is not verified

Two paths were written and reviewed in a Linux container and have never run on a
Mac. Both fail loudly rather than silently if they are wrong, and both have a
documented fallback:

* **The `sips` decode backend.** The pure-Python PNG reader it feeds *is* tested
  (RGB, grayscale, RGBA and palette, against Pillow), but the `sips` invocation
  itself is unverified. If it misbehaves, `pip3 install Pillow pillow-heif` takes
  the Pillow path instead.
* **A real `Photos.sqlite`.** The adapter is tested against a synthetic library
  built to the same shape macOS uses, which exercises the SQL, the UUID-to-file
  matching and the date conversion — but it cannot prove that a library from any
  particular macOS release has the columns the fixture has. This is why the
  adapter probes the schema with `PRAGMA table_info` and degrades rather than
  assuming: a missing side table costs the original filename, not the run. If the
  schema turns out to differ, `python3 photos_library.py <path>` prints what it
  found and is the quickest way to see where it diverges.
