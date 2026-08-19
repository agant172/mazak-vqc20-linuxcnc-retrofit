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

Winding identity, pin assignment and drive direction are **settled** — see
[OEM connector reference](#oem-connector-reference--confirmed-against-the-m2-maintenance-manual),
now confirmed against Mitsubishi's own detector wiring figure, and the
[measured DC resistance](#measured-dc-resistance-2026-08-16-cna345-nc-unit-rack)
that corroborates it. What is **not** settled and must come off the bench:
**pole count**, transformation ratio at 5 kHz, and phase shift — see
[Power-off bench identification](#power-off-bench-identification-replaces-the-datasheet-gate).
The rotor/SIN/COS row labels above are the 7i49's vocabulary, not Mitsubishi's;
fill them per the connector table.

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
   X/Y/Z on 2026-08-16**, and the roles are now confirmed against the M2
   manual's own figure: 12/13 and 14/15 are the SIN and COS windings (the pair
   Mitsubishi excited), 16/17 is the third winding (Mitsubishi's output, and the
   one the 7i49 must excite).
3. Check every conductor to the resolver case and cable shield. Resolve any
   unintended connection before proceeding.
4. Wire the verified excitation pair to RESDRV and the two matched output pairs
   to RESSIN/RESCOS. Use the 7i49 connector table in
   [`grounding_shielding_plan.md`](grounding_shielding_plan.md).
5. Confirm the three pair shields terminate at the 7i49 end only and that the
   old control/drive no longer owns any resolver winding.

### OEM connector reference — CONFIRMED against the M2 maintenance manual

**Source: Mitsubishi, `MELDAS Series M2 Maintenance Manual` (BNP-A2443A /
M1243-ES), Figure 14.4-1 "Detector signal connecting method", printed page 250.**
Obtained 2026-08-16 from the MEAU knowledge base (DocID
`3E26SJWH3ZZR-24-2354`, sign-in required); see
[Reading the M2 manual](#reading-the-m2-manual-scanned-source). The figure is
titled for N/C-side connector **`CNA 3~6`** and detector-side Cannon connector
**MS3102A20-29P**. That is the same connector plane as the CNA3 (X) / CNA4 (Y) /
CNA5 (Z) measured on 2026-08-16, and the OEM servo-drive sheet `41434WB` PDF p128
(dwg 4143075404) names the same pickup (**RT-5XA-11**, = Tamagawa TS2014N /
BKO-NC6062A).

| CNA pin | **Mitsubishi's own label** | Detector lead | Measured 2026-08-16 | 7i49 role for the retrofit |
|---|---|---|---|---|
| 12 / 13 | **Resolver exciter SIN** | A / B | 105–109 Ω | **RESSIN** (read) |
| 14 / 15 | **Resolver exciter COS** | F / G | 105.5–109.5 Ω | **RESCOS** (read) |
| 16 / 17 | **Resolver output** | H / J | 35 Ω | **RESDRV** (excite) |
| 19 / 18 | Tachogenerator output / output ground | L / K | — | **stays with the drive**, not read by LinuxCNC |
| 20 | Sealed ground (case ground at detector) | N | 0 Ω to chassis | shield ground |
| 6 / 1,7 / 2 | +12 V / power source ground / −12 V | P / R / S | 1–7: 0 Ω | tachogenerator supply, not resolver |

**The OEM excited two windings and read one — the opposite of the 7i49.** The M2
is a phase-analog loop (§6.6.1: the command pulse is phase-modulated and the
"resolver phase shifter" output is phase-discriminated against it), so Mitsubishi
drove SIN and COS in quadrature and took a single phase-shifted output. The 7i49
does the reverse: it excites the 1-phase member and reads the 2-phase pair.

**This does not change how we wire the 7i49 — a resolver is reciprocal — and the
previously proposed wiring stands: excite 16/17, read 12/13 and 14/15.** What
changes is that it now rests on a Mitsubishi primary source instead of on the
retired resistance-magnitude argument, and the pin labels mean the opposite of
what the old `R0=rotor, RS=sin, RC=cos` reading assumed.

**Two independent corroborations that this figure describes the connector we
measured**, not the servo-drive-side connector of the same name:

- The figure marks **pins 1 and 7 as the same net** (power source ground) —
  measured 0 Ω between 1 and 7 on all three axes.
- The figure marks **pin 20 as sealed ground**, bonded to detector case —
  measured 0 Ω to chassis on X and Y.

**Do not use DC resistance magnitude as the discriminator at all.** It is now
moot — the winding roles are established by the Mitsubishi figure above — but the
reasoning is kept because the retired rule is still quoted in older notes, and
because it explains why the measurement looked wrong. The 2026-08-16 measurement
found the 141E26 ordering inverted on the installed pickups, and the 2026-08-16
document search then established that the magnitude rule is unsound in principle,
not merely inapplicable here:

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

**Match-vs-odd was the right discriminator, and the manual confirms it.** The two
matched windings are the SIN and COS members and the odd 35 Ω winding is the
third — exactly as symmetry predicted, and now stated outright by Mitsubishi. The
reason the magnitudes looked inverted is that on this detector the *matched pair
is the excited pair*, which is the reverse of a rotor-excited BRX part like the
141E26. See
[Winding identity is settled by symmetry](#winding-identity-is-settled-by-symmetry).

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

**Consequence.** Winding roles and pin assignments are **resolved** by the
Mitsubishi figure above, and this measurement is what corroborates it: the
excited pair reads high, the output winding low. Wire the 7i49 to excite 16/17
and read 12/13 and 14/15. What is still unmeasured is the **pole count**, the
transformation ratio at 5 kHz, and the phase shift — see
[Power-off bench identification](#power-off-bench-identification-replaces-the-datasheet-gate).
No exact-suffix datasheet exists (see
[The 25E datasheet is not obtainable](#the-25e-datasheet-is-not-obtainable-searched-2026-08-16)),
so those three come from the bench, not from paper.

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

This was written before the M2 manual was obtained, when it was the *only*
thing that could be said with confidence. Mitsubishi's Figure 14.4-1 now names
the same three windings outright and adds what symmetry could not: the matched
pair is the pair the OEM **excited** (SIN and COS), and the odd winding is the
**output**. Both readings agree; the manual is the citable one.

### Reading the M2 manual (scanned source)

The `MELDAS Series M2 Maintenance Manual` is the authority for the detector
interface, and it is **a scan with no text layer** — searching it requires OCR,
and the MEAU site's own preview extracts nothing but the cover.

- **Where:** MEAU knowledge base, DocID `3E26SJWH3ZZR-24-2354`, 22 MB, 297 pages.
  **Sign-in is required and it is not optional**: logged out, the knowledge base
  reports *zero* results for `MELDAS`; logged in, it returns **479**, including
  42 tagged OEM `Mazak`. Anyone concluding "MEAU has nothing this old" was
  searching logged out.
- **Also useful there:** `TRS Maintenance Manual` (`-24-3738`) — a different
  amplifier family, whose resolver senses *magnetic pole position*, so treat its
  figures as era-context, not as this machine's. It does state resolver
  excitation of **4.5 kHz** and a 12 Vp-p feedback level for that system.
- **Page numbering:** printed page = PDF page − 11 (Figure 14.4-1 is printed
  p. 250 = PDF p. 261).
- **To re-extract without installing anything on a Mac:** render pages with
  `pdftoppm -f <first> -l <last> -r 400 -png <pdf> out` and OCR them with a small
  Swift binary calling Vision's `VNRecognizeTextRequest` (`usesLanguageCorrection
  = false`, or it "corrects" part numbers and ohm values). Tesseract is not
  needed. Diagram OCR scrambles reading order — **read figures as images**, not
  as OCR text; the pin table above was transcribed by eye from the rendered page.
- The PDF itself is deliberately **not committed** — see the media rule in
  [`../CLAUDE.md`](../CLAUDE.md). Findings live here; the source is one
  authenticated download away.

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

### Pole count and resolver scale, derived from τ

**`RESOLVER_SCALE` is now derivable from this machine's own stored parameters,
and it does not depend on the ballscrew lead.**

The M2 maintenance manual (printed p. 109) gives grid spacing = `4000 / τ` in
microns, and §6.7.1 puts grid points at each `1/n` revolution of the resolver —
i.e. **one grid point per resolver *electrical* revolution**. So grid spacing
*is* machine travel per electrical revolution, which is exactly what HostMot2's
`.scale` wants.

τ is stored in **`MC1–MC4`**, packed as `LINEAR ZONE | τ × 8` (parameter manual
printed p. 6-35; decode in
[`../background/parameter_recovery.md`](../background/parameter_recovery.md#mc1mc4-carry-the-control-τ-number--decode-them)).
This machine reads `MC = 784` on X, Y and Z — on the 1985 factory sheet and on
the 2026-07-28 live CRT alike:

```
784 = 0x0310  ->  LINEAR ZONE 3 (=16000),  τ × 8 = 16  ->  τ = 2.000
grid spacing = 4000 / 2 = 2000 µm = 2.000 mm = 0.07874016 in
```

> **`RESOLVER_SCALE` = 2.000 mm (0.07874016 in) per resolver electrical
> revolution, X, Y and Z.** Sign selects axis direction; set
> `RESOLVER_VELOCITY_SCALE` to the same signed value.

**Independent corroboration from a running machine.** The SRDC Mazak VQC 15/40
retrofit — same generation, original Mitsubishi DC servos and resolvers retained,
LinuxCNC + Mesa — ships `RESOLVER_SCALE = 0.07874016` and
`RESOLVER_INDEX_DIVISOR = 5` on all three axes, with `LINEAR_UNITS = inch`
(`github.com/srdco/MazakVQC1540`, `MAZAK-VQC1540.ini`). 0.07874016 in = **2.0000
mm exactly**. That machine's value was arrived at empirically, without reference
to τ, and lands on the same number.

**Pole count follows from the lead, and the lead is now MEASURED.** `n = lead ÷
grid spacing`. On 2026-08-17 all three ballscrews were hand-turned one full
revolution at the machine and each axis moved **10.000 mm**
([`ballscrew_lead_2026-08-17.md`](ballscrew_lead_2026-08-17.md)), so

> **n = 10.000 ÷ 2.000 = 5** — five electrical revolutions per screw turn.

This agrees with the `RT-5X` type name and with the sibling machine's
`RESOLVER_INDEX_DIVISOR = 5` (note the agreement; neither is admissible as
support — see the lead file). What is left unmeasured is the **2.000 mm**, which
is the τ decode. So Test 1 below is no longer a hunt for n; it is a **direct test
of τ**, with a specific number predicted in advance. Note that *`RESOLVER_SCALE`
does not depend on n either way*.

**Homing is unaffected by the residual uncertainty:** n > 1 under every
candidate lead, so the resolver null repeats within a screw turn and cannot
identify a unique position. **Switch-based homing stays mandatory**, and the
sibling machine likewise sets `HOME_USE_INDEX = NO`.

**Evidence state: `PROPOSED`.** This is a documentary derivation plus a
third-party config, not a measurement on this machine. Test 1 below is now a
**verification with a pre-committed prediction**: per full screw revolution,
**5 electrical revolutions = 10 amplitude nulls on one output winding**, and a
null every **1.000 mm** of axis travel. The lead is no longer the loose end — if
Test 1 disagrees, **the τ decode is wrong**, and the measurement wins.

#### Test 1 — nulls per mechanical revolution. Run this FIRST; it gates scaling.

Drive the 35 Ω winding at ~5 kHz, 3–5 Vrms, through the series resistor. Scope
one output winding. Rotate the shaft slowly through **one full mechanical
revolution** by hand and count amplitude nulls.

> ### Count nulls, then HALVE them. `n` = nulls ÷ 2.
>
> **An earlier version of this test said `n` = nulls per revolution. That is
> wrong and it is wrong in the dangerous direction — it doubles n, which doubles
> the inferred lead to 20 mm, which is precisely the poles-vs-pole-pairs trap
> flagged in [`ballscrew_lead_2026-08-17.md`](ballscrew_lead_2026-08-17.md).**
>
> One output winding carries `k·V_exc·sin(θe)` with `θe = n × θ_mech`. Over one
> mechanical revolution `sin(θe)` crosses zero **2n** times — once at 0° and once
> at 180° of every electrical revolution. What a scope shows is the *envelope*,
> `|sin(θe)|`, so every one of those 2n crossings looks like a null; the 180°
> carrier phase inversion that distinguishes them is invisible unless you view the
> output against the excitation.
>
> **Predicted for this machine, per full screw revolution: 10 nulls, 5 electrical
> revolutions.** Getting 10 confirms τ = 2. Getting 5 would mean n = 2.5, which is
> not a thing — recount. Getting 20 means τ = 1 and the grid is 4.000 mm.
>
> **Two ways to avoid the ambiguity entirely, either is better than counting
> envelope collapses:**
> - Put the excitation on CH1 and the output winding on CH2 and watch the carrier
>   **invert phase** at alternate nulls. Count inversions-to-inversion: that is one
>   electrical revolution, and there are **5** per screw revolution.
> - Scope **both** output windings at once (as Test 2 does anyway). Their nulls
>   interleave in quadrature; one full SIN-null → COS-null → SIN-null → COS-null
>   sequence is one electrical revolution.
>
> **Cross-check with a dial indicator, which needs no interpretation at all:**
> nulls should fall every **1.000 mm** of axis travel and same-phase nulls every
> **2.000 mm**. That measures grid spacing directly, in machine units, and is the
> single most decisive reading in this procedure.

Then, with `n` in hand:

- `RESOLVER_SCALE` and `RESOLVER_VELOCITY_SCALE` must reflect **n electrical
  revolutions per screw turn**.
- Position is **not unique within a screw turn**; there are n indistinguishable
  positions.
- **Homing must not rely on the resolver null** — with n > 1 the null repeats.

**This is not a hypothesis any more: the detector is multi-pole.** The M2
maintenance manual settles it three times over. Table 14.3-1 classes the **RT**
model as a *"multi-polar resolver"* used as a *"ball screw tip position detector
(semi-closed type)"* — that is this machine's detector. §14.2 credits *"multi-polar
construction (resolver)"* with making a **gearless direct-drive** resolver
possible. And §6.7.1, describing grid zero-return, states that with resolvers as
position detectors the machine has grid points *"at each **1/n (n : number of
poles)** revolution of the resolver"*. So the repo's 1× assumption is **wrong**;
only the value of n is open.

The name also suggests n = 5: "RT-**5**X". Across five observed Mitsubishi/Tamagawa
pairs the type-name digit tracks the Tamagawa N-group's last digit exactly
(RT-3XB-11↔N**23**, RT-3XC-11↔N**43**, RT-5XB-11↔N**25**, RT-5XC-11↔N**45**,
RT-6XC-11↔N**46**), and on other Tamagawa families that digit is the documented
speed factor (TS2014N**181**E32 = "one speed", **182**E32 = "two speed"). Treat
5 as the expected answer to check against, not as the answer.

#### Test 2 — equal peaks: which winding to excite

Drive direction is no longer in question — the manual answers it — so this is now
a **confirmation** step, worth the five minutes because it also proves the cable,
the connector pinout on *this* machine, and that no winding is damaged.

With the 35 Ω winding (pins 16/17) driven, rotate slowly and watch **both** output
windings. Correct configuration: the two outputs reach **equal peak amplitudes**,
90° apart in shaft angle, clean sinusoidal envelopes, deep nulls. Unequal peaks, a
distorted envelope, or a shallow null means something is wrong with the cable, the
pinout on this machine, or a winding — stop and find out which before proceeding.

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
calibrated, not assumed away.

**The sibling machine does not validate 5 kHz — it runs 2.5 kHz, on a 7i49HV.**
Its committed config sets `[AXES] RESOLVER_EXC_FREQ = 2.5`, applied live
(`MAZAK-VQC1540.ini:176`, `.hal:117`), on the same original Tamagawa resolvers —
and its purchased-parts table lists a **`7i49HV`**, not the plain card (settled
2026-08-17, [`../bom/README.md`](../bom/README.md#which-7i49-the-sister-machine-actually-runs--settled-2026-08-17)).
The forum thread's "plain 7i49 at 5 kHz" description matches neither record. So
5 kHz is an unanchored choice, not a known-good compromise: treat 2.5 kHz as a
live alternative, and measure amplitude and phase at both before committing.

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

- **`MELDAS Series M2 Maintenance Manual` (BNP-A2443A / M1243-ES)** — Mitsubishi,
  via MEAU knowledge base DocID `3E26SJWH3ZZR-24-2354` (sign-in required).
  Figure 14.4-1 p. 250 (detector signal connecting method, `CNA 3~6` pin
  assignments); Table 14.3-1 p. 249 (RST / RT / TT detector models); §14.2 p. 248
  (multi-polar, gearless construction); §6.6.1 p. 99 (phase-analog servo loop);
  §6.7.1 p. 104 (grid zero return at each 1/n revolution, n = number of poles).
  See [Reading the M2 manual](#reading-the-m2-manual-scanned-source).
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
