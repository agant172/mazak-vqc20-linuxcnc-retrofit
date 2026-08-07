# Mazak VQC 20/40 LinuxCNC + Mesa Skeleton

This is a starter wiring and HAL skeleton generated from the Mazak VQC 20/40 retrofit I/O workbook.

It is meant for planning and bring-up, not direct live-machine use. Before enabling any drive, verify the actual Mesa firmware pin names, drive command polarity, resolver winding pairs/scale, resolver return signal level, field I/O voltage, output current/sourcing behavior, safety-chain wiring, and normal states in the cabinet.

> **Feedback is resolver, not encoder.** The Mazak keeps its original Tamagawa TS2014N resolvers, so axis position feedback comes through a **Mesa 7i49 resolver-to-digital interface** (plain 7i49, 5 kHz excitation baseline) mounted on the 7i80HDT P2 connector, not quadrature encoders. Wherever these skeleton files say "encoder", read it as the 7i49 resolver channel that presents position/velocity to HAL.

## Selected architecture (2026-08-06 rev)

The selected retrofit architecture is:

- LinuxCNC control PC connected to the Mesa **7i80HDT** over Ethernet (`hm2_eth`, static IP 192.168.1.121). The 7i80HDT is a bare-FPGA Ethernet host with three 50-pin daughter connectors (P1/P2/P3) and 72 IO total.
- Mesa **7i44 on P1** — 8-channel RS-422 smart-serial breakout. Port 0 carries **7i84U-A** near the existing green breakout PCB; port 1 carries **7i84U-B**; ports 2-7 are spare.
- Mesa **7i49 on P2** — plain 7i49 (not 7i49HV). Provides X/Y/Z resolver feedback on RES0/1/2 and X/Y/Z servo velocity commands + FR-SX spindle velocity command + FR-SX orient reference on ±10V analog outputs AOUT0..AOUT4. RES3-RES5 and AOUT5 are spare.
- **P3 unused/spare** — no daughter card. The sole exception is Renishaw MP-3 probe SKIP1 on bare direct FPGA GPIO `hm2_7i80.0.gpio.042`.
- Mesa **7i84U-A on 7i44 port 0** — remote field I/O for ATC, hydraulics, coolant, air, magazine, and utility field I/O.
- Mesa **7i84U-B on 7i44 port 1** — TB1 IN0-5 X/Y/Z limits, TB1 IN6-8 X/Y/Z homes, TB2 OUT0-2 X/Y/Z drive enables, and TB2 OUT3-7 relay-driven loads.
- Optional WHB04B-style USB pendant through LinuxCNC after the base machine is safe.

## Assumed hardware stack

- LinuxCNC control PC with an Ethernet NIC on the 7i80HDT subnet (`enp0s31f6` at `192.168.1.1/24`; board at `192.168.1.121`).
- Mesa 7i80HDT Ethernet FPGA host for motion command, resolver feedback, and the bare P3 probe GPIO exception.
- Mesa 7i44 on P1 for smart-serial fanout to 7i84U-A (port 0) and 7i84U-B (port 1).
- Mesa 7i49 on P2 for X/Y/Z resolver feedback and analog servo/spindle outputs.
- P3 otherwise unused/spare; `hm2_7i80.0.gpio.042` is the Renishaw MP-3 probe SKIP1 input.
- Mesa 7i84U-A on 7i44 port 0 for ATC, hydraulic, coolant, air, and utility I/O; 7i84U-B on port 1 for limits/homes, drive enables, and relay-driven loads.
- Optional WHB04B-style USB pendant through LinuxCNC HAL, not through Mesa I/O.

> **Placeholder pin names:** the `hm2_7i80.*` HAL pin names in these files are unverified
> placeholders. Confirm the exact board tag (`hm2_7i80` expected) and the real
> analog/resolver/GPIO/field-I/O pin structure from `readhmid` and `show pin hm2` before use.

## File guide

