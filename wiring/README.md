# Wiring and I/O Planning

This folder holds wiring and field-I/O planning references for the Mazak VQC 20/40
retrofit. The current pin authority lives in the Mesa folder and is mirrored
conceptually here for wiring planning.

## Key references

- Consolidated wiring master: [`Mazak_Wiring_Master_7i80HDT_7i44_7i49_7i84U_Current_Authority.xlsx`](Mazak_Wiring_Master_7i80HDT_7i44_7i49_7i84U_Current_Authority.xlsx)
  — wiring workbook for the 7i80HDT / 7i44 / 7i49 / 7i84U-A / 7i84U-B stack. P3 GPIO is unused/spare; the Renishaw MP-3 probe is on 7i84U-B input-15 (opto-isolated 24 V). Phase 2
  cabinet-sequence, BOM-gap, hydraulic/ATC, and conflict-review tabs are integrated
  as planning aids; check the conflict-review tab before changing final pin
  assignments. The `... - Overview.csv` sibling file is the plain-text index for
  that workbook. Prefer `../mesa/current_pin_authority.csv` for authoritative pin data.
- Current pin authority: [`../mesa/current_pin_authority.csv`](../mesa/current_pin_authority.csv)
  — current table for connector, pin/channel, HAL net, status, source basis, and
  cleanup notes.
- I/O map research notes: [`io_map_research_notes.md`](io_map_research_notes.md) —
  designator research from the OEM maintenance/operating manuals and electrical
  circuit diagram (`41434WB.pdf`), including the pallet-changer (2PC) signal set,
  door interlocks, and open discrepancies to verify against
  `../mesa/current_pin_authority.csv` before wiring (see its "Reconciliation" and
  "Still to locate" sections).
- I/O workbook: [`../bom/Mazak_VQC_20-40_Retrofit_IO_Workbook.xlsx`](../bom/Mazak_VQC_20-40_Retrofit_IO_Workbook.xlsx)
  — full I/O planning spreadsheet the skeleton was generated from.
- Cabinet photo checklist: [`../docs/cabinet_photo_checklist.md`](../docs/cabinet_photo_checklist.md)
  — what to photograph before finalizing wiring.
- Sister-machine wiring reference: [SRDCO MazakVQC1540 complete 2017 reference package](https://github.com/srdco/MazakVQC1540/tree/master/MAZAK-VQC1540-20170501)
  — full 2017-05-01 config/wiring snapshot from the VQC 15/40 build; cross-check winding
  pairs, resolver/drive wiring, and HAL nets against this before finalizing.
- [Authority conflicts](authority_conflicts.md) — unresolved solenoid and magazine-direction conflicts that must be cleared before affected outputs are wired.
- **BBIA-1 terminal unit ("Honda" MR-series connectors):** [`bbia1_terminal_unit.md`](bbia1_terminal_unit.md) — board role, connector family (HTK MR-50RMW / MR-20RMW), and connector map (CN1–CN6, CN7, CN11, CN12).
- **BBIA-1 CN1–CN6 & CN11 detailed pinouts:** [`bbia1_cn_pinouts.md`](bbia1_cn_pinouts.md) and [`bbia1_cn_pinouts.csv`](bbia1_cn_pinouts.csv) — per-pin wire number, signal name, function, and inside/outside connector for the connectors being cut and re-labeled for the Mesa retrofit.
- **Epson LW-PX700 BBIA-1 ferrule batch:** [`bbia1_cn_labels_epson.md`](bbia1_cn_labels_epson.md) and [`bbia1_cn_labels_epson.csv`](bbia1_cn_labels_epson.csv) — 164 label rows (`Wire` / `Location` / `Signal`) for identifying each cut OEM connector end. It intentionally has no new Mesa destination column.
- **Epson 6 mm Mesa-end ferrule batch:** [`bbia1_mesa_end_ferrules_epson.md`](bbia1_mesa_end_ferrules_epson.md) and [`bbia1_mesa_end_ferrules_epson.csv`](bbia1_mesa_end_ferrules_epson.csv) — conservative direct-to-Mesa subset of the cut BBIA conductors. Only `Label_Text` (for example `B3-07`) is printed; all current rows remain `HOLD_SOURCE_TRACE` pending continuity proof.
- **Epson LW-PX700 7i84U-B terminal batch:** [`7i84u_b_terminal_legend_epson.md`](7i84u_b_terminal_legend_epson.md) and [`7i84u_b_terminal_legend_epson.csv`](7i84u_b_terminal_legend_epson.csv) — physical terminal position plus logical channel, signal, HAL reference, authority status, and a print-release hold. Regenerate all printer CSVs with `python3 scripts/generate_label_csvs.py --write`.

## Status

**Logical I/O allocation: documented. Physical BBIA-to-retrofit destination
crosswalk: incomplete hold.** The authority workbook and
`../mesa/current_pin_authority.csv` record the planned Mesa functions. The
initial destination crosswalk contains only 14 conservative direct-input
matches; all remain `HOLD_SOURCE_TRACE`. Relay-contact, hardware-safety,
power/common, series-net, ambiguous, retired, and remaining field destinations
must be traced before their ferrules are generated.

Terminal labels, wire numbers, normal states (NO/NC), and drive/encoder pinouts
still require cabinet verification before any wiring or bring-up. See the
`authority_status` column in `../mesa/current_pin_authority.csv` for per-signal
verification state and cleanup notes.

## Wiring items to trace in the cabinet

- HR-11F-24 24 V supply: `+S`, `+`, `-`, `-S`, `TOG`, `CNT`, `FG`, plus P24/G24
  distribution, remote sense, and branch fusing.
- E-stop, door interlock, ready chain, and servo contactor wiring — record the
  full hardware safety chain before any control rewiring.
- X/Y/Z servo drive command, enable, and fault terminal labels.
- Mitsubishi FR-SX spindle analog/run/direction/alarm terminals.
- X/Y/Z resolver winding pairs and cabling (see the resolver warning below).
- ATC / hydraulic / magazine prox and solenoid labels and normal states
  (PRS-8/9, PRS-10/12, PRS-13, PRS-21..25, SOL-8A/8B, SOL-10, M15/M16 if present).

## Resolver wiring warning (Tamagawa resolvers → Mesa 7i49)

Axis feedback is **resolver, not encoder**. The machine keeps its original **Tamagawa
resolvers** (**Tamagawa TS2014N** / Mitsubishi BKO-NC6062A, confirmed on-machine July 2026), read through a **plain
Mesa 7i49** on the 7i80HDT P2 daughter-card connector at **5 kHz** excitation. Wire the resolvers carefully:

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
