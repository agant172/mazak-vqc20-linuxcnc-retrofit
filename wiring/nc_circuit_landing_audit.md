# NC-Circuit Landing Coverage Audit — Mazak VQC-20 Retrofit

ROLE: AUDIT
Date: 2026-08-18
Scope: every wire-carrying pin on the connectors leaving the old NC (BBIA-1 CN1–CN8, CN11/CN11-SSR/CN12, and Plane B: CNA3/4/5 resolvers + FR-SX CON1/CON2/CNA/CNAA)

**Method.** Every wire-carrying pin (blank/not-used pins per `wiring/bbia1_cn_pinouts.csv` skipped) was classified into one of seven dispositions by cross-referencing the pinout CSV against `mesa/current_pin_authority.csv`, `wiring/bbia1_retrofit_destination_crosswalk.csv`, `wiring/bbia1_source_dest.csv`, `wiring/plane_a_bbia1_pin_crosswalk.csv`, `wiring/connector_crossref.md`, `wiring/authority_conflicts.md`, `INTERFACE_ARCHITECTURE.md`, the live `linuxcnc/*.hal` nets, and the owner-decision registers (`docs/project_status.md`, `docs/io_capacity_reconciliation.md`). Every pin initially classified GAP or UNCLEAR then received an adversarial verification pass that actively tried to refute the gap by finding a landing or a documented disposition anywhere in the repo (archived crosswalks included). Three of those verification passes overturned the classifier (CN6-3 → RETIRED_OOS, CN6-25 → POWER_COMMON, CON1-14 → DUPLICATE_PATH of CN4-6); every other gap survived refutation and is reported below as CONFIRMED.

Disposition key: **LANDED** = equivalent Mesa/LinuxCNC pin with authority row (HAL net where applicable) · **SAFETY_CHAIN** = stays in the OEM hardwired E-stop/contactor chain by owner decision 2026-08-15 · **POWER_COMMON** = supply/common rail, not a signal · **RETIRED_OOS** = explicit retirement, deferral, or out-of-scope decision (incl. factory spares) · **DUPLICATE_PATH** = same physical circuit counted at a named primary pin · **GAP** = live circuit with no landing and no disposition, or a claimed landing contradicted by the repo's own dispute register · **UNCLEAR** = cannot yet be established as field-wired.

---

## 1. Coverage scoreboard

| Connector | Wire-carrying pins | LANDED | SAFETY_CHAIN | POWER_COMMON | RETIRED_OOS | DUPLICATE_PATH | **GAP** | UNCLEAR |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| CN1 (bottom row, 20-pin) | 13 | 6 | 0 | 2 | 4 | 1 | **0** | 0 |
| CN2 | 36 | 14 | 2 | 6 | 3 | 2 | **9** | 0 |
| CN3 | 24 | 4 | 1 | 4 | 4 | 6 | **5** | 0 |
| CN4 (FR-SX interface) | 18 | 7 | 0 | 3 | 0 | 3 | **5** | 0 |
| CN5 | 20 | 2 | 2 | 5 | 8 | 0 | **3** | 0 |
| CN6 (relay card / CB panel) | 36 | 6 | 1 | 9 | 6 | 6 | **8** | 0 |
| CN7 (2PC pallet) | 50 | 0 | 0 | 4 | 46 | 0 | **0** | 0 |
| CN8 (never-cabled spares) | 49 | 0 | 0 | 4 | 45 | 0 | **0** | 0 |
| CN11 / CN11-SSR / CN12 | 45 | 11 | 0 | 4 | 12 | 16 | **2** | 0 |
| Plane B (resolver + FR-SX, circuit rows) | 30 | 10 | 1 | 4 | 5 | 8 | **1\*** | 1 |
| **Total** | **321** | **60** | **7** | **41** | **93** | **41** | **33\*** | **1** |

\* Plane B's one GAP row (CON1-7/8, the SET1/SET2 drive-arm handshake) is the drive-side end of the same conductor as CN4-7/8 — **32 unique gap pins** across the machine, plus 1 UNCLEAR.

**Bottom line:** CN1, CN7, and CN8 are fully clean. Every other Plane-A connector carrying live machine circuits has confirmed gaps. The gaps cluster into a handful of physical jobs (Section 2) — most close with a de-energized buzz-out session at the open cabinet plus one written owner decision each.

### Verification reclassifications (classifier overturned)

| Pin | Was | Now | Why |
|---|---|---|---|
| CN6-3 (MA3T, M43T) | GAP | RETIRED_OOS | Archived crosswalk records Y023–Y025 M43–M45 "Dropped/deferred"; plane-A crosswalk tracks it UNALLOCATED. Recommend promoting the drop into a current owner-decision entry. (Siblings CN6-4/5 lack even this and stay GAP.) |
| CN6-25 (240) | GAP | POWER_COMMON | `plane_a_bbia1_pin_crosswalk.csv:136` dispositions it OEM_POWER_OR_COMMON ("do not assign to signal I/O"); rail verification still required. |
| CON1-14 (OS) | GAP | DUPLICATE_PATH | Same conductor as CN4-6; gap is counted once at CN4-6/CN4-5 to avoid double-scoring. Underlying gap unchanged. |

---

## 2. THE GAP LIST — work this section

Every confirmed gap and the one unresolved unclear, one row each. ⚠ = safety-relevant (limits, interlocks, zero-speed). Rows sharing one closure task are grouped by the **Buzz-session** column so one cabinet visit clears several rows.

### 2.1 Confirmed gaps

