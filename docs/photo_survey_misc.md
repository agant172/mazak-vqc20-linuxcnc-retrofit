<!-- Photo survey of the "Misc. Photos" batch, 2026-07-29. -->

> **Source photos are NOT in this repo** (repo policy: no raw photos). They live
> in Andy's Google Drive at `My Drive/Mazak/Misc. Photos` — 238 files, 213 unique
> after de-duplication. Photo IDs below are the original camera filenames.
>
> **FILENAME COLLISION WARNING.** This Google Drive batch reuses camera numbers
> that also appear in the earlier `~/Downloads/Photos-1-001 (1)` batch (the live
> CRT parameter shots transcribed in `parameters_sn060231.md`). For example
> `IMG_0373` here is a **Z-axis MELDAS servo card**, while `IMG_0373` in the
> Downloads batch is a **MACH CONSTANT PAR NO.2 CRT screen**. Always state which
> batch a photo ID belongs to. Verified independently: `IMG_0434` (machine
> dataplate, MFG NO. 60231 / 6-85), `IMG_0821` (BN624A306H01 board, silkscreen
> "YM VQC-20-40/50"), `IMG_0373` (Z servo card), and the
> `TERMINAL_UNIT_DETAIL_P085` drawing scan.

# Misc. Photos — Relevance Assessment

