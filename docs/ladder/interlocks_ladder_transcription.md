# Door & axis interlock ladder logic — transcribed from YM2V39L

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
`SSET.M`(Y092, drive-arm) · `AL57`(F57, transformer-overheat) — both **NC** — in
series with the interlock branch `[INTX.M(X080/X030) · ADDIS ‖ (TBRS·AEXT.N·AUT.M)
‖ RCTIT ‖ MOP10]` → **ITX.N**. `ITY.N`(Y101, rung 4303) and `ITZ.N`(Y102, rung
4304, adds MPCS pallet term) mirror it for Y/Z.

**Reading:** the per-axis interlock output is **gated by `SSET.M` (spindle/drive
set) and `AL57` (main-transformer OK)** — so the interlock **drops (inhibits the
axis) if the drive isn't armed, the transformer overheats, or the axis's external
interlock input (X030-032 / X080-082) is active.** These external interlock inputs
are likely fixture/pallet/guard interlocks.

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
   The `ITX/Y/Z.N` outputs' dependence on `SSET.M` + `AL57` re-confirms the pattern
   that **motion is gated by drive-arm and a transformer-thermal-OK** — worth
   carrying into the HAL enable chain.
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
