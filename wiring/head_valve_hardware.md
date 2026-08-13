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

## What these photos do *not* settle

**The single-coil vs double-coil question in
[`authority_conflicts.md`](authority_conflicts.md) §2 is not answered here.**

The closer 2026-08-13 frames show the stack is **larger than first counted** —
at least two solenoid directional valves plus the `OY-G01-T-11` modular valve,
with several `GDM`-type DIN connectors. One directional valve appears to carry a
**coil at one end and a plain cap at the other**, which is the single-solenoid
spring-return pattern — but **which valve that is, and which function it serves,
is not determinable from these angles**, so it cannot be attached to `SOL-10`.

The number of coils per valve still **cannot be counted reliably**. Note that
the arrangement is what you would expect either way:

- gear shift high/low (`SOL-12` + `SOL-13`) is naturally **one** double-solenoid
  valve, plus
- tool unclamp (`SOL-10`) on a second valve, single- or double-solenoid.

So the hardware count is consistent with the placard's reading and does not
challenge it — but it does not confirm it either. §2's conclusion still rests on
the placard argument (only one tool solenoid is tagged, and a second coil would
need a tag), with physical valve inspection as the closing test.

**Nothing here matches a device to a `SOL-xx` tag.** None of these frames shows a
solenoid's own tag. That match is still the outstanding job — and it is the same
one that closes §5.

---

## Next photos, in priority order

1. **Each Nachi valve end-on**, showing how many coils it has and any tag on the
   coil or body — closes §2 and helps §5.
2. **Each CKD air solenoid with its tag visible** — closes §5 outright by
   attaching `SOL-15` / `SOL-16` / `SOL-61` / `SOL-35` to real devices.
3. **The lower Nachi valve's model plate**, straight on — still not legible.
4. **The CKD model line**, straight on and clean — completes the BOM entry.
5. ~~The gauge face, straight on~~ — **done 2026-08-13**, reads zero.

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