| # | Pin | Wire | Signal | Why it's a gap | Action that closes it |
|---|---|---|---|---|---|
| 1 ⚠ | CN2-14 | +LTZ | Z-axis +over-travel | Crosswalk claims Z_LIMIT_PLUS but the authority row deliberately carries a blank BBIA end and §7.3 rules it UNRESOLVED (may be a combined +Y/+Z bus with CN6-12). Ferrule B-TB3-05 is on HOLD_DISPUTED_PIN. | De-energized buzz: CN2-14 → +Z limit switch, and separately → CN6-12 and the +Y switch. +Z-only ⇒ fill Z_LIMIT_PLUS dest fields (CN2/14/+LTZ), land on 7i84U-B TB3 IN4, release the hold. Both switches ⇒ it's a bus; owner decision on splitting before any landing. (Already on the punch list, `project_status.md:138`.) |
| 2 ⚠ | CN6-12 | +LYZ | +Y/+Z over-travel (bus?) | Other half of the same §7.3 dispute — no authority row, deliberately kept out until buzzed. | Same buzz session as row 1; record result in authority CSV + retire the contested crosswalk row. |
| 3 ⚠ | CN6-13 | −LYZ | −Y/−Z over-travel (bus?) | No landing anywhere; its Inside_Connec pointer (CN1-5) is provably wrong (that pin is the landed coolant-level circuit). Y_LIMIT_MINUS's BBIA end is still "NOT INDIVIDUALLY LOCATED". | Companion buzz in the same session: ring CN6-13 against the −Y and −Z limit switches (both ⇒ combined bus feeding Y_LIMIT_MINUS 7i84U-B TB3 IN3) and against CN1-5 to kill the bad pointer. Record in source_dest + authority. |
| 4 ⚠ | CN4-1 | 231 | Spindle zero speed | Landing exists (TB3 IN5, HAL bound) but §7.1 rules the conductor identity OPEN: the pinout independently carries CN3-4 = 143 ZERO SPEED, never explained away; the 08-09 reconciliation was paper-only. Ferrule A-TB3-06 is on HOLD_SOURCE_TRACE. Gear-shift interlock. | Jacket label read (no meter) at CN4-1 **and** CN3-4 (and CN11-13 while there, wire 231 reuse). Update SPINDLE_ZERO_SPEED dest/factory_wire with a TRACED note, close §7.1, release the ferrule hold before terminating IN5. |
| 5 ⚠ | CN3-4 | 143 | ZERO SPEED (rival reading) | The un-explained rival of row 4; if 143 is the true zero-speed conductor, the Mesa input is wired to the wrong circuit and CN3-4 is live and unlanded. | Settled by the same jacket read as row 4; whichever pin loses still needs its own disposition row. |
| 6 ⚠ | CN3-39 | 147 / −LZ2 | ATC Z zone vs oil-temp vs tool detector | Three-way OEM naming conflict (§7.2, UNRESOLVED); authority claims ATC_ZONE_Z (IN1) but the repo itself bars landing until buzzed. p84 re-read (08-18) added a third name and did **not** resolve it. | First check whether PRS-66 is even fitted (absent ⇒ moot, retire NOT_USED). If fitted: buzz CN3-39 → PRS-66 vs oil-temp sender; land or move ATC_ZONE_Z to the §3 exception list accordingly. Also fix the stale input-01 vs input-03 HAL note. |
| 7 ⚠ | CN3-44 | SPTD / +LY2 | ATC Y zone vs spindle timer/tool detector | Same §7.2 conflict, four candidate identities. Do-not-land hold active; leave IN0 unterminated at the field end. | Same session as row 6: verify PRS-55 fitted, then buzz CN3-44 → PRS-55. Confirm ⇒ LANDED; refute ⇒ pinout wins and SPTD/SPTDPRS identity must be dispositioned. |
| 8 ⚠ | CN3-3 | 142 | Tool-clamp interlock **or** door interlock ch. 2 | Two unreconciled identities (board: TOOL CLAMP INTERLOCK; pg133 ladder: MDINT.M door interlock). If it's MDINT.M, one channel of the dual-channel door interlock is live and unmonitored. No landing, no disposition. | Buzz CN3-3 / TB5-D2 1-02: if door-interlock ⇒ decide fold-into-series-chain vs land as second door channel per `interlocks_ladder_transcription.md`; if tool-clamp ⇒ allocate a Mesa input + authority row. Owner disposition entry either way, before power-up. |
| 9 | CN4-7 | SET1 | FR-SX READY handshake (drive arm) | **Spindle will not run until closed.** Drive accepts no FWD/REV/ORCM1 until SET1/SET2 completes; HAL net `spindle-drive-arm` exists but is UNBOUND — no Mesa pin, no decision (`atc_orient.hal:154`). Same circuit appears at CN3-10, CN6-9 (coil side), CON1-7/8 — all unlanded. | Verify at the drive (meter CON1-7/-8; confirm FR-SX vs DK-427 termination; Mitsubishi manual check) whether a discrete drive-arm is required. Required ⇒ allocate TB5 SSR OUT5 (last spare), bind `spindle-drive-arm`, add SPINDLE_DRIVE_ARM authority row (dest CN4-7/8 + CN6-9 coil side). Not required ⇒ explicit RETIRED disposition covering CN4-7/8, CN3-9/10, CN6-9, CON1-7/8. |
| 10 | CN4-8 | SET2 | READY handshake return | Pair conductor of row 9. | Closes with row 9 — one decision must cover both. |
| 11 | CN6-9 | SSET | Y092 SSET.M drive-arm coil side | Coil-side conductor of the same SSET relay; also gates axis-interlock outputs and ATC interlock words per the ladder. Nothing drives it today. | Closes with row 9 (must be dispositioned together). |
| 12 | CN4-5 | MS | Unidentified FR-SX node | Live 4-pin node (MS/OS/COM, two distinct outside conductors to TB5) whose function the repo never identifies. No landing, no disposition. Would contradict the SPINDLE_AT_SPEED "no discrete exists" note if it proves to be a speed contact. | Read FR-SX CON1 terminal definitions for MS/OS (manual / dwg 4143075403 p127); trace CN4-5 → TB5-D2 1-A2 and CN4-6 → TB5-14. Then land (authority row, reconciling SPINDLE_AT_SPEED) or retire — one decision naming all four node pins (CN4-5/6, CN3-8, CN6-51). |
| 13 | CN4-6 | OS | Unidentified FR-SX circuit (CON1-14 confirmed) | Plane-B-confirmed unbroken conductor to the drive; likely a speed/load-meter feed but that is a guess. Cleanest unclassified-live-circuit finding on the drive interface. | Closes with row 12 (same node). Ties to the open CNA10 load-meter item, `project_status.md:152`. |
| 14 | CN2-1 | 362 | Magazine timer (identity 3-way ambiguous) | Wire 362 appears at CN2-1/CN2-36/CN3-36 with conflicting names (magazine timer / mag lube timer / way-lube warning timer, WLWT relay confirmed on RC3A). §7.1 admits these pins are unclaimed. Live CA4-loom conductor. | Buzz all three 362 pins against each other, the CA4 loom (CA4-W/L), and the RC3A WLWT relay terminals. Then land the settled function(s) or record an owner retirement (timing reimplemented in LinuxCNC). |
| 15 | CN2-36 | 362 | Magazine lube timer | Same 362 tangle — cannot be absorbed as a duplicate until buzzed (wire-number reuse is documented; the "LUBE TIMER" label family is proven unreliable by the CN2-13 precedent). | Closes with row 14. If continuous with CN2-1/CN3-36 ⇒ DUPLICATE_PATH + allowlist entry; if distinct ⇒ land or retire. |
| 16 | CN2-2 | 351 | Magazine FWD/REV shifter | Not the circuit MAG_CW/CCW_SOL supersede (those replace CN11-1/2). Distinct live ATC conductor (CNQ-37 / CA4-V), no trace, no row, no retirement. | Trace CNQ-37 → CN2-2 → CA4-V to the device; land on a spare input or record RETIRED (superseded by LinuxCNC ATC sequencing), cap and label. |
| 17 | CN2-34 | 342 | Tool-measure device timer | Tool-measure stand switches are a self-admitted CSV gap (`io_map_research_notes.md:292`). "MMS arm is dropped" banner is not a ratified decision and concerns arm actuation, not this input. | Trace CNQ-34/CA4-J to the device; then owner decision naming CN2-34+35 explicitly: land both (if kept for tool-length routines) or RETIRED/capped (MP-3 + LinuxCNC replaces it). |
| 18 | CN2-35 | 345 | Tool-measure device switch | Same family as row 17; no row, no net, no decision. | Closes with row 17 — one decision covers the pair. |
| 19 | CN2-37 | 239 | Magazine lube pressure switch | LUBE_OK is the **head**-lube switch (PS-5/355) — different circuit. Magazine lube pressure has no landing and is on no deferred list. | Trace 239 via CA4-M to the switch; confirm fitted; then allocate a 7i84U-B input (A is full) with authority row + net `mag-lube-ok`, or record explicit retirement/deferral. |
| 20 | CN2-43 | 524 | Axis-selector switched 24 V feed | Operator-panel selector feed with no disposition; CN5-8 G24 cross-references it, so it may tie into 24 V distribution and be live from a non-NC source. | Owner decision retiring the OEM axis selector (pendant/UI replaces it), CYCLE_START_PB-style DEFERRED row; trace the blank CA4 outside pin and the CN5-8 cross-ref; verify dead before capping. |
| 21 | CN2-45 | CP24 | Feed-hold latch (panel) | No entry anywhere — unlike CYCLE_START_PB which is at least DEFERRED. Pendant feed-hold net is commented out, yet `first_move_plan.md` requires feed hold in the approved-window test. | Owner decision: land on a Mesa input netted to `halui.program.pause`, **or** retire the panel latch and uncomment/bind `whb.feed-hold` in `pendant_whb04b.hal` so the tested function exists. |
| 22 | CN3-35 | WLAL | Way-lube alarm (AL-54) | Way lube is separate from head lube; LUBE_OK covers head only (its own notes say so). Dashboard note is OPEN; not on any deferred list. Real alarm circuit, no channel. | Trace which device drives WLAL through TB5-D2; land on a spare DI with net `way-lube-alarm`, or explicitly defer it in the scope-decisions table (mist/work-light precedent). |
| 23 | CN5-9 | EFHD | External feed hold (remote box) | Strip-B conductor physically confirmed; only record is an archived OPTION_VERIFY question ("drop unless remote box wanted") — never answered. | Answer it: land on a spare input with a feed-hold net, or record DROP and cap at strip B. Complete the pending strip-B field-end trace either way. |
| 24 | CN5-10 | RCTLS | Recessing-tool L.S. | Option fitted/not-fitted never decided; ladder calls the recess path irrelevant *unless fitted*. No row, no net, no decision. | Physically verify the recessing option on this serial number. Not fitted ⇒ NOT_FITTED/RETIRED entry. Fitted ⇒ 7i84U-B input + authority row + net. |
| 25 | CN5-16 | 1NRAILS / INHRLS | Magazine rear L.S. **or** inhibit-read L.S. | Identity disputed between the pinout and the OEM p085 print (likely OCR variants); conductor physically on strip C. If a real magazine LS, the ATC ladder has no landed equivalent. | Label read at CN5-16 and the strip-C INHRLS terminal + ladder page 3 (X02F) to fix identity; then land on a 7i84U-B input or record explicit RETIRED — superseding the archive's uncited "Dropped/deferred". |
| 26 | CN6-4 | MA3T (M44T) | M-code output M44 | Element crosswalk demands "land on Mesa or consciously drop" — neither happened; archived "Dropped/deferred" note was never ratified. Also a transcription slip (pins 4 and 5 both read M45T; pin 4 is almost certainly M44T/Y024). Relay physically on RC3A. | Re-shoot/trace the RC3A M-relay bank (wires 3-48/3-49/3-45); then one owner decision for M43/M44/M45 together: allocate 7i84U-B outputs + remaps, or record dated RETIRED with do-not-restore clause (X078-style). Fix the M44T pinout row by jacket read. |
| 27 | CN6-5 | MA3T (M45T) | M-code output M45 | Same family as row 26 — no landing, review-flag only. | Closes with row 26. |
| 28 | CN6-18 | TAPC | Tap coolant conductor | The NOT_USED decision retired only the Mesa output/RLY-7; its own notes say twice "TAPC remains on CN6-18 → CNB-46, untraced". Last unresolved device path (`project_status.md:190`). | Trace TAPC to CNB-46; if it dead-ends ⇒ RETIRED, cap, log; if a live device is found ⇒ revisit the OUT5/RLY-7 NOT_USED status. |
| 29 | CN6-24 | 241 | Power-on / main-lamp interlock | Sits in the OEM power-on cluster (CN6-20/21/24/25) but was never named a §3a exception; its documented inside routing (CN2-23) is provably broken. Plane-A "OEM_POWER_OR_COMMON" tag is machine-inherited, and 241 is a numbered relay-card conductor, not a rail. | Trace wires 241/240 in the power-on cluster; then either add a named §3a entry (stays OEM power sequencing) or record RETIRED (dies with the Mazatrol, Y090 PWI precedent) and cap. Correct the pinout row's routing. |
| 30 | CN6-34 | NSFT | NG TOOL (ATC status) | No row, no net, no crosswalk, no element mapping, no ladder mention. ATC is in scope, so an unlanded ATC status conductor is exactly the hunted failure mode. | Determine direction/function from the OEM CN6 sheet + M-1 connector-2 pin table (or trace at the relay card). NC-driven indication ⇒ RETIRED (LinuxCNC UI provides it). Field-originated status ⇒ spare DI + authority row + net into `mazak_atc.comp`, fold into the D13 hazard analysis. |
| 31 | CN11-11 | 235 | Dust inhale eliminate (SOL-35) | §5 says outright SOL-35 "belongs to no current row", and its item 4 forbids treating "not on the head" as "does not exist". The demanded land-or-drop for Y015 WAB2.M never happened; stale RLY-6/SOL-35 wiring instructions remain in project_status. | Trace 435 from the solenoid bank / follow the dust plumbing. Fitted & wanted ⇒ 7i84U-B output + interposing relay + authority row/net. Absent or dropped ⇒ NOT_USED entry (MIST_COOLANT precedent), cap, and purge the stale instructions at `project_status.md:317,371`. |
| 32 | CN11-12 | 236 | Oil-hole (through-tool) coolant (SOL-36) | Same §5 situation as row 31 — never received the RESERVED/NOT_USED disposition its siblings got. Aggravator: wire 236 also rides the **landed** COOLANT_ON row (CN11-15), duplication unresolved. | Trace 736 into the CB panel to find whether SOL-36 exists; record NOT_FITTED/RESERVED or allocate (consult io capacity first). **And** resolve the 236 duplication at the terminal unit — COOLANT_ON's factory_wire depends on it. |
| — | CON1-7/8 | SET1/SET2 | Drive-side end of rows 9–11 | Same conductor as CN4-7/8; listed so the drive end isn't forgotten during the cabinet visit. Counted once. | Closes with rows 9–11. |

