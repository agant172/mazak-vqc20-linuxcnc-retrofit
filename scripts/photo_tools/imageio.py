#!/usr/bin/env python3
"""Decode any camera-roll image down to a small grayscale thumbnail.

An iPhone camera roll is mostly HEIC, which plain Pillow cannot decode, so this
module tries three backends in order and uses whichever is present:

1. Pillow, plus ``pillow_heif`` if it is installed (fastest, handles everything).
2. ``sips`` -- the macOS system image tool, which has native HEIC support and is
   installed on every Mac. Its PNG output is decoded by the pure-Python reader
   below, so this path needs no third-party package at all.
3. Pillow alone, for JPEG/PNG on a non-Mac.

The point of tier 2 is that the tool runs on a stock Mac with zero ``pip
install``. Nothing here writes to the source files; every path is read-only.
"""

from __future__ import annotations

import shutil
import struct
import subprocess
import tempfile
import zlib
from pathlib import Path

try:  # optional, and optional again for HEIC specifically
    from PIL import Image

    try:
        import pillow_heif

        pillow_heif.register_heif_opener()
        _PILLOW_HEIC = True
    except ImportError:
        _PILLOW_HEIC = False
except ImportError:  # pragma: no cover - exercised on stock macOS
    Image = None
    _PILLOW_HEIC = False

SIPS = shutil.which("sips")

# Extensions sips can read but Pillow (without pillow_heif) cannot.
_HEIF_SUFFIXES = {".heic", ".heif", ".hif", ".avci"}


class DecodeError(RuntimeError):
    """Raised when no available backend could read an image."""


def backend_report() -> str:
    """One line naming which decode backends are live, for the run header."""
    parts = []
    if Image is not None:
        parts.append("Pillow+HEIC" if _PILLOW_HEIC else "Pillow (no HEIC)")
    if SIPS:
        parts.append("sips")
    return ", ".join(parts) if parts else "NONE"


def have_any_backend() -> bool:
    return Image is not None or SIPS is not None


# --------------------------------------------------------------------------
# Pure-Python PNG reader
# --------------------------------------------------------------------------
# Only needs to handle what `sips -s format png` emits: 8-bit non-interlaced
# grayscale/RGB/RGBA/palette. That is a small enough subset to do with zlib
# alone, which is what keeps the macOS path dependency-free.

_CHANNELS = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}


def _paeth(a: int, b: int, c: int) -> int:
    p = a + b - c
    pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
    if pa <= pb and pa <= pc:
        return a
    return b if pb <= pc else c


