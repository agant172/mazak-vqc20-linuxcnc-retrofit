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
- X/Y/Z resolver winding pairs and cabling (see the resolver warning below).
- ATC / hydraulic / magazine prox and solenoid labels and normal states
  (PRS-8/9, PRS-10/12, PRS-13, PRS-21..25, SOL-8A/8B, SOL-10, M15/M16 if present).

## Resolver wiring warning (Tamagawa resolvers → Mesa 7i49)

Axis feedback is **resolver, not encoder**. The machine keeps its original **Tamagawa
resolvers** (documented models **RT-5XA-11** and **RT-5XA-L1**), read through a **plain
Mesa 7i49** at **5 kHz** excitation. Wire the resolvers carefully:

- **Do not trust the original wire names.** The original **Meldas M2 / TRA** wiring may
  run the resolver "backwards" or phase-analog: **two-phase excitation into the stator,
  phase read from the rotor**. The 7i49 is the opposite — it uses **conventional single
  excitation** and **reads sin/cos amplitude**.
- **Identify the winding pairs with an ohmmeter BEFORE applying power.** Expected mapping
  once verified:
  - Rotor pair (likely **RO1/RO2**) → **RESDRV+ / RESDRV−** (excitation).
  - Two matched stator pairs → **RESSIN** and **RESCOS**.
  - Verify each pairing by resistance/continuity — do not assume the labeled wire names
    match this scheme.
- **The 7i49 must be the sole resolver excitation source.** TRA-type drives close their
  velocity loop on a **tachometer**, not the resolver, so LinuxCNC/7i49 can own excitation
  outright — but confirm nothing from the old drive/control still drives the windings.
- **`MS3108B 20-29P` is a connector shell part number, not a resolver model** — do not
  record it as the resolver type.
- **Signal level / tuning:** on a 2:1 resolver the 7i49 drives ~2 V RMS and expects ~1 V
  RMS sin/cos back. **Scope the return level after excitation.** Low signal shows as
  position noise / sluggish response; too hot/too weak may need a divider or the **W2
  half-drive jumper** — treat W2 half-drive as a field-verification option, not a default.
  Escalate to a **7i49HV only** if the return is far too weak at full drive.
- **Shield / ground:** keep resolver cabling shielded and separated from power wiring;
  the shield/ground termination point is still to be finalized.
