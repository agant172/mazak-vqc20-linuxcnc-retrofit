# CLAUDE.md — Read this first, every session

This file loads automatically at the start of every Claude session (desktop app,
CLI, or cloud). It is the **front door** to the project. It does not repeat the
detailed rules — it tells you where they live and what you must not get wrong.

> **The repo is the memory.** No Claude session — local or cloud — remembers past
> conversations. Everything durable lives in these files. If a decision, value, or
> result matters, it is not "known" until it is written to the repo and committed.
> When you finish real work, update the relevant file so the next session inherits it.

---

## 1. What this project is

Converting **Mazak VQC 20/40B, SN 060231** from its original Mazatrol M-2 control to
**LinuxCNC 2.9.10** (Debian 13, PREEMPT-RT) driving **Mesa** FPGA hardware. The machine
was mechanically sound and working before the retrofit. Goal: replace obsolete
control hardware/software while retaining reliable OEM machine hardware, functions,
and serviceability, and keeping every changed circuit understandable years later.

**Control stack (do not silently change):**
7i80HDT Ethernet host → P1/7i44 smart-serial → 7i84U-A (ch0, field I/O) and
7i84U-B (ch1, limits/homes/drive-enables/relays); P2/7i49 resolver feedback +
±10 V analog outs; **P3 is unused/spare — bare 3.3 V GPIO, never 24 V field wiring.**
The Renishaw MP-3 probe lands on **7i84U-B TB3 IN15** (opto-isolated), *not* P3.

---

## 2. Read these before proposing anything

| Read first | Why |
|---|---|
| **`docs/ai_project_instructions.md`** | The full operating manual: control hardware, sources of truth, working rules, electrical architecture, safety, commissioning sequence, documentation standards. **This is the authoritative brief — read it in full for any non-trivial task.** |
| **`docs/project_status.md`** | Current state, TODO priorities, and the D1–D16 pre-power deliverables gating live power. |
| **`docs/authority_hierarchy.md`** | Which file wins when two disagree, and the script that enforces it. |
| **`mesa/current_pin_authority.csv`** | Electrical channel authority — one row per physical Mesa pin. The source of truth for pin/HAL bindings. |
| **`wiring/authority_conflicts.md`** | Known documentation-vs-physical conflicts not yet resolved. |
| **`docs/superseded_claims_2026-08-06.md`** | Retracted claims. Do not resurrect them (e.g. the P3 `gpio.042` probe binding, the 7i97T architecture). |

---

## 3. Non-negotiable rules (summary — full versions in `docs/ai_project_instructions.md`)

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
  (`57`, `57A`, `40`, `40A`, `EHB`, `MAR`, `EMS`, `OTR`, `PIOT`, `*ESP`) unless a
  documented revision says otherwise. Do not reuse retired OEM wire numbers for new wiring.
- **Keep the two 24 V domains isolated.** OEM `P24`/`G24` never connects to Mesa/new I/O;
  every OEM↔new signal crosses an interposing relay.
- **Cite everything** using the citation format in the instructions (repo path+section,
  OEM pub/page/drawing, Mesa file/model/page, physical wire/terminal/pin, HAL card/port/channel/pin).

---

## 4. Where to do the work: local vs. cloud

Both kinds of Claude session share this repo as memory, but they can touch different things.

**Do LOCALLY (desktop app / CLI on the shop PC, with Desktop Commander)** — anything that
needs the real machine, hardware, OS, or live measurements:
- Live Mesa install, `mesaflash`/`readhmid`, bitfile flashing, IDROM/pin-dump capture.
- Editing and testing HAL/INI on the control PC (`halrun`, watching real pins).
- Host/NIC/network setup (static IP 192.168.1.121, `hm2_eth`, `enp0s31f6`), package installs,
  systemd services.
- Resolver/analog scope measurements, 24 V and safety-chain tracing, continuity checks.
- Axis / spindle / ATC bring-up and every commissioning step.
- Importing cabinet photos into `photos/`.
- **Then write results into the repo and commit** — that is how the knowledge survives.

**Hand to CLOUD (claude.com/code, parallel sessions, reviewed as PRs)** — self-contained
work that only needs files already in git and cannot touch the machine:
- Documentation polish and reconciliation (`docs/`, `README.md` progress tables, wiring narratives).
- The `io-dashboard/` web app (pure JS/CSS/HTML).
- Python tooling and validators (`scripts/validate_authority.py`, `validate_control_logic.py`,
  `generate_*.py`, `build_manual_set.py`) — these can run their own checks in the container.
- Regenerating derived artifacts (label CSVs, wire reference sheets, manual sets) from source data.
- Cross-checking the CSV/XLSX pin-authority and BOM data for conflicts.

**The trap:** a cloud session can *draft* a HAL file but has never seen the machine and cannot
verify anything. Never let cloud output stand as commissioned truth — only local work against
the real hardware (plus a human) can commission.

---

## 5. Validation & housekeeping

- After editing pin bindings or HAL, run the authority checker:
  `python3 scripts/validate_authority.py` (and `validate_control_logic.py` where relevant).
- When you complete real work, update `docs/project_status.md` and any file whose facts changed,
  then commit with a clear message. An append-only decision/change log captures *why*, not just *where* —
  prefer adding to it over overwriting history.
- Commit and push before a session ends; a cloud container is ephemeral and unpushed work is lost.
