# `halrun` component regression harness

Behavioural tests for `linuxcnc/components/mazak_atc.comp` and
`linuxcnc/components/mazak_orient.comp`, run against a real LinuxCNC realtime
session with **no hardware, no motion controller, and no Mesa driver**.

This is integration step 6 from
[`docs/ladder/atc_component_README.md`](../../docs/ladder/atc_component_README.md):

> "Use a dedicated no-hardware component test configuration to drive simulated
> ORA1/SZS, BCD/MIPRS, and cover inputs. Do not try to `setp` a component input
> or signal that is still linked to an hm2 output pin. Verify every alarm, abort
> source, and output-safe transition in the test harness."

## What this does not prove

Read this before quoting a passing run anywhere.

These tests exercise the components against the **ladder transcription in
`docs/ladder/`**, on a desktop, with timers scaled down to milliseconds. A green
run means the transcribed logic behaves as transcribed. It does **not** mean:

- the transcription matches the physical M-2 ladder,
- any pin assignment, polarity, or wire is correct,
- any timer value is right for the machine (every one is an UNVERIFIED
  placeholder — see `mazak_atc.comp:31-34` and `mazak_orient.comp:36-40`),
- the magazine size, BCD bit weighting, or solenoid direction is confirmed.

**No `authority_status` value in `mesa/current_pin_authority.csv` may be
advanced on the strength of a passing run here.** This harness produces no
electrical evidence. It sits below `TRACED` in the taxonomy in
`docs/pre_power_deliverables.md` — it is evidence about *code*, not about the
machine.

## Running

```bash
bash tests/hal/install_components.sh     # once; writes to /usr/lib/linuxcnc/modules (sudo)
python3 tests/hal/run_tests.py           # all scenarios
python3 tests/hal/run_tests.py atc_clamp_timeout   # one scenario
```

Exit 0 = all passed, 1 = an assertion failed, 2 = the harness could not run.

Stdlib-only Python 3, no pip installs — same constraint as `io-dashboard/tools/`.
Requires `halcompile`, `halrun`, `halcmd` from a LinuxCNC install.

The install step is deliberately separate and explicit: it writes root-owned
`.so` files into a system directory, which is not something a test runner should
do silently.

**Leave the installed components in place.** They are not test-only scaffolding:
`linuxcnc/atc_orient.hal` (HALFILE 4 in `mazak_vqc_20_40.ini`) does
`loadrt mazak_orient` / `loadrt mazak_atc`, so the real machine configuration
will not start without them. Installing them is integration step 3 in
`docs/ladder/atc_component_README.md`, not a side effect of testing.

### Staleness is a hard stop

`loadrt` resolves the installed `.so`, never the `.comp` in the repo. An edited
component that has not been reinstalled would therefore be skipped silently: the
suite would exercise the *previous* build and report 405 green checks while the
source it claims to cover is untested. A false pass is worse than no test.

`install_components.sh` records the SHA-256 of each `.comp` it built from, and
`run_tests.py` preflights by comparing the working-tree source against it,
refusing to run (exit 2, not 1) on a mismatch:

```
PREFLIGHT: STALE: mazak_atc.comp differs from the source mazak_atc.so was
  built from (f7b6f613e1b8 vs 82f209ef7421) - reinstall with
  tests/hal/install_components.sh, or the suite would test the previous
  build and pass
```

The comparison is a content hash, deliberately **not** an mtime: any fresh
checkout or branch switch rewrites `.comp` mtimes without changing a byte, so an
mtime check fires on identical sources and trains everyone to ignore it.

### When to re-run

- **After editing either `.comp`** — reinstall first; the preflight enforces it.
- **After editing `docs/ladder/*.md`** — the vectors are derived from the rung
  text, so a changed transcription can invalidate an expectation.
- **When resolving one of the divergences below** — that is the moment a guessed
  behaviour becomes a decided one.
- **Before a commissioning step that trusts component behaviour** (ATC dry run).

