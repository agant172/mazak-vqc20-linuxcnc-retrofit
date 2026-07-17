# Mazak VQC 20/40 — Phase 2 Wiring Plan
**Generated:** 2026-06-21 | **Author:** LinuxCNC Retrofit — Andy Gant, Kanab UT  
**Hardware:** Mesa 7i97T + 7i84U + 7i49 (on order) | **OS:** Debian Trixie / LinuxCNC 2.9.8

---

## Status Legend

| Symbol | Meaning |
|--------|---------|
| ✅ DONE | HAL net active, wire can be landed |
| ⏳ BLOCKED | Depends on 7i49 (not yet ordered) or 7i84U sserial (W22 suspect) |
| 🔧 READY | HAL commented-out, wiring can be pre-staged |
| ⚠️ VERIFY | Requires physical check before landing |

---

## Priority Order for Next Cabinet Session

Circuits are ordered by dependency chain — land the ones that unblock the most downstream work first. The E-stop and TB5 input wiring can be verified with `halcmd` immediately after landing; servo and sserial wiring requires the drives and 7i84U to be energized.

---

## GROUP 1 — E-Stop Chain (Land First — Zero Dependencies)

**Why first:** The E-stop chain must be closed and functional before LinuxCNC will allow any output to go active. Landing it first lets you run `halcmd show pin` and confirm the chain is healthy before touching any drive or relay wiring.

### Circuits

| Circuit | 7i97T Pin | HAL Signal | Cabinet Terminal | Wire | Notes |
|---------|-----------|-----------|-----------------|------|-------|
| E-Stop input | TB5.10 (IN9) | `hm2_7i97.0.gpio.017.in` | ESTOP-CHAIN | 18AWG BLK | NC series chain. Active Low = chain open = fault |
| 24V field supply + | TB5.12 | +VFIELD | 24VDC bus | 18AWG RED | Powers all TB5 inputs |
| 24V field GND | TB5.11 | GND | 24V COM | 18AWG BLK | Common return |

### BOM Cross-Reference — Group 1

| Item needed | BOM Item | Status |
|-------------|----------|--------|
| 18AWG hook-up wire RED | BOM Item 9 | Verify on hand |
| 18AWG hook-up wire BLACK | BOM Item 10 | Verify on hand |
| 1.0mm² ferrules | BOM Item 12 | Required for push-in terminals |

### Verify Before Landing
- [ ] Confirm 24VDC supply is fused and present at terminal strip before connecting TB5.12
- [ ] Trace ESTOP-CHAIN through existing cabinet wiring — confirm it returns to TB5.10 via the operator panel e-stop button NC contact

---

## GROUP 2 — Axis Limit Switches & Home Switches (TB5 Inputs)

**Why second:** These are pure input signals — no relay, no drive power needed. Landing them lets you verify all switch wiring with LinuxCNC in a safe, power-off-to-drives state using `halcmd show pin hm2_7i97.0.gpio.*`.

### Circuits (all TB5, 24VDC logic)

| Circuit | TB5 Pin | GPIO | Signal | Switch Type | Notes |
|---------|---------|------|--------|------------|-------|
| X+ Limit | TB5.1 (IN0) | gpio.008 | `x-max-lim` | NC, Active Low | Tied into E-stop chain on original M2 |
| X- Limit | TB5.2 (IN1) | gpio.009 | `x-min-lim` | NC, Active Low | |
| Y+ Limit | TB5.3 (IN2) | gpio.010 | `y-max-lim` | NC, Active Low | |
| Y- Limit | TB5.4 (IN3) | gpio.011 | `y-min-lim` | NC, Active Low | |
| Z+ Limit | TB5.5 (IN4) | gpio.012 | `z-max-lim` | NC, Active Low | |
| Z- Limit | TB5.6 (IN5) | gpio.013 | `z-min-lim` | NC, Active Low | |
| X Home | TB5.7 (IN6) | gpio.014 | `x-home-sw` | NO, Active High | |
| Y Home | TB5.8 (IN7) | gpio.015 | `y-home-sw` | NO, Active High | |
| Z Home | TB5.9 (IN8) | gpio.016 | `z-home-sw` | NO, Active High | |

