#!/usr/bin/env bash
# mazak-status.sh — collect LinuxCNC retrofit state and push to GitHub.
# Runs read-only. Writes latest.json + a timestamped snapshot.
# Meant to be run by mazak-status.timer every 5 minutes.
#
# Config env (override in the systemd unit if needed):
#   STATUS_REPO_DIR   local checkout of the status repo
#   MESA_IP           Mesa 7i80HDT address (default 192.168.1.121)
#   DASH_PORT         serve_live.py port (default 8765)
#   CFG_DIR           retrofit config dir (default under home)
#   MESA_WATCHDOG     on|off — probe the Mesa at all (default on)
#   MESA_WATCHDOG_FLAG  flag file; if it exists the watchdog is off
#   MESA_DEVICES      mesaflash board names to try, in order
#                     (default "7i80hdt"; pin another if the board changes)
#
# The Mesa host is powered down deliberately at times. Turning the watchdog
# off records that as "not watched" (ping_ok: null) instead of emitting a hard
# fault every 5 minutes. Toggle at runtime with `mazak-watchdog on|off`.

set -u
LC_ALL=C
export LC_ALL

STATUS_REPO_DIR="${STATUS_REPO_DIR:-$HOME/mazak-vqc20-status}"
MESA_IP="${MESA_IP:-192.168.1.121}"
DASH_PORT="${DASH_PORT:-8765}"
CFG_DIR="${CFG_DIR:-$HOME/linuxcnc/configs/mazak-vqc20-linuxcnc-retrofit/linuxcnc}"
INI="${INI:-$CFG_DIR/mazak_vqc_20_40.ini}"
HAL="${HAL:-$CFG_DIR/mazak_vqc_20_40.hal}"
MESA_WATCHDOG="${MESA_WATCHDOG:-}"
MESA_DEVICES="${MESA_DEVICES:-7i80hdt}"
MESA_WATCHDOG_FLAG="${MESA_WATCHDOG_FLAG:-${XDG_CONFIG_HOME:-$HOME/.config}/mazak-status/watchdog-off}"

# --- helpers ---------------------------------------------------------------
# Parsing lives in lib/parse.sh so it can be unit tested without hardware.
# Look next to this script first (running from a checkout), then the installed
# location.
_here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for _lib in "${MAZAK_LIB_DIR:-}/parse.sh" "$_here/lib/parse.sh" /usr/local/lib/mazak-status/parse.sh; do
  [ -n "$_lib" ] && [ -f "$_lib" ] && . "$_lib" && _lib_ok=1 && break
done
if [ -z "${_lib_ok:-}" ]; then
  echo "$(date -Is) FATAL: cannot locate parse.sh" >&2
  exit 6
fi
command -v python3 >/dev/null 2>&1 || {
  echo "$(date -Is) FATAL: python3 not found; cannot encode JSON safely" >&2
  exit 6
}

j() { json_escape "${1:-}"; }

TS_ISO="$(date -Is)"
TS_UTC_PATH="$(date -u +%Y/%m/%d/%H%M)"
HOST="$(hostname)"

# --- kernel / RT -----------------------------------------------------------
KERN="$(uname -r 2>/dev/null || echo unknown)"
case "$KERN" in *rt*|*PREEMPT_RT*|*preempt_rt*) RT_OK=true;; *) RT_OK=false;; esac

# --- LinuxCNC process ------------------------------------------------------
LCNC_RUNNING=false
pgrep -x milltask    >/dev/null 2>&1 && LCNC_RUNNING=true
pgrep -x rtapi_app   >/dev/null 2>&1 && LCNC_RUNNING=true
pgrep -x linuxcncsvr >/dev/null 2>&1 && LCNC_RUNNING=true
LCNC_INI=""
if [ "$LCNC_RUNNING" = true ]; then
  for p in $(pgrep -f 'linuxcnc|milltask' 2>/dev/null); do
    args="$(tr '\0' ' ' </proc/$p/cmdline 2>/dev/null)"
    case "$args" in *.ini*) LCNC_INI="$args"; break;; esac
  done
fi
[ -f "$INI" ] && INI_OK=true || INI_OK=false
[ -f "$HAL" ] && HAL_OK=true || HAL_OK=false
HAL_BYTES=0; [ -f "$HAL" ] && HAL_BYTES="$(stat -c%s "$HAL" 2>/dev/null || echo 0)"

