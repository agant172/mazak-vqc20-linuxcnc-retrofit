"""Minimal halrun session driver for component-level regression tests.

Stdlib only, Python 3, no pip installs - same constraint as io-dashboard/tools.

Scope: this drives a LinuxCNC realtime session containing ONE component and a
single software thread. It never loads anything from linuxcnc/, never touches
hardware, and never writes to the repo. It is a behavioural check of a .comp
against docs/ladder/*.md, nothing more. See tests/hal/README.md for the limits.

Mechanics that are not obvious and were established by experiment:

  * Both components declare `option singleton yes`, so pins carry NO instance
    index: `mazak-atc.cycle-start`, not `mazak-atc.0.cycle-start`. The module
    name passed to loadrt keeps its underscores (`loadrt mazak_atc`) while the
    HAL prefix uses dashes (`mazak-atc`).
  * `loadrt` spawns rtapi_app as a daemon which inherits stdout. If it is given
    a pipe, that pipe never reaches EOF and the caller hangs forever. Every
    subprocess here gets a temp file, never a pipe.
  * HAL_RTMOD_DIR must be exported for a bare `halcmd` (halrun sets it itself).
  * Time is wall-clock: both components accumulate timers via `fperiod`, so a
    30 s timeout really takes 30 s. Every timeout is a `param rw`, so scenarios
    scale them down with setp instead of waiting.
  * HAL is a single machine-wide shared-memory session, so only one of these
    may exist at a time. run_tests.py serialises with a lockfile.
"""

from __future__ import annotations

import os
import subprocess
import tempfile
from pathlib import Path

RTMOD_DIR = "/usr/lib/linuxcnc/modules"
REALTIME = "/usr/lib/linuxcnc/realtime"

DEFAULT_PERIOD_NS = 1_000_000  # 1 kHz servo thread; fperiod = 0.001 s


class HarnessError(RuntimeError):
    """Setup/teardown failed - distinct from a scenario assertion failing."""


def _env() -> dict:
    env = os.environ.copy()
    env["HAL_RTMOD_DIR"] = RTMOD_DIR
    return env


def _run(argv: list[str], timeout: float = 30.0) -> tuple[int, str]:
    """Run a command, capturing output via a temp file (never a pipe)."""
    with tempfile.TemporaryFile(mode="w+b") as fh:
        try:
            rc = subprocess.call(
                argv,
                stdout=fh,
                stderr=subprocess.STDOUT,
                stdin=subprocess.DEVNULL,
                env=_env(),
                timeout=timeout,
            )
        except subprocess.TimeoutExpired:
            raise HarnessError(f"timed out after {timeout}s: {' '.join(argv)}")
        fh.seek(0)
        return rc, fh.read().decode("utf-8", "replace").strip()


def teardown() -> None:
    """Force any lingering realtime session down. Safe if none is running."""
    _run(["halrun", "-U"], timeout=40.0)


def rt_is_up() -> bool:
    rc, _ = _run([REALTIME, "status"], timeout=15.0)
    return rc == 0


def _fmt(value) -> str:
    if isinstance(value, bool):
        return "TRUE" if value else "FALSE"
    return str(value)


def _matches(got: str, want) -> bool:
    """Compare a halcmd getp result against an expected value.

    Driven by the type of `want`, not by the shape of `got`. halcmd prints a
    float param whose value is 1.0 as "1", which is indistinguishable from a
    bit pin reading TRUE if you normalise the string alone.
    """
    got = got.strip()
    if isinstance(want, bool):          # bool before int: bool subclasses int
        low = got.lower()
        if low in ("true", "1"):
            return want is True
        if low in ("false", "0"):
            return want is False
        return False
    if isinstance(want, (int, float)):
        try:
            return abs(float(got) - float(want)) < 1e-9
        except ValueError:
            return False
    return got == str(want)


