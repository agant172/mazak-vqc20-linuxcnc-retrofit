#!/usr/bin/env python3
"""
validate_authority.py

Cross-checks every physical Mesa pin reference in the LinuxCNC HAL files
against mesa/current_pin_authority.csv, which is the single source of
truth for pin -> signal assignment on the retrofit stack.

The hierarchy this script enforces is documented in
docs/authority_hierarchy.md.  In short:

  mesa/current_pin_authority.csv   -> authoritative
  linuxcnc/*.hal                   -> must agree with the CSV on every
                                       physical pin reference
  wiring/, docs/, PDFs, notes/     -> non-authoritative

Scope of this validator (v1)
----------------------------
Physical pin references it understands:

  hm2_7i80.0.7i84.0.<0|1>.<input|output>-<NN>
  hm2_7i80.0.resolver.<NN>.position        -> 7i49 RES<N>
  hm2_7i80.0.pwmgen.<NN>.value             -> 7i49 AOUT<N>

It also requires one exact CSV row for every physical 7i84U input/output;
aggregate range rows are rejected because they can overlap explicit pins.
Any active direct 7i80HDT P2 GPIO reference is rejected by the companion
control-logic validator.

Exit code
---------
  0  -> HAL and CSV agree on every checked pin (no ERRORS).
        A non-empty list of WARNINGS (SPARE / commented-only / etc.) is
        still allowed and does not fail the check.
  1  -> at least one ERROR: mismatched hal_net, missing CSV row,
        wrong direction, or duplicate physical assignment.

Run:
  python3 scripts/validate_authority.py

Or from anywhere in the repo:
  ./scripts/validate_authority.py
"""

from __future__ import annotations

import csv
import re
import sys
from collections import defaultdict
from pathlib import Path

# ----------------------------------------------------------------------
# Paths (repo-root relative).  The script figures out repo root by
# walking up from its own location; running it from any subdirectory
# still works.
# ----------------------------------------------------------------------

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent
CSV_PATH = REPO_ROOT / "mesa" / "current_pin_authority.csv"
HAL_DIR = REPO_ROOT / "linuxcnc"
CAPACITY_DOC = REPO_ROOT / "docs" / "io_capacity_reconciliation.md"
LEGEND_PATH = REPO_ROOT / "wiring" / "7i84u_b_terminal_legend_epson.csv"

# ----------------------------------------------------------------------
# Regexes for HAL parsing.
# ----------------------------------------------------------------------

# A physical 7i84U pin reference, e.g. hm2_7i80.0.7i84.0.0.input-15 or
# hm2_7i80.0.7i84.0.1.output-03  -- with an optional trailing attribute
# such as .invert_input which we capture separately so we can ignore
# it while identifying the pin.
PIN_RE = re.compile(
    r"hm2_7i80\.0\.7i84\.0\.(?P<port>[01])\.(?P<dir>input|output)-(?P<nn>\d{2})"
    r"(?P<attr>\.\w+)?"
)

RESOLVER_RE = re.compile(r"hm2_7i80\.0\.resolver\.(?P<nn>\d{2})\.position")
PWMGEN_RE = re.compile(r"hm2_7i80\.0\.pwmgen\.(?P<nn>\d{2})\.value")

# A HAL 'net' statement.  The subset we care about is the ones that
# bind a physical pin either as source (=>) or sink (<=) of a net.
# Grammar variants we accept:
#   net <name> <= hm2_7i80....
#   net <name> => hm2_7i80....
#   net <name> hm2_7i80.... (implicit assignment)
NET_RE = re.compile(r"^\s*net\s+(?P<name>\S+)\s+(?P<rest>.+)$")

# ----------------------------------------------------------------------
# Data structures.
# ----------------------------------------------------------------------

class Finding:
    """One validation message.  Level is 'ERROR' or 'WARN'."""

    def __init__(self, level: str, where: str, message: str) -> None:
        self.level = level
        self.where = where
        self.message = message

    def __str__(self) -> str:  # pragma: no cover
        return f"[{self.level}] {self.where}: {self.message}"


