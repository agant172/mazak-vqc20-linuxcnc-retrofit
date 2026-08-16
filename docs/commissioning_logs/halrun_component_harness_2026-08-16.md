# halrun component harness — run record, 2026-08-16

> **ROLE: TEST RECORD (code only)** — a result about the transcribed ladder logic,
> not about the machine. Produces **no electrical evidence**. See
> [What this does not prove](#what-this-run-does-not-prove).

**Machine:** Mazak VQC 20/40B, SN 060231
**Date:** 2026-08-16
**Where run:** OptiPlex 7050 (`LinuxCNC`), at the machine — but nothing was energized
**Result:** **PASS** — 12 scenarios, 405 checks, 0 failed, 38.4 s, exit 0

---

## Environment

| Item | Value |
|---|---|
| Repo commit | `925ee7d` (branch `main`, clean apart from untracked `.claude/`, `__pycache__/`) |
| Host | OptiPlex 7050, hostname `LinuxCNC` |
| Kernel | `6.12.101+deb13-rt-amd64` (PREEMPT-RT) |
| LinuxCNC | `linuxcnc-uspace 1:2.9.10` |
| Python | 3.13.5 (stdlib only, no pip) |
| Harness | `tests/hal/run_tests.py`, all scenarios |

**Hardware in the loop: none.** No Mesa driver was loaded, no motion controller, no
`hm2_eth`, no axis, spindle, solenoid, or coil. No LinuxCNC/HAL session was running when
the harness started — only a `pickconfig.tcl` config-chooser dialog was open (pid 647048),
which holds no HAL session. Nothing on the machine could move as a result of this run.

### Component staleness check — PASS

`loadrt` resolves the installed `.so`, never the `.comp` in the repo, so the installed
build was hash-checked against source before the run. Both matched exactly, meaning the
tested binaries were built from the repo source at commit `925ee7d`:

| Component | Installed `.sha256` = repo `.comp` sha256 |
|---|---|
| `mazak_atc` | `82f209ef74212e62e4b0567c761bbdf6977d1731488043d431a7cbc00e7a34f8` |
| `mazak_orient` | `3adbcf780830b3273c4abe6faf04041855d58bb9631854feb9f48f72a9479138` |

Modules installed at `/usr/lib/linuxcnc/modules/` on 2026-08-15 14:24 by
`tests/hal/install_components.sh`. No reinstall was needed for this run, and none was done.

---

## Result detail

```
12 scenarios, 405 checks, 0 failed, 38.4s
EXIT=0
```

| Scenario | What it exercises | Checks | Time |
|---|---|---|---|
| `atc_bcd_decode` | Magazine BCD pot decode: weights 1/2/4/8/10, captured only while in-position | 28 | 1.4 s |
| `atc_clamp_timeout` | Clamp timeout drops the clamp coil, does not leave it energised | 19 | 3.1 s |
| `atc_cover_faults` | AL71–AL74 magazine-cover alarms each latch on their own condition | 50 | 4.4 s |
| `atc_cycle_select` | Cycle-selection matrix: EQTST > TS0 > T0 > full change | 49 | 1.4 s |
| `atc_pot_lost` | Losing MIPRS mid-index stops the magazine and invalidates the pot number | 38 | 3.2 s |
| `atc_tool_range` | Tool/pot range fault 6101 latches, follows pot-count, poisons permissives | 29 | 3.5 s |
| `atc_unclamp_gating` | Unclamp only energises with SOSA, zero speed, no spindle run, hydraulics | 30 | 2.8 s |
| `orient_al46_rotating` | AL46 (oriented while rotating) is a hard fault that drops the drive arm | 33 | 2.4 s |
| `orient_drive_fault` | An FR-SX drive fault drops the drive arm and every orient output | 26 | 2.5 s |
| `orient_gear_shift` | Gear-shift chain: mid-shift detect, ENGS zero-speed dwell, solenoid seal | 58 | 6.9 s |
| `orient_reset_edge` | A *held* orient fault-reset does not suppress faults — reset is edge triggered | 27 | 5.8 s |
| `timer_defaults` | Shipped timer/parameter defaults have not changed silently | 18 | 0.9 s |

---

## What this run does **not** prove

Restating `tests/hal/README.md` so this record cannot be quoted out of context. A green
run means the transcribed logic behaves as transcribed, on a desktop, with timers scaled
down to milliseconds. It does **not** mean:

- the transcription in `docs/ladder/` matches the physical M-2 ladder,
- any pin assignment, polarity, or wire is correct,
- any timer value is right for the machine — every one is an UNVERIFIED placeholder
  (`mazak_atc.comp:31-34`, `mazak_orient.comp:36-40`),
- the magazine size, BCD bit weighting, or solenoid direction is confirmed.

**No `authority_status` value in `mesa/current_pin_authority.csv` may be advanced on the
strength of this run.** It sits below `TRACED` in the taxonomy in
`docs/pre_power_deliverables.md#new-evidence-state-taxonomy` — evidence about *code*, not
about the machine.

---

## Reproducing

```bash
bash tests/hal/install_components.sh          # once; sudo, writes root-owned .so to /usr/lib/linuxcnc/modules
python3 tests/hal/run_tests.py                # all scenarios
python3 tests/hal/run_tests.py atc_pot_lost   # one scenario
```

Exit 0 = all passed, 1 = an assertion failed, 2 = the harness could not run. Serial by
necessity — HAL is a single machine-wide shared-memory session, enforced by a lockfile — so
do not launch a LinuxCNC config while the harness is running.

Requires `halcompile`, `halrun`, `halcmd` from a LinuxCNC install, so **this can only run on
the OptiPlex**. It is deliberately not part of the Authority gate CI workflow, which is
pure-Python and hardware-free.

Related: [`tests/hal/README.md`](../../tests/hal/README.md),
[`docs/ladder/atc_component_README.md`](../ladder/atc_component_README.md) (integration step 6).
