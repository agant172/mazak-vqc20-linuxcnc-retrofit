# Mesa primary-source references

This folder is restricted to hardware in the selected retrofit stack.

- `7i80hdtman.pdf` - local copy of the Mesa 7i80HDT manual used for the
  P1/P2/P3 50-pin I/O map, P4/P5 assignments, W1-W7 jumpers, and the
  Efinix Trion FPGA identification.
  Source: <http://www.mesanet.com/pdf/parallel/7i80hdtman.pdf>
  (retrieved 2026-08-14, 40 pp,
  sha256 `4b18ac95c0e332c3992032bb927d63ed6b0a3ed3326f32bfc6ace016910d04e2`)
- `7i84uman.pdf` - local copy of the Mesa 7i84U manual used for the
  TB1/TB2/TB3 map, field-power limits, watchdog, and smart-serial facts.
- Mesa 7i44 manual: <https://www.mesanet.com/pdf/parallel/7i44man.pdf>
- Mesa 7i49 manual: <https://www.mesanet.com/pdf/motion/7i49man.pdf>
- Mesa 7i80HDT product page:
  <https://store.mesanet.com/index.php?product_id=386&route=product/product>

The 7i80HDT manual is the HDT one, not the older Xilinx `7i80hdman.pdf`.
The two differ in ways that matter for wiring: on the HDT, **P5 is the
+5V/GND screw terminal and P4 is the 10-pin JTAG header**, which is the
reverse of the 7i80HD. Any source citing "P4 = 5V input" is the wrong
manual for this stack.

The former local 7i97T manual was removed in Rev B because the 7i97T is a
retracted architecture and has no role in this analog-velocity/resolver
retrofit. Historical disposition remains in
`docs/superseded_claims_2026-08-06.md`.

Do not infer bitfile compatibility from a board-family manual. The 7i80HDT
uses an Efinix FPGA and requires a verified HDT-specific resolver build with
binary, SHA-256, source/provenance, IDROM readback, and HAL pin dump.
