# Handoff — camera-roll grouping tool, 2026-08-25

Written for a session picking this up **on the MacBook Pro**, where the photos
actually are. Read [`../CLAUDE.md`](../CLAUDE.md) first — it is the operating
manual. This file is a dated snapshot of one thread, not a status board.

**Do this first:** `git pull`, and check you are on branch
`claude/iphone-photo-organization-5ns32z`.

> **Scope:** this is a **general camera-roll tool** and has nothing to do with
> the retrofit. It does not implement the eight-folder scheme in
> [`README_photo_sorting.md`](README_photo_sorting.md); sorting project photos by
> subject remains a human judgement. It lives here because the project already
> carries a photo-management problem and the same clustering may serve the shop
> batches later. Everything is self-contained under `scripts/photo_tools/`.

---

## Where this stands

**PR #109 — merged.** The grouping tool: sessions (capture-time order, split on a
long gap or a location jump) and near-duplicate sets (perceptual hash). Nothing
is ever moved by the analysis; it writes a report plus an `apply_plan.sh` that
**copies** and never deletes.

**PR #110 — open, CI green, not yet merged.** Reads Apple Photos libraries
directly, merges several sources, and files migrated assets by capture time.

### Settled against the real library — do not re-derive

Verified on the MacBook's own library (2,714 assets) on 2026-08-25, not on a
fixture.

| Fact | Evidence |
|---|---|
| The schema matches what the adapter expects; `b.ZASSET = a.Z_PK` joins **all 2714 rows** | `photos_library.py --schema` |
| `ZORIGINALFILENAME` is populated 2714/2714; `ZTIMEZONEOFFSET` 2702/2714 (`-21600`, GMT-0600) | same |
| The **UUID filenames are not a bug.** `ZORIGINALFILENAME` genuinely holds e.g. `E238A261-…JPG` — a *different* UUID from the asset's own `ZUUID`, left from a library these were migrated out of | `photos_library.py --probe` |
| **Timezone handling is correct.** `ZDATECREATED 460346036` = 2015-08-04 01:53 UTC, presented as 2015-08-03 19:53 — pulled back across midnight into the right local day | same |
| Local coverage on this Mac: **1,366 assets with an original, 2,685 with a derivative**, 26 with no local file | same |

**Two suspicions raised earlier in this thread were wrong and are retracted:**
that the `ZADDITIONALASSETATTRIBUTES` lookup was failing, and that capture times
were coming back as raw UTC. The probe output above disproves both.

### Not verified

- **The `sips` decode backend has never run.** It is the path HEIC takes on a Mac
  with no Pillow. The pure-Python PNG reader it feeds *is* tested; the `sips`
  invocation is not. The report header prints which backend is live. If it
  misbehaves: `pip3 install Pillow pillow-heif` takes the tested path instead.
- **No full grouping run has ever completed on real photos.** Every result so far
  is from synthetic fixtures. This is the next step.

---

## Next step

```sh
python3 scripts/photo_tools/group_photos.py --photos-library
open photo-grouping-report/report.html
```

Decodes ~2,442 images once, so it takes a while. Nothing moves — it writes a
report, `groups.json`, and an `apply_plan.sh` that only runs if you run it.

Worth capturing from that run, into this file or a new dated note:

1. Which decode backend the report header names (the open `sips` question).
2. How many sessions and near-duplicate sets it finds, and the reclaimable size.
3. Anything that errors, with the file that caused it — the report lists
   unreadable files rather than dropping them silently.

Then, if the report looks right, `sh photo-grouping-report/apply_plan.sh`. It
copies into a new tree and leaves the originals untouched, so it needs free disk
for a second copy; duplicates go to `_review_duplicates/` rather than being
deleted.

## Still open

- **The iPad (12.9) was brought online 2026-08-25.** If iCloud Photos is on for
  it, its photos sync into this same library and a re-run picks them up — watch
  whether the asset count climbs past 2,714. If it stays at 2,714 after the iPad
  reports sync complete, its library is local-only and needs importing with
  Image Capture, then `--source` on that folder.
- **Other libraries and loose folders.** `--source` and `--photos-library` are
  both repeatable and combinable; assets shared between libraries are collapsed
  on their Photos UUID, preferring whichever copy is a true original.
- **PR #110 should not merge** until a real run has been done, since it touches a
  real photo library. The read-only guarantee is tested, but against a fixture.

## Cautions

- **One session per working copy.** `CLAUDE.md` records a commit orphaned on
  2026-08-23 by two sessions sharing a clone. The cloud session that wrote this
  file has stopped pushing to this branch; if that changes, use
  `git worktree add` rather than checking out in a clone someone else is using.
- Tests need Pillow only to build fixtures and skip cleanly without it, so they
  do not affect the CI gate:
  `python3 scripts/photo_tools/test_group_photos.py` (24) and
  `test_photos_library.py` (32).
