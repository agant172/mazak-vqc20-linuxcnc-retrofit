"""Gear shift chain: mid-shift detection, the ENGS zero-speed dwell, and the solenoid seal.

Exercises linuxcnc/components/mazak_orient.comp:269-334 against
docs/ladder/orient_ladder_transcription.md sheets 28/29/30:

  rung 2808/2809  HSR / LSR mutually exclusive range memories
  rung 2901       GSFTC  gear shift command (target range != confirmed position)
  rung 2902       GSFME  gear shift in-progress memory, incl. the `#HGPRS . #LGPRS`
                         branch that makes "no PRS made at all" count as mid-shift
  rung 2905/2906  T-5 -> ENGS - LADDER DISCREPANCY: corrected 2905 draws SMR
  NO (the OEM dwells with the run memory ASSERTED); the comp requires
  !spindle_run (bench check 28 decides)
  rung 2907/2910  CORRECTED TOPOLOGY APPLIED 2026-09-04 (decision-queue item 5):
  `[HSR || (HGPRS || seal-GSH).#ENGS].#GSL.M.#AL47` (and the LSR mirror) - the
  commanded range drives its own coil UNGATED, and #ENGS instead HOLDS the
  OUTGOING gear's coil through the shift. mazak_orient.comp:306-334.
  rung 3001       CTL.M = GSL.M (combinational mirror, orient-lo-gear)

Why this matters: rung 2905's whole purpose is that a gear solenoid may never be
energised against a turning spindle, and rung 2907/2910's hold is what keeps the
outgoing shift fork engaged - under hydraulic pressure - all the way through the
dwell, and what keeps the confirmed range's coil (and CTL/OUT5) held at rest with
no active shift. Nothing else in the repo pins this behaviour -
scripts/validate_control_logic.py only asserts literal source strings in the
ATC/orient .comp files, none of them in this range.

Sequence driven below, all with orient-request never asserted (so ORCM1, SOSA and
AL44/AL45/AL46 stay out of the picture and the gear chain is observed alone):

  no PRS made -> select high -> zero speed but still running -> zero speed, no run
  -> GSH.M picks up IMMEDIATELY on the target bit (ungated) -> dwell elapses,
  ENGS confirms -> HGPRS makes, GSH.M still held (now by its own PRS, not the
  dwell) -> both selects asserted (target held) -> select low only -> GSH.M HOLDS
  (outgoing) until the dwell elapses -> dwell elapses, GSL.M picks up as GSH.M's
  hold drops -> LGPRS makes, GSL.M still held.

drive-arm-delay is scaled 2.0 -> 0.8 s and zero-speed-dwell 0.3 -> 1.0 s via setp
so the "not yet" and "now" sides of the dwell can each be observed with margin.
tests/hal/scenarios/timer_defaults.py asserts the shipped defaults separately.

# DIVERGENCE: ladder rungs 2907/2910 draw GSH.M / GSL.M as
# `HSR . #GSL.M . #AL47 [. #10000S]` gated by `(#PRS . ENGS)` or seal - there is
# NO SSET/drive-arm contact in either rung. The component adds `&& drive_arm` to
# the whole expression (mazak_orient.comp:328-331), which is deliberate per the
# component header lines 26-27 ("The external FR-SX fault input also drops the
# drive arm, gear outputs, and orient command") but is an addition to the
# transcribed logic, not a reproduction of it. This is decision-queue item 5's
# related B3, left unchanged and still open - a human should decide whether a
# fork mid-spin should really lose hydraulic hold on a drive fault, and whether
# the ladder transcription should carry a matching annotation either way.

Note (declared reduction, not a divergence): rungs 2808/2809 are two sealed,
mutually interlocked coils; the component collapses them to the single
`target_hi` variable fed by gear-select-hi/lo inputs. That reduction is stated
outright at mazak_orient.comp:30-32 ("NOT MODELLED HERE ... the retrofit derives
the target range from the commanded spindle speed") and in the gear-select-lo pin
doc at :106. The "both asserted holds the last target" check below is the
observable consequence of :269-270.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from halharness import HalSession  # noqa: E402


def run():
    with HalSession("mazak_orient", "mazak-orient") as h:
        # --- Phase 1: powering up with NEITHER gear confirm made -------------
        # Rung 2302 permissives (comp :224). Spindle deliberately left "running"
        # and not at zero speed so the T-5 dwell cannot start accumulating while
        # the drive arms.
        h.setp_many({
            "machine-ready": True,
            "servo-ready": True,
            "estop-ok": True,
            "spindle-run": True,
            "spindle-zero-speed": False,
            "drive-arm-delay": 0.8,     # param: scaled down from 2.0
            "zero-speed-dwell": 1.0,    # param: scaled UP from 0.3 to be observable
        })

        h.run_ms(150)   # well short of drive-arm-delay

        # (a) mid_shift includes `|| !any_prs` (:287), which sits OUTSIDE every
        # permissive - gear-shifting is TRUE with no confirm made even before
        # the drive has armed.
        h.expect("drive-arm", False, "T-0 (rung 2304) has not elapsed yet")
        h.expect("gear-shifting", True,
                 "rung 2902 `#HGPRS . #LGPRS` branch: no PRS made = mid-shift")
        h.expect("gear-confirmed", False, "neither PRS is made")
        h.expect("gear-shift-enable", False, "T-5 cannot run: spindle not at zero speed")
        h.expect_all({"gear-hi-sol": False, "gear-lo-sol": False},
                     "no solenoid before ENGS")

        h.run_ms(1500)  # cumulative >> drive-arm-delay

        # target_hi defaults to 0 (low) at power-up with no select ever made
        # (:190). Under the corrected topology the commanded range's own
        # term is UNGATED - gear-lo-sol picks up the instant the drive arms,
        # with no PRS confirm and no dwell required, because there is no
        # outgoing gear to hold it back (prev_hi_sol is still 0). This is
        # the item-5 fix's headline behaviour.
        h.expect_all({
            "hyd-pump-on": True,
            "drive-arm": True,
            "gear-shifting": True,
            "gear-confirmed": False,
            "gear-shift-enable": False,
            "gear-hi-sol": False,
            "gear-lo-sol": True,
            "orient-lo-gear": True,
            "fault-any": False,
        }, "armed: gear-lo-sol picks up ungated on the default-low target (:331-334)")
        # state 3 = a solenoid is energised (:400), not 2 - gear-lo-sol is
        # already up even though the target is still unconfirmed.
        h.expect("state", 3, "gear-lo-sol energised, ungated by the dwell (:400)")

        # --- Phase 2: select high, spindle at zero speed but still commanded --
        # COMP BEHAVIOR (LADDER DISCREPANCY, audit 2026-09-02): the comp blocks
        # the dwell on spindle_run; corrected rung 2905 draws SMR NO - the OEM
        # dwell runs with the run memory ASSERTED. Pending bench check 28.
        h.setp_many({"gear-select-hi": True, "spindle-zero-speed": True})
        h.run_ms(300)

        h.expect("gear-shift-enable", False,
                 "COMP BEHAVIOR (ladder discrepancy): the comp blocks the dwell on spindle_run")
        h.expect_all({"gear-hi-sol": False, "gear-lo-sol": True},
                     "gear-lo-sol is now the OUTGOING gear: held by its own seal "
                     "AND #ENGS (:334) even though the target just flipped to hi; "
                     "gear-hi-sol stays blocked by the mutual !prev_lo_sol interlock")

        # --- Phase 3: (b) drop the run command; ENGS is still FALSE mid-dwell -
        h.setp("spindle-run", False)
        h.run_ms(300)   # ~0.4 s of dwell vs the 1.0 s scaled threshold

        h.expect("gear-shift-enable", False,
                 "T-5 has started but not elapsed - ENGS must stay FALSE (:293-296)")
        h.expect_all({"gear-hi-sol": False, "gear-lo-sol": True},
                     "outgoing-hold continues: gear-lo-sol only releases once #ENGS "
                     "goes true (:334), which has not happened yet")
        h.expect("gear-shifting", True, "target range still unconfirmed")

        # --- Phase 4: (c) dwell elapses -> high solenoid only -----------------
        h.run_ms(1500)  # cumulative dwell ~2x the 1.0 s threshold

        h.expect("gear-shift-enable", True, "rung 2906 ENGS = T-5 (:295-296)")
        h.expect("gear-hi-sol", True,
                 "gear-lo-sol's outgoing hold released on #ENGS, the mutual "
                 "interlock cleared, and HSR's own ungated term closes gear-hi-sol (:331)")
        h.expect("gear-lo-sol", False,
                 "released: !target_hi and !engs both false now kills its OR-bracket (:334)")
        h.expect("orient-lo-gear", False, "rung 3001 CTL.M = GSL.M (:342)")
        h.expect("gear-confirmed", False, "HGPRS has not made yet")
        h.expect("state", 3, "3 = SHIFTING, a solenoid is energised (:369)")
        h.expect("fault-any", False, "AL47 is nowhere near its 30 s default")

        # --- Phase 5: (d) HGPRS makes - the solenoid must stay held ------------
        # mid_shift clears the instant HGPRS makes, which resets t_dwell so
        # ENGS drops back to false too. gear-hi-sol stays up regardless -
        # target_hi's own ungated term (:331) holds it independently of ENGS.
        h.setp("gear-hi-conf", True)
        h.run_ms(200)

        h.expect("gear-hi-sol", True,
                 "target_hi's ungated term (:331) holds GSH.M on its own, "
                 "with the PRS-or-seal branch also now true - belt and braces")
        h.expect("gear-shift-enable", False,
                 "T-5 drops with GSF.N (rung 2905) - the ungated target term, not ENGS, holds it")
        h.expect("gear-shifting", False,
                 "rung 2902 clears: target confirmed and a PRS is made (:287)")
        h.expect("gear-confirmed", True, "target is high and HGPRS is made (:273-274)")
        h.expect("gear-lo-sol", False, "low solenoid stays out")
        h.expect("orient-lo-gear", False, "rung 3001 mirror still follows GSL.M (:312)")

        # --- Phase 6: BOTH selects asserted holds the previous target ---------
        # :269-270 has no else branch for the ambiguous case, so target_hi keeps
        # its value - the analogue of rungs 2808/2809 each blocking on the other
        # command bit. Nothing may move.
        h.setp("gear-select-lo", True)   # hi is still TRUE as well
        h.run_ms(200)

        h.expect("gear-hi-sol", True,
                 "ambiguous select holds target_hi = 1, so its ungated term survives (:269-270)")
        h.expect("gear-lo-sol", False, "an ambiguous select must not command a shift")
        h.expect("gear-confirmed", True, "target unchanged, HGPRS still made")
        h.expect("gear-shifting", False, "no shift demanded by an ambiguous select")

        # --- Phase 7: (e) select low only - gear-confirmed follows the TARGET --
        # gear-hi-conf is still TRUE here on purpose: any_prs is TRUE, yet the
        # target's own PRS (LGPRS) is not made, so gear_confirmed must be FALSE.
        # That is the discriminator for `tgt_conf = target_hi ? hi_conf : lo_conf`
        # (:273) as opposed to the any_prs term at :272.
        h.setp("gear-select-hi", False)
        h.run_ms(300)   # dwell restarted from zero, still short of 1.0 s

        h.expect("gear-confirmed", False,
                 "target is now low; HGPRS being made is irrelevant (:273-274)")
        h.expect("gear-shifting", True, "rung 2901: target range != confirmed position")
        # THE FIX (item 5 / D3): under the pre-audit topology gear-hi-sol
        # dropped the instant target_hi went 0 - the fork lost hydraulic
        # pressure with the spindle still turning. Under the corrected
        # topology, high is now the OUTGOING gear: its own PRS-or-seal term
        # (:331) keeps it held through #ENGS, exactly like rung 2907/2910
        # read. gear-lo-sol stays out, blocked by the mutual !prev_hi_sol
        # interlock (:333) - the incoming range cannot pick up until the
        # outgoing one lets go.
        h.expect("gear-hi-sol", True,
                 "OUTGOING HOLD: own PRS-or-seal term keeps GSH.M energised "
                 "through the new dwell, target_hi went 0 or not (:331)")
        h.expect("gear-lo-sol", False,
                 "blocked by !prev_hi_sol - gear-hi-sol has not released yet (:333)")
        h.expect("gear-shift-enable", False, "T-5 restarts from zero on a new shift")
        h.expect("state", 3, "gear-hi-sol still energised as the outgoing hold (:400)")

        # --- Phase 8: (f) low shift completes - CTL.M mirrors GSL.M -----------
        h.setp("gear-hi-conf", False)   # fork leaves the high detent
        h.run_ms(1500)

        # Losing HGPRS drops gear-hi-sol's own-PRS branch, but its seal
        # (prev_hi_sol) keeps the outgoing hold up until #ENGS finally
        # releases it (dwell re-served over this 1.5 s window) - at which
        # point target_hi=0's ungated term picks gear-lo-sol up immediately.
        h.expect("gear-lo-sol", True,
                 "!target_hi's ungated term (:333) closes once gear-hi-sol's "
                 "outgoing hold releases on #ENGS")
        h.expect("gear-hi-sol", False, "outgoing hold released on #ENGS, target stayed low (:331)")
        h.expect("orient-lo-gear", True,
                 "rung 3001 CTL.M = GSL.M - the mirror must follow up as well as down (:342)")
        h.expect("gear-shift-enable", True, "dwell served again")
        h.expect("state", 3, "3 = SHIFTING")

        # --- Phase 9: (d) again on the low side - LGPRS makes, gear-lo-sol stays up
        h.setp("gear-lo-conf", True)
        h.run_ms(200)

        h.expect("gear-lo-sol", True,
                 "target_hi's ungated term (:333) holds GSL.M on its own; "
                 "the PRS-or-seal branch is now also true - belt and braces")
        h.expect("orient-lo-gear", True, "mirror still equals the low solenoid (:342)")
        h.expect("gear-confirmed", True, "target is low and LGPRS is made")
        h.expect("gear-shifting", False, "shift complete")
        h.expect("gear-shift-enable", False, "T-5 drops with GSF.N; the ungated target term holds it")
        h.expect("gear-hi-sol", False, "never both solenoids (:335)")
        h.expect("fault-any", False,
                 "no AL47 - the whole scenario is far inside gear-shift-timeout")

        return h
