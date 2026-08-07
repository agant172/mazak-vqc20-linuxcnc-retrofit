# FR-SX / SJ spindle orient model — corrected

## Audit finding #16 (verbatim)

> The FR-SX orient description in this repository claims an "analog orient
> reference" on 7i49 AOUT4 (`pwmgen.04`). This is not how Mitsubishi
> orient works. The FR-SX (SJ / FREQROL-SF family) spindle drive does
> not accept an external analog orient reference. Orient is a discrete
> NC-to-drive command; the target angle is fixed by the machine-side
> sensor and drive parameters. Delete the AOUT4 orient reference from
> HAL and READMEs unless proven from the drive manual.

## Standing position

**The audit is correct.** The retrofit does not (and cannot) command
the FR-SX orient position through an analog voltage. AOUT4 is now
documented as SPARE. This document establishes the authoritative model
for how orient is actually issued, monitored, and dropped.

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
([`docs/crosswalk/element_dashboard_crosswalk_summary.md`](crosswalk/element_dashboard_crosswalk_summary.md)).

### Target position is set by drive hardware + parameters

Also from bnp-c3016eng: three detector families are available for
orient, selected by parameter, and physically wired to the drive at
manufacture:

| Detector | Points | Drive connector | Parameter selection |
|---|---|---|---|
| Magnetic sensor (MAGSENSOR) | 1 (single fixed point) | CN6 | `#41 OSL = 2`, `SP037.nsno = 1` |
| External encoder (OSE1024 / RFH-1024) | 4096 (multi-point) | CN6 | `#41 OSL = 1`, `SP037.enco = 1` |
| Motor-built-in PLG detector | 4096 (multi-point) | CN5 | `#41 OSL = 0`, `SP037.plgo = 1` |

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

The physical signal path is already in place in the HAL, matching the
OEM wire-tag survey:

| Signal | Direction | Field wire | Retrofit terminal |
|---|---|---|---|
| ORCM1 orient command | LinuxCNC → FR-SX | Y093 ORCM1.M | 7i84U-B TB3 **OUT4** (via interposing relay to the FR-SX ORC input) |
| CTL low-gear select | LinuxCNC → FR-SX | Y094 CTL.M | 7i84U-B TB3 **OUT5** |
| GSH high-gear solenoid | LinuxCNC → hydraulics | Y00B GSH.M | 7i84U-B TB3 **OUT7** |
| ZS1 spindle zero-speed | FR-SX → LinuxCNC | CN6 ZS1 | 7i84U-B TB3 IN (per pin map) |
| SSET spindle set / orient arrival | FR-SX → LinuxCNC | CN6 SSET | 7i84U-B TB3 IN (per pin map) |

References:
- OEM wire-tag survey with CN6/CN5/CN11 pin table:
  [`docs/photo_survey_misc.md`](photo_survey_misc.md)
- 7i84U-B pin/output allocation:
  [`linuxcnc/field_7i84u.hal`](../linuxcnc/field_7i84u.hal)
- ATC/orient HAL nets:
  [`linuxcnc/atc_orient.hal`](../linuxcnc/atc_orient.hal)
- Element / dashboard crosswalk:
  [`docs/crosswalk/element_dashboard_crosswalk_summary.md`](crosswalk/element_dashboard_crosswalk_summary.md)

### Required orient sequence in `mazak_orient.comp`

The `mazak_orient` HAL component must implement (and be validated
against the OEM ladder rungs transcribed under
[`docs/ladder/orient_ladder_transcription.md`](ladder/orient_ladder_transcription.md)):

1. **Prerequisites gate**
   - Drive READY (`SET1` && `SET2`) asserted.
   - No E-stop, no drive-fault.
   - Spindle command speed set to zero (or a defined low-orient speed
     if the OEM ladder uses one — verify against the transcription).
   - Correct gear range selected and confirmed (CTL for low; GSH for
     high). Orient in the wrong gear range is refused.
   - Optional: wait for `ZS1` (zero-speed feedback) before asserting
     ORCM1 if the OEM ladder requires it.
2. **Assert ORCM1** (OUT4). ORC has priority over SFR/SRV per the
   drive manual, but the ladder-transcribed sequence should be
   preserved — do not drop the run bits before ORCM1 unless the OEM
   sequence does so.
3. **Debounce arrival**: `SSET` (orient arrival) must be TRUE for a
   configurable dwell (default 100 ms; adjustable via
   `mazak-orient.arrival-debounce-ms`) before the component reports
   `orient-done`.
4. **Timeout**: if `SSET` does not assert stably within
   `[SPINDLE] ORIENT_TIMEOUT` seconds (currently 15.0 in
   `mazak_vqc_20_40.ini`), raise `mazak-orient.orient-fault` and log.
