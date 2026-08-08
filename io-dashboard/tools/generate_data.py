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
    "linuxcnc/motion_7i80hdt.hal",
    "linuxcnc/field_7i84u.hal",
    "linuxcnc/atc_orient.hal",
    "linuxcnc/postgui.hal",
    "linuxcnc/pendant_whb04b.hal",
]
INI_FILE = "linuxcnc/mazak_vqc_20_40.ini"
AUTHORITY = "mesa/current_pin_authority.csv"
EPSON_FERRULES = "wiring/bbia1_mesa_end_ferrules_epson.csv"

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
    epson_by_signal = {}
    for r in csv_rows_with_lines(os.path.join(root, EPSON_FERRULES)):
        sid = r["Authority_ID"]
        epson_by_signal.setdefault(sid, []).append({
            "label_text": r["Label_Text"],
            "wire": r["Wire"],
            "old_location": r["Old_Location"],
            "signal": r["Signal"],
            "mesa_card": r["Mesa_Card"],
            "connector": r["Connector"],
            "logical_channel": r["Logical_Channel"],
            "physical_pin": r["Physical_Pin"],
            "crosswalk_status": r["Crosswalk_Status"],
            "release_status": r["Release_Status"],
            "source_line": r["_line"],
        })
    conflict_by_signal = {}
    for c in E.CONFLICTS:
        for s in c["signals"]:
            conflict_by_signal.setdefault(s, []).append(c["id"])

    signals = []
    for r in auth:
        sid = r["signal_id"]
        epson_ferrules = epson_by_signal.get(sid, [])
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
            pin_bases.add("hm2_7i80.0.gpio.%s" % m.group(1))
        for s in setps:
            base = s["target"].rsplit(".", 1)[0]
            if base in pin_bases or (has_net and s["target"] == net):
                setp_refs.append(s)

        loc, machine_sub, loc_note = E.LOCATION.get(
            sid, ("Unknown \u2014 trace in cabinet", r["subsystem"], ""))

        expected = expected_for(sid, direction, status)

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
        if r["primary_source"]:
            sources.append({
                "file": r["primary_source"], "lines": "",
                "note": "primary_source column in the authority table",
            })
        for ferrule in epson_ferrules:
            sources.append({
                "file": EPSON_FERRULES,
                "lines": str(ferrule["source_line"]),
                "note": "Epson Mesa-end ferrule %s; %s" % (
                    ferrule["label_text"], ferrule["release_status"]),
            })

        active_nets = [x for x in hal_refs if not x["commented"]]
        commented_nets = [x for x in hal_refs if x["commented"]]

        hal_state = "absent"
        if active_nets:
            hal_state = "active"
        elif commented_nets:
            hal_state = "commented"

        # P3 has no daughter card and all of its GPIO remains spare. Preserve
        # 7i80HDT ownership for those authority rows.
        # gpio.024-031 is retained as the 7i49 P2 classification if it appears.
        board = r["mesa_card"]
        if board == "7i80HDT":
            m_idx = re.search(r"gpio\.(\d+)", r["pin_channel"])
            if m_idx:
                idx = int(m_idx.group(1))
                if 24 <= idx <= 31:
                    board = "7i49"

        signals.append({
            "id": sid,
            "name": sid.replace("_", " ").title(),
            "board": board,
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
            "epson_ferrules": epson_ferrules,
            "sources": sources,
            "conflicts": conflict_by_signal.get(sid, []),
            "authority_line": r["_line"],
        })

    # HAL nets that exist in the config but have NO authority row at all.
    known = {s["hal_net"] for s in signals if s["hal_net"]}
    internal = re.compile(
        r"^(x|y|z)-(pos-cmd|pos-fb|vel-fb|pos-rawcounts|index-enable|traj-vel|resolver-fault|axis-fault)$|"
        r"^estop-(ok|reset)$|^tool-(prepare|change)-loopback$|^spindle-(pos-fb|vel-fb|revs|index-enable)$|"
        r"^spindle-vel-(cmd|fb)-rpm$|^spindle-pid-out$|^spindle-speed-mag$|"
        r"^watchdog-(hm2-bit|pkt-err)$")
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
            m_card = re.search(r"\.7i84\.0\.(\d+)\.", pin)
            board = "7i84U-B" if m_card and m_card.group(1) == "1" else "7i84U-A"
            chan = pin.rsplit(".", 1)[-1]
            m_num = re.search(r"-(\d+)", chan)
            pin_num = int(m_num.group(1)) if m_num else -1
            conn = "TB3" if 0 <= pin_num <= 15 else "TB2"
            channel = chan.upper().replace("INPUT-", "IN").replace("OUTPUT-", "OUT")
            channel = re.sub(r"^(IN|OUT)0(\d)$", r"\1\2", channel)
        else:
            # P3 has no daughter card and no active field-signal exception.
            m_idx = re.search(r"gpio\.(\d+)", pin)
            idx = int(m_idx.group(1)) if m_idx else -1
            if 24 <= idx <= 31:
                board = "7i49"      # P2 daughter card
                conn = "P2"
            else:
                board = "7i80HDT"
                conn = "P3 GPIO spare" if 32 <= idx <= 62 else "P1"
            channel = pin.split("hm2_7i80.0.", 1)[-1]
        is_in = "input" in pin or pin.endswith(".in")
        direction = "IN" if is_in else "OUT"
        prod2, cons2 = linuxcnc_endpoints(net, nets)
        srcs = [{"file": r["file"], "lines": str(r["line"]),
                 "note": ("commented out \u2014 " if r["commented"] else "") + r["text"]}
                for r in refs]
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
            "field_point": "Not in the wiring authority",
            "designations": [],
            "primary_source": "HAL config only",
            "cleanup_notes": "No row in current_pin_authority.csv. " + (
                "Active in HAL \u2014 remove or add an authority row before loading against field wiring."
                if active else "Commented out in HAL."),
            "location": "Unknown \u2014 no authority row, trace in cabinet",
            "location_note": "",
            "expected": {"value": "Unknown", "label": "Unknown \u2014 measure/verify",
                         "basis": "No authority row and no normal-state evidence.",
                         "kind": "unknown"},
            "hal_state": "active" if active else "commented",
            "mesa_pins": mesa,
            "producers": prod2,
            "consumers": cons2,
            "hal_refs": refs,
            "setp_refs": [],
            "epson_ferrules": [],
            "sources": srcs,
            "conflicts": ["C1" if is_in else "C2"],
            "authority_line": None,
        })

    # Authority nets that never appear in HAL
    missing = [s["id"] for s in signals
               if s["hal_net"] and s["hal_state"] == "absent"
               and s["status"] not in {"DEFERRED", "SPARE", "RESERVED", "RESERVED_VERIFY"}]

    ini_lines = read_lines(os.path.join(root, INI_FILE))
    halfiles = [l.split("=", 1)[1].strip() for l in ini_lines
                if l.strip().startswith("HALFILE")]

    meta = {
        "machine": "Mazak VQC-20/40",
        "serial": "060231",
        "architecture": "LinuxCNC + Mesa 7i80HDT (Ethernet FPGA host) + 7i44 on P1 (HostMot2 sserial port 0 channels 0/1 to 7i84U-A/B) + 7i49 on P2 (resolver + analog outs); P3 unused/spare",
        "generated": datetime.datetime.now(datetime.timezone.utc)
                             .strftime("%Y-%m-%d %H:%M UTC"),
        "source_repo": "mazak-vqc20-linuxcnc-retrofit",
        "authority_file": AUTHORITY,
        "epson_ferrule_file": EPSON_FERRULES,
        "halfiles": halfiles,
        "board_ip": "192.168.1.121",
        "rules": [
            "mesa/current_pin_authority.csv is the wiring authority.",
            "7i49 AOUT axis order is X=AOUT0, Z=AOUT1, Y=AOUT2.",
            "Axis feedback is Tamagawa TS2014N resolver through the 7i49 on P2, not quadrature encoder.",
            "The hardware E-stop chain removes hazardous power. 7i84U-A TB2 IN29 is the sole software monitor; the OEM hardware chain remains authoritative.",
            "Every hm2_7i80.* pin name in the HAL set is an unverified placeholder until confirmed against a firmware readhmid.",
            "7i49 AOUT order is X=AOUT0, Z=AOUT1, Y=AOUT2, FR-SX spindle velocity=AOUT3; AOUT4/AOUT5 spare.",
            "7i84U-B on 7i44 channel 1: TB3 IN0-5 limits, IN6-8 homes, IN9 air pressure, IN15 probe; TB3 OUT0-2 drive enable, OUT3-7 relay loads; TB2 OUT8 proposed cover valve; OUT9-15 spare.",
            "7i84U-A on sserial channel 0 is `hm2_7i80.0.7i84.0.0.*`; 7i84U-B on channel 1 is `hm2_7i80.0.7i84.0.1.*`; P3 has no active field binding.",
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
