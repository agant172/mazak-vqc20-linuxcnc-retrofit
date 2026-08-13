# Spindle-head valve hardware — as-found inventory

**Machine:** Mazak VQC 20/40B SN 060231
**Evidence:** five owner-supplied photographs of the head hydraulic/pneumatic
stack, reviewed 2026-08-13. Photos not committed (repo policy).
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

**This confirms an existing CSV claim.** `GEAR_HI_SOL`, `GEAR_LO_SOL` and
`TOOL_UNCLAMP_SOL` all describe their load as a *"Fujikoshi hydraulic valve"* —
the maker is now confirmed on the hardware.

The model string is recorded verbatim and **not decoded**. Nachi type codes
carry spool arrangement, position count and coil voltage, but decoding
`SA-G01-E3X-C1-31` requires the Nachi catalogue, which is not in the repo. Do
not infer coil voltage or spool type from it.

### Pressure

- A tag on the manifold reads **`OIL PRESSURE`** with two boxes: the
  `kg/cm²` figure is worn beyond reading, the other reads **`1200 PSI`**.
- The gauge is dual-scale (0–2000 PSI / 0–140 kg/cm²) with a green band.

> ⚠️ **The gauge appears to be indicating non-zero pressure in these photos.**
> The reading cannot be taken accurately from the frame, and a stuck gauge is
> equally possible — but a hydraulic head circuit can hold pressure long after
> the pump stops. **Treat the head hydraulics as potentially pressurised.**
> Confirm at the gauge and bleed to zero before breaking any fitting, removing a
> coil, or working on the tool-clamp circuit. This is an observation, not a
> measurement.

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

## What these photos do *not* settle

**The single-coil vs double-coil question in
[`authority_conflicts.md`](authority_conflicts.md) §2 is not answered here.**

The hydraulic stack is two valve bodies with coil housings visible, but the
frames do not show either valve end-on, so **the number of coils per valve
cannot be counted**. Note that two bodies is exactly what you would expect
either way:

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
3. **The lower Nachi valve's model plate**, straight on.
4. **The CKD model line**, straight on and clean — completes the BOM entry.
5. **The gauge face**, straight on, so the pressure state is unambiguous.

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
