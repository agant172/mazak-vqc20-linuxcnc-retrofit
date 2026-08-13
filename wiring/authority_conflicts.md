# Authority Conflicts — VQC-20/40 Retrofit

**Status:** DOCUMENTATION REVIEW RESOLVED — physical commissioning verification remains pending.

This register reconciles the RC3A connector cross-reference with the current Mesa pin authority. The documentation conflicts have been reviewed and handled conservatively: contradictory outputs remain blocked until cabinet tracing confirms the final wiring. Do not energize affected outputs based on this document alone.

## 1. Gear-shift solenoids

**RESOLVED 2026-08-08 (see CSV GEAR_HI_SOL / GEAR_LO_SOL):** pg100 TB-51 (Dwg 4143075338) confirms wire 412 → SOL-12 → GEAR SHIFT HIGH and wire 413 → SOL-13 → GEAR SHIFT LOW; physical double-check complete.

> **INDEPENDENTLY CORROBORATED 2026-08-12.** The OEM spindle-head device placard
> (dwg `24136209710`, mounted inside the splash-guard door) reads
> `GEAR SHIFT HIGH — SOL-12` and `GEAR SHIFT LOW — SOL-13`, matching the 2026-08-08
> resolution and confirming that the *original* authority rows (which had them
> reversed) were the error. This is a machine-mounted source, independent of the
> 1984 drawing set. See [`head_device_placard.md`](head_device_placard.md).
> The placard also confirms the gear-confirm switches: `HIGH GEAR — PRS-10`,
> `LOW GEAR — PRS-12`. Coil voltage/current measurement and RLY-1/RLY-2 fitting
> are still required before energizing — the placard settles identity, not wiring.

`gear-lo-sol` bound to 7i84U-A OUT8 in HAL 2026-08-09. Coil voltage/current
measurement and RLY-1/RLY-2 fitting still required before energizing. Original
conservative record kept below for provenance.

- Current authority: `SOL-13` planned high gear on 7i84U TB3 OUT7.
- Current authority: `SOL-12` planned low gear on 7i84U TB2 OUT8.
- New evidence: `connector_crossref.md` identifies wire 413 as `SOL-13 — Gear Shift Low`.
- Resolution test: trace the coil wire tags from RC3A to both valve coils; identify the valve ports for high and low; measure coil voltage/current; then update both rows together.
- Authority status: `GEAR_HI_SOL` remains `COMMISSIONING_PENDING` and
  `GEAR_LO_SOL` remains `HOLD_CONFLICT` in the current authority. Neither
  output may be field-landed or energized until the two coils are traced
  together; the asymmetric statuses record the current CSV rather than proof
  that high gear is known.

## 2. Tool clamp/unclamp valve

**Documentation status: CONSERVATIVELY RECORDED.** Physical valve topology and clamp-side path remain pending cabinet verification.

> **SINGLE-COIL READING SUPPORTED 2026-08-12.** The OEM head placard (dwg
> `24136209710`) draws **exactly one tool solenoid — `TOOL UNCLAMP — SOL-10`** —
> and **no tool-clamp solenoid anywhere on the head**, alongside two pressure
> switches, `TOOL CLAMP — PRS-9` and `TOOL UNCLAMP — PRS-8`. That is the classic
> single-coil arrangement: energise to unclamp, spring/hydraulic return to clamp,
> with a pressure switch confirming each state. It matches the CSV, which already
> carries `TOOL_CLAMP_SOL` (OUT9) as `NOT_USED` / "PHANTOM — no separate clamp
> solenoid; SOL-10 is single-coil", and `PRS-9`/`PRS-8` on IN15/IN16.
> **Caveat:** the placard covers head-mounted devices only, so it cannot exclude a
> clamp-side valve elsewhere. It answers this section's "single-coil or dual-coil"
> question as *probably single-coil*, not conclusively. Physical valve inspection
> with pressure removed is still the closing test.
> See [`head_device_placard.md`](head_device_placard.md).
>
> **Hardware photographed 2026-08-13 — still not decisive.** The head hydraulic
> stack is **two NACHI-FUJIKOSHI directional control valves** (upper one
> `SA-G01-E3X-C1-31`), which confirms the "Fujikoshi hydraulic valve" description
> on the CSV rows. But no frame shows either valve **end-on**, so coil count per
> valve could not be established. Two bodies is consistent either way — gear
> shift hi/lo is naturally one double-solenoid valve plus tool unclamp on a
> second. See [`head_valve_hardware.md`](head_valve_hardware.md).
> **Note also: the head hydraulics may still be pressurised** — depressurise
> before valve inspection.

