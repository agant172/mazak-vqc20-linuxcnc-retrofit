# LinuxCNC config audit — 2026-09-03/04

> **ROLE: AUDIT RECORD + DECISION QUEUE** — findings of the Fable 5 six-domain
> audit of `linuxcnc/` + `tests/hal/` against the CORRECTED ladder
> transcriptions, `parameters_sn060231.md`, and the pin authority. Comment/test
> fixes and one load-blocking bug landed in `8ec25f7`…`c72fe90`. Group 1
> (crash-class, items 1–5) fully applied 2026-09-04. Group 2/3: items 6, 7,
> 8, 9a, 9b, 10, 11c, 12a, 13A, 13B, 14, 15, 16a, 16d applied 2026-09-04
> (10-agent research workflow classified every remaining item; safe-to-apply
> and owner-directed ones landed same day, across two concurrent sessions
> working this repo — see items 9b/10/14/16a for the coordination notes).
> Still open, all genuine owner decisions or bench-data gates: 11a
> (bless-only), 11b, 11d, 12b, 13C, 13D, 16b, 16c. Harness green at HEAD
> (12 scenarios / 410 checks / 0 failed, LinuxCNC box 2026-09-04).

## Scorecard

| Domain | Verdict |
|---|---|
| mazak_orient.comp | Annotations accurate; gear-solenoid topology, shift_pending, ORCM1/SOME2 all **FIXED 2026-09-04** (items 5/6/7) — 2 open (11a bless-only, 11d architecture) |
| mazak_atc.comp | Confirmation/alarm/clamp core faithful; **MROT deadlock FIXED**, manual seal-leg #TCME hole **FIXED** (11c), no-tool guard + return-pot staging **FIXED** (9b/10); pot 20 unreachable **FIXED** (8) — 1 open (11b, bench-gated) |
| toolchange.ngc | Pin protocol/timeouts/abort/dry-run clean; step geometry **FIXED** (1/4); finish-clear ordering **FIXED** (9a); no-tool guard + return-pot staging **FIXED** (9b/10, bench-verify the new rotation window before trusting live) |
| HAL topology | Nets/loadrt/addf near-perfect; load-blocking pin-double-link **FIXED**; and2.7 ordering **FIXED** (16d) + new data-driven validator check; IN13 up-to-speed source identified **FIXED** (16a) — 2 open (16b/c) |
| INI | Limits/REF/divisor/remap verified; spindle top speed **FIXED** (12a), VOLATILE_HOME + ZC latch-vel **FIXED** (13A/B), ORIENT_TIMEOUT **FIXED** (15), BACKLASH held at 0 **DECIDED** (14) — 2 open (12b, 13C bench-gated) |
| Test harness | Mechanics sound, suite genuinely green (410 checks/0 failed); stale ladder citations re-flagged; 0-checks silent-pass bug FIXED; new pin-execution-order check added |

## Applied without owner decision (commits `8ec25f7`…`c72fe90`)

- **HAL load fix**: `spindle.0.speed-out-abs` was linked to two signals —
  LinuxCNC aborted in the fourth HALFILE; `gear-range.in0` now reads the
  existing `spindle-speed-cmd` (same pin, same value). Neither repo validator
  could see this class (writers-per-signal, not signals-per-pin).
- Both comps' doc-strings synced to the corrected ladder (compile-checked);
  test scenarios re-flagged so passing tests stop citing pre-audit readings;
  `atc_cycle_select`'s swapped E/F letters fixed; `run_tests.py` now fails a
  scenario that runs zero checks.
- The transcription's "Derived physical sequence" rewritten to the corrected
  **horizontal fork-entry exchange** (it was the root cause of the NGC
  geometry); WARNING comments added at the NGC's REF-naming block and steps 2/4.

## BEHAVIOR QUEUE — owner decisions (nothing below is applied)

Grouped by risk. Each item names its physical consequence as coded today.

### Group 1 — would crash or wreck a cycle

**Items 1–5 APPLIED 2026-09-04 (owner approved "yes go" for 1-4, then explicit
"apply item 5"; both gates cleared — fork/detents confirmed by photos+
firsthand, TSINTL read in flight and the MROT fix carries a fold-in note).
Group 1 is now fully applied.**

