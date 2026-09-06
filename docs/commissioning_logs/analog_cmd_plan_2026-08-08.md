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

> **Pin numbers CONFIRMED 2026-09-05** against `docs/Mesa Manuals/7i49man.pdf` V1.2,
> pp. 5–7 (terminal-block tables) and the board photo on p. 3. **Correction to the
> original note:** P2/P3/P4 are **not** 50-pin connectors — they are three 24-pin
> 3.5 mm pluggable Phoenix-style screw-terminal blocks. The only 50-pin connector on
> the 7i49 is the controller header (J1/P1) that rides the ribbon to the 7i80HDT; it
> carries PWM/enable/SPI signals and has no analog or resolver terminals on it.
> Board orientation (p. 2–3): with the 50-pin controller header on the **left**,
> P2 is nearest it, P3 is in the middle, P4 is at the right-hand board edge.
> On every block **pin 1 is at the bottom, pin 24 at the top.**

### Physical block cross-reference — what lands on each terminal block

Each block carries **two channels** (resolver + enable + analog out for each). Because
AOUT follows OEM drive-wiring order (X/Z/Y) while resolvers follow axis order (X/Y/Z),
**only X has its resolver and its command on the same block.** Y's resolver is on P4
but its command is on P3; Z's resolver is on P3 but its command is on P4. Dress the
cables accordingly — one axis is not one block.

| Block | Pins 1–8 (RESSIN/RESCOS/RESDRV ±, GND) | Pins 9–16 | Pin 19 / **20** | Pin 23 / **24** |
|---|---|---|---|---|
| **P4** (right edge) | RES0 = **X resolver** | RES1 = **Y resolver** | GND0 / **AOUT0 = X cmd** | GND1 / **AOUT1 = Z cmd** |
| **P3** (middle) | RES2 = **Z resolver** | RES3 spare | GND2 / **AOUT2 = Y cmd** | GND3 / **AOUT3 = spindle** |
| **P2** (next to header) | RES4 spare | RES5 spare | GND4 / AOUT4 spare | GND5 / AOUT5 spare |

Pins 17–18 and 21–22 on each block are the opto-isolated ENAn−/ENAn+ enable outputs
(36 VDC / 10 mA max, all six switch together — manual p. 12). Not used in this
project; drive enables live on 7i84U-B.

Each resolver channel's 8 pins, in order (manual pp. 5–7): RESSINn−, RESSINn+,
RESCOSn−, RESCOSn+, GND, RESDRVn−, RESDRVn+, GND. Wire each pair as its own shielded
twisted pair, shield terminated at the 7i49 end only (p. 9).

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

- [x] Confirm actual 7i49 connector pin numbers from the physical board against the manual.
      **Done 2026-09-05** from `7i49man.pdf` pp. 5–7 — every P4/P3/P2 pin number in the
      table above matches the manual exactly. The `connector` column in
      `mesa/current_pin_authority.csv` (which wrongly said `P1 Analog TB` /
      `P1 Resolver channel` for all twelve rows) was corrected in the same commit.
      Still open: a photo of the physical card confirming the silkscreen matches V1.2.
- [ ] Record FR-SX terminal labels (VG, STF/STR or FWD/REV, etc.) and confirm command mode.
- [ ] Verify servo amp ±10 V input terminal labels for X, Y, Z from cabinet photos.
- [ ] Measure actual analog output polarity/scale in LinuxCNC with drives disabled and
      record in `docs/servo_commissioning.md` before enabling motion.
- [ ] Update `mesa/current_pin_authority.csv` with the confirmed AOUT0–AOUT3 net assignments
      and regenerate `io-dashboard/data.js`.
