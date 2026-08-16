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
| P1 daughter card | **Mesa 7i49** (plain, not 7i49HV) | **Buy plan item** — 6 resolvers + 6× ±10V analog outs; reads original Tamagawa resolvers (4.5 kHz is 141E26 comparison data — installed suffix reads `TS2014N 25 E …` per the 2026-08-15 survey, [`../docs/feedback_nameplate_survey_2026-08-15.md`](../docs/feedback_nameplate_survey_2026-08-15.md); absolutes unconfirmed until the 25E datasheet is obtained. 7i49 selectable options 2.5/5/10 kHz, use 5 kHz — verify on scope); also drives X/Z/Y and FR-SX velocity. Connector confirmed 2026-08-13 by `readhmid` — see [`../mesa/mesa_firmware_checklist.md`](../mesa/mesa_firmware_checklist.md#bitfile-provenance-verification-procedure). |
| P2 daughter card | **None** | P2 is unused/spare (confirmed 2026-08-13 by `readhmid`: bare GPIO `gpio.024`-`gpio.047`). The Renishaw MP-3 probe input is on **7i84U-B input-15** (opto-isolated); no P2 daughter card is planned and no bare P2 GPIO is wired to 24 V field signals (see [`docs/superseded_claims_2026-08-06.md`](../docs/superseded_claims_2026-08-06.md) #15). |
| P3 daughter card | **Mesa 7i44** — 8-channel RS-422 smart-serial breakout | **Buy plan item** — physical channels 0/1 carry 7i84U-A/B under HostMot2 port 0; channels 2-7 stay spare. Connector confirmed 2026-08-13 by `readhmid`. |
| Remote field I/O | Mesa 7i84U-A on 7i44 channel 0 and 7i84U-B on channel 1 | 7i84U-A retained near green breakout PCB; 7i84U-B adds limits/homes, drive enables, and relay-driven loads |
| Firmware bitfile | `7i80hdt_rmsvss6_8.bin`, flashed 2026-08-11 | Layout, identity, and upstream source all **CONFIRMED**: two independent `readhmid` reads plus a recorded SHA-256, and the binary sourced directly from Peter Wallace at Mesa Electronics (`freeby.mesanet.com/7i80hdt_rmsvss6_8.zip`, 2026-08-11) — see [`mesa/mesa_firmware_checklist.md`](../mesa/mesa_firmware_checklist.md#bitfile-provenance-verification-procedure) |
| Control PC | LinuxCNC PC with Ethernet NIC on the 7i80HDT subnet | Confirm latency and static-IP setup (192.168.1.121 target) |
| Optional pendant | WHB04B-style USB pendant, or MPG on a spare 7i44 channel | Only after base machine is safe |
| Contingency (not currently required) | Mesa 7i49**HV** | **Not needed unless** measurements show a signal-level/ratio mismatch on this machine |
| Optional future expansion | Additional smart-serial device on a spare 7i44 channel | 4th-axis / additional 7i84 / MPG may use channels 2-7 after firmware/mask verification |


Additional parts (DIN rail, wire duct, interposing relays, suppression, terminals,
control PC) depend on cabinet photos and coil/current measurements still to be taken.

## Resolver feedback notes

- **Buy plan:** a **plain Mesa 7i49**. The machine keeps its original **Tamagawa
  TS2014N-series shaft resolvers** (X/Y nameplates read `TS2014N 25 E …` in the 2026-08-15
  survey, [`../docs/feedback_nameplate_survey_2026-08-15.md`](../docs/feedback_nameplate_survey_2026-08-15.md); Z resolver nameplate still unread), so feedback is resolver,
  not encoder. A **VQC 15/40 sister retrofit** on the **same Mitsubishi TRA drives and
  HD81-12S motors** runs a plain 7i49 (not HV) at 5 kHz, which anchors this choice.
  In the new stack the 7i49 sits on 7i80HDT **P1** (confirmed 2026-08-13 by `readhmid`).
- **7i49HV is not currently required** and stays on the contingency list unless a Mesa (PCW) review of the installed `TS2014N 25 E …` suffix (read 2026-08-15 on X/Y; Z unread) says otherwise — PCW's warning that some TS2014 variants are not 7i49-compatible is live for this suffix until its datasheet is obtained. (**W2 on the plain 7i49 does not affect axis channels 0/1/2**, only 3/4/5, so it is not a valid signal-level remedy for X/Y/Z.) Any escalation should follow
  measurements contradict the plain-7i49 plan (return signal far too weak at full drive,
  or a resolver ratio other than 2:1 — itself a 141E26 comparison figure, unconfirmed for
  the installed 25E suffix until measured or the datasheet is obtained).
- **`MS3108B 20-29P` is a connector shell part number, not a resolver model.**
- **Unknowns still needing measurement before this is settled:** axis-by-axis resolver
  label, winding pairs (ohmmeter before power), return signal level after 7i49 excitation,
  final HAL scale/orientation, and shield/ground termination (see [`../docs/grounding_shielding_plan.md`](../docs/grounding_shielding_plan.md) for the cable schedule and noise-survey acceptance).
