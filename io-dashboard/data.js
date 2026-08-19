// GENERATED FILE - do not edit by hand.
// Regenerate with:  cd io-dashboard && python3 tools/generate_data.py
// Source of truth:  mesa/current_pin_authority.csv (repo root)
window.MAZAK_DATA = {
 "meta": {
  "machine": "Mazak VQC-20/40",
  "serial": "060231",
  "architecture": "LinuxCNC + Mesa 7i80HDT (Ethernet FPGA host) + 7i44 on P3 (HostMot2 sserial port 0 channels 0/1 to 7i84U-A/B) + 7i49 on P1 (resolver + analog outs); P2 unused/spare (confirmed 2026-08-13 by readhmid)",
  "generated": "2026-08-18 19:09 UTC",
  "source_repo": "mazak-vqc20-linuxcnc-retrofit",
  "authority_file": "mesa/current_pin_authority.csv",
  "epson_ferrule_file": "wiring/labels/bbia1_mesa_end_ferrules_epson.csv",
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
   "Axis feedback is Tamagawa TS2014N resolver through the 7i49 on P1, not quadrature encoder.",
   "The hardware E-stop chain removes hazardous power. 7i84U-A TB2 IN29 is the sole software monitor; the OEM hardware chain remains authoritative.",
   "Every hm2_7i80.* pin name in the HAL set is an unverified placeholder until confirmed against a firmware readhmid.",
   "7i49 AOUT order is X=AOUT0, Z=AOUT1, Y=AOUT2, FR-SX spindle velocity=AOUT3; AOUT4/AOUT5 spare.",
   "7i84U-B on 7i44 channel 1: TB3 IN0-5 limits, IN6-8 homes, IN9 air pressure, IN15 probe; TB3 OUT0-2 drive enable, OUT3-7 relay loads; TB2 OUT8 proposed cover valve; OUT9-15 spare.",
   "7i84U-A on sserial channel 0 is `hm2_7i80.0.7i84.0.0.*`; 7i84U-B on channel 1 is `hm2_7i80.0.7i84.0.1.*`; P2 has no active field binding."
  ]
 },
 "boards": {
  "7i80HDT": {
   "name": "Mesa 7i80HDT",
   "role": "Ethernet FPGA host (hm2_eth)",
   "detail": "Primary control board. P1 = 7i49 resolvers + analog outs, P3 = 7i44 sserial breakout; P2 is unused/spare (confirmed 2026-08-13 by readhmid); the probe is on 7i84U-B IN15.",
   "address": "board_ip 192.168.1.121 (host NIC enp0s31f6 at 192.168.1.1/24)"
  },
  "7i44": {
   "name": "Mesa 7i44",
   "role": "8-channel RS-422 smart-serial breakout (on 7i80HDT P3)",
   "detail": "Physical channel 0 carries 7i84U-A and channel 1 carries 7i84U-B. Channels 2-7 are spare.",
   "address": "7i80HDT P3 HostMot2 sserial port 0, channels 0 and 1"
  },
  "7i49": {
   "name": "Mesa 7i49",
   "role": "Resolver-to-digital interface + ±10V DACs (on 7i80HDT P1)",
   "detail": "Plain 7i49 (not HV). Reads the machine's original Tamagawa TS2014N shaft resolvers for X/Y/Z on RES0/1/2 at 5 kHz excitation. AOUT0/1/2 drive the X/Z/Y servos, AOUT3 drives FR-SX spindle velocity, and AOUT4/AOUT5 are spare.",
   "address": "num_resolvers=3, num_pwmgens=4 on 7i80HDT P1"
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
   "label": "Proposed — draft assignment",
   "tone": "reserved",
   "order": 3,
   "blurb": "Draft pin assignment not yet accepted into the wiring authority. The 2026-07-27 element-list cross-walk signals have since been located in the OEM diagrams and promoted (2026-08-08); the rows remaining here are HAL-planned field signals (axis over-travel limits, home switches, air-OK, probe SKIP1) plus the E-stop status monitor. Verify the device and terminals before accepting into the wiring plan.",
   "safe_to_energize": "Not accepted. Do not wire."
  },
  "FIELD_VERIFIED": {
   "label": "Field verified",
   "tone": "verified",
   "order": 0,
   "blurb": "Measured in the cabinet and signed off. No rows currently qualify.",
   "safe_to_energize": "Verified per repo records."
  },
  "FACTORY_LINK": {
   "label": "Ready — factory link",
   "tone": "verified",
   "order": 0,
   "blurb": "Final factory-built Mesa link with two distinct plug-in segments: a Mesa 50-pin IDC cable from 7i80HDT P1 to 7i44, then CAT5 smart-serial from 7i44 to 7i84U. Inspect identity, keying, seating, strain relief, and visible condition; do not continuity-audit individual conductors. Verify by clean smart-serial enumeration at LinuxCNC startup.",
   "safe_to_energize": "Factory plug-in link; functional acceptance is clean smart-serial enumeration."
  },
  "FACTORY_INTERFACE": {
   "label": "Factory interface — verify at first power",
   "tone": "pending",
   "order": 4,
   "blurb": "Machine side is OEM Mazak harness landing on the BBIA1 terminal unit — no cabinet wire to trace or land; the only wiring is Mesa <-> BBIA1 at the interface. Commissioning is a first-power functional check at the interface — input senses / output actuates — not field tracing.",
   "safe_to_energize": "Not yet commissioned. Confirm function at first power before relying on it."
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
   "blurb": "Landing is at the interface, not the field. Awaiting a first-power functional check — command polarity vs feedback direction, or load measurement — before the loop is closed or the circuit is energized.",
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
   "connector": "P1 Resolver channel",
   "channel": "RES0",
   "hal_net": "x-pos-fb",
   "direction": "RESOLVER_IN",
   "direction_label": "Input (resolver)",
   "subsystem": "Motion",
   "machine_subsystem": "Axis feedback",
   "status": "COMMISSIONING_PENDING",
   "field_point": "Tamagawa TS2014N X resolver",
   "dest_connector": "CNA3",
   "dest_pin": "12-17;20",
   "factory_wire": "A/B/F/G/H/J/N",
   "bbia_class": "analog-resolver",
   "designations": [],
   "primary_source": "motion_7i80hdt.hal",
   "cleanup_notes": "Plane B CNA3 winding roles confirmed by Mitsubishi M2 Fig 14.4-1 and 2026-08-16 resistance checks; exact conductor routes are in wiring/plane_b_pin_crosswalk.csv. Proposed pair polarity must be proven with drive disabled before closing the loop. | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/homing_ladder_transcription.md]",
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
     "line": 185,
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
     "line": 190,
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
     "line": 313,
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
     "line": 138,
     "text": "setp hm2_7i80.0.resolver.00.scale [JOINT_0]RESOLVER_SCALE",
     "commented": false,
     "target": "hm2_7i80.0.resolver.00.scale",
     "value": "[JOINT_0]RESOLVER_SCALE"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 168,
     "text": "setp hm2_7i80.0.resolver.00.velocity-scale  [JOINT_0]RESOLVER_VELOCITY_SCALE",
     "commented": false,
     "target": "hm2_7i80.0.resolver.00.velocity-scale",
     "value": "[JOINT_0]RESOLVER_VELOCITY_SCALE"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 178,
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
     "lines": "185",
     "note": "net x-pos-fb        <= hm2_7i80.0.resolver.00.position"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "190",
     "note": "net x-pos-fb        => joint.0.motor-pos-fb"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "313",
     "note": "net x-pos-fb   => pid.x.feedback"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "138",
     "note": "setp hm2_7i80.0.resolver.00.scale [JOINT_0]RESOLVER_SCALE"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "168",
     "note": "setp hm2_7i80.0.resolver.00.velocity-scale  [JOINT_0]RESOLVER_VELOCITY_SCALE"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "178",
     "note": "setp hm2_7i80.0.resolver.00.index-divisor   [JOINT_0]RESOLVER_INDEX_DIVISOR"
    },
    {
     "file": "motion_7i80hdt.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "",
    "wire": "",
    "cn_pin": "",
    "provenance": "N/A 2026-08-10: not a BBIA-1 19-connector pass-through signal - factory resolver cabling (RT-5XA-11 windings) connects the X servo amp's resolver directly via CNA3 (per resolver_commissioning.md), not through CN1-CN12; reused as-is to 7i49"
   },
   "authority_line": 2
  },
  {
   "id": "Y_RESOLVER",
   "name": "Y Resolver",
   "board": "7i49",
   "connector": "P1 Resolver channel",
   "channel": "RES1",
   "hal_net": "y-pos-fb",
   "direction": "RESOLVER_IN",
   "direction_label": "Input (resolver)",
   "subsystem": "Motion",
   "machine_subsystem": "Axis feedback",
   "status": "COMMISSIONING_PENDING",
   "field_point": "Tamagawa TS2014N Y resolver",
   "dest_connector": "CNA4",
   "dest_pin": "12-17;20",
   "factory_wire": "A/B/F/G/H/J/N",
   "bbia_class": "analog-resolver",
   "designations": [],
   "primary_source": "motion_7i80hdt.hal",
   "cleanup_notes": "Plane B CNA4 winding roles confirmed by Mitsubishi M2 Fig 14.4-1 and 2026-08-16 resistance checks; exact conductor routes are in wiring/plane_b_pin_crosswalk.csv. Proposed pair polarity must be proven with drive disabled before closing the loop. | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/homing_ladder_transcription.md]",
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
     "line": 192,
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
     "line": 197,
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
     "line": 326,
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
     "line": 139,
     "text": "setp hm2_7i80.0.resolver.01.scale [JOINT_1]RESOLVER_SCALE",
     "commented": false,
     "target": "hm2_7i80.0.resolver.01.scale",
     "value": "[JOINT_1]RESOLVER_SCALE"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 169,
     "text": "setp hm2_7i80.0.resolver.01.velocity-scale  [JOINT_1]RESOLVER_VELOCITY_SCALE",
     "commented": false,
     "target": "hm2_7i80.0.resolver.01.velocity-scale",
     "value": "[JOINT_1]RESOLVER_VELOCITY_SCALE"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 179,
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
     "lines": "192",
     "note": "net y-pos-fb        <= hm2_7i80.0.resolver.01.position"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "197",
     "note": "net y-pos-fb        => joint.1.motor-pos-fb"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "326",
     "note": "net y-pos-fb   => pid.y.feedback"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "139",
     "note": "setp hm2_7i80.0.resolver.01.scale [JOINT_1]RESOLVER_SCALE"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "169",
     "note": "setp hm2_7i80.0.resolver.01.velocity-scale  [JOINT_1]RESOLVER_VELOCITY_SCALE"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "179",
     "note": "setp hm2_7i80.0.resolver.01.index-divisor   [JOINT_1]RESOLVER_INDEX_DIVISOR"
    },
    {
     "file": "motion_7i80hdt.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "",
    "wire": "",
    "cn_pin": "",
    "provenance": "N/A 2026-08-10: not a BBIA-1 19-connector pass-through signal - factory resolver cabling connects the Y servo amp's resolver directly via CNA4, not through CN1-CN12; reused as-is to 7i49"
   },
   "authority_line": 3
  },
  {
   "id": "Z_RESOLVER",
   "name": "Z Resolver",
   "board": "7i49",
   "connector": "P1 Resolver channel",
   "channel": "RES2",
   "hal_net": "z-pos-fb",
   "direction": "RESOLVER_IN",
   "direction_label": "Input (resolver)",
   "subsystem": "Motion",
   "machine_subsystem": "Axis feedback",
   "status": "COMMISSIONING_PENDING",
   "field_point": "Tamagawa TS2014N Z resolver",
   "dest_connector": "CNA5",
   "dest_pin": "12-17;20",
   "factory_wire": "A/B/F/G/H/J/N",
   "bbia_class": "analog-resolver",
   "designations": [],
   "primary_source": "motion_7i80hdt.hal",
   "cleanup_notes": "Plane B CNA5 winding roles confirmed by Mitsubishi M2 Fig 14.4-1 and 2026-08-16 resistance checks; exact conductor routes are in wiring/plane_b_pin_crosswalk.csv. Proposed pair polarity must be proven with drive disabled before closing the loop. | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/homing_ladder_transcription.md]",
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
     "line": 199,
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
     "line": 204,
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
     "line": 336,
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
     "line": 140,
     "text": "setp hm2_7i80.0.resolver.02.scale [JOINT_2]RESOLVER_SCALE",
     "commented": false,
     "target": "hm2_7i80.0.resolver.02.scale",
     "value": "[JOINT_2]RESOLVER_SCALE"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 170,
     "text": "setp hm2_7i80.0.resolver.02.velocity-scale  [JOINT_2]RESOLVER_VELOCITY_SCALE",
     "commented": false,
     "target": "hm2_7i80.0.resolver.02.velocity-scale",
     "value": "[JOINT_2]RESOLVER_VELOCITY_SCALE"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 180,
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
     "lines": "199",
     "note": "net z-pos-fb        <= hm2_7i80.0.resolver.02.position"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "204",
     "note": "net z-pos-fb        => joint.2.motor-pos-fb"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "336",
     "note": "net z-pos-fb   => pid.z.feedback"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "140",
     "note": "setp hm2_7i80.0.resolver.02.scale [JOINT_2]RESOLVER_SCALE"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "170",
     "note": "setp hm2_7i80.0.resolver.02.velocity-scale  [JOINT_2]RESOLVER_VELOCITY_SCALE"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "180",
     "note": "setp hm2_7i80.0.resolver.02.index-divisor   [JOINT_2]RESOLVER_INDEX_DIVISOR"
    },
    {
     "file": "motion_7i80hdt.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "",
    "wire": "",
    "cn_pin": "",
    "provenance": "N/A 2026-08-10: not a BBIA-1 19-connector pass-through signal - factory resolver cabling connects the Z servo amp's resolver directly via CNA5, not through CN1-CN12; reused as-is to 7i49"
   },
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
   "field_point": "Tamagawa TS1526N55 optical shaft encoder, 512 counts/turn, DC +/-15 V (nameplate read 2026-08-15, ser A6022, 1984.6)",
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "exception",
   "designations": [],
   "primary_source": "motion_7i80hdt.hal",
   "cleanup_notes": "Current target leaves P3 empty and requests num_encoders=0. Identify encoder model/electrical format and select a compatible receiver/daughter interface plus IDROM-proven pins before allocation. | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/spindle_run_ladder_transcription.md] | [2026-08-12: STILL UNBOUND. The spindle MOTOR built-in PLG was identified from nameplate photos (Tamagawa TS1526N55 optical, 512 counts/turn, DC +/-15V, 9-pin AMP-350720-1) but it is the FR-SX drive's own detector, not this row - do not allocate it to Mesa and do not parallel-tap it. Whether the schematics' machine-side SPINDLE ENCODER (MS3108B 20-29P, dwg 4143075301 p090) is a separate device remains open. See docs/spindle_motor_plg_encoder.md] | [2026-08-12 DECIDED (owner): UNBOUND is now SETTLED, not pending. LinuxCNC does not read spindle position - orient is FR-SX internal (ORCM1/ORA1), speed supervision is discrete (SZS IN5 / speed-reach IN13), and tapping uses a floating holder so needs only FWD/REV + dwell. No rigid tapping or G33 in scope. Do not open this row again without a scoped project: an encoder on the SPINDLE side of the 2-speed gearbox, a receiver (P3 is bare 3.3V GPIO), and possibly a new bitfile] | [IDENTIFIED 2026-08-15 (AG, nameplate photo): Tamagawa TS1526N55, 512 c/t, DC +/-15 V. Identification only -- num_encoders=0 stays the settled design decision (2026-08-12); no Mesa input exists for a +/-15 V-supplied device and none is being scoped. See docs/feedback_nameplate_survey_2026-08-15.md]",
   "location": "Spindle head — machine-side A/B/Z encoder if fitted",
   "location_note": "Unassigned: part, electrical format, and receiver/interface are not confirmed. The confirmed rmsvss6_8 firmware has no Encoder module at all.",
   "expected": {
    "value": "Dynamic",
    "label": "Unavailable — encoder and receiver not identified; num_encoders=0",
    "basis": "motion_7i80hdt.hal spindle-feedback hold; the confirmed rmsvss6_8 firmware has no Encoder module at all (readhmid 2026-08-13), and resolver.03 is not used for spindle",
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
   "bb_source": null,
   "authority_line": 5
  },
  {
   "id": "RES3_SPARE",
   "name": "Res3 Spare",
   "board": "7i49",
   "connector": "P1 Resolver channel",
   "channel": "RES3",
   "hal_net": "",
   "direction": "RESOLVER_IN",
   "direction_label": "Input (resolver)",
   "subsystem": "Motion",
   "machine_subsystem": "Motion",
   "status": "SPARE",
   "field_point": "7i49 spare resolver channel",
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "analog-resolver",
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
   "bb_source": null,
   "authority_line": 6
  },
  {
   "id": "RES4_SPARE",
   "name": "Res4 Spare",
   "board": "7i49",
   "connector": "P1 Resolver channel",
   "channel": "RES4",
   "hal_net": "",
   "direction": "RESOLVER_IN",
   "direction_label": "Input (resolver)",
   "subsystem": "Motion",
   "machine_subsystem": "Motion",
   "status": "SPARE",
   "field_point": "7i49 spare resolver channel",
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "analog-resolver",
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
   "bb_source": null,
   "authority_line": 7
  },
  {
   "id": "RES5_SPARE",
   "name": "Res5 Spare",
   "board": "7i49",
   "connector": "P1 Resolver channel",
   "channel": "RES5",
   "hal_net": "",
   "direction": "RESOLVER_IN",
   "direction_label": "Input (resolver)",
   "subsystem": "Motion",
   "machine_subsystem": "Motion",
   "status": "SPARE",
   "field_point": "7i49 spare resolver channel",
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "analog-resolver",
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
   "bb_source": null,
   "authority_line": 8
  },
  {
   "id": "X_AXIS_CMD",
   "name": "X Axis Cmd",
   "board": "7i49",
   "connector": "P1 Analog TB",
   "channel": "AOUT0",
   "hal_net": "x-vel-cmd",
   "direction": "ANALOG_OUT",
   "direction_label": "Output (analog)",
   "subsystem": "Motion",
   "machine_subsystem": "Servo drives",
   "status": "HOLD_SOURCE_TRACE",
   "field_point": "X servo analog velocity command to MELDAS TRA",
   "dest_connector": "TBD",
   "dest_pin": "TBD",
   "factory_wire": "",
   "bbia_class": "analog-resolver",
   "designations": [],
   "primary_source": "motion_7i80hdt.hal",
   "cleanup_notes": "7i49 P4-20 AOUT0 with P4-19 GND0; Plane B OEM connector and DK-427 input polarity are not yet traced. Do not land until the removed NC command pair is continuity-proven. See wiring/plane_b_pin_crosswalk.csv.",
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
     "line": 319,
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
     "line": 320,
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
     "line": 304,
     "text": "setp hm2_7i80.0.pwmgen.00.output-type 2    # X axis  -> 7i49 AOUT0",
     "commented": false,
     "target": "hm2_7i80.0.pwmgen.00.output-type",
     "value": "2"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 305,
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
     "lines": "319",
     "note": "net x-vel-cmd  <= pid.x.output"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "320",
     "note": "net x-vel-cmd  => hm2_7i80.0.pwmgen.00.value"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "304",
     "note": "setp hm2_7i80.0.pwmgen.00.output-type 2    # X axis  -> 7i49 AOUT0"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "305",
     "note": "setp hm2_7i80.0.pwmgen.00.scale       [JOINT_0]OUTPUT_SCALE"
    },
    {
     "file": "motion_7i80hdt.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "",
    "wire": "",
    "cn_pin": "",
    "provenance": "N/A 2026-08-10: not a BBIA-1 19-connector pass-through signal - factory servo-command cabling connects the X servo amp directly to the NC's servo-interface hardware, not through CN1-CN12; new Mesa analog wiring reuses that factory cable to 7i49, per resolver_commissioning.md / servo_amp_analysis.md"
   },
   "authority_line": 9
  },
  {
   "id": "Z_AXIS_CMD",
   "name": "Z Axis Cmd",
   "board": "7i49",
   "connector": "P1 Analog TB",
   "channel": "AOUT1",
   "hal_net": "z-vel-cmd",
   "direction": "ANALOG_OUT",
   "direction_label": "Output (analog)",
   "subsystem": "Motion",
   "machine_subsystem": "Servo drives",
   "status": "HOLD_SOURCE_TRACE",
   "field_point": "Z servo analog velocity command to MELDAS TRA",
   "dest_connector": "TBD",
   "dest_pin": "TBD",
   "factory_wire": "",
   "bbia_class": "analog-resolver",
   "designations": [],
   "primary_source": "motion_7i80hdt.hal",
   "cleanup_notes": "7i49 P4-24 AOUT1 with P4-23 GND1; Plane B OEM connector and DK-427 input polarity are not yet traced. Do not land until the removed NC command pair is continuity-proven. See wiring/plane_b_pin_crosswalk.csv.",
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
     "line": 339,
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
     "line": 340,
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
     "line": 306,
     "text": "setp hm2_7i80.0.pwmgen.01.output-type 2    # Z axis  -> 7i49 AOUT1",
     "commented": false,
     "target": "hm2_7i80.0.pwmgen.01.output-type",
     "value": "2"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 307,
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
     "lines": "339",
     "note": "net z-vel-cmd  <= pid.z.output"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "340",
     "note": "net z-vel-cmd  => hm2_7i80.0.pwmgen.01.value    # Z → pwmgen.01 (7i49 AOUT1)"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "306",
     "note": "setp hm2_7i80.0.pwmgen.01.output-type 2    # Z axis  -> 7i49 AOUT1"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "307",
     "note": "setp hm2_7i80.0.pwmgen.01.scale       [JOINT_2]OUTPUT_SCALE"
    },
    {
     "file": "motion_7i80hdt.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "",
    "wire": "",
    "cn_pin": "",
    "provenance": "N/A 2026-08-10: not a BBIA-1 19-connector pass-through signal - same reasoning as X_AXIS_CMD"
   },
   "authority_line": 10
  },
  {
   "id": "Y_AXIS_CMD",
   "name": "Y Axis Cmd",
   "board": "7i49",
   "connector": "P1 Analog TB",
   "channel": "AOUT2",
   "hal_net": "y-vel-cmd",
   "direction": "ANALOG_OUT",
   "direction_label": "Output (analog)",
   "subsystem": "Motion",
   "machine_subsystem": "Servo drives",
   "status": "HOLD_SOURCE_TRACE",
   "field_point": "Y servo analog velocity command to MELDAS TRA",
   "dest_connector": "TBD",
   "dest_pin": "TBD",
   "factory_wire": "",
   "bbia_class": "analog-resolver",
   "designations": [],
   "primary_source": "motion_7i80hdt.hal",
   "cleanup_notes": "7i49 P3-20 AOUT2 with P3-19 GND2; Plane B OEM connector and DK-427 input polarity are not yet traced. Do not land until the removed NC command pair is continuity-proven. See wiring/plane_b_pin_crosswalk.csv.",
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
     "line": 329,
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
     "line": 330,
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
     "line": 308,
     "text": "setp hm2_7i80.0.pwmgen.02.output-type 2    # Y axis  -> 7i49 AOUT2",
     "commented": false,
     "target": "hm2_7i80.0.pwmgen.02.output-type",
     "value": "2"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 309,
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
     "lines": "329",
     "note": "net y-vel-cmd  <= pid.y.output"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "330",
     "note": "net y-vel-cmd  => hm2_7i80.0.pwmgen.02.value    # Y → pwmgen.02 (7i49 AOUT2)"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "308",
     "note": "setp hm2_7i80.0.pwmgen.02.output-type 2    # Y axis  -> 7i49 AOUT2"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "309",
     "note": "setp hm2_7i80.0.pwmgen.02.scale       [JOINT_1]OUTPUT_SCALE"
    },
    {
     "file": "motion_7i80hdt.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "",
    "wire": "",
    "cn_pin": "",
    "provenance": "N/A 2026-08-10: not a BBIA-1 19-connector pass-through signal - same reasoning as X_AXIS_CMD, factory cable direct to servo amp"
   },
   "authority_line": 11
  },
  {
   "id": "SPINDLE_SPEED_CMD",
   "name": "Spindle Speed Cmd",
   "board": "7i49",
   "connector": "P1 Analog TB",
   "channel": "AOUT3",
   "hal_net": "spindle-speed-cmd",
   "direction": "ANALOG_OUT",
   "direction_label": "Output (analog)",
   "subsystem": "Spindle",
   "machine_subsystem": "Spindle drive",
   "status": "HOLD_ANALOG_ROLE",
   "field_point": "FR-SX speed reference",
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "analog-resolver",
   "designations": [],
   "primary_source": "motion_7i80hdt.hal",
   "cleanup_notes": "7i49 P3-24 AOUT3 with P3-23 GND3. OEM drawings confirm Plane A BBIA-1 CN4-18/-19/-20 SE1/SE2/SE3 to SX-IO1 CON1-31/-32/-30; determine command/common/shield roles and 0-10 V scaling before landing. The three conductor rows live in wiring/plane_b_pin_crosswalk.csv because this one-channel authority row cannot represent them individually.",
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
    "spindle.0.speed-out-abs"
   ],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 418,
     "text": "net spindle-speed-cmd <= spindle.0.speed-out-abs",
     "commented": false,
     "producers": [
      "spindle.0.speed-out-abs"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 419,
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
     "line": 404,
     "text": "setp hm2_7i80.0.pwmgen.03.output-type 2",
     "commented": false,
     "target": "hm2_7i80.0.pwmgen.03.output-type",
     "value": "2"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 405,
     "text": "setp hm2_7i80.0.pwmgen.03.offset-mode 0",
     "commented": false,
     "target": "hm2_7i80.0.pwmgen.03.offset-mode",
     "value": "0"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 406,
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
     "lines": "418",
     "note": "net spindle-speed-cmd <= spindle.0.speed-out-abs"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "419",
     "note": "net spindle-speed-cmd => hm2_7i80.0.pwmgen.03.value"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "404",
     "note": "setp hm2_7i80.0.pwmgen.03.output-type 2"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "405",
     "note": "setp hm2_7i80.0.pwmgen.03.offset-mode 0"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "406",
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
   "bb_source": {
    "cnd_pin": "",
    "wire": "",
    "cn_pin": "",
    "provenance": "N/A 2026-08-10: not a BBIA-1 19-connector pass-through signal - the old NC-side analog path was CND5-4/5 'S ANALOG OUTPUT' (Dwg 4143075408 pg134) direct to the spindle controller CON1, separate from the digital I/O terminal unit; new Mesa analog wiring reuses the factory cable to the FR-SX SE1/SE2/SE3 terminals per servo_amp_analysis.md, not through CN1-CN12"
   },
   "authority_line": 12
  },
  {
   "id": "AOUT4_SPARE",
   "name": "Aout4 Spare",
   "board": "7i49",
   "connector": "P1 Analog TB",
   "channel": "AOUT4",
   "hal_net": "",
   "direction": "ANALOG_OUT",
   "direction_label": "Output (analog)",
   "subsystem": "Spare",
   "machine_subsystem": "Spare",
   "status": "SPARE",
   "field_point": "Spare 7i49 analog output",
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "analog-resolver",
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
   "bb_source": null,
   "authority_line": 13
  },
  {
   "id": "AOUT5_SPARE",
   "name": "Aout5 Spare",
   "board": "7i49",
   "connector": "P1 Analog TB",
   "channel": "AOUT5",
   "hal_net": "",
   "direction": "ANALOG_OUT",
   "direction_label": "Output (analog)",
   "subsystem": "Spare",
   "machine_subsystem": "Spare",
   "status": "SPARE",
   "field_point": "Spare 7i49 analog output",
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "analog-resolver",
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
   "bb_source": null,
   "authority_line": 14
  },
  {
   "id": "SSERIAL_PORT0_TXA",
   "name": "Sserial Port0 Txa",
   "board": "7i44",
   "connector": "P3 7i44 physical channel 0",
   "channel": "port0.TX+",
   "hal_net": "",
   "direction": "LINK",
   "direction_label": "Link (smart-serial)",
   "subsystem": "Field I/O",
   "machine_subsystem": "Field I/O link",
   "status": "FACTORY_LINK",
   "field_point": "7i84U-A RJ45 pin 2 RX+",
   "dest_connector": "7i84U-A RJ45",
   "dest_pin": "2",
   "factory_wire": "",
   "bbia_class": "power-internal",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "7i44 channel 0 to 7i84U-A CN0 under HostMot2 port 0; RS-422 differential pair | [MESA-CONFIRMED 2026-08-08: matches 7i84U J1 RJ-45 pinout (7i84uman.pdf: p1 RXA/p2 RXB/p3 TXA/p6 TXB/p4-5 GND/p7-8 +5V, 568B colors); straight CAT5 to 7i44; plug-in cable, no continuity trace needed] | [READY 2026-08-09: factory-link acceptance applies to two distinct plug-in segments: Mesa 50-pin IDC from 7i80HDT P1 to 7i44, then CAT5 smart-serial from 7i44 to the identified 7i84U channel. Inspect assembly identity, keying/orientation, seating, strain relief, and visible condition; verify expected smart-serial enumeration without communication or watchdog faults. Do not continuity-audit or re-terminate individual conductors.]",
   "location": "Control cabinet — 7i80HDT P3 to 7i44 by Mesa 50-pin IDC; 7i44 channel 0 to 7i84U-A CN0/RJ45 by CAT5 smart-serial",
   "location_note": "Factory plug-in link: inspect identity, keying/orientation, seating, strain relief, and visible condition; verify clean smart-serial enumeration. Do not continuity-audit or re-terminate individual conductors.",
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
   "bb_source": null,
   "authority_line": 15
  },
  {
   "id": "SSERIAL_PORT0_TXB",
   "name": "Sserial Port0 Txb",
   "board": "7i44",
   "connector": "P3 7i44 physical channel 0",
   "channel": "port0.TX-",
   "hal_net": "",
   "direction": "LINK",
   "direction_label": "Link (smart-serial)",
   "subsystem": "Field I/O",
   "machine_subsystem": "Field I/O link",
   "status": "FACTORY_LINK",
   "field_point": "7i84U-A RJ45 pin 1 RX-",
   "dest_connector": "7i84U-A RJ45",
   "dest_pin": "1",
   "factory_wire": "",
   "bbia_class": "power-internal",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "RS-422 differential pair | [MESA-CONFIRMED 2026-08-08: matches 7i84U J1 RJ-45 pinout (7i84uman.pdf: p1 RXA/p2 RXB/p3 TXA/p6 TXB/p4-5 GND/p7-8 +5V, 568B colors); straight CAT5 to 7i44; plug-in cable, no continuity trace needed] | [READY 2026-08-09: factory-link acceptance applies to two distinct plug-in segments: Mesa 50-pin IDC from 7i80HDT P1 to 7i44, then CAT5 smart-serial from 7i44 to the identified 7i84U channel. Inspect assembly identity, keying/orientation, seating, strain relief, and visible condition; verify expected smart-serial enumeration without communication or watchdog faults. Do not continuity-audit or re-terminate individual conductors.]",
   "location": "Control cabinet — 7i80HDT P3 to 7i44 by Mesa 50-pin IDC; 7i44 channel 0 to 7i84U-A CN0/RJ45 by CAT5 smart-serial",
   "location_note": "Factory plug-in link: inspect identity, keying/orientation, seating, strain relief, and visible condition; verify clean smart-serial enumeration. Do not continuity-audit or re-terminate individual conductors.",
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
   "bb_source": null,
   "authority_line": 16
  },
  {
   "id": "SSERIAL_PORT0_RXA",
   "name": "Sserial Port0 Rxa",
   "board": "7i44",
   "connector": "P3 7i44 physical channel 0",
   "channel": "port0.RX+",
   "hal_net": "",
   "direction": "LINK",
   "direction_label": "Link (smart-serial)",
   "subsystem": "Field I/O",
   "machine_subsystem": "Field I/O link",
   "status": "FACTORY_LINK",
   "field_point": "7i84U-A RJ45 pin 6 TX+",
   "dest_connector": "7i84U-A RJ45",
   "dest_pin": "6",
   "factory_wire": "",
   "bbia_class": "power-internal",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "RS-422 differential pair | [MESA-CONFIRMED 2026-08-08: matches 7i84U J1 RJ-45 pinout (7i84uman.pdf: p1 RXA/p2 RXB/p3 TXA/p6 TXB/p4-5 GND/p7-8 +5V, 568B colors); straight CAT5 to 7i44; plug-in cable, no continuity trace needed] | [READY 2026-08-09: factory-link acceptance applies to two distinct plug-in segments: Mesa 50-pin IDC from 7i80HDT P1 to 7i44, then CAT5 smart-serial from 7i44 to the identified 7i84U channel. Inspect assembly identity, keying/orientation, seating, strain relief, and visible condition; verify expected smart-serial enumeration without communication or watchdog faults. Do not continuity-audit or re-terminate individual conductors.]",
   "location": "Control cabinet — 7i80HDT P3 to 7i44 by Mesa 50-pin IDC; 7i44 channel 0 to 7i84U-A CN0/RJ45 by CAT5 smart-serial",
   "location_note": "Factory plug-in link: inspect identity, keying/orientation, seating, strain relief, and visible condition; verify clean smart-serial enumeration. Do not continuity-audit or re-terminate individual conductors.",
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
   "bb_source": null,
   "authority_line": 17
  },
  {
   "id": "SSERIAL_PORT0_RXB",
   "name": "Sserial Port0 Rxb",
   "board": "7i44",
   "connector": "P3 7i44 physical channel 0",
   "channel": "port0.RX-",
   "hal_net": "",
   "direction": "LINK",
   "direction_label": "Link (smart-serial)",
   "subsystem": "Field I/O",
   "machine_subsystem": "Field I/O link",
   "status": "FACTORY_LINK",
   "field_point": "7i84U-A RJ45 pin 3 TX-",
   "dest_connector": "7i84U-A RJ45",
   "dest_pin": "3",
   "factory_wire": "",
   "bbia_class": "power-internal",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "RS-422 differential pair | [MESA-CONFIRMED 2026-08-08: matches 7i84U J1 RJ-45 pinout (7i84uman.pdf: p1 RXA/p2 RXB/p3 TXA/p6 TXB/p4-5 GND/p7-8 +5V, 568B colors); straight CAT5 to 7i44; plug-in cable, no continuity trace needed] | [READY 2026-08-09: factory-link acceptance applies to two distinct plug-in segments: Mesa 50-pin IDC from 7i80HDT P1 to 7i44, then CAT5 smart-serial from 7i44 to the identified 7i84U channel. Inspect assembly identity, keying/orientation, seating, strain relief, and visible condition; verify expected smart-serial enumeration without communication or watchdog faults. Do not continuity-audit or re-terminate individual conductors.]",
   "location": "Control cabinet — 7i80HDT P3 to 7i44 by Mesa 50-pin IDC; 7i44 channel 0 to 7i84U-A CN0/RJ45 by CAT5 smart-serial",
   "location_note": "Factory plug-in link: inspect identity, keying/orientation, seating, strain relief, and visible condition; verify clean smart-serial enumeration. Do not continuity-audit or re-terminate individual conductors.",
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
   "bb_source": null,
   "authority_line": 18
  },
  {
   "id": "SSERIAL_PORT0_GND",
   "name": "Sserial Port0 Gnd",
   "board": "7i44",
   "connector": "P3 7i44 physical channel 0",
   "channel": "port0.GND",
   "hal_net": "",
   "direction": "LINK",
   "direction_label": "Link (smart-serial)",
   "subsystem": "Field I/O",
   "machine_subsystem": "Field I/O link",
   "status": "FACTORY_LINK",
   "field_point": "7i84U-A RJ45 pin 4/5 ground",
   "dest_connector": "7i84U-A RJ45",
   "dest_pin": "4/5",
   "factory_wire": "",
   "bbia_class": "power-internal",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Factory-link signal ground; cable construction is not field-modified | [MESA-CONFIRMED 2026-08-08: matches 7i84U J1 RJ-45 pinout (7i84uman.pdf: p1 RXA/p2 RXB/p3 TXA/p6 TXB/p4-5 GND/p7-8 +5V, 568B colors); straight CAT5 to 7i44] | [READY 2026-08-09: two distinct plug-in segments: Mesa 50-pin IDC from 7i80HDT P1 to 7i44, then CAT5 smart-serial from 7i44 channel 0 to 7i84U-A. Inspect assembly identity, keying/orientation, seating, strain relief, and visible condition; verify expected smart-serial enumeration without communication or watchdog faults. Do not continuity-audit or re-terminate individual conductors.]",
   "location": "Control cabinet — 7i80HDT P3 to 7i44 by Mesa 50-pin IDC; 7i44 channel 0 to 7i84U-A CN0/RJ45 by CAT5 smart-serial",
   "location_note": "Factory plug-in link: inspect identity, keying/orientation, seating, strain relief, and visible condition; verify clean smart-serial enumeration. Do not continuity-audit or re-terminate individual conductors.",
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
   "bb_source": null,
   "authority_line": 19
  },
  {
   "id": "SSERIAL_PORT0_5V",
   "name": "Sserial Port0 5V",
   "board": "7i44",
   "connector": "P3 7i44 physical channel 0",
   "channel": "port0.+5V",
   "hal_net": "",
   "direction": "LINK",
   "direction_label": "Link (smart-serial)",
   "subsystem": "Field I/O",
   "machine_subsystem": "Field I/O link",
   "status": "FACTORY_LINK",
   "field_point": "7i84U-A RJ45 pin 7/8 +5V",
   "dest_connector": "7i84U-A RJ45",
   "dest_pin": "7/8",
   "factory_wire": "",
   "bbia_class": "power-internal",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Serial power for 7i84U-A logic | [MESA-CONFIRMED 2026-08-08: matches 7i84U J1 RJ-45 pinout (7i84uman.pdf: p1 RXA/p2 RXB/p3 TXA/p6 TXB/p4-5 GND/p7-8 +5V, 568B colors); straight CAT5 to 7i44; plug-in cable, no continuity trace needed] | [READY 2026-08-09: factory-link acceptance applies to two distinct plug-in segments: Mesa 50-pin IDC from 7i80HDT P1 to 7i44, then CAT5 smart-serial from 7i44 to the identified 7i84U channel. Inspect assembly identity, keying/orientation, seating, strain relief, and visible condition; verify expected smart-serial enumeration without communication or watchdog faults. Do not continuity-audit or re-terminate individual conductors.]",
   "location": "Control cabinet — 7i80HDT P3 to 7i44 by Mesa 50-pin IDC; 7i44 channel 0 to 7i84U-A CN0/RJ45 by CAT5 smart-serial",
   "location_note": "Factory plug-in link: inspect identity, keying/orientation, seating, strain relief, and visible condition; verify clean smart-serial enumeration. Do not continuity-audit or re-terminate individual conductors.",
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
   "bb_source": null,
   "authority_line": 20
  },
  {
   "id": "SSERIAL_PORTS_2_7_SPARE",
   "name": "Sserial Ports 2 7 Spare",
   "board": "7i44",
   "connector": "P3 7i44 physical channels 2-7",
   "channel": "ports2-7",
   "hal_net": "",
   "direction": "LINK",
   "direction_label": "Link (smart-serial)",
   "subsystem": "Expansion",
   "machine_subsystem": "Expansion",
   "status": "SPARE",
   "field_point": "Spare smart-serial channels",
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "power-internal",
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
   "bb_source": null,
   "authority_line": 21
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
   "status": "FACTORY_INTERFACE",
   "field_point": "PRS-55 Y ATC zone",
   "dest_connector": "CN3",
   "dest_pin": "44",
   "factory_wire": "+LY2",
   "bbia_class": "plane",
   "designations": [
    "PRS-55"
   ],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Update field_7i84u.hal because it currently uses input-02 | [RECON 2026-08-08 §F: PRS-55 (+Y 2nd, +LY2) confirmed by Dwg 4143075409 (Motion Switch Input 3)] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/atc_ladder_transcription.md]",
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
     "line": 34,
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
     "lines": "22",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "34",
     "note": "net atc-y-zone         <= hm2_7i80.0.7i84.0.0.input-00   # IN0  PRS-55 Y ATC zone"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "CN3-44",
    "wire": "+LY2",
    "cn_pin": "CN3-44",
    "provenance": "RESOLVED 2026-08-10: Dwg 4143075409 pg135 '2nd +Y OVER TRAVEL' = PRS-55 wire +LY2 at T.U CN3-44 - matches authority CSV's PRS-55 citation exactly"
   },
   "authority_line": 22
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
   "status": "FACTORY_INTERFACE",
   "field_point": "PRS-66 Z ATC zone",
   "dest_connector": "CN3",
   "dest_pin": "39",
   "factory_wire": "-LZ2",
   "bbia_class": "plane",
   "designations": [
    "PRS-66"
   ],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Update field_7i84u.hal because it currently uses input-03 | [RECON 2026-08-08 §F: PRS-66 (-Z 2nd, -LZ2) confirmed by Dwg 4143075409 (Motion Switch Input 3)] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/atc_ladder_transcription.md]",
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
     "line": 35,
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
     "lines": "23",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "35",
     "note": "net atc-z-zone         <= hm2_7i80.0.7i84.0.0.input-01   # IN1  PRS-66 Z ATC zone"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "CN3-39",
    "wire": "-LZ2",
    "cn_pin": "CN3-39",
    "provenance": "RESOLVED 2026-08-10: Dwg 4143075409 pg135 '2nd -Z OVER TRAVEL' = PRS-66 wire -LZ2 at T.U CN3-39 - matches authority CSV's PRS-66 citation exactly"
   },
   "authority_line": 23
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
   "status": "FACTORY_INTERFACE",
   "field_point": "PHS-181 magazine tool available",
   "dest_connector": "CN2",
   "dest_pin": "13",
   "factory_wire": "381",
   "bbia_class": "plane",
   "designations": [
    "PHS-181",
    "PHS-127"
   ],
   "primary_source": "phase2_plan",
   "cleanup_notes": "Add HAL net when confirmed | [RECON 2026-08-08 §F: PHS-181 line 381 (settles PHS-127 vs 181) confirmed by Dwg 4143075409 (Motion Switch Input 3)] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/atc_ladder_transcription.md]",
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
     "line": 240,
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
     "lines": "24",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "106",
     "note": "net mag-tool-avail        <= hm2_7i80.0.7i84.0.0.input-02   # IN2  X005 MGTDPRS"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "240",
     "note": "net mag-tool-avail      => mazak-atc.mag-tool-avail"
    },
    {
     "file": "phase2_plan",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "CN2-13",
    "wire": "381",
    "cn_pin": "CN2-13",
    "provenance": "RESOLVED 2026-08-10: Dwg 4143075409 pg135 confirms wire 381 = TOOL DETECTOR (PHS-181) at T.U CN2-13, matching the BBIA-1 board pinout's wire# at CN2-13 even though the board labels that pin LUBE TIMER (label mismatch, wire# + independent schematic corroboration trusted); supersedes the prior CN6-37 ambiguity"
   },
   "authority_line": 24
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
   "status": "FACTORY_INTERFACE",
   "field_point": "PHS-182 spindle tool available",
   "dest_connector": "CN6",
   "dest_pin": "50",
   "factory_wire": "382",
   "bbia_class": "plane",
   "designations": [
    "PHS-182",
    "PHS-132"
   ],
   "primary_source": "phase2_plan",
   "cleanup_notes": "Add HAL net when confirmed | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/atc_ladder_transcription.md]",
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
     "line": 241,
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
     "lines": "25",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "107",
     "note": "net spindle-tool-avail    <= hm2_7i80.0.7i84.0.0.input-03   # IN3  X05B SPTDPRS"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "241",
     "note": "net spindle-tool-avail  => mazak-atc.spindle-tool-avail"
    },
    {
     "file": "phase2_plan",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "CN6-50",
    "wire": "382",
    "cn_pin": "CN6-50",
    "provenance": "CANDIDATE 2026-08-10: BBIA-1 board pinout CN6-50 = wire382 MAGAZINE SPINDLE TOOL DETECTOR (best label match for PHS-182 spindle-tool-available); same wire382 also appears at CN2-42 SPINDLE TOOL CLAMP OK. Dwg 4143075408 pg134 shows a third candidate T.U CN3-44 'SPTDPRS' with no confirmed wire# - three plausible pins for one signal, verify in field before landing"
   },
   "authority_line": 25
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
   "status": "FACTORY_INTERFACE",
   "field_point": "FR-SX orient arrival (PLC X003 ORA1)",
   "dest_connector": "CN4",
   "dest_pin": "16",
   "factory_wire": "SETA",
   "bbia_class": "plane",
   "designations": [],
   "primary_source": "element_list_crosswalk_2026-07-27",
   "cleanup_notes": "ATC cannot cycle without orient; confirm FR-SX terminal and polarity | [RECON 2026-08-08 §A: element list confirms X003 ORA1 'ORIENT ARRIVAL' (ladder 3006/4810/5509) on 060231] | [RECON 2026-08-08 §D: FR-SX OBA1(t22)/OBA2(t23) -> CN4-16/CN4-17 (digits verify)] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/spindle_run_ladder_transcription.md]",
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
     "line": 160,
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
   "epson_ferrules": [
    {
     "label_text": "A-TB3-05",
     "wire": "SETA",
     "old_location": "CN4-16",
     "signal": "set A",
     "mesa_card": "7i84U-A",
     "connector": "TB3",
     "logical_channel": "IN4",
     "physical_pin": "TB3-05",
     "crosswalk_status": "PLANNED_MATCH",
     "release_status": "HOLD_SOURCE_TRACE",
     "source_line": 20
    }
   ],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "26",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "108",
     "note": "net spindle-oriented      <= hm2_7i80.0.7i84.0.0.input-04   # IN4  X003 ORA1"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "160",
     "note": "net spindle-oriented    => mazak-orient.spindle-oriented"
    },
    {
     "file": "element_list_crosswalk_2026-07-27",
     "lines": "",
     "note": "primary_source column in the authority table"
    },
    {
     "file": "wiring/labels/bbia1_mesa_end_ferrules_epson.csv",
     "lines": "20",
     "note": "Epson Mesa-end ferrule A-TB3-05; HOLD_SOURCE_TRACE"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "CN4-16",
    "wire": "SETA",
    "cn_pin": "CN4-16",
    "provenance": "LOW CONFIDENCE 2026-08-10: pre-existing authority note flags this as unverified (FR-SX OBA1(t22)/OBA2(t23) -> CN4-16/CN4-17, 'digits verify'); BBIA-1 board pinout shows CN4-16/17 labeled SETA/SETB not OBA1/OBA2 - functionally plausible (orient-arrival confirmation bits) but not independently corroborated by wire# or a dedicated schematic row this session. Field-verify before commissioning"
   },
   "authority_line": 26
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
   "status": "FACTORY_INTERFACE",
   "field_point": "FR-SX zero-speed output (PLC X001 SZS.M)",
   "dest_connector": "CN4",
   "dest_pin": "1",
   "factory_wire": "231",
   "bbia_class": "plane",
   "designations": [],
   "primary_source": "element_list_crosswalk_2026-07-27",
   "cleanup_notes": "Distinct from IN13 speed-reach; gear shift interlock needs zero-speed | [RECON 2026-08-08 §A: element list confirms X001 SZS.M 'SPINDLE ZERO SPEED' on 060231] | [RECON 2026-08-08 §D: FR-SX ESL1(t3)/ES2(t4) -> CN4-1/CN4-2 (digits verify)] | [LOCATED 2026-08-08: X01 SZS.M wire 143 T.U CN3-4, Dwg 4143075407 pg133] | [PINOUT-RECONCILED 2026-08-09: BBIA-1 board = wire 231, CN4-1 (matches the FR-SX CON1->CN4 reading in the D-section; supersedes the pg133 'wire 143 / CN3-4' LOCATED note).] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/spindle_run_ladder_transcription.md]",
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
     "line": 161,
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
     "line": 198,
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
     "label_text": "A-TB3-06",
     "wire": "231",
     "old_location": "CN4-1",
     "signal": "SPINDLE ZERO SPEED",
     "mesa_card": "7i84U-A",
     "connector": "TB3",
     "logical_channel": "IN5",
     "physical_pin": "TB3-06",
     "crosswalk_status": "PLANNED_MATCH",
     "release_status": "HOLD_SOURCE_TRACE",
     "source_line": 16
    }
   ],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "27",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "109",
     "note": "net spindle-zero-speed    <= hm2_7i80.0.7i84.0.0.input-05   # IN5  X001 SZS.M"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "161",
     "note": "net spindle-zero-speed  => mazak-orient.spindle-zero-speed"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "198",
     "note": "net spindle-zero-speed  => mazak-atc.spindle-stopped"
    },
    {
     "file": "element_list_crosswalk_2026-07-27",
     "lines": "",
     "note": "primary_source column in the authority table"
    },
    {
     "file": "wiring/labels/bbia1_mesa_end_ferrules_epson.csv",
     "lines": "16",
     "note": "Epson Mesa-end ferrule A-TB3-06; HOLD_SOURCE_TRACE"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "CN4-1",
    "wire": "231",
    "cn_pin": "CN4-1",
    "provenance": "BBIA-1 board pinout (trusted over pg135)"
   },
   "authority_line": 27
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
   "status": "FACTORY_INTERFACE",
   "field_point": "Magazine cover open reed switch (PLC X052 MGCORS)",
   "dest_connector": "CN2",
   "dest_pin": "11",
   "factory_wire": "218",
   "bbia_class": "plane",
   "designations": [],
   "primary_source": "element_list_crosswalk_2026-07-27",
   "cleanup_notes": "Pairs with NET_MAG_COVER_OPEN/CLOSE solenoids; locate RS on cover | [RECON 2026-08-08 §A/§F: X052 MGCORS + RS-18 line 218 (Dwg 4143075409) confirm on 060231] | [LOCATED 2026-08-08: RS-18 wire 218 MGCORS X52, Dwg 4143075409 pg135] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/atc_ladder_transcription.md]",
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
     "line": 236,
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
     "lines": "28",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "110",
     "note": "net mag-cover-open-conf   <= hm2_7i80.0.7i84.0.0.input-06   # IN6  X052 MGCORS"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "236",
     "note": "net mag-cover-open-conf   => mazak-atc.mag-cover-open-conf"
    },
    {
     "file": "element_list_crosswalk_2026-07-27",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "CND2-11",
    "wire": "218",
    "cn_pin": "CN2-11",
    "provenance": "BBIA-1 pinout: COVER OPEN at CN2-11 (wire 218 also lands CN2-10=POWER OPEN)"
   },
   "authority_line": 28
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
   "status": "FACTORY_INTERFACE",
   "field_point": "Magazine cover close reed switch (PLC X053 MGCCRS)",
   "dest_connector": "CN2",
   "dest_pin": "12",
   "factory_wire": "219",
   "bbia_class": "plane",
   "designations": [],
   "primary_source": "element_list_crosswalk_2026-07-27",
   "cleanup_notes": "Interlock magazine rotation on cover closed | [RECON 2026-08-08 §A/§F: X053 MGCCRS + RS-19 line 219 (Dwg 4143075409) confirm on 060231] | [LOCATED 2026-08-08: RS-19 wire 219 MGCCRS X53, Dwg 4143075409 pg135] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/atc_ladder_transcription.md]",
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
     "line": 237,
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
     "lines": "29",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "111",
     "note": "net mag-cover-closed-conf <= hm2_7i80.0.7i84.0.0.input-07   # IN7  X053 MGCCRS"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "237",
     "note": "net mag-cover-closed-conf => mazak-atc.mag-cover-closed-conf"
    },
    {
     "file": "element_list_crosswalk_2026-07-27",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "CN2-12",
    "wire": "219",
    "cn_pin": "CN2-12",
    "provenance": "RESOLVED 2026-08-10: wire 219 confirmed by two independent sources - Dwg 4143075409 pg135 (RS-19 MGCCRS at T.U CN2-12) and BBIA-1 board pinout CSV (CN2-12 = wire219; board labels the pin MAGAZINE FWD/REV SW - label mismatch, wire# match trusted)"
   },
   "authority_line": 29
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
   "status": "FACTORY_INTERFACE",
   "field_point": "Motor thermal trip + main transformer overheat in series (PLC X073 THR.M + X07B ONT.M)",
   "dest_connector": "CN5",
   "dest_pin": "1",
   "factory_wire": "144",
   "bbia_class": "plane",
   "designations": [],
   "primary_source": "element_list_crosswalk_2026-07-27 + open_issues.md §3 (2026-08-03)",
   "cleanup_notes": "Series-wired NC X073 THR.M + X07B ONT.M; alarm-only, not in E-stop chain; field continuity and polarity remain unverified. | [RECON 2026-08-08 §A: element list confirms X073 THR.M + X07B ONT.M — two NC signals, series on 060231] | [LOCATED 2026-08-08: X73 THR.M (T.U CN5-1, TB1; motor thermal + circuit protector trip) series-NC X7B ONT.M (T.U CN5-3, OHT; main transformer overheat), Dwg 4143075407 pg133] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/estop_ladder_transcription.md]",
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
     "line": 39,
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
     "lines": "30",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "39",
     "note": "net thermal-alarm      <= hm2_7i80.0.7i84.0.0.input-08   # IN8  X073 THR.M + X07B ONT.M series NC"
    },
    {
     "file": "element_list_crosswalk_2026-07-27 + open_issues.md §3 (2026-08-03)",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "CN5-1",
    "wire": "144",
    "cn_pin": "CN5-1",
    "provenance": "RESOLVED 2026-08-10: Dwg 4143075407 pg133 confirms series chain T.U CN5-1 (wire144 THR.M/TRP.M external trip protector) + T.U CN5-3 (wire146/OHT.A main transformer overheat) - matches the pre-existing authority LOCATED note on both pins. BBIA-1 board pinout CN5-1='EXTERNAL TRIP PROTECTOR' wire144 confirms; CN5-3='OVER RUN EMG STOP' wire146 (board label differs from OHT mnemonic, wire# match trusted). Land IN8 from CN5-1 in series with CN5-3"
   },
   "authority_line": 30
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
   "status": "FACTORY_INTERFACE",
   "field_point": "Manual tool unclamp FOOT switch (PLC X01A TUCFS.M)",
   "dest_connector": "CN2",
   "dest_pin": "3",
   "factory_wire": "149",
   "bbia_class": "plane",
   "designations": [],
   "primary_source": "element_list_crosswalk_2026-07-27",
   "cleanup_notes": "Commissioning aid; pairs with MANUAL_TOOL_CLAMP_PB on IN30 (TCFS X01B reinstated 2026-08-03 after single-7i84U plan freed pins). | [RECON 2026-08-08 §A: element list confirms X01A TUCFS.M 'MNL TOOL UNCLAMP FS (VQC20)' on 060231] | [RECON 2026-08-08: FOOT switch confirmed (owner + mnemonic TUCFS=Tool UnClamp Foot Switch); BBIA1 wire 149 'TOOL UNCLAMP (FOOT SW)' 7-23] | [LOCATED 2026-08-08: X1A TUCF.M foot switch, wire 149A, T.U CN2-3, Dwg 4143075407 pg133] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/atc_ladder_transcription.md]",
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
     "line": 226,
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
     "lines": "31",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "112",
     "note": "net manual-unclamp-pb     <= hm2_7i80.0.7i84.0.0.input-09   # IN9  X01A TUCFS.M"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "226",
     "note": "net manual-unclamp-pb   => mazak-atc.manual-unclamp-pb"
    },
    {
     "file": "element_list_crosswalk_2026-07-27",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "CND2-3",
    "wire": "149",
    "cn_pin": "CN2-3",
    "provenance": "verified wire# -> BBIA-1 pinout (CNDx pin = CNx pin)"
   },
   "authority_line": 31
  },
  {
   "id": "SERVO_FAULT",
   "name": "Servo Fault",
   "board": "7i84U-A",
   "connector": "TB3",
   "channel": "IN10",
   "hal_net": "servo-fault",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Drive safety",
   "machine_subsystem": "Drive safety",
   "status": "FACTORY_INTERFACE",
   "field_point": "Combined servo alarm (SER) shared by X/Y/Z at CN6-27",
   "dest_connector": "CN6",
   "dest_pin": "27",
   "factory_wire": "SER",
   "bbia_class": "plane",
   "designations": [],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Owner decision 2026-08-11 (AG): OEM SER is ONE combined servo-error contact for all axes (only one SER line on the 50-pin CN6) not per-axis; IN10 fans out to all three joint amp-faults; IN11/IN12 freed to spare. Bench-verify HD81/HD101 ALM polarity before enabling | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/estop_ladder_transcription.md]",
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
    "hm2_7i80.0.7i84.0.0.input-10"
   ],
   "producers": [],
   "consumers": [
    "resolver-fault-x.in0",
    "resolver-fault-y.in0",
    "resolver-fault-z.in0"
   ],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 59,
     "text": "net servo-fault        <= hm2_7i80.0.7i84.0.0.input-10   # IN10 CN6-27 SER combined servo ALM (all axes)",
     "commented": false,
     "producers": [
      "hm2_7i80.0.7i84.0.0.input-10"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 60,
     "text": "net servo-fault        => resolver-fault-x.in0",
     "commented": false,
     "producers": [],
     "consumers": [
      "resolver-fault-x.in0"
     ],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 61,
     "text": "net servo-fault        => resolver-fault-y.in0",
     "commented": false,
     "producers": [],
     "consumers": [
      "resolver-fault-y.in0"
     ],
     "bidir": []
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 62,
     "text": "net servo-fault        => resolver-fault-z.in0",
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
     "lines": "32",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "59",
     "note": "net servo-fault        <= hm2_7i80.0.7i84.0.0.input-10   # IN10 CN6-27 SER combined servo ALM (all axes)"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "60",
     "note": "net servo-fault        => resolver-fault-x.in0"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "61",
     "note": "net servo-fault        => resolver-fault-y.in0"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "62",
     "note": "net servo-fault        => resolver-fault-z.in0"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "CN6-27",
    "wire": "SER",
    "cn_pin": "CN6-27",
    "provenance": "RESOLVED 2026-08-11 (owner decision AG): CN6-27 = wire mnemonic SER, function SERVO ERROR - the SINGLE combined servo-alarm contact for all three axes (only one SER entry on the 50-pin CN6; docs/servo_amp_analysis.md 3.3 confirms SERVO ALARM lands at the terminal unit's CN6). Consolidated to one 7i84U-A input (IN10) that fans out to all three joint amp-faults; the former per-axis X/Y/Z_DRIVE_FAULT (IN10/11/12) design is retired and IN11/IN12 are freed to spare"
   },
   "authority_line": 32
  },
  {
   "id": "SEVENI84UA_IN11_SPARE",
   "name": "Seveni84Ua In11 Spare",
   "board": "7i84U-A",
   "connector": "TB3",
   "channel": "IN11",
   "hal_net": "",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Spare",
   "machine_subsystem": "Spare",
   "status": "SPARE",
   "field_point": "Spare — freed 2026-08-11 when servo ALM consolidated to the single combined SER line on IN10 (owner decision AG)",
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "spare",
   "designations": [],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Was Y_DRIVE_FAULT; no separate per-axis servo alarm exists (single CN6-27 SER). Available for reuse",
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
   "bb_source": null,
   "authority_line": 33
  },
  {
   "id": "SEVENI84UA_IN12_SPARE",
   "name": "Seveni84Ua In12 Spare",
   "board": "7i84U-A",
   "connector": "TB3",
   "channel": "IN12",
   "hal_net": "",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "Spare",
   "machine_subsystem": "Spare",
   "status": "SPARE",
   "field_point": "Spare — freed 2026-08-11 when servo ALM consolidated to the single combined SER line on IN10 (owner decision AG)",
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "spare",
   "designations": [],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Was Z_DRIVE_FAULT; no separate per-axis servo alarm exists (single CN6-27 SER). Available for reuse",
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
   "bb_source": null,
   "authority_line": 34
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
   "status": "DEFERRED",
   "field_point": "No factory FR-SX at-speed terminal — derive in LinuxCNC HAL",
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "exception",
   "designations": [],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Confirm VFD terminal and polarity | [RECON 2026-08-08: spindle-drive sheet Dwg 4143075403 shows only zero-speed/controller-normal/orient-arrival; NO discrete at-speed output. Derive at-speed in HAL (commanded-vs-actual threshold). Do NOT wire.] | [RECON 2026-08-08 follow-up: status COMMISSIONING_PENDING -> DEFERRED; no field wire, derived in HAL] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/spindle_run_ladder_transcription.md]",
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
     "line": 69,
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
     "line": 70,
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
     "lines": "35",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "69",
     "note": "net spindle-at-speed   <= hm2_7i80.0.7i84.0.0.input-13   # IN13 FR-SX SPD-REACH"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "70",
     "note": "net spindle-at-speed   => spindle.0.at-speed"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": null,
   "authority_line": 35
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
   "status": "FACTORY_INTERFACE",
   "field_point": "FR-SX fault output",
   "dest_connector": "CN4",
   "dest_pin": "3",
   "factory_wire": "FA",
   "bbia_class": "plane",
   "designations": [],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Confirm VFD terminal and polarity | [RECON 2026-08-08 §D: FR-SX FA(t11)/FC(t12) 'controller normal' -> CN4-3/CN4-4 (digits verify)] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/spindle_run_ladder_transcription.md]",
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
     "line": 318,
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
     "line": 71,
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
     "line": 72,
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
     "line": 163,
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
     "line": 270,
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
   "epson_ferrules": [
    {
     "label_text": "A-TB3-15",
     "wire": "FA",
     "old_location": "CN4-3",
     "signal": "SPINDLE REV ROLLER THERMAL",
     "mesa_card": "7i84U-A",
     "connector": "TB3",
     "logical_channel": "IN14",
     "physical_pin": "TB3-15",
     "crosswalk_status": "PLANNED_MATCH",
     "release_status": "HOLD_SOURCE_TRACE",
     "source_line": 17
    }
   ],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "36",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/mazak_vqc_20_40.hal",
     "lines": "318",
     "note": "net spindle-fault        => logic.spindle-fault-not.in-00"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "71",
     "note": "net spindle-fault      <= hm2_7i80.0.7i84.0.0.input-14   # IN14 FR-SX ALM"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "72",
     "note": "net spindle-fault      => spindle.0.amp-fault-in"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "163",
     "note": "net spindle-fault       => mazak-orient.drive-fault"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "270",
     "note": "net spindle-fault       => atc-safety-abort-or.in1"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    },
    {
     "file": "wiring/labels/bbia1_mesa_end_ferrules_epson.csv",
     "lines": "17",
     "note": "Epson Mesa-end ferrule A-TB3-15; HOLD_SOURCE_TRACE"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "CN4-3",
    "wire": "FA",
    "cn_pin": "CN4-3",
    "provenance": "RESOLVED 2026-08-10: Dwg 4143075408 pg134 T.U CN4-3/CN4-4 = wire mnemonics FA/FC 'SPINDLE CONTROLLER NORMAL', matching the authority note's FR-SX FA(t11)/FC(t12); BBIA-1 board pinout CN4-3='FA' labels it SPINDLE REV ROLLER THERMAL (label differs, mnemonic matches - trusted). Land IN14 from CN4-3; CN4-4 is the common return"
   },
   "authority_line": 36
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
   "status": "FACTORY_INTERFACE",
   "field_point": "PRS-9 tool clamp confirm",
   "dest_connector": "CN1",
   "dest_pin": "2",
   "factory_wire": "209",
   "bbia_class": "plane",
   "designations": [
    "PRS-9"
   ],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Update field_7i84u.hal because it currently uses input-00 | [RECON 2026-08-08 §F: PRS-9 line 209 TCPRS confirmed by Dwg 4143075409 (Motion Switch Input 3)] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/atc_ladder_transcription.md]",
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
     "line": 73,
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
     "line": 224,
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
     "lines": "37",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "73",
     "note": "net tool-clamped       <= hm2_7i80.0.7i84.0.0.input-15   # IN15 PRS-9 tool-clamp confirm"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "224",
     "note": "net tool-clamped        => mazak-atc.tool-clamped"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "CN8-2",
    "wire": "209",
    "cn_pin": "CN1-2",
    "provenance": "verified wire# -> BBIA-1 pinout (CNDx pin = CNx pin)"
   },
   "authority_line": 37
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
   "status": "FACTORY_INTERFACE",
   "field_point": "PRS-8 tool unclamp confirm",
   "dest_connector": "CN1",
   "dest_pin": "1",
   "factory_wire": "208",
   "bbia_class": "plane",
   "designations": [
    "PRS-8"
   ],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Update field_7i84u.hal because it currently uses input-01 | [RECON 2026-08-08 §F: PRS-8 line 208 TUCPRS confirmed by Dwg 4143075409 (Motion Switch Input 3)] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/atc_ladder_transcription.md]",
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
     "line": 76,
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
     "line": 225,
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
     "lines": "38",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "76",
     "note": "net tool-unclamped     <= hm2_7i80.0.7i84.0.0.input-16   # IN16 PRS-8 tool-unclamp confirm"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "225",
     "note": "net tool-unclamped      => mazak-atc.tool-unclamped"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "CN8-1",
    "wire": "208",
    "cn_pin": "CN1-1",
    "provenance": "verified wire# -> BBIA-1 pinout (CNDx pin = CNx pin)"
   },
   "authority_line": 38
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
   "status": "FACTORY_INTERFACE",
   "field_point": "PRS-10 gear high confirm",
   "dest_connector": "CN1",
   "dest_pin": "3",
   "factory_wire": "210",
   "bbia_class": "plane",
   "designations": [
    "PRS-10"
   ],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Add HAL net when confirmed | [RECON 2026-08-08 §F: PRS-10 line 210 HGPRS = HIGH gear confirmed by Dwg 4143075409 (Motion Switch Input 3)] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/orient_ladder_transcription.md]",
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
     "line": 170,
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
     "lines": "39",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "113",
     "note": "net gear-hi-conf          <= hm2_7i80.0.7i84.0.0.input-17   # IN17 PRS-10 HGPRS"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "170",
     "note": "net gear-hi-conf        => mazak-orient.gear-hi-conf"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "CN8-3",
    "wire": "210",
    "cn_pin": "CN1-3",
    "provenance": "verified wire# -> BBIA-1 pinout (CNDx pin = CNx pin)"
   },
   "authority_line": 39
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
   "status": "FACTORY_INTERFACE",
   "field_point": "PRS-12 gear low confirm",
   "dest_connector": "CN1",
   "dest_pin": "4",
   "factory_wire": "212",
   "bbia_class": "plane",
   "designations": [
    "PRS-12",
    "PRS-2",
    "TB-51",
    "PRS-10"
   ],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Add HAL net when confirmed | [RECON 2026-08-08 §F: PRS-12 line 212 LGPRS = LOW gear confirmed by Dwg 4143075409 (Motion Switch Input 3)] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/orient_ladder_transcription.md]",
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
     "line": 171,
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
     "lines": "40",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "114",
     "note": "net gear-lo-conf          <= hm2_7i80.0.7i84.0.0.input-18   # IN18 PRS-12 LGPRS"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "171",
     "note": "net gear-lo-conf        => mazak-orient.gear-lo-conf"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "CN8-4",
    "wire": "212",
    "cn_pin": "CN1-4",
    "provenance": "verified wire# -> BBIA-1 pinout (CNDx pin = CNx pin)"
   },
   "authority_line": 40
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
   "status": "FACTORY_INTERFACE",
   "field_point": "PRS-21 magazine BCD bit 0",
   "dest_connector": "CN2",
   "dest_pin": "4",
   "factory_wire": "150",
   "bbia_class": "plane",
   "designations": [
    "PRS-21"
   ],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Decode with bcd2s or custom mux | [RECON 2026-08-08 §F: PRS-21 line 221 confirmed by Dwg 4143075409 (Motion Switch Input 3)] | [PINOUT-RECONCILED 2026-08-09: BBIA-1 board = MAGAZINE ROT POS 1, wire 150, CN2-4/CND2-4 (trusted over pg135 'wire 221' - that wire is BIT1 on the board).] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/atc_ladder_transcription.md]",
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
     "line": 207,
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
     "label_text": "A-TB2-04",
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
     "lines": "41",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "115",
     "note": "net mag-bcd-bit0          <= hm2_7i80.0.7i84.0.0.input-19   # IN19 X008 T11P  (1)"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "207",
     "note": "net mag-bcd-bit0   => mazak-atc.mag-bcd-bit0"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    },
    {
     "file": "wiring/labels/bbia1_mesa_end_ferrules_epson.csv",
     "lines": "3",
     "note": "Epson Mesa-end ferrule A-TB2-04; HOLD_SOURCE_TRACE"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "CND2-4",
    "wire": "150",
    "cn_pin": "CN2-4",
    "provenance": "BBIA-1 board pinout (trusted over pg135)"
   },
   "authority_line": 41
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
   "status": "FACTORY_INTERFACE",
   "field_point": "PRS-22 magazine BCD bit 1",
   "dest_connector": "CN2",
   "dest_pin": "5",
   "factory_wire": "221",
   "bbia_class": "plane",
   "designations": [
    "PRS-22"
   ],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Decode with bcd2s or custom mux | [RECON 2026-08-08 §F: PRS-22 line 222 confirmed by Dwg 4143075409 (Motion Switch Input 3)] | [PINOUT-RECONCILED 2026-08-09: BBIA-1 board = MAGAZINE ROT POS 2, wire 221, CN2-5/CND2-5 (trusted over pg135 'wire 222').] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/atc_ladder_transcription.md]",
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
     "line": 208,
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
     "label_text": "A-TB2-05",
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
     "lines": "42",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "116",
     "note": "net mag-bcd-bit1          <= hm2_7i80.0.7i84.0.0.input-20   # IN20 X009 T12P  (2)"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "208",
     "note": "net mag-bcd-bit1   => mazak-atc.mag-bcd-bit1"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    },
    {
     "file": "wiring/labels/bbia1_mesa_end_ferrules_epson.csv",
     "lines": "4",
     "note": "Epson Mesa-end ferrule A-TB2-05; HOLD_SOURCE_TRACE"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "CND2-5",
    "wire": "221",
    "cn_pin": "CN2-5",
    "provenance": "BBIA-1 board pinout (trusted over pg135)"
   },
   "authority_line": 42
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
   "status": "FACTORY_INTERFACE",
   "field_point": "PRS-23 magazine BCD bit 2",
   "dest_connector": "CN2",
   "dest_pin": "6",
   "factory_wire": "222",
   "bbia_class": "plane",
   "designations": [
    "PRS-23"
   ],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Decode with bcd2s or custom mux | [RECON 2026-08-08 §F: PRS-23 line 223 confirmed by Dwg 4143075409 (Motion Switch Input 3)] | [PINOUT-RECONCILED 2026-08-09: BBIA-1 board = MAGAZINE ROT POS 4, wire 222, CN2-6/CND2-6 (trusted over pg135 'wire 223').] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/atc_ladder_transcription.md]",
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
     "line": 209,
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
     "label_text": "A-TB2-06",
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
     "lines": "43",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "117",
     "note": "net mag-bcd-bit2          <= hm2_7i80.0.7i84.0.0.input-21   # IN21 X00A T14P  (4)"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "209",
     "note": "net mag-bcd-bit2   => mazak-atc.mag-bcd-bit2"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    },
    {
     "file": "wiring/labels/bbia1_mesa_end_ferrules_epson.csv",
     "lines": "5",
     "note": "Epson Mesa-end ferrule A-TB2-06; HOLD_SOURCE_TRACE"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "CND2-6",
    "wire": "222",
    "cn_pin": "CN2-6",
    "provenance": "BBIA-1 board pinout (trusted over pg135)"
   },
   "authority_line": 43
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
   "status": "FACTORY_INTERFACE",
   "field_point": "PRS-24 magazine BCD bit 3",
   "dest_connector": "CN2",
   "dest_pin": "7",
   "factory_wire": "223",
   "bbia_class": "plane",
   "designations": [
    "PRS-24"
   ],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Decode with bcd2s or custom mux | [RECON 2026-08-08 §F: PRS-24 line 224 confirmed by Dwg 4143075409 (Motion Switch Input 3)] | [PINOUT-RECONCILED 2026-08-09: BBIA-1 board = MAGAZINE ROT POS 8, wire 223, CN2-7/CND2-7 (trusted over pg135 'wire 224').] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/atc_ladder_transcription.md]",
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
     "line": 210,
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
     "label_text": "A-TB2-07",
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
     "lines": "44",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "118",
     "note": "net mag-bcd-bit3          <= hm2_7i80.0.7i84.0.0.input-22   # IN22 X00B T18P  (8)"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "210",
     "note": "net mag-bcd-bit3   => mazak-atc.mag-bcd-bit3"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    },
    {
     "file": "wiring/labels/bbia1_mesa_end_ferrules_epson.csv",
     "lines": "6",
     "note": "Epson Mesa-end ferrule A-TB2-07; HOLD_SOURCE_TRACE"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "CND2-7",
    "wire": "223",
    "cn_pin": "CN2-7",
    "provenance": "BBIA-1 board pinout (trusted over pg135)"
   },
   "authority_line": 44
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
   "status": "FACTORY_INTERFACE",
   "field_point": "PRS-25 magazine BCD bit 4",
   "dest_connector": "CN2",
   "dest_pin": "8",
   "factory_wire": "224",
   "bbia_class": "plane",
   "designations": [
    "PRS-25"
   ],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Decode with bcd2s or custom mux | [RECON 2026-08-08 §F: PRS-25 line 225 confirmed by Dwg 4143075409 (Motion Switch Input 3)] | [PINOUT-RECONCILED 2026-08-09: BBIA-1 board = MAGAZINE ROT POS 10, wire 224, CN2-8/CND2-8 (trusted over pg135 'wire 225'). NB: the field PRS-nn labels are pg135 PLC-side identities and may not match the board bit order - physical wire label is final.] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/atc_ladder_transcription.md]",
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
     "line": 211,
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
     "label_text": "A-TB2-08",
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
     "lines": "45",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "119",
     "note": "net mag-bcd-bit4          <= hm2_7i80.0.7i84.0.0.input-23   # IN23 X00C T21P (10)"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "211",
     "note": "net mag-bcd-bit4   => mazak-atc.mag-bcd-bit4"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    },
    {
     "file": "wiring/labels/bbia1_mesa_end_ferrules_epson.csv",
     "lines": "7",
     "note": "Epson Mesa-end ferrule A-TB2-08; HOLD_SOURCE_TRACE"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "CND2-8",
    "wire": "224",
    "cn_pin": "CN2-8",
    "provenance": "BBIA-1 board pinout (trusted over pg135)"
   },
   "authority_line": 45
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
   "status": "FACTORY_INTERFACE",
   "field_point": "Door interlock switches series (LS-141 + LS-140 + PLC X01D ITMDSS.M all in one chain)",
   "dest_connector": "CN2",
   "dest_pin": "38",
   "factory_wire": "238",
   "bbia_class": "plane",
   "designations": [
    "LS-141",
    "LS-140",
    "DS-1",
    "DS-2"
   ],
   "primary_source": "archived_wiring_map + open_issues.md §3 (2026-08-03)",
   "cleanup_notes": "Series-wired 2026-08-03: X01D ITMDSS consolidated with LS-140/141 pair. Choose door-open versus door-closed net after normal state is measured. | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/estop_ladder_transcription.md]",
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
     "line": 80,
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
     "lines": "46",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "80",
     "note": "net door-interlock     <= hm2_7i80.0.7i84.0.0.input-24   # IN24 LS-140+LS-141+X01D ITMDSS series NC"
    },
    {
     "file": "archived_wiring_map + open_issues.md §3 (2026-08-03)",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "CN2-38",
    "wire": "238",
    "cn_pin": "CN2-38",
    "provenance": "RESOLVED 2026-08-10 (primary): BBIA-1 board pinout CN2-38 = wire238 MACHINE DOOR INTERLOCK (mirrored at CN6-23, same wire# - internally consistent). ALT candidate: Dwg 4143075407 pg133 T.U CN3-3 wire142 MDINT.M (ladder-side finding, different wire#, not reconciled with the board pinout). Door-interlock chain is series-wired with LS-140/141 per open_issues.md so more than one physical contact may legitimately exist"
   },
   "authority_line": 46
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
   "status": "FACTORY_INTERFACE",
   "field_point": "PS-5 head-lube pressure switch wire 355 (PLC X079 HLP.M)",
   "dest_connector": "CN6",
   "dest_pin": "39",
   "factory_wire": "355",
   "bbia_class": "plane",
   "designations": [
    "PS-5"
   ],
   "primary_source": "Dwg 4143075338 pg100 + Dwg 4143075407 pg133 + owner machine confirmation 2026-08-09",
   "cleanup_notes": "One physical head-lube pressure switch only: PS-5 wire 355 = X079 HLP.M. Owner confirmed on the machine 2026-08-09. X042 HLP2.M exists in the generic element list but has no second physical switch on SN 060231 and is not part of LUBE_OK. Land IN25 from PS-5 alone. Verify normal-state polarity and fail-open behavior before commissioning. | [2026-08-13 PHYSICALLY CONFIRMED: photo shows the device's stamped 'PS 5' tag with wire 355 and G24 return attached - device tag, wire number and CN6-39 now agree across machine, BBIA-1 pinout and this row. G24 is the OEM 24V common, so this input MUST cross the interposing-relay boundary. Contact form and trip pressure still unverified. Status promotion recommended pending owner approval. See wiring/head_valve_hardware.md]",
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
     "line": 81,
     "text": "net lube-ok            <= hm2_7i80.0.7i84.0.0.input-25   # IN25 PS-5 wire 355 / X079 HLP.M; sole head-lube pressure switch",
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
     "lines": "47",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "81",
     "note": "net lube-ok            <= hm2_7i80.0.7i84.0.0.input-25   # IN25 PS-5 wire 355 / X079 HLP.M; sole head-lube pressure switch"
    },
    {
     "file": "Dwg 4143075338 pg100 + Dwg 4143075407 pg133 + owner machine confirmation 2026-08-09",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "CND3-39",
    "wire": "355",
    "cn_pin": "CN6-39",
    "provenance": "verified wire# -> BBIA-1 pinout (CNDx pin = CNx pin)"
   },
   "authority_line": 47
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
   "status": "FACTORY_INTERFACE",
   "field_point": "Coolant level switch",
   "dest_connector": "CN1",
   "dest_pin": "5",
   "factory_wire": "232",
   "bbia_class": "plane",
   "designations": [],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Net name follows HAL (polarity assumption: low = warning). Verify normal-state polarity in cabinet before promoting. | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/coolant_ladder_transcription.md]",
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
     "line": 82,
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
     "lines": "48",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "82",
     "note": "net coolant-low        <= hm2_7i80.0.7i84.0.0.input-26   # IN26 coolant level (polarity TBD)"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "CN1-5",
    "wire": "232",
    "cn_pin": "CN1-5",
    "provenance": "CANDIDATE 2026-08-10: BBIA-1 board pinout CN1-5 = wire232 '2nd-S LEVEL' (function: coolant lvl) - plausible match for coolant level switch; not cross-checked against a ladder-side wire# this session, verify polarity/normal-state before commissioning"
   },
   "authority_line": 48
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
   "status": "FACTORY_INTERFACE",
   "field_point": "Sanwa SPS-8T-PC-20 pressure switch",
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "exception",
   "designations": [],
   "primary_source": "phase2_plan",
   "cleanup_notes": "This supersedes stale signal_map.csv TB5 IN16 row | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/estop_ladder_transcription.md]",
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
     "line": 200,
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
     "lines": "49",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "120",
     "note": "net hydraulic-ok          <= hm2_7i80.0.7i84.0.0.input-27   # IN27 pressure switch"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "200",
     "note": "net hydraulic-ok        => mazak-atc.hydraulic-ok"
    },
    {
     "file": "phase2_plan",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "",
    "wire": "",
    "cn_pin": "",
    "provenance": "NOT LOCATED 2026-08-10 (checked further): searched every mined ladder doc (docs/ladder/*.md) and the element crosswalk for a hydraulic pressure switch / PS- designator - the only pressure switch found anywhere is PS-5 (head-lube, already used for LUBE_OK). No hydraulic-pressure PLC input (X-address) surfaced. Possible this is a NEW sensor the retrofit is adding rather than a factory-existing signal - needs field trace or owner confirmation of whether Sanwa SPS-8T-PC-20 is already installed"
   },
   "authority_line": 49
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
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "exception",
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
     "lines": "50",
     "note": "Current wiring authority row"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": null,
   "authority_line": 50
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
   "status": "FACTORY_INTERFACE",
   "field_point": "Magazine index in-position prox (PLC X00D MIPRS); BCD pot number valid only while TRUE",
   "dest_connector": "CN2",
   "dest_pin": "9",
   "factory_wire": "225",
   "bbia_class": "plane",
   "designations": [],
   "primary_source": "atc_ladder_transcription_2026-07-27",
   "cleanup_notes": "Mandatory for magazine indexing (rungs 3401/33xx). Writer added in field_7i84u.hal:79 (net mag-in-pos <= input-28) on 2026-08-06. Verify prox type/polarity before commissioning. | [RECON 2026-08-08 CONFIRMED: MAG_IN_POS = PRS-13 MIPRS 'MAGAZINE INPOSITION' wire 213 X0D, Dwg 4143075409 pg135. In-position strobe; tool-# bits are PRS-21..25 (711P/712P/714P/718P/721P). Supersedes prior 'PRS-13=tool bit'.] | [PINOUT-RECONCILED 2026-08-09: BBIA-1 board = MAGAZINE POSITION OK, wire 225, CN2-9/CND2-9 (trusted). pg135 read the in-position prox as PRS-13/wire 213, but wire 213 is absent from the BBIA-1 pinout; POSITION OK is 225/CN2-9. PLC-side prox remains PRS-13/X00D.] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/atc_ladder_transcription.md]",
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
     "line": 94,
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
     "line": 206,
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
     "label_text": "A-TB2-13",
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
     "lines": "51",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "94",
     "note": "net mag-in-pos         <= hm2_7i80.0.7i84.0.0.input-28   # IN28 MIPRS mag-in-pos prox (PLC X00D)"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "206",
     "note": "net mag-in-pos     => mazak-atc.mag-in-pos"
    },
    {
     "file": "atc_ladder_transcription_2026-07-27",
     "lines": "",
     "note": "primary_source column in the authority table"
    },
    {
     "file": "wiring/labels/bbia1_mesa_end_ferrules_epson.csv",
     "lines": "8",
     "note": "Epson Mesa-end ferrule A-TB2-13; HOLD_SOURCE_TRACE"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "CND2-9",
    "wire": "225",
    "cn_pin": "CN2-9",
    "provenance": "BBIA-1 board pinout (trusted over pg135)"
   },
   "authority_line": 51
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
   "status": "DEFERRED",
   "field_point": "OEM MAR relay aux contact via interposing relay (Omron G2R-1-SND-DC24 or Phoenix PLC-RSC-24DC/21) driven from EHB bus",
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "exception",
   "designations": [
    "RS-C"
   ],
   "primary_source": "front_control_panel_wiring.md §6.5 + open_issues.md §3 (2026-08-03)",
   "cleanup_notes": "OEM MAR relay aux contact via interposing relay (Omron G2R-1-SND-DC24 or Phoenix PLC-RSC-24DC/21) driven from EHB bus. OEM/new-side boundary: dry contact only, no OEM P24 into 7i84U common. This is the sole software E-stop monitor; OEM hardware chain remains authoritative. | [LOCATED 2026-08-08: EMERGENCY STOP X00 *ESP via EMS/MAR relay, Dwg 4143075407 pg133. Mesa IN29 = status monitor only; keep hardwired, do NOT wire as normal input] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/estop_ladder_transcription.md] | [OWNER DECISION 2026-08-15 (AG): the machine's AC/DC power circuits and the entire E-stop system stay 100% original OEM -- no commissioning, tracing, or verification of any power circuit in this conversion. The interposing monitor relay (coil tap from the OEM EHB bus) is therefore NOT being installed; this row is DEFERRED, not wired. The HAL net stays in place so the control logic remains testable; with the input unwired, estop-monitor reads FALSE and the software chain stays tripped, which fails safe.]",
   "location": "Unknown — trace in cabinet",
   "location_note": "",
   "expected": {
    "value": "0",
    "label": "Logic 0 — DEFERRED, input unwired (owner decision 2026-08-15); software chain stays tripped, fails safe",
    "basis": "field_7i84u.hal: estop-monitor raw IN29 feeds estop-latch.ok-in; no interposing relay is installed",
    "kind": "deferred"
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
     "line": 252,
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
     "line": 95,
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
     "lines": "52",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/mazak_vqc_20_40.hal",
     "lines": "252",
     "note": "net estop-monitor     => estop-latch.0.ok-in"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "95",
     "note": "net estop-monitor      <= hm2_7i80.0.7i84.0.0.input-29   # IN29 OEM MAR aux via interposing relay"
    },
    {
     "file": "front_control_panel_wiring.md §6.5 + open_issues.md §3 (2026-08-03)",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": null,
   "authority_line": 52
  },
  {
   "id": "MANUAL_TOOL_CLAMP_PB",
   "name": "Manual Tool Clamp Pb",
   "board": "7i84U-A",
   "connector": "TB2",
   "channel": "IN30",
   "hal_net": "",
   "direction": "IN",
   "direction_label": "Input (digital)",
   "subsystem": "ATC tool",
   "machine_subsystem": "ATC tool",
   "status": "RESERVED",
   "field_point": "Manual tool clamp FOOT switch (PLC X01B TCFS.M)",
   "dest_connector": "CN2",
   "dest_pin": "44",
   "factory_wire": "149B",
   "bbia_class": "plane",
   "designations": [],
   "primary_source": "element_list_crosswalk_2026-07-27 + open_issues.md §3 (2026-08-03)",
   "cleanup_notes": "Reserved terminal; intentionally HAL-unbound until the switch and safe manual-clamp behavior are field verified. Pairs with MANUAL_TOOL_UNCLAMP_PB on IN9. | [LOCATED 2026-08-08: X1B TCCF.M foot switch, wire 149B, T.U CN2-44, Dwg 4143075407 pg133] | [2026-08-09: RESERVED, hal_net none (was manual-clamp-pb) - manual clamp deferred per io_capacity_reconciliation.md; restore net when switch behavior is field-verified] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/atc_ladder_transcription.md]",
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
   "epson_ferrules": [],
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
   "bb_source": {
    "cnd_pin": "CN2-44",
    "wire": "149B",
    "cn_pin": "CN2-44",
    "provenance": "RESOLVED 2026-08-10: confirmed by Dwg 4143075407 pg133 (T.U CN2-44, TCCFS.M, wire149B), matching the pre-existing authority CSV LOCATED note; cross-verified directly against BBIA-1 board pinout (CN2-44 = wire149B FOOT SWITCH)"
   },
   "authority_line": 53
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
   "status": "FACTORY_INTERFACE",
   "field_point": "Servo drives ready relay contact",
   "dest_connector": "CN6",
   "dest_pin": "7",
   "factory_wire": "SA",
   "bbia_class": "plane",
   "designations": [],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Wire before first motion if available | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/estop_ladder_transcription.md]",
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
     "line": 325,
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
     "line": 150,
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
     "label_text": "A-TB2-16",
     "wire": "SA",
     "old_location": "CN6-7",
     "signal": "SERVO READY",
     "mesa_card": "7i84U-A",
     "connector": "TB2",
     "logical_channel": "IN31",
     "physical_pin": "TB2-16",
     "crosswalk_status": "PLANNED_MATCH",
     "release_status": "HOLD_SOURCE_TRACE",
     "source_line": 21
    }
   ],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "54",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/mazak_vqc_20_40.hal",
     "lines": "325",
     "note": "net servo-ready            => logic.spindle-permit-and.in-05"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "121",
     "note": "net servo-ready           <= hm2_7i80.0.7i84.0.0.input-31   # IN31 SA.N"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "150",
     "note": "net servo-ready                           => mazak-orient.servo-ready"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    },
    {
     "file": "wiring/labels/bbia1_mesa_end_ferrules_epson.csv",
     "lines": "21",
     "note": "Epson Mesa-end ferrule A-TB2-16; HOLD_SOURCE_TRACE"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "CN6-7",
    "wire": "SA",
    "cn_pin": "CN6-7",
    "provenance": "RESOLVED 2026-08-10: BBIA-1 board pinout CN6-7 = wire mnemonic SA, function SERVO READY - exact label match"
   },
   "authority_line": 54
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
   "status": "FACTORY_INTERFACE",
   "field_point": "FR-SX forward input",
   "dest_connector": "CN4",
   "dest_pin": "9",
   "factory_wire": "SRN",
   "bbia_class": "plane",
   "designations": [],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Digital FWD signal to FR-SX | [RECON 2026-08-08 §D: FR-SX SRN] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/spindle_run_ladder_transcription.md]",
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
     "line": 120,
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
     "line": 121,
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
   "epson_ferrules": [
    {
     "label_text": "A-TB3-17",
     "wire": "SRN",
     "old_location": "CN4-9",
     "signal": "SPINDLE FORWARD",
     "mesa_card": "7i84U-A",
     "connector": "TB3",
     "logical_channel": "OUT0",
     "physical_pin": "TB3-17",
     "crosswalk_status": "PLANNED_MATCH",
     "release_status": "HOLD_SOURCE_TRACE",
     "source_line": 18
    }
   ],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "55",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "120",
     "note": "net spindle-fwd        <= and2.3.out"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "121",
     "note": "net spindle-fwd        => hm2_7i80.0.7i84.0.0.output-00  # OUT0  FR-SX FWD"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    },
    {
     "file": "wiring/labels/bbia1_mesa_end_ferrules_epson.csv",
     "lines": "18",
     "note": "Epson Mesa-end ferrule A-TB3-17; HOLD_SOURCE_TRACE"
    }
   ],
   "conflicts": [
    "C3"
   ],
   "bb_source": {
    "cnd_pin": "CN4-9",
    "wire": "SRN",
    "cn_pin": "CN4-9",
    "provenance": "CANDIDATE 2026-08-10: Dwg 4143075408 pg134 shows SPINDLE FORWARD landing at both T.U CN3-11 and CN4-9 (both wire mnemonic SRN - CN3/CN4 are parallel connectors into the same spindle-controller circuit per bbia1_terminal_unit.md). Chose CN4 (dedicated 20-pin spindle connector) for consistency with the SPINDLE_ZERO_SPEED precedent (CN4-1); CN3-11 is an equally valid alternate landing point"
   },
   "authority_line": 55
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
   "status": "FACTORY_INTERFACE",
   "field_point": "FR-SX reverse input",
   "dest_connector": "CN4",
   "dest_pin": "10",
   "factory_wire": "SRI",
   "bbia_class": "plane",
   "designations": [],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Digital REV signal to FR-SX | [RECON 2026-08-08 §D: FR-SX SRI] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/spindle_run_ladder_transcription.md]",
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
     "line": 125,
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
     "line": 126,
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
   "epson_ferrules": [
    {
     "label_text": "A-TB3-18",
     "wire": "SRI",
     "old_location": "CN4-10",
     "signal": "SPINDLE REVERSE",
     "mesa_card": "7i84U-A",
     "connector": "TB3",
     "logical_channel": "OUT1",
     "physical_pin": "TB3-18",
     "crosswalk_status": "PLANNED_MATCH",
     "release_status": "HOLD_SOURCE_TRACE",
     "source_line": 19
    }
   ],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "56",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "125",
     "note": "net spindle-rev        <= and2.4.out"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "126",
     "note": "net spindle-rev        => hm2_7i80.0.7i84.0.0.output-01  # OUT1  FR-SX REV"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    },
    {
     "file": "wiring/labels/bbia1_mesa_end_ferrules_epson.csv",
     "lines": "19",
     "note": "Epson Mesa-end ferrule A-TB3-18; HOLD_SOURCE_TRACE"
    }
   ],
   "conflicts": [
    "C3"
   ],
   "bb_source": {
    "cnd_pin": "CN4-10",
    "wire": "SRI",
    "cn_pin": "CN4-10",
    "provenance": "CANDIDATE 2026-08-10: Dwg 4143075408 pg134 shows SPINDLE REVERSE landing at both T.U CN3-12 and CN4-10 (both wire mnemonic SRI, parallel connectors). Chose CN4 for consistency with SPINDLE_ZERO_SPEED/SPINDLE_FWD; CN3-12 is an equally valid alternate"
   },
   "authority_line": 56
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
   "status": "FACTORY_INTERFACE",
   "field_point": "FR-SX enable input",
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "exception",
   "designations": [],
   "primary_source": "field_7i84u.hal",
   "cleanup_notes": "FWD, REV, RUN, ORCM1, and pwmgen.03.enable use spindle-motion-permit; the static hold initializes FALSE and watchdog, E-stop, machine-on, servo-ready, and spindle-fault states must also permit motion | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/spindle_run_ladder_transcription.md]",
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
     "line": 422,
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
     "line": 129,
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
     "line": 130,
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
     "line": 404,
     "text": "setp hm2_7i80.0.pwmgen.03.output-type 2",
     "commented": false,
     "target": "hm2_7i80.0.pwmgen.03.output-type",
     "value": "2"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 405,
     "text": "setp hm2_7i80.0.pwmgen.03.offset-mode 0",
     "commented": false,
     "target": "hm2_7i80.0.pwmgen.03.offset-mode",
     "value": "0"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 406,
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
     "lines": "57",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "422",
     "note": "net spindle-run-output => hm2_7i80.0.pwmgen.03.enable"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "129",
     "note": "net spindle-run-output <= and2.5.out"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "130",
     "note": "net spindle-run-output => hm2_7i80.0.7i84.0.0.output-02  # OUT2  FR-SX RUN/STOP"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "404",
     "note": "setp hm2_7i80.0.pwmgen.03.output-type 2"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "405",
     "note": "setp hm2_7i80.0.pwmgen.03.offset-mode 0"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "406",
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
   "bb_source": {
    "cnd_pin": "",
    "wire": "",
    "cn_pin": "",
    "provenance": "N/A 2026-08-10: no discrete OEM wire - spindle-motion-permit is a new HAL-internal logical gate combining FWD/REV/RUN/ORCM1/watchdog/E-stop/servo-ready/spindle-fault, not a 1:1 terminal-unit signal"
   },
   "authority_line": 57
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
   "status": "FACTORY_INTERFACE",
   "field_point": "Hydraulic + head-lube pump contactor (PLC Y096 HYD.M)",
   "dest_connector": "CN11",
   "dest_pin": "16",
   "factory_wire": "235",
   "bbia_class": "plane",
   "designations": [],
   "primary_source": "element_list_crosswalk_2026-07-27",
   "cleanup_notes": "Required before clamp/gear/ATC; interposing relay for contactor coil; prove HYD_PRESS_OK after start | [RECON 2026-08-08 §A: element list confirms Y096 HYD.M combined hydraulic + head-lube pump on 060231] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/estop_ladder_transcription.md]",
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
     "line": 152,
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
     "lines": "58",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "126",
     "note": "net hyd-pump-on           => hm2_7i80.0.7i84.0.0.output-03  # OUT3  Y096 HYD.M"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "152",
     "note": "net hyd-pump-on     <= mazak-orient.hyd-pump-on"
    },
    {
     "file": "element_list_crosswalk_2026-07-27",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "CN11-16",
    "wire": "235",
    "cn_pin": "SSR bd CN11-16",
    "provenance": "BBIA-1 terminal-unit CN11 pin16 (dwg 4113075022 sheet 85 / 41434WB p85) read 2026-08-10 - see wiring/bbia1_cn_pinouts.csv; NOT the SSR-board's own CN11 (see CN11-SSR)"
   },
   "authority_line": 58
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
   "status": "FACTORY_INTERFACE",
   "field_point": "FR-SX orient command (PLC Y093 ORCM1.M)",
   "dest_connector": "CN3",
   "dest_pin": "14",
   "factory_wire": "ORI C1",
   "bbia_class": "plane",
   "designations": [],
   "primary_source": "element_list_crosswalk_2026-07-27",
   "cleanup_notes": "Gated by spindle-motion-permit; validate ladder sequence exact drive terminal relay topology and polarity before landing the field wire | [RECON 2026-08-08 §A: element list confirms Y093 ORCM1.M 'SPINDLE ORIENT COMMAND' (.M not .MV) on 060231] | [RECON 2026-08-08 §D: FR-SX CTM] | [LOCATED 2026-08-08: ORC1 CON1-25 wire 4-12 T.U CN3-14, Dwg 4143075408 pg134] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/spindle_run_ladder_transcription.md]",
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
     "line": 179,
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
   "epson_ferrules": [
    {
     "label_text": "A-TB3-21",
     "wire": "ORI C1",
     "old_location": "CN3-14",
     "signal": "ORIENT COMMAND",
     "mesa_card": "7i84U-A",
     "connector": "TB3",
     "logical_channel": "OUT4",
     "physical_pin": "TB3-21",
     "crosswalk_status": "PLANNED_MATCH",
     "release_status": "HOLD_SOURCE_TRACE",
     "source_line": 14
    }
   ],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "59",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "127",
     "note": "net spindle-orient-cmd    => hm2_7i80.0.7i84.0.0.output-04  # OUT4  Y093 ORCM1.M"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "179",
     "note": "net spindle-orient-cmd     <= and2.7.out"
    },
    {
     "file": "element_list_crosswalk_2026-07-27",
     "lines": "",
     "note": "primary_source column in the authority table"
    },
    {
     "file": "wiring/labels/bbia1_mesa_end_ferrules_epson.csv",
     "lines": "14",
     "note": "Epson Mesa-end ferrule A-TB3-21; HOLD_SOURCE_TRACE"
    }
   ],
   "conflicts": [
    "C3"
   ],
   "bb_source": {
    "cnd_pin": "CN3-14",
    "wire": "ORI C1",
    "cn_pin": "CN3-14",
    "provenance": "RESOLVED (pre-existing, reconfirmed 2026-08-10): authority CSV LOCATED note + Dwg 4143075408 pg134 T.U CN3-14 wire4-12 agree; BBIA-1 board pinout CN3-14 = 'ORI C1' matches"
   },
   "authority_line": 59
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
   "status": "FACTORY_INTERFACE",
   "field_point": "Low-gear orient assist (PLC Y094 CTL.M)",
   "dest_connector": "CN3",
   "dest_pin": "15",
   "factory_wire": "CTL",
   "bbia_class": "plane",
   "designations": [],
   "primary_source": "element_list_crosswalk_2026-07-27",
   "cleanup_notes": "Verify in ladder whether required in high gear too | [RECON 2026-08-08 §A: element list confirms Y094 CTL.M 'LOW GEAR ORIENT' — low-gear-specific on 060231] | [RECON 2026-08-08 §D: FR-SX GTL] | [LOCATED 2026-08-08: CTL 'LOW GEAR ORIENT' CON1-27 wire 4-13 T.U CN3-15, Dwg 4143075408 pg134 - confirms low-gear orient assist] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/spindle_run_ladder_transcription.md]",
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
     "line": 180,
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
   "epson_ferrules": [
    {
     "label_text": "A-TB3-22",
     "wire": "CTL",
     "old_location": "CN3-15",
     "signal": "ORIENT LOOP CHECK",
     "mesa_card": "7i84U-A",
     "connector": "TB3",
     "logical_channel": "OUT5",
     "physical_pin": "TB3-22",
     "crosswalk_status": "PLANNED_MATCH",
     "release_status": "HOLD_SOURCE_TRACE",
     "source_line": 15
    }
   ],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "60",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "128",
     "note": "net orient-lo-gear        => hm2_7i80.0.7i84.0.0.output-05  # OUT5  Y094 CTL.M"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "180",
     "note": "net orient-lo-gear      <= mazak-orient.orient-lo-gear"
    },
    {
     "file": "element_list_crosswalk_2026-07-27",
     "lines": "",
     "note": "primary_source column in the authority table"
    },
    {
     "file": "wiring/labels/bbia1_mesa_end_ferrules_epson.csv",
     "lines": "15",
     "note": "Epson Mesa-end ferrule A-TB3-22; HOLD_SOURCE_TRACE"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "CN3-15",
    "wire": "CTL",
    "cn_pin": "CN3-15",
    "provenance": "RESOLVED (pre-existing, reconfirmed 2026-08-10): authority CSV LOCATED note + Dwg 4143075408 pg134 T.U CN3-15 wire4-13 agree; BBIA-1 board pinout CN3-15 = 'CTL' matches"
   },
   "authority_line": 60
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
   "status": "FACTORY_INTERFACE",
   "field_point": "N1J-L2-201 Z brake release",
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "exception",
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
     "line": 346,
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
     "line": 347,
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
     "line": 167,
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
     "line": 168,
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
     "line": 306,
     "text": "setp hm2_7i80.0.pwmgen.01.output-type 2    # Z axis  -> 7i49 AOUT1",
     "commented": false,
     "target": "hm2_7i80.0.pwmgen.01.output-type",
     "value": "2"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 307,
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
     "lines": "61",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "346",
     "note": "net z-brake-release => pid.z.enable"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "347",
     "note": "net z-brake-release => hm2_7i80.0.pwmgen.01.enable"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "167",
     "note": "net z-brake-release    <= z-brake-delay.out"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "168",
     "note": "net z-brake-release    => hm2_7i80.0.7i84.0.0.output-06  # OUT6  N1J-L2-201 Z brake release"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "306",
     "note": "setp hm2_7i80.0.pwmgen.01.output-type 2    # Z axis  -> 7i49 AOUT1"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "307",
     "note": "setp hm2_7i80.0.pwmgen.01.scale       [JOINT_2]OUTPUT_SCALE"
    },
    {
     "file": "field_7i84u.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "",
    "wire": "",
    "cn_pin": "",
    "provenance": "NOT LOCATED 2026-08-10 (checked further): N1J-L2-201 Z brake release (SOL-201) not identified among transcribed BBIA-1 CN1-CN6/CN11 pins. docs/estop_safety_chain.md describes the Z-brake drop-out as a CABINET-LEVEL hardwired interlock requirement (brake-drop-before-amp-drop, triggered by the same relay contact that requests the amp contactor to drop) rather than a documented existing OEM signal - this looks like a NEW retrofit-designed circuit, not something to trace on the original BBIA-1 pass-through. Needs cabinet-level design/field verification, not a paper trace"
   },
   "authority_line": 61
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
   "status": "FACTORY_INTERFACE",
   "field_point": "RLY-1 to SOL-12 Fujikoshi hydraulic valve",
   "dest_connector": "CN11",
   "dest_pin": "4",
   "factory_wire": "712",
   "bbia_class": "plane",
   "designations": [
    "RLY-1",
    "SOL-12",
    "SOL-13"
   ],
   "primary_source": "phase2_plan",
   "cleanup_notes": "Measure coil voltage before selecting relay contacts | [RECON 2026-08-08 §G: SWAPPED SOL-13->SOL-12 per Dwg 41431075414 p140 (Solenoid Driver 1) + element list Y00B GSH.M=SOL-12=HIGH] | [CONFIRMED 2026-08-08: pg100 TB-51 (Dwg 4143075338) wire 412->SOL-12->GEAR SHIFT HIGH; physical double-check of §G swap complete] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/orient_ladder_transcription.md] | [2026-08-13 CONFIRMED: wire 412 read at the LEFT coil of the Nachi SA-G01-E3X-C1-31 double-solenoid valve = SOL-12 gear shift high]",
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
     "line": 172,
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
     "lines": "62",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "129",
     "note": "net gear-hi-sol           => hm2_7i80.0.7i84.0.0.output-07  # OUT7  Y00B GSH.M"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "172",
     "note": "net gear-hi-sol         <= mazak-orient.gear-hi-sol"
    },
    {
     "file": "phase2_plan",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "CN11-4",
    "wire": "712",
    "cn_pin": "SSR bd CN11-4",
    "provenance": "RESOLVED 2026-08-10: BBIA-1 terminal-unit CN11 pin4 = wire712 GEAR SHIFT HIGH (PLC-output/BBIA-1 side); downstream at the solenoid this becomes wire412 per pg100 TB-51 (SOL-12) - different wire# across the SSR-board relay contact is normal, CN11-4 is the correct Mesa landing point"
   },
   "authority_line": 62
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
   "status": "FACTORY_INTERFACE",
   "field_point": "RLY-2 to SOL-13 Fujikoshi hydraulic valve",
   "dest_connector": "CN11",
   "dest_pin": "5",
   "factory_wire": "213",
   "bbia_class": "plane",
   "designations": [
    "RLY-2",
    "SOL-13",
    "SOL-12"
   ],
   "primary_source": "phase2_plan",
   "cleanup_notes": "Conflict: connector_crossref.md omits SOL-12 and identifies SOL-13 as low; verify both gear-shift coils before wiring | [RECON 2026-08-08 §G: SWAPPED SOL-12->SOL-13 per Dwg 41431075414 p140 + element list Y00C GSL.M=SOL-13=LOW; HOLD_CONFLICT cleared] | [CONFIRMED 2026-08-08: pg100 TB-51 (Dwg 4143075338) wire 413->SOL-13->GEAR SHIFT LOW; physical double-check of §G swap complete] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/orient_ladder_transcription.md] | [2026-08-13 CONFIRMED: wire 413 read at the RIGHT coil of the same Nachi SA-G01-E3X-C1-31 valve = SOL-13 gear shift low. Both gear coils are on ONE 3-position valve]",
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
     "line": 135,
     "text": "net gear-lo-sol         => hm2_7i80.0.7i84.0.0.output-08  # OUT8  Y00C GSL.M",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.7i84.0.0.output-08"
     ],
     "bidir": []
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 173,
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
     "lines": "63",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "135",
     "note": "net gear-lo-sol         => hm2_7i80.0.7i84.0.0.output-08  # OUT8  Y00C GSL.M"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "173",
     "note": "net gear-lo-sol         <= mazak-orient.gear-lo-sol"
    },
    {
     "file": "phase2_plan",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "CN11-5",
    "wire": "213",
    "cn_pin": "SSR bd CN11-5",
    "provenance": "RESOLVED 2026-08-10: BBIA-1 terminal-unit CN11 pin5 = wire213 GEAR SHIFT LOW (PLC-output/BBIA-1 side); downstream becomes wire413 per pg100 TB-51 (SOL-13) - CN11-5 is the correct Mesa landing point"
   },
   "authority_line": 63
  },
  {
   "id": "TOOL_CLAMP_SOL",
   "name": "Tool Clamp Sol",
   "board": "7i84U-A",
   "connector": "TB2",
   "channel": "OUT9",
   "hal_net": "",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "ATC tool",
   "machine_subsystem": "ATC",
   "status": "NOT_USED",
   "field_point": "PHANTOM - no separate clamp solenoid; SOL-10 is single-coil spring-return (clamp = de-energize). OUT9 free.",
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "spare",
   "designations": [
    "SOL-10"
   ],
   "primary_source": "phase2_plan",
   "cleanup_notes": "[C5 RESOLVED 2026-08-09: dropped. SOL-10 single-coil spring-return tool-unclamp (pg100 + connector_crossref + Dwg141331AS041); clamp is spring return. OUT9 now free. Confirm single-coil by tracing RLY-3/RLY-4 at cabinet.] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/atc_ladder_transcription.md] | [2026-08-13 PHANTOM CONFIRMED: coil wire labels read on the machine show three coils over two valve bodies - 412+413 on the double-solenoid gear-shift valve, 410 alone on a separate tool-unclamp valve. No second coil exists for a clamp solenoid. authority_conflicts.md section 2 RESOLVED]",
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "64",
     "note": "Current wiring authority row"
    },
    {
     "file": "phase2_plan",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "",
    "wire": "",
    "cn_pin": "",
    "provenance": "N/A 2026-08-10: eliminated per authority CSV (PHANTOM/NOT_USED) - SOL-10 is single-coil spring-return, clamp=de-energize, no separate clamp solenoid exists to land"
   },
   "authority_line": 64
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
   "status": "FACTORY_INTERFACE",
   "field_point": "RLY-4 to SOL-10 Fujikoshi hydraulic valve",
   "dest_connector": "CN11",
   "dest_pin": "3",
   "factory_wire": "710",
   "bbia_class": "plane",
   "designations": [
    "RLY-4",
    "SOL-10",
    "TB-505"
   ],
   "primary_source": "phase2_plan",
   "cleanup_notes": "Evidence supports SOL-10 tool unclamp; verify relay path and whether the valve is single-coil or dual-coil before energizing | [C5 2026-08-09: sole tool-clamp/unclamp output. SOL-10 single-coil spring-return - energize=unclamp, de-energize=clamp. TOOL_CLAMP_SOL/OUT9 dropped. Confirm RLY-4 load at cabinet.] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/atc_ladder_transcription.md] | [2026-08-13 CONFIRMED: wire 410 read at the coil on a separate Nachi directional valve = SOL-10 tool unclamp, single coil]",
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
     "line": 173,
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
     "line": 227,
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
     "lines": "65",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "173",
     "note": "net tool-unclamp-sol   => hm2_7i80.0.7i84.0.0.output-10  # OUT10 RLY-4 to SOL-10"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "227",
     "note": "net tool-unclamp-sol    <= mazak-atc.tool-unclamp-sol"
    },
    {
     "file": "phase2_plan",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "CN11-3",
    "wire": "710",
    "cn_pin": "SSR bd CN11-3",
    "provenance": "RESOLVED 2026-08-10: BBIA-1 terminal-unit CN11 pin3 = wire710 TOOL UNCLAMP - exact label match, consistent with SOL-10 single-coil spring-return (energize=unclamp)"
   },
   "authority_line": 65
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
   "status": "FACTORY_INTERFACE",
   "field_point": "Coolant pump relay",
   "dest_connector": "CN11",
   "dest_pin": "15",
   "factory_wire": "236",
   "bbia_class": "plane",
   "designations": [
    "SOL-31",
    "TB-51",
    "CB-4"
   ],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "May need interposing relay | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/coolant_ladder_transcription.md]",
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
     "line": 174,
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
     "line": 175,
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
     "lines": "66",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "174",
     "note": "net flood-coolant      <= iocontrol.0.coolant-flood"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "175",
     "note": "net flood-coolant      => hm2_7i80.0.7i84.0.0.output-11  # OUT11 flood pump relay"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "CN11-15",
    "wire": "236",
    "cn_pin": "SSR bd CN11-15",
    "provenance": "RESOLVED 2026-08-10: BBIA-1 terminal-unit CN11 pin15 = wire236 FLOOD COOLANT MOTOR STARTER, matching 'coolant pump relay' (motor starter = pump, distinct from FLOOD_VALVE at CN11-13). NB pin15 shares wire236 with pin12 OIL HOLE - a data-quality flag in the source CSV, not resolved here"
   },
   "authority_line": 66
  },
  {
   "id": "MIST_COOLANT",
   "name": "Mist Coolant",
   "board": "7i84U-A",
   "connector": "TB2",
   "channel": "OUT12",
   "hal_net": "",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Utility",
   "machine_subsystem": "Utility",
   "status": "NOT_USED",
   "field_point": "NOT USED - mist coolant eliminated 2026-08-09 (no mist system on this machine); OUT12 free",
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "spare",
   "designations": [],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "[ELIMINATED 2026-08-09: owner confirms no mist coolant system. HOLD_CONFLICT void; 7i84U-A TB2 OUT12 now available. The commented iocontrol.0.coolant-mist net can be removed from the HAL.]",
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
   "epson_ferrules": [],
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
   "bb_source": null,
   "authority_line": 67
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
   "status": "COMMISSIONING_PENDING",
   "field_point": "ATC magazine CW rotation relay -> SOL-8B (pg91 Dwg 4143075332: SOL-8B=408B=MAGAZINE CW/reverse)",
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "exception",
   "designations": [
    "SOL-8B"
   ],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "CONFLICT #3 in wiring/authority_conflicts.md: SOL-8A/8B direction mapping unproven. Renamed from atc-fwd to match atc_orient.hal net. Verify direction under controlled commissioning. | [RESOLVED 2026-08-09: coil identity = SOL-8B (CW) per pg91 + connector_crossref (both agree; alarm-table OCR was wrong). Prior 'SOL-8A' was backwards. HOLD_CONFLICT cleared. PENDING BENCH: verify observed magazine rotation under controlled commissioning before landing/energizing.] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/atc_ladder_transcription.md]",
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
     "file": "linuxcnc/atc_orient.hal",
     "line": 214,
     "text": "net mag-cw-sol     <= mazak-atc.mag-fwd-sol",
     "commented": false,
     "producers": [
      "mazak-atc.mag-fwd-sol"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 220,
     "text": "net mag-cw-sol     => hm2_7i80.0.7i84.0.0.output-13  # OUT13 SOL-8B (CW) via relay",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.7i84.0.0.output-13"
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
     "file": "linuxcnc/atc_orient.hal",
     "lines": "214",
     "note": "net mag-cw-sol     <= mazak-atc.mag-fwd-sol"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "220",
     "note": "net mag-cw-sol     => hm2_7i80.0.7i84.0.0.output-13  # OUT13 SOL-8B (CW) via relay"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": null,
   "authority_line": 68
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
   "status": "COMMISSIONING_PENDING",
   "field_point": "ATC magazine CCW rotation relay -> SOL-8A (pg91 Dwg 4143075332: SOL-8A=408A=MAGAZINE CCW/forward)",
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "exception",
   "designations": [
    "SOL-8A"
   ],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "CONFLICT #3 in wiring/authority_conflicts.md: SOL-8A/8B direction mapping unproven. Renamed from atc-rev to match atc_orient.hal net. Verify direction under controlled commissioning. | [RESOLVED 2026-08-09: coil identity = SOL-8A (CCW) per pg91 + connector_crossref. Prior 'SOL-8B' was backwards. HOLD_CONFLICT cleared. PENDING BENCH: verify observed magazine rotation under controlled commissioning before landing/energizing.] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/atc_ladder_transcription.md]",
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
     "file": "linuxcnc/atc_orient.hal",
     "line": 215,
     "text": "net mag-ccw-sol    <= mazak-atc.mag-rev-sol",
     "commented": false,
     "producers": [
      "mazak-atc.mag-rev-sol"
     ],
     "consumers": [],
     "bidir": []
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "line": 221,
     "text": "net mag-ccw-sol    => hm2_7i80.0.7i84.0.0.output-14  # OUT14 SOL-8A (CCW) via relay",
     "commented": false,
     "producers": [],
     "consumers": [
      "hm2_7i80.0.7i84.0.0.output-14"
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
     "file": "linuxcnc/atc_orient.hal",
     "lines": "215",
     "note": "net mag-ccw-sol    <= mazak-atc.mag-rev-sol"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "221",
     "note": "net mag-ccw-sol    => hm2_7i80.0.7i84.0.0.output-14  # OUT14 SOL-8A (CCW) via relay"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": null,
   "authority_line": 69
  },
  {
   "id": "ALARM_OUT",
   "name": "Alarm Out",
   "board": "7i84U-A",
   "connector": "TB2",
   "channel": "OUT15",
   "hal_net": "",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Panel",
   "machine_subsystem": "Operator panel",
   "status": "RESERVED",
   "field_point": "Alarm light or horn",
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "spare",
   "designations": [],
   "primary_source": "archived_wiring_map",
   "cleanup_notes": "Confirm load and behavior | [2026-08-09: RESERVED, hal_net none (was alarm-out) - optional load unconfirmed; restore net when alarm device is chosen]",
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "70",
     "note": "Current wiring authority row"
    },
    {
     "file": "archived_wiring_map",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": null,
   "authority_line": 70
  },
  {
   "id": "SSERIAL_PORT1_TXA",
   "name": "Sserial Port1 Txa",
   "board": "7i44",
   "connector": "P3 7i44 physical channel 1",
   "channel": "port1.TX+",
   "hal_net": "",
   "direction": "LINK",
   "direction_label": "Link (smart-serial)",
   "subsystem": "Field I/O",
   "machine_subsystem": "Field I/O link",
   "status": "FACTORY_LINK",
   "field_point": "7i84U-B RJ45 pin 2 RX+",
   "dest_connector": "7i84U-B RJ45",
   "dest_pin": "2",
   "factory_wire": "",
   "bbia_class": "power-internal",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "7i44 channel 1 to 7i84U-B CN0 under HostMot2 port 0; RS-422 differential pair | [MESA-CONFIRMED 2026-08-08: matches 7i84U J1 RJ-45 pinout (7i84uman.pdf: p1 RXA/p2 RXB/p3 TXA/p6 TXB/p4-5 GND/p7-8 +5V, 568B colors); straight CAT5 to 7i44; plug-in cable, no continuity trace needed] | [READY 2026-08-09: factory-link acceptance applies to two distinct plug-in segments: Mesa 50-pin IDC from 7i80HDT P1 to 7i44, then CAT5 smart-serial from 7i44 to the identified 7i84U channel. Inspect assembly identity, keying/orientation, seating, strain relief, and visible condition; verify expected smart-serial enumeration without communication or watchdog faults. Do not continuity-audit or re-terminate individual conductors.]",
   "location": "Control cabinet — 7i80HDT P3 to 7i44 by Mesa 50-pin IDC; 7i44 channel 1 to 7i84U-B CN0/RJ45 by CAT5 smart-serial",
   "location_note": "Factory plug-in link: inspect identity, keying/orientation, seating, strain relief, and visible condition; verify clean smart-serial enumeration. Do not continuity-audit or re-terminate individual conductors.",
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
     "lines": "71",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": null,
   "authority_line": 71
  },
  {
   "id": "SSERIAL_PORT1_TXB",
   "name": "Sserial Port1 Txb",
   "board": "7i44",
   "connector": "P3 7i44 physical channel 1",
   "channel": "port1.TX-",
   "hal_net": "",
   "direction": "LINK",
   "direction_label": "Link (smart-serial)",
   "subsystem": "Field I/O",
   "machine_subsystem": "Field I/O link",
   "status": "FACTORY_LINK",
   "field_point": "7i84U-B RJ45 pin 1 RX-",
   "dest_connector": "7i84U-B RJ45",
   "dest_pin": "1",
   "factory_wire": "",
   "bbia_class": "power-internal",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "RS-422 differential pair | [MESA-CONFIRMED 2026-08-08: matches 7i84U J1 RJ-45 pinout (7i84uman.pdf: p1 RXA/p2 RXB/p3 TXA/p6 TXB/p4-5 GND/p7-8 +5V, 568B colors); straight CAT5 to 7i44; plug-in cable, no continuity trace needed] | [READY 2026-08-09: factory-link acceptance applies to two distinct plug-in segments: Mesa 50-pin IDC from 7i80HDT P1 to 7i44, then CAT5 smart-serial from 7i44 to the identified 7i84U channel. Inspect assembly identity, keying/orientation, seating, strain relief, and visible condition; verify expected smart-serial enumeration without communication or watchdog faults. Do not continuity-audit or re-terminate individual conductors.]",
   "location": "Control cabinet — 7i80HDT P3 to 7i44 by Mesa 50-pin IDC; 7i44 channel 1 to 7i84U-B CN0/RJ45 by CAT5 smart-serial",
   "location_note": "Factory plug-in link: inspect identity, keying/orientation, seating, strain relief, and visible condition; verify clean smart-serial enumeration. Do not continuity-audit or re-terminate individual conductors.",
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
     "lines": "72",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": null,
   "authority_line": 72
  },
  {
   "id": "SSERIAL_PORT1_RXA",
   "name": "Sserial Port1 Rxa",
   "board": "7i44",
   "connector": "P3 7i44 physical channel 1",
   "channel": "port1.RX+",
   "hal_net": "",
   "direction": "LINK",
   "direction_label": "Link (smart-serial)",
   "subsystem": "Field I/O",
   "machine_subsystem": "Field I/O link",
   "status": "FACTORY_LINK",
   "field_point": "7i84U-B RJ45 pin 6 TX+",
   "dest_connector": "7i84U-B RJ45",
   "dest_pin": "6",
   "factory_wire": "",
   "bbia_class": "power-internal",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "RS-422 differential pair | [MESA-CONFIRMED 2026-08-08: matches 7i84U J1 RJ-45 pinout (7i84uman.pdf: p1 RXA/p2 RXB/p3 TXA/p6 TXB/p4-5 GND/p7-8 +5V, 568B colors); straight CAT5 to 7i44; plug-in cable, no continuity trace needed] | [READY 2026-08-09: factory-link acceptance applies to two distinct plug-in segments: Mesa 50-pin IDC from 7i80HDT P1 to 7i44, then CAT5 smart-serial from 7i44 to the identified 7i84U channel. Inspect assembly identity, keying/orientation, seating, strain relief, and visible condition; verify expected smart-serial enumeration without communication or watchdog faults. Do not continuity-audit or re-terminate individual conductors.]",
   "location": "Control cabinet — 7i80HDT P3 to 7i44 by Mesa 50-pin IDC; 7i44 channel 1 to 7i84U-B CN0/RJ45 by CAT5 smart-serial",
   "location_note": "Factory plug-in link: inspect identity, keying/orientation, seating, strain relief, and visible condition; verify clean smart-serial enumeration. Do not continuity-audit or re-terminate individual conductors.",
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
   "bb_source": null,
   "authority_line": 73
  },
  {
   "id": "SSERIAL_PORT1_RXB",
   "name": "Sserial Port1 Rxb",
   "board": "7i44",
   "connector": "P3 7i44 physical channel 1",
   "channel": "port1.RX-",
   "hal_net": "",
   "direction": "LINK",
   "direction_label": "Link (smart-serial)",
   "subsystem": "Field I/O",
   "machine_subsystem": "Field I/O link",
   "status": "FACTORY_LINK",
   "field_point": "7i84U-B RJ45 pin 3 TX-",
   "dest_connector": "7i84U-B RJ45",
   "dest_pin": "3",
   "factory_wire": "",
   "bbia_class": "power-internal",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "RS-422 differential pair | [MESA-CONFIRMED 2026-08-08: matches 7i84U J1 RJ-45 pinout (7i84uman.pdf: p1 RXA/p2 RXB/p3 TXA/p6 TXB/p4-5 GND/p7-8 +5V, 568B colors); straight CAT5 to 7i44; plug-in cable, no continuity trace needed] | [READY 2026-08-09: factory-link acceptance applies to two distinct plug-in segments: Mesa 50-pin IDC from 7i80HDT P1 to 7i44, then CAT5 smart-serial from 7i44 to the identified 7i84U channel. Inspect assembly identity, keying/orientation, seating, strain relief, and visible condition; verify expected smart-serial enumeration without communication or watchdog faults. Do not continuity-audit or re-terminate individual conductors.]",
   "location": "Control cabinet — 7i80HDT P3 to 7i44 by Mesa 50-pin IDC; 7i44 channel 1 to 7i84U-B CN0/RJ45 by CAT5 smart-serial",
   "location_note": "Factory plug-in link: inspect identity, keying/orientation, seating, strain relief, and visible condition; verify clean smart-serial enumeration. Do not continuity-audit or re-terminate individual conductors.",
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
   "bb_source": null,
   "authority_line": 74
  },
  {
   "id": "SSERIAL_PORT1_GND",
   "name": "Sserial Port1 Gnd",
   "board": "7i44",
   "connector": "P3 7i44 physical channel 1",
   "channel": "port1.GND",
   "hal_net": "",
   "direction": "LINK",
   "direction_label": "Link (smart-serial)",
   "subsystem": "Field I/O",
   "machine_subsystem": "Field I/O link",
   "status": "FACTORY_LINK",
   "field_point": "7i84U-B RJ45 pin 4/5 ground",
   "dest_connector": "7i84U-B RJ45",
   "dest_pin": "4/5",
   "factory_wire": "",
   "bbia_class": "power-internal",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Factory-link signal ground; cable construction is not field-modified | [MESA-CONFIRMED 2026-08-08: matches 7i84U J1 RJ-45 pinout (7i84uman.pdf: p1 RXA/p2 RXB/p3 TXA/p6 TXB/p4-5 GND/p7-8 +5V, 568B colors); straight CAT5 to 7i44] | [READY 2026-08-09: two distinct plug-in segments: Mesa 50-pin IDC from 7i80HDT P1 to 7i44, then CAT5 smart-serial from 7i44 channel 1 to 7i84U-B. Inspect assembly identity, keying/orientation, seating, strain relief, and visible condition; verify expected smart-serial enumeration without communication or watchdog faults. Do not continuity-audit or re-terminate individual conductors.]",
   "location": "Control cabinet — 7i80HDT P3 to 7i44 by Mesa 50-pin IDC; 7i44 channel 1 to 7i84U-B CN0/RJ45 by CAT5 smart-serial",
   "location_note": "Factory plug-in link: inspect identity, keying/orientation, seating, strain relief, and visible condition; verify clean smart-serial enumeration. Do not continuity-audit or re-terminate individual conductors.",
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
   "bb_source": null,
   "authority_line": 75
  },
  {
   "id": "SSERIAL_PORT1_5V",
   "name": "Sserial Port1 5V",
   "board": "7i44",
   "connector": "P3 7i44 physical channel 1",
   "channel": "port1.+5V",
   "hal_net": "",
   "direction": "LINK",
   "direction_label": "Link (smart-serial)",
   "subsystem": "Field I/O",
   "machine_subsystem": "Field I/O link",
   "status": "FACTORY_LINK",
   "field_point": "7i84U-B RJ45 pin 7/8 +5V",
   "dest_connector": "7i84U-B RJ45",
   "dest_pin": "7/8",
   "factory_wire": "",
   "bbia_class": "power-internal",
   "designations": [],
   "primary_source": "mesa_firmware_checklist.md",
   "cleanup_notes": "Serial power for 7i84U-B logic | [MESA-CONFIRMED 2026-08-08: matches 7i84U J1 RJ-45 pinout (7i84uman.pdf: p1 RXA/p2 RXB/p3 TXA/p6 TXB/p4-5 GND/p7-8 +5V, 568B colors); straight CAT5 to 7i44; plug-in cable, no continuity trace needed] | [READY 2026-08-09: factory-link acceptance applies to two distinct plug-in segments: Mesa 50-pin IDC from 7i80HDT P1 to 7i44, then CAT5 smart-serial from 7i44 to the identified 7i84U channel. Inspect assembly identity, keying/orientation, seating, strain relief, and visible condition; verify expected smart-serial enumeration without communication or watchdog faults. Do not continuity-audit or re-terminate individual conductors.]",
   "location": "Control cabinet — 7i80HDT P3 to 7i44 by Mesa 50-pin IDC; 7i44 channel 1 to 7i84U-B CN0/RJ45 by CAT5 smart-serial",
   "location_note": "Factory plug-in link: inspect identity, keying/orientation, seating, strain relief, and visible condition; verify clean smart-serial enumeration. Do not continuity-audit or re-terminate individual conductors.",
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
   "bb_source": null,
   "authority_line": 76
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
   "status": "FACTORY_INTERFACE",
   "field_point": "X positive overtravel limit (NC)",
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "exception",
   "designations": [
    "OT+X"
   ],
   "primary_source": "field_7i84u.hal",
   "cleanup_notes": "NC contact consumed through input-00-not; promote to FIELD_VERIFIED after continuity and fail-open test | [LOCATED 2026-08-09: +X OVER TRAVEL X20 *+LX wire 1-45, Dwg 4143075410 (Motion Switch Input 4) pg136] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/interlocks_ladder_transcription.md]",
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
     "line": 218,
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
     "line": 226,
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
     "line": 227,
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
     "lines": "77",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "218",
     "note": "commented out — #     net limit-x-plus <= hm2_7i80.0.7i84.0.1.input-00-not"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "226",
     "note": "net limit-x-plus  <= hm2_7i80.0.7i84.0.1.input-00-not   # X_LIMIT_PLUS  (NC contact)"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "227",
     "note": "net limit-x-plus  => joint.0.pos-lim-sw-in"
    },
    {
     "file": "field_7i84u.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "",
    "wire": "",
    "cn_pin": "",
    "provenance": "NOT INDIVIDUALLY LOCATED 2026-08-10: same finding as X_LIMIT_MINUS - +X OVER TRAVEL (*+LX) has no BBIA-1 connector-box label on Dwg 4143075410 pg136. Needs field trace"
   },
   "authority_line": 77
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
   "status": "FACTORY_INTERFACE",
   "field_point": "X negative overtravel limit (NC)",
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "exception",
   "designations": [
    "OT-X"
   ],
   "primary_source": "field_7i84u.hal",
   "cleanup_notes": "NC contact consumed through input-01-not; promote to FIELD_VERIFIED after continuity and fail-open test | [LOCATED 2026-08-09: -X OVER TRAVEL X21 *-LX wire 1-46, Dwg 4143075410 (Motion Switch Input 4) pg136] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/interlocks_ladder_transcription.md]",
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
     "line": 228,
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
     "line": 229,
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
     "lines": "78",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "228",
     "note": "net limit-x-minus <= hm2_7i80.0.7i84.0.1.input-01-not   # X_LIMIT_MINUS (NC contact)"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "229",
     "note": "net limit-x-minus => joint.0.neg-lim-sw-in"
    },
    {
     "file": "field_7i84u.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "",
    "wire": "",
    "cn_pin": "",
    "provenance": "NOT INDIVIDUALLY LOCATED 2026-08-10: Dwg 4143075410 pg136 (Motion Switch Input 4) shows -X OVER TRAVEL (*-LX) with NO connector-box label on the T.U. row - unlike +Y(CN3-37)/-Z(CN3-38) which ARE individually called out, X-axis over-travel appears to bypass BBIA-1 as a discrete pin (may be relay-combined upstream, or land on a terminal block outside the 19-connector family). Needs field trace - do not assume a pin"
   },
   "authority_line": 78
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
   "status": "FACTORY_INTERFACE",
   "field_point": "Y positive overtravel limit (NC)",
   "dest_connector": "CN3",
   "dest_pin": "37",
   "factory_wire": "+LY",
   "bbia_class": "plane",
   "designations": [
    "OT+Y"
   ],
   "primary_source": "field_7i84u.hal",
   "cleanup_notes": "NC contact consumed through input-02-not; promote to FIELD_VERIFIED after continuity and fail-open test | [LOCATED 2026-08-09: +Y OVER TRAVEL X22 *+LY wire 1-47, Dwg 4143075410 (Motion Switch Input 4) pg136] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/interlocks_ladder_transcription.md]",
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
     "line": 230,
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
     "line": 231,
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
     "label_text": "B-TB3-03",
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
     "lines": "79",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "230",
     "note": "net limit-y-plus  <= hm2_7i80.0.7i84.0.1.input-02-not   # Y_LIMIT_PLUS  (NC contact)"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "231",
     "note": "net limit-y-plus  => joint.1.pos-lim-sw-in"
    },
    {
     "file": "field_7i84u.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    },
    {
     "file": "wiring/labels/bbia1_mesa_end_ferrules_epson.csv",
     "lines": "12",
     "note": "Epson Mesa-end ferrule B-TB3-03; HOLD_SOURCE_TRACE"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "CN3-37",
    "wire": "+LY",
    "cn_pin": "CN3-37",
    "provenance": "RESOLVED 2026-08-10: Dwg 4143075410 pg136 explicitly labels T.U CN3-37 = wire mnemonic +LY under '+Y OVER TRAVEL' - matches BBIA-1 board pinout CN3-37='+LY' exactly. Only individually-routed BBIA-1 pin among the six primary axis over-travels found this session (paired with Z_LIMIT_MINUS/CN3-38)"
   },
   "authority_line": 79
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
   "status": "FACTORY_INTERFACE",
   "field_point": "Y negative overtravel limit (NC)",
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "exception",
   "designations": [
    "OT-Y"
   ],
   "primary_source": "field_7i84u.hal",
   "cleanup_notes": "NC contact consumed through input-03-not; promote to FIELD_VERIFIED after continuity and fail-open test | [LOCATED 2026-08-09: -Y OVER TRAVEL X23 *-LY wire 1-48, Dwg 4143075410 (Motion Switch Input 4) pg136] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/interlocks_ladder_transcription.md]",
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
     "line": 232,
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
     "line": 233,
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
     "lines": "80",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "232",
     "note": "net limit-y-minus <= hm2_7i80.0.7i84.0.1.input-03-not   # Y_LIMIT_MINUS (NC contact)"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "233",
     "note": "net limit-y-minus => joint.1.neg-lim-sw-in"
    },
    {
     "file": "field_7i84u.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "",
    "wire": "",
    "cn_pin": "",
    "provenance": "NOT INDIVIDUALLY LOCATED 2026-08-10: Dwg 4143075410 pg136 shows -Y OVER TRAVEL (*-LY) with NO connector-box label on the T.U. row (only +Y/CN3-37 and -Z/CN3-38 are individually called out). Needs field trace"
   },
   "authority_line": 80
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
   "status": "FACTORY_INTERFACE",
   "field_point": "Z positive overtravel limit (NC)",
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "exception",
   "designations": [
    "OT+Z"
   ],
   "primary_source": "field_7i84u.hal",
   "cleanup_notes": "NC contact consumed through input-04-not; promote to FIELD_VERIFIED after continuity and fail-open test | [LOCATED 2026-08-09: +Z OVER TRAVEL X24 *+LZ wire 1-49, Dwg 4143075410 (Motion Switch Input 4) pg136] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/interlocks_ladder_transcription.md]",
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
     "line": 234,
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
     "line": 235,
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
     "label_text": "B-TB3-05",
     "wire": "+LTZ",
     "old_location": "CN2-14",
     "signal": "Z-AXIS OVER TRAVEL",
     "mesa_card": "7i84U-B",
     "connector": "TB3",
     "logical_channel": "IN4",
     "physical_pin": "TB3-05",
     "crosswalk_status": "PLANNED_MATCH",
     "release_status": "HOLD_DISPUTED_PIN",
     "source_line": 9
    }
   ],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "81",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "234",
     "note": "net limit-z-plus  <= hm2_7i80.0.7i84.0.1.input-04-not   # Z_LIMIT_PLUS  (NC contact)"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "235",
     "note": "net limit-z-plus  => joint.2.pos-lim-sw-in"
    },
    {
     "file": "field_7i84u.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    },
    {
     "file": "wiring/labels/bbia1_mesa_end_ferrules_epson.csv",
     "lines": "9",
     "note": "Epson Mesa-end ferrule B-TB3-05; HOLD_DISPUTED_PIN"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "",
    "wire": "",
    "cn_pin": "",
    "provenance": "NOT INDIVIDUALLY LOCATED 2026-08-10: Dwg 4143075410 pg136 shows +Z OVER TRAVEL (*+LZ) with NO connector-box label on the T.U. row. Needs field trace"
   },
   "authority_line": 81
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
   "status": "FACTORY_INTERFACE",
   "field_point": "Z negative overtravel limit (NC)",
   "dest_connector": "CN3",
   "dest_pin": "38",
   "factory_wire": "-LZ",
   "bbia_class": "plane",
   "designations": [
    "OT-Z"
   ],
   "primary_source": "field_7i84u.hal",
   "cleanup_notes": "NC contact consumed through input-05-not; promote to FIELD_VERIFIED after continuity and fail-open test | [LOCATED 2026-08-09: -Z OVER TRAVEL X25 *-LZ wire 1-50, Dwg 4143075410 (Motion Switch Input 4) pg136. Physical LS switch designator not on this sheet - bench-verify] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/interlocks_ladder_transcription.md]",
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
     "line": 236,
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
     "line": 237,
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
     "label_text": "B-TB3-06",
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
     "lines": "82",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "236",
     "note": "net limit-z-minus <= hm2_7i80.0.7i84.0.1.input-05-not   # Z_LIMIT_MINUS (NC contact)"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "237",
     "note": "net limit-z-minus => joint.2.neg-lim-sw-in"
    },
    {
     "file": "field_7i84u.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    },
    {
     "file": "wiring/labels/bbia1_mesa_end_ferrules_epson.csv",
     "lines": "13",
     "note": "Epson Mesa-end ferrule B-TB3-06; HOLD_SOURCE_TRACE"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "CN3-38",
    "wire": "-LZ",
    "cn_pin": "CN3-38",
    "provenance": "RESOLVED 2026-08-10: Dwg 4143075410 pg136 explicitly labels T.U CN3-38 = wire mnemonic -LZ under '-Z OVER TRAVEL' - matches BBIA-1 board pinout CN3-38='-LZ' exactly. Paired with Y_LIMIT_PLUS/CN3-37 as the only two individually-routed axis over-travel pins found this session"
   },
   "authority_line": 82
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
   "status": "FACTORY_INTERFACE",
   "field_point": "X home switch (LS-42 confirmed)",
   "dest_connector": "CN2",
   "dest_pin": "15",
   "factory_wire": "*DECX",
   "bbia_class": "plane",
   "designations": [
    "LS-42"
   ],
   "primary_source": "field_7i84u.hal",
   "cleanup_notes": "NO contact; was ACCEPTED_VERIFY - promote to TRACED after physical continuity + fail-open test | [LOCATED 2026-08-09: LS-42 X zero-return decel, X28 *DECX wire 1-16 (home reference), Dwg 4143075410 (Motion Switch Input 4) pg136 + pg91] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/homing_ladder_transcription.md]",
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
     "line": 239,
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
     "line": 240,
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
     "label_text": "B-TB3-07",
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
     "lines": "83",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "239",
     "note": "net home-x <= hm2_7i80.0.7i84.0.1.input-06        # LS-42 assumed"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "240",
     "note": "net home-x => joint.0.home-sw-in"
    },
    {
     "file": "field_7i84u.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    },
    {
     "file": "wiring/labels/bbia1_mesa_end_ferrules_epson.csv",
     "lines": "10",
     "note": "Epson Mesa-end ferrule B-TB3-07; HOLD_SOURCE_TRACE"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "CN2-15",
    "wire": "*DECX",
    "cn_pin": "CN2-15",
    "provenance": "RESOLVED 2026-08-10: Dwg 4143075410 pg136 T.U row shows pin -15 under 'X AXIS ZERO RETURN DECELERATION' (*DECX); BBIA-1 board pinout confirms CN2-15 = wire mnemonic *DECX - matches LS-42 per authority LOCATED note"
   },
   "authority_line": 83
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
   "status": "FACTORY_INTERFACE",
   "field_point": "Y home switch (LS-52)",
   "dest_connector": "CN2",
   "dest_pin": "16",
   "factory_wire": "*DECY",
   "bbia_class": "plane",
   "designations": [
    "LS-52"
   ],
   "primary_source": "field_7i84u.hal",
   "cleanup_notes": "NO contact; was ACCEPTED_VERIFY - promote to TRACED after physical continuity + fail-open test | [LOCATED 2026-08-09: LS-52 Y zero-return decel, X29 *DECY wire 1-17 (home reference), Dwg 4143075410 (Motion Switch Input 4) pg136; LS digit faded - verify] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/homing_ladder_transcription.md]",
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
     "line": 241,
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
     "line": 242,
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
     "label_text": "B-TB3-08",
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
     "lines": "84",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "241",
     "note": "net home-y <= hm2_7i80.0.7i84.0.1.input-07        # LS-52 assumed"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "242",
     "note": "net home-y => joint.1.home-sw-in"
    },
    {
     "file": "field_7i84u.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    },
    {
     "file": "wiring/labels/bbia1_mesa_end_ferrules_epson.csv",
     "lines": "11",
     "note": "Epson Mesa-end ferrule B-TB3-08; HOLD_SOURCE_TRACE"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "CN2-16",
    "wire": "*DECY",
    "cn_pin": "CN2-16",
    "provenance": "RESOLVED 2026-08-10: Dwg 4143075410 pg136 T.U row shows pin -16 under 'Y AXIS ZERO RETURN DECELERATION' (*DECY); BBIA-1 board pinout confirms CN2-16 = wire mnemonic *DECY - matches LS-52 per authority LOCATED note"
   },
   "authority_line": 84
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
   "status": "FACTORY_INTERFACE",
   "field_point": "Z home switch (LS-62 confirmed TB-51)",
   "dest_connector": "CN1",
   "dest_pin": "14",
   "factory_wire": "*DECZ",
   "bbia_class": "plane",
   "designations": [
    "LS-62",
    "TB-51"
   ],
   "primary_source": "field_7i84u.hal",
   "cleanup_notes": "NO contact; was ACCEPTED_VERIFY - promote to TRACED after physical continuity + fail-open test | [LOCATED 2026-08-09: LS-62 Z zero-return decel, X2A *DECZ wire 1-18 (home reference), Dwg 4143075410 (Motion Switch Input 4) pg136 (also pg100 TB-51)] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/homing_ladder_transcription.md]",
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
     "line": 243,
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
     "line": 244,
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
     "label_text": "B-TB3-09",
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
     "lines": "85",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "243",
     "note": "net home-z <= hm2_7i80.0.7i84.0.1.input-08        # LS-62 confirmed TB-51"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "244",
     "note": "net home-z => joint.2.home-sw-in"
    },
    {
     "file": "field_7i84u.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    },
    {
     "file": "wiring/labels/bbia1_mesa_end_ferrules_epson.csv",
     "lines": "2",
     "note": "Epson Mesa-end ferrule B-TB3-09; HOLD_SOURCE_TRACE"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "CN1-14",
    "wire": "*DECZ",
    "cn_pin": "CN1-14",
    "provenance": "RESOLVED 2026-08-10: Dwg 4143075410 pg136 T.U row explicitly labels CN1-14 = wire mnemonic *DECZ under 'Z AXIS ZERO RETURN DECELERATION' - matches BBIA-1 board pinout CN1-14='*DECZ' exactly and LS-62 per authority LOCATED note"
   },
   "authority_line": 85
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
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "exception",
   "designations": [],
   "primary_source": "field_7i84u.hal",
   "cleanup_notes": "Raw input and fail-inhibited default; verify switch exists and closes on healthy pressure before live M6 | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/atc_ladder_transcription.md]",
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
     "line": 249,
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
     "line": 201,
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
     "lines": "86",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "249",
     "note": "net air-ok <= hm2_7i80.0.7i84.0.1.input-09"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "201",
     "note": "net air-ok              => mazak-atc.air-ok"
    },
    {
     "file": "field_7i84u.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": null,
   "authority_line": 86
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
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "spare",
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
     "lines": "87",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": null,
   "authority_line": 87
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
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "spare",
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
     "lines": "88",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": null,
   "authority_line": 88
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
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "spare",
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
     "lines": "89",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": null,
   "authority_line": 89
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
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "spare",
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
     "lines": "90",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": null,
   "authority_line": 90
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
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "spare",
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
   "bb_source": null,
   "authority_line": 91
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
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "exception",
   "designations": [],
   "primary_source": "field_7i84u.hal",
   "cleanup_notes": "Moved from bare P3 gpio.042 to opto-isolated 7i84U-B input-15. MP-3 is believed NC so HAL consumes input-15-not; verify physical polarity fail-open response and measured probing latency before use. | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/probe_mms_ladder_transcription.md]",
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
     "line": 267,
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
     "line": 268,
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
     "lines": "92",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "267",
     "note": "net probe-in <= hm2_7i80.0.7i84.0.1.input-15-not"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "268",
     "note": "net probe-in => motion.probe-input"
    },
    {
     "file": "field_7i84u.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": null,
   "authority_line": 92
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
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "spare",
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
   "bb_source": null,
   "authority_line": 93
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
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "spare",
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
   "bb_source": null,
   "authority_line": 94
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
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "spare",
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
   "bb_source": null,
   "authority_line": 95
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
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "spare",
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
     "lines": "96",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": null,
   "authority_line": 96
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
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "spare",
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
   "bb_source": null,
   "authority_line": 97
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
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "spare",
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
   "bb_source": null,
   "authority_line": 98
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
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "spare",
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
   "bb_source": null,
   "authority_line": 99
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
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "spare",
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
   "bb_source": null,
   "authority_line": 100
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
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "spare",
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
   "bb_source": null,
   "authority_line": 101
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
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "spare",
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
   "bb_source": null,
   "authority_line": 102
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
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "spare",
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
   "bb_source": null,
   "authority_line": 103
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
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "spare",
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
   "bb_source": null,
   "authority_line": 104
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
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "spare",
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
   "bb_source": null,
   "authority_line": 105
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
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "spare",
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
   "bb_source": null,
   "authority_line": 106
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
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "spare",
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
   "bb_source": null,
   "authority_line": 107
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
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "spare",
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
   "bb_source": null,
   "authority_line": 108
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
   "status": "FACTORY_INTERFACE",
   "field_point": "X servo S-ON to MELDAS DK-427 (X-drive ENA input)",
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "exception",
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
     "line": 321,
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
     "line": 322,
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
     "line": 304,
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
     "line": 305,
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
     "line": 304,
     "text": "setp hm2_7i80.0.pwmgen.00.output-type 2    # X axis  -> 7i49 AOUT0",
     "commented": false,
     "target": "hm2_7i80.0.pwmgen.00.output-type",
     "value": "2"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 305,
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
     "lines": "109",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "321",
     "note": "net x-enable   => pid.x.enable"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "322",
     "note": "net x-enable   => hm2_7i80.0.pwmgen.00.enable"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "304",
     "note": "net x-enable     <= and2.0.out"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "305",
     "note": "net x-enable     => hm2_7i80.0.7i84.0.1.output-00   # X servo S-ON to MELDAS DK-427"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "304",
     "note": "setp hm2_7i80.0.pwmgen.00.output-type 2    # X axis  -> 7i49 AOUT0"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "305",
     "note": "setp hm2_7i80.0.pwmgen.00.scale       [JOINT_0]OUTPUT_SCALE"
    },
    {
     "file": "field_7i84u.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "",
    "wire": "",
    "cn_pin": "",
    "provenance": "N/A 2026-08-10: new signal - interposing relay lands directly at MELDAS DK-427 ENA input, not via a BBIA-1 pass-through pin (no OEM equivalent existed; ENA is a new Mesa-driven control point)"
   },
   "authority_line": 109
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
   "status": "FACTORY_INTERFACE",
   "field_point": "Y servo S-ON to MELDAS DK-427 (Y-drive ENA input)",
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "exception",
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
     "line": 331,
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
     "line": 332,
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
     "line": 310,
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
     "line": 311,
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
     "line": 308,
     "text": "setp hm2_7i80.0.pwmgen.02.output-type 2    # Y axis  -> 7i49 AOUT2",
     "commented": false,
     "target": "hm2_7i80.0.pwmgen.02.output-type",
     "value": "2"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "line": 309,
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
     "lines": "110",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "331",
     "note": "net y-enable   => pid.y.enable"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "332",
     "note": "net y-enable   => hm2_7i80.0.pwmgen.02.enable"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "310",
     "note": "net y-enable     <= and2.1.out"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "311",
     "note": "net y-enable     => hm2_7i80.0.7i84.0.1.output-01   # Y servo S-ON to MELDAS DK-427"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "308",
     "note": "setp hm2_7i80.0.pwmgen.02.output-type 2    # Y axis  -> 7i49 AOUT2"
    },
    {
     "file": "linuxcnc/motion_7i80hdt.hal",
     "lines": "309",
     "note": "setp hm2_7i80.0.pwmgen.02.scale       [JOINT_1]OUTPUT_SCALE"
    },
    {
     "file": "field_7i84u.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "",
    "wire": "",
    "cn_pin": "",
    "provenance": "N/A 2026-08-10: new signal - interposing relay lands directly at MELDAS DK-427 ENA input, not via BBIA-1 (same reasoning as X_DRIVE_ENABLE)"
   },
   "authority_line": 110
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
   "status": "FACTORY_INTERFACE",
   "field_point": "Z servo S-ON to MELDAS DK-427 (Z-drive ENA input)",
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "exception",
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
     "line": 318,
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
     "line": 319,
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
     "lines": "111",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "318",
     "note": "net z-enable     <= z-drive-drop-delay.out"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "319",
     "note": "net z-enable     => hm2_7i80.0.7i84.0.1.output-02   # Z servo S-ON to MELDAS DK-427"
    },
    {
     "file": "field_7i84u.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "",
    "wire": "",
    "cn_pin": "",
    "provenance": "N/A 2026-08-10: new signal - interposing relay lands directly at MELDAS DK-427 ENA input, not via BBIA-1 (same reasoning as X/Y_DRIVE_ENABLE)"
   },
   "authority_line": 111
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
   "status": "FACTORY_INTERFACE",
   "field_point": "SOL-15 spindle air blast via RLY-5 (interposing relay for 100VAC coil)",
   "dest_connector": "CN11",
   "dest_pin": "6",
   "factory_wire": "215",
   "bbia_class": "plane",
   "designations": [
    "SOL-15",
    "RLY-5"
   ],
   "primary_source": "field_7i84u.hal",
   "cleanup_notes": "Verify SOL-62 identification against parts list pp.85-91 | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/coolant_ladder_transcription.md] | [2026-08-12 CONFLICT: the OEM head placard (dwg 24136209710) disagrees with this solenoid identity - see wiring/authority_conflicts.md section 5 and wiring/head_device_placard.md. Nothing changed here; identity must be settled BEFORE RLY-5/6/7 are wired.] | [2026-08-13 IDENTIFIED: coil wire label read on the machine = 415 -> SOL-15 SPINDLE AIR BLAST, matching connector_crossref (OEM pg90). The SOL-62 label on this row was WRONG. Function and wire were already correct, so the fix is a relabel not a rebinding. Owner approval pending. See wiring/authority_conflicts.md section 5] | [2026-08-13 APPLIED (owner approved): field point corrected SOL-62 -> SOL-15. Coil wire label read on the machine = 415 (RC3A side) / 215 (terminal-unit side, CN11-6). Function and wire were already correct - this was a relabel, not a rebinding. hal_net air-blast and the OUT3 binding are unchanged.]",
   "location": "Solenoid valve bank — SOL-15 spindle air blast via relay RLY-5",
   "location_note": "100 VAC coil confirmed on the CKD nameplate — relay required",
   "expected": {
    "value": "0",
    "label": "0 / de-energized — output idle unless commanded",
    "basis": "No commanding logic in the active HAL for this net; outputs default off.",
    "kind": "default-off"
   },
   "hal_state": "active",
   "mesa_pins": [
    "hm2_7i80.0.7i84.0.1.output-03"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 325,
     "text": "net air-blast          => hm2_7i80.0.7i84.0.1.output-03  # SOL-15 spindle air blast via RLY-5",
     "commented": false,
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
     "lines": "112",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "325",
     "note": "net air-blast          => hm2_7i80.0.7i84.0.1.output-03  # SOL-15 spindle air blast via RLY-5"
    },
    {
     "file": "field_7i84u.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "",
    "wire": "",
    "cn_pin": "",
    "provenance": "AMBIGUOUS 2026-08-10: CN11-6 (wire215 SPINDLE AIR BLAST) vs CN11-7 (wire216 WORK AIR BLAST) both plausible for SOL-62 (RLY-5) - no wire# for SOL-62 found to disambiguate; verify against parts list pp.85-91 before landing"
   },
   "authority_line": 112
  },
  {
   "id": "WORK_AIR_BLAST",
   "name": "Work Air Blast",
   "board": "7i84U-B",
   "connector": "TB3",
   "channel": "OUT4",
   "hal_net": "",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Air",
   "machine_subsystem": "Pneumatics",
   "status": "RESERVED",
   "field_point": "SOL-16 work air blast via RLY-6 (interposing relay for 100VAC coil)",
   "dest_connector": "CN11",
   "dest_pin": "7",
   "factory_wire": "216",
   "bbia_class": "plane",
   "designations": [
    "SOL-16",
    "RLY-6",
    "SOL-35",
    "SOL-61"
   ],
   "primary_source": "field_7i84u.hal",
   "cleanup_notes": "MMS touch-sensor air jet | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/coolant_ladder_transcription.md] | [2026-08-12 CONFLICT: the OEM head placard (dwg 24136209710) disagrees with this solenoid identity - see wiring/authority_conflicts.md section 5 and wiring/head_device_placard.md. Nothing changed here; identity must be settled BEFORE RLY-5/6/7 are wired.] | [2026-08-13 DEVICE NOT FITTED: owner confirms only two air solenoids exist on the head (415=SOL-15, 416=SOL-16) and there are no hidden ones. This row was labelled SOL-35 (dust inhole eliminate); neither SOL-35 nor SOL-61 (air jet) is on the head. SOL-61 serves the MMS touch sensor, already flagged OPTION_VERIFY. RECOMMEND NOT_USED/RESERVED - do not fit RLY-6. Owner decision. See authority_conflicts.md section 5] | [2026-08-13 REPURPOSED (owner approved): was TOUCH_SENSOR_BLAST / SOL-35. That device (MMS touch-sensor air jet, SOL-61) is NOT FITTED on this machine - only SOL-15 and SOL-16 exist on the head. This terminal is reallocated to SOL-16 WORK AIR BLAST, which IS fitted and wired (coil label 416 / CN11-7 wire 216) but previously had no authority row. RESERVED with hal_net none per the MANUAL_TOOL_CLAMP_PB precedent: real device, not yet field-verified, so deliberately HAL-unbound. Bind it once RLY-6 is fitted and the wire is confirmed.]",
   "location": "Solenoid valve bank — SOL-16 work air blast via relay RLY-6",
   "location_note": "Repurposed from TOUCH_SENSOR_BLAST 2026-08-13: SOL-35/SOL-61 are not fitted; SOL-16 is",
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "113",
     "note": "Current wiring authority row"
    },
    {
     "file": "field_7i84u.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": null,
   "authority_line": 113
  },
  {
   "id": "TAP_COOLANT_BLAST",
   "name": "Tap Coolant Blast",
   "board": "7i84U-B",
   "connector": "TB3",
   "channel": "OUT5",
   "hal_net": "",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Coolant",
   "machine_subsystem": "Coolant",
   "status": "NOT_USED",
   "field_point": "NOT USED - no tap-coolant solenoid fitted (SOL-61 is the air jet and is absent)",
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "spare",
   "designations": [
    "SOL-61"
   ],
   "primary_source": "field_7i84u.hal",
   "cleanup_notes": "[LADDER-REF 2026-08-10 (approved AG): docs/ladder/coolant_ladder_transcription.md] | [2026-08-12 CONFLICT: the OEM head placard (dwg 24136209710) disagrees with this solenoid identity - see wiring/authority_conflicts.md section 5 and wiring/head_device_placard.md. Nothing changed here; identity must be settled BEFORE RLY-5/6/7 are wired.] | [2026-08-13 DEVICE NOT FITTED: SOL-61 is not on the head and no tap-coolant solenoid has been located anywhere. TAPC remains on CN6-18 -> CNB-46, untraced. RECOMMEND NOT_USED/RESERVED - do not fit RLY-7. Owner decision. See authority_conflicts.md section 5] | [2026-08-13 APPLIED (owner approved): NOT_USED, matching how MIST_COOLANT was handled when that system was found absent. The SOL-61 tag this row carried belongs to the air jet, which is not fitted; no tap-coolant solenoid has been located anywhere. TAPC remains on CN6-18 -> CNB-46, untraced. Do not fit RLY-7.]",
   "location": "NOT USED — no tap-coolant solenoid fitted",
   "location_note": "SOL-61 is the air jet and is absent; TAPC on CN6-18 still untraced",
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "114",
     "note": "Current wiring authority row"
    },
    {
     "file": "field_7i84u.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "",
    "wire": "",
    "cn_pin": "",
    "provenance": "NOT LOCATED 2026-08-10 (CN12 lead dropped): CN12 is now fully transcribed (dwg 4143175309 p78) and confirmed 2PC/pallet-changer-only - every function label reconciled against its terminal-strip (PALLET SELECT/LOAD/UNLOAD/DOOR CLOSE/OPEN etc) is pallet-specific. SOL-61 tap-coolant is a coolant-subsystem signal, not a pallet function, so CN12 is not the right connector. Still not located anywhere - possibly a direct CB-panel landing outside BBIA-1's pass-through set, needs a different lead"
   },
   "authority_line": 114
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
   "status": "FACTORY_INTERFACE",
   "field_point": "ATC barrier expand solenoid (PLC Y095 TCME.M)",
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "exception",
   "designations": [],
   "primary_source": "element_list_crosswalk_2026-07-27",
   "cleanup_notes": "Verify device exists on SN 060231 | [RECON 2026-08-08 §A: element list confirms Y095 TCME.M 'BARRIER EXPAND at ATC AREA' on 060231] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/atc_ladder_transcription.md]",
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
     "line": 138,
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
     "line": 244,
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
     "lines": "115",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "138",
     "note": "net atc-barrier           => hm2_7i80.0.7i84.0.1.output-06  # 7i84U-B OUT6 (PLC Y095 TCME.M)"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "244",
     "note": "net atc-barrier         <= mazak-atc.atc-barrier"
    },
    {
     "file": "element_list_crosswalk_2026-07-27",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "",
    "wire": "",
    "cn_pin": "",
    "provenance": "NOT LOCATED 2026-08-10 (CN12 lead dropped): CN12 is now fully transcribed (dwg 4143175309 p78) and confirmed 2PC/pallet-changer-only - every function label reconciled against its terminal-strip (PALLET SELECT/LOAD/UNLOAD/DOOR CLOSE/OPEN etc) is pallet-specific. Y095 TCME.M barrier-expand is an ATC-area signal, not a pallet function, so CN12 is not the right connector after all. Still not located anywhere - needs a different lead (not this page/board)"
   },
   "authority_line": 115
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
   "status": "FACTORY_INTERFACE",
   "field_point": "Flood coolant valve, separate from pump motor (PLC Y011 FCL)",
   "dest_connector": "CN11",
   "dest_pin": "13",
   "factory_wire": "231",
   "bbia_class": "plane",
   "designations": [],
   "primary_source": "element_list_crosswalk_2026-07-27",
   "cleanup_notes": "SOL-31 confirmed via TB-51 diagram. Separate from OUT11 pump on 7i84U-A. | [RECON 2026-08-08 §C: Y011 FCL valve genuinely distinct from Y010 FCM motor; Y012 THC through-hole separate] | [RECON 2026-08-08 follow-up: status PROPOSED -> COMMISSIONING_PENDING per §C element-list confirm] | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/coolant_ladder_transcription.md]",
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
    "hm2_7i80.0.7i84.0.1.output-07"
   ],
   "producers": [],
   "consumers": [],
   "hal_refs": [
    {
     "file": "linuxcnc/field_7i84u.hal",
     "line": 338,
     "text": "net flood-valve        => hm2_7i80.0.7i84.0.1.output-07  # PLC Y011 FCL (SOL-31); driver TBD - candidate: follow flood-coolant net with pump",
     "commented": false,
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
     "lines": "116",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/field_7i84u.hal",
     "lines": "338",
     "note": "net flood-valve        => hm2_7i80.0.7i84.0.1.output-07  # PLC Y011 FCL (SOL-31); driver TBD - candidate: follow flood-coolant net with pump"
    },
    {
     "file": "element_list_crosswalk_2026-07-27",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": {
    "cnd_pin": "CN11-13",
    "wire": "231",
    "cn_pin": "SSR bd CN11-13",
    "provenance": "RESOLVED 2026-08-10: BBIA-1 terminal-unit CN11 pin13 = wire231 FLOOD COOLANT, matching 'flood coolant valve, separate from pump motor' (Y011 FCL) - distinct from COOLANT_ON/pump-motor at CN11-15"
   },
   "authority_line": 116
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
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "exception",
   "designations": [],
   "primary_source": "atc_orient.hal",
   "cleanup_notes": "Logical channel allocated only; trace valve identity coil voltage relay topology and safe direction before landing field wire | [LADDER-REF 2026-08-10 (approved AG): docs/ladder/atc_ladder_transcription.md]",
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
     "line": 142,
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
     "line": 235,
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
     "lines": "117",
     "note": "Current wiring authority row"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "142",
     "note": "net mag-cover-close       => hm2_7i80.0.7i84.0.1.output-08"
    },
    {
     "file": "linuxcnc/atc_orient.hal",
     "lines": "235",
     "note": "net mag-cover-close     <= mazak-atc.mag-cover-sol"
    },
    {
     "file": "atc_orient.hal",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": null,
   "authority_line": 117
  },
  {
   "id": "WORK_LIGHT",
   "name": "Work Light",
   "board": "7i84U-B",
   "connector": "TB2",
   "channel": "OUT9",
   "hal_net": "",
   "direction": "OUT",
   "direction_label": "Output (digital)",
   "subsystem": "Utility",
   "machine_subsystem": "Utility",
   "status": "RESERVED",
   "field_point": "Work light via RLY-8 (interposing relay for 100VAC coil); OEM CN6 pin 8 wire WL (wire no. 3-34)",
   "dest_connector": "OEM CN6",
   "dest_pin": "8",
   "factory_wire": "WL",
   "bbia_class": "plane",
   "designations": [
    "RLY-8"
   ],
   "primary_source": "wiring/bbia1_cn_pinouts.md",
   "cleanup_notes": "Reassigned from SEVENI84UB_OUT9_SPARE 2026-08-09 | [CONFIRM 2026-08-09: 100VAC lamp confirmed by Andy - requires interposing relay RLY-8; same topology as RLY-5/6/7 (AIR_BLAST/TOUCH_SENSOR_BLAST/TAP_COOLANT_BLAST)] | Relay coil rating and CB-panel landing point not yet verified | RESERVED 2026-08-11: hal_net set to none (no HAL binding yet) - re-assert net work-light when RLY-8 is wired | !! 100VAC LOAD: OUT9 drives the RLY-8 coil only; the lamp circuit is 100VAC - do NOT repurpose OUT9 as a low-voltage DC output while RLY-8 is landed",
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
   "epson_ferrules": [],
   "sources": [
    {
     "file": "mesa/current_pin_authority.csv",
     "lines": "118",
     "note": "Current wiring authority row"
    },
    {
     "file": "wiring/bbia1_cn_pinouts.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": null,
   "authority_line": 118
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
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "spare",
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
     "lines": "119",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": null,
   "authority_line": 119
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
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "spare",
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
     "lines": "120",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": null,
   "authority_line": 120
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
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "spare",
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
     "lines": "121",
     "note": "Current wiring authority row"
    },
    {
     "file": "mesa_firmware_checklist.md",
     "lines": "",
     "note": "primary_source column in the authority table"
    }
   ],
   "conflicts": [],
   "bb_source": null,
   "authority_line": 121
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
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "spare",
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
   "bb_source": null,
   "authority_line": 122
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
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "spare",
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
   "bb_source": null,
   "authority_line": 123
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
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "spare",
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
   "bb_source": null,
   "authority_line": 124
  },
  {
   "id": "P3_GPIO_SPARE",
   "name": "P3 Gpio Spare",
   "board": "7i80HDT",
   "connector": "P2 GPIO (bare, no daughter card)",
   "channel": "TBD_FROM_IDROM",
   "hal_net": "",
   "direction": "GPIO",
   "direction_label": "GPIO",
   "subsystem": "Spare",
   "machine_subsystem": "Spare",
   "status": "SPARE",
   "field_point": "Spare direct FPGA GPIO on P3 (all pins)",
   "dest_connector": "",
   "dest_pin": "",
   "factory_wire": "",
   "bbia_class": "spare",
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
   "bb_source": null,
   "authority_line": 125
  }
 ],
 "conflicts": [
  {
   "id": "C3",
   "title": "FR-SX command architecture resolved; polarity/scaling pending bench",
   "severity": "unverified",
   "summary": "RESOLVED (diagram, pg 127 Dwg 4143075403): FR-SX takes an unsigned 0-10 V speed magnitude (SPEED REFERENCE '10V MAX SPEED', SE1/SE2/SE3) plus discrete direction (SPINDLE FORWARD SRN / SPINDLE REVERSE SRI) - it is NOT a signed bipolar command. AOUT3 should carry an absolute-value magnitude, not signed speed-out. PENDING BENCH: exact scaling (10 V = max RPM), 0 V = zero speed, and SRN/SRI polarity/sink-source before clearing the spindle permit.",
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
   "id": "C6",
   "title": "CLEARED - HostMot2 pin-name placeholders no longer hold signals",
   "severity": "cleared",
   "summary": "CLEARED per owner (AG) 2026-08-11: per-signal holds removed - the placeholder pin-name question is a bring-up verification step (readhmid / halcmd show pin hm2 against the received 7i80hdt_rmsvss6_8.bin bitfile), not a per-signal wiring conflict, and it no longer blocks the wiring plan. The HAL-file placeholder warnings remain in force until that verification runs. Original scope: every hm2_7i80.* name (board tag, GPIO index ranges, resolver pin names, pwmgen instances, smart-serial device tag).",
   "detail": [
    "motion_7i80hdt.hal:4-7 — \"every hm2_7i80.* name below is an UNVERIFIED PLACEHOLDER... Confirm the exact board tag (hm2_7i80 expected)\"",
    "motion_7i80hdt.hal:32-33 — resolver pin names unverified",
    "motion_7i80hdt.hal:183-188 — \"The gpio.NNN INDICES BELOW ARE PLACEHOLDERS — inputs and outputs occupy separate, firmware-determined ranges... do not wire by these numbers\"",
    "motion_7i80hdt.hal:116 — pwmgen instance to axis mapping unconfirmed",
    "field_7i84u.hal:3-6 — \"Every hm2_7i80.*.7i84.* name below is an UNVERIFIED PLACEHOLDER\"",
    "mazak_vqc_20_40.hal:4-7 — board name, IP, firmware, resolver scales, drive polarity, normal states and safety wiring all unverified",
    "mazak_vqc_20_40.hal:25-26 — board_ip and config string still TODO despite 192.168.1.121 being set on line 31"
   ],
   "action": "At bring-up: run readhmid and halcmd show pin hm2 against the real firmware, then regenerate the HAL pin names. Treat every gpio.NNN in this dashboard as a label, not a landing point. (Per-signal holds cleared 2026-08-11; signals list emptied then.)",
   "signals": [],
   "sources": [
    "linuxcnc/motion_7i80hdt.hal:4-7,32-33,116,183-188",
    "linuxcnc/field_7i84u.hal:3-6",
    "linuxcnc/mazak_vqc_20_40.hal:4-7,25-26"
   ]
  },
  {
   "id": "C9",
   "title": "Magazine SOL-8A/8B assignment resolved; physical rotation pending bench",
   "severity": "unverified",
   "summary": "RESOLVED (diagram, pg 91 Dwg 4143075332 + connector_crossref.md:44-45): SOL-8A = wire 408A = MAGAZINE CCW (forward); SOL-8B = wire 408B = MAGAZINE CW (reverse). The alarm-table OCR that had them opposite was wrong. Bind ATC_FWD -> SOL-8A, ATC_REV -> SOL-8B. PENDING BENCH: verify actual magazine motion direction under controlled commissioning before promoting.",
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
   "title": "CLEARED - research-coverage gaps are scope decisions, not signal holds",
   "severity": "cleared",
   "summary": "CLEARED per owner (AG) 2026-08-11: per-signal holds removed - these were scope (retain-or-drop) decisions, not wiring conflicts, and should not hold allocated signals. Prior state: several original gaps already closed (SOL-31 flood coolant = FLOOD_VALVE; magazine cover-open located; spindle orient arrival exists; head-lube = LUBE_OK; 7i84U-B added); remaining open items (2PC pallet changer - since ruled out of scope, see CN12 characterization - and door interlocks) stay tracked in their own docs.",
   "detail": [
    "OPEN - 2PC pallet-changer set: SOL-22A/22B, SOL-24, SOL-25A/25B, SOL-82A/82B, SOL-87A/87B, PRS-98/99, PRS-92/93, RS-96/97, LS-83/84/87/88 - retain-or-drop decision (io_map_research_notes.md:106-146)",
    "OPEN - Door interlock switches LS-140/LS-141: decision + 1-2 inputs (io_map_research_notes.md:94-104)",
    "OPEN - ATC arm position sensors + tool-measure stand switches: unallocated if ATC retained (io_map_research_notes.md:287-295)",
    "OPEN - way lube (AL-54) is separate from head lube; LUBE_OK covers head only - way lube may need its own channel",
    "CLOSED since: SOL-31 flood coolant = FLOOD_VALVE; magazine cover-open located (cover-close is a trace target); spindle orientation arrival = SPINDLE_ORIENT_ARRIVAL; 7i84U-B added on channel 1"
   ],
   "action": "The current two-card allocation has 21 DI and 7 DO spare after AIR_OK and cover output. Inventory every pallet-changer device before restoring that scope; do not order a third remote from an estimate. (Per-signal holds cleared 2026-08-11; signals list emptied then.)",
   "signals": [],
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
  "Safety",
  "Spare",
  "Spindle",
  "Spindle gear",
  "Spindle safety",
  "Utility"
 ],
 "connectors": [
  "P1 Analog TB",
  "P1 Resolver channel",
  "P2 GPIO (bare, no daughter card)",
  "P3 7i44 physical channel 0",
  "P3 7i44 physical channel 1",
  "P3 7i44 physical channels 2-7",
  "TB2",
  "TB3",
  "UNASSIGNED",
  "none"
 ],
 "orphan_nets": [],
 "missing_from_hal": []
};
