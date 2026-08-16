# Mazak VQC-20/40 — I/O and Commissioning Workspace

A single-page, offline I/O authority navigator and commissioning wiring workspace for the
Mazak VQC-20/40 LinuxCNC + Mesa retrofit (machine S/N 060231). Both modes use the same filters,
authority rows, HAL references, conflict status, and optional read-only live values.

**I/O navigator** turns `mesa/current_pin_authority.csv`, the HAL config and the wiring notes
into a searchable table and click-through path:

```
LinuxCNC pin -> HAL net -> HostMot2/Mesa pin -> connector/channel -> field device -> machine location
```

The table and commissioning paths also show the short Epson Mesa-end ferrule codes from
`wiring/labels/bbia1_mesa_end_ferrules_epson.csv`. Search accepts the printed code (`B-TB3-07`), OEM wire
(`*DECX`), or old connector location (`CN2-15`). Current ferrule rows are explicitly shown as
`HOLD_SOURCE_TRACE`; a displayed code is a planned destination, not permission to terminate.

**Commissioning wiring** renders the same filtered rows as four-node circuit paths. Its layer
selector exposes the signal, power, return/common, and shield/cable context without filling
unknown physical details with guesses. Each path has direct repo source links and a browser-local
checkout record.

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

### 3. Auto-start on boot, reachable over Tailscale

To keep a bookmark that always works, run the bridge as a systemd service on the
LinuxCNC host and reach it by the host's Tailscale name from any device on your
tailnet. A ready-to-edit unit is at [`deploy/mazak-io-navigator.service`](deploy/mazak-io-navigator.service).

On the LinuxCNC host:

```bash
# 1. Find this host's Tailscale name/IP (used in the bookmark below)
tailscale status          # the first column is the device name, e.g. "mazak"
tailscale ip -4           # or the 100.x.y.z address

# 2. Edit the two EDIT-ME lines in the unit (User + WorkingDirectory), then install
sudo cp io-dashboard/deploy/mazak-io-navigator.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now mazak-io-navigator

# 3. Verify
systemctl status mazak-io-navigator
curl -s http://127.0.0.1:8765/api/health     # {"ok": true, "halcmd": true/false, ...}
```

**Bookmark:** `http://<host-tailscale-name>:8765/` (e.g. `http://mazak:8765/` with
MagicDNS, or `http://100.x.y.z:8765/`). Open it and press **Live poll** in the
header. The unit binds `0.0.0.0` so the Tailscale interface can reach it; to keep
it off the local LAN entirely, bind this host's Tailscale IP instead (see the
comment in the unit) and let your tailnet ACLs govern who connects.

The service is safe to start before LinuxCNC: until HAL is up, `/api/io` reports
offline and the app stays in planning mode, then live poll begins working the
moment LinuxCNC starts — no restart needed.

### Reach it from your phone (different subnet / cellular)

Whether a phone can open the dashboard depends on the network path to the
LinuxCNC host, not on the app — it is just a web page on port `8765`.

**Same router, different subnet** (e.g. the wired shop LAN vs. your normal
Wi-Fi, where the router routes between them): no extra setup. Make sure the
bridge is bound to `0.0.0.0` (the systemd unit already is; or run
`python3 serve_live.py --host 0.0.0.0`), find the host's shop-LAN address with
`ip -4 addr` on the host (its *LAN* IP, not the `192.168.1.121` Mesa-NIC
address), and browse to `http://<host-LAN-IP>:8765/`.

**Isolated subnet or off-site** (guest Wi-Fi, a separate VLAN with no
inter-routing, or the phone on **cellular**): plain LAN can't reach it — use
**Tailscale**, which the boot service above is already built for. It gives the
phone a bookmark that works from any network without opening a single firewall
port:

1. Set up the host once, as in section 3 (install Tailscale, `sudo tailscale up`,
   enable the `mazak-io-navigator` service).
2. On the phone: install the **Tailscale** app and sign in to the **same
   tailnet** (same account) as the host.
3. Open `http://<host-tailscale-name>:8765/` — e.g. `http://mazak:8765/` with
   MagicDNS, or `http://100.x.y.z:8765/`. Add it to your home screen for a
   one-tap bookmark, then press **Live poll** in the header.

**Do not port-forward `8765` to the internet.** The bridge is read-only (it only
runs `halcmd -s show sig` and refuses writes), but a machine tool has no business
exposed on a public port. Tailscale needs no open ports and gates access with
your tailnet ACLs; to keep the dashboard off the shop LAN entirely, bind the
host's `100.x.y.z` Tailscale IP instead of `0.0.0.0` (see the comment in the
unit file).

### 4. Share a snapshot with someone outside the tailnet

Everything above needs either the shop LAN or an account on your tailnet, so
none of it helps you show the workspace to a machinist, a supplier, or anyone
else off the network — and the repo is private (2026-08-16), so a GitHub link
will not work either.

```bash
python3 io-dashboard/tools/build_standalone.py
# -> io-dashboard/dist/mazak-io-navigator.html   (~475 KB, one file)
```

That bundles the three stylesheets and five scripts into a single HTML file
with no external requests, so it can be emailed, put on a USB stick, or
published as a Claude Artifact and shared by link. `dist/` is git-ignored —
rebuild it, don't commit it.

**What the snapshot gives up**, all of it deliberate:

- **No live poll.** There is no `serve_live.py` behind it, so the Live button is
  hidden and the header reads *Static snapshot* instead of *Planning mode*. The
  Observed column stays empty.
