# Servo commissioning — velocity-mode outer loop

This mill retains the OEM Mitsubishi TRA-type DC servo drives. Each TRA drive
already closes an **inner velocity loop on its own tachogenerator** (Tamagawa
TGF-3D P402-Sx integral to the HD-101 / HD-81 motors). LinuxCNC on the 7i49
is the **outer position loop** driving those drives with an analog velocity
reference on AOUT0/1/2 (X/Z/Y) via `hm2_7i80.0.pwmgen.NN`. Resolver feedback
on RES0/1/2 closes the position loop.

The retrofit files ship with **all PID gains at zero**, `MAX_OUTPUT = 10.0`,
`OUTPUT_SCALE = 1.0`, and `FF0 = FF1 = FF2 = 0`. Those are safe placeholders —
they hold the drive command at zero — but they will not produce motion, and
naively cranking `P` before the volts-per-speed calibration is established is
how you get runaway, oscillation, or an axis into a hard stop.

This document is the reproducible commissioning procedure. Do it once per
axis, one axis at a time, logged, before enabling automatic motion.

## Scale semantics (read this before touching anything)

Per the [HostMot2 PWMGen doc](https://linuxcnc.org/docs/2.9/html/man/man9/hostmot2.9.html#PWMGen):

> Scaling factor to convert "value" from arbitrary units to duty cycle:
> `dc = value / scale`. Duty cycle has an effective range of -1.0 to +1.0
> inclusive, anything outside that range gets clipped.

On the **7i49** the pwmgen output feeds a bipolar ±10 V analog output stage,
so **duty ±1.0 = ±10 V**. The pwmgen `scale` alone does not set voltage —
it sets the mapping from `pid.output` (which has physical units, typically
machine velocity in in/s) to duty:

| scale | value  | duty (dc = value/scale) | 7i49 analog out |
|------:|-------:|------------------------:|----------------:|
| 1.0   | 1.0    | 1.0                     | +10 V (full)    |
| 10.0  | 1.0    | 0.10                    | +1.0 V          |
| 1.0   | 0.1    | 0.10                    | +1.0 V          |
| 10.0  | 10.0   | 1.0                     | +10 V (full)    |

So **`scale = MAX_VELOCITY` (in in/s) maps `pid.output = MAX_VELOCITY` → ±10 V**.
That is the intended "unity feed-forward" default: if the TRA drive is
calibrated so 10 V equals MAX_VELOCITY, then `FF1 = 1.0` will produce the
right voltage for any commanded speed. **Whether the TRA drive is actually
calibrated that way is unknown and must be measured** — that is what step 3
below is for.

**PID output units.** From the [LinuxCNC PID doc](https://linuxcnc.org/docs/2.9/html/man/man9/pid.9.html):
> When using **FF1** tuning, scaling must be set so that output is in user
> units per second.

That is the anchor of this procedure: pwmgen `scale` must be set so that a
PID output of 1 user unit per second corresponds to whatever voltage the TRA
drive interprets as 1 user unit per second of commanded velocity.

## Prerequisites (all commits before commissioning)

- Resolver wiring identified with an ohmmeter, DC resistance matched to the
  specific TS2014N suffix datasheet, and the 7i49 confirmed as the sole
  excitation source. See [architecture_decision.md](architecture_decision.md).
- `RESOLVER_SCALE` and `RESOLVER_VELOCITY_SCALE` **measured and set** per
  axis (rawcounts vs dial indicator, signed). Placeholder 1.0 must not
  remain. See [project_status.md](project_status.md) resolver-scale task.
- 7i84U-B safety inputs (limits/homes) confirmed and their polarity choice (raw `input-NN` vs `-not` complement pin, per [sserial(9)](https://linuxcnc.org/docs/html/man/man9/sserial.9.html))
  set. E-stop chain proven to remove drive power.
- Drive-enable outputs on 7i84U-B TB3 OUT0/1/2 wired and their coil
  polarities measured.
- Renishaw MP-3 probe SKIP1 on 7i84U-B TB3 IN15 idle-verified.
- All 7i49 analog outputs measured at zero command: `hm2_7i80.0.pwmgen.NN.value = 0`
  with pwmgen enabled must produce **≤ 50 mV at AOUT_N** on a DMM. Any offset
  larger than that is a null problem, not a tuning problem.

## Commissioning procedure (repeat per axis: X → Y → Z)

### Step 1 — Isolate the axis under test

- Disconnect drive-enable outputs to the two axes **not** under test at the
  interposing relay or the drive input, so only one axis can move.
- Physically block or restrain any tooling that could be damaged if the axis
  moves. Move the table/head to the middle of travel.
- Confirm hard limit switches actuate the drive-power contactor
  independently of LinuxCNC (hardware chain, not HAL-only).
- Enable the machine, but keep the emergency stop hand within reach.

### Step 2 — Baseline zero-command null check

Set all PID gains and feed-forwards to zero (already the default). With the
drive enabled and LinuxCNC in Machine On but not homed:

- `halcmd setp hm2_7i80.0.pwmgen.NN.value 0`
- Measure AOUT_N at the 7i49 terminal with a DMM (µV/mV range). Record.
- Expected: |AOUT_N| ≤ 50 mV. Larger offsets → check pwmgen `output-type`,
  `offset-mode`, `enable`, and any HAL sum2 wiring on `pid.N.output`.

Do **not** proceed past this step until the null is clean.

### Step 3 — Volts-per-speed calibration (open loop)

Goal: establish how many volts the TRA drive needs to command a known speed.

- Set `MAX_OUTPUT` for the axis to a conservative fraction of full drive
  during this test: e.g. `MAX_OUTPUT = 0.10` (pid.output limited to ±0.10;
  with `OUTPUT_SCALE = 1.0`, duty limited to ±0.10, i.e. ±1.0 V at AOUT).
- Set `MAX_VELOCITY` in the axis section to a conservative value: e.g.
  0.05 in/s (3 in/min) for this test.
- With the drive enabled and axis clear to move, drive a slow jog by
  directly writing `pid.N.output` from `halcmd` in single steps:
  - `halcmd setp pid.x.output 0.05` (0.5 V at 7i49 AOUT0 with default scale).
  - Observe axis motion direction. If wrong, **do not negate the gain**;
    flip the sign in `RESOLVER_SCALE` (per HostMot2 doc) or fix the
    resolver-pair identification. Confirm from the PID doc's warning:
    "If some output is in the wrong direction, negating gains to fix it is
    a mistake; set the scaling correctly elsewhere instead."
  - Time the axis over a measured travel (dial indicator or scale rule) to
    get the **actual velocity** at 0.5 V drive command.
  - Repeat at 1.0 V, 1.5 V (each with an intermediate `setp pid.x.output`).
  - Record: `(volts_at_AOUT, measured_in_per_sec)` — three or four points.
- Compute the linear fit: `k = velocity / voltage` (in/s per volt).
- **Set `OUTPUT_SCALE`** to `10 / k_max_velocity_over_full_range` so that
  `pid.output = MAX_VELOCITY` maps to ±10 V. In practice the shortcut is:
  `OUTPUT_SCALE = MAX_VELOCITY` in in/s **only** if the drive is calibrated
  so 10 V = MAX_VELOCITY. Adjust MAX_VELOCITY (in the INI) to match what
  the drive actually delivers at 10 V, or trim the TRA drive gain
  potentiometer (per Mitsubishi TRA manual) to align 10 V with the axis's
  intended top speed.
- Restore `MAX_OUTPUT` to a still-conservative value (see step 5).

### Step 4 — FF1 first (before any P gain)

Per the PID doc, "When using FF1 tuning, scaling must be set so that output
is in user units per second." That has now been done in step 3.

- Set `FF1 = 1.0` in the axis section.
- Leave `P = I = D = 0`, `FF0 = FF2 = 0`, `DEADBAND = 0`, `BIAS = 0`.
- Jog the axis at a modest commanded velocity (e.g. `MAX_VELOCITY = 0.5 in/s`
  ceiling). Observe the following error (`joint.N.f-error`) in Halscope.
- Adjust FF1 to minimise the steady-state following error at constant
  velocity. Typical result: FF1 near 1.0 if scaling and drive gain are
  correctly matched; a persistent 5-20% offset indicates the drive gain
  and `OUTPUT_SCALE` are not yet aligned — return to step 3.

### Step 5 — P gain (residual position error)

- Add `P` in small steps (start at 5, then 10, 25, 50) with FF1 already set.
- After each P step, jog and observe following error transient during
  accel/decel. Target: FE settles inside `FERROR` within one servo period
  or two.
- Stop increasing P at the first sign of oscillation, whine, or overshoot.
  Back off ~25%.

### Step 6 — I and D (only if needed)

- **I** is for eliminating residual steady-state bias only. If FF1 tuning is
  correct, steady-state error should already be near zero and I is often
  not needed. Add small I only if there is a slow, persistent drift toward
  or away from commanded position. Keep `MAXERRORI` (or `maxerrorI`) small
  to prevent windup — the PID doc: "Can be used to prevent integrator
  windup and the resulting overshoot during/after sustained errors."
- **D** is rarely useful with a healthy velocity-loop inner drive. If
  overshoot at end of moves is a problem after P is tuned, add D cautiously
  in very small increments; excessive D amplifies resolver noise.

### Step 7 — Following-error limits and rollback criteria

At the end of the tuning session, restore or set:

- `FERROR` per axis to a value slightly larger than the worst-case
  steady-state FE observed during rapid moves. Typical starting value
  0.010–0.050 in.
- `MIN_FERROR` for low-speed moves (default 0.010 in is reasonable).
- `MAX_ERROR` (the PID error clamp) to about 2× FERROR, so the PID cannot
  wind up beyond a recoverable range if there is a stall or mis-scale.
- `MAX_OUTPUT` back to 10.0 (full range) only after tuning is verified.

**Rollback criteria.** Revert to the committed placeholder values (all gains
0, MAX_OUTPUT = 10.0, OUTPUT_SCALE = 1.0) and re-open the resolver /
volts-per-speed measurement if any of the following occurs during the
session:

- Axis moves the wrong direction under low command (do not negate gains —
  fix scaling instead).
- Any following-error trip during a slow jog with FF1 = 1.0 and P = 0.
- Oscillation on release of jog command with only FF1 set (indicates the
  drive's own velocity loop is fighting the position loop; the drive gain
  needs to be trimmed at the TRA, not compensated for by LinuxCNC).
- Any position drift toward a limit with `pid.N.output = 0`.
- Drive fault (contactor drop, drive alarm output) at any commanded voltage.

## Logging

For each axis, record the following in a per-axis commissioning log file
(under `docs/commissioning_logs/<axis>_YYYYMMDD.md`):

- Environment: LinuxCNC version, HAL/INI git commit hash, machine temp,
  operator.
- Zero-command null: measured AOUT_N with `pwmgen.NN.value = 0`.
- Volts-per-speed table: measured (V, in/s) pairs and computed `k`.
- Final settings after each step: `OUTPUT_SCALE`, `MAX_VELOCITY`, `FF1`,
  `P`, `I`, `D`, `DEADBAND`, `BIAS`, `MAX_OUTPUT`, `MAX_ERROR`, `FERROR`,
  `MIN_FERROR`.
- Halscope trace files or screenshots of jog and rapid moves showing
  following-error against time.
- Any deviations from this procedure and why.

## Sources

- [LinuxCNC PID(9) man page](https://linuxcnc.org/docs/2.9/html/man/man9/pid.9.html)
  — feed-forward semantics, tuning warnings, integrator windup, direction/sign
  warning, and the exact FF1-scaling requirement quoted above.
- [HostMot2(9) PWMGen section](https://linuxcnc.org/docs/2.9/html/man/man9/hostmot2.9.html#PWMGen)
  — the `dc = value / scale` relationship, output-type meanings, offset-mode,
  and PWM/PDM frequency defaults.
- [7i49 manual](http://www.mesanet.com/pdf/motion/7i49man.pdf) — bipolar
  ±10 V analog output stage that turns pwmgen duty into an analog velocity
  reference.
- Mitsubishi TRA-31 drive manual (in-cabinet drive parameter and gain
  trim reference) — see this repo's `bom` and `docs/architecture_decision.md`
  Sources list.
