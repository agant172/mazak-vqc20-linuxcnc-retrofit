# FR-SX orient detector — how to actually find out

**Purpose:** determine which detector the FR-SX orients from on **this** machine.
**Status:** capture procedure. Nothing here is a finding.

---

> ## ⚠️ LARGELY SUPERSEDED 2026-08-13 — the FR-SX manual is now in the repo
>
> `docs/OEM Manuals/…BCN-21735-S5.pdf`, findings in
> [`frsx_maintenance_manual_notes.md`](frsx_maintenance_manual_notes.md).
>
> **The headline question is answered.** §5.2: the `SX-CPU2` card is used "when
> the controller unit is equipped with **1024P×4/Rev. encoder type multi-point
> orientation**" — and this machine has an `SX-CPU2`. **This drive orients from
> an encoder, not a magnetic sensor.** No cable trace was needed; the card's
> presence is the configuration.
>
> **What is still worth doing at the machine, now much shorter:**
>
> | # | Read | Why |
> |---|---|---|
> | 1 | **`PIN11`** on the SX-CPU2 — "A" or "B" | "B" means the orient encoder is **powered by the NC**. Removing the Mazatrol would kill it. Covers off, no power. |
> | 2 | `PIN12`/`PIN13` strapping | source vs sync input, different circuits |
> | 3 | `SW2-1/5/6/7` positions | 2nd positioning loop gain |
> | 4 | Locate the **1024 ppr orient encoder** and read its nameplate | the drive requires one; likely the `MS3108B` device |
> | 5 | Photograph all SX-CPU2 DIP banks, positions legible | the card *is* the configuration |
>
> The PLG cable trace in step 1 below is still worth doing — it distinguishes the
> speed PLG from the orient encoder — but it is no longer the thing that answers
> "which detector".
>
> Everything below predates the manual. Kept for provenance.

## Read this before you go looking for `SP037`

`docs/project_status.md` used to say the FR-SX parameter dump was *"the single
item that closes the orient-detector question."* **That was overstated.**

`#41 OSL` and `SP037.plgo/enco/nsno` are quoted in
[`frsx_orient_model.md`](frsx_orient_model.md) from the **MDS-CH** instruction
manual — a **later Mitsubishi generation** than this drive. That document already
carries a standing warning that the whole orient model is unverified for this
machine. So:

> **There is no evidence that a parameter called `SP037` exists on a 1985
> FR-SX.** Going to the machine to "dump `SP037`" may find nothing, and finding
> nothing would prove nothing.

Two further reasons to expect configuration *not* to live in a parameter table:

- The FR-SX is an **analogue-era drive**. Its speed reference is ±10 V on the
  SX-AJ / SX-IO1 card set, and orient is an **option card** (`SF-On` / `SPOR`) —
  not integral to the base drive ([`servo_amp_analysis.md`](servo_amp_analysis.md) §1.4).
- The SX-CPU2 board is configured **by sticker**: `BASE 1500 RPM / TOP 6000 RPM`
  is written on the board itself ([`photo_survey_misc.md`](photo_survey_misc.md)).
  A drive whose speed range is recorded on a label is usually set up with
  jumpers, DIP switches and pots — not a parameter menu.

So the question is not "what is `SP037` set to". It is **"which detector is this
drive physically wired to, and what selects it?"**

---

## Step 1 — Trace the PLG cable. No power needed. Do this first.

This is the most certain answer available and it costs nothing.

The Mitsubishi detector table maps **detector → drive connector**:

| Detector | Drive connector |
|---|---|
| Magnetic sensor | `CN6` |
| External encoder | `CN6` |
| **Motor-built-in PLG** | **`CN5`** |

We already know this machine **has** a motor-built-in PLG — Tamagawa
`TS1526N55`, on a 9-pin `AMP-350720-1` connector in the spindle motor's terminal
box ([`spindle_motor_plg_encoder.md`](spindle_motor_plg_encoder.md)).

**Follow that 9-pin cable from the motor terminal box to the drive and read
which connector it lands on.**

