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

`FACTORY_LINK` and `FACTORY_INTERFACE` are final authority states.
`FACTORY_LINK` applies to supplied Mesa interconnects: inspect the correct
assembly, connector orientation/keying, seating, strain relief, and visible
condition, then verify the expected cards enumerate without communication or
watchdog faults. Do not continuity-audit or re-terminate individual conductors.
The physical path must still distinguish the **7i80HDT P1 to 7i44 Mesa 50-pin
IDC cable** from the **7i44 to 7i84U CAT5 smart-serial cable**. A
`FACTORY_INTERFACE` row records a final OEM interface identity from factory
documentation; it does not replace powered commissioning or safety acceptance.
`UNBOUND` is the legacy equivalent of `DEFERRED`.

Use `current_pin_authority.csv` as the current pin-planning source for the Mazak
VQC 20/40 retrofit. Evidence-state taxonomy defined in
[`../docs/pre_power_deliverables.md`](../docs/pre_power_deliverables.md).

## Hardware stack

- **7i80HDT** — Ethernet FPGA host, 100BaseT, three 50-pin daughter connectors
  (P1/P2/P3), 72 IO total. Host-only — the board carries no field terminals.
- **7i44 on P1** — 8-channel RS-422 sserial breakout. Physical channels 0/1
  serve 7i84U-A/B under HostMot2 port 0; channels 2-7 remain available.
- **7i49 on P2** — 6× resolver channels + 6× ±10V analog outputs. Carries X/Y/Z
  resolver feedback and X/Y/Z servo velocity commands plus FR-SX spindle
  velocity. AOUT4/AOUT5 are spare; orient is discrete ORCM1.
- **P3 unused/spare** — no daughter card is fitted; all bare-FPGA GPIO. Not
  safe for 24 V field wiring (3.3 V logic without opto-isolation).
- **7i84U-A on 7i44 sserial channel 0** — 32/16 remote field I/O near the
  existing green breakout PCB, addressed as `hm2_7i80.0.7i84.0.0.*`.
- **7i84U-B on 7i44 sserial channel 1** — 32/16 remote field I/O for X/Y/Z
  limits, X/Y/Z homes, X/Y/Z drive enables, relay-driven loads, and the
  Renishaw MP-3 probe SKIP1 (input-15), addressed as `hm2_7i80.0.7i84.0.1.*`.
  See `current_pin_authority.csv` for the exact TB2/TB3 pin map.
- **Firmware bitfile**: `7i80hdt_7i44_ss_7i49d` — **PROVENANCE UNVERIFIED.**
  This name is what the HAL and this project's docs assume, but it has not
  been confirmed against a source we can cite (PCW/Mesa email or forum thread)
  and it has not been read back from a running board with `readhmid`. Until
  one of those exists, treat the exact bitfile name and its module layout
  (sserial ports on P1 via the 7i44, 7i49 resolver+analog on P2, bare GPIO
  on P3) as an assumption. See `mesa_firmware_checklist.md` (Bitfile
  provenance) for the verification procedure.
  **Pre-order gate:** the 7i80HDT is an Efinix-FPGA board, so a 7i49 *resolver*
  build is less commonly pre-made than on the older Xilinx hosts. Confirm the
  Efinix resolver bitfile is available (or buildable) from Mesa/PCW **before
  ordering the remaining boards** — draft inquiry and acceptance criteria in
  [`../docs/mesa_pcw_bitfile_inquiry.md`](../docs/mesa_pcw_bitfile_inquiry.md).
  This is an availability question, not a compatibility one: the 7i49 is Mesa's
  resolver interface and HostMot2 has a Resolver module.

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
  (TB3 OUT3-7), and the proposed cover-close command (TB2 OUT8). Use
  **7i84U-A TB2 IN29** as the sole software E-stop monitor. Note the
  Mesa 7i84 layout: TB1 is the 8-pin power connector, TB3 carries IN0-15
  and OUT0-7, and TB2 carries IN16-31 and OUT8-15.
- **Do NOT wire bare 7i80HDT P3 GPIO to any 24 V field signal.** P3 is 3.3 V
  logic without opto-isolation — exposing it to 24 V will destroy the FPGA.
  The probe was moved from a former P3 `gpio.042` binding to 7i84U-B input-15
  for that reason. All P3 pins are unused/spare in this configuration.
- Use **7i49 P2 analog outputs** for X/Z/Y servo velocity commands and FR-SX
  spindle velocity on AOUT0..AOUT3. AOUT4/AOUT5 are spare; FR-SX orient is
  commanded by discrete ORCM1.
- Use **7i49 P2 resolver channels 0/1/2** for X/Y/Z Tamagawa TS2014N feedback.
- Use **7i84U-A** (via 7i44 P1 channel 0) for ATC, hydraulics, magazine,
  coolant, lube, alarm, and cabinet field I/O; use **7i84U-B** on channel 1 for
  the limit/home monitoring inputs, drive enables, and relay-driven loads listed above.
- OEM E-stop safety chain remains hardwired and authoritative. LinuxCNC only
  monitors the chain through an interposing relay dry contact.
- OEM 24V (Shindengen HR-11F-24) and retrofit 24V (Meanwell DR-240-24) buses
  stay isolated. Every OEM-to-retrofit digital crossing uses an interposing
  relay.

Do not order a third smart-serial card until the input count in
`current_pin_authority.csv` is proven insufficient. The 7i44 has 6 spare
physical channels available for future expansion (MPG, 4th axis, additional 7i84).
