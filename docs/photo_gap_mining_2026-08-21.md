<!-- Mining the consolidated photo set for data that fills documented gaps, 2026-08-21. -->

> **ROLE: REFERENCE** — backfills the 35 `_pending_` photo-ID rows across three
> documents and records what the newly surveyed frames do and do not settle.
> Photo locations: [`photo_drive_layout_2026-08-21.md`](photo_drive_layout_2026-08-21.md).
> See [../INSTALL_SPINE.md](../INSTALL_SPINE.md).

# Photo gap-mining — 2026-08-21

305 photos from the Photos "Mazak" album postdate
[`photo_survey_misc.md`](photo_survey_misc.md) (2026-07-29) and the OneDrive store
(last written 2026-07-21), so they had never been surveyed. All dates below are
**local** — see the layout document for why that matters.

## 1. Spindle PLG encoder — nameplate fully legible

`2026-08-12/IMG_0600__dup2` (`03_Motors_Feedback`):

| Field | Value |
|---|---|
| Device | `OPTICAL SHAFT ENCODER` |
| Counts | `512 COUNTS/TURN` |
| Type | `TS1526N55` |
| Serial | `A6022` |
| Date | `1984.6` |
| Supply | `DC ±15V` |
| Maker | `TAMAGAWA SEIKI CO.,LTD. JAPAN` |

The encoder serial `A6022` **matches the Mitsubishi cap stamped `NO. A6022`** in
`2026-08-12/IMG_0604__dup2`. [`spindle_motor_plg_encoder.md`](spindle_motor_plg_encoder.md)
previously had the "capped device is the encoder" identification on owner testimony
only; it is now photographic.

## 2. Head device placard — existing transcription confirmed

`2026-08-12/IMG_0631` (`07_Reference`) is a square-on read of plate
**`24136209710`**. Every row matches
[`../wiring/head_device_placard.md`](../wiring/head_device_placard.md) exactly,
including the two easy-to-misread entries: `WORK AIR BLAST` = **`SOL-16`** (not
`SOL-6`) and `HEAD LUBE PRESSURE` = **`PS-5`** (not `PRS-5`). No correction needed —
the transcription was right and now has a citable source.

## 3. Y-axis linear scale — still open, and harder to explain away

[`photo_survey_misc.md`](photo_survey_misc.md) item 5 lists the Y-axis
Magnescale/linear-scale question as an open re-shoot target.

The 2026-08-15 feedback batch (23 frames, `IMG_0670`–`IMG_0692`) is the most
thorough look at the feedback devices so far. It shows **only** Tamagawa pickup
units, a Mitsubishi `OPTICAL SHAFT ENCODER` (`IMG_0682`, `IMG_0683`), a
`BRUSHLESS DC GENERATOR` tachogenerator (`IMG_0685`) and motor terminal boxes.

Still **no linear scale of any make**.
[`feedback_nameplate_survey_2026-08-15.md`](feedback_nameplate_survey_2026-08-15.md)
covers this batch's nameplates but does not address the scale question either. This
does not close the question, but three separate sessions have now examined the
feedback devices without finding one.

The remaining documentary route is `MP8`–`MPB` (linear-scale gains) on
**MACH CONSTANT PAR NO.1/NO.3** — which
[`crt_screen_survey_2026-08-21.md`](crt_screen_survey_2026-08-21.md) confirms has
never been photographed.

## 4. Resolver TYPE stamps — no new information, and a correction

An earlier pass on this batch concluded from the photographs that the
`RT-☐X☐-☐☐` TYPE boxes were **never stamped**, and recommended closing the
re-shoot item. **That conclusion was wrong and is retracted here.**

[`feedback_nameplate_survey_2026-08-15.md`](feedback_nameplate_survey_2026-08-15.md)
records `RT-5X8-1?` read **by eye at the machine** on both X and Y, with the stamps
described as faded and "ink too faded to photograph". The boxes photographing as
clean-empty is consistent with that description — faded stamps, not blank plates.

**Settled 2026-08-21 (owner).** The stamps are not recoverable at all: **coolant
has faded the ink used to populate the boxes**, and magnification has been tried to
exhaustion both on the machine and on these photographs. So the boxes really are
empty *as imaged* — my observation was sound, my inference from it was not. The
cause is lost ink, not an unstamped plate, and the practical consequence is the
same either way: **no further photography will recover the TYPE suffix.** The
re-shoot item is closed; the Tamagawa datasheet is the only remaining route.

What the photographs *do* corroborate: the faint `…6?86` in the SER NO. box of
`2026-08-15/IMG_0671` matches the survey's `A6986`, identifying that frame as the
**Y** pickup.

---

## 5. Photo-ID backfill

`✅` = frame read and matched to the row's description unambiguously.
`~` = matches by subject and session; individual frame not separately confirmed —
**verify before relying on it**.

### [`spindle_motor_plg_encoder.md`](spindle_motor_plg_encoder.md) — 15 rows, all `2026-08-12`

