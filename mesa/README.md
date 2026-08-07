# Mesa Pin Authority

**Mapping status: COMPLETE — documentation and planning map finalized for the
7i80HDT / 7i44 / 7i49 / 7i84U stack (2026-08-06 rev).**

The remaining `COMMISSIONING_PENDING`, `ACCEPTED_VERIFY`, and `HOLD_CONFLICT`
entries are cabinet-verification and commissioning tasks; they do not mean the
mapping documentation is incomplete. `HOLD_CONFLICT` rows must not be wired or
energized until the conflict register and cabinet trace are complete.

Use `current_pin_authority.csv` as the current pin-planning source for the Mazak
VQC 20/40 retrofit.

## Hardware change 2026-08-06 — 7i97T → 7i80HDT

The 7i97T is being returned to Mesa; the retrofit now uses:

- **7i80HDT** — Ethernet FPGA host, 100BaseT, three 50-pin daughter connectors
  (P1/P2/P3), 72 IO total. Host-only — the board carries no field terminals.
- **7i44 on P1** — 8-channel RS-422 sserial breakout (~$59). Provides sserial
  ports for the 7i84U (port 0) and any future smart-serial expansion.
- **7i49 on P2** — 6× resolver channels + 6× ±10V analog outputs. Carries X/Y/Z
  resolver feedback and X/Y/Z servo velocity commands plus FR-SX spindle
  velocity / orient reference.
- **7i37TA (or equivalent 50-pin breakout) on P3** — 24× direct FPGA GPIO for
  motion-critical, host-side, low-latency I/O: X/Y/Z limits, X/Y/Z homes,
  E-stop chain monitor, probe (Renishaw MP-3 SKIP1), X/Y/Z drive-enable
  outputs, and the six former TB5 SSR overflow outputs (air/coolant/barrier).
- **7i84U** on 7i44 port 0 — existing 32 DI / 16 DO field board, wiring and pin
  plan **unchanged** (all TB1 IN0..IN31 and TB2 OUT0..OUT15 rows are stable).
- **Firmware bitfile**: `7i80hdt_7i44_ss_7i49d` (PCW-provided; sserial on P1,
  7i49 on P2, GPIO on P3 — ask on the forum if pin trim/add is needed).

The old 7i97T + 7i84U + 7i49 stack is historical/superseded. Every previous
`hm2_7i97.0.*` HAL pin becomes `hm2_7i80.0.*` under the new firmware; the
7i84U logical pin plan is stable.

## Files

- `current_pin_authority.csv` - current pin authority table for the new stack.
  This reconciles the 7i80HDT / 7i44 / 7i49 / 7i84U / P3 breakout decision
  against Phase 2, the archived wiring map, and the active HAL files. Rows
  marked `COMMISSIONING_PENDING` still require cabinet tracing before landing
  wires.
- `signal_map.csv` - older companion signal map. Some rows are stale and
  conflict with the active HAL and Phase 2 review, especially the old
  7i97T TB5/TB3 assignments; superseded by the P3 GPIO block in
  `current_pin_authority.csv`. Retained for historical reference only.
- `mesa_firmware_checklist.md` - hardware and firmware facts to collect before
  final HAL pin names are locked.

## Current Authority Rules

- Use **7i80HDT P3 GPIO (via 7i37TA breakout)** for X/Y/Z limits, X/Y/Z homes,
  E-stop chain monitor, probe SKIP1, X/Y/Z drive-enable outputs, and the six
  former TB5 SSR overflow outputs (air/touch/tap blast, ATC barrier, flood
  valve, spare).
- Use **7i49 P2 analog outputs** for X/Z/Y servo velocity commands and FR-SX
  spindle velocity command; AOUT4 reserved for FR-SX orient reference; AOUT5
  spare.
- Use **7i49 P2 resolver channels 0/1/2** for X/Y/Z Tamagawa TS2014N feedback.
- Use **7i84U** (via 7i44 P1 sserial port 0) for ATC, hydraulics, magazine,
  coolant, lube, alarm, and cabinet field I/O per the committed
  single-7i84U I/O plan (2026-08-03).
- OEM E-stop safety chain remains hardwired and authoritative. LinuxCNC only
  monitors the chain through an interposing relay dry contact.
- OEM 24V (Shindengen HR-11F-24) and retrofit 24V (Meanwell DR-240-24) buses
  stay isolated. Every OEM-to-retrofit digital crossing uses an interposing
  relay.

Do not order a second smart-serial card until the input count in
`current_pin_authority.csv` is proven insufficient. The 7i44 has 6 spare
sserial ports available for future expansion (MPG, 4th axis, second 7i84).
