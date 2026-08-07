# Curated enrichment layer for the Mazak VQC 20/40 I/O dashboard.
#
# Everything here is DERIVED FROM the retrofit repo one level up from io-dashboard/.
# Nothing here invents a pin assignment. Where the repo does not state a value,
# the value below is explicitly "Unknown - measure/verify".
#
# Source keys used in `basis` strings are file:line references relative to the repo root.

# ---------------------------------------------------------------------------
# Status registry. Order = severity/sort order in the UI.
# ---------------------------------------------------------------------------
STATUS = {
    "PROPOSED": {
        "label": "Proposed \u2014 from element-list cross-walk",
        "tone": "reserved",
        "order": 3,
        "blurb": "Drafted from the YM2V39L element-list cross-walk (2026-07-27). "
                 "Assignment is a proposal only; verify the device, ladder behavior, "
                 "and FR-SX/relay terminals before accepting into the wiring plan.",
        "safe_to_energize": "Not accepted. Do not wire.",
    },
    "FIELD_VERIFIED": {
        "label": "Field verified",
        "tone": "verified",
        "order": 0,
        "blurb": "Measured in the cabinet and signed off. No rows currently qualify.",
        "safe_to_energize": "Verified per repo records.",
    },
    "ACCEPTED": {
        "label": "Accepted \u2014 verify continuity",
        "tone": "accepted",
        "order": 1,
        "blurb": "Assignment accepted by current_pin_authority.csv. Still ring out continuity "
                 "before power.",
        "safe_to_energize": "Not measured. Verify continuity before power.",
    },
    "CONFIG_ONLY": {
        "label": "In HAL only \u2014 no authority row",
        "tone": "conflict",
        "order": 5,
        "blurb": "This net exists in the HAL config but has no row in current_pin_authority.csv. "
                 "It traces back to the stale mesa/signal_map.csv layout. Not a wiring instruction.",
        "safe_to_energize": "BLOCKED. No authority row exists for this channel.",
    },
    "ACCEPTED_VERIFY": {
        "label": "Accepted \u2014 verify in cabinet",
        "tone": "accepted",
        "order": 1,
        "blurb": "Pin assignment is accepted by current_pin_authority.csv but has NOT been "
                 "measured on the machine. Ring out before landing a wire.",
        "safe_to_energize": "Not verified. Do not assume the landing point is correct.",
    },
    "RESERVED_VERIFY": {
        "label": "Reserved \u2014 verify",
        "tone": "reserved",
        "order": 2,
        "blurb": "Channel is held for a named future use. Hardware not identified yet.",
        "safe_to_energize": "Not verified. Do not wire.",
    },
    "OPTIONAL_VERIFY": {
        "label": "Optional \u2014 verify",
        "tone": "reserved",
        "order": 3,
        "blurb": "Optional panel/utility reuse. Only wire if the original device is retained.",
        "safe_to_energize": "Not verified. Do not wire.",
    },
    "COMMISSIONING_PENDING": {
        "label": "Commissioning pending",
        "tone": "pending",
        "order": 4,
        "blurb": "Planned assignment awaiting cabinet tracing, polarity confirmation, or "
                 "load measurement.",
        "safe_to_energize": "NOT commissioned. Do not energize this circuit.",
    },
    "HOLD_CONFLICT": {
        "label": "Conflict \u2014 hold, do not wire",
        "tone": "conflict",
        "order": 5,
        "blurb": "Sources disagree about this circuit. Blocked until the conflict register "
                 "and a cabinet trace resolve it.",
        "safe_to_energize": "BLOCKED. Do not wire and do not energize.",
    },
    "HOLD_NOT_ORDERED": {
        "label": "Hold \u2014 hardware not ordered",
        "tone": "conflict",
        "order": 6,
        "blurb": "Expansion item deliberately not purchased yet.",
        "safe_to_energize": "No hardware present.",
    },
    "SPARE": {
        "label": "Spare \u2014 unassigned",
        "tone": "spare",
        "order": 7,
        "blurb": "Deliberately kept free. No field wiring planned.",
        "safe_to_energize": "Unassigned. Leave unlanded.",
    },
    "NOT_USED": {
        "label": "Not used",
        "tone": "notused",
        "order": 8,
        "blurb": "Architecturally excluded on this machine.",
        "safe_to_energize": "Not part of the retrofit.",
    },
}

DIRECTION_LABEL = {
    "IN": "Input (digital)",
    "OUT": "Output (digital)",
    "ANALOG_OUT": "Output (analog)",
    "RESOLVER_IN": "Input (resolver)",
    "ENCODER_IN": "Input (encoder)",
    "LINK": "Link (smart-serial)",
    "POWER": "Power / common",
    "REVIEW": "Review item",
}

# ---------------------------------------------------------------------------
# Expected normal / idle state.
#
# Only signals with explicit repo evidence get a concrete value. Everything
# else is "Unknown - measure/verify".
# ---------------------------------------------------------------------------
NC_LIMIT_BASIS = (
    "motion_7i80hdt.hal:197-204 \u2014 \"Limit switches are NC: invert_input so open (tripped) "
    "= logic 1\"; setp hm2_7i80.0.gpio.0NN.invert_input 1"
)
NO_HOME_BASIS = (
    "motion_7i80hdt.hal:198 \u2014 \"Home switches are NO: no invert needed\"; "
    "no invert_input setp for gpio.014-016"
)

