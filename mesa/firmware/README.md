# Mesa 7i80HDT firmware package

Evidence package for the bitfile actually flashed to the 7i80HDT, per
[`../../docs/pre_power_deliverables.md`](../../docs/pre_power_deliverables.md)
deliverable D3 (immutable Mesa firmware package). Full narrative and
verification procedure: [`../mesa_firmware_checklist.md`](../mesa_firmware_checklist.md#bitfile-provenance-verification-procedure).

## Current firmware

- **File:** `7i80hdt_rmsvss6_8.bin`
- **SHA-256:** `68e07e25f7227609209f3c6d120319ff2cdec0eada07e92986cc517734d2be58`
- **Flashed:** 2026-08-11 (replaced a prior step/dir + encoder configuration)
- **Source:** sent directly by Peter Wallace (Mesa Electronics) to Andy Gant
  by email, 2026-08-11, at `freeby.mesanet.com/7i80hdt_rmsvss6_8.zip`. Based
  on Efinity pin source `PIN_RMSVSS6_8_72.vhd` per PCW's reply the day
  before (2026-08-10).
- **Confirmed layout** (from `readhmid`, not assumed): P1 = ResolverMod (1) +
  PWM (6); P2 = bare GPIO (`gpio.024`-`gpio.047`, all `IOPort`/`None`,
  unused/spare); P3 = SSerial (8 channels, HostMot2 port 0). No `Encoder`
  module present anywhere in the loaded firmware.

## Files in this directory

- `7i80hdt_rmsvss6_8.bin` — the actual flashed binary, committed directly
  (no Git-LFS configured in this repo; at ~663 KiB it doesn't need it).
  Verify with `sha256sum 7i80hdt_rmsvss6_8.bin` against the hash above any
  time provenance needs re-confirming.
- `readhmid_2026-08-13.txt` — `mesaflash --device 7i80hdt --addr 192.168.1.121 --readhmid`
  output, captured 2026-08-13. Byte-identical to the flash-time capture from
  2026-08-11 (`~/Downloads/7i80hdt_rmsvss6_8_readhmid.txt`, not committed —
  redundant with this file).
- `sserial_2026-08-13.txt` — `mesaflash --device 7i80hdt --addr 192.168.1.121 --sserial`
  output, captured 2026-08-13. Shows the SSLBP port itself (v1.43, 8 channels,
  2.5 MBd) with no 7i84U remote identity strings yet — expected, since no
  7i84U is currently powered/cabled to the board.

## D3 status: all five acceptance items closed (2026-08-13)

**Recovery procedure** (item 5): the 7i80HDT's base-family manual
([`../../docs/Mesa Manuals/7i80hdman.pdf`](../../docs/Mesa%20Manuals/7i80hdman.pdf))
documents two independent recovery mechanisms, transcribed with the full
jumper table in
[`../mesa_firmware_checklist.md`](../mesa_firmware_checklist.md#recovery-procedure-d3-item-5):
automatic fallback on a bad-CRC config, and a manual jumper-W5 dual-flash
recovery if a config loads but doesn't work. The pre-flash flash backup
(`~/Downloads/7i80_flash_backup/7I80HDT_flash_backup_110826_190227.bin`,
SHA-256 `2a8ebd52f0eb13a63751f54d46c139b1107467aee35fc804250353ddbbad6297`)
is a separate rollback path (restores the prior stepper configuration), not
the bricked-card procedure above.

## Re-verifying the running board

```bash
mesaflash --device 7i80hdt --addr 192.168.1.121 --readhmid > mesa/firmware/readhmid_$(date +%Y-%m-%d).txt
mesaflash --device 7i80hdt --addr 192.168.1.121 --sserial > mesa/firmware/sserial_$(date +%Y-%m-%d).txt
diff mesa/firmware/readhmid_2026-08-13.txt mesa/firmware/readhmid_$(date +%Y-%m-%d).txt   # should be empty
```

If a re-check ever disagrees with `readhmid_2026-08-13.txt`, treat the board
as reflashed or reset and re-derive every HAL pin name before any further
commissioning step.
