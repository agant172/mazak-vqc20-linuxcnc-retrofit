# Architecture Decision: Mesa 7i80HDT + 7i44 + 7i49 + 7i84U (Ethernet) + P3 field breakout

## Decision (2026-08-06 rev)

Use a LinuxCNC control PC driving a **Mesa 7i80HDT Ethernet FPGA host** as the primary
control board, with three daughter cards populated on its 50-pin connectors:

- **P1: Mesa 7i44** — 8-channel RS-422 smart-serial breakout (port 0 → 7i84U; ports 1-7 spare).
- **P2: Mesa 7i49** — plain 7i49 resolver-to-digital interface with 6 resolver channels and 6× ±10V analog outputs. Carries X/Y/Z resolver feedback (RES0/1/2) and X/Z/Y servo velocity + FR-SX spindle velocity + FR-SX orient reference (AOUT0..AOUT4).
- **P3: 7i37TA field breakout** (or equivalent 50-pin card) — 24× direct FPGA GPIO for motion-critical, host-side, low-latency I/O: X/Y/Z limits, X/Y/Z homes, E-stop chain monitor, Renishaw MP-3 probe SKIP1, X/Y/Z drive-enable outputs, and the six former TB5 SSR overflow outputs (air blast, touch sensor blast, tap coolant blast, ATC barrier, flood valve, spare).

A **Mesa 7i84U** on 7i44 port 0 provides ATC, hydraulic, coolant, air, magazine, and utility field I/O near the existing green breakout PCB. The 7i80HDT connects to the control PC over Ethernet using the `hm2_eth` driver at static IP **192.168.1.121** (NIC `enp0s31f6` at 192.168.1.1/24). The machine keeps its original Tamagawa TS2014N resolvers, so feedback is resolver-based (plain 7i49 on P2, 5 kHz excitation baseline) rather than quadrature-encoder.

## Selected control stack

- LinuxCNC control PC located at the machine (Debian 13 / LinuxCNC 2.9.10 / PREEMPT-RT kernel 6.12.100+deb13-rt-amd64).
- **Mesa 7i80HDT** Ethernet FPGA host — 100BaseT, three 50-pin daughter connectors (P1/P2/P3), 72 IO total, 5V-tolerant, `hm2_eth` driver.
- **Mesa 7i44 on P1** — RS-422 sserial breakout to 7i84U (port 0) and future expansion (ports 1-7).
- **Mesa 7i49 on P2** — X/Y/Z resolver feedback and analog servo/spindle command DACs.
- **7i37TA field breakout on P3** — motion-critical direct FPGA GPIO. Handles limits (6 IN), homes (3 IN), E-stop chain monitor (1 IN), Renishaw MP-3 probe SKIP1 (1 IN), X/Y/Z drive-enable outputs (3 OUT), and six former TB5 SSR overflow outputs (5 relayed loads + 1 spare).
- **Mesa 7i84U on 7i44 port 0** — remote field-I/O expansion mounted near the existing green breakout PCB, for ATC, hydraulic, coolant, air, magazine, utility I/O, and cabinet field wiring. Pin plan committed 2026-08-03 (single-7i84U I/O plan) is preserved unchanged.
- Optional WHB04B-style USB pendant through LinuxCNC, not through Mesa.

## Why this stack fits the Mazak

- The 7i80HDT is the modern Ethernet FPGA host in Mesa's lineup; the 7i97T (returning to Mesa) is the closest to the old plan but the retrofit needed more onboard GPIO breakouts and more analog-out channels than the 7i97T's 4-pwmgen / 24-GPIO layout could carry cleanly, especially after the FR-SX orient reference and Renishaw probe were folded in.
- The **7i49 on P2** dedicates 6 analog outputs to the analog motion path (X/Z/Y + spindle velocity + orient reference + spare) instead of relying on the 4-channel 7i97T onboard DAC.
- The **7i37TA on P3** dedicates 24 direct FPGA GPIO to motion-critical I/O (limits/homes/E-stop/probe/drive-enables/SSR overflow) — same category as the retired 7i97T TB3/TB5 assignments but with a lot more headroom for expansion (~13 spare bits).
- The **7i44 on P1** sits between the 7i80HDT FPGA and the 7i84U over RS-422, and leaves 7 spare sserial ports for a second 7i84, MPG pendant, or 4th-axis card.
- Ethernet (`hm2_eth`) avoids dependence on a PCIe slot in the control PC and lets the PC be sited flexibly; a static IP link keeps the motion interface deterministic.
- The 7i84U pin plan is unchanged: the 2026-08-03 single-7i84U I/O plan still fits with 6 DI + 6 DO spare and +1/+1 margin.

