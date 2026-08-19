# M-2 Parameter Recovery — ZP2/ATC positions and machine constants

> **ROLE: BACKGROUND** — moved from `docs/` 2026-08-15; the live parameters were captured (`docs/parameters_sn060231.md`). Index: [README.md](README.md).


**Machine:** Mazak VQC 20/40, SN 060231 (Mazatrol M-2)
**Status:** PARTIALLY RECOVERED 2026-07-28 — MACH CONSTANT PAR NO.2 photographed
live and transcribed to `docs/parameters_sn060231.md` (RP/soft limits/gears/
backlash all captured). Still wanted: PAR NO.1 and NO.3 screens (pitch comp,
thermal comp, scale gains MP8–MPB, drum points, TCZ, DP timers).
**Source reviewed:** `VQC20-40_060231_Parameters.pdf` — "Parameter List & Explanation
for M-2" (Pub. #PAREXM210E, rev. 1986-02-27), 48 pp.

## Finding

The Parameters manual in the document set is the **generic M-2 parameter
dictionary**, not a machine record. The "Setting" column is blank on every
machine-specific row (verified visually, pages 6-31 to 6-42). The only printed
values are universal defaults (ZP1–4 = 0, TCE = TCC = 0, AF4 = 2, AT1 = 0,
DP0/DP1 = 16, plus tool/material cutting coefficients).

**Consequence: the ATC reference-point coordinates, soft limits, gear
breakpoints, and servo/backlash constants for SN 060231 exist only in the
control's battery-backed memory (or must be re-measured).**

## What the manual does establish (page 6-32)

- **ZP1–ZP4** — "Machine zero point coordinate X/Y/Z/4th (machine coordinate
  setting: at zero return)". Default 0: machine zero **is** the zero-return
  position. LinuxCNC equivalent: home position.
- **RP1–RP4** — "**2nd zero point coordinate** X/Y/Z/4th (machine coordinate
  system reference)". This is the "No.2 zero point (ATC location)" the
  maintenance manual references for gripper adjustment, and the target of the
  ladder's `ZP2.B.N` reference command. **These are the numbers
  `linuxcnc/remap/toolchange.ngc` needs for its `[ATC]` positions.**
- **Soft limits LX1–LZ4 define TWO boxes** — the diagram shows the main travel
  envelope (corners L\*1/L\*2) plus a separate "**ATC AREA**" box (corners
  L\*3/L\*4). This is the mechanism behind `OTNEG.N` (soft-OT neglect): the OEM
  control swaps/extends the active soft-limit box during a tool change. The
  retrofit replaces this by setting `[AXIS_*] MIN/MAX_LIMIT` to the union of
  both boxes and letting the remap own safety inside the ATC area.
- **TCZ** — "ATC position in terms of Z-axis coordinate value" (page 6-40);
  **A1X–A7Z** — "Drum change zero point 1–7" (pages 6-39/6-40): per-station
  exchange positions. On an armless single-station VQC these are expected
  unused or duplicating RP; record them anyway when capturing screens.
- **TCE / TCC** — extended/protruded length of ATC arm, both 0 for the armless
  VQC (consistent with the ladder findings: no arm).

## Parameter → LinuxCNC mapping (capture ALL of these)

| M-2 param | Meaning | LinuxCNC destination |
|---|---|---|
| RP1/RP2/RP3 | 2nd zero point X/Y/Z (ATC position) | `[ATC] REF_POINT_*` in `linuxcnc/atc_orient.ini.snippet`; toolchange.ngc targets |
| TCZ, A1X–A7Z | ATC Z position, drum change points | cross-check RP values |
| LX1–LZ1 / LX2–LZ2 | main soft-limit box | `[AXIS_*] MIN/MAX_LIMIT` |
| LX3–LZ3 / LX4–LZ4 | ATC AREA soft-limit box | union into MIN/MAX_LIMIT; remap clearance |
| ZP1–4, ZS1–4, ZD1–4, ZC1–4 | machine zero, zero shift, return direction, creep speed | `[JOINT_*] HOME_*` (HOME_SEQUENCE, HOME_SEARCH_VEL sign, HOME_FINAL_VEL) |
| RF1–4, RT1–4, RFR | rapid speed, rapid time constant, decel | `MAX_VELOCITY`, `MAX_ACCELERATION` starting points |
| SFC, STC | feed clamp speed, feed time constant | `MAX_LINEAR_VELOCITY`, accel cross-check |
| BL1–4 (G00), MD1–4 (G01) | backlash compensation | `[JOINT_*] BACKLASH` (note: M-2 splits G00/G01 — LinuxCNC has one value; reconcile) |
| MA1–4, MC1–4 | servo constant bits, servo coefficient | record only — informs 7i49 (on 7i80HDT P1) PID + resolver scaling sanity checks |
| GH1–4, GL1–4 | gear up/down-shift rpm breakpoints | `mazak_orient` gear-select thresholds (currently `setp gear-range.in1 800` placeholder) |
| SPI | spindle indexing (orient) speed | FR-SX orient config cross-check |
| SPO, GYN | gear-change speed coefficient, number of gear steps | confirms 2-speed gearbox config |
| MP8–MPB | linear-scale low-speed gain X/Y/Z/4 | evidence for/against the Y-axis Magnescale question |
| PP1–4, PZ1–4, PSL, comp table 0–127 | pitch error compensation | `[AXIS_*] COMP_FILE` (only if populated) |
| TH0–TH6 | thermal comp coefficients | record only |
| AF1–AF4 | index table angle/M-code/pallet bits | 4th-axis config, if fitted |
| AT1 | external speed distance before 2nd-zero-point return | remap approach-feed heuristic |
| DPD/DPE/DPF | DNC timers, machine number | record only |

