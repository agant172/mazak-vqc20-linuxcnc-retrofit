# BBIA-1 CN1–CN6 & CN11 — Epson Label Editor Batch Import

Companion CSV: [`bbia1_cn_labels_epson.csv`](bbia1_cn_labels_epson.csv) — 164 label rows, one per active pin across CN1, CN2, CN3, CN4, CN5, CN6, and CN11.

Formatted for **Epson Label Editor (Mac)** — the current App Store app, not the deprecated "Label Editor Lite." Also works with Label Editor (Windows) and the mobile app; column semantics are the same.

## Printer / tape

- **Printer:** Epson LabelWorks LW-PX700 (USB to Mac)
- **Recommended tape for cabinet ferrules:** Epson PX heat-shrink tube (HSTC series), 6 mm or 9 mm depending on conductor gauge
- **Recommended tape for flat cable tags:** Epson PX vinyl, 9 mm or 12 mm, white

## CSV schema

| Column | Contents | Suggested label field | Notes |
|--------|----------|----------------------|-------|
| **Wire** | Factory wire number from the Mazak jacket print (e.g. `232`, `EHB`, `*DECZ`, `0G`, `+24V`) | **Field 1 — largest text** | Primary identifier. This is what future service reads back to the schematic. |
| **Location** | Connector and pin on the BBIA-1 (e.g. `CN2-15`, `CN6-39`) | Field 2 — medium text | Where the wire lands on the terminal unit today. |
| **Signal** | Mnemonic / functional name (e.g. `X-AXIS ZERO RETURN DEC`, `EMG STOP`, `HEAD LUBE PRESSURE`) | Field 3 — small text | Human-readable for troubleshooting. |
| **Destination** | Outside connector on the machine side (e.g. `CA3-A`, `TB5-D1 1-1`, blank for internal-only) | Field 4 — smallest / optional | Useful on the machine-side ferrule; can be omitted on the board-side ferrule. |

## Import steps (Epson Label Editor for Mac)

1. Open Epson Label Editor and start a new label at the tape width you're loading (6 mm HSTC, 9 mm HSTC, or 9 mm vinyl).
2. Insert **three or four text boxes** on the label — one per column you want to use. Size Field 1 largest, Fields 2–3 progressively smaller. Save this as a template ("Wire Ferrule 6mm HSTC").
3. **File → Import** (or the database/batch-print button, depending on Label Editor version) and pick `bbia1_cn_labels_epson.csv`.
4. Map each text box to a CSV column: Field 1 → `Wire`, Field 2 → `Location`, Field 3 → `Signal`, Field 4 → `Destination`.
5. Preview the first 5–10 records. Confirm nothing wraps or truncates for the widest wire number (`4-AXIS UNCLAMP INTERLOCK CANCEL` on CN5-14 is the longest signal name — you may want to abbreviate to `4AX UNCLMP INTLK CXL` or drop Field 3 entirely on 6 mm tape).
6. Print. The PX700 will feed one label per CSV row.

## Two-labels-per-wire workflow

For every conductor you can afford it, print **two labels** and shrink one onto each end:

- **Board-side ferrule:** Fields 1 + 2 (Wire + `CN2-15`) — enough to trace back to the schematic.
- **Machine-side ferrule:** Fields 1 + 4 (Wire + `CA4-U`) — enough to know where it plugs on the machine.

Fields 3 (Signal) is optional and mainly helps during the Mesa-remap phase; once wires are landed in the new cabinet, the wire number is what matters.

## What's *not* in this CSV

- **Spare pins** (rows with no wire number and no signal) — skipped. If you want blank labels for spares, add them by hand in Label Editor.
- **CN7 (50-pin, pallet-changer 2PC)** — deliberately excluded; the 2PC is not being carried into the Mesa retrofit. If you decide to preserve it, generate a second CSV from the CN7 rows in the source pinouts file.
- **CN8, CN9, CN10, CN200** — not part of the connectors you're cutting. Same source drawings if you need them later.

## Provenance

Generated from [`bbia1_cn_pinouts.csv`](bbia1_cn_pinouts.csv) by filtering to rows with a wire number or signal name and reshaping columns for Epson Label Editor's batch-import format.
