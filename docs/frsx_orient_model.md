# FR-SX / SJ spindle orient model — corrected

> **UNVERIFIED FR-SX model & terminal layout (2026-08-06).** The exact FR-SX
> model number on this machine and its terminal-strip layout have not been added
> to the repo. The orient control model below is derived from the general
> Mitsubishi FR-SF / MDS-CH family and is consistent with that family's discrete
> orient command, but the terminals named here (`ORCM`, `ORAR`, `SPD-REACH`,
> `ALM`) must be re-mapped against the actual model's manual before energizing
> the spindle. See [`superseded_claims_2026-08-06.md`](superseded_claims_2026-08-06.md) #17.

## Audit finding #16 (verbatim)

> The FR-SX orient description in this repository claims an "analog orient
> reference" on 7i49 AOUT4 (`pwmgen.04`). This is not how Mitsubishi
> orient works. The FR-SX (SJ / FREQROL-SF family) spindle drive does
> not accept an external analog orient reference. Orient is a discrete
> NC-to-drive command; the target angle is fixed by the machine-side
> sensor and drive parameters. Delete the AOUT4 orient reference from
> HAL and READMEs unless proven from the drive manual.

## Standing position

The active retrofit design does not command orient position through an analog
voltage. AOUT4 is spare and ORCM1 is a discrete output. This is the active
control model, but the exact FR-SX terminal mapping remains unverified until
the drive nameplate, terminal strip, and matching primary manual are captured.

## What the Mitsubishi documentation actually says

The Mitsubishi FR-SF / MDS-CH spindle drive manuals establish the
orient interface as a discrete NC-to-drive control bit with the
position determined by the machine-side sensor selected on the drive
via parameters — not by an analog reference.

### Orient command is a discrete control bit

