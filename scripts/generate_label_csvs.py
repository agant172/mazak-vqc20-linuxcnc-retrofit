#!/usr/bin/env python3
"""Generate and check the Epson label-printer CSV files from their authorities."""

from __future__ import annotations

import argparse
import csv
import io
import re
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent
AUTHORITY = REPO_ROOT / "mesa" / "current_pin_authority.csv"
BBIA_SOURCE = REPO_ROOT / "wiring" / "bbia1_cn_pinouts.csv"
# Mesa-end ferrules are derived straight from the authority's dest_connector /
# dest_pin (2026-09-05). The former input, bbia1_retrofit_destination_crosswalk.csv,
# drifted to 19 rows while the authority had 41 landings and is archived at
# archive/crosswalk/. A landing counts as TRACED when its authority_status is one
# of VERIFIED_STATES -- there is no separate trace register to keep in step.

# BBIA-1 pins where two OEM sources disagree about what is on the conductor.
# Every untraced landing already carries the blanket HOLD_SOURCE_TRACE, which makes
# a disputed pin indistinguishable from a corroborated one on the printed
# ferrule -- and these end up on a physical label at the cabinet. Rows listed
# here are released as HOLD_DISPUTED_PIN instead, so the dispute survives onto
# the label. Keyed by BBIA-1 location (CNx-pin); cite the register section.
DISPUTED_CROSSWALK_PINS = {
    # CN2-14 entry retired 2026-09-02 with its crosswalk row: sec 7.5 settled
    # CN2-14 = +LY2 (2nd +Y over-travel) and Z_LIMIT_PLUS is unlocated, so the
    # B-TB3-05 ferrule is withdrawn from the batch rather than held.
    "CN4-1": "wiring/authority_conflicts.md sec 7.1 residual / plane_a "
             "HOLD_OEM_CONFLICT — CN4-1 reads ZS1 (drive contact) while CN3-4 "
             "carries wire 143 (relay stage); jacket read at both pins decides "
             "which conductor lands IN5.",
}
LEGEND_OUT = REPO_ROOT / "wiring" / "labels" / "7i84u_b_terminal_legend_epson.csv"
BBIA_OUT = REPO_ROOT / "wiring" / "labels" / "bbia1_cn_labels_epson.csv"
MESA_FERRULE_OUT = REPO_ROOT / "wiring" / "labels" / "bbia1_mesa_end_ferrules_epson.csv"

VERIFIED_STATES = {"TRACED", "ELECTRICALLY_VERIFIED", "HAL_VERIFIED", "COMMISSIONED", "FIELD_VERIFIED"}

# Compact printer text is curated here; assignment, HAL net, status, and physical
# terminal are always derived from current_pin_authority.csv.
SIGNAL_LABELS = {
    "X_LIMIT_PLUS": "X LIMIT+ (NC)",
    "X_LIMIT_MINUS": "X LIMIT- (NC)",
    "Y_LIMIT_PLUS": "Y LIMIT+ (NC)",
    "Y_LIMIT_MINUS": "Y LIMIT- (NC)",
    "Z_LIMIT_PLUS": "Z LIMIT+ (NC)",
    "Z_LIMIT_MINUS": "Z LIMIT- (NC)",
    "X_HOME": "X HOME (LS-42? VERIFY)",
    "Y_HOME": "Y HOME (LS-52? VERIFY)",
    "Z_HOME": "Z HOME (LS-62, TB-51)",
    "AIR_OK": "AIR PRESSURE OK",
    "PROBE_SKIP1": "PROBE SKIP1 (MP-3; NC? VERIFY)",
    "X_DRIVE_ENABLE": "X ENABLE (DK-427; RLY TBD)",
    "Y_DRIVE_ENABLE": "Y ENABLE (DK-427; RLY TBD)",
    "Z_DRIVE_ENABLE": "Z ENABLE (DK-427; RLY TBD)",
    "AIR_BLAST": "SPINDLE AIR BLAST (SOL-15 / RLY-5)",
    "WORK_AIR_BLAST": "WORK AIR BLAST (SOL-16 / RLY-6)",
    "TAP_COOLANT_BLAST": "NOT USED (no tap-coolant solenoid)",
    "ATC_BARRIER_SOL": "ATC BARRIER (Y095? VERIFY)",
    "FLOOD_VALVE": "FLOOD VALVE (Y011; TRACE)",
    "MAG_COVER_CLOSE_SOL": "MAG COVER CLOSE (PROPOSED)",
    "WORK_LIGHT": "WORK LIGHT (100VAC / RLY-8)",
}

