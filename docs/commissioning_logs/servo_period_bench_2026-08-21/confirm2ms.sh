#!/bin/bash
run() {
  cat > /tmp/c2.hal <<EOF
loadrt hostmot2
loadrt hm2_eth board_ip="192.168.1.121" config="num_encoders=0 num_resolvers=3 num_pwmgens=4 num_stepgens=0 sserial_port_0=0xxxxxxx"
loadrt threads name1=servo-thread period1=2000000
addf hm2_7i80.0.read servo-thread
addf hm2_7i80.0.write servo-thread
setp hm2_7i80.0.watchdog.timeout_ns 10000000
start
loadusr -w sleep 15
setp servo-thread.tmax 0
loadusr -w sleep 120
show thread
show pin hm2_7i80.0.packet-error-total
EOF
  echo "########## 2 ms — $1 ##########"
  timeout 200 halrun -f /tmp/c2.hal 2>&1 | grep -E "servo-thread \(|packet-error-total"
}
run "IDLE"
sleep 3
(stress-ng --cpu 1 --io 1 --timeout 140s >/dev/null 2>&1 &)
run "UNDER LOAD"
