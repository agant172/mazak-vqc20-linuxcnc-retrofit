# Bench procedure — how to test the open items, and where the circuits are

> **ROLE: SHOP PROCEDURE.** Written 2026-09-05 after the desk decision queue in
> `linuxcnc_config_audit_2026-09-03.md` emptied. Everything still open is a
> measurement. This doc says, for each one: what it decides, where the
> circuit physically is (terminal-unit connector and pin, wire number,
> machine-side connector, field device, drawing page), how to take the
> reading, what each outcome means, and which repo line changes as a result.
> The tap-to-check list is the phone page "VQC-20 Bench Checks"; item numbers
> here match it.

## 0. Read first

**Power and E-stop stay 100 % OEM** (owner decision 2026-08-15). Nothing here
asks you to alter a safety-chain conductor. Section 1 is done with the machine
de-energized and locked out. Section 2 needs control power (and for two items
the spindle drive), with all axis drives inhibited.

**Where the circuits live — the vocabulary used below**

| Name | What it is | Where |
|---|---|---|
| **T.U. / BBIA-1** | The OEM NC-interface *terminal unit*: a board of Honda MR-series connectors CN1…CN11 (CN1/CN4/CN5 are MR-20, CN2/CN6 are MR-50). Every field signal the NC saw passes through it. | Cabinet, NC side. Pinouts: 41434WB p84 (dwg 4143075321, CN2/CN3), p85 (4143075322, CN5/CN6), p134 (4143075408). Repo table: `wiring/bbia1_cn_pinouts.csv`. |
| **CA3 / CA4** | MS-style circular connectors on the *machine* side of the T.U. harness — the switch cables land here. Contact letters are case-sensitive (item 39). | Cabinet wall / machine base. |
| **Strips A/B/C** | Screw terminal strips read in the cabinet survey. C carries the safety chain (`57…60`, `EMB`, `MAR`, `144`, `*DEC4`); B looks like the CN5 landings; A is control-power rails. | `wiring/cabinet_asfound_survey.md`. |
| **Drive rack** | Three DC axis stacks (DK-427 isolation card in front of a TRA transistor amp), plus the Mitsubishi **FR-SX** spindle drive with its SX-CPU card (LED row) and SX-IO1 card (CON1 relay/command block, CON3 open-collector block). | `docs/servo_amp_analysis.md`, 41434WB p82 (4143075313 topology). |
| **Mesa** | 7i80HDT → 7i44 → 7i84U-A (sserial ch0, `hm2_7i80.0.7i84.0.0.*`) and 7i84U-B (ch1, `…7i84.0.1.*`). 7i49 on P1 carries AOUT0-3 and the resolvers. | `mesa/current_pin_authority.csv` is the pin authority. |
| **Prints** | `41434WB.pdf` = electrical drawings (page numbers below are PDF pages). `YM2V39L.pdf` = ladder. FR-SX maintenance manual `BCN-21735-S5` is in `docs/OEM Manuals/`. | Searchable copy: `~/Documents/Claude/Projects/Mazak Conversion/41434WB_SEARCHABLE_BOOKMARKED.pdf`. |

**Tools:** DMM with a continuity beeper and a diode/voltage range, a
current-limited 24 V bench supply (for the photo sensors), an optical tach
(section 2 spindle scaling), a scope or `halscope` (gear-coil item), a
flashlight and phone camera, test leads with fine probes for MR contacts.

**Reading a Mesa input live, without starting the GUI.** The 7i84Us only
enumerate with their field **VIN powered**. On the LinuxCNC box:

```bash
halrun
```
then at the `halcmd:` prompt:
```
loadrt hostmot2
loadrt hm2_eth board_ip="10.10.10.121" config="num_encoders=0 num_resolvers=3 num_pwmgens=4 num_stepgens=0 sserial_port_0=00xxxxxx"
loadrt threads name1=servo period1=1000000
addf hm2_7i80.0.read servo
addf hm2_7i80.0.write servo
start
show pin hm2_7i80.0.7i84.0.0.input-08
```
Re-run the `show pin` line while you operate the switch. `input-NN` is the raw
state, `input-NN-not` is its inverse — both exist on every input. Quit with
`exit`. If the full config is already running, `halcmd show pin <name>` from
a second terminal does the same thing.

