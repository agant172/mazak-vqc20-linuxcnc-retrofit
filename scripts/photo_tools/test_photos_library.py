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


@unittest.skipUnless(HAVE_PILLOW, "Pillow is needed to generate real pixels")
class MultipleSources(unittest.TestCase):
    """Several libraries plus a loose folder, merged into one grouping.

    This is the shape a household of Apple devices actually has: one iCloud
    library cached differently on each Mac, sometimes a second or archived
    library, and folders of photos that never lived in Photos at all.
    """

    @classmethod
    def setUpClass(cls) -> None:
        import io
        import random

        import group_photos as gp

        cls.gp = gp
        cls.tmp = Path(tempfile.mkdtemp(prefix="multi-"))

        def scene(seed: int, w: int = 200, h: int = 150):
            rnd = random.Random(seed)
            im = Image.new("RGB", (w, h))
            d = ImageDraw.Draw(im)
            for y in range(0, h, 5):
                d.rectangle([0, y, w, y + 5], fill=(rnd.randint(0, 255),
                                                    rnd.randint(0, 255), rnd.randint(0, 255)))
            for _ in range(8):
                x0, y0 = rnd.randint(0, w - 60), rnd.randint(0, h - 60)
                d.ellipse([x0, y0, x0 + 50, y0 + 50], fill=(rnd.randint(0, 255),
                                                            rnd.randint(0, 255), rnd.randint(0, 255)))
            return im

        def jpeg(im) -> bytes:
            buf = io.BytesIO()
            im.save(buf, "JPEG", quality=85)
            return buf.getvalue()

        # Library A -- holds true originals for three shared assets.
        cls.lib_a = cls.tmp / "MacBook.photoslibrary"
        fx_a = Fixture(cls.lib_a)
        cls.shared = []
        for i in range(3):
            payload = jpeg(scene(700 + i))
            uuid = fx_a.add(name=f"IMG_80{i:02d}.HEIC",
                            local_time=datetime(2024, 7, 1, 10, i), payload=payload)
            cls.shared.append((uuid, payload, i))
        fx_a.write()

        # Library B -- the SAME assets by UUID, but derivative-only, as on a
        # fully-optimised Mac. Plus one asset that exists nowhere else.
        cls.lib_b = cls.tmp / "iMac.photoslibrary"
        fx_b = Fixture(cls.lib_b)
        for uuid, payload, i in cls.shared:
            fx_b._pk += 1
            fx_b.rows.append((
                fx_b._pk, uuid, core_data_time(datetime(2024, 7, 1, 10, i), -28800),
                pl.NO_LOCATION, pl.NO_LOCATION, 0, 0, f"IMG_80{i:02d}.HEIC"))
            fx_b.aux.append((fx_b._pk, fx_b._pk, f"IMG_80{i:02d}.HEIC", -28800))
            d = cls.lib_b / "resources" / "derivatives" / uuid[0]
            d.mkdir(parents=True, exist_ok=True)
            (d / f"{uuid}_1_105_c.jpeg").write_bytes(payload + b"deriv")
        fx_b.add(name="IMG_9000.HEIC", local_time=datetime(2024, 7, 2, 14, 0),
                 payload=jpeg(scene(800)))
        fx_b.write()

        # A folder that was never in any Photos library.
        cls.folder = cls.tmp / "SDCard"
        cls.folder.mkdir()
        for i in range(2):
            (cls.folder / f"DSC_{i:04d}.JPG").write_bytes(jpeg(scene(900 + i)))

        cls.out = cls.tmp / "out"
        rc = gp.main(["--photos-library", str(cls.lib_a),
                      "--photos-library", str(cls.lib_b),
                      "--source", str(cls.folder),
                      "--out", str(cls.out), "--no-thumbs"])
        assert rc == 0, f"tool exited {rc}"
        import json
        cls.result = json.loads((cls.out / "groups.json").read_text())

    @classmethod
    def tearDownClass(cls) -> None:
        shutil.rmtree(cls.tmp, ignore_errors=True)

    def all_files(self) -> list[str]:
        return [f for s in self.result["sessions"] for f in s["files"]]

    def test_shared_assets_are_not_counted_twice(self):
        # 3 shared (collapsed to 3) + 1 iMac-only + 2 folder = 6, not 9.
        self.assertEqual(self.result["counts"]["items"], 6)

    def test_the_library_holding_the_original_wins(self):
        """A derivative copy must never be preferred over a true original."""
        for path in self.all_files():
            self.assertNotIn("_1_105_c", path,
                             "a derivative was kept while an original existed")
        from_a = [p for p in self.all_files() if "MacBook.photoslibrary" in p]
        self.assertEqual(len(from_a), 3, "the three shared assets should come from A")

    def test_asset_unique_to_one_library_is_still_included(self):
        self.assertTrue(any("iMac.photoslibrary" in p for p in self.all_files()),
                        "the asset only present in library B went missing")

    def test_loose_folder_is_merged_alongside_the_libraries(self):
        names = {Path(p).name for p in self.all_files()}
        self.assertIn("DSC_0000.JPG", names)
        self.assertIn("DSC_0001.JPG", names)

    def test_report_names_every_source(self):
        html = (self.out / "report.html").read_text()
        self.assertIn("Merged 3 sources", html)
        self.assertIn("MacBook.photoslibrary", html)
        self.assertIn("iMac.photoslibrary", html)
        self.assertIn("SDCard", html)

    def test_a_single_source_still_reports_relative_paths(self):
        """One input keeps the tidy relative-path form; several cannot."""
        out2 = self.tmp / "out-single"
        self.gp.main(["--photos-library", str(self.lib_a),
                      "--out", str(out2), "--no-thumbs"])
        html = (out2 / "report.html").read_text()
        self.assertNotIn("Merged", html)



