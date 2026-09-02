# Fable 5 audit prompt — ladder / signal / diagram hardening

Paste everything below the line into a fresh Claude Code session started in
`~/mazak-vqc20-linuxcnc-retrofit` with `/model fable` set.

---

Audit and harden the ladder-logic extraction, signal mapping, and diagrams in
this repo before live bring-up. This work was built up across many sessions on
context-limited models and I know parts of it are weak or ambiguous. Your job
is to find where, prove it, and fix what can be fixed from the sources on disk.

Read `CLAUDE.md` and `docs/authority_hierarchy.md` first and obey the
authority hierarchy throughout — when two files disagree, the hierarchy decides
which one wins, not recency and not plausibility.

**Scope — the three weak areas:**

1. **Ladder transcriptions** (`docs/ladder/*_transcription.md`, 9 subsystems:
   ATC, coolant, E-stop, homing, interlocks, orient, probe/MMS, spindle run,
   plus the ATC component README). The primary source is the OEM manual
   archive in the Obsidian vault:
   `~/Projects/obsidian-vault/Machine Shop/Mazak VQC-20-40 Retrofit/Manuals/`
   — `YM2V39L.pdf` is the 95-page dedicated Ladder Diagrams (drawing
   4136081801) every transcription cites; `413LE02A000.pdf` is the electrical
   drawing set; the other PDFs there are parameter and maintenance manuals.
   Verify each transcription against the actual ladder rungs in YM2V39L,
   cross-checked with the repo's own manual set (`docs/manual_set/`,
   especially Vol4 Wiring Diagrams and I/O Reference). Hunt specifically for: contacts
   transcribed with inverted sense (NO read as NC or vice versa), transposed
   or misread bit addresses, rungs summarized instead of transcribed, timer
   and counter values stated without a source, and interlock conditions that
   were inferred rather than read off the ladder.

2. **Signal mapping** (`mesa/current_pin_authority.csv` as the claimed
   authority, cross-checked against `wiring/reconciled_pin_crosswalk_2026-08-18.csv`,
   the plane A/B crosswalks, the BBIA1 pinout and source/dest CSVs, and the
   HAL files in `linuxcnc/`). Every signal that appears in more than one file
   must agree everywhere — name, connector, pin, polarity, and Mesa channel
   assignment. `wiring/authority_conflicts.md` records past conflicts; verify
   the resolutions actually landed in every downstream file. Remember only one
   7i84U exists — any live reference to 7i84.0.1 is a defect.

3. **Diagrams** (`diagrams/wireviz/`, `diagrams/qelectrotech/`). Check that
   what's drawn matches the current pin authority and wiring crosswalks, and
   flag any diagram rendered from data that has since changed.

**Epistemic rules — these matter more than coverage:**

- Every claim in your findings must carry a citation: manual volume + page,
  ladder rung or address, CSV row, or file:line. A finding without a source
  is worthless to me.
- Classify every questionable item as one of: **VERIFIED** (matches source),
  **DEFECT** (contradicts source — show both sides), **UNSOURCED** (asserted
  somewhere but you cannot find its origin in the repo), or **AMBIGUOUS**
  (source itself is unclear — a blurry scan, two manuals disagreeing).
  Never silently resolve an ambiguity by picking the plausible reading; that
  is exactly the failure mode this audit exists to catch.
- Distinguish what can be settled from documents vs. what needs a meter or
  continuity test at the machine. Anything physical goes on a bench-check
  list, not into a file edit.

**Fixes:** Apply corrections directly where the source is unambiguous and the
authority hierarchy is clear — update every downstream copy, not just the
authority file. For AMBIGUOUS and physical-verification items, annotate in
place (a clearly-marked TODO with the competing readings) rather than editing
content. Do not touch anything in the AC/DC power or E-stop electrical scope —
that stays 100% OEM and is out of bounds for edits (auditing the E-stop
*transcription* for accuracy is fine; changing the design is not).

**Deliverables:**

1. `docs/ladder_signal_audit_<date>.md` — findings organized by subsystem,
   every item classified and cited, with a summary table up top: counts of
   VERIFIED / DEFECT / UNSOURCED / AMBIGUOUS per subsystem, so I can see at a
   glance where the extraction is solid and where it's soft.
2. The corrections themselves, committed in small, reviewable commits — one
   per subsystem or conflict cluster, each commit message citing the source
   that justified it.
3. A bench-check list: every item that can only be settled with a multimeter,
   continuity trace, or photo of the actual cabinet, ordered so I can work
   through it efficiently in one shop session. Note which cabinet photos in
   the repo/Drive might already answer a given item before sending me out
   with a meter.

Work through the whole thing without checking in. Ignore churn from the
generate_* scripts (timestamps/SHA noise — known issue, discard it). If you
hit something genuinely blocking — a source document that simply isn't in the
repo — record it in the findings as UNSOURCED and keep going.
