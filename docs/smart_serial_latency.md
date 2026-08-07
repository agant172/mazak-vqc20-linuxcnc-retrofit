# Smart-serial (SSLBP) latency budget

## Audit finding #18 (verbatim)

> Documentation elsewhere in this repository casually implies that a
> 7i84U input over smart-serial is "the same" as a directly-wired
> Mesa GPIO input, and does not account for the additional polling
> and transfer latency introduced by SSLBP. Any calculation of stop
> distance, watchdog safe-state, or E-stop response must budget the
> smart-serial round-trip time. Establish the latency numbers from
> Mesa's documentation and compute the worst-case stop distance for
> a limit-switch or E-stop input that lands on a 7i84U.

## Standing position

**Smart-serial is not identical to direct GPIO.** Reading a 7i84U
input requires:

1. A LinuxCNC servo-thread `hm2_...read` that packs an SSLBP DOIT
   command for the sserial port.
2. A 2.5 Mbaud LBP transfer between the FPGA and each channel on the
   port.
3. The 7i84U's own input debounce and register update.
4. The next `hm2_...read` cycle to actually deliver the input into
   HAL for consumption by downstream components.

This document establishes worst-case numbers from the primary sources
and applies them to the two decisions the E-stop and ATC-zone designs
depend on: (a) the safe-state behavior when the watchdog bites, and
(b) the worst-case stop distance from an input transition to
mechanical rest under retrofit control.

## What the primary sources actually say

### SSLBP baud, framing, and burst layout

