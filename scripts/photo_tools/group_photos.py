#!/usr/bin/env python3
"""Group an iPhone camera roll into shooting sessions and near-duplicate sets.

Two independent groupings are produced, because they answer different questions:

* **Sessions** -- photos sorted by capture time and split wherever the gap
  exceeds ``--gap-hours``. This is the "these belong together" grouping: an
  afternoon at the shop, a trip, one evening. A GPS fix, where present, labels
  the session and can also force a split when the location jumps.

* **Near-duplicate clusters** -- photos whose perceptual hashes are within
  ``--threshold`` bits of each other. This is the "you took this same shot nine
  times" grouping: bursts, retakes, and edited copies. Exact byte-identical
  files are reported separately, since those are unambiguous.

Nothing is moved, renamed, or deleted. The run writes a report you read first;
acting on it is a second, separate step you take yourself.

    python3 group_photos.py --source ~/Pictures/CameraRollExport
    open photo-grouping-report/report.html
    # then, only if you agree with it:
    sh photo-grouping-report/apply_plan.sh
"""

from __future__ import annotations

import argparse
import concurrent.futures
import hashlib
import html
import json
import shlex
import sys
from collections import defaultdict
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import imageio  # noqa: E402
import metadata  # noqa: E402

IMAGE_SUFFIXES = {".jpg", ".jpeg", ".jpe", ".png", ".heic", ".heif", ".hif",
                  ".avci", ".gif", ".tif", ".tiff", ".bmp", ".webp", ".dng", ".cr2", ".nef"}
VIDEO_SUFFIXES = {".mov", ".mp4", ".m4v", ".avi", ".3gp"}

HASH_W, HASH_H = 9, 8          # 9x8 grayscale -> 8x8 horizontal deltas -> 64 bits
THUMBS_PER_SESSION = 8         # cover strip length in the report


@dataclass
class Photo:
    path: Path
    size: int
    taken: datetime
    time_source: str
    lat: float | None = None
    lon: float | None = None
    dhash: int | None = None
    sha: str | None = None
    is_video: bool = False
    live_sidecar: Path | None = None
    error: str | None = None
    thumb: str | None = None
    display_name: str | None = None   # set when the filename on disk is a UUID
    from_original: bool = True        # False when only a Photos derivative existed
    origin: str = ""                  # which library or folder this came from
    asset_uuid: str | None = None     # Photos asset id, stable across synced devices
    name_is_placeholder: bool = False # stored name is a UUID; use the date instead

    session: int = -1
    similar_group: int = -1
    exact_group: int = -1

    @property
    def label(self) -> str:
        if self.name_is_placeholder:
            return self.readable_name
        return self.display_name or self.path.name

    @property
    def readable_name(self) -> str:
        """A name built from the capture time, for photos Photos never named.

        Migrated assets carry a UUID as their "original filename". Filing
        thousands of those defeats the point of sorting, so they are named for
        when they were taken instead -- which also sorts correctly in Finder.
        """
        return f"{self.taken:%Y-%m-%d_%H%M%S}{self.path.suffix.lower()}"

    @property
    def dest_name(self) -> str:
        """Filename to file this under: the original's stem, the real suffix.

        A Photos derivative is a JPEG called <UUID>_1_105_c.jpeg even when the
        original was IMG_1234.HEIC, so neither name is right on its own.
        """
        if self.name_is_placeholder:
            return self.readable_name
        if not self.display_name:
            return self.path.name
        return Path(self.display_name).stem + self.path.suffix


# --------------------------------------------------------------------------
# Scan
# --------------------------------------------------------------------------


def scan(source: Path, include_videos: bool) -> tuple[list[Photo], list[Path]]:
    """Walk the source tree; return photos plus the Live Photo clips folded in."""
    by_stem: dict[Path, list[Path]] = defaultdict(list)
    files: list[Path] = []
    for path in sorted(source.rglob("*")):
        if not path.is_file() or path.name.startswith("."):
            continue
        suffix = path.suffix.lower()
        if suffix in IMAGE_SUFFIXES or suffix in VIDEO_SUFFIXES:
            files.append(path)
            by_stem[path.parent / path.stem].append(path)

    # An iPhone Live Photo is a still plus a same-stem .MOV. Treat the clip as a
    # sidecar of the still rather than a separate item, so a Live Photo does not
    # show up as two things that need sorting.
    sidecars: dict[Path, Path] = {}
    folded: list[Path] = []
    for stem, group in by_stem.items():
        stills = [p for p in group if p.suffix.lower() in IMAGE_SUFFIXES]
        clips = [p for p in group if p.suffix.lower() in VIDEO_SUFFIXES]
        if stills and clips:
            for clip in clips:
                sidecars[stills[0]] = clip
                folded.append(clip)

    photos: list[Photo] = []
    for path in files:
        suffix = path.suffix.lower()
        is_video = suffix in VIDEO_SUFFIXES
        if path in folded:
            continue
        if is_video and not include_videos:
            continue
        try:
            stat = path.stat()
        except OSError:
            continue
        meta = metadata.read(path)
        photos.append(Photo(
            path=path, size=stat.st_size, taken=meta.taken, time_source=meta.source,
            lat=meta.lat, lon=meta.lon, is_video=is_video,
            live_sidecar=sidecars.get(path),
        ))
    return photos, folded


