---
name: obsidian-vault
description: How this repo works as an Obsidian vault — which parts of .claude/ are tracked vs local, why plugin data.json must never be committed, and how to consolidate a machine that has two clones (working copy + vault clone) without losing plugins or pane layout. Use when opening the repo in Obsidian, changing Obsidian settings, or fixing a machine with a duplicate clone.
---

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