1. ✅ APPLIED — **NGC resequencing + REF rename (D1+D5).** Was: all three cycles ran a
   vertical plunge: cycle E re-clamps the tool it just returned then reports
   T0 (**delayed double-tool crash**); F lowers a **closed** drawbar onto the
   new tool's pull stud; D/F pull the clamped tool vertically through the pot
   grip; D/E carry a hanging tool across the magazine at Z0. Corrected chains
   + drafted branch sequences are in the audit trail; `REF1_Z/REF2_Z` must be
   renamed in the same commit (they're inverted vs ladder ZP1/ZP2).
   **Gate CLEARED 2026-09-04**: owner photos + firsthand confirm fork fingers
   with spring/detent-ball retention on both sides of each fork (several sets
   owner-replaced). Design notes for the resequencing: clamp-before-Y-out is
   load-bearing (the clamped spindle breaks the detents loose); consider a
   feed-limited Y segment through the detent zone on the first live cycles,
   and expect fresh-vs-worn detent break-away to vary.
2. ✅ APPLIED — **ATC MROT terms (B1+B2).** Was: `mag_rotate_enable` required cover-open and
   unclamp-off — corrected rung 3408 has neither, and the mid-cycle index ran
   with unclamp energized: **every full change timed out at 30 s
   mid-exchange**, and background pre-select during machining was impossible.
   Fix: `idx_running && permissives`. TSINTL (the fourth rung-3408 term) print-
   read 2026-09-04: it's gated by B/MS, a coil-less NC bit that must be OFF
   for a normal tool change to seal — TSINTL is normally OFF, `#TSINTL` is
   normally permissive, no field wiring needed. Bench item 41 CLOSED.
3. ✅ APPLIED — **NGC P4 disarm (D3).** Was: the detect-check stayed armed across states that
   legitimately negate the detects — **every cycle self-faults AL75/AL76**
   (E's own Z-up empties the spindle while armed). Move `M65 P4` to right
   after the step-1 wait.
4. ✅ APPLIED — **Missing G20 (D6).** Was: a metric caller's M6 interpreted the [ATC] inches as
   mm — Z stops ~144 mm high and **unclamps the tool over the table**. One
   token: `G90 G94` → `G90 G94 G20` (M70/M72 already restore caller units).
5. ✅ APPLIED 2026-09-04 — **Orient gear-solenoid topology (orient B1/D3).**
   Was: the comp gated pickup on `ENGS && !own-PRS` — both coils dead
   mid-shift with the spindle turning (fork can float out of gear), no
   steady-state coil hold, and CTL/OUT5 FALSE during a low-gear orient that
   needed no shift (FR-SX mis-orient risk). Fix (`mazak_orient.comp:306-339`):
   commanded range now drives its own coil UNGATED off `target_hi`; the
   OUTGOING range's coil is instead held via `(own-PRS || seal) && !ENGS`,
   so it stays energised through the shift until the zero-speed dwell
   releases it. Mutual interlock + `!fault_gear_timeout` unchanged. Consequence
   confirmed by the harness: a confirmed/selected range now holds its coil
   (and CTL/OUT5) continuously at rest instead of reading idle — `state`
   changes from 0 to 3 in three other scenarios that park in low gear
   (`orient_al46_rotating`, `orient_drive_fault`, `orient_reset_edge`), all
   updated to match. **Related B3 left OPEN, deliberately unchanged**:
   whether `drive_arm` belongs in the coil equations at all — the corrected
   rungs carry no SSET/HYD contact, but the comp still ANDs `drive_arm` into
   both coils (a documented ADDITION, not a reproduction), so a drive fault
   still drops fork pressure mid-spin — the opposite of the OEM's hold. This
   is a separate decision from item 5's topology fix and was not folded in.

### Group 2 — wrong-but-recoverable behavior / nuisance faults

**Items 6, 7, 9a APPLIED 2026-09-04** (10-agent research workflow classified
every remaining item safe-to-apply vs. owner-decision; all safe items applied
same day, compile-checked + harness-tested — 12 scenarios/410 checks/0 failed).

6. ✅ APPLIED 2026-09-04 — **Orient shift_pending event-set.** Not a
   level-vs-edge framing after all: rung 2901 (GSFTC) has exactly five OR
   branches, none of which test "neither PRS confirmed." `mazak_orient.comp`
   carried a bare `|| !any_prs` disjunct with no basis in the print — the sole
   cause of `shift_pending`/`mid_shift` latching true at power-up whenever the
   fork sits mid-stroke with nothing commanded, feeding the AL47 nuisance trip
   described above as a direct consequence of the same defect (not separate).
   Fix: dropped `|| !any_prs` from both the SET condition and `mid_shift`
   (which reduces algebraically to `shift_pending && !tgt_conf`, matching
   GSFME given HSR/LSR mutual exclusivity). `any_prs`'s one other, correct use
   (ORCM1's HGPRS/LGPRS term) is untouched.
7. ✅ APPLIED 2026-09-04 — **ORCM1 seal + SOME2 self-clear.** Both halves
   confirmed and fixed together (they're coupled — SOME2's self-clear is only
   safe once ORCM1 has its own true seal). `orient_memory` (SOME2) now clears
   itself once `oriented_latch` sets (rung 3003's `#SOSA` seal — the OEM
   self-clears on arrival, previously the comp latched it until an explicit
   cancel). `orcm1` (ORCM1) now uses a TRUE seal — `((orient_memory && any_prs
   && !mid_shift) || prev_orcm1) && !AL45 && !AL46 && !cancel && drive_arm` —
   so a PRS/GSFME/SOME2 flicker of any duration cannot drop OUT4 once latched;
   the set-branch only matters for the first pickup scan. Drops only on AL45,
   AL46, a real cancel/unorient/reset, or drive-arm loss.
8. ✅ APPLIED 2026-09-04 — **ATC pot decode on the REAL 30-pot magazine.**
   Print audit (TSINTL agent) resolved it: on 24TS/30TS magazines rung 3301
   is a raw copy with NO BCD conversion — the sensor byte is straight binary,
   weights 1/2/4/8/16 (T21P=16), covering 1–30. `mazak_atc.comp`'s decode and
   `atc_bcd_decode.py` updated to weight 16; D16=K16 (30TS, rung 3314) already
   matched the comp's `n/2` arithmetic — no change needed there. Bench item 42
   (pots 16/20/26/30 sensor read) still closes the print-vs-machine gap.
9. **NGC finish ordering (D4)** — ✅ APPLIED 2026-09-04: confirmed still
   present (unrelated to items 1–5's resequencing, verified by `git blame`/
   `git show` — this block was never touched). `toolchange.ngc`'s finish
   sequence cleared P5 (cycle-finish) before P0 (cycle-start/barrier);
   `mazak_atc.comp`'s `cycle_active` latch is a priority if/elseif
   (`cycle_finish` checked before `cycle_start`, no trailing else) so a scan
   where P5 has just dropped but P0 is still high re-latches
   `cycle_active`/`atc_barrier` true with nothing left in that cycle to clear
   it — fully determined two-line swap, confirmed by independent trace of the
   comp's own logic, not just the audit's claim. **No-tool guard (D7) ✅
   APPLIED 2026-09-04 (owner-directed: "flag from the T handler, abort on
   failure, validate range and table").** First attempt tested
   `[#<_selected_tool> LT 0]`, assuming a -1 "never selected" sentinel per a
   general LinuxCNC docs lookup — **wrong for this build**: a peer session
   working the same repo verified via `rs274` on the box plus the actual
   2.9.10 source (`rs274ngc_pre.cc`) that `_selected_tool` inits to 0, not
   -1 (it's `_selected_pocket` that carries -1, and this ngc-only remap
   never runs the iocontrol LOAD path pocket-tracking depends on).
   Reproduced independently before touching anything further. Real fix: a
   HAL flip-flop (`atc-t-prepared`) SET by `iocontrol.0.tool-prepare`
   (pulses for every T-word including T0) and RESET only by a genuine
   cycle-finish (P5) — an abort mid-cycle leaves it set, so a retry needs
   no fresh T-word. Read via `M66 P8 L0`. Range guard added too (0..30
   pots); NOT full tool.tbl presence validation — LinuxCNC's own T-word
   handling treats an unpopulated slot as a legitimate empty pocket, not a
   fault, so there's nothing to validate against there yet.
10. ✅ APPLIED 2026-09-04 (owner-directed: "fixed pocket") — **Return-pot
    staging (NGC D2), fixed-pocket convention.** Pocket number == tool
    number, no lookup needed. The existing `target-pot` HAL signal is
    hardwired to the NEXT tool's pocket and cannot carry the outgoing
    tool's pocket, so this added a second, independent target path:
    `mazak_atc.comp` gained `return-pot` (fed via `M68`/`analog-out-00`/
    `conv-float-s32.0` — motmod's default `num_aio=4` already provides
    `motion.analog-out-00`, no loadrt change needed) and
    `index-return-request` (P9), sharing the existing shortest-path
    arithmetic and index-done output via an `eff_target` mux. The magazine
    is staged to the departing tool's own pocket BEFORE entry positioning
    (Z retracted to `z_clear` first, matching the same rotation-clearance
    precondition the existing D-3ax index already relies on) so the tool
    lands in its home pocket as a side effect of positioning, with no
    second index-after-unclamp step needed. Cycle F (no outgoing tool) is
    skipped. **FLAGGED FOR BENCH VERIFICATION** (dry-run first): the new
    pre-entry rotation window, with Y not yet retracted from its prior
    position, is inferred safe from the existing D-3ax index's identical
    precondition — not independently confirmed for this new, earlier point
    in the cycle. A second peer-session review flagged that cycle F's own,
    pre-existing gap (no index at all before descending onto the new tool)
    could be closed by generalizing this same pre-entry mechanism — ✅ DONE
    2026-09-04 (peer session, commit after `35b3456`): cycle F now takes the
    same pre-entry window with the normal target (Z to `z_clear`, P3
    index-request → `target-pot` = iocontrol prep pocket, wait MSTP) so the
    commanded pot is under the spindle before Y traverses in. Same
    bench-verification caveat as the D/E leg above.
11. **Four small ladder-vs-comp divergences — OPEN**, researched individually:
    - **(a) AL45 consequence (orient B5)** — NO BUG FOUND. The comp already
      matches the ladder's actual split (AL45 blocks/holds off ORCM1 via
      `fault_orient_timeout`; only AL46 drops `drive_arm`). Needs only an
      owner "bless as-is" to formally close, no code change.
    - **(b) AL75/76 timer scope (ATC B5)** — `needs_bench_data`. The ladder
      arms the two alarms by cycle identity (AL76 gates D+E, AL75 gates only
      F); the comp instead keys by "where a tool must physically be" (AL76
      arms D+F, AL75 arms E) — a documented deliberate swap tied to an
      **already-open ladder question** (`atc_ladder_transcription.md` open
      question #6): the physical identity of X005 vs X05B is unverified and
      the ladder doc itself says the OEM naming may read backwards. Neither
      mapping can be confirmed without bench-checking what each sensor
      actually senses — not yet a numbered bench item, should be added
      alongside items 40–45.
    - **(c) Manual seal-leg #TCME hole (ATC B6)** — ✅ APPLIED 2026-09-04, a
      real narrow gap. Rung 3604's manual bracket — including its own
      self-seal — is entirely enclosed by `#TCME`; `mazak_atc.comp`'s
      `unclamp_cmd` gated a *fresh* manual press on `!cycle_active` but not
      the seal/hold term, so an operator holding manual-unclamp at the
      instant an M6 began could keep the coil energised via `prev_unclamp`
      alone, uncoupled from the auto step chain (risking a Y-out move before
      the tool is actually clamped). Fixed: split the seal into its auto half
      (unchanged, ungated) and manual half (now `&& !cycle_active`).
    - **(d) ATC-bypass/TCME input (orient B6)** — OPEN, architecture call, not
      urgent. TCME is entirely unimplemented in `mazak_orient.comp` — no pin,
      no net anywhere. Two ladder behaviors depend on it: the SOME2/GSFME
      bypass during an ATC-triggered orient (not reproducing this is SAFER,
      not a gap) and the `#TCME` gate on UOME2's cancel triggers (stops a
      stray jog/gear-code from cancelling an orient mid-ATC-cycle). Traced the
      actual wiring: today nothing except the toolchange/on_abort NGC's own
      disciplined P7 pulse can cancel an orient, so there's no live hazard —
      but no *structural* interlock exists, so a future change wiring a jog/
      gear-select cancel into P7 (exactly what the OEM ladder does) would
      reopen it. Owner call: accept the current NGC-level discipline, or add
      defense-in-depth (new `tcme` pin + net + gated cancel logic — a real
      multi-file change, not a quick patch).

### Group 3 — INI / HAL numbers and policies

**Items 12a, 13a/b, 15, 16d APPLIED 2026-09-04** (same research workflow as
Group 2 above).

12. **Spindle top speed / gear-aware analog scale**, split in two:
    - **(a) 4000 → 3488 ✅ APPLIED.** GH4 is the captured M-2 high-gear max-RPM
      parameter — `MAX_FORWARD/REVERSE_VELOCITY` and `OUTPUT_SCALE` under
      `[SPINDLE_0]` all corrected. Independent of (b); correct regardless of
      how the gear-aware design lands.
    - **(b) gear-aware `OUTPUT_SCALE` — OPEN, `needs_bench_data`.** Not just
      an ambiguous choice among known options — the volts-per-RPM numbers for
      either gear don't exist in the repo yet (the "~1 V for low-gear S400"
      figure is an arithmetic estimate, not a measurement; still listed as an
      open deliverable in `docs/superseded_claims_2026-08-06.md` #13 and
      `docs/project_status.md`). Nothing downstream of the item-5
      `gear-range` signal currently adjusts the spindle command scale by
      gear. Needs a bench measurement (known RPM setpoints in both gears,
      record actual AOUT3 volts) before any HAL mux/scale mechanism is
      written — the mechanism itself is a small, low-risk addition once the
      constants exist.
13. **Homing block**, split in four — two applied, two still bench/decision
    gated:
    - **(A) `VOLATILE_HOME = 1` ✅ APPLIED** on all three joints — REFME
      (docs/ladder/homing_ladder_transcription.md) is confirmed a latching
      all-axis memory whose seal breaks ONLY on E-stop, an exact match.
    - **(B) `HOME_LATCH_VEL`/`HOME_FINAL_VEL` from ZC=79 ✅ APPLIED** — 0.1317
      in/s (79 × 0.1"/min ÷ 60), citing the OEM parameter dictionary's
      explicit unit/meaning for ZC ("dog-type zero return creep speed, AFTER
      DECELERATION"). Print-derived STARTING POINT for bring-up, not
      bench-validated — low risk, only changes a slow creep-speed magnitude.
      `HOME_FINAL_VEL` didn't exist in the ini before this (was falling back
      to a fast default for the post-latch move).
    - **(C) `HOME_SEARCH_VEL` sign per axis — OPEN, `needs_bench_data`, DO NOT
      GUESS.** ZD gives only that X's direction bit (0) differs from Y/Z's
      (1) — neither this repo's transcription nor the OEM parameter
      dictionary states which bit is which physical direction. A wrong sign
      drives an axis at search velocity into a hard mechanical stop with no
      deceleration switch to catch it. Bench item 7 (dog check) is the only
      thing that resolves this.
    - **(D) `HOME_SEQUENCE` order — OPEN, decision to document, not bench
      data.** No source states a required order; the OEM's own NC issues one
      all-axis "REF.1 RETURN ALL" command, so the M-2 never sequenced axes at
      all. Current order (Z=0, X=1, Y=2) already matches sound VMC practice
      (Z retracts before horizontal search) and is specifically relevant
      because Y's positive travel reaches into the ATC magazine zone (RP2 =
      +9.5 in) — kept as-is, now documented inline in the ini, but the owner
      should re-confirm once bench item 7 resolves Y's actual switch
      direction.
14. ✅ DECIDED 2026-09-04 (owner: "hold at 0 unless I have problems") —
    **BACKLASH held at 0.0**; reasoning recorded as INI comments on all three
    `BACKLASH` lines (captured values kept there as reference only; measure
    with an indicator after loop tuning). Original analysis follows.
    **BACKLASH 0.0 vs captured X 0.0005 / Y 0.0010 / Z 0.0020 — was OPEN,
    decision_needed.** Deeper than "hold vs apply": the captured numbers are
    the M-2's own decades-old servo backlash-COMPENSATION parameters
    (photographed off the CRT, calibration date/history unknown), not a fresh
    mechanical measurement — and this axis stack is currently fully untuned
    (FF0/FF1/FF2/P/I/D = 0, MAX_OUTPUT clamped as a commissioning limit).
    Applying an unverified decades-old setpoint onto an untuned loop risks
    tripping FERROR/MAX_ERROR on the very first bring-up reversing moves if
    the real 2026 backlash (post general mechanical rebuild activity on this
    machine) is smaller than the applied number. Holding at 0.0 keeps the
    FF1-first tuning procedure clean but leaves reversal error uncorrected
    until a bench indicator measurement is taken. Owner call; record the
    reasoning either way so a future session doesn't mistake 0.0 for an
    oversight.
15. ✅ APPLIED 2026-09-04 — **[ATC] ORIENT_TIMEOUT 15 → 45.** Independently
    re-derived (not just trusted from the original claim, which predates item
    5): traced the comp's own sequential watchdog budget under the
    item-5-corrected topology — AL47 gear-shift-timeout (30.0 s) must resolve
    before ORCM1 can even assert (proven sequential, not concurrent, by
    ORCM1's `!mid_shift` gate), then AL45 orient-timeout (10.0 s) starts —
    40.0 s worst case, matching the original "30+10" figure exactly even
    after item 5's changes. 45.0 s keeps a 5 s/12.5% margin; a healthy orient
    still returns from the bare NGC wait the instant SOSA sets, so there's no
    normal-cycle-time cost to the larger number.
16. **IN13 / IN10 / orphan safety inputs / and2.7 ordering**, split in four —
    one applied, three still open:
    - **(a) IN13 spindle-at-speed — ✅ RESOLVED 2026-09-04 (owner: "find
      something in the FR-SX manual").** The DRIVE has a discrete up-to-speed
      output: FR-SX maintenance manual BCN-21735-S5 p12, connector **CON3
      pin 15 `USO` "UP TO SPEED"**, COM pin 20, transistor ON within ±15 % of
      commanded speed (p9), LED7 on SX-CPU lights with it. Mazak wired only
      CON1 (dwg 4143075403), which is why the machine drawing shows nothing.
      Applied: CSV row `SPINDLE_AT_SPEED` DEFERRED → COMMISSIONING_PENDING
      with dest `FR-SX CON3-15`; IN13 comment in `field_7i84u.hal` rewritten;
      `docs/frsx_maintenance_manual_notes.md` Finding 7. Polarity is bench
      item 46. Interim: bench jumper IN13→VFIELD (no HAL `sets`, the
      validator forbids it). Original analysis follows. Confirmed bound
      to a real input whose own inline comment says no factory FR-SX at-speed
      terminal exists ("derive in HAL, do NOT wire") — so the pin never
      asserts and every first feed after M3/S-word stalls indefinitely,
      exactly as described. "Derive in HAL" is not a single obvious
      implementation: there is currently NO spindle feedback in HAL at all
      (`num_encoders=0`, no near/comp loaded, machine-side encoder only
      "believed present"). Three real options, needing an owner pick: wire a
      real encoder (correct, but hardware-identification-blocked), a
      bench-only synthetic override (`sets spindle-at-speed true`, defeats
      the interlock), or a time-based dwell (needs a settle-time value not
      captured anywhere).
    - **(b) IN10 `-not` staging — OPEN, `needs_bench_data`.** The signal's own
      file comments mark its wiring UNRESOLVED (previous assumed source
      CN6-27 was proven wrong by this same audit — nothing correct is landed
      today) and its active-low polarity UNVERIFIED against the amp. IF the
      believed polarity holds, the fix is the same one-line `-not` suffix
      this repo already uses for every other NC safety input — but applying
      it before the real ALM contact is landed and bench-verified risks
      locking in the wrong sense on a signal that trips E-stop on all three
      axes (either constant false E-stops or masking a real fault).
    - **(c) Orphan safety inputs — OPEN, decision_needed per signal (expected,
      does not gate the others).** `thermal-alarm`, `door-interlock`,
      `lube-ok` are each read from a real physical input every scan and
      drive absolutely nothing downstream — confirmed by grep, zero
      consumers anywhere in the HAL set. Real, live safety gap. Each needs an
      owner decision on consequence (spindle-only interlock via
      `logic.spindle-permit-and`, vs. full E-stop via `watchdog-fault-or` —
      needs a new OR stage either way, vs. HMI-warning-only for `lube-ok`
      given it's the sole lube switch with no redundancy).
    - **(d) and2.7 ordering (ORCM1 one scan stale) ✅ APPLIED 2026-09-04,
      verified two ways** (line-order trace AND a scratch-copy negative
      test that reproduced the exact "unsafe servo-thread order" failure
      before the fix, confirmed passing after). `and2.7` was addf'd in
      `mazak_vqc_20_40.hal` — loaded BEFORE `atc_orient.hal`'s
      `mazak-orient.update`, whose `spindle-orient-cmd` output it reads —
      so it read ORCM1 one servo-period stale every scan. Moved `and2.7`'s
      addf into `atc_orient.hal`, immediately after `mazak-orient.update`
      and before its only consumer, `hm2_7i80.0.write`. The validator's
      hand-authored required-order list literally hardcoded the buggy order
      as "required" (which is why it was green) — reordered to match.
      **Also added**: `check_pin_execution_order()`, a genuinely new,
      data-driven check in `validate_control_logic.py` that derives ordering
      constraints from actual `net <= producer`/`net => consumer` pins
      instead of a hand-authored name list — it will catch this bug class
      for any future component pair, not just this one instance. Negative-
      tested against a reintroduced bug: both the old and new checks
      correctly fail it.

## New scenario sketches (write after decisions)

step1 detect gate (E/F + deviation + AL75/76), AL45/AL44/AL47 latches,
abort/finish lifecycle, index/unclamp timeouts, and the still-open
decision-pending items above (no-tool guard, return-pot staging, AL75/76
scope, TCME wiring, spindle-at-speed, IN10 polarity, orphan safety inputs) —
full research trail (10-agent workflow, 2026-09-04) available on request.

## Bench additions (appended to the phone checklist)

40. **Fork vs socket** — photograph one magazine pot: fixed fingers gripping
    the V-flange confirms the horizontal exchange and gates item 1.
41. **TSINTL coil rung** — paper read in YM2V39L (consumed at 3408/estop 3204,
    never transcribed); decides MROT's final form (item 2).
42. **Pot-20 encoding** — at pot 20 record all five TNPS states + MIPRS
    (extends pot-count item 20).
43. **TCPRS clamped-empty** — does the clamp prox make with no tool? E-3's
    completion depends on it.
44. **Steady-state gear-coil hold + outgoing-release scope** (extends 28/30) —
    settles items 5/6; **PRS flicker in halscope** during spindle run sizes
    item 7. **Mid-stroke power-up** behavior choice.
45. **Abort during orient** — verify the P7 pulse lands (G4-in-abort timing)
    and decide whether post-abort dead manual-unclamp until next M6 is
    acceptable. **pwmgen.03.offset-mode existence** on 2.9.10; `halrun -f`
    full-set smoke test once both 7i84Us enumerate.
46. **FR-SX `USO` up-to-speed polarity (item 16a)** — with the spindle at a
    commanded speed and LED7 UP TO SPEED lit on the SX-CPU card, meter CON3-15
    against CON3-20 (COM); record whether the terminal pulls LOW (open
    collector) or sources P24 (open emitter), and whether P24 is internal.
    Then land CON3-15/20 on 7i84U-A IN13 (relay-isolated per the OEM ZS1
    pattern unless drive COM and VFIELD ground are common) and set/omit `-not`
    in `field_7i84u.hal` to match. Until landed, bench jumper IN13→VFIELD.