def scan_photos_library(library: Path, include_videos: bool) -> tuple[list[Photo], dict]:
    """Build the photo list from a Photos library instead of a folder.

    Metadata comes from the database rather than the file, because a derivative
    JPEG carries no useful EXIF -- reading the file would fall back to mtime and
    collapse every session into one.
    """
    import photos_library

    assets, stats = photos_library.read_assets(library, include_videos)
    photos: list[Photo] = []
    for asset in assets:
        if not asset.size:
            continue
        photos.append(Photo(
            path=asset.path, size=asset.size, taken=asset.taken, time_source="photos-db",
            lat=asset.lat, lon=asset.lon, is_video=asset.is_video,
            display_name=asset.original_name, from_original=asset.from_original,
            origin=library.name, asset_uuid=asset.uuid,
            name_is_placeholder=asset.placeholder_name,
        ))
    return photos, stats


def _better_copy(a: Photo, b: Photo) -> bool:
    """Is `a` the copy worth keeping when the same asset is in two libraries?"""
    if a.from_original != b.from_original:
        return a.from_original          # a real original beats a derivative
    return a.size > b.size              # otherwise the larger file


def dedupe_across_libraries(photos: list[Photo]) -> tuple[list[Photo], int]:
    """Collapse assets that appear in more than one library.

    Photos gives an asset the same UUID on every device that syncs it, so the
    same photo present in two libraries is one photo, not two -- matching on the
    id is exact and needs no hashing. Where both copies exist, the better local
    file wins, so a library holding the true original is preferred over one
    holding only a derivative. Photos in separate, unsynced libraries have
    different ids and are left to the ordinary duplicate detection.
    """
    best: dict[str, Photo] = {}
    passthrough: list[Photo] = []
    dropped = 0
    for photo in photos:
        if not photo.asset_uuid:
            passthrough.append(photo)
            continue
        seen = best.get(photo.asset_uuid)
        if seen is None:
            best[photo.asset_uuid] = photo
        else:
            dropped += 1
            if _better_copy(photo, seen):
                best[photo.asset_uuid] = photo
    return passthrough + list(best.values()), dropped


# --------------------------------------------------------------------------
# Hashing
# --------------------------------------------------------------------------


def dhash(path: Path) -> int:
    """64-bit difference hash: each bit is 'this pixel brighter than its right neighbour'."""
    gray = imageio.load_gray(path, HASH_W, HASH_H)
    bits = 0
    for row in range(HASH_H):
        base = row * HASH_W
        for col in range(HASH_W - 1):
            bits = (bits << 1) | (1 if gray[base + col] > gray[base + col + 1] else 0)
    return bits


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            digest.update(chunk)
    return digest.hexdigest()


def compute_hashes(photos: list[Photo], workers: int) -> None:
    """Fill in dhash for every image, and sha256 only where it can matter."""
    images = [p for p in photos if not p.is_video]

    def work(photo: Photo) -> None:
        try:
            photo.dhash = dhash(photo.path)
        except Exception as exc:  # noqa: BLE001 - one bad file must not stop the run
            photo.error = str(exc)[:200]

    done = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as pool:
        for _ in pool.map(work, images):
            done += 1
            if done % 100 == 0 or done == len(images):
                print(f"\r  hashed {done}/{len(images)}", end="", file=sys.stderr, flush=True)
    print(file=sys.stderr)

    # Byte-identical files must share a size, so only hash inside size groups.
    # On a camera roll that skips the full read for almost every file.
    by_size: dict[int, list[Photo]] = defaultdict(list)
    for photo in photos:
        by_size[photo.size].append(photo)
    candidates = [p for group in by_size.values() if len(group) > 1 for p in group]
    if candidates:
        with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as pool:
            def checksum(photo: Photo) -> None:
                try:
                    photo.sha = sha256(photo.path)
                except OSError as exc:
                    photo.error = photo.error or str(exc)[:200]
            list(pool.map(checksum, candidates))
        print(f"  checksummed {len(candidates)} same-size files", file=sys.stderr)


# --------------------------------------------------------------------------
# Clustering
# --------------------------------------------------------------------------


