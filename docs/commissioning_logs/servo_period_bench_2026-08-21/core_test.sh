#!/bin/bash
# Does pinning the hm2_eth servo thread to an ISOLATED core (2/3) fix the
# max-time spikes? Repeated trials, because servo-thread.tmax proved far too
# noisy to judge from a single sample.
OUT=/home/andy/mazak-bench/core_test.log

measure() {  # $1 = taskset spec or "none", $2 = period ns, $3 = label
  local CPUS=$1 P=$2 L=$3
  cat > /tmp/ct.hal <<EOF
loadrt hostmot2
loadrt hm2_eth board_ip="192.168.1.121" config="num_encoders=0 num_resolvers=3 num_pwmgens=4 num_stepgens=0 sserial_port_0=0xxxxxxx"
loadrt threads name1=servo-thread period1=$P
addf hm2_7i80.0.read servo-thread
addf hm2_7i80.0.write servo-thread
setp hm2_7i80.0.watchdog.timeout_ns 10000000
start
loadusr -w sleep 10
setp servo-thread.tmax 0
loadusr -w sleep 75
show thread
show pin hm2_7i80.0.packet-error-total
EOF
  local res
  if [ "$CPUS" = "none" ]; then
    res=$(timeout 160 halrun -f /tmp/ct.hal 2>&1)
  else
    res=$(timeout 160 taskset -c "$CPUS" halrun -f /tmp/ct.hal 2>&1)
  fi
  local line err
  line=$(echo "$res" | grep -E "servo-thread \(")
  err=$(echo "$res" | grep -E "packet-error-total" | awk '{print $4}')
  echo "${L} | ${line} | pkt-err=${err}" >> "$OUT"
  sleep 3
}

: > "$OUT"
for i in 1 2 3; do
  measure 3    1000000 "ISOLATED core3  1ms  run$i"
done
for i in 1 2 3; do
  measure 0,1  1000000 "HOUSEKEEP 0,1   1ms  run$i"
done
for i in 1 2; do
  measure 3    2000000 "ISOLATED core3  2ms  run$i"
done
echo "DONE" >> "$OUT"
