# INSTALL SPINE — the load-bearing path, in order of use

_This file is a map, not an authority. It names the files that matter during the
physical installation and the order in which they are used, and nothing else. It
**never restates** pin assignments, wire numbers, parameters, or statuses — the
files it points to are authoritative, and if this file ever disagrees with one of
them, that file wins. Anything not named here is background, reference, or
commissioning material; it is safe to ignore while standing at the cabinet._

---

## 0. Scope — where this project touches the machine

The conversion physically touches the machine at **two named planes**:

- **Plane A:** BBIA-1 terminal unit connectors, where cut and ferruled MR
  conductors land on 7i84U screw terminals and the FR-SX speed-reference trio
  reaches 7i49 AOUT3.
- **Plane B:** CNA3/CNA4/CNA5 resolver connectors and the direct X/Y/Z analog
  command pairs, home-run to the 7i49. The resolver pins are mapped; the axis
  command OEM connector pins remain on a continuity-trace hold.

The logical work product is the **ladder → HAL translation** that reproduces the
M-2's sequencing in LinuxCNC.

- **Power and E-stop are out of scope** (owner decision 2026-08-15, see
  `CLAUDE.md` § Quick non-negotiable rules). All power circuits and the entire
  E-stop system stay 100% original OEM.
- The two-plane rule and its exceptions live in `INTERFACE_ARCHITECTURE.md`.

Everything below is ordered the way it is used: gates first, then the machine
side of the plane, then the plane itself, then the computer side, then the
checks that close the loop.

---

## 1. Gates — before cutting anything

| Read | Why it gates the cut |
|---|---|
| [`docs/restore_rollback_package.md`](docs/restore_rollback_package.md) | Do **not** disconnect the Mazatrol M-2 until the baseline is captured and signed. During the rewire it stays open: **one ledger row per conductor moved**. This document accompanies the physical work, conductor by conductor. |
| [`INTERFACE_ARCHITECTURE.md`](INTERFACE_ARCHITECTURE.md) § 3 | The do-not-land list. E-stop sense conductors (`EHB`/`EMB`/`EMC` on CN2-40/41, CN3-1, CN5-4) appear on BBIA-1 but belong to the OEM safety chain — **never on a Mesa input**. The 7i49 analog/resolver path and four of six overtravel limits are untraced — do not assume a pin. |
| [`docs/dc_bus_stop_fault.md`](docs/dc_bus_stop_fault.md) § Retrofit HAL / INI implications | Two rules bind while enable wiring is landed: drive-enable outputs go **in series with** the OEM per-amplifier enables and READY chain, never in place of them; and the Z brake enters a Mesa output path only if spring-set / electrically-released is proven. Also note: any observation of the OEM control as a witness is only possible **before** the harness is cut — that window closes permanently. (The D6 measurement program itself is withdrawn; this is a closing-window note, not a deliverable.) |

---

## 2. Machine side — what the Mazak presents at the plane

| Artifact | Role |
|---|---|
| [`wiring/bbia1_terminal_unit.md`](wiring/bbia1_terminal_unit.md) | What BBIA-1 is, the connector map, the keep/retire list, and the cut-and-label procedure (§ Practical use: **label with the factory wire number first** — it is the join key for everything downstream). |
| [`wiring/bbia1_cn_pinouts.csv`](wiring/bbia1_cn_pinouts.csv) (narrative: [`bbia1_cn_pinouts.md`](wiring/bbia1_cn_pinouts.md)) | Immutable OEM reference: CN/pin → factory wire number → signal. This identifies what you are holding at the cut. Never edited by the retrofit. |

**Physical unknowns — field-trace before wiring, do not assume:**

- Four of six axis overtravel limits have **no confirmed BBIA-1 pin**
  (`wiring/bbia1_terminal_unit.md` § Axis over-travel limits).
- CN11 carries duplicate factory wire numbers on two pin pairs — verify at
  the connector (`wiring/bbia1_cn_pinouts.md`).
