<!-- Full reindex of every photo location and a complete Photos-library sweep, 2026-08-21. -->

> **ROLE: REFERENCE** — the complete inventory of where project photos live, what
> each store held, and what a full visual sweep of both Photos libraries turned up.
> Layout and citation rules: [`photo_drive_layout_2026-08-21.md`](photo_drive_layout_2026-08-21.md).
> See [../INSTALL_SPINE.md](../INSTALL_SPINE.md).

# Photo reindex and library sweep — 2026-08-21

Every known location was enumerated and hash-compared against Drive. Drive now
holds **936 files**.

| Location | Media | Outcome |
|---|---|---|
| **Drive `My Drive/Mazak`** | **936** | **Authority.** `00_Inbox` empty |
| `~/Projects/Mazak-Local` (iMac) | 734 | 21 stills local-only → **3 new, filed** |
| `~/Projects/Mazak-Local` (MacBook) | 734 | now a path-identical mirror |
| Apple Photos "Mazak" album | 320 | migrated |
| Google Photos ×2 albums | 320 | migrated, unshared |
| OneDrive `Pictures/Mazak` | 3 | cleared; 3 large videos held back |
| USB `Equipment & Machine Tools/Mazak` | 99 | searched; 5 stills recovered |
| OneDrive `Media Inbox` | 75 / 83 GB | **zero Mazak** — all `Smoke/` |
| Photos libraries, full sweep | 2,496 assets | **1 undocumented session found** |

## The find — an undocumented resolver session, 2026-07-17

**`IMG_0190`–`IMG_0207`, eighteen frames, in no other store.** The earlier
workday-filtered pass missed them because **2026-07-17 has no other Mazak photos**,
so it was not among the 34 known Mazak workdays. Only a full-library sweep caught it.

They are the best resolver-plate imagery in the project: sharp, well lit, plus the
pickup units in situ on the ballscrew ends. Filed to `03_Motors_Feedback`
(`IMG_0195` → `05_Machine`; `IMG_0184`, `IMG_0185`, `IMG_0200` → `07_Reference`).

### What `2026-07-17/IMG_0191` shows

| Field | Reading |
|---|---|
| SPEC NO. | **`BKO-NC6062A`** — crisp |
| SER NO. | **`A6986`** → this is the **Y** pickup, per [`feedback_nameplate_survey_2026-08-15.md`](feedback_nameplate_survey_2026-08-15.md) |
| Plate style | **`N5399`** — matches the survey's note |
| TYPE `RT-☐X☐-☐☐` | **faint ghost impressions, ink gone** |
| PARTS `TS2014N☐☐E☐-☐` | same — box outlines crisp, contents ghosted |
| DATE | `.198_` |

**This settles the mechanism.** The characters *were* stamped: what survives is a
shadow in the box with no ink in it. Not an unstamped plate, and not a photographic
failure — **lost ink**, which is exactly why magnification does not help and why the
owner's 2026-08-21 determination (coolant faded the stamp ink) is the right one.
See the closed re-shoot item in the feedback survey.

## Everything else the sweep found: nothing Mazak

Method: read the Photos SQLite directly (AppleScript times out on a library this
size) and used the **local JPEG derivatives** — 4,232 of them, covering 2,496 of
2,521 assets — so iCloud-only originals were no obstacle to *identification*.
1,899 images not already known to be Mazak were reviewed across 31 contact sheets.

Two candidates were worth chasing and both resolved as **not Mazak**:

- The bound schematic book (2026-02-06, `IMG_1694`–`IMG_1702`) is
  **Hobart Brothers, "DIAGRAM, CONNECTION RC-300-RVS", dwg `369824`** — a welder.
  The US colour-code legend (`BK`/`RD`/`BR`/`TN`, DARK/LIGHT prefixes) gives it away
  before the title block does; Mazak OEM sheets use Japanese conventions and
  dwg numbers like `4143075022`.
- `IMG_0518`, which reads as a control cabinet at thumbnail size, is a
  **Battenfeld HM 270/2200 injection moulder**.

Everything else was other projects sharing the same days — 3208 Cat, the Kubota,
trucks, the Hobart welder, an oil furnace, a solar inverter install.

## Also filed this pass

- **`IMG_2418`** → `04_Wiring_Terminals`. The **Nemic-Lambda `HR-11F-24`**,
  P/N **`LJN-721K34-0009-P606`**. [`photo_survey_misc.md`](photo_survey_misc.md)
  documents this supply as "HR-11F" with no suffix; this frame gives the full model
  and part number.
- **`IMG_0822.JPG`** → `02_Drives`. Drive held `IMG_0822.MP4` (the Live Photo motion)
  but **not the still**, and `photo_survey_misc.md` cites `IMG_0822` as evidence for
  the BB1B / `BN624A306H01` silkscreen. That citation pointed at a photo the project
  did not have.
- **`IMG_0080-6.jpg`**, **`IMG_0081-7.jpg`** → `02_Drives`. MELDAS servo bay with the
  FREQROL FR-SX beneath it.

Of the 21 `Mazak-Local` stills that were local-only, **18 were rotated re-encodes**
of frames already held (4284×5712 vs 5712×4284 — same pixel count, orientation baked
in). They were deliberately **not** filed; they add bytes, not evidence.

## Known gap

**19 candidates remain uninspected.** They exist only in iCloud — the iMac library
is fully optimised (zero local originals) and the MacBook holds 1,843 of 2,539.
Photos exports force a download and produced nothing in ~25 minutes for 77 items,
nor for 3. Three of the 19 are probably Mazak: **`IMG_2404`, `IMG_2406`,
`IMG_2407`**, which sit inside the `IMG_24xx` sequence whose neighbours
(`2409`–`2417` card racks, `2418` the HR-11F) are all Mazak.

To close it: select those in Photos and **Download Original**, or turn off
"Optimise Mac Storage" on the MacBook. The sweep reads the library off disk, so
once they are local it takes minutes.

## Machines

`~/Projects/Mazak-Local` is now **path-identical on both Macs** (734 files, zero
differing paths). The MacBook previously held the pre-2026-08-20 folder names.
Note this is a *third* copy of material Drive already holds — worth deciding
whether it is a backup you want or duplication to retire.
