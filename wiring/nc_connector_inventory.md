# NC-Unit Connector Inventory — every connector that plugged into the Mazatrol NC

> **ROLE: ACCOUNTING** — one row per physical connector that interfaced with the NC
> unit, tracking whether its pin/wire identification is complete. This file answers
> "is every allocated wire accounted for, and is every unused pin positively marked
> unused?" — it does not track electrical verification (that lives in
> `mesa/current_pin_authority.csv` and the crosswalk).

Created 2026-08-18 from the tracing-completeness audit. The NC talked to the machine
through three connector groups:

1. **BBIA-1 top row (`CND` family)** — the connectors that literally plugged into the
   NC back panel FX30 (dwg 4143075311).
2. **BBIA-1 bottom row (`CN` family)** — the machine-side half of the same
   pass-through board (ten physical connector positions on dwg 4143075304).
3. **NC card-cage / servo-spindle direct connectors** — `CNA`-family and the FR-SX
   drive's own connectors (Plane B), which bypassed BBIA-1 entirely.

## Scoreboard

| Group | Connectors | Pinout with wire IDs | Gap |
|---|---|---|---|
| BBIA-1 bottom (CN) | 10 | 9 complete from terminal-unit tables; CN12 has a complete downstream SSR pin/wire table | CN12 terminal-unit→SSR hop is not independently pin-traced |
| BBIA-1 top (NC-facing) | 9 physical positions on p74 | partial coordinates only (~190 CND-side refs incl. ~60 new from CN7/CN8) | CND→CN index NOT pin-for-pin; one p74 position is unlabeled and no complete per-top-connector table exists |
| Plane B (CNA / FR-SX) | 9+ | 7 transcribed, 1 confirmed+measured | CNA10 not transcribed; CN2 amp connectors unchecked |

_2026-08-18 update: CN3 completed to 50/50 (its 26 missing pins confirmed
genuinely unused on the print), CN7 transcribed in full (50/50, 2PC
M-code/handshake set, all wires identified), and **CN8 discovered and
transcribed** — an NC-facing/top-row connector that is entirely NC spare I/O
(ISP4–22, OSP5–30) with no outside connections at all: the largest block of
allocated-but-never-used NC capacity. A visual recheck of p74 then corrected the
row accounting: **CN200, not CN8, is the tenth machine-facing connector.** CN200
is now transcribed 20/20 from p85. Details and four CN3 signal-name divergences:
`bbia1_cn_pinouts.md` § "CN3 completed, CN7 and CN8 transcribed in full"._

## Group 1 — BBIA-1 bottom row (machine side), `wiring/bbia1_cn_pinouts.csv`

Pin counts are rows carrying a real wire number or an explicit "(not used)" marker.
"Accounted" = every physical pin position is either wire-identified or positively
marked unused. A connector where rows simply *stop* is NOT accounted — absent rows
can mean "unused on the print" or "never transcribed" and the CSV cannot tell them
apart.

| Connector | Shell | Pins transcribed / physical | Spares marked | Accounted? | Notes |
|---|---|---|---|---|---|
| CN1 | MR-20RMW | 20 / 20 | SP16–SP19 (4), 0G NC, 7 blank | **YES** (2026-08-18) | Pins 8–13, 19 confirmed genuinely blank on dwg 4143075321. |
| CN2 | MR-50RMW | 50 / 50 | SP29, SP30, 340, 0G NC, 14 blank | **YES** (2026-08-18) | Pins 20, 22–33, 48 confirmed genuinely blank. |
| CN3 | MR-50RMW | 50 / 50 | SP1–SP4 (40–43), pin 13 SPARE, 25 blank pins | **YES** (2026-08-18) | The 26 previously-missing pins are all genuinely unused on dwg 4143075321. §7.2 dispute on pins 39/44 still open — a third OEM naming surfaced, see `bbia1_cn_pinouts.md`. |
| CN4 | MR-20RMW | 20 / 20 | pins 11, 14 blank | **YES** (2026-08-18) | Pins 18/19/20 = SE1/SE2/SE3 SPEED REFERENCE → CON1-31/-32/-30, confirming the p127 cross-read. Three signal-name divergences on pins 15–17 logged in `bbia1_cn_pinouts.md`. |
| CN5 | MR-20RMW | 20 / 20 | none (all allocated) | **YES** | Complete. |
| CN6 | MR-50RMW | 50 / 50 | 12 blank + pins 38/45 slashed out | **YES** (2026-08-18) | All absent pins confirmed unused on dwg (p85). |
| CN7 | MR-50RMW | 50 / 50 | pins 17/18 = 0G, 49/50 = +24V | **YES** (2026-08-18) | Transcribed from dwg 4143015323 (p86). Full 2PC M-code/handshake set, every wire identified; all outside connections to TB6. Function stays out of retrofit scope, but the connector is now fully accounted. Two inside-connector refs (pins 31, 48) illegible — left blank, not guessed. |
| CN200 | MR-20RMW | 20 / 20 | pins 6, 8–13, 15–19 blank | **YES** (2026-08-18) | MMS receiver: MMS RDY, SEN RDY, MMS SKIP, MMS ST, MMS PON, MMS STCMD, 0G, +24 V. `MMS SKIP` is only a held candidate for the retrofit probe input until traced. |
| CN11 | MR-20RMW | 20 / 20 | pins 17, 18 "(not used)" | **YES** | Complete, disambiguated from CN11-SSR 2026-08-10. |
| CN12 | MR-20RMW terminal unit → MR20-AMD/LFH SSR | 20 / 20 downstream | pins 10–18 "(not used)", 19–20 blank | **DOWNSTREAM TABLE ONLY** | The p78 SSR-side table accounts for all pins and 9 wire IDs (722A/B, 724, 725A/B, 782A/B, 787A/B). The terminal-unit hop has not been independently pin-traced; all functions are 2PC/pallet and unallocated. |

