# Mesa Firmware and HAL Pin Checklist

Use this checklist before finalizing the HAL files. The purpose is to make the selected
7i80HDT + 7i44 + 7i49 + 7i84U Ethernet architecture match the actual installed Mesa
hardware, firmware, Ethernet/IP configuration, smart-serial field-I/O connection, P3
GPIO breakout, and LinuxCNC HAL pin names.

## Selected architecture (2026-08-06 rev)

- LinuxCNC control PC connected to the Mesa 7i80HDT over Ethernet (`hm2_eth`, static IP
  192.168.1.121, host NIC enp0s31f6 at 192.168.1.1/24).
- Mesa 7i80HDT Ethernet FPGA host as the primary control board. Three 50-pin daughter
  connectors P1/P2/P3, 72 IO total, 5V-tolerant. The 7i80HDT carries no field terminals
  itself — all field wiring lands on the P1/P2/P3 daughter cards.
- Mesa **7i44 on P1** — 8-channel RS-422 smart-serial breakout. Port 0 drives the 7i84U;
  ports 1-7 are spare for future MPG / 4th-axis / second 7i84.
- Mesa **7i49 on P2** — plain 7i49 (not 7i49HV). Provides 6 resolver channels (X/Y/Z
  Tamagawa TS2014N on RES0/1/2, RES3-RES5 spare) and 6× ±10V analog outputs
  (X/Z/Y velocity commands on AOUT0/1/2, FR-SX spindle velocity on AOUT3, FR-SX orient
  reference on AOUT4, AOUT5 spare). Excitation set to 5 kHz.
- Mesa **7i84U on 7i44 port 0** — remote field-I/O expansion for ATC, hydraulics,
  coolant, air, magazine, utility I/O, and cabinet field wiring, near the green
  breakout PCB. Wiring and pin plan unchanged from single-7i84U plan (2026-08-03).
- **P3 field breakout (7i37TA or equivalent 50-pin card)** — direct FPGA GPIO for
  motion-critical, host-side, low-latency I/O: X/Y/Z limits (6 IN), X/Y/Z homes
  (3 IN), E-stop chain monitor (1 IN), Renishaw MP-3 probe SKIP1 (1 IN), X/Y/Z
  drive-enable outputs (3 OUT), and six former TB5 SSR overflow outputs (air blast,
  touch sensor blast, tap coolant blast, ATC barrier solenoid, flood valve, spare).
- Chosen firmware/bitfile is `7i80hdt_7i44_ss_7i49d.bit` (PCW-provided). Bitfile
  configuration: sserial ports on P1 (from 7i44), 7i49 resolver+analog on P2, direct
  GPIO on P3.

> The old 6i25 + 7i77 + optional 7i85/7i85S plan is historical/superseded. The 7i97T
> + 7i84U + 7i49 plan is also historical/superseded as of 2026-08-06 (7i97T returning
> to Mesa). Do not configure firmware for either.

## Information to record

