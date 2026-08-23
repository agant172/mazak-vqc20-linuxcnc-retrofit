#!/usr/bin/env bash
# notify.sh — send one short alert out of this machine.
#
# Deliberately pluggable. The channel is configured OUTSIDE the repo, in
# /etc/mazak-health/notify.conf, because this repo is PUBLIC and a push topic or
# webhook URL is a credential — anyone holding it can send you alerts, and in
# ntfy's case read them.
#
#   sudo install -d -m 0755 /etc/mazak-health
#   sudo tee /etc/mazak-health/notify.conf >/dev/null <<'CONF'
#   # pick ONE
#   NTFY_URL="https://ntfy.sh/some-long-unguessable-topic-name"
#   # WEBHOOK_URL="https://hooks.example.com/..."
#   CONF
#   sudo chmod 600 /etc/mazak-health/notify.conf
#
# With nothing configured it logs that it had nowhere to send and exits 0 —
# a missing push channel must never be the reason an alert script fails.
#
# Usage: notify.sh "<title>" "<body>" [priority]

set -uo pipefail

CONF="${MAZAK_NOTIFY_CONF:-/etc/mazak-health/notify.conf}"
title="${1:-Mazak alert}"
body="${2:-}"
priority="${3:-default}"

log() { echo "$(date -Is) notify: $*"; }

# shellcheck source=/dev/null
[ -r "$CONF" ] && . "$CONF"

sent=0

if [ -n "${NTFY_URL:-}" ]; then
	if curl -fsS --max-time 20 \
		-H "Title: $title" \
		-H "Priority: $priority" \
		-H "Tags: floppy_disk,warning" \
		-d "$body" \
		"$NTFY_URL" >/dev/null; then
		log "sent via ntfy"
		sent=1
	else
		log "FAILED to send via ntfy"
	fi
fi

if [ -n "${WEBHOOK_URL:-}" ]; then
	payload=$(printf '{"text":%s}' "$(printf '%s\n\n%s' "$title" "$body" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')")
	if curl -fsS --max-time 20 -H 'Content-Type: application/json' \
		-d "$payload" "$WEBHOOK_URL" >/dev/null; then
		log "sent via webhook"
		sent=1
	else
		log "FAILED to send via webhook"
	fi
fi

if [ "$sent" -eq 0 ]; then
	log "no channel configured in $CONF — alert stays in the journal and the flag file only"
fi

exit 0
