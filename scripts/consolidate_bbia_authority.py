#!/usr/bin/env python3
"""
consolidate_bbia_authority.py

Populate the BBIA-1 plane end of the pin-authority table from the curated
signal_id -> BBIA mapping in wiring/bbia1_source_dest.csv.

Root model: INTERFACE_ARCHITECTURE.md. Every control<->machine signal crosses
at one plane, the BBIA-1 terminal unit. This script joins the already-curated,
provenance-rich wiring/bbia1_source_dest.csv onto mesa/current_pin_authority.csv
on signal_id and writes three columns describing the BBIA end of each conductor:

    dest_connector   BBIA-1 connector   (e.g. CN1, CN4, CN11)
    dest_pin         BBIA-1 pin number  (e.g. 3, 1, 15)
    factory_wire     factory wire number / mnemonic printed on the jacket
                     (e.g. 210, +LY, SA) -- the stable key back to the OEM prints

It NEVER invents data: it only copies what bbia1_source_dest.csv already
records. Rows that source_dest marks as not crossing the plane (blank BBIA
coordinate -- the analog/resolver, power/return, new-signal, and untraced
exceptions of INTERFACE_ARCHITECTURE.md sec 3) are left blank here too.

Usage:
    python3 scripts/consolidate_bbia_authority.py            # dry-run preview
    python3 scripts/consolidate_bbia_authority.py --write    # update the CSV

The join is idempotent: re-running --write reproduces the same file. The OEM
pinout reference (wiring/bbia1_cn_pinouts.csv) and the source_dest mapping are
never modified.
"""

from __future__ import annotations

import argparse
import csv
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
AUTHORITY = REPO / "mesa" / "current_pin_authority.csv"
SOURCE_DEST = REPO / "wiring" / "bbia1_source_dest.csv"
CN_PINOUTS = REPO / "wiring" / "bbia1_cn_pinouts.csv"

NEW_COLS = ["factory_wire"]  # dest_connector / dest_pin already exist in the header

# Canonical BBIA-1 *machine-side* connector+pin, e.g. "CN1-3", "CN11-15".
# Accepts an optional "SSR bd " prefix (stripped).
CN_RE = re.compile(r"^(?:SSR\s+bd\s+)?CN(\d+)-(\S+)$")

# An NC-side (top row) coordinate, e.g. "CND3-39". Matched only so it can be
# refused: BBIA-1 is a pass-through, but the connector INDEX is not preserved
# across it. bbia1_source_dest.csv proves it -- CND3-39 -> CN6-39, CN8-3 ->
# CN1-3, CN8-1/2/4 -> CN1-1/2/4. An earlier version of this script normalised
# "CNDx-n" to "CNx-n" on the stated premise that "CNDx pin == CNx pin"; that
# premise is false and would silently invent a machine-side coordinate.
CND_RE = re.compile(r"^(?:SSR\s+bd\s+)?CND(\d+)-(\S+)$")


def bbia_coordinate(row: dict) -> tuple[str, str, str] | None:
    """Return (connector, pin, factory_wire) for a source_dest row, or None if
    the row does not land on a BBIA-1 machine-side connector (an enumerated
    exception).

    Only the bottom (machine-side) coordinate defines the plane. The top
    (NC-side) column is used as a fallback ONLY when it is already a plain
    "CNx-n"; a "CNDx-n" there is refused rather than translated."""
    wire = (row.get("factory_wire") or "").strip()
    for field in ("bottom_cn_pin", "cnd_source_pin"):
        val = (row.get(field) or "").strip()
        m = CN_RE.match(val)
        if m:
            return f"CN{m.group(1)}", m.group(2), wire
        if CND_RE.match(val):
            # NC-side only: the machine-side pin cannot be derived from it.
            continue
    return None


def load_oem_pinout() -> dict[tuple[str, str], list[tuple[str, str]]]:
    """(connector, pin) -> [(wire_no, signal), ...] from the immutable OEM
    reference. INTERFACE_ARCHITECTURE.md sec 5 requires the join to read this
    file: it is the machine-internal side of the plane and the retrofit does
    not own it. This script only ever READS it."""
    oem: dict[tuple[str, str], list[tuple[str, str]]] = {}
    with CN_PINOUTS.open(newline="") as fh:
        for row in csv.DictReader(fh):
            key = ((row.get("Connector") or "").strip().upper(),
                   (row.get("Pin") or "").strip())
            oem.setdefault(key, []).append(
                ((row.get("Wire_No") or "").strip(), (row.get("Signal") or "").strip()))
    return oem


