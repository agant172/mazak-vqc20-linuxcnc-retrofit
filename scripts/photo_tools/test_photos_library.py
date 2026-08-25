#!/usr/bin/env python3
"""Tests for the Apple Photos library adapter, against a synthetic library.

    python3 scripts/photo_tools/test_photos_library.py

No real Photos library is involved. A bundle is built on disk with the same
shape macOS uses -- ``database/Photos.sqlite`` holding ZASSET and
ZADDITIONALASSETATTRIBUTES, plus ``originals/`` and ``resources/derivatives/``
trees -- so the SQL, the UUID-to-file matching, the Core Data date conversion
and the read-only guarantee can all be exercised here.

What this cannot prove is that a *real* library from any given macOS release
has the columns this fixture has; that is why the adapter probes the schema at
runtime instead of assuming it. See the note in README.md.
"""

from __future__ import annotations

import hashlib
import shutil
import sqlite3
import sys
import tempfile
import unittest
import uuid as uuidlib
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import photos_library as pl  # noqa: E402

APPLE_EPOCH = datetime(2001, 1, 1, tzinfo=timezone.utc)


def core_data_time(local: datetime, tz_offset_seconds: int) -> float:
    """Invert the adapter: given a local wall clock, produce what Photos stores."""
    utc = local.replace(tzinfo=timezone.utc) - timedelta(seconds=tz_offset_seconds)
    return (utc - APPLE_EPOCH).total_seconds()


class Fixture:
    """Builds a .photoslibrary bundle with a controllable set of assets."""

    def __init__(self, root: Path, *, with_aux: bool = True):
        self.root = root
        self.with_aux = with_aux
        self.db = root / "database" / "Photos.sqlite"
        self.db.parent.mkdir(parents=True)
        self.rows: list[tuple] = []
        self.aux: list[tuple] = []
        self._pk = 0

    def add(self, *, name: str, local_time: datetime, tz_offset: int = -28800,
            lat: float | None = None, lon: float | None = None,
            original: bool = True, derivative: bool = False,
            trashed: int = 0, kind: int = 0, payload: bytes | None = None) -> str:
        self._pk += 1
        u = str(uuidlib.uuid4()).upper()
        body = payload if payload is not None else f"pixels-for-{name}".encode() * 4

        if original:
            d = self.root / "originals" / u[0]
            d.mkdir(parents=True, exist_ok=True)
            (d / f"{u}.jpg").write_bytes(body)
        if derivative:
            d = self.root / "resources" / "derivatives" / u[0]
            d.mkdir(parents=True, exist_ok=True)
            # Real derivative naming: <UUID>_1_105_c.jpeg
            (d / f"{u}_1_105_c.jpeg").write_bytes(body + b"deriv")

        self.rows.append((
            self._pk, u, core_data_time(local_time, tz_offset),
            pl.NO_LOCATION if lat is None else lat,
            pl.NO_LOCATION if lon is None else lon,
            trashed, kind, f"{name}",
        ))
        self.aux.append((self._pk, self._pk, name, tz_offset))
        return u

    def write(self) -> None:
        conn = sqlite3.connect(self.db)
        conn.execute("""CREATE TABLE ZASSET (
            Z_PK INTEGER PRIMARY KEY, ZUUID TEXT, ZDATECREATED REAL,
            ZLATITUDE REAL, ZLONGITUDE REAL, ZTRASHEDSTATE INTEGER,
            ZKIND INTEGER, ZFILENAME TEXT)""")
        conn.executemany("INSERT INTO ZASSET VALUES (?,?,?,?,?,?,?,?)", self.rows)
        if self.with_aux:
            conn.execute("""CREATE TABLE ZADDITIONALASSETATTRIBUTES (
                Z_PK INTEGER PRIMARY KEY, ZASSET INTEGER,
                ZORIGINALFILENAME TEXT, ZTIMEZONEOFFSET INTEGER)""")
            conn.executemany(
                "INSERT INTO ZADDITIONALASSETATTRIBUTES VALUES (?,?,?,?)", self.aux)
        conn.commit()
        conn.close()


