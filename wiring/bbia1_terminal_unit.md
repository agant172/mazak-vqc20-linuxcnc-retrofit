# BBIA-1 Terminal Unit — NC-to-Machine Interconnect

Machine: Mazak VQC-20/40, SN 060231
Source: `41434WB.pdf`, pages 80 and 82 (“Cable Connection Diagram with Terminal Unit of Enclosure,” drawing 4143075313; “Cable Connection Between NC Unit & CRT Unit,” drawing 4143075311). Physically confirmed against board silkscreen: **BBIA-1, Mitsubishi BN624A306H01, "YM VQC-20-40/50."**

## Why this board matters

With the Mazatrol NC unit physically removed, this board is now the primary candidate signal-injection point for the Mesa retrofit. It is a straight pass-through terminal unit: every top connector (which used to plug into the NC unit's back panel, drawing 4143075311/"Control Unit I/O PC's, Back Panel FX30") wires straight through to a corresponding bottom connector (which goes out to the machine side).

## Connector family — the "Honda" connectors on this board

The 19 rectangular connectors on the BBIA-1 are **Honda Tsushin Kogyo (HTK) MR-series** — the standard Meldas/Mitsubishi rectangular connector used across Japanese CNCs of this era. The Electrical Diagrams explicitly call out:

- **Board (chassis) side:** `MR-50RMW` and `MR-20RMW` (jack-screw receptacles)
- **Cable (harness) side:** `MR-50LF` and `MR-20LF`
- **Terminal-unit layout inventory (drawing 4143075304, sheet 04):** **10× MR-50RMW + 9× MR-20RMW**
- **CN11/CN12 on the SSR board** use the same 20-pin family but with `MR20-AMD` (chassis) / `MR20-LFH` (cable) shells

## Connector map (confirmed from schematic, pg 82)

| Ref | Shell | Pins | Routes to (outside connector) | Function summary |
|-----|-------|-----:|-------------------------------|------------------|
| CN1 | MR-20RMW | 20 | CA3 (MS3102A-20-29S) | Tool clamp / gear / 2nd-S / head lube / Z-axis ZRN dec. / spares |
| CN2 | MR-50RMW | 50 | CA4 (MS3102A-28-21S) | Magazine, tool-measure, door interlock, E-stop, ±LTZ, X/Y ZRN dec. |
| CN3 | MR-50RMW | 50 | TB5 (spindle controller) | E-stop, spindle SET/SRN/SRI, orient, way-lube alarm, ±LY, ±LZ, oil-temp, spindle timer |
| CN4 | MR-20RMW | 20 | CON4 / TB5 (spindle controller) | Spindle zero-speed, SS2/FA/FC, MS/OS, SET1/2, SRN/SRI, orient loop |
| CN5 | MR-20RMW | 20 | Relay card / external | External trip, RST, over-run EMG, EMG stop, common rails, EFHD, RCTLS, ISP1/2, 4-axis interlock cancel, OSP1/2, +24V |
| CN6 | MR-50RMW | 50 | Relay card / CB panel | CYFIN, servo ready, work light, SSET, CTL/OTR, ±LYZ, +24V, TAPC, MMAL, PW1, P24, mag oil-tool det., spindle-head lube, 0G returns, spindle spd/err/servo/ready/orient |
| CN7 | MR-50RMW | 50 | (2PC pallet changer, ext.) | MF, M-codes M11..M38, ZPX/Y/Z/4, MFA, FHDL, ZPZ2, AUTH, TUCC, FHDP, CSTL/CSTB, PCLCD, ISP3, MRDY, RST, OSP3/4, P1ON/P2ON, EXFIN, EXRST, INTX/Y/Z/4, EXAL, ONLN, ENCOL, EXCST, EXFHD, ERSBK, EMOP1 |
| CN11 | MR-20RMW (terminal unit) | 20 | SSR board CN11 (pin-for-pin) | **BBIA-1's own connector.** Magazine CW/CCW, tool unclamp, gear-shift hi/lo, spindle/work air blast, mist coolant, tool-measuring-arm extend, air jet, dust inhale, oil hole, flood coolant, magazine cover close, flood-coolant motor starter, **hydraulic pump/head-lube pump** (pin 16), 0G |
| CN11-SSR | MR-20 (SSR-bd, MR20-AMD/LFH) | 20 | CB panel loads (SSR outputs) | The **SSR board's own** connector (dwg 4143175307) — gear-shift hi/lo, spindle/work blast, air-blast cabinet, arm extend, air jet, dust inhale, oil-hole flood/mag, mag front/rear/spindle-head oil pumps, 0G |
| CN12 | MR-20 (SSR-bd, MR20-AMD/LFH) | 20 | CB panel loads (SSR outputs, 2nd bank) | 2PC-related outputs; second SSR bank |

**Note on CN11 — RESOLVED 2026-08-10.** There really are two things called "CN11" in the drawings, now both captured and disambiguated:

1. **BBIA-1 terminal-unit CN11 (MR-20RMW)** — 20 pins, drawing 4113075022 (sheet 85). This is the row labeled `CN11` above and in the CSV — it was **missing from this file until now**; only #2 below had been captured under the same "CN11" label, which was a real transcription gap (found while tracing `HYD_PUMP_ON`). Full pinout: [`bbia1_cn_pinouts.md`](bbia1_cn_pinouts.md).
2. **SSR-board's own connector (dwg 4143175307)** — a *different physical connector* that #1 routes onward to pin-for-pin. Relabeled **`CN11-SSR`** here and in the CSV so it can't be confused with #1 again.

The two do **not** share a pin-for-pin wire mapping (checked: e.g. terminal-unit pin 3 = wire 710/TOOL UNCLAMP vs CN11-SSR pin 3 = wire 710/GEAR SHIFT HIGH) — that reconciliation is still open. There is also a third, separate "CN11" mentioned in `bbia1_cn_pinouts.md` (a 25-way pallet-changer/coolant loom, dwg 03-81581-02) that hasn't been reconciled against either of the above — confirm which physical connector you're looking at by counting shell positions before cutting.

## Per-pin details for CN1–CN6 & CN11

**Full per-pin wire-labeling tables are in [`bbia1_cn_pinouts.md`](bbia1_cn_pinouts.md)** and the machine-readable CSV **[`bbia1_cn_pinouts.csv`](bbia1_cn_pinouts.csv)**. Each row lists:

- Connector, shell type, pin number
- Factory wire number (the label printed on the wire jacket — this is the label to reproduce on new ferrules)
- Signal name and function
- Inside connector (where it comes from on the board's mating side)
- Outside connector (CA3/CA4/TB5/etc., where it exits the board)

## Practical use for the Mesa retrofit

1. **Label with the factory wire number**, not the CN/pin, as the primary tag — that number is printed on the wire jacket and cross-references directly back to the Mazak prints for any future service.
2. **Common wires (0G, +24V, P24) group together** on Mesa field-power rails rather than individual card pins.
3. **E-stop conductors (EHB / EMB / EMC on CN2-40, CN2-41, CN3-1, CN5-4)** must land in the new safety-relay chain, not on a Mesa GPIO. LinuxCNC/HAL is not a safety input.
4. **Keep** all limit / ZRN dec. inputs (CN1-14, CN2-14..16, CN3-37, CN3-38, CN6-12, CN6-13), door/lube alarms, spindle zero-speed and orient.
5. **Retire** the 4-axis wiring on CN2, the pallet-changer / 2PC signals on CN7, CN3-40..44 spares, and the SSR-board CN11 output loom — those go to the new drive/solenoid stack instead of being preserved.

## Axis over-travel limits — only 2 of 6 individually routed to BBIA-1 (found 2026-08-10)

While filling `wiring/bbia1_source_dest.csv`'s remaining blank `bb_source` rows, re-read Dwg 4143075410 (41434WB p136, "Motion Switch Input (4)") — the sheet that carries all six primary-axis over-travel limits plus the three zero-return-deceleration (home) switches. Result:

- **+Y OVER TRAVEL → T.U. CN3-37** (wire `+LY`) and **-Z OVER TRAVEL → T.U. CN3-38** (wire `-LZ`) are each shown landing on an individually-labeled BBIA-1 connector box on the T.U. row — both match `bbia1_cn_pinouts.csv` exactly.
- **+X, -X, -Y, +Z over-travel have NO connector-box label on this sheet at all** — the P.C. (relay-card) trace goes straight down through the T.U. row without ever showing a `CNx-y` box, unlike the +Y/-Z pair. There is a `RELAY CARD` block on this sheet (PYOT/NZOT combining logic) that may fold some of these into the CN6-12/CN6-13 combined `+LYZ`/`-LYZ` chains already in the pinout CSV, but that only accounts for Y/Z, not X.
- **Zero-return deceleration (home) switches are all individually routed**: X → CN2-15 (`*DECX`, LS-42), Y → CN2-16 (`*DECY`, LS-52), Z → CN1-14 (`*DECZ`, LS-62) — all three confirmed against the board pinout CSV.

**Practical implication:** `X_LIMIT_PLUS`, `X_LIMIT_MINUS`, `Y_LIMIT_MINUS`, and `Z_LIMIT_PLUS` do not have a confirmed BBIA-1 landing pin. Either they route through a terminal block outside the 19-connector Honda family, or they're bussed together upstream of BBIA-1 in a way this sheet doesn't show. **Do not assume a pin for these four — field trace required before wiring the corresponding 7i84U-B inputs.** `Y_LIMIT_PLUS`/`Z_LIMIT_MINUS` and all three home switches are confirmed and safe to wire from the pins above.

## Provenance

Wire numbers and signal names are read directly from the Mazak schematic set (`41434WB.pdf`, drawings 4143075321 / 4113075022 / 4143015323 — Terminal-Unit Details sheets 1–3), OCR-assisted and visually verified page-by-page against the same set used elsewhere in this repo. Cross-referenced against the Mazak Corporation project files delivered 2025-10-13.