| Group | Item to record | Expected / current plan | Why it matters |
|---|---|---|---|
| Host board | Exact Mesa board model/revision | 7i80HDT | Determines firmware target and HAL device name (expect `hm2_7i80` — confirm via readhmid). |
| Ethernet | 7i80HDT IP address / host NIC | 192.168.1.121 / enp0s31f6 (192.168.1.1/24) | Confirms the control PC can reach the board deterministically. |
| Ethernet | `hm2_eth` config string | `num_encoders=1 num_resolvers=3 num_pwmgens=4 num_stepgens=0 sserial_port_0=00000000` | Sets 7i49 pwmgen/resolver counts and smart-serial ports on the 7i44. |
| P2 (7i49) | Analog output count/scaling | 6× ±10 V; X/Z/Y axes on AOUT0/1/2, spindle AOUT3, orient AOUT4 | Required before safe first motion. 7i49 exposes analog outs as `hm2_7i80.0.pwmgen.NN` bipolar. |
| P2 (7i49) | Resolver interface present | Plain 7i49 (not 7i49HV) | Axis feedback is resolver, not encoder; firmware must expose resolver channels. |
| P2 (7i49) | Host connection path | On 7i80HDT connector P2 | Determines board tag and `num_resolvers` config; how the 7i49 attaches must be verified. |
| P2 (7i49) | Excitation frequency | 5 kHz (Tamagawa TS2014N spec 4.5 kHz; ±10% acceptable) | Must match Tamagawa/Mitsubishi resolver spec closely. |
| P2 (7i49) | Transformation ratio / signal level | K=0.5 (TS2014N nameplate): 5 V drive → ~2.5 V return; W2 half-drive if needed | Determines plain-7i49 vs 7i49HV and W2 half-drive/divider need. |
| P2 (7i49) | Excitation ownership | 7i49 is sole excitation source | TRA drives use tacho velocity loop; nothing else may drive the resolver windings. |
| P1 (7i44) | Smart-serial port assignment | Port 0 → 7i84U; ports 1-7 spare | Determines which sserial ports to enable in config. |
| P1 (7i44) | RS-422 pinout to 7i84U | Standard sserial 5-wire (TX+/TX-/RX+/RX-/GND, +5V) | Confirms cable pinout for RJ45 → 7i44 screw terminals. |
| P3 breakout | Field board model/type | 7i37TA (or 50-pin pigtail if custom) | Determines terminal layout and load capability for limits/homes/E-stop/probe/enables/SSR outputs. |
| P3 breakout | Field power and load limits | 24 VDC field bus; loads ≤500 mA per relay contact for 7i37TA | Determines whether interposing relays/suppression are needed for SSR overflow outputs. |
| P3 breakout | Onboard I/O power | 24 VDC P24/G24 from Meanwell DR-240-24 retrofit bus | Needed for isolated field I/O. |
| P3 breakout | I/O sourcing/sinking behavior | 7i37TA: 8 isolated OUT + 16 isolated IN (opto-isolated) | Affects field wiring and normal-state assumptions for limits/homes/E-stop. |
| 7i84U | Smart-serial connection path | Via 7i44 P1 port 0 | Determines smart-serial config and HAL names. |
| 7i84U | Exact 7i84U variant/revision | 7i84U | Output behavior and wiring strategy may differ. |
| 7i84U | Field power and output load limits | 24 V field I/O, relays likely | Determines whether interposing relays/suppression are needed. |
| Firmware | Exact bitfile / firmware name | `7i80hdt_7i44_ss_7i49d.bit` | HAL pin names come from the loaded firmware. |
| Firmware | `readhmid` output | Save as `mesa_readhmid.txt` | Authoritative list of firmware functions and I/O pins. |
| LinuxCNC | HAL pin dump | Save as `mesa_hal_pins.txt` | Authoritative list of actual HAL pin names. |
| LinuxCNC | `sserial_port_0` config string | `00000000` (8 chars for 7i44 port 0) | Required to make the 7i84U / smart-serial devices appear. |

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

After the firmware and smart-serial config are close, dump HAL pins:

```bash
halrun
loadrt hostmot2
loadrt hm2_eth board_ip="192.168.1.121" config="num_encoders=1 num_resolvers=3 num_pwmgens=4 num_stepgens=0 sserial_port_0=00000000"
show pin hm2
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
- Photo of the 7i49 label/revision, the W2 (half-drive) jumper area, RESDRV/RESSIN/RESCOS terminals, and the P2 ribbon to the 7i80HDT.
- Photo of the P3 breakout board (7i37TA), its terminal layout, and the P3 ribbon to the 7i80HDT.
- Photo of the 7i84U label, jumper areas, smart-serial RJ45 to 7i44 port 0, and field power terminals.
- Photo of each axis resolver nameplate/connector and the ohmmeter-verified winding-pair notes.
- The exact firmware/bitfile name and date.

## What I need to finalize the HAL

Send or save the following:

1. Exact 7i80HDT board revision.
2. 7i80HDT IP address and confirmed `hm2_eth` `board_ip` / config string.
3. Confirmed 7i44 P1 seating, sserial port assignments, and 7i84U cable pinout.
4. Confirmed 7i49 P2 seating and W2 (half-drive) jumper state.
5. Confirmed P3 breakout model (7i37TA vs alternative) and terminal-to-signal map.
6. Exact 7i84U variant/revision and its smart-serial port on the 7i44 (expect port 0).
7. The `mesa_readhmid.txt` output.
8. The `mesa_hal_pins.txt` output (authoritative generated HAL names).
9. Confirmed per-axis resolver label (Tamagawa TS2014N or other), winding pairs
   (ohmmeter-verified), return signal level, and resolver-to-machine-unit scale notes.
10. Confirmed analog drive command polarity/scaling notes.
11. Confirmed FR-SX spindle command mode notes (analog velocity + digital FWD/REV/ENA).
