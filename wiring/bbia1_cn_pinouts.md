# BBIA-1 CN1–CN6 & CN11 Detailed Pinouts

**Machine:** Mazak VQC-20/40, SN 060231 (Mazatrol M-1)
**Board:** BBIA-1 terminal unit (Mitsubishi BN624A306H01, "YM VQC-20-40/50")
**Source:** `41434WB.pdf` — Terminal-Unit Details, drawings 4143075321 / 4113075022 / 4143015323 (sheets 84–86); confirmed against drawing 4143075304 sheet 04 (terminal-unit layout) and drawing 4143175309 sheet 78 (SSR board, CN11-SSR/CN12).
**See also:** [`bbia1_terminal_unit.md`](bbia1_terminal_unit.md) for the board's role in the Mesa retrofit, [`bbia1_cn_pinouts.csv`](bbia1_cn_pinouts.csv) for the machine-readable pin list.

## "Honda" family in this cabinet

In Mazak/Mitsubishi wiring, "Honda connector" = **Honda Tsushin Kogyo (HTK) MR-series** rectangular connectors — the same D-sub-shaped shells used across Meldas / Fanuc-era Japanese CNCs.

The Electrical Diagrams explicitly call out:

- **Terminal-unit side (chassis, on the M/T controller housing):** `MR-50RMW` and `MR-20RMW` — receptacles with jack-screws
- **Cable side (harness plug):** `MR-50LF` and `MR-20LF`
- Terminal-unit layout page 82 lists the population: **10× MR-50RMW + 9× MR-20RMW**
- The SSR-board copies of CN11/CN12 use `MR20-AMD` (chassis) / `MR20-LFH` (cable) — same 20-pin MR family, different backshell

So the connectors you're cutting off are HTK **MR-50** (50-pin) and **MR-20** (20-pin) shells. Pin numbering runs 1…50 or 1…20 as shown on the shell — no A/B row split.

## Connectors in this labeling batch

| Ref | Shell | Pins used | Function (what leaves the terminal unit) |
|-----|-------|-----------|-------------------------------------------|
| CN1 | MR-20RMW | 20 | Tool clamp / gear / 2nd-S / head lube / Z-axis ZRN dec. / spares — routes to **CA3** (round MS3102A-20-29S) |
| CN2 | MR-50RMW | 50 | Magazine, tool-measure, door interlock, E-stop, ±LTZ, X/Y ZRN dec. — routes to **CA4** (MS3102A-28-21S) |
| CN3 | MR-50RMW | 50 | E-stop, spindle SET/SRN/SRI, orient, way-lube alarm, ±LY, ±LZ, oil-temp, spindle timer — routes to **TB5** (spindle controller) |
| CN4 | MR-20RMW | 20 | Spindle zero-speed, SS2/FA/FC, MS/OS, SET1/SET2, SRN/SRI, orient loop — routes to **CON4/TB5** (spindle controller) |
| CN5 | MR-20RMW | 20 | External trip, RST, over-run EMG, EMG stop, +0G/G24 COM, EFHD, RCTLS, ISP1/2, 4-axis interlock cancel, OSP1/2, +24V — routes to relay card / external |
| CN6 | MR-50RMW | 50 | CYFIN, servo ready, work light, SSET, CTL/OTR, ±LYZ, +24V, TAPC, MMAL, PW1, P24, magazine oil-tool det., spindle-head lube pres., 0G returns, spindle spd/servo err/servo/ready/orient — routes to relay card / CB panel |
| CN11 | MR-20RMW (terminal unit) | 20 | **BBIA-1's own connector.** Magazine CW/CCW, tool unclamp, gear-shift hi/lo, spindle/work air blast, mist coolant, tool-measuring-arm extend, air jet, dust inhale, oil hole, flood coolant, magazine cover close, flood-coolant motor starter, **hydraulic pump/head-lube pump**, 0G — routes onward to **SSR board CN11**, confirmed pin-for-pin (see below) |
| CN11-SSR | MR-20 (SSR bd, MR20-AMD) | 20 | The **SSR board's own** connector (drawing **4143175309**, SSR Board D2W102F-33QB, `41434WB.pdf` p78) — mirrors terminal-unit CN11's 20 functions pin-for-pin, wire numbers shifted (mostly +500/+600, see below) |
| CN12 | MR-20 (SSR bd, MR20-AMD) | 9 populated | The SSR board's **second** connector (same drawing 4143175309/p78) — 2PC/pallet-changer output bank; wire numbers read (722A/722B/724/725A/725B/782A/782B/787A/787B on pins 1-9), **function-per-pin not yet determined** (the sheet's pallet-function key uses a separate 21-33 terminal-strip numbering that hasn't been reconciled to CN12's 1-20 connector-pin numbering) |

