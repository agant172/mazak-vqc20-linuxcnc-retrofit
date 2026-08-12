#!/usr/bin/env python3
"""Static regression checks for safety-critical LinuxCNC configuration logic.

This does not replace halcompile, a LinuxCNC startup test, or machine fault
injection. It catches structural regressions that the pin-authority validator
cannot see: duplicate signal writers or real-time module loads, thread ordering,
commissioning holds, Z-brake sequencing, ATC abort cleanup, and module-count
inconsistencies.
"""

from __future__ import annotations

import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LCNC = ROOT / "linuxcnc"
INI = LCNC / "mazak_vqc_20_40.ini"


def active(line: str) -> str:
    return line.split("#", 1)[0].strip()


def fail(errors: list[str], message: str) -> None:
    errors.append(message)


def hal_files_in_load_order() -> list[Path]:
    result: list[Path] = []
    for raw in INI.read_text().splitlines():
        code = active(raw)
        if code.startswith("HALFILE") and "=" in code:
            result.append(LCNC / code.split("=", 1)[1].strip())
    return result


def check_duplicate_writers(files: list[Path], errors: list[str]) -> None:
    writers: dict[str, set[str]] = defaultdict(set)
    refs: dict[str, list[str]] = defaultdict(list)
    for path in files:
        for lineno, raw in enumerate(path.read_text().splitlines(), 1):
            code = active(raw)
            m = re.match(r"sets\s+(\S+)\s+", code)
            if m:
                writers[m.group(1)].add("sets")
                refs[m.group(1)].append(f"{path.name}:{lineno}")
                continue
            m = re.match(r"net\s+(\S+)\s+(.+)", code)
            if not m:
                continue
            signal, rest = m.groups()
            source = None
            if "<=" in rest:
                source = rest.split("<=", 1)[1].split()[0]
            elif "=>" in rest:
                before = rest.split("=>", 1)[0].split()
                if before:
                    source = before[-1]
            elif "<=>" not in rest:
                tokens = rest.split()
                if len(tokens) > 1:
                    source = tokens[0]
            if source:
                writers[signal].add(source)
                refs[signal].append(f"{path.name}:{lineno}")

    for signal, sources in sorted(writers.items()):
        if len(sources) > 1:
            fail(errors, f"signal '{signal}' has multiple writers {sorted(sources)} at {refs[signal]}")


def check_realtime_module_loads(files: list[Path], errors: list[str]) -> None:
    loads: dict[str, list[str]] = defaultdict(list)
    for path in files:
        for lineno, raw in enumerate(path.read_text().splitlines(), 1):
            code = active(raw)
            match = re.match(r"loadrt\s+(\S+)", code)
            if match:
                loads[match.group(1)].append(f"{path.name}:{lineno}")

    for module, refs in sorted(loads.items()):
        if len(refs) > 1:
            fail(errors, f"real-time module '{module}' is loaded more than once: {refs}")

    if "estop-latch" in loads or "estop_latch" not in loads:
        fail(errors, "load the E-stop component as module 'estop_latch' (pins/functions use 'estop-latch.0')")
    main = (LCNC / "mazak_vqc_20_40.hal").read_text()
    if not re.search(r"^loadrt\s+estop_latch\s+(?:count=1|names=\S+)\s*$", main, re.MULTILINE):
        fail(errors, "estop_latch load must explicitly create one instance")
    if len(loads.get("or2", [])) != 1:
        fail(errors, "all watchdog/ATC or2 instances must be created by one loadrt or2 statement")


