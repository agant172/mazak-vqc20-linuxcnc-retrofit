# Mazak VQC 20/40 → Mesa I/O Map (working draft)

> **Import note:** brought into the repo as a cross-reference layer against
> [`../mesa/current_pin_authority.csv`](../mesa/current_pin_authority.csv),
> which this doc's own reconciliation section below refers to by that same
> name (that file has since landed in the repo separately from this import).
> See also [`authority_conflicts.md`](authority_conflicts.md) for open
> conflicts the authority table already tracks, some of which overlap this
> doc's own open items (gear-shift confirm, tool clamp/unclamp valve,
> magazine rotation direction).
>
> One correction applied on import: the "Confirmed so far" table below
> originally swapped PRS-8/PRS-9 (tool clamp vs. unclamp) relative to both
> this doc's own later OCR-sourced table (`TUCPRS` = PRS-8 = tool unclamp)
> and `current_pin_authority.csv` (`TOOL_CLAMP_CONF` = PRS-9,
> `TOOL_UNCLAMP_CONF` = PRS-8). Fixed below so the doc is internally
> consistent and matches the authority table.

Source docs: `413m033.pdf` (Maintenance Manual, Section 4 Hydraulics / Section 5
Switches), `413S038.pdf` (Operating Manual, VQC-20/40 & 20/50), cross-checked
against prior parameter extraction from `PAREXM210E`. Updated with direct
photo/scan review of `41434WB.pdf` (Electrical Circuit Diagram), pages
24, 30–34, 50, 61–66, 70, 95, 100, 105, 110–120, 121–130 — see "New from
electrical diagram review" below for what each page contributed.

Target hardware: Mesa 7i97T + 7i84U (field I/O) + 7i49 (resolver feedback).
Pin assignments below are placeholders (TBD) pending final 7i84U channel
allocation — fill in once total I/O count is confirmed.

This machine is confirmed as the **2PC (two-pallet-changer) configuration**
— consistent labeling across the nonvolatile-memory-register table, the
elementary diagram list, and the whole pallet-changer connection diagram
series (drawings 4143175361–366).

## Confirmed so far

| Designation | Function | Type | Mesa 7i84U Pin | Notes |
|---|---|---|---|---|
| PRS-9 | Tool clamp | Input (prox) | TBD | ATC |
| PRS-8 | Tool unclamp | Input (prox) | TBD | ATC |
| PRS-10 | Gear shift (position 1) | Input (prox) | TBD | |
| PRS-12 | Gear shift (position 2) | Input (prox) | TBD | |
| PRS-13 | Tool-number binary encode (bit) | Input (prox) | TBD | part of 4–5 bit binary tool ID |
| PRS-21 | Tool-number binary encode (bit) | Input (prox) | TBD | |
| PRS-22 | Tool-number binary encode (bit) | Input (prox) | TBD | |
| PRS-23 | Tool-number binary encode (bit) | Input (prox) | TBD | |
| PRS-24 | Tool-number binary encode (bit) | Input (prox) | TBD | |
| PRS-25 | Tool-number binary encode (bit) | Input (prox) | TBD | |
| LS-42 | Zero-return, axis 1 | Input (limit sw) | TBD | confirm which axis |
| LS-52 | Zero-return, axis 2 | Input (limit sw) | TBD | confirm which axis |
| LS-62 | Zero-return, axis 3 (Z) | Input (limit sw) | TBD | confirmed on TB-51 connection diagram (pg 100) as Z-axis zero return |
| PHS-181 | Tool availability sensor | Input (photo sensor) | TBD | magazine |
| PHS-182 | Tool availability sensor | Input (photo sensor) | TBD | magazine |
| SOL-12 | Gear shift solenoid (high) | Output | TBD | hydraulic — confirmed on TB-51 diagram (pg 100) as "gear shift high" |
| SOL-13 | Gear shift solenoid (low) | Output | TBD | hydraulic — confirmed on TB-51 diagram (pg 100) as "gear shift low" |
| SOL-8A | ATC / magazine solenoid | Output | TBD | hydraulic |
| SOL-8B | ATC / magazine solenoid | Output | TBD | hydraulic |

