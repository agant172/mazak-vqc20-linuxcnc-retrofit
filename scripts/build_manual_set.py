#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = [
#   "reportlab==4.4.3",
#   "pypdf==6.0.0",
# ]
# ///
"""Build the Mazak VQC-20/40 LinuxCNC retrofit Rev B manual set.

The authority CSV is the source for every physical channel table.  Narrative
content intentionally remains conservative: placeholders, unverified hardware,
and unsigned hold points are printed as blockers rather than converted into
commissioned facts.

Run from anywhere in the repository:

    uv run scripts/build_manual_set.py
    uv run scripts/build_manual_set.py --output tmp/pdfs/revB-draft
"""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import hashlib
import html
import json
import re
import subprocess
from collections import Counter
from pathlib import Path
from typing import Iterable, Sequence

from pypdf import PdfReader, PdfWriter
from reportlab.graphics.shapes import Drawing, Line, Polygon, Rect, String
from reportlab.lib import colors
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    Flowable,
    KeepTogether,
    LongTable,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


REPO = Path(__file__).resolve().parents[1]
AUTHORITY = REPO / "mesa" / "current_pin_authority.csv"
INI = REPO / "linuxcnc" / "mazak_vqc_20_40.ini"
HAL_MAIN = REPO / "linuxcnc" / "mazak_vqc_20_40.hal"
PROJECT_STATUS = REPO / "docs" / "project_status.md"

PAGE_W, PAGE_H = A4
NAVY = HexColor("#18324A")
BLUE = HexColor("#315C7A")
GREEN = HexColor("#2D6A4F")
AMBER = HexColor("#9A6700")
RED = HexColor("#A32121")
DARK_RED = HexColor("#721C24")
LIGHT_BLUE = HexColor("#EAF2F8")
LIGHT_GREEN = HexColor("#EAF4EE")
LIGHT_AMBER = HexColor("#FFF4CE")
LIGHT_RED = HexColor("#FBE9E7")
LIGHT_GREY = HexColor("#F2F4F5")
MID_GREY = HexColor("#C7CDD1")
TEXT = HexColor("#1D252C")

REVISION = "B"
GEN_DATE = dt.date.today().isoformat()


def ascii_text(value: object) -> str:
    """Normalize source text for built-in PDF fonts and ASCII-safe dashes."""
    text = "" if value is None else str(value)
    replacements = {
        "\u2010": "-", "\u2011": "-", "\u2012": "-", "\u2013": "-", "\u2014": "-",
        "\u2212": "-", "\u00b1": "+/-", "\u00d7": "x", "\u2192": "->",
        "\u2190": "<-", "\u2194": "<->", "\u2264": "<=", "\u2265": ">=",
        "\u2248": "~", "\u2026": "...", "\u2018": "'", "\u2019": "'",
        "\u201c": '"', "\u201d": '"', "\u00a0": " ", "\u00b0": " deg ",
        "\u00b5": "u", "\u03a9": "ohm", "\u00a7": "Section ",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return "".join(ch if 32 <= ord(ch) < 127 or ch in "\n\t" else "?" for ch in text)


def esc(value: object) -> str:
    return html.escape(ascii_text(value), quote=False)


STYLES = getSampleStyleSheet()
TITLE = ParagraphStyle(
    "ManualTitle", parent=STYLES["Title"], fontName="Helvetica-Bold",
    fontSize=25, leading=29, textColor=NAVY, alignment=TA_LEFT, spaceAfter=10,
)
SUBTITLE = ParagraphStyle(
    "ManualSubtitle", parent=STYLES["Normal"], fontName="Helvetica",
    fontSize=11, leading=15, textColor=BLUE, spaceAfter=12,
)
H1 = ParagraphStyle(
    "ManualH1", parent=STYLES["Heading1"], fontName="Helvetica-Bold",
    fontSize=16, leading=19, textColor=NAVY, spaceBefore=11, spaceAfter=7,
    keepWithNext=True,
)
H2 = ParagraphStyle(
    "ManualH2", parent=STYLES["Heading2"], fontName="Helvetica-Bold",
    fontSize=12, leading=15, textColor=BLUE, spaceBefore=8, spaceAfter=5,
    keepWithNext=True,
)
BODY = ParagraphStyle(
    "ManualBody", parent=STYLES["BodyText"], fontName="Helvetica",
    fontSize=8.7, leading=12.2, textColor=TEXT, spaceAfter=5,
)
SMALL = ParagraphStyle(
    "ManualSmall", parent=BODY, fontSize=7.2, leading=9.4, spaceAfter=2,
)
TINY = ParagraphStyle(
    "ManualTiny", parent=BODY, fontSize=6.2, leading=7.5, spaceAfter=0,
)
TABLE_HEADER_SMALL = ParagraphStyle(
    "TableHeaderSmall", parent=SMALL, fontName="Helvetica-Bold",
    textColor=colors.white,
)
TABLE_HEADER_TINY = ParagraphStyle(
    "TableHeaderTiny", parent=TINY, fontName="Helvetica-Bold",
    textColor=colors.white,
)
CAPTION = ParagraphStyle(
    "ManualCaption", parent=SMALL, fontName="Helvetica-Oblique",
    textColor=HexColor("#4B5560"), alignment=TA_CENTER, spaceBefore=3, spaceAfter=7,
)
COVER_META = ParagraphStyle(
    "CoverMeta", parent=BODY, fontName="Helvetica-Bold", fontSize=9,
    leading=13, textColor=NAVY, spaceAfter=3,
)
BOX_TEXT = ParagraphStyle(
    "BoxText", parent=BODY, fontSize=8.3, leading=11.2, spaceAfter=0,
)


def P(text: str, style: ParagraphStyle = BODY) -> Paragraph:
    return Paragraph(esc(text).replace("\n", "<br/>"), style)


def M(text: str, style: ParagraphStyle = BODY) -> Paragraph:
    """Paragraph where the caller supplies minimal safe ReportLab markup."""
    return Paragraph(ascii_text(text), style)


def h1(text: str) -> Paragraph:
    return P(text, H1)


def h2(text: str) -> Paragraph:
    return P(text, H2)


def bullets(items: Iterable[str], level: int = 0) -> list[Paragraph]:
    style = ParagraphStyle(
        f"Bullet{level}", parent=BODY, leftIndent=12 + level * 10,
        firstLineIndent=-7, bulletIndent=2 + level * 10, spaceAfter=3,
    )
    return [Paragraph("&bull; " + esc(item), style) for item in items]


def callout(title: str, text: str, kind: str = "warning") -> Table:
    palette = {
        "critical": (DARK_RED, LIGHT_RED),
        "warning": (AMBER, LIGHT_AMBER),
        "info": (BLUE, LIGHT_BLUE),
        "ok": (GREEN, LIGHT_GREEN),
    }
    edge, fill = palette[kind]
    content = M(f"<b>{esc(title)}</b><br/>{esc(text)}", BOX_TEXT)
    box = Table([[content]], colWidths=[PAGE_W - 36 * mm])
    box.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), fill),
        ("BOX", (0, 0), (-1, -1), 1.2, edge),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    return box


STATUS_COLORS = {
    "COMMISSIONED": LIGHT_GREEN,
    "HAL_VERIFIED": LIGHT_GREEN,
    "ELECTRICALLY_VERIFIED": LIGHT_GREEN,
    "TRACED": LIGHT_BLUE,
    "PROPOSED": LIGHT_AMBER,
    "COMMISSIONING_PENDING": LIGHT_AMBER,
    "HOLD_CONFLICT": LIGHT_RED,
    "UNBOUND": LIGHT_RED,
    "DEFERRED": LIGHT_GREY,
    "OPTIONAL_VERIFY": LIGHT_GREY,
    "SPARE": colors.white,
}


def data_table(
    rows: Sequence[Sequence[object]],
    widths: Sequence[float],
    *,
    font_size: float = 7.1,
    repeat_rows: int = 1,
    status_column: int | None = None,
    landscape_mode: bool = False,
) -> LongTable:
    body_style = TINY if font_size <= 6.3 else SMALL
    header_style = TABLE_HEADER_TINY if font_size <= 6.3 else TABLE_HEADER_SMALL
    wrapped = [
        [P(str(cell), header_style if row_number == 0 else body_style) for cell in row]
        for row_number, row in enumerate(rows)
    ]
    tab = LongTable(wrapped, colWidths=list(widths), repeatRows=repeat_rows, splitByRow=1)
    commands: list[tuple] = [
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.35, MID_GREY),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 3),
        ("RIGHTPADDING", (0, 0), (-1, -1), 3),
        ("TOPPADDING", (0, 0), (-1, -1), 2.5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2.5),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, HexColor("#FAFBFC")]),
    ]
    if status_column is not None:
        for row_num, row in enumerate(rows[1:], start=1):
            status = ascii_text(row[status_column])
            commands.append(("BACKGROUND", (status_column, row_num), (status_column, row_num), STATUS_COLORS.get(status, colors.white)))
    tab.setStyle(TableStyle(commands))
    return tab


def source_commit() -> str:
    try:
        value = subprocess.check_output(
            ["git", "rev-parse", "--short=12", "HEAD"], cwd=REPO, text=True
        ).strip()
        dirty = subprocess.run(
            ["git", "diff", "--quiet"], cwd=REPO, check=False
        ).returncode != 0
        return value + ("-dirty" if dirty else "")
    except Exception:
        return "UNKNOWN"


def read_authority() -> list[dict[str, str]]:
    with AUTHORITY.open(newline="", encoding="utf-8") as stream:
        rows = list(csv.DictReader(stream))
    required = {
        "signal_id", "subsystem", "direction", "mesa_card", "connector",
        "pin_channel", "hal_net", "field_point_or_load", "authority_status",
        "primary_source", "cleanup_notes",
    }
    if set(rows[0]) != required:
        raise ValueError(f"Unexpected authority schema: {set(rows[0])}")
    return rows


def ini_value(section: str, key: str, default: str = "UNSET") -> str:
    current = ""
    for raw in INI.read_text(encoding="utf-8").splitlines():
        line = raw.split("#", 1)[0].strip()
        if not line:
            continue
        if line.startswith("[") and line.endswith("]"):
            current = line[1:-1].strip()
            continue
        if current == section and "=" in line:
            name, value = line.split("=", 1)
            if name.strip() == key:
                return value.strip()
    return default


def project_statuses() -> list[tuple[str, str, str]]:
    text = PROJECT_STATUS.read_text(encoding="utf-8")
    found = re.findall(r"\|\s*(D\d+)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|", text)
    return [(a.strip(), b.strip(), c.strip()) for a, b, c in found]


class ManualDocTemplate(SimpleDocTemplate):
    def __init__(self, *args, volume: int, doc_number: str, source_ref: str, **kwargs):
        self.volume = volume
        self.doc_number = doc_number
        self.source_ref = source_ref
        self._outline_index = 0
        super().__init__(*args, **kwargs)

    def afterFlowable(self, flowable: Flowable) -> None:
        if not isinstance(flowable, Paragraph):
            return
        if flowable.style.name not in {H1.name, H2.name}:
            return
        level = 0 if flowable.style.name == H1.name else 1
        title = flowable.getPlainText()
        key = f"v{self.volume}-{self._outline_index}"
        self._outline_index += 1
        self.canv.bookmarkPage(key)
        self.canv.addOutlineEntry(title, key, level=level, closed=False)


