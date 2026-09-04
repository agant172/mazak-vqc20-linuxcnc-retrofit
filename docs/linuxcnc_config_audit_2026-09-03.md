# LinuxCNC config audit — 2026-09-03/04

> **ROLE: AUDIT RECORD + DECISION QUEUE** — findings of the Fable 5 six-domain
> audit of `linuxcnc/` + `tests/hal/` against the CORRECTED ladder
> transcriptions, `parameters_sn060231.md`, and the pin authority. Comment/test
> fixes and one load-blocking bug landed in `8ec25f7`…`c72fe90`; every change
> that alters machine behavior is queued below for the owner, except item 5
> (applied 2026-09-04, see Group 1). Harness green at HEAD (12 scenarios /
> 410 checks / 0 failed, LinuxCNC box 2026-09-04).

## Scorecard

| Domain | Verdict |
|---|---|
| mazak_orient.comp | Annotations accurate; gear-solenoid topology **FIXED 2026-09-04** (item 5) — 6 behavior items remain |
| mazak_atc.comp | Confirmation/alarm/clamp core faithful; **MROT terms deadlock cycle D's mid-index**; pot 20 unreachable — 6 behavior items |
| toolchange.ngc | Pin protocol/timeouts/abort/dry-run clean; **step geometry matches none of the corrected chains** — 6 behavior items |
| HAL topology | Nets/loadrt/addf near-perfect; **one load-blocking pin-double-link (FIXED)**; 2 ordering + orphan-input items |
| INI | Limits/REF/divisor/remap verified; spindle 4000-vs-3488, homing block ignores ZD/ZC, SERVO_PERIOD citation — 6 behavior items |
| Test harness | Mechanics sound, suite genuinely green; stale ladder citations re-flagged; 0-checks silent-pass bug FIXED; big coverage-gap list |

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

6. **Orient shift_pending event-set (B2/D1+D2).** Level-triggered evaluation
   starts uncommanded shifts on PRS flicker and latches a nuisance AL47 30 s
   after powering up with the fork mid-stroke.
7. **ORCM1 seal + SOME2 self-clear (B4/D5+D7, change together).** A PRS
   flicker mid-orient momentarily drops OUT4 → FR-SX aborts/restarts the
   orient, possibly mid-ATC-approach.
8. ✅ APPLIED 2026-09-04 — **ATC pot decode on the REAL 30-pot magazine.**
   Print audit (TSINTL agent) resolved it: on 24TS/30TS magazines rung 3301
   is a raw copy with NO BCD conversion — the sensor byte is straight binary,
   weights 1/2/4/8/16 (T21P=16), covering 1–30. `mazak_atc.comp`'s decode and
   `atc_bcd_decode.py` updated to weight 16; D16=K16 (30TS, rung 3314) already
   matched the comp's `n/2` arithmetic — no change needed there. Bench item 42
   (pots 16/20/26/30 sensor read) still closes the print-vs-machine gap.
9. **NGC finish ordering (D4)** — clear P0 before P5 or `cycle_active`/barrier
   can re-latch and stick. **No-tool guard (D7)** — M6 with no T errors
   mid-cycle with outputs asserted.
10. **Return-pot staging (NGC D2).** No cycle stages the OLD tool's pot before
    unclamping — the old tool drops at an arbitrary (possibly occupied) pot.
    Design decision: fixed-pocket (second target path) vs RANDOM_TOOLCHANGER.
11. **AL45 consequence (orient B5)**, **AL75/76 timer scope (ATC B5)**,
    **manual seal-leg #TCME hole (ATC B6)**, **ATC-bypass/TCME input
    (orient B6)** — each currently diverges from the corrected ladder; keep
    (annotated) or match, per item.

### Group 3 — INI / HAL numbers and policies

12. **Spindle top speed**: 4000 → **3488** (captured GH4); OUTPUT_SCALE from
    the FR-SX 10 V bench mapping — and the one-scale-across-two-gears problem
    (low-gear S400 commands ~1 V) needs a gear-aware scale design.
13. **Homing block**: add `VOLATILE_HOME = 1` (re-home after E-stop, matches
    REFME); split `HOME_SEARCH_VEL` signs per ZD (X must differ from Y/Z —
    exact mapping is bench item 7's dog check); latch/final vel vs ZC=79
    (~7.9 ipm); `HOME_SEQUENCE` order uncited.
14. **BACKLASH** 0.0 vs captured X 0.0005 / Y 0.0010 / Z 0.0020 — hold at 0
    deliberately or apply; record either way.
15. **[ATC] ORIENT_TIMEOUT 15 → 45** (or restructure): an orient-driven gear
    shift can legitimately take 30 s+10 s; at 15 s the remap bare-timeouts
    before AL47 can diagnose.
16. **IN13 spindle-at-speed** (standing item): derive in HAL or unbind — as
    loaded the first feed after any M3 stalls. **IN10** consider `-not`
    staging so unwired reads FAULT. **Orphan safety inputs** thermal-alarm /
    door-interlock / lube-ok currently trip nothing — assign consumers or
    annotate DEFERRED. **and2.7 ordering** (ORCM1 one cycle stale) + the
    validator's required-order list. Teach `validate_control_logic.py` a
    pin→signals check (the class that hid the load-blocker).

## New scenario sketches (write after decisions)

step1 detect gate (E/F + deviation + AL75/76), AL45/AL44/AL47 latches,
abort/finish lifecycle, index/unclamp timeouts, manual unclamp, and the
decision-pending pairs (dwell-with-run, outgoing-hold, SOME2 self-clear,
ATC bypass, T-0 grace) — full sketches in the harness audit trail.

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