- The entire 7i49 analog/resolver path has **no cabinet trace**
  (`INTERFACE_ARCHITECTURE.md` § 3b) — path and routing are still design-open.

---

## 3. The interface plane — the BBIA ↔ Mesa hop (the retrofit's actual work)

| Artifact | Role |
|---|---|
| [`wiring/bbia1_source_dest.csv`](wiring/bbia1_source_dest.csv) | Both ends of every traced conductor: signal, factory wire, BBIA CN-pin, Mesa terminal. Until the § 5 consolidation in `INTERFACE_ARCHITECTURE.md` is approved, the authority CSV's BBIA-end columns are only partially populated — cross-reference here, per wire. |
| [`wiring/plane_b_pin_crosswalk.csv`](wiring/plane_b_pin_crosswalk.csv) | One row per resolver/analog conductor at Plane B, plus the corrected CN4 spindle-reference rows and explicit holds for the untraced axis-command landings. |
| [`wiring/interface_plane_crosswalk.md`](wiring/interface_plane_crosswalk.md) | Cabinet-facing index explaining which file controls each plane and what remains non-releasable. |
| [`mesa/current_pin_authority.csv`](mesa/current_pin_authority.csv) | **The gate.** One row per Mesa pin; `authority_status` decides whether a wire may be landed at all. Any `HOLD_*` or `COMMISSIONING_PENDING` row is **not cleared for wiring**. |
| [`wiring/authority_conflicts.md`](wiring/authority_conflicts.md) | Controlling conflict register: resolved solenoid identities, per-output energize blocks, and open gaps. Check the relevant entry **before landing or energizing any output** it names. |
| [`mesa/README.md`](mesa/README.md) | The 7i84U terminal-block layout quirk (TB1 = power only, TB3 = IN0–15 + OUT0–7, TB2 = IN16–31 + OUT8–15) and the pin-authority conventions. |
| [`wiring/labels/`](wiring/labels/) | The printable field artifacts: cabinet wire-reference sheet, ferrule labels, terminal legends. **Generated** — `scripts/generate_label_csvs.py` builds the label CSVs from the pin authority, and `scripts/generate_wire_reference_sheet.py` builds the printable sheets from those CSVs. Never hand-edit; regenerate. |

---

## 4. Computer side — ladder → HAL

| Artifact | Role |
|---|---|
| [`linuxcnc/field_7i84u.hal`](linuxcnc/field_7i84u.hal) **plus** [`linuxcnc/atc_orient.hal`](linuxcnc/atc_orient.hal) | The field-I/O netting. These are a **pair**: `field_7i84u.hal` explicitly defers a block of inputs to `atc_orient.hal`, so neither is complete alone. (`motion_7i80hdt.hal` covers the 7i49 side, which is entirely commissioning-pending.) |
| [`docs/ladder/atc_component_README.md`](docs/ladder/atc_component_README.md) | **The working checklist** for the ladder translation: rung→code map, the deliberate deviations from the ladder, the placeholder table, the remaining blocking gaps, and the integration steps. |
| [`linuxcnc/components/mazak_atc.comp`](linuxcnc/components/mazak_atc.comp), [`mazak_orient.comp`](linuxcnc/components/mazak_orient.comp), [`linuxcnc/remap/toolchange.ngc`](linuxcnc/remap/toolchange.ngc) | The implementation. Each cites its ladder source rung-by-rung. |
| [`docs/ladder/atc_ladder_transcription.md`](docs/ladder/atc_ladder_transcription.md), [`orient_ladder_transcription.md`](docs/ladder/orient_ladder_transcription.md) | The audit trail behind the comps — the two transcriptions the code declares as its authoritative source. (The other six transcriptions in `docs/ladder/` informed no code; they are background.) |
| [`docs/frsx_state_diagram.md`](docs/frsx_state_diagram.md) | The active spindle speed/gear/orient state model the components implement. |
| [`docs/parameters_sn060231.md`](docs/parameters_sn060231.md) | Live machine constants (reference points, soft limits, gear crossover, backlash) that INI values are transcribed from. |
| [`docs/grounding_shielding_plan.md`](docs/grounding_shielding_plan.md) | Shield termination and segregation rules applied while physically landing new-control cables. |
| [`docs/commissioning_logs/analog_cmd_plan_2026-08-08.md`](docs/commissioning_logs/analog_cmd_plan_2026-08-08.md), [`find_list_2026-08-08.md`](docs/commissioning_logs/find_list_2026-08-08.md) | The agreed 7i49 analog channel assignment, and the per-signal trace aid (element list → schematic sheet → wire number) used at the cabinet. |

