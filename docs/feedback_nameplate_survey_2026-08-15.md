# Feedback-device nameplate survey — 2026-08-15

Field reading by AG, from photographs taken in the cabinet/machine the same
day (photos on cloud storage per repo photo policy; not committed). Several
nameplates are faded and stamped digits are only partially legible — every
reading below carries its own confidence note, and nothing here is promoted
beyond a nameplate *reading*. The D8 worksheet's ohmmeter work is unaffected
and still required.

## Readings

| Device | Type | Spec no. | Ser no. | Parts no. | Date | Legibility |
|---|---|---|---|---|---|---|
| X resolver pickup | `RT-5X8-1?` (stamps faded) | BKO-NC6062 (A suffix uncertain) | A7003 | `TS2014N 25 E 8-1?` | 198_ | partial |
| Y resolver pickup | `RT-5X8-1?` (stamps faded) | BKO-NC6062A | A6986 | `TS2014N 25 E 3-1?` | 198_ | partial |
| Z tachometer | BRUSHLESS DC GENERATOR `TT-A-11`, 2V/1000 rpm | BKO-NC6075 | 23868 | TS3033N 4 E2 | 1984.5 | good |
| Z resolver pickup | `PICKUP UNIT`, TS2014N family (plate style N5399, same as X/Y) | **BKO-NC6062A (clearly legible)** | **7028** (read by eye 2026-08-16; ink too faded to photograph) | `TS2014N …` — stamped digits illegible; one frame hints `E3…` | 198_ | poor (borescope frames, glare) |
| Spindle encoder | Tamagawa OPTICAL SHAFT ENCODER, **512 counts/turn, DC ±15 V** | — | A6022 | **TS1526N55** | 1984.6 | good |

**Z resolver located and partially read (2026-08-15, second visit).** The
pickup can sits at the Z screw's non-drive end; borescope frames defeat the
stamped digits but the printed spec line is clear: **`BKO-NC6062A` — the same
spec as X and Y**, same TS2014N family and plate layout. All three axes carry
the same resolver spec. Only the stamped suffix digits remain unread; the
per-axis ohmmeter record is the stronger confirmation path regardless (same
one-high/two-matched DCR pattern across axes = electrically identical
windings).

**Serial read 2026-08-16, and the three axes are one batch.** A second borescope
set (15 frames) still defeated the stamped suffix, but the serial was read
directly off the plate by eye: **Z = 7028**. With **X = 7003** and **Y = 6986**
that is a spread of 42 — all three pickups came from the same production run,
which is the strongest available argument that they are electrically identical
even though no suffix has been read on any of the three.

**Why the digits keep failing, and how to beat it.** The borescope (`JLDV AC54`,
1920×1080) has its LED beside the lens, so it throws specular glare straight back
off a polished plate; the stamped characters sit in pre-printed boxes and blow
out to blank white. Contrast-stretching the frames recovers nothing — the
information is not in the file. Light the plate **20–30° off-axis** so the
stamping casts micro-shadows (diffuse or defeat the on-board LED), wipe the plate
first, or take a **pencil rubbing**, which picks up shallow stamping that no
camera angle will.

**This is now a provenance detail, not a gate.** The detector's electrical
interface is established from Mitsubishi's own figure — see
[`resolver_commissioning.md`](resolver_commissioning.md#oem-connector-reference--confirmed-against-the-m2-maintenance-manual)
— and no exact-suffix datasheet exists publicly, so reading the suffix would
confirm identity without unlocking any specification.

**Field note — the "Z"-labeled MS connector on the motor stack belongs to the
TACHO, not the resolver.** The 17-position `MS3102A20-29P` receptacle on the
grey can under the Z motor is the TT-A-11's connector (its nameplate is on
that same can). Ohmmeter pairs measured there read open — this is NORMAL: the
tacho is brushless with internal commutation electronics behind the pins, and
unpowered semiconductors block a DC ohmmeter. Do not diagnose a fault from
open readings at that connector, and do not probe it expecting resolver
windings. The resolver's own connector is on the pickup can at the screw end.

## What this changes

1. **The installed resolver suffix is not `TS2014N141E26`.** Both readable
   pickups show `TS2014N 25 E …`. Every electrical figure the repo quotes
   from the Tamagawa FA-SOLVER page — K = 0.5, rotor DC 121 Ω, stator DC
   69 Ω, 4.5 kHz nominal — was taken from the 141E26 variant and is
   therefore **comparison data for a different suffix than the one
   installed**. The ~121 Ω / ~69 Ω values remain useful as a *ratio*
   discriminator during pair identification (one distinctly higher-DCR pair
   = rotor; two matched lower pairs = stators), but no absolute value from
   the 141E26 sheet may be treated as a spec for this machine. The exact
   `TS2014N25E…` datasheet has not been located; PCW's warning that some
   TS2014 variants are not 7i49-compatible applies until it is.
