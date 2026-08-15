"""Clamp timeout must drop the clamp coil, not leave it energised.

Regression test for the audit fix dated 2026-08-07, recorded in
linuxcnc/components/mazak_atc.comp:478-482:

    "a clamp/unclamp timeout must drop the clamp-side coil (not just the
     unclamp path) so a latched fault removes ALL asserted tool-change
     outputs. Without this, fault_clamp_timeout leaves tool_clamp_sol
     asserted until a fault_reset."

The mechanism is that `permissives` contains `!faulted`, so latching
fault_clamp_timeout removes the third term of

    tool_clamp_sol = (clamp_dual_coil && !unclamp_cmd && permissives)   [:483]

Nothing else in the repo pins this behaviour: validate_control_logic.py checks
the ATC component only for four literal source strings, none of them this one.

Timer condition under test, mazak_atc.comp:495-497 -

    TMR(t_clamp, cycle_active && !unclamp_cmd && prev_unclamp == 0
                 && !tool_clamped && !ts0, clamp_timeout);

clamp_timeout is scaled 3.0 -> 0.5 s via setp; tests/hal/scenarios/
timer_defaults.py asserts the shipped default separately.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from halharness import HalSession  # noqa: E402


def run():
    with HalSession("mazak_atc", "mazak-atc") as h:
        # Permissives up. mag-cover-open-conf is required: without it
        # t_cover_not_open (:362) latches fault_cover_not_open after
        # cover_confirm_delay and poisons `permissives` for the wrong reason.
        h.setp_many({
            "hydraulic-ok": True,
            "air-ok": True,
            "mag-cover-open-conf": True,
            "clamp-dual-coil": True,      # param: enable the optional clamp coil
            "clamp-timeout": 0.5,         # param: scaled down from 3.0
            # spindle-tool != 0 so ts0 is false; both <= pot-count (20) so the
            # rung 3504-3507 range check stays clear.
            "spindle-tool": 5,
            "commanded-tool": 7,
            "target-pot": 7,
        })

        # Enter a cycle with the tool never confirming clamped.
        h.setp("cycle-start", True)
        h.run_ms(150)

        h.expect_all({
            "cycle-active": True,
            "fault-clamp-timeout": False,
            "fault-any": False,
            "tool-clamp-sol": True,
        }, "before the timeout elapses")

        # Run past clamp-timeout.
        h.run_ms(800)

        h.expect("fault-clamp-timeout", True, "TCPRS never made")
        h.expect("fault-any", True, "aggregate must reflect the latch")
        h.expect("tool-clamp-sol", False,
                 "THE REGRESSION: latched fault must drop the clamp coil")
        h.expect("tool-unclamp-sol", False, "unclamp coil stays de-energised")
        h.expect("mag-fwd-sol", False, "no magazine motion under fault")
        h.expect("mag-rev-sol", False, "no magazine motion under fault")
        h.expect("step1-permit", False, "step 1 blocked while faulted")

        # A reset pulse clears the latch. Note it also ends the cycle -
        # mazak_atc.comp:322 `if (cycle_abort || reset_pulse) cycle_active =
        # false;` - which breaks the t_clamp condition and zeroes the timer.
        # fault-reset is edge triggered (:288), so pulse it.
        h.setp("fault-reset", True)
        h.run_ms(60)
        h.setp("fault-reset", False)
        h.run_ms(30)

        h.expect("fault-clamp-timeout", False, "the reset edge clears the latch")
        h.expect("tool-clamp-sol", True, "clamp coil re-energises with permissives")

        # ...but cycle-start is still held, so cycle_active re-asserts on the
        # next scan (:324) and the unresolved mechanical condition re-arms the
        # watchdog. Resetting past a fault you have not fixed buys one timeout,
        # not an escape.
        h.run_ms(800)
        h.expect("fault-clamp-timeout", True,
                 "re-latches while TCPRS is still not made")
        h.expect("tool-clamp-sol", False, "and drops the coil again")

        # Resolve the cause, then reset: now it stays clear.
        h.setp("tool-clamped", True)
        h.setp("fault-reset", True)
        h.run_ms(60)
        h.setp("fault-reset", False)
        h.run_ms(800)

        h.expect("fault-clamp-timeout", False, "stays clear once TCPRS is made")
        h.expect("fault-any", False, "aggregate follows")
        h.expect("tool-clamp-sol", True, "clamp coil restored with permissives")
        h.expect("clamp-confirmed", True,
                 "rung 3607: TCPRS made AND unclamp output false")

        return h
