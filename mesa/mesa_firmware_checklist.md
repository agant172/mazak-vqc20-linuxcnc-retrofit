# Mesa Firmware and HAL Pin Checklist

Use this checklist before finalizing the HAL files. The purpose is to make the selected
7i97T + 7i84U Ethernet architecture match the actual installed Mesa hardware, firmware,
Ethernet/IP configuration, smart-serial field-I/O connection, and LinuxCNC HAL pin names.

## Selected architecture

- LinuxCNC control PC connected to the Mesa 7i97T over Ethernet (`hm2_eth`, static IP).
- Mesa 7i97T Ethernet analog servo controller as the primary motion/control board:
  analog servo outputs (X/Y/Z), encoder inputs, spindle analog/digital command where
  appropriate, and core digital I/O per the board's capabilities.
- Mesa 7i84U remote field-I/O expansion on smart-serial for ATC, hydraulics, coolant,
  air, magazine, utility I/O, and cabinet field wiring, near the green breakout PCB.

> The old PCIe 6i25 + 7i77 + optional 7i85/7i85S plan is historical/superseded; do not
> configure firmware for it.

## Information to record

| Group | Item to record | Expected / current plan | Why it matters |
|---|---|---|---|
| Host board | Exact Mesa board model/revision | 7i97T | Determines firmware target and HAL device name (`hm2_7i97t` vs `hm2_7i97` — confirm). |
| Ethernet | 7i97T IP address / host NIC | Static IP, `hm2_eth board_ip=...` | Confirms the control PC can reach the board deterministically. |
| Ethernet | `hm2_eth` config string | Placeholder in HAL | Sets encoder/pwmgen/stepgen counts and smart-serial ports. |
| 7i97T | Analog output count/scaling | 6 analog outs; ±10 V axes, spindle TBD | Required before safe first motion. |
| 7i97T | Encoder input mode | Differential preferred / TBD | Encoder wiring and settings must match. |
| 7i97T | Onboard field I/O power | 24 VDC P24/G24 | Needed for isolated field I/O. |
| 7i97T | I/O sourcing/sinking behavior | TBD | Affects field wiring and normal-state assumptions. |
| 7i84U | Smart-serial connection path | Via 7i97T smart-serial port | Determines smart-serial config and HAL names. |
| 7i84U | Exact 7i84U variant/revision | 7i84U | Output behavior and wiring strategy may differ. |
| 7i84U | Field power and output load limits | 24 V field I/O, relays likely | Determines whether interposing relays/suppression are needed. |
| Firmware | Exact bitfile / firmware name | 7i97T firmware with 7i84U smart-serial | HAL pin names come from the loaded firmware. |
| Firmware | `readhmid` output | Save as `mesa_readhmid.txt` | Authoritative list of firmware functions and I/O pins. |
| LinuxCNC | HAL pin dump | Save as `mesa_hal_pins.txt` | Authoritative list of actual HAL pin names. |
| LinuxCNC | `sserial_port_0` config string | Placeholder currently `000000` | Required to make the 7i84U / smart-serial devices appear. |

## Commands to run on the LinuxCNC control PC

Confirm the board is reachable over Ethernet (set the host NIC to the 7i97T subnet first):

```bash
ping <7i97t-ip>
```

Read the Mesa hardware/firmware ID:

```bash
mesaflash --device 7i97t --addr <7i97t-ip> --readhmid > mesa_readhmid.txt
```

List available firmware options if needed:

```bash
mesaflash --device 7i97t --addr <7i97t-ip> --list
```

After the firmware and smart-serial config are close, dump HAL pins:

```bash
halrun
loadrt hostmot2
loadrt hm2_eth board_ip="<7i97t-ip>" config="num_encoders=6 num_pwmgens=0 num_stepgens=0 sserial_port_0=000000"
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
- Photo of the 7i97T board label (part number and revision).
- Photo of the 7i97T Ethernet connector and any IP/jumper settings.
- Photo of the 7i84U label, jumper areas, smart-serial connection, and field power terminals.
- The exact firmware/bitfile name and date.

## What I need to finalize the HAL

Send or save the following:

1. Exact 7i97T board model and revision.
2. 7i97T IP address and confirmed `hm2_eth` `board_ip` / config string.
3. Exact 7i84U variant/revision and its smart-serial port on the 7i97T.
4. The `mesa_readhmid.txt` output.
5. The `mesa_hal_pins.txt` output (authoritative generated HAL names).
6. Confirmed encoder type and scale notes.
7. Confirmed analog drive command polarity/scaling notes.
8. Confirmed FR-SX spindle command mode notes.
