# Mesa Firmware and HAL Pin Checklist

Use this checklist before finalizing the HAL files. The purpose is to make the selected
7i80HDT + 7i44 + 7i49 + 7i84U-A + 7i84U-B Ethernet architecture match the actual installed Mesa
hardware, firmware, Ethernet/IP configuration, smart-serial field-I/O connections, the
bare P3 probe GPIO exception, and LinuxCNC HAL pin names.

## Selected architecture (2026-08-06 rev)

- LinuxCNC control PC connected to the Mesa 7i80HDT over Ethernet (`hm2_eth`, static IP
  192.168.1.121, host NIC enp0s31f6 at 192.168.1.1/24).
- Mesa 7i80HDT Ethernet FPGA host as the primary control board. Three 50-pin daughter
  connectors P1/P2/P3, 72 IO total, 5V-tolerant. The 7i80HDT carries no field terminals
  itself — all field wiring lands on the P1/P2/P3 daughter cards.
- Mesa **7i44 on P1** — 8-channel RS-422 smart-serial breakout. Port 0 drives
  **7i84U-A** near the green breakout PCB; port 1 drives **7i84U-B** for
  safety inputs and relay-driven loads; ports 2-7 are spare.
- Mesa **7i49 on P2** — plain 7i49 (not 7i49HV). Provides 6 resolver channels (X/Y/Z
  Tamagawa TS2014N on RES0/1/2, RES3-RES5 spare) and 6× ±10V analog outputs
  (X/Z/Y velocity commands on AOUT0/1/2, FR-SX spindle velocity on AOUT3, FR-SX orient
  reference on AOUT4, AOUT5 spare). Excitation set to 5 kHz.
- Mesa **7i84U-A on 7i44 port 0** — remote field I/O for ATC, hydraulics,
  coolant, air, magazine, utility I/O, and cabinet field wiring.
- Mesa **7i84U-B on 7i44 sserial channel 1** — remote field I/O for X/Y/Z
  limits and homes (TB3 IN0-8), X/Y/Z drive enables (TB3 OUT0-2), relay-
  driven loads (TB3 OUT3-7), and the Renishaw MP-3 probe (TB3 IN15). Per
  the Mesa 7i84 manual, TB1 is the 8-pin power connector, TB3 carries the
  first 16 inputs + first 8 outputs, and TB2 carries the second 16 inputs
  + second 8 outputs.
- **P3 unused/spare** — no daughter card; all bare-FPGA GPIO. **Not safe for
  24 V field wiring** (3.3 V logic without opto-isolation). The Renishaw MP-3
  probe was previously bound to P3 `gpio.042` in an earlier revision; it has
  been moved to 7i84U-B input-15 (opto-isolated 24 V input).
- Chosen firmware/bitfile is `7i80hdt_7i44_ss_7i49d.bit`. **The name is
  UNVERIFIED**: this is the working assumption, not a value that has been
  read back from the board with `readhmid` or cited from a PCW/Mesa email
  or forum thread. See "Bitfile provenance" below for how to close that gap.
  Assumed configuration: sserial port on P1 (from 7i44), 7i49 resolver +
  analog on P2, bare GPIO on P3.

## Information to record

