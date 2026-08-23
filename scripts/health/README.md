# Disk health monitoring

Answers "are the disks in the control PC healthy" without anyone having to
remember to ask. Matters more since 2026-08-23, when `/mnt/media` became the
only second copy of the G-code.

## What gets installed

```bash
sudo bash scripts/health/install_health.sh
```

| Piece | What it does |
|---|---|
| `mazak-smart-collect.timer` | hourly at `:25`, writes `/var/lib/mazak-health/smart.json` |
| `smart_collect.py` | the snapshot: model, firmware, life, temp, critical counters, last self-test, per-drive verdict |
| `smart_alert.sh` | what smartd runs on trouble — journal + flag file + optional push |
| `notify.sh` | the push channel, configured outside this repo |
| smartd self-tests | short daily 02:00, long Saturdays 03:00 |

## The problem this fixes

Debian's stock `/etc/smartd.conf` ends in `-m root`. There is no MTA on this
box, so **every SMART warning smartd would ever produce goes into a mailbox
that does not exist and nobody reads.** Monitoring that cannot reach a human is
indistinguishable from no monitoring, and you only find out which one you had
on the day a drive dies.

The installer comments out that `DEVICESCAN` and replaces it with one that
execs `mazak-smart-alert.sh`, which writes to three places in descending order
of reliability: the journal (always), a flag file that survives reboot and that
`netwatch` renders (always), and a push notification (if configured).

The hourly snapshot exists for the same reason in reverse: smartd only speaks
up when something is wrong, so silence proves nothing. If `smart.json` goes
stale, `netwatch` says so — the monitoring stopping is itself a failure worth
seeing.

## Configuring push (optional, and not in this repo)

**This repo is public.** A push topic or webhook URL is a credential — anyone
holding it can send you alerts, and with ntfy, read them. So it lives in
`/etc/mazak-health/notify.conf`, mode 600:

```bash
sudo install -d -m 0755 /etc/mazak-health
sudo tee /etc/mazak-health/notify.conf >/dev/null <<'CONF'
NTFY_URL="https://ntfy.sh/pick-something-long-and-unguessable"
CONF
sudo chmod 600 /etc/mazak-health/notify.conf
sudo /usr/local/bin/mazak-notify.sh "test" "hello from the LinuxCNC box"
```

With nothing configured, `notify.sh` logs that it had nowhere to send and exits
0 — a missing push channel must never be the reason an alert script fails.

Note that a public `ntfy.sh` topic is readable by anyone who guesses the name.
For anything beyond "a disk is unhappy" that is worth thinking about; self-host
over the tailnet if it matters.

## Reading it

```bash
python3 -m json.tool < /var/lib/mazak-health/smart.json
netwatch | grep -A6 "this machine"     # per-drive line on the dashboard
journalctl -t mazak-smart-alert -n 20  # alerts that fired
systemctl list-timers 'mazak-*'
```

Verdicts are `OK` / `WATCH` / `FAIL`. `WATCH` means a critical counter is
non-zero but the drive still self-assesses as PASSED — currently true of
`/dev/sda`, which has 4 SATA CRC errors (a cable issue, see
`docs/ssd_firmware_plan.md`).

## Vendor quirks deliberately handled

Raw SMART values are not portable, and naive monitoring cries wolf:

- **Attribute 188 (`Command_Timeout`)** is informational here, not critical.
  Many controllers pack three counters into its raw field; this box's SanDisk
  reports 8261 with a normalized value of 100 and no failure flag.
- **Attributes 201/231/233 (life remaining)** are read from the *normalized*
  value. The SanDisk reports a raw `8589934610` (`0x200000012`) for 201, which
  is meaningless, against a sensible normalized 98.
- **`Unused_Reserve_NAND_Blk` reading 0** on the MX500 is a known reporting
  quirk of this firmware, not a failure. It is not in the critical set.

The rule: trust `when_failed` and normalized values for verdicts; trust raw
only for the counters that are unambiguous across vendors (5, 187, 197, 198, 199).