### 2.2 Still unclear

| Pin | Wire | Signal | Why unclear | Action |
|---|---|---|---|---|
| CON1-24 | CTM | Unknown FR-SX terminal | Drawn dashed on the print with no arrow to CN3/CN4 — not even established as field-wired, so it can be neither a gap nor dispositioned. Stale "FR-SX CTM" RECON note on the SPINDLE_ORIENT_CMD row is unreconciled (off-by-one risk on the orient-command drive termination). | Open FR-SX CON1: meter pin 24 for a terminated conductor; get the Mitsubishi terminal definition for CTM. Unwired ⇒ record an explicit N.C. disposition (CNA1 precedent). Wired ⇒ trace and disposition. Same visit: confirm the orient command really terminates at ORC1/CON1-25. |

### 2.3 Suggested work sequence (one cabinet session covers most of it)

1. **Limits/interlocks buzz-out** (machine de-energized): rows 1–3 (±LYZ/CN2-14), 8 (wire 142), 25 (INHRLS). 
2. **Jacket reads**: rows 4–5 (231 vs 143), 26 fix (M44T), 14–15 (the three 362 pins). 
3. **PRS fitted-check then buzz**: rows 6–7 (PRS-55/66). 
4. **FR-SX visit**: rows 9–13 + CON1-24 (SET1/SET2 requirement, MS/OS identity, CTM). Spindle cannot be armed until row 9 closes. 
5. **Device traces**: rows 16–24, 28–32 (CA4 loom, TB5-D2, strip B, RC3A, SSR/CB panel). 
6. **Paper-only closures** (no meter needed): rows 20–21 owner decisions; ratify the CN6-3 M43 drop; add CN5-5 EMC to the §3 E-stop list; fix the 4-axis retire note's CN2→CN5 citation.

