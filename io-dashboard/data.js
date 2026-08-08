// GENERATED FILE - do not edit by hand.
// Regenerate with:  cd io-dashboard && python3 tools/generate_data.py
// Source of truth:  mesa/current_pin_authority.csv (repo root)
window.MAZAK_DATA = {
 "meta": {
  "machine": "Mazak VQC-20/40",
  "serial": "060231",
  "architecture": "LinuxCNC + Mesa 7i80HDT (Ethernet FPGA host) + 7i44 on P1 (HostMot2 sserial port 0 channels 0/1 to 7i84U-A/B) + 7i49 on P2 (resolver + analog outs); P3 unused/spare",
  "generated": "2026-08-08 05:29 UTC",
  "source_repo": "mazak-vqc20-linuxcnc-retrofit",
  "authority_file": "mesa/current_pin_authority.csv",
  "epson_ferrule_file": "wiring/bbia1_mesa_end_ferrules_epson.csv",
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
   "The hardware E-stop chain removes hazardous power. 7i84U-A TB2 IN29 is the sole software monitor; the OEM hardware chain remains authoritative.",
   "Every hm2_7i80.* pin name in the HAL set is an unverified placeholder until confirmed against a firmware readhmid.",
   "7i49 AOUT order is X=AOUT0, Z=AOUT1, Y=AOUT2, FR-SX spindle velocity=AOUT3; AOUT4/AOUT5 spare.",
   "7i84U-B on 7i44 channel 1: TB3 IN0-5 limits, IN6-8 homes, IN9 air pressure, IN15 probe; TB3 OUT0-2 drive enable, OUT3-7 relay loads; TB2 OUT8 proposed cover valve; OUT9-15 spare.",
   "7i84U-A on sserial channel 0 is `hm2_7i80.0.7i84.0.0.*`; 7i84U-B on channel 1 is `hm2_7i80.0.7i84.0.1.*`; P3 has no active field binding."
  ]
 },
 "boards": {
  "7i80HDT": {
   "name": "Mesa 7i80HDT",
   "role": "Ethernet FPGA host (hm2_eth)",
   "detail": "Primary control board. P1 = 7i44 sserial breakout, P2 = 7i49 resolvers + analog outs; P3 is unused/spare; the probe is on 7i84U-B IN15.",
   "address": "board_ip 192.168.1.121 (host NIC enp0s31f6 at 192.168.1.1/24)"
  },
  "7i44": {
   "name": "Mesa 7i44",
   "role": "8-channel RS-422 smart-serial breakout (on 7i80HDT P1)",
   "detail": "Physical channel 0 carries 7i84U-A and channel 1 carries 7i84U-B. Channels 2-7 are spare.",
   "address": "7i80HDT P1 HostMot2 sserial port 0, channels 0 and 1"
  },
  "7i49": {
   "name": "Mesa 7i49",
   "role": "Resolver-to-digital interface + ±10V DACs (on 7i80HDT P2)",
   "detail": "Plain 7i49 (not HV). Reads the machine's original Tamagawa TS2014N shaft resolvers for X/Y/Z on RES0/1/2 at 5 kHz excitation. AOUT0/1/2 drive the X/Z/Y servos, AOUT3 drives FR-SX spindle velocity, and AOUT4/AOUT5 are spare.",
   "address": "num_resolvers=3, num_pwmgens=4 on 7i80HDT P2"
  },
  "7i84U-A": {
   "name": "Mesa 7i84U-A",
   "role": "Remote smart-serial field I/O (7i44 channel 0)",
   "detail": "32 field inputs and 16 field outputs on TB3/TB2; TB1 is field power. Mounted near the original green breakout PCB for ATC, hydraulics, coolant, air, magazine, and utility I/O.",
   "address": "On 7i44 channel 0 (`hm2_7i80.0.7i84.0.0.*`)"
  },
  "7i84U-B": {
   "name": "Mesa 7i84U-B",
   "role": "Remote smart-serial limit/home and relay I/O (7i44 channel 1)",
   "detail": "32 DI + 16 DO remote I/O: TB3 IN0-15 carries limits, homes, air pressure and probe; TB3 OUT0-7 carries drive enables and relay-managed loads; TB2 OUT8 carries the proposed cover valve. Interposing relays remain required for 100VAC solenoid loads.",
   "address": "On 7i44 channel 1 (`hm2_7i80.0.7i84.0.1.*`)"
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
     "line": 162,
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
     "line": 167,
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
     "line": 286,
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
     "line": 116,
     "text": "setp hm2_7i80.0.resolver.00.scale [JOINT_0]RESOLVER_SCALE",
     "commented": false,
     "target": "hm2_7i80.0.resolver.00.scale",
     "value": "[JOINT_0]RESOLVER_SCALE"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 145,
     "text": "setp hm2_7i80.0.resolver.00.velocity-scale  [JOINT_0]RESOLVER_VELOCITY_SCALE",
     "commented": false,
     "target": "hm2_7i80.0.resolver.00.velocity-scale",
     "value": "[JOINT_0]RESOLVER_VELOCITY_SCALE"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 155,
     "text": "setp hm2_7i80.0.resolver.00.index-divisor   [JOINT_0]RESOLVER_INDEX_DIVISOR",
     "commented": false,
     "target": "hm2_7i80.0.resolver.00.index-divisor",
     "value": "[JOINT_0]RESOLVER_INDEX_DIVISOR"
    }
   ],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "2",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "162",
     "note": "net x-pos-fb        <= hm2_7i80.0.resolver.00.position"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "167",
     "note": "net x-pos-fb        => joint.0.motor-pos-fb"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "286",
     "note": "net x-pos-fb   => pid.x.feedback"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "116",
     "note": "setp hm2_7i80.0.resolver.00.scale [JOINT_0]RESOLVER_SCALE"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "145",
     "note": "setp hm2_7i80.0.resolver.00.velocity-scale  [JOINT_0]RESOLVER_VELOCITY_SCALE"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "155",
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
     "line": 169,
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
     "line": 174,
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
     "line": 299,
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
     "line": 117,
     "text": "setp hm2_7i80.0.resolver.01.scale [JOINT_1]RESOLVER_SCALE",
     "commented": false,
     "target": "hm2_7i80.0.resolver.01.scale",
     "value": "[JOINT_1]RESOLVER_SCALE"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 146,
     "text": "setp hm2_7i80.0.resolver.01.velocity-scale  [JOINT_1]RESOLVER_VELOCITY_SCALE",
     "commented": false,
     "target": "hm2_7i80.0.resolver.01.velocity-scale",
     "value": "[JOINT_1]RESOLVER_VELOCITY_SCALE"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 156,
     "text": "setp hm2_7i80.0.resolver.01.index-divisor   [JOINT_1]RESOLVER_INDEX_DIVISOR",
     "commented": false,
     "target": "hm2_7i80.0.resolver.01.index-divisor",
     "value": "[JOINT_1]RESOLVER_INDEX_DIVISOR"
    }
   ],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "3",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "169",
     "note": "net y-pos-fb        <= hm2_7i80.0.resolver.01.position"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "174",
     "note": "net y-pos-fb        => joint.1.motor-pos-fb"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "299",
     "note": "net y-pos-fb   => pid.y.feedback"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "117",
     "note": "setp hm2_7i80.0.resolver.01.scale [JOINT_1]RESOLVER_SCALE"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "146",
     "note": "setp hm2_7i80.0.resolver.01.velocity-scale  [JOINT_1]RESOLVER_VELOCITY_SCALE"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "156",
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
     "line": 176,
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
     "line": 181,
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
     "line": 309,
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
     "line": 118,
     "text": "setp hm2_7i80.0.resolver.02.scale [JOINT_2]RESOLVER_SCALE",
     "commented": false,
     "target": "hm2_7i80.0.resolver.02.scale",
     "value": "[JOINT_2]RESOLVER_SCALE"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 147,
     "text": "setp hm2_7i80.0.resolver.02.velocity-scale  [JOINT_2]RESOLVER_VELOCITY_SCALE",
     "commented": false,
     "target": "hm2_7i80.0.resolver.02.velocity-scale",
     "value": "[JOINT_2]RESOLVER_VELOCITY_SCALE"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 157,
     "text": "setp hm2_7i80.0.resolver.02.index-divisor   [JOINT_2]RESOLVER_INDEX_DIVISOR",
     "commented": false,
     "target": "hm2_7i80.0.resolver.02.index-divisor",
     "value": "[JOINT_2]RESOLVER_INDEX_DIVISOR"
    }
   ],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "4",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "176",
     "note": "net z-pos-fb        <= hm2_7i80.0.resolver.02.position"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "181",
     "note": "net z-pos-fb        => joint.2.motor-pos-fb"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "309",
     "note": "net z-pos-fb   => pid.z.feedback"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "118",
     "note": "setp hm2_7i80.0.resolver.02.scale [JOINT_2]RESOLVER_SCALE"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "147",
     "note": "setp hm2_7i80.0.resolver.02.velocity-scale  [JOINT_2]RESOLVER_VELOCITY_SCALE"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "157",
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
   "board": "none",
   "connector": "UNASSIGNED",
   "channel": "none",
   "hal_net": "",
   "direction": "ENCODER_IN",
   "direction_label": "Input (encoder)",
   "subsystem": "Spindle",
   "machine_subsystem": "Spindle feedback",
   "status": "UNBOUND",
   "field_point": "Machine-side A/B/Z spindle encoder if fitted",
   "designations": [],
   "primary_source": "motion_7i80hdt.hal",
   "cleanup_notes": "Current target leaves P3 empty and requests num_encoders=0. Identify encoder model/electrical format and select a compatible receiver/daughter interface plus IDROM-proven pins before allocation.",
   "location": "Spindle head — machine-side A/B/Z encoder if fitted",
   "location_note": "Unassigned: part, electrical format, receiver/interface and FPGA pins are not confirmed. P3 remains empty.",
   "expected": {
    "value": "Dynamic",
    "label": "Unavailable — encoder and receiver not identified; num_encoders=0",
    "basis": "motion_7i80hdt.hal spindle-feedback hold; P3 remains physically empty and resolver.03 is not used for spindle",
    "kind": "dynamic"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "5",
     "note": "Current wiring authority row"
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
   "id": "RES3_SPARE",
   "name": "Res3 Spare",
   "board": "7i49",
   "connector": "P2 Resolver channel",
   "channel": "RES3",
   "hal_net": "",
   "direction": "RESOLVER_IN",
   "direction_label": "Input (resolver)",
   "subsystem": "Motion",
   "machine_subsystem": "Motion",
   "status": "SPARE",
   "field_point": "7i49 spare resolver channel",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Available for future resolver feedback if firmware provisions it",
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
   "epson_ferrules": [],
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
   "id": "RES4_SPARE",
   "name": "Res4 Spare",
   "board": "7i49",
   "connector": "P2 Resolver channel",
   "channel": "RES4",
   "hal_net": "",
   "direction": "RESOLVER_IN",
   "direction_label": "Input (resolver)",
   "subsystem": "Motion",
   "machine_subsystem": "Motion",
   "status": "SPARE",
   "field_point": "7i49 spare resolver channel",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Available for future resolver feedback if firmware provisions it",
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "7",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 7
  },
  {
   "id": "RES5_SPARE",
   "name": "Res5 Spare",
   "board": "7i49",
   "connector": "P2 Resolver channel",
   "channel": "RES5",
   "hal_net": "",
   "direction": "RESOLVER_IN",
   "direction_label": "Input (resolver)",
   "subsystem": "Motion",
   "machine_subsystem": "Motion",
   "status": "SPARE",
   "field_point": "7i49 spare resolver channel",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Available for future resolver feedback if firmware provisions it",
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "8",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 8
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
     "line": 292,
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
     "line": 293,
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
     "line": 277,
     "text": "setp hm2_7i80.0.pwmgen.00.output-type 2    # X axis  -> 7i49 AOUT0",
     "commented": false,
     "target": "hm2_7i80.0.pwmgen.00.output-type",
     "value": "2"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 278,
     "text": "setp hm2_7i80.0.pwmgen.00.scale       [JOINT_0]OUTPUT_SCALE",
     "commented": false,
     "target": "hm2_7i80.0.pwmgen.00.scale",
     "value": "[JOINT_0]OUTPUT_SCALE"
    }
   ],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "9",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "292",
     "note": "net x-vel-cmd  <= pid.x.output"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "293",
     "note": "net x-vel-cmd  => hm2_7i80.0.pwmgen.00.value"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "277",
     "note": "setp hm2_7i80.0.pwmgen.00.output-type 2    # X axis  -> 7i49 AOUT0"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "278",
     "note": "setp hm2_7i80.0.pwmgen.00.scale       [JOINT_0]OUTPUT_SCALE"
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
     "line": 312,
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
     "line": 313,
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
     "line": 279,
     "text": "setp hm2_7i80.0.pwmgen.01.output-type 2    # Z axis  -> 7i49 AOUT1",
     "commented": false,
     "target": "hm2_7i80.0.pwmgen.01.output-type",
     "value": "2"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 280,
     "text": "setp hm2_7i80.0.pwmgen.01.scale       [JOINT_2]OUTPUT_SCALE",
     "commented": false,
     "target": "hm2_7i80.0.pwmgen.01.scale",
     "value": "[JOINT_2]OUTPUT_SCALE"
    }
   ],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "10",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "312",
     "note": "net z-vel-cmd  <= pid.z.output"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "313",
     "note": "net z-vel-cmd  => hm2_7i80.0.pwmgen.01.value    # Z → pwmgen.01 (7i49 AOUT1)"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "279",
     "note": "setp hm2_7i80.0.pwmgen.01.output-type 2    # Z axis  -> 7i49 AOUT1"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "280",
     "note": "setp hm2_7i80.0.pwmgen.01.scale       [JOINT_2]OUTPUT_SCALE"
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
     "line": 302,
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
     "line": 303,
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
     "line": 281,
     "text": "setp hm2_7i80.0.pwmgen.02.output-type 2    # Y axis  -> 7i49 AOUT2",
     "commented": false,
     "target": "hm2_7i80.0.pwmgen.02.output-type",
     "value": "2"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 282,
     "text": "setp hm2_7i80.0.pwmgen.02.scale       [JOINT_1]OUTPUT_SCALE",
     "commented": false,
     "target": "hm2_7i80.0.pwmgen.02.scale",
     "value": "[JOINT_1]OUTPUT_SCALE"
    }
   ],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "11",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "302",
     "note": "net y-vel-cmd  <= pid.y.output"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "303",
     "note": "net y-vel-cmd  => hm2_7i80.0.pwmgen.02.value    # Y → pwmgen.02 (7i49 AOUT2)"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "281",
     "note": "setp hm2_7i80.0.pwmgen.02.output-type 2    # Y axis  -> 7i49 AOUT2"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "282",
     "note": "setp hm2_7i80.0.pwmgen.02.scale       [JOINT_1]OUTPUT_SCALE"
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
     "line": 379,
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
     "line": 380,
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
     "line": 372,
     "text": "setp hm2_7i80.0.pwmgen.03.output-type 2",
     "commented": false,
     "target": "hm2_7i80.0.pwmgen.03.output-type",
     "value": "2"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 373,
     "text": "setp hm2_7i80.0.pwmgen.03.offset-mode 0",
     "commented": false,
     "target": "hm2_7i80.0.pwmgen.03.offset-mode",
     "value": "0"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 374,
     "text": "setp hm2_7i80.0.pwmgen.03.scale       [SPINDLE_0]OUTPUT_SCALE",
     "commented": false,
     "target": "hm2_7i80.0.pwmgen.03.scale",
     "value": "[SPINDLE_0]OUTPUT_SCALE"
    }
   ],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "12",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "379",
     "note": "net spindle-speed-cmd <= spindle.0.speed-out"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "380",
     "note": "net spindle-speed-cmd => hm2_7i80.0.pwmgen.03.value"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "372",
     "note": "setp hm2_7i80.0.pwmgen.03.output-type 2"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "373",
     "note": "setp hm2_7i80.0.pwmgen.03.offset-mode 0"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "374",
     "note": "setp hm2_7i80.0.pwmgen.03.scale       [SPINDLE_0]OUTPUT_SCALE"
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
   "authority_line": 12
  },
  {
   "id": "AOUT4_SPARE",
   "name": "Aout4 Spare",
   "board": "7i49",
   "connector": "P2 Analog TB",
   "channel": "AOUT4",
   "hal_net": "",
   "direction": "ANALOG_OUT",
   "direction_label": "Output (analog)",
   "subsystem": "Spare",
   "machine_subsystem": "Spare",
   "status": "SPARE",
   "field_point": "Spare 7i49 analog output",
   "designations": [],
   "primary_source": "frsx_orient_model.md",
   "cleanup_notes": "FR-SX orient is a discrete ORCM1 command; num_pwmgens=4 creates only pwmgen.00-.03 so AOUT4 is not provisioned in active firmware config",
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "13",
     "note": "Current wiring authority row"
    },
    {
     "file": "frsx_orient_model.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 13
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "14",
     "note": "Current wiring authority row"
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
   "id": "SSERIAL_PORT0_TXA",
   "name": "Sserial Port0 Txa",
   "board": "7i44",
   "connector": "P1 7i44 physical channel 0",
   "channel": "port0.TX+",
   "hal_net": "",
   "direction": "LINK",
   "direction_label": "Link (smart-serial)",
   "subsystem": "Field I/O",
   "machine_subsystem": "Field I/O",
   "status": "PROPOSED",
   "field_point": "7i84U-A RJ45 pin 2 RX+",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "7i44 channel 0 to 7i84U-A CN0 under HostMot2 port 0; RS-422 differential pair; promote to TRACED after physical continuity check",
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
   "epson_ferrules": [],
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
   "id": "SSERIAL_PORT0_TXB",
   "name": "Sserial Port0 Txb",
   "board": "7i44",
   "connector": "P1 7i44 physical channel 0",
   "channel": "port0.TX-",
   "hal_net": "",
   "direction": "LINK",
   "direction_label": "Link (smart-serial)",
   "subsystem": "Field I/O",
   "machine_subsystem": "Field I/O",
   "status": "PROPOSED",
   "field_point": "7i84U-A RJ45 pin 1 RX-",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "RS-422 differential pair; promote to TRACED after physical continuity check",
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
   "epson_ferrules": [],
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
   "id": "SSERIAL_PORT0_RXA",
   "name": "Sserial Port0 Rxa",
   "board": "7i44",
   "connector": "P1 7i44 physical channel 0",
   "channel": "port0.RX+",
   "hal_net": "",
   "direction": "LINK",
   "direction_label": "Link (smart-serial)",
   "subsystem": "Field I/O",
   "machine_subsystem": "Field I/O",
   "status": "PROPOSED",
   "field_point": "7i84U-A RJ45 pin 6 TX+",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "RS-422 differential pair; promote to TRACED after physical continuity check",
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
   "epson_ferrules": [],
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
   "id": "SSERIAL_PORT0_RXB",
   "name": "Sserial Port0 Rxb",
   "board": "7i44",
   "connector": "P1 7i44 physical channel 0",
   "channel": "port0.RX-",
   "hal_net": "",
   "direction": "LINK",
   "direction_label": "Link (smart-serial)",
   "subsystem": "Field I/O",
   "machine_subsystem": "Field I/O",
   "status": "PROPOSED",
   "field_point": "7i84U-A RJ45 pin 3 TX-",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "RS-422 differential pair; promote to TRACED after physical continuity check",
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
   "epson_ferrules": [],
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
   "id": "SSERIAL_PORT0_GND",
   "name": "Sserial Port0 Gnd",
   "board": "7i44",
   "connector": "P1 7i44 physical channel 0",
   "channel": "port0.GND",
   "hal_net": "",
   "direction": "LINK",
   "direction_label": "Link (smart-serial)",
   "subsystem": "Field I/O",
   "machine_subsystem": "Field I/O",
   "status": "PROPOSED",
   "field_point": "7i84U-A RJ45 pin 4/5 ground",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Shield drain to 7i44 end only; promote to TRACED after physical continuity check",
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
   "epson_ferrules": [],
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
   "id": "SSERIAL_PORT0_5V",
   "name": "Sserial Port0 5V",
   "board": "7i44",
   "connector": "P1 7i44 physical channel 0",
   "channel": "port0.+5V",
   "hal_net": "",
   "direction": "LINK",
   "direction_label": "Link (smart-serial)",
   "subsystem": "Field I/O",
   "machine_subsystem": "Field I/O",
   "status": "PROPOSED",
   "field_point": "7i84U-A RJ45 pin 7/8 +5V",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Serial power for 7i84U-A logic; promote to TRACED after physical continuity check",
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
   "epson_ferrules": [],
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
   "id": "SSERIAL_PORTS_2_7_SPARE",
   "name": "Sserial Ports 2 7 Spare",
   "board": "7i44",
   "connector": "P1 7i44 physical channels 2-7",
   "channel": "ports2-7",
   "hal_net": "",
   "direction": "LINK",
   "direction_label": "Link (smart-serial)",
   "subsystem": "Expansion",
   "machine_subsystem": "Expansion",
   "status": "SPARE",
   "field_point": "Spare smart-serial channels",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "7i44 has 8 RS-422 physical channels; channels 0/1 = 7i84U-A/B within HostMot2 port 0; channels 2-7 remain spare for MPG pendant, 4th-axis card, or additional 7i84 expansion.",
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
   "epson_ferrules": [],
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
   "id": "SEVENI84U_FIELD_A_24V",
   "name": "Seveni84U Field A 24V",
   "board": "7i84U-A",
   "connector": "TB1",
   "channel": "TB1 pins 3/4 VFIELDA (+24 V field power, 5-28 VDC)",
   "hal_net": "",
   "direction": "POWER",
   "direction_label": "Power / common",
   "subsystem": "Power",
   "machine_subsystem": "Field power",
   "status": "COMMISSIONING_PENDING",
   "field_point": "Field power bank A (TB3 I/O)",
   "designations": [
    "TB-3"
   ],
   "primary_source": "Mesa 7i84U manual pp.2/7-8/47",
   "cleanup_notes": "Both terminals are VFIELDA; powers TB3 outputs 0-7 and inputs 0-15. Never connect either pin to 0 V.",
   "location": "Field I/O enclosure — 7i84U-A TB1 pins 3/4",
   "location_note": "VFIELDA for TB3 bank",
   "expected": {
    "value": "24 V",
    "label": "VFIELDA supply for TB3 outputs 0-7 and inputs 0-15; TB1 pins 3/4 are both positive",
    "basis": "Mesa 7i84U manual pp.7-8/47",
    "kind": "na"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "22",
     "note": "Current wiring authority row"
    },
    {
     "file": "Mesa 7i84U manual pp.2/7-8/47",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 22
  },
  {
   "id": "SEVENI84U_FIELD_B_24V",
   "name": "Seveni84U Field B 24V",
   "board": "7i84U-A",
   "connector": "TB1",
   "channel": "TB1 pins 1/2 VFIELDB (+24 V field power, 5-28 VDC)",
   "hal_net": "",
   "direction": "POWER",
   "direction_label": "Power / common",
   "subsystem": "Power",
   "machine_subsystem": "Field power",
   "status": "COMMISSIONING_PENDING",
   "field_point": "Field power bank B (TB2 I/O)",
   "designations": [
    "TB-2"
   ],
   "primary_source": "Mesa 7i84U manual pp.2/7-8/47",
   "cleanup_notes": "Both terminals are VFIELDB; powers TB2 outputs 8-15 and inputs 16-31. Never connect either pin to 0 V.",
   "location": "Field I/O enclosure — 7i84U-A TB1 pins 1/2",
   "location_note": "VFIELDB for TB2 bank",
   "expected": {
    "value": "24 V",
    "label": "VFIELDB supply for TB2 outputs 8-15 and inputs 16-31; TB1 pins 1/2 are both positive",
    "basis": "Mesa 7i84U manual pp.7-8/47",
    "kind": "na"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "23",
     "note": "Current wiring authority row"
    },
    {
     "file": "Mesa 7i84U manual pp.2/7-8/47",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 23
  },
  {
   "id": "ATC_ZONE_Y",
   "name": "Atc Zone Y",
   "board": "7i84U-A",
   "connector": "TB3",
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
    "hm2_7i80.0.7i84.0.0.input-00"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 33,
     "text": "net atc-y-zone         <= hm2_7i80.0.7i84.0.0.input-00   # IN0  PRS-55 Y ATC zone",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-00"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "24",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "33",
     "note": "net atc-y-zone         <= hm2_7i80.0.7i84.0.0.input-00   # IN0  PRS-55 Y ATC zone"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 24
  },
  {
   "id": "ATC_ZONE_Z",
   "name": "Atc Zone Z",
   "board": "7i84U-A",
   "connector": "TB3",
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
    "hm2_7i80.0.7i84.0.0.input-01"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 34,
     "text": "net atc-z-zone         <= hm2_7i80.0.7i84.0.0.input-01   # IN1  PRS-66 Z ATC zone",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-01"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "25",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "34",
     "note": "net atc-z-zone         <= hm2_7i80.0.7i84.0.0.input-01   # IN1  PRS-66 Z ATC zone"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 25
  },
  {
   "id": "MAG_TOOL_AVAILABLE",
   "name": "Mag Tool Available",
   "board": "7i84U-A",
   "connector": "TB3",
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
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-02"
   ],
   "producers": [],
   "consumers": [
    "mazak-atc.mag-tool-avail"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 106,
     "text": "net mag-tool-avail        <= hm2_7i80.0.7i84.0.0.input-02   # IN2  X005 MGTDPRS",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-02"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 231,
     "text": "net mag-tool-avail      => mazak-atc.mag-tool-avail",
     "commented": false,
     "producers": [],
     "consumers": [
      "mazak-atc.mag-tool-avail"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "26",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "106",
     "note": "net mag-tool-avail        <= hm2_7i80.0.7i84.0.0.input-02   # IN2  X005 MGTDPRS"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "231",
     "note": "net mag-tool-avail      => mazak-atc.mag-tool-avail"
    },
    {
     "file": "phase2_plan",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 26
  },
  {
   "id": "SPINDLE_TOOL_AVAILABLE",
   "name": "Spindle Tool Available",
   "board": "7i84U-A",
   "connector": "TB3",
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
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-03"
   ],
   "producers": [],
   "consumers": [
    "mazak-atc.spindle-tool-avail"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 107,
     "text": "net spindle-tool-avail    <= hm2_7i80.0.7i84.0.0.input-03   # IN3  X05B SPTDPRS",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-03"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 232,
     "text": "net spindle-tool-avail  => mazak-atc.spindle-tool-avail",
     "commented": false,
     "producers": [],
     "consumers": [
      "mazak-atc.spindle-tool-avail"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "27",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "107",
     "note": "net spindle-tool-avail    <= hm2_7i80.0.7i84.0.0.input-03   # IN3  X05B SPTDPRS"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "232",
     "note": "net spindle-tool-avail  => mazak-atc.spindle-tool-avail"
    },
    {
     "file": "phase2_plan",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 27
  },
  {
   "id": "SPINDLE_ORIENT_ARRIVAL",
   "name": "Spindle Orient Arrival",
   "board": "7i84U-A",
   "connector": "TB3",
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
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-04"
   ],
   "producers": [],
   "consumers": [
    "mazak-orient.spindle-oriented"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 108,
     "text": "net spindle-oriented      <= hm2_7i80.0.7i84.0.0.input-04   # IN4  X003 ORA1",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-04"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 158,
     "text": "net spindle-oriented    => mazak-orient.spindle-oriented",
     "commented": false,
     "producers": [],
     "consumers": [
      "mazak-orient.spindle-oriented"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "28",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "108",
     "note": "net spindle-oriented      <= hm2_7i80.0.7i84.0.0.input-04   # IN4  X003 ORA1"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "158",
     "note": "net spindle-oriented    => mazak-orient.spindle-oriented"
    },
    {
     "file": "element_list_crosswalk_2026-07-27",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 28
  },
  {
   "id": "SPINDLE_ZERO_SPEED",
   "name": "Spindle Zero Speed",
   "board": "7i84U-A",
   "connector": "TB3",
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
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-05"
   ],
   "producers": [],
   "consumers": [
    "mazak-orient.spindle-zero-speed",
    "mazak-atc.spindle-stopped"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 109,
     "text": "net spindle-zero-speed    <= hm2_7i80.0.7i84.0.0.input-05   # IN5  X001 SZS.M",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-05"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 159,
     "text": "net spindle-zero-speed  => mazak-orient.spindle-zero-speed",
     "commented": false,
     "producers": [],
     "consumers": [
      "mazak-orient.spindle-zero-speed"
     ],
     "bidir": []
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 196,
     "text": "net spindle-zero-speed  => mazak-atc.spindle-stopped",
     "commented": false,
     "producers": [],
     "consumers": [
      "mazak-atc.spindle-stopped"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [
    {
     "label_text": "A3-06",
     "wire": "231",
     "old_location": "CN4-1",
     "signal": "SPINDLE ZERO SPEED",
     "mesa_card": "7i84U-A",
     "connector": "TB3",
     "logical_channel": "IN5",
     "physical_pin": "TB3-06",
     "crosswalk_status": "PLANNED_MATCH",
     "release_status": "HOLD_SOURCE_TRACE",
     "source_line": 14
    }
   ],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "29",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "109",
     "note": "net spindle-zero-speed    <= hm2_7i80.0.7i84.0.0.input-05   # IN5  X001 SZS.M"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "159",
     "note": "net spindle-zero-speed  => mazak-orient.spindle-zero-speed"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "196",
     "note": "net spindle-zero-speed  => mazak-atc.spindle-stopped"
    },
    {
     "file": "element_list_crosswalk_2026-07-27",
     "lines": "",
     "note": "primary_source column in the authority table"
    },
    {
     "file": "wiring/bbia1_mesa_end_ferrules_epson.csv",
     "lines": "14",
     "note": "Epson Mesa-end ferrule A3-06; HOLD_SOURCE_TRACE"
    }
   ],
   "conflicts": [],
   "authority_line": 29
  },
  {
   "id": "MAG_COVER_OPEN_CONF",
   "name": "Mag Cover Open Conf",
   "board": "7i84U-A",
   "connector": "TB3",
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
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-06"
   ],
   "producers": [],
   "consumers": [
    "mazak-atc.mag-cover-open-conf"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 110,
     "text": "net mag-cover-open-conf   <= hm2_7i80.0.7i84.0.0.input-06   # IN6  X052 MGCORS",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-06"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 227,
     "text": "net mag-cover-open-conf   => mazak-atc.mag-cover-open-conf",
     "commented": false,
     "producers": [],
     "consumers": [
      "mazak-atc.mag-cover-open-conf"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "30",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "110",
     "note": "net mag-cover-open-conf   <= hm2_7i80.0.7i84.0.0.input-06   # IN6  X052 MGCORS"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "227",
     "note": "net mag-cover-open-conf   => mazak-atc.mag-cover-open-conf"
    },
    {
     "file": "element_list_crosswalk_2026-07-27",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 30
  },
  {
   "id": "MAG_COVER_CLOSE_CONF",
   "name": "Mag Cover Close Conf",
   "board": "7i84U-A",
   "connector": "TB3",
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
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-07"
   ],
   "producers": [],
   "consumers": [
    "mazak-atc.mag-cover-closed-conf"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 111,
     "text": "net mag-cover-closed-conf <= hm2_7i80.0.7i84.0.0.input-07   # IN7  X053 MGCCRS",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-07"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 228,
     "text": "net mag-cover-closed-conf => mazak-atc.mag-cover-closed-conf",
     "commented": false,
     "producers": [],
     "consumers": [
      "mazak-atc.mag-cover-closed-conf"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "31",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "111",
     "note": "net mag-cover-closed-conf <= hm2_7i80.0.7i84.0.0.input-07   # IN7  X053 MGCCRS"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "228",
     "note": "net mag-cover-closed-conf => mazak-atc.mag-cover-closed-conf"
    },
    {
     "file": "element_list_crosswalk_2026-07-27",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 31
  },
  {
   "id": "THERMAL_ALARM_CHAIN",
   "name": "Thermal Alarm Chain",
   "board": "7i84U-A",
   "connector": "TB3",
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
   "cleanup_notes": "Series-wired NC X073 THR.M + X07B ONT.M; alarm-only, not in E-stop chain; field continuity and polarity remain unverified.",
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
    "hm2_7i80.0.7i84.0.0.input-08"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 38,
     "text": "net thermal-alarm      <= hm2_7i80.0.7i84.0.0.input-08   # IN8  X073 THR.M + X07B ONT.M series NC",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-08"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "32",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "38",
     "note": "net thermal-alarm      <= hm2_7i80.0.7i84.0.0.input-08   # IN8  X073 THR.M + X07B ONT.M series NC"
    },
    {
     "file": "element_list_crosswalk_2026-07-27 + open_issues.md §3 (2026-08-03)",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 32
  },
  {
   "id": "MANUAL_TOOL_UNCLAMP_PB",
   "name": "Manual Tool Unclamp Pb",
   "board": "7i84U-A",
   "connector": "TB3",
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
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-09"
   ],
   "producers": [],
   "consumers": [
    "mazak-atc.manual-unclamp-pb"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 112,
     "text": "net manual-unclamp-pb     <= hm2_7i80.0.7i84.0.0.input-09   # IN9  X01A TUCFS.M",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-09"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 218,
     "text": "net manual-unclamp-pb   => mazak-atc.manual-unclamp-pb",
     "commented": false,
     "producers": [],
     "consumers": [
      "mazak-atc.manual-unclamp-pb"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "33",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "112",
     "note": "net manual-unclamp-pb     <= hm2_7i80.0.7i84.0.0.input-09   # IN9  X01A TUCFS.M"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "218",
     "note": "net manual-unclamp-pb   => mazak-atc.manual-unclamp-pb"
    },
    {
     "file": "element_list_crosswalk_2026-07-27",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 33
  },
  {
   "id": "X_DRIVE_FAULT",
   "name": "X Drive Fault",
   "board": "7i84U-A",
   "connector": "TB3",
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
    "basis": "field_7i84u.hal drive-fault block — select raw input or input-NN-not only after bench verification",
    "kind": "unknown-polarity"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-10"
   ],
   "producers": [],
   "consumers": [
    "resolver-fault-x.in0"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 52,
     "text": "net x-drive-fault      <= hm2_7i80.0.7i84.0.0.input-10   # IN10 X drive ALM",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-10"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 53,
     "text": "net x-drive-fault      => resolver-fault-x.in0",
     "commented": false,
     "producers": [],
     "consumers": [
      "resolver-fault-x.in0"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "34",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "52",
     "note": "net x-drive-fault      <= hm2_7i80.0.7i84.0.0.input-10   # IN10 X drive ALM"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "53",
     "note": "net x-drive-fault      => resolver-fault-x.in0"
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
   "id": "Y_DRIVE_FAULT",
   "name": "Y Drive Fault",
   "board": "7i84U-A",
   "connector": "TB3",
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
    "hm2_7i80.0.7i84.0.0.input-11"
   ],
   "producers": [],
   "consumers": [
    "resolver-fault-y.in0"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 54,
     "text": "net y-drive-fault      <= hm2_7i80.0.7i84.0.0.input-11   # IN11 Y drive ALM",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-11"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 55,
     "text": "net y-drive-fault      => resolver-fault-y.in0",
     "commented": false,
     "producers": [],
     "consumers": [
      "resolver-fault-y.in0"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "35",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "54",
     "note": "net y-drive-fault      <= hm2_7i80.0.7i84.0.0.input-11   # IN11 Y drive ALM"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "55",
     "note": "net y-drive-fault      => resolver-fault-y.in0"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 35
  },
  {
   "id": "Z_DRIVE_FAULT",
   "name": "Z Drive Fault",
   "board": "7i84U-A",
   "connector": "TB3",
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
    "hm2_7i80.0.7i84.0.0.input-12"
   ],
   "producers": [],
   "consumers": [
    "resolver-fault-z.in0"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 56,
     "text": "net z-drive-fault      <= hm2_7i80.0.7i84.0.0.input-12   # IN12 Z drive ALM",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-12"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 57,
     "text": "net z-drive-fault      => resolver-fault-z.in0",
     "commented": false,
     "producers": [],
     "consumers": [
      "resolver-fault-z.in0"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "36",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "56",
     "note": "net z-drive-fault      <= hm2_7i80.0.7i84.0.0.input-12   # IN12 Z drive ALM"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "57",
     "note": "net z-drive-fault      => resolver-fault-z.in0"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 36
  },
  {
   "id": "SPINDLE_AT_SPEED",
   "name": "Spindle At Speed",
   "board": "7i84U-A",
   "connector": "TB3",
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
    "value": "Unknown",
    "label": "FR-SX speed-reach field input; normal state and terminal remain unverified",
    "basis": "field_7i84u.hal: spindle-at-speed is sourced only from 7i84U-A IN13; no forced writer remains",
    "kind": "unknown-polarity"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-13"
   ],
   "producers": [],
   "consumers": [
    "spindle.0.at-speed"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 64,
     "text": "net spindle-at-speed   <= hm2_7i80.0.7i84.0.0.input-13   # IN13 FR-SX SPD-REACH",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-13"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 65,
     "text": "net spindle-at-speed   => spindle.0.at-speed",
     "commented": false,
     "producers": [],
     "consumers": [
      "spindle.0.at-speed"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "37",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "64",
     "note": "net spindle-at-speed   <= hm2_7i80.0.7i84.0.0.input-13   # IN13 FR-SX SPD-REACH"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "65",
     "note": "net spindle-at-speed   => spindle.0.at-speed"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 37
  },
  {
   "id": "SPINDLE_FAULT",
   "name": "Spindle Fault",
   "board": "7i84U-A",
   "connector": "TB3",
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
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-14"
   ],
   "producers": [],
   "consumers": [
    "logic.spindle-fault-not.in-00",
    "spindle.0.amp-fault-in",
    "mazak-orient.drive-fault",
    "atc-safety-abort-or.in1"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/mazak_vqc_20_40.hal",
     "line": 307,
     "text": "net spindle-fault        => logic.spindle-fault-not.in-00",
     "commented": false,
     "producers": [],
     "consumers": [
      "logic.spindle-fault-not.in-00"
     ],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 66,
     "text": "net spindle-fault      <= hm2_7i80.0.7i84.0.0.input-14   # IN14 FR-SX ALM",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-14"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 67,
     "text": "net spindle-fault      => spindle.0.amp-fault-in",
     "commented": false,
     "producers": [],
     "consumers": [
      "spindle.0.amp-fault-in"
     ],
     "bidir": []
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 161,
     "text": "net spindle-fault       => mazak-orient.drive-fault",
     "commented": false,
     "producers": [],
     "consumers": [
      "mazak-orient.drive-fault"
     ],
     "bidir": []
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 261,
     "text": "net spindle-fault       => atc-safety-abort-or.in1",
     "commented": false,
     "producers": [],
     "consumers": [
      "atc-safety-abort-or.in1"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "38",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/mazak_vqc_20_40.hal",
     "lines": "307",
     "note": "net spindle-fault        => logic.spindle-fault-not.in-00"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "66",
     "note": "net spindle-fault      <= hm2_7i80.0.7i84.0.0.input-14   # IN14 FR-SX ALM"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "67",
     "note": "net spindle-fault      => spindle.0.amp-fault-in"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "161",
     "note": "net spindle-fault       => mazak-orient.drive-fault"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "261",
     "note": "net spindle-fault       => atc-safety-abort-or.in1"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 38
  },
  {
   "id": "TOOL_CLAMP_CONF",
   "name": "Tool Clamp Conf",
   "board": "7i84U-A",
   "connector": "TB3",
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
    "hm2_7i80.0.7i84.0.0.input-15"
   ],
   "producers": [],
   "consumers": [
    "mazak-atc.tool-clamped"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 68,
     "text": "net tool-clamped       <= hm2_7i80.0.7i84.0.0.input-15   # IN15 PRS-9 tool-clamp confirm",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-15"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 216,
     "text": "net tool-clamped        => mazak-atc.tool-clamped",
     "commented": false,
     "producers": [],
     "consumers": [
      "mazak-atc.tool-clamped"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "39",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "68",
     "note": "net tool-clamped       <= hm2_7i80.0.7i84.0.0.input-15   # IN15 PRS-9 tool-clamp confirm"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "216",
     "note": "net tool-clamped        => mazak-atc.tool-clamped"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C5"
   ],
   "authority_line": 39
  },
  {
   "id": "TOOL_UNCLAMP_CONF",
   "name": "Tool Unclamp Conf",
   "board": "7i84U-A",
   "connector": "TB2",
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
    "hm2_7i80.0.7i84.0.0.input-16"
   ],
   "producers": [],
   "consumers": [
    "mazak-atc.tool-unclamped"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 71,
     "text": "net tool-unclamped     <= hm2_7i80.0.7i84.0.0.input-16   # IN16 PRS-8 tool-unclamp confirm",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-16"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 217,
     "text": "net tool-unclamped      => mazak-atc.tool-unclamped",
     "commented": false,
     "producers": [],
     "consumers": [
      "mazak-atc.tool-unclamped"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "40",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "71",
     "note": "net tool-unclamped     <= hm2_7i80.0.7i84.0.0.input-16   # IN16 PRS-8 tool-unclamp confirm"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "217",
     "note": "net tool-unclamped      => mazak-atc.tool-unclamped"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C5"
   ],
   "authority_line": 40
  },
  {
   "id": "GEAR_HI_CONF",
   "name": "Gear Hi Conf",
   "board": "7i84U-A",
   "connector": "TB2",
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
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-17"
   ],
   "producers": [],
   "consumers": [
    "mazak-orient.gear-hi-conf"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 113,
     "text": "net gear-hi-conf          <= hm2_7i80.0.7i84.0.0.input-17   # IN17 PRS-10 HGPRS",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-17"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 168,
     "text": "net gear-hi-conf        => mazak-orient.gear-hi-conf",
     "commented": false,
     "producers": [],
     "consumers": [
      "mazak-orient.gear-hi-conf"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "41",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "113",
     "note": "net gear-hi-conf          <= hm2_7i80.0.7i84.0.0.input-17   # IN17 PRS-10 HGPRS"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "168",
     "note": "net gear-hi-conf        => mazak-orient.gear-hi-conf"
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
   "authority_line": 41
  },
  {
   "id": "GEAR_LO_CONF",
   "name": "Gear Lo Conf",
   "board": "7i84U-A",
   "connector": "TB2",
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
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-18"
   ],
   "producers": [],
   "consumers": [
    "mazak-orient.gear-lo-conf"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 114,
     "text": "net gear-lo-conf          <= hm2_7i80.0.7i84.0.0.input-18   # IN18 PRS-12 LGPRS",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-18"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 169,
     "text": "net gear-lo-conf        => mazak-orient.gear-lo-conf",
     "commented": false,
     "producers": [],
     "consumers": [
      "mazak-orient.gear-lo-conf"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "42",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "114",
     "note": "net gear-lo-conf          <= hm2_7i80.0.7i84.0.0.input-18   # IN18 PRS-12 LGPRS"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "169",
     "note": "net gear-lo-conf        => mazak-orient.gear-lo-conf"
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
   "authority_line": 42
  },
  {
   "id": "MAG_BCD_BIT0",
   "name": "Mag Bcd Bit0",
   "board": "7i84U-A",
   "connector": "TB2",
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
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-19"
   ],
   "producers": [],
   "consumers": [
    "mazak-atc.mag-bcd-bit0"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 115,
     "text": "net mag-bcd-bit0          <= hm2_7i80.0.7i84.0.0.input-19   # IN19 X008 T11P  (1)",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-19"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 205,
     "text": "net mag-bcd-bit0   => mazak-atc.mag-bcd-bit0",
     "commented": false,
     "producers": [],
     "consumers": [
      "mazak-atc.mag-bcd-bit0"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [
    {
     "label_text": "A2-04",
     "wire": "150",
     "old_location": "CN2-4",
     "signal": "MAGAZINE ROT POS 1",
     "mesa_card": "7i84U-A",
     "connector": "TB2",
     "logical_channel": "IN19",
     "physical_pin": "TB2-04",
     "crosswalk_status": "PLANNED_MATCH",
     "release_status": "HOLD_SOURCE_TRACE",
     "source_line": 3
    }
   ],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "43",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "115",
     "note": "net mag-bcd-bit0          <= hm2_7i80.0.7i84.0.0.input-19   # IN19 X008 T11P  (1)"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "205",
     "note": "net mag-bcd-bit0   => mazak-atc.mag-bcd-bit0"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    },
    {
     "file": "wiring/bbia1_mesa_end_ferrules_epson.csv",
     "lines": "3",
     "note": "Epson Mesa-end ferrule A2-04; HOLD_SOURCE_TRACE"
    }
   ],
   "conflicts": [],
   "authority_line": 43
  },
  {
   "id": "MAG_BCD_BIT1",
   "name": "Mag Bcd Bit1",
   "board": "7i84U-A",
   "connector": "TB2",
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
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-20"
   ],
   "producers": [],
   "consumers": [
    "mazak-atc.mag-bcd-bit1"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 116,
     "text": "net mag-bcd-bit1          <= hm2_7i80.0.7i84.0.0.input-20   # IN20 X009 T12P  (2)",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-20"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 206,
     "text": "net mag-bcd-bit1   => mazak-atc.mag-bcd-bit1",
     "commented": false,
     "producers": [],
     "consumers": [
      "mazak-atc.mag-bcd-bit1"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [
    {
     "label_text": "A2-05",
     "wire": "221",
     "old_location": "CN2-5",
     "signal": "MAGAZINE ROT POS 2",
     "mesa_card": "7i84U-A",
     "connector": "TB2",
     "logical_channel": "IN20",
     "physical_pin": "TB2-05",
     "crosswalk_status": "PLANNED_MATCH",
     "release_status": "HOLD_SOURCE_TRACE",
     "source_line": 4
    }
   ],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "44",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "116",
     "note": "net mag-bcd-bit1          <= hm2_7i80.0.7i84.0.0.input-20   # IN20 X009 T12P  (2)"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "206",
     "note": "net mag-bcd-bit1   => mazak-atc.mag-bcd-bit1"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    },
    {
     "file": "wiring/bbia1_mesa_end_ferrules_epson.csv",
     "lines": "4",
     "note": "Epson Mesa-end ferrule A2-05; HOLD_SOURCE_TRACE"
    }
   ],
   "conflicts": [],
   "authority_line": 44
  },
  {
   "id": "MAG_BCD_BIT2",
   "name": "Mag Bcd Bit2",
   "board": "7i84U-A",
   "connector": "TB2",
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
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-21"
   ],
   "producers": [],
   "consumers": [
    "mazak-atc.mag-bcd-bit2"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 117,
     "text": "net mag-bcd-bit2          <= hm2_7i80.0.7i84.0.0.input-21   # IN21 X00A T14P  (4)",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-21"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 207,
     "text": "net mag-bcd-bit2   => mazak-atc.mag-bcd-bit2",
     "commented": false,
     "producers": [],
     "consumers": [
      "mazak-atc.mag-bcd-bit2"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [
    {
     "label_text": "A2-06",
     "wire": "222",
     "old_location": "CN2-6",
     "signal": "MAGAZINE ROT POS 4",
     "mesa_card": "7i84U-A",
     "connector": "TB2",
     "logical_channel": "IN21",
     "physical_pin": "TB2-06",
     "crosswalk_status": "PLANNED_MATCH",
     "release_status": "HOLD_SOURCE_TRACE",
     "source_line": 5
    }
   ],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "45",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "117",
     "note": "net mag-bcd-bit2          <= hm2_7i80.0.7i84.0.0.input-21   # IN21 X00A T14P  (4)"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "207",
     "note": "net mag-bcd-bit2   => mazak-atc.mag-bcd-bit2"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    },
    {
     "file": "wiring/bbia1_mesa_end_ferrules_epson.csv",
     "lines": "5",
     "note": "Epson Mesa-end ferrule A2-06; HOLD_SOURCE_TRACE"
    }
   ],
   "conflicts": [],
   "authority_line": 45
  },
  {
   "id": "MAG_BCD_BIT3",
   "name": "Mag Bcd Bit3",
   "board": "7i84U-A",
   "connector": "TB2",
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
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-22"
   ],
   "producers": [],
   "consumers": [
    "mazak-atc.mag-bcd-bit3"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 118,
     "text": "net mag-bcd-bit3          <= hm2_7i80.0.7i84.0.0.input-22   # IN22 X00B T18P  (8)",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-22"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 208,
     "text": "net mag-bcd-bit3   => mazak-atc.mag-bcd-bit3",
     "commented": false,
     "producers": [],
     "consumers": [
      "mazak-atc.mag-bcd-bit3"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [
    {
     "label_text": "A2-07",
     "wire": "223",
     "old_location": "CN2-7",
     "signal": "MAGAZINE ROT POS 8",
     "mesa_card": "7i84U-A",
     "connector": "TB2",
     "logical_channel": "IN22",
     "physical_pin": "TB2-07",
     "crosswalk_status": "PLANNED_MATCH",
     "release_status": "HOLD_SOURCE_TRACE",
     "source_line": 6
    }
   ],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "46",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "118",
     "note": "net mag-bcd-bit3          <= hm2_7i80.0.7i84.0.0.input-22   # IN22 X00B T18P  (8)"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "208",
     "note": "net mag-bcd-bit3   => mazak-atc.mag-bcd-bit3"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    },
    {
     "file": "wiring/bbia1_mesa_end_ferrules_epson.csv",
     "lines": "6",
     "note": "Epson Mesa-end ferrule A2-07; HOLD_SOURCE_TRACE"
    }
   ],
   "conflicts": [],
   "authority_line": 46
  },
  {
   "id": "MAG_BCD_BIT4",
   "name": "Mag Bcd Bit4",
   "board": "7i84U-A",
   "connector": "TB2",
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
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-23"
   ],
   "producers": [],
   "consumers": [
    "mazak-atc.mag-bcd-bit4"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 119,
     "text": "net mag-bcd-bit4          <= hm2_7i80.0.7i84.0.0.input-23   # IN23 X00C T21P (10)",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-23"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 209,
     "text": "net mag-bcd-bit4   => mazak-atc.mag-bcd-bit4",
     "commented": false,
     "producers": [],
     "consumers": [
      "mazak-atc.mag-bcd-bit4"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [
    {
     "label_text": "A2-08",
     "wire": "224",
     "old_location": "CN2-8",
     "signal": "MAGAZINE ROT POS 10",
     "mesa_card": "7i84U-A",
     "connector": "TB2",
     "logical_channel": "IN23",
     "physical_pin": "TB2-08",
     "crosswalk_status": "PLANNED_MATCH",
     "release_status": "HOLD_SOURCE_TRACE",
     "source_line": 7
    }
   ],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "47",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "119",
     "note": "net mag-bcd-bit4          <= hm2_7i80.0.7i84.0.0.input-23   # IN23 X00C T21P (10)"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "209",
     "note": "net mag-bcd-bit4   => mazak-atc.mag-bcd-bit4"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    },
    {
     "file": "wiring/bbia1_mesa_end_ferrules_epson.csv",
     "lines": "7",
     "note": "Epson Mesa-end ferrule A2-08; HOLD_SOURCE_TRACE"
    }
   ],
   "conflicts": [],
   "authority_line": 47
  },
  {
   "id": "DOOR_INTERLOCK",
   "name": "Door Interlock",
   "board": "7i84U-A",
   "connector": "TB2",
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
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-24"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 75,
     "text": "net door-interlock     <= hm2_7i80.0.7i84.0.0.input-24   # IN24 LS-140+LS-141+X01D ITMDSS series NC",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-24"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "48",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "75",
     "note": "net door-interlock     <= hm2_7i80.0.7i84.0.0.input-24   # IN24 LS-140+LS-141+X01D ITMDSS series NC"
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
   "authority_line": 48
  },
  {
   "id": "LUBE_OK",
   "name": "Lube Ok",
   "board": "7i84U-A",
   "connector": "TB2",
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
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-25"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 76,
     "text": "net lube-ok            <= hm2_7i80.0.7i84.0.0.input-25   # IN25 X042 HLP2 + X079 HLP series NC",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-25"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "49",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "76",
     "note": "net lube-ok            <= hm2_7i80.0.7i84.0.0.input-25   # IN25 X042 HLP2 + X079 HLP series NC"
    },
    {
     "file": "element_list_crosswalk_2026-07-27 + open_issues.md §3 (2026-08-03)",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 49
  },
  {
   "id": "COOLANT_LOW",
   "name": "Coolant Low",
   "board": "7i84U-A",
   "connector": "TB2",
   "channel": "IN26",
   "hal_net": "coolant-low",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Coolant",
   "machine_subsystem": "Coolant",
   "status": "COMMISSIONING_PENDING",
   "field_point": "Coolant level switch",
   "designations": [],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Net name follows HAL (polarity assumption: low = warning). Verify normal-state polarity in cabinet before promoting.",
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
    "hm2_7i80.0.7i84.0.0.input-26"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 77,
     "text": "net coolant-low        <= hm2_7i80.0.7i84.0.0.input-26   # IN26 coolant level (polarity TBD)",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-26"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "50",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "77",
     "note": "net coolant-low        <= hm2_7i80.0.7i84.0.0.input-26   # IN26 coolant level (polarity TBD)"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 50
  },
  {
   "id": "HYD_PRESS_OK",
   "name": "Hyd Press Ok",
   "board": "7i84U-A",
   "connector": "TB2",
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
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-27"
   ],
   "producers": [],
   "consumers": [
    "mazak-atc.hydraulic-ok"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 120,
     "text": "net hydraulic-ok          <= hm2_7i80.0.7i84.0.0.input-27   # IN27 pressure switch",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-27"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 198,
     "text": "net hydraulic-ok        => mazak-atc.hydraulic-ok",
     "commented": false,
     "producers": [],
     "consumers": [
      "mazak-atc.hydraulic-ok"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "51",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "120",
     "note": "net hydraulic-ok          <= hm2_7i80.0.7i84.0.0.input-27   # IN27 pressure switch"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "198",
     "note": "net hydraulic-ok        => mazak-atc.hydraulic-ok"
    },
    {
     "file": "phase2_plan",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 51
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
   "cleanup_notes": "Displaced 2026-07-27: IN28 reclaimed for MAG_IN_POS (mandatory ATC input). Pendant WHB04B is the current cycle-start path; no 7i84U-B terminal is assigned unless the physical panel button is deliberately restored to scope.",
   "location": "Operating panel A/B — cycle start pushbutton",
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "52",
     "note": "Current wiring authority row"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 52
  },
  {
   "id": "MAG_IN_POS",
   "name": "Mag In Pos",
   "board": "7i84U-A",
   "connector": "TB2",
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
   "cleanup_notes": "Mandatory for magazine indexing (rungs 3401/33xx). Writer added in field_7i84u.hal:79 (net mag-in-pos <= input-28) on 2026-08-06. Verify prox type/polarity before commissioning.",
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
    "hm2_7i80.0.7i84.0.0.input-28"
   ],
   "producers": [],
   "consumers": [
    "mazak-atc.mag-in-pos"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 89,
     "text": "net mag-in-pos         <= hm2_7i80.0.7i84.0.0.input-28   # IN28 MIPRS mag-in-pos prox (PLC X00D)",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-28"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 204,
     "text": "net mag-in-pos     => mazak-atc.mag-in-pos",
     "commented": false,
     "producers": [],
     "consumers": [
      "mazak-atc.mag-in-pos"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [
    {
     "label_text": "A2-13",
     "wire": "225",
     "old_location": "CN2-9",
     "signal": "MAGAZINE POSITION OK",
     "mesa_card": "7i84U-A",
     "connector": "TB2",
     "logical_channel": "IN28",
     "physical_pin": "TB2-13",
     "crosswalk_status": "PLANNED_MATCH",
     "release_status": "HOLD_SOURCE_TRACE",
     "source_line": 8
    }
   ],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "53",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "89",
     "note": "net mag-in-pos         <= hm2_7i80.0.7i84.0.0.input-28   # IN28 MIPRS mag-in-pos prox (PLC X00D)"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "204",
     "note": "net mag-in-pos     => mazak-atc.mag-in-pos"
    },
    {
     "file": "atc_ladder_transcription_2026-07-27",
     "lines": "",
     "note": "primary_source column in the authority table"
    },
    {
     "file": "wiring/bbia1_mesa_end_ferrules_epson.csv",
     "lines": "8",
     "note": "Epson Mesa-end ferrule A2-13; HOLD_SOURCE_TRACE"
    }
   ],
   "conflicts": [],
   "authority_line": 53
  },
  {
   "id": "ESTOP_MONITOR",
   "name": "Estop Monitor",
   "board": "7i84U-A",
   "connector": "TB2",
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
   "cleanup_notes": "OEM MAR relay aux contact via interposing relay (Omron G2R-1-SND-DC24 or Phoenix PLC-RSC-24DC/21) driven from EHB bus. OEM/new-side boundary: dry contact only, no OEM P24 into 7i84U common. This is the sole software E-stop monitor; OEM hardware chain remains authoritative.",
   "location": "Unknown — trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "1",
    "label": "Logic 1 — hardware E-stop chain healthy",
    "basis": "field_7i84u.hal: estop-monitor raw IN29 feeds estop-latch.ok-in; contact polarity remains field-verification pending",
    "kind": "proposed"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-29"
   ],
   "producers": [],
   "consumers": [
    "estop-latch.0.ok-in"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/mazak_vqc_20_40.hal",
     "line": 241,
     "text": "net estop-monitor     => estop-latch.0.ok-in",
     "commented": false,
     "producers": [],
     "consumers": [
      "estop-latch.0.ok-in"
     ],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 90,
     "text": "net estop-monitor      <= hm2_7i80.0.7i84.0.0.input-29   # IN29 OEM MAR aux via interposing relay",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-29"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "54",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/mazak_vqc_20_40.hal",
     "lines": "241",
     "note": "net estop-monitor     => estop-latch.0.ok-in"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "90",
     "note": "net estop-monitor      <= hm2_7i80.0.7i84.0.0.input-29   # IN29 OEM MAR aux via interposing relay"
    },
    {
     "file": "front_control_panel_wiring.md §6.5 + open_issues.md §3 (2026-08-03)",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 54
  },
  {
   "id": "MANUAL_TOOL_CLAMP_PB",
   "name": "Manual Tool Clamp Pb",
   "board": "7i84U-A",
   "connector": "TB2",
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
   "cleanup_notes": "Reserved terminal; intentionally HAL-unbound until the switch and safe manual-clamp behavior are field verified. Pairs with MANUAL_TOOL_UNCLAMP_PB on IN9.",
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
    "hm2_7i80.0.7i84.0.0.input-30"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 92,
     "text": "# net manual-clamp-pb    <= hm2_7i80.0.7i84.0.0.input-30",
     "commented": true,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-30"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "55",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "92",
     "note": "commented out — # net manual-clamp-pb    <= hm2_7i80.0.7i84.0.0.input-30"
    },
    {
     "file": "element_list_crosswalk_2026-07-27 + open_issues.md §3 (2026-08-03)",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 55
  },
  {
   "id": "SERVO_READY",
   "name": "Servo Ready",
   "board": "7i84U-A",
   "connector": "TB2",
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
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.input-31"
   ],
   "producers": [],
   "consumers": [
    "logic.spindle-permit-and.in-05",
    "mazak-orient.servo-ready"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/mazak_vqc_20_40.hal",
     "line": 314,
     "text": "net servo-ready            => logic.spindle-permit-and.in-05",
     "commented": false,
     "producers": [],
     "consumers": [
      "logic.spindle-permit-and.in-05"
     ],
     "bidir": []
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 121,
     "text": "net servo-ready           <= hm2_7i80.0.7i84.0.0.input-31   # IN31 SA.N",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-31"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 148,
     "text": "net servo-ready                           => mazak-orient.servo-ready",
     "commented": false,
     "producers": [],
     "consumers": [
      "mazak-orient.servo-ready"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [
    {
     "label_text": "A2-16",
     "wire": "SA",
     "old_location": "CN6-7",
     "signal": "SERVO READY",
     "mesa_card": "7i84U-A",
     "connector": "TB2",
     "logical_channel": "IN31",
     "physical_pin": "TB2-16",
     "crosswalk_status": "PLANNED_MATCH",
     "release_status": "HOLD_SOURCE_TRACE",
     "source_line": 15
    }
   ],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "56",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/mazak_vqc_20_40.hal",
     "lines": "314",
     "note": "net servo-ready            => logic.spindle-permit-and.in-05"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "121",
     "note": "net servo-ready           <= hm2_7i80.0.7i84.0.0.input-31   # IN31 SA.N"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "148",
     "note": "net servo-ready                           => mazak-orient.servo-ready"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    },
    {
     "file": "wiring/bbia1_mesa_end_ferrules_epson.csv",
     "lines": "15",
     "note": "Epson Mesa-end ferrule A2-16; HOLD_SOURCE_TRACE"
    }
   ],
   "conflicts": [],
   "authority_line": 56
  },
  {
   "id": "SPINDLE_FWD",
   "name": "Spindle Fwd",
   "board": "7i84U-A",
   "connector": "TB3",
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
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.output-00"
   ],
   "producers": [
    "and2.3.out"
   ],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 114,
     "text": "net spindle-fwd        <= and2.3.out",
     "commented": false,
     "producers": [
      "and2.3.out"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 115,
     "text": "net spindle-fwd        => hm2_7i80.0.7i84.0.0.output-00  # OUT0  FR-SX FWD",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.7i84.0.0.output-00"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "57",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "114",
     "note": "net spindle-fwd        <= and2.3.out"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "115",
     "note": "net spindle-fwd        => hm2_7i80.0.7i84.0.0.output-00  # OUT0  FR-SX FWD"
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
   "authority_line": 57
  },
  {
   "id": "SPINDLE_REV",
   "name": "Spindle Rev",
   "board": "7i84U-A",
   "connector": "TB3",
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
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.output-01"
   ],
   "producers": [
    "and2.4.out"
   ],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 119,
     "text": "net spindle-rev        <= and2.4.out",
     "commented": false,
     "producers": [
      "and2.4.out"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 120,
     "text": "net spindle-rev        => hm2_7i80.0.7i84.0.0.output-01  # OUT1  FR-SX REV",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.7i84.0.0.output-01"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "58",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "119",
     "note": "net spindle-rev        <= and2.4.out"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "120",
     "note": "net spindle-rev        => hm2_7i80.0.7i84.0.0.output-01  # OUT1  FR-SX REV"
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
   "authority_line": 58
  },
  {
   "id": "SPINDLE_ENABLE",
   "name": "Spindle Enable",
   "board": "7i84U-A",
   "connector": "TB3",
   "channel": "OUT2",
   "hal_net": "spindle-run-output",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Spindle",
   "machine_subsystem": "Spindle",
   "status": "COMMISSIONING_PENDING",
   "field_point": "FR-SX enable input",
   "designations": [],
   "primary_source": "field_7i84u.hal",
   "cleanup_notes": "FWD, REV, RUN, ORCM1, and pwmgen.03.enable use spindle-motion-permit; the static hold initializes FALSE and watchdog, E-stop, machine-on, servo-ready, and spindle-fault states must also permit motion",
   "location": "Unknown — trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "0",
    "label": "0 / de-energized — output idle unless commanded",
    "basis": "No commanding logic in the active HAL for this net; outputs default off.",
    "kind": "default-off"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.pwmgen.03.enable",
    "hm2_7i80.0.7i84.0.0.output-02"
   ],
   "producers": [
    "and2.5.out"
   ],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 383,
     "text": "net spindle-run-output => hm2_7i80.0.pwmgen.03.enable",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.pwmgen.03.enable"
     ],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 123,
     "text": "net spindle-run-output <= and2.5.out",
     "commented": false,
     "producers": [
      "and2.5.out"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 124,
     "text": "net spindle-run-output => hm2_7i80.0.7i84.0.0.output-02  # OUT2  FR-SX RUN/STOP",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.7i84.0.0.output-02"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 372,
     "text": "setp hm2_7i80.0.pwmgen.03.output-type 2",
     "commented": false,
     "target": "hm2_7i80.0.pwmgen.03.output-type",
     "value": "2"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 373,
     "text": "setp hm2_7i80.0.pwmgen.03.offset-mode 0",
     "commented": false,
     "target": "hm2_7i80.0.pwmgen.03.offset-mode",
     "value": "0"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 374,
     "text": "setp hm2_7i80.0.pwmgen.03.scale       [SPINDLE_0]OUTPUT_SCALE",
     "commented": false,
     "target": "hm2_7i80.0.pwmgen.03.scale",
     "value": "[SPINDLE_0]OUTPUT_SCALE"
    }
   ],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "59",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "383",
     "note": "net spindle-run-output => hm2_7i80.0.pwmgen.03.enable"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "123",
     "note": "net spindle-run-output <= and2.5.out"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "124",
     "note": "net spindle-run-output => hm2_7i80.0.7i84.0.0.output-02  # OUT2  FR-SX RUN/STOP"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "372",
     "note": "setp hm2_7i80.0.pwmgen.03.output-type 2"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "373",
     "note": "setp hm2_7i80.0.pwmgen.03.offset-mode 0"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "374",
     "note": "setp hm2_7i80.0.pwmgen.03.scale       [SPINDLE_0]OUTPUT_SCALE"
    },
    {
     "file": "field_7i84u.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C3"
   ],
   "authority_line": 59
  },
  {
   "id": "HYD_PUMP_ON",
   "name": "Hyd Pump On",
   "board": "7i84U-A",
   "connector": "TB3",
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
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.output-03"
   ],
   "producers": [
    "mazak-orient.hyd-pump-on"
   ],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 126,
     "text": "net hyd-pump-on           => hm2_7i80.0.7i84.0.0.output-03  # OUT3  Y096 HYD.M",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.7i84.0.0.output-03"
     ],
     "bidir": []
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 150,
     "text": "net hyd-pump-on     <= mazak-orient.hyd-pump-on",
     "commented": false,
     "producers": [
      "mazak-orient.hyd-pump-on"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "60",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "126",
     "note": "net hyd-pump-on           => hm2_7i80.0.7i84.0.0.output-03  # OUT3  Y096 HYD.M"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "150",
     "note": "net hyd-pump-on     <= mazak-orient.hyd-pump-on"
    },
    {
     "file": "element_list_crosswalk_2026-07-27",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 60
  },
  {
   "id": "SPINDLE_ORIENT_CMD",
   "name": "Spindle Orient Cmd",
   "board": "7i84U-A",
   "connector": "TB3",
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
   "cleanup_notes": "Gated by spindle-motion-permit; validate ladder sequence exact drive terminal relay topology and polarity before landing the field wire",
   "location": "Unknown — trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "0",
    "label": "0 / de-energized — output idle unless commanded",
    "basis": "No commanding logic in the active HAL for this net; outputs default off.",
    "kind": "default-off"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.output-04"
   ],
   "producers": [
    "and2.7.out"
   ],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 127,
     "text": "net spindle-orient-cmd    => hm2_7i80.0.7i84.0.0.output-04  # OUT4  Y093 ORCM1.M",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.7i84.0.0.output-04"
     ],
     "bidir": []
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 177,
     "text": "net spindle-orient-cmd     <= and2.7.out",
     "commented": false,
     "producers": [
      "and2.7.out"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "61",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "127",
     "note": "net spindle-orient-cmd    => hm2_7i80.0.7i84.0.0.output-04  # OUT4  Y093 ORCM1.M"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "177",
     "note": "net spindle-orient-cmd     <= and2.7.out"
    },
    {
     "file": "element_list_crosswalk_2026-07-27",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C3"
   ],
   "authority_line": 61
  },
  {
   "id": "SPINDLE_ORIENT_LOGEAR",
   "name": "Spindle Orient Logear",
   "board": "7i84U-A",
   "connector": "TB3",
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
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.output-05"
   ],
   "producers": [
    "mazak-orient.orient-lo-gear"
   ],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 128,
     "text": "net orient-lo-gear        => hm2_7i80.0.7i84.0.0.output-05  # OUT5  Y094 CTL.M",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.7i84.0.0.output-05"
     ],
     "bidir": []
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 178,
     "text": "net orient-lo-gear      <= mazak-orient.orient-lo-gear",
     "commented": false,
     "producers": [
      "mazak-orient.orient-lo-gear"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "62",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "128",
     "note": "net orient-lo-gear        => hm2_7i80.0.7i84.0.0.output-05  # OUT5  Y094 CTL.M"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "178",
     "note": "net orient-lo-gear      <= mazak-orient.orient-lo-gear"
    },
    {
     "file": "element_list_crosswalk_2026-07-27",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 62
  },
  {
   "id": "Z_BRAKE_REL_ENABLE",
   "name": "Z Brake Rel Enable",
   "board": "7i84U-A",
   "connector": "TB3",
   "channel": "OUT6",
   "hal_net": "z-brake-release",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Motion",
   "machine_subsystem": "Motion",
   "status": "COMMISSIONING_PENDING",
   "field_point": "N1J-L2-201 Z brake release",
   "designations": [],
   "primary_source": "field_7i84u.hal",
   "cleanup_notes": "Asymmetric sequence: z-brake-delay releases brake 100ms after request rises and engages it immediately when request falls; z-drive-drop-delay asserts S-ON immediately and retains it 100ms after request falls. Values are placeholders pending D7 measurement and drive-ready/brake-confirm feedback. Add suppression across SOL-201 coil.",
   "location": "Unknown — trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "0",
    "label": "0 / de-energized — output idle unless commanded",
    "basis": "No commanding logic in the active HAL for this net; outputs default off.",
    "kind": "default-off"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.pwmgen.01.enable",
    "hm2_7i80.0.7i84.0.0.output-06"
   ],
   "producers": [
    "z-brake-delay.out"
   ],
   "consumers": [
    "pid.z.enable"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 319,
     "text": "net z-brake-release => pid.z.enable",
     "commented": false,
     "producers": [],
     "consumers": [
      "pid.z.enable"
     ],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 320,
     "text": "net z-brake-release => hm2_7i80.0.pwmgen.01.enable",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.pwmgen.01.enable"
     ],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 161,
     "text": "net z-brake-release    <= z-brake-delay.out",
     "commented": false,
     "producers": [
      "z-brake-delay.out"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 162,
     "text": "net z-brake-release    => hm2_7i80.0.7i84.0.0.output-06  # OUT6  N1J-L2-201 Z brake release",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.7i84.0.0.output-06"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 279,
     "text": "setp hm2_7i80.0.pwmgen.01.output-type 2    # Z axis  -> 7i49 AOUT1",
     "commented": false,
     "target": "hm2_7i80.0.pwmgen.01.output-type",
     "value": "2"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 280,
     "text": "setp hm2_7i80.0.pwmgen.01.scale       [JOINT_2]OUTPUT_SCALE",
     "commented": false,
     "target": "hm2_7i80.0.pwmgen.01.scale",
     "value": "[JOINT_2]OUTPUT_SCALE"
    }
   ],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "63",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "319",
     "note": "net z-brake-release => pid.z.enable"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "320",
     "note": "net z-brake-release => hm2_7i80.0.pwmgen.01.enable"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "161",
     "note": "net z-brake-release    <= z-brake-delay.out"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "162",
     "note": "net z-brake-release    => hm2_7i80.0.7i84.0.0.output-06  # OUT6  N1J-L2-201 Z brake release"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "279",
     "note": "setp hm2_7i80.0.pwmgen.01.output-type 2    # Z axis  -> 7i49 AOUT1"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "280",
     "note": "setp hm2_7i80.0.pwmgen.01.scale       [JOINT_2]OUTPUT_SCALE"
    },
    {
     "file": "field_7i84u.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 63
  },
  {
   "id": "GEAR_HI_SOL",
   "name": "Gear Hi Sol",
   "board": "7i84U-A",
   "connector": "TB3",
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
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.output-07"
   ],
   "producers": [
    "mazak-orient.gear-hi-sol"
   ],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 129,
     "text": "net gear-hi-sol           => hm2_7i80.0.7i84.0.0.output-07  # OUT7  Y00B GSH.M",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.7i84.0.0.output-07"
     ],
     "bidir": []
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 170,
     "text": "net gear-hi-sol         <= mazak-orient.gear-hi-sol",
     "commented": false,
     "producers": [
      "mazak-orient.gear-hi-sol"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "64",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "129",
     "note": "net gear-hi-sol           => hm2_7i80.0.7i84.0.0.output-07  # OUT7  Y00B GSH.M"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "170",
     "note": "net gear-hi-sol         <= mazak-orient.gear-hi-sol"
    },
    {
     "file": "phase2_plan",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C4"
   ],
   "authority_line": 64
  },
  {
   "id": "GEAR_LO_SOL",
   "name": "Gear Lo Sol",
   "board": "7i84U-A",
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
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.output-08"
   ],
   "producers": [
    "mazak-orient.gear-lo-sol"
   ],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 133,
     "text": "# net gear-lo-sol         => hm2_7i80.0.7i84.0.0.output-08  # OUT8  Y00C GSL.M",
     "commented": true,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.7i84.0.0.output-08"
     ],
     "bidir": []
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 171,
     "text": "net gear-lo-sol         <= mazak-orient.gear-lo-sol",
     "commented": false,
     "producers": [
      "mazak-orient.gear-lo-sol"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "65",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "133",
     "note": "commented out — # net gear-lo-sol         => hm2_7i80.0.7i84.0.0.output-08  # OUT8  Y00C GSL.M"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "171",
     "note": "net gear-lo-sol         <= mazak-orient.gear-lo-sol"
    },
    {
     "file": "phase2_plan",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C4"
   ],
   "authority_line": 65
  },
  {
   "id": "TOOL_CLAMP_SOL",
   "name": "Tool Clamp Sol",
   "board": "7i84U-A",
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
   "hal_state": "active",
   "mesa_pins": [],
   "producers": [
    "mazak-atc.tool-clamp-sol"
   ],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 222,
     "text": "net tool-clamp-sol      <= mazak-atc.tool-clamp-sol",
     "commented": false,
     "producers": [
      "mazak-atc.tool-clamp-sol"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "66",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "222",
     "note": "net tool-clamp-sol      <= mazak-atc.tool-clamp-sol"
    },
    {
     "file": "phase2_plan",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C5"
   ],
   "authority_line": 66
  },
  {
   "id": "TOOL_UNCLAMP_SOL",
   "name": "Tool Unclamp Sol",
   "board": "7i84U-A",
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
    "hm2_7i80.0.7i84.0.0.output-10"
   ],
   "producers": [
    "mazak-atc.tool-unclamp-sol"
   ],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 167,
     "text": "net tool-unclamp-sol   => hm2_7i80.0.7i84.0.0.output-10  # OUT10 RLY-4 to SOL-10",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.7i84.0.0.output-10"
     ],
     "bidir": []
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 219,
     "text": "net tool-unclamp-sol    <= mazak-atc.tool-unclamp-sol",
     "commented": false,
     "producers": [
      "mazak-atc.tool-unclamp-sol"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "67",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "167",
     "note": "net tool-unclamp-sol   => hm2_7i80.0.7i84.0.0.output-10  # OUT10 RLY-4 to SOL-10"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "219",
     "note": "net tool-unclamp-sol    <= mazak-atc.tool-unclamp-sol"
    },
    {
     "file": "phase2_plan",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C5"
   ],
   "authority_line": 67
  },
  {
   "id": "COOLANT_ON",
   "name": "Coolant On",
   "board": "7i84U-A",
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
    "hm2_7i80.0.7i84.0.0.output-11"
   ],
   "producers": [
    "iocontrol.0.coolant-flood"
   ],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 168,
     "text": "net flood-coolant      <= iocontrol.0.coolant-flood",
     "commented": false,
     "producers": [
      "iocontrol.0.coolant-flood"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 169,
     "text": "net flood-coolant      => hm2_7i80.0.7i84.0.0.output-11  # OUT11 flood pump relay",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.7i84.0.0.output-11"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "68",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "168",
     "note": "net flood-coolant      <= iocontrol.0.coolant-flood"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "169",
     "note": "net flood-coolant      => hm2_7i80.0.7i84.0.0.output-11  # OUT11 flood pump relay"
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
   "authority_line": 68
  },
  {
   "id": "MIST_COOLANT",
   "name": "Mist Coolant",
   "board": "7i84U-A",
   "connector": "TB2",
   "channel": "OUT12",
   "hal_net": "mist-coolant",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Utility",
   "machine_subsystem": "Utility",
   "status": "HOLD_CONFLICT",
   "field_point": "Mist coolant relay (was documented as lube pump; verify at cabinet)",
   "designations": [],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "CONFLICT: HAL wires iocontrol.0.coolant-mist to this output; CSV previously carried LUBE_ON. Trace physical load before commissioning; add row to wiring/authority_conflicts.md.",
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
    "hm2_7i80.0.7i84.0.0.output-12"
   ],
   "producers": [
    "iocontrol.0.coolant-mist"
   ],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 173,
     "text": "# net mist-coolant       <= iocontrol.0.coolant-mist",
     "commented": true,
     "producers": [
      "iocontrol.0.coolant-mist"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 174,
     "text": "# net mist-coolant       => hm2_7i80.0.7i84.0.0.output-12  # OUT12 (was lube-on; verify)",
     "commented": true,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.7i84.0.0.output-12"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "69",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "173",
     "note": "commented out — # net mist-coolant       <= iocontrol.0.coolant-mist"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "174",
     "note": "commented out — # net mist-coolant       => hm2_7i80.0.7i84.0.0.output-12  # OUT12 (was lube-on; verify)"
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
   "id": "MAG_CW_SOL",
   "name": "Mag Cw Sol",
   "board": "7i84U-A",
   "connector": "TB2",
   "channel": "OUT13",
   "hal_net": "mag-cw-sol",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "ATC motor",
   "machine_subsystem": "ATC motor",
   "status": "HOLD_CONFLICT",
   "field_point": "ATC magazine CW rotation relay (SOL-8A per connector_crossref.md, unverified)",
   "designations": [
    "SOL-8A"
   ],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "CONFLICT #3 in wiring/authority_conflicts.md: SOL-8A/8B direction mapping unproven. Renamed from atc-fwd to match atc_orient.hal net. Verify direction under controlled commissioning.",
   "location": "Unknown — trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "0",
    "label": "0 / de-energized — output idle unless commanded",
    "basis": "No commanding logic in the active HAL for this net; outputs default off.",
    "kind": "default-off"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.output-13"
   ],
   "producers": [
    "mazak-atc.mag-fwd-sol"
   ],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 180,
     "text": "# net mag-cw-sol         => hm2_7i80.0.7i84.0.0.output-13  # OUT13 ATC motor fwd relay",
     "commented": true,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.7i84.0.0.output-13"
     ],
     "bidir": []
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 212,
     "text": "net mag-cw-sol     <= mazak-atc.mag-fwd-sol",
     "commented": false,
     "producers": [
      "mazak-atc.mag-fwd-sol"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "70",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "180",
     "note": "commented out — # net mag-cw-sol         => hm2_7i80.0.7i84.0.0.output-13  # OUT13 ATC motor fwd relay"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "212",
     "note": "net mag-cw-sol     <= mazak-atc.mag-fwd-sol"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 70
  },
  {
   "id": "MAG_CCW_SOL",
   "name": "Mag Ccw Sol",
   "board": "7i84U-A",
   "connector": "TB2",
   "channel": "OUT14",
   "hal_net": "mag-ccw-sol",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "ATC motor",
   "machine_subsystem": "ATC motor",
   "status": "HOLD_CONFLICT",
   "field_point": "ATC magazine CCW rotation relay (SOL-8B per connector_crossref.md, unverified)",
   "designations": [
    "SOL-8B"
   ],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "CONFLICT #3 in wiring/authority_conflicts.md: SOL-8A/8B direction mapping unproven. Renamed from atc-rev to match atc_orient.hal net. Verify direction under controlled commissioning.",
   "location": "Unknown — trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "0",
    "label": "0 / de-energized — output idle unless commanded",
    "basis": "No commanding logic in the active HAL for this net; outputs default off.",
    "kind": "default-off"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.output-14"
   ],
   "producers": [
    "mazak-atc.mag-rev-sol"
   ],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 181,
     "text": "# net mag-ccw-sol        => hm2_7i80.0.7i84.0.0.output-14  # OUT14 ATC motor rev relay",
     "commented": true,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.7i84.0.0.output-14"
     ],
     "bidir": []
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 213,
     "text": "net mag-ccw-sol    <= mazak-atc.mag-rev-sol",
     "commented": false,
     "producers": [
      "mazak-atc.mag-rev-sol"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "71",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "181",
     "note": "commented out — # net mag-ccw-sol        => hm2_7i80.0.7i84.0.0.output-14  # OUT14 ATC motor rev relay"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "213",
     "note": "net mag-ccw-sol    <= mazak-atc.mag-rev-sol"
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
   "id": "ALARM_OUT",
   "name": "Alarm Out",
   "board": "7i84U-A",
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
   "hal_state": "commented",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.0.output-15"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 183,
     "text": "# net alarm-out          => hm2_7i80.0.7i84.0.0.output-15",
     "commented": true,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.7i84.0.0.output-15"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "72",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "183",
     "note": "commented out — # net alarm-out          => hm2_7i80.0.7i84.0.0.output-15"
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
   "id": "SSERIAL_PORT1_TXA",
   "name": "Sserial Port1 Txa",
   "board": "7i44",
   "connector": "P1 7i44 physical channel 1",
   "channel": "port1.TX+",
   "hal_net": "",
   "direction": "LINK",
   "direction_label": "Link (smart-serial)",
   "subsystem": "Field I/O",
   "machine_subsystem": "Field I/O",
   "status": "PROPOSED",
   "field_point": "7i84U-B RJ45 pin 2 RX+",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "7i44 channel 1 to 7i84U-B CN0 under HostMot2 port 0; RS-422 differential pair; promote to TRACED after physical continuity check",
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "73",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 73
  },
  {
   "id": "SSERIAL_PORT1_TXB",
   "name": "Sserial Port1 Txb",
   "board": "7i44",
   "connector": "P1 7i44 physical channel 1",
   "channel": "port1.TX-",
   "hal_net": "",
   "direction": "LINK",
   "direction_label": "Link (smart-serial)",
   "subsystem": "Field I/O",
   "machine_subsystem": "Field I/O",
   "status": "PROPOSED",
   "field_point": "7i84U-B RJ45 pin 1 RX-",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "RS-422 differential pair; promote to TRACED after physical continuity check",
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "74",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 74
  },
  {
   "id": "SSERIAL_PORT1_RXA",
   "name": "Sserial Port1 Rxa",
   "board": "7i44",
   "connector": "P1 7i44 physical channel 1",
   "channel": "port1.RX+",
   "hal_net": "",
   "direction": "LINK",
   "direction_label": "Link (smart-serial)",
   "subsystem": "Field I/O",
   "machine_subsystem": "Field I/O",
   "status": "PROPOSED",
   "field_point": "7i84U-B RJ45 pin 6 TX+",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "RS-422 differential pair; promote to TRACED after physical continuity check",
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "75",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 75
  },
  {
   "id": "SSERIAL_PORT1_RXB",
   "name": "Sserial Port1 Rxb",
   "board": "7i44",
   "connector": "P1 7i44 physical channel 1",
   "channel": "port1.RX-",
   "hal_net": "",
   "direction": "LINK",
   "direction_label": "Link (smart-serial)",
   "subsystem": "Field I/O",
   "machine_subsystem": "Field I/O",
   "status": "PROPOSED",
   "field_point": "7i84U-B RJ45 pin 3 TX-",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "RS-422 differential pair; promote to TRACED after physical continuity check",
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "76",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 76
  },
  {
   "id": "SSERIAL_PORT1_GND",
   "name": "Sserial Port1 Gnd",
   "board": "7i44",
   "connector": "P1 7i44 physical channel 1",
   "channel": "port1.GND",
   "hal_net": "",
   "direction": "LINK",
   "direction_label": "Link (smart-serial)",
   "subsystem": "Field I/O",
   "machine_subsystem": "Field I/O",
   "status": "PROPOSED",
   "field_point": "7i84U-B RJ45 pin 4/5 ground",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Shield drain to 7i44 end only; promote to TRACED after physical continuity check",
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "77",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 77
  },
  {
   "id": "SSERIAL_PORT1_5V",
   "name": "Sserial Port1 5V",
   "board": "7i44",
   "connector": "P1 7i44 physical channel 1",
   "channel": "port1.+5V",
   "hal_net": "",
   "direction": "LINK",
   "direction_label": "Link (smart-serial)",
   "subsystem": "Field I/O",
   "machine_subsystem": "Field I/O",
   "status": "PROPOSED",
   "field_point": "7i84U-B RJ45 pin 7/8 +5V",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Serial power for 7i84U-B logic; promote to TRACED after physical continuity check",
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "78",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 78
  },
  {
   "id": "SEVENI84UB_FIELD_A_24V",
   "name": "Seveni84Ub Field A 24V",
   "board": "7i84U-B",
   "connector": "TB1",
   "channel": "TB1 pins 3/4 VFIELDA (+24 V field power, 5-28 VDC)",
   "hal_net": "",
   "direction": "POWER",
   "direction_label": "Power / common",
   "subsystem": "Power",
   "machine_subsystem": "Field power",
   "status": "COMMISSIONING_PENDING",
   "field_point": "Field power bank A (TB3 I/O)",
   "designations": [
    "TB-3"
   ],
   "primary_source": "Mesa 7i84U manual pp.2/7-8/47",
   "cleanup_notes": "Both terminals are VFIELDA; powers TB3 outputs 0-7 and inputs 0-15. Never connect either pin to 0 V.",
   "location": "Field I/O enclosure — 7i84U-B TB1 pins 3/4",
   "location_note": "VFIELDA for TB3 bank",
   "expected": {
    "value": "24 V",
    "label": "VFIELDA supply for TB3 outputs 0-7 and inputs 0-15; TB1 pins 3/4 are both positive",
    "basis": "Mesa 7i84U manual pp.7-8/47",
    "kind": "na"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "79",
     "note": "Current wiring authority row"
    },
    {
     "file": "Mesa 7i84U manual pp.2/7-8/47",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 79
  },
  {
   "id": "SEVENI84UB_FIELD_B_24V",
   "name": "Seveni84Ub Field B 24V",
   "board": "7i84U-B",
   "connector": "TB1",
   "channel": "TB1 pins 1/2 VFIELDB (+24 V field power, 5-28 VDC)",
   "hal_net": "",
   "direction": "POWER",
   "direction_label": "Power / common",
   "subsystem": "Power",
   "machine_subsystem": "Field power",
   "status": "COMMISSIONING_PENDING",
   "field_point": "Field power bank B (TB2 I/O)",
   "designations": [
    "TB-2"
   ],
   "primary_source": "Mesa 7i84U manual pp.2/7-8/47",
   "cleanup_notes": "Both terminals are VFIELDB; powers TB2 outputs 8-15 and inputs 16-31. Never connect either pin to 0 V.",
   "location": "Field I/O enclosure — 7i84U-B TB1 pins 1/2",
   "location_note": "VFIELDB for TB2 bank",
   "expected": {
    "value": "24 V",
    "label": "VFIELDB supply for TB2 outputs 8-15 and inputs 16-31; TB1 pins 1/2 are both positive",
    "basis": "Mesa 7i84U manual pp.7-8/47",
    "kind": "na"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "80",
     "note": "Current wiring authority row"
    },
    {
     "file": "Mesa 7i84U manual pp.2/7-8/47",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 80
  },
  {
   "id": "X_LIMIT_PLUS",
   "name": "X Limit Plus",
   "board": "7i84U-B",
   "connector": "TB3",
   "channel": "IN0",
   "hal_net": "limit-x-plus",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Axis safety",
   "machine_subsystem": "Axis overtravel",
   "status": "PROPOSED",
   "field_point": "X positive overtravel limit (NC)",
   "designations": [
    "OT+X"
   ],
   "primary_source": "field_7i84u.hal",
   "cleanup_notes": "NC contact consumed through input-00-not; promote to FIELD_VERIFIED after continuity and fail-open test",
   "location": "X axis way — positive overtravel switch",
   "location_note": "OT+X",
   "expected": {
    "value": "0",
    "label": "Logic 0 — switch closed (not tripped), inverted in HAL",
    "basis": "field_7i84u.hal limit block — NC contacts use the smart-serial input-NN-not complementary pins; no invert_input parameter",
    "kind": "evidenced"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.1.input-00-not"
   ],
   "producers": [],
   "consumers": [
    "joint.0.pos-lim-sw-in"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 216,
     "text": "#     net limit-x-plus <= hm2_7i80.0.7i84.0.1.input-00-not",
     "commented": true,
     "producers": [
      "hm2_7i80.0.7i84.0.1.input-00-not"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 224,
     "text": "net limit-x-plus  <= hm2_7i80.0.7i84.0.1.input-00-not   # X_LIMIT_PLUS  (NC contact)",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.1.input-00-not"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 225,
     "text": "net limit-x-plus  => joint.0.pos-lim-sw-in",
     "commented": false,
     "producers": [],
     "consumers": [
      "joint.0.pos-lim-sw-in"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "81",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "216",
     "note": "commented out — #     net limit-x-plus <= hm2_7i80.0.7i84.0.1.input-00-not"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "224",
     "note": "net limit-x-plus  <= hm2_7i80.0.7i84.0.1.input-00-not   # X_LIMIT_PLUS  (NC contact)"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "225",
     "note": "net limit-x-plus  => joint.0.pos-lim-sw-in"
    },
    {
     "file": "field_7i84u.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C6"
   ],
   "authority_line": 81
  },
  {
   "id": "X_LIMIT_MINUS",
   "name": "X Limit Minus",
   "board": "7i84U-B",
   "connector": "TB3",
   "channel": "IN1",
   "hal_net": "limit-x-minus",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Axis safety",
   "machine_subsystem": "Axis overtravel",
   "status": "PROPOSED",
   "field_point": "X negative overtravel limit (NC)",
   "designations": [
    "OT-X"
   ],
   "primary_source": "field_7i84u.hal",
   "cleanup_notes": "NC contact consumed through input-01-not; promote to FIELD_VERIFIED after continuity and fail-open test",
   "location": "X axis way — negative overtravel switch",
   "location_note": "OT-X",
   "expected": {
    "value": "0",
    "label": "Logic 0 — switch closed (not tripped), inverted in HAL",
    "basis": "field_7i84u.hal limit block — NC contacts use the smart-serial input-NN-not complementary pins; no invert_input parameter",
    "kind": "evidenced"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.1.input-01-not"
   ],
   "producers": [],
   "consumers": [
    "joint.0.neg-lim-sw-in"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 226,
     "text": "net limit-x-minus <= hm2_7i80.0.7i84.0.1.input-01-not   # X_LIMIT_MINUS (NC contact)",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.1.input-01-not"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 227,
     "text": "net limit-x-minus => joint.0.neg-lim-sw-in",
     "commented": false,
     "producers": [],
     "consumers": [
      "joint.0.neg-lim-sw-in"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "82",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "226",
     "note": "net limit-x-minus <= hm2_7i80.0.7i84.0.1.input-01-not   # X_LIMIT_MINUS (NC contact)"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "227",
     "note": "net limit-x-minus => joint.0.neg-lim-sw-in"
    },
    {
     "file": "field_7i84u.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C6"
   ],
   "authority_line": 82
  },
  {
   "id": "Y_LIMIT_PLUS",
   "name": "Y Limit Plus",
   "board": "7i84U-B",
   "connector": "TB3",
   "channel": "IN2",
   "hal_net": "limit-y-plus",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Axis safety",
   "machine_subsystem": "Axis overtravel",
   "status": "PROPOSED",
   "field_point": "Y positive overtravel limit (NC)",
   "designations": [
    "OT+Y"
   ],
   "primary_source": "field_7i84u.hal",
   "cleanup_notes": "NC contact consumed through input-02-not; promote to FIELD_VERIFIED after continuity and fail-open test",
   "location": "Y axis way — positive overtravel switch",
   "location_note": "OT+Y",
   "expected": {
    "value": "0",
    "label": "Logic 0 — switch closed (not tripped), inverted in HAL",
    "basis": "field_7i84u.hal limit block — NC contacts use the smart-serial input-NN-not complementary pins; no invert_input parameter",
    "kind": "evidenced"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.1.input-02-not"
   ],
   "producers": [],
   "consumers": [
    "joint.1.pos-lim-sw-in"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 228,
     "text": "net limit-y-plus  <= hm2_7i80.0.7i84.0.1.input-02-not   # Y_LIMIT_PLUS  (NC contact)",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.1.input-02-not"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 229,
     "text": "net limit-y-plus  => joint.1.pos-lim-sw-in",
     "commented": false,
     "producers": [],
     "consumers": [
      "joint.1.pos-lim-sw-in"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [
    {
     "label_text": "B3-03",
     "wire": "+LY",
     "old_location": "CN3-37",
     "signal": "+Y OVER TRAVEL",
     "mesa_card": "7i84U-B",
     "connector": "TB3",
     "logical_channel": "IN2",
     "physical_pin": "TB3-03",
     "crosswalk_status": "PLANNED_MATCH",
     "release_status": "HOLD_SOURCE_TRACE",
     "source_line": 12
    }
   ],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "83",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "228",
     "note": "net limit-y-plus  <= hm2_7i80.0.7i84.0.1.input-02-not   # Y_LIMIT_PLUS  (NC contact)"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "229",
     "note": "net limit-y-plus  => joint.1.pos-lim-sw-in"
    },
    {
     "file": "field_7i84u.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    },
    {
     "file": "wiring/bbia1_mesa_end_ferrules_epson.csv",
     "lines": "12",
     "note": "Epson Mesa-end ferrule B3-03; HOLD_SOURCE_TRACE"
    }
   ],
   "conflicts": [
    "C6"
   ],
   "authority_line": 83
  },
  {
   "id": "Y_LIMIT_MINUS",
   "name": "Y Limit Minus",
   "board": "7i84U-B",
   "connector": "TB3",
   "channel": "IN3",
   "hal_net": "limit-y-minus",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Axis safety",
   "machine_subsystem": "Axis overtravel",
   "status": "PROPOSED",
   "field_point": "Y negative overtravel limit (NC)",
   "designations": [
    "OT-Y"
   ],
   "primary_source": "field_7i84u.hal",
   "cleanup_notes": "NC contact consumed through input-03-not; promote to FIELD_VERIFIED after continuity and fail-open test",
   "location": "Y axis way — negative overtravel switch",
   "location_note": "OT-Y",
   "expected": {
    "value": "0",
    "label": "Logic 0 — switch closed (not tripped), inverted in HAL",
    "basis": "field_7i84u.hal limit block — NC contacts use the smart-serial input-NN-not complementary pins; no invert_input parameter",
    "kind": "evidenced"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.1.input-03-not"
   ],
   "producers": [],
   "consumers": [
    "joint.1.neg-lim-sw-in"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 230,
     "text": "net limit-y-minus <= hm2_7i80.0.7i84.0.1.input-03-not   # Y_LIMIT_MINUS (NC contact)",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.1.input-03-not"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 231,
     "text": "net limit-y-minus => joint.1.neg-lim-sw-in",
     "commented": false,
     "producers": [],
     "consumers": [
      "joint.1.neg-lim-sw-in"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "84",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "230",
     "note": "net limit-y-minus <= hm2_7i80.0.7i84.0.1.input-03-not   # Y_LIMIT_MINUS (NC contact)"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "231",
     "note": "net limit-y-minus => joint.1.neg-lim-sw-in"
    },
    {
     "file": "field_7i84u.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C6"
   ],
   "authority_line": 84
  },
  {
   "id": "Z_LIMIT_PLUS",
   "name": "Z Limit Plus",
   "board": "7i84U-B",
   "connector": "TB3",
   "channel": "IN4",
   "hal_net": "limit-z-plus",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Axis safety",
   "machine_subsystem": "Axis overtravel",
   "status": "PROPOSED",
   "field_point": "Z positive overtravel limit (NC)",
   "designations": [
    "OT+Z"
   ],
   "primary_source": "field_7i84u.hal",
   "cleanup_notes": "NC contact consumed through input-04-not; promote to FIELD_VERIFIED after continuity and fail-open test",
   "location": "Z axis way — positive overtravel switch",
   "location_note": "OT+Z",
   "expected": {
    "value": "0",
    "label": "Logic 0 — switch closed (not tripped), inverted in HAL",
    "basis": "field_7i84u.hal limit block — NC contacts use the smart-serial input-NN-not complementary pins; no invert_input parameter",
    "kind": "evidenced"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.1.input-04-not"
   ],
   "producers": [],
   "consumers": [
    "joint.2.pos-lim-sw-in"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 232,
     "text": "net limit-z-plus  <= hm2_7i80.0.7i84.0.1.input-04-not   # Z_LIMIT_PLUS  (NC contact)",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.1.input-04-not"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 233,
     "text": "net limit-z-plus  => joint.2.pos-lim-sw-in",
     "commented": false,
     "producers": [],
     "consumers": [
      "joint.2.pos-lim-sw-in"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [
    {
     "label_text": "B3-05",
     "wire": "+LTZ",
     "old_location": "CN2-14",
     "signal": "Z-AXIS OVER TRAVEL",
     "mesa_card": "7i84U-B",
     "connector": "TB3",
     "logical_channel": "IN4",
     "physical_pin": "TB3-05",
     "crosswalk_status": "PLANNED_MATCH",
     "release_status": "HOLD_SOURCE_TRACE",
     "source_line": 9
    }
   ],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "85",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "232",
     "note": "net limit-z-plus  <= hm2_7i80.0.7i84.0.1.input-04-not   # Z_LIMIT_PLUS  (NC contact)"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "233",
     "note": "net limit-z-plus  => joint.2.pos-lim-sw-in"
    },
    {
     "file": "field_7i84u.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    },
    {
     "file": "wiring/bbia1_mesa_end_ferrules_epson.csv",
     "lines": "9",
     "note": "Epson Mesa-end ferrule B3-05; HOLD_SOURCE_TRACE"
    }
   ],
   "conflicts": [
    "C6"
   ],
   "authority_line": 85
  },
  {
   "id": "Z_LIMIT_MINUS",
   "name": "Z Limit Minus",
   "board": "7i84U-B",
   "connector": "TB3",
   "channel": "IN5",
   "hal_net": "limit-z-minus",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Axis safety",
   "machine_subsystem": "Axis overtravel",
   "status": "PROPOSED",
   "field_point": "Z negative overtravel limit (NC)",
   "designations": [
    "OT-Z"
   ],
   "primary_source": "field_7i84u.hal",
   "cleanup_notes": "NC contact consumed through input-05-not; promote to FIELD_VERIFIED after continuity and fail-open test",
   "location": "Z axis way — negative overtravel switch",
   "location_note": "OT-Z",
   "expected": {
    "value": "0",
    "label": "Logic 0 — switch closed (not tripped), inverted in HAL",
    "basis": "field_7i84u.hal limit block — NC contacts use the smart-serial input-NN-not complementary pins; no invert_input parameter",
    "kind": "evidenced"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.1.input-05-not"
   ],
   "producers": [],
   "consumers": [
    "joint.2.neg-lim-sw-in"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 234,
     "text": "net limit-z-minus <= hm2_7i80.0.7i84.0.1.input-05-not   # Z_LIMIT_MINUS (NC contact)",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.1.input-05-not"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 235,
     "text": "net limit-z-minus => joint.2.neg-lim-sw-in",
     "commented": false,
     "producers": [],
     "consumers": [
      "joint.2.neg-lim-sw-in"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [
    {
     "label_text": "B3-06",
     "wire": "-LZ",
     "old_location": "CN3-38",
     "signal": "-Z OVER TRAVEL",
     "mesa_card": "7i84U-B",
     "connector": "TB3",
     "logical_channel": "IN5",
     "physical_pin": "TB3-06",
     "crosswalk_status": "PLANNED_MATCH",
     "release_status": "HOLD_SOURCE_TRACE",
     "source_line": 13
    }
   ],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "86",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "234",
     "note": "net limit-z-minus <= hm2_7i80.0.7i84.0.1.input-05-not   # Z_LIMIT_MINUS (NC contact)"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "235",
     "note": "net limit-z-minus => joint.2.neg-lim-sw-in"
    },
    {
     "file": "field_7i84u.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    },
    {
     "file": "wiring/bbia1_mesa_end_ferrules_epson.csv",
     "lines": "13",
     "note": "Epson Mesa-end ferrule B3-06; HOLD_SOURCE_TRACE"
    }
   ],
   "conflicts": [
    "C6"
   ],
   "authority_line": 86
  },
  {
   "id": "X_HOME",
   "name": "X Home",
   "board": "7i84U-B",
   "connector": "TB3",
   "channel": "IN6",
   "hal_net": "home-x",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Axis safety",
   "machine_subsystem": "Axis homing",
   "status": "PROPOSED",
   "field_point": "X home switch (LS-42 assumed)",
   "designations": [
    "LS-42"
   ],
   "primary_source": "field_7i84u.hal",
   "cleanup_notes": "NO contact; was ACCEPTED_VERIFY - promote to TRACED after physical continuity + fail-open test",
   "location": "X axis — zero-return switch",
   "location_note": "LS-42 (axis 1 zero return; which axis still to be cross-referenced)",
   "expected": {
    "value": "0",
    "label": "Logic 0 — NO switch, carriage off the home target",
    "basis": "field_7i84u.hal home block — NO contacts use raw input-NN pins",
    "kind": "evidenced"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.1.input-06"
   ],
   "producers": [],
   "consumers": [
    "joint.0.home-sw-in"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 237,
     "text": "net home-x <= hm2_7i80.0.7i84.0.1.input-06        # LS-42 assumed",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.1.input-06"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 238,
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
   "epson_ferrules": [
    {
     "label_text": "B3-07",
     "wire": "*DECX",
     "old_location": "CN2-15",
     "signal": "X-AXIS ZERO RETURN DEC",
     "mesa_card": "7i84U-B",
     "connector": "TB3",
     "logical_channel": "IN6",
     "physical_pin": "TB3-07",
     "crosswalk_status": "PLANNED_MATCH",
     "release_status": "HOLD_SOURCE_TRACE",
     "source_line": 10
    }
   ],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "87",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "237",
     "note": "net home-x <= hm2_7i80.0.7i84.0.1.input-06        # LS-42 assumed"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "238",
     "note": "net home-x => joint.0.home-sw-in"
    },
    {
     "file": "field_7i84u.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    },
    {
     "file": "wiring/bbia1_mesa_end_ferrules_epson.csv",
     "lines": "10",
     "note": "Epson Mesa-end ferrule B3-07; HOLD_SOURCE_TRACE"
    }
   ],
   "conflicts": [
    "C6"
   ],
   "authority_line": 87
  },
  {
   "id": "Y_HOME",
   "name": "Y Home",
   "board": "7i84U-B",
   "connector": "TB3",
   "channel": "IN7",
   "hal_net": "home-y",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Axis safety",
   "machine_subsystem": "Axis homing",
   "status": "PROPOSED",
   "field_point": "Y home switch (LS-52 assumed)",
   "designations": [
    "LS-52"
   ],
   "primary_source": "field_7i84u.hal",
   "cleanup_notes": "NO contact; was ACCEPTED_VERIFY - promote to TRACED after physical continuity + fail-open test",
   "location": "Y axis — zero-return switch",
   "location_note": "LS-52 (axis 2 zero return; which axis still to be cross-referenced)",
   "expected": {
    "value": "0",
    "label": "Logic 0 — NO switch, carriage off the home target",
    "basis": "field_7i84u.hal home block — NO contacts use raw input-NN pins",
    "kind": "evidenced"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.1.input-07"
   ],
   "producers": [],
   "consumers": [
    "joint.1.home-sw-in"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 239,
     "text": "net home-y <= hm2_7i80.0.7i84.0.1.input-07        # LS-52 assumed",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.1.input-07"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 240,
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
   "epson_ferrules": [
    {
     "label_text": "B3-08",
     "wire": "*DECY",
     "old_location": "CN2-16",
     "signal": "Y-AXIS ZERO RETURN DEC",
     "mesa_card": "7i84U-B",
     "connector": "TB3",
     "logical_channel": "IN7",
     "physical_pin": "TB3-08",
     "crosswalk_status": "PLANNED_MATCH",
     "release_status": "HOLD_SOURCE_TRACE",
     "source_line": 11
    }
   ],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "88",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "239",
     "note": "net home-y <= hm2_7i80.0.7i84.0.1.input-07        # LS-52 assumed"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "240",
     "note": "net home-y => joint.1.home-sw-in"
    },
    {
     "file": "field_7i84u.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    },
    {
     "file": "wiring/bbia1_mesa_end_ferrules_epson.csv",
     "lines": "11",
     "note": "Epson Mesa-end ferrule B3-08; HOLD_SOURCE_TRACE"
    }
   ],
   "conflicts": [
    "C6"
   ],
   "authority_line": 88
  },
  {
   "id": "Z_HOME",
   "name": "Z Home",
   "board": "7i84U-B",
   "connector": "TB3",
   "channel": "IN8",
   "hal_net": "home-z",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Axis safety",
   "machine_subsystem": "Axis homing",
   "status": "PROPOSED",
   "field_point": "Z home switch (LS-62 confirmed TB-51)",
   "designations": [
    "LS-62",
    "TB-51"
   ],
   "primary_source": "field_7i84u.hal",
   "cleanup_notes": "NO contact; was ACCEPTED_VERIFY - promote to TRACED after physical continuity + fail-open test",
   "location": "Z axis — zero-return switch",
   "location_note": "LS-62 — confirmed as Z zero return on the TB-51 diagram (pg 100)",
   "expected": {
    "value": "0",
    "label": "Logic 0 — NO switch, carriage off the home target",
    "basis": "field_7i84u.hal home block — NO contacts use raw input-NN pins",
    "kind": "evidenced"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.1.input-08"
   ],
   "producers": [],
   "consumers": [
    "joint.2.home-sw-in"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 241,
     "text": "net home-z <= hm2_7i80.0.7i84.0.1.input-08        # LS-62 confirmed TB-51",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.1.input-08"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 242,
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
   "epson_ferrules": [
    {
     "label_text": "B3-09",
     "wire": "*DECZ",
     "old_location": "CN1-14",
     "signal": "Z-AXIS ZERO RETURN DEC",
     "mesa_card": "7i84U-B",
     "connector": "TB3",
     "logical_channel": "IN8",
     "physical_pin": "TB3-09",
     "crosswalk_status": "PLANNED_MATCH",
     "release_status": "HOLD_SOURCE_TRACE",
     "source_line": 2
    }
   ],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "89",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "241",
     "note": "net home-z <= hm2_7i80.0.7i84.0.1.input-08        # LS-62 confirmed TB-51"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "242",
     "note": "net home-z => joint.2.home-sw-in"
    },
    {
     "file": "field_7i84u.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    },
    {
     "file": "wiring/bbia1_mesa_end_ferrules_epson.csv",
     "lines": "2",
     "note": "Epson Mesa-end ferrule B3-09; HOLD_SOURCE_TRACE"
    }
   ],
   "conflicts": [
    "C6"
   ],
   "authority_line": 89
  },
  {
   "id": "AIR_OK",
   "name": "Air Ok",
   "board": "7i84U-B",
   "connector": "TB3",
   "channel": "IN9",
   "hal_net": "air-ok",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "ATC",
   "machine_subsystem": "ATC",
   "status": "PROPOSED",
   "field_point": "Machine air-pressure OK switch",
   "designations": [],
   "primary_source": "field_7i84u.hal",
   "cleanup_notes": "Raw input and fail-inhibited default; verify switch exists and closes on healthy pressure before live M6",
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
    "hm2_7i80.0.7i84.0.1.input-09"
   ],
   "producers": [],
   "consumers": [
    "mazak-atc.air-ok"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 247,
     "text": "net air-ok <= hm2_7i80.0.7i84.0.1.input-09",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.1.input-09"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 199,
     "text": "net air-ok              => mazak-atc.air-ok",
     "commented": false,
     "producers": [],
     "consumers": [
      "mazak-atc.air-ok"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "90",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "247",
     "note": "net air-ok <= hm2_7i80.0.7i84.0.1.input-09"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "199",
     "note": "net air-ok              => mazak-atc.air-ok"
    },
    {
     "file": "field_7i84u.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 90
  },
  {
   "id": "SEVENI84UB_IN10_SPARE",
   "name": "Seveni84Ub In10 Spare",
   "board": "7i84U-B",
   "connector": "TB3",
   "channel": "IN10",
   "hal_net": "",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Spare",
   "machine_subsystem": "Spare",
   "status": "SPARE",
   "field_point": "Spare input on 7i84U-B",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Leave unlanded",
   "location": "Field I/O enclosure - 7i84U-B, unlanded",
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "91",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 91
  },
  {
   "id": "SEVENI84UB_IN11_SPARE",
   "name": "Seveni84Ub In11 Spare",
   "board": "7i84U-B",
   "connector": "TB3",
   "channel": "IN11",
   "hal_net": "",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Spare",
   "machine_subsystem": "Spare",
   "status": "SPARE",
   "field_point": "Spare input on 7i84U-B",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Leave unlanded",
   "location": "Field I/O enclosure - 7i84U-B, unlanded",
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "92",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 92
  },
  {
   "id": "SEVENI84UB_IN12_SPARE",
   "name": "Seveni84Ub In12 Spare",
   "board": "7i84U-B",
   "connector": "TB3",
   "channel": "IN12",
   "hal_net": "",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Spare",
   "machine_subsystem": "Spare",
   "status": "SPARE",
   "field_point": "Spare input on 7i84U-B",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Leave unlanded",
   "location": "Field I/O enclosure - 7i84U-B, unlanded",
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "93",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 93
  },
  {
   "id": "SEVENI84UB_IN13_SPARE",
   "name": "Seveni84Ub In13 Spare",
   "board": "7i84U-B",
   "connector": "TB3",
   "channel": "IN13",
   "hal_net": "",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Spare",
   "machine_subsystem": "Spare",
   "status": "SPARE",
   "field_point": "Spare input on 7i84U-B",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Leave unlanded",
   "location": "Field I/O enclosure - 7i84U-B, unlanded",
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "94",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 94
  },
  {
   "id": "SEVENI84UB_IN14_SPARE",
   "name": "Seveni84Ub In14 Spare",
   "board": "7i84U-B",
   "connector": "TB3",
   "channel": "IN14",
   "hal_net": "",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Spare",
   "machine_subsystem": "Spare",
   "status": "SPARE",
   "field_point": "Spare input on 7i84U-B",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Leave unlanded",
   "location": "Field I/O enclosure - 7i84U-B, unlanded",
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "95",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 95
  },
  {
   "id": "PROBE_SKIP1",
   "name": "Probe Skip1",
   "board": "7i84U-B",
   "connector": "TB3",
   "channel": "IN15",
   "hal_net": "probe-in",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Motion",
   "machine_subsystem": "Motion",
   "status": "PROPOSED",
   "field_point": "Renishaw MP-3 probe SKIP1 (PLC X03F SKIP1.M)",
   "designations": [],
   "primary_source": "field_7i84u.hal",
   "cleanup_notes": "Moved from bare P3 gpio.042 to opto-isolated 7i84U-B input-15. MP-3 is believed NC so HAL consumes input-15-not; verify physical polarity fail-open response and measured probing latency before use.",
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
    "hm2_7i80.0.7i84.0.1.input-15-not"
   ],
   "producers": [],
   "consumers": [
    "motion.probe-input"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 265,
     "text": "net probe-in <= hm2_7i80.0.7i84.0.1.input-15-not",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.1.input-15-not"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 266,
     "text": "net probe-in => motion.probe-input",
     "commented": false,
     "producers": [],
     "consumers": [
      "motion.probe-input"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "96",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "265",
     "note": "net probe-in <= hm2_7i80.0.7i84.0.1.input-15-not"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "266",
     "note": "net probe-in => motion.probe-input"
    },
    {
     "file": "field_7i84u.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 96
  },
  {
   "id": "SEVENI84UB_IN16_SPARE",
   "name": "Seveni84Ub In16 Spare",
   "board": "7i84U-B",
   "connector": "TB2",
   "channel": "IN16",
   "hal_net": "",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Spare",
   "machine_subsystem": "Spare",
   "status": "SPARE",
   "field_point": "Spare input on 7i84U-B",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Leave unlanded",
   "location": "Field I/O enclosure - 7i84U-B, unlanded",
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "97",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 97
  },
  {
   "id": "SEVENI84UB_IN17_SPARE",
   "name": "Seveni84Ub In17 Spare",
   "board": "7i84U-B",
   "connector": "TB2",
   "channel": "IN17",
   "hal_net": "",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Spare",
   "machine_subsystem": "Spare",
   "status": "SPARE",
   "field_point": "Spare input on 7i84U-B",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Leave unlanded",
   "location": "Field I/O enclosure - 7i84U-B, unlanded",
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "98",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 98
  },
  {
   "id": "SEVENI84UB_IN18_SPARE",
   "name": "Seveni84Ub In18 Spare",
   "board": "7i84U-B",
   "connector": "TB2",
   "channel": "IN18",
   "hal_net": "",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Spare",
   "machine_subsystem": "Spare",
   "status": "SPARE",
   "field_point": "Spare input on 7i84U-B",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Leave unlanded",
   "location": "Field I/O enclosure - 7i84U-B, unlanded",
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "99",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 99
  },
  {
   "id": "SEVENI84UB_IN19_SPARE",
   "name": "Seveni84Ub In19 Spare",
   "board": "7i84U-B",
   "connector": "TB2",
   "channel": "IN19",
   "hal_net": "",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Spare",
   "machine_subsystem": "Spare",
   "status": "SPARE",
   "field_point": "Spare input on 7i84U-B",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Leave unlanded",
   "location": "Field I/O enclosure - 7i84U-B, unlanded",
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "100",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 100
  },
  {
   "id": "SEVENI84UB_IN20_SPARE",
   "name": "Seveni84Ub In20 Spare",
   "board": "7i84U-B",
   "connector": "TB2",
   "channel": "IN20",
   "hal_net": "",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Spare",
   "machine_subsystem": "Spare",
   "status": "SPARE",
   "field_point": "Spare input on 7i84U-B",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Leave unlanded",
   "location": "Field I/O enclosure - 7i84U-B, unlanded",
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "101",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 101
  },
  {
   "id": "SEVENI84UB_IN21_SPARE",
   "name": "Seveni84Ub In21 Spare",
   "board": "7i84U-B",
   "connector": "TB2",
   "channel": "IN21",
   "hal_net": "",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Spare",
   "machine_subsystem": "Spare",
   "status": "SPARE",
   "field_point": "Spare input on 7i84U-B",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Leave unlanded",
   "location": "Field I/O enclosure - 7i84U-B, unlanded",
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "102",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 102
  },
  {
   "id": "SEVENI84UB_IN22_SPARE",
   "name": "Seveni84Ub In22 Spare",
   "board": "7i84U-B",
   "connector": "TB2",
   "channel": "IN22",
   "hal_net": "",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Spare",
   "machine_subsystem": "Spare",
   "status": "SPARE",
   "field_point": "Spare input on 7i84U-B",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Leave unlanded",
   "location": "Field I/O enclosure - 7i84U-B, unlanded",
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "103",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 103
  },
  {
   "id": "SEVENI84UB_IN23_SPARE",
   "name": "Seveni84Ub In23 Spare",
   "board": "7i84U-B",
   "connector": "TB2",
   "channel": "IN23",
   "hal_net": "",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Spare",
   "machine_subsystem": "Spare",
   "status": "SPARE",
   "field_point": "Spare input on 7i84U-B",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Leave unlanded",
   "location": "Field I/O enclosure - 7i84U-B, unlanded",
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "104",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 104
  },
  {
   "id": "SEVENI84UB_IN24_SPARE",
   "name": "Seveni84Ub In24 Spare",
   "board": "7i84U-B",
   "connector": "TB2",
   "channel": "IN24",
   "hal_net": "",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Spare",
   "machine_subsystem": "Spare",
   "status": "SPARE",
   "field_point": "Spare input on 7i84U-B",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Leave unlanded",
   "location": "Field I/O enclosure - 7i84U-B, unlanded",
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "105",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 105
  },
  {
   "id": "SEVENI84UB_IN25_SPARE",
   "name": "Seveni84Ub In25 Spare",
   "board": "7i84U-B",
   "connector": "TB2",
   "channel": "IN25",
   "hal_net": "",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Spare",
   "machine_subsystem": "Spare",
   "status": "SPARE",
   "field_point": "Spare input on 7i84U-B",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Leave unlanded",
   "location": "Field I/O enclosure - 7i84U-B, unlanded",
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "106",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 106
  },
  {
   "id": "SEVENI84UB_IN26_SPARE",
   "name": "Seveni84Ub In26 Spare",
   "board": "7i84U-B",
   "connector": "TB2",
   "channel": "IN26",
   "hal_net": "",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Spare",
   "machine_subsystem": "Spare",
   "status": "SPARE",
   "field_point": "Spare input on 7i84U-B",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Leave unlanded",
   "location": "Field I/O enclosure - 7i84U-B, unlanded",
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "107",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 107
  },
  {
   "id": "SEVENI84UB_IN27_SPARE",
   "name": "Seveni84Ub In27 Spare",
   "board": "7i84U-B",
   "connector": "TB2",
   "channel": "IN27",
   "hal_net": "",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Spare",
   "machine_subsystem": "Spare",
   "status": "SPARE",
   "field_point": "Spare input on 7i84U-B",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Leave unlanded",
   "location": "Field I/O enclosure - 7i84U-B, unlanded",
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "108",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 108
  },
  {
   "id": "SEVENI84UB_IN28_SPARE",
   "name": "Seveni84Ub In28 Spare",
   "board": "7i84U-B",
   "connector": "TB2",
   "channel": "IN28",
   "hal_net": "",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Spare",
   "machine_subsystem": "Spare",
   "status": "SPARE",
   "field_point": "Spare input on 7i84U-B",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Leave unlanded",
   "location": "Field I/O enclosure - 7i84U-B, unlanded",
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "109",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 109
  },
  {
   "id": "SEVENI84UB_IN29_SPARE",
   "name": "Seveni84Ub In29 Spare",
   "board": "7i84U-B",
   "connector": "TB2",
   "channel": "IN29",
   "hal_net": "",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Spare",
   "machine_subsystem": "Spare",
   "status": "SPARE",
   "field_point": "Spare input on 7i84U-B",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Leave unlanded",
   "location": "Field I/O enclosure - 7i84U-B, unlanded",
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "110",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 110
  },
  {
   "id": "SEVENI84UB_IN30_SPARE",
   "name": "Seveni84Ub In30 Spare",
   "board": "7i84U-B",
   "connector": "TB2",
   "channel": "IN30",
   "hal_net": "",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Spare",
   "machine_subsystem": "Spare",
   "status": "SPARE",
   "field_point": "Spare input on 7i84U-B",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Leave unlanded",
   "location": "Field I/O enclosure - 7i84U-B, unlanded",
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "111",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 111
  },
  {
   "id": "SEVENI84UB_IN31_SPARE",
   "name": "Seveni84Ub In31 Spare",
   "board": "7i84U-B",
   "connector": "TB2",
   "channel": "IN31",
   "hal_net": "",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Spare",
   "machine_subsystem": "Spare",
   "status": "SPARE",
   "field_point": "Spare input on 7i84U-B",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Leave unlanded",
   "location": "Field I/O enclosure - 7i84U-B, unlanded",
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "112",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 112
  },
  {
   "id": "X_DRIVE_ENABLE",
   "name": "X Drive Enable",
   "board": "7i84U-B",
   "connector": "TB3",
   "channel": "OUT0",
   "hal_net": "x-enable",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Motion",
   "machine_subsystem": "Servo drives",
   "status": "COMMISSIONING_PENDING",
   "field_point": "X servo S-ON to MELDAS DK-427 (X-drive ENA input)",
   "designations": [],
   "primary_source": "field_7i84u.hal",
   "cleanup_notes": "Interposing relay for drive enable input; measure command-to-contact and fault-to-drop timing with the actual smart-serial configuration",
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
    "hm2_7i80.0.7i84.0.1.output-00"
   ],
   "producers": [
    "and2.0.out"
   ],
   "consumers": [
    "pid.x.enable"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 294,
     "text": "net x-enable   => pid.x.enable",
     "commented": false,
     "producers": [],
     "consumers": [
      "pid.x.enable"
     ],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 295,
     "text": "net x-enable   => hm2_7i80.0.pwmgen.00.enable",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.pwmgen.00.enable"
     ],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 302,
     "text": "net x-enable     <= and2.0.out",
     "commented": false,
     "producers": [
      "and2.0.out"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 303,
     "text": "net x-enable     => hm2_7i80.0.7i84.0.1.output-00   # X servo S-ON to MELDAS DK-427",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.7i84.0.1.output-00"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 277,
     "text": "setp hm2_7i80.0.pwmgen.00.output-type 2    # X axis  -> 7i49 AOUT0",
     "commented": false,
     "target": "hm2_7i80.0.pwmgen.00.output-type",
     "value": "2"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 278,
     "text": "setp hm2_7i80.0.pwmgen.00.scale       [JOINT_0]OUTPUT_SCALE",
     "commented": false,
     "target": "hm2_7i80.0.pwmgen.00.scale",
     "value": "[JOINT_0]OUTPUT_SCALE"
    }
   ],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "113",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "294",
     "note": "net x-enable   => pid.x.enable"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "295",
     "note": "net x-enable   => hm2_7i80.0.pwmgen.00.enable"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "302",
     "note": "net x-enable     <= and2.0.out"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "303",
     "note": "net x-enable     => hm2_7i80.0.7i84.0.1.output-00   # X servo S-ON to MELDAS DK-427"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "277",
     "note": "setp hm2_7i80.0.pwmgen.00.output-type 2    # X axis  -> 7i49 AOUT0"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "278",
     "note": "setp hm2_7i80.0.pwmgen.00.scale       [JOINT_0]OUTPUT_SCALE"
    },
    {
     "file": "field_7i84u.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 113
  },
  {
   "id": "Y_DRIVE_ENABLE",
   "name": "Y Drive Enable",
   "board": "7i84U-B",
   "connector": "TB3",
   "channel": "OUT1",
   "hal_net": "y-enable",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Motion",
   "machine_subsystem": "Servo drives",
   "status": "COMMISSIONING_PENDING",
   "field_point": "Y servo S-ON to MELDAS DK-427 (Y-drive ENA input)",
   "designations": [],
   "primary_source": "field_7i84u.hal",
   "cleanup_notes": "Interposing relay for drive enable input.",
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
    "hm2_7i80.0.7i84.0.1.output-01"
   ],
   "producers": [
    "and2.1.out"
   ],
   "consumers": [
    "pid.y.enable"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 304,
     "text": "net y-enable   => pid.y.enable",
     "commented": false,
     "producers": [],
     "consumers": [
      "pid.y.enable"
     ],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 305,
     "text": "net y-enable   => hm2_7i80.0.pwmgen.02.enable",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.pwmgen.02.enable"
     ],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 308,
     "text": "net y-enable     <= and2.1.out",
     "commented": false,
     "producers": [
      "and2.1.out"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 309,
     "text": "net y-enable     => hm2_7i80.0.7i84.0.1.output-01   # Y servo S-ON to MELDAS DK-427",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.7i84.0.1.output-01"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 281,
     "text": "setp hm2_7i80.0.pwmgen.02.output-type 2    # Y axis  -> 7i49 AOUT2",
     "commented": false,
     "target": "hm2_7i80.0.pwmgen.02.output-type",
     "value": "2"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 282,
     "text": "setp hm2_7i80.0.pwmgen.02.scale       [JOINT_1]OUTPUT_SCALE",
     "commented": false,
     "target": "hm2_7i80.0.pwmgen.02.scale",
     "value": "[JOINT_1]OUTPUT_SCALE"
    }
   ],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "114",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "304",
     "note": "net y-enable   => pid.y.enable"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "305",
     "note": "net y-enable   => hm2_7i80.0.pwmgen.02.enable"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "308",
     "note": "net y-enable     <= and2.1.out"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "309",
     "note": "net y-enable     => hm2_7i80.0.7i84.0.1.output-01   # Y servo S-ON to MELDAS DK-427"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "281",
     "note": "setp hm2_7i80.0.pwmgen.02.output-type 2    # Y axis  -> 7i49 AOUT2"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "282",
     "note": "setp hm2_7i80.0.pwmgen.02.scale       [JOINT_1]OUTPUT_SCALE"
    },
    {
     "file": "field_7i84u.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 114
  },
  {
   "id": "Z_DRIVE_ENABLE",
   "name": "Z Drive Enable",
   "board": "7i84U-B",
   "connector": "TB3",
   "channel": "OUT2",
   "hal_net": "z-enable",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Motion",
   "machine_subsystem": "Servo drives",
   "status": "COMMISSIONING_PENDING",
   "field_point": "Z servo S-ON to MELDAS DK-427 (Z-drive ENA input)",
   "designations": [],
   "primary_source": "field_7i84u.hal",
   "cleanup_notes": "Interposing relay for drive enable input.",
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
    "hm2_7i80.0.7i84.0.1.output-02"
   ],
   "producers": [
    "z-drive-drop-delay.out"
   ],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 316,
     "text": "net z-enable     <= z-drive-drop-delay.out",
     "commented": false,
     "producers": [
      "z-drive-drop-delay.out"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 317,
     "text": "net z-enable     => hm2_7i80.0.7i84.0.1.output-02   # Z servo S-ON to MELDAS DK-427",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.7i84.0.1.output-02"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "115",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "316",
     "note": "net z-enable     <= z-drive-drop-delay.out"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "317",
     "note": "net z-enable     => hm2_7i80.0.7i84.0.1.output-02   # Z servo S-ON to MELDAS DK-427"
    },
    {
     "file": "field_7i84u.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 115
  },
  {
   "id": "AIR_BLAST",
   "name": "Air Blast",
   "board": "7i84U-B",
   "connector": "TB3",
   "channel": "OUT3",
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
   "primary_source": "field_7i84u.hal",
   "cleanup_notes": "Verify SOL-62 identification against parts list pp.85-91",
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
    "hm2_7i80.0.7i84.0.1.output-03"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 320,
     "text": "# net air-blast          => hm2_7i80.0.7i84.0.1.output-03  # SOL-62 via RLY-5",
     "commented": true,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.7i84.0.1.output-03"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "116",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "320",
     "note": "commented out — # net air-blast          => hm2_7i80.0.7i84.0.1.output-03  # SOL-62 via RLY-5"
    },
    {
     "file": "field_7i84u.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C6"
   ],
   "authority_line": 116
  },
  {
   "id": "TOUCH_SENSOR_BLAST",
   "name": "Touch Sensor Blast",
   "board": "7i84U-B",
   "connector": "TB3",
   "channel": "OUT4",
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
   "primary_source": "field_7i84u.hal",
   "cleanup_notes": "MMS touch-sensor air jet",
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
    "hm2_7i80.0.7i84.0.1.output-04"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 321,
     "text": "# net touch-sensor-blast => hm2_7i80.0.7i84.0.1.output-04  # SOL-35 via RLY-6",
     "commented": true,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.7i84.0.1.output-04"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "117",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "321",
     "note": "commented out — # net touch-sensor-blast => hm2_7i80.0.7i84.0.1.output-04  # SOL-35 via RLY-6"
    },
    {
     "file": "field_7i84u.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C6"
   ],
   "authority_line": 117
  },
  {
   "id": "TAP_COOLANT_BLAST",
   "name": "Tap Coolant Blast",
   "board": "7i84U-B",
   "connector": "TB3",
   "channel": "OUT5",
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
   "primary_source": "field_7i84u.hal",
   "cleanup_notes": "",
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
    "hm2_7i80.0.7i84.0.1.output-05"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 322,
     "text": "# net tap-coolant-blast  => hm2_7i80.0.7i84.0.1.output-05  # SOL-61 via RLY-7",
     "commented": true,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.7i84.0.1.output-05"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "118",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "322",
     "note": "commented out — # net tap-coolant-blast  => hm2_7i80.0.7i84.0.1.output-05  # SOL-61 via RLY-7"
    },
    {
     "file": "field_7i84u.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [
    "C6"
   ],
   "authority_line": 118
  },
  {
   "id": "ATC_BARRIER_SOL",
   "name": "Atc Barrier Sol",
   "board": "7i84U-B",
   "connector": "TB3",
   "channel": "OUT6",
   "hal_net": "atc-barrier",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "ATC interlock",
   "machine_subsystem": "ATC interlock",
   "status": "PROPOSED",
   "field_point": "ATC barrier expand solenoid (PLC Y095 TCME.M)",
   "designations": [],
   "primary_source": "element_list_crosswalk_2026-07-27",
   "cleanup_notes": "Verify device exists on SN 060231",
   "location": "Unknown — trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "0",
    "label": "0 / de-energized — output idle unless commanded",
    "basis": "No commanding logic in the active HAL for this net; outputs default off.",
    "kind": "default-off"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.1.output-06"
   ],
   "producers": [
    "mazak-atc.atc-barrier"
   ],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 136,
     "text": "net atc-barrier           => hm2_7i80.0.7i84.0.1.output-06  # 7i84U-B OUT6 (PLC Y095 TCME.M)",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.7i84.0.1.output-06"
     ],
     "bidir": []
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 235,
     "text": "net atc-barrier         <= mazak-atc.atc-barrier",
     "commented": false,
     "producers": [
      "mazak-atc.atc-barrier"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "119",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "136",
     "note": "net atc-barrier           => hm2_7i80.0.7i84.0.1.output-06  # 7i84U-B OUT6 (PLC Y095 TCME.M)"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "235",
     "note": "net atc-barrier         <= mazak-atc.atc-barrier"
    },
    {
     "file": "element_list_crosswalk_2026-07-27",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 119
  },
  {
   "id": "FLOOD_VALVE",
   "name": "Flood Valve",
   "board": "7i84U-B",
   "connector": "TB3",
   "channel": "OUT7",
   "hal_net": "flood-valve",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Coolant",
   "machine_subsystem": "Coolant",
   "status": "PROPOSED",
   "field_point": "Flood coolant valve, separate from pump motor (PLC Y011 FCL)",
   "designations": [],
   "primary_source": "element_list_crosswalk_2026-07-27",
   "cleanup_notes": "SOL-31 confirmed via TB-51 diagram. Separate from OUT11 pump on 7i84U-A.",
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
    "hm2_7i80.0.7i84.0.1.output-07"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 324,
     "text": "# net flood-valve        => hm2_7i80.0.7i84.0.1.output-07  # PLC Y011 FCL",
     "commented": true,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.7i84.0.1.output-07"
     ],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "120",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "324",
     "note": "commented out — # net flood-valve        => hm2_7i80.0.7i84.0.1.output-07  # PLC Y011 FCL"
    },
    {
     "file": "element_list_crosswalk_2026-07-27",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 120
  },
  {
   "id": "MAG_COVER_CLOSE_SOL",
   "name": "Mag Cover Close Sol",
   "board": "7i84U-B",
   "connector": "TB2",
   "channel": "OUT8",
   "hal_net": "mag-cover-close",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Magazine",
   "machine_subsystem": "Magazine",
   "status": "PROPOSED",
   "field_point": "Single energise-to-close magazine cover valve via interposing relay",
   "designations": [],
   "primary_source": "atc_orient.hal",
   "cleanup_notes": "Logical channel allocated only; trace valve identity coil voltage relay topology and safe direction before landing field wire",
   "location": "Unknown — trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "0",
    "label": "0 / de-energized — output idle unless commanded",
    "basis": "No commanding logic in the active HAL for this net; outputs default off.",
    "kind": "default-off"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.1.output-08"
   ],
   "producers": [
    "mazak-atc.mag-cover-sol"
   ],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 140,
     "text": "net mag-cover-close       => hm2_7i80.0.7i84.0.1.output-08",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.7i84.0.1.output-08"
     ],
     "bidir": []
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 226,
     "text": "net mag-cover-close     <= mazak-atc.mag-cover-sol",
     "commented": false,
     "producers": [
      "mazak-atc.mag-cover-sol"
     ],
     "consumers": [],
     "bidir": []
    }
   ],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "121",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "140",
     "note": "net mag-cover-close       => hm2_7i80.0.7i84.0.1.output-08"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "226",
     "note": "net mag-cover-close     <= mazak-atc.mag-cover-sol"
    },
    {
     "file": "atc_orient.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 121
  },
  {
   "id": "SEVENI84UB_OUT9_SPARE",
   "name": "Seveni84Ub Out9 Spare",
   "board": "7i84U-B",
   "connector": "TB2",
   "channel": "OUT9",
   "hal_net": "",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Spare",
   "machine_subsystem": "Spare",
   "status": "SPARE",
   "field_point": "Spare output on 7i84U-B",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Leave unlanded",
   "location": "Field I/O enclosure - 7i84U-B TB2, unlanded",
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "122",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 122
  },
  {
   "id": "SEVENI84UB_OUT10_SPARE",
   "name": "Seveni84Ub Out10 Spare",
   "board": "7i84U-B",
   "connector": "TB2",
   "channel": "OUT10",
   "hal_net": "",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Spare",
   "machine_subsystem": "Spare",
   "status": "SPARE",
   "field_point": "Spare output on 7i84U-B",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Leave unlanded",
   "location": "Field I/O enclosure - 7i84U-B TB2, unlanded",
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "123",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 123
  },
  {
   "id": "SEVENI84UB_OUT11_SPARE",
   "name": "Seveni84Ub Out11 Spare",
   "board": "7i84U-B",
   "connector": "TB2",
   "channel": "OUT11",
   "hal_net": "",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Spare",
   "machine_subsystem": "Spare",
   "status": "SPARE",
   "field_point": "Spare output on 7i84U-B",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Leave unlanded",
   "location": "Field I/O enclosure - 7i84U-B TB2, unlanded",
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "124",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 124
  },
  {
   "id": "SEVENI84UB_OUT12_SPARE",
   "name": "Seveni84Ub Out12 Spare",
   "board": "7i84U-B",
   "connector": "TB2",
   "channel": "OUT12",
   "hal_net": "",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Spare",
   "machine_subsystem": "Spare",
   "status": "SPARE",
   "field_point": "Spare output on 7i84U-B",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Leave unlanded",
   "location": "Field I/O enclosure - 7i84U-B TB2, unlanded",
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "125",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 125
  },
  {
   "id": "SEVENI84UB_OUT13_SPARE",
   "name": "Seveni84Ub Out13 Spare",
   "board": "7i84U-B",
   "connector": "TB2",
   "channel": "OUT13",
   "hal_net": "",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Spare",
   "machine_subsystem": "Spare",
   "status": "SPARE",
   "field_point": "Spare output on 7i84U-B",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Leave unlanded",
   "location": "Field I/O enclosure - 7i84U-B TB2, unlanded",
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "126",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 126
  },
  {
   "id": "SEVENI84UB_OUT14_SPARE",
   "name": "Seveni84Ub Out14 Spare",
   "board": "7i84U-B",
   "connector": "TB2",
   "channel": "OUT14",
   "hal_net": "",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Spare",
   "machine_subsystem": "Spare",
   "status": "SPARE",
   "field_point": "Spare output on 7i84U-B",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Leave unlanded",
   "location": "Field I/O enclosure - 7i84U-B TB2, unlanded",
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "127",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 127
  },
  {
   "id": "SEVENI84UB_OUT15_SPARE",
   "name": "Seveni84Ub Out15 Spare",
   "board": "7i84U-B",
   "connector": "TB2",
   "channel": "OUT15",
   "hal_net": "",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Spare",
   "machine_subsystem": "Spare",
   "status": "SPARE",
   "field_point": "Spare output on 7i84U-B",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Leave unlanded",
   "location": "Field I/O enclosure - 7i84U-B TB2, unlanded",
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "128",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 128
  },
  {
   "id": "P3_GPIO_SPARE",
   "name": "P3 Gpio Spare",
   "board": "7i80HDT",
   "connector": "P3 GPIO (bare, no daughter card)",
   "channel": "TBD_FROM_IDROM",
   "hal_net": "",
   "direction": "GPIO",
   "direction_label": "GPIO",
   "subsystem": "Spare",
   "machine_subsystem": "Spare",
   "status": "SPARE",
   "field_point": "Spare direct FPGA GPIO on P3 (all pins)",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "P3 is unused/spare in this configuration. Actual GPIO indices depend on the verified bitfile/IDROM. Do NOT wire 24V field signals to bare P3; use isolated field I/O.",
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "129",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 129
  },
  {
   "id": "SEVENI84U_VIN_24V",
   "name": "Seveni84U Vin 24V",
   "board": "7i84U-A",
   "connector": "TB1",
   "channel": "TB1 pin 5 VIN (+24 V logic power)",
   "hal_net": "",
   "direction": "POWER",
   "direction_label": "Power / common",
   "subsystem": "Power",
   "machine_subsystem": "Logic power",
   "status": "ELECTRICALLY_VERIFIED",
   "field_point": "Field I/O logic power",
   "designations": [],
   "primary_source": "Mesa 7i84U manual pp.2/7-8/47",
   "cleanup_notes": "AG verified 08-07-2026: W1 physically RIGHT; direct VIN feed Mean Well +V2 through 5 A branch fuse to TB1-5; return -V4 to TB1-6; 24.0 VDC measured TB1-5 to TB1-6; de-energized continuity 0 ohms. Evidence: docs/commissioning_logs/mazak_commissioning_records_07-08-2026.json",
   "location": "Field I/O enclosure — 7i84U-A TB1 pin 5",
   "location_note": "W1 RIGHT verified; direct VIN feed from Mean Well +V2",
   "expected": {
    "value": "24.0 VDC",
    "label": "Measured TB1 pin 5 to TB1 pin 6; W1 physically RIGHT",
    "basis": "docs/commissioning_logs/mazak_commissioning_records_07-08-2026.json",
    "kind": "na"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "130",
     "note": "Current wiring authority row"
    },
    {
     "file": "Mesa 7i84U manual pp.2/7-8/47",
     "lines": "",
     "note": "primary_source column in the authority table"
    },
    {
     "file": "docs/commissioning_logs/mazak_commissioning_records_07-08-2026.json",
     "lines": "",
     "note": "Commissioning evidence referenced by the authority row"
    }
   ],
   "conflicts": [],
   "authority_line": 130
  },
  {
   "id": "SEVENI84U_GND",
   "name": "Seveni84U Gnd",
   "board": "7i84U-A",
   "connector": "TB1",
   "channel": "TB1 pins 6/7/8 GND (VIN/VFIELD common)",
   "hal_net": "",
   "direction": "POWER",
   "direction_label": "Power / common",
   "subsystem": "Power",
   "machine_subsystem": "Power common",
   "status": "COMMISSIONING_PENDING",
   "field_point": "VIN/VFIELD common return",
   "designations": [],
   "primary_source": "Mesa 7i84U manual pp.7-8",
   "cleanup_notes": "All three terminals are common; land 0 V only here.",
   "location": "Field I/O enclosure — 7i84U-A TB1 pins 6/7/8",
   "location_note": "VIN/VFIELD common return",
   "expected": {
    "value": "0 V",
    "label": "VIN/VFIELD common on TB1 pins 6/7/8",
    "basis": "Mesa 7i84U manual pp.7-8",
    "kind": "na"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "131",
     "note": "Current wiring authority row"
    },
    {
     "file": "Mesa 7i84U manual pp.7-8",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 131
  },
  {
   "id": "SEVENI84UB_VIN_24V",
   "name": "Seveni84Ub Vin 24V",
   "board": "7i84U-B",
   "connector": "TB1",
   "channel": "TB1 pin 5 VIN (+24 V logic power)",
   "hal_net": "",
   "direction": "POWER",
   "direction_label": "Power / common",
   "subsystem": "Power",
   "machine_subsystem": "Logic power",
   "status": "COMMISSIONING_PENDING",
   "field_point": "Field I/O logic power",
   "designations": [],
   "primary_source": "Mesa 7i84U manual pp.2/7-8/47",
   "cleanup_notes": "W1 left links VIN internally to VFIELDB; W1 right requires a separate 5-28 VDC VIN supply. Record W1 position and do not double-feed.",
   "location": "Field I/O enclosure — 7i84U-B TB1 pin 5",
   "location_note": "Verify W1 position before landing VIN",
   "expected": {
    "value": "24 V",
    "label": "Logic supply on TB1 pin 5; verify W1 before wiring",
    "basis": "Mesa 7i84U manual pp.2/7-8/47",
    "kind": "na"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "132",
     "note": "Current wiring authority row"
    },
    {
     "file": "Mesa 7i84U manual pp.2/7-8/47",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 132
  },
  {
   "id": "SEVENI84UB_GND",
   "name": "Seveni84Ub Gnd",
   "board": "7i84U-B",
   "connector": "TB1",
   "channel": "TB1 pins 6/7/8 GND (VIN/VFIELD common)",
   "hal_net": "",
   "direction": "POWER",
   "direction_label": "Power / common",
   "subsystem": "Power",
   "machine_subsystem": "Power common",
   "status": "COMMISSIONING_PENDING",
   "field_point": "VIN/VFIELD common return",
   "designations": [],
   "primary_source": "Mesa 7i84U manual pp.7-8",
   "cleanup_notes": "All three terminals are common; land 0 V only here.",
   "location": "Field I/O enclosure — 7i84U-B TB1 pins 6/7/8",
   "location_note": "VIN/VFIELD common return",
   "expected": {
    "value": "0 V",
    "label": "VIN/VFIELD common on TB1 pins 6/7/8",
    "basis": "Mesa 7i84U manual pp.7-8",
    "kind": "na"
   },
   "hal_state": "absent",
   "mesa_pins": [],
   "producers": [],
   "consumers": [],
   "hal_refs": [],
   "setp_refs": [],
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "133",
     "note": "Current wiring authority row"
    },
    {
     "file": "Mesa 7i84U manual pp.7-8",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "authority_line": 133
  }
 ],
 "conflicts": [
  {
   "id": "C3",
   "title": "FR-SX command architecture and polarity remain unverified",
   "severity": "conflict",
   "summary": "The field wiring has not established whether AOUT3 is an unsigned 0-10 V magnitude with discrete direction or a signed bipolar command. All motion-producing spindle paths are held by the fail-off spindle permit chain.",
   "detail": [
    "AOUT3 currently receives signed spindle.0.speed-out.",
    "7i84U-A OUT0/OUT1/OUT2 carry gated FWD/REV/RUN outputs.",
    "The static spindle-output-permit initializes FALSE; the combined gate covers FWD, REV, RUN, ORCM1, and pwmgen.03.enable and also requires watchdog, E-stop, machine-on, servo-ready, and no indicated spindle fault."
   ],
   "action": "Bench-prove the FR-SX input mode and polarity, then implement either an absolute-value analog magnitude with discrete direction or a signed analog command without conflicting direction inputs. Clear the common permit only after that change is reviewed.",
   "signals": [
    "SPINDLE_FWD",
    "SPINDLE_REV",
    "SPINDLE_ENABLE",
    "SPINDLE_ORIENT_CMD",
    "SPINDLE_SPEED_CMD"
   ],
   "sources": [
    "linuxcnc/motion_7i80hdt.hal",
    "linuxcnc/field_7i84u.hal",
    "docs/frsx_orient_model.md"
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
    "7i84U-B on physical channel 1 superseded the prior single-7i84U plan"
   ],
   "action": "The current two-card allocation has 21 DI and 7 DO spare after AIR_OK and cover output. Inventory every pallet-changer device before restoring that scope; do not order a third remote from an estimate.",
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
  "Utility"
 ],
 "connectors": [
  "P1 7i44 physical channel 0",
  "P1 7i44 physical channel 1",
  "P1 7i44 physical channels 2-7",
  "P2 Analog TB",
  "P2 Resolver channel",
  "P3 GPIO (bare, no daughter card)",
  "TB1",
  "TB2",
  "TB3",
  "UNASSIGNED",
  "none"
 ],
 "orphan_nets": [],
 "missing_from_hal": []
};
