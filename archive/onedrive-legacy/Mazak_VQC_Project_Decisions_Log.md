# Mazak VQC 20/40 LinuxCNC Retrofit — Project Decisions Log

**Machine:** Mazak VQC 20/40 Vertical Machining Center  
**Control Conversion:** Legacy M2 OS → LinuxCNC 2.9.x (Debian 12, PREEMPT_RT kernel)  
**Last Updated:** 2026-06-21 (Decision #11 — hydraulic confirmed, solenoid corrections applied)

---

## Decision 1 — Control Architecture

**Date:** 2026-06-02  
**Decision:** Tower PC mounted inside the Mazak cabinet running LinuxCNC on bare metal Debian.  
**Rationale:** Avoids laptop dependency, keeps all control hardware self-contained in the cabinet, simplifies wiring. Laptop + external Ethernet Mesa was evaluated and rejected as primary architecture (retained as a fallback/diagnostic option only).  
**Status:** Confirmed

---

## Decision 2 — Mesa Card Stack (Original Plan)

**Date:** 2026-06-02  
**Original Plan:**
- Mesa **6i25** — PCIe host card (mounted in tower PC)
- Mesa **7i77** — Analog servo + spindle I/O (6-axis ±10V, encoders, safety I/O) via DB25 from 6i25
- Mesa **7i84** — 48-point utility I/O (ATC, hydraulics, coolant) via sserial from 7i77
- Mesa **7i85** — Optional, only if 4th axis or additional encoders needed

**Signal partitioning:**
- 7i77: all axis motion, encoder feedback, drive enables, E-stop safety chain
- 7i84: ATC solenoids, hydraulic pressure, coolant, limit switches, panel I/O

**HAL files generated for this stack:** `motion_7i77.hal`, `field_7i84.hal`  
**Status:** Superseded by Decision 3

---

## Decision 3 — Architecture Pivot to Ethernet Mesa

**Date:** 2026-06-12  
**Trigger:** Mesa 7i77 out of stock (discontinued). Mesa 7i77U replacement also out of stock.  
**New Plan:**
- Mesa **7i97T** — Ethernet analog servo card (replaces both 6i25 and 7i77)
- Mesa **7i84U** — Utility I/O via sserial (unchanged role, upgraded to U variant)
- Mesa **7i49** or **7i49HV** — Resolver interface for all three axes via P1 DB25 expansion header

**Why 7i97T:**
- Single card replaces the 6i25 + 7i77 combo
- 6-axis ±10V analog outputs, 6 encoder inputs, onboard 16in/6out I/O
- Has both an RS-422/sserial port (for 7i84U) AND a 26-pin expansion header (P2, for 7i49)
- In stock at Mesa ($279 with terminal board)
- No PCIe slot required — opens up more PC hardware options

**HAL driver change:** `hm2_pci` → `hm2_eth`. HAL pin prefix changes from `hm2_6i25.0` to `hm2_7i97t.0`. Servo thread target: 1 kHz (adequate for velocity-mode analog servos).

**Status:** Confirmed — parts list updated to reflect this stack

---

## Decision 4 — 7i74 Sserial Expander NOT Required

**Date:** 2026-06-13  
**Decision:** 7i74 is not needed in this build.  
**Rationale:** The 7i74 is an 8-channel sserial expander for PCIe cards (connects via DB25). The 7i97T already has:
1. One dedicated RS-422/sserial port on TB4 (screw terminals) → connects 7i84U via modified CAT5/6
2. One 26-pin P2 expansion header → connects 7i49 resolver card via IDC26-to-DB25 cable

Both expansion needs are covered natively. 7i74 was briefly considered then confirmed unnecessary.  
**Status:** Confirmed — removed from parts list

---

## Decision 5 — 7i84U vs 7i84

**Date:** 2026-06-13  
**Decision:** Use **7i84U** (Universal output version).  
**Rationale:**
- 7i84 is now marked obsolete by Mesa; 7i84U is the current replacement
- Identical I/O count (32 inputs / 16 outputs) and sserial interface
- 7i84U adds per-output configurability: each of the 16 outputs can be independently set to sourcing, sinking, or push-pull via HAL `setp` bitmask parameters (`output_source`, `output_sink`)
- Default behavior is identical to original 7i84 (sourcing) — no penalty for using U version
- Useful for Mazak cabinet where some relays/solenoids may expect sinking outputs

**HAL note:** Set output modes in HAL with:
```
setp hm2_7i97t.0.7i84.0.output_source 0xFFFF   # all sourcing (default)
setp hm2_7i97t.0.7i84.0.output_sink   0x0000   # adjust per-bit as needed
```
**Status:** Confirmed

---

## Decision 6 — Resolver Interface Card (7i49 — pending TR confirmation)

**Date:** 2026-06-13  
**Decision Needed:** **7i49** vs **7i49HV** — awaiting RT-5XA transformation ratio from nameplate.  
**The difference:**
- **7i49** — Standard. Drive voltage ~2V RMS. Designed for 2:1 transformation ratio resolvers (TR ≈ 0.5 — most common in Japanese machine tools of this era).
- **7i49HV** — High voltage variant. For 1:1 ratio or resolvers requiring higher excitation voltage.

**Current assumption:** Standard **7i49** (TR ≈ 0.5). See Decision 8 for resolver identification.

**Action Required:** Confirm TR from RT-5XA nameplate on motor. If TR = 0.5, order standard **7i49**. If TR = 1.0 or output voltage spec is unusual, order **7i49HV**.

**Connection:** 7i49 connects to **7i97T P1 DB25 expansion header** via DB25 cable. NOT on the sserial port.  
**Status:** Partially confirmed (card type identified; TR and HV vs standard still pending nameplate check)

---

## Decision 7 — PC Hardware Requirements

**Date:** 2026-06-12  
**Requirements for Ethernet Mesa architecture:**
- Any modern tower PC (mini-ITX or mATX) — PCIe slot no longer required for Mesa host card
- **Intel NIC strongly preferred** (Intel I210-T1 or I350-T1 PCIe x1 card) — Realtek NICs can cause latency spikes on PREEMPT_RT kernel with Ethernet Mesa
- GPU: AMD Radeon RX 550 — uses `amdgpu` driver, low power, native HDMI/DP, good RT kernel latency. If latency spikes observed, add `amdgpu.dc=0` to GRUB kernel parameters.
- RAM: 8GB DDR4 minimum
- SSD: 120GB+ for Debian install

**BIOS settings (critical for RT latency):**
- Disable PCIe ASPM (Active State Power Management)
- Disable Hyperthreading, Turbo Boost, C-states
- Set CPU governor to `performance`

**Status:** Confirmed

---

## Decision 8 — All Three Axes Use RT-5XA Resolvers (No Encoders)

**Date:** 2026-06-21  
**Decision:** All three axes (X, Y, Z) use **Mitsubishi RT-5XA** resolvers for position feedback. There are no encoders on this machine.  
**Rationale:** Parts manual explicitly lists RT-5XA on all three servo motors. TB1 and TB2 encoder inputs on the 7i97T are unused and must not be wired.  
**Motors:**
- X axis: HD81-12S-TT-A + RT-5XA resolver
- Y axis: HD81-12S-TT-A + RT-5XA resolver
- Z axis: HD101-12-TT-A + RT-5XA resolver + brake N1J-L2-201

**Impact on hardware:** The **7i49** now handles all three resolver channels, not just Y as originally planned. Channel assignments:
- `resolver.00` → X axis
- `resolver.01` → Y axis
- `resolver.02` → Z axis

**Impact on HAL/INI:**
- Remove all `encoder` component references for X, Y, Z in HAL
- Wire `hm2_7i97t.0.resolver.00/01/02.position` to `axis.0/1/2.motor-pos-fb`
- pwmgen mapping: `pwmgen.00` = X (TB3-4), `pwmgen.01` = Z (TB3-8), `pwmgen.02` = Y (TB3-12)
- Resolver scale placeholder: **332,893 counts/inch** (65,536 counts/rev ÷ 0.19685" pitch) — confirm actual ballscrew pitch before use
- TB1 and TB2 on 7i97T are **NOT USED**

**Status:** Confirmed — parts manual source

---

## Decision 9 — I/O Expansion: Full 7i84U Assignment, BCD Magazine Encoder, Relay Panel

**Date:** 2026-06-21  
**Source:** Machine parts manual research (proximity switch and solenoid part numbers confirmed from manual)  
**Status:** Confirmed — subsequently corrected by Decision 11 (solenoid part numbers and relay voltage)

> **NOTE:** The solenoid part numbers and relay contact voltage in this decision were incorrect at time of writing. See Decision 11 for the correct solenoid identification. The relay panel is still required but contact voltage must be measured at the manifold before specifying relay type.

### Sensor Part Numbers (Inputs — Confirmed)
- **PRS 8 (TOOL_UNCLAMP_CONF):** Yamatake FL1-2D6-E3 proximity switch
- **PRS 9 (TOOL_CLAMP_CONF):** Balluff BES-516-325-D0X-3 proximity sensor
- **PRS 10 (GEAR_HI_CONF):** Proximity switch — spindle high gear verify
- **PRS 12 (GEAR_LO_CONF):** Proximity switch — spindle low gear verify
- **PRS 21–25 (MAG_BCD_BIT0–4):** 5 proximity switches, binary-encoded tool magazine pocket position

### Input Count — Updated by Decision 11, revised 2026-06-24
Total 7i84U inputs: **22 of 32 used** (10 spare — in-00 through in-09 freed when limits/homes/estop confirmed on TB5 7i97T onboard inputs, not 7i84U). Spare inputs recommended for ATC zone interlocks (PRS-55→in-00, PRS-66→in-01, PHS-181→in-02, PHS-182→in-03) — second sserial card no longer required for these signals.

Breakdown:
- X/Y/Z home switches: 3 (in-00, in-03, in-06)
- X/Y/Z negative/positive overtravel limits: 6 (in-01/02, in-04/05, in-07/08)
- E-stop chain (NC): 1 (in-09)
- X/Y/Z drive faults: 3 (in-10/11/12)
- Spindle at speed + spindle fault (FR-SX VFD): 2 (in-13/14)
- Tool clamp/unclamp confirm (PRS 9, PRS 8): 2 (in-15/16)
- Gear hi/lo confirm (PRS 10, PRS 12): 2 (in-17/18)
- Tool magazine BCD pocket position (PRS 21–25): 5 (in-19 through in-23)
- Door interlock, lube level, coolant level: 3 (in-24/25/26)
- Hydraulic pressure OK (Sanwa SPS-8T-PC-20): 1 (in-27) — added Decision 11
- Cycle-start PB, feed-hold PB, single-block, servo-ready: 4 (in-28 through in-31) — added Decision 11

### Relay Panel — REQUIRED (contact voltage TBD — see Decision 11)
The 7i84U outputs are 24VDC only and cannot drive solenoid coils directly. An intermediate relay panel (DIN rail, 24VDC coil) is required for gear-shift, tool clamp/unclamp, and ATC outputs.

**Relay assignments (correct solenoid parts — corrected by Decision 11):**
| Relay | Driven By | Load | Signal |
|---|---|---|---|
| RLY-1 | 7i84U out-07 | Fujikoshi SA-G01-E3X → SOL-13 | GEAR_HI_SOL |
| RLY-2 | 7i84U out-08 | Fujikoshi SA-G01-E3X → SOL-12 | GEAR_LO_SOL |
| RLY-3 | 7i84U out-09 | Fujikoshi SA-G01-A3X → SOL-10 clamp | TOOL_CLAMP |
| RLY-4 | 7i84U out-10 | Fujikoshi SA-G01-A3X → SOL-10 unclamp | TOOL_UNCLAMP |
| AIR_BLAST | 7i97T TB5 SSR Out-00 | CKD 4F210-08-AC100V → SOL-62 | AIR_BLAST (100VAC) |

### Full Output Assignment (7i84U out-00 through out-15)

| Output | Signal | Notes |
|---|---|---|
| out-00 | SPINDLE_FWD | 24VDC → FR-SX VFD |
| out-01 | SPINDLE_REV | 24VDC → FR-SX VFD |
| out-02 | SPINDLE_ENA | 24VDC → spindle enable relay |
| out-03 | X_DRIVE_ENA | 24VDC → MELDA X S-ON |
| out-04 | Y_DRIVE_ENA | 24VDC → MELDA Y S-ON |
| out-05 | Z_DRIVE_ENA | 24VDC → MELDA Z S-ON |
| out-06 | Z_BRAKE_REL | 24VDC → N1J-L2-201 brake release |
| out-07 | GEAR_HI_SOL | 24VDC → RLY-1 → Fujikoshi SOL-13 (hydraulic) |
| out-08 | GEAR_LO_SOL | 24VDC → RLY-2 → Fujikoshi SOL-12 (hydraulic) |
| out-09 | TOOL_CLAMP | 24VDC → RLY-3 → Fujikoshi SOL-10 clamp (hydraulic) |
| out-10 | TOOL_UNCLAMP | 24VDC → RLY-4 → Fujikoshi SOL-10 unclamp (hydraulic) |
| out-11 | COOLANT_ON | 24VDC → coolant relay |
| out-12 | LUBE_ON | 24VDC → lube relay |
| out-13 | ATC_FWD | 24VDC → ATC motor relay FWD |
| out-14 | ATC_REV | 24VDC → ATC motor relay REV |
| out-15 | ALARM_OUT | 24VDC → alarm light/horn |

### BCD Tool Magazine Position Encoder (HAL)
The tool magazine position is reported by 5 proximity switches (PRS 21–25) wired into 7i84U in-19 through in-23, binary-encoded (BCD). A HAL component (`bcd2s` or custom mux) is required to decode these 5 bits into an integer pocket number for use by the LinuxCNC tool change logic.

```
# HAL sketch (example):
loadrt bcd2s
net mag-bcd0 hm2_7i97t.0.7i84.0.input-19 => bcd2s.0.in-00
net mag-bcd1 hm2_7i97t.0.7i84.0.input-20 => bcd2s.0.in-01
net mag-bcd2 hm2_7i97t.0.7i84.0.input-21 => bcd2s.0.in-02
net mag-bcd3 hm2_7i97t.0.7i84.0.input-22 => bcd2s.0.in-03
net mag-bcd4 hm2_7i97t.0.7i84.0.input-23 => bcd2s.0.in-04
# bcd2s.0.out => tool-change pocket number
```

**Status:** Confirmed — parts manual source; relay contact voltage must be measured at manifold before ordering relays (see Decision 11)

---

## Decision 10 — Cabinet Hardware Retained for Retrofit (Photo Confirmed 2026-06-21)

**Date:** 2026-06-21  
**Source:** Photograph of open control cabinet (IMG captured 2026-06-21, stored in OneDrive Pictures/Mazak)

**Summary:**  
Full cabinet photo reviewed and cross-referenced against retrofit plan. The following original hardware is confirmed present, functional, and **retained** for the LinuxCNC retrofit. Nothing in this list is replaced.

### Retained Hardware — Confirmed by Photo

| Component | Qty | ID / Label | Function | Retrofit Role |
|---|---|---|---|---|
| Mitsubishi MELDA servo drive card | 3 | Labeled X, Y, Z at top of card rack | DC PM servo amplifier, ±10V analog command input | Receives ±10V command from 7i97T TB3 (AOUT0/1/2) + S-ON enable from ENA0/1/2 |
| Mitsubishi FR-SX spindle VFD | 1 | FREQROL FR-SX, large black enclosure, center cabinet | Variable frequency drive for spindle motor | Receives 0–10V speed command from TB3 AOUT3 + FWD/RUN enable from 7i84U out-00/01/02 |
| Mitsubishi S-A12 magnetic contactors | 2 | Lower cabinet, below VFD | Spindle FWD/REV switching + coolant pump | Coils re-driven from 7i84U out-00/01 (spindle) and existing coolant control |
| Omron relay sockets (existing row) | ~8 | Right door panel | Original M2 solenoid switching relay row | Sockets reused if PY08/PYF08A footprint confirmed — MY2-GS DC24 relays drop in |
| Terminal strip / field wiring panel | 1 | Right door panel, dense terminal rows | Solenoid field wiring termination (includes wire 144/146) | New relay panel output wiring lands here; existing field runs to solenoids retained |
| Slotted wire duct (existing) | — | Throughout cabinet | Cable management | Reused — new Mesa wiring routed through same duct system |

### What Is Removed

| Component | Notes |
|---|---|
| Mazatrol M2 control backplane + cards | Entire left card rack — vacated space used for Mesa hardware mounting |
| Original M2 I/O and logic boards | All original CNC control electronics replaced by 7i97T + 7i84U |

### Observations from Photo

- The three MELDA drive boards are mounted in a row with individual toroidal transformers at the bottom of each card — these are the DC bus filter transformers, not resolver transformers. Drives appear intact.
- The FR-SX VFD is the dominant component in the center of the cabinet — confirms the spindle drive architecture already in the HAL (FR-SX at-speed → in-13, fault → in-14, speed command via AOUT3).
- The M2 backplane on the left is fully populated. Once removed it frees approximately 300mm × 500mm of panel space — sufficient for 7i97T, 7i84U, and the new 24V DIN rail relay panel without needing to drill new mounting holes.
- Wire duct is already extensively installed throughout — new Mesa wiring should follow existing duct paths to keep the installation clean.
- No linear scale read heads or scale extrusions visible anywhere in the cabinet — consistent with all-resolver position feedback architecture.

**Rationale:** Permanent photo record confirms which components are retained before any wiring is disturbed. Prevents accidental removal of functional hardware during the M2 control extraction.

**Status:** Confirmed by photo — no action required, informational record only

---

## Decision 11 — Hydraulic System Confirmed Present and Functional (2026-06-21)

**Context:** Investigation prompted by HYD_PRESS_OK signal assigned to 7i84U in-27. Question was whether the hydraulic power unit was still present or had been removed/replaced.

**Finding:** The hydraulic power unit is **fully functional and present** on the machine. It is a NACHI 1.5 kW unit with 40-liter tank and UNI pump UPV-1A-16NI. It powers four subsystems:

| Subsystem | Mazak SOL # | Solenoid Part | Confirms Via |
|---|---|---|---|
| Gear shift HI | SOL-13 | Fujikoshi SA-G01-E3X-C1-11 | PRS-10 |
| Gear shift LO | SOL-12 | Fujikoshi SA-G01-E3X-C1-11 | PRS-12 |
| Magazine CW/CCW | SOL-8A / SOL-8B | Fujikoshi SA-G01-C5-C1-11 | PRS-13 |
| Tool unclamp | SOL-10 | Fujikoshi SA-G01-A3X-C1-11 | PRS-8, PRS-9 |

The Z-axis counterbalance is a **passive hydraulic circuit** (relief valve + check valve, set at 80 kg/cm²) — no solenoid, always pressurized while pump runs.

**Pressure switch:** Sanwa SPS-8T-PC-20. Closes (OK) at ≥16 kg/cm², opens (fault) below 10 kg/cm². Operating pressure 70 kg/cm². This is the HYD_PRESS_OK signal wired to 7i84U in-27.

**Hydraulic pump motor:** 1.5 kW, starts automatically on machine power-up. **Not yet assigned to a 7i84U output** (all 16 outputs fully allocated). Recommend wiring pump contactor coil to LinuxCNC control power so it starts whenever the control is live — matching original M2 behavior.

**Key correction:** Earlier documents (Decisions #9, wiring map, HAL) incorrectly listed gear shift solenoids as CKD 4F210-08-AC100V. **CKD 4F210-08-AC100V is the air blast solenoid (SOL-62) only.** Gear shift and tool clamp solenoids are all hydraulic Fujikoshi SA-G01 valves. All affected documents corrected 2026-06-21.

**ATC sequence gate logic** — hydraulic-ok must be the first permissive in all ATC/gear-shift logic:
```
ATC permitted = hydraulic-ok (in-27)        # pump running, 16+ kg/cm²
             AND spindle-zero-speed (in-13)  # spindle stopped
             AND mag-in-position (PRS-13)    # magazine indexed (in-14 area — verify)
             AND atc-zone-y (PRS-55)         # Y in ATC envelope (needs additional card)
             AND atc-zone-z (PRS-66)         # Z in ATC envelope (needs additional card)
```

**Additional inputs not yet mapped (need expansion card):**
- PRS-55 (column top) — Y-axis ATC zone / magazine interference prevention
- PRS-66 (right side of head) — Z-axis ATC zone / magazine interference prevention
- PHS-181 / PHS-182 — Magazine/spindle tool availability (Honeywell FE3-RB6)

**Status:** Confirmed by user 2026-06-21. Relay panel contact voltage for gear shift and tool clamp relays must be verified at spindle head manifold before selecting relay type.

---

## Open Items / TODOs

| Item | Notes |
|---|---|
| **Confirm RT-5XA transformation ratio from nameplate** | Read from motor nameplate — determines 7i49 (TR≈0.5) vs 7i49HV (TR=1.0). Do not order card until confirmed. |
| **Confirm ballscrew pitch for all 3 axes** | Needed to calculate resolver scale accurately. Current placeholder: 332,893 counts/inch (assumes 0.19685" / 5mm pitch). |
| **Z brake wiring** | Assigned to 7i84U out-06 (Z_BRAKE_REL). Confirm brake coil voltage and current, select relay. |
| Velocity feedback nets | Not yet connected in HAL skeleton |
| 7i97T IP address | Configured 192.168.1.121; NIC enp1s0f1 static 192.168.1.100/24. Confirm no conflict with shop network. |
| Verify 24V supply | Check if existing Mazak 24V cabinet supply is usable — relay panel adds coil loads; may need new Mean Well DR-60-24. |
| RT-5XA carrier frequency | Confirm compatibility with 7i49 (2.5/5/10 kHz selectable) — check resolver datasheet |
| **Build relay panel** | DIN rail, 24VDC coil relays. Contact rating depends on hydraulic solenoid coil voltage (VERIFY at Fujikoshi SA-G01 manifold before ordering). Air blast (CKD SOL-62) = 100VAC — needs AC-rated relay or SSR. |
| **Wire hydraulic pump motor contactor to control power** | Pump starts on power-up (original M2 behavior). Tie pump contactor coil to LinuxCNC 24VDC control power rail — no 7i84U output needed. |
| **Verify hydraulic solenoid coil voltage** | Measure at Fujikoshi SA-G01 manifold on spindle head (gear shift SOL-12/13) and tool unclamp SOL-10. Determine relay contact voltage rating before ordering relays. |
| **Plan additional sserial input card** | ~~PRS-55, PRS-66, PHS-181, PHS-182 have no available 7i84U inputs (32/32 used). Need second sserial card.~~ **Updated 2026-06-24:** Limits/homes/estop confirmed on TB5 (onboard), freeing 7i84U in-00 through in-09 (10 inputs). PRS-55, PRS-66, PHS-181, PHS-182 can now use in-00 through in-03. Second sserial card no longer required for these signals. |
| **BCD decoder HAL component** | Add `bcd2s` (or custom mux) in HAL. Wire in-19–in-23 (PRS 21–25) to bcd2s inputs — output is integer tool magazine pocket number. |
| **Verify PRS sensor specs** | Confirm Yamatake FL1-2D6-E3 and Balluff BES-516-325-D0X-3 output type (PNP/NPN) and supply voltage against 7i84U input specs. |
| **AIR_BLAST HAL net** | Map `hm2_7i97t.0.gpio.020.out` to AIR_BLAST net. Confirm GPIO index against 7i97T manual before wiring. |
| 7i84U output polarity | All 16 outputs confirmed sourcing (24VDC). Relay coils and VFD inputs are sourcing-compatible — no sinking outputs needed. Verify at commissioning. |

---

## Files & Storage

| File | Location | Status |
|---|---|---|
| `Mazak_VQC_Project_Decisions_Log.md` | OneDrive: `OneDrive Docs/Mazak/` | Current |
| `Mazak_VQC_Wiring_Map.md` | OneDrive: `OneDrive Docs/Mazak/` | Current |
| `Mazak_Phase2_Wiring_Plan.md` | OneDrive: `OneDrive Docs/Mazak/` | Current |
| `Mazak_Sserial_Wiring.md` | OneDrive: `OneDrive Docs/Mazak/` | Current |
| `Mazak_VQC_LinuxCNC_Wiring_Complete.xlsx` | OneDrive: `OneDrive Docs/Mazak/` | Current — IO Master tab is authoritative I/O map |
| `Mazak_System_Wiring_Map.xlsx` | OneDrive: `OneDrive Docs/Mazak/` | Current — HAL Signals tab |
| `mazak.hal` | OneDrive: `OneDrive Docs/Mazak/` | Current — 406 lines, 7i97T/7i84U architecture |
| `mazak.ini` | OneDrive: `OneDrive Docs/Mazak/` | Current |
| `mazak_relay_panel_bom_rev_a.pdf` | OneDrive: `OneDrive Docs/Mazak/` | Current — relay panel BOM Rev A |
| `Mazak_VQC_7i84U_Wiring_Checklist.pdf` | OneDrive: `OneDrive Docs/Mazak/` | Current — cabinet build checklist |

**Deleted (legacy/superseded):** `Mazak_VQC_20-40_Retrofit_IO_Workbook.xlsx` (7i77/PCIe era), `Mazak_VQC_Parts_List_v2.xlsx`, `Mazak_VQC_Parts_List_Ethernet.xlsx` — all replaced by IO Master tab in Wiring_Complete.xlsx.

---

## Key Reference Links

- [Mesa 7i97T Manual (PDF)](http://www.mesanet.com/pdf/ethernet/7i97tman.pdf)
- [Mesa 7i84 Manual (PDF)](http://www.mesanet.com/pdf/parallel/7i84man.pdf)
- [Mesa 7i49 Manual (PDF)](https://storage.ua.prom.st/2359077_posibnik_koristuvacha_mesa_7i49_eng.pdf)
- [Mesa Store](http://store.mesanet.com)
- [LinuxCNC Forum — 7i97T servo wiring](https://forum.linuxcnc.org/9-installing-linuxcnc/53937-help-with-mesa-7i97t-card-servo-wiring)
- [LinuxCNC Forum — 7i97T with 7i84D connection](https://forum.linuxcnc.org/27-driver-boards/53484-7i97t-with-7i84d-connection-problem)
- [hm2_eth HAL driver docs](https://linuxcnc.org/docs/html/drivers/hostmot2.html)
