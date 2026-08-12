# Mazak VQC-20/40 SN 060231 — Servo Amp & Resolver Analysis (rev 3)

Machine: **VQC-20/40 SN 060231**, Mazatrol **M-2** control (drawing sets labeled M-1 reflect the original 10/1983 mechanical drawings — the NC was later upgraded to M-2).
Incoming power: **460 VAC 3-phase → onboard variable-voltage transformer (VVT) → 230 VAC 3-phase bus** feeding a shared rectifier/condenser unit that supplies all axis amps and the FR-SX spindle drive.

**Revision 3 changes (2026-08-09):** Updated the Mesa control architecture to match the project's Rev B plan. The **7i97T is retired**; the current stack is **7i80HDT** (Ethernet FPGA host) → **P1: 7i44** sserial breakout → two **7i84U** field-I/O cards; **P2: 7i49** provides both X/Y/Z resolver feedback **and** the ±10 V analog velocity commands on **AOUT0–AOUT3** (there is no separate 7i97T DAC). All hardware findings below (motors, DK-427 isolation amp, TRA drives, Tamagawa TS2014N resolvers, FR-SX spindle) are unchanged — only the control-side board names and the analog-command source were corrected.

**Revision 2 changes:** Prior revision listed the drives and resolver as "unknown, likely Yaskawa Servopack + Tamagawa TS2620N". After on-machine photo inspection (July 2026), all key part numbers are now positively confirmed. This revision replaces speculation with observed part numbers and updates the retrofit plan accordingly.

---

## 1. Confirmed hardware inventory (from on-machine photos)

### 1.1 Axis servo motors — Mitsubishi HD-series DC permanent-magnet servos

| Axis | Motor type | MFG DWG | Frame | Photo evidence |
|---|---|---|---|---|
| **X** | Mitsubishi **HD-101-12** DC PM servo | Z636438 | Larger frame (bigger table) | IMG_2067-11, IMG_2067-14.MP4 — marked "X" stencil |
| **Y** | Mitsubishi **HD-81-12S** DC PM servo | Z636437 | Standard frame | IMG_2066-10, IMG_2066-13.MP4 — marked "Y" stencil |
| **Z** | Mitsubishi HD-101-12 DC PM servo (assumed same as X per Mazak parts list — needs one more photo) | — | Larger frame | Not yet photographed on-machine |

All three are **brushed DC permanent-magnet servos**, not AC brushless. This is important — it means the axis drives are **DC servo amps with H-bridge power stage and tach-based velocity loop**, not modern AC vector drives.

> **Schematic corroboration (2026-08-10):** the OEM servo-drive sheet
> (`41434WB` PDF p128, dwg 4143075404) confirms the above. Its X-axis title
> lists **two build options — A-type `HD-81-123-TTA` and B-type `HD-101-12-TTA`**;
> the photo-confirmed HD-101 is the **B-type**, so there is no conflict (the
> HD-81 on the schematic is the unfitted A-type). The sheet also gives Y-axis
> **HD-81-12S-TTA**, resolver **RT-5XA-11** on all axes (= the Tamagawa
> TS2014N / BKO-NC6062A pickup), and tacho **2 V ±10 %/1000 rpm**. B-type
> (HD-101) ratings: constant ~10.9 A, max ~65 A, max speed ~1500 rpm.

Reference: Mitsubishi Manuals 1967 confirms the DC motor / tachogenerator pattern for VQC-era Mazaks:
- DC motor 200 W or 400 W — 1.1 / 1.8 / 2.6 kW variants (white/black/red phase A on the tach)
- Tachogenerator 7 V / 1000 rpm (Green/Yellow phase B/Z)

### 1.2 Axis servo drive electronics — Mitsubishi MELDAS

| Board / device | Part number | Role |
|---|---|---|
| Isolation / interface card visible on each amp | **DK-427 (BKO-NC2017)** | **Isolation amplifier** — sits between the NC's ±10 V velocity command and the actual power stage. Not the power amp itself. |
| Actual DC-power amp (behind the DK-427) | **Likely Mitsubishi TRA-series transistor amplifier** (TRA31A / TRA41A / TRA61A) with a **PU16/31/71 power unit** upstream. TRA61A is the largest and typical for the HD-101 X-axis. | H-bridge transistor amplifier that drives the DC motor. |
| Power unit (shared) | PU-series | Rectifies 230 VAC 3-phase → ~310 VDC across P-N bus for all axis amps. |
| Enclosure clues | Three identical amp stacks with big blue isolation transformers, trimmer pots along bottom edge, ribbon-cable interconnects, test-point headers **TP230/TP331/TP341**, **MODE SEL** rotary switch. Below the amps: Mitsubishi NF-series MCCB, contactor bank, precharge/soft-start card. | Standard MELDAS DC-drive rack layout. |

