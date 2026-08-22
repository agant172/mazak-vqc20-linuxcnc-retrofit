# Mazak VQC 20/40 LinuxCNC + Mesa Skeleton

This starter wiring and HAL skeleton is reconciled against
[`../mesa/current_pin_authority.csv`](../mesa/current_pin_authority.csv). The Excel
workbooks are generated views of that authority, not independent assignment sources.

It is meant for planning and bring-up, not direct live-machine use. Before enabling any drive, verify the actual Mesa firmware pin names, drive command polarity, resolver winding pairs/scale, resolver return signal level, field I/O voltage, output current/sourcing behavior, safety-chain wiring, and normal states in the cabinet.

> **Feedback is resolver, not encoder.** The Mazak keeps its original Tamagawa TS2014N resolvers, so axis position feedback comes through a **Mesa 7i49 resolver-to-digital interface** (plain 7i49, 5 kHz excitation baseline) mounted on the 7i80HDT P1 connector, not quadrature encoders. Wherever these skeleton files say "encoder", read it as the 7i49 resolver channel that presents position/velocity to HAL.

## Confirmed architecture (2026-08-13 rev)

> P1/P2/P3 roles flipped vs. the 2026-08-06 rev once the actual
> `7i80hdt_rmsvss6_8.bin` firmware was flashed and read back with
> `mesaflash --readhmid` (2026-08-11, re-confirmed 2026-08-13). See
> [`../mesa/mesa_firmware_checklist.md`](../mesa/mesa_firmware_checklist.md#bitfile-provenance-verification-procedure).

The confirmed retrofit architecture is:

- LinuxCNC control PC connected to the Mesa **7i80HDT** over Ethernet (`hm2_eth`, static IP 192.168.1.121). The 7i80HDT is a bare-FPGA Ethernet host with three 50-pin daughter connectors (P1/P2/P3) and 72 IO total.
- Mesa **7i49 on P1** — plain 7i49 (not 7i49HV). Provides X/Y/Z resolver feedback on RES0/1/2 and X/Y/Z servo velocity commands + FR-SX spindle velocity command on ±10V analog outputs AOUT0..AOUT3. RES3-RES5 and AOUT4-AOUT5 are spare. FR-SX orient is triggered by the DISCRETE ORCM1 command (7i84U-A OUT4 / Y093), not by any analog reference — see [`docs/frsx_orient_model.md`](../docs/frsx_orient_model.md).
- **P2 unused/spare** — no daughter card fitted; all bare-FPGA GPIO. Not safe for 24 V field wiring. Probe stays on 7i84U-B TB3 IN15.
- Mesa **7i44 on P3** — 8-channel RS-422 smart-serial breakout. Physical channels 0/1 carry **7i84U-A/B** within HostMot2 port 0; channels 2-7 are spare.
- Mesa **7i84U-A on 7i44 channel 0** — remote field I/O for ATC, hydraulics, coolant, air, magazine, and utility field I/O.
- Mesa **7i84U-B on 7i44 sserial channel 1** — TB3 IN0-5 X/Y/Z limits, IN6-8 homes, IN9 air permissive, IN15 Renishaw MP-3 probe, OUT0-2 X/Y/Z drive enables, and OUT3-7 relay loads; TB2 OUT8 is the proposed cover-close command. (Mesa 7i84 layout: TB1 = power, TB3 = IN0-15 + OUT0-7, TB2 = IN16-31 + OUT8-15.)
- Optional WHB04B-style USB pendant through LinuxCNC after the base machine is safe.

## Assumed hardware stack

- LinuxCNC control PC with an Ethernet NIC on the 7i80HDT subnet (`enp0s31f6` at `192.168.1.1/24`; board at `192.168.1.121`).
- Mesa 7i80HDT Ethernet FPGA host for motion command and, via its daughter cards, resolver feedback and field I/O.
- Mesa 7i49 on P1 for X/Y/Z resolver feedback and analog servo/spindle outputs.
- P2 is unused/spare. The Renishaw MP-3 probe input is on **7i84U-B input-15** (opto-isolated 24 V), not on bare P2 GPIO — see [`../docs/superseded_claims_2026-08-06.md`](../docs/superseded_claims_2026-08-06.md) #15.
- Mesa 7i44 on P3 for smart-serial fanout to 7i84U-A/B (physical channels 0/1 of HostMot2 port 0).
- Mesa 7i84U-A on 7i44 channel 0 for ATC, hydraulic, coolant, air, and utility I/O; 7i84U-B on channel 1 for limits/homes, drive enables, and relay-driven loads.
- Optional WHB04B-style USB pendant through LinuxCNC HAL, not through Mesa I/O.

> **Placeholder pin names:** the `hm2_7i80.*` HAL pin names in these files are unverified
> placeholders. Confirm the exact board tag (`hm2_7i80` expected) and the real
> analog/resolver/GPIO/field-I/O pin structure from `readhmid` and `show pin hm2` before use.

## File guide

- `mazak_vqc_20_40.ini` - placeholder INI sections for the machine, joints, spindle, and HAL file loading.
- `mazak_vqc_20_40.hal` - main HAL loader (`hm2_eth`) and high-level comments.
- `motion_7i80hdt.hal` - 7i49 analog outputs and resolver feedback. P2 is unused/spare (bare-FPGA GPIO; probe moved to 7i84U-B TB3 IN15).
- `field_7i84u.hal` - 7i84U-A ATC, magazine, coolant, air, and utility I/O placeholders on 7i44 channel 0, plus 7i84U-B limit/home monitoring and relay I/O nets on channel 1.
- `atc_orient.hal` - orient + ATC HAL wiring and component nets; feeds the ATC barrier through 7i84U-B TB3 OUT6.
- `pendant_whb04b.hal` - optional WHB04B-style pendant net placeholders.
- `../mesa/current_pin_authority.csv` - authoritative pin map for the full stack. `../docs/authority_hierarchy.md` defines the hierarchy. Run both `python3 scripts/validate_authority.py` and `python3 scripts/validate_control_logic.py` before every commit that touches HAL/INI, the CSV, capacity table, or B-card legend; exit 0 required.
- `../docs/architecture_decision.md` - selected 7i80HDT + 7i44 + 7i49 + 7i84U-A + 7i84U-B architecture decision, with the bare-GPIO probe exception (bare connector is P2, confirmed 2026-08-13).
- `../mesa/mesa_firmware_checklist.md` - firmware, bitfile, Ethernet/IP, smart-serial, and HAL pin information to collect before finalizing the HAL.
- `../docs/cabinet_photo_checklist.md` - one-page photo checklist for gathering the details needed to order/configure Mesa hardware and finalize HAL pin names.

## Bring-up order

> **Pre-power gate.** Every step below is gated by the sixteen
> pre-power deliverables and hold points defined in
> [`../docs/pre_power_deliverables.md`](../docs/pre_power_deliverables.md).
> Do not apply live power to any element of the retrofit stack until
> that document's hold points for the corresponding milestone are
> signed off.


1. Confirm 7i80HDT detection over Ethernet: host static IP, `ping 192.168.1.121`, `mesaflash --device 7i80hdt --addr 192.168.1.121 --readhmid`, and `hm2_eth` HAL loading. The dedicated-NIC pinning, coalescing/offload settings, multi-hour latency-under-load test, and packet-error-into-motion-permit HAL wiring are documented in [`../docs/hm2_eth_nic_validation.md`](../docs/hm2_eth_nic_validation.md); commissioning must not enable drives until that acceptance passes.
3. Confirm resolver wiring with drives disabled. **The installed suffix has no published datasheet** — `TS2014N25E8-1` (X) / `TS2014N25E3-1` (Y) were built to Mitsubishi spec BKO-NC6062(A) and never appeared in a Tamagawa catalogue (search 2026-08-16). The E26 figures (10 Vrms / 4.5 kHz / K = 0.5, rotor DC 121 Ω, stator DC 69 Ω) are a **different suffix** and are not a check on this one; PCW has flagged some TS2014 variants as 7i49-incompatible. Ohmmeter the winding pairs before power — measured 2026-08-16 as one 35 Ω winding and a matched 105–109 Ω pair, which identifies the windings but **not** which to excite — then run the bench tests in [`../docs/resolver_commissioning.md`](../docs/resolver_commissioning.md#power-off-bench-identification-replaces-the-datasheet-gate) to settle drive direction, transformation ratio, and whether the unit is 1× or 5×. Then set the 7i49 to 5 kHz excitation (closest to the 4.5 kHz spec; the Tamagawa page publishes no frequency tolerance, so verify on scope rather than by tolerance calc), confirm the 7i49 is the sole excitation source, scope RESDRV excitation and RESSIN/RESCOS amplitude and phase at rest and under motion, then verify counts, direction, shielding, and scale.
4. Confirm 7i49 analog command wiring with drives disabled or inhibited. Verify zero command voltage and output polarity on AOUT0/1/2 (X/Z/Y) and AOUT3 (FR-SX spindle).
5. Confirm 7i84U-B wiring: limits (NC) on TB3 IN0-5, homes (NO) on TB3 IN6-8, air-pressure permissive on TB3 IN9, probe on TB3 IN15, X/Y/Z drive enables on TB3 OUT0-2, and the proposed single-coil cover command on TB2 OUT8. Ohmmeter each input path before deciding whether to consume `input-NN` (raw) or `input-NN-not` (complement) in HAL. Per [sserial(9)](https://linuxcnc.org/docs/html/man/man9/sserial.9.html), sserial cards expose both spellings for every input and there is no `invert_input` parameter; the probe uses the opto-isolated 7i84U input rather than bare P2 GPIO.
6. Confirm 7i84U-A and 7i84U-B appear on HostMot2 smart-serial port 0 channels 0 and 1 via `halcmd show pin hm2` (device tags `hm2_7i80.0.7i84.0.0.*` and `hm2_7i80.0.7i84.0.1.*` expected — verify).
7. Keep `drive-output-permit` FALSE until the applicable pre-power hold points
   are signed, then change its single `sets` initialization to TRUE in a
   reviewed commissioning edit. Bring up one axis at a time at low gain and
   low speed; physically isolate the other two axes as required by the servo
   commissioning procedure. Return the hold to FALSE whenever commissioning
   is not actively in progress.
8. Confirm home and limit switch logic before running homing.
9. Keep `spindle-output-permit` FALSE until the spindle-rotation hold point is
   signed, then change its single `sets` initialization to TRUE in a reviewed
   commissioning edit. That static hold feeds the combined gate for FWD, REV,
   RUN, ORCM1, and analog-output enable; watchdog, E-stop, machine-on,
   servo-ready, and spindle-fault states still have to permit motion. Confirm
   analog scaling, run/enable/direction, zero-speed, at-speed, gear, and orient
   behavior at low speed. Return the hold to FALSE when the test is complete.
10. Compile both custom components, load the configuration with field power isolated, and exercise operator Abort, E-stop, each M66 timeout, and motion fault at every ATC step. Confirm P8 latches abort, P0-P7 clear, and every component output goes safe before bringing up ATC/hydraulic outputs one at a time with no tool load.

## Safety notes

- The OEM hardwired E-stop chain stays 100% original and remains the sole safety function (owner decision 2026-08-15). Do not rely on LinuxCNC/HAL alone for E-stop safety. LinuxCNC only monitors the OEM MAR-MON contact via an interposing relay on 7i84U-A TB2 IN29.
- Treat all `active-high`, `active-low`, `NO`, and `NC` assumptions in these files as placeholders until measured.
- Use interposing relays or output modules where coil/load current exceeds Mesa output ratings or where isolation is needed. All 7i84U-B TB3 outputs to legacy 100 VAC solenoids (SOL-35/61/62 on OUT3/4/5) must use interposing relays (RLY-5/6/7).
- Add flyback diodes, RC snubbers, or surge suppression appropriate to each coil type.
- Keep resolver and analog wiring shielded and physically separated from contactor, solenoid, spindle, and motor power wiring; terminate resolver cable shields at the 7i49 end only, per [`../docs/grounding_shielding_plan.md`](../docs/grounding_shielding_plan.md). That document is the authoritative cable schedule, segregation table, and noise-survey acceptance plan.
- Resolver wiring may follow the original Meldas M2 / TRA scheme (two-phase excitation into the stator, phase read from the rotor), which is the opposite of the 7i49's single-excitation / sin-cos-amplitude reading. Identify winding pairs with an ohmmeter before power; do not assume wire names. **The W2 jumper does not help the X/Y/Z axis channels** — per the 7i49 manual, W2 down halves reference drive on channels 3/4/5 only, and X/Y/Z live on channels 0/1/2. If the axis-channel return is far off the ~1 V RMS target, escalate to Mesa (PCW) for review of the specific TS2014N suffix rather than adding dividers or 7i49HV hardware.
- Every OEM-to-retrofit digital crossing (including the OEM E-stop chain monitor) uses an interposing relay dry contact.

## `phase1-draft-2026-08-07/`

A **superseded** Phase 1 commissioning draft (minimal motion + safety), recovered
2026-08-21 from the retired `~/Projects/Mazak-Local` tree. **Historical only — do
not load.** Its `hm2_7i80.0.*` pin names are placeholders by its own admission, and
it predates the live config here by ten days. It sits in a subdirectory so
`scripts/validate_authority.py`, which globs `linuxcnc/*.hal`, does not check it —
correct for placeholder pins, and the reason it must not be promoted as-is.
See [`phase1-draft-2026-08-07/README.md`](phase1-draft-2026-08-07/README.md).
