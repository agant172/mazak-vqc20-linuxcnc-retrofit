# Mazak VQC 20/40 — Physical Wiring Map
**Mesa 7i97T + 7i84U → Mazak Cabinet**  
Generated: 2026-06-20 | Updated: 2026-06-21 (resolver architecture — all 3 axes RT-5XA; I/O expansion — full 7i84U assignment, relay panel, TB5 overflow; in-27..31 assigned: hydraulic-ok, cycle-start-pb, feed-hold-pb, single-block, servo-ready)  
Based on: Mazak_VQC_LinuxCNC_Wiring_Complete workbook + Mesa manuals

> **How to use this document:** Each section maps a physical terminal block on the Mesa hardware to the signal name in your workbook and the destination terminal in the Mazak cabinet. Wire color and type recommendations are included. Land wires in terminal number order working top to bottom on each block.

---

## CARD 1: MESA 7i97T (Ethernet Host)
**MAC:** 00:60:1B:17:81:5F | **Default IP:** 192.168.1.121  
**HAL prefix:** `hm2_7i97t.0`  
**Power:** 5VDC to TB5 power terminals (see power section below)

---

### TB1 — ENCODER INPUTS (NOT USED — no encoders on this machine)

> **All three axes (X, Y, Z) use Mitsubishi RT-5XA resolvers. There are no encoders on this machine. TB1 encoder inputs are not connected.**  
> Resolver feedback for all axes goes to the Mesa 7i49 card via the P1 DB25 header — see 7i49 section below.

| TB1 Pin | 7i97T Label | Status |
|---|---|---|
| TB1.1–TB1.12 | QA0, /QA0, QB0, /QB0, IDX0, /IDX0, QA1, /QA1, GND (×3) | **NOT USED** — leave disconnected |

---

### TB2 — ENCODER INPUTS (NOT USED — no encoders on this machine)

> **TB2 encoder inputs are not connected.** All axis feedback is resolver-based via 7i49.  
> TB2 pins 10–12 (encoder.03) are reserved for a spindle encoder if one is fitted in future.

| TB2 Pin | 7i97T Label | Status |
|---|---|---|
| TB2.1–TB2.9 | QA2, /QA2, QB2, /QB2, IDX2, /IDX2, GND (×3) | **NOT USED** — leave disconnected |
| TB2.10 | QA3 | `hm2_7i97t.0.encoder.03.input-a` — Spindle ENC A+ (reserved, not yet fitted) |
| TB2.11 | /QA3 | `hm2_7i97t.0.encoder.03.input-a-not` — Spindle ENC A- (reserved) |
| TB2.12 | GND | Shield/GND (reserved) |

---

### TB3 — ANALOG OUTPUTS + DRIVE ENABLES (Axis Servo Commands)
> ±10V differential analog command signals to Mitsubishi servo drives. Each axis has: AOUT (command), ENA+ (drive enable +), ENA- (enable GND), AGND (signal ground).  
> **pwmgen mapping: pwmgen.00 = X (TB3-4), pwmgen.01 = Z (TB3-8), pwmgen.02 = Y (TB3-12)**