### BOM Cross-Reference — Group 2

| Item needed | BOM Item | Status |
|-------------|----------|--------|
| 18AWG hook-up wire (signal runs) | BOM Item 9/10 | Verify on hand |
| 1.0mm² ferrules (one per wire end) | BOM Item 12 | Required |

### Verify Before Landing
- [ ] Confirm existing M2 limit switch wiring gauge — may be able to reuse existing field wires if they reach TB5
- [ ] NC limits: confirm each switch reads open (LOW) when not actuated with a meter before landing

---

## GROUP 3 — TB4 Sserial to 7i84U (RS-422 Link) ⚠️ VERIFY W22

**Why third:** Without sserial, all 7i84U I/O (drive enables, spindle, tool clamp, gear, magazine BCD) is dead. This is the single highest-leverage circuit in the whole retrofit. Fix W22 and land this before anything else that depends on 7i84U outputs.

### Circuits

| Circuit | 7i97T Pin | 7i84U J1 RJ45 | Function | Cable |
|---------|-----------|--------------|---------|-------|
| Tx+ | TB4.1 | RJ45 pin 1 | RS-422 transmit + | CAT5e STP |
| Tx- | TB4.2 | RJ45 pin 2 | RS-422 transmit - | CAT5e STP |
| GND | TB4.3 | RJ45 pin 5 | Ground | CAT5e STP |
| Rx+ | TB4.4 | RJ45 pin 3 | RS-422 receive + | CAT5e STP |
| Rx- | TB4.5 | RJ45 pin 6 | RS-422 receive - | CAT5e STP |
| +5V | TB4.6 | RJ45 pin 4 | Serial power | CAT5e STP |

### W22 Jumper Resolution (must do before wiring)
1. Power down 7i84U
2. Locate W22 on 7i84U PCB — sets RS-422 termination
3. Default position = terminated on receive end. If 7i84U is the far end of the sserial chain (which it is — only one card), W22 should be **installed** (terminated). Confirm against 7i84U schematic.
4. Also verify CAT5e wire pair polarity at both ends — orange pair = Tx, green pair = Rx (swap if sserial shows CRC errors or no card detected)
5. After wiring: run `dmesg | grep hm2` and look for `7i84` recognition in the sserial scan

### BOM Cross-Reference — Group 3

| Item needed | BOM Item / Source | Status |
|-------------|-------------------|--------|
| CAT5e STP patch cable (cut & land) | Not in relay BOM — source separately | ⚠️ Verify on hand |
| Ferrules (TB4 terminal ends) | BOM Item 12 | Required |

---

## GROUP 4 — TB3 Analog Outputs + Drive Enables (Servo Interface)

**Why fourth:** Servo drives need the analog ±10V command and the S-ON enable signal from 7i97T TB3. This wiring is independent of sserial — you can land it while the W22 sserial issue is being resolved. However, **do not enable drives** until E-stop chain (Group 1) is confirmed functional.

### Circuits (all TB3)

