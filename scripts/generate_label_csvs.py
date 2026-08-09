#!/usr/bin/env python3
"""Generate and check the Epson label-printer CSV files from their authorities."""

from __future__ import annotations

import argparse
import csv
import io
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent
AUTHORITY = REPO_ROOT / "mesa" / "current_pin_authority.csv"
BBIA_SOURCE = REPO_ROOT / "wiring" / "bbia1_cn_pinouts.csv"
DESTINATION_CROSSWALK = REPO_ROOT / "wiring" / "bbia1_retrofit_destination_crosswalk.csv"
LEGEND_OUT = REPO_ROOT / "wiring" / "7i84u_b_terminal_legend_epson.csv"
BBIA_OUT = REPO_ROOT / "wiring" / "bbia1_cn_labels_epson.csv"
MESA_FERRULE_OUT = REPO_ROOT / "wiring" / "bbia1_mesa_end_ferrules_epson.csv"

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
    "AIR_BLAST": "AIR BLAST (SOL-62? / RLY-5)",
    "TOUCH_SENSOR_BLAST": "TOUCH SENSOR BLAST (SOL-35 / RLY-6)",
    "TAP_COOLANT_BLAST": "TAP COOLANT BLAST (SOL-61 / RLY-7)",
    "ATC_BARRIER_SOL": "ATC BARRIER (Y095? VERIFY)",
    "FLOOD_VALVE": "FLOOD VALVE (Y011; TRACE)",
    "MAG_COVER_CLOSE_SOL": "MAG COVER CLOSE (PROPOSED)",
}

POWER_ROWS = (
    ("SEVENI84UB_FIELD_B_24V", (1, 2), "VFIELDB +24V (TB2 BANK)", "7i84U-B VFIELDB"),
    ("SEVENI84UB_FIELD_A_24V", (3, 4), "VFIELDA +24V (TB3 BANK)", "7i84U-B VFIELDA"),
    ("SEVENI84UB_VIN_24V", (5,), "VIN LOGIC +24V (VERIFY W1)", "7i84U-B VIN"),
    ("SEVENI84UB_GND", (6, 7, 8), "FIELD/VIN COMMON 0V", "7i84U-B GND"),
)

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
    for signal_id, pins, signal, reference in POWER_ROWS:
        source = by_id[signal_id]
        for pin in pins:
            rows.append({
                "Terminal": f"TB1-{pin}", "Physical_Pin": f"TB1-{pin:02d}",
                "Signal": signal, "HAL_Net": reference,
                "Authority_Status": source["authority_status"],
                "Release_Status": release_status(source["authority_status"]),
            })

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


def mesa_ferrule_rows() -> list[dict[str, str]]:
    """Build the conservative direct-to-Mesa subset of cut BBIA conductors."""
    authority = {row["signal_id"]: row for row in read_csv(AUTHORITY)}
    sources = {row["Location"]: row for row in bbia_rows()}
    rows: list[dict[str, str]] = []
    seen: set[str] = set()
    for crosswalk in read_csv(DESTINATION_CROSSWALK):
        location = crosswalk["Old_Location"]
        if location in seen:
            raise ValueError(f"duplicate retrofit destination crosswalk row {location}")
        seen.add(location)
        if crosswalk["Disposition"] != "MESA_DIRECT_PLANNED":
            continue
        source = sources.get(location)
        if source is None:
            raise ValueError(f"retrofit crosswalk source {location} is absent from BBIA pinouts")
        target = authority.get(crosswalk["Authority_ID"])
        if target is None:
            raise ValueError(f"retrofit crosswalk target {crosswalk['Authority_ID']} is absent from authority")
        if target["mesa_card"] not in {"7i84U-A", "7i84U-B"} or target["direction"] not in {"IN", "OUT"}:
            raise ValueError(f"retrofit crosswalk target {crosswalk['Authority_ID']} is not direct 7i84U I/O")
        if target["authority_status"] == "SPARE":
            raise ValueError(f"retrofit crosswalk target {crosswalk['Authority_ID']} is SPARE")
        physical = physical_pin(target["connector"], target["pin_channel"])
        card_short = "A" if target["mesa_card"] == "7i84U-A" else "B"
        # Full connector-id format per e328799: board letter + full connector
        # + 1-based physical pin, e.g. "A-TB3-06", "B-TB3-09".
        label = f"{card_short}-{physical}"
        crosswalk_status = crosswalk["Crosswalk_Status"]
        if crosswalk_status not in {"PLANNED_MATCH", "TRACED"}:
            raise ValueError(f"unsupported crosswalk status {crosswalk_status} at {location}")
        final_release = "HOLD_SOURCE_TRACE" if crosswalk_status != "TRACED" else release_status(target["authority_status"])
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


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--check", action="store_true", help="fail if a generated CSV is stale")
    mode.add_argument("--write", action="store_true", help="regenerate all printer CSV files")
    args = parser.parse_args()
    stale: list[str] = []
    for path, expected in expected_texts().items():
        if args.write:
            path.write_text(expected, encoding="utf-8", newline="")
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