def draw_page(canvas, doc: ManualDocTemplate) -> None:
    canvas.saveState()
    if doc.page > 1:
        canvas.setStrokeColor(MID_GREY)
        canvas.setLineWidth(0.5)
        canvas.line(18 * mm, PAGE_H - 14 * mm, PAGE_W - 18 * mm, PAGE_H - 14 * mm)
        canvas.setFont("Helvetica-Bold", 7.2)
        canvas.setFillColor(NAVY)
        canvas.drawString(18 * mm, PAGE_H - 10.5 * mm, f"MZK-LCNC-{doc.volume:03d}  Rev {REVISION}")
        canvas.setFont("Helvetica", 7.2)
        canvas.setFillColor(HexColor("#59636C"))
        canvas.drawRightString(PAGE_W - 18 * mm, PAGE_H - 10.5 * mm, "Mazak VQC-20/40 SN 060231 - LinuxCNC retrofit")
    canvas.setStrokeColor(MID_GREY)
    canvas.line(18 * mm, 12 * mm, PAGE_W - 18 * mm, 12 * mm)
    canvas.setFont("Helvetica", 6.5)
    canvas.setFillColor(HexColor("#59636C"))
    canvas.drawString(18 * mm, 8.5 * mm, f"Generated {GEN_DATE}")
    canvas.drawCentredString(PAGE_W / 2, 8.5 * mm, "PLANNING / COMMISSIONING - NOT AS-BUILT")
    canvas.drawRightString(PAGE_W - 18 * mm, 8.5 * mm, f"Source {doc.source_ref[:16]}  |  Page {doc.page}")
    canvas.restoreState()


VOLUME_INFO = [
    (0, "Master Guide and Table of Contents", "MZK-LCNC-000", "Vol0_Master_Guide_and_TOC.pdf"),
    (1, "Overview and Safety", "MZK-LCNC-001", "Vol1_Overview_and_Safety.pdf"),
    (2, "Operation Manual", "MZK-LCNC-002", "Vol2_Operation_Manual.pdf"),
    (3, "Mesa Conversion and Installation", "MZK-LCNC-003", "Vol3_Mesa_Conversion_Manual.pdf"),
    (4, "Wiring Diagrams and I/O Reference", "MZK-LCNC-004", "Vol4_Wiring_Diagrams_and_IO_Reference.pdf"),
    (5, "Maintenance and Troubleshooting", "MZK-LCNC-005", "Vol5_Maintenance_and_Troubleshooting.pdf"),
    (6, "Reference, Glossary, and Index", "MZK-LCNC-006", "Vol6_Reference_Glossary_Index.pdf"),
]


def cover(volume: int, title: str, doc_number: str, source_ref: str) -> list[Flowable]:
    story: list[Flowable] = [Spacer(1, 25 * mm)]
    story.append(P(f"VOLUME {volume}", ParagraphStyle("CoverVolume", parent=SUBTITLE, fontSize=12, textColor=GREEN, spaceAfter=6)))
    story.append(P(title, TITLE))
    story.append(P("Mazak VQC-20/40 SN 060231 - LinuxCNC/Mesa Retrofit", SUBTITLE))
    band = Table([[P("REVISION B - CONSOLIDATED FROM LIVE AUTHORITY", ParagraphStyle("Band", parent=COVER_META, alignment=TA_CENTER, textColor=colors.white))]], colWidths=[PAGE_W - 36 * mm])
    band.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), NAVY),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.extend([band, Spacer(1, 10 * mm)])
    meta = [
        ["Document", doc_number],
        ["Revision", REVISION],
        ["Generated", GEN_DATE],
        ["Source commit", source_ref],
        ["Machine", "Mazak VQC-20/40, serial 060231"],
        ["Original control", "Mazatrol M-2 / MELDAS"],
        ["Target control", "LinuxCNC 2.9.10, Debian 13 PREEMPT_RT"],
    ]
    story.append(data_table([["Field", "Value"], *meta], [42 * mm, 118 * mm], font_size=8))
    story.extend([Spacer(1, 9 * mm), callout(
        "STATUS - NOT READY FOR POWER OR MOTION",
        "The repository is still at planning/bring-up stage. No live-power hold point is signed. Authority rows marked PROPOSED, COMMISSIONING_PENDING, HOLD_CONFLICT, or UNBOUND are not as-built evidence. The hardwired E-stop chain, resolver suffixes/scales, bitfile, analog polarity/scaling, field normal states, shared-bus behavior, and spindle terminals remain to be proven.",
        "critical",
    )])
    story.extend([Spacer(1, 11 * mm), P("This volume replaces Rev A. Rev A must not be used for wiring, commissioning, or service.", COVER_META), PageBreak()])
    return story


def add_section(story: list[Flowable], title: str, paragraphs: Sequence[str] = (), items: Sequence[str] = ()) -> None:
    story.append(h1(title))
    story.extend(P(p) for p in paragraphs)
    story.extend(bullets(items))


def box(d: Drawing, x: float, y: float, w: float, h: float, label: str, fill: colors.Color, size: float = 8) -> None:
    d.add(Rect(x, y, w, h, rx=4, ry=4, strokeColor=fill, fillColor=colors.Color(fill.red, fill.green, fill.blue, alpha=0.10), strokeWidth=1.2))
    lines = ascii_text(label).split("\n")
    for idx, line in enumerate(lines):
        d.add(String(x + w / 2, y + h / 2 + (len(lines) - 1 - 2 * idx) * 5, line, textAnchor="middle", fontName="Helvetica-Bold" if idx == 0 else "Helvetica", fontSize=size if idx == 0 else max(size - 1, 6), fillColor=TEXT))


def arrow(d: Drawing, x1: float, y1: float, x2: float, y2: float, color: colors.Color = BLUE, dashed: bool = False) -> None:
    d.add(Line(x1, y1, x2, y2, strokeColor=color, strokeWidth=1.3, strokeDashArray=[4, 3] if dashed else None))
    angle = 4
    d.add(Polygon([x2, y2, x2 - 7, y2 + angle, x2 - 7, y2 - angle], fillColor=color, strokeColor=color))


def architecture_diagram() -> Drawing:
    d = Drawing(500, 250)
    box(d, 10, 175, 100, 48, "LinuxCNC PC\nhm2_eth", NAVY)
    box(d, 155, 165, 120, 68, "Mesa 7i80HDT\nP1 / P2 / P3", GREEN)
    box(d, 325, 190, 95, 45, "7i44 on P3\nRS-422", GREEN)
    box(d, 325, 115, 95, 45, "7i49 on P1\nresolver + analog", AMBER)
    box(d, 325, 40, 95, 42, "P3 EMPTY\n3.3 V bare GPIO", RED)
    box(d, 445, 195, 50, 35, "7i84U-A\nch 0", GREEN, 7)
    box(d, 445, 150, 50, 35, "7i84U-B\nch 1", GREEN, 7)
    box(d, 445, 85, 50, 35, "TRA drives\nX / Z / Y", BLUE, 7)
    box(d, 445, 40, 50, 35, "TS2014N\nX / Y / Z", AMBER, 7)
    arrow(d, 110, 199, 155, 199)
    arrow(d, 275, 208, 325, 212)
    arrow(d, 420, 212, 445, 212)
    arrow(d, 420, 205, 445, 168)
    arrow(d, 275, 180, 325, 137)
    arrow(d, 420, 137, 445, 102)
    arrow(d, 420, 128, 445, 57)
    d.add(String(132, 207, "100BaseT", fontName="Helvetica", fontSize=7, fillColor=BLUE))
    d.add(String(280, 215, "P1 ribbon", fontName="Helvetica", fontSize=7, fillColor=TEXT))
    d.add(String(278, 152, "P2 ribbon", fontName="Helvetica", fontSize=7, fillColor=TEXT))
    d.add(String(15, 20, "Only the 7i49 carries motion feedback and analog commands. Field I/O is isolated through two 7i84Us. P3 has no field wiring.", fontName="Helvetica-Bold", fontSize=7.2, fillColor=DARK_RED))
    return d


def drive_diagram() -> Drawing:
    d = Drawing(500, 190)
    box(d, 10, 115, 105, 48, "LinuxCNC PID\nouter position loop", NAVY)
    box(d, 170, 115, 105, 48, "7i49 AOUT\nA0=X A1=Z A2=Y", AMBER)
    box(d, 330, 115, 105, 48, "MELDAS TRA\ninner velocity loop", BLUE)
    box(d, 330, 35, 105, 42, "Motor + tacho\nretained", BLUE)
    box(d, 10, 35, 105, 42, "TS2014N resolver\nRES0=X RES1=Y RES2=Z", AMBER, 7)
    arrow(d, 115, 139, 170, 139)
    arrow(d, 275, 139, 330, 139)
    arrow(d, 382, 115, 382, 77)
    arrow(d, 330, 56, 115, 56)
    arrow(d, 115, 56, 60, 115)
    d.add(String(123, 147, "velocity command", fontSize=7, fillColor=TEXT))
    d.add(String(125, 63, "mechanical motion", fontSize=7, fillColor=TEXT))
    d.add(String(120, 87, "position feedback", fontSize=7, fillColor=TEXT))
    d.add(String(333, 94, "S-ON from 7i84U-B", fontName="Helvetica-Bold", fontSize=7, fillColor=RED))
    arrow(d, 382, 101, 382, 115, RED, dashed=True)
    return d


def resolver_diagram() -> Drawing:
    d = Drawing(500, 190)
    box(d, 20, 45, 145, 105, "7i49 channel\nRESDRV +/-\nRESSIN +/-\nRESCOS +/-", AMBER)
    box(d, 335, 45, 145, 105, "TS2014N resolver\nexcitation pair\nSIN pair\nCOS pair", AMBER)
    arrow(d, 165, 120, 335, 120, AMBER)
    arrow(d, 335, 90, 165, 90, GREEN)
    arrow(d, 335, 62, 165, 62, GREEN)
    d.add(String(205, 128, "sole excitation source", fontName="Helvetica-Bold", fontSize=7, fillColor=AMBER))
    d.add(String(225, 98, "SIN return", fontSize=7, fillColor=GREEN))
    d.add(String(225, 70, "COS return", fontSize=7, fillColor=GREEN))
    d.add(String(35, 20, "Three individually shielded twisted pairs per axis; shields terminate at the 7i49 end only. Identify windings by resistance before power.", fontName="Helvetica-Bold", fontSize=7, fillColor=DARK_RED))
    return d


