# Mesa Pin Authority

**Mapping status: COMPLETE — documentation and planning map finalized for the
7i80HDT / 7i44 / 7i49 / 7i84U-A / 7i84U-B stack.**

> **Authority hierarchy.** `current_pin_authority.csv` is the single
> source of truth for pin → signal assignment. `linuxcnc/*.hal` must
> agree with it on every physical pin reference; the check runs as
> `python3 scripts/validate_authority.py` from the repository root.
> Wiring notes, research notes, and rendered PDFs are non-authoritative.
> Full definition: [`../docs/authority_hierarchy.md`](../docs/authority_hierarchy.md).

The remaining `COMMISSIONING_PENDING`, `PROPOSED`, and `HOLD_CONFLICT`
entries are cabinet-verification and commissioning tasks; they do not mean the
mapping documentation is incomplete. `HOLD_CONFLICT` rows must not be wired or
energized until the conflict register and cabinet trace are complete. The
validator enforces this: any active HAL `net` binding on a `HOLD_CONFLICT`
pin is a hard error.

Use `current_pin_authority.csv` as the current pin-planning source for the Mazak
VQC 20/40 retrofit. Evidence-state taxonomy defined in
[`../docs/pre_power_deliverables.md`](../docs/pre_power_deliverables.md).

## Hardware stack

> **P1/P2/P3 roles confirmed 2026-08-13, flipped vs. earlier docs.** See
> "Firmware bitfile" below.

- **7i80HDT** — Ethernet FPGA host, 100BaseT, three 50-pin daughter connectors
  (P1/P2/P3), 72 IO total. Host-only — the board carries no field terminals.
- **7i49 on P1** — 6× resolver channels + 6× ±10V analog outputs. Carries X/Y/Z
  resolver feedback and X/Y/Z servo velocity commands plus FR-SX spindle
  velocity. AOUT4/AOUT5 are spare; orient is discrete ORCM1.
- **P2 unused/spare** — no daughter card is fitted; all bare-FPGA GPIO
  (`gpio.024`-`gpio.047`). Not safe for 24 V field wiring (3.3 V logic without
  opto-isolation).
- **7i44 on P3** — 8-channel RS-422 sserial breakout. Physical channels 0/1
  serve 7i84U-A/B under HostMot2 port 0; channels 2-7 remain available.
- **7i84U-A on 7i44 sserial channel 0** — 32/16 remote field I/O near the
  existing green breakout PCB, addressed as `hm2_7i80.0.7i84.0.0.*`.
- **7i84U-B on 7i44 sserial channel 1** — 32/16 remote field I/O for X/Y/Z
  limits, X/Y/Z homes, X/Y/Z drive enables, relay-driven loads, and the
  Renishaw MP-3 probe SKIP1 (input-15), addressed as `hm2_7i80.0.7i84.0.1.*`.
  See `current_pin_authority.csv` for the exact TB2/TB3 pin map.
- **Firmware bitfile**: `7i80hdt_rmsvss6_8.bin`, flashed 2026-08-11. **Layout,
  identity, and upstream source all CONFIRMED**: two independent `readhmid`
  reads (flash-time and 2026-08-13, byte-identical), a recorded SHA-256, and
  the binary itself sourced directly from Peter Wallace at Mesa Electronics
  (`freeby.mesanet.com/7i80hdt_rmsvss6_8.zip`, 2026-08-11). Confirmed module
  layout: ResolverMod + 6× PWM on **P1** (via the 7i49), 8-channel SSerial on
  **P3** (via the 7i44), bare GPIO on **P2**, no Encoder module present. See
  `mesa_firmware_checklist.md` (Bitfile
  provenance) for the full evidence trail.

## Files

- `current_pin_authority.csv` - pin authority table. Reconciles the
  7i80HDT / 7i44 / 7i49 / 7i84U-A / 7i84U-B decision against Phase 2, the
  archived wiring map, and the active HAL files. Rows marked
  `COMMISSIONING_PENDING` still require cabinet tracing before landing wires.
- `mesa_firmware_checklist.md` - hardware and firmware facts to collect before
  final HAL pin names are locked.

## Current Authority Rules

- Use **7i84U-B on 7i44 sserial channel 1** for X/Y/Z limits (TB3 IN0-5),
  X/Y/Z homes (TB3 IN6-8), air permissive (TB3 IN9), the Renishaw MP-3
  probe (TB3 IN15), X/Y/Z drive enables (TB3 OUT0-2), relay-driven loads
  (TB3 OUT3-7), and the proposed cover-close command (TB2 OUT8). **7i84U-A
  TB2 IN29** (`ESTOP_MONITOR`) is DEFERRED — no interposing relay is installed
  (owner decision 2026-08-15); the unwired input fails safe. Note the
  Mesa 7i84 layout: TB1 is the 8-pin power connector, TB3 carries IN0-15
  and OUT0-7, and TB2 carries IN16-31 and OUT8-15.
- **Do NOT wire bare 7i80HDT P2 GPIO to any 24 V field signal.** P2 is 3.3 V
  logic without opto-isolation — exposing it to 24 V will destroy the FPGA.
  The probe was moved from a former bare-GPIO binding to 7i84U-B input-15
  for that reason. All P2 pins are unused/spare in this configuration.
- Use **7i49 P1 analog outputs** for X/Z/Y servo velocity commands and FR-SX
  spindle velocity on AOUT0..AOUT3. AOUT4/AOUT5 are spare; FR-SX orient is
  commanded by discrete ORCM1.
- Use **7i49 P1 resolver channels 0/1/2** for X/Y/Z Tamagawa TS2014N feedback.
- Use **7i84U-A** (via 7i44 P3 channel 0) for ATC, hydraulics, magazine,
  coolant, lube, alarm, and cabinet field I/O; use **7i84U-B** on channel 1 for
  the limit/home monitoring inputs, drive enables, and relay-driven loads listed above.
- OEM E-stop safety chain remains hardwired and authoritative. LinuxCNC only
  monitors the chain through an interposing relay dry contact.
- Every OEM-to-retrofit digital crossing uses an interposing relay.

Do not order a third smart-serial card until the input count in
`current_pin_authority.csv` is proven insufficient. The 7i44 has 6 spare
physical channels available for future expansion (MPG, 4th axis, additional 7i84).
