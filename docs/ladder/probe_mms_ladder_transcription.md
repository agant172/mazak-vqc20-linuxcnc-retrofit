# Probe / MMS (measuring system) ladder logic — from YM2V39L

> **ROLE: BACKGROUND** — confirmatory only: SKIP1 → 7i84U-B IN15 was already the plan of record, and the MMS arm is dropped. Informed no retrofit code. Kept at this path because `mesa/current_pin_authority.csv` cites it. See [../../INSTALL_SPINE.md](../../INSTALL_SPINE.md).


**Machine:** Mazak VQC-20/40 SN 060231 (Mazatrol M-2)
**Source:** `YM2V39L.pdf` / `VQC20-40_060231_Ladder_Diagrams.pdf`, drawing 4136081801.
**Extracted:** 2026-08-10 (sheets 40-41, PDF p41-42). Cross-ref `SSLL` = sheet·line.
**Scope:** the OEM tool-measure arm (MMS) + touch/skip signal. The retrofit's
Renishaw MP-3 spindle probe replaces the workpiece-probing role; this documents
what the OEM did so the retrofit can reproduce or consciously drop it.

## Signals

| Addr | Symbol | Meaning |
|---|---|---|
| X03F | SKIP1.M | **SKIP 1** — touch/probe strobe (the SKIP the retrofit routes to 7i84U-B IN15) |
| X159 | TOUCH.N | TOUCH TOOL (tool touches the measure arm/setter) |
| X060 | MMS-PON | MMS unit power on |
| X062 | SEN-RDY | MMS sensor ready |
| X063 | MMS-ST | MMS start |
| X026 / X027 | AEXTRS / ARETRS | measuring-arm extend / retract **limit switches** |
| X15D / X15E | AEXT.N / ARET.N | measuring-arm extend / retract command inputs |
| Y036 | MMSCMD.M | MMS COMMAND (MMS unit on) |
| Y16F | MMSCD.N | MMS command NC (to the unit/NC) |
| Y035 | A-JET.M | AIR JET (probe/tool cleaning) |
| Y034 / Y033 | AEXT.M / ARET.M | measuring-arm **EXTEND / RETRACT** outputs |
| M117 / M118 | M33ME / M34ME | M33/M34 arm extend/retract memories |

## MMS command + status (sheet 40, PDF p41)

- **`MMSCMD.M`** MMS unit on (Y036, rung 4003) = `TOUCH.N(X159) · #TF` — assert the
  measure-unit command on a tool-touch when no T-strobe is pending.
- **`MMSONX`** sensor-ready-on aux (M104, rung 4008) = `SEN-RDY · TOUCH.N · #RST` + seal.
- **`MMSCD.N`** command NC (Y16F, rung 4009) = `MMSONX · MMS-PON · MMS-ST`.
- **`A-JET.M`** air jet (Y035, rung 4002) = `SAB.M(spindle air blast) · …` — cleaning air.
- Lamps: MMS-ON (`MMS-PON·PW1`), READY (`SEN-RDY`), START (`MMS-ST`), **SKIP
  (`SKIP1.M · #TF · TOUCH.N`)** — the skip lamp fires on a probe/tool touch.

## Measuring-arm extend/retract (sheets 40 + 41)

- **`M33ME`** extend memory (M117, sheet 40 rung 4010) = `M33 decode(MHO·MT3·MU3) · #RST`
  + seal. **`M34ME`** retract memory (M118, rung 4011) = `M34 decode(…MU4)`.
- **`AEXT.M`** MEASURING ARM EXTEND (Y034, sheet 41 rung 4102) — latched, driven by
  the M33 memory + `AEXTRS`; **gated by `*ESP.M` so E-stop drops the arm extend**
  (see `estop_ladder_transcription.md`).
- **`ARET.M`** MEASURING ARM RETRACT (Y033, sheet 41 rung 4105).
- **Interlock:** coolant is inhibited while the arm is out (`#ARETRS` term in every
  coolant rung — see `coolant_ladder_transcription.md`).

So the OEM flow: **M33** swings the measure arm in, the tool descends and touches
it, **`SKIP1.M`/`TOUCH.N`** latches the touch (skip lamp), the NC records the
tool length via the MMS unit, then **M34** retracts the arm. Air jet cleans.

## Retrofit — LinuxCNC / Mesa

- **Workpiece probing = Renishaw MP-3 → `SKIP1` on 7i84U-B IN15 → HAL
  `motion.probe-input`** for G38.x. That path is already the plan of record; this
  ladder confirms `SKIP1.M` (X03F) is the OEM SKIP strobe it corresponds to.
- **Tool-length measurement:** decide whether to **keep the OEM swing-arm** (M33/M34
  → 7i84U outputs, extend/retract limit switches → inputs, coolant-inhibit while
  out) **or replace it** with a Renishaw tool setter + LinuxCNC's own tool-length
  routine. If kept: reproduce the M33-extend / touch / M34-retract sequence with
  the `AEXTRS`/`ARETRS` confirmations, and keep the **E-stop-drops-arm** and
  **coolant-off-while-extended** interlocks.
- **A-JET** (air-blast clean) is a simple output — energize during probe/measure.
- MMS unit `MMS-PON`/`SEN-RDY`/`MMS-ST` handshake is only needed if the OEM MMS
  measuring unit is retained; with a Renishaw + LinuxCNC it's not.

_This closes the probe/MMS functional-logic gap; the arm is optional for the
retrofit (Renishaw MP-3 is the modern replacement), but the SKIP/probe-input
mapping is real and in use._