**The polarity rule used throughout.** Every safety-style chain on this
machine is NC-healthy: the contact is closed, so the input reads **TRUE when
healthy**. The HAL nets are written for that sense. If your reading is the
other way round, the fix is one token — change `input-NN` to `input-NN-not`
on that net in `linuxcnc/field_7i84u.hal` — and a note in the CSV row. Never
"fix" polarity in the panel colours, the comp, or the INI.

**Recording.** Photograph every label before you probe it (the `IMG_nnnn`
number goes in the note). Write readings into a new file under
`docs/commissioning_logs/` with the date, then tick the phone page.

---

## 1. Trip A — cabinet, de-energized (lock out, verify dead)

Ordered so you work one connector at a time. CN5 → CN2 → CN6 → CN1 → CN4,
then the drive rack, then the machine-side devices.

### 47 · Thermal chain (IN8) — sets the panel LED sense  *(config item 16c)*

- **Decides:** whether `thermal-alarm` reads TRUE when healthy. Warning-only
  by owner decision; nothing stops if it is wrong, but the panel LED would
  be inverted.
- **Circuit:** two NC contacts in series — **X073 THR.M** (motor thermal /
  circuit-protector trip) and **X07B ONT.M** (main transformer overheat) —
  entering the T.U. at **CN5-1, wire 144**, machine side **TB1-144**, also
  labelled `144` on **strip C**. Print: 41434WB p133 (dwg 4143075407) and
  p85 (CN5).
- **Procedure:** machine cold, dead, motor starters reset. Continuity from
  CN5-1 to the chain's return (`G24`/`0G` on strip C — confirm which by the
  print, the chain is drawn to the 24 V common). Expect **beep = closed**.
  Then, if you have control power available later: power VIN, run the
  `halrun` recipe, read `input-08` — expect **TRUE**.
- **Outcome:** TRUE-healthy → nothing changes, mark done. FALSE-healthy →
  `-not` on the `thermal-alarm` net; CSV row `THERMAL_ALARM_CHAIN` gets a
  dated note.

### 8 · Door interlock (IN24) — both channels  *(config item 16c)*

- **Decides:** `door-interlock` sense, and what the second door device is.
- **Circuit:** **CN2-38, wire 341** = MACHINE DOOR INTERLOCK (LS-140 + LS-141
  limit switches + **X01D ITMDSS** safety switch, all in series), far end
  **CA4-U**, internal link to CN6-23. **CN2-39, wire 340** = MACHINE DOOR
  INTERLOCK 2 (the second factory channel, **X01C MDINT**), far end
  **CA4-S**, internal link CN6-24. Print p84 (4143075321). Only channel 1
  (341) is landed on IN24.
- **Procedure:** door closed: continuity CN2-38 → return, expect closed.
  Door open: expect open. Repeat on CN2-39. Photograph the second device on
  the door frame (limit switch vs a tongue-type safety switch — the ladder
  calls X01D "SS").
- **Outcome:** closed-when-shut → no change. Open-when-shut → `-not` on
  `door-interlock`. Record the second device type in `DOOR_INTERLOCK`'s CSV
  note; whether channel 2 ever gets an input is a separate owner call.

### 11 · Head-lube pressure switch PS-5 (IN25)  *(config item 16c)*

- **Decides:** `lube-ok` sense. This is the **only** lube switch on
  SN 060231; X042 HLP2 has no device.
- **Circuit:** **PS-5**, stamped tag `PS 5` on the head-lube line, **wire
  355** → T.U. **CN6-39**, return **G24** (so it crosses the interposing-relay
  boundary — the input must not tie the OEM 24 V common straight to the
  Mesa field common). Print p100 (4143075338) + p133. Photo already on
  file (2026-08-13) showing tag and wire.
