# BBIA-1 CN1–CN6 & CN11 — Epson Label Editor Batch Import

Companion CSV: [`bbia1_cn_labels_epson.csv`](bbia1_cn_labels_epson.csv) — 164 label rows, one per active pin across CN1, CN2, CN3, CN4, CN5, CN6, and CN11.

This is the OEM trace/reference batch. For short 6 mm ferrules that print only
the planned new Mesa physical landing, use
[`bbia1_mesa_end_ferrules_epson.csv`](bbia1_mesa_end_ferrules_epson.csv) and its
[instructions](bbia1_mesa_end_ferrules_epson.md).

Formatted for **Epson Label Editor (Mac)** — the current App Store app, not the deprecated "Label Editor Lite." Also works with Label Editor (Windows) and the mobile app; column semantics are the same.

## Workflow this CSV is built for

**Cut the connector off just outside the shell and label the exposed conductor end only.** The original cable sheath stays intact on the harness side, so the far ends of the wires (into CA3, CA4, TB5, etc.) are not accessible for a second label — and don't need one, because the intact factory jacket print stays legible a few inches back from the cut.

**One ferrule per wire, at the cut end.**

## Printer / tape

- **Printer:** Epson LabelWorks LW-PX700 (USB to Mac)
- **Recommended tape for cabinet ferrules:** Epson PX heat-shrink tube (HSTC series), 6 mm or 9 mm depending on conductor gauge
- Vinyl (non-shrink) is fine for the common rails (0G, +24V, P24) if you'd rather bundle those

## CSV schema

| Column | Contents | Suggested label field | Notes |
|--------|----------|----------------------|-------|
| **Wire** | Factory wire number from the Mazak jacket print (e.g. `232`, `EHB`, `*DECZ`, `0G`, `+24V`) | **Field 1 — largest text** | Primary identifier. Matches the print still visible on the intact sheath. |
| **Location** | Connector and pin on the BBIA-1 (e.g. `CN2-15`, `CN6-39`) | Field 2 — medium text | Which board pin this conductor was pulled off of — the key you use against `bbia1_cn_pinouts.md` to decide where it lands on Mesa. |
| **Signal** | Mnemonic / functional name (e.g. `X-AXIS ZERO RETURN DEC`, `EMG STOP`, `HEAD LUBE PRESSURE`) | Field 3 — small text | Human-readable for troubleshooting. Drop this field on 6 mm tape if it wraps. |

## Import steps (Epson Label Editor for Mac)

1. Open Epson Label Editor and start a new label at the tape width you're loading (6 mm HSTC or 9 mm HSTC).
2. Insert **three text boxes** on the label, one per column. Size Field 1 largest, Fields 2–3 progressively smaller. Save this as a template (e.g. "Wire Ferrule 6mm HSTC").
3. **File → Import** (or the database/batch-print button) and pick `bbia1_cn_labels_epson.csv`.
4. Map each text box to a CSV column: Field 1 → `Wire`, Field 2 → `Location`, Field 3 → `Signal`.
5. Preview the first 5–10 records. The longest signal name is `4-AXIS UNCLAMP INTERLOCK CANCEL` (CN5-14) — if it wraps or truncates on your chosen tape, either drop Field 3 for that row or abbreviate it in the CSV.
6. Print. The PX700 will feed one label per CSV row.

## Suggested print order

The rows are grouped by connector (CN1 → CN2 → CN3 → CN4 → CN5 → CN6 → CN11), so you can slit the tape into per-connector runs and bag them separately as you cut each shell. Keeps the workbench tidy.

## What's *not* in this CSV

- **Spare pins** (rows with no wire number and no signal) — skipped. If you want blank ferrules for spares, add them by hand in Label Editor or extend the CSV.
- **CN7 (50-pin, 2PC pallet changer)** — deliberately excluded; the 2PC is not being carried into the Mesa retrofit. If you decide to preserve it, generate a second CSV from the CN7 rows in the source pinouts file.
- **CN8, CN9, CN10, CN200** — not part of the connectors being cut. Same source drawings if you need them later.

## Provenance

Generated from [`bbia1_cn_pinouts.csv`](bbia1_cn_pinouts.csv) by filtering to rows with a wire number or signal name and reshaping columns for Epson Label Editor's batch-import format.
