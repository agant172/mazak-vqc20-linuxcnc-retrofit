# SN 060231 — Live M-2 Parameters (photographed 2025-06-27 → 2025-08-28)

**Source:** 7 photos of the running Mazatrol M-2 CRT, not committed per repo
photo policy. They come from **three sessions in 2025**, not one in 2026:

| Photos | Captured (EXIF `DateTimeOriginal`, local) | Screen |
|---|---|---|
| `IMG_0014`, `IMG_0015` | **2025-06-27** 20:32, 20:39 | PARAMETER 3-D, EIA/ISO |
| `IMG_0308`, `IMG_0309` | **2025-08-10** 18:31 | MACH CONSTANT PAR NO.2 |
| `IMG_0373`–`IMG_0377` | **2025-08-28** 14:06–14:19 | MACH CONSTANT PAR NO.2 |

Cite them as `2025-08-28/IMG_0374` and so on. All now live in Drive under
`My Drive/Mazak/07_Reference`.

> **Citation repaired 2026-08-17.** This previously pointed at
> `~/Downloads/Photos-1-001 (1)/` on "Andy's Mac". **That folder does not exist
> on the iMac** — a local path is not a citation, since it names a location
> rather than an artifact, and it broke within three weeks. The photos live in
> Drive; cite by file ID:
>
> | Artifact | Drive ID |
> |---|---|
> | Machine photo folder (all cabinet/CRT photos) | `1LzXka9G8uSp-UCiJgQ19NPBdOmCBL43c` |
> | `Photos-1-001` (uploaded copy of the 2026-07 set, IMG_0248–0312) | `16BsiMR9EHcoa-9HeCmYX6CYsjtToYpPN` |
> | A full **MACH CONSTANT PAR NO.2** capture, verified 2026-08-17 | `1yTkUJBBNEuA-mmtQIEsrb2WuOz5qpe3N` |
>
> **Resolved 2026-08-21.** `IMG_0373`–`0377` are in Drive after the photo
> consolidation, at `My Drive/Mazak/07_Reference`, EXIF-dated **2025-08-28**.
> The earlier search failed for exactly the reason it suspected: `IMG_nnnn`
> repeats across batches. Files with these same numbers also sit in
> `02_Drives`, dated **2026-07-27** — those are **MELDAS servo cards, not CRT
> screens**, and are a different photograph entirely. That collision is what
> put the wrong date on this document; see
> [`photo_drive_layout_2026-08-21.md`](photo_drive_layout_2026-08-21.md) for the
> `__dup2` convention now used to keep both frames.
>
> This is the case [`README_photo_sorting.md`](README_photo_sorting.md) requires
> `YYYY-MM-DD/IMG_nnnn` for. Always carry the date.
IMG_0374 and IMG_0377 are clean full captures of **MACH CONSTANT PAR NO.2**;
every value below was read from those and cross-checked against IMG_0373.
Values marked ✓✓ were additionally verified from zoomed crops.

**Units:** the control runs in inch mode — machine-coordinate and backlash
values are **0.0001 inch** counts (RP3 = −59055 → −5.9055 in = exactly
−150.0 mm, which is the kind of round-metric number Mazak would design to).
Speed/time cells are recorded raw with the probable unit noted.

**Alarm on screen:** `100 TOOL DATA ERROR (INCOMPLETE)` (red, on the CUT
COND page photos) — tool-data table incomplete; irrelevant to the retrofit
but noted for the record.

## The headline numbers

| What | Param | Raw | Inches | mm |
|---|---|---|---|---|
| ATC 2nd zero point X | RP1 | 0 ✓✓ | 0.0000 | 0.0 |
| **ATC 2nd zero point Y** | RP2 | **95000** ✓✓ | **+9.5000** | 241.30 |
| **ATC 2nd zero point Z** | RP3 | **−59055** ✓✓ | **−5.9055** | **−150.00** |
| ATC 2nd zero point 4th | RP4 | 0 ✓✓ | — | — |

