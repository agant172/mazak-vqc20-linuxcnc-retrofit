# Project Status & TODO — Mazak VQC 20/40 LinuxCNC/Mesa Retrofit

_Last updated: 2026-08-13_

## Pre-power deliverables (D1–D16)

Sixteen pre-power deliverables gate every live-power hold point.
See [`pre_power_deliverables.md`](pre_power_deliverables.md) for full acceptance criteria.
Summary of planning state as of this commit:

| # | Deliverable | Planning state |
| --- | --- | --- |
| D1 | As-built one-line + terminal plan | NOT DRAFTED |
| D2 | Installed nameplate register | PARTIAL (checklists drafted; photos pending) |
| D3 | Immutable Mesa firmware package | PARTIAL — bitfile `7i80hdt_rmsvss6_8.bin` received from Mesa/PCW and committed under `mesa/firmware/` with SHA-256; static VHD check done. Live `readhmid`/HAL pin-dump cross-check still open (board unpowered as of 2026-08-11). See [`mesa_pcw_bitfile_inquiry.md`](mesa_pcw_bitfile_inquiry.md) |
| D4 | I/O checkout sheet | NOT DRAFTED |
| D5 | Hardware E-stop risk assessment + schematic | PARTIAL (software chain drafted) |
| D6 | Shared-bus precharge / discharge procedure | DRAFTED (measurements pending) |
| D7 | Enable / fault / ready / Z-brake timing budget | TEMPLATE DRAFTED (measurements pending) |
| D8 | Resolver phasing / commissioning procedure | PROCEDURE DRAFTED (measurements/traces pending) |
| D9 | First-move plan | PROCEDURE DRAFTED (machine values/signatures pending) |
| D10 | Velocity-mode tuning procedure + saved traces | PROCEDURE DRAFTED (traces pending) |
| D11 | Physical travel / envelope survey | PARTIAL (Y done; X, Z pending) |
| D12 | FR-SX speed / orient / gear state diagram | DIAGRAM DRAFTED (terminal/timing proof pending) |
| D13 | ATC hazard analysis + dry-cycle fixture | NOT DRAFTED |
| D14 | Network / real-time qualification + automatic response | PROCEDURE DRAFTED (logs pending) |
| D15 | Restore / rollback package | TEMPLATE DRAFTED (evidence/photos/ledger pending) |
| D16 | Signed hold points | NOT DRAFTED |