def decode_png_gray(data: bytes) -> tuple[int, int, list[int]]:
    """Decode PNG bytes to (width, height, row-major grayscale samples)."""
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise DecodeError("not a PNG stream")

    pos = 8
    width = height = depth = color = 0
    idat = bytearray()
    palette = b""
    while pos < len(data):
        (length,) = struct.unpack(">I", data[pos : pos + 4])
        ctype = data[pos + 4 : pos + 8]
        body = data[pos + 8 : pos + 8 + length]
        pos += 12 + length  # length + type + body + CRC

        if ctype == b"IHDR":
            width, height, depth, color = struct.unpack(">IIBB", body[:10])
            if body[12] != 0:
                raise DecodeError("interlaced PNG not supported")
        elif ctype == b"PLTE":
            palette = body
        elif ctype == b"IDAT":
            idat += body
        elif ctype == b"IEND":
            break

    if depth != 8:
        raise DecodeError(f"unsupported PNG bit depth {depth}")
    if color not in _CHANNELS:
        raise DecodeError(f"unsupported PNG color type {color}")

    nch = _CHANNELS[color]
    raw = zlib.decompress(bytes(idat))
    stride = width * nch

    # Undo the per-scanline filter. Each row is prefixed with its filter byte
    # and may reference the row above, so this has to run start to finish.
    out = bytearray(height * stride)
    prev = bytearray(stride)
    src = 0
    for y in range(height):
        ftype = raw[src]
        src += 1
        line = bytearray(raw[src : src + stride])
        src += stride
        if ftype == 1:
            for i in range(nch, stride):
                line[i] = (line[i] + line[i - nch]) & 0xFF
        elif ftype == 2:
            for i in range(stride):
                line[i] = (line[i] + prev[i]) & 0xFF
        elif ftype == 3:
            for i in range(stride):
                left = line[i - nch] if i >= nch else 0
                line[i] = (line[i] + ((left + prev[i]) >> 1)) & 0xFF
        elif ftype == 4:
            for i in range(stride):
                left = line[i - nch] if i >= nch else 0
                upleft = prev[i - nch] if i >= nch else 0
                line[i] = (line[i] + _paeth(left, prev[i], upleft)) & 0xFF
        elif ftype != 0:
            raise DecodeError(f"bad PNG filter type {ftype}")
        out[y * stride : (y + 1) * stride] = line
        prev = line

    # Flatten to luminance.
    gray: list[int] = []
    if color == 3:  # palette
        if not palette:
            raise DecodeError("palette image with no PLTE chunk")
        for idx in out:
            r, g, b = palette[idx * 3 : idx * 3 + 3]
            gray.append((r * 299 + g * 587 + b * 114) // 1000)
    elif nch == 1:
        gray = list(out)
    elif nch == 2:  # gray + alpha
        gray = list(out[0::2])
    else:  # RGB or RGBA
        for i in range(0, len(out), nch):
            r, g, b = out[i], out[i + 1], out[i + 2]
            gray.append((r * 299 + g * 587 + b * 114) // 1000)

    return width, height, gray


# --------------------------------------------------------------------------
# Backends
# --------------------------------------------------------------------------


def _pillow_gray(path: Path, width: int, height: int) -> list[int]:
    with Image.open(path) as im:
        im.draft("L", (width * 8, height * 8))  # cheap JPEG downscale-on-load
        return list(im.convert("L").resize((width, height), Image.BILINEAR).getdata())


def _sips_gray(path: Path, width: int, height: int) -> list[int]:
    # sips only resamples to a bounding box, so it will not hit an exact
    # non-square size. Ask for a small box, then box-filter to the exact grid.
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / "t.png"
        proc = subprocess.run(
            [SIPS, "-s", "format", "png", "--resampleHeightWidthMax", "64",
             str(path), "--out", str(out)],
            capture_output=True, timeout=60,
        )
        if proc.returncode != 0 or not out.exists():
            raise DecodeError(f"sips failed: {proc.stderr.decode(errors='replace').strip()}")
        sw, sh, gray = decode_png_gray(out.read_bytes())
    return _box_resize(gray, sw, sh, width, height)


def _box_resize(src: list[int], sw: int, sh: int, dw: int, dh: int) -> list[int]:
    """Average-pool an arbitrary WxH grayscale buffer onto a dw x dh grid."""
    if sw == dw and sh == dh:
        return src
    out: list[int] = []
    for y in range(dh):
        y0, y1 = y * sh // dh, max(y * sh // dh + 1, (y + 1) * sh // dh)
        for x in range(dw):
            x0, x1 = x * sw // dw, max(x * sw // dw + 1, (x + 1) * sw // dw)
            total = count = 0
            for yy in range(y0, y1):
                row = yy * sw
                for xx in range(x0, x1):
                    total += src[row + xx]
                    count += 1
            out.append(total // count if count else 0)
    return out


def load_gray(path: Path, width: int, height: int) -> list[int]:
    """Return a width*height grayscale buffer, trying each backend in turn."""
    is_heif = path.suffix.lower() in _HEIF_SUFFIXES
    errors: list[str] = []

    # Pillow first, unless this is HEIC and Pillow has no HEIC support.
    if Image is not None and (_PILLOW_HEIC or not is_heif):
        try:
            return _pillow_gray(path, width, height)
        except Exception as exc:  # noqa: BLE001 - fall through to the next backend
            errors.append(f"pillow: {exc}")

    if SIPS is not None:
        try:
            return _sips_gray(path, width, height)
        except Exception as exc:  # noqa: BLE001
            errors.append(f"sips: {exc}")

    # Last resort: Pillow on a HEIC file, in case a codec plugin is registered.
    if Image is not None and is_heif and not _PILLOW_HEIC:
        try:
            return _pillow_gray(path, width, height)
        except Exception as exc:  # noqa: BLE001
            errors.append(f"pillow-heic: {exc}")

    raise DecodeError("; ".join(errors) or "no decode backend available")


def make_thumb(src: Path, dest: Path, max_edge: int = 240) -> bool:
    """Write a small colour thumbnail for the HTML report. False if it failed."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    is_heif = src.suffix.lower() in _HEIF_SUFFIXES

    if Image is not None and (_PILLOW_HEIC or not is_heif):
        try:
            with Image.open(src) as im:
                im.draft("RGB", (max_edge * 2, max_edge * 2))
                im = im.convert("RGB")
                im.thumbnail((max_edge, max_edge), Image.BILINEAR)
                im.save(dest, "JPEG", quality=72)
            return True
        except Exception:  # noqa: BLE001 - thumbnails are best-effort
            pass

    if SIPS is not None:
        try:
            proc = subprocess.run(
                [SIPS, "-s", "format", "jpeg", "-s", "formatOptions", "72",
                 "--resampleHeightWidthMax", str(max_edge), str(src), "--out", str(dest)],
                capture_output=True, timeout=60,
            )
            return proc.returncode == 0 and dest.exists()
        except (subprocess.SubprocessError, OSError):
            return False

    return False
