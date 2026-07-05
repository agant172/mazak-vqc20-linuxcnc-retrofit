# Mesa Firmware and HAL Pin Checklist

Use this checklist before finalizing the HAL files. The purpose is to make the selected cabinet tower + PCIe Mesa architecture match the actual installed Mesa hardware, firmware, connector order, and LinuxCNC HAL pin names.

## Selected architecture

- Tower PC inside the Mazak cabinet.
- PCIe Mesa host card, likely 6i25 or current compatible equivalent.
- 7i77-class analog servo card for X/Y/Z, spindle analog, encoders, and critical I/O.
- 7i84 near the green breakout PCB for ATC, hydraulics, coolant, air, and utility I/O.
- 7i85/7i85S optional only if extra encoder, stepgen, MPG, or future 4th-axis capacity is needed.

## Information to record

| Group | Item to record | Expected / current plan | Why it matters |
|---|---|---|---|
| Host card | Exact Mesa host card model | 6i25 PCIe or current equivalent | Determines firmware target and HAL device name. |
| Host card | PCIe slot recognized by LinuxCNC PC | Tower PC inside cabinet | Confirms the PC can see the Mesa card. |
| Connector order | 6i25 P2 destination | 7i77 likely | Determines firmware pinout and ribbon-cable routing. |
| Connector order | 6i25 P3 destination | Optional 7i85/7i85S or unused | Determines whether second connector firmware is needed. |
| 7i77 | Exact 7i77 variant | 7i77 or 7i77D TBD | Output sourcing/sinking behavior affects wiring. |
| 7i77 | Field power voltage | 24 VDC P24/G24 | Needed for isolated field I/O. |
| 7i77 | Encoder input mode | Differential preferred / TBD | Encoder wiring and jumpers/settings must match. |
| 7i77 | Analog output scaling | ±10 V axes, spindle TBD | Required before safe first motion. |
| 7i84 | Connection path | Via 7i77 smart-serial / RS-422 likely | Determines smart-serial config and HAL names. |
| 7i84 | Exact 7i84 variant | 7i84 or 7i84D TBD | Output behavior and wiring strategy may differ. |
| 7i84 | Field power and output load limits | 24 V field I/O, relays likely | Determines whether interposing relays/suppression are needed. |
| Firmware | Exact bitfile / firmware name | 6i25 + 7i77 + 7i84 or 7i77-only starter | HAL pin names come from the loaded firmware. |
| Firmware | `readhmid` output | Save as `mesa_readhmid.txt` | Authoritative list of firmware functions and I/O pins. |
| LinuxCNC | HAL pin dump | Save as `mesa_hal_pins.txt` | Authoritative list of actual HAL pin names. |
| LinuxCNC | `sserial_port_0` config string | Placeholder currently `000000` | Required to make 7i84 / smart-serial devices appear. |

## Commands to run on the LinuxCNC tower

Confirm the card is visible:

```bash
lspci | grep -i mesa
```

Read the Mesa hardware/firmware ID:

```bash
mesaflash --device 6i25 --readhmid > mesa_readhmid.txt
```

List available firmware options if needed:

```bash
mesaflash --device 6i25 --list
```

After the firmware and smart-serial config are close, dump HAL pins:

```bash
halrun
loadrt hostmot2
loadrt hm2_pci config="num_encoders=6 num_pwmgens=0 num_stepgens=0 sserial_port_0=000000"
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
- Photo of the Mesa host card label.
- Photo of each 6i25 ribbon cable showing connector label and destination card.
- Photo of the 7i77 and 7i84 labels, jumper areas, and field power terminals.
- The exact firmware/bitfile name and date.

## What I need to finalize the HAL

Send or save the following:

1. Exact host card model.
2. Daughtercard order on each 6i25 connector.
3. Exact 7i77/7i77D and 7i84/7i84D variants.
4. The `mesa_readhmid.txt` output.
5. The `mesa_hal_pins.txt` output.
6. Whether 7i85/7i85S is installed on day one.
7. Confirmed encoder type and scale notes.
8. Confirmed analog drive command polarity/scaling notes.

