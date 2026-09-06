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
`create_wiring_workbook.py`, the builder for the MESAC workbook, is here too
(moved 2026-09-06; it read the retired crosswalk and wrote to a path that no
longer exists — do not run it from here).

## docs/, linuxcnc/, scripts/, wiring/ (repo relevance audit, 2026-09-06)

Moved after the four-agent relevance audit recorded in
`docs/repo_relevance_audit_2026-09-06.md`. Each was verified unreferenced by any
script, CI step, generator, or authority `cleanup_notes` before moving; prose links
were repointed in the same commit.

| File | Why it is here |
|---|---|
| `docs/handoff_2026-09-04.md` | Session handoff whose addenda were superseded the next day by `docs/handoff_2026-09-05.md`; its body is captured in `docs/linuxcnc_config_audit_2026-09-03.md`. |
| `docs/handoff_photo_tools_2026-08-25.md` | Thread closed — PR #110 merged 2026-08-25; `scripts/photo_tools/README.md` is the living doc. |
| `docs/LinuxCNC_Setup_HowTo.docx` | 2026-07-20 PC-setup how-to written for the **retracted 7i97T stack**; kept only because nothing else records the Tailscale / x11vnc / Probe Basic setup path. Not a source for anything Mesa. |
| `docs/fable_ladder_audit_prompt.md` | The prompt that produced `docs/ladder_signal_audit_2026-09-02.md`. Contains premises that are now false (single 7i84U; vault path), so it is not a reusable playbook. |
| `linuxcnc/phase1-draft-2026-08-07/` | Superseded Phase 1 draft config with placeholder pin names. Historical only — do not load. |
| `scripts/switch_mesa_subnet.sh` | One-off that renumbered the Mesa NIC to `10.10.10.0/24` on 2026-08-23. Job done; header keeps the rollback recipe. |
| `wiring/reconciled_pin_crosswalk_2026-08-18.{md,csv}` | Dated merge snapshot of the "Codex Manual Read" against the authority; superseded by `wiring/plane_b_pin_crosswalk.csv` and the authority. |

### `bbia1_retrofit_destination_crosswalk.csv` (retired 2026-09-05)

Was the input `scripts/generate_label_csvs.py` used to decide which BBIA-1
conductors got a Mesa-end ferrule, and therefore what the printed wire reference
sheet showed in its "Mesa landing" column. It drifted: 19 rows while
`mesa/current_pin_authority.csv` carried 41 Plane A landings. The generator now
reads the authority's `dest_connector`/`dest_pin` directly, so there is nothing to
keep in step. Kept for the `Notes` column (per-row trace hints, 2026-08 to
2026-09-05) and for `authority_conflicts.md` § 7.3, which cites it.
