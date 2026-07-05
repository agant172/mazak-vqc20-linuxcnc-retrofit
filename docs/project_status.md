# Project Status & TODO — Mazak VQC 20/40 LinuxCNC/Mesa Retrofit

_Last updated: 2026-07-05_

Conversion of a Mazak VQC 20/40 vertical machining center from the original Mazatrol
control to LinuxCNC using Mesa Electronics FPGA hardware.

> **Safety:** All HAL/INI files in `linuxcnc/` and the mappings in `mesa/signal_map.csv`
> are **planning and bring-up skeletons only**. They are **not** live-machine-ready.
> Verify the safety chain, drive polarity, encoder direction/scale, field-I/O normal
> states, and coil/current ratings before energizing any output or enabling motion.
> See [Safety caveats](#safety-caveats) below.

## Selected architecture

- **LinuxCNC control PC** driving a **Mesa 7i97T** Ethernet analog servo controller as the
  primary motion/control board (`hm2_eth`, static IP). This is the chosen path.
- **7i97T**: X/Y/Z analog servo command, encoder feedback, spindle analog/digital command
  where appropriate, homes/limits, drive enables/faults, and critical safety/motion I/O
  per the board's capabilities.
- **7i84U** remote field I/O (smart-serial) near the green breakout PCB / terminal area:
  ATC, hydraulics, coolant, air, magazine, utility I/O, and cabinet field wiring.
- **Optional WHB04B-style USB pendant** after base machine safety/motion is proven.
- **Future/optional (TBD):** additional smart-serial or expansion I/O only if a later need
  (extra encoders, MPG/handwheel, or a 4th axis) is confirmed — not part of the selected plan.
- **Previous / rejected plan (historical):** PCIe tower-card stack (6i25 + 7i77 + 7i84,
  optional 7i85/7i85S third board). Superseded by the 7i97T + 7i84U Ethernet architecture.

See [`architecture_decision.md`](architecture_decision.md) for the full rationale.

## Progress markers

### Completed
- Repository created and structured.
- 7i97T + 7i84U Ethernet architecture selected.
- Initial I/O workbook created (`bom/Mazak_VQC_20-40_Retrofit_IO_Workbook.xlsx`).
- HAL/INI bring-up skeleton drafted (`linuxcnc/`).
- Mesa firmware/HAL-pin checklist drafted (`mesa/mesa_firmware_checklist.md`).
- Cabinet photo checklist drafted (`docs/cabinet_photo_checklist.md`).
- Photo folder/sorting structure defined (`docs/README_photo_sorting.md`).

### In progress
- Verifying Mesa hardware/firmware selection.
- Collecting cabinet photos.
- Tracing 24 V distribution and the safety chain.

### Not started
- Live Mesa install.
- HAL pin replacement from actual `readhmid` output.
- Encoder / analog measurements.
- Axis bring-up.
- Spindle bring-up.
- ATC dry run.

## TODO list

### Immediate
- [ ] Verify exact 7i97T and 7i84U part numbers, board revisions, and documentation.
- [ ] Confirm 7i97T firmware/bitfile and the 7i84U smart-serial field-I/O connection path.
- [ ] Confirm 7i97T Ethernet setup: static IP, `hm2_eth` `board_ip`, and host NIC config.
- [ ] Confirm 24 V field power feed and 7i97T/7i84U I/O sourcing/sinking behavior before wiring.
- [ ] Capture cabinet photo set using the cabinet photo checklist.
- [ ] Capture/record X/Y/Z servo drive model labels and command/enable/fault terminal labels.
- [ ] Capture/record Mitsubishi FR-SX spindle drive model and analog/run/direction/alarm terminals.
- [ ] Trace HR-11F-24 24 V supply, P24/G24 distribution, remote sense, TOG/CNT, and branch fusing.
- [ ] Trace E-stop, door, ready chain, and servo contactor wiring before any control rewiring.

### Next
- [ ] Run LinuxCNC latency test on the selected control PC.
- [ ] Install the 7i97T + 7i84U and save `mesaflash ... --readhmid` output as `mesa_readhmid.txt`.
- [ ] Dump actual HAL pins after firmware load and save as `mesa_hal_pins.txt`.
- [ ] Replace placeholder `hm2_7i97t...` / `7i84u` pin names in the HAL files using the real HAL pin dump.
- [ ] Verify encoder type, supply voltage, pinout, index presence, and counts per unit for X/Y/Z.
- [ ] Verify analog command polarity/scaling for X/Y/Z before enabling drives.
- [ ] Verify FR-SX spindle command mode (analog speed and run/direction/enable behavior).
- [ ] Verify ATC prox/solenoid labels and normal states: PRS-8/9, PRS-10/12, PRS-13, PRS-21 through PRS-25, SOL-8A/8B, SOL-10, M15/M16 if present.
- [ ] Measure solenoid/contactor coil voltages and currents to decide interposing relay/suppression needs.

### Later
- [ ] Bring up encoder feedback with drives disabled.
- [ ] Bring up one axis at a time at low gain / low speed.
- [ ] Prove homes/limits and hardware E-stop behavior.
- [ ] Bring up spindle at low RPM with verified analog scaling.
- [ ] Dry-run ATC/hydraulic sequence with no tool load.
- [ ] Decide whether any optional future expansion I/O and the USB pendant are needed.

## Bring-up order (summary)

1. Confirm 7i97T detection over Ethernet (host static IP, `ping`, `mesaflash`, `hm2_eth` HAL load).
2. Confirm 24 VDC P24/G24 bus, fusing, and 0 V common/reference strategy.
3. Confirm encoder wiring with drives disabled (counts, index, direction, scale).
4. Confirm analog command wiring with drives disabled/inhibited (zero command, polarity).
5. Bring up one axis at a time at low gain / low speed.
6. Confirm home and limit logic before homing.
7. Confirm spindle analog scaling, run/enable/direction, zero-speed, at-speed, orient.
8. Bring up ATC/hydraulic outputs one at a time with dry-run interlocks, no tool load.

Detailed bring-up notes: [`../linuxcnc/README.md`](../linuxcnc/README.md).

## Safety caveats

- The `linuxcnc/` HAL/INI files and `mesa/signal_map.csv` are **skeletons**. Pin names
  (`hm2_7i97t...` / 7i84u), encoder scales, analog polarity/scaling, spindle FR-SX command
  mode, and I/O normal states are **placeholders** and must be replaced with the actual
  generated HAL names and measured/verified values from the installed 7i97T + 7i84U.
- Preserve or rebuild a **hardware safety chain** that removes hazardous power. Do not
  rely on LinuxCNC/HAL alone for E-stop safety.
- Treat every `active-high`/`active-low`/`NO`/`NC` assumption as unverified until measured.
- Use interposing relays or output modules where coil/load current exceeds Mesa output
  ratings or where isolation is needed; add flyback diodes / RC snubbers / surge
  suppression appropriate to each coil.
- Keep encoder and analog wiring shielded and physically separated from contactor,
  solenoid, spindle, and motor power wiring.
- A reversed analog command can cause axis runaway — verify drive polarity before enabling.