EXPECTED = {
    # --- NC limit inputs, inverted in HAL -> logical 0 when not tripped ------
    "X_LIMIT_PLUS":  ("0", "Logic 0 \u2014 switch closed (not tripped), inverted in HAL", NC_LIMIT_BASIS, "evidenced"),
    "X_LIMIT_MINUS": ("0", "Logic 0 \u2014 switch closed (not tripped), inverted in HAL", NC_LIMIT_BASIS, "evidenced"),
    "Y_LIMIT_PLUS":  ("0", "Logic 0 \u2014 switch closed (not tripped), inverted in HAL", NC_LIMIT_BASIS, "evidenced"),
    "Y_LIMIT_MINUS": ("0", "Logic 0 \u2014 switch closed (not tripped), inverted in HAL", NC_LIMIT_BASIS, "evidenced"),
    "Z_LIMIT_PLUS":  ("0", "Logic 0 \u2014 switch closed (not tripped), inverted in HAL", NC_LIMIT_BASIS, "evidenced"),
    "Z_LIMIT_MINUS": ("0", "Logic 0 \u2014 switch closed (not tripped), inverted in HAL", NC_LIMIT_BASIS, "evidenced"),
    # --- NO home inputs, no inversion -> logical 0 off target ---------------
    "X_HOME": ("0", "Logic 0 \u2014 NO switch, carriage off the home target", NO_HOME_BASIS, "evidenced"),
    "Y_HOME": ("0", "Logic 0 \u2014 NO switch, carriage off the home target", NO_HOME_BASIS, "evidenced"),
    "Z_HOME": ("0", "Logic 0 \u2014 NO switch, carriage off the home target", NO_HOME_BASIS, "evidenced"),
    # --- E-stop monitor ------------------------------------------------------
    "ESTOP_CHAIN": (
        "0",
        "Logic 0 \u2014 safety chain closed / healthy, after inversion",
        "motion_7i80hdt.hal:239-245 \u2014 \"invert_input=1: chain closed (24V, normal) \u2192 in=0; "
        "chain open (fault) \u2192 in=1\"; net estop-ext \u2192 estop-latch.0.fault-in",
        "evidenced",
    ),
    # --- Analog commands -----------------------------------------------------
    "X_AXIS_CMD": ("0 V", "0 V idle \u2014 pwmgen.00 parked until enabled and commanded",
                   "motion_7i80hdt.hal:114 \u2014 \"The pwmgen .enable pin MUST be true or the output "
                   "stays parked at zero\"; 119-128 output-type 4, scale 10", "evidenced"),
    "Y_AXIS_CMD": ("0 V", "0 V idle \u2014 pwmgen.02 parked until enabled and commanded",
                   "motion_7i80hdt.hal:114, 127-128, 148-149", "evidenced"),
    "Z_AXIS_CMD": ("0 V", "0 V idle \u2014 pwmgen.01 parked until enabled and commanded",
                   "motion_7i80hdt.hal:114, 125-126, 157-158", "evidenced"),
    "SPINDLE_SPEED_CMD": (
        "0 V",
        "0 V idle \u2014 unipolar reference, offset-mode 0, zero speed command",
        "motion_7i80hdt.hal:162-166 \u2014 offset-mode 0 (0 V at zero command), scale 10. "
        "0-10 V vs bipolar still to be confirmed against the FR-SX.",
        "evidenced",
    ),
    # --- Drive enables -------------------------------------------------------
    "X_DRIVE_ENABLE": ("0", "0 / de-energized \u2014 amp-enable-out false until machine is on",
                       "motion_7i80hdt.hal:256-257 net x-enable \u2190 joint.0.amp-enable-out", "evidenced"),
    "Y_DRIVE_ENABLE": ("0", "0 / de-energized \u2014 amp-enable-out false until machine is on",
                       "motion_7i80hdt.hal:259-260", "evidenced"),
    "Z_DRIVE_ENABLE": ("0", "0 / de-energized \u2014 amp-enable-out false until machine is on",
                       "motion_7i80hdt.hal:262-263", "evidenced"),
    # --- Resolvers -----------------------------------------------------------
    "X_RESOLVER": ("Dynamic", "Dynamic position value \u2014 validity to be verified on commissioning",
                   "motion_7i80hdt.hal:35-39 pre-power ohmmeter checks; 42-44 scale placeholders; "
                   "current_pin_authority.csv:2 COMMISSIONING_PENDING", "dynamic"),
    "Y_RESOLVER": ("Dynamic", "Dynamic position value \u2014 validity to be verified on commissioning",
                   "motion_7i80hdt.hal:35-39, 43; current_pin_authority.csv:3", "dynamic"),
    "Z_RESOLVER": ("Dynamic", "Dynamic position value \u2014 validity to be verified on commissioning",
                   "motion_7i80hdt.hal:35-39, 44; current_pin_authority.csv:4", "dynamic"),
    "SPINDLE_ENCODER_RESERVED": (
        "Dynamic",
        "Dynamic once fitted \u2014 encoder not identified, channel reserved",
        "motion_7i80hdt.hal:88-99 \u2014 spindle encoder part number not yet confirmed; "
        "resolver.03 explicitly NOT used for spindle",
        "dynamic",
    ),
    # --- Drive faults: polarity unknown --------------------------------------
    "X_DRIVE_FAULT": ("Unknown", "Unknown \u2014 polarity not confirmed; inversion not commissioned",
                      "field_7i84u.hal:28-33 \u2014 \"confirm input polarity before enabling... "
                      "set invert_input 1 on these channels once wired\"", "unknown-polarity"),
    "Y_DRIVE_FAULT": ("Unknown", "Unknown \u2014 polarity not confirmed; inversion not commissioned",
                      "field_7i84u.hal:28-33", "unknown-polarity"),
    "Z_DRIVE_FAULT": ("Unknown", "Unknown \u2014 polarity not confirmed; inversion not commissioned",
                      "field_7i84u.hal:28-33", "unknown-polarity"),
    "SPINDLE_FAULT": ("Unknown", "Unknown \u2014 VFD fault terminal and polarity not confirmed",
                      "current_pin_authority.csv:57 \u2014 \"Confirm VFD terminal and polarity\"", "unknown-polarity"),
    "SERVO_READY": ("Unknown", "Unknown \u2014 relay contact form not confirmed",
                    "current_pin_authority.csv:74 \u2014 \"Wire before first motion if available\"", "unknown"),
    # --- Spindle at speed: HAL currently forces it ---------------------------
    "SPINDLE_AT_SPEED": (
        "Forced 1",
        "HAL currently forces this net TRUE \u2014 field input not read",
        "motion_7i80hdt.hal:102-103 \u2014 \"Until encoder is wired, spindle-at-speed is forced true "
        "(open-loop, no speed verification)\": sets spindle-at-speed true. "
        "current_pin_authority.csv:56 allocates a real 7i84U IN13 for it.",
        "conflict",
    ),
    # --- Field power / smart-serial link ------------------------------------
    "TB5_FIELD_GND": ("n/a", "Power common \u2014 not a logic signal", "current_pin_authority.csv:33", "na"),
    "TB5_FIELD_24V": ("24 V", "Field supply rail \u2014 confirm capacity and fusing",
                      "current_pin_authority.csv:34", "na"),
    "SEVENI84U_FIELD_A_24V": ("24 V", "Field bank A supply (outputs 0-7, inputs 0-15)",
                              "current_pin_authority.csv:41", "na"),
    "SEVENI84U_FIELD_B_24V": ("24 V", "Field bank B supply (outputs 8-15, inputs 16-31)",
                              "current_pin_authority.csv:42", "na"),
}

