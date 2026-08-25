#!/usr/bin/env python3
"""Read an Apple Photos library without exporting anything from it.

Exporting a large library is slow and, when iCloud holds the originals, often
does not finish at all. But the library on disk already carries everything the
grouper needs: ``Photos.sqlite`` holds the true capture time and location for
every asset, and the derivative JPEGs are perfectly adequate for perceptual
hashing even when the full-size original lives only in iCloud.

So this module pairs the two: authoritative metadata from the database, pixels
from whichever local file is best -- the original when it is on disk, otherwise
the largest derivative.

**The library is never modified.** The database is copied to a temporary file
before it is opened, and opened read-only even then; nothing else in the bundle
is touched.

Schema note: Photos' table and column layout shifts between macOS releases, so
every optional column is probed with ``PRAGMA table_info`` before it is used
rather than assumed.
"""

from __future__ import annotations

import shutil
import sqlite3
import sys
import tempfile
from contextlib import contextmanager
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path

# Core Data counts seconds from 2001-01-01 UTC, not the Unix epoch.
APPLE_EPOCH = datetime(2001, 1, 1, tzinfo=timezone.utc)

# Photos stores this sentinel rather than NULL when an asset has no GPS fix.
NO_LOCATION = -180.0

# Where pixels may live inside the bundle. "Masters" is the pre-2019 name for
# "originals"; both are checked so older libraries still work.
ORIGINAL_DIRS = ("originals", "Masters")
DERIVATIVE_DIRS = ("resources/derivatives", "resources/renders", "resources/proxies")

# A Live Photo keeps its motion clip beside the still, under the same asset id
# and usually larger than the JPEG derivative. Picking the biggest file would
# therefore hand the grouper a movie instead of a picture -- it cannot be hashed,
# so the photo drops out of duplicate detection entirely. Only still-image
# suffixes are ever considered as a source of pixels.
NON_IMAGE_SUFFIXES = {".mov", ".mp4", ".m4v", ".avi", ".3gp", ".aae", ".plist",
                      ".json", ".txt", ".xmp"}


class LibraryError(RuntimeError):
    pass


@dataclass
class Asset:
    uuid: str
    path: Path                 # the local file to actually read pixels from
    original_name: str         # e.g. IMG_1234.HEIC -- for display and filing
    taken: datetime            # local wall-clock time of capture
    lat: float | None
    lon: float | None
    is_video: bool
    from_original: bool        # False when only a derivative was available
    library: Path | None = None   # which library this came from
    size: int = 0                 # bytes of the local file actually chosen
    placeholder_name: bool = False  # the stored name is a UUID, not a real filename


def _columns(conn: sqlite3.Connection, table: str) -> set[str]:
    try:
        return {row[1] for row in conn.execute(f"PRAGMA table_info({table})")}
    except sqlite3.DatabaseError:
        return set()


@contextmanager
def _open_readonly(db: Path):
    """Copy the database aside, then open the copy read-only.

    Photos keeps a write-ahead log, so the -wal and -shm sidecars have to travel
    with the main file or recent changes are invisible. Copying also sidesteps
    the lock Photos.app holds while it is running, and guarantees this code
    cannot write to the real library even by accident.
    """
    with tempfile.TemporaryDirectory(prefix="photoslib-") as tmp:
        work = Path(tmp) / "Photos.sqlite"
        shutil.copy2(db, work)
        for suffix in ("-wal", "-shm"):
            sidecar = db.with_name(db.name + suffix)
            if sidecar.exists():
                shutil.copy2(sidecar, work.with_name(work.name + suffix))
        conn = sqlite3.connect(f"file:{work}?mode=ro", uri=True)
        try:
            yield conn
        finally:
            conn.close()


def _index_files(root: Path, subdirs: tuple[str, ...]) -> dict[str, list[Path]]:
    """Map each asset UUID to the files that belong to it.

    Walking the trees once and indexing beats globbing per asset, which would be
    thousands of directory scans on a real library.
    """
    index: dict[str, list[Path]] = {}
    for sub in subdirs:
        base = root / sub
        if not base.is_dir():
            continue
        for path in base.rglob("*"):
            if not path.is_file() or path.name.startswith("."):
                continue
            if path.suffix.lower() in NON_IMAGE_SUFFIXES:
                continue
            # Filenames are "<UUID>.ext" or "<UUID>_1_105_c.jpeg"; the UUID is
            # the leading 36 characters in both shapes.
            key = path.stem[:36].upper()
            if len(key) == 36 and key.count("-") == 4:
                index.setdefault(key, []).append(path)
    return index


_UUID_LEN = 36


