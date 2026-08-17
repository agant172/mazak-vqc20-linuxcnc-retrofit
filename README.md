# Mazak VQC 20/40 LinuxCNC Retrofit

Conversion of a Mazak VQC 20/40 vertical machining center from the original Mazatrol
control to LinuxCNC using Mesa Electronics FPGA hardware.

**Machine:** Mazak VQC 20/40 Vertical Quality Center (SN 060231, Mazatrol M-2, ladder YM2V39L)
**Original control:** Mazatrol M-2
**New control:** LinuxCNC 2.9.10 on Debian 13 (PREEMPT-RT)
**Interface hardware:** Mesa 7i80HDT (Ethernet FPGA host) + 7i44 on P3 (RS-422 sserial to 7i84U-A/B on physical channels 0/1 of HostMot2 port 0) + 7i49 on P1 (resolver + analog outs); P2 is unused/spare. The Renishaw MP-3 probe input is on **7i84U-B input-15** (opto-isolated 24 V), not on bare P2 GPIO.

> 🔩 **Installing or wiring?** The project physically touches the machine at one place —
> the **BBIA-1 terminal unit** — plus the ladder→HAL translation. [`INSTALL_SPINE.md`](INSTALL_SPINE.md)
> names the load-bearing files in order of use across that boundary (machine side →
> interface plane → computer side). Everything it does not name is background.

> 📖 **Start here:** [`CLAUDE.md`](CLAUDE.md) is the canonical project brief — the full
> operating manual (control hardware, sources of truth, working rules, electrical
> architecture, safety/commissioning sequence, session conventions, and the split between
> work done at the machine and work done away from it). It loads automatically at the start
> of every Claude session and is the first thing any contributor (human or AI) should read.