### 2.4 Landed-but-caveated (not gaps — commissioning holds to carry)

| Pin | Circuit | Caveat |
|---|---|---|
| CN1-5 | COOLANT_LOW | CANDIDATE grade only — polarity/normal-state unverified; cheap buzz-out recommended (§7.3 shows the Inside_Connec pairing is fallible). |
| CN1-14 | Z_HOME | Continuity + fail-open test owed before TRACED promotion. |
| CN2-8 | MAG_BCD_BIT4 | "Pos 10" doesn't fit clean binary weighting — confirm bit order. |
| CN2-44 | MANUAL_TOOL_CLAMP_PB | RESERVED: terminal assigned, intentionally HAL-unbound until switch behavior field-verified. |
| CN2-42/CN6-50 | SPINDLE_TOOL_AVAILABLE | Pin choice still CANDIDATE; wire 382 in the reuse table — confirm CN2-42↔CN6-50 continuity. |
| CN4-16/17 | SPINDLE_ORIENT_ARRIVAL | LOW CONFIDENCE — field-verify OBA1/OBA2 vs SETA/SETB labeling. |
| CN4-20 | SPINDLE_SPEED_CMD (SE3) | Trace rated PLAUSIBLE only — verify signal vs return/shield role; confirm unipolar 0–10 V scaling. |
| CN11-1/2 | MAG_CW/CCW_SOL | COMMISSIONING_PENDING — bench-verify rotation direction before energizing. |
| CN11-7 | WORK_AIR_BLAST | RESERVED, HAL-unbound until RLY-6 fitted and wire confirmed. |
| CN11-14 | MAG_COVER_CLOSE_SOL | PROPOSED only — valve identity/coil voltage/relay topology untraced. |
| CNA3/4/5-6/2 | ±12 V tach supply | Post-retrofit source of the ±12 V rail undocumented — a dead rail means a TRA drive with no velocity feedback; verify before first servo enable. |
| CN7 loom @ TB6 | 2PC isolation | "Physically isolate if fitted" must be verified executed at TB6 before power-on (axis interlocks and external cycle-start conductors live there; +24V/0G rails stay energized unless the loom is lifted). |
| SP16–19, CN2-39/46/47, CN5-11/12/17/18 | Factory spares with real conductors | Unlike CN8, these are cabled — positively identify, verify dead, cap at teardown. |

---

## 3. Per-connector disposition tables

### CN1 (BBIA-1 bottom row, MR-20RMW — 13 wire-carrying; pins 8–13, 19 blank)

| Pin | Wire | Signal | Cls | Landing / reason |
|---|---|---|---|---|
| CN1-1 | 208 | Tool unclamp conf (PRS-8) | LANDED | 7i84U-A TB2 IN16, net `tool-unclamped` |
| CN1-2 | 209 | Tool clamp conf (PRS-9) | LANDED | 7i84U-A TB3 IN15, net `tool-clamped` |
| CN1-3 | 210 | High gear conf (PRS-10) | LANDED | 7i84U-A TB2 IN17, net `gear-hi-conf` |
| CN1-4 | 212 | Low gear conf (PRS-12) | LANDED | 7i84U-A TB2 IN18, net `gear-lo-conf` |
| CN1-5 | 232 | Coolant level | LANDED | 7i84U-A TB2 IN26, net `coolant-low` — CANDIDATE grade, see §2.4 |
| CN1-6 | 233 | Head lube pressure | DUPLICATE_PATH | Primary CN6-39 (LUBE_OK); one physical PS-5 switch, owner-confirmed |
| CN1-7 | 0G | 24 V com (−) | POWER_COMMON | OEM rail |
| CN1-14 | *DECZ | Z home dec (LS-62) | LANDED | 7i84U-B TB3 IN8, net `home-z` — continuity test owed |
| CN1-15..18 | SP16–SP19 | Factory spares | RETIRED_OOS | Never assigned; conductors exist in CA3 loom — cap, verify dead |
| CN1-20 | +24V | +24 V com (MC) | POWER_COMMON | OEM rail |

