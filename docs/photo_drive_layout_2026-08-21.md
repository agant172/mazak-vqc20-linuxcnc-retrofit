<!-- Record of the 2026-08-21 photo consolidation into Google Drive. -->

> **ROLE: GOVERNANCE** — where the project's photos physically live, and how to cite
> them. Supersedes the folder locations named in
> [`README_photo_sorting.md`](README_photo_sorting.md) §Migration and
> [`photo_survey_misc.md`](photo_survey_misc.md). See [../INSTALL_SPINE.md](../INSTALL_SPINE.md).

# Photo store — consolidated to Google Drive, 2026-08-21

The scheme in [`README_photo_sorting.md`](README_photo_sorting.md) was settled
2026-08-13 but had **never been created**. Until 2026-08-21 the real photo store was
OneDrive at `Pictures/Mazak`, in the superseded folder names, last written
2026-07-21. Google Drive `My Drive/Mazak` held only `Manuals_SN060231`.

`Misc. Photos` — cited throughout `photo_survey_misc.md` as
`My Drive/Mazak/Misc. Photos`, 238 files — **did not exist in Drive**. Those photos
were in the OneDrive store. Any doc still pointing at that path is stale.

## Current layout — `My Drive/Mazak`

| Folder | Files |
|---|---|
| `01_Cabinet` | 26 |
| `02_Drives` | 146 |
| `03_Motors_Feedback` | 51 |
| `04_Wiring_Terminals` | 72 |
| `05_Machine` | 128 |
| `06_Safety` | 1 |
| `07_Reference` | 118 |
| `Live Photo Motion` | 119 |
| `Videos` | 40 |
| `Manuals_SN060231` | 20 |
| **Total** | **723** |

`00_Inbox` exists and is empty. Videos and Live Photo clips stay outside the
numbered scheme, per the governance rule.

All 526 stills were reviewed by eye and filed against the folder definitions in
`README_photo_sorting.md`. `06_Safety` holding a single file is not a sorting
error — the set contains almost no safety-system photography.

## Three things you must know before citing a photo

### 1. `__dup2` suffixes mark genuine filename collisions

Where a camera number existed in **both** the OneDrive store and the Photos album,
both frames were kept. The OneDrive frame keeps the plain name; the album frame
gains `__dup2`. `IMG_nnnn` is preserved in both, so the citation format still works.

44 such collisions exist. They are **different photographs**, not re-encodes — the
case `photo_survey_misc.md` already warns about:

| File | Subject |
|---|---|
| `IMG_0373.JPG` | MAZATROL CRT, `MACH CONSTANT PAR NO.2` |
| `IMG_0373__dup2.JPG` | Z-axis MELDAS servo card |

For the 2026-08-12 spindle/head session the **`__dup2` file is the one you want**;
the plain-named file of the same number is an unrelated older frame.

### 2. Dates are LOCAL. EXIF is UTC, and sessions cross midnight

`README_photo_sorting.md` rule 2 says "the date is what makes it unique". That is
not currently safe. This camera stamps EXIF in **UTC**, and the 2026-08-12 evening
session straddles UTC midnight:

| File | EXIF (UTC) | Local (MDT) |
|---|---|---|
| `IMG_0616__dup2` | 2026-08-12 23:38 | 2026-08-12 17:38 |
| `IMG_0631` | 2026-08-12 23:58 | 2026-08-12 17:58 |
| `IMG_0632` | 2026-08-13 00:15 | **2026-08-12** 18:15 |
| `IMG_0645` | 2026-08-13 00:30 | **2026-08-12** 18:30 |

One continuous session therefore reads as two dates depending on timezone. This is
why [`../wiring/head_valve_hardware.md`](../wiring/head_valve_hardware.md) says
"photographed 2026-08-13" while
[`spindle_motor_plg_encoder.md`](spindle_motor_plg_encoder.md) says 2026-08-12 —
same evening, same session, same tripod.

**Rule: cite the LOCAL date.** All dates in the 2026-08-21 survey documents are local.

### 3. Two non-project clusters were excluded

Found during the review and deliberately **not** migrated:

- **`IMG_4261`** (×2, plus its Live Photo `.mov`) — a scan of a health-insurance
  card. Personal data, no project relevance. Left in Photos only.
- **`IMG_0620`–`IMG_0630`** (11 items incl. `IMG_0624.MOV`) — a Detroit Diesel
  truck: ECM, firewall harness, relay panel. Moved to a separate Photos album
  "Detroit Diesel Truck".

Note `IMG_0631` is **not** part of that cluster despite sitting inside its number
range — it is the head device placard, dwg `24136209710`, and is filed in
`07_Reference`.

## OneDrive

`Pictures/Mazak` was cleared on 2026-08-21 after byte-level verification (SHA-256 of
all 398 files against their Drive twins, plus confirmation that Google had
acknowledged each file server-side). **Three large videos were deliberately kept
there** — `IMG_0537.MOV`, `IMG_0552.MOV`, `IMG_0986.MOV` (3.9 GB) — because Drive
had not finished uploading them and OneDrive remained their only confirmed copy.

Deleted files are recoverable from the OneDrive web recycle bin for 30 days from
2026-08-21.
