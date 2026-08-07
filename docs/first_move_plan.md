# First powered axis-move plan

Status: procedure drafted; machine-specific values and signatures are blank.
Do not execute this plan until the completed sheet is independently reviewed.

## Hold-point prerequisites

- [ ] D1 as-built one-line/terminal plan signed.
- [ ] D4 I/O checkout signed for the selected axis, limits, fault, S-ON, and
      E-stop monitor.
- [ ] D5 hardwired E-stop chain and fault-injection evidence signed.
- [ ] D7 enable/fault/Z-brake timing evidence signed for the selected axis.
- [ ] D8 resolver record and signed scale complete.
- [ ] D11 physical travel, limit locations, and measured stop margin complete.
- [ ] D14 exact-host hm2_eth/watchdog tests complete.
- [ ] Firmware hash, IDROM/readhmid dump, HAL pin dump, and configuration commit
      recorded below.

## Frozen test configuration

| Item | Value |
|---|---|
| Git commit / diff reference | |
| Bitfile filename + SHA-256 | |
| IDROM/readhmid log | |
| HAL pin dump | |
| Selected axis | **NONE — fill X, Y, or Z** |
| Reason this axis has the lowest consequence | |
| Commanded first direction | |
| Usable clearance in that direction | |
| Worst measured stop distance and test case | |
| Required residual margin | |
| `OUTPUT_SCALE` | |
| `MAX_OUTPUT` and measured maximum AOUT voltage | |
| Predicted maximum speed at clamp | |
| `MAX_VELOCITY` / `MAX_ACCELERATION` | |
| `FERROR` / `MIN_FERROR` and basis | |
| Preliminary PID/FF values and basis | |

Do not select Z first until the spring-set brake, fixed delay sequence, holding
capacity, and safe support/cribbing have been proven. An analog-command clamp
limits velocity reference; it is not a torque limit.

## Personnel and physical setup

- Two people are required: operator and independent E-stop observer.
- Remove tools, fixtures, loose hardware, and personnel from the envelope.
- Put the selected axis near the center of its independently measured travel.
- Physically disconnect S-ON for the two untested axes. For Z, install the
  approved mechanical support before touching brake/S-ON wiring.
- Verify the commanded direction has more clearance than the signed stop
  distance plus margin. Mark the no-cross boundary physically.
- Identify the E-stop button the observer will use and prove it drops the
  hardwired chain immediately before the move.

## Staged test

1. **Cold continuity:** power isolated; repeat S-ON/fault/limit continuity and
   confirm no unapproved jumper or bypass exists.
2. **Control power only:** both static commissioning holds FALSE. Start
   LinuxCNC and confirm every physical drive-enable and analog enable remains
   off, all expected feedback pins exist, and no resolver/packet fault is set.
3. **Feedback direction:** with drive torque disabled, repeat a small approved
   manual displacement and verify actual-position sign and scale.
4. **Analog zero:** physically open selected-axis S-ON, enable only the approved
   DAC test path, and verify zero command/voltage per
   [`servo_commissioning.md`](servo_commissioning.md). Return the static hold to
   FALSE before changing wiring.
5. **Drive enable at zero command:** restore S-ON wiring, energize under the
   signed hold, and assert the selected-axis enable with zero motion command.
   Verify no drift, correct ready/fault state, and—for Z only—the measured brake
   release/engage sequence. Abort on any displacement.
6. **First move:** use a normal closed-loop LinuxCNC jog—not an open-loop PID
   bias—at the recorded direction, speed, acceleration, clamp, and travel
   window. Stop after the smallest movement that proves direction and feedback.
7. **Stop/fault proof:** repeat only after the first trace is reviewed. Within
   the approved window test normal stop, feed hold, drive fault, and E-stop,
   recording physical stop distance and all inhibit signals.
8. **Opposite direction:** recompute clearance and repeat the same signed
   process. Do not infer it from the first direction.

## Immediate abort criteria

Abort and isolate power for wrong direction, unexplained motion at zero command,
following error, resolver error, drive alarm, limit transition, packet error,
watchdog bite, brake sequencing discrepancy, unexpected noise, or loss of any
observer/instrument. Do not attempt a recovery move.

## Rollback

1. E-stop and isolate hazardous power; verify the shared DC bus is below the
   exact service threshold.
2. Return `drive-output-permit` to FALSE in a reviewed configuration edit and
   restart LinuxCNC. Physically disconnect S-ON until the event is understood.
3. Restore the logged zero-gain/low-authority baseline; never use ad-hoc
   `halcmd sets` to bypass the commissioning hold.
4. Preserve the HAL log, Halscope trace, meter/scope readings, alarm text, and
   configuration diff. Open a finding and require independent review before a
   retry.

## Sign-off

| Role | Name | Signature/date |
|---|---|---|
| Commissioner | | |
| E-stop observer | | |
| Independent reviewer | | |