**Note on CN11 — RESOLVED 2026-08-10, CORRECTED 2026-08-10.** There really are two things called "CN11" in the drawings:
1. **The BBIA-1 terminal unit's own CN11** — 20 pins, drawing **4113075022, sheet 85** (`41434WB.pdf` p85). This is the actual BBIA-1 connector.
2. **The SSR board's own CN11** — a *different physical connector* that BBIA-1's CN11 routes onward to. Relabeled **`CN11-SSR`** in the CSV/tables here so it can't be confused with #1.

**Correction (same day, while chasing the CN12/NOT-LOCATED signals):** CN11-SSR's pinout was re-read from its actual source page (`41434WB.pdf` p78, drawing **4143175309** — the "SSR Board" sheet with the CN11/CN12 pin tables) at 400 DPI. Two things were wrong in the original transcription:
- **The drawing number was mistranscribed as `4143175307`** (no such drawing exists in the set — p78's title block reads 4143175309). That wrong citation had propagated into `bbia1_terminal_unit.md` and this file.
- **CN11-SSR's wire numbers and function labels for pins 1-2 and 8-18 were wrong**, apparently misread from the dense handwritten pin table. Correcting them against a fresh read shows CN11-SSR mirrors the terminal-unit CN11's 20 functions **pin-for-pin after all** — the earlier "they do NOT line up 1:1" conclusion was itself a symptom of the misread, not a real finding. The wire-number relationship between the two sides is mostly **terminal-unit wire + 500** (e.g. pin 9: 262→762, pin 11: 235→735, pin 14: 227→727) with pins 15-16 at **+600** (236→836, 235→835) and pins 3-4 unshifted (710→710, 712→712) — consistent with a relay/contact stage renumbering the wire on its far side, the same pattern already seen elsewhere (e.g. GEAR_HI_SOL's BBIA-1 wire 712 becomes 412 at the solenoid).

There is also a **third** "CN11" referenced in earlier session notes (an alternate 25-way pallet-changer/coolant loom, dwg 03-81581-02) — narrative only, never independently read from that drawing, and not reconciled against either of the above; treat it as informational unless you confirm that loom is actually present on this machine.

**CN12** was transcribed for the first time this session (previously absent from this file entirely) while tracing `ATC_BARRIER_SOL`/`TAP_COOLANT_BLAST` in `wiring/bbia1_source_dest.csv`. Pin/wire numbers are solid (same clean 400 DPI read as CN11-SSR), but which pin drives which 2PC/pallet function is still open — forcing a guess here risks repeating the CN11-SSR-style error, so it's left unconfirmed pending a dedicated pass.

### BBIA-1 terminal-unit CN11 — full pinout (dwg 4113075022 sheet 85, read 2026-08-10)

| Pin | Wire No. | Signal | Outside connec. |
|----:|----------|--------|------------------|
| 1 | 208B | MAGAZINE CW (REV) | SSR bd CN11-1 |
| 2 | 208A | MAGAZINE CCW (FOR) | SSR bd CN11-2 |
| 3 | 710 | TOOL UNCLAMP | SSR bd CN11-3 |
| 4 | 712 | GEAR SHIFT HIGH | SSR bd CN11-4 |
| 5 | 213 | GEAR SHIFT LOW | SSR bd CN11-5 |
| 6 | 215 | SPINDLE AIR BLAST | SSR bd CN11-6 |
| 7 | 216 | WORK AIR BLAST | SSR bd CN11-7 |
| 8 | 217 | MIST COOLANT | SSR bd CN11-8 |
| 9 | 262 | TOOL MEASURING ARM EXTEND | SSR bd CN11-9 |
| 10 | 261 | AIR JET | SSR bd CN11-10 |
| 11 | 235 | DUST INHALE ELIMINATE | SSR bd CN11-11 |
| 12 | 236 | OIL HOLE | SSR bd CN11-12 |
| 13 | 231 | FLOOD COOLANT | SSR bd CN11-13 |
| 14 | 227 | MAGAZINE COVER CLOSE | SSR bd CN11-14 |
| 15 | 236 | FLOOD COOLANT MOTOR STARTER | SSR bd CN11-15 |
| **16** | **235** | **HYDR. PUMP HEAD LUBE PUMP** | **SSR bd CN11-16** |
| 17 | — | (not used) | — |
| 18 | — | (not used) | — |
| 19 | 0G | DC24V -COM (NC) | SSR bd CN11-19 |
| 20 | 0G | DC24V -COM (NC) | SSR bd CN11-20 |

Read directly from a 400–500 DPI render of PDF p85, verified twice. Wire numbers 235 (pins 11 and 16) and 236 (pins 12 and 15) repeat as shown — that's transcribed faithfully, not a typo, but it's dense handwriting so treat exact digits as **field-verify before cutting**, same as any other row in this file. `Inside_Connec` (the NC/CND-side origin) was not transcribed this pass — left blank in the CSV rather than guessed.

---

# CN1 — MR-20RMW  (20-pin)  → CA3

Signal name column = the wire number/label printed on the wire.

| Pin | Line/Wire No. | Signal name (label to write) | Goes to (inside connec.) | CA3 pin |
|----:|--------------|------------------------------|--------------------------|---------|
| 1 | 208 | TOOL UNCLAMP | CNQ-29 | A |
| 2 | 209 | TOOL CLAMP | 1-24 | B |
| 3 | 210 | HIGH GEAR | 4-16 | C |
| 4 | 212 | LOW GEAR | 4-17 | D |
| 5 | 232 | 2nd-S LEVEL | CN6-13 | L |
| 6 | 233 | HEAD LUBE PRESSURE | CN6-39 | E |
| 7 | 0G  | DC24V COM (–) NC | — | T |
| 8 | — | (spare) | — | — |
| 9 | — | (spare) | — | — |
| 10 | — | (spare) | — | — |
| 11 | — | (spare) | — | — |
| 12 | — | (spare) | — | — |
| 13 | — | (spare) | — | — |
| 14 | *DECZ | Z-AXIS ZERO-RETURN DEC. | CNB-14 | K |
| 15 | SP16 | SPARE INPUT | 1-34 | H |
| 16 | SP17 | SPARE INPUT | 4-20 | J |
| 17 | SP18 | SPARE OUTPUT | 3-24 | M |
| 18 | SP19 | SPARE OUTPUT | 3-37 | N |
| 19 | — | (spare) | — | — |
| 20 | +24V | DC24V +COM (MC) | — | S |

# CN2 — MR-50RMW  (50-pin)  → CA4

| Pin | Line/Wire No. | Signal name | Inside connec. | CA4 pin |
|----:|--------------|-------------|----------------|---------|
| 1 | 362 | MAGAZINE TIMER | CNQ-36 | W |
| 2 | 351 | MAGAZINE FWD/REV SHIFTER | CNQ-37 | V |
| 3 | 149 | TOOL UNCLAMP (FOOT SW) | 7-23 | P |
| 4 | 150 | MAGAZINE ROT. POS. 1 | 1-40 | X |
| 5 | 221 | MAGAZINE ROT. POS. 2 | 1-40 | A |
| 6 | 222 | MAGAZINE ROT. POS. 4 | 1-6 | B |
| 7 | 223 | MAGAZINE ROT. POS. 8 | 1-19 | C |
| 8 | 224 | MAGAZINE ROT. POS. 10 | 7-20 | D |
| 9 | 225 | MAGAZINE POSITION OK | 7-21 | E |
| 10 | 218 | MAGAZINE POWER OPEN | 4-14 | F |
| 11 | 218 | MAGAZINE COVER OPEN | 4-14 | G |
| 12 | 219 | MAGAZINE FWD/REV SW | 4-15 | H |
| 13 | 381 | LUBE TIMER | CN6-37 | K |
| 14 | +LTZ | Z-AXIS OVER TRAVEL | CNB-12 | L |
| 15 | *DECX | X-AXIS ZERO-RETURN DEC. | 1-13 | T |
| 16 | *DECY | Y-AXIS ZERO-RETURN DEC. | 1-17 | U |
| 17 | 0G  | DC24V COM (–) NC | — | M |
| 18 | 0G  | DC24V COM (–) | — | N |
| 19 | 0G  | DC24V COM (–) | — | S |
| 20 | — | (spare) | — | — |
| 21 | P24 | DC24V +COM (MACHINE) | CN6-21 | T |
| 22–33 | — | (spare) | — | — |
| 34 | 342 | TOOL-MEASURE DEVICE TIMER | CNQ-34 | J |
| 35 | 345 | TOOL-MEASURE DEVICE SW | 1-8 | K |
| 36 | 362 | MAGAZINE LUBE TIMER | 2-13 | L |
| 37 | 239 | MAGAZINE LUBE PRESS SW | 2-14 | M |
| 38 | 238 | MACHINE DOOR INTERLOCK | CN6-23 | N |
| 39 | 340 | SPARE INPUT 2 | 2-24 | S |
| 40 | EHB | EMERGENCY STOP | CN5-44 | a |
| 41 | EMC | EMG. STOP (2nd contact) | — | b |
| 42 | 382 | SPINDLE TOOL CLAMP OK | CN6-50 | f |
| 43 | 524 | DC24V SELECTOR (X,Y,Z,4,5,6) | CNB-5 | (via) |
| 44 | 149B | FOOT SWITCH | 1-38 | R |
| 45 | CP24 | FEED HOLD SW (LATCH) | 4-3 | H |
| 46 | SP29 | SPARE OUTPUT | 4-4 | j |
| 47 | SP30 | SPARE OUTPUT | 3-23 | k |
| 48 | — | (spare) | — | — |
| 49 | +24V | DC24V +COM (NC) | — | N |
| 50 | +24V | DC24V +COM (NC) | — | P |

# CN3 — MR-50RMW  (50-pin)  → TB5 (spindle controller)

| Pin | Line/Wire No. | Signal name | Inside connec. | TB5 tag |
|----:|--------------|-------------|----------------|---------|
| 1 | EHB | EMERGENCY STOP | CN5-43 | D1 1-1 |
| 2 | 147 | HEAD LUBE PRESSURE | 4-28 | A11 |
| 3 | 142 | TOOL CLAMP INTERLOCK | 1-22 | D2 1-02 |
| 4 | 143 | ZERO SPEED | 1-1 | 0101 |
| 5–7 | — | (spare) | — | — |
| 8 | NO | COM | CN6-51 | D2 2-10 |
| 9 | SET2 | COM | -8 | 09 |
| 10 | SET1 | SPINDLE SET FORWARD | -7 | D1 1-97 |
| 11 | SRN | SPINDLE FORWARD (a.k.a. run) | -9 | A111 |
| 12 | SRI | SPINDLE REVERSE | -10 | A-21 |
| 13 | — | (spare) | — | — |
| 14 | ORI C1 | ORIENT COMMAND | CN4-12 | D2 2-A1 |
| 15 | CTL | ORIENT LOOP CHECK | 3-13 | A151 |
| 16–32 | — | (spare) | — | — |
| 33 | COM | COM (DECEL) (CTL) | CN4-15 | D2 1-12 |
| 35 | WLAL | WAY LUBE ALARM | 1-49 | D2 2-A3 |
| 36 | 362 | MAGAZINE TIMER | CN2-1 | E |
| 37 | +LY | +Y OVER TRAVEL | CNB-40 | 0122 |
| 38 | -LZ | -Z OVER TRAVEL | 1-38 | D2 1-B12 |
| 39 | 147 | OIL TEMP DETECTOR | 1-7 | 0503 |
| 40 | SP1 | (spare) | — | — |
| 41 | SP2 | (spare) | — | — |
| 42 | SP3 | (spare) | — | — |
| 43 | SP4 | (spare) | — | — |
| 44 | SPTD | SPINDLE TIMER | CNB-44 | D1 1-14 |
| 45–48 | — | (spare) | — | — |
| 49 | +24V | DC24V +COM | — | — |
| 50 | +24V | DC24V +COM | — | — |

# CN4 — MR-20RMW  (20-pin)  → CON4 / TB5

| Pin | Line/Wire No. | Signal name | Inside connec. | TB5 tag |
|----:|--------------|-------------|----------------|---------|
| 1 | 231 | SPINDLE ZERO SPEED | CN6-26 | CON 4-3 |
| 2 | SS2 | +COM | CNB-33 | 2-4 |
| 3 | FA | SPINDLE REV. ROLLER THERMAL | 1-2 | D2 1-D0 |
| 4 | FC | COM | 2-33 | 1-12 |
| 5 | MS | MS | CN4-6 | D2 1-A2 |
| 6 | OS | OS | CN3-8 | -14 |
| 7 | SET1 | SPINDLE SET | 3-10 | 1-7 |
| 8 | SET2 | SPINDLE SET (2) | 3-9 | 1-8 |
| 9 | SRN | SPINDLE FORWARD | 3-11 | D1 1-A5 |
| 10 | SRI | SPINDLE REVERSE | 3-12 | A-6 |
| 11 | — | (spare) | — | — |
| 12 | ORI C1 | ORIENT COMMAND | CN3-14 | 1-25 |
| 13 | CTL | ORIENT LOOP CHECK | 1-15 | 1-17 |
| 14 | — | (spare) | — | — |
| 15 | COM | COM | CN3-33 | 1-26 |
| 16 | SETA | (set A) | 1-32 | 1-23 |
| 17 | SETB | (set B) | 1-33 | 1-24 |
| 18–20 | — | (spare) | — | — |

# CN5 — MR-20RMW  (20-pin)  → external / relay card

| Pin | Line/Wire No. | Signal name | Inside connec. |
|----:|--------------|-------------|----------------|
| 1 | 144 | EXTERNAL TRIP PROTECTOR | CN23-14 |
| 2 | RST | RESET OUT | CNB-1 (also 23-13) |
| 3 | 146 | OVER-RUN EMG. STOP | 4-30 |
| 4 | EMG (EMB) | EMG. STOP | CN2-40 |
| 5 | EMC | EMG. STOP (2nd) | -41 |
| 6 | 0G | -COM (DC) | CNB-3 |
| 7 | 0G | -COM (DC) | CN12-37 |
| 8 | G24 | -COM (AC) | CN2-43 |
| 9 | EFHD | EXT. FEED HOLD | CN23-9 |
| 10 | RCTLS | RECESSING TOOL L.S. | 2-37 |
| 11 | ISP1 | INPUT SHARE 1 | 2-12 |
| 12 | ISP2 | INPUT SHARE 2 | CN2-44 |
| 13 | ISP1 | 4-AXIS LINC. INTERLOCK CANCEL (TB1-33) | 2-37 |
| 14 | XYZR4 | 4-AXIS UNCLAMP INTERLOCK CANCEL (TB1-34) | 4-14 |
| 15 | 152 | 4-AXIS LIMIT OVER-TRAVEL RELEASE | 4-18 |
| 16 | 1NRAILS | MAGAZINE REAR L.S. | 2-10 |
| 17 | OSP1 | OUTPUT SHARE 1 | 2-44 |
| 18 | OSP2 | OUTPUT SHARE 2 | 2-28 |
| 19 | +24V | +COM (DC) | 1-33 |
| 20 | +24V | +COM (DC) | 1-33 |

# CN6 — MR-50RMW  (50-pin)  → relay card / CB panel

| Pin | Line/Wire No. | Signal name | Inside connec. |
|----:|--------------|-------------|----------------|
| 1 | CYFIN | CYCLE FINISH | CNB-16 (also CV-29) |
| 2 | CYFIN | CYCLE FINISH (2) | 23-29 |
| 3 | MA3T | (mag / M43T) | 3-48 |
| 4 | MA3T | (mag / M45T) | 3-49 |
| 5 | MA3T | (mag / M45T) | 3-45 |
| 6 | — | (spare) | — |
| 7 | SA | SERVO READY | CNB-13 (23-21) |
| 8 | WL | WORK LIGHT | 3-34 |
| 9 | SSET | SPINDLE SET | 23-43 |
| 10 | CTL | LOW-GEAR OVER TRAVEL | 23-48 |
| 11 | OTR | OVER-TRAVEL RELEASE | 23-22 |
| 12 | +LYZ | +YZ OVER TRAVEL | CN2-14 |
| 13 | -LYZ | -YZ OVER TRAVEL | CN1-5 |
| 14–16 | — | (spare) | — |
| 17 | +24V | DC24V COM (+) | CN11-33 (CN30A TB1-1) |
| 18 | TAPC | TAP COOLANT | CNB-46 |
| 19 | MMAL | MIL FUNCTION | 2-25 |
| 20 | PW1 | POWER ON | 23-17 |
| 21 | P24 | MAIN PANE (+) POWER ON | CN12-21 (TB1-1) |
| 22 | — | (spare) | — |
| 23 | 238 | MACHINE DOOR INTERLOCK | (from CN2-38) |
| 24 | 241 | POWER ON MAIN LAMP INTERLOCK | CN2-23 |
| 25 | 240 | (main lamp interlock 2) | -39 |
| 26 | ES1 | SPINDLE SPEED | CN2-1 (via 4-1) |
| 27 | SER | SERVO ERROR | CN2-13 |
| 28 | SRV | SPINDLE SERVO | 3-13 |
| 29 | SMR | SPINDLE READY | 3-20 |
| 30 | ORCH1 | RUN COMMAND | 23-45 |
| 31–32 | — | (spare) | — |
| 33 | TCME | T-CODE NO. MEMORY | CN12-1 |
| 34 | NSFT | NG TOOL | 2-48 |
| 35–36 | — | (spare) | — |
| 37 | 381 | MAGAZINE OIL TOOL DETECTOR | CN2-13 |
| 38 | — | (spare) | — |
| 39 | 355 | SPINDLE HEAD LUBE PRESSURE | CN11-6 |
| 40 | — | (spare) | — |
| 41 | 0G | DC24V COM (NC) | CNB23-1 |
| 42 | 0G | DC24V COM (NC) | -3 |
| 43 | 0G | DC24V COM (NC) | -4 |
| 44 | 0G | DC24V COM (NC) | -6 |
| 45 | — | (spare) | — |
| 46 | 0G | DC24V COM (NC) | -18 |
| 47 | 0G | DC24V COM (NC) | CNB-48 |
| 48 | — | (spare) | — |
| 49 | — | (spare) | — |
| 50 | 382 | MAGAZINE SPINDLE TOOL DETECTOR | CN12-42 |

# CN200 — MR-20RMW → MMS receiver

This connector was omitted from the earlier machine-side accounting because CN8
was mistakenly counted as a bottom-row connector. Drawing 4143075304 (PDF p74)
places **CN200 on the machine-facing/bottom row** and **CN8 on the NC-facing/top
row**. Drawing 4143075322 (PDF p85) provides the complete CN200 table below.

The original MMS unit is not automatically the same electrical endpoint as the
retrofit Renishaw MP-3 probe. `MMS SKIP` is therefore a documented candidate for
`PROBE_SKIP1`, not a released Mesa landing, until continuity and voltage/polarity
are checked at the machine.

| Pin | Line/Wire No. | Signal name | Inside connector | Outside connector |
|----:|---------------|-------------|------------------|-------------------|
| 1 | MMS RDY | MMS READY | CND4-28 | CN200-1 |
| 2 | SEN RDY | SENSOR READY | CND4-29 | CN200-2 |
| 3 | MMS SKIP | MMS SKIP | CND2-14 | CN200-3 |
| 4 | MMS ST | MMS START | CND4-30 | CN200-4 |
| 5 | MMS PON | MMS POWER ON | CND4-27 | CN200-5 |
| 6 | — | (unused on print) | — | — |
| 7 | 0G | DC24V COM (-), NC domain | CND4-1 | CN200-7 |
| 8–13 | — | (unused on print) | — | — |
| 14 | MMS STCMD | MMS START (COMMAND) | CND2-29 | CN200-14 |
| 15–19 | — | (unused on print) | — | — |
| 20 | +24V | DC24V +COM, NC domain | CND4-33 | CN200-20 |

# CN11-SSR — MR-20 (SSR board's own connector)  → CB-panel loads

**Renamed from "CN11" to `CN11-SSR` 2026-08-10** to disambiguate from the actual
BBIA-1 terminal-unit CN11 (full pinout above, including the hydraulic-pump pin
16) — see the "Note on CN11 — RESOLVED, CORRECTED" note near the top of this
file. This table is the **SSR board's own** connector (drawing **4143175309**,
"SSR Board" sheet, `41434WB.pdf` p78), a physically different connector that
BBIA-1's CN11 routes onward to.

**Table corrected 2026-08-10** (re-read from p78 at 400 DPI while chasing the
CN12/NOT-LOCATED signals — pins 1-2 and 8-18 below were wrong in the original
transcription, both the wire numbers and the function labels; see the
correction note near the top of this file for how the error was found). The
corrected table shows CN11-SSR mirrors the terminal-unit CN11's 20 functions
pin-for-pin, at a wire number offset (mostly +500, pins 15-16 at +600, pins
3-4 unshifted). Cable side is MR20-LFH; terminal side MR20-AMD.

| Pin | Line/Wire No. | Signal name (load) |
|----:|--------------|--------------------|
| 1 | 708B | MAGAZINE CW (REV) |
| 2 | 708A | MAGAZINE CCW (FOR) |
| 3 | 710 | TOOL UNCLAMP |
| 4 | 712 | GEAR SHIFT HIGH |
| 5 | 713 | GEAR SHIFT LOW |
| 6 | 715 | SPINDLE AIR BLAST |
| 7 | 716 | WORK AIR BLAST |
| 8 | 717 | MIST COOLANT (ELIMINATED — no mist system on this machine, pin unused for retrofit) |
| 9 | 762 | TOOL MEASURING ARM EXTEND |
| 10 | 761 | AIR JET |
| 11 | 735 | DUST INHALE ELIMINATE |
| 12 | 736 | OIL HOLE |
| 13 | 731 | FLOOD COOLANT |
| 14 | 727 | MAGAZINE COVER CLOSE |
| 15 | 836 | FLOOD COOLANT MOTOR STARTER |
| 16 | 835 | HYDR. PUMP HEAD LUBE PUMP |
| 17 | — | (not used) |
| 18 | — | (not used) |
| 19 | 0G | -COM (NC) |
| 20 | 0G | -COM (NC) |

## CN12 — MR-20 (SSR board's second connector) → 2PC/pallet CB-panel loads

Same source page as CN11-SSR (drawing 4143175309, `41434WB.pdf` p78).
Transcribed for the first time this session. Wire numbers read cleanly at 400
DPI.

**CN12 confirmed 2PC/pallet-changer-only, 2026-08-10.** Re-read the board's
21-33 terminal-strip (the physical screw-terminal row that carries these same
wire families) at 400-600 DPI to try to pin down which pin drives which
function. Every function label found there is pallet-specific: PALLET SELECT
NO.1/NO.2 (32/33), PALLET UNLOAD (31 — read as "PALLET LOAD" on this pass,
recheck), PALLET DOOR CLOSE (30), PALLET DOOR OPEN (29), plus PALLET AIR
BLAST/UNCLAMP/CLAMP at the lower positions (21/20/19 per the board's earlier
overview read). The wire numbers at those positions are close relatives of
CN12's own (e.g. terminal 22 = `425A`, terminal 23 = `425B` — the same `725`
family as CN12 pins 4-5, allowing for the same handwriting 4-vs-7 ambiguity
already seen elsewhere on this sheet) but carry extra `C`/`D` suffix variants
that don't appear on CN12 at all, so the exact pin-for-pin correspondence
still doesn't resolve cleanly — forcing it risks repeating the CN11-SSR
mistake, so individual pin functions are left unconfirmed below.

