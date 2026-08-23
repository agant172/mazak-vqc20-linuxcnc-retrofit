// CURATED FILE — edited by hand, not generated.
// Companion to data.js: project status milestones, pending items and the
// physical hardware inventory. Every entry carries a status and a source.
// Update conventions:
//   1. Facts about wiring/pins belong in mesa/current_pin_authority.csv, not here.
//   2. Add a milestone when something is resolved WITH the date and commit/photo ref.
//   3. Never promote a hardware status to CONFIRMED without physical evidence.
window.MAZAK_PROJECT = {
  "updated": "2026-08-11",
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
    { "date": "2026-08-09", "text": "WORK_LIGHT added to authority: 7i84U-B TB2 OUT9 (was spare), 100VAC lamp via new interposing relay RLY-8, HAL net work-light. Sourced from OEM CN6 pin 8 (wire WL / 3-34) in wiring/bbia1_cn_pinouts.md. Both validators pass (0 errors); io_capacity_reconciliation.md and label CSVs updated to match.", "ref": "mesa/current_pin_authority.csv" },
    { "date": "2026-08-11", "text": "External audit finding closed: a dry-run M6 spoofed the tool via M61 and returned success with nothing coupling dry-run to whether the machine could cut. Dry-run authority moved from the retired [ATC] DRY_RUN INI key to the HAL bit atc-live-permit (default 0), gating the spindle motion permit; spindle-maint-permit adds a spindle-live + ATC-idle maintenance state in which a real M6 hard-aborts. validate_control_logic.py rejects the INI key reappearing.", "ref": "PRs #53 / #54" },
    { "date": "2026-08-11", "text": "WORK_LIGHT reserved: hal_net -> none, status -> RESERVED until RLY-8 is wired; !! 100VAC LOAD caution recorded on the authority row and kept on the printed label. Clears the standing validator WARN - both validators now 0 errors / 0 warnings.", "ref": "PR #55" },
    { "date": "2026-08-11", "text": "Separate power/return Epson label batch added: 16 TB1 labels across BOTH 7i84U cards with voltage class (+24VDC / 0V RETURN) and FUSE-ONLY / W1-jumper notes. The A-card power bank previously had no printable labels at all.", "ref": "PR #56; wiring/labels/power_return_labels_epson.csv" },
    { "date": "2026-08-11", "text": "Pre-wiring conflict-hold review (AG): C6 (15 signals, HostMot2 placeholder names - a bring-up verification step, not a wiring conflict) and C10 (2 signals, scope decisions) cleared; C3 kept holding its 5 spindle signals pending the FR-SX bench check. Dashboard conflict holds 22 -> 5; cleared entries stay in the register with dated notes.", "ref": "PR #57" },
    { "date": "2026-08-11", "text": "data.js drift is now CI-enforced: the authority gate regenerates it and fails on any non-timestamp diff, so the dashboard can no longer silently go stale against the authority CSV / HAL set.", "ref": "PR #58; .github/workflows/authority-gate.yml" }
  ],
  "pending": [
    { "text": "Magazine rotation direction (mag-cw / mag-ccw on A-OUT13/14): coil identity resolved, rotation sense PENDING BENCH.", "ref": "authority CSV" },
    { "text": "Resolver speed variant: TS2014N45E3-1 is believed single-speed; verify with excitation applied before promoting.", "ref": "photos + aftermarket cross-ref 2026-08-09" },
    { "text": "Every hm2_7i80.* pin name remains an unverified placeholder until confirmed against firmware readhmid at bring-up. Bitfile 7i80hdt_rmsvss6_8.bin received (#52); the per-signal C6 dashboard holds were cleared 2026-08-11 as non-wiring items, but the verification itself is still pending.", "ref": "docs/authority_hierarchy.md; PR #57" },
    { "text": "With FR-SX retained, define exactly what LinuxCNC/Mesa needs from the spindle loop (speed command, at-speed, orient, fault) and how it interfaces to the kept drive.", "ref": "decision 2026-08-09" },
    { "text": "WORK_LIGHT (7i84U-B OUT9) is RESERVED (hal_net none) until RLY-8 is wired; RLY-8 relay coil rating / CB-panel landing point remain unverified. 100VAC lamp circuit - OUT9 drives the relay coil only; do not repurpose OUT9 while RLY-8 is landed.", "ref": "mesa/current_pin_authority.csv 2026-08-11; PR #55" },
    { "text": "No row in the authority is physically verified yet — no green anywhere is intentional.", "ref": "docs/pre_power_deliverables.md" }
  ],
  "hardware": [
    { "group": "Machine", "item": "Mazak VQC-20/40", "detail": "S/N 060231, original control Mazatrol M-2", "status": "CONFIRMED", "source": "machine plate / 41434WB docs" },
    { "group": "Control", "item": "LinuxCNC host", "detail": "Debian 13, LinuxCNC 2.9.10, PREEMPT-RT; NIC enp0s31f6 at 10.10.10.1/24", "status": "CONFIRMED", "source": "repo config" },
    { "group": "Mesa", "item": "7i80HDT", "detail": "Ethernet FPGA host at 10.10.10.121; P1 = 7i44, P2 = 7i49, P3 empty", "status": "CONFIRMED", "source": "docs/architecture_decision.md" },
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
    { "group": "Lighting", "item": "Spindle-head work light", "detail": "100VAC lamp, OEM CN6 pin 8 (wire WL / 3-34); assigned 2026-08-09 to 7i84U-B OUT9 via new interposing relay RLY-8; RESERVED 2026-08-11 (hal_net none) until RLY-8 is wired - OUT9 drives the relay coil only, lamp circuit is 100VAC", "status": "PENDING_BENCH", "source": "wiring/bbia1_cn_pinouts.md; PR #55" },
    { "group": "Lubrication", "item": "Nippon Gerotor motor-trochoid pump", "detail": "Headstock / spindle lube circuit", "status": "CONFIRMED", "source": "photo 2026-08-09" },
    { "group": "Safety", "item": "Hardwired E-stop chain", "detail": "Remains authoritative; removes hazardous power independently of LinuxCNC. 7i84U-A TB2 IN29 is monitor only.", "status": "CONFIRMED", "source": "docs/authority_hierarchy.md" }
  ]
};