# --- Mesa NIC / network ----------------------------------------------------
MESA_IFACE="$(ip -o -4 route get "$MESA_IP" 2>/dev/null | awk '{for(i=1;i<=NF;i++) if($i=="dev"){print $(i+1); exit}}')"
MESA_IFACE_STATE=""
[ -n "$MESA_IFACE" ] && MESA_IFACE_STATE="$(cat "/sys/class/net/$MESA_IFACE/operstate" 2>/dev/null || echo unknown)"
MESA_IFACE_CARRIER=""
[ -n "$MESA_IFACE" ] && MESA_IFACE_CARRIER="$(cat "/sys/class/net/$MESA_IFACE/carrier" 2>/dev/null || echo unknown)"
MESA_IFACE_ADDR="$(ip -o -4 addr show "$MESA_IFACE" 2>/dev/null | awk '{print $4}' | head -1)"

# Is the Mesa being watched at all right now?
WATCHDOG="$(watchdog_state "$MESA_WATCHDOG" "$MESA_WATCHDOG_FLAG")"
case "$WATCHDOG" in on) WATCHDOG_JSON=true;; *) WATCHDOG_JSON=false;; esac

# Does the route to the Mesa actually leave via a NIC on the Mesa's subnet?
# When the wired NIC drops, the route falls through to WiFi and every
# iface_* field below describes the WiFi adapter instead. Recording this
# separates "Mesa card not answering" from "not on the Mesa network at all".
IFACE_ON_SUBNET="$(ip_in_cidr "$MESA_IP" "$MESA_IFACE_ADDR")"
case "$IFACE_ON_SUBNET" in
  true|false) IFACE_ON_SUBNET_JSON="$IFACE_ON_SUBNET" ;;
  *)          IFACE_ON_SUBNET_JSON=null ;;
esac

PING_OK_JSON=null; PING_LOSS=""; PING_AVG=""; PING_LOSS_PCT_JSON=null
READHMID=""; READHMID_STATUS=skipped; READHMID_DEVICE=""

if [ "$WATCHDOG" = on ]; then
  PING_RAW="$(ping -c3 -W1 -q "$MESA_IP" 2>&1 || true)"

  # Numeric comparison, not a substring match. The old test was
  # `grep -q '0% packet loss'`, which also matched "100%" and "10%".
  PING_LOSS_PCT="$(ping_loss_pct "$PING_RAW")"
  PING_OK_JSON="$(ping_ok "$PING_LOSS_PCT")"
  PING_AVG="$(ping_avg_ms "$PING_RAW")"
  [ -n "$PING_LOSS_PCT" ] && PING_LOSS_PCT_JSON="$PING_LOSS_PCT"
  [ -n "$PING_LOSS_PCT" ] && PING_LOSS="${PING_LOSS_PCT}% packet loss"

  # mesaflash needs --device for Ethernet boards. Omitting it is why every
  # snapshot so far recorded "No action requested. Please specify at least
  # --device or --info." — and the old fallback was guarded on the output
  # being EMPTY, so it never fired against that non-empty error string.
  #
  # Try each candidate board name and stop at the first conclusive answer.
  # Retry only on our own errors (usage/baddevice/empty); an unreachable
  # board is a real answer and trying more names just burns 4s timeouts.
  if command -v mesaflash >/dev/null 2>&1; then
    READHMID_STATUS=unknown
    for _dev in $MESA_DEVICES; do
      _out="$(timeout 4 mesaflash --device "$_dev" --addr "$MESA_IP" --readhmid 2>&1 | head -30 || true)"
      _st="$(mesaflash_status "$_out")"
      READHMID="$_out"; READHMID_STATUS="$_st"; READHMID_DEVICE="$_dev"
      case "$_st" in ok|unreachable) break ;; esac
    done
  else
    READHMID_STATUS=not_installed
  fi
fi

NMCLI_DEV="$(nmcli -t -f DEVICE,TYPE,STATE,CONNECTION device status 2>/dev/null || true)"
NMCLI_MESA="$(nmcli -f connection.autoconnect,connection.interface-name,ipv4.method,ipv4.addresses,ipv4.may-fail,802-3-ethernet.wake-on-lan connection show 'Mesa NIC' 2>/dev/null || true)"

# --- dashboard / halcmd ----------------------------------------------------
DASH_PID="$(pgrep -f serve_live.py 2>/dev/null | head -1)"
DASH_HTTP=""; DASH_HEALTH=""; DASH_IO_LEN=""
if [ -n "$DASH_PID" ]; then
  DASH_HTTP="$(curl -sS -m 2 -o /tmp/_ms_health -w '%{http_code}' "http://127.0.0.1:${DASH_PORT}/api/health" 2>/dev/null || true)"
  DASH_HEALTH="$(head -c 500 /tmp/_ms_health 2>/dev/null || true)"
  DASH_IO_LEN="$(curl -sS -m 4 "http://127.0.0.1:${DASH_PORT}/api/io" 2>/dev/null | wc -c)"
