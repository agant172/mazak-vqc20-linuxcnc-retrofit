# BBIA-1 CN1–CN6 & CN11 — Epson Label Editor Batch Import

Companion CSV: [`bbia1_cn_labels_epson.csv`](bbia1_cn_labels_epson.csv) — 164 label rows, one per active pin across CN1, CN2, CN3, CN4, CN5, CN6, and CN11.

This is the OEM trace/reference batch. For short 6 mm ferrules that print only
the planned new Mesa physical landing, use
[`bbia1_mesa_end_ferrules_epson.csv`](bbia1_mesa_end_ferrules_epson.csv) and its
[instructions](bbia1_mesa_end_ferrules_epson.md).

Formatted for **Epson Label Editor on Windows**. The generated CSV uses Windows
CRLF records and plain ASCII label text. Epson documents CSV as a supported
import format, and its current Windows Label Editor supports the LW-PX700.

## Workflow this CSV is built for

**Primary method (chosen 2026-08-09): laminated reference sheet, not per-wire
ferrules.** Because the factory jacket print stays legible a few inches back
from the cut, each conductor already carries its OEM wire number; a laminated
cross-reference card in the cabinet door does the lookup job without on-wire
clutter. Generate it with `python3 scripts/generate_wire_reference_sheet.py`
(writes [`bbia1_wire_reference_sheet.html`](bbia1_wire_reference_sheet.html) —
print from a browser and laminate; regenerate after any label CSV change).

**Per-wire ferrules from this CSV are the fallback**, used only for conductors
whose jacket print turns out faded or unreadable at the cut. For those: cut the
connector off just outside the shell and label the exposed conductor end only —
one ferrule per wire, at the cut end. (The Mesa-end destination ferrules in
`bbia1_mesa_end_ferrules_epson.csv` are unaffected: those stay per-wire, since
the destination is new information not printed on any jacket.)

## Printer / tape

- **Printer:** Epson LabelWorks LW-PX700 connected to the Windows computer
- **Recommended tape for cabinet ferrules:** Epson PX heat-shrink tube (HSTC series), 6 mm or 9 mm depending on conductor gauge
- Vinyl (non-shrink) is fine for the common rails (0G, +24V, P24) if you'd rather bundle those

## CSV schema

| Column | Contents | Suggested label field | Notes |
|--------|----------|----------------------|-------|
| **Wire** | Factory wire number from the Mazak jacket print (e.g. `232`, `EHB`, `*DECZ`, `0G`, `+24V`) | **Field 1 — largest text** | Primary identifier. Matches the print still visible on the intact sheath. |
| **Location** | Connector and pin on the BBIA-1 (e.g. `CN2-15`, `CN6-39`) | Field 2 — medium text | Which board pin this conductor was pulled off of — the key you use against `bbia1_cn_pinouts.md` to decide where it lands on Mesa. |
| **Signal** | Mnemonic / functional name (e.g. `X-AXIS ZERO RETURN DEC`, `EMG STOP`, `HEAD LUBE PRESSURE`) | Field 3 — small text | Human-readable for troubleshooting. Drop this field on 6 mm tape if it wraps. |

## Import steps (Epson Label Editor for Windows)

1. Open Epson Label Editor and select **Import (Horizontal Text)** on the
   New/Open screen.
2. Choose **Load Import Data** and open `bbia1_cn_labels_epson.csv`.
3. Insert three import frames and select `Wire`, `Location`, and `Signal`. Make
   `Wire` largest and save the layout as a reusable template.
4. Use the row checkboxes in the Data window to select the desired labels.
5. Preview the full selection. If `4-AXIS UNCLAMP INTERLOCK CANCEL` wraps or
   truncates, omit `Signal` on narrow tube rather than changing the source CSV.
6. Print the selected rows.

## Suggested print order

The rows are grouped by connector (CN1 → CN2 → CN3 → CN4 → CN5 → CN6 → CN11), so you can slit the tape into per-connector runs and bag them separately as you cut each shell. Keeps the workbench tidy.

## What's *not* in this CSV

- **Spare pins** (rows with no wire number and no signal) — skipped. If you want blank ferrules for spares, add them by hand in Label Editor or extend the CSV.
- **CN7 (50-pin, 2PC pallet changer)** — deliberately excluded; the 2PC is not being carried into the Mesa retrofit. If you decide to preserve it, generate a second CSV from the CN7 rows in the source pinouts file.
- **CN8, CN9, CN10, CN200** — not part of the connectors being cut. Same source drawings if you need them later.

## Provenance

Generated from [`bbia1_cn_pinouts.csv`](bbia1_cn_pinouts.csv) by filtering to rows with a wire number or signal name and reshaping columns for Epson Label Editor's batch-import format.

Epson references: [Windows imported-data workflow](https://files.support.epson.com/docid/cpd4/cpd40145/source/label_printers/source/computer/label_editor/tasks/label_editor_importing_data.html) and [Windows software/download compatibility](https://labelworks.epson.com/pages/downloads).
