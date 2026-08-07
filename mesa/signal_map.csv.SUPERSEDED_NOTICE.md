# `signal_map.csv` is SUPERSEDED

As of 2026-08-06, `mesa/signal_map.csv` is a **historical reference only**. Its
7i97T TB3/TB5/TB6 pin assignments are no longer valid because the 7i97T is being
returned to Mesa and replaced with the 7i80HDT + 7i44 + 7i49 + 7i84U + P3
breakout stack.

**Use `mesa/current_pin_authority.csv` as the authoritative pin map.** In
particular:

- Every row with `Mesa Card=7i97T` and `Mesa Conn=TB5/TB6` is stale. The
  underlying signals (X/Y/Z home/limits, E-stop chain, X/Y/Z drive-fault
  inputs, X/Y/Z drive-enable outputs) now live on the **7i80HDT P3 GPIO
  breakout (7i37TA)** as direct FPGA GPIO, not on 7i97T TB5/TB6.
- Every row with `Mesa Card=7i97T` and `Mesa Conn=Analog TB` is stale. The
  analog outputs (X/Y/Z axis command and FR-SX spindle command) now live on
  the **7i49 P2 analog outputs** as `AOUT0/1/2/3`.
- Rows with `Mesa Card=7i49` and `Mesa Conn=Resolver TB` are still valid; the
  7i49 stays in the stack on P2.
- Rows with `Mesa Card=7i84U` are still valid; the 7i84U stays on 7i44 P1
  port 0. See `mesa/current_pin_authority.csv` for the current pin plan,
  including the 2026-08-03 single-7i84U I/O consolidation.

The `signal_map.csv` file is retained on disk so historical commits still
make sense; do not use it for wiring, HAL configuration, or pin planning.