### CN2 (36 wire-carrying; 20, 22–33, 48 blank)

| Pin | Wire | Signal | Cls | Landing / reason |
|---|---|---|---|---|
| CN2-1 | 362 | Magazine timer | **GAP** | §2.1 row 14 |
| CN2-2 | 351 | Mag FWD/REV shifter | **GAP** | §2.1 row 16 |
| CN2-3 | 149 | Tool unclamp (foot sw) | LANDED | 7i84U-A TB3 IN9, net `manual-unclamp-pb` |
| CN2-4..8 | 150/221/222/223/224 | Mag BCD bits 0–4 | LANDED | 7i84U-A TB2 IN19–23 (bit-4 weighting caveat, §2.4) |
| CN2-9 | 225 | Magazine position OK | LANDED | 7i84U-A TB2 IN28, net `mag-in-pos` |
| CN2-10 | 218 | Mag power open | DUPLICATE_PATH | Same wire as CN2-11 (primary) |
| CN2-11 | 218 | Mag cover open (RS-18) | LANDED | 7i84U-A TB3 IN6, net `mag-cover-open-conf` |
| CN2-12 | 219 | Mag cover close (RS-19) | LANDED | 7i84U-A TB3 IN7 (label mismatch resolved 08-10) |
| CN2-13 | 381 | Tool detector PHS-181 | LANDED | 7i84U-A TB3 IN2, net `mag-tool-available` (board label "LUBE TIMER" proven wrong) |
| CN2-14 | +LTZ | Z +over-travel | **GAP** ⚠ | §2.1 row 1 (contested, §7.3) |
| CN2-15 | *DECX | X home dec (LS-42) | LANDED | 7i84U-B TB3 IN6, net `home-x` |
| CN2-16 | *DECY | Y home dec (LS-52) | LANDED | 7i84U-B TB3 IN7, net `home-y` |
| CN2-17/18/19 | 0G | 24 V com | POWER_COMMON | Rails |
| CN2-21 | P24 | +24 V machine | POWER_COMMON | Rail |
| CN2-34 | 342 | Tool-measure timer | **GAP** | §2.1 row 17 |
| CN2-35 | 345 | Tool-measure switch | **GAP** | §2.1 row 18 |
| CN2-36 | 362 | Magazine lube timer | **GAP** | §2.1 row 15 |
| CN2-37 | 239 | Mag lube pressure sw | **GAP** | §2.1 row 19 |
| CN2-38 | 238 | Machine door interlock | LANDED | 7i84U-A TB2 IN24, net `door-interlock` (mirrored CN6-23) |
| CN2-39 | 340 | Spare input 2 | RETIRED_OOS | Factory spare; CA4-S populated — verify dead |
| CN2-40 | EHB | E-stop | SAFETY_CHAIN | OEM chain, owner decision 2026-08-15 |
| CN2-41 | EMC | E-stop 2nd | SAFETY_CHAIN | OEM chain (§3 names it) |
| CN2-42 | 382 | Spindle tool clamp OK | DUPLICATE_PATH | Primary CN6-50; confirm board-internal link |
| CN2-43 | 524 | Axis-selector 24 V feed | **GAP** | §2.1 row 20 |
| CN2-44 | 149B | Foot switch (clamp) | LANDED | 7i84U-A TB2 IN30 — RESERVED/unbound, §2.4 |
| CN2-45 | CP24 | Feed-hold latch | **GAP** | §2.1 row 21 |
| CN2-46/47 | SP29/SP30 | Spare outputs | RETIRED_OOS | Factory spares; CA4-j/k populated — verify dead |
| CN2-49/50 | +24V | +24 V NC | POWER_COMMON | Rails |

### CN3 (24 populated rows; pin 13 SPARE-no-wire and 25 blanks skipped; 50/50 accounted per p84 re-read)

| Pin | Wire | Signal | Cls | Landing / reason |
|---|---|---|---|---|
| CN3-1 | EHB | E-stop (*ESP) | SAFETY_CHAIN | OEM MAR/EMS/OTR chain; ESTOP_MONITOR deferred, fails safe |
| CN3-2 | 147 | Head lube pressure | DUPLICATE_PATH | Primary CN6-39 (LUBE_OK/PS-5); TB5 branch stays OEM; 147↔355 renumber inferred, not buzzed |
| CN3-3 | 142 | Tool-clamp / door interlock? | **GAP** ⚠ | §2.1 row 8 |
| CN3-4 | 143 | Zero speed (rival) | **GAP** ⚠ | §2.1 row 5 |
| CN3-8 | NO | COM | POWER_COMMON | Common (links CN6-51) |
| CN3-9/10 | SET2/SET1 | Spindle SET pair | DUPLICATE_PATH | Internal straps to CN4-8/7 (primary — which are themselves GAP rows 9–10) |
| CN3-11/12 | SRN/SRI | Spindle fwd/rev | DUPLICATE_PATH | Parallel of CN4-9/10 (primary, landed) |
| CN3-14 | ORI C1 | Orient command | LANDED | 7i84U-A TB3 OUT4, net `spindle-orient-cmd` (continues internally to CN4-12) |
| CN3-15 | CTL | Orient low-gear | LANDED | 7i84U-A TB3 OUT5, net `orient-lo-gear` (continues to CN4-13) |
| CN3-33 | COM | Common (DECEL/CTL) | POWER_COMMON | Strapped to CN4-15 |
| CN3-35 | WLAL | Way-lube alarm | **GAP** | §2.1 row 22 |
| CN3-36 | 362 | Mag timer / way-lube warn timer | DUPLICATE_PATH | Internal link to CN2-1 (primary — GAP row 14); p84 naming divergence carries to primary |
| CN3-37 | +LY | +Y over-travel | LANDED | 7i84U-B TB3 IN2, net `limit-y-plus` (NC via `input-02-not`) |
| CN3-38 | −LZ | −Z over-travel | LANDED | 7i84U-B TB3 IN5, net `limit-z-minus` |
| CN3-39 | 147/−LZ2 | Disputed (§7.2) | **GAP** ⚠ | §2.1 row 6 |
| CN3-40..43 | SP1–SP4 | Factory spares | RETIRED_OOS | No function; CN3 50/50 accounted |
| CN3-44 | SPTD/+LY2 | Disputed (§7.2) | **GAP** ⚠ | §2.1 row 7 |
| CN3-49/50 | +24V | +24 V | POWER_COMMON | OEM rails; P24/G24 never enter 7i84U field power |

