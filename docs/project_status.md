# Project Status & TODO — Mazak VQC 20/40 LinuxCNC/Mesa Retrofit

_Last updated: 2026-08-19_

## Scope decision — power and E-stop stay original (owner, 2026-08-15)

The machine's AC and DC power circuits and the **entire E-stop system remain
100% original OEM, untouched.** This conversion does not commission, trace, or
verify any AC, DC, or power circuit anywhere in the machine. Power-related
rows, labels, and guards were removed from the authority model accordingly
(PRs #69/#70), and `ESTOP_MONITOR` is `DEFERRED` — the interposing monitor
relay is not being installed, so with its input unwired the software chain
reads FALSE and fails safe.

The only power information kept in scope is **what passes through the BBIA-1
board** (`wiring/bbia1_source_dest.csv`, `INTERFACE_ARCHITECTURE.md`).

## Pre-power deliverables (D1–D16)

Fourteen pre-power deliverables gate the live-power hold points (D5 and D6 are WITHDRAWN — owner decision 2026-08-15: power and E-stop stay 100% OEM).
See [`pre_power_deliverables.md`](pre_power_deliverables.md) for full acceptance criteria.
Summary of planning state as of this commit:

| # | Deliverable | Planning state |
| --- | --- | --- |
| D1 | As-built one-line + terminal plan | NOT DRAFTED |
| D2 | Installed nameplate register | PARTIAL (checklists drafted; photos pending) |
| D3 | Immutable Mesa firmware package | COMPLETE (2026-08-13) -- layout/identity/source/readhmid/binary/recovery procedure all confirmed and committed under mesa/firmware/ and docs/Mesa Manuals/ |
| D4 | I/O checkout sheet | NOT DRAFTED |
| D5 | Hardware E-stop risk assessment + schematic | WITHDRAWN (owner decision 2026-08-15; see estop_safety_chain.md) |
| D6 | Shared-bus precharge / discharge procedure | WITHDRAWN (owner decision 2026-08-15; dc_bus_stop_fault.md kept as reference) |
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
> Verify drive polarity, resolver direction/scale, field-I/O normal
> states, and coil/current ratings before energizing any output or enabling motion.
> The OEM safety chain stays original and is relied on as-is.
> See [Safety caveats](#safety-caveats) below.

## Confirmed architecture (2026-08-13 rev)

> P1/P2/P3 connector roles flipped vs. the 2026-08-06 rev once
> `7i80hdt_rmsvss6_8.bin` was flashed and read back with `mesaflash --readhmid`
> (2026-08-11, re-confirmed byte-identical 2026-08-13) — see
> [`../mesa/mesa_firmware_checklist.md`](../mesa/mesa_firmware_checklist.md#bitfile-provenance-verification-procedure).

- **LinuxCNC control PC** (Debian 13 / LinuxCNC 2.9.10) driving a **Mesa 7i80HDT** Ethernet FPGA host as the primary control board (`hm2_eth`, static IP 10.10.10.121).
- **P3: Mesa 7i44** — RS-422 sserial breakout. Physical channels 0/1 → **7i84U-A/B** within HostMot2 port 0; channels 2-7 spare.
- **P1: Mesa 7i49** — plain 7i49 (not 7i49HV). X/Y/Z resolver feedback on RES0/1/2 + X/Z/Y servo velocity command on AOUT0..AOUT2 and FR-SX spindle velocity on AOUT3. AOUT4/AOUT5 spare. FR-SX orient is a DISCRETE ORCM1 command on 7i84U-A TB3 OUT4 (not analog); see [`frsx_orient_model.md`](frsx_orient_model.md).
- **P2: unused/spare** — no daughter card is fitted; all pins are bare-FPGA GPIO. Not safe for 24 V field wiring. The Renishaw MP-3 probe SKIP1 was moved off P2 and now lands on 7i84U-B TB3 IN15.
- **7i84U-B I/O allocation**: TB3 IN0-5 = X/Y/Z limits, IN6-8 = homes, IN9 = air permissive, IN15 = Renishaw MP-3 probe; TB3 OUT0-2 = drive enables, OUT3-7 = air/touch/tap blasts, ATC barrier, and flood valve; TB2 OUT8 = proposed magazine-cover close. (7i84 layout: TB1 = power connector; TB3 = IN0-15 + OUT0-7; TB2 = IN16-31 + OUT8-15.)
- **Optional WHB04B-style USB pendant** after base machine safety/motion is proven.
- **Firmware bitfile**: `7i80hdt_rmsvss6_8.bin`, flashed 2026-08-11. Layout, identity, and upstream source all **CONFIRMED**: two independent `readhmid` reads plus a recorded SHA-256, and the binary sourced directly from Peter Wallace at Mesa Electronics (`freeby.mesanet.com/7i80hdt_rmsvss6_8.zip`, 2026-08-11).

See [`architecture_decision.md`](architecture_decision.md) for the full rationale.

## Progress markers

### Completed
- Repository created and structured.
- **7i80HDT + 7i44 + 7i49 + 7i84U-A + 7i84U-B architecture selected.**
- 7i49 resolver feedback interface selected (plain 7i49, 5 kHz baseline).
- Tamagawa TS2014N resolvers identified on-machine (July 2026 photo survey).
- The 132-row I/O workbook is generated from the current authority CSV
  (`bom/Mazak_VQC_20-40_Retrofit_IO_Workbook.xlsx`).
- HAL/INI bring-up skeleton drafted (`linuxcnc/`) — updated to new stack 2026-08-06.
- Mesa firmware/HAL-pin checklist drafted (`mesa/mesa_firmware_checklist.md`).
- Cabinet photo checklist drafted (`docs/cabinet_photo_checklist.md`).
- Ladder transcription: ATC (mazak_atc.comp), Orient/Gear (mazak_orient.comp).
- `halrun` component harness green on the OptiPlex — 12 scenarios, 405 checks,
  0 failed (2026-08-16, commit `925ee7d`;
  `docs/commissioning_logs/halrun_component_harness_2026-08-16.md`). Code evidence
  only: no hardware in the loop, no `authority_status` may be advanced on it.
- 385-signal ladder crosswalk; 132 current authority rows covered in io-dashboard.
- Element list catalog (VQC20-40_060231) — 5,247 elements categorized.
- Pin authority CSV structurally reconciled for the full stack
  (`mesa/current_pin_authority.csv`); physical tracing and electrical/HAL
  verification remain pending.
- **Two-plane wiring crosswalks completed as accounting artifacts (2026-08-18/19):**
  Plane A covers all 320 BBIA-1 bottom-row pin positions and Plane B records the
  CNA resolver/direct-analog routes plus the five CNA10 load-meter pins. The
  six X/Y/Z direct analog source routes remain explicitly held pending OEM
  connector/pin continuity tracing; these are not wire-release approvals.
- **NC circuit landing audit advanced (2026-08-19):** 16 of 37 claimed landings
  are independently supported; the remaining 21 claims require field/source
  verification and a synthesized coverage report.

### In progress
- **All interface hardware is on hand as of 2026-08-17** (owner, at the machine): 7i80HDT, 7i49, 7i44, 7i84U-A, 7i84U-B, and the 50-pin IDC cables that were the last blocker. The 7i80HDT is on the network at 10.10.10.121 (192.168.1.121 until the 2026-08-23 renumber) and flashed with `7i80hdt_rmsvss6_8.bin`. **Update 2026-09-05: 7i84U-A is now proven present** via `halcmd show pin hm2` (see item below) — the 7i49 and 7i44 daughter cards themselves, and all field wiring on 7i84U-A, remain unverified. 7i84U-B is still not in hand (on order).
- [x] **2026-09-05 (at the machine): 7i84U-A confirmed present on HostMot2 smart-serial port 0, channel 0.** Bench-check item #1 from `ladder_signal_audit_2026-09-02.md` is now closed for channel 0. First pass (VIN unpowered) showed zero `hm2_7i80.0.7i84.*` pins; after the owner confirmed VIN power at 7i84U-A TB1 pin 5, a re-run of the same read-only `hm2_eth` load produced a real handshake (`Board hm2_7i80.0.7i84.0.0 Hardware Mode 0 = standard`) and the full 32 DI / 16 DO pin set (`input-00..31` + `-not`, `output-00..15`), matching `docs/architecture_decision.md`. **7i84U-B is not yet in hand (on order)** — channel 1 correctly did not enumerate and stays open until it arrives and is wired; no HAL change needed, just re-run. Full record: [`commissioning_logs/sserial_enumeration_check_2026-09-05.md`](commissioning_logs/sserial_enumeration_check_2026-09-05.md). This proves smart-serial presence only — 7i84U-A's TB3 field wiring and the 7i49/resolver interface are still unverified.
- [x] **2026-09-05 (at the machine): first live TB3 input confirmed — `input-00` and `input-13` (IN13 bench jumper, item 46) both read TRUE with 24V applied at the terminal.** Hit a real gotcha first: with VIN + VFIELDA + VFIELDB all correctly powered, inputs still read FALSE no matter what was applied — traced to the 7i84U-A's **Field I/O activity LED (CR6) not blinking**, meaning the card's field I/O engine wasn't cycling even though smart-serial transport looked perfectly healthy. A full power cycle of TB1 pins 1-5 together fixed it. **Takeaway for 7i84U-B bring-up:** if sserial enumerates clean but no input ever registers, check CR6 before re-checking wiring. Full writeup: [`commissioning_logs/sserial_enumeration_check_2026-09-05.md`](commissioning_logs/sserial_enumeration_check_2026-09-05.md#update-2026-09-05-later--tb3-input-liveness-check-and-a-real-gotcha).
- Collecting cabinet photos.

### Not started
- Live Mesa 7i80HDT install.
- HAL pin replacement from actual `readhmid` output.
- Resolver / analog measurements (per-axis winding pairs, return signal level).
- Axis bring-up.
- Spindle bring-up.
- ATC dry run.

## TODO list

### Task-list maintenance rule

This file is the live task authority. When a session discovers new work,
uncertainty, or a changed dependency, record it here in the same session:
add a dated checkbox under the appropriate phase, link the evidence or source
file, and state the closure test or owner decision. When work is completed,
check off the original item and record the date and resulting artifact. Do not
leave newly discovered work only in a handoff, issue, audit, or conversation.

**Resequenced 2026-08-17 around the physical install.** Procurement closed that
day (all Mesa hardware on hand), which changed what is actually next: the list
below is ordered by *dependency*, not by age. Phase A is covers-off reading that
gets harder or impossible once the Mazatrol comes out; Phase B is the install
itself and is the gate on every placeholder HAL name in the repo; Phase C is
blocked on an owner decision, not on work, and can be answered from a chair.
Nothing in Immediate energizes an output or moves an axis.

### Immediate — Phase A: read it before the Mazatrol comes out

Covers off, **no power needed**, and every item gets harder or impossible once
the NC is out of the cabinet. Do this pass first; it is cheap now and expensive
later.

- [ ] **Read `PIN11` on the SX-CPU2 card — "A" or "B".** "B" means the orient encoder is **powered from the NC**, so removing the Mazatrol would silently kill it, with no wiring change to point at. Decide before the NC comes out. See [`frsx_maintenance_manual_notes.md`](frsx_maintenance_manual_notes.md).
- [ ] Read/photograph the rest of the SX-CPU2 configuration: `PIN12`/`PIN13` (source vs sync input) and `SW2-1/5/6/7` (2nd positioning loop gain), positions legible. The card *is* the configuration — there is no parameter to read it back from.
- [ ] **Locate the 1024 ppr orient encoder** and read its nameplate — very likely the `MS3108B 20-29P` device from dwg 4143075301 p090, which would close that open question too.
- [ ] Use the drive's own **`ST2 ORIENTATION TEST`** toggle to prove orient standalone — no NC, no LinuxCNC — **while the Mazatrol is still in place** and there is a working reference to compare against. ⚠️ `ST1 RESET` is adjacent and must never be operated with the motor running.
- [ ] Capture/record X/Y/Z servo drive model labels and command/enable/fault terminal labels.
- [ ] Capture/record Mitsubishi FR-SX spindle drive model and analog/run/direction/alarm terminals.
- [ ] Capture cabinet photo set using the [cabinet photo checklist](cabinet_photo_checklist.md) — the as-found record, before anything is disturbed.
- [ ] Re-read dwg **4143175310 p079** (spindle-tacho legend, [`../wiring/authority_conflicts.md`](../wiring/authority_conflicts.md) §4) and **4143075301 p090** (`MS3108B` — same device as the motor PLG, or a second one?).
- [ ] **Look for `PRS-55` and `PRS-66` on the machine first** — the ATC tool-change-zone prox switches. `enrichment.py` flags both as possibly not fitted. If they are absent, the whole `CN3-39`/`CN3-44` paper conflict below is moot and both rows become `NOT_USED`.
- [ ] **Then buzz `CN3-39` and `CN3-44` at the BBIA-1 board** — two OEM sources disagree about what is on them ([`../wiring/authority_conflicts.md`](../wiring/authority_conflicts.md) §7.2). Dwg 4143075409 pg135 calls them the 2nd −Z / 2nd +Y limits (`PRS-66` / `PRS-55`); the terminal-unit pinout calls them `147` OIL TEMP DETECTOR and `SPTD` SPINDLE TIMER. Note only 24 of CN3's 50 pins are transcribed and the CND→CN index is **not** preserved across the pass-through, so both sources may be right about *different* pins. ⚠️ **Neither conductor may be landed on a Mesa input until this is settled.**
- [ ] **Read the jacket at `CN4-1` and `CN3-4`** — which is the spindle zero-speed conductor, wire `231` or wire `143`? Dwg 4143075407 pg133 says `143`/`CN3-4`; a 2026-08-09 *paper* reconciliation superseded that with `231`/`CN4-1` and was never traced, and the pinout still carries both rows ([`../wiring/authority_conflicts.md`](../wiring/authority_conflicts.md) §7.1). `SPINDLE_ZERO_SPEED` is the gear-shift interlock, so this one matters.
- [ ] While at the connectors: read the jacket on **`CN11-13`** (the other wire `231`, §7.1). Label read, no meter.
- [ ] **Buzz `CN2-14`** for continuity to the +Z over-travel limit switch *and* to `CN6-12` — three sources disagree about whether it is `+LTZ` Z-axis over travel, unlabelled, or a **combined +Y/+Z bus** (`+LYZ`) ([`../wiring/authority_conflicts.md`](../wiring/authority_conflicts.md) §7.3). Continuity to both +Y and +Z confirms the combined-bus reading. ⚠️ This pin is already on a printed ferrule (`B-TB3-05`), now released as `HOLD_DISPUTED_PIN` — do not land it until this resolves.

**Landing-audit cabinet items (added 2026-08-19; "row N" = gap row in
[`../wiring/nc_circuit_landing_audit.md`](../wiring/nc_circuit_landing_audit.md)
§2, which carries the full rationale and closure test per row).** Same
covers-off cabinet session as the buzz items above — §2.3 of the audit
sequences all of them into one visit.

- [ ] ⚠️ **Buzz `CN6-12` (+LYZ) and `CN6-13` (−LYZ)** against the ±Y and ±Z limit switches in the same session as the `CN2-14` buzz (rows 2–3). Also ring `CN6-13` against `CN1-5` to kill its provably-wrong Inside_Connec pointer (CN1-5 is the landed coolant-level circuit).
- [ ] ⚠️ **Buzz `CN3-3` (wire `142`)** — tool-clamp interlock or door-interlock channel 2 (MDINT.M)? If it's the door interlock, one channel of a dual-channel interlock is live and unmonitored (row 8). Owner disposition either way, before power-up.
- [ ] **Buzz the wire-`362` trio** — `CN2-1` / `CN2-36` / `CN3-36` against each other, the CA4 loom (CA4-W/L), and the RC3A `WLWT` relay terminals: one conductor or OEM segment-renumbering reuse, and which timer function each pin carries (rows 14–15).
- [ ] **Label-read `CN5-16`** (`1NRAILS` vs `INHRLS` — magazine rear LS or inhibit-read LS?) plus the strip-C INHRLS terminal and ladder p3 X02F to fix the identity (row 25).
- [ ] **Jacket-read the RC3A M-relay bank wires `3-48`/`3-49`/`3-45`** to fix the CN6-4 transcription slip (pins 4 and 5 both read M45T; pin 4 is almost certainly M44T/Y024) (rows 26–27).
- [ ] **FR-SX visit** (rows 9–13 + §2.2): (a) ⚠️ establish whether the `SET1`/`SET2` drive-arm handshake is required — **the spindle cannot be armed until this closes**: meter `CON1-7/-8`, confirm FR-SX vs DK-427 termination, check the Mitsubishi manual; (b) identify the `MS`/`OS` node (`CN4-5/6` → TB5) from the FR-SX CON1 terminal definitions — if MS is a speed contact it contradicts the SPINDLE_AT_SPEED "no discrete exists" note; (c) meter `CON1-24` (`CTM`) for a terminated conductor — drawn dashed, not even established as field-wired; (d) confirm the orient command really terminates at `ORC1`/`CON1-25`.

**Connector-accounting punch list (added 2026-08-18, from the tracing-completeness
audit — full per-connector detail in
[`../wiring/nc_connector_inventory.md`](../wiring/nc_connector_inventory.md)).**
Goal: every Honda MR connector that plugged into the NC has a connector ID, per-pin
wire identification, and every unused pin positively marked unused — many pins were
factory-allocated but never used, and today absence-from-the-CSV can't distinguish
"unused" from "never transcribed."

- [ ] **Photograph and label every CND (top-row) connector on BBIA-1** — shell size, board position, cable jacket markings — before the NC hardware moves. These are the connectors that physically plugged into the NC back panel FX30; no per-connector CND pinout exists in the repo and the CND→CN index is not pin-for-pin.
- [x] **Transcribe CN7 (50 pins, 2PC pallet changer) from the OEM print** — DONE 2026-08-18 from dwg 4143015323 (p86), 50/50 wires identified, all to TB6. Bonus: **CN8 discovered and transcribed on the same sheet** — a tenth bottom-row connector, entirely NC spare I/O (ISP4–22/OSP5–30), never cabled out.
- [x] **Complete CN3's remaining 26 pins** — DONE 2026-08-18 from dwg 4143075321 (p84): all 26 are genuinely unused on the print (blank, plus pin 13 marked SPARE), so CN3 is 50/50 accounted with nothing new allocated. The §7.2 CN3-39/44 conflict did NOT resolve — the fresh read adds a *third* OEM naming for those pins (39 = TOOL DETECTOR, 44 = SPINDLE TOOL DETECTOR); the buzz-out at the board remains the tie-breaker. Four CN3 signal-name divergences logged in `../wiring/bbia1_cn_pinouts.md`.
- [x] **Re-read the CN1/CN2/CN4/CN6 source sheets** — DONE 2026-08-18. All four now 50/50 or 20/20 accounted: CN1 (7 blank), CN2 (14 blank), CN6 (12 blank + pins 38/45 slashed out), and CN4's "missing" pins 18–20 confirmed populated (SE1/SE2/SE3 speed reference → CON1-31/-32/-30, matching p127). Three CN4 signal-name divergences (pins 15–17) logged in `../wiring/bbia1_cn_pinouts.md` — the p84+p127+authority-CSV triple agreement favors ORC2/OBA1/OBA2 over the CSV's COM/SETA/SETB.
- [x] **Transcribe CNA10** (NC-side spindle load-meter feed, dwg 4143075403 p127) and read its "REF. SHT. 04" — DONE 2026-08-18. The five source pins are documented in [`../wiring/interface_plane_crosswalk.md`](../wiring/interface_plane_crosswalk.md#cna10-disposition); retain/retire and Mesa allocation remain an owner decision.
- [ ] Check the NC rack for a **CNA6** position (M2 manual's detector connector family runs CNA 3–6; only 3/4/5 are accounted).
- [ ] Identify or rule out the **third "CN11"** (25-way pallet/coolant loom, dwg 03-81581-02, never independently read).

### Crosswalk closure — next wiring work

These are the next tasks created by the two-plane accounting pass. The CSVs and
diagrams are planning/accounting artifacts until each held route has physical
evidence and an authority disposition.

- [x] **NC circuit landing audit COMPLETE (2026-08-19).** All 37 GAP/UNCLEAR
  claims adversarially verified: 33 confirmed gaps (32 unique conductors — 3
  reclassified on verification, 1 still unclear at FR-SX CON1-24 CTM). Full
  coverage report, gap list with per-row closure actions, and a suggested
  single-cabinet-session work sequence:
  [`../wiring/nc_circuit_landing_audit.md`](../wiring/nc_circuit_landing_audit.md)
  (replaces the partial file). Headline items: SET1/SET2 drive-arm handshake
  is UNBOUND and the spindle will not run until it is landed or retired
  (gap rows 9–11); the ±LYZ over-travel bus question (rows 1–3) and the
  231-vs-143 zero-speed conductor (rows 4–5) stay do-not-land until buzzed.
- [ ] **Continuity-trace the six `HOLD_SOURCE_TRACE` Plane B rows** for the
  X/Y/Z direct analog command and return pairs from the DK-427/drive side back
  to the removed NC harness; record the exact OEM connector and pin before
  clearing any hold in [`../wiring/plane_b_pin_crosswalk.csv`](../wiring/plane_b_pin_crosswalk.csv).
- [ ] **Decide CNA10 disposition:** retain the spindle/Z load-meter feed and
  allocate a Mesa measurement path, or retire/cap it with an owner decision;
  record the result in the Plane B crosswalk and authority CSV.
- [ ] **Commission the resolver routes:** verify winding polarity/phase,
  excitation and return levels, and shield termination against the proposed
  Plane B resolver mappings before releasing the harness for installation.

### Immediate — Phase B: seat the cards and enumerate the stack

**This is the gate on the whole repo.** Every `hm2_7i80.0...` pin name in
`linuxcnc/` and `mesa/current_pin_authority.csv` is a placeholder until the pin
dump exists. Do the steps in order; **no field wiring lands on a Mesa terminal
until step 6 is done.**

- [ ] 1. Confirm the host/network path first, since everything below depends on it: host NIC `enp0s31f6` (**name unverified** — check `ip -o link show`) at 10.10.10.1/24, board static 10.10.10.121, `ping 10.10.10.121`, and `hm2_eth` `board_ip="10.10.10.121"`.
- [ ] 2. Seat **7i49 on P1** and **7i44 on P3** with the 50-pin IDC cables. **P2 stays empty — no exceptions**: it is bare 3.3 V FPGA GPIO and must never see 24 V field wiring.
- [ ] 3. Bring up **7i84U-A on 7i44 channel 0** and **7i84U-B on channel 1**, both under HostMot2 smart-serial port 0. Preserve the A/B identities — do not let them swap silently.
- [ ] 4. Re-run `mesaflash --readhmid` **after** the cards are seated and diff it against [`../mesa/firmware/readhmid_2026-08-13.txt`](../mesa/firmware/readhmid_2026-08-13.txt) (bench read, host only). Confirm the daughter cards now enumerate.
- [ ] 5. Confirm both remotes appear: `halcmd show pin hm2` shows `hm2_7i80.0.7i84.0.0.*` (A) and `hm2_7i80.0.7i84.0.1.*` (B). If only one appears, stop — do not renumber to make it fit.
- [ ] 6. Dump actual HAL pins and save as `mesa/firmware/hal_pins_YYYY-MM-DD.txt`, then **replace the placeholder pin names in the HAL files from that dump** and re-run `validate_authority.py` + `validate_control_logic.py`.
- [ ] 7. Set 7i49 resolver excitation to **5 kHz** (options 2.5/5/10 kHz; 4.5 kHz is 141E26 comparison data, not a confirmed 25E spec — verify by scope at the excitation step).

### Immediate — Phase C: owner decisions (blocked on you, not on work)

All recorded, none applied — each one unblocks an edit to the authority CSV.
See [`../wiring/authority_conflicts.md`](../wiring/authority_conflicts.md) §5 and
[`../wiring/cabinet_asfound_survey.md`](../wiring/cabinet_asfound_survey.md).

- [ ] Add **`57B`** to the OEM preserve list in `CLAUDE.md`. Confirmed a factory terminal designation on the cabinet safety-chain strip; the list currently names only `57` and `57A`.
- [ ] `AIR_BLAST` (7i84U-B OUT3): relabel field point **`SOL-62` → `SOL-15`** (wire `415`, read at the coil). Function and wire were already correct — a relabel, not a rebinding.
- [ ] `TOUCH_SENSOR_BLAST` (OUT4) and `TAP_COOLANT_BLAST` (OUT5): **their devices are not fitted**. Recommend `NOT_USED`/`RESERVED`, as was done for `MIST_COOLANT`. Do not fit RLY-6/RLY-7.
- [ ] **`SOL-16` work air blast is fitted and wired (wire `416`/`216`, CN11-7) but no authority row drives it.** Allocate an output or record a decision to drop the function. 7i84U-A is at 100 % — check [`io_capacity_reconciliation.md`](io_capacity_reconciliation.md) first.
- [ ] `LUBE_OK` (IN25): status promotion now justified — `PS-5` tag, wire `355` and `CN6-39` all physically confirmed together. Contact form and trip pressure still unverified.
- [ ] Confirm scope: mist coolant, work light, manual tool clamp/unclamp pushbuttons, and cover-motion outputs are deferred or removed per [`io_capacity_reconciliation.md`](io_capacity_reconciliation.md). 2PC pallet changer is out of retrofit scope. 7i84U-A is at 100/100% — any new signal there requires reallocating an existing one to 7i84U-B.

**Landing-audit owner decisions (added 2026-08-19; row numbers per
[`../wiring/nc_circuit_landing_audit.md`](../wiring/nc_circuit_landing_audit.md)
§2 — paper-only, no meter needed):**

- [ ] **`CN2-43` (wire `524`, axis-selector switched 24 V feed):** retire the OEM axis selector (pendant/UI replaces it) with a CYCLE_START_PB-style DEFERRED row — then verify dead before capping (row 20).
- [ ] **`CN2-45` (`CP24`, panel feed-hold latch):** land on a Mesa input netted to `halui.program.pause`, **or** retire the panel latch and uncomment/bind `whb.feed-hold` in `pendant_whb04b.hal` — `first_move_plan.md` requires a working feed hold in the approved-window test, and today neither path exists (row 21).
- [ ] **`CN5-9` (`EFHD`, external feed hold / remote box):** answer the archived OPTION_VERIFY question — land on a spare input or record DROP and cap at strip B (row 23).
- [ ] **M-code outputs M43/M44/M45 (`CN6-3/4/5`):** one decision for the family — allocate 7i84U-B outputs + remaps, or record a dated RETIRED with a do-not-restore clause. Ratify the archived "Dropped/deferred" note for M43 (CN6-3) into a current owner decision; CN6-4/5 have no disposition at all (rows 26–27).
- [ ] **Housekeeping from the audit:** add `CN5-5` (`EMC`, EMG STOP 2nd) to `INTERFACE_ARCHITECTURE.md` §3a's E-stop conductor list, and fix the 4-axis retire note's `CN2`→`CN5` citation.

### Next — bench and shop work, in parallel with Phase B

None of this needs the cards seated; all of it must be done before anything is
energized.

- [ ] Build the resolver + analog cables per [`grounding_shielding_plan.md`](grounding_shielding_plan.md): three individually shielded twisted pairs per resolver, shields at the 7i49 end only, drive-specific analog-common/shield treatment, and documented routing away from switching power. Establish sourced project acceptance thresholds, execute the staged noise survey, and log results under `docs/commissioning_logs/`.
- [ ] Trace `TAPC` from **CN6-18 → CNB-46** and find what it drives. Last unresolved device path in `authority_conflicts.md` §5.
- [ ] Confirm whether `SOL-31` flood coolant and the other three unfitted placard tags exist **elsewhere** on the machine before any row is dropped. "Not on the head" is not "does not exist".
- [ ] Measure solenoid/contactor coil **current** to size RLY-1…RLY-7 contacts and decide interposing-relay and suppression needs. Coil voltage is confirmed 100 VAC; current is not.
- [ ] Identify each axis resolver winding pair with an **ohmmeter before power**, at the drive-end CNA connectors. Roles are now settled from the M2 manual's own figure (12/13 SIN, 14/15 COS, 16/17 the winding the 7i49 excites) — confirm them, don't re-derive them. See [`resolver_commissioning.md`](resolver_commissioning.md).

**Landing-audit device traces (added 2026-08-19; row numbers per
[`../wiring/nc_circuit_landing_audit.md`](../wiring/nc_circuit_landing_audit.md)
§2). Each is a live conductor with no Mesa landing and no disposition — trace
to the device, then land (authority row + net) or record an explicit
retirement:**

- [ ] **`CN2-2` (wire `351`, magazine FWD/REV shifter):** trace CNQ-37 → CN2-2 → CA4-V to the device. NOT the circuit MAG_CW/CCW_SOL supersede — those replace CN11-1/2 (row 16).
- [ ] **`CN2-34`/`CN2-35` (wires `342`/`345`, tool-measure device timer + switch):** trace CNQ-34/CA4-J to the stand; one decision covers the pair — keep for tool-length routines, or RETIRED/capped (MP-3 + LinuxCNC replaces it) (rows 17–18).
- [ ] **`CN2-37` (wire `239`, magazine lube pressure switch):** distinct from head-lube `LUBE_OK` (PS-5/355). Trace via CA4-M, confirm fitted, then a 7i84U-B input + net `mag-lube-ok` or explicit deferral (row 19).
- [ ] **`CN3-35` (`WLAL`, way-lube alarm AL-54):** way lube ≠ head lube; real alarm circuit with no channel. Trace the driving device through TB5-D2; land on a spare DI or defer with the mist/work-light precedent (row 22).
- [ ] **`CN5-10` (`RCTLS`, recessing-tool LS):** physically verify whether the recessing option is fitted on SN 060231 — NOT_FITTED entry or input allocation (row 24).
- [ ] **`CN6-24` (wire `241`, power-on/main-lamp interlock cluster):** trace wires 241/240; either a named §3a exception (stays OEM power sequencing) or RETIRED (dies with the Mazatrol, Y090 PWI precedent). Its documented CN2-23 inside routing is provably broken — correct the pinout row (row 29).
- [ ] **`CN6-34` (`NSFT`, NG TOOL ATC status):** no row, net, crosswalk, or ladder mention anywhere — determine direction/function from the OEM CN6 sheet or at the relay card; field-originated status feeds `mazak_atc.comp` + D13 hazard analysis, NC-driven indication retires (row 30).
- [ ] **`CN11-11` (wire `235`, SOL-35 dust-inhale):** §5 says it belongs to no current row. Trace 435 from the solenoid bank; fitted-and-wanted ⇒ output + interposing relay, else NOT_USED — and purge the stale RLY-6/SOL-35 wiring instructions elsewhere in this file (row 31).
- [ ] **`CN11-12` (wire `236`, SOL-36 oil-hole coolant):** trace 736 into the CB panel; record NOT_FITTED/RESERVED or allocate. **Also resolve the wire-236 duplication with the landed COOLANT_ON row (CN11-15)** — its factory_wire depends on it (row 32).
- [ ] **`TAPC` CN6-18 → CNB-46 trace** (row 28) — already listed above; the audit adds: if it dead-ends, RETIRED/cap/log; if a live device appears, revisit the OUT5/RLY-7 NOT_USED status.

### Next — qualification, before any drive is enabled

- [ ] Execute the hm2_eth NIC and multi-hour latency-under-load acceptance per [`hm2_eth_nic_validation.md`](hm2_eth_nic_validation.md) on the exact PC, NIC, kernel, BIOS settings and representative workload that will run the machine; record NIC/MAC/driver/IRQ/offload state, verify the checked-in `packet-error-exceeded` + `watchdog.has_bit` inhibit wiring against actual HAL pins, and fault-inject both paths.
- [ ] Measure smart-serial input/output latency and probing jitter end-to-end; fault-inject 7i44 and hm2_eth link loss and confirm both hardware watchdog safe states plus the software latch. Do not add DPLL or `SSERIAL_TIMER` settings for resolver/sserial without a primary source that documents those interfaces. See [`smart_serial_latency.md`](smart_serial_latency.md).
- [ ] Confirm the Renishaw MP-3 probe SKIP1 lands on 7i84U-B TB3 IN15 (opto-isolated 24 V input). Do NOT wire the probe to bare P2 GPIO — that path is RETRACTED (see [`superseded_claims_2026-08-06.md`](superseded_claims_2026-08-06.md) row 15). All P2 pins remain unused/spare.

### Control PC — host hardware, before commissioning

The OptiPlex is now the only thing standing between a running program and a
storage fault, so its own hardware gets qualified like any other part of the
machine.

- [ ] **Flash both SSDs to current firmware — 2026-08-23, owner decision: before commissioning.** Root disk (Crucial MX500) is on `M3CR010`, the 2017 launch firmware, 36 revisions behind `M3CR046`, whose release notes name "a hang condition occurring under corner-case workloads" — a storage hang on the disk running LinuxCNC presents as the control freezing mid-program, not as a disk problem. Backup disk (SanDisk X400 `SD8SN8U`) is on `X4120006` vs Dell's `X4152012`, which fixes "drive lost during cold boot" — a backup drive that intermittently fails to appear is a backup that silently stops. Full procedure, ordering, and the root-image safety net: [`ssd_firmware_plan.md`](ssd_firmware_plan.md). **Closure test:** `smartctl -i` reports `M3CR046` / `X4152012`, LinuxCNC starts, `mazak-gcode-backup.service` runs clean.
- [ ] **Resolve how the SanDisk X400 gets flashed without Windows** — Dell package `hv8f3` is a Windows executable and Windows was removed from this box 2026-08-23. Either find a bootable/DUP form, or move the M.2 drive to a Windows machine to flash and return it. Blocks the item above. See [`ssd_firmware_plan.md`](ssd_firmware_plan.md) step 3.
- [ ] **Reseat both ends of the `/dev/sda` SATA cable** while the case is open for the firmware work. `UDMA_CRC_Error_Count = 4` with zero reallocated sectors and zero uncorrectable errors — that is the SATA link dropping frames, i.e. a cable or connector, not the flash. **Closure test:** counter stops climbing; if it does not, replace the cable. Visible on the `netwatch` disk line.
- [x] **Offsite copy of the G-code exists — DONE 2026-08-23.** `mazak-gcode-backup-remote.timer` ships a dated, SHA-256-verified tarball of `~/linuxcnc` to the iMac daily at 03:15, keeping 30. Tarball rather than rsync because the iMac runs **openrsync**, not GNU rsync. Restore drilled end to end: snapshot pulled back, extracted, byte-identical to the live file. ~9 MB compressed over a 1.57 MB/s relayed tailnet path. See [`../scripts/backup/README.md`](../scripts/backup/README.md).
- [x] **Second copy of the G-code exists — DONE 2026-08-23.** The box's unused second SSD (was a never-used Windows install) is now a 232 GB ext4 volume at `/mnt/media`, and `mazak-gcode-backup.timer` mirrors `~/linuxcnc` to it hourly with a `mountpoint` guard, a deletion-history safety net, and `nofail` so a dead backup disk can never stop the machine booting. Recovery drill passed end to end. See [`../scripts/backup/README.md`](../scripts/backup/README.md).
- [x] **Disk health is monitored and reaches a human — DONE 2026-08-23.** `smartmontools` installed, baseline captured (both drives PASSED, short self-tests clean), hourly SMART snapshot to `/var/lib/mazak-health/smart.json`, rendered per-drive on `netwatch`. Stock Debian smartd mailed local root on a box with no MTA — every warning it would ever produce went nowhere; replaced with a journal + flag-file + optional-push alert path. See [`../scripts/health/README.md`](../scripts/health/README.md).
- [x] ⚠️ **Mesa control subnet renumbered to `10.10.10.0/24` — DONE 2026-08-23, at the machine.** The workshop LAN is also `192.168.1.0/24` (iMac `.19`, gateway `.1`) and this PC held **`192.168.1.1`** on the Mesa NIC — the shop gateway's own address. Two failures, one loud (patch the Mesa NIC into the shop switch and this PC fights the router for `.1`, taking down the shop network) and one silent (the route `192.168.1.0/24 dev enp0s31f6` sent every shop-LAN packet out the Mesa link into a dead end, so the iMac was unreachable by LAN address). **Done:** EEPROM written via `mesaflash --set ip=10.10.10.121`, owner moved jumper **W3 UP** (W2 DOWN) and power-cycled, host NIC moved to `10.10.10.1/24` with `scripts/health/switch_mesa_subnet.sh`, `board_ip` updated in `linuxcnc/mazak_vqc_20_40.hal`, and every live doc reference rewritten (dated commissioning logs and the PCW inquiry left as-recorded, with address notes). **The renumber also reaches outside this repo** — `netwatch` reported the board offline until its config, its built-in default, and two memory notes were updated (`claude-config` `fe392b4`). Check there too before assuming a renumber is complete. **Verified:** board answers at `10.10.10.121`; `readhmid` and `--sserial` output **byte-identical** to the committed `2026-08-13` baselines, so the renumber changed nothing about the board; `ip route get 192.168.1.19` now leaves via the default route instead of the Mesa NIC. **Rollback if ever needed:** W3 DOWN → board reverts to the fixed default `192.168.1.121`.
- [ ] **Decide how this box reaches the shop LAN at all.** The OptiPlex has one onboard NIC, dedicated to Mesa, plus a USB WiFi adapter (currently `192.168.68.109`). After the renumber the shop LAN is reachable, but over WiFi unless a second wired NIC is added. Irrelevant for the ~9 MB nightly backup; relevant if bulk media ever moves this way.
- [ ] ⚠️ **Create a private Google OAuth client ID for rclone — deadline is this year.** Both rclone remotes (`gdrive` read-only on the OptiPlex for the photo backup, `gdrive-backup` write-scoped on the MacBook for the cloud upload) use **rclone's shared client ID**, and rclone now warns it *"is being retired and will stop working during 2026"*. It is already August 2026. When it stops, the nightly Mazak photo backup silently starts failing. Fix: create a project in Google Cloud Console, enable the Drive API, make an OAuth client ID, and add `client_id`/`client_secret` to both remotes — no re-download needed, the existing local copies stay valid. See <https://rclone.org/drive/#making-your-own-client-id>. **Closure test:** `rclone about gdrive:` runs with no retirement NOTICE, and a photo-backup run logs OK.
- [x] **Push channel configured — DONE 2026-08-23.** ntfy.sh with a random 24-hex-character topic, written to `/etc/mazak-health/notify.conf` (mode 600, **deliberately not in this public repo** — the topic name is the only thing protecting the channel, and anyone holding it can both send and read alerts). Owner subscribes from the ntfy phone app; no account needed. **Verified:** a simulated smartd pending-sector event delivered to the phone, the journal, the flag file, and the `netwatch` disk panel in one pass.

### Next — resolver and analog path, drives inhibited

In this order. Pole count gates scaling, so it comes before any scale is entered.

- [ ] Confirm the 7i49 is the **sole resolver excitation source** — nothing from the old drive/control still driving the windings before energizing.
- [ ] Scope RESDRV excitation and RESSIN/RESCOS amplitude and phase at rest and under motion. **Do not expect the old ~1 V RMS from ~2 V RMS figure** — that assumed a 2:1 step-DOWN taken from the rotor-excited 141E26. This detector is the other construction: Mitsubishi excited the two-phase windings and read the single one, so driving it the 7i49 way (excite 16/17) runs it **backwards through a ~0.3 ratio, i.e. roughly a 3× step-UP**. Returns may be several volts, not one. Measure before assuming the input range is safe, and see the 7i49-vs-7i49HV question below. **W2 does NOT affect axis channels 0/1/2** (only 3/4/5), so it is not a valid remedy for a hot X/Y/Z return; if the return is far off the ~1 V RMS target, escalate to Mesa (PCW) for review of the specific TS2014N suffix before adding external dividers or a 7i49HV.
- [ ] **Verify `RESOLVER_SCALE` = 2.000 mm (0.07874016 in) per electrical revolution.** No longer a discovery: τ = 2 is stored in `MC1–MC4` (= 784) and gives grid spacing 4000/τ = 2.000 mm, which *is* travel per resolver electrical revolution — **independent of the ballscrew lead**. A sibling VQC 15/40 retrofit runs the identical 0.07874016. Marked `PROPOSED`; confirm on the machine and let the measurement win if they disagree. Derivation and failure modes: [`resolver_commissioning.md`](resolver_commissioning.md#pole-count-and-resolver-scale-derived-from-τ).
- [ ] Enter `RESOLVER_SCALE` for X/Y/Z: ~~confirm the flex coupling is 1:1~~ — **the coupling is confirmed 1:1 from the OEM parts list, 2026-08-17.** All three axes use `L10MN000070`, a **MIKI PULLEY ARM-100 with ⌀9.52 mm bores on both sides**, joining the resolver coaxially to the far end of the ballscrew (drawing `041311AS012`, PDF p. 49 of `413LE02A000.pdf`). Equal bores, a shaft coupling, no ratio — so nothing scales the derived 0.07874016 in. Note the 18:30 timing-belt reduction found in the same section is **motor→screw (1.6667:1)** and sits on the far side of the screw from the resolver: do **not** apply it to `RESOLVER_SCALE`, but it *is* needed for motor-rpm ↔ feedrate arithmetic. Details: [`feed_drive_parts_2026-08-17.md`](feed_drive_parts_2026-08-17.md). Then enter the signed value into each `[JOINT_N]` block — sign per axis direction. Verify by counting `hm2_7i80.0.resolver.NN.rawcounts` against a dial indicator over multiple full ballscrew revolutions and adjust; flip the sign if the axis counts backwards. Set `RESOLVER_VELOCITY_SCALE` to the same signed value so `.velocity` reports in/s. Do NOT leave the 1.0 placeholder in place before running the axis — the HostMot2 doc defines `.scale` as machine units per RESOLVER ELECTRICAL revolution, not per motor rev; internal consistency between the two 1.0 defaults does not prove one inch per revolution.
- [ ] Verify analog command polarity/scaling for X/Y/Z on 7i49 AOUT0/1/2 before enabling drives.

### Open desk items — no machine access needed

> A dated narrative snapshot of the resolver thread — what is settled, what is
> merely proposed, the source documents and the traps — is in
> [`../handoff.md`](../handoff.md). **This file is the authority for the task
> list**; the handoff is context for a session picking the thread up cold.


Both are pure document work and both bear on decisions already in the BOM.

- [x] **Settle plain 7i49 vs 7i49HV — DONE 2026-08-22 (owner). It is a plain `7i49`.**
  The sister VQC 15/40's committed config names `7i49` in both INI and HAL
  (`MAZAK-VQC1540.ini:138`, `.hal:28`) with no "HV" anywhere in that repository. A
  purchased-parts spreadsheet in the same repo (`vqc-retrofit-wiring-sheet2.ods`,
  Sheet3 row 4) had briefly been read as `7i49HV` on 2026-08-17, on the theory that
  HAL/INI comments can't settle it since both cards expose identical
  `hm2_*.resolver.NN.*` pins. Owner confirmation on 2026-08-22 settles it the other
  way: the config comments were right, and the `.ods` row was either misread or does
  not reflect what was actually installed. `bom/` and the stack table are updated.
  Full write-up: [`../bom/README.md`](../bom/README.md#which-7i49-the-sister-machine-actually-runs--settled-2026-08-22-owner-superseding-2026-08-17).
  - **Also corrected on 2026-08-17, still stands:** the sister runs
    **2.5 kHz, not 5 kHz** (`MAZAK-VQC1540.ini:176`, applied live at `.hal:117`). Our
    plan still says 5 kHz "verify on scope" — that is an unanchored choice, not one the
    sister corroborates.
  - **Small follow-up, does not block ordering:** get `7i49man.pdf` into
    `docs/Mesa Manuals/` to confirm Mesa's "2:1" vs "1:2" direction convention.
    `freeby.mesanet.com` served an expired certificate on 2026-08-17.
- [x] **Ballscrew lead = 10.000 mm on X, Y and Z — CLOSED BY MEASUREMENT 2026-08-17.** At the
  machine, unpowered: each **ballscrew itself** (not the motor — the belt reduction sits between
  them) was hand-turned **one full revolution**, and each axis moved **10 mm**. All three
  measured, none inferred. That is the floor of the admissible set and refutes 12 / 14 / 16 /
  20 mm. Consequences, in order of usefulness:
  - **`RESOLVER_INDEX_DIVISOR = 5`, now entered in the INI** on all three joints (was the
    placeholder `1`, whose comment wrongly expected a single-speed detector). n = lead ÷ grid
    spacing = 10.000 ÷ 2.000, with the confirmed 1:1 resolver coupling. Still rests on the
    τ = 2 derivation for the 2.000 mm, so it is *determined*, not *measured*. **The check is a
    scope reading and needs no Mesa hardware** — Test 1 in
    [`resolver_commissioning.md`](resolver_commissioning.md#test-1--nulls-per-mechanical-revolution-run-this-first-it-gates-scaling):
    hand-turn one screw revolution and expect **5 electrical revolutions = 10 amplitude nulls**,
    a null every 1.000 mm of travel. **Count nulls and halve them** — the envelope shows 2n, and
    reading it as n is the same doubling trap that produced the 20 mm lead. Test 1 said
    `n = nulls` until 2026-08-17; that is corrected.
  - **The 1985 factory parameter sheet is corroborated.** `RF1–3 = 4724` = 12.000 m/min ÷
    10 mm = 1200 screw rpm = exactly each motor's rated Nmax. The rapid the machine was built
    to is **12.000 m/min = 472.4 in/min = 7.874 in/s** — a design ceiling, **not** a
    commissioning value. Leave `MAX_VELOCITY` at its conservative bring-up clamp.
  - **The "poles" trap is dead.** Reading M2 printed p. 104 literally (5 pole pairs = 10 poles)
    predicted a 20 mm lead. The screw says 10. Nobody should double the lead off that sentence.
  - **`RESOLVER_SCALE` is unchanged** — it never depended on the lead.
  - Write-up, including which paper arguments survived: [`ballscrew_lead_2026-08-17.md`](ballscrew_lead_2026-08-17.md).
  - **The same-lead inference is now redundant** — it was right, but every axis has its own
    measurement. Consequently **the X A-type/B-type question no longer touches the lead**:
    either screw turns 10 mm per revolution. The variant still governs the belt ratio
    (1.25:1 vs 1.6667:1) and so the motor-rpm arithmetic — still confirm it by counting teeth.

- [x] **~~Find the ballscrew lead~~ — the paper search, for the record: the parts list is read and does not answer it (2026-08-17).**
  The parts list was located: it is **already on the OptiPlex** as
  `~/Documents/obisidian/Machine Shop/Mazak VQC-20-40 Retrofit/Manuals/413LE02A000.pdf`
  (byte-identical to the Drive copy), filed under its Mazak publication number rather than a
  searchable name. Read visually — it is a pure image scan, 1,552 chars of text layer across
  298 pages.
  - **Screw part numbers, now recorded:** Y is **`14131104600`**; Z is **`14131303340`**.
    **X depends on the variant** — the parts list carries two X drives, A-type §20
    (`14131104600`) and B-type §21 (**`14131110470`**), and the evidence says this machine is
    the **B-type** (X travel ≈ 1002 mm vs the A/B spec of 635/1000 mm, and the X motor
    nameplate reads HD 101-12). Treat X as `14131110470` at a **1.25:1** belt ratio, not the
    1.667:1 that applies to Y. Confirm by counting teeth.
  - **The lead is not printed** on any of the four ball-screw entries in the book, and the
    drawings carry no dimensions at all. The premise that "Mazak screw part numbers usually
    encode the lead" is not borne out.
  - Full drivetrain readout — motors, pulleys, belts, resolver, coupling, bearings —
    is in [`feed_drive_parts_2026-08-17.md`](feed_drive_parts_2026-08-17.md).
  - **The lead was BOUNDED from paper, `lead ≥ 10.000 mm`,** from motor Nmax and pulley tooth
    counts hand-lettered on the 1982 servo-drive schematic `41434WB.pdf` PDF p. 128 against the
    factory rapid `RF1–3 = 4724` (12.0 m/min): every axis reaches 1200 screw rpm at its motor's
    ceiling, so lead ≥ 11,998.96 ÷ 1200 = 9.999, and the M2 grid rule forces a multiple of
    2.000 mm. **The measurement landed on the floor, so the bound was tight.** Full write-up —
    the RT-5XA-11 naming argument, the poles caveat, what must **not** be cited, and every
    document confirmed silent: [`ballscrew_lead_2026-08-17.md`](ballscrew_lead_2026-08-17.md).
  - **Do NOT cite the sister machine's `RESOLVER_INDEX_DIVISOR = 5` as support for n = 5,**
    and do not now cite the measurement as vindicating it. It is the circular route: the sister
    value and our n = 5 are the same claim restated. Note the agreement, never fold it in.
  - **The RT-5XA-11 naming argument turned out right but is still not citable.** No document
    says the family digit is the pole count. Cite the measured lead instead.

#### Two side findings from the 2026-08-17 sister-repo read

Both corroborate `handoff.md` claims from an independent source; neither was the reason for the read.

- **`RESOLVER_SCALE = 0.07874016` is confirmed present**, identical to our proposed value,
  on all three axes (`MAZAK-VQC1540.ini:197/233/269`). `handoff.md` already cites the sister
  machine for this; this is the direct line reference it lacked.
- **Switch homing is corroborated.** All three axes run `HOME_USE_INDEX = NO`
  (`MAZAK-VQC1540.ini:210/246/282`) despite the config wiring `index-enable` and generating
  an emulated index. A comparable machine with the same detectors deliberately not homing on
  index is independent support for the multi-pole finding in `handoff.md` (M2 Table 14.3-1,
  §14.2, §6.7.1) — reached from a config file rather than from the manual.

### Two traps that produced false negatives on 2026-08-17

Both cost real time and both looked like settled findings until they were re-checked.

1. **Grepping OCR of a scanned manual is not a search.** The full-text OCR of the 48-page parameter book returned zero hits for `tau`/`grid`/`detector`/`resolver`/`pole`, and that was reported as "τ is not in the parameter book". τ *is* in it — printed as a Greek letter inside a figure, which OCR renders as noise. **Render the page and look at it.**
2. **`which <tool>` over SSH is not a check for installation.** A non-interactive SSH shell gets `PATH=/usr/local/bin:/usr/bin:/bin:/usr/games`, so anything in `~/.local/bin` is invisible. Claude Code was reported "not installed" on the OptiPlex while sitting at `~/.local/bin/claude`. Test the explicit path, or use a login shell.

### Next — field I/O verification, outputs disabled

Needs Phase B done (real pin names) and the coil measurements above.

- [ ] Verify 7i84U-B TB3 limit/home inputs and TB3 drive-enable outputs against cabinet contacts; measure each input path with an ohmmeter before deciding whether to consume `input-NN` (raw) or `input-NN-not` (complement) in HAL — sserial input pins do NOT have an `invert_input` parameter (see [sserial(9)](https://linuxcnc.org/docs/html/man/man9/sserial.9.html)). Verify the probe SKIP1 input on 7i84U-B TB3 IN15 (opto-isolated 24 V) separately.
- [ ] Wire interposing relays (RLY-5/6/7) for the 100VAC relay-driven loads SOL-35/61/62 on 7i84U-B TB3 OUT4/5/3 as assigned. Do the same for the ATC barrier on TB3 OUT6 (Y095 TCME.M).
- [ ] Verify ATC prox/solenoid labels and normal states: PRS-8/9, PRS-10/12, PRS-13, PRS-21 through PRS-25, SOL-8A/8B, SOL-10, M15/M16 if present.
- [ ] **Verify the post-retrofit source of the ±12 V tachogenerator rail** (`CNA3/4/5` pins 6/2) before first servo enable — a dead rail means a TRA drive with no velocity feedback (landing audit §2.4).
- [ ] **Verify the 2PC loom is physically isolated at TB6 before power-on** — axis-interlock and external cycle-start conductors live there, and the +24V/0G rails stay energized unless the loom is lifted (landing audit §2.4). Positively identify, verify dead, and cap the cabled factory spares (SP16–19, CN2-39/46/47, CN5-11/12/17/18) at teardown.

### Later — motion, spindle, ATC

Every item here moves something. Human at the machine, E-stop in reach, one axis
at a time.

- [ ] Bring up resolver feedback via the 7i49 (P1) with drives disabled.
- [ ] Follow the FF1-first velocity-mode commissioning procedure in [`servo_commissioning.md`](servo_commissioning.md) for X, then Y, then Z: zero-command null check, low-voltage volts-per-speed calibration, `OUTPUT_SCALE` per axis, then FF1 → P → I/D. Do NOT tune from zero-gain placeholders until the volts-per-speed calibration is done. Log each axis under `docs/commissioning_logs/<axis>_YYYYMMDD.md`.
- [ ] Bring up one axis at a time at low gain / low speed.
- [ ] Prove homes/limits (7i84U-B TB3).
- [ ] Verify FR-SX spindle command on 7i49 AOUT3 (speed) plus 7i84U-A digital FWD/REV/ENA, then bring up the spindle at low RPM with verified analog scaling.
- [ ] Design and commission the `mazak_atc_zone` HAL component + `M100`/`M101` user-M-code permit pair that dynamically drives `ini.y.max_limit` from +0.0394 to +9.5000 only after prerequisites are met (homed, no fault, spindle oriented, Z >= -5.9449, PRS-55/66 consistent). Prove motmod's update timing with halscope; do not assume it. Until this exists the remap will not tool-change and `[ATC] DRY_RUN = 1` remains set. See [`y_soft_limit_atc_zone.md`](y_soft_limit_atc_zone.md).
- [ ] Dry-run ATC/hydraulic sequence with no tool load.
- [ ] Decide whether any optional future expansion I/O (7i44 physical channels 2-7, MPG pendant, 4th axis) and the USB pendant are needed.

### Documentation backlog — not gating anything

Real gaps, but nothing downstream waits on them.

- [ ] `ORCM2` exists per the drive manual but is untracked in this repo (only `ORCM1` is). Check the element list and terminal unit.
- [ ] Find a **complete** FR-SX manual scan — the committed copy is printed pages 1–38; Chapter 6 (orient detector installation) and the SX-PW/SX-AJ sections are missing.
- [ ] Determine whether the schematics' machine-side "SPINDLE ENCODER" (`MS3108B 20-29P`, dwg 4143075301 p090) is a **second** physical device or another view of the motor PLG. Cheapest check: photograph the spindle head for anything encoder-shaped. Nothing depends on the answer now that `num_encoders=0` is settled.

### Closed — kept for the rationale, not the checkmark

> **Address note (2026-08-23):** items below cite the Mesa control subnet as
> `192.168.1.0/24` / `192.168.1.121`. That was correct when they were closed; the
> subnet was renumbered to `10.10.10.0/24` / `10.10.10.121` on 2026-08-23. Left
> as-recorded on purpose.

- [x] **All Mesa interface hardware on hand (2026-08-17).** 7i80HDT, 7i49, 7i44, 7i84U-A, 7i84U-B and the 50-pin IDC cables. On-hand is inventory, not evidence: only the 7i80HDT has been proven present electrically, so every daughter-card pin name stays a placeholder until Phase B step 6.
- [x] 7i80HDT is in hand, on the network at 192.168.1.121, and flashed with `7i80hdt_rmsvss6_8.bin`.
- [x] **D3 complete — firmware is flashed and its provenance closed.** `7i80hdt_rmsvss6_8.bin` (2026-08-11), layout/identity confirmed by two independent `readhmid` reads plus a recorded SHA-256, source cited (Peter Wallace, Mesa Electronics, `freeby.mesanet.com/7i80hdt_rmsvss6_8.zip`, 2026-08-11), the binary committed under `mesa/firmware/`, and the recovery procedure documented from the 7I80HD manual (fallback + jumper-W5 dual-flash recovery) at `docs/Mesa Manuals/7i80hdman.pdf`.
- [x] **FR-SX orient detector — ANSWERED 2026-08-13 from the drive manual.** `docs/OEM Manuals/…BCN-21735-S5.pdf` §5.2: the `SX-CPU2` card is fitted "when the controller unit is equipped with **1024P×4/Rev. encoder type multi-point orientation**" — and this machine has an `SX-CPU2`. So the drive orients from a **1024 ppr encoder**, which is **not** the motor's 512 c/t PLG. See [`frsx_maintenance_manual_notes.md`](frsx_maintenance_manual_notes.md).
- [x] **DECIDED 2026-08-12 (owner): LinuxCNC does not read spindle position.** `num_encoders=0`, P2 empty, and `SPINDLE_ENCODER` `UNBOUND` are settled, not pending. Orient is FR-SX internal, speed supervision is discrete, and tapping uses a floating holder (no rigid tapping / G33 in scope). The motor PLG is structurally unusable anyway — it sits upstream of the 2-speed gearbox and has no index line. See [`spindle_motor_plg_encoder.md`](spindle_motor_plg_encoder.md#design-decision--linuxcnc-does-not-read-spindle-position).

## Bring-up order (summary)

1. Confirm 7i80HDT detection over Ethernet (host static IP 192.168.1.1/24, `ping 192.168.1.121`, `mesaflash --device 7i80hdt --addr 192.168.1.121 --readhmid`, `hm2_eth` HAL load).
2. **Seat 7i49 on P1 and 7i44 on P3, P2 left empty; re-run `readhmid` and confirm the daughter cards enumerate.** Confirm 7i84U-A and 7i84U-B appear on HostMot2 smart-serial port 0 channels 0 and 1 via `halcmd show pin hm2` — verify device tags `hm2_7i80.0.7i84.0.0.*` and `hm2_7i80.0.7i84.0.1.*`. Save the pin dump and replace the placeholder HAL names from it. **Everything below depends on this step.**
3. Confirm resolver wiring on 7i49 P1 with drives disabled: ohmmeter the winding pairs, wire RESDRV/RESSIN/RESCOS, set 5 kHz excitation, scope the return level, count poles, then confirm counts, direction, and scale.
4. Confirm 7i49 P1 analog command wiring with drives disabled/inhibited (zero command, polarity on AOUT0/1/2/3).
5. Confirm 7i84U-A + 7i84U-B TB3 wiring (limits/homes/probe/drive-enables/relay-driven outputs) with all outputs disabled; P2 has no field wiring.
6. Bring up one axis at a time at low gain / low speed per [`servo_commissioning.md`](servo_commissioning.md) (FF1 first, then P; I only for residual bias, D cautiously; explicit rollback criteria).
7. Confirm home and limit logic before homing.
8. Confirm spindle analog scaling, run/enable/direction, zero-speed, at-speed, orient.
9. Bring up ATC/hydraulic outputs one at a time with dry-run interlocks, no tool load.

Detailed bring-up notes: [`../linuxcnc/README.md`](../linuxcnc/README.md).

## Safety caveats

- The `linuxcnc/` HAL/INI files and `mesa/current_pin_authority.csv` are **skeletons**. Pin names (`hm2_7i80.0...`), resolver scales, analog polarity/scaling, spindle FR-SX command mode, and I/O normal states are **placeholders** and must be replaced with the actual generated HAL names and measured/verified values from the installed 7i80HDT + 7i44 + 7i49 + 7i84U-A + 7i84U-B stack. The probe SKIP1 now lands on 7i84U-B TB3 IN15 (opto-isolated) rather than bare P2 GPIO.
- **Resolver wiring is not conventional.** The original Meldas M2 / TRA wiring may drive the resolver "backwards" (two-phase excitation into the stator, phase read from the rotor), whereas the 7i49 uses single excitation and reads sin/cos amplitude. **Ohmmeter the winding pairs before applying power** and do not trust the original wire names. The 7i49 must be the **sole resolver excitation source** — the old TRA drive closes its velocity loop on a tachometer, not the resolver, so LinuxCNC/7i49 can own excitation, but nothing else may share those windings.
- `MS3108B 20-29P` is a **connector shell part number, not a resolver model** — the resolvers themselves are Tamagawa TS2014N (BKO-NC6062A).
- The OEM hardwired E-stop chain stays 100% original and remains the sole safety function; LinuxCNC/HAL is not part of it. The `ESTOP_MONITOR` input is DEFERRED (owner decision 2026-08-15) — no interposing relay is installed, the input is unwired, and the software chain reads FALSE, which fails safe.
- Treat every `active-high`/`active-low`/`NO`/`NC` assumption as unverified until measured.
- Use interposing relays or output modules where coil/load current exceeds Mesa output ratings or where isolation is needed; add flyback diodes / RC snubbers / surge suppression appropriate to each coil. All 100VAC loads (SOL-35/61/62, ATC barrier SOL-Y095) must go through interposing relays.
- Keep resolver and analog wiring shielded and physically separated from contactor, solenoid, spindle, and motor power wiring.
- A reversed analog command can cause axis runaway — verify drive polarity on 7i49 AOUT0/1/2 before enabling drives.
