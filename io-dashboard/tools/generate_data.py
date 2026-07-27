#!/usr/bin/env python3
"""Generate data.js for the Mazak VQC 20/40 I/O dashboard.

Reads the retrofit repo (default: the parent of io-dashboard/, read-only) and
emits ../data.js containing window.MAZAK_DATA.

Usage:
    python3 tools/generate_data.py [--source ..] [--out data.js]

The repo is never modified.
"""

import argparse
import csv
import datetime
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import enrichment as E  # noqa: E402

HAL_FILES = [
    "linuxcnc/mazak_vqc_20_40.hal",
    "linuxcnc/motion_7i97t.hal",
    "linuxcnc/field_7i84u.hal",
    "linuxcnc/postgui.hal",
    "linuxcnc/pendant_whb04b.hal",
]
INI_FILE = "linuxcnc/mazak_vqc_20_40.ini"
AUTHORITY = "mesa/current_pin_authority.csv"
STALE_MAP = "mesa/signal_map.csv"

NET_RE = re.compile(r"^\s*(#\s*)?net\s+(\S+)\s*(.*)$")
SETP_RE = re.compile(r"^\s*(#\s*)?setp\s+(\S+)\s+(\S+)")
SETS_RE = re.compile(r"^\s*(#\s*)?sets\s+(\S+)\s+(\S+)")
DESIG_RE = re.compile(r"\b(PRS|PHS|SOL|LS|RLY|RS|PS|CB|DS|TB|OT[+-]?)[- ]?([0-9A-Z]+)\b")


def read_lines(path):
    with open(path, "r", encoding="utf-8", errors="replace") as fh:
        return fh.read().split("\n")


def parse_hal(root):
    """Return {net_name: [ref, ...]} and a flat index of setp/sets statements."""
    nets = {}
    setps = []
    for rel in HAL_FILES:
        path = os.path.join(root, rel)
        if not os.path.exists(path):
            continue
        for i, raw in enumerate(read_lines(path), start=1):
            line = raw.rstrip()
            m = NET_RE.match(line)
            if m:
                commented = bool(m.group(1))
                name = m.group(2)
                rest = m.group(3).strip()
                # strip trailing comment
                rest = rest.split("#", 1)[0].strip()
                producers, consumers, bidir = [], [], []
                if "<=>" in rest:
                    parts = [p.strip() for p in rest.split("<=>")]
                    bidir = [p for p in parts if p]
                else:
                    tokens = rest.replace("<=", " \x01 ").replace("=>", " \x02 ").split()
                    mode = None
                    pending = []
                    for tok in tokens:
                        if tok == "\x01":
                            mode = "prod"
                        elif tok == "\x02":
                            mode = "cons"
                        elif mode == "prod":
                            producers.append(tok)
                            mode = None
                        elif mode == "cons":
                            consumers.append(tok)
                            mode = None
                        else:
                            pending.append(tok)
                    # "net foo A => B" : A is producer, B consumer
                    if pending and consumers and not producers:
                        producers.extend(pending)
                    elif pending and producers and not consumers:
                        consumers.extend(pending)
                    elif pending and not producers and not consumers:
                        producers.extend(pending[:1])
                        consumers.extend(pending[1:])
                nets.setdefault(name, []).append({
                    "file": rel,
                    "line": i,
                    "text": line.strip(),
                    "commented": commented,
                    "producers": producers,
                    "consumers": consumers,
                    "bidir": bidir,
                })
                continue
            m = SETP_RE.match(line) or SETS_RE.match(line)
            if m:
                setps.append({
                    "file": rel, "line": i, "text": line.strip(),
                    "commented": bool(m.group(1)), "target": m.group(2), "value": m.group(3),
                })
    return nets, setps


def csv_rows_with_lines(path):
    with open(path, newline="", encoding="utf-8") as fh:
        rdr = csv.DictReader(fh)
        out = []
        for i, row in enumerate(rdr, start=2):  # header is line 1
            row = {k: (v or "").strip() for k, v in row.items() if k}
            row["_line"] = i
            out.append(row)
        return out


def designations(text):
    seen, out = set(), []
    for m in DESIG_RE.finditer(text or ""):
        tag = "%s-%s" % (m.group(1), m.group(2))
        if m.group(1).startswith("OT"):
            tag = m.group(0)
        if tag not in seen:
            seen.add(tag)
            out.append(tag)
    return out


