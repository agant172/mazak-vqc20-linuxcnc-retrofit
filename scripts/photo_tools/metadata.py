#!/usr/bin/env python3
"""Pull the capture time and GPS fix off a camera-roll file.

Capture time is what separates one shooting session from the next, so it is
worth some effort to get the real one rather than the filesystem mtime -- a
copied or synced camera roll usually has mtimes from the day of the copy, which
would collapse every session into one.

Sources, best first:

1. EXIF ``DateTimeOriginal`` parsed straight out of the JPEG (stdlib only).
2. ``mdls`` / ``sips`` on macOS, which read HEIC metadata natively.
3. The filename, for the ``IMG_20240115_103000`` style some exports use.
4. Filesystem mtime, flagged low-confidence so the report can say so.

EXIF ``DateTimeOriginal`` is written in *local* wall-clock time by iOS, so it
needs no timezone conversion. Note this differs from what
``docs/README_photo_sorting.md`` records for the Mazak batch, where the dates
landed in UTC and evening sessions crossed midnight into the wrong day; that is
a property of how that specific set was exported, not of EXIF in general.
"""

from __future__ import annotations

import re
import struct
import subprocess
import shutil
from datetime import datetime, timezone
from pathlib import Path
from typing import NamedTuple

MDLS = shutil.which("mdls")
SIPS = shutil.which("sips")

_JPEG_SUFFIXES = {".jpg", ".jpeg", ".jpe"}

# EXIF tag numbers we care about.
_TAG_EXIF_IFD = 0x8769
_TAG_GPS_IFD = 0x8825
_TAG_DATETIME_ORIGINAL = 0x9003
_TAG_DATETIME_DIGITIZED = 0x9004
_TAG_DATETIME = 0x0132
_GPS_LAT_REF, _GPS_LAT = 0x0001, 0x0002
_GPS_LON_REF, _GPS_LON = 0x0003, 0x0004

# Bytes per EXIF field type, indexed by type code.
_TYPE_SIZE = {1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8}

_FILENAME_DATE = re.compile(r"(20\d{2})[-_]?(\d{2})[-_]?(\d{2})[-_ T]?(\d{2})?(\d{2})?(\d{2})?")


class Meta(NamedTuple):
    taken: datetime
    source: str          # which of the four sources supplied `taken`
    lat: float | None
    lon: float | None

    @property
    def reliable(self) -> bool:
        """False when the time is only an mtime, i.e. probably the copy date."""
        return self.source != "mtime"


# --------------------------------------------------------------------------
# EXIF out of a JPEG, using nothing but struct
# --------------------------------------------------------------------------


def _read_ifd(buf: bytes, offset: int, endian: str) -> dict[int, tuple[int, int, int]]:
    """Return {tag: (type, count, value_or_offset)} for one IFD."""
    if offset + 2 > len(buf):
        return {}
    (count,) = struct.unpack(endian + "H", buf[offset : offset + 2])
    entries: dict[int, tuple[int, int, int]] = {}
    for i in range(count):
        pos = offset + 2 + i * 12
        if pos + 12 > len(buf):
            break
        tag, ftype, fcount = struct.unpack(endian + "HHI", buf[pos : pos + 8])
        raw = buf[pos + 8 : pos + 12]
        size = _TYPE_SIZE.get(ftype, 0) * fcount
        if size <= 4:
            # Value is inline in the 4-byte slot; record where it lives.
            entries[tag] = (ftype, fcount, pos + 8)
        else:
            (ptr,) = struct.unpack(endian + "I", raw)
            entries[tag] = (ftype, fcount, ptr)
    return entries


def _ascii(buf: bytes, entry: tuple[int, int, int]) -> str:
    _ftype, count, off = entry
    return buf[off : off + count].split(b"\x00")[0].decode("ascii", "replace")


def _rationals(buf: bytes, entry: tuple[int, int, int], endian: str) -> list[float]:
    _ftype, count, off = entry
    out = []
    for i in range(count):
        pos = off + i * 8
        if pos + 8 > len(buf):
            break
        num, den = struct.unpack(endian + "II", buf[pos : pos + 8])
        out.append(num / den if den else 0.0)
    return out


