# Mazak VQC 20/40 LinuxCNC Retrofit

Conversion of a Mazak VQC 20/40 vertical machining center from the original Mazatrol
control to LinuxCNC using Mesa Electronics FPGA hardware.

**Machine:** Mazak VQC 20/40 Vertical Quality Center (SN 060231, Mazatrol M-2, ladder YM2V39L)
**Original control:** Mazatrol M-2
**New control:** LinuxCNC 2.9.10 on Debian 13 (PREEMPT-RT)
**Interface hardware:** Mesa 7i80HDT (Ethernet FPGA host) + 7i44 on P1 (RS-422 sserial to 7i84U) + 7i49 on P2 (resolver + analog outs) + 7i37TA on P3 (motion-critical field breakout) + 7i84U on 7i44 port 0 (remote field I/O)

> ⚠️ **Safety:** The HAL/INI files in [`linuxcnc/`](linuxcnc/) and the pin authority in
> [`mesa/current_pin_authority.csv`](mesa/current_pin_authority.csv) are **planning /
> bring-up skeletons only** — not live-machine-ready. Pin names, resolver scales, analog
> polarity, and I/O normal states are placeholders. Verify the hardware safety chain,
> drive polarity, resolver direction/scale, field-I/O normal states, and coil/current
> ratings before energizing outputs or enabling motion. Do not rely on LinuxCNC/HAL alone
> for E-stop safety. See [docs/project_status.md](docs/project_status.md#safety-caveats).

## Selected architecture (2026-08-06 rev)

- **LinuxCNC control PC** (Debian 13 / LinuxCNC 2.9.10) driving a **Mesa 7i80HDT** Ethernet FPGA host as the primary control board (`hm2_eth`, static IP 192.168.1.121).
- **P1 → 7i44** — RS-422 smart-serial breakout. Port 0 carries the 7i84U; ports 1-7 are spare for future MPG / 4th-axis / second 7i84.
- **P2 → 7i49** (plain 7i49) — X/Y/Z resolver feedback on RES0/1/2 + X/Z/Y servo velocity command + FR-SX spindle velocity + FR-SX orient reference on AOUT0..AOUT4.
- **P3 → 7i37TA field breakout** — 24 direct FPGA GPIO for motion-critical, host-side, low-latency I/O: X/Y/Z limits, X/Y/Z homes, E-stop chain monitor, Renishaw MP-3 probe SKIP1, X/Y/Z drive-enable outputs, and 6 former TB5 SSR overflow outputs (5 used + 1 spare).
- **7i84U on 7i44 port 0** — remote field-I/O expansion for ATC, hydraulics, coolant, air, magazine, utility I/O near the existing green breakout PCB. Pin plan committed 2026-08-03 (single-7i84U I/O plan) unchanged.
- **Optional WHB04B-style USB pendant** after the base machine is proven safe.

> **Previous / rejected plans (historical):**
> 1. **PCIe tower-card stack** (6i25 + 7i77 + 7i84 + optional 7i85/7i85S). Superseded 2025.
> 2. **7i97T + 7i84U + 7i49 Ethernet stack** (used from 2025 through 2026-08-05). The 7i97T is being returned to Mesa; the current 7i80HDT + 7i44 + 7i49 + 7i84U + P3 breakout stack replaces it (2026-08-06).

Full rationale: [docs/architecture_decision.md](docs/architecture_decision.md).

## Progress at a glance

| Area | Status |
|---|---|
| Repo created & structured | ✅ Completed |
| **7i80HDT + 7i44 + 7i49 + 7i84U + P3 breakout architecture (2026-08-06)** | ✅ Completed |
| 7i49 resolver feedback interface (plain, 5 kHz) | ✅ Completed |
| Tamagawa TS2014N resolver identification | ✅ Completed |
| I/O workbook created | ✅ Completed |
| HAL/INI bring-up skeleton drafted (7i80HDT stack) | ✅ Completed |
| Pin authority CSV rewritten around 7i80HDT stack | ✅ Completed |
| Mesa firmware / photo checklists drafted | ✅ Completed |
| Order 7i80HDT + 7i44 + 7i37TA | 🔄 In progress |
| Collect cabinet photos | 🔄 In progress |
| Trace 24 V + safety chain | 🔄 In progress |
| Live Mesa install | ⬜ Not started |
| HAL pin replacement from `readhmid` | ⬜ Not started |
| Resolver / analog measurements (return signal level, pairs) | ⬜ Not started |
| Axis bring-up | ⬜ Not started |
| Spindle bring-up | ⬜ Not started |
| ATC dry run | ⬜ Not started |

## Current TODO (top priorities)

**Immediate**
- Order the 7i80HDT, 7i44, and 7i37TA (7i49 and 7i84U already in hand / buy list).
- Return the 7i97T to Mesa.
- Confirm PCW-generated firmware bitfile `7i80hdt_7i44_ss_7i49d.bit` and stash it under `mesa/` once received.
- Confirm 7i80HDT Ethernet setup: static IP 192.168.1.121, `hm2_eth` `board_ip="192.168.1.121"`, and host NIC `enp0s31f6` at 192.168.1.1/24.
- Confirm 24 V field power feed (OEM HR-11F-24 + retrofit DR-240-24, kept isolated) and 7i80HDT / 7i84U / 7i37TA I/O sourcing/sinking behavior before wiring.
- Capture cabinet photo set ([checklist](docs/cabinet_photo_checklist.md)).
- Record X/Y/Z servo drive + Mitsubishi FR-SX spindle model/terminal labels.
- Trace E-stop, door, ready chain, and servo contactor wiring.

**Next**
- LinuxCNC latency test on the control PC (already validated on Debian 13 / RT kernel).
- Install the 7i80HDT + 7i44 + 7i49 + 7i84U + P3 breakout; save `mesa_readhmid.txt` and the actual `mesa_hal_pins.txt` dump.
- Replace placeholder `hm2_7i80.0...` pin names in HAL from the real pin dump.
- Set the 7i49 resolver excitation to **5 kHz** (Tamagawa TS2014N spec is 4.5 kHz; the 7i49 offers 2.5 / 5 / 10 kHz, so 5 kHz is the closest working baseline).
- Identify each axis resolver winding pair with an **ohmmeter before applying power** (rotor pair R1/R2 → RESDRV±, matched stator pairs S1-S3, S2-S4 → RESSIN and RESCOS); verify, don't assume.
- Scope the return signal level after 7i49 excitation; expect ~1 V RMS sin/cos from ~2 V RMS drive on a 2:1 resolver. Only consider the W2 half-drive jumper / a divider if the return is too hot; 7i49HV only if it is far too weak.
- Verify resolver scale/orientation and analog command polarity/scaling before enabling drives.
- Verify FR-SX spindle command mode; verify ATC prox/solenoid labels and normal states.
- Measure coil voltages/currents to size interposing relays (RLY-5/6/7 mandatory for the 100VAC SSR overflow loads driven from P3 breakout OUT3/4/5).

**Later**
- Resolver feedback via 7i49 (drives disabled) → one axis at a time (low gain/speed) → homes/limits and hardware E-stop → spindle at low RPM → ATC/hydraulic dry run → decide on any optional future expansion I/O and pendant.

Full, checkbox-tracked TODO and progress: **[docs/project_status.md](docs/project_status.md)**.

## I/O dashboard

[`io-dashboard/`](io-dashboard/) is a single-page, offline I/O navigator generated from
`mesa/current_pin_authority.csv`, the HAL config and the wiring notes. It walks
LinuxCNC pin → HAL net → Mesa pin → connector/channel → field device → machine location
for all 116 signal rows, and flags the open conflicts. Full guide:
[io-dashboard/README.md](io-dashboard/README.md).

```bash
cd io-dashboard && python3 -m http.server 8765   # static, offline; open http://127.0.0.1:8765/
cd io-dashboard && python3 serve_live.py         # adds read-only /api/io on the LinuxCNC host
```

`serve_live.py` only ever runs `halcmd -s show sig`; it never writes a HAL value and refuses
any non-GET request. Regenerate `data.js` after editing the repo with
`cd io-dashboard && python3 tools/generate_data.py`.

> ⚠️ The dashboard is a **configuration snapshot and navigation aid, not a safety
> controller.** Nothing in it is a permission to energize, and no row has been field
> verified. The hardware E-stop chain must remove hazardous power independently of LinuxCNC.

## Repository structure

```
├── README.md          # This file — project overview, status, and top TODOs
├── bom/               # I/O workbook and parts-planning material
├── docs/              # Architecture decision, checklists, photo-sorting, project status
├── io-dashboard/      # Offline single-page I/O navigator (generated from mesa/ + linuxcnc/)
├── linuxcnc/          # LinuxCNC INI/HAL bring-up skeletons, ATC/orient components, remapped M6
├── mesa/              # Mesa pin authority (`current_pin_authority.csv`), firmware checklist, superseded signal map
├── wiring/            # Wiring / field-I/O planning references
├── photos/            # Placeholder only — no raw photos/videos committed
├── notes/             # Working notes and research
└── archive/           # Old files and reference material
```

### Key files
- [docs/project_status.md](docs/project_status.md) — status tracker and full TODO list.
- [docs/architecture_decision.md](docs/architecture_decision.md) — 7i80HDT + 7i44 + 7i49 + 7i84U + P3 breakout architecture decision.
- [mesa/current_pin_authority.csv](mesa/current_pin_authority.csv) — authoritative pin authority for the new stack.
- [mesa/mesa_firmware_checklist.md](mesa/mesa_firmware_checklist.md) — info to collect before finalizing HAL.
- [mesa/signal_map.csv](mesa/signal_map.csv) — **superseded** historical signal map; see the [supersession notice](mesa/signal_map.csv.SUPERSEDED_NOTICE.md).
- [docs/cabinet_photo_checklist.md](docs/cabinet_photo_checklist.md) — what to photograph.
- [docs/README_photo_sorting.md](docs/README_photo_sorting.md) — photo folder scheme.
- [linuxcnc/README.md](linuxcnc/README.md) — skeleton file guide and bring-up order.
- [docs/ladder/atc_component_README.md](docs/ladder/atc_component_README.md) — ATC/orient component skeleton: rung-to-code map, placeholders, integration steps.
- [docs/photo_survey_misc.md](docs/photo_survey_misc.md) — survey of 213 shop photos (2026-07-29): hardware nameplate inventory, OEM wire-label/terminal maps, and the OEM CN6/CN5/CN11 pin tables incl. 712/713 GEAR SHIFT HIGH/LOW and ORCM1 orient command.
- [docs/parameters_sn060231.md](docs/parameters_sn060231.md) — LIVE parameter values photographed 2026-07-28: ATC 2nd zero point RP=(0, +9.5000, -5.9055) in, both soft-limit boxes, gear crossover 434 rpm, backlash.
- [docs/parameter_recovery.md](docs/parameter_recovery.md) — M-2 parameter recovery: SN 060231 values are NOT in the manuals; capture checklist + fallback measurement procedure.
- [io-dashboard/README.md](io-dashboard/README.md) — offline I/O navigator: how to run it and how to regenerate its data.
- [bom/Mazak_VQC_20-40_Retrofit_IO_Workbook.xlsx](bom/Mazak_VQC_20-40_Retrofit_IO_Workbook.xlsx) — full I/O workbook.

## References

- [LinuxCNC Documentation](https://linuxcnc.org/docs/)
- [Mesa Electronics](http://www.mesanet.com/)
- [Mesa 7i80HDT / 7i80HD Ethernet FPGA host](http://www.mesanet.com/fpgacardinfo.html)
- [Mesa 7i49 manual (resolver interface)](http://www.mesanet.com/pdf/motion/7i49man.pdf)
- [Mesa 50-pin daughter card catalog (7i37TA, 7i44, 7i49)](https://www.mesanet.com/aiodaughter.html)
- [Servo PID tuning thread — VQC 15/40, TRA-31, HD81-12S, 7i49 @ 5 kHz](https://forum.linuxcnc.org/10-advanced-configuration/32061-servo-pid-tuning-can-t-clamp-down-on-overshoot) — sister-machine retrofit confirming a **plain 7i49** at 5 kHz against the 4.5 kHz spec.
- [srdco/MazakVQC1540 configs](https://github.com/srdco/MazakVQC1540) — LinuxCNC configs for the sister VQC 15/40.
- [SRDCO MazakVQC1540 complete 2017 reference package](https://github.com/srdco/MazakVQC1540/tree/master/MAZAK-VQC1540-20170501) — full 2017-05-01 config/wiring snapshot for planning and retrofit comparison.
- [User's thread — Mesa conversion for a Mazak VQC 20/40 M2 mill](https://forum.linuxcnc.org/27-driver-boards/58767-mesa-conversion-for-a-mazak-vqc-20-40-m2-mill)
- [Mitsubishi TRA-31 drive manual](https://us.mitsubishielectric.com/fa/en/support/technical-support/knowledge-base/getdocument/?docid=3E26SJWH3ZZR-24-3709)
- [Meldas YM2 / Mazatrol M2 maintenance manual](https://us.mitsubishielectric.com/fa/en/support/technical-support/knowledge-base/getdocument/?docid=3E26SJWH3ZZR-24-2231)
- Mazak VQC 20 Maintenance Manual (60231)
- Mazak VQC 20 Operating Manual (62625)
