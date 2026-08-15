"""Magazine BCD pot decode: weights 1/2/4/8/10, captured only while in-position.

Under test: linuxcnc/components/mazak_atc.comp:383-394, the 5-bit pot decode and
the rung-3210 sample gate.

    raw_pot = bit0*1 + bit1*2 + bit2*4 + bit3*8 + bit4*10   [:383-387]
    if (mag_in_pos) { last_pot = raw_pot; have_pot = 1; }    [:389-392]
    pot_number = last_pot;                                   [:393]
    pot_number_valid = have_pot;                             [:394]

Ladder authority (docs/ladder/atc_ladder_transcription.md:44-45):

  | 3205-3209 | TNPS1-5 (M216-M220) = pot-number BCD sensors
  |             T11P/T12P/T14P/T18P/T21P (X008-X00C) |
  | 3210      | MIPRS(X00D) -> MOV K2M216->D8, BIN->D10:
  |             **capture current pot number only while in-position** |

and docs/ladder/atc_component_README.md:66, which reads K2M216 as two BCD
digits, so the fifth sensor T21P is the TENS digit (weight 10), not a binary
weight-16 bit.

*** THE WEIGHT-10 ASSUMPTION IS UNVERIFIED HARDWARE. ***
docs/ladder/atc_component_README.md:155 lists "BCD weights 1/2/4/8/10" in the
"Placeholders - nothing here is a measured value" table, with the outstanding
work being "confirm T21P really is the tens digit and not a 16-weight bit".
This scenario therefore DOCUMENTS the assumption the component currently
encodes and locks it against silent drift. It does NOT prove what the magazine
sensors on SN 060231 actually do. If T21P turns out to be weight 16, the
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
    "mag-bcd-bit4",  # X00C T21P - weight 10 (BCD tens digit, UNVERIFIED)
)

# (bit0, bit1, bit2, bit3, bit4) -> expected pot-number, note.
# Every expectation below is the arithmetic of mazak_atc.comp:383-387, not an
# independent model of the hardware.
PATTERNS = (
    ((0, 0, 0, 0, 0),  0, "all sensors off decodes to pot 0"),
    ((1, 0, 0, 0, 0),  1, "T11P alone = weight 1"),
    ((0, 1, 0, 0, 0),  2, "T12P alone = weight 2"),
    ((0, 0, 1, 0, 0),  4, "T14P alone = weight 4"),
    ((1, 1, 1, 0, 0),  7, "1+2+4 units digit"),
    ((0, 0, 0, 1, 0),  8, "T18P alone = weight 8"),
    ((1, 0, 0, 1, 0),  9, "8+1, top of the units digit"),
    # The two that separate a BCD tens digit from a binary weight-16 bit:
    # under a 16-weight reading these would be 16 and 17, not 10 and 11.
    ((0, 0, 0, 0, 1), 10, "T21P alone = weight 10 (would be 16 if binary)"),
    ((1, 0, 0, 0, 1), 11, "10+1 (would be 17 if T21P were weight 16)"),
    ((1, 0, 1, 0, 1), 15, "10+4+1"),
    ((0, 0, 0, 1, 1), 18, "10+8 (would be 24 if T21P were weight 16)"),
    ((1, 0, 0, 1, 1), 19, "10+8+1, the largest legal 2-digit-BCD pot here"),
)


def _pattern_map(bits):
    return {pin: bool(value) for pin, value in zip(BIT_PINS, bits)}


def run():
    with HalSession("mazak_atc", "mazak-atc") as h:
        # Permissives up, and the cover held open-confirmed so no cover alarm
        # latches while this scenario runs. The decode itself is NOT gated on
        # permissives (:383-394) - this is only to keep the end-state check
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
        # target-pot / commanded-tool stay 0, well inside pot-count = 20, so
        # the rung 3504-3507 range check (:345-346) stays clear.

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

        # DIVERGENCE: ladder rung 3210 does `MOV K2M216->D8, BIN->D10`, i.e. a
        # real two-digit BCD-to-binary conversion, in which a units nibble of
        # 8+4 = 0xC is an ILLEGAL BCD digit. mazak_atc.comp:383-387 instead
        # sums the five weights unconditionally, so that pattern yields 12 and
        # aliases the legal encoding of 12 (tens bit + weight 2). What an M-2
        # actually does with an illegal nibble is not recorded in the
        # transcription, so no assertion is written for the illegal pattern
        # here - flagged for a human to adjudicate against the real magazine.

        # ---- (b) rung 3210 hold behaviour -------------------------------
        # Land on a known pot in position...
        h.setp_many(_pattern_map((1, 1, 0, 0, 0)))   # 1+2 = 3
        h.run_ms(30)
        h.expect("pot-number", 3, "captured while in position")

        # ...drop out of position and change every sensor. pot-number must
        # HOLD 3: `pot_number = last_pot` (:393) and last_pot is only written
        # inside `if (mag_in_pos)` (:389-392).
        h.setp("mag-in-pos", False)
        h.setp_many(_pattern_map((1, 0, 0, 1, 1)))   # would decode to 19
        h.run_ms(60)
        h.expect("pot-number", 3,
                 "rung 3210: out of position, the last captured value holds")
        h.expect("pot-number-valid", True,
                 "validity is sticky once captured; it is not an in-position flag")

        # ...come back in position and the new value is taken immediately.
        h.setp("mag-in-pos", True)
        h.run_ms(30)
        h.expect("pot-number", 19,
                 "rung 3210: back in position, the sample refreshes to 19")

        # One more out-of-position hold, from the far end of the range, to
        # show the hold is not specific to a small value.
        h.setp("mag-in-pos", False)
        h.setp_many(_pattern_map((0, 0, 0, 0, 0)))
        h.run_ms(60)
        h.expect("pot-number", 19,
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
