# Wiring and I/O Planning

This folder holds wiring and field-I/O planning references for the Mazak VQC 20/40
retrofit. The authoritative signal-to-Mesa mapping currently lives in the Mesa
folder and is mirrored conceptually here for wiring planning.

## Key references

- Master signal map: [`../mesa/signal_map.csv`](../mesa/signal_map.csv) — maps each
  machine signal to its subsystem, direction, Mesa card/connector/bit, and the
  LinuxCNC HAL net used in the skeleton HAL files.
- I/O workbook: [`../bom/Mazak_VQC_20-40_Retrofit_IO_Workbook.xlsx`](../bom/Mazak_VQC_20-40_Retrofit_IO_Workbook.xlsx)
  — full I/O planning spreadsheet the skeleton was generated from.
- Cabinet photo checklist: [`../docs/cabinet_photo_checklist.md`](../docs/cabinet_photo_checklist.md)
  — what to photograph before finalizing wiring.

## Status

All wiring assignments are **planning-stage / inferred**. Terminal labels, wire
numbers, normal states (NO/NC), and drive/encoder pinouts must be traced and
confirmed in the cabinet before any wiring or bring-up. See the `Status` column in
`signal_map.csv` for per-signal confidence (Confirmed / Inferred / Verify in cabinet).

## Wiring items to trace in the cabinet

- HR-11F-24 24 V supply: `+S`, `+`, `-`, `-S`, `TOG`, `CNT`, `FG`, plus P24/G24
  distribution, remote sense, and branch fusing.
- E-stop, door interlock, ready chain, and servo contactor wiring — record the
  full hardware safety chain before any control rewiring.
- X/Y/Z servo drive command, enable, and fault terminal labels.
- Mitsubishi FR-SX spindle analog/run/direction/alarm terminals.
- ATC / hydraulic / magazine prox and solenoid labels and normal states
  (PRS-8/9, PRS-10/12, PRS-13, PRS-21..25, SOL-8A/8B, SOL-10, M15/M16 if present).
