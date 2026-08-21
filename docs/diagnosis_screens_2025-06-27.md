<!-- Transcription of the four DIAGNOSIS screen photographs, captured 2025-06-27. -->

> **ROLE: REFERENCE** — what the DIAGNOSIS frames actually contain (a VERSION
> table; no I/O data). Photo locations:
> [`photo_drive_layout_2026-08-21.md`](photo_drive_layout_2026-08-21.md).
> See [../INSTALL_SPINE.md](../INSTALL_SPINE.md).

# DIAGNOSIS screen transcription — captured 2025-06-27

**Source:** `IMG_0016`, `IMG_0017`, `IMG_0018`, `IMG_0019` — now in
`My Drive/Mazak/07_Reference`. EXIF 2025-06-28 03:11–03:16 **UTC** =
**2025-06-27 21:11–21:16 local (MDT)**. Cite as `2025-06-27/IMG_00nn`.

All four frames show the **same screen in the same state**; they differ only in
camera angle and glare. `IMG_0019` is the cleanest and is the reference frame.
`parameters_sn060231.md` lists "DIAGNOSIS screens while the control still boots"
as still wanted — these are them.

---

## Read this first: the data panes are EMPTY

The three monitor panes and the servo pane carry **row labels but no values**. This
is the diagnosis page with **no address selected** — not a capture of live I/O.

> **These frames do not contain any I/O, PLC-memory, or servo data.** The only
> populated field on the screen is the VERSION table below.

To get actual data someone must select an address at the machine using the soft keys
along the bottom (`A` `B` `C` `D` `E` `F` `ADDR +` `ADDR -` `ADJ`). Anyone planning
to mine these frames for ladder/I/O state should stop here and re-shoot instead.

## Screen layout

```
 I/O CHECK          MEMORY MONITOR (2)     MEMORY MONITOR (10)
   7654 3210          7654 3210
 H                  MH                     MD
 H                  MH                     MD
 Q                  WH                     MD

 DROOP  GRID  GAIN  PHASE        VERSION
 X                                  (see table)
 Y
 Z
 4
                    *** DIAGNOSIS ***
 [ A ][ B ][ C ][ D ][ E ][ F ][ ADDR + ][ ADDR - ][ ADJ ]
```

- **I/O CHECK** and **MEMORY MONITOR (2)** are bit displays, MSB-first header
  `7654 3210`. **MEMORY MONITOR (10)** has no bit header — decimal, consistent with
  the `(10)` radix label against `(2)` for binary.
- Row-label prefixes present: `H`, `Q` (I/O CHECK); `MH`, `WH` (mem monitor 2);
  `MD` (mem monitor 10). Values blank in every frame.
- **Servo pane** `DROOP / GRID / GAIN / PHASE` across axes `X`, `Y`, `Z`, `4` —
  all sixteen cells blank. A populated version of this pane would be worth having:
  `GRID` is the reference-mark/grid-shift figure that matters for homing repeatability
  on the retrofit.

## VERSION table — the one piece of real data

Transcribed from `IMG_0019` at magnification; identical in all four frames.

| Slot | ROM | Slot | ROM | Unit | ROM |
|---|---|---|---|---|---|
| `1-1` | `B01:G3` | `1-5` | *(blank)* | `2` | `100:*` |
| `1-2` | `D01:G2` | `1-6` | `D05:F` | `3` | `200:B` |
| `1-3` | `D02:J` | `1-7` | `D06:F` | `4` | `439:D` |
| `1-4` | `D03:H` | `1-8` | *(blank)* | `5` | `C00:F` |
| | | | | `6` | `ENG:F` |

Read exactly as displayed:

```
VERSION
1-1  B01:G3   1-5             2   100:*   6   ENG:F
1-2  D01:G2   1-6   D05:F     3   200:B
1-3  D02:J    1-7   D06:F     4   439:D
1-4  D03:H    1-8             5   C00:F
```

### Notes and confidence

- `B01`, `D01`, `D02`, `D03`, `D05`, `D06` in the `1-n` block are **card/slot ROM
  identities**; `1-5` and `1-8` are blank, i.e. **those two slots are unpopulated**
  — a directly useful fact for the card-rack inventory.
- The suffix after each colon is the ROM revision letter (`G3`, `G2`, `J`, `H`, `F`).
- `ENG:F` is the English-language ROM at revision `F`, consistent with a US-market
  machine (Mazak Corporation, Florence KY, per the dataplate `IMG_0434`).
- **`100:*` — low confidence on the character after the colon.** It renders as an
  asterisk rather than a letter, unlike every other entry. It may be a genuine `*`
  marker or a degraded glyph. Worth a re-read if the value matters.
- All other characters are high confidence — read at 2× upscale on the clean frame
  and cross-checked against `IMG_0018`, which agrees. My first pass on the glare-heavy
  `IMG_0017` read `200:D` and `ENG1E`; the two clean frames both show **`200:B`** and
  **`ENG:F`**, which supersede that.

## Follow-up — no longer possible at the machine

> **The M-2 NC computer was removed from the machine on 2026-08-21.** The CRT cannot
> be powered up again, so none of the below can be re-shot. Recorded here as what
> was lost, and as the shopping list for any surviving footage.

What a live control would have given, and now cannot:

1. The **live I/O map** — stepping `ADDR +` through the I/O CHECK range. These four
   frames show the empty template only.
2. The **servo pane** with axes energised (`DROOP`/`GRID`/`GAIN`/`PHASE`). `GRID` is
   the reference-mark/grid-shift figure that governs homing repeatability on the
   retrofit; all sixteen cells here are blank.
3. **MACH CONSTANT PAR NO.1 and NO.3** — the only source for pitch-error, thermal
   comp and the `MP8`–`MPB` linear-scale gains, the last of which would settle the
   Y-axis Magnescale question.

**Where to look instead.** Andy recalls filming all the M-2 parameter screens as a
record. That video has not been found on either Mac, in Drive, in OneDrive or in
the Photos libraries. `/Volumes/USB Video Drive` was searched 2026-08-21 and
**does not hold it either** — of 49 clips in `Equipment & Machine Tools/Mazak`,
48 are ~2-second Live Photo motion components and the only real video is a
27-second borescope clip. See
[`usb_video_drive_search_2026-08-21.md`](usb_video_drive_search_2026-08-21.md).

**The iPhone camera roll is the only place left.** The M-2 CRT session window is
**2025-06-28 → 2025-10-17**, so any such video dates from there.
