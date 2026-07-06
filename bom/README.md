# Bill of Materials / Parts Planning

## I/O workbook

- [`Mazak_VQC_20-40_Retrofit_IO_Workbook.xlsx`](Mazak_VQC_20-40_Retrofit_IO_Workbook.xlsx)
  — the retrofit I/O planning workbook. It is the source the HAL/INI skeleton and
  [`../mesa/signal_map.csv`](../mesa/signal_map.csv) were generated from, and it doubles
  as the working parts-planning material until a dedicated BOM is finalized.

## Planned core Mesa stack (to confirm before purchase)

| Item | Planned choice | Status |
|---|---|---|
| Primary motion/control board | Mesa 7i97T Ethernet analog servo controller | Verify part number/revision/firmware |
| Remote field I/O | Mesa 7i84U (smart-serial) near green breakout PCB | Verify variant and connection path |
| Resolver feedback interface | **Mesa 7i49 (plain, not 7i49HV)** | **Buy plan item** — reads original Tamagawa resolvers at 5 kHz; confirm host connection path |
| Control PC | LinuxCNC PC with Ethernet NIC on the 7i97T subnet | Confirm latency and static-IP setup |
| Optional pendant | WHB04B-style USB pendant | Only after base machine is safe |
| Contingency (not currently required) | Mesa 7i49**HV** | **Not needed unless** measurements show a signal-level/ratio mismatch on this machine |
| Optional future expansion | Additional smart-serial / expansion I/O | Only if a later need (extra resolver/encoder/MPG/4th-axis) is confirmed |

> Superseded: the earlier PCIe stack (6i25 host card + 7i77 + 7i84, optional 7i85/7i85S
> third board) is historical and is not the selected plan.

Additional parts (DIN rail, wire duct, interposing relays, suppression, terminals,
control PC) depend on cabinet photos and coil/current measurements still to be taken.

## Resolver feedback notes

- **Buy plan:** a **plain Mesa 7i49**. The machine keeps its original **Tamagawa
  resolvers** (documented models **RT-5XA-11** / **RT-5XA-L1**), so feedback is resolver,
  not encoder. A **VQC 15/40 sister retrofit** on the **same Mitsubishi TRA drives and
  HD81-12S motors** runs a plain 7i49 (not HV) at 5 kHz, which anchors this choice.
- **7i49HV is not currently required** and stays on the contingency list unless
  measurements contradict the plain-7i49 plan (return signal far too weak at full drive,
  or a resolver ratio other than 2:1).
- **`MS3108B 20-29P` is a connector shell part number, not a resolver model.**
- **Unknowns still needing measurement before this is settled:** axis-by-axis resolver
  label, winding pairs (ohmmeter before power), return signal level after 7i49 excitation,
  final HAL scale/orientation, and shield/ground termination.