def is_placeholder_name(name: str) -> bool:
    """True when a stored filename is really just a UUID.

    Photos carries a UUID-shaped ZORIGINALFILENAME for assets migrated out of an
    older library -- the name is the previous library's identifier, not anything
    a person chose. It is a truthful value but a useless label, so callers can
    substitute something readable.
    """
    stem = Path(name).stem
    return (len(stem) == _UUID_LEN and stem.count("-") == 4
            and all(c in "0123456789abcdefABCDEF-" for c in stem))


def _best_file(uuid: str, originals: dict[str, list[Path]],
               derivatives: dict[str, list[Path]]) -> tuple[Path | None, bool]:
    """Prefer a local original; fall back to the largest derivative."""
    for candidate in originals.get(uuid, []):
        if candidate.stat().st_size > 0:
            return candidate, True
    pool = derivatives.get(uuid, [])
    if pool:
        return max(pool, key=lambda p: p.stat().st_size), False
    return None, False


def find_libraries(explicit: list[Path] | None = None) -> list[Path]:
    """Resolve one or more Photos libraries.

    With no paths given, every usable library in ~/Pictures is returned rather
    than just one. A machine that has accumulated a second or archived library
    holds photos the main one does not, and the point of scanning several is to
    cover them; the caller prints what was chosen so the selection is visible.
    """
    if explicit:
        out: list[Path] = []
        for raw in explicit:
            lib = raw.expanduser()
            if not (lib / "database" / "Photos.sqlite").is_file():
                raise LibraryError(f"not a Photos library (no database/Photos.sqlite): {lib}")
            out.append(lib)
        return out

    found = [c for c in sorted(Path.home().glob("Pictures/*.photoslibrary"))
             if (c / "database" / "Photos.sqlite").is_file()]
    if not found:
        raise LibraryError(
            "no Photos library found in ~/Pictures. Pass --photos-library with the "
            "path to the .photoslibrary bundle."
        )
    return found


def find_library(explicit: Path | None = None) -> Path:
    """Locate the .photoslibrary bundle, or raise with a useful message."""
    if explicit:
        lib = explicit.expanduser()
        if lib.is_dir() and (lib / "database" / "Photos.sqlite").is_file():
            return lib
        raise LibraryError(f"not a Photos library (no database/Photos.sqlite): {lib}")

    candidates = sorted(Path.home().glob("Pictures/*.photoslibrary"))
    usable = [c for c in candidates if (c / "database" / "Photos.sqlite").is_file()]
    if len(usable) == 1:
        return usable[0]
    if not usable:
        raise LibraryError(
            "no Photos library found in ~/Pictures. Pass --photos-library with the "
            "path to the .photoslibrary bundle."
        )
    raise LibraryError(
        "several Photos libraries found; pass --photos-library to choose:\n  "
        + "\n  ".join(str(c) for c in usable)
    )


