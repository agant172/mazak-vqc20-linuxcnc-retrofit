# Connector & Wire-Number Cross-Reference — Spindle/Servo Bay

> **ROLE: REFERENCE** — connector/wire cross-reference for the spindle/servo bay (outside the BBIA-1 work area). Kept at this path because the io-dashboard cites it. See [../INSTALL_SPINE.md](../INSTALL_SPINE.md).


Machine: Mazak VQC-20/40, SN 060231
Source: `41434WB.pdf` — Electrical Circuit Diagram for VQC-20/40/50 (Mazatrol M-2),
Publication #41434WB, 6/1984. Full 311-page set, delivered by Mazak Corporation
2025-10-13.

This file cross-references connector labels and wire numbers read directly off
cabinet photos (spindle/servo bay, RC3A relay board) against the OEM schematic
pages. Page numbers below are PDF page numbers in `41434WB.pdf` (not the
drawing's own internal sheet numbers, which are also noted).

---

## Sheet index (confirmed by visual inspection)

| PDF page | Drawing # | Title |
|---|---|---|
| 75 | 4143075305 | Relay Card Layout / Cable Connection (RC3A) |
| 90 | 4143075301 | Front Side View — Components Layout (2) |
| 91 | 4143075332 (sheet 1/2) | Left Side View — Components Layout (3) |
| 92 | 4143075332 (sheet 2/2) | Left Side View — Components Layout (3), magnescale option |
| 93 | 4143075332 (sheet 1/2) | Rear Side View — Components Layout (4) |
| 94 | 4143075333 (sheet 2/2) | Rear Side View — Components Layout (4) |
| 121 | 4143075392 | CPU Link + Magne Scale (Option) Additional Relay Box |
| 127 | 4143075403 | Spindle Drive (Mitsubishi FR-SX) |

## Physical hardware match

Page 75's relay-function labels (SSET, MGTD, TCME, HLP, CTL, PT, Y-M43T, Y-M44T,
WLT, RA1, RA2, TC, SE, S2S, SMR, EMS, SPTD, SFD, SRV, OTR, PYOT, NZOT, ORC,
WLWT, MDINT, MDINT2, APOFT) are an exact match to the silkscreen labels on the
physical RC3A relay board (Mitsubishi BN624A375-A) photographed in the
spindle/servo bay — confirms `CN301F` on this sheet is this exact board.

## Confirmed wire-number cross-reference

Terminal row on the RC3A board (COM, 34, 36, 38, 40, 42, 44, 46, 48) — read
from cabinet photos — cross-referenced against the schematic:

| Wire tag (photo) | Function | Source |
|---|---|---|
| COM / 15 | Relay board common | pg 75, CN301E table |
| 408A | SOL-8A — Magazine CCW (forward) | pg 91/92 |
| 408B | SOL-8B — Magazine CW (reverse) | pg 91/92 |
| 410D / 410 | SOL-10 — Tool Unclamp | pg 75 (TB505 table) + pg 90 |
| 413 | SOL-13 — Gear Shift Low | pg 90 |
| 415 | SOL-15 — Spindle Air Blast | pg 90 |
| 416 | SOL-16 — Work Air Blast | pg 90 |
| 417 | SOL-17 — Mist Coolant | pg 91 |
| 431 | SOL-31 — Flood Coolant | pg 90 |
| 435 | SOL-35 — Dust Inhale Eliminate | pg 90 |

**Conclusion:** this terminal row is the RC3A board's hydraulic/pneumatic
solenoid-valve output bank — one wire per solenoid function (magazine
rotation, gear shift, coolant, air blast, mist, dust). Not signal/feedback
wiring.

## Other connectors on the spindle/servo bay, not yet fully cross-referenced

