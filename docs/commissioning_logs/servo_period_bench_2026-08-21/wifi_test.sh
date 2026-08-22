#!/bin/bash
# Does the USB wifi adapter cause the hm2_eth servo-thread latency spikes?
# Self-restoring: wifi comes back via trap, AND via an independent deadman
# timer, so a dropped SSH session or a kill cannot strand the box offline.

OUT=/home/andy/mazak-bench/wifi_test.log
WIFI=wlx20e15d9e9d08

restore() {
  sudo ip link set "$WIFI" up 2>/dev/null
  sudo nmcli device connect "$WIFI" >/dev/null 2>&1
  echo "--- wifi restore attempted ---" >> "$OUT"
}
trap restore EXIT INT TERM HUP

# Deadman: independent of this script's fate. Restores wifi after 15 min
# no matter what happens, then exits.
sudo setsid bash -c "sleep 900; ip link set $WIFI up; nmcli device connect $WIFI" >/dev/null 2>&1 &

xhci_count() { grep -E "^ *121:" /proc/interrupts | awk '{s=0; for(i=2;i<=NF-2;i++) s+=$i; print s}'; }

measure() {  # $1 = period ns, $2 = label
  local P=$1 L=$2
  cat > /tmp/wt.hal <<EOF
loadrt hostmot2
loadrt hm2_eth board_ip="192.168.1.121" config="num_encoders=0 num_resolvers=3 num_pwmgens=4 num_stepgens=0 sserial_port_0=0xxxxxxx"
loadrt threads name1=servo-thread period1=$P
addf hm2_7i80.0.read servo-thread
addf hm2_7i80.0.write servo-thread
setp hm2_7i80.0.watchdog.timeout_ns 10000000
start
loadusr -w sleep 15
setp servo-thread.tmax 0
loadusr -w sleep 90
show thread
show pin hm2_7i80.0.packet-error-total
EOF
  local i0 i1
  i0=$(xhci_count)
  local res
  res=$(timeout 180 halrun -f /tmp/wt.hal 2>&1 | grep -E "servo-thread \(|packet-error-total")
  i1=$(xhci_count)
  echo "### ${L} @ $((P/1000000)) ms   [xhci irq/sec during run: $(( (i1-i0)/105 ))]" >> "$OUT"
  echo "$res" >> "$OUT"
  sleep 3
}

: > "$OUT"
echo "wifi test started" >> "$OUT"

echo "================ PHASE 1: WIFI UP (baseline) ================" >> "$OUT"
measure 1000000 "wifi UP"
measure 2000000 "wifi UP"

sudo nmcli device disconnect "$WIFI" >/dev/null 2>&1
sudo ip link set "$WIFI" down 2>/dev/null
sleep 5
echo "================ PHASE 2: WIFI DOWN ================" >> "$OUT"
echo "link state: $(ip -brief link show $WIFI 2>&1)" >> "$OUT"
measure 1000000 "wifi DOWN"
measure 2000000 "wifi DOWN"

restore
sleep 5
echo "final link state: $(ip -brief link show $WIFI 2>&1)" >> "$OUT"
echo "DONE" >> "$OUT"