class Union:
    """Disjoint-set, used to turn pairwise 'these two are similar' into clusters."""

    def __init__(self, n: int) -> None:
        self.parent = list(range(n))

    def find(self, a: int) -> int:
        while self.parent[a] != a:
            self.parent[a] = self.parent[self.parent[a]]
            a = self.parent[a]
        return a

    def union(self, a: int, b: int) -> None:
        ra, rb = self.find(a), self.find(b)
        if ra != rb:
            self.parent[rb] = ra

    def groups(self) -> dict[int, list[int]]:
        out: dict[int, list[int]] = defaultdict(list)
        for i in range(len(self.parent)):
            out[self.find(i)].append(i)
        return out


def cluster_similar(photos: list[Photo], threshold: int) -> int:
    """Link photos whose hashes are within `threshold` bits. Returns cluster count.

    Comparing every pair would be quadratic, which is far too slow for a real
    camera roll. Instead the hash is cut into ``threshold + 1`` blocks: two
    hashes differing in at most ``threshold`` bits must, by the pigeonhole
    principle, agree exactly on at least one whole block. Indexing the blocks
    therefore yields every true match as a candidate, with no false negatives.
    """
    indexed = [p for p in photos if p.dhash is not None]
    if not indexed:
        return 0

    nblocks = threshold + 1
    edges = 64 // nblocks
    bounds = []
    start = 0
    for i in range(nblocks):
        width = edges + (1 if i < 64 % nblocks else 0)
        bounds.append((start, width))
        start += width

    index: list[dict[int, list[int]]] = [defaultdict(list) for _ in range(nblocks)]
    for i, photo in enumerate(indexed):
        for b, (shift, width) in enumerate(bounds):
            block = (photo.dhash >> shift) & ((1 << width) - 1)
            index[b][block].append(i)

    union = Union(len(indexed))
    for i, photo in enumerate(indexed):
        seen: set[int] = set()
        for b, (shift, width) in enumerate(bounds):
            block = (photo.dhash >> shift) & ((1 << width) - 1)
            seen.update(index[b][block])
        for j in seen:
            if j <= i:
                continue
            if bin(photo.dhash ^ indexed[j].dhash).count("1") <= threshold:
                union.union(i, j)

    count = 0
    for members in union.groups().values():
        if len(members) < 2:
            continue
        for m in members:
            indexed[m].similar_group = count
        count += 1
    return count


def cluster_exact(photos: list[Photo]) -> int:
    by_sha: dict[str, list[Photo]] = defaultdict(list)
    for photo in photos:
        if photo.sha:
            by_sha[photo.sha].append(photo)
    count = 0
    for group in by_sha.values():
        if len(group) < 2:
            continue
        for photo in group:
            photo.exact_group = count
        count += 1
    return count


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    from math import asin, cos, radians, sin, sqrt

    dlat, dlon = radians(lat2 - lat1), radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    return 2 * 6371.0 * asin(sqrt(a))


def cluster_sessions(photos: list[Photo], gap_hours: float, jump_km: float) -> int:
    """Split the timeline wherever there is a long pause or a big location jump."""
    ordered = sorted(photos, key=lambda p: p.taken)
    if not ordered:
        return 0
    gap = timedelta(hours=gap_hours)
    session = 0
    ordered[0].session = 0
    last_fix: tuple[float, float] | None = (
        (ordered[0].lat, ordered[0].lon) if ordered[0].lat is not None else None
    )
    for prev, cur in zip(ordered, ordered[1:]):
        split = cur.taken - prev.taken > gap
        if not split and jump_km > 0 and last_fix and cur.lat is not None:
            if haversine_km(last_fix[0], last_fix[1], cur.lat, cur.lon) > jump_km:
                split = True
        if split:
            session += 1
        cur.session = session
        if cur.lat is not None:
            last_fix = (cur.lat, cur.lon)
    return session + 1


# --------------------------------------------------------------------------
# Report
# --------------------------------------------------------------------------


def human_size(nbytes: float) -> str:
    for unit, scale in (("GB", 1e9), ("MB", 1e6), ("kB", 1e3)):
        if nbytes >= scale:
            return f"{nbytes / scale:.1f} {unit}"
    return f"{nbytes:.0f} B"


def rel_to(path: Path, source: Path | None) -> str:
    """Show a path relative to the scanned root; absolute paths wrap badly."""
    if source is None:
        return str(path)
    try:
        return str(path.relative_to(source))
    except ValueError:
        return str(path)


def keeper(group: list[Photo]) -> Photo:
    """Pick the one to keep from a near-duplicate set: biggest file, then earliest."""
    return max(group, key=lambda p: (p.size, -p.taken.timestamp()))


def session_name(members: list[Photo], index: int) -> str:
    start = min(p.taken for p in members)
    end = max(p.taken for p in members)
    if start.date() == end.date():
        return f"{start:%Y-%m-%d}_session-{index + 1:03d}"
    return f"{start:%Y-%m-%d}_to_{end:%m-%d}_session-{index + 1:03d}"