| Group | Item to record | Expected / current plan | Why it matters |
|---|---|---|---|
| Host board | Exact Mesa board model/revision | 7i80HDT | Determines firmware target and HAL device name (expect `hm2_7i80` — confirm via readhmid). |
| Ethernet | 7i80HDT IP address / host NIC | 192.168.1.121 / enp0s31f6 (192.168.1.1/24) | Confirms the control PC can reach the board deterministically. |
| Ethernet | `hm2_eth` config string | `num_encoders=1 num_resolvers=3 num_pwmgens=4 num_stepgens=0 sserial_port_0=00xxxxxx` | Sets 7i49 pwmgen/resolver counts and smart-serial channels on the 7i44 (two 7i84Us on channels 0-1, remaining channels released as spare GPIO). |
| P2 (7i49) | Analog output count/scaling | 6× ±10 V; X/Z/Y axes on AOUT0/1/2, spindle AOUT3, orient AOUT4 | Required before safe first motion. 7i49 exposes analog outs as `hm2_7i80.0.pwmgen.NN` bipolar. |
| P2 (7i49) | Resolver interface present | Plain 7i49 (not 7i49HV) | Axis feedback is resolver, not encoder; firmware must expose resolver channels. |
| P2 (7i49) | Host connection path | On 7i80HDT connector P2 | Determines board tag and `num_resolvers` config; how the 7i49 attaches must be verified. |
| P2 (7i49) | Excitation frequency | 5 kHz (7i49 selectable: 2.5/5/10 kHz; TS2014N141E26 datasheet is 4.5 kHz — 5 kHz is closest available, ~11% above nominal; **Tamagawa page publishes no frequency tolerance**, verify on scope at commissioning) | 5 kHz is a working baseline to verify, not a tolerance claim. |
| P2 (7i49) | Transformation ratio / signal level | K=0.5 (TS2014N141E26 datasheet, no tolerance published); 7i49 default drive ~2 V RMS → SIN/COS ~1 V RMS on a 2:1 resolver | Scope RESDRV excitation and RESSIN/RESCOS amplitude and phase at rest and under motion; **W2 does NOT affect axis channels 0/1/2** (only 3/4/5). |
| P2 (7i49) | Excitation ownership | 7i49 is sole excitation source | TRA drives use tacho velocity loop; nothing else may drive the resolver windings. |
| P1 (7i44) | Smart-serial channel assignment | Port 0 with channel 0 → 7i84U-A, channel 1 → 7i84U-B, channels 2-7 disabled | The 7i44 exposes one sserial port with 8 channels; both 7i84Us share port 0. Configured via `sserial_port_0=00xxxxxx`. |
| P1 (7i44) | RS-422 pinout to 7i84U-A/B | Standard sserial 5-wire (TX+/TX-/RX+/RX-/GND, +5V) | Confirms each RJ45 → 7i44 screw-terminal connection. |
| P3 bare GPIO | All pins unused/spare | Not wired to any 24 V field signal (3.3 V logic, no opto-isolation) | Prevents accidental FPGA damage. Probe now on 7i84U-B input-15. |
| 7i84U-A | Smart-serial connection path | Via 7i44 P1, sserial channel 0 (`hm2_7i80.0.7i84.0.0.*`) | Determines smart-serial config and HAL names. |
| 7i84U-A | Exact variant/revision and field power/load limits | 32 DI + 16 DO field I/O | Output behavior and wiring strategy may differ; confirm field power and output ratings. |
| 7i84U-B | Smart-serial connection path | Via 7i44 P1, sserial channel 1 (`hm2_7i80.0.7i84.0.1.*`) | Determines smart-serial config and HAL names. |
| 7i84U-B | Exact variant/revision and field power/load limits | 32 DI + 16 DO for limits/homes, drive enables, and relay-driven loads | Confirm field power, output ratings, relays, and suppression before wiring. |
| Firmware | Exact bitfile / firmware name | `7i80hdt_7i44_ss_7i49d.bit` | HAL pin names come from the loaded firmware. |
| Firmware | `readhmid` output | Save as `mesa_readhmid.txt` | Authoritative list of firmware functions and I/O pins. |
| LinuxCNC | HAL pin dump | Save as `mesa_hal_pins.txt` | Authoritative list of actual HAL pin names. |
| LinuxCNC | Smart-serial configuration | Confirm the generated configuration enables 7i44 ports 0 and 1 | Required to make 7i84U-A / 7i84U-B appear; verify actual values from the loaded firmware. |

## Commands to run on the LinuxCNC control PC

Confirm the board is reachable over Ethernet (host NIC must be on 192.168.1.1/24):

```bash
ping 192.168.1.121
```

Read the Mesa hardware/firmware ID:

```bash
mesaflash --device 7i80hdt --addr 192.168.1.121 --readhmid > mesa_readhmid.txt
```

List available firmware options if needed:

```bash
mesaflash --device 7i80hdt --addr 192.168.1.121 --list
```

Flash the target firmware bitfile (only when a change is required):

```bash
sudo mesaflash --device 7i80hdt --addr 192.168.1.121 --write 7i80hdt_7i44_ss_7i49d.bit
sudo mesaflash --device 7i80hdt --addr 192.168.1.121 --reload
```

## Bitfile provenance (verification procedure)

The project's HAL currently assumes the bitfile `7i80hdt_7i44_ss_7i49d.bit`.
Until that assumption is backed by a source that can be cited, the bitfile
should be treated as **UNVERIFIED** in every doc that names it.

Any ONE of the following closes the gap; commit the artifact into `mesa/`
and update `README.md` to remove the "provenance unverified" note.

