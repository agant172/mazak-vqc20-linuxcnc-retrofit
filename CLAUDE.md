# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Planning, documentation, and bring-up skeletons for converting a Mazak VQC 20/40 vertical
machining center (SN 060231, original Mazatrol M-2 control) to LinuxCNC 2.9.10 using Mesa
Electronics FPGA hardware (7i80HDT + 7i44 + 7i49 + 7i84U-A + 7i84U-B). This is a physical
machine retrofit project — most of the repo is HAL/INI configuration, pin-mapping data, and
heavily-referenced safety/commissioning documentation, not application software. There is no
build step and no test suite; correctness is enforced by two static validator scripts plus a
lot of cross-referenced documentation.

**Nothing in this repo is live-machine-ready.** Pin names, resolver scale, analog polarity,
and I/O normal states are placeholders/PROPOSED until physically verified. Do not write text
that implies a pin, wire, or behavior is confirmed unless the source document says so.

## Commands

Run from the repo root:

```bash
python3 scripts/validate_authority.py       # HAL physical-pin refs vs mesa/current_pin_authority.csv
python3 scripts/validate_control_logic.py   # structural/safety-logic regression checks on HAL/INI
```

Both must exit 0 before any commit that touches `linuxcnc/*.hal`, `linuxcnc/*.ini`,
`mesa/current_pin_authority.csv`, or the B-card legend. They are static checks only — they do
not replace `halcompile`, a LinuxCNC load test, or fault injection on real hardware.

I/O dashboard (offline HTML/JS viewer under `io-dashboard/`, generated from the CSV + HAL):

```bash
cd io-dashboard && python3 -m http.server 8765         # static viewer at http://127.0.0.1:8765/
cd io-dashboard && python3 serve_live.py                # adds read-only /api/io (runs `halcmd -s show sig` only)
cd io-dashboard && python3 tools/generate_data.py        # regenerate data.js after editing mesa/ or linuxcnc/
```

`serve_live.py` and `tools/generate_data.py` are stdlib-only Python 3, no pip installs. All
tools are read-only with respect to the live machine: `serve_live.py` never calls `setp`,
`sets`, `net`, or anything else that changes HAL state, and refuses non-GET requests.

## Architecture

### Hardware signal chain (see `README.md` and `mesa/README.md` for full rationale)

- **Mesa 7i80HDT** — Ethernet FPGA host (`hm2_eth`, static IP `192.168.1.121`), three 50-pin
  daughter connectors P1/P2/P3. **Connector roles confirmed 2026-08-13** by `mesaflash --readhmid`
  against the flashed `7i80hdt_rmsvss6_8.bin` firmware — this flips P1/P2 from what earlier repo
  history (and any pre-2026-08-13 memory) assumed. Trust `mesa/current_pin_authority.csv` and
  `mesa/mesa_firmware_checklist.md` over older prose if they ever disagree.
- **P1 → 7i49** (plain, not HV) — X/Y/Z Tamagawa TS2014N resolver feedback on RES0/1/2 (5 kHz
  excitation baseline); X/Z/Y servo velocity + FR-SX spindle velocity on AOUT0-3. AOUT4/5 spare.
  FR-SX orient uses the **discrete** ORCM1 command, not an analog reference.
- **P2 → unused/spare** — bare 3.3 V FPGA GPIO (`gpio.024`-`gpio.047`), **never wire 24 V field
  signals here** (no opto-isolation, will destroy the FPGA). The Renishaw MP-3 probe was
  deliberately moved off bare GPIO onto **7i84U-B input-15** for this reason — don't reintroduce
  a bare-P2 probe binding.
- **P3 → 7i44** — RS-422 smart-serial breakout, HostMot2 port 0. Physical channel 0 →
  **7i84U-A** (`hm2_7i80.0.7i84.0.0.*`), channel 1 → **7i84U-B** (`hm2_7i80.0.7i84.0.1.*`).
  Channels 2-7 are spare.
- **7i84U-A** (channel 0) — ATC, hydraulics, coolant, air, magazine, cabinet/utility field I/O.
- **7i84U-B** (channel 1) — TB3 IN0-5 X/Y/Z limits (NC), IN6-8 homes (NO), IN9 air permissive,
  IN15 probe; TB3 OUT0-2 drive enables, OUT3-7 relay loads; TB2 OUT8 proposed cover-close.

