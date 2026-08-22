#!/usr/bin/env python3
"""Create an Excel-readable MESAC wiring crosswalk workbook.

This uses only the Python standard library so it can run in the retrofit repo
without adding a spreadsheet dependency.  The workbook is intentionally data
first: the CSV crosswalks remain the source of truth and every diagram sheet
has a local hyperlink to its compact WireViz SVG/PNG rendering.
"""

from __future__ import annotations

import csv
import html
import re
import zipfile
from collections import Counter
from pathlib import Path
from xml.etree import ElementTree as ET


ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "wiring" / "MESAC_Wiring_Crosswalk.xlsx"
NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
R_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
PKG_REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships"
ET.register_namespace("", NS)
ET.register_namespace("r", R_NS)


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


def esc(value: object) -> str:
    return html.escape("" if value is None else str(value), quote=False)


def col_letter(n: int) -> str:
    result = ""
    while n:
        n, rem = divmod(n - 1, 26)
        result = chr(65 + rem) + result
    return result


def cell_ref(row: int, col: int) -> str:
    return f"{col_letter(col)}{row}"


def make_cell(row: int, col: int, value: object, style: int = 0) -> str:
    ref = cell_ref(row, col)
    text = esc(value)
    style_attr = f' s="{style}"' if style else ""
    return f'<c r="{ref}" t="inlineStr"{style_attr}><is><t xml:space="preserve">{text}</t></is></c>'


def make_sheet(rows: list[list[object]], widths: list[float], *, freeze: str = "A2", hyperlinks: dict[str, str] | None = None) -> tuple[str, str]:
    hyperlinks = hyperlinks or {}
    max_col = max((len(r) for r in rows), default=1)
    max_row = max(len(rows), 1)
    dim = f"A1:{cell_ref(max_row, max_col)}"
    xml = [f'<worksheet xmlns="{NS}" xmlns:r="{R_NS}">', f'<dimension ref="{dim}"/>', '<sheetViews><sheetView workbookViewId="0" showGridLines="0">']
    if freeze:
        m = re.match(r"([A-Z]+)(\d+)", freeze)
        row = int(m.group(2)) - 1 if m else 1
        xml.append(f'<pane ySplit="{row}" topLeftCell="{freeze}" activePane="bottomLeft" state="frozen"/>')
    xml.append('</sheetView></sheetViews>')
    xml.append('<cols>')
    for i, width in enumerate(widths, 1):
        xml.append(f'<col min="{i}" max="{i}" width="{width}" customWidth="1"/>')
    xml.append('</cols><sheetData>')
    for r_idx, row_values in enumerate(rows, 1):
        xml.append(f'<row r="{r_idx}">')
        for c_idx, value in enumerate(row_values, 1):
            style = 1 if r_idx == 1 else (2 if c_idx == 1 and len(rows) > 1 else 0)
            xml.append(make_cell(r_idx, c_idx, value, style))
        xml.append('</row>')
    xml.append('</sheetData>')
    if rows and len(rows[0]) > 0:
        xml.append(f'<autoFilter ref="A1:{cell_ref(max_row, len(rows[0]))}"/>')
    rels = []
    if hyperlinks:
        xml.append('<hyperlinks>')
        for idx, (ref, target) in enumerate(hyperlinks.items(), 1):
            xml.append(f'<hyperlink ref="{ref}" r:id="rId{idx}"/>')
            rels.append(f'<Relationship Id="rId{idx}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="{html.escape(target, quote=True)}" TargetMode="External"/>')
        xml.append('</hyperlinks>')
    xml.append('</worksheet>')
    rel_xml = f'<Relationships xmlns="{PKG_REL_NS}">' + ''.join(rels) + '</Relationships>' if rels else ''
    return ''.join(xml), rel_xml


def rows_from_records(records: list[dict[str, str]], fields: list[str]) -> list[list[str]]:
    return [fields] + [[r.get(field, "") for field in fields] for r in records]


