# Mazak VQC-20 LinuxCNC Retrofit

Conversion of a Mazak VQC-20 vertical machining center from the original Mazatrol M-2 CNC control to LinuxCNC using Mesa Electronics hardware.

## Project Overview

This project documents the full retrofit of a Mazak VQC-20 from the factory Mazatrol CNC to an open-source LinuxCNC-based control system. The goal is a reliable, modern control with full G-code support while retaining the machine's original mechanical integrity.

**Machine:** Mazak VQC-20/40 Vertical Quality Center  
**Original Control:** Mazatrol M-2  
**New Control:** LinuxCNC  
**Interface Hardware:** Mesa Electronics FPGA cards  

## Repository Structure

```
├── bom/          # Bill of materials - parts list and sourcing
├── docs/         # Project documentation and notes
├── linuxcnc/     # LinuxCNC configuration files (.ini, .hal)
├── mesa/         # Mesa card pinout and configuration
├── notes/        # Working notes and research
├── photos/       # Project photos
├── wiring/       # Wiring diagrams and schematics
└── archive/      # Old files and reference material
```

## Hardware

- Mazak VQC-20/40 VMC
- Mesa Electronics FPGA interface card
- Servo drives (TBD)
- Spindle VFD (TBD)

## Status

- [ ] Machine assessment complete
- [ ] Wiring documentation
- [ ] Mesa card configuration
- [ ] LinuxCNC initial config
- [ ] Axis tuning
- [ ] Spindle control
- [ ] Tool changer integration
- [ ] First cuts

## References

- [LinuxCNC Documentation](https://linuxcnc.org/docs/)
- [Mesa Electronics](http://www.mesanet.com/)
- Mazak VQC-20 Maintenance Manual (60231)
- Mazak VQC-20 Operating Manual (62625)
