"""Tool/pot range fault (alarm 6101) latches, follows pot-count, and poisons permissives.

Under test: mazak_atc.comp:345-347 -

    /* Rungs 3504-3507 - commanded tool / pot beyond the magazine size. */
    if (commanded_tool > n || target_pot > n || target_pot < 0)
        fault_tool_range = true;

where `n = pot_count` clamped to a minimum of 1 (mazak_atc.comp:291-292).

Ladder authority: docs/ladder/atc_ladder_transcription.md:58 -
    "3504-3507 | GRT15/20/24/30 -> T-command > magazine size -> alarm 6101"
and the implementation row docs/ladder/atc_component_README.md:75.

Why it matters: pot-count is a placeholder (default 20, ATC doc open question
#5, listed in atc_component_README.md's "Placeholders" table). This scenario
proves the range check is genuinely parameterised - it reads the param, not a
hard-coded 20 - so that setting pot-count to the real magazine size on the
machine actually changes the guard. It also pins the two properties that make
the guard useful: the fault is LATCHED (only a fault-reset EDGE clears it,
mazak_atc.comp:288/297-310) and it feeds `faulted` -> `permissives`
(mazak_atc.comp:312-317), so an out-of-range T word drops downstream outputs
instead of merely annunciating.

Nothing in scripts/validate_control_logic.py covers this rung.

No timers are scaled here: the range check is combinational and re-evaluated
every scan. cycle-start is deliberately left FALSE so the clamp watchdog
(mazak_atc.comp:495-497, which requires cycle_active) can never arm, and
mag-cover-open-conf is held TRUE so t_cover_not_open (:362) cannot latch an
unrelated cover fault.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from halharness import HalSession  # noqa: E402


def run():
    with HalSession("mazak_atc", "mazak-atc") as h:
        # Permissive floor. oriented-latch + spindle-stopped make
        # `unclamp_permit` (:465-467) a direct read-out of `permissives`,
        # since unclamp_gate = oriented_latch && spindle_stopped &&
        # !spindle_run && permissives. That is this scenario's probe for
        # "the fault poisoned the permissives".
        h.setp_many({
            "hydraulic-ok": True,
            "air-ok": True,
            "mag-cover-open-conf": True,
            "oriented-latch": True,
            "spindle-stopped": True,
        })

        # ---------------------------------------------------------------
        # In range at the shipped default pot-count = 20.
        # ---------------------------------------------------------------
        h.setp_many({"commanded-tool": 5, "target-pot": 5})
        h.run_ms(120)
        h.expect_all({
            "fault-tool-range": False,
            "fault-any": False,
            "unclamp-permit": True,
            "atc-barrier": True,
        }, "T5 / pot 5 against pot-count 20 is in range")

        # Boundary: the test is strictly greater-than, so tool == pot-count
        # and pot == pot-count are legal. Pot 20 is the last pocket, not one
        # past the end.
        h.setp_many({"commanded-tool": 20, "target-pot": 20})
        h.run_ms(120)
        h.expect("fault-tool-range", False,
                 "commanded_tool > n is strict: 20 == pot-count is in range")

        # target-pot 0 means "no index required" (pin doc, mazak_atc.comp:66-67)
        # and must not be treated as out of range.
        h.setp("target-pot", 0)
        h.run_ms(120)
        h.expect("fault-tool-range", False, "target-pot 0 = no index required")

        # ---------------------------------------------------------------
        # Term 1: commanded_tool > pot-count. Ladder rungs 3504-3507.
        # ---------------------------------------------------------------
        h.setp("commanded-tool", 21)
        h.run_ms(120)
        h.expect("fault-tool-range", True, "T21 exceeds pot-count 20 -> alarm 6101")
        h.expect("fault-any", True, "aggregate (:532-536) reflects the latch")
        h.expect("unclamp-permit", False,
                 "faulted -> !permissives (:312-317) -> unclamp gate drops")
        h.expect("atc-barrier", False,
                 "rung 6505 barrier carries a !faulted term (:328-329)")

        # Latched: removing the cause is not enough on its own.
        h.setp("commanded-tool", 5)
        h.run_ms(120)
        h.expect("fault-tool-range", True,
                 "latched - an in-range T word does not self-clear the alarm")

        # ...and a reset EDGE issued while the offending value still stands
        # cannot escape it either: the reset clears at :297-310, then the same
        # scan re-latches at :346.
        h.setp("commanded-tool", 21)
        h.setp("fault-reset", True)
        h.run_ms(80)
        h.setp("fault-reset", False)
        h.run_ms(40)
        h.expect("fault-tool-range", True,
                 "reset re-latches in the same scan while T21 still commanded")

        # Fix the cause, then reset: now it clears and stays clear.
        h.setp("commanded-tool", 5)
        h.setp("fault-reset", True)
        h.run_ms(80)
        h.setp("fault-reset", False)
        h.run_ms(120)
        h.expect_all({
            "fault-tool-range": False,
            "fault-any": False,
            "unclamp-permit": True,
        }, "reset edge clears once the commanded tool is back in range")

        # ---------------------------------------------------------------
        # Term 2: target_pot > pot-count.
        #
        # DIVERGENCE: ladder rung 3504-3507 (docs/ladder/
        # atc_ladder_transcription.md:58) names only the T-command
        # ("T-command > magazine size -> alarm 6101"); the component also
        # range-checks target_pot (mazak_atc.comp:346), as recorded in
        # docs/ladder/atc_component_README.md:75 ("the commanded tool or pot").
        # This is an addition, not a contradiction - the OEM had no separate
        # tool-table pocket input, whereas the retrofit nets
        # iocontrol.0.tool-prep-pocket straight to target-pot
        # (atc_component_README.md:123-124), so a bad tool table can produce an
        # out-of-range pocket with an in-range T word. The assertions below
        # therefore pin what the COMPONENT does; a human should adjudicate
        # whether the extra term belongs on rung 3504-3507 or in its own alarm.
        # ---------------------------------------------------------------
        h.setp("target-pot", 21)
        h.run_ms(120)
        h.expect("fault-tool-range", True,
                 "target_pot > pot-count latches, with T5 perfectly in range")
        h.expect("unclamp-permit", False, "and drops the permissives with it")

        h.setp("target-pot", 5)
        h.setp("fault-reset", True)
        h.run_ms(80)
        h.setp("fault-reset", False)
        h.run_ms(120)
        h.expect("fault-tool-range", False, "clears once the pocket is in range")

        # ---------------------------------------------------------------
        # Term 3: target_pot < 0.
        # ---------------------------------------------------------------
        h.setp("target-pot", -1)
        h.run_ms(120)
        h.expect("fault-tool-range", True, "negative pocket latches (:346)")
        h.expect("fault-any", True, "aggregate follows")

        h.setp("target-pot", 0)
        h.setp("fault-reset", True)
        h.run_ms(80)
        h.setp("fault-reset", False)
        h.run_ms(120)
        h.expect("fault-tool-range", False, "clears back at target-pot 0")

        # Asymmetry worth pinning so a later edit does not change it silently:
        # only target_pot is checked for negativity. A negative commanded_tool
        # passes the guard, because the condition is `commanded_tool > n` only.
        # Neither the ladder row nor the component treats a negative T word as
        # alarm 6101.
        h.setp("commanded-tool", -1)
        h.run_ms(120)
        h.expect("fault-tool-range", False,
                 "commanded_tool has no negative term in :346 - documented asymmetry")

        # ---------------------------------------------------------------
        # The check follows the pot-count param, it is not hard-coded to 20.
        # ---------------------------------------------------------------
        h.setp_many({"commanded-tool": 8, "target-pot": 8, "pot-count": 8})
        h.run_ms(120)
        h.expect("fault-tool-range", False,
                 "T8 / pot 8 is the last pocket of an 8-pot magazine")

        h.setp("commanded-tool", 9)
        h.run_ms(120)
        h.expect("fault-tool-range", True,
                 "T9 is in range for pot-count 20 but out of range for 8 - "
                 "the guard reads the param")
        h.expect("unclamp-permit", False, "permissives drop on the scaled guard too")

        h.setp("commanded-tool", 5)
        h.setp("fault-reset", True)
        h.run_ms(80)
        h.setp("fault-reset", False)
        h.run_ms(120)
        h.expect_all({
            "fault-tool-range": False,
            "fault-any": False,
            "unclamp-permit": True,
            "atc-barrier": True,
        }, "back to a clean state on an 8-pot magazine")

        return h
