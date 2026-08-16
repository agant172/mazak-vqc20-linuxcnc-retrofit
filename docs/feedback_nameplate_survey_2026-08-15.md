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
| Spindle encoder | Tamagawa OPTICAL SHAFT ENCODER, **512 counts/turn, DC ±15 V** | — | A6022 | **TS1526N55** | 1984.6 | good |

**Not yet read:** the **Z resolver pickup** nameplate. The Z photo captured
the tachometer-generator on the motor, not the resolver. Read it on the next
cabinet visit before treating the X/Y suffix pattern as machine-wide.

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

- [ ] Read the Z resolver pickup nameplate (raking light; it is the unit the
  Z photo missed).
- [ ] Re-read the faded type stamps (`RT-…`) and the E-suffix digits on X/Y,
  or obtain the `TS2014N25E…` datasheet from Tamagawa and reconcile.
- [ ] Until the exact suffix datasheet is in hand, treat excitation level,
  K, and the 5 kHz choice as **assumptions to verify by scope** at the
  excitation-and-return step — which `resolver_commissioning.md` already
  requires regardless.
