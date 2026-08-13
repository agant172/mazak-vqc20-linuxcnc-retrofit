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
> are still required before energizing — the placard settles identity, not wiring. `gear-lo-sol` bound to 7i84U-A OUT8 in HAL 2026-08-09. Coil voltage/current measurement and RLY-1/RLY-2 fitting still required before energizing. Original conservative record kept below for provenance.

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

### Where the tangle probably is

Two element-list rows are involved and may have been crossed when the CSV was
populated:

- `Y035 A-JET.M` **AIR JET** → currently `TOUCH_SENSOR_BLAST`, noted "verify SOL-35"
- `Y016 TAPC.M` **TAP COOLANT** → currently `TAP_COOLANT_BLAST`, mapped to `SOL-61`

If the placard is right that `SOL-61` **is** the air jet, then `Y035 A-JET.M`
belongs with `SOL-61`, and whatever solenoid serves tap coolant is a *different*
tag not shown on this placard. Note `TAPC` is separately established as
**"TAP COOLANT"** on CN6-18 (`bbia1_cn_pinouts.csv:123`). **This is a hypothesis,
not a finding — do not act on it.**

### Controlling position

**Unresolved.** The placard is an OEM, machine-mounted source and agrees with
two other repo sources on the tag→function map, which is strong. But it carries
no wire numbers, and it only covers **head-mounted** devices — so it cannot by
itself prove `SOL-62` does not exist elsewhere on the machine, nor which
solenoid a given Mesa output should drive.

### Resolution test

1. Re-read OEM dwg **pg 90** and the parts list **pp. 85–91** for `SOL-15`,
   `SOL-61`, `SOL-62` and their wire numbers; confirm whether `SOL-62` exists at
   all and, if so, where.
2. Trace wire **261** (CN11-10, "AIR JET") to the physical solenoid and read its
   tag off the body.
3. Trace the spindle-air-blast conductor (wire 415 per `connector_crossref.md`)
   and read that solenoid's tag.
4. Photograph each solenoid body tag on the head — the placard gives their
   positions, so this is a quick pass.

### Status

`AIR_BLAST`, `TOUCH_SENSOR_BLAST`, and `TAP_COOLANT_BLAST` remain
`FACTORY_INTERFACE` **unchanged** — no binding, `hal_net`, or status was altered
on the strength of the placard. Each row carries a pointer to this section.
**Recommendation (owner decision):** move all three to `HOLD_CONFLICT` until
step 1–4 resolve them, matching how §1/§3 handled contested identities. Do not
wire RLY-5/6/7 before then.

## Evidence documents

- `connector_crossref.md` — OEM drawing/photo cross-reference.
- `bbia1_terminal_unit.md` — BBIA-1 interconnect architecture note.
- `bbia1_continuity_trace_worksheet.csv` — field continuity worksheet; all rows remain unverified.
- `../mesa/current_pin_authority.csv` — planning authority with blocked conflicts.
