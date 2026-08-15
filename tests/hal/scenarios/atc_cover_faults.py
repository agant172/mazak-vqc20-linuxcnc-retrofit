"""Each of the four magazine-cover alarms AL71-AL74 latches on its own condition.

Subject: the cover block of mazak_atc.comp:354-376, which implements the sheet-58
alarm group and rung 7009 MGCOX.

Ladder grounding (docs/ladder/atc_ladder_transcription.md:121-125):

  - line 121: "MGC.M (Y026) is a single-solenoid valve: energized = close,
    de-energized = open".  The component keeps that convention at
    mazak_atc.comp:354 - `mag_cover_sol = cover_close_request && permissives`.
    There is no separate "open" output, so "commanded open" means `!mag_cover_sol`.
  - line 122, rung 7009: MGCOX (M163) = `#MGC.M . MGCORS(X052) . #AL71 . #AL74`,
    reproduced verbatim at mazak_atc.comp:371-373 as `cover_open_verified`.
  - lines 124-125, sheet 58, all four delayed by T30:
        AL71 close-RS on while not commanded   -> mazak_atc.comp:356,365
        AL72 commanded closed, RS off          -> mazak_atc.comp:358,366
        AL73 open-RS on faulty                 -> mazak_atc.comp:360,367
        AL74 commanded open, open-RS off       -> mazak_atc.comp:362,368

Each alarm is exercised in isolation: the input combination for one case holds
the other three TMR conditions (mazak_atc.comp:273-277) at zero, so exactly one
timer can run at a time.  Between cases the fixture returns to the clean
"cover properly open" state - `!sol . closed_conf=0 . open_conf=1` - which is the
only input combination that arms no cover timer at all, and pulses fault-reset
across it (the reset is edge triggered, mazak_atc.comp:288).

T30 is `cover_confirm_delay`, a `param rw` defaulting to 3.0 s; it is scaled to
0.6 s here so the whole scenario runs in a few seconds.  The shipped default is
asserted separately by tests/hal/scenarios/timer_defaults.py.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from halharness import HalSession  # noqa: E402

# T30 scaled down.  Every "not yet" window is ~150 ms (plus harness overhead,
# which always adds) and every "now it must have latched" window carries the
# cumulative total well past this, so both sides keep >= 2x margin.
DELAY = 0.6

# The clean state: cover de-energised (= commanded open) and the open reed
# switch made.  t_cover_close_rs needs closed_conf, t_cover_not_closed and
# t_cover_open_rs both need sol, t_cover_not_open needs !open_conf - all four
# are held at zero here.
NEUTRAL = {
    "cover-close-request": False,
    "mag-cover-closed-conf": False,
    "mag-cover-open-conf": True,
}


def run():
    with HalSession("mazak_atc", "mazak-atc") as h:

        def clean(note):
            """Return to the neutral cover state and clear every latched fault."""
            h.setp_many(NEUTRAL)
            h.setp("fault-reset", True)
            h.run_ms(60)
            h.setp("fault-reset", False)
            h.run_ms(60)
            h.expect_all({
                "fault-any": False,
                "mag-cover-sol": False,
                "cover-open-verified": True,
            }, note)

        # `permissives` (mazak_atc.comp:317) gates mag_cover_sol, so hydraulics
        # and air must be up or the close command can never be issued at all.
        # commanded-tool / target-pot are left at 0, below pot-count (20), so the
        # rung 3504-3507 range check (:346) cannot latch fault_tool_range.
        h.setp_many({
            "hydraulic-ok": True,
            "air-ok": True,
            "cover-confirm-delay": DELAY,
        })
        h.setp_many(NEUTRAL)
        h.run_ms(150)

        # ---- rung 7009 MGCOX, clean case -------------------------------------
        # #MGC.M . MGCORS . #AL71 . #AL74, all four terms satisfied.
        h.expect_all({
            "mag-cover-sol": False,
            "cover-open-verified": True,
            "cover-closed-verified": False,
            "fault-any": False,
        }, "rung 7009: valve de-energised + open RS made + no cover alarm")

        # =====================================================================
        # AL71 - close reed switch made while close is NOT commanded.
        # TMR(t_cover_close_rs, !mag_cover_sol && mag_cover_closed_conf)  :356
        # Open RS left made so t_cover_not_open (:362) stays at zero.
        # =====================================================================
        h.setp("mag-cover-closed-conf", True)
        h.run_ms(150)
        h.expect("fault-cover-close-rs", False, "AL71 is delayed by T30, not instant")
        h.expect("cover-open-verified", True,
                 "rung 7009 still true before the alarm latches")

        h.run_ms(550)
        h.expect("fault-cover-close-rs", True,
                 "AL71: MGCCRS made with the valve de-energised")
        h.expect_all({
            "fault-cover-not-closed": False,
            "fault-cover-open-rs": False,
            "fault-cover-not-open": False,
        }, "AL71 case must not trip the other three")
        h.expect("fault-any", True, "aggregate (:532) follows")
        h.expect("cover-open-verified", False,
                 "rung 7009 #AL71 term drops MGCOX even though MGCORS is still made")

        # DIVERGENCE: ladder rung 6505 (transcription line 19) gives the barrier
        # as `(OTR.B . MGCORS) || TCME` with no alarm term, so the OEM keeps the
        # barrier extended while the cover reads open regardless of AL71-AL74.
        # The component adds `&& !faulted` (mazak_atc.comp:328-329), so a latched
        # cover alarm RETRACTS the barrier while MGCORS is still made.  Asserting
        # what the component does; a human should adjudicate which is wanted.
        h.expect("atc-barrier", False,
                 "component retracts the barrier under any latched fault (:328)")

        clean("AL71 cleared by the fault-reset edge")

        # =====================================================================
        # AL72 - close commanded, closed reed switch never makes.
        # TMR(t_cover_not_closed, mag_cover_sol && !mag_cover_closed_conf)  :358
        # Open RS dropped so t_cover_open_rs (:360) stays at zero; both !sol
        # timers are held at zero by the close command itself.
        # =====================================================================
        h.setp_many({
            "cover-close-request": True,
            "mag-cover-closed-conf": False,
            "mag-cover-open-conf": False,
        })
        h.run_ms(150)
        h.expect("mag-cover-sol", True,
                 "single solenoid energised = CLOSE (transcription line 121)")
        h.expect("fault-cover-not-closed", False, "T30 has not elapsed yet")
        h.expect("cover-open-verified", False, "#MGC.M term of rung 7009 is false")

        h.run_ms(550)
        h.expect("fault-cover-not-closed", True,
                 "AL72: MGCCRS never made after the close command")
        h.expect_all({
            "fault-cover-close-rs": False,
            "fault-cover-open-rs": False,
        }, "AL72 case must not trip the sol-side or closed-RS alarms")
        # NOTE: fault_cover_not_open is deliberately NOT asserted here.  Once
        # AL72 latches, `permissives` goes false and mag_cover_sol drops (:354,
        # :317), which starts t_cover_not_open running with the open RS still
        # unmade.  The residual accumulation inside this window is a small
        # fraction of DELAY, but it is a real cascade and asserting FALSE on it
        # would be asserting on harness overhead.
        h.expect("mag-cover-sol", False,
                 "fail-safe: a latched fault poisons permissives and "
                 "de-energises the valve, i.e. commands the cover OPEN")
        h.expect("cover-closed-verified", False,
                 "MGCCRS never made, and the alarm blocks it besides")

        clean("AL72 cleared by the fault-reset edge")

        # =====================================================================
        # AL73 - open reed switch made while close IS commanded.
        # TMR(t_cover_open_rs, mag_cover_sol && mag_cover_open_conf)  :360
        # Closed RS also made so t_cover_not_closed (:358) stays at zero.
        # DIVERGENCE-ADJACENT: transcription line 125 records AL73 only as
        # "open-RS on faulty (MGCOONF/MGCHOONF)" without naming the qualifying
        # condition; the component pins it to `sol && open_conf`
        # (mazak_atc.comp:360).  Asserting the component's reading - the source
        # ladder sheet 58 should be re-read before this is called verified.
        # =====================================================================
        h.setp_many({
            "cover-close-request": True,
            "mag-cover-closed-conf": True,
            "mag-cover-open-conf": True,
        })
        h.run_ms(150)
        h.expect("mag-cover-sol", True, "close commanded")
        h.expect("fault-cover-open-rs", False, "T30 has not elapsed yet")
        h.expect("cover-closed-verified", True,
                 "MGC.M . MGCCRS with no cover alarm yet (:374-376)")

        h.run_ms(550)
        h.expect("fault-cover-open-rs", True,
                 "AL73: MGCORS still made with the valve energised to close")
        h.expect_all({
            "fault-cover-not-closed": False,
            "fault-cover-not-open": False,
        }, "AL73 case must not trip the two 'never confirmed' alarms")
        h.expect("cover-closed-verified", False,
                 "the #AL73 term (:374-376) drops the rotation interlock")
        # As in the AL72 case, the drop of mag_cover_sol at the latch starts
        # t_cover_close_rs (closed RS still made), so AL71 is not asserted here.

        clean("AL73 cleared by the fault-reset edge")

        # =====================================================================
        # AL74 - open commanded (valve de-energised) and the open RS never makes.
        # TMR(t_cover_not_open, !mag_cover_sol && !mag_cover_open_conf)  :362
        # Closed RS left unmade so t_cover_close_rs (:356) stays at zero, and
        # both sol-side timers are held at zero by the absence of the command.
        # No cascade: the valve is already de-energised when this one latches.
        # =====================================================================
        h.setp("mag-cover-open-conf", False)
        h.run_ms(150)
        h.expect("fault-cover-not-open", False, "T30 has not elapsed yet")

        h.run_ms(550)
        h.expect("fault-cover-not-open", True,
                 "AL74: MGCORS never made with the cover commanded open")
        h.expect_all({
            "fault-cover-close-rs": False,
            "fault-cover-not-closed": False,
            "fault-cover-open-rs": False,
        }, "AL74 case must not trip the other three")
        h.expect("cover-open-verified", False,
                 "rung 7009 fails on both MGCORS and #AL74")
        h.expect("step1-permit", False,
                 "no D-1/E-1/F-1 permit without MGCOX (rungs 7103/7205/7302)")

        # Fixing the reed switch alone is not enough - the alarm is latched
        # until a reset edge (mazak_atc.comp:288-310).
        h.setp("mag-cover-open-conf", True)
        h.run_ms(150)
        h.expect("fault-cover-not-open", True, "AL74 stays latched without a reset")
        h.expect("cover-open-verified", False, "and MGCOX stays blocked")

        clean("AL74 cleared only by the fault-reset edge")
        h.expect("cover-closed-verified", False,
                 "back to the clean open state, not the closed one")

        return h
