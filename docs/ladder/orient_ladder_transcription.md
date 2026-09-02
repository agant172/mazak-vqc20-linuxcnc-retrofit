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
| 2305 | **SSET.M** (Y092, spindle set) | `[(HYD.M ‖ seal SSET.M) · PW1.M(Y090 power-on) · #ESPT(T-0) ‖ DIHT.N ‖ TOUCH.N] · #AL46` — ESPT is **normally-closed**: T-0 only times out ~20 s after the pump stops, so SSET arms with power-on (no delay) and drops on a sustained pump stop or AL46 |
| 2306 | SSET.MV (Y022) | `= SSET.M` |
| 2307/8 | SA.M / SA.MV (Y098/Y042, servo ready out) | `SA.N(X119) · ESP.M(X000)` — same normally-open ESP.M contact as rung 2302 |

**Reading:** SSET arms the spindle drive once hydraulics are up after power-on and stays held; the only orient-related thing that touches it is **AL46 (orient malfunction 3), which drops it**. Treat SSET as a drive enable/reset output asserted at machine-on, not an orient step.

### Sheet 28 — run commands, M38/M39 decode, range memories

| Rung | Coil | Logic |
|---|---|---|
| 2801 | SFR.M (Y008 fwd) | `(SJSTT(T46) ‖ #SJOG.B(X0E2)) · SMR(M78 run mem) · #FFREV1` — the jog branch is a **normally-closed** contact paralleling only SJSTT |
| 2802 | SRJ.M (Y009 rev) | same but `FFREV1` true |
| 2804 | Spindle stop timer T-4 | `SZS.M(X001) · #SMR` — zero speed + no run command |
| 2805 | M05 memory (M80) | M-code decode + seal, cleared via SSPT(T-4) |
| 2806 | **M38CD** gear-low cmd (M81) | `[M-code M38 decode (MHO·MT3·MU8) ‖ manual branch #AUT.M · LGPLS · #TUC.M] · #TOUCH.N · #DIHT.N · #10000S` — qualifiers apply to both paths |
| 2807 | **M39CD** gear-high cmd (M82) | mirror of 2806 with MU9/HGPLS |
| 2808 | **HSR** high-range memory (M83) | `(M39CD ‖ seal) · (#LGPLS ‖ AUT.M) · #M38CD · #LSR` ‖ `10000S` — AUT.M (NO) defeats the manual low pulse in auto; 10000S forces HSR unconditionally |
| 2809 | **LSR** low-range memory (M84) | `(M38CD ‖ seal) · (#HGPLS ‖ AUT.M) · #M39CD · #HSR · #10000S` |

### Sheet 29 — gear shift state machine

| Rung | Coil | Logic |
|---|---|---|
| 2901 | **GSFTC** gear shift command (M85) | `{[(HSR · #HGPRS) ‖ (LSR · #LGPRS)] · GSFTC(seal) ‖ SOME2(M90) ‖ M38CD ‖ M39CD ‖ SST(M74)} · #10000S · #RST` — set only by M38/M39/orient memory/spindle start; range-vs-position mismatch merely **holds** the command through the GSFTC seal until the PRS confirms |
| 2902 | **GSFME** gear shift in-progress memory (M86) | `(LSR ‖ #HGPRS) · (HSR ‖ #LGPRS) · GSFTC · #RST · #10000S` — true while GSFTC stands and the commanded range's PRS has not confirmed; not a latch |
| 2903 | GSS1 (M87) | `= GSFME` |
| 2904 | **GSF.N** (Y124 → NC) | `= GSS1` — "gear shifting" status to NC |
| 2905 | Gear shift timer T-5 (K 3) | `SZS.M(X001) · SMR · GSF.N` — **zero speed, run memory ON, shift pending** (SMR is normally-open here, opposite of rung 2804) |
| 2906 | **ENGS** enable gear shift (M88) | `= T-5` — solenoids only allowed after the zero-speed dwell |
| 2907 | **GSH.M** (Y00B gear-high sol) | `[HSR ‖ (HGPRS ‖ seal GSH.M) · #ENGS] · #GSL.M · #AL47` — HSR drives the solenoid directly; `(HGPRS ‖ seal)·#ENGS` **holds the outgoing gear's solenoid until the zero-speed dwell (ENGS) releases it** |
| 2908/9 | GSH.N / GSL.N (Y120/Y121 → NC) | mirror solenoid states to NC |
| 2910 | **GSL.M** (Y00C gear-low sol) | `[LSR ‖ (LGPRS ‖ seal GSL.M) · #ENGS] · #GSH.M · #AL47 · #10000S` — mirror of 2907 |

### Sheet 30 — orient proper