- **Procedure:** at rest (no pump): continuity across the switch. Then, in
  section 2 with the hydraulic/lube pump running, read again — the contact
  should change state at line pressure. Record NO/NC form and, if the
  switch body is marked, the trip pressure.
- **Outcome:** closed-at-pressure → no change (TRUE = OK). Open-at-pressure
  → `-not` on `lube-ok`. Update `LUBE_OK` CSV note; owner may promote the
  row's status now that form is known.

### 7 · Home switches LS-42 / LS-52 / LS-62 — sense **and** dog side  *(config item 13C, and confirms 13D)*

- **Decides:** the polarity of `home-x/y/z` on 7i84U-B IN6/7/8, **and the
  sign of `HOME_SEARCH_VEL` per axis**, which today is a guess. A wrong sign
  runs the axis at search speed into the hard stop with nothing to catch it.
  The captured M-2 parameter ZD says X's direction bit (0) differs from
  Y/Z's (1), but nobody knows which bit is which direction.
- **Circuit:** `*DECX` **CN2-15** (far end **CA4-c**, lowercase), `*DECY`
  **CN2-16** (**CA4-d**), `*DECZ` **CN1-14** (**CA3-K**). Devices LS-42 (X),
  LS-52 (Y, digit faded — verify), LS-62 (Z, also on TB-51 p100). Print
  p136 (dwg 4143075410, Motion Switch Input 4) + p91. The asterisk is the
  OEM active-low mark.
- **Procedure, per axis:**
  1. Find the switch and its dog (cam) on the axis. Photograph both with a
     tape in frame.
  2. Continuity at the T.U. pin with the roller **off** the dog, then push
     the roller **onto** the dog by hand. Record both. (Repo assumes NO
     contact: open off-dog, closed on-dog.)
  3. **Which end of travel is the dog?** Stand at the operator position:
     record whether the dog sits at the +X or −X end of table travel, the
     +Y (toward the magazine, RP2 = +9.5 in) or −Y end of saddle travel,
     the top or bottom of Z. That is the direction `HOME_SEARCH_VEL` must
     point, once the axis sign convention is fixed by the resolver phasing
     check (item 22).
  4. Measure dog length and the distance from the dog's far edge to the
     mechanical stop — this bounds a safe search velocity.
- **Outcome:** the sense sets `-not` on `home-x/y/z`. The dog side sets the
  sign of `HOME_SEARCH_VEL` in `[JOINT_0..2]` of `mazak_vqc_20_40.ini` (do
  this edit only after item 22 fixes + direction). If Y's dog is at the
  magazine end, the Z-first `HOME_SEQUENCE` blessed under 13D stands; if it
  is not, re-open 13D.

### 48 · Which photo sensor is X005 and which is X05B  *(config item 11b — this is the ladder's open question 6)*

- **Decides:** whether AL75/AL76 (tool-detect alarms) are armed on the right
  cycles. The comp arms them by where a tool physically must be; the ladder
  arms them by cycle letter; the two disagree unless the sensor names read
  backwards. Also settles bench item 2's sink/source question.
- **Circuit:** **PHS-181** "tool detector" = **X005 MGTDPRS**, **wire 381**
  → T.U. **CN2-13** (far end **CA4-N**; one sheet reads 391 — read the
  jacket). **PHS-182** "spindle tool detector" = **X05B SPTDPRS**, **wire
  382** → **CN6-50** (internal link CN2-42). Print p135 (dwg 4143075409,
  Motion Switch Input 3). Both are **3-wire photo sensors at the magazine
  exchange station — do not ohm them like dry contacts.**
- **Procedure:**
  1. Photograph both sensor labels (model number → NPN/PNP and wire colours;
     typically brown +24, blue 0 V, black output).
  2. Power **one** sensor from the bench supply (24 V, current-limited).
     Meter the output wire in three states: nothing at the station · a
     toolholder sitting in the pot at the exchange position · a toolholder
     held up at the spindle taper at exchange height (the beam only needs
     the flange; drawbar stays clamped, hydraulics off).
  3. Note whether the output **sinks or sources** when it sees a tool.
  4. Repeat for the other sensor.