def build_thumbs(photos: list[Photo], sessions: dict[int, list[Photo]],
                 out_dir: Path, workers: int) -> None:
    """Thumbnail every near-duplicate plus a cover strip per session.

    Thumbnailing the whole roll would make a report too heavy to open, and the
    pictures only really need to be visible where a judgement call is being
    asked of the reader -- which is the duplicate clusters.
    """
    wanted: list[Photo] = [p for p in photos if p.similar_group >= 0 or p.exact_group >= 0]
    for members in sessions.values():
        wanted.extend(sorted(members, key=lambda p: p.taken)[:THUMBS_PER_SESSION])

    unique = {p.path: p for p in wanted if not p.is_video}
    thumb_dir = out_dir / "thumbs"

    def work(item: tuple[Path, Photo]) -> None:
        path, photo = item
        name = hashlib.sha1(str(path).encode()).hexdigest()[:16] + ".jpg"
        if imageio.make_thumb(path, thumb_dir / name):
            photo.thumb = f"thumbs/{name}"

    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as pool:
        list(pool.map(work, unique.items()))
    made = sum(1 for p in unique.values() if p.thumb)
    print(f"  thumbnails: {made}/{len(unique)}", file=sys.stderr)


CSS = """
:root{--bg:#fbfbfa;--fg:#1c1c1a;--mut:#6b6b66;--line:#e2e1dc;--card:#fff;--warn:#8a5a00;--warnbg:#fdf6e6}
@media(prefers-color-scheme:dark){:root{--bg:#17171a;--fg:#e8e8e4;--mut:#9a9a94;--line:#2f2f34;--card:#1f1f23;--warn:#e0b050;--warnbg:#2b2415}}
*{box-sizing:border-box}
body{margin:0;padding:2rem 1.5rem 5rem;background:var(--bg);color:var(--fg);
font:15px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif}
.wrap{max-width:1100px;margin:0 auto}
h1{font-size:1.6rem;margin:0 0 .3rem} h2{font-size:1.15rem;margin:2.5rem 0 .8rem;
padding-bottom:.4rem;border-bottom:1px solid var(--line)}
.sub{color:var(--mut);margin:0 0 2rem}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.75rem;margin:1.5rem 0}
.stat{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:.8rem .9rem}
.stat b{display:block;font-size:1.5rem;line-height:1.2} .stat span{color:var(--mut);font-size:.82rem}
.note{background:var(--warnbg);color:var(--warn);border:1px solid currentColor;border-radius:8px;
padding:.7rem .9rem;margin:1rem 0;font-size:.88rem}
.card{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:.9rem;margin:.7rem 0}
.card h3{margin:0 0 .2rem;font-size:.98rem} .meta{color:var(--mut);font-size:.83rem;margin:0 0 .6rem}
.strip{display:flex;gap:.4rem;flex-wrap:wrap}
.strip figure{margin:0;width:120px}
.strip img{width:120px;height:120px;object-fit:cover;border-radius:5px;display:block;background:var(--line)}
.strip figcaption{font-size:.68rem;color:var(--mut);margin-top:.2rem;word-break:break-all}
.keep img{outline:2px solid #2e9e5b;outline-offset:1px}
.keep figcaption{color:#2e9e5b;font-weight:600}
table{width:100%;border-collapse:collapse;font-size:.86rem;display:block;overflow-x:auto}
th,td{text-align:left;padding:.4rem .6rem;border-bottom:1px solid var(--line);white-space:nowrap}
th{color:var(--mut);font-weight:600}
code{font:12px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;background:var(--line);
padding:.1rem .3rem;border-radius:3px}
"""