| TB3 Pin | 7i97T Label | HAL Signal | Workbook Signal | Dest: Drive Terminal | Wire |
|---|---|---|---|---|---|
| TB3.1 | ENA0- | `hm2_7i97t.0.gpio.000.out` (enable GND) | X Drive Enable GND | Drive CN3 pin 16 / GND | 18AWG |
| TB3.2 | ENA0+ | `hm2_7i97t.0.gpio.000.out` | X Drive Enable (S-ON) | Drive CN3 pin 7 / S-ON | 18AWG |
| TB3.3 | GND | Signal GND | X AGND → G1X, G2X | Drive CN3 pin 16 | 22AWG STP |
| TB3.4 | AOUT0 | `hm2_7i97t.0.dac.00.value` (**pwmgen.00 = X**) | X Axis Command (+) | Drive CN3 pin 1 / AX | 22AWG STP |
| TB3.5 | ENA1- | Enable GND | Z Drive Enable GND | Drive GND | 18AWG |
| TB3.6 | ENA1+ | `hm2_7i97t.0.gpio.001.out` | Z Drive Enable (S-ON) | Drive S-ON | 18AWG |
| TB3.7 | GND | Signal GND | Z AGND → G1Z, G2Z | Drive GND | 22AWG STP |
| TB3.8 | AOUT1 | `hm2_7i97t.0.dac.01.value` (**pwmgen.01 = Z**) | Z Axis Command (+) | Drive AZ | 22AWG STP |
| TB3.9 | ENA2- | Enable GND | Y Drive Enable GND | Drive GND | 18AWG |
| TB3.10 | ENA2+ | `hm2_7i97t.0.gpio.002.out` | Y Drive Enable (S-ON) | Drive S-ON | 18AWG |
| TB3.11 | GND | Signal GND | Y AGND → G1Y, G2Y | Drive GND | 22AWG STP |
| TB3.12 | AOUT2 | `hm2_7i97t.0.dac.02.value` (**pwmgen.02 = Y**) | Y Axis Command (+) | Drive AY | 22AWG STP |
| TB3.13 | ENA3- | Enable GND | Spindle Enable GND | VFD COM | 18AWG |
| TB3.14 | ENA3+ | `hm2_7i97t.0.gpio.003.out` | Spindle Enable | VFD FWD/RUN | 18AWG |
| TB3.15 | GND | Signal GND | Spindle AGND | VFD COM | 22AWG STP |
| TB3.16 | AOUT3 | `hm2_7i97t.0.dac.03.value` | Spindle Speed Command | VFD V-IN (0–10V) | 22AWG STP |

> **Mitsubishi drive wiring note:** AOUT connects to V-REF/speed input. The analog output is single-ended on the 7i97T (AOUT referenced to AGND) — connect AOUT to drive command+ and AGND to drive command−/GND. Verify drive input impedance (should be ≥10kΩ).

> **Motor references:** X and Y axes — Mitsubishi HD81-12S-TT-A. Z axis — Mitsubishi HD101-12-TT-A (with brake N1J-L2-201 — see Z brake note below).

---

### TB4 — SSERIAL PORT (RS-422 — to 7i84U)
> This is the smart-serial expansion port. Connects to 7i84U via modified CAT5/6 cable. **Do not connect to a network switch.**
>
> **Pin numbering (corrected 2026-06-24):** TB4 is a multi-section terminal block. The sserial section occupies pins 13–20 (8 pins, not 1–6 as previously listed). Use absolute pin numbers when landing wires. See `Mazak_Sserial_Wiring.md` for full step-by-step build instructions and continuity checks.

| TB4 Pin | 7i97T Label | 568B Wire Color | 7i84U J1 RJ45 Pin | Function |
|---|---|---|---|---|
| TB4.13 | GND | Blue | RJ45 pin 4 | Ground |
| TB4.14 | GND | Blue/White | RJ45 pin 5 | Ground |
| TB4.15 | RX+ | Green | RJ45 pin 6 (TX+ on 7i84U) | 7i97T receives ← 7i84U transmits |
| TB4.16 | RX− | Green/White | RJ45 pin 3 (TX− on 7i84U) | |
| TB4.17 | TX+ | Orange | RJ45 pin 2 (RX+ on 7i84U) | 7i97T transmits → 7i84U receives |
| TB4.18 | TX− | Orange/White | RJ45 pin 1 (RX− on 7i84U) | |
| TB4.19 | +5V | Brown/White | RJ45 pin 7 | Serial power to 7i84U RS-422 |
| TB4.20 | +5V | Brown | RJ45 pin 8 | Serial power to 7i84U RS-422 |

> **TX/RX labeling:** Labels are from each card's perspective — TX on the 7i97T connects to RX on the 7i84U. This is correct cross-wiring, not an error.
>
> **CAT5e shield:** Connect drain wire to TB4 GND at the 7i97T end only. Leave shield unterminated at the 7i84U end to prevent ground loop.

---

### TB5 — FIELD I/O (Onboard GPIO: Limits, Homes, E-Stop + SSR Outputs)
> 24VDC logic. Inputs are sinking (connect to 24V+, common to 0V). SSR outputs are sourcing by default.
>
> **Note:** Servo drive enables, spindle VFD control, coolant, and lube outputs were previously planned for TB5 OUT0–OUT3. These are now assigned to the 7i84U (out-02 through out-05, out-11, out-12). TB5 IN0–IN9 remain as axis limits, homes, and E-stop. **TB5 SSR Out-00 is reassigned to AIR_BLAST overflow — see 7i97T TB5 SSR Overflow section below.**