---

## 5. Close the loop — after every change

Edit the **source** (`mesa/current_pin_authority.csv`, HAL files), regenerate,
commit the generated output. Hand-edits to generated files are rejected by CI.

```bash
python3 scripts/validate_authority.py        # CSV <-> HAL <-> label CSVs
python3 scripts/validate_control_logic.py    # static HAL invariants
python3 scripts/generate_label_csvs.py --write
python3 scripts/generate_wire_reference_sheet.py
python3 io-dashboard/tools/generate_data.py
git diff --stat                              # generated files must be committed, not left dirty
```

The same checks run as the Authority gate
(`.github/workflows/authority-gate.yml`) on every PR.

---

## Appendix A — values that must be verified before the machine runs

Do not duplicate these lists; they are maintained where the code is:

- [`docs/ladder/atc_component_README.md`](docs/ladder/atc_component_README.md)
  § *Placeholders* — every unmeasured value in the comps and `atc_orient.hal`
  (the timers, BCD weights, pot count, magazine direction, barrier solenoid,
  input polarities, SSET allocation, real `hm2` pin names) and
  § *Remaining blocking gaps*.
- [`docs/ladder/orient_ladder_transcription.md`](docs/ladder/orient_ladder_transcription.md)
  § *Open questions* — the M-2 timer base and the FR-SX terminal question.
- [`docs/ladder/atc_ladder_transcription.md`](docs/ladder/atc_ladder_transcription.md)
  § *Open questions* — magazine/cycle unknowns.

## Appendix B — commissioning order (after installation)

Powered commissioning is not installation. When the wiring above is landed, the
procedures run in this order, each tied to its pre-power deliverable
(`docs/pre_power_deliverables.md`):

1. [`docs/hm2_eth_nic_validation.md`](docs/hm2_eth_nic_validation.md) — D14, PC/NIC realtime qualification.
2. [`docs/stop_timing_budget.md`](docs/stop_timing_budget.md) — D7, enable/fault/Z-brake timing.
3. [`docs/resolver_commissioning.md`](docs/resolver_commissioning.md) — D8, resolver ID/phasing/scale.
4. [`docs/first_move_plan.md`](docs/first_move_plan.md) — D9, first powered axis move.
5. [`docs/servo_commissioning.md`](docs/servo_commissioning.md) — D10, velocity-loop tuning.

(D5 and D6 — E-stop verification and DC-bus survey — are **withdrawn**, owner
decision 2026-08-15; see `docs/estop_safety_chain.md` and
`docs/pre_power_deliverables.md`.)

## Appendix C — deferred work queue (owner approval required)

Recorded so it is not forgotten, and explicitly **not** part of routine work:

- The `INTERFACE_ARCHITECTURE.md` § 5 consolidation — one row per conductor,
  keyed on factory wire number, in the pin authority.
- Retiring `wiring/bbia1_retrofit_destination_crosswalk.csv` (redundant with
  the source/dest CSV + pin authority, but currently an input to
  `scripts/generate_label_csvs.py` — retiring it requires a script change).
- Clearing stale `cleanup_notes` in the pin authority that describe HAL edits
  already made, then regenerating.

**Standing rule for any future file move in this repo:** `git grep` the
filename first. Nothing moves if it is referenced from `scripts/`, `.github/`,
`io-dashboard/tools/`, generated outputs, or CSV `cleanup_notes` — several
"background" documents (the six code-inert ladder transcriptions among them)
are pinned to their paths by such citations and are demoted by banner, not
by relocation.
