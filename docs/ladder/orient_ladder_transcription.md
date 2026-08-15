# Spindle Orient & Gear Shift — Ladder Transcription (YM2V39L)

**Machine:** Mazak VQC 20/40, SN 060231 · Mazatrol M-2 sequence diagram 4136081801
**Source:** `VQC20-40_060231_Ladder_Diagrams.pdf` — sheets 23, 28, 29, 30, 55 (PDF pages = sheet + 1)
**Purpose:** confirm ORCM1 / CTL / SSET sequencing before writing the LinuxCNC ATC/orient HAL component. Supports PROPOSED pins from commit c4a66a0.
**Convention:** `#` prefix = normally-closed contact of that element. `]/[` = NC contact. Rung numbers = sheet×100 + line.

## The short version

Orient is not a standalone command — it rides the **gear-shift state machine**. M19 (or an ATC/recess step) sets an *orient memory* latch, which forces a gear-shift evaluation; only once a gear position is **confirmed by PRS-10 or PRS-12** does ORCM1 energize to the drive. Arrival (ORA1) is latched as an *orient safety* bit that the ATC consumes, supervised by three dedicated alarm rungs. SSET is **not** part of the per-orient sequence — it is a power-up drive-arm permissive.

## Rung transcription

### Sheet 23 — power-up permissives

| Rung | Coil | Logic (as drawn) |
|---|---|---|
| 2302 | **HYD.M** (Y096, hydraulic + head-lube pump) | `MA.N(X118) · SA.N(X119) · ESP.M(X000)` — machine-ready AND servo-ready from NC AND E-stop chain healthy |
| 2303 | HYD.MV (Y040) | `= HYD.M` (M2V twin) |
| 2304 | Emergency delay timer T-0 (K 201) | `#HYD.M · SZS.M(X001)` — runs when pump off and spindle at zero speed |
| 2305 | **SSET.M** (Y092, spindle set) | `HYD.M · PW1.M(Y090 power-on) · ESPT(T-0) · #AL46` + seal `SSET.M`, aux branches `DIHT.N`, `TOUCH.N` |
| 2306 | SSET.MV (Y022) | `= SSET.M` |
| 2307/8 | SA.M / SA.MV (Y098/Y042, servo ready out) | `SA.N(X119) · #ESP.M` |

**Reading:** SSET arms the spindle drive once hydraulics are up after power-on and stays held; the only orient-related thing that touches it is **AL46 (orient malfunction 3), which drops it**. Treat SSET as a drive enable/reset output asserted at machine-on, not an orient step.

### Sheet 28 — run commands, M38/M39 decode, range memories

| Rung | Coil | Logic |
|---|---|---|
| 2801 | SFR.M (Y008 fwd) | `SJSTT(T46) · SMR(M78 run mem) · #FFREV1` ‖ `SJOG.B(X0E2)` |
| 2802 | SRJ.M (Y009 rev) | same but `FFREV1` true |
| 2804 | Spindle stop timer T-4 | `SZS.M(X001) · #SMR` — zero speed + no run command |
| 2805 | M05 memory (M80) | M-code decode + seal, cleared via SSPT(T-4) |
| 2806 | **M38CD** gear-low cmd (M81) | `M-code M38 decode (MHO·MT3·MU8) · #TOUCH.N · #DIHT.N · #1000OS` ‖ manual branch `#AUT.M · LGPLS · #TUC.M` |
| 2807 | **M39CD** gear-high cmd (M82) | mirror of 2806 with MU9/HGPLS |
| 2808 | **HSR** high-range memory (M83) | `(M39CD ‖ seal ‖ 1000OS) · #LGPLS · #M38CD · #LSR` |
| 2809 | **LSR** low-range memory (M84) | `(M38CD ‖ seal) · #HGPLS · #M39CD · #HSR` |

### Sheet 29 — gear shift state machine

