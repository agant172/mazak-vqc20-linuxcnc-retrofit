#!/usr/bin/env python3
"""Bundle io-dashboard/ into ONE self-contained HTML page for sharing.

The workspace is already offline-safe (no CDN, no webfonts, no module
imports), so bundling is purely mechanical: inline the three stylesheets and
the five scripts, then strip the parts that only make sense when the page is
served from the LinuxCNC host.

Output is an Artifact-ready fragment: <title> + <style> + body markup +
<script>, with no <!DOCTYPE>/<html>/<head>/<body> of its own (the Artifact
host supplies those).

Why this exists: the repo went private on 2026-08-16, and Tailscale only
reaches the tailnet, so there was no way to show the workspace to someone
outside either. This produces a file that can be handed to anyone — at the
cost of being a snapshot, with no live HAL bridge behind it.

Usage:  python3 io-dashboard/tools/build_standalone.py [out.html]
        (default output: io-dashboard/dist/mazak-io-navigator.html)
"""

from __future__ import annotations

import re
import subprocess
import sys
from datetime import date
from pathlib import Path

HERE = Path(__file__).resolve().parent
SRC = HERE.parent


def stamp() -> tuple[str, str]:
    """Commit and date to print on the snapshot banner.

    A shared snapshot outlives the terminal that made it, so it has to say
    which commit it came from — otherwise a reader cannot tell whether it
    predates the wiring change they are asking about.
    """
    try:
        commit = subprocess.run(
            ["git", "-C", str(SRC), "rev-parse", "--short", "HEAD"],
            capture_output=True, text=True, check=True,
        ).stdout.strip()
    except (subprocess.CalledProcessError, FileNotFoundError):
        commit = "unknown"
    return commit, date.today().isoformat()

CSS = ["styles.css", "commissioning.css", "project.css"]
JS = ["data.js", "app.js", "commissioning.js", "project_data.js", "project.js"]


def dark_palette_shim(styles_css: str) -> str:
    """Re-emit the dark palette for a root carrying no data-theme attribute.

    Every colour token in styles.css lives under html[data-theme="dark"] or
    html[data-theme="light"]; bare :root holds only fonts and radii. That is
    fine when index.html hard-codes <html data-theme="dark">, but an Artifact
    page cannot set attributes on <html> — the viewer's own theme choice
    decides, and "system" stamps nothing at all. Without this shim every
    var(--bg)/var(--text) would resolve to nothing for a system-theme viewer.
    """
    m = re.search(r'html\[data-theme="dark"\]\s*\{(.*?)\}', styles_css, re.S)
    if not m:
        raise SystemExit("could not find the dark palette block in styles.css")
    return (
        "\n/* --- standalone shim: dark palette when the host stamps no "
        "data-theme --- */\n"
        ":root:not([data-theme]) {" + m.group(1) + "}\n"
        # The page's own toggle writes data-theme on <html>, so it keeps working.
    )


def strip_live_controls(body: str) -> str:
    """Hide the live-HAL affordances; a shared snapshot has no bridge.

    The Live poll button XHRs ./api/io, which cannot exist on a static host —
    and an Artifact's CSP blocks the request outright. Leaving the button
    visible would offer the viewer a control that can only ever fail.

    It is hidden rather than deleted on purpose: app.js does an unguarded
    $('btn-live').addEventListener at init, so removing the element throws a
    TypeError on null and the whole page renders blank.
    """
    body = re.sub(
        r'(<button[^>]*id="btn-live")', r"\1 hidden disabled", body
    )
    body = body.replace(
        '<span class="link-label">Planning mode</span>',
        '<span class="link-label">Static snapshot</span>',
    )
    return body


def defuse_repo_links(js: str) -> str:
    """Point source links at nothing rather than at a private repo.

    app.js builds github.com/agant172/... blob URLs. The repo went private on
    2026-08-16, so those 404 for every viewer who is not a collaborator —
    a dead link that looks like a broken page rather than a permission wall.
    """
    js = js.replace(
        "var REPO_BLOB = 'https://github.com/agant172/"
        "mazak-vqc20-linuxcnc-retrofit/blob/main/';",
        "var REPO_BLOB = '';  /* standalone build: private repo, links omitted */",
    )
    # init() re-asserts this label at runtime, after the markup swap above.
    return js.replace(
        "setLinkState('offline', 'Planning mode');",
        "setLinkState('offline', 'Static snapshot');",
    )


def main() -> int:
    src = SRC
    out = (
        Path(sys.argv[1]) if len(sys.argv) > 1
        else SRC / "dist" / "mazak-io-navigator.html"
    )
    out.parent.mkdir(parents=True, exist_ok=True)
    index = (src / "index.html").read_text(encoding="utf-8")

    title = re.search(r"<title>(.*?)</title>", index, re.S).group(1)
    body = re.search(r"<body>(.*?)</body>", index, re.S).group(1)
    body = strip_live_controls(body)
    # The inline <script src=...> tags are replaced by real inlined sources.
    body = re.sub(r'<script src="[^"]*"></script>\s*', "", body)

    styles = (src / "styles.css").read_text(encoding="utf-8")
    css = "\n".join((src / f).read_text(encoding="utf-8") for f in CSS)
    css += dark_palette_shim(styles)

    js_parts = []
    for f in JS:
        code = (src / f).read_text(encoding="utf-8")
        if f == "app.js":
            code = defuse_repo_links(code)
        js_parts.append(f"/* ===== {f} ===== */\n{code}")

    commit, today = stamp()
    banner = (
        '<div class="safety-banner" role="note" style="margin:10px 12px 0">'
        "<strong>Read-only snapshot.</strong> Generated from the repo at commit "
        f"{commit} on {today}. Not a live view of the machine — there is no HAL "
        "bridge behind this page, and no value here is commissioned evidence. "
        "Every pin, polarity, and scale remains UNVERIFIED until measured at the "
        "machine.</div>"
    )

    out.write_text(
        f"<title>{title}</title>\n"
        f"<style>\n{css}\n</style>\n"
        f"{banner}\n{body}\n"
        f"<script>\n{chr(10).join(js_parts)}\n</script>\n",
        encoding="utf-8",
    )
    print(f"wrote {out} ({out.stat().st_size/1024:.0f} KB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
