# Spindle motor built-in PLG encoder — nameplate evidence

**Machine:** Mazak VQC 20/40B SN 060231
**Evidence:** fifteen owner-supplied photographs, reviewed 2026-08-12 — five
inside the AC spindle motor's terminal/junction box, four of the motor in situ
on the spindle head, five wide/close frames including a fully legible motor
nameplate, and one close-up of the head device placard.
**Where to find it:** **up on the spindle head.** The AC spindle motor is
mounted **vertically on the head, driving downward** into the head/gearbox.
Stacked top-to-bottom: **terminal box (the PLG lives in here) → blower/fan
housing → motor body with its nameplate → drive end into the head.** So the
encoder is at the motor's **non-drive (upper) end**, above the fan — open the
box on top. Confirmed by in-situ photos 2026-08-12. Not in the cabinet.
**Status:** device **identified from nameplates**. Nothing here is
electrically verified, traced, or commissioned.

> **Photos are not committed** (repo policy: no raw photos — see
> [`photo_survey_misc.md`](photo_survey_misc.md)). File the fifteen originals in the
> Google Drive archive under `03_Motors_Feedback` (see
> [`README_photo_sorting.md`](README_photo_sorting.md)) and add their camera IDs to
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

> **Mitsubishi's own plate calls this device a tacho-generator.** The English
> reads `CONNECTOR WIRING OF P.L.G.`; the Japanese gloss immediately below it is
> **`タコジェネのコネクタ結線`** — *"connector wiring of the **tacho-gene**"*,
> `タコジェネ` being the standard Japanese contraction of タコジェネレータ,
> tachogenerator. So on this machine **"P.L.G." and "tacho generator" name the
> same physical device**: this optical pulse generator. That matters for the
> disputed "spindle tacho gen" legend entry — see
> [`../wiring/authority_conflicts.md`](../wiring/authority_conflicts.md) §4.

**Warning printed on the plate, verbatim:**

> `DO NOT SUPPLY POWER BETWEEN (OHS1) AND (OHS2).`
> `(端子(OHS1)と(OHS2)間には電圧を印加しないよう注意下さい。)`

### Motor nameplate — full legible transcription (batch 3)

