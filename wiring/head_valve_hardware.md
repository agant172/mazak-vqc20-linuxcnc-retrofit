# Spindle-head valve hardware — as-found inventory

**Machine:** Mazak VQC 20/40B SN 060231
**Evidence:** ten owner-supplied photographs of the head hydraulic/pneumatic
stack, reviewed 2026-08-13 — five overview frames and five close-ups. Photos not
committed (repo policy).
**Scope:** the *physical devices* behind the OEM legend in
[`head_device_placard.md`](head_device_placard.md). That document says which tag
is which function; this one records what the hardware actually is.

> **Nameplate reads only.** Nothing here is traced, metered, or commissioned. No
> coil has been rung out to a wire number, and no device in these photos has yet
> been matched to a specific `SOL-xx` tag — the placard gives positions, but the
> photos were not taken pointing at a tag.

---

## What is on the head

Working down the head casting, right-hand side:

| Position | Device | Medium |
|---|---|---|
| Top | Two stacked **NACHI-FUJIKOSHI** solenoid-operated directional control valves on a manifold, with pressure gauge and `OIL PRESSURE` tag | Hydraulic |
| Middle | Brass manifold carrying **two CKD solenoid valves**, with two **CKD speed controllers** (flow regulators) below | Pneumatic |
| Middle | Mitsubishi junction box | — |
| Lower | Red/orange gearbox casting | — |
| Bottom | **Nippon Gerotor `TOP-IME200`** motor-trochoid pump, 3-phase induction motor | Lube/hydraulic |

---

## Hydraulic — NACHI-FUJIKOSHI directional control valves

Plate text, verbatim where legible:

| Field | Value |
|---|---|
| Maker | `NACHI-FUJIKOSHI CORP.` / `MADE IN JAPAN` |
| Description | `SOLENOID OPERATED DIRECTIONAL CONTROL VALVE` |
| Model (upper valve) | **`SA-G01-E3X-C1-31`** |
| MFG. NO. (upper valve) | `380` |
| Model (lower valve) | same family; **not legible** in these frames |

**A third Nachi device is in the stack** — a **modular (sandwich-plate) valve**,
photographed 2026-08-13:

| Field | Value |
|---|---|
| Maker | `NACHI` / `FUJIKOSHI, LTD.` |
| Description | `MODULAR VALVE` |
| Model | **`OY-G01-T-11`** |
| MFG. NO. | `510` |

Its nameplate carries a small hydraulic schematic with `A`/`B`/`P`/`T` port
labels. The `T` in the type code and the schematic suggest it acts on the tank
line, but **the code is not decoded here** — that needs the Nachi catalogue. A
modular valve stacks between a directional valve and its subplate, so this is
part of the same assembly rather than a separate circuit.

**This confirms an existing CSV claim.** `GEAR_HI_SOL`, `GEAR_LO_SOL` and
`TOOL_UNCLAMP_SOL` all describe their load as a *"Fujikoshi hydraulic valve"* —
the maker is now confirmed on the hardware.

The model string is recorded verbatim and **not decoded**. Nachi type codes
carry spool arrangement, position count and coil voltage, but decoding
`SA-G01-E3X-C1-31` requires the Nachi catalogue, which is not in the repo. Do
not infer coil voltage or spool type from it.

### Pressure

| Item | Value |
|---|---|
| `OIL PRESSURE` tag on the manifold | **`85 kgf/cm²`** / **`1200 PSI`** (85 kgf/cm² ≈ 1209 psi — internally consistent) |
| Gauge | `OSAKA`, dual scale **0–150 kgf/cm² / 0–2000 psi**, serials `4740901521` / `57853003` |
| Gauge green band | ~85–90 kgf/cm² — matches the tag's 85 setting |