213 photos (8 triage batches, `findings_00.md`–`findings_07.md`) of the Mazak VQC 20/40 (SN 060231, Mazatrol CAM M-2, ladder YM2V39L) were reviewed for the LinuxCNC/Mesa 7i80HDT + 7i44 + 7i49 + two-7i84U retrofit; P3 is unused. Tally across the eight batch files: **134 HIGH**, **46 MEDIUM**, **34 LOW** (one batch's count is off by one due to a summary-line artifact — treat as ~213/134/45/34).

**The 5 most consequential things this photo set reveals:**

1. **All three servo axes use Mitsubishi MELDAS DK-427 (BKO-NC2017) analog servo amplifier cards**, individually serialized (X `N444884`, Y `N434884`, Z `N444023`), each with its own Mitsubishi "TRA" transformer and a `BK0-NC6073` power transformer/choke — a complete, decision-ready dataset for the servo-amp retain/replace call (`IMG_0373`, `IMG_0375`, `IMG_0378`, `IMG_0379`).
2. **The spindle motor/gearbox speed picture is now contradictory, not just incomplete.** A sticker on the SX-CPU2 spindle board reads "BASE 1500 RPM / TOP 6000 RPM" (`IMG_0407`, also seen as a hand annotation "BASE 1500mm/TOP 6000mm" on the SX-101 board in `IMG_0412`), while the live machine parameter (GH4, per briefing) caps at 3488 rpm high gear. The spindle motor's own nameplate (`IMG_2065`) lists motor-shaft speeds of 1500/4500/6000 rpm across its winding taps — none of which is 3488. This conflict is unresolved and needs a schematic/parameter cross-check before committing to a spindle scaling factor.
3. **A genuine OEM wiring-diagram scan (`TERMINAL_UNIT_DETAIL_P085`) surfaced** — "DETAILS OF TERMINAL UNIT CONNECTION (2)," VQC-20/40,50, dwg 4143075022, sheet 3 — giving authoritative pin-level signal names for CN6, CN5, CN11 (SSR board), and CN200 (MMS receiver), including `ORCM1` (orient command), `SFR/SRV/SMR` (spindle run/direction), and the two gear-shift lines `712 GEAR SHIFT HIGH` / `713 GEAR SHIFT LOW`. This single document is worth more than most of the hardware photos combined for signal mapping.
4. **The 24 V control-power chain is now fully traceable end-to-end**: Nissyo Kogyo 22.8 kVA transformer (`IMG_1C462D22...`) → AC100A/AC100B/N/P and AX/BX/G1X/G2X (and AY/BY/G1Y/G2Y) terminal strips (`IMG_2077`–`IMG_2083`) → Nemic-Lambda HR-11F 24V/5A DC supply (`IMG_2085`, `IMG_2086`) → TB2 distribution (G/P24/G24/16/15) (`IMG_0390`, `IMG_0896`, `IMG_2088`).
5. **The Y-axis linear-scale/Magnescale question is still NOT answered.** No photo in any batch shows a Magnescale, Sony, or Mitutoyo linear scale nameplate or mounting on the Y axis. All feedback-device photos identify Tamagawa resolver "pickup units" only (`IMG_0075`, `IMG_0076`, `IMG_2064`) with no linear-scale nameplate captured anywhere — this remains an open re-shoot target.

---

## Hardware inventory recovered from nameplates

| Device | Model / part no. | Serial / other data | Photo IDs | Confidence |
|---|---|---|---|---|
| Machine dataplate | Mazak VQC 20 (reads "V?C 20 403", worn) | MFG NO. 60231, MFG DATE 6/85, Mazak Corp., Florence KY, NMTBA member | IMG_0434 | High (matches project SN 060231) |
| Machine badge (repeated) | MAZAK Vertical Quality Center VQC-20/40B | — | IMG_0480, IMG_0486, IMG_0548 | High |
| CNC control unit nameplate | MELDAS-M2 | DATE 84 05, SERIAL 172, Mitsubishi Electric Corp. Japan | IMG_0823 | High (a few digits worn) |
| Tamagawa resolver "Pickup Unit" (axis 1) | TYPE RT-☐X☐-☐☐ (boxes illegible), SPEC NO. BK0-NC6062A, PARTS NO. TS2014N☐ | SER NO./DATE not legible; stamped code "N6398" | IMG_0075, IMG_0076 | High on SPEC/PARTS NO.; TYPE suffix unresolved |
| Tamagawa resolver "Pickup Unit" (axis 2, darker housing) | Same family, values cropped off-frame | — | IMG_0077 | Confirmed family only |
| Tamagawa resolver "Pickup Unit" (axis 3) | SPEC NO. BKO-NC6062A, PARTS NO. TS2014N☐E☐-☐ | SER NO. illegible; DATE ".198_"; "N5399" printed on plate | IMG_2064 | High on spec no.; parts-no. suffix and date uncertain |
| Mitsubishi FR-SX spindle drive (door) | FREQROL, AC SPINDLE CONTROLLER model FR-SX | Rating plate partial "FR-SX-...", "BO" — not legible | IMG_0078, IMG_0079, IMG_0286 | High on model; rating plate unread |
| FR-SX parts arrangement diagram (internal plate) | MODEL FR-SX-2-☐☐K AC SPINDLE CONTROLLER | Plate no. "BN993C395" (partial, glare); ratings table 3.7–22 kW | IMG_0297 | High |
| FR-SX drive — confirmed variant | **FR-SX-2-5.5K** (5.5 kW) | Chassis tag "FR-S...5.5K"; per ratings table, 5.5 kW = 40 A output | IMG_0300 (chassis tag), IMG_0297 (ratings table) | High |
| SX-CPU2 board (spindle CPU) | SX-CPU2, part no. **BD625A552H04** | "MADE IN JAPAN"; also seen as "BD625A552H01" (uncertain read) in IMG_0408 | IMG_0292, IMG_0294, IMG_0406, IMG_0407, IMG_0408 (conflicting) | High on BD625A552H04; IMG_0408's "H01" reading flagged as likely misread of H04 |
| SX-CPU2 sticker | BASE 1500 RPM / TOP 6000 RPM | — | IMG_0407 | Medium-high (clear text, but see Contradictions §) |
| SX-101 board (servo/spindle amp) | SX-101, part no. **BD625A553H07** | 5× SD-111APS output modules; TB2 wires "WD"/"LM1" | IMG_0410, IMG_0411 | High |
| SX-101 hand annotation | "BASE 1500mm / TOP 6000mm" (hand-written near board) | Units almost certainly rpm, not mm — likely transcription/annotation error | IMG_0412 | Low-medium (small, approximate reading) |
| Mitsubishi RC3A relay board | RC3A, **BN624A375-A** | "現況" (current status) tag; 3 rows of relay function labels | IMG_0305, IMG_0362–0367 | High |
| Diode/opto board | **03-81579-02 –COM** | Connector CN11; wire numbers 408A/B, 410D, 412, 413, 416, 417, 421, 431, 435, 461, 462 | IMG_0306, IMG_0310, IMG_0311, IMG_0367 | High |
| Interconnect/backplane board ("master I/O board") | **BB1B / BN624A306H01**, silkscreen "M VQC-20-40/50" / "YM VQC-20-40/50" (batches disagree on "M" vs "YM" prefix — see Contradictions) | TB11: +24V (×3), 0G (×2) | IMG_0357, IMG_0358, IMG_0359, IMG_0821, IMG_0822 | High on part no.; prefix letter uncertain |
| MELDAS servo control module — X axis | **MELDAS DK-427 / BKO-NC2017** (also read "BK0-NC2017") | Serial **N444884** | IMG_0373, IMG_0374, IMG_0375, IMG_0379, IMG_0378, IMG_0379 | High |
| MELDAS servo control module — Y axis | MELDAS DK-427 / BKO-NC2017 | Serial **N434884** (also mis-read once as "N424884" in IMG_0376 — flagged there as likely the same unit) | IMG_0375, IMG_0376, IMG_0379 | High serial per IMG_0379's sharp read; IMG_0376 conflict noted |
| MELDAS servo control module — Z axis | MELDAS DK-427 / BKO-NC2017 | Serial **N444023** (also read "N444923"/"N44?923" in IMG_0375/IMG_0378 — same unit, digit ambiguity) | IMG_0375, IMG_0376, IMG_0377, IMG_0378 | High on part no.; last-digit serial ambiguity flagged |
| MELDAS custom IC (X-axis card, additional) | MELDAS DK-8218, MC-52988K44 | — | IMG_0379 | Medium (single read) |
| Servo card board silkscreen | BN624A193K (Z-card, IMG_0375) vs BN624A393K (X/Y-card, IMG_0379) | — | IMG_0375, IMG_0379 | Low — explicit unresolved conflict, may be different card revisions |
| Per-axis "TRA" transformer — X | TRA 31 | Serial **10536** | IMG_0370, IMG_0372, IMG_0374, IMG_0378 (labeled "TRA41" in some frames — see Contradictions) | High |
| Per-axis "TRA" transformer — Y | TRA (no visible prefix number) | Serial reads "076" or "L?7...076" (low confidence) | IMG_0369, IMG_0372 | Low-medium — digits uncertain |
| Per-axis "TRA" transformer — Z | TRA | Serial "~9760" (partial, obscured by wires) | IMG_0368 | Low — mostly obscured |
| Large servo power transformer/choke | **BK0-NC6073** (also "BKO-NC6073") | Serial "N.424867" (also read "N.42?867"/"N.4?4867") | IMG_0374, IMG_0378, IMG_0382, IMG_0383 | High on part no.; serial digits uncertain |
| AC spindle motor | Mitsubishi AC SPINDLE MOTOR, TYPE **SE-EV-FV** (suffix uncertain) | 4-pole; kW 3.7/3.7/2.2/5.5/5.5/3.7; V 150/170/170/150/170/170; A 26/20/13/39/29/21; **RPM 1500/4500/6000/1500/4500/6000**; SERIAL D9140002_0 (last digit unclear); part no. 995196-03; Klixon thermal protector 9700L-246-215 (open 150°C / close 99°C) | IMG_2065 | High on ratings table; TYPE suffix and serial last digit uncertain |
| DC servo motor — Y axis | Mitsubishi DC SERVO MOTOR PERMANENT MAGNET, TYPE **HD 81-12S** | MFG DWG Z636437; SERIAL N250082-52 | IMG_2066 | High |
| DC servo motor — X axis | Mitsubishi DC SERVO MOTOR PERMANENT MAGNET, TYPE **HD 101-12** | MFG DWG Z636438; SERIAL N250049-24 (last digits uncertain, glare) | IMG_2067 | High on type; serial suffix uncertain |
| DC servo motor — Z axis | Mitsubishi diamond-logo end cap only; nameplate not legible | — | IMG_0068 (unread) — actually IMG_2068 | Low — no data recovered, needs re-shoot |
| Main power transformer | Nissyo Kogyo, **TR-YU**, 3-phase **22.8 kVA**, SPEC.NO. BKO-NC6092-10 | S.NO. **46757**, DATE APR/1984; primary taps XA/XB; secondary lugs E/T1/S1/R1/T0/S0/R0 | IMG_1C462D22-8E42-4922-B5EF-25BC9BEDCA7B | High |
| Transformer tap board (2nd unit or same, cabinet-mounted) | "TRANSFORMER" nameplate, rating "123K?" (unresolved) | R/S/T primary, R1/S1/T1/Ro/So/To secondary taps | IMG_2073 | Low-medium on rating; terminal names high confidence |
| Transformer voltage-tap chart (laminated tag) | 200/220/230/240/380/415/440/460/480 V input jumper table (terminals 1–12) | "MADE IN JAPAN" | IMG_4A69107E | High |
| Transformer winding schematic (hand/printed diagram) | Windings R0/S0/T0, R1/S1/T1 (210V), R2/S2/T2 (180V/34V, 180V/149V, 180V/149V), 100V/XA/XB 3∅ 6V, control xfmr "CHT1/CHT2" (or "OHT1/OHT2") ~115V/100V | — | IMG_D9F63BE2 | High (complements IMG_4A69107E) |
| 24VDC power supply | Nemic-Lambda **HR-11F**, output 24V/5A DC | Input 100–120VAC, 50/60Hz, 3.7A; terminals +S/P24/G24/TOG/CNT/FG/15/16; assembled in Malaysia | IMG_0390, IMG_0391, IMG_2084, IMG_2085, IMG_2086, IMG_2088 | High |
| Control power/converter module | Part tag **403199-019** | "AC IN H/N, FG, AC OUT 100V H/N, 5A" | IMG_0824, IMG_0906, IMG_0E06D3AD..., IMG_0573, IMG_D32A2441 | High |
| No-fuse breaker (spindle drive area) | Mitsubishi **NF30-SW**, 30A | — | IMG_0282 | High |
| No-fuse breaker (2nd unit) | Mitsubishi **NF30-SB**, 30A, 3-pole | Mfg code C8403; catalog LN312N723-12 | IMG_0389 | High |
| No-fuse breaker (main incoming, spindle) | Mitsubishi **NF50-CB**, 50A, 460V AC | Mfg code C8404 | IMG_0295, IMG_0300 | High |
| Motor breaker | Mitsubishi "MOTOR BREAKER" ~**NV30-C4**-style | ~7.1A (partial) | IMG_0393 | Medium — model partly obscured |
| Magnetic contactors (×3+, R21/S21/T21 bus) | Mitsubishi **MAGNETIC CONTACTOR Type S-A12** | Rating table 220V/2.2kW/9-12A, 440V/2.2kW/5.5-6A (partial); feeds U31/V31/W31, U44/V44/W44, U21/V21/W21, U11/V11/W11 branches | IMG_0393, IMG_2091, IMG_2092, IMG_2093, IMG_2094, IMG_2095 | High on type; exact rating rows partly unresolved |
| Relay board TR-15A / TR-16A (spindle drive protection) | **TR-15A BN624B055D** (IMG_0282) vs "TR-16A BN0Z4B055D" (IMG_0080) — batches disagree on TR-15A vs TR-16A and the suffix code | 2× SW1D-H1 thermal/solid-state relay modules, DC3-24V | IMG_0080, IMG_0282, IMG_0287 | Conflicting — flagged explicitly, see Contradictions |
| Voltage relay | Mitsubishi "VOLTAGE RELAY", model ends "...4133NW" (obscured by glare) | Wire tags 131, 10A | IMG_0400 | Low — model not fully legible |
| Interposing relay | OMRON **MY2A-432A** (partially obscured) | Wire tags 60, P24, G24, 16 | IMG_0399 | Medium |
| Suppressor/snubber module | **3CRH-30330** | Adjacent to U11/V11/W11 branch | IMG_2095 | Medium |
| TDK noise filter | TDK NOISE FILTER, model **ZMB2302-11** (ambiguous chars) | "KK8407 JAPAN" lot code | IMG_0298 | Low-medium |
| Pilot lamp | Mitsubishi Electric, TYPE PB, LAMP 6.3V | Wire tags G24/F24 | IMG_0308 | High |
| Mitsubishi FX17C I/O expansion board | **FX17C**, part no. **BN62A9328H01** | Ribbon headers P196B30P-1 (×2); connectors CNI1/CNI2 | IMG_0424, IMG_0426 | High |
| Mitsubishi comms/serial interface board | Part no. **BN624A328H01** | Dual 8251 UART, 8255 PPI, 8253 timer; connectors CNi1 (DB25)/CNi2 (50-pin) | IMG_0427, IMG_0428, IMG_0429, IMG_0430 | High |
| FB-V1 feedback board (probable resolver interface) | Board tag "FB-V1" | Connectors CON1 (Honda MR-50W, 50-pin), CONAA (Honda MR-20W, pins 20/14), CON2 (Honda MR-20L) | IMG_0401, IMG_0402, IMG_0403, IMG_0405 | High |
| CPU logic card (Mazatrol) | ICs M5L8284AP (8284A clock gen.), SN74LS32N | Switch "7105 C&K HONG KONG"; label "ST1" | IMG_0355, IMG_0356 | Medium |
| Hydraulic power unit pump | NACHI piston pump (brand only; spec plate unresolved) | Pressure gauge 0–2000+ psi | IMG_2071, IMG_2072 | Low — model/spec not legible |
| ATC hydraulic/cooling pack | Unlabeled, "...TYPE 100H..." partial | — | IMG_2072 | Low |
| Relay modules (servo cards) | SRP-1024, OKITA brand, DC24V | Various tags RLY2/RLY3/RLY4, x401 | IMG_0368, IMG_0369, IMG_0370, IMG_0379, IMG_0380, IMG_0381 | High |
| Card-cage power supply | Gold PSU chassis, tag **403199-019** | AC IN L/N/FG; AC OUT 100V S/4 | IMG_0361, IMG_0824, IMG_0906 | High |

---

## Wire labels and terminal maps

### TB2 — 24 V distribution / SOC1 ground block
- Stamped **"TB2"**, 8 numbered screw terminals; wires machine-labeled **"SOC1"** (×2, red) and ground **"G"** (yellow, printed heat-shrink) — `IMG_0258`.
- Same TB2/SOC1 block, terminal 8 = **G**, terminal 9 = twisted pair **SOC1**/**SOC1**, terminals 1–4 unlabeled blue ring wires — `IMG_D67A9176`.
- Same block again, terminals 1–4 numbered paper tags "1"/"2", ground "G" and "SOC1"/"SOC1" near terminal 8 — `IMG_0889`, `IMG_0890`, `IMG_0895`.
- Sharpest full TB2 reading (different location, HR-11F-fed TB2): terminal 1=**G**, 2=**XA1**, 3=**XB**, 4=**SG**, 5=**AC100**, 6=**AC100**; terminals 7–10 unused; stamped "B2" visible — `IMG_0896`.
- TB2 (HR-11F output side): top row **G, P24, G24 | 16, 15**; bottom row wire labels **FG, P24, G24 | 16, 15** — `IMG_2084`, `IMG_2088`, `IMG_0390`, `IMG_0391`.
- **Note:** there appear to be at least two distinct "TB2" blocks in the cabinet (one near the SOC1/ground wires by the Mazatrol card cage, one at the HR-11F 24V supply) — same OEM label reused per enclosure, do not conflate them.

### X-axis / Y-axis servo card terminal strips (AC100/resolver commons)
- X-axis: **AX, AX, BX, G1X, G2X, AC100A, AC100B, N, P** — `IMG_0387`, `IMG_2077`, `IMG_2078`, `IMG_2079`, `IMG_2082`.
- Y-axis (mirrors X): **AY, BY, G1Y, G2Y, AC100A, AC100B, N, P** — `IMG_2080`, `IMG_2081`, `IMG_2083`.
- Related terminal strip: **XA1, XB, AC100A, AC100B** adjacent to HR-11F supply — `IMG_0391`, `IMG_2084`, `IMG_2088`.
- SX-101 (spindle amp) TB2: wires **"WD"** and **"LM1"** — `IMG_0410`, `IMG_0411`.
- SX-101 board legend: schematic callout "CON104 B A", pins 1,4,7,10,12,15 — `IMG_0411`.
- FR-SX drive internal relay/terminal strip: **P, N, AC100B, AC100A, G2X, G1X, BX, XX(or AX)** — `IMG_0287` (this is likely the drive-side counterpart of the X-axis strip above — cross-check for consistency; note this reading orders G2X before G1X while IMG_0387/2077 list G1X before G2X).
- FR-SX incoming power: **X1, X2, X3** (heat-shrink tags X1/X3 legible, X2 tag color-only) — `IMG_0299`.
- FR-SX motor output (U/V/W): tagged **SU, SV, SW** — `IMG_0300`.
- FR-SX TB51 board: "MS?"/"MS2" contactor coil terminals, connector "CON5", partial part no. "...B554H02" — `IMG_0300`.

### AC input terminal block (unidentified enclosure)
- Tags **N**, **FG**, third tag obscured (possibly L/1) — `IMG_0252`.
- Tags **AC** (×2, stacked) — `IMG_0253`.
- Panel stamped "AC" / "IN" — `IMG_0251`.

### Card-cage / Mazatrol I/O rack numbered wires (near green PCB, "A B C" edge connectors)
- Tags **"1", "2", "3"** — `IMG_0254`.
- Tags **"1", "2", "N"**; PCB edge connectors numbered 5/10/15/20/25/30 — `IMG_0255`.
- Tags **"A", "AC"** — `IMG_0256`.
- Tag **"N"** reinforced, sequence 1/2/3/N/A/AC/FG established across this cluster — `IMG_0257`.

### 03-81579-02 diode/opto board (wire-numbered field I/O)
- Terminal row **COM, 34, 36, 38, 40, 42, 44, 46, 48, NC**; wire tags **408A/408B, 410D, 412, 413, 416, 417, 421, 431, 435, 461, 462**, plus "15", "36" — `IMG_0306`, `IMG_0310`, `IMG_0311` (sharpest single read).
- Same board family, second unit, connector CN11 — `IMG_0362`, `IMG_0367`.

### RC3A relay board (BN624A375-A) — full I/O function labels
Row 1: **MGTD, TCME, HLP, CTL, OTR, PYOT, NZOT, ORC**
Row 2: **Y-M45T, S2S, SMR, EMS, MAR, SPTO, SFD, SRV**
Row 3: **Y-M43T, Y-M44T, WLT, RA1, RA2, WLWT, MOINT, MOINT2, A POFT**
Additional labels seen in one frame only: **TG, SE, PT** — `IMG_0365`.
Sources: `IMG_0305`, `IMG_0362`–`IMG_0367` (IMG_0366 is the best single-frame master reference). A hand-written note (partially illegible, "Ave..." or similar) appears above the board in `IMG_0365`.

### BN624A306H01 interconnect/I/O distribution board ("VQC-20-40/50" board)
Full connector roster: **CND1, CND2, CND3, CND4, CND5, CND10 (or "A10"), CND23, CN1, CN2, CN3, CN4, CN5, CN6, CN7, CN8, CN11, CN12, CN200, CNA10, TB11**. TB11 terminals: **+24V (×3), 0G (×2)**. Board ID "BB1B", Mitsubishi logo, "MADE IN JAPAN". Silkscreen reads either **"M VQC-20-40/50"** (`IMG_0357`, `IMG_0358`) or **"YM VQC-20-40/50"** (`IMG_0821`, `IMG_0822`) — flagged as a conflicting read, see Contradictions. Separate +24V terminal block seen on a second physical unit in `IMG_0822` with nearby plate "EYM VQC-20-40/50" (yet another prefix variant).

### Card-cage FX slots (Mazatrol M-2 backplane)
Consolidated slot roster across all sightings: **FX01, FX06, FX15, FX17, FX25, FX27, FX31, FX53(1), FX63, FX73, FX84, FX84-1**.
- First full reading: FX17, FX06, FX31, FX01, FX84(A), FX27, FX84-1(B), FX15, FX25, FX53(1), FX63, FX73 — `IMG_0361` (bench shot, most complete single frame).
- Confirmations/partial rosters: `IMG_0573`, `IMG_0824`, `IMG_0825`, `IMG_0883`, `IMG_0884`, `IMG_0892`, `IMG_0904`, `IMG_0905`, `IMG_0906` (best overall), `IMG_D32A2441`, `IMG_EFA09638`, `IMG_FA2798D0`.
- Card/board-level tags on these slots: **CN1/CN2** (leftmost card), **CNA3/CNA4/CNA5/CNA6**, **FB1/DV1**, **FB2/DV2**, **FB3/DV3**, **MCUAL**, **WDAL**, **CON1**, **PE1/PE2**, **J1/J2/J3**, **GPP**, **AL/IT/BA/RDY** (status LEDs), **MCN1**, **SCN1**, **CNA1**, **CNA2**, **CNA10**, **CND1/CND2/CND3/CND5**, **CNI1/CNI2**, **"27-J1"**, **VR2–VR6** (trim pots) — consolidated from `IMG_0361`, `IMG_0883`, `IMG_0891` (LOCAL BUS backplane), `IMG_0893`, `IMG_0894`, `IMG_0905`, `IMG_0906`, `IMG_1F37A79E` (Honda MR-20W connector shells on CND5/CND1), `IMG_EFA09638`.
- Card-cage bottom terminal blocks: **TB1** (10 positions) and **TB2** (10 positions) — `IMG_0361`. A separate "T182" terminal strip designation also appears near the rack — `IMG_0825`, `IMG_0904`.
- Card-cage PSU: gold module tag **403199-019**, "AC IN L/N/FG", "AC OUT 100V S/4 (5A)" — `IMG_0361`, `IMG_0824`, `IMG_0906`, `IMG_0E06D3AD` (full stencil close-up).

### CN-series loose connectors (cabinet floor, disconnected harness)
- **CN1** alone — `IMG_0262`; **CN1 + CN4** paired — `IMG_0263`, `IMG_0264`.
- **CN2, CN3, CN5, CN6** clustered — `IMG_0265`, `IMG_0266`, `IMG_0267`.
- **CNA4, CNA5** (Honda brand) — `IMG_0271`, `IMG_0272`.
- **CNA10, CNA1**, and **"31CAM"** (see spindle-orient section below), plus a cable tag read as "CN9" or "CF9" (uncertain) — `IMG_0273`, `IMG_0274`.
- **CNA10** alone, mirrored label — `IMG_0277`.
- Generic Honda 24-pin/50-pin connectors, molded numbers "14"/"50" (uncertain pin-count reference) — `IMG_0275`, `IMG_0276`.
- Partial "MR-20W" Honda connector — `IMG_0278`.

### SX-CPU2 board connectors (spindle CPU)
**CON1** (Honda MR-20L, also once read as "MR-50W" — flagged conflict), **CONAA** (Honda MR-20W, pins 20/14), **CON2** (Honda MR-20L) — `IMG_0291`, `IMG_0292`, `IMG_0293` (clearest), `IMG_0302` (conflicting CON1 size read), `IMG_0294` (board section tags AS-1/AS-2/AS-3), `IMG_0401`. Live connector "CON105" also seen on the parts-arrangement plate — `IMG_0297`. Board also carries connectors CON101/102/103 per `IMG_0406`, and CON102/CON103 diode arrays per `IMG_0407`. CON31 pins A/B also visible — `IMG_0407`.

### FB-V1 feedback board (probable resolver/feedback interface)
Board tag **"FB-V1"**; connectors **CON1** (Honda MR-50W, 50-pin, pin index "33" marked), **CONAA** (Honda MR-20W, pins 20/14), **CON2** (Honda MR-20L) — `IMG_0401`, `IMG_0402`, `IMG_0403`, `IMG_0405` (all three connectors in one frame — best reference). In-line terminal block signal names near CON1/CON2: **ZSO, USO, VRO, CDO** (uncertain read, upside down) — `IMG_0404`. Small 5-pin terminal block nearby with partial tags "LM_" — `IMG_0405`.

### Motor/contactor branch wire numbers (auxiliary motors — coolant/hydraulic/lube pumps)
All fed from common **R21/S21/T21** bus through Mitsubishi S-A12 contactors, four distinct output branches identified:
- **U31, V31, W31** — `IMG_0393`, `IMG_2091`.
- **U44, V44, W44** — `IMG_0393`, `IMG_2092`, `IMG_2093`.
- **U21, V21, W21** — `IMG_0393`, `IMG_2094`.
- **U11, V11, W11** — `IMG_0398`, `IMG_2095`.
- Additional related tags: **U2, V4, W6**; wire tags **131, 121, 111**; cabinet zone labels **"3S-1", "3S-2", "3S-3", "3S-4"** — `IMG_0398`, `IMG_2091`, `IMG_2094`, `IMG_2095`.
- Relay bank feeding these contactors: **ABRK, PRTP, THR, OHT** labels, wire numbers **60, P24, +24 (×3), 144, 146** — `IMG_0399`, `IMG_2090`, `IMG_2096`.

### Large numbered terminal strip (near grey OEM board, gear/deceleration signals)
- Numeric wire tags: **410, 400, 162, 161, 160, 131(×2), 130, 36, 35, 34, 21, 26, 25, 16(×3), G, 15** — `IMG_0394`.
- Continuation: **16 (multiple), 15 (multiple), XB, XB, XA1, XA1, 16, 10, XB, XA, 12, 12** — `IMG_0395`.
- Named-signal section: **59, INHRLS, DEC2 (or DCC2), 152, 151, +24V, 146, 144, 0G, 58, 57B, 57A** — `IMG_0396`.
- Further named signals: **57, 60, EXB, MAP, P24 (×2), G24 (×3), RST, CH4, CH2, FWD (partial), RGTLS, ISP1, SP2/OSP1/OSP2 (partial), OUT1, 420, 410, 400, 162, 161, 160, 131, 130, 36, 35, 34, 21, 26, 25** — `IMG_0397`.
- **INHRLS**, **RGTLS**, **OSP1/OSP2**, **CH4/CH2** are exactly the signal-name family independently confirmed in the OEM drawing scan `TERMINAL_UNIT_DETAIL_P085` (INHRLS = "INHIBIT READ LS", OSP1/OSP2 = "OUTPUT STEAR 1/2") — strong cross-batch corroboration.

### TERMINAL_UNIT_DETAIL_P085 (OEM manual scan — "DETAILS OF TERMINAL UNIT CONNECTION (2)", dwg 4143075022, sheet 3)
Full pin tables recovered for four connectors — this is the authoritative source; other terminal-strip photos should be cross-checked against it:
- **CN6** (inside CNB/CN2/CN4, outside CN301A): 24 named signals including `SA` (SERVO READY), `SSET` (SPINDLE SET), `CTL` (LOW GEAR SELECT), `OTR` (OVER TRAVEL RELEASE), `ZS1` (SPINDLE ZERO SPEED), `SFR`/`SRV`/`SMR` (spindle forward/reverse/run), `ORCM1` (ORIENT COMMAND), `TCME` (TOOL CHANGE MEMORY), `381` (MAGAZINE TOOL DETECTOR), `382` (SPINDLE TCC DETECTOR).
- **CN5** (outside = TB1): `144` (THERMAL PROTECTOR TRIP), `RST` (RESET OUT), `146` (MAIN TRANSF. OVER HEAT), `EMB`/`EMC` (EMERGENCY STOP), `G24`, `INHRLS` (INHIBIT READ LS), `ISP1`/`ISP2`, `OSP1`/`OSP2` (OUTPUT STEAR 1/2), `XDEC4` (4-axis zero return dec.).
- **CN11 (SSR BOARD)**: `708A/708B` (MAGAZINE CCW/CW), `710` (TOOL UNCLAMP), **`712` GEAR SHIFT HIGH**, **`713` GEAR SHIFT LOW**, `715`/`716` (spindle/work air blast), `717`/`731` (mist/flood coolant), `727` (magazine cover close), `735` (dust inhale eliminate), `835` (hydr. pump/head lube pump).
- **CN200 (MMS RECEIVER)**: `MMS RDY`, `SEN RDY`, `MMS SKIP`, `MMS ST`, `MMS PON`, `MMS STCMD`.
- Connector part numbers: **terminal side MR-50RMW / MR-20RMW**, **cable side MR-50LF / MR-20LF**.
- Source: [TERMINAL_UNIT_DETAIL_P085].

---

## Open questions this batch answers

**(a) Does the Y axis have a linear scale / Magnescale?**
**Not resolved.** No photo across any batch shows a Magnescale, Sony, or Mitutoyo linear-scale nameplate or mounting bracket anywhere on the machine. All Y-axis feedback hardware documented is Tamagawa resolver "pickup unit" family (`IMG_0075`, `IMG_0076`, `IMG_2064`), consistent with resolver-only feedback, but no photo explicitly rules out an additional linear scale (e.g., mounted along the Y-axis way, out of frame in all captured shots). This remains open — see Re-shoot list.

**(b) Exact servo motor and servo amplifier models per axis; are the amps salvageable?**
**Resolved for motors, largely resolved for amplifiers.**
- Motors: X = Mitsubishi **HD 101-12** (serial N250049-24, uncertain last digits) (`IMG_2067`); Y = Mitsubishi **HD 81-12S** (serial N250082-52) (`IMG_2066`); Z motor nameplate not legible, only the diamond logo end cap confirmed (`IMG_2068`) — Z motor type remains unconfirmed.
- Amplifiers: all three axes use **Mitsubishi MELDAS DK-427 (BKO-NC2017)** analog servo cards, individually serialized X `N444884`, Y `N434884`, Z `N444023` (`IMG_0373`–`IMG_0379`), each paired with a dedicated "TRA" transformer and a `BK0-NC6073` power transformer/choke.
- Salvageability itself is not directly answered by any photo — no test/calibration data, failure indication, or spares status is shown. The presence of a Fluke multimeter mid-diagnostic in `IMG_0378` suggests active continuity/voltage checks were underway, but results aren't captured. Treat salvageability as **still open** pending bench testing; the photos only supply the part numbers needed to research compatibility/spares.

**(c) Spindle motor + drive model/rating and the rpm-ceiling conflict.**
**Partially resolved — and the conflict is real, not resolved.**
- Motor: Mitsubishi AC spindle motor, TYPE SE-EV-FV (suffix uncertain), 4-pole, multi-tap ratings up to 5.5 kW, with **motor-shaft speeds of 1500/4500/6000 rpm** across its winding taps (`IMG_2065`).
- Drive: Mitsubishi FREQROL **FR-SX-2-5.5K** (5.5 kW variant, 40 A output per the ratings table) (`IMG_0297`, `IMG_0300`).
- The **BASE 1500 RPM / TOP 6000 RPM** sticker on the SX-CPU2 board (`IMG_0407`) is confirmed legible and matches the task's description of an "SX-CPU2 sticker." A separate hand annotation near the SX-101 board reads "BASE 1500mm/TOP 6000mm" (`IMG_0412`) — almost certainly the same rpm figures mis-transcribed with "mm" instead of "rpm," not independent corroboration.
- This 1500/6000 figure is **motor-shaft speed**, not gearbox output speed — it does not by itself contradict the gearbox's 434 rpm crossover or 3488 rpm high-gear ceiling (GH4), since a gear ratio would separate motor rpm from spindle rpm. However, no photo captures the actual gear ratio, so **the conflict between "TOP 6000 RPM" and "GH4 = 3488 max" cannot be resolved from these photos alone** — it requires either the FR-SX drive's own parameter sheet or the gear ratio spec. This should be flagged as unresolved and cross-checked against Mitsubishi FR-SX documentation as batch 03's findings explicitly recommend.

**(d) Resolver model and mounting.**
**Resolved (model); partially resolved (mounting).** Tamagawa Seiki "PICKUP UNIT," type RT-☐X☐-☐☐ (fill-in characters not legible on any copy), SPEC NO. **BK0-NC6062A**, PARTS NO. **TS2014N☐** (final suffix character(s) not legible on any copy) (`IMG_0075`, `IMG_0076`, `IMG_2064`). Mounting is shown as bolted into a blue cast bracket riding on the ballscrew end / machine casting recess, with flex coupling visible (`IMG_0076`), but exact connector/pinout at the resolver end is not captured — only the downstream FB-V1 board connectors (CON1/CONAA/CON2) are documented.

**(e) ATC magazine pot count.**
**Partially resolved.** Individual pot numbers photographed include 1, 2, 5–13, 24–30 (`IMG_2069`, `IMG_2070`), confirming a magazine of **at least 30 pockets**, but no single photo captures the full ring with an unambiguous total count or a magazine-capacity nameplate. Treat 30 as a floor, not a confirmed total.

**(f) Gear-select and gear-confirm wiring (PRS-10 / PRS-12).**
**Partially resolved — strong candidate signals identified, but PRS-10/PRS-12 themselves are never directly labeled in any photo.**
- The OEM drawing scan gives **`712` GEAR SHIFT HIGH** and **`713` GEAR SHIFT LOW** on CN11 (SSR board) — [TERMINAL_UNIT_DETAIL_P085].
- The RC3A relay board's **`HLP`** label (row 1) is speculated in the source findings to mean "high/low gear pilot" — unconfirmed guess, not a verified match (`IMG_0363`).
- **`G1X`/`G2X`** wire labels on the FR-SX relay terminal strip are flagged by batch 01 as "very likely the two spindle gear-select relay outputs," but this is an inference, not a confirmed label match — note the "G1X/G2X" naming pattern (also seen on X/Y axis servo terminal strips as G1X/G2X and G1Y/G2Y) more plausibly ties to resolver/feedback grounds given its co-location with AX/BX signals, creating ambiguity about whether G1X/G2X is gear-related at all (`IMG_0287` vs. `IMG_0387`/`IMG_2077`).
- **`RGTLS`** (likely "range gear limit switch") and **`CH4`/`CH2`** on the large numbered terminal strip are also candidates (`IMG_0397`).
- No photo shows a switch or connector explicitly labeled "PRS-10" or "PRS-12." This should be treated as an open item requiring ladder-program (YM2V39L) cross-reference against line numbers 712/713.

**(g) Spindle orient hardware and the "31CAM" lead.**
**Partially resolved.** A connector labeled **"31CAM"** (possibly "3ICAM") was photographed among the CNA-series loose connectors, alongside CNA1/CNA10 (`IMG_0273`, `IMG_0274`) — flagged by the source batch as a likely spindle-orient/cam-switch lead, but this is speculative; no schematic or label confirms "31CAM" = spindle orient. The OEM drawing scan confirms an **`ORCM1` ORIENT COMMAND** signal on CN6 pin 30 and an **`SPTO`** label on the RC3A board (row 2, "spindle orient?" — also speculative) (`IMG_0363`, [TERMINAL_UNIT_DETAIL_P085]). The FR-SX drive's front-door LED legend includes an "ORIENTATION (OPTION)" grid (`IMG_0078`, `IMG_0286`) and the SX-CPU2 board LED legend includes "ORFM"/"ORFIN" (orientation-related) (`IMG_0294`, `IMG_0407`) — confirms orient logic exists in the drive but no physical orient sensor (cam switch, proximity switch) hardware was photographed directly.

**(h) 24 V control power source and distribution.**
**Resolved, end-to-end.** Nissyo Kogyo 22.8 kVA transformer (`IMG_1C462D22...`) feeds AC100/control-voltage terminal strips (AX/BX/G1X/G2X/AC100A/AC100B/N/P and AY/BY equivalents) (`IMG_2077`–`IMG_2083`), which feed a Nemic-Lambda **HR-11F 24V/5A DC** power supply (`IMG_2085`, `IMG_2086`), distributed via **TB2** (G/P24/G24/16/15) (`IMG_0390`, `IMG_2084`, `IMG_2088`) to relay banks and pilot lamps (G24/F24/P24 tags, `IMG_0308`, `IMG_0367`). A second, separate internal 100VAC/5A supply module (tag 403199-019) powers the Mazatrol card cage itself (`IMG_0824`, `IMG_0906`, `IMG_0E06D3AD`) — do not conflate this with the HR-11F 24VDC supply; they are different devices at different points in the chain.

**(i) Were any DIAGNOSIS or MACH CONSTANT PAR NO.1/NO.3 CRT screens captured?**
**Not resolved — none found.** No photo in any of the eight batches shows MACH CONSTANT PAR NO.1, MACH CONSTANT PAR NO.3, or a DIAGNOSIS/I/O-monitor screen. The only CRT screens captured are: **3-D EIA/ISO PARAMETER** (already known per briefing) (`IMG_0014`); **MACH CONSTANT PAR NO.2** (already known per briefing, seen repeatedly: `IMG_0546`, `IMG_0551`, `IMG_2B241C5B`, `IMG_AD51E0EA`); a live alarm **"20 NM1 EMERGENCY STOP"** overlaid on the PAR NO.2 screen (`IMG_0551`); and a live position/load-monitor screen showing WORK NO./POSITION/MACHINE/DRUM NO./LOAD METER fields (`IMG_0552`) — this last one is new operational data (not one of the three "already transcribed" screens) but is not a DIAGNOSIS or PAR NO.1/NO.3 page. **MACH CONSTANT PAR NO.1, PAR NO.3, and any DIAGNOSIS/I/O-monitor screen remain un-photographed** — high-priority re-shoot target.

---

## Contradictions, uncertainties, and low-confidence reads

- **BN624A306H01 board silkscreen prefix conflict:** read as "**M** VQC-20-40/50" in `IMG_0357`/`IMG_0358`, but as "**YM** VQC-20-40/50" in `IMG_0821`, and as "**EYM** VQC-20-40/50" (different physical unit) in `IMG_0822`. These may be different boards/plates or the same text misread across batches — not resolved.
- **TR-15A vs TR-16A relay board:** batch 00 reads the spindle-drive protection board as "**TR-16A BN0Z4B055D**" (`IMG_0080`), while batch 01 reads the same class of board as "**TR-15A BN624B055D**" (`IMG_0282`, `IMG_0287`). Both the model number ("15A" vs "16A") and the part-number prefix ("BN0Z4B055D" vs "BN624B055D") disagree. Not resolved — could be two different boards or one misread.
- **G1X/G2X ordering:** `IMG_0287` (FR-SX internal terminal strip) reads the sequence as P, N, AC100B, AC100A, **G2X, G1X**, BX, XX(or AX). `IMG_0387`/`IMG_2077` (X-axis servo card terminal strip) read AX, AX, BX, **G1X, G2X**, AC100A, AC100B, N, P — reversed order and the "XX/AX" fourth signal name is itself uncertain in IMG_0287. Likely the same physical circuit documented at two different points, but the exact wire-for-wire correspondence is not verified.
- **SX-CPU2 part-number digit:** "BD625A552H04" is the confident, repeated read (`IMG_0292`, `IMG_0294`, `IMG_0406`); one blurry frame reads it as "BD625A552H**01**" (`IMG_0408`) — treat H04 as correct, H01 as a likely misread of a blurred photo.
- **Y-axis MELDAS module serial:** "N434884" (sharp read, `IMG_0379`) vs. "N424884" (softer read, `IMG_0376`) — second digit ambiguous between 2 and 3. Source batch explicitly flags this.
- **Z-axis MELDAS module serial:** "N444023" (two independent sharp reads, `IMG_0376`/`IMG_0377`) vs. "N444923" (one read, `IMG_0378`) — treat N444023 as more likely correct given two independent confirmations.
- **Servo card silkscreen board number:** "BN624A193K" on the Z-axis card (`IMG_0375`) vs. "BN624A393K" on the X/Y-axis cards (`IMG_0379`) — flagged in source as possibly different card revisions per axis, or a misread; not resolved.
- **TRA transformer tag "TRA31" vs "TRA41":** the X-axis transformer/ribbon-cable tag is read as both "TRA31" (blue tag, `IMG_0373`, `IMG_0374`, `IMG_0378`) and the adjacent/companion tag "TRA41" (white tag) appears on multiple axes' cards, sometimes ambiguously attributed. The transformer nameplate itself for X reads "TRA 31 / 10536" (`IMG_0370`) — treat "TRA31" as the X-axis transformer ID and "TRA41" as a separate, recurring tag seen on Y and Z cards as well; the exact meaning of the TRA31/TRA41 split (transformer vs. connector designation) is unclear from the photos alone.
- **CON1 connector size on SX-CPU2 board:** read as "HONDA MR-20L" in the clearest frame (`IMG_0293`) but as "HONDA MR-50W" in a different frame of the same connector (`IMG_0302`) — source batch explicitly flags this as needing a follow-up read; may indicate two visually similar but differently-sized Honda connectors in the same cluster, or a misread.
- **"31CAM" label:** could read as "3ICAM" — the leading characters are stylized/handwritten-looking and genuinely ambiguous (`IMG_0273`). Its function (spindle orient cam switch) is inferred from the name only, not confirmed against a schematic.
- **Cable tag near CNA10/31CAM:** reads as "CN9" or possibly "CF9" — genuinely uncertain single character (`IMG_0273`, `IMG_0274`).
- **RC3A board signal labels (MGTB/TCME/SMR etc. on a related relay board, IMG_0304):** the source batch explicitly states these labels "could not be re-confirmed at full sharpness" and recommends a re-shoot — note "MGTB" here may actually be "MGTD" as read more confidently elsewhere on the true RC3A board (`IMG_0363`); treat IMG_0304's board as a related-but-possibly-distinct board rather than assuming identical content.
- **BASE/TOP rpm sticker duplication:** "BASE 1500 RPM / TOP 6000 RPM" on SX-CPU2 (`IMG_0407`) vs. hand annotation "BASE 1500mm / TOP 6000mm" near SX-101 (`IMG_0412`) — the "mm" unit in the second reading is almost certainly a transcription artifact for "rpm," not a real second measurement; do not treat as two independent data points.
- **Resolver TYPE field** ("RT-☐X☐-☐☐"): the fill-in-box digits/letters are not legible on any of the three resolver nameplate photos (`IMG_0075`, `IMG_0076`, `IMG_2064`) — full TYPE designation remains unknown despite three separate photo attempts.
- **AC spindle motor TYPE suffix** ("SE-EV-FV", superscript character unclear) and **serial** ("D9140002_0", last digit unclear) — `IMG_2065`, single read, not cross-confirmed by any other photo.
- **X-axis servo motor serial** "N250049-24" — last digits uncertain due to glare, single read, not cross-confirmed (`IMG_2067`).
- **Voltage relay model** ends "...4133NW" or similar — obscured by glare, not legible with confidence (`IMG_0400`).
- **TDK noise filter model** "ZMB2302-11" — "Z"/"2" characters ambiguous (`IMG_0298`).
- **Transformer rating "123K?"** on the cabinet-mounted tap-board nameplate — units/full value not resolved even after cropping (`IMG_2073`); a similarly illegible "123K9" stencil appears on the red transformer panel in `IMG_1C462D22...` — possibly the same reference, not confirmed as the same transformer.
- **Machine dataplate model string** reads "V?C 20 403" — worn, likely "VQC 20 403" or similar; not fully clean (`IMG_0434`).
- **CNI vs CNi capitalization** on the BN624A328H01 comms board — transcribed inconsistently across frames (CNI1/CNI2 vs CNi1/CNi2); almost certainly the same connectors, casing is not meaningful, but noted for completeness (`IMG_0424`, `IMG_0427`).

---

## Re-shoot list

Ordered by value to the retrofit:

1. **DIAGNOSIS and MACH CONSTANT PAR NO.1 / PAR NO.3 CRT screens** — none captured in 213 photos despite being explicitly flagged as "still wanted and very high value" in the briefing. Cycle through the Mazatrol M-2's parameter pages and photograph these specifically, straight-on, screen brightness turned up, to avoid the glare problems seen on other CRT shots (e.g. `IMG_2B241C5B`).
2. **Y-axis area for a Magnescale/linear-scale nameplate** — no photo anywhere shows or rules out a linear scale. Photograph the full length of the Y-axis way/saddle, including any covered scale housing, to definitively settle open question (a).
3. **Machine/control-box dataplate in the cabinet** ("SERIAL NO.", "DRAWING NO.", "AMPS. LARGEST MOTOR", "KVA POWER SUPPLY CAPACITY", "C.B. RATING" — Mitsubishi Electric Sales America control box plate) — attempted twice (`IMG_0260`, `IMG_0261`, `IMG_0280`) and unreadable each time even after cropping/sharpening. This plate would give the exact OEM drawing number for the machine's full electrical schematic set — high value, low cost to re-shoot with better lighting and a head-on angle.
4. **Z-axis DC servo motor nameplate** — only the Mitsubishi diamond-logo end cap is visible (`IMG_2068`); the actual data plate is blocked by a bracket. Needed to complete the X/Y/Z servo motor part-number set (X = HD 101-12, Y = HD 81-12S, Z = unknown).
5. **FR-SX spindle drive rating plate** (the small door-bottom tag partially visible in `IMG_0078`/`IMG_0079`/`IMG_0286`, reading only "FR-SX-...", "BO") — a direct macro shot would confirm serial number and exact catalog suffix, supplementing the internal parts-arrangement plate's "FR-SX-2-5.5K" identification.
6. **Resolver TYPE field** (fill-in boxes "RT-☐X☐-☐☐") on all three Tamagawa pickup units — attempted three times (`IMG_0075`, `IMG_0076`, `IMG_2064`) without resolving the full type code. Needed to pin exact resolver excitation/output spec for 7i49 wiring.
7. **RC3A-style relay board in IMG_0304** (signal labels MGTB, TCME, SE, Y-M45T, S2S, SMR, EMS, T-M43T, Y-M44T, WLT, RA1, RA2) — source batch explicitly recommends a sharper face-on re-shoot; needed to confirm whether this is the same RC3A board documented elsewhere or a distinct board with different labels.
8. **PRS-10 / PRS-12 gear-confirm switches themselves** — no photo shows a switch or connector explicitly labeled PRS-10/PRS-12. Physically locate and photograph these switches and their wiring to close open question (f) definitively, rather than relying on inferred signal names (712/713, HLP, RGTLS).
9. **"31CAM" connector and spindle-orient hardware** — the "31CAM" label is stylistically ambiguous (could be "3ICAM") and its function is only inferred. Locate the physical spindle-orient sensor/cam switch and photograph its nameplate/connector directly (`IMG_0273`, `IMG_0274` show only the loose connector, not the sensor).
10. **TR-15A/TR-16A relay board nameplate** — conflicting reads ("TR-15A BN624B055D" vs "TR-16A BN0Z4B055D") need a single sharp, glare-free photo to resolve which is correct (`IMG_0080`, `IMG_0282`, `IMG_0287`).
11. **BN624A306H01 board silkscreen prefix** ("M" vs "YM" vs "EYM" VQC-20-40/50) — re-photograph each physical instance of this board head-on to determine if the prefix difference is real (different boards) or a read error.
12. **Voltage relay model plate** (ends "...4133NW") — glare-obscured, worth a angled re-shoot with the flash offset (`IMG_0400`).
13. **ATC magazine full pot count** — no single frame captures the entire ring with a confirmed total; a full 360° pass around the drum (or a dataplate showing capacity) would settle open question (e) beyond the "at least 30" floor established here.
14. **ATC housing dataplate** — visible but unreadable in `IMG_0484`; a direct, angle-corrected shot could reveal magazine capacity, drive motor spec, or index mechanism part numbers.
15. **Y-axis and Z-axis "TRA" transformer nameplates** — Y reads only a low-confidence "076" serial (`IMG_0369`) and Z is mostly obscured by wires ("~9760", `IMG_0368`); re-shoot both with wires temporarily moved aside for full serial confirmation.

---

## Not relevant at this time

- **Duplicate/near-duplicate angles of already-documented hardware:** IMG_0081, IMG_0266, IMG_0267, IMG_0272, IMG_0285, IMG_0301, IMG_0302 (context-only), IMG_0359, IMG_0360, IMG_0371, IMG_0377 (context-only), IMG_0380, IMG_0384, IMG_0385, IMG_0386, IMG_0392, IMG_0413, IMG_0426, IMG_0428, IMG_0429, IMG_0430, IMG_0486, IMG_0548, IMG_0825, IMG_0882, IMG_0884, IMG_0892, IMG_0904, IMG_2093, IMG_2096, IMG_AD51E0EA-E15C-4896-9365-25CC1CDCD6D3.
- **Blurry/glare/motion-smeared frames with no legible text:** IMG_0260, IMG_0261, IMG_0269, IMG_0280 (dataplate portion), IMG_0409, IMG_2087, IMG_2B241C5B-E9AD-428F-A821-C210BD114E63.
- **General cabinet/panel overview shots (layout context only, no new data):** IMG_0268, IMG_0270, IMG_0279, IMG_0281, IMG_0288, IMG_0289, IMG_0290, IMG_0296, IMG_0303, IMG_0307, IMG_0309, IMG_0408.
- **Shop/machine exterior, sheet metal, general background:** IMG_0480 (overview, low new data), IMG_0536, IMG_0547, IMG_0607 (spindle/table overview, no legible data).
- **Hydraulic/pneumatic hardware with unreadable nameplates:** IMG_2072, IMG_2071 (medium — brand only).
- **Operator control panel legend (fully labeled but standard/known layout, CRT off):** IMG_0482.

---

*Sources: [BRIEFING.md], [findings_00.md] through [findings_07.md] (this project's photo-triage workspace), consolidated without inventing any values not present in those files.*
