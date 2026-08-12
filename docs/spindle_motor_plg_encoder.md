# Spindle motor built-in PLG encoder — nameplate evidence

**Machine:** Mazak VQC 20/40B SN 060231
**Evidence:** five owner-supplied photographs of the AC spindle motor's
terminal/junction box, reviewed 2026-08-12.
**Status:** device **identified from nameplates**. Nothing here is
electrically verified, traced, or commissioned.

> **Photos are not committed** (repo policy: no raw photos — see
> [`photo_survey_misc.md`](photo_survey_misc.md)). File the five originals in the
> Google Drive archive under `06 Nameplates & Labels` and add their camera IDs to
> the [Photo IDs](#photo-ids-to-backfill) table below so this record becomes
> re-checkable.

---

## BLUF

The AC spindle motor has a **motor-built-in optical shaft encoder** — the
motor's own wiring plate calls it a **"P.L.G."**. It is a **Tamagawa Seiki
TS1526N55, 512 counts/turn, DC ±15 V**, housed under a Mitsubishi Electric cap
inside the motor's terminal box.

Three consequences:

1. It **corrects** the repo's standing claim that the spindle motor's built-in
   feedback is a *magnetic* pickup ([§Correction](#correction-to-servo_amp_analysis-15)).
2. It **narrows but does not close** the FR-SX orient-detector question — a PLG
   physically exists, so `#41 OSL = 0` is *possible*, but which mode is actually
   provisioned still requires the drive parameter dump
   ([§What this does not resolve](#what-this-does-not-resolve)).
3. It is almost certainly **the FR-SX drive's own device, not a LinuxCNC
   resource**. Do not plan to land it on Mesa without reading
   [§Retrofit implications](#retrofit-implications) first.

---

## Design decision — LinuxCNC does not read spindle position

**Decided 2026-08-12 (owner).** `num_encoders=0`, P3 empty, and
`SPINDLE_ENCODER` `UNBOUND` are the **settled design**, not a holding pattern
awaiting a device. Nothing in the retrofit requires LinuxCNC to know spindle
angle or spindle count.

Why nothing needs it:

| Function | How it is served | Needs spindle position? |
|---|---|---|
| Spindle **orient** | FR-SX internal — discrete `ORCM1` out, `ORA1` arrival back | No |
| **Zero-speed / at-speed** supervision | Discrete `SZS` (7i84U-A IN5), speed-reach (IN13) | No |
| **Speed command** | ±10 V on 7i49 AOUT3 | No |
| **Tapping** | **Floating / tension-compression holder** (owner-confirmed 2026-08-12) — needs only spindle FWD/REV and dwell, both already planned | No |
| Rigid tapping / G33 threading | **Not a machine capability and not in scope** | Would — see below |

> **Naming trap:** `TAPC` on CN6-18 is **"TAP COOLANT"**
> (`wiring/bbia1_cn_pinouts.csv:123`), *not* a tapping-cycle or rigid-tap
> signal. Do not read it as evidence of synchronised tapping.

### Why the PLG could not serve that purpose even if it were wanted

Two independent reasons, either one sufficient:

1. **It is upstream of a 2-speed gearbox.** The PLG is on the *motor*; the
   spindle is behind the `GSH` high / `CTL` low gear train (confirm switches
   `PRS-10`/`PRS-12`, crossover 434 rpm per
   [`parameters_sn060231.md`](parameters_sn060231.md)). Motor position is not
   spindle position, and the ratio changes with gear state. No amount of careful
   wiring fixes this.
2. **No index/marker.** The P.L.G. pin table is `PA`/`RA`, `PB`/`RB` — two
   phases and, most likely, their complements. There is no one-per-rev reference
   line, so there is no threading datum.

So the "do not parallel-tap the PLG" rule below is not primarily an electrical
caution — the signal is **structurally unusable** for spindle-synchronised
motion. The electrical caution stands on top of that.

### If this decision is ever revisited

Adding rigid tapping later means an encoder **mounted on the spindle, after the
gearbox** — not a PLG tap and not an inherited OEM device. Budget for three
things, not one: the encoder and its mechanical drive; a **receiver**, since
7i80HDT P3 is bare 3.3 V FPGA GPIO and cannot take a differential or ±15 V
device directly; and possibly **a new bitfile** — whether
`7i80hdt_rmsvss6_8.bin` contains any encoder instances is not established
([`mesa_pcw_bitfile_inquiry.md`](mesa_pcw_bitfile_inquiry.md) notes the count
"isn't directly countable from this file"). Treat it as a scoped project, not a
wiring change.

---

## Verified from the nameplates

### Encoder nameplate

| Field | Value as printed |
|---|---|
| Description | `OPTICAL SHAFT ENCODER` |
| Brand on label | `Tamagawa` |
| Type | **`TS1526N55`** |
| Resolution | **`512 COUNTS/TURN`** |
| Supply | **`DC ±15V`** |
| Serial | `SER.NO. A6022` |
| Date | `1984. 6` |
| Manufacturer | `TAMAGAWA SEIKI CO.,LTD. JAPAN` |
| Other marking | `322` |
| Housing cap | `MITSUBISHI ELECTRIC CORPORATION` + `No. A6022` |

The Mitsubishi-branded cap over a Tamagawa-built encoder is consistent with an
OEM motor-built-in detector rather than a field-added device. The 1984-06 date
matches the machine's era (MFG DATE 6/85, `IMG_0434`).

### Motor wiring plate — `889515-01`

Plate title `WIRING PLATE (接続名板)`. Reproduced verbatim:

**Terminals**

| Group | Terminals | Plate wording |
|---|---|---|
| Motor | `(U)` `(V)` `(W)` | `INDUCTION MOTOR (三相誘導電動機)` — drawn as a 3-phase winding |
| Thermal | `(OHS1)` `(OHS2)` | `OVER-HEAT SENSOR (過熱検出器)` — drawn as a series contact |
| Fan | `(BU)` `(BV)` `(BW)` | `FAN-MOTOR (ファン・モータ)`, `IN CASE OF THREE PHASE MOTOR` (BW dashed) |

**`CONNECTOR WIRING OF P.L.G.` (タコジェネのコネクタ結線)**

| Pin | Name | Pin | Name | Pin | Name |
|---|---|---|---|---|---|
| 1 | `PA` | 2 | `RA` | 3 | `PB` |
| 4 | `RB` | 5 | `AGA` | 6 | `N15C` |
| 7 | `GND` | 8 | `P15C` | 9 | `COM` |

Connector part numbers printed alongside: **`AMP-350720-1`** and
**`AMP-350689-1`**.

**Warning printed on the plate, verbatim:**

> `DO NOT SUPPLY POWER BETWEEN (OHS1) AND (OHS2).`
> `(端子(OHS1)と(OHS2)間には電圧を印加しないよう注意下さい。)`

### Wire labels observed in the box

- Motor-side leads labelled `U`, `V`, `W`; the incoming cable conductors spliced
  to them are labelled **`SU`, `SV`, `SW`** in yellow insulated bullet splices.
- `OHS1` (white conductor) and `OHS2` (red conductor), each in its own yellow
  bullet splice, cable-tied clear of the power splices.
- A small multi-conductor connector with green/yellow/red conductors adjacent to
  a lead labelled `BU` (fan motor).
- A green/yellow bonding conductor to the box.
- The encoder body is bolted down inside the same box; its cable exits into the
  loom rather than to a terminal strip.

---

## Inferences (supported, not verified)

1. **This is the spindle motor, not an axis motor.** High confidence. The axis
   drives on this machine are brushed-DC MELDAS HD / DK-427 with Tamagawa
   TS2014N resolvers — not 3-phase induction, and they have no separate fan
   motor. The `SU`/`SV`/`SW` cable labels read naturally as **S**pindle U/V/W,
   and the forced-vent fan is characteristic of an inverter-duty spindle motor.
   Cross-reference: `IMG_2065` documents a `Mitsubishi AC SPINDLE MOTOR TYPE
   SE-EV-FV` on this machine ([`photo_survey_misc.md`](photo_survey_misc.md)).
   *Verification:* one wide photo showing this terminal box and the motor
   nameplate `995196-03` in the same frame.

2. **`P.L.G.` = Pulse Generator, and this is the FR-SX's own motor feedback.**
   The name matches the "Motor-built-in PLG detector" row in the Mitsubishi
   detector table reproduced in
   [`frsx_orient_model.md`](frsx_orient_model.md#target-position-is-set-by-drive-hardware--parameters),
   where PLG lands on drive connector **CN5**. The ±15 V rails (`P15C`/`N15C`)
   and analog ground (`AGA`) on the same connector are consistent with a
   drive-powered detector, not an NC-powered one.
   *Verification:* trace the 9-pin AMP connector's cable to the FR-SX and confirm
   it terminates at CN5.

3. **`PA`/`RA` and `PB`/`RB` are two channel pairs.** `PA`/`PB` are the two
   quadrature phases; `RA`/`RB` are most plausibly their returns or complements.
   **This is a guess about the electrical format and must not be built on.**
   *Verification:* FR-SX / motor manual, or scope both pairs against `COM` and
   `AGA` while the spindle is barred over by hand.

4. **`OHS1`/`OHS2` is the Klixon thermostat already on record.** The spindle
   motor nameplate (`IMG_2065`) lists a `Klixon thermal protector
   9700L-246-215 (open 150 °C / close 99 °C)` — a normally-closed bimetal
   contact, which matches the series-contact symbol on the plate. The plate's
   "do not supply power" warning then reads as *this is a sensing contact, not a
   load-switching contact* — sense it at low voltage/current only.
   *Verification:* cold continuity check across `OHS1`–`OHS2` (expect closed).

5. **The `OH` line on the p090 `MS3108B 20-29P` connector is this motor's
   overheat sensor.** See the open question below — this is the thread worth
   pulling.

---

## Open questions

### Is the p090 "spindle rotary encoder" this same device?

[`wiring/estop_wiring_path_asbuilt.md`](../wiring/estop_wiring_path_asbuilt.md#bonus-finding-answers-an-open-servo-doc-question)
records, from OEM dwg **4143075301** (PDF p090), a **spindle rotary encoder** on
an **`MS3108B 20-29P`** connector with map
`A=PA, B=SC, C=PE, H=PSH, K=OH, N=PA, P=SC, R=PB`.

Points **for** them being the same device:
- `PA` and `PB` appear in both pin maps.
- Pin `K = OH` is an **overheat** line — an overheat sensor is a *motor-mounted*
  device, so that connector plausibly serves this motor box.

Points **against**:
- The pin sets otherwise disagree: the plate has `RA`/`RB`/`AGA`/`P15C`/`N15C`/
  `COM`, while p090 has `SC`/`PE`/`PSH`.
- The connector families differ (`MS3108B` circular vs `AMP-350720-1`).
- `A=PA` and `N=PA` both appear in the p090 transcription, which suggests at
  least one entry is a transcription artifact (likely a complement, e.g. `*PA`).

Most likely reading, **unproven**: the AMP 9-pin is the connector *at the motor
box*, and the `MS3108B` is a downstream harness connector carrying the same
feedback plus the thermal lines — but the differing pin names mean this cannot be
asserted. **Do not merge the two records** in the pin authority until traced.

*Verification:* re-read dwg 4143075301 p090 at 300 DPI for the full connector
map, then continuity-trace from the AMP 9-pin at the motor box to the `MS3108B`
shell.

### Count discrepancy

The Mitsubishi detector table in
[`frsx_orient_model.md`](frsx_orient_model.md) lists the motor-built-in PLG as
**4096 (multi-point)**. This device's nameplate says **512 counts/turn**. The
table is quoted from the **MDS-CH** generation manual, a later family than this
1984/85 FR-SX; the mismatch is expected and is **not** evidence that either
source is wrong about this machine. Do not use `4096` for this motor.

If `PA`/`PB` are quadrature, 512 counts/turn implies 2048 edges/rev — arithmetic
only, not a device specification.

---

## What this does **not** resolve

The FR-SX orient follow-up in
[`frsx_orient_model.md`](frsx_orient_model.md#follow-up-work-required) asks which
detector mode is provisioned (`#41 OSL` = magnetic sensor / encoder / PLG).

This evidence proves **a PLG physically exists on the motor**. It does **not**
prove the drive is configured to orient from it. `#41 OSL = 0` is now plausible,
but the machine may still orient from a magnetic sensor or a machine-side encoder
on CN6 — and the p090 `MS3108B` device remains unaccounted for. **Only the FR-SX
parameter dump settles `#41 OSL` and the `SP037` bits.** That checklist item
stays open, now narrowed rather than closed.

---

## Retrofit implications

1. **Do not allocate this to Mesa in the pin authority.** The `SPINDLE_ENCODER`
   row in [`current_pin_authority.csv`](../mesa/current_pin_authority.csv)
   stays `UNBOUND` — permanently, per the
   [design decision](#design-decision--linuxcnc-does-not-read-spindle-position)
   above. It describes a *machine-side A/B/Z spindle encoder*, which this PLG is
   not.

2. **Do not parallel-tap the PLG for LinuxCNC.** If the FR-SX closes its speed
   loop on this device, bridging a second receiver onto the same conductors risks
   loading or corrupting the drive's feedback and destabilising the spindle. Any
   future LinuxCNC spindle position would need either a buffered/isolated
   distribution of the signal or an independent encoder on the spindle nose.
   Treat as a design rule until proven otherwise against the FR-SX manual.

3. **±15 V is not a 24 V field signal and not necessarily RS-422.** Whatever the
   format turns out to be, it cannot land on bare 7i80HDT P3 FPGA GPIO. This
   reinforces claim audit
   [#11](claim_audit_2026-08-07.md) and the S-1 cable note in
   [`grounding_shielding_plan.md`](grounding_shielding_plan.md#possible-spindle-feedback-cable-s-1).
   `num_encoders=0` remains correct.

4. **512 counts/turn is low for spindle-synchronised motion** — a further point
   against, though moot given the gearbox and missing index above.

5. **`OHS1`/`OHS2` is a candidate motor-overheat input.** It is a dry NC contact
   per inference 4, so it can cross to a 7i84U input through the standard
   interposing-relay boundary. It is **not currently allocated**, and the
   existing `THERMAL_ALARM_CHAIN` record
   ([`commissioning_logs/find_list_2026-08-08.md`](commissioning_logs/find_list_2026-08-08.md))
   already tracks `X73 THR.M` / `X7B ONT.M` — establish whether this motor's OHS
   is already in that chain before proposing a new input.

---

## Correction to `servo_amp_analysis.md` §1.5

[`servo_amp_analysis.md`](servo_amp_analysis.md) §1.4/§1.5 state:

> "Motor built-in feedback | Motor has a built-in magnetic PA/PB pickup"
> "FR-SX motor has an internal magnetic pickup used for its own speed loop"

**The nameplate says `OPTICAL SHAFT ENCODER`.** The `PA`/`PB` signal naming that
prompted "magnetic" is correct, but the transducer is optical. The affected lines
have been corrected and now point here.

The rest of that section's structure survives: the motor does have its own
built-in detector for the drive's speed loop, and it remains an open question
whether the separate machine-side "SPINDLE ENCODER" on the schematics is a second
physical device.

---

## Photo IDs to backfill

| # | Subject | Camera ID |
|---|---|---|
| 1 | Terminal box open, `SU`/`SV`/`SW` splices held clear, encoder visible | _pending_ |
| 2 | Wiring plate `889515-01` (P.L.G. pin table, OHS warning) | _pending_ |
| 3 | Encoder nameplate close-up (`TS1526N55`, 512 c/t, ±15 V) | _pending_ |
| 4 | `OHS1`/`OHS2` splices + Mitsubishi cap `No. A6022` | _pending_ |
| 5 | Wide shot of the whole terminal box | _pending_ |

---

## Next verification steps

- [ ] Read dwg **4143075301** (PDF p090) at 300 DPI; capture the full
      `MS3108B 20-29P` map and settle the `A=PA` / `N=PA` artifact.
- [ ] Continuity-trace the motor-box `AMP-350720-1` 9-pin to its far end;
      confirm whether it reaches FR-SX **CN5** and/or the `MS3108B`.
- [ ] Dump FR-SX parameters `#41 OSL` and `SP037` (`plgo` / `enco` / `nsno`) —
      this is the item that closes the orient-detector question.
- [ ] Cold-continuity check `OHS1`–`OHS2`; confirm NC and cross-reference against
      the existing `THERMAL_ALARM_CHAIN` record.
- [ ] Photograph the spindle nose / head for a *second*, machine-side encoder.
      If none exists, the p090 device and this PLG are the same and the records
      merge.
- [ ] File the five photos in Drive and backfill the camera IDs above.
