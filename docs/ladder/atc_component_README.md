# ATC + Orient Component Skeleton — rung-to-code map

**Status:** Never run on the machine. Both `.comp` files now compile clean under
`halcompile` (2026-08-15, no errors in either file) and are exercised by the
no-hardware regression harness in [`tests/hal/`](../../tests/hal/README.md),
which drives them under `halrun` with simulated inputs. That is evidence about
the *code* only: it says the transcribed logic behaves as transcribed. Treat
every timer, coordinate, polarity and direction below as unverified, and do not
advance any `authority_status` on the strength of a passing harness run.

**What this covers:** the LinuxCNC implementation of the Mazatrol M-2 spindle
orient / gear shift sequence and the ATC confirmation layer, derived from
[`orient_ladder_transcription.md`](orient_ladder_transcription.md) and
[`atc_ladder_transcription.md`](atc_ladder_transcription.md).

## Files

| File | Role | Ladder equivalent |
|---|---|---|
| `linuxcnc/components/mazak_orient.comp` | gear shift + orient state machine | sheets 23, 28–30, 55 |
| `linuxcnc/components/mazak_atc.comp` | ATC confirmations, magazine arithmetic, alarms | sheets 31–36, 58, 65 |
| `linuxcnc/remap/toolchange.ngc` | remapped M6 — owns all axis motion | cycles A–F, sheets 67–75 |
| `linuxcnc/atc_orient.hal` | net wiring to the pin-authority nets | — |
| `linuxcnc/atc_orient.ini.snippet` | INI additions (HALFILE, `num_dio`, REMAP, `[ATC]`) | — |

## Division of labour

The OEM PLC never moved an axis. It raised reference-point commands
(`ZP1.B.N` / `ZP2.B.N`) and confirmed mechanical results; the NC did the moves.
The retrofit keeps that split exactly:

- **`toolchange.ngc`** = the `MEM-n` step latches. It sequences, it moves Y and Z,
  it waits.
- **the two comps** = the `CND-n` completion rungs. They confirm, interlock, and
  alarm. They never decide to advance a step; they publish permits, and they
  drop a permit or latch a fault instead of letting a move happen.

A pure HAL state machine was rejected for the same reason the OEM did not build
one: the axis moves belong to the interpreter, and a remapped M6 gets feed hold
during the change (`ATCFHDME`, rung 6701) for free.

## Rung → code map

### Orient / gear shift — `mazak_orient.comp`

| Rung | Element | Implementation |
|---|---|---|
| 2302 | HYD.M (Y096) | `hyd_pump_on = machine_ready && servo_ready && estop_ok` |
| 2304/2305 | T-0 → SSET.M (Y092) | `drive_arm`, on-delay `drive-arm-delay`, sealed; dropped by loss of the machine/servo/E-stop permissive, AL46, or the external FR-SX fault input |
| 2806–2809 | M38CD/M39CD, HSR/LSR | **not** in the comp — `gear-select-hi/lo` are inputs, driven in HAL from commanded RPM (`comp` block in `atc_orient.hal`) |
| 2901 | GSFTC gear shift command | `shift_pending`, set when the target PRS is not made and a range or the orient memory is active |
| 2902/2904 | GSFME / GSF.N | `gear_shifting` = pending-and-unconfirmed, or neither PRS made |
| 2905/2906 | T-5 → ENGS | `zero-speed-dwell` on-delay of `spindle_zero_speed && !spindle_run && mid_shift`; **no solenoid moves before it expires** |
| 2907/2910 | GSH.M / GSL.M | pickup on `ENGS && !own-PRS`, sealed while the range stays selected, mutually interlocked, blocked by AL47 |
| 3001 | CTL.M (Y094) | `orient_lo_gear = gear_lo_sol` — a combinational mirror, not a step |
| 3003/3008 | SOME2 / UOME2 | `orient_memory` latch; `orient_cancel` dominates |
| 3004 | ORCM1.M (Y093) | requires orient memory, a PRS confirmed, `!mid_shift`, `!AL45`, `!AL46`, drive armed; sealed |
| 3006 + 5509 | T-6 → SOSA (M92) | `arrival-debounce` on ORA1, then the `oriented_latch` seal while ORCM1 stands |
| 5506 | AL44 | `oriented_latch && !orient_cmd` for `no-cmd-alarm-delay` — warning only |
| 5507 | AL45 | `orient_cmd && !latched` for `orient-timeout` — drops ORCM1 |
| 5508 | AL46 | `oriented_latch && !zero_speed` for `zero-speed-debounce` — **hard fault**, drops the drive arm and ORCM1 |
| 5510/5511 | T-19 → AL47 | gear shift watchdog; blocks **both** solenoids until reset |