## Resolver feedback interface (Mesa 7i49 on P2)

The Mazak VQC 20/40 keeps its **original Tamagawa TS2014N resolvers** for axis position feedback, so the retrofit uses a **Mesa 7i49 resolver-to-digital interface** rather than reading quadrature encoders. This section is the working decision record for the resolver path.

### Observed / documented resolvers

- July 2026 on-machine photos confirmed **Tamagawa Seiki TS2014N series** SHAFT resolvers (Size 25, BRX type, Mitsubishi/Mazak part BKO-NC6062A).
- Physical mounting: non-drive end of each ball screw, coupled via small flex coupling. These are STANDALONE shaft resolvers, NOT motor-mounted. The HD-101 / HD-81 DC servo motors have integral tachogenerators for the TRA velocity loop — completely separate from the resolver position feedback path.
- Older documentation references to `RT-5XA-11` / `RT-5XA-L1` were superseded by the July 2026 identification.
- **Caution — connector vs. model:** `MS3108B 20-29P` is a **connector shell part number** (an MS/MIL circular connector), **not** a resolver model.

### Working baseline: plain 7i49 at 5 kHz excitation

- **Plain Mesa 7i49** on P2 as the resolver interface. This is the intended starting point.
- Set the **resolver excitation frequency to 5 kHz**. The Tamagawa TS2014N nameplate spec is **4.5 kHz** at 10 Vrms; the 7i49 offers **2.5 / 5 / 10 kHz**, so 5 kHz is the closest available setting. Within the ±10% frequency deviation the TS2014N tolerates.
- Strong supporting evidence comes from a **Mazak VQC 15/40 sister retrofit** that uses the **same Mitsubishi TRA drives and HD81-12S motors** and runs a **plain Mesa 7i49 (not 7i49HV)**.

### Transformation ratio and signal levels

- Tamagawa TS2014N nameplate: **K = 0.5 ±10%**. 5 V drive → ~2.5 V return.
- The **7i49 drives about 2 V RMS** excitation and expects about **1 V RMS** sin/cos return.
- Because the resolver ratio and the 7i49 design center on similar 2:1-ish behavior, the **plain 7i49 is the intended starting point**. **7i49HV is a contingency** only justified if measurements prove a signal-level mismatch on this machine.

### Wiring warning — old Meldas M2 / TRA resolver wiring may differ

The original **Meldas M2 / TRA** resolver wiring may run the resolver "backwards" (two-phase excitation into the stator, phase read from the rotor). The **7i49 uses conventional single excitation** and **reads sin/cos amplitude** on the other two windings. **Identify winding pairs with an ohmmeter before applying power** — do not trust the original wire names. Expected mapping once verified:

- Rotor pair (likely **R1/R2**) → **RESDRV+ / RESDRV−** (excitation).
- Two matched stator pairs (**S1-S3** and **S2-S4**) → **RESSIN** and **RESCOS**.

### Measurement and tuning notes (7i49 on P2)

- After wiring, scope the return signal level on the sin/cos inputs with the 7i49 excitation running.
- Too low a signal shows up as position noise and sluggish axis response.
- Too hot / too weak a signal is corrected with the **W2 half-drive jumper** to halve excitation drive, or a divider on the return. Treat W2 half-drive as a field-verification option only.
- Escalate to **7i49HV** only if the signal is far too weak at full drive.

### Drive ownership — LinuxCNC/7i49 owns resolver excitation

- The **TRA-type drives close their velocity loop on a tachogenerator (Tamagawa TGF-3D P402-Sx), not on the resolver.** The resolver is a position device for the control, independent of the drive's own velocity loop.
- Therefore **LinuxCNC + the 7i49 on P2 own the resolver excitation outright.** The **7i49 must be the sole resolver excitation source** — confirm nothing else is still driving the resolver windings before energizing the 7i49.

## Remaining checks before final hardware purchase

