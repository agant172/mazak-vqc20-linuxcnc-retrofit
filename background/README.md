# background/ — the shelf

Material kept for the record and for the owner's understanding of the machine —
**none of it is needed while installing or wiring**. The load-bearing install
path is [`INSTALL_SPINE.md`](../INSTALL_SPINE.md).

> Before treating anything here (or any older document) as current, check
> [`docs/superseded_claims_2026-08-06.md`](../docs/superseded_claims_2026-08-06.md)
> — the register of retracted claims. Nothing on this shelf may be used to
> resurrect a retracted claim.

## Files on this shelf

| File | Why it is background |
|---|---|
| [`frsx_orient_detector_capture.md`](frsx_orient_detector_capture.md) | Capture procedure for identifying the FR-SX orient detector — largely superseded by the committed FR-SX maintenance manual ([`docs/frsx_maintenance_manual_notes.md`](../docs/frsx_maintenance_manual_notes.md)). |
| [`mesa_pcw_bitfile_inquiry.md`](mesa_pcw_bitfile_inquiry.md) | Historical: the pre-order bitfile inquiry to Mesa. The bitfile was received, verified, and committed (`mesa/firmware/`). |
| [`parameter_recovery.md`](parameter_recovery.md) | The recovery checklist that led to the live capture. Current values live in [`docs/parameters_sn060231.md`](../docs/parameters_sn060231.md). |
| [`parameters_factory1985_vs_live_reconciliation.md`](parameters_factory1985_vs_live_reconciliation.md) | Settled conclusion: the 1985 factory sheet must not be used as current values. |

## Background that stays where it is (pinned by citations)

Several documents are background or reference in role but **cannot move**,
because generated outputs, the pin-authority CSV, HAL/INI files, or scripts cite
them by path. They carry a `ROLE:` banner instead:

- The six code-inert ladder transcriptions in [`docs/ladder/`](../docs/ladder/)
  (estop, homing, coolant, interlocks, probe_mms, spindle_run) — cited from
  `mesa/current_pin_authority.csv` `cleanup_notes`, which ship inside
  `io-dashboard/data.js`. (The ATC and orient transcriptions are **not**
  background — the comps cite them as their authoritative source.)
- [`docs/frsx_orient_model.md`](../docs/frsx_orient_model.md),
  [`wiring/io_map_research_notes.md`](../wiring/io_map_research_notes.md),
  [`wiring/connector_crossref.md`](../wiring/connector_crossref.md) — cited by
  the io-dashboard enrichment.
- [`docs/servo_amp_analysis.md`](../docs/servo_amp_analysis.md),
  [`docs/spindle_motor_plg_encoder.md`](../docs/spindle_motor_plg_encoder.md),
  [`wiring/head_device_placard.md`](../wiring/head_device_placard.md),
  [`wiring/head_valve_hardware.md`](../wiring/head_valve_hardware.md) — cited by
  the pin authority and io-dashboard.
- [`docs/smart_serial_latency.md`](../docs/smart_serial_latency.md) (cited by
  `linuxcnc/field_7i84u.hal`),
  [`docs/y_soft_limit_atc_zone.md`](../docs/y_soft_limit_atc_zone.md) (cited by
  the active INI),
  [`docs/architecture_decision.md`](../docs/architecture_decision.md) (cited by
  `scripts/build_manual_set.py`).

**Standing rule for moving anything onto this shelf:** `git grep` the filename
first. It moves only if nothing in `scripts/`, `.github/`, `io-dashboard/tools/`,
generated outputs, or CSV `cleanup_notes` references it — and prose links are
fixed in the same commit.
