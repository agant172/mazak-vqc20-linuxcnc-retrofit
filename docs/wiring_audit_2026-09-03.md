# Wiring documentation audit — 2026-09-03

> **ROLE: AUDIT RECORD** — findings of the Fable 5 multi-agent audit of every
> file under `wiring/` against the OEM primary sources (`41434WB.pdf`,
> `413LE02A000.pdf`, the Mesa manuals, and the FR-SX manual), following the
> 2026-09-02 ladder/signal audit (`ladder_signal_audit_2026-09-02.md`).
> Corrections landed in commits `b0c4854`…`3c3fd69`; this file carries the
> summary, the systematic-misread record, and the updated bench list.

## Scorecard

| Domain | Verdict |
|---|---|
| Index/summary layer | 83/86 workbook rows + 16/18 PDF index entries clean; probe deferral landed in 4 files; 2 transcription errors vs the book fixed |
| Head devices | 17/26 verified incl. every §5/§6 resolution; **2NN→7NN wire-misread family found**; SOL-62 = arm extend proven by drawing |
| E-stop as-built | Conductor path print-confirmed end to end; 13 doc defects (EHB phantom, impossible CN5-43/44 pins, stale D5/57B, encoder complements) fixed |
| Plane A crosswalk | All 48 MESA_ROUTE rows read pin-by-pin; **5 HAL-bound OEM identities contradicted by the prints** (see below) |
| Terminal-unit landings | 24/43 sampled claims verified; §7.1–§7.3 shown to rest on transcription errors, not real OEM conflicts |
| Plane B resolver/analog | 42/42 Mesa pin claims verified; channel mapping consistent across crosswalk/authority/HAL/INI; 3 doc fixes only |
| Labels/ferrules | Pipeline healthy; destination crosswalk was one file short of the correction pass (fixed); both HTML sheets were stale builds (regenerated) |
| BBIA-1 pinout (third read) | **The entire correction pass survives independent glyph-level verification**; 66 more cell fixes in untouched material |

## The systematic misread (authority_conflicts.md §7.5)

The 2026-08-10 pinout transcription pass carried a consistent misread layer,
established by three mutually independent Fable readers plus the repo's own
`photo_survey_misc.md`:

- **7→2 digit swaps** (CN11 wires: 213/215/216… are really 713/715/716…) —
  the "+500/+600 T.U.↔SSR wire shift" never existed; one cable, same numbers
  both ends.
- **One-pin shift** in the CN2 magazine block (bits are CN2-5..9, the
  in-position strobe is CN2-10/213; CN2-4/150 is the manual-rotate pushbutton).
- **Mnemonic garbles**: EHB (really EMB / \*ESP), SER (really SFR), SETA/SETB
  (really ORA1/ORA2), +LTZ/+LYZ (really +LY2/−LZ2), ORI C1 (ORC1).
- **Phantom connector families**: CNB/CNQ insides are really CND (NC side).
- Registered conflicts **§7.1, §7.2, and §7.3 all dissolved** — they were
  documentation-vs-misread, not OEM-vs-OEM.

## HAL-bound corrections (owner approved 2026-09-03)

1. **SERVO_FAULT (IN10)** — CN6-27 is SFR SPINDLE FORWARD; no SER pin exists
   on CN6. Landing cleared; the combined-alarm design stands, but the source
   must be re-derived, most likely at the HD81/HD101 amp ALM contacts. *As
   previously bound, the amp-fault input would never have tripped.*
2. **COOLANT_LOW (IN26)** — CN1-5 is the 2nd −Z over-travel (−LZ2). Landing
   cleared; the tank-float conductor is unlocated.
3. **DOOR_INTERLOCK (IN24)** — wire 341 (238 is tool-length-measure decel);
   a second factory door channel (340, CN2-39/CN6-24) is now on record.
4. **MAG_BCD_BIT0-4 + MAG_IN_POS** — block de-shifted; pot decode now reads
   the real position bits and the real MIPRS strobe.
