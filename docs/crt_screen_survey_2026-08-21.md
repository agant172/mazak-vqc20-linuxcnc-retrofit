<!-- Complete page-by-page survey of the CRT screen photographs, 2026-08-21. -->

> **ROLE: REFERENCE** — identifies every CRT frame in `07_Reference` by page, and
> records what the set does and does not contain for the spindle-speed conflict.
> See [../INSTALL_SPINE.md](../INSTALL_SPINE.md).

# CRT screen survey — 2026-08-21

All **116** images in `My Drive/Mazak/07_Reference` were swept by cropping each
frame's page-title line and reading them in bulk. Every screen is now identified.

## Page census

| Page | Frames |
|---|---|
| `MACH CONSTANT PAR NO.2` | `IMG_0373`, `IMG_0374`, `IMG_0377` |
| `CUT COND. PARAM` | `IMG_0375`, `IMG_0376` |
| `DIAGNOSIS` | `IMG_0016`–`IMG_0019` — transcribed in [`diagnosis_screens_2025-06-27.md`](diagnosis_screens_2025-06-27.md) |
| `PROGRAM FILE` | `IMG_0020` |
| `ALARM` | `IMG_0900` |
| `VERSION` | `IMG_76E014E7…`, `IMG_ADCC7944…` |
| POSITION / program-listing pages | ~60 frames |
| 1985 paper parameter book | `IMG_0471`–`IMG_0502` |
| OEM schematics (`CPU LINK B TYPE`, `LEVEL CONVERTOR B-TYPE`) | `IMG_0816`–`IMG_0820` |

## Result: the spindle-speed conflict cannot be closed from these photographs

**`MACH CONSTANT PAR NO.1` and `PAR NO.3` do not exist anywhere in the photo set.**
This confirms the "Not yet captured" list in
[`parameters_sn060231.md`](parameters_sn060231.md) and settles the question of
whether the 2026-08-21 consolidation surfaced them — it did not. Also absent:

- any FR-SX drive parameter page,
- any gear-ratio parameter,
- any screen showing motor rpm and spindle rpm together.

`PAR NO.2` is the only machine-constant page captured. Its three frames corroborate
the existing transcription (`GH4 3488`, `GH3 434`, `GL4 119`, `GL3 28`, `GYN 2`,
`SPI 50`, `SPO 20`) and add nothing new.

## A hypothesis from figures already on file

From [`../background/parameters_factory1985_vs_live_reconciliation.md`](../background/parameters_factory1985_vs_live_reconciliation.md),
factory **`GH4` = 4000**. From the motor nameplate
(`2026-08-12/IMG_0616__dup2`, and `IMG_2065`), motor top = **6000 rpm**.

> **6000 ÷ 4000 = exactly 1.5**

A 1.5:1 high-gear reduction dissolves the apparent contradiction with no new
evidence: **6000 rpm is motor shaft, 4000 rpm is spindle at design maximum.** The
two figures were never in conflict — different shafts, exactly as
[`photo_survey_misc.md`](photo_survey_misc.md) §206 suspected but could not
demonstrate. On that reading the live `GH4` = 3488 is a **derate below design
maximum**, consistent with the VQC-20 published spindle top of ≈3500 that
`parameters_sn060231.md` already notes.

**Corollary:** motor base 1500 rpm × 1.5 = **1000 rpm at the spindle** is the
constant-torque → constant-power breakpoint in high gear — directly usable for
spindle scaling.

### Why this is a hypothesis, not a finding

The low-gear pair does not divide as cleanly:

| | high gear | low gear | implied ratio spread |
|---|---|---|---|
| Factory 1985 | 6000/4000 = **1.50** | 6000/946 = 6.34 | 4.23 |
| Live 2026 | 6000/3488 = 1.72 | 6000/434 = 13.8 | 8.03 |

A gearbox cannot have two ratio spreads, so **at most one row can encode true
mechanical ratios**. `GH3`/`GH4` are therefore control policy settings, not gear
ratios, and only the high-gear factory figure lands on a clean number. Treat the
1.5:1 as a candidate to be tested, not as established.

## The cheap test that would settle it

The PLG is **512 counts/turn on the motor shaft**
(`2026-08-12/IMG_0600__dup2`, `TS1526N55`).

> Command a known spindle rpm in high gear, read motor rpm off the PLG, divide.

The ratio falls out directly, non-invasively, from hardware already identified and
wired — cheaper than a tooth count or an FR-SX parameter dump, and it yields the
spindle scaling factor the retrofit needs.

## Incidental

- `IMG_4A69107E…` is a **transformer tap table** (`480V`; taps `1-4`, `5-8`, `10`),
  relevant to the 18 kVA Nissyo transformer recorded in `04_Wiring_Terminals`.
- `IMG_0598` is a program page showing error **`353 ILLEGAL DATA INPUT`** on
  `WK. PROGRAM NO. 1001`; the test program uses `S1000 M3`. Not an rpm limit.
