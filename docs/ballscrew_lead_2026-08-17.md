# Ballscrew lead — SETTLED BY MEASUREMENT, 2026-08-17

**Short version: `lead = 10.000 mm`.** Measured at the machine on 2026-08-17: the **Z**
ballscrew, hand-turned one full revolution, moved the axis **10 mm**. That is the floor of the
admissible set and the value every paper argument below pointed to. **12 / 14 / 16 / 20 mm are
refuted.**

The lead is no longer an open question. The rest of this file is kept for two reasons: it
records which of the paper arguments the measurement confirmed and which it killed, and the
paper chain — not the measurement — is still what carries `RESOLVER_INDEX_DIVISOR`
(see [What this does and does not settle](#what-this-does-and-does-not-settle)).

Companion: [`feed_drive_parts_2026-08-17.md`](feed_drive_parts_2026-08-17.md) (part numbers,
ratios, resolver, coupling). `project_status.md` remains the authority for the task list.

## What is established, and what is not

| Statement | Status | Basis |
|---|---|---|
| lead = *n* × 2.000 mm, *n* a positive integer | **ESTABLISHED** | M2 grid rule + τ = 2 + the 1:1 resolver coupling |
| lead ≥ 10.000 mm | **ESTABLISHED** | motor Nmax + pulley teeth + rapid parameter (below) |
| lead is the same on X, Y and Z | **ESTABLISHED** | all three drivetrains reach 1200 screw rpm at their own motor's ceiling; `RF1 = RF2 = RF3` |
| lead = exactly 10.000 mm | **MEASURED 2026-08-17** | one full revolution of the **Z screw** = 10 mm of axis travel, at the machine ([below](#the-measurement-as-taken)) |
| *n* = 5 electrical revolutions per screw revolution | **DERIVED, not measured** | 10.000 mm lead ÷ 2.000 mm grid spacing, with the 1:1 resolver coupling. Rests on the τ = 2 derivation, which is still `PROPOSED` |

## The lower bound — the one genuinely new result

This is the first evidence in the whole investigation that reaches the screw **without going
through the resolver**, so it is not circular with the τ derivation.

**Source: `41434WB.pdf` PDF p. 128** — title block *"VQC-20/40,50 SERVO DRIVE"*, control
*"MAZATROL M-1"*, sheet 04, drawn 1982. The numbers are **hand-lettered annotation blocks,
rotated 90°, inside the drawing**. Read at 300–600 dpi; re-verified independently on
2026-08-17 before this file was committed.

The X block uses a parenthetical convention — *"X AXIS A TYPE (B TYPE) / SERVO MOTOR
HD81-12S-TTA (HD101-12-TTA) … Nmax = 2000 r.p.m. (1500 rpm)"*. **The parentheses cover motor,
current and speed only; the belt diagram in that block is the A-type's 30Z/18Z.** B-type
pulley counts come from the parts list §21, not from this schematic.

| Axis | Motor | Nmax | Pulleys (screw / motor) | Source of pulleys | Screw rpm at Nmax |
|---|---|---|---|---|---|
| Y | HD-81-12S-TTA | 2000 rpm | 30 Z / 18 Z | schematic **and** parts list §22 | 2000 × 18/30 = **1200** |
| X A-type | HD81-12S-TTA | 2000 rpm | 30 Z / 18 Z | schematic **and** parts list §20 | **1200** |
| X B-type | HD101-12-TTA | 1500 rpm | 25 / 20 | **parts list §21 only** (`25H100` / `20H100`) | 1500 × 20/25 = **1200** |
| Z | HD-101-12-TTA | 1500 rpm ‡ | 25 Z / 20 Z | **schematic only** — §23 prints no tooth counts | **1200** |

‡ Z's own Nmax line is faded past recovery even at 600 dpi with contrast and threshold
sweeps. 1500 rpm is imported from the X block's B-TYPE parenthetical for the same motor
model; Z's legible figure (Ir 10.9 A @ 1000 rpm) matches that column exactly.

All three axes are also annotated `RESOLVER RT-5XA-11` and `TACHO VTG = 2V ±10%/1000 r.p.m.`
on this sheet — an independent confirmation of the resolver identity taken from the parts
list.

**Rapid:** factory sheet `RF1 / RF2 / RF3 = 4724`, units 0.1 in/min
(`background/parameters_factory1985_vs_live_reconciliation.md` line 84;
`background/parameter_recovery.md` line 86) → 472.4 in/min = **11,998.96 mm/min**, i.e. the
round metric design value 12.000 m/min.

The physical constraint is *motor speed at rapid ≤ Nmax*:

> **lead ≥ 11,998.96 ÷ 1200 = 9.999 mm**

**The bound survives the pessimistic input.** If you distrust the 1985 factory sheet and use
only the CRT-verified **live** `RF = 4212` (421.2 ipm = 10,698.5 mm/min), it weakens to
8.915 mm — but lead must be a multiple of 2.000 mm, and **8.915 quantises up to 10.000**. So
`lead ≥ 10.000 mm` holds either way. The quantisation argument is also immune to the
poles-vs-pole-pairs ambiguity below, because *n* is an integer on either reading.

This is a **lower** bound, not a determination: 12, 14 and 16 mm remained admissible and would
simply have meant the 1985 rapid ran the motors below rated speed. **The measurement landed on
the floor, so the bound was tight** — which retroactively confirms the other half of the pair:
the factory rapid `RF = 4724` really did run all three motors at 100 % of their rated Nmax
(1200 screw rpm × 10.000 mm = 12.000 m/min exactly). The 1985 factory parameter sheet is
corroborated by a physical measurement.

## The upper end — the RT-5XA-11 naming argument

`RT-5XA-11` = Mitsubishi spec `BKO-NC6062(A)` = Mazak `R50MA000130` = Tamagawa
**`TS2014N25E…`** — which matches the `TS2014N 25 E …` read off the machine in the
[2026-08-15 nameplate survey](feedback_nameplate_survey_2026-08-15.md). A rebadged Tamagawa
FA-SOLVER **SIZE 25 shaft** resolver, same detector on all axes.

Vendor cross-reference tables factor the suffix cleanly:

```
RT-3XB-11 = TS2014N 23 E3-1     first digit  <-> suffix letter (A,B->2; C->4) = mechanical variant
RT-3XC-11 = TS2014N 43 E3-1     second digit <-> the RT number (3,3,5,5)      = electrical variant
RT-5XC-11 = TS2014N 45 E3-1
RT-5XA-11 = TS2014N 25 E...     <-- this machine
```

RT-3XC and RT-5XC share a body and spec number and differ only in the digit that tracks the
RT number — a same-frame, non-mechanical difference is a **winding** difference, i.e. resolver
speed. Tamagawa's own nomenclature ("*number of pole pairs is normally from 1X … to 5X*")
then reads 5X = **5 pole pairs** → *n* = 5 → **lead = 10.000 mm**, exactly the floor. If *n*
were 6 the part would be an RT-6X, and that variant does exist (RT-6X0-11).

**The measurement agrees with this argument's conclusion. It does not promote the argument
into a citable proof** — the reasoning below was and remains an inference from a naming
scheme, and it was right this time. Two caveats, one now closed:

1. **No document states that the family digit is the pole count.** STILL OPEN. The
   nomenclature citation is the manufacturer's general convention and does not mention
   RT-5XA-11. Do not cite "RT-**5**XA-11 ⇒ 5 pole pairs" as established; cite the
   measurement, which stands on its own.
2. **The M2 manual says "poles", not "pole pairs".** **CLOSED by the measurement.** M2
   Maintenance Manual, printed p. 104 (PDF p. 115), verbatim: *"When resolvers are used as
   position detectors, on the machine at each 1/n (n : number of poles) revolution of the
   resolver are grid points of fixed pitch."* Read literally with 5 pole pairs = 10 poles,
   that would give **lead = 20.000 mm**. The screw turns 10 mm per revolution, so the literal
   reading is **refuted**: Mitsubishi is using "poles" loosely for resolver speed — electrical
   cycles per mechanical revolution. Anyone who re-reads that sentence in two years and
   doubles the lead is making a mistake this machine has already disproved.

## What must NOT be cited as evidence

- **The sister VQC 15/40** (`srdco/MazakVQC1540`, `RESOLVER_INDEX_DIVISOR = 5`). This is the
  circular route — it is the same claim restated. Note the agreement, never fold it back in
  as support.
- **The CNCZone VQC 15/40 retrofit thread**, *"The ballscrews on the machine have a pitch of
  10mm"* (Wayback `20150321193305`, post #15). Different machine, different part numbers, says
  *pitch* not *lead*, and never says where the number came from. A coincidence worth noting
  and nothing more.
- **"Both axes hit exactly 1200 screw rpm."** Real and resolver-independent, but *any* lead
  puts every axis at the same fraction of its own Nmax. It proves the drivetrains were matched
  to one screw-speed ceiling — it **cannot discriminate the absolute value**. One sweep
  presented this as proof at high confidence; the adversarial pass refuted it, correctly.
- **Bearing journal / pulley seat / screw OD sizes.** General industry practice,
  machine-nonspecific. Context for narrowing, never confirmation.

## The measurement, as taken

**Taken at the machine on 2026-08-17 by the owner, with the machine unpowered.** This is a
**measured mechanical fact** — read off the hardware, not derived from a document. It carries
no state in the [pin-authority evidence taxonomy](pre_power_deliverables.md#new-evidence-state-taxonomy),
which grades *signals*; the equivalent standing here is that it outranks every paper argument
in this file.

| | |
|---|---|
| Axis | **Z** |
| What was turned | the **ballscrew itself**, by hand — *not* the motor, so the 25/20 belt reduction is not in the path |
| Rotation | one full revolution, back to the mark |
| Axial travel | **10 mm** |
| Result | **lead = 10.000 mm** |

Ten millimetres against the next admissible value up (12 mm) is a 20 % difference, so the
reading discriminates the admissible set — 10 / 12 / 14 / 16 / 20 — with an enormous margin.
Indicator error, backlash and mark-alignment error are all far too small to move the answer to
a neighbouring candidate.

X and Y were not turned. They do not need to be: *"lead is the same on X, Y and Z"* is
independently **ESTABLISHED** (all three drivetrains reach 1200 screw rpm at their own motor's
ceiling, and `RF1 = RF2 = RF3`). If a later measurement on X or Y disagrees, that finding wins
and this whole family of conclusions reopens.

### What this does and does not settle

**Settled:** the lead, on all three axes. Every velocity and acceleration figure that was
waiting on motor-rpm ↔ feedrate arithmetic is now computable — screw rpm = mm/min ÷ 10, motor
rpm = screw rpm × 30/18 (Y, X A-type) or × 25/20 (X B-type, Z). The rapid ceiling the machine
was built to is **12.000 m/min = 472.4 in/min = 7.874 in/s**; that is the machine's design
limit, **not** a commissioning value — bring-up stays at the conservative `MAX_VELOCITY`
clamp in the INI.

**Determined but not yet measured:** `RESOLVER_INDEX_DIVISOR = 5`. The lead is measured and
the resolver coupling is a confirmed 1:1 shaft coupling, so *n* = lead ÷ grid spacing =
10.000 ÷ 2.000 = 5 — but the 2.000 mm grid spacing is the τ = 2 derivation, which is still
`PROPOSED`. The measurement moved *n* from "inferred from a part number" to "arithmetic on a
measured lead and one derived constant". Both fall out of a single commissioning check:

> Count `hm2_7i80.0.resolver.NN.rawcounts` against a dial indicator over several full
> **ballscrew** revolutions. Expect exactly **5 electrical cycles per screw revolution** and
> **2.000 mm (0.07874016 in) of travel per electrical cycle**. If it is 5, τ = 2 is confirmed
> from the machine and the chain is closed end to end.

**Unaffected:** `RESOLVER_SCALE`. It was never blocked by the lead — it is travel per
*electrical* revolution, set by the grid spacing.

## Is 10.000 mm plausible for this machine? Five independent checks

Asked after the measurement, as a sanity check on the result rather than as evidence for it.
All five agree; **none of them is a source** — the measurement is the source.

1. **Class norm.** 10 mm is the default ballscrew lead for 1980s vertical machining centres
   of this size and rapid. 8 and 12 mm exist in the era; 16 and 20 mm belong to the 1990s
   high-speed generation with 24–48 m/min rapids and much larger screws. A 1984 VMC with a
   12 m/min rapid sitting on 10 mm is the unremarkable middle of the distribution.
2. **Motor utilisation — the strongest of the five.** At 10 mm, the factory rapid puts all
   three axes at *exactly* their rated Nmax (1200 screw rpm; 2000 rpm on the HD-81, 1500 rpm
   on the HD-101). At 12 mm they would top out at 83 % of rating, at 20 mm at 50 %. Nobody
   specifies 2000 rpm motors, a belt reduction chosen to suit them, and a rapid parameter, and
   then leaves half the speed on the table. The design is coherent only at the floor.
3. **Screw speed is comfortable, not strained.** The screw journals ride 30 mm-bore bearings
   (`7206B` duplex, or `30TAC-62DF` on X B-type), so the screws are nominally ⌀32–40 mm.
   At 1200 rpm that is a dN of roughly 38,000–48,000 mm·rpm — well inside the ~70,000
   rule-of-thumb ceiling for a standard ball nut. Critical speed on the longest screw (X,
   1001 mm of travel, so very roughly 1300 mm between supports, fixed-supported) estimates to
   ≈2400 rpm, ×0.8 ≈ 1900 rpm usable — above 1200 with margin. *Estimate: the screw diameters
   and support spans are inferred from bearing bores, not measured.*
4. **Command resolution lines up.** The M-2 stores travels in 0.0001 in (`LX2 = −394094` =
   39.4094 in), i.e. a 1 µm-class least increment. With 5 electrical cycles per screw
   revolution the control interpolates a 2.000 mm grid to get there. Had the lead been 20 mm
   on the same detector, the same interpolation would yield a 2 µm increment — inconsistent
   with the parameter format the machine actually uses.
5. **The resolver runs at a sane rate.** At the 12 m/min design rapid the screw turns 20 rev/s
   and the detector produces **100 electrical revolutions per second**. Against a 5 kHz
   excitation that is 50 carrier cycles per electrical revolution; against 2.5 kHz, 25.
   Both work; 5 kHz is the comfortable one. **This is a new input to the still-open excitation
   choice** — an inference from the lead, not a verified figure, and it does not by itself
   overrule the scope measurement that decides carrier frequency.

The one direction none of this runs is backwards: a plausibility check cannot promote itself
into the determination. If someone later turns X or Y and gets a different number, the
measurement wins and every item above is re-argued around it.

## What is and is not blocked by this

*(Historical — this section described the state before the 2026-08-17 measurement. Nothing is
blocked by the lead any more; see [What this does and does not settle](#what-this-does-and-does-not-settle).)*

**`RESOLVER_SCALE` was never blocked.** It is set by the grid spacing — travel per *electrical*
revolution, 4000/τ µm = **2.000 mm** at τ = 2 — which does not depend on the lead.

**What was blocked** was `RESOLVER_INDEX_DIVISOR` = *n*, and any velocity or acceleration limit
derived from motor rpm. Both are now released.

## Documents swept and confirmed silent — do not re-search these

| Document | Verdict |
|---|---|
| `413LE02A000.pdf` parts list, 298 pp | **Complete sweep, all 298 pages rendered.** 41 sections, every one a physical assembly; **no** specification / technical-data / machine-data / feed-drive section exists. All four "Ball screw" entries have a blank Remarks column. Drawings carry **no dimensions of any kind**. The "OEM drawings sometimes letter the lead on the shaft" avenue is definitively closed for this book. |
| `48370_Cover.pdf` M2 Maintenance Manual, 297 pp | **No detector/resolver specification table exists and the string RT-5XA-11 does not appear.** Checked and silent: §6.6, all §6.7, §6.8.1/6.8.2, §7.15, Table 13.1, all §14.1–14.6. Do not send anyone back in here for a resolver spec. The two useful items are printed pp. 104 and 249. Page offset: printed N = PDF N + 11. |
| `413S038.pdf` Operating Manual | §2-2 gives travels, spindle, table, ATC, capacity. **No feedrate, no rapid, no ballscrew, no drive ratios.** The §2-4 gear ratios are *spindle*, not feed. |
| `413m033.pdf` Maintenance Manual, 52 pp | No feed-drive or ballscrew section. §3-2-2 lists the screw nuts as lubrication destinations only. |
| `PAREXM210E.pdf` | Byte-identical to `~/Downloads/VQC20-40_060231_Parameters.pdf` (md5 `2d25510110f9d70d5e95fb574a2dbfbf`). No ball-screw-pitch or gear-ratio parameter in the M-2 set. |
| `M00P018` / `M00P111` / `m00p135` / `m00s075` / `M00T002` / `YM2V39L` | Programming, operating, tooling, PLC ladder. Ruled out on identification. |
| MAGNE SCALE sections (parts list PDF ~170–185) | Linear-scale **options**; even if fitted they give scale pitch, not screw lead. |
| Web: `14131104600`, `14131303340`, `341311LT012` | **Zero real hits anywhere.** Mazak part numbers are not indexed by any vendor or forum and no public decoding key exists. |
| Web: `RT-5XA-11`, `RT-5XC-11`, `TS2014N25E3-1`, … | **No public datasheet exists.** The RT- number is a better handle than the Tamagawa suffix — it reaches the vendor cross-reference table — but it does not reach a datasheet. **Consider this handle exhausted.** |

## Method notes for whoever picks this up

- **Grepping OCR is not a search**, again. `413LE02A000.pdf` yields ~1,552 characters across
  298 pages; `48370_Cover.pdf` ~879 across 297; `41434WB.pdf` has a text layer only on
  pp. 1–15 (safety boilerplate). No tesseract on this box. **Every** finding here came from
  `pdftoppm -r <130..600> -png` followed by reading the PNG. The decisive datum is
  hand-lettered, rotated, inside a drawing, and invisible to every text tool.
- **Faded scans need contrast work and sometimes still don't yield** — the Z Nmax line never
  came back. Recover by cross-reference to the same part elsewhere instead.
- **Fetching:** most parts vendors 403/404 to automated fetches. practicalmachinist 403s to
  WebFetch but works with plain `curl` and a desktop User-Agent. cnczone URLs now redirect to
  cncarena.com, which blocks fetchers — use Wayback snapshots.