# Generic fallbacks by direction when the signal is not in EXPECTED.
GENERIC_EXPECTED = {
    "OUT": ("0", "0 / de-energized \u2014 output idle unless commanded",
            "No commanding logic in the active HAL for this net; outputs default off.", "default-off"),
    "ANALOG_OUT": ("0 V", "0 V idle \u2014 analog command at rest",
                   "Analog outputs park at zero until enabled and commanded.", "default-off"),
    "LINK": ("n/a", "RS-422 smart-serial link \u2014 not a logic state",
             "current_pin_authority.csv smart-serial rows", "na"),
    "POWER": ("n/a", "Power / common \u2014 not a logic state", "current_pin_authority.csv", "na"),
    "REVIEW": ("n/a", "Review item \u2014 no hardware", "current_pin_authority.csv:91", "na"),
}
SPARE_EXPECTED = ("0", "0 \u2014 spare channel, no field wiring", "Marked SPARE in current_pin_authority.csv", "default-off")
UNKNOWN_EXPECTED = ("Unknown", "Unknown \u2014 measure/verify",
                    "No explicit normal-state evidence in the repo for this signal.", "unknown")

# ---------------------------------------------------------------------------
# Machine-side landing: physical location + designation notes.
# Sourced from wiring/connector_crossref.md and wiring/io_map_research_notes.md.
# ---------------------------------------------------------------------------
LOCATION = {
    "X_RESOLVER": ("X ball screw, non-drive end \u2014 Tamagawa TS2014N shaft resolver on flex coupling",
                   "Axis feedback", "BKO-NC6062A; via BBIA-1 CNA1 \"TO RESOLVER MACHINE SIDE\""),
    "Y_RESOLVER": ("Y ball screw, non-drive end \u2014 Tamagawa TS2014N shaft resolver on flex coupling",
                   "Axis feedback", "BKO-NC6062A; via BBIA-1 CNA1"),
    "Z_RESOLVER": ("Z ball screw, non-drive end \u2014 Tamagawa TS2014N shaft resolver on flex coupling",
                   "Axis feedback", "BKO-NC6062A; Z amp cable CA1 / BBIA-1 CN3"),
    "SPINDLE_ENCODER_RESERVED": ("Spindle head \u2014 machine-side A/B/Z encoder if fitted",
                                 "Spindle feedback", "Part number not confirmed. Tacho TGF-3D P402-Sx feeds the FR-SX loop, not LinuxCNC."),
    "TB2_AXIS_ENCODERS": ("Control cabinet \u2014 legacy 7i97T TB2 encoder inputs, unused (feedback comes through 7i49 P2 resolver channels)",
                          "Axis feedback", "Architecturally excluded: feedback is resolver via 7i49."),
    "X_DRIVE_ENABLE": ("Servo bay \u2014 X TRA-series servo amp, S-ON terminal", "Servo drives", "X/Y amp path via CA3/CA4 (BBIA-1 CN1/CN2)"),
    "Y_DRIVE_ENABLE": ("Servo bay \u2014 Y TRA-series servo amp, S-ON terminal", "Servo drives", "X/Y amp path via CA3/CA4"),
    "Z_DRIVE_ENABLE": ("Servo bay \u2014 Z TRA-series servo amp, S-ON terminal", "Servo drives", "Z amp path via CA1 (BBIA-1 CN3)"),
    "X_AXIS_CMD": ("Servo bay \u2014 X servo amp analog command input", "Servo drives", "Verify velocity vs torque input and polarity before enabling"),
    "Y_AXIS_CMD": ("Servo bay \u2014 Y servo amp analog command input", "Servo drives", "Verify velocity vs torque input and polarity before enabling"),
    "Z_AXIS_CMD": ("Servo bay \u2014 Z servo amp analog command input", "Servo drives", "Verify velocity vs torque input and polarity before enabling"),
    "SPINDLE_TB3_ENABLE_CANDIDATE": ("Spindle/servo bay \u2014 Mitsubishi FR-SX, SX-IO1 board (CON1/CONA)",
                                     "Spindle drive", "Conflicts with the 7i84U FWD/REV/ENA plan"),
    "SPINDLE_SPEED_CMD": ("Spindle/servo bay \u2014 FR-SX V-IN speed reference terminal", "Spindle drive",
                          "FR-SX drawing 4143075403, PDF pg 127 of 41434WB.pdf"),
    "X_LIMIT_PLUS": ("X axis way \u2014 positive overtravel switch", "Axis overtravel", "OT+X"),
    "X_LIMIT_MINUS": ("X axis way \u2014 negative overtravel switch", "Axis overtravel", "OT-X"),
    "Y_LIMIT_PLUS": ("Y axis way \u2014 positive overtravel switch", "Axis overtravel", "OT+Y"),
    "Y_LIMIT_MINUS": ("Y axis way \u2014 negative overtravel switch", "Axis overtravel", "OT-Y"),
    "Z_LIMIT_PLUS": ("Z axis way \u2014 positive overtravel switch", "Axis overtravel", "OT+Z"),
    "Z_LIMIT_MINUS": ("Z axis way \u2014 negative overtravel switch", "Axis overtravel", "OT-Z"),
    "X_HOME": ("X axis \u2014 zero-return switch", "Axis homing", "LS-42 (axis 1 zero return; which axis still to be cross-referenced)"),
    "Y_HOME": ("Y axis \u2014 zero-return switch", "Axis homing", "LS-52 (axis 2 zero return; which axis still to be cross-referenced)"),
    "Z_HOME": ("Z axis \u2014 zero-return switch", "Axis homing", "LS-62 \u2014 confirmed as Z zero return on the TB-51 diagram (pg 100)"),
    "ESTOP_CHAIN": ("Hardwired E-stop relay chain \u2014 status contact only", "Safety chain",
                    "Operating Panel A & B E-stop pushbuttons (AH25-P182A); DS-1/DS-2 door relay sits ahead of the main contactor"),
    "TB5_FIELD_GND": ("Control cabinet \u2014 G24 common bus", "Field power", "HR-11F-24 supply: +S / + / - / -S / TOG / CNT / FG"),
    "TB5_FIELD_24V": ("Control cabinet \u2014 P24 distribution", "Field power", "HR-11F-24 supply and branch fusing to trace"),
    "AIR_BLAST": ("Solenoid valve bank \u2014 SOL-62 via relay RLY-5", "Pneumatics", "100 VAC coil \u2014 relay required"),
    "TOUCH_SENSOR_BLAST": ("Solenoid valve bank \u2014 SOL-35 via relay RLY-6", "Pneumatics",
                           "SOL-35 = \"Dust Inhale Eliminate\" per connector_crossref.md:52 / TB-51 diagram"),
    "TAP_COOLANT_BLAST": ("Solenoid valve bank \u2014 SOL-61 via relay RLY-7", "Coolant", "SOL-61 = Air jet on the TB-51 diagram"),
    "SEVENI84U_FIELD_A_24V": ("Field I/O enclosure \u2014 near the original green breakout PCB", "Field power", ""),
    "SEVENI84U_FIELD_B_24V": ("Field I/O enclosure \u2014 near the original green breakout PCB", "Field power", ""),
    "ATC_ZONE_Y": ("Y axis \u2014 tool-change zone prox", "ATC", "PRS-55. Switch may not physically exist \u2014 confirm."),
    "ATC_ZONE_Z": ("Z axis \u2014 tool-change zone prox", "ATC", "PRS-66. Switch may not physically exist \u2014 confirm."),
    "MAG_TOOL_AVAILABLE": ("Tool magazine \u2014 tool-available photo sensor", "ATC magazine",
                           "PHS-181. Alarm table shows PHS-127 \"magazine detector OFF\" \u2014 may be the same sensor described two ways."),
    "SPINDLE_TOOL_AVAILABLE": ("Spindle \u2014 tool-present photo sensor", "ATC",
                               "PHS-182. Alarm table shows PHS-132 \"spindle tool detector off\" \u2014 same ambiguity."),
    "X_DRIVE_FAULT": ("Servo bay \u2014 X drive ALM relay contact", "Servo drives",
                      "Mitsubishi HD81/HD101 ALM is open-collector active-low"),
    "Y_DRIVE_FAULT": ("Servo bay \u2014 Y drive ALM relay contact", "Servo drives", "See field_7i84u.hal:28-33 polarity caution"),
    "Z_DRIVE_FAULT": ("Servo bay \u2014 Z drive ALM relay contact", "Servo drives", "See field_7i84u.hal:28-33 polarity caution"),
    "SPINDLE_AT_SPEED": ("Spindle/servo bay \u2014 FR-SX speed-reach output terminal", "Spindle drive", ""),
    "SPINDLE_FAULT": ("Spindle/servo bay \u2014 FR-SX fault output terminal", "Spindle drive", ""),
    "TOOL_CLAMP_CONF": ("Spindle head \u2014 tool clamp confirm prox", "ATC", "PRS-9"),
    "TOOL_UNCLAMP_CONF": ("Spindle head \u2014 tool unclamp confirm prox", "ATC", "PRS-8 (mnemonic TUCPRS, bit X77 / LH03-1)"),
    "GEAR_HI_CONF": ("Spindle gearbox \u2014 high gear confirm prox", "Spindle gearbox",
                     "PRS-10 (mnemonic HGPRS, bit X58 / LH0B-0)"),
    "GEAR_LO_CONF": ("Spindle gearbox \u2014 low gear confirm prox", "Spindle gearbox",
                     "PRS-12 per authority; alarm table says PRS-2 (LGPRS, X5F/LH0B-1); TB-51 diagram says PRS-10. Three sources disagree."),
    "MAG_BCD_BIT0": ("Tool magazine \u2014 binary tool-code prox", "ATC magazine", "PRS-21"),
    "MAG_BCD_BIT1": ("Tool magazine \u2014 binary tool-code prox", "ATC magazine", "PRS-22"),
    "MAG_BCD_BIT2": ("Tool magazine \u2014 binary tool-code prox", "ATC magazine", "PRS-23"),
    "MAG_BCD_BIT3": ("Tool magazine \u2014 binary tool-code prox", "ATC magazine", "PRS-24 (also labelled \"magazine position 8\")"),
    "MAG_BCD_BIT4": ("Tool magazine \u2014 binary tool-code prox", "ATC magazine",
                     "PRS-25 (labelled \"magazine position 10\" \u2014 does not fit a clean binary weight; possible OCR misread)"),
    "DOOR_INTERLOCK": ("Machine door \u2014 interlock switch", "Safety chain",
                       "LS-141 (P24-341); LS-140 (P24-340, 2PC option). DS-1/DS-2 feed a relay ahead of the main contactor."),
    "LUBE_LEVEL": ("Lube pump station \u2014 level/pressure switch", "Lubrication",
                   "PS-5 head lube pressure exists separately. Alarm table shows two lube systems (AL-54 way, AL-56 head)."),
    "COOLANT_LEVEL": ("Coolant tank \u2014 level switch", "Coolant", ""),
    "HYD_PRESS_OK": ("Hydraulic power unit \u2014 Sanwa SPS-8T-PC-20 pressure switch", "Hydraulics",
                     "Supersedes the stale signal_map.csv TB5 IN16 row"),
    "CYCLE_START_PB": ("Operating panel A/B \u2014 cycle start pushbutton", "Operator panel", ""),
    "FEED_HOLD_PB": ("Operating panel A/B \u2014 feed hold pushbutton", "Operator panel", ""),
    "SINGLE_BLOCK_SW": ("Operating panel A/B \u2014 single block selector", "Operator panel", ""),
    "SERVO_READY": ("Servo bay \u2014 drives-ready relay contact", "Servo drives", ""),
    "SPINDLE_FWD": ("Spindle/servo bay \u2014 FR-SX forward input", "Spindle drive", "SX-IO1 board CON1/CONA"),
    "SPINDLE_REV": ("Spindle/servo bay \u2014 FR-SX reverse input", "Spindle drive", "SX-IO1 board CON1/CONA"),
    "SPINDLE_ENA": ("Spindle/servo bay \u2014 FR-SX enable input", "Spindle drive", "SX-IO1 board CON1/CONA"),
    "Z_BRAKE_REL": ("Z axis \u2014 N1J-L2-201 brake release coil", "Servo drives", "Needs flyback/suppression"),
    "GEAR_HI_SOL": ("Spindle gearbox \u2014 Fujikoshi hydraulic valve, via RLY-1", "Spindle gearbox",
                    "Authority: SOL-13 = high. connector_crossref.md:47 reads wire 413 as \"SOL-13 \u2014 Gear Shift Low\"."),
    "GEAR_LO_SOL": ("Spindle gearbox \u2014 Fujikoshi hydraulic valve, via RLY-2", "Spindle gearbox",
                    "Authority: SOL-12 = low. connector_crossref.md omits SOL-12 entirely; io_map_research_notes.md:54 calls SOL-12 high."),
    "TOOL_CLAMP_SOL": ("Spindle head \u2014 Fujikoshi hydraulic valve SOL-10, via RLY-3", "ATC",
                       "connector_crossref.md:46 identifies SOL-10 as tool UNCLAMP. Single- vs dual-coil unresolved."),
    "TOOL_UNCLAMP_SOL": ("Spindle head \u2014 Fujikoshi hydraulic valve SOL-10, via RLY-4", "ATC",
                         "Wire tag 410D/410, pg 75 TB505 table + pg 90"),
    "COOLANT_ON": ("Coolant pump \u2014 contactor / SOL-31 flood valve", "Coolant",
                   "SOL-31 confirmed on the TB-51 diagram (pg 100). Motor circuit is CB-4 + CMS overload (OL-CM4A), 350 W 4-pole."),
    "LUBE_ON": ("Lube pump \u2014 motor contactor", "Lubrication",
                "Alarm table shows TWO lube systems (head AL-56, way AL-54); the authority has one generic output."),
    "ATC_FWD": ("ATC magazine \u2014 motor forward relay", "ATC magazine",
                "SOL-8A/8B (CW/CCW) are NOT yet assigned to a Mesa output; do not treat these generic rows as equivalent."),
    "ATC_REV": ("ATC magazine \u2014 motor reverse relay", "ATC magazine",
                "SOL-8A/8B direction mapping unresolved (crossref says 8A=CCW/forward, alarm-table OCR says 8A=CW)."),
    "ALARM_OUT": ("Operating panel \u2014 alarm light or horn", "Operator panel", ""),
    "SECOND_SSERIAL_CARD": ("Retired 2026-08-03", "Expansion", "Not required. Single-7i84U plan committed 2026-08-03: drops (Y091 OTR, X078 MPWS, X02F INHRLS, Y023-Y025 M43-M45T) + series consolidations (HLP+HLP2, THR+ONT, ITMDSS+LS-140/141) + panel moves (FEED_HOLD/SINGLE_BLOCK to touchscreen, panel-power-on to software state, reset-out to TB5 SSR) fit 5 DI + 5 DO of gap load into 6 DI + 6 DO available."),
}