**This matters less than it looks like it should:** every function on this
connector is 2-Pallet-Changer (2PC) specific, and `bbia1_terminal_unit.md`
already lists the pallet-changer/2PC signals on CN7 for **retirement** in
this retrofit (not reused). No evidence has surfaced anywhere in this project
that SN 060231 actually has the 2PC option installed. CN12 is very likely
out of scope for the Mesa retrofit regardless of its exact pinout.

**Also settles an open question elsewhere:** `ATC_BARRIER_SOL` and
`TAP_COOLANT_BLAST` in `wiring/bbia1_source_dest.csv` had previously been
flagged as "likely CN12" — that hypothesis is now dropped. Neither signal is
a pallet function (barrier-expand is ATC-area, tap-coolant is a coolant
subsystem), so CN12 was never going to answer them. Both signals reopen as
NOT LOCATED with no live lead.

| Pin | Line/Wire No. | Signal name (load) |
|----:|--------------|--------------------|
| 1 | 722A | (unconfirmed — 2PC/pallet output) |
| 2 | 722B | (unconfirmed — 2PC/pallet output) |
| 3 | 724 | (unconfirmed — 2PC/pallet output) |
| 4 | 725A | (unconfirmed — 2PC/pallet output) |
| 5 | 725B | (unconfirmed — 2PC/pallet output) |
| 6 | 782A | (unconfirmed — 2PC/pallet output) |
| 7 | 782B | (unconfirmed — 2PC/pallet output) |
| 8 | 787A | (unconfirmed — 2PC/pallet output) |
| 9 | 787B | (unconfirmed — 2PC/pallet output) |
| 10-15 | — | blank on source table |
| 16-18 | — | (not used) |
| 19-20 | — | blank on source table |

