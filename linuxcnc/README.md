# Mazak VQC 20/40 LinuxCNC + Mesa Skeleton

This is a starter wiring and HAL skeleton generated from the Mazak VQC 20/40 retrofit I/O workbook.

It is meant for planning and bring-up, not direct live-machine use. Before enabling any drive, verify the actual Mesa firmware pin names, drive command polarity, encoder type, encoder scale, field I/O voltage, output current, safety-chain wiring, and normal states in the cabinet.

## Selected architecture

The selected retrofit architecture is:

- Tower PC mounted inside the Mazak cabinet, replacing the original Mazatrol rack area.
- PCIe Mesa host card in the tower PC, likely a 6i25 or current compatible equivalent.
- 7i77-class analog servo card for X/Y/Z analog command, spindle speed command, encoder feedback, and critical safety/motion I/O.
- 7i84 mounted near the existing green breakout PCB / terminal area for ATC, hydraulics, coolant, air, and utility field I/O.
- Optional 7i85/7i85S only if extra encoder, MPG, stepgen, or future 4th-axis capacity is needed.
- Optional WHB04B-style USB pendant through LinuxCNC after the base machine is safe.

The laptop + Ethernet Mesa architecture is considered a fallback only if the cabinet tower fails latency/reliability testing or PCIe Mesa hardware becomes impractical.

## Assumed hardware stack

- PC tower mounted inside the Mazak cabinet.
- Mesa 6i25 PCIe host card or current compatible equivalent.
- Mesa 7i77 for analog servo/spindle control, encoder feedback, and critical motion/safety I/O.
- Mesa 7i84 for ATC, hydraulic, coolant, air, and utility I/O near the existing green breakout PCB.
- Optional Mesa 7i85 or 7i85S for future encoder/stepgen expansion.
- Optional WHB04B-style USB pendant through LinuxCNC HAL, not through Mesa I/O.

## File guide

- `mazak_vqc_20_40.ini` - placeholder INI sections for the machine, joints, spindle, and HAL file loading.
- `mazak_vqc_20_40.hal` - main HAL loader and high-level comments.
- `motion_7i77.hal` - analog outputs, encoder feedback placeholders, homes, limits, drive faults, drive enables, spindle enable/direction, ready/alarm outputs.
- `field_7i84.hal` - ATC, magazine, coolant, air, and utility I/O placeholders.
- `pendant_whb04b.hal` - optional WHB04B-style pendant net placeholders.
- `signal_map.csv` - CSV companion map matching the workbook signal names to the skeleton HAL nets.
- `architecture_decision.md` - selected PCIe cabinet-tower architecture decision.
- `mesa_firmware_checklist.md` - firmware, bitfile, smart-serial, and HAL pin information to collect before finalizing the HAL.
- `cabinet_photo_checklist.md` - one-page photo checklist for gathering the details needed to order/configure Mesa hardware and finalize HAL pin names.

## Bring-up order

1. Confirm Mesa card detection with `lspci`, `mesaflash`, and LinuxCNC HAL loading.
2. Confirm the 24 VDC P24/G24 bus, fusing, and 0 V common/reference strategy.
3. Confirm encoder wiring with drives disabled. Verify counts, index behavior, direction, shielding, and scale.
4. Confirm analog command wiring with drives disabled or inhibited. Verify zero command voltage and output polarity.
5. Bring up one axis at a time at low gain and low speed.
6. Confirm home and limit switch logic before running homing.
7. Confirm spindle analog scaling, run/enable/direction, zero-speed, at-speed, gear, and orient behavior at low speed.
8. Bring up ATC/hydraulic outputs one at a time with dry-run interlocks and no tool load.

## Safety notes

- Preserve or rebuild a hardware safety chain that removes hazardous power. Do not rely on LinuxCNC/HAL alone for E-stop safety.
- Treat all `active-high`, `active-low`, `NO`, and `NC` assumptions in these files as placeholders until measured.
- Use interposing relays or output modules where coil/load current exceeds Mesa output ratings or where isolation is needed.
- Add flyback diodes, RC snubbers, or surge suppression appropriate to each coil type.
- Keep encoder and analog wiring shielded and physically separated from contactor, solenoid, spindle, and motor power wiring.
