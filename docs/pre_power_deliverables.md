# Pre-power deliverables charter and evidence-state taxonomy

## Audit finding #23 (verbatim)

> Missing pre-power deliverables.
> Consequence: control power, DC bus, amp enable, brake release,
> spindle rotation, first motion, and automatic M6 all sit on
> claim-level evidence.
> Truth: sixteen concrete deliverables are prerequisites to any
> live power. Until each one exists in the repo (or in signed
> off-repo binders where the artefact is physical, e.g. photos),
> `ACCEPTED`, `ACCEPTED_VERIFY`, `CONFIRMED`, and
> `CURRENT_AUTHORITY` overstate evidence.
> Edit: enumerate the sixteen deliverables with acceptance
> criteria; replace overstated evidence states with a graded
> taxonomy; add signed hold points.

## New evidence-state taxonomy

Every row in [`../mesa/current_pin_authority.csv`](../mesa/current_pin_authority.csv)
and every claim in the repo carries an `authority_status`. This
audit introduces a graded taxonomy that separates **claims about
the paper design** from **evidence about the physical machine**.

| State | Meaning | Who assigns | What is required to enter this state |
|---|---|---|---|
| `PROPOSED` | The signal is in the paper design. No physical verification yet. | Repo author | Row exists in the CSV or a design doc names the signal. |
| `TRACED` | The wire path has been physically traced end-to-end on the machine. Terminal, jacket colour, and destination confirmed by continuity with the field side de-energised. | Machine owner with meter | Continuity checked in both states of the switch/load; conductor colour and terminal number recorded in the row's `cleanup_notes`. |
| `ELECTRICALLY_VERIFIED` | Powered to nominal control voltage and measured with a meter or scope. Voltage in normal state, voltage in tripped state, and rated current all recorded. | Machine owner with meter under supervised power-up | 24 VDC bus measured, load impedance measured, coil current or logic-input voltage measured, fail-open behaviour proven. |
| `HAL_VERIFIED` | The HAL pin toggles correctly in response to the physical stimulus, and no unexpected HAL pin toggles at the same time. Captured via `halscope` or `halsampler`. | Retrofit commissioner with halscope trace | Trace saved under `docs/commissioning_logs/`; the trace filename referenced from the row. |
| `COMMISSIONED` | The signal has passed its safety/functional acceptance under normal machine operation, including any fault-injection test in its safety role. | Retrofit commissioner after acceptance run | Fault-injection test log entry from the appropriate acceptance procedure (E-stop chain, hm2_eth, servo commissioning, etc.). |

The following are also terminal authority states. They describe factory
construction or factory-defined interfaces and therefore do not progress
through the field-wire evidence ladder above:

| State | Meaning | Acceptance evidence |
|---|---|---|
| `FACTORY_LINK` | Final assignment for a factory-built Mesa interconnect. Individual conductors are not field-audited or re-terminated. | Confirm the correct assembly, connector orientation/keying, full seating, strain relief, and absence of visible damage; then verify that the expected Mesa cards enumerate without smart-serial, watchdog, or communication faults. For this retrofit, distinguish the Mesa 50-pin IDC segment from the CAT5 smart-serial segment. |
| `FACTORY_INTERFACE` | Final identity and assignment for an OEM machine interface established by the applicable Mazak/Mitsubishi drawing or factory connector documentation. | Record the authoritative drawing/connector reference. This state finalizes interface identity; it does not by itself claim powered functional commissioning or safety validation. |

`UNBOUND` is a legacy spelling of `DEFERRED`: the function is intentionally
not assigned to an active HAL or physical channel. New rows should use
`DEFERRED`; existing `UNBOUND` rows may remain until the next routine cleanup.

**Retired states.** The following states are removed from the
authority CSV as of this commit; existing rows carrying them
migrate as documented in the migration table below.

