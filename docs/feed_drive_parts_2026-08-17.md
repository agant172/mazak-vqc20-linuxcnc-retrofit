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
| 22 | Y-AXIS DRIVE SYSTEM ASS'Y | 341312LT012 | 041312AS012 | 53–54 |
| 23 | Z-AXIS DRIVE SYSTEM ASS'Y | 341313LT013 | 041313AS012 | 55–56 |

## Ball screws

| Axis | Mazak code | Part name as printed | Lead |
|---|---|---|---|
| X and Y | **`14131104600`** | `Ball screw (X, Y)` | **not printed** — Remarks column blank |
| Z | **`14131303340`** | `Ball screw (Z)` | **not printed** — Remarks column blank |

X and Y share one part number; Z is a different screw. **The parts list does not state the
lead for any axis** — the hope recorded in `project_status.md` that "Mazak screw part numbers
usually encode the lead" is not borne out by this document. The lead remains open; see
[`project_status.md`](project_status.md) for where that stands.

## Drivetrain and feedback, per axis

| Ref | Item | X / Y (§20, §22) | Z (§23) |
|---|---|---|---|
| — | HD-motor | `R12MA000730` — **HD81-12S-TT-A** (Mitsubishi) | `R12MA000700` — **HD101-12-TT-A** (Mitsubishi) |
| — | Motor pulley | `44131104710` — **18-L100** (18 teeth) | `34131303400` (teeth not printed) |
| — | Screw pulley | `34931100850` — **30-L100** (30 teeth) | `34131303361` (teeth not printed) |
| — | Timing belt | `L08UC000050` — **240L10C** (UNITTA) | `L08UC000190` — **270H100** (UNITTA) |
| — | **Resolver** | `R50MA000130` — **RT-5XA-11 (MITSUBISHI)** | `R50MA000130` — **RT-5XA-11 (MITSUBISHI)** |
| — | **Resolver coupling** | `L10MN000070` — **ARM-100-⌀9.52-⌀9.52 (MIKI PULLEY)** | `L10MN000070` — same |
| — | Angu. C. ball brg. | `F02NP001000` — 7206B TDFD C8 P5 (NSK), 2 set | same |
| — | Brake | none | `R44MA000160` — NJ-1.2-201 (Mitsubishi) |

### Two things this settles

**1. The resolver couples to the screw 1:1 — `handoff.md` open item #2 is closed.**
Drawing `041311AS012` (PDF p. 49) shows the resolver (balloon 28) in its housing (27) at the
far end of the ballscrew, joined by the coupling (25) coaxially with the screw. The coupling
is a **MIKI PULLEY ARM-100 with ⌀9.52 mm bores on both sides** — equal bores, a shaft
coupling, no ratio. **The resolver therefore reads the ballscrew directly, and
`RESOLVER_SCALE` is not scaled by any reduction.**

The 18:30 belt matters but sits somewhere else: motor → 18 T pulley → 240L10C belt → 30 T
pulley → ballscrew, i.e. a **1.6667:1 motor-to-screw reduction**, entirely on the *motor*
side of the screw. It does **not** appear between resolver and screw. Do not apply it to
`RESOLVER_SCALE`; it *is* needed for any motor-rpm ↔ feedrate arithmetic.

All three axes use the same resolver and the same coupling, so this holds for X, Y and Z.

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
