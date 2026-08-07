# E-stop safety chain — design requirements and fault-injection matrix

This document is a placeholder for two artifacts that **do not yet exist**
for this machine and cannot be shipped without:

1. A **hardwired safety schematic** for the personnel-protection E-stop
   chain, drawn from the actual cabinet (not inferred).
2. An **independently validated fault-injection matrix** that proves the
   schematic behaves as claimed for every credible single fault.

Until both exist and are signed off, this retrofit's E-stop is
**asserted, not designed or proven**. LinuxCNC and the 7i84U inputs
must be treated as monitoring/inhibit only. They are neither the primary
nor a backup safety element.

## Standing position

- **The retained OEM MAR relay / hardwired E-stop chain is intended to be the
  primary safety path, but its as-built behavior is not yet proven.**
  This is stated in `linuxcnc/mazak_vqc_20_40.hal` around the `estop-latch`
  wiring: *"The OEM MAR relay hardware E-stop chain is the primary
  safety. This latch is an additional software overlay for orderly LinuxCNC
  behavior."* The HAL `estop-latch` component's own man page
  ([estop_latch(9)](https://linuxcnc.org/docs/2.9/html/man/man9/estop_latch.9.html))
  concedes this by scope: *"This component can be used as a **part of** a
  simple software ESTOP chain."* Part of, not the whole thing.
- **LinuxCNC does not publish a safety rating.** The
  [LinuxCNC user concepts page](https://linuxcnc.org/docs/2.9/html/user/user-concepts.html)
  makes no claim of SIL, PL, or machine-safety certification, and does
  not describe hardwired-vs-software E-stop distinction. The
  [integrator concepts page](https://linuxcnc.org/docs/2.9/html/config/integrator-concepts.html)
  likewise contains no safety-chain guidance. Community consensus in the
  [LinuxCNC forums](https://forum.linuxcnc.org/24-hal-components/54834-physical-safety-relay-and-software-estop-latch-working-together)
  is that a physical safety relay must sit between the E-stop button and
  the drive-power contactor, and that software E-stop latches are
  supplementary indicators, never the sole path.
- **Smart-serial cannot be the sole E-stop path.** The actual input age,
  output-drop time, and remote safe-state behavior are not established for this
  bitfile/card configuration; see
  [smart_serial_latency.md](smart_serial_latency.md). Even after measurement, a
  software round trip through the 7i84U is not a safety-rated hard-overtravel or
  torque-removal path.

## What the hardwired schematic must show

Draw this from the actual cabinet — measure and photograph, do not
guess. File as `docs/schematics/estop_safety_chain.svg` (source in
draw.io / KiCad / hand-sketched-then-scanned) with a companion legend
under `docs/schematics/estop_safety_chain.md`. Include:

- **E-stop mushroom buttons** — every one on the machine (main pendant,
  cabinet door, any external station). Model number and stopping-
  category rating (per [EN 60204-1](https://www.iso.org/standard/62409.html)
  Cat 0 vs Cat 1) must be recorded.
- **Contact channels.** For each E-stop button, show every contact
  block and where it lands. Safety-rated E-stop buttons typically have
  ≥ 2 NC contacts, wired dual-channel with discrepancy detection.
  Confirm each button's fitted contact blocks.
- **Safety relay.** If a Pilz / Omron / Schneider / etc. safety relay
  is installed, record model, catalog PL/SIL rating, input/output
  configuration, cross-monitoring, and reset behavior (manual /
  auto / monitored manual). If **no** safety relay is installed and
  the chain is only KM contactors, that is a finding to escalate.
- **Force-guided (mechanically-linked) contactors.** The main drive-
  power contactor(s) — MAR relay and any downstream K1/K2 — should
  have mirror-contact feedback returning to the safety relay for
  monitored contactor sequence. Record whether contacts are
  IEC 60947-5-1 Annex L (force-guided) rated.
- **Wire numbers and terminal designations** from the actual cabinet.
  Cross-reference to [`docs/photo_survey_misc.md`](photo_survey_misc.md)
  contactor bank and the MAR relay location.
- **Everything the E-stop chain physically removes:** the 3-phase feed
  to the rectifier, the 24 V control power to drive enables, the Z
  brake solenoid (drops → brake sets under spring), the spindle brake
  if any, coolant/hydraulic pumps that must stop on E-stop.
- **Everything the E-stop chain does NOT remove:** the P/N DC bus
  (which discharges via bleeder/regen over minutes; see
  [`dc_bus_stop_fault.md`](dc_bus_stop_fault.md)), the LinuxCNC PC
  itself, the pendant electronics.
- **Reset / restart behavior.** Which reset button re-arms the safety
  relay, whether reset is monitored, and any preconditions
  (all doors closed, all axes in-position, drives ready).
- **Stopping category** achieved by this design and how it is
  measured (a category-1 stop requires proof that the drives ramp
  down under command before the contactor drops).

## Fault-injection matrix (must be independently validated)

For each row, the operator injects the fault, then independently
verifies (measure, don't infer) that every "must" column is achieved.
File the validated run under `docs/commissioning_logs/estop_validation_YYYYMMDD.md`
with a signature and witness.

| # | Injected fault | Trigger action | Must: drives disable (torque OFF at motor) | Must: main contactor drop out | Must: Z brake set within 100 ms | Must: LinuxCNC iocontrol.0.emc-enable-in falls | Must: reset requires manual action after clear | Fault-clear discrepancy detected within safety-relay window? |
|---|---|---|---|---|---|---|---|---|
| 1 | Any single E-stop button pressed | Press mushroom | Yes | Yes | Yes | Yes | Yes | N/A |
| 2 | E-stop button contact fails welded closed | Sim: short one channel | Yes on release of other button | Yes on release of other button | Yes | Yes | Yes | Yes (discrepancy > safety-relay window) |
| 3 | E-stop button contact fails open (broken wire) | Sim: open one channel | Yes | Yes | Yes | Yes | Yes | Yes |
| 4 | Safety relay K1 output welded | Sim: force output | Yes via redundant K2 | Yes via K2 | Yes | Yes | Yes | Yes (next reset attempt) |
| 5 | Safety relay K2 output welded | Sim: force output | Yes via K1 | Yes via K1 | Yes | Yes | Yes | Yes |
| 6 | Cabinet door interlock opened while running | Open door | Yes | Yes | Yes | Yes | Yes | N/A |
| 7 | 24 V control loss to safety relay | Open 24 V feed | Yes (chain fails safe) | Yes | Yes | Yes | Yes | N/A |
| 8 | Main contactor coil open | Cut coil feed | N/A (already dropped) | Yes stays dropped | Yes | Yes (READY chain drops) | Yes | Force-guided mirror contact signals to safety relay |
| 9 | Main contactor mirror contact fails open | Sim: mirror stuck open after coil OK | Yes | Yes (safety relay refuses to close on next reset) | Yes | Yes | Yes | Yes (contactor-monitoring detects mismatch) |
| 10 | LinuxCNC PC lockup while machine running | Kill LinuxCNC process | Yes; measure remote-output drop and prove the hardwired chain acts independently | Yes | Yes | Yes | Yes | N/A |
| 11 | 7i44 smart-serial link to either 7i84U dies | Disconnect the selected channel under an approved test setup | Yes; measure rather than assume a watchdog time | Yes | Yes | Yes | Yes | N/A |
| 12 | 7i80HDT loses Ethernet | Disconnect the dedicated Ethernet link under an approved test setup | Yes; measure HostMot2 and hardwired response | Yes | Yes | Yes | Yes | N/A |
| 13 | Runaway axis (drive output stuck at full V) | Sim: pid.x.output-clamp bypass | Hard limit switch fires and drops safety chain (must NOT rely on 7i84U-input path) | Yes | Yes | Yes | Yes | N/A |
| 14 | Rectifier overvoltage alarm | Use the manufacturer's approved alarm-test method | Yes; do not assume adjacent-family E7 behavior applies | Yes | Yes | Yes | Yes | N/A |
| 15 | Single axis (X) amplifier fault | Sim: force ALM on X | Yes on all axes (single-fault-drops-all rule) | Yes | Yes | Yes | Yes | N/A |
| 16 | Z brake solenoid coil open | Open the coil circuit under a restrained-axis test | **Detection gap:** no brake-current or brake-state input is assigned; add verified feedback or document the residual risk | Main contactor behavior to verify | Spring-set brake must still set; prove mechanically | Software indication requires added feedback | Yes | N/A |
| 17 | 24 V field power to 7i84U-B lost | Open field 24 V | Yes (all outputs drop) | Yes | Yes | Yes | Yes | N/A |
| 18 | Multiple simultaneous inputs discrepant (dual-channel fault) | Sim: single-channel activation only | Yes | Yes | Yes | Yes | Yes | Yes within safety-relay's discrepancy window |

**Every "Yes" must be verified by measurement**, not by inspection of
the schematic. Use a DMM on the drive-enable line, a scope on the P/N
bus, a mechanical dial indicator on the Z axis (to confirm brake
holds under gravity), and Halscope on the HAL nets.

## Retrofit scope constraint

Until the schematic exists and the matrix is validated:

- **HAL must monitor, not control** the primary E-stop path. The
  `estop-latch` in `linuxcnc/mazak_vqc_20_40.hal` already does this —
  `estop-monitor` reads the OEM MAR relay aux contact via 7i84U-A IN29,
  and `estop-latch.0.ok-out` drives `iocontrol.0.emc-enable-in`.
  Adding fault-in sources (spindle drive fault contact, servo drive
  ALM contacts, door interlocks that already sit on the hardwired
  chain) is fine — they make LinuxCNC's response tighter. **But
  removing or bypassing any wire in the hardwired chain to move it
  into HAL is prohibited.**
- **7i84U-B drive-enable outputs** to X/Y/Z go in **series** with the
  OEM per-amplifier enable inputs. When the retrofit is complete, the
  OEM CNC section's enable driver may be removed, but its interlock
  path (the MAR relay chain gating drive power) stays. See
  [`dc_bus_stop_fault.md`](dc_bus_stop_fault.md).
- **The retrofit adds no new personnel-protection guarantees** and
  makes no claim about SIL/PL rating. Any such claim requires a
  separate hardware / SIL-rated safety controller (Pilz PNOZ,
  Omron G9SP, Schneider Preventa, or equivalent), which is not in
  the current retrofit scope.

## Sources

- [LinuxCNC estop_latch(9) man page](https://linuxcnc.org/docs/2.9/html/man/man9/estop_latch.9.html)
  — the *"part of a simple software ESTOP chain"* wording that
  explicitly limits the component's role.
- [LinuxCNC forum: physical safety relay and software estop latch working together](https://www.forum.linuxcnc.org/24-hal-components/54834-physical-safety-relay-and-software-estop-latch-working-together)
  — community consensus on hardwired-primary / software-supplementary.
- [LinuxCNC forum: educate me about estop chains and latches](https://forum.linuxcnc.org/10-advanced-configuration/32789-educate-me-about-estop-chains-and-latches)
  — worked examples of hardwired chain feeding an `estop-latch`.
- [LinuxCNC forum: is software Estop allowed](https://forum.linuxcnc.org/24-hal-components/53650-is-software-estop-allowed)
  — the community answer is "hardwired mushroom button, always."
- [EN 60204-1 machine electrical equipment (ISO catalog)](https://www.iso.org/standard/62409.html)
  — stopping categories 0/1/2 definitions.
- [IEC 61800-5-2 adjustable-speed drives — safety requirements](https://webstore.iec.ch/publication/29331)
  — STO / SS1 / SS2 definitions for drive-side safety functions.
- [Mitsubishi Meldas MDS-B/C1 maintenance manual (BNP-B3977)](https://www.servo-repair.com/documents/mitsubishi/BNP-B3977.PDF)
  — Alarm E7 cross-axis propagation; the OEM path this retrofit inherits.