- **No source links.** `REPO_BLOB` is emptied, because a private-repo blob URL
  404s for every viewer who is not a collaborator.
- **Frozen data.** The banner carries the commit and build date; anyone reading
  it later needs that to know whether it predates the change they are asking
  about. Rebuild and re-share after any authority change.

**Before you send it, remember what is in it:** the full pin authority, the
wiring crosswalk, and the commissioning records for the machine. Nothing there
is a credential, but it is the whole electrical design of your mill — share it
with people, not with the internet.

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
| Switch workspace      | **I/O navigator** / **Commissioning wiring** in the header              |
| Deep link a circuit   | `index.html#wiring=AIR_BLAST`                                           |

**Views:** All signals, 7i80HDT, 7i44, 7i49, 7i84U-A, 7i84U-B, and Conflicts / unverified. The conflicts view puts
the C1–C10 register above the affected rows.

**Manual state (wiring checkout).** Each signal detail panel has `0` / `1` / `clear` buttons and a
free-text checkout note. This is **session-only scratch state held in memory** — it is not written
to disk, not written to HAL, and not sent to the machine. Refreshing the page clears it. Export CSV
to keep it: the `manual_state` and `manual_note` columns come along.

**Observed column.** Shows `MAN n` for a manual override, a live value when the bridge is
connected, and `—` otherwise. A manual override always wins over the live value so a checkout note
is never silently overwritten.

### Commissioning wiring records

The commissioning workspace has four layers:

- **Signal path** — LinuxCNC/HAL, computed Mesa connector pin, known interface, field device.
- **Power context** — documented 7i84U field-power bank, with untraced source/fuse/load details flagged.
- **Return / common** — documented 7i84U common terminals, kept distinct from the untraced load return.
- **Shield / cable** — project grounding rules where specific, with unknown cable-end treatment flagged.

Checkout fields include wire and cable IDs, both terminal landings, relay/interface terminals,
fuse, return and shield paths, voltage readings, continuity, normal state, verifier, date, evidence
reference, and notes. User-entered verification dates and export filenames use `DD-MM-YYYY`;
machine-readable save timestamps remain ISO 8601. Records autosave in the current browser using `localStorage`. Use **Export JSON**
for backup/transfer, **Import JSON** to merge a saved record, **Export filtered CSV** for a work
package, and **Print view** for paper/PDF output.

These local records are evidence notes only. They do not edit `current_pin_authority.csv`, promote
an authority status, write HAL, or permit energization. Promote authority only through the repo's
documented review and validation process.

---

## Status language

Statuses are taken from `authority_status` in `mesa/current_pin_authority.csv` and are deliberately
literal. No unverified pin is ever described as safe.

The taxonomy is defined in [`../docs/pre_power_deliverables.md`](../docs/pre_power_deliverables.md).
The legacy `ACCEPTED` and `ACCEPTED_VERIFY` states were retired
as of that document; existing rows migrated to `PROPOSED`.

| Status | Meaning |
| --- | --- |
| `PROPOSED` | Paper design carries this claim. No physical verification. |
| `TRACED` | Wire path physically traced end-to-end with a meter; continuity confirmed in both states. |
| `ELECTRICALLY_VERIFIED` | Powered to nominal voltage and measured; normal and tripped voltages recorded. |
| `HAL_VERIFIED` | HAL pin toggles correctly against physical stimulus, captured in a `halscope` trace. |
| `COMMISSIONED` | Passed the safety / functional acceptance for its role, including fault injection. |
| `COMMISSIONING_PENDING` | Signal defined; physical verification deferred to commissioning. Compatible with `PROPOSED`. |
| `SPARE` | Pin allocated for future use, no signal assigned. |
| `RESERVED` / `RESERVED_VERIFY` | Pin held for a specific future function. |
| `DEFERRED` | Signal out of first-power scope by decision. |
| `HOLD_CONFLICT` | Conflicting authority claims between docs; requires reconciliation before promotion. |
| `OPTIONAL_VERIFY` | Signal is not on the critical path. |

Green is used only for *verified*. Because no row is verified yet, you should see no green.
That is intentional and honest.

---

## Expected idle states

Expected states come from explicit repo evidence, and every value carries its basis
(file:line) in the detail panel:

- NC limit inputs are inverted in HAL by consuming the sserial `-not` complement pin (`input-NN-not`) — there is no `invert_input` parameter on sserial input pins. Normal (untripped) reads as logical **0**; open (tripped) reads as **1**. See [sserial(9)](https://linuxcnc.org/docs/html/man/man9/sserial.9.html).
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
| `wiring/labels/bbia1_mesa_end_ferrules_epson.csv` | Draft short Epson codes for conservative BBIA cut-wire matches; release status is preserved. |
| `mesa/signal_map.csv` | **Stale.** Surfaced only as "do not use" context in the detail panel. |

Current snapshot: **132 rows**, all from the authority, with 4 registered conflicts,
0 HAL-only orphan nets, and 1 authority net missing from HAL (`work-light`, planned but not yet
wired — see `tools/generate_data.py` output for the live count).

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
commissioning.css commissioning circuit paths, evidence form, responsive and print layout
commissioning.js  wiring layers, source links, local checkout record import/export
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
- The table drawer's manual 0/1 scratch state is session-only. Commissioning wiring records persist
  in that browser, but still require JSON export for backup, transfer, or version-controlled retention.
- 7i84U-A channel numbers in `field_7i84u.hal` currently disagree with the authority (C1, C2).
  Do not land wire from the HAL numbers.
