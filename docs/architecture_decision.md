# Architecture Decision: Mesa 7i97T + 7i84U (Ethernet)

## Decision

Use a LinuxCNC control PC driving a **Mesa 7i97T Ethernet analog servo controller** as
the primary motion/control board, with a **Mesa 7i84U** as remote field-I/O expansion.
The 7i97T connects to the control PC over Ethernet using the `hm2_eth` driver and a
static IP.

## Selected control stack

- LinuxCNC control PC located at the machine (e.g. in the old Mazatrol rack area).
- Mesa 7i97T Ethernet analog servo controller as the primary motion/control board:
  - Analog servo command outputs for X/Y/Z.
  - Encoder inputs for X/Y/Z (and spindle feedback if present).
  - Spindle analog/digital command where appropriate (FR-SX speed reference,
    run/enable/direction as the board supports).
  - Core digital I/O per the board's capabilities: homes/limits, drive enables/faults,
    E-stop monitor, lube/hydraulic OK, and other critical motion/safety I/O.
- Mesa 7i84U remote field-I/O expansion on smart-serial, mounted near the existing green
  breakout PCB, for ATC, hydraulic, coolant, air, magazine, utility I/O, and cabinet
  field wiring.
- Optional WHB04B-style USB pendant through LinuxCNC, not through Mesa.

## Why this fits the Mazak

- The drives, spindle controller, 24 VDC control bus, field I/O, ATC, hydraulics, and
  terminal strips are already concentrated in the cabinet.
- The 7i97T is a natural match for three analog servo axes plus analog spindle command
  and encoder feedback, in a single Ethernet-connected board.
- Ethernet (`hm2_eth`) avoids dependence on a PCIe slot in the control PC and lets the PC
  be sited flexibly; a static IP link keeps the motion interface deterministic.
- The 7i84U can be mounted close to the existing breakout/terminal area so ATC and
  hydraulic field wiring stays short and organized.

## Remaining checks before final hardware purchase

- Confirm exact 7i97T and 7i84U part numbers, board revisions, and documentation.
- Confirm the correct 7i97T firmware/bitfile and the 7i84U smart-serial field-I/O path.
- Confirm 7i97T Ethernet setup: static IP, `hm2_eth` `board_ip`, and host NIC config.
- Run LinuxCNC latency testing on the actual control PC.
- Confirm X/Y/Z drive command type, command polarity, and scaling.
- Confirm encoder type, supply voltage, pinout, and counts per unit.
- Confirm FR-SX spindle command mode (analog speed reference and run/direction/enable).
- Confirm 24 VDC field power feed, I/O sourcing/sinking behavior, and field power/fusing.
- Confirm output load currents and whether interposing relays are required.

## Previous / rejected architecture (historical)

An earlier draft of this project proposed a **PCIe tower-card stack** instead:

- A tower PC inside the cabinet with a **6i25** PCIe host card.
- A **7i77** analog servo card for X/Y/Z analog command, spindle command, and encoders.
- A **7i84** field-I/O card near the green breakout PCB.
- An **optional 7i85/7i85S** third expansion board for extra encoder/MPG/stepgen or a
  future 4th axis.

That PCIe/6i25/7i77/7i85 plan has been **superseded** by the 7i97T + 7i84U Ethernet
architecture above. It is retained here only as historical context and is **not** the
selected path.