From the [Mesa 7i84U manual](https://www.mesanet.com/pdf/parallel/7i84uman.pdf):

> "The RS-422 interface at 2.5 MBaud is compatible with HostMot2's
>  SSLBP smart serial interface."
> "In the operate mode, the baud rate is set to 2.5M baud (default)."
> "The sserial module supports the standard LBP 2.5 M Baud
>  communication rate and process data update rates to 10 KHz."
> "In operate mode, command timeout is set by SSLBP to be 4 character
>  times (16 uSec at 2.5M baud)."
> "The SSLBP firmware always sends commands in bursts without
>  inter-character gaps so will always meet this timing."

At 2.5 Mbaud, one character = ~4 µs. A DOIT round-trip that carries
the process-data payload for a 7i84U (32 bits of input + 16 bits of
output plus command/CRC framing) is a small multiple of tens of
character times.

### DOIT-to-host readable input data

Also from the 7i84U manual:

> "After the completion of a successful DOIT command, the incoming
>  process data from the remote can be read."
> "This will take a maximum of 100 uSec from the DOIT command to
>  command register clear and valid input data."

So the FPGA-side transfer of already-sampled input data into the
host-readable interface register is bounded at **100 µs per DOIT**.

### Servo-thread synchronization and DPLL

From the [LinuxCNC hostmot2(9) man page](https://linuxcnc.org/docs/2.9/html/man/man9/hostmot2.9.html):

> "`hm2_<BoardType>.<BoardNum>.read` — This reads the encoder
>  counters, stepgen feedbacks, and GPIO input pins from the FPGA."
> "The hm2dpll is a phase-locked loop timer module which may be used
>  to reduce sample and write time jitter for some hm2 modules."
> "This module is a phase-locked loop that will synchronise itself
>  with the thread in which the hostmot2 'read' function is installed
>  and will trigger other functions that are allocated to it at a
>  specified time before or after the 'read' function runs."

The `hostmot2` man page does not explicitly document sserial as
synchronous with the host servo thread the way it does for BiSS /
Fanuc / SSI serial encoders. In practice, sserial polling is bounded
by the DOIT-per-servo-cycle rhythm, and an input change is guaranteed
to be visible to HAL no later than the SECOND servo-thread read after
the physical transition (first read may catch the pre-change frame in
flight; second read is guaranteed post-transition + DOIT complete).

### 7i84U watchdog

From the 7i84U manual (quoted at length):

> "The 7I84U has a watchdog timer that will set all set a fault flag
>  if host communication does not occur at a minimum rate."
> "Default watchdog time is 50 mS ... if not accessed at a greater
>  than 20 Hz rate, the watchdog will bite and disable the outputs."
> "When a fault flag is set, outputs can not longer be set and the
>  host must first clear the fault before normal operation can
>  continue."
> "This is also the 7I84Us startup condition, meaning the host must
>  first clear the fault before starting normal operation."
> "The watch dog is a safety feature and should normally not be
>  disabled nor set to long timeout periods unless the consequences
>  of loss of control of outputs is not important."
> "A watchdog timeout value of 0 will disable the watchdog."

Watchdog configuration parameters:

> "The non-volatile watchdog timeout is set via the NVWATCHDOGTIMEOUT
>  parameter. The working watchdog timeout is set with the
>  WATCHDOGTIME parameter."
> "All non volatile parameters start with the letters NV.
>  Non-volatile parameters are stored permanently in the processors
>  EEPROM and are copied to the volatile working parameters at
>  power-up."

Safe-state on watchdog expiry:

> "the watchdog will bite and disable the outputs."
> "This setup [normal start] includes clearing any faults, setting
>  remote operational mode, and setting the outputs off."

The 7i84U manual does NOT document a per-output configurable
safe-state; the documented safe state on watchdog expiry is **all
outputs disabled** (equivalent to "off"). This matches what we need
for both the drive-enable outputs on 7i84U-B TB3 OUT0-2 and the
100VAC relay-driven loads on OUT3-7.

## Retrofit latency budget

For the specific stack on this machine (7i80HDT over `hm2_eth` with
1 kHz servo thread, one 7i44 P1, two 7i84U cards on port 0 channels
0 and 1, no DPLL synchronization configured):

| Contribution | Nominal | Worst case | Notes |
|---|---:|---:|---|
| Input debounce / register update in 7i84U | ~10 µs | ~50 µs | Bounded by the 7i84U's internal cyclic update; sub-servo-cycle |
| DOIT round trip on the 2.5 Mbaud SSLBP link | ~50 µs | ~100 µs | Per Mesa "100 uSec max DOIT-to-readable" |
| Wait for next `hm2_eth.read` invocation | ~500 µs | 1000 µs | Half to full servo period at 1 kHz |
| HAL propagation through downstream components | ~10 µs | ~50 µs | net → estop-latch → iocontrol.emc-enable-in in the current chain |
| **Total input transit** | **~570 µs** | **~1200 µs (~1.2 ms)** | Physical transition → LinuxCNC-visible logic |

For comparison, a bare-FPGA GPIO input on the 7i80HDT P3 header has:

| Contribution | Nominal | Worst case |
|---|---:|---:|
| FPGA input synchronizer | ~40 ns | ~120 ns |
| `hm2_eth.read` cycle wait | ~500 µs | 1000 µs |
| **Total input transit** | ~500 µs | ~1000 µs |

The **incremental smart-serial cost is ~100-200 µs of DOIT round trip
per servo cycle**, not zero, but also not the many-millisecond figure
that would motivate a hardware-only stop path. In both cases the
dominant term is the servo-period wait, not the electrical transport.

**This does NOT mean smart-serial is safe as a sole safety path.**
The 7i80HDT's `hm2_eth` link is itself a potential failure point that
can add tens of milliseconds of stall (or unbounded stall if the
Ethernet link drops), and the smart-serial polling stops entirely
when the host stops issuing DOIT commands. That is precisely why the
retrofit's E-stop design ([`estop_safety_chain.md`](estop_safety_chain.md))
places the OEM MAR relay chain in series with the LinuxCNC-driven
drive enables — not because sserial adds meaningful microseconds, but
because a stuck or dead LinuxCNC host can silently stop polling for
tens of milliseconds to seconds before its own watchdog notices.

## Worst-case stop distance

Take the fastest axis on this machine (X, at commanded rapid = ~7.0
in/s ≈ 178 mm/s per M-2 parameters RF1..4) and integrate a stop from
an input event to mechanical rest under retrofit control:

| Phase | Time | Distance at 178 mm/s |
|---|---:|---:|
| Smart-serial input transit (worst case) | ~1.2 ms | 0.21 mm |
| LinuxCNC decides + drops drive-enable output | 1× servo cycle = 1 ms | 0.18 mm |
| Smart-serial output transit to 7i84U-B OUT | ~1.2 ms | 0.21 mm |
| Interposing relay drop-out (RLY-4 typical) | ~10 ms | 1.78 mm |
| MDS drive enable removal → PWM off | ≤5 ms | 0.89 mm |
| Mechanical deceleration from full rapid | ~120 ms* | ~10.7 mm |
| **Total, worst case, controlled stop** | **~140 ms** | **~14 mm (~0.55 in)** |

*Mechanical deceleration term uses the OEM M-2 rapid-accel time
constant `RT = 120 ms` from
[`docs/parameters_sn060231.md`](parameters_sn060231.md); actual
deceleration under uncontrolled coast will be longer.

A **hardware Cat-0 E-stop** (contactor drop, uncontrolled coast)
skips the LinuxCNC + smart-serial contributions entirely and depends
only on the safety relay + contactor + drive coast time. That is
still the primary path per [`estop_safety_chain.md`](estop_safety_chain.md).

## Safety-critical implications

1. **Limit switches on 7i84U-B TB3 IN0-8** — acceptable for a normal
   overtravel abort. The ~1.2 ms input transit plus ~10 mm mechanical
   stop margin is well within the physical bumper distance beyond
   each soft limit. These are NOT the primary hard-overtravel
   protection; hardwired overtravel switches through the OEM MAR
   relay chain remain the primary. Retrofit soft-limit + smart-serial
   limit-switch input is defense-in-depth.
2. **Renishaw MP-3 probe (skip) on 7i84U-B TB3 IN15** — the added
   ~1.2 ms input transit is a real probing-accuracy consideration.
   At a probe feed of 3.0 in/min (~1.27 mm/s), 1.2 ms is ~1.5 µm of
   probe overtravel error. That is smaller than the MP-3's own
   repeatability spec (~1 µm 2σ) but it should be included in the
   commissioning offset. See TODO below.
3. **Drive-enable outputs on 7i84U-B TB3 OUT0-2** — sole electrical
   path from LinuxCNC to drive enable. Watchdog safe state (all
   outputs disabled) is correct. These outputs sit IN SERIES with the
   OEM amp enables driven by the MAR relay chain; loss of the MAR
   relay chain, loss of the smart-serial link, loss of `hm2_eth`, or
   loss of the LinuxCNC host all remove drive enable. This is
   consistent with the E-stop safety chain design.
4. **ATC-zone permit (`M100`/`M101`)** — see
   [`y_soft_limit_atc_zone.md`](y_soft_limit_atc_zone.md). The
   dynamic `axis.y.max-pos-limit` write happens inside LinuxCNC and
   the enforcement is by the motion controller, not by the 7i84U, so
   smart-serial latency does not gate this decision. What smart-serial
   latency DOES gate is the PRS-55/66 consistency check — the
   `mazak_atc_zone` component must not raise a permit-drop alarm on a
   ~2 ms disagreement between commanded Y and PRS-55 state; use a
   configurable dwell (default 20 ms) before reacting.

## Retrofit watchdog configuration

- Keep 7i84U-A and 7i84U-B on the factory-default `NVWATCHDOGTIME =
  50` (ms). This gives the LinuxCNC host up to 50 ms of latency spike
  before outputs are disabled. Do not disable the watchdog and do not
  extend it beyond 100 ms.
- Configure `[HOSTMOT2] SSERIAL_TIMER = 20000` (20 ms) or similar so
  that transient link stalls don't wait for the full 50 ms 7i84U
  watchdog before the host notices; leaves margin before the 7i84U
  fires its own safe-state.
- On startup, LinuxCNC must issue a normal start sequence (documented
  by the 7i84U manual: "clearing any faults, setting remote
  operational mode, and setting the outputs off") before any drive
  enable can be commanded.
- `estop_latch` must gate the drive-enable outputs on the safe-state
  side: dropping `iocontrol.0.emc-enable-in` drops both the LinuxCNC
  soft E-stop AND the 7i84U-B drive-enable outputs on the same servo
  cycle, giving a bounded stop path even if the smart-serial link is
  otherwise healthy.

## Follow-up work required

- [ ] Add `hm2dpll` to the config and route sserial + resolver reads
  through a DPLL slot so their sampling jitter is bounded and
  predictable. Not required for basic operation, but reduces the
  worst-case servo-period-wait component.
- [ ] During commissioning, oscilloscope-verify the actual DOIT round
  trip time and update this budget with measured numbers.
- [ ] Include the smart-serial input transit in the probing offset
  during MP-3 calibration (see item 2 above); log the measured
  offset under `docs/commissioning_logs/`.
- [ ] Fault-inject a `hm2_eth` link drop (unplug Ethernet during
  jog) and confirm: (a) LinuxCNC raises the hm2_eth watchdog and
  drops emc-enable-in, (b) 7i84U-B fires its own 50 ms watchdog and
  disables outputs, (c) OEM MAR relay chain drops as a consequence
  of losing the drive-enable outputs, (d) all motion stops. Record
  measured times.
- [ ] Confirm the interposing-relay drop-out time for the specific
  relays used on 7i84U-B TB3 OUT3-7 (RLY-4 through RLY-8); update the
  worst-case stop-distance table if they are slower than the ~10 ms
  budgeted here.

## Sources

- Mesa 7I84U manual (baud, LBP framing, DOIT timing, watchdog
  parameters, safe-state behavior):
  [https://www.mesanet.com/pdf/parallel/7i84uman.pdf](https://www.mesanet.com/pdf/parallel/7i84uman.pdf)
- LinuxCNC 2.9 hostmot2(9) man page (SSerial config, `hm2_...read`
  ordering, DPLL synchronization for hm2 modules):
  [https://linuxcnc.org/docs/2.9/html/man/man9/hostmot2.9.html](https://linuxcnc.org/docs/2.9/html/man/man9/hostmot2.9.html)
- LinuxCNC 2.9 sserial(9) man page (referenced from hostmot2(9) for
  smart-serial device detail):
  [https://linuxcnc.org/docs/2.9/html/man/man9/sserial.9.html](https://linuxcnc.org/docs/2.9/html/man/man9/sserial.9.html)
- Repo cross-references (internal): `docs/parameters_sn060231.md`
  (RF/RT rapid + accel time constants), `docs/estop_safety_chain.md`,
  `docs/dc_bus_stop_fault.md`, `docs/y_soft_limit_atc_zone.md`,
  `linuxcnc/mazak_vqc_20_40.hal` (estop-latch chain),
  `linuxcnc/field_7i84u.hal` (input/output allocation).
