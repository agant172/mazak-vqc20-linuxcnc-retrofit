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

## Failure notifications

A backup nobody is told about failing is a backup you find out about on the day
you need it. Two mechanisms, because "failure" has two shapes.

**A job ran and failed** — `OnFailure=mazak-notify-failure@%n.service` on every
backup and health unit. Wired at the systemd level rather than into each
script's exit paths on purpose: systemd's notion of failure is strictly broader.
It also catches a timeout, a kill, an OOM, and a unit that never started — the
cases a script cannot report, because it is no longer running.

**A job stopped running at all** — `mazak-backup-watch.timer`, daily 09:00.
Nothing fails, nothing logs, and the backup silently ages out. A masked unit, a
disabled timer, a laptop asleep every night for a week all look identical to
"everything is fine". For each unit it asks systemd two questions: did the last
run succeed, and how long ago was it.

| unit | stale after |
|---|---|
| `mazak-gcode-backup` | 6 h |
| `mazak-smart-collect` | 6 h |
| `mazak-gcode-backup-remote` | 72 h |
| `mazak-photos-backup` | 72 h |
| `mazak-video-projects-backup` | 72 h |

Thresholds are generous deliberately: the daily jobs that reach another machine
legitimately miss a night when a Mac is asleep. Three days means something is
actually wrong rather than someone shut a lid. Notifications dedupe to one per
unit per 24 h, so a Mac that stays asleep produces one message, not a nightly
nag.

Drilled 2026-08-23: a deliberately failing unit produced a phone notification
within seconds, carrying the unit name, exit status and the last log lines.

### What this caught immediately

On the first real run the watcher flagged `mazak-video-projects-backup` as
failing, and the reason was a genuine bug: the unit had
`Environment=VOLUME=/Volumes/USB Video Drive` **unquoted**. systemd splits an
unquoted `Environment=` on whitespace, so the job received
`VOLUME=/Volumes/USB` and failed with "not mounted" every run while the drive
was plugged in the whole time. It is the same trap already documented on
`GIT_SSH_COMMAND` in `mazak-repo-pull.service`. **Quote any `Environment=` value
containing a space.**

## Network path history (PingPlotter-style)

`mazak-netpath-log.timer`, every 5 minutes, runs `mtr` against four targets and
appends per-hop results to `/var/lib/mazak-health/netpath.jsonl`, then
regenerates a standalone HTML report at `/var/lib/mazak-health/netpath.html`.

| target | why |
|---|---|
| `drive.google.com` | the path the 585 GB cloud backup uses |
| `1.1.1.1` | neutral internet reference |
| `100.82.222.120` | the workshop iMac over Tailscale |
| `10.10.10.121` | the Mesa card — a **control**, and the one that must stay clean |

The Mesa row is the useful one for this project: it rides a dedicated NIC and
should be unaffected by anything happening on the house network. On 2026-08-23,
with a 28 MiB/s upload saturating the WAN link, Mesa measured **0.158 ms average
with 0.003 ms jitter** while every internet target was in the hundreds. If that
row ever moves, something has gone wrong with the control link itself.

### Why history rather than a one-shot traceroute

A single run cannot tell you whether 400 ms is normal, and the interesting
failures — a flapping ISP hop, jitter that only appears under load — are
invisible without a baseline.

Worked example, 2026-08-23. Heavy jitter to Google, and `mtr` put it at **hop 1,
the house's own router**, with zero packet loss anywhere:

| hop 1 (Orbi RBR760) | upload running | upload paused |
|---|---|---|
| average | 113.3 ms | 3.5 ms |
| worst | 691.9 ms | 7.5 ms |
| **jitter (StDev)** | **141.2 ms** | **1.3 ms** |

Zero loss plus jitter starting at hop 1 is **bufferbloat**, not a fault: the
upload fills the router's transmit queue and everything else waits behind it.
Jitter that first appears at hop 1 is yours; jitter that first appears at hop 2+
is the ISP's. That distinction is the whole reason the per-hop table highlights
where jitter *jumps* rather than where it is largest.

### Reading it

```bash
mazak-netpath-report.py --hours 24        # regenerate on demand
xdg-open /var/lib/mazak-health/netpath.html
```

The shaded band spans best–worst per sample and the line is the mean: **a wide
band under a flat mean is queueing delay, not a slow link.**

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
