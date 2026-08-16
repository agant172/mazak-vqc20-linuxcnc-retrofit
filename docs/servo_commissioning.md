# Servo commissioning — velocity-mode outer loop

> **ROLE: COMMISSIONING (D10)** — executed under power, after installation. Order of procedures: [../INSTALL_SPINE.md](../INSTALL_SPINE.md) Appendix B.


This mill retains the OEM Mitsubishi TRA-type DC servo drives. Each TRA drive
already closes an **inner velocity loop on its own tachogenerator** (Tamagawa
TGF-3D P402-Sx integral to the HD-101 / HD-81 motors). LinuxCNC on the 7i49
is the **outer position loop** driving those drives with an analog velocity
reference on AOUT0/1/2 (X/Z/Y) via `hm2_7i80.0.pwmgen.NN`. Resolver feedback
on RES0/1/2 closes the position loop.

The retrofit files ship with **all PID gains at zero**, `MAX_OUTPUT = 0.10`,
`OUTPUT_SCALE = 1.0`, and `FF0 = FF1 = FF2 = 0`. Those are fail-off
commissioning placeholders when used with the checked-in output holds —
the zero gains/bias hold the command at zero while the output clamp limits an
accidental nonzero command to 10% of the placeholder scale — but they will not produce motion, and
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

## Prerequisites (all complete before commissioning)

- Resolver wiring identified with an ohmmeter, DC resistance matched to the
  specific TS2014N suffix datasheet, and the 7i49 confirmed as the sole
  excitation source. See [architecture_decision.md](architecture_decision.md).
- `RESOLVER_SCALE` and `RESOLVER_VELOCITY_SCALE` **measured and set** per
  axis (rawcounts vs dial indicator, signed). Placeholder 1.0 must not
  remain. See [project_status.md](project_status.md) resolver-scale task.
