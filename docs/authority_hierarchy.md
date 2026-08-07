# Authority Hierarchy — Mazak VQC 20/40 Retrofit

_Last updated: 2026-08-06_

_Related: [`pre_power_deliverables.md`](pre_power_deliverables.md),
[`../wiring/authority_conflicts.md`](../wiring/authority_conflicts.md),
[`../mesa/current_pin_authority.csv`](../mesa/current_pin_authority.csv)._

## 1. The problem this document fixes

Before this document, the repository claimed
`mesa/current_pin_authority.csv` was authoritative but had no way to
enforce that claim. Every one of the following could drift silently:

- `linuxcnc/field_7i84u.hal` was written before the CSV and kept its own
  physical-pin bindings.
- `linuxcnc/atc_orient.hal` carried a second channel map for ATC and
  orient signals.
- `wiring/io_map_research_notes.md` carried a third research map that
  predated both files.
- `wiring/authority_conflicts.md` recorded that documentation conflicts
  had been reviewed but the physical wiring had not been proven.
- The rendered manual PDFs in the repository could become stale relative
  to any of the above.

A future edit could update the CSV while leaving the HAL bindings, the
research notes, and the rendered PDFs inconsistent, and nothing in the
repository would catch it.

This document defines the authority hierarchy and points at the script
that mechanically enforces it.

## 2. Hierarchy

```
       ┌─────────────────────────────────────────────────────────┐
       │  mesa/current_pin_authority.csv                         │
       │  ELECTRICAL CHANNEL AUTHORITY                           │
       │  One row per physical Mesa pin.                         │
       │  Owns: mesa_card, connector, pin_channel, hal_net,      │
       │        field_point_or_load, authority_status.           │
       └─────────────────────────────────────────────────────────┘
                              │  validated by
                              ▼
       ┌─────────────────────────────────────────────────────────┐
       │  linuxcnc/*.hal                                         │
       │  Every physical pin reference must match the CSV.       │
       │  Enforced by scripts/validate_authority.py.             │
       │  HAL owns the LOGIC (net topology, polarity choice     │
       │  joint routing, comments, rationale).                   │
       └─────────────────────────────────────────────────────────┘
                              │  informs
                              ▼
       ┌─────────────────────────────────────────────────────────┐
       │  wiring/*.md, docs/*.md, research notes                 │
       │  NON-AUTHORITATIVE. Interpretive material only.         │
       │  Nothing here can override the CSV or HAL.              │
       └─────────────────────────────────────────────────────────┘
                              │  released as
                              ▼
       ┌─────────────────────────────────────────────────────────┐
       │  Rendered PDFs                                          │
       │  RELEASE ARTIFACTS ONLY. Every rendered PDF must carry  │
       │  the commit hash and generation date on the cover.      │
       │  A PDF checked in without those metadata is out of      │
       │  date by definition.                                    │
       └─────────────────────────────────────────────────────────┘
```

## 3. What each layer owns and does not own

### 3.1 `mesa/current_pin_authority.csv` — electrical channel authority

**Owns.** For every physical Mesa pin on the retrofit (7i80HDT + 7i44 +
7i49 + 7i84U-A + 7i84U-B), exactly one row of:

- `signal_id` — unique symbolic identifier, uppercase snake case
- `subsystem` — Motion, Spindle, ATC, Coolant, Utility, etc.
- `direction` — IN / OUT / RESOLVER_IN / ENCODER_IN / ANALOG_OUT / LINK
- `mesa_card` — 7i80HDT / 7i44 / 7i49 / 7i84U-A / 7i84U-B
- `connector` and `pin_channel` — physical addressing on that card
- `hal_net` — the HAL net name that binds this pin, or `none` if no HAL
  binding is planned yet
- `field_point_or_load` — machine-side identifier (LS-42, PRS-9, SOL-10,
  RLY-1, coil identity, wire number)
- `authority_status` — see the evidence-state taxonomy in
  [`pre_power_deliverables.md`](pre_power_deliverables.md)
- `primary_source` — where this row's claim came from
- `cleanup_notes` — TODOs, polarity assumptions, promotion criteria