### CN4 (FR-SX interface, 18 wire-carrying; 11 and 14 not used)

| Pin | Wire | Signal | Cls | Landing / reason |
|---|---|---|---|---|
| CN4-1 | 231 | Spindle zero speed | **GAP** ⚠ | §2.1 row 4 (landing contested, §7.1 OPEN) |
| CN4-2 | SS2 | Zero-speed return | POWER_COMMON | Contact-pair common |
| CN4-3 | FA | Drive fault | LANDED | 7i84U-A TB3 IN14, net `spindle-fault` |
| CN4-4 | FC | Fault return | POWER_COMMON | Counted with CN4-3 |
| CN4-5 | MS | Unidentified | **GAP** | §2.1 row 12 |
| CN4-6 | OS | Unidentified (CON1-14) | **GAP** | §2.1 row 13 |
| CN4-7 | SET1 | READY handshake | **GAP** | §2.1 row 9 |
| CN4-8 | SET2 | READY handshake | **GAP** | §2.1 row 10 |
| CN4-9 | SRN | Spindle forward | LANDED | 7i84U-A TB3 OUT0, net `spindle-fwd` |
| CN4-10 | SRI | Spindle reverse | LANDED | 7i84U-A TB3 OUT1, net `spindle-rev` |
| CN4-12/13 | ORI C1/CTL | Orient cmd / low-gear | DUPLICATE_PATH | Internal continuations of CN3-14/15 (primary, landed) |
| CN4-15 | COM | Common | POWER_COMMON | Links CN3-33 |
| CN4-16 | SETA | Orient arrival (OBA1) | LANDED | 7i84U-A TB3 IN4, net `spindle-oriented` — LOW CONFIDENCE labeling, §2.4 |
| CN4-17 | SETB | Orient arrival return | DUPLICATE_PATH | Pair counted at CN4-16 |
| CN4-18/19/20 | SE1/SE2/SE3 | 0–10 V speed reference | LANDED | 7i49 P1 AOUT3, net `spindle-speed-cmd` — SE3 role + scaling to verify, §2.4 |

Note: the "(EMERGENCY STOP)" text in the CN4 box has no traced pin on either end — ESP1/ESP2 dead-end in a jumper below CON1, consistent with E-stop staying 100% OEM.

### CN5 (20/20 wire-carrying)

| Pin | Wire | Signal | Cls | Landing / reason |
|---|---|---|---|---|
| CN5-1 | 144 | External trip protector | LANDED | 7i84U-A TB3 IN8, net `thermal-alarm` (series with CN5-3) |
| CN5-2 | RST | Reset out | RETIRED_OOS | NC-panel handshake, obsolete with M-2 (archived crosswalk — record in a current doc) |
| CN5-3 | 146 | OHT.A transformer overheat | LANDED | Series partner of CN5-1 on IN8 |
| CN5-4 | EMB | E-stop | SAFETY_CHAIN | OEM chain |
| CN5-5 | EMC | E-stop 2nd | SAFETY_CHAIN | OEM chain — **add to §3 exhaustive pin list** (currently omitted) |
| CN5-6/7 | 0G | −COM (DC) | POWER_COMMON | Rails |
| CN5-8 | G24 | −COM (AC) | POWER_COMMON | AC-side common; power stays 100% OEM |
| CN5-9 | EFHD | External feed hold | **GAP** | §2.1 row 23 |
| CN5-10 | RCTLS | Recessing-tool L.S. | **GAP** | §2.1 row 24 |
| CN5-11/12 | ISP1/ISP2 | NC spare inputs | RETIRED_OOS | Spare family; cabled to TB1 — field-verify unused |
| CN5-13/14/15 | ISP1(dup)/XYZR4/152 | 4th-axis interlock-cancel group | RETIRED_OOS | 4th axis not fitted; retire note's "on CN2" citation should be amended to CN5-13..15; isolate the interlock-defeat conductor dead |
| CN5-16 | 1NRAILS/INHRLS | Disputed identity | **GAP** | §2.1 row 25 |
| CN5-17/18 | OSP1/OSP2 | NC spare outputs | RETIRED_OOS | Spare family; field-verify unused |
| CN5-19/20 | +24V | +COM (DC) | POWER_COMMON | Rails |

### CN6 (MR-50RMW, 36 wire-carrying; 14 not-used pins skipped)