Evidence-state taxonomy migration completed: `ACCEPTED` and
`ACCEPTED_VERIFY` retired in favour of `PROPOSED`, `TRACED`,
`ELECTRICALLY_VERIFIED`, `HAL_VERIFIED`, and `COMMISSIONED`.
See [`pre_power_deliverables.md`](pre_power_deliverables.md#new-evidence-state-taxonomy).

Conversion of a Mazak VQC 20/40 vertical machining center from the original Mazatrol
control to LinuxCNC using Mesa Electronics FPGA hardware.

> **Safety:** All HAL/INI files in `linuxcnc/` and the mappings in `mesa/current_pin_authority.csv`
> are **planning and bring-up skeletons only**. They are **not** live-machine-ready.
> Verify the safety chain, drive polarity, resolver direction/scale, field-I/O normal
> states, and coil/current ratings before energizing any output or enabling motion.
> See [Safety caveats](#safety-caveats) below.

## Selected architecture (2026-08-06 rev)

- **LinuxCNC control PC** (Debian 13 / LinuxCNC 2.9.10) driving a **Mesa 7i80HDT** Ethernet FPGA host as the primary control board (`hm2_eth`, static IP 192.168.1.121).
- **P1: Mesa 7i44** — RS-422 sserial breakout. Physical channels 0/1 → **7i84U-A/B** within HostMot2 port 0; channels 2-7 spare.
- **P2: Mesa 7i49** — plain 7i49 (not 7i49HV). X/Y/Z resolver feedback on RES0/1/2 + X/Z/Y servo velocity command on AOUT0..AOUT2 and FR-SX spindle velocity on AOUT3. AOUT4/AOUT5 spare. FR-SX orient is a DISCRETE ORCM1 command on 7i84U-A TB3 OUT4 (not analog); see [`frsx_orient_model.md`](frsx_orient_model.md).
- **P3: unused/spare** — no daughter card is fitted; all pins are bare-FPGA GPIO. Not safe for 24 V field wiring. The Renishaw MP-3 probe SKIP1 was moved off P3 and now lands on 7i84U-B TB3 IN15.
- **7i84U-B I/O allocation**: TB3 IN0-5 = X/Y/Z limits, IN6-8 = homes, IN9 = air permissive, IN15 = Renishaw MP-3 probe; TB3 OUT0-2 = drive enables, OUT3-7 = air/touch/tap blasts, ATC barrier, and flood valve; TB2 OUT8 = proposed magazine-cover close. (7i84 layout: TB1 = power connector; TB3 = IN0-15 + OUT0-7; TB2 = IN16-31 + OUT8-15.)
- **Optional WHB04B-style USB pendant** after base machine safety/motion is proven.
- **Firmware bitfile**: `7i80hdt_rmsvss6_8.bin`, received from Mesa/PCW 2026-08-11, committed under `mesa/firmware/` with SHA-256. Static VHD pin-map check confirms 6 PWM/analog instances (matches AOUT0-5) and a resolver module present; **IDROM/readhmid readback and HAL pin dump are still open** (board unpowered as of this update) — do not treat as field-verified until those run.

See [`architecture_decision.md`](architecture_decision.md) for the full rationale.

## Progress markers

### Completed
- Repository created and structured.
- **7i80HDT + 7i44 + 7i49 + 7i84U-A + 7i84U-B architecture selected.**
- 7i49 resolver feedback interface selected (plain 7i49, 5 kHz baseline).
- Tamagawa TS2014N resolvers identified on-machine (July 2026 photo survey).
- Meanwell DR-240-24 retrofit 24V supply installed; kept isolated from OEM HR-11F-24 bus.
- The 132-row I/O workbook is generated from the current authority CSV
  (`bom/Mazak_VQC_20-40_Retrofit_IO_Workbook.xlsx`).
- HAL/INI bring-up skeleton drafted (`linuxcnc/`) — updated to new stack 2026-08-06.
- Mesa firmware/HAL-pin checklist drafted (`mesa/mesa_firmware_checklist.md`).
- Cabinet photo checklist drafted (`docs/cabinet_photo_checklist.md`).
- Ladder transcription: ATC (mazak_atc.comp), Orient/Gear (mazak_orient.comp).
- 385-signal ladder crosswalk; 132 current authority rows covered in io-dashboard.
- Element list catalog (VQC20-40_060231) — 5,247 elements categorized.
- Pin authority CSV structurally reconciled for the full stack
  (`mesa/current_pin_authority.csv`); physical tracing and electrical/HAL
  verification remain pending.

### In progress
- Purchase list for 7i80HDT + 7i44 + 7i84U-B (7i49 and 7i84U-A already ordered / on hand).
- Collecting cabinet photos.
- Tracing 24 V distribution and the safety chain.

### Not started
- Live Mesa 7i80HDT install.
- HAL pin replacement from actual `readhmid` output.
- Resolver / analog measurements (per-axis winding pairs, return signal level).
- Axis bring-up.
- Spindle bring-up.
- ATC dry run.

## TODO list

### Immediate
- [x] **GATE — confirm before ordering:** email Mesa/PCW to confirm an **Efinix bitfile exists (or can be built)** for the 7i80HDT that exposes **7i49 resolver + analog on P2** and **7i44 smart-serial on P1**. CLEARED 2026-08-11 — bitfile received (`7i80hdt_rmsvss6_8.bin`), see [`mesa_pcw_bitfile_inquiry.md`](mesa_pcw_bitfile_inquiry.md) Outcome section.
- [x] Order the 7i80HDT + 7i44 + 7i84U-B. Board is now on hand and network-connected (192.168.1.121) as of 2026-08-11, though currently unpowered.
- [ ] Obtain the confirmed Efinix resolver bitfile from Mesa/PCW — **binary + SHA-256 + static VHD check done** (`mesa/firmware/`, 2026-08-11). **IDROM readback and HAL pin dump still open**, need the board powered — do not assume field-verified until those run.
- [ ] Confirm 7i80HDT Ethernet setup: static IP 192.168.1.121, `hm2_eth` `board_ip="192.168.1.121"`, and host NIC `enp0s31f6` at 192.168.1.1/24.
- [ ] Confirm 24 V field power feed and 7i84U-A / 7i84U-B I/O sourcing/sinking behavior before wiring.
- [ ] Capture cabinet photo set using the cabinet photo checklist.
- [ ] Capture/record X/Y/Z servo drive model labels and command/enable/fault terminal labels.
- [ ] Capture/record Mitsubishi FR-SX spindle drive model and analog/run/direction/alarm terminals.
- [ ] **Determine the FR-SX orient detector** — procedure in [`frsx_orient_detector_capture.md`](frsx_orient_detector_capture.md). **Correction:** this item previously read "dump `#41 OSL` and `SP037` — the single item that closes the orient-detector question". That was overstated: those parameter numbers come from the later MDS-CH manual and may not exist on a 1985 FR-SX. The reliable first step is **tracing the PLG cable to the drive connector**, which needs no power. The spindle motor's built-in PLG is now identified (Tamagawa TS1526N55 optical, 512 counts/turn, ±15 V, nameplate photos 2026-08-12) but its existence does not prove which detector the drive orients from. See [`spindle_motor_plg_encoder.md`](spindle_motor_plg_encoder.md).
- [x] **DECIDED 2026-08-12 (owner): LinuxCNC does not read spindle position.** `num_encoders=0`, P3 empty, and `SPINDLE_ENCODER` `UNBOUND` are settled, not pending. Orient is FR-SX internal, speed supervision is discrete, and tapping uses a floating holder (no rigid tapping / G33 in scope). The motor PLG is structurally unusable anyway — it sits upstream of the 2-speed gearbox and has no index line. See [`spindle_motor_plg_encoder.md`](spindle_motor_plg_encoder.md#design-decision--linuxcnc-does-not-read-spindle-position).
- [ ] *(documentation accuracy only, not gating)* Determine whether the schematics' machine-side "SPINDLE ENCODER" (`MS3108B 20-29P`, dwg 4143075301 p090) is a **second** physical device or another view of the motor PLG. Cheapest check: photograph the spindle head for anything encoder-shaped. Nothing depends on the answer now that the decision above is settled.
- [ ] Trace HR-11F-24 (OEM) and DR-240-24 (retrofit) 24 V supplies, P24/G24 distribution, remote sense, TOG/CNT, and branch fusing.
- [ ] **DECISIONS PENDING OWNER APPROVAL from the 2026-08-12/13 photo survey** — all recorded, none applied. See [`../wiring/authority_conflicts.md`](../wiring/authority_conflicts.md) §5 and [`../wiring/cabinet_asfound_survey.md`](../wiring/cabinet_asfound_survey.md):
  - [ ] Add **`57B`** to the OEM preserve list in `CLAUDE.md`. Confirmed a factory terminal designation on the cabinet safety-chain strip; the list currently names only `57` and `57A`.
  - [ ] `AIR_BLAST` (7i84U-B OUT3): relabel field point **`SOL-62` → `SOL-15`** (wire `415`, read at the coil). Function and wire were already correct — a relabel, not a rebinding.
  - [ ] `TOUCH_SENSOR_BLAST` (OUT4) and `TAP_COOLANT_BLAST` (OUT5): **their devices are not fitted**. Recommend `NOT_USED`/`RESERVED`, as was done for `MIST_COOLANT`. Do not fit RLY-6/RLY-7.
  - [ ] **`SOL-16` work air blast is fitted and wired (wire `416`/`216`, CN11-7) but no authority row drives it.** Allocate an output or record a decision to drop the function. 7i84U-A is at 100 % — check [`io_capacity_reconciliation.md`](io_capacity_reconciliation.md) first.
  - [ ] `LUBE_OK` (IN25): status promotion now justified — `PS-5` tag, wire `355` and `CN6-39` all physically confirmed together. Contact form and trip pressure still unverified.
- [ ] **Shop items opened by the same survey:**
  - [ ] Field-trace the safety chain from the cabinet strip (`57`/`57A`/`57B`/`58`/`59`/`60`/`EMB`/`MAR`) toward the contactor drop — the **D5** item the drawing pass could not locate.
  - [ ] Trace `TAPC` from **CN6-18 → CNB-46** and find what it drives. Last unresolved device path in §5.
  - [ ] Confirm whether `SOL-31` flood coolant and the other three unfitted placard tags exist **elsewhere** on the machine before any row is dropped. "Not on the head" is not "does not exist".
  - [ ] Assign the four motor starter circuits (`U11`/`U21`/`U31`/`U44`) to their motors; read the overload and `MB30-CB` breaker settings — **D1** input.
  - [ ] Establish what the Mitsubishi `SRE` voltage relay (AC 100 V, 120–150 V dial) gates, and its setpoint.
  - [ ] Measure solenoid coil **current** to size RLY-1…RLY-7 contacts. Coil voltage is confirmed 100 VAC; current is not.
  - [ ] Re-read dwg **4143175310 p079** (spindle-tacho legend, §4) and **4143075301 p090** (`MS3108B` — same device as the motor PLG, or a second one?).
- [ ] Confirm scope: mist coolant, work light, manual tool clamp/unclamp pushbuttons, and cover-motion outputs are deferred or removed per [`io_capacity_reconciliation.md`](io_capacity_reconciliation.md). 2PC pallet changer is out of retrofit scope. 7i84U-A is at 100/100% — any new signal there requires reallocating an existing one to 7i84U-B.
- [ ] Execute the hm2_eth NIC and multi-hour latency-under-load acceptance per [`hm2_eth_nic_validation.md`](hm2_eth_nic_validation.md); record NIC/MAC/driver/IRQ/offload state, verify the checked-in `packet-error-exceeded` + `watchdog.has_bit` inhibit wiring against actual HAL pins, and fault-inject both paths before enabling drives.
- [ ] Build the resolver + analog cables per [`grounding_shielding_plan.md`](grounding_shielding_plan.md): three individually shielded twisted pairs per resolver, shields at the 7i49 end only, drive-specific analog-common/shield treatment, and documented routing away from switching power. Establish sourced project acceptance thresholds, execute the staged noise survey, and log results under `docs/commissioning_logs/`.
- [ ] Measure smart-serial input/output latency and probing jitter end-to-end; fault-inject 7i44 and hm2_eth link loss and confirm both hardware watchdog safe states plus the software latch. Do not add DPLL or `SSERIAL_TIMER` settings for resolver/sserial without a primary source that documents those interfaces. See [`smart_serial_latency.md`](smart_serial_latency.md).
- [ ] Design and commission `mazak_atc_zone` HAL component + `M100`/`M101` user-M-code permit pair that dynamically drives `ini.y.max_limit` from +0.0394 to +9.5000 only after prerequisites are met (homed, no fault, spindle oriented, Z >= -5.9449, PRS-55/66 consistent). Prove motmod's update timing with halscope; do not assume it. Until this exists the remap will not tool-change and `[ATC] DRY_RUN = 1` remains set. See [`y_soft_limit_atc_zone.md`](y_soft_limit_atc_zone.md).
- [ ] Trace E-stop, door, ready chain, and servo contactor wiring before any control rewiring. Draw the as-built hardwired safety schematic and validate the fault-injection matrix per [`estop_safety_chain.md`](estop_safety_chain.md) BEFORE energizing drives under retrofit control. Until validated, LinuxCNC/HAL is monitoring/inhibit only — not the primary safety element and not a safety-rated backup.
- [ ] Survey the OEM Mitsubishi TRA rectifier/capacitor/amplifier DC-bus stack per [`dc_bus_stop_fault.md`](dc_bus_stop_fault.md): draw the as-built one-line, label TP-DC+/TP-DC-/TP-CHG/TP-BRK-Z/TP-RDY-* candidates, identify the exact service-voltage threshold from the installed unit manual, measure discharge under both at-rest and post-deceleration conditions, and test single-amplifier fault propagation. LinuxCNC monitors/inhibits only; it is not the primary stop element.
- [ ] Confirm the Renishaw MP-3 probe SKIP1 lands on 7i84U-B TB3 IN15 (opto-isolated 24 V input). Do NOT wire the probe to bare P3 GPIO — that path is RETRACTED (see [`superseded_claims_2026-08-06.md`](superseded_claims_2026-08-06.md) row 15). All P3 pins remain unused/spare.

### Next
- [ ] Run LinuxCNC latency and hm2_eth qualification on the exact selected PC,
      NIC, kernel, BIOS settings, and representative system workload.
- [ ] Install the 7i80HDT + 7i44 + 7i49 + 7i84U-A + 7i84U-B; leave P3 unused/spare (probe is on 7i84U-B input-15, not bare P3 GPIO) and save `mesaflash --device 7i80hdt --addr 192.168.1.121 --readhmid` output as `mesa_readhmid.txt`.
- [ ] Dump actual HAL pins after firmware load and save as `mesa_hal_pins.txt`.
- [ ] Replace placeholder `hm2_7i80.0...` pin names in the HAL files using the real HAL pin dump.
- [ ] Set 7i49 resolver excitation to **5 kHz** (spec 4.5 kHz; options 2.5/5/10 kHz).
- [ ] Identify each axis resolver winding pair with an **ohmmeter before power**: rotor pair (R1/R2) → RESDRV±, matched stator pairs (S1-S3, S2-S4) → RESSIN and RESCOS. Verify, don't assume.
- [ ] Scope RESDRV excitation and RESSIN/RESCOS amplitude and phase at rest and under motion; expect ~1 V RMS sin/cos from ~2 V RMS drive on a 2:1 resolver. **W2 does NOT affect axis channels 0/1/2** (only 3/4/5), so it is not a valid remedy for a hot X/Y/Z return; if the return is far off the ~1 V RMS target, escalate to Mesa (PCW) for review of the specific TS2014N suffix before adding external dividers or a 7i49HV.
- [ ] Confirm the 7i49 is the **sole resolver excitation source** — nothing from the old drive/control still driving the windings before energizing.
- [ ] Derive `RESOLVER_SCALE` for X/Y/Z: read the ballscrew lead (in or mm/screw rev), confirm the flex coupling is 1:1 (no reduction between screw and resolver), and enter signed inches-per-resolver-rev into each `[JOINT_N]` block. Verify by counting `hm2_7i80.0.resolver.NN.rawcounts` against a dial indicator over multiple full ballscrew revolutions and adjust; flip the sign if the axis counts backwards. Set `RESOLVER_VELOCITY_SCALE` to the same signed value so `.velocity` reports in/s. Do NOT leave the 1.0 placeholder in place before running the axis — the HostMot2 doc defines `.scale` as machine units per RESOLVER ELECTRICAL revolution, not per motor rev; internal consistency between the two 1.0 defaults does not prove one inch per revolution.
- [ ] Verify analog command polarity/scaling for X/Y/Z on 7i49 AOUT0/1/2 before enabling drives.
- [ ] Follow the FF1-first velocity-mode commissioning procedure in [`servo_commissioning.md`](servo_commissioning.md) for X, then Y, then Z: zero-command null check, low-voltage volts-per-speed calibration, `OUTPUT_SCALE` per axis, then FF1 → P → I/D. Do NOT tune from zero-gain placeholders until the volts-per-speed calibration is done. Log each axis under `docs/commissioning_logs/<axis>_YYYYMMDD.md`.
- [ ] Verify FR-SX spindle command on 7i49 AOUT3 (speed) plus 7i84U-A digital FWD/REV/ENA.
- [ ] Verify 7i84U-B TB3 limit/home inputs and TB3 drive-enable outputs against cabinet contacts; measure each input path with an ohmmeter before deciding whether to consume `input-NN` (raw) or `input-NN-not` (complement) in HAL — sserial input pins do NOT have an `invert_input` parameter (see [sserial(9)](https://linuxcnc.org/docs/html/man/man9/sserial.9.html)). Verify the probe SKIP1 input on 7i84U-B TB3 IN15 (opto-isolated 24 V) separately.
- [ ] Wire interposing relays (RLY-5/6/7) for the 100VAC relay-driven loads SOL-35/61/62 on 7i84U-B TB3 OUT4/5/3 as assigned. Do the same for the ATC barrier on TB3 OUT6 (Y095 TCME.M).
- [ ] Verify ATC prox/solenoid labels and normal states: PRS-8/9, PRS-10/12, PRS-13, PRS-21 through PRS-25, SOL-8A/8B, SOL-10, M15/M16 if present.
- [ ] Measure solenoid/contactor coil voltages and currents to decide interposing relay/suppression needs.

### Later
- [ ] Bring up resolver feedback via the 7i49 (P2) with drives disabled.
- [ ] Bring up one axis at a time at low gain / low speed.
- [ ] Prove homes/limits (7i84U-B TB3) and hardware E-stop behavior.
- [ ] Bring up spindle at low RPM with verified analog scaling on 7i49 AOUT3.
- [ ] Dry-run ATC/hydraulic sequence with no tool load.
- [ ] Decide whether any optional future expansion I/O (7i44 physical channels 2-7, MPG pendant, 4th axis) and the USB pendant are needed.

## Bring-up order (summary)

1. Confirm 7i80HDT detection over Ethernet (host static IP 192.168.1.1/24, `ping 192.168.1.121`, `mesaflash --device 7i80hdt --addr 192.168.1.121 --readhmid`, `hm2_eth` HAL load).
2. Confirm 24 VDC P24/G24 bus (OEM HR-11F-24 and retrofit DR-240-24 isolated), fusing, and 0 V common/reference strategy.
3. Confirm resolver wiring on 7i49 P2 with drives disabled: ohmmeter the winding pairs, wire RESDRV/RESSIN/RESCOS, set 5 kHz excitation, scope the return level, then confirm counts, direction, and scale.
4. Confirm 7i49 P2 analog command wiring with drives disabled/inhibited (zero command, polarity on AOUT0/1/2/3).
5. Confirm 7i84U-A and 7i84U-B appear on HostMot2 smart-serial port 0 channels 0 and 1 via `halcmd show pin hm2` — verify device tags `hm2_7i80.0.7i84.0.0.*` and `hm2_7i80.0.7i84.0.1.*`.
6. Confirm 7i84U-A + 7i84U-B TB3 wiring (limits/homes/E-stop/probe/drive-enables/relay-driven outputs) with all outputs disabled; P3 has no field wiring.
7. Bring up one axis at a time at low gain / low speed per [`servo_commissioning.md`](servo_commissioning.md) (FF1 first, then P; I only for residual bias, D cautiously; explicit rollback criteria).
8. Confirm home and limit logic before homing.
9. Confirm spindle analog scaling, run/enable/direction, zero-speed, at-speed, orient.
10. Bring up ATC/hydraulic outputs one at a time with dry-run interlocks, no tool load.

Detailed bring-up notes: [`../linuxcnc/README.md`](../linuxcnc/README.md).

## Safety caveats

- The `linuxcnc/` HAL/INI files and `mesa/current_pin_authority.csv` are **skeletons**. Pin names (`hm2_7i80.0...`), resolver scales, analog polarity/scaling, spindle FR-SX command mode, and I/O normal states are **placeholders** and must be replaced with the actual generated HAL names and measured/verified values from the installed 7i80HDT + 7i44 + 7i49 + 7i84U-A + 7i84U-B stack. The probe SKIP1 now lands on 7i84U-B TB3 IN15 (opto-isolated) rather than bare P3 GPIO.
- **Resolver wiring is not conventional.** The original Meldas M2 / TRA wiring may drive the resolver "backwards" (two-phase excitation into the stator, phase read from the rotor), whereas the 7i49 uses single excitation and reads sin/cos amplitude. **Ohmmeter the winding pairs before applying power** and do not trust the original wire names. The 7i49 must be the **sole resolver excitation source** — the old TRA drive closes its velocity loop on a tachometer, not the resolver, so LinuxCNC/7i49 can own excitation, but nothing else may share those windings.
- `MS3108B 20-29P` is a **connector shell part number, not a resolver model** — the resolvers themselves are Tamagawa TS2014N (BKO-NC6062A).
- Preserve or rebuild a **hardware safety chain** that removes hazardous power. Do not rely on LinuxCNC/HAL alone for E-stop safety. The E-stop chain is monitored solely via the 7i84U-A TB2 IN29 interposing-relay status contact; the OEM hardware chain remains authoritative.
- Treat every `active-high`/`active-low`/`NO`/`NC` assumption as unverified until measured.
- Use interposing relays or output modules where coil/load current exceeds Mesa output ratings or where isolation is needed; add flyback diodes / RC snubbers / surge suppression appropriate to each coil. All 100VAC loads (SOL-35/61/62, ATC barrier SOL-Y095) must go through interposing relays.
- Keep resolver and analog wiring shielded and physically separated from contactor, solenoid, spindle, and motor power wiring.
- A reversed analog command can cause axis runaway — verify drive polarity on 7i49 AOUT0/1/2 before enabling drives.
