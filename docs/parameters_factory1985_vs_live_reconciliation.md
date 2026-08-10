# Factory (1985) parameter sheet vs. live 2026 values — reconciliation

**Machine:** Mazak VQC-20/40 SN 060231 (Mazatrol M-2)
**Reconciled:** 2026-08-09
**Factory source:** `Manuals_SN060231/Original Manuals/60231 Parameters.pdf` — a
"VQC PARAMETER TABLE, VQC-40B M-2, NEW N.C. CONTROLLER" sheet, printed
**REVISED 4/85**, i.e. the machine's **as-shipped (~1985) parameter record**,
with the machine-specific values filled in by hand over the printed template.
Rendered at 300 DPI from PDF pages 11-15 (printed pages 10-14).
**Live source:** `docs/parameters_sn060231.md` — values photographed off the
running M-2 CRT on 2026-07-28 (the ✓✓ values were zoom-verified).

---

## BLUF — do NOT use the factory sheet as current values

The 1985 factory sheet **materially disagrees with the live 2026 machine** on
~18 of the Machine Constant No.2 parameters, including several that are
safety- or motion-relevant. **`docs/parameters_sn060231.md` (the live 2026-07-28
photos) remains authoritative for the current machine.** This factory sheet is
useful only as (a) a historical as-shipped baseline and (b) a source of a few
parameters the live capture is still missing — and even those must be treated as
**unverified against the current control** until read live per
`docs/parameter_recovery.md`.

The divergence is expected: 40 years of service, re-teaching the ATC position,
backlash re-measurement, and soft-limit edits will all have moved values since
the machine left the factory.

---

## Machine Constant Parameter No.2 — full comparison

Values are the M-2's native 0.0001-inch counts (or raw, per the live doc's
notes). "✗" marks a real disagreement.

### Soft limits (two boxes: main = corners 1/2, ATC area = corners 3/4)

| Param | Factory 1985 | Live 2026-07-28 | |
|---|---|---|---|
| LX1 | 394 | 394 | ✓ |
| LY1 | 394 | 394 | ✓ |
| LZ1 | 394 | 394 | ✓ |
| LX2 | −394094 | −394094 | ✓ |
| **LY2** | **−200394** | **−300394** | ✗ **10 in difference in Y− main soft limit** |
| LZ2 | −181496 | −181496 | ✓ |
| LX3 | 394 | 394 | ✓ |
| **LY3** | **94882** | **95000** | ✗ ATC-box Y+ (0.0118 in) |
| LZ3 | 394 | 394 | ✓ |
| LX4 | −394094 | −394094 | ✓ |
| LY4 | 394 | 394 | ✓ |
| LZ4 | −59449 | −59449 | ✓ |

### ATC 2nd zero point (RP)

| Param | Factory 1985 | Live 2026-07-28 | |
|---|---|---|---|
| RP1 (X) | 0 | 0 | ✓ |
| **RP2 (Y)** | **94488 (+9.4488 in)** | **95000 (+9.5000 in)** | ✗ 0.0512 in — ATC Y position |
| RP3 (Z) | −59055 (−5.9055 in) | −59055 | ✓ (= −150.00 mm exactly) |
| RP4 (4th) | 0 | 0 | ✓ |

### Zero return / homing

| Param | Factory 1985 | Live 2026-07-28 | |
|---|---|---|---|
| ZS1 | 148 | 0 | ✗ grid shift X |
| ZS2 | 723 | 0 | ✗ grid shift Y |
| ZS3 / ZS4 | 0 / 0 | 0 / 0 | ✓ |
| ZC1 / ZC2 / ZC3 | 79 / 79 / 79 | 79 / 79 / 79 | ✓ |
| ZC4 | 0 | 0 | ✓ |
| **ZD1** | **1** | **0** | ✗ zero-return direction X |
| ZD2 / ZD3 | 1 / 1 | 1 / 1 | ✓ |
| ZD4 | 0 | 0 | ✓ |
| ZP1–ZP4 | 0 | 0 | ✓ |

### Rapids, feeds, time constants

| Param | Factory 1985 | Live 2026-07-28 | |
|---|---|---|---|
| **RF1 / RF2 / RF3** | **4724** | **4212** | ✗ rapid speed X/Y/Z |
| RF4 | 0 | 4212 | ✗ (4th axis — likely n/a) |
| RT1 / RT2 / RT3 | 120 | 120 | ✓ |
| RT4 | 0 | 120 | ✗ (4th axis — likely n/a) |
| RFR | 50 | 50 | ✓ |
| **SFC** (feed clamp) | **1969** | **1457** | ✗ |
| STC (feed time const) | 50 | 50 | ✓ |
| SMP | 132 | 132 | ✓ |
| AF1 / AF2 / AF3 | 0 | 0 | ✓ |
| **AF4** | **0** | **2** | ✗ |

### Spindle gears + orient

