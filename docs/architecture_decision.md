# Architecture Decision: Mesa 7i80HDT + 7i44 + 7i49 + two 7i84Us (Ethernet)

> **Connector-assignment addendum (2026-08-13).** The rest of this document,
> including "Decision" and "Selected control stack" below, has been edited in
> place to the CONFIRMED connector mapping: **P1 = 7i49 (resolver +
> PWM/analog)**, **P2 = unused/spare (bare GPIO)**, **P3 = 7i44 (sserial)**.
> This flips P1 and P2 from the original 2026-08-06 decision (which assumed
> P1 = 7i44, P2 = 7i49, P3 = unused). The flip was discovered by flashing and
> reading back the actual firmware, `7i80hdt_rmsvss6_8.bin`, with
> `mesaflash --readhmid` on 2026-08-11 and re-confirming byte-identical on
> 2026-08-13 — see
> [`../mesa/mesa_firmware_checklist.md`](../mesa/mesa_firmware_checklist.md#bitfile-provenance-verification-procedure).
> The *reasoning* below (why this card combination, why not a 7i37TA, the
> resolver signal-level analysis, etc.) is unaffected — only which physical
> 50-pin connector each card plugs into changed. The "Historical alternatives"
> note just below predates this addendum and uses the **old** P1/P2/P3
> numbering for the rejected 7i37TA branch; it is left as-written since it
> describes a discarded alternative, not the active plan.

> **Historical alternatives note (2026-08-06).** Some earlier design branches
> (notably a **Mesa 7i37TA** field breakout on the connector then assumed to
> be free) are retained further down this file as history so the reasoning
> for rejecting them is not lost. They are NOT part of the active plan. The
> single index of retired / unverified claims is
> [`superseded_claims_2026-08-06.md`](superseded_claims_2026-08-06.md).

## Decision

Use a LinuxCNC control PC driving a **Mesa 7i80HDT Ethernet FPGA host** as the primary
control board, with two daughter cards populated on its 50-pin connectors:

- **P3: Mesa 7i44** — 8-channel RS-422 smart-serial breakout carrying **two 7i84U cards**:
  - **Physical channel 0 → 7i84U-A** (existing 32 DI / 16 DO plan: ATC, hydraulic, coolant, air, magazine, spindle FWD/REV/ENA, utility).
  - **Physical channel 1 → 7i84U-B** (X/Y/Z limits, X/Y/Z homes, X/Y/Z drive-enables, and relay-driven loads).
  - Channels 2-7 remain spare (MPG pendant, 4th-axis card, or future 7i84 expansion). Both active channels are configured within HostMot2 smart-serial port 0.
- **P1: Mesa 7i49** — plain 7i49 resolver-to-digital interface with 6 resolver channels and 6× ±10V analog outputs. Carries X/Y/Z resolver feedback (RES0/1/2) and X/Z/Y servo velocity plus FR-SX spindle velocity on AOUT0..AOUT3. AOUT4/AOUT5 are spare; orient is discrete ORCM1.
- **P2: unused/spare.** No daughter card is fitted and no bare-FPGA GPIO pin is bound to a 24 V field signal. Earlier drafts placed the Renishaw MP-3 probe SKIP1 on `hm2_7i80.0.gpio.042` for latency reasons; that direct-GPIO path was RETRACTED — the 7i80HDT P2 GPIO pins are 3.3 V logic without opto-isolation and would be destroyed by 24 V input. The probe now lands on **7i84U-B TB3 IN15** with proper 24 V opto-isolation. See [`docs/superseded_claims_2026-08-06.md`](superseded_claims_2026-08-06.md) row 15. All remaining P2 pins are held as spare.

The 7i80HDT connects to the control PC over Ethernet using the `hm2_eth` driver at static IP **192.168.1.121** (NIC `enp0s31f6` at 192.168.1.1/24). The machine keeps its original Tamagawa TS2014N resolvers, so feedback is resolver-based (plain 7i49 on P1, 5 kHz excitation baseline) rather than quadrature-encoder.

### Why no P2 field breakout (7i37TA or similar)?

Earlier drafts of this document called for a **Mesa 7i37TA** field breakout on P2 to host limits, homes, drive-enables, and 100 VAC solenoid outputs. That was wrong on two counts:

1. **The 7i84U already covers this I/O.** The 7i37TA is 16 isolated IN + 8 isolated OUT; the 7i84U is 32 DI + 16 DO on sserial. Adding a 7i37TA to the base stack duplicates capability the 7i84U already provides.
2. **"Motion-critical" was mis-scoped.** Resolver feedback and ±10 V velocity commands remain on the 7i49 (P1). Limits, homes, and drive enables may use isolated field I/O, but their end-to-end update age and fault response must be measured; servo-thread cadence alone does not make smart-serial and direct-GPIO behavior identical.

The touch probe was originally considered the one exception that might justify bare-FPGA GPIO for latency, but that carve-out has been retracted: exposing bare 3.3 V FPGA pins to 24 V field wiring is not safe. The probe is routed through 7i84U-B input-15; trigger-to-HAL latency, jitter, and stopping error must be measured at every approved probing feed before acceptance.

## Selected control stack

- LinuxCNC control PC located at the machine (Debian 13 / LinuxCNC 2.9.10 / PREEMPT-RT kernel 6.12.100+deb13-rt-amd64).
- **Mesa 7i80HDT** Ethernet FPGA host — 100BaseT, three 50-pin daughter connectors (P1/P2/P3), 72 IO total, 5V-tolerant, `hm2_eth` driver.
- **Mesa 7i44 on P3** — RS-422 breakout carrying two 7i84Us on physical channels 0 and 1 within HostMot2 smart-serial port 0; channels 2-7 spare.
- **Mesa 7i49 on P1** — X/Y/Z resolver feedback and analog servo/spindle command DACs.
- **P2 (direct FPGA GPIO)** — no daughter card; no bare-FPGA GPIO pin is bound to a field signal. The probe input is on 7i84U-B input-15, not P2.
- **Mesa 7i84U-A on 7i44 channel 0** — remote field-I/O expansion mounted near the existing green breakout PCB, for ATC, hydraulic, coolant, air, magazine, utility I/O, and cabinet field wiring.
- **Mesa 7i84U-B on 7i44 channel 1** — X/Y/Z limits, X/Y/Z homes, X/Y/Z drive-enables, probe, air-pressure input, relay-driven loads, and the proposed magazine-cover output.
- Optional WHB04B-style USB pendant through LinuxCNC, not through Mesa.

## Why this stack fits the Mazak

- The 7i80HDT is a bare-FPGA Ethernet host with three 50-pin daughter connectors, so each I/O class — analog/resolver and sserial — gets its own daughter card sized for the job.
- The **7i49 on P1** uses AOUT0..AOUT3 for X/Z/Y and spindle velocity and reads all three axis resolvers on RES0/1/2. AOUT4/AOUT5 are spare; orient is discrete ORCM1.
- The **7i44 on P3** carries two 7i84Us over RS-422: 7i84U-A handles the existing 32/16 field I/O near the green breakout PCB; 7i84U-B handles limit/home monitoring and added loads. These are not safety-rated I/O; the hardwired chain remains authoritative. Physical channels 2-7 remain available for verified future expansion.
- Ethernet (`hm2_eth`) avoids dependence on a PCIe slot in the control PC and lets the PC be sited flexibly; a static IP link keeps the motion interface deterministic.
- The exact authority count is 32 DI + 16 DO on 7i84U-A and 11 DI + 9 DO on 7i84U-B, leaving 21 DI + 7 DO total reserve. See `io_capacity_reconciliation.md`.
- P2 is intentionally left unused/spare — no bare-FPGA GPIO pin is bound to a field signal. This preserves the option to add a real daughter card later if the field discovers a signal that actually needs direct-FPGA latency and can supply its own isolation.

## Resolver feedback interface (Mesa 7i49 on P1)

The Mazak VQC 20/40 keeps its **original Tamagawa TS2014N resolvers** for axis position feedback, so the retrofit uses a **Mesa 7i49 resolver-to-digital interface** rather than reading quadrature encoders. This section is the working decision record for the resolver path.

### Observed / documented resolvers

- July 2026 on-machine photos confirmed **Tamagawa Seiki TS2014N series** SHAFT resolvers (Size 25, BRX type, Mitsubishi/Mazak part BKO-NC6062A).
- Physical mounting: non-drive end of each ball screw, coupled via small flex coupling. These are STANDALONE shaft resolvers, NOT motor-mounted. The HD-101 / HD-81 DC servo motors have integral tachogenerators for the TRA velocity loop — completely separate from the resolver position feedback path.
- Older documentation references to `RT-5XA-11` / `RT-5XA-L1` were superseded by the July 2026 identification.
- **Caution — connector vs. model:** `MS3108B 20-29P` is a **connector shell part number** (an MS/MIL circular connector), **not** a resolver model.

### Working baseline: plain 7i49 at 5 kHz excitation (VERIFY on scope)

- **Plain Mesa 7i49** on P1 as the resolver interface. This is the intended starting point.
- The **7i49 selectable carrier frequencies are 2.5 / 5 / 10 kHz** (per the 7i49 manual RESMOD register); 4.5 kHz is not selectable, so the closest option is **5 kHz** — about **11 %** above the TS2014N141E26 nominal 4.5 kHz.
- **The Tamagawa FA-SOLVER page does not publish a frequency tolerance for TS2014N141E26.** "5 kHz is within ±10 %" appears in some older notes here but is **not sourced** — remove it from decision reasoning. Whether 5 kHz operation is acceptable is an assumption to **verify at commissioning** by scoping RESDRV excitation and RESSIN/RESCOS amplitude and phase at rest and under motion.
- **Every axis suffix must be recorded and matched to its own datasheet.** The nameplate photos show `TS2014N###E##` with the trailing digits illegible on all three axes; treat the E26 datasheet as tentative until each axis's exact suffix is read and its own datasheet is obtained. PCW has stated on the LinuxCNC forum that some TS2014 variants (e.g. E1/BRT) are not compatible with the 7i49 at all — the suffix matters.
- Supporting anecdote (not proof for this machine): a **Mazak VQC 15/40 sister retrofit** with **Mitsubishi TRA drives and HD81-12S motors** runs a **plain Mesa 7i49 (not 7i49HV)** — useful as a data point but not a substitute for scoping this machine's resolvers.

### Transformation ratio and signal levels

- **TS2014N141E26 datasheet (Tamagawa FA-SOLVER page):** K = 0.5, rotor DC 121 Ω, stator DC 69 Ω, phase shift −7.5°, residual voltage 15 mVrms max. **No K tolerance is published on the Tamagawa page** — previous "K = 0.5 ±10 %" wording in this repo was not sourced and has been removed.
- **7i49 manual:** default drive ≈ **2 V RMS**, expected SIN/COS input ≈ **1 V RMS**, i.e. a 2:1 reference:output ratio. With a K = 0.5 resolver at ~2 V RMS drive the return should sit near 1 V RMS.
- Because the resolver ratio and the 7i49 design center on similar 2:1 behavior, the **plain 7i49 is the intended starting point**. **7i49HV is a contingency** only justified if measurements on this machine show a signal-level mismatch — and any such escalation should go through a Mesa (PCW) review of the specific TS2014N suffix rather than a blind swap.

### Wiring warning — old Meldas M2 / TRA resolver wiring may differ

The original **Meldas M2 / TRA** resolver wiring may run the resolver "backwards" (two-phase excitation into the stator, phase read from the rotor). The **7i49 uses conventional single excitation** and **reads sin/cos amplitude** on the other two windings. **Identify winding pairs with an ohmmeter before applying power** — do not trust the original wire names. Expected mapping once verified:

- Rotor pair (likely **R1/R2**) → **RESDRV+ / RESDRV−** (excitation).
- Two matched stator pairs (**S1-S3** and **S2-S4**) → **RESSIN** and **RESCOS**.

### Measurement and tuning notes (7i49 on P1)

- Before power: measure **DC resistance** of every winding on every axis and compare to the datasheet for that axis's exact TS2014N suffix. Rotor DC ≈ 121 Ω and stator DC ≈ 69 Ω for TS2014N141E26; other suffixes may differ. Confirming the variant this way is a prerequisite for trusting any downstream signal-level prediction.
- After wiring, scope the RESDRV excitation and the SIN/COS return at rest and under motion. Compare amplitude and phase against expected ~2 V RMS drive / ~1 V RMS return.
- Too low a signal shows up as position noise and sluggish axis response.
- **W2 does not help the X/Y/Z axis channels.** Per the 7i49 manual, W2 down halves reference drive on channels **3/4/5 only**; X/Y/Z live on channels **0/1/2**, which W2 does not affect. Prior notes here that treated W2 as a possible fix for a hot axis-channel return were wrong and have been removed.
- If measured SIN/COS at rest is well below the 7i49's ~1 V RMS target, do **not** add external dividers or 7i49HV hardware without a Mesa (PCW) review of the specific TS2014N suffix on this machine.

### Drive ownership — LinuxCNC/7i49 owns resolver excitation

- The **TRA-type drives close their velocity loop on a tachogenerator (Tamagawa TGF-3D P402-Sx), not on the resolver.** The resolver is a position device for the control, independent of the drive's own velocity loop.
- Therefore **LinuxCNC + the 7i49 on P1 own the resolver excitation outright.** The **7i49 must be the sole resolver excitation source** — confirm nothing else is still driving the resolver windings before energizing the 7i49.
- **LinuxCNC's PID is the outer position loop; the TRA velocity loop is the inner loop.** Commission with the FF1-first procedure in [`servo_commissioning.md`](servo_commissioning.md): confirm zero-command null at each 7i49 AOUT_N, measure volts-per-speed with a small controlled `pid.N.bias` while all gains/feed-forwards remain zero and `MAX_OUTPUT` is clamped, set per-axis `OUTPUT_SCALE = 10 × (measured speed per volt)` so `pid.output` is in user units per second (PID(9) requirement), then return bias to zero, add FF1, then P, and only add I/D if the residual behavior demands it. The zero-gain settings and fail-off output holds are commissioning interlocks, not proof of a safe live configuration.

## Remaining checks before final hardware purchase

- Confirm exact 7i80HDT and 7i44 part numbers and board revisions from Mesa (buy list).
- Firmware `7i80hdt_rmsvss6_8.bin` is flashed and its layout, identity, and upstream source are all confirmed: two independent `readhmid` reads (2026-08-11 flash-time, 2026-08-13 re-check, byte-identical) plus a recorded SHA-256, and the binary sourced directly from Peter Wallace at Mesa Electronics (`freeby.mesanet.com/7i80hdt_rmsvss6_8.zip`, 2026-08-11) — see [`../mesa/mesa_firmware_checklist.md`](../mesa/mesa_firmware_checklist.md#bitfile-provenance-verification-procedure).
- Confirm both 7i84Us are detected on 7i44 physical channels 0 and 1 after firmware load (`sserial_port_0=00xxxxxx`: two channels of one HostMot2 smart-serial port). Record both device serial numbers and physical cable destinations during commissioning.
- Confirm 7i49 on P1 host connection and firmware `num_resolvers=3` config. Set excitation to **5 kHz**.
- Identify resolver winding pairs per axis with an ohmmeter before power; scope RESDRV excitation and RESSIN/RESCOS amplitude and phase at rest and under motion on all three axis channels (0/1/2). **W2 is not a valid remedy on the axis channels** — it only affects channels 3/4/5. Any 7i49HV / divider escalation must go through Mesa (PCW) review of the specific TS2014N suffix rather than a unilateral hardware swap.
- Confirm 7i80HDT Ethernet setup: static IP 192.168.1.121, `hm2_eth` `board_ip="192.168.1.121"`, and host NIC `enp0s31f6` at 192.168.1.1/24.
- Run LinuxCNC latency testing on the actual control PC (already validated on the current hardware).
- Confirm X/Y/Z drive command polarity and scaling on 7i49 AOUT0/1/2.
- Confirm per-axis resolver label, winding pairs, transformation ratio, and return signal level.
- Confirm FR-SX spindle command mode (analog speed reference on 7i49 AOUT3; digital FWD/REV/ENA on 7i84U).
- Confirm output load currents at both 7i84Us, and interpose relays for legacy 100VAC solenoids (SOL-35/61/62) and the ATC barrier before energizing 7i84U-B outputs 3-7.

## Resolver unknowns still needing measurement

- Winding pairs (rotor vs. stator) identified by ohmmeter before power.
- Return signal level scoped after 7i49 excitation — at rest and under motion, on all three axis channels (0/1/2). Feeds any plain-7i49 vs. 7i49HV escalation, which must go through Mesa/PCW rather than a unilateral hardware swap. **W2 is not a valid remedy on the axis channels.**
- Final HAL resolver `RESOLVER_SCALE` and `RESOLVER_VELOCITY_SCALE` per axis. HostMot2 defines `.scale` as **machine units per resolver electrical revolution**, not per motor rev, and treats `.velocity-scale` as an independent parameter. Derive from ballscrew lead × any resolver/screw ratio (flex-coupled on this machine, expected 1:1 but verify), then confirm by counting `rawcounts` against a dial indicator over multiple full revolutions and flip the sign if the axis counts backwards. Do not leave the 1.0 placeholders in place.
- Shield / ground termination strategy for the resolver cabling.

## Sources

- Servo PID tuning thread — VQC 15/40, TRA-31, HD81-12S, plain 7i49 @ 5 kHz vs. the 4.5 kHz spec: <https://forum.linuxcnc.org/10-advanced-configuration/32061-servo-pid-tuning-can-t-clamp-down-on-overshoot>
- Tamagawa FA-SOLVER page (TS2014N141E26 electrical specs): <https://tamagawa.eu/products/resolvers/brushless-resolvers-fa-solver/>
- PCW on TS2014 variant compatibility with the 7i49: <https://forum.linuxcnc.org/27-driver-boards/39171-7i49-with-tamagawa-ts2014-e1-type-resolvers>
- HostMot2(9) man page — resolver `.scale`, `.velocity-scale`, `.index-divisor`, PWMGen `dc = value / scale` and output-type/offset-mode semantics: <https://linuxcnc.org/docs/2.9/html/man/man9/hostmot2.9.html>
- LinuxCNC PID(9) man page — feed-forward semantics (FF0/FF1/FF2/FF3), integrator windup, deadband, bias, direction warning, and the explicit "When using FF1 tuning, scaling must be set so that output is in user units per second" requirement that drives the servo commissioning procedure: <https://linuxcnc.org/docs/2.9/html/man/man9/pid.9.html>
- Mesa 7i49 manual (resolver interface, excitation options, W2 jumper, RESDRV/RESSIN/RESCOS): <http://www.mesanet.com/pdf/motion/7i49man.pdf>
- Mesa 7i80HDT product page (100BaseT, 72 IO across three 50-pin daughtercard connectors, 5V-tolerant): <https://store.mesanet.com/index.php?product_id=386&route=product/product>
- Mesa 7i44 forum thread on 7i80HD-compatible RS-422 interfaces: <https://www.forum.linuxcnc.org/27-driver-boards/35743-mesa-i-o>
- Mesa 50-pin daughter card catalog (7i44, 7i49, 7i84, etc.): <https://www.mesanet.com/aiodaughter.html>
- srdco/MazakVQC1540 — LinuxCNC configs for the sister VQC 15/40 retrofit: <https://github.com/srdco/MazakVQC1540>
- SRDCO MazakVQC1540 complete 2017 reference package: <https://github.com/srdco/MazakVQC1540/tree/master/MAZAK-VQC1540-20170501>
- User's thread — Mesa conversion for a Mazak VQC 20/40 M2 mill: <https://forum.linuxcnc.org/27-driver-boards/58767-mesa-conversion-for-a-mazak-vqc-20-40-m2-mill>
- Mitsubishi TRA-31 drive manual: <https://us.mitsubishielectric.com/fa/en/support/technical-support/knowledge-base/getdocument/?docid=3E26SJWH3ZZR-24-3709>
- Meldas YM2 / Mazatrol M2 maintenance manual: <https://us.mitsubishielectric.com/fa/en/support/technical-support/knowledge-base/getdocument/?docid=3E26SJWH3ZZR-24-2231>