| Pin | Wire | Signal | Cls | Landing / reason |
|---|---|---|---|---|
| CN6-1/2 | CYFIN | Cycle finish lamp ×2 | RETIRED_OOS | NC_PANEL_INTERFACE, obsolete with M-2 |
| CN6-3 | MA3T | M43T output | RETIRED_OOS | Reclassified (§ scoreboard): archived drop of Y023–Y025 — ratify in a current owner decision |
| CN6-4 | MA3T | M44T output (transcribed M45T) | **GAP** | §2.1 row 26 |
| CN6-5 | MA3T | M45T output | **GAP** | §2.1 row 27 |
| CN6-7 | SA | Servo ready | LANDED | 7i84U-A TB2 IN31, net `servo-ready` |
| CN6-8 | WL | Work light | RETIRED_OOS | Deferred by owner scope decision; OUT9 RESERVED for future RLY-8 |
| CN6-9 | SSET | Drive-arm permissive coil | **GAP** | §2.1 row 11 |
| CN6-10 | CTL | Low-gear orient (relay leg) | DUPLICATE_PATH | Primary CN3-15 |
| CN6-11 | OTR | Over-travel release | SAFETY_CHAIN | OEM MAR/EMS/OTR chain |
| CN6-12 | +LYZ | +Y/+Z over-travel | **GAP** ⚠ | §2.1 row 2 |
| CN6-13 | −LYZ | −Y/−Z over-travel | **GAP** ⚠ | §2.1 row 3 |
| CN6-17 | +24V | +24 V distribution | POWER_COMMON | Rail |
| CN6-18 | TAPC | Tap coolant | **GAP** | §2.1 row 28 |
| CN6-19 | MMAL | Machine malfunction | RETIRED_OOS | ALARM_OUT OUT15 RESERVED — consciously deferred |
| CN6-20 | PW1 | Power on (Y090) | RETIRED_OOS | Obsolete with M-2; LinuxCNC machine-on state |
| CN6-21 | P24 | Main panel power | POWER_COMMON | Rail |
| CN6-23 | 238 | Door interlock mirror | DUPLICATE_PATH | Primary CN2-38 |
| CN6-24 | 241 | Power-on/main-lamp interlock | **GAP** | §2.1 row 29 |
| CN6-25 | 240 | Main lamp interlock 2 | POWER_COMMON | Reclassified: OEM_POWER_OR_COMMON per plane-A crosswalk; rail verification still owed |
| CN6-26 | ES1 | Zero speed (relay leg) | DUPLICATE_PATH | Primary CN4-1 (itself GAP row 4 — caveat rides along) |
| CN6-27 | SER | Servo error (combined) | LANDED | 7i84U-A TB3 IN10, net `servo-fault` |
| CN6-28 | SRV | Spindle reverse relay leg | DUPLICATE_PATH | Primary CN4-10 |
| CN6-29 | SMR | Spindle motor run | LANDED | Functionally replaced by SPINDLE_ENABLE OUT2 (FR-SX RUN direct); OEM coil leg abandoned |
| CN6-30 | ORCH1 | Orient/run command relay leg | DUPLICATE_PATH | Primary CN3-14; "RUN COMMAND" label vs ORC1 mnemonic — field check |
| CN6-33 | TCME | ATC barrier (Y095) | LANDED | 7i84U-B TB3 OUT6, net `atc-barrier` — verify device exists on SN 060231 |
| CN6-34 | NSFT | NG TOOL | **GAP** | §2.1 row 30 |
| CN6-37 | 381 | Tool detector mirror | DUPLICATE_PATH | Primary CN2-13 |
| CN6-39 | 355 | Head lube PS-5 | LANDED | 7i84U-A TB2 IN25, net `lube-ok` — physically confirmed |
| CN6-41..44, 46, 47 | 0G | 24 V commons ×6 | POWER_COMMON | Rails |
| CN6-50 | 382 | Spindle tool detector PHS-182 | LANDED | 7i84U-A TB3 IN3, net `spindle-tool-avail` — pin choice CANDIDATE, §2.4 |

### CN7 (2PC pallet changer, 50/50 — all identified, all dispositioned)

| Pins | Wires | Signals | Cls | Reason |
|---|---|---|---|---|
| 1–16, 19–48 (46 pins) | MF, M11–M38, ZPX/Y/Z/4/Z2, MFA, FHDL, AUTM, PUCCD/PCLCD, FHDPB/CSTPB/CSTL, ISP3/OSP3/OSP4, MRDY, RST, P1ON/P2ON, EXFIN/EXRST/EXAL/EXCST/EXFHD/EXSBK, INTX/Y/Z/4, ONLN, ENCOL, EMOP1 | Pallet M-codes, handshakes, station controls, axis interlocks, FMS status | RETIRED_OOS | 2PC pallet changer out of retrofit scope (owner decision; `io_capacity_reconciliation.md` L90, `project_status.md` L182). Every wire identified to TB6. **Verify physical isolation at TB6 before power-on** — set includes axis interlocks and external cycle-start/feed-hold inputs (§2.4). |
| 17, 18, 49, 50 | 0G ×2, +24V ×2 | Supply rails to TB6 | POWER_COMMON | Rails stay energized unless loom lifted |

### CN8 (never cabled — 49 populated positions, pin 48 unpopulated)

| Pins | Wires | Cls | Reason |
|---|---|---|---|
| 1–20, 23–47 (45 pins) | ISP4–ISP22, OSP5–OSP30 | RETIRED_OOS | Entirely NC spare I/O, never cabled out (`project_status.md:149`); Outside_Connec empty on every pin — no field circuit exists |
| 21, 22, 49, 50 | +24 ×2, 0G ×2 | POWER_COMMON | Uncabled rail stubs |

### CN11 / CN11-SSR / CN12 (solenoid/SSR looms — 45 wire-carrying)

| Pin | Wire | Signal | Cls | Landing / reason |
|---|---|---|---|---|
| CN11-1 | 208B | Magazine CW (SOL-8B) | LANDED | 7i84U-A TB2 OUT13, net `mag-cw-sol` — direction verify pending |
| CN11-2 | 208A | Magazine CCW (SOL-8A) | LANDED | 7i84U-A TB2 OUT14, net `mag-ccw-sol` — same hold |
| CN11-3 | 710 | Tool unclamp (SOL-10) | LANDED | 7i84U-A TB2 OUT10, net `tool-unclamp-sol` — confirmed 08-13 |
| CN11-4 | 712 | Gear high (SOL-12) | LANDED | 7i84U-A TB3 OUT7, net `gear-hi-sol` |
| CN11-5 | 213 | Gear low (SOL-13) | LANDED | 7i84U-A TB2 OUT8, net `gear-lo-sol` |
| CN11-6 | 215 | Spindle air blast (SOL-15) | LANDED | 7i84U-B TB3 OUT3, net `air-blast` |
| CN11-7 | 216 | Work air blast (SOL-16) | LANDED | 7i84U-B TB3 OUT4 — RESERVED/unbound until RLY-6 fitted, §2.4 |
| CN11-8 | 217 | Mist coolant | RETIRED_OOS | Eliminated by owner 2026-08-09 (no mist system); OUT12 freed |
| CN11-9 | 262 | MMS arm extend (SOL-62) | RETIRED_OOS | MMS arm dropped; MP-3 + tool-length routine replaces it |
| CN11-10 | 261 | Air jet (SOL-61) | RETIRED_OOS | SOL-61 not fitted (owner, 08-13); served the dropped MMS sensor |
| CN11-11 | 235 | Dust inhale (SOL-35) | **GAP** | §2.1 row 31 |
| CN11-12 | 236 | Oil hole (SOL-36) | **GAP** | §2.1 row 32 |
| CN11-13 | 231 | Flood valve (Y011 FCL) | LANDED | 7i84U-B TB3 OUT7, net `flood-valve` (231 reuse allowlisted) |
| CN11-14 | 227 | Mag cover close | LANDED | 7i84U-B TB2 OUT8 — PROPOSED only, §2.4 |
| CN11-15 | 236 | Flood pump starter | LANDED | 7i84U-A TB2 OUT11, net `flood-coolant` |
| CN11-16 | 235 | Hyd + head-lube pump (Y096) | LANDED | 7i84U-A TB3 OUT3, net `hyd-pump-on` |
| CN11-19/20 | 0G | Commons | POWER_COMMON | Rails |
| CN11-SSR-1..16 | 708B…835 | SSR-board mirror | DUPLICATE_PATH | Pin-for-pin mirror of CN11-1..16 (wire renumber +500/+600 per §7.1); counted at CN11 primaries |
| CN11-SSR-19/20 | 0G | Commons | POWER_COMMON | Same rail, SSR end |
| CN12-1..9 | 722A…787B | 2PC pallet outputs | RETIRED_OOS | CN12 confirmed pallet-changer-only; 2PC out of scope |

