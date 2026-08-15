# 7i49 Analog Command Channel Plan

**Machine:** Mazak VQC 20/40, SN 060231  
**Date:** 2026-08-08  
**Author:** AI-assisted planning note — verify against `mesa/current_pin_authority.csv` before wiring  
**Status:** Pre-commissioning plan; no field measurements taken

---

## Purpose

Records the agreed assignment of all six 7i49 ±10 V analog output channels (AOUT0–AOUT5)
for servo velocity commands and spindle speed command. Supersedes any earlier note that
incorrectly described the connector/pin groupings or omitted channels 4 and 5.

---

## Channel Map

| AOUT ch | Circuit | HAL signal (placeholder) | 7i49 connector | + pin | − / GND pin | Notes |
|---|---|---|---|---|---|---|
| AOUT0 | X axis velocity command | `x-vel-cmd` | P4 | 20 | 19 | Drives X servo amp ±10 V input |
| AOUT1 | Z axis velocity command | `z-vel-cmd` | P4 | 24 | 23 | Drives Z servo amp ±10 V input |
| AOUT2 | Y axis velocity command | `y-vel-cmd` | P3 | 20 | 19 | Drives Y servo amp ±10 V input |
| AOUT3 | FR-SX spindle speed command | `spindle-vel-cmd` | P3 | 24 | 23 | 0–10 V or ±10 V — verify FR-SX wiring mode at commissioning |
| AOUT4 | Spare | — | P2 | 20 | 19 | Reserve; do not wire until a device is assigned |
| AOUT5 | Spare | — | P2 | 24 | 23 | Reserve; do not wire until a device is assigned |

> **Pin numbers** are from the Mesa 7i49 manual 50-pin header layout (P2/P3/P4 = the three
> 50-pin connectors on the 7i49). Verify against the actual manual page before cutting
> any wires — pin numbering direction depends on connector orientation on the board.

---

## Axis Order Rationale

The X/Z/Y ordering on AOUT0/1/2 (not X/Y/Z) follows the OEM Mazatrol M-2 drive-wiring
convention observed in the electrical schematic and confirmed in `docs/photo_survey_misc.md`.
Z is on AOUT1 / P4 (not AOUT2 / P3) because Z and X share the P4 connector, keeping both
high-usage servo channels on one cable run to the servo rack.

---

## FR-SX Spindle Notes

- FR-SX orient is **not** done via AOUT3. Orient command uses discrete output `ORCM1.M`
  (Y093, 7i84U field output) and orient arrival is sensed via `ORA1` (X003, 7i84U input).
- Verify whether the FR-SX expects 0–10 V (unipolar, direction via discrete) or ±10 V
  (bipolar, direction via sign). Record the FR-SX terminal labels and jumper/parameter
  setting in `docs/servo_commissioning.md` before wiring AOUT3.
- Spindle speed scaling: `setp hm2_7i80.0.7i49.0.aout.3.scalemax [SPINDLE]MAX_RPM_VOLTAGE`
  (placeholder — set actual value from FR-SX VG terminal spec).

---

## W2 Jumper — Do Not Use for X/Y/Z

The 7i49 W2 jumper halves the resolver reference drive voltage, but **only affects
channels 3/4/5** (per the 7i49 manual). X/Y/Z live on channels 0/1/2 and are unaffected
by W2. If resolver return amplitude is low on X/Y/Z, escalate to Mesa (PCW) — do not
fit W2 as a remedy. See `README.md` commissioning notes.

---

## Open Items Before Wiring

- [ ] Confirm actual 7i49 connector pin numbers from the physical board against the manual.
- [ ] Record FR-SX terminal labels (VG, STF/STR or FWD/REV, etc.) and confirm command mode.
- [ ] Verify servo amp ±10 V input terminal labels for X, Y, Z from cabinet photos.
- [ ] Measure actual analog output polarity/scale in LinuxCNC with drives disabled and
      record in `docs/servo_commissioning.md` before enabling motion.
- [ ] Update `mesa/current_pin_authority.csv` with the confirmed AOUT0–AOUT3 net assignments
      and regenerate `io-dashboard/data.js`.