If a future pass reconciles the 21-33 terminal-strip key to these pins,
`ATC_BARRIER_SOL` (Y095 TCME.M barrier-expand) and `TAP_COOLANT_BLAST`
(SOL-61) in `wiring/bbia1_source_dest.csv` are the two open signals waiting on
it.

---

## CN3 completed, CN7 and CN8 transcribed in full (2026-08-18)

Read from 600 DPI renders of `41434WB.pdf` p84 (dwg 4143075321, CN3) and p86
(dwg 4143015323, CN7/CN8); all rows appended to `bbia1_cn_pinouts.csv`.

**CN3 is now 50/50 accounted.** The 26 previously-absent pins are confirmed
**genuinely unused on the print**: pins 5–7, 16–32, 34, and 45–48 are fully
blank rows, and pin 13 is marked `SPARE` with no wire. Every populated CN3
pin was already in the CSV — nothing new was allocated, the gap was purely
"blank vs untranscribed" ambiguity, now closed.

**CN7 (MR-50RMW, 50/50) — the 2PC pallet-changer M-code/handshake connector.**
Fully populated except pin 48's inside-connector reference and RST (pin 31)'s
inside reference, which were not cleanly legible. Wires: MF, M11–M38 (M-code
bits), ZPX/ZPY/ZPZ/ZP4/ZPZ2 (zero-position outputs), MFA, FHDL/FHDPB,
CSTL/CSTPB, PUCCD/PCLCD (pallet unclamp/clamp commands), ISP3/OSP3/OSP4,
MRDY, RST, P1ON/P2ON (FMS), EXFIN/EXRST/EXCST/EXFHD/EXSBK/EMOP1 (external
control), INTX/Y/Z/4 (axis interlocks), EXAL, ONLN, ENCOL, 0G ×2, +24V ×2.
All outside connections go to `TB6`. Function is out of retrofit scope (2PC,
owner decision), but every wire is now identified.

