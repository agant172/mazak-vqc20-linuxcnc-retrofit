# BBIA-1 CN1–CN6 & CN11 Detailed Pinouts

**Machine:** Mazak VQC-20/40, SN 060231 (Mazatrol M-1)
**Board:** BBIA-1 terminal unit (Mitsubishi BN624A306H01, "YM VQC-20-40/50")
**Source:** `41434WB.pdf` — Terminal-Unit Details, drawings 4143075321 / 4113075022 / 4143015323 (sheets 84–86); confirmed against drawing 4143075304 sheet 04 (terminal-unit layout) and drawings 4143075307 / 03-81581-02 (SSR board).
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
| CN11 | MR-20 (SSR bd, MR20-AMD) | 20 | SSR-board **outputs**: gear-shift hi/lo, spindle/work blast, air-blast cabinet, arm extend, air jet, dust inhale, oil-hole flood/mag, mag front/rear/spindle-head oil pumps, 0G |

**Note on CN11:** There are two things called "CN11" in the drawings. The one on the SSR board (channel to CB-panel loads) is the one whose per-pin list is on drawing 4143175307. Its adjacent twin CN12 uses the same MR-20 shell. If your CN11 is the terminal-unit CN11 that appears in the sheet-86 tables (SSR-board 20-pin), the pin list below is the same wire numbers.

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

# CN11 — MR-20 (SSR-board / terminal unit)  → CB-panel loads

The SSR-board CN11 (drawing 4143175307) carries the AC-switched **outputs** to solenoids and pump motors. Cable side is MR20-LFH; terminal side MR20-AMD.

| Pin | Line/Wire No. | Signal name (load) |
|----:|--------------|--------------------|
| 1 | 708B | (drawing shows 708B on pin 1 for SSR-board CN11) |
| 2 | 708A | (paired with pin 1) |
| 3 | 710 | GEAR SHIFT HIGH |
| 4 | 712 | GEAR SHIFT LOW |
| 5 | 713 | GEAR SHIFT WORK |
| 6 | 715 | SPINDLE BLAST |
| 7 | 716 | WORK BLAST |
| 8 | 717 | AIR BLAST (CABINET) |
| 9 | 742 | ARM EXTEND |
| 10 | 261 | AIR JET |
| 11 | 205 | DUST INHALE ELIMINATE |
| 12 | 236 | OIL HOLE FLOOD |
| 13 | 237 | OIL HOLE MAGAZINE |
| 14 | 221 | MAGAZINE FRONT OIL PUMP |
| 15 | 236 | MAGAZINE REAR OIL PUMP |
| 16 | 235 | SPINDLE HEAD OIL PUMP |
| 17 | 836 | (per SSR sheet) |
| 18 | 835 | (per SSR sheet) |
| 19 | 0G | -COM (NC) |
| 20 | 0G | -COM (NC) |

## Alternative CN11 mapping (from SSR-board detail sheet)

If your CN11 is on the SSR board itself and you're seeing the alt loom (drawing 03-81581-02, `CN11` labeled 01–25), that is a 25-way pallet-changer / coolant loom. Its channel list is:

01 WORK AIR BLAST · 02 SPINDLE AIR BLAST · 03 GEAR SHIFT LOW · 04 GEAR SHIFT HIGH · 05 TOOL UNCLAMP · 06 MAGAZINE CCW · 07 MAGAZINE CW · 08 MAGAZINE COVER CLOSE · 09 FLOOD COOLANT · 10 OIL HOLE · 11 DUST INHALE ELIMINATE · 12 AIR JET · 13 TOOL MEASURING ARM EXTEND · 14 MIST COOLANT · 15 PALLET AIR BLAST · 16 PALLET UNCLAMP · 17 PALLET CLAMP · 18 HYD. PUMP & HEAT-EXCHANGER MOTOR · 19 FLOOD COOLANT MOTOR · 20 PALLET SELECT NO. 2 · 21 PALLET SELECT NO. 1 · 22 PALLET UNLOAD · 23 PALLET LOAD · 24 PALLET DOOR CLOSE · 25 PALLET DOOR OPEN

Confirm which of the two you're actually looking at by counting shell positions before cutting — 20 vs 25.

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
- SSR-board CN11/CN12 (25-way alt loom): drawing 03-81581-02 / 4143175307, sheet 78.