def csv_card_for_port(port: str) -> str:
    """Map smart-serial channel number to the CSV mesa_card value."""
    return "7i84U-A" if port == "0" else "7i84U-B"


def pin_key(port: str, direction: str, nn: str) -> str:
    """Canonical pin identifier, e.g. '7i84U-A/input-15'."""
    return f"{csv_card_for_port(port)}/{direction}-{nn}"


def csv_pin_channel(direction: str, nn: str) -> str:
    """CSV pin_channel value for a given direction and pin number."""
    prefix = "IN" if direction == "input" else "OUT"
    return f"{prefix}{int(nn)}"


# ----------------------------------------------------------------------
# CSV loader.
# ----------------------------------------------------------------------

def load_csv() -> tuple[dict[str, dict], list[dict]]:
    """
    Return (by_pin, all_rows).

    by_pin maps '<card>/<dir>-NN' -> row for 7i84U rows only.
    all_rows is the full CSV as a list of dicts.
    """
    if not CSV_PATH.exists():
        print(f"[FATAL] authority CSV not found: {CSV_PATH}", file=sys.stderr)
        sys.exit(2)

    rows = list(csv.DictReader(CSV_PATH.open()))
    by_pin: dict[str, dict] = {}
    for r in rows:
        card = r["mesa_card"]
        if not card.startswith("7i84U"):
            continue
        # Only rows with a single-pin channel (IN0..IN31 or OUT0..OUT15).
        m = re.fullmatch(r"(IN|OUT)(\d{1,2})", r["pin_channel"].strip())
        if not m:
            continue
        direction = "input" if m.group(1) == "IN" else "output"
        nn = m.group(2).zfill(2)
        key = f"{card}/{direction}-{nn}"
        # Duplicate CSV rows for the same physical pin are themselves
        # a data integrity problem.  Record but don't overwrite.
        if key in by_pin:
            by_pin[key] = {"__duplicate__": True, **r}
        else:
            by_pin[key] = r
    return by_pin, rows


def check_csv_integrity(rows: list[dict], by_pin: dict[str, dict]) -> list[Finding]:
    """Enforce one exact authority row per 7i84U terminal and unique IDs."""
    findings: list[Finding] = []
    ids: dict[str, int] = {}
    for lineno, row in enumerate(rows, start=2):
        sid = (row.get("signal_id") or "").strip()
        if sid in ids:
            findings.append(Finding("ERROR", f"{CSV_PATH.name}:{lineno}",
                                    f"duplicate signal_id '{sid}' (first at line {ids[sid]})."))
        ids[sid] = lineno

        if (row.get("mesa_card") or "").startswith("7i84U"):
            channel = (row.get("pin_channel") or "").strip()
            if re.fullmatch(r"(?:IN|OUT)\d+\s*-\s*(?:(?:IN|OUT))?\d+", channel):
                findings.append(Finding(
                    "ERROR", f"{CSV_PATH.name}:{lineno}",
                    f"aggregate 7i84U range '{channel}' is forbidden; create one row per terminal."
                ))

    expected = {
        f"7i84U-{card}/{direction}-{nn:02d}"
        for card in ("A", "B")
        for direction, limit in (("input", 32), ("output", 16))
        for nn in range(limit)
    }
    actual = set(by_pin)
    for key, row in sorted(by_pin.items()):
        if row.get("__duplicate__"):
            findings.append(Finding("ERROR", CSV_PATH.name,
                                    f"more than one authority row claims physical terminal {key}."))
    for key in sorted(expected - actual):
        findings.append(Finding("ERROR", CSV_PATH.name,
                                f"missing exact authority row for physical terminal {key}."))
    for key in sorted(actual - expected):
        findings.append(Finding("ERROR", CSV_PATH.name,
                                f"out-of-range 7i84U terminal row {key}."))
    return findings


