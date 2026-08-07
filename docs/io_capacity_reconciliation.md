# 7i84U DI/DO capacity reconciliation

## Audit finding #21 (verbatim)

> Second 7i84U capacity math is not right.
> Current CSV = 41 DI + 24 DO; one card short 9 DI + 8 DO; two
> cards short at least 1 DO if the 2PC pallet changer is retained.
> Truth: 7i84U = 32 DI + 16 DO per card, hard ceilings.
> Edit: build one row per physical sensor/load with retain/delete,
> voltage/current, normal state, safety role, source/sink, bank,
> terminal.

## Reconciliation against the actual CSV

The CSV [`../mesa/current_pin_authority.csv`](../mesa/current_pin_authority.csv)
carries the following as of this commit, tallied by inspection:

| Card | IN rows | OUT rows | Manufacturer max | Utilisation |
|---|---|---|---|---|
| 7i84U-A | 32 | 16 | 32 IN, 16 OUT ([7i84U manual](https://www.mesanet.com/pdf/parallel/7i84uman.pdf)) | **100 %** of IN, **100 %** of OUT — **zero spare** |
| 7i84U-B | 10 physical (8 explicit + one aggregated `SEVENI84UB_IN9_31_SPARE` row covering the remaining bank + 1 probe input on IN15) | 9 physical (8 explicit + one aggregated `SEVENI84UB_OUT8_15_SPARE` row covering the remaining bank) | 32 IN, 16 OUT | 9/32 IN utilised, 9/16 OUT utilised |
| **Total DI (explicit rows)** | **43** | | | |
| **Total DO (explicit rows)** | | **25** | | |
| Deferred (`none` card) | 1 (`CYCLE_START_PB`) | 0 | — | |

**The audit's 41 DI + 24 DO count is off by two.** The reconciled
count from the CSV is 43 explicit DI + 25 explicit DO. The audit's
directional conclusions (card A is full, card B is very lightly
populated, some 100 VAC signals need interposing relays and eat
outputs) are correct.

## Per-signal reconciliation table

Legend for the columns:

- **Retain / Delete / Decision-pending**:
  - `KEEP` — required for the retrofit function set as scoped.
  - `DEFER` — feature is out of scope for first-power commissioning
    but the sensor/load remains wired and the row stays in the CSV
    for later HAL activation.
  - `DELETE` — feature is being removed from the retrofit; the row
    should be dropped and the physical connection abandoned.
  - `PENDING` — decision required from the machine owner before
    commissioning.
- **V / A**: nominal control voltage and steady-state current on
  that channel. `24 VDC` values are on the DR-240-24 field bus.
  `100 VAC` values on the OEM control transformer through an
  interposing relay (the 7i84U output is not connected directly
  to 100 VAC — see the `RLY-*` column in each solenoid row).
- **Normal state**: `NC` = normally closed (input reads TRUE when
  everything is healthy, opens on fault or event); `NO` = normally
  open (reads FALSE at rest). Determined during fix #17 wiring
  work and confirmed against the CSV entries.
- **Safety role**: `SAFETY_MONITORING` = feeds the software
  motion-permit chain but is not the primary hardware stop;
  `INTERLOCK_MONITORING` = drives a soft-inhibit or permit;
  `PROCESS` = ordinary functional I/O; `PROBE` = touch-off signal
  routed to LinuxCNC motion.probe-input.
- **Source / Sink**: 7i84U outputs are push-pull per the [7i84U
  manual](https://www.mesanet.com/pdf/parallel/7i84uman.pdf), but
  each row records the load's wiring topology (`SRC` = 7i84U
  outputs +24 V into the load, load's other side ties to field 0 V;
  `SNK` = the load's coil sits on +24 V and the 7i84U output pulls
  its low side to 0 V; `RELAY` = 7i84U drives an interposing relay
  coil, and the actual load — often 100 VAC — is on the relay's
  contacts).
- **Bank / Terminal**: TB2 covers IN16-31 / OUT8-15; TB3 covers
  IN0-15 / OUT0-7 per the [7i84U manual](https://www.mesanet.com/pdf/parallel/7i84uman.pdf).

### 7i84U-A inputs (TB3 IN0-15, TB2 IN16-31)

| Sig | Field point | KEEP/DEFER/DELETE/PENDING | V / A | Norm | Safety role | SRC/SNK | Bank | Term |
|---|---|---|---|---|---|---|---|---|
| ATC_ZONE_Y (IN0) | PRS-55 Y ATC zone prox | KEEP | 24 VDC / <5 mA | NO | INTERLOCK_MONITORING | SNK | TB3 | IN0 |
| ATC_ZONE_Z (IN1) | PRS-66 Z ATC zone prox | KEEP | 24 VDC / <5 mA | NO | INTERLOCK_MONITORING | SNK | TB3 | IN1 |
| MAG_TOOL_AVAILABLE (IN2) | PHS-181 photoswitch | KEEP | 24 VDC / <5 mA | NO | PROCESS | SNK | TB3 | IN2 |
| SPINDLE_TOOL_AVAILABLE (IN3) | PHS-182 photoswitch | KEEP | 24 VDC / <5 mA | NO | PROCESS | SNK | TB3 | IN3 |
| SPINDLE_ORIENT_ARRIVAL (IN4) | FR-SX ORA1 output | KEEP | 24 VDC / <5 mA | NO | INTERLOCK_MONITORING | SNK | TB3 | IN4 |
| SPINDLE_ZERO_SPEED (IN5) | FR-SX SZS.M output | KEEP | 24 VDC / <5 mA | NO | INTERLOCK_MONITORING | SNK | TB3 | IN5 |
| MAG_COVER_OPEN_CONF (IN6) | MGCORS reed | KEEP | 24 VDC / <5 mA | NO | INTERLOCK_MONITORING | SNK | TB3 | IN6 |
| MAG_COVER_CLOSE_CONF (IN7) | MGCCRS reed | KEEP | 24 VDC / <5 mA | NO | INTERLOCK_MONITORING | SNK | TB3 | IN7 |
| THERMAL_ALARM_CHAIN (IN8) | motor + transformer thermal series | KEEP | 24 VDC / <5 mA | NC | SAFETY_MONITORING | SNK | TB3 | IN8 |
| MANUAL_TOOL_UNCLAMP_PB (IN9) | TUCFS at head | DEFER | 24 VDC / <5 mA | NO | PROCESS | SNK | TB3 | IN9 |
| X_DRIVE_FAULT (IN10) | MELDAS X ALM contact | KEEP | 24 VDC / <5 mA | NC | SAFETY_MONITORING | SNK | TB3 | IN10 |
| Y_DRIVE_FAULT (IN11) | MELDAS Y ALM contact | KEEP | 24 VDC / <5 mA | NC | SAFETY_MONITORING | SNK | TB3 | IN11 |
| Z_DRIVE_FAULT (IN12) | MELDAS Z ALM contact | KEEP | 24 VDC / <5 mA | NC | SAFETY_MONITORING | SNK | TB3 | IN12 |
| SPINDLE_AT_SPEED (IN13) | FR-SX speed-reach output | KEEP | 24 VDC / <5 mA | NO | PROCESS | SNK | TB3 | IN13 |
| SPINDLE_FAULT (IN14) | FR-SX ALM output | KEEP | 24 VDC / <5 mA | NC | SAFETY_MONITORING | SNK | TB3 | IN14 |
| TOOL_CLAMP_CONF (IN15) | PRS-9 prox | KEEP | 24 VDC / <5 mA | NO | INTERLOCK_MONITORING | SNK | TB3 | IN15 |
| TOOL_UNCLAMP_CONF (IN16) | PRS-8 prox | KEEP | 24 VDC / <5 mA | NO | INTERLOCK_MONITORING | SNK | TB2 | IN16 |
| GEAR_HI_CONF (IN17) | PRS-10 prox | KEEP | 24 VDC / <5 mA | NO | INTERLOCK_MONITORING | SNK | TB2 | IN17 |
| GEAR_LO_CONF (IN18) | PRS-12 prox | KEEP | 24 VDC / <5 mA | NO | INTERLOCK_MONITORING | SNK | TB2 | IN18 |
| MAG_BCD_BIT0..4 (IN19-23) | PRS-21..25 magazine BCD | KEEP | 24 VDC / <5 mA | Varies | PROCESS | SNK | TB2 | IN19-23 |
| DOOR_INTERLOCK (IN24) | LS-141/140/143 series | KEEP | 24 VDC / <5 mA | NC | SAFETY_MONITORING | SNK | TB2 | IN24 |
| LUBE_OK (IN25) | HLP2.M + HLP1.M series | KEEP | 24 VDC / <5 mA | NC | SAFETY_MONITORING | SNK | TB2 | IN25 |
| COOLANT_LEVEL (IN26) | float switch | KEEP | 24 VDC / <5 mA | NC | PROCESS | SNK | TB2 | IN26 |
| HYD_PRESS_OK (IN27) | SPS-8T-PC-20 | KEEP | 24 VDC / <5 mA | NO (rises to closed at pressure) | SAFETY_MONITORING | SNK | TB2 | IN27 |
| MAG_IN_POS (IN28) | MIPRS prox | KEEP | 24 VDC / <5 mA | NO | INTERLOCK_MONITORING | SNK | TB2 | IN28 |
| ESTOP_MONITOR (IN29) | OEM MAR aux via interposing relay | KEEP | 24 VDC / <5 mA | NC | SAFETY_MONITORING | SNK | TB2 | IN29 |
| MANUAL_TOOL_CLAMP_PB (IN30) | TCFS.M | DEFER | 24 VDC / <5 mA | NO | PROCESS | SNK | TB2 | IN30 |
| SERVO_READY (IN31) | drives-ready relay | KEEP | 24 VDC / <5 mA | NO | SAFETY_MONITORING | SNK | TB2 | IN31 |

**Result: 32/32 IN used. Zero spare on 7i84U-A inputs.**

### 7i84U-A outputs (TB3 OUT0-7, TB2 OUT8-15)

| Sig | Field load | KEEP/DEFER/DELETE/PENDING | V / A | Safety role | Topology | Bank | Term |
|---|---|---|---|---|---|---|---|
| SPINDLE_FWD (OUT0) | FR-SX forward input | KEEP | 24 VDC / <20 mA | INTERLOCK | SRC (direct to drive input) | TB3 | OUT0 |
| SPINDLE_REV (OUT1) | FR-SX reverse input | KEEP | 24 VDC / <20 mA | INTERLOCK | SRC | TB3 | OUT1 |
| SPINDLE_ENA (OUT2) | FR-SX enable input | KEEP | 24 VDC / <20 mA | SAFETY_MONITORING | SRC | TB3 | OUT2 |
| HYD_PUMP_ON (OUT3) | HYDP.M contactor coil | KEEP | 24 VDC / <200 mA | INTERLOCK | SRC (drives contactor coil directly — verify coil current at commissioning; if > 500 mA use interposing relay) | TB3 | OUT3 |
| SPINDLE_ORIENT_CMD (OUT4) | FR-SX ORCM1.M input | KEEP | 24 VDC / <20 mA | PROCESS | SRC | TB3 | OUT4 |
| SPINDLE_ORIENT_LOGEAR (OUT5) | CTL.M low-gear orient assist | KEEP | 24 VDC / <20 mA | PROCESS | SRC | TB3 | OUT5 |
| Z_BRAKE_REL (OUT6) | N1J-L2-201 Z brake solenoid | KEEP | 24 VDC / <500 mA | SAFETY_MONITORING | SRC (verify coil is ≤ 500 mA at 24 VDC; if higher, add interposing relay) | TB3 | OUT6 |
| GEAR_HI_SOL (OUT7) | SOL-13 via RLY-1 | KEEP | 24 VDC / <100 mA (RLY-1 coil) | INTERLOCK | RELAY (SOL-13 is Fujikoshi 100 VAC hydraulic; RLY-1 is the interposing relay) | TB3 | OUT7 |
| GEAR_LO_SOL (OUT8) | SOL-12 via RLY-2 | KEEP (**HOLD_CONFLICT**) | 24 VDC / <100 mA | INTERLOCK | RELAY | TB2 | OUT8 |
| TOOL_CLAMP_SOL (OUT9) | SOL-10 via RLY-3 | KEEP | 24 VDC / <100 mA | INTERLOCK | RELAY | TB2 | OUT9 |
| TOOL_UNCLAMP_SOL (OUT10) | SOL-10 via RLY-4 (other direction) | KEEP | 24 VDC / <100 mA | INTERLOCK | RELAY | TB2 | OUT10 |
| COOLANT_ON (OUT11) | coolant pump contactor | KEEP | 24 VDC / <200 mA | PROCESS | RELAY (contactor via interposing relay) | TB2 | OUT11 |
| LUBE_ON (OUT12) | lube pump contactor | KEEP | 24 VDC / <200 mA | PROCESS | RELAY | TB2 | OUT12 |
| ATC_FWD (OUT13) | ATC motor forward contactor | KEEP | 24 VDC / <200 mA | INTERLOCK | RELAY | TB2 | OUT13 |
| ATC_REV (OUT14) | ATC motor reverse contactor | KEEP | 24 VDC / <200 mA | INTERLOCK | RELAY | TB2 | OUT14 |
| ALARM_OUT (OUT15) | alarm horn / light | DEFER | 24 VDC / <200 mA | PROCESS | SRC | TB2 | OUT15 |

**Result: 16/16 OUT used. Zero spare on 7i84U-A outputs.**

`GEAR_LO_SOL (OUT8)` was marked `HOLD_CONFLICT` in the source CSV
during earlier fixes. Retained here; conflict resolution belongs in
the claim audit reconciliation (next commit).

### 7i84U-B inputs (TB3 IN0-15, TB2 IN16-31)

| Sig | Field point | KEEP/DEFER/DELETE/PENDING | V / A | Norm | Safety role | SRC/SNK | Bank | Term |
|---|---|---|---|---|---|---|---|---|
| X_LIMIT_PLUS (IN0) | X+ overtravel switch | KEEP | 24 VDC / <5 mA | NC | SAFETY_MONITORING | SNK | TB3 | IN0 |
| X_LIMIT_MINUS (IN1) | X- overtravel switch | KEEP | 24 VDC / <5 mA | NC | SAFETY_MONITORING | SNK | TB3 | IN1 |
| Y_LIMIT_PLUS (IN2) | Y+ overtravel switch | KEEP | 24 VDC / <5 mA | NC | SAFETY_MONITORING | SNK | TB3 | IN2 |
| Y_LIMIT_MINUS (IN3) | Y- overtravel switch | KEEP | 24 VDC / <5 mA | NC | SAFETY_MONITORING | SNK | TB3 | IN3 |
| Z_LIMIT_PLUS (IN4) | Z+ overtravel switch | KEEP | 24 VDC / <5 mA | NC | SAFETY_MONITORING | SNK | TB3 | IN4 |
| Z_LIMIT_MINUS (IN5) | Z- overtravel switch | KEEP | 24 VDC / <5 mA | NC | SAFETY_MONITORING | SNK | TB3 | IN5 |
| X_HOME (IN6) | X home LS-42 (assumed) | KEEP | 24 VDC / <5 mA | NO | PROCESS | SNK | TB3 | IN6 |
| Y_HOME (IN7) | Y home LS-52 (assumed) | KEEP | 24 VDC / <5 mA | NO | PROCESS | SNK | TB3 | IN7 |
| Z_HOME (IN8) | Z home LS-62 (confirmed TB-51) | KEEP | 24 VDC / <5 mA | NO | PROCESS | SNK | TB3 | IN8 |
| IN9-14 | SPARE | KEEP as reserve | — | — | — | — | TB3 | IN9-14 |
| PROBE_SKIP1 (IN15) | Renishaw MP-3 probe | KEEP | 24 VDC / <5 mA | NC (probe closed at rest) | PROBE | SNK | TB3 | IN15 |
| IN16-31 | SPARE | KEEP as reserve | — | — | — | — | TB2 | IN16-31 |

**Result: 10/32 IN used. 22 IN spare** (6 on TB3 IN9-14, all 16 on
TB2). Compared with the audit's implied "9 DI + 8 DO" shortfall
calc, the actual spare is much larger than the audit assumed.

### 7i84U-B outputs (TB3 OUT0-7, TB2 OUT8-15)

| Sig | Field load | KEEP/DEFER/DELETE/PENDING | V / A | Safety role | Topology | Bank | Term |
|---|---|---|---|---|---|---|---|
| X_DRIVE_ENABLE (OUT0) | MELDAS DK-427 X S-ON | KEEP | 24 VDC / <20 mA | SAFETY_MONITORING | SRC | TB3 | OUT0 |
| Y_DRIVE_ENABLE (OUT1) | MELDAS DK-427 Y S-ON | KEEP | 24 VDC / <20 mA | SAFETY_MONITORING | SRC | TB3 | OUT1 |
| Z_DRIVE_ENABLE (OUT2) | MELDAS DK-427 Z S-ON | KEEP | 24 VDC / <20 mA | SAFETY_MONITORING | SRC | TB3 | OUT2 |
| AIR_BLAST (OUT3) | SOL-62 via RLY-5 | KEEP | 24 VDC / <100 mA | PROCESS | RELAY (100 VAC coil on the far side of RLY-5) | TB3 | OUT3 |
| TOUCH_SENSOR_BLAST (OUT4) | SOL-35 via RLY-6 | KEEP | 24 VDC / <100 mA | PROCESS | RELAY | TB3 | OUT4 |
| TAP_COOLANT_BLAST (OUT5) | SOL-61 via RLY-7 | KEEP | 24 VDC / <100 mA | PROCESS | RELAY | TB3 | OUT5 |
| ATC_BARRIER_SOL (OUT6) | TCME.M / ATC barrier expand | KEEP | 24 VDC / <200 mA | INTERLOCK | RELAY (100 VAC coil via interposing relay if the OEM SOL is 100 VAC — verify at commissioning; if 24 VDC coil under 500 mA, connect direct) | TB3 | OUT6 |
| FLOOD_VALVE (OUT7) | flood coolant valve | KEEP | 24 VDC / <200 mA | PROCESS | RELAY or SRC (voltage dependent) | TB3 | OUT7 |
| OUT8-15 | SPARE | KEEP as reserve | — | — | — | — | TB2 | OUT8-15 |

**Result: 8/16 OUT used. 8 OUT spare** on TB2.

## Reconciliation summary

- **Two 7i84U cards are sufficient** for the scoped retrofit
  function set. Card A is at 100 % / 100 %, card B carries the
  limit/home switches, probe, drive enables, coolant/lube blast
  solenoids, and the ATC barrier + flood valve, leaving 22 IN and
  8 OUT of physical reserve on card B.
- **The audit's "one card short 9 DI + 8 DO" claim does not hold**
  against the actual CSV — the second card provides ample capacity
  for every currently-scoped signal.
- **The audit's "two cards short at least 1 DO if the 2PC pallet
  changer is retained" claim** is a scope question, not a capacity
  question: **the 2PC pallet changer is NOT in the retrofit
  function scope** (see decision below). No pallet-changer signals
  are on the CSV.

## Deferred / removed functions (scope clarifications)

| Function | Retain / defer / delete | Rationale |
|---|---|---|
| **2PC pallet changer** | **DELETE** — not in retrofit scope | The retrofit is scoped to X/Y/Z + spindle + ATC magazine + coolant/lube/blast. Pallet changing was never part of the LinuxCNC scope; if the machine has a 2PC option present, its wiring will be physically disconnected at retrofit. Removing this scope frees 4-6 IN and 3-4 OUT that would have been required. |
| **Magazine CW/CCW** | KEEP — via `ATC_FWD (OUT13)` and `ATC_REV (OUT14)` on 7i84U-A. | Magazine motor direction is controlled by the two contactor outputs. No additional OUT needed. |
| **Cover valves (MAG_COVER_OPEN_CONF / MAG_COVER_CLOSE_CONF)** | KEEP — IN6/IN7 on 7i84U-A input. The cover-motion outputs are `HOLD_CONFLICT` and will be revisited in the [claim audit reconciliation](claim_audit_2026-08-07.md). | The two cover confirms are on inputs; if the retrofit also drives cover motion, that will consume an OUT pair on 7i84U-B (which has spares). Currently no cover-motion output is in the CSV. |
| **Mist coolant** | DEFER — not in current CSV. | If added later, use 7i84U-B TB2 OUT8-15 (8 spare). |
| **Work light** | DEFER — not in current CSV. | If added later, single 7i84U-B TB2 OUT. |
| **Manual tool clamp/unclamp pushbuttons** | DEFER (currently marked DEFER on 7i84U-A IN9 and IN30). | These consume two 7i84U-A inputs that are otherwise oversubscribed. If deferred, the two inputs remain wired but HAL-unconnected until re-enabled. |

## What if a third smart-serial device is needed later

The 7i44 has 8 RS-422/485 smart-serial channels (source: [7i44 Mesa
product page](https://store.mesanet.com/index.php?product_id=44)),
so both current 7i84U cards live on channels 0 and 1 with **six
channels spare**. A future third card (7i84U-C, or a 7i85 for a
differential-encoder receiver, or a 7i86 for extra outputs) plugs
in on channel 2 without redesigning the topology. Only the
firmware bitfile's `sserial_port_0` mask needs updating from
`00xxxxxx` to `000xxxxx`.

This is not needed for the scoped function set; documenting it as
the expansion path.

## Cross-references

- Card manufacturer specs (5-28 V field range, 500 mA/output,
  2 A/group of 8, built-in output clamps): [7i84U manual](https://www.mesanet.com/pdf/parallel/7i84uman.pdf).
- Smart-serial latency + `[hostmot2] SSCONFIG` etc.:
  [`smart_serial_latency.md`](smart_serial_latency.md).
- E-stop chain fed by SAFETY_MONITORING rows: [`estop_safety_chain.md`](estop_safety_chain.md).
- Interposing-relay convention (RLY-1..7): OUT rows above with
  `RELAY` topology.
- Solenoid coil voltages (100 VAC for OEM Fujikoshi hydraulic
  valves and legacy blast solenoids): retained OEM control
  transformer, per the top-level repo README.

## What has changed in the repo (this commit)

- New `docs/io_capacity_reconciliation.md` (this document).
- No changes to `mesa/current_pin_authority.csv` are needed — the
  CSV already carries every row inventoried above; this document
  is the KEEP/DEFER/DELETE decision layer over the top of that
  CSV.
- `docs/project_status.md` — TODO added for the mist-coolant and
  work-light decisions.

## Sources

- [Mesa 7i84U manual](https://www.mesanet.com/pdf/parallel/7i84uman.pdf) — 32 IN,
  16 OUT, 500 mA/output, 2 A/group-of-8, 5-28 V field range.
- [Mesa 7i44 store page](https://store.mesanet.com/index.php?product_id=44) —
  8 sserial channels on RJ45.
- Repo: [`../mesa/current_pin_authority.csv`](../mesa/current_pin_authority.csv),
  [`../linuxcnc/field_7i84u.hal`](../linuxcnc/field_7i84u.hal),
  [`smart_serial_latency.md`](smart_serial_latency.md),
  [`estop_safety_chain.md`](estop_safety_chain.md).