### Authority hierarchy (enforced by `scripts/validate_authority.py`, defined in `docs/authority_hierarchy.md`)

```
mesa/current_pin_authority.csv   →  AUTHORITATIVE: one row per physical Mesa pin
linuxcnc/*.hal                   →  must agree with the CSV on every physical pin reference
wiring/, docs/, PDFs, notes/     →  non-authoritative, informational only
```

When these disagree, the CSV wins — fix the CSV first, then bring HAL into line, never the
reverse. `HOLD_CONFLICT` rows must not be wired/energized until the conflict is reconciled;
the validator hard-fails any active HAL `net` binding on such a row.

### Evidence-state taxonomy (`docs/pre_power_deliverables.md`, used throughout docs and the CSV's `authority_status` column)

`PROPOSED` (paper design only) → `TRACED` → `ELECTRICALLY_VERIFIED` → `HAL_VERIFIED` →
`COMMISSIONED`. Also: `SPARE`, `RESERVED`/`RESERVED_VERIFY`, `DEFERRED`, `HOLD_CONFLICT`,
`OPTIONAL_VERIFY`, `COMMISSIONING_PENDING`. Never upgrade a status without the evidence the
label requires — e.g. `FIELD_VERIFIED`-equivalent states are for things actually measured in
the cabinet, not to make progress look further along than it is. The legacy `ACCEPTED` /
`ACCEPTED_VERIFY` states are retired; don't reintroduce them.

### `linuxcnc/` bring-up skeleton

- `mazak_vqc_20_40.ini` / `mazak_vqc_20_40.hal` — top-level INI and HAL loader.
- `motion_7i80hdt.hal` — 7i49 resolver feedback + analog outputs.
- `field_7i84u.hal` — 7i84U-A/B field I/O.
- `atc_orient.hal` — ATC + orient wiring, feeds the two custom realtime components below.
- `pendant_whb04b.hal` — optional pendant, post-bring-up.
- `components/mazak_atc.comp`, `components/mazak_orient.comp` — hand-written LinuxCNC 2.9
  realtime components transcribed from the OEM ladder logic (`docs/ladder/`). Each header
  cites the authoritative ladder sheet numbers it reproduces; **the ladder transcription is
  the source of truth for these components, not the other way around.** ATC confirmations
  (component) and axis motion (`remap/toolchange.ngc`) are deliberately split — the component
  never decides "advance to next step", it only publishes permits/faults that the remap waits on.
- `remap/` — `M6` toolchange and abort-cleanup NGC remaps.
- Safety-critical patterns enforced by `validate_control_logic.py`: no duplicate signal
  writers, correct HAL thread/load ordering, `drive-output-permit` and
  `spindle-output-permit` must be static `sets`-initialized holds (start FALSE, flipped only
  in a reviewed commissioning edit, returned to FALSE when not actively commissioning),
  Z-brake sequencing, ATC abort cleanup.

### `docs/`

Large and heavily cross-referenced; when in doubt about whether something is settled, read the
doc rather than assuming. Load-bearing ones: `project_status.md` (status/TODO tracker — check
this first for current state), `architecture_decision.md`, `authority_hierarchy.md`,
`pre_power_deliverables.md` (safety hold points — gates every bring-up step), `ladder/` (OEM
ladder transcriptions that `mazak_atc.comp`/`mazak_orient.comp` implement), `superseded_claims_*.md`
and `claim_audit_*.md` (retracted/corrected claims — don't resurrect what's listed there).

## Working conventions

- **Never state a pin, wire, voltage, or behavior as confirmed/safe unless the source document
  or CSV row says so.** This repo's documentation style is deliberately literal about what is
  verified vs. assumed (see the status taxonomy above) — match that tone in anything you write.
- Don't hand-edit `io-dashboard/data.js`; it's generated. Edit the CSV/HAL, then run
  `tools/generate_data.py`.
- Raw photos/videos are gitignored (cloud storage only); only `photos/README.md`-style
  placeholders are tracked.
- `drive-output-permit` / `spindle-output-permit` and similar holds exist specifically to keep
  the machine incapable of motion until a human has signed the corresponding hold point in
  `docs/pre_power_deliverables.md`. Treat flipping one of these as a safety-relevant change
  worth flagging, not a routine config edit.
