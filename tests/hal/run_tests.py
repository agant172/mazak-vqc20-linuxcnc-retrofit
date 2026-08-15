#!/usr/bin/env python3
"""Run the halrun component scenarios, serially, and report.

    python3 tests/hal/run_tests.py [name ...]

Exit code 0 = every scenario passed. 1 = at least one assertion failed or a
scenario errored. 2 = the harness could not run at all (components not
installed, no realtime environment).

Serial by necessity: HAL is a single machine-wide shared-memory session, so two
concurrent runs corrupt each other. A lockfile enforces this.
"""

from __future__ import annotations

import fcntl
import importlib.util
import sys
import time
import traceback
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

import halharness  # noqa: E402

SCENARIO_DIR = HERE / "scenarios"
LOCKFILE = Path("/tmp/mazak-hal-harness.lock")
RTMOD = Path(halharness.RTMOD_DIR)


def preflight() -> list[str]:
    problems = []
    for so in ("mazak_atc.so", "mazak_orient.so"):
        if not (RTMOD / so).exists():
            problems.append(f"missing {RTMOD / so} - run tests/hal/install_components.sh")
    if not Path(halharness.REALTIME).exists():
        problems.append(f"missing {halharness.REALTIME} - is LinuxCNC installed?")
    return problems


def load_scenarios(names: list[str]) -> list:
    found = []
    for path in sorted(SCENARIO_DIR.glob("*.py")):
        if path.name.startswith("_"):
            continue
        if names and path.stem not in names:
            continue
        spec = importlib.util.spec_from_file_location(path.stem, path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        if not hasattr(module, "run"):
            raise SystemExit(f"{path.name}: no run() function")
        found.append((path.stem, module))
    return found


def main(argv: list[str]) -> int:
    problems = preflight()
    if problems:
        for p in problems:
            print(f"PREFLIGHT: {p}", file=sys.stderr)
        return 2

    scenarios = load_scenarios(argv)
    if not scenarios:
        print("no scenarios found", file=sys.stderr)
        return 2

    with LOCKFILE.open("w") as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            print("another harness run holds the lock; HAL allows only one", file=sys.stderr)
            return 2

        halharness.teardown()  # clear anything a crashed run left behind

        total_checks = 0
        failed = []
        started = time.time()

        for name, module in scenarios:
            doc = (module.__doc__ or "").strip().splitlines()
            headline = doc[0] if doc else ""
            print(f"\n=== {name} ===")
            if headline:
                print(f"    {headline}")
            t0 = time.time()
            try:
                result = module.run()
            except Exception:
                print(f"    ERROR\n{traceback.format_exc()}")
                failed.append((name, ["scenario raised an exception"]))
                halharness.teardown()
                continue
            elapsed = time.time() - t0
            failures = result.failures if hasattr(result, "failures") else list(result or [])
            checks = getattr(result, "checks", 0)
            total_checks += checks
            if failures:
                failed.append((name, failures))
                print(f"    FAIL  ({checks} checks, {elapsed:.1f}s)")
                for f in failures:
                    print(f"      - {f}")
            else:
                print(f"    pass  ({checks} checks, {elapsed:.1f}s)")

        halharness.teardown()

    print("\n" + "=" * 60)
    print(f"{len(scenarios)} scenarios, {total_checks} checks, "
          f"{len(failed)} failed, {time.time() - started:.1f}s")
    if failed:
        print("\nFAILED:")
        for name, failures in failed:
            print(f"  {name}: {len(failures)} failure(s)")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
