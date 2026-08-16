# Original-control restore and retrofit rollback package

> **ROLE: INSTALL-CORE (D15)** — gates the start of physical work and accompanies the rewire: one ledger row per conductor moved. See [../INSTALL_SPINE.md](../INSTALL_SPINE.md) §1.


Status: template only. Do not disconnect the Mazatrol M-2 until every required
entry has evidence and the baseline is signed.

## Immutable baseline inventory

| Artifact | Location / hash / photo set | Captured by/date | Independently verified |
|---|---|---|---|
| M-2 parameters and machine constants | | | |
| PLC ladder / element list / timer data | | | |
| Tool, offset, macro, and tape data | | | |
| Cabinet overview photos, covers on/off | | | |
| Every terminal strip front/back | | | |
| Servo/spindle/rectifier parameters | | | |
| OEM wiring/manual revision set | | | |
| Known-safe machine-state test record | | | |

Store read-only copies off the control PC and record SHA-256 hashes. Preserve
original filenames and export formats; do not overwrite a baseline capture with
a later edited file.

## Removed-conductor ledger

Create one row before moving each conductor:

| Ledger ID | OEM wire number | From terminal | To terminal | Original function | Photo before | Retrofit disposition | Insulated/restored how | Continuity after | Reviewer/date |
|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | |

Tag both ends with the ledger ID. Never leave an unidentified loose conductor.
Record jumpers, common links, shield/drain terminations, and wire removals—not
only signal wires moved to Mesa terminals.

## Retrofit configuration rollback point

Before every live-power milestone record:

- Git commit plus an exported diff of any uncommitted commissioning values.
- Bitfile binary, SHA-256, provenance, and read-back/IDROM pin dump.
- Active INI/HAL/component binaries and component source hashes.
- Drive/FR-SX parameter captures and physical potentiometer positions.
- Signed I/O state, analog-zero, resolver, network, E-stop, and stop-timing
  logs.

## Rollback decision and actions

Rollback is mandatory after an unexplained motion, failed E-stop/contactor
test, resolver discontinuity, wrong-direction event, output that cannot be
forced safe by the approved chain, or loss of configuration provenance.

1. E-stop, isolate mains/control power, lock out, and verify DC-bus discharge.
2. Preserve evidence before changing configuration or wiring.
3. Restore static output holds to FALSE and physically isolate drive enables.
4. Choose either the last signed retrofit checkpoint or full OEM restoration;
   record the decision and approver.
5. For OEM restoration, reverse the conductor ledger row by row, restore all
   saved parameters/data, inspect shield/common/PE paths, and perform the OEM
   service-manual power-up checks. “Put the wires back” without end-to-end
   tests is not acceptance.
6. Repeat the relevant hold points before declaring either configuration
   operational.

## Known-safe baseline tag

Machine state: ____________________  Date/time: ____________________

Control/parameter backup hash list: ______________________________________

Known defects or disabled options: _______________________________________

Owner signature: __________________  Witness: _____________________________