| TB5 Pin | 7i97T Label | HAL Signal | Signal | Cabinet Terminal | Notes |
|---|---|---|---|---|---|
| TB5.1 | IN0 | `hm2_7i97t.0.gpio.008.in` | X+ Limit | LS-X+ | NC switch, Active Low |
| TB5.2 | IN1 | `hm2_7i97t.0.gpio.009.in` | X- Limit | LS-X- | NC switch, Active Low |
| TB5.3 | IN2 | `hm2_7i97t.0.gpio.010.in` | Y+ Limit | LS-Y+ | NC switch, Active Low |
| TB5.4 | IN3 | `hm2_7i97t.0.gpio.011.in` | Y- Limit | LS-Y- | NC switch, Active Low |
| TB5.5 | IN4 | `hm2_7i97t.0.gpio.012.in` | Z+ Limit | LS-Z+ | NC switch, Active Low |
| TB5.6 | IN5 | `hm2_7i97t.0.gpio.013.in` | Z- Limit | LS-Z- | NC switch, Active Low |
| TB5.7 | IN6 | `hm2_7i97t.0.gpio.014.in` | X Home | HOME-X | NO switch, Active High |
| TB5.8 | IN7 | `hm2_7i97t.0.gpio.015.in` | Y Home | HOME-Y | NO switch, Active High |
| TB5.9 | IN8 | `hm2_7i97t.0.gpio.016.in` | Z Home | HOME-Z | NO switch, Active High |
| TB5.10 | IN9 | `hm2_7i97t.0.gpio.017.in` | E-Stop Chain | ESTOP-CHAIN | NC chain, Active Low |
| TB5.11 | GND | 24V Field GND | — | 24V common | — |
| TB5.12 | +VFIELD | 24VDC Input | — | 24VDC supply | — |
| TB5.13/14 | SSR Out-00 | `hm2_7i97t.0.gpio.020.out` | **AIR_BLAST** | → RLY-5 → 100VAC CKD 4F210-08-AC100V (SOL-62) | Via relay panel |
| TB5.15/16 | SSR Out-01 | `hm2_7i97t.0.gpio.021.out` | **TOUCH_SENSOR_BLAST** | → RLY-6 → 100VAC CKD GAB 412-6-AC100V-02G (SOL-35) | Via relay panel |
| TB5.17/18 | SSR Out-02 | `hm2_7i97t.0.gpio.022.out` | **TAP_COOLANT_BLAST** | → RLY-7 → 100VAC CKD GAB 412-6-AC100V-02G (SOL-61) | Via relay panel |
| TB5.19/20 | SSR Out-03 | `hm2_7i97t.0.gpio.023.out` | SPARE | — | Available |
| TB5.21/22 | SSR Out-04 | `hm2_7i97t.0.gpio.024.out` | SPARE | — | Available |
| TB5.23/24 | SSR Out-05 | `hm2_7i97t.0.gpio.025.out` | SPARE | — | Available |

---

### P1 EXPANSION HEADER — 7i49 Resolver Card
> DB25 header. Connects to 7i49 via DB25 cable. The 7i49 provides resolver interface for **all three axes (X, Y, Z)** using Mitsubishi RT-5XA resolvers.

| P1 Function | Goes to | Notes |
|---|---|---|
| Smart-serial port 1 data | 7i49 DB25 | DB25 straight cable |
| +5V logic power | 7i49 logic | Provided via P1 |
| GND | 7i49 GND | — |

**7i49 Resolver Channel Assignments:**

| 7i49 Channel | HAL Signal | Axis | Motor | Resolver |
|---|---|---|---|---|
| resolver.00 | `hm2_7i97t.0.resolver.00` | **X** | HD81-12S-TT-A | RT-5XA |
| resolver.01 | `hm2_7i97t.0.resolver.01` | **Y** | HD81-12S-TT-A | RT-5XA |
| resolver.02 | `hm2_7i97t.0.resolver.02` | **Z** | HD101-12-TT-A | RT-5XA |

