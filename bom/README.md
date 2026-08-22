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

- **Buy plan: plain `7i49` — CONFIRMED 2026-08-22 (owner), settling the 2026-08-17
  back-and-forth below.** The machine keeps its original **Tamagawa
  TS2014N-series shaft resolvers** (X/Y nameplates read `TS2014N 25 E …` in the 2026-08-15
  survey, [`../docs/feedback_nameplate_survey_2026-08-15.md`](../docs/feedback_nameplate_survey_2026-08-15.md); Z resolver nameplate still unread), so feedback is resolver,
  not encoder. A **VQC 15/40 sister retrofit** on the **same Mitsubishi TRA drives and
  HD81-12S motors** runs a **plain 7i49 (not HV)** — its committed config reads
  `MAZAK-VQC1540.ini:138` `# BOARD1=7i49`, `MAZAK-VQC1540.hal:28`
  `# - 7i49 - Resolver/Analog Servo Board`, and no occurrence of "HV" anywhere in that
  repository. That anchors the card choice. **It does not anchor 5 kHz** — see the
  frequency note below.
  In the new stack the 7i49 sits on 7i80HDT **P1** (confirmed 2026-08-13 by `readhmid`).
- **The sister machine runs 2.5 kHz, not 5 kHz.** Its committed config sets
  `[AXES] RESOLVER_EXC_FREQ = 2.5` (2017-05-01 snapshot) on the same original Tamagawa
  resolvers. A forum thread cited elsewhere in this repo reports that machine at 5 kHz;
  the two sources disagree and the thread has not been re-read. Both 2.5 and 5 kHz are
  7i49-selectable, and they picked the option *below* the 4.5 kHz nominal rather than
  above it. **Do not cite the sister machine as validation of 5 kHz.** Its resolver
  settings, for the record: `RESOLVER_SCALE = 0.07874016`,
  `RESOLVER_VELOCITY_SCALE = 0.003333333`, `RESOLVER_INDEX_DIVISOR = 5`,
  `HOME_USE_INDEX = NO`, on all three axes.
- **7i49HV is not currently required** and stays on the contingency list unless a Mesa (PCW) review of the installed `TS2014N 25 E …` suffix (read 2026-08-15 on X/Y; Z unread) says otherwise — PCW's warning that some TS2014 variants are not 7i49-compatible is live for this suffix until its datasheet is obtained. (**W2 on the plain 7i49 does not affect axis channels 0/1/2**, only 3/4/5, so it is not a valid signal-level remedy for X/Y/Z.) Any escalation should follow
  measurements contradict the plain-7i49 plan (return signal far too weak at full drive,
  or a resolver ratio other than 2:1 — itself a 141E26 comparison figure, unconfirmed for
  the installed 25E suffix until measured on the bench — the 25E datasheet does not exist
  publicly, so measurement is the only route; see
  [`../docs/resolver_commissioning.md`](../docs/resolver_commissioning.md#power-off-bench-identification-replaces-the-datasheet-gate)).

### Which 7i49 the sister machine actually runs — settled 2026-08-22 (owner), superseding 2026-08-17

For one day (2026-08-17) this file read the sister retrofit as running a `7i49HV`,
based on a purchased-parts spreadsheet in `github.com/srdco/MazakVQC1540`
(`vqc-retrofit-wiring-sheet2.ods`, Sheet3 row 4: **`7i49HV`, $184.00, "7i80 ←→
Resolvers/Servos"**, ticked `x`). The reasoning at the time was that HAL/INI
comments can't be trusted to distinguish the two cards — both present identical
`hm2_<board>.0.resolver.NN.*` pins, so `# BOARD1=7i49` is structurally weak evidence
on its own — while the `.ods` table looked like the one piece of direct purchase
evidence. **Owner confirmation on 2026-08-22 settles it the other way: plain `7i49`.**
Read that way, the config comments (`MAZAK-VQC1540.ini:138`, `MAZAK-VQC1540.hal:28`)
and the complete absence of "HV" anywhere in that repository were right after all, and
the `.ods` row was either misread or does not reflect what was actually installed.

The excitation finding from that same pass still stands and is uncontested: **2.5 kHz**,
live in config, not a comment (`setp hm2_7i80.0.resolver.excitation-khz
[AXES]RESOLVER_EXC_FREQ`; `MAZAK-VQC1540.ini:176`; `MAZAK-VQC1540.hal:117`). The same
sheet's host-board row (`7i80HD-16`, not a 7i80HDT) has not been independently
re-checked since the card row turned out wrong, so treat it as unconfirmed rather than
settled.

**The step-up argument for HV is superseded, not disproved.** Mesa's own product pages
differ on exactly this axis: the 7I49 "can be used with 1:1 and 2:1 transformation
ratio resolvers", the 7I49HV "with 1:1 and 1:2" ([7I49](https://store.mesanet.com/index.php?route=product/product&product_id=101),
[7I49HV](https://store.mesanet.com/index.php?product_id=314&route=product/product); both
$184, both 2.5–10 kHz selectable, so price and excitation range are not discriminators).
`handoff.md` derives that exciting 16/17 runs this detector backwards through a ratio of
~0.3 — a ~3× step-up — and a step-up return was read as the HV's stated domain. With the
sister machine now confirmed plain 7i49, that reasoning no longer has a purchase example
behind it; it stays as an open question for the bench measurement to resolve rather than
a purchasing signal.
- **`MS3108B 20-29P` is a connector shell part number, not a resolver model.**
- **Unknowns still needing measurement before this is settled:** axis-by-axis resolver
  label, winding pairs (ohmmeter before power), return signal level after 7i49 excitation,
  final HAL scale/orientation, and shield/ground termination (see [`../docs/grounding_shielding_plan.md`](../docs/grounding_shielding_plan.md) for the cable schedule and noise-survey acceptance).
