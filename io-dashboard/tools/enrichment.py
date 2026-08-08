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
                 "Not a wiring instruction.",
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
    # ---- Full taxonomy entries below (some may have 0 current rows) --------
    "TRACED": {
        "label": "Traced \u2014 continuity confirmed",
        "tone": "accepted",
        "order": 1,
        "blurb": "Wire path physically traced end-to-end with a meter; "
                 "continuity confirmed in both states.",
        "safe_to_energize": "Traced but not yet powered-up verified.",
    },
    "ELECTRICALLY_VERIFIED": {
        "label": "Electrically verified",
        "tone": "verified",
        "order": 0,
        "blurb": "Powered to nominal voltage and measured; normal and tripped voltages recorded.",
        "safe_to_energize": "Verified per repo records.",
    },
    "HAL_VERIFIED": {
        "label": "HAL verified",
        "tone": "verified",
        "order": 0,
        "blurb": "HAL pin toggles correctly against physical stimulus, "
                 "captured in a halscope trace.",
        "safe_to_energize": "HAL binding confirmed.",
    },
    "COMMISSIONED": {
        "label": "Commissioned",
        "tone": "verified",
        "order": 0,
        "blurb": "Passed the safety / functional acceptance for its role, "
                 "including fault injection.",
        "safe_to_energize": "Commissioned and accepted.",
    },
    "RESERVED": {
        "label": "Reserved \u2014 future use",
        "tone": "reserved",
        "order": 2,
        "blurb": "Pin held for a named future function. Do not wire until the function is defined.",
        "safe_to_energize": "Not verified. Do not wire.",
    },
    "DEFERRED": {
        "label": "Deferred \u2014 out of scope",
        "tone": "spare",
        "order": 7,
        "blurb": "Signal out of first-power scope by decision. Not planned for this phase.",
        "safe_to_energize": "Deferred. Do not wire.",
    },
    "UNBOUND": {
        "label": "Unbound \u2014 no signal assignment",
        "tone": "spare",
        "order": 7,
        "blurb": "Physical channel exists but no signal has been assigned to it yet.",
        "safe_to_energize": "Unassigned. Leave unlanded.",
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
    "field_7i84u.hal limit block \u2014 NC contacts use the smart-serial "
    "input-NN-not complementary pins; no invert_input parameter"
)
NO_HOME_BASIS = (
    "field_7i84u.hal home block \u2014 NO contacts use raw input-NN pins"
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
    "ESTOP_MONITOR": (
        "1",
        "Logic 1 \u2014 hardware E-stop chain healthy",
        "field_7i84u.hal: estop-monitor raw IN29 feeds estop-latch.ok-in; "
        "contact polarity remains field-verification pending",
        "proposed",
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
    "SPINDLE_ENCODER": (
        "Dynamic",
        "Unavailable \u2014 encoder and receiver not identified; num_encoders=0",
        "motion_7i80hdt.hal spindle-feedback hold; P3 remains physically empty and "
        "resolver.03 is not used for spindle",
        "dynamic",
    ),
    # --- Drive faults: polarity unknown --------------------------------------
    "X_DRIVE_FAULT": ("Unknown", "Unknown \u2014 polarity not confirmed; inversion not commissioned",
                      "field_7i84u.hal drive-fault block \u2014 select raw input or input-NN-not "
                      "only after bench verification", "unknown-polarity"),
    "Y_DRIVE_FAULT": ("Unknown", "Unknown \u2014 polarity not confirmed; inversion not commissioned",
                      "field_7i84u.hal:28-33", "unknown-polarity"),
    "Z_DRIVE_FAULT": ("Unknown", "Unknown \u2014 polarity not confirmed; inversion not commissioned",
                      "field_7i84u.hal:28-33", "unknown-polarity"),
    "SPINDLE_FAULT": ("Unknown", "Unknown \u2014 VFD fault terminal and polarity not confirmed",
                      "current_pin_authority.csv:57 \u2014 \"Confirm VFD terminal and polarity\"", "unknown-polarity"),
    "SERVO_READY": ("Unknown", "Unknown \u2014 relay contact form not confirmed",
                    "current_pin_authority.csv:74 \u2014 \"Wire before first motion if available\"", "unknown"),
    # --- Spindle at speed -----------------------------------------------------
    "SPINDLE_AT_SPEED": (
        "Unknown",
        "FR-SX speed-reach field input; normal state and terminal remain unverified",
        "field_7i84u.hal: spindle-at-speed is sourced only from 7i84U-A IN13; "
        "no forced writer remains",
        "unknown-polarity",
    ),
    # --- Field power / smart-serial link ------------------------------------
    "TB5_FIELD_GND": ("n/a", "Power common \u2014 not a logic signal", "current_pin_authority.csv:33", "na"),
    "TB5_FIELD_24V": ("24 V", "Field supply rail \u2014 confirm capacity and fusing",
                      "current_pin_authority.csv:34", "na"),
    "SEVENI84U_FIELD_A_24V": (
        "24 V", "VFIELDA supply for TB3 outputs 0-7 and inputs 0-15; TB1 pins 3/4 are both positive",
        "Mesa 7i84U manual pp.7-8/47", "na",
    ),
    "SEVENI84U_FIELD_B_24V": (
        "24 V", "VFIELDB supply for TB2 outputs 8-15 and inputs 16-31; TB1 pins 1/2 are both positive",
        "Mesa 7i84U manual pp.7-8/47", "na",
    ),
    "SEVENI84U_VIN_24V": (
        "24.0 VDC", "Measured TB1 pin 5 to TB1 pin 6; W1 physically RIGHT",
        "docs/commissioning_logs/mazak_commissioning_records_07-08-2026.json", "na",
    ),
    "SEVENI84U_GND": (
        "0 V", "VIN/VFIELD common on TB1 pins 6/7/8",
        "Mesa 7i84U manual pp.7-8", "na",
    ),
    "SEVENI84UB_FIELD_A_24V": (
        "24 V", "VFIELDA supply for TB3 outputs 0-7 and inputs 0-15; TB1 pins 3/4 are both positive",
        "Mesa 7i84U manual pp.7-8/47", "na",
    ),
    "SEVENI84UB_FIELD_B_24V": (
        "24 V", "VFIELDB supply for TB2 outputs 8-15 and inputs 16-31; TB1 pins 1/2 are both positive",
        "Mesa 7i84U manual pp.7-8/47", "na",
    ),
    "SEVENI84UB_VIN_24V": (
        "24 V", "Logic supply on TB1 pin 5; verify W1 before wiring",
        "Mesa 7i84U manual pp.2/7-8/47", "na",
    ),
    "SEVENI84UB_GND": (
        "0 V", "VIN/VFIELD common on TB1 pins 6/7/8",
        "Mesa 7i84U manual pp.7-8", "na",
    ),
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
    "SPINDLE_ENCODER": ("Spindle head \u2014 machine-side A/B/Z encoder if fitted",
                         "Spindle feedback", "Unassigned: part, electrical format, receiver/interface and FPGA pins are not confirmed. P3 remains empty."),
    "TB2_AXIS_ENCODERS": ("Control cabinet \u2014 axis encoder inputs, unused; feedback comes through 7i49 P2 resolver channels",
                          "Axis feedback", "Architecturally excluded: feedback is resolver via 7i49."),
    "X_DRIVE_ENABLE": ("Servo bay \u2014 X TRA-series servo amp, S-ON terminal", "Servo drives", "X/Y amp path via CA3/CA4 (BBIA-1 CN1/CN2)"),
    "Y_DRIVE_ENABLE": ("Servo bay \u2014 Y TRA-series servo amp, S-ON terminal", "Servo drives", "X/Y amp path via CA3/CA4"),
    "Z_DRIVE_ENABLE": ("Servo bay \u2014 Z TRA-series servo amp, S-ON terminal", "Servo drives", "Z amp path via CA1 (BBIA-1 CN3)"),
    "X_AXIS_CMD": ("Servo bay \u2014 X servo amp analog command input", "Servo drives", "Verify velocity vs torque input and polarity before enabling"),
    "Y_AXIS_CMD": ("Servo bay \u2014 Y servo amp analog command input", "Servo drives", "Verify velocity vs torque input and polarity before enabling"),
    "Z_AXIS_CMD": ("Servo bay \u2014 Z servo amp analog command input", "Servo drives", "Verify velocity vs torque input and polarity before enabling"),
    "SPINDLE_TB3_ENABLE_CANDIDATE": ("Spindle/servo bay \u2014 Mitsubishi FR-SX, SX-IO1 board (CON1/CONA)",
                                     "Spindle drive", "Conflicts with the 7i84U-A FWD/REV/ENA plan"),
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
    "SEVENI84U_FIELD_A_24V": ("Field I/O enclosure \u2014 7i84U-A TB1 pins 3/4", "Field power", "VFIELDA for TB3 bank"),
    "SEVENI84U_FIELD_B_24V": ("Field I/O enclosure \u2014 7i84U-A TB1 pins 1/2", "Field power", "VFIELDB for TB2 bank"),
    "SEVENI84U_VIN_24V": ("Field I/O enclosure \u2014 7i84U-A TB1 pin 5", "Logic power", "W1 RIGHT verified; direct VIN feed from Mean Well +V2"),
    "SEVENI84U_GND": ("Field I/O enclosure \u2014 7i84U-A TB1 pins 6/7/8", "Power common", "VIN/VFIELD common return"),
    "SEVENI84UB_FIELD_A_24V": ("Field I/O enclosure \u2014 7i84U-B TB1 pins 3/4", "Field power", "VFIELDA for TB3 bank"),
    "SEVENI84UB_FIELD_B_24V": ("Field I/O enclosure \u2014 7i84U-B TB1 pins 1/2", "Field power", "VFIELDB for TB2 bank"),
    "SEVENI84UB_VIN_24V": ("Field I/O enclosure \u2014 7i84U-B TB1 pin 5", "Logic power", "Verify W1 position before landing VIN"),
    "SEVENI84UB_GND": ("Field I/O enclosure \u2014 7i84U-B TB1 pins 6/7/8", "Power common", "VIN/VFIELD common return"),
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
    "HYD_PRESS_OK": ("Hydraulic power unit \u2014 Sanwa SPS-8T-PC-20 pressure switch", "Hydraulics", ""),
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
    "SECOND_SSERIAL_CARD": ("Replaced by 7i84U-B on 7i44 channel 1", "Expansion", "No third smart-serial field-I/O card is currently required. The prior single-7i84U plan used: drops (Y091 OTR, X078 MPWS, X02F INHRLS, Y023-Y025 M43-M45T) + series consolidations (HLP+HLP2, THR+ONT, ITMDSS+LS-140/141) + panel moves (FEED_HOLD/SINGLE_BLOCK to touchscreen, panel-power-on to software state, reset-out to TB5 SSR) fit 5 DI + 5 DO of gap load into 6 DI + 6 DO available before the dual-7i84U architecture revision."),
}

SSERIAL_LOC = ("Control cabinet \u2014 7i80HDT P1 (7i44 channel 0) to 7i84U-A RJ45 (RS-422 smart-serial)", "Field I/O link",
               "Use the verified 7i44 channel-0 pinout. Shield drain at the 7i80HDT / 7i44 end only.")
for _k in ("SSERIAL_GND_A", "SSERIAL_GND_B", "SSERIAL_RX_PLUS", "SSERIAL_RX_MINUS",
           "SSERIAL_TX_PLUS", "SSERIAL_TX_MINUS", "SSERIAL_5V_A", "SSERIAL_5V_B"):
    LOCATION[_k] = SSERIAL_LOC

SPARE_LOC = {
    "TB5_SSR_OUT3_SPARE": ("Control cabinet \u2014 historical TB5 SSR3", "Reallocated",
                           "Historical spare row only. Current authority allocates 7i84U-B TB3 OUT6 to the ATC barrier via an interposing relay if driven."),
    "TB5_SSR_OUT4_SPARE": ("Control cabinet \u2014 historical TB5 SSR4", "Reallocated",
                           "Historical spare row only. Current authority allocates 7i84U-B TB3 OUT7 to the flood valve via an interposing relay if driven."),
    "TB5_SSR_OUT5_SPARE": ("Control cabinet \u2014 historical TB5 SSR5", "Reallocated",
                           "Historical spare row only. 7i84U-B TB2 OUT8 is allocated to magazine-cover close; only OUT9-OUT15 remain spare."),
}
LOCATION.update(SPARE_LOC)
for i in range(4, 10):
    LOCATION["SEVENI84U_IN%d_SPARE" % i] = ("Field I/O enclosure \u2014 7i84U-A TB1, unlanded", "Spare", "")
for i in range(3, 6):
    LOCATION["SEVENI84U_OUT%d_SPARE" % i] = ("Field I/O enclosure \u2014 7i84U-A TB2, unlanded", "Spare",
                                             "Drive S-ON is handled by 7i84U-B TB3 OUT0-2 (`hm2_7i80.0.7i84.0.1.output-00..02`).")

# Per-terminal spare rows on 7i84U-B (aggregate range rows are forbidden).
for i in list(range(10, 15)) + list(range(16, 32)):
    LOCATION["SEVENI84UB_IN%d_SPARE" % i] = ("Field I/O enclosure - 7i84U-B, unlanded", "Spare", "")
for i in range(9, 16):
    LOCATION["SEVENI84UB_OUT%d_SPARE" % i] = ("Field I/O enclosure - 7i84U-B TB2, unlanded", "Spare", "")

# ---------------------------------------------------------------------------
# Conflict register. Each entry links to the signal rows it affects.
# ---------------------------------------------------------------------------
CONFLICTS = [
    {
        "id": "C3",
        "title": "FR-SX command architecture and polarity remain unverified",
        "severity": "conflict",
        "summary": "The field wiring has not established whether AOUT3 is an unsigned 0-10 V magnitude "
                   "with discrete direction or a signed bipolar command. All motion-producing spindle "
                   "paths are held by the fail-off spindle permit chain.",
        "detail": [
            "AOUT3 currently receives signed spindle.0.speed-out.",
            "7i84U-A OUT0/OUT1/OUT2 carry gated FWD/REV/RUN outputs.",
            "The static spindle-output-permit initializes FALSE; the combined gate covers FWD, REV, RUN, "
            "ORCM1, and pwmgen.03.enable and also requires watchdog, E-stop, machine-on, servo-ready, and "
            "no indicated spindle fault.",
        ],
        "action": "Bench-prove the FR-SX input mode and polarity, then implement either an absolute-value "
                  "analog magnitude with discrete direction or a signed analog command without conflicting "
                  "direction inputs. Clear the common permit only after that change is reviewed.",
        "signals": ["SPINDLE_FWD", "SPINDLE_REV", "SPINDLE_ENABLE", "SPINDLE_ORIENT_CMD", "SPINDLE_SPEED_CMD"],
        "sources": ["linuxcnc/motion_7i80hdt.hal", "linuxcnc/field_7i84u.hal",
                    "docs/frsx_orient_model.md"],
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
            "7i84U-B on physical channel 1 superseded the prior single-7i84U plan",
        ],
        "action": "The current two-card allocation has 21 DI and 7 DO spare after AIR_OK and cover output. "
                  "Inventory every pallet-changer device before restoring that scope; do not order a third remote from an estimate.",
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
        "detail": "Primary control board. P1 = 7i44 sserial breakout, P2 = 7i49 resolvers + analog outs; "
                  "P3 is unused/spare; the probe is on 7i84U-B IN15.",
        "address": "board_ip 192.168.1.121 (host NIC enp0s31f6 at 192.168.1.1/24)",
    },
    "7i44": {
        "name": "Mesa 7i44",
        "role": "8-channel RS-422 smart-serial breakout (on 7i80HDT P1)",
        "detail": "Physical channel 0 carries 7i84U-A and channel 1 carries 7i84U-B. Channels 2-7 are spare.",
        "address": "7i80HDT P1 HostMot2 sserial port 0, channels 0 and 1",
    },
    "7i49": {
        "name": "Mesa 7i49",
        "role": "Resolver-to-digital interface + ±10V DACs (on 7i80HDT P2)",
        "detail": "Plain 7i49 (not HV). Reads the machine's original Tamagawa TS2014N shaft resolvers "
                  "for X/Y/Z on RES0/1/2 at 5 kHz excitation. AOUT0/1/2 drive the X/Z/Y servos, AOUT3 "
                  "drives FR-SX spindle velocity, and AOUT4/AOUT5 are spare.",
        "address": "num_resolvers=3, num_pwmgens=4 on 7i80HDT P2",
    },
    "7i84U-A": {
        "name": "Mesa 7i84U-A",
        "role": "Remote smart-serial field I/O (7i44 channel 0)",
        "detail": "32 field inputs and 16 field outputs on TB3/TB2; TB1 is field power. Mounted near the original green "
                  "breakout PCB for ATC, hydraulics, coolant, air, magazine, and utility I/O.",
        "address": "On 7i44 channel 0 (`hm2_7i80.0.7i84.0.0.*`)",
    },
    "7i84U-B": {
        "name": "Mesa 7i84U-B",
        "role": "Remote smart-serial limit/home and relay I/O (7i44 channel 1)",
        "detail": "32 DI + 16 DO remote I/O: TB3 IN0-15 carries limits, homes, air pressure and probe; "
                  "TB3 OUT0-7 carries drive enables and relay-managed loads; TB2 OUT8 carries the proposed cover valve. "
                  "Interposing relays remain required for 100VAC solenoid loads.",
        "address": "On 7i44 channel 1 (`hm2_7i80.0.7i84.0.1.*`)",
    },
    "none": {
        "name": "Unassigned",
        "role": "No board",
        "detail": "Review and expansion items with no hardware allocated.",
        "address": "",
    },
}
