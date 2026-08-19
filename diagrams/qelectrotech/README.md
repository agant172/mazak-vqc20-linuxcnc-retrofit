# QElectroTech wiring project

Open `MESAC_VQC2040_Retrofit.qet` in QElectroTech 0.100.x. The project contains
15 editable folios generated from the same Plane A and Plane B crosswalks used by
the WireViz drawings.

## What is native and editable

- Each OEM, relay-boundary, Mesa, and HOLD endpoint is a QElectroTech element.
- Every route is a native QElectroTech conductor with its source label, cable
  group, status color, endpoints, and an explicit orthogonal connection path.
- A generated, non-movable line underlay follows each native conductor. This
  keeps connections visible at QElectroTech's fit-to-page zoom on macOS; the
  native conductor remains the editable electrical connection above it.
- Generated connector blocks are embedded in the project and also exported as
  standalone `.elmt` files under `elements/`.
- Plane A discrete folios show two conductors per route: OEM-to-relay field side,
  then relay Mesa side-to-I/O. Fxx/Mxx identifiers are logical placeholders, not
  purchased relay terminal numbers.

## Authority colors

- Yellow: route defined, but field verification remains required.
- Red: HOLD or proposed; do not wire or energize from this drawing.
- Gray: retain/retire decision remains open.
- Blue: architecture/interconnect context only.

All folios are **PRELIMINARY — NOT RELEASED FOR WIRING OR ENERGIZATION**. The
project does not invent relay coil/contact topology, suppression, wire gauge,
cable part numbers, permanent new wire numbers, or unresolved source pins.

## Regenerate

From the repository root:

```bash
python3 scripts/generate_qelectrotech_project.py --clean-elements
```

The generator first looks in `wiring/` for the crosswalk CSVs and falls back to
`Codex Manual Read/`, matching the WireViz workflow. Edit the CSV authority data
or the generator, then regenerate; do not hand-edit generated `.qet`/`.elmt`
output if the change needs to survive regeneration.

The companion `manifest.json` records the QElectroTech target version, source
paths, project hash, and object counts. WireViz remains useful as a quick browser
and review view; QElectroTech is the detailed schematic-authoring deliverable.