## New from electrical diagram review — TB-51 box circuit (pg 100, 105, 110)

Direct read of the TB-51 connection diagram (drawing 4143075338) and its
companion cable-assembly detail (drawing 4143075353, pg 110) and MS/MR
connector pinout (drawing 4143075340, pg 105):

| Designation | Function | Type | Notes |
|---|---|---|---|
| SOL-10 | Tool unclamp (output solenoid) | Output | separate from PRS-8/9 clamp/unclamp prox *inputs* — this is the hydraulic actuator |
| SOL-15 | Spindle air blast | Output | |
| SOL-16 | Work air blast | Output | |
| SOL-31 | **Flood coolant** | Output | resolves earlier "no designator exists" conclusion — see Coolant section below |
| SOL-35 | Dust inhale eliminate | Output | |
| SOL-36 | Oil hole | Output | |
| SOL-61 | Air jet | Output | |
| PRS-3 | Clamp (blue wire) | Input (prox) | |
| PS-5 | Head lube pressure | Input (pressure switch) | |

**Low/medium confidence — needs visual check against original:** the TB-51
diagram also shows PRS-9 = high gear and PRS-10 = low gear, and PRS-12 =
"2nd Z over-travel" (not a gear-shift confirm signal at all). This is a
*third* different answer from what the alarm-table OCR pass and
`current_pin_authority.csv` each showed for the gear-shift confirm signals
(alarm table: PRS-10=high/PRS-2=low; CSV: PRS-12=low-gear-confirm; this
diagram: PRS-9=high/PRS-10=low). Small-digit misreads (9 vs 8, 10 vs 12) on
a faded scan are exactly the failure mode to expect here — **do not wire
gear-shift confirm off any single source until this is checked visually
against the original diagram.**

Cable-assembly detail (pg 110) confirms the physical cable/connector part
numbers for the TB-51 run: Y01→cabinet CA-1, Y02→CA-2, Y03→CA-3, Y10→Z-axis
servo motor, Y09→spindle AC motor/tacho (MS3108B-series connectors) — useful
for tracing the physical wire run, including the coolant motor lead
question noted below.

## New — Door interlock switches (pg 95)

| Designation | Function | Type | Notes |
|---|---|---|---|
| LS-141 | Machine door interlock | Input (limit sw) | contacts P24–341 |
| LS-140 | Machine door interlock 2 | Input (limit sw) | contacts P24–340, **2PC option only** |

Physically located per the Right Side View / Components Layout drawing
(4143075334). Relevant to the E-stop/safety recommendation below — these
feed the same hardwired interlock chain as the main power circuit, not the
Mesa.

## New — Pallet changer (2PC option), fully confirmed (pg 95, 110–120)

Cross-confirmed across three independent drawings: the TB-51/pallet
connection diagram (4143175363, pg 115), the pallet-changer machine-layout
plan view (4143175366, pg 117), and the elementary system overview
(4143175362, pg 114). All three agree on the same designators — high
confidence.

| Designation | Function | Type | Notes |
|---|---|---|---|
| SOL-22A | Pallet clamp | Output | |
| SOL-22B | Pallet unclamp | Output | |
| SOL-24 | Pallet air blast | Output | |
| SOL-25A | Pallet door open | Output | |
| SOL-25B | Pallet door close | Output | |
| SOL-82A | Pallet load | Output | |
| SOL-82B | Pallet unload | Output | |
| SOL-87A | Pallet select no. 1 | Output | |
| SOL-87B | Pallet select no. 2 | Output | |
| PRS-98 | Pallet clamp confirm | Input (prox) | brown wire |
| PRS-99 | Pallet unclamp confirm | Input (prox) | black/blue wire |
| PRS-92 | Pallet on stocker no. 1 | Input (prox) | |
| PRS-93 | Pallet on stocker no. 2 | Input (prox) | |
| RS-96 | Pallet door close (reed switch) | Input | |
| RS-97 | Pallet door open (reed switch) | Input | |
| LS-83 | Pallet load | Input (limit sw) | |
| LS-84 | Pallet unload | Input (limit sw) | |
| LS-87 | Pallet select no. 1 | Input (limit sw) | |
| LS-88 | Pallet select no. 2 | Input (limit sw) | |