From the MDS-CH-SP series instruction manual
([bnp-c3016eng, Mitsubishi Electric FA](https://www.mitsubishielectric.com/dl/fa/document/manual/cnc/bnp-c3016(eng)/bnp-c3016(eng)f.pdf)):

> Control input 3, bit C: **ORC — Orientation start command**.
> "This signal starts orientation."
> "1 (ON) Orientation starts regardless of the run command (SRN, SRI)."
> "0 (OFF) When one of the run commands (SRN or SRI) is selected, the
>   motor starts rotating at the commanded speed again."
> "Orientation has a priority when the orientation command is input."

ORC is a **bit sent from the NC to the spindle drive unit**, not a
terminal-block terminal. The corresponding Mazak PLC output on this
machine is **Y093 ORCM1.M** as documented in the OEM wire-tag survey
([`docs/photo_survey_misc.md`](photo_survey_misc.md)) and the
element/dashboard crosswalk
([`archive/crosswalk/element_dashboard_crosswalk_summary.md`](../archive/crosswalk/element_dashboard_crosswalk_summary.md)).

### Target position is set by drive hardware + parameters

Also from bnp-c3016eng: three detector families are available for
orient, selected by parameter, and physically wired to the drive at
manufacture:

| Detector | Points | Drive connector | Parameter selection |
|---|---|---|---|
| Magnetic sensor (MAGSENSOR) | 1 (single fixed point) | CN6 | `#41 OSL = 2`, `SP037.nsno = 1` |
| External encoder (OSE1024 / RFH-1024) | 4096 (multi-point) | CN6 | `#41 OSL = 1`, `SP037.enco = 1` |
| Motor-built-in PLG detector | 4096 (multi-point) | CN5 | `#41 OSL = 0`, `SP037.plgo = 1` |

> **This machine physically has a motor-built-in PLG** — a Tamagawa
> **TS1526N55 optical shaft encoder, 512 counts/turn, DC ±15 V** in the spindle
> motor's terminal box (nameplate photos 2026-08-12,
> [`spindle_motor_plg_encoder.md`](spindle_motor_plg_encoder.md)). Two cautions:
> the **512 counts/turn** does not match the `4096` in the row above (that figure
> is quoted from the later MDS-CH manual — do not apply it to this motor), and
> the mere presence of a PLG **does not prove** `#41 OSL = 0` is what the drive
> is configured for. **Do not assume the parameter numbers in this table apply
> here** — they come from the later MDS-CH manual. What settles it is
> [`frsx_orient_detector_capture.md`](frsx_orient_detector_capture.md), which
> starts by tracing the PLG cable to its drive connector.

Quoted parameter text:

> `#41 OSL`: "The orientation method is set. 0: Motor built-in encoder,
>   1: Encoder, 2: Magnesensor."
> `SP037.enco`: "Encoder orientation Invalid / Valid — Also output to
>   CN8 when valid."
> `SP037.nsno`: "Magnetic sensor orientation Invalid / Valid."
> `SP037.plgo`: "PLG orientation Invalid / Valid — Also output to CN8
>   when valid."

The orient position for magnetic-sensor mode is fixed by the physical
magnet location; for encoder mode it is fixed by the Z-phase / index
mark and the ratio. **The NC does not stream a real-time position
reference to the drive during orient.** It asserts the ORC bit and
waits for the drive's arrival signal.

### Sequencing prerequisites

From the SJ series troubleshooting section
([manuals.plus mirror of FREQROL-SF manual](https://manuals.plus/m/37e41d6934496a6467e1b636303c0cb5337c7a675d8f65aed2fd35711a6cd1db)):

> "The NC ready ON signal and spindle amplifier CON1 ready signal
> (SET1, SET2) become ready when both the signals are turned on."
> "It takes 1 set or more until the command of the forward rotation
>   signal, reverse rotation signal or orientation signal is received
>   after the ready ON state."
> "When both the forward rotation signal and reverse rotation signal
>   are turned on at a time, the motor does not rotate (it becomes the
>   DC exciting state)."
> "Unless the forward rotation signal, reverse rotation signal or
>   orientation signal is inputted the motor is in the free run state
>   where the base shut-off takes place."

Practical translation for this retrofit:

1. Drive must have completed READY handshake (SET1/SET2) before ORCM1
   is meaningful.
2. ORCM1 asserted while SFR or SRV is asserted causes the drive to
   decelerate the motor, brake, and hold at the sensor-defined position.
3. If both SFR and SRV are asserted, the motor is DC-excited (does not
   move); orient in that condition is undefined and must not be
   commanded.
4. Dropping ORCM1 while SFR or SRV is still asserted returns the motor
   to run at the commanded speed. Dropping ORCM1 with no run command
   returns the motor to base-shutoff free-run.

## How this retrofit issues, monitors, and drops orient

The logical assignments are present in HAL. They remain PROPOSED or
COMMISSIONING_PENDING in `mesa/current_pin_authority.csv`; this table is not a
claim that the field wiring or FR-SX terminals have been proven:

| Signal | Direction | Field wire | Retrofit terminal |
|---|---|---|---|
| ORCM1 orient command | LinuxCNC → FR-SX | Y093 ORCM1.M | 7i84U-A TB3 **OUT4** (planned interposing relay; exact drive terminal unverified) |
| CTL low-gear select | LinuxCNC → FR-SX | Y094 CTL.M | 7i84U-A TB3 **OUT5** |
| GSH high-gear solenoid | LinuxCNC → hydraulics | Y00B GSH.M | 7i84U-A TB3 **OUT7** |
| ORA1 orient arrival | FR-SX → LinuxCNC | X003 ORA1 | 7i84U-A TB3 **IN4** (exact drive terminal unverified) |
| SZS spindle zero-speed | FR-SX → LinuxCNC | X001 SZS.M | 7i84U-A TB3 **IN5** (exact drive terminal unverified) |
| Speed reach | FR-SX → LinuxCNC | archived signal identity pending trace | 7i84U-A TB3 **IN13** |
| FR-SX alarm | FR-SX → LinuxCNC | archived signal identity pending trace | 7i84U-A TB3 **IN14** |
| SSET drive arm/permissive | LinuxCNC → FR-SX | Y092 SSET.M | **Unassigned and physically unbound** pending proof that it is required |

References:
- OEM wire-tag survey with CN6/CN5/CN11 pin table:
  [`docs/photo_survey_misc.md`](photo_survey_misc.md)
- 7i84U-A/B field-I/O allocation:
  [`linuxcnc/field_7i84u.hal`](../linuxcnc/field_7i84u.hal)
- ATC/orient HAL nets:
  [`linuxcnc/atc_orient.hal`](../linuxcnc/atc_orient.hal)
- Element / dashboard crosswalk:
  [`archive/crosswalk/element_dashboard_crosswalk_summary.md`](../archive/crosswalk/element_dashboard_crosswalk_summary.md)

### Required orient sequence in `mazak_orient.comp`

The `mazak_orient` HAL component must implement (and be validated
against the OEM ladder rungs transcribed under
[`docs/ladder/orient_ladder_transcription.md`](ladder/orient_ladder_transcription.md)):

1. **Prerequisites gate**
   - `machine-ready`, `servo-ready`, and `estop-ok` are TRUE and
     `spindle-fault` is FALSE. These polarities are fail-off placeholders until
     field verified.
   - A zero-speed dwell is required before any needed gear shift, then the
     selected gear's confirmation input must be TRUE.
   - The active `spindle-motion-permit` additionally requires the static
     commissioning hold, watchdog health, LinuxCNC machine-on, and no indicated
     spindle fault before a physical FR-SX command can energize.
2. **Assert ORCM1** (7i84U-A OUT4). The component asserts its logical command
   only after the selected gear confirms and the gear-shift state is inactive;
   HAL then gates the physical output with `spindle-motion-permit`.
3. **Debounce arrival**: `ORA1` (`spindle-oriented`, 7i84U-A IN4) must remain
   TRUE for `mazak-orient.arrival-debounce` (currently 0.3 s). The value is
   unverified because the OEM timer base has not been established.
4. **Timeout**: the component raises AL45 after
   `mazak-orient.orient-timeout` (currently 10.0 s) without a debounced arrival.
   The remap has a separate outer `[ATC] ORIENT_TIMEOUT` wait of 15.0 s so the
   component alarm should occur first. Both values require machine measurement.
5. **De-assert ORCM1** when the remap or operator drops the orient
   request. Per the drive manual, dropping ORC returns to run-at-speed
   if SFR/SRV is still asserted, or to free-run if neither run bit is
   asserted. `mazak_orient.comp` must not assume the drive
   automatically brakes to a stop when ORCM1 drops.
6. **Fault handling**: loss of machine-ready, servo-ready, or E-stop health
   drops the component drive-arm and ORCM1. An indicated spindle fault also
   removes the dynamic permit from FWD, REV, RUN, ORCM1, and the analog-output
   enable, feeds `mazak-orient.drive-fault`, and asserts the ATC abort path.
   These are software interlocks; the hardwired E-stop chain remains primary.

### Arrival timing budget

The manual does not publish a single "orient time" number because it
depends on:
- Starting spindle speed at ORC assertion (deceleration time).
- Gear ratio (low gear multiplies mechanical inertia through the
  gearbox).
- Servo rigidity parameter (SP001 for magnetic/PLG orient; SP002 for
  encoder orient).
- Detector type (magnetic single-point vs encoder multi-point).

No supported source establishes an arrival-time range for this exact FR-SX,
motor, detector, gearbox, and machine inertia. Record commanded speed, gear,
ORCM1 edge, ORA1 edge, and repeatability on the machine. Set the component
watchdog from those measurements, then keep the remap's outer wait longer than
the component watchdog.

## What has changed in the repo

1. **`linuxcnc/motion_7i80hdt.hal`** — the pwmgen.04 "orient reference"
   block is removed. Header comment now identifies AOUT4 as SPARE with
   a full explanation of why FR-SX orient is discrete, not analog.
2. **`linuxcnc/mazak_vqc_20_40.hal`** — pwmgen inventory comment now
   documents AOUT4/AOUT5 as spare and points to this document.
3. **`linuxcnc/README.md`** — the 7i49 line no longer claims AOUT4
   carries an orient reference; it now points here.
4. **`linuxcnc/atc_orient.hal`** — the ORCM1 discrete output on
   7i84U-A TB3 OUT4 is already the orient command path and is
   unchanged.

## Follow-up work required

- [ ] Validate the existing orient/gear transcription and
  `mazak_orient.comp` against readable OEM sheets 28xx-30xx and 55xx; resolve
  every ambiguous contact, timer base, and SSET/SET1/SET2 identity before live
  operation.
- [ ] Verify from the FR-SX drive nameplate and its parameter dump
  which detector mode is provisioned on this machine (magnetic
  sensor on CN6, external encoder on CN6, or PLG on CN5). The physical
  cabling determines which `#41 OSL` / `SP037` bits are valid; the
  ladder transcription and orient tuning depend on this.
  **Narrowed 2026-08-12, not closed:** a motor-built-in PLG is confirmed to
  exist (Tamagawa TS1526N55, [`spindle_motor_plg_encoder.md`](spindle_motor_plg_encoder.md)),
  so `OSL = 0` is now plausible — but a magnetic sensor or a machine-side
  encoder on CN6 has not been ruled out, and the schematics' separate
  "SPINDLE ENCODER" (`MS3108B 20-29P`, dwg 4143075301 p090) is still
  unaccounted for.
  **Capture procedure: [`frsx_orient_detector_capture.md`](frsx_orient_detector_capture.md).**
  An earlier revision said "reading `#41 OSL` and `SP037` remains the item that
  closes this" — **that was overstated.** Those parameter numbers are quoted
  above from the later **MDS-CH** manual and may not exist on a 1985 FR-SX. The
  procedure leads instead with **tracing the PLG cable to its drive connector**,
  which is more certain and needs no power.
- [ ] Measure actual orient arrival time in low gear once orient is
  wired end-to-end and set `mazak-orient.orient-timeout`,
  `mazak-orient.arrival-debounce`, and the outer `[ATC] ORIENT_TIMEOUT`
  appropriately.
- [ ] Keep `num_pwmgens = 4` while AOUT3 supplies the spindle velocity
  command. Four instances are pwmgen.00-.03; reducing the count to three
  would remove the spindle command rather than an unused channel.

## Sources

- Mitsubishi Electric FA, MELDAS MDS-CH series instruction manual
  (bnp-c3016eng), spindle control-input bits and orient hardware
  tables: [https://www.mitsubishielectric.com/dl/fa/document/manual/cnc/bnp-c3016(eng)/bnp-c3016(eng)f.pdf](https://www.mitsubishielectric.com/dl/fa/document/manual/cnc/bnp-c3016(eng)/bnp-c3016(eng)f.pdf)
- Mitsubishi FREQROL-SF / SJ spindle maintenance manual (mirror),
  orient sequence prerequisites and OSL/PLG selection:
  [https://manuals.plus/m/37e41d6934496a6467e1b636303c0cb5337c7a675d8f65aed2fd35711a6cd1db](https://manuals.plus/m/37e41d6934496a6467e1b636303c0cb5337c7a675d8f65aed2fd35711a6cd1db)
- Repo cross-references (internal): `docs/photo_survey_misc.md`,
  `archive/crosswalk/element_dashboard_crosswalk_summary.md`,
  `linuxcnc/atc_orient.hal`, `linuxcnc/field_7i84u.hal`,
  `linuxcnc/mazak_vqc_20_40.ini` (`[ATC] ORIENT_TIMEOUT`),
  `docs/estop_safety_chain.md`, `docs/dc_bus_stop_fault.md`.