SSERIAL_LOC = ("Control cabinet \u2014 7i80HDT P1 (7i44 port 0) to 7i84U RJ45 (RS-422 smart-serial)", "Field I/O link",
               "Use absolute 7i44 port 0 pin numbers. Shield drain at the 7i80HDT / 7i44 end only.")
for _k in ("SSERIAL_GND_A", "SSERIAL_GND_B", "SSERIAL_RX_PLUS", "SSERIAL_RX_MINUS",
           "SSERIAL_TX_PLUS", "SSERIAL_TX_MINUS", "SSERIAL_5V_A", "SSERIAL_5V_B"):
    LOCATION[_k] = SSERIAL_LOC

SPARE_LOC = {
    "TB5_SSR_OUT3_SPARE": ("Control cabinet \u2014 7i80HDT P3 7i37TA OUT bank (gpio.054), historical TB5 SSR3", "Spare", "Now on P3 7i37TA OUT6 via interposing relay if driven"),
    "TB5_SSR_OUT4_SPARE": ("Control cabinet \u2014 7i80HDT P3 7i37TA OUT bank (gpio.055), historical TB5 SSR4", "Spare", "Now on P3 7i37TA OUT7 via interposing relay if driven"),
    "TB5_SSR_OUT5_SPARE": ("Control cabinet \u2014 7i80HDT P3 7i37TA OUT bank (gpio.056), historical TB5 SSR5", "Spare", "Now on P3 7i37TA OUT8 via interposing relay if driven"),
}
LOCATION.update(SPARE_LOC)
for i in range(4, 10):
    LOCATION["SEVENI84U_IN%d_SPARE" % i] = ("Field I/O enclosure \u2014 7i84U TB1, unlanded", "Spare", "")