Not useful after HAL, INI, or CSV edits — this harness never loads HAL. That is
what the two static validators cover.

## Relationship to the static validators

Additive, not a replacement. `scripts/validate_authority.py` and
`scripts/validate_control_logic.py` remain the commit gate for
`linuxcnc/*.hal`, `linuxcnc/*.ini`, and `mesa/current_pin_authority.csv`. They
check pin references and structure; they cannot see inside a `.comp`. This
harness covers only the reverse: component behaviour, no HAL wiring.

**The harness never modifies the components.** `validate_control_logic.py:239-246`
asserts on literal source strings inside both `.comp` files, and `:168-171`
rejects adjacent quoted strings in a declaration block. Reformatting a component
to suit a test would break the existing gate.

## Mechanics worth knowing before writing a scenario

Established by experiment, not assumption:

- **Singleton pins carry no instance index.** Both components declare
  `option singleton yes`, so pins are `mazak-atc.cycle-start`, *not*
  `mazak-atc.0.cycle-start`. The `loadrt` module name keeps underscores
  (`loadrt mazak_atc`); the HAL prefix uses dashes (`mazak-atc`).
- **Never let `loadrt` inherit a pipe.** `rtapi_app` daemonizes holding stdout,
  so `halcmd -f x.hal | tail` hangs forever. `halharness.py` gives every
  subprocess a temp file.
- **One component per `halcompile --install`.** Passing both `.comp` files in one
  invocation fails with `Duplicate option name singleton` — halcompile does not
  reset its option table between files. A halcompile quirk, not a defect here.
- **Time is wall-clock.** Both components accumulate via `fperiod`, so a 30 s
  timeout takes 30 real seconds. Every timeout is a `param rw`, so scenarios
  scale them down with `setp`. `scenarios/timer_defaults.py` asserts the shipped
  defaults separately so the scaling cannot hide a wrong default.
- **Execution is serial.** HAL is a single machine-wide shared-memory session;
  `run_tests.py` holds a lockfile. Do not run two at once.
- **`fault-reset` is edge triggered** in both components. `setp` TRUE, run, `setp`
  FALSE. A held-high reset clears once, by design (fixed in commit `b68ff66`).

## Open questions this harness deliberately does not settle

`mazak_orient.comp` diverges from `docs/ladder/orient_ladder_transcription.md` in
several places. Some are documented as intentional in
`atc_component_README.md:128-143`; others are not explained anywhere. Tests here
assert **what the component does**, with a `# DIVERGENCE:` comment where the
ladder says otherwise, so a human can adjudicate rather than having a guess
frozen into a test:

- **T-0 polarity.** Rung 2304 runs the timer on `#HYD.M · SZS.M` (pump *off*);
  the component counts while `hyd_pump_on` is *true* (`:228`). Different
  semantics, not flagged as deliberate.
- **T-0 magnitude.** Ladder K 201 = 20.1 s; component default 2.0 s (`:177-178`,
  admits it is a bring-up value).
- **AL47 qualification.** Rung 5510 runs T-19 on `GSFME · #SOME2` — orient-driven
  shifts are unsupervised. The component supervises any pending shift
  (documented as "strictly safer").
- **SOSA drop on cancel.** Rung 5509's `‖ ORA1` branch would hold SOSA regardless
  of unorient; the component forces `sosa = 0` on cancel (`:338`).
- **ORCM1 term set.** Rung 3004 carries `#TOUCH.N`, `#DIHT.N`, `#PGEND.P`,
  `10000S`, `(TCME · #EQTST)`, `#UOME2`; the component models none of these and
  adds `drive_arm`, which is not a rung 3004 term.
- **AL44's `HYD.M` term** is absent from the component (`:357`).

Timer *values* remain unrecovered pending the M-2 timer table — open question 1
in `orient_ladder_transcription.md:112` and question 4 in
`atc_ladder_transcription.md:178`.
