// GENERATED FILE - do not edit by hand.
// Regenerate with:  cd io-dashboard && python3 tools/generate_data.py
// Source of truth:  mesa/current_pin_authority.csv (repo root)
window.MAZAK_DATA = {
 "meta": {
  "machine": "Mazak VQC-20/40",
  "serial": "060231",
  "architecture": "LinuxCNC + Mesa 7i97T + Mesa 7i49 resolver interface + Mesa 7i84U field I/O",
  "generated": "2026-07-28 02:58 UTC",
  "source_repo": "mazak-vqc20-linuxcnc-retrofit",
  "authority_file": "mesa/current_pin_authority.csv",
  "halfiles": [
   "mazak_vqc_20_40.hal",
   "motion_7i97t.hal",
   "field_7i84u.hal"
  ],
  "board_ip": "192.168.1.121",
  "rules": [
   "mesa/current_pin_authority.csv is the wiring authority. It supersedes mesa/signal_map.csv.",
   "TB3 analog axis order is X=0, Z=1, Y=2.",
   "Axis feedback is Tamagawa resolver through the 7i49, not quadrature encoder.",
   "The hardware E-stop chain removes hazardous power. 7i97T TB5.10 is a monitor input only.",
   "Every hm2_7i97.* pin name in the HAL set is an unverified placeholder."
  ]
 },
 "boards": {
  "7i97T": {
   "name": "Mesa 7i97T",
   "role": "Ethernet analog servo controller (hm2_eth)",
   "detail": "Primary motion/control board. X/Y/Z analog command on TB3, core safety inputs on TB5, SSR overflow outputs on TB5, smart-serial to the 7i84U on TB4.",
   "address": "board_ip 192.168.1.121 (host NIC enp0s31f6 at 192.168.1.1/24)"
  },
  "7i84U": {
   "name": "Mesa 7i84U",
   "role": "Remote smart-serial field I/O",
   "detail": "32 field inputs on TB1, 16 field outputs on TB2. Mounted near the original green breakout PCB. Two independent field power banks.",
   "address": "sserial_port_0=00000000 on 7i97T TB4"
  },
  "7i49": {
   "name": "Mesa 7i49",
   "role": "Resolver-to-digital interface (plain, not HV)",
   "detail": "Reads the machine's original Tamagawa TS2014N shaft resolvers for X/Y/Z at 5 kHz excitation. Channel 03 is explicitly not used for the spindle.",
   "address": "num_resolvers=3"
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
   "blurb": "This net exists in the HAL config but has no row in current_pin_authority.csv. It traces back to the stale mesa/signal_map.csv layout. Not a wiring instruction.",
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
   "connector": "Resolver channel",
   "channel": "RES0",
   "hal_net": "x-pos-fb",
   "direction": "RESOLVER_IN",
   "direction_label": "Input (resolver)",
   "subsystem": "Motion",
   "machine_subsystem": "Axis feedback",
   "status": "COMMISSIONING_PENDING",
   "field_point": "Tamagawa TS2014N X resolver",
   "designations": [],
   "primary_source": "motion_7i97t.hal",
   "cleanup_notes": "Ohmmeter winding pairs and scope return before power",
   "location": "X ball screw, non-drive end — Tamagawa TS2014N shaft resolver on flex coupling",
   "location_note": "BKO-NC6062A; via BBIA-1 CNA1 \"TO RESOLVER MACHINE SIDE\"",
   "expected": {
    "value": "Dynamic",
    "label": "Dynamic position value — validity to be verified on commissioning",
    "basis": "motion_7i97t.hal:35-39 pre-power ohmmeter checks; 42-44 scale placeholders; current_pin_authority.csv:2 COMMISSIONING_PENDING",
    "kind": "dynamic"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i97.0.resolver.00.position"
   ],
   "producers": [],
   "consumers": [
    "joint.0.motor-pos-fb",
    "pid.x.feedback"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 69,
     "text": "net x-pos-fb        <= hm2_7i97.0.resolver.00.position",
     "commented": false,
     "producers": [
      "hm2_7i97.0.resolver.00.position"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 72,
     "text": "net x-pos-fb        => joint.0.motor-pos-fb",
     "commented": false,
     "producers": [],
     "consumers": [
      "joint.0.motor-pos-fb"
     ],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 132,
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
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 42,
     "text": "setp hm2_7i97.0.resolver.00.scale 1",
     "commented": false,
     "target": "hm2_7i97.0.resolver.00.scale",
     "value": "1"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 62,
     "text": "setp hm2_7i97.0.resolver.00.velocity-scale  [JOINT_0]RESOLVER_VELOCITY_SCALE",
     "commented": false,
     "target": "hm2_7i97.0.resolver.00.velocity-scale",
     "value": "[JOINT_0]RESOLVER_VELOCITY_SCALE"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 65,
     "text": "setp hm2_7i97.0.resolver.00.index-divisor   [JOINT_0]RESOLVER_INDEX_DIVISOR",
     "commented": false,
     "target": "hm2_7i97.0.resolver.00.index-divisor",
     "value": "[JOINT_0]RESOLVER_INDEX_DIVISOR"
    }
   ],
   "stale_row": {
    "line": 6,
    "card": "7i49",
    "conn": "Resolver TB",
    "channel": "RES0",
    "net": "x-pos-fb",
    "status": "Verify in cabinet",
    "differs": false
   },
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "2",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "69",
     "note": "net x-pos-fb        <= hm2_7i97.0.resolver.00.position"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "72",
     "note": "net x-pos-fb        => joint.0.motor-pos-fb"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "132",
     "note": "net x-pos-fb   => pid.x.feedback"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "42",
     "note": "setp hm2_7i97.0.resolver.00.scale 1"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "62",
     "note": "setp hm2_7i97.0.resolver.00.velocity-scale  [JOINT_0]RESOLVER_VELOCITY_SCALE"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "65",
     "note": "setp hm2_7i97.0.resolver.00.index-divisor   [JOINT_0]RESOLVER_INDEX_DIVISOR"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "6",
     "note": "STALE companion row: 7i49 Resolver TB RES0 → x-pos-fb (Verify in cabinet)"
    },
    {
     "file": "motion_7i97t.hal",
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
   "connector": "Resolver channel",
   "channel": "RES1",
   "hal_net": "y-pos-fb",
   "direction": "RESOLVER_IN",
   "direction_label": "Input (resolver)",
   "subsystem": "Motion",
   "machine_subsystem": "Axis feedback",
   "status": "COMMISSIONING_PENDING",
   "field_point": "Tamagawa TS2014N Y resolver",
   "designations": [],
   "primary_source": "motion_7i97t.hal",
   "cleanup_notes": "Ohmmeter winding pairs and scope return before power",
   "location": "Y ball screw, non-drive end — Tamagawa TS2014N shaft resolver on flex coupling",
   "location_note": "BKO-NC6062A; via BBIA-1 CNA1",
   "expected": {
    "value": "Dynamic",
    "label": "Dynamic position value — validity to be verified on commissioning",
    "basis": "motion_7i97t.hal:35-39, 43; current_pin_authority.csv:3",
    "kind": "dynamic"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i97.0.resolver.01.position"
   ],
   "producers": [],
   "consumers": [
    "joint.1.motor-pos-fb",
    "pid.y.feedback"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 76,
     "text": "net y-pos-fb        <= hm2_7i97.0.resolver.01.position",
     "commented": false,
     "producers": [
      "hm2_7i97.0.resolver.01.position"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 79,
     "text": "net y-pos-fb        => joint.1.motor-pos-fb",
     "commented": false,
     "producers": [],
     "consumers": [
      "joint.1.motor-pos-fb"
     ],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 144,
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
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 43,
     "text": "setp hm2_7i97.0.resolver.01.scale 1",
     "commented": false,
     "target": "hm2_7i97.0.resolver.01.scale",
     "value": "1"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 63,
     "text": "setp hm2_7i97.0.resolver.01.velocity-scale  [JOINT_1]RESOLVER_VELOCITY_SCALE",
     "commented": false,
     "target": "hm2_7i97.0.resolver.01.velocity-scale",
     "value": "[JOINT_1]RESOLVER_VELOCITY_SCALE"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 66,
     "text": "setp hm2_7i97.0.resolver.01.index-divisor   [JOINT_1]RESOLVER_INDEX_DIVISOR",
     "commented": false,
     "target": "hm2_7i97.0.resolver.01.index-divisor",
     "value": "[JOINT_1]RESOLVER_INDEX_DIVISOR"
    }
   ],
   "stale_row": {
    "line": 7,
    "card": "7i49",
    "conn": "Resolver TB",
    "channel": "RES1",
    "net": "y-pos-fb",
    "status": "Verify in cabinet",
    "differs": false
   },
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "3",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "76",
     "note": "net y-pos-fb        <= hm2_7i97.0.resolver.01.position"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "79",
     "note": "net y-pos-fb        => joint.1.motor-pos-fb"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "144",
     "note": "net y-pos-fb   => pid.y.feedback"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "43",
     "note": "setp hm2_7i97.0.resolver.01.scale 1"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "63",
     "note": "setp hm2_7i97.0.resolver.01.velocity-scale  [JOINT_1]RESOLVER_VELOCITY_SCALE"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "66",
     "note": "setp hm2_7i97.0.resolver.01.index-divisor   [JOINT_1]RESOLVER_INDEX_DIVISOR"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "7",
     "note": "STALE companion row: 7i49 Resolver TB RES1 → y-pos-fb (Verify in cabinet)"
    },
    {
     "file": "motion_7i97t.hal",
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
   "connector": "Resolver channel",
   "channel": "RES2",
   "hal_net": "z-pos-fb",
   "direction": "RESOLVER_IN",
   "direction_label": "Input (resolver)",
   "subsystem": "Motion",
   "machine_subsystem": "Axis feedback",
   "status": "COMMISSIONING_PENDING",
   "field_point": "Tamagawa TS2014N Z resolver",
   "designations": [],
   "primary_source": "motion_7i97t.hal",
   "cleanup_notes": "Ohmmeter winding pairs and scope return before power",
   "location": "Z ball screw, non-drive end — Tamagawa TS2014N shaft resolver on flex coupling",
   "location_note": "BKO-NC6062A; Z amp cable CA1 / BBIA-1 CN3",
   "expected": {
    "value": "Dynamic",
    "label": "Dynamic position value — validity to be verified on commissioning",
    "basis": "motion_7i97t.hal:35-39, 44; current_pin_authority.csv:4",
    "kind": "dynamic"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i97.0.resolver.02.position"
   ],
   "producers": [],
   "consumers": [
    "joint.2.motor-pos-fb",
    "pid.z.feedback"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 82,
     "text": "net z-pos-fb        <= hm2_7i97.0.resolver.02.position",
     "commented": false,
     "producers": [
      "hm2_7i97.0.resolver.02.position"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 85,
     "text": "net z-pos-fb        => joint.2.motor-pos-fb",
     "commented": false,
     "producers": [],
     "consumers": [
      "joint.2.motor-pos-fb"
     ],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 153,
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
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 44,
     "text": "setp hm2_7i97.0.resolver.02.scale 1",
     "commented": false,
     "target": "hm2_7i97.0.resolver.02.scale",
     "value": "1"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 64,
     "text": "setp hm2_7i97.0.resolver.02.velocity-scale  [JOINT_2]RESOLVER_VELOCITY_SCALE",
     "commented": false,
     "target": "hm2_7i97.0.resolver.02.velocity-scale",
     "value": "[JOINT_2]RESOLVER_VELOCITY_SCALE"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 67,
     "text": "setp hm2_7i97.0.resolver.02.index-divisor   [JOINT_2]RESOLVER_INDEX_DIVISOR",
     "commented": false,
     "target": "hm2_7i97.0.resolver.02.index-divisor",
     "value": "[JOINT_2]RESOLVER_INDEX_DIVISOR"
    }
   ],
   "stale_row": {
    "line": 8,
    "card": "7i49",
    "conn": "Resolver TB",
    "channel": "RES2",
    "net": "z-pos-fb",
    "status": "Verify in cabinet",
    "differs": false
   },
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "4",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "82",
     "note": "net z-pos-fb        <= hm2_7i97.0.resolver.02.position"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "85",
     "note": "net z-pos-fb        => joint.2.motor-pos-fb"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "153",
     "note": "net z-pos-fb   => pid.z.feedback"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "44",
     "note": "setp hm2_7i97.0.resolver.02.scale 1"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "64",
     "note": "setp hm2_7i97.0.resolver.02.velocity-scale  [JOINT_2]RESOLVER_VELOCITY_SCALE"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "67",
     "note": "setp hm2_7i97.0.resolver.02.index-divisor   [JOINT_2]RESOLVER_INDEX_DIVISOR"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "8",
     "note": "STALE companion row: 7i49 Resolver TB RES2 → z-pos-fb (Verify in cabinet)"
    },
    {
     "file": "motion_7i97t.hal",
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
   "id": "SPINDLE_ENCODER_RESERVED",
   "name": "Spindle Encoder Reserved",
   "board": "7i97T",
   "connector": "TB2",
   "channel": "encoder.03",
   "hal_net": "spindle-pos-fb",
   "direction": "ENCODER_IN",
   "direction_label": "Input (encoder)",
   "subsystem": "Spindle",
   "machine_subsystem": "Spindle feedback",
   "status": "RESERVED_VERIFY",
   "field_point": "Machine-side spindle encoder if fitted",
   "designations": [],
   "primary_source": "motion_7i97t.hal",
   "cleanup_notes": "Spindle is not resolver channel 03",
   "location": "Spindle head — machine-side A/B/Z encoder if fitted",
   "location_note": "Part number not confirmed. Tacho TGF-3D P402-Sx feeds the FR-SX loop, not LinuxCNC.",
   "expected": {
    "value": "Dynamic",
    "label": "Dynamic once fitted — encoder not identified, channel reserved",
    "basis": "motion_7i97t.hal:88-99 — spindle encoder part number not yet confirmed; resolver.03 explicitly NOT used for spindle",
    "kind": "dynamic"
   },
   "hal_state": "commented",
   "mesa_pins": [
    "hm2_7i97.0.encoder.NN.position"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 97,
     "text": "# net spindle-pos-fb   <= hm2_7i97.0.encoder.NN.position",
     "commented": true,
     "producers": [
      "hm2_7i97.0.encoder.NN.position"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "5",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "97",
     "note": "commented out — # net spindle-pos-fb   <= hm2_7i97.0.encoder.NN.position"
    },
    {
     "file": "motion_7i97t.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 5
  },
  {
   "id": "TB2_AXIS_ENCODERS",
   "name": "Tb2 Axis Encoders",
   "board": "7i97T",
   "connector": "TB2",
   "channel": "TB2.1-TB2.9",
   "hal_net": "",
   "direction": "ENCODER_IN",
   "direction_label": "Input (encoder)",
   "subsystem": "Motion",
   "machine_subsystem": "Axis feedback",
   "status": "NOT_USED",
   "field_point": "Axis encoder inputs",
   "designations": [],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Axis feedback is 7i49 resolver not quadrature encoder",
   "location": "Control cabinet — 7i97T TB2, left unlanded",
   "location_note": "Architecturally excluded: feedback is resolver via 7i49.",
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
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "6",
     "note": "Current wiring authority row"
    },
    {
     "file": "archived_wiring_map",
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
   "board": "7i97T",
   "connector": "TB3",
   "channel": "TB3.1 ENA0- and TB3.2 ENA0+",
   "hal_net": "x-enable",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Motion",
   "machine_subsystem": "Servo drives",
   "status": "COMMISSIONING_PENDING",
   "field_point": "X servo S-ON",
   "designations": [],
   "primary_source": "motion_7i97t.hal",
   "cleanup_notes": "Confirm drive terminal and enable polarity",
   "location": "Servo bay — X TRA-series servo amp, S-ON terminal",
   "location_note": "X/Y amp path via CA3/CA4 (BBIA-1 CN1/CN2)",
   "expected": {
    "value": "0",
    "label": "0 / de-energized — amp-enable-out false until machine is on",
    "basis": "motion_7i97t.hal:256-257 net x-enable ← joint.0.amp-enable-out",
    "kind": "evidenced"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i97.0.pwmgen.00.enable",
    "hm2_7i97.0.gpio.000.out"
   ],
   "producers": [
    "joint.0.amp-enable-out"
   ],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 140,
     "text": "net x-enable   => hm2_7i97.0.pwmgen.00.enable",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i97.0.pwmgen.00.enable"
     ],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 256,
     "text": "net x-enable <= joint.0.amp-enable-out",
     "commented": false,
     "producers": [
      "joint.0.amp-enable-out"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 257,
     "text": "net x-enable => hm2_7i97.0.gpio.000.out    # TB3 ENA0+ → X drive S-ON",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i97.0.gpio.000.out"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 123,
     "text": "setp hm2_7i97.0.pwmgen.00.output-type 4",
     "commented": false,
     "target": "hm2_7i97.0.pwmgen.00.output-type",
     "value": "4"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 124,
     "text": "setp hm2_7i97.0.pwmgen.00.scale       10",
     "commented": false,
     "target": "hm2_7i97.0.pwmgen.00.scale",
     "value": "10"
    }
   ],
   "stale_row": {
    "line": 30,
    "card": "7i97T",
    "conn": "TB6",
    "channel": "OUT0",
    "net": "x-enable",
    "status": "Verify in cabinet",
    "differs": true
   },
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "7",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "140",
     "note": "net x-enable   => hm2_7i97.0.pwmgen.00.enable"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "256",
     "note": "net x-enable <= joint.0.amp-enable-out"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "257",
     "note": "net x-enable => hm2_7i97.0.gpio.000.out    # TB3 ENA0+ → X drive S-ON"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "123",
     "note": "setp hm2_7i97.0.pwmgen.00.output-type 4"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "124",
     "note": "setp hm2_7i97.0.pwmgen.00.scale       10"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "30",
     "note": "STALE companion row: 7i97T TB6 OUT0 → x-enable (Verify in cabinet)"
    },
    {
     "file": "motion_7i97t.hal",
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
   "board": "7i97T",
   "connector": "TB3",
   "channel": "TB3.3 GND and TB3.4 AOUT0",
   "hal_net": "x-vel-cmd",
   "direction": "ANALOG_OUT",
   "direction_label": "Output (analog)",
   "subsystem": "Motion",
   "machine_subsystem": "Servo drives",
   "status": "COMMISSIONING_PENDING",
   "field_point": "X servo analog command",
   "designations": [],
   "primary_source": "motion_7i97t.hal",
   "cleanup_notes": "pwmgen.00 maps to X",
   "location": "Servo bay — X servo amp analog command input",
   "location_note": "Verify velocity vs torque input and polarity before enabling",
   "expected": {
    "value": "0 V",
    "label": "0 V idle — pwmgen.00 parked until enabled and commanded",
    "basis": "motion_7i97t.hal:114 — \"The pwmgen .enable pin MUST be true or the output stays parked at zero\"; 119-128 output-type 4, scale 10",
    "kind": "evidenced"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i97.0.pwmgen.00.value"
   ],
   "producers": [
    "pid.x.output"
   ],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 138,
     "text": "net x-vel-cmd  <= pid.x.output",
     "commented": false,
     "producers": [
      "pid.x.output"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 139,
     "text": "net x-vel-cmd  => hm2_7i97.0.pwmgen.00.value",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i97.0.pwmgen.00.value"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 123,
     "text": "setp hm2_7i97.0.pwmgen.00.output-type 4",
     "commented": false,
     "target": "hm2_7i97.0.pwmgen.00.output-type",
     "value": "4"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 124,
     "text": "setp hm2_7i97.0.pwmgen.00.scale       10",
     "commented": false,
     "target": "hm2_7i97.0.pwmgen.00.scale",
     "value": "10"
    }
   ],
   "stale_row": {
    "line": 2,
    "card": "7i97T",
    "conn": "Analog TB",
    "channel": "AO0",
    "net": "x-vel-cmd",
    "status": "Inferred / likely",
    "differs": true
   },
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "8",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "138",
     "note": "net x-vel-cmd  <= pid.x.output"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "139",
     "note": "net x-vel-cmd  => hm2_7i97.0.pwmgen.00.value"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "123",
     "note": "setp hm2_7i97.0.pwmgen.00.output-type 4"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "124",
     "note": "setp hm2_7i97.0.pwmgen.00.scale       10"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "2",
     "note": "STALE companion row: 7i97T Analog TB AO0 → x-vel-cmd (Inferred / likely)"
    },
    {
     "file": "motion_7i97t.hal",
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
   "board": "7i97T",
   "connector": "TB3",
   "channel": "TB3.5 ENA1- and TB3.6 ENA1+",
   "hal_net": "z-enable",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Motion",
   "machine_subsystem": "Servo drives",
   "status": "COMMISSIONING_PENDING",
   "field_point": "Z servo S-ON",
   "designations": [],
   "primary_source": "motion_7i97t.hal",
   "cleanup_notes": "Confirm drive terminal and enable polarity",
   "location": "Servo bay — Z TRA-series servo amp, S-ON terminal",
   "location_note": "Z amp path via CA1 (BBIA-1 CN3)",
   "expected": {
    "value": "0",
    "label": "0 / de-energized — amp-enable-out false until machine is on",
    "basis": "motion_7i97t.hal:262-263",
    "kind": "evidenced"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i97.0.pwmgen.01.enable",
    "hm2_7i97.0.gpio.001.out"
   ],
   "producers": [
    "joint.2.amp-enable-out"
   ],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 158,
     "text": "net z-enable   => hm2_7i97.0.pwmgen.01.enable",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i97.0.pwmgen.01.enable"
     ],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 262,
     "text": "net z-enable <= joint.2.amp-enable-out",
     "commented": false,
     "producers": [
      "joint.2.amp-enable-out"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 263,
     "text": "net z-enable => hm2_7i97.0.gpio.001.out    # TB3 ENA1+ → Z drive S-ON",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i97.0.gpio.001.out"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 125,
     "text": "setp hm2_7i97.0.pwmgen.01.output-type 4    # Z axis — TB3-8",
     "commented": false,
     "target": "hm2_7i97.0.pwmgen.01.output-type",
     "value": "4"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 126,
     "text": "setp hm2_7i97.0.pwmgen.01.scale       10",
     "commented": false,
     "target": "hm2_7i97.0.pwmgen.01.scale",
     "value": "10"
    }
   ],
   "stale_row": {
    "line": 32,
    "card": "7i97T",
    "conn": "TB6",
    "channel": "OUT2",
    "net": "z-enable",
    "status": "Verify in cabinet",
    "differs": true
   },
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "9",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "158",
     "note": "net z-enable   => hm2_7i97.0.pwmgen.01.enable"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "262",
     "note": "net z-enable <= joint.2.amp-enable-out"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "263",
     "note": "net z-enable => hm2_7i97.0.gpio.001.out    # TB3 ENA1+ → Z drive S-ON"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "125",
     "note": "setp hm2_7i97.0.pwmgen.01.output-type 4    # Z axis — TB3-8"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "126",
     "note": "setp hm2_7i97.0.pwmgen.01.scale       10"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "32",
     "note": "STALE companion row: 7i97T TB6 OUT2 → z-enable (Verify in cabinet)"
    },
    {
     "file": "motion_7i97t.hal",
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
   "board": "7i97T",
   "connector": "TB3",
   "channel": "TB3.7 GND and TB3.8 AOUT1",
   "hal_net": "z-vel-cmd",
   "direction": "ANALOG_OUT",
   "direction_label": "Output (analog)",
   "subsystem": "Motion",
   "machine_subsystem": "Servo drives",
   "status": "COMMISSIONING_PENDING",
   "field_point": "Z servo analog command",
   "designations": [],
   "primary_source": "motion_7i97t.hal",
   "cleanup_notes": "pwmgen.01 maps to Z",
   "location": "Servo bay — Z servo amp analog command input",
   "location_note": "Verify velocity vs torque input and polarity before enabling",
   "expected": {
    "value": "0 V",
    "label": "0 V idle — pwmgen.01 parked until enabled and commanded",
    "basis": "motion_7i97t.hal:114, 125-126, 157-158",
    "kind": "evidenced"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i97.0.pwmgen.01.value"
   ],
   "producers": [
    "pid.z.output"
   ],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 156,
     "text": "net z-vel-cmd  <= pid.z.output",
     "commented": false,
     "producers": [
      "pid.z.output"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 157,
     "text": "net z-vel-cmd  => hm2_7i97.0.pwmgen.01.value    # Z → pwmgen.01 (TB3-8)",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i97.0.pwmgen.01.value"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 125,
     "text": "setp hm2_7i97.0.pwmgen.01.output-type 4    # Z axis — TB3-8",
     "commented": false,
     "target": "hm2_7i97.0.pwmgen.01.output-type",
     "value": "4"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 126,
     "text": "setp hm2_7i97.0.pwmgen.01.scale       10",
     "commented": false,
     "target": "hm2_7i97.0.pwmgen.01.scale",
     "value": "10"
    }
   ],
   "stale_row": {
    "line": 4,
    "card": "7i97T",
    "conn": "Analog TB",
    "channel": "AO2",
    "net": "z-vel-cmd",
    "status": "Inferred / likely",
    "differs": true
   },
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "10",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "156",
     "note": "net z-vel-cmd  <= pid.z.output"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "157",
     "note": "net z-vel-cmd  => hm2_7i97.0.pwmgen.01.value    # Z → pwmgen.01 (TB3-8)"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "125",
     "note": "setp hm2_7i97.0.pwmgen.01.output-type 4    # Z axis — TB3-8"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "126",
     "note": "setp hm2_7i97.0.pwmgen.01.scale       10"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "4",
     "note": "STALE companion row: 7i97T Analog TB AO2 → z-vel-cmd (Inferred / likely)"
    },
    {
     "file": "motion_7i97t.hal",
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
   "board": "7i97T",
   "connector": "TB3",
   "channel": "TB3.9 ENA2- and TB3.10 ENA2+",
   "hal_net": "y-enable",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Motion",
   "machine_subsystem": "Servo drives",
   "status": "COMMISSIONING_PENDING",
   "field_point": "Y servo S-ON",
   "designations": [],
   "primary_source": "motion_7i97t.hal",
   "cleanup_notes": "Confirm drive terminal and enable polarity",
   "location": "Servo bay — Y TRA-series servo amp, S-ON terminal",
   "location_note": "X/Y amp path via CA3/CA4",
   "expected": {
    "value": "0",
    "label": "0 / de-energized — amp-enable-out false until machine is on",
    "basis": "motion_7i97t.hal:259-260",
    "kind": "evidenced"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i97.0.pwmgen.02.enable",
    "hm2_7i97.0.gpio.002.out"
   ],
   "producers": [
    "joint.1.amp-enable-out"
   ],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 149,
     "text": "net y-enable   => hm2_7i97.0.pwmgen.02.enable",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i97.0.pwmgen.02.enable"
     ],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 259,
     "text": "net y-enable <= joint.1.amp-enable-out",
     "commented": false,
     "producers": [
      "joint.1.amp-enable-out"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 260,
     "text": "net y-enable => hm2_7i97.0.gpio.002.out    # TB3 ENA2+ → Y drive S-ON",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i97.0.gpio.002.out"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 127,
     "text": "setp hm2_7i97.0.pwmgen.02.output-type 4    # Y axis — TB3-12",
     "commented": false,
     "target": "hm2_7i97.0.pwmgen.02.output-type",
     "value": "4"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 128,
     "text": "setp hm2_7i97.0.pwmgen.02.scale       10",
     "commented": false,
     "target": "hm2_7i97.0.pwmgen.02.scale",
     "value": "10"
    }
   ],
   "stale_row": {
    "line": 31,
    "card": "7i97T",
    "conn": "TB6",
    "channel": "OUT1",
    "net": "y-enable",
    "status": "Verify in cabinet",
    "differs": true
   },
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "11",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "149",
     "note": "net y-enable   => hm2_7i97.0.pwmgen.02.enable"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "259",
     "note": "net y-enable <= joint.1.amp-enable-out"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "260",
     "note": "net y-enable => hm2_7i97.0.gpio.002.out    # TB3 ENA2+ → Y drive S-ON"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "127",
     "note": "setp hm2_7i97.0.pwmgen.02.output-type 4    # Y axis — TB3-12"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "128",
     "note": "setp hm2_7i97.0.pwmgen.02.scale       10"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "31",
     "note": "STALE companion row: 7i97T TB6 OUT1 → y-enable (Verify in cabinet)"
    },
    {
     "file": "motion_7i97t.hal",
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
   "board": "7i97T",
   "connector": "TB3",
   "channel": "TB3.11 GND and TB3.12 AOUT2",
   "hal_net": "y-vel-cmd",
   "direction": "ANALOG_OUT",
   "direction_label": "Output (analog)",
   "subsystem": "Motion",
   "machine_subsystem": "Servo drives",
   "status": "COMMISSIONING_PENDING",
   "field_point": "Y servo analog command",
   "designations": [],
   "primary_source": "motion_7i97t.hal",
   "cleanup_notes": "pwmgen.02 maps to Y",
   "location": "Servo bay — Y servo amp analog command input",
   "location_note": "Verify velocity vs torque input and polarity before enabling",
   "expected": {
    "value": "0 V",
    "label": "0 V idle — pwmgen.02 parked until enabled and commanded",
    "basis": "motion_7i97t.hal:114, 127-128, 148-149",
    "kind": "evidenced"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i97.0.pwmgen.02.value"
   ],
   "producers": [
    "pid.y.output"
   ],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 147,
     "text": "net y-vel-cmd  <= pid.y.output",
     "commented": false,
     "producers": [
      "pid.y.output"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 148,
     "text": "net y-vel-cmd  => hm2_7i97.0.pwmgen.02.value    # Y → pwmgen.02 (TB3-12)",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i97.0.pwmgen.02.value"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 127,
     "text": "setp hm2_7i97.0.pwmgen.02.output-type 4    # Y axis — TB3-12",
     "commented": false,
     "target": "hm2_7i97.0.pwmgen.02.output-type",
     "value": "4"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 128,
     "text": "setp hm2_7i97.0.pwmgen.02.scale       10",
     "commented": false,
     "target": "hm2_7i97.0.pwmgen.02.scale",
     "value": "10"
    }
   ],
   "stale_row": {
    "line": 3,
    "card": "7i97T",
    "conn": "Analog TB",
    "channel": "AO1",
    "net": "y-vel-cmd",
    "status": "Inferred / likely",
    "differs": true
   },
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "12",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "147",
     "note": "net y-vel-cmd  <= pid.y.output"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "148",
     "note": "net y-vel-cmd  => hm2_7i97.0.pwmgen.02.value    # Y → pwmgen.02 (TB3-12)"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "127",
     "note": "setp hm2_7i97.0.pwmgen.02.output-type 4    # Y axis — TB3-12"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "128",
     "note": "setp hm2_7i97.0.pwmgen.02.scale       10"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "3",
     "note": "STALE companion row: 7i97T Analog TB AO1 → y-vel-cmd (Inferred / likely)"
    },
    {
     "file": "motion_7i97t.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 12
  },
  {
   "id": "SPINDLE_TB3_ENABLE_CANDIDATE",
   "name": "Spindle Tb3 Enable Candidate",
   "board": "7i97T",
   "connector": "TB3",
   "channel": "TB3.13 ENA3- and TB3.14 ENA3+",
   "hal_net": "spindle-enable",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Spindle",
   "machine_subsystem": "Spindle drive",
   "status": "HOLD_CONFLICT",
   "field_point": "VFD FWD or RUN candidate",
   "designations": [],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Conflicts with 7i84U spindle FWD REV ENA plan",
   "location": "Spindle/servo bay — Mitsubishi FR-SX, SX-IO1 board (CON1/CONA)",
   "location_note": "Conflicts with the 7i84U FWD/REV/ENA plan",
   "expected": {
    "value": "0",
    "label": "0 / de-energized — output idle unless commanded",
    "basis": "No commanding logic in the active HAL for this net; outputs default off.",
    "kind": "default-off"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i97.0.pwmgen.03.enable",
    "hm2_7i97.0.7i84.0.0.output-13"
   ],
   "producers": [
    "spindle.0.on"
   ],
   "consumers": [
    "pid.s.enable"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 174,
     "text": "#   net spindle-enable                                => pid.s.enable",
     "commented": true,
     "producers": [],
     "consumers": [
      "pid.s.enable"
     ],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 177,
     "text": "net spindle-enable => hm2_7i97.0.pwmgen.03.enable",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i97.0.pwmgen.03.enable"
     ],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 265,
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
     "line": 89,
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
     "line": 90,
     "text": "# net spindle-enable => hm2_7i97.0.7i84.0.0.output-13",
     "commented": true,
     "producers": [],
     "consumers": [
      "hm2_7i97.0.7i84.0.0.output-13"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 164,
     "text": "setp hm2_7i97.0.pwmgen.03.output-type 1",
     "commented": false,
     "target": "hm2_7i97.0.pwmgen.03.output-type",
     "value": "1"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 165,
     "text": "setp hm2_7i97.0.pwmgen.03.offset-mode 0",
     "commented": false,
     "target": "hm2_7i97.0.pwmgen.03.offset-mode",
     "value": "0"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 166,
     "text": "setp hm2_7i97.0.pwmgen.03.scale 10",
     "commented": false,
     "target": "hm2_7i97.0.pwmgen.03.scale",
     "value": "10"
    }
   ],
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "13",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "174",
     "note": "commented out — #   net spindle-enable                                => pid.s.enable"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "177",
     "note": "net spindle-enable => hm2_7i97.0.pwmgen.03.enable"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "265",
     "note": "net spindle-enable <= spindle.0.on"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "89",
     "note": "commented out — # net spindle-enable <= spindle.0.on"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "90",
     "note": "commented out — # net spindle-enable => hm2_7i97.0.7i84.0.0.output-13"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "164",
     "note": "setp hm2_7i97.0.pwmgen.03.output-type 1"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "165",
     "note": "setp hm2_7i97.0.pwmgen.03.offset-mode 0"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "166",
     "note": "setp hm2_7i97.0.pwmgen.03.scale 10"
    },
    {
     "file": "archived_wiring_map",
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
   "id": "SPINDLE_SPEED_CMD",
   "name": "Spindle Speed Cmd",
   "board": "7i97T",
   "connector": "TB3",
   "channel": "TB3.15 GND and TB3.16 AOUT3",
   "hal_net": "spindle-speed-cmd",
   "direction": "ANALOG_OUT",
   "direction_label": "Output (analog)",
   "subsystem": "Spindle",
   "machine_subsystem": "Spindle drive",
   "status": "COMMISSIONING_PENDING",
   "field_point": "FR-SX V-IN speed reference",
   "designations": [],
   "primary_source": "motion_7i97t.hal",
   "cleanup_notes": "Confirm 0-10V versus bipolar command mode",
   "location": "Spindle/servo bay — FR-SX V-IN speed reference terminal",
   "location_note": "FR-SX drawing 4143075403, PDF pg 127 of 41434WB.pdf",
   "expected": {
    "value": "0 V",
    "label": "0 V idle — unipolar reference, offset-mode 0, zero speed command",
    "basis": "motion_7i97t.hal:162-166 — offset-mode 0 (0 V at zero command), scale 10. 0-10 V vs bipolar still to be confirmed against the FR-SX.",
    "kind": "evidenced"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i97.0.pwmgen.03.value"
   ],
   "producers": [
    "spindle.0.speed-out"
   ],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 175,
     "text": "net spindle-speed-cmd <= spindle.0.speed-out",
     "commented": false,
     "producers": [
      "spindle.0.speed-out"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 176,
     "text": "net spindle-speed-cmd => hm2_7i97.0.pwmgen.03.value",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i97.0.pwmgen.03.value"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 164,
     "text": "setp hm2_7i97.0.pwmgen.03.output-type 1",
     "commented": false,
     "target": "hm2_7i97.0.pwmgen.03.output-type",
     "value": "1"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 165,
     "text": "setp hm2_7i97.0.pwmgen.03.offset-mode 0",
     "commented": false,
     "target": "hm2_7i97.0.pwmgen.03.offset-mode",
     "value": "0"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 166,
     "text": "setp hm2_7i97.0.pwmgen.03.scale 10",
     "commented": false,
     "target": "hm2_7i97.0.pwmgen.03.scale",
     "value": "10"
    }
   ],
   "stale_row": {
    "line": 5,
    "card": "7i97T",
    "conn": "Analog TB",
    "channel": "AO3",
    "net": "spindle-speed-cmd",
    "status": "Verify in cabinet",
    "differs": true
   },
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "14",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "175",
     "note": "net spindle-speed-cmd <= spindle.0.speed-out"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "176",
     "note": "net spindle-speed-cmd => hm2_7i97.0.pwmgen.03.value"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "164",
     "note": "setp hm2_7i97.0.pwmgen.03.output-type 1"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "165",
     "note": "setp hm2_7i97.0.pwmgen.03.offset-mode 0"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "166",
     "note": "setp hm2_7i97.0.pwmgen.03.scale 10"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "5",
     "note": "STALE companion row: 7i97T Analog TB AO3 → spindle-speed-cmd (Verify in cabinet)"
    },
    {
     "file": "motion_7i97t.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C3"
   ],
   "authority_line": 14
  },
  {
   "id": "SSERIAL_GND_A",
   "name": "Sserial Gnd A",
   "board": "7i97T",
   "connector": "TB4",
   "channel": "TB4.13",
   "hal_net": "",
   "direction": "LINK",
   "direction_label": "Link (smart-serial)",
   "subsystem": "Field I/O",
   "machine_subsystem": "Field I/O link",
   "status": "ACCEPTED",
   "field_point": "7i84U RJ45 pin 4 ground",
   "designations": [
    "TB-4"
   ],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Use absolute TB4 pin numbers not Phase 2 TB4.1-TB4.6",
   "location": "Control cabinet — 7i97T TB4 to 7i84U RJ45 (RS-422 smart-serial)",
   "location_note": "Use absolute TB4 pin numbers, not the Phase 2 TB4.1-TB4.6 numbering. Shield drain at the 7i97T end only.",
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
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "15",
     "note": "Current wiring authority row"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 15
  },
  {
   "id": "SSERIAL_GND_B",
   "name": "Sserial Gnd B",
   "board": "7i97T",
   "connector": "TB4",
   "channel": "TB4.14",
   "hal_net": "",
   "direction": "LINK",
   "direction_label": "Link (smart-serial)",
   "subsystem": "Field I/O",
   "machine_subsystem": "Field I/O link",
   "status": "ACCEPTED",
   "field_point": "7i84U RJ45 pin 5 ground",
   "designations": [
    "TB-4"
   ],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Shield drain to 7i97T end only",
   "location": "Control cabinet — 7i97T TB4 to 7i84U RJ45 (RS-422 smart-serial)",
   "location_note": "Use absolute TB4 pin numbers, not the Phase 2 TB4.1-TB4.6 numbering. Shield drain at the 7i97T end only.",
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
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "16",
     "note": "Current wiring authority row"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 16
  },
  {
   "id": "SSERIAL_RX_PLUS",
   "name": "Sserial Rx Plus",
   "board": "7i97T",
   "connector": "TB4",
   "channel": "TB4.15 RX+",
   "hal_net": "",
   "direction": "LINK",
   "direction_label": "Link (smart-serial)",
   "subsystem": "Field I/O",
   "machine_subsystem": "Field I/O link",
   "status": "ACCEPTED",
   "field_point": "7i84U RJ45 pin 6 TX+",
   "designations": [
    "TB-4"
   ],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "TX RX labels are from each card perspective",
   "location": "Control cabinet — 7i97T TB4 to 7i84U RJ45 (RS-422 smart-serial)",
   "location_note": "Use absolute TB4 pin numbers, not the Phase 2 TB4.1-TB4.6 numbering. Shield drain at the 7i97T end only.",
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
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "17",
     "note": "Current wiring authority row"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 17
  },
  {
   "id": "SSERIAL_RX_MINUS",
   "name": "Sserial Rx Minus",
   "board": "7i97T",
   "connector": "TB4",
   "channel": "TB4.16 RX-",
   "hal_net": "",
   "direction": "LINK",
   "direction_label": "Link (smart-serial)",
   "subsystem": "Field I/O",
   "machine_subsystem": "Field I/O link",
   "status": "ACCEPTED",
   "field_point": "7i84U RJ45 pin 3 TX-",
   "designations": [
    "TB-4"
   ],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Verify continuity before power",
   "location": "Control cabinet — 7i97T TB4 to 7i84U RJ45 (RS-422 smart-serial)",
   "location_note": "Use absolute TB4 pin numbers, not the Phase 2 TB4.1-TB4.6 numbering. Shield drain at the 7i97T end only.",
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
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "18",
     "note": "Current wiring authority row"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 18
  },
  {
   "id": "SSERIAL_TX_PLUS",
   "name": "Sserial Tx Plus",
   "board": "7i97T",
   "connector": "TB4",
   "channel": "TB4.17 TX+",
   "hal_net": "",
   "direction": "LINK",
   "direction_label": "Link (smart-serial)",
   "subsystem": "Field I/O",
   "machine_subsystem": "Field I/O link",
   "status": "ACCEPTED",
   "field_point": "7i84U RJ45 pin 2 RX+",
   "designations": [
    "TB-4"
   ],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Verify continuity before power",
   "location": "Control cabinet — 7i97T TB4 to 7i84U RJ45 (RS-422 smart-serial)",
   "location_note": "Use absolute TB4 pin numbers, not the Phase 2 TB4.1-TB4.6 numbering. Shield drain at the 7i97T end only.",
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
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "19",
     "note": "Current wiring authority row"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 19
  },
  {
   "id": "SSERIAL_TX_MINUS",
   "name": "Sserial Tx Minus",
   "board": "7i97T",
   "connector": "TB4",
   "channel": "TB4.18 TX-",
   "hal_net": "",
   "direction": "LINK",
   "direction_label": "Link (smart-serial)",
   "subsystem": "Field I/O",
   "machine_subsystem": "Field I/O link",
   "status": "ACCEPTED",
   "field_point": "7i84U RJ45 pin 1 RX-",
   "designations": [
    "TB-4"
   ],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Verify continuity before power",
   "location": "Control cabinet — 7i97T TB4 to 7i84U RJ45 (RS-422 smart-serial)",
   "location_note": "Use absolute TB4 pin numbers, not the Phase 2 TB4.1-TB4.6 numbering. Shield drain at the 7i97T end only.",
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
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "20",
     "note": "Current wiring authority row"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 20
  },
  {
   "id": "SSERIAL_5V_A",
   "name": "Sserial 5V A",
   "board": "7i97T",
   "connector": "TB4",
   "channel": "TB4.19 +5V",
   "hal_net": "",
   "direction": "LINK",
   "direction_label": "Link (smart-serial)",
   "subsystem": "Field I/O",
   "machine_subsystem": "Field I/O link",
   "status": "ACCEPTED",
   "field_point": "7i84U RJ45 pin 7 serial power",
   "designations": [
    "TB-4"
   ],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Confirm with 7i84U manual before landing",
   "location": "Control cabinet — 7i97T TB4 to 7i84U RJ45 (RS-422 smart-serial)",
   "location_note": "Use absolute TB4 pin numbers, not the Phase 2 TB4.1-TB4.6 numbering. Shield drain at the 7i97T end only.",
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
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "21",
     "note": "Current wiring authority row"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 21
  },
  {
   "id": "SSERIAL_5V_B",
   "name": "Sserial 5V B",
   "board": "7i97T",
   "connector": "TB4",
   "channel": "TB4.20 +5V",
   "hal_net": "",
   "direction": "LINK",
   "direction_label": "Link (smart-serial)",
   "subsystem": "Field I/O",
   "machine_subsystem": "Field I/O link",
   "status": "ACCEPTED",
   "field_point": "7i84U RJ45 pin 8 serial power",
   "designations": [
    "TB-4"
   ],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Confirm with 7i84U manual before landing",
   "location": "Control cabinet — 7i97T TB4 to 7i84U RJ45 (RS-422 smart-serial)",
   "location_note": "Use absolute TB4 pin numbers, not the Phase 2 TB4.1-TB4.6 numbering. Shield drain at the 7i97T end only.",
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
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "22",
     "note": "Current wiring authority row"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 22
  },
  {
   "id": "X_LIMIT_PLUS",
   "name": "X Limit Plus",
   "board": "7i97T",
   "connector": "TB5",
   "channel": "TB5.1 IN0 gpio.008",
   "hal_net": "limit-x-plus",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Axis safety",
   "machine_subsystem": "Axis overtravel",
   "status": "ACCEPTED_VERIFY",
   "field_point": "X positive overtravel limit",
   "designations": [
    "OT+X"
   ],
   "primary_source": "motion_7i97t.hal",
   "cleanup_notes": "signal_map.csv old row is stale",
   "location": "X axis way — positive overtravel switch",
   "location_note": "OT+X",
   "expected": {
    "value": "0",
    "label": "Logic 0 — switch closed (not tripped), inverted in HAL",
    "basis": "motion_7i97t.hal:197-204 — \"Limit switches are NC: invert_input so open (tripped) = logic 1\"; setp hm2_7i97.0.gpio.0NN.invert_input 1",
    "kind": "evidenced"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i97.0.gpio.008.in"
   ],
   "producers": [],
   "consumers": [
    "joint.0.pos-lim-sw-in"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 206,
     "text": "net limit-x-plus  <= hm2_7i97.0.gpio.008.in",
     "commented": false,
     "producers": [
      "hm2_7i97.0.gpio.008.in"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 207,
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
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 199,
     "text": "setp hm2_7i97.0.gpio.008.invert_input  1   # X_POS_LIM (NC)",
     "commented": false,
     "target": "hm2_7i97.0.gpio.008.invert_input",
     "value": "1"
    }
   ],
   "stale_row": {
    "line": 11,
    "card": "7i97T",
    "conn": "TB5",
    "channel": "IN1",
    "net": "limit-x-plus",
    "status": "Verify in cabinet",
    "differs": true
   },
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "23",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "206",
     "note": "net limit-x-plus  <= hm2_7i97.0.gpio.008.in"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "207",
     "note": "net limit-x-plus  => joint.0.pos-lim-sw-in"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "199",
     "note": "setp hm2_7i97.0.gpio.008.invert_input  1   # X_POS_LIM (NC)"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "11",
     "note": "STALE companion row: 7i97T TB5 IN1 → limit-x-plus (Verify in cabinet)"
    },
    {
     "file": "motion_7i97t.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C6",
    "C8"
   ],
   "authority_line": 23
  },
  {
   "id": "X_LIMIT_MINUS",
   "name": "X Limit Minus",
   "board": "7i97T",
   "connector": "TB5",
   "channel": "TB5.2 IN1 gpio.009",
   "hal_net": "limit-x-minus",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Axis safety",
   "machine_subsystem": "Axis overtravel",
   "status": "ACCEPTED_VERIFY",
   "field_point": "X negative overtravel limit",
   "designations": [
    "OT-X"
   ],
   "primary_source": "motion_7i97t.hal",
   "cleanup_notes": "signal_map.csv old row is stale",
   "location": "X axis way — negative overtravel switch",
   "location_note": "OT-X",
   "expected": {
    "value": "0",
    "label": "Logic 0 — switch closed (not tripped), inverted in HAL",
    "basis": "motion_7i97t.hal:197-204 — \"Limit switches are NC: invert_input so open (tripped) = logic 1\"; setp hm2_7i97.0.gpio.0NN.invert_input 1",
    "kind": "evidenced"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i97.0.gpio.009.in"
   ],
   "producers": [],
   "consumers": [
    "joint.0.neg-lim-sw-in"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 209,
     "text": "net limit-x-minus <= hm2_7i97.0.gpio.009.in",
     "commented": false,
     "producers": [
      "hm2_7i97.0.gpio.009.in"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 210,
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
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 200,
     "text": "setp hm2_7i97.0.gpio.009.invert_input  1   # X_NEG_LIM (NC)",
     "commented": false,
     "target": "hm2_7i97.0.gpio.009.invert_input",
     "value": "1"
    }
   ],
   "stale_row": {
    "line": 12,
    "card": "7i97T",
    "conn": "TB5",
    "channel": "IN2",
    "net": "limit-x-minus",
    "status": "Verify in cabinet",
    "differs": true
   },
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "24",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "209",
     "note": "net limit-x-minus <= hm2_7i97.0.gpio.009.in"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "210",
     "note": "net limit-x-minus => joint.0.neg-lim-sw-in"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "200",
     "note": "setp hm2_7i97.0.gpio.009.invert_input  1   # X_NEG_LIM (NC)"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "12",
     "note": "STALE companion row: 7i97T TB5 IN2 → limit-x-minus (Verify in cabinet)"
    },
    {
     "file": "motion_7i97t.hal",
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
   "id": "Y_LIMIT_PLUS",
   "name": "Y Limit Plus",
   "board": "7i97T",
   "connector": "TB5",
   "channel": "TB5.3 IN2 gpio.010",
   "hal_net": "limit-y-plus",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Axis safety",
   "machine_subsystem": "Axis overtravel",
   "status": "ACCEPTED_VERIFY",
   "field_point": "Y positive overtravel limit",
   "designations": [
    "OT+Y"
   ],
   "primary_source": "motion_7i97t.hal",
   "cleanup_notes": "signal_map.csv old row is stale",
   "location": "Y axis way — positive overtravel switch",
   "location_note": "OT+Y",
   "expected": {
    "value": "0",
    "label": "Logic 0 — switch closed (not tripped), inverted in HAL",
    "basis": "motion_7i97t.hal:197-204 — \"Limit switches are NC: invert_input so open (tripped) = logic 1\"; setp hm2_7i97.0.gpio.0NN.invert_input 1",
    "kind": "evidenced"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i97.0.gpio.010.in"
   ],
   "producers": [],
   "consumers": [
    "joint.1.pos-lim-sw-in"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 212,
     "text": "net limit-y-plus  <= hm2_7i97.0.gpio.010.in",
     "commented": false,
     "producers": [
      "hm2_7i97.0.gpio.010.in"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 213,
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
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 201,
     "text": "setp hm2_7i97.0.gpio.010.invert_input  1   # Y_POS_LIM (NC)",
     "commented": false,
     "target": "hm2_7i97.0.gpio.010.invert_input",
     "value": "1"
    }
   ],
   "stale_row": {
    "line": 14,
    "card": "7i97T",
    "conn": "TB5",
    "channel": "IN4",
    "net": "limit-y-plus",
    "status": "Verify in cabinet",
    "differs": true
   },
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "25",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "212",
     "note": "net limit-y-plus  <= hm2_7i97.0.gpio.010.in"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "213",
     "note": "net limit-y-plus  => joint.1.pos-lim-sw-in"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "201",
     "note": "setp hm2_7i97.0.gpio.010.invert_input  1   # Y_POS_LIM (NC)"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "14",
     "note": "STALE companion row: 7i97T TB5 IN4 → limit-y-plus (Verify in cabinet)"
    },
    {
     "file": "motion_7i97t.hal",
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
   "id": "Y_LIMIT_MINUS",
   "name": "Y Limit Minus",
   "board": "7i97T",
   "connector": "TB5",
   "channel": "TB5.4 IN3 gpio.011",
   "hal_net": "limit-y-minus",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Axis safety",
   "machine_subsystem": "Axis overtravel",
   "status": "ACCEPTED_VERIFY",
   "field_point": "Y negative overtravel limit",
   "designations": [
    "OT-Y"
   ],
   "primary_source": "motion_7i97t.hal",
   "cleanup_notes": "signal_map.csv old row is stale",
   "location": "Y axis way — negative overtravel switch",
   "location_note": "OT-Y",
   "expected": {
    "value": "0",
    "label": "Logic 0 — switch closed (not tripped), inverted in HAL",
    "basis": "motion_7i97t.hal:197-204 — \"Limit switches are NC: invert_input so open (tripped) = logic 1\"; setp hm2_7i97.0.gpio.0NN.invert_input 1",
    "kind": "evidenced"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i97.0.gpio.011.in"
   ],
   "producers": [],
   "consumers": [
    "joint.1.neg-lim-sw-in"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 215,
     "text": "net limit-y-minus <= hm2_7i97.0.gpio.011.in",
     "commented": false,
     "producers": [
      "hm2_7i97.0.gpio.011.in"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 216,
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
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 202,
     "text": "setp hm2_7i97.0.gpio.011.invert_input  1   # Y_NEG_LIM (NC)",
     "commented": false,
     "target": "hm2_7i97.0.gpio.011.invert_input",
     "value": "1"
    }
   ],
   "stale_row": {
    "line": 15,
    "card": "7i97T",
    "conn": "TB5",
    "channel": "IN5",
    "net": "limit-y-minus",
    "status": "Verify in cabinet",
    "differs": true
   },
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "26",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "215",
     "note": "net limit-y-minus <= hm2_7i97.0.gpio.011.in"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "216",
     "note": "net limit-y-minus => joint.1.neg-lim-sw-in"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "202",
     "note": "setp hm2_7i97.0.gpio.011.invert_input  1   # Y_NEG_LIM (NC)"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "15",
     "note": "STALE companion row: 7i97T TB5 IN5 → limit-y-minus (Verify in cabinet)"
    },
    {
     "file": "motion_7i97t.hal",
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
   "id": "Z_LIMIT_PLUS",
   "name": "Z Limit Plus",
   "board": "7i97T",
   "connector": "TB5",
   "channel": "TB5.5 IN4 gpio.012",
   "hal_net": "limit-z-plus",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Axis safety",
   "machine_subsystem": "Axis overtravel",
   "status": "ACCEPTED_VERIFY",
   "field_point": "Z positive overtravel limit",
   "designations": [
    "OT+Z"
   ],
   "primary_source": "motion_7i97t.hal",
   "cleanup_notes": "signal_map.csv old row is stale",
   "location": "Z axis way — positive overtravel switch",
   "location_note": "OT+Z",
   "expected": {
    "value": "0",
    "label": "Logic 0 — switch closed (not tripped), inverted in HAL",
    "basis": "motion_7i97t.hal:197-204 — \"Limit switches are NC: invert_input so open (tripped) = logic 1\"; setp hm2_7i97.0.gpio.0NN.invert_input 1",
    "kind": "evidenced"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i97.0.gpio.012.in"
   ],
   "producers": [],
   "consumers": [
    "joint.2.pos-lim-sw-in"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 218,
     "text": "net limit-z-plus  <= hm2_7i97.0.gpio.012.in",
     "commented": false,
     "producers": [
      "hm2_7i97.0.gpio.012.in"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 219,
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
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 203,
     "text": "setp hm2_7i97.0.gpio.012.invert_input  1   # Z_POS_LIM (NC)",
     "commented": false,
     "target": "hm2_7i97.0.gpio.012.invert_input",
     "value": "1"
    }
   ],
   "stale_row": {
    "line": 17,
    "card": "7i97T",
    "conn": "TB5",
    "channel": "IN7",
    "net": "limit-z-plus",
    "status": "Verify in cabinet",
    "differs": true
   },
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "27",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "218",
     "note": "net limit-z-plus  <= hm2_7i97.0.gpio.012.in"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "219",
     "note": "net limit-z-plus  => joint.2.pos-lim-sw-in"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "203",
     "note": "setp hm2_7i97.0.gpio.012.invert_input  1   # Z_POS_LIM (NC)"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "17",
     "note": "STALE companion row: 7i97T TB5 IN7 → limit-z-plus (Verify in cabinet)"
    },
    {
     "file": "motion_7i97t.hal",
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
   "id": "Z_LIMIT_MINUS",
   "name": "Z Limit Minus",
   "board": "7i97T",
   "connector": "TB5",
   "channel": "TB5.6 IN5 gpio.013",
   "hal_net": "limit-z-minus",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Axis safety",
   "machine_subsystem": "Axis overtravel",
   "status": "ACCEPTED_VERIFY",
   "field_point": "Z negative overtravel limit",
   "designations": [
    "OT-Z"
   ],
   "primary_source": "motion_7i97t.hal",
   "cleanup_notes": "signal_map.csv old row is stale",
   "location": "Z axis way — negative overtravel switch",
   "location_note": "OT-Z",
   "expected": {
    "value": "0",
    "label": "Logic 0 — switch closed (not tripped), inverted in HAL",
    "basis": "motion_7i97t.hal:197-204 — \"Limit switches are NC: invert_input so open (tripped) = logic 1\"; setp hm2_7i97.0.gpio.0NN.invert_input 1",
    "kind": "evidenced"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i97.0.gpio.013.in"
   ],
   "producers": [],
   "consumers": [
    "joint.2.neg-lim-sw-in"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 221,
     "text": "net limit-z-minus <= hm2_7i97.0.gpio.013.in",
     "commented": false,
     "producers": [
      "hm2_7i97.0.gpio.013.in"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 222,
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
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 204,
     "text": "setp hm2_7i97.0.gpio.013.invert_input  1   # Z_NEG_LIM (NC)",
     "commented": false,
     "target": "hm2_7i97.0.gpio.013.invert_input",
     "value": "1"
    }
   ],
   "stale_row": {
    "line": 18,
    "card": "7i97T",
    "conn": "TB5",
    "channel": "IN8",
    "net": "limit-z-minus",
    "status": "Verify in cabinet",
    "differs": true
   },
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "28",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "221",
     "note": "net limit-z-minus <= hm2_7i97.0.gpio.013.in"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "222",
     "note": "net limit-z-minus => joint.2.neg-lim-sw-in"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "204",
     "note": "setp hm2_7i97.0.gpio.013.invert_input  1   # Z_NEG_LIM (NC)"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "18",
     "note": "STALE companion row: 7i97T TB5 IN8 → limit-z-minus (Verify in cabinet)"
    },
    {
     "file": "motion_7i97t.hal",
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
   "id": "X_HOME",
   "name": "X Home",
   "board": "7i97T",
   "connector": "TB5",
   "channel": "TB5.7 IN6 gpio.014",
   "hal_net": "home-x",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Axis safety",
   "machine_subsystem": "Axis homing",
   "status": "ACCEPTED_VERIFY",
   "field_point": "X home switch",
   "designations": [
    "LS-42"
   ],
   "primary_source": "motion_7i97t.hal",
   "cleanup_notes": "signal_map.csv old row is stale",
   "location": "X axis — zero-return switch",
   "location_note": "LS-42 (axis 1 zero return; which axis still to be cross-referenced)",
   "expected": {
    "value": "0",
    "label": "Logic 0 — NO switch, carriage off the home target",
    "basis": "motion_7i97t.hal:198 — \"Home switches are NO: no invert needed\"; no invert_input setp for gpio.014-016",
    "kind": "evidenced"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i97.0.gpio.014.in"
   ],
   "producers": [],
   "consumers": [
    "joint.0.home-sw-in"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 224,
     "text": "net home-x <= hm2_7i97.0.gpio.014.in",
     "commented": false,
     "producers": [
      "hm2_7i97.0.gpio.014.in"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 225,
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
   "stale_row": {
    "line": 10,
    "card": "7i97T",
    "conn": "TB5",
    "channel": "IN0",
    "net": "home-x",
    "status": "Confirmed from notes",
    "differs": true
   },
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "29",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "224",
     "note": "net home-x <= hm2_7i97.0.gpio.014.in"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "225",
     "note": "net home-x => joint.0.home-sw-in"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "10",
     "note": "STALE companion row: 7i97T TB5 IN0 → home-x (Confirmed from notes)"
    },
    {
     "file": "motion_7i97t.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C6",
    "C8"
   ],
   "authority_line": 29
  },
  {
   "id": "Y_HOME",
   "name": "Y Home",
   "board": "7i97T",
   "connector": "TB5",
   "channel": "TB5.8 IN7 gpio.015",
   "hal_net": "home-y",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Axis safety",
   "machine_subsystem": "Axis homing",
   "status": "ACCEPTED_VERIFY",
   "field_point": "Y home switch",
   "designations": [
    "LS-52"
   ],
   "primary_source": "motion_7i97t.hal",
   "cleanup_notes": "signal_map.csv old row is stale",
   "location": "Y axis — zero-return switch",
   "location_note": "LS-52 (axis 2 zero return; which axis still to be cross-referenced)",
   "expected": {
    "value": "0",
    "label": "Logic 0 — NO switch, carriage off the home target",
    "basis": "motion_7i97t.hal:198 — \"Home switches are NO: no invert needed\"; no invert_input setp for gpio.014-016",
    "kind": "evidenced"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i97.0.gpio.015.in"
   ],
   "producers": [],
   "consumers": [
    "joint.1.home-sw-in"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 227,
     "text": "net home-y <= hm2_7i97.0.gpio.015.in",
     "commented": false,
     "producers": [
      "hm2_7i97.0.gpio.015.in"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 228,
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
   "stale_row": {
    "line": 13,
    "card": "7i97T",
    "conn": "TB5",
    "channel": "IN3",
    "net": "home-y",
    "status": "Confirmed from notes",
    "differs": true
   },
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "30",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "227",
     "note": "net home-y <= hm2_7i97.0.gpio.015.in"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "228",
     "note": "net home-y => joint.1.home-sw-in"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "13",
     "note": "STALE companion row: 7i97T TB5 IN3 → home-y (Confirmed from notes)"
    },
    {
     "file": "motion_7i97t.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C6",
    "C8"
   ],
   "authority_line": 30
  },
  {
   "id": "Z_HOME",
   "name": "Z Home",
   "board": "7i97T",
   "connector": "TB5",
   "channel": "TB5.9 IN8 gpio.016",
   "hal_net": "home-z",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Axis safety",
   "machine_subsystem": "Axis homing",
   "status": "ACCEPTED_VERIFY",
   "field_point": "Z home switch",
   "designations": [
    "LS-62",
    "TB-51"
   ],
   "primary_source": "motion_7i97t.hal",
   "cleanup_notes": "signal_map.csv old row is stale",
   "location": "Z axis — zero-return switch",
   "location_note": "LS-62 — confirmed as Z zero return on the TB-51 diagram (pg 100)",
   "expected": {
    "value": "0",
    "label": "Logic 0 — NO switch, carriage off the home target",
    "basis": "motion_7i97t.hal:198 — \"Home switches are NO: no invert needed\"; no invert_input setp for gpio.014-016",
    "kind": "evidenced"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i97.0.gpio.016.in"
   ],
   "producers": [],
   "consumers": [
    "joint.2.home-sw-in"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 230,
     "text": "net home-z <= hm2_7i97.0.gpio.016.in",
     "commented": false,
     "producers": [
      "hm2_7i97.0.gpio.016.in"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 231,
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
   "stale_row": {
    "line": 16,
    "card": "7i97T",
    "conn": "TB5",
    "channel": "IN6",
    "net": "home-z",
    "status": "Confirmed from notes",
    "differs": true
   },
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "31",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "230",
     "note": "net home-z <= hm2_7i97.0.gpio.016.in"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "231",
     "note": "net home-z => joint.2.home-sw-in"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "16",
     "note": "STALE companion row: 7i97T TB5 IN6 → home-z (Confirmed from notes)"
    },
    {
     "file": "motion_7i97t.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C6",
    "C8"
   ],
   "authority_line": 31
  },
  {
   "id": "ESTOP_CHAIN",
   "name": "Estop Chain",
   "board": "7i97T",
   "connector": "TB5",
   "channel": "TB5.10 IN9 gpio.017",
   "hal_net": "estop-ext",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Safety",
   "machine_subsystem": "Safety chain",
   "status": "ACCEPTED_VERIFY",
   "field_point": "External E-stop chain monitor",
   "designations": [
    "DS-1",
    "DS-2"
   ],
   "primary_source": "motion_7i97t.hal",
   "cleanup_notes": "Hardware safety chain must still remove hazardous power",
   "location": "Hardwired E-stop relay chain — status contact only",
   "location_note": "Operating Panel A & B E-stop pushbuttons (AH25-P182A); DS-1/DS-2 door relay sits ahead of the main contactor",
   "expected": {
    "value": "0",
    "label": "Logic 0 — safety chain closed / healthy, after inversion",
    "basis": "motion_7i97t.hal:239-245 — \"invert_input=1: chain closed (24V, normal) → in=0; chain open (fault) → in=1\"; net estop-ext → estop-latch.0.fault-in",
    "kind": "evidenced"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i97.0.gpio.017.in"
   ],
   "producers": [],
   "consumers": [
    "estop-latch.0.fault-in"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 245,
     "text": "net estop-ext    hm2_7i97.0.gpio.017.in          =>  estop-latch.0.fault-in",
     "commented": false,
     "producers": [
      "hm2_7i97.0.gpio.017.in"
     ],
     "consumers": [
      "estop-latch.0.fault-in"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 242,
     "text": "setp hm2_7i97.0.gpio.017.invert_input    1",
     "commented": false,
     "target": "hm2_7i97.0.gpio.017.invert_input",
     "value": "1"
    }
   ],
   "stale_row": {
    "line": 23,
    "card": "7i97T",
    "conn": "TB5",
    "channel": "IN13",
    "net": "estop-ext",
    "status": "Verify in cabinet",
    "differs": true
   },
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "32",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "245",
     "note": "net estop-ext    hm2_7i97.0.gpio.017.in          =>  estop-latch.0.fault-in"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "242",
     "note": "setp hm2_7i97.0.gpio.017.invert_input    1"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "23",
     "note": "STALE companion row: 7i97T TB5 IN13 → estop-ext (Verify in cabinet)"
    },
    {
     "file": "motion_7i97t.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C6",
    "C8"
   ],
   "authority_line": 32
  },
  {
   "id": "TB5_FIELD_GND",
   "name": "Tb5 Field Gnd",
   "board": "7i97T",
   "connector": "TB5",
   "channel": "TB5.11 GND",
   "hal_net": "",
   "direction": "POWER",
   "direction_label": "Power / common",
   "subsystem": "Power",
   "machine_subsystem": "Field power",
   "status": "COMMISSIONING_PENDING",
   "field_point": "24V field common",
   "designations": [],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Confirm field common and fusing",
   "location": "Control cabinet — G24 common bus",
   "location_note": "HR-11F-24 supply: +S / + / - / -S / TOG / CNT / FG",
   "expected": {
    "value": "n/a",
    "label": "Power common — not a logic signal",
    "basis": "current_pin_authority.csv:33",
    "kind": "na"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "33",
     "note": "Current wiring authority row"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 33
  },
  {
   "id": "TB5_FIELD_24V",
   "name": "Tb5 Field 24V",
   "board": "7i97T",
   "connector": "TB5",
   "channel": "TB5.12 +VFIELD",
   "hal_net": "",
   "direction": "POWER",
   "direction_label": "Power / common",
   "subsystem": "Power",
   "machine_subsystem": "Field power",
   "status": "COMMISSIONING_PENDING",
   "field_point": "24V field supply",
   "designations": [],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Confirm supply capacity and fusing",
   "location": "Control cabinet — P24 distribution",
   "location_note": "HR-11F-24 supply and branch fusing to trace",
   "expected": {
    "value": "24 V",
    "label": "Field supply rail — confirm capacity and fusing",
    "basis": "current_pin_authority.csv:34",
    "kind": "na"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "34",
     "note": "Current wiring authority row"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 34
  },
  {
   "id": "AIR_BLAST",
   "name": "Air Blast",
   "board": "7i97T",
   "connector": "TB5 SSR",
   "channel": "TB5.13-TB5.14 SSR OUT0 gpio.020",
   "hal_net": "air-blast",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Air",
   "machine_subsystem": "Pneumatics",
   "status": "COMMISSIONING_PENDING",
   "field_point": "SOL-62 via RLY-5",
   "designations": [
    "SOL-62",
    "RLY-5"
   ],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Overflow output using relay for 100VAC coil",
   "location": "Solenoid valve bank — SOL-62 via relay RLY-5",
   "location_note": "100 VAC coil — relay required",
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
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "35",
     "note": "Current wiring authority row"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C6"
   ],
   "authority_line": 35
  },
  {
   "id": "TOUCH_SENSOR_BLAST",
   "name": "Touch Sensor Blast",
   "board": "7i97T",
   "connector": "TB5 SSR",
   "channel": "TB5.15-TB5.16 SSR OUT1 gpio.021",
   "hal_net": "touch-sensor-blast",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Air",
   "machine_subsystem": "Pneumatics",
   "status": "COMMISSIONING_PENDING",
   "field_point": "SOL-35 via RLY-6",
   "designations": [
    "SOL-35",
    "RLY-6",
    "TB-51"
   ],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Overflow output using relay for 100VAC coil",
   "location": "Solenoid valve bank — SOL-35 via relay RLY-6",
   "location_note": "SOL-35 = \"Dust Inhale Eliminate\" per connector_crossref.md:52 / TB-51 diagram",
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
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "36",
     "note": "Current wiring authority row"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C6"
   ],
   "authority_line": 36
  },
  {
   "id": "TAP_COOLANT_BLAST",
   "name": "Tap Coolant Blast",
   "board": "7i97T",
   "connector": "TB5 SSR",
   "channel": "TB5.17-TB5.18 SSR OUT2 gpio.022",
   "hal_net": "tap-coolant-blast",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Coolant",
   "machine_subsystem": "Coolant",
   "status": "COMMISSIONING_PENDING",
   "field_point": "SOL-61 via RLY-7",
   "designations": [
    "SOL-61",
    "RLY-7",
    "TB-51"
   ],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Overflow output using relay for 100VAC coil",
   "location": "Solenoid valve bank — SOL-61 via relay RLY-7",
   "location_note": "SOL-61 = Air jet on the TB-51 diagram",
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
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "37",
     "note": "Current wiring authority row"
    },
    {
     "file": "archived_wiring_map",
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
   "id": "ATC_BARRIER_SOL",
   "name": "Atc Barrier Sol",
   "board": "7i97T",
   "connector": "TB5 SSR",
   "channel": "TB5.19-TB5.20 SSR OUT3 gpio.023",
   "hal_net": "atc-barrier",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "ATC interlock",
   "machine_subsystem": "ATC interlock",
   "status": "PROPOSED",
   "field_point": "ATC barrier expand solenoid (PLC Y095 TCME.M)",
   "designations": [],
   "primary_source": "element_list_crosswalk_2026-07-27",
   "cleanup_notes": "Verify device exists on SN 060231; relay if 100VAC coil",
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
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "38",
     "note": "Current wiring authority row"
    },
    {
     "file": "element_list_crosswalk_2026-07-27",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 38
  },
  {
   "id": "FLOOD_VALVE",
   "name": "Flood Valve",
   "board": "7i97T",
   "connector": "TB5 SSR",
   "channel": "TB5.21-TB5.22 SSR OUT4 gpio.024",
   "hal_net": "flood-valve",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Coolant",
   "machine_subsystem": "Coolant",
   "status": "PROPOSED",
   "field_point": "Flood coolant valve, separate from pump motor (PLC Y011 FCL)",
   "designations": [],
   "primary_source": "element_list_crosswalk_2026-07-27",
   "cleanup_notes": "Verify valve SOL number in parts list pp.85-91; may share COOLANT_ON if always together",
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
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "39",
     "note": "Current wiring authority row"
    },
    {
     "file": "element_list_crosswalk_2026-07-27",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 39
  },
  {
   "id": "TB5_SSR_OUT5_SPARE",
   "name": "Tb5 Ssr Out5 Spare",
   "board": "7i97T",
   "connector": "TB5 SSR",
   "channel": "TB5.23-TB5.24 SSR OUT5 gpio.025",
   "hal_net": "",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Spare",
   "machine_subsystem": "Spare",
   "status": "SPARE",
   "field_point": "Spare SSR output",
   "designations": [],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Last spare output - reserved for SSET (Y092) or through-hole coolant (Y012) pending ladder check",
   "location": "Control cabinet — 7i97T TB5 SSR bank, unlanded",
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
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "40",
     "note": "Current wiring authority row"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 40
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
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "41",
     "note": "Current wiring authority row"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 41
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
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "42",
     "note": "Current wiring authority row"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 42
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
    "hm2_7i97.0.7i84.0.0.input-02"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 15,
     "text": "net atc-y-zone <= hm2_7i97.0.7i84.0.0.input-02",
     "commented": false,
     "producers": [
      "hm2_7i97.0.7i84.0.0.input-02"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "stale_row": {
    "line": 40,
    "card": "7i84U",
    "conn": "TB1",
    "channel": "IN2",
    "net": "atc-y-zone",
    "status": "Verify in cabinet",
    "differs": true
   },
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "43",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "15",
     "note": "net atc-y-zone <= hm2_7i97.0.7i84.0.0.input-02"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "40",
     "note": "STALE companion row: 7i84U TB1 IN2 → atc-y-zone (Verify in cabinet)"
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
   "authority_line": 43
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
    "hm2_7i97.0.7i84.0.0.input-03"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 16,
     "text": "net atc-z-zone <= hm2_7i97.0.7i84.0.0.input-03",
     "commented": false,
     "producers": [
      "hm2_7i97.0.7i84.0.0.input-03"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "stale_row": {
    "line": 41,
    "card": "7i84U",
    "conn": "TB1",
    "channel": "IN3",
    "net": "atc-z-zone",
    "status": "Verify in cabinet",
    "differs": true
   },
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "44",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "16",
     "note": "net atc-z-zone <= hm2_7i97.0.7i84.0.0.input-03"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "41",
     "note": "STALE companion row: 7i84U TB1 IN3 → atc-z-zone (Verify in cabinet)"
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
   "authority_line": 44
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
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "45",
     "note": "Current wiring authority row"
    },
    {
     "file": "phase2_plan",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 45
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
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "46",
     "note": "Current wiring authority row"
    },
    {
     "file": "phase2_plan",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 46
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
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "47",
     "note": "Current wiring authority row"
    },
    {
     "file": "element_list_crosswalk_2026-07-27",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 47
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
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "48",
     "note": "Current wiring authority row"
    },
    {
     "file": "element_list_crosswalk_2026-07-27",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 48
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
   "stale_row": null,
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
   "stale_row": null,
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
   "primary_source": "element_list_crosswalk_2026-07-27",
   "cleanup_notes": "Seriesed NC contacts to save an input; alarm-only, not E-stop chain",
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
   "stale_row": null,
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
   "cleanup_notes": "Commissioning aid; TCFS (X01B) deferred - no spare input left",
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
   "stale_row": null,
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
    "hm2_7i97.0.7i84.0.0.input-12"
   ],
   "producers": [],
   "consumers": [
    "joint.0.amp-fault-in"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 34,
     "text": "net x-drive-fault <= hm2_7i97.0.7i84.0.0.input-12",
     "commented": false,
     "producers": [
      "hm2_7i97.0.7i84.0.0.input-12"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 35,
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
   "stale_row": {
    "line": 19,
    "card": "7i97T",
    "conn": "TB5",
    "channel": "IN9",
    "net": "x-drive-fault",
    "status": "Verify in cabinet",
    "differs": true
   },
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "53",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "34",
     "note": "net x-drive-fault <= hm2_7i97.0.7i84.0.0.input-12"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "35",
     "note": "net x-drive-fault => joint.0.amp-fault-in"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "19",
     "note": "STALE companion row: 7i97T TB5 IN9 → x-drive-fault (Verify in cabinet)"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C1",
    "C8"
   ],
   "authority_line": 53
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
    "hm2_7i97.0.7i84.0.0.input-13"
   ],
   "producers": [],
   "consumers": [
    "joint.1.amp-fault-in"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 36,
     "text": "net y-drive-fault <= hm2_7i97.0.7i84.0.0.input-13",
     "commented": false,
     "producers": [
      "hm2_7i97.0.7i84.0.0.input-13"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 37,
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
   "stale_row": {
    "line": 20,
    "card": "7i97T",
    "conn": "TB5",
    "channel": "IN10",
    "net": "y-drive-fault",
    "status": "Verify in cabinet",
    "differs": true
   },
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "54",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "36",
     "note": "net y-drive-fault <= hm2_7i97.0.7i84.0.0.input-13"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "37",
     "note": "net y-drive-fault => joint.1.amp-fault-in"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "20",
     "note": "STALE companion row: 7i97T TB5 IN10 → y-drive-fault (Verify in cabinet)"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C1",
    "C8"
   ],
   "authority_line": 54
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
    "hm2_7i97.0.7i84.0.0.input-14"
   ],
   "producers": [],
   "consumers": [
    "joint.2.amp-fault-in"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 38,
     "text": "net z-drive-fault <= hm2_7i97.0.7i84.0.0.input-14",
     "commented": false,
     "producers": [
      "hm2_7i97.0.7i84.0.0.input-14"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 39,
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
   "stale_row": {
    "line": 21,
    "card": "7i97T",
    "conn": "TB5",
    "channel": "IN11",
    "net": "z-drive-fault",
    "status": "Verify in cabinet",
    "differs": true
   },
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "55",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "38",
     "note": "net z-drive-fault <= hm2_7i97.0.7i84.0.0.input-14"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "39",
     "note": "net z-drive-fault => joint.2.amp-fault-in"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "21",
     "note": "STALE companion row: 7i97T TB5 IN11 → z-drive-fault (Verify in cabinet)"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C1",
    "C8"
   ],
   "authority_line": 55
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
    "basis": "motion_7i97t.hal:102-103 — \"Until encoder is wired, spindle-at-speed is forced true (open-loop, no speed verification)\": sets spindle-at-speed true. current_pin_authority.csv:56 allocates a real 7i84U IN13 for it.",
    "kind": "conflict"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 103,
     "text": "sets spindle-at-speed true",
     "commented": false,
     "target": "spindle-at-speed",
     "value": "true"
    }
   ],
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "56",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "103",
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
   "authority_line": 56
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
    "hm2_7i97.0.7i84.0.0.input-16"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 43,
     "text": "# net spindle-fault     <= hm2_7i97.0.7i84.0.0.input-16",
     "commented": true,
     "producers": [
      "hm2_7i97.0.7i84.0.0.input-16"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "stale_row": {
    "line": 22,
    "card": "7i97T",
    "conn": "TB5",
    "channel": "IN12",
    "net": "spindle-fault",
    "status": "Verify in cabinet",
    "differs": true
   },
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "57",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "43",
     "note": "commented out — # net spindle-fault     <= hm2_7i97.0.7i84.0.0.input-16"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "22",
     "note": "STALE companion row: 7i97T TB5 IN12 → spindle-fault (Verify in cabinet)"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 57
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
    "hm2_7i97.0.7i84.0.0.input-00"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 12,
     "text": "net tool-clamped <= hm2_7i97.0.7i84.0.0.input-00",
     "commented": false,
     "producers": [
      "hm2_7i97.0.7i84.0.0.input-00"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "58",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "12",
     "note": "net tool-clamped <= hm2_7i97.0.7i84.0.0.input-00"
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
   "authority_line": 58
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
    "hm2_7i97.0.7i84.0.0.input-01"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 13,
     "text": "net tool-unclamped <= hm2_7i97.0.7i84.0.0.input-01",
     "commented": false,
     "producers": [
      "hm2_7i97.0.7i84.0.0.input-01"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "59",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "13",
     "note": "net tool-unclamped <= hm2_7i97.0.7i84.0.0.input-01"
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
   "authority_line": 59
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
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "60",
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
   "authority_line": 60
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
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "61",
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
   "authority_line": 61
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
   "stale_row": null,
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
   "conflicts": [],
   "authority_line": 62
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
   "stale_row": null,
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
   "conflicts": [],
   "authority_line": 63
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
   "stale_row": null,
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
   "stale_row": null,
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
   "stale_row": null,
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
   "field_point": "Door interlock switch",
   "designations": [
    "LS-141",
    "LS-140",
    "DS-1",
    "DS-2"
   ],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Choose door-open versus door-closed net after normal state is measured",
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
   "stale_row": null,
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
   "conflicts": [
    "C10"
   ],
   "authority_line": 67
  },
  {
   "id": "LUBE_LEVEL",
   "name": "Lube Level",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN25",
   "hal_net": "lube-level",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Utility",
   "machine_subsystem": "Lubrication",
   "status": "COMMISSIONING_PENDING",
   "field_point": "Lube level switch",
   "designations": [
    "PS-5"
   ],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Choose low versus ok net after normal state is measured",
   "location": "Lube pump station — level/pressure switch",
   "location_note": "PS-5 head lube pressure exists separately. Alarm table shows two lube systems (AL-54 way, AL-56 head).",
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
   "stale_row": null,
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
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "69",
     "note": "Current wiring authority row"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 69
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
   "designations": [
    "TB-5"
   ],
   "primary_source": "phase2_plan",
   "cleanup_notes": "This supersedes stale signal_map.csv TB5 IN16 row",
   "location": "Hydraulic power unit — Sanwa SPS-8T-PC-20 pressure switch",
   "location_note": "Supersedes the stale signal_map.csv TB5 IN16 row",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No explicit normal-state evidence in the repo for this signal.",
    "kind": "unknown"
   },
   "hal_state": "commented",
   "mesa_pins": [
    "hm2_7i97.0.7i84.0.0.input-27"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 48,
     "text": "# net hydraulic-ok      <= hm2_7i97.0.7i84.0.0.input-27",
     "commented": true,
     "producers": [
      "hm2_7i97.0.7i84.0.0.input-27"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "stale_row": {
    "line": 26,
    "card": "7i97T",
    "conn": "TB5",
    "channel": "IN16",
    "net": "hydraulic-ok",
    "status": "Verify in cabinet",
    "differs": true
   },
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "70",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "48",
     "note": "commented out — # net hydraulic-ok      <= hm2_7i97.0.7i84.0.0.input-27"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "26",
     "note": "STALE companion row: 7i97T TB5 IN16 → hydraulic-ok (Verify in cabinet)"
    },
    {
     "file": "phase2_plan",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C8"
   ],
   "authority_line": 70
  },
  {
   "id": "CYCLE_START_PB",
   "name": "Cycle Start Pb",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN28",
   "hal_net": "cycle-start-pb",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Panel",
   "machine_subsystem": "Operator panel",
   "status": "OPTIONAL_VERIFY",
   "field_point": "Operator cycle start pushbutton",
   "designations": [],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Panel reuse optional",
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
    "hm2_7i97.0.7i84.0.0.input-28"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 51,
     "text": "# net cycle-start-pb    <= hm2_7i97.0.7i84.0.0.input-28",
     "commented": true,
     "producers": [
      "hm2_7i97.0.7i84.0.0.input-28"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "stale_row": {
    "line": 27,
    "card": "7i97T",
    "conn": "TB5",
    "channel": "IN17",
    "net": "cycle-start-pb",
    "status": "Optional",
    "differs": true
   },
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "71",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "51",
     "note": "commented out — # net cycle-start-pb    <= hm2_7i97.0.7i84.0.0.input-28"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "27",
     "note": "STALE companion row: 7i97T TB5 IN17 → cycle-start-pb (Optional)"
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
   "id": "FEED_HOLD_PB",
   "name": "Feed Hold Pb",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN29",
   "hal_net": "feed-hold-pb",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Panel",
   "machine_subsystem": "Operator panel",
   "status": "OPTIONAL_VERIFY",
   "field_point": "Operator feed hold pushbutton",
   "designations": [],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Panel reuse optional",
   "location": "Operating panel A/B — feed hold pushbutton",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No explicit normal-state evidence in the repo for this signal.",
    "kind": "unknown"
   },
   "hal_state": "commented",
   "mesa_pins": [
    "hm2_7i97.0.7i84.0.0.input-29"
   ],
   "producers": [],
   "consumers": [
    "motion.feed-hold"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 56,
     "text": "# net feed-hold-pb      <= hm2_7i97.0.7i84.0.0.input-29",
     "commented": true,
     "producers": [
      "hm2_7i97.0.7i84.0.0.input-29"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 57,
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
   "stale_row": {
    "line": 28,
    "card": "7i97T",
    "conn": "TB5",
    "channel": "IN18",
    "net": "feed-hold-pb",
    "status": "Optional",
    "differs": true
   },
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "72",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "56",
     "note": "commented out — # net feed-hold-pb      <= hm2_7i97.0.7i84.0.0.input-29"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "57",
     "note": "commented out — # net feed-hold-pb      => motion.feed-hold"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "28",
     "note": "STALE companion row: 7i97T TB5 IN18 → feed-hold-pb (Optional)"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 72
  },
  {
   "id": "SINGLE_BLOCK_SW",
   "name": "Single Block Sw",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN30",
   "hal_net": "single-block",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Panel",
   "machine_subsystem": "Operator panel",
   "status": "OPTIONAL_VERIFY",
   "field_point": "Operator single block selector",
   "designations": [],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Panel reuse optional",
   "location": "Operating panel A/B — single block selector",
   "location_note": "",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No explicit normal-state evidence in the repo for this signal.",
    "kind": "unknown"
   },
   "hal_state": "commented",
   "mesa_pins": [
    "hm2_7i97.0.7i84.0.0.input-30"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 52,
     "text": "# net single-block      <= hm2_7i97.0.7i84.0.0.input-30",
     "commented": true,
     "producers": [
      "hm2_7i97.0.7i84.0.0.input-30"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "stale_row": {
    "line": 29,
    "card": "7i97T",
    "conn": "TB5",
    "channel": "IN19",
    "net": "single-block",
    "status": "Optional",
    "differs": true
   },
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "73",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "52",
     "note": "commented out — # net single-block      <= hm2_7i97.0.7i84.0.0.input-30"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "29",
     "note": "STALE companion row: 7i97T TB5 IN19 → single-block (Optional)"
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
    "hm2_7i97.0.7i84.0.0.input-31"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 53,
     "text": "# net servo-ready       <= hm2_7i97.0.7i84.0.0.input-31",
     "commented": true,
     "producers": [
      "hm2_7i97.0.7i84.0.0.input-31"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "74",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "53",
     "note": "commented out — # net servo-ready       <= hm2_7i97.0.7i84.0.0.input-31"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 74
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
   "cleanup_notes": "Resolve against TB3 spindle enable candidate",
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
    "hm2_7i97.0.7i84.0.0.output-11"
   ],
   "producers": [
    "spindle.0.forward"
   ],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 85,
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
     "line": 86,
     "text": "# net spindle-fwd    => hm2_7i97.0.7i84.0.0.output-11",
     "commented": true,
     "producers": [],
     "consumers": [
      "hm2_7i97.0.7i84.0.0.output-11"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "75",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "85",
     "note": "commented out — # net spindle-fwd    <= spindle.0.forward"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "86",
     "note": "commented out — # net spindle-fwd    => hm2_7i97.0.7i84.0.0.output-11"
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
   "authority_line": 75
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
   "cleanup_notes": "Resolve against TB3 spindle enable candidate",
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
    "hm2_7i97.0.7i84.0.0.output-12"
   ],
   "producers": [
    "spindle.0.reverse"
   ],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 87,
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
     "line": 88,
     "text": "# net spindle-rev    => hm2_7i97.0.7i84.0.0.output-12",
     "commented": true,
     "producers": [],
     "consumers": [
      "hm2_7i97.0.7i84.0.0.output-12"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "76",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "87",
     "note": "commented out — # net spindle-rev    <= spindle.0.reverse"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "88",
     "note": "commented out — # net spindle-rev    => hm2_7i97.0.7i84.0.0.output-12"
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
   "authority_line": 76
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
   "cleanup_notes": "Resolve against TB3 spindle enable candidate",
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
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "77",
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
   "authority_line": 77
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
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "78",
     "note": "Current wiring authority row"
    },
    {
     "file": "element_list_crosswalk_2026-07-27",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 78
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
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "79",
     "note": "Current wiring authority row"
    },
    {
     "file": "element_list_crosswalk_2026-07-27",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 79
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
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "80",
     "note": "Current wiring authority row"
    },
    {
     "file": "element_list_crosswalk_2026-07-27",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 80
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
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "81",
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
   "authority_line": 81
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
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "82",
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
   "authority_line": 82
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
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "83",
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
   "authority_line": 83
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
   "stale_row": null,
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
    "C2",
    "C5"
   ],
   "authority_line": 84
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
    "hm2_7i97.0.7i84.0.0.output-00"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 66,
     "text": "net tool-unclamp-sol => hm2_7i97.0.7i84.0.0.output-00",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i97.0.7i84.0.0.output-00"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "stale_row": {
    "line": 50,
    "card": "7i84U",
    "conn": "TB2",
    "channel": "OUT0",
    "net": "tool-unclamp-sol",
    "status": "Confirmed from notes",
    "differs": true
   },
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "85",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "66",
     "note": "net tool-unclamp-sol => hm2_7i97.0.7i84.0.0.output-00"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "50",
     "note": "STALE companion row: 7i84U TB2 OUT0 → tool-unclamp-sol (Confirmed from notes)"
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
   "authority_line": 85
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
    "hm2_7i97.0.7i84.0.0.output-05"
   ],
   "producers": [
    "iocontrol.0.coolant-flood"
   ],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 73,
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
     "line": 74,
     "text": "net flood-coolant => hm2_7i97.0.7i84.0.0.output-05",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i97.0.7i84.0.0.output-05"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "86",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "73",
     "note": "net flood-coolant <= iocontrol.0.coolant-flood"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "74",
     "note": "net flood-coolant => hm2_7i97.0.7i84.0.0.output-05"
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
   "authority_line": 86
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
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "87",
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
   "authority_line": 87
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
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "88",
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
   "authority_line": 88
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
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "89",
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
   "authority_line": 89
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
   "stale_row": null,
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
    "C2"
   ],
   "authority_line": 90
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
   "status": "HOLD_NOT_ORDERED",
   "field_point": "Additional 7i84 or equivalent",
   "designations": [],
   "primary_source": "phase2_conflict_review",
   "cleanup_notes": "Input budget now exhausted (0 spares); TCFS X01B deferred. Next field input forces this card or reclaiming panel inputs IN28-IN30",
   "location": "Not installed",
   "location_note": "Do not order until the input count proves it is needed.",
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
   "stale_row": null,
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "91",
     "note": "Current wiring authority row"
    },
    {
     "file": "phase2_conflict_review",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C10"
   ],
   "authority_line": 91
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
   "field_point": "Workpiece air blast 1",
   "designations": [],
   "primary_source": "mesa/signal_map.csv (stale)",
   "cleanup_notes": "No row in current_pin_authority.csv. Active in HAL — remove or add an authority row before loading against field wiring.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "Derived from the stale signal_map.csv layout.",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i97.0.7i84.0.0.output-07"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 79,
     "text": "net air-blast-1 => hm2_7i97.0.7i84.0.0.output-07",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i97.0.7i84.0.0.output-07"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "stale_row": null,
   "sources": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "79",
     "note": "net air-blast-1 => hm2_7i97.0.7i84.0.0.output-07"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "57",
     "note": "STALE source of this net: 7i84U TB2 OUT7 (Confirmed from notes)"
    }
   ],
   "conflicts": [
    "C2",
    "C8"
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
   "field_point": "Workpiece air blast 2",
   "designations": [],
   "primary_source": "mesa/signal_map.csv (stale)",
   "cleanup_notes": "No row in current_pin_authority.csv. Active in HAL — remove or add an authority row before loading against field wiring.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "Derived from the stale signal_map.csv layout.",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i97.0.7i84.0.0.output-08"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 80,
     "text": "net air-blast-2 => hm2_7i97.0.7i84.0.0.output-08",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i97.0.7i84.0.0.output-08"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "stale_row": null,
   "sources": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "80",
     "note": "net air-blast-2 => hm2_7i97.0.7i84.0.0.output-08"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "58",
     "note": "STALE source of this net: 7i84U TB2 OUT8 (Confirmed from notes)"
    }
   ],
   "conflicts": [
    "C2",
    "C8"
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
   "field_point": "Shop air pressure OK",
   "designations": [],
   "primary_source": "mesa/signal_map.csv (stale)",
   "cleanup_notes": "No row in current_pin_authority.csv. Active in HAL — remove or add an authority row before loading against field wiring.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "Derived from the stale signal_map.csv layout.",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i97.0.7i84.0.0.input-11"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 26,
     "text": "net air-ok      <= hm2_7i97.0.7i84.0.0.input-11",
     "commented": false,
     "producers": [
      "hm2_7i97.0.7i84.0.0.input-11"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "stale_row": null,
   "sources": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "26",
     "note": "net air-ok      <= hm2_7i97.0.7i84.0.0.input-11"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "49",
     "note": "STALE source of this net: 7i84U TB1 IN11 (Verify in cabinet)"
    }
   ],
   "conflicts": [
    "C1",
    "C8"
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
    "hm2_7i97.0.7i84.0.0.output-14"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 93,
     "text": "# net chip-conveyor-on => hm2_7i97.0.7i84.0.0.output-14",
     "commented": true,
     "producers": [],
     "consumers": [
      "hm2_7i97.0.7i84.0.0.output-14"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "stale_row": null,
   "sources": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "93",
     "note": "commented out — # net chip-conveyor-on => hm2_7i97.0.7i84.0.0.output-14"
    }
   ],
   "conflicts": [
    "C2",
    "C8"
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
   "field_point": "Coolant tank low level",
   "designations": [],
   "primary_source": "mesa/signal_map.csv (stale)",
   "cleanup_notes": "No row in current_pin_authority.csv. Active in HAL — remove or add an authority row before loading against field wiring.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "Derived from the stale signal_map.csv layout.",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i97.0.7i84.0.0.input-10"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 25,
     "text": "net coolant-low <= hm2_7i97.0.7i84.0.0.input-10",
     "commented": false,
     "producers": [
      "hm2_7i97.0.7i84.0.0.input-10"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "stale_row": null,
   "sources": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "25",
     "note": "net coolant-low <= hm2_7i97.0.7i84.0.0.input-10"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "48",
     "note": "STALE source of this net: 7i84U TB1 IN10 (Optional)"
    }
   ],
   "conflicts": [
    "C1",
    "C8"
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
   "field_point": "Door interlock",
   "designations": [],
   "primary_source": "mesa/signal_map.csv (stale)",
   "cleanup_notes": "No row in current_pin_authority.csv. Commented out in HAL.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "Derived from the stale signal_map.csv layout.",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "commented",
   "mesa_pins": [
    "hm2_7i97.0.7i84.0.0.input-24"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 46,
     "text": "# net door-closed       <= hm2_7i97.0.7i84.0.0.input-24",
     "commented": true,
     "producers": [
      "hm2_7i97.0.7i84.0.0.input-24"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "stale_row": null,
   "sources": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "46",
     "note": "commented out — # net door-closed       <= hm2_7i97.0.7i84.0.0.input-24"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "24",
     "note": "STALE source of this net: 7i97T TB5 IN14 (Verify in cabinet)"
    }
   ],
   "conflicts": [
    "C1",
    "C8"
   ],
   "authority_line": null
  },
  {
   "id": "NET_LAMP_ALARM",
   "name": "lamp-alarm",
   "board": "7i97T",
   "connector": "unconfirmed",
   "channel": "gpio.031.out",
   "hal_net": "lamp-alarm",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Unmapped",
   "machine_subsystem": "Unmapped",
   "status": "CONFIG_ONLY",
   "field_point": "MACHINE FAILURE lamp",
   "designations": [],
   "primary_source": "mesa/signal_map.csv (stale)",
   "cleanup_notes": "No row in current_pin_authority.csv. Commented out in HAL.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "Derived from the stale signal_map.csv layout.",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "commented",
   "mesa_pins": [
    "hm2_7i97.0.gpio.031.out"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 273,
     "text": "# net lamp-alarm    => hm2_7i97.0.gpio.031.out",
     "commented": true,
     "producers": [],
     "consumers": [
      "hm2_7i97.0.gpio.031.out"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "stale_row": null,
   "sources": [
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "273",
     "note": "commented out — # net lamp-alarm    => hm2_7i97.0.gpio.031.out"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "37",
     "note": "STALE source of this net: 7i97T TB6 OUT7 (Optional)"
    }
   ],
   "conflicts": [
    "C2",
    "C8"
   ],
   "authority_line": null
  },
  {
   "id": "NET_LAMP_READY",
   "name": "lamp-ready",
   "board": "7i97T",
   "connector": "unconfirmed",
   "channel": "gpio.030.out",
   "hal_net": "lamp-ready",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Unmapped",
   "machine_subsystem": "Unmapped",
   "status": "CONFIG_ONLY",
   "field_point": "READY lamp",
   "designations": [],
   "primary_source": "mesa/signal_map.csv (stale)",
   "cleanup_notes": "No row in current_pin_authority.csv. Commented out in HAL.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "Derived from the stale signal_map.csv layout.",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "commented",
   "mesa_pins": [
    "hm2_7i97.0.gpio.030.out"
   ],
   "producers": [
    "iocontrol.0.user-enable-out"
   ],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 271,
     "text": "# net lamp-ready    <= iocontrol.0.user-enable-out",
     "commented": true,
     "producers": [
      "iocontrol.0.user-enable-out"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 272,
     "text": "# net lamp-ready    => hm2_7i97.0.gpio.030.out",
     "commented": true,
     "producers": [],
     "consumers": [
      "hm2_7i97.0.gpio.030.out"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "stale_row": null,
   "sources": [
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "271",
     "note": "commented out — # net lamp-ready    <= iocontrol.0.user-enable-out"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "272",
     "note": "commented out — # net lamp-ready    => hm2_7i97.0.gpio.030.out"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "36",
     "note": "STALE source of this net: 7i97T TB6 OUT6 (Optional)"
    }
   ],
   "conflicts": [
    "C2",
    "C8"
   ],
   "authority_line": null
  },
  {
   "id": "NET_LUBE_OK",
   "name": "lube-ok",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN25",
   "hal_net": "lube-ok",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Unmapped",
   "machine_subsystem": "Unmapped",
   "status": "CONFIG_ONLY",
   "field_point": "Central lube pressure/float OK",
   "designations": [],
   "primary_source": "mesa/signal_map.csv (stale)",
   "cleanup_notes": "No row in current_pin_authority.csv. Commented out in HAL.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "Derived from the stale signal_map.csv layout.",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "commented",
   "mesa_pins": [
    "hm2_7i97.0.7i84.0.0.input-25"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 47,
     "text": "# net lube-ok           <= hm2_7i97.0.7i84.0.0.input-25",
     "commented": true,
     "producers": [
      "hm2_7i97.0.7i84.0.0.input-25"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "stale_row": null,
   "sources": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "47",
     "note": "commented out — # net lube-ok           <= hm2_7i97.0.7i84.0.0.input-25"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "25",
     "note": "STALE source of this net: 7i97T TB5 IN15 (Verify in cabinet)"
    }
   ],
   "conflicts": [
    "C1",
    "C8"
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
   "field_point": "Magazine rotate CCW/reverse",
   "designations": [
    "SOL-8B"
   ],
   "primary_source": "mesa/signal_map.csv (stale)",
   "cleanup_notes": "No row in current_pin_authority.csv. Active in HAL — remove or add an authority row before loading against field wiring.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "Derived from the stale signal_map.csv layout.",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i97.0.7i84.0.0.output-02"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 68,
     "text": "net mag-ccw-sol => hm2_7i97.0.7i84.0.0.output-02",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i97.0.7i84.0.0.output-02"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "stale_row": null,
   "sources": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "68",
     "note": "net mag-ccw-sol => hm2_7i97.0.7i84.0.0.output-02"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "52",
     "note": "STALE source of this net: 7i84U TB2 OUT2 (Confirmed from notes)"
    }
   ],
   "conflicts": [
    "C2",
    "C8"
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
   "field_point": "Magazine cover close solenoid",
   "designations": [],
   "primary_source": "mesa/signal_map.csv (stale)",
   "cleanup_notes": "No row in current_pin_authority.csv. Active in HAL — remove or add an authority row before loading against field wiring.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "Derived from the stale signal_map.csv layout.",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i97.0.7i84.0.0.output-04"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 71,
     "text": "net mag-cover-close => hm2_7i97.0.7i84.0.0.output-04",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i97.0.7i84.0.0.output-04"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "stale_row": null,
   "sources": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "71",
     "note": "net mag-cover-close => hm2_7i97.0.7i84.0.0.output-04"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "54",
     "note": "STALE source of this net: 7i84U TB2 OUT4 (Verify in cabinet)"
    }
   ],
   "conflicts": [
    "C2",
    "C8"
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
   "field_point": "Magazine cover open solenoid",
   "designations": [],
   "primary_source": "mesa/signal_map.csv (stale)",
   "cleanup_notes": "No row in current_pin_authority.csv. Active in HAL — remove or add an authority row before loading against field wiring.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "Derived from the stale signal_map.csv layout.",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i97.0.7i84.0.0.output-03"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 70,
     "text": "net mag-cover-open => hm2_7i97.0.7i84.0.0.output-03",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i97.0.7i84.0.0.output-03"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "stale_row": null,
   "sources": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "70",
     "note": "net mag-cover-open => hm2_7i97.0.7i84.0.0.output-03"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "53",
     "note": "STALE source of this net: 7i84U TB2 OUT3 (Verify in cabinet)"
    }
   ],
   "conflicts": [
    "C2",
    "C8"
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
   "field_point": "Magazine rotate CW/forward",
   "designations": [
    "SOL-8A"
   ],
   "primary_source": "mesa/signal_map.csv (stale)",
   "cleanup_notes": "No row in current_pin_authority.csv. Active in HAL — remove or add an authority row before loading against field wiring.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "Derived from the stale signal_map.csv layout.",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i97.0.7i84.0.0.output-01"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 67,
     "text": "net mag-cw-sol => hm2_7i97.0.7i84.0.0.output-01",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i97.0.7i84.0.0.output-01"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "stale_row": null,
   "sources": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "67",
     "note": "net mag-cw-sol => hm2_7i97.0.7i84.0.0.output-01"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "51",
     "note": "STALE source of this net: 7i84U TB2 OUT1 (Confirmed from notes)"
    }
   ],
   "conflicts": [
    "C2",
    "C8"
   ],
   "authority_line": null
  },
  {
   "id": "NET_MAG_IN_POS",
   "name": "mag-in-pos",
   "board": "7i84U",
   "connector": "TB1",
   "channel": "IN4",
   "hal_net": "mag-in-pos",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Unmapped",
   "machine_subsystem": "Unmapped",
   "status": "CONFIG_ONLY",
   "field_point": "Magazine indexed/in-position",
   "designations": [
    "PRS-13"
   ],
   "primary_source": "mesa/signal_map.csv (stale)",
   "cleanup_notes": "No row in current_pin_authority.csv. Active in HAL — remove or add an authority row before loading against field wiring.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "Derived from the stale signal_map.csv layout.",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i97.0.7i84.0.0.input-04"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 18,
     "text": "net mag-in-pos <= hm2_7i97.0.7i84.0.0.input-04",
     "commented": false,
     "producers": [
      "hm2_7i97.0.7i84.0.0.input-04"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "stale_row": null,
   "sources": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "18",
     "note": "net mag-in-pos <= hm2_7i97.0.7i84.0.0.input-04"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "42",
     "note": "STALE source of this net: 7i84U TB1 IN4 (Confirmed from notes)"
    }
   ],
   "conflicts": [
    "C1",
    "C8"
   ],
   "authority_line": null
  },
  {
   "id": "NET_MAIN_SERVO_ON",
   "name": "main-servo-on",
   "board": "7i97T",
   "connector": "unconfirmed",
   "channel": "gpio.029.out",
   "hal_net": "main-servo-on",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Unmapped",
   "machine_subsystem": "Unmapped",
   "status": "CONFIG_ONLY",
   "field_point": "Main servo power contactor",
   "designations": [],
   "primary_source": "mesa/signal_map.csv (stale)",
   "cleanup_notes": "No row in current_pin_authority.csv. Commented out in HAL.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "Derived from the stale signal_map.csv layout.",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "commented",
   "mesa_pins": [
    "hm2_7i97.0.gpio.029.out"
   ],
   "producers": [
    "iocontrol.0.user-enable-out"
   ],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 269,
     "text": "# net main-servo-on <= iocontrol.0.user-enable-out",
     "commented": true,
     "producers": [
      "iocontrol.0.user-enable-out"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 270,
     "text": "# net main-servo-on => hm2_7i97.0.gpio.029.out",
     "commented": true,
     "producers": [],
     "consumers": [
      "hm2_7i97.0.gpio.029.out"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "stale_row": null,
   "sources": [
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "269",
     "note": "commented out — # net main-servo-on <= iocontrol.0.user-enable-out"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "270",
     "note": "commented out — # net main-servo-on => hm2_7i97.0.gpio.029.out"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "35",
     "note": "STALE source of this net: 7i97T TB6 OUT5 (Verify in cabinet)"
    }
   ],
   "conflicts": [
    "C2",
    "C8"
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
   "field_point": "Mist coolant valve",
   "designations": [],
   "primary_source": "mesa/signal_map.csv (stale)",
   "cleanup_notes": "No row in current_pin_authority.csv. Active in HAL — remove or add an authority row before loading against field wiring.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "Derived from the stale signal_map.csv layout.",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i97.0.7i84.0.0.output-06"
   ],
   "producers": [
    "iocontrol.0.coolant-mist"
   ],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 76,
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
     "line": 77,
     "text": "net mist-coolant => hm2_7i97.0.7i84.0.0.output-06",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i97.0.7i84.0.0.output-06"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "stale_row": null,
   "sources": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "76",
     "note": "net mist-coolant <= iocontrol.0.coolant-mist"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "77",
     "note": "net mist-coolant => hm2_7i97.0.7i84.0.0.output-06"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "56",
     "note": "STALE source of this net: 7i84U TB2 OUT6 (Optional)"
    }
   ],
   "conflicts": [
    "C2",
    "C8"
   ],
   "authority_line": null
  },
  {
   "id": "NET_PROBE_IN",
   "name": "probe-in",
   "board": "7i97T",
   "connector": "unconfirmed",
   "channel": "gpio.NNN.in",
   "hal_net": "probe-in",
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
    "hm2_7i97.0.gpio.NNN.in"
   ],
   "producers": [],
   "consumers": [
    "motion.probe-input"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 276,
     "text": "# net probe-in <= hm2_7i97.0.gpio.NNN.in",
     "commented": true,
     "producers": [
      "hm2_7i97.0.gpio.NNN.in"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 277,
     "text": "# net probe-in => motion.probe-input",
     "commented": true,
     "producers": [],
     "consumers": [
      "motion.probe-input"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "stale_row": null,
   "sources": [
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "276",
     "note": "commented out — # net probe-in <= hm2_7i97.0.gpio.NNN.in"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "lines": "277",
     "note": "commented out — # net probe-in => motion.probe-input"
    }
   ],
   "conflicts": [
    "C1",
    "C8"
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
    "hm2_7i97.0.7i84.0.0.input-15"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 42,
     "text": "# net spindle-at-spd    <= hm2_7i97.0.7i84.0.0.input-15",
     "commented": true,
     "producers": [
      "hm2_7i97.0.7i84.0.0.input-15"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "stale_row": null,
   "sources": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "42",
     "note": "commented out — # net spindle-at-spd    <= hm2_7i97.0.7i84.0.0.input-15"
    }
   ],
   "conflicts": [
    "C1",
    "C8"
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
    "hm2_7i97.0.7i84.0.0.output-15"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 94,
     "text": "# net stack-green      => hm2_7i97.0.7i84.0.0.output-15",
     "commented": true,
     "producers": [],
     "consumers": [
      "hm2_7i97.0.7i84.0.0.output-15"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "stale_row": null,
   "sources": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "94",
     "note": "commented out — # net stack-green      => hm2_7i97.0.7i84.0.0.output-15"
    }
   ],
   "conflicts": [
    "C2",
    "C8"
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
   "field_point": "Tap coolant valve",
   "designations": [],
   "primary_source": "mesa/signal_map.csv (stale)",
   "cleanup_notes": "No row in current_pin_authority.csv. Active in HAL — remove or add an authority row before loading against field wiring.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "Derived from the stale signal_map.csv layout.",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i97.0.7i84.0.0.output-09"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 81,
     "text": "net tap-coolant => hm2_7i97.0.7i84.0.0.output-09",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i97.0.7i84.0.0.output-09"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "stale_row": null,
   "sources": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "81",
     "note": "net tap-coolant => hm2_7i97.0.7i84.0.0.output-09"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "59",
     "note": "STALE source of this net: 7i84U TB2 OUT9 (Optional)"
    }
   ],
   "conflicts": [
    "C2",
    "C8"
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
   "field_point": "Magazine tool code bit 0",
   "designations": [
    "PRS-21"
   ],
   "primary_source": "mesa/signal_map.csv (stale)",
   "cleanup_notes": "No row in current_pin_authority.csv. Active in HAL — remove or add an authority row before loading against field wiring.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "Derived from the stale signal_map.csv layout.",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i97.0.7i84.0.0.input-05"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 19,
     "text": "net tool-code-0 <= hm2_7i97.0.7i84.0.0.input-05",
     "commented": false,
     "producers": [
      "hm2_7i97.0.7i84.0.0.input-05"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "stale_row": null,
   "sources": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "19",
     "note": "net tool-code-0 <= hm2_7i97.0.7i84.0.0.input-05"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "43",
     "note": "STALE source of this net: 7i84U TB1 IN5 (Confirmed from notes)"
    }
   ],
   "conflicts": [
    "C1",
    "C8"
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
   "field_point": "Magazine tool code bit 1",
   "designations": [
    "PRS-22"
   ],
   "primary_source": "mesa/signal_map.csv (stale)",
   "cleanup_notes": "No row in current_pin_authority.csv. Active in HAL — remove or add an authority row before loading against field wiring.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "Derived from the stale signal_map.csv layout.",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i97.0.7i84.0.0.input-06"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 20,
     "text": "net tool-code-1 <= hm2_7i97.0.7i84.0.0.input-06",
     "commented": false,
     "producers": [
      "hm2_7i97.0.7i84.0.0.input-06"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "stale_row": null,
   "sources": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "20",
     "note": "net tool-code-1 <= hm2_7i97.0.7i84.0.0.input-06"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "44",
     "note": "STALE source of this net: 7i84U TB1 IN6 (Confirmed from notes)"
    }
   ],
   "conflicts": [
    "C1",
    "C8"
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
   "field_point": "Magazine tool code bit 2",
   "designations": [
    "PRS-23"
   ],
   "primary_source": "mesa/signal_map.csv (stale)",
   "cleanup_notes": "No row in current_pin_authority.csv. Active in HAL — remove or add an authority row before loading against field wiring.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "Derived from the stale signal_map.csv layout.",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i97.0.7i84.0.0.input-07"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 21,
     "text": "net tool-code-2 <= hm2_7i97.0.7i84.0.0.input-07",
     "commented": false,
     "producers": [
      "hm2_7i97.0.7i84.0.0.input-07"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "stale_row": null,
   "sources": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "21",
     "note": "net tool-code-2 <= hm2_7i97.0.7i84.0.0.input-07"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "45",
     "note": "STALE source of this net: 7i84U TB1 IN7 (Confirmed from notes)"
    }
   ],
   "conflicts": [
    "C1",
    "C8"
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
   "field_point": "Magazine tool code bit 3",
   "designations": [
    "PRS-24"
   ],
   "primary_source": "mesa/signal_map.csv (stale)",
   "cleanup_notes": "No row in current_pin_authority.csv. Active in HAL — remove or add an authority row before loading against field wiring.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "Derived from the stale signal_map.csv layout.",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i97.0.7i84.0.0.input-08"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 22,
     "text": "net tool-code-3 <= hm2_7i97.0.7i84.0.0.input-08",
     "commented": false,
     "producers": [
      "hm2_7i97.0.7i84.0.0.input-08"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "stale_row": null,
   "sources": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "22",
     "note": "net tool-code-3 <= hm2_7i97.0.7i84.0.0.input-08"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "46",
     "note": "STALE source of this net: 7i84U TB1 IN8 (Confirmed from notes)"
    }
   ],
   "conflicts": [
    "C1",
    "C8"
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
   "field_point": "Magazine tool code bit 4 if used",
   "designations": [
    "PRS-25"
   ],
   "primary_source": "mesa/signal_map.csv (stale)",
   "cleanup_notes": "No row in current_pin_authority.csv. Active in HAL — remove or add an authority row before loading against field wiring.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "Derived from the stale signal_map.csv layout.",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i97.0.7i84.0.0.input-09"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 23,
     "text": "net tool-code-4 <= hm2_7i97.0.7i84.0.0.input-09",
     "commented": false,
     "producers": [
      "hm2_7i97.0.7i84.0.0.input-09"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "stale_row": null,
   "sources": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "23",
     "note": "net tool-code-4 <= hm2_7i97.0.7i84.0.0.input-09"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "47",
     "note": "STALE source of this net: 7i84U TB1 IN9 (Verify in cabinet)"
    }
   ],
   "conflicts": [
    "C1",
    "C8"
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
   "field_point": "Work light",
   "designations": [],
   "primary_source": "mesa/signal_map.csv (stale)",
   "cleanup_notes": "No row in current_pin_authority.csv. Active in HAL — remove or add an authority row before loading against field wiring.",
   "location": "Unknown — no authority row, trace in cabinet",
   "location_note": "Derived from the stale signal_map.csv layout.",
   "expected": {
    "value": "Unknown",
    "label": "Unknown — measure/verify",
    "basis": "No authority row and no normal-state evidence.",
    "kind": "unknown"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i97.0.7i84.0.0.output-10"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 82,
     "text": "net work-light => hm2_7i97.0.7i84.0.0.output-10",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i97.0.7i84.0.0.output-10"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "stale_row": null,
   "sources": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "82",
     "note": "net work-light => hm2_7i97.0.7i84.0.0.output-10"
    },
    {
     "file": "mesa/signal_map.csv",
     "lines": "60",
     "note": "STALE source of this net: 7i84U TB2 OUT10 (Optional)"
    }
   ],
   "conflicts": [
    "C2",
    "C8"
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
    "HAL nets with no authority row at all: mag-in-pos (in-04), tool-code-0..4 (in-05..09), coolant-low (in-10), air-ok (in-11). These trace back to the stale mesa/signal_map.csv."
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
   "title": "Spindle control: 7i97T TB3 ENA3 vs 7i84U FWD/REV/ENA",
   "severity": "conflict",
   "summary": "Two mutually exclusive plans exist for commanding the FR-SX. The authority marks the TB3 candidate HOLD_CONFLICT while also listing three 7i84U outputs for the same job.",
   "detail": [
    "SPINDLE_TB3_ENABLE_CANDIDATE: 7i97T TB3.13/TB3.14 ENA3±, net spindle-enable, HOLD_CONFLICT (current_pin_authority.csv:13)",
    "motion_7i97t.hal:265 nets spindle-enable from spindle.0.on and line 177 also uses it to gate pwmgen.03.enable, so the net is already live in the analog path",
    "motion_7i97t.hal:266 comment says \"Spindle enable/dir routed via 7i84U sserial\"",
    "field_7i84u.hal:85-90 has spindle-fwd/rev/enable to 7i84U output-11/12/13 — all commented out",
    "The authority instead places SPINDLE_FWD/REV/ENA on 7i84U TB2 OUT0/OUT1/OUT2 (current_pin_authority.csv:75-77), which does not match the commented HAL channel numbers either"
   ],
   "action": "Pick one control path. Confirm the FR-SX terminal set (2-wire vs 3-wire, sink vs source) before wiring either. Note that spindle-enable currently doubles as the pwmgen enable.",
   "signals": [
    "SPINDLE_TB3_ENABLE_CANDIDATE",
    "SPINDLE_FWD",
    "SPINDLE_REV",
    "SPINDLE_ENA",
    "SPINDLE_SPEED_CMD"
   ],
   "sources": [
    "mesa/current_pin_authority.csv:13,75-77",
    "linuxcnc/motion_7i97t.hal:177,265-266",
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
   "summary": "Every hm2_7i97.* name in the HAL set is a placeholder. Board tag, GPIO index ranges, resolver pin names, pwmgen instances, and the smart-serial device tag all need readhmid / halcmd show pin hm2 confirmation.",
   "detail": [
    "motion_7i97t.hal:4-7 — \"every hm2_7i97.* name below is an UNVERIFIED PLACEHOLDER... Confirm the exact board tag (hm2_7i97 vs hm2_7i97)\"",
    "motion_7i97t.hal:32-33 — resolver pin names unverified",
    "motion_7i97t.hal:183-188 — \"The gpio.NNN INDICES BELOW ARE PLACEHOLDERS — inputs and outputs occupy separate, firmware-determined ranges... do not wire by these numbers\"",
    "motion_7i97t.hal:116 — pwmgen instance to axis mapping unconfirmed",
    "field_7i84u.hal:3-6 — \"Every hm2_7i97.*.7i84.* name below is an UNVERIFIED PLACEHOLDER\"",
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
    "linuxcnc/motion_7i97t.hal:4-7,32-33,116,183-188",
    "linuxcnc/field_7i84u.hal:3-6",
    "linuxcnc/mazak_vqc_20_40.hal:4-7,25-26"
   ]
  },
  {
   "id": "C7",
   "title": "spindle-at-speed is forced true in HAL while the authority allocates a real input",
   "severity": "conflict",
   "summary": "motion_7i97t.hal short-circuits the at-speed net, so the planned 7i84U IN13 field signal would be ignored even once wired.",
   "detail": [
    "motion_7i97t.hal:102-103 — \"Until encoder is wired, spindle-at-speed is forced true (open-loop, no speed verification)\": sets spindle-at-speed true",
    "current_pin_authority.csv:56 — SPINDLE_AT_SPEED on 7i84U TB1 IN13, net spindle-at-speed",
    "field_7i84u.hal:42 — the matching input net is commented out and uses a different name (spindle-at-spd) and a different channel (input-15)"
   ],
   "action": "Remove the sets line before relying on at-speed for any interlock, and reconcile the net name (spindle-at-speed vs spindle-at-spd) and channel.",
   "signals": [
    "SPINDLE_AT_SPEED"
   ],
   "sources": [
    "linuxcnc/motion_7i97t.hal:102-103",
    "mesa/current_pin_authority.csv:56",
    "linuxcnc/field_7i84u.hal:42"
   ]
  },
  {
   "id": "C8",
   "title": "mesa/signal_map.csv is stale and must not be used for wiring",
   "severity": "stale",
   "summary": "The older signal map contradicts the authority on TB5 ordering, drive-fault board, hydraulic pressure, and the 7i84U field layout. It also uses a TB6 output bank that the authority does not recognise.",
   "detail": [
    "TB5 order: signal_map.csv:10-18 puts homes first (X_HOME=IN0); the authority puts limits first (X_LIMIT_PLUS=TB5.1 IN0) — current_pin_authority.csv:23-31",
    "Drive faults: signal_map.csv:19-21 places X/Y/Z drive faults on 7i97T TB5 IN9-11; the authority places them on 7i84U IN10-12",
    "E-stop: signal_map.csv:23 says TB5 IN13; the authority says TB5.10 IN9 gpio.017",
    "HYD_PRESS_OK: signal_map.csv:26 says 7i97T TB5 IN16; the authority says 7i84U IN27 and explicitly calls the old row stale (current_pin_authority.csv:70)",
    "Outputs: signal_map.csv:30-37 uses a 7i97T \"TB6\" output bank that does not appear in the authority at all; drive enables are on TB3 ENA pins instead",
    "7i84U: signal_map.csv:38-60 is an entirely different field layout that field_7i84u.hal still follows",
    "mesa/README.md:16-19 — \"Some rows are stale and conflict with the active HAL and Phase 2 review, especially TB5 homes/limits/E-stop and 7i84U field I/O.\""
   ],
   "action": "Use current_pin_authority.csv only. Keep signal_map.csv for comparison until it is regenerated.",
   "signals": [
    "X_HOME",
    "Y_HOME",
    "Z_HOME",
    "X_LIMIT_PLUS",
    "ESTOP_CHAIN",
    "HYD_PRESS_OK",
    "X_DRIVE_FAULT",
    "Y_DRIVE_FAULT",
    "Z_DRIVE_FAULT"
   ],
   "sources": [
    "mesa/signal_map.csv:10-60",
    "mesa/current_pin_authority.csv:23-34,53-55,70",
    "mesa/README.md:16-19"
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
    "SECOND_SSERIAL_CARD is deliberately on hold (current_pin_authority.csv:91)"
   ],
   "action": "Decide whether the pallet changer is retained before finalising the 7i84U channel budget. Do not order a second smart-serial card until the input count is proven insufficient.",
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
  "Resolver channel",
  "TB1",
  "TB2",
  "TB3",
  "TB4",
  "TB5",
  "TB5 SSR",
  "none",
  "unconfirmed"
 ],
 "orphan_nets": [
  {
   "net": "air-blast-1",
   "mesa_pins": [
    "hm2_7i97.0.7i84.0.0.output-07"
   ],
   "refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 79,
     "commented": false,
     "text": "net air-blast-1 => hm2_7i97.0.7i84.0.0.output-07"
    }
   ],
   "active": true
  },
  {
   "net": "air-blast-2",
   "mesa_pins": [
    "hm2_7i97.0.7i84.0.0.output-08"
   ],
   "refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 80,
     "commented": false,
     "text": "net air-blast-2 => hm2_7i97.0.7i84.0.0.output-08"
    }
   ],
   "active": true
  },
  {
   "net": "air-ok",
   "mesa_pins": [
    "hm2_7i97.0.7i84.0.0.input-11"
   ],
   "refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 26,
     "commented": false,
     "text": "net air-ok      <= hm2_7i97.0.7i84.0.0.input-11"
    }
   ],
   "active": true
  },
  {
   "net": "chip-conveyor-on",
   "mesa_pins": [
    "hm2_7i97.0.7i84.0.0.output-14"
   ],
   "refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 93,
     "commented": true,
     "text": "# net chip-conveyor-on => hm2_7i97.0.7i84.0.0.output-14"
    }
   ],
   "active": false
  },
  {
   "net": "coolant-low",
   "mesa_pins": [
    "hm2_7i97.0.7i84.0.0.input-10"
   ],
   "refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 25,
     "commented": false,
     "text": "net coolant-low <= hm2_7i97.0.7i84.0.0.input-10"
    }
   ],
   "active": true
  },
  {
   "net": "door-closed",
   "mesa_pins": [
    "hm2_7i97.0.7i84.0.0.input-24"
   ],
   "refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 46,
     "commented": true,
     "text": "# net door-closed       <= hm2_7i97.0.7i84.0.0.input-24"
    }
   ],
   "active": false
  },
  {
   "net": "lamp-alarm",
   "mesa_pins": [
    "hm2_7i97.0.gpio.031.out"
   ],
   "refs": [
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 273,
     "commented": true,
     "text": "# net lamp-alarm    => hm2_7i97.0.gpio.031.out"
    }
   ],
   "active": false
  },
  {
   "net": "lamp-ready",
   "mesa_pins": [
    "hm2_7i97.0.gpio.030.out"
   ],
   "refs": [
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 271,
     "commented": true,
     "text": "# net lamp-ready    <= iocontrol.0.user-enable-out"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 272,
     "commented": true,
     "text": "# net lamp-ready    => hm2_7i97.0.gpio.030.out"
    }
   ],
   "active": false
  },
  {
   "net": "lube-ok",
   "mesa_pins": [
    "hm2_7i97.0.7i84.0.0.input-25"
   ],
   "refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 47,
     "commented": true,
     "text": "# net lube-ok           <= hm2_7i97.0.7i84.0.0.input-25"
    }
   ],
   "active": false
  },
  {
   "net": "mag-ccw-sol",
   "mesa_pins": [
    "hm2_7i97.0.7i84.0.0.output-02"
   ],
   "refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 68,
     "commented": false,
     "text": "net mag-ccw-sol => hm2_7i97.0.7i84.0.0.output-02"
    }
   ],
   "active": true
  },
  {
   "net": "mag-cover-close",
   "mesa_pins": [
    "hm2_7i97.0.7i84.0.0.output-04"
   ],
   "refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 71,
     "commented": false,
     "text": "net mag-cover-close => hm2_7i97.0.7i84.0.0.output-04"
    }
   ],
   "active": true
  },
  {
   "net": "mag-cover-open",
   "mesa_pins": [
    "hm2_7i97.0.7i84.0.0.output-03"
   ],
   "refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 70,
     "commented": false,
     "text": "net mag-cover-open => hm2_7i97.0.7i84.0.0.output-03"
    }
   ],
   "active": true
  },
  {
   "net": "mag-cw-sol",
   "mesa_pins": [
    "hm2_7i97.0.7i84.0.0.output-01"
   ],
   "refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 67,
     "commented": false,
     "text": "net mag-cw-sol => hm2_7i97.0.7i84.0.0.output-01"
    }
   ],
   "active": true
  },
  {
   "net": "mag-in-pos",
   "mesa_pins": [
    "hm2_7i97.0.7i84.0.0.input-04"
   ],
   "refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 18,
     "commented": false,
     "text": "net mag-in-pos <= hm2_7i97.0.7i84.0.0.input-04"
    }
   ],
   "active": true
  },
  {
   "net": "main-servo-on",
   "mesa_pins": [
    "hm2_7i97.0.gpio.029.out"
   ],
   "refs": [
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 269,
     "commented": true,
     "text": "# net main-servo-on <= iocontrol.0.user-enable-out"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 270,
     "commented": true,
     "text": "# net main-servo-on => hm2_7i97.0.gpio.029.out"
    }
   ],
   "active": false
  },
  {
   "net": "mist-coolant",
   "mesa_pins": [
    "hm2_7i97.0.7i84.0.0.output-06"
   ],
   "refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 76,
     "commented": false,
     "text": "net mist-coolant <= iocontrol.0.coolant-mist"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 77,
     "commented": false,
     "text": "net mist-coolant => hm2_7i97.0.7i84.0.0.output-06"
    }
   ],
   "active": true
  },
  {
   "net": "probe-in",
   "mesa_pins": [
    "hm2_7i97.0.gpio.NNN.in"
   ],
   "refs": [
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 276,
     "commented": true,
     "text": "# net probe-in <= hm2_7i97.0.gpio.NNN.in"
    },
    {
     "file": "linuxcnc/motion_7i97t.hal",
     "line": 277,
     "commented": true,
     "text": "# net probe-in => motion.probe-input"
    }
   ],
   "active": false
  },
  {
   "net": "spindle-at-spd",
   "mesa_pins": [
    "hm2_7i97.0.7i84.0.0.input-15"
   ],
   "refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 42,
     "commented": true,
     "text": "# net spindle-at-spd    <= hm2_7i97.0.7i84.0.0.input-15"
    }
   ],
   "active": false
  },
  {
   "net": "stack-green",
   "mesa_pins": [
    "hm2_7i97.0.7i84.0.0.output-15"
   ],
   "refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 94,
     "commented": true,
     "text": "# net stack-green      => hm2_7i97.0.7i84.0.0.output-15"
    }
   ],
   "active": false
  },
  {
   "net": "tap-coolant",
   "mesa_pins": [
    "hm2_7i97.0.7i84.0.0.output-09"
   ],
   "refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 81,
     "commented": false,
     "text": "net tap-coolant => hm2_7i97.0.7i84.0.0.output-09"
    }
   ],
   "active": true
  },
  {
   "net": "tool-code-0",
   "mesa_pins": [
    "hm2_7i97.0.7i84.0.0.input-05"
   ],
   "refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 19,
     "commented": false,
     "text": "net tool-code-0 <= hm2_7i97.0.7i84.0.0.input-05"
    }
   ],
   "active": true
  },
  {
   "net": "tool-code-1",
   "mesa_pins": [
    "hm2_7i97.0.7i84.0.0.input-06"
   ],
   "refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 20,
     "commented": false,
     "text": "net tool-code-1 <= hm2_7i97.0.7i84.0.0.input-06"
    }
   ],
   "active": true
  },
  {
   "net": "tool-code-2",
   "mesa_pins": [
    "hm2_7i97.0.7i84.0.0.input-07"
   ],
   "refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 21,
     "commented": false,
     "text": "net tool-code-2 <= hm2_7i97.0.7i84.0.0.input-07"
    }
   ],
   "active": true
  },
  {
   "net": "tool-code-3",
   "mesa_pins": [
    "hm2_7i97.0.7i84.0.0.input-08"
   ],
   "refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 22,
     "commented": false,
     "text": "net tool-code-3 <= hm2_7i97.0.7i84.0.0.input-08"
    }
   ],
   "active": true
  },
  {
   "net": "tool-code-4",
   "mesa_pins": [
    "hm2_7i97.0.7i84.0.0.input-09"
   ],
   "refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 23,
     "commented": false,
     "text": "net tool-code-4 <= hm2_7i97.0.7i84.0.0.input-09"
    }
   ],
   "active": true
  },
  {
   "net": "work-light",
   "mesa_pins": [
    "hm2_7i97.0.7i84.0.0.output-10"
   ],
   "refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 82,
     "commented": false,
     "text": "net work-light => hm2_7i97.0.7i84.0.0.output-10"
    }
   ],
   "active": true
  }
 ],
 "missing_from_hal": [
  "AIR_BLAST",
  "TOUCH_SENSOR_BLAST",
  "TAP_COOLANT_BLAST",
  "ATC_BARRIER_SOL",
  "FLOOD_VALVE",
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
  "LUBE_LEVEL",
  "COOLANT_LEVEL",
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
