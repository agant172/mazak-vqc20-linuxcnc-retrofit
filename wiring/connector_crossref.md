# Connector & Wire-Number Cross-Reference — Spindle/Servo Bay

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
  board) — documented on pg 127 (Spindle Drive, drawing 4143075403) and in
  the FR-SX Parts Arrangement Diagram nameplate (photographed directly,
  `IMG_0297`). Pin-level wire numbers not yet transcribed from pg 127 — next
  pass.
- **CN3 / CN301A** pin tables (pg 75) — full 50-pin tables transcribed above
  only partially (CYFN, M44T, M43T, M45T, SSET, CTL, etc. on CN301A; *ESP,
  141–143, NO, SET1/2, SRN, SRI, ORC1, CTL, COM, WLAL, +LY, -LZ, SP1–4, SPTD
  on CN3) — full table available on request.

## Provenance note

Wire numbers and solenoid designations above are read directly from Mazak's
own 1984 schematic set (`41434WB.pdf`), OCR-assisted but visually verified
page by page. Cross-checked against physical cabinet photos taken during the
retrofit teardown (spindle/servo bay, RC3A relay board, terminal strip).
