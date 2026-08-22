# Reconciled Pin Crosswalk — Mazak VQC 20/40 LinuxCNC Retrofit

**Date:** 2026-08-18

**Sources merged:**
- Codex Manual Read (`plane_a_bbia1_pin_crosswalk.csv`, `plane_b_pin_crosswalk.csv`, `interface_plane_crosswalk.md`)
- Prior `mesa/current_pin_authority.csv` + BBIA pinouts
- Continuity notes from both efforts

**Authority rule:** Codex two-plane model is the primary structure. Only rows without `HOLD_*` / `FIELD_TRACE` / `CANDIDATE` may be landed after continuity and polarity proof.

> Recovered from Notion (page was migrated there and never committed to this repo). Original Notion note: "This file supersedes earlier selective crosswalks for installation planning."

---

## PLANE B — Direct CNA Paths (Resolvers + Axis Commands)

### X / Y / Z Resolvers (Tamagawa TS2014N → 7i49)

| Signal | OEM | Lead | 7i49 Terminal | Status | Action |
|---|---|---|---|---|---|
| X SIN+ | CNA3-12 | A | P4-2 RESSIN0+ | PROPOSED_PHASE_VERIFY | Confirm polarity open-loop, drives disabled |
| X SIN− | CNA3-13 | B | P4-1 RESSIN0− | PROPOSED_PHASE_VERIFY | |
| X COS+ | CNA3-14 | F | P4-4 RESCOS0+ | PROPOSED_PHASE_VERIFY | Scope phase |
| X COS− | CNA3-15 | G | P4-3 RESCOS0− | PROPOSED_PHASE_VERIFY | |
| X DRV+ | CNA3-16 | H | P4-7 RESDRV0+ | PROPOSED_PHASE_VERIFY | 7i49 sole excitation source |
| X DRV− | CNA3-17 | J | P4-6 RESDRV0− | PROPOSED_PHASE_VERIFY | |
| Y pair | CNA4 (same pins) | — | RES1 | PROPOSED_PHASE_VERIFY | Same mapping |
| Z pair | CNA5 (same pins) | — | RES2 | PROPOSED_PHASE_VERIFY | Same mapping |

**Polarity convention:** First pin/lead in each OEM pair → 7i49 `+`. This is a retrofit choice, not factory fact. Swap only via reviewed change.

### Axis Velocity Commands

| Signal | OEM Landing | 7i49 | Status | Action |
|---|---|---|---|---|
| X_AXIS_CMD | TBD (old NC harness) | AOUT0 | **HOLD_SOURCE_TRACE** | Ring out removed NC command pair to DK-427 X input |
| Y_AXIS_CMD | TBD | AOUT2 | **HOLD_SOURCE_TRACE** | Same for Y |
| Z_AXIS_CMD | TBD | AOUT1 | **HOLD_SOURCE_TRACE** | Same for Z |

---

## PLANE A — BBIA-1 Honda Connectors

### Homes & Limits (7i84U-B)

| Signal | BBIA Pin | Wire | Mesa | Status |
|---|---|---|---|---|
| X_HOME | CN2-15 | *DECX | TB3 IN6 | MESA_ROUTE |
| Y_HOME | CN2-16 | *DECY | TB3 IN7 | MESA_ROUTE |
| Z_HOME | CN1-14 | *DECZ | TB3 IN8 | MESA_ROUTE |
| Y_LIMIT_PLUS | CN3-37 | +LY | TB3 IN2 | MESA_ROUTE |
| Z_LIMIT_MINUS | CN3-38 | −LZ | TB3 IN5 | MESA_ROUTE |
| X_LIMIT_PLUS | — | — | TB3 IN0 | **FIELD_TRACE** |
| X_LIMIT_MINUS | — | — | TB3 IN1 | **FIELD_TRACE** |
| Y_LIMIT_MINUS | — | — | TB3 IN3 | **FIELD_TRACE** |
| Z_LIMIT_PLUS | — | — | TB3 IN4 | **FIELD_TRACE** |

### ATC / Magazine / Tool

