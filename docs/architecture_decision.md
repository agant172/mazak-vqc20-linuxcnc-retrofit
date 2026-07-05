# Architecture Decision: Cabinet Tower PC with PCIe Mesa

## Decision

Use the tower PC mounted inside the Mazak VQC 20/40 cabinet with a PCIe Mesa host card. Treat laptop + Ethernet Mesa as a fallback only.

## Selected control stack

- Tower PC inside the cabinet, replacing the Mazatrol rack area.
- Mesa 6i25 PCIe host card or current compatible equivalent.
- Mesa 7i77 for X/Y/Z analog commands, spindle speed command, encoder feedback, drive enables/faults, homes/limits, E-stop monitor, lube/hydraulic OK, and other critical motion/safety I/O.
- Mesa 7i84 near the existing green breakout PCB for ATC, hydraulic, coolant, air, magazine, and utility I/O.
- Optional Mesa 7i85/7i85S only if extra encoders, MPG/handwheel, stepgens, or a future 4th axis are needed.
- Optional WHB04B-style USB pendant through LinuxCNC, not Mesa.

## Why this fits the Mazak

- The drives, spindle controller, 24 VDC control bus, field I/O, ATC, hydraulics, and terminal strips are already concentrated in the cabinet.
- The tower PC can occupy the old Mazatrol rack space and become part of the machine, instead of depending on an external laptop.
- PCIe avoids dedicated Ethernet setup, static IP issues, laptop power management, and an external motion-control network cable.
- The 7i77 is a natural match for three analog servo axes plus analog spindle command and encoder feedback.
- The 7i84 can be mounted close to the existing breakout/terminal area so ATC and hydraulic wiring stays short and organized.

## Remaining checks before final hardware purchase

- Confirm the exact PCIe Mesa host card model and current availability.
- Confirm the correct 6i25/7i77/7i84 firmware or bitfile for the final card stack.
- Run LinuxCNC latency testing on the actual tower PC.
- Confirm X/Y/Z drive command type, command polarity, and scaling.
- Confirm encoder type, supply voltage, pinout, and counts per unit.
- Confirm FR-SX spindle analog speed mode and run/direction/enable terminals.
- Confirm 24 VDC load margin and field power/fusing.
- Confirm output load currents and whether interposing relays are required.