| Rung | Coil | Logic |
|---|---|---|
| 2901 | **GSFTC** gear shift command (M85) | `[(HSR · #HGPRS) ‖ (LSR · #LGPRS) ‖ SOME2(M90) ‖ M38CD ‖ M39CD ‖ SST(M74)] · #10000S · #RST` — target range ≠ confirmed position, **or orient memory active** |
| 2902 | **GSFME** gear shift in-progress memory (M86) | `(LSR ‖ HSR) · GSFTC · #RST · #10000S` ‖ `(#HGPRS · #LGPRS)` — latched while between confirmed positions |
| 2903 | GSS1 (M87) | `= GSFME` |
| 2904 | **GSF.N** (Y124 → NC) | `= GSS1` — "gear shifting" status to NC |
| 2905 | Gear shift timer T-5 (K 3) | `SZS.M(X001) · #SMR · GSF.N` — **zero speed, no run cmd, shift pending** |
| 2906 | **ENGS** enable gear shift (M88) | `= T-5` — solenoids only allowed after the zero-speed dwell |
| 2907 | **GSH.M** (Y00B gear-high sol) | `HSR · #GSL.M · #AL47` gated by `(#HGPRS · ENGS)` ‖ seal `GSH.M` |
| 2908/9 | GSH.N / GSL.N (Y120/Y121 → NC) | mirror solenoid states to NC |
| 2910 | **GSL.M** (Y00C gear-low sol) | `LSR · #GSH.M · #AL47 · #10000S` gated by `(#LGPRS · ENGS)` ‖ seal |

### Sheet 30 — orient proper

| Rung | Coil | Logic |
|---|---|---|
| 3001 | **CTL.M** (Y094 low-gear orient) | `= GSL.M` — **CTL simply mirrors the gear-low solenoid state** |
| 3002 | CTL.MV (Y03C) | `= CTL.M` |
| 3003 | **SOME2** orient memory (M90) | `[M19 decode (MHO·MT1·MU9) ‖ RCTSTEP2(M108) ‖ seal·SDSA-path] · #RST` — set by M19 or recess-tool step, latched |
| 3004 | **ORCM1.M** (Y093 orient command) | `[HGPRS ‖ LGPRS ‖ 10000S ‖ (TCME · #EQTST) ‖ seal ORCM1.M] · SOME2 · #GSFME · #TOUCH.N · #DIHT.N · #AL45 · #UOME2 · #AL46 · #PGEND.P` (+ `#RST.N` X11A branch) |
| 3005 | ORCM1.MV (Y03B) | `= ORCM1.M` |
| 3006 | Orient timer T-6 (K 3) | `ORA1(X003)` — arrival debounce |
| 3007 | ATC FIN pulse (M152) | falling edge of `TCME(M160)` |
| 3008 | **UOME2** unorient memory (M91) | `[SDSA-path ‖ M38CD·(#TCME·#TOUCH.N·#DIHT.N) ‖ M39CD ‖ AFINPLS(M152)·MDI.L ‖ SST(M74) ‖ PGEND.P ‖ SJOG.L] · #RST` + seal — cancels orient on gear change, ATC FIN, jog, program end |

### Sheet 55 — orient/gear supervision

| Rung | Coil | Logic |
|---|---|---|
| 5501/2 | SZSK zero-speed aux (M133) + T-16 (K 30) | debounced zero-speed echo of SZS |
| 5503 | Orient timer 1 T-17 (K 10) | `HYD.M · #ORCM1.M` — runs while orient NOT commanded |
| 5504 | Orient timer 2 T-18 (K 100) | `ORCM1.M` — **watchdog from orient command** |
| 5505 | SLOK.L (Y1D4 spindle lock lamp) | `= SOSA` |
| 5506 | **AL44** orient malf 1 (F44) | `SOSA · ORCT1(T-17)` + seal via `#ALRST` — oriented state present with no command |
| 5507 | **AL45** orient malf 2 (F45) | `ORCT2(T-18) · ORCM1.M · #SOSA` + seal — **commanded, timed out, never arrived** |
| 5508 | **AL46** orient malf 3 (F46) | `#SZS.M · SOSA` + seal — **"oriented" while spindle not at zero speed** → drops SSET (2305) and ORCM1 (3004) |
| 5509 | **SOSA** spindle orient safety (M92) | `[ORCM1.M · seal SOSA] ‖ ORA1(X003)` — arrival latch, held while command stands; consumed by ATC (36xx), lamp, alarms |
| 5510/11 | Gear shift watchdog T-19 + **AL47** (F47) | `GSFME · #SOME2` → T-19; timeout → AL47, blocks both gear solenoids |
| 5512 | Servo-off timer T-34 | from `#SA.M` |

Note: the M92 bit is labeled SDSA on some rungs and SOSA on others — same element, scan ambiguity; one latch.

## Derived sequence (what the HAL component must reproduce)