def spindle_diagram() -> Drawing:
    d = Drawing(500, 220)
    box(d, 15, 145, 120, 50, "LinuxCNC spindle\ncommand + orient state", NAVY)
    box(d, 190, 145, 120, 50, "7i49 AOUT3\nanalog speed", AMBER)
    box(d, 365, 145, 120, 50, "FR-SX\nexact model TBD", BLUE)
    box(d, 190, 60, 120, 55, "7i84U-A\nFWD REV RUN ORCM1", GREEN)
    box(d, 365, 55, 120, 60, "7i84U-A inputs\nORA1 SZS speed fault", GREEN, 7)
    arrow(d, 135, 170, 190, 170)
    arrow(d, 310, 170, 365, 170)
    arrow(d, 135, 155, 190, 88)
    arrow(d, 310, 88, 365, 160)
    arrow(d, 365, 82, 310, 82, GREEN)
    d.add(String(25, 25, "Orient position is not an analog reference. ORCM1 is a discrete command; the machine sensor and drive parameters define the target.", fontName="Helvetica-Bold", fontSize=7, fillColor=DARK_RED))
    return d


def estop_diagram() -> Drawing:
    d = Drawing(500, 220)
    labels = ["E-stop\nbuttons", "guards /\nlimits", "safety relay\nMAR chain", "main contactor\n+ enables", "hazardous\npower"]
    xs = [10, 105, 205, 315, 420]
    for x, label in zip(xs, labels):
        box(d, x, 130, 75, 45, label, RED, 7)
    for a, b in zip(xs, xs[1:]):
        arrow(d, a + 75, 152, b, 152, RED)
    box(d, 185, 35, 130, 50, "7i84U-A IN29\nestop-monitor only", GREEN)
    arrow(d, 242, 130, 250, 85, GREEN, dashed=True)
    d.add(String(80, 103, "Primary stop path is hardware", fontName="Helvetica-Bold", fontSize=8, fillColor=RED))
    d.add(String(325, 54, "LinuxCNC inhibit / indication", fontName="Helvetica", fontSize=7, fillColor=GREEN))
    d.add(String(10, 15, "The as-built hardware chain and fault-injection matrix are incomplete. No SIL/PL or stop-category claim is made.", fontName="Helvetica-Bold", fontSize=7, fillColor=DARK_RED))
    return d


def caption(text: str) -> Paragraph:
    return P(text, CAPTION)


def volume0(rows: list[dict[str, str]], source_ref: str) -> list[Flowable]:
    story = cover(0, VOLUME_INFO[0][1], VOLUME_INFO[0][2], source_ref)
    story.append(h1("1. Revision B release position"))
    story.append(callout(
        "REV B SUPERSEDES REV A",
        "Rev A used a 7i97T-centered design, one 7i84U, incorrect resolver identifiers, retired evidence states, and an unsafe 7i84U TB1 polarity map. Rev B is rebuilt from the live 7i80HDT/7i44/7i49/two-7i84U authority and must be used in its place.",
        "critical",
    ))
    changes = [
        ["Area", "Rev B consolidated position"],
        ["Host", "Mesa 7i80HDT over hm2_eth at 10.10.10.121"],
        ["P1", "7i44; physical channels 0/1 to 7i84U-A/B"],
        ["P2", "Plain 7i49; RES0/1/2 and AOUT0/1/2/3"],
        ["P3", "Empty; no bare 3.3 V GPIO field wiring"],
        ["Field I/O", "Two 7i84Us; 43 DI / 25 DO allocated, 21 DI / 7 DO reserve"],
        ["7i84U TB1", "1/2 VFIELDB, 3/4 VFIELDA, 5 VIN, 6/7/8 common"],
        ["Firmware", "Efinix resolver bitfile name/binary/provenance remain unverified"],
        ["Evidence", "Every physical channel prints its current authority_status"],
    ]
    story.append(data_table(changes, [38 * mm, 122 * mm], font_size=7.8))
    story.append(h1("2. Volume map"))
    volume_rows = [["Vol", "Document", "Title", "Primary audience"]]
    audiences = ["All users", "Owner / safety reviewer", "Qualified operator", "Integrator", "Electrician / integrator", "Maintenance", "All users"]
    for info, audience in zip(VOLUME_INFO, audiences):
        volume_rows.append([info[0], info[2], info[1], audience])
    story.append(data_table(volume_rows, [12 * mm, 35 * mm, 78 * mm, 35 * mm], font_size=7.5))
    story.append(h1("3. Master table of contents"))
    toc = [
        ["Volume", "Sections"],
        ["V0", "Revision position; volume map; source hierarchy; pre-power dashboard; document control"],
        ["V1", "Machine overview; retained/replaced systems; safety authority; LOTO; E-stop; DC bus; Z brake; hazards"],
        ["V2", "Applicability; control station; power-up; homing; jogging; spindle; ATC; G-code; auxiliaries; shutdown; alarms"],
        ["V3", "Architecture; hardware; Ethernet; firmware; resolver interface; field power; HAL/INI; staged bring-up; rejected designs"],
        ["V4", "Five wiring figures; 7i49; 7i44 links; both 7i84U TB1 maps; all 96 digital I/O terminals; conflicts; status legend"],
        ["V5", "Maintenance intervals; resolver/analog/network health; motion/spindle/ATC troubleshooting; rollback; records"],
        ["V6", "OEM manual library; project file map; external sources; glossary; superseded claims; alphabetical index"],
    ]
    story.append(data_table(toc, [18 * mm, 142 * mm], font_size=7.5))
    story.append(h1("4. Authority hierarchy"))
    story.extend(bullets([
        "Electrical channel authority: mesa/current_pin_authority.csv.",
        "Control logic and binding: linuxcnc/*.hal and mazak_vqc_20_40.ini must agree with the authority CSV.",
        "Narrative documents interpret the design but cannot override the CSV or HAL.",
        "These PDFs are release artifacts generated from the source commit printed on every page.",
        "OEM machine-side wiring remains governed by Mazak 41434WB and the verified as-built cabinet trace.",
    ]))
    counts = Counter(r["authority_status"] for r in rows)
    story.append(data_table(
        [["Authority status", "Rows"], *sorted(counts.items())],
        [85 * mm, 35 * mm], font_size=8, status_column=0,
    ))
    story.append(h1("5. Pre-power deliverable dashboard"))
    status_rows = [["ID", "Deliverable", "Planning state"], *project_statuses()]
    story.append(data_table(status_rows, [14 * mm, 98 * mm, 48 * mm], font_size=7.1))
    story.append(callout(
        "NO SIGNED HOLD POINTS",
        "D16 is not drafted. Control power, DC bus, amplifier enable, Z-brake release, spindle rotation, first motion, and automatic M6 remain blocked by their applicable D1-D15 prerequisites.",
        "critical",
    ))
    story.append(h1("6. Document control"))
    story.extend(bullets([
        "Stable filenames are retained for Volumes 0-6 so links do not drift.",
        "The combined file is revisioned: Mazak_VQC2040_Complete_Manual_RevB.pdf.",
        "manifest.json records SHA-256 and page count for every released PDF.",
        "Regenerate with: uv run scripts/build_manual_set.py.",
        "Run scripts/validate_authority.py and scripts/validate_control_logic.py before release.",
    ]))
    return story


def volume1(rows: list[dict[str, str]], source_ref: str) -> list[Flowable]:
    story = cover(1, VOLUME_INFO[1][1], VOLUME_INFO[1][2], source_ref)
    add_section(story, "1. Machine and retrofit scope", [
        "Machine: Mazak Vertical Quality Center VQC-20/40, serial 060231. Original control: Mazatrol M-2 / MELDAS. Shop supply is documented as 460 VAC three-phase into the retained machine transformer. The retrofit replaces the numerical-control and PLC interface functions while retaining the mechanical machine, Mitsubishi velocity-loop servo amplifiers, shared rectifier/capacitor bus, Tamagawa axis resolvers, FR-SX spindle drive, hydraulics, lubrication, coolant, and tool changer.",
        "The retained equipment is obsolete and machine-specific. Adjacent-family Mitsubishi manuals are evidence for survey planning, not proof of the installed part or terminal behavior.",
    ])
    story.append(data_table([
        ["Function", "Retained", "Replaced / added"],
        ["Motion power", "MELDAS HD/TRA amplifiers, motors, tach loops, shared DC bus", "LinuxCNC outer position loop and 7i49 analog commands"],
        ["Feedback", "Tamagawa TS2014N shaft resolvers", "7i49 excitation and resolver-to-digital conversion"],
        ["Spindle", "Mitsubishi FR-SX, motor, orient detector, gearbox", "7i49 AOUT3 plus 7i84U digital command/monitor"],
        ["Field I/O", "Switches, sensors, solenoids, relays", "Two Mesa 7i84Us via 7i44"],
        ["Safety", "OEM MAR/hardwired chain intended to remain primary", "LinuxCNC monitoring and supplemental inhibition only"],
    ], [35 * mm, 63 * mm, 62 * mm], font_size=7.2))
    add_section(story, "2. Safety authority", [
        "LinuxCNC, hm2_eth, the 7i80HDT, 7i44, and 7i84U are not claimed as safety-rated equipment. The personnel-protection path must remove hazardous power through verified hardware without depending on the PC, Ethernet, FPGA, smart-serial, HAL, or the next servo cycle.",
        "The checked-in estop-latch, watchdog, packet-error, drive-fault, and output-permit logic is a supplemental software inhibit. It cannot establish SIL, PL, stop category, guard integrity, or contactor redundancy.",
    ])
    story.append(estop_diagram())
    story.append(caption("Figure 1-1. Required authority split: hardware removes hazardous power; LinuxCNC monitors and inhibits."))
    add_section(story, "3. Lockout, stored energy, and DC bus", items=[
        "Open and lock the machine disconnect using the site's approved lockout/tagout procedure.",
        "Wait at least 10 minutes after power-off as required by the referenced Mitsubishi drive-family safety instructions.",
        "Do not trust elapsed time or a CHARGE lamp alone. Measure P(+) to N(-) with a properly rated meter and the exact installed-unit procedure.",
        "Proceed only below the service threshold specified by the identified rectifier/capacitor manual. The repository intentionally does not invent a universal voltage threshold.",
        "Repeat discharge characterization after rapid deceleration because regenerated energy can raise the bus above its at-rest condition.",
        "Support or crib the Z head before any brake, drive, or bus work.",
    ])
    story.append(callout(
        "SHARED BUS HAZARD",
        "A single-axis fault does not isolate that amplifier from the common P/N bus. Bus discharge, regen, READY propagation, contactor behavior, and vertical-axis brake timing must be surveyed and measured as a group.",
        "critical",
    ))
    add_section(story, "4. E-stop scope (owner decision 2026-08-15)", items=[
        "The OEM hardwired E-stop chain stays 100% original and is the sole safety function; it is not traced, modified, or verified by this conversion.",
        "ESTOP_MONITOR is DEFERRED: no interposing relay is installed; the unwired input reads FALSE and the software chain fails safe.",
        "LinuxCNC/HAL is a machine-availability interlock only, never personnel protection.",
    ])
    add_section(story, "5. Z-axis gravity and brake hazard", [
        "The HAL uses an asymmetric placeholder sequence: S-ON request rises immediately, brake release follows after 0.100 s; on disable the brake command drops immediately and S-ON is retained for 0.100 s. These are unmeasured commissioning placeholders, not proof that the brake is mechanically holding before torque disappears.",
        "Hardware E-stop, mains loss, internal amplifier fault, or loss of amp supply can bypass the software delay. The cabinet requires a proven brake-drop-before-torque-loss path, measured under the worst approved load and bus condition. Until then, treat every hard stop or power loss as capable of dropping the head.",
    ])
    story.append(callout("NO PERSON UNDER Z", "Do not stand under the spindle head or rely on the brake during commissioning. Use an engineered mechanical support whenever the Z holding chain is not proven.", "critical"))
    add_section(story, "6. Retrofit-specific hazard register")
    hazards = [
        ["Hazard", "Consequence", "Required control / evidence"],
        ["Reversed analog polarity", "Immediate runaway", "D8 direction proof, zero-voltage test, one-axis first-move plan"],
        ["Wrong resolver winding/phasing", "Wrong position, discontinuity, oscillation", "Ohmmeter pairs, exact suffix datasheet, scope traces, independent scale proof"],
        ["Dual resolver excitation", "Damage or invalid feedback", "Continuity/isolation proof; 7i49 sole source"],
        ["Wrong 7i84U TB1 landing", "Supply short or card damage", "Pins 1/2 VFIELDB; 3/4 VFIELDA; 5 VIN; 6/7/8 common"],
        ["Bare P3 field wiring", "7i80HDT FPGA damage", "P3 empty; probe on opto-isolated 7i84U-B IN15"],
        ["100 VAC on 7i84U output", "Card damage, shock", "Interposing relays and load-specific suppression"],
        ["Smart-serial/Ethernet loss", "Delayed or missing control", "Remote watchdog, HostMot2 watchdog, latched inhibit, measured fault tests"],
        ["ATC state error", "Tool drop, collision, pinch injury", "D13 hazard analysis, dry-cycle fixture, mutual exclusion, no automatic retry"],
        ["Unverified FR-SX interface", "Unexpected rotation or failed orient", "Exact drive manual, terminal trace, measured handshake/timing"],
    ]
    story.append(data_table(hazards, [39 * mm, 48 * mm, 73 * mm], font_size=6.8))
    add_section(story, "7. Live-power hold points")
    story.append(data_table([
        ["Milestone", "Required deliverables"],
        ["Control power", "D1, D2 partial, D3, D5, D15"],
        ["DC bus", "Control-power set plus D6"],
        ["Amplifier S-ON", "Above plus D4, D7, D14"],
        ["Z-brake release", "Above plus measured Z row of D7"],
        ["Spindle rotation", "Above plus D12"],
        ["First axis motion", "Above plus D8 and D9"],
        ["First automatic M6", "Above plus D10, D11, D13"],
    ], [52 * mm, 108 * mm], font_size=7.5))
    return story


