# WireViz wiring diagrams

These diagrams are generated from the MESAC VQC-20/40 Plane A and Plane B
crosswalk CSVs. They are installation-planning artifacts, not permission to wire or
energize the machine.

## Status colors

| Color | Meaning |
|---|---|
| Yellow | Route is defined, but the stated field verification is still required |
| Red | HOLD, unresolved role/polarity/source, or proposed resolver phasing |
| Gray | Retain-or-retire decision; no Mesa landing is allocated |

There are intentionally no green/released conductors in the current set.

## Contents

- `src/` - generated, version-controlled WireViz YAML sources.
- `rendered/` - generated compact HTML, PNG, SVG, and Graphviz `.gv` diagrams.
- `index.html` - one local browser entry point for every rendered sheet.
- `manifest.json` - input hashes, route counts, and per-sheet status counts.
- `scripts/generate_wireviz_diagrams.py` - controlling generator.

The 15-sheet set contains a two-plane overview, one sheet per active BBIA connector,
a separate CN4 spindle-analog sheet, one resolver sheet per axis, an X/Y/Z
velocity-command HOLD sheet, and the CNA10 legacy load-display disposition sheet.

The rendered sheets use a compact review profile: shortened signal labels, `FV` /
`FP` / `PHASE` / `HOLD` / `DEC` status tags, reduced Graphviz rank and node spacing,
and tight connector cell padding. Full authority and verification text remains in
the YAML metadata and source crosswalks.

Plane A discrete sheets show a required interposing-relay boundary. `Fxx` and `Mxx`
are logical paired identifiers only. They are not relay terminal numbers and do not
define coil/contact topology. A reviewed relay terminal schedule must add the actual
relay device tag, coil voltage, suppression, contact form/rating, voltage domain, and
terminal identifiers before any route can be released.

## Regenerate

From the repository root:

```bash
python3 scripts/generate_wireviz_diagrams.py --render
```

The generator prefers crosswalk inputs under `wiring/`; if those are absent, it uses
the copies under `Codex Manual Read/`. It fails if Plane A is not exactly 320 rows,
Plane B is not exactly 38 rows, or a route status has no explicit diagram color policy.

To open the overview on macOS:

```bash
open diagrams/wireviz/rendered/00_interface_overview.html
```

To browse the complete set from one page:

```bash
open diagrams/wireviz/index.html
```

SVG is the preferred vector source for review or import into a drawing package. PNG
is included for quick viewing, HTML includes the WireViz diagram wrapper, and the
compact `.gv` files can be adjusted manually if a different Graphviz spacing is needed.