| Signal | BBIA Pin | Wire | Mesa | Status |
|---|---|---|---|---|
| ATC_ZONE_Y | CN3-44 | +LY2 | 7i84U-A TB3 IN0 | MESA_ROUTE |
| ATC_ZONE_Z | CN3-39 | −LZ2 | 7i84U-A TB3 IN1 | MESA_ROUTE |
| MAG_TOOL_AVAILABLE | CN2-13 | 381 | 7i84U-A TB3 IN2 | MESA_ROUTE |
| SPINDLE_TOOL_AVAILABLE | CN6-50 | 382 | 7i84U-A TB3 IN3 | MESA_ROUTE |
| MAG_COVER_OPEN_CONF | CN2-11 | 218 | 7i84U-A TB3 IN6 | MESA_ROUTE |
| MAG_COVER_CLOSE_CONF | CN2-12 | 219 | 7i84U-A TB3 IN7 | MESA_ROUTE |
| MAG_BCD_BIT0 | CN2-4 | 150 | 7i84U-A TB2 IN19 | MESA_ROUTE |
| MAG_BCD_BIT1 | CN2-5 | 221 | 7i84U-A TB2 IN20 | MESA_ROUTE |
| MAG_BCD_BIT2 | CN2-6 | 222 | 7i84U-A TB2 IN21 | MESA_ROUTE |
| MAG_BCD_BIT3 | CN2-7 | 223 | 7i84U-A TB2 IN22 | MESA_ROUTE |
| MAG_BCD_BIT4 | CN2-8 | 224 | 7i84U-A TB2 IN23 | MESA_ROUTE |
| MAG_IN_POS | CN2-9 | 225 | 7i84U-A TB2 IN28 | MESA_ROUTE |
| TOOL_CLAMP_CONF | CN1-2 | 209 | 7i84U-A TB3 IN15 | MESA_ROUTE |
| TOOL_UNCLAMP_CONF | CN1-1 | 208 | 7i84U-A TB2 IN16 | MESA_ROUTE |
| TOOL_UNCLAMP_SOL | CN11-3 | 710 | 7i84U-A TB2 OUT10 | MESA_ROUTE |
| MANUAL_TOOL_UNCLAMP_PB | CN2-3 | 149 | 7i84U-A TB3 IN9 | MESA_ROUTE |
| MANUAL_TOOL_CLAMP_PB | CN2-44 | 149B | 7i84U-A TB2 IN30 | MESA_ROUTE |

### Spindle Discrete + Analog

| Signal | BBIA Pin | Wire | Mesa | Status | Notes |
|---|---|---|---|---|---|
| SPINDLE_ZERO_SPEED | CN4-1 | 231 | 7i84U-A TB3 IN5 | MESA_ROUTE | |
| SPINDLE_FAULT | CN4-3 | FA | 7i84U-A TB3 IN14 | MESA_ROUTE | |
| SPINDLE_FWD | CN4-9 | SRN | 7i84U-A TB3 OUT0 | MESA_ROUTE | Parallel CN3-11 |
| SPINDLE_REV | CN4-10 | SRI | 7i84U-A TB3 OUT1 | MESA_ROUTE | Parallel CN3-12 |
| SPINDLE_ORIENT_CMD | CN3-14 | ORI C1 | 7i84U-A TB3 OUT4 | MESA_ROUTE | |
| SPINDLE_ORIENT_LOGEAR | CN3-15 | CTL | 7i84U-A TB3 OUT5 | MESA_ROUTE | |
| SPINDLE_ORIENT_ARRIVAL | CN4-16 | SETA | 7i84U-A TB3 IN4 | MESA_ROUTE | Verify ORA1 polarity |
| **SPINDLE_SPEED_SE1** | **CN4-18** | SE1 | 7i49 AOUT3/GND3 | **HOLD_ANALOG_ROLE** | Determine command vs common |
| **SPINDLE_SPEED_SE2** | **CN4-19** | SE2 | 7i49 AOUT3/GND3 | **HOLD_ANALOG_ROLE** | |
| **SPINDLE_SPEED_SE3** | **CN4-20** | SE3 | TBD | **HOLD** | Possibly shield/common |