def volume2(rows: list[dict[str, str]], source_ref: str) -> list[Flowable]:
    story = cover(2, VOLUME_INFO[2][1], VOLUME_INFO[2][2], source_ref)
    story.append(callout(
        "APPLICABILITY HOLD",
        "This is a commissioning-stage operating framework, not authorization to run the machine. Normal operator procedures become valid only after the corresponding signed hold points, as-built wiring, and commissioned values are incorporated into a later revision.",
        "critical",
    ))
    add_section(story, "1. Control station and current state", [
        "The planned interface is LinuxCNC Axis with an optional WHB04B-style USB pendant. Physical panel-button reuse is incomplete; the original Cycle Start input is deferred and the manual clamp input remains HAL-unbound. Do not assume an OEM button has retained its former function.",
        "Both drive-output-permit and spindle-output-permit initialize FALSE, and atc-live-permit initializes FALSE (ATC dry-run), which also holds the spindle motion permit off so nothing can cut while a dry-run M6 spoofs the tool. These deliberate holds are configuration controls and must be changed only by reviewed edits tied to signed commissioning steps.",
    ])
    add_section(story, "2. Power-up framework", items=[
        "Confirm the day's signed hold point authorizes the intended energy level; stop if it does not.",
        "Inspect the machine envelope, Z support state, tool/spindle condition, fluid leaks, cabinet condition, and all E-stop devices.",
        "Verify the dedicated LinuxCNC NIC is up at the recorded address and no unreviewed network or BIOS change occurred.",
        "Apply control power only. Confirm both commissioning holds are FALSE and all physical outputs remain safe.",
        "Review LinuxCNC messages, packet-error, watchdog, resolver error, drive-fault, E-stop monitor, and field-input states before any higher hold point.",
        "Use only the reviewed commissioning procedure for DC bus, S-ON, brake, spindle, or motion. Never bypass a linked output with ad-hoc halcmd writes.",
    ])
    add_section(story, "3. Homing", [
        "The current INI is configured for switch-based homing in the order Z (HOME_SEQUENCE 0), X (1), Y (2). This is a skeleton configuration, not proof that Z is safe to move first. The resolver emulated index is not accepted for axis homing.",
        "Before any homing attempt, verify raw/complement selection for all six limits and three home switches, prove the hardware overtravel path, measure travel and stop margin, and complete the Z-brake sequence if Z will move. Change homing order if the signed hazard review selects a safer sequence.",
    ])
    story.append(data_table([
        ["Axis", "Configured limits (in)", "Max vel / accel", "Home sequence", "Status"],
        ["X / Joint 0", f"{ini_value('JOINT_0','MIN_LIMIT')} to {ini_value('JOINT_0','MAX_LIMIT')}", f"{ini_value('JOINT_0','MAX_VELOCITY')} / {ini_value('JOINT_0','MAX_ACCELERATION')}", ini_value('JOINT_0','HOME_SEQUENCE'), "PLACEHOLDER"],
        ["Y / Joint 1", f"{ini_value('JOINT_1','MIN_LIMIT')} to {ini_value('JOINT_1','MAX_LIMIT')}", f"{ini_value('JOINT_1','MAX_VELOCITY')} / {ini_value('JOINT_1','MAX_ACCELERATION')}", ini_value('JOINT_1','HOME_SEQUENCE'), "PLACEHOLDER"],
        ["Z / Joint 2", f"{ini_value('JOINT_2','MIN_LIMIT')} to {ini_value('JOINT_2','MAX_LIMIT')}", f"{ini_value('JOINT_2','MAX_VELOCITY')} / {ini_value('JOINT_2','MAX_ACCELERATION')}", ini_value('JOINT_2','HOME_SEQUENCE'), "PLACEHOLDER"],
    ], [28 * mm, 48 * mm, 35 * mm, 24 * mm, 25 * mm], font_size=7))
    add_section(story, "4. Jogging and first motion", items=[
        "Normal jogging is prohibited until D8 resolver proof, D9 first-move plan, D11 travel survey, D14 network qualification, and the relevant signed hold point are complete.",
        "The first move uses a normal closed-loop LinuxCNC jog, one physically isolated axis, at the recorded clamp and clearance. It does not use open-loop PID bias on an installed axis.",
        "Abort for wrong direction, unexplained zero-command motion, following error, resolver error, drive alarm, limit transition, packet error, watchdog, brake discrepancy, or loss of observer/instrument.",
    ])
    add_section(story, "5. Spindle operation", [
        "The planned spindle path is 7i49 AOUT3 for analog speed and 7i84U-A OUT0/OUT1/OUT2 for FWD/REV/RUN. ORCM1 on OUT4 is a discrete orient command; it is not an analog position reference. Exact FR-SX model, terminals, polarities, analog mode, and READY handshake remain unverified.",
        "Do not rotate the spindle until the spindle hold point is signed. Prove zero speed, at-speed, fault, run/direction exclusivity, analog scaling, gear confirmation, ORCM1-to-ORA1 timing, and cleanup after cancel/fault in both gear ranges.",
    ])
    add_section(story, "6. Tool changer and magazine", [
        "Automatic M6 is blocked: atc-live-permit remains 0 (ATC dry-run, which also inhibits the spindle), the Y soft-limit extension component is not implemented, the ATC hazard analysis/dry-cycle fixture is missing, and several solenoid identities/directions remain HOLD_CONFLICT.",
        "A stalled or aborted ATC must not be jogged out under automatic power. Isolate energy, assess mechanical state, support any suspended tool, and use the approved manual recovery procedure after documenting the failure state.",
    ])
    story.append(data_table([
        ["ATC prerequisite", "Current position"],
        ["Spindle oriented", "ORA1 planned on 7i84U-A IN4; terminal/timing unverified"],
        ["Spindle zero speed", "SZS planned on IN5; terminal/polarity unverified"],
        ["Tool clamp / unclamp", "PRS-9 IN15 and PRS-8 IN16; valve topology unverified"],
        ["Magazine position", "Five BCD inputs IN19-IN23, valid only with mag-in-pos IN28"],
        ["Y/Z ATC zones", "PRS-55 IN0 and PRS-66 IN1; fitment and dynamic-limit logic incomplete"],
        ["Magazine direction", "OUT13/OUT14 remain HOLD_CONFLICT pending SOL-8A/8B trace"],
    ], [53 * mm, 107 * mm], font_size=7.2))
    add_section(story, "7. G-code and tool data", items=[
        "Use LinuxCNC G-code semantics, not Mazatrol conversational behavior, unless an explicit remap implements the function.",
        "Keep tool.tbl synchronized with verified physical pockets and the magazine BCD decode before any M6.",
        "Dry-run programs with spindle and drive outputs held off until coordinates, limits, units, work offsets, and remaps are independently checked.",
        "Parameter and program recovery from the M-2 is evidence for conversion/rollback; it is not automatically a LinuxCNC parameter import.",
    ])
    add_section(story, "8. Coolant, air, hydraulics, and optional controls")
    auxiliaries = [
        ["Function", "Authority", "Restriction"],
        ["Hydraulic/head-lube pump", "7i84U-A OUT3", "Proposed; prove pressure and contactor interface"],
        ["Flood coolant pump", "7i84U-A OUT11", "Commissioning pending; interposing relay as required"],
        ["Flood valve", "7i84U-B OUT7", "Proposed separate valve"],
        ["Air / touch / tap blasts", "7i84U-B OUT3/4/5", "100 VAC legacy loads; RLY-5/6/7 required"],
        ["Mist coolant", "7i84U-A OUT12", "HOLD_CONFLICT; do not energize"],
        ["Magazine cover close", "7i84U-B OUT8", "Proposed single-coil function; trace before use"],
        ["WHB04B pendant", "USB / HAL", "Optional; install only after base controls are proven"],
    ]
    story.append(data_table(auxiliaries, [45 * mm, 45 * mm, 70 * mm], font_size=7))
    add_section(story, "9. Shutdown and abnormal stop", items=[
        "Use the reviewed normal stop sequence; wait for zero speed and confirmed stationary axes before machine-off.",
        "Confirm the Z brake is mechanically holding before torque is removed.",
        "Drop higher-energy hold points in the documented order; do not treat LinuxCNC exit as power isolation.",
        "After main power-off, retain lockout and measure the shared DC bus before service.",
        "After any E-stop, communications loss, drive alarm, resolver error, or ATC abort, require manual investigation and reset. Never auto-resume.",
    ])
    add_section(story, "10. Operator alarm response")
    story.append(data_table([
        ["Indication", "Immediate response"],
        ["E-stop / hardware chain open", "Keep clear; identify cause; do not reset until hardware state is known"],
        ["Packet error or watchdog", "Stop; preserve logs; inspect NIC/cable/bitfile; manual reset only after review"],
        ["Resolver / following error", "E-stop; isolate S-ON; preserve trace; do not retry by increasing limits"],
        ["Drive fault", "Isolate hazardous power; record amplifier indication; inspect shared READY propagation"],
        ["Spindle orient timeout", "Drop ORCM1/run permits; do not retry automatically; verify gear/zero-speed/ORA1"],
        ["ATC abort", "Isolate hydraulics/motion; document mechanism state; use approved manual recovery"],
        ["Low air / hydraulic pressure", "Inhibit ATC and clamp motion; correct supply/leak before reset"],
    ], [48 * mm, 112 * mm], font_size=7.2))
    return story