| Rung | Coil | Logic |
|---|---|---|
| 3001 | **CTL.M** (Y094 low-gear orient) | `= GSL.M` — **CTL simply mirrors the gear-low solenoid state** |
| 3002 | CTL.MV (Y03C) | `= CTL.M` |
| 3003 | **SOME2** orient memory (M90) | `[M19 decode (MHO·MT1·MU9) ‖ RCTSTEP2(M108) ‖ seal SOME2 · #SOSA] · #RST` — set by M19 or recess-tool step; the seal runs through **#SOSA**, so the memory self-clears once arrival latches (ORCM1 then holds on its own seal) |
| 3004 | **ORCM1.M** (Y093 orient command) | `{[(HGPRS ‖ LGPRS ‖ 10000S) · SOME2 · #GSFME ‖ TCME · #EQTST] · #TOUCH.N · #DIHT.N ‖ seal ORCM1.M} · (#AL45 ‖ #RST.N(X11A)) · #UOME2 · #AL46 · #PGEND.P` — the ATC path (TCME) bypasses SOME2/#GSFME; the seal holds through only the alarm/cancel block; #RST.N parallels #AL45 specifically |
| 3005 | ORCM1.MV (Y03B) | `= ORCM1.M` |
| 3006 | Orient timer T-6 (K 3) | `ORA1(X003)` — delayed-arrival bit consumed **only by the recess-tool logic (#4809)**; the SOSA latch (5509) uses raw ORA1 |
| 3007 | ATC FIN pulse (M152) | falling edge of `TCME(M160)` |
| 3008 | **UOME2** unorient memory (M91) | `{SOSA · seal UOME2 ‖ [(M38CD ‖ M39CD ‖ PGEND.P ‖ SJOG.L) · #TCME ‖ AFINPLS(M152)·#MDI.L ‖ SST(M74)] · #TOUCH.N · #DIHT.N} · #RST` — every cancel trigger passes #TOUCH.N·#DIHT.N and the gear/program/jog triggers also need #TCME (no cancel mid-ATC); the seal runs through SOSA and self-clears when the oriented latch drops |

### Sheet 55 — orient/gear supervision

| Rung | Coil | Logic |
|---|---|---|
| 5501/2 | SZSK aux (M133) + T-16 (K 30) | `SZSK = #SZSXT(T-16)·seal ‖ #SZS`; `T-16 = SZSK · SZS` — SZSK sets while SZS is **false** and drops K 30 after it returns; SZS (M132, rung 5411) is computed (`#GSF.N·#SST·#SF·#SOME2·#UOME2`), not the sensor |
| 5503 | Orient timer 1 T-17 (K 10) | `HYD.M · #ORCM1.M` — runs while orient NOT commanded |
| 5504 | Orient timer 2 T-18 (K 100) | `ORCM1.M` — **watchdog from orient command** |
| 5505 | SLCK.L (Y1D4 spindle lock lamp) | `= SOSA` |
| 5506 | **AL44** orient malf 1 (F44) | `SOSA · ORCT1(T-17)` + seal via `#ALRST` — oriented state present with no command |
| 5507 | **AL45** orient malf 2 (F45) | `ORCT2(T-18) · ORCM1.M · #SOSA` + seal — **commanded, timed out, never arrived** |
| 5508 | **AL46** orient malf 3 (F46) | `#SZS.M · SOSA` + seal — **"oriented" while spindle not at zero speed** → drops SSET (2305) and ORCM1 (3004) |
| 5509 | **SOSA** spindle orient safety (M92) | `[ORCM1.M · seal SOSA] ‖ ORA1(X003)` — arrival latch, held while command stands; consumed by ATC (36xx), lamp, alarms |
| 5510/11 | Gear shift watchdog T-19 + **AL47** (F47) | `GSFME · #SOME2` → T-19; timeout → AL47, blocks both gear solenoids |
| 5512 | Servo-off timer T-34 (K 9000) | from `SA.M` (normally-open) |

Note: the M92 bit reads SOSA ("SPINDLE ORIENT SAFETY") legibly on every rung checked (3003, 3008, 5505–5509); no SDSA label exists.

## Derived sequence (what the HAL component must reproduce)

1. **Arm:** HYD pump on (`hyd-pump-on` ← MA·SA·ESP ok) → assert SSET-equivalent drive arm immediately (no power-up delay); T-0 (K 201) is a ~20 s grace that drops the arm only after the pump stops. Also drop on AL46-type fault.
2. **Orient request:** M19 / ATC prep sets orient-request latch. Cancel conditions: gear M-code, ATC FIN, jog, program end, reset.
3. **Gear must be confirmed first:** orient request forces the gear-shift evaluation. If neither PRS-10 (`gear-hi-conf`) nor PRS-12 (`gear-lo-conf`) is made, shift: wait `spindle-zero-speed` (IN5) true **with the run memory still asserted** (SMR is a NO contact in rung 2905) for the T-5 dwell (~0.3 s), then energize one gear solenoid until its PRS confirms; 30 s-class watchdog → gear-shift fault (blocks both solenoids, latched until reset).
4. **Command orient:** with a PRS confirmed and not mid-shift → assert `spindle-orient-cmd` (OUT4). Simultaneously `orient-lo-gear` (OUT5) **must equal the gear-low solenoid state** (CTL.M = GSL.M — combinational, not sequenced).
5. **Arrival:** the OEM SOSA latch (5509) sets from **raw** ORA1; T-6 (~0.3 s) feeds only the recess-tool logic (#4809). A HAL-side debounce is an engineering addition, not a ladder equivalence. ATC motion is gated on the latch, not the raw input.
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

- Ladder: `YM2V39L.pdf` (obsidian-vault `Machine Shop/Mazak VQC-20-40 Retrofit/Manuals/`, drawing 4136081801, 94 sheets, PDF page = sheet+1) sheets 23 (p.24), 28 (p.29), 29 (p.30), 30 (p.31), 48 (p.49), 55 (p.56)
- Element addresses: `VQC20-40_060231_Element_List.csv` (Google Drive
  `My Drive/Mazak/Manuals_SN060231/` — not on local disk; YM2V39L's front
  pages carry the same element lists)
- Pin assignments: `mesa/current_pin_authority.csv` @ c4a66a0
- Drive context: `docs/servo_amp_analysis.md` (FR-SX orient interface)
