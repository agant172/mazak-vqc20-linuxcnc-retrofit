# Repo relevance audit — 2026-09-06

> **ROLE: AUDIT RECORD.** What in this repository is load-bearing, what is
> reference, what is generated (and whether it is current), and what was cruft.
> Owner asked for it ("I'm the type to remove cruft whenever possible"). Four
> read-only agents each took a slice of the tree; this file is the consolidation,
> and every move/edit it describes was made by the main session in the commits
> named below. The per-file mechanical inventory the agents worked from is
> committed beside this file as [`repo_inventory_2026-09-06.csv`](repo_inventory_2026-09-06.csv)
> (path, size, last commit, inbound-reference count, ROLE banner, first citing files).

## Method

1. `git ls-files` → 403 tracked files. For each, count the *other* files that mention
   its basename (`git grep -l -F`, excluding binaries), record the last commit date,
   and whether `INSTALL_SPINE.md` names it.
2. Four agents, one per slice, read every file in scope and assigned a verdict:
   **ACTIVE** (named by the spine / CI / a generator, or a live procedure),
   **REFERENCE** (cited by something active, or a settled finding), **ARCHIVE**
   (superseded; nothing active depends on it), **DELETE** (unreferenced *and*
   duplicated/obsolete), **GENERATED** (derived; is the generator in CI, are its
   inputs current?). Agents also listed every stale statement they tripped over.
3. The repo's standing rule governed every move: a file referenced from `scripts/`,
   `.github/`, `io-dashboard/tools/`, a generated output, or an authority
   `cleanup_notes` cell **does not move** — it is demoted by banner. Every move below
   was `git grep`-verified clean first, and prose links were repointed in the same
   commit.

## Headline

| Slice | Files | Active | Reference | Archive | Delete | Generated |
|---|---|---|---|---|---|---|
| `docs/` root + `docs/ladder/` | 55 | 27 | 25 | 3 | 0 | 0 |
| logs, manuals, shelf, `bom/`, root, `.claude/` | ~68 | 11 | 34 | 12 (10 already on a shelf) | 1 | 10 (stale) |
| `wiring/`, `mesa/` | 38 | 12 | 16 | 4 (1 by banner) | 0 | 6 (5 current, 1 stale) |
| `diagrams/` | 125 | 0 | 2 | 0 | **125 — removed 2026-09-06 (owner)** | 123 (all stale) |
| `scripts/`, `io-dashboard/`, `tests/`, `linuxcnc/`, `.github/` | 122 | 82 | 23 | 16 (8 already in `retired/`) | 0 | 1 (current) |

Two things dominate: **nothing load-bearing was mis-filed** — the spine, CI, the
authority, the HAL set, the label generators and the live systemd units are all
coherent and installed byte-identical to the repo — and **every generator that is
not in CI has drifted** (diagrams, the Plane A crosswalk CSV, the Rev B manual
PDFs). The cruft was almost entirely dated snapshots that nobody had retired.

## Done in this pass

| Commit | What |
|---|---|
| `b1826ac` | Retired `wiring/bbia1_retrofit_destination_crosswalk.csv`; ferrules/wire sheet now derive from the pin authority (owner approved). |
| `d0b6a7e` | Archived the three Excel workbooks + two sibling CSVs to `archive/workbooks/`. |
| this commit | Moved: root `handoff.md` → `background/`; `docs/handoff_2026-09-04.md`, `docs/handoff_photo_tools_2026-08-25.md`, `docs/LinuxCNC_Setup_HowTo.docx`, `notes/fable_ladder_audit_prompt.md` → `archive/docs/`; `linuxcnc/phase1-draft-2026-08-07/` → `archive/linuxcnc/`; `scripts/health/switch_mesa_subnet.sh` → `archive/scripts/`; `wiring/reconciled_pin_crosswalk_2026-08-18.{md,csv}` → `archive/wiring/`; `scripts/create_wiring_workbook.py` → `archive/workbooks/`. Deleted `notes/.gitkeep` (folder gone). Banner added to `wiring/nc_circuit_landing_audit.md` (kept — four open Phase A items cite it). |
| this commit | 22 stale statements corrected — list below. |