| Param | Factory 1985 | Live 2026-07-28 | |
|---|---|---|---|
| **GH4** (high-gear max rpm) | **4000** | **3488** | ✗ |
| **GH3** (gear crossover rpm) | **946** | **434** | ✗ **HAL `gear-range.in1` uses 434 (live) — factory 946 would be wrong** |
| GH2 / GH1 | 0 / 0 | 0 / 0 | ✓ |
| GL4 (high-gear min) | 119 | 119 | ✓ |
| GL3 (low-gear max) | 28 | 28 | ✓ |
| GL2 / GL1 | 0 / 0 | 0 / 0 | ✓ |
| SPI (orient speed) | 50 | 50 | ✓ |
| SPO (gear-change coeff) | 20 | 20 | ✓ |
| GYN (gear steps) | 2 | 2 | ✓ |
| EX2 | 10 | 10 | ✓ |
| MA1 / MA2 / MA3 / MA4 | 0 / 4 / 4 / 0 | 0 / 4 / 4 / 0 | ✓ |

### Backlash + servo coefficient

| Param | Factory 1985 | Live 2026-07-28 | |
|---|---|---|---|
| BL1 (G00 X) | 0 | 0 | ✓ |
| **BL2 (G00 Y)** | **4** | **10** | ✗ |
| **BL3 (G00 Z)** | **24** | **25** | ✗ |
| BL4 | 0 | 0 | ✓ |
| MC1 / MC2 / MC3 | 784 | 784 | ✓ |
| **MC4** | **0** | **784** | ✗ (4th axis — likely n/a) |
| **MD1 (G01 X)** | **0** | **5** | ✗ |
| **MD2 (G01 Y)** | **6** | **10** | ✗ |
| **MD3 (G01 Z)** | **25** | **20** | ✗ |
| MD4 | 0 | 0 | ✓ |
| AT1–AT4 | 0 | 0 | ✓ |

**Most consequential disagreements:** LY2 (10-inch Y soft-limit gap), RP2 (ATC Y
position), GH3 (gear crossover — a value already wired into HAL from the live
capture), and the BL/MD backlash sets. Any of these taken from the factory sheet
would push wrong numbers into the retrofit config.

---

## Data the factory sheet ADDS (live capture is still missing these)

These are the parameters `parameter_recovery.md` / `parameters_sn060231.md`
list as "still wanted." The factory sheet supplies a **1985 baseline** for them —
**record as reference, but confirm against the live No.1/No.3 control screens
before using**, because No.2 above proves the sheet has drifted from the machine.

From Machine Constant No.2 continuation (printed page 11):
- **MP8 / MP9 / MPA / MPB (linear-scale low-speed gain X/Y/Z/4) = 0 / 0 / 0 / 0.**
  Factory shipped with **no linear scales / Magnescale** — baseline evidence
  toward the open "Y Magnescale?" question (consistent with the schematic's
  "MAGNE SCALE DETECTOR (OPTION) — not fitted").
- **TH0–THF (thermal comp) = all 0** — no thermal compensation at factory.
- **A1X–A7Z (drum change zero points) = all 0** — armless ATC, no per-station
  drum points.
- **TCZ (ATC Z coordinate) = −59060**; **TCE = TCC = TCA = 0** — armless ATC
  (matches the live TCE=TCC=0 finding). Note TCZ −59060 vs live RP3 −59055 differ
  by 5 counts (0.0005 in).
- **DP0–DPF (DNC timers / machine number) = all 0.**
- MP1–MP7 = 7 / 50 / 50 / 5 / 1 / 10 / 10; AC1–AC3 = 0; and the
  FM/EM/BM/DM/DN/EN timing-constant block (FM1 100, EM1 20, BM1 40, DM1 30,
  DN1 30, EN1 30, plus the hand-entered FM3 20, EM2 102, BM2 51, DM2 114,
  DN2 51, FN2 51, etc.) — ATC/spindle timing constants, record-only for the
  retrofit.

Pitch Error Compensation (printed pages 12-14, one screen per axis X/Y/Z), each:
- Header PP1 = PP2 = PP3 = **7874**, PP4 = 0; PZ1 = PZ2 = PZ3 = **126**, PZ4 = 0;
  **PSL = 7**.
- The 128-point comp tables are near-zero (mostly 0, a scattering of ±1/±2/±3
  counts in the higher-index columns). Baseline only — if the machine's pitch
  comp was never re-tabulated this may still hold, but it is unverified.

---

## Recommendation

1. **Keep `docs/parameters_sn060231.md` (live 2026-07-28) as the sole source of
   current Machine Constant No.2 values.** Do not overwrite any of it from this
   factory sheet.
2. To close out the still-missing parameters (pitch comp, thermal, MP8–MPB,
   A1X–A7Z, TCZ, DP), **photograph the live MACH CONSTANT PAR NO.1 and NO.3
   screens** off the running control per `parameter_recovery.md` — that is
   authoritative; this 1985 sheet is not.
3. Retain this factory sheet as a historical/as-shipped baseline and a sanity
   bound (e.g., it independently corroborates the armless ATC, 2-speed gearbox,
   and no-Magnescale conclusions).
