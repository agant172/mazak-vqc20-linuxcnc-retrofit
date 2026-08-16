# Grounding, shielding, and noise-acceptance plan

This is a commissioning design worksheet, not an as-built drawing. Cable
lengths, routes, conductor sizes, shield terminations other than the explicit
7i49 resolver rule, and PE/functional-ground bonds remain unverified until they
are drawn from the cabinet and checked against the exact equipment manuals.

## Primary-source facts

The Mesa [7i49 manual](https://www.mesanet.com/pdf/motion/7i49man.pdf)
requires each resolver channel to use three individually shielded twisted
pairs—RESDRV, RESSIN, and RESCOS—and says the shields terminate at the 7i49 end
only. It provides the following terminal map:

| Axis / channel | Connector | RESSIN | RESCOS | RESDRV | Local shield/GND |
|---|---|---|---|---|---|
| X / 0 | P4 | pins 1/2 | pins 3/4 | pins 6/7 | pin 5 or 8 |
| Z / 1 | P4 | pins 9/10 | pins 11/12 | pins 14/15 | pin 13 or 16 |
| Y / 2 | P3 | pins 1/2 | pins 3/4 | pins 6/7 | pin 5 or 8 |

No source presently in the repository establishes a universal cable-length,
capacitance, pigtail-length, noise-voltage, or separation-distance limit for
this machine. The 7i49 resolver shield instruction must not be generalized to
the ±10 V drive-command cables without checking the MELDAS/FR-SX manuals and
the as-built commoning scheme.

## Required as-built cable schedule

Before drive power, create a signed schedule with one row per cable. At minimum
record:

| Required field | What to record |
|---|---|
| Cable ID and function | R-1/R-2/R-3 resolver; A-1/A-2/A-3/A-4 analog command; each enable, fault, limit, probe, solenoid, and power cable |
| Endpoints | Exact device connector/terminal at both ends |
| Conductors | Pairing, gauge, insulation rating, color, and spare cores |
| Shield/drain | Cable construction and the exact termination/insulation point at each end |
| Route | Duct/tray segment, approximate length, parallel power runs, crossings, flexing sections, and connector transitions |
| Reference/common | Signal return, 24 V return, chassis/PE, or isolated relay contact—never just “ground” |
| Evidence | Applicable manual page, continuity result, photograph, and reviewer/date |

### Resolver cables R-1 through R-3

- Use three individually shielded twisted pairs per axis.
- Connect one pair each to RESDRV±, RESSIN±, and RESCOS±.
- Terminate each pair shield at the 7i49-end GND terminal shown in the manual;
  insulate it at the resolver end. Do not connect a resolver shield to both
  ends merely to cure noise.
- Identify the TS2014N winding pairs by resistance and the exact suffix
  datasheet. Do not trust inherited wire colors or the old MELDAS signal names.
- Confirm the 7i49 is the only excitation source before connecting it.
- Select cable gauge, capacitance, flex rating, and permitted length from the
  actual resolver/cable/interface requirements or obtain Mesa/PCW approval;
  this repo does not currently have a sourced maximum.

### Analog-command cables A-1 through A-4

- AOUT0/AOUT1/AOUT2/AOUT3 command X/Z/Y/spindle respectively. Confirm the
  connector pins against the installed 7i49 revision before termination.
- Run each command with its dedicated signal-common return to the exact drive
  analog-common terminal. Do not use PE or the machine frame as the return.
- Determine cable shielding and which end receives the shield from the exact
  MELDAS HD/TRA and FR-SX manuals plus the 7i49 manual. Until that is resolved,
  both-end and one-end shield terminations remain design decisions, not facts.
- Keep the commissioning holds FALSE while checking zero-command voltage and
  polarity. The current servo procedure's ±50 mV zero check is a project hold
  criterion, not a published 7i49/drive acceptance specification.

### Possible spindle-feedback cable S-1

No spindle encoder/interface is assigned, the confirmed rmsvss6_8 firmware has
no Encoder module at all (readhmid 2026-08-13), and `num_encoders=0`.
If a feedback device is proven to exist, identify its electrical format and
select a documented compatible receiver before adding a cable schedule row.
Bare 7i80HDT GPIO (P2) is neither a 24 V input nor an RS-422 receiver.

### Enable and field-I/O cables

- X/Y/Z S-ON originate at 7i84U-B OUT0-2. FR-SX FWD/REV/RUN originate at
  7i84U-A OUT0-2. No enable originates at the 7i49.
- Size conductors, relay contacts, suppression, and fusing from measured load
  current/voltage and the exact 7i84U bank limits.
- The planned 100 VAC loads use interposing relays. Do not put 100 VAC on a
  7i84U terminal.
- Document the signal and return together. Keep OEM 24 V and retrofit 24 V
  crossings isolated through the approved relay contact scheme.

## PE, 0 V, and signal-common decisions

The as-built one-line must distinguish all of these nets. They are not
interchangeable:

| Net | Required disposition |
|---|---|
| Protective earth (PE) | Bond exposed conductive parts, cabinet, doors, motor frames, and equipment PE terminals per the applicable electrical design and measured protective-bond requirements. Conductor sizing is not specified by this repo. |
| 7i49 signal/analog GND | Use only as documented by Mesa and as the signal reference required by the connected drive. Do not add an unsourced PE strap at the card. |
| Drive analog common | Dedicated command return to the drive's documented analog-common terminal, not motor-frame PE. |
| Resolver shields | 7i49 end only, at the local GND terminal identified by the 7i49 manual. |
| Other cable shields | Follow the source and receiver manuals for that circuit; do not copy the resolver rule automatically. |

The repository formerly prescribed a 6 AWG “star,” a mandatory dedicated retrofit supply
negative-to-PE bond, and millivolt limits without an as-built drawing or source.
Those values are retracted. The final bond topology belongs in the pre-power
one-line and must be continuity-tested.

## Routing and segregation

- Route resolver and analog-command cables in a signal duct separate from
  motor leads, rectifier/DC-bus conductors, contactor/solenoid wiring, and mains.
- Minimize parallel runs with switching-power cables. Cross them at roughly
  right angles where practical.
- Do not place 24 V logic and legacy 100 VAC coil conductors in the same cable
  or unsegregated duct.
- Record actual clearances and divider construction on the cable schedule.
  Apply any minimum distance required by the cable/device manuals or the
  electrical designer. This repo does not claim a universal 50/150/300 mm rule.

## Noise and common-mode acceptance

File oscilloscope captures and HAL logs under `docs/commissioning_logs/`.
Define and sign quantitative acceptance thresholds before clearing either
motion-output hold; derive them from the exact resolver/drive/interface limits,
required position resolution, following-error budget, and measured baseline.

1. **Power-off checks:** verify PE continuity, absence of unintended
   OEM/retrofit 24 V bonds, shield isolation at the far end, winding pairing,
   and no short from any signal conductor to case/PE.
2. **Control-power-only baseline:** with all drive commands inhibited, scope
   RESDRV and differential RESSIN/RESCOS on every channel. Record frequency,
   amplitude, phase, and noise. Compare with the exact TS2014N suffix data and
   the 7i49 input requirements.
3. **Analog zero:** with drive enables physically inhibited, record AOUT0-3 to
   their dedicated command returns. Investigate any drift or switching pickup
   before enabling a drive.
4. **Switching survey:** operate one contactor/relay/solenoid at a time and
   record changes on all resolver returns, analog outputs, and HAL resolver
   error/velocity signals. Include the spindle drive energized with rotation
   commands held off.
5. **Low-energy motion:** after all earlier hold points pass, move one axis at
   the lowest approved command while monitoring the other two feedback
   channels. Increase speed only through the signed first-move plan.
6. **Fault criteria:** any resolver error, unexplained feedback step, following
   error, analog-command transient, or repeatable correlation with a switching
   load is a failed test until its magnitude is judged against the signed
   acceptance budget and the cause is corrected.

Do not “fix” a failed survey by bonding both shield ends, bonding a signal
common to PE, changing resolver excitation, or adding dividers without a
reviewed schematic and applicable manufacturer/Mesa guidance.

## Sources

- Mesa 7i49 manual, resolver wiring and connector pinouts:
  [https://www.mesanet.com/pdf/motion/7i49man.pdf](https://www.mesanet.com/pdf/motion/7i49man.pdf)
- Internal commissioning dependencies:
  [`servo_commissioning.md`](servo_commissioning.md),
  [`pre_power_deliverables.md`](pre_power_deliverables.md), and
  [`architecture_decision.md`](architecture_decision.md).
