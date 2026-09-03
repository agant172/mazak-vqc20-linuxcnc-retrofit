# Spindle-head device placard — OEM legend, transcribed

> **ROLE: REFERENCE** — OEM placard transcription (a generic family plate; see its warnings). Kept at this path because the pin authority and io-dashboard cite it. See [../INSTALL_SPINE.md](../INSTALL_SPINE.md).


**Machine:** Mazak VQC 20/40B SN 060231
**Source:** OEM printed placard mounted **inside the splash-guard door**, facing
the spindle head. Plate drawing number **`24136209710`** (trailing katakana not
transcribed). Photographed close-up 2026-08-12.
**Type:** isometric line drawing of the spindle head with leader lines to each
device, each labelled `FUNCTION` over `TAG`.

> **What this source can and cannot establish.** It is an OEM, machine-mounted
> **device-identity and location** legend — it says *which tag is which
> function, and roughly where it sits on the head*. It carries **no wire
> numbers, terminals, connector pins, coil voltages, or polarity**, and it only
> covers devices **on the head**. Use it to settle *identity* questions; it
> cannot settle a wiring path.

> ## ⚠️ THE PLACARD IS A GENERIC FAMILY PLATE — IT LISTS DEVICES THIS MACHINE
> ## DOES NOT HAVE
>
> **Established 2026-08-13 (owner, on the machine): only two air solenoids exist
> on the head, and there are no hidden ones.** Coil wire labels were read on every
> device present — see
> [`head_valve_hardware.md`](head_valve_hardware.md#coil-wire-labels--read-off-the-machine-2026-08-13).
>
> | Placard tag | Function | Fitted on this machine? |
> |---|---|---|
> | `SOL-10` | Tool unclamp | ✅ yes — wire `410` |
> | `SOL-12` | Gear shift high | ✅ yes — wire `412` |
> | `SOL-13` | Gear shift low | ✅ yes — wire `413` |
> | `SOL-15` | Spindle air blast | ✅ yes — wire `415` |
> | `SOL-16` | Work air blast | ✅ yes — wire `416` |
> | `SOL-31` | Flood coolant | ❌ **not on the head** |
> | `SOL-35` | Dust inhole eliminate | ❌ **not on the head** |
> | `SOL-36` | Oil hole | ❌ **not on the head** |
> | `SOL-61` | Air jet | ❌ **not on the head** |
>
> Four of the nine solenoid tags have no device. The plate is evidently printed
> for the **VQC-20/40 family with all options**, not for this serial number. The
> `PRS-`/`PS-` pressure switches it lists are unaffected — those were confirmed
> against the pin authority independently.
>
> **Consequence: presence on this placard is NOT evidence a device exists.** The
> tag→function mapping it gives remains reliable and is corroborated by
> `connector_crossref.md` and the wire numbers. But every "confirmed" verdict
> below should be read as *"the placard names this device correctly"*, never as
> *"this device is fitted"*.
>
> **Do not conclude the missing four exist nowhere on the machine.** The placard
> covers the head only, and some of these functions plausibly live elsewhere —
> **flood coolant in particular** almost certainly exists as a machine function
> (the pin authority carries `COOLANT_ON` and CN11 carries both wire `231` flood
> coolant and wire `236` flood-coolant motor starter), just not as a head-mounted
> valve. The correct reading is **"not on the head"**, not "does not exist".
> `SOL-61` air jet serves the MMS touch sensor, which the element crosswalk
> already flags `OPTION_VERIFY` — consistent with an unfitted option.

---

## Transcription (verbatim)

**Left-hand callouts**

| Function | Tag |
|---|---|
| `GEAR SHIFT LOW` | `SOL-13` |
| `GEAR SHIFT HIGH` | `SOL-12` |
| `TOOL UNCLAMP` | `SOL-10` |
| `HIGH GEAR` | `PRS-10` |
| `LOW GEAR` | `PRS-12` |

**Right-hand callouts**

| Function | Tag |
|---|---|
| `TOOL CLAMP` | `PRS-9` |
| `TOOL UNCLAMP` | `PRS-8` |
| `FLOOD COOLANT` | `SOL-31` |
| `OIL HOLE` | `SOL-36` |
| `DUST INHOLE ELIMINATE` | `SOL-35` |
| `AIR JET` | `SOL-61` |
| `WORK AIR BLAST` | `SOL-16` |
| `SPINDLE AIR BLAST` | `SOL-15` |
| `HEAD LUBE PRESSURE` | `PS-5` |

Notes on the text itself:
- The plate reads **`DUST INHOLE ELIMINATE`**. Elsewhere the repo has
  "Dust Inhale Eliminate" (`connector_crossref.md`, `io_map_research_notes.md`).
  Same device; treat the spelling difference as an OEM/transcription artifact,
  not two devices.
- `HEAD LUBE PRESSURE` is tagged **`PS-5`**, not `PRS-5` — the plate uses `PRS-`
  for the other pressure switches but `PS-` for this one. The pin authority
  already uses `PS-5`.
- **Exactly one tool-related solenoid appears: `SOL-10 TOOL UNCLAMP`.** No
  "tool clamp" solenoid is drawn anywhere on the head.

---

## What this confirms

Cross-checked against `../mesa/current_pin_authority.csv`:

| Authority row | CSV field point | Placard | Verdict |
|---|---|---|---|
| `GEAR_HI_SOL` (OUT7) | `SOL-12` | `GEAR SHIFT HIGH SOL-12` | ✅ confirmed |
| `GEAR_LO_SOL` (OUT8) | `SOL-13` | `GEAR SHIFT LOW SOL-13` | ✅ confirmed |
| `TOOL_UNCLAMP_SOL` (OUT10) | `SOL-10` | `TOOL UNCLAMP SOL-10` | ✅ confirmed |
| `TOOL_CLAMP_SOL` (OUT9) | `NOT_USED` — "PHANTOM, SOL-10 is single-coil" | no clamp solenoid drawn | ✅ **supports the PHANTOM call** |
| `TOOL_CLAMP_CONF` (IN15) | `PRS-9` | `TOOL CLAMP PRS-9` | ✅ confirmed |
| `TOOL_UNCLAMP_CONF` (IN16) | `PRS-8` | `TOOL UNCLAMP PRS-8` | ✅ confirmed |
| `GEAR_HI_CONF` (IN17) | `PRS-10` | `HIGH GEAR PRS-10` | ✅ confirmed |
| `GEAR_LO_CONF` (IN18) | `PRS-12` | `LOW GEAR PRS-12` | ✅ confirmed |
| `LUBE_OK` (IN25) | `PS-5` | `HEAD LUBE PRESSURE PS-5` | ✅ confirmed |

Two entries in [`authority_conflicts.md`](authority_conflicts.md) gain
independent, machine-mounted corroboration — see §1 and §2 there.

---

## What this contradicts

**Three 7i84U-B relay-driven output rows carry solenoid identities the placard
disagrees with.** Recorded as [`authority_conflicts.md`](authority_conflicts.md)
**§5**, where a follow-up wire-number trace (2026-08-12) resolves two of the
three. Summary as first found:

| Row | CSV says | Placard says | Problem |
|---|---|---|---|
| `AIR_BLAST` (OUT3) | `SOL-62`, "spindle air blast" | `SPINDLE AIR BLAST` = **`SOL-15`**; no `SOL-62` on the head | Tag may be wrong |
| `TOUCH_SENSOR_BLAST` (OUT4) | `SOL-35`, "MMS touch-sensor air jet" | `AIR JET` = **`SOL-61`**; `SOL-35` = **dust inhole eliminate** | Function/tag crossed |
| `TAP_COOLANT_BLAST` (OUT5) | `SOL-61`, tap coolant | `SOL-61` = **`AIR JET`** | Tag collision with the row above |

These are **100 VAC solenoid loads** slated for interposing relays RLY-5/6/7. No
output is landed or energised yet (pre-power), so there is no live hazard — but
the identities must be settled **before** those relays are wired, or an output
could drive the wrong device.

**No pin binding, `hal_net`, or `authority_status` has been changed on the
strength of this placard.** The affected CSV rows carry a pointer to §5 only.

**Trace outcome (see §5 for the working):** the OEM wire numbering follows a
strict rule — RC3A bank wire `4NN` drives `SOL-NN`, with the terminal-unit side
carrying the same function as `7NN` (T.U. CN11 → SSR board, dwg 4143175414
p140). On that basis `AIR_BLAST` is `SOL-15` and
`TOUCH_SENSOR_BLAST` is `SOL-61` — both keep their correct function and wire, so
those are relabels rather than rebindings. `TAP_COOLANT_BLAST` is the genuinely
open one: its `SOL-61` tag belongs to the air jet, and no solenoid has been
identified for tap coolant. The placard's two novel data points, `OIL HOLE
SOL-36` (wire 436, T.U. 736) and `AIR JET SOL-61` (wire 461, T.U. 761), both
land exactly where the rule predicts — which is what makes the rule trustworthy.

---

## Provenance note — why the close-up mattered

A first attempt to read these tags from a **wide** shot got **6 of 13 entries
wrong**: `PRS-3`/`PRS-4` (actually `PRS-9`/`PRS-8`), `SOL-33` (actually
`SOL-36`), `SOL-36` for dust (actually `SOL-35`), `SOL-6` (actually `SOL-61`),
`PRS-5` (actually `PS-5`), and it missed `SOL-10 TOOL UNCLAMP` entirely. That
read was explicitly marked low-confidence and nothing was changed from it.

Two standing lessons, both already borne out in this repo: small text in a wide
frame is not a source, and a plausible-looking tag read is exactly the failure
mode that put `V 150` (actually `130`) into `photo_survey_misc.md`.

---

## Related

- [`authority_conflicts.md`](authority_conflicts.md) §1, §2, §5
- [`connector_crossref.md`](connector_crossref.md) — wire 415/416/435 → SOL-15/16/35
- [`io_map_research_notes.md`](io_map_research_notes.md) — solenoid function table
- [`bbia1_source_dest.csv`](bbia1_source_dest.csv) — `AIR_BLAST` ambiguity, `TOUCH_SENSOR_BLAST` wire 261
- [`../mesa/current_pin_authority.csv`](../mesa/current_pin_authority.csv)
- [`head_valve_hardware.md`](head_valve_hardware.md) — the physical valves these tags refer to (Nachi hydraulic, CKD pneumatic), photographed 2026-08-13
- [`../docs/spindle_motor_plg_encoder.md`](../docs/spindle_motor_plg_encoder.md) — the photo batch this came from
