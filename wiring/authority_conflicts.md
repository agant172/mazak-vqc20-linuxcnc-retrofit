# Authority Conflicts — VQC-20/40 Retrofit

> **ROLE: INSTALL-CORE** — controlling wiring content (resolved solenoid identities, per-output energize blocks, open gaps). Check the relevant entry before landing or energizing any output named here. See [../INSTALL_SPINE.md](../INSTALL_SPINE.md) §3.


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

**RESOLVED 2026-08-13 — `SOL-10` IS A SINGLE-COIL VALVE.** Coil wire labels were
read on every solenoid on the head
([`head_valve_hardware.md`](head_valve_hardware.md#2-closed--sol-10-is-a-single-coil-valve)):

- The Nachi `SA-G01-E3X-C1-31` carries a coil at **each** end — wire `412`
  (`SOL-12` gear high) and wire `413` (`SOL-13` gear low). That is the gear-shift
  double solenoid; its `E3X` 3-position spool fits high / neutral / low.
- **Tool unclamp is a separate valve body** carrying wire `410` = `SOL-10`.

Three coils over two bodies = 2 + 1, exactly as the placard's tag count forced.
**`TOOL_CLAMP_SOL` (OUT9) `NOT_USED` / "PHANTOM — SOL-10 is single-coil" is
confirmed** — there is no second coil anywhere for a clamp solenoid. Clamp is
spring/hydraulic return, with `PRS-9`/`PRS-8` confirming each state.

*Residual:* the far end of the tool-unclamp valve was not photographed. A second
coil there is not photographically excluded, but it would need a tag and a wire
number and has neither. A glance at that end closes it completely.

**Still open regardless of coil count:** clamp/unclamp *behaviour* — contact
form, valve porting, and prox response with pressure removed — remains
uncommissioned. OUT9/OUT10 statuses are unchanged.

Original conservative record kept below for provenance.

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
> **[SUPERSEDED — the two blocks below were written before the coil wire labels
> were read; the resolution above replaces them. Kept for provenance.]**
>
> **Hardware photographed 2026-08-13 — still not decisive.** The head hydraulic
> stack is **two NACHI-FUJIKOSHI directional control valves** (upper one
> `SA-G01-E3X-C1-31`), which confirms the "Fujikoshi hydraulic valve" description
> on the CSV rows. But no frame shows either valve **end-on**, so coil count per
> valve could not be established. Two bodies is consistent either way — gear
> shift hi/lo is naturally one double-solenoid valve plus tool unclamp on a
> second. See [`head_valve_hardware.md`](head_valve_hardware.md).
> **Pressure:** an earlier note here warned the head hydraulics might still be
> pressurised. That came from a misread of an oblique frame — a straight-on shot
> of the gauge shows **zero**. Normal verify-before-you-open practice still
> applies; there is no specific stored-pressure concern.
>
> **CLOSING METHOD — no device tag needed (2026-08-13).** The solenoids carry no
> `SOL-xx` tags, so this section cannot be closed by photographing one. It can be
> closed by **arithmetic instead**: the placard lists three hydraulic solenoid
> tags on the head (`SOL-10`, `SOL-12`, `SOL-13`) = three coils. Count the
> solenoid valve bodies and the coils on each — excluding the `OY-G01-T-11`
> modular sandwich plate, which is not a solenoid. **If there are two bodies,**
> three coils over two bodies forces one double + one single; gear shift hi/lo is
> the natural double (a 3-position valve: high / neutral / low), leaving `SOL-10`
> as the single and confirming the `TOOL_CLAMP_SOL` PHANTOM call. **If there are
> three bodies,** it could be 1+1+1 and this section stays open. Either way the
> answer comes from one side-on photo of the stack.
> Method detail in [`head_valve_hardware.md`](head_valve_hardware.md).

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

### PHYSICALLY CONFIRMED 2026-08-13 — and the picture changed

Coil wire labels were read on every solenoid on the head. Two things came out of
it, and the second is bigger than the first.

**1. `AIR_BLAST` is confirmed as `SOL-15`.** The CKD lower air solenoid carries
wire **`415`**, and the upper carries **`416`** — precisely what
`connector_crossref.md` predicted from OEM dwg pg 90 (`415` → SOL-15 spindle air
blast, `416` → SOL-16 work air blast). The `SOL-62` label on this row was wrong.

**2. Only TWO air solenoids exist on the head. There are no hidden ones**
(owner, on the machine). The placard lists six air/coolant solenoids; four have
no device:

| Tag | Function | On the head? |
|---|---|---|
| `SOL-15` | Spindle air blast | ✅ wire `415` |
| `SOL-16` | Work air blast | ✅ wire `416` |
| `SOL-31` | Flood coolant | ❌ not on the head |
| `SOL-35` | Dust inhole eliminate | ❌ not on the head |
| `SOL-36` | Oil hole | ❌ not on the head |
| `SOL-61` | Air jet | ❌ not on the head |

**The placard is a generic VQC-20/40 family plate listing optional equipment**,
not an inventory of this serial number — see
[`head_device_placard.md`](head_device_placard.md).

### What this means for the three rows

| Row | Status after the trace |
|---|---|
| `AIR_BLAST` (OUT3) | **Identified: `SOL-15`, wire `415`.** Function and wire were already right; only the tag was wrong. A relabel. |
| `TOUCH_SENSOR_BLAST` (OUT4) | **Its device does not exist on the head.** It was labelled `SOL-35` (dust inhole eliminate); neither `SOL-35` nor `SOL-61` (air jet) is fitted. `SOL-61` serves the MMS touch sensor, which the element crosswalk already flags `OPTION_VERIFY`. |
| `TAP_COOLANT_BLAST` (OUT5) | **Its device does not exist on the head.** `SOL-61` is not fitted, and no tap-coolant solenoid has been located anywhere. |

### A gap this opened: `SOL-16` has no Mesa output

**Work air blast (`SOL-16`, wire `416`) is physically fitted and wired, but no
row in `current_pin_authority.csv` drives it.** The only air-blast row is
`AIR_BLAST` (OUT3), now identified as spindle air blast (`SOL-15`). CN11-7 wire
`216` carries WORK AIR BLAST on the terminal unit, so the signal exists on the
BBIA-1 plane. **This is a real device with no assigned output** — it needs either
an allocation or a documented decision to drop it.

### Recommended action (owner decision — not applied)

1. `AIR_BLAST` OUT3 → field point **`SOL-15` via RLY-5**, wire `415` / `215`,
   CN11-6. Relabel only; binding unchanged.
2. **Allocate an output for `SOL-16` work air blast** (wire `416` / `216`,
   CN11-7), or record a decision to drop the function. 7i84U-A is at 100 % —
   see [`../docs/io_capacity_reconciliation.md`](../docs/io_capacity_reconciliation.md)
   before allocating.
3. `TOUCH_SENSOR_BLAST` OUT4 and `TAP_COOLANT_BLAST` OUT5 → **`NOT_USED` or
   `RESERVED`**, matching how `MIST_COOLANT` was handled when that system was
   found absent. Do not fit RLY-6/RLY-7 for devices that are not there.
4. Before dropping anything, confirm **where the missing four live**, if
   anywhere. **Flood coolant especially** is a real machine function — the
   authority carries `COOLANT_ON`, and CN11 carries wire `231` flood coolant plus
   wire `236` flood-coolant motor starter. "Not on the head" is not "does not
   exist".

### Closing verification — mostly done

1. ~~Read the conductor label at each coil's DIN plug~~ — **DONE 2026-08-13.**
   All five head coils read: `410`, `412`, `413`, `415`, `416`.
2. ~~Buzz wire 261 and wire 215 to their coils~~ — superseded; the labels were
   readable directly.
3. **Still open:** trace `TAPC` from **CN6-18 → CNB-46** and find what, if
   anything, it drives. This is the last unresolved device path.
4. **Still open:** confirm whether `SOL-62` is the measuring-arm solenoid — only
   to close the loop on the original mislabel; nothing depends on it.
5. ~~Locate the missing air solenoids~~ — **ANSWERED: they are not on the head**
   (owner, 2026-08-13). Remaining question is whether `SOL-31` flood coolant and
   the others exist elsewhere on the machine, which matters before any row is
   dropped.
6. ~~Confirm wire `16` is the coil common / meter it to earth~~ — **CLOSED
   2026-08-13 (owner).** All five coils carry wire `16` on the second pin, and
   **the `16` terminals meter continuity to ground**. Each solenoid is `4NN`
   switched-live + `16` earthed return.
   A third measurement — **0 Ω between the solenoid-end `16` and the cabinet-strip
   `16`** — shows the two are one continuous conductor, so the `16` return is a
   **traced conductor** from cabinet strip to every head coil, not an assumed one.
   **Settled consequence:** the interposing relay contact belongs in the **`4NN`
   line** — the live, switched side, which is what the RC3A bank already breaks.
   `16` stays connected. An earlier warning that `16` might be a live conductor
   is withdrawn; see
   [`head_valve_hardware.md`](head_valve_hardware.md#wire-16-is-the-shared-coil-common--and-it-is-earthed).

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

## 7. BBIA-1 plane key discipline — found by the § 5 consolidation, 2026-08-17

Consolidating the plane per [`../INTERFACE_ARCHITECTURE.md`](../INTERFACE_ARCHITECTURE.md)
§ 5 meant, for the first time, cross-checking the authority CSV's BBIA end against the
**immutable OEM pinout** [`bbia1_cn_pinouts.csv`](bbia1_cn_pinouts.csv) rather than only
against the curated [`bbia1_source_dest.csv`](bbia1_source_dest.csv). The join had never
read the OEM reference. Four things fell out. **None is resolved here** — all four are
documentation-vs-documentation, and this session could not meter anything.

### 7.1 A wire number identifies a SEGMENT, not a conductor — the key premise is wrong

`INTERFACE_ARCHITECTURE.md` § 2 called the factory wire number "the stable primary key,"
and § 5 asked the validator to enforce "that wire numbers are unique." **Both are wrong
for this machine**, for a stronger and more general reason than a single collision:

**1. The OEM renumbers a conductor at every relay/contact stage.**
[`bbia1_cn_pinouts.md`](bbia1_cn_pinouts.md) (CN11-SSR note) documents that the SSR
board's connector mirrors terminal-unit CN11 pin-for-pin with the wire number shifted
**+500** (pin 9: `262`→`762`, pin 11: `235`→`735`, pin 14: `227`→`727`), pins 15–16 at
**+600**, and pins 3–4 unshifted. The same pattern appears elsewhere — `GEAR_HI_SOL`'s
BBIA-1 wire `712` **becomes `412` at the solenoid**. One physical run therefore carries
several numbers along its length. The number names a *segment between two terminations*,
which is exactly what a wire number is for in a 1984 Mazak print.

**2. The pinout is full of legitimate duplicates.** `bbia1_cn_pinouts.csv` carries **26
distinct duplicated `Wire_No` values across 75 rows**, 11 of them purely numeric
(`147`, `218`, `231`, `235`, `236`, `238`, `362`, `381`, `382`, `710`, `712`). Several
pair unmistakably unrelated functions:

| Wire | One place | The other |
|---|---|---|
| `147` | `CN3-2` HEAD LUBE PRESSURE (lube) | `CN3-39` OIL TEMP DETECTOR (alarm) |
| `381` | `CN2-13` LUBE TIMER (lube) | `CN6-37` MAGAZINE OIL TOOL DETECTOR (ATC) |
| `382` | `CN2-42` SPINDLE TOOL CLAMP OK (spindle) | `CN6-50` MAGAZINE SPINDLE TOOL DETECTOR (ATC) |
| `231` | `CN4-1` SPINDLE ZERO SPEED (spindle sense) | `CN11-13` FLOOD COOLANT (PLC output) |

**Controlling position:** `factory_wire` is an excellent **label and lookup key** — it is
what gets stamped on the ferrule and what you read at the cut — and a **bad primary key**.
The join keys on `signal_id`; the validator treats a duplicate as a WARN against an
explicit allowlist (`OEM_REUSED_WIRES` in
[`../scripts/validate_authority.py`](../scripts/validate_authority.py)), never an error.
**Do not "de-duplicate" any of these by editing a row.**

Only `231` currently trips the check, because the validator compares the **44 authority
plane rows** against each other — the other duplicated numbers sit on pins the retrofit
has not claimed. Expect more to surface as more of the plane is populated; add them to
the allowlist with a citation rather than editing data.

#### Residual — the `CN4-1` half of wire 231 is NOT settled

The `CN11-13` half is well corroborated: the SSR board carries `731` at its own CN11-13,
exactly the +500 pattern, read at 400 DPI from dwg 4143175309 p78.

The `CN4-1` half is **contested by the OEM print itself.** The authority's own history
(`SPINDLE_ZERO_SPEED` `cleanup_notes`) records:

> `[LOCATED 2026-08-08: X01 SZS.M wire 143 T.U CN3-4, Dwg 4143075407 pg133]` →
> `[PINOUT-RECONCILED 2026-08-09: BBIA-1 board = wire 231, CN4-1 … supersedes the pg133
> 'wire 143 / CN3-4' LOCATED note.]`

and `bbia1_cn_pinouts.csv` **independently carries `CN3-4 = 143, ZERO SPEED, spindle`** —
a second, differently-numbered zero-speed row that was never explained away. The 08-09
reconciliation was a documentation preference (its stated basis, the FR-SX `CON1`→`CN4`
reading, is itself flagged "digits verify" in the same note), **not a field trace**, and
the two files recording it cite different pages (`pg133` in the authority, "trusted over
pg135" in `bbia1_source_dest.csv:14`).

Nor is the pinout transcription above suspicion: commit `d45bc97` already fixed a
CN11-SSR data bug, and `bbia1_cn_pinouts.md` warns that CN11 pins 1–2 and 8–18 "were
wrong, apparently misread from the dense handwritten pin table."

**Status: OPEN — field trace required.** Read the number printed on the jacket at
**BBIA-1 `CN4` pin 1** and at **`CN3` pin 4**. That settles both whether `231` is
genuinely reused and which of `143`/`231` is the zero-speed conductor. It is a label
read, no meter needed, and it costs nothing once the cabinet is open. Until then this
section documents a *disagreement*, not a resolved reuse.

### 7.2 Two "2nd over-travel" limits collide with the terminal-unit pinout

`bbia1_source_dest.csv` places two second-stage over-travel limits on CN3 pins that the
terminal-unit pinout assigns to entirely different devices:

| Signal | Pin | `source_dest` says (dwg 4143075409 pg135) | `bbia1_cn_pinouts.csv` says |
|---|---|---|---|
| `ATC_ZONE_Y` | `CN3-44` | `+LY2`, 2nd +Y OVER TRAVEL, PRS-55 | `SPTD`, **SPINDLE TIMER** |
| `ATC_ZONE_Z` | `CN3-39` | `-LZ2`, 2nd −Z OVER TRAVEL, PRS-66 | `147`, **OIL TEMP DETECTOR** |

Both `source_dest` entries are marked `RESOLVED 2026-08-10` and cite the drawing
explicitly, so this is not a low-confidence guess on either side — it is two OEM sources
disagreeing.

Context that matters: the *first-stage* limits sit two rows away and are undisputed —
`CN3-37` = `+LY` (+Y over travel) and `CN3-38` = `−LZ` (−Z over travel), which
`INTERFACE_ARCHITECTURE.md` § 3b item 4 already names as the only two confirmed on the
plane. Precedent in this repo settles the *easier* version of this question but not this
one. At `CN2-13` (`MAG_TOOL_AVAILABLE`) the two sources agree on the wire number `381`
and disagree only on the printed **label** — the board sheet says `LUBE TIMER`, pg135
says `TOOL DETECTOR (PHS-181)` — and the wire number was trusted over the label
(`io-dashboard/data.js` provenance, 2026-08-10). `SPINDLE_ZERO_SPEED` likewise resolved
by trusting the board pinout over pg135 where the two could be reconciled.

**§ 7.2 is harder than either:** here the *wire numbers themselves* disagree, so there is
no agreed key to fall back on. Nothing in the repo breaks the tie.

**A third possibility that must be excluded before either source is called wrong:** the
two may not be describing the same physical pin. BBIA-1 is a top (`CND`, NC-side) /
bottom (`CN`, machine-side) pass-through, and **the connector index is not preserved
across it** — `bbia1_source_dest.csv` records `CND3-39` → `CN6-39`, `CN8-3` → `CN1-3`,
and `CN8-1`/`-2`/`-4` → `CN1-1`/`-2`/`-4`. The `ATC_ZONE_*` rows assume `CN3-nn` →
`CN3-nn`. Compounding it, only **24 of CN3's 50 pins are transcribed** in the OEM
pinout, so a `−LZ2` / `+LY2` landing on an untranscribed CN3 pin is entirely possible —
in which case both sources are right about different pins and neither is in error.
(This same false premise was live in `consolidate_bbia_authority.py`, whose `CND`→`CN`
normalisation asserted "CNDx pin == CNx pin"; corrected 2026-08-17.)

Note also what these rows *are*: both are modelled as **ATC tool-change-zone prox
interlocks** (`PRS-55` / `PRS-66`), not as limit inputs, and
`io-dashboard/tools/enrichment.py:292-293` flags each with "Switch may not physically
exist — confirm." So there is a fourth possibility: the devices are absent and both rows
retire. The second-stage limits are **not** in `INTERFACE_ARCHITECTURE.md` § 3's
exception list (§ 3b item 4 covers only the four primary limits) — they would move there
only if the pinout wins the buzz test.

**Look for the switches before buzzing the pins.** If `PRS-55` and `PRS-66` are not
fitted, the paper conflict is moot and both rows become `NOT_USED`, the way
`MIST_COOLANT` was handled.

Note also the scope limit this exposes: the validator's OEM cross-check compares wire
numbers only, so a `CN2-13`-style label mismatch passes silently by design. The wire
number is the key; the printed signal name is known-fallible.

**Hazard if wrong:** landing an over-travel limit input on the spindle timer or the oil
temp detector conductor. Both rows are inputs, so the failure is a limit that never trips
rather than an unexpected output — but a limit that never trips is exactly the failure
you do not want to find by driving into a stop.

**Controlling position: UNRESOLVED.** Both rows keep their `source_dest` values in the
authority and are registered in `KNOWN_PLANE_CONFLICTS`, so the validator acknowledges
them instead of warning every run. **Do not land either conductor on a Mesa input until
the pin is buzzed at CN3.**

*Resolution test:* continuity from CN3-39 and CN3-44 to PRS-66 / PRS-55 respectively;
if either instead rings out to the oil-temp sender or the spindle timer, the pinout wins
and the two rows move to the § 3 exception list as unlocated.

### 7.3 `CN2-14` → `Z_LIMIT_PLUS` is CONTESTED — and it is already on a printed label

[`bbia1_retrofit_destination_crosswalk.csv`](bbia1_retrofit_destination_crosswalk.csv)
maps `CN2-14` → `Z_LIMIT_PLUS`. `bbia1_source_dest.csv:66` instead records
`Z_LIMIT_PLUS` as **NOT INDIVIDUALLY LOCATED** (2026-08-10, dwg 4143075410 pg136 —
"+Z OVER TRAVEL (`*+LZ`) with NO connector-box label on the T.U. row. Needs field
trace"), and `INTERFACE_ARCHITECTURE.md` § 3b item 4 lists +Z among the four unlocated
limits.

**This is a § 7.2-type conflict, not a supersession.** An earlier draft of this section
called the crosswalk row "stale" and a "retracted inference." That was wrong on both
counts and is corrected here:

- **Nothing was ever retracted.** `docs/superseded_claims_2026-08-06.md` contains no
  entry for `CN2-14`, `+LTZ`, or `Z_LIMIT_PLUS`.
- **The crosswalk row is not a bare name match.** The immutable OEM reference
  independently carries it — `bbia1_cn_pinouts.csv:28` =
  `CN2,MR-50RMW,14,+LTZ,Z-AXIS OVER TRAVEL,limit,CNB-12,CA4-L` — and
  `INTERFACE_ARCHITECTURE.md` § 2/§ 4 make *that file* controlling for the
  machine-internal side. The 2026-08-10 note is an argument from silence on one sheet
  and never mentions `CN2-14` or the board pinout at all.

**A third reading is the strongest reason not to bind this pin, and neither source
states it:** `bbia1_cn_pinouts.csv:120` records `CN6-12` = `+LYZ`, "**+YZ OVER
TRAVEL**", with `Inside_Connec` = `CN2-14` (paired with `:121` `CN6-13` = `-LYZ`). If
that is right, `CN2-14` is a **combined +Y/+Z over-travel bus** and `+LTZ` is a `Y`/`T`
transcription slip of `+LYZ` — in which case it is not a per-axis +Z input under *any*
reading. This is a lead, not proof: the `Inside_Connec` column is demonstrably fallible
(`CN6-13` points at `CN1-5`, which the same file gives as wire `232` "2nd-S LEVEL",
a coolant-level signal), and `CN2-14`'s own `Inside_Connec` reads `CNB-12`, not `CN6-12`.

**⚠️ The dispute is already materialized onto a physical label.**
`scripts/generate_label_csvs.py` builds the Epson ferrule set *from the crosswalk*, so
`wiring/labels/bbia1_mesa_end_ferrules_epson.csv` carries
`B-TB3-05, +LTZ, CN2-14, Z-AXIS OVER TRAVEL → 7i84U-B TB3 IN4`. Keeping the row out of
the authority CSV does **not** keep it off a ferrule. It previously carried the blanket
`HOLD_SOURCE_TRACE` that every crosswalk row gets, making it indistinguishable from the
13 corroborated ones. **Fixed 2026-08-17:** `DISPUTED_CROSSWALK_PINS` in the generator
now releases it as **`HOLD_DISPUTED_PIN`**, so the dispute survives onto the label.

**Controlling position: UNRESOLVED.** The authority CSV keeps `Z_LIMIT_PLUS`'s BBIA end
blank — correct, but because the pin is contested, not because the crosswalk is stale.

*Status of the file:* 13 of its **14 data rows** are redundant with the authority; the
14th is this one. It is **not** deleted in this pass — deleting it would destroy the only
record of a claim still worth testing at the cabinet, and would silently drop the ferrule
row. Retire it once the field trace lands.

*Resolution test:* with the machine de-energized and a human at the cabinet, buzz
`CN2-14` for continuity to the +Z over-travel limit switch, and separately to `CN6-12`.
Continuity to *both* the +Y and +Z limits confirms the combined-bus reading.

### 7.4 Two plane rows bypass the curated provenance chain

`AIR_BLAST` (`CN11-6`, wire `215`) and `WORK_AIR_BLAST` (`CN11-7`, wire `216`) carry a
BBIA end in the authority but appear nowhere in `bbia1_source_dest.csv` (as does
`WORK_LIGHT`, OEM CN6-8 wire `WL` — the validator's provenance line reports all three), so
`consolidate_bbia_authority.py` neither maintains nor contradicts them. Both **exactly
match** the OEM pinout, so the data is corroborated by the higher authority for the
machine-internal side; only the provenance chain has a hole. They correspond to the
"Recommended action (owner decision — not applied)" in § 5 of this register having been
partly reflected into the CSV.

The validator reports these by name each run (`Plane provenance:` line) rather than
warning. No change is proposed: adding them to `source_dest` would mean writing a
`source_provenance` string this session cannot honestly source.

*Also noted, benign:* three `source_dest` rows land on BBIA-1 with no authority row —
`Y_DRIVE_FAULT` and `Z_DRIVE_FAULT` (both merged into the single combined `SER` line at
`CN6-27` by owner decision 2026-08-11, retained for provenance) and `TOUCH_SENSOR_BLAST`
(§ 5 recommends `NOT_USED`/`RESERVED`; the device may not exist on this machine). All
three are deliberate, not dropped rows.

### 7.5 The 2026-08-10 pinout transcription had a systematic misread layer — RESOLVED 2026-09-02 (owner approved)

The 2026-09-02 multi-agent wiring audit re-read 41434WB p84/p85 (dwgs
4143075321/4143075322) at 280–1000 DPI with three mutually independent readers
(plane-A, terminal-unit, and head-device agents), corroborated by the repo's own
earlier `docs/photo_survey_misc.md` transcription of the same sheets. Findings,
all landed in `bbia1_cn_pinouts.csv`, the authority CSV, and the regenerated
crosswalks/labels/diagrams:

- **7→2 digit misreads (CN11 family):** the T.U.-side "2NN" wires are the same
  7NN/8NN numbers as the SSR side — one cable, same numbers both ends. The
  "+500/+600 shift" narrative in §7.1 item 1 is RETIRED. Only CN11-15's digit
  (736 on p85 vs 836 on p140/p78) awaits a jacket read.
- **§7.1 "wire 231 reuse" DISSOLVED:** CN11-13 is 731; CN4-1 is `ZS1` (drive
  contact into relay 1246; wire 143/CN3-4 is that relay's contact into X01).
  Both zero-speed circuits are real, different stages.
- **§7.2 DISSOLVED as a citation defect:** pg135 puts +LY2/PRS-55 at CN2-14
  (relay 1237/PYOT) and -LZ2/PRS-66 at CN1-5 (relay 1240/NZOT) — the
  `source_dest` rows misquoted it as CN3-44/CN3-39. CN3-44 = SPTD spindle tool
  detector (X5B SPTDPRS); CN3-39 = 147 tool detector (X05 MGTDPRS). ATC_ZONE_Y/Z
  BBIA landings cleared (DEFERRED); bench tap points to be chosen at the cabinet.
- **§7.3 refined:** CN2-14 is the 2nd +Y over-travel (+LY2), not `+LTZ`/Z-axis
  and not a +YZ bus; `Z_LIMIT_PLUS` is genuinely unlocated; ferrule B-TB3-05
  stays held with wrong text pending relabel.
- **HAL-bound identity corrections (owner approved 2026-09-02):** SERVO_FAULT
  (CN6-27 is SFR — source unlocated, re-derive at the HD amps), COOLANT_LOW
  (CN1-5 is -LZ2 — source unlocated), DOOR_INTERLOCK (wire 341, not 238),
  MAG_BCD_BIT0-4 + MAG_IN_POS (block de-shifted to CN2-5..9 + CN2-10/213),
  SPINDLE_ORIENT_ARRIVAL (ORA1/ORA2, not SETA/SETB).
- Validator allowlists `OEM_REUSED_WIRES` and `KNOWN_PLANE_CONFLICTS` emptied
  accordingly.

Closing bench items: CN11 ferrule read (settles pin 15's 736/836), CN2-14/CN1-5
jacket read + buzz to PRS-55/PRS-66, CN6-27 label read, magazine-block buzz-out
(PB-32 → CN2-4, PRS-21 → CN2-5, MIPRS → CN2-10), and the CN4-1/CN3-4 jacket read.

## Evidence documents

- `connector_crossref.md` — OEM drawing/photo cross-reference.
- `bbia1_terminal_unit.md` — BBIA-1 interconnect architecture note.
- `bbia1_continuity_trace_worksheet.csv` — field continuity worksheet; all rows remain unverified.
- `../mesa/current_pin_authority.csv` — planning authority with blocked conflicts.