### Stale statements corrected

`CLAUDE.md` (7i44 manual "link-only" → committed 2026-08-21; SSH "key auth only" →
password auth measured enabled 2026-09-06) ·
`README.md` (workbooks row) · `docs/project_status.md` (header date; 132→124 rows;
bring-up step 1 on the old 192.168.1.x subnet; handoff link; newest-records pointer) ·
`bom/README.md` (P1 row still said 7i49HV) · `linuxcnc/README.md` (`--device 7i80hdt`;
IN29 described as wired) · `mesa/README.md` + `mesa/mesa_firmware_checklist.md` +
`mesa/firmware/README.md` (probe IN15 as allocated; "no 7i84U powered") ·
`scripts/host_status/README.md` + `io-dashboard/README.md` ("repo is private"; 132
rows / `work-light` missing) · `docs/first_move_plan.md` (D5 prerequisite; E-stop
monitor) · `docs/smart_serial_latency.md` (1 kHz) ·
`docs/ladder/interlocks_ladder_transcription.md` (D5) ·
`docs/ladder/orient_ladder_transcription.md` ("PROPOSED") ·
`docs/frsx_state_diagram.md` (status column banner) ·
`docs/ladder_signal_audit_2026-09-02.md` (bench numbering pointer) ·
`docs/architecture_decision.md` (procurement heading) ·
`docs/io_capacity_reconciliation.md` (WORK_LIGHT) · `wiring/bbia1_cn_pinouts.md`
(M-1 → M-2) · `wiring/authority_conflicts.md` § 7.3 / § 7.5 (ferrule-from-crosswalk
paragraphs) · `tests/hal/README.md` (405 → 407 checks).

## Owner decisions — recorded as checkboxes in `project_status.md`

1. **`diagrams/` (125 files) — REMOVED 2026-09-06, owner decision.** Both sets were
   stale (ORC1 / `SPINDLE_ORIENT_CMD` drawn as a HOLD released 2026-09-03; the WireViz
   manifest's input hash never matched a committed crosswalk) and, more to the point,
   the owner never liked the output: "they look terrible and are scattered over dozens
   of pages." Both generators (`generate_wireviz_diagrams.py`,
   `generate_qelectrotech_project.py`) deleted with the work product; git history keeps
   them. **The BBIA-1 wire reference sheet is the troubleshooting quick reference for
   now**; a condensed physical-diagram format that fits on a sheet or two is still an
   open exploration, no tool chosen. `generate_interface_crosswalks.py` and the Plane A
   crosswalk CSV stay — decision 3 still applies to them.
2. **`docs/manual_set/` — REMOVED from the tree and git-ignored 2026-09-06 (owner).** The rest of this item is the reasoning as found: the Rev B PDFs were stale and knowingly wrong.
   Built 2026-08-07 from a 132-row authority, *before* the two 2026-08-23 builder
   fixes that removed retracted P1/P2/P3 claims; the PDFs were never rebuilt. CI builds
   to a temp dir as a smoke test and never compares. Recommendation: stop committing
   the PDFs (`.gitignore` the folder, keep the builder + CI step), or regenerate on
   every authority change with a diff step. Until then the committed PDFs contradict
   the repo. Builder bug to fix on the next rebuild: `build_manual_set.py:995-1000`
   points at maintenance-record paths that do not exist.
3. **`wiring/plane_a_bbia1_pin_crosswalk.csv`** (generator not in CI) is 7 notes-only
   rows behind the authority. Same fix as (1): put `generate_interface_crosswalks.py`
   in the gate.