**CN8 (MR-50RMW, 50/50) — entirely NC spare I/O, never cabled out.** The
whole connector is factory-allocated spares: ISP4–ISP22 (19 spare inputs),
OSP5–OSP30 (26 spare outputs), +24 ×2, 0G ×2, one blank pin (48). **The
`Outside_Connec` column is blank on every row** — these wires were allocated
in the NC and terminated at the board but never wired to anything on the
machine side. This is the single largest block of "allocated but never used"
NC capacity, now positively accounted for.

**Signal-name divergences found while re-reading CN3 (logged, not applied).**
The fresh 600 DPI read of dwg 4143075321 disagrees with four existing CSV
rows' signal names — the CSV rows are left as-is pending a tie-breaker, since
they came from a different (also OEM) source pass:

| Pin | CSV says | p84 print reads |
|---|---|---|
| CN3-15 | ORIENT LOOP CHECK | LOW GEAR SHIFT |
| CN3-36 | MAGAZINE TIMER | WAY LUBE WARNING TIMER |
| CN3-39 | OIL TEMP DETECTOR | TOOL DETECTOR |
| CN3-44 | SPINDLE TIMER | SPINDLE TOOL DETECTOR |

CN3-39/44 feed directly into the `authority_conflicts.md` §7.2 dispute (which
already bars landing those conductors until buzzed at the board) — this read
adds a **third** OEM naming for those two pins, reinforcing that only a field
check settles them. CN3-36's print reading (WAY LUBE WARNING TIMER, outside
connec `WLWT-14`) is also more consistent with its neighbor CN3-35 (WLAL, way
lube alarm, `WLWT-5`) than the CSV's "MAGAZINE TIMER".

