# Element List ↔ I/O Dashboard Cross-Walk

**Machine:** Mazak VQC 20/40, SN 060231 (Mazatrol M-2, ladder YM2V39L)
**Sources:** `VQC20-40_060231_Element_List.csv` (385 signals) vs `io-dashboard/data.js` @ commit 884bf05 (116 signals, generated from `mesa/current_pin_authority.csv`)
**Date:** 2026-07-27 · Closes open item #10 in `servo_amp_analysis.pdf`

Full row-by-row detail: `element_dashboard_crosswalk.csv` (385 rows, one per PLC element).

## Headline numbers

| Category | Count | Retrofit disposition |
|---|---|---|
| NC_INTERNAL (`.N`) | 106 | Dies with the M-2 — LinuxCNC provides natively |
| OPTION_VERIFY | 91 | Option packages — verify fitted before wiring anything |
| PANEL_BUTTON (`.B`) | 42 | Physical panel being replaced — LinuxCNC UI / pendant |
| NC_PANEL_INTERFACE | 42 | PLC→NC/M2V handshake (M-BCD, LEDs, ready/reset) — obsolete |
| FIELD_OUTPUT | 38 | Real machine loads — must land on Mesa or be dropped consciously |
| PANEL_LAMP (`.L`) | 33 | LinuxCNC UI candidates |
| FIELD_INPUT | 30 | Real sensors/switches — must land on Mesa |
| UNKNOWN (illegible) | 3 | X02E, X19F, Y032 — re-read ladder PDF if ever referenced |
| **Total** | **385** | |

**Bottom line: only 68 of 385 signals are genuine field wiring.** 46 element-list signals already map to dashboard entries (33 direct, 13 partial). **26 field-wired signals (20 unique functions after M2V-twin dedup) have no dashboard/authority row.**

## Critical gaps — wire these or nothing works

| Priority | PLC addr | Symbol | Function | Suggested landing |
|---|---|---|---|---|
| Power-up | Y040/Y096 | HYD.M | Hydraulic + head-lube pump contactor | 7i84U spare OUT — required before tool clamp, gears, or ATC do anything (system 70, PRS SPS-8T 16/10 kg/cm²) |
| Power-up | X073 | THR.M | Motor thermal trip (alarm chain) | 7i84U spare IN |
| Power-up | X07B | ONT.M | Main transformer overheat | 7i84U spare IN (can series with THR if inputs run short) |
| Power-up | X078 | MPWS.M | Machine power supply monitor | 7i84U spare IN or drop (function absorbed by new PSU monitoring) |
| First tool change | X003 | ORA1 | Spindle orient arrival (FR-SX) | 7i84U spare IN — ATC cannot cycle without orient |
| First tool change | Y093 | ORCM1.M | Spindle orient command (FR-SX) | 7i84U spare OUT |
| First tool change | Y094 | CTL.M | Low-gear orient assist | 7i84U spare OUT — check ladder 28xx–29xx whether required in high gear |
| First tool change | X052/X053 | MGCORS/MGCCRS | Magazine cover open/close position | 7i84U spare INs — dashboard has cover *solenoid outputs* but no position feedback |
| First tool change | Y095 | TCME.M | ATC barrier expand | 7i84U spare OUT — verify device exists on this machine |
| Setup QoL | X01A/X01B | TUCFS/TCFS | Manual tool clamp/unclamp switches at head | 7i84U spare INs — very useful during commissioning |
| Optional | Y022/Y092 | SSET.M | Spindle set | Check ladder — may pair with orient sequence |
| Optional | Y091 | OTR.M | Overtravel reverse (OT release) | LinuxCNC handles OT recovery natively — likely drop |
| Optional | Y012 | THC.M | Through-hole coolant | Only if TSC hardware fitted |
| Optional | Y023–Y025 | M43T/M44T/M45T | M43–M45 discrete M-code outputs | Map to spare outputs later via M62–M65 if devices exist |
| Optional | Y03E | AL77.78 | Alarm 77/78 output | Fold into ALARM_OUT logic |
| Optional | X02F | INHRLS | Inhibit read LS | Identify device in electrical p.133–137 before deciding |