| Retired state | Migrates to | Rationale |
|---|---|---|
| `ACCEPTED` | `PROPOSED` (for all current 7i44 RJ45 pinout rows) | The 7i44 RJ45 pinout is copied from the [7i44 Mesa manual](https://store.mesanet.com/index.php?product_id=44); the paper claim is fine, but until the physical link is built and blinking, calling it `ACCEPTED` overstates evidence. `PROPOSED` accurately reflects "design carries this claim, physical build has not confirmed it." |
| `ACCEPTED_VERIFY` | `PROPOSED` | The `_VERIFY` suffix acknowledged pending verification but the prefix `ACCEPTED_` still implied more evidence than exists. `PROPOSED` is honest. When continuity + polarity + fail-open have all been done at the machine, promote to `TRACED` and eventually `ELECTRICALLY_VERIFIED`. |
| `CONFIRMED` | `TRACED` if wire actually traced, else `PROPOSED`. No rows in the current CSV carry this state (audit-preventive). | Same overstatement problem. |
| `CURRENT_AUTHORITY` | `PROPOSED`, `TRACED`, or `ELECTRICALLY_VERIFIED` per case. No rows in the current CSV carry this state (audit-preventive). | The word "authority" without evidence is exactly what the audit flags. |

The following existing states are unchanged and remain in use:

- `COMMISSIONING_PENDING` — signal defined, physical
  verification deferred to commissioning. Interchangeable with
  `PROPOSED` at this stage; retained because 50 rows use it and
  the meaning is compatible.
- `SPARE` — pin allocated for future use, no signal assigned.
- `RESERVED` / `RESERVED_VERIFY` — pin held for a specific
  future function.
- `DEFERRED` — signal is out of first-power scope by decision.
- `UNBOUND` — legacy alias for `DEFERRED`; no active HAL or physical binding.
- `HOLD_CONFLICT` — conflicting authority claims between docs;
  requires reconciliation before promotion.
- `OPTIONAL_VERIFY` — signal is not on the critical path.

## The sixteen pre-power deliverables

Each deliverable below is a **binder item**. It exists either as
a file in this repo or as a signed off-repo artefact (photograph,
signed continuity worksheet, purchase-order record, etc.).
"Signed" means the owner of the machine has initialled and dated
the physical page or the digital equivalent (git-committed with
their name attached, or countersigned PDF).

The status column in the table below is a **planning state**, not
an evidence claim — it says whether the deliverable exists yet.

The checked-in HAL also contains two deliberate fail-off commissioning holds:
`drive-output-permit` gates all three axis drive enables and
`spindle-output-permit` feeds a dynamic gate covering FWD, REV, RUN, ORCM1,
and the spindle analog-output enable. The dynamic gate also requires watchdog
health, E-stop health, machine-on, servo-ready, and no indicated spindle fault.
Both static holds initialize FALSE. A hold may be changed to TRUE only in a
reviewed commissioning edit after the corresponding signed hold point below;
it must never be bypassed with an ad-hoc `halcmd sets` instruction.

### D1 — As-built one-line and terminal plan

- **Contents required:** electrical one-line for the retrofit
  cabinet plus terminal-by-terminal plan showing wire numbers,
  fuse values, conductor gauge, PE/0 V/shield structure, and the
  old/new boundary between OEM and retrofit wiring.
- **Acceptance criteria:**
  1. Every wire that leaves the cabinet has a unique wire number.
  2. Every conductor gauge is stated on the drawing (not "as
     required").
  3. Every fuse or breaker rating is stated on the drawing.
  4. Every PE bond point is identified with a symbol distinct
     from 0 V/GND.
  5. The old/new boundary is drawn as a distinct line separating
     OEM-retained wiring from retrofit wiring.
- **Owner:** machine owner. **Status:** NOT YET DRAFTED. **Where
  it lands:** `wiring/asbuilt_oneline.pdf` (photo-scan) or
  equivalent Kicad export under `wiring/schematic/`.
- **Blocks:** all live-power hold points.

### D2 — Installed nameplate register

- **Contents required:** physical nameplate photograph and
  transcription for every installed axis resolver, every axis
  amplifier, the FR-SX spindle drive with orient-option code,
  the spindle encoder, every relay, every contactor, every
  solenoid, and the probe interface board.
- **Acceptance criteria:**
  1. Every axis resolver suffix (e.g. `TS2014N###E##`) is
     recorded from a photograph, not from a general Mazak
     drawing.
  2. Every MELDAS amplifier part number and its command/
     enable/fault terminal designations are recorded from a
     photograph of the drive front cover and terminal cover.
  3. The FR-SX suffix, including the orient option code, is
     recorded.
  4. The spindle encoder part number and interface type
     (single-ended TTL vs differential RS-422) is recorded.
  5. Every relay coil voltage and every solenoid coil voltage
     (24 VDC vs 100 VAC) is recorded.
  6. The probe interface (Renishaw MI-8 or equivalent, or bare
     wiring) is recorded.
- **Owner:** machine owner. **Status:** PARTIAL — photograph
  survey drafted in `docs/cabinet_photo_checklist.md`; resolver
  suffix work drafted in `bom/README.md`. Photos not yet
  captured. **Where it lands:** `docs/nameplate_register.md`, with the
  photographs filed in Drive under the folder matching each device
  ([scheme](README_photo_sorting.md)).
- **Blocks:** [`servo_commissioning.md`](servo_commissioning.md),
  [`frsx_orient_model.md`](frsx_orient_model.md), first drive
  enable.

### D3 — Immutable Mesa firmware package

- **Contents required:** the actual `.bit` file used by
  `mesaflash`, its SHA-256 checksum, provenance (Mesa release
  URL or Efinity build), the VHDL/Efinity project source
  version, the `mesaflash --readhmid` output, and a recovery
  procedure.
- **Acceptance criteria:**
  1. `.bit` file committed (or its Git-LFS pointer committed
     under `mesa/firmware/`).
  2. SHA-256 recorded and cross-checked at every flash.
  3. Source: either a Mesa release URL (e.g. [7I80HDT Efinix
     project file thread](https://forum.linuxcnc.org/27-driver-boards/51589-7i80hdt-efinix-project-file))
     or a git commit in the Efinity project.
  4. `mesaflash --readhmid` output committed as
     `mesa/firmware/readhmid_YYYY-MM-DD.txt`.
  5. Recovery procedure documents which jumper positions restore
     the factory bootloader and how to recover a bricked card.
- **Owner:** retrofit commissioner. **Status:** COMPLETE (2026-08-13). Bitfile
  `7i80hdt_rmsvss6_8.bin` is flashed (2026-08-11); layout/identity
  confirmed by two independent `readhmid` reads (2026-08-11, 2026-08-13,
  byte-identical) plus a recorded SHA-256 and a pre-flash flash backup.
  All five acceptance items are closed: item 1 (binary committed at
  [`../mesa/firmware/7i80hdt_rmsvss6_8.bin`](../mesa/firmware/7i80hdt_rmsvss6_8.bin),
  verified against the recorded SHA-256), item 2 (SHA-256), item 3 (source —
  obtained directly from Peter Wallace, Mesa Electronics, at
  `freeby.mesanet.com/7i80hdt_rmsvss6_8.zip`, 2026-08-11), item 4 (`readhmid`
  output at `mesa/firmware/readhmid_2026-08-13.txt`), and item 5 (recovery
  procedure — the fallback + W5 dual-flash procedure from the 7I80HD manual,
  now committed at [`../docs/Mesa Manuals/7i80hdman.pdf`](../docs/Mesa%20Manuals/7i80hdman.pdf)
  and transcribed in `mesa_firmware_checklist.md`). See
  [`../mesa/mesa_firmware_checklist.md`](../mesa/mesa_firmware_checklist.md#recovery-procedure-d3-item-5)
  and [`../mesa/firmware/README.md`](../mesa/firmware/README.md).
- **Where it lands:** `mesa/firmware/` with a `README.md`
  describing the package (done — see
  [`../mesa/firmware/README.md`](../mesa/firmware/README.md)).
- **Blocks:** control-power hold point.

### D4 — I/O checkout sheet

- **Contents required:** one row per physical input and output
  giving pin, wire number, input mode (source/sink) or output
  mode, nominal voltage and current, normal state and tripped
  state (voltage measured, not inferred), HAL pin name it
  connects to, and a signed test box.
- **Acceptance criteria:**
  1. Every 7i84U-A row and every 7i84U-B row from
     [`../mesa/current_pin_authority.csv`](../mesa/current_pin_authority.csv)
     appears in the sheet.
  2. Every row has a voltage measured at the terminal in both
     states.
  3. Every input is exercised at its physical source (switch,
     sensor, prox) and the HAL pin toggle observed.
  4. Every output is exercised one at a time through a reviewed,
     low-energy checkout path and the intended load is verified. Linked
     output pins must be commanded through their normal HAL request path;
     do not use `halcmd setp` to bypass the axis/spindle commissioning holds
     or the component interlocks. An unbound proposed output requires a
     temporary checkout configuration that is reviewed and removed after
     the test.
  5. The sheet is signed and dated by the person performing the
     test.
- **Owner:** retrofit commissioner. **Status:** NOT YET DRAFTED.
- **Where it lands:** `wiring/io_checkout_sheet.md` plus
  `docs/commissioning_logs/io_checkout_signed.pdf`.
- **Blocks:** amp-enable hold point.
- **Cross-links:** [`io_capacity_reconciliation.md`](io_capacity_reconciliation.md)
  is the parent inventory; this checkout sheet is the row-by-row
  physical acceptance.

### D5 — Hardware E-stop / guard risk assessment and schematic

- **Contents required:** hazard identification, category rating
  (ISO 13849-1 PL or IEC 62061 SIL as scoped), hardwired stop
  category, guard-interlock architecture, restart rules, and
  a fault-injection acceptance matrix.
- **Acceptance criteria:**
  1. Hazard list identifies every rotating, hydraulic, and
     stored-energy hazard on the machine.
  2. Category (Cat 0, Cat 1, Cat 2 per ISO 13850) for E-stop
     is documented.
  3. Schematic shows the two-channel hardware chain (if any).
  4. Restart rules state whether a self-check is required after
     E-stop reset.
  5. Fault-injection matrix from [`estop_safety_chain.md`](estop_safety_chain.md)
     is executed and signed off.
- **Owner:** machine owner + retrofit commissioner jointly.
  **Status:** PARTIAL — [`estop_safety_chain.md`](estop_safety_chain.md)
  covers the software chain and fault-injection matrix skeleton;
  the hardware risk assessment side and category rating are not
  yet in the repo.
- **Where it lands:** `docs/safety/risk_assessment.md` plus
  signed acceptance under `docs/commissioning_logs/`.
- **Blocks:** control-power hold point.

### D6 — Shared-bus precharge / energize / discharge / regen / lockout

- **Contents required:** procedure covering how to bring the
  Mitsubishi TRA DC-bus stack up (precharge sequence), how to
  discharge it safely, how regen is handled, how to lock out
  for service, and the measured safe-discharge time from
  operating voltage to the touch-safe/service threshold specified by the
  identified Mitsubishi bus documentation and the site's lockout procedure.
  No numeric threshold is assumed until those sources are captured.
- **Acceptance criteria:**
  1. Precharge sequence documents the contactor / resistor /
     bypass timing.
  2. Discharge test log shows time from at-rest and from post-rapid-decel to
     the documented service threshold. Record the source for that threshold
     and the measured voltage/time trace; do not substitute a calculated
     decay time.
  3. Regen path documented (does the machine dump to a resistor,
     or return to bus?).
  4. Lockout procedure documented per OSHA / lockout-tagout
     conventions.
- **Owner:** machine owner. **Status:** DRAFTED — see
  [`dc_bus_stop_fault.md`](dc_bus_stop_fault.md); discharge test
  and precharge sequence not yet measured.
- **Where it lands:** [`dc_bus_stop_fault.md`](dc_bus_stop_fault.md)
  and `docs/commissioning_logs/dc_bus_discharge_YYYY-MM-DD.txt`.
- **Blocks:** DC-bus hold point, amp-enable hold point.

### D7 — Enable / fault / ready / Z-brake timing budget

- **Contents required:** timing diagram covering normal stop,
  hardware E-stop, mains loss, NIC loss, and single-axis fault.
  Each timing must show S-ON deassert, brake command, brake
  physical drop time, and drive coast time.
- **Acceptance criteria:**
  1. Diagram for each of the five stop conditions above.
  2. Brake drop time measured from the SOL-201 solenoid
     (N1J-L2-201 Z brake release) datasheet or measurement.
  3. Coast time measured from drive spec sheets.
  4. E-stop timing verified against the fault-injection matrix.
- **Owner:** retrofit commissioner. **Status:** TEMPLATE DRAFTED —
  [`stop_timing_budget.md`](stop_timing_budget.md); physical measurements are
  not yet captured.
- **Where it lands:** `docs/stop_timing_budget.md`.
- **Blocks:** amp-enable hold point, brake-release hold point.

### D8 — Resolver phasing / commissioning procedure

- **Contents required:** winding-pair identification procedure
  (ohmmeter with drives disabled), suffix confirmation from
  DC resistance vs datasheet, excitation frequency verification
  under load, SIN/COS amplitude and phase at rest and at speed,
  signed scale determination, noise capture per
  [`grounding_shielding_plan.md`](grounding_shielding_plan.md),
  and independent travel proof (a known move verified against
  the resolver count independently, e.g. by dial indicator).
- **Acceptance criteria:**
  1. Winding-pair map recorded for each axis.
  2. Suffix confirmed from DC resistance comparison to datasheet.
  3. Excitation frequency at 5 kHz (or the corrected value)
     verified on scope.
  4. SIN/COS scope traces saved to
     `docs/commissioning_logs/resolver_traces/`.
  5. Signed scale value populated in
     [`../linuxcnc/mazak_vqc_20_40.ini`](../linuxcnc/mazak_vqc_20_40.ini).
  6. Independent scale/direction proof with drive torque disabled: move the
     mechanism by an approved manual/service method over a measured distance
     or rotate the screw a known number of turns, then compare resolver counts
     and dial-indicator travel. A powered commanded move belongs to D9.
- **Owner:** retrofit commissioner. **Status:** PROCEDURE DRAFTED —
  [`resolver_commissioning.md`](resolver_commissioning.md); per-axis suffixes,
  scope traces, and signed scales are not yet captured.
- **Where it lands:** `docs/resolver_commissioning.md` and
  scope traces under `docs/commissioning_logs/`.
- **Blocks:** first-motion hold point.

### D9 — First-move plan

- **Contents required:** one-axis, low-clamp, direction-proof
  first motion. Specifies which axis moves first, the analog
  command clamp and resulting speed bound, the direction to be commanded
  first, a reachable E-stop, the mechanical clearance zone, the
  following-error limit, and the rollback criteria.
- **Acceptance criteria:**
  1. Axis chosen from a documented hazard/clearance review. Do not choose Z
     first by convention; the gravity axis remains blocked until brake
     sequencing and holding capacity are proven.
  2. Analog-command clamp written into HAL and converted to measured voltage
     and predicted maximum speed. It limits velocity command, not motor torque.
  3. Direction pre-computed from the resolver phasing (D8).
  4. E-stop button within reach of the operator standing at the
     commanded direction of motion.
  5. Clearance exceeds the measured worst-case stop distance plus a signed
     margin; this repo does not prescribe a universal distance.
  6. Following-error limit trips a direction/scale fault before the clearance
     margin is consumed but remains above verified feedback/noise error.
  7. Rollback: if any of `packet-error-exceeded`, `watchdog`,
     following-error, or E-stop trips, the operator does not
     retry until the log is reviewed.
- **Owner:** retrofit commissioner. **Status:** PROCEDURE DRAFTED — machine-
  specific values and signatures remain blank in
  [`first_move_plan.md`](first_move_plan.md).
- **Where it lands:** `docs/first_move_plan.md`.
- **Blocks:** first-motion hold point.

### D10 — Velocity-mode tuning procedure and saved traces

- **Contents required:** per-axis velocity-mode PID tuning
  procedure with step-response traces cold and hot, unloaded
  and loaded. Saved traces committed.
- **Acceptance criteria:**
  1. Procedure follows [`servo_commissioning.md`](servo_commissioning.md).
  2. `halscope` traces for step response, cold and hot,
     unloaded (no cutter, no fixture) and loaded (representative
     workpiece).
  3. Trace files under `docs/commissioning_logs/tuning/`.
  4. PID values populated in
     [`../linuxcnc/mazak_vqc_20_40.ini`](../linuxcnc/mazak_vqc_20_40.ini).
- **Owner:** retrofit commissioner. **Status:** PROCEDURE
  DRAFTED — [`servo_commissioning.md`](servo_commissioning.md).
  Traces not yet captured (no live drives yet).
- **Where it lands:** `docs/commissioning_logs/tuning/`.
- **Blocks:** cutting-air-cuts hold point.

### D11 — Physical travel / envelope survey

- **Contents required:** measured X, Y, Z travel from limit to
  limit; the ATC-zone boundary in Y (currently `+0.0394` per
  [`y_soft_limit_atc_zone.md`](y_soft_limit_atc_zone.md));
  the RP2 ATC-zone upper limit `+9.5000`; home-strategy
  documented; stop-distance margin from rapid to zero.
- **Acceptance criteria:**
  1. Physical travel measured with a scale or dial indicator,
     not inherited from OEM Mazak numbers.
  2. ATC-zone boundary confirmed against PRS-55 / PRS-66
     activation.
  3. Home strategy documented (which axis first, in which
     direction).
  4. Stop-distance margin measured under commanded stop, drive-fault, E-stop,
     and power-loss cases. A velocity/acceleration calculation may be a
     lower-bound check but is not acceptance evidence.
- **Owner:** retrofit commissioner. **Status:** PARTIAL — Y
  envelope covered by [`y_soft_limit_atc_zone.md`](y_soft_limit_atc_zone.md);
  X and Z envelopes and stop-distance measurements not yet
  captured.
- **Where it lands:** `docs/envelope_survey.md`.
- **Blocks:** rapid-testing hold point, automatic-M6 hold point.

### D12 — FR-SX speed / orient / gear state diagram

- **Contents required:** state diagram showing the FR-SX
  speed/orient/gear signals with terminal designations,
  polarity, debounce intervals, timeouts, and failure cleanup
  paths.
- **Acceptance criteria:**
  1. State diagram covers: at-rest, SFR asserted (spindle
     forward), SRV asserted (spindle reverse), ORCM1 asserted
     (orient), gear change (high/low SOL-12/SOL-13), and
     fault.
  2. Every transition has a measured or manufacturer-justified debounce
     interval and timeout. No generic 50 ms debounce or 5 s orient timeout is
     assumed; record the selected values and the evidence used to choose them.
  3. Failure cleanup: what happens if orient never arrives, if
     zero-speed never asserts, if the drive faults mid-move.
  4. Signal terminal designations from the FR-SX manual page,
     not inferred.
- **Owner:** retrofit commissioner. **Status:** DIAGRAM DRAFTED —
  [`frsx_state_diagram.md`](frsx_state_diagram.md) and
  [`frsx_orient_model.md`](frsx_orient_model.md); exact terminals,
  polarities, and measured timing are still open.
- **Where it lands:** `docs/frsx_state_diagram.md`.
- **Blocks:** spindle-rotation hold point.

### D13 — ATC hazard analysis and dry-cycle fixture

- **Contents required:** hazard analysis for the tool changer,
  a dry-cycle fixture (mechanical block that lets the ATC
  cycle without a spindle tool interfering), and proof that
  mutually exclusive devices (e.g. tool clamp vs unclamp,
  gear high vs gear low, spindle rotation vs orient) remain
  mutually exclusive across abort scenarios.
- **Acceptance criteria:**
  1. Hazard list: pinch points, tool-drop risk, magazine
     motion, ATC arm swing.
  2. Dry-cycle fixture designed and photographed.
  3. Mutual-exclusion proof: for each pair of mutually exclusive HAL outputs,
     an interlock exists and is verified in a dedicated no-hardware test
     configuration. Do not `setp` linked hm2 pins in the active machine HAL.
  4. Abort scenario: E-stop mid-tool-change leaves the machine
     in a state that can be safely recovered manually.
- **Owner:** retrofit commissioner. **Status:** NOT YET DRAFTED.
  `[ATC] DRY_RUN = 1` remains set in the INI per
  [`y_soft_limit_atc_zone.md`](y_soft_limit_atc_zone.md) until
  this deliverable exists.
- **Where it lands:** `docs/atc_hazard_analysis.md`.
- **Blocks:** automatic-M6 hold point.

### D14 — Network / real-time qualification and automatic response

- **Contents required:** the multi-hour latency test and NIC
  qualification documented in
  [`hm2_eth_nic_validation.md`](hm2_eth_nic_validation.md), plus
  proof that the automatic response to packet-error-exceeded
  and watchdog trips actually drops motion.
- **Acceptance criteria:**
  1. Latency-under-load acceptance log in
     `docs/commissioning_logs/latency_loaded_YYYY-MM-DD.txt`.
  2. Cable-yank test log showing packet-error latch and
     watchdog trip cascade.
  3. HAL wiring: `hm2_7i80.0.packet-error-exceeded` and
     `hm2_7i80.0.watchdog.has_bit` cascaded into the motion-
     permit chain per
     [`hm2_eth_nic_validation.md`](hm2_eth_nic_validation.md).
- **Owner:** retrofit commissioner. **Status:** PROCEDURE
  DRAFTED — [`hm2_eth_nic_validation.md`](hm2_eth_nic_validation.md).
  Test logs not yet captured.
- **Where it lands:** `docs/commissioning_logs/`.
- **Blocks:** amp-enable hold point.

### D15 — Restore / rollback package

- **Contents required:** photographs, drawings, and a wire
  ledger of the original Mazak M-2 control that is being
  displaced. A known-safe tag applied to the M-2 relays and
  parameter binder. Digital backup of the M-2 PLC ladder,
  parameters, and any tape data.
- **Acceptance criteria:**
  1. Photographs of every M-2 cabinet section, front and back,
     with terminal blocks visible.
  2. Wire ledger of every conductor being disconnected from the
     M-2, terminated back, or re-routed.
  3. Digital backup of parameters and ladder if extraction is
     feasible (per
     [`parameter_recovery.md`](parameter_recovery.md) and
     [`parameters_sn060231.md`](parameters_sn060231.md)).
  4. "Known-safe" tag: a signed dated tag applied to the M-2
     cabinet stating what was left as-is at the moment the
     retrofit began.
- **Owner:** machine owner. **Status:** TEMPLATE DRAFTED —
  [`restore_rollback_package.md`](restore_rollback_package.md); parameter
  recovery is partial and photograph/wire-ledger evidence is not captured.
- **Where it lands:** `docs/restore_rollback_package.md`, with the cabinet
  photographs filed in Drive under `01_Cabinet`
  ([scheme](README_photo_sorting.md)).
- **Blocks:** control-power hold point (partially — you should
  not disconnect the M-2 until backup exists).

### D16 — Signed hold points

- **Contents required:** signed hold points before each of
  these live-power milestones:
  1. Control power to the retrofit cabinet.
  2. DC bus to the servo amplifiers.
  3. Amp enable (S-ON).
  4. Z-brake release.
  5. Spindle rotation.
  6. First motion.
  7. First automatic M6 tool change.
- **Acceptance criteria:** for each hold point, a checklist
  page in `docs/hold_points/` lists the prerequisite
  deliverables (D1..D15 subset), the acceptance tests, and a
  signature box.
- **Owner:** retrofit commissioner + machine owner. **Status:**
  NOT YET DRAFTED.
- **Where it lands:** `docs/hold_points/` with one page per
  milestone.
- **Blocks:** all live-power activity.

## Hold-point map

Each hold point below lists the deliverables that must exist
before the hold point is released. This is the operational
gate on live power.

| Hold point | Deliverables required |
|---|---|
| Control power | D1, D2 (partial — resolver + amplifier + FR-SX nameplates), D3, D5, D15 |
| DC bus energised | Above + D6 |
| Amp enable (S-ON) | Above + D4 (I/O checkout signed), D7, D14 |
| Z-brake release | Above + D7 (specifically the Z-brake timing row) |
| Spindle rotation | Above + D12 |
| First motion | Above + D8, D9 |
| First automatic M6 | Above + D10, D11, D13 |

## What has changed in the repo (this commit)

- New `docs/pre_power_deliverables.md` (this document).
- `mesa/current_pin_authority.csv` — `ACCEPTED` and
  `ACCEPTED_VERIFY` rows migrated to `PROPOSED` per the
  taxonomy table above. No `CONFIRMED` or `CURRENT_AUTHORITY`
  rows existed to migrate.
- `docs/project_status.md` — new section at top of the file
  listing D1..D16 with their planning status.
- `linuxcnc/README.md` — commissioning bring-up preface now
  points at this document as the gate on live power.

## Sources

- [7i44 Mesa product page](https://store.mesanet.com/index.php?product_id=44) —
  used for the 7i44 RJ45 pinout that previously carried
  `ACCEPTED` state.
- Repo cross-references:
  [`grounding_shielding_plan.md`](grounding_shielding_plan.md),
  [`hm2_eth_nic_validation.md`](hm2_eth_nic_validation.md),
  [`io_capacity_reconciliation.md`](io_capacity_reconciliation.md),
  [`smart_serial_latency.md`](smart_serial_latency.md),
  [`estop_safety_chain.md`](estop_safety_chain.md),
  [`dc_bus_stop_fault.md`](dc_bus_stop_fault.md),
  [`frsx_orient_model.md`](frsx_orient_model.md),
  [`servo_commissioning.md`](servo_commissioning.md),
  [`y_soft_limit_atc_zone.md`](y_soft_limit_atc_zone.md),
  [`claim_audit_2026-08-07.md`](claim_audit_2026-08-07.md),
  [`parameter_recovery.md`](parameter_recovery.md),
  [`parameters_sn060231.md`](parameters_sn060231.md).
