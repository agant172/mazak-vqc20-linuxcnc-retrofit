# Mesa primary-source references

This folder is restricted to hardware in the selected retrofit stack.

- `7i84uman.pdf` - local copy of the Mesa 7i84U manual used for the
  TB1/TB2/TB3 map, field-power limits, watchdog, and smart-serial facts.
- Mesa 7i44 manual: <https://www.mesanet.com/pdf/parallel/7i44man.pdf>
- Mesa 7i49 manual: <https://www.mesanet.com/pdf/motion/7i49man.pdf>
- Mesa 7i80HDT product page:
  <https://store.mesanet.com/index.php?product_id=386&route=product/product>

The former local 7i97T manual was removed in Rev B because the 7i97T is a
retracted architecture and has no role in this analog-velocity/resolver
retrofit. Historical disposition remains in
`docs/superseded_claims_2026-08-06.md`.

Do not infer bitfile compatibility from a board-family manual. The 7i80HDT
uses an Efinix FPGA and requires a verified HDT-specific resolver build with
binary, SHA-256, source/provenance, IDROM readback, and HAL pin dump.