for i in range(3, 6):
    LOCATION["SEVENI84U_OUT%d_SPARE" % i] = ("Field I/O enclosure \u2014 7i84U TB2, unlanded", "Spare",
                                             "Drive S-ON is handled by the P3 7i37TA OUT0-2 (gpio.048/049/050).")

# ---------------------------------------------------------------------------
# Conflict register. Each entry links to the signal rows it affects.
# ---------------------------------------------------------------------------
CONFLICTS = [
    {
        "id": "C1",
        "title": "7i84U input allocation: field_7i84u.hal disagrees with the pin authority",
        "severity": "conflict",
        "summary": "Seven active input nets in field_7i84u.hal are wired to different 7i84U channels "
                   "than current_pin_authority.csv assigns. The authority wins; the HAL file has not "
                   "been updated yet.",
        "detail": [
            "tool-clamped: HAL input-00 (field_7i84u.hal:12) vs authority IN15 (current_pin_authority.csv:58)",
            "tool-unclamped: HAL input-01 (field_7i84u.hal:13) vs authority IN16 (current_pin_authority.csv:59)",
            "atc-y-zone: HAL input-02 (field_7i84u.hal:15) vs authority IN0 (current_pin_authority.csv:43)",
            "atc-z-zone: HAL input-03 (field_7i84u.hal:16) vs authority IN1 (current_pin_authority.csv:44)",
            "x-drive-fault: HAL input-12 (field_7i84u.hal:34) vs authority IN10 (current_pin_authority.csv:53)",
            "y-drive-fault: HAL input-13 (field_7i84u.hal:36) vs authority IN11 (current_pin_authority.csv:54)",
            "z-drive-fault: HAL input-14 (field_7i84u.hal:38) vs authority IN12 (current_pin_authority.csv:55)",
            "HAL nets with no authority row at all: mag-in-pos (in-04), tool-code-0..4 (in-05..09), "
            "coolant-low (in-10), air-ok (in-11). These trace back to the stale mesa/signal_map.csv.",
        ],
        "action": "Re-issue field_7i84u.hal from current_pin_authority.csv before loading HAL against "
                  "live field wiring. Until then the HAL channel numbers must not be used to land wires.",
        "signals": ["TOOL_CLAMP_CONF", "TOOL_UNCLAMP_CONF", "ATC_ZONE_Y", "ATC_ZONE_Z",
                    "X_DRIVE_FAULT", "Y_DRIVE_FAULT", "Z_DRIVE_FAULT"],
        "sources": ["linuxcnc/field_7i84u.hal:12-39", "mesa/current_pin_authority.csv:43-59"],
    },
    {
        "id": "C2",
        "title": "7i84U output allocation: field_7i84u.hal disagrees with the pin authority",
        "severity": "conflict",
        "summary": "The active output block in field_7i84u.hal drives eleven outputs that mostly do not "
                   "exist in the authority table, while most authority outputs are commented out or absent.",
        "detail": [
            "tool-unclamp-sol: HAL output-00 (field_7i84u.hal:66) vs authority OUT10 (current_pin_authority.csv:85)",
            "flood-coolant: HAL output-05 (field_7i84u.hal:74) vs authority OUT11 (current_pin_authority.csv:86)",
            "HAL-only outputs with no authority row: mag-cw-sol (out-01), mag-ccw-sol (out-02), "
            "mag-cover-open (out-03), mag-cover-close (out-04), mist-coolant (out-06), air-blast-1 (out-07), "
            "air-blast-2 (out-08), tap-coolant (out-09), work-light (out-10)",
            "Authority outputs with no active HAL net: spindle-fwd/rev/ena (OUT0-2, commented at "
            "field_7i84u.hal:85-90), z-brake-rel (OUT6), gear-hi-sol (OUT7), gear-lo-sol (OUT8), "
            "tool-clamp-sol (OUT9), lube-on (OUT12), atc-fwd (OUT13), atc-rev (OUT14), alarm-out (OUT15)",
        ],
        "action": "Do not energize any 7i84U output until the HAL output block is regenerated from the "
                  "authority table and each load is traced and measured.",
        "signals": ["TOOL_UNCLAMP_SOL", "COOLANT_ON", "SPINDLE_FWD", "SPINDLE_REV", "SPINDLE_ENA",
                    "Z_BRAKE_REL", "GEAR_HI_SOL", "GEAR_LO_SOL", "TOOL_CLAMP_SOL", "LUBE_ON",
                    "ATC_FWD", "ATC_REV", "ALARM_OUT"],
        "sources": ["linuxcnc/field_7i84u.hal:66-94", "mesa/current_pin_authority.csv:75-90"],
    },
    {
        "id": "C3",
        "title": "Spindle control: 7i49 AOUT3 velocity vs 7i84U FWD/REV/ENA",
        "severity": "conflict",
        "summary": "Two mutually exclusive plans exist for commanding the FR-SX. The authority marks the "
                   "TB3 candidate HOLD_CONFLICT while also listing three 7i84U outputs for the same job.",
        "detail": [
            "SPINDLE_LEGACY_ENABLE_CANDIDATE (historical 7i97T path): TB3.13/TB3.14 ENA3\u00b1, net spindle-enable, "
            "HOLD_CONFLICT (current_pin_authority.csv:13)",
            "motion_7i80hdt.hal:265 nets spindle-enable from spindle.0.on and line 177 also uses it to "
            "gate pwmgen.03.enable, so the net is already live in the analog path",
            "motion_7i80hdt.hal:266 comment says \"Spindle enable/dir routed via 7i84U sserial\"",
            "field_7i84u.hal:85-90 has spindle-fwd/rev/enable to 7i84U output-11/12/13 \u2014 all commented out",
            "The authority instead places SPINDLE_FWD/REV/ENA on 7i84U TB2 OUT0/OUT1/OUT2 "
            "(current_pin_authority.csv:75-77), which does not match the commented HAL channel numbers either",
        ],
        "action": "Pick one control path. Confirm the FR-SX terminal set (2-wire vs 3-wire, sink vs source) "
                  "before wiring either. Note that spindle-enable currently doubles as the pwmgen enable.",
        "signals": ["SPINDLE_TB3_ENABLE_CANDIDATE", "SPINDLE_FWD", "SPINDLE_REV", "SPINDLE_ENA",
                    "SPINDLE_SPEED_CMD"],
        "sources": ["mesa/current_pin_authority.csv:13,75-77", "linuxcnc/motion_7i80hdt.hal:177,265-266",
                    "linuxcnc/field_7i84u.hal:84-90"],
    },
    {
        "id": "C4",
        "title": "Gear low: SOL-12 vs SOL-13 identity, and the gear-confirm prox",
        "severity": "conflict",
        "summary": "Three documents disagree about which solenoid is low gear, and three disagree about "
                   "which prox confirms low gear. GEAR_LO_SOL is held.",
        "detail": [
            "Authority: OUT7 gear-hi-sol = SOL-13 (RLY-1), OUT8 gear-lo-sol = SOL-12 (RLY-2) "
            "(current_pin_authority.csv:82-83)",
            "connector_crossref.md:47 reads cabinet wire tag 413 as \"SOL-13 \u2014 Gear Shift Low\" "
            "and never mentions SOL-12",
            "io_map_research_notes.md:54-55 reads the TB-51 diagram (pg 100) as SOL-12 = high, SOL-13 = low",
            "Gear confirm prox: authority says PRS-10 high / PRS-12 low; the alarm table OCR says "
            "PRS-10 high (HGPRS) / PRS-2 low (LGPRS); the TB-51 diagram says PRS-9 high / PRS-10 low "
            "and calls PRS-12 \"2nd Z over-travel\" (io_map_research_notes.md:78-86)",
            "authority_conflicts.md:7-15 requires tracing both coil wire tags from RC3A and updating both "
            "rows together",
        ],
        "action": "Trace both gear coils from the RC3A board, identify the valve ports, measure coil "
                  "voltage/current, and visually check the original diagram for the confirm prox. "
                  "Update both solenoid rows and both prox rows in one change.",
        "signals": ["GEAR_LO_SOL", "GEAR_HI_SOL", "GEAR_LO_CONF", "GEAR_HI_CONF"],
        "sources": ["mesa/current_pin_authority.csv:82-83,60-61", "wiring/connector_crossref.md:47",
                    "wiring/io_map_research_notes.md:54-55,78-86", "wiring/authority_conflicts.md:7-15"],
    },
    {
        "id": "C5",
        "title": "Tool clamp/unclamp valve: SOL-10 claimed by two outputs",
        "severity": "conflict",
        "summary": "TB2 OUT9 and OUT10 both land on SOL-10. Valve topology (single-coil vs dual-coil) "
                   "is unresolved.",
        "detail": [
            "current_pin_authority.csv:84 TOOL_CLAMP_SOL \u2192 OUT9 \u2192 RLY-3 \u2192 SOL-10",
            "current_pin_authority.csv:85 TOOL_UNCLAMP_SOL \u2192 OUT10 \u2192 RLY-4 \u2192 SOL-10",
            "connector_crossref.md:46 identifies SOL-10 (wire 410D/410) as tool UNCLAMP only",
            "authority_conflicts.md:19-24 holds the clamp output and leaves unclamp at COMMISSIONING_PENDING",
        ],
        "action": "Trace the RLY-3 and RLY-4 load sides to the valve, determine coil count, and verify "
                  "clamp/unclamp prox behaviour with hydraulic pressure removed.",
        "signals": ["TOOL_CLAMP_SOL", "TOOL_UNCLAMP_SOL", "TOOL_CLAMP_CONF", "TOOL_UNCLAMP_CONF"],
        "sources": ["mesa/current_pin_authority.csv:84-85", "wiring/connector_crossref.md:46",
                    "wiring/authority_conflicts.md:19-24"],
    },
    {
        "id": "C6",
        "title": "All HostMot2 pin names are unverified placeholders",
        "severity": "unverified",
        "summary": "Every hm2_7i80.* name in the HAL set is a placeholder. Board tag, GPIO index ranges, "
                   "resolver pin names, pwmgen instances, and the smart-serial device tag all need "
                   "readhmid / halcmd show pin hm2 confirmation.",
        "detail": [
            "motion_7i80hdt.hal:4-7 \u2014 \"every hm2_7i80.* name below is an UNVERIFIED PLACEHOLDER... "
            "Confirm the exact board tag (hm2_7i80 expected)\"",
            "motion_7i80hdt.hal:32-33 \u2014 resolver pin names unverified",
            "motion_7i80hdt.hal:183-188 \u2014 \"The gpio.NNN INDICES BELOW ARE PLACEHOLDERS \u2014 inputs and "
            "outputs occupy separate, firmware-determined ranges... do not wire by these numbers\"",
            "motion_7i80hdt.hal:116 \u2014 pwmgen instance to axis mapping unconfirmed",
            "field_7i84u.hal:3-6 \u2014 \"Every hm2_7i80.*.7i84.* name below is an UNVERIFIED PLACEHOLDER\"",
            "mazak_vqc_20_40.hal:4-7 \u2014 board name, IP, firmware, resolver scales, drive polarity, "
            "normal states and safety wiring all unverified",
            "mazak_vqc_20_40.hal:25-26 \u2014 board_ip and config string still TODO despite 192.168.1.121 "
            "being set on line 31",
        ],
        "action": "Load the real firmware, run readhmid and halcmd show pin hm2, then regenerate the HAL "
                  "pin names. Treat every gpio.NNN in this dashboard as a label, not a landing point.",
        "signals": ["X_LIMIT_PLUS", "X_LIMIT_MINUS", "Y_LIMIT_PLUS", "Y_LIMIT_MINUS", "Z_LIMIT_PLUS",
                    "Z_LIMIT_MINUS", "X_HOME", "Y_HOME", "Z_HOME", "ESTOP_CHAIN", "AIR_BLAST",
                    "TOUCH_SENSOR_BLAST", "TAP_COOLANT_BLAST", "X_RESOLVER", "Y_RESOLVER", "Z_RESOLVER"],
        "sources": ["linuxcnc/motion_7i80hdt.hal:4-7,32-33,116,183-188", "linuxcnc/field_7i84u.hal:3-6",
                    "linuxcnc/mazak_vqc_20_40.hal:4-7,25-26"],
    },
    {
        "id": "C7",
        "title": "spindle-at-speed is forced true in HAL while the authority allocates a real input",
        "severity": "conflict",
        "summary": "motion_7i80hdt.hal short-circuits the at-speed net, so the planned 7i84U IN13 field "
                   "signal would be ignored even once wired.",
        "detail": [
            "motion_7i80hdt.hal:102-103 \u2014 \"Until encoder is wired, spindle-at-speed is forced true "
            "(open-loop, no speed verification)\": sets spindle-at-speed true",
            "current_pin_authority.csv:56 \u2014 SPINDLE_AT_SPEED on 7i84U TB1 IN13, net spindle-at-speed",
            "field_7i84u.hal:42 \u2014 the matching input net is commented out and uses a different name "
            "(spindle-at-spd) and a different channel (input-15)",
        ],
        "action": "Remove the sets line before relying on at-speed for any interlock, and reconcile the "
                  "net name (spindle-at-speed vs spindle-at-spd) and channel.",
        "signals": ["SPINDLE_AT_SPEED"],
        "sources": ["linuxcnc/motion_7i80hdt.hal:102-103", "mesa/current_pin_authority.csv:56",
                    "linuxcnc/field_7i84u.hal:42"],
    },
    {
        "id": "C8",
        "title": "mesa/signal_map.csv is stale and must not be used for wiring",
        "severity": "stale",
        "summary": "The older signal map contradicts the authority on TB5 ordering, drive-fault board, "
                   "hydraulic pressure, and the 7i84U field layout. It also uses a TB6 output bank that "
                   "the authority does not recognise.",
        "detail": [
            "TB5 order: signal_map.csv:10-18 puts homes first (X_HOME=IN0); the authority puts limits "
            "first (X_LIMIT_PLUS=TB5.1 IN0) \u2014 current_pin_authority.csv:23-31",
            "Drive faults: signal_map.csv:19-21 places X/Y/Z drive faults on legacy 7i97T TB5 IN9-11; the "
            "authority places them on 7i84U IN10-12",
            "E-stop: signal_map.csv:23 says TB5 IN13; the authority says TB5.10 IN9 gpio.017",
            "HYD_PRESS_OK: signal_map.csv:26 says legacy 7i97T TB5 IN16; the authority says 7i84U IN27 and "
            "explicitly calls the old row stale (current_pin_authority.csv:70)",
            "Outputs: signal_map.csv:30-37 uses a legacy 7i97T \"TB6\" output bank that does not appear in the "
            "authority at all; drive enables are on TB3 ENA pins instead",
            "7i84U: signal_map.csv:38-60 is an entirely different field layout that field_7i84u.hal still "
            "follows",
            "mesa/README.md:16-19 \u2014 \"Some rows are stale and conflict with the active HAL and Phase 2 "
            "review, especially TB5 homes/limits/E-stop and 7i84U field I/O.\"",
        ],
        "action": "Use current_pin_authority.csv only. Keep signal_map.csv for comparison until it is "
                  "regenerated.",
        "signals": ["X_HOME", "Y_HOME", "Z_HOME", "X_LIMIT_PLUS", "ESTOP_CHAIN", "HYD_PRESS_OK",
                    "X_DRIVE_FAULT", "Y_DRIVE_FAULT", "Z_DRIVE_FAULT"],
        "sources": ["mesa/signal_map.csv:10-60", "mesa/current_pin_authority.csv:23-34,53-55,70",
                    "mesa/README.md:16-19"],
    },
    {
        "id": "C9",
        "title": "Magazine rotation direction SOL-8A/8B is unassigned and contradicted",
        "severity": "conflict",
        "summary": "The authority has generic ATC_FWD/ATC_REV relay outputs but never binds them to "
                   "SOL-8A/SOL-8B, and the two sources disagree on which coil is which direction.",
        "detail": [
            "connector_crossref.md:44-45 \u2014 408A = SOL-8A Magazine CCW (forward), 408B = SOL-8B "
            "Magazine CW (reverse)",
            "io_map_research_notes.md:249-250 (alarm-table OCR) \u2014 SOL-8A = Magazine CW, "
            "SOL-8B = Magazine CCW (reverse). Directly opposite.",
            "authority_conflicts.md:26-33 \u2014 \"do not promote the generic ATC direction rows until this "
            "trace is complete\"",
        ],
        "action": "Trace both solenoid wires and verify actual magazine movement with hydraulic power "
                  "isolated or under controlled commissioning.",
        "signals": ["ATC_FWD", "ATC_REV"],
        "sources": ["wiring/connector_crossref.md:44-45", "wiring/io_map_research_notes.md:249-250",
                    "wiring/authority_conflicts.md:26-33"],
    },
    {
        "id": "C10",
        "title": "Coverage gaps: signals documented in research but absent from the authority",
        "severity": "unverified",
        "summary": "io_map_research_notes.md lists functional areas with no Mesa channel allocated. If any "
                   "are retained they need channels that the current 32-in/16-out budget may not have.",
        "detail": [
            "Entire 2PC pallet-changer set: SOL-22A/22B, SOL-24, SOL-25A/25B, SOL-82A/82B, SOL-87A/87B, "
            "PRS-98/99, PRS-92/93, RS-96/97, LS-83/84/87/88 (io_map_research_notes.md:106-146)",
            "Door interlock switches LS-140/LS-141 (io_map_research_notes.md:94-104)",
            "SOL-31 flood coolant and the CB-4 + CMS overload relay (io_map_research_notes.md:148-170)",
            "Magazine cover reed switches RS-79 / RS-18, spindle orientation arrival signal, ATC arm "
            "position sensors, tool-measure stand switches (io_map_research_notes.md:287-295)",
            "Two lube systems (head AL-56, way AL-54) share one generic LUBE_ON output "
            "(io_map_research_notes.md:293-295)",
            "SECOND_SSERIAL_CARD was retired 2026-08-03 after single-7i84U plan committed (open_issues.md §3)",
        ],
        "action": "Decide whether the pallet changer is retained before finalising the 7i84U channel budget. "
                  "Single-7i84U plan committed 2026-08-03; second smart-serial card retired — do not order.",
        "signals": ["SECOND_SSERIAL_CARD", "DOOR_INTERLOCK", "LUBE_ON", "COOLANT_ON"],
        "sources": ["wiring/io_map_research_notes.md:94-170,287-295", "mesa/current_pin_authority.csv:91"],
    },
]