def mesa_pins_for(net, nets):
    pins = []
    for ref in nets.get(net, []):
        for p in ref["producers"] + ref["consumers"] + ref["bidir"]:
            if p.startswith("hm2_") and p not in pins:
                pins.append(p)
    return pins


def linuxcnc_endpoints(net, nets):
    prod, cons = [], []
    for ref in nets.get(net, []):
        for p in ref["producers"]:
            if not p.startswith("hm2_") and p not in prod:
                prod.append(p)
        for p in ref["consumers"]:
            if not p.startswith("hm2_") and p not in cons:
                cons.append(p)
        for p in ref["bidir"]:
            if not p.startswith("hm2_") and p not in prod:
                prod.append(p)
    return prod, cons


def expected_for(sig_id, direction, status):
    if sig_id in E.EXPECTED:
        v, label, basis, kind = E.EXPECTED[sig_id]
        return {"value": v, "label": label, "basis": basis, "kind": kind}
    if status == "SPARE":
        v, label, basis, kind = E.SPARE_EXPECTED
        return {"value": v, "label": label, "basis": basis, "kind": kind}
    if direction in E.GENERIC_EXPECTED:
        v, label, basis, kind = E.GENERIC_EXPECTED[direction]
        return {"value": v, "label": label, "basis": basis, "kind": kind}
    v, label, basis, kind = E.UNKNOWN_EXPECTED
    return {"value": v, "label": label, "basis": basis, "kind": kind}