**Spare budget check:** 9 gap inputs vs 6 spare 7i84U inputs; ~8 gap outputs vs 6 spare outputs (3× 7i84U + 3× TB5 SSR). Tight but workable if you drop OTR/MPWS and series the thermal alarms — otherwise the dashboard's `SECOND_SSERIAL_CARD` review item becomes real.

## Partial matches needing a decision

| PLC addr | Symbol | Dashboard row | Issue |
|---|---|---|---|
| X001 | SZS.M | SPINDLE_AT_SPEED | SZS is FR-SX **zero-speed**, not speed-reach — these are two different FR-SX outputs; wire both (gear shift needs zero-speed, feed-hold release needs at-speed) |
| X002 | FA | SPINDLE_FAULT | FA = controller **normal** — inverted sense vs fault input |
| X01D | ITMDSS.M | NET_DOOR_CLOSED | Second door switch — series with LS-141/140 or separate input |
| X042/X079/X07A | HLP2/HLP/WLAL | NET_LUBE_OK / LUBE_LEVEL | Three lube devices (2× head-lube pressure, 1× way-lube warning) vs two dashboard rows — map explicitly at commissioning |
| Y011 | FCL | COOLANT_ON | Flood **valve** is a separate load from the pump motor (Y010) — may need its own output |
| Y018 | SAB | AIR_BLAST | Verify SOL-62 is the spindle air blast (parts list pp.85–91) |
| Y035 | A-JET | TOUCH_SENSOR_BLAST | Verify SOL-35 is the MMS touch-sensor air jet |
| X03F | SKIP1.M | NET_PROBE_IN | MP-3 probe skip path — route to 7i97T probe input, latency matters |

## Option packages (91 signals — verify before wiring)

| Package | Signals | Evidence |
|---|---|---|
| Pallet changer (2PC) | 17 | Electrical pp.250–298 include 2PC sequence drawings — physically check machine |
| External interlock / servo-off | 15 | Robot/cell interface — drop |
| External/remote operation | 14 | Remote pushbutton box interface — drop unless wanted |
| 4th-axis rotary table | 12 | NC table option (electrical pp.152–153) — verify fitted |
| MMS probe | 8 | **Renishaw MP-3 in parts list pp.273–274 — likely fitted, keep** |
| Measuring arm | 8 | Tool-length arm — verify presence |
| NC features (EIA/mirror/etc.) | 8 | LinuxCNC-native or obsolete |
| FMS interface | 7 | X1D2–X1E0 — not fitted, drop |
| VQC30 variant | 2 | Other machine — ignore |

## Dashboard rows with no PLC ancestry (74) — expected, plus cleanup items

Most are new-architecture signals the M-2 never saw as PLC I/O: resolvers/encoders (7i49), analog axis/spindle commands, drive enables & faults, SSERIAL link, power rows, spares, Z brake (was amp-internal), ATC zone switches PRS-55/66 (were NC-side), HYD_PRESS_OK (was hard-wired into the ready chain, not a PLC input).

**Duplicate clusters to clean in `current_pin_authority.csv` / orphan nets** (same physical device, two dashboard rows):
- MAG_BCD_BIT0–4 ↔ NET_TOOL_CODE_0–4 (PRS-21…25)
- ATC_FWD/ATC_REV ↔ NET_MAG_CW_SOL/NET_MAG_CCW_SOL (SOL-8A/8B)
- SPINDLE_AT_SPEED ↔ NET_SPINDLE_AT_SPD
- DOOR_INTERLOCK ↔ NET_DOOR_CLOSED
- TAP_COOLANT_BLAST (SOL-61) ↔ NET_TAP_COOLANT

## Suggested next actions

1. Resolve the spare-budget question: decide drops (OTR, MPWS) and series-able alarms (THR+ONT), then assign the ~17 keeper gaps to specific 7i84U/TB5 pins and regenerate `data.js`.
2. Physically verify option packages (pallet changer, 4th axis, measuring arm) — 45 of the 91 option signals disappear if none are fitted.
3. Transcribe ladder rungs for orient (28xx–29xx) and ATC (32xx) to confirm ORCM1/CTL/SSET sequencing before writing the ATC HAL component.
4. Merge the 5 duplicate clusters in the authority CSV so the dashboard shows one row per physical device.
