#!/usr/bin/env python3
"""Generate a native QElectroTech project from the MESAC crosswalks.

The WireViz generator remains the wiring-data adapter.  This script translates the
same 15 logical sheets into editable QElectroTech elements and conductors.  It does
not promote preliminary authority states: HOLD stays red, field verification stays
yellow, and every Plane A discrete route crosses the explicit relay boundary.

Usage:
    python3 scripts/generate_qelectrotech_project.py
"""

from __future__ import annotations

import argparse
import copy
import hashlib
import importlib.util
import json
import re
import shutil
import sys
import uuid
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_ROOT = REPO_ROOT / "diagrams" / "qelectrotech"
ELEMENT_ROOT = OUTPUT_ROOT / "elements"
PROJECT_PATH = OUTPUT_ROOT / "MESAC_VQC2040_Retrofit.qet"
QET_VERSION = "0.100.0"
NAMESPACE = uuid.UUID("7432684e-7d7a-4db4-a94a-0282401a9cf1")

COLOR_MAP = {
    "YE": "#a85d00",
    "RD": "#d00000",
    "GY": "#505050",
    "BU": "#0057a8",
    "LB": "#0078a8",
    "WH": "#000000",
}


def load_wireviz_generator():
    path = REPO_ROOT / "scripts" / "generate_wireviz_diagrams.py"
    spec = importlib.util.spec_from_file_location("mesac_wireviz_generator", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot load {path}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def q_uuid(value: str) -> str:
    return "{" + str(uuid.uuid5(NAMESPACE, value)) + "}"


def xml_slug(value: str) -> str:
    result = re.sub(r"[^a-z0-9]+", "_", value.lower()).strip("_")
    return result or "element"


def short(value: object, limit: int = 58) -> str:
    text = re.sub(r"\s+", " ", str(value)).strip()
    return text if len(text) <= limit else text[: limit - 1].rstrip() + "…"


def qet_font(size: int, bold: bool = False) -> str:
    weight = 75 if bold else 50
    style = "Bold" if bold else "Regular"
    return f"Liberation Sans,{size},-1,5,{weight},0,0,0,0,0,{style}"


def add_text(parent: ET.Element, text: str, x: float, y: float, *, size: int = 7,
             color: str = "#000000", bold: bool = False) -> None:
    ET.SubElement(parent, "text", {
        "text": short(text, 80), "x": str(x), "y": str(y), "rotation": "0",
        "font": qet_font(size, bold), "color": color,
    })


@dataclass
class Pin:
    key: str
    label: str
    color: str
    side: str


@dataclass
class Block:
    key: str
    title: str
    notes: str
    title_color: str
    pins: list[Pin]
    definition_name: str = ""
    width: int = 330
    height: int = 80

    def finalize(self, sheet_name: str) -> None:
        self.definition_name = f"{xml_slug(sheet_name)}__{xml_slug(self.key)}.elmt"
        # The relay boundary has a field and Mesa terminal on the same logical
        # row.  Showing them side-by-side makes the isolation crossing obvious
        # and keeps the dense CN2 folio readable.
        row_count = (len(self.pins) + 1) // 2 if self.key == "IR_BOUNDARY" else len(self.pins)
        self.height = max(80, 52 + row_count * 20)


class QetProject:
    def __init__(self) -> None:
        self.root = ET.Element("project", {"title": "MESAC VQC-20/40 LinuxCNC Retrofit", "version": QET_VERSION})
        self._add_properties()
        self._add_new_diagrams()
        self.collection = ET.Element("collection")
        self.category = ET.SubElement(self.collection, "category", {"name": "mesac_generated"})
        names = ET.SubElement(self.category, "names")
        ET.SubElement(names, "name", {"lang": "en"}).text = "MESAC generated connector blocks"
        self.definitions: dict[str, ET.Element] = {}
        self.diagram_count = 0
        self.route_count = 0

    def _add_properties(self) -> None:
        props = ET.SubElement(self.root, "properties")
        for name, value in (
            ("savedfilename", PROJECT_PATH.stem),
            ("savedfilepath", str(PROJECT_PATH)),
        ):
            node = ET.SubElement(props, "property", {"name": name, "show": "1"})
            node.text = value

    def _add_new_diagrams(self) -> None:
        new = ET.SubElement(self.root, "newdiagrams")
        ET.SubElement(new, "border", {
            "displayrows": "true", "rowsize": "80", "cols": "29",
            "displaycols": "true", "colsize": "60", "rows": "10",
        })
        ET.SubElement(new, "inset", {
            "title": "", "indexrev": "", "version": "PRELIMINARY", "plant": "MESAC VQC-20/40",
            "filename": "", "auto_page_num": "", "displayAt": "bottom", "author": "",
            "folio": "%id/%total", "locmach": "", "date": "null",
        })
        ET.SubElement(new, "conductors", conductor_attributes("_", "#000000"))
        ET.SubElement(new, "report", {"label": "%f-%l%c"})
        ET.SubElement(new, "xrefs")
        ET.SubElement(new, "conductors_autonums", {"freeze_new_conductors": "false", "current_autonum": ""})
        ET.SubElement(new, "folio_autonums")
        ET.SubElement(new, "element_autonums", {"current_autonum": "", "freeze_new_elements": "false"})

    def register_definition(self, block: Block, sheet_name: str) -> ET.Element:
        block.finalize(sheet_name)
        if block.definition_name in self.definitions:
            return self.definitions[block.definition_name]
        definition = make_definition(block, sheet_name)
        wrapper = ET.SubElement(self.category, "element", {"name": block.definition_name})
        wrapper.append(copy.deepcopy(definition))
        self.definitions[block.definition_name] = definition
        return definition

    def add_sheet(self, sheet_name: str, document: dict, sheet_stats: dict) -> None:
        self.diagram_count += 1
        blocks = document_blocks(document)
        for block in blocks.values():
            self.register_definition(block, sheet_name)

        diagram = ET.SubElement(self.root, "diagram", {
            "title": str(sheet_stats.get("sheet", document.get("metadata", {}).get("title", sheet_name))),
            "indexrev": "", "folio": "%id/%total", "date": "null",
            "order": str(self.diagram_count), "displaycols": "true", "displayrows": "true",
            "cols": "29", "version": "0.100.0-dev", "rows": "10", "rowsize": "80",
            "locmach": "MESAC VQC-20/40", "auto_page_num": "", "colsize": "60",
            "freezeNewConductor": "false", "height": "820", "displayAt": "bottom",
            "author": "", "plant": "LinuxCNC retrofit", "filename": PROJECT_PATH.name,
            "freezeNewElement": "false",
        })
        ET.SubElement(diagram, "defaultconductor", conductor_attributes("_", "#000000"))
        elements_node = ET.SubElement(diagram, "elements")
        conductors_node = ET.SubElement(diagram, "conductors")
        inputs_node = ET.SubElement(diagram, "inputs")
        shapes_node = ET.SubElement(diagram, "shapes")

        warning = document.get("metadata", {}).get("notes", "PRELIMINARY - NOT RELEASED FOR WIRING.")
        ET.SubElement(inputs_node, "input", {
            "x": "45", "y": "28", "text": short(warning, 210), "rotation": "0",
            "font": qet_font(9, True), "color": "#b00020", "text_width": "1600",
        })

        positions = layout_blocks(sheet_name, blocks)
        terminal_map: dict[tuple[str, str], dict[str, float | int]] = {}
        terminal_id = 0
        for z, (key, block) in enumerate(blocks.items(), start=10):
            x, y = positions[key]
            element_uuid = q_uuid(f"instance:{sheet_name}:{key}")
            instance = ET.SubElement(elements_node, "element", {
                "z": str(z), "freezeLabel": "false", "prefix": "X", "orientation": "0",
                "x": str(x), "y": str(y), "type": f"embed://mesac_generated/{block.definition_name}",
                "uuid": element_uuid,
            })
            terminals = ET.SubElement(instance, "terminals")
            for index, pin in enumerate(block.pins):
                px, py, orientation = terminal_geometry(block, index, pin.side)
                # QET's instance XML stores the element-side end of the 4-unit
                # terminal stub, while conductors dock at the definition point.
                # Using the definition point here prevents Element::fromXml()
                # from recognizing the terminal and drops every conductor.
                instance_px, instance_py = terminal_instance_geometry(px, py, orientation)
                terminal_uuid = q_uuid(f"terminal:{sheet_name}:{block.key}:{pin.key}")
                ET.SubElement(terminals, "terminal", {
                    "id": str(terminal_id), "orientation": str(orientation),
                    "x": str(instance_px), "y": str(instance_py),
                })
                terminal_map[(key, pin.key)] = {
                    "id": terminal_id,
                    "x": x + px,
                    "y": y + py,
                    "orientation": orientation,
                    "element_uuid": element_uuid,
                    "terminal_uuid": terminal_uuid,
                }
                terminal_id += 1
            ET.SubElement(instance, "inputs")
            infos = ET.SubElement(instance, "elementInformations")
            for name, value in (("label", key), ("comment", block.notes)):
                ET.SubElement(infos, "information", {"name": name}).text = short(value, 300)
            ET.SubElement(instance, "dynamic_texts")
            ET.SubElement(instance, "texts_groups")

        route_records = resolve_routes(document)
        for route in route_records:
            endpoint1, endpoint2 = route["endpoints"]
            terminal1 = terminal_map[endpoint1]
            terminal2 = terminal_map[endpoint2]
            attrs = conductor_attributes(route["label"], COLOR_MAP.get(route["color"], "#000000"))
            attrs.update({
                "element1": str(terminal1["element_uuid"]),
                "element2": str(terminal2["element_uuid"]),
                "terminal1": str(terminal1["terminal_uuid"]),
                "terminal2": str(terminal2["terminal_uuid"]),
                "function": short(route["function"], 120),
                "cable": route["cable"],
            })
            conductor = ET.SubElement(conductors_node, "conductor", attrs)
            add_conductor_segments(conductor, terminal1, terminal2)
            ET.SubElement(conductor, "sequentialNumbers")
            add_visible_route_shapes(
                shapes_node,
                terminal1,
                terminal2,
                COLOR_MAP.get(route["color"], "#000000"),
            )
        self.route_count += len(route_records)

    def write(self) -> None:
        self.root.append(self.collection)
        ET.indent(self.root, space="    ")
        tree = ET.ElementTree(self.root)
        OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
        tree.write(PROJECT_PATH, encoding="UTF-8", xml_declaration=True)
        ELEMENT_ROOT.mkdir(parents=True, exist_ok=True)
        for name, definition in self.definitions.items():
            root = copy.deepcopy(definition)
            ET.indent(root, space="    ")
            ET.ElementTree(root).write(ELEMENT_ROOT / name, encoding="UTF-8", xml_declaration=True)


def conductor_attributes(number: str, color: str) -> dict[str, str]:
    return {
        "num": short(number, 100), "bus": "", "condsize": "3", "conductor_color": "",
        "x": "0", "y": "0", "freezeLabel": "false",
        "vertical-alignment": "AlignRight", "conductor_section": "", "function": "",
        "type": "multi", "vertirotatetext": "270", "tension_protocol": "",
        "dash-size": "1", "formula": "", "color2": "#000000", "displaytext": "1",
        "bicolor": "false", "horizontal-alignment": "AlignBottom", "onetextperfolio": "0",
        "numsize": "7", "text_color": "#000000", "cable": "", "horizrotatetext": "0",
        "color": color,
    }


def add_conductor_segments(conductor: ET.Element, terminal1: dict, terminal2: dict) -> None:
    """Write a visible orthogonal path instead of relying on QET auto-routing."""
    x1, y1 = float(terminal1["x"]), float(terminal1["y"])
    x2, y2 = float(terminal2["x"]), float(terminal2["y"])
    dx, dy = x2 - x1, y2 - y1
    if abs(dy) < 0.01:
        ET.SubElement(conductor, "segment", {"orientation": "horizontal", "length": f"{dx:g}"})
        return
    if abs(dx) < 0.01:
        ET.SubElement(conductor, "segment", {"orientation": "vertical", "length": f"{dy:g}"})
        return
    first = dx / 2
    ET.SubElement(conductor, "segment", {"orientation": "horizontal", "length": f"{first:g}"})
    ET.SubElement(conductor, "segment", {"orientation": "vertical", "length": f"{dy:g}"})
    ET.SubElement(conductor, "segment", {"orientation": "horizontal", "length": f"{dx - first:g}"})


def route_points(terminal1: dict, terminal2: dict) -> list[tuple[float, float]]:
    x1, y1 = float(terminal1["x"]), float(terminal1["y"])
    x2, y2 = float(terminal2["x"]), float(terminal2["y"])
    if abs(y2 - y1) < 0.01 or abs(x2 - x1) < 0.01:
        return [(x1, y1), (x2, y2)]
    mid_x = (x1 + x2) / 2
    return [(x1, y1), (mid_x, y1), (mid_x, y2), (x2, y2)]


def add_visible_route_shapes(shapes: ET.Element, terminal1: dict, terminal2: dict, color: str) -> None:
    """Add a visible underlay for QET/macOS fit-to-page conductor rendering.

    The native conductor remains the electrical/editable object at z=11.  These
    z=8 line shapes make the same orthogonal route visible when QET suppresses or
    hairlines conductors at low zoom.  They are generated and non-movable.
    """
    points = route_points(terminal1, terminal2)
    for (x1, y1), (x2, y2) in zip(points, points[1:]):
        shape = ET.SubElement(shapes, "shape", {
            "z": "8", "x1": f"{x1:g}", "y1": f"{y1:g}",
            "x2": f"{x2:g}", "y2": f"{y2:g}", "type": "Line",
            "closed": "0", "is_movable": "0",
        })
        ET.SubElement(shape, "pen", {"color": color, "widthF": "6", "style": "SolidLine"})
        ET.SubElement(shape, "brush", {"color": color, "style": "NoBrush"})


def document_blocks(document: dict) -> dict[str, Block]:
    endpoint_sides: dict[tuple[str, str], list[str]] = defaultdict(list)
    for connection in document.get("connections", []):
        for position, item in enumerate(connection):
            key = next(iter(item))
            if key not in document.get("connectors", {}):
                continue
            values = item[key] if isinstance(item[key], list) else [item[key]]
            side = "right" if position == 0 else "left"
            for value in values:
                endpoint_sides[(key, str(value))].append(side)

    blocks: dict[str, Block] = {}
    for key, connector in document.get("connectors", {}).items():
        pins = []
        raw_pins = connector.get("pins", [])
        labels = connector.get("pinlabels", [str(pin) for pin in raw_pins])
        colors = connector.get("pincolors", ["WH"] * len(raw_pins))
        for raw_pin, label, color in zip(raw_pins, labels, colors):
            pin_key = str(raw_pin)
            sides = endpoint_sides.get((key, pin_key), [])
            side = Counter(sides).most_common(1)[0][0] if sides else "right"
            if key == "IR_BOUNDARY":
                side = "left" if pin_key.startswith("F") else "right"
            pins.append(Pin(pin_key, str(label), str(color), side))
        blocks[key] = Block(
            key=key, title=str(connector.get("type", key)), notes=str(connector.get("notes", "")),
            title_color=str(connector.get("bgcolor_title", "LB")), pins=pins,
        )
    return blocks


def make_definition(block: Block, sheet_name: str) -> ET.Element:
    half = block.width / 2
    top = -block.height / 2
    definition = ET.Element("definition", {
        "version": QET_VERSION, "type": "element", "link_type": "simple",
        "width": str(block.width + 20), "height": str(block.height + 20),
        "hotspot_x": str((block.width + 20) // 2), "hotspot_y": str((block.height + 20) // 2),
    })
    ET.SubElement(definition, "uuid", {"uuid": q_uuid(f"definition:{sheet_name}:{block.key}")})
    names = ET.SubElement(definition, "names")
    ET.SubElement(names, "name", {"lang": "en"}).text = block.title
    ET.SubElement(definition, "informations").text = (
        "Generated from the MESAC retrofit crosswalks. PRELIMINARY - NOT RELEASED FOR WIRING."
    )
    description = ET.SubElement(definition, "description")
    border_color = COLOR_MAP.get(block.title_color, "#000000")
    ET.SubElement(description, "rect", {
        "x": str(-half), "y": str(top), "width": str(block.width), "height": str(block.height),
        "rx": "0", "ry": "0", "antialias": "false",
        "style": f"line-style:normal;line-weight:normal;filling:none;color:{border_color}",
    })
    ET.SubElement(description, "line", {
        "x1": str(-half), "y1": str(top + 26), "x2": str(half), "y2": str(top + 26),
        "end1": "none", "end2": "none", "length1": "1.5", "length2": "1.5",
        "style": f"line-style:normal;line-weight:normal;filling:none;color:{border_color}",
        "antialias": "false",
    })
    add_text(description, block.title, -half + 8, top + 18, size=8, color=border_color, bold=True)
    for index, pin in enumerate(block.pins):
        x, y, _orientation = terminal_geometry(block, index, pin.side)
        color = COLOR_MAP.get(pin.color, "#000000")
        label_x = -half + 8 if pin.side == "left" else 4
        label = f"{pin.key} | {pin.label}"
        add_text(description, label, label_x, y + 3, size=6, color=color)
        ET.SubElement(description, "terminal", {
            "uuid": q_uuid(f"terminal:{sheet_name}:{block.key}:{pin.key}"), "name": pin.key,
            "x": str(x), "y": str(y), "orientation": "w" if pin.side == "left" else "e",
            "type": "Generic",
        })
    return definition


def terminal_geometry(block: Block, index: int, side: str) -> tuple[float, float, int]:
    half = block.width / 2
    top = -block.height / 2
    row = index // 2 if block.key == "IR_BOUNDARY" else index
    y = top + 42 + row * 20
    if side == "left":
        return -half, y, 3
    return half, y, 1


def terminal_instance_geometry(x: float, y: float, orientation: int) -> tuple[float, float]:
    # Mirrors Terminal::init() in QElectroTech: instance terminal coordinates
    # identify dock_elmt_, four units inside the conductor docking position.
    if orientation == 0:  # north
        return x, y + 4
    if orientation == 1:  # east
        return x - 4, y
    if orientation == 2:  # south
        return x, y - 4
    if orientation == 3:  # west
        return x + 4, y
    raise ValueError(f"Invalid QET terminal orientation: {orientation}")


def layout_blocks(sheet_name: str, blocks: dict[str, Block]) -> dict[str, tuple[int, int]]:
    columns: dict[int, list[Block]] = defaultdict(list)
    for key, block in blocks.items():
        if sheet_name == "00_interface_overview":
            rank = {
                "BBIA_PLANE_A": 0, "CNA_PLANE_B": 0, "RELAY_BOUNDARY": 1,
                "MESA_7I84": 2, "MESA_7I49": 2, "LINUXCNC": 3,
            }.get(key, 1)
        elif key == "IR_BOUNDARY":
            rank = 1
        elif key.startswith("7i") or key == "HOLD_TERMINATION":
            rank = 2
        else:
            rank = 0
        columns[rank].append(block)

    x_by_rank = {0: 210, 1: 690, 2: 1170, 3: 1590}
    positions: dict[str, tuple[int, int]] = {}
    top_y, bottom_y = 85, 735
    for rank, column_blocks in columns.items():
        total = sum(block.height for block in column_blocks) + max(0, len(column_blocks) - 1) * 18
        scale = min(1.0, (bottom_y - top_y) / max(total, 1))
        y = top_y + max(0, (bottom_y - top_y - total * scale) / 2)
        for block in column_blocks:
            positions[block.key] = (x_by_rank[rank], round(y + block.height * scale / 2))
            y += block.height * scale + 18
    return positions


def expand_values(value: object) -> list[str]:
    if isinstance(value, list):
        return [str(item) for item in value]
    return [str(value)]


def resolve_routes(document: dict) -> list[dict]:
    connectors = document.get("connectors", {})
    cables = document.get("cables", {})
    endpoints: dict[tuple[str, str], list[tuple[str, str]]] = defaultdict(list)
    for connection in document.get("connections", []):
        for left, right in zip(connection, connection[1:]):
            left_key, right_key = next(iter(left)), next(iter(right))
            if left_key in connectors and right_key in cables:
                connector_key, cable_key = left_key, right_key
                connector_values, cable_values = expand_values(left[left_key]), expand_values(right[right_key])
            elif left_key in cables and right_key in connectors:
                cable_key, connector_key = left_key, right_key
                cable_values, connector_values = expand_values(left[left_key]), expand_values(right[right_key])
            else:
                continue
            if len(connector_values) != len(cable_values):
                raise ValueError(f"Mismatched connection widths in {connection!r}")
            for connector_pin, cable_pin in zip(connector_values, cable_values):
                endpoint = (connector_key, connector_pin)
                if endpoint not in endpoints[(cable_key, cable_pin)]:
                    endpoints[(cable_key, cable_pin)].append(endpoint)

    routes = []
    for (cable_key, cable_pin), ends in endpoints.items():
        if len(ends) != 2:
            raise ValueError(f"{cable_key} conductor {cable_pin} has {len(ends)} endpoints: {ends}")
        cable = cables[cable_key]
        index = int(cable_pin) - 1 if cable_pin.isdigit() else 0
        labels = cable.get("wirelabels", [])
        colors = cable.get("colors", [])
        label = str(labels[index]) if index < len(labels) else f"{cable_key}-{cable_pin}"
        color = str(colors[index]) if index < len(colors) else "WH"
        routes.append({
            "cable": cable_key, "label": label, "function": cable.get("type", cable_key),
            "color": color, "endpoints": (ends[0], ends[1]),
        })
    return routes


def build_sheets(wv) -> tuple[list[tuple[str, dict, dict]], Path, Path, int, int]:
    plane_a_path = wv.find_input(wv.PLANE_A_CANDIDATES)
    plane_b_path = wv.find_input(wv.PLANE_B_CANDIDATES)
    plane_a = wv.read_csv(plane_a_path)
    plane_b = wv.read_csv(plane_b_path)
    wv.validate_inputs(plane_a, plane_b)
    source_note = f"Inputs: {plane_a_path.relative_to(REPO_ROOT)} and {plane_b_path.relative_to(REPO_ROOT)}"
    sheets = [wv.build_overview(source_note)]
    active_a = [r for r in plane_a if r["disposition"] in wv.PLANE_A_ACTIVE_DISPOSITIONS]
    discrete = defaultdict(list)
    direct_a = []
    for row in active_a:
        if row["landing_status"] in wv.DIRECT_PLANE_A_STATUSES or row["mesa_card"] == "7i49":
            direct_a.append(row)
        else:
            discrete[row["oem_connector"]].append(row)
    for connector_name in sorted(discrete, key=lambda value: (len(value), value)):
        sheets.append(wv.build_plane_a_discrete(connector_name, discrete[connector_name], str(plane_a_path.relative_to(REPO_ROOT))))
    sheets.append(wv.build_direct_sheet(
        "plane_a_cn4_spindle_analog", "Plane A - CN4 FR-SX spindle analog reference",
        "CN4 SE1/SE2/SE3 to the 7i49 AOUT3 interface. Every role remains HOLD.",
        sorted(direct_a, key=lambda row: int(row["oem_pin"])), status_field="landing_status",
        source_pin_field="oem_pin", destination_pin_field="mesa_pin_channel",
        destination_signal_field="hal_net", source_note=f"Input: {plane_a_path.relative_to(REPO_ROOT)}; OEM 41434WB p127.",
    ))
    for axis, connector_name in (("X", "CNA3"), ("Y", "CNA4"), ("Z", "CNA5")):
        rows = [r for r in plane_b if r["signal_id"].startswith(f"{axis}_RES_")]
        sheets.append(wv.build_direct_sheet(
            f"plane_b_{axis.lower()}_resolver", f"Plane B - {axis}-axis resolver to Mesa 7i49",
            f"{connector_name} resolver windings, case-ground disposition, and three-pair drain requirement.",
            rows, status_field="route_status", source_pin_field="oem_pin", destination_pin_field="mesa_pin",
            destination_signal_field="mesa_signal",
            source_note=f"Input: {plane_b_path.relative_to(REPO_ROOT)}; OEM 41434WB p128; 7i49 manual.",
        ))
    command_rows = [r for r in plane_b if r["subsystem"] == "Axis velocity command"]
    sheets.append(wv.build_direct_sheet(
        "plane_b_axis_velocity_commands", "Plane B - X/Y/Z analog velocity commands",
        "7i49 AOUT0/AOUT1/AOUT2 endpoints are known; all retained DK-427 source connector pins remain TBD.",
        command_rows, status_field="route_status", source_pin_field="signal_id", destination_pin_field="mesa_pin",
        destination_signal_field="mesa_signal",
        source_note=f"Input: {plane_b_path.relative_to(REPO_ROOT)}; OEM command ends require continuity tracing.",
    ))
    cna10_rows = [r for r in plane_b if r["oem_connector"] == "CNA10"]
    sheets.append(wv.build_direct_sheet(
        "plane_b_cna10_legacy_load_display", "Plane B - CNA10 legacy load-display disposition",
        "Existing spindle/Z load display conductors are documented but have no Mesa allocation.", cna10_rows,
        status_field="route_status", source_pin_field="oem_pin", destination_pin_field="mesa_pin",
        destination_signal_field="mesa_signal",
        source_note=f"Input: {plane_b_path.relative_to(REPO_ROOT)}; OEM 41434WB p127.",
    ))
    return sheets, plane_a_path, plane_b_path, len(active_a), len(plane_b)


def validate_project(path: Path, expected_sheets: int) -> dict:
    root = ET.parse(path).getroot()
    diagrams = root.findall("diagram")
    if root.get("version") != QET_VERSION or len(diagrams) != expected_sheets:
        raise ValueError("QET project version or folio count is invalid")
    conductor_count = 0
    element_count = 0
    definitions = {
        f"embed://mesac_generated/{wrapper.get('name')}": {
            terminal.get("uuid")
            for terminal in wrapper.findall("./definition/description/terminal")
        }
        for wrapper in root.findall("./collection/category[@name='mesac_generated']/element")
    }
    for diagram in diagrams:
        terminals = {
            terminal.get("id")
            for element in diagram.findall("./elements/element")
            for terminal in element.findall("./terminals/terminal")
        }
        if len(terminals) != sum(1 for _ in diagram.findall("./elements/element/terminals/terminal")):
            raise ValueError(f"Duplicate terminal IDs on {diagram.get('title')}")
        elements = {element.get("uuid"): element for element in diagram.findall("./elements/element")}
        for conductor in diagram.findall("./conductors/conductor"):
            for suffix in ("1", "2"):
                element = elements.get(conductor.get(f"element{suffix}"))
                if element is None:
                    raise ValueError(f"Dangling conductor element on {diagram.get('title')}")
                valid_terminals = definitions.get(element.get("type"), set())
                if conductor.get(f"terminal{suffix}") not in valid_terminals:
                    raise ValueError(f"Dangling conductor terminal on {diagram.get('title')}")
            conductor_count += 1
        element_count += len(diagram.findall("./elements/element"))
    if not root.find("collection/category[@name='mesac_generated']"):
        raise ValueError("Embedded generated-element collection is missing")
    return {"folios": len(diagrams), "elements": element_count, "conductors": conductor_count}


def file_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    digest.update(path.read_bytes())
    return digest.hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--clean-elements", action="store_true", help="remove stale generated .elmt files before writing")
    args = parser.parse_args()
    wv = load_wireviz_generator()
    sheets, plane_a_path, plane_b_path, active_a, plane_b_count = build_sheets(wv)
    if args.clean_elements and ELEMENT_ROOT.exists():
        shutil.rmtree(ELEMENT_ROOT)
    project = QetProject()
    for name, document, stats in sheets:
        project.add_sheet(name, document, stats)
    project.write()
    validation = validate_project(PROJECT_PATH, len(sheets))
    manifest = {
        "generated_by": "scripts/generate_qelectrotech_project.py",
        "qelectrotech_target": QET_VERSION,
        "project": PROJECT_PATH.name,
        "project_sha256": file_sha256(PROJECT_PATH),
        "inputs": [str(plane_a_path.relative_to(REPO_ROOT)), str(plane_b_path.relative_to(REPO_ROOT))],
        "plane_a_diagrammed_routes": active_a,
        "plane_b_rows": plane_b_count,
        **validation,
    }
    (OUTPUT_ROOT / "manifest.json").write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(f"Generated {validation['folios']} QElectroTech folios, {validation['elements']} elements, "
          f"and {validation['conductors']} native conductors: {PROJECT_PATH}")


if __name__ == "__main__":
    main()
