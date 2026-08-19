#!/usr/bin/env python3
"""Generate the installation-facing BBIA-1 pin crosswalk.

The immutable OEM connector transcription and the Mesa pin authority remain the
sources of truth.  This script joins them without upgrading a proposal, conflict,
or unallocated OEM conductor into a wire-release instruction.
"""

from __future__ import annotations

import csv
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PINOUT = ROOT / "wiring" / "bbia1_cn_pinouts.csv"
AUTHORITY = ROOT / "mesa" / "current_pin_authority.csv"
OUTPUT = ROOT / "wiring" / "plane_a_bbia1_pin_crosswalk.csv"

CONNECTOR_ORDER = ("CN200", "CN2", "CN1", "CN5", "CN6", "CN3", "CN11", "CN12", "CN4", "CN7")
EXPECTED_PINS = {
    "CN200": 20,
    "CN2": 50,
    "CN1": 20,
    "CN5": 20,
    "CN6": 50,
    "CN3": 50,
    "CN11": 20,
    "CN12": 20,
    "CN4": 20,
    "CN7": 50,
}

SOURCE_BY_CONNECTOR = {
    "CN1": "41434WB PDF p84, dwg 4143075321",
    "CN2": "41434WB PDF p84, dwg 4143075321",
    "CN3": "41434WB PDF p84, dwg 4143075321",
    "CN4": "41434WB PDF p84, dwg 4143075321; p127, dwg 4143075403 for SE1/SE2/SE3",
    "CN5": "41434WB PDF p85, dwg 4143075322",
    "CN6": "41434WB PDF p85, dwg 4143075322",
    "CN7": "41434WB PDF p86, dwg 4143015323",
    "CN11": "41434WB PDF p85, dwg 4143075322",
    "CN12": "41434WB PDF p78, dwg 4143175309; terminal-unit hop not independently pin-traced",
    "CN200": "41434WB PDF p74, dwg 4143075304; p85, dwg 4143075322",
}

# These authority destinations are deliberately retained for provenance, but a
# conflicting OEM table prevents them from being installation-released.
CONFLICT_PINS = {
    ("CN3", "39"): "CN3-39 is -LZ2 in the motion sheet but 147/OIL TEMP (and TOOL DETECTOR in another read) in the terminal-unit table; continuity trace required.",
    ("CN3", "44"): "CN3-44 is +LY2 in the motion sheet but SPTD/SPINDLE TIMER (and SPINDLE TOOL DETECTOR in another read) in the terminal-unit table; continuity trace required.",
    ("CN4", "1"): "CN4-1 zero-speed route conflicts with the separate CN3-4 zero-speed conductor; read both jacket labels and continuity-trace before landing.",
}

MANUAL_ROUTES = {
    ("CN4", "18"): {
        "signal_id": "SPINDLE_SPEED_SE1",
        "mesa_card": "7i49",
        "mesa_connector": "P3",
        "mesa_pin_channel": "TBD: 23/24 (GND3/AOUT3)",
        "hal_net": "spindle-speed-cmd",
        "authority_status": "HOLD_ANALOG_ROLE",
        "landing_status": "HOLD_ANALOG_ROLE",
        "required_verification": "Determine whether SE1 is command or common; verify 0-10 V scaling with the FR-SX disabled before landing.",
    },
    ("CN4", "19"): {
        "signal_id": "SPINDLE_SPEED_SE2",
        "mesa_card": "7i49",
        "mesa_connector": "P3",
        "mesa_pin_channel": "TBD: 23/24 (GND3/AOUT3)",
        "hal_net": "spindle-speed-cmd",
        "authority_status": "HOLD_ANALOG_ROLE",
        "landing_status": "HOLD_ANALOG_ROLE",
        "required_verification": "Determine whether SE2 is command or common; verify 0-10 V scaling with the FR-SX disabled before landing.",
    },
    ("CN4", "20"): {
        "signal_id": "SPINDLE_SPEED_SE3",
        "mesa_card": "none",
        "mesa_connector": "none",
        "mesa_pin_channel": "none",
        "hal_net": "none",
        "authority_status": "HOLD_ANALOG_ROLE",
        "landing_status": "HOLD_SHIELD_OR_COMMON",
        "required_verification": "Drawing ties SE3 to AGA; prove shield versus analog common before terminating it.",
    },
    ("CN200", "3"): {
        "signal_id": "PROBE_SKIP1_CANDIDATE",
        "mesa_card": "7i84U-B",
        "mesa_connector": "TB3",
        "mesa_pin_channel": "IN15",
        "hal_net": "probe-in",
        "authority_status": "PROPOSED",
        "landing_status": "HOLD_SOURCE_TRACE",
        "required_verification": "Continuity-trace the installed Renishaw MP-3 interface to CN200-3 and verify voltage, idle polarity, and fail-open behavior; MMS SKIP alone does not prove this is the retained probe conductor.",
    },
}

FIELDS = (
    "plane",
    "signal_id",
    "oem_connector",
    "oem_pin",
    "factory_wire",
    "oem_signal",
    "function",
    "inside_connector",
    "outside_connector",
    "disposition",
    "mesa_card",
    "mesa_connector",
    "mesa_pin_channel",
    "hal_net",
    "authority_status",
    "landing_status",
    "required_verification",
    "source_reference",
)


def normalize_connector(value: str) -> str:
    value = value.strip().upper()
    if value.startswith("OEM "):
        value = value[4:]
    return value