Control path: M/T Controller (IP-400) → relay card TB-505 / SSR board (330B)
→ TB-41/TB-61 (door + clamp/unclamp solenoids and sensors) → TB-62/TB-63
(pallet-changer side: load/unload, select 1/2, stocker sensors, operating
boxes A & B). Connector-level detail (CN500–504 memory-address tables, pg
113; CA-11/12/13 MS-connector pinouts, pg 116) exists but individual pin
mnemonics are dense/small — treat as structure-confirmed, not
digit-confirmed, without a visual check.

This is an entirely new functional area not previously in this doc — needs
its own set of Mesa 7i84U channels if the pallet changer is to be retained
in the retrofit.

## Coolant pump & chip conveyor — REVISED (was: "no factory designator exists")

**Prior conclusion in this doc was incomplete.** A full-text search of the
alarm tables found no PRS/LS/SOL entry for coolant or chip conveyor, which
led to the conclusion that these circuits have no formal circuit
designator. Direct diagram review found two independent designators that
the text search missed (they don't appear in the alarm tables because
they're not fault-monitored, which is why the search didn't surface them —
but the designators do exist):

- **SOL-31** — flood coolant solenoid valve, shown on the TB-51 connection
  diagram (pg 100).
- **CB-4 breaker + "CMS" overload relay (OL-CM4A)** — flood coolant motor
  circuit (350W, 4-pole), shown on Line Power Supply (2) (drawing
  4143075402, pg 126), alongside the hydraulic pump motor (CB-3), head lube
  pump motor (CB-5), and chip conveyor motor (option, no designator seen on
  this sheet — likely still a simple switched load).

Revised recommendation: wire SOL-31 as a real Mesa 7i84U output rather than
inventing one, and use CB-4/CMS as the reference tags when tracing the
physical breaker/overload relay in the cabinet. Chip conveyor still appears
to be a simple contactor-driven load with no dedicated designator — that
part of the original conclusion holds.

## Axis feedback — resolved and now doubly confirmed

All three axes (X/Y/Z) are **resolver-based only** (Tamagawa, via 7i49),
confirmed directly by the machine owner and matching `current_pin_authority.csv`
(`TB2_AXIS_ENCODERS` = `NOT_USED`). Direct diagram review reinforces this
further: the plain Servo Drive sheet (4143075404, pg 128) shows resolver
wiring only, while a *separate*, explicitly labeled "(OP.)" option sheet
(Servo & Magnescale Connection, 4143075404A, pg 129–130) shows the
alternate magnescale wiring, and the Magnescale Detector Box layout
(4143075392, pg 120) and its CPU-Link continuation (pg 121) are likewise
clearly under an options/CPU-Link section of the manual. Three independent
sheets now agree magnescale is generic factory-option documentation, not
evidence of installed hardware — **treat this question as closed.**

## E-stop / door interlock — confirmed consistent with hardwired approach

Line Power Supply (1) (drawing 4143075401, pg 124–125) shows the physical
power path: DS-1/DS-2 door-interlock switches feed a relay that sits
upstream of the main contactor, ahead of any control electronics. This
matches the recommendation below (keep E-stop/door-interlock hardwired,
status-only into LinuxCNC) and gives you the actual relay/switch tags
(DS-1, DS-2) to locate in the cabinet.

## Master schematic index (pg 122–123) — new navigation aid

Drawing 4143175400 (sheets 1–2) is the index for the full "Electrical
Control Schematic Diagram" section: 01–02 line power supply, 03 spindle
drive, 04–05 servo drive/motor control, 06–11 power control
circuit/motion switch input, 12–13 relay drive, 14–15 solenoid driver (SSR
board, outputs 1–16 and 17–33), 21–27 option I/O diagrams, 31/41 patrol
light & auto-power-off option / MMS interface, 50 chiller, 53–57
NC/index/rotary table options, 70–72 M/T controller input / pallet-changer
control / operating panel display, 90–92 CPU link / auto power / calendar
timer options.