**How this scenario matters for the resolver signal issue:** The DK-427 is an **isolation stage that separates NC ground from drive ground**. The resolver itself is *not* wired through the DK-427 — resolver leads go directly to the NC-side detector card (via the terminal-unit MR-series connectors). The DK-427 only isolates the **command voltage** path. So the resolver signal issue is a separate wiring/detector question from anything happening on the DK-427.

Sources:
- MTC-Technik/eu-reparaturen listing: "MELDAS DK-427 Isolation Amplifier BKO-NC2017 — Einsatz Mitsubishi TRA31A, TRA41A, TRA61A" ([eu-reparaturen.de](https://eu-reparaturen.de/online-shop/498::2010-04-20-meldas-isolation-amplifier-dk-427.html)).
- Scribd Mitsubishi Manual 924 covers TRA31/41/61 amplifiers with PU16/31/71 power units, 200/210 V 3-phase supply, 310 VDC across P-N bus, sine-approximation PWM current loop, 1:10,000 speed range ([Scribd](https://www.scribd.com/document/463111913/Mitsubishi-Manuals-924-pdf)).
- Scribd TRA-41A servo drive manual: "the transistor amplifier amplifies the power by high frequency switching according to the pulsewidth modulation method for the error voltage (command voltage) by comparing the position detector output and the calculation result output from the logic card of the control unit" ([Scribd](https://www.scribd.com/document/649035071/TRA-41A-SERVO-DRIVE-MITSUBISHI-MANUAL)).

### 1.3 Axis position feedback — Tamagawa Seiki resolvers

Physical device (all three axes, mounted at the **non-drive end of each ball screw**, coupled through a small **flex coupling**):

| Field | Value |
|---|---|
| Manufacturer | **Tamagawa Seiki** |
| Model family (physical) | **RT-□X□-□□ "PICKUP UNIT"** (e.g. RT-5XA-11) |
| Mitsubishi/Mazak part number | **BKO-NC6062A** |
| Electrical spec sheet | **TS2014N** series (with dash suffix) |
| Date code | 198X |
| Photo evidence | IMG_0075, IMG_0076-2, IMG_0077-3, IMG_2064-8, IMG_2064-12.MP4 |

Electrical spec (from Tamagawa TS2014N datasheet, [100y.com.tw PDF](https://images.100y.com.tw/pdf_file/79-TAMAGAWA.pdf)):

| Parameter | Value |
|---|---|
| Excitation voltage | **AC 10 Vrms** |
| **Excitation frequency** | **4.5 kHz** ⚠ |
| Transformation ratio K | 0.5 ± 10 % |
| Electrical error | ±10 arc-min max |
| Null voltage | 20 mVrms max |
| Max operating speed | 6,000 min⁻¹ |
| Primary | R1–R2 (rotor) |
| Secondary | S1–S3 (sin) and S2–S4 (cos) |

The 4.5 kHz excitation is important — see Section 3.1 below.

### 1.4 Spindle drive — Mitsubishi FREQROL FR-SX AC spindle controller

| Field | Value |
|---|---|
| Controller | **Mitsubishi FREQROL FR-SX** |
| Motor | **Mitsubishi SE-EY-FV** 3-phase AC induction spindle motor, 4-pole |
| Motor ratings | 3.7 / 3.7 / 2.2 / 5.5 / 5.5 / 3.7 kW @ 1500 / 4500 / 6000 / 1500 / 4500 / 6000 rpm (CONT + 30-min ratings) |
| Motor voltage | 170 V rated (from 230 V bus via FR-SX inverter) |
| Motor serial | 091400020 |
| Blower | IA-15040, 1φ 2P, 200/200 V 50/60 Hz, 0.2/0.2 A |
| Thermal protector | Klixon 9700L-246-215 (open 150 °C / close 99 °C, 24 VDC 12 A) |
| Photo evidence | IMG_0078-4, IMG_0079-5 (drive front panel LEDs and fault plate), IMG_2065-9 (motor nameplate) |

**FR-SX LED indicators observed on drive front panel:** PHASE SEQUENCE, READY, CW/CCW DRIVE, SPEED/CURRENT DETECTION, UP TO SPEED, APPROACH, IN POSITION, ZERO SPEED, SENSITIVITY, ORIENTATION (OPT).

**FR-SX fault codes observed:** MOTOR OVER HEAT, EXCESSIVE SPEED ERROR, BREAKER TRIP, PHASE LOSS, EXTERNAL EMERGENCY, OVER SPEED, CONVERTER I.O.C, CONTROLLER I.O.C, UNDER VOLTAGE, OVER HEAT, INVERTER I.O.C, OVER VOLTAGE (CONVERTER), INVERTER FAULT, CPU FAULT-1/2/3.

**FR-SX interface** (from the FR-SX Adjustment Procedure on [Scribd](https://www.scribd.com/document/657367587/FR-SX-Adjustment-Procedure) and the family FR-SF/FR-SE manuals):

| Signal | Terminal / method |
|---|---|
| Speed reference | **Analog ±10 V** on the SX-AJ / SX-IO1 card set, **or** 12-bit digital via SPOR card (`001010000000` = ~1/4 max, per adjust procedure). LinuxCNC uses the analog path. |
| Ready | 1 bit, "give a ready command" — enable / servo-ready-in equivalent |
| Direction | Discrete input(s) — FWD/REV |
| Orient | Optional **SF-On / SPOR** card feature; not integral to the FR-SX base drive. The **ORIENTATION (OPT)** indicator on the fault plate confirms this option is present. |
| Ready/Alarm outputs | Discrete outputs mirroring the front-panel LEDs; wired to NC through terminal-unit CN6 (see §2 below) |
| Motor built-in feedback | Motor has a built-in **optical** PA/PB pulse generator — the motor wiring plate calls it "P.L.G.", and the device is a Tamagawa **TS1526N55, 512 counts/turn, DC ±15 V** (nameplate photos 2026-08-12, [`spindle_motor_plg_encoder.md`](spindle_motor_plg_encoder.md)). Earlier revisions of this table said "magnetic pickup" — that was wrong; the PA/PB naming is right but the transducer is optical. Waveform check point is in the drive adjustment procedure |
| DC bus | Shared with axis DK-427/TRA drives, ~310 VDC after rectifier |

Family reference: the FR-SF/FR-SE/FR-SX line all use **AC ±10 V analog speed reference, less than 0.2 % speed regulation, 200/200-230 V 3-phase supply** ([studylib FR-SF maintenance manual](https://studylib.net/doc/27909929/mitsubishimanuals1399), [Scribd FR-SE spindle controller manual](https://www.scribd.com/document/741606209/FR-SE)).

### 1.5 Spindle position feedback

- **Spindle tacho: DISPUTED — do not rely on this line.** Earlier revisions listed a "Spindle tacho: Tamagawa **TGF-3D P402-Sx**". That part number is attributed elsewhere in this repo to the **X/Y/Z axis** motors, not the spindle ([`servo_commissioning.md`](servo_commissioning.md) — "integral to the HD-101 / HD-81 motors"; [`architecture_decision.md`](architecture_decision.md) §"TRA-type drives close their velocity loop on a tachogenerator"; dwg 4143075404 p128 puts tacho `TG1`/`TG2` on the axis connectors `CNA3`/`CNA4`/`CNA5`). The owner reports no awareness of any spindle tacho device on the machine (2026-08-12), and an AC induction spindle on a vector drive would close its speed loop on the PLG below rather than on a DC tachogenerator. **Whether any separate spindle tachogenerator exists now rests on a single transcribed legend line from dwg 4143175310 p079** — see [`../wiring/authority_conflicts.md`](../wiring/authority_conflicts.md) §4. Nothing electrical depends on this; no pin-authority row or HAL net references a spindle tacho.
- **Spindle motor built-in PLG:** **Tamagawa TS1526N55 optical shaft encoder, 512 counts/turn, DC ±15 V**, mounted in the spindle motor's terminal box; 9-pin `AMP-350720-1` connector, pins `PA RA PB RB AGA N15C GND P15C COM`. Nameplate-verified 2026-08-12 — see [`spindle_motor_plg_encoder.md`](spindle_motor_plg_encoder.md).
- **Spindle encoder (machine-side):** schematics label a "SPINDLE ENCODER" on an `MS3108B 20-29P` connector (dwg 4143075301 p090). **Whether this is a second physical device or another view of the motor PLG above is an open question** — the two pin maps share `PA`/`PB` but otherwise disagree. Do not merge the records until traced; see the open question in `spindle_motor_plg_encoder.md`.
- The FR-SX motor's built-in PLG is used for the drive's own speed loop. Which detector the NC/drive uses for **orient** is set by FR-SX parameter `#41 OSL` and is still unread — the presence of a PLG does not by itself prove PLG orient is provisioned.

---

## 2. Schematic reference — how it all wires together

**Master topology drawing 4143075313 sheet 3** (41434WB.pdf p82): shows the discrete X/Y/Z DC-servo amp blocks, the FR-SX spindle controller, the shared rectifier + condenser feeding all four, the terminal unit (bank of Honda-Tsushin MR-20/MR-50 connectors), and the NC connector fan-out. Magne-scale option is drawn but noted "**MAGNE SCALE DETECTOR (OPTION)**" — **not fitted** on this machine.

**Terminal-unit connector detail drawing 4143075322 sheet 3** (41434WB.pdf p85): shows the pin-outs of the MR-series connectors including **SERVO READY, SERVO ALARM, POWER ON, ORIENT COMMAND, SPINDLE FWD/REV/RUN/BRAKE**, and the resolver leads.

Both rendered PNGs in `Manuals_SN060231/`:
- `servo_topology_p082.png`
- `terminal_unit_detail_p085.png`

---

## 3. What this means for the LinuxCNC retrofit

**Plan of record on GitHub `agant172/mazak-vqc20-linuxcnc-retrofit` (Rev B):** LinuxCNC PC → **Mesa 7i80HDT** (Ethernet FPGA host, `hm2_eth`) → **P1: 7i44** sserial breakout → two **7i84U** (smart-serial field I/O); **P2: 7i49** provides X/Y/Z resolver-to-digital (5 kHz excitation baseline) **and** the ±10 V analog velocity commands (AOUT0–AOUT3); **P3: unused/spare**. Command each existing DC-servo amp with a ±10 V velocity reference **from 7i49 AOUT0/1/2**; read each Tamagawa resolver on the 7i49 RES0/1/2; keep the FR-SX spindle and command it with ±10 V (7i49 AOUT3) + FWD/REV (7i84U) + a discrete orient bit. This is unchanged by the new part-number info — **the plan is still valid, it just has more concrete drive/resolver information behind it**.

### 3.1 Resolver signal issue — 7i49 excitation frequency

This is the **most important detail** to flag for the retrofit.

- **Tamagawa TS2014N native excitation: 4.5 kHz at 10 Vrms.**
- **Mesa 7i49 plain excitation options: 2 / 5 / 10 kHz (jumper-selectable), 2 Vrms typical.**

The 7i49's **5 kHz** setting is close enough to the TS2014N's **4.5 kHz** to work — resolvers tolerate ±10 % excitation frequency deviation with only modest accuracy degradation, and the transformation ratio is a broad ±10 % anyway. **The 7i49 plain at 5 kHz is the correct card choice for this resolver.**

However, the **excitation voltage** difference matters:
- TS2014N is spec'd at 10 Vrms input.
- 7i49 outputs ~2 Vrms.

Result: the resolver's SIN/COS output will be roughly K × 2 V = ~1 V (vs. the ~5 V the original NC's detector card saw). That's **within the 7i49's input range** (it's designed for exactly this level), but **it does mean the SIN/COS signal-to-noise ratio is lower than the original NC saw**. This is a known trade-off with 7i49 vs. 7i49HV — the HV variant runs higher excitation and can drive resolvers spec'd for 7+ Vrms with a better SNR.

**Recommendation:** Stay with the **plain 7i49 at 5 kHz** for first bring-up (matches the GitHub plan). Add a scope check on the resolver S1-S3 and S2-S4 outputs during commissioning — if signal integrity looks marginal (peak-to-peak below ~500 mV, or noisy), switch to the **7i49HV** at 5 kHz to double the excitation drive. The HV upgrade is a drop-in card swap.

### 3.2 Servo amplifier scenario — signal path implications

The revised understanding of the DK-427 as an **isolation amplifier** (not the actual power stage) has a real consequence:

**Existing signal chain (Mazatrol M-2 → axis motor):**
```
M-2 NC ──[±10 V velocity cmd]──► DK-427 (isolation) ──► TRAxxA transistor amp ──► DC motor
                                                          │
                                     ┌────[tach ~7 V/krpm]┘
                                     │
              Resolver ─────────────►│  (velocity loop closed inside the TRAxxA + logic card)
                                     │
              (NC-side position detector card also reads the resolver in parallel for position loop)
```

**Post-retrofit signal chain (LinuxCNC → axis motor):**
```
LinuxCNC PC ──eth──► 7i80HDT ──P2──► 7i49 AOUTn ──[±10 V]──► DK-427 (isolation) ──► TRAxxA ──► DC motor
                                                                                     │
                                                       ┌────[tach 7 V/krpm]──────────┘  (velocity loop stays inside the TRAxxA)
                                                       │
                                 Resolver ─────────────┤
                                                       │
                                 Resolver ──► 7i49 RESn (LinuxCNC now reads position here — same 7i49 as the AOUT)
```

**Two important architectural points:**

1. **The DK-427 is your friend, keep it.** It provides galvanic isolation between the LinuxCNC control ground and the drive's 310 VDC bus ground. Removing it would tie the Mesa 7i49's analog output ground directly to the drive-side reference, which is a shock/noise risk. Keep the DK-427 in the signal path; the 7i49's ±10 V output (AOUT0/1/2) is fully compatible with what the DK-427 expects (that's what the original NC was driving into it).

2. **The velocity loop stays inside the TRAxxA.** The tach signal never leaves the drive rack — it's local to each amp. LinuxCNC only closes the **position loop** using the resolver → 7i49 feedback, and issues a **velocity command** to the amp. This is the classic "velocity-mode analog drive" pattern that LinuxCNC handles very well with a standard PID position loop.

**Split the resolver signal to feed both the original NC detector AND the 7i49?** No — the original NC detector cards are being removed. The resolver leads currently go through the terminal-unit MR connectors to the M-2 axis detector cards. In the retrofit, those same leads land on the 7i49 instead. The wiring change is: **relocate resolver R1/R2/S1/S3/S2/S4 leads from the M-2 detector card to the 7i49 R+/R−/SIN+/SIN−/COS+/COS− inputs**, one axis per channel.

### 3.3 Enable/ready sequence

The DK-427 + TRAxxA drive stack has these key handshake signals (per the family manuals cited above and the drawing 4143075322 detail sheet):

| Signal | Direction | Meaning |
|---|---|---|
| **SERVO READY (SRDY / MRDY)** | drive → NC | Drive main power on, no fault, ready to accept command |
| **SERVO ALARM (SALM)** | drive → NC | Fault present — logged as X-address in the PLC (see YM2V39L element list) |
| **Enable / RUN** | NC → drive | Latches the drive into torque-producing mode |
| **Emergency stop / EMG** | NC → drive | Coasts the motor to stop, drops main contactors |

These land at the terminal unit's **CN6 (50-pin)** connector. In the retrofit they get pulled into the **7i84U's smart-serial I/O** (P24/G24 24 VDC domain, per the GitHub project docs).

### 3.4 Bus/precharge sequence — do this before energizing amps

Because all three axis amps + FR-SX share the 310 VDC bus:

1. **Verify the precharge / soft-start card** in the CB Panel functions before any bench test. This limits inrush into the DC-bus condenser.
2. **Motor cables disconnected** on the first main-power test — just prove the bus comes up clean and no amp throws an alarm.
3. **Verify SERVO READY** on each amp after enable, still with motors disconnected.
4. **Reconnect motor cables one axis at a time**, torque-test each amp with a manual ±10 V command from a bench source (or from the 7i49 AOUT once wired).

### 3.5 Spindle path — FR-SX stays

FR-SX plan is straightforward:

| LinuxCNC pin | Wire | FR-SX terminal |
|---|---|---|
| Analog spindle speed reference | ±10 V from 7i49 AOUT3 | SX-AJ / SX-IO1 analog input |
| FWD command | 24 V from 7i84U output | FR-SX FWD input |
| REV command | 24 V from 7i84U output | FR-SX REV input |
| Orient command | 24 V from 7i84U output | SF-On/SPOR orient input (option card) |
| Ready in / from FR-SX | discrete input to 7i84U | FR-SX READY output (mirrors panel LED) |
| Alarm in / from FR-SX | discrete input to 7i84U | FR-SX ALARM output |
| Zero-speed detect | discrete input to 7i84U | matches PLC X001 "SZS.M" |
| In-position / orient arrival | discrete input to 7i84U | matches PLC X003 "ORA1" |
| Spindle encoder A/B/Z | **Unallocated.** `SPINDLE_ENCODER` is `UNBOUND` in `mesa/current_pin_authority.csv`, P3 stays empty, `num_encoders=0`. The 7i97T location no longer applies, and bare P3 GPIO is not a valid landing for a differential or ±15 V device. The motor-built-in PLG is the FR-SX's own detector and is **not** a candidate Mesa input — see [`spindle_motor_plg_encoder.md`](spindle_motor_plg_encoder.md#retrofit-implications) | machine-side encoder, if a second device exists |

### 3.6 Heat-growth compensate amp

Low priority. Reproduce later in HAL with a thermocouple → ADC → `axis.N.motor-offset` chain.

---

## 4. Updated open questions / next steps

| # | Item | Priority |
|---|---|---|
| 1 | Photograph the **TRAxxA power amplifier nameplate** behind the DK-427 boards to confirm which frame size (TRA31A / TRA41A / TRA61A) is on each axis. | High |
| 2 | Photograph the **Z-axis motor nameplate** to confirm HD-101-12 vs. HD-81-12S. | High |
| 3 | Photograph the **PU-series power unit** nameplate (PU16/31/71) and note the CB Panel MCCB / soft-start card part numbers. | Medium |
| 4 | With drive main power off, **buzz out** each Tamagawa resolver's R1-R2 winding and S1-S3, S2-S4 secondaries to verify no shorts to case. Expected primary DCR ~few tens of ohms. | High — before energizing |
| 5 | Track down the **Mitsubishi TRA-series maintenance manual** (Scribd 649035071 is a strong lead, also cnc-shopping.com carries FR-SX/SE/SF stock and often has PDF references) for the exact enable-signal terminal pinout. | High |
| 6 | Track down the **FR-SX interface/maintenance manual** (kamcompressor.ru / Scribd FR-SF/FR-SE variants) for the ±10 V analog reference pin numbers, orient command pin, and the SF-On/SPOR card pinout. | High |
| 7 | Confirm the **precharge / soft-start card** works before first bus energize. | Highest — safety |
| 8 | ~~Physically confirm the **spindle encoder** part number and count.~~ **PARTIALLY DONE 2026-08-12** — the *motor-built-in PLG* is a Tamagawa **TS1526N55, 512 counts/turn, ±15 V** ([`spindle_motor_plg_encoder.md`](spindle_motor_plg_encoder.md)). Still open: whether the schematics' machine-side "SPINDLE ENCODER" (`MS3108B 20-29P`, dwg 4143075301 p090) is a **second** device or the same one. | Medium |
| 9 | Decide **7i49 plain vs. 7i49HV** based on the resolver signal quality observed on first excitation test. | Medium |
| 10 | **PLC I/O cross-walk** — map the 385-row YM2V39L element list against the 7i84U I/O workbook. | Medium (parallel task) |

## 5. Companion image references

Rendered from `41434WB.pdf`:
- Topology (drawing 4143075313, sheet 3): PDF p82 → `servo_topology_p082.png`
- Terminal Unit Connection Details (drawing 4143075322, sheet 3): PDF p85 → `terminal_unit_detail_p085.png`
- SSR Board (drawing 4143175309, sheet 3): PDF p78
- Terminal Blocks TB6/TB7 Layout (drawing 4143175314, sheet 3): PDF p83

Machine photos (July 2026) archived in `Manuals_SN060231/photos_2026-07/`:
- Resolvers on ball-screw ends: IMG_0075, IMG_0076-2, IMG_0077-3, IMG_2064-8
- Axis servo amp stacks: IMG_0080-6, IMG_0081-7
- Spindle drive front panel: IMG_0078-4, IMG_0079-5
- Spindle motor nameplate: IMG_2065-9
- Y-axis motor nameplate: IMG_2066-10
- X-axis motor nameplate: IMG_2067-11
- Live-photo MP4s: IMG_2064-12.MP4 (resolver), IMG_2066-13.MP4 (Y motor), IMG_2067-14.MP4 (X motor)