def volume3(rows: list[dict[str, str]], source_ref: str) -> list[Flowable]:
    story = cover(3, VOLUME_INFO[3][1], VOLUME_INFO[3][2], source_ref)
    add_section(story, "1. Selected architecture", [
        "The selected stack is a LinuxCNC PC connected by dedicated Ethernet to a Mesa 7i80HDT. P1 carries a 7i44 smart-serial interface to two 7i84U field-I/O cards. P2 carries a plain 7i49 for three resolver channels and four active analog outputs. P3 is intentionally empty.",
    ])
    story.append(architecture_diagram())
    story.append(caption("Figure 3-1. Rev B control architecture. No 7i97T or 7i37TA is part of the selected stack."))
    story.append(data_table([
        ["Item", "Role", "Current qualification"],
        ["LinuxCNC host", "Trajectory, HAL, GUI", "Debian 13 / LinuxCNC 2.9.10 / PREEMPT_RT target"],
        ["Mesa 7i80HDT", "100BaseT FPGA host, 3 x 50-pin connectors", "Board/revision and loaded IDROM still to capture"],
        ["Mesa 7i44 on P3", "8-channel RS-422; channels 0/1 active", "Physical link and exact HAL names unverified"],
        ["Mesa 7i49 on P1", "6 resolver + 6 bipolar analog channels", "Plain board baseline; installed revision and signal levels unverified"],
        ["7i84U-A ch 0", "32 DI / 16 DO machine field I/O", "Fully allocated; physical states unverified"],
        ["7i84U-B ch 1", "Limits, homes, probe, enables, relay loads", "11 DI / 9 DO used; physical states unverified"],
        ["P3", "Future daughter-card position", "Empty; bare 3.3 V GPIO must not see 24 V"],
    ], [38 * mm, 60 * mm, 62 * mm], font_size=7.1))
    add_section(story, "2. Host and Ethernet setup", items=[
        "Use a dedicated wired NIC directly connected to the 7i80HDT; no wireless or USB Ethernet.",
        "Board address is 10.10.10.121 (static, set in EEPROM 2026-08-23); host control NIC is 10.10.10.1/24 with no gateway. Verify the actual interface and MAC.",
        "Record NIC chipset, driver, firmware, negotiated 100 Mbit/s full duplex, IRQ, offload/coalescing state, and LinuxCNC startup diagnostics.",
        "Treat hardware-irq-coalesce-rx-usecs 0 as an A/B experiment; remove it if harmful on the installed NIC, especially affected Marvell hardware.",
        "Run at least 15 minutes idle latency, 4 hours worst-load latency, 2 hours with the real config and drives disabled, then cable-yank fault injection.",
        "Any packet-error event is investigated. packet-error-exceeded and watchdog.has_bit must latch motion inhibit and require manual recovery.",
    ])
    add_section(story, "3. Firmware and IDROM gate", [
        "The working name 7i80hdt_7i44_ss_7i49d.bit is a placeholder only. Resolver configurations for the Efinix-based 7i80HDT are not proven by a stock-zip filename in this repository. Do not flash until Mesa/PCW provenance, binary, SHA-256, Efinity/source reference, recovery procedure, readhmid output, and HAL pin dump are committed as D3.",
    ])
    story.append(callout("BITFILE HOLD", "Never substitute a 7i80HD or 7i80HD-16 bitfile. The 7i80HDT uses a different FPGA and requires an HDT-specific build.", "critical"))
    story.append(data_table([
        ["Expected loaded function", "Planned config", "Proof required"],
        ["Resolvers", "num_resolvers=3", "IDROM + resolver.00-.02 HAL pins"],
        ["Analog PWM generators", "num_pwmgens=4", "pwmgen.00-.03 and measured AOUT mapping"],
        ["Encoders", "num_encoders=0", "No spindle receiver/pins assigned"],
        ["Smart serial", "sserial_port_0=00xxxxxx", "One port, channels 0/1, both remote serials"],
        ["P3", "IOPort only / unused", "No field conductors; pin listing retained for future use"],
    ], [50 * mm, 50 * mm, 60 * mm], font_size=7.2))
    add_section(story, "4. Resolver and analog motion path")
    story.append(drive_diagram())
    story.append(caption("Figure 3-2. LinuxCNC closes the outer position loop; the retained TRA drive closes its inner velocity loop."))
    story.extend(bullets([
        "Read and photograph the complete TS2014N suffix on X, Y, and Z. TS2014N141E26 values are comparison data only until suffixes are confirmed.",
        "Ohmmeter all winding pairs and compare with the exact datasheet. Do not trust old MELDAS signal names or colors.",
        "Use the 7i49 as the sole excitation source. The working 5 kHz selection is closest to a tentative 4.5 kHz variant but has no sourced tolerance acceptance.",
        "Scope RESDRV and SIN/COS at the card and resolver, at rest and through approved manual motion. Record amplitude, phase, offset, clipping, and noise.",
        "W2 affects only channels 3/4/5 and cannot correct X/Y/Z on channels 0/1/2.",
        "Derive signed resolver scale in machine units per resolver electrical revolution from screw travel and independent measurement. Do not leave 1.0 for motion.",
        "Calibrate volts-per-speed before tuning. OUTPUT_SCALE = 10 x measured velocity-per-volt; FF1 first, then P, with I/D only if evidence requires them.",
    ]))
    story.append(data_table([
        ["Axis", "Resolver", "Analog output", "Configured placeholders"],
        ["X / J0", "RES0", "AOUT0 / pwmgen.00", f"res scale {ini_value('JOINT_0','RESOLVER_SCALE')}; output scale {ini_value('JOINT_0','OUTPUT_SCALE')}; gains zero"],
        ["Z / J2", "RES2", "AOUT1 / pwmgen.01", f"res scale {ini_value('JOINT_2','RESOLVER_SCALE')}; output scale {ini_value('JOINT_2','OUTPUT_SCALE')}; gains zero"],
        ["Y / J1", "RES1", "AOUT2 / pwmgen.02", f"res scale {ini_value('JOINT_1','RESOLVER_SCALE')}; output scale {ini_value('JOINT_1','OUTPUT_SCALE')}; gains zero"],
        ["Spindle", "Unassigned", "AOUT3 / pwmgen.03", f"output scale {ini_value('SPINDLE_0','OUTPUT_SCALE')}; command mode unverified"],
    ], [28 * mm, 24 * mm, 45 * mm, 63 * mm], font_size=7))
    add_section(story, "5. 7i84U field power and smart serial", [
        "Each 7i84U uses the conservative 5-28 VDC limit from the manual description/specification table. The project plans 24 VDC. Both VFIELDA and VFIELDB must be powered for their respective banks. Field power must not be mechanically switched in a way that violates the card's ramp requirement; use the documented output-enable/watchdog behavior and approved upstream design.",
    ])
    story.append(data_table([
        ["TB1 terminal", "Function", "Bank served"],
        ["1 and 2", "VFIELDB - both positive field supply terminals", "TB2: IN16-31, OUT8-15"],
        ["3 and 4", "VFIELDA - both positive field supply terminals", "TB3: IN0-15, OUT0-7"],
        ["5", "VIN logic power", "W1 left links VIN to VFIELDB; W1 right needs separate VIN"],
        ["6, 7, and 8", "GND / VIN-VFIELD common", "The only TB1 terminals used for 0 V return"],
    ], [35 * mm, 73 * mm, 52 * mm], font_size=7.3))
    story.append(callout("TB1 POLARITY", "Pins 2 and 4 are not returns. They are duplicate positive VFIELDB and VFIELDA terminals. Record each card's W1 position and never double-feed VIN.", "critical"))
    add_section(story, "6. Configuration files")
    story.append(data_table([
        ["File", "Role"],
        ["linuxcnc/mazak_vqc_20_40.ini", "Machine/joint/spindle placeholders, ATC dry-run, timeouts, HAL load order"],
        ["linuxcnc/mazak_vqc_20_40.hal", "hm2_eth load, component scheduling, watchdog/E-stop/permit logic"],
        ["linuxcnc/motion_7i80hdt.hal", "7i49 resolver feedback, PID outer loops, pwmgen/analog outputs"],
        ["linuxcnc/field_7i84u.hal", "Both 7i84U pin bindings, limits, faults, enables, Z-brake sequence"],
        ["linuxcnc/atc_orient.hal", "ATC/orient component nets and output scheduling"],
        ["linuxcnc/components/*.comp", "Custom orient and ATC state machines"],
        ["mesa/current_pin_authority.csv", "Single physical channel authority; all wiring tables derive here"],
    ], [65 * mm, 95 * mm], font_size=7.2))
    add_section(story, "7. Staged bring-up")
    stages = [
        "Complete applicable D1-D16 hold-point evidence; no live power before signatures.",
        "Verify 7i80HDT communications, exact firmware/IDROM, HAL pins, NIC qualification, and fail-latched link-loss response.",
        "Verify both 7i84U power maps, W1 positions, isolated 24 V buses, branch fusing, input modes, output load interfaces, and watchdogs.",
        "With S-ON physically open, identify and energize resolver feedback only; scope all three channels and prove signed scale/direction manually.",
        "With drives inhibited, verify AOUT0-AOUT3 zero voltage, polarity, mode, and measured volts-per-speed path.",
        "Prove hardware E-stop, limits, drive faults, READY propagation, shared-bus stop/discharge, and Z-brake timing.",
        "Execute the signed one-axis first-move plan, one axis physically enabled, at measured low authority. Do not assume Z first.",
        "Tune each velocity-mode outer loop from measured scaling: FF1, P, then only evidence-driven I/D; save traces.",
        "Commission spindle at low energy: analog scale, FWD/REV/RUN, zero speed, fault, gear, discrete orient, arrival/timeout cleanup.",
        "Commission hydraulics and ATC output-by-output with no tool load, dry-cycle fixture, mutual exclusion, abort tests, and atc-live-permit held 0 (dry-run) until acceptance.",
    ]
    story.append(data_table([["Stage", "Required result"], *[[i + 1, text] for i, text in enumerate(stages)]], [16 * mm, 144 * mm], font_size=7.2))
    add_section(story, "8. Rejected and historical architectures")
    story.append(data_table([
        ["Item", "Disposition"],
        ["Mesa 7i97T", "Retracted; not part of this analog-velocity/resolver stack"],
        ["Mesa 7i80HD / 7i80HD-16", "Different FPGA generation; never use its bitfile on a 7i80HDT"],
        ["Mesa 7i37TA on P3", "Retracted; duplicates field I/O and is not in the selected plan"],
        ["Probe on P3 gpio.042", "Retracted; unsafe 24 V on bare 3.3 V GPIO. Probe is 7i84U-B IN15"],
        ["Analog orient reference on AOUT4", "Retracted; ORCM1 is discrete and AOUT4 is spare"],
        ["Quadrature axis encoders", "Not selected; X/Y/Z feedback is resolver through 7i49"],
    ], [55 * mm, 105 * mm], font_size=7.3))
    return story