class PlaceholderNames(unittest.TestCase):
    """Photos stores a UUID as ZORIGINALFILENAME for migrated assets.

    Confirmed on a real 2714-asset library: rows from 2015 carry values like
    'E238A261-704E-4097-B5D2-AD721899FD4C.JPG' -- a different UUID from the
    asset's own, left over from the library they were migrated out of. The value
    is truthful but useless as a label, so it is replaced with the capture time.
    """

    def test_recognises_a_uuid_filename(self):
        self.assertTrue(pl.is_placeholder_name(
            "E238A261-704E-4097-B5D2-AD721899FD4C.JPG"))
        self.assertTrue(pl.is_placeholder_name(
            "a12625a1-64cb-4e96-b060-f5fea788df26.jpeg"))

    def test_leaves_real_filenames_alone(self):
        for name in ("IMG_0260.HEIC", "DSC_0001.JPG", "Screenshot 2024.png",
                     "IMG_1234.JPG", "photo-of-a-thing.jpg"):
            self.assertFalse(pl.is_placeholder_name(name), name)

    def test_a_uuid_without_the_right_shape_is_not_a_placeholder(self):
        self.assertFalse(pl.is_placeholder_name("E238A261-704E-4097.JPG"))
        self.assertFalse(pl.is_placeholder_name("ZZZZZZZZ-704E-4097-B5D2-AD721899FD4C.JPG"))