| What you find | What it means |
|---|---|
| Lands on **`CN5`** | The drive is wired for **PLG orient**. Strong answer. |
| Lands on **`CN6`** | The connector mapping from the later manual does not transfer to this generation — record it and stop relying on that table. |
| Goes somewhere else entirely | Record where. The PLG may serve only the speed loop, with orient coming from elsewhere. |
| **Nothing lands on the orient detector inputs** | Orient may not be provisioned at all on this machine, despite the `ORIENTATION (OPT)` indicator on the fault plate. |

Photograph the drive end with the connector designation legible in the same
frame — that is what makes it evidence rather than a note.

---

## Step 2 — Photograph the configuration hardware

Whatever selects orient mode on a drive of this era is likely visible. Capture,
straight on and legible:

- **SX-CPU2** board — any DIP switch banks, rotary switches, jumpers, links, and
  **every sticker or hand annotation**. The `BASE 1500 / TOP 6000` sticker proves
  this drive carries setup information physically.
- **SX-101** board — same.
- **SX-AJ / SX-IO1 / SPOR** cards if fitted — the orient option lives here.
- The **fault/indicator plate**, including whether `ORIENTATION (OPT)` is
  actually populated rather than just printed.
- Any **service label inside the drive door**.

Record switch *positions*, not just presence. A photo of a DIP bank is only
useful if you can see which way each switch is thrown.

---

## Step 3 — The M-2 CRT parameter screens

This is the route that already worked: `parameters_sn060231.md` was built from
photographs of the running Mazatrol CRT, and
[`parameter_recovery.md`](parameter_recovery.md) already asks for **every page**
of the PARAMETER screens.

While you are in there, capture the **spindle-related** pages specifically.
Spindle parameters on an M-2 may live in the NC rather than the drive, in which
case they will be here.

⚠️ **This step needs the machine powered.** That is a hold point, not a casual
step — see the staged commissioning sequence in `CLAUDE.md`. If the machine is
being powered for other reasons anyway, fold this in; do not power it solely for
this.

---

## What each outcome changes

| Outcome | Consequence |
|---|---|
| PLG confirmed as the orient detector | The orient model in `frsx_orient_model.md` firms up; `mazak_orient.comp` timing can be measured against a known detector. |
| A magnetic sensor or separate encoder turns out to be wired | The `MS3108B` open question in `spindle_motor_plg_encoder.md` likely resolves at the same time — that would be the second device. |
| Orient is not provisioned | ATC design changes materially. Orient is a prerequisite for tool change; this would be the most consequential finding on the list. |

**None of this changes the LinuxCNC spindle-position decision.** LinuxCNC still
does not read spindle position — orient is the drive's job either way
([`spindle_motor_plg_encoder.md`](spindle_motor_plg_encoder.md#design-decision--linuxcnc-does-not-read-spindle-position)).
What this determines is how orient behaves and what `mazak_orient.comp` must
wait for, not who owns the feedback.

---

## The document that would settle all of it

The **FR-SX interface / maintenance manual** is not in the repo, and its absence
is why this procedure is a hunt rather than a lookup.
[`servo_amp_analysis.md`](servo_amp_analysis.md) open item 6 already tracks
finding it. If it turns up, most of the above becomes a five-minute read.

Manuals for the other cards in the stack are committed under
`docs/Mesa Manuals/`; the FR-SX has no equivalent. Worth an hour of searching
before an afternoon of probing.

---

## Capture sheet

| # | Item | Value / photo ID | Notes |
|---|---|---|---|
| 1 | PLG 9-pin cable lands on drive connector | | `CN5` / `CN6` / other |
| 2 | Anything else on `CN5` | | |
| 3 | Anything else on `CN6` | | |
| 4 | SX-CPU2 DIP / rotary / jumper positions | | |
| 5 | SX-CPU2 stickers and annotations | | |
| 6 | SX-101 DIP / jumper positions | | |
| 7 | Orient option card fitted? (`SF-On` / `SPOR`) | | |
| 8 | `ORIENTATION (OPT)` indicator populated? | | |
| 9 | Drive-door service label | | |
| 10 | M-2 CRT spindle parameter pages | | powered step |
| 11 | Any parameter resembling `OSL` / detector select | | may not exist |

File photos per [`README_photo_sorting.md`](README_photo_sorting.md) under
`02_Drives`, and cite them as `YYYY-MM-DD/IMG_nnnn`.
