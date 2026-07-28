# ATC Sequence — Ladder Transcription (YM2V39L)

**Machine:** Mazak VQC 20/40, SN 060231 · Mazatrol M-2 sequence diagram 4136081801
**Source:** `VQC20-40_060231_Ladder_Diagrams.pdf` — sheets 31–36, 58, 65, 67–75 (PDF page = sheet + 1)
**Companion:** `docs/ladder/orient_ladder_transcription.md` (orient/gear shift — SOSA latch feeds this sequence)
**Convention:** `#` = normally-closed contact. Rung numbers = sheet×100 + line. `‖` = parallel branch.

## The short version

The VQC ATC is **armless** — the machine trades tools by moving Z between two reference points while the magazine indexes under NC-held position. The ladder implements it as **three step-chains (cycles D, E, F)** selected by which tools exist, each a MEM→CND ladder sequence: every MEM-n rung latches a step when the axes report a reference point, and every CND-n rung confirms the mechanical result (oriented, unclamped, indexed, clamped) before the next step can latch. The PLC never moves an axis itself — it raises reference-point *commands* (ZP1.B.N / ZP2.B.N) and lets the NC do the moves. That maps cleanly onto a LinuxCNC remap/HAL state machine.

## Cycle entry — sheet 65

| Rung | Coil | Logic |
|---|---|---|
| 6502 | MDITCME (M191) | `MDI.N(X181) · #MOP12 · TF(M204 T-strobe) · #MG.N(X188 magazine-select)` + seal via B/MS |
| 6503 | AUTTCME (M190) | `AUT.N(X180) · #MOP12 · TF · #MG.N` + seal via B/MS |
| 6504 | **TCME (M160) tool change memory** | `AUTTCME ‖ MDITCME` — master "ATC in progress" latch |
| 6505 | **TCME.M (Y095) barrier extend** | `(OTR.B · MGCORS) ‖ TCME` — barrier out while cover open or tool change active |
| 6507/8 | data | `TCME` → MOV commanded/spindle tool registers to D1/D2 |
| 6509 | TS0 (M164) spindle tool = 0 | `TCME · [D1 = 0]` |
| 6510 | T0 (M165) command tool = 0 | `TCME · [D2 = 0]` |
| 6511 | **EQTST (M230) equal tool select** | `TCME · #MOP13 · [D1 = D2]` — commanded = spindle tool → **skip the cycle** (also blocks ORCM1 at 3004) |

A T-command strobe (TF) in AUTO or MDI mode sets TCME. TCME immediately: extends the barrier, asserts **soft-OT neglect to the NC (OTNEG.N Y16A = TCME.M, rung 7505)**, latches the two tool registers, and computes the three deciding flags.

## Cycle selection

| Cycle | Coil / rung | Condition | Meaning |
|---|---|---|---|
| A | M184 / 6708 | `INTF.N(X189) · EIA.N · TULME…` | prep: spindle-tool-length interference path 1 (Z pre-position) |
| B | M256 / 6807 | `INTF.N# ‖ MDI.L…` | prep: alternate Z path / MDI variant |
| C | M264 / 7004 | `TLME(M167 tool-load mode)` | prep for manual tool load/unload |
| **D** | M271 / 7101 | `MEMA-2 · MEMA-1 · ZPY1.N · ZPZ2.N · #TS0 · #T0` + seal·TCME | **full change** — both spindle and commanded tool exist |
| **E** | M280 / 7203 | same but `TS0 · #T0` | **load only** — spindle empty |
| **F** | M288 / 7210 | `MEMC-2 · ZPZ1.N · ZPY1.N · #TS0 · T0` + seal·TCME | **return only** — T0 commanded |

The A/B/C chains (sheets 67–70) are mode-dependent preparation: they raise reference-point commands, run Z-move memories (MOVZME 6803, timers T31/T32), and hand off to D/E/F once Y and Z sit on the correct zero points. ATC feed hold (ATCFHDME M169, rung 6701) freezes NC feed throughout.

## Magazine indexing — sheets 32–35