- `mazak_vqc_20_40.ini` - placeholder INI sections for the machine, joints, spindle, and HAL file loading.
- `mazak_vqc_20_40.hal` - main HAL loader (`hm2_eth`) and high-level comments.
- `motion_7i80hdt.hal` - 7i49 analog outputs and resolver feedback, plus the bare P3 `gpio.042` probe input placeholder.
- `field_7i84u.hal` - 7i84U-A ATC, magazine, coolant, air, and utility I/O placeholders on 7i44 P1 port 0, plus 7i84U-B safety and relay I/O nets on port 1.
- `atc_orient.hal` - orient + ATC HAL wiring and component nets; feeds the ATC barrier through 7i84U-B TB2 OUT6.
- `pendant_whb04b.hal` - optional WHB04B-style pendant net placeholders.
- `../mesa/current_pin_authority.csv` - authoritative pin map for the full stack.
- `../docs/architecture_decision.md` - selected 7i80HDT + 7i44 + 7i49 + 7i84U-A + 7i84U-B architecture decision, with the bare P3 probe exception.
- `../mesa/mesa_firmware_checklist.md` - firmware, bitfile, Ethernet/IP, smart-serial, and HAL pin information to collect before finalizing the HAL.
- `../docs/cabinet_photo_checklist.md` - one-page photo checklist for gathering the details needed to order/configure Mesa hardware and finalize HAL pin names.

## Bring-up order

1. Confirm 7i80HDT detection over Ethernet: host static IP, `ping 192.168.1.121`, `mesaflash --device 7i80hdt --addr 192.168.1.121 --readhmid`, and `hm2_eth` HAL loading.
2. Confirm the 24 VDC P24/G24 bus (Meanwell DR-240-24 retrofit supply), fusing, and 0 V common/reference strategy.
3. Confirm resolver wiring with drives disabled. Ohmmeter the winding pairs before power (rotor pair → RESDRV±, matched stator pairs → RESSIN/RESCOS), set the 7i49 to 5 kHz excitation, confirm the 7i49 is the sole excitation source, scope the return level, then verify counts, direction, shielding, and scale.
4. Confirm 7i49 analog command wiring with drives disabled or inhibited. Verify zero command voltage and output polarity on AOUT0/1/2 (X/Z/Y) and AOUT3 (FR-SX spindle).
5. Confirm 7i84U-B wiring: limits (NC) on TB1 IN0-5, homes (NO) on TB1 IN6-8, and X/Y/Z drive enables on TB2 OUT0-2. Ohmmeter each input path before setting `invert_input`; verify the bare P3 `gpio.042` probe input separately.
6. Confirm 7i84U-A and 7i84U-B appear on 7i44 P1 ports 0 and 1 via `halcmd show pin hm2` (device tags `hm2_7i80.0.7i84.0.0.*` and `hm2_7i80.0.7i84.0.1.*` expected — verify).
7. Bring up one axis at a time at low gain and low speed.
8. Confirm home and limit switch logic before running homing.
9. Confirm spindle analog scaling, run/enable/direction, zero-speed, at-speed, gear, and orient behavior at low speed.
10. Bring up ATC/hydraulic outputs one at a time with dry-run interlocks and no tool load.

## Safety notes

- Preserve or rebuild a hardware safety chain that removes hazardous power. Do not rely on LinuxCNC/HAL alone for E-stop safety. LinuxCNC only monitors the OEM MAR-MON contact via an interposing relay on 7i84U-A TB1 IN29.
- Treat all `active-high`, `active-low`, `NO`, and `NC` assumptions in these files as placeholders until measured.
- Use interposing relays or output modules where coil/load current exceeds Mesa output ratings or where isolation is needed. All 7i84U-B TB2 outputs to legacy 100VAC solenoids (SOL-35/61/62) must use interposing relays (RLY-5/6/7).
- Add flyback diodes, RC snubbers, or surge suppression appropriate to each coil type.
- Keep resolver and analog wiring shielded and physically separated from contactor, solenoid, spindle, and motor power wiring; terminate the resolver cable shield/ground per plan (still to be finalized).
- Resolver wiring may follow the original Meldas M2 / TRA scheme (two-phase excitation into the stator, phase read from the rotor), which is the opposite of the 7i49's single-excitation / sin-cos-amplitude reading. Identify winding pairs with an ohmmeter before power; do not assume wire names. The W2 half-drive jumper is a field-verification option, not a default.
- The OEM 24V bus (Shindengen HR-11F-24) and retrofit 24V bus (Meanwell DR-240-24) remain isolated. Every OEM-to-retrofit digital crossing (including the OEM E-stop chain monitor) uses an interposing relay dry contact.
