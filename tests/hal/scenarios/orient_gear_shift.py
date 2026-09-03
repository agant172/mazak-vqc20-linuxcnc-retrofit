"""Gear shift chain: mid-shift detection, the ENGS zero-speed dwell, and the solenoid seal.

Exercises linuxcnc/components/mazak_orient.comp:269-312 against
docs/ladder/orient_ladder_transcription.md sheets 28/29/30:

  rung 2808/2809  HSR / LSR mutually exclusive range memories
  rung 2901       GSFTC  gear shift command (target range != confirmed position)
  rung 2902       GSFME  gear shift in-progress memory, incl. the `#HGPRS . #LGPRS`
                         branch that makes "no PRS made at all" count as mid-shift
  rung 2905/2906  T-5 -> ENGS - LADDER DISCREPANCY: corrected 2905 draws SMR
  NO (the OEM dwells with the run memory ASSERTED); the comp requires
  !spindle_run (bench check 28 decides)
  rung 2907/2910  LADDER DISCREPANCY: corrected topology is
  [HSR || (HGPRS || seal).#ENGS].#other-sol.#AL47 - HSR drives the incoming
  solenoid directly and #ENGS HOLDS THE OUTGOING gear's solenoid; the comp
  instead gates pickup on ENGS && !own-PRS (assertions below pin the COMP)
  rung 3001       CTL.M = GSL.M (combinational mirror, orient-lo-gear)

Why this matters: rung 2905's whole purpose is that a gear solenoid may never be
energised against a turning spindle, and rung 2907/2910's seal is what keeps the
shift fork held once the dog clutch is home. Nothing else in the repo pins either
behaviour - scripts/validate_control_logic.py only asserts literal source strings
in the ATC/orient .comp files, none of them in this range.

Sequence driven below, all with orient-request never asserted (so ORCM1, SOSA and
AL44/AL45/AL46 stay out of the picture and the gear chain is observed alone):

  no PRS made -> select high -> zero speed but still running -> zero speed, no run
  -> dwell elapses, GSH.M picks up -> HGPRS makes, GSH.M seals -> both selects
  asserted (target held) -> select low only -> dwell -> GSL.M picks up -> LGPRS
  makes, GSL.M seals.

drive-arm-delay is scaled 2.0 -> 0.8 s and zero-speed-dwell 0.3 -> 1.0 s via setp
so the "not yet" and "now" sides of the dwell can each be observed with margin.
tests/hal/scenarios/timer_defaults.py asserts the shipped defaults separately.

# DIVERGENCE: ladder rungs 2907/2910 draw GSH.M / GSL.M as
# `HSR . #GSL.M . #AL47 [. #10000S]` gated by `(#PRS . ENGS)` or seal - there is
# NO SSET/drive-arm contact in either rung. The component adds `&& drive_arm` to
# both the pickup and the seal branch (mazak_orient.comp:301,303), which is
# deliberate per the component header lines 26-27 ("The external FR-SX fault
# input also drops the drive arm, gear outputs, and orient command") but is an
# addition to the transcribed logic, not a reproduction of it. The assertions
# below are written for what the COMPONENT does; a human should decide whether
# the ladder transcription should carry a matching annotation.

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

        h.expect_all({
            "hyd-pump-on": True,
            "drive-arm": True,
            "gear-shifting": True,
            "gear-confirmed": False,
            "gear-shift-enable": False,
            "gear-hi-sol": False,
            "gear-lo-sol": False,
            "orient-lo-gear": False,
            "fault-any": False,
        }, "armed, but still mid-shift with no PRS made")
        # state 2 = ZERO_SPEED_DWELL: mid_shift true, engs false (:370).
        h.expect("state", 2, "mid-shift waiting on the dwell (:370)")

        # --- Phase 2: select high, spindle at zero speed but still commanded --
        # COMP BEHAVIOR (LADDER DISCREPANCY, audit 2026-09-02): the comp blocks
        # the dwell on spindle_run; corrected rung 2905 draws SMR NO - the OEM
        # dwell runs with the run memory ASSERTED. Pending bench check 28.
        h.setp_many({"gear-select-hi": True, "spindle-zero-speed": True})
        h.run_ms(300)

        h.expect("gear-shift-enable", False,
                 "COMP BEHAVIOR (ladder discrepancy): the comp blocks the dwell on spindle_run")
        h.expect_all({"gear-hi-sol": False, "gear-lo-sol": False},
                     "no ENGS, so neither pickup path (:301-304) can close")

        # --- Phase 3: (b) drop the run command; ENGS is still FALSE mid-dwell -
        h.setp("spindle-run", False)
        h.run_ms(300)   # ~0.4 s of dwell vs the 1.0 s scaled threshold

        h.expect("gear-shift-enable", False,
                 "T-5 has started but not elapsed - ENGS must stay FALSE (:293-296)")
        h.expect_all({"gear-hi-sol": False, "gear-lo-sol": False},
                     "COMP BEHAVIOR: no solenoid until the dwell is served (corrected 2907 would drive GSH.M directly from HSR - ladder discrepancy, bench 28/30)")
        h.expect("gear-shifting", True, "target range still unconfirmed")

        # --- Phase 4: (c) dwell elapses -> high solenoid only -----------------
        h.run_ms(1500)  # cumulative dwell ~2x the 1.0 s threshold

        h.expect("gear-shift-enable", True, "rung 2906 ENGS = T-5 (:295-296)")
        h.expect("gear-hi-sol", True,
                 "rung 2907 pickup `#HGPRS . ENGS` with HSR selected (:301-302)")
        h.expect("gear-lo-sol", False,
                 "rung 2910 requires LSR; the two are interlocked (:303-305)")
        h.expect("orient-lo-gear", False, "rung 3001 CTL.M = GSL.M (:312)")
        h.expect("gear-confirmed", False, "HGPRS has not made yet")
        h.expect("state", 3, "3 = SHIFTING, a solenoid is energised (:369)")
        h.expect("fault-any", False, "AL47 is nowhere near its 30 s default")

        # --- Phase 5: (d) HGPRS makes - the solenoid must SEAL ON -------------
        # The pickup term `engs && !gear_hi_conf` opens the instant the PRS
        # makes, AND mid_shift clears, which resets t_dwell so ENGS drops too.
        # Only the `|| prev_hi_sol` seal (:302) keeps the fork held. That is
        # rung 2907's `‖ seal GSH.M` branch.
        h.setp("gear-hi-conf", True)
        h.run_ms(200)

        h.expect("gear-hi-sol", True,
                 "THE SEAL: `|| prev_hi_sol` (:302) holds GSH.M after HGPRS makes")
        h.expect("gear-shift-enable", False,
                 "T-5 drops with GSF.N (rung 2905) - the seal, not ENGS, holds it")
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
                 "ambiguous select holds target_hi = 1, so the seal survives (:269-270)")
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
        h.expect("gear-hi-sol", False,
                 "target_hi went 0, so rung 2907's first contact opens and the seal breaks")
        h.expect("gear-lo-sol", False, "dwell restarted - ENGS not yet re-earned")
        h.expect("gear-shift-enable", False, "T-5 restarts from zero on a new shift")
        h.expect("state", 2, "back to mid-shift waiting on the dwell")

        # --- Phase 8: (f) low shift completes - CTL.M mirrors GSL.M -----------
        h.setp("gear-hi-conf", False)   # fork leaves the high detent
        h.run_ms(1500)

        h.expect("gear-lo-sol", True,
                 "rung 2910 pickup `#LGPRS . ENGS` with LSR selected (:303-304)")
        h.expect("gear-hi-sol", False, "interlocked out by `!prev_lo_sol` / target (:301)")
        h.expect("orient-lo-gear", True,
                 "rung 3001 CTL.M = GSL.M - the mirror must follow up as well as down (:312)")
        h.expect("gear-shift-enable", True, "dwell served again")
        h.expect("state", 3, "3 = SHIFTING")

        # --- Phase 9: (d) again on the low side - LGPRS makes, GSL.M seals ----
        h.setp("gear-lo-conf", True)
        h.run_ms(200)

        h.expect("gear-lo-sol", True,
                 "THE SEAL: `|| prev_lo_sol` (:304) holds GSL.M after LGPRS makes")
        h.expect("orient-lo-gear", True, "mirror still equals the low solenoid (:312)")
        h.expect("gear-confirmed", True, "target is low and LGPRS is made")
        h.expect("gear-shifting", False, "shift complete")
        h.expect("gear-shift-enable", False, "T-5 drops with GSF.N; the seal holds the fork")
        h.expect("gear-hi-sol", False, "never both solenoids (:305)")
        h.expect("fault-any", False,
                 "no AL47 - the whole scenario is far inside gear-shift-timeout")

        return h
