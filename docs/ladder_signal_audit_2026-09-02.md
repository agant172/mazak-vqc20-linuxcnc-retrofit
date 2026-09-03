# Ladder / signal-map / diagram audit — 2026-09-02

> **ROLE: AUDIT RECORD** — findings of the Fable 5 multi-agent rung-by-rung
> audit of every ladder transcription, the signal-map cross-consistency, and
> both diagram sets, against `YM2V39L.pdf` (drawing 4136081801; obsidian-vault
> `Machine Shop/Mazak VQC-20-40 Retrofit/Manuals/`), the OEM manual set, and
> `docs/authority_hierarchy.md`. Corrections were applied in per-subsystem
> commits (`2c50133`..`c8bdc5b` and successors); this file carries the summary,
> the surviving open items, and the consolidated bench-check list.

## Scorecard

| Subsystem | VERIFIED | DEFECT | UNSOURCED | AMBIGUOUS | Verdict |
|---|---|---|---|---|---|
| ATC | ~68 | 18 | 1 | 3 | Systematic step-chain misread + **E/F cycle swap**; corrected |
| E-stop | 21 | 10 | 1 | 1 | All nine `*ESP.M` senses correct; glosses fixed |
| Coolant | 30 | 7 | 2 | 1 | ARETRS sense + ENCOOL topology fixed |
| Homing | 32 | 4 | 0 | 0 | X100-102 are NC bits, not home switches; fixed |
| Interlocks | 15 | 6 | 5 | 1 | Sheet-43 reading inverted the rung; fixed + warned |
| Orient | 34 | 19 | 2 | 1 | Roughest subsystem: ~half the multi-branch rungs had wrong topology or inverted senses; 4 defects functionally significant for `mazak_orient.comp` |
| Probe/MMS | 25 | 5 | 1 | 0 | Arm rung 4102 structure fixed; SKIP path RESERVED |
| Spindle run | 28 | 4 | 2 | 0 | Jog-timer misread + 0-10 V analog fixed |
| Signal map | 67 signals | 15 | 5 | 5 | Pin map fully consistent; defects were stale prose |
| Diagrams | 14/15 sheets both sets | 1 | 1 | 0 | Probe route retired; regenerated |

## Highest-value catches (would have cost shop time or hardware)

1. **ATC cycle E/F swap** — the transcription had load-only and return-only
   inverted. The `.comp`/NGC *behavior* was independently correct (spindle
   empty → load; T0 → return), so only labels changed — but any future work
   written from the old transcription letters would have sequenced backwards.
2. **Jog start timer (T46)** — old text prescribed an on-delay before every
   M3/M4; the ladder bypasses SJSTT for non-jog starts (SJOG.B is NC).
3. **X100-102 as home switches** — they are NC-interface status bits with no
   field terminal; the real home detectors are LS-42/52/62 (`*DECX/Y/Z`),
   already routed to 7i84U-B TB3 IN6/7/8.
4. **Sheet-43 "drive-arm + thermal-OK gates motion"** — an inferred series
   reading of what is actually a parallel OR asserting on faults. Explicitly
   warned against carrying it into the HAL enable chain.
5. **FR-SX speed reference is unipolar 0-10 V** (direction from SRN/SRI), not
   ±10 V — HAL must clamp AOUT3 ≥ 0 and drive it from `speed-out-abs`.
6. **SPINDLE_AT_SPEED design gap (OPEN)** — the CSV correctly says no FR-SX
   at-speed terminal exists and the value must be derived in HAL, but the
   derivation was never implemented and IN13 is still netted: as configured,
   `spindle.0.at-speed` is permanently FALSE and the first feed after a
   spindle start will stall. Owner decision via the CSV-first workflow:
   implement the derivation (commanded-vs-zero-speed threshold) or unbind.
7. **E-stop "2.0 s" delay was unsourced** — K = 20 counts is drawn; no M2
   timer base exists anywhere on disk (0.1 s/count is an assumption). Same for
   every other timer-seconds figure; the M-2 is removed, so only an M2 PLC
   programming manual can settle it.
8. **Two 7i84U cards, not one** — the audit premise itself was corrected by
   the repo: 7i84U-A and 7i84U-B are both on hand (owner 2026-08-17), neither
   yet enumerated. `7i84.0.1` bindings are valid 7i84U-B pins.
9. **Gear-shift dwell runs with the run memory ASSERTED** (rung 2905, SMR is
   NO — the "jiggle into gear" pattern); `mazak_orient.comp` currently
   requires `!spindle_run`. Annotated as a LADDER DISCREPANCY in the comp;
   the bench scope test (item 28) decides which behavior to keep.
