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
| Control PC | LinuxCNC PC with Ethernet NIC on the 7i97T subnet | Confirm latency and static-IP setup |
| Optional pendant | WHB04B-style USB pendant | Only after base machine is safe |
| Optional future expansion | Additional smart-serial / expansion I/O | Only if a later need (extra encoder/MPG/4th-axis) is confirmed |

> Superseded: the earlier PCIe stack (6i25 host card + 7i77 + 7i84, optional 7i85/7i85S
> third board) is historical and is not the selected plan.

Additional parts (DIN rail, wire duct, interposing relays, suppression, terminals,
control PC) depend on cabinet photos and coil/current measurements still to be taken.
