"""Shipped timer/parameter defaults have not changed silently.

WHAT THIS DOES *NOT* PROVE. Every value asserted here is an UNVERIFIED
engineering placeholder, not a transcribed machine value:

  * linuxcnc/components/mazak_atc.comp:31-34 - "every timer default is
    UNVERIFIED. The M-2 timer base is unknown ... pot_count defaults to 20 and
    MUST be set to the real magazine size before indexing."
  * linuxcnc/components/mazak_orient.comp:36-40 - "every timer default below is
    UNVERIFIED ... The defaults are safe engineering values, not transcribed
    machine values. Measure on the live machine before trusting them."
  * docs/ladder/orient_ladder_transcription.md:112 (open question #1) - the M-2
    timer base is unknown; the ladder K values (T-5 K3, T-18 K100, T-19
    K3000(?), T-0 K201) only become seconds once a base is confirmed.
  * docs/ladder/atc_ladder_transcription.md:178-179 (open questions #4, #5) -
    T30 (cover alarm delay) and T90 need the M-2 timer table; magazine size must
    be confirmed before hardcoding D16.

So this scenario asserts only that the shipped default has not CHANGED. It does
NOT assert that any of these values is CORRECT for SN 060231. Passing here is
not evidence toward any hold point in docs/pre_power_deliverables.md.

WHY IT EXISTS. Every other scenario in tests/hal/scenarios/ scales the timeouts
down with setp so it can run in under a second (see
atc_clamp_timeout.py:47 `"clamp-timeout": 0.5`). That means no other test would
notice if a shipped default were edited to a different number - the scaled setp
would mask it. This scenario is the only one that loads both components with NO
overrides and reads the params as loaded.

Values under test: mazak_atc.comp:231-246 and mazak_orient.comp:167-180.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from halharness import HalSession  # noqa: E402


# mazak_atc.comp:231-246. Comment column gives the ladder element the parameter
# stands in for, per docs/ladder/atc_ladder_transcription.md.
ATC_DEFAULTS = {
    "pot-count": 20,               # D16, rungs 3312-3315 (atc doc:54 chain)
    "cover-confirm-delay": 3.0,    # T30, sheet 58 alarm delay (atc doc:123)
    "pot-lost-timeout": 5.0,       # T29 TSOFFME, rungs 3405-3407 (atc doc:54)
    "index-timeout": 30.0,         # no ladder equivalent identified (:237)
    "unclamp-timeout": 3.0,        # TUCPRS watchdog, engineering value (:239)
    "clamp-timeout": 3.0,          # TCPRS watchdog, engineering value (:241)
    "allow-manual-unclamp": True,  # rung 3601 #AUT.M manual-only unclamp (:245)
}

# mazak_orient.comp:167-180. Ladder K values from
# docs/ladder/orient_ladder_transcription.md, open question #1 at :112.
ORIENT_DEFAULTS = {
    "zero-speed-dwell": 0.3,     # T-5, rung 2905, ladder K 3
    "arrival-debounce": 0.3,     # T-6, rung 3006, ladder K 3
    "orient-timeout": 10.0,      # T-18, rung 5504, ladder K 100
    "no-cmd-alarm-delay": 1.0,   # T-17, rung 5503, ladder K 10
    "gear-shift-timeout": 30.0,  # T-19, rung 5510, ladder K 3000(?)
    "drive-arm-delay": 2.0,      # T-0, rung 2304, ladder K 201
    "zero-speed-debounce": 0.1,  # T-16, rung 5501, ladder K 30
}

# DIVERGENCE (values, not logic): two shipped defaults deliberately do NOT equal
# the ladder K value read at a 100 ms timer base, and the components say so.
#   - gear-shift-timeout 30.0 vs T-19 K 3000 -> 300 s. mazak_orient.comp:175
#     calls the K reading ambiguous (300 s vs 30 s) and ships the 30 s-class
#     engineering value; orient doc:112 flags the same ambiguity.
#   - drive-arm-delay 2.0 vs T-0 K 201 -> 20.1 s. mazak_orient.comp:177 says
#     explicitly "2.0 s is a bring-up value, NOT the transcribed 20.1 s".
# Both assertions below therefore encode what the COMPONENT ships, and a human
# must adjudicate against the M-2 timer table before commissioning.


def run():
    # --- mazak_atc: no setp of any param, read defaults as loaded ----------
    with HalSession("mazak_atc", "mazak-atc") as h1:
        h1.expect_all(ATC_DEFAULTS, "shipped default, mazak_atc.comp:231-246")

        # SAFETY-RELEVANT ASSERTION. clamp_dual_coil must ship FALSE.
        # mazak_atc.comp:243-244: "Set TRUE only after the hydraulic valve is
        # confirmed dual-coil ... While FALSE the clamp output stays
        # de-energised and clamping relies on dropping the unclamp coil."
        # The valve topology is still unresolved -
        # wiring/authority_conflicts.md:17-24 (section 2, tool clamp/unclamp
        # valve): the resolution test is to trace RLY-3/RLY-4 to the valve and
        # determine whether SOL-10 is single- or dual-coil.
        # NOTE for a human: authority_conflicts.md:24 states the clamp output
        # TB2 OUT9 is HOLD_CONFLICT, while the TOOL_CLAMP_SOL row in
        # mesa/current_pin_authority.csv:66 currently reads
        # COMMISSIONING_PENDING. That doc/CSV disagreement is out of scope for
        # this test but should be reconciled; either way the coil is unverified
        # and the default must stay FALSE.
        h1.expect("clamp-dual-coil", False,
                  "SAFETY: dual-coil clamp valve is unverified; default must "
                  "stay FALSE (mazak_atc.comp:243-244)")

        # update() must not rewrite its own params. Run the thread briefly with
        # nothing driven (permissives are FALSE, so no outputs assert) and
        # re-read the two that gate hardware behaviour.
        h1.run_ms(200)
        h1.expect("clamp-dual-coil", False,
                  "update() must not mutate the clamp-coil param")
        h1.expect("pot-count", 20, "update() must not mutate pot-count")

        atc_failures = list(h1.failures)
        atc_checks = h1.checks

    # --- mazak_orient: second session, same treatment ----------------------
    with HalSession("mazak_orient", "mazak-orient") as h2:
        h2.expect_all(ORIENT_DEFAULTS,
                      "shipped default, mazak_orient.comp:167-180")

        h2.run_ms(200)
        h2.expect("drive-arm-delay", 2.0,
                  "update() must not mutate drive-arm-delay")

        # Carry the first session's results into the returned object so
        # run_tests.py reports both halves of the scenario.
        h2.failures.extend(atc_failures)
        h2.checks += atc_checks
        return h2