2. **Type-number discrepancy flagged, not resolved.** Prior identification
   (July 2026, see `architecture_decision.md`) settled on `RT-5XA-11`; the
   2026-08-15 reading looks like `RT-5X8-1`, but the stamped characters are
   faded and 8-vs-A is exactly the kind of confusion a worn stamp produces.
   Neither reading overrides the other yet. Re-read with raking light, or
   settle it from the `BKO-NC6062A` spec number instead, which is crisp on
   both units and already tied to the TS2014N family in the repo.
3. **Z tacho confirmed as assumed.** `TT-A-11`, 2 V/1000 rpm matches the
   "TG 2V/1000rpm stays with the drive" description used throughout the
   resolver docs. The tacho remains the TRA drive's velocity feedback and is
   not a LinuxCNC input.
4. **Spindle encoder identified.** Tamagawa `TS1526N55` optical shaft
   encoder, 512 counts/turn, DC ±15 V supply, 1984.6, ser A6022. This
   answers the `SPINDLE_ENCODER` row's "identify encoder model/electrical
   format" item as a matter of record. It does **not** reopen the design:
   `num_encoders=0` is a settled decision (2026-08-12) — LinuxCNC does not
   read spindle position, and no Mesa input exists for a ±15 V-supplied
   device without an interface that has never been scoped.

## External corroboration — Z tachometer (reference-grade, 2026-08-15)

A supplier listing located by AG catalogs `TS3033N4E2` / spec `BKO-NC6075` /
type TT-A-11 specifically — an exact part match, not a family match — as a
Tamagawa brushless DC tachogenerator used on Mitsubishi DC servo systems with
Mazatrol T-1..T-4 / M-1 / M-2 controls, which corroborates this machine's
provenance. Listed figures (source: supplier listing, **unverified against a
Tamagawa datasheet**):

- Output 2 V DC per 1000 rpm, tolerance ±10%, ripple <1% p-p
- Max operating speed 5000 rpm
- **Associated supply ±12 VDC** — the unit is brushless with internal
  commutation electronics, so unlike a permanent-magnet tach it needs a
  supply to produce its output.

The nameplate independently confirms 2 V/1000. The tolerance, ripple, speed
and supply figures rest on the listing alone.

Use: diagnostics only. The tacho is the TRA drive's velocity feedback, stays
with the drive, and is never a LinuxCNC input. If an axis drive misbehaves
during commissioning, the expected output is linear (≈1.0 V at 500 rpm up to
≈10.0 V at 5000 rpm, polarity reversing with rotation) at the drive
terminals — and a dead tach signal may actually be a missing ±12 V rail.

Serial-number note: first field reading was `23868`; a re-read of the photo
suggests `2386`. The stamp is smudged; either may be right, and nothing
depends on it.

## Follow-ups

- [x] ~~Locate the Z resolver pickup~~ — found at the Z screw's non-drive end,
  spec `BKO-NC6062A` confirmed same as X/Y (2026-08-15 second visit).
- [ ] Ohmmeter pair measurement for all three axes **at the drive-end CNA
  connectors** (CNA3 = X, CNA4 = Y, CNA5 = Z; unplug at the drive, measure the
  cable-side plug). This reads the windings through the mated pickup connector
  and proves cable + connector in the same measurement. Drawing 4143075404
  p128 pin hypothesis: 16-17 rotor (higher DCR), 12-13 sin, 14-15 cos
  (matched); 18-19 is the tacho, ignore. If those pins read open, sweep the
  plug — pin maps must be found, not assumed (the letter-map assumption
  failed on the tacho connector 2026-08-15). The Z pickup's own MS connector
  is inaccessible without pulling the spindle — do NOT pull the spindle for
  this; the CNA5 end is electrically equivalent.
- [ ] Re-read the faded type stamps (`RT-…`) and the E-suffix digits on X/Y,
  or obtain the `TS2014N25E…` datasheet from Tamagawa and reconcile.
- [ ] Until the exact suffix datasheet is in hand, treat excitation level,
  K, and the 5 kHz choice as **assumptions to verify by scope** at the
  excitation-and-return step — which `resolver_commissioning.md` already
  requires regardless.
