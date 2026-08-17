# Feed drive train, from the OEM parts list — 2026-08-17

**Source:** `PARTS LIST For VQC 20/40 & 50`, Publication **413LE02A000**, 298 pp.
**Where the file is:** `~/Documents/obisidian/Machine Shop/Mazak VQC-20-40 Retrofit/Manuals/413LE02A000.pdf`
(byte-identical, 42,260,402 bytes, to `VQC20-40_060231_Parts_List.pdf` in the Drive folder
`Manuals_SN060231`, file ID `1QYgDY2lXB1U-v0ICt8P7bcZHTc7mQIYc`). It was already on the
OptiPlex, filed under its Mazak publication number — nothing in the filename says
"parts list", which is why it read as missing. See "Filing traps" at the bottom.

**How this was read:** the PDF is a pure image scan — **1,552 characters of text layer across
all 298 pages**, all of it front matter. Everything below was read by rendering pages to PNG
(`pdftoppm -r 130 -png -f N -l N`) and looking at them. Grep and OCR return nothing useful
here; see trap #1 in [`../handoff.md`](../handoff.md).

**Page mapping:** section `N-1` is at PDF page ≈ `2N + 9` (drawing), `N-2` at `2N + 10`
(parts table). Confirmed against the footers, which print `- N-n-E -`. Drift is a page or
two by section 46, so probe rather than trust the formula.

## The three axis sections

| Section | Title | List No. | Drawing | PDF pages |
|---|---|---|---|---|
| 20 | X-AXIS DRIVE SYSTEM ASS'Y (A-Type) | 341311LT012 | 041311AS012 | 49–50 |
| 21 | X-AXIS DRIVE SYSTEM ASS'Y **(B-Type)** | 341311LT021 | 041311AS021 | 51–52 |
| 22 | Y-AXIS DRIVE SYSTEM ASS'Y | 341312LT012 | 041312AS012 | 53–54 |
| 23 | Z-AXIS DRIVE SYSTEM ASS'Y | 341313LT013 | 041313AS012 | 55–56 |

> **Correction, same day.** The first version of this file read only §20 and reported that
> "X and Y share part `14131104600`". That is the **A-type** X drive. **SN 060231 is almost
> certainly the B-type**, a separate section with a different screw and a different belt
> ratio. Corrected below; the A-type row is kept so the mistake is not silently
> re-introduced by the next person who opens §20 first.

## Ball screws

| Axis | Mazak code | Part name as printed | Lead |
|---|---|---|---|
| X — **A-type** (§20) | `14131104600` | `Ball screw (X, Y)` | not printed — Remarks blank |
| X — **B-type** (§21) | **`14131110470`** | `Ball screw (X)` | not printed — Remarks blank |
| Y (§22) | `14131104600` | `Ball screw (X, Y)` | not printed — Remarks blank |
| Z (§23) | **`14131303340`** | `Ball screw (Z)` | not printed — Remarks blank |

**The parts list does not state the lead for any axis.** The Remarks column is blank on all
four ball-screw entries in the book, and the drawings carry no dimensions at all — the screws
are drawn as plain unthreaded cylinders with break lines, no thread representation, no
"⌀40 × 10" callout. The premise recorded in `project_status.md`, that "Mazak screw part
numbers usually encode the lead", is not borne out. For where the lead actually stands see
[`ballscrew_lead_2026-08-17.md`](ballscrew_lead_2026-08-17.md).

### Which X drive is this machine? Evidence says B-type

| Evidence | Reads |
|---|---|
| This machine's own M-2 soft limits | X ≈ 39.4 in / 1002 mm (`LX2 = −394094`, [`parameters_sn060231.md`](parameters_sn060231.md) lines 51–60) |
| `413S038.pdf` (Operating Manual) PDF p. 12 | "Table lateral traveling stroke, x-axis: **A type 635 (25.0″), B type 1000 (39.4″)**" |
| Nameplate photo survey | X motor is **HD 101-12** ([`photo_survey_misc.md`](photo_survey_misc.md) lines 64, 197) — Y is HD 81-12S |

Two independent lines, so treat **B-type as the working assumption for X**, and confirm it by
counting pulley teeth at the machine. A 1000 mm-travel X screw cannot be the same part as the
764 mm-travel Y screw in any case, which alone retires the "X and Y share a part number, so
they share a lead" bridge for this serial.

## Drivetrain and feedback, per axis