- **Outcome:** if 381/PHS-181 sees the *pot* and 382/PHS-182 sees the
  *taper*, names are right and the ladder pairing is the anomaly → comp
  stands, annotate the transcription. If both see the exchange plane from
  opposite sides → comp's physics gating stands. If crossed → swap the
  `MAG_TOOL_AVAILABLE` / `SPINDLE_TOOL_AVAILABLE` CSV rows and the
  `mag-tool-avail` / `spindle-tool-avail` nets (IN2/IN3), and the AL75/76
  scenario in `tests/hal/scenarios`. Sink vs source sets `-not`.

### 35 · Find the real combined servo alarm  *(config item 16b)*

- **Decides:** where IN10 `servo-fault` actually lands, and its sense. Today
  the net is reserved with **no located source** — the old CN6-27 claim was
  a misread (CN6-27 is SFR, spindle forward). This input trips E-stop on all
  three joints, so guessing its polarity is the worst option.
- **Circuit (what is known):** the drawing p85 (dwg 4143075322 sheet 3)
  lists a **SERVO ALARM** signal among the T.U. pins; the only servo status
  line on CN6 is **CN6-7 SA SERVO READY**. The axis drives are DK-427
  isolation cards in front of TRA transistor amps; each has front LEDs and
  the doc says ready/alarm discretes mirror them. There is **no Mitsubishi
  manual for these amps in the repo** — read the card legends, don't recall.
- **Procedure:**
  1. On p85, find the SERVO ALARM pin. Jacket-read that pin at the T.U. and
     photograph it.
  2. Buzz from that pin toward the drive rack. Find the terminal or relay
     on the DK-427/TRA stack it lands on; photograph the card's terminal
     legend (look for `ALM`, `EM`, `RDY`-type marks — record exactly what is
     printed).
  3. If the three amps are chained into one contact, note whether it is a
     series-NC loop (open on any fault) or parallel-NO. De-energized you can
     only read the resting state; the healthy state is a section-2 reading
     with control power on the rack and the amps enabled but inhibited.
- **Outcome:** healthy = closed → land on IN10 as `input-10`; healthy = open
  → `input-10-not`. Fill the `SERVO_FAULT` CSV row's dest connector/pin/wire
  and change status from DEFERRED. Remove the UNVERIFIED banner in
  `field_7i84u.hal`. Until landed, IN10 must stay un-wired (no jumper — a
  false-healthy jumper on an E-stop input is not acceptable).

### 10 · FR-SX "controller normal" FA sense (IN14)  — same connector as 35, one extra read

- **Circuit:** **CN4-3 FA** / **CN4-4 FC** (COM), from FR-SX **CON1-50 /
  CON1-12**. Meter FA–FC drive healthy vs faulted (section 2 for healthy).
  Decides the IN14 `spindle-fault` inversion.

### 28 · Gear-confirm switches PRS-10 / PRS-12 — resting states  *(feeds item 44)*

- **Circuit:** **PRS-10 HGPRS wire 210 → CN1-3 (CA3-C)**, **PRS-12 LGPRS wire
  212 → CN1-4 (CA3-D)**. Print p135. Devices on the headstock gear-shift
  fork.
- **Procedure:** continuity each, in whatever gear the machine sits, then
  (if the fork can be moved by hand with hydraulics off — usually not) at
  mid-stroke. Ladder assumes each closes only when its gear is fully
  engaged, both open mid-shift. Record which gear the machine is parked in;
  section 2's coil test starts from there.

---

## 2. Trip B — control power on, axis drives inhibited

Hydraulic pump may run for the lube and gear items. **No axis drive enabled.**
The spindle drive is powered for 46 and 12b; keep hands clear of the spindle
and the ATC arm.

### 46 · FR-SX up-to-speed output USO — polarity and pull-up  *(config item 16a)*

