# Mazak VQC-20/40 — I/O Navigator

A single-page, offline wiring navigator for the Mazak VQC-20/40 LinuxCNC + Mesa retrofit
(machine S/N 060231). It turns `mesa/current_pin_authority.csv`, the HAL config and the
wiring notes into a click-through path:

```
LinuxCNC pin -> HAL net -> HostMot2/Mesa pin -> connector/channel -> field device -> machine location
```

**This is a configuration snapshot, not a safety controller.** Nothing in it is a permission to
energize. The hardware E-stop chain must remove hazardous power independently of LinuxCNC.

---

## Run it

### 1. Static (any machine, fully offline)

```bash
cd io-dashboard
python3 -m http.server 8765
```

Then open <http://127.0.0.1:8765/>.

You can also just double-click `index.html` — it works from `file://` because there are no
modules, no fetches at load time and no CDN assets. Only the optional live poll needs a server.

### 2. Live bridge (on the LinuxCNC host)

```bash
cd io-dashboard
python3 serve_live.py                 # http://127.0.0.1:8765/
python3 serve_live.py --port 9000
python3 serve_live.py --host 0.0.0.0  # reachable from another machine on the shop LAN
```

Default URL: **http://127.0.0.1:8765/** — press **Live poll** in the header to start reading.

`serve_live.py` serves this folder and adds two endpoints:

| Endpoint      | Behaviour                                                              |
| ------------- | ---------------------------------------------------------------------- |
| `/api/io`     | Runs `halcmd -s show sig`, returns `{ok, mode, count, signals{net: value}}` |
| `/api/health` | Reports whether `halcmd` is on PATH                                    |

It is read-only by construction:

- The only command it ever executes is `halcmd -s show sig`.
- There is no code path that calls `setp`, `sets`, `net`, `unlinkp`, `loadrt`, or anything that
  can change machine state.
- `POST` / `PUT` / `PATCH` / `DELETE` are refused with HTTP 405.
- Responses are cached for 0.5 s so a polling browser cannot hammer `halcmd`.

If `halcmd` is missing or LinuxCNC is not running, `/api/io` returns `{"ok": false, "error": ...}`,
the header pill reads **Bridge offline**, and the app stays in planning mode with no loss of
function.

Python 3 standard library only. No pip installs, no internet access.

---

## Using it

| Action                | How                                                                    |
| --------------------- | ---------------------------------------------------------------------- |
| Focus search          | `/`                                                                    |
| Move between rows     | `↑` `↓` (or `j` / `k`)                                                 |
| Open a signal         | `Enter` / `Space` on a focused row, or click                           |
| Close the detail panel| `Esc`                                                                  |
| Export the filtered view | **Export CSV**, or `Ctrl/Cmd + E`                                   |
| Theme                 | Sun icon in the header (dark is the default for shop lighting)         |
| Deep link a signal    | `index.html#signal=ESTOP_CHAIN`                                        |

**Views:** All signals, 7i80HDT, 7i44, 7i49, 7i84U-A, 7i84U-B, and Conflicts / unverified. The conflicts view puts
the C1–C10 register above the affected rows.

**Manual state (wiring checkout).** Each signal detail panel has `0` / `1` / `clear` buttons and a
free-text checkout note. This is **session-only scratch state held in memory** — it is not written
to disk, not written to HAL, and not sent to the machine. Refreshing the page clears it. Export CSV
to keep it: the `manual_state` and `manual_note` columns come along.

**Observed column.** Shows `MAN n` for a manual override, a live value when the bridge is
connected, and `—` otherwise. A manual override always wins over the live value so a checkout note
is never silently overwritten.

---

## Status language

Statuses are taken from `authority_status` in `mesa/current_pin_authority.csv` and are deliberately
literal. No unverified pin is ever described as safe.

| Status                       | Meaning                                                                  |
| ---------------------------- | ------------------------------------------------------------------------ |
| Field verified               | Measured in the cabinet and signed off. **Currently zero rows qualify.**  |
| Accepted — verify continuity | Assignment accepted; still ring out before power                         |
| Accepted — verify in cabinet | Assignment accepted; landing point not confirmed on the machine          |
| Reserved / Optional — verify | Channel held or optional; confirm intent before wiring                   |
| Commissioning pending        | Planned, awaiting cabinet tracing, polarity confirmation or measurement  |
| In HAL only — no authority row | Net exists in HAL but has no authority row (came from the stale map)   |
| Conflict — hold, do not wire | Two sources disagree. Resolve against schematic set 41434WB.pdf first    |
| Hold — hardware not ordered  | No hardware allocated                                                    |
| Spare / Not used             | Deliberately free                                                        |