1. **Arm (once per power-up):** HYD pump on (`hyd-pump-on` ← MA·SA·ESP ok) → after power-on delay, assert SSET-equivalent drive arm. Drop it only on AL46-type fault.
2. **Orient request:** M19 / ATC prep sets orient-request latch. Cancel conditions: gear M-code, ATC FIN, jog, program end, reset.
3. **Gear must be confirmed first:** orient request forces the gear-shift evaluation. If neither PRS-10 (`gear-hi-conf`) nor PRS-12 (`gear-lo-conf`) is made, shift: wait `spindle-zero-speed` (IN5) true with no run command for the T-5 dwell (~0.3 s), then energize one gear solenoid until its PRS confirms; 30 s-class watchdog → gear-shift fault (blocks both solenoids, latched until reset).
4. **Command orient:** with a PRS confirmed and not mid-shift → assert `spindle-orient-cmd` (OUT4). Simultaneously `orient-lo-gear` (OUT5) **must equal the gear-low solenoid state** (CTL.M = GSL.M — combinational, not sequenced).
5. **Arrival:** `spindle-oriented` (IN4, ORA1) debounced ~0.3 s → oriented latch (SOSA equivalent). ATC motion is gated on this latch, not on the raw input.
6. **Supervision — all three are cheap HAL comps and worth keeping:**
   - orient commanded but no arrival in ~10 s → orient fault (AL45)
   - oriented latch true while `spindle-zero-speed` false → hard fault, drop drive arm + orient cmd (AL46)
   - oriented latch true with no command pending (AL44) → warning
7. **Unorient:** drop `spindle-orient-cmd` on any cancel condition; latch clears because seal path opens.

### Pin mapping recap (all PROPOSED, commit c4a66a0)

| Ladder element | Mesa pin | HAL net |
|---|---|---|
| X003 ORA1 | 7i84U IN4 | spindle-oriented |
| X001 SZS.M | 7i84U IN5 | spindle-zero-speed |
| Y093 ORCM1.M | 7i84U-A OUT4 | spindle-orient-cmd |
| Y094 CTL.M | 7i84U OUT5 | orient-lo-gear |
| Y096 HYD.M | 7i84U OUT3 | hyd-pump-on |
| Y092 SSET.M | — unassigned | candidate for TB5 SSR OUT5 (see below) |

**SSET decision input:** the ladder shows SSET is a real, held drive permissive with ATC interlock consumers (#4302–#4304, #4401). If the FR-SX actually needs it as a discrete input, it should take the last spare (TB5 SSR OUT5) — verify at the drive terminals whether SSET lands on the FR-SX or on the DK-427 interface before spending the pin.

## Open questions

1. **Timer base unverified.** K values read T-5 K 3, T-18 K 100, T-19 K 3000(?), T-0 K 201. A 100 ms base gives sensible 0.3 s / 10 s values but makes T-19 300 s — either the base differs per timer, or T-19 reads K 300. Get the M-2 PLC timer spec or measure on the live machine before locking watchdog constants. The 0.3 s debounce / 10 s orient watchdog are safe engineering values regardless.
2. **FR-SX terminals** for ORCM1, CTL, SSET, ORA1, SZS need physical identification — polarity and contact rating before wiring the PROPOSED pins. **UPDATE 2026-08-10:** the "electrical schematics pp.127–130" pointer is wrong — PDF pp.128/130/131 are the axis servo drive (4143075404), Magnescale option (not fitted), and aux motor control (4143075405), **not** the spindle. The 41434WB set has **no FR-SX terminal-detail sheet** (see `wiring/electrical_diagram_index.md`). This is a **commissioning / Mitsubishi-FR-SX-manual** item, not paper-mineable — verify at the drive terminals.
3. **1000OS (M436)** appears as an orient-path qualifier (10,000 min⁻¹ spec / high-speed option flag?) — identify before assuming it's always false on this machine. **UPDATE 2026-08-10:** `M436` is **not** in the element list (`VQC20-40_060231_Element_List.csv` is X/Y physical I/O only), so it's an **internal PLC relay**, not a field I/O point — it can't be resolved from the I/O dictionary; determine its set-condition from the ladder rung that drives M436, or treat as constant per the machine's spindle-speed spec (4000 rpm nameplate ⇒ not a 10k-rpm machine, so likely always false here).
4. **ORA1 also feeds the recess-tool option** (rung 4810 RECMEM) — irrelevant unless the recessing option is fitted.

## Sources

- Ladder: `VQC20-40_060231_Ladder_Diagrams.pdf` sheets 23 (p.24), 28 (p.29), 29 (p.30), 30 (p.31), 48 (p.49), 55 (p.56), drawing 4136081801
- Element addresses: `VQC20-40_060231_Element_List.csv`
- Pin assignments: `mesa/current_pin_authority.csv` @ c4a66a0
- Drive context: `servo_amp_analysis.pdf` (FR-SX orient interface)