# ---------------------------------------------------------------------------
# Board metadata
# ---------------------------------------------------------------------------
BOARDS = {
    "7i80HDT": {
        "name": "Mesa 7i80HDT",
        "role": "Ethernet FPGA host (hm2_eth)",
        "detail": "Primary control board. 3× 50-pin daughter connectors carry 72 IO: P1 = 7i44 sserial "
                  "breakout, P2 = 7i49 resolvers + analog outs, P3 = 7i37TA field breakout.",
        "address": "board_ip 192.168.1.121 (host NIC enp0s31f6 at 192.168.1.1/24)",
    },
    "7i44": {
        "name": "Mesa 7i44",
        "role": "8-channel RS-422 smart-serial breakout (on 7i80HDT P1)",
        "detail": "Port 0 carries the 7i84U. Ports 1-7 spare for future MPG / 4th-axis / second 7i84.",
        "address": "sserial_port_0=00000000 on 7i80HDT P1",
    },
    "7i49": {
        "name": "Mesa 7i49",
        "role": "Resolver-to-digital interface + ±10V DACs (on 7i80HDT P2)",
        "detail": "Plain 7i49 (not HV). Reads the machine's original Tamagawa TS2014N shaft resolvers "
                  "for X/Y/Z on RES0/1/2 at 5 kHz excitation. AOUT0/1/2 drive the X/Z/Y servos, AOUT3 "
                  "the FR-SX spindle velocity, AOUT4 an FR-SX orient reference (reserved).",
        "address": "num_resolvers=3, num_pwmgens=4 on 7i80HDT P2",
    },
    "7i37TA": {
        "name": "Mesa 7i37TA (P3 field breakout)",
        "role": "Motion-critical direct FPGA GPIO breakout (on 7i80HDT P3)",
        "detail": "24-bit isolated field-I/O breakout: 16 isolated IN + 8 isolated OUT. Carries X/Y/Z "
                  "limits (IN0-5), X/Y/Z homes (IN6-8), E-stop monitor (IN9), probe SKIP1 (IN10); "
                  "X/Y/Z drive-enable (OUT0-2), and 5 former TB5 SSR overflow outputs (OUT3-7) plus "
                  "1 spare (OUT8). Interposing relays (RLY-5/6/7) required for 100VAC solenoid loads.",
        "address": "Direct FPGA GPIO on 7i80HDT P3 (gpio.032-055)",
    },
    "7i84U": {
        "name": "Mesa 7i84U",
        "role": "Remote smart-serial field I/O",
        "detail": "32 field inputs on TB1, 16 field outputs on TB2. Mounted near the original green "
                  "breakout PCB. Two independent field power banks. Pin plan committed 2026-08-03 preserved.",
        "address": "On 7i44 port 0 (sserial_port_0=00000000)",
    },
    "none": {
        "name": "Unassigned",
        "role": "No board",
        "detail": "Review and expansion items with no hardware allocated.",
        "address": "",
    },
}