**7i49 Resolver Wiring (per channel):** RS1/RS2 (Reference Sin), RC1/RC2 (Reference Cos), RO1/RO2 (Rotor output) — confirm wire colors from motor cable before landing.

> **Resolver scale (placeholder):** 332,893 counts/inch. Based on 65,536 counts/rev ÷ 0.19685" pitch. **Actual ballscrew pitch for all three axes must be confirmed before setting this value in INI.**

> **7i49 vs 7i49HV:** RT-5XA transformation ratio (TR) not yet confirmed from nameplate. Standard **7i49** assumed (TR ≈ 0.5, 2:1 ratio, ~2V RMS excitation). If TR = 1.0 or resolver requires higher excitation voltage, switch to **7i49HV**. Verify from motor nameplate before ordering.

> **Z axis brake:** Motor HD101-12-TT-A is fitted with brake **N1J-L2-201**. This brake must be wired through a 7i84U output and released in HAL before motion is commanded on Z. See 7i84U section — assign an available spare output (OUTPUT8 or higher recommended).

---

### 7i97T POWER CONNECTIONS

| Terminal | Label | Connect to | Notes |
|---|---|---|---|
| Power connector + | +5V | Mean Well 5V PSU +V | 18AWG min |
| Power connector − | GND | Mean Well 5V PSU −V / chassis GND | 18AWG min |
| TB5 +VFIELD | 24VDC | Mazak 24V cabinet supply or new Mean Well DR-60-24 | Verify existing supply first |
| TB5 GND | 0V | 24V supply return | — |

---

## CARD 2: MESA 7i84U (Utility Field I/O — Machine I/O, ATC, Spindle, Drives)
**Unit:** 180C012C  
**HAL prefix:** `hm2_7i97t.0.7i84.0`  
**Connection:** Sserial via RJ45 J1 connector to 7i97T TB4  
**Power:** 24VDC to TB1 power connector (orange screw terminal block on card)  
**Default output mode:** Sourcing (PNP). Adjust per-bit via `output_source` / `output_sink` HAL params if sinking outputs needed.

> **I/O capacity summary:** 7i84U provides 32 inputs and 16 outputs. This machine uses **all 32 inputs** and **all 16 outputs** on the 7i84U, with **1 output overflowed to 7i97T TB5 SSR** (see TB5 overflow section below). No spare inputs or outputs remain — any additional signals require an additional card.

> **Solenoid relay panel — REQUIRED:** The 7i84U J4 outputs are **24VDC only** and cannot drive solenoid coils directly. An intermediate relay panel (DIN rail, 24VDC coil, contacts rated for load voltage) is required for out-07 through out-10 and the AIR_BLAST overflow. **Gear shift (out-07/08) and tool clamp (out-09/10) solenoids are hydraulic Fujikoshi SA-G01 valves — confirm coil voltage at spindle head manifold before selecting relay contact rating.** AIR_BLAST (TB5 SSR Out-00) drives CKD 4F210-08-AC100V at 100VAC. **Note: CKD 4F210-08-AC100V is the air blast solenoid only, NOT the gear shift solenoids** — earlier documents incorrectly listed CKD as gear shift. Corrected 2026-06-21.

---

### 7i84U — FULL INPUT ASSIGNMENT (J2/J3, in-00 through in-31)

All inputs are from Yamatake FL1-2D6-E3 proximity switches or Balluff BES-516-325-D0X-3 sensors (24VDC, PNP sourcing) unless otherwise noted.

> **Limits, homes, and E-stop (updated 2026-06-24):** Axis limit switches (X/Y/Z ±), home switches (X/Y/Z), and the E-stop chain wire permanently to the **7i97T TB5 onboard inputs** (IN0–IN9) — not to the 7i84U. This frees in-00 through in-09 (10 inputs) on the 7i84U. See TB5 section above for TB5 pin assignments.
>
> **Freed inputs available for ATC zone interlocks:** The 10 freed inputs (in-00 through in-09) can now absorb PRS-55 (atc-zone-y), PRS-66 (atc-zone-z), PHS-181, and PHS-182 — signals previously requiring a second sserial card. Assign from in-00 upward when ATC commissioning begins. A second sserial card may no longer be needed.

> **Revised I/O count: 22 of 32 inputs used (10 spare — in-00 through in-09 available).**

