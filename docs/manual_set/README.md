# Mazak VQC-20/40 LinuxCNC/Mesa Retrofit Manual Set

**Revision B - generated 2026-08-07 from source commit `3e9c4e6`.**

> **PLANNING / COMMISSIONING DOCUMENTS - NOT AS-BUILT.** No live-power hold point is signed. Use the authority status printed with each wiring row and the D1-D16 gates in Volume 0. Rev A is superseded and must not be used.

## Artifacts

| File | Purpose |
|---|---|
| `Vol0_Master_Guide_and_TOC.pdf` | Volume 0 - Master Guide and Table of Contents |
| `Vol1_Overview_and_Safety.pdf` | Volume 1 - Overview and Safety |
| `Vol2_Operation_Manual.pdf` | Volume 2 - Operation Manual |
| `Vol3_Mesa_Conversion_Manual.pdf` | Volume 3 - Mesa Conversion and Installation |
| `Vol4_Wiring_Diagrams_and_IO_Reference.pdf` | Volume 4 - Wiring Diagrams and I/O Reference |
| `Vol5_Maintenance_and_Troubleshooting.pdf` | Volume 5 - Maintenance and Troubleshooting |
| `Vol6_Reference_Glossary_Index.pdf` | Volume 6 - Reference, Glossary, and Index |
| `Mazak_VQC2040_Complete_Manual_RevB.pdf` | Combined volumes 0-6 |
| `manifest.json` | SHA-256 and page count for every PDF |

## What Rev B consolidates

- Replaces the retracted 7i97T/one-7i84U Rev A architecture with 7i80HDT + 7i44 + 7i49 + two 7i84Us.
- Generates Volume 4 directly from `mesa/current_pin_authority.csv`.
- Corrects 7i84U TB1: pins 1/2 VFIELDB positive, pins 3/4 VFIELDA positive, pin 5 VIN, pins 6/7/8 common.
- Keeps P2 empty and routes the probe to 7i84U-B TB3 IN15.
- Treats FR-SX orient as a discrete ORCM1 command; AOUT4 remains spare.
- Consolidates D1-D16 hold points, resolver/servo commissioning, shared-bus/Z-brake risks, network qualification, maintenance, and superseded-claim quarantine.

## Authority snapshot

- Total rows: 132
- `COMMISSIONING_PENDING`: 51
- `DEFERRED`: 1
- `HOLD_CONFLICT`: 4
- `OPTIONAL_VERIFY`: 1
- `PROPOSED`: 39
- `SPARE`: 35
- `UNBOUND`: 1

## Rebuild

```bash
uv run scripts/build_manual_set.py
python3 scripts/validate_authority.py
python3 scripts/validate_control_logic.py
```

The generator removes superseded combined-manual revisions from this folder and rewrites the seven stable volume filenames, the Rev B combined file, README, and manifest.
