#!/usr/bin/env python3
"""Tests for the camera-roll grouper, run against a synthetic roll.

    python3 scripts/photo_tools/test_group_photos.py

Fixtures are generated with Pillow, so the whole module skips when Pillow is
absent -- the tool itself does not need Pillow on macOS (it falls back to
``sips``), and the repo's CI gate does not install it.
"""

from __future__ import annotations

import random
import shutil
import sys
import tempfile
import unittest
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import group_photos as gp  # noqa: E402
import imageio  # noqa: E402
import metadata  # noqa: E402

try:
    from PIL import Image, ImageDraw
    HAVE_PILLOW = True
except ImportError:  # pragma: no cover
    HAVE_PILLOW = False


def scene(seed: int, w: int = 320, h: int = 240):
    """A structured image. dHash needs real detail -- a flat fill hashes to zero."""
    rnd = random.Random(seed)
    im = Image.new("RGB", (w, h))
    d = ImageDraw.Draw(im)
    for y in range(0, h, 6):
        d.rectangle([0, y, w, y + 6],
                    fill=(rnd.randint(0, 255), rnd.randint(0, 255), rnd.randint(0, 255)))
    span = max(4, min(w, h) // 3)
    for _ in range(12):
        x0, y0 = rnd.randint(0, max(1, w - span)), rnd.randint(0, max(1, h - span))
        d.ellipse([x0, y0, x0 + rnd.randint(span // 2, span), y0 + rnd.randint(span // 2, span)],
                  fill=(rnd.randint(0, 255), rnd.randint(0, 255), rnd.randint(0, 255)))
    return im


def jitter(im, amount: int):
    """A near-duplicate: same framing, slight rotation and exposure lift."""
    out = im.copy().rotate(amount * 0.25, fillcolor=(0, 0, 0))
    px = out.load()
    rnd = random.Random(amount)
    for _ in range(amount * 40):
        x, y = rnd.randint(0, out.width - 1), rnd.randint(0, out.height - 1)
        r, g, b = px[x, y]
        px[x, y] = (min(255, r + 12), min(255, g + 12), min(255, b + 12))
    return out


def save(im, path: Path, when: str, gps: tuple[float, float] | None = None) -> Path:
    exif = Image.Exif()
    exif.get_ifd(0x8769)[0x9003] = when      # DateTimeOriginal, in the Exif IFD
    exif[0x0132] = when                      # DateTime, IFD0 fallback
    if gps:
        lat, lon = gps
        g = exif.get_ifd(0x8825)
        g[1] = "N" if lat >= 0 else "S"
        g[2] = (int(abs(lat)), int(abs(lat) * 60 % 60), round(abs(lat) * 3600 % 60, 2))
        g[3] = "E" if lon >= 0 else "W"
        g[4] = (int(abs(lon)), int(abs(lon) * 60 % 60), round(abs(lon) * 3600 % 60, 2))
    im.save(path, "JPEG", quality=88, exif=exif.tobytes())
    return path


SF = (37.77, -122.41)
NYC = (40.71, -74.00)


@unittest.skipUnless(HAVE_PILLOW, "Pillow is needed to generate fixtures")
class CameraRoll(unittest.TestCase):
    """One synthetic roll with known answers, shared by every assertion below."""

    @classmethod
    def setUpClass(cls) -> None:
        cls.tmp = Path(tempfile.mkdtemp(prefix="rolltest-"))
        root = cls.root = cls.tmp / "roll"
        root.mkdir()

        # Session 1 -- morning, then a 4-shot burst of one subject.
        cls.plain1 = [save(scene(100 + i), root / f"IMG_10{i:02d}.JPG",
                           f"2024:01:15 10:0{i}:00", SF) for i in range(3)]
        base = scene(200)
        cls.burst = [save(jitter(base, i), root / f"IMG_11{i:02d}.JPG",
                          f"2024:01:15 10:2{i}:00", SF) for i in range(4)]

        # Session 2 -- same day, 20:00. A ~9.5 h gap must split it.
        cls.evening = [save(scene(300 + i), root / f"IMG_20{i:02d}.JPG",
                            f"2024:01:15 20:{i:02d}:00", SF) for i in range(3)]

        # Session 3 -- another day, plus a byte-identical copy of one file.
        cls.day3 = [save(scene(400 + i), root / f"IMG_30{i:02d}.JPG",
                         f"2024:03:02 14:{i:02d}:00", SF) for i in range(3)]
        cls.exact_copy = root / "IMG_3000_copy.JPG"
        shutil.copy2(cls.day3[0], cls.exact_copy)

        # Session 4 -- 28 minutes after session 3 but 4000 km away. Only the
        # location jump can split this; the time gap is far under the threshold.
        cls.faraway = [save(scene(500 + i), root / f"IMG_40{i:02d}.JPG",
                            f"2024:03:02 14:3{i}:00", NYC) for i in range(2)]

        # A Live Photo pair, and a file that is not decodable.
        cls.live_still = save(scene(600), root / "IMG_5000.JPG", "2024:03:02 15:00:00")
        cls.live_clip = root / "IMG_5000.MOV"
        cls.live_clip.write_bytes(b"\x00\x00\x00\x18ftypqt  " + b"\x00" * 400)
        cls.corrupt = root / "IMG_9999.JPG"
        cls.corrupt.write_bytes(b"\xff\xd8\xff\xe0 not a real jpeg " * 8)

        cls.out = cls.tmp / "out"
        rc = gp.main(["--source", str(root), "--out", str(cls.out), "--no-thumbs"])
        assert rc == 0, f"tool exited {rc}"

        import json
        cls.result = json.loads((cls.out / "groups.json").read_text())

    @classmethod
    def tearDownClass(cls) -> None:
        shutil.rmtree(cls.tmp, ignore_errors=True)

    # -- helpers ---------------------------------------------------------
    @staticmethod
    def names(paths) -> set[str]:
        return {Path(p).name for p in paths}

    def session_of(self, filename: str) -> set[str]:
        for s in self.result["sessions"]:
            if filename in self.names(s["files"]):
                return self.names(s["files"])
        self.fail(f"{filename} landed in no session")

    # -- metadata --------------------------------------------------------
    def test_exif_date_is_read(self):
        m = metadata.read(self.plain1[0])
        self.assertEqual(m.source, "exif")
        self.assertEqual(m.taken, datetime(2024, 1, 15, 10, 0, 0))

    def test_exif_gps_hemisphere_signs(self):
        m = metadata.read(self.faraway[0])
        self.assertAlmostEqual(m.lat, 40.71, places=2)
        self.assertAlmostEqual(m.lon, -74.00, places=2)  # W must come back negative

    def test_undecodable_file_falls_back_to_mtime(self):
        m = metadata.read(self.corrupt)
        self.assertEqual(m.source, "mtime")
        self.assertFalse(m.reliable)

    # -- hashing ---------------------------------------------------------
    def test_identical_content_hashes_identically(self):
        self.assertEqual(gp.dhash(self.day3[0]), gp.dhash(self.exact_copy))

    def test_similar_images_are_close_and_different_ones_are_not(self):
        near = bin(gp.dhash(self.burst[0]) ^ gp.dhash(self.burst[3])).count("1")
        far = bin(gp.dhash(self.plain1[0]) ^ gp.dhash(self.day3[0])).count("1")
        self.assertLessEqual(near, 5, "a jittered retake should be within threshold")
        self.assertGreater(far, 5, "unrelated scenes must not collide")
        self.assertGreater(far, near)

    # -- clustering ------------------------------------------------------
    def test_burst_is_found_as_one_near_duplicate_set(self):
        sets = [self.names([s["keep"]] + s["others"]) for s in self.result["similar_sets"]]
        self.assertIn({p.name for p in self.burst}, sets)

    def test_unrelated_photos_are_not_clustered(self):
        clustered = {n for s in self.result["similar_sets"]
                     for n in self.names([s["keep"]] + s["others"])}
        for photo in self.plain1 + self.evening:
            self.assertNotIn(photo.name, clustered)

    def test_identical_files_reported_as_identical_not_merely_similar(self):
        sets = [self.names([s["keep"]] + s["redundant"])
                for s in self.result["identical_sets"]]
        self.assertIn({self.day3[0].name, self.exact_copy.name}, sets)
        # and must not be double-reported in the near-duplicate section
        similar = [self.names([s["keep"]] + s["others"]) for s in self.result["similar_sets"]]
        self.assertNotIn({self.day3[0].name, self.exact_copy.name}, similar)

    # -- sessions --------------------------------------------------------
    def test_long_time_gap_splits_the_day(self):
        morning = self.session_of("IMG_1000.JPG")
        self.assertNotIn("IMG_2000.JPG", morning, "a 9.5 h gap must start a new session")
        self.assertIn("IMG_1103.JPG", morning, "the burst belongs to the morning session")

    def test_location_jump_splits_despite_a_short_gap(self):
        # 28 minutes apart, 4000 km apart. Time alone would keep them together.
        self.assertNotIn("IMG_4000.JPG", self.session_of("IMG_3002.JPG"))

    def test_location_jump_split_can_be_disabled(self):
        out2 = self.tmp / "out-nojump"
        gp.main(["--source", str(self.root), "--out", str(out2),
                 "--no-thumbs", "--jump-km", "0"])
        import json
        res = json.loads((out2 / "groups.json").read_text())
        together = next(s for s in res["sessions"]
                        if "IMG_3002.JPG" in self.names(s["files"]))
        self.assertIn("IMG_4000.JPG", self.names(together["files"]))

    def test_every_item_lands_in_exactly_one_session(self):
        seen: list[str] = []
        for s in self.result["sessions"]:
            seen.extend(self.names(s["files"]))
        self.assertEqual(len(seen), len(set(seen)), "an item appeared in two sessions")
        self.assertIn(self.corrupt.name, seen, "an unreadable file still needs a session")

    # -- Live Photos and failures ---------------------------------------
    def test_live_photo_clip_is_folded_into_its_still(self):
        every = {n for s in self.result["sessions"] for n in self.names(s["files"])}
        self.assertIn("IMG_5000.JPG", every)
        self.assertNotIn("IMG_5000.MOV", every, "the clip must not be a separate item")

    def test_unreadable_file_is_reported_not_silently_dropped(self):
        self.assertIn(self.corrupt.name,
                      {Path(u["file"]).name for u in self.result["unreadable"]})

    # -- the safety property that matters most ---------------------------
    def test_generated_plan_never_deletes_or_moves(self):
        plan = (self.out / "apply_plan.sh").read_text()
        for line in plan.splitlines():
            stripped = line.strip()
            if not stripped or stripped.startswith("#"):
                continue
            self.assertNotRegex(stripped, r"\b(rm|mv|rmdir|trash|unlink)\b",
                                f"destructive command in generated plan: {line}")
        self.assertIn("cp -n", plan, "the plan should copy")

    def test_plan_keeps_one_of_each_duplicate_set_and_sets_the_rest_aside(self):
        plan = (self.out / "apply_plan.sh").read_text()
        self.assertIn("_review_duplicates", plan)
        # the redundant copy is set aside, the keeper is filed normally
        keep = next(s["keep"] for s in self.result["identical_sets"])
        redundant = next(s["redundant"][0] for s in self.result["identical_sets"])
        self.assertIn('"$DEST/_review_duplicates"/', plan)
        self.assertIn(redundant, plan)
        self.assertIn(keep, plan)
        redundant_name = Path(redundant).name
        self.assertIn(f'"$DEST/_review_duplicates"/{redundant_name}', plan,
                      "the set-aside copy should be given an explicit filename")

    def test_executing_the_plan_leaves_the_source_untouched(self):
        """The whole safety claim, checked by actually running the script."""
        import subprocess

        before = sorted(p.name for p in self.root.rglob("*") if p.is_file())
        dest = self.tmp / "applied"
        plan = self.out / "apply_plan.sh"
        # Point the plan at a fresh destination without regenerating it.
        text = plan.read_text().replace(f"DEST={self.out / 'organised'}", f"DEST={dest}")
        run_me = self.tmp / "run_plan.sh"
        run_me.write_text(text)
        proc = subprocess.run(["sh", str(run_me)], capture_output=True, text=True)
        self.assertEqual(proc.returncode, 0, proc.stderr)

        after = sorted(p.name for p in self.root.rglob("*") if p.is_file())
        self.assertEqual(before, after, "the source tree was modified")

        # Every source file must be somewhere in the output -- filed or set aside.
        placed = {p.name for p in dest.rglob("*") if p.is_file()}
        self.assertEqual(placed, set(before), "a file went missing in the reorganisation")

        # The Live Photo clip should follow its still rather than be orphaned.
        still = next(p for p in dest.rglob("IMG_5000.JPG"))
        self.assertTrue((still.parent / "IMG_5000.MOV").is_file(),
                        "the Live Photo clip did not follow its still")

        # Redundant copies go to review, never straight into a session folder.
        review = {p.name for p in (dest / "_review_duplicates").iterdir()}
        self.assertIn("IMG_3000_copy.JPG", review)
        self.assertNotIn("IMG_3000.JPG", review, "the keeper must not be set aside")

    def test_plan_expands_its_destination_variable(self):
        """A quoting slip here would create a directory literally named $DEST."""
        plan = (self.out / "apply_plan.sh").read_text()
        self.assertNotIn("'$DEST", plan, "$DEST was single-quoted and will not expand")

    def test_report_and_artifacts_are_written(self):
        for name in ("report.html", "groups.json", "apply_plan.sh"):
            self.assertTrue((self.out / name).is_file(), f"{name} missing")
        html = (self.out / "report.html").read_text()
        self.assertIn("Nothing has been moved", html)
        self.assertIn("<html", html)


@unittest.skipUnless(HAVE_PILLOW, "Pillow is needed to generate fixtures")
class PurePythonPngReader(unittest.TestCase):
    """The macOS/sips path decodes PNG without Pillow, so check that reader."""

    def _roundtrip(self, mode: str, size=(48, 32)):
        tmp = Path(tempfile.mkdtemp(prefix="png-"))
        try:
            im = scene(7, *size).convert(mode)
            path = tmp / f"{mode}.png"
            im.save(path)
            w, h, gray = imageio.decode_png_gray(path.read_bytes())
            self.assertEqual((w, h), size)
            self.assertEqual(len(gray), size[0] * size[1])
            expected = list(im.convert("L").getdata())
            worst = max(abs(a - b) for a, b in zip(gray, expected))
            self.assertLessEqual(worst, 3, f"{mode}: luminance drifted by {worst}")
        finally:
            shutil.rmtree(tmp, ignore_errors=True)

    def test_decodes_rgb(self):
        self._roundtrip("RGB")

    def test_decodes_grayscale(self):
        self._roundtrip("L")

    def test_decodes_rgba(self):
        self._roundtrip("RGBA")

    def test_decodes_palette(self):
        self._roundtrip("P")

    def test_rejects_non_png(self):
        with self.assertRaises(imageio.DecodeError):
            imageio.decode_png_gray(b"\xff\xd8\xff\xe0 jpeg not png")


if __name__ == "__main__":
    unittest.main(verbosity=2)