def build_workbook() -> None:
    plane_a = read_csv(ROOT / "wiring" / "plane_a_bbia1_pin_crosswalk.csv")
    plane_b = read_csv(ROOT / "wiring" / "plane_b_pin_crosswalk.csv")
    source_dest = read_csv(ROOT / "wiring" / "bbia1_source_dest.csv")
    pinouts = read_csv(ROOT / "wiring" / "bbia1_cn_pinouts.csv")
    dest = read_csv(ROOT / "wiring" / "bbia1_retrofit_destination_crosswalk.csv")
    manifest_path = ROOT / "diagrams" / "wireviz" / "manifest.json"
    import json
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))

    sheets: list[tuple[str, list[list[object]], list[float], dict[str, str]]] = []
    summary = [
        ["MESAC VQC2040 LinuxCNC Retrofit Wiring Crosswalk", ""],
        ["Purpose", "Excel-readable index of the Plane A BBIA-1 and Plane B NC connector wiring routes."],
        ["Source of truth", "wiring/plane_a_bbia1_pin_crosswalk.csv and wiring/plane_b_pin_crosswalk.csv"],
        ["Diagram source", "diagrams/wireviz/src/*.yml; compact SVG/PNG renderings are linked in Diagram Index."],
        ["Plane A rows", len(plane_a)],
        ["Plane A routed rows", sum(1 for r in plane_a if r.get("mesa_card") not in ("", "none", "None"))],
        ["Plane B rows", len(plane_b)],
        ["Plane B diagrammed rows", manifest.get("plane_b_diagrammed_rows", "")],
        ["Review note", "This workbook organizes the current crosswalk; it does not promote HOLD or field-verification rows."],
    ]
    sheets.append(("Overview", summary, [30, 110], {}))

    pa_fields = list(plane_a[0].keys()) if plane_a else []
    pb_fields = list(plane_b[0].keys()) if plane_b else []
    sheets.append(("Plane A Crosswalk", rows_from_records(plane_a, pa_fields), [12, 24, 14, 10, 14, 26, 30, 16, 16, 22, 14, 14, 18, 28, 28, 24, 70], {}))
    sheets.append(("Plane B Crosswalk", rows_from_records(plane_b, pb_fields), [12, 24, 22, 14, 10, 28, 14, 14, 12, 12, 28, 26, 70, 80], {}))
    if source_dest:
        f = list(source_dest[0].keys())
        sheets.append(("BBIA Source Dest", rows_from_records(source_dest, f), [24, 16, 14, 16, 28, 60], {}))
    if pinouts:
        f = list(pinouts[0].keys())
        sheets.append(("BBIA Pinouts", rows_from_records(pinouts, f), [18, 14, 14, 24, 24, 60], {}))
    if dest:
        f = list(dest[0].keys())
        sheets.append(("BBIA Destinations", rows_from_records(dest, f), [18, 18, 18, 24, 28, 22, 28, 70], {}))

    # Visio's Create Diagram from Data wizard works best with a simple,
    # normalized table: one row per connection and stable IDs for each end.
    visio_fields = ["ID", "From", "To", "From Label", "To Label", "Wire", "Signal", "Status", "Subsystem", "Diagram"]
    visio_rows = [visio_fields]
    for idx, row in enumerate(plane_a, 1):
        visio_rows.append([
            f"A-{idx:03d}",
            f"{row.get('oem_connector','')} pin {row.get('oem_pin','')}",
            f"{row.get('mesa_connector','')} {row.get('mesa_pin_channel','')}",
            row.get('oem_signal') or row.get('factory_wire') or "OEM endpoint",
            row.get('hal_net') or row.get('mesa_card') or "Mesa endpoint",
            row.get('factory_wire', ""), row.get('signal_id') or row.get('oem_signal', ""),
            row.get('authority_status', ""), row.get('function', "Plane A"), "Plane A",
        ])
    for idx, row in enumerate(plane_b, 1):
        visio_rows.append([
            f"B-{idx:03d}",
            f"{row.get('oem_connector','')} pin {row.get('oem_pin','')}",
            f"{row.get('mesa_connector','')} pin {row.get('mesa_pin','')}",
            row.get('oem_signal') or row.get('oem_lead') or "OEM endpoint",
            row.get('mesa_signal') or row.get('mesa_card') or "Mesa endpoint",
            row.get('oem_lead', ""), row.get('signal_id') or row.get('oem_signal', ""),
            row.get('route_status', ""), row.get('subsystem', "Plane B"), "Plane B",
        ])
    sheets.append(("Visio Import", visio_rows, [12, 28, 28, 30, 30, 14, 28, 30, 28, 14], {}))

    diagram_rows = [["Sheet", "Routes", "Source YAML", "PNG", "SVG", "Graphviz GV"]]
    links: dict[str, str] = {}
    for idx, item in enumerate(manifest.get("sheets", []), 2):
        sheet_name = item.get("sheet", "")
        stem = Path(item.get("source_file", "")).stem
        if not stem:
            continue
        base = f"../diagrams/wireviz/rendered/{stem}"
        diagram_rows.append([sheet_name, item.get("routes", ""), item.get("source_file", ""), f"{stem}.png", f"{stem}.svg", f"{stem}.gv"])
        links[f"D{idx}"] = base + ".png"
        links[f"E{idx}"] = base + ".svg"
        links[f"F{idx}"] = base + ".gv"
    sheets.append(("Diagram Index", diagram_rows, [46, 10, 42, 34, 34, 34], links))

    sheet_xml: list[str] = []
    sheet_rels: list[str] = []
    for name, rows, widths, links in sheets:
        xml, rel_xml = make_sheet(rows, widths, hyperlinks=links)
        sheet_xml.append(xml)
        sheet_rels.append(rel_xml)

    styles = f'''<styleSheet xmlns="{NS}"><fonts count="3"><font><sz val="10"/><name val="Aptos"/></font><font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Aptos"/></font><font><b/><sz val="10"/><color rgb="FF1F2937"/><name val="Aptos"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF1F4E78"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" applyFont="1" applyFill="1"/><xf numFmtId="0" fontId="2" fillId="0" borderId="0" applyFont="1"/></cellXfs></styleSheet>'''
    workbook = f'<workbook xmlns="{NS}" xmlns:r="{R_NS}"><sheets>' + ''.join(f'<sheet name="{html.escape(name, quote=True)}" sheetId="{i}" r:id="rId{i}"/>' for i, (name, *_rest) in enumerate(sheets, 1)) + '</sheets></workbook>'
    wb_rels = f'<Relationships xmlns="{PKG_REL_NS}">' + ''.join(f'<Relationship Id="rId{i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet{i}.xml"/>' for i in range(1, len(sheets) + 1)) + f'<Relationship Id="rId{len(sheets)+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'
    content = f'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' + ''.join(f'<Override PartName="/xl/worksheets/sheet{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' for i in range(1, len(sheets)+1)) + '</Types>'
    root_rels = f'<Relationships xmlns="{PKG_REL_NS}"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", content)
        z.writestr("_rels/.rels", root_rels)
        z.writestr("xl/workbook.xml", workbook)
        z.writestr("xl/_rels/workbook.xml.rels", wb_rels)
        z.writestr("xl/styles.xml", styles)
        for i, xml in enumerate(sheet_xml, 1):
            z.writestr(f"xl/worksheets/sheet{i}.xml", xml)
            if sheet_rels[i-1]:
                z.writestr(f"xl/worksheets/_rels/sheet{i}.xml.rels", sheet_rels[i-1])
    print(f"Created {OUT.relative_to(ROOT)} with {len(sheets)} sheets")


if __name__ == "__main__":
    build_workbook()