- **Decides:** how `spindle-at-speed` (IN13) is wired and whether it needs
  `-not`. Until landed, the bench jumper IN13 → VFIELD keeps feeds from
  stalling; a HAL `sets` is deliberately forbidden by the validator.
- **Circuit:** FR-SX **SX-IO1 card, connector CON3**, an open-collector
  block that Mazak never wired: **pin 15 `USO`** (UP TO SPEED), **pin 20
  `COM`**. Neighbours for orientation: 14 `ZSO`, 16 `VRO`, 17 `CDO`, 18
  `FLO`, 19 `ORAO`, 8–11 `AL1/2/4/8`. Manual BCN-21735-S5 PDF p12 (external
  wiring), p9 (spec: transistor ON within ±15 % of preset speed). **LED7 UP
  TO SPEED** on the SX-CPU card lights with it, so you can see the state
  before touching a probe.
- **Procedure:** spindle at a commanded speed (any method that runs it),
  LED7 lit. Meter CON3-15 vs CON3-20: does the pin **pull low** (open
  collector, sinks to COM) or **source P24** (open emitter)? Then stop the
  spindle and read again. Also check whether the P24 shown on the manual's
  diagram is internal to the card or must be supplied.
- **Outcome:** record sink/source and the two states. Land CON3-15/20 on
  7i84U-A **IN13** through an interposing relay (the OEM ZS1 pattern) unless
  FR-SX COM and the Mesa field ground are proven common. Set or omit `-not`
  in `field_7i84u.hal` so `spindle-at-speed` is TRUE at speed. Move the
  `SPINDLE_AT_SPEED` CSV row from COMMISSIONING_PENDING to landed, and pull
  the IN13 jumper. Bench item 46 on the phone page is this measurement.

### 23 + 12b · Spindle speed reference: roles, then volts per RPM in **both** gears  *(config item 12b)*

- **Decides:** the numbers `OUTPUT_SCALE` needs. Today one scale (3488 RPM at
  10 V) covers both gears, so a low-gear S400 would command about 1 V and
  run the motor far too slow. Captured M-2 parameters: **GH4 = 3488** (high
  max), **GH3 = 434** (low max, the crossover), GL4 = 119, GL3 = 28. No
  volts-per-RPM figure exists in the repo — the "~1 V" is arithmetic, not
  a measurement.
- **Circuit:** speed reference **SE1 / SE2 / SE3** on T.U. **CN4-18 / 19 /
  20** → FR-SX **CON1-31 / 32 / 30**. SE3 is marked "10 V MAX SPEED".
  Direction comes from the discrete FWD/REV inputs, not from the sign of
  the reference (architecture A, `motion_7i80hdt.hal` comments). The Mesa
  side is 7i49 **AOUT3 (P3-24) with GND3 (P3-23)**.