**Does not own.** HAL logic. Joint routing. Input polarity choice (raw vs `-not` complement pin, per [sserial(9)](https://linuxcnc.org/docs/html/man/man9/sserial.9.html)).
Prose. The CSV is the pin-to-signal map, not the control program.

**Editing rules.**

- One row per physical pin. Duplicate physical assignments are an
  integrity error (the validator catches them).
- Every change must leave the validator at exit 0 (no ERRORS).
- Every change that reassigns a pin must update the corresponding HAL
  binding in the same commit.
- Never delete a row. Move it to `authority_status = SPARE` and clear
  `hal_net` to `none`.

### 3.2 `linuxcnc/*.hal` — control logic and pin binding

**Owns.** Everything about how signals get connected inside LinuxCNC:

- `net <name> <=|=> hm2_7i80.0.7i84.0.<port>.<input|output>-<NN>`
  bindings
- Input polarity choice: consuming `input-NN` (raw) vs `input-NN-not` (complement) - sserial input pins do NOT have an `invert_input` parameter (see [sserial(9)](https://linuxcnc.org/docs/html/man/man9/sserial.9.html))
- `net <name> => joint.N.amp-fault-in` and other module routing
- `iocontrol` loopbacks
- Comments explaining *why* a design choice was made (latency
  trade-offs, single-writer rationale, coil suppression warnings)

**Does not own.** The physical pin-to-signal assignment. That must come
from the CSV. If a HAL edit needs a new physical assignment, add or
update the CSV row first, run the validator, then edit HAL.

**Editing rules.**

- Every `hm2_7i80.0.7i84.0.<port>.<input|output>-NN` reference must have
  a matching CSV row where `hal_net` equals the HAL net name being
  bound. `scripts/validate_authority.py` enforces this.
- A pin with CSV status `HOLD_CONFLICT` may carry `setp` lines (polarity
  pre-staging) but must not carry an active `net` binding. Comment the
  net binding out until the conflict is resolved in
  `wiring/authority_conflicts.md`.
- A pin with CSV status `SPARE` may not be bound in HAL at all. Promote
  the CSV row first.

### 3.3 `wiring/*.md`, `docs/*.md`, `wiring/io_map_research_notes.md`

**Non-authoritative.** These are interpretive documents: research
findings, cross-references, hazard analyses, commissioning plans, the
pre-power deliverables charter. They may quote from the CSV or HAL but
they cannot override either. When these documents disagree with the
CSV, the CSV wins and the note gets updated. When these documents
disagree with each other, they are all wrong: only the CSV and HAL are
sources of truth.

### 3.4 Rendered PDFs

**Release artifacts only.** Any PDF checked into the repository must
carry the git commit hash and generation date on its cover page. A PDF
without those two pieces of metadata is treated as untrustworthy and
must be regenerated before use.

The manual set (`41434WB.pdf`, `41435WA.pdf`, service manuals, etc.)
are OEM references. They inform the CSV but they do not have authority
over it — a Mazak schematic drawn in the 1990s cannot dictate what the
retrofit does today. Cite them as evidence; do not treat them as truth.

## 4. Mechanical enforcement — `scripts/validate_authority.py`

This script reads `mesa/current_pin_authority.csv` and every `.hal`
file in `linuxcnc/` and checks:

1. **Every HAL physical pin reference exists in the CSV.** A stray
   `hm2_7i80.0.7i84.0.0.output-31` in HAL is an ERROR if the CSV has no
   row for it.
2. **Every HAL net binding matches the CSV's `hal_net` value.** If
   HAL says `net foo => hm2_...output-05` and the CSV says the net for
   that pin is `bar`, it is an ERROR.
3. **No CSV pin has more than one row.** Duplicate physical assignment
   is an ERROR.
4. **No active HAL net binds a pin with CSV status `HOLD_CONFLICT`.**
   A `setp` on such a pin is a WARN (polarity can be pre-staged); an
   active `net <name> => hm2_...` is an ERROR.
5. **No active HAL net binds a pin with CSV status `SPARE`.** ERROR;
   promote the CSV row first.
6. **Every CSV row with a non-empty `hal_net` has a corresponding HAL
   binding.** No binding is a WARN, not an ERROR, because signals can
   be planned in the CSV before their HAL logic is written.
7. **All 96 physical 7i84U input/output terminals have exactly one row.**
   Aggregate spare ranges and out-of-range/duplicate terminals are errors.
8. **Active 7i49 resolver-position and pwmgen-value bindings match RES/AOUT
   rows**, the capacity table matches the exact allocation, and every allocated
   7i84U-B terminal is present in the printable terminal legend.

**Exit code.** `0` if no ERRORS; `1` if any ERROR. Warnings do not fail
the check.

**Run it.**

```
python3 scripts/validate_authority.py
```

Run before every commit that touches `mesa/current_pin_authority.csv`
or any `linuxcnc/*.hal` file. The validator prints a summary count of
CSV rows, unique HAL pin references, ERRORS, and WARNINGS.

### 4.1 Current scope

The authority validator covers 7i84U-A/B smart-serial terminals plus active
7i49 resolver `.position` and pwmgen `.value` bindings. The companion
`scripts/validate_control_logic.py` rejects active direct P3 GPIO and spindle
encoder bindings while P3 is empty, checks duplicate signal writers and
real-time module loads, verifies servo-thread ordering, and enforces the
spindle/Z/ATC commissioning holds and abort paths.

Neither script can prove real generated HAL pin names, electrical polarity,
timing, component compilation, or machine behavior. Those require the verified
bitfile, `readhmid`/HAL dumps, LinuxCNC startup, and physical fault injection.

## 5. Change workflow

For any edit that changes what a physical pin does:

1. Edit `mesa/current_pin_authority.csv` first. Update `signal_id`,
   `hal_net`, `field_point_or_load`, `authority_status`, and
   `cleanup_notes` in the same row.
2. Edit the corresponding `linuxcnc/*.hal` file in the same working
   tree. Rename the net if the CSV `hal_net` changed. Move HAL logic to
   the new pin if the pin changed. If the CSV moves the pin to
   `HOLD_CONFLICT` or `SPARE`, comment out the active `net` binding in
   HAL.
3. Run `python3 scripts/validate_authority.py` and
   `python3 scripts/validate_control_logic.py`. Both must exit 0.
4. Commit both files in one commit. The commit message should name the
   pin and the reason (e.g. `hal, mesa: reassign 7i84U-A OUT12 from
   lube-on to mist-coolant (HOLD_CONFLICT until cabinet trace)`).

For a rename that does not change physical assignment:

1. Edit CSV `hal_net` and HAL net name in one commit.
2. Grep the repository for the old net name in other HAL files, docs,
   notes, and the connector cross-reference — update every one you
   find, or add a follow-up commit.
3. Run the validator.

For a new pin that has no CSV row yet:

1. Add the CSV row with `authority_status = PROPOSED` (or
   `COMMISSIONING_PENDING`) and `hal_net = none` if the net name is
   not decided yet.
2. Once you know the net name, update `hal_net` in the CSV.
3. Add the HAL binding.
4. Run the validator.

## 6. What the validator cannot catch

The validator is a bookkeeping tool, not a safety proof. It cannot:

- Confirm that the physical wire actually lands on the terminal block
  the CSV says. That is what the D4 I/O checkout sheet in
  [`pre_power_deliverables.md`](pre_power_deliverables.md) does.
- Confirm that the field device (limit switch, relay coil, hydraulic
  solenoid) is what the CSV says it is. That is what the D2 installed
  nameplate register does.
- Confirm that the choice between raw `input-NN` and `input-NN-not` matches the actual switch polarity. (Sserial input pins have no `invert_input` parameter - see [sserial(9)](https://linuxcnc.org/docs/html/man/man9/sserial.9.html).)
  That is what the D4 checkout sheet and D14 fault-injection matrix do.
- Confirm resolver phasing or analog scaling. That is what D8 and D10
  do.

The validator's job is to make sure the CSV and HAL never silently
disagree. Everything else remains a pre-power deliverable.

## Sources

- Mesa 7i84 manual: [7i84man.pdf](http://www.mesanet.com/pdf/parallel/7i84man.pdf) — physical terminal-block layout that anchors the `pin_channel` values.
- Mesa 7i44 product page: [store.mesanet.com](https://store.mesanet.com/index.php?product_id=44) — RJ45 pinout for the smart-serial ports that carry the 7i84U channels.
- LinuxCNC `hostmot2(9)` manual: [linuxcnc.org](https://linuxcnc.org/docs/html/man/man9/hostmot2.9.html) — canonical HAL pin naming for HostMot2 GPIO (`input-NN`, `output-NN`, `in-not`).
- LinuxCNC `sserial(9)` manual: [linuxcnc.org](https://linuxcnc.org/docs/html/man/man9/sserial.9.html) — canonical HAL pin naming for sserial-remote I/O (7i64/7i76/7i77/7i70/7i73/7i84-family), including the `input-NN`/`input-NN-not` complement-pin convention for input inversion. No `invert_input` parameter is documented for sserial digital-input pins; the parameter `output-NN-invert` exists for outputs only.
