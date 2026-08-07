# Resolver identification, phasing, and scale procedure

Status: procedure only. No axis has passed it. Keep `drive-output-permit` FALSE
and physically inhibit every S-ON path during all checks in this document.

## Per-axis record

Complete one row for X, Y, and Z before applying resolver excitation:

| Field | X | Y | Z |
|---|---|---|---|
| Full Tamagawa part/suffix | | | |
| Datasheet and revision | | | |
| Rotor pair / DC resistance | | | |
| SIN pair / DC resistance | | | |
| COS pair / DC resistance | | | |
| Each winding to case/shield | | | |
| 7i49 channel | RES0 | RES1 | RES2 |
| Cable/shield inspection | | | |
| Reviewer/date | | | |

The TS2014N141E26 values elsewhere in the repo are tentative comparison data,
not proof of the suffix installed on an axis. Stop if resistance, insulation,
or pair identity does not agree with the exact suffix data.

## Power-off identification

1. Isolate the old resolver electronics so no second circuit can excite or
   load a winding. Prove isolation with continuity and voltage checks.
2. Identify all three winding pairs with an ohmmeter. Record conductor labels
   and resistance; do not infer pairs from inherited names/colors.
3. Check every conductor to the resolver case and cable shield. Resolve any
   unintended connection before proceeding.
4. Wire the verified excitation pair to RESDRV and the two matched output pairs
   to RESSIN/RESCOS. Use the 7i49 connector table in
   [`grounding_shielding_plan.md`](grounding_shielding_plan.md).
5. Confirm the three pair shields terminate at the 7i49 end only and that the
   old control/drive no longer owns any resolver winding.

## Excitation and return proof

The checked-in 5 kHz value is a working baseline because 4.5 kHz is not a 7i49
selection. It is not proof of compatibility with an unread suffix.

1. Keep S-ON physically open and the axis mechanically secured; support Z so a
   brake mistake cannot drop the head.
2. Energize only the control/7i49 path under the approved hold point.
3. Scope RESDRV differentially at the card and resolver ends. Record RMS
   voltage, frequency, waveform, and cable drop.
4. Scope RESSIN and RESCOS differentially. Record amplitude, phase, DC offset,
   noise, and any clipping at several manually established shaft positions.
5. Compare with the exact resolver suffix data and 7i49 requirements. If the
   return is outside the interface range or noisy, stop and obtain Mesa/PCW
   review; do not add dividers, change hardware, or alter excitation blindly.
6. Save captures under `docs/commissioning_logs/resolver_traces/` with axis,
   date, probe setup, and grounding reference in the filename/log.

## Direction, phasing, and scale with drive torque disabled

1. Establish the positive machine direction from the Mazak coordinate system
   and physical travel drawing.
2. Move the mechanism using an approved manual/service method, or rotate the
   ballscrew a known number of turns with the drive mechanically unable to
   produce torque. Do not use a powered jog for this D8 proof.
3. Record `resolver.NN.rawcounts`, `position`, dial-indicator travel, screw
   turns, and direction before/after the move.
4. Calculate machine units per resolver electrical revolution, including any
   coupling/reduction. Populate `RESOLVER_SCALE` and
   `RESOLVER_VELOCITY_SCALE` with the same signed machine-units/revolution value
   only after the result repeats over multiple revolutions and both directions.
5. Use a negative scale when required for coordinate direction. Do not swap
   powered conductors, negate PID gains, or reverse a previously verified
   command path as a shortcut.
6. Confirm switch-based homing remains configured; the HostMot2 resolver's
   emulated index is not accepted for axis index homing.

## Fault and noise acceptance

- Prove each resolver `.error` input reaches the corresponding combined axis
  fault and `joint.N.amp-fault-in` using a Mesa-approved, low-energy test.
- Operate nearby relays/contactors one at a time while logging return signals,
  resolver velocity/error, and packet faults. Apply the signed acceptance
  budget from [`grounding_shielding_plan.md`](grounding_shielding_plan.md).
- Any discontinuity, clipping, unexplained position step, direction reversal,
  or repeatable switching correlation fails this procedure.

## Sign-off

For each axis attach the completed record, photos, scope captures, calculation,
final INI values, and independent reviewer signature. Only then may that axis
enter [`first_move_plan.md`](first_move_plan.md).

## Sources

- [Mesa 7i49 manual](https://www.mesanet.com/pdf/motion/7i49man.pdf)
- [LinuxCNC HostMot2 resolver documentation](https://linuxcnc.org/docs/2.9/html/man/man9/hostmot2.9.html)
- Exact per-axis Tamagawa datasheet: **not yet captured**