Batch 3 (2026-08-12) includes a **sharp, fully legible** close-up of the motor
nameplate. This supersedes the partial read of `IMG_2065` recorded in
[`photo_survey_misc.md`](photo_survey_misc.md) and **corrects two values there**
(see [§Corrections to `photo_survey_misc.md`](#corrections-to-photo_survey_miscmd)).

| Field | Value as printed |
|---|---|
| Heading | `AC SPINDLE MOTOR` / `THREE PHASE INDUCTION MOTOR` |
| Type | **`SE-EV-FV`** — suffix now resolved |
| Poles | `POLE 4` |
| Frame | `L5-A112` (leading char reads `L`; `1` not fully excluded) |
| Rotor | `CAGE` |
| Insulation class | `F` |
| Ambient temp | `40 °C` |
| Weight | `65 kg` |
| Vibration class | `V-10` |
| Bearings | `6307 ZZC3` and `6306 ZZC3` |
| Thermal protector | `KLIXON 9700L-246-215`, `OPEN 150 °C` / `CLOSE 99 °C`, **`24VDC 12A / 115VAC 12A / 230VAC 9A`** |
| Blower | `IA-15040`, **`1Φ 2P`**, `INS.E`, `CAP. 0.8 µF`, `200/200V 50/60Hz`, `0.2/0.2A` |
| Serial | `D91400020` (worn; consistent with the `D9140002_0` read from `IMG_2065`) |
| Date | worn, not legible |
| Maker | `MITSUBISHI ELECTRIC CORPORATION, JAPAN` |
| Part no. | `995196-03` |
| Paired drive | **`CONTROLLER TYPE FR-SX`** |
| Warning sticker | `NO SHOCK AND NO USE OF FANCASE FOR LIFTING` |

**Ratings table — two duty columns, which the earlier record did not
distinguish:**

| | \@1500 rpm | \@4500 rpm | \@6000 rpm |
|---|---|---|---|
| **`CONT`** (continuous) | 3.7 kW, 130 V, 28 A | 3.7 kW, 170 V, 20 A | 2.2 kW, 170 V, 13 A |
| **`1/2H`** (half-hour) | 5.5 kW, 130 V, 39 A | 5.5 kW, 170 V, 29 A | 3.7 kW, 170 V, 21 A |

Three things follow:

1. **`CONTROLLER TYPE FR-SX` on the motor's own plate** is primary-source
   confirmation of the motor↔drive pairing this repo had assembled from
   schematics and cabinet photos.
2. **The 5.5 kW half-hour rating corroborates the drive sizing.**
   `photo_survey_misc.md` identifies the drive as **`FR-SX-2-5.5K`** (5.5 kW,
   40 A) from the chassis tag and ratings table. The drive is sized to this
   motor's 30-minute rating, not its continuous rating — consistent, and worth
   remembering when interpreting any current/thermal limit.
3. **The blower is single-phase**, which resolves an ambiguity on the wiring
   plate — see below.

### The fan is 1-phase: `BW` is unused on this machine

The wiring plate draws `FAN-MOTOR` terminals `(BU)` `(BV)` `(BW)` with `BW`
**dashed** and annotated `IN CASE OF THREE PHASE MOTOR (三相モータの場合)`. The
motor nameplate settles which case applies here: the blower is **`1Φ 2P`,
200 V, 0.2 A, with a 0.8 µF run capacitor**.

So on this machine the fan uses **`BU` and `BV` only; `BW` is not used**. If the
retrofit ever powers or monitors the spindle blower, size it as a **single-phase
200 VAC ~0.2 A load** — and note that 200 VAC must not land on a 7i84U terminal;
it needs an interposing relay like the other 100/200 VAC loads.

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

1. ~~**This is the spindle motor, not an axis motor.**~~ **CONFIRMED — no longer
   an inference.** Owner confirmed 2026-08-12 that the encoder rides the
   **spindle motor's shaft**, and a second photo set the same day shows the
   whole assembly in situ with **the encoder box and the motor nameplate in one
   frame** — which is exactly the verification this entry originally called for.
   The motor nameplate reads `AC SPINDLE MOTOR` / `THREE PHASE INDUCTION MOTOR`,
   `POLE 4`, and **`CONTROLLER TYPE FR-SX`**, independently confirming the
   motor↔drive pairing this repo had assembled from schematics. (The type-suffix
   line is still only partly legible — consistent with the `SE-E_-FV` family
   already recorded from `IMG_2065`, suffix unresolved at this resolution.)
   Originally-reasoned support, now redundant: the axis drives are brushed-DC
   MELDAS HD / DK-427 with TS2014N resolvers, not 3-phase induction and with no
   separate fan motor; `SU`/`SV`/`SW` reads as **S**pindle U/V/W.
   **This is the load-bearing fact for the gearbox argument** in the design
   decision above: motor-shaft-driven means upstream of the 2-speed gearbox.

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

4. ~~**`OHS1`/`OHS2` is the Klixon thermostat already on record.**~~
   **CONFIRMED from the legible nameplate (batch 3).** The plate gives
   `KLIXON 9700L-246-215`, `OPEN 150 °C / CLOSE 99 °C`, and — decisively — a
   **switching rating of `24VDC 12A / 115VAC 12A / 230VAC 9A`**. A device with a
   contact rating is a **dry, normally-closed bimetal contact**, not a
   thermistor. That matches the series-contact symbol on the wiring plate.
   The plate's "do not supply power between OHS1 and OHS2" therefore reads as
   *do not treat these terminals as a power feed* — it is a protective sensing
   contact in series, not a load to be energised.
   **Retrofit consequence:** it is directly compatible with a 24 VDC sensing
   circuit and can cross to a 7i84U input through the standard interposing-relay
   boundary, well inside its 12 A rating. Still confirm it is not already
   consumed by the existing `THERMAL_ALARM_CHAIN` before proposing a new input.
   *Remaining check:* cold continuity across `OHS1`–`OHS2` (expect closed).

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
on CN6 — and the p090 `MS3108B` device remains unaccounted for.

**Capture procedure: [`frsx_orient_detector_capture.md`](frsx_orient_detector_capture.md).**
An earlier revision of this paragraph said "only the FR-SX parameter dump settles
`#41 OSL` and the `SP037` bits" — **that was overstated.** Those parameter
numbers come from the later MDS-CH manual and may not exist on a 1985 FR-SX. The
procedure leads with **tracing the PLG cable to its drive connector**, which is
more certain and needs no power. The item stays open, now narrowed rather than
closed.

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

## Corrections to `photo_survey_misc.md`

The batch-3 nameplate close-up is sharp where `IMG_2065` was not. Two values in
the `AC spindle motor` row of
[`photo_survey_misc.md`](photo_survey_misc.md#hardware-inventory-recovered-from-nameplates)
were misread and are corrected here:

| Field | Recorded from `IMG_2065` | Actual (batch 3) |
|---|---|---|
| Volts | `150`/170/170/`150`/170/170 | **`130`**/170/170 / **`130`**/170/170 |
| Amps | `26`/20/13/39/29/21 | **`28`**/20/13/39/29/21 |
| Type suffix | `SE-EV-FV` *(suffix uncertain)* | **`SE-EV-FV` — confirmed** |

Unchanged and now confirmed: kW 3.7/3.7/2.2 + 5.5/5.5/3.7, RPM
1500/4500/6000 ×2, part no. `995196-03`, Klixon `9700L-246-215`
(150 °C / 99 °C). The serial reads `D91400020`, consistent with the earlier
`D9140002_0`; the date field is worn beyond reading in both sets.

The six kW/V/A columns are **two duty ratings (`CONT` and `1/2H`), not six
winding taps** — the earlier record listed them as a flat sequence, which
obscured that. See the ratings table above.

## The splash-guard device placard — photographed, transcribed elsewhere

**Done 2026-08-12.** A close-up of the placard was taken and it is transcribed
in full in [`../wiring/head_device_placard.md`](../wiring/head_device_placard.md).
Plate drawing number `24136209710`.

Outcome, in short:

- It **corroborates nine pin-authority rows** — the gear-shift solenoids
  (`SOL-12` high / `SOL-13` low), the gear-confirm switches (`PRS-10` high /
  `PRS-12` low), `TOOL UNCLAMP SOL-10`, the tool clamp/unclamp pressure switches
  (`PRS-9`/`PRS-8`), and head-lube `PS-5`. It also **supports the `TOOL_CLAMP_SOL`
  PHANTOM call**: only one tool solenoid is drawn on the head.
- It **contradicts three** air/coolant solenoid identities. Recorded as
  [`../wiring/authority_conflicts.md`](../wiring/authority_conflicts.md) §5.
  Nothing was changed on the strength of it.

> **The earlier wide-shot read was wrong in 6 of 13 entries** — `PRS-3`/`PRS-4`
> (actually `PRS-9`/`PRS-8`), `SOL-33`, `SOL-36` for dust, `SOL-6`, `PRS-5`, and it
> missed `SOL-10` entirely. It was marked low-confidence and nothing was changed
> from it, which is why that error cost nothing. Small text in a wide frame is not
> a source.

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

**Batch 1 — inside the terminal box (2026-08-12):**

| # | Subject | Camera ID |
|---|---|---|
| 1 | Terminal box open, `SU`/`SV`/`SW` splices held clear, encoder visible | _pending_ |
| 2 | Wiring plate `889515-01` (P.L.G. pin table, OHS warning) | _pending_ |
| 3 | Encoder nameplate close-up (`TS1526N55`, 512 c/t, ±15 V) | _pending_ |
| 4 | `OHS1`/`OHS2` splices + Mitsubishi cap `No. A6022` | _pending_ |
| 5 | Wide shot of the whole terminal box | _pending_ |

**Batch 2 — motor in situ on the head (2026-08-12):**

| # | Subject | Camera ID |
|---|---|---|
| 6 | Whole motor on the head: terminal box → blower → motor body → drive end | _pending_ |
| 7 | Same view closer; motor nameplate incl. `CONTROLLER TYPE FR-SX` | _pending_ |
| 8 | Looking down into the terminal box from above, encoder centred | _pending_ |
| 9 | Wider context — head, lube manifold, ATC area | _pending_ |

**Batch 3 — wide context + legible nameplate (2026-08-12):**

| # | Subject | Camera ID |
|---|---|---|
| 10 | Head from the front, splash-guard open; device legend placard visible | _pending_ |
| 11 | Same view closer — hydraulics, lube pump, gearbox casting, placard | _pending_ |
| 12 | **Motor nameplate, sharp and fully legible** (`SE-EV-FV`, ratings, Klixon, blower) | _pending_ |
| 13 | Motor nameplate in context below the blower | _pending_ |
| 14 | Wiring plate `889515-01` re-shot, sharper than batch 1 | _pending_ |

**Batch 4 — device placard close-up (2026-08-12):**

| # | Subject | Camera ID |
|---|---|---|
| 15 | **Head device placard, sharp** — dwg `24136209710`; transcribed in [`../wiring/head_device_placard.md`](../wiring/head_device_placard.md) | _pending_ |

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
- [x] ~~Photograph the spindle nose / head for a *second*, machine-side
      encoder.~~ **Done 2026-08-12** — the head was photographed; the box on it
      is the spindle motor's own terminal box and the encoder in it rides the
      motor shaft (owner-confirmed). **No second, spindle-driven encoder was
      found.** This is evidence the p090 `MS3108B` device and this PLG are the
      same, but it is not proof — a device elsewhere on the head or drive train
      has not been positively excluded. Settle it by the p090 re-read and the
      continuity trace above, not by this photo alone.
- [ ] File the fifteen photos in Drive and backfill the camera IDs above.