def authority_table(rows: Sequence[dict[str, str]]) -> LongTable:
    data: list[list[str]] = [["Channel", "Signal ID", "HAL net", "Field point / load", "Status"]]
    for row in rows:
        data.append([
            row["pin_channel"], row["signal_id"], row["hal_net"],
            row["field_point_or_load"], row["authority_status"],
        ])
    return data_table(data, [28 * mm, 31 * mm, 28 * mm, 62 * mm, 25 * mm], font_size=6.1, status_column=4)


def volume4(rows: list[dict[str, str]], source_ref: str) -> list[Flowable]:
    story = cover(4, VOLUME_INFO[4][1], VOLUME_INFO[4][2], source_ref)
    story.append(callout(
        "WIRING AUTHORITY STATUS",
        "Every table below is generated from mesa/current_pin_authority.csv. A row is not permission to land or energize a conductor unless its evidence state and applicable hold point allow it. HOLD_CONFLICT and UNBOUND rows are prohibited from field connection or actuation.",
        "critical",
    ))
    add_section(story, "1. System architecture")
    story.append(architecture_diagram())
    story.append(caption("Figure 4-1. Physical card topology and daughter-card ownership."))
    add_section(story, "2. Servo command, enable, and feedback")
    story.append(drive_diagram())
    story.append(caption("Figure 4-2. Velocity-mode nested loops and distinct 7i49/7i84U paths."))
    add_section(story, "3. Resolver cable topology")
    story.append(resolver_diagram())
    story.append(caption("Figure 4-3. One 7i49 resolver channel; exact winding pairs are measured, not assumed."))
    add_section(story, "4. FR-SX spindle interface")
    story.append(spindle_diagram())
    story.append(caption("Figure 4-4. Analog speed plus discrete run/orient model; exact FR-SX terminals remain unverified."))
    add_section(story, "5. E-stop authority split")
    story.append(estop_diagram())
    story.append(caption("Figure 4-5. Hardware-primary stop path and software monitor tap."))

    add_section(story, "6. 7i49 resolver and analog authority")
    story.append(authority_table([r for r in rows if r["mesa_card"] == "7i49"]))
    story.append(P("Axis analog order is X=AOUT0, Z=AOUT1, Y=AOUT2. Resolver order is X=RES0, Y=RES1, Z=RES2. These two orderings are deliberately different.", SMALL))

    add_section(story, "7. 7i44 smart-serial link authority")
    story.append(authority_table([r for r in rows if r["mesa_card"] == "7i44"]))

    add_section(story, "8. 7i84U-A TB1 power map")
    story.append(authority_table([r for r in rows if r["mesa_card"] == "7i84U-A" and r["direction"] == "POWER"]))
    story.append(callout("A-CARD TB1", "Pins 1/2 are both VFIELDB positive; pins 3/4 are both VFIELDA positive; pin 5 is VIN; pins 6/7/8 are common. Use 5-28 VDC and record W1.", "critical"))
    add_section(story, "9. 7i84U-A inputs IN0-IN31")
    story.append(authority_table([r for r in rows if r["mesa_card"] == "7i84U-A" and r["direction"] == "IN"]))
    add_section(story, "10. 7i84U-A outputs OUT0-OUT15")
    story.append(authority_table([r for r in rows if r["mesa_card"] == "7i84U-A" and r["direction"] == "OUT"]))

    add_section(story, "11. 7i84U-B TB1 power map")
    story.append(authority_table([r for r in rows if r["mesa_card"] == "7i84U-B" and r["direction"] == "POWER"]))
    story.append(callout("B-CARD TB1", "Pins 1/2 are both VFIELDB positive; pins 3/4 are both VFIELDA positive; pin 5 is VIN; pins 6/7/8 are common. Use 5-28 VDC and record W1.", "critical"))
    add_section(story, "12. 7i84U-B inputs IN0-IN31")
    story.append(authority_table([r for r in rows if r["mesa_card"] == "7i84U-B" and r["direction"] == "IN"]))
    add_section(story, "13. 7i84U-B outputs OUT0-OUT15")
    story.append(authority_table([r for r in rows if r["mesa_card"] == "7i84U-B" and r["direction"] == "OUT"]))

    add_section(story, "14. Unassigned, deferred, and P3 rows")
    story.append(authority_table([r for r in rows if r["mesa_card"] in {"none", "7i80HDT"}]))
    add_section(story, "15. Conflict and commissioning blocker register")
    blocker_rows = [r for r in rows if r["authority_status"] in {"HOLD_CONFLICT", "UNBOUND"}]
    blocker_data = [["Signal", "Card/channel", "Field point", "Status", "Required resolution"]]
    for row in blocker_rows:
        blocker_data.append([
            row["signal_id"], f"{row['mesa_card']} {row['pin_channel']}",
            row["field_point_or_load"], row["authority_status"], row["cleanup_notes"],
        ])
    story.append(data_table(blocker_data, [26 * mm, 29 * mm, 39 * mm, 24 * mm, 56 * mm], font_size=5.9, status_column=3))
    add_section(story, "16. Evidence-state legend")
    story.append(data_table([
        ["State", "Meaning for wiring/use"],
        ["PROPOSED", "Paper design only; no physical verification"],
        ["COMMISSIONING_PENDING", "Defined but not physically accepted; treated conservatively like proposed"],
        ["TRACED", "De-energized conductor path and device action physically traced"],
        ["ELECTRICALLY_VERIFIED", "Normal/tripped voltage and load behavior measured"],
        ["HAL_VERIFIED", "Physical stimulus and unique HAL response captured"],
        ["COMMISSIONED", "Passed functional and applicable fault-injection acceptance"],
        ["HOLD_CONFLICT", "Contradictory identity/function; do not land or energize"],
        ["UNBOUND", "No hardware terminal/interface assigned"],
        ["DEFERRED", "Outside current scope"],
        ["SPARE", "Unassigned terminal; leave unlanded"],
    ], [48 * mm, 112 * mm], font_size=7.2, status_column=0))
    return story