### ATC — `mazak_atc.comp`

| Rung | Element | Implementation |
|---|---|---|
| 6504/6505 | TCME / TCME.M (Y095) | `cycle_active` latch, `atc_barrier` |
| 6509–6511 | TS0 / T0 / EQTST | `cycle_select`: 0 skip, 1 full (D), 2 load-only (ladder cycle **F**), 3 return-only (ladder cycle **E**) — letters per the 2026-09-02 audit; behavior unchanged |
| 3205–3210 | TNPS1–5, MOV on MIPRS | 5-bit BCD (weights 1, 2, 4, 8, 10 — `K2M216` is two BCD digits) latched **only while `mag_in_pos`**; `pot_number_valid` says whether it has ever been captured |
| 3311–3319 | GRTCD, D16, MRF/MRR | `index_distance` = signed shortest path modulo `pot-count`; forward when `diff <= pot-count/2` |
| 3401 | MSTP | `index_done` = `mag_in_pos && pot == target` |
| 3404–3407 | TSME, TSOFF/T29 | `index_active`; `pot-lost-timeout` between MIPRS pulses → `fault-pot-lost`, magazine stops |
| 3408, 3501/3502 | MROT, MFWD/MREV | `mag_rotate_enable` requires cover verified open, permissives, no fault, unclamp not energised |
| 3504–3507 | GRT15/20/24/30 | `fault_tool_range` when the commanded tool or pot exceeds `pot-count` |
| 3508/3604 | TUCME / TUC.M (Y097) | unclamp gated on `oriented_latch && spindle_stopped && !spindle_run && hydraulic_ok`; sealed; clamp is the de-energised state |
| 3509 | M69 | `unclamp_confirmed` = commanded **and** TUCPRS |
| 3607 | M64 | `clamp_confirmed` = TCPRS **and** unclamp output false — both terms, as drawn |
| 3601–3603 | footswitch pulses | `manual_unclamp_pb`, level-following, outside a cycle only (see deviations) |
| 31xx, 7009 | MGC.M / MGCOX | one solenoid, energise-to-close; `cover_open_verified` = `!sol && open-RS && !AL71 && !AL74` |
| 5801–5807 | AL71–AL77 | four cover alarms on a `cover-confirm-delay` (T30) disagreement, plus AL75/AL76 detects and AL77 tool life |
| 7103/7205/7302 | D-1 / E-1 / F-1 gate | `step1_permit` — oriented latch, spindle stopped, cover open, the cycle's tool detect, permissives |

### Cycle chains — `toolchange.ngc`

