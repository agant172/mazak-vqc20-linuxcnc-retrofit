# Architecture Decision: Mesa 7i97T + 7i84U (Ethernet) + 7i49 resolver interface

## Decision

Use a LinuxCNC control PC driving a **Mesa 7i97T Ethernet analog servo controller** as
the primary motion/control board, with a **Mesa 7i84U** as remote field-I/O expansion and
a **Mesa 7i49** resolver-to-digital interface for axis position feedback. The 7i97T
connects to the control PC over Ethernet using the `hm2_eth` driver and a static IP. The
machine keeps its original Tamagawa resolvers, so feedback is resolver-based (plain 7i49,
5 kHz excitation baseline) rather than quadrature-encoder.

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
- **Mesa 7i49 (plain, not 7i49HV) resolver feedback interface** for X/Y/Z (and spindle
  if resolver-based) position feedback. The Mazak retains its original Tamagawa resolvers,
  so axis feedback is resolver-to-digital, not quadrature-encoder. See the dedicated
  [Resolver feedback interface](#resolver-feedback-interface-mesa-7i49) section below.
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

## Resolver feedback interface (Mesa 7i49)

The Mazak VQC 20/40 keeps its **original Tamagawa resolvers** for axis position feedback,
so the retrofit uses a **Mesa 7i49 resolver-to-digital interface** rather than reading
quadrature encoders. This section is the working decision record for the resolver path.
Language is deliberately practical for buying parts and planning the cabinet — but several
values below are still **unverified until measured on this machine** (see the unknowns
list at the end).

### Observed / documented resolvers

- Recent photos and documentation show **Tamagawa resolver pickup units**.
- Documented resolver models seen so far: **RT-5XA-11** and **RT-5XA-L1**. Treat these as
  documented/observed resolver variants, **not** encoder variants — the axis feedback is
  resolver, not encoder.
- **Caution — connector vs. model:** `MS3108B 20-29P` is a **connector shell part number**
  (an MS/MIL circular connector), **not** a resolver model. Do not record it as the
  resolver type.
- Still to confirm per axis: which resolver label is on X, Y, and Z; the exact winding
  pairs; and the return signal level (see below).

### Working baseline: plain 7i49 at 5 kHz excitation

- **Buy a plain Mesa 7i49** as the resolver interface. This is the intended starting point
  and the buy-plan item.
- Set the **resolver excitation frequency to 5 kHz**. The Mitsubishi/Tamagawa spec is
  **4.5 kHz**, and the 7i49 offers **2.5 / 5 / 10 kHz**, so 5 kHz is the closest available
  setting and the working baseline. This is a reasoned starting point, not an absolute
  certainty — keep the verification note that final excitation may be revisited after
  scoping the return signal.
- Strong supporting evidence comes from a **Mazak VQC 15/40 sister retrofit** that uses the
  **same Mitsubishi TRA drives and HD81-12S motors** and runs a **plain Mesa 7i49 (not
  7i49HV)**. That build informs this baseline directly.

### Transformation ratio and signal levels

- Mazak-era resolvers are reported as **2:1 control-transformer types**: in the old control
  context, roughly **12 V two-phase in and 6 V out**.
- The **7i49 is designed around 2:1 resolver behavior**: it drives about **2 V RMS**
  excitation and expects about **1 V RMS** sin/cos return.
- Because the resolver ratio and the 7i49 design both center on 2:1, the **plain 7i49 is
  the intended starting point**. **7i49HV is demoted to a contingency** — only justified
  if measurements prove a signal-level mismatch or a different resolver ratio on this
  machine.

### Wiring warning — old Meldas M2 / TRA resolver wiring may differ

- The original **Meldas M2 / TRA** resolver wiring may run the resolver "backwards" or
  phase-analog: **two-phase excitation into the stator and the phase read from the rotor**.
- The **7i49 uses conventional single excitation** (drives one winding) and **reads sin/cos
  amplitude** on the other two windings. This is the opposite arrangement from some
  original Meldas wiring.
- **Identify the resolver winding pairs with an ohmmeter before applying power.** Do not
  trust the original wire names. Expected mapping once verified:
  - Rotor pair (likely **RO1/RO2**) → **RESDRV+ / RESDRV−** (excitation).
  - Two matched stator pairs → **RESSIN** and **RESCOS**.
- Verify each pairing by resistance/continuity rather than assuming the labeled wire names
  match this scheme.

### Measurement and tuning notes (7i49)

- After wiring, **scope the return signal level** on the sin/cos inputs with the 7i49
  excitation running.
- **Too low a signal** shows up as position noise and sluggish/soft axis response.
- **Too hot / too weak a signal** can be corrected as applicable: a divider on the return
  or the **W2 half-drive jumper** to halve excitation drive. Treat **W2 half-drive as a
  field-verification option only, not a default** — leave full drive as the starting point
  and only change it if measurements call for it.
- Escalate to **7i49HV only** if the signal is far too weak at full drive — i.e. if the
  resolver turns out to need higher excitation than the plain 7i49 provides.

### Drive ownership — LinuxCNC/7i49 owns resolver excitation

- The **TRA-type drives close their velocity loop on a tachometer, not on the resolver.**
  The resolver is a position device for the control, independent of the drive's own velocity
  loop.
- Therefore **LinuxCNC + the 7i49 can own the resolver excitation outright.** The **7i49
  must be the sole resolver excitation source** — do not share the resolver excitation with
  the old drive or old control. Confirm nothing else is still driving the resolver windings
  before energizing the 7i49.

## Remaining checks before final hardware purchase

- Confirm exact 7i97T and 7i84U part numbers, board revisions, and documentation.
- Confirm the correct 7i97T firmware/bitfile and the 7i84U smart-serial field-I/O path.
- Buy a **plain 7i49** (not 7i49HV); confirm its host connection path and the firmware
  `num_resolvers` config that exposes the resolver channels.
- Set 7i49 excitation to **5 kHz** (spec 4.5 kHz; options 2.5/5/10 kHz).
- Identify resolver winding pairs per axis with an ohmmeter before power; scope the return
  signal level; only then decide on W2 half-drive / divider or a 7i49HV escalation.
- Confirm 7i97T Ethernet setup: static IP, `hm2_eth` `board_ip`, and host NIC config.
- Run LinuxCNC latency testing on the actual control PC.
- Confirm X/Y/Z drive command type, command polarity, and scaling.
- Confirm per-axis resolver label, winding pairs, transformation ratio, and return signal
  level; confirm the resolver-to-machine-unit scale and orientation once counting.
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

## Resolver unknowns still needing measurement

These are the resolver-specific items that must be measured on this machine before the
feedback path can be trusted. They are buy-plan / bring-up blockers, not settled facts:

- Axis-by-axis resolver label (which of RT-5XA-11 / RT-5XA-L1 / other is on X, Y, Z).
- Winding pairs (rotor vs. stator) identified by ohmmeter before power.
- Return signal level scoped after 7i49 excitation (drives the full-drive vs. W2
  half-drive / divider, and the plain-7i49 vs. 7i49HV decision).
- Final HAL resolver scale and axis orientation (direction/counts per machine unit).
- Shield / ground termination strategy for the resolver cabling.

## Sources

- Servo PID tuning thread — VQC 15/40, TRA-31, HD81-12S, plain 7i49 @ 5 kHz vs. the
  4.5 kHz spec: <https://forum.linuxcnc.org/10-advanced-configuration/32061-servo-pid-tuning-can-t-clamp-down-on-overshoot>
- Mesa 7i49 manual (resolver interface, excitation options, W2 jumper, RESDRV/RESSIN/RESCOS):
  <http://www.mesanet.com/pdf/motion/7i49man.pdf>
- srdco/MazakVQC1540 — LinuxCNC configs for the sister VQC 15/40 retrofit:
  <https://github.com/srdco/MazakVQC1540>
- SRDCO MazakVQC1540 complete 2017 reference package — full 2017-05-01 config/wiring
  snapshot from the sister VQC 15/40 build, for planning and retrofit comparison:
  <https://github.com/srdco/MazakVQC1540/tree/master/MAZAK-VQC1540-20170501>
- User's thread — Mesa conversion for a Mazak VQC 20/40 M2 mill:
  <https://forum.linuxcnc.org/27-driver-boards/58767-mesa-conversion-for-a-mazak-vqc-20-40-m2-mill>
- Mitsubishi TRA-31 drive manual:
  <https://us.mitsubishielectric.com/fa/en/support/technical-support/knowledge-base/getdocument/?docid=3E26SJWH3ZZR-24-3709>
- Meldas YM2 / Mazatrol M2 maintenance manual:
  <https://us.mitsubishielectric.com/fa/en/support/technical-support/knowledge-base/getdocument/?docid=3E26SJWH3ZZR-24-2231>