def volume5(rows: list[dict[str, str]], source_ref: str) -> list[Flowable]:
    story = cover(5, VOLUME_INFO[5][1], VOLUME_INFO[5][2], source_ref)
    add_section(story, "1. Maintenance authority", [
        "Use Mazak 413m033 for retained machine maintenance, 41434WB for OEM electrical wiring, YM2V39L for original sequence meaning, and the exact Mitsubishi manual for each installed drive. This retrofit volume covers only added LinuxCNC/Mesa equipment and interfaces. It cannot replace model-specific service instructions.",
    ])
    add_section(story, "2. Inspection schedule")
    story.append(data_table([
        ["Interval", "Checks"],
        ["Before each use", "Leaks, loose tools, Z support/brake state, E-stops/guards, LinuxCNC faults, packet/watchdog state, abnormal noise"],
        ["Weekly", "Cabinet filters/seals, fan operation, terminal discoloration, relay indicators, 24 V rails, cable abrasion, coolant intrusion"],
        ["Monthly", "PE bonds, shield drains, connector retention, 7i44/7i84U links, output relays/suppression, log/backup completeness"],
        ["Quarterly", "E-stop/guard functional checks per approved matrix subset, brake holding trend, bus discharge trend, resolver/noise survey comparison"],
        ["Annually", "Full safety validation, torque/terminal inspection per OEM specs, resolver amplitude/phase baseline, analog zero, NIC/latency requalification after updates"],
        ["After any change", "Firmware hash/IDROM, HAL pins, authority validator, control validator, affected hold point and fault-injection tests"],
    ], [30 * mm, 130 * mm], font_size=7.2))
    add_section(story, "3. Safe diagnostic order", items=[
        "Preserve the first fault: messages, indicator states, HAL values, scope trace, and physical relay state before reset.",
        "Separate control indication from physical energy. A false HAL pin does not prove a contactor, brake, or bus is safe.",
        "Isolate and measure the shared P/N bus before opening drive wiring.",
        "Use the authority CSV to identify the exact card/channel and status; stop if HOLD_CONFLICT or UNBOUND.",
        "Test from field device toward HAL for inputs, and from reviewed request logic toward load for outputs. Never bypass interlocks in the active machine config.",
        "After repair, repeat every safety/functional acceptance affected by the changed component or conductor.",
    ])
    add_section(story, "4. Motion and resolver troubleshooting")
    story.append(data_table([
        ["Symptom", "Likely areas", "Required action"],
        ["Position noisy at rest", "Resolver pair/shield, dual excitation, low return, switching noise", "S-ON off; scope differential RESDRV/SIN/COS; compare baseline; operate nearby relays one at a time"],
        ["Wrong feedback direction", "Signed resolver scale or phasing", "Return to D8 manual direction proof; do not negate PID gain"],
        ["Axis moves at zero command", "Analog offset, enable/gate error, drive null", "E-stop; open S-ON; measure AOUT and pid/pwmgen values; require <=50 mV before retry"],
        ["Following error at constant speed", "OUTPUT_SCALE/FF1 mismatch, drive gain, resolver scale", "Return to volts-per-speed calibration; do not simply raise FERROR"],
        ["Oscillation/whine", "P too high, TRA inner loop, resolver noise", "Rollback to last logged settings; inspect drive loop and feedback before retuning"],
        ["Single drive fault drops group", "Shared READY chain behavior", "Expected design premise but machine-specific propagation must be logged; inspect all axes and bus"],
        ["Z drops on stop", "Brake sequencing/holding failure", "Support Z, isolate power, quarantine motion; investigate hardware timing and brake capacity"],
    ], [38 * mm, 54 * mm, 68 * mm], font_size=6.8))
    add_section(story, "5. Ethernet, FPGA, and smart-serial troubleshooting")
    story.append(data_table([
        ["Symptom", "Checks", "Do not"],
        ["7i80HDT unreachable", "Dedicated NIC address/link, cable, board power/IP, routing", "Do not flash firmware as a connectivity test"],
        ["packet-error-level rises", "NIC driver/IRQ/load, cable, coalescing/offload A/B record, servo latency", "Do not increase limits until the cause is understood"],
        ["watchdog.has_bit", "HostMot2 scheduling, thread overrun, Ethernet/FPGA loss", "Do not auto-reset into motion"],
        ["7i84U missing", "7i44 channel cable/pinout, remote power/W1, config mask, IDROM", "Do not assume device tag or sserial mask"],
        ["Remote outputs drop", "Remote watchdog time, link, field bank voltage, VIN, output fault", "Do not disable the watchdog"],
        ["HAL pins differ", "Loaded bitfile/readhmid/config string", "Do not rename around an unproven firmware mismatch"],
    ], [40 * mm, 72 * mm, 48 * mm], font_size=6.9))
    add_section(story, "6. Spindle and orient troubleshooting")
    story.append(data_table([
        ["Symptom", "Checks", "Safe response"],
        ["No spindle rotation", "Static/dynamic permits, READY, fault, FWD/REV/RUN, AOUT3, gear confirm", "Keep low energy; verify exact FR-SX terminal states"],
        ["Wrong direction", "FWD/REV exclusivity and analog sign/mode", "Drop all spindle permits; correct one documented sign stage"],
        ["No orient arrival", "Zero speed, gear, ORCM1, detector/parameter mode, ORA1 polarity", "Allow component timeout; no automatic retry"],
        ["Orient cancel restarts spindle", "Run bit remained asserted; adjacent-family behavior", "Treat as hazardous until exact FR-SX command order is proven"],
        ["At-speed unreliable", "IN13 source, polarity, threshold, debounce", "Do not bypass ATC spindle-state interlock"],
    ], [40 * mm, 72 * mm, 48 * mm], font_size=6.9))
    add_section(story, "7. ATC and field-I/O troubleshooting")
    story.append(data_table([
        ["Symptom", "Checks", "Safe response"],
        ["Magazine position wrong", "IN19-IN23 BCD, IN28 validity, pocket/tool table", "Stop indexing; compare each bit at a known pocket"],
        ["Clamp state disagrees", "PRS-8/9, pressure, SOL-10 topology, OUT9/10", "Support tool; isolate hydraulics; resolve valve mapping"],
        ["Gear does not confirm", "Zero speed, OUT7/OUT8, PRS-10/12, coil identity", "Do not spin; HOLD_CONFLICT remains until traced"],
        ["Output does nothing", "Field bank/VIN, W1, watchdog, interposing relay, coil voltage/current", "Measure at each boundary; never apply 100 VAC to 7i84U"],
        ["Unexpected adjacent input", "Commoning, sensor wiring, input mode, induced noise", "Do not promote to HAL_VERIFIED; trace and repeat"],
        ["ATC stalls", "Current state, prerequisites, timeout/alarm, hydraulic pressure", "No recovery jog; isolate and use approved manual recovery"],
    ], [40 * mm, 72 * mm, 48 * mm], font_size=6.9))
    add_section(story, "8. Backup, restore, and rollback", items=[
        "Maintain an immutable original-control photo/wire ledger and M-2 parameter/ladder backups before removing conductors.",
        "For every released retrofit state, archive the git commit, authority CSV, INI/HAL, custom components, tool table, bitfile binary/hash/source, readhmid, HAL pin dump, host package/kernel/NIC record, and signed test evidence.",
        "Tag a known-safe baseline only after its hold-point evidence is complete. A git tag without physical acceptance is not a safe machine baseline.",
        "After a fault during commissioning, return both output holds FALSE, physically isolate S-ON, restore the logged low-authority configuration, and preserve all evidence before retry.",
        "Reverting to the original M-2 requires the removed-conductor ledger and independent continuity check; never reconnect from memory or an old Rev A PDF.",
    ])
    add_section(story, "9. Spares and obsolescence", [
        "Mitsubishi TRA/HD and FR-SX hardware is obsolete. Record installed suffixes before purchasing used spares. Store repaired/used units with test reports and retain parameter/trim positions. Mesa spares must match board revision and verified firmware package; a replacement 7i80HDT must not be flashed from an assumed filename.",
    ])
    add_section(story, "10. Required maintenance records")
    story.append(data_table([
        ["Record", "Location"],
        ["I/O checkout and state measurements", "wiring/io_checkout_sheet.md + docs/commissioning_logs"],
        ["Resolver scope/phasing/scale", "docs/commissioning_logs/resolver_traces"],
        ["Servo tuning and faults", "docs/commissioning_logs/tuning and per-axis logs"],
        ["Bus discharge/regen", "docs/commissioning_logs/dc_bus_discharge_*"],
        ["E-stop fault matrix", "docs/commissioning_logs/estop_validation_*"],
        ["Network/latency/cable-yank", "docs/commissioning_logs/latency_*"],
        ["Firmware package", "mesa/firmware with SHA256SUMS/readhmid/HAL pins"],
        ["Configuration release", "Git commit/tag plus manual-set manifest.json"],
    ], [58 * mm, 102 * mm], font_size=7.2))
    return story


ORIGINAL_MANUALS = [
    ("413S038", "Operating Manual for VQC-20/40 and 20/50", "Primary retained-machine operation reference"),
    ("M00S075", "Operating Manual for CAM M-2", "Original conversational control reference"),
    ("413M033", "Maintenance Manual for VQC-20/40 and 20/50", "Primary retained mechanical/electrical maintenance"),
    ("41434WB", "Electrical Circuit Diagram for VQC-20/40/50", "Primary OEM machine-side wiring source"),
    ("YM2V39L", "PLC Ladder Diagrams", "Original sequence and signal meaning"),
    ("PAREXM210E", "Parameter List and Explanation for M-2", "M-2 parameter definitions"),
    ("M00P111", "Programming Manual for CAM M-2 EIA/ISO", "Original M-2 G-code reference"),
    ("M00P135", "Programming Manual for M-2E", "Reference only; machine is M-2"),
    ("M00P018", "Programming Manual for Mazatrol CAM 3D", "Option reference; fitment unverified"),
    ("M00T002", "Tooling Manual for Mazak Machining Center", "Toolholder and pull-stud reference"),
    ("413LE02A000", "Parts List for VQC 20/40 and 20/50", "Mechanical parts sourcing"),
]


def volume6(rows: list[dict[str, str]], source_ref: str) -> list[Flowable]:
    story = cover(6, VOLUME_INFO[6][1], VOLUME_INFO[6][2], source_ref)
    add_section(story, "1. Original Mazak manual library")
    story.append(data_table([["Publication", "Title", "Use"], *ORIGINAL_MANUALS], [32 * mm, 67 * mm, 61 * mm], font_size=6.8))
    story.append(P("The 41434WB drawing title-block history includes M-1-era sheets although serial 060231 carries an M-2 control. Use the drawings for retained machine wiring and verify the installed NC/control revision separately.", SMALL))
    add_section(story, "2. Key project files")
    story.append(data_table([
        ["File", "Authority / purpose"],
        ["mesa/current_pin_authority.csv", "Physical channel authority and evidence state"],
        ["docs/architecture_decision.md", "Selected 7i80HDT/7i44/7i49/two-7i84U architecture"],
        ["linuxcnc/*.hal and *.ini", "Active logic skeleton and configuration placeholders"],
        ["docs/pre_power_deliverables.md", "D1-D16 evidence and hold-point charter"],
        ["docs/estop_safety_chain.md", "E-stop scope withdrawal record (OEM chain stays original)"],
        ["docs/dc_bus_stop_fault.md", "Shared-bus survey/discharge/regen/fault plan"],
        ["docs/resolver_commissioning.md", "Per-axis winding, phasing, scale, and noise proof"],
        ["docs/servo_commissioning.md", "Velocity-mode calibration and FF1-first tuning"],
        ["docs/hm2_eth_nic_validation.md", "Debian 13/NIC/latency/packet/watchdog qualification"],
        ["docs/frsx_orient_model.md", "Discrete-orient model and unresolved FR-SX identity"],
        ["docs/first_move_plan.md", "Signed one-axis first-motion procedure"],
        ["scripts/validate_authority.py", "CSV/HAL/capacity/legend/TB1 regression checks"],
        ["scripts/validate_control_logic.py", "Static HAL/INI safety invariants"],
        ["scripts/build_manual_set.py", "Reproducible Rev B PDF generator"],
    ], [68 * mm, 92 * mm], font_size=7))
    add_section(story, "3. Primary external references")
    story.append(data_table([
        ["Source", "Use"],
        ["Mesa 7i80HDT product page", "Host capability: 100BaseT, 72 I/O, three 50-pin connectors, 5 V tolerant"],
        ["Mesa 7i44 manual", "Eight RS-422 channels and physical serial pinout"],
        ["Mesa 7i49 manual", "Six resolver channels, six bipolar analog outputs, cabling, excitation, W2"],
        ["Mesa 7i84U manual", "32 DI/16 DO, TB1/TB2/TB3, 5-28 VDC specification, watchdog/update facts"],
        ["LinuxCNC hostmot2(9)", "Resolver/PWM/sserial/watchdog module semantics"],
        ["LinuxCNC hm2_eth(9)", "Dedicated NIC, packet error, timeout, firewall, coalescing guidance"],
        ["LinuxCNC pid(9)", "FF terms, output engineering units, clamps and windup"],
        ["Mitsubishi TRA/MELDAS drive manuals", "Shared bus, READY, regen, discharge, amplifier setup"],
        ["Exact Tamagawa suffix datasheets", "Required per axis; not yet captured"],
        ["Exact installed FR-SX manual", "Required; model/terminal layout not yet captured"],
    ], [58 * mm, 102 * mm], font_size=7))
    add_section(story, "4. Glossary")
    glossary = [
        ("AOUT", "7i49 bipolar analog output used as a velocity command"),
        ("Authority", "The controlled pin-to-signal record in current_pin_authority.csv"),
        ("COMMISSIONING_PENDING", "Defined design row without completed physical acceptance"),
        ("D1-D16", "Pre-power evidence deliverables and signed hold-point prerequisites"),
        ("FF1", "PID velocity feed-forward term after engineering-unit output scaling"),
        ("FR-SX", "Retained Mitsubishi spindle drive family; exact installed model remains unverified"),
        ("HAL", "LinuxCNC Hardware Abstraction Layer"),
        ("HOLD_CONFLICT", "Contradictory field identity/function; connection or actuation prohibited"),
        ("hm2_eth", "LinuxCNC Ethernet driver for HostMot2 boards"),
        ("IDROM", "Firmware module and pin-routing identity data read from the FPGA image"),
        ("MAR", "OEM relay/chain designation associated with machine-ready/E-stop behavior; trace as-built"),
        ("ORCM1", "Discrete spindle orient command, OEM wire Y093"),
        ("ORA1", "Spindle orient-arrival indication, OEM wire X003"),
        ("P/N bus", "Shared DC bus from retained rectifier/capacitor stack"),
        ("P3", "Unused 7i80HDT 50-pin connector; bare 3.3 V GPIO, no field wiring"),
        ("PROPOSED", "Paper design only; no physical verification"),
        ("RESDRV", "7i49 differential resolver excitation pair"),
        ("RESSIN/RESCOS", "7i49 differential resolver return pairs"),
        ("S-ON", "Servo amplifier enable input"),
        ("sserial", "Mesa smart-serial link; two 7i84Us on 7i44 channels 0/1"),
        ("TRA", "Retained Mitsubishi analog velocity-loop servo amplifier family"),
        ("TS2014N", "Tamagawa shaft-resolver family; exact suffix required per axis"),
        ("VFIELDA", "7i84U field supply for TB3 I/O; TB1 pins 3/4 both positive"),
        ("VFIELDB", "7i84U field supply for TB2 I/O; TB1 pins 1/2 both positive"),
        ("VIN", "7i84U logic supply on TB1 pin 5; W1 can link it to VFIELDB"),
        ("W1", "7i84U jumper selecting linked or separate VIN feed"),
        ("W2", "7i49 half-drive option affecting channels 3/4/5 only"),
        ("Watchdog", "Hardware/remote timeout that must fail outputs off and latch recovery"),
    ]
    story.append(data_table([["Term", "Definition"], *glossary], [38 * mm, 122 * mm], font_size=7))
    add_section(story, "5. Superseded claim quarantine")
    story.append(data_table([
        ["Retracted / unsafe claim", "Current disposition"],
        ["7i97T is the primary controller", "Retracted; 7i80HDT host with 7i49/7i44 daughters"],
        ["7i80HD-16 is interchangeable", "Contradicted; never flash HD/HD-16 images on HDT"],
        ["7i37TA is on P3", "Retracted; P3 is empty"],
        ["Probe uses P3 gpio.042", "Retracted; 7i84U-B TB3 IN15"],
        ["Axis feedback is quadrature encoder", "Contradicted; resolver through 7i49"],
        ["AOUT4 commands orient angle", "Contradicted; ORCM1 is discrete and AOUT4 spare"],
        ["W2 can correct X/Y/Z amplitude", "Contradicted; W2 affects channels 3/4/5 only"],
        ["5 kHz is within a published TS2014N tolerance", "Unverifiable; exact suffix and scoped measurement required"],
        ["RESOLVER_SCALE=1.0 is commissioned", "Unsafe placeholder; measure signed machine units/electrical rev"],
        ["OUTPUT_SCALE=MAX_VELOCITY is automatically correct", "Only true if measured drive gain makes 10 V equal that velocity"],
        ["Use fixed P gain 10-30", "Rejected; no universal gain; select from measured response"],
        ["Use 250 ms Z off-delay", "Rejected without brake/relay/drive measurements"],
        ["Probe <=15 IPM is proven safe", "Rejected without end-to-end latency, stopping, and repeatability measurements"],
        ["Disable all NIC RX/TX checksum offloads", "Not universal; A/B test supported settings on the installed NIC"],
        ["7i84U pins 2/4 are returns", "Dangerous error; both are positive field-supply duplicates"],
    ], [72 * mm, 88 * mm], font_size=6.8))
    add_section(story, "6. Alphabetical index")
    index_rows = [
        ("Analog command scaling", "V3 s4; V5 s4"), ("Architecture", "V0 s1; V3 s1; V4 s1"),
        ("ATC", "V2 s6; V4 s9-s13; V5 s7"), ("Authority hierarchy", "V0 s4; V4 s16"),
        ("Bitfile", "V3 s3; V5 s5"), ("Brake, Z axis", "V1 s5; V4 s10; V5 s4"),
        ("DC bus", "V1 s3; V5 s3"), ("E-stop", "V1 s2-s4; V4 s5"),
        ("Ethernet / hm2_eth", "V3 s2; V5 s5"), ("Evidence states", "V0 s4; V4 s16"),
        ("Field power", "V3 s5; V4 s8/s11"), ("Firmware", "V3 s3; V5 s5"),
        ("First motion", "V2 s4; V3 s7"), ("FR-SX", "V2 s5; V4 s4; V5 s6"),
        ("Grounding / shielding", "V1 s6; V3 s4; V4 s3"), ("HAL files", "V3 s6"),
        ("Homing", "V2 s3"), ("Hold points", "V0 s5; V1 s7"),
        ("I/O map", "V4 s6-s14"), ("Interposing relays", "V1 s6; V2 s8; V4 s10/s13"),
        ("Maintenance", "V5 s1-s10"), ("Manual library", "V6 s1"),
        ("Network faults", "V1 s6; V5 s5"), ("P3", "V3 s1/s8; V4 s14"),
        ("Probe", "V2 s4; V3 s8; V4 s12"), ("Resolver", "V3 s4; V4 s2/s3/s6; V5 s4"),
        ("Rollback", "V2 s9; V5 s8"), ("Safety", "V1 s1-s7"),
        ("Servo tuning", "V3 s4/s7; V5 s4"), ("Shared bus", "V1 s3; V5 s4"),
        ("Smart serial", "V3 s5; V4 s7; V5 s5"), ("Spindle orient", "V2 s5; V4 s4; V5 s6"),
        ("Status codes", "V4 s16"), ("TB1 power", "V3 s5; V4 s8/s11"),
        ("Tool changer", "V2 s6; V5 s7"), ("Troubleshooting", "V5 s3-s7"),
        ("7i44", "V3 s1/s5; V4 s7"), ("7i49", "V3 s4; V4 s2/s3/s6"),
        ("7i80HDT", "V3 s1-s3; V4 s1"), ("7i84U-A", "V4 s8-s10"),
        ("7i84U-B", "V4 s11-s13"), ("Watchdog", "V1 s6; V3 s2/s5; V5 s5"),
    ]
    story.append(data_table([["Entry", "Reference"], *sorted(index_rows)], [88 * mm, 72 * mm], font_size=7.2))
    return story


