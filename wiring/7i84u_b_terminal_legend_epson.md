# 7i84U-B TB1/TB2/TB3 Terminal Legend — Epson Label Editor Batch Import

Companion CSV: [`7i84u_b_terminal_legend_epson.csv`](7i84u_b_terminal_legend_epson.csv) — 28 label rows covering all 8 TB1 power/logic/common terminals plus 20 allocated I/O terminals on 7i84U-B (7i44 sserial channel 1).

Formatted for **Epson Label Editor (Mac)** — same schema conventions as the BBIA-1 ferrule CSV, but the labels here go on the **7i84U-B card face / terminal-block skirt**, not on individual conductors.

> **Print-release hold:** every current row is `HOLD_TRACE` or
> `HOLD_COMMISSIONING`. The CSV is suitable for layout proofs and draft labels,
> but no row is a verified wiring instruction. Filter on `Release_Status` and
> install a permanent label only after the corresponding authority row has the
> required physical evidence.

## 7i84U physical layout ([Mesa 7i84U manual](https://www.mesanet.com/pdf/parallel/7i84uman.pdf))

- **TB1** (8-pin): pins 1/2 are both VFIELDB positive field power for TB2; pins 3/4 are both VFIELDA positive field power for TB3; pin 5 is VIN logic power; pins 6/7/8 are the common 0 V return. Pins 2 and 4 are **not** returns. The conservative documented supply range is 5–28 VDC; this project plans 24 VDC. Record W1 before wiring VIN: W1 left links VIN to VFIELDB, while W1 right requires a separate VIN feed.
- **TB3** (24-pin): IN0–IN15 on pins 1–16, OUT0–OUT7 on pins 17–24.
- **TB2** (24-pin): IN16–IN31 on pins 1–16, OUT8–OUT15 on pins 17–24. OUT8 is the proposed magazine-cover close command; the remaining TB2 I/O is spare.

## What these labels are for

The 7i84U-B carries limit/home monitoring inputs, air-pressure permissive, Renishaw MP-3 probe SKIP1, drive enables, relay-driven loads, and the proposed magazine-cover close output. These channels are not a safety-rated substitute for the hardwired E-stop chain. Its TB1/TB2/TB3 terminal blocks are not silk-screened with the machine-signal names — only the pin-position numbers — so a printed legend goes on the card or on a strip of tape stuck to the cabinet backplate next to the card.

**Blank terminals not included:**
- TB3-IN10 through TB3-IN14 (5 spare inputs)
- TB2-IN16 through TB2-IN31 (16 spare inputs)
- TB2-OUT9 through TB2-OUT15 (7 spare outputs)

If you want blank ferrules pre-made for the spare terminals, add them by hand in Label Editor or extend the CSV.

## Printer / tape

- **Printer:** Epson LabelWorks LW-PX700 (USB to Mac)
- **Recommended tape:** 9 mm or 12 mm vinyl (non-shrink) — these are card-face labels, not conductor ferrules, so heat-shrink is unnecessary
- 6 mm vinyl is suitable only for abbreviated draft labels; omit `HAL_Net` and verify that the longest `Signal` values remain readable.

## CSV schema

| Column | Contents | Suggested label field | Notes |
|--------|----------|----------------------|-------|
| **Terminal** | Authority key (e.g. `TB3-IN4`, `TB3-OUT3`) | Field 2 — small text | Logical 7i84U channel; retained as the validator key. It is not the numbered terminal position. |
| **Physical_Pin** | Numbered terminal position (e.g. `TB3-05`, `TB3-20`) | **Field 1 — largest text** | Use this to locate the actual screw/clamp position. TB3 IN0–15 map to pins 1–16 and OUT0–7 to pins 17–24; TB2 OUT8 is pin 17. |
| **Signal** | Field-side function with uncertainty left visible | Field 3 — medium text | Human-readable troubleshooting label. `?`, `VERIFY`, `TRACE`, and `RLY TBD` must remain until resolved in authority. |
| **HAL_Net** | LinuxCNC HAL net name or TB1 board reference | Optional small text | Ties I/O channels back to `linuxcnc/field_7i84u.hal`. Drop on narrow tape if it wraps. |
| **Authority_Status** | Exact status from `current_pin_authority.csv` | Do not print permanently | Evidence state, regenerated mechanically. |
| **Release_Status** | `RELEASED` or an explicit hold | Do not print permanently | Batch filter. Current values are `HOLD_TRACE` and `HOLD_COMMISSIONING`. |

## Import steps (Epson Label Editor for Mac)

1. Open Epson Label Editor and start a new label at the tape width you're loading (9 mm or 12 mm vinyl).
2. Insert text boxes for `Physical_Pin`, `Terminal`, and `Signal`. Make
   `Physical_Pin` largest. Add `HAL_Net` only if the selected tape width remains
   readable. Do not print `Authority_Status` or `Release_Status` as permanent
   machine labels.
3. **File → Import** (or the database/batch-print button) and pick `7i84u_b_terminal_legend_epson.csv`.
4. Map the text boxes: Field 1 → `Physical_Pin`, Field 2 → `Terminal`, Field 3 →
   `Signal`, and optional Field 4 → `HAL_Net`.
5. Filter `Release_Status`. At present there are no `RELEASED` rows; printing
   unfiltered produces draft labels only.
6. Preview the first few records. Long labels such as `TOUCH SENSOR BLAST
   (SOL-35 / RLY-6)` may require 12 mm tape or omission of `HAL_Net`.
7. Print. The PX700 will feed one label per selected CSV row.

## Suggested print order

Rows are ordered by terminal position: power, VIN, and common pins first (TB1-1 → TB1-8), then TB3 inputs by ascending IN number (including IN9 air and IN15 probe), TB3 outputs OUT0 → OUT7, and TB2 OUT8. Peel and stick in the same sequence and the layout matches the card face.

## Rebuild trigger

Regenerate this CSV if any of the following change in `mesa/current_pin_authority.csv`:
- 7i84U-B TB3 or TB2 pin assignments
- TB1 VFIELDA/VFIELDB/VIN/GND assignments
- HAL net names in `linuxcnc/field_7i84u.hal`

Use:

```bash
python3 scripts/generate_label_csvs.py --write
python3 scripts/generate_label_csvs.py --check
```

`scripts/validate_authority.py` also rejects either printer CSV if it no longer
matches the generated result. Compact human-facing text lives in the generator's
curated `SIGNAL_LABELS`; assignment, physical pin, HAL net, and status are derived
from authority.

The relay-driven load outputs (TB3-OUT3 through OUT7) are still `COMMISSIONING_PENDING` / `PROPOSED` in the pin authority — physical device identification (SOL-62 air blast, SOL-35 touch-sensor jet, ATC barrier existence, flood valve as separate load from Y010 pump) is not yet verified. If any of those swaps to a different terminal during commissioning, reprint the affected row.

## Provenance

Generated from `mesa/current_pin_authority.csv` and cross-checked against `linuxcnc/field_7i84u.hal` HAL net names and the Mesa 7i84U manual TB1 table.
