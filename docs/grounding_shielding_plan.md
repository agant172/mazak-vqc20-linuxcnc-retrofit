# Grounding and shielding — cable schedule and acceptance plan

## Audit finding #19 (verbatim)

> Grounding/shielding plan is incomplete.
> Consequence: resolver position noise, analog-command instability and
> false trips.
> Truth: Mesa specifies three individually shielded twisted pairs per
> resolver, shields terminated at 7i49 end. Analog return/common and
> PE are distinct; noisy motor/contactor wiring needs physical
> separation.
> Source: 7i49 manual.
> Edit: add a cable schedule for pairs, drains, shells, PE/0 V bonds,
> segregation and crossings; record noise while contactors, spindle
> and axes operate.

## Standing position

Prior repo language ("keep resolver and analog wiring shielded and
physically separated ... terminate the resolver cable shield/ground
per plan (still to be finalized)") is not a plan. It is a note that a
plan is missing. This document is the plan.

Two hard rules from Mesa's [7i49 manual](https://www.mesanet.com/pdf/motion/7i49man.pdf)
govern the resolver cabling:

1. **Three individually shielded twisted pairs per resolver channel**
   — one for RESDRV±, one for RESSIN±, one for RESCOS±. Not one
   overall shield around all six conductors.
2. **Shields terminate ONLY at the 7i49 end.** No shield-to-shell at
   the motor end. No both-ends bonding.

The manual does not publish separation distances, PE/GND bonding
rules, or analog-output cable requirements. Those are established
below from CNC-industry best practice and cited to sources where
applicable; they are labeled as REQUIREMENTS (mandatory) or
GUIDELINES (target values, adjust after noise survey).

## Cable schedule

### R-1 through R-3 — resolver cables (X, Y, Z axes)

| Attribute | Requirement | Source |
|---|---|---|
| Construction | 3 × individually shielded twisted pairs in a common overall jacket, no overall shield required | [7i49 manual p. 9](https://www.mesanet.com/pdf/motion/7i49man.pdf) — "individually shielded twisted pairs" |
| Wire gauge | 22-24 AWG stranded, tinned copper. Individual pair capacitance ≤ 40 pF/ft is a guideline. | Not specified by Mesa; industry practice for resolver runs under 30 m |
| Overall jacket | PVC or PUR, drag-chain rated for the X/Y/Z axis cable-carrier legs; non-drag-chain rated for cabinet segment | Machine environment |
| Length limit | 30 m absolute maximum; keep under 15 m if possible | Industry practice; not specified by Mesa |
| Pair assignments | Pair A: RESDRV+/RESDRV-; Pair B: RESSIN+/RESSIN-; Pair C: RESCOS+/RESCOS- | [7i49 manual p. 9](https://www.mesanet.com/pdf/motion/7i49man.pdf) |
| Drain wires | One drain per pair; land only at 7i49 end (see below) | [7i49 manual p. 9](https://www.mesanet.com/pdf/motion/7i49man.pdf) — "Shields should be terminated only at the 7I49 end of the cable" |
| Cable-carrier compatibility | Pair-pitch stable through carrier flex cycles; no ribbon or flat construction | Machine environment |

### Termination at the 7i49 end (in the retrofit control cabinet)

For each of R-1 (X, channel 0 on P4), R-2 (Z, channel 1 on P4), and
R-3 (Y, channel 2 on P3), land the twisted-pair conductors and the
individual pair drains on the Phoenix screw terminal block per the
7i49 pin map:

| Channel | Card connector | RESDRV± pair | RESSIN± pair | RESCOS± pair | Drain / shield tie |
|---|---|---|---|---|---|
| X (ch 0) | P4 pins 6/7 (drive) | pins 6/7 | pins 1/2 | pins 3/4 | Twist the three drains together, land on P4 pin 5 or pin 8 (GND) |
| Z (ch 1) | P4 pins 14/15 (drive) | pins 14/15 | pins 9/10 | pins 11/12 | Twist the three drains together, land on P4 pin 13 or pin 16 (GND) |
| Y (ch 2) | P3 pins 6/7 (drive) | pins 6/7 | pins 1/2 | pins 3/4 | Twist the three drains together, land on P3 pin 5 or pin 8 (GND) |

The three drains within one cable are collected as a short pigtail
(≤ 25 mm) and land in a single GND screw on the same connector as the
signals. Do NOT run drains up a rail to a distant PE stud — the drain
must be short and share metallic reference with the pair it protects.

Pin references verified against [7i49 manual pp. 5-7](https://www.mesanet.com/pdf/motion/7i49man.pdf).

### Termination at the resolver end (on the axis motor)

- Trim the individual shields back to the jacket break.
- **Leave the drain wires uncrimped, insulated, and dressed back**
  into the cable jacket for the last ~50 mm; heat-shrink over the
  cut ends so a stray drain cannot contact the motor case, chassis,
  or motor terminal box.
- Only the six conductors (RESDRV±, RESSIN±, RESCOS±) land on the
  resolver terminal block or Tamagawa flying-lead splice.
- The cable jacket clamp at the motor terminal box entry is
  mechanical strain relief only — no shield contact to the box.

### Consequences of getting the shield termination wrong

- Shielded at both ends: a **ground loop** through the machine
  chassis will inject 60 Hz and motor-PWM common-mode noise onto the
  RESSIN/RESCOS pair; symptom is a jittery velocity feedback and
  visible position wobble at rest.
- Shielded only at the motor end: the shield acts as an antenna
  referenced to the noisy motor case; symptom is faster than 60 Hz
  hash on velocity feedback, worse when the spindle drive is
  switching.
- Shielded only at the 7i49 end (correct): the shield is referenced
  to the quiet analog GND of the 7i49, drains injected noise to that
  reference, and does not close a loop.

### A-1 through A-4 — analog command cables (X, Z, Y, spindle)

The 7i49 manual does not specify analog-output cable construction.
The following is the plan for this retrofit:

| Attribute | Requirement / plan | Rationale |
|---|---|---|
| Construction | Individually shielded twisted pair per axis: AOUTn / signal-common | Each analog command is single-ended relative to the drive's signal common |
| Wire gauge | 22-24 AWG stranded | Adequate for drive command input |
| Shield termination | Shield at 7i49 end only (P4 pin 19 for GND0, P4 pin 23 for GND1, P3 pin 19 for GND2, P3 pin 23 for GND3, etc.); insulated back at drive end | Mirrors the resolver-shield rule; prevents chassis loop |
| Signal-common conductor | The paired conductor is the signal common return matched to the drive's AGND input; land the pair partner on the drive's AGND pin, NOT PE | Drive-side analog common ≠ PE at the drive |
| Length limit | 5 m target inside cabinet, 10 m absolute | Practical for +/-10 V driver into ≥2 kΩ load (7i49 spec, [manual p. 13](https://www.mesanet.com/pdf/motion/7i49man.pdf)) |
| Cable-carrier compatibility | Not required — analog commands live inside the cabinet | |
| Separation | Segregate from every other cable class per the segregation table below | |

### S-1 — spindle A/B/Z encoder cable (spindle top → 7i80HDT input path)

The spindle encoder is currently unspecified — see [claim audit #16](claim_audit_2026-08-07.md).
Once the encoder is identified, add its row to this schedule. If it
turns out to be an RS-422 differential encoder, treat it as three
individually shielded twisted pairs (A/Ā, B/B̄, Z/Z̄) with shields at
the FPGA end. If it turns out to be single-ended, add a receiver
board (7i85, 7i74, or similar) and treat the fanout side per Mesa
guidance for that board — the bare-FPGA 7i80HDT P3 GPIO is NOT an
RS-422 receiver.

### E-1 through E-4 — drive-enable cables (X, Z, Y, spindle enable)

| Attribute | Requirement / plan |
|---|---|
| Construction | Un-shielded 2-conductor 22 AWG (differential ENA± from 7i49) or single-conductor to interposing-relay coil; run inside the cabinet only |
| Shield | Not required |
| Length limit | Cabinet-internal only |
| Separation | Keep on the digital/24 V side of the segregation table below |

### F-1 through F-N — 7i84U field I/O cables (safety inputs, limit/home switches, ATC solenoids, coolant, air, etc.)

| Attribute | Requirement / plan |
|---|---|
| Construction | Standard machine control cable, 18-20 AWG per conductor for 24 V loads; no shield required for 24 V logic; shield only if the run passes within 50 mm of AC motor leads or contactor wiring |
| Bundle rule | Do not mix 24 V logic with 100 VAC coil wiring (SOL-35/61/62/etc.) inside the same conduit or cable-carrier tray section |

## Ground and 0 V bonding

The 7i49 manual identifies pins named **GND**, **GND0**, and **GND1**
(and GND2..GND5 on the other connectors) but does not identify PE or
prescribe a bonding method. The plan for this retrofit:

| Bond | Where | How | Rationale |
|---|---|---|---|
| **PE (protective earth) star point** | Cabinet backplane PE bus bar (existing OEM bar retained) | 6 AWG or larger to building service ground; each equipment PE lands here individually | EN 60204-1 §8 star-ground practice |
| **Chassis 0 V (control 24 V DR-240-24 output negative)** | Bonded to PE at ONE point at the PSU, not at the loads | Green/yellow to PE bar | Standard 24 V control convention; prevents 24 V return sneak paths through PE |
| **7i80HDT logic ground** | Fed via P1/P2/P3 header return from the Mesa cards; the 7i80HDT chassis screw bonds to backplane PE | Cabinet standoff | Mesa card ground is at the FPGA host, not distributed |
| **7i49 analog GND (P4/P3/P2 GND, GND0..GND5)** | Connected to 7i80HDT logic ground via P2 header, NOT separately bonded to PE at the 7i49 card | Header-only | Prevents parallel analog-ground path that would form a loop |
| **7i84U-A and 7i84U-B field 0 V (`GND` terminal on TB1 field power)** | Bonded to the DR-240-24 output negative at the PSU; NOT bonded to PE at the 7i84U itself | 24 V power feed | Field 0 V is a 24 V return, not PE |
| **Drive analog common (drive-side AGND per drive terminal)** | The drive's own AGND terminal — the analog-command shield's PAIR PARTNER lands there | Per drive documentation, not PE | Drive-specific, verified during electrical acceptance |
| **Resolver drain wires** | 7i49 GND pin on the same connector as the pair, NOT PE | Short pigtail per pair | Per Mesa "shield at 7i49 end only" |
| **Motor frame PE** | Motor cable green/yellow to backplane PE bar | Star | Motor case must be earthed independently of resolver-cable shielding |

## Segregation table

Physical separation between cable classes when they run parallel
along a common route (cable tray, conduit, or cable-carrier chain
leg):

| Cable class | Contents | Minimum spacing from motor/switching wiring |
|---|---|---|
| Class A — Resolver R-1..R-3 | 3× shielded twisted pairs, signal level ~1-4 V | **≥ 150 mm** from motor leads, contactor wiring, spindle drive AC output, brake solenoid coils; **300 mm** if run parallel > 3 m |
| Class B — Analog command A-1..A-4 | Shielded twisted pair, ±10 V signal | **≥ 150 mm** from Class D motor/switching |
| Class C — Digital I/O 24 V | 7i84U I/O, drive-enable | **≥ 50 mm** from Class D; can share tray with Class B if segregated by a metal divider |
| Class D — Motor power / switched AC | Servo-motor 3-phase leads, spindle motor leads, 100 VAC solenoid wiring, contactor coil circuits | (source class) |
| Class E — Building/mains AC | Cabinet feeder, 24 VDC PSU primary | **≥ 150 mm** from Classes A/B/C |

When Class A/B cables must **cross** Class D wiring, cross at **90°**
and hold the crossing to ≤ 50 mm of parallel run.

## Acceptance test — noise survey

Perform the following measurements with the cabinet closed and all
guards in place, after wiring is complete but before commissioning
motion. Log all traces under `docs/commissioning_logs/` per fix #15's
convention.

### Static baseline (drives disabled, control 24 V energised)

- [ ] Scope RESSIN0± and RESCOS0± differentially at the 7i49 P4
  connector. Expect a clean ~1-4 V RMS sine at the 7i49 excitation
  frequency (5 kHz per the current plan), with sub-10 mV baseline
  noise. Record peak-to-peak baseline noise for each resolver
  channel.
- [ ] Repeat for RESSIN1/RESCOS1 (Z) and RESSIN2/RESCOS2 (Y).
- [ ] Scope AOUT0..AOUT3 relative to 7i49 GND with the PID output
  commanded to zero. Expect ≤ 10 mV of noise; record peak-to-peak.
- [ ] Measure DC potential between 7i49 GND and cabinet PE bus. This
  should be < 10 mV DC.

### Contactor-firing survey (drives still disabled)

Trigger every contactor and interposing relay in the cabinet in turn
(MAR, servo contactors, hydraulic pump, coolant, ATC solenoids on
their 100 VAC bench). Watch all four scope channels above during each
firing. **Pass criterion:** ≤ 50 mV pk-pk transient on any RESSIN /
RESCOS / AOUT trace, ≤ 200 mV pk-pk on any resolver drive excitation
peak.

### Spindle-only survey

- [ ] With the spindle drive enabled but SFR/SRV/ORCM1 all off, watch
  the four analog traces for switching noise from the spindle
  rectifier. Same pass criterion as above.
- [ ] Ramp the spindle from 0 to 100 rpm and back, in low gear then
  high gear, recording noise at 25/50/100 % of rated speed. Pass
  criterion: RESSIN/RESCOS baseline noise on the X/Y/Z channels must
  not grow above 20 mV pk-pk.

### Axis-motion survey

- [ ] With X/Y/Z drives enabled at low velocity command, jog each
  axis at 10 %, 50 %, 100 % of `MAX_VELOCITY` in turn. Watch the
  OTHER two axes' RESSIN/RESCOS traces — no cross-coupling above
  20 mV pk-pk.
- [ ] Rapid-move each axis end to end while watching the other axes'
  velocity-feedback pin (`hm2_7i80.0.resolver.NN.velocity`) in HAL.
  Note any velocity glitches that correspond to the other axis's
  direction reversals or spindle transients.

### Failure mode — noise beyond the pass criteria

If any of the above fails, work through in order:
1. Re-terminate the affected cable's shields per this document
   (drain-at-7i49-only, insulated at motor end).
2. Increase segregation distance from Class D wiring or add a
   grounded metal divider on the affected tray section.
3. Verify the 24 V PSU output negative is bonded to PE at ONE point
   only (measurable as < 10 mV between DR-240-24 negative and PE bar).
4. Re-check the 7i49 excitation frequency selection matches the
   TS2014N variant's design frequency (currently 5 kHz on the plan;
   see [`linuxcnc/README.md`](../linuxcnc/README.md) commissioning
   step 3).
5. Escalate to Mesa (PCW) with scope traces and the specific TS2014N
   suffix.

## What has changed in the repo (this commit)

- New `docs/grounding_shielding_plan.md` (this document).
- `docs/project_status.md` — TODO added for the noise survey and
  shield-termination acceptance.
- `linuxcnc/README.md` and `bom/README.md` — replaced the "still to
  be finalized" note with a pointer to this document.

## Sources

- Mesa 7i49 manual, "RESOLVER WIRING" (p. 9), terminal-block pinouts
  (pp. 5-7), analog output specifications (p. 12-13):
  [https://www.mesanet.com/pdf/motion/7i49man.pdf](https://www.mesanet.com/pdf/motion/7i49man.pdf)
- Repo cross-references (internal): `linuxcnc/README.md` (resolver
  commissioning steps), `bom/README.md` (7i49 selection),
  `docs/servo_commissioning.md`, `docs/estop_safety_chain.md`,
  `docs/dc_bus_stop_fault.md`.
