# INTERFACE ARCHITECTURE — the single machine-interface plane

_Root architectural decision. Established 2026-08-10 (owner: AG). This file is
authoritative for **how the control system connects to the machine** and therefore
for how the master wiring CSV and the I/O Navigator are structured. Read it before
editing `mesa/current_pin_authority.csv`, the `wiring/` crosswalks, or the
`io-dashboard/` data model._

---

## 1. The core idea (why this file exists)

The original Mazatrol NC computer was the machine's only "brain," and it talked to
the machine through **exactly one board: BBIA-1**. BBIA-1 was the NC unit's
back-panel breakout — every wire the NC exchanged with the machine passed through
it. Remove the NC and BBIA-1 is left as a **straight pass-through terminal unit**:
top connectors (formerly to the NC back panel FX30) wire straight through to
bottom connectors out to the machine.

The retrofit reproduces the original arrangement exactly, substituting the
LinuxCNC + Mesa stack for the NC brain:

```
  ┌────────────┐  Ethernet   ┌──────────┐  50-pin IDC   ┌──────┐
  │ LinuxCNC   │────────────▶│ 7i80HDT  │──── P1 ──────▶│ 7i44 │─┐ smart-serial
  │ control PC │  hm2_eth    │  (FPGA)  │──── P2 ──┐    └──────┘ │ (RS-422)
  └────────────┘             └──────────┘          │             ├─▶ 7i84U-A (ch0)
                                                    ▼             └─▶ 7i84U-B (ch1)
                                               ┌──────┐
                                               │ 7i49 │  resolver + ±10V analog
                                               └──────┘
        ┌─────────────────────────────────────────┴───────────────────────┐
        │        Mesa screw terminals  (7i84U TB2/TB3, 7i49 analog/RES)    │
        └─────────────────────────────────────────┬───────────────────────┘
                                                   │  cut + ferruled MR cables
                                                   ▼
                                        ┌──────────────────────┐
                                        │   BBIA-1  (BN624A306) │   ◀── THE PLANE
                                        │  Honda/HTK MR conns   │
                                        │  CN1..CN7, CN11, CN12 │
                                        └──────────┬───────────┘
                                                   │  (unchanged OEM harness)
                                                   ▼
                                             THE MACHINE
```

**The single-plane rule:** every signal that crosses between the control system and
the machine crosses at **one place — the BBIA-1 connector plane** — with a small,
explicitly enumerated set of exceptions (Section 3). One physical conductor across
that plane = one row in the I/O model. Nothing else needs to be modeled as if it
were retrofit wiring.

---

## 2. What this means for the data model (the simplification)

Because there is one plane, there is **one spine**, and every fact about a signal
hangs off it. The authoritative unit of work is **one BBIA-1 conductor being
repurposed**, described end to end:

```
 MACHINE FUNCTION         BBIA-1 (the plane)              MESA (retrofit owns)        HAL
 ────────────────    ─────────────────────────────   ──────────────────────────   ─────────
 e.g. "gear high      connector + pin  (CN1-3)         card + connector + screw     hal_net
  confirm, PRS-10"    + factory wire # (210)    ◀──▶   terminal (7i84U-A TB2 IN17)  (gear-hi-conf)
                      [OEM reference — do NOT           [the retrofit's job to
                       re-derive; it is fixed]           assign, land, and verify]
```

Consequences that remove work:

- **The machine-internal side is OEM reference data, not retrofit wiring.** What a
  BBIA-1 pin connects to *inside* the machine is already fixed and documented in the
  Mazak prints (`41434WB.pdf`) and captured in `wiring/bbia1_cn_pinouts.csv`. Do not
  model it as if it were a design decision. The retrofit **owns and must verify only
  the BBIA↔Mesa hop** (which Mesa terminal, normal state, polarity, scale).
- **The factory wire number is the label and the lookup key — but not the primary
  key.** Each conductor carries a wire number printed on its jacket (e.g. `210`),
  visible at the cut, and that number is what ties the OEM print, the BBIA pinout,
  the new ferrule/label, the Mesa terminal, and the HAL net together. Label with the
  wire number first (see `wiring/bbia1_terminal_unit.md` § "Practical use").
  **Corrected 2026-08-17:** this file previously called it "the stable primary key."
  It is not unique. The OEM print reuses wire `231` on two unrelated circuits —
  `CN4-1` SPINDLE ZERO SPEED and `CN11-13` FLOOD COOLANT — so wire numbers are
  unique within a circuit section, not globally. The join therefore keys on
  `signal_id`; duplicate wire numbers are a WARN against an explicit allowlist, never
  an error. See `wiring/authority_conflicts.md` § 7.1.
