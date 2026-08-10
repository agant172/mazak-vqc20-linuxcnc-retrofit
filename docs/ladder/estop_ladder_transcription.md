# E-stop ladder logic — transcribed from YM2V39L

**Machine:** Mazak VQC-20/40 SN 060231 (Mazatrol M-2)
**Source:** `YM2V39L.pdf` / `VQC20-40_060231_Ladder_Diagrams.pdf` — PLC Sequence
Diagram, drawing **4136081801**, Yamazaki Machinery Works, 4/20/1985, 94 sheets.
**Extracted:** 2026-08-10, from the sheets carrying the `#ESP.M` (X000) cross-refs.

## How to find these rungs (numbering key)

Ladder cross-ref numbers are **`SSLL` = sheet·line** (e.g. `2307` = sheet 23,
line 7), and **PDF page = sheet + 1** (sheet 21 = PDF p22). The E-stop input
`#ESP.M` (X000) cross-refs from the element list are:
**2115, 2302, 2307, 3204, 4102, 6002, 7601, 7602, 7603.**

| Rung | Sheet·line | PDF page | Read? | What it does |
|---|---|---|---|---|
| 2115 | 21·15 | p22 | ✅ | RESET (`*RST`) — E-stop is one of its interlocks |
| 2302 | 23·02 | p24 | ✅ | HYDRAULIC PUMP & HEAD LUBE (`HYD.M`/Y096) |
| 2307 | 23·07 | p24 | ✅ | **SERVO READY** (`SA.M`/Y098) |
| 3204 | 32·04 | p33 | ⬜ | (E-stop interlock — read on demand) |
| 4102 | 41·02 | p42 | ⬜ | (hydraulic-related per 2302 cross-ref list) |
| 6002 | 60·02 | p61 | ⬜ | (E-stop interlock — read on demand) |
| 7601-7603 | 76·01-03 | p77 | ✅ | Axis jog direction memories (-X/-Y/-Z) |

## The E-stop input

- **`#ESP.M` = X000 = H000.0** — "EMERGENCY STOP" (machine field input). Drawn
  `*ESP.M` where used as a contact. **Physical polarity of X000 must be verified**
  (repo already flags: E-stop is field-wired, monitored on 7i84U-A TB2 IN29, and
  must go into the **hardwired** safety chain, not a Mesa input alone).
- `FESP.N` = X1D6 = "FMS EMERGENCY STOP" — FMS/cell option, **not fitted**, drop.

## What E-stop gates (the rungs)

**Sheet 23 line 7 — SERVO READY** (`SA.M`, H053.0 → Y098):
`SA.N` (spindle-amp-normal, X119) **AND** `*ESP.M` (X000, E-stop healthy) → SERVO
READY. **When E-stop is asserted, SERVO READY drops** — this is the drive-enable
the retrofit's velocity-mode axes depend on.

**Sheet 23 line 2 — HYDRAULIC PUMP & HEAD LUBE** (`HYD.M`, H052.6 → Y096):
`MA.N` (servo-amp-normal, X118) **AND** `SA.N` (X119) **AND** `*ESP.M` (X000) →
run hydraulic/head-lube pump. E-stop drops hydraulics. (Big cross-ref fan-out:
`HYD.M` gates many downstream rungs, incl. 4102/4105.)

**Sheet 23 line 4 — EMG. DELAY TIMER** (`T0`, K = 20 → **2.0 s**): the
emergency-stop delay timer `ESPT` (H0B0.0). Used at sheet 23 line 5 to hold
`SSET.M` (SPINDLE SET). So E-stop starts a **2-second delay** in the spindle-set
/ shutdown sequence.

**Sheet 21 — master control** (POWER-ON, NC-READY, RESET, AUTO-MODE-MC):
- line 15 **RESET** (`*RST`, H060.0): a series interlock of `ERS.N · PGEND.P ·
  HYD.M · RST.N · *ESP.M · FESP.N` → `*RST`. E-stop participates in the
  reset-enable chain.
- line 14 **NC READY TIMER** (`T90`, K = 10) → `H0AB.2` (NC ready).
- line 16 **AUTO MODE MC** (`AUT.M`, H04E.0 → Y070).

**Sheet 76 lines 1-3 — axis jog direction memories** (`-XMEM`/`-YMEM`/`-ZMEM`,
H07D.0/1/2): each is `-X.B/-Y.B/-Z.B` (jog button) · `SMZx.N` (axis zero) ·
`HYD.M` (hydraulics OK) · `*ESP.M` (E-stop healthy) → set direction memory.
**E-stop inhibits jog motion.** (Lines 4-6 are the matching `+XENV/+YENV/+ZENV`
direction enables.)

## Retrofit implications (LinuxCNC / Mesa)

The OEM E-stop, in ladder terms, **removes SERVO READY (Y098), drops the
HYDRAULIC pump (Y096), blocks RESET, and inhibits jog**, with a **2 s EMG delay
timer** in the spindle-set path. For the retrofit:

- Reproduce "E-stop → drop drive-enable" in HAL: E-stop (and the hardwired chain)
  must remove the axis **drive-enable** outputs (7i84U-B TB3 OUT0-2) and the FR-SX
  run/enable, mirroring how the OEM `SA.M` SERVO READY gated the drives.
- The **~2 s EMG delay** is a hint for the `stop_timing_budget.md` / Z-brake and
  spindle-coast sequencing — don't drop everything instantaneously if the OEM
  sequenced it.
- This ladder logic is **monitoring/sequencing only**; the **hardwired**
  contactor-drop E-stop chain (still to be traced per **D5**) remains the primary
  safety element. See `estop_safety_chain.md` and `estop_wiring_path_asbuilt.md`.

Sheets 32 (3204), 41 (4102), 60 (6002) carry additional `#ESP.M` uses — read
p33/p42/p61 on demand and extend the table above.
