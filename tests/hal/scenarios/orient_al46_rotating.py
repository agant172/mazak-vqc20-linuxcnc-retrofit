"""AL46 (oriented while rotating) is a hard fault that drops the drive arm.

Ladder rung 5508 (docs/ladder/orient_ladder_transcription.md, sheet 55):

    AL46 orient malf 3 (F46) | `#SZS.M . SOSA` + seal - "oriented" while
    spindle not at zero speed -> drops SSET (2305) and ORCM1 (3004)

This is the only orient alarm the ladder lets break the SSET.M seal: an
oriented latch standing while the spindle is demonstrably turning means either
the orient arrival signal or the zero-speed signal is lying, and the machine
must not keep an armed drive under that condition.

Component implementation under test, linuxcnc/components/mazak_orient.comp:

  * :352-353  TMR(t_zs_lost, sosa && !spindle_zero_speed, zero_speed_debounce);
              -> fault_oriented_rotating latched (no seal-break except reset)
  * :229      arm_ok = hyd_pump_on && !fault_oriented_rotating && !drive_fault
              -> drive_arm dropped (the "drops SSET" half of rung 5508)
  * :255-257  cancel includes !drive_arm -> orient_memory cleared
  * :301-304  both gear solenoids require drive_arm in pickup AND seal
  * :324-331  orcm1 requires !fault_oriented_rotating && drive_arm
              -> spindle_orient_cmd dropped (the "drops ORCM1" half)
  * :338      sosa forced 0 while fault_oriented_rotating || cancel
  * :360/:366 fault_any ORs AL46; state = 6 while fault_any

# DIVERGENCE: ladder rung 5508 is UNDEBOUNCED - it is a straight
# `#SZS.M . SOSA` series contact, so on the real M-2 a single scan with SOSA
# set and SZS.M dropped latches F46. The component instead qualifies the test
# with an on-delay of `zero-speed-debounce` (mazak_orient.comp:352-353), using
# the ladder's own T-16 (rung 5501, K 30) as precedent. This is documented as
# an INTENTIONAL deviation in docs/ladder/atc_component_README.md:135-137
# ("AL46 is debounced ... so a legitimate spin-up after unorient cannot trip it
# on one scan"). The assertions below are written for what the COMPONENT does:
# the fault is asserted only after the debounce has elapsed. A human should
# decide whether the added delay is acceptable on the real machine, and confirm
# the real T-16 value, before this is trusted at power-on.

Scaled timers (tests/hal/scenarios/timer_defaults.py asserts the shipped
defaults separately): drive-arm-delay 2.0 -> 0.5, arrival-debounce 0.3 -> 0.1,
zero-speed-debounce left at its 0.1 default but set explicitly so the scenario
does not silently change meaning if the default moves.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from halharness import HalSession  # noqa: E402


def run():
    with HalSession("mazak_orient", "mazak-orient") as h:
        # --- Phase 1: arm the machine ---------------------------------------
        # Rung 2302 (:224): HYD.M = MA.N * SA.N * ESP.M.
        # gear-select-lo + gear-lo-conf makes target_hi = 0 with its PRS
        # confirmed, so shift_pending stays 0 and mid_shift is false
        # (:279-287) - no gear shift interferes and state 0 is reachable.
        h.setp_many({
            "machine-ready": True,
            "servo-ready": True,
            "estop-ok": True,
            "gear-select-lo": True,
            "gear-lo-conf": True,
            "spindle-zero-speed": True,
            "drive-arm-delay": 0.5,       # param: scaled from 2.0
            "arrival-debounce": 0.1,      # param: T-6, scaled from 0.3
            "zero-speed-debounce": 0.1,   # param: T-16, explicit default
        })
        h.run_ms(700)                     # > drive-arm-delay (T-0 equivalent)

        h.expect_all({
            "hyd-pump-on": True,
            "drive-arm": True,
            "gear-confirmed": True,
            "gear-shifting": False,
            "fault-any": False,
            "state": 0,
        }, "armed and idle, low range confirmed")

        # --- Phase 2: reach a legitimate oriented state ---------------------
        # Rung 3003 SOME2 latches the orient memory; rung 3004 ORCM1 asserts
        # with a PRS confirmed and not mid-shift; rung 3006 T-6 debounces ORA1
        # and rung 5509 latches SOSA. spindle-zero-speed is TRUE throughout, so
        # rung 5508 has no reason to trip yet.
        h.setp_many({
            "orient-request": True,
            "spindle-oriented": True,
        })
        h.run_ms(300)                     # > arrival-debounce

        h.expect_all({
            "orient-memory": True,
            "spindle-orient-cmd": True,
            "oriented-latch": True,
            "drive-arm": True,
            "fault-oriented-rotating": False,
            "fault-any": False,
            "state": 5,
        }, "normal ORIENTED state before zero speed is lost")

        # --- Phase 3: SOSA stands while zero speed is lost - rung 5508 ------
        # #SZS.M * SOSA. Held past zero-speed-debounce (0.1 s) with 3x margin.
        h.setp("spindle-zero-speed", False)
        h.run_ms(300)

        h.expect("fault-oriented-rotating", True,
                 "rung 5508: oriented latch present with the spindle turning")
        h.expect("drive-arm", False,
                 "rung 5508 drops SSET - arm_ok has !fault_oriented_rotating (:229)")
        h.expect("spindle-orient-cmd", False,
                 "rung 5508 drops ORCM1 (:328-329)")
        h.expect("orient-memory", False,
                 "cancel includes !drive_arm (:255), so SOME2 is cleared")
        h.expect("oriented-latch", False,
                 "SOSA forced 0 (:338) - the ATC must lose its gate immediately")
        # Neither solenoid is energised in this state (low range is already
        # confirmed, so neither the pickup nor the seal branch is active).
        # These are guard assertions on the drive_arm term at :301-304, not a
        # demonstration of a solenoid being torn down mid-shift.
        h.expect_all({
            "gear-hi-sol": False,
            "gear-lo-sol": False,
        }, "no gear solenoid may be held under AL46")
        h.expect("fault-any", True, "aggregate ORs AL46 (:360)")
        h.expect("state", 6, "6 = FAULT (:366)")

        # --- Phase 4: AL46 is SEALED - restoring zero speed does not clear it
        # The ladder seals F46 through #ALRST; the component's equivalent is
        # that nothing but reset_pulse (:242) writes fault_oriented_rotating
        # false. Note the AL46 timer itself has already re-zeroed (sosa is 0),
        # which is exactly why the latch, not the timer, is what holds.
        h.setp("spindle-zero-speed", True)
        h.run_ms(300)

        h.expect("fault-oriented-rotating", True,
                 "sealed: the alarm does not self-clear when SZS.M returns")
        h.expect("drive-arm", False, "drive stays disarmed until a reset edge")
        h.expect("oriented-latch", False, "SOSA still forced 0 by the latch (:338)")
        h.expect("state", 6, "still FAULT")

        # --- Phase 5: a reset EDGE clears it, and the state rebuilds --------
        # fault-reset is edge triggered (:218). t_arm was never zeroed because
        # hyd_pump_on stayed true, so the drive re-arms without waiting out
        # drive-arm-delay again (:228-233); orient-request and spindle-oriented
        # are still held, so SOME2, ORCM1 and SOSA all come back.
        h.setp("fault-reset", True)
        h.run_ms(60)
        h.setp("fault-reset", False)
        h.run_ms(200)

        h.expect("fault-oriented-rotating", False, "the reset edge breaks the seal")
        h.expect("fault-any", False, "aggregate follows")
        h.expect("drive-arm", True, "SSET re-armed once AL46 is gone (:229-233)")
        h.expect("orient-memory", True, "orient-request still held, SOME2 re-latches")
        h.expect("spindle-orient-cmd", True, "ORCM1 restored (:324-331)")
        h.expect("oriented-latch", True,
                 "ORA1 still true and still debounced, so SOSA re-sets (:336-339)")
        h.expect("state", 5, "5 = ORIENTED")

        return h
