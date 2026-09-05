"""An FR-SX drive fault must drop the drive arm and every orient output.

Regression test for commit b68ff66 (2026-08-07), which added the `!drive_fault`
term to arm_ok in linuxcnc/components/mazak_orient.comp:229 -

    arm_ok = hyd_pump_on && !fault_oriented_rotating && !drive_fault;

scripts/validate_control_logic.py:239 pins that exact source string, and
:238 pins the HAL net `spindle-fault => mazak-orient.drive-fault`, but nothing
in the repo exercises the BEHAVIOUR. This scenario does.

Mechanism under test (mazak_orient.comp:228-233, 255-260, 301-307, 324-340):
drive_arm is the single bit the rest of the component hangs off. Dropping it
propagates in one scan:

  * cancel  = orient_cancel || reset_pulse || !drive_arm            (:255)
              -> orient_memory cleared (:256-257) and sosa forced 0 (:338)
  * gear_hi_sol / gear_lo_sol are NOT affected (B3, 2026-09-05): the coil
    equations carry no drive_arm term, matching rungs 2907/2910
  * orcm1 requires `drive_arm`                                      (:329)
  * fault_any = drive_fault || ...                                  (:360)
  * state = 6 while fault_any                                       (:366)

# DIVERGENCE: ladder rung 2305 (docs/ladder/orient_ladder_transcription.md,
# sheet 23, corrected 2026-09-02) draws SSET.M as
# `[(HYD.M || seal).PW1.M.#ESPT || DIHT.N || TOUCH.N].#AL46` (no power-on
# delay; T-0 is a post-pump-stop grace) - it has NO external drive-fault
# contact, and the derived sequence drops the arm only on the pump-stop grace
# or an AL46-type fault. The component deliberately adds
# !drive_fault (comp header lines 26-27: "The external FR-SX fault input also
# drops the drive arm, gear outputs, and orient command"), because the retrofit
# feeds the FR-SX alarm in as a discrete where the M-2 did not. The assertions
# below are written for what the COMPONENT does. A human should decide whether
# the ladder transcription should be annotated to match.

drive_arm_delay is scaled 2.0 -> 1.0 s via setp; tests/hal/scenarios/
timer_defaults.py asserts the shipped defaults separately.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from halharness import HalSession  # noqa: E402


def run():
    with HalSession("mazak_orient", "mazak-orient") as h:
        # --- Phase 1: bring the machine up to a normal armed state ----------
        # Rung 2302: HYD.M = MA.N * SA.N * ESP.M (comp :224).
        # gear-lo-conf TRUE with gear-select-lo TRUE means target_hi = 0 and
        # tgt_conf is made, so shift_pending stays 0 and mid_shift is false
        # (:279-287) - no gear shift is in progress. Under the corrected
        # gear-solenoid topology (item 5, applied 2026-09-04) gear-lo-sol's
        # own ungated target term (mazak_orient.comp:333) holds it up at
        # rest whenever low is the confirmed/selected range, so idle here is
        # state 3 (a solenoid energised), not state 0.
        # spindle-zero-speed TRUE keeps AL46 (:352-353) from tripping once the
        # oriented latch is set.
        h.setp_many({
            "machine-ready": True,
            "servo-ready": True,
            "estop-ok": True,
            "gear-select-lo": True,
            "gear-lo-conf": True,
            "spindle-zero-speed": True,
            "drive-arm-delay": 1.0,     # param: scaled down from 2.0
        })
        h.run_ms(1300)                  # > drive-arm-delay, T-0 equivalent

        h.expect_all({
            "hyd-pump-on": True,
            "drive-arm": True,
            "fault-any": False,
            "gear-confirmed": True,
            "gear-shifting": False,
            "gear-lo-sol": True,
            "state": 3,
        }, "armed and idle, gear low confirmed and held (:333)")

        # --- Phase 2: establish a normal oriented state ---------------------
        # Rung 3003 SOME2: orient-request latches orient_memory now that
        # drive_arm is true (before that, cancel held it clear via !drive_arm).
        # Rung 3004 ORCM1 then asserts, and ORA1 debounced by T-6
        # (arrival-debounce, 0.3 s default) latches SOSA at :336-339.
        h.setp_many({
            "orient-request": True,
            "spindle-oriented": True,
        })
        h.run_ms(500)                   # > arrival-debounce

        h.expect_all({
            # Item 7 (applied 2026-09-04): rung 3003's #SOSA self-clear is now
            # implemented, so orient-memory drops the scan after oriented-latch
            # sets - spindle-orient-cmd stays up regardless, held by its OWN
            # true seal (prev_orcm1), not by orient-memory.
            "orient-memory": False,
            "spindle-orient-cmd": True,
            "oriented-latch": True,
            "drive-arm": True,
            "fault-any": False,
            "state": 5,
        }, "normal oriented state before the fault")

        # --- Phase 3: THE REGRESSION - assert the FR-SX drive fault ---------
        h.setp("drive-fault", True)
        h.run_ms(150)

        h.expect("drive-arm", False,
                 "THE REGRESSION: !drive_fault in arm_ok (:229) must drop SSET")
        h.expect("orient-memory", False,
                 "cancel includes !drive_arm (:255), so SOME2 drops")
        h.expect("oriented-latch", False,
                 "SOSA forced 0 by cancel (:338) - the ATC must lose its gate")
        h.expect("spindle-orient-cmd", False,
                 "ORCM1 requires drive_arm (:329)")
        # B3 APPLIED 2026-09-05: the coil equations no longer contain
        # drive_arm (rungs 2907/2910 have no SSET/HYD contact), so the
        # low-gear coil KEEPS its hold through the drive fault - the fork
        # stays pressed into gear while the spindle may still be coasting,
        # exactly the OEM behaviour. Only the handoff sequence and AL47 can
        # drop a coil now.
        h.expect_all({
            "gear-hi-sol": False,
            "gear-lo-sol": True,
        }, "B3: gear coil holds through a drive fault (no arm term in rung 2910)")
        h.expect("fault-any", True, "aggregate ORs the external drive fault (:360)")
        h.expect("state", 6, "6 = FAULT (:366)")

        # --- Phase 4: drive-fault is an INPUT, not a latch ------------------
        # There is no seal on drive_fault and no fault_reset edge is needed:
        # clearing the input restores arm_ok. t_arm was never zeroed because
        # hyd_pump_on stayed true throughout (TMR at :228 only clears when its
        # condition goes false), so ELAPSED(t_arm, drive_arm_delay) is still
        # satisfied and the drive re-arms on the first scan - it does NOT wait
        # out drive-arm-delay again (:228-233). The window below is far shorter
        # than the 1.0 s delay, which is what makes that observable.
        h.setp("drive-fault", False)
        h.run_ms(120)

        h.expect("drive-arm", True,
                 "re-arms immediately: t_arm still elapsed, no reset required")
        h.expect("fault-any", False, "nothing latched - drive_fault is a level input")
        # orient-memory pulses True for one scan (rebuilding spindle-orient-cmd's
        # own seal) then self-clears again: spindle-oriented never dropped, so
        # t_arrival's debounce was already elapsed - oriented-latch snaps back
        # immediately and by the time this check runs orient-memory has
        # cleared via its #SOSA term (item 7).
        h.expect("orient-memory", False, "SOME2 re-latched and self-cleared again (item 7)")
        h.expect("spindle-orient-cmd", True, "ORCM1 rebuilt fresh, now held by its own seal")
        h.expect("oriented-latch", True,
                 "ORA1 still true and debounced, so SOSA re-sets (:336-339)")
        h.expect("state", 5, "5 = ORIENTED")

        return h