fi

HAL_HM2=""; HAL_ESTOP=""; HAL_SSER=""
if command -v halcmd >/dev/null 2>&1; then
  HAL_HM2="$(halcmd_rows "$(timeout 3 halcmd show comp 2>/dev/null | grep -E 'hm2_|hostmot2' || true)" | head -20)"
  HAL_ESTOP="$(timeout 3 halcmd getp iocontrol.0.emc-enable-in 2>/dev/null || true)"
  # halcmd_rows drops the section title and column header. Without it this
  # recorded a bare table header in all 2392 snapshots — a field that looked
  # fully populated while holding no pins.
  HAL_SSER="$(halcmd_rows "$(timeout 3 halcmd show pin 'hm2_*.7i84*' 2>/dev/null || true)" | head -20)"
fi

# --- services / listeners --------------------------------------------------
SVC_TAILSCALED="$(systemctl is-active tailscaled 2>/dev/null || true)"
SVC_NM="$(systemctl is-active NetworkManager 2>/dev/null || true)"
LISTENERS="$(ss -ltnp 2>/dev/null | awk 'NR==1 || /:8765|:8000|python|linuxcnc/' | head -20 || true)"

# --- logs ------------------------------------------------------------------
RELEVANT='linuxcnc|hostmot|hm2|mesa|rtapi|networkmanager|enp0s31f6|halcmd'

# `journalctl -n 100 | grep` took the last 100 entries SYSTEM-WIDE and only
# then filtered. On this box those 100 lines are gnome-keyring chatter, so
# the grep matched nothing: 0 of 2392 snapshots contained a single relevant
# line while the field looked populated. Select the window first, filter
# second, and let tail do the truncating.
JOURNAL="$(timeout 5 journalctl --since '-24h' --no-pager -p err..warning 2>/dev/null \
  | grep -Ei "$RELEVANT" \
  | tail -20 || true)"

# Kernel ring buffer -> logs.kernel_hm2 (was logs.dmesg_hm2 through schema 3).
# Debian sets kernel.dmesg_restrict=1, so `dmesg` fails for a non-root user;
# 2>/dev/null then turned "Operation not permitted" into an empty field
# indistinguishable from "nothing matched" — empty in all 2392 snapshots.
# `journalctl -k` reads the same ring buffer through the journal, which this
# user demonstrably can read, and needs no root, no sysctl change and no
# CAP_SYSLOG. The field was renamed in schema 4 to stop claiming a source it
# no longer uses.
#
# Unlike the mesaflash fallback this one is safe to guard on emptiness: both
# commands send errors to /dev/null, so the variable only ever holds real
# output. There is no error string that could be mistaken for data.
KERNEL_PAT='hm2|mesa|hostmot|preempt|rtapi|enp0s31f6|link'
KERNEL_LOG=""
if command -v journalctl >/dev/null 2>&1; then
  KERNEL_LOG="$(timeout 5 journalctl -k -n 2000 --no-pager 2>/dev/null \
    | grep -Ei "$KERNEL_PAT" | tail -10 || true)"
fi
if [ -z "$KERNEL_LOG" ]; then
  KERNEL_LOG="$(dmesg -T 2>/dev/null | grep -Ei "$KERNEL_PAT" | tail -10 || true)"
fi
PRINT_LOG=""
for f in "$HOME/linuxcnc_print.txt" "$HOME/linuxcnc_debug.txt" /var/log/linuxcnc/print.log; do
  [ -f "$f" ] && PRINT_LOG="$(tail -30 "$f" 2>/dev/null)" && break
done

# --- disk / uptime ---------------------------------------------------------
UPTIME="$(uptime -p 2>/dev/null || true)"
DISK_ROOT="$(df -h / 2>/dev/null | awk 'NR==2 {print $3"/"$2" ("$5")"}')"

