# Spindle run / direction ladder logic — from YM2V39L

> **ROLE: BACKGROUND** — the retrofit's FWD/REV/RUN logic is LinuxCNC-native (`spindle.0.*` with the permit chain), not the ladder mirror described here. Kept at this path because `mesa/current_pin_authority.csv` cites it. See [../../INSTALL_SPINE.md](../../INSTALL_SPINE.md).


**Machine:** Mazak VQC-20/40 SN 060231 (Mazatrol M-2)
**Source:** `YM2V39L.pdf` / `VQC20-40_060231_Ladder_Diagrams.pdf`, drawing 4136081801.
**Extracted:** 2026-08-10 (sheets 27-28, PDF p28-29). Cross-ref `SSLL` = sheet·line.
**Scope:** discrete spindle **run / direction** (FR-SX FWD/REV/RUN). Speed is a
separate analog ±10 V path (7i49 AOUT3); gear/orient are in
`orient_ladder_transcription.md`.

## Signals

| Addr | Symbol | Meaning |
|---|---|---|
| X002 | FA | **FR-SX controller normal** (drive ready) |
| X001 | SZS.M | spindle zero speed |
| X0E0 | SST.B | spindle START pushbutton |
| X0E1 | SSP.B | spindle STOP pushbutton |
| X0E3 | SREV.B | spindle REVERSE pushbutton |
| X158 | SSP.N | spindle stop |
| M77 | SMRX | spindle run **aux** memory |
| M78 | SMR | spindle run memory (main) |
| M124 | FFREV1 | forward/reverse **direction flip-flop** |
| M80 | M05ME | M05 (stop) memory |
| Y008 | SFR.M | **SPINDLE FORWARD** output |
| Y009 | SRU.M | **SPINDLE REVERSE** output |
| Y00A | SMR.M | **SPINDLE MOTOR RUN** output (to FR-SX run/enable) |

## Run memory + direction (sheet 27, PDF p28)

- **`SMRX`** run-aux (M77, rung 2701) = start conditions · **`#AL55`** (door
  interlock) · ... — a **door-open (AL55) drops the spindle run**.
- **`SMR`** run memory (M78, rung 2702) = `TCPRS · SMRX · #ORCM1.M(not orienting)
  · #TUC.M · #TOUCH.N · #DIHT.N` + seal. **Spindle can't run while orient is
  commanded**; tool-clamp / probe / touch conditions also block it.
- **`SMR.M`** SPINDLE MOTOR RUN (Y00A, rung 2706) = **`SFR.M ‖ SRU.M`** — the
  run/enable to the FR-SX, on whenever forward OR reverse is commanded.
- **`FFREV1`** direction flip-flop (M124, rung 2710) — **toggled by the reverse PB**
  (`SREV.B`, X0E3, via REVP/SCAN/FFREV2 edge logic). FFREV1=0 → forward,
  FFREV1=1 → reverse.
- Lamps: `SST.L` start (=SMR), `SSP.L` stop (=#SMR), `SJOG.L` jog.
- **`SJSTT`** spindle-start timer (T46, K2 ≈ 0.2 s, rung 2711).

## Direction outputs (sheet 28, PDF p29)

- **`SFR.M` SPINDLE FORWARD** (Y008, rung 2801) = `SJSTT(start timer) · SMR(run) ·
  #FFREV1(not reverse)` ‖ `SJOG.B` jog branch.
- **`SRU.M` SPINDLE REVERSE** (Y009, rung 2802) = `SJSTT · SMR · FFREV1(reverse)`
  ‖ jog.
- **Spindle stop timer** (T4, K5, rung 2804) = `SZS.M(zero speed) · #SMR`.
- **`M05ME`** stop memory (M80, rung 2805) = M05 decode → clears run.
- Gear-range (M38/M39 → HSR/LSR) rungs 2806-2809 — see `orient_ladder_transcription.md`.

## Retrofit — LinuxCNC / Mesa

The FR-SX takes **discrete FWD / REV / RUN + analog ±10 V speed**:
- LinuxCNC `spindle.0.forward` → 7i84U-A output → FR-SX **FWD** (= OEM `SFR.M`)
- `spindle.0.reverse` → 7i84U-A output → FR-SX **REV** (= OEM `SRU.M`)
- spindle **enable/run** = FWD ‖ REV (= OEM `SMR.M`) — mirror `Y00A = Y008 ‖ Y009`
- `spindle.0.speed-out` → **7i49 AOUT3** ±10 V (separate analog path)
- **Drop the FFREV1 flip-flop** — that's a panel-jog nicety; LinuxCNC issues M3/M4
  as explicit forward/reverse, so map M3→FWD, M4→REV directly.
- **Interlocks to reproduce in HAL:** spindle run requires **FR-SX controller
  normal** (`FA`, X002), **not-orienting** (`#ORCM1`), and **door-closed** (AL55
  drops run). Use **spindle-zero-speed** (`SZS.M`, X001) for stop confirmation and
  the gear-shift zero-speed dwell.
- Start delay `SJSTT` (~0.2 s) is minor — a small on-delay before asserting FWD/REV.
