# hm2_eth servo-thread timing bench — run record, 2026-08-21

> **Address note (2026-08-23):** the Mesa control subnet moved from `192.168.1.0/24` to `10.10.10.0/24` (host `10.10.10.1`, board `10.10.10.121`) because the old range collided with the workshop LAN. Addresses below are kept as-recorded and are correct for the date shown.

> **ROLE: BENCH TEST (PC + Mesa stack only)** — measures `servo-thread` timing
> against the real 7i80HDT/7i49/7i44/one-7i84U stack (see
> [`../../../README.md`](../../../README.md) confirmed architecture). **No
> machine attached, nothing energized on the machine side.** Produces no
> electrical evidence and does not validate axis motion — see
> [`hm2_eth_nic_validation.md`](../../hm2_eth_nic_validation.md) for the
> PC/NIC-side D14 qualification this feeds into.

**Machine:** Mazak VQC 20/40, SN 060231 (Mesa side only; machine not connected)
**Date:** 2026-08-21
**Where run:** OptiPlex 7050 (`LinuxCNC`), Mesa stack cabled and powered
**Repo commit at time of run:** `bc6f3c1`

## Result

Every configuration tested — idle, under `stress-ng` load, core-isolated,
housekeeping-CPU-only, wifi up, wifi down — showed `servo-thread` max-time
**spikes well past the 1 ms period**, up to **3.17 ms** on one run. No run
recorded a `packet-error-total` above zero. Isolating the thread to core 3 and
disabling the onboard wifi adapter each ruled out one *suspected* cause without
fixing the spikes; the source is still open. Practical read: **the INI's
current 1 ms `SERVO_PERIOD` cannot be trusted to hold** on this box as
configured; 2 ms periods still spiked on some samples too, so widening the
period alone is not yet a confirmed fix.

## Method

Five scripts, all loading only `hostmot2` + `hm2_eth` against the real board at
`192.168.1.121` with `bench.hal`'s device config (3 resolvers, 4 pwmgens,
`sserial_port_0` for the one owned 7i84U) — no LinuxCNC, no machine HAL, no
motion. Each measures `show thread` (`servo-thread (avg-time, max-time)` in
ns) and `hm2_7i80.0.packet-error-total` after a settle period, using
`setp servo-thread.tmax 0` to reset the max-time sample before each measured
window because a single sample was too noisy to judge alone (see
`core_test.sh`'s comment).

| Script | Question asked | Log |
|---|---|---|
| `core_test.sh` | Does pinning the thread to an isolated core (`taskset -c 3`) fix the spikes, vs. leaving it on the housekeeping cores (0,1)? At 1 ms and 2 ms periods, 2-3 trials each. | `core_test.log` |
| `wifi_test.sh` | Does the onboard USB wifi adapter (`wlx20e15d9e9d08`) cause the spikes? Measures with wifi up vs. administratively down, self-restoring via `trap` + an independent 15-minute deadman timer so a dropped SSH session can't strand the box offline. | `wifi_test.log` |
| `confirm2ms.sh` | Sanity check at a 2 ms period, idle vs. under `stress-ng --cpu 1 --io 1` load. | (printed to stdout, not logged to a file) |
| `sweep.sh` | Same load test swept across 1/2/3 ms periods. | (printed to stdout, not logged to a file) |
| `iso.sh` | Does the picture change with sserial (7i84 polling) disabled entirely, or with resolvers/pwmgens removed too? | (printed to stdout, not logged to a file) |

`bench.hal` / `p.hal` / `run_bench.hal` / `steady.hal` are the underlying bench
config and its ad hoc variants used interactively while developing the above
(not each independently meaningful — kept for reference).

## Selected results (servo-thread avg-time, max-time, both ns; period 1 ms unless noted)

```
soak.log   (idle, 5 min)                          (   523634,  2450250 )
wifi_test  wifi UP,   1 ms                          (   738480,  3172684 )
wifi_test  wifi UP,   2 ms                          (   522184,  1522302 )
wifi_test  wifi DOWN, 1 ms                          (   523676,  1460772 )
wifi_test  wifi DOWN, 2 ms                          (   521866,  2826216 )
core_test  ISOLATED core3, 1 ms, 3 runs             1572468–2324200 max
core_test  HOUSEKEEP 0,1,   1 ms, 3 runs            1437396–2194508 max
core_test  ISOLATED core3, 2 ms, 2 runs             1647744–1660570 max
```

Full `show thread` / `packet-error-total` output for every run is in
`core_test.log` and `wifi_test.log`. `soak.log` also has the full `hm2_eth`
board-enumeration dump from that run for reference (72 I/O pins, one 7i84U on
sserial channel 0, SSerial firmware v43).

## What this does not prove

No axis moved, no drive was enabled, and no field wiring was involved — this
is PC/Ethernet-side timing only. It does not test behavior with two 7i84U
boards (only one is owned as of this run — see
[`../../../bom/README.md`](../../../bom/README.md)), and it does not identify
the root cause of the spikes; core isolation and wifi-down each failed to
eliminate them.