- Current authority: TB2 OUT9 and OUT10 were both associated with `SOL-10`, with OUT9 clamp and OUT10 unclamp.
- New evidence: `connector_crossref.md` identifies `SOL-10` as tool unclamp.
- Resolution test: trace the RLY-3 and RLY-4 load sides to the hydraulic valve, identify whether SOL-10 is single-coil or dual-coil, and verify clamp/unclamp prox behavior with pressure removed.
- Authority status: both TB2 OUT9 and OUT10 remain
  `COMMISSIONING_PENDING`. The physical valve topology is still a blocker;
  those statuses must not be read as permission to energize either output.

## 3. Magazine rotation direction

**COIL IDENTITY RESOLVED 2026-08-09 (see CSV MAG_CW_SOL / MAG_CCW_SOL):** SOL-8B = CW on OUT13, SOL-8A = CCW on OUT14 per pg91 Dwg 4143075332 + connector_crossref (alarm-table OCR was wrong). Both nets bound in HAL 2026-08-09. **Observed rotation direction remains PENDING BENCH verification** — do not land or energize either field wire until verified under controlled commissioning. Original conservative record kept below for provenance.

- New evidence identifies `SOL-8A` as CCW/forward and `SOL-8B` as CW/reverse.
- The current authority assigns proposed `SOL-8A` / `SOL-8B` identities to
  `MAG_CW_SOL` OUT13 and `MAG_CCW_SOL` OUT14. Both rows remain
  `HOLD_CONFLICT`; the names are hypotheses to prove, not direction evidence.
- Resolution test: trace the two solenoid wires and verify actual magazine movement direction with hydraulic power isolated or under controlled commissioning.
- Authority status: do not promote either direction row until this trace is complete.

## 4. "Spindle tachogenerator" — does the device exist?

**Documentation-only conflict. No pin-authority row, HAL net, or field wire
depends on it; nothing is blocked by leaving it open.** Raised 2026-08-12 while
correcting the spindle-feedback section after the PLG nameplate photos.

- **Claim under dispute:** `servo_amp_analysis.md` §1.5 listed a **"Spindle
  tacho: Tamagawa TGF-3D P402-Sx"**, sourced to dwg 4143075313 sheet 3, and
  already carried the caveat "not yet physically confirmed in the uploaded
  photos."
- **Evidence against the part-number attribution** — three repo sources put the
  **TGF-3D P402-Sx on the X/Y/Z axis motors**, not the spindle:
  - `docs/servo_commissioning.md` — "integral to the HD-101 / HD-81 motors",
    closing the TRA inner velocity loop.
  - `docs/architecture_decision.md` — "TRA-type drives close their velocity loop
    on a tachogenerator (Tamagawa TGF-3D P402-Sx)".
  - dwg **4143075404** p128 — tacho `TG1`/`TG2` (2 V/1000 rpm) land on the axis
    connectors `CNA3` (X) / `CNA4` (Y) / `CNA5` (Z).
- **Evidence against a spindle tacho existing at all:**
  - **Owner statement 2026-08-12:** not aware of any "spindle tacho" device on
    the machine.
  - The spindle is an **AC induction motor on a vector drive** with a
    **built-in PLG** (`docs/spindle_motor_plg_encoder.md`). That PLG is the
    speed feedback; a DC tachogenerator on such a spindle would be redundant.
    *Inference from drive type — not a primary-source statement.*
