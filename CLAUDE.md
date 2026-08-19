# CLAUDE.md — Read this first, every session

This file loads automatically at the start of every Claude session (desktop app,
CLI, or cloud). It is the **single operating manual** for the project — both the
quick front-door orientation and the full working rules, in one place.

> **The repo is the memory.** No Claude session — local or cloud — remembers past
> conversations. Everything durable lives in these files. If a decision, value, or
> result matters, it is not "known" until it is written to the repo and committed.
> When you finish real work, update the relevant file so the next session inherits it.

---

## Project purpose

This project converts **Mazak VQC 20/40B SN 060231** from its original Mazak
M-2 / Mazatrol control to LinuxCNC. The machine was functioning well before
the retrofit and is mechanically sound. The purpose is to replace obsolete
NC/control hardware and software while retaining reliable OEM machine
hardware, functions, serviceability, and documentation wherever practical.

The desired final machine has LinuxCNC motion control, a touchscreen HMI and
wired MPG pendant, retained OEM DC servo amplifiers and spindle drive, and
full OEM-style machine automation where practical — including spindle orient,
ATC operation, machine interlocks, lubrication/hydraulic monitoring, and
recoverable sequencing.

---

## Read these before proposing anything

This file is the authoritative brief. In addition, consult:

| Read | Why |
|---|---|
| **[Session conventions](#session-conventions)** (below, in this file) | Which machine this session is on and what it may state as verified, the SSH boundary, `git pull` before you start, and what to run before you push. Read first — it governs what the rest of this table entitles you to claim. |
| **`INTERFACE_ARCHITECTURE.md`** | The two machine-interface planes — BBIA-1 (discrete I/O) and CNA/SX-IO1 (resolver, analog, spindle command) — the root decision governing how the wiring CSV and I/O Navigator are structured. Read before touching the pin authority or wiring crosswalks. |
| **`INSTALL_SPINE.md`** | The load-bearing install path in order of use — gates, machine side, the BBIA↔Mesa hop, ladder→HAL, and the validation loop. Pointer-only: it names the short list of files that matter at the cabinet; everything it does not name is background. Start here for any installation or wiring question. |
| **`docs/project_status.md`** | Current state, TODO priorities, and the D1–D16 pre-power deliverables gating live power. |
| **`docs/authority_hierarchy.md`** | Which file wins when two disagree, and the script that enforces it. |
| **`mesa/current_pin_authority.csv`** | Electrical channel authority — one row per physical Mesa pin. The source of truth for pin/HAL bindings. |
| **`wiring/authority_conflicts.md`** | Known documentation-vs-physical conflicts not yet resolved. |
| **`docs/superseded_claims_2026-08-06.md`** | Retracted claims. Do not resurrect them (e.g. the bare-GPIO `gpio.042` probe binding, the 7i97T architecture). |

---

## Quick non-negotiable rules

- **Power and E-stop are out of scope (owner decision 2026-08-15).** All AC/DC
  power circuits and the entire E-stop system stay 100% original OEM. Do not
  propose, document, trace, or verify any power circuit; the only power info
  kept is what passes through the BBIA-1 board.

Full versions are in the detailed sections below; this is the skim list.

- **Safety is hardware-first.** The OEM hardwired E-stop / contactor chain (MAR/EMS/OTR)
  is the primary E-stop. LinuxCNC/HAL is **not** the only E-stop. Never treat the HAL/INI
  skeletons or the pin-authority CSV as live-machine-ready — they are planning skeletons
  with placeholder scales, polarities, and normal states.
- **Sources of truth, in order:** (1) this repo, (2) OEM PDF set for SN 060231,
  (3) Mesa manuals committed under `docs/Mesa Manuals/`. Repo wins. Everything else
  (wiki, chat notes, forum posts) is secondary and cannot override the repo.
- **Never invent** wire labels, pin assignments, parameters, polarity, component state,
  I/O type, or firmware compatibility. Mark anything unverified and name the next
  verification method (photo / meter / scope / commissioning check).
- **Always separate** verified facts, inferences, open questions, proposed changes,
  temporary bypasses, and tests-required-before-motion.
- **Preserve the two-card identity** (7i84U-A vs 7i84U-B) and OEM safety wire numbers
  (`57`, `57A`, `57B`, `40`, `40A`, `EHB`, `MAR`, `EMS`, `OTR`, `PIOT`, `*ESP`) unless a
  documented revision says otherwise. Do not reuse retired OEM wire numbers for new wiring.
  every OEM↔new signal crosses an interposing relay.
- **Cite everything** using the citation format below.

---

## Control hardware

Host system:
- LinuxCNC 2.9.10 on Debian 13, PREEMPT_RT kernel, `hm2_eth` driver.

Mesa hardware stack:
- Mesa 7i80HDT — Ethernet FPGA host.
- Mesa 7i49 on P1 — resolver feedback and ±10 V analog outputs.
- Mesa 7i44 on P3 — Smart-Serial interface.
- Mesa 7i84U-A on 7i44 port 0 — general field I/O.
- Mesa 7i84U-B on 7i44 port 1 — X/Y/Z limits, homes, drive-enable I/O,
  relay-driven loads.
- 7i80HDT P2 — unused/spare, no exceptions. No daughter card is fitted and
  bare 3.3 V FPGA GPIO must never carry 24 V field wiring. The Renishaw MP-3
  probe SKIP1 lands on 7i84U-B TB3 IN15 (opto-isolated 24 V; HAL consumes
  `input-15-not`). The former bare-GPIO `gpio.042` probe binding is RETRACTED — see
  `docs/superseded_claims_2026-08-06.md` row 15.

Preserve `7i84U-A` and `7i84U-B` identities in all wire labels, I/O maps,
pin-authority tables, HAL names, test sheets, and documentation. Do not
rename, interchange, or repurpose them without an explicit documented revision.
The two-card plan is current. Do not collapse to a single card silently.

Retained OEM equipment:
- Mitsubishi MELDAS HD brushed-DC servo amplifiers, ±10 V analog velocity.
- Tamagawa TS2014N resolvers on X, Y, Z (pending commissioning verification).
- Mitsubishi FREQROL FR-SX spindle drive — analog speed + orient.
- OEM MAR / EMS / OTR hardwired contactor and E-stop chain.
- OEM hydraulic, lubrication, ATC, spindle, relay, solenoid, and sensor
  hardware where operationally appropriate.

Intended 7i49 allocation:
- RES0/1/2 — X, Y, Z resolver feedback.
- AOUT0/1/2 — X, Y, Z axis velocity commands.
- AOUT3 — FR-SX spindle speed command.

Do not assume any Mesa connector, firmware, assignment, resolver ratio,
carrier frequency, or HAL pin name is correct until verified against the
applicable manual, installed firmware, and current pin-authority document.

---

## The two machine-interface planes (BBIA-1 and CNA/SX-IO1)

The original NC talked to the machine through **two separate interfaces**, not one:

- **Plane A — BBIA-1**, a straight pass-through terminal unit that was the NC back
  panel's breakout, carrying discrete digital I/O. The retrofit reproduces this
  exactly: LinuxCNC → 7i80HDT (Ethernet) → 7i44 (50-pin IDC) → 7i84U-A/B
  (smart-serial) → **Mesa screw terminals** → cut & ferruled **MR cables** →
  **BBIA-1** → unchanged OEM harness → machine. Documented in
  `wiring/bbia1_terminal_unit.md` / `wiring/bbia1_cn_pinouts.csv`.
- **Plane B — the CNA-family servo card-cage connectors**, carrying axis resolver
  feedback and the direct ±10 V axis command pairs: LinuxCNC → 7i80HDT → 7i49
  (P1) → shielded home-run cable → **CNA3(X)/CNA4(Y)/CNA5(Z)** / the still-untraced
  axis-command connector pins → retained TRA/DK-427 hardware. Resolver pin roles
  are Mitsubishi-M2-manual-confirmed and bench-measured
  (`docs/resolver_commissioning.md`, `resolvers.md`,
  `wiring/plane_b_pin_crosswalk.csv`). **Correction 2026-08-18:** the FR-SX speed
  reference crosses Plane A at BBIA-1 CN4-18/-19/-20, not Plane B; the SX-IO1
  CON1 table in `wiring/connector_crossref.md` is the internal cross-reference.
  The RC3A relay board, though
  physically in the same bay, is **not** part of Plane B — its signals
  cross-reference to BBIA-1's own CN3/CN301A (Plane A).

**Two-plane rule:** every control↔machine signal crosses at exactly one of these two
planes. One physical conductor across a plane = one row in that plane's I/O model,
keyed on **`signal_id`** and labelled with the **factory wire number** printed on the
jacket. (The wire number is the ferrule text and the lookup key back to the OEM print,
but it is *not* unique — the print renumbers a conductor at each relay stage, so it
names a segment, not a conductor. See `wiring/authority_conflicts.md` § 7.1.)
The machine-internal side of each
plane is fixed OEM/OEM-manual reference — do not re-derive it; the retrofit owns and
verifies only each plane's hop to Mesa. The few things that cross at neither plane —
the standalone OEM E-stop/contactor chain and the still-unlocated over-travel
limits — are enumerated in **`INTERFACE_ARCHITECTURE.md`**, which is authoritative
for this model (including the 2026-08-17 amendment that split the single plane into
two) and for how the wiring CSV and I/O Navigator are structured. Read it before
editing the pin authority or wiring crosswalks.

---

## Sources of truth

Four sources are authoritative, in priority order:

1. **GitHub repo `agant172/mazak-vqc20-linuxcnc-retrofit`**
   https://github.com/agant172/mazak-vqc20-linuxcnc-retrofit
   Authority for all current design decisions: pin allocation
   (`mesa/current_pin_authority.csv`), I/O crosswalk, signal budgets, wiring
   plans, open issues, HAL/INI, commissioning procedures, and BOM.
   Repo version wins over any external source unless both are revised together.

2. **OEM PDF document set for SN 060231**
   Canonical set lives in [Google Drive: `Mazak/Manuals_SN060231`](https://drive.google.com/drive/folders/1XWcctFb2gGTSNwGjkBiaufewpDAowJi8)
   — consolidated PDFs named `VQC20-40_060231_<Electrical_Diagrams|Ladder_Diagrams|
   Maintenance|Operator|Parameters|Parts_List|M2_Programming>.pdf`, plus
   `Original Manuals/` (raw page scans, incl. `41434WB <page>.pdf` files, a
   README, and `docs_index.md`) and `Misc. Documents/` (element list CSV,
   `servo_amp_analysis.md`, and other working notes). Check `docs_index.md`
   before re-deriving a signal from scratch.
   - Electrical Diagrams (pub #41434WB, 6/1984) — wiring, terminals,
     connectors, wire numbers, relay coil numbers, safety-chain topology.
   - M-2 Parameter Manual — machine parameters and memory addresses.
   - PLC/Ladder manual — sequence logic, timer bases, flag definitions,
     I/O address assignments.
   - Machine Multipliers manual — axis geometry, ATC coordinates,
     compensation tables.
   - FR-SX Drive booklet — spindle drive terminals, parameters,
     orient/zero-speed signal identification. **The FR-SX maintenance manual
     (`BCN-21735-S5`) is now committed at `docs/OEM Manuals/` — printed pages
     1–38 only, Chapter 6 missing.** Findings: `docs/frsx_maintenance_manual_notes.md`.
   Cite: pub name, PDF page, drawing number, sheet number.

3. **Mesa manuals committed to `docs/Mesa Manuals/`**
   - `7i84uman.pdf` (7I84U) — 7i84U-A/B I/O registers, SSerial
     addressing, connector pinouts, power requirements.
   - `7i80hdtman.pdf` (7I80HDT) — installed host-board connectors and power.
   - `7i49man.pdf` (7I49) — resolver and analog terminal maps and shield rule.
   The 7i44 manual remains link-only; commit it before relying on a new 7i44
   claim not already covered by the current authority. Do NOT cite
   7i97T/7i97 manuals: the 7i97T architecture is RETRACTED
   (`docs/superseded_claims_2026-08-06.md`) and the local 7i97T manual was
   deliberately removed in Rev B.
   Cite: filename, card model, version, page. Committed PDF wins over
   datasheets or forum posts unless a newer version is committed to the repo.

4. **Mitsubishi MEAU knowledge base** — the manuals Mitsubishi still holds for
   this control, and the source that settled the resolver interface on
   2026-08-16.
   `https://us.mitsubishielectric.com/fa/en/support/technical-support/knowledge-base/`
   **Sign-in is mandatory and the failure mode is silent:** logged out, a search
   for `MELDAS` returns **zero** results and the site looks like it holds nothing
   older than the M8 series; logged in (free account), the same search returns
   **479**, including 42 tagged OEM `Mazak`. Anyone concluding "Mitsubishi has
   nothing this old" was searching logged out.
   - `M2 Maintenance Manual` (BNP-A2443A / M1243-ES) — DocID
     `3E26SJWH3ZZR-24-2354`, 297 pp. Detector wiring, servo adjustment, zero
     return. **This is the authority for the detector interface**; findings in
     [`docs/resolver_commissioning.md`](docs/resolver_commissioning.md).
   - `TRS Maintenance Manual` — DocID `3E26SJWH3ZZR-24-3738`. A *different*
     amplifier family whose resolver senses magnetic pole position — era context
     only, not this machine.
   These are **scans without text layers**, so grep and site preview both find
   nothing; they must be OCR'd, and figures read as images (OCR scrambles diagram
   reading order). Not committed — media rule. Cite: manual name, figure or
   section, **printed** page.

All other sources (LinuxCNC wiki, Perplexity/ChatGPT session notes, Desktop
Commander notes, third-party retrofit writeups, unverified conversational
context) are secondary. They may inform understanding but do not override
the four authorities above.

---

## Working rules

Before proposing any design, wiring change, HAL config, INI value, firmware
choice, or commissioning test:

1. Check the repo first. Use the repo version, not a recalled version.
2. Check the OEM PDFs for physical machine facts.
3. Check the Mesa manuals for hardware behavior, pinouts, and HAL naming.
4. If any two sources conflict, flag it explicitly: cite both, state which is
   controlling, identify the verification or update needed to resolve it.
5. If no source covers the question, say so and name the next best
   verification method (photo hunt, meter test, scope test, commissioning
   check).
6. Do not silently adopt unverified conversational plans or generic
   assumptions not committed to the repo.
7. Do not invent wire labels, pin assignments, parameters, polarity,
   component state, I/O type, or firmware compatibility. Mark anything
   unverified and name the next verification method.

Citation format — always include what is available:
- Repo: `path/filename` and section or line.
- OEM: pub name, PDF page, drawing number, sheet.
- Mesa: filename, card model, version, page.
- Physical: wire number, terminal strip, connector, pin, device tag.
- HAL: Mesa card, SSerial port, channel, HAL pin name.

Always clearly separate:
- Verified facts
- Inferences
- Open questions
- Proposed modifications (not yet in repo)
- Temporary commissioning provisions
- Tests required before energizing or enabling motion

---

## Electrical architecture

Boundary rule:
- Every signal crossing between OEM and new-control domains crosses through
  an interposing relay with dry contacts at the boundary.
- Any 7i84U output driving an OEM coil uses an interposing relay.
- Any OEM contact read by a 7i84U crosses through a relay isolation boundary.

Every proposed wiring change must identify: source/destination, signal name,
wire number or new label, terminal/connector/pin, electrical type and domain,
normal state and polarity, isolation method, Mesa card/port/channel/HAL name,
test procedure, and rollback method if temporary.

---

## Safety and commissioning

The OEM hardwired E-stop and contactor chain is the primary E-stop system.

- Preserve OEM wires `57`, `57A`, `57B`, `40`, `40A`, `EHB`, `MAR`, `EMS`, `OTR`,
  `PIOT`, `*ESP` unless I explicitly direct a documented redesign.
- Machine-enabled monitoring via a `MAR` aux contact is DEFERRED (owner
  decision 2026-08-15): no interposing relay is installed, the `estop-monitor`
  input is unwired, reads FALSE, and the software chain fails safe. LinuxCNC
  is never part of the E-stop function.

Owner-operated commissioning may use reversible temporary bypasses. Do not
block the project because a bypass is desired. For every bypass document:
- Circuit and its normal protective purpose.
- OEM drawing, terminal path, or ladder reference.
- Temporary implementation and electrical domain.
- Conditions of use and hazards defeated.
- Pre-test checks, machine state, recovery/rollback steps.
- Restoration path and documentation update before normal operation.

Always prominently flag risks involving: E-stop and contactors; servo enables
and unexpected motion; spindle enable/speed/reverse/orient; hydraulic pressure
and tool clamp; lubrication; hard/soft limits, homing, and overtravel; door
switches; ATC motion, barriers, and tool clamp; OEM relay/solenoid outputs.

Staged commissioning sequence:
1. Documentation and wiring review.
3. I/O power-up with outputs disabled.
4. Input-state and polarity verification.
5. Output/relay verification with loads isolated where practical.
6. Resolver signal, amplitude, carrier-frequency, and direction verification.
7. Analog-output zero, polarity, and scaling verification, motion inhibited.
8. Servo-enable and fault-chain verification.
9. One-axis low-speed jog, conservative limits, physical observation.
10. Homing and hard/soft-limit verification.
11. Remaining axes.
12. Spindle low-speed, direction, scaling, zero-speed/at-speed, orient.
13. Manual-assisted tool clamp/unclamp and ATC commissioning.
14. Full automated ATC and auxiliary machine automation.

---

## Software and machine behavior

- Design HAL, INI, and components for the eventual fully automated machine
  even when early commissioning is manual or partial.
- Prefer clear, maintainable HAL nets over opaque logic.
- Keep all safety status, interlock conditions, faults, and overrides visible
  in HAL and the HMI.
- Replicate meaningful OEM sequencing and interlocks that protect people,
  tooling, or the machine.
- Replace obsolete M-2 NC-internal behavior with LinuxCNC-native logic where
  appropriate.
- Treat manual controls as requests; enforce machine-state and
  pressure/position interlocks before tool clamp, unclamp, orient, or ATC
  motion.
- Keep commissioning-only bypasses in clearly identified HAL nets; do not
  leave hidden bypasses in normal-operation configs.

---

## Documentation standards

For each new or changed signal, document:
- Functional name and OEM name/address (if any).
- LinuxCNC/HAL name.
- Physical device, purpose, source/terminal/connector/pin path.
- 7i84U-A or 7i84U-B identity, SSerial port, I/O channel.
- Power domain and isolation boundary.
- Normal state, fault state, signal polarity.
- Test procedure and documentation source with confidence level.

Preferred artifacts: pin-authority CSV, signal maps, I/O budgets,
device-to-terminal-to-Mesa wiring-path tables, wire-label crosswalks,
HAL/INI files with comments, commissioning checklists, test records with
measured values, open-issues list, change logs.

Do not reuse retired OEM wire numbers for new wiring. Preserve and archive
original harness sections with original labels visible.

---

## Operating priorities

1. Verified contactor behavior at the new-control boundary.
2. Authoritative Mesa firmware, pin allocation, SSerial topology.
3. Resolver feedback and analog command paths verified without motion.
4. One axis at a time — conservative velocity, limits, scale/direction check.
5. Spindle speed, direction, at-speed/zero-speed, orient.
6. Hydraulic/lubrication status, tool clamp/unclamp, interlocks.
7. Manual-assisted ATC functions.
8. Full ATC logic, recovery paths, and automated auxiliary functions.
9. HMI, pendant, diagnostics, documentation improvements.

The goal is a documented, maintainable, serviceable LinuxCNC-controlled
Mazak VQC 20/40B that retains the useful behavior of the original machine
and makes every changed circuit and control decision understandable years later.

---

## Where to do the work: at the machine vs. away from it

Every Claude session — OptiPlex, MacBook Pro, iMac, or cloud — shares this repo as memory,
but they can touch different things. The dividing line is **not** local vs. cloud; it is
**at the machine vs. away from it**. See [Session conventions](#the-machines) for which
machine is which.

**Do AT THE MACHINE (a session on the OptiPlex, with a human present)** — anything that
needs the real machine, hardware, OS, or live measurements:
- Live Mesa install, `mesaflash`/`readhmid`, bitfile flashing, IDROM/pin-dump capture.
- Editing and testing HAL/INI on the control PC (`halrun`, watching real pins).
- Host/NIC/network setup (static IP 192.168.1.121, `hm2_eth`, `enp0s31f6`), package installs,
  systemd services.
- Resolver/analog scope measurements and continuity checks.
- Axis / spindle / ATC bring-up and every commissioning step.
- Capturing cabinet photos and filing them in Drive per
  `docs/README_photo_sorting.md` (the single scheme). **Raw photos are never
  committed** — the repo records references and findings only.
- **Then write results into the repo and commit** — that is how the knowledge survives.

**Hand to a DESK SESSION (iMac, MacBook Pro, or claude.com/code — reviewed as PRs)** —
self-contained work that only needs files already in git and cannot touch the machine:
- Documentation polish and reconciliation (`docs/`, `README.md` progress tables, wiring narratives).
- The `io-dashboard/` web app (pure JS/CSS/HTML).
- Python tooling and validators (`scripts/validate_authority.py`, `validate_control_logic.py`,
  `generate_*.py`, `build_manual_set.py`) — these can run their own checks in the container.
- Regenerating derived artifacts (label CSVs, wire reference sheets, manual sets) from source data.
- Cross-checking the CSV/XLSX pin-authority and BOM data for conflicts.

**The trap:** a desk session can *draft* a HAL file but has never seen the machine and cannot
verify anything. A Mac session is exactly as unable to meter a wire as a cloud session — being
"local" buys it nothing. Never let desk output stand as commissioned truth; only work against
the real hardware, with a human at the machine, can commission.

---

## Session conventions

Where things live and how a session is expected to behave. Every value below is
sourced from a file in this repo — if you change one of these in the real world,
change it here in the same commit.

### Repository scope

- **One repo only:** `agant172/mazak-vqc20-linuxcnc-retrofit`. Default branch `main`.
  There is no second repo, no private sibling, no gist. If work seems to need another
  repository, ask before adding one.
- **The repo is PRIVATE** (owner decision 2026-08-16 — all of the owner's repos were made
  private). Every clone, fetch, and push needs credentials; anything that assumed anonymous
  read no longer works. This is not a licence to commit secrets — see the `.obsidian` table
  below. Do not link repo paths from anywhere expecting them to resolve for a reader who is
  not signed in.
- **Desk sessions never push to `main`** — Macs and cloud alike. Work on a feature branch and
  open a **draft PR**; the Authority gate (`.github/workflows/authority-gate.yml`) must pass
  before merge. The OptiPlex commits directly when recording a measurement at the machine.
- **`main` moves on its own.** The OptiPlex pushes `status/host_status.{md,json}` to `main`
  every 5 minutes via a systemd timer (`scripts/host_status/collect_status.sh`). Fetch and
  rebase before pushing rather than assuming your base is current, and don't be alarmed by
  commits you didn't write in `status/`.

### The machines

Work happens on three physical machines plus cloud containers. All four kinds of session
share this repo as memory; they do **not** share equal authority to state a fact.

**Identify yourself first.** No configuration is needed — the machine is discoverable:

```bash
uname -s                        # Linux = the OptiPlex; Darwin = a Mac
sysctl -n hw.model 2>/dev/null  # MacBookPro… or iMac… (macOS only)
hostname -s
```

| Session location | Role | May state as verified |
|---|---|---|
| **OptiPlex 7050** — Debian 13, PREEMPT-RT | The control PC. The only machine wired to the Mazak. | Anything it measured, with a human at the machine |
| **MacBook Pro** — macOS | Portable desk session; goes to the shop as a reference | Nothing about hardware |
| **iMac** — macOS | Desk session | Nothing about hardware |
| **Cloud** — claude.com/code | Ephemeral clone, PR-only | Nothing about hardware |

**The rule: verification authority follows the wire, not the OS.** Being "local" is not the
same as being able to check. A Mac session and a cloud session have identical standing on any
physical question — both may draft, neither may confirm. If a session cannot meter it, it
writes `PROPOSED`, not `ELECTRICALLY_VERIFIED`
(`docs/pre_power_deliverables.md#new-evidence-state-taxonomy`).

| Item | Value | Source |
|---|---|---|
| OptiPlex user | `andy` | `scripts/host_status/install.sh` |
| Working copy — **all three machines** | `~/mazak-vqc20-linuxcnc-retrofit` | `scripts/host_status/collect_status.sh` |
| Control NIC | `192.168.1.1/24`; interface name `enp0s31f6` **unverified** — confirm with `ip -o link show` | `linuxcnc/README.md`, `docs/hm2_eth_nic_validation.md` |
| Mesa 7i80HDT | `192.168.1.121` (static) | same |
| SSH to the OptiPlex | `ssh linuxcnc` → `andy@linuxcnc.tail2a912f.ts.net`, over Tailscale, **key auth only** | `~/.ssh/config` on each Mac |
| Keys authorized on the OptiPlex | **iMac** `SHA256:tjYw8rTkarNYK8r/uxvQskP78Y4ADFx+8U5fBWKsQag` (`andygant@imac`, added 2026-08-16). **MacBook Pro: unknown — check.** | `andy@linuxcnc:~/.ssh/authorized_keys` |

Work in the git working copy, not in a scratch directory — anything produced outside it is
lost, and the repo is the memory. LinuxCNC runtime output (`mesa_readhmid.txt`,
`mesa_hal_pins.txt`, `*.var.bak`) is deliberately git-ignored: paste the *findings* into a
doc rather than committing the dump.

### Working from a Mac over SSH

A Mac session may reach the OptiPlex over SSH. That makes the *machine* reachable from a room
where **nobody can see it move and nobody can reach the E-stop**, so the boundary is drawn by
consequence, not by convenience:

**If `ssh linuxcnc` returns `Permission denied (publickey,password)`, that machine's key is not
installed** — the OptiPlex switched from Tailscale SSH to plain sshd on 2026-08-16 and keys did
not carry over automatically. Diagnose with `ssh -v` (look for `Offering public key` followed by
another `Authentications that can continue`: offered and rejected = not in `authorized_keys`).
Fix from the Mac with `ssh-copy-id -i ~/.ssh/id_ed25519.pub linuxcnc`, or paste the `.pub` line
into `~/.ssh/authorized_keys` at the OptiPlex. Password auth is still enabled, so the copy-id
path works. **Record the new key in the table above in the same commit** — that table is the only
place this is written down.

**Allowed over SSH, unattended** — read-only inspection that cannot move anything or energize
an output:
- `mesaflash --readhmid`, `halcmd show pin|sig|param`, `halcmd -s show` sampling.
- Reading logs: `journalctl -u linuxcnc`, dmesg, latency notes, `systemctl status`.
- `ip -o link show`, `ping 192.168.1.121`, package queries, editing files, git operations.

**Requires a human physically at the machine, with the E-stop in reach** — anything that can
move an axis, turn the spindle, actuate a solenoid, energize a coil, or change what the drives
do on the next power-up:
- `halcmd setp`/`sets` on any output, enable, or command pin; loading or restarting a config.
- Starting LinuxCNC, homing, jogging, MDI, any spindle or ATC function.
- Flashing a bitfile, or editing HAL/INI that will be loaded on the next start.

Never arrange to satisfy this by leaving the machine powered and walking away. If a step needs
a person and no person is there, the step waits — say so and stop rather than proceeding.

**Attribution.** A measurement taken over SSH belongs to the OptiPlex and the human who was
standing there, not to the Mac session that typed it. Record it that way: note the date and
that it was taken at the machine, so a later reader can tell a real reading from a remote guess.

### Getting a machine onto the shared memory

`CLAUDE.md` travels with the repo, so a machine joins simply by cloning it — there is nothing
to copy by hand and nothing machine-specific to configure. **The repo is private (owner
decision 2026-08-16), so the clone needs credentials** — an SSH key on the account, or
`gh auth login` first. An unauthenticated clone fails with a misleading "repository not
found":

```bash
gh auth status || gh auth login          # or have an SSH key on the account
git clone git@github.com:agant172/mazak-vqc20-linuxcnc-retrofit.git \
  ~/mazak-vqc20-linuxcnc-retrofit
cd ~/mazak-vqc20-linuxcnc-retrofit && python3 scripts/validate_authority.py   # expect exit 0
```

SSH is the form to use: the OptiPlex's 5-minute status timer pushes non-interactively over
`git@github.com`, and an HTTPS remote would prompt for a password it cannot answer.

The **iMac has a clone at `~/mazak-vqc20-linuxcnc-retrofit`** — confirmed 2026-08-16, and it is
the machine's only clone (see the two-clones note below). The **MacBook Pro** is believed to have
one as of 2026-08-15 but is still **unconfirmed**; check with `ls ~/mazak-vqc20-linuxcnc-retrofit`
from a session on that machine and update this line.

**`~/.claude/CLAUDE.md` does not sync.** It is user-level memory, private to one machine, and no
other machine or cloud session can see it — that is exactly how the project's startup
conventions went missing until 2026-08-15. Anything that should be true on every machine goes in
*this* file, in the repo. Keep per-machine user memory empty, or limited to genuinely local
facts (an SSH alias, a printer).

**Start every session with `git pull`.** With three machines and an automated status push, a
stale working copy is now the most likely way to act on facts that are no longer true.

### Reading the repo in Obsidian

The repo is also an Obsidian vault — the docs are markdown, so Obsidian reads them directly
with backlinks and graph view. Open the repo folder as a vault
(Obsidian → vault switcher → *Open folder as vault*).

`.obsidian/` is **tracked on purpose**, so appearance, hotkeys, and enabled plugins follow you
between machines instead of being set up three times. What stays local is listed in
`.gitignore`:

| Not synced | Why |
|---|---|
| `.obsidian/workspace.json`, `workspace-mobile.json` | Which panes you had open — per-machine, and conflicts on every pull |
| `.obsidian/cache`, `.obsidian/.trash/` | Machine-local scratch |
| `.obsidian/plugins/` (the code) | ~9 MB of vendored JS per plugin set — it would drown every PR diff. `community-plugins.json` **is** tracked, so the *list* of enabled plugins syncs; install them once per machine from the community store. |
| `.obsidian/plugins/*/data.json` | **Plugin settings can hold credentials** — `obsidian-local-rest-api` stores an API key. The repo went private on 2026-08-16, which does **not** make this safe: a committed secret is in the history permanently, visible to every collaborator and to anything holding a token, and it survives the repo being made public again. Re-enter secrets per machine. |

Settings changes ride the normal workflow — a desk session commits them on a branch and opens a
PR like any other change. **Do not install the Obsidian *Git* plugin's auto-commit here:** it
would push editor state straight to `main`, which desk sessions are not allowed to do, and bury
the engineering history under workspace churn.

**Two clones on one machine is a foot-gun — and it has already cost us data.** A second clone
under `~/Obsidian/` means notes edited in Obsidian land in the vault clone only, invisible to the
working copy, to git, and to every other session.

On 2026-08-16 the iMac had exactly that split, and an afternoon of resolver DC-resistance
measurements sat in an untracked `resolvers.md` in the vault clone while the working copy showed
only nameplates — the repo had no record of readings that had already been taken at the machine.
They are now in [`docs/resolver_commissioning.md`](docs/resolver_commissioning.md). The iMac has
since been consolidated: the vault clone is gone and Obsidian opens the working copy directly, so
**the iMac now has one clone.** The MacBook Pro is believed to still have both (2026-08-15,
unconfirmed) — check it and fix it the same way.

If you consolidate another machine, two things are not in git and must be carried across by hand
before deleting the vault clone, or the vault comes up stripped:

- `.obsidian/plugins/` — the vendored plugin code, ~9 MB. `community-plugins.json` syncs the
  *list*, not the code. Copy the directory or re-install each plugin from the community store.
- `.obsidian/workspace.json` — your pane layout.

Quit Obsidian first: it rewrites `~/Library/Application Support/obsidian/obsidian.json` on exit,
so a vault path edited underneath a running instance is silently reverted.

### Photos and large media

- **Never commit raw media.** `.gitignore` blocks `*.jpg/.png/.heic/.mp4/…` on purpose.
- **STALE, unverified (2026-08-17):** this doc claims photos live in
  [Google Drive](https://drive.google.com/drive/folders/1YYpWPyWiRuoY2z5GACSDw6H3zzSQoVdf?usp=drive_link)
  in eight folders `00_Inbox`…`07_Reference`, backed up to OneDrive, plus an unsorted
  batch at `My Drive/Mazak/Misc. Photos`. A full search of that Drive account (by folder
  title and by API) found none of this — that folder ID now contains only
  `Manuals_SN060231` (see OEM manuals, above). Either this was never executed or the
  photos moved; don't trust the eight-folder scheme until it's re-verified on Drive
  directly.
- **Actually confirmed today:** the real raw photo history (control cabinet interiors,
  MAZATROL CAM M-2 screens, resolver/encoder detail, terminal blocks — Oct 2024
  through present) lives uncurated in the account's default **Google Photos**, not
  Drive. Collected into a shared album:
  [Mazak VQC-20 Retrofit — Control Cabinet Photos](https://photos.app.goo.gl/o59yC81mQhwYaVF68)
  (200+ photos/videos, built from visual searches for "mazatrol" and "VQC-20";
  hand-filtered per date to drop unrelated shop equipment and personal photos that
  those searches also matched). Not exhaustive and not auto-updating — re-run those
  searches periodically to catch newer shots and sweep in whatever they still miss.
- Any `photos/…` path written in this repo means a **Drive folder**, not a directory on disk.
- **Cite photos as `YYYY-MM-DD/IMG_nnnn`** — never a bare `IMG_nnnn`, which recurs across
  batches. Full scheme and migration table: `docs/README_photo_sorting.md`.

### Before you push

Run what CI runs, or the gate will fail on the PR:

```bash
python3 scripts/validate_authority.py        # CSV <-> HAL <-> label CSVs
python3 scripts/validate_control_logic.py    # static HAL invariants
python3 scripts/generate_label_csvs.py --write
python3 scripts/generate_wire_reference_sheet.py
python3 io-dashboard/tools/generate_data.py
git diff --stat                              # generated files must be committed, not left dirty
```

Label CSVs, the printable wire sheets, and `io-dashboard/data.js` are **generated**. Edit the
source (`mesa/current_pin_authority.csv` and the HAL files) and regenerate — hand-edits are
detected and rejected by CI.

### Session etiquette

- **Start by reading, not proposing.** This file, then `docs/project_status.md`, then whichever
  file in the read-first table covers the question.
- **State which session type you are** when it matters. A cloud session should say plainly that
  it cannot measure, meter, or flash anything.
- **One topic per PR** where practical, with a commit message that says *why*, not just *what*.
- **Finish by writing it down.** Update `docs/project_status.md` and any file whose facts
  changed, commit, and push before the session ends.

---

## Validation & housekeeping

- After editing pin bindings or HAL, run the authority checker:
  `python3 scripts/validate_authority.py` (and `validate_control_logic.py` where relevant).
  Both must exit 0 — the same gate CI enforces on every PR.
- When you complete real work, update `docs/project_status.md` and any file whose facts changed,
  then commit with a clear message. An append-only decision/change log captures *why*, not just *where* —
  prefer adding to it over overwriting history.
- Commit and push before a session ends; a cloud container is ephemeral and unpushed work is lost.