| Input | HAL Signal | Signal Name | Source / Part | Notes |
|---|---|---|---|---|
| in-00 | — | SPARE | — | Available — recommend ATC zone interlock (PRS-55 atc-zone-y) |
| in-01 | — | SPARE | — | Available — recommend ATC zone interlock (PRS-66 atc-zone-z) |
| in-02 | — | SPARE | — | Available — recommend PHS-181 (mag tool avail) |
| in-03 | — | SPARE | — | Available — recommend PHS-182 (spindle tool avail) |
| in-04 | — | SPARE | — | Available |
| in-05 | — | SPARE | — | Available |
| in-06 | — | SPARE | — | Available |
| in-07 | — | SPARE | — | Available |
| in-08 | — | SPARE | — | Available |
| in-09 | — | SPARE | — | Available |
| in-10 | `...7i84.0.input-10` | X_DRIVE_FAULT | HD81 drive fault output | Active when fault present |
| in-11 | `...7i84.0.input-11` | Y_DRIVE_FAULT | HD81 drive fault output | Active when fault present |
| in-12 | `...7i84.0.input-12` | Z_DRIVE_FAULT | HD101 drive fault output | Active when fault present |
| in-13 | `...7i84.0.input-13` | SPINDLE_AT_SPD | FR-SX VFD speed-reach output | Confirms spindle at commanded speed |
| in-14 | `...7i84.0.input-14` | SPINDLE_FAULT | FR-SX VFD fault output | |
| in-15 | `...7i84.0.input-15` | TOOL_CLAMP_CONF | **PRS 9** — Balluff BES-516-325-D0X-3 | Tool clamp confirmed |
| in-16 | `...7i84.0.input-16` | TOOL_UNCLAMP_CONF | **PRS 8** — Yamatake FL1-2D6-E3 | Tool unclamp confirmed |
| in-17 | `...7i84.0.input-17` | GEAR_HI_CONF | **PRS 10** — proximity | Spindle high gear verify |
| in-18 | `...7i84.0.input-18` | GEAR_LO_CONF | **PRS 12** — proximity | Spindle low gear verify |
| in-19 | `...7i84.0.input-19` | MAG_BCD_BIT0 | **PRS 21** — proximity | Tool magazine pocket BCD **LSB** |
| in-20 | `...7i84.0.input-20` | MAG_BCD_BIT1 | **PRS 22** — proximity | Tool magazine pocket BCD bit 1 |
| in-21 | `...7i84.0.input-21` | MAG_BCD_BIT2 | **PRS 23** — proximity | Tool magazine pocket BCD bit 2 |
| in-22 | `...7i84.0.input-22` | MAG_BCD_BIT3 | **PRS 24** — proximity | Tool magazine pocket BCD bit 3 |
| in-23 | `...7i84.0.input-23` | MAG_BCD_BIT4 | **PRS 25** — proximity | Tool magazine pocket BCD **MSB** |
| in-24 | `...7i84.0.input-24` | DOOR_OPEN | Door interlock switch | |
| in-25 | `...7i84.0.input-25` | LUBE_LEVEL | Lube level switch | Low = fault |
| in-26 | `...7i84.0.input-26` | COOLANT_LEVEL | Coolant level switch | Low = fault |
| in-27 | `...7i84.0.input-27` | HYD_PRESS_OK | Sanwa SPS-8T-PC-20 — NACHI hydraulic unit | **Confirmed present and functional** (2026-06-21). ON >=16 kg/cm2, OFF <10 kg/cm2. PRIMARY PERMISSIVE for all ATC and gear-shift outputs. |
| in-28 | `...7i84.0.input-28` | CYCLE_START_PB | Operator panel cycle-start pushbutton (NO momentary) | Optional — can use LinuxCNC UI |
| in-29 | `...7i84.0.input-29` | FEED_HOLD_PB | Operator panel feed-hold pushbutton (NO momentary) | Optional |
| in-30 | `...7i84.0.input-30` | SINGLE_BLOCK | Operator panel single-block selector switch | Optional |
| in-31 | `...7i84.0.input-31` | SERVO_READY | Servo drives ready relay contact | Wire before first motion |