class Adapter(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = Path(tempfile.mkdtemp(prefix="pl-"))
        self.lib = self.tmp / "Test.photoslibrary"
        self.fx = Fixture(self.lib)

    def tearDown(self) -> None:
        shutil.rmtree(self.tmp, ignore_errors=True)

    # -- core behaviour --------------------------------------------------
    def test_reads_assets_with_original_filenames(self):
        self.fx.add(name="IMG_1234.HEIC", local_time=datetime(2024, 5, 1, 9, 0))
        self.fx.write()
        assets, stats = pl.read_assets(self.lib)
        self.assertEqual(len(assets), 1)
        self.assertEqual(assets[0].original_name, "IMG_1234.HEIC")
        self.assertTrue(assets[0].from_original)
        self.assertEqual(stats["from_original"], 1)

    def test_local_wall_clock_is_recovered_from_utc(self):
        """The whole point: an evening shot must not slide into the next day."""
        evening = datetime(2024, 1, 15, 20, 30)          # local
        self.fx.add(name="IMG_1.HEIC", local_time=evening, tz_offset=-8 * 3600)
        self.fx.write()
        assets, _ = pl.read_assets(self.lib)
        self.assertEqual(assets[0].taken, evening)
        self.assertEqual(assets[0].taken.date(), evening.date())

    def test_derivative_used_when_original_is_absent(self):
        self.fx.add(name="IMG_2.HEIC", local_time=datetime(2024, 5, 1, 10, 0),
                    original=False, derivative=True)
        self.fx.write()
        assets, stats = pl.read_assets(self.lib)
        self.assertEqual(len(assets), 1)
        self.assertFalse(assets[0].from_original)
        self.assertEqual(stats["from_derivative"], 1)
        self.assertIn("_1_105_c", assets[0].path.name)

    def test_original_preferred_over_derivative(self):
        self.fx.add(name="IMG_3.HEIC", local_time=datetime(2024, 5, 1, 11, 0),
                    original=True, derivative=True)
        self.fx.write()
        assets, _ = pl.read_assets(self.lib)
        self.assertTrue(assets[0].from_original)
        self.assertNotIn("_1_105_c", assets[0].path.name)

    def test_icloud_only_asset_is_counted_not_silently_dropped(self):
        # Alongside a readable asset -- a library with no local pixels at all is
        # a different case, covered by test_library_with_no_local_pixels_raises.
        self.fx.add(name="IMG_4.HEIC", local_time=datetime(2024, 5, 1, 12, 0),
                    original=False, derivative=False)
        self.fx.add(name="IMG_4b.HEIC", local_time=datetime(2024, 5, 1, 12, 5))
        self.fx.write()
        assets, stats = pl.read_assets(self.lib)
        self.assertEqual([a.original_name for a in assets], ["IMG_4b.HEIC"])
        self.assertEqual(stats["no_local_file"], 1)
        self.assertEqual(stats["rows"], 2)

    def test_trashed_assets_are_skipped(self):
        self.fx.add(name="IMG_5.HEIC", local_time=datetime(2024, 5, 1, 13, 0), trashed=1)
        self.fx.add(name="IMG_6.HEIC", local_time=datetime(2024, 5, 1, 14, 0))
        self.fx.write()
        assets, stats = pl.read_assets(self.lib)
        self.assertEqual([a.original_name for a in assets], ["IMG_6.HEIC"])
        self.assertEqual(stats["trashed"], 1)

    def test_videos_excluded_unless_requested(self):
        self.fx.add(name="IMG_7.MOV", local_time=datetime(2024, 5, 1, 15, 0), kind=1)
        self.fx.write()
        self.assertEqual(pl.read_assets(self.lib, include_videos=False)[0], [])
        self.assertEqual(len(pl.read_assets(self.lib, include_videos=True)[0]), 1)

    def test_missing_gps_sentinel_becomes_none(self):
        self.fx.add(name="IMG_8.HEIC", local_time=datetime(2024, 5, 1, 16, 0))
        self.fx.add(name="IMG_9.HEIC", local_time=datetime(2024, 5, 1, 17, 0),
                    lat=37.77, lon=-122.41)
        self.fx.write()
        assets, _ = pl.read_assets(self.lib)
        by_name = {a.original_name: a for a in assets}
        self.assertIsNone(by_name["IMG_8.HEIC"].lat)
        self.assertIsNone(by_name["IMG_8.HEIC"].lon)
        self.assertAlmostEqual(by_name["IMG_9.HEIC"].lat, 37.77, places=2)
        self.assertAlmostEqual(by_name["IMG_9.HEIC"].lon, -122.41, places=2)

    def test_results_are_in_capture_order(self):
        self.fx.add(name="c.HEIC", local_time=datetime(2024, 5, 3, 9, 0))
        self.fx.add(name="a.HEIC", local_time=datetime(2024, 5, 1, 9, 0))
        self.fx.add(name="b.HEIC", local_time=datetime(2024, 5, 2, 9, 0))
        self.fx.write()
        assets, _ = pl.read_assets(self.lib)
        self.assertEqual([a.original_name for a in assets], ["a.HEIC", "b.HEIC", "c.HEIC"])

    # -- the guarantee that matters --------------------------------------
    def test_library_is_never_modified(self):
        self.fx.add(name="IMG_A.HEIC", local_time=datetime(2024, 5, 1, 9, 0))
        self.fx.write()

        def fingerprint() -> dict[str, str]:
            return {
                str(p.relative_to(self.lib)): hashlib.sha256(p.read_bytes()).hexdigest()
                for p in sorted(self.lib.rglob("*")) if p.is_file()
            }

        before = fingerprint()
        pl.read_assets(self.lib)
        self.assertEqual(before, fingerprint(), "the Photos library was modified")

    def test_wal_sidecar_is_carried_along(self):
        """Recent changes live in the -wal; missing it would silently lose rows."""
        self.fx.add(name="IMG_B.HEIC", local_time=datetime(2024, 5, 1, 9, 0))
        self.fx.write()
        self.fx.db.with_name("Photos.sqlite-wal").write_bytes(b"")
        assets, _ = pl.read_assets(self.lib)   # must not raise
        self.assertEqual(len(assets), 1)

    # -- schema tolerance -------------------------------------------------
    def test_works_without_the_attributes_side_table(self):
        """Older libraries lack ZADDITIONALASSETATTRIBUTES entirely."""
        fx = Fixture(self.tmp / "Old.photoslibrary", with_aux=False)
        fx.add(name="IMG_OLD.JPG", local_time=datetime(2024, 5, 1, 9, 0), tz_offset=0)
        fx.write()
        assets, _ = pl.read_assets(self.tmp / "Old.photoslibrary")
        self.assertEqual(len(assets), 1)
        # Falls back to ZFILENAME when ZORIGINALFILENAME is unavailable.
        self.assertEqual(assets[0].original_name, "IMG_OLD.JPG")

    def test_unreadable_database_raises_a_clear_error(self):
        bad = self.tmp / "Bad.photoslibrary"
        (bad / "database").mkdir(parents=True)
        (bad / "database" / "Photos.sqlite").write_bytes(b"not a database at all")
        (bad / "originals" / "A").mkdir(parents=True)
        (bad / "originals" / "A" / "x.jpg").write_bytes(b"x")
        with self.assertRaises(pl.LibraryError):
            pl.read_assets(bad)

    def test_library_with_no_local_pixels_raises(self):
        empty = self.tmp / "Empty.photoslibrary"
        fx = Fixture(empty)
        fx.add(name="IMG_C.HEIC", local_time=datetime(2024, 5, 1, 9, 0),
               original=False, derivative=False)
        fx.write()
        with self.assertRaises(pl.LibraryError):
            pl.read_assets(empty)

    def test_find_library_rejects_a_non_library_path(self):
        with self.assertRaises(pl.LibraryError):
            pl.find_library(self.tmp)



try:
    from PIL import Image, ImageDraw
    HAVE_PILLOW = True
except ImportError:  # pragma: no cover
    HAVE_PILLOW = False


@unittest.skipUnless(HAVE_PILLOW, "Pillow is needed to generate real pixels")
class EndToEnd(unittest.TestCase):
    """Run the whole grouper against a library, not just the adapter."""

    @classmethod
    def setUpClass(cls) -> None:
        import io
        import random

        import group_photos as gp

        cls.gp = gp
        cls.tmp = Path(tempfile.mkdtemp(prefix="ple2e-"))
        cls.lib = cls.tmp / "Photos Library.photoslibrary"

        def scene(seed: int, w: int = 320, h: int = 240):
            rnd = random.Random(seed)
            im = Image.new("RGB", (w, h))
            d = ImageDraw.Draw(im)
            for y in range(0, h, 6):
                d.rectangle([0, y, w, y + 6], fill=(rnd.randint(0, 255),
                                                    rnd.randint(0, 255), rnd.randint(0, 255)))
            for _ in range(10):
                x0, y0 = rnd.randint(0, w - 80), rnd.randint(0, h - 80)
                d.ellipse([x0, y0, x0 + 70, y0 + 70], fill=(rnd.randint(0, 255),
                                                            rnd.randint(0, 255), rnd.randint(0, 255)))
            return im

        def jpeg(im) -> bytes:
            buf = io.BytesIO()
            im.save(buf, "JPEG", quality=85)
            return buf.getvalue()

        fx = Fixture(cls.lib)
        # A morning session held as originals.
        for i in range(2):
            fx.add(name=f"IMG_70{i:02d}.HEIC", local_time=datetime(2024, 6, 1, 9, i * 5),
                   lat=37.77, lon=-122.41, payload=jpeg(scene(900 + i)))
        # An identical shot taken twice -- same bytes, so an exact duplicate.
        same = jpeg(scene(940))
        for i in range(2):
            fx.add(name=f"IMG_71{i:02d}.HEIC", local_time=datetime(2024, 6, 1, 9, 20 + i),
                   lat=37.77, lon=-122.41, payload=same)
        # An evening session available only as derivatives (iCloud-optimised).
        for i in range(2):
            fx.add(name=f"IMG_72{i:02d}.HEIC", local_time=datetime(2024, 6, 1, 21, i * 3),
                   original=False, derivative=True, payload=jpeg(scene(970 + i)))
        # Present in the database, absent from disk.
        fx.add(name="IMG_7300.HEIC", local_time=datetime(2024, 6, 2, 10, 0),
               original=False, derivative=False)
        fx.write()

        cls.out = cls.tmp / "out"
        rc = gp.main(["--photos-library", str(cls.lib), "--out", str(cls.out), "--no-thumbs"])
        assert rc == 0, f"tool exited {rc}"
        import json
        cls.result = json.loads((cls.out / "groups.json").read_text())

    @classmethod
    def tearDownClass(cls) -> None:
        shutil.rmtree(cls.tmp, ignore_errors=True)

    def test_sessions_come_from_database_times_not_file_mtimes(self):
        """Every file was written seconds ago; only DB times can separate these."""
        self.assertEqual(len(self.result["sessions"]), 2)
        starts = sorted(s["start"][:16] for s in self.result["sessions"])
        self.assertEqual(starts, ["2024-06-01T09:00", "2024-06-01T21:00"])

    def test_exact_duplicate_found_across_the_library(self):
        self.assertEqual(len(self.result["identical_sets"]), 1)

    def test_plan_files_under_original_names_not_uuids(self):
        plan = (self.out / "apply_plan.sh").read_text()
        self.assertIn("IMG_7000", plan)
        for line in plan.splitlines():
            if line.startswith("cp -n"):
                dest = line.rsplit("/", 1)[-1].strip("'\"")
                self.assertFalse(dest[:8].count("-") == 0 and len(dest) > 36 and
                                 dest[8] == "-", f"UUID leaked into destination: {dest}")

    def test_derivative_sourced_photo_keeps_its_real_extension(self):
        """The original was .HEIC but the file on disk is a .jpeg derivative."""
        plan = (self.out / "apply_plan.sh").read_text()
        self.assertIn("IMG_7200.jpeg", plan)

    def test_asset_with_no_local_file_is_excluded_from_output(self):
        every = {Path(f).name for s in self.result["sessions"] for f in s["files"]}
        self.assertFalse(any("7300" in n for n in every))

    def test_report_states_it_read_the_library_directly(self):
        html = (self.out / "report.html").read_text()
        self.assertIn("Read directly from the Photos library", html)
        self.assertIn("was not modified", html)


if __name__ == "__main__":
    unittest.main(verbosity=2)
