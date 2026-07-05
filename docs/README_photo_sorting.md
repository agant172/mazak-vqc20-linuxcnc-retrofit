# Mazak Retrofit Photo Sorting Guide

Use this folder structure to keep cabinet photos, Mesa firmware notes, and LinuxCNC outputs organized while planning the VQC 20/40 retrofit.

## Fast workflow

1. If you are in a hurry, dump everything into `00_Inbox_To_Sort`.
2. Move photos into the numbered folders when you have time.
3. Keep the original photo/video files, even if you rename copies later.
4. For close-ups, try to keep a matching wide/context shot in the same folder.
5. Put Mesa command outputs such as `mesa_readhmid.txt` and `mesa_hal_pins.txt` in `17_LinuxCNC_Config_Outputs`.

## Folder map

| Folder | Put these here |
|---|---|
| `00_Inbox_To_Sort` | Unsorted photos, videos, screenshots, notes, and temporary files. |
| `01_Cabinet_Wide_Shots` | Wide shots of the left, center, and right cabinet bays. |
| `02_PC_Mazatrol_Rack_Area` | Photos and measurements of the old Mazatrol rack area where the tower PC may mount. |
| `03_Servo_Drives_XYZ` | X/Y/Z servo amplifier model plates, terminal strips, command, enable, and fault wiring. |
| `04_Encoders_Motors_Pickups` | Encoder connectors, motor nameplates, pickup units, and feedback wiring. |
| `05_Spindle_FRSX` | Mitsubishi FR-SX spindle controller label, terminals, analog speed input, run/direction/enable/alarm wiring. |
| `06_24V_P24_G24_Power` | HR-11F-24 supply, P24/G24 terminal strips, fuses, jumpers, 24 VDC distribution. |
| `07_Green_Breakout_PCB` | Green YM VQC-20-40/50 breakout PCB, circular plugs, D-sub connectors, board labels. |
| `08_IO_Terminal_Strips` | Field I/O terminal strips, wire numbers, labels such as INHRLS, DEC2, CH4, limits, ATC signals. |
| `09_EStop_Safety_Ready_Chain` | E-stop relays, door interlocks, servo contactor, ready chain, safety hardware. |
| `10_ATC_Tool_Clamp_Gear_Magazine` | Tool clamp/unclamp, gear shift, magazine rotation, PRS sensors, SOL valves, ATC hydraulics. |
| `11_Coolant_Air_Utilities` | Coolant pump contactors, mist/tap coolant, air blast valves, work light, utility relays. |
| `12_Grounding_Shields_Common` | PE ground bars, 0 V common points, shield drain/clamp locations, analog/encoder shield landings. |
| `13_DIN_Rail_Panel_Space` | Open DIN rail, wire duct, panel space, door clearance, possible Mesa card mounting spots. |
| `14_Operator_Panel` | Cycle start, feed hold, single block, overrides, lamps, pendant-related panel notes. |
| `15_Mesa_Cards_Firmware` | Mesa card labels, firmware/bitfile notes, 6i25 connector order, 7i77/7i84 photos. |
| `16_Manuals_Schematics` | Mazak manuals, schematics, terminal charts, inside-door legends, printed references. |
| `17_LinuxCNC_Config_Outputs` | LinuxCNC configs, HAL/INI files, `mesa_readhmid.txt`, `mesa_hal_pins.txt`, latency-test screenshots. |

## Naming suggestions

Use names that describe the object and date:

- `cabinet_wide_left_2026-06-01.jpg`
- `x_servo_drive_terminals_2026-06-01.jpg`
- `frsx_spindle_drive_terminal_strip_2026-06-01.jpg`
- `p24_g24_terminal_strip_2026-06-01.jpg`
- `green_breakout_pcb_connectors_2026-06-01.jpg`
- `estop_safety_chain_relays_2026-06-01.jpg`

## First batch to collect

For the next Mesa/HAL update, the highest-value first batch is:

1. Whole cabinet wide shots.
2. X/Y/Z servo amplifier model and terminal-strip photos.
3. FR-SX spindle controller model and terminal-strip photos.
4. HR-11F-24 and P24/G24 terminal photos.
5. Green breakout PCB and connector-label photos.
6. E-stop, safety relay, ready chain, and servo contactor photos.

