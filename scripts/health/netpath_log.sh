#!/usr/bin/env bash
# netpath_log.sh — PingPlotter-style per-hop latency history.
#
# Runs mtr against a few targets and appends one JSON record per target per run
# to a JSONL file. Keeping the raw per-hop numbers over time is the point: a
# single traceroute tells you nothing about whether 400 ms is normal, and the
# interesting failures (a flapping ISP hop, jitter that only appears under load)
# are invisible in a one-shot run.
#
# WHY THIS EXISTS: on 2026-08-23 the LinuxCNC box showed heavy jitter to Google.
# mtr located it at hop 1 — the house's own Orbi — with zero packet loss, which
# is bufferbloat, not a network fault. Pausing the 28 MiB/s Drive upload dropped
# hop-1 jitter from 141 ms StDev to 1.3 ms. Without history that diagnosis is
# guesswork.
#
# Read-only. Sends ICMP and writes one file. Nice/idle so it cannot perturb the
# realtime threads on this control PC.
#
# Source of truth:  scripts/health/netpath_log.sh (this repo)
# Installed to:     /usr/local/bin/mazak-netpath-log.sh
# Data:             /var/lib/mazak-health/netpath.jsonl
# Report:           mazak-netpath-report.py  ->  standalone HTML
# Log:              journalctl -u mazak-netpath-log

set -uo pipefail

STATE_DIR="${MAZAK_HEALTH_DIR:-/var/lib/mazak-health}"
OUT="$STATE_DIR/netpath.jsonl"
CYCLES="${CYCLES:-10}"
RETAIN_DAYS="${RETAIN_DAYS:-30}"
# Space-separated. Defaults cover: the internet path that matters (Drive), a
# neutral reference (Cloudflare), the workshop over the tailnet, and the Mesa
# card — which should never leave the local link and is a useful control.
TARGETS="${TARGETS:-drive.google.com 1.1.1.1 100.82.222.120 10.10.10.121}"

log() { echo "$(date -Is) $*"; }
mkdir -p "$STATE_DIR"

command -v mtr >/dev/null || { log "FAIL mtr not installed"; exit 3; }

for t in $TARGETS; do
	# --json gives per-hop Loss%/Avg/Best/Wrst/StDev without scraping columns.
	if ! raw="$(mtr --json --report-cycles "$CYCLES" --interval 1 --no-dns "$t" 2>/dev/null)"; then
		log "WARN mtr failed for $t"
		continue
	fi
	printf '%s' "$raw" | python3 -c '
import json, sys, time
try:
    d = json.load(sys.stdin)
except Exception:
    sys.exit(0)
r = d.get("report", {})
hubs = r.get("hubs", [])
if not hubs:
    sys.exit(0)
last = hubs[-1]
rec = {
    "at": int(time.time()),
    "target": sys.argv[1],
    "hops": len(hubs),
    # end-to-end summary, the numbers you would glance at
    "loss": last.get("Loss%"), "avg": last.get("Avg"),
    "best": last.get("Best"), "worst": last.get("Wrst"), "stdev": last.get("StDev"),
    # full per-hop detail, so a bad hop can be located after the fact
    "hop": [
        {"n": h.get("count"), "host": h.get("host"), "loss": h.get("Loss%"),
         "avg": h.get("Avg"), "best": h.get("Best"), "worst": h.get("Wrst"),
         "stdev": h.get("StDev")}
        for h in hubs
    ],
}
print(json.dumps(rec))
' "$t" >> "$OUT"
done

# Bound the history.
if [ -f "$OUT" ]; then
	cutoff=$(( $(date +%s) - RETAIN_DAYS * 86400 ))
	python3 - "$OUT" "$cutoff" <<'PY'
import sys, json, os
path, cutoff = sys.argv[1], int(sys.argv[2])
keep = []
with open(path) as fh:
    for line in fh:
        try:
            if json.loads(line).get("at", 0) >= cutoff:
                keep.append(line)
        except Exception:
            pass
tmp = path + ".tmp"
with open(tmp, "w") as fh:
    fh.writelines(keep)
os.replace(tmp, path)
PY
	chmod 0644 "$OUT"
fi

n="$(wc -l < "$OUT" 2>/dev/null | tr -d ' ')"
log "OK    sampled $(echo $TARGETS | wc -w) targets, $n records retained"