> **Total inputs used: 22 of 32 (10 spare — in-00 through in-09 freed 2026-06-24 when limits/homes/estop confirmed to wire at TB5 onboard inputs).** Spare inputs recommended for ATC zone interlocks (PRS-55, PRS-66, PHS-181, PHS-182) when ATC commissioning begins — may eliminate need for a second sserial card.

> **BCD magazine decoder (HAL):** Inputs in-19 through in-23 carry a 5-bit BCD pocket position from PRS 21–25. Use the `bcd2s` HAL component (or a custom mux component) to decode these 5 bits into an integer pocket number. Wire `bcd2s.in-00` through `bcd2s.in-04` to the corresponding `input-19` through `input-23` HAL pins.

---

### 7i84U — FULL OUTPUT ASSIGNMENT (J4, out-00 through out-15)

Outputs marked **→ relay → 100VAC** route through the intermediate relay panel before reaching the solenoid. All others are direct 24VDC loads.

| Output | HAL Signal | Signal Name | Load / Destination | Notes |
|---|---|---|---|---|
| out-00 | `...7i84.0.output-00` | SPINDLE_FWD | 24VDC → FR-SX VFD forward input | Direct |
| out-01 | `...7i84.0.output-01` | SPINDLE_REV | 24VDC → FR-SX VFD reverse input | Direct |
| out-02 | `...7i84.0.output-02` | SPINDLE_ENA | 24VDC → spindle enable relay | Direct |
| out-03 | — | **SPARE** | — | Drive S-ON handled by TB3 ENA0+ (gpio.000) — see TB3 section |
| out-04 | — | **SPARE** | — | Drive S-ON handled by TB3 ENA1+ (gpio.001) — see TB3 section |
| out-05 | — | **SPARE** | — | Drive S-ON handled by TB3 ENA2+ (gpio.002) — see TB3 section |
| out-06 | `...7i84.0.output-06` | Z_BRAKE_REL | 24VDC → N1J-L2-201 brake release | Direct — HIGH before Z motion, LOW on disable/estop |
| out-07 | `...7i84.0.output-07` | GEAR_HI_SOL | 24VDC → **relay** → **SOL-13** hydraulic solenoid (Fujikoshi SA-G01-E3X-C1-11) | Coil voltage: VERIFY at spindle head manifold |
| out-08 | `...7i84.0.output-08` | GEAR_LO_SOL | 24VDC → **relay** → **SOL-12** hydraulic solenoid (Fujikoshi SA-G01-E3X-C1-11) | Coil voltage: VERIFY at spindle head manifold |
| out-09 | `...7i84.0.output-09` | TOOL_CLAMP | 24VDC → **relay** → **SOL-10** hydraulic solenoid (Fujikoshi SA-G01-A3X-C1-11) | Coil voltage: VERIFY at spindle head manifold. Tool spring-clamped, hydraulic-unclamped |
| out-10 | `...7i84.0.output-10` | TOOL_UNCLAMP | 24VDC → **relay** → **SOL-10** hydraulic solenoid (Fujikoshi SA-G01-A3X-C1-11) | Same solenoid as TOOL_CLAMP — check if one solenoid with 2-port valve or separate coils |
| out-11 | `...7i84.0.output-11` | COOLANT_ON | 24VDC → coolant pump relay | Direct |
| out-12 | `...7i84.0.output-12` | LUBE_ON | 24VDC → lube pump relay | Direct |
| out-13 | `...7i84.0.output-13` | ATC_FWD | 24VDC → ATC motor relay (forward) | Direct |
| out-14 | `...7i84.0.output-14` | ATC_REV | 24VDC → ATC motor relay (reverse) | Direct |
| out-15 | `...7i84.0.output-15` | ALARM_OUT | 24VDC → alarm light / horn | Direct |

> **Total 7i84U outputs used: 13 of 16 (3 spare — out-03, out-04, out-05 freed 2026-06-24; drive S-ON now on TB3 ENA pins). AIR_BLAST overflows to 7i97T TB5 — see section below.**

> **Z brake wiring:** The Z-axis motor (HD101-12-TT-A) is fitted with brake N1J-L2-201. In HAL, Z_BRAKE_REL (out-06) must be driven HIGH before enabling Z axis motion, and driven LOW (brake applied) whenever Z is disabled or E-stop is active. Confirm brake coil voltage and current before selecting relay.

