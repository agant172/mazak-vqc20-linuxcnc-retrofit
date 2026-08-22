---
name: ssh-to-optiplex
description: Troubleshooting `ssh linuxcnc` to the OptiPlex control PC — diagnosing "Permission denied (publickey,password)" after the switch from Tailscale SSH to plain sshd, installing a key, and the non-interactive PATH gotcha that makes `which claude` wrongly report "not installed". Use when an SSH connection to the machine fails or a command behaves differently over SSH than in a terminal.
---

# Working from a Mac over SSH — troubleshooting

The safety boundary for what may be run over SSH lives in `CLAUDE.md`
("Working from a Mac over SSH") and is NOT repeated here. Read it there.

**If `ssh linuxcnc` returns `Permission denied (publickey,password)`, that machine's key is not
installed** — the OptiPlex switched from Tailscale SSH to plain sshd on 2026-08-16 and keys did
not carry over automatically. Diagnose with `ssh -v` (look for `Offering public key` followed by
another `Authentications that can continue`: offered and rejected = not in `authorized_keys`).
Fix from the Mac with `ssh-copy-id -i ~/.ssh/id_ed25519.pub linuxcnc`, or paste the `.pub` line
into `~/.ssh/authorized_keys` at the OptiPlex. Password auth is still enabled, so the copy-id
path works. **Record the new key in the table above in the same commit** — that table is the only
place this is written down.

**Watch the non-interactive `PATH`.** An SSH command shell gets
`/usr/local/bin:/usr/bin:/bin:/usr/games` — **not** `~/.local/bin`. `which claude`
therefore reports nothing while `~/.local/bin/claude` exists (this produced a wrong
"not installed" on 2026-08-17). Test the explicit path or use `bash -lc`.
**Claude Code is installed on the OptiPlex** (`~/.local/bin/claude`, native install,
2026-08-17) — a session can run at the machine itself.