CN7/CN8's inside-connector references also add ~60 new CND-side coordinates
(CND1/CND2/CND3/CND4/CND5/CND23), the largest batch of top-row (NC-facing)
mapping data captured so far — relevant to the CND accounting gap in
`nc_connector_inventory.md`.

## CN1, CN2, CN4, CN6 completed (2026-08-18, same pass)

All four connectors' absent pins re-read from p84 (CN1/CN2/CN4, dwg
4143075321) and p85 (CN6, dwg 4143075322):

- **CN1 (20/20):** pins 8–13 and 19 genuinely blank.
- **CN2 (50/50):** pins 20, 22–33, and 48 genuinely blank.
- **CN4 (20/20):** pins 11 and 14 blank; **pins 18/19/20 were populated all
  along** — `SE1`/`SE2`/`SE3` SPEED REFERENCE (10 V max speed) → `CON1-31/-32/-30`,
  exactly matching the dwg 4143075403 p127 FR-SX read in
  `connector_crossref.md`. Their inside-connector refs were too faded to read
  even at 1200 DPI — left blank, not guessed.
- **CN6 (50/50):** pins 6, 14–16, 22, 31–32, 35–36, 40, 48–49 blank; pins 38
  and 45 drawn **slashed out** on the print (explicitly not used).

