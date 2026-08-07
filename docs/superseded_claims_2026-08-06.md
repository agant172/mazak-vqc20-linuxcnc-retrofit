# Superseded / Retracted / Unverified Historical Claims

**Date:** 2026-08-06
**Audit:** P2 (fabricated & overstated historical hardware claims)
**Companion audit:** [`claim_audit_2026-08-07.md`](claim_audit_2026-08-07.md)
**Authority reference:** [`authority_hierarchy.md`](authority_hierarchy.md)

## Purpose

Prior revisions of this repo carried claims that were fabricated (never in
primary sources), overstated (weakly supported but presented as fact), or
contradicted by later evidence. Some were the product of hallucinated hardware
choices; some were second-hand forum lore promoted to specification. This
document is the single index of every such claim, its final disposition, and
the primary source used (or the lack of one).

**Rule going forward:** a claim about hardware limits, electrical behavior,
or physical wiring that lives in an active spec, HAL file, or BOM row is
either backed by a full-URL primary-source citation with revision/date, or
it is marked `UNVERIFIED`, `MEASURED_PENDING`, or an `HOLD_CONFLICT` in
[`current_pin_authority.csv`](../mesa/current_pin_authority.csv). Repo-internal
prose that says "verified" without such a citation is not verified.

## Classification key

- **Contradicted** — later primary evidence or the repo's own drawings/CSV
  refute the claim. Remove from active docs; keep only as history.
- **Verified** — primary source with full URL now cited; claim stays.
- **Unverified** — no primary source could be produced; retract or downgrade
  to `MEASURED_PENDING` / `UNVERIFIED` banner until evidence is added.

## Primary sources used in this audit

| # | Source | URL |
|---|---|---|
| S1 | Mesa 7i44 manual (RJ45 8-channel RS-422 breakout) | <http://www.mesanet.com/pdf/parallel/7i44man.pdf> |
| S2 | Mesa 7i49 manual (motion path) | <http://www.mesanet.com/pdf/motion/7i49man.pdf> |
| S3 | Mesa AIO Daughter Cards page (7i49 overview) | <https://www.mesanet.com/aiodaughter.html> |
| S4 | Mesa 7i80HD store product page (7i80HDT listed as its replacement) | <https://store.mesanet.com/index.php?route=product/product&product_id=62> |
| S5 | Mesa 7i80HD manual (SV6_7I49 config, three P1/P2/P3 50-pin connectors) | <http://www.mesanet.com/pdf/parallel/7i80hdman.pdf> |
| S6 | LinuxCNC `hostmot2(9)` man page (resolver instance naming, `excitation-khz`) | <https://linuxcnc.org/docs/html/man/man9/hostmot2.9.html> |
| S7 | PCW: 7I80HDT bitfile thread — "different FPGA" | <https://forum.linuxcnc.org/27-driver-boards/50101-bitfile-for-7i80hdt-with-7i44-and-7i48> |
| S8 | PCW: 7I80HDT Efinix Project File thread | <https://forum.linuxcnc.org/27-driver-boards/51589-7i80hdt-efinix-project-file> |
| S9 | Military & Aerospace 2013 press release for the 7I80HD (100BaseT, 72 I/O, 5V-tolerant) | <https://www.militaryaerospace.com/computers/article/16716103/fpga-based-programmable-industrial-i-o-card-with-100-baset-ethernet-introduced-by-mesa> |

## Quarantine table

