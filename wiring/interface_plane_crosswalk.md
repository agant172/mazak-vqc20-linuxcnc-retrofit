# MESAC VQC-20/40 interface-plane wiring crosswalk

> **ROLE: INSTALLATION INDEX / HOLD DOCUMENT.** This file joins the two machine
> interface planes without pretending that unresolved analog roles or polarities are
> proven. It is not a wire-release sheet. A row may be landed only when its controlling
> authority status permits it and every stated verification is complete.

## Deliverables and authority

| Scope | Pin-level artifact | Mesa destination authority | Status |
|---|---|---|---|
| Plane A - BBIA-1 machine-side connectors | `plane_a_bbia1_pin_crosswalk.csv` (generated from `bbia1_cn_pinouts.csv`) | `mesa/current_pin_authority.csv` | 320 physical pin positions across the ten bottom-row connectors are accounted. Only `ROUTE_DEFINED_FIELD_VERIFY` rows are routed; every `HOLD_*` row remains blocked. |
| Plane A - NC-facing CND references | `bbia1_cn_pinouts.csv` `Inside_Connec` column | none (the retrofit does not reconnect the CND row) | Partial historical accounting only; photograph every shell before removal. |
| Plane B - CNA resolver and direct analog paths | `plane_b_pin_crosswalk.csv` | `mesa/current_pin_authority.csv` | Resolver winding pairs and Mesa terminals are mapped; pair polarity is proposed and must be commissioned. Axis command OEM connector/pins remain on hold. |
| FR-SX board-internal connectors | `connector_crossref.md` | discrete functions in `mesa/current_pin_authority.csv` | CON1/CON2/CONA/CNAA are transcribed for documentation. They are not all new Mesa landing points. |

The authoritative join key is `signal_id`, not the factory wire number. Mazak wire
numbers are reused and can change at a relay or connector stage.

## Corrected two-plane boundary

The 2026-08-18 reread of OEM drawing 4143075403 (PDF p127) changes one part of the
2026-08-17 architecture note:

- X/Y/Z resolver harnesses cross Plane B at CNA3/CNA4/CNA5.
- The exact OEM landing connector and pin for each X/Y/Z analog velocity command is
  still unproved. Those six AOUT/return rows are `HOLD_SOURCE_TRACE` in
  `plane_b_pin_crosswalk.csv`.
- The FR-SX speed-reference trio does **not** require a new tap at SX-IO1. It already
  reaches BBIA-1 CN4-18/-19/-20 (SE1/SE2/SE3), which the same sheet traces to
  CON1-31/-32/-30. It is therefore Plane A wiring. The electrical roles of SE1/SE2/SE3
  still require the FR-SX source or a disabled-drive measurement before AOUT3 is landed.
- FR-SX discrete control and status signals already cross Plane A through CN3/CN4.
  CON1 is useful as an OEM internal cross-reference, not as a second retrofit cut point.

## Plane A - how to use the existing crosswalk

1. Identify the cut conductor in `bbia1_cn_pinouts.csv` by connector and pin.
2. Join it to `mesa/current_pin_authority.csv` by `signal_id`; verify that
   `dest_connector`, `dest_pin`, and `factory_wire` agree with the conductor in hand.
3. Stop on `HOLD_*`, `PROPOSED`, `COMMISSIONING_PENDING`, `RESERVED`, `DEFERRED`, or
   blank destination fields. These are documentation or commissioning rows, not an
   instruction to energize.
4. Use the generated cabinet reference and ferrule files only after regenerating them
   from the authority CSV.

The BBIA source table includes spare, common, power, hardware-safety, and option pins
because pin accounting and retrofit landing are different questions. A fully accounted
connector does not imply that every pin goes to Mesa. Regenerate the install-facing file
with `python3 scripts/generate_interface_crosswalks.py`; it fails if any bottom-row pin
position is missing or duplicated.

### Plane A accounting correction (2026-08-18)

