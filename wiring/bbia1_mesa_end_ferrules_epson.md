# BBIA-1 Cut-Wire Mesa-End Ferrules — Epson 6 mm Shrink Tube

Companion CSV: [`bbia1_mesa_end_ferrules_epson.csv`](bbia1_mesa_end_ferrules_epson.csv).

This batch is for the individual conductors exposed when the Honda MR connectors
are removed from the ends of the machine cables that formerly plugged into the
BBIA-1. It is separate from `bbia1_cn_labels_epson.csv`, which preserves the OEM
wire number and old CN/pin for tracing.

## Printed text

Map only `Label_Text` into the Epson template. The code identifies the planned
new **physical** Mesa terminal:

| Example | Meaning |
|---|---|
| `A3-06` | 7i84U-A, TB3, numbered terminal position 6 |
| `A2-16` | 7i84U-A, TB2, numbered terminal position 16 |
| `B3-07` | 7i84U-B, TB3, numbered terminal position 7 |

The short code is intended to remain readable on 6 mm heat-shrink tube. It does
not use the logical channel number: for example `B3-17` is physical pin 17,
which is logical `OUT0` on TB3.

## Current release state

The initial file contains only conservative, name-matched conductors for which
the repo has a planned direct 7i84U destination. Every current row is
`HOLD_SOURCE_TRACE`; these are draft labels, not permission to terminate the
wire. Promote the crosswalk only after continuity identifies that exact cut
conductor and the authority row has the required evidence.

The non-printed columns preserve the OEM wire number, old Honda connector pin,
signal name, logical Mesa channel, authority ID/status, and crosswalk/release
status. Use those fields for sorting and checkout, not as label text.

## Deliberate exclusions

This batch does not include:

- E-stop or other conductors that belong in the hardware safety chain;
- P24, +24 V, 0G, G24, or other supply/common conductors;
- 100 VAC solenoid/load wires that must terminate on interposing-relay contacts;
- Mesa-output-to-relay-coil wires, because those are new conductors rather than
  cut BBIA cable conductors;
- repeated/series net segments whose exact retained conductor is not traced;
- ambiguous spindle, limit-group, alarm, optional, spare, or retired conductors.

For example, the old air-blast load conductor does not receive `B3-20`. It must
land on the appropriate RLY-5 load contact after that contact numbering is
verified. A separate new 24 V conductor runs from 7i84U-B TB3 physical pin 20
(`OUT3`) to the RLY-5 coil circuit.

## Epson import

1. Load 6 mm heat-shrink tube and create a one-field centered template.
2. Import `bbia1_mesa_end_ferrules_epson.csv`.
3. Map the only printed field to `Label_Text`.
4. Filter `Release_Status`. There are currently no `RELEASED` rows; an
   unfiltered batch is for fit/layout proof only.
5. Preview the full batch and verify the code remains legible after shrinking.

## Maintaining the batch

The source crosswalk is
[`bbia1_retrofit_destination_crosswalk.csv`](bbia1_retrofit_destination_crosswalk.csv).
Add a row only when the old connector location and intended authority signal are
supported by repo evidence. The generator derives the physical pin and refuses
missing, spare, non-7i84U, or duplicate source assignments.

```bash
python3 scripts/generate_label_csvs.py --write
python3 scripts/generate_label_csvs.py --check
python3 scripts/validate_authority.py
```

The authority validator rejects stale printer output.
