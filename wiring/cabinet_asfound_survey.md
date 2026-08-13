# Cabinet as-found survey — terminal strips, starters, control gear

**Machine:** Mazak VQC 20/40B SN 060231
**Evidence:** five owner-supplied cabinet photographs, reviewed 2026-08-13.
Photos not committed (repo policy).

> ## ⚠️ THIS IS A PHOTO INVENTORY, NOT A TRACED CIRCUIT
>
> Everything below is **read off labels in busy cabinet photographs**. Nothing
> here is metered, rung out, or traced. No circuit topology is claimed — knowing
> that a terminal exists and what its label says is not the same as knowing what
> it connects to.
>
> This repo has already been bitten twice by confident reads of small text in
> wide frames (`V 150` → actually `130` in `photo_survey_misc.md`; 6 of 13
> placard tags wrong in `head_device_placard.md`). Treat every entry here as a
> **lead to verify**, and re-shoot anything a decision depends on.
>
> **Strip identities are not established.** The strips are labelled A/B/C below
> by content only. Nothing in these frames names them `TB1`/`TB2`/`TB5`, and the
> `bbia1_*` documents describe the **BBIA-1 terminal unit**, which is a different
> assembly from these cabinet strips. Do not merge the two.

---

## Why this matters — two pre-power deliverables

**D5 — hardware E-stop risk assessment + schematic** is `PARTIAL`, and
[`estop_wiring_path_asbuilt.md`](estop_wiring_path_asbuilt.md) records that the
hardwired contactor-drop circuit **was not located** in the drawing pass. Strip C
below carries the OEM safety-chain conductors in the cabinet. That is a **physical
anchor for the D5 field trace** — not the circuit, but the place to start.

**D1 — as-built one-line + terminal plan** is `NOT DRAFTED`. The starter panel
below is four 3-phase motor circuits with breakers, contactors and overloads, and
the control gear is the 100 VAC supply's protection and monitoring. That is the
raw material D1 needs.

---

## Strip C — OEM safety chain and NC interface

**The highest-value frame in this set.** Labels read top to bottom:

`G` · `59` · `INHRLS` · `DEC4` · `152` · `151` · `146` · `144` · `+24V` · `0G` ·
`58` · `57B` · `57A` · `57` · `60` · `EMB` · `MAR` · `P24` · `G24` · `G`

### The safety-chain conductors are here

`CLAUDE.md` requires preserving OEM wires `57`, `57A`, `40`, `40A`, `EHB`, `MAR`,
`EMS`, `OTR`, `PIOT`, `*ESP`. Four of those are physically on this strip —
**`57`, `57A`, `MAR`, `EMB`** — together with **`58`**, **`59`**, **`60`**.

> **`57B` is a wire number this repo has not recorded before.** The preserve list
> in `CLAUDE.md` names `57` and `57A` but not `57B`. Either the list is
> incomplete or this is a misread of `57A`/`57`. **Re-shoot this terminal
> straight-on before adding it to any preserve list** — and if confirmed, add it,
> because an unrecorded safety-chain conductor is exactly the kind of wire that
> gets cut by accident.

`57`/`57A`/`57B`/`58`/`59`/`60` appearing as a contiguous block reads like a
series chain running through the strip — **that is a hypothesis from label order
alone, not a traced circuit.** Do not act on it.

### Other signals on strip C

| Label | Repo cross-reference |
|---|---|
| `INHRLS` | "INHIBIT READ LS" — listed on BBIA-1 CN5 |
| `DEC4` | 4-axis zero-return decel — CN5 lists `XDEC4` |
| `144` | "THERMAL PROTECTOR TRIP" per the CN5 list |
| `146` | "MAIN TRANSF. OVER HEAT" per the CN5 list |
| `151`, `152`, `160`, `161`, `162` | not yet cross-referenced |
| `+24V`, `0G`, `P24`, `G24`, `G` | OEM 24 V rails and earth |

