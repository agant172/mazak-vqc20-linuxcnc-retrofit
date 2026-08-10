// CURATED FILE — edited by hand, not generated.
// Companion to data.js: project status milestones, pending items and the
// physical hardware inventory. Every entry carries a status and a source.
// Update conventions:
//   1. Facts about wiring/pins belong in mesa/current_pin_authority.csv, not here.
//   2. Add a milestone when something is resolved WITH the date and commit/photo ref.
//   3. Never promote a hardware status to CONFIRMED without physical evidence.
window.MAZAK_PROJECT = {
  "updated": "2026-08-09",
  "status_note": "Counts on this page are computed live from data.js (the authority snapshot). " +
    "Milestones, pending items and the hardware list are curated by hand in project_data.js. " +
    "Nothing on this page is a permission to energize.",
  "milestones": [
    { "date": "2026-08", "text": "Architecture confirmed: 7i80HDT Ethernet FPGA host + 7i44 on P1 (7i84U-A ch0, 7i84U-B ch1) + 7i49 plain on P2. Earlier 7i97T single-7i84U architecture retracted.", "ref": "docs/architecture_decision.md" },
    { "date": "2026-08-06", "text": "Superseded-claims register issued; pre-August pin maps voided.", "ref": "docs/superseded_claims_2026-08-06.md" },
    { "date": "2026-08-08", "text": "SOL-12/13 gear solenoid conflict physically confirmed at the valve stack.", "ref": "authority CSV C-register" },
    { "date": "2026-08-09", "text": "Audit fully resolved: probe corrected to 7i84U-B TB3 IN15, gear-lo-sol bound to A-OUT8, mag-cw/ccw bound to A-OUT13/14, blast/flood bound to B-OUT3/4/5/7 as reader-only nets. Both validators exit 0: 0 errors, 0 warnings, 64 pins.", "ref": "commits 0da078d / 4013db2 / 6be9d11" },
    { "date": "2026-08-09", "text": "Spindle motor identified from nameplate: Mitsubishi SE-EV-FV, 3.7 kW cont / 5.5 kW 30-min. Axis pickup identity resolved to Tamagawa RT-5XC-11 (TS2014N45E3-1 resolver) via BKO-NC6062A cross-reference.", "ref": "photos 2026-08-09" },
    { "date": "2026-08-09", "text": "Decision: keeping the original Mitsubishi FR-SX spindle drive (not replacing). Spindle stays on its native drive/feedback loop; Mesa integration scope for the spindle is limited accordingly.", "ref": "Andy, chat 2026-08-09" },
    { "date": "2026-08-09", "text": "WORK_LIGHT added to authority: 7i84U-B TB2 OUT9 (was spare), 100VAC lamp via new interposing relay RLY-8, HAL net work-light. Sourced from OEM CN6 pin 8 (wire WL / 3-34) in wiring/bbia1_cn_pinouts.md. Both validators pass (0 errors); io_capacity_reconciliation.md and label CSVs updated to match.", "ref": "mesa/current_pin_authority.csv; commit pending" }
  ],
  "pending": [
    { "text": "Magazine rotation direction (mag-cw / mag-ccw on A-OUT13/14): coil identity resolved, rotation sense PENDING BENCH.", "ref": "authority CSV" },
    { "text": "Resolver speed variant: TS2014N45E3-1 is believed single-speed; verify with excitation applied before promoting.", "ref": "photos + aftermarket cross-ref 2026-08-09" },
    { "text": "Every hm2_7i80.* pin name is an unverified placeholder until confirmed against firmware readhmid (conflict C6). Firmware bitfile name is a placeholder.", "ref": "docs/authority_hierarchy.md" },
    { "text": "With FR-SX retained, define exactly what LinuxCNC/Mesa needs from the spindle loop (speed command, at-speed, orient, fault) and how it interfaces to the kept drive.", "ref": "decision 2026-08-09" },
    { "text": "WORK_LIGHT (7i84U-B OUT9) is PROPOSED only: not yet wired in HAL (validator WARN by design), and RLY-8 relay coil rating / CB-panel landing point are unverified.", "ref": "mesa/current_pin_authority.csv 2026-08-09" },
    { "text": "No row in the authority is physically verified yet — no green anywhere is intentional.", "ref": "docs/pre_power_deliverables.md" }
  ],
  "hardware": [
    { "group": "Machine", "item": "Mazak VQC-20/40", "detail": "S/N 060231, original control Mazatrol M-2", "status": "CONFIRMED", "source": "machine plate / 41434WB docs" },
    { "group": "Control", "item": "LinuxCNC host", "detail": "Debian 13, LinuxCNC 2.9.10, PREEMPT-RT; NIC enp0s31f6 at 192.168.1.1/24", "status": "CONFIRMED", "source": "repo config" },
    { "group": "Mesa", "item": "7i80HDT", "detail": "Ethernet FPGA host at 192.168.1.121; P1 = 7i44, P2 = 7i49, P3 empty", "status": "CONFIRMED", "source": "docs/architecture_decision.md" },
    { "group": "Mesa", "item": "7i44", "detail": "RS-422 sserial breakout on P1; ch0 = 7i84U-A, ch1 = 7i84U-B", "status": "CONFIRMED", "source": "docs/architecture_decision.md" },
    { "group": "Mesa", "item": "7i84U-A (ch0)", "detail": "ATC / hydraulic / coolant / air / magazine / spindle / utility field I/O", "status": "CONFIRMED", "source": "mesa/current_pin_authority.csv" },
    { "group": "Mesa", "item": "7i84U-B (ch1)", "detail": "Limits, homes, drive enables, probe IN15, relay loads", "status": "CONFIRMED", "source": "mesa/current_pin_authority.csv" },
    { "group": "Mesa", "item": "7i49 (plain)", "detail": "X/Y/Z resolver interface @5 kHz baseline; AOUT0..3 velocity commands (X=0, Z=1, Y=2, spindle=3); sole excitation source", "status": "CONFIRMED", "source": "mesa/current_pin_authority.csv" },
    { "group": "Axis drives", "item": "Mitsubishi HD-81 (X, Y) / HD-101 (Z)", "detail": "DC servos with tachos; TRA drives close the velocity loop on tacho", "status": "CONFIRMED", "source": "OEM docs / inspection" },
    { "group": "Axis feedback", "item": "Tamagawa RT pickup units, spec BKO-NC6062A", "detail": "Standalone shaft resolvers on ballscrew ends; cross-referenced to RT-5XC-11 / TS2014N45E3-1 single-speed Smartsyn pancake resolver (RT-6X0-11 alternate). On-machine label digits oil-degraded.", "status": "PENDING_BENCH", "source": "photos + aftermarket cross-ref 2026-08-09" },
    { "group": "Spindle", "item": "Mitsubishi SE-EV-FV spindle motor", "detail": "4-pole induction, 3.7 kW cont / 5.5 kW 30-min, 1500/4500/6000 RPM, frame L5-A112, S/N D91400020, Klixon 9700L-246-215 thermal, IA-15040 blower", "status": "CONFIRMED", "source": "nameplate photo 2026-08-09" },
    { "group": "Spindle", "item": "Mitsubishi FR-SX spindle drive", "detail": "Original controller per nameplate; decision made 2026-08-09 to keep and reuse rather than replace", "status": "CONFIRMED", "source": "nameplate photo 2026-08-09; decision 2026-08-09" },
    { "group": "Spindle", "item": "Spindle pickup unit", "detail": "Tamagawa RT / BKO-NC6062A family, resolver-type, spring-isolated mount", "status": "PENDING_BENCH", "source": "photos 2026-08-09" },
    { "group": "Hydraulics", "item": "Fujikoshi SA-G01 solenoid valves", "detail": "Gear shift and tool clamp, driven via relay panel; SOL-12/13 conflict resolved 2026-08-08", "status": "CONFIRMED", "source": "physical confirmation 2026-08-08" },
    { "group": "Hydraulics", "item": "Z brake SOL-60", "detail": "Z-axis brake solenoid", "status": "CONFIRMED", "source": "OEM docs" },
    { "group": "Hydraulics", "item": "Legacy 100 VAC SOL-35 / 61 / 62", "detail": "Require interposing relays before Mesa outputs may drive them", "status": "CONFIRMED", "source": "OEM docs" },
    { "group": "Pneumatics", "item": "CKD 4F210 valves", "detail": "Air blast only", "status": "CONFIRMED", "source": "inspection" },
    { "group": "Lighting", "item": "Spindle-head work light", "detail": "100VAC lamp, OEM CN6 pin 8 (wire WL / 3-34); assigned 2026-08-09 to 7i84U-B OUT9 via new interposing relay RLY-8, status PROPOSED — not yet wired in HAL", "status": "PENDING_BENCH", "source": "wiring/bbia1_cn_pinouts.md; Andy, chat 2026-08-09" },
    { "group": "Lubrication", "item": "Nippon Gerotor motor-trochoid pump", "detail": "Headstock / spindle lube circuit", "status": "CONFIRMED", "source": "photo 2026-08-09" },
    { "group": "Safety", "item": "Hardwired E-stop chain", "detail": "Remains authoritative; removes hazardous power independently of LinuxCNC. 7i84U-A TB2 IN29 is monitor only.", "status": "CONFIRMED", "source": "docs/authority_hierarchy.md" }
  ]
};