> ⚠️ **Safety:** The HAL/INI files in [`linuxcnc/`](linuxcnc/) and the pin authority in
> [`mesa/current_pin_authority.csv`](mesa/current_pin_authority.csv) are **planning /
> bring-up skeletons only** — not live-machine-ready. Pin names, resolver scales, analog
> polarity, and I/O normal states are placeholders. Verify drive polarity, resolver
> direction/scale, field-I/O normal states, and coil/current ratings before energizing
> outputs or enabling motion. The OEM hardwired E-stop chain stays 100% original and
> remains the sole safety function; LinuxCNC/HAL is not part of it. See [docs/project_status.md](docs/project_status.md#safety-caveats).

## Confirmed architecture (2026-08-13 rev)

> P1/P2/P3 connector roles flipped vs. the earlier 2026-08-06 rev once the actual
> `7i80hdt_rmsvss6_8.bin` firmware was flashed and read back with `mesaflash --readhmid`
> on 2026-08-11 and re-confirmed 2026-08-13 (see
> [`mesa/mesa_firmware_checklist.md`](mesa/mesa_firmware_checklist.md#bitfile-provenance-verification-procedure)).
> Trust this section, not older docs/notes still describing P1=7i44/P2=7i49/P3=unused.

- **LinuxCNC control PC** (Debian 13 / LinuxCNC 2.9.10) driving a **Mesa 7i80HDT** Ethernet FPGA host as the primary control board (`hm2_eth`, static IP 192.168.1.121).
- **P1 → 7i49** (plain 7i49) — X/Y/Z resolver feedback on RES0/1/2 plus X/Z/Y servo velocity and FR-SX spindle velocity commands on AOUT0..AOUT3. AOUT4/AOUT5 are spare; FR-SX orient uses discrete ORCM1.
- **P2 → unused/spare** — no daughter card fitted. All bare FPGA GPIO. Not safe for 24 V field wiring (probe stays on 7i84U-B for opto-isolation).
- **P3 → 7i44** — RS-422 smart-serial breakout. Physical channel 0 carries **7i84U-A** near the existing green breakout PCB; channel 1 carries **7i84U-B** for limit/home monitoring and relay-driven loads; channels 2-7 are spare. Both remotes are under HostMot2 smart-serial port 0.
- **7i84U-A on 7i44 channel 0** — remote field I/O for ATC, hydraulics, coolant, air, magazine, utility I/O, and cabinet field wiring.
- **7i84U-B on 7i44 sserial channel 1** — TB3 IN0-5 carry X/Y/Z limits, IN6-8 homes, IN9 the air permissive, and IN15 the Renishaw MP-3 probe; TB3 OUT0-2 carry X/Y/Z drive enables and OUT3-7 the planned relay loads; TB2 OUT8 is the proposed magazine-cover close command. (7i84 layout: TB1 = power only, TB3 = IN0-15 + OUT0-7, TB2 = IN16-31 + OUT8-15.)
- **Optional WHB04B-style USB pendant** after the base machine is proven safe.

Full rationale: [docs/architecture_decision.md](docs/architecture_decision.md).

## Progress at a glance

| Area | Status |
|---|---|
| Repo created & structured | ✅ Completed |
| **7i80HDT + 7i44 + 7i49 + 7i84U-A + 7i84U-B architecture** | Selected; hardware/bitfile proof pending |
| 7i49 resolver feedback interface (plain, 5 kHz baseline) | Selected; suffix compatibility and scope proof pending |
| Tamagawa TS2014N resolver identification | Windings identified by DC resistance 2026-08-16; part numbers resolved to `TS2014N25E8-1` (X) / `TS2014N25E3-1` (Y); **the 25E datasheet does not exist publicly** — identification is by bench test, see [docs/resolver_commissioning.md](docs/resolver_commissioning.md#power-off-bench-identification-replaces-the-datasheet-gate) |
| 132-row I/O authority workbooks regenerated from the current CSV | ✅ Completed |
| HAL/INI bring-up skeleton drafted | ✅ Completed |
| Pin authority CSV structurally reconciled; field evidence pending | 🔄 In progress |
| Mesa firmware / photo checklists drafted | ✅ Completed |
| Order 7i80HDT + 7i44 + 7i84U-B | ✅ Completed — whole stack + 50-pin IDC cables on hand 2026-08-17 |
| Collect cabinet photos | 🔄 In progress |
| Live Mesa install | ⬜ Not started |
| HAL pin replacement from `readhmid` | ⬜ Not started |
| Resolver / analog measurements (return signal level, pairs) | ⬜ Not started |
| Axis bring-up | ⬜ Not started |
| Spindle bring-up | ⬜ Not started |
| ATC dry run | ⬜ Not started |

## Current TODO (top priorities)

**Immediate**
- ~~Order the 7i80HDT, 7i44, and 7i84U-B~~ — **all interface hardware is on hand
  as of 2026-08-17** (owner, at the machine): 7i80HDT, 7i49, 7i44, 7i84U-A,
  7i84U-B, and the 50-pin IDC cables that were the last blocker. Nothing is
  installed or wired yet; the physical install moves from *blocked* to *next*.
- Bitfile `7i80hdt_rmsvss6_8.bin` is flashed and its **layout, identity, and upstream source all confirmed**: `readhmid` (2026-08-11, re-checked 2026-08-13; SHA-256 recorded) plus the binary sourced directly from Peter Wallace at Mesa Electronics (`freeby.mesanet.com/7i80hdt_rmsvss6_8.zip`, 2026-08-11) — see [`mesa/mesa_firmware_checklist.md`](mesa/mesa_firmware_checklist.md#bitfile-provenance-verification-procedure).
- Confirm 7i80HDT Ethernet setup: static IP 192.168.1.121, `hm2_eth` `board_ip="192.168.1.121"`, and host NIC `enp0s31f6` at 192.168.1.1/24.
- Capture cabinet photo set ([checklist](docs/cabinet_photo_checklist.md)).
- Record X/Y/Z servo drive + Mitsubishi FR-SX spindle model/terminal labels.

**Next**
- Run the full LinuxCNC latency and hm2_eth test on the exact control PC, NIC,
  kernel, BIOS, and workload that will operate the machine.
- Install the 7i80HDT + 7i44 (P3) + 7i49 (P1) + 7i84U-A + 7i84U-B; leave P2 unused/spare (probe is on 7i84U-B input-15, not bare P2 GPIO). `readhmid` is saved ([`mesa/firmware/readhmid_2026-08-13.txt`](mesa/firmware/readhmid_2026-08-13.txt)); still need the actual `hal_pins_YYYY-MM-DD.txt` (`show pin hm2`) dump once wired.
- Replace placeholder `hm2_7i80.0...` pin names in HAL from the real pin dump.
- Set the 7i49 resolver excitation to **5 kHz** (4.5 kHz is 141E26 comparison data — the installed suffix reads `TS2014N 25 E …` on X/Y (2026-08-15 survey, [docs/feedback_nameplate_survey_2026-08-15.md](docs/feedback_nameplate_survey_2026-08-15.md)); the 25E nominal is unconfirmed until its datasheet is obtained. The 7i49 offers 2.5 / 5 / 10 kHz, so 5 kHz is the closest option to the family's 4.5 kHz figure). No frequency tolerance is published even for 141E26, so 5 kHz operation must be **verified at commissioning** by scoping RESDRV excitation and RESSIN/RESCOS amplitude and phase at rest and under motion. Read the Z resolver nameplate (still unread), pin down the partial X/Y `25 E …` digits, and match the actual suffix to its own datasheet — PCW's warning that some TS2014 variants (e.g. E1/BRT) are not 7i49-compatible applies to the 25E suffix until then.
- Identify each axis resolver winding pair with an **ohmmeter before applying power** (rotor pair R1/R2 → RESDRV±, matched stator pairs S1-S3, S2-S4 → RESSIN and RESCOS); verify, don't assume.
- Scope the return signal level after 7i49 excitation; ~1 V RMS sin/cos from ~2 V RMS drive assumes the 2:1 ratio (K = 0.5) — 141E26 comparison data, not a confirmed 25E spec (2026-08-15 survey, [docs/feedback_nameplate_survey_2026-08-15.md](docs/feedback_nameplate_survey_2026-08-15.md)); treat it as the expected ballpark until the scope reading and 25E datasheet confirm it. **W2 is not a valid remedy for X/Y/Z:** per the 7i49 manual, W2 down halves reference drive on channels **3/4/5 only**, and X/Y/Z live on channels **0/1/2**. If the return is far off-target, escalate to Mesa (PCW) for review of the specific TS2014N suffix before adding external dividers or a 7i49HV.
- Verify resolver scale/orientation and analog command polarity/scaling before enabling drives.
- Complete and sign the per-axis [`resolver_commissioning.md`](docs/resolver_commissioning.md)
  record and [`first_move_plan.md`](docs/first_move_plan.md) before powered motion.
- Verify FR-SX spindle command mode; verify ATC prox/solenoid labels and normal states.
- Measure coil voltages/currents to size interposing relays (RLY-5/6/7 required by the current plan for the 100 VAC air/touch/tap loads on 7i84U-B OUT3/4/5).

**Later**
- Resolver feedback via 7i49 (drives disabled) → one axis at a time (low gain/speed) → homes/limits → spindle at low RPM → ATC/hydraulic dry run → decide on any optional future expansion I/O and pendant.

Full, checkbox-tracked TODO and progress: **[docs/project_status.md](docs/project_status.md)**.

## I/O and commissioning workspace

[`io-dashboard/`](io-dashboard/) is one offline app with two views generated from the same
`mesa/current_pin_authority.csv`, HAL config, and wiring notes. The I/O navigator walks
LinuxCNC pin → HAL net → Mesa pin → connector/channel → field device → machine location.
The commissioning view renders those rows as signal/power/return/shield paths, links to repo
evidence, and keeps browser-local checkout records that can be exported as JSON or CSV. It flags
unknown physical details instead of guessing and never changes wiring authority. Full guide:
[io-dashboard/README.md](io-dashboard/README.md).

```bash
cd io-dashboard && python3 -m http.server 8765   # static, offline; open http://127.0.0.1:8765/
cd io-dashboard && python3 serve_live.py         # adds read-only /api/io on the LinuxCNC host
```

`serve_live.py` only ever runs `halcmd -s show sig`; it never writes a HAL value and refuses
any non-GET request. Regenerate `data.js` after editing the repo with
`cd io-dashboard && python3 tools/generate_data.py`.

For configuration changes, run `python3 scripts/validate_authority.py` and
`python3 scripts/validate_control_logic.py` from the repo root. Both must pass;
they are static checks and do not replace a LinuxCNC load test or fault injection.

> ⚠️ The dashboard is a **configuration snapshot and navigation aid, not a safety
> controller.** Nothing in it is a permission to energize, and no row has been field
> verified. The hardware E-stop chain must remove hazardous power independently of LinuxCNC.

## Repository structure

```
├── README.md          # This file — project overview, status, and top TODOs
├── INSTALL_SPINE.md   # The load-bearing install path, in order of use
├── background/        # Historical/educational shelf — nothing needed at the cabinet
├── bom/               # Generated I/O authority workbook and parts-planning material
├── docs/              # Architecture decision, checklists, photo-sorting, project status
├── io-dashboard/      # Offline I/O navigator + commissioning wiring workspace
├── linuxcnc/          # LinuxCNC INI/HAL bring-up skeletons, ATC/orient components, remapped M6
├── mesa/              # Mesa pin authority (`current_pin_authority.csv`), firmware checklist
├── wiring/            # Wiring / field-I/O planning references
├── photos/            # Placeholder only — no raw photos/videos committed
└── notes/             # Working notes and research
```

### Key files
- [docs/project_status.md](docs/project_status.md) — status tracker and full TODO list.
- [docs/architecture_decision.md](docs/architecture_decision.md) — architecture decision.
- [mesa/current_pin_authority.csv](mesa/current_pin_authority.csv) — authoritative pin map.
- [mesa/mesa_firmware_checklist.md](mesa/mesa_firmware_checklist.md) — info to collect before finalizing HAL.
- [docs/cabinet_photo_checklist.md](docs/cabinet_photo_checklist.md) — what to photograph.
- [docs/README_photo_sorting.md](docs/README_photo_sorting.md) — **the single photo scheme**: 7 folders, naming rules, and the migration map from the two superseded lists.
- [linuxcnc/README.md](linuxcnc/README.md) — skeleton file guide and bring-up order.
- [docs/ladder/atc_component_README.md](docs/ladder/atc_component_README.md) — ATC/orient component skeleton: rung-to-code map, placeholders, integration steps.
- [docs/photo_survey_misc.md](docs/photo_survey_misc.md) — survey of 213 shop photos (2026-07-29): hardware nameplate inventory, OEM wire-label/terminal maps, and the OEM CN6/CN5/CN11 pin tables incl. 712/713 GEAR SHIFT HIGH/LOW and ORCM1 orient command.
- [wiring/head_device_placard.md](wiring/head_device_placard.md) — OEM head device placard transcribed; **it is a generic family plate and lists four solenoids this machine does not have**.
- [wiring/head_valve_hardware.md](wiring/head_valve_hardware.md) — head valve inventory and the coil wire labels that identify every head solenoid.
- [wiring/cabinet_asfound_survey.md](wiring/cabinet_asfound_survey.md) — cabinet terminal strips, motor starters and control gear as found (photo inventory).
- [docs/spindle_motor_plg_encoder.md](docs/spindle_motor_plg_encoder.md) — spindle motor built-in PLG identified from nameplate photos (2026-08-12): Tamagawa TS1526N55 optical shaft encoder, 512 counts/turn, ±15 V; corrects the "magnetic pickup" claim, and explains why it is the FR-SX's detector rather than a Mesa input.
- [docs/parameters_sn060231.md](docs/parameters_sn060231.md) — LIVE parameter values photographed 2026-07-28: ATC 2nd zero point RP=(0, +9.5000, -5.9055) in, both soft-limit boxes, gear crossover 434 rpm, backlash.
- [docs/frsx_maintenance_manual_notes.md](docs/frsx_maintenance_manual_notes.md) — **the FR-SX maintenance manual is now committed** (`docs/OEM Manuals/…BCN-21735-S5.pdf`). What it settles: this drive orients from a **1024P×4/rev encoder**, proven by the `SX-CPU2` card being fitted; `PIN11` decides whether the NC powers that encoder; `ST2` runs orient standalone.
- [background/frsx_orient_detector_capture.md](background/frsx_orient_detector_capture.md) — how to determine which detector the FR-SX orients from: trace the PLG cable first, photograph the drive's configuration hardware, and treat the MDS-CH parameter numbers as possibly inapplicable.
- [background/parameter_recovery.md](background/parameter_recovery.md) — M-2 parameter recovery: SN 060231 values are NOT in the manuals; capture checklist + fallback measurement procedure.
- [io-dashboard/README.md](io-dashboard/README.md) — I/O/commissioning workspace: use, records, live polling, and data regeneration.
- [bom/Mazak_VQC_20-40_Retrofit_IO_Workbook.xlsx](bom/Mazak_VQC_20-40_Retrofit_IO_Workbook.xlsx) — generated 132-row Excel snapshot of the current pin authority; `mesa/current_pin_authority.csv` remains authoritative.

## References

- [LinuxCNC Documentation](https://linuxcnc.org/docs/)
- [Mesa Electronics](http://www.mesanet.com/)
- [Mesa 7i80HDT / 7i80HD Ethernet FPGA host](http://www.mesanet.com/fpgacardinfo.html)
- [Mesa 7i49 manual (resolver interface)](http://www.mesanet.com/pdf/motion/7i49man.pdf)
- [Mesa 50-pin daughter card catalog (7i44, 7i49)](https://www.mesanet.com/aiodaughter.html)
- [Servo PID tuning thread — VQC 15/40, TRA-31, HD81-12S, 7i49 @ 5 kHz](https://forum.linuxcnc.org/10-advanced-configuration/32061-servo-pid-tuning-can-t-clamp-down-on-overshoot) — sister-machine retrofit running a **plain 7i49** at 5 kHz against the 4.5 kHz spec. Supporting anecdote only; not a substitute for scoping this machine.
- [Tamagawa FA-SOLVER page](https://tamagawa.eu/products/resolvers/brushless-resolvers-fa-solver/) — TS2014N141E26 electrical specs (10 Vrms, 4.5 kHz, K = 0.5, rotor DC 121 Ω, stator DC 69 Ω; no frequency tolerance published). **Comparison data for a different suffix**: installed X/Y pickups read `TS2014N 25 E …` (2026-08-15 survey, [docs/feedback_nameplate_survey_2026-08-15.md](docs/feedback_nameplate_survey_2026-08-15.md)); absolutes unconfirmed until the 25E datasheet is obtained.
- [PCW on TS2014 variant compatibility with the 7i49](https://forum.linuxcnc.org/27-driver-boards/39171-7i49-with-tamagawa-ts2014-e1-type-resolvers) — explicit warning that some TS2014 variants are not 7i49-compatible; the suffix matters.
- [srdco/MazakVQC1540 configs](https://github.com/srdco/MazakVQC1540) — LinuxCNC configs for the sister VQC 15/40.
- [SRDCO MazakVQC1540 complete 2017 reference package](https://github.com/srdco/MazakVQC1540/tree/master/MAZAK-VQC1540-20170501) — full 2017-05-01 config/wiring snapshot for planning and retrofit comparison.
- [User's thread — Mesa conversion for a Mazak VQC 20/40 M2 mill](https://forum.linuxcnc.org/27-driver-boards/58767-mesa-conversion-for-a-mazak-vqc-20-40-m2-mill)
- [Mitsubishi TRA-31 drive manual](https://us.mitsubishielectric.com/fa/en/support/technical-support/knowledge-base/getdocument/?docid=3E26SJWH3ZZR-24-3709)
- [Meldas YM2 / Mazatrol M2 maintenance manual](https://us.mitsubishielectric.com/fa/en/support/technical-support/knowledge-base/getdocument/?docid=3E26SJWH3ZZR-24-2231)
- Mazak VQC 20 Maintenance Manual (60231)
- Mazak VQC 20 Operating Manual (62625)