**`P24`/`G24` on this strip is the OEM 24 V domain.** Per the standing electrical
rule, nothing here connects directly to a 7i84U I/O common — every crossing goes
through an interposing relay.

---

## Strip B — NC signal interface

Labels read: `P24` · `G24` (several) · `G.` · `RST` · `CH4` · `CH2` · `EFHD` ·
`RCTLS` · `ISP1` · `ISP2` · `OSP1` · `OSP2` · `OHT2` · `OHT1` · `420` · `410` ·
`400` · `162` · `161` · `160` · `131` · `130` · `36` · `35` · `34`

This set closely matches what [`bbia1_terminal_unit.md`](bbia1_terminal_unit.md)
lists for **CN5**: *"External trip, RST, over-run EMG, EMG stop, common rails,
EFHD, RCTLS, ISP1/2, 4-axis interlock cancel, OSP1/2, +24V"* — `RST`, `EFHD`,
`RCTLS`, `ISP1`, `ISP2`, `OSP1`, `OSP2` all appear on both.

**Working reading:** this cabinet strip is where the CN5 conductors land.
**Unproven** — the match is by signal-name overlap, not by tracing. Confirm
before relying on it.

---

## Strip A — control-power rails, and the `16` earth bond

Labels read: `21` · `26` · `25` · `16`×4 · `15`×3 · `XB`×2 · `XA1`×2 · `16` ·
`10` · `XB` · `XA` · `R12` · `S12` · `T12`

### This is where the `16` measurements were taken

