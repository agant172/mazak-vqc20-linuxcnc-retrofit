# E-stop safety chain — WITHDRAWN scope, retained facts

**Owner decision 2026-08-15 (AG):** the machine's E-stop system stays **100%
original OEM, untouched**. This conversion does not assess, re-engineer, trace,
fault-inject, or verify the E-stop chain, and produces no safety schematic,
category rating, or fault-injection matrix for it. The verification program
this document previously specified (as-built chain schematic drawn from the
cabinet, 18-case fault-injection matrix, measured stop-category evidence) is
**withdrawn**; the full former text remains in git history for reference.

Deliverable **D5** in [`pre_power_deliverables.md`](pre_power_deliverables.md)
is withdrawn on the same basis and no longer gates any hold point.

## What remains true

- The **OEM hardwired E-stop chain is the sole safety function.** It removes
  hazardous power exactly as Mazak built it. LinuxCNC/HAL is not part of the
  safety function and must never be treated as one.
- **`ESTOP_MONITOR` is DEFERRED** (`mesa/current_pin_authority.csv`). The
  interposing monitor relay — whose coil would tap the OEM EHB bus — is not
  being installed. With 7i84U-A TB2 IN29 unwired, `estop-monitor` reads FALSE
  and the software chain stays tripped, which fails safe: LinuxCNC will not
  enable outputs or motion.
- The software-side `estop_latch` component and its HAL wiring remain in
  `linuxcnc/mazak_vqc_20_40.hal` (and are checked by
  `scripts/validate_control_logic.py`). They gate *LinuxCNC's own* outputs;
  they are a machine-availability interlock, not personnel protection.
- The ladder transcription of the OEM chain,
  [`ladder/estop_ladder_transcription.md`](ladder/estop_ladder_transcription.md),
  is retained as a historical record of the original circuit.

## If the scope ever changes

Reverting this decision means restoring D5 and the withdrawn verification
program from git history — not improvising a lighter-weight check. Until then,
no document in this repo may direct tracing, modifying, or verifying the E-stop
system.
