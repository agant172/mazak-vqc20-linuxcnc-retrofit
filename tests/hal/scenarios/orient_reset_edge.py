"""A HELD orient fault-reset must not suppress faults - the reset is edge triggered.

Regression test for commit b68ff66 (2026-08-07), which changed the orient reset
from level to edge:

    reset_pulse = fault_reset && !prev_fault_reset;   [mazak_orient.comp:218]
    prev_fault_reset = fault_reset;                   [mazak_orient.comp:219]

and made that pulse - not the raw input - the thing that breaks every alarm seal
(mazak_orient.comp:239-249). Pre-fix, a stuck-on or operator-held ALRST erased
AL44-AL47 and the orient memory on EVERY scan, so the machine could never report
an orient alarm: AL46 in particular would keep dropping and re-making the drive
arm invisibly instead of latching a hard fault.

scripts/validate_control_logic.py:241 pins the literal source string
`reset_pulse = fault_reset && !prev_fault_reset;`, but nothing anywhere exercises
the BEHAVIOUR. That is what this scenario does.

Fault used as the probe: AL46 fault_oriented_rotating (ladder sheet 55 rung 5508,
`#SZS.M * SOSA` + seal), implemented at mazak_orient.comp:352-353:

    TMR(t_zs_lost, sosa && !spindle_zero_speed, zero_speed_debounce);
    if (ELAPSED(t_zs_lost, zero_speed_debounce)) fault_oriented_rotating = true;

AL46 is chosen because it needs no orient command: ladder rung 5509 sets SOSA from
`[ORCM1.M * seal SOSA] || ORA1(X003)`, i.e. the debounced arrival input alone is
enough (mazak_orient.comp:336-337). So the probe is just "ORA1 true, SZS false",
with no gear shift or M19 in the picture.

# DIVERGENCE: ladder sheet 55 seals AL44-AL47 through a `#ALRST` break contact
# (rungs 5506/5507/5508/5511) and rung 3003 qualifies SOME2 with `#RST`. Ladder
# break contacts are LEVEL sensitive, so on the transcribed logic a continuously
# held ALRST would hold those coils off for as long as it is held. The component
# deliberately does not do that - it acts only on the rising edge
# (mazak_orient.comp:218, 239-249; pin doc :83-84 "A held input does not
# continuously erase new faults"). This scenario asserts the COMPONENT behaviour.
# The deviation is intentional (commit b68ff66) and safety-increasing, but it is
# a documented departure from the transcription and is flagged here for a human.

Every timer below is scaled down with setp; the shipped defaults are asserted
separately by tests/hal/scenarios/timer_defaults.py.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from halharness import HalSession  # noqa: E402


def run():
    with HalSession("mazak_orient", "mazak-orient") as h:
        h.setp_many({
            # Sheet 23 rung 2302: HYD.M = MA.N * SA.N * ESP.M  (:224).
            "machine-ready": True,
            "servo-ready": True,
            "estop-ok": True,
            # T-0 drive arm on-delay, scaled from 2.0 s (:177, :228-234).
            "drive-arm-delay": 0.2,
            # T-6 ORA1 debounce, scaled from 0.3 s (:169, :336).
            "arrival-debounce": 0.1,
            # T-16 zero-speed echo debounce, the AL46 qualifier (:179, :352).
            "zero-speed-debounce": 0.2,
            # AL44 is NOT the subject here. Push T-17 well past the whole
            # scenario so an incidental oriented-with-no-command warning cannot
            # confuse the AL46 readings. (AL44 is excluded from fault_any at
            # :360-361 anyway, so it never reaches `state` either.)
            "no-cmd-alarm-delay": 5.0,
            # A confirmed gear position: target = low and PRS-12 made, so
            # any_prs is true, tgt_conf is true, shift_pending clears and
            # mid_shift is false (:269-288). Without a PRS confirm mid_shift is
            # permanently true (`|| !any_prs`), which would park the machine in
            # a gear evaluation and eventually arm the AL47 watchdog.
            "gear-select-lo": True,
            "gear-lo-conf": True,
            # Spindle genuinely stopped and not oriented while we arm.
            "spindle-zero-speed": True,
            "spindle-oriented": False,
        })

        # --- Phase 0: arm the drive. -------------------------------------
        h.run_ms(500)
        h.expect_all({
            "hyd-pump-on": True,      # rung 2302
            "drive-arm": True,        # rung 2305, sealed after T-0
            "gear-confirmed": True,   # PRS-12 made
            "gear-shifting": False,   # not mid-shift
            "fault-any": False,
            "state": 0,               # IDLE
        }, "armed and idle before any fault is provoked")

        # --- Phase 1: raise fault-reset and LEAVE IT HIGH. ---------------
        # This is one genuine rising edge (prev_fault_reset was 0 through
        # phase 0), so it fires reset_pulse exactly once and then never again
        # while the input stays high.
        h.setp("fault-reset", True)
        h.run_ms(150)
        h.expect("drive-arm", True,
                 "a reset pulse must not drop the sealed drive arm (:239-249 "
                 "touches alarms and memories only)")

        # --- Phase 2: provoke AL46 with fault-reset still continuously TRUE.
        # ORA1 true (debounced -> SOSA, rung 5509) while SZS is false, held
        # past T-16 -> rung 5508 latches AL46.
        h.setp_many({
            "spindle-oriented": True,
            "spindle-zero-speed": False,
        })
        h.run_ms(700)   # >> arrival-debounce 0.1 + zero-speed-debounce 0.2

        h.expect("fault-oriented-rotating", True,
                 "THE REGRESSION: AL46 must latch even though fault-reset has "
                 "been held TRUE the whole time")
        h.expect("fault-any", True, "aggregate reflects the latch (:360-361)")
        h.expect("drive-arm", False,
                 "rung 2305 / :229 - AL46 is the one orient bit that drops SSET")
        h.expect("spindle-orient-cmd", False,
                 "rung 3004 / :324-331 - ORCM1 blocked by #AL46 and by the "
                 "dropped drive arm")
        h.expect("oriented-latch", False,
                 ":338 - SOSA is forced clear once AL46 is latched")
        h.expect("state", 6, "FAULT dominates the priority ladder (:366)")

        # Keep holding fault-reset high: still latched, not a one-scan fluke.
        h.run_ms(400)
        h.expect("fault-oriented-rotating", True,
                 "held-high fault-reset never re-pulses, so the seal stands")
        h.expect("drive-arm", False, "and the drive stays disarmed")

        # --- Phase 3: a genuine falling+rising edge DOES clear it... ------
        # Widen T-16 first so there is a comfortable window between "cleared"
        # and "re-latched"; the underlying condition is deliberately left in
        # place (still oriented, still not at zero speed).
        h.setp("zero-speed-debounce", 0.6)

        h.setp("fault-reset", False)
        h.run_ms(150)
        h.expect("fault-oriented-rotating", True,
                 "releasing the reset input is not itself a clear")

        h.setp("fault-reset", True)
        h.run_ms(150)   # << the new 0.6 s T-16: cleared, not yet re-latched
        h.expect("fault-oriented-rotating", False,
                 "the rising edge breaks the AL46 seal (:242)")
        h.expect("fault-any", False, "aggregate follows")
        h.expect("drive-arm", True,
                 "arm_ok recovers the scan after the clear and t_arm is still "
                 "at its limit, so the seal re-makes immediately (:228-234)")
        h.expect("oriented-latch", True,
                 "ORA1 is still debounced-true, so SOSA comes straight back "
                 "(:336-337)")

        # ...but the cause was never removed, so it re-latches.
        h.run_ms(1500)   # >> zero-speed-debounce 0.6
        h.expect("fault-oriented-rotating", True,
                 "still oriented while not at zero speed: AL46 re-latches. "
                 "Resetting past an unfixed condition buys one dwell, not an "
                 "escape")
        h.expect("drive-arm", False, "and drops the arm again")

        # --- Phase 4: remove the cause first, then reset - it stays clear. -
        h.setp("spindle-zero-speed", True)
        h.setp("fault-reset", False)
        h.run_ms(150)
        h.setp("fault-reset", True)
        h.run_ms(1500)   # >> zero-speed-debounce 0.6

        h.expect("fault-oriented-rotating", False,
                 "SZS restored, so the rung 5508 pickup path is open")
        h.expect("fault-any", False, "no latched orient alarm remains")
        h.expect("drive-arm", True, "rung 2305 seal restored")
        h.expect("oriented-latch", True,
                 "SOSA held from the debounced ORA1 branch of rung 5509")
        h.expect("state", 5, "ORIENTED (:367)")

        return h