def check_thread_order(files: list[Path], errors: list[str]) -> None:
    order: list[str] = []
    for path in files:
        for raw in path.read_text().splitlines():
            code = active(raw)
            m = re.match(r"addf\s+(\S+)\s+servo-thread", code)
            if m:
                order.append(m.group(1))

    if order.count("hm2_7i80.0.write") != 1:
        fail(errors, f"expected exactly one hm2 write function, found {order.count('hm2_7i80.0.write')}")
        return

    required = [
        "hm2_7i80.0.read",
        "resolver-fault-x",
        "resolver-fault-y",
        "resolver-fault-z",
        "watchdog-fault-or",
        "estop-latch.0",
        "logic.watchdog-not",
        "logic.spindle-fault-not",
        "logic.spindle-permit-and",
        "and2.6",
        "and2.0",
        "and2.1",
        "and2.2",
        "and2.3",
        "and2.4",
        "and2.5",
        "and2.7",
        "z-brake-delay",
        "z-drive-drop-delay",
        "atc-estop-abort",
        "atc-safety-abort-or",
        "atc-abort-or",
        "mazak-orient.update",
        "mazak-atc.update",
        "atc-fault-or",
        "hm2_7i80.0.write",
    ]
    missing = [name for name in required if name not in order]
    if missing:
        fail(errors, f"servo-thread is missing required functions: {missing}")
        return
    positions = [order.index(name) for name in required]
    if positions != sorted(positions):
        fail(errors, f"unsafe servo-thread order: expected {' < '.join(required)}; actual {order}")
    if order[-1] != "hm2_7i80.0.write":
        fail(errors, "hm2 write must be the final servo-thread function")


def require(text: str, needle: str, where: str, errors: list[str]) -> None:
    if needle not in text:
        fail(errors, f"{where}: missing required statement: {needle}")