class HalSession:
    """A live single-component HAL session.

    Usage:
        with HalSession("mazak_atc", "mazak-atc") as h:
            h.setp("hydraulic-ok", True)
            h.run_ms(200)
            h.expect("fault-any", False, "no fault at rest")
        failures = h.failures
    """

    def __init__(self, module: str, prefix: str, period_ns: int = DEFAULT_PERIOD_NS):
        self.module = module
        self.prefix = prefix
        self.period_ns = period_ns
        self.failures: list[str] = []
        self.checks = 0
        self._tmpdir: tempfile.TemporaryDirectory | None = None
        self._running = False

    # -- lifecycle ---------------------------------------------------------
    def __enter__(self) -> "HalSession":
        teardown()
        rc, out = _run([REALTIME, "start"], timeout=30.0)
        if rc != 0:
            raise HarnessError(f"realtime start failed: {out}")

        self._tmpdir = tempfile.TemporaryDirectory(prefix="mazak-hal-")
        setup = Path(self._tmpdir.name) / "setup.hal"
        setup.write_text(
            f"loadrt threads name1=servo-thread period1={self.period_ns}\n"
            f"loadrt {self.module}\n"
            f"addf {self.prefix}.update servo-thread\n"
        )
        rc, out = _run(["halcmd", "-f", str(setup)], timeout=30.0)
        if rc != 0:
            teardown()
            raise HarnessError(f"loading {self.module} failed: {out}")
        return self

    def __exit__(self, *exc) -> None:
        try:
            teardown()
        finally:
            if self._tmpdir is not None:
                self._tmpdir.cleanup()
                self._tmpdir = None
        return None

    # -- pin access --------------------------------------------------------
    def _full(self, pin: str) -> str:
        return pin if pin.startswith(self.prefix) else f"{self.prefix}.{pin}"

    def setp(self, pin: str, value) -> None:
        target = self._full(pin)
        rc, out = _run(["halcmd", "-s", "setp", target, _fmt(value)], timeout=15.0)
        if rc != 0:
            raise HarnessError(f"setp {target} failed: {out}")

    def setp_many(self, mapping: dict) -> None:
        for pin, value in mapping.items():
            self.setp(pin, value)

    def getp(self, pin: str) -> str:
        target = self._full(pin)
        rc, out = _run(["halcmd", "-s", "getp", target], timeout=15.0)
        if rc != 0 or "not found" in out:
            raise HarnessError(f"getp {target} failed: {out}")
        return out.strip()

    # -- time --------------------------------------------------------------
    def run_ms(self, milliseconds: float) -> None:
        """Advance simulated time by running the thread for a bounded window.

        Timers only accumulate while the thread runs, so start/stop gates how
        much simulated time passes. halcmd invocation overhead (tens of ms)
        means the real figure is approximate and always >= the request; keep at
        least a 2x margin between a scaled timeout and the window testing it.
        """
        rc, out = _run(["halcmd", "-s", "start"], timeout=15.0)
        if rc != 0:
            raise HarnessError(f"thread start failed: {out}")
        self._running = True
        try:
            _run(["sleep", str(milliseconds / 1000.0)], timeout=milliseconds / 1000.0 + 20.0)
        finally:
            rc, out = _run(["halcmd", "-s", "stop"], timeout=15.0)
            self._running = False
            if rc != 0:
                raise HarnessError(f"thread stop failed: {out}")

    # -- assertions --------------------------------------------------------
    def expect(self, pin: str, want, note: str = "") -> bool:
        self.checks += 1
        got = self.getp(pin)
        if not _matches(got, want):
            suffix = f"  ({note})" if note else ""
            self.failures.append(
                f"{self._full(pin)}: expected {_fmt(want)}, got {got}{suffix}"
            )
            return False
        return True

    def expect_all(self, mapping: dict, note: str = "") -> None:
        for pin, want in mapping.items():
            self.expect(pin, want, note)

    def fail(self, message: str) -> None:
        self.checks += 1
        self.failures.append(message)