| TB3 Pin | Label | HAL Signal | Function | Drive Terminal | Wire |
|---------|-------|-----------|---------|----------------|------|
| TB3.1 | ENA0- | gpio.000 (GND) | X Drive Enable GND | CN3 pin 16 / GND | 18AWG |
| TB3.2 | ENA0+ | gpio.000 | X Drive Enable (S-ON) | CN3 pin 7 / S-ON | 18AWG |
| TB3.3 | GND | AGND | X Analog GND | CN3 pin 16 | 22AWG STP |
| TB3.4 | AOUT0 | pwmgen.00 (X) | X Axis ±10V Command | CN3 pin 1 / AX | 22AWG STP |
| TB3.5 | ENA1- | gpio.001 (GND) | Z Drive Enable GND | Drive GND | 18AWG |
| TB3.6 | ENA1+ | gpio.001 | Z Drive Enable (S-ON) | Drive S-ON | 18AWG |
| TB3.7 | GND | AGND | Z Analog GND | Drive GND | 22AWG STP |
| TB3.8 | AOUT1 | pwmgen.01 (Z) | Z Axis ±10V Command | Drive AZ | 22AWG STP |
| TB3.9 | ENA2- | gpio.002 (GND) | Y Drive Enable GND | Drive GND | 18AWG |
| TB3.10 | ENA2+ | gpio.002 | Y Drive Enable (S-ON) | Drive S-ON | 18AWG |
| TB3.11 | GND | AGND | Y Analog GND | Drive GND | 22AWG STP |
| TB3.12 | AOUT2 | pwmgen.02 (Y) | Y Axis ±10V Command | Drive AY | 22AWG STP |
| TB3.13 | ENA3- | gpio.003 (GND) | Spindle Enable GND | VFD COM | 18AWG |
| TB3.14 | ENA3+ | gpio.003 | Spindle Enable (FWD/RUN) | VFD FWD | 18AWG |
| TB3.15 | GND | AGND | Spindle Analog GND | VFD COM | 22AWG STP |
| TB3.16 | AOUT3 | dac.03 | Spindle Speed 0–10V | VFD V-IN | 22AWG STP |

> **Critical:** AOUT is single-ended (referenced to AGND on TB3.3/7/11/15). Run twisted pair from AOUT pin and its paired GND pin to each drive — keep this pair shielded and ≤1.5m. Terminate shield at 7i97T end only.

### BOM Cross-Reference — Group 4

| Item needed | BOM Item / Source | Status |
|-------------|-------------------|--------|
| 22AWG shielded twisted pair (analog runs) | Not in relay BOM — source separately | ⚠️ Verify on hand |
| 18AWG hook-up wire (enable runs) | BOM Item 9/10 | Verify on hand |
| Ferrules (all TB3 ends) | BOM Item 12 | Required |

---

## GROUP 5 — 7i84U Output Side: Drive Enables, Spindle, Z Brake ⏳ NEEDS SSERIAL

**Why fifth:** Depends on Group 3 (sserial working). Once 7i84U is recognized, these are the first outputs to enable — they're needed before any motion attempt.

### Circuits (7i84U J4 outputs, 24VDC sourcing)

| 7i84U Output | HAL Signal | Function | Destination | Wire |
|-------------|-----------|---------|------------|------|
| out-00 | `spindle-fwd` | Spindle FWD | S-A12 contactor coil (FWD) | 18AWG |
| out-01 | `spindle-rev` | Spindle REV | S-A12 contactor coil (REV) | 18AWG |
| out-02 | `spindle-ena` | Spindle Enable | VFD enable input | 18AWG |
| ~~out-03~~ | ~~`x-drive-ena`~~ | ~~X Drive Enable~~ | ~~X servo drive~~ | **REMOVED** — X drive S-ON now on TB3 ENA0+ (gpio.000). See Group 4. |
| ~~out-04~~ | ~~`y-drive-ena`~~ | ~~Y Drive Enable~~ | ~~Y servo drive~~ | **REMOVED** — Y drive S-ON now on TB3 ENA2+ (gpio.002). See Group 4. |
| ~~out-05~~ | ~~`z-drive-ena`~~ | ~~Z Drive Enable~~ | ~~Z servo drive~~ | **REMOVED** — Z drive S-ON now on TB3 ENA1+ (gpio.001). See Group 4. |
| out-06 | `z-brake-rel` | Z Brake Release | N1J-L2-201 brake coil | 18AWG |

> **Z Brake note:** The N1J-L2-201 is a 24VDC fail-safe brake. out-06 HIGH = brake released. Wire a flyback diode (1N4007) across the coil terminals to suppress inductive kick — anode to GND, cathode to +24V side.

### BOM Cross-Reference — Group 5