### Plane B (axis resolvers + FR-SX drive)

| Pins | Wire | Signal | Cls | Landing / reason |
|---|---|---|---|---|
| CNA3-12/13, 14/15, 16/17 | A/B, F/G, H/J | X resolver SIN/COS/excitation | LANDED | 7i49 P1 RES0 (RESSIN/RESCOS/RESDRV), net `x-pos-fb`; 7i49 must be sole excitation source |
| CNA4- same | 〃 | Y resolver | LANDED | 7i49 RES1, net `y-pos-fb` |
| CNA5- same | 〃 | Z resolver | LANDED | 7i49 RES2, net `z-pos-fb` |
| CNA3/4/5-19/18 | L/K | Tachogenerator | RETIRED_OOS | Stays TRA drive velocity feedback, never a LinuxCNC input — leave isolated at 7i49 end |
| CNA3/4/5-6/2 | P/S | ±12 V tach supply | POWER_COMMON | OEM rail — post-retrofit source unverified, §2.4 |
| CNA3/4/5-1/7, -20 | R, N | Grounds / shield | POWER_COMMON | Measured 0 Ω 2026-08-16; shields re-terminate at 7i49 end only |
| CON1-3/4, 11/12, 22/23, 45, 46, 25, 27 | ES/FA/OBA/SRN/SRI/ORC1/CTL | Drive discretes | DUPLICATE_PATH | Counted at CN4-1/2, CN4-3/4, CN4-16/17, CN4-9, CN4-10, CN3-14, CN3-15 |
| CON1-26 | ORC2 | Orient return | POWER_COMMON | COM rail (CN4-15/CN3-33) |
| CON1-7/8 | SET1/SET2 | READY handshake | **GAP** | Drive-side end of §2.1 rows 9–10 (counted once at CN4-7/8) |
| CON1-14 | OS | Unidentified | DUPLICATE_PATH | Reclassified — counted at CN4-6 (GAP row 13) |
| CON1-31/32/30 | SE1/SE2/SE3 | 0–10 V speed ref | LANDED | 7i49 AOUT3, net `spindle-speed-cmd` |
| CON1-17/18 | ESP1/ESP2 | Drive E-stop input | SAFETY_CHAIN | Jumpered/dead-ended below CON1; E-stop 100% OEM — documentation-completeness note only |
| CON1-24 | CTM | Unknown | **UNCLEAR** | §2.2 |
| CON2 (PLG pins) + OHS1/2 | — | Motor PLG feedback, motor thermal | RETIRED_OOS | Drive-internal; owner decision 2026-08-12: LinuxCNC does not read spindle position; do not parallel-tap |
| CNA / CNAA | — | Orient-encoder feedback (diff / single-ended) | RETIRED_OOS | Orient is FR-SX-internal; which connector is populated is an open capture item but both dispositions are identical |
| CNA1 | — | SX-IO1 | — | Confirmed N.C./spare on this revision — no wire-carrying pins |

---

## 4. What this audit does NOT prove

This is a **paper classification, not an electrical verification**. Specifically:

1. **No continuity was measured.** Every LANDED and DUPLICATE_PATH call rests on drawings, the pinout transcription, the authority CSV, and dated reconciliation notes — not on a meter. The pinout's `Inside_Connec` column is demonstrably fallible (two proven bad pointers: CN6-13→CN1-5, CN6-24→CN2-23), and OEM per-segment wire renumbering means matching wire numbers do not prove one conductor and differing numbers do not prove two.
2. **Active §7.x disputes still bar landing specific pins until buzzed at the board**, regardless of what any row claims: §7.1 (CN4-1 vs CN3-4 zero-speed identity — do not terminate IN5; ferrule A-TB3-06 on HOLD_SOURCE_TRACE), §7.2 (CN3-39 and CN3-44 — "do not land either conductor on a Mesa input until the pin is buzzed"; leave IN0/IN1 field ends open), §7.3 (CN2-14/CN6-12/CN6-13 over-travel — ferrule B-TB3-05 on HOLD_DISPUTED_PIN).
3. **"LANDED" does not mean "commissioned."** The caveated rows in §2.4 (CANDIDATE grades, RESERVED/PROPOSED statuses, unverified polarities, bit ordering, rotation directions, analog scaling, the ±12 V tach rail) each carry their own pre-power or pre-motion check.
4. **RETIRED_OOS conductors are not proven dead.** Factory spares with populated loom positions (CA3/CA4, CN5/CN7 spares), the CN7 loom at TB6, and the 4th-axis interlock-cancel wires must be positively identified, verified de-energized, and capped at teardown — a paper retirement does not de-energize copper.
5. **Blank-pin claims inherit the transcription.** "Not used" pins were skipped on the strength of the pinout CSV / drawing reads (some at OCR quality); a pin absent from the transcription was not independently confirmed empty at the physical connector.
6. **Safety chain conductors were classified, not validated.** The E-stop/MAR/EMS/OTR chain's own integrity is outside this audit's scope (see `docs/estop_safety_chain.md`), and one documentation debt was found: CN5-5 (EMC) is missing from INTERFACE_ARCHITECTURE §3's exhaustive-by-intent pin list.

Sources of record: `wiring/bbia1_cn_pinouts.csv`/`.md`, `mesa/current_pin_authority.csv`, `wiring/bbia1_source_dest.csv`, `wiring/bbia1_retrofit_destination_crosswalk.csv`, `wiring/plane_a_bbia1_pin_crosswalk.csv`, `wiring/connector_crossref.md`, `wiring/authority_conflicts.md`, `wiring/nc_connector_inventory.md`, `INTERFACE_ARCHITECTURE.md`, `docs/project_status.md`, `docs/io_capacity_reconciliation.md`, `linuxcnc/field_7i84u.hal`, `linuxcnc/atc_orient.hal`, ladder transcriptions under `docs/ladder/`, and the archived `archive/crosswalk/element_dashboard_crosswalk.csv` (historical evidence only, never treated as current authority).