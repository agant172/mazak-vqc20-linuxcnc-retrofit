# Photo scheme

> **ROLE: GOVERNANCE** — the single photo scheme and citation format. See [../INSTALL_SPINE.md](../INSTALL_SPINE.md).


**The single scheme for this project.** Settled 2026-08-13 (owner). Two earlier
folder lists are superseded — see [Migration](#migration) to find older material.

**CORRECTED (2026-08-17):** the eight-folder Drive structure below was never
populated (or moved) — a full search of the Drive account, by folder title and
by API, found none of it; that Drive folder now holds only `Manuals_SN060231`.
The actual raw photo history (Oct 2024–present, 200+ items) was tracked down to
the account's default **Google Photos**, not Drive, collected into a shared
album:
[Mazak VQC-20 Retrofit — Control Cabinet Photos](https://photos.app.goo.gl/o59yC81mQhwYaVF68).
That album isn't exhaustive or auto-updating — it was built from visual
searches for "mazatrol" and "VQC-20", hand-filtered per date; re-run those
searches periodically to sweep in newer shots. The citation format (rule 2)
and folder taxonomy below remain the target scheme for whenever photos get
sorted — they just don't describe where the photos currently live.

## Three rules

1. **No raw photos in the repo.** Current source of raw photos is
   [Google Photos](https://photos.app.goo.gl/o59yC81mQhwYaVF68) (see correction
   above), not the [Drive folder](https://drive.google.com/drive/folders/1YYpWPyWiRuoY2z5GACSDw6H3zzSQoVdf?usp=drive_link)
   this scheme originally targeted. Any `photos/…` path in this repo means an
   external photo store, not a directory on disk.
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
