# Resolver identification, phasing, and scale procedure

> **ROLE: COMMISSIONING (D8)** — executed under power, after installation. Order of procedures: [../INSTALL_SPINE.md](../INSTALL_SPINE.md) Appendix B.


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

DC resistance was measured on all three axes on 2026-08-16. The **windings are
identified** by that measurement; **which one to excite is not** — see
[Measured DC resistance, 2026-08-16](#measured-dc-resistance-2026-08-16-cna345-nc-unit-rack)
and
[Power-off bench identification](#power-off-bench-identification-replaces-the-datasheet-gate)
before filling the rows above.

The TS2014N141E26 values elsewhere in the repo are comparison data from a
**different suffix than the one installed**: the 2026-08-15 nameplate survey
read `TS2014N 25 E …` on X and Y. **They are not a discriminator and not a
spec** — ~121 Ω / ~69 Ω is a DC ordering that inverts that same part's own AC
impedance ordering, and the installed pickups measure the other way round.
Treat 141E26 as background only, and see
[The 25E datasheet is not obtainable](#the-25e-datasheet-is-not-obtainable-searched-2026-08-16):
there is no exact-suffix data to agree or disagree with, so the bench, not a
document, is what this procedure now compares against.

## Power-off identification

1. Isolate the old resolver electronics so no second circuit can excite or
   load a winding. Prove isolation with continuity and voltage checks.
2. Identify all three winding pairs with an ohmmeter. Record conductor labels
   and resistance; do not infer pairs from inherited names/colors. **Done for
   X/Y/Z on 2026-08-16** — the matched pair is the 2-phase member, the odd
   winding the 1-phase member. Resistance settles winding identity and nothing
   more; excitation direction comes from
   [Test 2](#test-2--equal-peaks-which-winding-to-excite), not from magnitude.
3. Check every conductor to the resolver case and cable shield. Resolve any
   unintended connection before proceeding.
4. Wire the verified excitation pair to RESDRV and the two matched output pairs
   to RESSIN/RESCOS. Use the 7i49 connector table in
   [`grounding_shielding_plan.md`](grounding_shielding_plan.md).
5. Confirm the three pair shields terminate at the 7i49 end only and that the
   old control/drive no longer owns any resolver winding.

### OEM connector reference (starting hypothesis — VERIFY, don't trust)

From the OEM servo-drive sheet `41434WB` PDF p128 (dwg 4143075404): each axis
resolver (**RT-5XA-11**, = the Tamagawa TS2014N / BKO-NC6062A pickup) lands on
connector **CNA3 (X) / CNA4 (Y) / CNA5 (Z)**. The 6 resolver leads (A/B/F/E/H/J)
map to these pins/labels:

| OEM label | CNA pin | Resolver leads | Likely 7i49 role | Verify by |
|---|---|---|---|---|
| **R01 / R02** | 16 / 17 | H / J | **RESDRV** (rotor / excitation, "R0") | odd winding out of three; **measured 35 Ω** — magnitude proves nothing, see [Test 2](#test-2--equal-peaks-which-winding-to-excite) |
| **RS1 / RS2** | 12 / 13 | A / B | **RESSIN** (sin stator, S1/S3) | half of the matched pair; **measured 105–109 Ω** |
| **RC1 / RC2** | 14 / 15 | F / E | **RESCOS** (cos stator, S2/S4) | half of the matched pair; **measured 105.5–109.5 Ω** |
| TG1 / TG2 | 18 / 19 | tacho | **stays with the drive** (2 V/1000 rpm, not read by LinuxCNC) | — |
| SG / AG / P12 / M12 | 20 / 7,1 / 6 / 2 | shield-gnd / motor armature | not resolver | — |

**This is a starting hypothesis only.** The `R0=rotor, RS=sin, RC=cos` reading
matches the labels and the resolver symbol, but the original **Meldas / TRA
wiring may drive the resolver in a non-7i49 convention** (two-phase excitation
into the stators, read from the rotor). So step 2 above still governs: confirm
each pair by **ohmmeter** before wiring the 7i49. Use the OEM labels to speed
identification and cross-check, not to skip the measurement.

**Do not use DC resistance magnitude as the discriminator at all.** The
2026-08-16 measurement below found the 141E26 ordering inverted on the installed
pickups, and the 2026-08-16 document search (below) then established that the
magnitude rule is unsound in principle, not merely inapplicable here:

- For 141E26 — the one suffix where Tamagawa publishes both — the **DC ordering
  is inverted relative to that same part's AC impedance ordering** (DC rotor 121
  > stator 69; AC ZRO 250+j377 **<** ZSO 400+j690). On a brushless pickup the
  R1-R2 terminals land on the *stationary primary of the rotary transformer*, so
  the resistance seen at the connector is a coupling-transformer design choice,
  not a turns-ratio proxy.
- Both catalogue data points on *stator-primary* (BRT) Tamagawa parts show the
  **rotor side higher** (ZRS 3800 vs ZSO 1800 Ω; size-11 TS530N36E10 rotor 191 Ω
  vs stator 127 Ω). So a low-resistance odd winding does **not** imply BRT.
- The arithmetic coincidence 35/107 ≈ 0.33 ≈ TR 0.3 is numerology. Do not build
  on it.

**Match-vs-odd is the discriminator, and it is enough to identify the windings.**
See [Winding identity is settled by symmetry](#winding-identity-is-settled-by-symmetry).

### Measured DC resistance, 2026-08-16 (CNA3/4/5, NC unit rack)

Measured by Andy at the machine, 2026-08-16, with the NC unit rack physically
removed and connectors CNA3 (X) / CNA4 (Y) / CNA5 (Z) unplugged and backprobed
directly. Recorded by a desk session from the owner's notes — the readings are
the owner's, taken at the machine.

| Axis | Connector | Pins 12/13 | Pins 14/15 | Pins 16/17 |
|---|---|---|---|---|
| X | CNA3 | 105 Ω | 105.5 Ω | 35 Ω |
| Y | CNA4 | 109 Ω | 109.5 Ω | 35 Ω |
| Z | CNA5 | 108 Ω | 108 Ω | 35 Ω |

**Pattern.** On every axis 12/13 and 14/15 match each other within 0.5 Ω, which
is what two stator windings should do; 16/17 is the odd one out and reads an
identical 35 Ω on all three axes. On match-vs-odd alone that puts the stators on
12/13 and 14/15 and the rotor on 16/17 — the same assignment the OEM connector
table above proposes.

**The magnitudes are inverted relative to the comparison data, and that is
normal.** The 141E26 figures put the rotor *high* (~121 Ω) and the stators *low*
(~69 Ω); here the matched pairs are high and the odd pair is low. The 2026-08-16
document search found a documented worked example with the same polarity as ours
(Dynomotion: 20 Ω excitation winding against 37 Ω sin/cos) and an impedance
analogue (KABEA TS2650N11E78: rotor 51+j90 vs stator 102+j150). **Of the two
patterns, 141E26 is the unusual one — not this machine's reading.** Stop treating
121/69 as "the expected ratio."

**Second unknown: which connector was measured.** The hypothesis table above is
built from the OEM *servo-drive* sheet. These readings were taken on the
*NC unit rack* side. The two are not confirmed to share a pinout, so the pin
numbers here may not be the pin numbers there.

**Consequence.** The *windings* are identified (see below); the **drive
direction is not**, and stays `PROPOSED`. Do not wire RESDRV/RESSIN/RESCOS on
the strength of this data. The gate is no longer "obtain the datasheet" — that
document does not exist (see
[The 25E datasheet is not obtainable](#the-25e-datasheet-is-not-obtainable-searched-2026-08-16)) —
it is the bench procedure in
[Power-off bench identification](#power-off-bench-identification-replaces-the-datasheet-gate).

#### Ground and shield pins — same session, same connectors

- X, Y pin 20 → chassis ground: 0 Ω (Z not checked)
- X, Y, Z pins 1 / 7: 0 Ω on all three axes

Both agree with the `SG / AG` row of the connector table (pin 20 = shield ground;
pins 1 and 7 are the same AG net). Neither is a resolver signal pin, so these are
**expected continuity on ground/shield conductors, not a fault**, and they do not
bear on the rotor/stator question. They do corroborate the ground-pin portion of
the OEM table against physical reality on this connector.

### Winding identity is settled by symmetry

**Confidence: near-certain, and it needs no datasheet.** A resolver has one
2-phase member and one 1-phase member. The 2-phase member's two halves are wound
identically and must therefore read the same. Two matched windings plus one odd
one forces the assignment:

- **105–109 Ω matched pair (CNA pins 12/13 and 14/15) — the 2-phase (SIN/COS)
  member.**
- **35 Ω odd winding (CNA pins 16/17) — the 1-phase member.**

Note precisely what this does and does not settle. It identifies the *windings*.
It does **not** say which one the 7i49 should excite — a 1-phase member can be
either the primary (7i49 convention) or the output (the Meldas two-phase-
excitation convention). That question is open and is what
[Test 2](#test-2--equal-peaks-which-winding-to-excite) answers.

### The 25E datasheet is not obtainable (searched 2026-08-16)

A structured multi-source search on 2026-08-16 established that **no datasheet
for the installed suffix exists on the public web**, and that this is a fact
about the world rather than a gap in the search. The negatives were specific:
Tamagawa's own site returns zero hits for the `TS2014N` legacy strings; all 22
current Tamagawa catalogues contain exactly one TS2014N model (141E26);
DatasheetArchive returns explicit no-results pages for `TS2014N25E3`,
`BKO-NC6062` and `RT-5XA`; archive.org holds nothing; and no retrofit forum has
ever posted the literal string `TS2014N`.

**The structural reason:** `TS2014N25E3-1` was almost certainly a build-to-print
item, made by Tamagawa to a Mitsubishi drawing under spec `BKO-NC6062(A)`. It
never appeared in a Tamagawa catalogue, and its electrical spec lived in a
Mitsubishi internal document. That is why the catalogue suffixes (141E26,
181E32, 221E1, 51E1) are findable and this one is not.

**Do not re-run this search.** If the spec is wanted on paper, the ranked routes
are: (1) the Mitsubishi Electric Automation knowledge base, docids
`3E26SJWH3ZZR-24-2231` (Meldas YM2 / Mazatrol M2 maintenance) and
`3E26SJWH3ZZR-24-3709` (TRA-31) — free account, and the document *type* that
normally carries a detector inspection procedure with expected ohms; (2)
AdvanTech International, Tamagawa's USA agency, asking Tamagawa Nagano to
retrieve the original 1980s spec drawing (Tamagawa's own enquiry form rejects
free-mail senders); (3) Yaskawa YASNAC MX3 service literature — the same pickup
was specified into Shizuoka machines with MX3 controls, an entirely separate
documentary lineage nobody has searched; (4) a repair house that rebuilds RT-5X
pickups, which is the fastest route to expected winding resistances specifically.

**Part numbers, resolved.** Full-resolution photographs of sibling nameplates
show the plate is a pre-printed template `TS2014N[__]E[_]-[_]` / `RT-[_]X[_]-[_][_]`,
so the machine's plates read **`TS2014N25E8-1`** (X) and **`TS2014N25E3-1`** (Y),
closed up, trailing `-1` genuine — and the Y plate's "RT 5 X 8-1" is
**`RT-5XB-11`**, the B misread as 8. Z is **`TS3033N4E2`**. This is an inference
from the plate template, not a re-read of our own plates: confirm at the machine
and correct here if it differs.

### Power-off bench identification (replaces the datasheet gate)

**This is now the authoritative way to identify these resolvers, and it is
better than the missing datasheet, not a substitute for it.** A document would
say what the part was in 1984; the bench says what it is now. It also answers
one question no datasheet is guaranteed to answer — see Test 1.

One framing point that removes a whole class of worry: **the original control's
excitation scheme does not constrain this retrofit.** A resolver originally
driven the Meldas way (stators excited, third winding read as position error) is
still usable the 7i49 way. We excite the 1-phase member and read the 2-phase
pair regardless of what Mitsubishi did.

**Equipment:** function generator (sine, 1–10 kHz, a few volts), two-channel
scope, a ~100–470 Ω series resistor in the drive lead, a DMM. Motor uncoupled or
at minimum drive power off, 7i49 disconnected.

**Safety envelope — first energization.** Tamagawa's published rule for the
family is a supply voltage from 3 V up to ~1.2× rating, and every candidate
rating for this frame is 10 Vrms. **Start at 3–5 Vrms through the series
resistor.** At that level the tests are safe in *any* winding configuration,
including a wrong one — the resolver is a passive rotary transformer. Use the
measured DC resistances (35 Ω, ~107 Ω) as a sanity floor for expected drive
current; actual AC impedance will be several times higher.

#### Test 1 — nulls per mechanical revolution. Run this FIRST; it gates scaling.

Drive the 35 Ω winding at ~5 kHz, 3–5 Vrms, through the series resistor. Scope
one output winding. Rotate the shaft slowly through **one full mechanical
revolution** by hand and count amplitude nulls.

- **One null pair per turn → 1× (2-pole).** Everything downstream proceeds as
  currently planned.
- **Five → the unit is a 5× (10-pole) resolver.** Then: `RESOLVER_SCALE` must
  reflect **5 electrical revolutions per screw turn**, there is **no unique
  position within a screw turn**, and **homing must not rely on the resolver
  null**.

**Why this is a live possibility and not paranoia.** "RT-**5**X" may be a speed
designation rather than a family letter. Across five observed Mitsubishi/Tamagawa
pairs the type-name digit tracks the Tamagawa N-group's last digit exactly
(RT-3XB-11↔N**23**, RT-3XC-11↔N**43**, RT-5XB-11↔N**25**, RT-5XC-11↔N**45**,
RT-6XC-11↔N**46**), and on other Tamagawa families that digit is documented as
the speed/X factor (TS2014N**181**E32 = "one speed", TS2014N**182**E32 = "two
speed"). A 5× resolver on a ballscrew is how a 1984 phase-analog Meldas loop got
micron resolution from an analog interpolator. Confidence: **moderate** — the
correlation is 5/5 but the mechanism is inference, and Tamagawa states all
*catalogue* resolvers are 1×, which is consistent given this is not a catalogue
part. Five minutes of bench time settles it either way.

#### Test 2 — equal peaks: which winding to excite

With the 35 Ω winding driven, rotate slowly and watch **both** output windings.
Correct configuration: the two outputs reach **equal peak amplitudes**, 90° apart
in shaft angle, clean sinusoidal envelopes, deep nulls. Unequal peaks, a
distorted envelope, or a shallow null means the drive winding is wrong. Then
repeat driving the matched pair in the Meldas two-phase manner and compare; the
difference is unmistakable. This is the test that converts drive direction from
`PROPOSED` to measured.

#### Test 3 — transformation ratio, measured both directions

Drive one winding, measure open-circuit output amplitude at the peak. **The
intended primary is the direction that yields a ratio below 1** — expect 0.3–0.5,
which is what both catalogued size-25 variants show. Driving the other way gives
~2–3, a step-up: electrically functional, wrong for 7i49 input scaling, and a
risk of overdriving the 7i49 resolver inputs. Record the result as *the measured
TR of these specific units* — better data than the datasheet would have given.

#### Test 4 — carrier frequency, settled empirically

Sweep the drive 2–10 kHz through the series resistor and log (i) drive-current
amplitude (winding impedance vs frequency), (ii) output amplitude (TR vs
frequency), (iii) phase shift between drive and output. The design carrier sits
where TR is flat and phase shift is modest. Then **measure phase shift and TR at
exactly 5 kHz** — that is the number the 7i49 needs.

**On 5 kHz, plainly.** If the part is a 4.5 kHz design, 5 kHz is +11.1%, more
than double Tamagawa's stated ±5% band, and Tamagawa's application note says
accuracy is affected outside it. This is an **accuracy and calibration issue, not
a damage risk** — it appears as a phase-shift and amplitude-scale offset to be
calibrated, not assumed away. A sibling machine (a VQC 15/40 retrofit on a plain
7i49) runs its original resolvers at 5 kHz successfully. So 5 kHz is a known-good
compromise; measure the offset.

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
   coupling/reduction **and the resolver's speed factor**. Every scale figure in
   this repo assumes a 1× (2-pole) resolver; if
   [Test 1](#test-1--nulls-per-mechanical-revolution-run-this-first-it-gates-scaling)
   returns five nulls per turn, one screw turn is five electrical revolutions,
   position is not unique within a turn, and homing must not use the resolver
   null. Run Test 1 before committing any scale value. Populate `RESOLVER_SCALE` and
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
- Exact per-axis Tamagawa suffix: **partially read 2026-08-15** — X/Y pickups
  read `TS2014N 25 E …` (faded; Z resolver nameplate still unread), which is
  **not** the 141E26 variant the comparison figures come from. See
  [`feedback_nameplate_survey_2026-08-15.md`](feedback_nameplate_survey_2026-08-15.md);
  no exact-suffix datasheet exists publicly (search 2026-08-16, below).
- Per-axis DC resistance at CNA3/4/5, measured at the machine **2026-08-16** —
  [Measured DC resistance](#measured-dc-resistance-2026-08-16-cna345-nc-unit-rack)
  above. Nameplate transcriptions for the same devices are in
  [`../resolvers.md`](../resolvers.md).
- **Exact-suffix datasheet: does not exist publicly** (multi-source search
  2026-08-16). Do not re-run the search; see
  [The 25E datasheet is not obtainable](#the-25e-datasheet-is-not-obtainable-searched-2026-08-16)
  for the negative result, why it is structural, and the four ranked acquisition
  routes that were not exhausted.
- Comparison catalogues, all **other suffixes** — Tamagawa Smartsyn / FA-SOLVER
  catalogue T12-1421N6 ([RCC mirror](http://rccindustrial.com/Documentos/Catalogos/RCC_Resolver-Brushless-Smartsyn.pdf),
  16 pp, verified 2026-08-16; carries TS2014N14E41 and the stator-primary
  TS2014N51E1, and no DC resistance for any suffix) and the Tamagawa JP
  FA-SOLVER catalogue 1182N19J ([index](https://tamagawa-seiki.com/downloads/pdf/);
  carries 141E26 with rotor 120.7 Ω / stator 68.7 Ω, footnoted by Tamagawa as
  実測に基づく参考値 — sample-measured reference values, not guaranteed spec).
