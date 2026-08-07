# Bill of Materials / Parts Planning

## I/O workbook

- [`Mazak_VQC_20-40_Retrofit_IO_Workbook.xlsx`](Mazak_VQC_20-40_Retrofit_IO_Workbook.xlsx)
  — the retrofit I/O planning workbook. It is the source the HAL/INI skeleton and
  [`../mesa/signal_map.csv`](../mesa/signal_map.csv) were generated from, and it doubles
  as the working parts-planning material until a dedicated BOM is finalized.

## Planned core Mesa stack (to confirm before purchase)

| Item | Planned choice | Status |
|---|---|---|
| Primary motion/control board | **Mesa 7i80HDT** Ethernet FPGA host (3×50-pin daughter connectors) | **Buy plan item** — replaces the earlier 7i97T (returned to Mesa) |
| P1 daughter card | **Mesa 7i44** — 8-channel RS-422 smart-serial breakout | **Buy plan item** — port 0 carries the 7i84U; ports 1-7 stay spare |
| P2 daughter card | **Mesa 7i49** (plain, not 7i49HV) | **Buy plan item** — 6 resolvers + 6× ±10V analog outs; reads original Tamagawa at 5 kHz; also drives X/Z/Y and FR-SX velocity |
| P3 daughter card | **Mesa 7i37TA** field breakout | **Buy plan item** — motion-critical field I/O (limits, homes, E-stop, probe, drive-enables, SSR overflow) |
| Remote field I/O | Mesa 7i84U (smart-serial) near green breakout PCB | Retained — now hangs off the 7i44 port 0 |
| Firmware bitfile | `7i80hdt_7i44_ss_7i49d.bit` (PCW-provided) | Confirm final revision from Mesa/PCW before load |
| Control PC | LinuxCNC PC with Ethernet NIC on the 7i80HDT subnet | Confirm latency and static-IP setup (192.168.1.121 target) |
| Optional pendant | WHB04B-style USB pendant, or MPG on a spare 7i44 port | Only after base machine is safe |
| Contingency (not currently required) | Mesa 7i49**HV** | **Not needed unless** measurements show a signal-level/ratio mismatch on this machine |
| Optional future expansion | Additional smart-serial device on a spare 7i44 port | 4th-axis / second 7i84 / MPG all wire into ports 1-7 without a new host card |

> **Superseded stacks (historical, not the plan):**
> - Original PCIe: 6i25 host card + 7i77 + 7i84 (± 7i85/7i85S).
> - Interim: Mesa **7i97T** as the Ethernet host (returned to Mesa 2026-08). Some HAL comments and design notes retain 7i97T provenance so the migration can be traced.


Additional parts (DIN rail, wire duct, interposing relays, suppression, terminals,
control PC) depend on cabinet photos and coil/current measurements still to be taken.

## Resolver feedback notes

- **Buy plan:** a **plain Mesa 7i49**. The machine keeps its original **Tamagawa
  resolvers** (documented models **RT-5XA-11** / **RT-5XA-L1**), so feedback is resolver,
  not encoder. A **VQC 15/40 sister retrofit** on the **same Mitsubishi TRA drives and
  HD81-12S motors** runs a plain 7i49 (not HV) at 5 kHz, which anchors this choice.
  In the new stack the 7i49 sits on 7i80HDT **P2**.
- **7i49HV is not currently required** and stays on the contingency list unless
  measurements contradict the plain-7i49 plan (return signal far too weak at full drive,
  or a resolver ratio other than 2:1).
- **`MS3108B 20-29P` is a connector shell part number, not a resolver model.**
- **Unknowns still needing measurement before this is settled:** axis-by-axis resolver
  label, winding pairs (ohmmeter before power), return signal level after 7i49 excitation,
  final HAL scale/orientation, and shield/ground termination.