---

### 7i84U POWER + SERIAL CONNECTIONS

| Connection | Terminal | Connect to | Notes |
|---|---|---|---|
| Serial port | J1 (RJ45) | 7i97T TB4 via CAT5e | Smart-serial link — not Ethernet |
| Field power A | TB1 pin 1 (+) | 24VDC supply + | Powers outputs 0–7 and inputs 0–15 |
| Field power A | TB1 pin 2 (−) | 24VDC supply − | |
| Field power B | TB1 pin 3 (+) | 24VDC supply + | Powers outputs 8–15 and inputs 16–31 |
| Field power B | TB1 pin 4 (−) | 24VDC supply − | |
| W1 jumper | LEFT position | — | Connects VIN to field power B (single supply operation) |
| W2 jumper | LEFT position | — | Operate mode, 2.5M baud (default — do not change) |

---

## 7i97T TB5 — SSR OUTPUT OVERFLOW (AIR_BLAST)

> **Why this section exists:** The 7i84U has 16 outputs, all of which are fully allocated. The AIR_BLAST solenoid (CKD 4F210-08-AC100V, 100VAC) requires one additional output. It overflows to the 7i97T onboard TB5 SSR outputs.

| TB5 Pin | 7i97T Label | HAL Signal | Signal Name | Load | Notes |
|---|---|---|---|---|---|
| TB5.13 / TB5.14 | SSR Out-00 | `hm2_7i97t.0.gpio.020.out` | AIR_BLAST | → RLY-5 → 100VAC CKD 4F210-08-AC100V (SOL-62) | Via relay panel |
| TB5.15 / TB5.16 | SSR Out-01 | `hm2_7i97t.0.gpio.021.out` | TOUCH_SENSOR_BLAST | → RLY-6 → 100VAC CKD GAB 412-6-AC100V-02G (SOL-35) | Via relay panel |
| TB5.17 / TB5.18 | SSR Out-02 | `hm2_7i97t.0.gpio.022.out` | TAP_COOLANT_BLAST | → RLY-7 → 100VAC CKD GAB 412-6-AC100V-02G (SOL-61) | Via relay panel |
| TB5.19 / TB5.20 | SSR Out-03 | `hm2_7i97t.0.gpio.023.out` | SPARE | — | Available |
| TB5.21 / TB5.22 | SSR Out-04 | `hm2_7i97t.0.gpio.024.out` | SPARE | — | Available |
| TB5.23 / TB5.24 | SSR Out-05 | `hm2_7i97t.0.gpio.025.out` | SPARE | — | Available |

> **Note:** TB5 SSR outputs are sourcing 24VDC. All 100VAC solenoids require relay switching — route through the DIN rail relay panel. RLY-5 through RLY-7 handle AIR_BLAST, TOUCH_SENSOR_BLAST, and TAP_COOLANT_BLAST respectively.

> **Updated 2026-06-24:** Out-01 (TOUCH_SENSOR_BLAST, SOL-35) and Out-02 (TAP_COOLANT_BLAST, SOL-61) are now assigned. These were previously listed as SPARE. Also updated relay numbering to be consistent with relay panel table (RLY-5/6/7).

---

## 100VAC SOLENOID RELAY PANEL

> **Install on DIN rail inside Mazak cabinet, wired between 7i84U J4 output connector and solenoid field terminals.**

| Relay # | 24VDC Coil Driven By | Contacts Switch | Signal |
|---|---|---|---|
| RLY-1 | 7i84U out-07 | Hydraulic coil → **SOL-13** (Fujikoshi SA-G01-E3X-C1-11) | GEAR_HI_SOL — verify coil voltage at spindle head manifold |
| RLY-2 | 7i84U out-08 | Hydraulic coil → **SOL-12** (Fujikoshi SA-G01-E3X-C1-11) | GEAR_LO_SOL — verify coil voltage at spindle head manifold |
| RLY-3 | 7i84U out-09 | Hydraulic coil → **SOL-10** (Fujikoshi SA-G01-A3X-C1-11) | TOOL_CLAMP — verify coil voltage at spindle head manifold |
| RLY-4 | 7i84U out-10 | Hydraulic coil → **SOL-10** (Fujikoshi SA-G01-A3X-C1-11) | TOOL_UNCLAMP — same valve, spring-return; verify if single or dual coil |
| RLY-5 | 7i97T TB5 SSR Out-00 | 100VAC → **SOL-62** CKD 4F210-08-AC100V | AIR_BLAST |
| RLY-6 | 7i97T TB5 SSR Out-01 | 100VAC → **SOL-35** CKD GAB 412-6-AC100V-02G | TOUCH_SENSOR_BLAST |
| RLY-7 | 7i97T TB5 SSR Out-02 | 100VAC → **SOL-61** CKD GAB 412-6-AC100V-02G | TAP_COOLANT_BLAST |
| RLY-8 | Spare | — | Reserve for future 100VAC loads |