- **CON1 / CONA / CON2 / CONAA** (Honda MR-series connectors on the SX-IO1
  board) — pin-level tables now transcribed from pg 127, see
  [SX-IO1 board connectors](#sx-io1-board-connectors--con1-con2-cna-cnaa-cna1-tu-cn4)
  below. Cross-referenced against the FR-SX Parts Arrangement Diagram
  nameplate (photographed directly, `IMG_0297`).
- **CN3 / CN301A** pin tables (pg 75) — full 50-pin tables transcribed above
  only partially (CYFN, M44T, M43T, M45T, SSET, CTL, etc. on CN301A; *ESP,
  141–143, NO, SET1/2, SRN, SRI, ORC1, CTL, COM, WLAL, +LY, -LZ, SP1–4, SPTD
  on CN3) — full table available on request. **Corroboration note:** CN3's
  partial abbreviation list (`SET1/2, SRN, SRI, ORC1, CTL`) independently
  matches the pg 127 CON1 transcription below — same signal abbreviations,
  different sheet/connector — which cross-validates several of the harder
  pin reads there (notably `ORC1`/`ORC2` over an earlier misread `OBC1`/`OBC2`,
  and the `CTL` pin).

## SX-IO1 board connectors — CON1, CON2, CNA, CNAA, CNA1, T.U. CN4

Source: pg 127, dwg 4143075403, sheet 3, "SPINDLE DRIVE (MITSUBISHI FR-SX)"
(`41434WB.pdf`). Reconciled from three independent blind transcriptions of a
900-DPI scan crop, four targeted high-resolution re-verification passes on
specific disputed pins (including pixel-level wire tracing between CON1 and
T.U. CN4), and cross-checked — not treated as ground truth — against an
earlier lower-DPI human read of the same sheet.

**Status legend** (per this repo's "never invent, mark unverified" rule):
**CONFIRMED** = independent transcriptions agree (unanimously, or 2/3 with a
plausible explanation for the third's miss). **PLAUSIBLE** = majority reading
exists but a residual ambiguity (letter shape, digit shape, or connector
role) was not fully resolved. **UNRESOLVED** = genuine disagreement or
illegibility — candidates are listed, no winner is picked, and a next
verification method is named.

General caveat carried through every table below: this drafter's hand draws
"6" and "9" almost identically (confirmed by direct side-by-side digit
comparison), so any pin read as a bare "-6" carries a small residual 6-vs-9
risk even at CONFIRMED status.

**Correction, 2026-08-17 (post-reconciliation):** "T.U. CN4" on this sheet is
not a separate mystery terminal block — it is **the same physical CN4
connector** documented in the master BBIA-1 pinout `wiring/bbia1_cn_pinouts.csv`
and referenced throughout `mesa/current_pin_authority.csv`, just drawn here
from the FR-SX drive's side. That master pinout and the authority CSV's
`RECON 2026-08-08 §D` / `LOCATED 2026-08-08` notes already independently
traced several CON1↔CN4 (and CON1↔CN3, which internally continues to CN4)
correspondences **before** this transcription pass, and they are treated as
the deciding source below where they conflict with this pass's OCR/tracing —
per the repo's source hierarchy, the authority CSV and the immutable OEM
pinout outrank a fresh scan read. One correction from this cross-check
**overturns** a conclusion this same reconciliation reached minutes earlier:
CON1's **CTL pin is -27, not -17** — the dedicated stroke-template
re-verification in this pass got it wrong; the authority CSV's dated,
page-cited field trace is trusted instead. That in turn resolves the
ESP1/ESP2 ambiguity below (pin 27 is taken, so ESP1/ESP2 = -17/-18).

### T.U. CN4 (terminal-unit breakout — plain-English function labels; = BBIA-1's own CN4 connector)

| Pin(s) | Function | Status | Notes |
|---|---|---|---|
| -1, -2 | SPINDLE ZERO SPEED (OEM wire tags 231 / SS2, per master pinout) | CONFIRMED | Wire trace CONFIRMED via `mesa/current_pin_authority.csv` (`SPINDLE_ZERO_SPEED` row, 2026-08-08/09): CON1 ES1(-3)/ES2(-4) → CN4-1/-2. |
| -3, -4 | SPINDLE REV ROLLER THERMAL / COM (OEM wire tags FA / FC, per master pinout) | CONFIRMED | **Corrected** — not "SPINDLE CONTROLLER NORMAL" as first transcribed; that was an OCR misread of the print's actual literal text. Wire trace CONFIRMED via `mesa/current_pin_authority.csv` (`SPINDLE_FAULT` row): CON1 FA(-11)/FC(-12) → CN4-3/-4. Used as the ladder's spindle-fault/controller-normal status input. |
| -16, -17 | SPINDLE ORIENT ARRIVAL (ladder function name; OEM wire tags SETA / SETB) | CONFIRMED | Wire trace CONFIRMED via `mesa/current_pin_authority.csv` (`SPINDLE_ORIENT_ARRIVAL` row): CON1 OBA1(-22)/OBA2(-23) → CN4-16/-17. |
| -7, -8 | SPINDLE SET | CONFIRMED | Independently corroborated by traced wire from CON1 SET1(-7)/SET2(-8). See "(EMERGENCY STOP)" row — do not conflate. |
| (no confirmed pin) | (EMERGENCY STOP) | UNRESOLVED | The text "(EMERGENCY STOP)" is printed in this compartment of the CN4 box, but no source found an actual wire/pin arrow under it. Targeted wire-tracing separately confirmed CON1's ESP1/ESP2 pins (E-stop-suggestive abbreviation) dead-end in a jumper below the CON1 row and do **not** reach CN4 at all. This label currently has no traced pin on either end. Next verification: search the rest of sheet 3 for where this drive-internal E-stop input actually terminates, or check at the machine. (Out of scope to act on per the owner's 2026-08-15 decision that all E-stop wiring stays 100% OEM — this is flagged for documentation completeness only, not for tracing/modification.) |
| -9 | SPINDLE FORWARD | CONFIRMED | Traced to CON1 SRN (-45) — "Spindle Run **N**ormal" driving Forward is a clean semantic match. Independently pre-confirmed via `mesa/current_pin_authority.csv` `SPINDLE_FWD` row (2026-08-08), predating this pass. |
| -10 | SPINDLE REVERSE | CONFIRMED | Traced to CON1 SRI (-46) — "Spindle Run **I**nverse" driving Reverse, same semantic match. Independently pre-confirmed via `mesa/current_pin_authority.csv` `SPINDLE_REV` row (2026-08-08), predating this pass. |
| -6 | OS (OEM wire tag, per master pinout) | CONFIRMED | **Corrected** — not "COM"; that OCR read the wrong text for this pin. Traced to CON1 OS (-14) — both ends literally share the abbreviation "OS" in the print, per master pinout `wiring/bbia1_cn_pinouts.csv`. |
| -13 | ORIENT LOOP CHECK (print label); ladder function name "LOW GEAR ORIENT" (PLC Y094 CTL.M) | CONFIRMED | Wire trace CONFIRMED via `mesa/current_pin_authority.csv` (`SPINDLE_ORIENT_LOGEAR` row): CON1 CTL(-27) → T.U. CN3-15 → (internally) CN4-13, per `wiring/bbia1_cn_pinouts.csv`. Two-hop trace, not a direct CON1→CN4 wire — see the correspondence section below. |
| -12 | ORIENT COMMAND (PLC Y093 ORCM1.M) | CONFIRMED | Wire trace CONFIRMED via `mesa/current_pin_authority.csv` (`SPINDLE_ORIENT_CMD` row): CON1 ORC1(-25) → T.U. CN3-14 → (internally) CN4-12, per `wiring/bbia1_cn_pinouts.csv`. Two-hop trace, not a direct CON1→CN4 wire — see the correspondence section below. |
| -15 | COM (2nd COM pin on this strip) | CONFIRMED | |
| -18, -19 | SPEED REFERENCE / 10V MAX SPEED | CONFIRMED | |
| -20 | (same SPEED REFERENCE / 10V MAX SPEED wire group) | PLAUSIBLE | Twisted-pair splice symbol traces this 3-wire group back to CON1 SE1/SE2/SE3 (-31/-32/-30). Not present in `wiring/bbia1_cn_pinouts.csv`'s CN4 rows (that master list has no entries for CN4 pins 11, 14, 18, 19, or 20) — unconfirmed by the master pinout either way. |

**Note on the earlier human cross-check:** an earlier, lower-DPI human pass
anchored "(EMERGENCY STOP)" to pins 7/8 and every subsequent function
drifted one slot late from there (9→SET, 10→FORWARD, 6→REVERSE, 13→COM,
12→LOW GEAR ORIENT, 15→ORIENT COMMAND). All three independent, blind
transcriptions instead agree with each other on the table above, and that
reading is independently corroborated by the SRN/SRI semantic match to
FORWARD/REVERSE. The human read is superseded.

### CON1 (drive-side control I/O)

| Pin | Label | Status | Notes |
|---|---|---|---|
| -3 | ES1 | CONFIRMED | Wire trace CONFIRMED via `mesa/current_pin_authority.csv` (2026-08-08, predates this pass): → CN4 -1 (SPINDLE ZERO SPEED). Authority CSV spells it "ESL1" — treated as the same pin, letter-shape variant. |
| -4 | ES2 | CONFIRMED | → CN4 -2, same authority row. |
| -11 | FA | CONFIRMED | Wire trace CONFIRMED via `mesa/current_pin_authority.csv` (`SPINDLE_FAULT` row, 2026-08-08): → CN4 -3. |
| -12 | FC | CONFIRMED | → CN4 -4, same authority row. |
| -22 | OBA1 | CONFIRMED | **Reverted.** This reconciliation's first pass "corrected" the original read to "ORA1", reasoning from the sheet's orient theme — that was wrong. `mesa/current_pin_authority.csv`'s independent 2026-08-08 recon (predating both passes) reads the same pin "OBA1(t22)" and traces it to CN4-16, which matches the master pinout. OBA1/OBA2 stands. |
| -23 | OBA2 | CONFIRMED | Same correction and source as OBA1; → CN4 -17. |
| -17 | CTL | CONFIRMED | **RE-OVERTURNED 2026-09-02: p84 (dwg 4143075321, CN4-13 outside "1-17") and pg134 itself ("-17 CTL") both read CON1-17 — the stroke-template read was right and the authority's LOCATED note misquotes pg134.** Traces to T.U. CN3-15 → (internally) CN4-13. ESP1/ESP2 pin numbers below are unresolved again. |
| -24 | CTM | CONFIRMED | No confirmed CN4/CN3 destination — see wire-correspondence section, still UNRESOLVED for that specific question. |
| -25 | ORC1 | CONFIRMED | Wire trace CONFIRMED via `mesa/current_pin_authority.csv` (`SPINDLE_ORIENT_CMD` row): "LOCATED 2026-08-08: ORC1 CON1-25 wire 4-12 T.U CN3-14, Dwg 4143075408 pg134" → T.U. CN3-14 → (internally) CN4-12. Earlier pass misread this pin as "OBC1"; ORC1 is correct and independently corroborated by CN3/CN301A's own partial table above, which also lists `ORC1`. |
| -26 | ORC2 | CONFIRMED | |
| -7 | SET1 | CONFIRMED | Traced via unbroken conductor to CN4 -7 (SPINDLE SET). |
| -8 | SET2 | CONFIRMED | Traced via unbroken conductor to CN4 -8 (SPINDLE SET). |
| -45 | SRN | CONFIRMED | Traced to CN4 -9 (SPINDLE FORWARD). Independently pre-confirmed via `mesa/current_pin_authority.csv` `SPINDLE_FWD` row (2026-08-08). |
| -46 | SRI (trailing letter not cleanly resolved — read as SRI/SR1/SRR) | PLAUSIBLE | Traced to CN4 -10 (SPINDLE REVERSE), which favors "SRI" (Spindle Run Inverse) as intended. Independently pre-confirmed as "SRI" via `mesa/current_pin_authority.csv` `SPINDLE_REV` row (2026-08-08) — the letter-shape doubt above is resolved by that source; upgrading this to effectively CONFIRMED on the abbreviation, with only the pin's own handwriting still soft. |
| -14 | OS | CONFIRMED | Traced to CN4 -6, which the master pinout also labels "OS" (not "COM" as first transcribed for that CN4 pin — corrected above). |
| -31 | SE1 | CONFIRMED | |
| -32 | SE2 | CONFIRMED | |
| -30 | SE3 | CONFIRMED | |
| -17 / -18 | ESP1 / ESP2 | CONFIRMED (by elimination) | With CTL independently confirmed as -27 (above), the other candidate pair -17/-18 is the only one left, and two of the four original sources read it directly. The individual digits were not independently stroke-verified the way CTL's were — flag this if a future pass has spare time, but there is no live ambiguity left to resolve by elimination. **Independent of the pin number:** wire-tracing confirmed ESP1/ESP2 terminate in a jumper below the CON1 row and do **not** reach T.U. CN4, despite the "(EMERGENCY STOP)" text sitting in CN4's box in the SET1/SET2 column. |

### CON2 (PLG / pulse-generator feedback into the drive — internal to the FR-SX, not a LinuxCNC signal)

| Pin | Label | Status | Notes |
|---|---|---|---|
| -8 | COM | CONFIRMED | |
| -13 | P/SC (also read "PSG"/"P5G"/"P15C") | PLAUSIBLE | Pin number unanimous; exact letters vary source to source. |
| -1 | AGA (one source: "ABA") | PLAUSIBLE | May be the same shared 5V-COM/ground reference that CNA -20 / CNAA -20 (DGA) tie into elsewhere on this sheet, rather than a distinct CON2-only signal — not resolved. |
| -6 | N/SC (also read "N/STC"/"N15C") | PLAUSIBLE | Pin number confirmed by targeted re-verification as a self-contained single-digit glyph (medium-high, with the 6-vs-9 caveat above). |
| -14 | PA | CONFIRMED | |
| -15 | RA | CONFIRMED | |
| -16 | PB | PLAUSIBLE | **The disputed "duplicate -6" pin.** Targeted re-verification directly compared this glyph against the confirmed (N/SC) "-6" at native resolution and found PB's label carries clearly more ink than a bare "6" loop — very unlikely to be a literal duplicate. "-16" is the best-supported specific reading but the second digit wasn't resolved with full certainty. Recommend checking against a published Mitsubishi FR-SX CON2/PLG pinout if one becomes available. |
| -17 | RB | CONFIRMED | Earlier pass dropped the leading "1" and read "7". |
| -20 | SS | CONFIRMED | |
| -3 | OHS1 | CONFIRMED | Drawn in the same pin row as CON2 but positioned outside CON2's own housing-outline box — may be a flying lead/thermal-switch wire routed alongside CON2 rather than a true CON2 pin. Flagged, not resolved. |
| -2 | OHS2 | CONFIRMED | Same housing-outline caveat as OHS1. |

### CNA (= "CONA" on the print — differential orient-encoder feedback)

| Pin | Signal | Status | Notes |
|---|---|---|---|
| -16 | PA | CONFIRMED | |
| -17 | P̄A (complement) | CONFIRMED | |
| -18 | PB | CONFIRMED | |
| -19 | P̄B (complement) | CONFIRMED | |
| -14 | SC | CONFIRMED | |
| -15 | S̄C (complement) | CONFIRMED | |
| -6 | P5H | CONFIRMED | |
| -1 | OH | CONFIRMED | |
| -20 | DGA / 5V COM (inferred by parallel with CNAA's identically-positioned, explicitly-labeled -20 pin) | PLAUSIBLE | No source found a clean on-sheet text label directly at this pin. |

### CNAA (single-ended orient-encoder feedback)

One connector, one pin number per position — not two overlapping numbering
schemes, despite the visual impression. 9 pin positions in a single row,
grouped into 4 twisted pairs + 1 standalone wire: (-16,-02), (-8,-03),
(-14,blank), (-6,-1), plus -20 alone to the DGA reference.

| Pin | Signal | Status | Notes |
|---|---|---|---|
| -16 | PA | CONFIRMED | |
| -02 | (spare/unconnected — twisted-pair companion of -16) | CONFIRMED | |
| -8 | PB | CONFIRMED | Targeted re-verification specifically confirmed a single digit "8", not "18". |
| -03 | (spare/unconnected — twisted-pair companion of -8) | CONFIRMED | |
| -4 | SC | PLAUSIBLE | Two transcriptions independently read -4 at high confidence, distinct from CNA's own -14/SC pin. One targeted pass listed "-14" here in a way that reads as conflation with the neighboring CNA connector rather than a fresh read. Recommend one more clean crop of just this digit. |
| -6 | P5H | CONFIRMED | |
| -1 | OH | CONFIRMED | |
| -20 | DGA / OG (5V COM), jumpered to a shared reference point | CONFIRMED | |

### CNA1 — marked N.C. (not connected / spare on this revision)

| Pins | Signal | Status | Notes |
|---|---|---|---|
| -16, -17, -8, -9, -14, -15, -6, -1 | N.C. — no signal names on any pin; dead end | CONFIRMED | Pin-number set (same positions as CNA's PA/P̄A/PB/P̄B/SC/S̄C/P5H/OH) confirmed by 2 of 3 blind transcriptions, each explicitly re-verifying the 3rd/4th positions are single-digit -8/-9, not -18/-19, via direct digit-shape comparison. CNA1 uses its own independent local pin numbering (not a re-drawing of CONA), which happens to carry the same signal *roles* in the same order. |

### CON1-to-CN4 wire correspondence — traced where stated, not assumed elsewhere

Per this project's established finding that Mazak renumbers each conductor
at every connector hop (see `INTERFACE_ARCHITECTURE.md` §2), **CON1 pin N
and CN4 pin N are never assumed to be the same wire on numbering alone.** A
targeted pass traced specific conductors pixel-by-pixel between the CON1 row
and the CN4 box:

- **CON1 -7 (SET1) → CN4 -7**, **CON1 -8 (SET2) → CN4 -8** — unbroken conductor confirmed, high confidence. (Numbers happen to coincide; confirmed as coincidental, not a rule.)
- **CON1 -45 (SRN) → CN4 -9** (SPINDLE FORWARD) — unbroken conductor confirmed; clean semantic match to "Spindle Run **N**ormal". Independently pre-confirmed, `mesa/current_pin_authority.csv` `SPINDLE_FWD` row, 2026-08-08.
- **CON1 -46 (SRI) → CN4 -10** (SPINDLE REVERSE) — unbroken conductor confirmed; clean semantic match to "Spindle Run **I**nverse". Independently pre-confirmed, `SPINDLE_REV` row, 2026-08-08.
- **CON1 -14 (OS) → CN4 -6** (OS) — unbroken conductor confirmed; both ends share the literal abbreviation "OS" per the master pinout.
- **CON1 -31/-32/-30 (SE1/SE2/SE3) → CN4 -18/-19/-20** — traced via an explicit twisted-pair splice symbol, despite the CON1-side and CN4-side pin numbers sharing no digits. Not present in the master BBIA-1 pinout's CN4 rows — pixel-traced only, not cross-confirmed.
- **CON1 -3/-4 (ES1/ES2) → CN4 -1/-2** (SPINDLE ZERO SPEED) — CONFIRMED via `mesa/current_pin_authority.csv` `SPINDLE_ZERO_SPEED` row, 2026-08-08/09 (predates this pass; not independently pixel-traced by this pass, but no reason to doubt it).
- **CON1 -11/-12 (FA/FC) → CN4 -3/-4** — CONFIRMED via `SPINDLE_FAULT` row, 2026-08-08.
- **CON1 -22/-23 (OBA1/OBA2) → CN4 -16/-17** (SPINDLE ORIENT ARRIVAL) — CONFIRMED via `SPINDLE_ORIENT_ARRIVAL` row, 2026-08-08.
- **CON1 -25 (ORC1) → T.U. CN3-14 → (internally) CN4 -12** (ORIENT COMMAND) — CONFIRMED via `SPINDLE_ORIENT_CMD` row, dated field-located trace citing dwg 4143075408 p134. A two-hop trace through CN3, not a direct CON1→CN4 wire.
- **CON1 -27 (CTL) → T.U. CN3-15 → (internally) CN4 -13** (ORIENT LOOP CHECK / LOW GEAR ORIENT) — CONFIRMED via `SPINDLE_ORIENT_LOGEAR` row, same dated field-located trace, dwg 4143075408 p134. This is the pin this reconciliation pass's own stroke-template re-verification had misread as -17 — see the correction note at the top of this section.
- **CON1 ESP1/ESP2 do NOT reach CN4** — wires terminate at a jumper/dead-end below the CON1 row, confirmed by both visual tracing and pixel-column scanning across the full CON1-to-CN4 gap. Holds regardless of ESP1/ESP2's own pin number (now -17/-18 by elimination, above).
- **CON1 -24 (CTM)** — one source reports this wire as dashed with no corresponding CN4 arrow beneath it; not independently re-verified, and no CN4/CN3 destination found in the authority CSV either. UNRESOLVED.

## Provenance note

Wire numbers and solenoid designations above are read directly from Mazak's
own 1984 schematic set (`41434WB.pdf`), OCR-assisted but visually verified
page by page. Cross-checked against physical cabinet photos taken during the
retrofit teardown (spindle/servo bay, RC3A relay board, terminal strip).
