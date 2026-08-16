# FR-SX maintenance manual — what it settles

> **ROLE: REFERENCE** — what the committed FR-SX maintenance manual settles (orient detector, SX-CPU2, PIN11, ST2). Consulted for the open SSET/FR-SX terminal question. See [../INSTALL_SPINE.md](../INSTALL_SPINE.md).


**Source:** `docs/OEM Manuals/Mitsubishi_FR-SX_Spindle_Drive_Maintenance_Manual_BCN-21735-S5.pdf`
Mitsubishi document **`BCN-21735-S5`**, *AC SPINDLE DRIVE CONTROLLER TYPE FR-SX
MAINTENANCE MANUAL*.
SHA-256 `4073085464c712b0a3a3503291331bcd8fd07e3354249d72943116e9b06112f0`

This is the drive manual [`servo_amp_analysis.md`](servo_amp_analysis.md) open
item 6 has been asking for. It is now a **committed primary source** and
outranks the MDS-CH / FREQROL-SF borrowings that the orient model was built on.

> ## ⚠️ The scan is INCOMPLETE
>
> 41 PDF pages covering **printed pages 1–38 only**. PDF page = printed page + 3.
>
> **Missing — do not assume these were checked:**
> - §5.4 `SX-PW` card, §5.5 `SX-AJ` card
> - **CHAPTER 6 in its entirety — "SPINDLE ORIENT POSITION DETECTOR
>   INSTALLATION PROCEDURE"** (magnetic-sensor principle, timing chart, magnet
>   and sensor installation direction and cautions, overall views). Printed
>   pages ~52 onward.
>
> Chapter 6 matters less than it first appears — see finding 1 — but if a
> complete copy turns up, get it.

---

## Finding 1 — this drive has ENCODER-type orientation, and the card proves it

**§5.2, printed page N/29, verbatim:**

> **5.2 SX-CPU2 card**
> "When the controller unit is equipped with **1024P×4/Rev. encoder type
> multi-point orientation**, this card is used."

**This machine has an SX-CPU2 card.** `photo_survey_misc.md` records it as
`SX-CPU2`, part no. **`BD625A552H04`**, photographed repeatedly (`IMG_0292`,
`IMG_0294`, `IMG_0406`–`IMG_0408`).

**Therefore the FR-SX on this machine is equipped with encoder-type,
multi-point orientation at 1024 pulses/rev × 4 = 4096 counts/rev.** The card's
presence is the configuration — no parameter read required.

Magnetic-sensor single-point orientation uses a different card (§5.1
`SX-CPU0`/`SX-CPU1`). That is why Chapter 6.1, which covers magnet and sensor
installation, is unlikely to apply here.

### What that resolves

**The `512` vs `4096` discrepancy is explained.** The repo flagged that the
motor's PLG is 512 counts/turn while the Mitsubishi detector table said 4096.
They are **two different devices**:

