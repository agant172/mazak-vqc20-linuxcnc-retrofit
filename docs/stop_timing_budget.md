# Enable, fault, and Z-brake timing budget

Status: sequence template drafted; no physical times are accepted. The checked-
in 0.100 s Z delays are commissioning placeholders, not evidence that the head
cannot drop.

## Active software sequence

For X/Y, `joint.N.amp-enable-out` is AND-gated with `motion-permit` and written
to 7i84U-B OUT0/OUT1. For Z, the gated request follows this asymmetric logic:

```text
enable request rises:  Z S-ON request immediately -> wait 0.100 s -> brake release
enable request falls:  brake release drops immediately -> wait 0.100 s -> Z S-ON drops
```

The delay is open-loop. There is no Z drive-ready input dedicated to the delay,
no brake-current input, and no brake-position/torque confirmation. Smart-serial,
relay, solenoid, amplifier, and mechanical delays are additional and must be
measured; the HAL timer alone does not define physical order.

## Measurement channels

Record all channels on one timebase where possible:

| Channel | Physical measurement—not only HAL |
|---|---|
| Stop/fault stimulus | E-stop contact, drive ALM contact, Ethernet/link edge, or command edge |
| HAL request | `z-enable-request`, `z-brake-release`, `z-enable`, relevant fault and watchdog nets |
| 7i84U terminal | OUT2 Z S-ON and 7i84U-A OUT6 brake-release command |
| Relay/drive input | Actual interposing-relay contact and amplifier S-ON terminal |
| Brake coil | Voltage and current at SOL-201 |
| Drive state | Verified READY/torque indication if available |
| Mechanical response | Z displacement/velocity with independent sensor and approved support |
| DC bus/main contactor | Main-coil contact and P/N voltage where applicable |

## Required test matrix

Fill measured edge-to-edge times; blank cells fail the hold point.

| Case | Brake command off | Brake mechanically holding | S-ON off | Torque unavailable | Main contactor off | Z displacement / stop distance | Result |
|---|---:|---:|---:|---:|---:|---:|---|
| Normal machine-off | | | | | | | |
| Hardware E-stop | | | | | | | |
| Mains/control-power loss | | | | | | | |
| hm2_eth/NIC loss | | | | | | | |
| 7i44/7i84U link loss | | | | | | | |
| X amplifier alarm | | | | | | | |
| Y amplifier alarm | | | | | | | |
| Z amplifier alarm | | | | | | | |
| Resolver error | | | | | | | |
| Brake-coil open circuit | | | | | | | |

## Acceptance decisions

1. Determine required torque-build time before brake release and required
   brake-set time before torque removal from the exact drive/brake data plus
   measurement under worst approved load, temperature, and bus condition.
2. Set the two HAL delays with margin from those results. Do not make both
   edges symmetric.
3. Prove loss of HAL/FPGA/remote power reaches a safe physical state without
   relying on the next software cycle.
4. A brake-coil open circuit is currently undetected in HAL. Add suitable
   verified feedback or document and approve the residual risk before Z motion.
5. Cross-reference the signed E-stop matrix and shared-bus discharge log. Bus
   voltage remaining after S-ON drops is expected and is not proof of torque or
   service safety.

Store scope traces and the completed table under
`docs/commissioning_logs/stop_timing/`; record the active commit, bitfile hash,
load, temperature, and instrument setup.
