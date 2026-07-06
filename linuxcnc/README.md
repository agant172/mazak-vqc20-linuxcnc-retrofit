# Mazak VQC 20/40 LinuxCNC + Mesa Skeleton

This is a starter wiring and HAL skeleton generated from the Mazak VQC 20/40 retrofit I/O workbook.

It is meant for planning and bring-up, not direct live-machine use. Before enabling any drive, verify the actual Mesa firmware pin names, drive command polarity, resolver winding pairs/scale, resolver return signal level, field I/O voltage, output current/sourcing behavior, safety-chain wiring, and normal states in the cabinet.

> **Feedback is resolver, not encoder.** The Mazak keeps its original Tamagawa resolvers, so axis position feedback comes through a **Mesa 7i49 resolver-to-digital interface** (plain 7i49, 5 kHz excitation baseline), not quadrature encoders. Wherever these skeleton files say "encoder", read it as the 7i49 resolver channel that presents position/velocity to HAL.

## Selected architecture

The selected retrofit architecture is:

- LinuxCNC control PC connected to the Mesa 7i97T over Ethernet (`hm2_eth`, static IP).
- Mesa 7i97T Ethernet analog servo controller as the primary motion/control board: X/Y/Z analog command, encoder feedback, spindle analog/digital command where appropriate, and core digital I/O (homes, limits, drive enables/faults, and critical safety/motion I/O) per the board's capabilities.
- Mesa 7i84U remote field I/O on smart-serial, mounted near the existing green breakout PCB / terminal area for ATC, hydraulics, coolant, air, magazine, and utility field I/O.
- Mesa 7i49 resolver feedback interface (plain, not 7i49HV) for X/Y/Z (and spindle if resolver-based) position feedback from the original Tamagawa resolvers, at 5 kHz excitation.
- Optional WHB04B-style USB pendant through LinuxCNC after the base machine is safe.

> The earlier PCIe plan (tower PC + 6i25 host card + 7i77 + 7i84, optional 7i85/7i85S third board) is historical and has been superseded by the 7i97T + 7i84U Ethernet architecture.

## Assumed hardware stack

- LinuxCNC control PC with an Ethernet NIC on the 7i97T subnet.
- Mesa 7i97T Ethernet analog servo controller for analog servo/spindle control, encoder feedback, and core motion/safety I/O.
- Mesa 7i84U remote field I/O (smart-serial) for ATC, hydraulic, coolant, air, and utility I/O near the existing green breakout PCB.
- Mesa 7i49 resolver-to-digital interface for X/Y/Z resolver feedback (plain 7i49, 5 kHz). 7i49HV is a contingency only.
- Optional WHB04B-style USB pendant through LinuxCNC HAL, not through Mesa I/O.

> **Placeholder pin names:** the `hm2_7i97t.*` and `7i84u` HAL pin names in these files are
> unverified placeholders. Confirm the exact board tag (`hm2_7i97t` vs `hm2_7i97`) and the
> real analog/encoder/field-I/O pin structure from `readhmid` and `show pin hm2` before use.

## File guide

- `mazak_vqc_20_40.ini` - placeholder INI sections for the machine, joints, spindle, and HAL file loading.
- `mazak_vqc_20_40.hal` - main HAL loader (`hm2_eth`) and high-level comments.
- `motion_7i97t.hal` - 7i97T analog outputs, resolver feedback placeholders (via the 7i49), homes, limits, drive faults, drive enables, spindle enable/direction, ready/alarm outputs.
- `field_7i84u.hal` - 7i84U ATC, magazine, coolant, air, and utility I/O placeholders.
- `pendant_whb04b.hal` - optional WHB04B-style pendant net placeholders.
- `signal_map.csv` - CSV companion map matching the workbook signal names to the skeleton HAL nets.
- `architecture_decision.md` - selected 7i97T + 7i84U architecture decision.
- `mesa_firmware_checklist.md` - firmware, bitfile, Ethernet/IP, smart-serial, and HAL pin information to collect before finalizing the HAL.
- `cabinet_photo_checklist.md` - one-page photo checklist for gathering the details needed to order/configure Mesa hardware and finalize HAL pin names.

## Bring-up order

1. Confirm 7i97T detection over Ethernet: host static IP, `ping`, `mesaflash`, and `hm2_eth` HAL loading.
2. Confirm the 24 VDC P24/G24 bus, fusing, and 0 V common/reference strategy.
3. Confirm resolver wiring with drives disabled. Ohmmeter the winding pairs before power (rotor pair → RESDRV±, matched stator pairs → RESSIN/RESCOS), set the 7i49 to 5 kHz excitation, confirm the 7i49 is the sole excitation source, scope the return level, then verify counts, direction, shielding, and scale.
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
- Keep resolver and analog wiring shielded and physically separated from contactor, solenoid, spindle, and motor power wiring; terminate the resolver cable shield/ground per plan (still to be finalized).
- Resolver wiring may follow the original Meldas M2 / TRA scheme (two-phase excitation into the stator, phase read from the rotor), which is the opposite of the 7i49's single-excitation / sin-cos-amplitude reading. Identify winding pairs with an ohmmeter before power; do not assume wire names. The W2 half-drive jumper is a field-verification option, not a default.
