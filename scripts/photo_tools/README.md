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

## Getting the photos off the phone

Metadata is what makes the session grouping work, so export in a way that keeps
it. On a Mac, best first:

1. **Image Capture.app** — plug the iPhone in, select all, *Import To* a folder.
   Copies the originals untouched, with EXIF intact. Best option for the whole
   roll.
2. **Photos.app → File → Export → _Export Unmodified Original_.** Note the
   *Unmodified Original* variant specifically; the plain *Export* re-encodes and
   can rewrite metadata.

Avoid routes that re-encode (AirDrop to some targets, chat apps, the iCloud web
download). If capture times are lost the tool falls back to file modification
dates, which on a fresh copy are all the copy date — every photo collapses into
one session. The report says so at the top when it detects this.

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
| `--source` | *required* | Folder of photos, searched recursively |
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

## Decoding, and one untested path

An iPhone roll is mostly HEIC, which plain Pillow cannot read. Three backends
are tried in order:

1. **Pillow + `pillow_heif`**, if installed — fastest, handles everything.
2. **`sips`**, the macOS system image tool, which has native HEIC support and is
   on every Mac. Its PNG output is decoded by a small pure-Python reader, so
   this path needs **no `pip install` at all**.
3. **Pillow alone**, for JPEG/PNG off a Mac.

The report header prints which backends are live.

> **The `sips` path has not been run on a Mac.** It was written and reviewed in a
> Linux container, where `sips` does not exist. The pure-Python PNG reader it
> feeds *is* tested (RGB, grayscale, RGBA, and palette, against Pillow), but the
> `sips` invocation itself is unverified. If it misbehaves on macOS, the fix is
> `pip3 install Pillow pillow-heif`, which takes path 1 instead.

## Tests

```sh
python3 test_group_photos.py
```

24 tests over a synthetic roll with known answers: EXIF parsing including GPS
hemisphere signs, hash behaviour, burst clustering, both session-split rules,
Live Photo folding, unreadable-file handling, and — most importantly — that the
generated plan contains no destructive command and that executing it leaves the
source tree byte-for-byte unchanged.

The tests need Pillow to build fixtures and skip cleanly without it, so they do
not affect the repo's CI gate.
