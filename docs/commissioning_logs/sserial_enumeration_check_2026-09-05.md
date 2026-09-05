# 7i84U-A sserial enumeration check — run record, 2026-09-05

> **ROLE: BENCH-CHECK RECORD.** This settles bench-check item #1 in
> `docs/ladder_signal_audit_2026-09-02.md` ("7i84U enumeration") as far as
> it can be settled today: **7i84U-A only** is on hand and wired on the
> bench; 7i84U-B is on order and not yet in hand, so channel 1 is expected
> to stay unenumerated regardless of channel 0's outcome.

**Machine:** Mazak VQC 20/40B, SN 060231
**Date:** 2026-09-05
**Where run:** OptiPlex 7050 (`LinuxCNC`), at the machine
**Result:** **7i84U-A did not enumerate** on HostMot2 smart-serial port 0, channel 0.

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
