"""Tool unclamp only energises with SOSA, zero speed, no spindle run, and hydraulics.

Under test: the rung 3604 unclamp gate and the two confirm coils in
linuxcnc/components/mazak_atc.comp:465-488 -

    unclamp_gate = oriented_latch && spindle_stopped && !spindle_run
                   && permissives;                                      [:465]
    unclamp_cmd  = ((unclamp_request && unclamp_gate)
                    || manual_ok
                    || (prev_unclamp && (unclamp_request
                                         || manual_unclamp_pb)))
                   && !spindle_run && permissives;                      [:472]
    unclamp_confirmed = (unclamp_cmd && tool_unclamped);                [:487]
    clamp_confirmed   = (tool_clamped && !tool_unclamp_sol);            [:488]

Ladder authority, docs/ladder/atc_ladder_transcription.md:

  rung 3604 (line 71) TUC.M (Y097) TOOL UNCLAMP =
      [TUCPLS || F1-key path || SOSA(M92)*TUCME] * seal TUC.M
      * #TCLPLS * #SMR(spindle-run)
    "auto unclamp requires the oriented latch SOSA ... never while spindle runs"
  rung 3509 (line 67) M69 unclamp confirmed = TUCME * TUCPRS(X019) * TUC.M(Y097)
  rung 3607 (line 73) M64 clamp confirmed   = TCPRS(X018) * #TUCME * #TUC.M

Why it matters: this coil drops a tool out of a spindle taper. Every term is a
person-injury interlock, and `permissives` (hydraulic_ok && air_ok && !faulted
&& !cycle_abort, :312) is the hydraulic half of it. The scenario walks each
gate term missing in turn and only then satisfies all of them.

Ordering note: the seal term at :474 means the negative cases MUST be checked
before the coil is ever energised - once prev_unclamp is set, a still-held
unclamp-request keeps the coil alive even if oriented-latch drops. That
behaviour is asserted deliberately in phase C, along with the `#SMR` term that
breaks the seal.

No timer is scaled here. Every window in which the coil is energised without
tool-unclamped made is ~150 ms against the 3.0 s unclamp-timeout default
(:490-491), so t_unclamp never elapses; the scenario asserts that at the end.
tests/hal/scenarios/timer_defaults.py owns the shipped-default assertions.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from halharness import HalSession  # noqa: E402


def run():
    with HalSession("mazak_atc", "mazak-atc") as h:
        # Baseline. mag-cover-open-conf TRUE is required housekeeping: without
        # it t_cover_not_open (:362) latches fault_cover_not_open after
        # cover-confirm-delay and poisons `permissives` for an unrelated
        # reason. allow-manual-unclamp FALSE removes the footswitch path
        # (:469) so only the rung 3604 auto path is under test. Tool numbers
        # are left at 0 so the rung 3504-3507 range check stays clear.
        h.setp_many({
            "hydraulic-ok": True,
            "air-ok": True,
            "mag-cover-open-conf": True,
            "allow-manual-unclamp": False,   # param
            "manual-unclamp-pb": False,
        })
        h.run_ms(120)
        h.expect_all({
            "unclamp-permit": False,
            "tool-unclamp-sol": False,
            "fault-any": False,
        }, "at rest: no oriented latch, no permit, no coil")

        # ------------------------------------------------------------------
        # Phase A - request held TRUE, one gate term missing at a time.
        # The remap owning unclamp (TUCME, rung 3508) is not enough on its own.
        # ------------------------------------------------------------------
        h.setp("unclamp-request", True)

        # A1: oriented latch missing (rung 3604 SOSA term). Spindle is stopped
        # and not running, hydraulics up - only SOSA is absent.
        h.setp_many({"oriented-latch": False,
                     "spindle-stopped": True,
                     "spindle-run": False})
        h.run_ms(150)
        h.expect_all({"unclamp-permit": False, "tool-unclamp-sol": False},
                     "A1: no SOSA oriented latch - rung 3604 auto path blocked")

        # A2: zero-speed confirm missing (X001 SZS.M).
        h.setp_many({"oriented-latch": True, "spindle-stopped": False})
        h.run_ms(150)
        h.expect_all({"unclamp-permit": False, "tool-unclamp-sol": False},
                     "A2: spindle-stopped FALSE - no zero-speed confirm")

        # A3: spindle run memory set (rung 3604 #SMR). Never while it runs.
        h.setp_many({"spindle-stopped": True, "spindle-run": True})
        h.run_ms(150)
        h.expect_all({"unclamp-permit": False, "tool-unclamp-sol": False},
                     "A3: spindle-run TRUE - rung 3604 forbids unclamp")

        # A4: hydraulics lost. Reaches the gate through `permissives` (:312).
        h.setp_many({"spindle-run": False, "hydraulic-ok": False})
        h.run_ms(150)
        h.expect_all({"unclamp-permit": False, "tool-unclamp-sol": False},
                     "A4: hydraulic-ok FALSE - permissives drop the gate")

        # ------------------------------------------------------------------
        # Phase B - all gates satisfied. Permit is a gate indicator only, so
        # check it with the request dropped before re-asserting the request.
        # ------------------------------------------------------------------
        h.setp_many({"hydraulic-ok": True, "unclamp-request": False})
        h.run_ms(150)
        h.expect("unclamp-permit", True,
                 "B: SOSA + zero speed + not running + permissives")
        h.expect("tool-unclamp-sol", False,
                 "B: permit alone must not energise the coil - TUCME is separate")
        h.expect("fault-any", False, "no fault latched during the gate matrix")

        # Now the cycle chain asks for unclamp with every gate made.
        h.setp("unclamp-request", True)
        h.run_ms(150)
        h.expect("tool-unclamp-sol", True,
                 "B: request AND full gate - the only case that energises Y097")
        h.expect("unclamp-confirmed", False,
                 "rung 3509: commanded but TUCPRS not yet made")
        h.expect("clamp-confirmed", False,
                 "rung 3607: unclamp output energised")

        # TUCPRS (X019) makes.
        h.setp("tool-unclamped", True)
        h.run_ms(150)
        h.expect("unclamp-confirmed", True,
                 "rung 3509: commanded AND TUCPRS made (:487)")

        # ------------------------------------------------------------------
        # Phase C - the seal (rung 3604 "seal TUC.M") and the #SMR break.
        # ------------------------------------------------------------------
        h.setp("oriented-latch", False)
        h.run_ms(150)
        h.expect("unclamp-permit", False, "C: gate indicator follows SOSA away")
        h.expect("tool-unclamp-sol", True,
                 "C: sealed by prev_unclamp + held request (:474), as rung 3604 seals")

        # #SMR breaks the seal even mid-unclamp (:475).
        h.setp("spindle-run", True)
        h.run_ms(150)
        h.expect("tool-unclamp-sol", False,
                 "C: spindle-run breaks the seal - rung 3604 #SMR")

        # And it does not come back on its own: the seal is gone with it, and
        # the auto path still needs SOSA.
        h.setp("spindle-run", False)
        h.run_ms(150)
        h.expect("tool-unclamp-sol", False,
                 "C: after the seal is broken, re-arming needs the oriented latch again")

        # ------------------------------------------------------------------
        # Phase D - clamp-confirmed must not assert while the coil is live.
        # ------------------------------------------------------------------
        h.setp("oriented-latch", True)
        h.run_ms(150)
        h.expect("tool-unclamp-sol", True, "D: re-armed with SOSA back")

        # tool-clamped forced TRUE while the unclamp coil is energised. This is
        # mechanically contradictory on the real machine (TCPRS and TUCPRS both
        # made), which is exactly why rung 3607 requires the coil term too: a
        # welded/miswired TCPRS must not be able to report "clamped" while
        # hydraulic unclamp pressure is applied.
        h.setp("tool-clamped", True)
        h.run_ms(150)
        h.expect("tool-unclamp-sol", True, "D: coil still energised")
        h.expect("clamp-confirmed", False,
                 "THE ASSERTION: rung 3607 needs #TUC.M as well as TCPRS (:488)")

        # ------------------------------------------------------------------
        # Phase E - drop the request: clamp is the de-energised state.
        # ------------------------------------------------------------------
        h.setp_many({"unclamp-request": False, "tool-unclamped": False})
        h.run_ms(150)
        h.expect("tool-unclamp-sol", False,
                 "E: dropping TUCME clamps - no separate clamp command exists")
        h.expect("unclamp-confirmed", False, "E: nothing commanded, nothing confirmed")
        h.expect("clamp-confirmed", True,
                 "E: rung 3607 satisfied - TCPRS made AND the unclamp output false")
        h.expect("fault-unclamp-timeout", False,
                 "no energised window in this scenario approaches the 3.0 s default")
        h.expect("fault-any", False, "no fault latched anywhere in the scenario")

        # DIVERGENCE: the component sheds one ladder term in EACH confirm coil.
        #   rung 3509 (atc_ladder_transcription.md:67) draws
        #       M69 = TUCME * TUCPRS * TUC.M   (three terms)
        #   the component computes
        #       unclamp_confirmed = unclamp_cmd && tool_unclamped  (:487)
        #   which folds TUCME and TUC.M into the single unclamp_cmd variable.
        #   These coincide only because tool_unclamp_sol is assigned straight
        #   from unclamp_cmd (:477) and the seal keeps the coil up when the
        #   request drops mid-cycle - i.e. the ladder's separate TUCME contact
        #   is not independently represented.
        #   rung 3607 (atc_ladder_transcription.md:73) draws
        #       M64 = TCPRS * #TUCME * #TUC.M  (three terms)
        #   the component computes
        #       clamp_confirmed = tool_clamped && !tool_unclamp_sol  (:488)
        #   dropping the #TUCME term, so during the seal window (request
        #   already dropped, coil not yet de-energised) the two differ.
        #   docs/ladder/atc_component_README.md:77-78 records both coils as
        #   implemented "as drawn", which is not literally true for either.
        #   Not adjudicated here: no assertion in this file picks a side, and
        #   every expectation above matches the component as written.

        return h