The Y ATC position (+9.5 in) is **outside the machining envelope**
(main-box Y max = +0.0394 in) and inside the ATC AREA box — confirming the
two-box soft-limit scheme from the parameter dictionary (see
`background/parameter_recovery.md`).

## Soft limits — two boxes (0.0001 in, machine coordinates)

| Corner | X | Y | Z |
|---|---|---|---|
| Main box + | LX1 394 (+0.0394) | LY1 394 (+0.0394) | LZ1 394 (+0.0394) |
| Main box − | LX2 −394094 (−39.4094) | LY2 −300394 (−30.0394) ✓✓ | LZ2 −181496 (−18.1496) |
| ATC box + | LX3 394 (+0.0394) | **LY3 95000 (+9.5000)** | LZ3 394 (+0.0394) |
| ATC box − | LX4 −394094 (−39.4094) | LY4 394 (+0.0394) | LZ4 −59449 (−5.9449) |

- Travels implied: X 39.4 in (~1001 mm), Y 30.0 in (~763 mm), Z 18.1 in
  (~461 mm).
- ATC box: full X width, Y from +0.0394 to +9.5000 (the magazine zone), Z
  floor −5.9449 — exactly 0.0394 in below the RP3 exchange height, same
  394-count margin the OEM uses everywhere.
- **LinuxCNC:** `[AXIS_*] MIN/MAX_LIMIT` must be the union —
  X [−39.4094, +0.0394], Y [−30.0394, **+9.5000**], Z [−18.1496, +0.0394] —
  with the remap owning safety inside the ATC zone (Z no lower than −5.9449
  while Y > +0.0394).

## Zero return / homing

| Param | X | Y | Z | 4th | Meaning |
|---|---|---|---|---|---|
| ZP | 0 | 0 | 0 | 0 | machine zero = zero-return position |
| ZS | 0 | 0 | 0 | 0 | grid shift |
| ZC | 79 | 79 | 79 | 0 | creep speed (raw; probable 7.9 ipm) |
| ZD | 0 ✓✓ | 1 ✓✓ | 1 ✓✓ | 0 | zero-return direction bits |

## Rapids, feeds, time constants

| Param | Value | Probable meaning |
|---|---|---|
| RF1–RF4 | 4212 (all) ✓✓ | rapid speed; ×0.1 ipm → 421.2 ipm ≈ 10.7 m/min |
| RT1–RT4 | 120 (all) ✓✓ | rapid accel time constant, ms |
| RFR | 50 | rapid-related (override floor?) — raw |
| SFC | 1457 ✓✓ | feed clamp; ×0.1 ipm → 145.7 ipm |
| STC | 50 ✓✓ | feed time constant, ms |
| SMP | 132 ✓✓ | raw — not in dictionary extract |
| AF1/AF2/AF3 | 0 ✓✓ | index-table/M-code bits |
| AF4 | 2 ✓✓ | matches dictionary default |
| EX2 | 10 | raw |
| AT1–AT4 | 0 (all) ✓✓ | external speed distance unused |

Starting points: `[JOINT_*] MAX_VELOCITY` ≈ 7.0 in/s (421 ipm) pending unit
confirmation; RT 120 ms → accel ≈ 58 in/s² as a first guess (velocity/time
constant) — tune on the machine.

## Spindle gears + orient (feeds mazak_orient)

| Param | Value | Meaning |
|---|---|---|
| GYN | 2 ✓✓ | **two gear steps** — matches PRS-10/PRS-12 hardware |
| GH4 | 3488 ✓✓ | high-gear max rpm (VQC spec top ≈ 3500) |
| GH3 | 434 ✓✓ | **low-gear max rpm → gear crossover = 434 rpm** |
| GL4 | 119 ✓✓ | high-gear min rpm |
| GL3 | 28 ✓✓ | low-gear min rpm |
| GH1/GH2/GL1/GL2 | 0 | unused (2-speed) |
| SPI | 50 ✓✓ | spindle indexing (orient) speed, rpm — FR-SX orient cross-check |
| SPO | 20 ✓✓ | gear-change speed coefficient |