**Relay selection criteria:** 24VDC coil, contacts rated ≥120VAC / ≥5A (solenoid inrush), DIN rail mount. Suggested: Phoenix Contact PLC-RSP or equivalent.

---

## INTER-CARD CONNECTIONS SUMMARY

| From | To | Cable | Notes |
|---|---|---|---|
| PC NIC (Intel I210) | 7i97T RJ45 Ethernet | Cat6 STP, 3ft direct | Point-to-point, no switch |
| 7i97T TB4 (sserial) | 7i84U J1 RJ45 | CAT5e, cut + landed on TB4 | Not Ethernet — sserial RS-422 |
| 7i97T P1 (DB25) | 7i49 DB25 | DB25 straight cable | All 3 resolver axes (X, Y, Z) |

---

## OPEN ITEMS BEFORE WIRING

| Item | Action Required |
|---|---|
| RT-5XA transformation ratio | Read from motor nameplate — confirms 7i49 (TR≈0.5) vs 7i49HV (TR=1.0). **Do not order 7i49 until confirmed.** |
| Ballscrew pitch (all 3 axes) | Measure or confirm from machine documentation — needed to calculate resolver scale (currently placeholder: 332,893 counts/inch based on 0.19685" pitch) |
| Z brake (N1J-L2-201) wiring | Now assigned to 7i84U out-06 (Z_BRAKE_REL). Confirm brake coil voltage and current, select relay. Must be released in HAL before Z motion. |
| Existing 24VDC supply | Measure voltage and current capacity before connecting — relay panel adds ~8 × 100mA coil loads. May need new Mean Well DR-60-24. |
| Drive command polarity | Verify X/Y/Z drives accept positive AOUT = positive velocity (may need HAL invert) |
| Spindle encoder | Confirm if spindle has encoder fitted — TB2 pins 10–12 reserved |
| CAT5 sserial cable | Verify pin mapping before cutting — check 7i84U manual p.6 serial port pinout |
| Chassis GND | 14AWG from drive chassis terminals to cabinet chassis ground bus |
| Relay panel build | Install 8-relay DIN rail panel (24VDC coil / 120VAC contacts) for 100VAC solenoids. Wire RLY-1 to RLY-5 per relay panel table above. |
| BCD decoder HAL component | Add `bcd2s` (or custom mux) in HAL to decode in-19 through in-23 (PRS 21–25) into tool magazine pocket integer. |
| TB5 SSR Out-00 HAL assignment | Map `hm2_7i97t.0.gpio.020.out` to AIR_BLAST net in HAL. Confirm GPIO number against 7i97T manual. |
| Verify PRS sensor wiring | Confirm Yamatake FL1-2D6-E3 and Balluff BES-516-325-D0X-3 output type (PNP/NPN) and supply voltage match 7i84U input specs before wiring. |

---

*Document generated from: Mazak_VQC_LinuxCNC_Wiring_Complete (Google Drive), Mesa 7i84 manual v1.18, Mesa 7i97T forum wiring examples. Updated 2026-06-21: all three axes confirmed as Mitsubishi RT-5XA resolvers; TB1/TB2 encoder inputs unused; 7i49 handles X, Y, Z resolver channels via P1 DB25 header. Updated 2026-06-21 (I/O expansion): full 7i84U input/output assignment from parts manual research; 100VAC solenoid relay panel required; AIR_BLAST overflowed to 7i97T TB5 SSR Out-00; BCD magazine pocket decoder (PRS 21–25) documented. Verify all terminal labels against physical card before landing wires.*