def load_rows(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8-sig") as handle:
        return list(csv.DictReader(handle))


def base_disposition(row: dict[str, str]) -> tuple[str, str]:
    signal = row["Signal"].strip()
    function = row["Function"].strip().lower()
    if not row["Wire_No"].strip() or "not used" in signal.lower():
        return "NO_CONNECTION", "No conductor to land; positively unused on the cited OEM table."
    if function == "spare":
        return "OEM_SPARE_CONDUCTOR", "A factory spare conductor exists; insulate and preserve its identity unless a reviewed revision deliberately repurposes it."
    if function in {"power", "common"}:
        return "OEM_POWER_OR_COMMON", "Do not assign to a signal input/output; preserve the documented electrical domain and verify rail disposition separately."
    if function == "safety" or "emergency stop" in signal.lower():
        return "OEM_SAFETY_RETAIN", "Retain in the untouched OEM safety circuit; no Mesa GPIO route."
    if function == "2pc pallet":
        return "NO_MESA_ALLOCATION_2PC", "No current Mesa allocation; retain/retire only by an explicit pallet-changer scope decision."
    return "NO_MESA_ALLOCATION", "No current Mesa authority row claims this conductor; review only if the OEM function is retained."


def main() -> None:
    pinouts = [r for r in load_rows(PINOUT) if r["Connector"] in EXPECTED_PINS]
    by_connector: dict[str, dict[str, dict[str, str]]] = {c: {} for c in CONNECTOR_ORDER}
    for row in pinouts:
        connector, pin = row["Connector"], row["Pin"].strip()
        if pin in by_connector[connector]:
            raise SystemExit(f"duplicate OEM location: {connector}-{pin}")
        by_connector[connector][pin] = row

    for connector, count in EXPECTED_PINS.items():
        expected = {str(i) for i in range(1, count + 1)}
        actual = set(by_connector[connector])
        if expected != actual:
            raise SystemExit(
                f"{connector} accounting mismatch; missing={sorted(expected-actual)} extra={sorted(actual-expected)}"
            )

    authority_by_location: dict[tuple[str, str], dict[str, str]] = {}
    for row in load_rows(AUTHORITY):
        connector = normalize_connector(row["dest_connector"])
        pin = row["dest_pin"].strip()
        if connector not in EXPECTED_PINS or not pin.isdigit():
            continue
        key = (connector, pin)
        if key in authority_by_location:
            raise SystemExit(f"multiple authority rows claim {connector}-{pin}")
        authority_by_location[key] = row

    output_rows: list[dict[str, str]] = []
    for connector in CONNECTOR_ORDER:
        for number in range(1, EXPECTED_PINS[connector] + 1):
            pin = str(number)
            source = by_connector[connector][pin]
            disposition, action = base_disposition(source)
            out = {
                "plane": "A",
                "signal_id": "",
                "oem_connector": connector,
                "oem_pin": pin,
                "factory_wire": source["Wire_No"].strip(),
                "oem_signal": source["Signal"].strip(),
                "function": source["Function"].strip(),
                "inside_connector": source["Inside_Connec"].strip(),
                "outside_connector": source["Outside_Connec"].strip(),
                "disposition": disposition,
                "mesa_card": "none",
                "mesa_connector": "none",
                "mesa_pin_channel": "none",
                "hal_net": "none",
                "authority_status": "UNALLOCATED",
                "landing_status": disposition,
                "required_verification": action,
                "source_reference": SOURCE_BY_CONNECTOR[connector],
            }

            authority = authority_by_location.get((connector, pin))
            if authority:
                out.update({
                    "signal_id": authority["signal_id"],
                    "disposition": "MESA_ROUTE",
                    "mesa_card": authority["mesa_card"],
                    "mesa_connector": authority["connector"],
                    "mesa_pin_channel": authority["pin_channel"],
                    "hal_net": authority["hal_net"],
                    "authority_status": authority["authority_status"],
                    "landing_status": (
                        "ROUTE_DEFINED_FIELD_VERIFY"
                        if authority["authority_status"] == "FACTORY_INTERFACE"
                        else f"HOLD_{authority['authority_status']}"
                    ),
                    "required_verification": authority["cleanup_notes"],
                })
                if authority["factory_wire"].strip() != source["Wire_No"].strip():
                    out["landing_status"] = "HOLD_OEM_CONFLICT"
                    out["required_verification"] = (
                        f"Authority wire {authority['factory_wire']} conflicts with terminal-unit table wire {source['Wire_No']}. "
                        + CONFLICT_PINS.get((connector, pin), "Continuity trace required before landing.")
                    )

            if (connector, pin) in MANUAL_ROUTES:
                if authority:
                    raise SystemExit(f"manual route duplicates authority at {connector}-{pin}")
                out.update(MANUAL_ROUTES[(connector, pin)])
                out["disposition"] = "MESA_ROUTE_CANDIDATE"

            if (connector, pin) in CONFLICT_PINS:
                out["landing_status"] = "HOLD_OEM_CONFLICT"
                out["required_verification"] = CONFLICT_PINS[(connector, pin)]

            output_rows.append(out)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=FIELDS, lineterminator="\n")
        writer.writeheader()
        writer.writerows(output_rows)

    routed = sum(r["disposition"].startswith("MESA_ROUTE") for r in output_rows)
    held = sum(r["landing_status"].startswith("HOLD_") for r in output_rows)
    print(f"wrote {OUTPUT.relative_to(ROOT)}: {len(output_rows)} pins, {routed} Mesa routes/candidates, {held} held")


if __name__ == "__main__":
    main()