def check_7i49_motion_bindings(rows: list[dict]) -> list[Finding]:
    """Cross-check active resolver position and analog command bindings."""
    findings: list[Finding] = []
    authority = {
        (r.get("pin_channel") or "").strip(): r
        for r in rows if (r.get("mesa_card") or "").strip() == "7i49"
    }
    for hal_file in sorted(HAL_DIR.glob("*.hal")):
        for lineno, raw in enumerate(hal_file.read_text().splitlines(), start=1):
            code = strip_comment(raw).strip()
            m_net = NET_RE.match(code)
            if not m_net:
                continue
            net_name = m_net.group("name")
            for regex, prefix in ((RESOLVER_RE, "RES"), (PWMGEN_RE, "AOUT")):
                for match in regex.finditer(code):
                    channel = f"{prefix}{int(match.group('nn'))}"
                    row = authority.get(channel)
                    where = f"{hal_file.relative_to(REPO_ROOT)}:{lineno}"
                    if row is None:
                        findings.append(Finding(
                            "ERROR", where,
                            f"active {channel} binding has no exact 7i49 authority row."
                        ))
                        continue
                    csv_net = (row.get("hal_net") or "").strip()
                    if csv_net != net_name:
                        findings.append(Finding(
                            "ERROR", where,
                            f"HAL binds {channel} to '{net_name}' but CSV says '{csv_net}'."
                        ))
    return findings


def check_capacity_and_legend(rows: list[dict]) -> list[Finding]:
    """Keep documented counts and the B-card terminal legend tied to authority."""
    findings: list[Finding] = []
    counts: dict[tuple[str, str], int] = defaultdict(int)
    expected_legend: dict[str, str] = {}

    for row in rows:
        card = (row.get("mesa_card") or "").strip()
        direction = (row.get("direction") or "").strip()
        status = (row.get("authority_status") or "").strip()
        channel = (row.get("pin_channel") or "").strip()
        if card not in {"7i84U-A", "7i84U-B"} or direction not in {"IN", "OUT"}:
            continue
        if status != "SPARE":
            counts[(card, direction)] += 1
        if card != "7i84U-B" or status == "SPARE":
            continue
        match = re.fullmatch(r"(IN|OUT)(\d+)", channel)
        if not match:
            continue
        number = int(match.group(2))
        block = "TB3" if (direction == "IN" and number < 16) or (direction == "OUT" and number < 8) else "TB2"
        expected_legend[f"{block}-{direction}{number}"] = (row.get("hal_net") or "").strip()

    a_in, a_out = counts[("7i84U-A", "IN")], counts[("7i84U-A", "OUT")]
    b_in, b_out = counts[("7i84U-B", "IN")], counts[("7i84U-B", "OUT")]
    capacity = CAPACITY_DOC.read_text()
    required_lines = (
        f"| 7i84U-A | {a_in} | {a_out} |",
        f"| 7i84U-B | {b_in} | {b_out} |",
        f"| **Total** | **{a_in + b_in}** | **{a_out + b_out}** |",
    )
    for line in required_lines:
        if line not in capacity:
            findings.append(Finding("ERROR", str(CAPACITY_DOC.relative_to(REPO_ROOT)),
                                    f"capacity table does not match authority; expected text '{line}'."))

    legend_rows = list(csv.DictReader(LEGEND_PATH.open()))
    actual_legend = {
        (row.get("Terminal") or "").strip(): (row.get("HAL_Net") or "").strip()
        for row in legend_rows
        if not (row.get("Terminal") or "").startswith("TB1-")
    }
    for terminal in sorted(expected_legend.keys() - actual_legend.keys()):
        findings.append(Finding("ERROR", str(LEGEND_PATH.relative_to(REPO_ROOT)),
                                f"allocated 7i84U-B terminal {terminal} is missing from the print legend."))
    for terminal in sorted(actual_legend.keys() - expected_legend.keys()):
        findings.append(Finding("ERROR", str(LEGEND_PATH.relative_to(REPO_ROOT)),
                                f"legend labels unallocated/spare 7i84U-B terminal {terminal}."))
    for terminal in sorted(expected_legend.keys() & actual_legend.keys()):
        if actual_legend[terminal] != expected_legend[terminal]:
            findings.append(Finding(
                "ERROR", str(LEGEND_PATH.relative_to(REPO_ROOT)),
                f"{terminal} legend net '{actual_legend[terminal]}' does not match authority "
                f"'{expected_legend[terminal]}'."
            ))
    return findings