BUILDERS = {
    0: volume0,
    1: volume1,
    2: volume2,
    3: volume3,
    4: volume4,
    5: volume5,
    6: volume6,
}


def build_volume(output: Path, info: tuple[int, str, str, str], rows: list[dict[str, str]], source_ref: str) -> Path:
    volume, title, doc_number, filename = info
    path = output / filename
    doc = ManualDocTemplate(
        str(path), volume=volume, doc_number=doc_number, source_ref=source_ref,
        pagesize=A4, leftMargin=18 * mm, rightMargin=18 * mm,
        topMargin=19 * mm, bottomMargin=17 * mm,
        title=f"Volume {volume} - {title}", author="Mazak VQC-20/40 Retrofit Project",
        subject=f"{doc_number} Rev {REVISION}", creator="scripts/build_manual_set.py",
    )
    story = BUILDERS[volume](rows, source_ref)
    doc.build(story, onFirstPage=draw_page, onLaterPages=draw_page)
    return path


def combine_pdfs(paths: Sequence[Path], output: Path, source_ref: str) -> Path:
    combined = output / f"Mazak_VQC2040_Complete_Manual_Rev{REVISION}.pdf"
    writer = PdfWriter()
    for path in paths:
        writer.append(str(path), outline_item=path.stem.replace("_", " "))
    writer.add_metadata({
        "/Title": f"Mazak VQC-20/40 LinuxCNC Retrofit Complete Manual Rev {REVISION}",
        "/Author": "Mazak VQC-20/40 Retrofit Project",
        "/Subject": f"Generated {GEN_DATE} from source {source_ref}",
        "/Creator": "scripts/build_manual_set.py",
    })
    with combined.open("wb") as stream:
        writer.write(stream)
    return combined


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def write_manifest(output: Path, pdfs: Sequence[Path], rows: list[dict[str, str]], source_ref: str) -> None:
    files = []
    for path in pdfs:
        reader = PdfReader(str(path))
        files.append({"file": path.name, "pages": len(reader.pages), "sha256": sha256(path)})
    payload = {
        "manual_set_revision": REVISION,
        "generated": GEN_DATE,
        "source_commit": source_ref,
        "authority_rows": len(rows),
        "files": files,
    }
    (output / "manifest.json").write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


def write_readme(output: Path, pdfs: Sequence[Path], rows: list[dict[str, str]], source_ref: str) -> None:
    status_counts = Counter(r["authority_status"] for r in rows)
    lines = [
        "# Mazak VQC-20/40 LinuxCNC/Mesa Retrofit Manual Set",
        "",
        f"**Revision {REVISION} - generated {GEN_DATE} from source commit `{source_ref}`.**",
        "",
        "> **PLANNING / COMMISSIONING DOCUMENTS - NOT AS-BUILT.** No live-power hold point is signed. Use the authority status printed with each wiring row and the D1-D16 gates in Volume 0. Rev A is superseded and must not be used.",
        "",
        "## Artifacts",
        "",
        "| File | Purpose |",
        "|---|---|",
    ]
    for info in VOLUME_INFO:
        lines.append(f"| `{info[3]}` | Volume {info[0]} - {info[1]} |")
    lines.append(f"| `Mazak_VQC2040_Complete_Manual_Rev{REVISION}.pdf` | Combined volumes 0-6 |")
    lines.extend([
        "| `manifest.json` | SHA-256 and page count for every PDF |",
        "",
        "## What Rev B consolidates",
        "",
        "- Replaces the retracted 7i97T/one-7i84U Rev A architecture with 7i80HDT + 7i44 + 7i49 + two 7i84Us.",
        "- Generates Volume 4 directly from `mesa/current_pin_authority.csv`.",
        "- Corrects 7i84U TB1: pins 1/2 VFIELDB positive, pins 3/4 VFIELDA positive, pin 5 VIN, pins 6/7/8 common.",
        "- Keeps P3 empty and routes the probe to 7i84U-B TB3 IN15.",
        "- Treats FR-SX orient as a discrete ORCM1 command; AOUT4 remains spare.",
        "- Consolidates D1-D16 hold points, resolver/servo commissioning, shared-bus/Z-brake risks, network qualification, maintenance, and superseded-claim quarantine.",
        "",
        "## Authority snapshot",
        "",
        f"- Total rows: {len(rows)}",
        *[f"- `{key}`: {value}" for key, value in sorted(status_counts.items())],
        "",
        "## Rebuild",
        "",
        "```bash",
        "uv run scripts/build_manual_set.py",
        "python3 scripts/validate_authority.py",
        "python3 scripts/validate_control_logic.py",
        "```",
        "",
        "The generator removes superseded combined-manual revisions from this folder and rewrites the seven stable volume filenames, the Rev B combined file, README, and manifest.",
    ])
    (output / "README.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def clean_old_combined(output: Path) -> None:
    current = f"Mazak_VQC2040_Complete_Manual_Rev{REVISION}.pdf"
    for path in output.glob("Mazak_VQC2040_Complete_Manual_Rev*.pdf"):
        if path.name != current:
            path.unlink()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=REPO / "docs" / "manual_set")
    parser.add_argument("--source-ref", default=None, help="Commit/reference printed in each PDF")
    args = parser.parse_args()
    output = args.output.resolve()
    output.mkdir(parents=True, exist_ok=True)
    rows = read_authority()
    ref = args.source_ref or source_commit()
    paths = [build_volume(output, info, rows, ref) for info in VOLUME_INFO]
    clean_old_combined(output)
    combined = combine_pdfs(paths, output, ref)
    all_pdfs = [*paths, combined]
    write_manifest(output, all_pdfs, rows, ref)
    write_readme(output, all_pdfs, rows, ref)
    print(f"Built Rev {REVISION} in {output}")
    for path in all_pdfs:
        print(f"  {path.name}: {len(PdfReader(str(path)).pages)} pages, {sha256(path)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
