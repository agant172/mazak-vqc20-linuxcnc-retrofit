# Door & axis interlock ladder logic — transcribed from YM2V39L

> **ROLE: BACKGROUND** — the door input is netted raw; the AL55 and axis-interlock logic here is not implemented in retrofit code. Kept at this path because `mesa/current_pin_authority.csv` cites it. See [../../INSTALL_SPINE.md](../../INSTALL_SPINE.md).


**Machine:** Mazak VQC-20/40 SN 060231 (Mazatrol M-2)
**Source:** `YM2V39L.pdf` / `VQC20-40_060231_Ladder_Diagrams.pdf`, drawing 4136081801, 94 sheets.
**Extracted:** 2026-08-10. Numbering: cross-ref `SSLL` = sheet·line; PDF page = sheet + 1.
Complements `estop_ladder_transcription.md` (both feed the D5 safety chain).

## Signals (from the element list)

| Addr | Symbol | Meaning | cross-ref |
|---|---|---|---|
| X01C | MDINT.M | MACHINE DOOR INTERLOCK **LS** (limit switch) | #5701 |
| X01D | ITMDSS.M | MACHINE DOOR INTERLOCK **SS** (safety switch) | #5701 |
| X030 / X080 | INTX.M | X-axis interlock inputs | #4302 |
| X031 / X081 | INTY.M | Y-axis interlock inputs | #4303 |
| X032 / X082 | INTZ.M | Z-axis interlock inputs | #4304 |
| Y100/101/102 | ITX.N/ITY.N/ITZ.N | per-axis interlock N/C outputs | 4302/4303/4304 |

## Door interlock — sheet 57, line 1 (rung 5701, PDF p58)

**`AL55` MACHINE DOOR INTERLOCK** (HOC6.7 → F55):
`MDINT.M`(X01C, NC) · `ITMDSS.M`(X01D, NC) · `AUT.M`(Y070, auto mode) → **AL55**.
Cross-refs 2205 #2608 #2701 5701 6201 6302.

**Reading:** in **AUTO mode**, if the two door-interlock channels (LS + SS) indicate
the door is **open**, raise alarm **AL55**, which halts the machine. Dual-channel
door monitoring (a limit switch *and* a safety switch). This is the PLC side; a
**hardwired door lock** is separate (and, per the door-lock mechanism, motion/ATC
are also physically gated).

_Sheet 57 is the machine **alarm sheet** (AL55-AL65): also head-lube (AL56/5702),
main-transformer overheat (AL57/5703), external-control (AL60/5704), MMS
(AL65/5706), spindle-stop (ALSSP/5707), mag-cover (ALMGC/5709). Good reference
for the retrofit fault list._

## Axis interlocks — sheet 43, lines 2-4 (rungs 4302/4303/4304, PDF p44)

**`ITX.N` X-AXIS INTERLOCK N/C** (Y100, H100.0), rung 4302:
Parallel OR branches — any one drives **ITX.N**:
`[SSET.M(Y092, NC) · AL57(F57, NO)] ‖ [INTX.M(X080, NC) · INTX.M(X030, NC) ·
ADDIS(M428, NO)] ‖ [TBRS(M426, NO) · AEXT.N(Y16C, NO) · AUT.M(Y070, NC)] ‖
RCTIT(M107) ‖ MOP10(M148)` → **ITX.N**. `ITY.N`(Y101, rung 4303) is the same
minus the TBRS branch. `ITZ.N`(Y102, rung 4304) also lacks the TBRS branch and
swaps the input pair for an MPCS-selected block: `ADDIS · [MPCS(NC) ·
(INTZ.M X082 NO ‖ INTZ.M X032 NO) ‖ MPCS(NO) · INTZ.M(X082, NC) ·
INTZ.M(X032, NC)]`.

**Reading:** ITX/Y/Z.N is an OR of independent assert conditions, not a series
gate: it turns ON when the spindle is **not** set while the transformer-overheat
alarm AL57 **is** active, or when the axis's external interlock inputs (X030-032 /
X080-082, NC contacts) are **inactive** with ADDIS true, or via RCTIT / MOP10 (X
adds a measuring-arm-extended · not-auto branch). Whether an energized ITx.N
*inhibits* or *permits* the axis at the NC interface is not determinable from the
ladder alone ("N/C" in the element list appears to mean "to NC") — verify before
using in HAL. Field devices on X030-032 / X080-082 are unidentified.

## Retrofit implications (LinuxCNC / Mesa)

1. **Door interlock → reproduce AL55 in HAL:** the door LS (`MDINT.M`) + SS
   (`ITMDSS.M`) should, in **auto/MDI motion**, inhibit motion (feed-hold or
   estop-class) when the door is open — dual-channel. Confirm whether these two
   inputs are wired to the 7i84U in `current_pin_authority.csv`; if the retrofit
   keeps the hardwired door lock, HAL provides the *monitoring/inhibit*, not the
   primary interlock (consistent with the E-stop safety framing).
2. **Axis interlocks:** the external `INTX/Y/Z.M` inputs (X030-032 / X080-082) are
   candidate fixture/guard interlocks — verify which (if any) are used on this
   machine before allocating pins (the 2PC pallet interlocks are out of scope).
   Note the `ITX/Y/Z.N` rungs are OR structures whose SSET.M(NC)·AL57(NO) branch
   asserts on drive-not-set + transformer-overheat — they are **not** a series
   drive-arm/thermal-OK gate. Do not carry a "motion gated by drive-arm +
   thermal-OK" pattern into the HAL enable chain from this rung; take the enable
   chain from the E-stop/safety-chain docs instead.
3. This ladder is **monitoring/sequencing**; the hardwired door lock + safety
   chain (D5) remain primary. See `estop_ladder_transcription.md`,
   `estop_safety_chain.md`.

## Rung → PDF-page map

| Rung | Sheet·line | PDF page | Content |
|---|---|---|---|
| 5701 | 57·01 | p58 | AL55 door interlock (+ AL56-65 alarm group on the sheet) |
| 4302 | 43·02 | p44 | ITX.N X-axis interlock |
| 4303 | 43·03 | p44 | ITY.N Y-axis interlock |
| 4304 | 43·04 | p44 | ITZ.N Z-axis interlock |