def read_assets(library: Path, include_videos: bool = False) -> tuple[list[Asset], dict]:
    """Return every asset with a readable local file, plus a stats summary."""
    db = library / "database" / "Photos.sqlite"
    if not db.is_file():
        raise LibraryError(f"no database at {db}")

    originals = _index_files(library, ORIGINAL_DIRS)
    derivatives = _index_files(library, DERIVATIVE_DIRS)
    if not originals and not derivatives:
        raise LibraryError(
            f"no image files found under {library}. If this is an iCloud-only "
            "library with nothing downloaded, there is nothing to read."
        )

    assets: list[Asset] = []
    stats = {"rows": 0, "no_local_file": 0, "trashed": 0, "videos_skipped": 0,
             "from_original": 0, "from_derivative": 0}

    with _open_readonly(db) as conn:
        cols = _columns(conn, "ZASSET")
        if not cols:
            raise LibraryError(
                "ZASSET table not found. This library is too old, or the file is "
                "not a Photos database."
            )

        # Every column below is optional across macOS versions, so build the
        # SELECT from what this particular database actually has.
        def pick(*names: str) -> str | None:
            return next((n for n in names if n in cols), None)

        c_uuid = pick("ZUUID")
        c_date = pick("ZDATECREATED")
        c_lat = pick("ZLATITUDE")
        c_lon = pick("ZLONGITUDE")
        c_trash = pick("ZTRASHEDSTATE")
        c_kind = pick("ZKIND")
        c_name = pick("ZFILENAME")
        if not c_uuid or not c_date:
            raise LibraryError("ZASSET lacks ZUUID/ZDATECREATED; unsupported schema")

        # The timezone offset and true original filename live in a side table.
        aux = _columns(conn, "ZADDITIONALASSETATTRIBUTES")
        c_tz = "ZTIMEZONEOFFSET" if "ZTIMEZONEOFFSET" in aux else None
        c_orig = "ZORIGINALFILENAME" if "ZORIGINALFILENAME" in aux else None
        aux_fk = next((n for n in ("ZASSET", "ZASSETFORFILEATTRIBUTES") if n in aux), None)

        select = [f"a.{c_uuid}", f"a.{c_date}"]
        select.append(f"a.{c_lat}" if c_lat else "NULL")
        select.append(f"a.{c_lon}" if c_lon else "NULL")
        select.append(f"a.{c_trash}" if c_trash else "0")
        select.append(f"a.{c_kind}" if c_kind else "0")
        select.append(f"a.{c_name}" if c_name else "NULL")
        if aux_fk and c_tz:
            select.append(f"b.{c_tz}")
        else:
            select.append("NULL")
        select.append(f"b.{c_orig}" if (aux_fk and c_orig) else "NULL")

        join = (f"LEFT JOIN ZADDITIONALASSETATTRIBUTES b ON b.{aux_fk} = a.Z_PK"
                if aux_fk else "")
        sql = f"SELECT {', '.join(select)} FROM ZASSET a {join}"

        for row in conn.execute(sql):
            stats["rows"] += 1
            uuid, raw_date, lat, lon, trashed, kind, filename, tz_offset, orig_name = row

            if trashed:
                stats["trashed"] += 1
                continue
            is_video = bool(kind)
            if is_video and not include_videos:
                stats["videos_skipped"] += 1
                continue

            path, from_original = _best_file(str(uuid).upper(), originals, derivatives)
            if path is None:
                stats["no_local_file"] += 1
                continue

            # Core Data stores UTC. Adding the recorded offset gives the local
            # wall-clock time the shutter fired, which is what a session should
            # be grouped by -- using UTC directly pushes evening shots into the
            # next day.
            when = APPLE_EPOCH + timedelta(seconds=float(raw_date or 0))
            if tz_offset is not None:
                when = when + timedelta(seconds=float(tz_offset))
            when = when.replace(tzinfo=None)

            if lat is None or lat == NO_LOCATION or lon is None or lon == NO_LOCATION:
                lat = lon = None

            display = orig_name or filename or f"{uuid}{path.suffix}"
            placeholder = is_placeholder_name(str(display))
            try:
                size = path.stat().st_size
            except OSError:
                size = 0
            assets.append(Asset(
                uuid=str(uuid), path=path, original_name=str(display), taken=when,
                lat=lat, lon=lon, is_video=is_video, from_original=from_original,
                library=library, size=size, placeholder_name=placeholder,
            ))
            stats["from_original" if from_original else "from_derivative"] += 1

    assets.sort(key=lambda a: a.taken)
    return assets, stats


def describe(stats: dict) -> str:
    return (
        f"{stats['rows']} rows; {stats['from_original']} originals, "
        f"{stats['from_derivative']} derivatives, "
        f"{stats['no_local_file']} with no local file, "
        f"{stats['trashed']} trashed"
    )


def dump_schema(library: Path) -> None:
    """Print what this library's database actually contains.

    Used when the adapter produces something wrong -- UUID filenames, or dates
    that look like UTC -- to find where a real schema differs from the one the
    tests were built against. Prints structure, counts and a few filenames; no
    location data.
    """
    db = library / "database" / "Photos.sqlite"
    with _open_readonly(db) as conn:
        tables = [r[0] for r in conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'Z%' "
            "ORDER BY name")]
        print(f"tables ({len(tables)}):")
        for t in tables:
            if "ASSET" in t.upper() or "ATTRIB" in t.upper():
                print(f"    {t}")

        for table in ("ZASSET", "ZADDITIONALASSETATTRIBUTES"):
            cols = sorted(_columns(conn, table))
            print(f"\n{table}: {len(cols)} columns")
            if not cols:
                print("    (table absent)")
                continue
            interesting = [c for c in cols if any(k in c for k in (
                "FILENAME", "NAME", "DATE", "TIMEZONE", "ZONE", "ASSET", "UUID",
                "TRASH", "KIND", "DIRECTORY", "LAT", "LONG"))]
            for c in interesting:
                print(f"    {c}")

            # How many rows actually carry a value in each name/time column?
            (total,) = conn.execute(f"SELECT COUNT(*) FROM {table}").fetchone()
            print(f"    -- {total} rows")
            for c in cols:
                if not any(k in c for k in ("FILENAME", "TIMEZONE")):
                    continue
                (n,) = conn.execute(
                    f"SELECT COUNT(*) FROM {table} WHERE {c} IS NOT NULL AND {c} != ''"
                ).fetchone()
                samples = [str(r[0])[:48] for r in conn.execute(
                    f"SELECT {c} FROM {table} WHERE {c} IS NOT NULL AND {c} != '' LIMIT 3")]
                print(f"    {c}: {n}/{total} populated  e.g. {samples}")

        # Does the join this module relies on actually connect the two tables?
        aux = _columns(conn, "ZADDITIONALASSETATTRIBUTES")
        if aux:
            print("\njoin check (ZADDITIONALASSETATTRIBUTES -> ZASSET.Z_PK):")
            for fk in sorted(c for c in aux if "ASSET" in c):
                try:
                    (n,) = conn.execute(
                        f"SELECT COUNT(*) FROM ZASSET a JOIN ZADDITIONALASSETATTRIBUTES b "
                        f"ON b.{fk} = a.Z_PK").fetchone()
                except sqlite3.DatabaseError as exc:
                    print(f"    b.{fk}: query failed ({exc})")
                    continue
                print(f"    b.{fk} = a.Z_PK  ->  {n} matched rows")