| Device | Resolution | Role |
|---|---|---|
| Motor built-in PLG — Tamagawa `TS1526N55` | **512 counts/turn** | **Speed feedback** (sine-wave PLG on the drive's speed loop) |
| Orient position encoder | **1024P × 4/rev = 4096** | **Orient position detection** |

**This strongly supports the `MS3108B 20-29P` "spindle rotary encoder" being a
real, separate device** — the orient encoder — rather than another view of the
motor PLG. That open question in
[`spindle_motor_plg_encoder.md`](spindle_motor_plg_encoder.md) now has a
mechanism behind it: an encoder-orient drive *needs* a 1024 ppr encoder, and the
motor's 512 c/t PLG cannot be it.

**Still not proven:** that the `MS3108B` device *is* that encoder, or where it is
mounted. The drive requires one; the schematics show one; nobody has traced them
together.

---

## Finding 2 — `PIN11` decides who powers the orient detector

**SX-CPU2 card, printed page N/37, verbatim:**

> **`PIN11` — ORIENT POSITION DETECT PLG ON/OFF**
> "**A**" side should be set to supply the power source to orient position detect
> pulse generator **from the spindle control unit**.
> "**B**" side should be set to supply the power source to orient position detect
> pulse generator **from the NC**.

**This is a retrofit landmine.** If this machine is strapped to **"B"**, the
orient position encoder is powered *by the Mazatrol NC* — and **removing the NC
kills the orient detector**, silently, with no wiring change to point at.

**Read this jumper.** Covers off, no power needed. If it is on "B", either move
it to "A" (drive-powered) or provide the encoder supply from the retrofit side —
a decision that must be made before the NC comes out, not after.

Adjacent on the same card: **`PIN12` / `PIN13` — ORIENT POSITION INPUT**,
strappable for **source input** (`PIN12→A`, `PIN13→D`) or **sync input**
(`PIN12→B`, `PIN13→C`), with different input circuits (3.3 kΩ / 24 V). Record
these positions too.

---

## Finding 3 — the drive can test orient by itself

**SX-CPU2 toggle switches, printed page N/37:**

| Switch | Name | Behaviour |
|---|---|---|
| `ST1` | `RESET` | Initialises the inverter. **"Whenever DIP switch setting is changed, this should be operated."** ⚠️ **"DO NOT RESET WHILE THE MOTOR IS RUNNING."** |
| `ST2` | `ORIENTATION TEST` | "The motor runs at *orientation speed* while this switch is held at ON position. When the switch is set to OFF, the motor stops after the completion of one cycle of orientation." |

**`ST2` is a standalone orient test.** Orient can be exercised and tuned from the
drive itself, with **no NC and no LinuxCNC involved**. That is a materially safer
commissioning path than asserting `ORCM1` and hoping: prove orient works on the
drive first, then wire the command.

It also means orient can be verified **before** the Mazatrol is removed, while
there is still a working reference to compare against.

---

## Finding 4 — real numbers for the orient sequence

**§3.3 (2) "Encoder type spindle orientation", printed page N/17:**

- **Orientation speed: 80–155 rpm** ("usual operation speed RPM").
- **2nd positioning loop gain** selected by **`SW2-1` / `SW2-5` / `SW2-6` /
  `SW2-7`**, Low ↔ High.
- Tuning guidance: *"When the spindle stops running over the predetermined stop
  position (indexing position) — decrease 1st positioning loop gain, increase
  orientation speed."*

[`frsx_orient_model.md`](frsx_orient_model.md) currently says no source
establishes an arrival-time range. It still doesn't give a *time*, but an
orientation speed of 80–155 rpm is the first hard number for the timing budget,
and the loop-gain switches are what the arrival behaviour will be tuned with.

---

## Finding 5 — auxiliary function signals, confirmed

**§2.2 (3) "Auxiliary functions", printed page N/6:**

| Function | Manual text | Repo cross-reference |
|---|---|---|
| **SPINDLE ORIENT (Optional function)** | "Magnetic sensor type single-point indexing and encoder type multi-point indexing are possible. With orientation start signals **(`ORCM1`, `ORCM2`)**, start command signal, complexion signal and orientation completion signal are output." Output: **contacts open** | Confirms `ORCM1` — the repo has `Y093 ORCM1.M`. Note **`ORCM2` also exists**; the repo tracks only `ORCM1`. |
| **ZERO SPEED SIGNAL** | Contacts close when motor speed falls below **50 or 20±10 rpm**. Machine interlock. Open emitter | The `SZS` input (7i84U-A IN5). First real threshold. |
| **THRESHOLD SPEED SIGNAL** | Transistor turns on when speed is within **±15 % of preset speed**. Open emitter | The "speed reach" input (IN13). |
| **LOAD DETECT (CURRENT)** | Turns on when slippage exceeds 110 %, near the 120 % limit. "For prevention of plunging of cutter" | Not currently in the pin authority. |
| **OVERRIDE** | Range **50–120 %**; "override can be reset by opening controller terminal **`DEF`**" | New terminal name — `DEF`. |
| **TORQUE LIMIT** | "When gearing is shifted, spindle motor is run with a temporarily reduced torque." Open emitter | **Directly relevant to `mazak_orient.comp` gear-shift logic** — the OEM reduces torque during a shift. |

Two things worth acting on: **`ORCM2` exists and is untracked**, and **torque
limit during gear shift** is OEM behaviour the retrofit's gear sequence should
reproduce or consciously drop.

---

## What this does *not* change

**The LinuxCNC spindle-position decision stands.** Orient remains the drive's
job — discrete command in, completion signal out. `num_encoders=0`, P3 empty,
`SPINDLE_ENCODER` `UNBOUND` are unaffected. The orient encoder belongs to the
FR-SX, exactly as the motor PLG does.

---

## Open, with the next step named

| Question | Next step |
|---|---|
| Is the `MS3108B` device the 1024 ppr orient encoder? | Trace it to the drive; read its nameplate for a pulse count |
| Is `PIN11` on "A" or "B"? | Read the jumper — covers off, no power |
| `PIN12`/`PIN13` source vs sync strapping | Read and record |
| `SW2-1/5/6/7` loop-gain positions | Photograph the DIP banks, positions legible |
| Chapter 6 content | Find a complete scan |
| `ORCM2` — is it wired on this machine? | Check the element list and the terminal unit |