Visual recheck of terminal-unit layout drawing 4143075304 (PDF p74) places `CN8`
on the NC-facing/top row and `CN200` on the machine-facing/bottom row. The earlier
inventory counted CN8 as the tenth bottom connector and omitted CN200. CN200 is now
transcribed from drawing 4143075322 (PDF p85), including MMS READY, SENSOR READY,
MMS SKIP, MMS START, MMS POWER ON, MMS START COMMAND, 0G, +24 V, and explicit blanks.

The generated Plane A file includes:

- 320 BBIA bottom-row pin positions (`CN200`, `CN2`, `CN1`, `CN5`, `CN6`,
  `CN3`, `CN11`, `CN12`, `CN4`, `CN7`);
- 45 routes joined directly to `mesa/current_pin_authority.csv` by connector/pin;
- the three CN4 spindle-reference conductors as held 7i49 candidates; and
- CN200-3 `MMS SKIP` as a held probe candidate, not an asserted MP-3 route.

CN12's pin/wire table comes from the downstream SSR-board source (p78). The
terminal-unit-to-SSR hop is not independently pin-traced, so these out-of-scope 2PC
rows remain documentation-only.

## Plane B - wire-by-wire routes

`plane_b_pin_crosswalk.csv` is deliberately one conductor per row. Its current scope is:

- 18 resolver signal conductors: CNA3/4/5 pins 12-17 to 7i49 RES0/1/2.
- Three OEM case-ground pins, held pending shield-topology disposition.
- Three new-cable pair-shield rows, terminated only at the 7i49 end per the 7i49 manual.
- Six axis velocity-command conductors, with exact 7i49 terminals known and OEM
  connector/pins held for continuity tracing.
- Five CNA10 load-meter pins, documented but not allocated to Mesa.
- Three BBIA CN4 spindle-reference pins, recorded here only to make the corrected plane
  boundary explicit.

### Resolver polarity convention

The M2 manual identifies winding pairs but does not mark plus/minus polarity. The CSV
uses a proposed, repeatable convention: the first pin/lead in each OEM pair is routed to
the 7i49 `+` terminal and the second to `-`. This is a retrofit design choice, not a
factory fact. Keep all drive enables inhibited while proving excitation amplitude,
SIN/COS orientation, resolver direction, scale, and phase. Swap/document a pair only
through a reviewed revision of the CSV and HAL commissioning record.

### Axis command gap

OEM p128 proves the retained TRA/DK-427 topology but does not identify the removed NC
command pair's connector and pins. Do not infer them from CNA3/4/5 detector pins or from
CA7 motor/tach wiring. Ring out the old command pair from each DK-427 input back to the
unplugged NC harness, photograph the connector face, and record:

- connector name and pin numbers;
- command and dedicated return polarity;
- cable shield/drain termination;
- zero-command voltage with the drive disabled.

Only then replace `TBD` and clear `HOLD_SOURCE_TRACE` for X, Y, and Z.

## CNA10 disposition

OEM p127 shows CNA10 pins 4/8 for spindle load, 11/17 for Z-axis load, and 20 as the
meter reference/common. These feed the original CRT load display; no Mesa input is
allocated. Decide whether the load display is retained independently or retired. Do not
consume Mesa analog inputs merely to make the connector accounting total reach zero.

## Sources

- Mazak electrical diagram set 41434WB, PDF p84 (dwg 4143075321), p127 (dwg
  4143075403, sheet 3), and p128 (dwg 4143075404, sheet 04).
- Mitsubishi MELDAS Series M2 Maintenance Manual BNP-A2443A / M1243-ES, Figure
  14.4-1, printed p250.
- Mesa `docs/Mesa Manuals/7i49man.pdf`, printed pp5-7 (P4/P3/P2 terminal maps) and
  printed p9 (resolver wiring/shield instruction; PDF page 12).
- Physical resistance and ground measurements: `docs/resolver_commissioning.md`,
  2026-08-16 CNA3/4/5 session.