- **One joined table, not four.** `mesa/current_pin_authority.csv` (124 rows) now
  carries both ends: the Mesa+HAL end it has always owned, plus
  `dest_connector` / `dest_pin` / `factory_wire` describing the BBIA end, populated
  for the **44 rows that cross the plane**. `wiring/bbia1_source_dest.csv` (66 rows)
  remains the curated, provenance-bearing **input** to that join, and
  `wiring/bbia1_cn_pinouts.csv` (205 rows) remains the immutable OEM reference both
  are checked against. `wiring/bbia1_retrofit_destination_crosswalk.csv` (14 data
  rows) is superseded but retained — see § 5. Status of each consolidation step is in
  Section 5.

---

## 3. Exceptions — what does NOT cross at the BBIA-1 plane

The single-plane rule holds only because these few things are named and handled
separately. This list is exhaustive by intent; anything discovered outside the plane
that is not here must be added here.

### 3a. Verified / by-design exceptions
1. **OEM hardwired E-stop / contactor safety chain (MAR / EMS / OTR).** Stands alone
   and runs independently of the NC and of Mesa — this is the primary E-stop and was
   never the brain's to control. E-stop *sense* conductors (`EHB`/`EMB`/`EMC` at
   CN2-40, CN2-41, CN3-1, CN5-4) physically appear on BBIA-1 connectors, but they
   land in the **safety-relay chain, never on a Mesa input**. Machine-enabled monitoring via a `MAR` aux
   contact is DEFERRED (owner decision 2026-08-15; no relay installed, input
   unwired, fails safe).
   LinuxCNC/HAL is not a safety input. (See `docs/estop_safety_chain.md`.)
2. **Domain crossings.** Every OEM↔new signal crossing the plane goes through an
   interposing relay (see CLAUDE.md § Electrical architecture).

### 3b. Open — verify before assuming these cross at BBIA-1
3. **7i49 analog + resolver path** — X/Y/Z resolver feedback, X/Y/Z ±10 V velocity
   commands to the MELDAS TRA amps, and the FR-SX spindle speed reference. The CSV's
   working assumption is that factory resolver/command wiring "lands at BBIA1/7i49,"
   but every such row is flagged **"no cabinet trace"** (FIRST-POWER 2026-08-09) and
   is `COMMISSIONING_PENDING`. Two things must be settled per axis before wiring:
   - **Path:** does the analog/resolver conductor actually appear at BBIA-1, or does
     it run to the servo amp / resolver / FR-SX directly? Field-trace it.
   - **Design choice:** even if it *is* present at BBIA-1, the retrofit may
     deliberately break resolver and ±10 V analog out **directly to the drives /
     resolvers with shielded cable** rather than route it through a digital I/O
     terminal unit, to avoid noise coupling (see the resolver warning in
     `wiring/README.md`). Decide consciously and record it here.
4. **Over-travel limits +X, −X, −Y, +Z** — no confirmed BBIA-1 landing pin (found
   2026-08-10, dwg 4143075410). Only +Y (CN3-37) and −Z (CN3-38) are confirmed on the
   plane. The other four may route via a terminal block outside the 19-connector
   Honda family, or be bussed upstream. **Field trace required; do not assume a pin.**