- **Evidence for:** exactly one line — the feedback-device legend on dwg
  **4143175310** p079, transcribed in `electrical_diagram_index.md` as
  "spindle tacho gen, rotary encoder, per-axis resolvers". The underlying
  drawing has not been re-read since that transcription.
- **Likely explanation of that legend entry (added 2026-08-12):** the spindle
  **motor's own wiring plate** (`889515-01`, photographed 2026-08-12) titles the
  PLG pin table `CONNECTOR WIRING OF P.L.G.` in English and
  **`タコジェネのコネクタ結線`** in Japanese — *"connector wiring of the
  tacho-gene"*, `タコジェネ` being the standard contraction of タコジェネレータ,
  tachogenerator. **Mitsubishi's own plate therefore uses "P.L.G." and "tacho
  generator" for the same device.** The most economical reading of p079's
  "spindle tacho gen" is that it names **this motor-built-in optical PLG**, not
  a separate DC tachogenerator. That is consistent with every other line of
  evidence, and with the owner seeing no such separate device.
- **Controlling position:** the **TGF-3D P402-Sx is an axis device**; that is
  supported by three independent repo sources plus a drawing citation, against
  one loosely transcribed legend. §1.5 has been corrected to stop asserting a
  spindle tacho, and now points here. Working conclusion: **no separate spindle
  tachogenerator exists** — the p079 legend entry is the PLG under Mitsubishi's
  own alternate name. Confirm by the p079 re-read below before closing.
- **Resolution test:**
  1. Re-read dwg **4143175310 p079** at 300 DPI and transcribe the
     feedback-device legend exactly — including any part number attached to the
     "spindle tacho gen" entry.
  2. If a spindle tacho is genuinely drawn, look for its input on the FR-SX
     terminal/connector set and photograph the device on the machine.
  3. If p079 shows no such device, or the legend turns out to be generic
     boilerplate, or its "tacho gen" entry points at the motor-mounted PLG
     (the expected outcome — see the `タコジェネ` note above), correct the claim
     in `electrical_diagram_index.md` p079 and close this section.
- **Do not** add a spindle-tacho row to `current_pin_authority.csv` on the
  strength of the legend line alone.

## 5. Air/coolant solenoid identities vs. the head placard

**Raised 2026-08-12** from a close-up of the OEM spindle-head device placard
(dwg `24136209710`), transcribed in
[`head_device_placard.md`](head_device_placard.md).

**Nothing is landed or energised** — these are pre-power planning rows. But they
are **100 VAC solenoid outputs** and the identities must be settled **before**
RLY-5/6/7 are wired, or an output will drive the wrong device.

> **Coil voltage confirmed on the hardware 2026-08-13.** The CKD air solenoids
> on the head are marked **`100V 110V 50/60`**
> ([`head_valve_hardware.md`](head_valve_hardware.md)). The repo had been
> carrying 100 VAC as a planning assumption; it is correct, so the
> interposing-relay requirement rests on nameplate evidence rather than
> inference. Coil **current** is still unmeasured — relay contact sizing stays
> open.

### The disagreement

The placard, `connector_crossref.md` (OEM dwg pg 90) and
`io_map_research_notes.md` **all agree** with each other:

| Tag | Function (placard + crossref + io_map notes) |
|---|---|
| `SOL-15` | Spindle air blast |
| `SOL-16` | Work air blast |
| `SOL-35` | Dust inhole/inhale eliminate |
| `SOL-36` | Oil hole |
| `SOL-61` | **Air jet** |

The **pin authority CSV disagrees on three rows**:

