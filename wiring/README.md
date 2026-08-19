# Wiring and I/O Planning

This folder holds wiring and field-I/O planning references for the Mazak VQC 20/40
retrofit. The current pin authority lives in the Mesa folder and is mirrored
conceptually here for wiring planning.

## Key references

All Epson batch CSVs in this folder target Epson Label Editor on Windows and
use Windows CRLF records on checkout.

- Consolidated wiring master: [`Mazak_Wiring_Master_7i80HDT_7i44_7i49_7i84U_Current_Authority.xlsx`](Mazak_Wiring_Master_7i80HDT_7i44_7i49_7i84U_Current_Authority.xlsx)
  — generated 132-row Excel snapshot of the current authority for the 7i80HDT /
  7i44 / 7i49 / 7i84U-A / 7i84U-B stack. It includes formula-driven summaries;
  P2 is unused/spare (confirmed 2026-08-13 by `readhmid`) and the Renishaw
  MP-3 probe is on 7i84U-B input-15 (opto-isolated 24 V). The
  `... - Overview.csv` sibling file is a plain-text workbook index. The authoritative
  source remains `../mesa/current_pin_authority.csv`.
- Current pin authority: [`../mesa/current_pin_authority.csv`](../mesa/current_pin_authority.csv)
  — current table for connector, pin/channel, HAL net, status, source basis, and
  cleanup notes.
- Two-plane installation index: [`interface_plane_crosswalk.md`](interface_plane_crosswalk.md)
  — controls how BBIA-1 and the CNA/direct-analog plane are joined without
  reclassifying unresolved pins as verified.
- Plane A BBIA-1 installation crosswalk: [`plane_a_bbia1_pin_crosswalk.csv`](plane_a_bbia1_pin_crosswalk.csv)
  — generated 320-row accounting of every machine-facing BBIA pin, including
  Mesa destination, authority/hold state, verification action, and OEM page.
  Regenerate with `python3 scripts/generate_interface_crosswalks.py`.
- Plane B conductor table: [`plane_b_pin_crosswalk.csv`](plane_b_pin_crosswalk.csv)
  — one row per resolver, axis-command, CNA10, and corrected CN4 spindle-reference
  conductor, with exact 7i49 terminals and explicit holds.
- I/O map research notes: [`io_map_research_notes.md`](io_map_research_notes.md) —
  designator research from the OEM maintenance/operating manuals and electrical
  circuit diagram (`41434WB.pdf`), including the pallet-changer (2PC) signal set,
  door interlocks, and open discrepancies to verify against
  `../mesa/current_pin_authority.csv` before wiring (see its "Reconciliation" and
  "Still to locate" sections).
- I/O workbook: [`../bom/Mazak_VQC_20-40_Retrofit_IO_Workbook.xlsx`](../bom/Mazak_VQC_20-40_Retrofit_IO_Workbook.xlsx)
  — second generated 132-row Excel view of the current authority for I/O planning
  and parts coordination; it is not an independent authority source.
- Cabinet photo checklist: [`../docs/cabinet_photo_checklist.md`](../docs/cabinet_photo_checklist.md)
  — what to photograph before finalizing wiring.
