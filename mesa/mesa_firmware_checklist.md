# Mesa Firmware and HAL Pin Checklist

Use this checklist before finalizing the HAL files. The purpose is to make the selected
7i80HDT + 7i44 + 7i49 + 7i84U-A + 7i84U-B Ethernet architecture match the actual installed Mesa
hardware, firmware, Ethernet/IP configuration, smart-serial field-I/O connections,
the isolated 7i84U-B probe path, and LinuxCNC HAL pin names.

## Confirmed architecture (2026-08-13 rev)

> **Connector assignment flipped vs. the 2026-08-06 rev.** The firmware actually
> flashed to the board (`7i80hdt_rmsvss6_8.bin`, see "Bitfile provenance" below)
> puts the 7i49-equivalent resolver/PWM module on **P1** and smart-serial on
> **P3**, the opposite of what every doc previously assumed. **P2 is the
> unused/bare-GPIO connector now, not P3.** This was confirmed by `readhmid`
> against the board on 2026-08-13 and is byte-identical to the readback saved
> at flash time (2026-08-11). If you are re-deriving any P1/P2/P3 fact in this
> repo, trust this section and `mesa/current_pin_authority.csv`, not older prose.

- LinuxCNC control PC connected to the Mesa 7i80HDT over Ethernet (`hm2_eth`, static IP
  192.168.1.121, host NIC enp0s31f6 at 192.168.1.1/24).
- Mesa 7i80HDT Ethernet FPGA host as the primary control board. Three 50-pin daughter
  connectors P1/P2/P3, 72 IO total, 5V-tolerant. The 7i80HDT carries no field terminals
  itself — all field wiring lands on the P1/P2/P3 daughter cards.
- Mesa **7i49 on P1** — plain 7i49 (not 7i49HV). Provides 6 resolver channels (X/Y/Z
  Tamagawa TS2014N on RES0/1/2, RES3-RES5 spare) and 6× ±10V analog outputs
  (X/Z/Y velocity commands on AOUT0/1/2, FR-SX spindle velocity on AOUT3,
  AOUT4/AOUT5 spare). FR-SX orient is discrete ORCM1. Excitation baseline is 5 kHz.
- Mesa **7i44 on P3** — 8-channel RS-422 smart-serial breakout. Physical
  channels 0/1 drive **7i84U-A/B** within HostMot2 port 0; channels 2-7 are spare.
- Mesa **7i84U-A on 7i44 channel 0** — remote field I/O for ATC, hydraulics,
  coolant, air, magazine, utility I/O, and cabinet field wiring.
- Mesa **7i84U-B on 7i44 sserial channel 1** — remote field I/O for X/Y/Z
  limits and homes (TB3 IN0-8), air permissive (TB3 IN9), the Renishaw MP-3
  probe (TB3 IN15), X/Y/Z drive enables (TB3 OUT0-2), relay-driven loads
  (TB3 OUT3-7), and the proposed cover-close command (TB2 OUT8). Per
  the Mesa 7i84 manual, TB1 is the 8-pin power connector, TB3 carries the
  first 16 inputs + first 8 outputs, and TB2 carries the second 16 inputs
  + second 8 outputs.
- **P2 unused/spare** — no daughter card; all bare-FPGA GPIO (`gpio.024`-`gpio.047`
  per the 2026-08-13 readback). **Not safe for 24 V field wiring** (3.3 V logic
  without opto-isolation). The Renishaw MP-3 probe was previously bound to a bare
  GPIO pin in an earlier revision; it has been moved to 7i84U-B input-15
  (opto-isolated 24 V input) and stays there regardless of which connector is bare.
- Firmware/bitfile is `7i80hdt_rmsvss6_8.bin`, flashed 2026-08-11 (replacing a prior
  step/dir + encoder configuration). **Layout and identity confirmed by two
  independent `readhmid` reads** (flash-time 2026-08-11 and re-check 2026-08-13,
  byte-identical) and a pre-flash flash backup retained for rollback — see
  "Bitfile provenance" below for the exact hashes and file locations. Confirmed
  configuration: ResolverMod (1) + PWM (6) on P1, SSerial (8ch, port 0) on P3,
  P2 bare GPIO, no Encoder module present (spindle encoder path stays unassigned).