10. **SSET has no power-on delay** — ESPT is NC; T-0 is a ~20 s post-pump-stop
    grace. The comp's 2.0 s `drive_arm_delay` is kept as deliberate retrofit
    conservatism, now annotated as such.
11. **Gear solenoid rungs 2907/2910 hold the OUTGOING gear's solenoid** until
    the zero-speed dwell (ENGS) releases it — the inverse of the transcribed
    "enable gating". And the ATC orient path (TCME) **bypasses** SOME2 and the
    gear-shift interlock in rung 3004.

## Open items that are NOT bench checks

- Implement or defer the **spindle-at-speed HAL derivation** (item 6 above).
- **HYD.M rung number 2302 vs 2303** — the book disagrees with itself (margin
  numbering says 2302; every cross-reference says 2303). Cosmetic.
- **7503/7504 `#ATCFHDME` branch joins** (sheet 75) — not resolvable at scan
  resolution; read the paper prints before relying on manual ref-point
  pushbutton behavior during ATC feed hold.
- **`#ESP.M` vs `*ESP.M` glyph** — dot-matrix rendering cannot distinguish;
  no functional impact, do not "fix".
- **CDOORS (M410) meaning** — no element list covers M-addresses; gloss
  unknown. **MPCS "pallet" gloss** likewise unsourced.
- Interlocks coverage: the extraction covers 2 of 94 sheets; rung 4401
  (4th-axis interlock) and the MOP10 latch rung 4301 are known-uncovered.

## Consolidated bench-check list (one shop session, machine de-energized unless noted)

Ordered so cabinet work clusters together. E-stop items are listed as the only
means of settling open transcription claims, per the owner decision that bars
this repo from directing E-stop work — owner's option, not directed work.

### A. Multimeter / continuity at the cabinet
1. **7i84U enumeration** (settles the card question): seat 7i49 on P1, 7i44 on
   P3, both 7i84Us connected **with VIN powered**; `mesaflash --device ETHER
   --addr 10.10.10.121 --sserial` + readhmid; diff vs
   `mesa/firmware/readhmid_2026-08-13.txt`; expect sserial port 0 channels 0
   and 1. If channel 1 never enumerates, unbind `7i84.0.1` nets via the
   CSV-first workflow.
2. **X005 MGTDPRS vs X05B SPTDPRS identity** (blocks corrected E/F
   semantics). These are **PHS-181/PHS-182 3-wire photo sensors at the
   magazine** (wires 381/382, old CN2-13/CN6-50, Dwg 4143075409 pg 135) —
   do NOT ohm them like dry contacts: power the sensor (24V) and meter the
   output wire. Three states each: nothing at the station / toolholder in a
   pot at exchange / toolholder held at the spindle taper at exchange height
   (beam only needs the flange — drawbar stays clamped with hydraulics off).
   Also record whether each output sinks or sources when a tool is seen
   (sets `input-NN` vs `input-NN-not`; sserial has no invert). Outcomes:
   names right → the ladder pairing is the anomaly; both see the exchange
   plane from opposite sides → comp's physics gating stands; crossed →
   rename the CSV rows and HAL nets. Photograph sensor labels first
   (model number gives NPN/PNP and wire colors).
3. **§7.2 ATC zone pins**: look for PRS-55/PRS-66 physically first; if
   fitted, continuity CN3-44 → PRS-55 and CN3-39 → PRS-66 (vs spindle-timer /
   oil-temp senders).
4. **§7.1 zero-speed**: read jacket numbers at BBIA-1 CN4-1 and CN3-4
   (label read only) — wire 231 vs 143.
5. **§7.3 CN2-14**: buzz to the +Z over-travel switch and separately to
   CN6-12 (combined +LYZ bus test). Ferrule B-TB3-05 stays unreleased until
   then.
6. **Unlocated over-travel limits** X+/X−/Y−/Z+: ring out landings (no
   connector-box label on Dwg 4143075410).
7. **Home switch senses LS-42/52/62** (`*DECX/Y/Z`, CN2-15/CN2-16/CN1-14):
   continuity on vs off the dog before setting IN6/7/8 polarity. Also measure
   each axis dog length (sets safe `HOME_SEARCH_VEL`).
8. **Door switches X01C/X01D**: continuity door-open vs door-closed (sets
   IN24 polarity; rung 5701 implies ON-when-closed).
9. **ARETRS X027 / AEXTRS X026**: with arm parked, X027 asserted / X026
   open; reversed at full extend. Also identifies the device type
   (limit/reed/prox — unsourced).
10. **X002 FA sense**: meter FA-FC (CN4-3/4) drive healthy vs faulted —
    decides IN14 inversion.
