#!/usr/bin/env python3
"""Generate WireViz wiring-diagram sources from the MESAC crosswalk CSVs.

The generator deliberately preserves authority states. It never promotes a HOLD or
field-verification route to a released wire. Plane A discrete routes include an
explicit interposing-relay boundary; the WireViz drawing does not imply the relay's
internal coil/contact topology, which remains a terminal-schedule design item.

Usage:
    python3 scripts/generate_wireviz_diagrams.py
    python3 scripts/generate_wireviz_diagrams.py --render
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import html
import json
import re
import shutil
import subprocess
from collections import Counter, defaultdict
from pathlib import Path

import yaml


REPO_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_ROOT = REPO_ROOT / "diagrams" / "wireviz"
SOURCE_DIR = OUTPUT_ROOT / "src"
RENDER_DIR = OUTPUT_ROOT / "rendered"

PLANE_A_CANDIDATES = (
    REPO_ROOT / "wiring" / "plane_a_bbia1_pin_crosswalk.csv",
    REPO_ROOT / "Codex Manual Read" / "plane_a_bbia1_pin_crosswalk.csv",
)
PLANE_B_CANDIDATES = (
    REPO_ROOT / "wiring" / "plane_b_pin_crosswalk.csv",
    REPO_ROOT / "Codex Manual Read" / "plane_b_pin_crosswalk.csv",
)

PLANE_A_ACTIVE_DISPOSITIONS = {"MESA_ROUTE", "MESA_ROUTE_CANDIDATE"}
DIRECT_PLANE_A_STATUSES = {"HOLD_ANALOG_ROLE", "HOLD_SHIELD_OR_COMMON"}

STATUS_COLORS = {
    "ROUTE_DEFINED_FIELD_VERIFY": "YE",
    "DESIGN_CONFIRMED_FIELD_PENDING": "YE",
    "PROPOSED_PHASE_VERIFY": "RD",
    "HOLD_RESERVED": "RD",
    "HOLD_OEM_CONFLICT": "RD",
    "HOLD_ANALOG_ROLE": "RD",
    "HOLD_SOURCE_TRACE": "RD",
    "HOLD_SHIELD_OR_COMMON": "RD",
    "HOLD_SHIELD_TOPOLOGY": "RD",
    "RETAIN_OR_RETIRE_DECISION": "GY",
}


def find_input(candidates: tuple[Path, ...]) -> Path:
    for candidate in candidates:
        if candidate.is_file():
            return candidate
    raise FileNotFoundError(
        "No crosswalk input found. Checked: "
        + ", ".join(str(p.relative_to(REPO_ROOT)) for p in candidates)
    )


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8-sig") as handle:
        return list(csv.DictReader(handle))


def slug(value: str) -> str:
    value = re.sub(r"[^A-Za-z0-9]+", "_", value.strip()).strip("_")
    return value.lower() or "unnamed"


def clean(value: str, fallback: str = "TBD") -> str:
    value = (value or "").strip()
    if not value or value.lower() == "none":
        return fallback
    return value


def pin_id(value: str | int) -> str | int:
    """Use integers for numeric pins because WireViz distinguishes 1 from '1'."""
    if isinstance(value, int):
        return value
    value = str(value).strip()
    return int(value) if value.isdigit() else value


def status_color(status: str) -> str:
    if status not in STATUS_COLORS:
        raise ValueError(f"No diagram color policy for status {status!r}")
    return STATUS_COLORS[status]


def short_status(status: str) -> str:
    if status == "ROUTE_DEFINED_FIELD_VERIFY":
        return "FV"
    if status == "DESIGN_CONFIRMED_FIELD_PENDING":
        return "FP"
    if status == "RETAIN_OR_RETIRE_DECISION":
        return "DEC"
    if status == "PROPOSED_PHASE_VERIFY":
        return "PHASE"
    return "HOLD"


def compact_signal(value: str, limit: int = 24) -> str:
    """Keep pin rows readable without losing their crosswalk identity."""
    value = clean(value, "TBD")
    replacements = (
        ("MANUAL_TOOL_UNCLAMP", "MT_UNCLAMP"),
        ("MANUAL_TOOL_CLAMP", "MT_CLAMP"),
        ("MAG_COVER_CLOSE_CONF", "MAG_COVER_CLOSE"),
        ("MAG_COVER_OPEN_CONF", "MAG_COVER_OPEN"),
        ("_CONF", "_OK"),
        ("_CANDIDATE", "_CAND"),
    )
    for old, new in replacements:
        value = value.replace(old, new)
    return value if len(value) <= limit else value[: limit - 1] + "…"


def compact_note(value: str, fallback: str = "See crosswalk source.") -> str:
    """Avoid large note paragraphs expanding every connector node."""
    value = (value or "").strip()
    if "relay" in value.lower() or "boundary" in value.lower():
        return "Logical boundary placeholder; see crosswalk."
    if "terminal" in value.lower() or "mesa" in value.lower():
        return "Verify endpoint numbering against the card manual."
    if "source" in value.lower() or "tbd" in value.lower():
        return "Source identity remains unresolved; see crosswalk."
    return fallback


def base_document(title: str, description: str, source_note: str) -> dict:
    return {
        "metadata": {
            "title": title,
            "description": description,
            "notes": (
                "PRELIMINARY - NOT RELEASED FOR WIRING. "
                "Yellow = defined route requiring field verification; red = HOLD or "
                "proposed; gray = retain/retire decision. " + source_note
            ),
        },
        "options": {
            "fontname": "Arial",
            "bgcolor": "WH",
            "bgcolor_node": "WH",
            "color_mode": "SHORT",
            "mini_bom_mode": False,
        },
        "connectors": {},
        "cables": {},
        "connections": [],
    }


def connector(
    type_text: str,
    pins: list[str | int],
    labels: list[str],
    colors: list[str],
    *,
    notes: str = "",
    title_color: str = "LB",
) -> dict:
    pins = [pin_id(pin) for pin in pins]
    if not (len(pins) == len(labels) == len(colors)):
        raise ValueError("Connector pins, labels, and colors must have equal length")
    if len(pins) != len(set(pins)):
        raise ValueError(f"Connector pin identifiers are not unique: {pins}")
    return {
        "type": type_text,
        "pins": pins,
        "pinlabels": labels,
        "pincolors": colors,
        "hide_disconnected_pins": True,
        "show_pincount": False,
        "bgcolor_title": title_color,
        "notes": compact_note(notes),
        "ignore_in_bom": True,
    }


def cable(
    type_text: str,
    labels: list[str],
    colors: list[str],
    *,
    notes: str = "",
    shield: bool = False,
) -> dict:
    return {
        "type": type_text,
        "wirecount": len(labels),
        "wirelabels": labels,
        "colors": colors,
        "show_wirecount": False,
        "notes": compact_note(notes),
        "shield": shield,
        "ignore_in_bom": True,
    }


def unique_pin_ids(rows: list[dict[str, str]], field: str, prefix: str) -> list[str | int]:
    used: Counter[str] = Counter()
    result: list[str] = []
    for index, row in enumerate(rows, start=1):
        base = clean(row.get(field, ""), f"{prefix}{index:02d}")
        used[base] += 1
        result.append(pin_id(base if used[base] == 1 else f"{base}_{used[base]}"))
    return result


def add_target_connectors(
    document: dict,
    rows: list[dict[str, str]],
    status_field: str,
    pin_field: str,
    signal_field: str,
) -> tuple[dict[int, tuple[str, str]], dict[str, list[int]]]:
    groups: dict[str, list[int]] = defaultdict(list)
    row_destinations: dict[int, tuple[str, str | int]] = {}

    for index, row in enumerate(rows):
        card = clean(row.get("mesa_card", ""), "HOLD_TERMINATION")
        conn = clean(row.get("mesa_connector", ""), "TBD")
        if card == "HOLD_TERMINATION":
            key = "HOLD_TERMINATION"
        else:
            key = f"{card}_{conn}"
        groups[key].append(index)

    for key, indices in groups.items():
        group_rows = [rows[i] for i in indices]
        pins = unique_pin_ids(group_rows, pin_field, "TBD")
        labels = []
        colors = []
        for local_index, (row_index, pin) in enumerate(zip(indices, pins)):
            row = rows[row_index]
            status = row[status_field]
            signal = compact_signal(clean(row.get(signal_field, ""), row.get("signal_id", "TBD")))
            labels.append(f"{pin} | {signal} | {short_status(status)}")
            colors.append(status_color(status))
            row_destinations[row_index] = (key, pin)

        if key == "HOLD_TERMINATION":
            type_text = "Termination or electrical role not established"
            notes = "Do not terminate until the row's required verification is complete."
            title_color = "RD"
        else:
            type_text = key.replace("_", " ", 1).replace("_", " / ")
            notes = "Mesa terminal text is copied from the crosswalk; verify physical terminal numbering against the card manual."
            title_color = "LB"
        document["connectors"][key] = connector(
            type_text, pins, labels, colors, notes=notes, title_color=title_color
        )
    return row_destinations, groups


def build_plane_a_discrete(
    oem_connector: str, rows: list[dict[str, str]], source_name: str
) -> tuple[str, dict, dict]:
    rows = sorted(rows, key=lambda r: int(r["oem_pin"]))
    title = f"Plane A - BBIA-1 {oem_connector} discrete routes"
    document = base_document(
        title,
        f"Machine-facing {oem_connector} conductors through the required isolation boundary to Mesa field I/O.",
        f"Input: {source_name}.",
    )
    colors = [status_color(r["landing_status"]) for r in rows]
    source_pins = [pin_id(r["oem_pin"]) for r in rows]
    source_labels = [
        f"{compact_signal(clean(r['factory_wire']), 10)} | {compact_signal(clean(r['signal_id']))} | {short_status(r['landing_status'])}"
        for r in rows
    ]
    document["connectors"][oem_connector] = connector(
        f"BBIA-1 {oem_connector} machine-facing connector",
        source_pins,
        source_labels,
        colors,
        notes=(
            "PRELIMINARY - NOT RELEASED FOR WIRING. Only Mesa route and candidate pins are shown; "
            "see the 320-row Plane A CSV for complete pin accounting."
        ),
    )

    relay_pins: list[str] = []
    relay_labels: list[str] = []
    relay_colors: list[str] = []
    field_pins: list[str] = []
    mesa_pins: list[str] = []
    for index, row in enumerate(rows, start=1):
        field_pin = f"F{index:02d}"
        mesa_pin = f"M{index:02d}"
        field_pins.append(field_pin)
        mesa_pins.append(mesa_pin)
        relay_pins.extend([field_pin, mesa_pin])
        relay_labels.extend(
            [
                f"F | {compact_signal(row['signal_id'])}",
                f"M | {compact_signal(row['signal_id'])}",
            ]
        )
        relay_colors.extend([colors[index - 1], colors[index - 1]])
    document["connectors"]["IR_BOUNDARY"] = connector(
        "Required interposing-relay boundary",
        relay_pins,
        relay_labels,
        relay_colors,
        notes=(
            "PRELIMINARY - NOT RELEASED FOR WIRING. Fxx and Mxx are logical boundary identifiers, "
            "not purchased relay terminal numbers. "
            "Specify coil/contact topology, suppression, voltage domain, and actual terminal IDs before release."
        ),
        title_color="YE",
    )

    wire_numbers = list(range(1, len(rows) + 1))
    document["cables"]["OEM_CONDUCTORS"] = cable(
        "Existing OEM conductor segments",
        [f"{compact_signal(clean(r['factory_wire']), 10)} | {compact_signal(r['signal_id'])}" for r in rows],
        colors,
        notes="Factory identifier shown; cable construction remains unspecified.",
    )
    document["cables"]["NEW_CONTROL_WIRING"] = cable(
        "New control-side conductors",
        [f"{compact_signal(r['signal_id'])} | {compact_signal(clean(r['hal_net']), 18)}" for r in rows],
        colors,
        notes="New-side wire schedule remains to be assigned.",
    )
    document["connections"].append(
        [
            {oem_connector: source_pins},
            {"OEM_CONDUCTORS": wire_numbers},
            {"IR_BOUNDARY": field_pins},
        ]
    )

    destinations, groups = add_target_connectors(
        document, rows, "landing_status", "mesa_pin_channel", "hal_net"
    )
    for target_key, indices in groups.items():
        document["connections"].append(
            [
                {"IR_BOUNDARY": [mesa_pins[i] for i in indices]},
                {"NEW_CONTROL_WIRING": [i + 1 for i in indices]},
                {target_key: [destinations[i][1] for i in indices]},
            ]
        )

    stats = {
        "sheet": title,
        "routes": len(rows),
        "statuses": dict(Counter(r["landing_status"] for r in rows)),
        "source": source_name,
    }
    return f"plane_a_{slug(oem_connector)}_discrete", document, stats


def build_direct_sheet(
    basename: str,
    title: str,
    description: str,
    rows: list[dict[str, str]],
    *,
    status_field: str,
    source_pin_field: str,
    destination_pin_field: str,
    destination_signal_field: str,
    source_note: str,
) -> tuple[str, dict, dict]:
    document = base_document(title, description, source_note)
    colors = [status_color(r[status_field]) for r in rows]
    source_groups: dict[str, list[int]] = defaultdict(list)
    for index, row in enumerate(rows):
        raw_source = clean(row.get("oem_connector", ""), "SOURCE_TBD")
        source_key = "NEW_CABLE_SHIELDS" if raw_source.lower() == "new cable" else raw_source
        source_groups[source_key].append(index)

    source_pin_by_row: dict[int, str | int] = {}
    for source_key, indices in source_groups.items():
        group_rows = [rows[i] for i in indices]
        pins = unique_pin_ids(group_rows, source_pin_field, "TBD")
        labels = []
        pincolors = []
        for row_index, pin in zip(indices, pins):
            row = rows[row_index]
            lead = clean(row.get("oem_lead", ""), "")
            wire = clean(row.get("factory_wire", ""), lead)
            suffix = f" | lead/wire {wire}" if wire else ""
            labels.append(
                f"{pin} | {compact_signal(clean(row.get('signal_id', '')))}{suffix} | {short_status(row[status_field])}"
            )
            pincolors.append(colors[row_index])
            source_pin_by_row[row_index] = pin
        title_color = "RD" if source_key in {"TBD", "SOURCE_TBD"} else "LB"
        source_type = (
            "New resolver-cable pair drains (three shields)"
            if source_key == "NEW_CABLE_SHIELDS"
            else f"OEM / field endpoint {source_key}"
        )
        document["connectors"][source_key] = connector(
            source_type,
            pins,
            labels,
            pincolors,
            notes=(
                "PRELIMINARY - NOT RELEASED FOR WIRING. Source identifiers are copied from the crosswalk; "
                "TBD is deliberately unresolved."
            ),
            title_color=title_color,
        )

    labels = [
        f"{compact_signal(clean(r.get('signal_id', '')))} | {short_status(r[status_field])}" for r in rows
    ]
    document["cables"]["DIRECT_INTERFACE"] = cable(
        "Direct analog / resolver interface conductors",
        labels,
        colors,
        notes=(
            "PRELIMINARY - NOT RELEASED FOR WIRING. Logical route only. Cable part, gauge, "
            "pair assignment, and length are not asserted by this sheet."
        ),
    )
    wire_numbers = list(range(1, len(rows) + 1))
    for source_key, indices in source_groups.items():
        document["connections"].append(
            [
                {source_key: [source_pin_by_row[i] for i in indices]},
                {"DIRECT_INTERFACE": [i + 1 for i in indices]},
            ]
        )

    destinations, groups = add_target_connectors(
        document,
        rows,
        status_field,
        destination_pin_field,
        destination_signal_field,
    )
    # Extend the source-to-cable connection sets with cable-to-destination sets.
    for target_key, indices in groups.items():
        document["connections"].append(
            [
                {"DIRECT_INTERFACE": [i + 1 for i in indices]},
                {target_key: [destinations[i][1] for i in indices]},
            ]
        )

    stats = {
        "sheet": title,
        "routes": len(rows),
        "statuses": dict(Counter(r[status_field] for r in rows)),
        "source": source_note,
    }
    return basename, document, stats


def build_overview(source_note: str) -> tuple[str, dict, dict]:
    document = base_document(
        "MESAC VQC-20/40 LinuxCNC retrofit - interface overview",
        "Two-plane logical architecture. Pin-level details are on the companion WireViz sheets.",
        source_note,
    )
    nodes = {
        "BBIA_PLANE_A": ("Plane A - BBIA-1 machine-facing CN connectors", "YE", [1]),
        "RELAY_BOUNDARY": ("Required interposing relay boundary for discrete I/O", "YE", [1, 2]),
        "MESA_7I84": ("Mesa 7i84U-A / 7i84U-B field I/O", "LB", [1, 2]),
        "CNA_PLANE_B": ("Plane B - CNA3/CNA4/CNA5 and axis command pairs", "RD", [1]),
        "MESA_7I49": ("Mesa 7i49 resolver and analog interface", "LB", [1, 2]),
        "LINUXCNC": ("7i80HDT + 7i44 + LinuxCNC", "LB", [1, 2]),
    }
    for key, (label, color, pins) in nodes.items():
        document["connectors"][key] = connector(
            label,
            pins,
            [label] * len(pins),
            [color] * len(pins),
            notes="PRELIMINARY - NOT RELEASED FOR WIRING. Logical architecture node.",
            title_color=color,
        )
    document["cables"] = {
        "A_FIELD": cable("Existing Plane A conductors", ["Plane A"], ["YE"]),
        "A_RELAY": cable("Isolated discrete interface", ["Plane A"], ["YE"]),
        "B_DIRECT": cable("Direct resolver / analog interface", ["Plane B HOLD"], ["RD"]),
        "HOST_IO": cable(
            "Mesa host interconnect",
            ["7i84 Smart-Serial", "7i49 FPGA interface"],
            ["BU", "BU"],
        ),
    }
    document["connections"] = [
        [{"BBIA_PLANE_A": 1}, {"A_FIELD": 1}, {"RELAY_BOUNDARY": 1}],
        [{"RELAY_BOUNDARY": 2}, {"A_RELAY": 1}, {"MESA_7I84": 1}],
        [{"CNA_PLANE_B": 1}, {"B_DIRECT": 1}, {"MESA_7I49": 1}],
        [{"MESA_7I84": 2}, {"HOST_IO": 1}, {"LINUXCNC": 1}],
        [{"MESA_7I49": 2}, {"HOST_IO": 2}, {"LINUXCNC": 2}],
    ]
    return "00_interface_overview", document, {"sheet": "Interface overview", "routes": 4}


def validate_inputs(plane_a: list[dict[str, str]], plane_b: list[dict[str, str]]) -> None:
    if len(plane_a) != 320:
        raise ValueError(f"Plane A must contain 320 accounted pins; found {len(plane_a)}")
    if len(plane_b) != 38:
        raise ValueError(f"Plane B must contain 38 rows; found {len(plane_b)}")
    for row in plane_a:
        if row["disposition"] in PLANE_A_ACTIVE_DISPOSITIONS:
            status_color(row["landing_status"])
    for row in plane_b:
        status_color(row["route_status"])


def write_sheet(name: str, document: dict) -> Path:
    path = SOURCE_DIR / f"{name}.yml"
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        handle.write("# GENERATED FILE - edit the source CSV or generator, then regenerate.\n")
        yaml.safe_dump(document, handle, sort_keys=False, allow_unicode=True, width=120)
    return path


def write_browser_index(sheets: list[tuple[str, dict, dict]]) -> None:
    rows = []
    for name, _document, stats in sheets:
        statuses = ", ".join(
            f"{key}: {value}" for key, value in sorted(stats.get("statuses", {}).items())
        ) or "overview"
        rows.append(
            "<tr>"
            f"<td>{html.escape(str(stats['sheet']))}</td>"
            f"<td>{stats.get('routes', '')}</td>"
            f"<td>{html.escape(statuses)}</td>"
            f"<td><a href='rendered/{name}.html'>HTML</a> · "
            f"<a href='rendered/{name}.svg'>SVG</a> · "
            f"<a href='rendered/{name}.png'>PNG</a></td>"
            "</tr>"
        )
    page = """<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>MESAC VQC-20/40 WireViz diagrams</title>
