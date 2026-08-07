// GENERATED FILE - do not edit by hand.
// Regenerate with:  cd io-dashboard && python3 tools/generate_data.py
// Source of truth:  mesa/current_pin_authority.csv (repo root)
window.MAZAK_DATA = {
 "meta": {
  "machine": "Mazak VQC-20/40",
  "serial": "060231",
  "architecture": "LinuxCNC + Mesa 7i80HDT (Ethernet FPGA host) + 7i44 on P1 (sserial to 7i84U) + 7i49 on P2 (resolver + analog outs) + 7i37TA on P3 (motion-critical field breakout) + 7i84U on 7i44 port 0 (remote field I/O)",
  "generated": "2026-08-07 01:46 UTC",
  "source_repo": "mazak-vqc20-linuxcnc-retrofit",
  "authority_file": "mesa/current_pin_authority.csv",
  "halfiles": [
   "mazak_vqc_20_40.hal",
   "motion_7i80hdt.hal",
   "field_7i84u.hal",
   "atc_orient.hal"
  ],
  "board_ip": "192.168.1.121",
  "rules": [
   "mesa/current_pin_authority.csv is the wiring authority.",
   "7i49 AOUT axis order is X=AOUT0, Z=AOUT1, Y=AOUT2.",
   "Axis feedback is Tamagawa TS2014N resolver through the 7i49 on P2, not quadrature encoder.",
   "The hardware E-stop chain removes hazardous power. The 7i80HDT P3 breakout IN9 (gpio.041) is a monitor input only; 7i84U IN29 is a redundant status.",
   "Every hm2_7i80.* pin name in the HAL set is an unverified placeholder until confirmed against a firmware readhmid.",
   "7i49 AOUT order is X=AOUT0, Z=AOUT1, Y=AOUT2, FR-SX spindle velocity=AOUT3, FR-SX orient=AOUT4 (reserved).",
   "P3 field breakout (7i37TA baseline): IN0-5 = X/Y/Z limits, IN6-8 = X/Y/Z homes, IN9 = E-stop monitor, IN10 = probe SKIP1; OUT0-2 = X/Y/Z drive-enable, OUT3-7 = SSR overflow (AIR/TOUCH/TAP/ATC barrier/FLOOD), OUT8 = spare.",
   "7i84U pin plan (2026-08-03 single-7i84U I/O plan) is unchanged and reachable via `hm2_7i80.0.7i84.0.0.*` over 7i44 P1 port 0."
  ]
 },
 "boards": {
  "7i80HDT": {
   "name": "Mesa 7i80HDT",
   "role": "Ethernet FPGA host (hm2_eth)",
   "detail": "Primary control board. 3× 50-pin daughter connectors carry 72 IO: P1 = 7i44 sserial breakout, P2 = 7i49 resolvers + analog outs, P3 = 7i37TA field breakout.",
   "address": "board_ip 192.168.1.121 (host NIC enp0s31f6 at 192.168.1.1/24)"
  },
  "7i44": {
   "name": "Mesa 7i44",
   "role": "8-channel RS-422 smart-serial breakout (on 7i80HDT P1)",
   "detail": "Port 0 carries the 7i84U. Ports 1-7 spare for future MPG / 4th-axis / second 7i84.",
   "address": "sserial_port_0=00000000 on 7i80HDT P1"
  },
  "7i49": {
   "name": "Mesa 7i49",
   "role": "Resolver-to-digital interface + ±10V DACs (on 7i80HDT P2)",
   "detail": "Plain 7i49 (not HV). Reads the machine's original Tamagawa TS2014N shaft resolvers for X/Y/Z on RES0/1/2 at 5 kHz excitation. AOUT0/1/2 drive the X/Z/Y servos, AOUT3 the FR-SX spindle velocity, AOUT4 an FR-SX orient reference (reserved).",
   "address": "num_resolvers=3, num_pwmgens=4 on 7i80HDT P2"
  },
  "7i37TA": {
   "name": "Mesa 7i37TA (P3 field breakout)",
   "role": "Motion-critical direct FPGA GPIO breakout (on 7i80HDT P3)",
   "detail": "24-bit isolated field-I/O breakout: 16 isolated IN + 8 isolated OUT. Carries X/Y/Z limits (IN0-5), X/Y/Z homes (IN6-8), E-stop monitor (IN9), probe SKIP1 (IN10); X/Y/Z drive-enable (OUT0-2), and 5 relay-driven outputs (OUT3-7) plus 1 spare (OUT8). Interposing relays (RLY-5/6/7) required for 100VAC solenoid loads.",
   "address": "Direct FPGA GPIO on 7i80HDT P3 (gpio.032-055)"
  },
  "7i84U": {
   "name": "Mesa 7i84U",
   "role": "Remote smart-serial field I/O",
   "detail": "32 field inputs on TB1, 16 field outputs on TB2. Mounted near the original green breakout PCB. Two independent field power banks. Pin plan committed 2026-08-03 preserved.",
   "address": "On 7i44 port 0 (sserial_port_0=00000000)"
  },
  "none": {
   "name": "Unassigned",
   "role": "No board",
   "detail": "Review and expansion items with no hardware allocated.",
   "address": ""
  }
 },
 "statuses": {
  "PROPOSED": {
   "label": "Proposed — from element-list cross-walk",
   "tone": "reserved",
   "order": 3,
   "blurb": "Drafted from the YM2V39L element-list cross-walk (2026-07-27). Assignment is a proposal only; verify the device, ladder behavior, and FR-SX/relay terminals before accepting into the wiring plan.",
   "safe_to_energize": "Not accepted. Do not wire."
  },
  "FIELD_VERIFIED": {
   "label": "Field verified",
   "tone": "verified",
   "order": 0,
   "blurb": "Measured in the cabinet and signed off. No rows currently qualify.",
   "safe_to_energize": "Verified per repo records."
  },
  "ACCEPTED": {
   "label": "Accepted — verify continuity",
   "tone": "accepted",
   "order": 1,
   "blurb": "Assignment accepted by current_pin_authority.csv. Still ring out continuity before power.",
   "safe_to_energize": "Not measured. Verify continuity before power."
  },
  "CONFIG_ONLY": {
   "label": "In HAL only — no authority row",
   "tone": "conflict",
   "order": 5,
   "blurb": "This net exists in the HAL config but has no row in current_pin_authority.csv. Not a wiring instruction.",
   "safe_to_energize": "BLOCKED. No authority row exists for this channel."
  },
  "ACCEPTED_VERIFY": {
   "label": "Accepted — verify in cabinet",
   "tone": "accepted",
   "order": 1,
   "blurb": "Pin assignment is accepted by current_pin_authority.csv but has NOT been measured on the machine. Ring out before landing a wire.",
   "safe_to_energize": "Not verified. Do not assume the landing point is correct."
  },
  "RESERVED_VERIFY": {
   "label": "Reserved — verify",
   "tone": "reserved",
   "order": 2,
   "blurb": "Channel is held for a named future use. Hardware not identified yet.",
   "safe_to_energize": "Not verified. Do not wire."
  },
  "OPTIONAL_VERIFY": {
   "label": "Optional — verify",
   "tone": "reserved",
   "order": 3,
   "blurb": "Optional panel/utility reuse. Only wire if the original device is retained.",
   "safe_to_energize": "Not verified. Do not wire."
  },
  "COMMISSIONING_PENDING": {
   "label": "Commissioning pending",
   "tone": "pending",
   "order": 4,
   "blurb": "Planned assignment awaiting cabinet tracing, polarity confirmation, or load measurement.",
   "safe_to_energize": "NOT commissioned. Do not energize this circuit."
  },
  "HOLD_CONFLICT": {
   "label": "Conflict — hold, do not wire",
   "tone": "conflict",
   "order": 5,
   "blurb": "Sources disagree about this circuit. Blocked until the conflict register and a cabinet trace resolve it.",
   "safe_to_energize": "BLOCKED. Do not wire and do not energize."
  },
  "HOLD_NOT_ORDERED": {
   "label": "Hold — hardware not ordered",
   "tone": "conflict",
   "order": 6,
   "blurb": "Expansion item deliberately not purchased yet.",
   "safe_to_energize": "No hardware present."
  },
  "SPARE": {
   "label": "Spare — unassigned",
   "tone": "spare",
   "order": 7,
   "blurb": "Deliberately kept free. No field wiring planned.",
   "safe_to_energize": "Unassigned. Leave unlanded."
  },
  "NOT_USED": {
   "label": "Not used",
   "tone": "notused",
   "order": 8,
   "blurb": "Architecturally excluded on this machine.",
   "safe_to_energize": "Not part of the retrofit."
  }
 },
 "signals": [
  {
   "id": "X_RESOLVER",
   "name": "X Resolver",
   "board": "7i49",
   "connector": "P2 Resolver channel",
   "channel": "RES0",
   "hal_net": "x-pos-fb",
   "direction": "RESOLVER_IN",
   "direction_label": "Input (resolver)",
   "subsystem": "Motion",
   "machine_subsystem": "Axis feedback",
   "status": "COMMISSIONING_PENDING",
   "field_point": "Tamagawa TS2014N X resolver",
   "designations": [],
   "primary_source": "motion_7i80hdt.hal",
   "cleanup_notes": "Ohmmeter winding pairs and scope return before power",
   "location": "X ball screw, non-drive end — Tamagawa TS2014N shaft resolver on flex coupling",
   "location_note": "BKO-NC6062A; via BBIA-1 CNA1 \"TO RESOLVER MACHINE SIDE\"",
   "expected": {
    "value": "Dynamic",
    "label": "Dynamic position value — validity to be verified on commissioning",
    "basis": "motion_7i80hdt.hal:35-39 pre-power ohmmeter checks; 42-44 scale placeholders; current_pin_authority.csv:2 COMMISSIONING_PENDING",
    "kind": "dynamic"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.resolver.00.position"
   ],
   "producers": [],
   "consumers": [
    "joint.0.motor-pos-fb",
    "pid.x.feedback"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 80,
     "text": "net x-pos-fb        <= hm2_7i80.0.resolver.00.position",
     "commented": false,
     "producers": [
      "hm2_7i80.0.resolver.00.position"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 83,
     "text": "net x-pos-fb        => joint.0.motor-pos-fb",
     "commented": false,
     "producers": [],
     "consumers": [
      "joint.0.motor-pos-fb"
     ],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 149,
     "text": "net x-pos-fb   => pid.x.feedback",
     "commented": false,
     "producers": [],
     "consumers": [
      "pid.x.feedback"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 53,
     "text": "setp hm2_7i80.0.resolver.00.scale 1",
     "commented": false,
     "target": "hm2_7i80.0.resolver.00.scale",
     "value": "1"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 73,
     "text": "setp hm2_7i80.0.resolver.00.velocity-scale  [JOINT_0]RESOLVER_VELOCITY_SCALE",
     "commented": false,
     "target": "hm2_7i80.0.resolver.00.velocity-scale",
     "value": "[JOINT_0]RESOLVER_VELOCITY_SCALE"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 76,
     "text": "setp hm2_7i80.0.resolver.00.index-divisor   [JOINT_0]RESOLVER_INDEX_DIVISOR",
     "commented": false,
     "target": "hm2_7i80.0.resolver.00.index-divisor",
     "value": "[JOINT_0]RESOLVER_INDEX_DIVISOR"
    }
   ],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "2",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "80",
     "note": "net x-pos-fb        <= hm2_7i80.0.resolver.00.position"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "83",
     "note": "net x-pos-fb        => joint.0.motor-pos-fb"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "149",
     "note": "net x-pos-fb   => pid.x.feedback"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "53",
     "note": "setp hm2_7i80.0.resolver.00.scale 1"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "73",
     "note": "setp hm2_7i80.0.resolver.00.velocity-scale  [JOINT_0]RESOLVER_VELOCITY_SCALE"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "76",
     "note": "setp hm2_7i80.0.resolver.00.index-divisor   [JOINT_0]RESOLVER_INDEX_DIVISOR"
    },
    {
     "file": "motion_7i80hdt.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C6"
   ],
   "authority_line": 2
  },
  {
   "id": "Y_RESOLVER",
   "name": "Y Resolver",
   "board": "7i49",
   "connector": "P2 Resolver channel",
   "channel": "RES1",
   "hal_net": "y-pos-fb",
   "direction": "RESOLVER_IN",
   "direction_label": "Input (resolver)",
   "subsystem": "Motion",
   "machine_subsystem": "Axis feedback",
   "status": "COMMISSIONING_PENDING",
   "field_point": "Tamagawa TS2014N Y resolver",
   "designations": [],
   "primary_source": "motion_7i80hdt.hal",
   "cleanup_notes": "Ohmmeter winding pairs and scope return before power",
   "location": "Y ball screw, non-drive end — Tamagawa TS2014N shaft resolver on flex coupling",
   "location_note": "BKO-NC6062A; via BBIA-1 CNA1",
   "expected": {
    "value": "Dynamic",
    "label": "Dynamic position value — validity to be verified on commissioning",
    "basis": "motion_7i80hdt.hal:35-39, 43; current_pin_authority.csv:3",
    "kind": "dynamic"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.resolver.01.position"
   ],
   "producers": [],
   "consumers": [
    "joint.1.motor-pos-fb",
    "pid.y.feedback"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 87,
     "text": "net y-pos-fb        <= hm2_7i80.0.resolver.01.position",
     "commented": false,
     "producers": [
      "hm2_7i80.0.resolver.01.position"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 90,
     "text": "net y-pos-fb        => joint.1.motor-pos-fb",
     "commented": false,
     "producers": [],
     "consumers": [
      "joint.1.motor-pos-fb"
     ],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 161,
     "text": "net y-pos-fb   => pid.y.feedback",
     "commented": false,
     "producers": [],
     "consumers": [
      "pid.y.feedback"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 54,
     "text": "setp hm2_7i80.0.resolver.01.scale 1",
     "commented": false,
     "target": "hm2_7i80.0.resolver.01.scale",
     "value": "1"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 74,
     "text": "setp hm2_7i80.0.resolver.01.velocity-scale  [JOINT_1]RESOLVER_VELOCITY_SCALE",
     "commented": false,
     "target": "hm2_7i80.0.resolver.01.velocity-scale",
     "value": "[JOINT_1]RESOLVER_VELOCITY_SCALE"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 77,
     "text": "setp hm2_7i80.0.resolver.01.index-divisor   [JOINT_1]RESOLVER_INDEX_DIVISOR",
     "commented": false,
     "target": "hm2_7i80.0.resolver.01.index-divisor",
     "value": "[JOINT_1]RESOLVER_INDEX_DIVISOR"
    }
   ],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "3",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "87",
     "note": "net y-pos-fb        <= hm2_7i80.0.resolver.01.position"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "90",
     "note": "net y-pos-fb        => joint.1.motor-pos-fb"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "161",
     "note": "net y-pos-fb   => pid.y.feedback"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "54",
     "note": "setp hm2_7i80.0.resolver.01.scale 1"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "74",
     "note": "setp hm2_7i80.0.resolver.01.velocity-scale  [JOINT_1]RESOLVER_VELOCITY_SCALE"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "77",
     "note": "setp hm2_7i80.0.resolver.01.index-divisor   [JOINT_1]RESOLVER_INDEX_DIVISOR"
    },
    {
     "file": "motion_7i80hdt.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C6"
   ],
   "authority_line": 3
  },
  {
   "id": "Z_RESOLVER",
   "name": "Z Resolver",
   "board": "7i49",
   "connector": "P2 Resolver channel",
   "channel": "RES2",
   "hal_net": "z-pos-fb",
   "direction": "RESOLVER_IN",
   "direction_label": "Input (resolver)",
   "subsystem": "Motion",
   "machine_subsystem": "Axis feedback",
   "status": "COMMISSIONING_PENDING",
   "field_point": "Tamagawa TS2014N Z resolver",
   "designations": [],
   "primary_source": "motion_7i80hdt.hal",
   "cleanup_notes": "Ohmmeter winding pairs and scope return before power",
   "location": "Z ball screw, non-drive end — Tamagawa TS2014N shaft resolver on flex coupling",
   "location_note": "BKO-NC6062A; Z amp cable CA1 / BBIA-1 CN3",
   "expected": {
    "value": "Dynamic",
    "label": "Dynamic position value — validity to be verified on commissioning",
    "basis": "motion_7i80hdt.hal:35-39, 44; current_pin_authority.csv:4",
    "kind": "dynamic"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.resolver.02.position"
   ],
   "producers": [],
   "consumers": [
    "joint.2.motor-pos-fb",
    "pid.z.feedback"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 93,
     "text": "net z-pos-fb        <= hm2_7i80.0.resolver.02.position",
     "commented": false,
     "producers": [
      "hm2_7i80.0.resolver.02.position"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 96,
     "text": "net z-pos-fb        => joint.2.motor-pos-fb",
     "commented": false,
     "producers": [],
     "consumers": [
      "joint.2.motor-pos-fb"
     ],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 170,
     "text": "net z-pos-fb   => pid.z.feedback",
     "commented": false,
     "producers": [],
     "consumers": [
      "pid.z.feedback"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 55,
     "text": "setp hm2_7i80.0.resolver.02.scale 1",
     "commented": false,
     "target": "hm2_7i80.0.resolver.02.scale",
     "value": "1"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 75,
     "text": "setp hm2_7i80.0.resolver.02.velocity-scale  [JOINT_2]RESOLVER_VELOCITY_SCALE",
     "commented": false,
     "target": "hm2_7i80.0.resolver.02.velocity-scale",
     "value": "[JOINT_2]RESOLVER_VELOCITY_SCALE"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 78,
     "text": "setp hm2_7i80.0.resolver.02.index-divisor   [JOINT_2]RESOLVER_INDEX_DIVISOR",
     "commented": false,
     "target": "hm2_7i80.0.resolver.02.index-divisor",
     "value": "[JOINT_2]RESOLVER_INDEX_DIVISOR"
    }
   ],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "4",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "93",
     "note": "net z-pos-fb        <= hm2_7i80.0.resolver.02.position"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "96",
     "note": "net z-pos-fb        => joint.2.motor-pos-fb"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "170",
     "note": "net z-pos-fb   => pid.z.feedback"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "55",
     "note": "setp hm2_7i80.0.resolver.02.scale 1"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "75",
     "note": "setp hm2_7i80.0.resolver.02.velocity-scale  [JOINT_2]RESOLVER_VELOCITY_SCALE"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "78",
     "note": "setp hm2_7i80.0.resolver.02.index-divisor   [JOINT_2]RESOLVER_INDEX_DIVISOR"
    },
    {
     "file": "motion_7i80hdt.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C6"
   ],
   "authority_line": 4
  },
  {
   "id": "SPINDLE_ENCODER",
   "name": "Spindle Encoder",
   "board": "7i80HDT",
   "connector": "P3 direct GPIO",
   "channel": "gpio.NN",
   "hal_net": "spindle-pos-fb",
   "direction": "ENCODER_IN",
   "direction_label": "Input (encoder)",
   "subsystem": "Spindle",
   "machine_subsystem": "Spindle",
   "status": "RESERVED_VERIFY",
   "field_point": "Machine-side A/B/Z spindle encoder if fitted",
   "designations": [],
   "primary_source": "motion_7i80hdt.hal",
   "cleanup_notes": "Spindle uses separate encoder not 7i49 resolver channel; part# TBD",
   "location": "Unknown — trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No explicit normal-state evidence in the repo for this signal.",
    "kind": "unknown"
   },
   "hal_state": "commented",
   "mesa_pins": [
    "hm2_7i80.0.encoder.NN.position"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 108,
     "text": "# net spindle-pos-fb   <= hm2_7i80.0.encoder.NN.position",
     "commented": true,
     "producers": [
      "hm2_7i80.0.encoder.NN.position"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "5",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "108",
     "note": "commented out — # net spindle-pos-fb   <= hm2_7i80.0.encoder.NN.position"
    },
    {
     "file": "motion_7i80hdt.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 5
  },
  {
   "id": "RES3_RES5_SPARE",
   "name": "Res3 Res5 Spare",
   "board": "7i49",
   "connector": "P2 Resolver channels",
   "channel": "RES3-RES5",
   "hal_net": "",
   "direction": "RESOLVER_IN",
   "direction_label": "Input (resolver)",
   "subsystem": "Motion",
   "machine_subsystem": "Motion",
   "status": "SPARE",
   "field_point": "7i49 spare resolver channels",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Available for 4th axis or spindle resolver if ever fitted",
   "location": "Unknown — trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "0",
    "label": "0 — spare channel, no field wiring",
    "basis": "Marked SPARE in current_pin_authority.csv",
    "kind": "default-off"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "6",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 6
  },
  {
   "id": "X_DRIVE_ENABLE",
   "name": "X Drive Enable",
   "board": "7i37TA",
   "connector": "P3 GPIO / 7i37TA OUT0",
   "channel": "gpio.048.out",
   "hal_net": "x-enable",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Motion",
   "machine_subsystem": "Servo drives",
   "status": "COMMISSIONING_PENDING",
   "field_point": "X servo S-ON to MELDAS DK-427 (X-drive ENA input)",
   "designations": [],
   "primary_source": "motion_7i80hdt.hal",
   "cleanup_notes": "Direct FPGA GPIO on P3 breakout; confirm drive terminal and enable polarity",
   "location": "Servo bay — X TRA-series servo amp, S-ON terminal",
   "location_note": "X/Y amp path via CA3/CA4 (BBIA-1 CN1/CN2)",
   "expected": {
    "value": "0",
    "label": "0 / de-energized — amp-enable-out false until machine is on",
    "basis": "motion_7i80hdt.hal:256-257 net x-enable ← joint.0.amp-enable-out",
    "kind": "evidenced"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.pwmgen.00.enable",
    "hm2_7i80.0.gpio.048.out"
   ],
   "producers": [
    "joint.0.amp-enable-out"
   ],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 157,
     "text": "net x-enable   => hm2_7i80.0.pwmgen.00.enable",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.pwmgen.00.enable"
     ],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 309,
     "text": "net x-enable <= joint.0.amp-enable-out",
     "commented": false,
     "producers": [
      "joint.0.amp-enable-out"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 310,
     "text": "net x-enable => hm2_7i80.0.gpio.048.out    # P3 7i37TA OUT0 → X drive S-ON",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.gpio.048.out"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 140,
     "text": "setp hm2_7i80.0.pwmgen.00.output-type 4    # X axis  → 7i49 AOUT0",
     "commented": false,
     "target": "hm2_7i80.0.pwmgen.00.output-type",
     "value": "4"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 141,
     "text": "setp hm2_7i80.0.pwmgen.00.scale       10",
     "commented": false,
     "target": "hm2_7i80.0.pwmgen.00.scale",
     "value": "10"
    }
   ],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "7",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "157",
     "note": "net x-enable   => hm2_7i80.0.pwmgen.00.enable"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "309",
     "note": "net x-enable <= joint.0.amp-enable-out"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "310",
     "note": "net x-enable => hm2_7i80.0.gpio.048.out    # P3 7i37TA OUT0 → X drive S-ON"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "140",
     "note": "setp hm2_7i80.0.pwmgen.00.output-type 4    # X axis  → 7i49 AOUT0"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "141",
     "note": "setp hm2_7i80.0.pwmgen.00.scale       10"
    },
    {
     "file": "motion_7i80hdt.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 7
  },
  {
   "id": "X_AXIS_CMD",
   "name": "X Axis Cmd",
   "board": "7i49",
   "connector": "P2 Analog TB",
   "channel": "AOUT0",
   "hal_net": "x-vel-cmd",
   "direction": "ANALOG_OUT",
   "direction_label": "Output (analog)",
   "subsystem": "Motion",
   "machine_subsystem": "Servo drives",
   "status": "COMMISSIONING_PENDING",
   "field_point": "X servo analog velocity command to MELDAS TRA",
   "designations": [],
   "primary_source": "motion_7i80hdt.hal",
   "cleanup_notes": "7i49 pwmgen.00 driven by pid.x.output",
   "location": "Servo bay — X servo amp analog command input",
   "location_note": "Verify velocity vs torque input and polarity before enabling",
   "expected": {
    "value": "0 V",
    "label": "0 V idle — pwmgen.00 parked until enabled and commanded",
    "basis": "motion_7i80hdt.hal:114 — \"The pwmgen .enable pin MUST be true or the output stays parked at zero\"; 119-128 output-type 4, scale 10",
    "kind": "evidenced"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.pwmgen.00.value"
   ],
   "producers": [
    "pid.x.output"
   ],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 155,
     "text": "net x-vel-cmd  <= pid.x.output",
     "commented": false,
     "producers": [
      "pid.x.output"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 156,
     "text": "net x-vel-cmd  => hm2_7i80.0.pwmgen.00.value",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.pwmgen.00.value"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 140,
     "text": "setp hm2_7i80.0.pwmgen.00.output-type 4    # X axis  → 7i49 AOUT0",
     "commented": false,
     "target": "hm2_7i80.0.pwmgen.00.output-type",
     "value": "4"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 141,
     "text": "setp hm2_7i80.0.pwmgen.00.scale       10",
     "commented": false,
     "target": "hm2_7i80.0.pwmgen.00.scale",
     "value": "10"
    }
   ],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "8",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "155",
     "note": "net x-vel-cmd  <= pid.x.output"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "156",
     "note": "net x-vel-cmd  => hm2_7i80.0.pwmgen.00.value"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "140",
     "note": "setp hm2_7i80.0.pwmgen.00.output-type 4    # X axis  → 7i49 AOUT0"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "141",
     "note": "setp hm2_7i80.0.pwmgen.00.scale       10"
    },
    {
     "file": "motion_7i80hdt.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 8
  },
  {
   "id": "Z_DRIVE_ENABLE",
   "name": "Z Drive Enable",
   "board": "7i37TA",
   "connector": "P3 GPIO / 7i37TA OUT1",
   "channel": "gpio.049.out",
   "hal_net": "z-enable",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Motion",
   "machine_subsystem": "Servo drives",
   "status": "COMMISSIONING_PENDING",
   "field_point": "Z servo S-ON to MELDAS DK-427 (Z-drive ENA input)",
   "designations": [],
   "primary_source": "motion_7i80hdt.hal",
   "cleanup_notes": "Direct FPGA GPIO on P3 breakout; confirm drive terminal and enable polarity",
   "location": "Servo bay — Z TRA-series servo amp, S-ON terminal",
   "location_note": "Z amp path via CA1 (BBIA-1 CN3)",
   "expected": {
    "value": "0",
    "label": "0 / de-energized — amp-enable-out false until machine is on",
    "basis": "motion_7i80hdt.hal:262-263",
    "kind": "evidenced"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.pwmgen.01.enable",
    "hm2_7i80.0.gpio.049.out"
   ],
   "producers": [
    "joint.2.amp-enable-out"
   ],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 175,
     "text": "net z-enable   => hm2_7i80.0.pwmgen.01.enable",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.pwmgen.01.enable"
     ],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 315,
     "text": "net z-enable <= joint.2.amp-enable-out",
     "commented": false,
     "producers": [
      "joint.2.amp-enable-out"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 316,
     "text": "net z-enable => hm2_7i80.0.gpio.049.out    # P3 7i37TA OUT1 → Z drive S-ON",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.gpio.049.out"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 142,
     "text": "setp hm2_7i80.0.pwmgen.01.output-type 4    # Z axis  → 7i49 AOUT1",
     "commented": false,
     "target": "hm2_7i80.0.pwmgen.01.output-type",
     "value": "4"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 143,
     "text": "setp hm2_7i80.0.pwmgen.01.scale       10",
     "commented": false,
     "target": "hm2_7i80.0.pwmgen.01.scale",
     "value": "10"
    }
   ],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "9",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "175",
     "note": "net z-enable   => hm2_7i80.0.pwmgen.01.enable"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "315",
     "note": "net z-enable <= joint.2.amp-enable-out"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "316",
     "note": "net z-enable => hm2_7i80.0.gpio.049.out    # P3 7i37TA OUT1 → Z drive S-ON"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "142",
     "note": "setp hm2_7i80.0.pwmgen.01.output-type 4    # Z axis  → 7i49 AOUT1"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "143",
     "note": "setp hm2_7i80.0.pwmgen.01.scale       10"
    },
    {
     "file": "motion_7i80hdt.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 9
  },
  {
   "id": "Z_AXIS_CMD",
   "name": "Z Axis Cmd",
   "board": "7i49",
   "connector": "P2 Analog TB",
   "channel": "AOUT1",
   "hal_net": "z-vel-cmd",
   "direction": "ANALOG_OUT",
   "direction_label": "Output (analog)",
   "subsystem": "Motion",
   "machine_subsystem": "Servo drives",
   "status": "COMMISSIONING_PENDING",
   "field_point": "Z servo analog velocity command to MELDAS TRA",
   "designations": [],
   "primary_source": "motion_7i80hdt.hal",
   "cleanup_notes": "7i49 pwmgen.01 driven by pid.z.output",
   "location": "Servo bay — Z servo amp analog command input",
   "location_note": "Verify velocity vs torque input and polarity before enabling",
   "expected": {
    "value": "0 V",
    "label": "0 V idle — pwmgen.01 parked until enabled and commanded",
    "basis": "motion_7i80hdt.hal:114, 125-126, 157-158",
    "kind": "evidenced"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.pwmgen.01.value"
   ],
   "producers": [
    "pid.z.output"
   ],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 173,
     "text": "net z-vel-cmd  <= pid.z.output",
     "commented": false,
     "producers": [
      "pid.z.output"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 174,
     "text": "net z-vel-cmd  => hm2_7i80.0.pwmgen.01.value    # Z → pwmgen.01 (7i49 AOUT1)",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.pwmgen.01.value"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 142,
     "text": "setp hm2_7i80.0.pwmgen.01.output-type 4    # Z axis  → 7i49 AOUT1",
     "commented": false,
     "target": "hm2_7i80.0.pwmgen.01.output-type",
     "value": "4"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 143,
     "text": "setp hm2_7i80.0.pwmgen.01.scale       10",
     "commented": false,
     "target": "hm2_7i80.0.pwmgen.01.scale",
     "value": "10"
    }
   ],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "10",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "173",
     "note": "net z-vel-cmd  <= pid.z.output"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "174",
     "note": "net z-vel-cmd  => hm2_7i80.0.pwmgen.01.value    # Z → pwmgen.01 (7i49 AOUT1)"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "142",
     "note": "setp hm2_7i80.0.pwmgen.01.output-type 4    # Z axis  → 7i49 AOUT1"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "143",
     "note": "setp hm2_7i80.0.pwmgen.01.scale       10"
    },
    {
     "file": "motion_7i80hdt.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 10
  },
  {
   "id": "Y_DRIVE_ENABLE",
   "name": "Y Drive Enable",
   "board": "7i37TA",
   "connector": "P3 GPIO / 7i37TA OUT2",
   "channel": "gpio.050.out",
   "hal_net": "y-enable",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Motion",
   "machine_subsystem": "Servo drives",
   "status": "COMMISSIONING_PENDING",
   "field_point": "Y servo S-ON to MELDAS DK-427 (Y-drive ENA input)",
   "designations": [],
   "primary_source": "motion_7i80hdt.hal",
   "cleanup_notes": "Direct FPGA GPIO on P3 breakout; confirm drive terminal and enable polarity",
   "location": "Servo bay — Y TRA-series servo amp, S-ON terminal",
   "location_note": "X/Y amp path via CA3/CA4",
   "expected": {
    "value": "0",
    "label": "0 / de-energized — amp-enable-out false until machine is on",
    "basis": "motion_7i80hdt.hal:259-260",
    "kind": "evidenced"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.pwmgen.02.enable",
    "hm2_7i80.0.gpio.050.out"
   ],
   "producers": [
    "joint.1.amp-enable-out"
   ],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 166,
     "text": "net y-enable   => hm2_7i80.0.pwmgen.02.enable",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.pwmgen.02.enable"
     ],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 312,
     "text": "net y-enable <= joint.1.amp-enable-out",
     "commented": false,
     "producers": [
      "joint.1.amp-enable-out"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 313,
     "text": "net y-enable => hm2_7i80.0.gpio.050.out    # P3 7i37TA OUT2 → Y drive S-ON",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.gpio.050.out"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 144,
     "text": "setp hm2_7i80.0.pwmgen.02.output-type 4    # Y axis  → 7i49 AOUT2",
     "commented": false,
     "target": "hm2_7i80.0.pwmgen.02.output-type",
     "value": "4"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 145,
     "text": "setp hm2_7i80.0.pwmgen.02.scale       10",
     "commented": false,
     "target": "hm2_7i80.0.pwmgen.02.scale",
     "value": "10"
    }
   ],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "11",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "166",
     "note": "net y-enable   => hm2_7i80.0.pwmgen.02.enable"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "312",
     "note": "net y-enable <= joint.1.amp-enable-out"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "313",
     "note": "net y-enable => hm2_7i80.0.gpio.050.out    # P3 7i37TA OUT2 → Y drive S-ON"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "144",
     "note": "setp hm2_7i80.0.pwmgen.02.output-type 4    # Y axis  → 7i49 AOUT2"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "145",
     "note": "setp hm2_7i80.0.pwmgen.02.scale       10"
    },
    {
     "file": "motion_7i80hdt.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 11
  },
  {
   "id": "Y_AXIS_CMD",
   "name": "Y Axis Cmd",
   "board": "7i49",
   "connector": "P2 Analog TB",
   "channel": "AOUT2",
   "hal_net": "y-vel-cmd",
   "direction": "ANALOG_OUT",
   "direction_label": "Output (analog)",
   "subsystem": "Motion",
   "machine_subsystem": "Servo drives",
   "status": "COMMISSIONING_PENDING",
   "field_point": "Y servo analog velocity command to MELDAS TRA",
   "designations": [],
   "primary_source": "motion_7i80hdt.hal",
   "cleanup_notes": "7i49 pwmgen.02 driven by pid.y.output",
   "location": "Servo bay — Y servo amp analog command input",
   "location_note": "Verify velocity vs torque input and polarity before enabling",
   "expected": {
    "value": "0 V",
    "label": "0 V idle — pwmgen.02 parked until enabled and commanded",
    "basis": "motion_7i80hdt.hal:114, 127-128, 148-149",
    "kind": "evidenced"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.pwmgen.02.value"
   ],
   "producers": [
    "pid.y.output"
   ],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 164,
     "text": "net y-vel-cmd  <= pid.y.output",
     "commented": false,
     "producers": [
      "pid.y.output"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 165,
     "text": "net y-vel-cmd  => hm2_7i80.0.pwmgen.02.value    # Y → pwmgen.02 (7i49 AOUT2)",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.pwmgen.02.value"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 144,
     "text": "setp hm2_7i80.0.pwmgen.02.output-type 4    # Y axis  → 7i49 AOUT2",
     "commented": false,
     "target": "hm2_7i80.0.pwmgen.02.output-type",
     "value": "4"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 145,
     "text": "setp hm2_7i80.0.pwmgen.02.scale       10",
     "commented": false,
     "target": "hm2_7i80.0.pwmgen.02.scale",
     "value": "10"
    }
   ],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "12",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "164",
     "note": "net y-vel-cmd  <= pid.y.output"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "165",
     "note": "net y-vel-cmd  => hm2_7i80.0.pwmgen.02.value    # Y → pwmgen.02 (7i49 AOUT2)"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "144",
     "note": "setp hm2_7i80.0.pwmgen.02.output-type 4    # Y axis  → 7i49 AOUT2"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "145",
     "note": "setp hm2_7i80.0.pwmgen.02.scale       10"
    },
    {
     "file": "motion_7i80hdt.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 12
  },
  {
   "id": "SPINDLE_SPEED_CMD",
   "name": "Spindle Speed Cmd",
   "board": "7i49",
   "connector": "P2 Analog TB",
   "channel": "AOUT3",
   "hal_net": "spindle-speed-cmd",
   "direction": "ANALOG_OUT",
   "direction_label": "Output (analog)",
   "subsystem": "Spindle",
   "machine_subsystem": "Spindle drive",
   "status": "COMMISSIONING_PENDING",
   "field_point": "FR-SX V-IN speed reference",
   "designations": [],
   "primary_source": "motion_7i80hdt.hal",
   "cleanup_notes": "Confirm 0-10V unipolar vs bipolar; pwmgen.03 offset-mode",
   "location": "Spindle/servo bay — FR-SX V-IN speed reference terminal",
   "location_note": "FR-SX drawing 4143075403, PDF pg 127 of 41434WB.pdf",
   "expected": {
    "value": "0 V",
    "label": "0 V idle — unipolar reference, offset-mode 0, zero speed command",
    "basis": "motion_7i80hdt.hal:162-166 — offset-mode 0 (0 V at zero command), scale 10. 0-10 V vs bipolar still to be confirmed against the FR-SX.",
    "kind": "evidenced"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.pwmgen.03.value"
   ],
   "producers": [
    "spindle.0.speed-out"
   ],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 192,
     "text": "net spindle-speed-cmd <= spindle.0.speed-out",
     "commented": false,
     "producers": [
      "spindle.0.speed-out"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 193,
     "text": "net spindle-speed-cmd => hm2_7i80.0.pwmgen.03.value",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.pwmgen.03.value"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 181,
     "text": "setp hm2_7i80.0.pwmgen.03.output-type 1",
     "commented": false,
     "target": "hm2_7i80.0.pwmgen.03.output-type",
     "value": "1"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 182,
     "text": "setp hm2_7i80.0.pwmgen.03.offset-mode 0",
     "commented": false,
     "target": "hm2_7i80.0.pwmgen.03.offset-mode",
     "value": "0"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 183,
     "text": "setp hm2_7i80.0.pwmgen.03.scale 10",
     "commented": false,
     "target": "hm2_7i80.0.pwmgen.03.scale",
     "value": "10"
    }
   ],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "13",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "192",
     "note": "net spindle-speed-cmd <= spindle.0.speed-out"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "193",
     "note": "net spindle-speed-cmd => hm2_7i80.0.pwmgen.03.value"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "181",
     "note": "setp hm2_7i80.0.pwmgen.03.output-type 1"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "182",
     "note": "setp hm2_7i80.0.pwmgen.03.offset-mode 0"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "183",
     "note": "setp hm2_7i80.0.pwmgen.03.scale 10"
    },
    {
     "file": "motion_7i80hdt.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C3"
   ],
   "authority_line": 13
  },
  {
   "id": "SPINDLE_ORIENT_REF",
   "name": "Spindle Orient Ref",
   "board": "7i49",
   "connector": "P2 Analog TB",
   "channel": "AOUT4",
   "hal_net": "spindle-orient-ref",
   "direction": "ANALOG_OUT",
   "direction_label": "Output (analog)",
   "subsystem": "Spindle",
   "machine_subsystem": "Spindle",
   "status": "RESERVED",
   "field_point": "FR-SX orient reference (if analog)",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Reserved for FR-SX analog orient input if used; otherwise SPARE",
   "location": "Unknown — trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "0 V",
    "label": "0 V idle — analog command at rest",
    "basis": "Analog outputs park at zero until enabled and commanded.",
    "kind": "default-off"
   },
   "hal_state": "commented",
   "mesa_pins": [
    "hm2_7i80.0.pwmgen.04.value"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 200,
     "text": "# net spindle-orient-ref => hm2_7i80.0.pwmgen.04.value",
     "commented": true,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.pwmgen.04.value"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 198,
     "text": "# setp hm2_7i80.0.pwmgen.04.output-type 1",
     "commented": true,
     "target": "hm2_7i80.0.pwmgen.04.output-type",
     "value": "1"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 199,
     "text": "# setp hm2_7i80.0.pwmgen.04.scale       10",
     "commented": true,
     "target": "hm2_7i80.0.pwmgen.04.scale",
     "value": "10"
    }
   ],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "14",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "200",
     "note": "commented out — # net spindle-orient-ref => hm2_7i80.0.pwmgen.04.value"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "198",
     "note": "commented out — # setp hm2_7i80.0.pwmgen.04.output-type 1"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "199",
     "note": "commented out — # setp hm2_7i80.0.pwmgen.04.scale       10"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 14
  },
  {
   "id": "AOUT5_SPARE",
   "name": "Aout5 Spare",
   "board": "7i49",
   "connector": "P2 Analog TB",
   "channel": "AOUT5",
   "hal_net": "",
   "direction": "ANALOG_OUT",
   "direction_label": "Output (analog)",
   "subsystem": "Spare",
   "machine_subsystem": "Spare",
   "status": "SPARE",
   "field_point": "Spare 7i49 analog output",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Available for future analog use",
   "location": "Unknown — trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "0",
    "label": "0 — spare channel, no field wiring",
    "basis": "Marked SPARE in current_pin_authority.csv",
    "kind": "default-off"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "15",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 15
  },
  {
   "id": "SSERIAL_PORT0_TXA",
   "name": "Sserial Port0 Txa",
   "board": "7i44",
   "connector": "P1 sserial port 0",
   "channel": "port0.TX+",
   "hal_net": "",
   "direction": "LINK",
   "direction_label": "Link (smart-serial)",
   "subsystem": "Field I/O",
   "machine_subsystem": "Field I/O",
   "status": "ACCEPTED",
   "field_point": "7i84U RJ45 pin 2 RX+",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "7i44 P1 port 0 to 7i84U CN0; RS-422 differential pair",
   "location": "Unknown — trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "n/a",
    "label": "RS-422 smart-serial link — not a logic state",
    "basis": "current_pin_authority.csv smart-serial rows",
    "kind": "na"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "16",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 16
  },
  {
   "id": "SSERIAL_PORT0_TXB",
   "name": "Sserial Port0 Txb",
   "board": "7i44",
   "connector": "P1 sserial port 0",
   "channel": "port0.TX-",
   "hal_net": "",
   "direction": "LINK",
   "direction_label": "Link (smart-serial)",
   "subsystem": "Field I/O",
   "machine_subsystem": "Field I/O",
   "status": "ACCEPTED",
   "field_point": "7i84U RJ45 pin 1 RX-",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "RS-422 differential pair",
   "location": "Unknown — trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "n/a",
    "label": "RS-422 smart-serial link — not a logic state",
    "basis": "current_pin_authority.csv smart-serial rows",
    "kind": "na"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "17",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 17
  },
  {
   "id": "SSERIAL_PORT0_RXA",
   "name": "Sserial Port0 Rxa",
   "board": "7i44",
   "connector": "P1 sserial port 0",
   "channel": "port0.RX+",
   "hal_net": "",
   "direction": "LINK",
   "direction_label": "Link (smart-serial)",
   "subsystem": "Field I/O",
   "machine_subsystem": "Field I/O",
   "status": "ACCEPTED",
   "field_point": "7i84U RJ45 pin 6 TX+",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "RS-422 differential pair",
   "location": "Unknown — trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "n/a",
    "label": "RS-422 smart-serial link — not a logic state",
    "basis": "current_pin_authority.csv smart-serial rows",
    "kind": "na"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "18",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 18
  },
  {
   "id": "SSERIAL_PORT0_RXB",
   "name": "Sserial Port0 Rxb",
   "board": "7i44",
   "connector": "P1 sserial port 0",
   "channel": "port0.RX-",
   "hal_net": "",
   "direction": "LINK",
   "direction_label": "Link (smart-serial)",
   "subsystem": "Field I/O",
   "machine_subsystem": "Field I/O",
   "status": "ACCEPTED",
   "field_point": "7i84U RJ45 pin 3 TX-",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "RS-422 differential pair",
   "location": "Unknown — trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "n/a",
    "label": "RS-422 smart-serial link — not a logic state",
    "basis": "current_pin_authority.csv smart-serial rows",
    "kind": "na"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "19",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 19
  },
  {
   "id": "SSERIAL_PORT0_GND",
   "name": "Sserial Port0 Gnd",
   "board": "7i44",
   "connector": "P1 sserial port 0",
   "channel": "port0.GND",
   "hal_net": "",
   "direction": "LINK",
   "direction_label": "Link (smart-serial)",
   "subsystem": "Field I/O",
   "machine_subsystem": "Field I/O",
   "status": "ACCEPTED",
   "field_point": "7i84U RJ45 pin 4/5 ground",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Shield drain to 7i44 end only",
   "location": "Unknown — trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "n/a",
    "label": "RS-422 smart-serial link — not a logic state",
    "basis": "current_pin_authority.csv smart-serial rows",
    "kind": "na"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "20",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 20
  },
  {
   "id": "SSERIAL_PORT0_5V",
   "name": "Sserial Port0 5V",
   "board": "7i44",
   "connector": "P1 sserial port 0",
   "channel": "port0.+5V",
   "hal_net": "",
   "direction": "LINK",
   "direction_label": "Link (smart-serial)",
   "subsystem": "Field I/O",
   "machine_subsystem": "Field I/O",
   "status": "ACCEPTED",
   "field_point": "7i84U RJ45 pin 7/8 +5V",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Serial power for 7i84U logic",
   "location": "Unknown — trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "n/a",
    "label": "RS-422 smart-serial link — not a logic state",
    "basis": "current_pin_authority.csv smart-serial rows",
    "kind": "na"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "21",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 21
  },
  {
   "id": "SSERIAL_PORT1_SPARE",
   "name": "Sserial Port1 Spare",
   "board": "7i44",
   "connector": "P1 sserial port 1",
   "channel": "port1",
   "hal_net": "",
   "direction": "LINK",
   "direction_label": "Link (smart-serial)",
   "subsystem": "Expansion",
   "machine_subsystem": "Expansion",
   "status": "SPARE",
   "field_point": "Spare sserial port",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Available for second 7i84 / MPG / 4th-axis expansion",
   "location": "Unknown — trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "0",
    "label": "0 — spare channel, no field wiring",
    "basis": "Marked SPARE in current_pin_authority.csv",
    "kind": "default-off"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "22",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 22
  },
  {
   "id": "SSERIAL_PORTS_2_7_SPARE",
   "name": "Sserial Ports 2 7 Spare",
   "board": "7i44",
   "connector": "P1 sserial ports 2-7",
   "channel": "ports2-7",
   "hal_net": "",
   "direction": "LINK",
   "direction_label": "Link (smart-serial)",
   "subsystem": "Expansion",
   "machine_subsystem": "Expansion",
   "status": "SPARE",
   "field_point": "Spare sserial ports",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "7i44 has 8 RS-422 channels; 6 remain after 7i84U on port 0",
   "location": "Unknown — trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "0",
    "label": "0 — spare channel, no field wiring",
    "basis": "Marked SPARE in current_pin_authority.csv",
    "kind": "default-off"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "23",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 23
  },
  {
   "id": "X_LIMIT_PLUS",
   "name": "X Limit Plus",
   "board": "7i37TA",
   "connector": "P3 GPIO / 7i37TA IN0",
   "channel": "gpio.032.in",
   "hal_net": "limit-x-plus",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Axis safety",
   "machine_subsystem": "Axis overtravel",
   "status": "ACCEPTED_VERIFY",
   "field_point": "X positive overtravel limit (NC)",
   "designations": [
    "OT+X"
   ],
   "primary_source": "motion_7i80hdt.hal",
   "cleanup_notes": "Direct FPGA GPIO on P3 breakout; NC contact so invert_input=1",
   "location": "X axis way — positive overtravel switch",
   "location_note": "OT+X",
   "expected": {
    "value": "0",
    "label": "Logic 0 — switch closed (not tripped), inverted in HAL",
    "basis": "motion_7i80hdt.hal:197-204 — \"Limit switches are NC: invert_input so open (tripped) = logic 1\"; setp hm2_7i80.0.gpio.0NN.invert_input 1",
    "kind": "evidenced"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.gpio.032.in"
   ],
   "producers": [],
   "consumers": [
    "joint.0.pos-lim-sw-in"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 235,
     "text": "net limit-x-plus  <= hm2_7i80.0.gpio.032.in",
     "commented": false,
     "producers": [
      "hm2_7i80.0.gpio.032.in"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 236,
     "text": "net limit-x-plus  => joint.0.pos-lim-sw-in",
     "commented": false,
     "producers": [],
     "consumers": [
      "joint.0.pos-lim-sw-in"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 228,
     "text": "setp hm2_7i80.0.gpio.032.invert_input  1   # X_LIMIT_PLUS  (NC)",
     "commented": false,
     "target": "hm2_7i80.0.gpio.032.invert_input",
     "value": "1"
    }
   ],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "24",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "235",
     "note": "net limit-x-plus  <= hm2_7i80.0.gpio.032.in"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "236",
     "note": "net limit-x-plus  => joint.0.pos-lim-sw-in"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "228",
     "note": "setp hm2_7i80.0.gpio.032.invert_input  1   # X_LIMIT_PLUS  (NC)"
    },
    {
     "file": "motion_7i80hdt.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C6"
   ],
   "authority_line": 24
  },
  {
   "id": "X_LIMIT_MINUS",
   "name": "X Limit Minus",
   "board": "7i37TA",
   "connector": "P3 GPIO / 7i37TA IN1",
   "channel": "gpio.033.in",
   "hal_net": "limit-x-minus",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Axis safety",
   "machine_subsystem": "Axis overtravel",
   "status": "ACCEPTED_VERIFY",
   "field_point": "X negative overtravel limit (NC)",
   "designations": [
    "OT-X"
   ],
   "primary_source": "motion_7i80hdt.hal",
   "cleanup_notes": "Direct FPGA GPIO on P3 breakout; NC contact so invert_input=1",
   "location": "X axis way — negative overtravel switch",
   "location_note": "OT-X",
   "expected": {
    "value": "0",
    "label": "Logic 0 — switch closed (not tripped), inverted in HAL",
    "basis": "motion_7i80hdt.hal:197-204 — \"Limit switches are NC: invert_input so open (tripped) = logic 1\"; setp hm2_7i80.0.gpio.0NN.invert_input 1",
    "kind": "evidenced"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.gpio.033.in"
   ],
   "producers": [],
   "consumers": [
    "joint.0.neg-lim-sw-in"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 238,
     "text": "net limit-x-minus <= hm2_7i80.0.gpio.033.in",
     "commented": false,
     "producers": [
      "hm2_7i80.0.gpio.033.in"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 239,
     "text": "net limit-x-minus => joint.0.neg-lim-sw-in",
     "commented": false,
     "producers": [],
     "consumers": [
      "joint.0.neg-lim-sw-in"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 229,
     "text": "setp hm2_7i80.0.gpio.033.invert_input  1   # X_LIMIT_MINUS (NC)",
     "commented": false,
     "target": "hm2_7i80.0.gpio.033.invert_input",
     "value": "1"
    }
   ],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "25",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "238",
     "note": "net limit-x-minus <= hm2_7i80.0.gpio.033.in"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "239",
     "note": "net limit-x-minus => joint.0.neg-lim-sw-in"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "229",
     "note": "setp hm2_7i80.0.gpio.033.invert_input  1   # X_LIMIT_MINUS (NC)"
    },
    {
     "file": "motion_7i80hdt.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C6"
   ],
   "authority_line": 25
  },
  {
   "id": "Y_LIMIT_PLUS",
   "name": "Y Limit Plus",
   "board": "7i37TA",
   "connector": "P3 GPIO / 7i37TA IN2",
   "channel": "gpio.034.in",
   "hal_net": "limit-y-plus",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Axis safety",
   "machine_subsystem": "Axis overtravel",
   "status": "ACCEPTED_VERIFY",
   "field_point": "Y positive overtravel limit (NC)",
   "designations": [
    "OT+Y"
   ],
   "primary_source": "motion_7i80hdt.hal",
   "cleanup_notes": "Direct FPGA GPIO on P3 breakout; NC contact so invert_input=1",
   "location": "Y axis way — positive overtravel switch",
   "location_note": "OT+Y",
   "expected": {
    "value": "0",
    "label": "Logic 0 — switch closed (not tripped), inverted in HAL",
    "basis": "motion_7i80hdt.hal:197-204 — \"Limit switches are NC: invert_input so open (tripped) = logic 1\"; setp hm2_7i80.0.gpio.0NN.invert_input 1",
    "kind": "evidenced"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.gpio.034.in"
   ],
   "producers": [],
   "consumers": [
    "joint.1.pos-lim-sw-in"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 241,
     "text": "net limit-y-plus  <= hm2_7i80.0.gpio.034.in",
     "commented": false,
     "producers": [
      "hm2_7i80.0.gpio.034.in"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 242,
     "text": "net limit-y-plus  => joint.1.pos-lim-sw-in",
     "commented": false,
     "producers": [],
     "consumers": [
      "joint.1.pos-lim-sw-in"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 230,
     "text": "setp hm2_7i80.0.gpio.034.invert_input  1   # Y_LIMIT_PLUS  (NC)",
     "commented": false,
     "target": "hm2_7i80.0.gpio.034.invert_input",
     "value": "1"
    }
   ],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "26",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "241",
     "note": "net limit-y-plus  <= hm2_7i80.0.gpio.034.in"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "242",
     "note": "net limit-y-plus  => joint.1.pos-lim-sw-in"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "230",
     "note": "setp hm2_7i80.0.gpio.034.invert_input  1   # Y_LIMIT_PLUS  (NC)"
    },
    {
     "file": "motion_7i80hdt.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C6"
   ],
   "authority_line": 26
  },
  {
   "id": "Y_LIMIT_MINUS",
   "name": "Y Limit Minus",
   "board": "7i37TA",
   "connector": "P3 GPIO / 7i37TA IN3",
   "channel": "gpio.035.in",
   "hal_net": "limit-y-minus",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Axis safety",
   "machine_subsystem": "Axis overtravel",
   "status": "ACCEPTED_VERIFY",
   "field_point": "Y negative overtravel limit (NC)",
   "designations": [
    "OT-Y"
   ],
   "primary_source": "motion_7i80hdt.hal",
   "cleanup_notes": "Direct FPGA GPIO on P3 breakout; NC contact so invert_input=1",
   "location": "Y axis way — negative overtravel switch",
   "location_note": "OT-Y",
   "expected": {
    "value": "0",
    "label": "Logic 0 — switch closed (not tripped), inverted in HAL",
    "basis": "motion_7i80hdt.hal:197-204 — \"Limit switches are NC: invert_input so open (tripped) = logic 1\"; setp hm2_7i80.0.gpio.0NN.invert_input 1",
    "kind": "evidenced"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.gpio.035.in"
   ],
   "producers": [],
   "consumers": [
    "joint.1.neg-lim-sw-in"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 244,
     "text": "net limit-y-minus <= hm2_7i80.0.gpio.035.in",
     "commented": false,
     "producers": [
      "hm2_7i80.0.gpio.035.in"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 245,
     "text": "net limit-y-minus => joint.1.neg-lim-sw-in",
     "commented": false,
     "producers": [],
     "consumers": [
      "joint.1.neg-lim-sw-in"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 231,
     "text": "setp hm2_7i80.0.gpio.035.invert_input  1   # Y_LIMIT_MINUS (NC)",
     "commented": false,
     "target": "hm2_7i80.0.gpio.035.invert_input",
     "value": "1"
    }
   ],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "27",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "244",
     "note": "net limit-y-minus <= hm2_7i80.0.gpio.035.in"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "245",
     "note": "net limit-y-minus => joint.1.neg-lim-sw-in"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "231",
     "note": "setp hm2_7i80.0.gpio.035.invert_input  1   # Y_LIMIT_MINUS (NC)"
    },
    {
     "file": "motion_7i80hdt.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C6"
   ],
   "authority_line": 27
  },
  {
   "id": "Z_LIMIT_PLUS",
   "name": "Z Limit Plus",
   "board": "7i37TA",
   "connector": "P3 GPIO / 7i37TA IN4",
   "channel": "gpio.036.in",
   "hal_net": "limit-z-plus",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Axis safety",
   "machine_subsystem": "Axis overtravel",
   "status": "ACCEPTED_VERIFY",
   "field_point": "Z positive overtravel limit (NC)",
   "designations": [
    "OT+Z"
   ],
   "primary_source": "motion_7i80hdt.hal",
   "cleanup_notes": "Direct FPGA GPIO on P3 breakout; NC contact so invert_input=1",
   "location": "Z axis way — positive overtravel switch",
   "location_note": "OT+Z",
   "expected": {
    "value": "0",
    "label": "Logic 0 — switch closed (not tripped), inverted in HAL",
    "basis": "motion_7i80hdt.hal:197-204 — \"Limit switches are NC: invert_input so open (tripped) = logic 1\"; setp hm2_7i80.0.gpio.0NN.invert_input 1",
    "kind": "evidenced"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.gpio.036.in"
   ],
   "producers": [],
   "consumers": [
    "joint.2.pos-lim-sw-in"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 247,
     "text": "net limit-z-plus  <= hm2_7i80.0.gpio.036.in",
     "commented": false,
     "producers": [
      "hm2_7i80.0.gpio.036.in"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 248,
     "text": "net limit-z-plus  => joint.2.pos-lim-sw-in",
     "commented": false,
     "producers": [],
     "consumers": [
      "joint.2.pos-lim-sw-in"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 232,
     "text": "setp hm2_7i80.0.gpio.036.invert_input  1   # Z_LIMIT_PLUS  (NC)",
     "commented": false,
     "target": "hm2_7i80.0.gpio.036.invert_input",
     "value": "1"
    }
   ],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "28",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "247",
     "note": "net limit-z-plus  <= hm2_7i80.0.gpio.036.in"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "248",
     "note": "net limit-z-plus  => joint.2.pos-lim-sw-in"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "232",
     "note": "setp hm2_7i80.0.gpio.036.invert_input  1   # Z_LIMIT_PLUS  (NC)"
    },
    {
     "file": "motion_7i80hdt.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C6"
   ],
   "authority_line": 28
  },
  {
   "id": "Z_LIMIT_MINUS",
   "name": "Z Limit Minus",
   "board": "7i37TA",
   "connector": "P3 GPIO / 7i37TA IN5",
   "channel": "gpio.037.in",
   "hal_net": "limit-z-minus",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Axis safety",
   "machine_subsystem": "Axis overtravel",
   "status": "ACCEPTED_VERIFY",
   "field_point": "Z negative overtravel limit (NC)",
   "designations": [
    "OT-Z"
   ],
   "primary_source": "motion_7i80hdt.hal",
   "cleanup_notes": "Direct FPGA GPIO on P3 breakout; NC contact so invert_input=1",
   "location": "Z axis way — negative overtravel switch",
   "location_note": "OT-Z",
   "expected": {
    "value": "0",
    "label": "Logic 0 — switch closed (not tripped), inverted in HAL",
    "basis": "motion_7i80hdt.hal:197-204 — \"Limit switches are NC: invert_input so open (tripped) = logic 1\"; setp hm2_7i80.0.gpio.0NN.invert_input 1",
    "kind": "evidenced"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.gpio.037.in"
   ],
   "producers": [],
   "consumers": [
    "joint.2.neg-lim-sw-in"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 250,
     "text": "net limit-z-minus <= hm2_7i80.0.gpio.037.in",
     "commented": false,
     "producers": [
      "hm2_7i80.0.gpio.037.in"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 251,
     "text": "net limit-z-minus => joint.2.neg-lim-sw-in",
     "commented": false,
     "producers": [],
     "consumers": [
      "joint.2.neg-lim-sw-in"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 233,
     "text": "setp hm2_7i80.0.gpio.037.invert_input  1   # Z_LIMIT_MINUS (NC)",
     "commented": false,
     "target": "hm2_7i80.0.gpio.037.invert_input",
     "value": "1"
    }
   ],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "29",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "250",
     "note": "net limit-z-minus <= hm2_7i80.0.gpio.037.in"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "251",
     "note": "net limit-z-minus => joint.2.neg-lim-sw-in"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "233",
     "note": "setp hm2_7i80.0.gpio.037.invert_input  1   # Z_LIMIT_MINUS (NC)"
    },
    {
     "file": "motion_7i80hdt.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C6"
   ],
   "authority_line": 29
  },
  {
   "id": "X_HOME",
   "name": "X Home",
   "board": "7i37TA",
   "connector": "P3 GPIO / 7i37TA IN6",
   "channel": "gpio.038.in",
   "hal_net": "home-x",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Axis safety",
   "machine_subsystem": "Axis homing",
   "status": "ACCEPTED_VERIFY",
   "field_point": "X home switch (LS-42 assumed)",
   "designations": [
    "LS-42"
   ],
   "primary_source": "motion_7i80hdt.hal",
   "cleanup_notes": "Direct FPGA GPIO on P3 breakout; NO contact",
   "location": "X axis — zero-return switch",
   "location_note": "LS-42 (axis 1 zero return; which axis still to be cross-referenced)",
   "expected": {
    "value": "0",
    "label": "Logic 0 — NO switch, carriage off the home target",
    "basis": "motion_7i80hdt.hal:198 — \"Home switches are NO: no invert needed\"; no invert_input setp for gpio.014-016",
    "kind": "evidenced"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.gpio.038.in"
   ],
   "producers": [],
   "consumers": [
    "joint.0.home-sw-in"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 253,
     "text": "net home-x <= hm2_7i80.0.gpio.038.in",
     "commented": false,
     "producers": [
      "hm2_7i80.0.gpio.038.in"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 254,
     "text": "net home-x => joint.0.home-sw-in",
     "commented": false,
     "producers": [],
     "consumers": [
      "joint.0.home-sw-in"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "30",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "253",
     "note": "net home-x <= hm2_7i80.0.gpio.038.in"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "254",
     "note": "net home-x => joint.0.home-sw-in"
    },
    {
     "file": "motion_7i80hdt.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C6"
   ],
   "authority_line": 30
  },
  {
   "id": "Y_HOME",
   "name": "Y Home",
   "board": "7i37TA",
   "connector": "P3 GPIO / 7i37TA IN7",
   "channel": "gpio.039.in",
   "hal_net": "home-y",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Axis safety",
   "machine_subsystem": "Axis homing",
   "status": "ACCEPTED_VERIFY",
   "field_point": "Y home switch (LS-52 assumed)",
   "designations": [
    "LS-52"
   ],
   "primary_source": "motion_7i80hdt.hal",
   "cleanup_notes": "Direct FPGA GPIO on P3 breakout; NO contact",
   "location": "Y axis — zero-return switch",
   "location_note": "LS-52 (axis 2 zero return; which axis still to be cross-referenced)",
   "expected": {
    "value": "0",
    "label": "Logic 0 — NO switch, carriage off the home target",
    "basis": "motion_7i80hdt.hal:198 — \"Home switches are NO: no invert needed\"; no invert_input setp for gpio.014-016",
    "kind": "evidenced"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.gpio.039.in"
   ],
   "producers": [],
   "consumers": [
    "joint.1.home-sw-in"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 256,
     "text": "net home-y <= hm2_7i80.0.gpio.039.in",
     "commented": false,
     "producers": [
      "hm2_7i80.0.gpio.039.in"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 257,
     "text": "net home-y => joint.1.home-sw-in",
     "commented": false,
     "producers": [],
     "consumers": [
      "joint.1.home-sw-in"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "31",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "256",
     "note": "net home-y <= hm2_7i80.0.gpio.039.in"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "257",
     "note": "net home-y => joint.1.home-sw-in"
    },
    {
     "file": "motion_7i80hdt.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C6"
   ],
   "authority_line": 31
  },
  {
   "id": "Z_HOME",
   "name": "Z Home",
   "board": "7i37TA",
   "connector": "P3 GPIO / 7i37TA IN8",
   "channel": "gpio.040.in",
   "hal_net": "home-z",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Axis safety",
   "machine_subsystem": "Axis homing",
   "status": "ACCEPTED_VERIFY",
   "field_point": "Z home switch (LS-62 confirmed TB-51)",
   "designations": [
    "LS-62",
    "TB-51"
   ],
   "primary_source": "motion_7i80hdt.hal",
   "cleanup_notes": "Direct FPGA GPIO on P3 breakout; NO contact",
   "location": "Z axis — zero-return switch",
   "location_note": "LS-62 — confirmed as Z zero return on the TB-51 diagram (pg 100)",
   "expected": {
    "value": "0",
    "label": "Logic 0 — NO switch, carriage off the home target",
    "basis": "motion_7i80hdt.hal:198 — \"Home switches are NO: no invert needed\"; no invert_input setp for gpio.014-016",
    "kind": "evidenced"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.gpio.040.in"
   ],
   "producers": [],
   "consumers": [
    "joint.2.home-sw-in"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 259,
     "text": "net home-z <= hm2_7i80.0.gpio.040.in",
     "commented": false,
     "producers": [
      "hm2_7i80.0.gpio.040.in"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 260,
     "text": "net home-z => joint.2.home-sw-in",
     "commented": false,
     "producers": [],
     "consumers": [
      "joint.2.home-sw-in"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "32",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "259",
     "note": "net home-z <= hm2_7i80.0.gpio.040.in"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "260",
     "note": "net home-z => joint.2.home-sw-in"
    },
    {
     "file": "motion_7i80hdt.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C6"
   ],
   "authority_line": 32
  },
  {
   "id": "ESTOP_CHAIN",
   "name": "Estop Chain",
   "board": "7i37TA",
   "connector": "P3 GPIO / 7i37TA IN9",
   "channel": "gpio.041.in",
   "hal_net": "estop-ext",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Safety",
   "machine_subsystem": "Safety chain",
   "status": "ACCEPTED_VERIFY",
   "field_point": "External E-stop chain monitor (MAR-MON contact via interposing relay)",
   "designations": [
    "DS-1",
    "DS-2"
   ],
   "primary_source": "motion_7i80hdt.hal",
   "cleanup_notes": "Direct FPGA GPIO on P3 breakout; OEM safety chain remains authoritative. NC contact invert_input=1.",
   "location": "Hardwired E-stop relay chain — status contact only",
   "location_note": "Operating Panel A & B E-stop pushbuttons (AH25-P182A); DS-1/DS-2 door relay sits ahead of the main contactor",
   "expected": {
    "value": "0",
    "label": "Logic 0 — safety chain closed / healthy, after inversion",
    "basis": "motion_7i80hdt.hal:239-245 — \"invert_input=1: chain closed (24V, normal) → in=0; chain open (fault) → in=1\"; net estop-ext → estop-latch.0.fault-in",
    "kind": "evidenced"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.gpio.041.in"
   ],
   "producers": [],
   "consumers": [
    "estop-latch.0.fault-in"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 277,
     "text": "net estop-ext    hm2_7i80.0.gpio.041.in           =>  estop-latch.0.fault-in",
     "commented": false,
     "producers": [
      "hm2_7i80.0.gpio.041.in"
     ],
     "consumers": [
      "estop-latch.0.fault-in"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 274,
     "text": "setp hm2_7i80.0.gpio.041.invert_input    1",
     "commented": false,
     "target": "hm2_7i80.0.gpio.041.invert_input",
     "value": "1"
    }
   ],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "33",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "277",
     "note": "net estop-ext    hm2_7i80.0.gpio.041.in           =>  estop-latch.0.fault-in"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "274",
     "note": "setp hm2_7i80.0.gpio.041.invert_input    1"
    },
    {
     "file": "motion_7i80hdt.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C6"
   ],
   "authority_line": 33
  },
  {
   "id": "PROBE_SKIP1",
   "name": "Probe Skip1",
   "board": "7i37TA",
   "connector": "P3 GPIO / 7i37TA IN10",
   "channel": "gpio.042.in",
   "hal_net": "probe-in",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Motion",
   "machine_subsystem": "Motion",
   "status": "ACCEPTED_VERIFY",
   "field_point": "Renishaw MP-3 probe SKIP1 (PLC X03F SKIP1.M)",
   "designations": [],
   "primary_source": "motion_7i80hdt.hal",
   "cleanup_notes": "Direct FPGA GPIO on P3 breakout for lowest latency; Renishaw MP-3 fitted per parts list pp.273-274",
   "location": "Unknown — trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No explicit normal-state evidence in the repo for this signal.",
    "kind": "unknown"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.gpio.042.in"
   ],
   "producers": [],
   "consumers": [
    "motion.probe-input"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 290,
     "text": "net probe-in <= hm2_7i80.0.gpio.042.in",
     "commented": false,
     "producers": [
      "hm2_7i80.0.gpio.042.in"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 291,
     "text": "net probe-in => motion.probe-input",
     "commented": false,
     "producers": [],
     "consumers": [
      "motion.probe-input"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 289,
     "text": "setp hm2_7i80.0.gpio.042.invert_input    1",
     "commented": false,
     "target": "hm2_7i80.0.gpio.042.invert_input",
     "value": "1"
    }
   ],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "34",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "290",
     "note": "net probe-in <= hm2_7i80.0.gpio.042.in"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "291",
     "note": "net probe-in => motion.probe-input"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "289",
     "note": "setp hm2_7i80.0.gpio.042.invert_input    1"
    },
    {
     "file": "motion_7i80hdt.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 34
  },
  {
   "id": "P3_FIELD_GND",
   "name": "P3 Field Gnd",
   "board": "7i80HDT",
   "connector": "P3 breakout TB",
   "channel": "GND",
   "hal_net": "",
   "direction": "POWER",
   "direction_label": "Power / common",
   "subsystem": "Power",
   "machine_subsystem": "Power",
   "status": "COMMISSIONING_PENDING",
   "field_point": "24V field common on P3 breakout",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Confirm field common and fusing on 7i37TA (or chosen breakout)",
   "location": "Unknown — trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "n/a",
    "label": "Power / common — not a logic state",
    "basis": "current_pin_authority.csv",
    "kind": "na"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "35",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 35
  },
  {
   "id": "P3_FIELD_24V",
   "name": "P3 Field 24V",
   "board": "7i80HDT",
   "connector": "P3 breakout TB",
   "channel": "+VFIELD",
   "hal_net": "",
   "direction": "POWER",
   "direction_label": "Power / common",
   "subsystem": "Power",
   "machine_subsystem": "Power",
   "status": "COMMISSIONING_PENDING",
   "field_point": "24V field supply on P3 breakout",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "From Meanwell DR-240-24 retrofit bus",
   "location": "Unknown — trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "n/a",
    "label": "Power / common — not a logic state",
    "basis": "current_pin_authority.csv",
    "kind": "na"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "36",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 36
  },
  {
   "id": "AIR_BLAST",
   "name": "Air Blast",
   "board": "7i37TA",
   "connector": "P3 GPIO / 7i37TA OUT3",
   "channel": "gpio.051.out",
   "hal_net": "air-blast",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Air",
   "machine_subsystem": "Pneumatics",
   "status": "COMMISSIONING_PENDING",
   "field_point": "SOL-62 via RLY-5 (interposing relay for 100VAC coil)",
   "designations": [
    "SOL-62",
    "RLY-5"
   ],
   "primary_source": "motion_7i80hdt.hal",
   "cleanup_notes": "P3 breakout relay output",
   "location": "Solenoid valve bank — SOL-62 via relay RLY-5",
   "location_note": "100 VAC coil — relay required",
   "expected": {
    "value": "0",
    "label": "0 / de-energized — output idle unless commanded",
    "basis": "No commanding logic in the active HAL for this net; outputs default off.",
    "kind": "default-off"
   },
   "hal_state": "commented",
   "mesa_pins": [
    "hm2_7i80.0.gpio.051.out"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 324,
     "text": "# net air-blast          => hm2_7i80.0.gpio.051.out    # OUT3",
     "commented": true,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.gpio.051.out"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "37",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "324",
     "note": "commented out — # net air-blast          => hm2_7i80.0.gpio.051.out    # OUT3"
    },
    {
     "file": "motion_7i80hdt.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C6"
   ],
   "authority_line": 37
  },
  {
   "id": "TOUCH_SENSOR_BLAST",
   "name": "Touch Sensor Blast",
   "board": "7i37TA",
   "connector": "P3 GPIO / 7i37TA OUT4",
   "channel": "gpio.052.out",
   "hal_net": "touch-sensor-blast",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Air",
   "machine_subsystem": "Pneumatics",
   "status": "COMMISSIONING_PENDING",
   "field_point": "SOL-35 via RLY-6 (interposing relay for 100VAC coil)",
   "designations": [
    "SOL-35",
    "RLY-6",
    "TB-51"
   ],
   "primary_source": "motion_7i80hdt.hal",
   "cleanup_notes": "P3 breakout relay output",
   "location": "Solenoid valve bank — SOL-35 via relay RLY-6",
   "location_note": "SOL-35 = \"Dust Inhale Eliminate\" per connector_crossref.md:52 / TB-51 diagram",
   "expected": {
    "value": "0",
    "label": "0 / de-energized — output idle unless commanded",
    "basis": "No commanding logic in the active HAL for this net; outputs default off.",
    "kind": "default-off"
   },
   "hal_state": "commented",
   "mesa_pins": [
    "hm2_7i80.0.gpio.052.out"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 325,
     "text": "# net touch-sensor-blast => hm2_7i80.0.gpio.052.out    # OUT4",
     "commented": true,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.gpio.052.out"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "38",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "325",
     "note": "commented out — # net touch-sensor-blast => hm2_7i80.0.gpio.052.out    # OUT4"
    },
    {
     "file": "motion_7i80hdt.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C6"
   ],
   "authority_line": 38
  },
  {
   "id": "TAP_COOLANT_BLAST",
   "name": "Tap Coolant Blast",
   "board": "7i37TA",
   "connector": "P3 GPIO / 7i37TA OUT5",
   "channel": "gpio.053.out",
   "hal_net": "tap-coolant-blast",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Coolant",
   "machine_subsystem": "Coolant",
   "status": "COMMISSIONING_PENDING",
   "field_point": "SOL-61 via RLY-7 (interposing relay for 100VAC coil)",
   "designations": [
    "SOL-61",
    "RLY-7",
    "TB-51"
   ],
   "primary_source": "motion_7i80hdt.hal",
   "cleanup_notes": "P3 breakout relay output",
   "location": "Solenoid valve bank — SOL-61 via relay RLY-7",
   "location_note": "SOL-61 = Air jet on the TB-51 diagram",
   "expected": {
    "value": "0",
    "label": "0 / de-energized — output idle unless commanded",
    "basis": "No commanding logic in the active HAL for this net; outputs default off.",
    "kind": "default-off"
   },
   "hal_state": "commented",
   "mesa_pins": [
    "hm2_7i80.0.gpio.053.out"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 326,
     "text": "# net tap-coolant-blast  => hm2_7i80.0.gpio.053.out    # OUT5",
     "commented": true,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.gpio.053.out"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "39",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "326",
     "note": "commented out — # net tap-coolant-blast  => hm2_7i80.0.gpio.053.out    # OUT5"
    },
    {
     "file": "motion_7i80hdt.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C6"
   ],
   "authority_line": 39
  },
  {
   "id": "ATC_BARRIER_SOL",
   "name": "Atc Barrier Sol",
   "board": "7i37TA",
   "connector": "P3 GPIO / 7i37TA OUT6",
   "channel": "gpio.054.out",
   "hal_net": "atc-barrier",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "ATC interlock",
   "machine_subsystem": "ATC interlock",
   "status": "PROPOSED",
   "field_point": "ATC barrier expand solenoid (PLC Y095 TCME.M)",
   "designations": [],
   "primary_source": "element_list_crosswalk_2026-07-27",
   "cleanup_notes": "P3 breakout relay output. Verify device exists on SN 060231",
   "location": "Unknown — trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "0",
    "label": "0 / de-energized — output idle unless commanded",
    "basis": "No commanding logic in the active HAL for this net; outputs default off.",
    "kind": "default-off"
   },
   "hal_state": "commented",
   "mesa_pins": [
    "hm2_7i80.0.gpio.054.out"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 327,
     "text": "# net atc-barrier        => hm2_7i80.0.gpio.054.out    # OUT6",
     "commented": true,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.gpio.054.out"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "40",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "327",
     "note": "commented out — # net atc-barrier        => hm2_7i80.0.gpio.054.out    # OUT6"
    },
    {
     "file": "element_list_crosswalk_2026-07-27",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 40
  },
  {
   "id": "FLOOD_VALVE",
   "name": "Flood Valve",
   "board": "7i37TA",
   "connector": "P3 GPIO / 7i37TA OUT7",
   "channel": "gpio.055.out",
   "hal_net": "flood-valve",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Coolant",
   "machine_subsystem": "Coolant",
   "status": "PROPOSED",
   "field_point": "Flood coolant valve, separate from pump motor (PLC Y011 FCL)",
   "designations": [],
   "primary_source": "element_list_crosswalk_2026-07-27",
   "cleanup_notes": "P3 breakout relay output. SOL-31 confirmed via TB-51 diagram",
   "location": "Unknown — trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "0",
    "label": "0 / de-energized — output idle unless commanded",
    "basis": "No commanding logic in the active HAL for this net; outputs default off.",
    "kind": "default-off"
   },
   "hal_state": "commented",
   "mesa_pins": [
    "hm2_7i80.0.gpio.055.out"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 328,
     "text": "# net flood-valve        => hm2_7i80.0.gpio.055.out    # OUT7",
     "commented": true,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.gpio.055.out"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "41",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "328",
     "note": "commented out — # net flood-valve        => hm2_7i80.0.gpio.055.out    # OUT7"
    },
    {
     "file": "element_list_crosswalk_2026-07-27",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 41
  },
  {
   "id": "P3_OUT8_SPARE",
   "name": "P3 Out8 Spare",
   "board": "7i80HDT",
   "connector": "P3 GPIO / 7i37TA OUT8",
   "channel": "gpio.056.out",
   "hal_net": "",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Spare",
   "machine_subsystem": "Spare",
   "status": "SPARE",
   "field_point": "Spare P3 relay output",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Reserved for SSET (Y092) or through-hole coolant (Y012) pending ladder check",
   "location": "Unknown — trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "0",
    "label": "0 — spare channel, no field wiring",
    "basis": "Marked SPARE in current_pin_authority.csv",
    "kind": "default-off"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "42",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 42
  },
  {
   "id": "SEVENI84U_FIELD_A_24V",
   "name": "Seveni84U Field A 24V",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "TB1 pin 1 + and pin 2 -",
   "hal_net": "",
   "direction": "POWER",
   "direction_label": "Power / common",
   "subsystem": "Power",
   "machine_subsystem": "Field power",
   "status": "COMMISSIONING_PENDING",
   "field_point": "Field power bank A",
   "designations": [],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Powers outputs 0-7 and inputs 0-15",
   "location": "Field I/O enclosure — near the original green breakout PCB",
   "location_note": "",
   "expected": {
    "value": "24 V",
    "label": "Field bank A supply (outputs 0-7, inputs 0-15)",
    "basis": "current_pin_authority.csv:41",
    "kind": "na"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "43",
     "note": "Current wiring authority row"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 43
  },
  {
   "id": "SEVENI84U_FIELD_B_24V",
   "name": "Seveni84U Field B 24V",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "TB1 pin 3 + and pin 4 -",
   "hal_net": "",
   "direction": "POWER",
   "direction_label": "Power / common",
   "subsystem": "Power",
   "machine_subsystem": "Field power",
   "status": "COMMISSIONING_PENDING",
   "field_point": "Field power bank B",
   "designations": [],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Powers outputs 8-15 and inputs 16-31",
   "location": "Field I/O enclosure — near the original green breakout PCB",
   "location_note": "",
   "expected": {
    "value": "24 V",
    "label": "Field bank B supply (outputs 8-15, inputs 16-31)",
    "basis": "current_pin_authority.csv:42",
    "kind": "na"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "44",
     "note": "Current wiring authority row"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 44
  },
  {
   "id": "ATC_ZONE_Y",
   "name": "Atc Zone Y",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN0",
   "hal_net": "atc-y-zone",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "ATC interlock",
   "machine_subsystem": "ATC",
   "status": "COMMISSIONING_PENDING",
   "field_point": "PRS-55 Y ATC zone",
   "designations": [
    "PRS-55"
   ],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Update field_7i84u.hal because it currently uses input-02",
   "location": "Y axis — tool-change zone prox",
   "location_note": "PRS-55. Switch may not physically exist — confirm.",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No explicit normal-state evidence in the repo for this signal.",
    "kind": "unknown"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-02"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 16,
     "text": "net atc-y-zone <= hm2_7i80.0.7i84.0.0.input-02",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-02"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "45",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "16",
     "note": "net atc-y-zone <= hm2_7i80.0.7i84.0.0.input-02"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C1"
   ],
   "authority_line": 45
  },
  {
   "id": "ATC_ZONE_Z",
   "name": "Atc Zone Z",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN1",
   "hal_net": "atc-z-zone",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "ATC interlock",
   "machine_subsystem": "ATC",
   "status": "COMMISSIONING_PENDING",
   "field_point": "PRS-66 Z ATC zone",
   "designations": [
    "PRS-66"
   ],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Update field_7i84u.hal because it currently uses input-03",
   "location": "Z axis — tool-change zone prox",
   "location_note": "PRS-66. Switch may not physically exist — confirm.",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No explicit normal-state evidence in the repo for this signal.",
    "kind": "unknown"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-03"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 17,
     "text": "net atc-z-zone <= hm2_7i80.0.7i84.0.0.input-03",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-03"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "46",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "17",
     "note": "net atc-z-zone <= hm2_7i80.0.7i84.0.0.input-03"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C1"
   ],
   "authority_line": 46
  },
  {
   "id": "MAG_TOOL_AVAILABLE",
   "name": "Mag Tool Available",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN2",
   "hal_net": "mag-tool-avail",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "ATC interlock",
   "machine_subsystem": "ATC magazine",
   "status": "COMMISSIONING_PENDING",
   "field_point": "PHS-181 magazine tool available",
   "designations": [
    "PHS-181",
    "PHS-127"
   ],
   "primary_source": "phase2_plan",
   "cleanup_notes": "Add HAL net when confirmed",
   "location": "Tool magazine — tool-available photo sensor",
   "location_note": "PHS-181. Alarm table shows PHS-127 \"magazine detector OFF\" — may be the same sensor described two ways.",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No explicit normal-state evidence in the repo for this signal.",
    "kind": "unknown"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "47",
     "note": "Current wiring authority row"
    },
    {
     "file": "phase2_plan",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 47
  },
  {
   "id": "SPINDLE_TOOL_AVAILABLE",
   "name": "Spindle Tool Available",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN3",
   "hal_net": "spindle-tool-avail",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "ATC interlock",
   "machine_subsystem": "ATC",
   "status": "COMMISSIONING_PENDING",
   "field_point": "PHS-182 spindle tool available",
   "designations": [
    "PHS-182",
    "PHS-132"
   ],
   "primary_source": "phase2_plan",
   "cleanup_notes": "Add HAL net when confirmed",
   "location": "Spindle — tool-present photo sensor",
   "location_note": "PHS-182. Alarm table shows PHS-132 \"spindle tool detector off\" — same ambiguity.",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No explicit normal-state evidence in the repo for this signal.",
    "kind": "unknown"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "48",
     "note": "Current wiring authority row"
    },
    {
     "file": "phase2_plan",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 48
  },
  {
   "id": "SPINDLE_ORIENT_ARRIVAL",
   "name": "Spindle Orient Arrival",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN4",
   "hal_net": "spindle-oriented",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Spindle",
   "machine_subsystem": "Spindle",
   "status": "PROPOSED",
   "field_point": "FR-SX orient arrival (PLC X003 ORA1)",
   "designations": [],
   "primary_source": "element_list_crosswalk_2026-07-27",
   "cleanup_notes": "ATC cannot cycle without orient; confirm FR-SX terminal and polarity",
   "location": "Unknown — trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No explicit normal-state evidence in the repo for this signal.",
    "kind": "unknown"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "49",
     "note": "Current wiring authority row"
    },
    {
     "file": "element_list_crosswalk_2026-07-27",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 49
  },
  {
   "id": "SPINDLE_ZERO_SPEED",
   "name": "Spindle Zero Speed",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN5",
   "hal_net": "spindle-zero-speed",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Spindle safety",
   "machine_subsystem": "Spindle safety",
   "status": "PROPOSED",
   "field_point": "FR-SX zero-speed output (PLC X001 SZS.M)",
   "designations": [],
   "primary_source": "element_list_crosswalk_2026-07-27",
   "cleanup_notes": "Distinct from IN13 speed-reach; gear shift interlock needs zero-speed",
   "location": "Unknown — trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No explicit normal-state evidence in the repo for this signal.",
    "kind": "unknown"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "50",
     "note": "Current wiring authority row"
    },
    {
     "file": "element_list_crosswalk_2026-07-27",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 50
  },
  {
   "id": "MAG_COVER_OPEN_CONF",
   "name": "Mag Cover Open Conf",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN6",
   "hal_net": "mag-cover-open-conf",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Magazine",
   "machine_subsystem": "Magazine",
   "status": "PROPOSED",
   "field_point": "Magazine cover open reed switch (PLC X052 MGCORS)",
   "designations": [],
   "primary_source": "element_list_crosswalk_2026-07-27",
   "cleanup_notes": "Pairs with NET_MAG_COVER_OPEN/CLOSE solenoids; locate RS on cover",
   "location": "Unknown — trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No explicit normal-state evidence in the repo for this signal.",
    "kind": "unknown"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "51",
     "note": "Current wiring authority row"
    },
    {
     "file": "element_list_crosswalk_2026-07-27",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 51
  },
  {
   "id": "MAG_COVER_CLOSE_CONF",
   "name": "Mag Cover Close Conf",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN7",
   "hal_net": "mag-cover-closed-conf",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Magazine",
   "machine_subsystem": "Magazine",
   "status": "PROPOSED",
   "field_point": "Magazine cover close reed switch (PLC X053 MGCCRS)",
   "designations": [],
   "primary_source": "element_list_crosswalk_2026-07-27",
   "cleanup_notes": "Interlock magazine rotation on cover closed",
   "location": "Unknown — trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No explicit normal-state evidence in the repo for this signal.",
    "kind": "unknown"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "52",
     "note": "Current wiring authority row"
    },
    {
     "file": "element_list_crosswalk_2026-07-27",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 52
  },
  {
   "id": "THERMAL_ALARM_CHAIN",
   "name": "Thermal Alarm Chain",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN8",
   "hal_net": "thermal-alarm",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Machine safety",
   "machine_subsystem": "Machine safety",
   "status": "PROPOSED",
   "field_point": "Motor thermal trip + main transformer overheat in series (PLC X073 THR.M + X07B ONT.M)",
   "designations": [],
   "primary_source": "element_list_crosswalk_2026-07-27 + open_issues.md §3 (2026-08-03)",
   "cleanup_notes": "Series-wired NC X073 THR.M + X07B ONT.M; alarm-only, not in E-stop chain. Reaffirmed 2026-08-03 single-7i84U plan.",
   "location": "Unknown — trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No explicit normal-state evidence in the repo for this signal.",
    "kind": "unknown"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "53",
     "note": "Current wiring authority row"
    },
    {
     "file": "element_list_crosswalk_2026-07-27 + open_issues.md §3 (2026-08-03)",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 53
  },
  {
   "id": "MANUAL_TOOL_UNCLAMP_PB",
   "name": "Manual Tool Unclamp Pb",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN9",
   "hal_net": "manual-unclamp-pb",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "ATC tool",
   "machine_subsystem": "ATC tool",
   "status": "PROPOSED",
   "field_point": "Manual tool unclamp switch at head (PLC X01A TUCFS.M)",
   "designations": [],
   "primary_source": "element_list_crosswalk_2026-07-27",
   "cleanup_notes": "Commissioning aid; pairs with MANUAL_TOOL_CLAMP_PB on IN30 (TCFS X01B reinstated 2026-08-03 after single-7i84U plan freed pins).",
   "location": "Unknown — trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No explicit normal-state evidence in the repo for this signal.",
    "kind": "unknown"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "54",
     "note": "Current wiring authority row"
    },
    {
     "file": "element_list_crosswalk_2026-07-27",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 54
  },
  {
   "id": "X_DRIVE_FAULT",
   "name": "X Drive Fault",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN10",
   "hal_net": "x-drive-fault",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Drive safety",
   "machine_subsystem": "Servo drives",
   "status": "COMMISSIONING_PENDING",
   "field_point": "X drive fault relay",
   "designations": [],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Update field_7i84u.hal because it currently uses input-12",
   "location": "Servo bay — X drive ALM relay contact",
   "location_note": "Mitsubishi HD81/HD101 ALM is open-collector active-low",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — polarity not confirmed; inversion not commissioned",
    "basis": "field_7i84u.hal:28-33 — \"confirm input polarity before enabling... set invert_input 1 on these channels once wired\"",
    "kind": "unknown-polarity"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-12"
   ],
   "producers": [],
   "consumers": [
    "joint.0.amp-fault-in"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 35,
     "text": "net x-drive-fault <= hm2_7i80.0.7i84.0.0.input-12",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-12"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 36,
     "text": "net x-drive-fault => joint.0.amp-fault-in",
     "commented": false,
     "producers": [],
     "consumers": [
      "joint.0.amp-fault-in"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "55",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "35",
     "note": "net x-drive-fault <= hm2_7i80.0.7i84.0.0.input-12"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "36",
     "note": "net x-drive-fault => joint.0.amp-fault-in"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C1"
   ],
   "authority_line": 55
  },
  {
   "id": "Y_DRIVE_FAULT",
   "name": "Y Drive Fault",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN11",
   "hal_net": "y-drive-fault",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Drive safety",
   "machine_subsystem": "Servo drives",
   "status": "COMMISSIONING_PENDING",
   "field_point": "Y drive fault relay",
   "designations": [],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Update field_7i84u.hal because it currently uses input-13",
   "location": "Servo bay — Y drive ALM relay contact",
   "location_note": "See field_7i84u.hal:28-33 polarity caution",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — polarity not confirmed; inversion not commissioned",
    "basis": "field_7i84u.hal:28-33",
    "kind": "unknown-polarity"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-13"
   ],
   "producers": [],
   "consumers": [
    "joint.1.amp-fault-in"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 37,
     "text": "net y-drive-fault <= hm2_7i80.0.7i84.0.0.input-13",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-13"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 38,
     "text": "net y-drive-fault => joint.1.amp-fault-in",
     "commented": false,
     "producers": [],
     "consumers": [
      "joint.1.amp-fault-in"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "56",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "37",
     "note": "net y-drive-fault <= hm2_7i80.0.7i84.0.0.input-13"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "38",
     "note": "net y-drive-fault => joint.1.amp-fault-in"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C1"
   ],
   "authority_line": 56
  },
  {
   "id": "Z_DRIVE_FAULT",
   "name": "Z Drive Fault",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN12",
   "hal_net": "z-drive-fault",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Drive safety",
   "machine_subsystem": "Servo drives",
   "status": "COMMISSIONING_PENDING",
   "field_point": "Z drive fault relay",
   "designations": [],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Update field_7i84u.hal because it currently uses input-14",
   "location": "Servo bay — Z drive ALM relay contact",
   "location_note": "See field_7i84u.hal:28-33 polarity caution",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — polarity not confirmed; inversion not commissioned",
    "basis": "field_7i84u.hal:28-33",
    "kind": "unknown-polarity"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-14"
   ],
   "producers": [],
   "consumers": [
    "joint.2.amp-fault-in"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 39,
     "text": "net z-drive-fault <= hm2_7i80.0.7i84.0.0.input-14",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-14"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 40,
     "text": "net z-drive-fault => joint.2.amp-fault-in",
     "commented": false,
     "producers": [],
     "consumers": [
      "joint.2.amp-fault-in"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "57",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "39",
     "note": "net z-drive-fault <= hm2_7i80.0.7i84.0.0.input-14"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "40",
     "note": "net z-drive-fault => joint.2.amp-fault-in"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C1"
   ],
   "authority_line": 57
  },
  {
   "id": "SPINDLE_AT_SPEED",
   "name": "Spindle At Speed",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN13",
   "hal_net": "spindle-at-speed",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Spindle safety",
   "machine_subsystem": "Spindle drive",
   "status": "COMMISSIONING_PENDING",
   "field_point": "FR-SX speed reach output",
   "designations": [],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Confirm VFD terminal and polarity",
   "location": "Spindle/servo bay — FR-SX speed-reach output terminal",
   "location_note": "",
   "expected": {
    "value": "Forced 1",
    "label": "HAL currently forces this net TRUE — field input not read",
    "basis": "motion_7i80hdt.hal:102-103 — \"Until encoder is wired, spindle-at-speed is forced true (open-loop, no speed verification)\": sets spindle-at-speed true. current_pin_authority.csv:56 allocates a real 7i84U IN13 for it.",
    "kind": "conflict"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 114,
     "text": "sets spindle-at-speed true",
     "commented": false,
     "target": "spindle-at-speed",
     "value": "true"
    }
   ],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "58",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "114",
     "note": "sets spindle-at-speed true"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C7"
   ],
   "authority_line": 58
  },
  {
   "id": "SPINDLE_FAULT",
   "name": "Spindle Fault",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN14",
   "hal_net": "spindle-fault",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Spindle safety",
   "machine_subsystem": "Spindle drive",
   "status": "COMMISSIONING_PENDING",
   "field_point": "FR-SX fault output",
   "designations": [],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Confirm VFD terminal and polarity",
   "location": "Spindle/servo bay — FR-SX fault output terminal",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — VFD fault terminal and polarity not confirmed",
    "basis": "current_pin_authority.csv:57 — \"Confirm VFD terminal and polarity\"",
    "kind": "unknown-polarity"
   },
   "hal_state": "commented",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-16"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 44,
     "text": "# net spindle-fault     <= hm2_7i80.0.7i84.0.0.input-16",
     "commented": true,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-16"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "59",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "44",
     "note": "commented out — # net spindle-fault     <= hm2_7i80.0.7i84.0.0.input-16"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 59
  },
  {
   "id": "TOOL_CLAMP_CONF",
   "name": "Tool Clamp Conf",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN15",
   "hal_net": "tool-clamped",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "ATC tool",
   "machine_subsystem": "ATC",
   "status": "COMMISSIONING_PENDING",
   "field_point": "PRS-9 tool clamp confirm",
   "designations": [
    "PRS-9"
   ],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Update field_7i84u.hal because it currently uses input-00",
   "location": "Spindle head — tool clamp confirm prox",
   "location_note": "PRS-9",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No explicit normal-state evidence in the repo for this signal.",
    "kind": "unknown"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-00"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 13,
     "text": "net tool-clamped <= hm2_7i80.0.7i84.0.0.input-00",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-00"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "60",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "13",
     "note": "net tool-clamped <= hm2_7i80.0.7i84.0.0.input-00"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C1",
    "C5"
   ],
   "authority_line": 60
  },
  {
   "id": "TOOL_UNCLAMP_CONF",
   "name": "Tool Unclamp Conf",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN16",
   "hal_net": "tool-unclamped",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "ATC tool",
   "machine_subsystem": "ATC",
   "status": "COMMISSIONING_PENDING",
   "field_point": "PRS-8 tool unclamp confirm",
   "designations": [
    "PRS-8"
   ],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Update field_7i84u.hal because it currently uses input-01",
   "location": "Spindle head — tool unclamp confirm prox",
   "location_note": "PRS-8 (mnemonic TUCPRS, bit X77 / LH03-1)",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No explicit normal-state evidence in the repo for this signal.",
    "kind": "unknown"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-01"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 14,
     "text": "net tool-unclamped <= hm2_7i80.0.7i84.0.0.input-01",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-01"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "61",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "14",
     "note": "net tool-unclamped <= hm2_7i80.0.7i84.0.0.input-01"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C1",
    "C5"
   ],
   "authority_line": 61
  },
  {
   "id": "GEAR_HI_CONF",
   "name": "Gear Hi Conf",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN17",
   "hal_net": "gear-hi-conf",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Spindle gear",
   "machine_subsystem": "Spindle gearbox",
   "status": "COMMISSIONING_PENDING",
   "field_point": "PRS-10 gear high confirm",
   "designations": [
    "PRS-10"
   ],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Add HAL net when confirmed",
   "location": "Spindle gearbox — high gear confirm prox",
   "location_note": "PRS-10 (mnemonic HGPRS, bit X58 / LH0B-0)",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No explicit normal-state evidence in the repo for this signal.",
    "kind": "unknown"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "62",
     "note": "Current wiring authority row"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C4"
   ],
   "authority_line": 62
  },
  {
   "id": "GEAR_LO_CONF",
   "name": "Gear Lo Conf",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN18",
   "hal_net": "gear-lo-conf",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Spindle gear",
   "machine_subsystem": "Spindle gearbox",
   "status": "COMMISSIONING_PENDING",
   "field_point": "PRS-12 gear low confirm",
   "designations": [
    "PRS-12",
    "PRS-2",
    "TB-51",
    "PRS-10"
   ],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Add HAL net when confirmed",
   "location": "Spindle gearbox — low gear confirm prox",
   "location_note": "PRS-12 per authority; alarm table says PRS-2 (LGPRS, X5F/LH0B-1); TB-51 diagram says PRS-10. Three sources disagree.",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No explicit normal-state evidence in the repo for this signal.",
    "kind": "unknown"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "63",
     "note": "Current wiring authority row"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C4"
   ],
   "authority_line": 63
  },
  {
   "id": "MAG_BCD_BIT0",
   "name": "Mag Bcd Bit0",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN19",
   "hal_net": "mag-bcd-bit0",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Magazine",
   "machine_subsystem": "ATC magazine",
   "status": "COMMISSIONING_PENDING",
   "field_point": "PRS-21 magazine BCD bit 0",
   "designations": [
    "PRS-21"
   ],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Decode with bcd2s or custom mux",
   "location": "Tool magazine — binary tool-code prox",
   "location_note": "PRS-21",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No explicit normal-state evidence in the repo for this signal.",
    "kind": "unknown"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "64",
     "note": "Current wiring authority row"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 64
  },
  {
   "id": "MAG_BCD_BIT1",
   "name": "Mag Bcd Bit1",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN20",
   "hal_net": "mag-bcd-bit1",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Magazine",
   "machine_subsystem": "ATC magazine",
   "status": "COMMISSIONING_PENDING",
   "field_point": "PRS-22 magazine BCD bit 1",
   "designations": [
    "PRS-22"
   ],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Decode with bcd2s or custom mux",
   "location": "Tool magazine — binary tool-code prox",
   "location_note": "PRS-22",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No explicit normal-state evidence in the repo for this signal.",
    "kind": "unknown"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "65",
     "note": "Current wiring authority row"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 65
  },
  {
   "id": "MAG_BCD_BIT2",
   "name": "Mag Bcd Bit2",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN21",
   "hal_net": "mag-bcd-bit2",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Magazine",
   "machine_subsystem": "ATC magazine",
   "status": "COMMISSIONING_PENDING",
   "field_point": "PRS-23 magazine BCD bit 2",
   "designations": [
    "PRS-23"
   ],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Decode with bcd2s or custom mux",
   "location": "Tool magazine — binary tool-code prox",
   "location_note": "PRS-23",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No explicit normal-state evidence in the repo for this signal.",
    "kind": "unknown"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "66",
     "note": "Current wiring authority row"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 66
  },
  {
   "id": "MAG_BCD_BIT3",
   "name": "Mag Bcd Bit3",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN22",
   "hal_net": "mag-bcd-bit3",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Magazine",
   "machine_subsystem": "ATC magazine",
   "status": "COMMISSIONING_PENDING",
   "field_point": "PRS-24 magazine BCD bit 3",
   "designations": [
    "PRS-24"
   ],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Decode with bcd2s or custom mux",
   "location": "Tool magazine — binary tool-code prox",
   "location_note": "PRS-24 (also labelled \"magazine position 8\")",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No explicit normal-state evidence in the repo for this signal.",
    "kind": "unknown"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "67",
     "note": "Current wiring authority row"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 67
  },
  {
   "id": "MAG_BCD_BIT4",
   "name": "Mag Bcd Bit4",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN23",
   "hal_net": "mag-bcd-bit4",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Magazine",
   "machine_subsystem": "ATC magazine",
   "status": "COMMISSIONING_PENDING",
   "field_point": "PRS-25 magazine BCD bit 4",
   "designations": [
    "PRS-25"
   ],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Decode with bcd2s or custom mux",
   "location": "Tool magazine — binary tool-code prox",
   "location_note": "PRS-25 (labelled \"magazine position 10\" — does not fit a clean binary weight; possible OCR misread)",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No explicit normal-state evidence in the repo for this signal.",
    "kind": "unknown"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "68",
     "note": "Current wiring authority row"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 68
  },
  {
   "id": "DOOR_INTERLOCK",
   "name": "Door Interlock",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN24",
   "hal_net": "door-interlock",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Safety",
   "machine_subsystem": "Safety chain",
   "status": "COMMISSIONING_PENDING",
   "field_point": "Door interlock switches series (LS-141 + LS-140 + PLC X01D ITMDSS.M all in one chain)",
   "designations": [
    "LS-141",
    "LS-140",
    "DS-1",
    "DS-2"
   ],
   "primary_source": "archived_wiring_map + open_issues.md §3 (2026-08-03)",
   "cleanup_notes": "Series-wired 2026-08-03: X01D ITMDSS consolidated with LS-140/141 pair. Choose door-open versus door-closed net after normal state is measured.",
   "location": "Machine door — interlock switch",
   "location_note": "LS-141 (P24-341); LS-140 (P24-340, 2PC option). DS-1/DS-2 feed a relay ahead of the main contactor.",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No explicit normal-state evidence in the repo for this signal.",
    "kind": "unknown"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "69",
     "note": "Current wiring authority row"
    },
    {
     "file": "archived_wiring_map + open_issues.md §3 (2026-08-03)",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C10"
   ],
   "authority_line": 69
  },
  {
   "id": "LUBE_OK",
   "name": "Lube Ok",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN25",
   "hal_net": "lube-ok",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Utility",
   "machine_subsystem": "Utility",
   "status": "PROPOSED",
   "field_point": "Two head-lube pressure switches (PLC X042 HLP2.M + X079 HLP.M) series-wired NC",
   "designations": [],
   "primary_source": "element_list_crosswalk_2026-07-27 + open_issues.md §3 (2026-08-03)",
   "cleanup_notes": "Series-wired 2026-08-03: both pressure switches on same reservoir per parts list. Fail-open NC. Choose lube-ok versus lube-fault net after normal state is measured.",
   "location": "Unknown — trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No explicit normal-state evidence in the repo for this signal.",
    "kind": "unknown"
   },
   "hal_state": "commented",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-25"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 48,
     "text": "# net lube-ok           <= hm2_7i80.0.7i84.0.0.input-25",
     "commented": true,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-25"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "70",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "48",
     "note": "commented out — # net lube-ok           <= hm2_7i80.0.7i84.0.0.input-25"
    },
    {
     "file": "element_list_crosswalk_2026-07-27 + open_issues.md §3 (2026-08-03)",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 70
  },
  {
   "id": "COOLANT_LEVEL",
   "name": "Coolant Level",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN26",
   "hal_net": "coolant-level",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Coolant",
   "machine_subsystem": "Coolant",
   "status": "COMMISSIONING_PENDING",
   "field_point": "Coolant level switch",
   "designations": [],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Choose low versus ok net after normal state is measured",
   "location": "Coolant tank — level switch",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No explicit normal-state evidence in the repo for this signal.",
    "kind": "unknown"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "71",
     "note": "Current wiring authority row"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 71
  },
  {
   "id": "HYD_PRESS_OK",
   "name": "Hyd Press Ok",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN27",
   "hal_net": "hydraulic-ok",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Hydraulic safety",
   "machine_subsystem": "Hydraulics",
   "status": "COMMISSIONING_PENDING",
   "field_point": "Sanwa SPS-8T-PC-20 pressure switch",
   "designations": [],
   "primary_source": "phase2_plan",
   "cleanup_notes": "This supersedes stale signal_map.csv TB5 IN16 row",
   "location": "Hydraulic power unit — Sanwa SPS-8T-PC-20 pressure switch",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No explicit normal-state evidence in the repo for this signal.",
    "kind": "unknown"
   },
   "hal_state": "commented",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-27"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 49,
     "text": "# net hydraulic-ok      <= hm2_7i80.0.7i84.0.0.input-27",
     "commented": true,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-27"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "72",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "49",
     "note": "commented out — # net hydraulic-ok      <= hm2_7i80.0.7i84.0.0.input-27"
    },
    {
     "file": "phase2_plan",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 72
  },
  {
   "id": "CYCLE_START_PB",
   "name": "Cycle Start Pb",
   "board": "none",
   "connector": "none",
   "channel": "none",
   "hal_net": "cycle-start-pb",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Panel",
   "machine_subsystem": "Operator panel",
   "status": "DEFERRED",
   "field_point": "Operator cycle start pushbutton",
   "designations": [],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Displaced 2026-07-27: IN28 reclaimed for MAG_IN_POS (mandatory ATC input). Pendant WHB04B provides cycle start; panel PB moves to second sserial card if ordered",
   "location": "Operating panel A/B — cycle start pushbutton",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No explicit normal-state evidence in the repo for this signal.",
    "kind": "unknown"
   },
   "hal_state": "commented",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-28"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 52,
     "text": "# net cycle-start-pb    <= hm2_7i80.0.7i84.0.0.input-28",
     "commented": true,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-28"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "73",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "52",
     "note": "commented out — # net cycle-start-pb    <= hm2_7i80.0.7i84.0.0.input-28"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 73
  },
  {
   "id": "MAG_IN_POS",
   "name": "Mag In Pos",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN28",
   "hal_net": "mag-in-pos",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "ATC",
   "machine_subsystem": "ATC",
   "status": "PROPOSED",
   "field_point": "Magazine index in-position prox (PLC X00D MIPRS); BCD pot number valid only while TRUE",
   "designations": [],
   "primary_source": "atc_ladder_transcription_2026-07-27",
   "cleanup_notes": "Mandatory for magazine indexing (rungs 3401/33xx). Move mag-in-pos off legacy IN4 in field_7i84u.hal (IN4 = spindle-oriented). Verify prox type/polarity",
   "location": "Unknown — trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No explicit normal-state evidence in the repo for this signal.",
    "kind": "unknown"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-04"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 19,
     "text": "net mag-in-pos <= hm2_7i80.0.7i84.0.0.input-04",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-04"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "74",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "19",
     "note": "net mag-in-pos <= hm2_7i80.0.7i84.0.0.input-04"
    },
    {
     "file": "atc_ladder_transcription_2026-07-27",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 74
  },
  {
   "id": "ESTOP_MONITOR",
   "name": "Estop Monitor",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN29",
   "hal_net": "estop-monitor",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Machine safety",
   "machine_subsystem": "Machine safety",
   "status": "PROPOSED",
   "field_point": "OEM MAR relay aux contact via interposing relay (Omron G2R-1-SND-DC24 or Phoenix PLC-RSC-24DC/21) driven from EHB bus",
   "designations": [
    "RS-C"
   ],
   "primary_source": "front_control_panel_wiring.md §6.5 + open_issues.md §3 (2026-08-03)",
   "cleanup_notes": "Note: primary ESTOP_CHAIN monitor is now on P3 GPIO IN9 (host-side low-latency). This 7i84U row is a REDUNDANT status input; keep or drop pending 7i84U pin pressure. OEM/new-side boundary: dry contact only, no OEM P24 into 7i84U common.",
   "location": "Unknown — trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No explicit normal-state evidence in the repo for this signal.",
    "kind": "unknown"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "75",
     "note": "Current wiring authority row"
    },
    {
     "file": "front_control_panel_wiring.md §6.5 + open_issues.md §3 (2026-08-03)",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 75
  },
  {
   "id": "MANUAL_TOOL_CLAMP_PB",
   "name": "Manual Tool Clamp Pb",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN30",
   "hal_net": "manual-clamp-pb",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "ATC tool",
   "machine_subsystem": "ATC tool",
   "status": "PROPOSED",
   "field_point": "Manual tool clamp switch at head (PLC X01B TCFS.M)",
   "designations": [],
   "primary_source": "element_list_crosswalk_2026-07-27 + open_issues.md §3 (2026-08-03)",
   "cleanup_notes": "Reinstated 2026-08-03 after single-7i84U plan freed pins from Y091/Y023-Y025/X078/X02F drops. Pairs with MANUAL_TOOL_UNCLAMP_PB on IN9.",
   "location": "Unknown — trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No explicit normal-state evidence in the repo for this signal.",
    "kind": "unknown"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "76",
     "note": "Current wiring authority row"
    },
    {
     "file": "element_list_crosswalk_2026-07-27 + open_issues.md §3 (2026-08-03)",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 76
  },
  {
   "id": "SERVO_READY",
   "name": "Servo Ready",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN31",
   "hal_net": "servo-ready",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Drive safety",
   "machine_subsystem": "Servo drives",
   "status": "COMMISSIONING_PENDING",
   "field_point": "Servo drives ready relay contact",
   "designations": [],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Wire before first motion if available",
   "location": "Servo bay — drives-ready relay contact",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — relay contact form not confirmed",
    "basis": "current_pin_authority.csv:74 — \"Wire before first motion if available\"",
    "kind": "unknown"
   },
   "hal_state": "commented",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-31"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 54,
     "text": "# net servo-ready       <= hm2_7i80.0.7i84.0.0.input-31",
     "commented": true,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-31"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "77",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "54",
     "note": "commented out — # net servo-ready       <= hm2_7i80.0.7i84.0.0.input-31"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 77
  },
  {
   "id": "SPINDLE_FWD",
   "name": "Spindle Fwd",
   "board": "7i84U",
   "connector": "TB2",
   "channel": "OUT0",
   "hal_net": "spindle-fwd",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Spindle",
   "machine_subsystem": "Spindle drive",
   "status": "COMMISSIONING_PENDING",
   "field_point": "FR-SX forward input",
   "designations": [],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Digital FWD signal to FR-SX",
   "location": "Spindle/servo bay — FR-SX forward input",
   "location_note": "SX-IO1 board CON1/CONA",
   "expected": {
    "value": "0",
    "label": "0 / de-energized — output idle unless commanded",
    "basis": "No commanding logic in the active HAL for this net; outputs default off.",
    "kind": "default-off"
   },
   "hal_state": "commented",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.output-11"
   ],
   "producers": [
    "spindle.0.forward"
   ],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 86,
     "text": "# net spindle-fwd    <= spindle.0.forward",
     "commented": true,
     "producers": [
      "spindle.0.forward"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 87,
     "text": "# net spindle-fwd    => hm2_7i80.0.7i84.0.0.output-11",
     "commented": true,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.7i84.0.0.output-11"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "78",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "86",
     "note": "commented out — # net spindle-fwd    <= spindle.0.forward"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "87",
     "note": "commented out — # net spindle-fwd    => hm2_7i80.0.7i84.0.0.output-11"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C2",
    "C3"
   ],
   "authority_line": 78
  },
  {
   "id": "SPINDLE_REV",
   "name": "Spindle Rev",
   "board": "7i84U",
   "connector": "TB2",
   "channel": "OUT1",
   "hal_net": "spindle-rev",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Spindle",
   "machine_subsystem": "Spindle drive",
   "status": "COMMISSIONING_PENDING",
   "field_point": "FR-SX reverse input",
   "designations": [],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Digital REV signal to FR-SX",
   "location": "Spindle/servo bay — FR-SX reverse input",
   "location_note": "SX-IO1 board CON1/CONA",
   "expected": {
    "value": "0",
    "label": "0 / de-energized — output idle unless commanded",
    "basis": "No commanding logic in the active HAL for this net; outputs default off.",
    "kind": "default-off"
   },
   "hal_state": "commented",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.output-12"
   ],
   "producers": [
    "spindle.0.reverse"
   ],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 88,
     "text": "# net spindle-rev    <= spindle.0.reverse",
     "commented": true,
     "producers": [
      "spindle.0.reverse"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 89,
     "text": "# net spindle-rev    => hm2_7i80.0.7i84.0.0.output-12",
     "commented": true,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.7i84.0.0.output-12"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "79",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "88",
     "note": "commented out — # net spindle-rev    <= spindle.0.reverse"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "89",
     "note": "commented out — # net spindle-rev    => hm2_7i80.0.7i84.0.0.output-12"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C2",
    "C3"
   ],
   "authority_line": 79
  },
  {
   "id": "SPINDLE_ENA",
   "name": "Spindle Ena",
   "board": "7i84U",
   "connector": "TB2",
   "channel": "OUT2",
   "hal_net": "spindle-ena",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Spindle",
   "machine_subsystem": "Spindle drive",
   "status": "COMMISSIONING_PENDING",
   "field_point": "FR-SX enable input",
   "designations": [],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Digital RUN/STOP signal to FR-SX",
   "location": "Spindle/servo bay — FR-SX enable input",
   "location_note": "SX-IO1 board CON1/CONA",
   "expected": {
    "value": "0",
    "label": "0 / de-energized — output idle unless commanded",
    "basis": "No commanding logic in the active HAL for this net; outputs default off.",
    "kind": "default-off"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "80",
     "note": "Current wiring authority row"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C2",
    "C3"
   ],
   "authority_line": 80
  },
  {
   "id": "HYD_PUMP_ON",
   "name": "Hyd Pump On",
   "board": "7i84U",
   "connector": "TB2",
   "channel": "OUT3",
   "hal_net": "hyd-pump-on",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Hydraulic",
   "machine_subsystem": "Hydraulic",
   "status": "PROPOSED",
   "field_point": "Hydraulic + head-lube pump contactor (PLC Y096 HYD.M)",
   "designations": [],
   "primary_source": "element_list_crosswalk_2026-07-27",
   "cleanup_notes": "Required before clamp/gear/ATC; interposing relay for contactor coil; prove HYD_PRESS_OK after start",
   "location": "Unknown — trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "0",
    "label": "0 / de-energized — output idle unless commanded",
    "basis": "No commanding logic in the active HAL for this net; outputs default off.",
    "kind": "default-off"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "81",
     "note": "Current wiring authority row"
    },
    {
     "file": "element_list_crosswalk_2026-07-27",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 81
  },
  {
   "id": "SPINDLE_ORIENT_CMD",
   "name": "Spindle Orient Cmd",
   "board": "7i84U",
   "connector": "TB2",
   "channel": "OUT4",
   "hal_net": "spindle-orient-cmd",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Spindle",
   "machine_subsystem": "Spindle",
   "status": "PROPOSED",
   "field_point": "FR-SX orient command (PLC Y093 ORCM1.M)",
   "designations": [],
   "primary_source": "element_list_crosswalk_2026-07-27",
   "cleanup_notes": "Sequence per ladder 28xx-29xx before ATC HAL component",
   "location": "Unknown — trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "0",
    "label": "0 / de-energized — output idle unless commanded",
    "basis": "No commanding logic in the active HAL for this net; outputs default off.",
    "kind": "default-off"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "82",
     "note": "Current wiring authority row"
    },
    {
     "file": "element_list_crosswalk_2026-07-27",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 82
  },
  {
   "id": "SPINDLE_ORIENT_LOGEAR",
   "name": "Spindle Orient Logear",
   "board": "7i84U",
   "connector": "TB2",
   "channel": "OUT5",
   "hal_net": "orient-lo-gear",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Spindle",
   "machine_subsystem": "Spindle",
   "status": "PROPOSED",
   "field_point": "Low-gear orient assist (PLC Y094 CTL.M)",
   "designations": [],
   "primary_source": "element_list_crosswalk_2026-07-27",
   "cleanup_notes": "Verify in ladder whether required in high gear too",
   "location": "Unknown — trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "0",
    "label": "0 / de-energized — output idle unless commanded",
    "basis": "No commanding logic in the active HAL for this net; outputs default off.",
    "kind": "default-off"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "83",
     "note": "Current wiring authority row"
    },
    {
     "file": "element_list_crosswalk_2026-07-27",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 83
  },
  {
   "id": "Z_BRAKE_REL",
   "name": "Z Brake Rel",
   "board": "7i84U",
   "connector": "TB2",
   "channel": "OUT6",
   "hal_net": "z-brake-rel",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Motion",
   "machine_subsystem": "Servo drives",
   "status": "COMMISSIONING_PENDING",
   "field_point": "N1J-L2-201 Z brake release",
   "designations": [],
   "primary_source": "phase2_plan",
   "cleanup_notes": "Add flyback diode or suitable suppression",
   "location": "Z axis — N1J-L2-201 brake release coil",
   "location_note": "Needs flyback/suppression",
   "expected": {
    "value": "0",
    "label": "0 / de-energized — output idle unless commanded",
    "basis": "No commanding logic in the active HAL for this net; outputs default off.",
    "kind": "default-off"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "84",
     "note": "Current wiring authority row"
    },
    {
     "file": "phase2_plan",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C2"
   ],
   "authority_line": 84
  },
  {
   "id": "GEAR_HI_SOL",
   "name": "Gear Hi Sol",
   "board": "7i84U",
   "connector": "TB2",
   "channel": "OUT7",
   "hal_net": "gear-hi-sol",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Spindle gear",
   "machine_subsystem": "Spindle gearbox",
   "status": "COMMISSIONING_PENDING",
   "field_point": "RLY-1 to SOL-13 Fujikoshi hydraulic valve",
   "designations": [
    "RLY-1",
    "SOL-13"
   ],
   "primary_source": "phase2_plan",
   "cleanup_notes": "Measure coil voltage before selecting relay contacts",
   "location": "Spindle gearbox — Fujikoshi hydraulic valve, via RLY-1",
   "location_note": "Authority: SOL-13 = high. connector_crossref.md:47 reads wire 413 as \"SOL-13 — Gear Shift Low\".",
   "expected": {
    "value": "0",
    "label": "0 / de-energized — output idle unless commanded",
    "basis": "No commanding logic in the active HAL for this net; outputs default off.",
    "kind": "default-off"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "85",
     "note": "Current wiring authority row"
    },
    {
     "file": "phase2_plan",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C2",
    "C4"
   ],
   "authority_line": 85
  },
  {
   "id": "GEAR_LO_SOL",
   "name": "Gear Lo Sol",
   "board": "7i84U",
   "connector": "TB2",
   "channel": "OUT8",
   "hal_net": "gear-lo-sol",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Spindle gear",
   "machine_subsystem": "Spindle gearbox",
   "status": "HOLD_CONFLICT",
   "field_point": "RLY-2 to SOL-12 Fujikoshi hydraulic valve",
   "designations": [
    "RLY-2",
    "SOL-12"
   ],
   "primary_source": "phase2_plan",
   "cleanup_notes": "Conflict: connector_crossref.md omits SOL-12 and identifies SOL-13 as low; verify both gear-shift coils before wiring",
   "location": "Spindle gearbox — Fujikoshi hydraulic valve, via RLY-2",
   "location_note": "Authority: SOL-12 = low. connector_crossref.md omits SOL-12 entirely; io_map_research_notes.md:54 calls SOL-12 high.",
   "expected": {
    "value": "0",
    "label": "0 / de-energized — output idle unless commanded",
    "basis": "No commanding logic in the active HAL for this net; outputs default off.",
    "kind": "default-off"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "86",
     "note": "Current wiring authority row"
    },
    {
     "file": "phase2_plan",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C2",
    "C4"
   ],
   "authority_line": 86
  },
  {
   "id": "TOOL_CLAMP_SOL",
   "name": "Tool Clamp Sol",
   "board": "7i84U",
   "connector": "TB2",
   "channel": "OUT9",
   "hal_net": "tool-clamp-sol",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "ATC tool",
   "machine_subsystem": "ATC",
   "status": "COMMISSIONING_PENDING",
   "field_point": "RLY-3 to SOL-10 Fujikoshi hydraulic valve",
   "designations": [
    "RLY-3",
    "SOL-10"
   ],
   "primary_source": "phase2_plan",
   "cleanup_notes": "Confirm single valve versus dual coil behavior",
   "location": "Spindle head — Fujikoshi hydraulic valve SOL-10, via RLY-3",
   "location_note": "connector_crossref.md:46 identifies SOL-10 as tool UNCLAMP. Single- vs dual-coil unresolved.",
   "expected": {
    "value": "0",
    "label": "0 / de-energized — output idle unless commanded",
    "basis": "No commanding logic in the active HAL for this net; outputs default off.",
    "kind": "default-off"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "87",
     "note": "Current wiring authority row"
    },
    {
     "file": "phase2_plan",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C2",
    "C5"
   ],
   "authority_line": 87
  },
  {
   "id": "TOOL_UNCLAMP_SOL",
   "name": "Tool Unclamp Sol",
   "board": "7i84U",
   "connector": "TB2",
   "channel": "OUT10",
   "hal_net": "tool-unclamp-sol",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "ATC tool",
   "machine_subsystem": "ATC",
   "status": "COMMISSIONING_PENDING",
   "field_point": "RLY-4 to SOL-10 Fujikoshi hydraulic valve",
   "designations": [
    "RLY-4",
    "SOL-10",
    "TB-505"
   ],
   "primary_source": "phase2_plan",
   "cleanup_notes": "Evidence supports SOL-10 tool unclamp; verify relay path and whether the valve is single-coil or dual-coil before energizing",
   "location": "Spindle head — Fujikoshi hydraulic valve SOL-10, via RLY-4",
   "location_note": "Wire tag 410D/410, pg 75 TB505 table + pg 90",
   "expected": {
    "value": "0",
    "label": "0 / de-energized — output idle unless commanded",
    "basis": "No commanding logic in the active HAL for this net; outputs default off.",
    "kind": "default-off"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.output-00"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 67,
     "text": "net tool-unclamp-sol => hm2_7i80.0.7i84.0.0.output-00",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.7i84.0.0.output-00"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "88",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "67",
     "note": "net tool-unclamp-sol => hm2_7i80.0.7i84.0.0.output-00"
    },
    {
     "file": "phase2_plan",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C2",
    "C5"
   ],
   "authority_line": 88
  },
  {
   "id": "COOLANT_ON",
   "name": "Coolant On",
   "board": "7i84U",
   "connector": "TB2",
   "channel": "OUT11",
   "hal_net": "flood-coolant",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Coolant",
   "machine_subsystem": "Coolant",
   "status": "COMMISSIONING_PENDING",
   "field_point": "Coolant pump relay",
   "designations": [
    "SOL-31",
    "TB-51",
    "CB-4"
   ],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "May need interposing relay",
   "location": "Coolant pump — contactor / SOL-31 flood valve",
   "location_note": "SOL-31 confirmed on the TB-51 diagram (pg 100). Motor circuit is CB-4 + CMS overload (OL-CM4A), 350 W 4-pole.",
   "expected": {
    "value": "0",
    "label": "0 / de-energized — output idle unless commanded",
    "basis": "No commanding logic in the active HAL for this net; outputs default off.",
    "kind": "default-off"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.output-05"
   ],
   "producers": [
    "iocontrol.0.coolant-flood"
   ],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 74,
     "text": "net flood-coolant <= iocontrol.0.coolant-flood",
     "commented": false,
     "producers": [
      "iocontrol.0.coolant-flood"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 75,
     "text": "net flood-coolant => hm2_7i80.0.7i84.0.0.output-05",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.7i84.0.0.output-05"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "89",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "74",
     "note": "net flood-coolant <= iocontrol.0.coolant-flood"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "75",
     "note": "net flood-coolant => hm2_7i80.0.7i84.0.0.output-05"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C2",
    "C10"
   ],
   "authority_line": 89
  },
  {
   "id": "LUBE_ON",
   "name": "Lube On",
   "board": "7i84U",
   "connector": "TB2",
   "channel": "OUT12",
   "hal_net": "lube-on",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Utility",
   "machine_subsystem": "Lubrication",
   "status": "COMMISSIONING_PENDING",
   "field_point": "Lube pump relay",
   "designations": [],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "May need interposing relay",
   "location": "Lube pump — motor contactor",
   "location_note": "Alarm table shows TWO lube systems (head AL-56, way AL-54); the authority has one generic output.",
   "expected": {
    "value": "0",
    "label": "0 / de-energized — output idle unless commanded",
    "basis": "No commanding logic in the active HAL for this net; outputs default off.",
    "kind": "default-off"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "90",
     "note": "Current wiring authority row"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C2",
    "C10"
   ],
   "authority_line": 90
  },
  {
   "id": "ATC_FWD",
   "name": "Atc Fwd",
   "board": "7i84U",
   "connector": "TB2",
   "channel": "OUT13",
   "hal_net": "atc-fwd",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "ATC motor",
   "machine_subsystem": "ATC magazine",
   "status": "COMMISSIONING_PENDING",
   "field_point": "ATC motor forward relay",
   "designations": [
    "SOL-8A"
   ],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Do not energize before interlocks are proven",
   "location": "ATC magazine — motor forward relay",
   "location_note": "SOL-8A/8B (CW/CCW) are NOT yet assigned to a Mesa output; do not treat these generic rows as equivalent.",
   "expected": {
    "value": "0",
    "label": "0 / de-energized — output idle unless commanded",
    "basis": "No commanding logic in the active HAL for this net; outputs default off.",
    "kind": "default-off"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "91",
     "note": "Current wiring authority row"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C2",
    "C9"
   ],
   "authority_line": 91
  },
  {
   "id": "ATC_REV",
   "name": "Atc Rev",
   "board": "7i84U",
   "connector": "TB2",
   "channel": "OUT14",
   "hal_net": "atc-rev",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "ATC motor",
   "machine_subsystem": "ATC magazine",
   "status": "COMMISSIONING_PENDING",
   "field_point": "ATC motor reverse relay",
   "designations": [
    "SOL-8A"
   ],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Do not energize before interlocks are proven",
   "location": "ATC magazine — motor reverse relay",
   "location_note": "SOL-8A/8B direction mapping unresolved (crossref says 8A=CCW/forward, alarm-table OCR says 8A=CW).",
   "expected": {
    "value": "0",
    "label": "0 / de-energized — output idle unless commanded",
    "basis": "No commanding logic in the active HAL for this net; outputs default off.",
    "kind": "default-off"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "92",
     "note": "Current wiring authority row"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C2",
    "C9"
   ],
   "authority_line": 92
  },
  {
   "id": "ALARM_OUT",
   "name": "Alarm Out",
   "board": "7i84U",
   "connector": "TB2",
   "channel": "OUT15",
   "hal_net": "alarm-out",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Panel",
   "machine_subsystem": "Operator panel",
   "status": "OPTIONAL_VERIFY",
   "field_point": "Alarm light or horn",
   "designations": [],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Confirm load and behavior",
   "location": "Operating panel — alarm light or horn",
   "location_note": "",
   "expected": {
    "value": "0",
    "label": "0 / de-energized — output idle unless commanded",
    "basis": "No commanding logic in the active HAL for this net; outputs default off.",
    "kind": "default-off"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "93",
     "note": "Current wiring authority row"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C2"
   ],
   "authority_line": 93
  },
  {
   "id": "SECOND_SSERIAL_CARD",
   "name": "Second Sserial Card",
   "board": "none",
   "connector": "none",
   "channel": "none",
   "hal_net": "",
   "direction": "REVIEW",
   "direction_label": "Review item",
   "subsystem": "Expansion",
   "machine_subsystem": "Expansion",
   "status": "RETIRED_2026-08-03",
   "field_point": "Additional 7i84 or equivalent on 7i44 spare port",
   "designations": [
    "OTR",
    "LS-140",
    "TB-5"
   ],
   "primary_source": "open_issues.md §3 (2026-08-03) single-7i84U plan",
   "cleanup_notes": "Retired 2026-08-03: single-7i84U plan committed. New stack has 6 spare 7i44 sserial ports available if ever needed; no additional card required for planned scope.",
   "location": "Retired 2026-08-03",
   "location_note": "Not required. Single-7i84U plan committed 2026-08-03: drops (Y091 OTR, X078 MPWS, X02F INHRLS, Y023-Y025 M43-M45T) + series consolidations (HLP+HLP2, THR+ONT, ITMDSS+LS-140/141) + panel moves (FEED_HOLD/SINGLE_BLOCK to touchscreen, panel-power-on to software state, reset-out to TB5 SSR) fit 5 DI + 5 DO of gap load into 6 DI + 6 DO available.",
   "expected": {
    "value": "n/a",
    "label": "Review item — no hardware",
    "basis": "current_pin_authority.csv:91",
    "kind": "na"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "94",
     "note": "Current wiring authority row"
    },
    {
     "file": "open_issues.md §3 (2026-08-03) single-7i84U plan",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C10"
   ],
   "authority_line": 94
  },
  {
   "id": "NET_AIR_BLAST_1",
   "name": "air-blast-1",
   "board": "7i84U",
   "connector": "TB2",
   "channel": "OUT7",
   "hal_net": "air-blast-1",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Unmapped",
   "machine_subsystem": "Unmapped",
   "status": "CONFIG_ONLY",
   "field_point": "Not in the wiring authority",
   "designations": [],
   "primary_source": "HAL config only",
   "cleanup_notes": "No row in current_pin_authority.csv. Active in HAL — remove or add an authority row before loading against field wiring.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.output-07"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 80,
     "text": "net air-blast-1 => hm2_7i80.0.7i84.0.0.output-07",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.7i84.0.0.output-07"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "80",
     "note": "net air-blast-1 => hm2_7i80.0.7i84.0.0.output-07"
    }
   ],
   "conflicts": [
    "C2"
   ],
   "authority_line": null
  },
  {
   "id": "NET_AIR_BLAST_2",
   "name": "air-blast-2",
   "board": "7i84U",
   "connector": "TB2",
   "channel": "OUT8",
   "hal_net": "air-blast-2",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Unmapped",
   "machine_subsystem": "Unmapped",
   "status": "CONFIG_ONLY",
   "field_point": "Not in the wiring authority",
   "designations": [],
   "primary_source": "HAL config only",
   "cleanup_notes": "No row in current_pin_authority.csv. Active in HAL — remove or add an authority row before loading against field wiring.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.output-08"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 81,
     "text": "net air-blast-2 => hm2_7i80.0.7i84.0.0.output-08",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.7i84.0.0.output-08"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "81",
     "note": "net air-blast-2 => hm2_7i80.0.7i84.0.0.output-08"
    }
   ],
   "conflicts": [
    "C2"
   ],
   "authority_line": null
  },
  {
   "id": "NET_AIR_OK",
   "name": "air-ok",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN11",
   "hal_net": "air-ok",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Unmapped",
   "machine_subsystem": "Unmapped",
   "status": "CONFIG_ONLY",
   "field_point": "Not in the wiring authority",
   "designations": [],
   "primary_source": "HAL config only",
   "cleanup_notes": "No row in current_pin_authority.csv. Active in HAL — remove or add an authority row before loading against field wiring.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-11"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 27,
     "text": "net air-ok      <= hm2_7i80.0.7i84.0.0.input-11",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-11"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "27",
     "note": "net air-ok      <= hm2_7i80.0.7i84.0.0.input-11"
    }
   ],
   "conflicts": [
    "C1"
   ],
   "authority_line": null
  },
  {
   "id": "NET_CHIP_CONVEYOR_ON",
   "name": "chip-conveyor-on",
   "board": "7i84U",
   "connector": "TB2",
   "channel": "OUT14",
   "hal_net": "chip-conveyor-on",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Unmapped",
   "machine_subsystem": "Unmapped",
   "status": "CONFIG_ONLY",
   "field_point": "Not in the wiring authority",
   "designations": [],
   "primary_source": "HAL config only",
   "cleanup_notes": "No row in current_pin_authority.csv. Commented out in HAL.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "commented",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.output-14"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 94,
     "text": "# net chip-conveyor-on => hm2_7i80.0.7i84.0.0.output-14",
     "commented": true,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.7i84.0.0.output-14"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "94",
     "note": "commented out — # net chip-conveyor-on => hm2_7i80.0.7i84.0.0.output-14"
    }
   ],
   "conflicts": [
    "C2"
   ],
   "authority_line": null
  },
  {
   "id": "NET_COOLANT_LOW",
   "name": "coolant-low",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN10",
   "hal_net": "coolant-low",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Unmapped",
   "machine_subsystem": "Unmapped",
   "status": "CONFIG_ONLY",
   "field_point": "Not in the wiring authority",
   "designations": [],
   "primary_source": "HAL config only",
   "cleanup_notes": "No row in current_pin_authority.csv. Active in HAL — remove or add an authority row before loading against field wiring.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-10"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 26,
     "text": "net coolant-low <= hm2_7i80.0.7i84.0.0.input-10",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-10"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "26",
     "note": "net coolant-low <= hm2_7i80.0.7i84.0.0.input-10"
    }
   ],
   "conflicts": [
    "C1"
   ],
   "authority_line": null
  },
  {
   "id": "NET_DOOR_CLOSED",
   "name": "door-closed",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN24",
   "hal_net": "door-closed",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Unmapped",
   "machine_subsystem": "Unmapped",
   "status": "CONFIG_ONLY",
   "field_point": "Not in the wiring authority",
   "designations": [],
   "primary_source": "HAL config only",
   "cleanup_notes": "No row in current_pin_authority.csv. Commented out in HAL.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "commented",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-24"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 47,
     "text": "# net door-closed       <= hm2_7i80.0.7i84.0.0.input-24",
     "commented": true,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-24"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "47",
     "note": "commented out — # net door-closed       <= hm2_7i80.0.7i84.0.0.input-24"
    }
   ],
   "conflicts": [
    "C1"
   ],
   "authority_line": null
  },
  {
   "id": "NET_FEED_HOLD_PB",
   "name": "feed-hold-pb",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN29",
   "hal_net": "feed-hold-pb",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Unmapped",
   "machine_subsystem": "Unmapped",
   "status": "CONFIG_ONLY",
   "field_point": "Not in the wiring authority",
   "designations": [],
   "primary_source": "HAL config only",
   "cleanup_notes": "No row in current_pin_authority.csv. Commented out in HAL.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "commented",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-29"
   ],
   "producers": [],
   "consumers": [
    "motion.feed-hold"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 57,
     "text": "# net feed-hold-pb      <= hm2_7i80.0.7i84.0.0.input-29",
     "commented": true,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-29"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 58,
     "text": "# net feed-hold-pb      => motion.feed-hold",
     "commented": true,
     "producers": [],
     "consumers": [
      "motion.feed-hold"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "57",
     "note": "commented out — # net feed-hold-pb      <= hm2_7i80.0.7i84.0.0.input-29"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "58",
     "note": "commented out — # net feed-hold-pb      => motion.feed-hold"
    }
   ],
   "conflicts": [
    "C1"
   ],
   "authority_line": null
  },
  {
   "id": "NET_LAMP_ALARM",
   "name": "lamp-alarm",
   "board": "7i80HDT",
   "connector": "P1",
   "channel": "gpio.NNN.out",
   "hal_net": "lamp-alarm",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Unmapped",
   "machine_subsystem": "Unmapped",
   "status": "CONFIG_ONLY",
   "field_point": "Not in the wiring authority",
   "designations": [],
   "primary_source": "HAL config only",
   "cleanup_notes": "No row in current_pin_authority.csv. Commented out in HAL.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "commented",
   "mesa_pins": [
    "hm2_7i80.0.gpio.NNN.out"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 335,
     "text": "# net lamp-alarm    => hm2_7i80.0.gpio.NNN.out",
     "commented": true,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.gpio.NNN.out"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "335",
     "note": "commented out — # net lamp-alarm    => hm2_7i80.0.gpio.NNN.out"
    }
   ],
   "conflicts": [
    "C2"
   ],
   "authority_line": null
  },
  {
   "id": "NET_LAMP_READY",
   "name": "lamp-ready",
   "board": "7i80HDT",
   "connector": "P1",
   "channel": "gpio.NNN.out",
   "hal_net": "lamp-ready",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Unmapped",
   "machine_subsystem": "Unmapped",
   "status": "CONFIG_ONLY",
   "field_point": "Not in the wiring authority",
   "designations": [],
   "primary_source": "HAL config only",
   "cleanup_notes": "No row in current_pin_authority.csv. Commented out in HAL.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "commented",
   "mesa_pins": [
    "hm2_7i80.0.gpio.NNN.out"
   ],
   "producers": [
    "iocontrol.0.user-enable-out"
   ],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 333,
     "text": "# net lamp-ready    <= iocontrol.0.user-enable-out",
     "commented": true,
     "producers": [
      "iocontrol.0.user-enable-out"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 334,
     "text": "# net lamp-ready    => hm2_7i80.0.gpio.NNN.out",
     "commented": true,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.gpio.NNN.out"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "333",
     "note": "commented out — # net lamp-ready    <= iocontrol.0.user-enable-out"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "334",
     "note": "commented out — # net lamp-ready    => hm2_7i80.0.gpio.NNN.out"
    }
   ],
   "conflicts": [
    "C2"
   ],
   "authority_line": null
  },
  {
   "id": "NET_MAG_CCW_SOL",
   "name": "mag-ccw-sol",
   "board": "7i84U",
   "connector": "TB2",
   "channel": "OUT2",
   "hal_net": "mag-ccw-sol",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Unmapped",
   "machine_subsystem": "Unmapped",
   "status": "CONFIG_ONLY",
   "field_point": "Not in the wiring authority",
   "designations": [],
   "primary_source": "HAL config only",
   "cleanup_notes": "No row in current_pin_authority.csv. Active in HAL — remove or add an authority row before loading against field wiring.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.output-02"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 69,
     "text": "net mag-ccw-sol => hm2_7i80.0.7i84.0.0.output-02",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.7i84.0.0.output-02"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "69",
     "note": "net mag-ccw-sol => hm2_7i80.0.7i84.0.0.output-02"
    }
   ],
   "conflicts": [
    "C2"
   ],
   "authority_line": null
  },
  {
   "id": "NET_MAG_COVER_CLOSE",
   "name": "mag-cover-close",
   "board": "7i84U",
   "connector": "TB2",
   "channel": "OUT4",
   "hal_net": "mag-cover-close",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Unmapped",
   "machine_subsystem": "Unmapped",
   "status": "CONFIG_ONLY",
   "field_point": "Not in the wiring authority",
   "designations": [],
   "primary_source": "HAL config only",
   "cleanup_notes": "No row in current_pin_authority.csv. Active in HAL — remove or add an authority row before loading against field wiring.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.output-04"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 72,
     "text": "net mag-cover-close => hm2_7i80.0.7i84.0.0.output-04",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.7i84.0.0.output-04"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "72",
     "note": "net mag-cover-close => hm2_7i80.0.7i84.0.0.output-04"
    }
   ],
   "conflicts": [
    "C2"
   ],
   "authority_line": null
  },
  {
   "id": "NET_MAG_COVER_OPEN",
   "name": "mag-cover-open",
   "board": "7i84U",
   "connector": "TB2",
   "channel": "OUT3",
   "hal_net": "mag-cover-open",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Unmapped",
   "machine_subsystem": "Unmapped",
   "status": "CONFIG_ONLY",
   "field_point": "Not in the wiring authority",
   "designations": [],
   "primary_source": "HAL config only",
   "cleanup_notes": "No row in current_pin_authority.csv. Active in HAL — remove or add an authority row before loading against field wiring.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.output-03"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 71,
     "text": "net mag-cover-open => hm2_7i80.0.7i84.0.0.output-03",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.7i84.0.0.output-03"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "71",
     "note": "net mag-cover-open => hm2_7i80.0.7i84.0.0.output-03"
    }
   ],
   "conflicts": [
    "C2"
   ],
   "authority_line": null
  },
  {
   "id": "NET_MAG_CW_SOL",
   "name": "mag-cw-sol",
   "board": "7i84U",
   "connector": "TB2",
   "channel": "OUT1",
   "hal_net": "mag-cw-sol",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Unmapped",
   "machine_subsystem": "Unmapped",
   "status": "CONFIG_ONLY",
   "field_point": "Not in the wiring authority",
   "designations": [],
   "primary_source": "HAL config only",
   "cleanup_notes": "No row in current_pin_authority.csv. Active in HAL — remove or add an authority row before loading against field wiring.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.output-01"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 68,
     "text": "net mag-cw-sol => hm2_7i80.0.7i84.0.0.output-01",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.7i84.0.0.output-01"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "68",
     "note": "net mag-cw-sol => hm2_7i80.0.7i84.0.0.output-01"
    }
   ],
   "conflicts": [
    "C2"
   ],
   "authority_line": null
  },
  {
   "id": "NET_MAIN_SERVO_ON",
   "name": "main-servo-on",
   "board": "7i80HDT",
   "connector": "P1",
   "channel": "gpio.NNN.out",
   "hal_net": "main-servo-on",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Unmapped",
   "machine_subsystem": "Unmapped",
   "status": "CONFIG_ONLY",
   "field_point": "Not in the wiring authority",
   "designations": [],
   "primary_source": "HAL config only",
   "cleanup_notes": "No row in current_pin_authority.csv. Commented out in HAL.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "commented",
   "mesa_pins": [
    "hm2_7i80.0.gpio.NNN.out"
   ],
   "producers": [
    "iocontrol.0.user-enable-out"
   ],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 331,
     "text": "# net main-servo-on <= iocontrol.0.user-enable-out",
     "commented": true,
     "producers": [
      "iocontrol.0.user-enable-out"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 332,
     "text": "# net main-servo-on => hm2_7i80.0.gpio.NNN.out",
     "commented": true,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.gpio.NNN.out"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "331",
     "note": "commented out — # net main-servo-on <= iocontrol.0.user-enable-out"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "332",
     "note": "commented out — # net main-servo-on => hm2_7i80.0.gpio.NNN.out"
    }
   ],
   "conflicts": [
    "C2"
   ],
   "authority_line": null
  },
  {
   "id": "NET_MIST_COOLANT",
   "name": "mist-coolant",
   "board": "7i84U",
   "connector": "TB2",
   "channel": "OUT6",
   "hal_net": "mist-coolant",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Unmapped",
   "machine_subsystem": "Unmapped",
   "status": "CONFIG_ONLY",
   "field_point": "Not in the wiring authority",
   "designations": [],
   "primary_source": "HAL config only",
   "cleanup_notes": "No row in current_pin_authority.csv. Active in HAL — remove or add an authority row before loading against field wiring.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.output-06"
   ],
   "producers": [
    "iocontrol.0.coolant-mist"
   ],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 77,
     "text": "net mist-coolant <= iocontrol.0.coolant-mist",
     "commented": false,
     "producers": [
      "iocontrol.0.coolant-mist"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 78,
     "text": "net mist-coolant => hm2_7i80.0.7i84.0.0.output-06",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.7i84.0.0.output-06"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "77",
     "note": "net mist-coolant <= iocontrol.0.coolant-mist"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "78",
     "note": "net mist-coolant => hm2_7i80.0.7i84.0.0.output-06"
    }
   ],
   "conflicts": [
    "C2"
   ],
   "authority_line": null
  },
  {
   "id": "NET_SINGLE_BLOCK",
   "name": "single-block",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN30",
   "hal_net": "single-block",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Unmapped",
   "machine_subsystem": "Unmapped",
   "status": "CONFIG_ONLY",
   "field_point": "Not in the wiring authority",
   "designations": [],
   "primary_source": "HAL config only",
   "cleanup_notes": "No row in current_pin_authority.csv. Commented out in HAL.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "commented",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-30"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 53,
     "text": "# net single-block      <= hm2_7i80.0.7i84.0.0.input-30",
     "commented": true,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-30"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "53",
     "note": "commented out — # net single-block      <= hm2_7i80.0.7i84.0.0.input-30"
    }
   ],
   "conflicts": [
    "C1"
   ],
   "authority_line": null
  },
  {
   "id": "NET_SPINDLE_AT_SPD",
   "name": "spindle-at-spd",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN15",
   "hal_net": "spindle-at-spd",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Unmapped",
   "machine_subsystem": "Unmapped",
   "status": "CONFIG_ONLY",
   "field_point": "Not in the wiring authority",
   "designations": [],
   "primary_source": "HAL config only",
   "cleanup_notes": "No row in current_pin_authority.csv. Commented out in HAL.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "commented",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-15"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 43,
     "text": "# net spindle-at-spd    <= hm2_7i80.0.7i84.0.0.input-15",
     "commented": true,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-15"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "43",
     "note": "commented out — # net spindle-at-spd    <= hm2_7i80.0.7i84.0.0.input-15"
    }
   ],
   "conflicts": [
    "C1"
   ],
   "authority_line": null
  },
  {
   "id": "NET_SPINDLE_ENABLE",
   "name": "spindle-enable",
   "board": "7i84U",
   "connector": "TB2",
   "channel": "OUT13",
   "hal_net": "spindle-enable",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Unmapped",
   "machine_subsystem": "Unmapped",
   "status": "CONFIG_ONLY",
   "field_point": "Not in the wiring authority",
   "designations": [],
   "primary_source": "HAL config only",
   "cleanup_notes": "No row in current_pin_authority.csv. Active in HAL — remove or add an authority row before loading against field wiring.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.output-13",
    "hm2_7i80.0.pwmgen.03.enable"
   ],
   "producers": [
    "spindle.0.on"
   ],
   "consumers": [
    "pid.s.enable"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 191,
     "text": "#   net spindle-enable                                => pid.s.enable",
     "commented": true,
     "producers": [],
     "consumers": [
      "pid.s.enable"
     ],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 194,
     "text": "net spindle-enable => hm2_7i80.0.pwmgen.03.enable",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.pwmgen.03.enable"
     ],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 318,
     "text": "net spindle-enable <= spindle.0.on",
     "commented": false,
     "producers": [
      "spindle.0.on"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 90,
     "text": "# net spindle-enable <= spindle.0.on",
     "commented": true,
     "producers": [
      "spindle.0.on"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 91,
     "text": "# net spindle-enable => hm2_7i80.0.7i84.0.0.output-13",
     "commented": true,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.7i84.0.0.output-13"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "191",
     "note": "commented out — #   net spindle-enable                                => pid.s.enable"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "194",
     "note": "net spindle-enable => hm2_7i80.0.pwmgen.03.enable"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "318",
     "note": "net spindle-enable <= spindle.0.on"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "90",
     "note": "commented out — # net spindle-enable <= spindle.0.on"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "91",
     "note": "commented out — # net spindle-enable => hm2_7i80.0.7i84.0.0.output-13"
    }
   ],
   "conflicts": [
    "C2"
   ],
   "authority_line": null
  },
  {
   "id": "NET_SPINDLE_ORIENT_ENA",
   "name": "spindle-orient-ena",
   "board": "7i80HDT",
   "connector": "P1",
   "channel": "pwmgen.04.enable",
   "hal_net": "spindle-orient-ena",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Unmapped",
   "machine_subsystem": "Unmapped",
   "status": "CONFIG_ONLY",
   "field_point": "Not in the wiring authority",
   "designations": [],
   "primary_source": "HAL config only",
   "cleanup_notes": "No row in current_pin_authority.csv. Commented out in HAL.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "commented",
   "mesa_pins": [
    "hm2_7i80.0.pwmgen.04.enable"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 201,
     "text": "# net spindle-orient-ena => hm2_7i80.0.pwmgen.04.enable",
     "commented": true,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.pwmgen.04.enable"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "201",
     "note": "commented out — # net spindle-orient-ena => hm2_7i80.0.pwmgen.04.enable"
    }
   ],
   "conflicts": [
    "C2"
   ],
   "authority_line": null
  },
  {
   "id": "NET_STACK_GREEN",
   "name": "stack-green",
   "board": "7i84U",
   "connector": "TB2",
   "channel": "OUT15",
   "hal_net": "stack-green",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Unmapped",
   "machine_subsystem": "Unmapped",
   "status": "CONFIG_ONLY",
   "field_point": "Not in the wiring authority",
   "designations": [],
   "primary_source": "HAL config only",
   "cleanup_notes": "No row in current_pin_authority.csv. Commented out in HAL.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "commented",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.output-15"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 95,
     "text": "# net stack-green      => hm2_7i80.0.7i84.0.0.output-15",
     "commented": true,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.7i84.0.0.output-15"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "95",
     "note": "commented out — # net stack-green      => hm2_7i80.0.7i84.0.0.output-15"
    }
   ],
   "conflicts": [
    "C2"
   ],
   "authority_line": null
  },
  {
   "id": "NET_TAP_COOLANT",
   "name": "tap-coolant",
   "board": "7i84U",
   "connector": "TB2",
   "channel": "OUT9",
   "hal_net": "tap-coolant",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Unmapped",
   "machine_subsystem": "Unmapped",
   "status": "CONFIG_ONLY",
   "field_point": "Not in the wiring authority",
   "designations": [],
   "primary_source": "HAL config only",
   "cleanup_notes": "No row in current_pin_authority.csv. Active in HAL — remove or add an authority row before loading against field wiring.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.output-09"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 82,
     "text": "net tap-coolant => hm2_7i80.0.7i84.0.0.output-09",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.7i84.0.0.output-09"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "82",
     "note": "net tap-coolant => hm2_7i80.0.7i84.0.0.output-09"
    }
   ],
   "conflicts": [
    "C2"
   ],
   "authority_line": null
  },
  {
   "id": "NET_TOOL_CODE_0",
   "name": "tool-code-0",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN5",
   "hal_net": "tool-code-0",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Unmapped",
   "machine_subsystem": "Unmapped",
   "status": "CONFIG_ONLY",
   "field_point": "Not in the wiring authority",
   "designations": [],
   "primary_source": "HAL config only",
   "cleanup_notes": "No row in current_pin_authority.csv. Active in HAL — remove or add an authority row before loading against field wiring.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-05"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 20,
     "text": "net tool-code-0 <= hm2_7i80.0.7i84.0.0.input-05",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-05"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "20",
     "note": "net tool-code-0 <= hm2_7i80.0.7i84.0.0.input-05"
    }
   ],
   "conflicts": [
    "C1"
   ],
   "authority_line": null
  },
  {
   "id": "NET_TOOL_CODE_1",
   "name": "tool-code-1",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN6",
   "hal_net": "tool-code-1",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Unmapped",
   "machine_subsystem": "Unmapped",
   "status": "CONFIG_ONLY",
   "field_point": "Not in the wiring authority",
   "designations": [],
   "primary_source": "HAL config only",
   "cleanup_notes": "No row in current_pin_authority.csv. Active in HAL — remove or add an authority row before loading against field wiring.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-06"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 21,
     "text": "net tool-code-1 <= hm2_7i80.0.7i84.0.0.input-06",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-06"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "21",
     "note": "net tool-code-1 <= hm2_7i80.0.7i84.0.0.input-06"
    }
   ],
   "conflicts": [
    "C1"
   ],
   "authority_line": null
  },
  {
   "id": "NET_TOOL_CODE_2",
   "name": "tool-code-2",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN7",
   "hal_net": "tool-code-2",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Unmapped",
   "machine_subsystem": "Unmapped",
   "status": "CONFIG_ONLY",
   "field_point": "Not in the wiring authority",
   "designations": [],
   "primary_source": "HAL config only",
   "cleanup_notes": "No row in current_pin_authority.csv. Active in HAL — remove or add an authority row before loading against field wiring.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-07"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 22,
     "text": "net tool-code-2 <= hm2_7i80.0.7i84.0.0.input-07",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-07"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "22",
     "note": "net tool-code-2 <= hm2_7i80.0.7i84.0.0.input-07"
    }
   ],
   "conflicts": [
    "C1"
   ],
   "authority_line": null
  },
  {
   "id": "NET_TOOL_CODE_3",
   "name": "tool-code-3",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN8",
   "hal_net": "tool-code-3",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Unmapped",
   "machine_subsystem": "Unmapped",
   "status": "CONFIG_ONLY",
   "field_point": "Not in the wiring authority",
   "designations": [],
   "primary_source": "HAL config only",
   "cleanup_notes": "No row in current_pin_authority.csv. Active in HAL — remove or add an authority row before loading against field wiring.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-08"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 23,
     "text": "net tool-code-3 <= hm2_7i80.0.7i84.0.0.input-08",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-08"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "23",
     "note": "net tool-code-3 <= hm2_7i80.0.7i84.0.0.input-08"
    }
   ],
   "conflicts": [
    "C1"
   ],
   "authority_line": null
  },
  {
   "id": "NET_TOOL_CODE_4",
   "name": "tool-code-4",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN9",
   "hal_net": "tool-code-4",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Unmapped",
   "machine_subsystem": "Unmapped",
   "status": "CONFIG_ONLY",
   "field_point": "Not in the wiring authority",
   "designations": [],
   "primary_source": "HAL config only",
   "cleanup_notes": "No row in current_pin_authority.csv. Active in HAL — remove or add an authority row before loading against field wiring.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-09"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 24,
     "text": "net tool-code-4 <= hm2_7i80.0.7i84.0.0.input-09",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-09"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "24",
     "note": "net tool-code-4 <= hm2_7i80.0.7i84.0.0.input-09"
    }
   ],
   "conflicts": [
    "C1"
   ],
   "authority_line": null
  },
  {
   "id": "NET_WORK_LIGHT",
   "name": "work-light",
   "board": "7i84U",
   "connector": "TB2",
   "channel": "OUT10",
   "hal_net": "work-light",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Unmapped",
   "machine_subsystem": "Unmapped",
   "status": "CONFIG_ONLY",
   "field_point": "Not in the wiring authority",
   "designations": [],
   "primary_source": "HAL config only",
   "cleanup_notes": "No row in current_pin_authority.csv. Active in HAL — remove or add an authority row before loading against field wiring.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.output-10"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 83,
     "text": "net work-light => hm2_7i80.0.7i84.0.0.output-10",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.7i84.0.0.output-10"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "sources": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "83",
     "note": "net work-light => hm2_7i80.0.7i84.0.0.output-10"
    }
   ],
   "conflicts": [
    "C2"
   ],
   "authority_line": null
  }
 ],
 "conflicts": [
  {
   "id": "C1",
   "title": "7i84U input allocation: field_7i84u.hal disagrees with the pin authority",
   "severity": "conflict",
   "summary": "Seven active input nets in field_7i84u.hal are wired to different 7i84U channels than current_pin_authority.csv assigns. The authority wins; the HAL file has not been updated yet.",
   "detail": [
    "tool-clamped: HAL input-00 (field_7i84u.hal:12) vs authority IN15 (current_pin_authority.csv:58)",
    "tool-unclamped: HAL input-01 (field_7i84u.hal:13) vs authority IN16 (current_pin_authority.csv:59)",
    "atc-y-zone: HAL input-02 (field_7i84u.hal:15) vs authority IN0 (current_pin_authority.csv:43)",
    "atc-z-zone: HAL input-03 (field_7i84u.hal:16) vs authority IN1 (current_pin_authority.csv:44)",
    "x-drive-fault: HAL input-12 (field_7i84u.hal:34) vs authority IN10 (current_pin_authority.csv:53)",
    "y-drive-fault: HAL input-13 (field_7i84u.hal:36) vs authority IN11 (current_pin_authority.csv:54)",
    "z-drive-fault: HAL input-14 (field_7i84u.hal:38) vs authority IN12 (current_pin_authority.csv:55)",
    "HAL nets with no authority row at all: mag-in-pos (in-04), tool-code-0..4 (in-05..09), coolant-low (in-10), air-ok (in-11)."
   ],
   "action": "Re-issue field_7i84u.hal from current_pin_authority.csv before loading HAL against live field wiring. Until then the HAL channel numbers must not be used to land wires.",
   "signals": [
    "TOOL_CLAMP_CONF",
    "TOOL_UNCLAMP_CONF",
    "ATC_ZONE_Y",
    "ATC_ZONE_Z",
    "X_DRIVE_FAULT",
    "Y_DRIVE_FAULT",
    "Z_DRIVE_FAULT"
   ],
   "sources": [
    "linuxcnc/field_7i84u.hal:12-39",
    "mesa/current_pin_authority.csv:43-59"
   ]
  },
  {
   "id": "C2",
   "title": "7i84U output allocation: field_7i84u.hal disagrees with the pin authority",
   "severity": "conflict",
   "summary": "The active output block in field_7i84u.hal drives eleven outputs that mostly do not exist in the authority table, while most authority outputs are commented out or absent.",
   "detail": [
    "tool-unclamp-sol: HAL output-00 (field_7i84u.hal:66) vs authority OUT10 (current_pin_authority.csv:85)",
    "flood-coolant: HAL output-05 (field_7i84u.hal:74) vs authority OUT11 (current_pin_authority.csv:86)",
    "HAL-only outputs with no authority row: mag-cw-sol (out-01), mag-ccw-sol (out-02), mag-cover-open (out-03), mag-cover-close (out-04), mist-coolant (out-06), air-blast-1 (out-07), air-blast-2 (out-08), tap-coolant (out-09), work-light (out-10)",
    "Authority outputs with no active HAL net: spindle-fwd/rev/ena (OUT0-2, commented at field_7i84u.hal:85-90), z-brake-rel (OUT6), gear-hi-sol (OUT7), gear-lo-sol (OUT8), tool-clamp-sol (OUT9), lube-on (OUT12), atc-fwd (OUT13), atc-rev (OUT14), alarm-out (OUT15)"
   ],
   "action": "Do not energize any 7i84U output until the HAL output block is regenerated from the authority table and each load is traced and measured.",
   "signals": [
    "TOOL_UNCLAMP_SOL",
    "COOLANT_ON",
    "SPINDLE_FWD",
    "SPINDLE_REV",
    "SPINDLE_ENA",
    "Z_BRAKE_REL",
    "GEAR_HI_SOL",
    "GEAR_LO_SOL",
    "TOOL_CLAMP_SOL",
    "LUBE_ON",
    "ATC_FWD",
    "ATC_REV",
    "ALARM_OUT"
   ],
   "sources": [
    "linuxcnc/field_7i84u.hal:66-94",
    "mesa/current_pin_authority.csv:75-90"
   ]
  },
  {
   "id": "C3",
   "title": "Spindle control: 7i49 AOUT3 velocity vs 7i84U FWD/REV/ENA",
   "severity": "conflict",
   "summary": "The FR-SX has an analog speed command (7i49 AOUT3) and separate digital FWD/REV/ENA lines (7i84U TB2 OUT0-2). The commented HAL channels do not match the authority.",
   "detail": [
    "motion_7i80hdt.hal:265 nets spindle-enable from spindle.0.on and line 177 also uses it to gate pwmgen.03.enable, so the net is already live in the analog path",
    "motion_7i80hdt.hal:266 comment says \"Spindle enable/dir routed via 7i84U sserial\"",
    "field_7i84u.hal:85-90 has spindle-fwd/rev/enable to 7i84U output-11/12/13 — all commented out",
    "The authority places SPINDLE_FWD/REV/ENA on 7i84U TB2 OUT0/OUT1/OUT2 (current_pin_authority.csv:78-80), which does not match the commented HAL channel numbers"
   ],
   "action": "Pick one control path. Confirm the FR-SX terminal set (2-wire vs 3-wire, sink vs source) before wiring either. Note that spindle-enable currently doubles as the pwmgen enable.",
   "signals": [
    "SPINDLE_FWD",
    "SPINDLE_REV",
    "SPINDLE_ENA",
    "SPINDLE_SPEED_CMD"
   ],
   "sources": [
    "mesa/current_pin_authority.csv:13,78-80",
    "linuxcnc/motion_7i80hdt.hal:177,265-266",
    "linuxcnc/field_7i84u.hal:84-90"
   ]
  },
  {
   "id": "C4",
   "title": "Gear low: SOL-12 vs SOL-13 identity, and the gear-confirm prox",
   "severity": "conflict",
   "summary": "Three documents disagree about which solenoid is low gear, and three disagree about which prox confirms low gear. GEAR_LO_SOL is held.",
   "detail": [
    "Authority: OUT7 gear-hi-sol = SOL-13 (RLY-1), OUT8 gear-lo-sol = SOL-12 (RLY-2) (current_pin_authority.csv:82-83)",
    "connector_crossref.md:47 reads cabinet wire tag 413 as \"SOL-13 — Gear Shift Low\" and never mentions SOL-12",
    "io_map_research_notes.md:54-55 reads the TB-51 diagram (pg 100) as SOL-12 = high, SOL-13 = low",
    "Gear confirm prox: authority says PRS-10 high / PRS-12 low; the alarm table OCR says PRS-10 high (HGPRS) / PRS-2 low (LGPRS); the TB-51 diagram says PRS-9 high / PRS-10 low and calls PRS-12 \"2nd Z over-travel\" (io_map_research_notes.md:78-86)",
    "authority_conflicts.md:7-15 requires tracing both coil wire tags from RC3A and updating both rows together"
   ],
   "action": "Trace both gear coils from the RC3A board, identify the valve ports, measure coil voltage/current, and visually check the original diagram for the confirm prox. Update both solenoid rows and both prox rows in one change.",
   "signals": [
    "GEAR_LO_SOL",
    "GEAR_HI_SOL",
    "GEAR_LO_CONF",
    "GEAR_HI_CONF"
   ],
   "sources": [
    "mesa/current_pin_authority.csv:82-83,60-61",
    "wiring/connector_crossref.md:47",
    "wiring/io_map_research_notes.md:54-55,78-86",
    "wiring/authority_conflicts.md:7-15"
   ]
  },
  {
   "id": "C5",
   "title": "Tool clamp/unclamp valve: SOL-10 claimed by two outputs",
   "severity": "conflict",
   "summary": "TB2 OUT9 and OUT10 both land on SOL-10. Valve topology (single-coil vs dual-coil) is unresolved.",
   "detail": [
    "current_pin_authority.csv:84 TOOL_CLAMP_SOL → OUT9 → RLY-3 → SOL-10",
    "current_pin_authority.csv:85 TOOL_UNCLAMP_SOL → OUT10 → RLY-4 → SOL-10",
    "connector_crossref.md:46 identifies SOL-10 (wire 410D/410) as tool UNCLAMP only",
    "authority_conflicts.md:19-24 holds the clamp output and leaves unclamp at COMMISSIONING_PENDING"
   ],
   "action": "Trace the RLY-3 and RLY-4 load sides to the valve, determine coil count, and verify clamp/unclamp prox behaviour with hydraulic pressure removed.",
   "signals": [
    "TOOL_CLAMP_SOL",
    "TOOL_UNCLAMP_SOL",
    "TOOL_CLAMP_CONF",
    "TOOL_UNCLAMP_CONF"
   ],
   "sources": [
    "mesa/current_pin_authority.csv:84-85",
    "wiring/connector_crossref.md:46",
    "wiring/authority_conflicts.md:19-24"
   ]
  },
  {
   "id": "C6",
   "title": "All HostMot2 pin names are unverified placeholders",
   "severity": "unverified",
   "summary": "Every hm2_7i80.* name in the HAL set is a placeholder. Board tag, GPIO index ranges, resolver pin names, pwmgen instances, and the smart-serial device tag all need readhmid / halcmd show pin hm2 confirmation.",
   "detail": [
    "motion_7i80hdt.hal:4-7 — \"every hm2_7i80.* name below is an UNVERIFIED PLACEHOLDER... Confirm the exact board tag (hm2_7i80 expected)\"",
    "motion_7i80hdt.hal:32-33 — resolver pin names unverified",
    "motion_7i80hdt.hal:183-188 — \"The gpio.NNN INDICES BELOW ARE PLACEHOLDERS — inputs and outputs occupy separate, firmware-determined ranges... do not wire by these numbers\"",
    "motion_7i80hdt.hal:116 — pwmgen instance to axis mapping unconfirmed",
    "field_7i84u.hal:3-6 — \"Every hm2_7i80.*.7i84.* name below is an UNVERIFIED PLACEHOLDER\"",
    "mazak_vqc_20_40.hal:4-7 — board name, IP, firmware, resolver scales, drive polarity, normal states and safety wiring all unverified",
    "mazak_vqc_20_40.hal:25-26 — board_ip and config string still TODO despite 192.168.1.121 being set on line 31"
   ],
   "action": "Load the real firmware, run readhmid and halcmd show pin hm2, then regenerate the HAL pin names. Treat every gpio.NNN in this dashboard as a label, not a landing point.",
   "signals": [
    "X_LIMIT_PLUS",
    "X_LIMIT_MINUS",
    "Y_LIMIT_PLUS",
    "Y_LIMIT_MINUS",
    "Z_LIMIT_PLUS",
    "Z_LIMIT_MINUS",
    "X_HOME",
    "Y_HOME",
    "Z_HOME",
    "ESTOP_CHAIN",
    "AIR_BLAST",
    "TOUCH_SENSOR_BLAST",
    "TAP_COOLANT_BLAST",
    "X_RESOLVER",
    "Y_RESOLVER",
    "Z_RESOLVER"
   ],
   "sources": [
    "linuxcnc/motion_7i80hdt.hal:4-7,32-33,116,183-188",
    "linuxcnc/field_7i84u.hal:3-6",
    "linuxcnc/mazak_vqc_20_40.hal:4-7,25-26"
   ]
  },
  {
   "id": "C7",
   "title": "spindle-at-speed is forced true in HAL while the authority allocates a real input",
   "severity": "conflict",
   "summary": "motion_7i80hdt.hal short-circuits the at-speed net, so the planned 7i84U IN13 field signal would be ignored even once wired.",
   "detail": [
    "motion_7i80hdt.hal:102-103 — \"Until encoder is wired, spindle-at-speed is forced true (open-loop, no speed verification)\": sets spindle-at-speed true",
    "current_pin_authority.csv:56 — SPINDLE_AT_SPEED on 7i84U TB1 IN13, net spindle-at-speed",
    "field_7i84u.hal:42 — the matching input net is commented out and uses a different name (spindle-at-spd) and a different channel (input-15)"
   ],
   "action": "Remove the sets line before relying on at-speed for any interlock, and reconcile the net name (spindle-at-speed vs spindle-at-spd) and channel.",
   "signals": [
    "SPINDLE_AT_SPEED"
   ],
   "sources": [
    "linuxcnc/motion_7i80hdt.hal:102-103",
    "mesa/current_pin_authority.csv:56",
    "linuxcnc/field_7i84u.hal:42"
   ]
  },
  {
   "id": "C9",
   "title": "Magazine rotation direction SOL-8A/8B is unassigned and contradicted",
   "severity": "conflict",
   "summary": "The authority has generic ATC_FWD/ATC_REV relay outputs but never binds them to SOL-8A/SOL-8B, and the two sources disagree on which coil is which direction.",
   "detail": [
    "connector_crossref.md:44-45 — 408A = SOL-8A Magazine CCW (forward), 408B = SOL-8B Magazine CW (reverse)",
    "io_map_research_notes.md:249-250 (alarm-table OCR) — SOL-8A = Magazine CW, SOL-8B = Magazine CCW (reverse). Directly opposite.",
    "authority_conflicts.md:26-33 — \"do not promote the generic ATC direction rows until this trace is complete\""
   ],
   "action": "Trace both solenoid wires and verify actual magazine movement with hydraulic power isolated or under controlled commissioning.",
   "signals": [
    "ATC_FWD",
    "ATC_REV"
   ],
   "sources": [
    "wiring/connector_crossref.md:44-45",
    "wiring/io_map_research_notes.md:249-250",
    "wiring/authority_conflicts.md:26-33"
   ]
  },
  {
   "id": "C10",
   "title": "Coverage gaps: signals documented in research but absent from the authority",
   "severity": "unverified",
   "summary": "io_map_research_notes.md lists functional areas with no Mesa channel allocated. If any are retained they need channels that the current 32-in/16-out budget may not have.",
   "detail": [
    "Entire 2PC pallet-changer set: SOL-22A/22B, SOL-24, SOL-25A/25B, SOL-82A/82B, SOL-87A/87B, PRS-98/99, PRS-92/93, RS-96/97, LS-83/84/87/88 (io_map_research_notes.md:106-146)",
    "Door interlock switches LS-140/LS-141 (io_map_research_notes.md:94-104)",
    "SOL-31 flood coolant and the CB-4 + CMS overload relay (io_map_research_notes.md:148-170)",
    "Magazine cover reed switches RS-79 / RS-18, spindle orientation arrival signal, ATC arm position sensors, tool-measure stand switches (io_map_research_notes.md:287-295)",
    "Two lube systems (head AL-56, way AL-54) share one generic LUBE_ON output (io_map_research_notes.md:293-295)",
    "SECOND_SSERIAL_CARD was retired 2026-08-03 after single-7i84U plan committed (open_issues.md §3)"
   ],
   "action": "Decide whether the pallet changer is retained before finalising the 7i84U channel budget. Single-7i84U plan committed 2026-08-03; second smart-serial card retired — do not order.",
   "signals": [
    "SECOND_SSERIAL_CARD",
    "DOOR_INTERLOCK",
    "LUBE_ON",
    "COOLANT_ON"
   ],
   "sources": [
    "wiring/io_map_research_notes.md:94-170,287-295",
    "mesa/current_pin_authority.csv:91"
   ]
  }
 ],
 "subsystems": [
  "ATC",
  "ATC interlock",
  "ATC motor",
  "ATC tool",
  "Air",
  "Axis safety",
  "Coolant",
  "Drive safety",
  "Expansion",
  "Field I/O",
  "Hydraulic",
  "Hydraulic safety",
  "Machine safety",
  "Magazine",
  "Motion",
  "Panel",
  "Power",
  "Safety",
  "Spare",
  "Spindle",
  "Spindle gear",
  "Spindle safety",
  "Unmapped",
  "Utility"
 ],
 "connectors": [
  "P1",
  "P1 sserial port 0",
  "P1 sserial port 1",
  "P1 sserial ports 2-7",
  "P2 Analog TB",
  "P2 Resolver channel",
  "P2 Resolver channels",
  "P3 GPIO / 7i37TA IN0",
  "P3 GPIO / 7i37TA IN1",
  "P3 GPIO / 7i37TA IN10",
  "P3 GPIO / 7i37TA IN2",
  "P3 GPIO / 7i37TA IN3",
  "P3 GPIO / 7i37TA IN4",
  "P3 GPIO / 7i37TA IN5",
  "P3 GPIO / 7i37TA IN6",
  "P3 GPIO / 7i37TA IN7",
  "P3 GPIO / 7i37TA IN8",
  "P3 GPIO / 7i37TA IN9",
  "P3 GPIO / 7i37TA OUT0",
  "P3 GPIO / 7i37TA OUT1",
  "P3 GPIO / 7i37TA OUT2",
  "P3 GPIO / 7i37TA OUT3",
  "P3 GPIO / 7i37TA OUT4",
  "P3 GPIO / 7i37TA OUT5",
  "P3 GPIO / 7i37TA OUT6",
  "P3 GPIO / 7i37TA OUT7",
  "P3 GPIO / 7i37TA OUT8",
  "P3 breakout TB",
  "P3 direct GPIO",
  "TB1",
  "TB2",
  "none"
 ],
 "orphan_nets": [
  {
   "net": "air-blast-1",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.output-07"
   ],
   "refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 80,
     "commented": false,
     "text": "net air-blast-1 => hm2_7i80.0.7i84.0.0.output-07"
    }
   ],
   "active": true
  },
  {
   "net": "air-blast-2",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.output-08"
   ],
   "refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 81,
     "commented": false,
     "text": "net air-blast-2 => hm2_7i80.0.7i84.0.0.output-08"
    }
   ],
   "active": true
  },
  {
   "net": "air-ok",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-11"
   ],
   "refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 27,
     "commented": false,
     "text": "net air-ok      <= hm2_7i80.0.7i84.0.0.input-11"
    }
   ],
   "active": true
  },
  {
   "net": "chip-conveyor-on",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.output-14"
   ],
   "refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 94,
     "commented": true,
     "text": "# net chip-conveyor-on => hm2_7i80.0.7i84.0.0.output-14"
    }
   ],
   "active": false
  },
  {
   "net": "coolant-low",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-10"
   ],
   "refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 26,
     "commented": false,
     "text": "net coolant-low <= hm2_7i80.0.7i84.0.0.input-10"
    }
   ],
   "active": true
  },
  {
   "net": "door-closed",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-24"
   ],
   "refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 47,
     "commented": true,
     "text": "# net door-closed       <= hm2_7i80.0.7i84.0.0.input-24"
    }
   ],
   "active": false
  },
  {
   "net": "feed-hold-pb",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-29"
   ],
   "refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 57,
     "commented": true,
     "text": "# net feed-hold-pb      <= hm2_7i80.0.7i84.0.0.input-29"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 58,
     "commented": true,
     "text": "# net feed-hold-pb      => motion.feed-hold"
    }
   ],
   "active": false
  },
  {
   "net": "lamp-alarm",
   "mesa_pins": [
    "hm2_7i80.0.gpio.NNN.out"
   ],
   "refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 335,
     "commented": true,
     "text": "# net lamp-alarm    => hm2_7i80.0.gpio.NNN.out"
    }
   ],
   "active": false
  },
  {
   "net": "lamp-ready",
   "mesa_pins": [
    "hm2_7i80.0.gpio.NNN.out"
   ],
   "refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 333,
     "commented": true,
     "text": "# net lamp-ready    <= iocontrol.0.user-enable-out"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 334,
     "commented": true,
     "text": "# net lamp-ready    => hm2_7i80.0.gpio.NNN.out"
    }
   ],
   "active": false
  },
  {
   "net": "mag-ccw-sol",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.output-02"
   ],
   "refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 69,
     "commented": false,
     "text": "net mag-ccw-sol => hm2_7i80.0.7i84.0.0.output-02"
    }
   ],
   "active": true
  },
  {
   "net": "mag-cover-close",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.output-04"
   ],
   "refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 72,
     "commented": false,
     "text": "net mag-cover-close => hm2_7i80.0.7i84.0.0.output-04"
    }
   ],
   "active": true
  },
  {
   "net": "mag-cover-open",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.output-03"
   ],
   "refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 71,
     "commented": false,
     "text": "net mag-cover-open => hm2_7i80.0.7i84.0.0.output-03"
    }
   ],
   "active": true
  },
  {
   "net": "mag-cw-sol",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.output-01"
   ],
   "refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 68,
     "commented": false,
     "text": "net mag-cw-sol => hm2_7i80.0.7i84.0.0.output-01"
    }
   ],
   "active": true
  },
  {
   "net": "main-servo-on",
   "mesa_pins": [
    "hm2_7i80.0.gpio.NNN.out"
   ],
   "refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 331,
     "commented": true,
     "text": "# net main-servo-on <= iocontrol.0.user-enable-out"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 332,
     "commented": true,
     "text": "# net main-servo-on => hm2_7i80.0.gpio.NNN.out"
    }
   ],
   "active": false
  },
  {
   "net": "mist-coolant",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.output-06"
   ],
   "refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 77,
     "commented": false,
     "text": "net mist-coolant <= iocontrol.0.coolant-mist"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 78,
     "commented": false,
     "text": "net mist-coolant => hm2_7i80.0.7i84.0.0.output-06"
    }
   ],
   "active": true
  },
  {
   "net": "single-block",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-30"
   ],
   "refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 53,
     "commented": true,
     "text": "# net single-block      <= hm2_7i80.0.7i84.0.0.input-30"
    }
   ],
   "active": false
  },
  {
   "net": "spindle-at-spd",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-15"
   ],
   "refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 43,
     "commented": true,
     "text": "# net spindle-at-spd    <= hm2_7i80.0.7i84.0.0.input-15"
    }
   ],
   "active": false
  },
  {
   "net": "spindle-enable",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.output-13",
    "hm2_7i80.0.pwmgen.03.enable"
   ],
   "refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 191,
     "commented": true,
     "text": "#   net spindle-enable                                => pid.s.enable"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 194,
     "commented": false,
     "text": "net spindle-enable => hm2_7i80.0.pwmgen.03.enable"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 318,
     "commented": false,
     "text": "net spindle-enable <= spindle.0.on"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 90,
     "commented": true,
     "text": "# net spindle-enable <= spindle.0.on"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 91,
     "commented": true,
     "text": "# net spindle-enable => hm2_7i80.0.7i84.0.0.output-13"
    }
   ],
   "active": true
  },
  {
   "net": "spindle-orient-ena",
   "mesa_pins": [
    "hm2_7i80.0.pwmgen.04.enable"
   ],
   "refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 201,
     "commented": true,
     "text": "# net spindle-orient-ena => hm2_7i80.0.pwmgen.04.enable"
    }
   ],
   "active": false
  },
  {
   "net": "stack-green",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.output-15"
   ],
   "refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 95,
     "commented": true,
     "text": "# net stack-green      => hm2_7i80.0.7i84.0.0.output-15"
    }
   ],
   "active": false
  },
  {
   "net": "tap-coolant",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.output-09"
   ],
   "refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 82,
     "commented": false,
     "text": "net tap-coolant => hm2_7i80.0.7i84.0.0.output-09"
    }
   ],
   "active": true
  },
  {
   "net": "tool-code-0",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-05"
   ],
   "refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 20,
     "commented": false,
     "text": "net tool-code-0 <= hm2_7i80.0.7i84.0.0.input-05"
    }
   ],
   "active": true
  },
  {
   "net": "tool-code-1",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-06"
   ],
   "refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 21,
     "commented": false,
     "text": "net tool-code-1 <= hm2_7i80.0.7i84.0.0.input-06"
    }
   ],
   "active": true
  },
  {
   "net": "tool-code-2",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-07"
   ],
   "refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 22,
     "commented": false,
     "text": "net tool-code-2 <= hm2_7i80.0.7i84.0.0.input-07"
    }
   ],
   "active": true
  },
  {
   "net": "tool-code-3",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-08"
   ],
   "refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 23,
     "commented": false,
     "text": "net tool-code-3 <= hm2_7i80.0.7i84.0.0.input-08"
    }
   ],
   "active": true
  },
  {
   "net": "tool-code-4",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-09"
   ],
   "refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 24,
     "commented": false,
     "text": "net tool-code-4 <= hm2_7i80.0.7i84.0.0.input-09"
    }
   ],
   "active": true
  },
  {
   "net": "work-light",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.output-10"
   ],
   "refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 83,
     "commented": false,
     "text": "net work-light => hm2_7i80.0.7i84.0.0.output-10"
    }
   ],
   "active": true
  }
 ],
 "missing_from_hal": [
  "MAG_TOOL_AVAILABLE",
  "SPINDLE_TOOL_AVAILABLE",
  "SPINDLE_ORIENT_ARRIVAL",
  "SPINDLE_ZERO_SPEED",
  "MAG_COVER_OPEN_CONF",
  "MAG_COVER_CLOSE_CONF",
  "THERMAL_ALARM_CHAIN",
  "MANUAL_TOOL_UNCLAMP_PB",
  "SPINDLE_AT_SPEED",
  "GEAR_HI_CONF",
  "GEAR_LO_CONF",
  "MAG_BCD_BIT0",
  "MAG_BCD_BIT1",
  "MAG_BCD_BIT2",
  "MAG_BCD_BIT3",
  "MAG_BCD_BIT4",
  "DOOR_INTERLOCK",
  "COOLANT_LEVEL",
  "ESTOP_MONITOR",
  "MANUAL_TOOL_CLAMP_PB",
  "SPINDLE_ENA",
  "HYD_PUMP_ON",
  "SPINDLE_ORIENT_CMD",
  "SPINDLE_ORIENT_LOGEAR",
  "Z_BRAKE_REL",
  "GEAR_HI_SOL",
  "GEAR_LO_SOL",
  "TOOL_CLAMP_SOL",
  "LUBE_ON",
  "ATC_FWD",
  "ATC_REV",
  "ALARM_OUT"
 ]
};