| # | Subject | Camera ID | |
|---|---|---|---|
| 1 | Terminal box open, splices held clear | `IMG_0602__dup2` | ~ |
| 2 | Wiring plate `889515-01` | `IMG_0607__dup2` | ✅ |
| 3 | Encoder nameplate (`TS1526N55`, 512 c/t, ±15 V) | `IMG_0600__dup2` | ✅ |
| 4 | `OHS1`/`OHS2` splices + Mitsubishi cap `No. A6022` | `IMG_0604__dup2` | ✅ |
| 5 | Wide shot of the terminal box | `IMG_0603__dup2` | ~ |
| 6 | Whole motor on the head | `IMG_0610__dup2` | ~ |
| 7 | Closer; nameplate incl. `CONTROLLER TYPE FR-SX` | `IMG_0615__dup2` | ✅ |
| 8 | Down into the terminal box, encoder centred | `IMG_0611__dup2` | ~ |
| 9 | Wider context — head, lube manifold, ATC | `IMG_0612__dup2` | ~ |
| 10 | Head from front, splash-guard open, placard visible | `IMG_0617__dup2` | ~ |
| 11 | Same closer — hydraulics, lube pump, gearbox | `IMG_0619__dup2` | ~ |
| 12 | Motor nameplate sharp (`SE-EV-FV`, ratings, Klixon) | `IMG_0616__dup2` | ✅ |
| 13 | Motor nameplate in context below blower | `IMG_0615__dup2` | ✅ |
| 14 | Wiring plate `889515-01` re-shot, sharper | `IMG_0614__dup2` | ✅ |
| 15 | Head device placard sharp — dwg `24136209710` | `IMG_0631` | ✅ |

Rows 7 and 13 resolve to the same frame; `IMG_0609__dup2` and `IMG_0613__dup2` are
further frames of the same subject if one-per-row is wanted.

### [`../wiring/head_valve_hardware.md`](../wiring/head_valve_hardware.md) — 10 rows, all `2026-08-12` local

| # | Subject | Camera ID | |
|---|---|---|---|
| 1 | Wide — placard on guard wall, head stack right | `IMG_0632` | ~ |
| 2 | Head stack closer — Nachi, CKD, speed controllers | `IMG_0633` | ~ |
| 3 | Two CKD solenoid nameplates close | `IMG_0637` | ✅ |
| 4 | CKD manifold + speed controllers | `IMG_0636` | ~ |
| 5 | Nachi valve stack — gauge, `OIL PRESSURE` tag | `IMG_0644` | ~ |
| 6 | Nachi `MODULAR VALVE` nameplate `OY-G01-T-11` | `IMG_0645` | ~ |
| 7 | Valve stack side — coils, DIN connectors, subplates | `IMG_0648` | ~ |
| 8 | Valve stack closer — `OIL PRESSURE` `85 kgf/cm²` | `IMG_0649` | ~ |
| 9 | Gauge face straight on — OSAKA, needle at zero | `IMG_0642` | ✅ |
| 10 | `PS 5` tag with wire `355`/`G24` | `IMG_0641` | ~ |

> The document's "photographed 2026-08-13" is a UTC artefact. Local date is
> **2026-08-12**, the same session as the spindle batch above.

### [`../wiring/cabinet_asfound_survey.md`](../wiring/cabinet_asfound_survey.md) — 10 rows, all `2026-08-12` local

| # | Subject | Camera ID | |
|---|---|---|---|
| 1 | Starter panel — contactors, overloads, breakers | `IMG_0657` | ~ |
| 2 | Control gear — relays, protectors, receptacle | `IMG_0656` | ~ |
| 3 | Strip A close-up with meter probe | `IMG_0655` | ✅ |
| 4 | Strip B — `P24`/`G24`, `EFHD`, `RCTLS`, `ISP`/`OSP` | `IMG_0654` | ✅ |
| 5 | Strip C — safety chain, `EMB`, `MAR` | `IMG_0653` | ✅ |
| 6 | Strip C close — `*DEC4`, `152`/`151`, `146`/`144`, `+24V` | `IMG_0661` | ✅ |
| 7 | Strip C safety block — `58`, `57B`, `57A`, `57`, `60`, `EMB` | `IMG_0662` | ✅ |
| 8 | Strip A upper — `410`…`34`, `21A`/`21`/`26`/`25` | `IMG_0660` | ✅ |
| 9 | Strip A `16` block + `G` earth, meter probe | `IMG_0659` | ✅ |
| 10 | Strip A lower — `15`, `XB`, `XA1`, `16`, `10`, `XA`, `R12`/`S12`/`T12` | `IMG_0658` | ✅ |

`IMG_0651` and `IMG_0652` are further wide frames of Strip A.

## 6. Not yet mined

- **`2026-08-16`** (12 frames, `IMG_0698`–`IMG_0709`) — hand-held DIN connectors and
  card racks; likely bears on the CNA/CN pinout work.
- **`2026-08-09`** (46 frames) and **`2026-08-02`** (31 frames) — not cross-checked.