**Important caveat confirmed by direct comparison:** these "sheet" numbers
do **not** correspond 1:1 to PDF page position — pages 61–66 of the PDF
turned out to be an unrelated bit-address-map section (see below), while
this index itself lives at PDF page 122–123, not near sheet "01." Treat
sheet numbers as internal drawing references only, not a page-lookup key.

## Internal PC↔NC bit-address maps (pg 61–66) — reference only, not physical wiring

Pages 61–66 are the MAZATROL M-1 control's internal signal/bit-address
tables (alarm-number-to-bit map, PC→NC output registers, NC→PC input
registers, operator-panel key-switch data). Useful for decoding an alarm
number or understanding the internal ladder architecture, but they carry no
PRS/LS/SOL/PHS designators and are one layer removed from physical field
wiring — not directly usable for the Mesa retrofit's I/O map.

## Known machine reference values (from PAREXM210E parameter sheet)

- Axis travel: X 635mm, Y 508mm, Z 460mm
- Counterbalance relief pressure: 80 kg/cm²
- Pitch error comp: PP1-4 = 7874, PZ = 126, PSL = 7
- Rapid feed/accel: RF1-3 = 4724, RT1-3 = 120

## Additional designations — from 41434WB.pdf (Electrical Circuit Diagram, OCR pass)

Pulled from the Alarm Tables (sheets 143075-143/144/146, pgs 45/46/48) and
Components Layout sheets (pgs 90–92). Alarm table entries are especially
useful because they explicitly tie the PRS mnemonic to the numeric
designation and I/O bit address.