def write_report(out_dir: Path, photos: list[Photo], sessions: dict[int, list[Photo]],
                 similar: dict[int, list[Photo]], exact: dict[int, list[Photo]],
                 args: argparse.Namespace, folded: list[Path],
                 lib_stats: dict | None = None) -> None:
    esc = html.escape
    sources = getattr(args, "sources", []) or []
    source_line = (", ".join(f"{name} ({count})" for name, count in sources)
                   if sources else str(args.report_root or ""))
    reclaim = sum(
        sum(p.size for p in group if p is not keeper(group))
        for group in list(similar.values()) + list(exact.values())
    )
    unreliable = sum(1 for p in photos if p.time_source == "mtime")
    failed = [p for p in photos if p.error]

    parts: list[str] = [
        "<!doctype html><html><head><meta charset='utf-8'>",
        "<meta name='viewport' content='width=device-width,initial-scale=1'>",
        "<title>Camera roll grouping</title><style>", CSS, "</style></head><body><div class='wrap'>",
        "<h1>Camera roll grouping</h1>",
        f"<p class='sub'>{esc(source_line)} &middot; generated {datetime.now():%Y-%m-%d %H:%M}"
        f" &middot; decode backends: {esc(imageio.backend_report())}</p>",
        "<div class='stats'>",
        f"<div class='stat'><b>{len(photos)}</b><span>items</span></div>",
        f"<div class='stat'><b>{len(sessions)}</b><span>sessions</span></div>",
        f"<div class='stat'><b>{len(similar)}</b><span>near-duplicate sets</span></div>",
        f"<div class='stat'><b>{len(exact)}</b><span>identical-file sets</span></div>",
        f"<div class='stat'><b>{human_size(reclaim)}</b><span>redundant</span></div>",
        "</div>",
        "<div class='note'><b>Nothing has been moved.</b> This is a proposal. "
        f"Reordering runs only when you execute <code>apply_plan.sh</code>, and it "
        f"copies rather than deletes &mdash; duplicates go to a review folder so you "
        f"can look before anything is lost.</div>",
    ]

    if unreliable:
        parts.append(
            f"<div class='note'>{unreliable} item(s) had no capture time in their metadata, so "
            "the file's modification date was used. If this export was copied or synced, those "
            "dates are the copy date and their session grouping will be wrong. "
            "Re-export with metadata preserved to fix it.</div>"
        )
    if len(sources) > 1:
        collapsed = getattr(args, "cross_library_dupes", 0)
        parts.append(
            f"<div class='note'>Merged {len(sources)} sources: "
            + esc(", ".join(f"{name} ({count} items)" for name, count in sources))
            + (f". {collapsed} asset(s) appeared in more than one library and were "
               f"collapsed to a single copy, keeping whichever had the better local "
               f"file. Photos held in separate unsynced libraries carry different ids, "
               f"so any remaining overlap shows up as a duplicate set below."
               if collapsed else
               ". No asset appeared in two libraries under the same id; any overlap "
               "between them shows up as a duplicate set below.")
            + "</div>")
    if lib_stats:
        derived = sum(1 for p in photos if not p.from_original)
        parts.append(
            f"<div class='note'>Read directly from the Photos library &mdash; nothing was "
            f"exported and the library was not modified. Capture times and locations come "
            f"from the Photos database, so they are the real ones."
            + (f" {derived} item(s) had no local original, so a derivative was hashed "
               f"instead; that is fine for finding duplicates, and the timeline is "
               f"unaffected because the dates come from the database, not the file."
               if derived else "")
            + (f" {lib_stats['no_local_file']} asset(s) had no local file at all and "
               f"could not be included." if lib_stats.get("no_local_file") else "")
            + "</div>"
        )
    if folded:
        parts.append(
            f"<p class='sub'>{len(folded)} Live Photo clip(s) were folded into their stills "
            "and are not counted separately.</p>"
        )

    # ---- duplicates first: this is where a decision is actually being asked
    if exact:
        parts.append(f"<h2>Identical files &mdash; {len(exact)} set(s)</h2>")
        parts.append("<p class='sub'>Byte-for-byte the same file in more than one place. "
                     "Safe to collapse to one copy.</p>")
        for gid, group in sorted(exact.items(), key=lambda kv: -sum(p.size for p in kv[1])):
            best = keeper(group)
            parts.append("<div class='card'>")
            parts.append(f"<h3>{len(group)} copies &middot; {human_size(group[0].size)} each</h3>")
            parts.append("<div class='strip'>")
            for photo in sorted(group, key=lambda p: p.taken):
                cls = " class='keep'" if photo is best else ""
                img = (f"<img src='{esc(photo.thumb)}' loading='lazy' alt=''>"
                       if photo.thumb else "<img alt=''>")
                tag = " (keep)" if photo is best else ""
                where = rel_to(photo.path.parent, args.report_root) or "."
                parts.append(f"<figure{cls}>{img}<figcaption>{esc(photo.label)}{tag}<br>"
                             f"{esc(where)}</figcaption></figure>")
            parts.append("</div></div>")

    if similar:
        parts.append(f"<h2>Near-duplicates &mdash; {len(similar)} set(s)</h2>")
        parts.append("<p class='sub'>Visually near-identical: bursts, retakes, and edited copies. "
                     "The green outline marks the largest file, which is the suggested keeper. "
                     "Check these by eye &mdash; a burst of a moving subject may hold genuinely "
                     "different frames.</p>")
        for gid, group in sorted(similar.items(), key=lambda kv: -len(kv[1]))[:args.max_groups]:
            best = keeper(group)
            span = max(p.taken for p in group) - min(p.taken for p in group)
            parts.append("<div class='card'>")
            parts.append(f"<h3>{len(group)} similar shots</h3>")
            parts.append(f"<p class='meta'>{min(p.taken for p in group):%Y-%m-%d %H:%M} &middot; "
                         f"spanning {span.total_seconds() / 60:.0f} min &middot; "
                         f"{human_size(sum(p.size for p in group))} total</p>")
            parts.append("<div class='strip'>")
            for photo in sorted(group, key=lambda p: p.taken):
                cls = " class='keep'" if photo is best else ""
                img = (f"<img src='{esc(photo.thumb)}' loading='lazy' alt=''>"
                       if photo.thumb else "<img alt=''>")
                tag = " (keep)" if photo is best else ""
                parts.append(f"<figure{cls}>{img}<figcaption>{esc(photo.label)}{tag}"
                             f"</figcaption></figure>")
            parts.append("</div></div>")
        if len(similar) > args.max_groups:
            parts.append(f"<p class='sub'>{len(similar) - args.max_groups} further set(s) omitted "
                         f"from this page to keep it loadable; all of them are in "
                         f"<code>groups.json</code>.</p>")

    # ---- sessions
    parts.append(f"<h2>Sessions &mdash; {len(sessions)}</h2>")
    parts.append(f"<p class='sub'>Split wherever the gap exceeded {args.gap_hours} h"
                 + (f", or the location moved more than {args.jump_km} km" if args.jump_km else "")
                 + ".</p>")
    for sid in sorted(sessions, key=lambda s: min(p.taken for p in sessions[s])):
        members = sorted(sessions[sid], key=lambda p: p.taken)
        start, end = members[0].taken, members[-1].taken
        located = [p for p in members if p.lat is not None]
        parts.append("<div class='card'>")
        parts.append(f"<h3>{esc(session_name(members, sid))}</h3>")
        loc = ""
        if located:
            loc = (f" &middot; near {located[0].lat:.3f}, {located[0].lon:.3f}"
                   f" ({len(located)}/{len(members)} located)")
        dur = (end - start).total_seconds() / 3600
        parts.append(f"<p class='meta'>{len(members)} items &middot; {start:%Y-%m-%d %H:%M}"
                     f"&ndash;{end:%H:%M} ({dur:.1f} h) &middot; "
                     f"{human_size(sum(p.size for p in members))}{loc}</p>")
        parts.append("<div class='strip'>")
        for photo in members[:THUMBS_PER_SESSION]:
            img = (f"<img src='{esc(photo.thumb)}' loading='lazy' alt=''>"
                   if photo.thumb else "<img alt=''>")
            parts.append(f"<figure>{img}<figcaption>{esc(photo.label)}</figcaption></figure>")
        parts.append("</div>")
        if len(members) > THUMBS_PER_SESSION:
            parts.append(f"<p class='meta'>+{len(members) - THUMBS_PER_SESSION} more</p>")
        parts.append("</div>")

    if failed:
        parts.append(f"<h2>Could not read &mdash; {len(failed)}</h2>")
        parts.append("<p class='sub'>These were left out of the duplicate analysis. They are "
                     "still placed in a session by timestamp.</p><table><tr><th>File</th>"
                     "<th>Reason</th></tr>")
        for photo in failed[:80]:
            parts.append(f"<tr><td>{esc(rel_to(photo.path, args.report_root))}</td>"
                         f"<td>{esc(photo.error or '')}</td></tr>")
        parts.append("</table>")

    parts.append("</div></body></html>")
    (out_dir / "report.html").write_text("".join(parts), encoding="utf-8")


