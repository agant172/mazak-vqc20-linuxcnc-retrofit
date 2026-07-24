# Mesa Pin Authority

**Mapping status: COMPLETE — documentation and planning map finalized.**

The remaining `COMMISSIONING_PENDING`, `ACCEPTED_VERIFY`, and `HOLD_CONFLICT`
entries are cabinet-verification and commissioning tasks; they do not mean the
mapping documentation is incomplete.

Use `current_pin_authority.csv` as the current pin-planning source for the Mazak
VQC 20/40 retrofit.

## Files

- `current_pin_authority.csv` - current pin authority table. This reconciles the
  7i97T / 7i84U / 7i49 decision against Phase 2, the archived wiring map, and the
  active HAL files. Rows marked `COMMISSIONING_PENDING` still require cabinet
  tracing before landing wires.
- `signal_map.csv` - older companion signal map. Some rows are stale and conflict
  with the active HAL and Phase 2 review, especially TB5 homes/limits/E-stop and
  7i84U field I/O.
- `mesa_firmware_checklist.md` - hardware and firmware facts to collect before
  final HAL pin names are locked.

## Current Authority Rules

- Use 7i97T TB5 for X/Y/Z limits, X/Y/Z homes, and E-stop.
- Use 7i97T TB3 for X/Z/Y analog commands and X/Z/Y drive S-ON enables.
- Use 7i84U for ATC, hydraulics, magazine, coolant, lube, alarm, and field I/O.
- Use 7i97T TB5 SSR outputs as overflow relay drivers for air/touch/tap blast.
- Use 7i49 resolver channels for X/Y/Z feedback.

Do not order a second smart-serial card until the input count in
`current_pin_authority.csv` is proven insufficient.
