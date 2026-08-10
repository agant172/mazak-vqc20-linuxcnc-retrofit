# Homing / zero-return ladder logic — from YM2V39L

**Machine:** Mazak VQC-20/40 SN 060231 (Mazatrol M-2)
**Source:** `YM2V39L.pdf` / `VQC20-40_060231_Ladder_Diagrams.pdf`, drawing 4136081801.
**Extracted:** 2026-08-10. Cross-ref `SSLL` = sheet·line; PDF page = sheet + 1.
**Purpose:** inform the LinuxCNC `[JOINT_*] HOME_*` config and homing method.

## Key finding — zero return is NC/resolver-managed, not PLC-sequenced

The PLC ladder does **not** run the reference-return *motion*. There is no
"home the axis" state machine in the ladder — the **NC unit performs the
resolver-referenced zero-return move itself**, and the PLC only:
1. reads the per-axis **reference-position detection** inputs, and
2. reports **zero-position status** back to the NC and panel.

This matches the M-2 design (absolute-within-one-rev resolver + grid), and it
tells the retrofit: **homing is a servo/feedback function (7i49 + resolver), not
a ladder function** — reproduce it in LinuxCNC's homing, not in ClassicLadder.

## Signals

| Addr | Symbol | Meaning |
|---|---|---|
| X100 / X101 / X102 | ZPX1.N / ZPY1.N / ZPZ1.N | **ZERO 1 POSITION** X/Y/Z (reference pt 1 detection) |
| X103 | ZP41.N | ZERO 1 POSITION 4th |
| X108 / X109 / X10A | ZPX2.N / ZPY2.N / ZPZ2.N | **ZERO 2 POSITION** X/Y/Z (2nd reference = ATC area) |
| Y080 / Y081 / Y082 | ZPX.M / ZPY.M / ZPZ.M | X/Y/Z zero-position **status** out |
| Y116 | AZP.N | ALL AXIS ZERO POSITION |
| Y19A | ZP.B.N | REF. 1 RETURN ALL AXIS (command bit) |
| Y1CA | ZP.L | all-axis zero-return **lamp** |
| M150 | REFME | all-axis reference memory (+ E-stop, sheet 60) |

## Rungs

**Sheet 46 lines 12/14/16 (4613/4615/4617, PDF p47) — per-axis status:**
`ZPX.M`(Y080) = `ZPX1.N`(X100); `ZPY.M`(Y081) = `ZPY1.N`(X101); `ZPZ.M`(Y082) =
`ZPZ1.N`(X102). A direct pass-through — the "zero 1 position" *input* becomes the
"zero position" *status* output.

**Sheet 49 line 1 (4901, PDF p50) — all-axis:**
`AZP.N`(Y116) = `ZPX1.N · ZPY1.N · ZPZ1.N · ZP41.N` — all four axes at ref pt 1.

**Sheet 60 line 2 (6002, PDF p61) — referenced + safe:**
`REFME`(M150) = `ZPX1.N · ZPY1.N · ZPZ1.N · ZP41.N · *ESP.M` — same as AZP.N but
also requires E-stop healthy, so **E-stop clears REFME → the machine treats
itself un-referenced** (see `estop_ladder_transcription.md`).

## Two reference points

- **Zero 1** (ZPX1/ZPY1/ZPZ1, X100-102) = the **machine home / reference point**.
- **Zero 2** (ZPX2/ZPY2/ZPZ2, X108-10A) = the **2nd zero point = ATC exchange
  position** (the `RP` params: RP2 = +9.5000 Y, RP3 = −5.9055 Z — see
  `parameters_sn060231.md`). Used by the ATC, not by normal homing.

## Retrofit — LinuxCNC homing config

- **Home on the resolver (7i49), not on the ladder.** LinuxCNC closes the position
  loop on the resolver; homing uses `HOME_SEARCH_VEL` / `HOME_LATCH_VEL` against a
  home reference. The OEM **"ZERO 1 POSITION" inputs (X100-102)** are the OEM home
  detectors — candidate LinuxCNC **home switches** if wired to a 7i84U input;
  otherwise home on resolver position + a coarse switch.
- **Apply the captured M-2 params** (`parameters_sn060231.md`): machine zero =
  zero-return position (`ZP` all 0 → `HOME = 0`); `ZC` creep = 79 (raw, ~7.9 ipm →
  `HOME_FINAL_VEL`/`HOME_LATCH_VEL` starting point); `ZD` direction bits
  (ZD1=0, ZD2=1, ZD3=1 → sign of `HOME_SEARCH_VEL` per axis); `ZS` grid shift = 0.
- **E-stop invalidates homed state** (REFME cleared by `*ESP.M`) → set LinuxCNC to
  require re-home after E-stop (don't trust `is-homed` through an E-stop).
- **Zero-2 (ATC) is separate** — that's the `[ATC]`/`mazak_atc_zone` Y-limit work
  (`y_soft_limit_atc_zone.md`), not the homing move.
