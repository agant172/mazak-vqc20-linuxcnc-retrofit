# Signal-map re-audit — mesa/current_pin_authority.csv (2026-09-06)

> **ROLE: AUDIT RECORD** — findings and fixes from a re-audit of the
> pin-authority CSV, one day after [`pin_authority_audit_2026-09-05.md`](pin_authority_audit_2026-09-05.md).
> Governing doc: [`authority_hierarchy.md`](authority_hierarchy.md).

## Why a re-audit one day later

Two commits touched the CSV or its consumers *after* the 2026-09-05 audit
was recorded, both late that night:

- `c5a1692` — all twelve 7i49 rows had the wrong connector label (P1 where
  their own cleanup_notes implied P3/P4). A copy-paste failure mode worth
  hunting for elsewhere.
- `b1826ac` — `wiring/bbia1_retrofit_destination_crosswalk.csv` retired;
  ferrules/destinations now derive live from this CSV's own
  `dest_connector`/`dest_pin`. Any row still citing the old file is stale.

Plus `b57e2ef` deleted both diagram sets (WireViz, QElectroTech), so any
diagram citation is now dangling.

## Method

`scripts/validate_authority.py` and `scripts/validate_control_logic.py`
both passed clean before starting (0 errors; the one pre-existing
COOLANT_ON factory_wire warning). As on 2026-09-05, this audit targeted
what the scripts can't see: does each row's `authority_status` match its
own notes, do cited sources actually cover the signal, and did the two
post-audit commits leave anything stale.

Same 5-cluster split as 2026-09-05 (124 rows), one independent read-only
agent per cluster, no visibility into each other. **New this pass:** every
non-VERIFIED finding was then re-checked by two further independent agents
prompted to *refute* it, reading the sources themselves; a finding needed
both votes to survive. All 25 did (50/50 votes confirmed). Corrections were
applied centrally after all reports were in — one commit per cluster.

| Cluster | Rows | Subsystems |
|---|---|---|
| Spare | 32 | Spare |
| Motion | 18 | Motion, Drive safety, Panel |
| Field I/O | 27 | Field I/O, Utility, Expansion, Safety, Machine safety, Coolant, Air, Hydraulic, Hydraulic safety |
| Axis/Spindle | 24 | Axis safety, Spindle, Spindle gear, Spindle safety |
| ATC/Magazine | 23 | Magazine, ATC tool, ATC interlock, ATC, ATC motor |

## Scorecard

| Cluster | VERIFIED | DEFECT | UNSOURCED | AMBIGUOUS |
|---|---|---|---|---|
| Spare | 29 | 3 | 0 | 0 |
| Motion | 14 | 4 | 0 | 0 |
| Field I/O | 19 | 8 | 0 | 0 |
| Axis/Spindle | 19 | 3 | 2 | 0 |
| ATC/Magazine | 18 | 4 | 0 | 1 |
| **Total** | **99** | **22** | **2** | **1** |

The two specific hunts came back clean: **no further connector-label
copy-paste errors** of the c5a1692 kind, **no row cites the retired
destination crosswalk**, and **no row cites a deleted diagram**. Every
defect found was a citation or status field that had drifted from its own
row's narrative — nothing changes a pin, a net, or a polarity.

## Highest-value catch

**The six `SSERIAL_PORT1_*` rows (7i84U-B smart-serial link) were
`FACTORY_LINK`.** `authority_hierarchy.md` defines that as a *final* state
accepted only on successful Mesa enumeration — but `docs/project_status.md`
records 7i84U-B as still **on order** (owner-confirmed 2026-09-06) and
channel 1 correctly *not* enumerating on the 2026-09-05 bench check. The
status was copied uniformly from the confirmed port0/7i84U-A rows and never
revised down once 7i84U-B's absence was known. Downgraded to `DEFERRED` with
the re-promotion condition written in. Low physical risk (the card isn't
there to mis-wire), but it's exactly the kind of "the authority says done"
claim the bring-up gates lean on.

**Runner-up:** `THERMAL_ALARM_CHAIN`'s LADDER-REF, "corrected" on 2026-09-05
to `interlocks_ladder_transcription.md` lines 34-53, still didn't point at
the AL57 trip rung — those lines transcribe a *different* rung (sheet 43
axis interlocks) that merely consumes AL57. The trip condition (X073 THR.M +
X07B ONT.M → AL57) is transcribed nowhere in `docs/ladder/`. It was
confirmed this pass directly against **YM2V39L.pdf p.58 (sheet 57, rung
3/SSLL 5703)**, so the row's field claim stands; only the repo citation was
wrong. Twice.

## Fixes applied (commits, in order)

1. **`e58dc5d`** Spare — `SEVENI84UA_IN11_SPARE` / `IN12_SPARE` still told
   the retracted "single CN6-27 SER line" story (SERVO_FAULT's own
   2026-09-02 note established CN6-27 = SFR SPINDLE FORWARD, no SER on CN6)
   and cited the dead `archived_wiring_map`. `P2_GPIO_SPARE` said
   `TBD_FROM_IDROM` though its own cited source records gpio.024-047
   confirmed by two readhmid reads. *(Introduced a CSV quoting defect —
   see commit 6 — since fixed.)*
