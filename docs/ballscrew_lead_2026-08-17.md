# Ballscrew lead — where it stands, 2026-08-17

**Short version: the lead is not stated in any document, but it is now bounded.
`lead ≥ 10.000 mm`, and it must be an integer multiple of 2.000 mm. 10.000 mm is the floor
of the admissible set and the best-supported value. It is not proven equal to the floor.**

A ten-minute bench measurement closes it — see [The measurement](#the-measurement-that-closes-it).

Companion: [`feed_drive_parts_2026-08-17.md`](feed_drive_parts_2026-08-17.md) (part numbers,
ratios, resolver, coupling). `project_status.md` remains the authority for the task list.

## What is established, and what is not

| Statement | Status | Basis |
|---|---|---|
| lead = *n* × 2.000 mm, *n* a positive integer | **ESTABLISHED** | M2 grid rule + τ = 2 + the 1:1 resolver coupling |
| lead ≥ 10.000 mm | **ESTABLISHED** | motor Nmax + pulley teeth + rapid parameter (below) |
| lead is the same on X, Y and Z | **ESTABLISHED** | all three drivetrains reach 1200 screw rpm at their own motor's ceiling; `RF1 = RF2 = RF3` |
| lead = exactly 10.000 mm (*n* = 5) | **NOT ESTABLISHED — strongly indicated** | needs either that factory rapid sat at 100 % of motor rating, or that the "5" in RT-**5**XA-11 is the pole-pair count |

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

This is a **lower** bound, not a determination: 12, 14 and 16 mm remain admissible, and simply
mean the 1985 rapid ran the motors below rated speed.

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

**Two weaknesses, both unresolved — do not present this as settled:**

1. **No document states that the family digit is the pole count.** The nomenclature citation
   is the manufacturer's general convention and does not mention RT-5XA-11. This is an
   inference from a naming scheme.
2. **The M2 manual says "poles", not "pole pairs".** M2 Maintenance Manual, printed p. 104
   (PDF p. 115), verbatim: *"When resolvers are used as position detectors, on the machine at
   each 1/n (n : number of poles) revolution of the resolver are grid points of fixed pitch."*
   Read literally with 5 pole pairs = 10 poles, that gives **lead = 20.000 mm**. Mitsubishi is
   almost certainly using "poles" loosely for resolver speed (the quantity that equals
   electrical cycles per mechanical revolution), and 20 mm on this screw at 12 m/min is
   implausible — **but flag this, so nobody re-reads that sentence in two years and doubles
   the lead.**

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

## The measurement that closes it

Ten minutes, no power, no control, no paperwork. Do this before committing the config.

1. Machine off and locked out. Get to a screw end or drive pulley (covers off).
2. Magnetic base and dial indicator (or a long-travel indicator / depth mic) reading **axial
   table movement** against a fixed point on the saddle.
3. Paint-mark the **screw** — not the motor. The belt reduction sits between them, so a motor
   revolution is not a screw revolution.
4. Hand-turn the screw **one full revolution**, back to the mark, and read the travel.

| Result | Meaning |
|---|---|
| **10.000 mm** | Confirms the hypothesis and *n* = 5; the whole τ chain stands |
| 12 / 14 / 16 mm | Refutes it; *n* = 6/7/8 and `RESOLVER_INDEX_DIVISOR` changes to match |
| 20.000 mm | The literal "poles" reading of M2 p. 104 was right after all |
| not a multiple of 2.000 mm | Something upstream is wrong — τ, the coupling, or the grid rule |

Take the reading over several revolutions and divide, to beat down indicator and backlash
error.

## What is and is not blocked by this

**`RESOLVER_SCALE` is NOT blocked.** It is set by the grid spacing — travel per *electrical*
revolution, 4000/τ µm = **2.000 mm** at τ = 2 — which is already established and does not
depend on the lead.

**What is blocked** is `RESOLVER_INDEX_DIVISOR` = *n*, and any velocity or acceleration limit
derived from motor rpm. So the retrofit is not stalled on this; homing index and the feedrate
ceilings are.

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