**More CN4 signal-name divergences (logged, not applied)** — same
different-pass caveat as the CN3 table above:

| Pin | CSV says | p84 print reads |
|---|---|---|
| CN4-15 | COM (inside CN3-33) | ORC2 → CON1-26 |
| CN4-16 | SETA "set A" (outside 1-32) | OBA1 → CON1-22, SPINDLE ORIENT ARRIVAL |
| CN4-17 | SETB "set B" (outside 1-33) | OBA2 → CON1-23, +COM |

The p84 print reading for 16/17 agrees with `mesa/current_pin_authority.csv`'s
independent `RECON 2026-08-08 §D` note ("FR-SX OBA1(t22)/OBA2(t23) →
CN4-16/CN4-17") and with the p127 CON1 table — two independent corroborations
against the CSV's SETA/SETB, which looks like a mis-association with the
sheet's CN3 rows. Field-verify before relabeling.

---

# Practical procedure for the cut-and-label operation

1. **Before cutting**, photograph each connector with a ruler across the mating face so you can verify pin count if any labels ever get lost.
2. **Print** the CSV alongside this document, cross out the "(spare)" pins so you don't waste heat-shrink on unused conductors.
3. **Label with the "Line/Wire No." column** — that number is printed on the wire's own sleeving from the factory, so any future cross-reference to the Mazak prints still works. Add the CN/pin as a secondary tag (e.g. `CN3-1 / EHB`).
4. **Common wires (0G, +24V, P24)** — bag them together; they'll ultimately land on Mesa field-power rails rather than individual card pins.
5. **Emergency-stop conductors (EHB/EMB/EMC on CN2-40, CN2-41, CN3-1, CN5-4)** must go into the new safety chain, not into a Mesa input.
6. **Signals to keep vs drop for the Mesa retrofit:**
   - Keep: all limit / ZRN dec. (CN1-14, CN2-14, CN2-15, CN2-16, CN3-37, CN3-38, CN6-12, CN6-13), all door and lube alarms, spindle zero-speed and orient.
   - Retire: the 4-axis, magazine, and pallet-changer wiring on CN2, CN3-40..44, and the whole SSR-board CN11 output loom — those go to your new drive/solenoid stack.

## Source pages (all in `41434WB.pdf`)

- Terminal-unit layout with connector count: drawing 4143075304, sheet 04.
- CN1–CN4 per-pin tables: drawing 4143075321, sheet 84.
- CN5, CN6, CN11 per-pin tables: drawing 4113075022, sheet 85.
- CN7, CN8 per-pin tables (for reference): drawing 4143015323, sheet 86.
- SSR-board CN11-SSR/CN12 pin tables: drawing **4143175309** ("SSR Board" sheet), sheet 78. (Earlier notes cited this as "4143175307" / "03-81581-02" — both wrong; corrected 2026-08-10.)
