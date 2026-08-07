# Claim audit reconciliation — 2026-08-07

Independent audit of the retrofit documentation raised ~20 point
claims marked as V (verified), U (unverified), or C (contradicted).
Each item below is reconciled against primary sources or repo state,
with the actual correction applied.

## Item-by-item

### 1. Bitfile provenance for `7i80hdt_7i44_ss_7i49d.bit`

- **Audit claim:** Bitfile provenance is not documented; the file
  name in current repo docs may not match anything Mesa ships.
- **Verification:** LinuxCNC forum thread [7I80HDT with 7I44 and
  7I48](https://forum.linuxcnc.org/27-driver-boards/50101-bitfile-for-7i80hdt-with-7i44-and-7i48)
  post #281014 (PCW, 2023-09-17): "You need a 7I80HDT bitfile as
  it uses a different FPGA." Post #281371 (PCW, 2023-09-22):
  "7I80HDT support has been added to 2.9 so it you get a current
  copy." Post #281111 (PCW, 2023-09-18) attaches
  `7i80hdt_sv...9-18.zip`.
- **Correction:** Mark `7i80hdt_7i44_ss_7i49d.bit` as **TBD until
  the built or shipped bitfile is confirmed**. The exact filename
  ships from Mesa (or is built locally per PCW's Efinity project
  archives — see [Efinix project file thread](https://forum.linuxcnc.org/27-driver-boards/51589-7i80hdt-efinix-project-file)
  post #292422). Capture SHA-256 of the actual `.bit` at
  commissioning and record in
  `mesa/mesa_firmware_checklist.md` (or a new
  `mesa/bitfile_provenance.md`).

### 2. 7i80HD-16 vs 7i80HDT — flashing hazard

- **Audit claim:** The 7i80HD-16 is a distinct product from the
  7i80HDT; an HD bitfile is incompatible with an HDT.
- **Verification:** [Forum #281014](https://forum.linuxcnc.org/27-driver-boards/50101-bitfile-for-7i80hdt-with-7i44-and-7i48)
  (PCW): "You need a 7I80HDT bitfile as it uses a different
  FPGA." [Efinix thread #292419](https://forum.linuxcnc.org/27-driver-boards/51589-7i80hdt-efinix-project-file)
  confirms the HDT variant uses an Efinix FPGA vs the HD-16's
  Xilinx part; the toolchain and bitstream format are
  incompatible.
- **Correction:** Any reference to 7i80HD-16 as an alternative in
  current architecture docs should be **removed**. Retain the
  hazard note: "Never flash a 7I80HD or 7I80HD-16 bitfile onto a
  7I80HDT — the FPGAs and bitstreams differ; an incompatible image
  can leave the board requiring its documented recovery path." The
  cited posts do not establish permanent unrecoverable damage, so do
  not call this a permanent brick.

### 3. 7i84U field voltage range — 5-28 V, not 5-32 V

- **Audit claim:** Repo language of "5-32V" is wrong; correct
  range is 5-28 V.
- **Verification:** [7i84U manual](https://www.mesanet.com/pdf/parallel/7i84uman.pdf)
  page 1 DESCRIPTION: "The 7I84U uses field power of 5VDC to
  28VDC..." Page 8 VIN AND FIELD POWER SUPPLY: "The 7I84U field
  I/O runs from field power supplies of 5 to 28 VDC." Page 47
  SPECIFICATIONS FIELD I/O table: "FIELD POWER 5 28 VDC" and
  "VIN (FIELD I/O LOGIC POWER) 5 28 VDC."
- **Contradictory note in the same manual:** Page 7 POWER
  CONNECTOR TB1 pinout labels VFIELDA and VFIELDB as "FIELD
  POWER 5-32V". This is a documentation inconsistency within
  Mesa's own manual. **Follow the specification table and
  description text (5-28 V), not the TB1 pinout label.** The
  spec block is authoritative.
- **Correction:** Any current-repo language stating "5-32V" for
  7i84U field power should be corrected to "5-28V" with
  citation to page 47 SPECIFICATIONS.

### 4. Flyback / clamp requirements on 7i84U outputs

- **Audit claim:** Repo says "flyback diodes always required."
  This is incorrect — 7i84U outputs have built-in overvoltage
  clamps for DC inductive loads.
- **Verification:** [7i84U manual](https://www.mesanet.com/pdf/parallel/7i84uman.pdf)
  page 1 DESCRIPTION: "Outputs have per output short circuit
  protection, overvoltage clamps and per driver chip thermal
  shutdown." This verifies that clamps exist; it does not state a
  blanket rule that external suppression is always unnecessary.
- **Correction:** Update repo language:
  - For a DC coil within the output rating, use the 7i84U's documented
    built-in clamp as part of the transient design, but choose any added
    diode/TVS from the required release time and EMC measurement. Do not
    state either "always required" or "never required" without that analysis.
  - 100 VAC solenoids (SOL-10, SOL-12, SOL-13, SOL-35, SOL-61,
    SOL-62, and the ATC barrier if AC) are driven via
    interposing relays. The 7i84U output drives the relay's
    24 V DC coil, which is inside the 500 mA / 28 V spec and is
    protected by the built-in clamp. **The 100 VAC coil side
    still needs a snubber** (typical RC network across the coil
    to absorb AC turn-off transient); that is a separate
    design item on the relay-contact side, not on the 7i84U
    side.

### 5. 7i84U power sequencing / VIN / brownout

- **Audit claim:** No power-sequencing guidance in the repo;
  drivers may behave unpredictably under field-power brownout.
- **Verification:** [7i84U manual](https://www.mesanet.com/pdf/parallel/7i84uman.pdf)
  page 8 VIN AND FIELD POWER SUPPLY documents VIN as required
  for logic operation; field-power supply per bank
  (VFIELDA/VFIELDB) can differ. The manual does not publish an
  explicit VIN-slew or field-power ramp specification, and it
  does not publish an explicit brownout threshold.
- **Correction:** Add commissioning checks to
  `docs/hm2_eth_nic_validation.md` cross-referenced acceptance:
  - VIN present before enabling drives (already implicit in the
    smart-serial acceptance).
  - Do not switch VFIELDA/VFIELDB with an interposing relay —
    field power should be a wired supply from DR-240-24, not
    switched.
  - After field-power dropout, cycle VIN and re-run the
    packet-error-limit reset procedure before re-enabling
    drives (already required by
    [`hm2_eth_nic_validation.md`](hm2_eth_nic_validation.md)).

### 6. 7i37TA in current architecture

- **Audit claim:** 7i37TA appears in some current docs as an
  I/O expansion option; the plan of record uses two 7i84Us on
  the 7i44, not a 7i37TA.
- **Verification:** `7i37TA` remains only in explicitly labelled rejected-
  alternative/history passages; it is absent from the selected stack, BOM,
  active HAL, and authority CSV.
- **Correction:** Keep the historical mention only where it is clearly marked
  contradicted. Do not add it to current planning or purchase lists.

### 7. Serial-number pinning for 7i84Us

- **Audit claim:** Existing docs suggest pinning specific 7i84U
  serial numbers to specific sserial ports via
  `use_serial_numbers=1` in the HAL config. This adds
  operational friction (swap a card = reconfigure) with no
  benefit unless deliberately using the option.
- **Verification:** Repo `linuxcnc/mazak_vqc_20_40.hal` line 49
  loads hm2_eth with `sserial_port_0=00xxxxxx` (mask, not serial
  number) — pinning is NOT active. Any repo prose suggesting
  serial-number pinning should be removed.
- **Correction:** In any doc that mentions serial-number
  pinning as required, replace with: "the two smart-serial cards are
  addressed on physical 7i44 channels 0 and 1 within HostMot2 port 0,
  not by serial number.
  `use_serial_numbers=1` is available in
  [hostmot2(9)](https://linuxcnc.org/docs/2.9/html/man/man9/hostmot2.9.html)
  but is NOT used in this retrofit because it prevents card
  swap without config edit."

### 8. `.invert` HAL claims

- **Audit claim:** Repo has some docs suggesting `.invert` HAL
  pins on 7i84U inputs. That is a legacy Mesa parallel-port
  driver form. HostMot2 sserial uses `input-NN-not` (inverted
  duplicate output pin).
- **Verification:** [hostmot2(9)](https://linuxcnc.org/docs/2.9/html/man/man9/hostmot2.9.html)
  documents `input-NN` and `input-NN-not` on smart-serial I/O
  boards. There is no `.invert` HAL pin on sserial input.
- **Correction:** In any doc that references "invert" on
  7i84U inputs, replace with: "connect from
  `hm2_7i80.0.7i84.0.0.input-NN-not` (the inverted duplicate
  pin) instead of `input-NN` — the HostMot2 firmware always
  publishes both polarities for every sserial input, no
  runtime inversion step."

### 9. AOUT-to-axis mapping

- **Audit claim:** AOUT0 → X, AOUT1 → Z, AOUT2 → Y is the
  current mapping in HAL. This needs physical verification at
  commissioning — a swap will send X commands to Z servo, etc.
- **Verification:** Repo `linuxcnc/motion_7i80hdt.hal` current
  net assignments (previously reviewed under fix #13). The
  mapping is a claim, not a verified fact.
- **Correction:** Add a bring-up step to
  [`linuxcnc/README.md`](../linuxcnc/README.md) commissioning
  order: "Confirm AOUT-to-axis mapping by commanding a
  known-direction, known-magnitude tiny move on each axis in
  turn, with the drives inhibited and a scope on the drive's
  analog command terminal. Reject the config if X command
  appears on the Z drive terminal or similar." (This step is
  already implied by the drives-disabled analog verification in
  commissioning step 4; make the axis-swap check explicit.)

### 10. FR-SX speed range — 0-10 V, unipolar

- **Audit claim:** FR-SX analog speed reference is 0-10 V
  unipolar; direction is via SPINDLE_FWD / SPINDLE_REV discrete
  inputs. Bipolar ±10 V would not command reverse rotation.
- **Verification:** Established under fix #16 (FR-SX orient
  model) which cited the FR-SF manual bnp-c3016eng showing
  speed reference and rotation direction on separate terminals.
  Not repeated here.
- **Correction:** Do not test either command architecture until the exact
  FR-SX model, terminal designation, and polarity are verified. The checked-in
  HAL keeps the static `spindle-output-permit` FALSE and combines it with
  watchdog, E-stop, machine-on, servo-ready, and spindle-fault state; it does
  not claim that a signed or a unipolar speed command is correct. After
  measurement, implement exactly one architecture and test it at low energy.

### 11. Spindle A/B/Z encoder — hardware and receiver

- **Audit claim:** The previously proposed 7i80HDT P3 encoder path
  would use bare FPGA GPIO — it is NOT an RS-422 differential receiver. A
  differential encoder needs a receiver in the signal chain.
- **Verification:** [7i80HDT store page](https://store.mesanet.com/index.php?product_id=386)
  and repo docs confirm bare-FPGA GPIO on P3. The encoder part,
  electrical format, and receiver are not identified; the active
  HAL therefore requests `num_encoders=0` and the authority leaves
  the spindle-feedback path unassigned.
- **Correction:** Keep the current target's P3 connector empty and
  request `num_encoders=0`. Identify the spindle encoder part and
  electrical format, then select a compatible receiver/daughter
  interface and IDROM-proven connector pins before allocating it.
  Differential outputs must not be landed on bare FPGA pins.
  Cross-link to [`grounding_shielding_plan.md`](grounding_shielding_plan.md)
  S-1 cable schedule row.

### 12. MELDAS ENA / ALM terminal designations

- **Audit claim:** Drive-enable and drive-alarm terminals on
  the MELDAS DK-427 are not photographed; the CSV
  authority-status of "COMMISSIONING_PENDING" is
  appropriate but the specific terminal numbers need capture.
- **Verification:** Repo docs consistently mark these as
  `COMMISSIONING_PENDING`. Terminal photos are on the outstanding
  TODO list in
  [`project_status.md`](project_status.md).
- **Correction:** No change to design; the TODO to "capture X/Y/Z
  servo drive model labels and command/enable/fault terminal
  labels" already covers this. Cross-linked here for
  completeness.

### 13. Limits / homes — ACCEPTED_VERIFY

- **Audit claim:** The overtravel limits and home switches
  currently sit at `ACCEPTED_VERIFY`. Before commissioning,
  physically confirm each switch's continuity in both states
  and rated voltage across NC / NO transition. Test each with
  fail-open behavior (unplug the wire at the switch and confirm
  LinuxCNC treats it as tripped, not as unaffected).
- **Verification:** CSV state is correct.
- **Correction:** Add explicit fail-open test to
  [`hm2_eth_nic_validation.md`](hm2_eth_nic_validation.md)
  post-commissioning acceptance and to
  [`estop_safety_chain.md`](estop_safety_chain.md) fault-injection
  matrix.

### 14. Backlash — do not preload numbers

- **Audit claim:** INI backlash values are placeholder zeros
  until reversal tests are done. Do not populate with typical
  Mazak factory numbers.
- **Verification:** Current
  [`linuxcnc/mazak_vqc_20_40.ini`](../linuxcnc/mazak_vqc_20_40.ini)
  has BACKLASH=0.0 on all axes.
- **Correction:** Retain zero. Add commissioning step:
  "Measure backlash by reversal test on each axis with a dial
  indicator; record raw data (indicator readings on 5 reversals
  per direction) and only then populate BACKLASH."

### 15. Travel and rapid speed measurements

- **Audit claim:** MAX_VELOCITY and MAX_ACCELERATION per axis
  are inherited from OEM Mazak numbers and have not been
  measured with the retrofit control. Populate cautiously and
  stage speed after PID tuning.
- **Verification:** True; the values reflect OEM machine
  ratings, not retrofit performance.
- **Correction:** During fix #13's servo commissioning
  procedure, MAX_VELOCITY starts at 25 % of nameplate and
  ramps up in 25 % steps only after each acceptance passes.
  Reflect this in the servo commissioning doc (already
  captured — no separate action here).

### 16. Magazine BCD pocket count

- **Audit claim:** MAG_BCD_BIT0..4 gives 32 possible values.
  Whether the physical magazine has 20 pockets or 24 or 30
  determines the valid-code table. Photograph and count the
  physical pockets.
- **Verification:** CSV row `MAG_BCD_BIT0..4` occupies 5 IN
  bits on 7i84U-A. Physical magazine size is not yet in the
  repo.
- **Correction:** Add TODO to
  [`project_status.md`](project_status.md): count magazine
  pockets physically; write the pocket-BCD lookup table into a
  new `docs/magazine_bcd_table.md`.

### 17. CSV source-file path references

- **Audit claim:** Some existing docs reference file paths
  (`archived_wiring_map`, `phase2_plan`,
  `front_control_panel_wiring.md`, `open_issues.md`) that may
  not exist under those names in the current repo layout.
- **Verification:** Direct check needed. See section below.
- **Correction:** See per-path verification table below;
  update or remove stale references.

## Per-path verification of the audit's cited file names

| Referenced name | Exists in repo? | Notes |
|---|---|---|
| `archived_wiring_map` | **No** | No file matching this name found in the repo. If the audit was citing a source-of-authority CSV path, the actual authority file is [`../mesa/current_pin_authority.csv`](../mesa/current_pin_authority.csv). |
| `phase2_plan` | **No** | No file matching this name found. If the audit was citing a phased rollout plan, the closest actual repo document is [`project_status.md`](project_status.md) (bring-up TODO list). |
| `front_control_panel_wiring.md` | **No** | No file matching this name found. The wiring subtree is [`../wiring/`](../wiring/) with `bbia1_*` and `7i84u_b_*` files; no `front_control_panel_wiring.md`. If the retrofit needs one, it should be created under `wiring/` at wiring time. |
| `open_issues.md` | **No** | No file matching this name found. The active issue tracking mechanism is TODOs inside `project_status.md` and `authority_conflicts.md` under `wiring/`. |

**Correction:** Every current-doc reference to the four names
above must be replaced with the real path listed in the Notes
column (or dropped entirely if the reference was aspirational).

## What has changed in the repo (this commit)

- New `docs/claim_audit_2026-08-07.md` (this document).
- No CSV changes are made here — corrections that need CSV row
  edits will be captured in follow-on commits when the physical
  data becomes available at commissioning.

## Sources

- [7i84U manual](https://www.mesanet.com/pdf/parallel/7i84uman.pdf)
- [LinuxCNC forum: 7I80HDT with 7I44 and 7I48](https://forum.linuxcnc.org/27-driver-boards/50101-bitfile-for-7i80hdt-with-7i44-and-7i48)
- [LinuxCNC forum: 7I80HDT Efinix project file](https://forum.linuxcnc.org/27-driver-boards/51589-7i80hdt-efinix-project-file)
- [hostmot2(9) manpage](https://linuxcnc.org/docs/2.9/html/man/man9/hostmot2.9.html)
- [7i80HDT store page](https://store.mesanet.com/index.php?product_id=386)
- Repo cross-references: [`grounding_shielding_plan.md`](grounding_shielding_plan.md),
  [`hm2_eth_nic_validation.md`](hm2_eth_nic_validation.md),
  [`io_capacity_reconciliation.md`](io_capacity_reconciliation.md),
  [`smart_serial_latency.md`](smart_serial_latency.md),
  [`estop_safety_chain.md`](estop_safety_chain.md),
  [`frsx_orient_model.md`](frsx_orient_model.md),
  [`servo_commissioning.md`](servo_commissioning.md).
