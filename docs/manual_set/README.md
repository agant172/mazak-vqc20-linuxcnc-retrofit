# Mazak VQC-20/40 (SN 060231) — LinuxCNC/Mesa Retrofit Manual Set

Rev A — compiled 2026-07-17 from project sources.

> **OBSOLETE — DO NOT USE REV A FOR WIRING OR POWER-UP.** The checked-in PDFs predate the current 7i80HDT/7i49/7i44/two-7i84U architecture. They contain retracted 7i97T material and a dangerous 7i84U TB1 error that labels pins 2 and 4 as returns; those pins are actually duplicate positive VFIELDB/VFIELDA terminals. Current authority is `mesa/current_pin_authority.csv`. Reissue the PDFs before field use.

## Volumes

| File | Contents |
|---|---|
| Vol0_Master_Guide_and_TOC.pdf | How the set is organized + master table of contents |
| Vol1_Overview_and_Safety.pdf | Machine specs, conversion summary, safety chapters |
| Vol2_Operation_Manual.pdf | Operating the converted machine under LinuxCNC |
| Vol3_Mesa_Conversion_Manual.pdf | Architecture, install, resolver interface, bring-up |
| Vol4_Wiring_Diagrams_and_IO_Reference.pdf | Drawn wiring diagrams + full pin maps |
| Vol5_Maintenance_and_Troubleshooting.pdf | Schedules + troubleshooting trees |
| Vol6_Reference_Glossary_Index.pdf | Original manual library, glossary, alphabetical index |

## Sources of truth (regenerate from these when they change)

- `~/GitHub/Github LinuxCNC/mesa/current_pin_authority.csv` (wiring truth table)
- `~/GitHub/Github LinuxCNC/docs/architecture_decision.md`
- `~/GitHub/Github LinuxCNC/docs/project_status.md`
- `~/Library/CloudStorage/OneDrive-Personal/OneDrive Docs/Mazak/Manuals_SN060231/` (original Mazak manuals)

## Status note

Project is planning/bring-up stage. Pin tables carry PLAN_VERIFY /
ACCEPTED_VERIFY statuses — trace in the cabinet before landing wires.
Re-issue as Rev B once bring-up locks the real HAL pin names and
measured normal states.