# --- assemble JSON ---------------------------------------------------------
SNAP_JSON="$(cat <<EOF
{
  "schema": 4,
  "ts": $(j "$TS_ISO"),
  "host": $(j "$HOST"),
  "uptime": $(j "$UPTIME"),
  "disk_root": $(j "$DISK_ROOT"),
  "kernel": { "release": $(j "$KERN"), "is_rt": $RT_OK },
  "linuxcnc": {
    "running": $LCNC_RUNNING,
    "ini_arg": $(j "$LCNC_INI"),
    "ini_present": $INI_OK,
    "hal_present": $HAL_OK,
    "hal_bytes": $(json_number "$HAL_BYTES" 0)
  },
  "mesa": {
    "ip": $(j "$MESA_IP"),
    "watchdog_enabled": $WATCHDOG_JSON,
    "ping_ok": $PING_OK_JSON,
    "ping_loss": $(j "$PING_LOSS"),
    "ping_loss_pct": $PING_LOSS_PCT_JSON,
    "ping_avg_ms": $(j "$PING_AVG"),
    "iface": $(j "$MESA_IFACE"),
    "iface_state": $(j "$MESA_IFACE_STATE"),
    "iface_carrier": $(j "$MESA_IFACE_CARRIER"),
    "iface_addr": $(j "$MESA_IFACE_ADDR"),
    "iface_on_subnet": $IFACE_ON_SUBNET_JSON,
    "readhmid_head": $(j "$READHMID"),
    "readhmid_status": $(j "$READHMID_STATUS"),
    "readhmid_device": $(j "$READHMID_DEVICE"),
    "nmcli_devices": $(j "$NMCLI_DEV"),
    "nmcli_mesa_profile": $(j "$NMCLI_MESA")
  },
  "dashboard": {
    "port": $(json_number "$DASH_PORT" 0),
    "pid": $(j "$DASH_PID"),
    "http_code": $(j "$DASH_HTTP"),
    "health_body": $(j "$DASH_HEALTH"),
    "io_bytes": $(json_number "$(printf '%s' "$DASH_IO_LEN" | tr -d '[:space:]')" 0)
  },
  "hal": {
    "hm2_components": $(j "$HAL_HM2"),
    "estop_pin": $(j "$HAL_ESTOP"),
    "sserial_pins": $(j "$HAL_SSER")
  },
  "services": {
    "tailscaled": $(j "$SVC_TAILSCALED"),
    "NetworkManager": $(j "$SVC_NM"),
    "listeners": $(j "$LISTENERS")
  },
  "logs": {
    "journal_errors": $(j "$JOURNAL"),
    "kernel_hm2": $(j "$KERNEL_LOG"),
    "print_log_tail": $(j "$PRINT_LOG")
  }
}
EOF
)"

# --- validate JSON before writing (fail loud if malformed) -----------------
if ! echo "$SNAP_JSON" | python3 -c 'import json,sys; json.load(sys.stdin)' 2>/dev/null; then
  echo "$(date -Is) FATAL: emitted snapshot is not valid JSON" >&2
  exit 2
fi

# --- write snapshots -------------------------------------------------------
cd "$STATUS_REPO_DIR" || { echo "$(date -Is) cannot cd to $STATUS_REPO_DIR" >&2; exit 3; }
# NB: only `log` here. `snapshots/$TS_UTC_PATH` is the path of the snapshot
# FILE minus its .json suffix — mkdir'ing it created a stray empty directory
# beside every snapshot (snapshots/2026/08/14/1730/ next to 1730.json), ~288
# a day on the host. Git never showed it, because git cannot track empty
# directories. The day directory is created from $SNAP_FILE below.
mkdir -p log

# Pull latest first so we don't fight if we ever push from two places
git pull --rebase --quiet origin main 2>/dev/null || true

SNAP_FILE="snapshots/${TS_UTC_PATH}.json"
mkdir -p "$(dirname "$SNAP_FILE")"
printf '%s\n' "$SNAP_JSON" > "$SNAP_FILE"
printf '%s\n' "$SNAP_JSON" > latest.json

# --- commit + push ---------------------------------------------------------
# Stage only what this collector and the retention pass produce. A bare
# `git add -A` staged the whole working tree, so ANY unrelated edit sitting in
# this checkout — a half-finished script change, a stray file, a dropped key —
# was committed under a "snap ..." message and pushed within five minutes.
# (It swept up a tests/ edit on 2026-08-14; see 35198a8 and 449e662.)
#
# -A still stages deletions, which retention depends on: it writes archives and
# removes loose snapshots under snapshots/ and does no git operations of its
# own (see the header note in mazak-retention.py).
git add -A -- latest.json snapshots log || {
  echo "$(date -Is) FATAL: git add failed; nothing staged" >&2
  exit 7
}
if git diff --cached --quiet; then
  # nothing changed; skip commit but still exit 0
  exit 0
fi

case "$WATCHDOG" in
  on) MSG_PING="$PING_OK_JSON" ;;
  *)  MSG_PING="off" ;;
esac
MSG="snap $TS_ISO — ping=$MSG_PING lcnc=$LCNC_RUNNING dash=$DASH_HTTP"
git commit -q -m "$MSG" 2>/dev/null || { echo "$(date -Is) commit failed" >&2; exit 4; }

# push with a short timeout so a wedged network never hangs the timer
timeout 30 git push --quiet origin main || {
  echo "$(date -Is) push failed; keeping local commit for next run" >&2
  exit 5
}
exit 0
