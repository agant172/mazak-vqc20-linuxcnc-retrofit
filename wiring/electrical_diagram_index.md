# 41434WB Electrical Diagram — coverage map / navigation index

**Source:** `Manuals_SN060231/VQC20-40_060231_Electrical_Diagrams.pdf` (311 pp).
**Purpose:** make the image-only schematic set navigable so extraction is targeted, not blind.
**Started:** 2026-08-09.

## Set metadata (from the index cover, PDF p017)

| Field | Value |
|---|---|
| Set No. | **41434WB** |
| Machine type | VQC-20/40/50 |
| Line voltage | 200–460 V (3-phase) |
| Date | Jun 25 1984 |
| Control | Mazatrol **M-2** |
| ROM No. | **YMZ-39D** |
| Spindle motor | 5.5 kW (AC) / 7.5 kW (VQC-40 2PC) |
| Option | 2 Pallet Changer (2PC) |

## How the set is organized

- Pages 1–15: generic modern Mazak safety/install boilerplate (not machine-specific; a door-interlock table there is for **M640/Fusion** controls, not this M-2 — ignore).
- **PDF p016** — handwritten **SQ0–SQ5 option select-bit table** (decodes the `SQ` values in `docs/parameters_sn060231.md`: TOOLS/PALLET-INTERLOCK/MITSUBISHI-FANUC/etc. SELECT). Useful but handwritten; transcribe manually from the image if a specific SQ bit is needed — OCR is unreliable, do not guess.
- **PDF p017–p018** — the diagram registers: *Elementary Diagram List* + *Control Circuit Diagram Parts List*. **Handwritten drawing numbers only, no titles** — so they list which `4143075xxx`/`4143175xxx` drawings exist but not what each one is. Low navigational value on their own; the map below (built from printed title blocks) is the usable index.
- Pages ~16–311: the schematic/table sheets (image-only, no text layer).

## Numbering convention (observed)

- `4143075xxx` = **layout / connector / circuit** drawings.
- `4143175xxx` = **tables** (solenoid, timer/counter, element lists).
- PDF page order is **not** monotonic in drawing number — you must read the title block to place a sheet.

## Confirmed page → drawing# → title map (seed — extend as sheets are read)

Built from printed title blocks actually read; these are reliable anchors.

| PDF page | Drawing # | Title | Notes |
|---|---|---|---|
| p017 | (index) | Electrical Diagram Set index / Elementary Diagram List | set metadata above |
| p030 | 4143175108 | Solenoid Table (2) | SOL 71–140 (pallet/drum/2PC — mostly out of scope) |
| p060 | 4143075160 | Timer (T), Counter (C) | PLC T.C.0–127; T.C.0 = ESPT |
| p074 | 4143075304 | Terminal Unit Layout | BBIA1 board (mined → `bbia1_terminal_unit.md`) |
| p078 | 4143175309 | SSR Board (D2W102F-33QB) | drives spindle air blast, gear-shift hi/lo, coolant, ATC outputs; CN11/CN12 MR20 |
| p079 | 4143175310 | Cable Connection Diagram — Components | cabinet interconnect overview; **Spindle Controller** block (CON4/CON5, CDN1/CDN2, TB3); feedback-device legend (spindle tacho gen, rotary encoder, per-axis resolvers) |
| p082 | 4143075313 | Servo/drive topology (X/Y/Z amps, FR-SX, rectifier) | per `servo_amp_analysis.md` |
| p083 | 4143175314 | Terminal Blocks TB6/TB7 layout | per `servo_amp_analysis.md` |
| p085 | 4143075322 | Terminal Unit Connection detail (MR connectors) | per `servo_amp_analysis.md` |
| p087 | 4143075324 | Detail Diagram — MS Connector Connection | CA1–CA7 pinouts; EMB/EMC on CA4 a/b |
| p088 | 4143075329 | Details of MS Connector Mount Board | connector mechanical layout |
| p090 | 4143075301 | Front Side View Components Layout (2) | device/wire map; E-stop PB-3B; spindle enc MS3108B 20-29P |

## Spindle (FR-SX) subsystem — where it lives in the set

The Mitsubishi **FREQROL FR-SX** spindle drive is documented across several
sheets — there is **no single "FR-SX terminal detail" sheet** in 41434WB (the
drive's own SX-AJ / SX-IO1 / SPOR pin numbers come from the Mitsubishi FR-SX
manual, not this set). What this OEM set gives:

| PDF page | Drawing # | FR-SX / spindle content |
|---|---|---|
| p082 | 4143075313 | Drive topology: FR-SX + shared rectifier/condenser DC bus alongside the X/Y/Z DC-servo amps |
| p079 | 4143175310 | Spindle Controller block in the amp rack (CON4/CON5, CDN1/CDN2, TB3) |
| p085 | 4143075322 | Terminal-unit handshake lines: SERVO READY/ALARM, ORIENT COMMAND, SPINDLE FWD/REV/RUN/BRAKE |
| p090 | 4143075301 | Spindle AC motor; **spindle rotary encoder MS3108B 20-29P** (pinout PA/SC/PE/PSH/OH/PB); gear-shift hi/lo SOL-12/13; hi/lo gear PRS-10/12 |
| p078 | 4143175309 | SSR board outputs: gear-shift hi/lo, spindle air blast |
| p029 / p031 / p033 | (alarm tables) | Spindle-orient fault semantics: AL-21/22/23/28 (orient / pin-return), AL-44/45/46 (orient malf 1/2/3), AL-65 (MMS malf) — behavior the retrofit must reproduce |

**LinuxCNC/Mesa mapping** (see `frsx_orient_model.md`, `servo_amp_analysis.md`):
±10 V speed reference → 7i49 **AOUT3**; FWD/REV + discrete **ORCM1** orient →
7i84U-A outputs; READY / ALARM / ZERO-SPEED (SZS.M) / ORIENT-ARRIVAL (ORA1) →
7i84U inputs. Gear select uses GH3 crossover = **434 rpm** (live value; see
`parameters_sn060231.md`).

## Control Circuit (ladder) diagram block

The Control Circuit (ladder) diagrams form a **91-sheet block** — PDF p194 is
its "Sheet 22 of 91" (M43/44/45 code + table clamp/unclamp rungs). So the block
starts **≈ PDF p173**. The hardwired/ladder **E-stop power-on sequence** is
normally in the first few sheets → look **≈ p173-p177** (consistent with OCR
`EMG` hits at p170/p177). This is the best lead for the still-un-located E-stop
control circuit.

## Still un-located

- **Hardwired E-stop contactor-drop control circuit** (main magnetic contactor + servo-ready gating). Not among the sheets read so far; the index can't point to it (no titles). Best resolved by the **D5 field trace** of the cabinet, or a manual page-by-page scan of the power circuit sheets. The E-stop *wiring path* is already captured in `wiring/estop_wiring_path_asbuilt.md`.

## How to use / extend this

When a sheet is read for any extraction, add its `PDF page → drawing# → title`
row here. Over time this becomes the real index the handwritten registers don't
provide, and future extraction can jump straight to the right sheet.