def write_json(out_dir: Path, photos: list[Photo], sessions: dict[int, list[Photo]],
               similar: dict[int, list[Photo]], exact: dict[int, list[Photo]]) -> None:
    payload = {
        "generated": datetime.now().isoformat(timespec="seconds"),
        "counts": {"items": len(photos), "sessions": len(sessions),
                   "similar_sets": len(similar), "identical_sets": len(exact)},
        "sessions": [
            {
                "name": session_name(sorted(members, key=lambda p: p.taken), sid),
                "start": min(p.taken for p in members).isoformat(timespec="seconds"),
                "end": max(p.taken for p in members).isoformat(timespec="seconds"),
                "files": [str(p.path) for p in sorted(members, key=lambda p: p.taken)],
            }
            for sid, members in sorted(sessions.items())
        ],
        "identical_sets": [
            {"keep": str(keeper(g).path), "redundant": [str(p.path) for p in g if p is not keeper(g)]}
            for g in exact.values()
        ],
        "similar_sets": [
            {"keep": str(keeper(g).path), "others": [str(p.path) for p in g if p is not keeper(g)]}
            for g in similar.values()
        ],
        "unreadable": [{"file": str(p.path), "error": p.error} for p in photos if p.error],
    }
    (out_dir / "groups.json").write_text(json.dumps(payload, indent=2), encoding="utf-8")