> **CORRECTION (2026-08-13).** An earlier revision of this document said the
> gauge "appears to be indicating non-zero pressure" and advised treating the
> head hydraulics as potentially pressurised. **That was a misread of an oblique
> wide shot.** A straight-on photo of the gauge face shows the needle at **zero**.
> There is no evidence of stored pressure in the head circuit as photographed.
>
> The ordinary precaution still applies — verify at the gauge before breaking a
> fitting or pulling a coil — but it is standard practice, not a flagged concern
> specific to this machine.

---

## Pneumatic — CKD solenoid valves

Two identical valves on a shared brass manifold. Plate text:

| Field | Value |
|---|---|
| Maker | `CKD Corporation`, `Nagoya Japan` |
| Pressure ratings `kgf/cm²(bar)` | `AIR` — **digit worn, not read**; `WATER 4`; `OIL 2.5` |
| `B.Orifice` | `3.0` — could be `5.0`, worn |
| `T.Orifice` | blank on the plate |
| `PIPE` | `PT1/4` |
| `SERIAL` | not legible |
| `MODEL` | partially legible, `GAB41…` / `…02G` — **not resolved** |
| **Coil marking** | **`100V 110V` `50/60`** |

### The coil voltage is now confirmed, not assumed

The repo has been carrying **100 VAC** for the head air solenoids as a planning
assumption — it drives the requirement for interposing relays **RLY-5/6/7** on
`AIR_BLAST`, `TOUCH_SENSOR_BLAST` and `TAP_COOLANT_BLAST`, and the standing rule
that *"the planned 100 VAC loads use interposing relays. Do not put 100 VAC on a
7i84U terminal"* ([`../docs/grounding_shielding_plan.md`](../docs/grounding_shielding_plan.md)).

**The CKD coils are marked `100V 110V 50/60`.** The assumption was correct, and
the interposing-relay requirement stands on measured-class evidence rather than
inference. Coil **current** is still unmeasured, so relay contact sizing remains
open.

Below the manifold sit two **CKD speed controllers** (adjustable flow
regulators) — relevant to air-blast tuning at commissioning, not to wiring.

---

## `PS-5` head-lube pressure switch — device, wire and return all confirmed

**The single most useful frame in this set.** A close-up shows the head-lube
pressure switch with three things legible in one image:

| Observed | Value |
|---|---|
| Stamped metal tag hanging on the device | **`PS 5`** |
| Signal wire label | **`355`** |
| Second wire label | **`G24`** |

This is an **end-to-end physical confirmation** of an existing pin-authority row.
`LUBE_OK` (7i84U-A `IN25`, net `lube-ok`) already carries field point
*"PS-5 head-lube pressure switch wire 355 (PLC X079 HLP.M)"* with
`dest_connector = CN6`, `dest_pin = 39`, `factory_wire = 355` — and
`bbia1_cn_pinouts.csv:138` independently gives
**`CN6-39 = wire 355 = SPINDLE HEAD LUBE PRESSURE`**.

Device tag, wire number and connector pin now agree across the machine, the
BBIA-1 pinout and the pin authority. This is the first device in the head photo
series where the tag *and* its wire number are both physically visible.

**`G24` matters for the isolation boundary.** It is the OEM 24 V common, so this
switch sits in the **OEM `P24`/`G24` domain**. Per the standing electrical rule,
it must reach the 7i84U through an interposing relay — no direct OEM `G24`
connection to any 7i84U I/O common. The `LUBE_OK` row should be read with that
requirement attached.

**Status not changed.** `LUBE_OK` remains `FACTORY_INTERFACE`. This evidence
would justify promoting it under the evidence taxonomy, but status changes are
owner decisions in this repo — recommended, not applied. Contact form (NO/NC)
and trip pressure are still unverified; the tag confirms identity, not behaviour.

---

## Coil wire labels — read off the machine 2026-08-13

**Every coil on the head stack now has its conductor label read.** This is the
method that was proposed one round earlier (read the wire, not the device), and
it worked.