# ----------------------------------------------------------------------
# HAL parser.
# ----------------------------------------------------------------------

def strip_comment(line: str) -> str:
    """Return the code portion of a HAL line (everything before '#')."""
    idx = line.find("#")
    return line if idx < 0 else line[:idx]


def parse_hal_files() -> tuple[dict[str, list[dict]], list[Finding]]:
    """
    Scan every .hal file in linuxcnc/ and return:

      hal_pins: pin_key -> list of {file, lineno, net_name, direction_hint, attr}
      findings: parse-time findings (very rare - stray syntax notes)

    direction_hint is one of:
      'source'    -> the pin was on the right of '=>' or '<=' -- physical pin drives net
      'sink'      -> the pin was on the right of an outgoing arrow -- net drives pin
      'setp'      -> `setp <pin>.attr value`
      'implicit'  -> `net foo <pin>` with no arrow
    """
    hal_pins: dict[str, list[dict]] = defaultdict(list)
    findings: list[Finding] = []

    for hal_file in sorted(HAL_DIR.glob("*.hal")):
        for lineno, raw in enumerate(hal_file.read_text().splitlines(), start=1):
            code = strip_comment(raw).rstrip()
            if not code.strip():
                continue

            pin_matches = list(PIN_RE.finditer(code))
            if not pin_matches:
                continue

            net_match = NET_RE.match(code)
            for pm in pin_matches:
                key = pin_key(pm.group("port"), pm.group("dir"), pm.group("nn"))

                direction_hint = "implicit"
                net_name = None
                if code.lstrip().startswith("setp"):
                    direction_hint = "setp"
                elif net_match:
                    net_name = net_match.group("name")
                    rest = net_match.group("rest")
                    # Look for the arrow immediately before this pin's
                    # position within `rest`.  We search backward from
                    # the pin token.
                    pin_start_in_rest = rest.find(pm.group(0))
                    if pin_start_in_rest >= 0:
                        prefix = rest[:pin_start_in_rest]
                        if "=>" in prefix:
                            direction_hint = "sink"       # net drives pin
                        elif "<=" in prefix:
                            direction_hint = "source"     # pin drives net

                hal_pins[key].append(
                    {
                        "file": str(hal_file.relative_to(REPO_ROOT)),
                        "lineno": lineno,
                        "net_name": net_name,
                        "direction_hint": direction_hint,
                        "attr": pm.group("attr") or "",
                        "line": code.strip(),
                    }
                )

    return hal_pins, findings


# ----------------------------------------------------------------------
# Cross-check.
# ----------------------------------------------------------------------