LEGEND_FIELDS = (
    "Terminal", "Physical_Pin", "Signal", "HAL_Net", "Authority_Status", "Release_Status"
)


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def release_status(status: str) -> str:
    if status in VERIFIED_STATES:
        return "RELEASED"
    if status.startswith("HOLD_"):
        return status
    if status == "PROPOSED":
        return "HOLD_TRACE"
    if status == "COMMISSIONING_PENDING":
        return "HOLD_COMMISSIONING"
    return "HOLD_" + (status or "UNCLASSIFIED")


def physical_pin(connector: str, channel: str) -> str:
    direction = "IN" if channel.startswith("IN") else "OUT"
    number = int(channel[len(direction):])
    if connector == "TB3" and direction == "IN" and 0 <= number <= 15:
        pin = number + 1
    elif connector == "TB3" and direction == "OUT" and 0 <= number <= 7:
        pin = number + 17
    elif connector == "TB2" and direction == "IN" and 16 <= number <= 31:
        pin = number - 15
    elif connector == "TB2" and direction == "OUT" and 8 <= number <= 15:
        pin = number + 9
    else:
        raise ValueError(f"invalid 7i84U terminal {connector}-{channel}")
    return f"{connector}-{pin:02d}"


def legend_rows() -> list[dict[str, str]]:
    authority = read_csv(AUTHORITY)
    by_id = {row["signal_id"]: row for row in authority}
    rows: list[dict[str, str]] = []
    # TB1 power/return terminals removed 2026-08-15 at owner request.

    allocated = [
        row for row in authority
        if row["mesa_card"] == "7i84U-B"
        and row["direction"] in {"IN", "OUT"}
        and row["authority_status"] != "SPARE"
    ]
    missing_labels = sorted({row["signal_id"] for row in allocated} - SIGNAL_LABELS.keys())
    stale_labels = sorted(SIGNAL_LABELS.keys() - {row["signal_id"] for row in allocated})
    if missing_labels or stale_labels:
        raise ValueError(f"curated label map mismatch: missing={missing_labels}, stale={stale_labels}")

    def order(row: dict[str, str]) -> tuple[int, int, int]:
        connector_order = 0 if row["connector"] == "TB3" else 1
        direction_order = 0 if row["direction"] == "IN" else 1
        number = int(row["pin_channel"].lstrip("INOUT"))
        return connector_order, direction_order, number

    for source in sorted(allocated, key=order):
        terminal = f"{source['connector']}-{source['pin_channel']}"
        rows.append({
            "Terminal": terminal,
            "Physical_Pin": physical_pin(source["connector"], source["pin_channel"]),
            "Signal": SIGNAL_LABELS[source["signal_id"]],
            "HAL_Net": source["hal_net"],
            "Authority_Status": source["authority_status"],
            "Release_Status": release_status(source["authority_status"]),
        })
    return rows




def bbia_rows() -> list[dict[str, str]]:
    return [
        {"Wire": row["Wire_No"], "Location": f"{row['Connector']}-{row['Pin']}", "Signal": row["Signal"]}
        for row in read_csv(BBIA_SOURCE) if row["Wire_No"] or row["Signal"]
    ]


def plane_a_landing(row: dict[str, str]) -> str | None:
    """Return "CNx-pin" for an authority row landed on a BBIA-1 connector, else None.

    dest_connector is free text and may carry an "OEM " decoration (WORK_LIGHT);
    Plane B rows use CNA connectors and pin ranges, which do not match.
    """
    connector = (row.get("dest_connector") or "").strip()
    if connector.upper().startswith("OEM "):
        connector = connector[4:].strip()
    pin = (row.get("dest_pin") or "").strip()
    if not re.fullmatch(r"CN\d+", connector) or not re.fullmatch(r"\d+", pin):
        return None
    return f"{connector}-{pin}"


