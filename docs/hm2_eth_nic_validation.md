# hm2_eth / Debian 13 NIC validation

## Audit finding #20 (verbatim)

> hm2_eth/Debian 13 validation is incomplete.
> Consequence: real-time packet loss, watchdog trips mid-cut, motion
> stalls or overtravel.
> Truth: hm2_eth is only "uspace" realtime; NIC must be dedicated
> with coalescing and offloads off; latency-under-load must be
> measured; packet-error/timeout must inhibit motion.
> Sources:
> - [https://linuxcnc.org/docs/2.9/html/getting-started/getting-linuxcnc.html](https://linuxcnc.org/docs/2.9/html/getting-started/getting-linuxcnc.html)
> - [https://linuxcnc.org/2026/07/09/LinuxCNC-2.9.10/](https://linuxcnc.org/2026/07/09/LinuxCNC-2.9.10/)
> - [https://linuxcnc.org/docs/2.9/html/man/man9/hm2_eth.9.html](https://linuxcnc.org/docs/2.9/html/man/man9/hm2_eth.9.html)
> Edit: pin NIC chipset, run a multi-hour worst-load latency test,
> and wire the driver's error/timeout pins to inhibit motion.

## What the primary sources actually say

The [`hm2_eth(9)` manpage](https://linuxcnc.org/docs/2.9/html/man/man9/hm2_eth.9.html)
is the authority. Verbatim points that drive this plan:

- **Realtime kernel requirement.** "hm2_eth is only available when
  LinuxCNC is configured with 'uspace' realtime." — [hm2_eth(9)](https://linuxcnc.org/docs/2.9/html/man/man9/hm2_eth.9.html)
- **Dedicated NIC.** "hm2_eth should be used on a dedicated network
  interface, with only a cable between the PC and the board.
  Wireless and USB network interfaces are not suitable." —
  [hm2_eth(9)](https://linuxcnc.org/docs/2.9/html/man/man9/hm2_eth.9.html)
- **Static interface configuration** goes in `/etc/network/interfaces`
  with `iface eth1 inet static`, `address 192.168.1.1`, and
  `hardware-irq-coalesce-rx-usecs 0`. — [hm2_eth(9)](https://linuxcnc.org/docs/2.9/html/man/man9/hm2_eth.9.html)
- **Marvell caveat.** "'hardware-irq-coalesce-rx-usecs' decreases
  time waiting to receive a packet on most systems, but on at least
  some Marvel-chipset NICs it is harmful. If the line does not
  improve system performance, then remove it." — [hm2_eth(9)](https://linuxcnc.org/docs/2.9/html/man/man9/hm2_eth.9.html)
- **Firewall.** "hm2_eth uses an iptables chain called
  'hm2-eth-rules-output'." — [hm2_eth(9)](https://linuxcnc.org/docs/2.9/html/man/man9/hm2_eth.9.html)
- **`packet-read-timeout` parameter.** "If the value is less than or
  equal to 0, it is interpreted as 80% of the thread period. If the
  value is less than 100, it is interpreted as a percentage of the
  thread period. Otherwise, it is interpreted as a time in
  nanoseconds. In any case, the timeout is never less than 100
  microseconds." "Setting this value too low can cause spurious read
  errors. Setting it too high can cause realtime delay errors." —
  [hm2_eth(9)](https://linuxcnc.org/docs/2.9/html/man/man9/hm2_eth.9.html)

The [LinuxCNC 2.9.10 release notes](https://linuxcnc.org/2026/07/09/LinuxCNC-2.9.10/)
confirm:

- "The LinuxCNC repositories have been updated for Buster,
  Bullseye, Bookworm, Trixie and Sid." — [2.9.10 notes](https://linuxcnc.org/2026/07/09/LinuxCNC-2.9.10/)
  Trixie is Debian 13; this is the LinuxCNC-supplied path onto
  Debian 13.
- PR #4022 backports PREEMPT_RT detection for kernel 6.12 and later
  — [2.9.10 notes](https://linuxcnc.org/2026/07/09/LinuxCNC-2.9.10/)
- No `hm2_eth` change is listed in the 2.9.10 changelog.

## HAL pins and parameters actually exposed by hm2_eth

Only these are documented by the manpage. Anything else is
`hostmot2(9)`-wide (encoders, resolvers, watchdog, sserial), not
hm2_eth-specific.

### Pins

| Pin | Type | Meaning |
|---|---|---|
| `hm2_7i80.0.packet-error` | `bit out` | TRUE when the most recent cycle detected a read or write error. |
| `hm2_7i80.0.packet-error-level` | `s32 out` | Current error level, 0..packet-error-limit. |
| `hm2_7i80.0.packet-error-exceeded` | `bit out` | TRUE when the error level equals the maximum. |

Cross-reference: the standard HostMot2 `io-error` pin (documented in
`hostmot2(9)`, not on the hm2_eth page) becomes TRUE when
`packet-error-exceeded` latches. It must be reset manually.

### Parameters

| Parameter | Type | Meaning |
|---|---|---|
| `hm2_7i80.0.packet-error-decrement` | `s32 rw` | Deducted per clean cycle. |
| `hm2_7i80.0.packet-error-increment` | `s32 rw` | Added per error cycle. |
| `hm2_7i80.0.packet-error-limit` | `s32 rw` | Threshold at which `io-error` latches. |
| `hm2_7i80.0.packet-read-timeout` | `s32 rw` | See above. |

### Note about the audit's suggested pin names

The audit finding text suggested wiring
`hm2_7i80.0.packet-error-level` (an s32 threshold counter) and
`hm2_7i80.0.watchdog.has_bit` into e-stop. Corrected here:

- The `bit` pin to latch on is **`hm2_7i80.0.packet-error-exceeded`**
  (or the resulting HostMot2 `io-error`), not `packet-error-level`
  (which is an s32).
- The HostMot2 watchdog bit pin is
  **`hm2_7i80.0.watchdog.has_bit`** on the standard hostmot2(9)
  page. This retrofit's e-stop latch already consumes it via
  `docs/estop_safety_chain.md` (fix #15).

## Debian 13 (Trixie) / LinuxCNC 2.9.10 install plan

Repo declaration (verified in the repo top-level README and
`linuxcnc/README.md`): **Debian 13 / LinuxCNC 2.9.10 / PREEMPT-RT**.
The install path is documented at
[getting-linuxcnc.html](https://linuxcnc.org/docs/2.9/html/getting-started/getting-linuxcnc.html)
and combined with [2.9.10 notes](https://linuxcnc.org/2026/07/09/LinuxCNC-2.9.10/):

1. Install Debian 13 (Trixie) base with a text-only or minimal
   desktop, no NetworkManager auto-config of the LinuxCNC control
   NIC. GNOME network manager may remain for the WAN NIC.
2. Add the LinuxCNC repository for Trixie
   (source: [LinuxCNC 2.9.10 release notes](https://linuxcnc.org/2026/07/09/LinuxCNC-2.9.10/) —
   Trixie is one of the listed supported suites).
3. Install `linuxcnc-uspace`, not `linuxcnc` (the RTAI real-time
   variant). hm2_eth requires uspace realtime. [hm2_eth(9)](https://linuxcnc.org/docs/2.9/html/man/man9/hm2_eth.9.html)
4. Install and boot a PREEMPT-RT kernel: either the Debian
   `linux-image-rt-amd64` metapackage (kernel 6.12+ carries the
   backported detection from PR #4022) or a hand-built RT kernel.
   Verify with `uname -r` — the string must contain `-rt-` or
   `PREEMPT_RT`.
5. Confirm real-time budget: `cat /proc/sys/kernel/sched_rt_runtime_us`
   should be `-1`; if positive, set it via
   `/etc/sysctl.d/60-linuxcnc.conf`.
6. Install `mesaflash` (Mesa's flashing tool), `ethtool` (needed for
   `hardware-irq-coalesce-rx-usecs`), and `stress-ng` and
   `linuxcnc-doc-en` for validation.

## NIC pinning

**This retrofit will use an Intel-chipset NIC pinned to the
LinuxCNC control PC.** Pin the actual chipset and MAC:

- [ ] Physical part: **RECORD** during commissioning. Preference
  order: Intel i225-V (2.5 G, but forced to 100BaseT for the
  7i80HDT), Intel i210, Intel i219. Avoid Marvell (see caveat
  above). Avoid Realtek desktop NICs.
- [ ] Interface name at boot: `enp0s31f6` in the current repo docs;
  **verify** with `ip -o link show`.
- [ ] MAC address: **RECORD** with `ip -o link show <iface>`.
- [ ] Chipset: **RECORD** with
  `lspci -nn | grep -i ethernet` and
  `ethtool -i <iface> | grep -E "driver|firmware|bus-info"`.
- [ ] Link negotiated at **100 Mbit/s full-duplex** for the 7i80HDT
  (the board is 100BaseT per the Mesa 7i80HDT product page —
  [Mesa 7i80HDT store](https://store.mesanet.com/index.php?product_id=386)).
  Force with `ethtool -s <iface> speed 100 duplex full autoneg off`.

Rename the interface deterministically. In
`/etc/systemd/network/10-linuxcnc.link`:

```ini
[Match]
MACAddress=aa:bb:cc:dd:ee:ff

[Link]
Name=lcnc0
```

Then reference `lcnc0` in `/etc/network/interfaces` and in HAL. This
removes udev interface-name volatility across kernel updates.

## NIC configuration

### `/etc/network/interfaces`

```ini
# LinuxCNC control link to Mesa 7i80HDT
auto lcnc0
iface lcnc0 inet static
    address 192.168.1.1
    netmask 255.255.255.0
    # No gateway. This is a point-to-point control link.
    hardware-irq-coalesce-rx-usecs 0
    # For Marvell chipsets, delete the line above per hm2_eth(9).
```

Per [hm2_eth(9)](https://linuxcnc.org/docs/2.9/html/man/man9/hm2_eth.9.html):
"After following all the instructions, reboot so that the changes
take effect."

### Disable NetworkManager on the control interface

```bash
sudo nmcli device set lcnc0 managed no
```

Verify: `nmcli device status` should show `lcnc0` as
`unmanaged`.

### Disable IPv6 on the interface

Even though hm2_eth uses IPv4 and no IPv6 issue is documented in the
manpage, an unsolicited router advertisement can cause a real-time
kernel task to service an ND cycle. In
`/etc/sysctl.d/60-linuxcnc.conf`:

```ini
net.ipv6.conf.lcnc0.disable_ipv6 = 1
net.ipv6.conf.lcnc0.autoconf = 0
net.ipv6.conf.lcnc0.accept_ra = 0
```

Load with `sudo sysctl --system`.

### ethtool: hardware offloads off

The manpage does not mandate this, but hardware offloads (TSO, GSO,
GRO, LRO) can defer packet processing beyond one thread period and
cause spurious `packet-error` on cycle boundaries. Set in
`/etc/network/interfaces` under the `iface` stanza:

```ini
    post-up /sbin/ethtool -K lcnc0 tso off gso off gro off lro off
    post-up /sbin/ethtool -K lcnc0 rx off tx off
    post-up /sbin/ethtool -K lcnc0 sg off
    post-up /sbin/ethtool -G lcnc0 rx 128 tx 128
    post-up /sbin/ip link set lcnc0 mtu 1500
```

MTU stays at 1500 — the 7i80HDT does not use jumbo frames.

### IRQ affinity

The manpage does not mandate this either, but on a multi-core CPU
with an isolated real-time core (kernel argument `isolcpus=1,2,3`),
NIC IRQs should not run on the isolated cores.

```bash
# Find the IRQ number:
cat /proc/interrupts | grep lcnc0
# Set affinity to CPU 0:
echo 1 > /proc/irq/<N>/smp_affinity
```

Persist via `/etc/systemd/system/set-lcnc-irq.service`:

```ini
[Unit]
Description=Set LinuxCNC NIC IRQ affinity
After=network-online.target

[Service]
Type=oneshot
ExecStart=/usr/local/sbin/set-lcnc-irq.sh
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
```

### Firewall

Per the manpage, hm2_eth creates and manages an iptables chain
`hm2-eth-rules-output`. On Debian 13 with `nftables` as the default,
either:

- Keep `iptables-nft` compatibility installed
  (`sudo apt install iptables`), which is the default and lets
  hm2_eth's iptables invocation work transparently, **or**
- Add explicit nftables rules that don't block the 192.168.1/24
  subnet on `lcnc0`.

Verify no `ufw` or `firewalld` DROP rule affects `lcnc0` before
loading hm2_eth. `iptables -L hm2-eth-rules-output -v` after
`realtime start` should show the chain populated.

## Real-time validation — multi-hour latency-under-load

### Baseline (idle)

```bash
# From /usr/bin/latency-test (part of linuxcnc-uspace):
latency-test
```

Log for **≥ 15 minutes idle**. Record:
- Base thread jitter (ns).
- Servo thread jitter (ns).
- Max servo-thread jitter must be under the servo-thread period.
  With a 1 ms servo thread, sustained max jitter above 50 µs (5 %)
  is a red flag.

Save to `docs/commissioning_logs/latency_baseline_YYYY-MM-DD.txt`.

### Under system load

Run `latency-test` in one terminal for **≥ 4 hours** while a second
terminal runs:

```bash
stress-ng --cpu 4 --io 2 --vm 2 --vm-bytes 512M --hdd 1 \
    --hdd-bytes 512M --timeout 4h --metrics
```

- Ethernet traffic on the WAN NIC (bulk copy or `iperf3`) should
  also be active on a **different** NIC to prove the LinuxCNC NIC
  is truly isolated.
- The LinuxCNC servo thread jitter must not exceed the same
  threshold established during the idle baseline. Any excursion
  above the servo period is a failure.

Log to `docs/commissioning_logs/latency_loaded_YYYY-MM-DD.txt`.

### Under LinuxCNC load

With the machine wired but drives NOT enabled, load the real
configuration and jog X/Y/Z in HAL simulation continuously for
**≥ 2 hours** while monitoring:

```bash
halcmd show pin hm2_7i80.0.packet-error
halcmd show pin hm2_7i80.0.packet-error-level
halcmd show pin hm2_7i80.0.packet-error-exceeded
halcmd show pin hm2_7i80.0.watchdog.has_bit
halcmd show pin hm2_7i80.0.io-error
```

Log with `halsampler` for the packet-error-level pin at 1 Hz. Any
non-zero `packet-error-level` observation, or any single
`packet-error` TRUE event, is a **fault to investigate**, not an
acceptable rate.

### Cable-yank test

With LinuxCNC running and jogging, physically disconnect the
Ethernet cable to the 7i80HDT. Confirm:
- `packet-error` goes TRUE within 1-2 cycles.
- `packet-error-level` climbs to `packet-error-limit`.
- `packet-error-exceeded` latches TRUE.
- `hm2_7i80.0.watchdog.has_bit` latches TRUE within the watchdog
  period.
- **All motion inhibits fire** — see wiring section below.

Reconnect the cable. The condition must **NOT auto-clear**; a
manual `halcmd setp hm2_7i80.0.packet-error-level 0` and
watchdog reset must be required before motion resumes.

## Wiring into the E-stop / motion-inhibit chain

Per [`estop_safety_chain.md`](estop_safety_chain.md), the software
motion-permit chain includes the HostMot2 watchdog. Add the hm2_eth
packet-error latch to that chain as follows in
`linuxcnc/mazak_vqc_20_40.hal` (or in a new
`linuxcnc/hm2_eth_healthcheck.hal` sourced from the main HAL):

```hal
# hm2_eth health check
# Any packet-error-exceeded latch or watchdog trip drops all motion
# permits and prevents drive enable.
net hm2_eth_bad     hm2_7i80.0.packet-error-exceeded  =>  or2.hm2fault.in0
net hm2_eth_wdog    hm2_7i80.0.watchdog.has_bit       =>  or2.hm2fault.in1
net hm2_eth_fault   or2.hm2fault.out                  =>  and2.motion-permit.in-not

# and2.motion-permit.out already feeds axis-enable per estop_safety_chain.md.
```

Verified pin availability from the [hm2_eth(9) manpage](https://linuxcnc.org/docs/2.9/html/man/man9/hm2_eth.9.html)
and the existing `estop_safety_chain.md`.

The hardware safety chain is unchanged by this addition. This is a
software motion-inhibit only; a hardware E-stop or contactor drop is
still the authority for de-energizing motion.

## packet-error-limit and packet-read-timeout tuning

The manpage documents the following parameters. Set as follows and
document actual values in the log:

- `hm2_7i80.0.packet-error-limit = 200` (default is manpage-defined,
  but explicitly setting it means the config is portable).
- `hm2_7i80.0.packet-error-decrement = 1`
- `hm2_7i80.0.packet-error-increment = 10`
- `hm2_7i80.0.packet-read-timeout = 0` (interpreted as 80 % of
  thread period, per manpage).

Rationale: a rare single-packet glitch (increment=10) will decrement
back to 0 in ~10 clean cycles. A sustained pattern of glitches (say
5 % of cycles) reaches limit=200 in ~4 seconds. That is well below
any interesting cut time and gives ample early warning.

## Deferred / TBD

- Actual NIC part number is **not yet installed** as of this doc;
  the pinning steps above are executed during commissioning.
- IRQ affinity script (`/usr/local/sbin/set-lcnc-irq.sh`) is drafted
  above but not yet checked into the repo — it belongs in the
  commissioning phase because the IRQ number is host-specific and
  determined at first boot.

## What has changed in the repo (this commit)

- New `docs/hm2_eth_nic_validation.md` (this document).
- `docs/project_status.md` — TODO added for the multi-hour latency
  test and the packet-error-into-motion-permit HAL wiring.
- `linuxcnc/README.md` — commissioning step 1 now points at this
  document for the NIC configuration and validation sequence.

## Sources (all URLs cited inline above)

- [Mesa hm2_eth(9) manpage — LinuxCNC 2.9 documentation](https://linuxcnc.org/docs/2.9/html/man/man9/hm2_eth.9.html)
- [LinuxCNC "Getting LinuxCNC" install guide (2.9)](https://linuxcnc.org/docs/2.9/html/getting-started/getting-linuxcnc.html)
- [LinuxCNC 2.9.10 release notes (July 9 2026)](https://linuxcnc.org/2026/07/09/LinuxCNC-2.9.10/)
- [Mesa 7i80HDT store page](https://store.mesanet.com/index.php?product_id=386)
- Repo cross-references: `docs/estop_safety_chain.md`,
  `docs/smart_serial_latency.md`,
  `linuxcnc/mazak_vqc_20_40.hal`,
  `mesa/mesa_firmware_checklist.md`.