| # | Original claim (paraphrased) | Classification | Primary source(s) | Disposition |
|---|---|---|---|---|
| 1 | 7i37TA was part of the selected plan | Contradicted | Prior architecture decision superseded by direct-7i84U approach (see [`architecture_decision.md`](architecture_decision.md) §"Why no P3 field breakout") | Removed from active BOM. Appears only in this history file and in the prior claim audit; no active spec references it. |
| 2 | 7i80HD-16 is the target board | Contradicted | S4 (Mesa lists **7I80HDT** as replacement for 7I80HD-16); S7, S8 (PCW: HDT uses a different FPGA and requires an HDT-specific bitfile) | README wording that links to the 7i80HD-16 store page for background is kept only as historical context; **the target board is the 7i80HDT** and every active bring-up file already says so. |
| 3 | 7i80HDT has 100BaseT Ethernet, three 50-pin daughter connectors (P1/P2/P3), 72 I/O, 5V-tolerant | Verified (by inheritance from 7i80HD spec) | S4, S5, S9 (100BaseT + three 50-pin + 72 I/O + 5V-tolerant established for the 7i80HD line; 7i80HDT is its FPGA-different replacement, so **connector geometry and I/O bit count are inherited unless PCW publishes a differing HDT-specific spec**) | Keep claim. Add caveat: **exact HDT connector/pin electrical behavior must be re-checked against the HDT-specific manual whenever Mesa publishes one**, because S5 is technically the HD (Xilinx) manual. **Distinguish base GPIO from daughter-card overlays**: on P1 the 7i44 remaps IO0-IO23 into 8-channel RS-422; on P2 the 7i49 remaps IO24-IO47 into 6 resolver + 6 analog channels; only P3 remains raw GPIO on IO48-IO71. |
| 4 | 7i84U has 32 IN / 16 OUT | Verified | Mesa 7i84 manual (cited elsewhere in repo, audit #21 reconciliation) | Keep. `mesa/current_pin_authority.csv` carries 32 inputs (IN0-IN31) and 16 outputs (OUT0-OUT15). |
| 5 | 7i44 has 8 RS-422 sserial channels | Verified | S1 ("8 channel RS-422/RS-485 interface … 8 independent receive channels … 8 independent transmit channels") | Keep. |
| 6 | 7i49 has 6 resolver channels + 6× ±10V analog outputs | Verified | S2 (7i49 manual: "Six resolver channels … six additional analog outputs … AOUT0 … AOUT5 … -10 V to +10 V"); S3 (AIO daughter page: "6 channels … 6 additional analog outputs … ±10 V"); S5 (7i80HD manual, SV6_7I49 config: "6 channel resolver interface, 6 pwm channels") | Keep with **primary source S2 now cited in active files**. |
| 7 | HostMot2 resolver module works with 7i49 | Verified | S6 ("This function currently works with the Mesa Resolver interface boards. The 7I49 is the only example at the time of writing") | Keep. |
| 8 | Resolver instances are `resolver.00` through `resolver.05` | Verified | S6 (explicit list "00, 01, 02, 03, 04, 05") | Keep. `num_resolvers=3` is a HostMot2 module-load count; it does NOT alter instance names — instances above the count simply aren't instantiated. Do **not** activate `resolver.03` unless `num_resolvers` is raised to at least 4. |
| 9 | 7i49 excitation frequencies are 2.5 / 5 / 10 kHz | Verified | S6 ("Valid values are 10 kHz, 5 kHz, and 2.5 kHz") | Keep. Parameter is `excitation-khz`, module-level (all resolvers share one frequency). |
| 10 | Tamagawa TS2014N (E26 suffix) is 10 Vrms, 4.5 kHz, K = 0.5 ±10% | Unverified in-repo | No primary Tamagawa datasheet is stored in this repo; secondary refs cite the Tamagawa FA-SOLVER page which does not publish a frequency tolerance | Downgrade to `UNVERIFIED` until (a) the exact `TS2014N###E##` suffix on each axis nameplate is recorded and (b) that variant's Tamagawa datasheet PDF is committed. `linuxcnc/motion_7i80hdt.hal` already qualifies this ("Full suffix matters. The values above are for TS2014N141E26 specifically. Every axis's exact suffix must be read off the nameplate"). No further action needed beyond this quarantine note. |
| 11 | 5 kHz excitation is within TS2014N ±10 % tolerance | Contradicted (over-claim) | Same as #10 — the Tamagawa page publishes **no** frequency tolerance, so a "±10 %" statement is fabricated | The repo already says the correct thing in `linuxcnc/README.md` and `motion_7i80hdt.hal`: "the Tamagawa page publishes no frequency tolerance, so verify on scope rather than by tolerance calc". Any older text that stated "5 kHz is within tolerance" is retracted here. |
| 12 | Plain 7i49 is electrically suitable for TS2014N | Unverified | No measured excitation drive/return, no confirmed input clipping margin | Downgrade to `MEASURED_PENDING`. See D8/D9 in `pre_power_deliverables.md` (RESDRV scope capture, RESSIN/RESCOS amplitude at rest and under motion). |
| 13 | 7i49 outputs are necessarily ±10 V with `scale=10` | Unverified for the specific loaded bitfile | S2 confirms the hardware supports ±10 V, but scale semantics depend on the loaded firmware's PWM generator sign/mode | Downgrade to `MEASURED_PENDING`. Deliverable: measure AOUT0..AOUT3 with commanded ±full-scale and record volts/count. |
| 14 | `7i80hdt_7i44_ss_7i49d.bit` is the correct bitfile | Unverified | S7/S8 (PCW supplied 7i80HDT bitfiles for 7i44+7i48 and for svss6_8d, not for 7i44+7i84×2+7i49); repo lacks IDROM dump, MD5, or pin listing | Add `UNVERIFIED` banner to every place the bitfile name appears in active spec files. Deliverable D3 in `pre_power_deliverables.md` covers bitfile provenance (IDROM readback, MD5, PCW attribution). |
| 15 | On P3, `gpio.042` is the probe input | Contradicted (stale) | `mesa/README.md` "The probe was moved from a former P3 `gpio.042` binding to 7i84U-B input-15" — the migration is already the current design | RETRACTED. Active-voice references cleaned up in commit `1a11c14` (2026-08-07): `linuxcnc/motion_7i80hdt.hal`, `linuxcnc/mazak_vqc_20_40.hal`, `docs/architecture_decision.md`, `wiring/io_map_research_notes.md`, `docs/project_status.md`, and `docs/crosswalk/element_dashboard_crosswalk_summary.md` now all state the current design: P3 unused/spare, probe on 7i84U-B TB3 IN15 (opto-isolated 24 V). Bare 3.3 V FPGA GPIO must not carry 24 V field wiring. |
| 16 | Mitsubishi HD81/HD101 ALM is open-collector active-low | Unverified | No primary Mitsubishi manual for these motor/amp models is in the repo; support to date is a PCW forum discussion, not manufacturer documentation | Downgrade to `UNVERIFIED`. Bench-verify the actual ALM contact behavior against the amp before wiring it into the safety chain. Add `UNVERIFIED` banner to `field_7i84u.hal` where the ALM inputs are described. |
| 17 | FR-SX uses the proposed analog + discrete interface described here | Unverified | The exact FR-SX model/manual and its terminal layout have not been added to the repo | Downgrade to `UNVERIFIED` in `docs/frsx_orient_model.md` header. Deliverable: identify exact FR-SX model number and commit its manual (or scanned terminal-strip page) before energizing spindle control. |
| 18 | Resolver is a device separate from the drive's tachogenerator | Verified | `docs/architecture_decision.md` §"Resolvers are ball-screw shaft mounted, standalone" cites Mitsubishi TRA structure; consistent with `linuxcnc/motion_7i80hdt.hal` header notes | Keep. Cite Mitsubishi TRA drive documentation once available; until then the source is repo-internal reasoning tied to standard TRA architecture. |
| 19 | E-stop / door chain sits ahead of the main contactor | Unverified from primary schematics | `wiring/io_map_research_notes.md` and `docs/dc_bus_stop_fault.md` describe this arrangement, but the Mazak/Mitsubishi wiring diagrams have not been scanned into the repo | Downgrade to `UNVERIFIED — awaiting scanned OEM schematic pages`. This is not blocking bring-up as long as the actual cabinet tracing (a D-series deliverable) confirms the topology before power. |
| 20 | 7i84U outputs can directly drive 100 VAC solenoids | Contradicted | `linuxcnc/field_7i84u.hal:193,211` explicitly says outputs are 5-32 V DC through interposing relays; `docs/pre_power_deliverables.md` D7 requires interposing relays for AC loads | Confirmed: repo now correctly forbids direct 100 VAC drive. Any archival wording that hinted at direct AC drive is retracted. |
| 21 | sserial updates "once per servo cycle" (present tense, as if measured) | Overstated | `docs/architecture_decision.md:23` uses this as a design premise; `docs/smart_serial_latency.md` is the more careful source and says "per servo cycle, not zero" | Downgrade in-place. The statement is a *design intent*, valid for non-safety monitoring only; **treat as design assumption, not measured fact** until D10 (latency-under-load) in `pre_power_deliverables.md` has scope captures. Do not use sserial paths for signals that are on the safety chain. |
| 22 | `index-divisor=1` yields exactly one HOME index per mechanical revolution | Unverified | Value is a hostmot2 resolver parameter — the correct setting depends on how many electrical cycles the resolver produces per mechanical revolution, which for TS2014N size-25 is claimed to be 1 but has not been counted in-repo | Downgrade to `MEASURED_PENDING`. Verify by rotating a de-energized ball screw one turn and counting index pulses on `resolver.00.index-enable`. |
| 23 | `SCALE = 1.0` is a "safe initial value" for the resolver | Contradicted | LinuxCNC scaling: SCALE = counts (from the resolver counter) per user unit (mm or in). SCALE = 1.0 forces one motor-side count per user unit and is almost never physically correct | Retract. Replace with an explicit calc: `SCALE = (counts_per_mech_rev) × (ball-screw resolver ratio) / (lead in user units)`. Until measured, use `SCALE = 0` (motion disabled) or the manufacturer's servo-tuning-doc placeholder value clearly marked `UNVERIFIED`. |
| 24 | `num_encoders=1` implements physical spindle feedback | Contradicted | `num_encoders` on hostmot2 only allocates the FPGA encoder-counter *module*; it does not route any physical GPIO to that counter, and P3's GPIO is not currently wired to any spindle feedback device | Retract. Downgrade to: "Reserves one encoder module in the bitfile for later use; **no physical spindle-feedback net is wired**." No active HAL nets should connect `hm2_7i80.0.encoder.00.*` to any spindle-position signal until the physical wiring exists. |
| 25 | Mesa 7i97T is part of this Mazak retrofit stack | Contradicted (never applicable) | The Mesa 7i97T is a step/dir + PWM daughter card (see [Mesa 7i97T product page](https://store.mesanet.com/index.php?route=product/product&product_id=356)) intended for stepper- and PWM-driven servo systems. This machine's motion path is analog ±10 V velocity into MELDAS DK-427 drives on the 7i49 P2 (see `docs/architecture_decision.md`). The 7i97T has no role in an analog-velocity + resolver-feedback retrofit. Any earlier draft mentioning "7i97T" as part of the selected stack was a scoping error introduced when the retrofit was briefly cross-considered against a step/dir path before the analog + resolver decision was locked in commit `agant172/mazak-vqc20-linuxcnc-retrofit@2f4e294`. | RETRACTED. Commit `2f4e294` git-purged all active references. This row documents the historical claim so future readers do not resurrect it. Do NOT specify, order, or wire a 7i97T for this machine; the analog motion path is on the 7i49 (P2) and field I/O is on the two 7i84U cards via 7i44 (P1). |

## Follow-up work by claim number

- **#10, #11, #12, #17, #19** — flip to `VERIFIED` only after the relevant deliverable in [`pre_power_deliverables.md`](pre_power_deliverables.md) is signed off with scope captures / OEM manual scans committed.
- **#13, #21, #22, #23** — instrument-verified numbers replace `MEASURED_PENDING`.
- **#14, #15, #16, #24** — every affected active-doc line is re-audited when the specific deliverable closes (D3 for the bitfile, D4-D6 for the safety chain, D11-D13 for motion tuning).
- **#25** — no follow-up. Row is permanent-history-only; the 7i97T has no place in this analog + resolver stack.

## Change log applied together with this document

- `docs/architecture_decision.md` — annotated header "Some historical alternatives (e.g. 7i37TA field breakout) are retained here for context; they are NOT part of the active plan. See [`superseded_claims_2026-08-06.md`](superseded_claims_2026-08-06.md) for the full list."
- `bom/README.md`, `README.md`, `mesa/README.md`, `mesa/mesa_firmware_checklist.md`, `docs/project_status.md`, `linuxcnc/README.md` — each place that names `7i80hdt_7i44_ss_7i49d.bit` picks up an `UNVERIFIED bitfile provenance — see #14` marker.
- `linuxcnc/motion_7i80hdt.hal` and `mazak_vqc_20_40.hal` — comments referencing SCALE=1.0 replaced with "SCALE = 0 until calculated per #23", and `num_encoders=1` line annotated per #24.
- `linuxcnc/field_7i84u.hal` — HD81/HD101 ALM comment gains `UNVERIFIED — see #16` marker.
- `docs/frsx_orient_model.md` — banner "UNVERIFIED FR-SX terminal layout — see [`superseded_claims_2026-08-06.md`](superseded_claims_2026-08-06.md) #17."
- Stale `gpio.042 = probe` mentions retracted in `README.md`, `bom/README.md`, `linuxcnc/README.md`, `wiring/io_map_research_notes.md`, `wiring/README.md`, and the wiring master CSV.

## Cross-references

- [`authority_hierarchy.md`](authority_hierarchy.md) — authority chain (CSV > HAL > docs) that this quarantine plugs into.
- [`pre_power_deliverables.md`](pre_power_deliverables.md) — D1-D16 charter that gates verification of every `UNVERIFIED` / `MEASURED_PENDING` claim above.
- [`claim_audit_2026-08-07.md`](claim_audit_2026-08-07.md) — the prior 17-item audit whose scope this expansion refines.