def mesa_ferrule_rows() -> list[dict[str, str]]:
    """Every 7i84U input/output the authority lands on a BBIA-1 conductor.

    One row per (BBIA-1 pin -> Mesa terminal) hop, read directly from
    current_pin_authority.csv so the printed ferrule set and the wire reference
    sheet can never lag the authority. Refuses a pin absent from the OEM pinout
    and two signals claiming one pin.
    """
    sources = {row["Location"]: row for row in bbia_rows()}
    rows: list[dict[str, str]] = []
    seen: dict[str, str] = {}
    for target in read_csv(AUTHORITY):
        if target["mesa_card"] not in {"7i84U-A", "7i84U-B"} or target["direction"] not in {"IN", "OUT"}:
            continue
        if target["authority_status"] == "SPARE":
            continue
        location = plane_a_landing(target)
        if location is None:
            continue
        if location in seen:
            raise ValueError(
                f"two authority rows land on BBIA-1 {location}: {seen[location]} and {target['signal_id']}")
        seen[location] = target["signal_id"]
        source = sources.get(location)
        if source is None:
            raise ValueError(f"{target['signal_id']} lands on {location}, which is absent from BBIA pinouts")
        physical = physical_pin(target["connector"], target["pin_channel"])
        card_short = "A" if target["mesa_card"] == "7i84U-A" else "B"
        # Full connector-id format per e328799: board letter + full connector
        # + 1-based physical pin, e.g. "A-TB3-06", "B-TB3-09".
        label = f"{card_short}-{physical}"
        traced = target["authority_status"] in VERIFIED_STATES
        crosswalk_status = "TRACED" if traced else "PLANNED_MATCH"
        if location in DISPUTED_CROSSWALK_PINS:
            # A disputed pin is never released, even once traced -- the trace is
            # what resolves the dispute, and until the register section is
            # closed the label must say so.
            final_release = "HOLD_DISPUTED_PIN"
        elif not traced:
            final_release = "HOLD_SOURCE_TRACE"
        else:
            final_release = release_status(target["authority_status"])
        rows.append({
            "Label_Text": label,
            "Wire": source["Wire"],
            "Old_Location": location,
            "Signal": source["Signal"],
            "Mesa_Card": target["mesa_card"],
            "Connector": target["connector"],
            "Logical_Channel": target["pin_channel"],
            "Physical_Pin": physical,
            "Authority_ID": target["signal_id"],
            "Authority_Status": target["authority_status"],
            "Crosswalk_Status": crosswalk_status,
            "Release_Status": final_release,
        })

    def order(row: dict[str, str]) -> tuple[int, int]:
        connector, pin = row["Old_Location"].split("-")
        return int(connector[2:]), int(pin)

    rows.sort(key=order)
    return rows


def render(fields: tuple[str, ...], rows: list[dict[str, str]], line_ending: str) -> str:
    output = io.StringIO(newline="")
    writer = csv.DictWriter(output, fieldnames=fields, lineterminator=line_ending)
    writer.writeheader()
    writer.writerows(rows)
    return output.getvalue()


def expected_texts() -> dict[Path, str]:
    return {
        LEGEND_OUT: render(LEGEND_FIELDS, legend_rows(), "\r\n"),
        BBIA_OUT: render(("Wire", "Location", "Signal"), bbia_rows(), "\r\n"),
        MESA_FERRULE_OUT: render((
            "Label_Text", "Wire", "Old_Location", "Signal", "Mesa_Card",
            "Connector", "Logical_Channel", "Physical_Pin", "Authority_ID",
            "Authority_Status", "Crosswalk_Status", "Release_Status"
        ), mesa_ferrule_rows(), "\r\n"),
    }


def read_text_exact(path: Path) -> str:
    with path.open("r", encoding="utf-8", newline="") as handle:
        return handle.read()


def write_text_exact(path: Path, text: str) -> None:
    """Write text with no newline translation.

    The CSVs are rendered with explicit CRLF line endings, so the CRs must
    survive the write untouched. `Path.write_text(newline="")` only exists on
    Python 3.10+, and the Macs run the stock 3.9, so open the handle instead.
    """
    with path.open("w", encoding="utf-8", newline="") as handle:
        handle.write(text)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--check", action="store_true", help="fail if a generated CSV is stale")
    mode.add_argument("--write", action="store_true", help="regenerate all printer CSV files")
    args = parser.parse_args()
    stale: list[str] = []
    for path, expected in expected_texts().items():
        if args.write:
            write_text_exact(path, expected)
            print(f"wrote {path.relative_to(REPO_ROOT)}")
        elif not path.exists() or read_text_exact(path) != expected:
            stale.append(str(path.relative_to(REPO_ROOT)))
    if stale:
        print("stale label CSV: " + ", ".join(stale))
        print("run: python3 scripts/generate_label_csvs.py --write")
        return 1
    if args.check:
        print("label CSVs match their authority sources")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