## Information to record

| Group | Item to record | Expected / current plan | Why it matters |
|---|---|---|---|
| Host board | Exact Mesa board model/revision | 7i80HDT | Determines firmware target and HAL device name (expect `hm2_7i80` — confirm via readhmid). |
| Ethernet | 7i80HDT IP address / host NIC | 192.168.1.121 / enp0s31f6 (192.168.1.1/24) | Confirms the control PC can reach the board deterministically. |
| Ethernet | `hm2_eth` config string | `num_encoders=0 num_resolvers=3 num_pwmgens=4 num_stepgens=0 sserial_port_0=00xxxxxx` | Exposes X/Y/Z resolver, analog, and two smart-serial channels. `num_encoders=0` is a **settled design decision** (2026-08-12), not a temporary hold — LinuxCNC does not read spindle position; see [`../docs/spindle_motor_plg_encoder.md`](../docs/spindle_motor_plg_encoder.md#design-decision--linuxcnc-does-not-read-spindle-position). |
| P1 (7i49) | Analog output count/scaling | 6× ±10 V hardware; active `num_pwmgens=4` maps X/Z/Y/spindle to AOUT0/1/2/3; AOUT4/5 spare | Required before safe first motion. Four requested PWM generators create instances 00-03 only. |
| P1 (7i49) | Resolver interface present | Plain 7i49 (not 7i49HV) | Axis feedback is resolver, not encoder; firmware must expose resolver channels. |
| P1 (7i49) | Host connection path | On 7i80HDT connector P1 (confirmed by readhmid 2026-08-13, not P2 as earlier docs assumed) | Determines board tag and `num_resolvers` config. |
| P1 (7i49) | Excitation frequency | 5 kHz (7i49 selectable: 2.5/5/10 kHz; 4.5 kHz is **141E26 comparison data** — installed suffix reads `TS2014N 25 E…` (2026-08-15 survey, [`../docs/feedback_nameplate_survey_2026-08-15.md`](../docs/feedback_nameplate_survey_2026-08-15.md)), absolutes unconfirmed until the 25E datasheet is obtained; verify on scope at commissioning) | 5 kHz is a working baseline to verify, not a tolerance claim. |
| P1 (7i49) | Transformation ratio / signal level | K=0.5 is **141E26 comparison data** — installed suffix reads `TS2014N 25 E…` (2026-08-15 survey), 25E ratio unconfirmed until its datasheet is obtained; **if** K≈0.5, 7i49 default drive ~2 V RMS → SIN/COS ~1 V RMS | Scope RESDRV excitation and RESSIN/RESCOS amplitude and phase at rest and under motion; **W2 does NOT affect axis channels 0/1/2** (only 3/4/5). |
| P1 (7i49) | Excitation ownership | 7i49 is sole excitation source | TRA drives use tacho velocity loop; nothing else may drive the resolver windings. |
| P3 (7i44) | Smart-serial channel assignment | HostMot2 port 0: physical channel 0 → 7i84U-A, channel 1 → 7i84U-B, channels 2-7 disabled | Both 7i84Us share HostMot2 port 0. Configured via `sserial_port_0=00xxxxxx`. |
| P3 (7i44) | RS-422 pinout to 7i84U-A/B | Standard sserial 5-wire (TX+/TX-/RX+/RX-/GND, +5V) | Confirms each RJ45 → 7i44 screw-terminal connection. |
| P2 bare GPIO | All pins unused/spare | Not wired to any 24 V field signal (3.3 V logic, no opto-isolation) | Prevents accidental FPGA damage. Probe stays on 7i84U-B input-15 regardless. |
| 7i84U-A | Smart-serial connection path | Via 7i44 P3, sserial channel 0 (`hm2_7i80.0.7i84.0.0.*`) | Determines smart-serial config and HAL names. |
| 7i84U-A | Exact variant/revision and field power/load limits | 32 DI + 16 DO field I/O | Output behavior and wiring strategy may differ; confirm field power and output ratings. |
| 7i84U-B | Smart-serial connection path | Via 7i44 P3, sserial channel 1 (`hm2_7i80.0.7i84.0.1.*`) | Determines smart-serial config and HAL names. |
| 7i84U-B | Exact variant/revision and field power/load limits | 32 DI + 16 DO for limits/homes, drive enables, and relay-driven loads | Confirm field power, output ratings, relays, and suppression before wiring. |
| Firmware | Exact bitfile / firmware name | `7i80hdt_rmsvss6_8.bin`, SHA-256 `68e07e25f7227609209f3c6d120319ff2cdec0eada07e92986cc517734d2be58` | HAL pin names come from the loaded firmware. |
| Firmware | `readhmid` output | Save as `mesa/firmware/readhmid_YYYY-MM-DD.txt` (done: [`firmware/readhmid_2026-08-13.txt`](firmware/readhmid_2026-08-13.txt)) | Authoritative list of firmware functions and I/O pins; also D3 acceptance item 4. |
| LinuxCNC | HAL pin dump | Save as `mesa/firmware/hal_pins_YYYY-MM-DD.txt` | Authoritative list of actual HAL pin names. |
| LinuxCNC | Smart-serial configuration | Confirm HostMot2 port 0 channels 0 and 1 (`sserial_port_0=00xxxxxx`) | Required to make 7i84U-A / 7i84U-B appear; verify actual values from the loaded firmware. |

## Commands to run on the LinuxCNC control PC

Confirm the board is reachable over Ethernet (host NIC must be on 192.168.1.1/24):

```bash
ping 192.168.1.121
```

Read the Mesa hardware/firmware ID:

```bash
mesaflash --device 7i80hdt --addr 192.168.1.121 --readhmid > mesa/firmware/readhmid_$(date +%Y-%m-%d).txt
```

List available firmware options if needed:

```bash
mesaflash --device 7i80hdt --addr 192.168.1.121 --list
```

Cross-check the SHA-256 before running the write command — do this even though
the filename is no longer a placeholder, since D3 provenance (live readhmid +
HAL pin cross-check) is still open (see below):

```bash
sha256sum --check mesa/firmware/SHA256SUMS
sudo mesaflash --device 7i80hdt --addr 192.168.1.121 --write mesa/firmware/7i80hdt_rmsvss6_8.bin
sudo mesaflash --device 7i80hdt --addr 192.168.1.121 --reload
```

## Bitfile provenance (verification procedure)

**Status as of 2026-08-13: layout, identity, AND upstream source citation all
CONFIRMED.** The board is running `7i80hdt_rmsvss6_8.bin`, flashed 2026-08-11
(replacing a prior step/dir + encoder configuration; Andy confirmed this is
the intended resolver-feedback + PWM analog-servo firmware for this machine,
not the old stepper config). Evidence on hand:

- **Upstream source.** Requested by Andy directly from Peter Wallace (PCW,
  Mesa Electronics) by email. PCW's first reply (2026-08-10) named the base
  Efinity pin source as `PIN_RMSVSS6_8_72.vhd` and described its connector
  layout as "P1=7I49,P2=GPIO,P4=7I44" (note: PCW wrote **P4** — the 7i80HDT
  only has three daughter connectors, P1/P2/P3, so this is either a typo for
  P3 or shorthand from the VHDL/pin-file side that doesn't map 1:1 to board
  silkscreen; the direct `readhmid` readback below is unambiguous that the
  physical connector is P3, so treat "P4" as PCW's typo, not as new
  information that overrides the readback). The following day (2026-08-11)
  PCW sent the built binary at
  `freeby.mesanet.com/7i80hdt_rmsvss6_8.zip` — an official mesanet.com URL,
  filename-consistent with the flashed `7i80hdt_rmsvss6_8.bin`. (Source: direct
  email correspondence with Peter Wallace at Mesa Electronics, retained by
  Andy outside this repo — not linked here since the thread is a private
  email export.)

- **Binary + hash.** `~/Downloads/7i80hdt_rmsvss6_8.bin`,
  SHA-256 `68e07e25f7227609209f3c6d120319ff2cdec0eada07e92986cc517734d2be58`.
- **Pre-flash rollback backup.** `~/Downloads/7i80_flash_backup/7I80HDT_flash_backup_110826_190227.bin`,
  SHA-256 `2a8ebd52f0eb13a63751f54d46c139b1107467aee35fc804250353ddbbad6297`
  (the prior on-board flash contents, saved via `mesaflash --backup-flash`
  before writing the new bitfile — this is what restores the stepper config
  if needed).
- **Two independent `readhmid` reads, byte-identical:** flash-time
  (2026-08-11, `~/Downloads/7i80hdt_rmsvss6_8_readhmid.txt`) and a repo-committed
  re-check (2026-08-13, [`firmware/readhmid_2026-08-13.txt`](firmware/readhmid_2026-08-13.txt)). Also
  see [`firmware/sserial_2026-08-13.txt`](firmware/sserial_2026-08-13.txt) (SSLBP port 0, v1.43,
  8 channels, 2.5 MBd — no remote 7i84U identity strings returned yet, consistent
  with no 7i84U currently powered/cabled, not by itself a fault).
- **Confirmed layout** (from the readback, not the earlier "expected" list this
  section used to carry): P1 = ResolverMod (1) + PWM (6); P2 = `IOPort None`
  on all 24 pins (bare GPIO, unused); P3 = SSerial (8 channels, port 0). No
  `Encoder` module is present anywhere in the loaded firmware, which is
  consistent with `num_encoders=0` — the spindle-encoder path is unassigned by
  hardware, not just by config.

**D3 status:** all five acceptance items are now closed — layout, identity,
upstream source, the `readhmid` package location (item 4), the binary itself
(item 1 — committed at
[`firmware/7i80hdt_rmsvss6_8.bin`](firmware/7i80hdt_rmsvss6_8.bin), verified
against the recorded SHA-256), and the recovery procedure below (item 5).

### Recovery procedure (D3 item 5)

Source: the 7I80HD manual (7I80HDT's base family; same FPGA config
architecture), now committed at
[`../docs/Mesa Manuals/7i80hdman.pdf`](../docs/Mesa%20Manuals/7i80hdman.pdf),
"OPERATION / CONFIGURATION" section. The 7i80HDT holds **two** FPGA
configuration images in its SPI flash, with two independent recovery
mechanisms:

1. **Fallback (automatic).** The flash normally holds a user image and a
   fallback image. If the primary user configuration is corrupted (fails
   CRC), the FPGA boots the fallback image automatically — no jumper action
   needed — so the primary can be repaired remotely over Ethernet.
2. **Dual EEPROM / jumper W5 (manual).** If a configuration loads with a
   valid CRC but doesn't actually work (fallback isn't triggered), move
   jumper **W5 to the DOWN position** and power-cycle the board to boot from
   the secondary/backup flash instead, restoring Ethernet access so the
   primary flash can be repaired (e.g. by re-flashing with `mesaflash`).
   **Immediately restore W5 to the UP position** once the primary is
   repaired — leaving it DOWN risks writing a bad configuration to both
   flash images, which would require a JTAG bootstrap to recover from. W5
   UP = primary/normal operation (default); DOWN = secondary/backup only,
   for recovery.

