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
> sheets) or field tracing per D5.

## E-stop conductor path (as-drawn)

| Stage | Signal | Location | Source sheet |
|---|---|---|---|
| Pushbutton | **EMB – EMC** (E-stop PB, **PB-3B**, Operating Panel; part AH25-P182A) | Operating panel | PDF p090, dwg **4143075301** (Front Side View Components Layout) |
| MS connector | **EMB → CA4 pin `a`**, **EMC → CA4 pin `b`** (CA4 = MS3102A 28-21S) | Connector fan-out | PDF p087, dwg **4143075324** (Detail Diagram — MS Connector Connection) |
| Terminal unit | **EHB / EMB / EMC** on **CN2-40, CN3-1, CN5-4 / CN5-43 / CN5-44** | BBIA1 terminal unit | already in [`bbia1_cn_pinouts.csv`](bbia1_cn_pinouts.md) (prior extraction) |
| Destination | **Into the hardwired safety chain — NOT a Mesa input** | new safety relay | design rule already recorded in `bbia1_cn_pinouts.md:283` |

Adjacent on CA4 (same connector, for context): `*DECX` → pin `c`, `*DECY` → pin
`d` (axis decel-limit inputs, active-low).

## Related PLC element (not the hardwired circuit)

- PLC timer **`T.C.0 = ESPT`** (Emergency-Stop Timer) — PDF p060, dwg 4143075160
  (Timer/Counter table). This is the *software* E-stop timer in the Mazatrol
  ladder (see also `X000 #ESP.M` in the element list); it does not replace the
  hardwired contactor drop.

## Bonus finding (answers an open servo-doc question)

While reading p090 (dwg 4143075301): the **spindle rotary encoder** is a
**`MS3108B 20-29P`** connector, pin/line map **A=PA, B=SC, C=PE, H=PSH, K=OH,
N=PA, P=SC, R=PB**. This is the connector `servo_amp_analysis.md §1.5 / §3.5`
flags as "spindle encoder location TBD in the 7i80HDT stack" — the OEM device is
identified; the Mesa-side landing terminal still needs assigning in
`current_pin_authority.csv`.

## What's still needed

1. **Locate the hardwired E-stop control circuit** (main magnetic contactor
   drop + servo-ready gating). Recommended: manual scan of the power/magnetics
   schematic sheets (the transformer sheet is ~PDF p032, dwg region 4143075xxx),
   or resolve by field-tracing the cabinet per **D5** (as-built hardwired safety
   schematic). This is the authoritative path anyway — the OEM drawings predate
   this machine's M-2 upgrade and must be confirmed against the cabinet.
2. **Assign the spindle-encoder landing** on the Mesa stack in the pin authority.

_This doc records schematic-derived wiring evidence only; it is not a
commissioning permit. Every conductor/normal-state must be field-verified before
it feeds the retrofit safety chain._
