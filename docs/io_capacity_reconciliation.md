# 7i84U DI/DO capacity reconciliation

_Updated 2026-08-07. Electrical authority remains
[`../mesa/current_pin_authority.csv`](../mesa/current_pin_authority.csv)._

## Counting rule

Count only rows that occupy one exact physical channel (`IN0` through
`IN31`, or `OUT0` through `OUT15`) and whose status is not `SPARE`.
Power/link rows and spare rows are not I/O requirements. Range rows are
forbidden for 7i84U cards because they can overlap an explicit assignment;
every spare terminal now has its own CSV row.

The 7i84U hard capacity is 32 digital inputs and 16 digital outputs per
card. Source: [Mesa 7i84U manual](https://www.mesanet.com/pdf/parallel/7i84uman.pdf).

## Current scoped allocation

| Card | Required DI | Required DO | Capacity | Reserve |
|---|---:|---:|---:|---:|
| 7i84U-A | 32 | 16 | 32 DI / 16 DO | 0 DI / 0 DO |
| 7i84U-B | 11 | 10 | 32 DI / 16 DO | 21 DI / 6 DO |
| **Total** | **43** | **26** | **64 DI / 32 DO** | **21 DI / 6 DO** |

The B-card count includes the three channels absent from the earlier
calculation:

- `IN9` — `AIR_OK`, fail-inhibited ATC pressure permissive.
- `OUT8` — `MAG_COVER_CLOSE_SOL`, proposed single-coil cover command.
- `OUT9` — `WORK_LIGHT`, proposed 100VAC work light via interposing relay RLY-8.

The former `43 DI + 25 DO` text reached the same numbers incorrectly by
counting aggregate spare-range rows as occupied channels. Those aggregate
rows have been removed. The figures above follow directly from exact CSV
channel rows and are enforced by `scripts/validate_authority.py`.

## Does a second 7i84U add up?

Yes: **two cards total are required and sufficient for the currently scoped
retrofit**.

- One card cannot fit 43 DI / 25 DO and 7i84U-A is already full.
- The second card leaves 21 DI and 7 DO after allocating air pressure and the
  magazine-cover valve.
- A third 7i84U is not justified by the current signal inventory.

This is a logical channel calculation only. It does not prove that an output
bank can carry the connected current, that a 100 VAC load can be driven
directly, or that safety functions may be routed through software. The
7i84U output current/group limits, interposing relays, suppression, field
power segregation, and hardware E-stop path still require D4/D5 acceptance
from [`pre_power_deliverables.md`](pre_power_deliverables.md).

## Current B-card allocation

### Inputs

- IN0-IN5: X/Y/Z overtravel limits.
- IN6-IN8: X/Y/Z home switches.
- IN9: machine air-pressure OK.
- IN10-IN14: spare.
- IN15: Renishaw probe.
- IN16-IN31: spare.

Result: 11 used, 21 spare.

### Outputs

- OUT0-OUT2: X/Y/Z drive enables.
- OUT3-OUT5: air blast, touch-sensor blast, tap-coolant blast.
- OUT6: ATC barrier.
- OUT7: flood valve.
- OUT8: proposed magazine-cover close valve.
- OUT9-OUT15: spare.

Result: 9 used, 7 spare.

## Scope decisions

| Function | Decision | Capacity effect |
|---|---|---:|
| 2PC pallet changer | Not in current retrofit scope; physically isolate if fitted | 0 current channels |
| Manual tool clamp/unclamp buttons | Retained on 7i84U-A IN30/IN9; clamp remains HAL-unbound pending commissioning | Already counted |
| Mist coolant | Existing A-card OUT12 remains `HOLD_CONFLICT` | Already counted |
| Work light | Deferred and unassigned | Would consume 1 of 7 spare DO |
| Additional air/pressure diagnostics | Deferred | Consume B-card spare inputs as traced |

If the pallet changer is later restored, inventory every sensor and load as
individual CSV rows before buying hardware. Do not use the old estimated
“4-6 IN / 3-4 OUT” range as a wiring design. The current reserve suggests it
may fit, but bank current, commoning, interlocks, and actual device count must
be checked first.

## Expansion path

The 7i44 exposes eight physical smart-serial channels. The current firmware
plan uses channel 0 for 7i84U-A and channel 1 for 7i84U-B within HostMot2
smart-serial port 0 (`sserial_port_0=00xxxxxx`). A future third remote would
use channel 2 and require a bitfile/IDROM-confirmed mask such as
`sserial_port_0=000xxxxx`; this is not an authorization to flash an assumed
bitfile.
