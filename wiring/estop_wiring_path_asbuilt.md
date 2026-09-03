# E-stop wiring path — extracted from the 41434WB electrical diagrams

**Machine:** Mazak VQC-20/40 SN 060231 (Mazatrol M-2)
**Source:** `Manuals_SN060231/VQC20-40_060231_Electrical_Diagrams.pdf` (pub. 41434WB, 6/1984)
**Extracted:** 2026-08-09, from the sheets cited below (300 DPI reads).

## BLUF — what this pass did and did NOT capture

✅ **Captured: the E-stop conductor path** from the pushbutton through the MS
connectors to the terminal unit — end-to-end wire routing.
❌ **NOT captured: the hardwired E-stop *control circuit*** (how the E-stop
contacts drop the main magnetic contactor / gate the servo-ready chain). The
sheets in the p060–p090 region are **connector, component-layout, and
PLC-element reference drawings — not the relay/contactor sequence circuit.** The
contactor-drop sheet was not located this pass; see [What's still needed](#whats-still-needed).

> **Note on method:** the electrical set has no sheet index, and OCR of these
> hand-annotated scans is too noisy to reliably locate a specific circuit — every
> OCR "title" lead in this pass was mislabeled. Locating the contactor circuit
> needs either a manual scan of the power/magnetics section (early schematic
> sheets); the former D5 field-trace path is withdrawn (owner decision 2026-08-15).

## E-stop conductor path (as-drawn)

| Stage | Signal | Location | Source sheet |
|---|---|---|---|
| Pushbutton | **EMB – EMC** (E-stop PB, **PB-3B**, Operating Panel; part AH25-P182A per `io_map_research_notes.md` — not printed on this sheet) | Operating panel | PDF p090, dwg **4143075301** (Front Side View Components Layout (2)) |
| MS connector | **EMB → CA4 pin `a`**, **EMC → CA4 pin `b`** (CA4 = MS3102A 28-21S) | Connector fan-out | PDF p087, dwg **4143075324** (Detail Diagram — MS Connector Connection) |
| Terminal unit | **EMB / EMC** on **CN2-40 / CN2-41** (→ CA4 a/b), cross-connected inside the T.U. to **CN5-4 / CN5-5** (relay-card side; CN5-5 leaves as wire **57**). Chain status to the NC is **\*ESP** on **CN3-1** → CND1-3 (→ X000) | BBIA1 terminal unit | 41434WB p084 dwg 4143075321 (CN2/CN3) + p085 dwg 4143075322 (CN5), 300 DPI re-read 2026-09-02 — supersedes the `bbia1_cn_pinouts.csv` EHB / CN5-43 / CN5-44 values, which conflict with the print |
| Destination | **Stays in the OEM hardwired safety chain — NOT a Mesa input** (E-stop is 100% OEM, owner decision 2026-08-15; no new safety relay is fitted) | OEM chain | design rule recorded in `bbia1_cn_pinouts.md` (harvest-checklist item 5) |

Adjacent on CA4 (same connector, for context): `*DECX` → pin `c`, `*DECY` → pin
`d` (axis decel-limit inputs, active-low).

## Related PLC element (not the hardwired circuit)

- PLC timer **`T.C.0 = ESPT`** (Emergency-Stop Timer) — PDF p060, dwg 4143075160
  (Timer/Counter table). This is the *software* E-stop timer in the Mazatrol
  ladder (see also `X000 #ESP.M` in the element list); it does not replace the
  hardwired contactor drop.

## Bonus finding (answers an open servo-doc question)

While reading p090 (dwg 4143075301): the **spindle rotary encoder** is a
**`MS3108B 20-29P`** connector, pin/line map **A=PA, B=SC, C=PB, H=P5H, K=OH,
N=\*PA, P=\*SC, R=\*PB** (N/P/R drawn overlined — complements of A/B/C;
corroborated by dwg 4143075340, 41434WB p105). This is the connector `servo_amp_analysis.md §1.5 / §3.5`
flags as "spindle encoder location TBD in the 7i80HDT stack" — the OEM connector
is identified; the Mesa-side landing terminal still needs assigning in
`current_pin_authority.csv`.

> **Follow-up 2026-08-12.** Nameplate photos identified a Tamagawa **TS1526N55**
> optical PLG built into the spindle *motor*, on a 9-pin `AMP-350720-1` connector
> — see [`../docs/spindle_motor_plg_encoder.md`](../docs/spindle_motor_plg_encoder.md).
> It shares `PA`/`PB` with the `MS3108B` map above, and that map's `K = OH`
> (overheat) line points at a motor-mounted device, but the remaining pin names
> disagree. **Whether these are one device or two is unresolved** — do not merge
> the records. The 2026-09-02 re-read confirmed N/P/R carry overlines on the print —
> they are the complement lines of A/B/C, not duplicates.

## What's still needed

1. **Locate the hardwired E-stop control circuit** (main magnetic contactor
   drop + servo-ready gating).
   > **Starting point found 2026-08-13.** A cabinet terminal strip carries the
   > safety-chain conductors — the contiguous block `58` · `57B` · `57A` · `57` ·
   > `60` · `EMB` · `MAR`, with `59` further up the same strip — with four `S-A12`
   > motor contactors in the same cabinet. That is a **physical anchor for this trace**, not the circuit
   > itself. Photo inventory only, nothing metered:
   > [`cabinet_asfound_survey.md`](cabinet_asfound_survey.md).
   > **`57B` is a real OEM terminal designation** — confirmed on the marker-strip
   > insert in a sharp re-shoot, reading `58` · `57B` · `57A` · `57` · `60` with
   > the neighbours legible at the same time. It is in `CLAUDE.md`'s
   > preserve list (added with owner approval in the PR that landed the cabinet
   > survey, 2026-08-12).

   **D5 is WITHDRAWN (owner decision 2026-08-15)** — the E-stop system stays
   100% OEM and this repo directs no tracing or verification of it (see
   `../docs/estop_safety_chain.md`). The un-located contactor-drop sheet is
   recorded as a historical gap only. (A manual scan of the power/magnetics
   schematic sheets, ~PDF p032 region, remains a paper-only option.)
2. **Assign the spindle-encoder landing** on the Mesa stack in the pin authority.

_This doc records schematic-derived wiring evidence only; it is not a
commissioning permit. Every conductor/normal-state must be field-verified before
it feeds the retrofit safety chain._