- **Procedure:**
  1. **Roles first (item 23):** with the drive powered and the reference
     harness disconnected from the NC side, ohm SE1/SE2/SE3 to the drive's
     analog ground (AGA) to identify command, common and shield. Confirm
     +10 V = top motor speed and that a negative reference is *not* a
     reverse command (drive should clip or alarm — watch, don't insist).
  2. **Scale, high gear:** with the fork confirmed in high (PRS-10 made),
     apply a known reference from a variable DC source (or from LinuxCNC's
     AOUT3 with the axis drives inhibited): **2.0 V, then 5.0 V**. Read
     spindle RPM at the nose with an optical tach. Compute RPM/V. Expected
     from GH4: about **349 RPM/V**.
  3. **Scale, low gear:** shift to low (a real M38-type shift needs the
     zero-speed dwell and hydraulics — do it through the normal sequence,
     never by forcing a solenoid against a turning spindle), confirm
     PRS-12, repeat 2.0 V and 5.0 V. Expected from GH3: about **43 RPM/V**.
  4. Note the drive's own parameter for "speed at 10 V" if the SX-CPU
     display can show it — that is the motor-side number; the two spindle
     numbers should differ from it by the two gear ratios.
- **Outcome:** two constants. The design that follows is small: the
  `gear-range` signal that item 5 already produces selects between two
  scales (a `mux2` feeding the spindle scale, or two `scale` components),
  and `OUTPUT_SCALE`/`MAX_*_VELOCITY` are set per range. Until the two
  numbers exist, do not write that HAL.

### 44 · Gear-coil hold — now includes the B3 behaviour  *(config items 5, 6, 7, and B3 applied 2026-09-05)*

- **Decides:** that the real machine matches what `mazak_orient.comp` now
  does. Three things to see:
  1. **Steady hold:** with the machine parked in a gear, that gear's
     solenoid coil stays energised continuously (SOL-12 high via RLY-1 on
     OUT7, wire 412; SOL-13 low via RLY-2 on OUT8, wire 713 family). The
     comp reads `state = 3`, not 0, at rest — that is intended.
  2. **Outgoing hold through a shift:** command a change. The outgoing coil
     must stay on until the zero-speed dwell completes, then drop; the
     incoming coil picks up only after that. Capture both coils plus
     FWD/SZS on halscope or a two-channel scope.
  3. **B3 — coil holds through a drive fault / arm drop:** with the spindle
     stopped and a gear confirmed, open the FR-SX fault input to the comp
     (pull the `spindle-fault` source or `setp` the comp's `drive-fault`
     pin TRUE in a *test* session, not the live config). `drive-arm` and
     `spindle-orient-cmd` must drop; **the gear coil must stay on**. Before
     B3 both coils dropped here. Also power up once with the fork
     mid-stroke (both PRS open) and confirm nothing latches AL47 and no coil
     chatters — that was item 6's nuisance trip.
- **Circuit:** coils at the Fujikoshi valve block on the head, relays RLY-1 /
  RLY-2 (RLY-2 not yet fitted — "fit RLY-2 + suppression before energising"),
  PRS-10/12 on CN1-3/4. Print p140 (dwg 41431075414, Solenoid Driver 1),
  p100 TB-51 (wire 412 → SOL-12).
- **Outcome:** matches → mark 44 done, close items 5/6/7/B3's "bench-verify"
  notes. Doesn't match → record exactly which coil did what and when; that
  goes back to the comp as a LADDER DISCREPANCY, never a silent edit.

### 27 · SZS during orient approach, 29 · ORA1 idle polarity — while the spindle drive is powered

- **SZS** on **CN4-1 ZS1 / CN4-2 ZS2** (FR-SX CON1-3/4): watch it during a
  manual orient; if it drops during the 80–155 rpm approach, the AL46 mask
  needs work. **ORA1** on **CN4-16 / CN4-17** (CON1-22/23): voltage with the
  spindle unoriented — should be a true level, high = oriented. Sets IN4's
  sense.

---

## 3. What each reading changes — one table to bring back

| Item | Reading you bring back | Repo edit |
|---|---|---|
| 47 | IN8 TRUE or FALSE with chain healthy | `field_7i84u.hal` net `thermal-alarm` (+`-not` if FALSE); CSV `THERMAL_ALARM_CHAIN` note |
| 8 | CN2-38 closed/open door shut; second device type | net `door-interlock`; CSV `DOOR_INTERLOCK` |
| 11 | PS-5 form, state at pressure | net `lube-ok`; CSV `LUBE_OK` (status promotion) |
| 7 | per axis: on/off-dog continuity; dog end of travel; dog length | nets `home-x/y/z` (7i84U-B IN6/7/8); `HOME_SEARCH_VEL` sign per `[JOINT_n]` after item 22; 13D stays or re-opens |
| 48 | which sensor sees pot vs taper; sink/source | CSV rows `MAG_TOOL_AVAILABLE`/`SPINDLE_TOOL_AVAILABLE`, nets on IN2/IN3, AL75/76 scenario; ladder open Q6 closed |
| 35 | SERVO ALARM pin, its far end on the rack, healthy state | CSV `SERVO_FAULT` dest + status; IN10 net polarity; remove UNVERIFIED banner |
| 10 | FA–FC healthy vs faulted | IN14 `spindle-fault` polarity |
| 46 | USO sink/source, both states, P24 internal? | IN13 landing (relay or direct), `-not`, CSV `SPINDLE_AT_SPEED` status; remove the IN13 jumper |
| 23 / 12b | SE roles; RPM/V high; RPM/V low | `motion_7i80hdt.hal` AOUT3 role notes; new gear-aware scale HAL + `[SPINDLE_0]` values |
| 44 | coil traces: hold, handoff, hold-through-fault, mid-stroke power-up | close items 5/6/7/B3 bench notes, or file a LADDER DISCREPANCY |
| 28 / 27 / 29 | PRS rest states; SZS during approach; ORA1 idle level | comp comments / AL46 mask / IN4 sense |

## 4. Quick pin map for this trip

| T.U. pin | Wire | Signal | Far end | Mesa |
|---|---|---|---|---|
| CN5-1 | 144 | THERMAL TRIP PROTECTOR (X073 + X07B series) | TB1-144 / CND4-46 | 7i84U-A IN8 |
| CN2-38 | 341 | MACHINE DOOR INTERLOCK (ch 1) | CA4-U | 7i84U-A IN24 |
| CN2-39 | 340 | MACHINE DOOR INTERLOCK 2 | CA4-S | — |
| CN6-39 | 355 | HEAD LUBE PRESSURE PS-5 | (G24 return) | 7i84U-A IN25 |
| CN2-15 | *DECX | X zero-return decel LS-42 | CA4-c | 7i84U-B IN6 |
| CN2-16 | *DECY | Y zero-return decel LS-52 | CA4-d | 7i84U-B IN7 |
| CN1-14 | *DECZ | Z zero-return decel LS-62 | CA3-K | 7i84U-B IN8 |
| CN2-13 | 381 | TOOL DETECTOR PHS-181 (X005) | CA4-N | 7i84U-A IN2 |
| CN6-50 | 382 | SPINDLE TOOL DETECTOR PHS-182 (X05B) | (CN2-42) | 7i84U-A IN3 |
| CN1-3 | 210 | HIGH GEAR PRS-10 | CA3-C | 7i84U-A IN17 |
| CN1-4 | 212 | LOW GEAR PRS-12 | CA3-D | 7i84U-A IN18 |
| CN4-1 / -2 | ZS1 / ZS2 | SPINDLE ZERO SPEED | FR-SX CON1-3 / -4 | 7i84U-A IN5 |
| CN4-3 / -4 | FA / FC | SPINDLE CONTROLLER NORMAL | FR-SX CON1-50 / -12 | 7i84U-A IN14 |
| CN4-16 / -17 | ORA1 / ORA2 | SPINDLE ORIENT ARRIVAL | FR-SX CON1-22 / -23 | 7i84U-A IN4 |
| CN4-18 / -19 / -20 | SE1 / SE2 / SE3 | SPEED REFERENCE | FR-SX CON1-31 / -32 / -30 | 7i49 AOUT3 / GND3 |
| (none, retrofit-added) | — | USO up-to-speed | FR-SX CON3-15, COM CON3-20 | 7i84U-A IN13 |
| (unlocated) | — | SERVO ALARM (combined) | p85 pin → DK-427/TRA rack | 7i84U-A IN10 |

## 5. Where this doc's facts come from

`mesa/current_pin_authority.csv` (pins, wires, status), `wiring/bbia1_cn_pinouts.csv`
(T.U. far ends), `wiring/cabinet_asfound_survey.md` (strips), `docs/servo_amp_analysis.md`
(drive rack), `docs/frsx_maintenance_manual_notes.md` Finding 7 (CON3),
`docs/parameters_sn060231.md` (GH3/GH4/ZC/ZD), `docs/ladder/homing_ladder_transcription.md`,
`docs/ladder/atc_ladder_transcription.md` open Q6, and the three audit reports.
Anything here that contradicts a print is a transcription error in this doc —
the print wins, and the fix goes in the CSV first.