def oem_disagreements(join: dict[str, tuple[str, str, str]]) -> list[str]:
    """Report where the curated source_dest mapping disagrees with the OEM
    pinout. Never resolves the disagreement -- two OEM documents contradicting
    each other is a field-trace question, not a merge conflict to auto-fix."""
    oem = load_oem_pinout()
    out: list[str] = []
    for sid, (conn, pin, wire) in sorted(join.items()):
        key = (conn.upper(), pin)
        if key not in oem:
            out.append(f"{sid}: {conn}-{pin} has no row in {CN_PINOUTS.name}")
            continue
        wires = [w for w, _ in oem[key]]
        if wire and wire not in wires:
            recorded = "; ".join(f"{w} ({s})" for w, s in oem[key])
            out.append(f"{sid}: {conn}-{pin} source_dest wire={wire!r} "
                       f"but OEM pinout records {recorded}")
    return out


def load_join() -> dict[str, tuple[str, str, str]]:
    join: dict[str, tuple[str, str, str]] = {}
    with SOURCE_DEST.open(newline="") as fh:
        for row in csv.DictReader(fh):
            coord = bbia_coordinate(row)
            if coord is not None:
                join[row["signal_id"]] = coord
    return join


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--write", action="store_true", help="update the authority CSV in place")
    args = ap.parse_args()

    join = load_join()
    with AUTHORITY.open(newline="") as fh:
        reader = csv.DictReader(fh)
        fieldnames = list(reader.fieldnames or [])
        rows = list(reader)

    for col in NEW_COLS:
        if col not in fieldnames:
            fieldnames.append(col)

    changed, populated, conflicts = 0, 0, []
    for row in rows:
        for col in NEW_COLS:
            row.setdefault(col, "")
        coord = join.get(row["signal_id"])
        if coord is None:
            continue
        conn, pin, wire = coord
        # Do not clobber a non-empty existing value with a different one; report it.
        for field, val in (("dest_connector", conn), ("dest_pin", pin), ("factory_wire", wire)):
            cur = (row.get(field) or "").strip()
            if cur and cur != val:
                conflicts.append(f"{row['signal_id']}: {field} CSV={cur!r} join={val!r}")
        if (row.get("dest_connector"), row.get("dest_pin"), row.get("factory_wire")) != (conn, pin, wire):
            changed += 1
        row["dest_connector"], row["dest_pin"], row["factory_wire"] = conn, pin, wire
        populated += 1

    disagreements = oem_disagreements(join)

    # A source_dest signal_id with no authority row contributes nothing and
    # would otherwise vanish without a word -- which is also exactly how a typo
    # in a signal_id would present. Name them so a typo is distinguishable from
    # a deliberate omission.
    authority_ids = {r["signal_id"] for r in rows}
    unmatched = sorted(sid for sid in join if sid not in authority_ids)

    print(f"source_dest rows landing on BBIA-1:   {len(join)}")
    print(f"authority rows populated with BBIA end: {populated}")
    print(f"rows changed by this run:               {changed}")
    if conflicts:
        print("\nCONFLICTS (existing CSV value != join value) -- NOT overwritten silently:")
        for c in conflicts:
            print("  " + c)

    if unmatched:
        print(f"\nUNMATCHED ({len(unmatched)}) -- land on BBIA-1 in "
              f"{SOURCE_DEST.name} but have no authority row, so the join drops "
              f"them.\nDeliberate omissions are fine; an unexpected name here is a "
              f"typo, not an omission:")
        for sid in unmatched:
            print(f"  {sid}")

    if disagreements:
        print(f"\nOEM PINOUT DISAGREEMENTS ({len(disagreements)}) -- source_dest vs "
              f"{CN_PINOUTS.name}.\nTwo OEM documents contradict each other; this script "
              f"does NOT pick a winner. Record each in\nwiring/authority_conflicts.md and "
              f"register it in validate_authority.py KNOWN_PLANE_CONFLICTS:")
        for d in disagreements:
            print("  " + d)

    if not args.write:
        print("\n(dry run -- pass --write to update mesa/current_pin_authority.csv)")
        # Preview the populated BBIA ends. Gate on the CN test, not merely on
        # dest_connector being non-empty: the six SSERIAL_PORT0_* rows carry
        # "<card> RJ45" there and are card-internal smart-serial wiring that
        # emphatically does not cross the machine-interface plane.
        print("\nBBIA-1 plane (signal_id -> connector/pin [wire]):")
        for row in rows:
            conn = (row.get("dest_connector") or "").strip()
            if conn.upper().startswith("OEM "):
                conn = conn[4:].strip()
            if not re.fullmatch(r"CN\d+", conn.upper()):
                continue
            w = row.get("factory_wire") or ""
            print(f"  {row['signal_id']:24s} {conn}-{row['dest_pin']:<6} [{w}]")
        return 0

    with AUTHORITY.open("w", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    print(f"\nWROTE {AUTHORITY.relative_to(REPO)} ({len(rows)} rows, columns: {', '.join(fieldnames)})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