def probe_rows(library: Path, limit: int = 10) -> None:
    """Print the raw values read_assets() sees, for the earliest assets.

    Counts alone cannot explain a wrong filename -- a column can be populated
    across the table yet still arrive NULL for the specific rows in question.
    This runs the same query and shows what each field actually contains, so the
    fallback that fired is visible rather than inferred.
    """
    db = library / "database" / "Photos.sqlite"
    originals = _index_files(library, ORIGINAL_DIRS)
    derivatives = _index_files(library, DERIVATIVE_DIRS)
    print(f"indexed: {len(originals)} original UUIDs, {len(derivatives)} derivative UUIDs")

    with _open_readonly(db) as conn:
        cols = _columns(conn, "ZASSET")
        aux = _columns(conn, "ZADDITIONALASSETATTRIBUTES")
        has = lambda t, c: c in (aux if t == "b" else cols)  # noqa: E731
        sql = (
            "SELECT a.ZUUID, a.ZDATECREATED, a.ZFILENAME, "
            + ("b.ZORIGINALFILENAME, " if has("b", "ZORIGINALFILENAME") else "NULL, ")
            + ("b.ZTIMEZONEOFFSET, " if has("b", "ZTIMEZONEOFFSET") else "NULL, ")
            + ("b.ZINFERREDTIMEZONEOFFSET " if has("b", "ZINFERREDTIMEZONEOFFSET") else "NULL ")
            + "FROM ZASSET a LEFT JOIN ZADDITIONALASSETATTRIBUTES b ON b.ZASSET = a.Z_PK "
            + ("WHERE a.ZTRASHEDSTATE = 0 " if has("a", "ZTRASHEDSTATE") else "")
            + f"ORDER BY a.ZDATECREATED LIMIT {int(limit)}"
        )
        print(f"\nsql: {sql}\n")
        for uuid, raw_date, filename, orig, tz, inferred_tz in conn.execute(sql):
            key = str(uuid).upper()
            where = "orig" if key in originals else ("deriv" if key in derivatives else "NONE")
            found = (originals.get(key) or derivatives.get(key) or [None])[0]
            utc = APPLE_EPOCH + timedelta(seconds=float(raw_date or 0))
            print(f"  ZUUID              = {uuid}")
            print(f"  ZFILENAME          = {filename!r}")
            print(f"  ZORIGINALFILENAME  = {orig!r}")
            print(f"  ZTIMEZONEOFFSET    = {tz!r}   (inferred: {inferred_tz!r})")
            print(f"  ZDATECREATED       = {raw_date!r} -> {utc:%Y-%m-%d %H:%M} UTC")
            print(f"  local file         = [{where}] {found.name if found else '-'}")
            print()


if __name__ == "__main__":
    # Quick standalone probe, useful for checking a real library.
    flags = {"--schema", "--probe"}
    argv = [a for a in sys.argv[1:] if a not in flags]
    want_schema = "--schema" in sys.argv
    want_probe = "--probe" in sys.argv
    try:
        lib = find_library(Path(argv[0]) if argv else None)
        if want_schema or want_probe:
            print(f"library: {lib}")
            if want_schema:
                dump_schema(lib)
            if want_probe:
                probe_rows(lib)
            raise SystemExit(0)
        found, stats = read_assets(lib)
        print(f"library: {lib}")
        print(describe(stats))
        for asset in found[:10]:
            src = "orig" if asset.from_original else "deriv"
            print(f"  {asset.taken:%Y-%m-%d %H:%M}  {asset.original_name:24s} [{src}]")
    except LibraryError as exc:
        raise SystemExit(f"error: {exc}")
