#!/usr/bin/env python3
"""Generate a printable BBIA-1 wire reference sheet (HTML) for lamination.

Combines wiring/labels/bbia1_cn_labels_epson.csv (OEM wire / CN pin / signal)
with wiring/labels/bbia1_mesa_end_ferrules_epson.csv (planned Mesa landing,
where one exists) into a compact letter-size sheet grouped by connector.
Open the HTML in a browser and print (or print to PDF) for lamination.

Regenerate after any label CSV change:
    python3 scripts/generate_wire_reference_sheet.py
"""
from __future__ import annotations

import csv
import datetime
import subprocess
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
CN_LABELS = REPO_ROOT / "wiring" / "labels" / "bbia1_cn_labels_epson.csv"
FERRULES = REPO_ROOT / "wiring" / "labels" / "bbia1_mesa_end_ferrules_epson.csv"
OUT = REPO_ROOT / "wiring" / "labels" / "bbia1_wire_reference_sheet.html"


def read_rows(path: Path) -> list[dict[str, str]]:
    with path.open(newline="") as handle:
        return list(csv.DictReader(handle))


def git_head() -> str:
    try:
        return subprocess.check_output(
            ["git", "rev-parse", "--short", "HEAD"], cwd=REPO_ROOT, text=True
        ).strip()
    except Exception:
        return "unknown"


def build() -> str:
    cn_rows = read_rows(CN_LABELS)
    ferrule_by_location = {r["Old_Location"]: r for r in read_rows(FERRULES)}

    groups: dict[str, list[dict[str, str]]] = {}
    for row in cn_rows:
        conn = row["Location"].split("-")[0]
        groups.setdefault(conn, []).append(row)

    def pin_key(row: dict[str, str]) -> int:
        try:
            return int(row["Location"].split("-", 1)[1])
        except ValueError:
            return 999

    stamp = datetime.date.today().isoformat()
    head = git_head()
    parts = [
        "<!DOCTYPE html><html><head><meta charset='utf-8'>",
        "<title>BBIA-1 Wire Reference — Mazak VQC-20/40 SN 060231</title>",
        "<style>",
        # Print-dark styling: pure black text everywhere, medium base weight,
        # no light grays (printers dither gray -> faint output).
        "body{font:9pt/1.25 'Helvetica Neue',Arial,sans-serif;margin:0.4in;color:#000;",
        "     font-weight:500;-webkit-print-color-adjust:exact;print-color-adjust:exact}",
        "h1{font-size:13pt;margin:0 0 2pt;font-weight:700}",
        ".sub{font-size:8pt;color:#000;margin:0 0 8pt}",
        ".warn{font-size:8pt;border:2pt solid #000;padding:4pt 6pt;margin:0 0 8pt;font-weight:700}",
        "h2{font-size:10pt;margin:8pt 0 3pt;border-bottom:1.5pt solid #000;page-break-after:avoid;font-weight:700}",
        "table{border-collapse:collapse;width:100%;page-break-inside:auto}",
        "tr{page-break-inside:avoid}",
        "th{text-align:left;font-size:7.5pt;text-transform:uppercase;letter-spacing:0.04em;",
        "   border-bottom:1.5pt solid #000;padding:1pt 6pt 1pt 0;font-weight:700}",
        "td{border-bottom:0.75pt solid #000;padding:1.5pt 6pt 1.5pt 0;vertical-align:top}",
        "td.wire{font-weight:700;font-family:Menlo,Consolas,monospace;white-space:nowrap}",
        "td.pin,td.mesa{font-family:Menlo,Consolas,monospace;white-space:nowrap}",
        "td.mesa{font-weight:700}",
        "td.hold{color:#000;font-size:7.5pt;font-style:italic}",
        ".cols{column-count:2;column-gap:0.3in}",
        "@media print{.cols{column-count:2}}",
        "@page{size:letter;margin:0.4in}",
        "</style></head><body>",
        "<h1>BBIA-1 Wire Reference — Mazak VQC-20/40 SN 060231</h1>",
        f"<p class='sub'>Generated {stamp} from repo commit {head} "
        "(wiring/labels/*.csv). Regenerate with scripts/generate_wire_reference_sheet.py "
        "after any label CSV change — do not hand-edit this sheet.</p>",
        "<div class='warn'>REFERENCE ONLY — NOT PERMISSION TO TERMINATE. Mesa landings "
        "marked HOLD are planned assignments pending continuity trace and terminal "
        "verification (see wiring/labels/*.md release rules). The hardwired E-stop "
        "chain is not represented here.</div>",
        "<div class='cols'>",
    ]

    for conn in sorted(groups, key=lambda c: (len(c), c)):
        rows = sorted(groups[conn], key=pin_key)
        parts.append(f"<h2>{conn} — {len(rows)} conductors</h2>")
        parts.append("<table><tr><th>Wire</th><th>Pin</th><th>Signal</th>"
                     "<th>Mesa landing</th></tr>")
        for row in rows:
            ferrule = ferrule_by_location.get(row["Location"])
            if ferrule:
                released = ferrule["Release_Status"] == "RELEASED"
                mesa = ferrule["Label_Text"] + ("" if released else " <span class='hold'>HOLD</span>")
                mesa_class = "mesa"
            else:
                mesa, mesa_class = "&mdash;", "hold"
            parts.append(
                f"<tr><td class='wire'>{row['Wire']}</td>"
                f"<td class='pin'>{row['Location'].split('-', 1)[1]}</td>"
                f"<td>{row['Signal']}</td>"
                f"<td class='{mesa_class}'>{mesa}</td></tr>"
            )
        parts.append("</table>")

    parts.append("</div></body></html>")
    return "\n".join(parts)


if __name__ == "__main__":
    OUT.write_text(build(), encoding="utf-8")
    print(f"wrote {OUT}")
