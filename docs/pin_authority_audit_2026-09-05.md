# Signal-map audit — mesa/current_pin_authority.csv (2026-09-05)

> **ROLE: AUDIT RECORD** — findings and fixes from a targeted audit of the
> pin-authority CSV. Governing doc: [`authority_hierarchy.md`](authority_hierarchy.md).

## Method

`scripts/validate_authority.py` was run first and passed clean (0 errors, 1
already-tracked warning on COOLANT_ON's missing factory_wire) — it verifies
CSV-vs-HAL physical pin binding, which was not re-checked here. This audit
targeted the qualitative gap the script can't catch: does each row's
`authority_status` actually match what its own `cleanup_notes` say, and do
cited sources (ladder transcriptions, dwg pages, other CSVs) actually support
the claim?

124 rows were split into 5 subsystem clusters, each audited by an independent
read-only agent with no visibility into the others' findings:

| Cluster | Rows | Subsystems |
|---|---|---|
| Spare | 32 | Spare |
| Motion | 18 | Motion, Drive safety, Panel |
| Field I/O | 27 | Field I/O, Utility, Expansion, Safety, Machine safety, Coolant, Air, Hydraulic, Hydraulic safety |
| Axis/Spindle | 24 | Axis safety, Spindle, Spindle gear, Spindle safety |
| ATC/Magazine | 23 | Magazine, ATC tool, ATC interlock, ATC, ATC motor |

Every row was classified VERIFIED / DEFECT / UNSOURCED / AMBIGUOUS, matching
the format from the 2026-09-02 ladder/signal/diagram audit. Corrections were
applied centrally (not by the agents) after all five reports were in, in four
commits, one per finding cluster, each citing sources.

## Scorecard

| Cluster | VERIFIED | DEFECT | UNSOURCED | AMBIGUOUS |
|---|---|---|---|---|
| Spare | 32 | 0 | 0 | 0 |
| Motion | 16 | 2 | 0 | 0 |
| Field I/O | 20 | 4 | 3 | 0 |
| Axis/Spindle | 16 | 8 | 0 | 0 |
| ATC/Magazine | 17 | 2 | 0 | 4 |
| **Total** | **101** | **16** | **3** | **4** |

## Highest-value catch

**SPINDLE_FAULT (7i84U-A TB3 IN14)** carried an unresolved active-high
polarity inversion nowhere flagged as open. The row's own citation
(`docs/ladder/spindle_run_ladder_transcription.md`) confirms FR-SX's FA/FC
signal is "controller normal" — active HIGH when the drive is *healthy* — but
`field_point_or_load` called it a "fault output" and `field_7i84u.hal` binds
IN14 raw with no `-not`, i.e. treats healthy-high as fault-high. Its sibling
`SPINDLE_AT_SPEED` correctly carries a polarity-unverified flag; this one
didn't. A bench-procedure doc dated the same day as this audit already lists
the physical resolution as open item 10 — the CSV/HAL just didn't say so.
**Fixed: documentation only** (field_point_or_load + cleanup_notes annotated);
the actual polarity is a bench item, not something this audit resolved.

## Fixes applied (commits, in order)

1. **`79607e3`** — `ATC_ZONE_Y` / `ATC_ZONE_Z`: `authority_status`
   `FACTORY_INTERFACE` → `DEFERRED`. Both rows' own 2026-09-02 audit note said
   the OEM tap point was never confirmed; the status field was never updated
   to match. Confirmed independently by two of the five cluster agents.
2. **`8e64671`** — `CYCLE_START_PB`: reworded a present-tense claim that the
   WHB04B pendant "is the current cycle-start path" — `pendant_whb04b.hal` is
   entirely commented-out placeholder code, no functional path exists yet.
3. **`7867d0f`** — `THERMAL_ALARM_CHAIN` / `DOOR_INTERLOCK`: corrected
   `LADDER-REF` citations pointing at `estop_ladder_transcription.md` (covers
   only the E-stop chain) to `interlocks_ladder_transcription.md` (actually
   covers AL57/AL55). `COOLANT_LOW` / `HYD_PRESS_OK`: marked `LADDER-REF
   UNSUPPORTED` — no ladder doc covers either signal at all. Seven rows'
   `primary_source` values (`archived_wiring_map`, `phase2_plan`,
   `front_control_panel_wiring.md`, `open_issues.md`) were dead references
   already identified in `docs/claim_audit_2026-08-07.md` item 17 with a
   recommended replacement table that had never been applied — applied now.
4. **`31616f3`** — `SPINDLE_FAULT` polarity annotation (above). `X_HOME`:
   HAL comment said "LS-42 assumed" after the CSV had already promoted it to
   "confirmed" — comment corrected. Six overtravel limit rows (X/Y/Z
   LIMIT_PLUS/MINUS): dropped a `LADDER-REF` to
   `interlocks_ladder_transcription.md` that doesn't cover overtravel
   switches at all (looks like a copy-paste from a neighboring row) — their
   real source (Dwg 4143075410 p136) was already present and is unaffected.
   Also fixed a stale `field_7i84u.hal` comment asking to "add a SERVO_READY
   row" that has existed since 2026-07-23; flagged that SERVO_READY may
   already be the drive-ready signal that comment's brake-release logic
   wants, without wiring that logic change in myself.

No component/runtime logic was changed anywhere in this pass — every fix is
to a documentation field (`authority_status`, `cleanup_notes`,
`field_point_or_load`, `primary_source`) or a HAL comment.

## Open items — not fixed, need owner or bench

- **`MAG_TOOL_AVAILABLE` / `SPINDLE_TOOL_AVAILABLE`** — the cited ladder
  transcription itself raises a possible sensor swap ("the reverse of what
  the names suggest"), not disclosed in either row. Already tracked as
  **bench item 48** in `docs/bench_procedure_2026-09-05.md` — surfaced
  independently by this audit too, not a new finding.
- **`MANUAL_TOOL_UNCLAMP_PB` / `MANUAL_TOOL_CLAMP_PB`** — cosmetic mnemonic
  spelling inconsistencies (`TUCFS.M` vs `TUCF.M`, `TCFS.M` vs `TCCF.M`)
  baked in since 2026-08-08 across multiple files. No pin/status impact; not
  changed since it's not clear which spelling is "correct" without owner
  input.
- **`ESTOP_MONITOR` primary_source** — replaced the dead reference names but
  the precise backing document for this specific row's claim still isn't
  confirmed; flagged in place rather than guessed.
- **`SPINDLE_FAULT` / `X_HOME` / `COOLANT_LOW` / `HYD_PRESS_OK`** — all
  reference open bench items already tracked elsewhere (bench_procedure doc
  items 10/47, and two rows needing a real OEM source found by a cabinet
  trace). No new bench list needed; this audit didn't surface anything
  outside what's already queued.

## Files touched

- `mesa/current_pin_authority.csv` — 18 rows edited across 4 commits.
- `linuxcnc/field_7i84u.hal` — 2 stale comments corrected (X_HOME, Z-brake
  SERVO_READY note).

`scripts/validate_authority.py` passed after every commit (0 errors, the same
1 pre-existing COOLANT_ON warning throughout).