| Rung | Function |
|---|---|
| 3205–3209 | TNPS1–5 (M216–M220) = pot-number BCD sensors T11P/T12P/T14P/T18P/T21P (X008–X00C) |
| 3210 | `MIPRS(X00D)` → MOV K2M216→D8, BIN→D10: **capture current pot number only while in-position** |
| 3302–3303 | current pot D10 → D12 (per magazine size 1STS/20TS/24TS/30TS) |
| 3304–3310 | T-command BCD (K2X140/K2X168) → D3/D4; LOADT selects D3, UNLOADT selects D4 → D11 → BIN → D13/D14/D15 |
| 3311 | `TFP · [D12 < D13]` → **GRTCD (M224) "greater than command"** |
| 3312–3315 | magazine size constant → D16 (shortest-path threshold, per 16/20/24/30-tool magazine) |
| 3316–3319 | difference vs D16 → **MRF (M225) forward** or **MRR (M226) reverse** — shortest-path direction choice |
| 3401 | `MIPRS · TSME · [D14 = D10]` → **MSTP (M227) magazine stop** — commanded pot arrived |
| 3402/3403 | FWME/REVME (M228/M229) direction memories |
| 3404 | **TSME (M33) tool select memory** — `AUT.M · #MSTP · #RST` + seal; branches TCME, MIPRS, TFP, MNTS — "magazine is indexing" |
| 3405–3407 | TSOFFME/T29/TSOFFAL — tool-select-off supervision (pot must stay detected; alarm M61) |
| 3408 | **MROT (M34) magazine rotate enable** = `#AL2? · TSME · TFP · TSINTL` |
| 3501 | **MFWD.M (Y003)** = `MROT · FWME · #MOP13 · #M213` |
| 3502 | **MREV.M (Y002)** = `MROT · REVME · #MOP13 · #M213` |
| 3504–3507 | GRT15/20/24/30 → T-command > magazine size → alarm 6101 |

So the magazine is a **BCD-addressed rotary with shortest-path arithmetic done in the PLC**: read current pot from 5 BCD bits while MIPRS is made, compare against commanded pot, pick direction, run the motor until the compare equals, stop on MIPRS. Tool select can run in parallel with machining (TSME independent of TCME).

## Tool clamp — sheets 35–36

| Rung | Coil | Logic |
|---|---|---|
| 3508 | **TUCME (M68) unclamp memory** | `(MEMD-1·#MEMD-3) ‖ (MEME-1·#MEME-2) ‖ (MEMF-1·#MEMF-2)` — **unclamp is owned by the cycle step chains** |
| 3509 | M69 unclamp confirmed | `TUCME · TUCPRS(X019) · TUC.M(Y097)` |
| 3512/3513 | TUCFSX/TCFSX (M63/M65) | footswitch aux (manual, VQC20 X01A/X01B path, gated by MAT timer T90) |
| 3601/3602 | T28 + **TUCPLS (M66)** | footswitch → pulse, manual mode only (`#AUT.M`) |
| 3603 | **TCLPLS (M67)** | clamp footswitch pulse while unclamped |
| 3604 | **TUC.M (Y097) TOOL UNCLAMP** | `[TUCPLS ‖ F1-key path ‖ SOSA(M92)·TUCME] · seal TUC.M · #TCLPLS · #SMR(spindle-run)` — **auto unclamp requires the oriented latch SOSA**; clamp pulse breaks the seal; never while spindle runs |
| 3606 | TUC.L lamp | `TUCPRS · TUC.M` |
| 3607 | **M64 clamp confirmed** | `TCPRS(X018) · #TUCME · #TUC.M` |

## The three change cycles — sheets 71–73

Step pattern, identical in all three chains:
**MEM-n** (step latch) = `previous-CND · axis-at-reference · CYCLE-x · TCME` + seal — **CND-n** (step done) = mechanical confirmation.

### Cycle D — full change (return old tool, load new)

