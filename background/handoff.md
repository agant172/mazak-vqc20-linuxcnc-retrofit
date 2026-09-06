# Handoff — resolver thread, 2026-08-17

Written for a session picking this up on the **OptiPlex** (Claude Code is installed
there: `~/.local/bin/claude`). Read [`CLAUDE.md`](CLAUDE.md) first — it is the
operating manual. This file is a **dated snapshot of one thread**, not a status
board: the live task list lives in
[`docs/project_status.md`](docs/project_status.md), and that file wins if the two
ever disagree.

**Do this first:** `git pull`. A clone left at yesterday's commit reads pre-τ
conclusions and will re-derive things that are now settled.

---

## Where the resolver thread stands

### Settled, with citations — do not re-derive

| Fact | Source |
|---|---|
| Pin assignment: **12/13 = exciter SIN, 14/15 = exciter COS, 16/17 = resolver output**, 20 = sealed gnd, 19/18 = tacho, 1&7 = power gnd | M2 Maintenance Manual, Fig. 14.4-1, printed p. 250 |
| The OEM ran the detector **two-phase-excited, single-output** — the reverse of the 7i49 | same figure; M2 §6.6.1 (phase-analog loop) |
| 7i49 wiring: **excite 16/17, read 12/13 and 14/15** | reciprocity; unchanged from the earlier plan, but now for the right reason |
| The detector is **multi-pole** — index/null homing is impossible, switch homing mandatory | M2 Table 14.3-1, §14.2, §6.7.1 |
| Measured DC resistance: 105–109 Ω matched pair, 35 Ω odd winding, all three axes | at the machine, 2026-08-16 |
| **`τ = 2`**, from `MC1–MC4 = 784` (`LINEAR ZONE \| τ × 8`) | Parameter manual printed p. 6-35; value on both the 1985 sheet and the 2026 CRT |
| **Grid spacing = 4000/τ = 2.000 mm** = travel per resolver *electrical* revolution | M2 printed p. 109 + §6.7.1 |
| **Ballscrew lead = 10.000 mm on X, Y and Z** — each screw hand-turned one revolution, 10 mm of travel on each | at the machine, 2026-08-17 ([`docs/ballscrew_lead_2026-08-17.md`](docs/ballscrew_lead_2026-08-17.md)) |
| **Resolver↔screw coupling is 1:1** — MIKI PULLEY ARM-100, ⌀9.52 mm bores both sides | OEM parts list `413LE02A000.pdf` p. 49, drawing `041311AS012` |

### Proposed — believed right, not measured here

- **`RESOLVER_SCALE` = 2.000 mm = 0.07874016 in** per electrical revolution, X/Y/Z.
  Corroborated by a sibling VQC 15/40 retrofit running the identical value.
  **Does not depend on the ballscrew lead.**
- **n = 5** (5 electrical revolutions per screw revolution). The 10 mm lead it needs is now
  **measured** (2026-08-17), and the coupling is a confirmed 1:1 — so n = 10.000 ÷ 2.000 is
  arithmetic on a measured lead plus the τ = 2 derivation, not a guess from a part number.
  It stays under *Proposed* only because the 2.000 mm grid spacing is itself derived.
  `RESOLVER_INDEX_DIVISOR = 5` is entered in the INI on that basis.

### Open — and what would close it

1. **Verify the scale on the machine.** Predicted result: 2.000 mm of travel per
   electrical revolution, 5 nulls per screw revolution. If the bench disagrees,
   **the bench wins.**
2. ~~**Confirm the flex coupling is 1:1.**~~ **CLOSED 2026-08-17** — the OEM parts list shows
   a MIKI PULLEY ARM-100 (`L10MN000070`) with equal ⌀9.52 mm bores on both sides, joining
   resolver to screw coaxially on all three axes. No reduction, so nothing scales 0.07874016.
   Note the 18:30 (and 20:25) timing-belt reduction is **motor→screw**, on the far side of the
   screw from the resolver — do not apply it to `RESOLVER_SCALE`.
3. **Transformation ratio and phase shift at 5 kHz** — measured, not looked up.
   See the warning below.
4. **Desk items** — see
   [`docs/project_status.md`](docs/project_status.md#open-desk-items--no-machine-access-needed).
   Both of the two named here are now closed: the P1 card is a **plain 7i49** (settled
   2026-08-22 by owner, superseding a brief 2026-08-17 misread of the sister's purchase
   spreadsheet as `7i49HV`), and the ballscrew lead is **10.000 mm** — settled not by the
   parts list, which never states it, but by turning the screw.

---

## The one thing most likely to mislead you at the scope

Older notes said to expect **~1 V RMS sin/cos from ~2 V RMS drive**. That figure is
from the rotor-excited TS2014N141E26 and **points the wrong way for this detector.**

Mitsubishi excited the two-phase windings and read the single one. Driving it the
7i49 way — exciting 16/17 — runs it **backwards through a ratio of about 0.3, i.e.
roughly a 3× step-UP**. Returns may be several volts, not one.

**That is expected behaviour, not a fault.** Measure before assuming a plain 7i49's
input window is safe, and treat it as the same question as the 7i49-vs-7i49HV item.

---

## Two traps that produced false negatives on 2026-08-17

Both looked like findings until they were re-checked. Both are cheap to repeat.

1. **Grepping OCR of a scanned manual is not a search.** Full-text OCR of the
   48-page parameter book returned zero hits for `tau`/`grid`/`detector`/`resolver`/
   `pole`, and that was written up as "τ is not in the parameter book". τ *is* in it,
   printed as a Greek letter **inside a figure**, which OCR renders as noise.
   **Render the page and look at the image.**
2. **`which <tool>` over SSH is not an installation check.** A non-interactive SSH
   shell gets `PATH=/usr/local/bin:/usr/bin:/bin:/usr/games`, excluding
   `~/.local/bin` — which produced a wrong "Claude Code is not installed" on a box
   where it was installed. Use the explicit path or `bash -lc`.

---

## Where the source documents are

Nothing large is committed (media rule). To get back to the primaries:

| Document | Where |
|---|---|
| `M2 Maintenance Manual` (BNP-A2443A / M1243-ES), 297 pp | MEAU knowledge base DocID `3E26SJWH3ZZR-24-2354` — **sign-in required**; logged out the KB returns *zero* results for `MELDAS`, logged in it returns 479 |
| `TRS Maintenance Manual` — different amplifier family, era context only | MEAU DocID `3E26SJWH3ZZR-24-3738` |
| `Parameter List & Explanation for M-2`, Pub. PAREXM2I0E | Drive `Manuals_SN060231`, file ID `1ZSqdppzTx4Xd0q6b4XNqcguX3hgHgJpx` |
| `VQC20-40_060231_Parts_List.pdf` — for the ballscrew lead | same Drive folder |
| Live `MACH CONSTANT PAR NO.2` CRT photo | Drive file ID `1yTkUJBBNEuA-mmtQIEsrb2WuOz5qpe3N` |
| All three PDFs, already downloaded | `~/Downloads` on the OptiPlex |
| **Google Drive, mounted locally on the iMac** — read the manuals directly, no download needed | `~/Library/CloudStorage/GoogleDrive-andy.gant@gmail.com/My Drive/Mazak/Manuals_SN060231/` |
| Sister-machine configs (card, excitation, resolver scale) | `github.com/srdco/MazakVQC1540`, `MAZAK-VQC1540-20170501/` |

Both Meldas manuals are **scans with no text layer**: page images only. Printed page
= PDF page − 11 in the M2 maintenance manual. OCR them with `pdftoppm -r 250 -png`
plus any OCR engine — **and read every figure as an image.**