2. **`4ff08c6`** Motion — `SERVO_FAULT`, `CYCLE_START_PB`, `SERVO_READY`,
   `ALARM_OUT`: dead `archived_wiring_map` primary_source, the standard
   replacement text from 2026-09-05 had missed these four. `SERVO_FAULT`'s
   LADDER-REF to `estop_ladder_transcription.md` marked UNSUPPORTED (that
   file covers only SERVO READY, sheet 23 line 7 — no fault/alarm content).
3. **`63f1798`** Field I/O — `THERMAL_ALARM_CHAIN` citation (above); six
   `SSERIAL_PORT1_*` rows FACTORY_LINK → DEFERRED (above).
4. **`ff1a729`** Axis/Spindle — `SPINDLE_ORIENT_ARRIVAL` / `_CMD` /
   `_LOGEAR` cited `spindle_run_ladder_transcription.md`, whose own scope
   note excludes orient; re-pointed to `orient_ladder_transcription.md`,
   which has the exact X003 ORA1 / Y093 ORCM1.M / Y094 CTL.M rows.
   `SPINDLE_ENCODER` / `SPINDLE_AT_SPEED`: same file cited but has zero
   encoder/PLG or at-speed/USO content; citation removed (real sourcing —
   nameplate photos, owner decision, FR-SX manual — already in the notes).
5. **`c8ff234`** ATC/Magazine — `ATC_ZONE_Y` / `ATC_ZONE_Z` / `AIR_OK`
   cited `atc_ladder_transcription.md`, which has no PRS-55/PRS-66/air-
   switch content; for the zone switches this is structural (their own
   notes say no PLC input, so they can't be in a PLC ladder). The
   2026-08-10 LADDER-REF tag was bulk-applied to the batch. `MAG_IN_POS`:
   `field_7i84u.hal:111` comment said CSV status PROPOSED; it has been
   FACTORY_INTERFACE through its whole history — comment fixed.
6. **`6631080`** *(landed as an `auto-sync:` commit — see note below)* —
   quoted three cleanup_notes fields from commit 1 that contained commas
   and were splitting into 15 fields, shifting text into `dest_connector`.
   The validator doesn't enforce field count; the regenerated
   `io-dashboard/data.js` exposed it. A field-count pass over all 124 rows
   is now clean. Dashboard data regenerated in the same commit.

No component/runtime logic was changed anywhere. Every edit is to
`authority_status`, `primary_source`, `cleanup_notes`, `pin_channel` (the
P2 GPIO range), or a HAL comment. Both validators pass after every commit.

## Open items — not fixed, need owner or bench

- **`MANUAL_TOOL_UNCLAMP_PB` factory_wire: 149 or 149A? (NEW, AMBIGUOUS).**
  The row's own notes disagree — the RECON note reads 149 (and
  `wiring/bbia1_cn_pinouts.csv` CN2-3 agrees), the more specific LOCATED
  note citing Dwg 4143075407 pg133 reads **149A**, paralleling sibling
  `MANUAL_TOOL_CLAMP_PB`'s confirmed **149B** for the split pair at the
  footswitch. Annotated in place; `factory_wire` left at 149. **Bench: read
  the jacket at T.U CN2-3.** One-minute item to add to the next shop trip;
  no pin/status impact either way.
- **`HYD_PRESS_OK` is `FACTORY_INTERFACE` but its device identity is
  unresolved** — is the Sanwa SPS-8T-PC-20 actually installed, or should
  IN27 reuse the OEM PS-1 (TB41-351, X78 MPWS.M)? Re-surfaced independently
  here, but already tracked (2026-09-02 audit item 17, 2026-09-03 wiring
  audit item 10, and this row's own LADDER-REF UNSUPPORTED note). Not a new
  bench item; status word should probably drop once the owner decides.
- **`SERVO_FAULT` still has no ladder or drawing source** for a combined
  servo alarm (bench item 35 already covers finding it at the rack).
- **`AIR_OK` input source** — no transcription documents the air-pressure
  switch; PROPOSED stays until one is found or the switch is traced.

## Process note — auto-sync pushed straight to main

`~/bin/sync-all` (launchd, every 15 min) auto-commits any quiet dirty tree
as `auto-sync: <timestamp>` and pushes fast-forward. It pushed the five
audit commits at ~07:05Z — transiently failing the Authority gate on
`c8ff234` because `io-dashboard/data.js` hadn't been regenerated yet — then
committed the quoting fix + regenerated dashboard as `6631080` at 07:20Z,
which passed. Net result is correct and green, but two things follow:

1. The "desk sessions never push to main — PR through the Authority gate"
   rule in `CLAUDE.md` cannot hold on this Mac while sync-all manages this
   repo. Either add a `.nosync` here or accept that the gate is a
   post-push check, not a pre-merge one. Owner call.
2. **Regenerate `io-dashboard/data.js` in the same commit as any CSV
   edit**, not afterwards — otherwise the sync can push a red intermediate
   state. This audit did it afterwards; don't repeat that.

## Files touched

- `mesa/current_pin_authority.csv` — 22 rows edited across 6 commits.
- `linuxcnc/field_7i84u.hal` — 1 stale comment corrected (MAG_IN_POS).
- `io-dashboard/data.js` — regenerated.