Related, from the same manual section: **jumpers W1/W2 select the board's IP
address mode** (DOWN/DOWN = fixed `192.168.1.121` — this project's target
static IP is the jumper *default*; DOWN/UP = fixed from EEPROM; UP/DOWN =
BOOTP; UP/UP = invalid). **W3** enables/disables weak I/O pull-ups at
power-up/reset (UP = enabled, the suggested default). Confirm actual jumper
positions on the physical board against these defaults during the cabinet
photo pass — see [`../docs/cabinet_photo_checklist.md`](../docs/cabinet_photo_checklist.md).

To re-verify at any time:

```bash
mesaflash --device 7i80hdt --addr 192.168.1.121 --readhmid > mesa/firmware/readhmid_$(date +%Y-%m-%d).txt
mesaflash --device 7i80hdt --addr 192.168.1.121 --sserial > mesa/firmware/sserial_$(date +%Y-%m-%d).txt
diff mesa/firmware/readhmid_2026-08-13.txt mesa/firmware/readhmid_$(date +%Y-%m-%d).txt   # should be empty
```

If a future re-check disagrees with `firmware/readhmid_2026-08-13.txt`, treat
the board as having been reflashed or reset and re-derive every HAL pin name
before any further commissioning step.

After the firmware and smart-serial config are close, dump HAL pins:

