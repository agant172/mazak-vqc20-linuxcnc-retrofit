# Mesa Pin Authority

**Mapping status: COMPLETE — documentation and planning map finalized for the
7i80HDT / 7i44 / 7i49 / 7i84U-A / 7i84U-B stack.**

The remaining `COMMISSIONING_PENDING`, `ACCEPTED_VERIFY`, and `HOLD_CONFLICT`
entries are cabinet-verification and commissioning tasks; they do not mean the
mapping documentation is incomplete. `HOLD_CONFLICT` rows must not be wired or
energized until the conflict register and cabinet trace are complete.

Use `current_pin_authority.csv` as the current pin-planning source for the Mazak
VQC 20/40 retrofit.

## Hardware stack

- **7i80HDT** — Ethernet FPGA host, 100BaseT, three 50-pin daughter connectors
  (P1/P2/P3), 72 IO total. Host-only — the board carries no field terminals.
- **7i44 on P1** — 8-channel RS-422 sserial breakout. Port 0 serves
  7i84U-A, port 1 serves 7i84U-B, and ports 2-7 remain available for expansion.
- **7i49 on P2** — 6× resolver channels + 6× ±10V analog outputs. Carries X/Y/Z
  resolver feedback and X/Y/Z servo velocity commands plus FR-SX spindle
  velocity / orient reference.
- **P3 unused/spare** — no daughter card is fitted. The sole exception is the
  Renishaw MP-3 probe SKIP1 on bare direct FPGA GPIO `hm2_7i80.0.gpio.042`.
- **7i84U-A on 7i44 port 0** — 32/16 remote field I/O near the existing green
  breakout PCB.
- **7i84U-B on 7i44 port 1** — 32/16 remote field I/O: TB1 IN0-5 X/Y/Z
  limits, TB1 IN6-8 X/Y/Z homes, TB2 OUT0-2 drive enables, and TB2 OUT3-7
  relay-driven loads.
- **Firmware bitfile**: `7i80hdt_7i44_ss_7i49d` (PCW-provided; sserial on P1,
  7i49 on P2, GPIO on P3).

## Files

- `current_pin_authority.csv` - pin authority table. Reconciles the
  7i80HDT / 7i44 / 7i49 / 7i84U-A / 7i84U-B decision against Phase 2, the
  archived wiring map, and the active HAL files. Rows marked
  `COMMISSIONING_PENDING` still require cabinet tracing before landing wires.
- `mesa_firmware_checklist.md` - hardware and firmware facts to collect before
  final HAL pin names are locked.

## Current Authority Rules

- Use **7i84U-B on 7i44 port 1** for X/Y/Z limits (TB1 IN0-5), X/Y/Z homes
  (TB1 IN6-8), X/Y/Z drive enables (TB2 OUT0-2), and relay-driven loads
  (TB2 OUT3-7). Use **7i84U-A TB1 IN29** as the sole software E-stop monitor.
- Use **bare 7i80HDT P3 GPIO** only for probe SKIP1 on
  `hm2_7i80.0.gpio.042`; all other P3 pins are spare.
- Use **7i49 P2 analog outputs** for X/Z/Y servo velocity commands and FR-SX
  spindle velocity command; AOUT4 reserved for FR-SX orient reference; AOUT5
  spare.
- Use **7i49 P2 resolver channels 0/1/2** for X/Y/Z Tamagawa TS2014N feedback.
- Use **7i84U-A** (via 7i44 P1 sserial port 0) for ATC, hydraulics, magazine,
  coolant, lube, alarm, and cabinet field I/O; use **7i84U-B** on port 1 for
  the safety inputs, drive enables, and relay-driven loads listed above.
- OEM E-stop safety chain remains hardwired and authoritative. LinuxCNC only
  monitors the chain through an interposing relay dry contact.
- OEM 24V (Shindengen HR-11F-24) and retrofit 24V (Meanwell DR-240-24) buses
  stay isolated. Every OEM-to-retrofit digital crossing uses an interposing
  relay.

Do not order a third smart-serial card until the input count in
`current_pin_authority.csv` is proven insufficient. The 7i44 has 6 spare
sserial ports available for future expansion (MPG, 4th axis, second 7i84).
