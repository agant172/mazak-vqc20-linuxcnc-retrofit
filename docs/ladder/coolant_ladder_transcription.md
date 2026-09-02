# Coolant / air-blast / lube output ladder logic — from YM2V39L

> **ROLE: BACKGROUND** — the retrofit nets flood as a plain `iocontrol` output; the ENCOOL permissive and flood-motor auto-run described here are not implemented, and mist was eliminated 2026-08-09. Kept at this path because `mesa/current_pin_authority.csv` cites it. See [../../INSTALL_SPINE.md](../../INSTALL_SPINE.md).


**Machine:** Mazak VQC-20/40 SN 060231 (Mazatrol M-2)
**Source:** `YM2V39L.pdf` / `VQC20-40_060231_Ladder_Diagrams.pdf`, drawing 4136081801.
**Extracted:** 2026-08-10. Cross-ref `SSLL` = sheet·line; PDF page = sheet + 1.
**Scope:** the 7i84U **output-side** M-code → solenoid mapping for coolant/air.

## Output signals (element list)

| Y-addr | Symbol | Device | Rung | PDF page |
|---|---|---|---|---|
| Y010 | FCM.M | Flood coolant **motor** | 3907 | p40 |
| Y011 | FCL.M | Flood coolant **valve** | 3905 | p40 |
| Y012 | THC.M | Through-hole coolant | 3906 | p40 |
| Y013 | MCL.M | Mist coolant | 3909 | p40 |
| Y014 | WAB.M | Work air blast | 3910 | p40 |
| Y015 | WAB2.M | Work air blast 2 | 3911 | p40 |
| Y016 | TAPC.M | Tap coolant | 3908 | p40 |
| Y018 | SAB.M | Spindle air blast | 3805 | p39 |
| Y035 | A-JET.M | Air jet | 4002 | p41 |
| Y096 | HYD.M | Hydraulic + **head-lube** pump | 2302 | p24 |

## M-code decode (sheet 38 lines 6-9 · sheet 39 lines 1-3)

The Mazatrol M-codes latch coolant memories (set on decode, cleared by **M09**
coolant-off or RST):
- **M08** → flood coolant on (`M08ME`) · **M09** → coolant off · **M07** → mist (`M07ME`)
- **M50** → work air blast (`M50ME`; rung 3809 gates the M50 decode with
  `#M504`(H09F.0) and has a parallel `M504 · MT2 · MU5` branch — with keep-bit
  M504 set, **M25** sets it instead) · **M51** → flood-coolant-2 / through-hole (`M51ME`)
- **M52** → tap coolant (`M52ME`) · **M53** → dust-inhale / work-air-blast-2 (`M53ME`)

## Master permissive — ENABLE COOLANT (rung 3904)

**`ENCOOL`** (H06D.1, M105) = (`ECOLEN.M`(X08A, external coolant enable) ‖
`ECOLEN.M`(X03B, external coolant enable) ‖ `#CDOORS`(M410, NC contact — bit
meaning unverified)) · `HYD.M`(hydraulics on) · `MGCCRS`(X053, magazine cover
**closed**) · `#PROGSTP.L`(not program-stop). **ENCOOL is ANDed into the six
solenoid rungs 3905/3906/3908/3909/3910/3911** — FCM.M (3907) is gated only
indirectly via FCL.M/THC.M, and SAB.M (3805) / A-JET.M (4002) are not
ENCOOL-gated — so the gated outputs run only when hydraulics are up, the
magazine cover is closed, there is no program-stop, and one enable branch
(X08A ‖ X03B ‖ CDOORS false) is made.

## Per-output logic (sheet 39)

Each output = `<M-code memory> · ENCOOL · ARETRS(X027, measuring arm retracted — NO contact)`
with a parallel **manual** branch (CMAN/MMAN/BMAN panel buttons):
- **FCL.M** flood valve (Y011) = `(M08ME · CAUT ‖ CMAN) · ENCOOL · ARETRS`
- **THC.M** through-hole (Y012) = `2NDFCS · M51ME · ENCOOL · ARETRS`
- **FCM.M** flood **motor** (Y010) = `FCL.M ‖ THC.M` — **motor auto-runs whenever the flood valve or through-hole coolant is on**
- **TAPC.M** tap coolant (Y016) = `TAPCS · M52ME · ENCOOL · ARETRS`
- **MCL.M** mist (Y013) = `(M07ME · MAUT ‖ MMAN) · ENCOOL · ARETRS`
- **WAB.M** work air blast (Y014) = `(M50ME · BAUT ‖ BMAN) · ENCOOL`
- **WAB2.M** work air blast 2 (Y015) = `2NDABS · M53ME · ENCOOL`

## Lube

There is **no separate lube output** — **head/way lubrication rides `HYD.M`**
(Y096, the hydraulic + head-lube pump), which is set by `MA.N · SA.N · *ESP.M`
(see `estop_ladder_transcription.md` / `orient_ladder_transcription.md` sheet 23).
Head-lube **pressure** is monitored via PS-5 → the AL56 head-lube alarm (sheet 57).

## Retrofit implications (LinuxCNC / Mesa)

- These map to the **7i84U output** side (flood/mist/air-blast/tap solenoids —
  see `current_pin_authority.csv`). LinuxCNC issues M7/M8/M9 (and custom M-codes
  for tap coolant / air blast) → HAL sets the corresponding 7i84U output.
- **Reproduce the `ENCOOL` permissive** (or a simplified version): don't energize
  coolant unless hydraulics/air are up and the guard/door state is safe. At
  minimum gate on the same **hydraulic-on** signal.
- **Flood motor auto-run:** in HAL, drive the flood-coolant *motor* output from
  the OR of the flood-valve and through-hole outputs, matching the OEM (Y010 =
  Y011 ‖ Y012).
- The `ARETRS` (measuring-arm-retracted, NO contact) interlock means coolant is inhibited
  while the probe arm is extended — keep that interlock if the Renishaw arm is
  used.