**A green/yellow conductor labelled `G` lands on the `16` block.** That is the
visible explanation for the owner's measurement that
[the `16` rail shows continuity to ground](head_valve_hardware.md#wire-16-is-the-shared-coil-common--and-it-is-earthed):
the rail is **deliberately bonded to earth at this strip**, not incidentally
continuous to it.

*Photo-read caveat:* the strip is dense and the exact terminal the `G` lands on
is not certain from this frame. The **bond itself** is corroborated by the meter,
so the conclusion holds even if the precise terminal is off by one.

`R12`/`S12`/`T12` at the bottom is a three-phase group. `15`/`16` are the control
rails discussed in `head_valve_hardware.md`; `XA`/`XA1`/`XB` and `10`/`21`/`25`/
`26` are not yet cross-referenced.

---

## Motor starter panel

Four three-phase motor circuits, each **breaker → contactor → overload**:

| Item | Detail |
|---|---|
| Contactors | **Mitsubishi `S-A12`** magnetic contactors, ×4. Plate: AC3 `220 V 2.5 kW 12 A` / `440 V 4.0 kW 9 A` / `550 V 3.7 kW 6 A`; JEM `220 V 2.2 kW 11 A` / `440 V 2.2 kW 8 A` / `550 V 2.2 kW 5 A` |
| Overloads | Thermal overload relay under each contactor, orange setting dial (settings not read) |
| Breakers | **Mitsubishi `MB30-CB`** motor breakers; one reads **`7.1 A`**, another **`16 A`**(?), others not read. Marked `CB-3`, `CB-4`, `CB-5` |
| Starter tags | `3S-1`, `3S-3`, `3S-4` visible |
| Load-side wires | **`U11/V11/W11`**, **`U21/V21/W21`**, **`U31/V31/W31`**, **`U44/V44/W44`** — four motors |
| Line-side | `R21`/`S21`/`T21`, and a strip below with `R0/S0/T0`, `R1/S1/T1`, `R2/S2/T2` |

**Which motor is which is not established.** The machine has a hydraulic pump,
head-lube pump, coolant pump and chip conveyor among its aux motors
(`electrical_diagram_index.md` p131, dwg 4143075405, "Motor Control"). Matching
`U11`…`U44` to those is a trace job, and **the `7.1 A` breaker cannot be assigned
to a motor from these photos**.

---

## Control gear on the 100 VAC side

| Device | Detail |
|---|---|
| **Voltage relay** | Mitsubishi **`TYPE SRE`**, `AC 100 V`, dial marked **120–150 V**. Terminals `16`, `10A`, `131`, `10A` |
| **Circuit protectors** | Mitsubishi **`CP-B`** ×4 — `AC 1 A`, `AC 10 A`, `AC 10 A`, `AC 3 A`. Marked `CB-6`, `CB-7`, `CB-8` (+ one unread). Load-side labels `10`, `10A`, `XA`, `XA1`, `21` |
| **Relays** | **OMRON `MY2A-432A`** ×3 plus one clear-cased relay, tagged **`PRTP`**, **`THR`**, **`OHT`**. Wires `144`, `146`, `+24`, `P24`, `60`, `XA1` nearby |
| **Receptacle** | `100 V 3 A` socket mounted in the cabinet |
| **Suppression** | Several `AZNR 14K201 3D` MOVs across contactor coils |

**The `THR` and `OHT` relays connect to the thermal chain already on record.**
`bbia1_cn_pinouts` gives CN5 `144` = "THERMAL PROTECTOR TRIP" and `146` = "MAIN
TRANSF. OVER HEAT", and
[`commissioning_logs/find_list_2026-08-08.md`](../docs/commissioning_logs/find_list_2026-08-08.md)
carries `THERMAL_ALARM_CHAIN` as `X73 THR.M` series-NC `X7B ONT.M`. Tags,
wire numbers and the element list agree — **a good sign, still not a trace.**

The **`SRE` voltage relay on the 100 VAC supply** is worth attention during
power-domain work: it is a supply-monitoring device with an adjustable
threshold, so it may gate the control circuit on undervoltage. Its role has not
been established.

---

## What to do with this

1. **Re-shoot `57B` straight-on.** Either a new safety-chain wire number or a
   misread; both matter.
2. **Field-trace the safety chain from strip C** toward the contactor drop — the
   D5 item the drawing pass could not locate.
3. **Confirm strip B is the CN5 landing** rather than assuming it from name
   overlap.
4. **Assign the four motor circuits** to their motors and read the overload and
   breaker settings — D1 input.
5. **Establish what the `SRE` voltage relay gates**, and its setpoint.

Nothing in this document changes `current_pin_authority.csv`. No row was added,
rebound, or re-statused on the strength of it.

---

## Related

- [`estop_wiring_path_asbuilt.md`](estop_wiring_path_asbuilt.md) — the E-stop conductor path, and the contactor circuit that was not located
- [`head_valve_hardware.md`](head_valve_hardware.md) — the `16` rail measurements this strip explains
- [`bbia1_terminal_unit.md`](bbia1_terminal_unit.md) / [`bbia1_cn_pinouts.csv`](bbia1_cn_pinouts.csv) — the **BBIA-1 terminal unit**, a different assembly
- [`electrical_diagram_index.md`](electrical_diagram_index.md) — p131 dwg 4143075405 "Motor Control"
- [`../docs/pre_power_deliverables.md`](../docs/pre_power_deliverables.md) — D1, D5

## Photo IDs to backfill

| # | Subject | Camera ID |
|---|---|---|
| 1 | Starter panel — four `S-A12` contactors, overloads, `MB30-CB` breakers | _pending_ |
| 2 | Control gear — `SRE` voltage relay, `CP-B` protectors, OMRON relays, receptacle | _pending_ |
| 3 | Strip A close-up with meter probe — `16` rail and the `G` earth bond | _pending_ |
| 4 | Strip B — `P24`/`G24`, `RST`, `EFHD`, `RCTLS`, `ISP`/`OSP`, `4xx`/`1xx` | _pending_ |
| 5 | Strip C — safety chain `57`/`57A`/`57B`/`58`/`59`/`60`, `EMB`, `MAR` | _pending_ |
