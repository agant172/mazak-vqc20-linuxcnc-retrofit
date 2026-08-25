#!/usr/bin/env bash
# switch_mesa_subnet.sh — move the host end of the Mesa link to the new subnet.
#
# Run this AFTER moving jumper W3 on the 7i80HDT to UP and power-cycling the
# board. The EEPROM address was written 2026-08-23 with:
#     mesaflash --device ETHER --addr 192.168.1.121 --set ip=10.10.10.121
#
# WHY the Mesa link is being renumbered off 192.168.1.0/24: that is also the
# workshop LAN (iMac at 192.168.1.19, gateway 192.168.1.1) and this PC held
# 192.168.1.1 on the Mesa NIC -- the gateway's own address. Two consequences,
# one loud and one silent:
#   * loud   -- patch the Mesa NIC into the shop switch by accident and this PC
#               fights the router for 192.168.1.1, taking down the shop network.
#   * silent -- the route `192.168.1.0/24 dev enp0s31f6` means every packet this
#               box sends to any shop-LAN address goes out the Mesa link into a
#               dead end. The iMac is unreachable by LAN address, today.
#
# ROLLBACK, if the board does not come up: put W3 back DOWN, power cycle, and
# re-run this script with MESA_SUBNET=192.168.1 MESA_HOST_IP=192.168.1.1
# MESA_BOARD_IP=192.168.1.121. The board cannot be bricked by this -- W3 DOWN
# means it ignores the EEPROM entirely and answers at 192.168.1.121.

set -uo pipefail

CONN="${MESA_CONN:-Mesa NIC}"
HOST_IP="${MESA_HOST_IP:-10.10.10.1/24}"
BOARD_IP="${MESA_BOARD_IP:-10.10.10.121}"

echo "Mesa link: moving '$CONN' to $HOST_IP, expecting board at $BOARD_IP"
echo

# Refuse only if something actually HOLDS the board. `pgrep linuxcnc` alone is
# too broad: /usr/bin/linuxcnc is a shell wrapper that also sits in the process
# table while the config-picker dialog is open with nothing loaded, which holds
# no hardware. What matters is a loaded hm2 module or a live realtime session.
if lsmod 2>/dev/null | grep -qE '^hm2_|^hostmot2'; then
    echo "REFUSING: an hm2 module is loaded — the board is in use. Stop LinuxCNC first." >&2
    exit 1
fi
if pgrep -x rtapi_app >/dev/null || pgrep -x milltask >/dev/null; then
    echo "REFUSING: a LinuxCNC realtime session is running. Stop it first." >&2
    exit 1
fi
if pgrep -x linuxcnc >/dev/null; then
    echo "NOTE: the LinuxCNC launcher is running (config picker open, nothing loaded)." >&2
    echo "      Do not select a config until this finishes." >&2
fi

old="$(nmcli -g ipv4.addresses connection show "$CONN" 2>/dev/null)"
echo "  current: $old"

nmcli connection modify "$CONN" ipv4.method manual ipv4.addresses "$HOST_IP" \
    ipv4.gateway "" ipv4.never-default yes || { echo "nmcli modify failed" >&2; exit 2; }
nmcli connection up "$CONN" >/dev/null || { echo "nmcli up failed" >&2; exit 3; }

echo "  now:     $(nmcli -g ipv4.addresses connection show "$CONN")"
echo
echo "Waiting for the board..."
for i in $(seq 1 20); do
    if ping -c1 -W1 "$BOARD_IP" >/dev/null 2>&1; then
        echo "  OK  board answers at $BOARD_IP"
        echo
        mesaflash --device ETHER --addr "$BOARD_IP" --readhmid 2>&1 | head -8
        echo
        echo "Remaining: update board_ip in linuxcnc/mazak_vqc_20_40.hal and the docs."
        exit 0
    fi
    sleep 1
done

echo "  FAIL board did not answer at $BOARD_IP after 20s" >&2
echo >&2
echo "  Check, in order:" >&2
echo "    1. is W3 UP on the 7i80HDT, and was the board power-cycled after moving it?" >&2
echo "    2. ip -o -4 addr show   -- did the host address actually change?" >&2
echo "    3. rollback: W3 DOWN, power cycle, re-run with" >&2
echo "       MESA_HOST_IP=192.168.1.1/24 MESA_BOARD_IP=192.168.1.121 $0" >&2
exit 4