| Step | Rung | Latch condition (MEM) | Completion (CND) |
|---|---|---|---|
| D-1 | 7102/7103 | `ZPY2.N` (Y at ref-2) | `#AL76 · MGTDPRS(X005) · #ATCSTPME · SOSA(M92) · MGCOX(M163) · TSOFFT · #TSOFFAL` — **oriented + cover open + tool present in pot** |
| D-2 | 7104/7105 | `ZPZ1.N` (Z to ref-1 = pot exchange height) | `MEMD-1 · MEMD-2 · M69` — **unclamped** (TUCME set by D-1·#D-3) |
| D-3ax | 7107 | — | `#TSME · MEMD-2 · TCME` — magazine index (old pot away, new pot in) finished |
| D-3 | 7106/7108 | `ZPZ2.N` (Z to ref-2) | `#MOP12 · MEMD-2 · MEMD-3 · CNDD-3AX · TSOFF ok · #TSME` |
| D-4 | 7109/7110 | `ZPY1.N` | `MEMD-3 · MEMD-4 · M64` — **clamped** (TUCME dropped by MEMD-3) |
| D-5 | 7201/7202 | `ZPZ1.N`? (scan ambiguous) | `MEMD-4 · MEMD-5# · INTF2.N(X18A) · EIA.N` ‖ TLATC — interference path clear, cycle done |

### Cycle E — load only (spindle empty)

| Step | Rung | Notes |
|---|---|---|
| E-1 | 7204/7205 | latch on `ZPY2.N`; done = `#AL76 · MGTDPRS · SOSA · MGCOX · TSOFF ok` (same gate as D-1) |
| E-2 | 7206/7207 | latch on `ZPZ2.N`; done = `M69` unclamped (to receive) |
| E-3 | 7208/7209 | latch on `ZPY1.N`; done = `M64` clamped |

### Cycle F — return only (T0)

| Step | Rung | Notes |
|---|---|---|
| F-1 | 7301/7302 | latch on `ZPY2.N`; done = `#AL75 · SPTDPRS(X05B) · #ATCSTPME · SOSA · MGCOX · TSOFF ok` — **spindle tool detect instead of magazine tool detect** |
| F-2 | 7303/7304 | latch on `ZPZ2.N`; done = `#MOP12 · MEMF-1 · MEMF-2 · M69` unclamped |
| F-3 | 7305/7306 | latch on `ZPY1.N`; done = `M64` clamped (empty spindle clamps on nothing / pot took tool) |
| F-4 | 7307/7308 | latch on `ZPZ1.N`; done = `INTF2.N · EIA.N` ‖ TLATC |

### NC-side commands generated from the chains

| Rung | Output | Meaning |
|---|---|---|
| 7309 | **ZPDEC.N (Y16B)** | `CNDD-1 ‖ CNDD-3 ‖ CNDE-1 ‖ CNDF-1` — "do the next zero-return move" decode to NC |
| 7402/7403 | ZPAXX/ZPAX (M206/M296) | which reference point is the current target, from step-pair states (e.g. `MEMD-1·#MEMD-2`, `MEMD-3·#MEMD-4`) |
| 7503 | **ZP1.B.N (Y194) ref-1 command** | `(ZP1.B ‖ ZPAX ‖ ZRNAX) · ENMCH · #ATCFHDME` |
| 7504 | **ZP2.B.N (Y195) ref-2 command** | `(ZP2.B ‖ ZP2CDA from A/B/D/E/F step states) · ENMCH · #ATCFHDME` |
| 7505 | **OTNEG.N (Y16A)** | `= TCME.M` — soft overtravel neglect while barrier extended |
| 7310 | ENMCH (M301) | `#TCME · #TSME · #MF · #SF · #BF` — mode change allowed only when nothing pending |

## Cover + supervision — sheets 31, 58, 70

- **MGC.M (Y026) is a single-solenoid valve: energized = close, de-energized = open** (open/close memories MGCCME/MGCOME2-4 on sheet 31 drive the one output).
- 7009: **MGCOX (M163)** = `#MGC.M · MGCORS(X052) · #AL71 · #AL74` — "cover verified open," the contact used by every cycle's step 1.
- Sheet 58 alarms (all with delay timer T30):
  - AL71 close-RS on while not commanded · AL72 commanded closed, RS off
  - AL73 open-RS on faulty (MGCOONF/MGCHOONF) · AL74 commanded open, open-RS off
  - **AL75** F-cycle: `SPTDPRS` off when spindle should hold a tool
  - **AL76** D-cycle: `MGTDPRS` off when the commanded pot should hold a tool
  - AL77 tool life over (option)

## Derived physical sequence (cycle D, the full change)

1. T-command in AUTO/MDI → TCME; barrier out, soft-OT neglect on, NC feed held; registers latched. If commanded tool = spindle tool (EQTST) → nothing else happens.
2. Magazine indexes to the commanded pot (shortest path) — may already have happened in parallel during machining.
3. Prep chains drive Y and Z to reference points via ZP1/ZP2 commands; cover opens (MGC.M de-energized) and MGCOX confirms; **spindle orients (SOME2→ORCM1→ORA1→SOSA — see orient doc)**.
4. D-1: Y at ref-2, oriented, cover open, pot tool detected → unclamp memory arms.
5. D-2: Z descends to ref-1 (pot engages toolholder), unclamp fires (SOSA-gated), TUCPRS confirms.
6. D-3: Z rises to ref-2 (tool stays in pot), magazine indexes old→new pot, TSME completes.
7. D-4: Z descends again, clamp (TUC.M drops), TCPRS confirms.
8. D-5: interference check clears, Z returns, TCME clears → **AFINPLS (M152, rung 3007)** pulse → unorient (UOME2), barrier retracts, feed hold releases.

## HAL / LinuxCNC implementation notes

The NC does the axis moves and the PLC sequences confirmations — in LinuxCNC terms this is a **remap of M6 (o<toolchange> NGC for the Z/Y moves) plus a small HAL/ClassicLadder component for the confirmations**, not a pure HAL state machine.

Mapped to the pin authority (@ c4a66a0):

| Ladder | Signal | Mesa pin / net |
|---|---|---|
| Y003/Y002 MFWD/MREV | magazine motor | NET_MAG_CW/CCW_SOL (existing) |
| X00D MIPRS | pot in-position | NET_MAG_IN_POS (existing) |
| X008–X00C T11P–T21P | pot number BCD ×5 | MAG_BCD_BIT0–4 (existing) |
| Y097 TUC.M | unclamp solenoid | TOOL_UNCLAMP sol (existing) |
| X019/X018 TUCPRS/TCPRS | clamp confirms | TOOL_UNCLAMP_CONF / TOOL_CLAMP_CONF (existing) |
| Y026 MGC.M | cover solenoid (1 = close) | MAG_COVER sol (existing) |
| X052/X053 MGCORS/MGCCRS | cover confirms | IN6/IN7 `mag-cover-open/closed-conf` (PROPOSED) |
| X005 MGTDPRS | pot tool detect | MAG_TOOL_AVAILABLE (existing) |
| X05B SPTDPRS | spindle tool detect | SPINDLE_TOOL_AVAILABLE (existing) |
| X003/X001 ORA1/SZS | orient arrival / zero speed | IN4/IN5 (PROPOSED) |
| Y093/Y094 ORCM1/CTL | orient cmd / lo-gear | OUT4/OUT5 (PROPOSED) |
| Y095 TCME.M | barrier | TB5 OUT3 `atc-barrier` (PROPOSED — device existence still unverified) |

Sequencing rules to reproduce:

1. **Gate unclamp on the oriented latch** (SOSA equivalent from the orient component) AND spindle-not-running — exactly rung 3604. Clamp is the de-energized state; confirm with TCPRS **and** unclamp-output false (rung 3607 uses both).
2. **Magazine indexing**: read 5-bit BCD only while MIPRS is true; shortest-path decision in software; stop when pot compare matches AND MIPRS re-made. Supervise with a "pot detect must persist" check (TSOFF equivalent) and a T-command > magazine size reject.
3. **Cycle selection**: full/load-only/return-only from (spindle tool = 0, commanded tool = 0, equal) — LinuxCNC's tool table + `iocontrol.tool-prep-number` give this directly; EQTST = skip.
4. **Step gating**: before any Z move toward the pot, require oriented latch · cover-open-conf · (pot tool detect for load, spindle tool detect for return) — the D-1/E-1/F-1 gate. Fault out (like AL75/AL76) instead of moving if detects disagree.
5. **Cover**: single output, energize-to-close; alarm if confirm disagrees with command after ~T30 delay; "cover verified open" = command off · open-RS on · no cover alarm.
6. **Barrier/soft-OT**: assert `atc-barrier` for the whole cycle; the OTNEG trick (soft-overtravel neglect at ref points) becomes unnecessary if the LinuxCNC soft limits are set to include the toolchange positions.
7. **Feed hold during ATC** (ATCFHDME) comes free with a remapped M6 — motion is already paused during the remap.
8. **Finish**: on cycle completion pulse tool-changed (AFINPLS equivalent) and drop the orient command (UOME2 behavior) so the spindle is free for the next S command.

## Open questions

1. **Step-latch first contacts on sheets 71–73 are scan-ambiguous** (CND-n vs CND-(n−1) labels overlap at this resolution). The MEM/CND alternation and the cross-reference lists support the reading above, but verify D-5/F-4 wiring on the paper prints before trusting the last step's completion condition.
2. **Reference points:** ZP1 (ref-1) vs ZP2 (ref-2) actual Z/Y coordinates must be recovered from the M-2 parameters or measured — they define the toolchange positions for the remap NGC.
3. **INTF.N / INTF2.N (X189/X18A) "interference spindle tool length 1/2"** — NC-computed tool-length interference signals selecting the A vs B prep path and gating cycle completion. The retrofit must replace this with tool-length-aware Z clearance in the remap.
4. **MAT timer T90** (footswitch arming) and **T30** (cover alarm delay) values need the M-2 timer table, same as the orient doc's timer-base question.
5. **30TS*2 (M406)** branches suggest the 30-tool magazine uses doubled logic on A/B chains — irrelevant for this machine if it's a 20/24-pot, but confirm magazine size before hardcoding D16.

## Sources

- Ladder: `VQC20-40_060231_Ladder_Diagrams.pdf` sheets 31–36 (pp.32–37), 58 (p.59), 65 (p.66), 67–75 (pp.68–76), drawing 4136081801
- Element addresses: `VQC20-40_060231_Element_List.csv`
- Pin assignments: `mesa/current_pin_authority.csv` @ c4a66a0
- Orient prerequisites: `docs/ladder/orient_ladder_transcription.md`