```bash
halrun
loadrt hostmot2
loadrt hm2_eth board_ip="192.168.1.121" config="num_encoders=0 num_resolvers=3 num_pwmgens=4 num_stepgens=0 sserial_port_0=00xxxxxx"
show pin hm2 > mesa/firmware/hal_pins_$(date +%Y-%m-%d).txt
exit
```

If running from a shell and redirecting output:

```bash
halcmd show pin hm2 > mesa/firmware/hal_pins_$(date +%Y-%m-%d).txt
```

## Files to save in the Mazak project folder

- `mesa/firmware/readhmid_YYYY-MM-DD.txt` (done: [`firmware/readhmid_2026-08-13.txt`](firmware/readhmid_2026-08-13.txt))
- `mesa/firmware/hal_pins_YYYY-MM-DD.txt`
- Photo of the 7i80HDT board label (part number and revision).
- Photo of the 7i80HDT Ethernet connector and any IP/jumper settings.
- Photo of the 7i44 board label, its RS-422 screw terminals, and the P3 ribbon to the 7i80HDT.
- Photo of the 7i49 label/revision, the W2 jumper area (documentary — W2 does not affect axis channels 0/1/2, only 3/4/5), RESDRV/RESSIN/RESCOS terminals, and the P1 ribbon to the 7i80HDT.
- Photo of the Renishaw MP-3 probe SKIP1 wiring landing on 7i84U-B TB3 IN15 with 24 V opto-isolated input, and confirmation that bare P2 GPIO is not used for any field signal.
- Photo of each 7i84U label, jumper areas, smart-serial RJ45 connections to 7i44 physical channels 0 and 1, and field power terminals.
- Photo of each axis resolver nameplate/connector and the ohmmeter-verified winding-pair notes.
- The exact firmware/bitfile name and date.