def cross_check(
    csv_by_pin: dict[str, dict], hal_pins: dict[str, list[dict]]
) -> list[Finding]:
    findings: list[Finding] = []

    # 1) Every HAL pin reference must exist in the CSV.
    #    2) If the HAL line binds a net, the net name must equal
    #       csv row's hal_net (case-sensitive).
    for pin, occs in sorted(hal_pins.items()):
        csv_row = csv_by_pin.get(pin)
        first = occs[0]
        where = f"{first['file']}:{first['lineno']}"

        if csv_row is None:
            findings.append(
                Finding(
                    "ERROR",
                    where,
                    f"HAL references physical pin {pin} but CSV has no row for it. "
                    "Add a row to mesa/current_pin_authority.csv or remove the "
                    "reference.",
                )
            )
            continue

        if csv_row.get("__duplicate__"):
            findings.append(
                Finding(
                    "ERROR",
                    "mesa/current_pin_authority.csv",
                    f"CSV has more than one row for physical pin {pin}. "
                    "Physical pin authority must be one-to-one.",
                )
            )
            # keep going -- the mismatch report below is still useful

        # Check every net_name that HAL binds to this pin.
        hal_net_names = {
            o["net_name"] for o in occs if o["net_name"]
        }
        csv_net = (csv_row.get("hal_net") or "").strip()

        if hal_net_names:
            for hn in hal_net_names:
                if csv_net in ("", "none"):
                    findings.append(
                        Finding(
                            "ERROR",
                            where,
                            f"HAL binds net '{hn}' to {pin} but CSV hal_net is "
                            f"'{csv_net or '(empty)'}'. Either update the CSV "
                            "or drop the HAL binding.",
                        )
                    )
                elif hn != csv_net:
                    findings.append(
                        Finding(
                            "ERROR",
                            where,
                            f"HAL binds net '{hn}' to {pin} but CSV says the "
                            f"net for that pin is '{csv_net}'.",
                        )
                    )

        # Non-blocking warnings about status.  SPARE / RESERVED pins that
        # are actively wired in HAL are noteworthy.
        status = (csv_row.get("authority_status") or "").strip()
        if status in {"SPARE"} and hal_net_names:
            findings.append(
                Finding(
                    "ERROR",
                    where,
                    f"HAL binds net(s) {sorted(hal_net_names)} to {pin} but CSV "
                    f"status is {status}. Either promote the CSV row or drop "
                    "the HAL binding.",
                )
            )
        if status in {"HOLD_CONFLICT"}:
            # Any active HAL binding on a conflict pin is a hard error;
            # a setp on it (e.g. invert_input) is a warning because that
            # can be legitimately pre-staged.
            if any(o["direction_hint"] in {"source", "sink"} for o in occs):
                findings.append(
                    Finding(
                        "ERROR",
                        where,
                        f"{pin} is HOLD_CONFLICT in CSV but HAL actively binds "
                        f"net(s) {sorted(hal_net_names)}. Resolve conflict in "
                        "wiring/authority_conflicts.md first.",
                    )
                )

    # 3) Every 7i84U CSV row with a hal_net value should have at least
    #    one matching HAL binding, otherwise the CSV is documenting a
    #    signal that is not actually being used by the control.
    for pin, row in sorted(csv_by_pin.items()):
        hal_net = (row.get("hal_net") or "").strip()
        status = (row.get("authority_status") or "").strip()
        if hal_net in ("", "none"):
            continue
        occs = hal_pins.get(pin, [])
        # Only real bindings count -- setp lines don't declare a net.
        binding_nets = {
            o["net_name"] for o in occs
            if o["net_name"] and o["direction_hint"] in {"source", "sink", "implicit"}
        }
        if hal_net in binding_nets:
            continue
        # No HAL binding.  This is a WARN, not an ERROR, because signals
        # can be legitimately pre-planned before their HAL logic is
        # written -- but it is a signal that the CSV and HAL are
        # drifting.
        findings.append(
            Finding(
                "WARN",
                "mesa/current_pin_authority.csv",
                f"CSV row {pin} plans net '{hal_net}' (status={status}) but no "
                "HAL file binds that net to that physical pin. Either wire it "
                "in HAL or set hal_net to 'none' and status to SPARE/RESERVED.",
            )
        )

    return findings


# ----------------------------------------------------------------------
# Main.
# ----------------------------------------------------------------------

def main() -> int:
    csv_by_pin, all_rows = load_csv()
    hal_pins, parse_findings = parse_hal_files()

    findings = (
        parse_findings
        + check_csv_integrity(all_rows, csv_by_pin)
        + cross_check(csv_by_pin, hal_pins)
        + check_7i49_motion_bindings(all_rows)
        + check_capacity_and_legend(all_rows)
    )

    errors = [f for f in findings if f.level == "ERROR"]
    warnings = [f for f in findings if f.level == "WARN"]

    print("scripts/validate_authority.py")
    print("=" * 60)
    print(f"CSV rows:              {len(all_rows)}")
    print(f"CSV 7i84U pin rows:    {len(csv_by_pin)}")
    print(f"HAL physical refs:     {sum(len(v) for v in hal_pins.values())}")
    print(f"Unique HAL pins used:  {len(hal_pins)}")
    print(f"ERRORS:   {len(errors)}")
    print(f"WARNINGS: {len(warnings)}")
    print()

    if errors:
        print("ERRORS")
        print("-" * 60)
        for f in errors:
            print(f)
        print()
    if warnings:
        print("WARNINGS")
        print("-" * 60)
        for f in warnings:
            print(f)
        print()

    if not errors and not warnings:
        print("Clean: CSV and HAL agree on every checked pin.")

    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
