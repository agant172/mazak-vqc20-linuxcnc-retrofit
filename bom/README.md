# Bill of Materials / Parts Planning

## I/O workbook

- [`Mazak_VQC_20-40_Retrofit_IO_Workbook.xlsx`](Mazak_VQC_20-40_Retrofit_IO_Workbook.xlsx)
  — generated Excel snapshot of all 132 rows in
  [`../mesa/current_pin_authority.csv`](../mesa/current_pin_authority.csv), with
  formula-driven authority summaries and the selected 7i80HDT / 7i44 / 7i49 /
  two-7i84U architecture. The CSV remains the source of truth; regenerate the
  workbook after authority changes rather than editing assignments only in Excel.

## Planned core Mesa stack (to confirm before purchase)

| Item | Planned choice | Status |
|---|---|---|
| Primary motion/control board | **Mesa 7i80HDT** Ethernet FPGA host (3×50-pin daughter connectors) | **Buy plan item** |
| P1 daughter card | **Mesa 7i49HV** (corrected 2026-08-17 — the sister VQC 15/40 runs HV; see "Which 7i49 the sister machine actually runs") | **Buy plan item** — 6 resolvers + 6× ±10V analog outs; reads original Tamagawa resolvers (4.5 kHz is 141E26 comparison data — installed suffix reads `TS2014N 25 E …` per the 2026-08-15 survey, [`../docs/feedback_nameplate_survey_2026-08-15.md`](../docs/feedback_nameplate_survey_2026-08-15.md); absolutes unconfirmed until the 25E datasheet is obtained. 7i49 selectable options 2.5/5/10 kHz, use 5 kHz — verify on scope); also drives X/Z/Y and FR-SX velocity. Connector confirmed 2026-08-13 by `readhmid` — see [`../mesa/mesa_firmware_checklist.md`](../mesa/mesa_firmware_checklist.md#bitfile-provenance-verification-procedure). |
| P2 daughter card | **None** | P2 is unused/spare (confirmed 2026-08-13 by `readhmid`: bare GPIO `gpio.024`-`gpio.047`). The Renishaw MP-3 probe input is on **7i84U-B input-15** (opto-isolated); no P2 daughter card is planned and no bare P2 GPIO is wired to 24 V field signals (see [`docs/superseded_claims_2026-08-06.md`](../docs/superseded_claims_2026-08-06.md) #15). |
| P3 daughter card | **Mesa 7i44** — 8-channel RS-422 smart-serial breakout | **Buy plan item** — physical channels 0/1 carry 7i84U-A/B under HostMot2 port 0; channels 2-7 stay spare. Connector confirmed 2026-08-13 by `readhmid`. |
| P1 / P3 interconnect cables | **50-conductor IDC ribbon, 0.1" / 2.54 mm pitch** (Mesa `AIO CABLE-1FT` or `-2FT`) | **Buy plan item** — 2 required (P1→7i49, P3→7i44) **only if** the daughtercards are the top-side-male variant; see "Mesa 50-pin interconnect cables" below before ordering. **A 2 mm-pitch 50-pin cable was ordered in error 2026-08-14 and does not fit.** |
| Remote field I/O | Mesa 7i84U-A on 7i44 channel 0 and 7i84U-B on channel 1 | 7i84U-A retained near green breakout PCB; 7i84U-B adds limits/homes, drive enables, and relay-driven loads |
| Firmware bitfile | `7i80hdt_rmsvss6_8.bin`, flashed 2026-08-11 | Layout, identity, and upstream source all **CONFIRMED**: two independent `readhmid` reads plus a recorded SHA-256, and the binary sourced directly from Peter Wallace at Mesa Electronics (`freeby.mesanet.com/7i80hdt_rmsvss6_8.zip`, 2026-08-11) — see [`mesa/mesa_firmware_checklist.md`](../mesa/mesa_firmware_checklist.md#bitfile-provenance-verification-procedure) |
| Control PC | LinuxCNC PC with Ethernet NIC on the 7i80HDT subnet | Confirm latency and static-IP setup (192.168.1.121 target) |
| Optional pendant | WHB04B-style USB pendant, or MPG on a spare 7i44 channel | Only after base machine is safe |
| Contingency | Plain Mesa **7i49** | Demoted to contingency 2026-08-17 (was the buy plan). Order only if the bench measurement shows the returns sit inside a plain card's window after all — same $184, so the HV is not a cost penalty. |
| Optional future expansion | Additional smart-serial device on a spare 7i44 channel | 4th-axis / additional 7i84 / MPG may use channels 2-7 after firmware/mask verification |


Additional parts (DIN rail, wire duct, interposing relays, suppression, terminals,
control PC) depend on cabinet photos and coil/current measurements still to be taken.

## Mesa 50-pin interconnect cables (7i80HDT P1 / P3)

**Check the daughtercards first — cables may not be needed.** Per the 7i44 manual,
the controller connection "can be a male 50 pin header on the top of the 7I44 card
or a female 50 conductor header on the bottom side of the 7I44 depending on 7I44
model." A bottom-side-female card plugs directly onto the 7i80HDT header with no
cable. Flip both the 7i44 and 7i49 over and record which variant is on hand before
ordering; it also changes the cabinet/standoff layout.

**If ribbon cables are needed, the pitch is the trap.** Three 50-pin IDC pitches are
sold and only one fits:

| Pitch | Ribbon width | Connector body | Fits Mesa? |
|---|---|---|---|
| 1.27 mm / 0.05" | 32 mm / 1.25" | ~34 mm | No — SCSI-2 / fine pitch |
| 2.0 mm / 0.08" | 50 mm / 2" | ~52 mm | **No — ordered in error 2026-08-14** |
| **2.54 mm / 0.1"** | **63.5 mm / 2.5"** | **~68 mm** | **Yes** |

Required specification:

- 50 conductor, 2×25 IDC, **female-to-female**, straight-through
- **Pitch 2.54 mm / 0.1"**
- **Ribbon width 63.5 mm / 2.5"**
- Keep short — 1 ft or 2 ft. P1 carries 7i49 resolver feedback and ±10 V analog;
  see [`../docs/grounding_shielding_plan.md`](../docs/grounding_shielding_plan.md).

**Buying rule of thumb: filter on the width, not the stated pitch.** Sellers are
unreliable about naming pitch but always list L×W, and a 2.5"-wide 50-conductor
ribbon can only be 0.1" pitch. A listing reading "2 inch / 50 mm" wide is the 2 mm
part. Safest option is Mesa's own `AIO CABLE-1FT`…`-5FT` ("50 conductor flat cable
for Anything I/O cards", US$15–19), sold for these headers.

Connector pitch and the P1/P2/P3 pinout are documented in
[`../docs/Mesa Manuals/7i80hdtman.pdf`](../docs/Mesa%20Manuals/7i80hdtman.pdf)
(P1 = IO0-23, P2 = IO24-47, P3 = IO48-71; odd pins signal, even pins GND, pin 49
POWER, pin 50 GND).

## Resolver feedback notes

- **Buy plan: `7i49` vs `7i49HV` — CORRECTED 2026-08-17. The sister machine runs a
  `7i49HV`, not a plain `7i49`.** The machine keeps its original **Tamagawa
  TS2014N-series shaft resolvers** (X/Y nameplates read `TS2014N 25 E …` in the 2026-08-15
  survey, [`../docs/feedback_nameplate_survey_2026-08-15.md`](../docs/feedback_nameplate_survey_2026-08-15.md); Z resolver nameplate still unread), so feedback is resolver,
  not encoder. In the new stack the card sits on 7i80HDT **P1** (confirmed 2026-08-13 by
  `readhmid`). See "Which 7i49 the sister machine actually runs" below before ordering.
- **7i49HV is no longer a contingency item** — it is the card the only comparable
  machine on record actually bought. PCW's warning that some TS2014 variants are not
  plain-7i49-compatible remains live for the `TS2014N 25 E …` suffix until its datasheet
  is obtained or the bench measurement is done. (**W2 on the plain 7i49 does not affect
  axis channels 0/1/2**, only 3/4/5, so it was never a valid signal-level remedy for
  X/Y/Z.) The bench measurement still governs: see
  [`../docs/resolver_commissioning.md`](../docs/resolver_commissioning.md#power-off-bench-identification-replaces-the-datasheet-gate).

### Which 7i49 the sister machine actually runs — settled 2026-08-17

`bom/README.md` previously said the VQC 15/40 sister retrofit runs "a plain 7i49 (not
HV) at 5 kHz". **Both halves of that sentence are wrong.** Read directly from
`github.com/srdco/MazakVQC1540` (clone of 2026-08-17):

| Claim | What the repo actually says | Source |
|---|---|---|
| Card | **`7i49HV`, $184.00, "7i80 ←→ Resolvers/Servos"** — a purchased-parts table headed `MESA BOARDS`, each row ticked `x` | `vqc-retrofit-wiring-sheet2.ods`, Sheet3 row 4 |
| Excitation | **2.5 kHz**, not 5 kHz — and it is live, not a comment: `setp hm2_7i80.0.resolver.excitation-khz [AXES]RESOLVER_EXC_FREQ` | `MAZAK-VQC1540.ini:176`; `MAZAK-VQC1540.hal:117` |
| Host board | `7i80HD-16` ($149), not a 7i80HDT | same sheet, row 3 |

**Why the old "plain 7i49" reading happened, and why it is not evidence.** The strings
`# BOARD1=7i49` (`MAZAK-VQC1540.ini:138`) and `# 7i49 - Resolver/Analog Servo Board`
(`MAZAK-VQC1540.hal:28`) are **comments**, and "7i49" there is shorthand for the family.
**HAL/INI cannot distinguish the two cards at all** — both present identical
`hm2_<board>.0.resolver.NN.*` pins, so a config file is structurally incapable of
recording which one was bought. The `.ods` parts table is the only purchase evidence in
the repo, and it says HV. Grepping the configs for `HV` returns nothing, which reads as
"plain card" but is really "wrong file kind" — the same shape of error as trap #1 in
[`../handoff.md`](../handoff.md).

**This agrees with the step-up finding rather than contradicting it.** Mesa's own product
pages differ on exactly this axis: the 7I49 "can be used with 1:1 and 2:1 transformation
ratio resolvers", the 7I49HV "with 1:1 and 1:2" ([7I49](https://store.mesanet.com/index.php?route=product/product&product_id=101),
[7I49HV](https://store.mesanet.com/index.php?product_id=314&route=product/product); both
$184, both 2.5–10 kHz selectable, so **price and excitation range are not
discriminators**). `handoff.md` derives that exciting 16/17 runs this detector backwards
through a ratio of ~0.3 — a **~3× step-UP** — and a step-up return is the HV's stated
domain, not the plain card's. Two independent lines now point the same way.

**Not yet nailed down:** the direction convention behind Mesa's "2:1" vs "1:2" wording is
inferred from the `HV` name plus the step-up physics, *not* read from the 7i49 manual —
`freeby.mesanet.com/7i49man.pdf` served an expired certificate on 2026-08-17 and the
`mesanet.com/pdf/parallel/` path 404s. **Get `7i49man.pdf` into
[`../docs/Mesa Manuals/`](../docs/Mesa%20Manuals/) and confirm the wording before
ordering.** The purchase conclusion does not depend on it — the sister machine bought an
HV whichever way the convention reads — but the *reason* does.
- **`MS3108B 20-29P` is a connector shell part number, not a resolver model.**
- **Unknowns still needing measurement before this is settled:** axis-by-axis resolver
  label, winding pairs (ohmmeter before power), return signal level after 7i49 excitation,
  final HAL scale/orientation, and shield/ground termination (see [`../docs/grounding_shielding_plan.md`](../docs/grounding_shielding_plan.md) for the cable schedule and noise-survey acceptance).