@unittest.skipUnless(HAVE_PILLOW, "Pillow is needed to generate fixtures")
class ReadableNaming(unittest.TestCase):
    """A placeholder-named asset should be filed by date, not by UUID."""

    @classmethod
    def setUpClass(cls) -> None:
        import group_photos as gp

        cls.tmp = Path(tempfile.mkdtemp(prefix="names-"))
        lib = cls.tmp / "Legacy.photoslibrary"
        fx = Fixture(lib)
        # Mirrors the real library: ZORIGINALFILENAME is a foreign UUID.
        fx.add(name="E238A261-704E-4097-B5D2-AD721899FD4C.JPG",
               local_time=datetime(2015, 8, 3, 19, 53, 0), tz_offset=-21600)
        fx.add(name="IMG_0260.HEIC", local_time=datetime(2024, 6, 1, 9, 0),
               tz_offset=-21600)
        fx.write()
        cls.out = cls.tmp / "out"
        assert gp.main(["--photos-library", str(lib), "--out", str(cls.out),
                        "--no-thumbs"]) == 0

    @classmethod
    def tearDownClass(cls) -> None:
        shutil.rmtree(cls.tmp, ignore_errors=True)

    def test_uuid_named_asset_is_filed_by_capture_time(self):
        plan = (self.out / "apply_plan.sh").read_text()
        self.assertIn("2015-08-03_195300", plan)
        self.assertNotIn("E238A261", plan, "the UUID name leaked into the plan")

    def test_genuinely_named_asset_keeps_its_name(self):
        plan = (self.out / "apply_plan.sh").read_text()
        self.assertIn("IMG_0260", plan)



@unittest.skipUnless(HAVE_PILLOW, "Pillow is needed to generate fixtures")
class LivePhotoClipsAreNotPixelSources(unittest.TestCase):
    """A Live Photo's .mov must never be chosen as the asset's image.

    Found on the real library: 159 assets resolved to their motion clip because
    _best_file picks the largest file and a movie outweighs a JPEG derivative.
    Those photos could not be hashed and so dropped out of duplicate detection
    silently -- the failure only surfaced as blank thumbnails.
    """

    @classmethod
    def setUpClass(cls) -> None:
        import io
        import random

        cls.tmp = Path(tempfile.mkdtemp(prefix="live-"))
        cls.lib = cls.tmp / "Live.photoslibrary"
        fx = Fixture(cls.lib)

        rnd = random.Random(3)
        im = Image.new("RGB", (160, 120))
        d = ImageDraw.Draw(im)
        for y in range(0, 120, 5):
            d.rectangle([0, y, 160, y + 5], fill=(rnd.randint(0, 255),
                                                  rnd.randint(0, 255), rnd.randint(0, 255)))
        buf = io.BytesIO()
        im.save(buf, "JPEG", quality=85)
        cls.still_bytes = buf.getvalue()

        uuid = fx.add(name="IMG_4242.HEIC", local_time=datetime(2024, 3, 1, 12, 0),
                      original=False, derivative=True, payload=cls.still_bytes)
        # The motion clip: same asset id, deliberately much larger than the still.
        clip_dir = cls.lib / "resources" / "derivatives" / uuid[0]
        clip_dir.mkdir(parents=True, exist_ok=True)
        (clip_dir / f"{uuid}_3.mov").write_bytes(b"\x00" * (len(cls.still_bytes) * 8))
        fx.write()
        cls.uuid = uuid

    @classmethod
    def tearDownClass(cls) -> None:
        shutil.rmtree(cls.tmp, ignore_errors=True)

    def test_the_still_is_chosen_not_the_larger_movie(self):
        assets, _ = pl.read_assets(self.lib)
        self.assertEqual(len(assets), 1)
        self.assertNotEqual(assets[0].path.suffix.lower(), ".mov",
                            "the Live Photo clip was chosen as the image")
        self.assertEqual(assets[0].path.suffix.lower(), ".jpeg")

    def test_the_chosen_file_can_actually_be_decoded(self):
        """The real symptom: the picked file was not an image at all."""
        import imageio

        assets, _ = pl.read_assets(self.lib)
        gray = imageio.load_gray(assets[0].path, 9, 8)
        self.assertEqual(len(gray), 72)

    def test_video_suffixes_are_excluded_from_the_index(self):
        index = pl._index_files(self.lib, pl.DERIVATIVE_DIRS)
        for paths in index.values():
            for path in paths:
                self.assertNotIn(path.suffix.lower(), pl.NON_IMAGE_SUFFIXES)



if __name__ == "__main__":
    unittest.main(verbosity=2)