| Item needed | BOM Item / Source | Status |
|-------------|-------------------|--------|
| 18AWG hook-up wire | BOM Item 9/10 | Verify on hand |
| 1N4007 diode (Z brake flyback) | Not in relay BOM — add to order | ⚠️ Missing from BOM |
| Ferrules | BOM Item 12 | Required |

---

## GROUP 6 — Relay Panel Build & 7i84U Relay Outputs ⏳ NEEDS SSERIAL + RELAY PARTS

**Why sixth:** Requires both the relay panel parts (BOM Items 1–15) and working sserial. Build the relay panel off-machine first — mount relays, land 24VDC bus, land 100VAC bus — then install and wire to 7i84U J4 outputs and the solenoid field terminals.

### Complete Relay-to-Signal Map

| Relay | Mesa Output | HAL Net | SOL # | Function | Priority |
|-------|-----------|---------|-------|---------|---------|
| RLY-1 | 7i84U out-07 | `gear-hi-sol` | **SOL-13** (Fujikoshi SA-G01-E3X-C1-11) | Spindle high gear (hydraulic) | High |
| RLY-2 | 7i84U out-08 | `gear-lo-sol` | **SOL-12** (Fujikoshi SA-G01-E3X-C1-11) | Spindle low gear (hydraulic) | High |
| RLY-3 | 7i84U out-09 | `tool-clamp` | **SOL-10** (Fujikoshi SA-G01-A3X-C1-11) | Tool clamp (hydraulic) | High |
| RLY-4 | 7i84U out-10 | `tool-unclamp` | **SOL-10** (Fujikoshi SA-G01-A3X-C1-11) | Tool unclamp (hydraulic, same valve) | High |
| RLY-5 | TB5 SSR Out-00 | `air-blast` | **SOL-62** (CKD 4F210-08-AC100V) | Air blast (100VAC) | Medium |
| RLY-6 | TB5 SSR Out-01 | `touch-sensor-blast` | **SOL-35** (CKD GAB 412-6-AC100V-02G) | Touch sensor blast (100VAC) | Low |
| RLY-7 | TB5 SSR Out-02 | `tap-coolant-blast` | **SOL-61** (CKD GAB 412-6-AC100V-02G) | Tap coolant blast (100VAC) | Low |

