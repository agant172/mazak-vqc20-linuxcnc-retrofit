# DC bus, stop sequence, and fault behavior (TRA/rectifier stack)

The OEM drive stack on this VQC 20/40 is a **Mitsubishi Meldas TRA-family
transistor amplifier group** sharing a **common DC bus (P/N)** from a
single rectifier unit, with an optional capacitor unit. The retrofit plan
retains this stack as-is; LinuxCNC on the 7i49 drives each axis amplifier
with a ±10 V velocity reference and reads resolvers, but the amplifiers,
rectifier, capacitors, regenerative resistor, and dynamic brake remain
OEM Mitsubishi hardware.

This document establishes what must be surveyed, measured, and documented
on the actual machine **before drives are energized under retrofit
control**. Nothing here is a substitute for measurement — the retrofit
INI/HAL cannot make a shared DC bus safe. The safe stop and fault chain
must be proven by hardware behavior.

## Facts established from the OEM manuals (not from the machine yet)

Sourced from the [TRA-41A/BNP-A8104-A manual](https://www.rgbautomatyka.pl/media/custom/upload/file/f828d04fb4ae38ead861076fa228e53f/TRA-41A-SERVO-DRIVE-MITSUBISHI-MANUAL.pdf)
(also mirrored at [scribd](https://www.scribd.com/document/649035071/TRA-41A-SERVO-DRIVE-MITSUBISHI-MANUAL))
and the Meldas MDS-B / MDS-C1 maintenance manual
([BNP-B3977](https://www.servo-repair.com/documents/mitsubishi/BNP-B3977.PDF),
mirror [Mitsubishi_Manuals_538.pdf](https://s3.amazonaws.com/Icarus/DOCUMENTS/Mitsubishi_Manuals_538.pdf)):

- **Shared DC bus.** The rectifier unit feeds P and N to every axis
  amplifier. TRA-41A p. 3 (Note 3) states: *"The cable connecting PN of
  the rectifier unit and PN of the transistor amplifier TRAUO must be
  1,000 mm or less."* The MDS troubleshooting instructions repeatedly
  refer to *"PN wiring between the units"* and instruct the technician
  to *"check the axis where the alarm occurred, and the axis farthest
  from the power supply"* — i.e. the drives sit in series on one bus,
  not on independent supplies.
- **Optional capacitor unit.** TRA-41A p. 3 (Note 2) shows the rectifier
  PN connected to a capacitor unit at ≤ 250 mm; p. 1 notes that this
  capacitor unit *"may be added or not according to the load inertia
  (JL) referred to the motor shaft."* Whether one is installed on this
  machine is to be surveyed.
- **Discharge time is NOT immediate and is NOT specified as a number**
  in the TRA-41A manual. The Meldas maintenance manual instructs:
  *"Wait at least 10 minutes after turning the power OFF before starting
  wiring or inspections. Failure to observe this could lead to electric
  shocks."* (BNP-B3977 §III-*For Safe Use*, also §I-20). The MDS-C1
  capacitor warning at §III-53 adds: *"When the CHARGE lamp on the front
  of the power supply unit is lit, there is still a voltage in the unit.
  Take care to prevent electric shocks and short circuits. (The voltage
  will remain for several minutes after the power is turned OFF.)"*
- **Live-work confirmation requirement.** The manual explicitly requires:
  *"Before adding or replacing units or parts, always turn OFF the main
  power and confirm that the CHARGE lamp on the power supply unit is not
  lit."* (BNP-B3977 §I-9.) *"Measure the DC bus voltage at the P(+) and
  N(-) terminals … verify that the voltage on the bus capacitors has
  discharged before performing any work on the drive."* (also stated in
  the [Yaskawa-style DC-bus warning in bcn-a211508-004e-h](https://www.scribd.com/document/534030134/bcn-a211508-004e-h-1)
  as a general drive-industry rule).
- **Regenerative resistor:** the MDS-A-CR is identified as
  *"regenerative resistor type power supply"* (BNP-B3977 §7-2-10). For
  the resistance-regenerative type: *"the rotary switch is fixed to 0.
  Always install a contactor."* (§Ch. 2 CAUTION.) *"Shut off the power
  with the error signal. Failure to do so could cause the regenerative
  resistor to abnormally overheat and fires to occur due to faults in
  the regenerative transistor."* (§Ch. 2 CAUTION.) Whether this machine
  uses a resistance-regenerative or power-regenerative supply is to be
  surveyed.
- **Dynamic brake / vertical-axis drop prevention.** The maintenance
  manual mentions *"vertical axis drop prevention time (SV048)"* under
  the READY-OFF sequence, and notes explicitly that some V14L variants
  *"do not have built-in dynamic brakes. An external dynamic brake unit
  must be provided."* The Z-axis specifically must have its brake
  timing/energization verified — a servo-off with no brake set will
  drop the head under gravity.
- **Cross-axis fault propagation.** MDS Alarm E7 is defined as:
  *"CNC emergency stop: An emergency stop signal is being sent from the
  CNC, or an alarm is occurring in another axis."* That is, an alarm on
  one axis is expected to drop the group READY. The MDS also warns:
  *"If the power of the axis not in use is disconnected, the system's
  emergency stop cannot be released."* (§Ch. 9-1-1 rotary-switch
  setting.) In other words, all axis amplifiers must be powered and in a
  known state to release E-stop.

## What must be surveyed on this specific machine

The above facts are from the manual family; the *specific* installation
must be photographed, drawn, and measured. Nothing in the retrofit HAL
can compensate for gaps in the physical stop chain.

- [ ] Photograph the drive cabinet with the OEM covers off in daylight:
      rectifier unit, capacitor unit (if present), regenerative resistor
      (if present), each axis amplifier, all P/N bus bars, incoming AC
      contactor, dynamic brake / Z-brake circuitry. File under
      `docs/photos/09_EStop_Safety_Ready_Chain/` and
      `docs/photos/03_Servo_Drives_XYZ/`.
- [ ] Identify each unit's Mitsubishi part number and match to the
      manual set:
  - Rectifier / power supply unit part number → confirm resistance-
    regenerative vs power-regenerative type.
  - Each axis amplifier part number and axis assignment.
  - Capacitor unit part number (if present) and location.
  - Regenerative resistor part number (if separate).
  - Z-axis dynamic brake / gravity-drop hardware.
- [ ] Draw an **as-built one-line** showing:
  - Incoming 3-phase AC → main contactor → rectifier.
  - Rectifier P/N bus → each axis amplifier P/N (with cable lengths for
    reference; TRA manual: ≤ 1000 mm rectifier↔TRA, ≤ 250 mm
    rectifier↔capacitor unit).
  - Capacitor unit (if present) tap points on the bus.
  - Bleeder / regen path (if separate from the amplifier).
  - Z brake solenoid and its control chain.
  - Every fault / ready contact by name and terminal number: rectifier
    READY, each amplifier ALM/RDY, Z brake feedback if present.
  - All test points and CHARGE-lamp locations.
- [ ] **Measure** the following, with the OEM control still functional
      as a witness where possible:
  - Nominal P/N bus voltage under normal operation (should be ~ 300 V
    DC from 3-phase 200 V AC).
  - Overvoltage trip threshold — MDS manual states *"The voltage between
    PN exceeded 410 V"* for the overvoltage alarm; verify actual trip
    on this rectifier.
  - **Discharge time from operating voltage to < 50 V DC after the AC
    contactor drops out**, with the machine at rest (no regeneration
    contribution). Time this with a scope or DMM in max-hold on the
    P/N test points. Log to `docs/commissioning_logs/dc_bus_discharge_YYYYMMDD.md`.
  - Repeat the discharge measurement immediately after a rapid deceleration
    (the worst case, since the drive dumps kinetic energy back onto the
    bus and can drive it *higher* than steady-state before regen /
    bleeder resistors dissipate it).
  - CHARGE lamp: verify it lights when P/N > ~ 50 V DC and only extinguishes
    below that threshold.
- [ ] Prove **stop sequence** by controlled test with the servo motors
      disconnected from the machine (safe stand-alone bench, or physical
      stops fitted to each axis):
  1. Servo enable OFF → motor coasts / dynamic brake engages if fitted.
  2. Amplifier group READY OFF → any downstream contactors drop out.
  3. Main AC contactor OFF → P/N discharges through bleeder / regen.
  4. Z brake solenoid de-energizes → mechanical brake sets (spring-set,
     electrically-released is the safe design).
  5. CHARGE lamp goes out only when P/N < ~ 50 V.
- [ ] Prove **fault propagation** with the same controlled setup:
  - Simulate an amplifier alarm on X: verify Y, Z, and spindle amplifiers
    all drop READY. Verify the main contactor is dropped by the fault,
    not merely held off by CNC software.
  - Simulate a rectifier overvoltage: verify all amplifiers drop READY
    and the contactor drops.
  - Simulate Z-axis position error: verify Z brake sets *before* the
    servo command is removed (per the vertical-axis drop-prevention
    behavior in MDS §SV048).
  - **Any single amplifier fault must remove all motion permits** to
    the entire group. This is a hardware property of the READY chain,
    not something LinuxCNC can enforce alone.
- [ ] **Categorize the stop** per relevant standards
      ([EN 60204-1](https://www.iso.org/standard/62409.html) /
      [IEC 61800-5-2](https://webstore.iec.ch/publication/29331)):
  - Category 0 (uncontrolled by removal of power) is what the OEM chain
    provides today via the main contactor.
  - Category 1 (controlled deceleration then power removal) is often
    preferable on machining centers; requires that the drives be capable
    of controlled ramp-down before power removal.
  - **Do not upgrade the category on paper alone.** Any category-1
    implementation requires either drive-side STO with SIL-rated
    feedback or a validated time-delay contactor drop with proven
    deceleration under all fault modes.

## Test points to establish and label

Once the survey is complete, label these test points inside the cabinet
for both commissioning and future service:

| Label | Description | Expected reading (typical) |
|-------|-------------|----------------------------|
| TP-DC+ | Rectifier P (positive DC bus) | +150 V DC nominal to case GND on 3-phase 200 V; ~300 V DC across P/N |
| TP-DC- | Rectifier N (negative DC bus) | -150 V DC nominal to case GND on 3-phase 200 V |
| TP-CHG | CHARGE lamp output (indicator) | Lit above ~50 V DC across P/N |
| TP-BRK-Z | Z brake solenoid coil (24 V DC nominal) | +24 V DC when Z is enabled and moving/holding; 0 V when brake is set |
| TP-RDY-X | X amplifier READY contact | closed (or +24 V) when X is ready |
| TP-RDY-Y | Y amplifier READY contact | closed (or +24 V) when Y is ready |
| TP-RDY-Z | Z amplifier READY contact | closed (or +24 V) when Z is ready |
| TP-RDY-S | Spindle amplifier READY contact | closed (or +24 V) when spindle is ready |
| TP-RDY-CV | Rectifier READY contact | closed (or +24 V) when rectifier is ready |
| TP-MAIN-K | Main AC contactor coil | +24 V DC (or 100 V AC per OEM design) when energized |

Update the [7i84U-B legend](../wiring/7i84u_b_terminal_legend.csv) once
which of these signals LinuxCNC needs to monitor (READY chain in) or
inhibit (drive-enable outputs out) is decided — remembering that
LinuxCNC **monitors and inhibits** but is **not** the primary safety
element. See [E-stop schematic and fault-injection matrix](estop_safety_chain.md).

## Retrofit HAL / INI implications

- The 7i84U-B TB3 drive-enable outputs to X/Y/Z (retrofit plan) must
  be wired **in series with**, not in place of, the OEM per-amplifier
  enable inputs and the OEM READY chain. Removing a 7i84U output must
  disable the drives; failing to remove one must NOT bypass an OEM
  interlock.
- LinuxCNC must monitor the rectifier and per-axis READY contacts on
  7i84U-B TB3 inputs (assignment to be finalized once the survey is
  complete) and drop `motion.motion-enabled` (or the servo-off HAL
  net) on any READY-off transition. Failure to detect a READY-off
  must not silently allow the position loop to keep issuing commands.
- The Z brake must have a dedicated 7i84U output only if we are
  certain that de-energizing that output causes the brake to *set*
  (spring-set, electrically-released). If the OEM brake is
  electrically-set / spring-released, do NOT put LinuxCNC in that
  path — retain the OEM brake control chain unchanged.
- **The 7i84U smart-serial link cannot be the sole path for any
  stop or brake permit.** Its watchdog default is 50 ms; hardware
  overtravel and torque removal must not require a software round
  trip. See [smart-serial latency budget](smart_serial_latency.md).

## Sources

- [Mitsubishi TRA-41A / BNP-A8104-A manual](https://www.rgbautomatyka.pl/media/custom/upload/file/f828d04fb4ae38ead861076fa228e53f/TRA-41A-SERVO-DRIVE-MITSUBISHI-MANUAL.pdf)
  — DC bus wiring (Notes 2–4 on p. 3), TRC-1 inter-axis cable, capacitor
  unit sizing, brake unit setting-plug (Z11) behavior. Scribd mirror:
  [TRA-41A-SERVO-DRIVE-MITSUBISHI-MANUAL](https://www.scribd.com/document/649035071/TRA-41A-SERVO-DRIVE-MITSUBISHI-MANUAL).
- [Mitsubishi Meldas MDS-A/B / MDS-C1 maintenance manual (BNP-B3977)](https://www.servo-repair.com/documents/mitsubishi/BNP-B3977.PDF)
  — CHARGE lamp behavior (§I-9, §I-18/19), 10-minute wait requirement
  (§III For Safe Use, §I-20), overvoltage threshold 410 V (§II-15),
  READY chain and vertical-axis drop-prevention (§Ch. 11 E7), rotary-
  switch settings for regenerative types (§Ch. 9). Mirror on Amazon S3:
  [Mitsubishi_Manuals_538.pdf](https://s3.amazonaws.com/Icarus/DOCUMENTS/Mitsubishi_Manuals_538.pdf).
- [Drive-industry P/N discharge warning example (bcn-a211508-004e-h)](https://www.scribd.com/document/534030134/bcn-a211508-004e-h-1)
  — canonical wording: *"verify that the voltage on the bus capacitors
  has discharged before performing any work on the drive. Measure the
  DC bus voltage at the P(+) and N(-) terminals."*
- [LinuxCNC safety warning](https://linuxcnc.org/docs/2.9/html/user/user-concepts.html#_safety)
  — LinuxCNC is not a safety-rated controller; hardwired safety chain
  is required.
