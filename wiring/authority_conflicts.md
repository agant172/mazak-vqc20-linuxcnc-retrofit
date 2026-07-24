# Authority Conflicts — VQC-20/40 Retrofit

**Status:** documented conflicts; do not energize affected outputs.

This register reconciles the RC3A connector cross-reference with the current Mesa pin authority. The new evidence is retained, but contradictory outputs are blocked until cabinet tracing resolves the disagreement.

## 1. Gear-shift solenoids

- Current authority: `SOL-13` planned high gear on 7i84U TB2 OUT7.
- Current authority: `SOL-12` planned low gear on 7i84U TB2 OUT8.
- New evidence: `connector_crossref.md` identifies wire 413 as `SOL-13 — Gear Shift Low`.
- Resolution test: trace the coil wire tags from RC3A to both valve coils; identify the valve ports for high and low; measure coil voltage/current; then update both rows together.
- Authority status: both rows are `HOLD_CONFLICT`.

## 2. Tool clamp/unclamp valve

- Current authority: TB2 OUT9 and OUT10 were both associated with `SOL-10`, with OUT9 clamp and OUT10 unclamp.
- New evidence: `connector_crossref.md` identifies `SOL-10` as tool unclamp.
- Resolution test: trace the RLY-3 and RLY-4 load sides to the hydraulic valve, identify whether SOL-10 is single-coil or dual-coil, and verify clamp/unclamp prox behavior with pressure removed.
- Authority status: clamp output TB2 OUT9 is `HOLD_CONFLICT`; unclamp output TB2 OUT10 remains `COMMISSIONING_PENDING`.

## 3. Magazine rotation direction

- New evidence identifies `SOL-8A` as CCW/forward and `SOL-8B` as CW/reverse.
- The current authority table does not yet assign SOL-8A/SOL-8B to a Mesa output row; its generic ATC forward/reverse rows must not be treated as equivalent.
- Resolution test: trace the two solenoid wires and verify actual magazine movement direction with hydraulic power isolated or under controlled commissioning.
- Authority status: do not promote the generic ATC direction rows until this trace is complete.

## Evidence documents

- `connector_crossref.md` — OEM drawing/photo cross-reference.
- `bbia1_terminal_unit.md` — BBIA-1 interconnect architecture note.
- `bbia1_continuity_trace_worksheet.csv` — field continuity worksheet; all rows remain unverified.
- `../mesa/current_pin_authority.csv` — planning authority with blocked conflicts.
