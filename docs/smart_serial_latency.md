# Smart-serial latency and watchdog limits

_Applies to two 7i84U remotes on 7i44 channels 0 and 1, HostMot2 smart-serial
port 0, with a 1 kHz LinuxCNC servo thread._

## Verified facts

The [Mesa 7i84U manual](https://www.mesanet.com/pdf/parallel/7i84uman.pdf)
documents:

- A 2.5 Mbaud RS-422 SSLBP interface.
- Process-data update rates up to 10 kHz.
- A maximum of 100 microseconds from a DOIT command to command-register clear
  and valid input data.
- A default 50 ms remote watchdog that disables outputs when host access is
  lost; a zero timeout disables that watchdog and must not be used here.

The [LinuxCNC HostMot2 manual](https://linuxcnc.org/docs/2.9/html/man/man9/hostmot2.9.html)
documents that `hm2_...read` transfers FPGA input state to HAL and
`hm2_...write` transfers output state to the FPGA. It documents DPLL timer
assignment for absolute serial encoders, quadrature encoders, step generators,
and XY2. It does **not** document a DPLL timer assignment for HostMot2 resolver
or smart-serial modules.

The [LinuxCNC hm2_eth manual](https://linuxcnc.org/docs/2.9/html/man/man9/hm2_eth.9.html)
documents `packet-error`, `packet-error-level`, and
`packet-error-exceeded` plus their tuning parameters.

## Values that are not established by those sources

Do not use any of the following as design facts until measured on the loaded
7i80HDT bitfile and target host:

- A fixed 7i84U input-debounce or register-update time.
- A guarantee that an input transition is visible on the first or second
  subsequent servo-thread read.
- A fixed end-to-end input or output latency such as 1.0 or 1.2 ms.
- A `[HOSTMOT2] SSERIAL_TIMER` setting; that INI key is not documented for
  this configuration.
- DPLL synchronization of either the 7i49 resolver channels or 7i84U
  smart-serial process data.
- A calculated probing error or stop distance based only on the 100 us DOIT
  bound. Host scheduling, Ethernet timing, component order, relay response,
  drive response, and mechanical deceleration remain separate terms.

## Design consequences

- Limits and the probe may be monitored through the 7i84U, but their complete
  event-to-HAL latency must be measured. The probe feed and repeatability
  acceptance must use that measured distribution, including worst observed
  jitter.
- The software E-stop monitor on a 7i84U is not the primary E-stop path. The
  OEM/hardwired safety chain must remove hazardous power without LinuxCNC,
  Ethernet, the FPGA, the 7i44, or either 7i84U functioning.
- Drive-enable outputs rely on both the HostMot2 watchdog and each remote's
  watchdog to fail off after communication loss. Those behaviors must be
  fault-injected; prose and default values are not acceptance evidence.
- Motion-adjacent outputs must be scheduled before `hm2_7i80.0.write`.
  The active HAL now schedules the write last in `atc_orient.hal`.

## Required measurement

Record results under `docs/commissioning_logs/`:

1. Confirm `WATCHDOGTIME` and `NVWATCHDOGTIME` on both remotes; retain the
   50 ms default unless a measured risk analysis requires a shorter value.
2. Toggle a spare 7i84U input with a function generator while recording the
   physical edge and HAL response. Test both remotes, unloaded and under
   worst-case CPU/network load, for at least one hour.
3. Toggle a spare output from HAL while recording the HAL request and physical
   terminal edge. Include interposing-relay pickup/drop time separately.
4. Measure probe event-to-latched-position behavior at several feeds and both
   approach directions. Set the allowed probing feed from measured overtravel
   and repeatability, not an assumed one-servo-period delay.
5. Pull the 7i44 link and Ethernet link during a low-energy test. Confirm
   outputs disable, software latches fault, restart is inhibited, and manual
   reset is required.
6. Record `packet-error-level`, `packet-error-exceeded`, servo-thread latency,
   NIC driver, IRQ affinity, and offload/coalescing settings during every test.

## Configuration position

- Keep channels 0 and 1 enabled with `sserial_port_0=00xxxxxx` only after the
  actual bitfile IDROM confirms one smart-serial port with those channels.
- Do not add `hm2dpll` or `SSERIAL_TIMER` settings for smart serial/resolvers
  without an applicable primary source or a PCW-confirmed bitfile-specific
  implementation.
- Keep both hardware watchdogs enabled and treat any watchdog bite or
  `packet-error-exceeded` as a latched motion-inhibit requiring investigation.