> **SOL number correction (2026-06-24):** Previous table listed SOL 27/15/16. Correct numbers per Mazak maintenance manual (Decision #11): gear shift = SOL-12/SOL-13 (Fujikoshi hydraulic), tool clamp/unclamp = SOL-10 (Fujikoshi hydraulic, single valve two ports). CKD 4F210-08-AC100V is air blast (SOL-62) only.
>
> **out-11 / out-12 (2026-06-24):** These drive the **coolant pump relay** (out-11) and **lube pump relay** (out-12) directly — they are not solenoid valve outputs and do not go through the relay panel. Previous RLY-5/RLY-6 solenoid valve entries were incorrect and have been removed.

### BOM Cross-Reference — Group 6 (Full Relay Panel Parts)

| BOM Item | Qty | Part | Description | Status |
|----------|-----|------|-------------|--------|
| 1 | 9 | Omron MY2-GS DC24 | DPDT relay, 24VDC coil | ⚠️ ORDER |
| 2 | 9 | Omron PYF08A-E | DIN rail socket (if existing not reusable) | ⚠️ VERIFY FIRST |
| 3 | 1 | Phoenix PTFIX 10/12X2.5 | 24V+ bus distribution | ⚠️ ORDER |
| 4 | 1 | Phoenix PTFIX 10/12X2.5 GN | 24V GND bus distribution | ⚠️ ORDER |
| 5 | 1 | Phoenix PTFIX 6/12X2.5 | 100VAC hot bus | ⚠️ ORDER |
| 6 | 1 | Phoenix PTFIX 6/12X2.5 | 100VAC neutral bus | ⚠️ ORDER |
| 7 | 1 | NS 35/7.5 DIN rail, 500mm | Rail for new relay panel | ⚠️ ORDER |
| 8 | 2 | Phoenix E/UK | End stops | ⚠️ ORDER |
| 9 | 1 roll | 18AWG RED MTW | 24VDC + / 100VAC hot runs | ⚠️ VERIFY |
| 10 | 1 roll | 18AWG BLACK MTW | 24VDC GND / 100VAC neutral | ⚠️ VERIFY |
| 11 | 1 roll | 18AWG WHITE MTW | 100VAC neutral field runs | ⚠️ VERIFY |
| 12 | 100 pc | 1.0mm² ferrules (Panduit or equiv) | Push-in terminal ferrules | ⚠️ ORDER |
| 13 | 1 pkg | 25×25mm slotted wire duct | Cable management | ⚠️ VERIFY |
| 14 | 1 | Phoenix TT-ST 4-PE/L/N 110AC | Fuse terminal, 100VAC | ⚠️ ORDER |
| 15 | 2 | 2A 5×20mm slow-blow | 100VAC panel fuse (1 + spare) | ⚠️ ORDER |

---

## GROUP 7 — 7i84U Input Side: Tool Confirm, Gear Confirm, Magazine BCD ⏳ NEEDS SSERIAL

**Why last:** These are confirmatory inputs — machine can run in a degraded mode without them initially. Land after drive wiring is confirmed working.

> **E-stop note (2026-06-24):** E-stop chain goes to **TB5 IN9 (7i97T onboard, Group 1)** — not to 7i84U in-09. The in-09 row has been removed from this table. Limits and home switches also go to TB5 IN0–IN8 (Group 2), not to 7i84U.

### Circuits (7i84U J3 inputs)

| 7i84U Input | HAL Signal | Sensor | Signal | Cabinet Wire |
|------------|-----------|--------|--------|-------------|
| in-10 | `x-drive-fault` | Drive fault relay | X Drive Fault | 18AWG |
| in-11 | `y-drive-fault` | Drive fault relay | Y Drive Fault | 18AWG |
| in-12 | `z-drive-fault` | Drive fault relay | Z Drive Fault | 18AWG |
| in-13 | `spindle-at-speed` | FR-SX VFD output | At Speed | 18AWG |
| in-14 | `spindle-fault` | FR-SX VFD fault | VFD Fault | 18AWG |
| in-15 | `tool-clamp-conf` | PRS 9 (Balluff BES-516) | TOOL_CLAMP_CONF | Existing M2 wire |
| in-16 | `tool-unclamp-conf` | PRS 8 (Yamatake FL1-2D6-E3) | TOOL_UNCLAMP_CONF | Existing M2 wire |
| in-17 | `gear-hi-conf` | PRS 10 | GEAR_HI_CONF | Existing M2 wire |
| in-18 | `gear-lo-conf` | PRS 12 | GEAR_LO_CONF | Existing M2 wire |
| in-19 | `mag-bcd-bit0` | PRS 21 | MAG BCD bit 0 | Existing M2 wire |
| in-20 | `mag-bcd-bit1` | PRS 22 | MAG BCD bit 1 | Existing M2 wire |
| in-21 | `mag-bcd-bit2` | PRS 23 | MAG BCD bit 2 | Existing M2 wire |
| in-22 | `mag-bcd-bit3` | PRS 24 | MAG BCD bit 3 | Existing M2 wire |
| in-23 | `mag-bcd-bit4` | PRS 25 | MAG BCD bit 4 | Existing M2 wire |
| in-24 | `door-open` | Door switch | DOOR_OPEN | Existing M2 wire |
| in-25 | `lube-level` | Float switch | LUBE_LEVEL | Existing M2 wire |
| in-26 | `coolant-level` | Float switch | COOLANT_LEVEL | Existing M2 wire |

---

## GROUP 8 — Resolver Wiring (7i49 to Resolver Bodies) ⏳ BLOCKED — 7i49 NOT YET ORDERED

**Why last:** 7i49 card is not yet ordered. All resolver wiring goes through the 7i49 P1 DB25 header. No resolver wiring can be finalized until the card is in hand and the resolver TR (transformation ratio) is confirmed from the RT-5XA nameplate.

### Pre-Staging Checklist (do now, land when 7i49 arrives)
- [ ] Read nameplate on each RT-5XA — confirm TR is ~0.5 (standard 7i49) or ~1.0 (7i49HV)
- [ ] Measure ballscrew pitch X/Y/Z with a dial indicator — needed for resolver scale calculation
- [ ] Locate existing resolver cable harness — confirm it terminates at the servo drive or at a cabinet junction
- [ ] 4-conductor shielded cable needed: REF+, REF-, SIN+, SIN- (or COS) per axis

---

## Missing Items — Not in Current BOM

The following items were identified during Phase 2 planning and are **not** covered by the relay panel BOM. Add to the next purchase order:

| Item | Qty | Purpose | Source |
|------|-----|---------|--------|
| 22AWG 2c shielded twisted pair | ~10m | Analog command wires TB3 to servo drives | Local electrical supply |
| CAT5e STP patch cable | 1× 1m | TB4 sserial to 7i84U J1 | On hand or order |
| 1N4007 diode | 5 | Z brake flyback + spares | Digi-Key / on hand |
| 4c shielded resolver cable (22AWG) | ~15m total (3 axes × ~5m) | RT-5XA resolver leads to 7i49 | Belden 8777 or equiv |
| Wire markers / heat-shrink labels | 1 set | ID all new wires at both ends | Brady M211 / on hand |
| P-touch / Brady label tape | — | Terminal block labeling | On hand? |

---

## Pre-Session Checklist

Before opening the cabinet for the next work session:

### Parts Verification
- [ ] 18AWG RED/BLACK/WHITE wire — verify sufficient length on hand (estimate 30m each for full cabinet)
- [ ] 1.0mm² ferrules — minimum 100 pcs needed; recommend 200 pcs for full job
- [ ] Wire duct 25×25mm — measure panel available space before cutting
- [ ] CAT5e STP cable — locate in shop or order
- [ ] 1N4007 diodes — check parts bins

### Relay Panel Parts — Order Status
All BOM Items 1–15 from the relay panel BOM are **not yet ordered** based on available records. The relay panel can be built off-machine while sserial is being debugged — order now so parts are on hand.

### Documentation to Bring to Cabinet
- [ ] This Phase 2 plan (printed or tablet)
- [ ] BOM PDF Rev A (relay panel)
- [ ] Mazak cabinet wiring diagram (original M2 drawings — for tracing wire 144/146 and existing limit switch runs)
- [ ] 7i84U manual (W22 jumper location)
- [ ] 7i97T manual (GPIO pin index for TB5 SSR outputs — needed before final HAL net lines can be uncommented)

### Tools Needed
- Ferrule crimper (matched to 1.0mm² pins)
- Wire stripper calibrated for 18AWG and 22AWG
- Small flat-blade screwdriver (TB3/TB4/TB5 terminal block screws)
- Multimeter (ring-out limit switches before landing)
- Label maker

---

## Dependency Summary

```
Group 1 (E-Stop)          ← No dependencies — land first
   │
   ├─► Group 2 (Limits/Homes)     ← After 24V supply confirmed at TB5
   │
   ├─► Group 4 (TB3 Analog/ENA)   ← After E-stop, before drive power
   │
   └─► Group 3 (TB4 Sserial)      ← Fix W22, then land CAT5e
             │
             ├─► Group 5 (7i84U Outputs: drives/spindle/brake)
             │
             ├─► Group 6 (Relay Panel: all solenoid circuits)
             │
             └─► Group 7 (7i84U Inputs: confirms, BCD, door, level)

Group 8 (Resolvers / 7i49)  ← Blocked until 7i49 ordered & TR confirmed

Group 9 (ATC Commissioning) ← Blocked until: sserial working + hydraulic-ok confirmed
                                + additional sserial card for PRS-55/66/PHS-181/182
```

---

## Hydraulic System Notes (Decision #11 — 2026-06-21)

**Hydraulic unit confirmed present and fully functional.** NACHI 1.5 kW, 40L tank. Starts automatically on power-up.

### Hydraulic Pump Motor Wiring
The hydraulic pump motor contactor is **not assigned to any 7i84U output** (all 16 outputs fully allocated). Recommended approach: **tie the pump contactor coil directly to the LinuxCNC 24VDC control power rail**, so the pump runs whenever the control system is energized. This matches the original M2 behavior and requires no additional Mesa output.

### ATC Sequence Gate Logic
HYD_PRESS_OK (in-27, Sanwa SPS-8T-PC-20) must be the **first permissive** in all ATC and gear-shift HAL logic. No solenoid output (out-07 through out-10) should be permitted to fire unless hydraulic-ok is TRUE:

```
ATC / gear-shift permitted =
    hydraulic-ok       (7i84U in-27)   # 16+ kg/cm², pump running
    AND spindle-zero-speed (in-13)     # spindle stopped before tool change
    AND mag-in-position    (in-14 area — verify PRS-13 wiring)
    AND atc-zone-y         (PRS-55, needs expansion card)
    AND atc-zone-z         (PRS-66, needs expansion card)
```

In HAL, implement using `and2` components or a ClassicLadder rung gating all ATC output enables.

### Solenoid Coil Voltage — VERIFY BEFORE ORDERING RELAYS
Gear shift (SOL-12/13) and tool unclamp (SOL-10) are **Fujikoshi SA-G01 hydraulic solenoid valves** mounted on the spindle head manifold. The coil voltage is **not confirmed** — measure at the manifold before selecting relay contact rating for RLY-1 through RLY-4.

### Gear Shift Solenoid Correction
Previous documents listed gear shift solenoids as CKD 4F210-08-AC100V. **This was incorrect.** The correct parts from the Mazak maintenance manual:

| Relay | Signal | Correct Part | Mazak Label |
|---|---|---|---|
| RLY-1 | gear-hi-sol | Fujikoshi SA-G01-E3X-C1-11 (hydraulic) | SOL-13 |
| RLY-2 | gear-lo-sol | Fujikoshi SA-G01-E3X-C1-11 (hydraulic) | SOL-12 |
| RLY-3 | tool-clamp | Fujikoshi SA-G01-A3X-C1-11 (hydraulic) | SOL-10 |
| RLY-4 | tool-unclamp | Fujikoshi SA-G01-A3X-C1-11 (hydraulic) | SOL-10 |

CKD 4F210-08-AC100V = **air blast solenoid (SOL-62) only**, routed via TB5 SSR Out-00.

### Additional ATC Inputs — Need Expansion Card
**Updated 2026-06-24:** Limits, homes, and E-stop were confirmed to wire at TB5 (7i97T onboard), freeing in-00 through in-09 on the 7i84U (10 spare inputs). The four ATC zone signals below can now be wired to 7i84U in-00 through in-03 — a second sserial card is no longer required for these signals.

| Signal | Switch | Location | Priority |
|---|---|---|---|
| atc-zone-y | PRS-55 | Column top | High — ATC interlock |
| atc-zone-z | PRS-66 | Right side of head | High — ATC interlock |
| mag-tool-avail | PHS-181 | Magazine cover | Medium |
| spindle-tool-avail | PHS-182 | Magazine cover | Medium |

A second sserial card (Mesa 7i84 or equivalent) is required before ATC commissioning.

---

*Cross-referenced against: Mazak_VQC_Wiring_Map.md, Mazak_System_Wiring_Map.xlsx, mazak_relay_panel_bom_rev_a.pdf, mazak.hal — all as of 2026-06-21. Hydraulic section added 2026-06-21 per Decision #11.*
