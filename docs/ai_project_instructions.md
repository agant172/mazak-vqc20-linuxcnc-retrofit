# Mazak VQC 20/40B LinuxCNC Retrofit — Project Instructions

## Project purpose

This project converts Mazak VQC 20/40B SN 060231 from its original Mazak
M-2 / Mazatrol control to LinuxCNC. The machine was functioning well before
the retrofit and is mechanically sound. The purpose is to replace obsolete
NC/control hardware and software while retaining reliable OEM machine
hardware, functions, serviceability, and documentation wherever practical.

The desired final machine has LinuxCNC motion control, a touchscreen HMI and
wired MPG pendant, retained OEM DC servo amplifiers and spindle drive, and
full OEM-style machine automation where practical — including spindle orient,
ATC operation, machine interlocks, lubrication/hydraulic monitoring, and
recoverable sequencing.

---

## Control hardware

Host system:
- LinuxCNC 2.9.10 on Debian 13, PREEMPT_RT kernel, `hm2_eth` driver.

Mesa hardware stack:
- Mesa 7i80HDT — Ethernet FPGA host.
- Mesa 7i49 on P2 — resolver feedback and ±10 V analog outputs.
- Mesa 7i44 on P1 — Smart-Serial interface.
- Mesa 7i84U-A on 7i44 port 0 — general field I/O.
- Mesa 7i84U-B on 7i44 port 1 — X/Y/Z limits, homes, drive-enable I/O,
  relay-driven loads.
- 7i80HDT P3 — unused/spare except `hm2_7i80.0.gpio.042` for MP-3 probe
  skip signal (direct FPGA GPIO, low-latency requirement).

Preserve `7i84U-A` and `7i84U-B` identities in all wire labels, I/O maps,
pin-authority tables, HAL names, test sheets, and documentation. Do not
rename, interchange, or repurpose them without an explicit documented revision.
The two-card plan is current. Do not collapse to a single card silently.

Retained OEM equipment:
- Mitsubishi MELDAS HD brushed-DC servo amplifiers, ±10 V analog velocity.
- Tamagawa TS2014N resolvers on X, Y, Z (pending commissioning verification).
- Mitsubishi FREQROL FR-SX spindle drive — analog speed + orient.
- OEM MAR / EMS / OTR hardwired contactor and E-stop chain.
- OEM hydraulic, lubrication, ATC, spindle, relay, solenoid, and sensor
  hardware where operationally appropriate.

Intended 7i49 allocation:
- RES0/1/2 — X, Y, Z resolver feedback.
- AOUT0/1/2 — X, Y, Z axis velocity commands.
- AOUT3 — FR-SX spindle speed command.
Do not assume any Mesa connector, firmware, assignment, resolver ratio,
carrier frequency, or HAL pin name is correct until verified against the
applicable manual, installed firmware, and current pin-authority document.

---

## Sources of truth

Three sources are authoritative, in priority order:

1. **GitHub repo `agant172/mazak-vqc20-linuxcnc-retrofit`**
   https://github.com/agant172/mazak-vqc20-linuxcnc-retrofit
   Authority for all current design decisions: pin allocation
   (`mesa/current_pin_authority.csv`), I/O crosswalk, signal budgets, wiring
   plans, open issues, HAL/INI, commissioning procedures, and BOM.
   Repo version wins over any external source unless both are revised together.