- 7i84U-B limit/home monitoring inputs confirmed and their polarity choice
  (raw `input-NN` vs `-not` complement pin, per
  [sserial(9)](https://linuxcnc.org/docs/html/man/man9/sserial.9.html)); these
  are not a safety-rated substitute for the hardwired chain.
- Hardwired E-stop chain proven to remove drive power.
- Drive-enable outputs on 7i84U-B TB3 OUT0/1/2 wired and their coil
  polarities measured. Confirm each MELDAS ALM input and its raw/complement
  HAL polarity before clearing `drive-output-permit`.
- Renishaw MP-3 probe SKIP1 on 7i84U-B TB3 IN15 idle-verified.
- All 7i49 analog outputs measured at zero command with the corresponding
  physical S-ON path disconnected, HAL enable asserted, and `pid.N.bias = 0`:
  `hm2_7i80.0.pwmgen.NN.value` must read zero and AOUT_N must produce
  **≤ 50 mV** on a DMM. Any offset
  larger than that is a null problem, not a tuning problem.

## Commissioning procedure (repeat per axis: X → Y → Z)

### Step 1 — Isolate the axis under test

- Disconnect drive-enable outputs to the two axes **not** under test at the
  interposing relay or the drive input, so only one axis can move. Keep the
  test axis S-ON path disconnected for the energized-DAC null check in step 2;
  reconnect it only for the low-voltage motion test in step 3.
- Physically block or restrain any tooling that could be damaged if the axis
  moves. Move the table/head to the middle of travel.
- Confirm hard limit switches actuate the drive-power contactor
  independently of LinuxCNC (hardware chain, not HAL-only).
- Enable the machine, but keep the emergency stop hand within reach.

### Step 2 — Baseline zero-command null check

Set all PID gains, feed-forwards, and bias to zero (already the default). With
LinuxCNC in Machine On, the test axis's physical S-ON path disconnected, and
the HAL output gate enabled under the signed commissioning hold:

- `halcmd setp pid.N.bias 0`
- Confirm `halcmd getp pid.N.output` and
  `halcmd getp hm2_7i80.0.pwmgen.NN.value` both report zero. Do not try to
  `setp` either output pin; they are driven pins linked by the active HAL.
- Measure AOUT_N at the 7i49 terminal with a DMM (µV/mV range). Record.
- Expected: |AOUT_N| ≤ 50 mV. Larger offsets → check pwmgen `output-type`,
  `offset-mode`, `enable`, and any HAL sum2 wiring on `pid.N.output`.

Do **not** proceed past this step until the null is clean.

### Step 3 — Volts-per-speed calibration

Goal: establish how many volts the TRA drive needs to command a known speed.
There are two allowed paths:

1. **Uncoupled bench path:** the motor is mechanically disconnected from the
   ballscrew and restrained in an approved fixture. Use a dedicated calibration
   HAL configuration with no motmod/joint connection, a spring-return deadman,
   a hardware voltage limit, and the other drives physically disabled. A small
   bias may then be stepped while measuring AOUT and motor speed. The active
   machine HAL is not the bench fixture.
2. **Installed-axis path:** keep the outer position loop closed and use normal
   LinuxCNC jog commands at the first-move plan's lowest approved velocity.
   Establish a conservative preliminary scale from verified mechanical speed
   and drive data, add only enough P for controlled tracking, then measure AOUT
   and actual steady velocity. Do **not** inject PID bias with P/I/D/FF terms at
   zero on a coupled axis; that deliberately moves feedback away from command
   and can cause a following-error trip or uncontrolled travel.

For either path:

- Keep the initial output authority at the signed first-move limit and prove
  stop distance before increasing it.
- Verify command direction against the already verified feedback direction.
  Correct analog polarity in wiring or one documented sign stage; do not negate
  verified feedback or PID gains to hide a command-polarity error.
- Record at least three `(volts_at_AOUT, measured_machine_units_per_second)`
  points in the linear low-speed region, in both directions where safe.
- Compute the linear fit: `k = velocity / voltage` (in/s per volt).
- **Set `OUTPUT_SCALE = 10 × k`**, in machine units per second. Derivation:
  the 7i49 produces `V = 10 × pid.output / OUTPUT_SCALE`, while the measured
  drive response is `velocity = k × V`; unity engineering scaling therefore
  requires `OUTPUT_SCALE = 10k`. Do not substitute `10/k`.
- Keep LinuxCNC `MAX_VELOCITY` at or below the machine's approved mechanical
  limit; do not change it merely to match drive gain. Set `MAX_OUTPUT` to a
  reviewed engineering-unit limit no greater than the approved axis velocity,
  with only the small additional authority justified by following-error tests.

### Step 4 — FF1 first (before any P gain)

Per the PID doc, "When using FF1 tuning, scaling must be set so that output
is in user units per second." That has now been done in step 3.

- Set `pid.N.bias` back to exactly 0 and verify zero command voltage before
  enabling FF1.
- Set `FF1 = 1.0` in the axis section.
- Leave `P = I = D = 0`, `FF0 = FF2 = 0`, `DEADBAND = 0`, `BIAS = 0`.
- Jog at the velocity and travel window approved by the first-move plan.
  Observe the following error (`joint.N.f-error`) in Halscope.
- Adjust FF1 to minimise the steady-state following error at constant
  velocity. Typical result: FF1 near 1.0 if scaling and drive gain are
  correctly matched; a persistent 5-20% offset indicates the drive gain
  and `OUTPUT_SCALE` are not yet aligned — return to step 3.

### Step 5 — P gain (residual position error)

- Add `P` in small reviewed steps selected from the measured drive/axis
  response; this repo does not prescribe numeric gain increments.
- After each P step, jog and observe following error transient during
  accel/decel. Establish the acceptable settling envelope from the machine's
  trajectory, accuracy, and following-error budget rather than an arbitrary
  one- or two-servo-cycle target.
- Stop increasing P at the first sign of oscillation, whine, or overshoot.
  Return to the last logged stable value and review the trace before proceeding.

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

- `FERROR` and `MIN_FERROR` from the measured velocity-dependent following
  error plus the accuracy and safe-stop budget; do not copy a generic inch
  value.
- `MAX_ERROR` (the PID error clamp) from the recoverable-error analysis. It
  must limit windup without masking a stall or scale error; no fixed multiple
  of `FERROR` is asserted here.
- `MAX_OUTPUT` to the signed engineering-unit authority approved from the
  measured drive response and stop-distance test. Do not restore the former
  arbitrary value of 10.0.

Before accepting the axis, fault-inject both inputs to its combined fault OR:
trip the MELDAS ALM path and induce a resolver channel error using a
Mesa-approved low-energy method. In each case verify `joint.N.amp-fault-in`,
the physical S-ON output, PID enable, and pwmgen enable all drop and require a
manual restart/reset.

**Rollback criteria.** Revert to the committed placeholder values (all gains
and bias 0, MAX_OUTPUT = 0.10, OUTPUT_SCALE = 1.0) and re-open the resolver /
volts-per-speed measurement if any of the following occurs during the
session:

- Axis moves the wrong direction under low command (do not negate gains or
  the already-verified feedback scale; correct the analog command polarity).
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
