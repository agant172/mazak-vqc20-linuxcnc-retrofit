# 7i97T TB4 → 7i84U J1 Sserial Cable
## Point-to-Point Wiring Diagram
**Source:** Mesa 7i97T manual (TB4 pinout) + Mesa 7i84 manual (J1 pinout)

---

## Overview

```
  MESA 7i97T                                    MESA 7i84U
  TB4 Screw Terminals          CAT5e STP         J1 RJ45 Jack
  (8-pin pluggable block)    (cut one end)       (plug intact end)

  TB4.13  GND  ────── Blue        ──── RJ45 pin 4  GND
  TB4.14  GND  ────── Blue/White  ──── RJ45 pin 5  GND
  TB4.15  RX+  ────── Green       ──── RJ45 pin 6  TX+   (7i97T RX  ← 7i84U TX)
  TB4.16  RX-  ────── Green/White ──── RJ45 pin 3  TX-
  TB4.17  TX+  ────── Orange      ──── RJ45 pin 2  RX+   (7i97T TX  → 7i84U RX)
  TB4.18  TX-  ────── Orange/White──── RJ45 pin 1  RX-
  TB4.19  +5V  ────── Brown/White ──── RJ45 pin 7  +5V   (powers 7i84U RS-422)
  TB4.20  +5V  ────── Brown       ──── RJ45 pin 8  +5V
```

> The TX/RX labels are **from the perspective of each card** — TX on the 7i97T connects to RX on the 7i84U and vice versa. This is correct, not a mistake.

---

## Step-by-Step Build Instructions

### What You Need
- 1× shielded CAT5e or CAT6 patch cable, **3–6 ft** (STP or FTP, not UTP)
- Wire strippers
- Small flat screwdriver for 3.5mm screw terminals

### Step 1 — Cut the Cable
Cut one end of the patch cable off cleanly, leaving the RJ45 connector intact on the other end. You'll plug the intact RJ45 end into the **7i84U J1 port**.

### Step 2 — Strip and Identify Wires
Strip the outer jacket back ~50mm. You'll find 4 twisted pairs. Untwist each pair ~15mm and strip individual wires ~6mm. Using 568B color standard:

| Pair | Wire Colors |
|---|---|
| Pair 1 | Blue / Blue-White |
| Pair 2 | Orange / Orange-White |
| Pair 3 | Green / Green-White |
| Pair 4 | Brown / Brown-White |

### Step 3 — Land on 7i97T TB4
TB4 is the **8-pin section** of the larger TB4 block (pins 13–20). Pin 13 is toward the left/top — check the square pad marking on the board for pin 1 orientation, then count to pin 13.

| TB4 Pin | Signal | Wire Color | Action |
|---|---|---|---|
| 13 | GND | Blue | Insert, tighten screw |
| 14 | GND | Blue/White | Insert, tighten screw |
| 15 | RX+ | Green | Insert, tighten screw |
| 16 | RX- | Green/White | Insert, tighten screw |
| 17 | TX+ | Orange | Insert, tighten screw |
| 18 | TX- | Orange/White | Insert, tighten screw |
| 19 | +5V | Brown/White | Insert, tighten screw |
| 20 | +5V | Brown | Insert, tighten screw |

**Torque:** Finger-tight + 1/4 turn. Do not overtighten 3.5mm terminals.

### Step 4 — Plug RJ45 into 7i84U J1
Plug the intact RJ45 end straight into the **J1 port** on the 7i84U. J1 is the RJ45 jack on the card edge. No adapter needed — straight through.

### Step 5 — Shield Grounding
The CAT5e cable has a foil/braid shield under the outer jacket. Connect the shield drain wire (bare wire running alongside the pairs) to:
- **7i97T side:** TB4 GND (pin 13 or 14) or the chassis GND lug near the Ethernet port
- **7i84U side:** TB1 GND terminal (pin 6, 7, or 8)

Ground the shield at **one end only** (7i97T end preferred) to prevent ground loop. Trim the shield wire at the 7i84U end without connecting it.

---

## Verification Before Power-On

Before powering up, verify with a continuity tester:

| Check | Expected |
|---|---|
| TB4.17 (TX+) to RJ45 pin 2 | Continuity |
| TB4.18 (TX-) to RJ45 pin 1 | Continuity |
| TB4.15 (RX+) to RJ45 pin 6 | Continuity |
| TB4.16 (RX-) to RJ45 pin 3 | Continuity |
| TB4.13/14 (GND) to RJ45 pin 4/5 | Continuity |
| TB4.19/20 (+5V) to RJ45 pin 7/8 | Continuity |
| Any TX pin to any RX pin | **NO continuity** (no cross-connect) |
| +5V to GND | **NO continuity** (no short) |

---

## What NOT to Do

- **Do not** plug the 7i84U J1 RJ45 into a network switch or the PC NIC — it is RS-422, not Ethernet. Voltage levels are different and you risk damaging the card.
- **Do not** use an Ethernet crossover cable — the pin mapping above already accounts for TX/RX swap.
- **Do not** use unshielded CAT5e (UTP) — the cabinet environment has significant electrical noise from servo drives and contactors.
- **Do not** ground the shield at both ends.
- **Do not** run this cable bundled with 24VDC power wiring — keep at least 50mm separation or run in separate duct.

---

## After Wiring — Software Check

Once powered, verify the link in LinuxCNC:

```bash
# Load LinuxCNC with your config, then in another terminal:
halcmd show all | grep 7i84
```

You should see 7i84U pin names appear. If nothing shows, check:
1. `sserial_port_0=00000000` in your HAL `loadrt` line for hm2_eth
2. Cable continuity
3. 7i84U TB1 24V power connected

---

*Source: Mesa 7i97T manual TB4 section + Mesa 7i84 manual J1 serial port pinout (p.6) + Mesa 7i94 RJ45 sserial reference. Verified against 568B color standard.*
