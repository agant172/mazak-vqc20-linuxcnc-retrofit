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

### Re-verification log

- **2026-08-14** — `--readhmid` re-run against the live board; output
  byte-identical to `readhmid_2026-08-13.txt` (159 lines, `diff -u` empty,
  both SHA-256
  `c80c8f29805c2baccf55fe816b786c6ad8a71bedbee9fffe2334b49a4fbce3c3`). The
  capture was **not** committed — a second copy of an identical file adds a
  filename, not evidence.

- **2026-08-17** — `--readhmid` and `--sserial` both re-run against the live
  board from the OptiPlex. Both outputs byte-identical to the 2026-08-13
  baselines: `readhmid` 159 lines, SHA-256
  `c80c8f29805c2baccf55fe816b786c6ad8a71bedbee9fffe2334b49a4fbce3c3` (same hash
  as `readhmid_2026-08-13.txt`); `sserial` still shows only the SSLBP port
  itself (v1.43, 8 channels, 2.5 MBd) with **no 7i84U remote identity strings**,
  which remains expected — no 7i84U is powered or cabled to the board yet.
  Neither capture was committed, per the 2026-08-14 precedent below: a second
  copy of an identical file adds a filename, not evidence. The same scope note
  applies — this confirms the FPGA IDROM and connector roles, and upgrades no
  `authority_status` value.

- **2026-08-15 — the 2026-08-14 Ethernet link drop is explained; closed.**
  The earlier entry recorded a ~3.7 h `e1000e` carrier loss on `enp0s31f6` as
  unexplained and flagged it for resolution before `hm2_eth` runs in realtime.
  Andy reports it was the 7i80HDT being powered off and back on, and the kernel
  log agrees:

  ```
  Aug 14 18:49:30  NIC Link is Down
  Aug 14 22:32:57  NIC Link is Up   100 Mbps Half Duplex
  Aug 14 22:32:57  NIC Link is Down
  Aug 14 22:32:59  NIC Link is Up   100 Mbps Full Duplex
  ```

  Three things fit a deliberate power cycle and not a fault: the gap is one
  continuous 3 h 43 m down period with **no intermediate flapping** (a marginal
  cable or failing PHY flaps repeatedly); the recovery is a
  half-duplex → down → full-duplex sequence inside 2 s, which is the ordinary
  autonegotiation settling pattern of a link partner *powering up* rather than a
  link healing; and the `readhmid` re-verification was committed at 22:38:02,
  about five minutes after the link returned.

  Correction to the entry above: it stated "100 Mbps full duplex on both sides
  of the gap." The link actually came back at **half** duplex first and settled
  to full 2 s later. The pre-drop speed/duplex is not in the retained log.

  This is an operator account corroborated by the link-transition log, not an
  instrumented measurement — it rules out an intermittent link fault as the
  explanation, which was the concern. Nothing here bears on `hm2_eth` realtime
  packet-loss behaviour, which is still to be qualified separately per
  `docs/hm2_eth_nic_validation.md`.

  Scope of this check: it confirms the FPGA's own IDROM still matches
  `../current_pin_authority.csv` on connector roles and module inventory. It
  says nothing about field wiring, resolver scale, analog polarity, or I/O
  normal states, and upgrades no `authority_status` value in the CSV.
