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
   land in the **safety-relay chain, never on a Mesa input**. LinuxCNC only *monitors*
   machine-enabled state via a `MAR` aux contact / `MAR-MON` interposing relay.
   LinuxCNC/HAL is not a safety input. (See `docs/estop_safety_chain.md`.)
2. **Power and return.** The OEM `P24`/`G24` bus (Shindengen HR-11F-24) feeds BBIA-1
   and OEM circuits; the retrofit `DR-240-24` supply feeds the Mesa cards, new relays,
   and field loads. These are power, not machine signals, and **the two 24 V domains
   stay isolated** — every OEM↔new signal crossing the plane goes through an
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
5. **Spindle encoder (if fitted)** — currently `UNBOUND`, P3 empty, path unknown.
   Identify model/format and interface before allocating. The spindle *motor's*
   built-in PLG (Tamagawa TS1526N55, ±15 V) is identified but is the FR-SX's own
   detector, does not cross at BBIA-1, and is **not** a candidate Mesa input —
   see [`docs/spindle_motor_plg_encoder.md`](docs/spindle_motor_plg_encoder.md).
   Whether a separate machine-side encoder exists is still open.
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
  E-stop → safety-relay chain; power → the two isolated 24 V domains; analog/resolver
  → whatever path Section 3b resolves to.
- **When something is found outside the plane, add it to Section 3** — keep the
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
