<!-- Superseded Phase 1 commissioning draft, recovered 2026-08-21. -->

> **ROLE: HISTORICAL** — a superseded draft kept for provenance. **Not the live
> configuration and not a candidate to load.** The live config is the top level of
> [`../`](../). See [../../INSTALL_SPINE.md](../../INSTALL_SPINE.md).

# Phase 1 commissioning draft — 2026-08-07

Recovered 2026-08-21 from `~/Projects/Mazak-Local/commissioning/`, which was
retired that day. It existed only on the two Macs — never in this repo, Drive or
the vault — so it is committed here for provenance rather than left in an archive
folder.

## Do not load this

**Every `hm2_7i80.0.*` pin name in it is a placeholder.** `phase1_main.hal` says so
in its own header:

> *PLACEHOLDER PIN NAMES: every `hm2_7i80.0.*` name is unverified. After the first
> `hm2_eth` load, run `halcmd show pin hm2` and replace names that differ.*

It is also **older than the live configuration** — 2026-08-07, against
`motion_7i80hdt.hal` at 2026-08-17 and `field_7i84u.hal`/`mazak_vqc_20_40.hal` at
2026-08-15. Treat it as a snapshot of thinking before the 7i80HDT pin names were
confirmed by `readhmid`, not as an alternative to what is at `linuxcnc/`.

**It is deliberately in a subdirectory.** `scripts/validate_authority.py` globs
`linuxcnc/*.hal` at the top level only, so nothing here is checked against
`mesa/current_pin_authority.csv` — which is correct for placeholder pins, and the
reason it must not be promoted to the top level as-is.

## What it contains

| File | |
|---|---|
| `phase1.ini` | Phase 1 INI — minimal motion + safety |
| `phase1_main.hal` | 148 lines — motion, analog, E-stop |
| `phase1_field.hal` | 67 lines — field I/O via the two 7i84U |
| `tool.tbl` | stub tool table |
| `mazak_commissioning_ALL_dryrun.json` | dry-run commissioning plan, all phases |

The scope it set for itself: LinuxCNC comes up and jogs X/Y/Z on resolver feedback
with limits, homes, drive-enables and a real E-stop — **no spindle, no ATC, no
coolant/air/magazine**. Roughly 15 signals; every other Mesa pin left unwired. PID
gains are **0 on purpose** so the axes hold rather than move until FF1/P are tuned
during bring-up.

## Why it may still be worth reading

The staged approach and that deliberate safe-first state (zero gains, hold, no
spindle) are the parts worth keeping in mind at bring-up, even though the pin names
and the config around them have moved on.
