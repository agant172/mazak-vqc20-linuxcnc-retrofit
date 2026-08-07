# Y soft-limit vs ATC zone — authorization survey

## Audit finding #17 (verbatim)

> `[AXIS_Y] MAX_LIMIT = 9.5000` and `[JOINT_1] MAX_LIMIT = 9.5000` allow
> any G-code, MDI command, or jog to reach the ATC magazine zone with
> nothing but a comment guarding it. LinuxCNC soft limits are global —
> they do not know about the tool-change remap. The retrofit needs a
> real ATC-zone authorization gate; the INI limit cannot serve as one.

## Standing position

**The audit is correct.** In LinuxCNC 2.9, `[AXIS_*]` and `[JOINT_*]`
`MIN_LIMIT` / `MAX_LIMIT` are enforced by the motion controller for
ALL commanded motion — jog, MDI, program, and remap alike. There is no
built-in mechanism to grant temporary authorization for a specific
G-code sub or to distinguish "the tool-change remap needs to reach
+9.5" from "someone typed `G0 Y9.5` in the MDI." The current INI is
therefore not a safety gate. We must add an explicit ATC-zone
authorization guard elsewhere and revert `MAX_LIMIT` back to the
main-envelope value.

## What the LinuxCNC documentation actually says

Per the LinuxCNC 2.9 INI reference, `[AXIS_<letter>]` section
([linuxcnc.org - INI Configuration - [AXIS_<letter>]](https://linuxcnc.org/docs/2.9/html/config/ini-config.html#_axis_letter_section)):

> `MIN_LIMIT = -1000` — "The minimum limit (soft limit) for axis
> motion, in machine units. When this limit is exceeded, the
> controller aborts axis motion. The axis must be homed before
> `MIN_LIMIT` is in force."
>
> `MAX_LIMIT = 1000` — "The maximum limit (soft limit) for axis
> motion, in machine units. When this limit is exceeded, the
> controller aborts axis motion. The axis must be homed before
> `MAX_LIMIT` is in force."

And the corresponding `[JOINT_<num>]` entries
([linuxcnc.org - INI Configuration - [JOINT_<num>]](https://linuxcnc.org/docs/2.9/html/config/ini-config.html#_joint_n_section)):

> `MIN_LIMIT = -1000` — "The minimum limit for joint motion, in
> machine units. When this limit is reached, the controller aborts
> joint motion."
>
> `MAX_LIMIT = 1000` — "The maximum limit for joint motion, in machine
> units. When this limit is reached, the controller aborts joint
> motion."

Nothing in the LinuxCNC 2.9 documentation exempts remap-generated
G-code, tool-change subs, MDI commands, or homed jog moves from these
soft limits. `NO_FORCE_HOMING = 1` only removes the pre-homing
enforcement; it does not lift limits once homed. In short: **the INI
soft limit is a global fence, not an authorization mechanism.**

## What the OEM Mazatrol actually did

From the M-2 parameter recovery
([`docs/parameters_sn060231.md`](parameters_sn060231.md) and the
parameter-recovery method
[`docs/parameter_recovery.md`](parameter_recovery.md)), the OEM stored
**two** soft-limit boxes, not one:

| Corner | X | Y | Z |
|---|---|---|---|
| Main box + | LX1 (+0.0394) | LY1 (+0.0394) | LZ1 (+0.0394) |
| Main box − | LX2 (−39.4094) | LY2 (−30.0394) | LZ2 (−18.1496) |
| ATC box +  | LX3 (+0.0394) | **LY3 (+9.5000)** | LZ3 (+0.0394) |
| ATC box −  | LX4 (−39.4094) | LY4 (+0.0394) | LZ4 (−5.9449) |

The OEM's ATC macro raised the `OTNEG` "soft-OT-neglect" bit before
issuing the ZP2 second-zero-return, and cleared it after the ATC
sequence completed. During normal machining the LY1 = +0.0394 fence
was in force; only inside the OEM-supplied ATC macro could the axis
enter the LY3 = +9.5000 zone. That authorization was tied to the ATC
step chain itself — not exposed to operator MDI or user programs.

The current retrofit collapsed the two boxes into a single union
(`MIN_LIMIT = -30.0394`, `MAX_LIMIT = 9.5000`) and delegated ATC-zone
safety to a code comment. That is the flaw the audit calls out.

## Physical envelope reconciliation

The M-2 parameter dump gives main-envelope travels:

- X:  −39.4094 to +0.0394 → **~39.45 in** (~1002 mm)
- Y:  −30.0394 to +0.0394 → **~30.08 in** (~764 mm)
- Z:  −18.1496 to +0.0394 → **~18.19 in** (~462 mm)

These closely match published Mazak VQC 20/40 travel specs
(commonly quoted as X ~1000 mm / Y ~760-810 mm / Z ~460 mm; earlier
notes citing "635/508/460 mm" appear to have been an unrelated
mid-size machine, not this one). The recovered M-2 numbers are
authoritative for this specific serial number; the "635/508/460" note
should be treated as suspect and removed from the wiki when we next
touch it.

## Proposed corrective design

### 1. INI: revert `[AXIS_Y]` and `[JOINT_1]` `MAX_LIMIT` to the main-envelope value

```ini
[AXIS_Y]
MIN_LIMIT = -30.0394
MAX_LIMIT =   0.0394   ; LY1 - main machining envelope, NOT the ATC zone

[JOINT_1]
MIN_LIMIT = -30.0394
MAX_LIMIT =   0.0394
```

Once this change lands, any G-code, MDI, or jog that would drive Y
above the main-envelope fence is aborted by the motion controller. The
remap can no longer reach `Y +9.5000` either — because the remap runs
inside the same motion controller and is bound by the same limits.

### 2. Grant ATC-zone motion via a dedicated user M-code, not by widening the fence

LinuxCNC supports arbitrary user M-codes (`M100`-`M199`) and remapped
motion in a way that lets us build an explicit authorization step.
The simplest supportable pattern:

- Define a `atc-zone-permit` HAL signal that gates a soft flag inside
  a small custom HAL component (`mazak_atc_zone`).
- Provide two user M-codes:
  - `M100` — request ATC-zone permit (asserts a bit, waits for a
    confirmation input latch, then allows the caller to proceed).
  - `M101` — clear ATC-zone permit (drops the bit).
- The remap asserts `M100` immediately before the `G53 G0 Y#<y_ref2>`
  move and asserts `M101` after `G53 G0 Y#<y_ref1>` on the way out.
- With the permit asserted, `[AXIS_Y] MAX_LIMIT` is dynamically
  raised to `+9.5000` via `halcmd setp axis.y.max-pos-limit 9.5000`
  (LinuxCNC exposes `axis.<L>.max-pos-limit` / `min-pos-limit` as
  writable pins). When the permit is cleared, the limit drops back to
  `+0.0394`.

This preserves the LinuxCNC-native soft-limit enforcement path (still
the motion controller doing the checking) while making the authorization
explicit, revocable, and observable in HAL. Attempts from user G-code
or MDI to reach the ATC zone without going through `M100` will be
aborted exactly the same as any other soft-limit violation.

### 3. Belt-and-braces: gate the permit on the physical PRS-55 / PRS-66 zone switches

The 7i84U-A inputs already read the OEM proximity zone switches:

- `atc-y-zone` on IN0 (PRS-55, Y in ATC area)
- `atc-z-zone` on IN1 (PRS-66, Z in ATC area)

The `mazak_atc_zone` component should require:

1. Machine homed on all three axes.
2. No E-stop, no drive-fault.
3. Spindle oriented (`mazak-orient.oriented-latch` TRUE) before the
   permit will assert.
4. Z above the ATC-area floor (`Z >= -5.9449`) before Y is authorized
   into the ATC zone.
5. `atc-y-zone` remains consistent with commanded Y position — if the
   proximity switch disagrees with commanded position by more than a
   configurable tolerance for more than a configurable time, the
   permit is dropped and an alarm is raised.
6. Once the permit drops, `axis.y.max-pos-limit` is written back to
   `+0.0394` immediately (before the next servo cycle).

### 4. Update the remap to obtain the permit explicitly

Pseudocode inside `linuxcnc/remap/toolchange.ngc`:

```gcode
G53 G0 Z#<z_ref2>       ( ZP2 clearance height first, always )
M64 P6                  ( SOME2 orient request )
M66 P5 L3 Q#<t_orient>  ( wait SOSA oriented latch )
...
M100                    ( request ATC-zone permit; blocks until granted or fault )
G53 G0 Y#<y_ref2>       ( now legal: axis.y.max-pos-limit was raised to +9.5 )
...
G53 G0 Y#<y_ref1>       ( back inside main envelope )
M101                    ( clear ATC-zone permit; max-pos-limit reverts to +0.0394 )
```

`M100` must implement a fault-injectable timeout so a stuck permit
doesn't leave the fence open. The permit-drop is timed by the
component watchdog, not the remap.

### 5. Follow-up survey work required on the physical machine

- [ ] Measure and confirm PRS-55 / PRS-66 activation positions
  relative to the raised Y and Z reference points; log measurements
  under `docs/commissioning_logs/`.
- [ ] Confirm the mechanical stops beyond the LY3 (+9.5000) position
  (hard bumper, extra proximity switch, or both?). The soft limit is
  not a substitute for a physical over-travel stop.
- [ ] Confirm from the M-2 dump whether the OEM enforces the ATC-box
  Z floor (LZ4 = −5.9449) via OTNEG only during the ATC macro; the
  retrofit should match this — Z must not be allowed below −5.9449
  while Y is in the ATC zone, regardless of who commanded the move.
- [ ] Remove the stale "635 / 508 / 460 mm" travel figures from the
  wiki when it is next touched; the M-2 dump values are authoritative
  for this serial number.

## What has changed in the repo (this commit)

- New `docs/y_soft_limit_atc_zone.md` — this document.
- `linuxcnc/mazak_vqc_20_40.ini` — `[AXIS_Y]` and `[JOINT_1]`
  `MAX_LIMIT` reverted to `+0.0394` (LY1, main envelope). The prior
  `+9.5000` value stays in `[ATC] REF2_Y` as the target position the
  ATC permit must authorize; it is no longer the standing global
  limit.
- `docs/project_status.md` — TODO item added to design and commission
  the `mazak_atc_zone` component and `M100`/`M101` permit pair.

**The remap is intentionally left as-is in this commit** and will
NOT tool-change until the `mazak_atc_zone` component and `M100`/`M101`
pair are implemented and validated. `[ATC] DRY_RUN = 1` remains set in
the INI, which already blocks any real ATC motion. This is deliberate:
the fix removes the unsafe fence widening before it removes the ATC
capability, and we do not want the remap to appear to work while the
authorization pathway is still being built.

## Sources

- LinuxCNC 2.9 INI Configuration reference, `[AXIS_<letter>]` and
  `[JOINT_<num>]` sections:
  [https://linuxcnc.org/docs/2.9/html/config/ini-config.html#_joint_n_section](https://linuxcnc.org/docs/2.9/html/config/ini-config.html#_joint_n_section)
- LinuxCNC 2.9 INI Configuration reference, `[AXIS_<letter>]`
  `MIN_LIMIT` / `MAX_LIMIT`:
  [https://linuxcnc.org/docs/2.9/html/config/ini-config.html#_axis_letter_section](https://linuxcnc.org/docs/2.9/html/config/ini-config.html#_axis_letter_section)
- Repo cross-references (internal): `docs/parameters_sn060231.md`,
  `docs/parameter_recovery.md`, `docs/ladder/atc_ladder_transcription.md`,
  `linuxcnc/mazak_vqc_20_40.ini`, `linuxcnc/remap/toolchange.ngc`,
  `linuxcnc/atc_orient.hal`, `linuxcnc/field_7i84u.hal`,
  `docs/estop_safety_chain.md`, `docs/frsx_orient_model.md`.