Gear ranges: **low 28–434 rpm, high 119–3488 rpm**. Applied:
`gear-range.in1 = 434` in `linuxcnc/atc_orient.hal` (was placeholder 800).

## Servo / backlash

| Param | X | Y | Z | 4th | Meaning |
|---|---|---|---|---|---|
| MA | 0 ✓✓ | 4 ✓✓ | 4 ✓✓ | 0 | servo constant bits |
| MC | 784 | 784 | 784 | 784 ✓✓ | servo coefficient |
| BL (G00) | 0 | 10 | 25 | 0 ✓✓ | rapid backlash, 0.0001 in |
| MD (G01) | 5 | 10 | 20 | 0 ✓✓ | cutting backlash, 0.0001 in |

LinuxCNC has one `BACKLASH` per joint — start from the G01 set
(X 0.0005, Y 0.0010, Z 0.0020 in) and verify with an indicator; the G00/G01
split is an M-2 nicety that servo tuning on the Mesa stack should absorb.

## PARAMETER 3-D, EIA/ISO screen (captured 2025-06-27, IMG_0014/0015)

A separate, earlier session — 2025-06-27, the same evening as the DIAGNOSIS
frames `IMG_0016`–`IMG_0019` ([`diagnosis_screens_2025-06-27.md`](diagnosis_screens_2025-06-27.md)),
not the same evening as the PAR NO.2 captures above. Dictionary reference: manual pages
6-22 to 6-24. Live values:

| Address | Live | Dictionary meaning |
|---|---|---|
| TO1–TO9 | all 0 | tolerance table (dict defaults 1/2/5/10/20/50/100/200/500 × 0.001 in) |
| DG1, DG2, CA1–CA3, CH1, CHC | all 0 | blank in the dictionary too |
| OP1–OP21, OP23, OP24 | all 0 | tape punch/reader codes, RS-232C spec, G60 one-way positioning, baud rates |
| **OP22** | **128** | feed (leader) length after the last program at paper-tape punch output |

**Retrofit significance: none.** The whole page is the M-2's EIA/ISO
G-code-option and paper-tape/RS-232 configuration, and it is essentially
unconfigured — consistent with a machine run conversationally in Mazatrol
its whole life. OP16=0 means the serial port sat at the "all zero" default
(2 stop bits, no parity, 8-bit chars). The lone nonzero value, OP22=128, is
punch-trailer feed length. Nothing here maps to a LinuxCNC setting.
Recorded for completeness of the CMOS rescue only.

## Not yet captured

The photos cover MACH CONSTANT **PAR NO.2** (complete, above), the
**PARAMETER 3-D, EIA/ISO** page (complete, above) and CUT COND.
PARAM NO.2 (Mazatrol cutting coefficients — visible in IMG_0375/0376, not
needed for the retrofit, not transcribed). Still wanted from the live
control (PREVIOUS/NEXT PAGE on the same display):

- **MACH CONSTANT PAR NO.1 and NO.3** — pitch-error comp (PP/PZ/PSL + table),
  thermal comp (TH), linear-scale gains (MP8–MPB — settles the Y Magnescale
  question), drum points A1X–A7Z, TCZ, DP timers/machine number.
- DIAGNOSIS screens while the control still boots.

## Cross-checks with the ladder/dictionary work

- GYN=2 two-speed ✓ PRS-10/PRS-12 gear confirms in the orient transcription.
- RP as "No.2 zero point (ATC location)" ✓ maintenance-manual gripper
  procedure; ZP2.B.N reference command in the ATC transcription.
- ATC-area soft-limit box ✓ OTNEG.N soft-OT-neglect mechanism.
- TCE=TCC=0 (dictionary defaults) ✓ armless ATC.