5. **De-assert ORCM1** when the remap or operator drops the orient
   request. Per the drive manual, dropping ORC returns to run-at-speed
   if SFR/SRV is still asserted, or to free-run if neither run bit is
   asserted. `mazak_orient.comp` must not assume the drive
   automatically brakes to a stop when ORCM1 drops.
6. **Fault handling**: any drop of drive READY or any drive-fault
   during orient must immediately drop ORCM1, SFR, SRV, and any
   in-flight ATC step. Recovery requires a reset (see
   [`docs/estop_safety_chain.md`](estop_safety_chain.md)).

### Arrival timing budget

The manual does not publish a single "orient time" number because it
depends on:
- Starting spindle speed at ORC assertion (deceleration time).
- Gear ratio (low gear multiplies mechanical inertia through the
  gearbox).
- Servo rigidity parameter (SP001 for magnetic/PLG orient; SP002 for
  encoder orient).
- Detector type (magnetic single-point vs encoder multi-point).

Practical field expectations from experience with FR-SF-class drives:

| Mode | Typical arrival time (from ORC, spindle already at low speed) |
|---|---|
| Magnetic sensor, single-point | ~200-400 ms |
| Encoder, multi-point | ~150-300 ms |

Set `[SPINDLE] ORIENT_TIMEOUT = 15.0` — well above these numbers but
short enough that a stuck ORCM1 raises a fault instead of hanging the
tool-change. This should be re-tuned once we measure actual arrival
time on the machine.

## What has changed in the repo

1. **`linuxcnc/motion_7i80hdt.hal`** — the pwmgen.04 "orient reference"
   block is removed. Header comment now identifies AOUT4 as SPARE with
   a full explanation of why FR-SX orient is discrete, not analog.
2. **`linuxcnc/mazak_vqc_20_40.hal`** — pwmgen inventory comment now
   documents AOUT4/AOUT5 as spare and points to this document.
3. **`linuxcnc/README.md`** — the 7i49 line no longer claims AOUT4
   carries an orient reference; it now points here.
4. **`linuxcnc/atc_orient.hal`** — the ORCM1 discrete output on
   7i84U-B TB3 OUT4 is already the orient command path and is
   unchanged.

## Follow-up work required

- [ ] Transcribe OEM ladder rungs (28xx-29xx) for orient/gear to
  confirm the exact ORCM1 / CTL / SSET / ZS1 sequencing before we
  rewrite `mazak_orient.comp` (already tracked in the crosswalk
  summary).
- [ ] Verify from the FR-SX drive nameplate and its parameter dump
  which detector mode is provisioned on this machine (magnetic
  sensor on CN6, external encoder on CN6, or PLG on CN5). The physical
  cabling determines which `#41 OSL` / `SP037` bits are valid; the
  ladder transcription and orient tuning depend on this.
- [ ] Measure actual orient arrival time in low gear once orient is
  wired end-to-end and set `ORIENT_TIMEOUT` / arrival debounce
  appropriately.
- [ ] Regenerate the 7i80HDT firmware with `num_pwmgens = 3` (drop the
  unused pwmgen.04/05 pair) at the next Mesa firmware refresh.

## Sources

- Mitsubishi Electric FA, MELDAS MDS-CH series instruction manual
  (bnp-c3016eng), spindle control-input bits and orient hardware
  tables: [https://www.mitsubishielectric.com/dl/fa/document/manual/cnc/bnp-c3016(eng)/bnp-c3016(eng)f.pdf](https://www.mitsubishielectric.com/dl/fa/document/manual/cnc/bnp-c3016(eng)/bnp-c3016(eng)f.pdf)
- Mitsubishi FREQROL-SF / SJ spindle maintenance manual (mirror),
  orient sequence prerequisites and OSL/PLG selection:
  [https://manuals.plus/m/37e41d6934496a6467e1b636303c0cb5337c7a675d8f65aed2fd35711a6cd1db](https://manuals.plus/m/37e41d6934496a6467e1b636303c0cb5337c7a675d8f65aed2fd35711a6cd1db)
- Repo cross-references (internal): `docs/photo_survey_misc.md`,
  `docs/crosswalk/element_dashboard_crosswalk_summary.md`,
  `linuxcnc/atc_orient.hal`, `linuxcnc/field_7i84u.hal`,
  `linuxcnc/mazak_vqc_20_40.ini` (`[SPINDLE] ORIENT_TIMEOUT`),
  `docs/estop_safety_chain.md`, `docs/dc_bus_stop_fault.md`.