<style>
body{font-family:Arial,sans-serif;max-width:1200px;margin:2rem auto;padding:0 1rem;color:#171717}
h1{margin-bottom:.25rem}.warning{border:3px solid #b00020;background:#fff2f2;padding:1rem;font-weight:700}
table{border-collapse:collapse;width:100%;margin-top:1.5rem}th,td{border:1px solid #aaa;padding:.55rem;text-align:left;vertical-align:top}
th{background:#e8f4fb}tr:nth-child(even){background:#f7f7f7}a{color:#0645ad}
code{background:#eee;padding:.1rem .25rem}</style></head><body>
<h1>MESAC VQC-20/40 WireViz diagrams</h1>
<p>Generated from the Plane A and Plane B pin-level crosswalks.</p>
<div class="warning">PRELIMINARY - NOT RELEASED FOR WIRING OR ENERGIZATION.<br>
Yellow = route defined but field verification required. Red = HOLD/proposed. Gray = retain/retire decision.</div>
<p>Regenerate with <code>python3 scripts/generate_wireviz_diagrams.py --render</code>.</p>
<table><thead><tr><th>Sheet</th><th>Routes</th><th>Authority status</th><th>Open</th></tr></thead><tbody>
""" + "\n".join(rows) + "\n</tbody></table></body></html>\n"
    with (OUTPUT_ROOT / "index.html").open("w", encoding="utf-8", newline="\n") as handle:
        handle.write(page)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def render(paths: list[Path]) -> None:
    executable = shutil.which("wireviz")
    if not executable:
        raise RuntimeError("wireviz is not on PATH")
    dot_executable = shutil.which("dot")
    if not dot_executable:
        raise RuntimeError("Graphviz dot is not on PATH")
    RENDER_DIR.mkdir(parents=True, exist_ok=True)
    for path in paths:
        # WireViz's stock ranksep=2 is intentionally generous for general
        # harness drawings, but makes these pin crosswalks thousands of pixels
        # wide. Generate the normal HTML wrapper, then rerun Graphviz with a
        # compact LR layout and replace the embedded SVG in the wrapper.
        subprocess.run(
            [executable, "--format", "gh", "--output-dir", str(RENDER_DIR), str(path)],
            cwd=REPO_ROOT,
            check=True,
        )
        gv_path = RENDER_DIR / f"{path.stem}.gv"
        gv = gv_path.read_text(encoding="utf-8")
        gv = gv.replace("ranksep=2", "ranksep=0.35")
        gv = gv.replace("nodesep=0.33", "nodesep=0.08")
        gv = gv.replace("graph [", "graph [margin=0 pad=0 ", 1)
        gv = gv.replace("node [", "node [fontsize=9 ", 1)
        gv = gv.replace('cellpadding="3"', 'cellpadding="1"')
        gv_path.write_text(gv, encoding="utf-8")
        subprocess.run(
            [dot_executable, "-Tsvg", "-o", str(RENDER_DIR / f"{path.stem}.svg"), str(gv_path)],
            cwd=REPO_ROOT,
            check=True,
        )
        subprocess.run(
            [dot_executable, "-Tpng", "-o", str(RENDER_DIR / f"{path.stem}.png"), str(gv_path)],
            cwd=REPO_ROOT,
            check=True,
        )
        html_path = RENDER_DIR / f"{path.stem}.html"
        html_text = html_path.read_text(encoding="utf-8")
        compact_svg = (RENDER_DIR / f"{path.stem}.svg").read_text(encoding="utf-8")
        html_text, replacements = re.subn(
            r"<svg\b.*?</svg>", compact_svg, html_text, count=1, flags=re.DOTALL
        )
        if replacements != 1:
            raise RuntimeError(f"Could not replace embedded SVG in {html_path}")
        html_path.write_text(html_text, encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--render", action="store_true", help="also run WireViz and produce HTML, PNG, and SVG")
    args = parser.parse_args()

    plane_a_path = find_input(PLANE_A_CANDIDATES)
    plane_b_path = find_input(PLANE_B_CANDIDATES)
    plane_a = read_csv(plane_a_path)
    plane_b = read_csv(plane_b_path)
    validate_inputs(plane_a, plane_b)

    SOURCE_DIR.mkdir(parents=True, exist_ok=True)
    sheets: list[tuple[str, dict, dict]] = []
    source_note = (
        f"Inputs: {plane_a_path.relative_to(REPO_ROOT)} and {plane_b_path.relative_to(REPO_ROOT)}"
    )
    sheets.append(build_overview(source_note))

    active_a = [r for r in plane_a if r["disposition"] in PLANE_A_ACTIVE_DISPOSITIONS]
    discrete_by_connector: dict[str, list[dict[str, str]]] = defaultdict(list)
    direct_a: list[dict[str, str]] = []
    for row in active_a:
        if row["landing_status"] in DIRECT_PLANE_A_STATUSES or row["mesa_card"] == "7i49":
            direct_a.append(row)
        else:
            discrete_by_connector[row["oem_connector"]].append(row)
    for oem_connector in sorted(discrete_by_connector, key=lambda value: (len(value), value)):
        sheets.append(
            build_plane_a_discrete(
                oem_connector,
                discrete_by_connector[oem_connector],
                str(plane_a_path.relative_to(REPO_ROOT)),
            )
        )
    sheets.append(
        build_direct_sheet(
            "plane_a_cn4_spindle_analog",
            "Plane A - CN4 FR-SX spindle analog reference",
            "CN4 SE1/SE2/SE3 to the 7i49 AOUT3 interface. Every role remains HOLD.",
            sorted(direct_a, key=lambda row: int(row["oem_pin"])),
            status_field="landing_status",
            source_pin_field="oem_pin",
            destination_pin_field="mesa_pin_channel",
            destination_signal_field="hal_net",
            source_note=f"Input: {plane_a_path.relative_to(REPO_ROOT)}; OEM 41434WB p127.",
        )
    )

    for axis, connector_name in (("X", "CNA3"), ("Y", "CNA4"), ("Z", "CNA5")):
        rows = [
            r
            for r in plane_b
            if r["signal_id"].startswith(f"{axis}_RES_")
        ]
        sheets.append(
            build_direct_sheet(
                f"plane_b_{axis.lower()}_resolver",
                f"Plane B - {axis}-axis resolver to Mesa 7i49",
                f"{connector_name} resolver windings, case-ground disposition, and three-pair drain requirement.",
                rows,
                status_field="route_status",
                source_pin_field="oem_pin",
                destination_pin_field="mesa_pin",
                destination_signal_field="mesa_signal",
                source_note=f"Input: {plane_b_path.relative_to(REPO_ROOT)}; OEM 41434WB p128; 7i49 manual.",
            )
        )

    axis_command_rows = [r for r in plane_b if r["subsystem"] == "Axis velocity command"]
    sheets.append(
        build_direct_sheet(
            "plane_b_axis_velocity_commands",
            "Plane B - X/Y/Z analog velocity commands",
            "7i49 AOUT0/AOUT1/AOUT2 endpoints are known; all retained DK-427 source connector pins remain TBD.",
            axis_command_rows,
            status_field="route_status",
            source_pin_field="signal_id",
            destination_pin_field="mesa_pin",
            destination_signal_field="mesa_signal",
            source_note=f"Input: {plane_b_path.relative_to(REPO_ROOT)}; OEM command ends require continuity tracing.",
        )
    )

    cna10_rows = [r for r in plane_b if r["oem_connector"] == "CNA10"]
    sheets.append(
        build_direct_sheet(
            "plane_b_cna10_legacy_load_display",
            "Plane B - CNA10 legacy load-display disposition",
            "Existing spindle/Z load display conductors are documented but have no Mesa allocation.",
            cna10_rows,
            status_field="route_status",
            source_pin_field="oem_pin",
            destination_pin_field="mesa_pin",
            destination_signal_field="mesa_signal",
            source_note=f"Input: {plane_b_path.relative_to(REPO_ROOT)}; OEM 41434WB p127.",
        )
    )

    paths = [write_sheet(name, document) for name, document, _ in sheets]
    manifest = {
        "generated_by": "scripts/generate_wireviz_diagrams.py",
        "wireviz_expected": "0.4.x",
        "render_profile": {
            "layout": "compact_lr",
            "ranksep": 0.35,
            "nodesep": 0.08,
            "cellpadding": 1,
            "status_labels": ["FV", "FP", "PHASE", "HOLD", "DEC"],
        },
        "inputs": {
            str(plane_a_path.relative_to(REPO_ROOT)): sha256(plane_a_path),
            str(plane_b_path.relative_to(REPO_ROOT)): sha256(plane_b_path),
        },
        "plane_a_accounted_pins": len(plane_a),
        "plane_a_diagrammed_routes": len(active_a),
        "plane_b_rows": len(plane_b),
        "plane_b_diagrammed_rows": len(plane_b) - len([r for r in plane_b if r["plane"] == "A"]),
        "plane_b_cross_plane_reference_rows": len([r for r in plane_b if r["plane"] == "A"]),
        "sheets": [stats | {"source_file": f"src/{name}.yml"} for name, _, stats in sheets],
    }
    with (OUTPUT_ROOT / "manifest.json").open("w", encoding="utf-8") as handle:
        json.dump(manifest, handle, indent=2, sort_keys=True)
        handle.write("\n")

    write_browser_index(sheets)
    if args.render:
        render(paths)
    print(
        f"Generated {len(paths)} WireViz sheets from {len(active_a)} Plane A routes "
        f"and {len(plane_b)} Plane B rows."
    )


if __name__ == "__main__":
    main()