- Sister-machine wiring reference: [SRDCO MazakVQC1540 complete 2017 reference package](https://github.com/srdco/MazakVQC1540/tree/master/MAZAK-VQC1540-20170501)
  — full 2017-05-01 config/wiring snapshot from the VQC 15/40 build; cross-check winding
  pairs, resolver/drive wiring, and HAL nets against this before finalizing.
- [Authority conflicts](authority_conflicts.md) — unresolved solenoid and magazine-direction conflicts that must be cleared before affected outputs are wired.
- **Spindle-head device placard:** [`head_device_placard.md`](head_device_placard.md) — OEM legend (dwg `24136209710`) transcribed. **Read the warning at the top: it is a generic family plate listing devices this machine does not have.**
- **Spindle-head valve hardware:** [`head_valve_hardware.md`](head_valve_hardware.md) — Nachi/CKD valve inventory, coil wire labels (`410`/`412`/`413`/`415`/`416` + `16` common), 100 VAC coil confirmation, pressure data.
- **Cabinet as-found survey:** [`cabinet_asfound_survey.md`](cabinet_asfound_survey.md) — terminal strips, motor starters, control gear. Photo inventory only. Carries the safety-chain strip (`57`/`57A`/`57B`/`58`/`59`/`60`/`EMB`/`MAR`) that anchors the D5 trace.
- **BBIA-1 terminal unit ("Honda" MR-series connectors):** [`bbia1_terminal_unit.md`](bbia1_terminal_unit.md) — board role, connector family (HTK MR-50RMW / MR-20RMW), and connector map (CN1–CN6, CN7, CN11, CN12).
- **BBIA-1 detailed pinouts:** [`bbia1_cn_pinouts.md`](bbia1_cn_pinouts.md) and [`bbia1_cn_pinouts.csv`](bbia1_cn_pinouts.csv) — per-pin wire number, signal name, function, and inside/outside connector. The 2026-08-18 p74 visual audit corrected CN8 to the NC-facing row and added the previously omitted machine-facing CN200 MMS-receiver connector.
- **BBIA-1 laminated reference sheet (replaces per-wire CN ferrules, 2026-08-09):** [`bbia1_cn_labels_epson.md`](labels/bbia1_cn_labels_epson.md) and [`bbia1_cn_labels_epson.csv`](labels/bbia1_cn_labels_epson.csv) — 390 rows (`Wire` / `Location` / `Signal`) feeding [`bbia1_wire_reference_sheet.html`](labels/bbia1_wire_reference_sheet.html) via `scripts/generate_wire_reference_sheet.py`; print 8.5"×11", laminate, hang in the cabinet. The factory jacket print identifies each conductor at the cut.
- **Epson 6 mm Mesa-end ferrule batch:** [`bbia1_mesa_end_ferrules_epson.md`](labels/bbia1_mesa_end_ferrules_epson.md) and [`bbia1_mesa_end_ferrules_epson.csv`](labels/bbia1_mesa_end_ferrules_epson.csv) — conservative direct-to-Mesa subset of the cut BBIA conductors. Only `Label_Text` (for example `B-TB3-07`) is printed; all current rows remain `HOLD_SOURCE_TRACE` pending continuity proof.
- **Epson LW-PX700 7i84U-B terminal batch:** [`7i84u_b_terminal_legend_epson.md`](labels/7i84u_b_terminal_legend_epson.md) and [`7i84u_b_terminal_legend_epson.csv`](labels/7i84u_b_terminal_legend_epson.csv) — physical terminal position plus logical channel, signal, HAL reference, authority status, and a print-release hold. Regenerate all printer CSVs with `python3 scripts/generate_label_csvs.py --write`.

## Status

**Logical I/O allocation: documented. Physical BBIA-to-retrofit destination
crosswalk: complete as an accounting artifact, not as a wire-release sheet.** The authority workbook and
`../mesa/current_pin_authority.csv` record the planned Mesa functions. The
generated Plane A crosswalk accounts for all 320 bottom-row pin positions and
joins the 45 current authority routes plus four explicit held candidates. Rows
marked `HOLD_*`, reserved, unallocated, power/common, safety-retained, or spare
must not be landed as Mesa signals. CN12's terminal-unit hop, the three FR-SX
speed-reference roles, CN200-3 probe identity, and the registered OEM conflicts
still require the stated field checks.

Terminal labels, wire numbers, normal states (NO/NC), and drive/encoder pinouts
still require cabinet verification before any wiring or bring-up. See the
`authority_status` column in `../mesa/current_pin_authority.csv` for per-signal
verification state and cleanup notes.

## Wiring items to trace in the cabinet

- X/Y/Z servo drive command, enable, and fault terminal labels.
- Mitsubishi FR-SX spindle analog/run/direction/alarm terminals.
- X/Y/Z resolver winding pairs and cabling (see the resolver warning below).
- ATC / hydraulic / magazine prox and solenoid labels and normal states
  (PRS-8/9, PRS-10/12, PRS-13, PRS-21..25, SOL-8A/8B, SOL-10, M15/M16 if present).

## Resolver wiring warning (Tamagawa resolvers → Mesa 7i49)

Axis feedback is **resolver, not encoder**. The machine keeps its original **Tamagawa
resolvers** (**Tamagawa TS2014N** / Mitsubishi BKO-NC6062A, confirmed on-machine July 2026), read through a **plain
Mesa 7i49** on the 7i80HDT P1 daughter-card connector (confirmed 2026-08-13 by `readhmid`) at **5 kHz** excitation. Wire the resolvers carefully:

- **Do not trust the original wire names.** The original **Meldas M2 / TRA** wiring may
  run the resolver "backwards" or phase-analog: **two-phase excitation into the stator,
  phase read from the rotor**. The 7i49 is the opposite — it uses **conventional single
  excitation** and **reads sin/cos amplitude**.
- **Identify the winding pairs with an ohmmeter BEFORE applying power.** Expected mapping
  once verified:
  - Rotor pair (likely **R1/R2**) → **RESDRV+ / RESDRV−** (excitation).
  - Two matched stator pairs (**S1-S3** and **S2-S4**) → **RESSIN** and **RESCOS**.
  - Verify each pairing by resistance/continuity — do not assume the labeled wire names
    match this scheme.
- **The 7i49 must be the sole resolver excitation source.** TRA-type drives close their
  velocity loop on a **tachometer**, not the resolver, so LinuxCNC/7i49 can own excitation
  outright — but confirm nothing from the old drive/control still drives the windings.
- **`MS3108B 20-29P` is a connector shell part number, not a resolver model** — do not
  record it as the resolver type.
- **Signal level / tuning:** on a 2:1 resolver the 7i49 drives ~2 V RMS and expects ~1 V
  RMS sin/cos back. **Scope the return level after excitation.** Low signal shows as
  position noise / sluggish response. **W2 does not help the X/Y/Z axis channels** —
  per the 7i49 manual, W2 down halves reference drive on channels 3/4/5 only, and X/Y/Z
  live on channels 0/1/2. If the return is far off the ~1 V RMS target, escalate to
  Mesa (PCW) for review of the specific TS2014N suffix on this machine before adding
  external dividers or a 7i49HV.
- **Shield / ground:** keep resolver cabling shielded and separated from power wiring;
  the shield/ground termination point is still to be finalized.