## Setting increments and ranges (from the same manual, pages 6-33 to 6-35)

OCR'd 2026-08-17. **Units are the thing this table adds** — the mapping above
says what each address means, not what its counts are worth, and the control
runs in **inch mode**, so a raw value is meaningless without its increment.

| Address | Setting increment | Range | Description as printed |
|---|---|---|---|
| `LX/LY/LZ 1–4` | 0.0001″ / 0.001 mm | — | Soft limit |
| `ZP1–4` | 0.0001″ / 0.001 mm | — | Machine zero point coordinate (set at zero return) |
| `RP1–4` | 0.0001″ / 0.001 mm | — | 2nd zero point coordinate |
| `ZS1–4` | 0.0001″ / 0.001 mm | 0 – 99999 | **Zero point shift value** |
| `ZC1–4` | 0.1″/min / 1 mm/min | 0 – 500 | Dog-type zero return creep speed (after deceleration) |
| `ZD1–4` | — | — | Zero return direction |
| `RF1–4` | 0.1″/min / 1 mm/min | — | Rapid traverse speed |
| `RT1–4` | 1 msec | 0 – 9999 | Rapid traverse time constant |
| `SFC` | 0.1″/min / 1 mm/min | 0 – 6000 | Cutting feed clamp speed |
| `STC` | 1 msec | — | Cutting feed time constant |
| `BL1–4` | 0.001 mm | 0 – 999 | Backlash compensation (G00) |
| `MD1–4` | 0.001 mm | 0 – 65535 | Backlash compensation (G01) |
| `MC1–4` | coded | 0–7 | Servo coefficient / **linear zone**: 0 = 16000, 2 = 8000, 5 = 64000, 6 = 128000 (OCR partially garbled — re-read before use) |
| `MA1–4` | bitfield | — | Axis type (0 linear / 1 rotary), motor rotating direction, backlash initial direction (0 = −, 1 = +) |
| `AF1` | — | — | Min. index angle of index table |
| `AF2` | — | 0 – 999 | Index M code |
| `AF4` | bitfield | — | Pallet count/state bits; index-on-repeat-angle behaviour |
| `AT1` | 0.0001″ / 0.001 mm | 0 – 65530 | External speed distance (approach before 2nd zero point return) |
| `GH/GL`, `SPI`, `SPO`, `GYN`, `EX2` | 1 rpm / 1 step | — | Gear shift speeds, spindle indexing speed, gear-change coefficient, number of gear steps, manual speed step |

**Note the backlash split is also a unit trap:** `BL` and `MD` are **0.001 mm**
even in inch mode, while positions are 0.0001″. Do not convert one with the
other's factor.

### `MC1–MC4` carry the control τ number — decode them

**`MC` is a packed 16-bit word, not a scalar.** The manual's `MC1` row (printed
p. 6-35) draws the bit field explicitly:

```
F E D C B A 9 8 | 7 6 5 4 3 2 1 0
└─ LINEAR ZONE ─┘ └───  τ × 8  ──┘
LINEAR ZONE codes:  0:16000  1:4000   2:8000    3:16000
                    4:32000  5:64000  6:128000  7:16000
```

This machine reads **`MC1 = MC2 = MC3 = 784`** on the 1985 factory sheet *and*
on the 2026-07-28 live CRT — 41 years apart, in agreement:

```
784 decimal = 0x0310
  high byte 0x03 -> LINEAR ZONE code 3 = 16000
  low  byte 0x10 = 16 = τ × 8   ->   τ = 2.000   (X, Y and Z alike)
```

A hex reading of the displayed digits (`0x784`) would give LINEAR ZONE 7 and
τ = 16.5 — a non-integer grid, so the decimal reading is the right one.

**τ = 2 gives grid spacing = 4000/τ = 2.000 mm**, which is the resolver scale
the retrofit needs. See
[`../docs/resolver_commissioning.md`](../docs/resolver_commissioning.md#pole-count-and-resolver-scale-derived-from-τ).

> **Why a text search misses this, and the lesson.** τ is printed as a Greek
> letter *inside a figure*. Full-text OCR of all 48 pages renders it as `I` or
> noise, so grepping the OCR for `tau`/`grid`/`detector`/`resolver`/`pole`
> returns **zero hits** — and a session did exactly that on 2026-08-17 and
> reported "τ is not in the parameter book". It is. **In this document set,
> a grep miss is not evidence of absence: render the page and look at it.**

## Recovery procedure

**Primary — read the live control.** The M-2 still powers up (plan of record
keeps it intact until the retrofit starts). Operator manual p.33-34: softkey
display menu includes **PARAMETER**. Photograph **every page** of the
PARAMETER screens (machining coefficient 1/2/3), plus the DIAGNOSIS and TOOL
DATA screens while there. Do this **before any teardown** — the parameters
live in battery-backed CMOS and are lost if the battery or boards are
disturbed. Transcribe into a new `docs/parameters_sn060231.md` with a
photo-per-page appendix.

**Fallback — measure during commissioning** (if the control is already dead):

1. Home LinuxCNC with temporary conservative soft limits.
2. Orient the spindle (mazak_orient), open the cover, index the magazine to an
   empty pocket.
3. Jog Z (and Y if the gripper alignment calls for it) until the spindle
   gripper/pocket alignment matches the maintenance-manual gripper adjustment
   procedure (maintenance.pdf p.48: "No.2 zero point (ATC location)", 0.5 mm
   Y-clearance spec).
4. Record machine coordinates → `[ATC]` INI values; verify with a dry M6 at
   10% rapid, tool detect sensors watched in halscope.

The gear breakpoints (GH/GL) and backlash have no fallback other than test
cuts / dial-indicator measurement — capture the screens if at all possible.
