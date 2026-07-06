# Mazak VQC 20/40 LinuxCNC Retrofit

Conversion of a Mazak VQC 20/40 vertical machining center from the original Mazatrol
control to LinuxCNC using Mesa Electronics FPGA hardware.

**Machine:** Mazak VQC 20/40 Vertical Quality Center
**Original control:** Mazatrol
**New control:** LinuxCNC
**Interface hardware:** Mesa Electronics 7i97T Ethernet analog servo controller + 7i84U remote field I/O + Mesa 7i49 resolver feedback interface

> ⚠️ **Safety:** The HAL/INI files in [`linuxcnc/`](linuxcnc/) and the mappings in
> [`mesa/signal_map.csv`](mesa/signal_map.csv) are **planning / bring-up skeletons
> only** — not live-machine-ready. Pin names, encoder scales, analog polarity, and I/O
> normal states are placeholders. Verify the hardware safety chain, drive polarity,
> encoder direction/scale, field-I/O normal states, and coil/current ratings before
> energizing outputs or enabling motion. Do not rely on LinuxCNC/HAL alone for E-stop
> safety. See [docs/project_status.md](docs/project_status.md#safety-caveats).

## Selected architecture

- **LinuxCNC control PC** driving a **Mesa 7i97T** as the primary motion/control board,
  connected over **Ethernet** (`hm2_eth`, static IP).
- **7i97T** — analog servo command outputs (X/Y/Z), encoder inputs, spindle analog/digital
  command where appropriate, and core digital I/O per the board's capabilities
  (homes/limits, drive enables/faults, and critical safety/motion I/O).
- **7i84U** — remote field-I/O expansion (smart-serial) near the green breakout PCB for
  ATC, hydraulics, coolant, air, utility I/O, and cabinet field wiring.
- **7i49 (plain, not 7i49HV)** — resolver-to-digital feedback interface for the X/Y/Z
  (and spindle, if resolver-based) axis position feedback. The Mazak keeps its original
  Tamagawa resolvers rather than encoders. Plain 7i49 is the working baseline; **7i49HV is
  a contingency only** if measurements prove a signal-level or transformation-ratio
  mismatch. See [resolver feedback](docs/architecture_decision.md#resolver-feedback-interface-mesa-7i49).
- **Optional WHB04B-style USB pendant** after the base machine is proven safe.
- Future/optional (TBD): additional smart-serial or expansion I/O only if a later need
  (extra encoders, MPG/handwheel, or a 4th axis) is confirmed — not part of the selected plan.

> **Previous / rejected plan (historical):** an earlier draft proposed a PCIe tower-card
> stack (6i25 host card + 7i77 analog servo card + 7i84, with an optional 7i85/7i85S third
> board). That PCIe path has been **superseded** by the 7i97T + 7i84U Ethernet architecture
> above and is retained only for reference.

Full rationale: [docs/architecture_decision.md](docs/architecture_decision.md).

## Progress at a glance

| Area | Status |
|---|---|
| Repo created & structured | ✅ Completed |
| 7i97T + 7i84U Ethernet architecture selected | ✅ Completed |
| 7i49 resolver feedback interface selected (plain, 5 kHz) | ✅ Completed |
| I/O workbook created | ✅ Completed |
| HAL/INI bring-up skeleton drafted | ✅ Completed |
| Mesa firmware / photo checklists drafted | ✅ Completed |
| Verify Mesa hardware/firmware | 🔄 In progress |
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
- Verify exact 7i97T and 7i84U part numbers, board revisions, and firmware/documentation.
- Buy a **plain Mesa 7i49** (not 7i49HV) as the resolver feedback interface; keep 7i49HV
  on the contingency list only if measurements show a signal-level/ratio mismatch.
- Confirm 7i97T Ethernet setup: static IP, `hm2_eth` `board_ip`, and host NIC config.
- Confirm the 7i84U smart-serial / field-I/O connection path off the 7i97T.
- Confirm the 7i49-to-host connection path (which 50-pin connector carries the resolver
  interface into the FPGA) and the matching firmware `num_resolvers`/`sserial` config.
- Confirm 24 V field power feed and 7i97T/7i84U I/O sourcing/sinking behavior before wiring.
- Capture cabinet photo set ([checklist](docs/cabinet_photo_checklist.md)).
- Record X/Y/Z servo drive + Mitsubishi FR-SX spindle model/terminal labels.
- Trace HR-11F-24 24 V supply / P24-G24 distribution / fusing.
- Trace E-stop, door, ready chain, and servo contactor wiring.

**Next**
- LinuxCNC latency test on the control PC.
- Install the 7i97T + 7i84U; save `mesa_readhmid.txt` and the actual `mesa_hal_pins.txt` dump.
- Replace placeholder `hm2_7i97t...`/`7i84u` pin names in HAL from the real pin dump.
- Set the 7i49 resolver excitation to **5 kHz** (Mitsubishi/Tamagawa spec is 4.5 kHz; the
  7i49 offers 2.5 / 5 / 10 kHz, so 5 kHz is the closest working baseline).
- Identify each axis resolver winding pair with an **ohmmeter before applying power**
  (rotor pair → RESDRV±, matched stator pairs → RESSIN and RESCOS); verify, don't assume.
- Scope the return signal level after 7i49 excitation; expect ~1 V RMS sin/cos from ~2 V
  RMS drive on a 2:1 resolver. Only consider the W2 half-drive jumper / a divider if the
  return is too hot; 7i49HV only if it is far too weak.
- Verify resolver scale/orientation and analog command polarity/scaling before enabling drives.
- Verify FR-SX spindle command mode; verify ATC prox/solenoid labels and normal states.
- Measure coil voltages/currents to size interposing relays/suppression.

**Later**
- Resolver feedback via 7i49 (drives disabled) → one axis at a time (low gain/speed) → homes/limits
  and hardware E-stop → spindle at low RPM → ATC/hydraulic dry run → decide on any optional
  future expansion I/O and pendant.

Full, checkbox-tracked TODO and progress: **[docs/project_status.md](docs/project_status.md)**.

## Repository structure

```
├── README.md          # This file — project overview, status, and top TODOs
├── bom/               # I/O workbook and parts-planning material
├── docs/              # Architecture decision, checklists, photo-sorting, project status
├── linuxcnc/          # LinuxCNC INI/HAL bring-up skeletons (+ bring-up notes)
├── mesa/              # Mesa signal map (signal → card/bit/HAL net) and firmware checklist
├── wiring/            # Wiring / field-I/O planning references
├── photos/            # Placeholder only — no raw photos/videos committed
├── notes/             # Working notes and research
└── archive/           # Old files and reference material
```

### Key files
- [docs/project_status.md](docs/project_status.md) — status tracker and full TODO list.
- [docs/architecture_decision.md](docs/architecture_decision.md) — 7i97T + 7i84U architecture decision.
- [mesa/mesa_firmware_checklist.md](mesa/mesa_firmware_checklist.md) — info to collect before finalizing HAL.
- [docs/cabinet_photo_checklist.md](docs/cabinet_photo_checklist.md) — what to photograph.
- [docs/README_photo_sorting.md](docs/README_photo_sorting.md) — photo folder scheme.
- [linuxcnc/README.md](linuxcnc/README.md) — skeleton file guide and bring-up order.
- [mesa/signal_map.csv](mesa/signal_map.csv) — signal → Mesa card/bit → HAL net map.
- [bom/Mazak_VQC_20-40_Retrofit_IO_Workbook.xlsx](bom/Mazak_VQC_20-40_Retrofit_IO_Workbook.xlsx) — full I/O workbook.

## References

- [LinuxCNC Documentation](https://linuxcnc.org/docs/)
- [Mesa Electronics](http://www.mesanet.com/)
- [Mesa 7i49 manual (resolver interface)](http://www.mesanet.com/pdf/motion/7i49man.pdf)
- [Servo PID tuning thread — VQC 15/40, TRA-31, HD81-12S, 7i49 @ 5 kHz](https://forum.linuxcnc.org/10-advanced-configuration/32061-servo-pid-tuning-can-t-clamp-down-on-overshoot)
  — sister-machine retrofit confirming a **plain 7i49** at 5 kHz against the 4.5 kHz spec.
- [srdco/MazakVQC1540 configs](https://github.com/srdco/MazakVQC1540) — LinuxCNC configs for the sister VQC 15/40.
- [User's thread — Mesa conversion for a Mazak VQC 20/40 M2 mill](https://forum.linuxcnc.org/27-driver-boards/58767-mesa-conversion-for-a-mazak-vqc-20-40-m2-mill)
- [Mitsubishi TRA-31 drive manual](https://us.mitsubishielectric.com/fa/en/support/technical-support/knowledge-base/getdocument/?docid=3E26SJWH3ZZR-24-3709)
- [Meldas YM2 / Mazatrol M2 maintenance manual](https://us.mitsubishielectric.com/fa/en/support/technical-support/knowledge-base/getdocument/?docid=3E26SJWH3ZZR-24-2231)
- Mazak VQC 20 Maintenance Manual (60231)
- Mazak VQC 20 Operating Manual (62625)
