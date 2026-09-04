"""Magazine pot decode: binary weights 1/2/4/8/16, captured only while in-position.

Under test: linuxcnc/components/mazak_atc.comp:388-403, the 5-bit pot decode and
the rung-3210 sample gate.

    raw_pot = bit0*1 + bit1*2 + bit2*4 + bit3*8 + bit4*16   [:393-397]
    if (mag_in_pos) { last_pot = raw_pot; have_pot = 1; }    [:399-402]
    pot_number = last_pot;                                   [:403]
    pot_number_valid = have_pot;                             [:404]

Ladder authority (docs/ladder/atc_ladder_transcription.md:44-46), resolved by
the 2026-09-04 print audit: on a 24TS/30TS magazine (this machine, CONFIRMED
30-pot by owner photos 2026-09-04) rung 3301 is `MOV D8->D10` - a RAW COPY,
with NO BCD->BIN conversion. The BIN instruction at rung 3211 only fires on
15TS/20TS machines. So the pot-number sensor byte on this machine is straight
binary: T11P/T12P/T14P/T18P = weights 1/2/4/8, T21P = weight 16 (not the
small-magazine BCD tens-digit weight of 10). This covers 1-30 exactly
(30 = 0b11110 = 16+8+4+2).

*** THE WEIGHT-16 READING IS PRINT-SOURCED BUT STILL BENCH-UNVERIFIED. ***
docs/ladder/atc_ladder_transcription.md line 194 records the resolution and
the bench check that closes it: at first power, read X008-X00C at pot 16
(expect only T21P/bit4 set), pot 20 (expect bit4+bit2), and pot 30 (expect
all but bit0). If the physical sensor disc disagrees with the print, the
component changes and this file changes with it.

Nothing else in the repo pins this decode: scripts/validate_control_logic.py
checks mazak_atc.comp only for four literal source strings, none of them here.

No timer scaling is needed - the decode is combinational and the sample gate is
a single-scan latch. mag-cover-open-conf is still held TRUE so that
t_cover_not_open (:362) cannot latch fault_cover_not_open across the ~11
run windows and muddy the final clean-state check.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from halharness import HalSession  # noqa: E402

BIT_PINS = (
    "mag-bcd-bit0",  # X008 T11P - weight 1
    "mag-bcd-bit1",  # X009 T12P - weight 2
    "mag-bcd-bit2",  # X00A T14P - weight 4
    "mag-bcd-bit3",  # X00B T18P - weight 8
    "mag-bcd-bit4",  # X00C T21P - weight 16 (straight binary on 24TS/30TS)
)

# (bit0, bit1, bit2, bit3, bit4) -> expected pot-number, note.
# Every expectation below is the arithmetic of mazak_atc.comp:393-397, not an
# independent model of the hardware - see the module docstring for the bench
# check that closes the remaining gap between print and machine.
PATTERNS = (
    ((0, 0, 0, 0, 0),  0, "all sensors off decodes to pot 0"),
    ((1, 0, 0, 0, 0),  1, "T11P alone = weight 1"),
    ((0, 1, 0, 0, 0),  2, "T12P alone = weight 2"),
    ((0, 0, 1, 0, 0),  4, "T14P alone = weight 4"),
    ((1, 1, 1, 0, 0),  7, "1+2+4"),
    ((0, 0, 0, 1, 0),  8, "T18P alone = weight 8"),
    ((1, 0, 0, 1, 0),  9, "8+1"),
    ((1, 1, 1, 1, 0), 15, "1+2+4+8, the top of the low nibble"),
    # T21P (bit4) is the pot-16..30 bit on this machine - it is NOT a BCD
    # tens digit, so these do not land on 10/11/etc.
    ((0, 0, 0, 0, 1), 16, "T21P alone = weight 16 (pot 16 per the bench check)"),
    ((1, 0, 0, 0, 1), 17, "16+1"),
    ((1, 0, 1, 0, 1), 21, "16+4+1"),
    ((0, 0, 0, 1, 1), 24, "16+8"),
    ((0, 1, 0, 1, 1), 26, "16+8+2 (pot 26)"),
    ((1, 1, 1, 1, 1), 31, "all five bits - out of the 1-30 legal range, but the decode is combinational and unranged"),
)


def _pattern_map(bits):
    return {pin: bool(value) for pin, value in zip(BIT_PINS, bits)}


def run():
    with HalSession("mazak_atc", "mazak-atc") as h:
        # Permissives up, and the cover held open-confirmed so no cover alarm
        # latches while this scenario runs. The decode itself is NOT gated on
        # permissives (:393-404) - this is only to keep the end-state check
        # meaningful.
        h.setp_many({
            "hydraulic-ok": True,
            "air-ok": True,
            "mag-cover-open-conf": True,
        })

        # index-request stays FALSE for the whole scenario, so idx_running is 0
        # (:427-429) and the rung 3405-3407 TSOFF supervision can never fire.
        # That matters: fault_pot_lost clears have_pot (:466) and would reset
        # pot-number-valid behind our back.
        # target-pot / commanded-tool stay 0, well inside pot-count = 30, so
        # the rung 3504-3507 range check stays clear.

        # ---- (c) part one: nothing captured yet -------------------------
        h.run_ms(60)
        h.expect("pot-number-valid", False,
                 "rung 3210: no in-position sample has happened yet")
        h.expect("pot-number", 0,
                 "last_pot is still its power-up value")

        # Bits set while OUT of position must not be captured (rung 3210).
        h.setp_many(_pattern_map((1, 1, 1, 1, 1)))
        h.run_ms(60)
        h.expect("pot-number-valid", False,
                 "rung 3210: MIPRS off, so the MOV never executes")
        h.expect("pot-number", 0,
                 "all five sensors high but out of position: still no capture")

        # ---- (a) decode table, sampled in position ----------------------
        h.setp("mag-in-pos", True)
        for bits, want, note in PATTERNS:
            h.setp_many(_pattern_map(bits))
            h.run_ms(30)
            h.expect("pot-number", want, note)

        h.expect("pot-number-valid", True,
                 "(c) part two: TRUE once an in-position sample has occurred")

        # ---- (b) rung 3210 hold behaviour -------------------------------
        # Land on a known pot in position...
        h.setp_many(_pattern_map((1, 1, 0, 0, 0)))   # 1+2 = 3
        h.run_ms(30)
        h.expect("pot-number", 3, "captured while in position")

        # ...drop out of position and change every sensor. pot-number must
        # HOLD 3: `pot_number = last_pot` (:403) and last_pot is only written
        # inside `if (mag_in_pos)` (:399-402).
        h.setp("mag-in-pos", False)
        h.setp_many(_pattern_map((1, 0, 0, 1, 1)))   # would decode to 25
        h.run_ms(60)
        h.expect("pot-number", 3,
                 "rung 3210: out of position, the last captured value holds")
        h.expect("pot-number-valid", True,
                 "validity is sticky once captured; it is not an in-position flag")

        # ...come back in position and the new value is taken immediately.
        h.setp("mag-in-pos", True)
        h.run_ms(30)
        h.expect("pot-number", 25,
                 "rung 3210: back in position, the sample refreshes to 25")

        # One more out-of-position hold, from the far end of the range, to
        # show the hold is not specific to a small value.
        h.setp("mag-in-pos", False)
        h.setp_many(_pattern_map((0, 0, 0, 0, 0)))
        h.run_ms(60)
        h.expect("pot-number", 25,
                 "all sensors dropped out of position must not read as pot 0")

        # ---- clean-state check ------------------------------------------
        # The decode path must not have raised anything on its own: no index
        # was requested, no tool was commanded, the cover stayed confirmed
        # open. If this trips, one of the assumptions above is wrong rather
        # than the decode being wrong.
        h.expect("fault-any", False,
                 "decoding pot numbers must not latch any ATC alarm")
        h.expect("fault-pot-lost", False,
                 "rungs 3405-3407 need idx_running; index-request was never set")
        h.expect("fault-tool-range", False,
                 "rungs 3504-3507: commanded-tool/target-pot stayed at 0")
        h.expect("index-active", False, "no index was ever requested")
        h.expect("mag-fwd-sol", False, "no magazine motion in a decode-only test")
        h.expect("mag-rev-sol", False, "no magazine motion in a decode-only test")

        return h