## What I need to finalize the HAL

Send or save the following:

1. Exact 7i80HDT board revision.
2. 7i80HDT IP address and confirmed `hm2_eth` `board_ip` / config string.
3. Confirmed 7i44 P3 seating, sserial port assignments, and 7i84U-A/B cable pinouts.
4. Confirmed 7i49 P1 seating and W2 jumper state (documentary only — W2 does not affect axis channels 0/1/2).
5. Confirmed probe SKIP1 landing on 7i84U-B TB3 IN15 with 24 V opto-isolated input, and that all bare P2 GPIO pins are unused/spare (no 24 V field connections).
6. Exact 7i84U-A and 7i84U-B variants/revisions and their 7i44 ports (0 and 1).
7. The `readhmid` output (done: [`firmware/readhmid_2026-08-13.txt`](firmware/readhmid_2026-08-13.txt)).
8. The `hal_pins_YYYY-MM-DD.txt` output (authoritative generated HAL names).
9. Confirmed per-axis resolver label (Tamagawa TS2014N or other), winding pairs
   (ohmmeter-verified), return signal level, and resolver-to-machine-unit scale notes.
10. Confirmed analog drive command polarity/scaling notes.
11. Confirmed FR-SX spindle command mode notes (analog velocity + digital FWD/REV/ENA).
