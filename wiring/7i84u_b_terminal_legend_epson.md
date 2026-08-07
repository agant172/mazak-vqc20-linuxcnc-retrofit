# 7i84U-B TB1/TB2/TB3 Terminal Legend — Epson Label Editor Batch Import

Companion CSV: [`7i84u_b_terminal_legend_epson.csv`](7i84u_b_terminal_legend_epson.csv) — 22 label rows covering the 4 field-power terminals on TB1 and the 18 active I/O terminals on TB3 of 7i84U-B (7i44 sserial channel 1).

Formatted for **Epson Label Editor (Mac)** — same schema conventions as the BBIA-1 ferrule CSV, but the labels here go on the **7i84U-B card face / terminal-block skirt**, not on individual conductors.

## 7i84 physical layout (Mesa 7i84 manual)

- **TB1** (8-pin): field power only — VFIELDA/VFIELDB/VIN/GND (rows 1–4 here).
- **TB3** (24-pin): IN0–IN15 on pins 1–16, OUT0–OUT7 on pins 17–24.
- **TB2** (24-pin): IN16–IN31 on pins 1–16, OUT8–OUT15 on pins 17–24 — all spare on 7i84U-B and not labeled here.

## What these labels are for

The 7i84U-B carries the safety inputs (X/Y/Z limits + homes), the Renishaw MP-3 probe SKIP1, and the relay-driven load outputs (X/Y/Z drive enables plus the five 24 VDC → interposing-relay loads: air blast, touch-sensor blast, tap-coolant blast, ATC barrier, flood valve). Its TB1/TB2/TB3 terminal blocks are not silk-screened with the machine-signal names — only the pin-position numbers — so a printed legend goes on the card or on a strip of tape stuck to the cabinet backplate next to the card.

**Blank terminals not included:**
- TB3-IN9 through TB3-IN14 (6 spare inputs)
- TB2-IN16 through TB2-IN31 (16 spare inputs)
- TB2-OUT8 through TB2-OUT15 (8 spare outputs)

If you want blank ferrules pre-made for the spare terminals, add them by hand in Label Editor or extend the CSV.

## Printer / tape

- **Printer:** Epson LabelWorks LW-PX700 (USB to Mac)
- **Recommended tape:** 9 mm or 12 mm vinyl (non-shrink) — these are card-face labels, not conductor ferrules, so heat-shrink is unnecessary
- 6 mm vinyl also works but Field 2 (`Signal`) will need to be shortened for the longest rows (e.g. `TOUCH SENSOR BLAST (SOL-35 via RLY-6)`)

## CSV schema

| Column | Contents | Suggested label field | Notes |
|--------|----------|----------------------|-------|
| **Terminal** | Terminal-block pin identifier (e.g. `TB3-IN4`, `TB3-OUT3`) | **Field 1 — largest text** | Physical pin on the card. |
| **Signal** | Field-side function with device tag (e.g. `Z LIMIT+ (NC)`, `AIR BLAST (SOL-62 via RLY-5)`) | Field 2 — medium text | Human-readable for wiring and troubleshooting. |
| **HAL_Net** | LinuxCNC HAL net name (e.g. `limit-z-plus`, `air-blast`) | Field 3 — small text | Ties the physical terminal back to `linuxcnc/field_7i84u.hal`. Drop this field on 6 mm tape if it wraps. |

## Import steps (Epson Label Editor for Mac)

1. Open Epson Label Editor and start a new label at the tape width you're loading (9 mm or 12 mm vinyl).
2. Insert **three text boxes** on the label, one per column. Size Field 1 largest, Fields 2–3 progressively smaller. Save this as a template (e.g. "7i84U-B Terminal 9mm").
3. **File → Import** (or the database/batch-print button) and pick `7i84u_b_terminal_legend_epson.csv`.
4. Map each text box to a CSV column: Field 1 → `Terminal`, Field 2 → `Signal`, Field 3 → `HAL_Net`.
5. Preview the first few records. The longest signal name is `TOUCH SENSOR BLAST (SOL-35 via RLY-6)` at TB3-OUT4 — verify it fits your chosen tape width.
6. Print. The PX700 will feed one label per CSV row.

## Suggested print order

Rows are ordered by terminal position: power pins first (TB1-1 → TB1-4), then TB3 inputs by ascending IN number (TB3-IN0 → TB3-IN8, then TB3-IN15 for the probe), then TB3 outputs by ascending OUT number (TB3-OUT0 → TB3-OUT7). Peel and stick in the same sequence and the layout matches the card face.

## Rebuild trigger

Regenerate this CSV if any of the following change in `mesa/current_pin_authority.csv`:
- 7i84U-B TB3 or TB2 pin assignments (rows 79–98)
- Field-power bank assignments (rows 77–78)
- HAL net names in `linuxcnc/field_7i84u.hal`

The relay-driven load outputs (TB3-OUT3 through OUT7) are still `COMMISSIONING_PENDING` / `PROPOSED` in the pin authority — physical device identification (SOL-62 air blast, SOL-35 touch-sensor jet, ATC barrier existence, flood valve as separate load from Y010 pump) is not yet verified. If any of those swaps to a different terminal during commissioning, reprint the affected row.

## Provenance

Generated from `mesa/current_pin_authority.csv` rows 77–98 (7i84U-B block) and cross-checked against `linuxcnc/field_7i84u.hal` HAL net names.