| Device | Conductors at the coil | Rule → | Function |
|---|---|---|---|
| Nachi `SA-G01-E3X-C1-31` — **left** coil | `412` + `16` | `SOL-12` | Gear shift **high** |
| Nachi `SA-G01-E3X-C1-31` — **right** coil | `413` + `16` | `SOL-13` | Gear shift **low** |
| Nachi lower directional valve | `410` | `SOL-10` | **Tool unclamp** |
| CKD **upper** air solenoid | `416` + `16` | `SOL-16` | **Work air blast** |
| CKD **lower** air solenoid | `415` + `16` | `SOL-15` | **Spindle air blast** |

**The `4NN` → `SOL-NN` rule is now confirmed on the machine**, not just across
paper sources. `connector_crossref.md` predicted `415` → SOL-15 spindle air blast
and `416` → SOL-16 work air blast from OEM dwg pg 90; both are physically on the
two CKD coils exactly as predicted.

### Wire `16` is the shared coil common

`16` appears on **four** of the five coils (the fifth, `410`, was photographed
from an angle showing only one conductor). A number repeated across unrelated
solenoids is a **common rail, not a signal**. `photo_survey_misc.md` records
`15`/`16` among the TB2 distribution rails (`G`/`P24`/`G24`/`16`/`15`), and these
coils are 100 VAC — so `16` is most plausibly the **100 VAC coil common/neutral**,
with each `4NN` being the switched hot.

*Inference, well supported but unverified:* confirm with a meter before wiring
interposing relays, since it determines which side of each coil the relay contact
breaks.

## §2 CLOSED — `SOL-10` is a single-coil valve

The coil-count arithmetic proposed last round resolves exactly as predicted:

- The **upper** Nachi `SA-G01-E3X-C1-31` carries **a coil at each end** —
  `412` left, `413` right. That is the **gear-shift double solenoid**, and the
  `E3X` 3-position spool fits high / neutral / low.
- **Tool unclamp is a different valve.** Wire `410` lands on the **lower**
  Nachi directional valve, a separate body.

Three coils over two bodies = **2 + 1**, mapped exactly as the placard's tag
count forced. `TOOL_CLAMP_SOL` (OUT9) `NOT_USED` / "PHANTOM — SOL-10 is
single-coil" is **confirmed**: there is no second coil anywhere for a clamp
solenoid.

*Residual:* the far end of the lower valve was not photographed, so a second coil
there is not photographically excluded — but it would need a tag and a wire
number, and the placard has neither. Treat §2 as closed on documentary +
physical agreement, with a glance at that valve's far end as a free final check.

---

## How to identify a device that has no tag

**The solenoids do not carry `SOL-xx` tags** (owner, 2026-08-13). Only `PS-5`
had a stamped tag. So "photograph the tag" is not a usable instruction for the
solenoids, and an earlier revision of this document asking for exactly that has
been withdrawn. Three methods work without a tag.

### 1. Count coils — needs no identification at all

**This closes [`authority_conflicts.md`](authority_conflicts.md) §2 by
arithmetic.** The placard lists **three** hydraulic solenoid tags on the head:
`SOL-10` (tool unclamp), `SOL-12` (gear high), `SOL-13` (gear low). Three tags =
three coils. So count the **solenoid valve bodies** and the **coils on each**:

| If the stack has | Then |
|---|---|
| **2** solenoid bodies | 3 coils over 2 bodies forces **one double + one single**. Gear shift hi/lo is the natural double (one 3-position valve: high / neutral / low), leaving **`SOL-10` as the single** — which is exactly what the `TOOL_CLAMP_SOL` PHANTOM call assumes. |
| **3** solenoid bodies | Could be 1+1+1, and the deduction collapses. §2 stays open. |

So the photo to take is simply **the whole hydraulic stack side-on**, far enough
back to count bodies, close enough to see whether each has a coil at both ends
or a coil at one end and a plain spring cap at the other. **No tag required** —
the placard supplies the tag count, the hardware supplies the coil count, and
the mapping falls out. Do not count the `OY-G01-T-11` modular valve as a
solenoid body; it is a sandwich plate.