def build(root):
    nets, setps = parse_hal(root)
    auth = csv_rows_with_lines(os.path.join(root, AUTHORITY))
    stale = csv_rows_with_lines(os.path.join(root, STALE_MAP))

    stale_by_id = {}
    for r in stale:
        if r.get("Machine Signal Name"):
            stale_by_id.setdefault(r["Machine Signal Name"], r)

    conflict_by_signal = {}
    for c in E.CONFLICTS:
        for s in c["signals"]:
            conflict_by_signal.setdefault(s, []).append(c["id"])

    signals = []
    for r in auth:
        sid = r["signal_id"]
        net = r["hal_net"]
        has_net = net and net.lower() != "none"
        direction = r["direction"]
        status = r["authority_status"]

        hal_refs = nets.get(net, []) if has_net else []
        mesa_pins = mesa_pins_for(net, nets) if has_net else []
        prod, cons = linuxcnc_endpoints(net, nets) if has_net else ([], [])

        # setp evidence touching the mesa pins for this signal
        setp_refs = []
        pin_bases = set()
        for p in mesa_pins:
            pin_bases.add(p.rsplit(".", 1)[0])
        # also catch gpio index mentioned in the channel column
        for m in re.finditer(r"gpio\.(\d+)", r["pin_channel"]):
            pin_bases.add("hm2_7i97.0.gpio.%s" % m.group(1))
        for s in setps:
            base = s["target"].rsplit(".", 1)[0]
            if base in pin_bases or (has_net and s["target"] == net):
                setp_refs.append(s)

        loc, machine_sub, loc_note = E.LOCATION.get(
            sid, ("Unknown \u2014 trace in cabinet", r["subsystem"], ""))

        expected = expected_for(sid, direction, status)

        stale_row = stale_by_id.get(sid)
        stale_note = None
        if stale_row:
            stale_note = {
                "line": stale_row["_line"],
                "card": stale_row.get("Mesa Card", ""),
                "conn": stale_row.get("Mesa Conn", ""),
                "channel": stale_row.get("Mesa Bit / Channel", ""),
                "net": stale_row.get("LinuxCNC HAL Net", ""),
                "status": stale_row.get("Status", ""),
                "differs": (
                    stale_row.get("Mesa Card", "") != r["mesa_card"]
                    or stale_row.get("Mesa Bit / Channel", "").upper().replace(" ", "")
                    not in r["pin_channel"].upper().replace(" ", "")
                    or stale_row.get("LinuxCNC HAL Net", "") != net
                ),
            }

        sources = [{
            "file": "mesa/current_pin_authority.csv",
            "lines": str(r["_line"]),
            "note": "Current wiring authority row",
        }]
        for ref in hal_refs:
            sources.append({
                "file": ref["file"],
                "lines": str(ref["line"]),
                "note": ("commented out \u2014 " if ref["commented"] else "") + ref["text"],
            })
        for s in setp_refs:
            sources.append({
                "file": s["file"], "lines": str(s["line"]),
                "note": ("commented out \u2014 " if s["commented"] else "") + s["text"],
            })
        if stale_note:
            sources.append({
                "file": "mesa/signal_map.csv",
                "lines": str(stale_note["line"]),
                "note": "STALE companion row: %s %s %s \u2192 %s (%s)" % (
                    stale_note["card"], stale_note["conn"], stale_note["channel"],
                    stale_note["net"] or "none", stale_note["status"]),
            })
        if r["primary_source"]:
            sources.append({
                "file": r["primary_source"], "lines": "",
                "note": "primary_source column in the authority table",
            })

        active_nets = [x for x in hal_refs if not x["commented"]]
        commented_nets = [x for x in hal_refs if x["commented"]]

        hal_state = "absent"
        if active_nets:
            hal_state = "active"
        elif commented_nets:
            hal_state = "commented"

        signals.append({
            "id": sid,
            "name": sid.replace("_", " ").title(),
            "board": r["mesa_card"],
            "connector": r["connector"],
            "channel": r["pin_channel"],
            "hal_net": net if has_net else "",
            "direction": direction,
            "direction_label": E.DIRECTION_LABEL.get(direction, direction),
            "subsystem": r["subsystem"],
            "machine_subsystem": machine_sub,
            "status": status,
            "field_point": r["field_point_or_load"],
            "designations": designations(r["field_point_or_load"] + " " + loc_note),
            "primary_source": r["primary_source"],
            "cleanup_notes": r["cleanup_notes"],
            "location": loc,
            "location_note": loc_note,
            "expected": expected,
            "hal_state": hal_state,
            "mesa_pins": mesa_pins,
            "producers": prod,
            "consumers": cons,
            "hal_refs": hal_refs,
            "setp_refs": setp_refs,
            "stale_row": stale_note,
            "sources": sources,
            "conflicts": conflict_by_signal.get(sid, []),
            "authority_line": r["_line"],
        })

    # HAL nets that exist in the config but have NO authority row at all.
    known = {s["hal_net"] for s in signals if s["hal_net"]}
    internal = re.compile(
        r"^(x|y|z)-(pos-cmd|pos-fb|vel-fb|pos-rawcounts|index-enable|traj-vel)$|"
        r"^estop-(ok|reset)$|^tool-(prepare|change)-loopback$|^spindle-(pos-fb|vel-fb|revs|index-enable)$|"
        r"^spindle-vel-(cmd|fb)-rpm$|^spindle-pid-out$")
    orphans = []
    for net, refs in sorted(nets.items()):
        if net in known or internal.match(net):
            continue
        mesa = [p for r in refs for p in (r["producers"] + r["consumers"]) if p.startswith("hm2_")]
        if not mesa:
            continue
        mesa = sorted(set(mesa))
        active = any(not r["commented"] for r in refs)
        orphans.append({
            "net": net,
            "mesa_pins": mesa,
            "refs": [{"file": r["file"], "line": r["line"], "commented": r["commented"],
                      "text": r["text"]} for r in refs],
            "active": active,
        })

        # Surface these as first-class rows so a net search always finds them.
        pin = mesa[0]
        if ".7i84." in pin:
            board = "7i84U"
            chan = pin.rsplit(".", 1)[-1]
            conn = "TB1" if chan.startswith("input") else "TB2"
            channel = chan.upper().replace("INPUT-", "IN").replace("OUTPUT-", "OUT")
            channel = re.sub(r"^(IN|OUT)0(\d)$", r"\1\2", channel)
        else:
            board = "7i97T"
            conn = "unconfirmed"
            channel = pin.split("hm2_7i97.0.", 1)[-1]
        is_in = "input" in pin or pin.endswith(".in")
        direction = "IN" if is_in else "OUT"
        prod2, cons2 = linuxcnc_endpoints(net, nets)
        srcs = [{"file": r["file"], "lines": str(r["line"]),
                 "note": ("commented out \u2014 " if r["commented"] else "") + r["text"]}
                for r in refs]
        st = stale_by_id.get(next((k for k, v in stale_by_id.items()
                                   if v.get("LinuxCNC HAL Net") == net), ""), None)
        if st:
            srcs.append({"file": "mesa/signal_map.csv", "lines": str(st["_line"]),
                         "note": "STALE source of this net: %s %s %s (%s)" % (
                             st.get("Mesa Card", ""), st.get("Mesa Conn", ""),
                             st.get("Mesa Bit / Channel", ""), st.get("Status", ""))})
        signals.append({
            "id": "NET_" + net.upper().replace("-", "_"),
            "name": net,
            "board": board,
            "connector": conn,
            "channel": channel,
            "hal_net": net,
            "direction": direction,
            "direction_label": E.DIRECTION_LABEL.get(direction, direction),
            "subsystem": "Unmapped",
            "machine_subsystem": "Unmapped",
            "status": "CONFIG_ONLY",
            "field_point": (st.get("Function", "") if st else "") or "Not in the wiring authority",
            "designations": designations(st.get("Mazak Label / Drawing Ref", "") if st else ""),
            "primary_source": "mesa/signal_map.csv (stale)" if st else "HAL config only",
            "cleanup_notes": "No row in current_pin_authority.csv. " + (
                "Active in HAL \u2014 remove or add an authority row before loading against field wiring."
                if active else "Commented out in HAL."),
            "location": "Unknown \u2014 no authority row, trace in cabinet",
            "location_note": "Derived from the stale signal_map.csv layout." if st else "",
            "expected": {"value": "Unknown", "label": "Unknown \u2014 measure/verify",
                         "basis": "No authority row and no normal-state evidence.",
                         "kind": "unknown"},
            "hal_state": "active" if active else "commented",
            "mesa_pins": mesa,
            "producers": prod2,
            "consumers": cons2,
            "hal_refs": refs,
            "setp_refs": [],
            "stale_row": None,
            "sources": srcs,
            "conflicts": ["C1" if is_in else "C2", "C8"],
            "authority_line": None,
        })

    # Authority nets that never appear in HAL
    missing = [s["id"] for s in signals if s["hal_net"] and s["hal_state"] == "absent"]

    ini_lines = read_lines(os.path.join(root, INI_FILE))
    halfiles = [l.split("=", 1)[1].strip() for l in ini_lines
                if l.strip().startswith("HALFILE")]

    meta = {
        "machine": "Mazak VQC-20/40",
        "serial": "060231",
        "architecture": "LinuxCNC + Mesa 7i97T + Mesa 7i49 resolver interface + Mesa 7i84U field I/O",
        "generated": datetime.datetime.now(datetime.timezone.utc)
                             .strftime("%Y-%m-%d %H:%M UTC"),
        "source_repo": "mazak-vqc20-linuxcnc-retrofit",
        "authority_file": AUTHORITY,
        "halfiles": halfiles,
        "board_ip": "192.168.1.121",
        "rules": [
            "mesa/current_pin_authority.csv is the wiring authority. It supersedes mesa/signal_map.csv.",
            "TB3 analog axis order is X=0, Z=1, Y=2.",
            "Axis feedback is Tamagawa resolver through the 7i49, not quadrature encoder.",
            "The hardware E-stop chain removes hazardous power. 7i97T TB5.10 is a monitor input only.",
            "Every hm2_7i97.* pin name in the HAL set is an unverified placeholder.",
        ],
    }

    return {
        "meta": meta,
        "boards": E.BOARDS,
        "statuses": E.STATUS,
        "signals": signals,
        "conflicts": E.CONFLICTS,
        "subsystems": sorted({s["subsystem"] for s in signals}),
        "connectors": sorted({s["connector"] for s in signals}),
        "orphan_nets": orphans,
        "missing_from_hal": missing,
    }


def main():
    here = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", default=os.path.dirname(here))
    ap.add_argument("--out", default=os.path.join(here, "data.js"))
    args = ap.parse_args()

    data = build(args.source)
    payload = json.dumps(data, indent=1, ensure_ascii=False)
    with open(args.out, "w", encoding="utf-8") as fh:
        fh.write("// GENERATED FILE - do not edit by hand.\n")
        fh.write("// Regenerate with:  cd io-dashboard && python3 tools/generate_data.py\n")
        fh.write("// Source of truth:  mesa/current_pin_authority.csv (repo root)\n")
        fh.write("window.MAZAK_DATA = ")
        fh.write(payload)
        fh.write(";\n")
    print("wrote %s  (%d signals, %d conflicts, %d orphan HAL nets, %d authority nets missing from HAL)"
          % (args.out, len(data["signals"]), len(data["conflicts"]),
             len(data["orphan_nets"]), len(data["missing_from_hal"])))


if __name__ == "__main__":
    main()
