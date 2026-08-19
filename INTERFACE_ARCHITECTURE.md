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

**The single-plane rule (discrete I/O):** every discrete signal that crosses between
the control system and the machine crosses at **one place — the BBIA-1 connector
plane** — with a small, explicitly enumerated set of exceptions (Section 3). One
physical conductor across that plane = one row in the I/O model. Nothing else needs
to be modeled as if it were retrofit wiring.

**Amendment 2026-08-17 — a second, named plane for the servo/spindle interface.**
BBIA-1 was the NC's *back-panel* breakout, but resolver feedback, ±10 V axis
velocity commands, and the spindle speed/orient interface never routed through the
back panel — they ran directly between the NC's card cage and the servo/spindle
drives, on their own connector family (**CNA**-prefixed per axis) and the spindle
drive's **SX-IO1** board (`CON1`/`CONA`/`CON2`/`CONAA`, dwg 4143075403 p127). With
the NC removed, this becomes the retrofit's second interface plane, not a BBIA-1
exception to keep chasing — this resolves the previously-open Section 3b items 3
and 6 below:

```
                                                    7i49 (P1)
                                                    resolver + ±10V analog
                                                    │  shielded home-run cable
                                                    ▼
                                     ┌─────────────────────────────┐
                                     │ CNA3(X)/CNA4(Y)/CNA5(Z)      │  ◀── PLANE B
                                     │ (servo card cage) + SX-IO1   │      (resolver,
                                     │ (spindle command/feedback)   │       ±10V, spindle)
                                     └──────────────┬───────────────┘
                                                    │  (unchanged OEM cabling to
                                                    │   TRA amps / FR-SX drive)
                                                    ▼
                                              THE MACHINE
```

**Plane B is deliberately separate from Plane A (BBIA-1)**: different connector
family, different physical location (servo card cage, not the back-panel terminal
unit), different signal class (analog/resolver, not discrete digital I/O), and per
the resolver wiring warning in `wiring/README.md`, deliberately **not** routed
through a digital terminal unit at all — home-run shielded cable to the 7i49 to
avoid noise coupling.

**One relay board is explicitly *not* part of Plane B, despite living in the same
servo/spindle bay:** `wiring/connector_crossref.md` cross-references the RC3A relay
board's silkscreen labels (`CTL`, `OTR`, `SSET`, `SRV`, `SMR`, `ORC`, `TCME`, etc.)
against dwg 4143075305 p075 and finds an exact match to signals already present on
BBIA-1's own `CN3`/`CN301A` tables. RC3A's discrete relay-logic signals are already
reachable at the documented Plane A connector — they don't need a separate tap
point. What remains genuinely Plane B and still unmapped at the pin level is the
SX-IO1 board's own connectors (`CON1`/`CONA`/`CON2`/`CONAA`) — see
`wiring/connector_crossref.md` § "Other connectors on the spindle/servo bay, not
yet fully cross-referenced."

The CNA3/4/5 axis resolver connectors are the mature part of Plane B: pin roles are
now confirmed against Mitsubishi's own `M2 Maintenance Manual` detector-wiring
figure (not just the 41434WB schematic), and DC resistance was bench-measured
2026-08-16 on all three axes — see `docs/resolver_commissioning.md` §§ "OEM
connector reference" and "Measured DC resistance 2026-08-16," and `resolvers.md`.
Per Section 3b item 5, **spindle position feedback does not cross either plane** —
that's a settled, separate design decision (LinuxCNC doesn't read spindle
position); Plane B's spindle-side scope is limited to the analog speed command and
orient signals, not encoder/PLG feedback.

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
- **The factory wire number is the join key.** Each conductor carries a wire number
  printed on its jacket (e.g. `210`), visible at the cut. That number — not the
  CN/pin, not the signal name — is the stable primary key that ties the OEM print,
  the BBIA pinout, the new ferrule/label, the Mesa terminal, and the HAL net
  together. Label with the wire number first (see `wiring/bbia1_terminal_unit.md` §
  "Practical use").
- **One joined table, not four.** Today the spine is split across
  `mesa/current_pin_authority.csv` (Mesa+HAL end, BBIA end blank in 81/132 rows),
  `wiring/bbia1_source_dest.csv` (both ends, 74 rows), the
  `wiring/bbia1_retrofit_destination_crosswalk.csv` (15 rows), and the OEM pinout
  `wiring/bbia1_cn_pinouts.csv` (205 rows) — four different keys for two ends of one
  cable. The model should express the plane directly: **one row per conductor, both
  ends populated, keyed on the factory wire number.** See Section 5 for the proposed
  consolidation (not yet executed).

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
3. **7i49 analog + resolver path — RESOLVED 2026-08-17, see Section 1 "Plane B."**
   X/Y/Z resolver feedback, X/Y/Z ±10 V velocity commands to the MELDAS TRA amps,
   and the FR-SX spindle speed reference **do not cross at BBIA-1**. They form
   their own plane at the CNA-family servo card-cage connectors and the FR-SX
   `SX-IO1` board, wired home-run/shielded to the 7i49 — never routed through a
   digital I/O terminal unit (see the resolver warning in `wiring/README.md`).
   What remains open is not *which plane* but pin-level completeness: the CNA3/4/5
   resolver connectors are Mitsubishi-manual-confirmed and bench-measured
   (`docs/resolver_commissioning.md`); the SX-IO1 board's connectors are not yet
   pinned out (`wiring/connector_crossref.md` § "not yet fully cross-referenced").
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
6. **Other Honda MR connectors that are NOT on BBIA-1 — RESOLVED 2026-08-17, see
   Section 1 "Plane B."** The FR-SX spindle drive's **SX-IO1 board**
   (`CON1`/`CONA`/`CON2`/`CONAA`) is part of Plane B — genuinely not on BBIA-1, and
   not yet pinned out at the signal level. The **RC3A relay card** (`CN301`) is
   **not** part of either plane in the sense of needing a new tap point: its
   labeled signals cross-reference exactly to BBIA-1's own `CN3`/`CN301A` tables
   (`wiring/connector_crossref.md`), so it's already reachable via the documented
   Plane A connector.