### 2. Read the wire number at the coil — the method that worked for `PS-5`

The `PS-5` frame succeeded because the **wires** were labelled (`355`, `G24`),
not the device. The solenoid coils have `GDM`-type DIN connectors with cables
running to them, and those cables are the same OEM harness that labels
conductors with heat-shrink numbers.

**Photograph, or read, the conductor label closest to each coil's DIN plug.**
A wire number resolves the identity outright via the numbering rule established
in [`authority_conflicts.md`](authority_conflicts.md) §5 — terminal-unit side
`2NN`, RC3A bank side `4NN`, both meaning **`SOL-NN`**:

| Wire | Device |
|---|---|
| `215` / `415` | `SOL-15` spindle air blast |
| `216` / `416` | `SOL-16` work air blast |
| `231` / `431` | `SOL-31` flood coolant |
| `235` / `435` | `SOL-35` dust inhole eliminate |
| `236` | `SOL-36` oil hole |
| `261` / `461` | `SOL-61` air jet |

If the label is unreadable at the coil, ring the coil out to the RC3A terminal
bank with a meter — same answer, more certain. **This is what closes §5.**

### 3. Follow the plumbing — identity from destination

Function is unambiguous at the outlet, no electrical work needed. Trace each
CKD valve's air line to where it discharges: **spindle air blast** exits at the
spindle nose/taper, **work air blast** is aimed at the work or table, **air jet**
serves the MMS touch sensor, **dust inhole eliminate** feeds the extraction
path. Slower than reading a wire number, but it needs nothing but eyes and
works when every label has worn off.

### Note — most of the air solenoids are not in these photos

The placard lists **six** air/coolant solenoids on the head (`SOL-15`, `-16`,
`-31`, `-35`, `-36`, `-61`). Only **two** CKD valves appear in this photo set,
so **at least four more are elsewhere on the head** and have not been located.
Finding them is part of closing §5.

---

## Related

- [`head_device_placard.md`](head_device_placard.md) — the OEM legend these devices belong to
- [`authority_conflicts.md`](authority_conflicts.md) §2 (valve topology), §5 (solenoid identities)
- [`../mesa/current_pin_authority.csv`](../mesa/current_pin_authority.csv) — `GEAR_HI_SOL`, `GEAR_LO_SOL`, `TOOL_UNCLAMP_SOL`, `AIR_BLAST`, `TOUCH_SENSOR_BLAST`, `TAP_COOLANT_BLAST`
- [`../docs/photo_survey_misc.md`](../docs/photo_survey_misc.md) — earlier record of a NACHI hydraulic power-unit pump (`IMG_2071`/`IMG_2072`), spec unresolved

## Photo IDs to backfill

| # | Subject | Camera ID |
|---|---|---|
| 1 | Wide — placard on the guard wall, head stack at right | _pending_ |
| 2 | Head stack closer — Nachi valves, CKD manifold, speed controllers | _pending_ |
| 3 | **Two CKD solenoid nameplates, close** — `100V 110V 50/60` coils | _pending_ |
| 4 | CKD manifold + speed controllers | _pending_ |
| 5 | **Nachi valve stack** — `SA-G01-E3X-C1-31`, gauge, `OIL PRESSURE` tag | _pending_ |

**Batch 2 — close-ups (2026-08-13):**

| # | Subject | Camera ID |
|---|---|---|
| 6 | **Nachi `MODULAR VALVE` nameplate** — `OY-G01-T-11`, MFG.NO. `510` | _pending_ |
| 7 | Valve stack from the side — coils, DIN connectors, subplates | _pending_ |
| 8 | Valve stack closer — `OIL PRESSURE` tag `85 kgf/cm²` / `1200 PSI` | _pending_ |
| 9 | **Gauge face straight on** — OSAKA, needle at **zero** | _pending_ |
| 10 | **`PS 5` tag with wire `355` and `G24`** — confirms the `LUBE_OK` row | _pending_ |