11. **PS-5 contact form and trip pressure** (LUBE_OK polarity).
12. **X08A / X03B external-coolant-enable**: trace what feeds them — only
    place a real door/guard switch could enter the coolant chain.
13. **X030-032 / X080-082 axis-interlock inputs**: jumpers, spares, or real
    devices? Determines whether any pins need allocating.
14. **Y00A SPINDLE MOTOR RUN landing**: trace to FR-SX (candidate READY
    SET1/SET2 CON2-7/8) — fills SPINDLE_ENABLE's empty terminal columns.
15. **MAG_CW/CCW landing**: are BBIA-1 CN11-1 (208B, MAG CW) / CN11-2 (208A,
    CCW) the conductors OUT13/14's relays should break?
16. **§2/§5 residuals**: glance at the unclamp valve far end (exclude second
    coil); trace TAPC CN6-18 → CNB-46.
17. **HYD_PRESS_OK**: is the Sanwa SPS-8T-PC-20 actually installed? (UNSOURCED
    row — new sensor vs factory signal.)
18. **AIR_OK**: does an air-pressure switch exist; closed on healthy?
19. **Magazine cover valve Y026**: confirm single solenoid, spring return,
    energize = close; note de-energized state after air/hydraulic-up.
20. **Magazine size bits** (1STS/20TS/24TS/30TS): count pots physically —
    sets D16 and the GRT reject thresholds.
21. **E-stop (owner's option)**: X000 polarity across EMB-EMC released vs
    pressed; EMS/MAR relay path at the 57..60/EMB/MAR terminal block; FESP.N
    X1D6 no-conductor confirmation.

### B. Powered / drives-disabled measurements
22. **Resolver phasing** (18 conductors): open-loop direction + scope SIN/COS
    polarity per axis; confirm 7i49 is sole excitation.
23. **SE1/SE2/SE3 roles** (CN4-18/19/20): command vs common vs shield, 0-10 V
    scale; confirm +10 V = top speed and negative is not a valid reverse.
24. **DK-427 axis-command pairs**: continuity-trace removed NC command pairs
    to each drive input before landing AOUT0/1/2.
25. **Shield topology**: CNA5-20 (Z) case-ground bond (X/Y measured 0 Ω
    2026-08-16); settle GND pin choices at termination.

### B2. Orient / gear (powered, drives configured — commissioning-adjacent)
28. **Run command during gear shift**: scope FWD (CN-side) and SZS during a
    commanded M38↔M39 change — decides whether `mazak_orient.comp` must hold
    the run output through the shift (rung 2905 SMR-NO discrepancy).
29. **SZS behavior while oriented**: watch CN4-1/2 during a manual orient —
    if the FR-SX drops SZS during the orient approach (80–155 rpm), the
    AL46-equivalent needs masking during approach.
30. **PRS-10/PRS-12 idle states**: continuity in both gear positions and
    mid-stroke (ladder assumes closed only when fully engaged, both open
    mid-shift).
31. **ORA1 idle polarity**: voltage at CN4-16/17 unoriented — rung 4810
    consumes ORA1 as NC while 3006/5509 use NO; only consistent as a true
    level (high = oriented).
32. **TOUCH.N / DIHT.N (X159/X15B)**: identify the physical devices; both
    must be FALSE on this configuration or orient is blocked / SSET
    spuriously armed.
33. **FR-SX terminals for ORCM1/CTL/ORA1/SZS/SET1-SET2 + where SSET lands**
    (FR-SX vs DK-427) before spending TB5 SSR OUT5 — paper-mining exhausted,
    41434WB has no FR-SX terminal sheet.
34. **Timer bases by measurement**: stopwatch T-0 (pump-stop → SSET drop) and
    ORCM1-edge → AL45 (T-18 K100); T-19 K3000 at a 100 ms base = 300 s, which
    is implausible for a gear watchdog — bases may differ per timer.

### C. First powered ATC test (commissioning, much later)
26. **E/F direction sanity**: tool in spindle + T0 → 3-step chain, no INTF2
    check at the end; spindle empty + Tn → 4-step chain ending in the
    INTF2-gated retract. Verify against the corrected transcription before
    enabling automatic unclamp.
27. **E-stop vs extend solenoid** (owner's option): with arm extended, trip
    E-stop, meter Y034 coil — the ladder holds it at full extend; determine
    whether the OEM E-stop string cuts it electrically before writing any
    "arm drops on E-stop" HAL behavior.

## Photo shortcuts (check before going out with a meter)

Cabinet photos already in the repo/Drive may answer: cover-valve solenoid
count (item 19), terminal block 57..60/EMB/MAR labels (21), the second door
device type (8), and pot count (20). See `docs/cabinet_photo_checklist.md`
and the Drive photo scheme in the project CLAUDE.md before tracing.
