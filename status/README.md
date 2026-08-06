# Automated status

Contents of this directory are written by the LinuxCNC host, not by hand.

- `host_status.md` — human-readable report from the OptiPlex control PC.
- `host_status.json` — same data, machine-readable.

Generator: [`scripts/host_status/`](../scripts/host_status/). The timer fires every 5
minutes on the host and only commits when values change. If this directory looks
stale, check `systemctl status mazak-host-status.timer` on the OptiPlex.