5. **Spindle encoder** — `UNBOUND`, P3 empty, and **settled that way**
   (decided 2026-08-12): LinuxCNC does not read spindle position, so no spindle
   feedback conductor crosses any plane. Orient is FR-SX internal and speed
   supervision is discrete. The spindle *motor's* built-in PLG (Tamagawa
   TS1526N55, ±15 V) is the FR-SX's own detector, does not cross at BBIA-1, and
   is not a candidate Mesa input — it also sits upstream of the 2-speed gearbox,
   so it cannot express spindle position at all. See
   [`docs/spindle_motor_plg_encoder.md`](docs/spindle_motor_plg_encoder.md#design-decision--linuxcnc-does-not-read-spindle-position).
6. **Other Honda MR connectors that are NOT on BBIA-1** — e.g. the FR-SX spindle
   drive's SX-IO1 board (`CON1`/`CONA`/`CON2`/`CONAA`) and the RC3A relay card
   (`CN301`). Confirm whether any retrofit signal must land at one of *those* boards
   rather than at BBIA-1; if so it is an exception and belongs in this list.

---

## 4. Rules that follow from the plane

- **Model every crossing signal as one conductor across BBIA-1**, both ends
  populated, keyed on the factory wire number, unless it is in the Section 3
  exception list.
- **Do not re-derive the machine-internal side.** Cite `bbia1_cn_pinouts.csv` / the
  OEM print; the retrofit does not own it.
- **The retrofit owns and must verify only the BBIA↔Mesa hop**: Mesa card/terminal,
  normal state (NO/NC), polarity, and (for analog) scale — captured in
  `mesa/current_pin_authority.csv` with an `authority_status`.
- **Exceptions are handled by their own subsystem**, not shoehorned into the plane:
  E-stop → safety-relay chain; analog/resolver
  → whatever path Section 3b resolves to.
- **When something is found outside the plane, add it to Section 3** — keep the
  exception list exhaustive so the simplification stays true.

---

## 5. Consolidation — APPROVED by AG 2026-08-17, executed

The plane implies the four spine files should become **one joined table, one row per
BBIA-1 conductor**. Approved and carried out; per-bullet status below. Most of it had
already landed in PR #47 (`81d9658`) without this section being updated — the
"NOT yet executed" heading was stale, which is why approval was being sought for work
that was largely done.

| # | Step | Status |
|---|---|---|
| 1 | Authority CSV expresses both ends; `factory_wire` column added | **DONE** — 44 plane rows populated |
| 2 | Reduce/retire `bbia1_source_dest.csv` + the retrofit crosswalk | **REJECTED / DEFERRED** — see below |
| 3 | `bbia1_cn_pinouts.csv` as the immutable OEM reference the join reads | **DONE 2026-08-17** — it was never actually read until now |
| 4 | Reshape the I/O Navigator to present the plane | **DONE** — `bbia_class()` in `io-dashboard/tools/generate_data.py` |
| 5 | Validator: BBIA end + wire number present, wire numbers unique | **DONE 2026-08-17**, with one premise corrected |

**Step 1 — as built.** The join is `scripts/consolidate_bbia_authority.py`, and it keys
on **`signal_id`**, not on the factory wire number this section originally specified.
That is deliberate and now permanent: wire numbers are not unique (§ 2, and
`wiring/authority_conflicts.md` § 7.1). The script is idempotent and never invents a
coordinate — rows `source_dest` marks as off-plane stay blank.

**Step 2 — rejected for `source_dest`, deferred for the crosswalk.** Making
`bbia1_source_dest.csv` a *generated view* of the authority would invert the data flow:
it is the **input**, and it is the only place the `source_provenance` strings live
("RESOLVED 2026-08-10: Dwg 4143075409 pg135 …"). Regenerating it from the authority
would destroy the evidence that justifies the authority. It stays a curated source.
`bbia1_retrofit_destination_crosswalk.csv` genuinely is superseded — 13 of its 14 data
rows are redundant with the authority — but the 14th (`CN2-14` → `Z_LIMIT_PLUS`)
*contradicts* it with a retracted inference, so the file is **retained until the +Z
over-travel field trace lands** rather than deleted. See `authority_conflicts.md` § 7.3.

**Step 5 — as built, and what it found.** `check_plane_schema()` in
`scripts/validate_authority.py` enforces three things, all WARN-only so that a known-open
documentation conflict cannot break CI:

1. every plane row carries a `factory_wire` (it is the ferrule text);
2. no two rows claim the same wire, except the OEM's own documented reuse
   (`OEM_REUSED_WIRES`);
3. every plane row's `(connector, pin)` exists in the OEM pinout and its wire matches
   the `Wire_No` recorded there, except registered conflicts (`KNOWN_PLANE_CONFLICTS`).

Both allowlists are **staleness-checked**: an entry that no longer describes a real
condition is reported, so registering a conflict cannot quietly mask its later
regression. Running check 3 for the first time surfaced two OEM-vs-OEM contradictions
(`ATC_ZONE_Y` at `CN3-44`, `ATC_ZONE_Z` at `CN3-39`) — both recorded in
`wiring/authority_conflicts.md` § 7.2, **both unresolved, and neither conductor may be
landed on a Mesa input until it is buzzed at CN3.**

Scope limit worth knowing: the cross-check compares **wire numbers only**. A pin where
both sources agree on the wire but disagree on the printed signal name (as at `CN2-13`)
passes silently, by design — the wire number is the key and the printed label is
known-fallible.

---

## 6. Provenance & status

- BBIA-1 role and pass-through nature: `wiring/bbia1_terminal_unit.md`
  (OEM `41434WB.pdf` dwgs 4143075313 / 4143075311; board silkscreen BN624A306H01).
- Connector/pin reference: `wiring/bbia1_cn_pinouts.csv` (205 rows).
- Analog/resolver "no cabinet trace" flags: `mesa/current_pin_authority.csv`
  (FIRST-POWER 2026-08-09 notes on X/Y/Z_RESOLVER, X/Y/Z_AXIS_CMD, SPINDLE_SPEED_CMD).
- Unlocated over-travel limits: `wiring/bbia1_terminal_unit.md` § "Axis over-travel
  limits" (dwg 4143075410, found 2026-08-10).

**Verified:** BBIA-1 is a straight pass-through terminal unit and was the NC's sole
machine interconnect for discrete I/O; the retrofit lands the cut MR conductors on
Mesa screw terminals. **Inference (working assumption):** resolver + analog also
crossed at BBIA-1. **Open:** the Section 3b items — field-trace before wiring. This
architecture governs the data model; it does not by itself commission any circuit.
