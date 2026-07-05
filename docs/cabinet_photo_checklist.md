# Mazak VQC 20/40 Cabinet Photo Checklist

Use this checklist before ordering/flashing Mesa hardware. The goal is to capture enough detail to confirm the 7i97T + 7i84U setup, drive interfaces, encoder wiring, 24 VDC I/O, and cabinet layout.

## Photo rules

- Take one **wide shot first**, then close-ups.
- Include the **wire numbers and terminal labels** in close-ups.
- Take photos square-on, in focus, with enough light to read silkscreen and sleeves.
- For each close-up, take one pulled-back photo showing where that device sits in the cabinet.
- Do not unplug anything just to take a photo unless it is already labeled and safe.

## Required photos

| Priority | Photo | What to capture | Why it matters |
|---|---|---|---|
| High | Whole electrical cabinet | Left, center, right bays with doors open | Confirms available space, PC location, wire duct, and card mounting areas. |
| High | Former Mazatrol rack / PC area | Empty/occupied rack space, mounting rails, power, airflow path | Confirms control PC fit and service clearance. |
| High | Axis servo amplifiers | X/Y/Z drive labels, model numbers, terminal strips, command terminals, enable/fault terminals | Confirms analog ±10 V compatibility and drive enable/fault wiring. |
| High | Axis motor/encoder connectors | Encoder cable connectors, labels, pickup modules, motor nameplates if reachable | Confirms encoder type, supply, and pinout path. |
| High | Spindle drive | Mitsubishi FR-SX model label, terminal strip, analog input, run/FWD/REV/enable/alarm terminals | Confirms spindle speed command and digital control wiring. |
| High | 24 VDC supply | HR-11F-24 terminals `+S`, `+`, `-`, `-S`, `TOG`, `CNT`, `FG`, `L`, `N` plus destination wires | Confirms P24/G24 distribution and remote sense/control wiring. |
| High | P24/G24 terminal strips | P24, G24, +24V, 0V jumpers, wire numbers, fuses | Confirms Mesa field-power and I/O common strategy. |
| High | Green breakout PCB | Full board, connector names, label `YM VQC-20-40/50`, all circular plugs and D-sub connectors | Decides whether to reuse the board as junction or bypass to terminal blocks. |
| High | Existing I/O terminal strips | Labels such as `INHRLS`, `DEC2`, `CH4`, limit/home/ATC signals, wire numbers | Lets the workbook map real terminals to Mesa inputs/outputs. |
| High | E-stop / safety chain hardware | E-stop relays, door interlock wiring, servo contactor, ready chain relays | Determines what stays hardwired and what LinuxCNC only monitors. |
| Medium | Tool clamp / drawbar valves | Solenoid labels, coil voltage, terminal numbers, PRS-8/PRS-9 wiring | Confirms ATC tool clamp/unclamp I/O. |
| Medium | Spindle gear shift valves | SOL-12/SOL-13 or related labels, PRS-10/PRS-12 wiring | Confirms high/low gear logic and safe spindle start interlocks. |
| Medium | Magazine hydraulics | SOL-8A/SOL-8B, PRS-13, PRS-21 through PRS-25, cover switches/solenoids | Confirms magazine rotation and tool-position bit logic. |
| Medium | Coolant / air / utility outputs | Coolant contactors, air blast valves, tap coolant, work light, relays | Determines which outputs need 7i84U direct output vs interposing relay. |
| Medium | Cabinet grounding/shield bars | PE bar, 0 V common bar, shield clamp areas, analog/encoder shield landings | Prevents noise and ground-loop problems. |
| Medium | Available DIN rail / panel space | Open rail length, wire duct space, door clearance around proposed 7i97T/7i84U area | Drives the parts list for DIN rail, duct, terminals, and mounting. |
| Low | Operator panel wiring | Cycle start, feed hold, single block, overrides, lamps | Helps decide which original panel controls to keep. |
| Low | Existing manuals/labels | Any cabinet schematic pockets, inside-door legends, terminal charts | May save tracing time. |

## Video pass

After still photos, take one slow video sweep:

1. Start with the whole cabinet.
2. Move left to right.
3. Pause at each drive, terminal strip, relay bank, and breakout board.
4. Narrate what you know: “X drive,” “spindle FR-SX,” “P24/G24 strip,” “green breakout board,” etc.

## Files to save

Save photos/video in the Mazak folder using a simple naming pattern:

- `cabinet_wide_left_YYYY-MM-DD.jpg`
- `cabinet_wide_center_YYYY-MM-DD.jpg`
- `cabinet_wide_right_YYYY-MM-DD.jpg`
- `x_servo_drive_terminals_YYYY-MM-DD.jpg`
- `frsx_spindle_drive_terminals_YYYY-MM-DD.jpg`
- `p24_g24_terminal_strip_YYYY-MM-DD.jpg`
- `green_breakout_pcb_YYYY-MM-DD.jpg`
- `estop_safety_chain_relays_YYYY-MM-DD.jpg`

## What to send for the next HAL update

The most useful first batch is:

1. Whole cabinet wide shots.
2. X/Y/Z servo amplifier model and terminal strips.
3. FR-SX spindle controller model and terminals.
4. 24 VDC supply and P24/G24 terminal strips.
5. Green breakout PCB and connector labels.
6. E-stop / safety relay / servo contactor area.

