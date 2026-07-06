# Project Status & TODO — Mazak VQC 20/40 LinuxCNC/Mesa Retrofit

_Last updated: 2026-07-06_

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
- **7i49 resolver feedback interface (plain, not 7i49HV)** for X/Y/Z (and spindle if
  resolver-based) position feedback. The machine keeps its original Tamagawa resolvers.
  Working baseline: plain 7i49, **5 kHz excitation** (spec 4.5 kHz; 7i49 offers 2.5/5/10 kHz).
  7i49HV is a **contingency only** if measurements show a signal-level/ratio mismatch. See
  [`architecture_decision.md`](architecture_decision.md#resolver-feedback-interface-mesa-7i49).
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
- 7i49 resolver feedback interface selected (plain 7i49, 5 kHz baseline), informed by the
  VQC 15/40 sister retrofit on the same TRA drives / HD81-12S motors.
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
- Resolver / analog measurements (per-axis label, winding pairs, return signal level).
- Axis bring-up.
- Spindle bring-up.
- ATC dry run.

## TODO list

### Immediate
- [ ] Verify exact 7i97T and 7i84U part numbers, board revisions, and documentation.
- [ ] Buy a **plain Mesa 7i49** (not 7i49HV) as the resolver feedback interface.
- [ ] Confirm the 7i49-to-host connection path and firmware `num_resolvers` config.
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
- [ ] Set 7i49 resolver excitation to **5 kHz** (spec 4.5 kHz; options 2.5/5/10 kHz).
- [ ] Identify each axis resolver winding pair with an **ohmmeter before power**: rotor pair
      (likely RO1/RO2) → RESDRV±, matched stator pairs → RESSIN and RESCOS. Verify, don't assume.
- [ ] Scope the resolver return signal level after 7i49 excitation; expect ~1 V RMS sin/cos
      from ~2 V RMS drive on a 2:1 resolver. Low signal → noise/sluggish; too hot → divider or
      **W2 half-drive (field-verification option, not default)**; far too weak → consider 7i49HV.
- [ ] Confirm the 7i49 is the **sole resolver excitation source** — nothing from the old
      drive/control still driving the windings before energizing.
- [ ] Verify resolver-to-machine-unit scale and axis orientation for X/Y/Z.
- [ ] Verify analog command polarity/scaling for X/Y/Z before enabling drives.
- [ ] Verify FR-SX spindle command mode (analog speed and run/direction/enable behavior).
- [ ] Verify ATC prox/solenoid labels and normal states: PRS-8/9, PRS-10/12, PRS-13, PRS-21 through PRS-25, SOL-8A/8B, SOL-10, M15/M16 if present.
- [ ] Measure solenoid/contactor coil voltages and currents to decide interposing relay/suppression needs.

### Later
- [ ] Bring up resolver feedback via the 7i49 with drives disabled.
- [ ] Bring up one axis at a time at low gain / low speed.
- [ ] Prove homes/limits and hardware E-stop behavior.
- [ ] Bring up spindle at low RPM with verified analog scaling.
- [ ] Dry-run ATC/hydraulic sequence with no tool load.
- [ ] Decide whether any optional future expansion I/O and the USB pendant are needed.

## Bring-up order (summary)

1. Confirm 7i97T detection over Ethernet (host static IP, `ping`, `mesaflash`, `hm2_eth` HAL load).
2. Confirm 24 VDC P24/G24 bus, fusing, and 0 V common/reference strategy.
3. Confirm resolver wiring with drives disabled: ohmmeter the winding pairs, wire RESDRV/
   RESSIN/RESCOS on the 7i49, set 5 kHz excitation, scope the return level, then confirm
   counts, direction, and scale.
4. Confirm analog command wiring with drives disabled/inhibited (zero command, polarity).
5. Bring up one axis at a time at low gain / low speed.
6. Confirm home and limit logic before homing.
7. Confirm spindle analog scaling, run/enable/direction, zero-speed, at-speed, orient.
8. Bring up ATC/hydraulic outputs one at a time with dry-run interlocks, no tool load.

Detailed bring-up notes: [`../linuxcnc/README.md`](../linuxcnc/README.md).

## Safety caveats

- The `linuxcnc/` HAL/INI files and `mesa/signal_map.csv` are **skeletons**. Pin names
  (`hm2_7i97t...` / 7i84u / 7i49 resolver channels), resolver scales, analog polarity/
  scaling, spindle FR-SX command mode, and I/O normal states are **placeholders** and must
  be replaced with the actual generated HAL names and measured/verified values from the
  installed 7i97T + 7i84U + 7i49.
- **Resolver wiring is not conventional.** The original Meldas M2 / TRA wiring may drive the
  resolver "backwards" (two-phase excitation into the stator, phase read from the rotor),
  whereas the 7i49 uses single excitation and reads sin/cos amplitude. **Ohmmeter the
  winding pairs before applying power** and do not trust the original wire names. The 7i49
  must be the **sole resolver excitation source** — the old TRA drive closes its velocity
  loop on a tachometer, not the resolver, so LinuxCNC/7i49 can own excitation, but nothing
  else may share those windings.
- `MS3108B 20-29P` is a **connector shell part number, not a resolver model** — do not
  record it as the resolver type.
- Preserve or rebuild a **hardware safety chain** that removes hazardous power. Do not
  rely on LinuxCNC/HAL alone for E-stop safety.
- Treat every `active-high`/`active-low`/`NO`/`NC` assumption as unverified until measured.
- Use interposing relays or output modules where coil/load current exceeds Mesa output
  ratings or where isolation is needed; add flyback diodes / RC snubbers / surge
  suppression appropriate to each coil.
- Keep encoder and analog wiring shielded and physically separated from contactor,
  solenoid, spindle, and motor power wiring.
- A reversed analog command can cause axis runaway — verify drive polarity before enabling.
