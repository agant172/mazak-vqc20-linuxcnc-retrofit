---
name: new-machine-setup
description: How to get a new machine (Mac, OptiPlex, or cloud container) onto this project's shared memory — authenticated clone of the private repo, the required SSH remote form, and which clones each machine is known to have. Use when setting up a new machine, diagnosing a "repository not found" clone failure, or confirming where a machine's working copy lives.
---

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
