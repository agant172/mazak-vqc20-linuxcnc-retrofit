# Archive

Frozen source artifacts kept for provenance. Not part of the active working set;
nothing here is generated from or feeds the live config or the I/O dashboard.

## crosswalk/

The YM2V39L element-list ↔ I/O-dashboard cross-walk (dated 2026-07-27). This was
the discovery worksheet used to draft field-I/O rows into
`mesa/current_pin_authority.csv`. Those drafted rows carry
`primary_source = element_list_crosswalk_2026-07-27`; that tag refers to
`archive/crosswalk/element_dashboard_crosswalk.csv` in this folder.

Archived (not deleted) because ~12 authority rows still cite it as their origin.
It stays `PROPOSED`-grade evidence: a cross-walk inference, not a cabinet
measurement. Do not treat anything here as verified.

## workbooks/ (archived 2026-09-06, owner decision)

The three Excel workbooks and their two hand-kept sibling CSVs. All were snapshots
of a 132-row pin authority that has since become 124 rows with two-plane conductor
tables; none was ever regenerated, and the last one with a generator
(`MESAC_Wiring_Crosswalk.xlsx`) drew on the crosswalk CSV retired the day before.

| File | What it was |
|---|---|
| `Mazak_VQC_20-40_Retrofit_IO_Workbook.xlsx` | bom/ I/O planning snapshot, 2026-08-15 |
| `Mazak_Wiring_Master_…Current_Authority.xlsx` + ` - Overview.csv` | wiring/ consolidated master snapshot, 2026-08-15, and its plain-text index |
| `MESAC_Wiring_Crosswalk.xlsx` + `_VisioImport.csv` | Visio import workbook (built 2026-09-03 by `scripts/create_wiring_workbook.py`) and its hand-filtered 86-row export |

Current, always-regenerated views of the same data: the I/O Navigator
(`io-dashboard/`) and the label/wire-sheet set under `wiring/labels/`.
`docs/wiring_audit_2026-09-03.md` cites the VisioImport CSV as it stood then.

### `bbia1_retrofit_destination_crosswalk.csv` (retired 2026-09-05)

Was the input `scripts/generate_label_csvs.py` used to decide which BBIA-1
conductors got a Mesa-end ferrule, and therefore what the printed wire reference
sheet showed in its "Mesa landing" column. It drifted: 19 rows while
`mesa/current_pin_authority.csv` carried 41 Plane A landings. The generator now
reads the authority's `dest_connector`/`dest_pin` directly, so there is nothing to
keep in step. Kept for the `Notes` column (per-row trace hints, 2026-08 to
2026-09-05) and for `authority_conflicts.md` § 7.3, which cites it.