| Designation | Mnemonic | Function | Type | Bit Address | Mesa Pin |
|---|---|---|---|---|---|
| PRS-8 | TUCPRS | Tool unclamp prox | Input | X77 / LH03-1 | TBD |
| PRS-10 | HGPRS | High gear prox | Input | X58 / LH0B-0 | TBD |
| PRS-2 | LGPRS | Low gear prox | Input | X5F / LH0B-1 | TBD |
| PRS-12 | (gear shift, pairs with PRS-10) | Gear shift confirm | Input | X5F / LH0B-7 | TBD |
| LS-77 | ITCPRS | Index table clamp/unclamp prox | Input | X2F / LH05-7 | TBD |
| PRS-24 | — | Magazine position 8 | Input | — | TBD |
| PRS-25 | — | Magazine position 10 | Input | — | TBD |
| PRS-38 | — | Tool measure decel (spindle tool detector) | Input | — | TBD |
| PHS-182 | — | Tool measure skip (spindle tool detector, black wire) | Input | X5B | TBD |
| PHS-132 | — | Spindle tool detector off | Input | X5B / LH0B-3 | TBD |
| PHS-127 | — | Magazine tool detector off | Input | X08 / CH00-5 | TBD |
| SOL-8A | — | Magazine CW | Output | — | TBD |
| SOL-8B | — | Magazine CCW (reverse) | Output | — | TBD |
| RS-79 / RS-7F | MGCCRS | Magazine cover close reed switch | Input | X53 / LH0A-3 | TBD |
| RS-18 / RS-2F | MGCORS | Magazine cover open reed switch | Input | X52 / LH0A-2 | TBD |
| OR AT | — | Spindle orientation arrival signal | Input | X03 / CH00-3 | TBD |
| — | — | Head lube pump motor (spindle head) | Output (motor) | — | TBD |
| — | — | Way lube pump + way lube level switch | Output/Input | — | TBD |
| — | — | Emergency stop pushbutton (Operating Panel A & B, part# AH25-P182A) | Input | — | wire to Mesa or keep on hardwired E-stop relay — **recommend hardwired, not through Mesa** |

## Reconciliation against current_pin_authority.csv (GitHub authority)

`current_pin_authority.csv` is the wiring authority for this project — it's
the actively-maintained artifact with real verification status per row
(`PLAN_VERIFY`, `ACCEPTED_VERIFY`, etc.), and it resolves several things
this doc left open (home switches, full over-travel limits, E-stop
topology). This doc should be read as a research/cross-reference layer
against it, not a competing source.

**Confirmed matches:** core ATC/gear signals (tool clamp/unclamp, high/low
gear structure) and the E-stop approach (hardwired safety relay + status
monitor into LinuxCNC) agree between the two sources, and are now further
confirmed by the physical power-supply schematic (pg 124–125).

**Real discrepancies — worth a 2-minute visual check against the original
diagram before wiring:**

| Signal | This doc (OCR from OEM manual) | CSV | Likely cause |
|---|---|---|---|
| Low gear confirm | PRS-2 (alarm table, pg 45); PRS-10 (TB-51 diagram, pg 100 — see note above) | PRS-12 | Three different values now across three sources — needs a visual check, not another OCR/photo pass |
| Magazine tool available | PHS-127 (alarm table, "detector OFF") | PHS-181 | Could be the same sensor described two ways (fault vs. available-status), or two different sensors |
| Spindle tool available | PHS-132 (alarm table, "detector OFF") | PHS-182 | Same ambiguity as above |
| Magazine BCD bit 4 (PRS-25) | Labeled "magazine position 10" | Bit weight 4 in a 5-bit binary scheme | "10" doesn't fit a clean binary weighting — possible OCR misread on this doc's side |

**In the CSV but not yet in this doc** (gaps in this doc's research): ATC
zone switches PRS-55/66, drive fault relays (X/Y/Z), spindle at-speed/fault,
servo ready, operator panel pushbuttons (cycle start/feed hold/single
block).

**In this doc but not yet in the CSV** (gaps in the CSV, worth adding):
magazine CW/CCW solenoids SOL-8A/8B, magazine cover reed switches
RS-79/RS-18, spindle orientation arrival signal, ATC arm position sensors
(0°/45°/180°), tool-measure stand switches, **the entire pallet-changer
signal set above**, **door interlock switches LS-140/141**, and **SOL-31
flood coolant / CB-4+CMS overload relay**. Also worth flagging: the CSV has
a single generic `LUBE_ON` output, but the alarm table shows two separate
lube systems (head lubrication AL-56, spindle way lubrication AL-54) — may
need two channels, not one.

## Still to locate / unresolved

- **Zero-return switches LS-42/52** (axes 1/2) — LS-62 (Z/axis 3) is now
  confirmed via the TB-51 diagram; the other two still need cross-referencing
  against bit addresses.
- Full over-travel limit switch list (separate from zero-return, if applicable).
- Gear-shift confirm signal — three conflicting sources (see above), needs
  direct visual check against the original diagram, not another photo pass.
- Exact pin numbers on the MS/MR connector detail (pg 105) and the
  pallet-changer connector tables (pg 113, 116) — structure is clear, digits
  are not fully trustworthy from photos alone.

## Recommendation on E-stop

Don't route the machine's E-stop through the Mesa 7i84U as a normal input.
Keep E-stop on a hardwired safety relay that cuts power to drives/contactors
directly, and feed a status contact into LinuxCNC (estop-in) for software
awareness only. This is standard practice for these retrofits, and is now
directly confirmed by the Line Power Supply (1) schematic (pg 124–125),
which shows the door-interlock switches (DS-1/DS-2) feeding a relay ahead of
the main contactor, independent of the control electronics.

## Next step

The bulk of the dense CAD ladder/sequence pages have now been reviewed via
direct photo capture rather than OCR, and turned out to be a mix of: internal
PC↔NC bit maps (pg 61–66, not physical wiring), the pallet-changer system
(pg 95, 110–120, now fully confirmed), and the power/servo/spindle schematics
(pg 122–130, confirmed). Remaining open items are narrow and specific:

1. Visual check (not another photo) of the gear-shift confirm signal
   (PRS-2 vs PRS-10 vs PRS-12) directly against the original diagram.
2. Cross-reference LS-42/LS-52 (axis 1/2 zero return) against bit addresses,
   same as was done for LS-62.
3. Confirm exact pin numbers on pg 105/113/116 connector tables if wiring
   those connectors directly (structure is trustworthy, digits are not).
4. Decide whether the pallet changer is being retained in the LinuxCNC
   retrofit — if so, it needs its own Mesa 7i84U channel allocation on top
   of the ATC/magazine signals already planned.
