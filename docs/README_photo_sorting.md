# Photo scheme

**The single scheme for this project.** Settled 2026-08-13 (owner). Two earlier
folder lists are superseded — see [Migration](#migration) to find older material.

## Three rules

1. **No raw photos in the repo.** They live in
   [Google Drive](https://drive.google.com/drive/folders/1YYpWPyWiRuoY2z5GACSDw6H3zzSQoVdf?usp=drive_link).
   Any `photos/…` path in this repo means a Drive folder.
2. **Cite photos as `YYYY-MM-DD/IMG_nnnn`.** Never bare `IMG_nnnn` — `IMG_0373`
   is a Z-axis servo card in one batch and a CRT screen in another
   ([`photo_survey_misc.md`](photo_survey_misc.md)). The date is what makes it unique.
3. **Keep the original filename.** Rename to
   `IMG_2065_spindle_motor_nameplate_2026-08-13.jpg` if you like, but don't drop
   the `IMG_nnnn`.

## Folders

| Folder | What goes in |
|---|---|
| `00_Inbox` | Unsorted. Dump here when in a hurry. |
| `01_Cabinet` | Cabinet bays, racks, panel space, DIN rail, motor starters, contactors |
| `02_Drives` | X/Y/Z servo amps, FR-SX spindle drive, Mesa cards, firmware notes |
| `03_Motors_Feedback` | Motors, encoders, resolvers, pickups, and their nameplates |
| `04_Wiring_Terminals` | Terminal strips, wire numbers, connectors, breakout PCB, 24 V distribution, grounding |
| `05_Machine` | Spindle head, ATC, gear shift, valves, coolant/air, operator panel |
| `06_Safety` | E-stop, safety relays, interlocks, ready chain, servo contactor |
| `07_Reference` | Manuals, schematics, placards and door legends, CRT screens, LinuxCNC/Mesa outputs |

Videos and Live Photo clips stay where they are — outside this scheme.

When a close-up matters, keep a wide shot of the same thing beside it. That one
habit has repeatedly been the difference between a readable label and a guess.

## Migration

Both older lists fold in as follows. Existing files stay findable until moved.

| Old folder | → |
|---|---|
| `01 Cabinet & Racks`, `07 Machine & Exterior` | `01_Cabinet` |
| `05 Drives & Power`, `02 Boards & PCBs` | `02_Drives` (24 V and PCB wiring → `04_Wiring_Terminals`) |
| `03 Wiring & Cabling`, `04 Connectors & Terminals` | `04_Wiring_Terminals` |
| `06 Nameplates & Labels` | the folder matching the device |
| `09 Screens & Diagnostics`, `Manuals` | `07_Reference` |
| `08 Other`, `Misc. Photos` (`My Drive/Mazak/`) | `00_Inbox`, then sort |

**Moving files is safe; renaming them is not.**
[`photo_survey_misc.md`](photo_survey_misc.md) cites ~200 photos by camera
filename — update the citation in the same pass if you rename anything.

## Outstanding

35 photo-ID rows are unfilled, so those documents' conclusions can't yet be
checked against their sources:

| Document | Rows |
|---|---|
| [`spindle_motor_plg_encoder.md`](spindle_motor_plg_encoder.md) | 15 |
| [`../wiring/head_valve_hardware.md`](../wiring/head_valve_hardware.md) | 10 |
| [`../wiring/cabinet_asfound_survey.md`](../wiring/cabinet_asfound_survey.md) | 10 |