Green is used only for *verified*. Because no row is verified yet, you should see no green.
That is intentional and honest.

---

## Expected idle states

Expected states come from explicit repo evidence, and every value carries its basis
(file:line) in the detail panel:

- NC limit inputs are inverted in HAL (`invert_input 1`) → normal logical **0**.
- NO home inputs idle at **0**.
- E-stop chain closed/healthy → `estop-ext` logical **0** after inversion.
- Digital outputs idle **0** unless commanded.
- Analog servo and spindle commands idle at **0 V**.
- Resolver inputs are **dynamic**; validity to be verified at commissioning.
- Drive-fault inputs are **unknown polarity** until inversion is commissioned.
- Everything else is labelled **Unknown — measure/verify**. It is not guessed.

---

## Data provenance and precedence

| Source | Role |
| ------ | ---- |
| `mesa/current_pin_authority.csv` | **Wiring authority.** Wins every disagreement. |
| `linuxcnc/*.hal`, `mazak_vqc_20_40.ini` | Configured HAL chains. Contain placeholders and known conflicts. |
| `wiring/connector_crossref.md`, `wiring/io_map_research_notes.md` | Machine-side designations, locations, conflict notes. |
| `mesa/signal_map.csv` | **Stale.** Surfaced only as "do not use" context in the detail panel. |

Current snapshot: **116 rows** — 90 from the authority plus 26 HAL-only nets that have no authority
row, 10 register conflicts, 25 authority rows not yet present in any HAL file.

---

## Refreshing the data later

The app ships with the data already baked into `data.js`, so nothing has to be run to use it.
After you edit the repo, regenerate:

```bash
cd io-dashboard
python3 tools/generate_data.py                       # reads the repo root (..), writes ./data.js
python3 tools/generate_data.py --source /path/to/repo --out ./data.js
```

`tools/generate_data.py` only reads the repo (`../mesa`, `../linuxcnc`, `../wiring`) — it never writes to it.

Two layers produce `data.js`:

- **`tools/generate_data.py`** — mechanical extraction. Parses HAL `net` / `setp` / `sets`
  statements with line numbers, reads the authority and stale CSVs with line numbers, and merges.
  Anything derivable from the files belongs here.
- **`tools/enrichment.py`** — the curated layer. Status registry, expected-state rules with their
  file:line basis, machine-side locations, and the C1–C10 conflict register. **This is where you
  add human judgement.** Keys are signal IDs from the authority CSV.

Update conventions:

1. Fix the source repo first (`current_pin_authority.csv` is the authority).
2. If a signal gains a real measured normal state, add or edit its entry in `EXPECTED` in
   `tools/enrichment.py` and cite the file:line it came from.
3. When a conflict is resolved, remove its entry from `CONFLICTS` and change the affected rows'
   `authority_status` in the source CSV — do not just delete the warning.
4. `FIELD_VERIFIED` is reserved for signals actually measured in the cabinet. Do not promote
   a row to it to make the dashboard look better.
5. Re-run the generator and commit `data.js` with the change.

---

## Files

```
index.html        markup, inline SVG mark
styles.css        design system, dark + light, responsive to 375px
app.js            all behaviour (vanilla, no build step, no dependencies)
data.js           GENERATED — window.MAZAK_DATA
serve_live.py     optional read-only halcmd bridge (stdlib only)
tools/
  generate_data.py  mechanical extraction from the source repo
  enrichment.py     curated statuses, expected states, locations, conflicts
```

## Limitations

- Values are from planning documents, not measurements. Nothing here has been rung out.
- Every `hm2_7i80.*` pin name in the config is an unverified placeholder (conflict C6).
  Confirm real names with `halcmd show pin` after the first `hm2_eth` load.
- The live bridge reads HAL signal values only. It cannot see anything that is not a HAL signal,
  and a HAL value tells you what the software thinks, not what the wire is doing.
- Manual checkout state is lost on refresh by design. Export CSV.
- 7i84U-A channel numbers in `field_7i84u.hal` currently disagree with the authority (C1, C2).
  Do not land wire from the HAL numbers.