def _parse_exif(tiff: bytes) -> tuple[datetime | None, float | None, float | None]:
    if tiff[:2] == b"II":
        endian = "<"
    elif tiff[:2] == b"MM":
        endian = ">"
    else:
        return None, None, None

    (ifd0_off,) = struct.unpack(endian + "I", tiff[4:8])
    ifd0 = _read_ifd(tiff, ifd0_off, endian)

    taken = None
    exif_entries: dict[int, tuple[int, int, int]] = {}
    if _TAG_EXIF_IFD in ifd0:
        (ptr,) = struct.unpack(endian + "I", tiff[ifd0[_TAG_EXIF_IFD][2] : ifd0[_TAG_EXIF_IFD][2] + 4])
        exif_entries = _read_ifd(tiff, ptr, endian)

    for tag, table in (
        (_TAG_DATETIME_ORIGINAL, exif_entries),
        (_TAG_DATETIME_DIGITIZED, exif_entries),
        (_TAG_DATETIME, ifd0),
    ):
        if tag in table:
            text = _ascii(tiff, table[tag])
            try:
                taken = datetime.strptime(text.strip(), "%Y:%m:%d %H:%M:%S")
                break
            except ValueError:
                continue

    lat = lon = None
    if _TAG_GPS_IFD in ifd0:
        (ptr,) = struct.unpack(endian + "I", tiff[ifd0[_TAG_GPS_IFD][2] : ifd0[_TAG_GPS_IFD][2] + 4])
        gps = _read_ifd(tiff, ptr, endian)
        if _GPS_LAT in gps and _GPS_LON in gps:
            dms_lat = _rationals(tiff, gps[_GPS_LAT], endian)
            dms_lon = _rationals(tiff, gps[_GPS_LON], endian)
            if len(dms_lat) == 3 and len(dms_lon) == 3:
                lat = dms_lat[0] + dms_lat[1] / 60 + dms_lat[2] / 3600
                lon = dms_lon[0] + dms_lon[1] / 60 + dms_lon[2] / 3600
                if _GPS_LAT_REF in gps and _ascii(tiff, gps[_GPS_LAT_REF]).upper().startswith("S"):
                    lat = -lat
                if _GPS_LON_REF in gps and _ascii(tiff, gps[_GPS_LON_REF]).upper().startswith("W"):
                    lon = -lon

    return taken, lat, lon


def _jpeg_exif(path: Path) -> tuple[datetime | None, float | None, float | None]:
    with path.open("rb") as fh:
        if fh.read(2) != b"\xff\xd8":
            return None, None, None
        # Walk JPEG segment markers looking for APP1/Exif.
        while True:
            head = fh.read(2)
            if len(head) < 2 or head[0] != 0xFF:
                return None, None, None
            marker = head[1]
            if marker in (0xD8, 0xD9) or 0xD0 <= marker <= 0xD7:
                continue
            if marker == 0xDA:  # start of scan; no metadata past here
                return None, None, None
            length_bytes = fh.read(2)
            if len(length_bytes) < 2:
                return None, None, None
            (length,) = struct.unpack(">H", length_bytes)
            body = fh.read(length - 2)
            if marker == 0xE1 and body[:6] == b"Exif\x00\x00":
                return _parse_exif(body[6:])


# --------------------------------------------------------------------------
# macOS metadata services, which handle HEIC
# --------------------------------------------------------------------------

_MDLS_DATE = re.compile(r"kMDItemContentCreationDate\s*=\s*(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})")
_MDLS_LAT = re.compile(r"kMDItemLatitude\s*=\s*(-?[\d.]+)")
_MDLS_LON = re.compile(r"kMDItemLongitude\s*=\s*(-?[\d.]+)")


def _mac_metadata(path: Path) -> tuple[datetime | None, float | None, float | None]:
    if not MDLS:
        return None, None, None
    try:
        proc = subprocess.run(
            [MDLS, "-name", "kMDItemContentCreationDate", "-name", "kMDItemLatitude",
             "-name", "kMDItemLongitude", str(path)],
            capture_output=True, text=True, timeout=30,
        )
    except (subprocess.SubprocessError, OSError):
        return None, None, None
    text = proc.stdout
    taken = None
    if m := _MDLS_DATE.search(text):
        try:
            # mdls prints UTC; convert to the local zone so sessions line up
            # with the wall-clock day the photos were actually taken.
            utc = datetime.strptime(m.group(1), "%Y-%m-%d %H:%M:%S").replace(tzinfo=timezone.utc)
            taken = utc.astimezone().replace(tzinfo=None)
        except ValueError:
            taken = None
    lat = float(m.group(1)) if (m := _MDLS_LAT.search(text)) else None
    lon = float(m.group(1)) if (m := _MDLS_LON.search(text)) else None
    return taken, lat, lon


def _filename_date(path: Path) -> datetime | None:
    m = _FILENAME_DATE.search(path.stem)
    if not m:
        return None
    y, mo, d, hh, mm, ss = m.groups()
    try:
        return datetime(int(y), int(mo), int(d), int(hh or 0), int(mm or 0), int(ss or 0))
    except ValueError:
        return None


def read(path: Path) -> Meta:
    """Best-effort capture time and location for one file."""
    taken = lat = lon = None

    if path.suffix.lower() in _JPEG_SUFFIXES:
        try:
            taken, lat, lon = _jpeg_exif(path)
        except (OSError, struct.error, ValueError):
            taken = lat = lon = None
        if taken:
            return Meta(taken, "exif", lat, lon)

    m_taken, m_lat, m_lon = _mac_metadata(path)
    if m_taken:
        return Meta(m_taken, "mdls", m_lat if m_lat is not None else lat,
                    m_lon if m_lon is not None else lon)

    if fn := _filename_date(path):
        return Meta(fn, "filename", lat, lon)

    return Meta(datetime.fromtimestamp(path.stat().st_mtime), "mtime", lat, lon)