| Item | X A-type (§20) | **X B-type (§21) — likely this machine** | Y (§22) | Z (§23) |
|---|---|---|---|---|
| HD-motor | `R12MA000730` — HD81-12S-TT-A | **HD101-12-TT-A** | HD81-12S-TT-A | `R12MA000700` — HD101-12-TT-A |
| Motor pulley | `44131104710` — 18-L100 | **20H100 (20 T)** | 18-L100 | **20 T** † |
| Screw pulley | `34931100850` — 30-L100 | **25H100 (25 T)** | 30-L100 | **25 T** † |
| **Motor→screw ratio** | 1.6667:1 | **1.25:1** | 1.6667:1 | **1.25:1** † |
| Timing belt | `L08UC000050` — 240L10C | **240H100** | 240L10C | `L08UC000190` — 270H100 |
| Angu. C. ball brg. | `F02NP001000` — 7206B TDFD C8 P5 (NSK) | **30TAC-62DF (NSK)** | 7206B TDFD C8 P5 | 7206B TDFD C8 P5 |
| **Resolver** | `R50MA000130` — **RT-5XA-11 (MITSUBISHI)** | same | same | same |
| **Resolver coupling** | `L10MN000070` — **ARM-100-⌀9.52-⌀9.52 (MIKI PULLEY)** | same (ref 22) | same (ref 26) | same (ref 6) |
| Brake | none | none | none | `R44MA000160` — NJ-1.2-201 |

† Z tooth counts are **not printed in the parts list** — §23 gives pulley part numbers only
(`34131303400`, `34131303361`). The 20 T / 25 T figures come from the servo-drive schematic,
`41434WB.pdf` PDF p. 128 (see [`ballscrew_lead_2026-08-17.md`](ballscrew_lead_2026-08-17.md)).
Anyone who assumed X/Y's 18:30 applied to Z would have been wrong.

**Motor ratings, from the same schematic** (not previously recorded anywhere in this repo):
HD-81-12S-TTA — Ir 6.3 A @ 2000 rpm, Ip 45 A, **Nmax 2000 rpm**.
HD-101-12-TTA — Ir 10.9 A @ 1000 rpm, Ip 65 A, **Nmax 1500 rpm**.
Tacho 2 V ±10 % per 1000 rpm on all axes.

### Two things this settles

**1. The resolver couples to the screw 1:1 — `handoff.md` open item #2 is closed.**
Drawing `041311AS012` (PDF p. 49) shows the resolver (balloon 28) in its housing (27) at the
far end of the ballscrew, joined by the coupling (25) coaxially with the screw. The coupling
is a **MIKI PULLEY ARM-100 with ⌀9.52 mm bores on both sides** — equal bores, a shaft
coupling, no ratio. **The resolver therefore reads the ballscrew directly, and
`RESOLVER_SCALE` is not scaled by any reduction.**

The timing belt matters but sits somewhere else: motor → motor pulley → belt → screw pulley →
ballscrew, i.e. a motor-to-screw reduction of **1.6667:1 (A-type X, Y)** or **1.25:1
(B-type X, Z)**, entirely on the *motor* side of the screw. It does **not** appear between
resolver and screw. Do not apply it to `RESOLVER_SCALE`; it *is* needed for motor-rpm ↔
feedrate arithmetic — and use the right one per axis.

This holds for X, Y and Z, and for **both** X variants: the same `L10MN000070` coupling
appears at §20 ref 25, §21 ref 22, §22 ref 26 and §23 ref 6.

Corroborated independently from the control side: the M2 Maintenance Manual, printed p. 249
(PDF p. 260) Table 14.3-1, classifies the RT detector as *"Ball screw tip position detector —
Semi-closed type (ball screw drive)"*, with a figure showing the TT tacho on the motor and the
RT resolver at the far end of the screw, past the table. Two documents, two sides of the
machine, same conclusion.

**2. There is a Mitsubishi part number for the resolver: `RT-5XA-11`.**
The nameplates physically on the machine read `TS2014N 25 E …` (Tamagawa) per the
[2026-08-15 survey](feedback_nameplate_survey_2026-08-15.md), and an earlier pass concluded
the TS2014N-25E datasheet "does not exist publicly". The OEM parts list gives Mitsubishi's
own ordering number for the same item — **`R50MA000130` / `RT-5XA-11`** — which is a fresh
search handle for the transformation ratio and pole count that the Tamagawa suffix could not
reach. This bears directly on the resolver-scale question and on
[`../bom/README.md`](../bom/README.md#which-7i49-the-sister-machine-actually-runs--settled-2026-08-17)
(7i49 vs 7i49HV, where transformation ratio is the deciding spec).

## Filing traps — two manuals were "missing" while sitting on disk

Both cost a search. Neither filename contains a word anyone would search for.

| Looking for | Actually on disk as |
|---|---|
| `VQC20-40_060231_Parts_List.pdf` | `…/Mazak VQC-20-40 Retrofit/Manuals/**413LE02A000.pdf**` (its publication number) |
| M2 Maintenance Manual, 297 pp | `~/Downloads/**48370_Cover.pdf**` (and a copy on the Desktop) |

`handoff.md` says "all three PDFs, already downloaded, `~/Downloads` on the OptiPlex" — true,
but only if you know the M2 manual answers to `48370_Cover.pdf`. **Before concluding a
document is missing, match on file size and page count, not on filename.**
