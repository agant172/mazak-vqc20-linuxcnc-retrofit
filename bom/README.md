# Bill of Materials / Parts Planning

## I/O workbook

- [`Mazak_VQC_20-40_Retrofit_IO_Workbook.xlsx`](Mazak_VQC_20-40_Retrofit_IO_Workbook.xlsx)
  — the retrofit I/O planning workbook. It is the source the HAL/INI skeleton and
  [`../mesa/signal_map.csv`](../mesa/signal_map.csv) were generated from, and it doubles
  as the working parts-planning material until a dedicated BOM is finalized.

## Planned core Mesa stack (to confirm before purchase)

| Item | Planned choice | Status |
|---|---|---|
| PCIe Mesa host card | 6i25 or current PCIe equivalent | Verify model/availability |
| Analog servo/spindle card | 7i77 (7i77 vs 7i77D TBD) | Confirm variant |
| Field I/O card | 7i84 (7i84 vs 7i84D TBD) near green breakout PCB | Confirm variant |
| Optional expansion | 7i85/7i85S | Only if extra encoder/MPG/stepgen/4th-axis needed |
| Optional pendant | WHB04B-style USB pendant | Only after base machine is safe |

Additional parts (DIN rail, wire duct, interposing relays, suppression, terminals,
tower PC) depend on cabinet photos and coil/current measurements still to be taken.