| Ladder | NGC |
|---|---|
| cycles A/B/C prep, ZP1/ZP2 commands | `G53 G0` moves to `#<_ini[ATC]REF1_Z>` / `REF2_Z` / `REF1_Y` / `REF2_Y` |
| D-1 / E-1 / F-1 | `M64 P4` (arm detects) then `M66 P0` (wait `step1_permit`) |
| D-2 / E-2 / F-2 | Z to ref-1, `M64 P2`, `M66 P1` (unclamp confirmed) |
| D-3 + CNDD-3AX | Z to ref-2, `M64 P3`, `M66 P3` (index done) |
| D-4 / E-3 / F-3 | Z to ref-1, `M65 P2`, `M66 P2` (clamp confirmed) |
| D-5 / F-4 | retract, close cover, `M66 P7` |
| AFINPLS (3007) | `M64 P5` finish pulse, `M64 P7` unorient, `M65 P0` |
| Abort / E-stop | `ON_ABORT_COMMAND` calls `on_abort.ngc`; P8 drives `cycle_abort`, P0-P7 are cleared, and no recovery motion is attempted |
| OTNEG.N (7505) | not implemented — normal Y soft limit remains +0.0394 and `DRY_RUN=1` blocks the live change until the dedicated ATC-zone permit is implemented |
| INTF.N / INTF2.N | not implemented — plain clearance move; needs tool-length-aware Z (ATC doc open question #3) |

## Digital pin map (M62–M66)

Requires `num_dio=16` on the `motmod` loadrt line.

| Dir | Pin | Net | Consumer/source |
|---|---|---|---|
| out | P0 | `atc-cycle-active` | `mazak-atc.cycle-start` (TCME) |
| out | P1 | `atc-cover-close-req` | `mazak-atc.cover-close-request` (MGC.M) |
| out | P2 | `atc-unclamp-req` | `mazak-atc.unclamp-request` (TUCME) |
| out | P3 | `atc-index-req` | `mazak-atc.index-request` (TSME) |
| out | P4 | `atc-detect-check` | `mazak-atc.tool-detect-check` |
| out | P5 | `atc-cycle-finish` | `mazak-atc.cycle-finish` (AFINPLS) |
| out | P6 | `orient-req` | `mazak-orient.orient-request` (SOME2) |
| out | P7 | `orient-cancel-req` | `mazak-orient.orient-cancel` (UOME2) |
| out | P8 | `atc-abort-request` | ORed with inverted `estop-ok` and `spindle-fault` into `mazak-atc.cycle-abort` |
| in | P0 | `atc-step1-permit` | `mazak-atc.step1-permit` |
| in | P1 | `atc-unclamp-conf` | `mazak-atc.unclamp-confirmed` (M69) |
| in | P2 | `atc-clamp-conf` | `mazak-atc.clamp-confirmed` (M64) |
| in | P3 | `atc-index-done` | `mazak-atc.index-done` (MSTP) |
| in | P4 | `atc-cover-open-ok` | `mazak-atc.cover-open-verified` (MGCOX) |
| in | P5 | `spindle-oriented-latch` | `mazak-orient.oriented-latch` (SOSA) |
| in | P6 | `atc-fault-any` | OR of both components |
| in | P7 | `atc-cover-closed-ok` | `mazak-atc.cover-closed-verified` |

The target pocket is not a digital pin: `iocontrol.0.tool-prep-pocket` nets
straight to `mazak-atc.target-pot`.

## Deliberate deviations from the ladder

1. **M38/M39 decode is gone.** The range target comes from commanded RPM
   through a `comp` block. The ladder's HSR/LSR seal behaviour survives inside
   the component (the last valid selection is held if the caller asserts both
   or neither).
2. **AL47 watchdog is not qualified with `#SOME2`.** Rung 5510 runs T-19 only
   for shifts that are *not* orient-driven. The component supervises every
   pending shift, which is strictly safer.
3. **AL46 is debounced** with `zero-speed-debounce` (T-16 exists in the ladder
   at rung 5501 for the same purpose) so a legitimate spin-up after unorient
   cannot trip it on one scan.
4. **Manual unclamp is level-following, not a latching footswitch pair.** The
   ladder uses TUCPLS/TCLPLS pulses with a seal (rungs 3601–3604). Holding the
   button is less surprising during commissioning and cannot leave the coil
   sealed on. Gated to outside an ATC cycle, spindle stopped, not running.
5. **`OTNEG.N` soft-overtravel neglect is not reproduced.** Set the LinuxCNC
   soft limits to include the toolchange positions.
6. **The barrier also extends on cover-open**, matching rung 6505's
   `(OTR.B · MGCORS)` branch, even outside a cycle.
7. **Clamp supervision only runs inside a cycle**, because outside one the
   spindle may legitimately sit empty with neither prox made.
8. **Tool-detect gating follows physics, not the drawn rung pairing.** The
   ladder pairs MGTDPRS/AL76 with cycles D and E-return (7103/7205, 5808)
   and SPTDPRS/AL75 with cycle F-load (7302, 5807) — the reverse of what
   the sensor names suggest. Until X005/X05B physical identity is
   bench-verified (transcription open question 6), the component checks the
   pot detect where a tool must be in the pot (full, load) and the spindle
   detect where a tool must be in the spindle (return). Revisit both this
   and the `MAG_TOOL_AVAILABLE`/`SPINDLE_TOOL_AVAILABLE` signal-map names
   once the switches are identified on the machine.

## Placeholders — nothing here is a measured value

| Placeholder | Where | What it needs |
|---|---|---|
| all seven orient timers | `mazak_orient.comp` params, restated in `atc_orient.hal` | the M-2 timer base (orient doc open question #1) |
| `cover-confirm-delay` (T30), `pot-lost-timeout` (T29) | `mazak_atc.comp` | M-2 timer table (ATC doc open question #4) |
| `index-timeout`, `unclamp-timeout`, `clamp-timeout` | `mazak_atc.comp` | pure engineering guesses, no ladder equivalent |
| `pot-count = 20` | `mazak_atc.comp` | the real magazine size (ATC doc open question #5) |
| `REF1_Z=-5.9055`, `REF2_Z=0`, `REF1_Y=0`, `REF2_Y=9.5000` in | `[ATC]` in the active INI | Recovered from the live M-2 RP values; still requires reduced-rapid dry verification before motion |
| `gear-range.in1 = 434` RPM | `atc_orient.hal` | Recovered GH3 low-range maximum; verify actual shift behavior and hysteresis |
| BCD weights 1/2/4/8/10 | `mazak_atc.comp` | confirm T21P really is the tens digit and not a 16-weight bit |
| magazine direction fwd→CW | `atc_orient.hal` | `authority_conflicts.md` §3 (SOL-8A/8B) |
| every `hm2_7i80.0.7i84.0.0.*` name | `atc_orient.hal` | `halcmd show pin hm2` against real firmware |
| every input polarity | `atc_orient.hal` | measure normal states, then consume `input-NN` (raw) or `input-NN-not` (complement) per [sserial(9)](https://linuxcnc.org/docs/html/man/man9/sserial.9.html); no `invert_input` parameter exists |
| SSET (Y092) Mesa pin | `spindle-drive-arm` net, unbound | Decide whether this exact FR-SX needs a physical drive-arm input and allocate it before use |
| `atc-barrier` device | `hm2_7i80.0.7i84.0.1.output-06` (7i84U-B TB3 OUT6) | confirm the barrier solenoid exists on SN 060231 |

## Remaining blocking gaps

1. **MIPRS (X00D, magazine in-position)** has a current PROPOSED assignment on
   7i84U-A IN28 and HAL uses IN28. The remaining blocker is physical identity,
   polarity, and end-to-end behavior; the BCD pot value is only captured while
   this input is true.
2. **Magazine direction** has authority rows `MAG_CW_SOL` / `MAG_CCW_SOL` on
   OUT13/OUT14, but both are `HOLD_CONFLICT` and physically unbound because the
   SOL-8A/SOL-8B direction mapping is unproven.
3. **`gear-lo-sol` (TB2 OUT8) is `HOLD_CONFLICT`** and is intentionally left
   unbound to hardware in `atc_orient.hal`. The component drives the net, so it
   can be watched in halscope before anything is wired.
4. **SSET, timer bases, input polarities, pot count, valve identity, and the
   exact FR-SX terminal map remain unverified.** These cannot be resolved by a
   HAL-only edit.

## Integration steps

1. Resolve the blocking gaps above and promote authority rows only when the
   corresponding continuity/polarity evidence is filed.
2. Run `scripts/validate_authority.py` and
   `scripts/validate_control_logic.py`; both must report zero errors.
3. `bash tests/hal/install_components.sh`, which runs
   `sudo halcompile --install` on each component. Both compile clean as of
   2026-08-15. Install them one file per invocation — passing both `.comp` files
   to a single `halcompile` call fails with `Duplicate option name singleton`,
   because halcompile does not reset its option table between files.
4. Confirm the already-merged active INI/HAL settings against
   `linuxcnc/atc_orient.ini.snippet`, including `num_dio=16`, the M6 remap,
   abort handler, `[ATC]` values, and `DRY_RUN=1`.
5. Start LinuxCNC with **no field power on the 7i84U-A/B outputs**. Confirm every
   pin exists and no net is double-driven (`halcmd show net`).
6. Use a dedicated no-hardware component test configuration to drive simulated
   ORA1/SZS, BCD/MIPRS, and cover inputs. Do not try to `setp` a component input
   or signal that is still linked to an hm2 output pin. Verify every alarm,
   abort source, and output-safe transition in the test harness.
   Implemented as [`tests/hal/`](../../tests/hal/README.md) —
   `python3 tests/hal/run_tests.py`. It loads one component at a time into a
   bare `halrun` session with no Mesa driver and no motion controller, so no
   component input is ever linked to an hm2 pin. Read that README's "What this
   does not prove" section before citing a passing run.
7. Recover the real timer values and the ZP1/ZP2 coordinates. Replace the
   placeholders.
8. Only then bring up hardware, one output at a time, per the bring-up order in
   `linuxcnc/README.md` — hydraulics and gear shift before anything touches a
   tool, and no tool in the spindle until clamp/unclamp confirm correctly.