- Confirm exact 7i80HDT and 7i44 part numbers and board revisions from Mesa (buy list).
- Confirm the correct firmware bitfile: **`7i80hdt_7i44_ss_7i49d.bit`** (PCW-provided).
- Confirm the P3 field breakout choice (7i37TA or alternative 50-pin card) and its terminal-to-signal map. 7i37TA gives 8 isolated OUT + 16 isolated IN, sufficient for the P3 load.
- Confirm 7i49 on P2 host connection and firmware `num_resolvers=3` config. Set excitation to **5 kHz**.
- Identify resolver winding pairs per axis with an ohmmeter before power; scope the return signal level; only then decide on W2 half-drive / divider or a 7i49HV escalation.
- Confirm 7i80HDT Ethernet setup: static IP 192.168.1.121, `hm2_eth` `board_ip="192.168.1.121"`, and host NIC `enp0s31f6` at 192.168.1.1/24.
- Run LinuxCNC latency testing on the actual control PC (already validated on the current hardware).
- Confirm X/Y/Z drive command polarity and scaling on 7i49 AOUT0/1/2.
- Confirm per-axis resolver label, winding pairs, transformation ratio, and return signal level.
- Confirm FR-SX spindle command mode (analog speed reference on 7i49 AOUT3; digital FWD/REV/ENA on 7i84U).
- Confirm 24 VDC field power feed (Meanwell DR-240-24 retrofit bus), I/O sourcing/sinking behavior, and field power/fusing at both the P3 breakout and the 7i84U.
- Confirm output load currents at the P3 breakout and 7i84U, and whether interposing relays are required for legacy 100VAC solenoids (SOL-35/61/62) and the ATC barrier.

## Previous / rejected architectures (historical)

Two earlier plans have been retired:

1. **PCIe tower-card stack (2024-era)**: 6i25 + 7i77 + 7i84 + optional 7i85/7i85S. Superseded by the 7i97T Ethernet plan in 2025.
2. **7i97T + 7i84U + 7i49 Ethernet stack (2025 through 2026-08-05)**: the 7i97T on hand is being returned to Mesa. Retired in favor of the current 7i80HDT + 7i44 + 7i49 + 7i84U + P3 breakout stack (2026-08-06).

## Resolver unknowns still needing measurement

- Winding pairs (rotor vs. stator) identified by ohmmeter before power.
- Return signal level scoped after 7i49 excitation (drives the full-drive vs. W2 half-drive / divider, and the plain-7i49 vs. 7i49HV decision).
- Final HAL resolver scale and axis orientation (direction/counts per machine unit).
- Shield / ground termination strategy for the resolver cabling.

## Sources

- Servo PID tuning thread — VQC 15/40, TRA-31, HD81-12S, plain 7i49 @ 5 kHz vs. the 4.5 kHz spec: <https://forum.linuxcnc.org/10-advanced-configuration/32061-servo-pid-tuning-can-t-clamp-down-on-overshoot>
- Mesa 7i49 manual (resolver interface, excitation options, W2 jumper, RESDRV/RESSIN/RESCOS): <http://www.mesanet.com/pdf/motion/7i49man.pdf>
- Mesa 7i80HDT overview (72 IO across three 50-pin daughtercard connectors, 5V-tolerant): <http://www.mesanet.com/fpgacardinfo.html>
- Mesa 7i44 forum thread on 7i80HD-compatible RS-422 interfaces: <https://www.forum.linuxcnc.org/27-driver-boards/35743-mesa-i-o>
- Mesa 50-pin daughter card catalog (7i37TA, 7i44, 7i49, etc.): <https://www.mesanet.com/aiodaughter.html>
- srdco/MazakVQC1540 — LinuxCNC configs for the sister VQC 15/40 retrofit: <https://github.com/srdco/MazakVQC1540>
- SRDCO MazakVQC1540 complete 2017 reference package: <https://github.com/srdco/MazakVQC1540/tree/master/MAZAK-VQC1540-20170501>
- User's thread — Mesa conversion for a Mazak VQC 20/40 M2 mill: <https://forum.linuxcnc.org/27-driver-boards/58767-mesa-conversion-for-a-mazak-vqc-20-40-m2-mill>
- Mitsubishi TRA-31 drive manual: <https://us.mitsubishielectric.com/fa/en/support/technical-support/knowledge-base/getdocument/?docid=3E26SJWH3ZZR-24-3709>
- Meldas YM2 / Mazatrol M2 maintenance manual: <https://us.mitsubishielectric.com/fa/en/support/technical-support/knowledge-base/getdocument/?docid=3E26SJWH3ZZR-24-2231>
