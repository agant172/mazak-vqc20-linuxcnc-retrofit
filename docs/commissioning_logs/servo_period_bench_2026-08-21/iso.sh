#!/bin/bash
run() {
  local label="$1"; local cfg="$2"
  cat > /tmp/iso.hal <<EOF
loadrt hostmot2
loadrt hm2_eth board_ip="192.168.1.121" config="$cfg"
loadrt threads name1=servo-thread period1=1000000
addf hm2_7i80.0.read servo-thread
addf hm2_7i80.0.write servo-thread
setp hm2_7i80.0.watchdog.timeout_ns 10000000
start
loadusr -w sleep 15
setp servo-thread.tmax 0
loadusr -w sleep 60
show thread
show pin hm2_7i80.0.packet-error-total
EOF
  echo "########## $label ##########"
  timeout 150 halrun -f /tmp/iso.hal 2>&1 | grep -E "servo-thread \(|packet-error-total"
  sleep 3
}
run "sserial ENABLED (7i84 polled)"  "num_encoders=0 num_resolvers=3 num_pwmgens=4 num_stepgens=0 sserial_port_0=0xxxxxxx"
run "sserial DISABLED (no 7i84)"     "num_encoders=0 num_resolvers=3 num_pwmgens=4 num_stepgens=0 sserial_port_0=xxxxxxxx"
run "resolvers+pwm only, no sserial" "num_encoders=0 num_resolvers=0 num_pwmgens=0 num_stepgens=0 sserial_port_0=xxxxxxxx"