def write_plan(out_dir: Path, sessions: dict[int, list[Photo]],
               similar: dict[int, list[Photo]], exact: dict[int, list[Photo]],
               dest: Path) -> None:
    """Emit a shell script that reorganises by COPYING. It never deletes."""
    q = shlex.quote
    lines = [
        "#!/bin/sh",
        "# Generated by group_photos.py -- review before running.",
        "#",
        "# This script COPIES files into a new tree. It never deletes or modifies",
        "# anything in the source, so running it cannot lose a photo; the cost is",
        "# that it needs free space for a second copy. Once you have checked the",
        "# result, remove the originals yourself.",
        "#",
        "# Duplicates are not discarded -- they are copied to _review_duplicates/",
        "# so you can look at them before deciding.",
        "set -eu",
        f"DEST={q(str(dest))}",
        'echo "Writing to $DEST"',
        "",
    ]

    redundant = {
        str(p.path): p
        for group in list(similar.values()) + list(exact.values())
        for p in group if p is not keeper(group)
    }

    def unique(taken: set[str], wanted: str, photo: Photo) -> str:
        """Two photos can share an original filename; never let one hide another."""
        if wanted not in taken:
            taken.add(wanted)
            return wanted
        stem, suffix = Path(wanted).stem, Path(wanted).suffix
        marker = (photo.display_name and str(abs(hash(str(photo.path))))[:6]) or "dup"
        candidate = f"{stem}_{marker}{suffix}"
        n = 2
        while candidate in taken:
            candidate = f"{stem}_{marker}_{n}{suffix}"
            n += 1
        taken.add(candidate)
        return candidate

    for sid, members in sorted(sessions.items(), key=lambda kv: min(p.taken for p in kv[1])):
        ordered = sorted(members, key=lambda p: p.taken)
        name = session_name(ordered, sid)
        year = ordered[0].taken.year
        folder = f'"$DEST"/{q(f"{year}/{name}")}'
        lines.append(f"mkdir -p {folder}")
        used: set[str] = set()
        for photo in ordered:
            if str(photo.path) in redundant:
                continue
            target = unique(used, photo.dest_name, photo)
            lines.append(f"cp -n {q(str(photo.path))} {folder}/{q(target)}")
            if photo.live_sidecar:
                clip = unique(used, photo.live_sidecar.name, photo)
                lines.append(f"cp -n {q(str(photo.live_sidecar))} {folder}/{q(clip)}")
        lines.append("")

    if redundant:
        lines.append('mkdir -p "$DEST/_review_duplicates"')
        used_dup: set[str] = set()
        for photo in sorted(redundant.values(), key=lambda p: str(p.path)):
            target = unique(used_dup, photo.dest_name, photo)
            lines.append(f'cp -n {q(str(photo.path))} "$DEST/_review_duplicates"/{q(target)}')
        lines.append("")

    lines.append('echo "Done. Originals were left untouched."')
    plan = out_dir / "apply_plan.sh"
    plan.write_text("\n".join(lines) + "\n", encoding="utf-8")
    plan.chmod(0o755)