4. **Seven live health files have no installer.** `scripts/health/{backup_watch.py,
   notify_failure.sh, repo_guard.sh}` and the `mazak-backup-watch`, `mazak-repo-guard`,
   `mazak-notify-failure@` units are installed and running (byte-identical to the repo)
   but `install_health.sh` does not deploy them — they exist because they were copied
   by hand on 2026-08-23. A reinstall would silently lose the orphan guard and the
   backup-failure notifier. Add them to `install_health.sh`.
5. **`scripts/photo_tools/` (7 files)** is a general camera-roll tool, not a retrofit
   tool (its own README says so); written after the Drive migration closed. Recommend
   relocating to `claude-config` or `project-docs`, then dropping `.gitignore:58-65`.
6. **`scripts/host_status/retired/` (8 files)** — nothing installed, nothing runs it;
   could move under `archive/` with two link edits. Left in place (lower risk).
7. **7i84U-B: on order — owner confirmed 2026-09-06.** Only 7i84U-A is on the bench.
   The `project_status.md` "Closed" line claiming all hardware on hand 2026-08-17 was
   wrong and is now annotated.
8. **Photo counts disagree** across the governance docs (723 / 936 / 1142). Pick the
   rclone figure in `CLAUDE.md` (1142 objects, 2026-08-23) and align the other two.
9. **`docs/cabinet_photo_checklist.md:34`** assigns the 7i80HDT jumpers wrong
   (W1/W2 = IP, W3 = pull-ups, W5 = flash); the manual says W2/W3 = IP, W1 = flash,
   W4 = 5 V tolerance, W5–W7 = daughtercard power. `mesa/mesa_firmware_checklist.md:211`
   has the same W5/W1 slip. Fix before the next cabinet photo pass.
10. Smaller: `docs/servo_amp_analysis.md:23` still says the Z motor is unphotographed /
    assumed (parts list identifies it as `HD101-12-TT-A`); `docs/photo_survey_misc.md:6`
    names the never-existent `Misc. Photos` Drive folder with no banner;
    `docs/crt_screen_survey_2026-08-21.md:38` predates the two-library photo sweep;
    `linuxcnc/atc_orient.ini.snippet` no longer matches the INI it claims to mirror
    (`ORIENT_TIMEOUT` 15 vs 45); `io-dashboard/README.md` still describes a C1–C10
    conflict register (`enrichment.py` holds C3/C6/C9/C10); `io-dashboard/project_data.js`
    is hand-curated and frozen at 2026-08-11; `scripts/health/install_health_macos.sh`
    + its plist have zero citations and cannot be verified from the OptiPlex.

## What is pinned and must not move (for the next person tempted to tidy)

Everything with a BACKGROUND/HISTORICAL banner that is still cited from the pin
authority's `cleanup_notes` or from `io-dashboard/data.js`: the six code-inert
ladder transcriptions, `docs/frsx_orient_model.md`, `docs/claim_audit_2026-08-07.md`,
`docs/photo_survey_misc.md`, `docs/feedback_nameplate_survey_2026-08-15.md`,
`docs/spindle_motor_plg_encoder.md`, `docs/servo_amp_analysis.md`,
`wiring/io_map_research_notes.md`, `wiring/connector_crossref.md`,
`wiring/head_device_placard.md`, `wiring/head_valve_hardware.md`,
`mesa/mesa_firmware_checklist.md` (45 cleanup_notes mentions),
`background/parameter_recovery.md` (cited by the INI),
`archive/crosswalk/element_dashboard_crosswalk.csv` (12 `primary_source` rows),
`scripts/consolidate_bbia_authority.py` (named by the validator as the re-run remedy),
`linuxcnc/pendant_whb04b.hal` (not loaded, but parsed by `generate_data.py`),
`scripts/health/orphans_acknowledged.txt` (read live by the hourly guard).

## Sources

Agent reports (four, 2026-09-06) consolidated here; `docs/repo_inventory_2026-09-06.csv`;
`INSTALL_SPINE.md`; `.github/workflows/authority-gate.yml`; live host state on the
OptiPlex (`systemctl list-timers`, `/usr/local/bin`, `/etc/systemd/system`, `cmp`
against the repo copies).
