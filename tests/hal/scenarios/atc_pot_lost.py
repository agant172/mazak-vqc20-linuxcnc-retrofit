"""Losing MIPRS mid-index must stop the magazine and invalidate the pot number.

Subject: the TSOFF pot-lost supervision in
linuxcnc/components/mazak_atc.comp:447-455 -

    /* Rungs 3405-3407 TSOFF supervision: while indexing, MIPRS must keep
     * arriving. Reset the timer on every in-position edge. */
    if (mag_in_pos && !prev_in_pos) t_pot_lost = 0.0;
    prev_in_pos = mag_in_pos;
    TMR(t_pot_lost, idx_running && !mag_in_pos, pot_lost_timeout);
    if (ELAPSED(t_pot_lost, pot_lost_timeout)) {
        fault_pot_lost = true;
        have_pot = 0;               /* pot number is no longer trustworthy */
    }

Ladder authority: docs/ladder/atc_ladder_transcription.md:54 -
"3405-3407 | TSOFFME/T29/TSOFFAL - tool-select-off supervision (pot must stay
detected; alarm M61)". The pot number itself is only ever sampled while MIPRS
is made (rung 3210, transcription line 45), so once the in-position detect stops
arriving the PLC's D10 copy is stale by definition; the transcription's HAL
implementation note (line 165) restates this as "supervise with a 'pot detect
must persist' check (TSOFF equivalent)".

Why it matters: the magazine is a BCD-addressed rotary with no absolute encoder.
If MIPRS stops while the drum is turning, the software has no idea where the
drum is, and the two direction solenoids (rungs 3501/3502, MFWD.M Y003 /
MREV.M Y002) must not keep driving it. This scenario proves the fault latches,
both solenoids drop, mag-rotate-enable (rung 3408 MROT) drops, and
pot-number-valid goes FALSE while pot-number itself holds its stale value.

Path under test in :415-436 - magazine rotation requires index_request,
permissives, a valid pot number, AND cover_open_verified (rung 7009 MGCOX), so
the setup below holds mag-cover-open-conf TRUE throughout.

pot-lost-timeout is scaled 5.0 -> 0.6 s via setp; tests/hal/scenarios/
timer_defaults.py asserts the shipped default separately.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from halharness import HalSession  # noqa: E402


def run():
    with HalSession("mazak_atc", "mazak-atc") as h:
        h.setp_many({
            # permissives = hydraulic_ok && air_ok && !faulted && !cycle_abort
            # (:317). Without these two nothing in the magazine path runs.
            "hydraulic-ok": True,
            "air-ok": True,
            # cover_open_verified (:371) needs the open reed made while the
            # single cover solenoid is de-energised. It is also what keeps
            # t_cover_not_open (:362) from latching fault_cover_not_open after
            # cover-confirm-delay and poisoning permissives for the wrong
            # reason.
            "mag-cover-open-conf": True,
            "cover-close-request": False,
            "pot-lost-timeout": 0.6,        # param: scaled down from 5.0
            # Rungs 3504-3507 range check (:346): keep every tool/pot number
            # well inside the pot-count default of 20.
            "target-pot": 7,
            "commanded-tool": 7,
            "spindle-tool": 3,
            # Pot 3 on the BCD sensors T11P/T12P (weights 1 + 2), rung 3210.
            "mag-bcd-bit0": True,
            "mag-bcd-bit1": True,
            "mag-bcd-bit2": False,
            "mag-bcd-bit3": False,
            "mag-bcd-bit4": False,
            "mag-in-pos": True,
        })

        # --- 1. Establish a trustworthy pot number, index not yet requested.
        h.run_ms(150)

        h.expect_all({
            "pot-number": 3,
            "pot-number-valid": True,
            "index-active": False,
            "mag-fwd-sol": False,
            "mag-rev-sol": False,
            "fault-any": False,
        }, "pot captured in-position (rung 3210), no index requested yet")

        # --- 2. Request the index to pot 7. Shortest path forward is +4 on a
        # 20-pot drum (rungs 3316-3319 / :404-413), so MFWD.M energises.
        h.setp("index-request", True)
        h.run_ms(200)

        h.expect_all({
            "index-active": True,
            "index-done": False,
            "index-distance": 4,
            "mag-rotate-enable": True,
            "mag-fwd-sol": True,
            "mag-rev-sol": False,
            "fault-pot-lost": False,
        }, "indexing forward 3 -> 7, MIPRS still arriving")

        # --- 3. Drop MIPRS and hold it low. t_pot_lost starts accumulating
        # (:451) because idx_running is set and mag_in_pos is not.
        h.setp("mag-in-pos", False)
        h.run_ms(200)

        h.expect_all({
            "fault-pot-lost": False,
            "mag-fwd-sol": True,
            "pot-number-valid": True,
        }, "T29 has not expired yet - the drum keeps turning between pots")

        # --- 4. Hold past pot-lost-timeout. Cumulative time without MIPRS is
        # now well over 0.6 s.
        h.run_ms(900)

        h.expect("fault-pot-lost", True,
                 "M61 TSOFFAL - pot detect stopped arriving while indexing")
        h.expect("fault-any", True, "aggregate (:532) must reflect the latch")

        # fault_pot_lost feeds `faulted`, which clears permissives (:317), which
        # forces the !index_request/!permissives branch at :415 -> idx_running 0
        # -> mag_rotate_enable false (:435) -> both direction coils false.
        h.expect_all({
            "mag-rotate-enable": False,
            "mag-fwd-sol": False,
            "mag-rev-sol": False,
            "index-active": False,
            "index-done": False,
        }, "rungs 3408/3501/3502: no rotate enable, both solenoids de-energised")

        # DIVERGENCE: ladder rungs 3405-3407 as transcribed
        # (docs/ladder/atc_ladder_transcription.md:54) describe TSOFF
        # supervision only as raising alarm M61; the transcription does not
        # record the PLC clearing or invalidating D10. The component
        # additionally clears have_pot at mazak_atc.comp:454 ("pot number is no
        # longer trustworthy"), which is what drops pot-number-valid and zeroes
        # index-distance below. Asserting the component's behaviour; a human
        # should confirm against the real M-2 rung whether D10 is invalidated
        # there or only on the next MIPRS capture.
        h.expect("pot-number-valid", False,
                 "have_pot cleared at :454 - the drum position is unknown")
        h.expect("index-distance", 0,
                 "shortest-path arithmetic is disabled without have_pot (:405)")
        h.expect("pot-number", 3,
                 "the stale D10 copy is retained, only its validity flag drops")

        # DIVERGENCE: rung 3408 is transcribed as
        # `MROT = #AL2? · TSME · TFP · TSINTL` (transcription line 55), with
        # TFP/TSINTL left unexpanded; there is no literal MGCOX term in that
        # row. mazak_atc.comp:435 adds `cover_open_verified && !tool_unclamp_sol`
        # to the rotate enable. Not asserted either way here beyond the FALSE
        # above, which holds under both readings because permissives are gone.

        # --- 5. Recovery. fault-reset is edge triggered (:288), so pulse it.
        # Restore MIPRS first so the fault has a reason to stay clear.
        h.setp("mag-in-pos", True)
        h.setp("fault-reset", True)
        h.run_ms(80)
        h.setp("fault-reset", False)
        h.run_ms(900)

        h.expect("fault-pot-lost", False,
                 "the reset edge clears M61 and MIPRS is arriving again")
        h.expect("fault-any", False, "aggregate follows")
        h.expect("pot-number-valid", True,
                 "have_pot re-captured on the next in-position scan (:389)")
        h.expect_all({
            "index-active": True,
            "mag-fwd-sol": True,
            "mag-rev-sol": False,
        }, "index-request is still held, so the index resumes forward to pot 7")

        # --- 6. And the index can still complete: add T14P (weight 4) so the
        # BCD sensors read pot 7 while in position - rung 3401 MSTP.
        h.setp("mag-bcd-bit2", True)
        h.run_ms(200)

        h.expect_all({
            "pot-number": 7,
            "index-done": True,
            "index-active": False,
            "mag-fwd-sol": False,
            "mag-rev-sol": False,
            "fault-any": False,
        }, "rung 3401: commanded pot arrived and in position, magazine stops")

        return h