# --------------------------------------------------------------------------


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Group a camera roll into sessions and near-duplicate sets.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("--source", type=Path, action="append", metavar="DIR",
                        help="folder of photos, searched recursively; repeatable")
    parser.add_argument("--photos-library", type=Path, action="append", nargs="?",
                        const=Path("auto"), metavar="PATH",
                        help="read an Apple Photos library directly, no export needed; "
                             "repeatable, and omit PATH to use every library found in "
                             "~/Pictures. Can be combined with --source.")
    parser.add_argument("--out", type=Path, default=Path("photo-grouping-report"),
                        help="where to write the report (default: ./photo-grouping-report)")
    parser.add_argument("--dest", type=Path, default=None,
                        help="target tree for apply_plan.sh (default: <out>/organised)")
    parser.add_argument("--gap-hours", type=float, default=3.0,
                        help="gap that starts a new session (default: 3)")
    parser.add_argument("--jump-km", type=float, default=25.0,
                        help="location jump that starts a new session, 0 to disable (default: 25)")
    parser.add_argument("--threshold", type=int, default=5, metavar="BITS",
                        help="hash distance counted as near-duplicate, 0-16 (default: 5)")
    parser.add_argument("--workers", type=int, default=8, help="parallel decode workers")
    parser.add_argument("--max-groups", type=int, default=300,
                        help="near-duplicate sets to draw in the HTML (default: 300)")
    parser.add_argument("--include-videos", action="store_true",
                        help="place standalone videos into sessions too")
    parser.add_argument("--no-thumbs", action="store_true", help="skip thumbnails (faster)")
    args = parser.parse_args(argv)

    if not args.source and not args.photos_library:
        parser.error("give at least one --source folder or --photos-library")
    for folder in args.source or []:
        if not folder.is_dir():
            parser.error(f"--source is not a directory: {folder}")
    if not 0 <= args.threshold <= 16:
        parser.error("--threshold must be between 0 and 16")
    if not imageio.have_any_backend():
        parser.error(
            "no image decoder available. On macOS this should not happen (sips is "
            "built in); elsewhere install Pillow:  pip3 install Pillow pillow-heif"
        )

    args.out.mkdir(parents=True, exist_ok=True)
    dest = args.dest or (args.out / "organised")

    print(f"Backends: {imageio.backend_report()}", file=sys.stderr)
    print("Scanning...", file=sys.stderr)
    photos: list[Photo] = []
    folded: list[Path] = []
    lib_stats: dict | None = None
    sources: list[tuple[str, int]] = []
    report_roots: list[Path] = []
    cross_library_dupes = 0

    if args.photos_library:
        import photos_library
        explicit = [p for p in args.photos_library if str(p) != "auto"]
        autodetect = any(str(p) == "auto" for p in args.photos_library)
        try:
            libraries = photos_library.find_libraries(explicit if explicit else None) \
                if (explicit or autodetect) else []
            if explicit and autodetect:
                libraries += [l for l in photos_library.find_libraries(None)
                              if l not in libraries]
        except photos_library.LibraryError as exc:
            print(f"error: {exc}", file=sys.stderr)
            return 1

        merged_stats: dict = {}
        for library in libraries:
            print(f"  library: {library}", file=sys.stderr)
            try:
                found, stats = scan_photos_library(library, args.include_videos)
            except photos_library.LibraryError as exc:
                print(f"    skipped: {exc}", file=sys.stderr)
                continue
            print(f"    {photos_library.describe(stats)}", file=sys.stderr)
            photos.extend(found)
            sources.append((library.name, len(found)))
            for key, value in stats.items():
                merged_stats[key] = merged_stats.get(key, 0) + value
        lib_stats = merged_stats or None
        report_roots.extend(libraries)

    for folder in args.source or []:
        if not folder.is_dir():          # a library stand-in from the branch above
            continue
        found, folded_here = scan(folder, args.include_videos)
        for photo in found:
            photo.origin = folder.name
        print(f"  folder: {folder} -> {len(found)} items", file=sys.stderr)
        photos.extend(found)
        folded.extend(folded_here)
        sources.append((folder.name, len(found)))
        report_roots.append(folder)

    # Paths in the report are shown relative to the single root when there is
    # one; with several inputs an absolute path is the only unambiguous form.
    args.report_root = report_roots[0] if len(report_roots) == 1 else None

    if len(sources) > 1:
        photos, cross_library_dupes = dedupe_across_libraries(photos)
        if cross_library_dupes:
            print(f"  {cross_library_dupes} asset(s) present in more than one library "
                  f"collapsed to one copy", file=sys.stderr)

    if not photos:
        print("No photos or videos found in any given source", file=sys.stderr)
        return 1
    print(f"  {len(photos)} items ({len(folded)} Live Photo clips folded in)", file=sys.stderr)

    print("Hashing...", file=sys.stderr)
    compute_hashes(photos, args.workers)

    print("Clustering...", file=sys.stderr)
    n_similar = cluster_similar(photos, args.threshold)
    n_exact = cluster_exact(photos)
    n_sessions = cluster_sessions(photos, args.gap_hours, args.jump_km)

    sessions: dict[int, list[Photo]] = defaultdict(list)
    similar: dict[int, list[Photo]] = defaultdict(list)
    exact: dict[int, list[Photo]] = defaultdict(list)
    for photo in photos:
        sessions[photo.session].append(photo)
        if photo.similar_group >= 0:
            similar[photo.similar_group].append(photo)
        if photo.exact_group >= 0:
            exact[photo.exact_group].append(photo)

    # A set of byte-identical files is also perceptually identical, so it would
    # otherwise be reported twice. Keep it in the identical section only.
    exact_paths = {p.path for group in exact.values() for p in group}
    for gid in list(similar):
        if all(p.path in exact_paths for p in similar[gid]):
            del similar[gid]

    print(f"  {n_sessions} sessions, {len(similar)} near-duplicate sets, "
          f"{n_exact} identical sets", file=sys.stderr)

    if not args.no_thumbs:
        print("Thumbnails...", file=sys.stderr)
        build_thumbs(photos, sessions, args.out, args.workers)

    args.sources = sources
    args.cross_library_dupes = cross_library_dupes
    write_report(args.out, photos, sessions, similar, exact, args, folded, lib_stats)
    write_json(args.out, photos, sessions, similar, exact)
    write_plan(args.out, sessions, similar, exact, dest)

    print(f"\nReport:  {args.out / 'report.html'}", file=sys.stderr)
    print(f"Data:    {args.out / 'groups.json'}", file=sys.stderr)
    print(f"Plan:    {args.out / 'apply_plan.sh'}  (copies only; run it yourself)", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