### Gear / Coolant / Hydraulic / Safety / Misc

| Signal | BBIA Pin | Wire | Mesa | Status |
|---|---|---|---|---|
| GEAR_HI_CONF | CN1-3 | 210 | 7i84U-A TB2 IN17 | MESA_ROUTE |
| GEAR_LO_CONF | CN1-4 | 212 | 7i84U-A TB2 IN18 | MESA_ROUTE |
| GEAR_HI_SOL | CN11-4 | 712 | 7i84U-A TB3 OUT7 | MESA_ROUTE |
| GEAR_LO_SOL | CN11-5 | 213 | 7i84U-A TB2 OUT8 | MESA_ROUTE |
| HYD_PUMP_ON | CN11-16 | 235 | 7i84U-A TB3 OUT3 | MESA_ROUTE |
| COOLANT_ON | CN11-15 | 236 | 7i84U-A TB2 OUT11 | MESA_ROUTE |
| FLOOD_VALVE | CN11-13 | 231 | 7i84U-B TB3 OUT7 | MESA_ROUTE |
| AIR_BLAST | CN11-6 | 215 | 7i84U-B TB3 OUT3 | MESA_ROUTE |
| WORK_AIR_BLAST | CN11-7 | 216 | 7i84U-B TB3 OUT4 | MESA_ROUTE |
| LUBE_OK | CN6-39 | 355 | 7i84U-A TB2 IN25 | MESA_ROUTE |
| COOLANT_LOW | CN1-5 | 232 | 7i84U-A TB2 IN26 | MESA_ROUTE |
| DOOR_INTERLOCK | CN2-38 | 238 | 7i84U-A TB2 IN24 | MESA_ROUTE |
| THERMAL_ALARM_CHAIN | CN5-1 | 144 | 7i84U-A TB3 IN8 | MESA_ROUTE |
| SERVO_READY | CN6-7 | SA | 7i84U-A TB2 IN31 | MESA_ROUTE |
| SERVO_FAULT | CN6-27 | SER | 7i84U-A TB3 IN10 | MESA_ROUTE |
| WORK_LIGHT | CN6-8 | WL | 7i84U-B TB2 OUT9 | MESA_ROUTE |
| PROBE (Renishaw) | CN200-3 | MMS SKIP | 7i84U-B TB3 IN15 | **CANDIDATE** |

### New Signals (not original BBIA pass-through)

| Signal | Mesa | Status | Notes |
|---|---|---|---|
| X_DRIVE_ENABLE | 7i84U-B TB3 OUT0 | NEW | Interposing relay → DK-427 ENA |
| Y_DRIVE_ENABLE | 7i84U-B TB3 OUT1 | NEW | Interposing relay → DK-427 ENA |
| Z_DRIVE_ENABLE | 7i84U-B TB3 OUT2 | NEW | Interposing relay → DK-427 ENA |
| SPINDLE_ENABLE | HAL logical | NEW | Combined gate, not a physical wire |

---

## Highest Priority Field-Trace List

1. Locate X+ / X− / Y− / Z+ over-travel limit landings (not shown individually on BBIA drawings).
2. Ring out X/Y/Z analog velocity command pairs from the unplugged NC harness to each DK-427 input; record connector, pins, polarity, shield.
3. Determine electrical role of SE1 vs SE2 on CN4-18/19 (command vs common) before connecting 7i49 AOUT3.
4. Ohmmeter + scope all resolver winding pairs on CNA3/4/5; confirm 7i49 is sole excitation source.
5. Continuity-prove Renishaw MP-3 path to CN200-3 / 7i84U-B IN15.
6. Confirm normal states (NO/NC) and polarity of all limit, home, and interlock inputs.

## Notes

- All 24 V field signals require interposing relays per project rule.
- OEM hardwired E-stop chain remains authoritative and is never routed through Mesa.
- P2 on the 7i80HDT stays empty (bare 3.3 V GPIO — unsafe for 24 V).
- This file supersedes earlier selective crosswalks for installation planning.

**Generated:** 2026-08-18
**File pair:** `reconciled_pin_crosswalk_2026-08-18.csv` + this Markdown