| Row | CSV field point | Conflict |
|---|---|---|
| `AIR_BLAST` (7i84U-B TB3 OUT3) | `SOL-62 via RLY-5`, spindle air blast | Placard gives spindle air blast as **`SOL-15`**. **No `SOL-62` appears on the head placard at all**, and `bbia1_source_dest.csv` already records "no wire# for SOL-62 found to disambiguate". The label legend writes it `SOL-62?`. |
| `TOUCH_SENSOR_BLAST` (OUT4) | `SOL-35 via RLY-6`, "MMS touch-sensor air jet" | The *function* (air jet) maps to **`SOL-61`** on the placard; **`SOL-35` is dust inhole eliminate**. `bbia1_source_dest.csv` resolved this row to CN11-10 **wire 261 = AIR JET** — which supports the function but points at `SOL-61`, not `SOL-35`. |
| `TAP_COOLANT_BLAST` (OUT5) | `SOL-61 via RLY-7`, tap coolant | Placard gives **`SOL-61` = AIR JET**. Collides directly with the row above. The element crosswalk separately maps `Y016 TAPC.M TAP COOLANT` → `SOL-61`. |

### TRACED 2026-08-12 — the wire numbers settle it

A documentary trace across `connector_crossref.md` (OEM pg 90/91),
`bbia1_cn_pinouts.csv` (CN11) and the head placard resolves all three rows.

**The rule: on the RC3A solenoid output bank, wire `4NN` drives `SOL-NN`.**
Seven independent confirmations, no exceptions:

| Wire | Solenoid | Function |
|---|---|---|
| `410` | `SOL-10` | Tool unclamp |
| `413` | `SOL-13` | Gear shift low |
| `415` | `SOL-15` | Spindle air blast |
| `416` | `SOL-16` | Work air blast |
| `417` | `SOL-17` | Mist coolant |
| `431` | `SOL-31` | Flood coolant |
| `435` | `SOL-35` | Dust inhale eliminate |

The BBIA-1/terminal-unit side carries the same functions as **`2NN`**, and the
last two digits track across all three: `2NN` ↔ `4NN` ↔ `SOL-NN`. The placard
independently confirms two cases the crossref table did not cover — CN11-12
wire `236` **OIL HOLE** ↔ `SOL-36`, and CN11-10 wire `261` **AIR JET** ↔
`SOL-61`. Both land exactly where the rule predicts.

### Conclusions

| Row | CSV had | **Traced identity** | Evidence |
|---|---|---|---|
| `AIR_BLAST` (OUT3) | `SOL-62` | **`SOL-15`**, spindle air blast | Element `Y018 SAB.M` = SPINDLE AIR BLAST → CN11-6 wire `215` → wire `415` → `SOL-15`. Placard: `SPINDLE AIR BLAST SOL-15`. This also settles the `bbia1_source_dest.csv` "CN11-6 vs CN11-7" ambiguity: the net is *spindle* blast, so CN11-6. |
| `TOUCH_SENSOR_BLAST` (OUT4) | `SOL-35` | **`SOL-61`**, air jet | Element `Y035 A-JET.M` = AIR JET → CN11-10 wire `261` → wire `461` → `SOL-61`. Placard: `AIR JET SOL-61`. `bbia1_source_dest.csv` already had the *wire* right (261, CN11-10); only the `SOL` tag was wrong. `SOL-35` is dust inhale eliminate (wire 235/435) and belongs to no current row. |
| `TAP_COOLANT_BLAST` (OUT5) | `SOL-61` | **Unresolved — but NOT `SOL-61`** | `SOL-61` is the air jet, claimed by OUT4 above. Element `Y016 TAPC.M` TAP COOLANT appears as signal `TAPC` on **CN6-18 → CNB-46** (`bbia1_cn_pinouts.csv:123`) — a different connector from the CN11 solenoid bank entirely. No `4NN` wire or `SOL` tag for tap coolant has been located. |

### What `SOL-62` actually is — probable, not proven

`SOL-62` is real: wire **`462`** is recorded on the `03-81579-02` diode/opto
board alongside `461` (`photo_survey_misc.md`). By the `4NN`→`SOL-NN` rule it
drives `SOL-62`, and the matching control-side wire is CN11-9 **`262` = TOOL
MEASURING ARM EXTEND** (PLC `Y034 AEXT.M`, ladder sheet 41 rung 4102).

