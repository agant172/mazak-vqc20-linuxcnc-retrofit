# Mazak VQC 20/40 LinuxCNC Retrofit

Conversion of a Mazak VQC 20/40 vertical machining center from the original Mazatrol
control to LinuxCNC using Mesa Electronics FPGA hardware.

**Machine:** Mazak VQC 20/40 Vertical Quality Center
**Original control:** Mazatrol
**New control:** LinuxCNC
**Interface hardware:** Mesa Electronics 7i97T Ethernet analog servo controller + 7i84U remote field I/O

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
| I/O workbook created | ✅ Completed |
| HAL/INI bring-up skeleton drafted | ✅ Completed |
| Mesa firmware / photo checklists drafted | ✅ Completed |
| Verify Mesa hardware/firmware | 🔄 In progress |
| Collect cabinet photos | 🔄 In progress |
| Trace 24 V + safety chain | 🔄 In progress |
| Live Mesa install | ⬜ Not started |
| HAL pin replacement from `readhmid` | ⬜ Not started |
| Encoder / analog measurements | ⬜ Not started |
| Axis bring-up | ⬜ Not started |
| Spindle bring-up | ⬜ Not started |
| ATC dry run | ⬜ Not started |

## Current TODO (top priorities)

**Immediate**
- Verify exact 7i97T and 7i84U part numbers, board revisions, and firmware/documentation.
- Confirm 7i97T Ethernet setup: static IP, `hm2_eth` `board_ip`, and host NIC config.
- Confirm the 7i84U smart-serial / field-I/O connection path off the 7i97T.
- Confirm 24 V field power feed and 7i97T/7i84U I/O sourcing/sinking behavior before wiring.
- Capture cabinet photo set ([checklist](docs/cabinet_photo_checklist.md)).
- Record X/Y/Z servo drive + Mitsubishi FR-SX spindle model/terminal labels.
- Trace HR-11F-24 24 V supply / P24-G24 distribution / fusing.
- Trace E-stop, door, ready chain, and servo contactor wiring.

**Next**
- LinuxCNC latency test on the control PC.
- Install the 7i97T + 7i84U; save `mesa_readhmid.txt` and the actual `mesa_hal_pins.txt` dump.
- Replace placeholder `hm2_7i97t...`/`7i84u` pin names in HAL from the real pin dump.
- Verify encoder type/scale and analog command polarity/scaling before enabling drives.
- Verify FR-SX spindle command mode; verify ATC prox/solenoid labels and normal states.
- Measure coil voltages/currents to size interposing relays/suppression.

**Later**
- Encoder feedback (drives disabled) → one axis at a time (low gain/speed) → homes/limits
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
- Mazak VQC 20 Maintenance Manual (60231)
- Mazak VQC 20 Operating Manual (62625)