**A third "CN11"** (25-way pallet-changer/coolant loom, dwg 03-81581-02) is mentioned
in `bbia1_cn_pinouts.md` but never independently read — count shell positions before
assuming which CN11 is in hand.

## Group 2 — BBIA-1 top row (`CND`, the connectors that plugged into the NC)

**This is the largest unaccounted group.** The p74 layout shows ten bottom-row
positions and nine top-row positions. CN8 is on this top row, and one large p74
position has no legible designator.
What is known:

- The pass-through is **NOT pin-for-pin**: `bbia1_source_dest.csv` records crossings
  like `CND3-39` → `CN6-39` and `CN8-3` → `CN1-3` (`authority_conflicts.md` §7.2 /
  line ~494). The old `consolidate_bbia_authority.py` assumption "CNDx pin == CNx pin"
  was corrected 2026-08-17.
- The CSV's `Inside_Connec` column captures scattered CND-side references (CNB, CNQ,
  CN23/CNB23, and bare "1-24"-style refs) for ~129 of 204 rows; **75 rows are blank**,
  and no per-CND-connector pinout table exists anywhere in the repo.
- Practical impact: with the NC removed, the retrofit never plugs anything into the
  CND row, so wire-by-wire this may not block Mesa work — but it means the "every
  connector that plugged into the NC" accounting **cannot currently be closed** from
  repo data. The CND shells and their cable stubs are physical objects in the cabinet;
  photograph and label them before anything is disturbed.

## Group 3 — NC card-cage / servo-spindle direct connectors (Plane B)

| Connector | Where | Pinout status | Source |
|---|---|---|---|
| CNA3 (X), CNA4 (Y), CNA5 (Z) | NC rack, resolver feedback | **Complete** — pin roles confirmed against Mitsubishi M2 manual Fig 14.4-1, DC-measured all axes | `docs/resolver_commissioning.md` |
| CNA6 | NC rack (M2 manual covers "CNA 3~6") | Not present/used on this 3-axis machine? Unconfirmed — check the rack for a 4th CNA position | M2 manual |
| CNA10 | NC side, spindle/Z load-meter feed | **Complete on source sheet** — pins 4/8 spindle load, 11/17 Z-axis load, 20 common/reference; no Mesa route allocated | p127 dwg 4143075403; `plane_b_pin_crosswalk.csv` |
| CON1 | FR-SX drive, control I/O | Transcribed with per-pin confidence tags | `connector_crossref.md` § SX-IO1 |
| CON2 | FR-SX drive, PLG feedback | Transcribed (drive-internal, stays with drive) | same |
| CONA ("CNA") | FR-SX → orient encoder, differential | Transcribed | same |
| CONAA | FR-SX → orient encoder, single-ended | Transcribed (incl. spare pins -02/-03) | same |
| CNA1 | FR-SX bay | Transcribed — **N.C., all 8 pins unused** on this revision | same |
| T.U. CN4 / T.U. CN3 | terminal unit (same physical CN4/CN3 as Group 1) | See Group 1 rows | `bbia1_cn_pinouts.csv`, `connector_crossref.md` |
| CN2 amp connectors (X/Y/Z TRA servo amps) | servo card cage | Axis-amp terminal rows exist in `bbia1_continuity_trace_worksheet.csv`; no dedicated per-connector pinout table | worksheet |

## Punch list to close the accounting

In priority order (items that get harder once the NC/cabinet is disturbed first):

1. **Photograph and label every NC-facing/top-row connector** on BBIA-1 before the NC
   hardware moves — shell size, position on board, cable jacket markings. Without
   this, Group 2 can never be closed.
2. **Continuity-trace terminal-unit CN12 to the SSR-board CN12** if any 2PC output is
   retained; the current table is downstream-only.
3. **Check the NC rack for a CNA6 position** (M2 manual's connector family runs 3–6).
4. **Continuity-trace the X/Y/Z analog command pairs** from each DK-427 input back to
   the removed NC harness; the OEM connector and pins remain unknown.
5. **Trace CN200-3 `MMS SKIP` to the installed probe interface** before treating it as
   `PROBE_SKIP1`; the functional name alone is insufficient.
6. **Identify the third "CN11"** (25-way, dwg 03-81581-02) or positively rule it out
   of this machine.
