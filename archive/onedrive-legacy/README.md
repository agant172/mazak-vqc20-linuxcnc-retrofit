# OneDrive legacy files (archived 2026-07-06)

These files were an **older, parallel copy** of the project that lived loose in the working
folder (originally synced from OneDrive) instead of in the git repo. When the repo and this
copy diverged, the git repo was made the single source of truth and these were moved here
for reference only. **Do not treat anything in this folder as current.**

## Why keep them

The repo's active config/docs are cleaner and carry the correct resolver architecture, but
this legacy set still contains machine-specific detail that has **not** been merged into the
repo. If you need any of the following, mine it from here (verify before trusting):

- `Mazak_VQC_Project_Decisions_Log.md` — 11 dated decisions incl. Decision #11 (hydraulic
  system: NACHI unit, Fujikoshi SA-G01 solenoids SOL-10/12/13, Sanwa pressure switch) and
  Decision #10 (cabinet hardware photo inventory).
- `Mazak_VQC_Wiring_Map.md`, `Mazak_Phase2_Wiring_Plan.md`, `Mazak_Sserial_Wiring.md` —
  terminal-level wiring, 7i84U pin-by-pin I/O with part numbers, relay panel design.
- `*.xlsx` — legacy I/O workbooks (superseded by `bom/Mazak_VQC_20-40_Retrofit_IO_Workbook.xlsx`).
- `mazak.hal` / `mazak.ini` — the older HAL/INI. Wrong board prefix (`hm2_7i97` vs
  `hm2_7i97t`) and stale resolver info, but its gpio/pwmgen pin *shapes* were more correct
  than the earlier repo skeleton.

## Known discrepancies vs. the current repo

- Resolvers here are called "Mitsubishi RT-5XA"; the correct record is **Tamagawa
  RT-5XA-11 / RT-5XA-L1** (see `docs/architecture_decision.md`).
- `7i49` vs `7i49HV` was "pending" here; the repo settled on **plain 7i49 @ 5 kHz**.