1. **Read the running board.** With the 7i80HDT powered and on the network,
   run:

   ```bash
   mesaflash --device 7i80hdt --addr 192.168.1.121 --readhmid \
     > mesa/readhmid_$(date +%Y%m%d).txt
   git add mesa/readhmid_*.txt
   ```

   Then check the dumped header against what this stack expects:
   - `PIN INFO` block reports 3 IO connectors (P1/P2/P3).
   - P1 modules include a smart-serial instance (name usually `SSerial`
     with 8 channels) - matches the 7i44 breakout.
   - P2 modules include a `Resolver` block with at least 3 channels and a
     `PWM` block with at least 4 channels - matches the 7i49.
   - P3 modules list only `IOPort` (bare GPIO), no smart-serial or analog.
   - Pin counts: `num_resolvers=3`, `num_pwmgens>=4`, `num_encoders>=1`
     (matches the `hm2_eth config="..."` string in `mazak_vqc_20_40.hal`).

   If any of those disagree, the loaded bitfile is NOT `7i80hdt_7i44_ss_7i49d`
   and every HAL pin name that starts with `hm2_7i80.0.*` needs to be
   re-derived from the readhmid output before first motion.

2. **Cite the source.** If PCW or Mesa provided the bitfile by email or in a
   forum thread, save the message/URL and add a note to this file
   ("Bitfile confirmed as `<name>` via <source>, <date>").

3. **Cross-check with the LinuxCNC pin dump.** After a successful `halrun`
   load, capture the pin list and commit it as `mesa/hal_pins_YYYYMMDD.txt`
   (see "After the firmware and smart-serial config are close" section
   above). The pin names present there are authoritative regardless of what
   the bitfile is called.

Until at least one of the three exists, `linuxcnc/*.hal` pin names,
`sserial_port_0=00xxxxxx`, `num_resolvers=3`, and `num_pwmgens=4` remain
informed guesses aligned to the assumed bitfile.

After the firmware and smart-serial config are close, dump HAL pins:

```bash
halrun
loadrt hostmot2
loadrt hm2_eth board_ip="192.168.1.121" config="num_encoders=1 num_resolvers=3 num_pwmgens=4 num_stepgens=0 sserial_port_0=00xxxxxx"
show pin hm2 > mesa/hal_pins_$(date +%Y%m%d).txt
exit
```

If running from a shell and redirecting output:

```bash
halcmd show pin hm2 > mesa_hal_pins.txt
```

## Files to save in the Mazak project folder

- `mesa_readhmid.txt`
- `mesa_hal_pins.txt`
- Photo of the 7i80HDT board label (part number and revision).
- Photo of the 7i80HDT Ethernet connector and any IP/jumper settings.
- Photo of the 7i44 board label, its RS-422 screw terminals, and the P1 ribbon to the 7i80HDT.
- Photo of the 7i49 label/revision, the W2 jumper area (documentary — W2 does not affect axis channels 0/1/2, only 3/4/5), RESDRV/RESSIN/RESCOS terminals, and the P2 ribbon to the 7i80HDT.
- Photo of the Renishaw MP-3 probe SKIP1 wiring landing on 7i84U-B TB3 IN15 with 24 V opto-isolated input, and confirmation that bare P3 GPIO is not used for any field signal.
- Photo of each 7i84U label, jumper areas, smart-serial RJ45 connections to 7i44 ports 0 and 1, and field power terminals.
- Photo of each axis resolver nameplate/connector and the ohmmeter-verified winding-pair notes.
- The exact firmware/bitfile name and date.

## What I need to finalize the HAL

Send or save the following:

1. Exact 7i80HDT board revision.
2. 7i80HDT IP address and confirmed `hm2_eth` `board_ip` / config string.
3. Confirmed 7i44 P1 seating, sserial port assignments, and 7i84U-A/B cable pinouts.
4. Confirmed 7i49 P2 seating and W2 jumper state (documentary only — W2 does not affect axis channels 0/1/2).
5. Confirmed probe SKIP1 landing on 7i84U-B TB3 IN15 with 24 V opto-isolated input, and that all bare P3 GPIO pins are unused/spare (no 24 V field connections).
6. Exact 7i84U-A and 7i84U-B variants/revisions and their 7i44 ports (0 and 1).
7. The `mesa_readhmid.txt` output.
8. The `mesa_hal_pins.txt` output (authoritative generated HAL names).
9. Confirmed per-axis resolver label (Tamagawa TS2014N or other), winding pairs
   (ohmmeter-verified), return signal level, and resolver-to-machine-unit scale notes.
10. Confirmed analog drive command polarity/scaling notes.
11. Confirmed FR-SX spindle command mode notes (analog velocity + digital FWD/REV/ENA).
