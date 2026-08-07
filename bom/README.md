# Bill of Materials / Parts Planning

## I/O workbook

- [`Mazak_VQC_20-40_Retrofit_IO_Workbook.xlsx`](Mazak_VQC_20-40_Retrofit_IO_Workbook.xlsx)
  — the retrofit I/O planning workbook. It is the source the HAL/INI skeleton and
  [`../mesa/signal_map.csv`](../mesa/signal_map.csv) were generated from, and it doubles
  as the working parts-planning material until a dedicated BOM is finalized.

## Planned core Mesa stack (to confirm before purchase)

| Item | Planned choice | Status |
|---|---|---|
| Primary motion/control board | **Mesa 7i80HDT** Ethernet FPGA host (3×50-pin daughter connectors) | **Buy plan item** |
| P1 daughter card | **Mesa 7i44** — 8-channel RS-422 smart-serial breakout | **Buy plan item** — port 0 carries 7i84U-A, port 1 carries 7i84U-B, and ports 2-7 stay spare |
| P2 daughter card | **Mesa 7i49** (plain, not 7i49HV) | **Buy plan item** — 6 resolvers + 6× ±10V analog outs; reads original Tamagawa (TS2014N141E26 spec 4.5 kHz; 7i49 selectable options 2.5/5/10 kHz, use 5 kHz — verify on scope, Tamagawa page publishes no frequency tolerance); also drives X/Z/Y and FR-SX velocity |
| P3 daughter card | **None** | P3 is unused/spare except bare direct FPGA GPIO `gpio.042` for Renishaw MP-3 probe SKIP1; no daughter card is planned |
| Remote field I/O | Mesa 7i84U-A on 7i44 port 0 and 7i84U-B on port 1 | 7i84U-A retained near green breakout PCB; 7i84U-B adds limits/homes, drive enables, and relay-driven loads |
| Firmware bitfile | `7i80hdt_7i44_ss_7i49d.bit` (PCW-provided) | Confirm final revision from Mesa/PCW before load |
| Control PC | LinuxCNC PC with Ethernet NIC on the 7i80HDT subnet | Confirm latency and static-IP setup (192.168.1.121 target) |
| Optional pendant | WHB04B-style USB pendant, or MPG on a spare 7i44 port | Only after base machine is safe |
| Contingency (not currently required) | Mesa 7i49**HV** | **Not needed unless** measurements show a signal-level/ratio mismatch on this machine |
| Optional future expansion | Additional smart-serial device on a spare 7i44 port | 4th-axis / second 7i84 / MPG all wire into ports 1-7 without a new host card |


Additional parts (DIN rail, wire duct, interposing relays, suppression, terminals,
control PC) depend on cabinet photos and coil/current measurements still to be taken.

## Resolver feedback notes

- **Buy plan:** a **plain Mesa 7i49**. The machine keeps its original **Tamagawa
  resolvers** (documented models **RT-5XA-11** / **RT-5XA-L1**), so feedback is resolver,
  not encoder. A **VQC 15/40 sister retrofit** on the **same Mitsubishi TRA drives and
  HD81-12S motors** runs a plain 7i49 (not HV) at 5 kHz, which anchors this choice.
  In the new stack the 7i49 sits on 7i80HDT **P2**.
- **7i49HV is not currently required** and stays on the contingency list unless a Mesa (PCW) review of the specific TS2014N suffix on this machine says otherwise. (**W2 on the plain 7i49 does not affect axis channels 0/1/2**, only 3/4/5, so it is not a valid signal-level remedy for X/Y/Z.) Any escalation should follow
  measurements contradict the plain-7i49 plan (return signal far too weak at full drive,
  or a resolver ratio other than 2:1).
- **`MS3108B 20-29P` is a connector shell part number, not a resolver model.**
- **Unknowns still needing measurement before this is settled:** axis-by-axis resolver
  label, winding pairs (ohmmeter before power), return signal level after 7i49 excitation,
  final HAL scale/orientation, and shield/ground termination (see [`../docs/grounding_shielding_plan.md`](../docs/grounding_shielding_plan.md) for the cable schedule and noise-survey acceptance).