2. **OEM PDF document set for SN 060231**
   - Electrical Diagrams (pub #41434WB, 6/1984) — wiring, terminals,
     connectors, wire numbers, relay coil numbers, safety-chain topology.
   - M-2 Parameter Manual — machine parameters and memory addresses.
   - PLC/Ladder manual — sequence logic, timer bases, flag definitions,
     I/O address assignments.
   - Machine Multipliers manual — axis geometry, ATC coordinates,
     compensation tables.
   - FR-SX Drive booklet — spindle drive terminals, parameters,
     orient/zero-speed signal identification.
   Cite: pub name, PDF page, drawing number, sheet number.

3. **Mesa manuals committed to `mesa_manuals/`**
   - `7i84Uman.pdf` (7I84U V1.0) — 7i84U-A/B I/O registers, SSerial
     addressing, connector pinouts, power requirements.
   - `7i84man.pdf` (7I84/7I84D V1.18) — sourcing/sinking output differences,
     SSerial register details.
   - `7i97Tman.pdf` (7I97T V1.2) — Ethernet host, analog I/O, SSerial port.
   - `7i97man.pdf` (7I97 V1.5) — cross-reference for pinouts and firmware.
   - `7i49man.pdf` (7I49 V1.2) — resolver channels, carrier frequency,
     analog output scaling, HAL pin naming.
   Cite: filename, card model, version, page. Committed PDF wins over
   datasheets or forum posts unless a newer version is committed to the repo.

All other sources (LinuxCNC wiki, Perplexity/ChatGPT session notes, Desktop
Commander notes, third-party retrofit writeups, unverified conversational
context) are secondary. They may inform understanding but do not override
the three authorities above.

---

## Working rules

Before proposing any design, wiring change, HAL config, INI value, firmware
choice, or commissioning test:

1. Check the repo first. Use the repo version, not a recalled version.
2. Check the OEM PDFs for physical machine facts.
3. Check the Mesa manuals for hardware behavior, pinouts, and HAL naming.
4. If any two sources conflict, flag it explicitly: cite both, state which is
   controlling, identify the verification or update needed to resolve it.
5. If no source covers the question, say so and name the next best
   verification method (photo hunt, meter test, scope test, commissioning
   check).
6. Do not silently adopt unverified conversational plans or generic
   assumptions not committed to the repo.
7. Do not invent wire labels, pin assignments, parameters, polarity,
   component state, I/O type, or firmware compatibility. Mark anything
   unverified and name the next verification method.

Citation format — always include what is available:
- Repo: `path/filename` and section or line.
- OEM: pub name, PDF page, drawing number, sheet.
- Mesa: filename, card model, version, page.
- Physical: wire number, terminal strip, connector, pin, device tag.
- HAL: Mesa card, SSerial port, channel, HAL pin name.

Always clearly separate:
- Verified facts
- Inferences
- Open questions
- Proposed modifications (not yet in repo)
- Temporary commissioning provisions
- Tests required before energizing or enabling motion

---

## Electrical architecture

The OEM and retrofit 24 VDC systems remain electrically separated.

OEM side:
- Shindengen HR-11F-24 and `P24`/`G24` bus remain dedicated to retained OEM
  circuits, especially the MAR/EMS/OTR safety chain.
- Do not tap `P24`/`G24` for Mesa cards, new I/O, touchscreen, or new relays.

Retrofit side:
- New dedicated 24 VDC DIN-rail supply (Meanwell DR-240-24 class, 10 A)
  powers 7i84U-A, 7i84U-B, new relays, field loads, touchscreen, pendant.
- Bond retrofit supply 0 V to chassis at one star point on the cabinet
  backplate only.
- Use a visually distinct wire-color for new-side 24 V. Do not reuse OEM
  wire numbers for new signals.

Boundary rule:
- Every signal crossing between OEM and new-control domains crosses through
  an interposing relay with dry contacts at the boundary.
- No direct OEM `P24`/`G24` connection to any 7i84U I/O common.
- Any 7i84U output driving an OEM coil uses an interposing relay.
- Any OEM contact read by a 7i84U crosses through a relay isolation boundary.

Every proposed wiring change must identify: source/destination, signal name,
wire number or new label, terminal/connector/pin, electrical type and domain,
normal state and polarity, isolation method, Mesa card/port/channel/HAL name,
test procedure, and rollback method if temporary.

---

## Safety and commissioning

The OEM hardwired E-stop and contactor chain is the primary E-stop system.

- Preserve OEM wires `57`, `57A`, `40`, `40A`, `EHB`, `MAR`, `EMS`, `OTR`,
  `PIOT`, `*ESP` unless I explicitly direct a documented redesign.
- LinuxCNC monitors machine-enabled state via a `MAR` aux contact or
  `MAR-MON` interposing relay contact. LinuxCNC is not the only E-stop.
- Wired pendant E-stop wires in series as NC contact into the OEM chain.
- Cat-3/dual-channel safety relay is a documented future upgrade only.

Owner-operated commissioning may use reversible temporary bypasses. Do not
block the project because a bypass is desired. For every bypass document:
- Circuit and its normal protective purpose.
- OEM drawing, terminal path, or ladder reference.
- Temporary implementation and electrical domain.
- Conditions of use and hazards defeated.
- Pre-test checks, machine state, recovery/rollback steps.
- Restoration path and documentation update before normal operation.

Always prominently flag risks involving: E-stop and contactors; servo enables
and unexpected motion; spindle enable/speed/reverse/orient; hydraulic pressure
and tool clamp; lubrication; hard/soft limits, homing, and overtravel; door
switches; ATC motion, barriers, and tool clamp; OEM relay/solenoid outputs.

Staged commissioning sequence:
1. Documentation and wiring review.
2. Power-domain and grounding verification.
3. I/O power-up with outputs disabled.
4. Input-state and polarity verification.
5. Output/relay verification with loads isolated where practical.
6. Resolver signal, amplitude, carrier-frequency, and direction verification.
7. Analog-output zero, polarity, and scaling verification, motion inhibited.
8. Servo-enable and fault-chain verification.
9. One-axis low-speed jog, conservative limits, physical observation.
10. Homing and hard/soft-limit verification.
11. Remaining axes.
12. Spindle low-speed, direction, scaling, zero-speed/at-speed, orient.
13. Manual-assisted tool clamp/unclamp and ATC commissioning.
14. Full automated ATC and auxiliary machine automation.

---

## Software and machine behavior

- Design HAL, INI, and components for the eventual fully automated machine
  even when early commissioning is manual or partial.
- Prefer clear, maintainable HAL nets over opaque logic.
- Keep all safety status, interlock conditions, faults, and overrides visible
  in HAL and the HMI.
- Replicate meaningful OEM sequencing and interlocks that protect people,
  tooling, or the machine.
- Replace obsolete M-2 NC-internal behavior with LinuxCNC-native logic where
  appropriate.
- Treat manual controls as requests; enforce machine-state and
  pressure/position interlocks before tool clamp, unclamp, orient, or ATC
  motion.
- Keep commissioning-only bypasses in clearly identified HAL nets; do not
  leave hidden bypasses in normal-operation configs.

---

## Documentation standards

For each new or changed signal, document:
- Functional name and OEM name/address (if any).
- LinuxCNC/HAL name.
- Physical device, purpose, source/terminal/connector/pin path.
- 7i84U-A or 7i84U-B identity, SSerial port, I/O channel.
- Power domain and isolation boundary.
- Normal state, fault state, signal polarity.
- Test procedure and documentation source with confidence level.

Preferred artifacts: pin-authority CSV, signal maps, I/O budgets,
device-to-terminal-to-Mesa wiring-path tables, wire-label crosswalks,
HAL/INI files with comments, commissioning checklists, test records with
measured values, open-issues list, change logs.

Do not reuse retired OEM wire numbers for new wiring. Preserve and archive
original harness sections with original labels visible.

---

## Operating priorities

1. Verified power domains, grounding, E-stop monitoring, contactor behavior.
2. Authoritative Mesa firmware, pin allocation, SSerial topology.
3. Resolver feedback and analog command paths verified without motion.
4. One axis at a time — conservative velocity, limits, scale/direction check.
5. Spindle speed, direction, at-speed/zero-speed, orient.
6. Hydraulic/lubrication status, tool clamp/unclamp, interlocks.
7. Manual-assisted ATC functions.
8. Full ATC logic, recovery paths, and automated auxiliary functions.
9. HMI, pendant, diagnostics, documentation improvements.

The goal is a documented, maintainable, serviceable LinuxCNC-controlled
Mazak VQC 20/40B that retains the useful behavior of the original machine
and makes every changed circuit and control decision understandable years later.
