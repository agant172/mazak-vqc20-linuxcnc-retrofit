# Authority Conflicts — VQC-20/40 Retrofit

**Status:** DOCUMENTATION REVIEW RESOLVED — physical commissioning verification remains pending.

This register reconciles the RC3A connector cross-reference with the current Mesa pin authority. The documentation conflicts have been reviewed and handled conservatively: contradictory outputs remain blocked until cabinet tracing confirms the final wiring. Do not energize affected outputs based on this document alone.

## 1. Gear-shift solenoids

**RESOLVED 2026-08-08 (see CSV GEAR_HI_SOL / GEAR_LO_SOL):** pg100 TB-51 (Dwg 4143075338) confirms wire 412 → SOL-12 → GEAR SHIFT HIGH and wire 413 → SOL-13 → GEAR SHIFT LOW; physical double-check complete. `gear-lo-sol` bound to 7i84U-A OUT8 in HAL 2026-08-09. Coil voltage/current measurement and RLY-1/RLY-2 fitting still required before energizing. Original conservative record kept below for provenance.

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
- **Controlling position:** the **TGF-3D P402-Sx is an axis device**; that is
  supported by three independent repo sources plus a drawing citation, against
  one loosely transcribed legend. §1.5 has been corrected to stop asserting a
  spindle tacho, and now points here.
- **Resolution test:**
  1. Re-read dwg **4143175310 p079** at 300 DPI and transcribe the
     feedback-device legend exactly — including any part number attached to the
     "spindle tacho gen" entry.
  2. If a spindle tacho is genuinely drawn, look for its input on the FR-SX
     terminal/connector set and photograph the device on the machine.
  3. If p079 shows no such device, or the legend turns out to be generic
     boilerplate, delete the claim from `electrical_diagram_index.md` p079 and
     close this section.
- **Do not** add a spindle-tacho row to `current_pin_authority.csv` on the
  strength of the legend line alone.

## Evidence documents

- `connector_crossref.md` — OEM drawing/photo cross-reference.
- `bbia1_terminal_unit.md` — BBIA-1 interconnect architecture note.
- `bbia1_continuity_trace_worksheet.csv` — field continuity worksheet; all rows remain unverified.
- `../mesa/current_pin_authority.csv` — planning authority with blocked conflicts.