---

## 4. Rules that follow from the plane

- **Model every discrete crossing signal as one conductor across BBIA-1 (Plane A)**,
  both ends populated, keyed on the factory wire number, unless it is in the
  Section 3 exception list.
- **Model every resolver/analog/spindle-command crossing signal as crossing at Plane
  B** (CNA-family connectors / SX-IO1 board), tracked in `docs/resolver_commissioning.md`,
  `resolvers.md`, and `wiring/connector_crossref.md` — connector, pin, and Mesa/7i49
  destination — the same way Plane A is tracked in `wiring/bbia1_terminal_unit.md`.
- **Do not re-derive the machine-internal side of either plane.** Cite
  `bbia1_cn_pinouts.csv` for Plane A; cite the Mitsubishi M2 manual / bench
  measurements in `docs/resolver_commissioning.md` and the OEM print pages in
  `wiring/connector_crossref.md` for Plane B. The retrofit does not own the
  machine-internal wiring on either side.
- **The retrofit owns and must verify only each plane's hop to Mesa**: Mesa
  card/terminal, normal state (NO/NC), polarity, and (for analog) scale — captured
  in `mesa/current_pin_authority.csv` with an `authority_status`.
- **Exceptions are handled by their own subsystem**, not shoehorned into either
  plane: E-stop → safety-relay chain.
- **When something is found outside both planes, add it to Section 3** — keep the
  exception list exhaustive so the simplification stays true.

---

## 5. Proposed consolidation (NOT yet executed — needs owner approval)

The plane implies the four spine files should become **one joined table, one row per
BBIA-1 conductor**. This is a data-model change, so it is proposed here rather than
done unilaterally:

- Make `mesa/current_pin_authority.csv` express both ends of the plane: populate the
  existing `dest_connector` / `dest_pin` columns (BBIA end) from
  `bbia1_source_dest.csv` + `bbia1_cn_pinouts.csv`, joined on the factory wire number,
  and add a `factory_wire` column as the stable key.
- Reduce `bbia1_source_dest.csv` and `bbia1_retrofit_destination_crosswalk.csv` to
  generated views of that single authority (or retire them), so there is one spine,
  not four.
- Keep `bbia1_cn_pinouts.csv` as the immutable OEM reference the join reads from.
- Reshape the I/O Navigator (`io-dashboard/`) to present the plane: for each signal,
  machine function → BBIA CN/pin + wire # → Mesa terminal → HAL net, with the
  Section 3 exceptions shown as their own groups.
- Extend `scripts/validate_authority.py` to check that every non-exception row has a
  populated BBIA end and a wire number, and that wire numbers are unique.

**Do not start the consolidation until AG approves the target schema**, because it
touches the authority CSV that HAL and CI validate against.

---

## 6. Provenance & status

- BBIA-1 role and pass-through nature (Plane A): `wiring/bbia1_terminal_unit.md`
  (OEM `41434WB.pdf` dwgs 4143075313 / 4143075311; board silkscreen BN624A306H01).
- Connector/pin reference (Plane A): `wiring/bbia1_cn_pinouts.csv` (205 rows).
- CNA/SX-IO1 servo-spindle interface (Plane B): `docs/resolver_commissioning.md`
  (Mitsubishi M2 Maintenance Manual detector figure + 2026-08-16 bench DC-resistance
  measurements), `resolvers.md` (nameplate/serial survey), `wiring/connector_crossref.md`
  (OEM dwg 4143075403 p127 for the SX-IO1 board; RC3A↔BBIA-1 CN3/CN301A cross-reference).
- Unlocated over-travel limits (Plane A): `wiring/bbia1_terminal_unit.md` § "Axis
  over-travel limits" (dwg 4143075410, found 2026-08-10).

**Verified:** BBIA-1 is a straight pass-through terminal unit and was the NC's sole
machine interconnect for discrete I/O; the retrofit lands the cut MR conductors on
Mesa screw terminals. CNA3/4/5 resolver pin roles are Mitsubishi-manual-confirmed
and bench-measured. **Resolved 2026-08-17:** resolver, ±10 V analog, and spindle
command do **not** cross at BBIA-1 — they form Plane B at the CNA-family/SX-IO1
connectors (Section 1), and RC3A's relay logic is reachable via the existing Plane A
CN3/CN301A rather than needing its own tap. **Open:** the SX-IO1 board's pin-level
mapping, and the remaining Section 3b items (over-travel limits). This architecture
governs the data model; it does not by itself commission any circuit.