def check_safety_invariants(errors: list[str]) -> None:
    main = (LCNC / "mazak_vqc_20_40.hal").read_text()
    field = (LCNC / "field_7i84u.hal").read_text()
    motion = (LCNC / "motion_7i80hdt.hal").read_text()
    atc = (LCNC / "atc_orient.hal").read_text()
    toolchange = (LCNC / "remap" / "toolchange.ngc").read_text()
    abort = (LCNC / "remap" / "on_abort.ngc").read_text()
    atc_component = (LCNC / "components" / "mazak_atc.comp").read_text()
    orient_component = (LCNC / "components" / "mazak_orient.comp").read_text()
    ini = INI.read_text()

    # halcompile's declaration grammar accepts one documentation string per
    # pin/parameter declaration; unlike C, adjacent quoted strings are not
    # concatenated. Catch this before a target-side compile.
    for component_path in (LCNC / "components").glob("*.comp"):
        declarations = component_path.read_text().split("\n;;\n", 1)[0]
        if re.search(r'"\s*\n\s*"', declarations):
            fail(errors, f"{component_path.name}: adjacent declaration strings are invalid in halcompile")

    for path in LCNC.glob("*.hal"):
        for lineno, raw in enumerate(path.read_text().splitlines(), 1):
            code = active(raw)
            if re.search(r"\.7i84\..*\.invert(?:_input)?\b", code):
                fail(errors, f"{path.name}:{lineno}: nonexistent smart-serial inversion parameter")
            if re.search(r"hm2_7i80\.0\.gpio\.\d+", code):
                fail(errors, f"{path.name}:{lineno}: active bare-P3 GPIO reference is forbidden")
            if re.search(r"hm2_7i80\.0\.encoder\.\d+", code):
                fail(errors, f"{path.name}:{lineno}: spindle encoder path is unassigned; P3 must remain empty")

    require(field, "sets spindle-output-permit false", "FR-SX hold", errors)
    require(main, "personality=0x801,0x801,0x107", "FR-SX combined permit", errors)
    require(main, "net spindle-motion-permit  <= logic.spindle-permit-and.and", "FR-SX combined permit", errors)
    for input_net in (
        "spindle-output-permit => logic.spindle-permit-and.in-00",
        "watchdog-permit       => logic.spindle-permit-and.in-01",
        "estop-ok               => logic.spindle-permit-and.in-02",
        "spindle-fault-clear    => logic.spindle-permit-and.in-03",
        "machine-is-on          => logic.spindle-permit-and.in-04",
        "servo-ready            => logic.spindle-permit-and.in-05",
        "atc-live-permit        => logic.spindle-permit-and.in-06",
    ):
        require(main, input_net, "FR-SX combined permit", errors)

    # ATC dry-run interlock: atc-live-permit is the single source of truth. It
    # must initialize FALSE (dry-run), gate the spindle permit (checked above via
    # in-06), and be the bit the remap reads on motion.digital-in-15. The INI
    # DRY_RUN key must NOT come back as a second source.
    require(main, "sets atc-live-permit 0", "ATC dry-run hold", errors)
    require(main, "net atc-live-permit        => motion.digital-in-15", "ATC dry-run remap read", errors)
    if re.search(r"^\s*DRY_RUN\s*=", INI.read_text(), re.MULTILINE):
        fail(errors, "mazak_vqc_20_40.ini: [ATC] DRY_RUN key is retired; authority is the HAL bit atc-live-permit")
    if "#<_ini[ATC]DRY_RUN>" in (LCNC / "remap" / "toolchange.ngc").read_text():
        fail(errors, "toolchange.ngc: reads retired [ATC]DRY_RUN; must read atc-live-permit via M66 P15")
    require(main, "sets drive-output-permit false", "axis drive hold", errors)
    require(main, "net motion-permit       <= and2.6.out", "axis drive commissioning gate", errors)
    require(motion, "net x-resolver-fault => resolver-fault-x.in1", "X resolver fault consumer", errors)
    require(motion, "net y-resolver-fault => resolver-fault-y.in1", "Y resolver fault consumer", errors)
    require(motion, "net z-resolver-fault => resolver-fault-z.in1", "Z resolver fault consumer", errors)
    require(field, "net x-axis-fault       => joint.0.amp-fault-in", "X combined axis fault", errors)
    require(field, "net y-axis-fault       => joint.1.amp-fault-in", "Y combined axis fault", errors)
    require(field, "net z-axis-fault       => joint.2.amp-fault-in", "Z combined axis fault", errors)
    require(field, "net spindle-fwd        <= and2.3.out", "FR-SX FWD gate", errors)
    require(field, "net spindle-rev        <= and2.4.out", "FR-SX REV gate", errors)
    require(field, "net spindle-run-output <= and2.5.out", "FR-SX RUN gate", errors)
    require(field, "net spindle-motion-permit => and2.3.in1", "FR-SX FWD permit", errors)
    require(field, "net spindle-motion-permit => and2.4.in1", "FR-SX REV permit", errors)
    require(field, "net spindle-motion-permit => and2.5.in1", "FR-SX RUN permit", errors)
    require(atc, "net spindle-orient-cmd     <= and2.7.out", "FR-SX ORCM1 gate", errors)
    require(atc, "net spindle-motion-permit  => and2.7.in1", "FR-SX ORCM1 permit", errors)
    require(motion, "net spindle-run-output => hm2_7i80.0.pwmgen.03.enable", "FR-SX analog gate", errors)

    require(field, "setp z-brake-delay.on-delay       0.100", "Z-brake enable sequence", errors)
    require(field, "setp z-brake-delay.off-delay      0.000", "Z-brake shutdown sequence", errors)
    require(field, "setp z-drive-drop-delay.on-delay  0.000", "Z-drive enable sequence", errors)
    require(field, "setp z-drive-drop-delay.off-delay 0.100", "Z-drive shutdown sequence", errors)
    require(field, "net z-enable-request => z-drive-drop-delay.in", "Z-drive request", errors)
    require(motion, "net z-brake-release => pid.z.enable", "Z PID shutdown sequence", errors)
    require(motion, "net z-brake-release => hm2_7i80.0.pwmgen.01.enable", "Z analog shutdown sequence", errors)
    if re.search(r"^net\s+z-enable\s+=>\s+(?:pid\.z\.enable|hm2_7i80\.0\.pwmgen\.01\.enable)", motion, re.MULTILINE):
        fail(errors, "Z PID/pwmgen must drop with brake-release, not delayed physical S-ON")

    for loop in ("x", "y", "z", "s"):
        for gain in ("Pgain", "Igain", "Dgain"):
            require(main, f"setp pid.{loop}.{gain}", f"PID {loop} gain pins", errors)
    if re.search(r"^setp\s+pid\.[xyzs]\.(?:P|I|D)\s+", main, re.MULTILINE):
        fail(errors, "PID uses nonexistent .P/.I/.D pins; use .Pgain/.Igain/.Dgain")

    require(ini, "ON_ABORT_COMMAND = O <on_abort> call", "ATC abort INI", errors)
    require(abort, "M64 P8", "ATC abort latch", errors)
    for pin in range(8):
        require(abort, f"M65 P{pin}", "ATC abort cleanup", errors)
    require(toolchange, "M65 P8", "ATC abort reset at M6 entry", errors)
    require(atc, "motion.digital-out-08 => atc-abort-or.in0", "ATC abort HAL", errors)
    require(atc, "net spindle-fault       => atc-safety-abort-or.in1", "FR-SX ATC abort", errors)
    require(atc, "net atc-safety-abort    => atc-abort-or.in1", "FR-SX/E-stop ATC abort", errors)
    require(atc, "atc-cycle-abort     => mazak-atc.cycle-abort", "ATC component abort", errors)
    require(atc, "net spindle-fault       => mazak-orient.drive-fault", "FR-SX orient fault", errors)
    require(orient_component, "arm_ok = hyd_pump_on && !fault_oriented_rotating && !drive_fault;", "orient drive-fault inhibit", errors)
    require(orient_component, "fault_any = drive_fault || fault_orient_timeout", "orient drive-fault reporting", errors)
    require(orient_component, "reset_pulse = fault_reset && !prev_fault_reset;", "orient reset edge", errors)
    require(atc_component, "reset_pulse = fault_reset && !prev_fault_reset;", "ATC reset edge", errors)
    require(atc_component, "mag_cover_sol = (cover_close_request && permissives)", "ATC cover permissive", errors)
    require(atc_component, "&& spindle_stopped && !spindle_run && permissives", "ATC manual-unclamp permissive", errors)
    require(atc_component, "&& !spindle_run && permissives", "ATC sealed unclamp permissive", errors)
    require(atc_component, "&& (cycle_active || mag_cover_open_conf))", "ATC barrier abort/fault gate", errors)

    require(field, "net air-ok <= hm2_7i80.0.7i84.0.1.input-09", "air-pressure inhibit", errors)
    require(field, "net spindle-at-speed   => spindle.0.at-speed", "FR-SX at-speed consumer", errors)
    require(field, "net spindle-fault      => spindle.0.amp-fault-in", "FR-SX fault consumer", errors)
    require(atc, "net mag-cover-close       => hm2_7i80.0.7i84.0.1.output-08", "cover output", errors)
    if re.search(r"^\s*sets\s+spindle-at-speed\b", motion, re.MULTILINE):
        fail(errors, "spindle-at-speed must not have a forced writer")

    config = re.search(r'config="([^"]+)"', main)
    encoder_match = re.search(r"num_encoders=(\d+)", config.group(1) if config else "")
    if not encoder_match or int(encoder_match.group(1)) != 0:
        fail(errors, "num_encoders must remain 0 until spindle encoder/interface and IDROM pins are assigned")
    if len(re.findall(r"^MAX_OUTPUT\s*=\s*0\.10\s*$", ini, re.MULTILINE)) != 3:
        fail(errors, "all three axis PID sections must retain the 0.10 initial commissioning clamp")
    count_match = re.search(r"num_pwmgens=(\d+)", config.group(1) if config else "")
    active_motion = "\n".join(active(line) for line in motion.splitlines())
    used = [int(n) for n in re.findall(r"pwmgen\.(\d{2})", active_motion)]
    if not count_match or not used:
        fail(errors, "cannot determine pwmgen configured/used counts")
    elif int(count_match.group(1)) <= max(used):
        fail(errors, f"num_pwmgens={count_match.group(1)} does not create active pwmgen.{max(used):02d}")


def main() -> int:
    errors: list[str] = []
    files = hal_files_in_load_order()
    check_duplicate_writers(files, errors)
    check_realtime_module_loads(files, errors)
    check_thread_order(files, errors)
    check_safety_invariants(errors)

    print("scripts/validate_control_logic.py")
    print("=" * 60)
    print(f"HAL files in load order: {len(files)}")
    print(f"ERRORS: {len(errors)}")
    if errors:
        print("\nERRORS\n" + "-" * 60)
        for message in errors:
            print(f"[ERROR] {message}")
    else:
        print("Clean: all static control-logic invariants passed.")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
