# 7i84U-A sserial enumeration check — run record, 2026-09-05

> **ROLE: BENCH-CHECK RECORD.** This settles bench-check item #1 in
> `docs/ladder_signal_audit_2026-09-02.md` ("7i84U enumeration") as far as
> it can be settled today: **7i84U-A only** is on hand and wired on the
> bench; 7i84U-B is on order and not yet in hand, so channel 1 is expected
> to stay unenumerated regardless of channel 0's outcome.

**Machine:** Mazak VQC 20/40B, SN 060231
**Date:** 2026-09-05 (first pass), updated same day after VIN was powered
**Where run:** OptiPlex 7050 (`LinuxCNC`), at the machine
**Result:** First pass: **7i84U-A did not enumerate.** After VIN was confirmed
powered at TB1 pin 5, re-run: **7i84U-A enumerates correctly** on HostMot2
smart-serial port 0, channel 0. See [Update](#update-2026-09-05-vin-powered-7i84u-a-enumerates) below.

---

## Environment

| Item | Value |
|---|---|
| Repo commit | `506f5dc` (branch `main`, clean working tree) |
| Host | OptiPlex 7050, hostname `LinuxCNC` |
| Kernel | `6.12.101+deb13-rt-amd64` (PREEMPT-RT) |
| LinuxCNC | `linuxcnc-uspace 1:2.9.10` |
| mesaflash | 3.5.11 |
| Mesa 7i80HDT | `10.10.10.121`, reachable, MAC `00:60:1b:11:c0:6b` |

## Step 1 — `mesaflash --readhmid` / `--sserial`

```
mesaflash --device ETHER --addr 10.10.10.121 --readhmid
mesaflash --device ETHER --addr 10.10.10.121 --sserial
```

Both outputs are **byte-identical** to the committed 2026-08-13 baselines
(`mesa/firmware/readhmid_2026-08-13.txt`, `mesa/firmware/sserial_2026-08-13.txt`).
The FPGA config is unchanged: WatchDog, IOPort×3, ResolverMod, PWM×6, SSerial,
LED modules all present, matching `7i80hdt_rmsvss6_8.bin`. `--sserial` reports
only the local SSLBP port (version 1.43, 8 channels, 2.5 Mbaud) — **no remote
board listed**, same as the baseline.

This step alone does not distinguish "no card wired" from "card wired but not
enumerating" — `mesaflash --sserial` just reads the FPGA's local port info, it
doesn't drive a fresh discovery cycle the way loading the driver does.

## Step 2 — `hm2_eth` load via `halrun` (read-only, no outputs enabled)

Used the production config string from `linuxcnc/mazak_vqc_20_40.hal`:

```
loadrt hostmot2
loadrt hm2_eth board_ip="10.10.10.121" config="num_encoders=0 num_resolvers=3 num_pwmgens=4 num_stepgens=0 sserial_port_0=00xxxxxx"
loadrt threads name1=servo period1=1000000
addf hm2_7i80.0.read servo
addf hm2_7i80.0.write servo
start
```

Then, after a 2 s settle: `show pin hm2_7i80.0.7i84`.

**Findings:**

- Driver load succeeded, `hm2/hm2_7i80.0: registered`, no errors.
- Boot-time pin dump lists **every P3 pin (048–071) as plain `IOPort`** — none
  are reported as SSerial TX/RX channel functions, even though
  `sserial_port_0=00xxxxxx` requests channels 0 and 1 in mode 0.
- `show pin hm2_7i80.0.7i84` returned an **empty pin list** — the
  `hm2_7i80.0.7i84.*` namespace does not exist. No `7i84.0.0.*` (channel 0,
  7i84U-A) pins were created at all.
- Resolver pins (`hm2_7i80.0.resolver.00/01/02.*`) **did** instantiate —
  angle/count/position/velocity/error/reset pins all present. This proves
  the `ResolverMod` firmware config only; it is not evidence the 7i49 card
  is physically seated or that any resolver is actually connected (per
  `docs/project_status.md`, that still needs a scope check, item 6 in the
  staged commissioning sequence).
- No sserial-related messages appeared in `dmesg` or `journalctl` during or
  after the run.

**Conclusion:** with the config that expects channel 0 = 7i84U-A, hm2
silently declined to configure the SSerial firmware function on P3 at all —
consistent with **no remote board responding** on the smart-serial bus
right now, not with a driver/config error.

## Why this is expected right now, and what to check next

`docs/bench_procedure_2026-09-05.md` and `docs/authority_hierarchy.md` both
flag the likely cause: **the 7i84U only enumerates with field VIN powered.**
Per the TB1 pin map in `docs/authority_hierarchy.md` (validator-enforced):

| TB1 pin | Function |
|---|---|
| 1/2 | VFIELDB |
| 3/4 | VFIELDA |
| 5 | VIN (logic power, 5–28 VDC per `docs/claim_audit_2026-08-07.md`) |
| 6/7/8 | GND / common |

Next physical checks, in order, before re-running this test:

1. Confirm 5–28 VDC is actually present at 7i84U-A TB1 pin 5 (VIN) relative
   to pins 6/7/8 (GND/common) — a bench supply is fine for this, it doesn't
   need to be the final field power source.
2. Confirm the RS-422 smart-serial cable between 7i44 (P3) and 7i84U-A is
   fully seated at both ends, and that 7i44 itself is fully seated on P3.
3. Re-run this same `halrun` recipe (or `mesaflash --sserial`) and check for
   `hm2_7i80.0.7i84.0.0.*` pins / a listed remote board.

Not yet checked: 7i84U-B (not in hand — on order as of 2026-09-05), so
channel 1 is expected to stay empty regardless of channel 0's outcome. The
existing config string (`sserial_port_0=00xxxxxx`) already enables channels
0 and 1 — no HAL change is needed to bring 7i84U-B onto the bus once it
arrives and is wired; just re-run this same check.

## What this run does not prove

- Not evidence the 7i49 is physically present or wired correctly (needs a
  scope check per the staged commissioning sequence, step 6).
- Not evidence of a bad 7i84U-A unit — the most likely explanation by far is
  simply unpowered VIN or an unseated cable, both untested here.
- No outputs were enabled and nothing on the machine could move as a result
  of this run.

## Update 2026-09-05 — VIN powered, 7i84U-A enumerates

Owner confirmed VIN power to 7i84U-A at the bench. Re-ran both checks:

- `mesaflash --readhmid` / `--sserial`: unchanged, still byte-identical to
  the 2026-08-13 baseline (`--sserial` only ever reports the local SSLBP
  port, not remote boards — it is not the right tool to prove this).
- `hm2_eth` load via `halrun` (same production config string, read-only, no
  outputs enabled): **succeeded.**
  - `Board hm2_7i80.0.7i84.0.0 Hardware Mode 0 = standard` — a real
    handshake, not a fallback default.
  - Boot-time pin dump now shows P3 pins 048/052/053 as
    `Smart Serial Interface #0` rx0/tx0/txen0, replacing the generic
    `IOPort` label from the first pass.
  - `show pin hm2_7i80.0.7i84` now lists the full pin set: `input-00`
    through `input-31` (+ `-not` complements) and `output-00` through
    `output-15` — 32 DI / 16 DO, matching the 7i84U-A spec in
    `docs/architecture_decision.md`.
  - All inputs read FALSE / `-not` TRUE, all outputs FALSE — expected with
    no field devices wired yet and no `setp` issued.
  - Channel 1 (`hm2_7i80.0.7i84.0.1.*`) correctly did **not** appear —
    7i84U-B is still not in hand.

**Conclusion:** VIN was the missing piece. Bench-check item #1 in
`docs/ladder_signal_audit_2026-09-02.md` is now closed for channel 0;
channel 1 stays open until 7i84U-B is on hand and wired, at which point
re-run this same recipe with no HAL changes needed.

**Still not proven by this run:** the 7i49/resolver interface (needs the
scope check in the staged commissioning sequence) and any of 7i84U-A's TB3
field wiring — this only proves the card answers on smart-serial, not that
any input/output is correctly landed.

## Update 2026-09-05 (later) — TB3 input liveness check, and a real gotcha

**Goal:** confirm a live 24V signal on a physical TB3 input actually reaches
`hm2_7i80.0.7i84.0.0.input-NN` in HAL, using the IN13 bench jumper called
for in `docs/bench_procedure_2026-09-05.md` item 46
(`spindle-at-speed` ← TB3 pin 14 → VFIELDA/field-power positive, per the
TB3 pinout table in `docs/Mesa Manuals/7i84uman.pdf` p.3-4: TB3 pin N =
`INPUTn-1`, e.g. TB3 pin 14 = INPUT13).

**Result: PASS, after finding a real hardware gotcha — see below.**
`input-00` and `input-13` both correctly read TRUE with 24V applied at
TB3-1/TB3-14 respectively (return to TB1 pin 6 or 8, both are the same
GROUND/COMMON net per the manual, p.3). This also independently confirms
the TB3-pin-to-`input-NN` mapping used throughout the pin authority CSV.

**The gotcha — first attempts read FALSE despite everything being wired
correctly:**

1. VIN alone (already powered from the earlier enumeration check) gets the
   card talking on smart-serial, but does **not** power the field I/O
   engine. VFIELDA (TB1-3/4) and VFIELDB (TB1-1/2) are separate rails that
   power the input threshold comparators and outputs (manual p.8, "VIN AND
   FIELD POWER SUPPLY" / "SPLIT FIELD POWER"). Owner wired TB1 pins 1-5 all
   to the same 24V bench supply — the manual's recommended default when
   split field power isn't being used — so this was not the actual fault,
   but it's worth stating plainly for next time: **VIN, VFIELDA, and
   VFIELDB all need power, not just VIN**, or field I/O will not work even
   though the card enumerates fine.
2. Even with VIN + VFIELDA + VFIELDB all correctly powered at 24V, a
   correct 24V signal at two different TB3 input pins (IN0 and IN13, ruling
   out a single bad channel), with confirmed continuity/voltage at the pin
   and the terminal block seated, **still read FALSE.** The card's own
   status LEDs (manual p.11) explained why: CR2 (VIN), CR5 (field I/O
   fault — correctly off), and CR7 (RS-422 power) were all normal, but
   **CR6 (Field I/O activity) was not blinking at all** — the card's field
   I/O engine was not cycling, separate from and invisible to the
   smart-serial transport layer (which reported healthy `fault-count`/
   `port_state`/`fieldvoltagea`/`fieldvoltageb` values throughout, because
   those are transport-layer, not the actual I/O process-data stream).
3. **Fix: a full power cycle of the card** — de-energize all of TB1 pins
   1-5 (VFIELDB, VFIELDA, VIN) together, wait, then reapply together —
   cleared whatever stuck internal state had the field I/O engine idle.
   After the cycle, a fresh `hm2_eth` reload showed `fault-count` reset to
   `0` (previously frozen at `0xCF` = 207 across the whole session,
   including through the power cycle itself — worth noting the fault
   counter did **not** visibly react to the cycle either, so don't rely on
   it alone to confirm a reset happened) and both test inputs read
   correctly on the first read after reload.

**Takeaway for next time (7i84U-B bring-up, or if 7i84U-A ever needs
re-powering):** if smart-serial enumerates cleanly (channel shows up,
`fault-count` stable, `fieldvoltagea`/`b` non-zero) but **no input ever
registers no matter what's applied**, check CR6 on the card before
suspecting the wiring. If CR6 isn't blinking, power-cycle the whole card
(all of TB1 1-5 together) and reload the host driver fresh — don't just
`halcmd unload all` and reload without also confirming `halcmd show
thread` shows *zero* threads first; reloading `threads` while a stale one
still exists throws `HAL: ERROR: duplicate thread name` and leaves the
input pins frozen at power-up defaults, which looks identical to "still
not working" if you don't check for it.