So **`SOL-62` is most likely the tool-measuring-arm extend solenoid** — which
also explains cleanly why it is absent from the head placard: the measuring arm
is not a head device. **This is an inference from the numbering pattern, not a
direct drawing read.** It matters only as an explanation for how `SOL-62` got
attached to the air-blast row; nothing depends on it.

### Recommended correction (owner decision — not applied)

1. `AIR_BLAST` OUT3 → field point **`SOL-15` via RLY-5**, wire 215 / CN11-6.
2. `TOUCH_SENSOR_BLAST` OUT4 → field point **`SOL-61` via RLY-6**, wire 261 / CN11-10.
3. `TAP_COOLANT_BLAST` OUT5 → **`HOLD_CONFLICT`**. Its solenoid is unidentified;
   the `SOL-61` tag it currently carries belongs to OUT4. Do not wire RLY-7.

`AIR_BLAST` and `TOUCH_SENSOR_BLAST` keep the correct *function* and the correct
*wire* — only the `SOL-xx` label was wrong — so correcting them is a relabel, not
a rebinding. `TAP_COOLANT_BLAST` is the genuinely open one.

### Closing verification (still physical)

The trace is documentary. Before RLY-5/6/7 are wired, confirm on the machine:

1. Read the tag off the solenoid body at each head position the placard marks —
   quickest single check, and it settles `SOL-15` and `SOL-61` outright.
2. Buzz wire **261** (CN11-10) and wire **215** (CN11-6) through to their coils.
3. For tap coolant: trace `TAPC` from **CN6-18 → CNB-46** to whatever it drives,
   and read that device's tag. This is the one with no paper answer.
4. Confirm whether `SOL-62` is the measuring-arm solenoid, if only to close the
   loop on the mislabel.

### Status

All three rows remain `FACTORY_INTERFACE` with bindings and `hal_net` unchanged;
no status was altered. Each carries a pointer to this section.

## 6. Gear-confirm and tool-clamp pressure switches — three-way disagreement

**Raised in `io_map_research_notes.md`, RESOLVED IN FAVOUR OF THE CSV 2026-08-12.**

`io_map_research_notes.md` records that the TB-51 diagram (pg 100, dwg
4143075338) appeared to show **`PRS-9` = high gear, `PRS-10` = low gear,
`PRS-12` = 2nd Z over-travel**, and flags this as a *third* answer conflicting
with both the alarm-table OCR pass and `current_pin_authority.csv`. That note
warns in its own words that "small-digit misreads (9 vs 8, 10 vs 12) on a faded
scan are exactly the failure mode to expect here."

**The head placard (dwg `24136209710`) backs the CSV:**

| | CSV | Placard | TB-51 read |
|---|---|---|---|
| High gear confirm | `PRS-10` | **`PRS-10`** ✅ | `PRS-9` ❌ |
| Low gear confirm | `PRS-12` | **`PRS-12`** ✅ | `PRS-10` ❌ |
| Tool clamp confirm | `PRS-9` | **`PRS-9`** ✅ | — |
| Tool unclamp confirm | `PRS-8` | **`PRS-8`** ✅ | — |

The placard is a crisp, machine-mounted OEM source; the TB-51 reading came from
a faded scan and was self-flagged as low/medium confidence. **Controlling
position: the CSV values are correct.** The `PRS-3` "clamp (blue wire)" entry in
the same TB-51 table is likely another misread of `PRS-9` and should not be
cited.

Treat this as documentary resolution, not commissioning: still meter each switch
before relying on its state, per the standing rule that no normal-state is
trusted until field-verified.

## Evidence documents

- `connector_crossref.md` — OEM drawing/photo cross-reference.
- `bbia1_terminal_unit.md` — BBIA-1 interconnect architecture note.
- `bbia1_continuity_trace_worksheet.csv` — field continuity worksheet; all rows remain unverified.
- `../mesa/current_pin_authority.csv` — planning authority with blocked conflicts.
