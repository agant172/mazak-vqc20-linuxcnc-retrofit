# M-2 Parameter Recovery — ZP2/ATC positions and machine constants

**Machine:** Mazak VQC 20/40, SN 060231 (Mazatrol M-2)
**Status:** OPEN — values must be read from the live control or measured
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
| MA1–4, MC1–4 | servo constant bits, servo coefficient | record only — informs 7i97T PID + resolver scaling sanity checks |
| GH1–4, GL1–4 | gear up/down-shift rpm breakpoints | `mazak_orient` gear-select thresholds (currently `setp gear-range.in1 800` placeholder) |
| SPI | spindle indexing (orient) speed | FR-SX orient config cross-check |
| SPO, GYN | gear-change speed coefficient, number of gear steps | confirms 2-speed gearbox config |
| MP8–MPB | linear-scale low-speed gain X/Y/Z/4 | evidence for/against the Y-axis Magnescale question |
| PP1–4, PZ1–4, PSL, comp table 0–127 | pitch error compensation | `[AXIS_*] COMP_FILE` (only if populated) |
| TH0–TH6 | thermal comp coefficients | record only |
| AF1–AF4 | index table angle/M-code/pallet bits | 4th-axis config, if fitted |
| AT1 | external speed distance before 2nd-zero-point return | remap approach-feed heuristic |
| DPD/DPE/DPF | DNC timers, machine number | record only |

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
