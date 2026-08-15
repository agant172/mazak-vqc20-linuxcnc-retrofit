"""ATC cycle-selection matrix: EQTST > TS0 > T0 > full change.

Under test: linuxcnc/components/mazak_atc.comp:331-343 -

    ts0   = (spindle_tool == 0);              /* M164 TS0  */
    t0    = (commanded_tool == 0);            /* M165 T0   */
    equal = (spindle_tool == commanded_tool); /* M230 EQTST */

    if (equal)          cycle_select = 0;
    else if (ts0)       cycle_select = 2;
    else if (t0)        cycle_select = 3;
    else                cycle_select = 1;

    cycle_skip        = (cycle_select == 0);
    cycle_full        = (cycle_select == 1);
    cycle_load_only   = (cycle_select == 2);
    cycle_return_only = (cycle_select == 3);

Ladder authority - docs/ladder/atc_ladder_transcription.md:

  * rung 6509  TS0   (M164) = `TCME · [D1 = 0]`     - spindle tool empty
  * rung 6510  T0    (M165) = `TCME · [D2 = 0]`     - commanded tool = 0
  * rung 6511  EQTST (M230) = `TCME · #MOP13 · [D1 = D2]` - "commanded =
    spindle tool -> skip the cycle" (also blocks ORCM1 at rung 3004)

  D/E/F decode table (transcription lines 34-36):
    D (M271 / rung 7101)  `... #TS0 · #T0`  full change   -> cycle_select 1
    E (M280 / rung 7203)  `...  TS0 · #T0`  load only     -> cycle_select 2
    F (M288 / rung 7210)  `... #TS0 ·  T0`  return only   -> cycle_select 3

The interesting case is (spindle_tool 0, commanded_tool 0). The ladder reaches
the same answer by a different route: with D1 = D2 = 0, EQTST is true, and none
of D/E/F can latch because E needs #T0, F needs #TS0 and D needs both. The
component encodes that as explicit precedence - `equal` is tested first, so
(0,0) is SKIP and never LOAD_ONLY. This scenario pins that precedence.

This is pure decode logic: no timer is involved, so nothing here is scaled.
Permissives and mag-cover-open-conf are still set because they gate the rest of
the component, and tool-clamped is held so the clamp watchdog (:495-497) cannot
latch a fault during the one case that runs with the cycle active. All tool
numbers are <= pot-count (20) so the rung 3504-3507 range check stays clear.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from halharness import HalSession  # noqa: E402

# spindle_tool, commanded_tool, cycle_select, label
MATRIX = [
    (5, 5, 0, "EQTST (rung 6511): commanded tool already in the spindle"),
    (0, 0, 0, "PRECEDENCE: equal is tested before ts0, so (0,0) is SKIP"),
    (0, 7, 2, "TS0 (rung 6509) without T0 -> cycle E, load only"),
    (5, 0, 3, "T0 (rung 6510) without TS0 -> cycle F, return only"),
    (5, 7, 1, "neither TS0 nor T0 -> cycle D, full change"),
]

BITS = {
    0: "cycle-skip",
    1: "cycle-full",
    2: "cycle-load-only",
    3: "cycle-return-only",
}


def run():
    with HalSession("mazak_atc", "mazak-atc") as h:

        def bit_is_true(pin):
            return h.getp(pin).strip().upper() in ("TRUE", "1")

        def check_one_hot(label):
            """Exactly one of the four derived bits must be true."""
            hot = [p for p in BITS.values() if bit_is_true(p)]
            if len(hot) != 1:
                h.fail(
                    f"cycle bits not one-hot for {label}: true = {hot or 'none'}"
                )
            else:
                h.checks += 1

        # Permissives up. mag-cover-open-conf is required or t_cover_not_open
        # (:362) latches fault_cover_not_open after cover_confirm_delay and
        # poisons `permissives` for an unrelated reason. tool-clamped holds the
        # clamp watchdog condition (:495) false.
        h.setp_many({
            "hydraulic-ok": True,
            "air-ok": True,
            "mag-cover-open-conf": True,
            "tool-clamped": True,
        })

        for spindle_tool, commanded_tool, want_select, note in MATRIX:
            label = f"spindle-tool={spindle_tool} commanded-tool={commanded_tool}"
            h.setp_many({
                "spindle-tool": spindle_tool,
                "commanded-tool": commanded_tool,
            })
            h.run_ms(80)

            h.expect("cycle-select", want_select, f"{label}: {note}")
            h.expect_all(
                {pin: (code == want_select) for code, pin in BITS.items()},
                f"{label}: derived bits must agree with cycle-select",
            )
            check_one_hot(label)

            h.expect("fault-tool-range", False,
                     f"{label}: all tool numbers are within pot-count")

        # Same decode with the cycle actually running, to show the selection is
        # not a one-shot latched at cycle entry: cycle_select is recomputed
        # every scan (:335-338) and tracks the register pins live.
        #
        # DIVERGENCE: ladder rungs 6509/6510/6511 all carry a series TCME
        # contact, so TS0/T0/EQTST are only meaningful while a tool change is
        # in progress; the component computes ts0/t0/equal unconditionally,
        # with no cycle_active term (mazak_atc.comp:331-343). The matrix above
        # therefore reads valid cycle-select values with cycle-active FALSE,
        # which the OEM ladder would not produce. Harmless as written - the
        # consumers (step1_permit :521, the detect gates :504-505) re-gate on
        # cycle_active - but flagged for a human to adjudicate.
        h.setp_many({"spindle-tool": 3, "commanded-tool": 9})
        h.setp("cycle-start", True)
        h.run_ms(120)

        h.expect("cycle-active", True, "rung 6504 TCME latched by cycle-start")
        h.expect("cycle-select", 1, "cycle D decode is unchanged inside a cycle")
        h.expect_all({
            "cycle-full": True,
            "cycle-skip": False,
            "cycle-load-only": False,
            "cycle-return-only": False,
        }, "derived bits inside an active cycle")
        check_one_hot("in-cycle spindle-tool=3 commanded-tool=9")

        # Change the commanded register mid-cycle: the decode follows.
        h.setp("commanded-tool", 3)
        h.run_ms(80)

        h.expect("cycle-select", 0,
                 "commanded now equals the spindle tool -> EQTST skip")
        h.expect_all({
            "cycle-skip": True,
            "cycle-full": False,
            "cycle-load-only": False,
            "cycle-return-only": False,
        }, "rung 6511 EQTST asserts, cycle D drops")
        check_one_hot("in-cycle after commanded-tool -> 3")

        h.expect("fault-any", False,
                 "cycle selection alone must not latch any fault")

        return h