5. **SPINDLE_ORIENT_ARRIVAL (IN4)** — ORA1/ORA2, matching ladder X003.
6. **ATC_ZONE_Y/Z (IN0/IN1)** — landings cleared: the zone switches (PRS-55
   at CN2-14, PRS-66 at CN1-5) feed relay coils PYOT/NZOT with no PLC input;
   CN3-44/CN3-39 are the SPTDPRS/MGTDPRS tool-detector stage. Tap points for
   IN0/IN1 are a bench decision (candidates: the CN2-14/CN1-5 conductors —
   which are ALSO the second-stage over-travels; note p136 shows a TCME
   contact bypassing PYOT "ON ZONE (AT TOOL CHANGE)", the relay-side OTNEG).

## Honest ambiguities (flagged, not resolved)

- **CN11-15 wire**: 736 (p85) vs 836 (p78 + p140). COOLANT_ON's factory wire
  stays blank; the validator's remaining WARN is deliberate.
- **CN2-13/CN6-37 wire**: 381 (p84 + pg135) vs 391 (p85) — same conductor.
- **CN5-13 jacket**: 151 vs DINTCSS (both attested on different sheets).
- **CN6-21 outside**: CN301A-1 vs TB1-1. **CN4-15/17/20** cells annotated.
- **p016 SQ-table** index entry doesn't match the vault PDF copy (blank page).

## Open non-bench items

- The Visio `To`-column card-identity collision (ten TB/pin labels collide
  across 7i84U-A/B) — generator design change, flagged in wiring/README.md.
- `MESAC_Wiring_Crosswalk_VisioImport.csv` has no generator (manual sync).
- ESP1/ESP2 CON1 pin numbers unresolved again (the CTL CON1-27 note misquoted
  its page; CTL is CON1-17).
- Standing from the ladder audit: spindle-at-speed HAL derivation.

## Bench checks added/changed by this audit

(Consolidated with the ladder audit's list on the phone page. De-energized
label reads unless noted.)

1. **CN11 ferrule read** at T.U./SSR ends — confirms the 7NN family
   physically and settles pin 15 (736 vs 836). One flashlight pass.
2. **CN2-14 and CN1-5 jacket read + buzz** to PRS-55/PRS-66 (both should
   ring to the relay card, coils 1237/1240) — retires B-TB3-05 for good and
   informs the IN0/IN1 tap-point decision.
3. **Magazine block buzz-out**: PB-32 → CN2-4, PRS-21 → CN2-5, MIPRS prox →
   CN2-10 — confirms the de-shift before any pot decode is trusted.
4. **CN6-27 label read** (SFR) + find where the real combined servo alarm
   enters — then land IN10 at the HD81/HD101 ALM contacts, never CN6-27.
5. **Locate the coolant tank-float conductor** (CN1-5 is spoken for).
6. **CN2-38/39 jacket read** (341/340) — two door channels; fold into the
   existing door-switch continuity item.
7. **CN2-13/CN6-37 conductor jacket** (381 vs 391) and **CN5-13** (151 vs
   DINTCSS) and **CN6-21 landing** (CN301A-1 vs TB1-1).
8. **CA4 contact-letter spot check** before trusting any old label: 381 →
   CA4-N (not K); \*DECX/\*DECY → CA4-c/d (not T/U).
9. **CN4-1 vs CN3-4 jacket read** (ZS1 drive contact vs wire-143 relay
   stage) — decides which conductor lands IN5; ferrule A-TB3-06 now prints
   HOLD_DISPUTED_PIN.
10. **PS-1 hydraulic pressure switch** ("OPEN BELOW 25 kg/cm²", TB41-351,
    feeds X78 MPWS.M): decide whether HYD_PRESS_OK (IN27) reuses it instead
    of adding the Sanwa SPS-8T-PC-20.
11. Plane B set unchanged and reconfirmed: SE1/SE2 role ohm test to AGA,
    SE3 drain-vs-core, Z case bond CNA5-20, DK-427 pair traces, resolver
    amplitude/phase, index-divisor spot check (expect 5 cycles/rev),
    CNA10 "-4" digit if the load meter is kept.
