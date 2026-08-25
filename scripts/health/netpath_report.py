#!/usr/bin/env python3
"""netpath_report.py — render netpath.jsonl as a standalone HTML report.

PingPlotter's useful half: latency over time per target, plus a per-hop table
showing where the jitter enters the path. Self-contained -- inline SVG and CSS,
no external anything -- so it opens from a file:// URL on any machine.

Usage:
    mazak-netpath-report.py [--out FILE] [--hours N]
"""

from __future__ import annotations

import argparse
import html
import json
import os
import time
from pathlib import Path

STATE = Path(os.environ.get("MAZAK_HEALTH_DIR", "/var/lib/mazak-health"))


def load(hours: float) -> dict[str, list[dict]]:
    src = STATE / "netpath.jsonl"
    cutoff = time.time() - hours * 3600
    by_target: dict[str, list[dict]] = {}
    if not src.exists():
        return by_target
    for line in src.read_text().splitlines():
        try:
            r = json.loads(line)
        except Exception:
            continue
        if r.get("at", 0) >= cutoff:
            by_target.setdefault(r["target"], []).append(r)
    for v in by_target.values():
        v.sort(key=lambda r: r["at"])
    return by_target


def num(v, d=0.0):
    try:
        return float(v)
    except (TypeError, ValueError):
        return d


def sparkline(rows: list[dict], w=760, h=130) -> str:
    """Latency over time: a band from best..worst with the average on top.

    The band is the point -- an average alone hides exactly the jitter you are
    looking for. A wide band with a flat average is bufferbloat.
    """
    if len(rows) < 2:
        return '<p class="muted">Not enough samples yet — the timer runs every 5 minutes.</p>'
    xs = [r["at"] for r in rows]
    x0, x1 = min(xs), max(xs)
    span = max(1, x1 - x0)
    hi = max(num(r.get("worst")) for r in rows) or 1.0
    hi *= 1.1

    def px(r):
        return 40 + (r["at"] - x0) / span * (w - 55)

    def py(v):
        return h - 22 - (num(v) / hi) * (h - 40)

    band_top = " ".join(f"{px(r):.1f},{py(r.get('best')):.1f}" for r in rows)
    band_bot = " ".join(f"{px(r):.1f},{py(r.get('worst')):.1f}" for r in reversed(rows))
    avg = " ".join(f"{px(r):.1f},{py(r.get('avg')):.1f}" for r in rows)

    grid = []
    for frac in (0.25, 0.5, 0.75, 1.0):
        y = py(hi * frac)
        grid.append(f'<line x1="40" y1="{y:.1f}" x2="{w-15}" y2="{y:.1f}" class="grid"/>')
        grid.append(f'<text x="34" y="{y+3:.1f}" class="ylab">{hi*frac:.0f}</text>')

    return f"""<svg viewBox="0 0 {w} {h}" class="chart" role="img">
  {''.join(grid)}
  <polygon points="{band_top} {band_bot}" class="band"/>
  <polyline points="{avg}" class="avg"/>
  <text x="40" y="{h-6}" class="xlab">{time.strftime('%H:%M', time.localtime(x0))}</text>
  <text x="{w-15}" y="{h-6}" class="xlab" text-anchor="end">{time.strftime('%H:%M', time.localtime(x1))}</text>
  <text x="40" y="12" class="ylab">ms</text>
</svg>"""


def hop_table(rows: list[dict]) -> str:
    if not rows:
        return ""
    last = rows[-1]
    out = ['<table><thead><tr><th>#</th><th>host</th><th>loss</th>'
           '<th>avg</th><th>best</th><th>worst</th><th>jitter</th></tr></thead><tbody>']
    prev_j = 0.0
    for hop in last.get("hop", []):
        j = num(hop.get("stdev"))
        loss = num(hop.get("loss"))
        # Flag the hop where jitter first jumps -- that is where it enters the
        # path, and it is usually not the hop with the largest absolute number.
        cls = ""
        if loss > 2:
            cls = "bad"
        elif j > 20 and j > prev_j * 1.8:
            cls = "warn"
        prev_j = max(prev_j, j)
        out.append(
            f'<tr class="{cls}"><td>{hop.get("n","")}</td>'
            f'<td class="host">{html.escape(str(hop.get("host") or "???"))}</td>'
            f'<td>{loss:.0f}%</td><td>{num(hop.get("avg")):.1f}</td>'
            f'<td>{num(hop.get("best")):.1f}</td><td>{num(hop.get("worst")):.1f}</td>'
            f'<td class="j">{j:.1f}</td></tr>')
    out.append("</tbody></table>")
    return "".join(out)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=str(STATE / "netpath.html"))
    ap.add_argument("--hours", type=float, default=24)
    a = ap.parse_args()

    data = load(a.hours)
    if not data:
        print("no samples in window", flush=True)
        return 1

    sections = []
    for target, rows in sorted(data.items()):
        last = rows[-1]
        worst_j = max(num(r.get("stdev")) for r in rows)
        avg_all = sum(num(r.get("avg")) for r in rows) / len(rows)
        state = "bad" if worst_j > 100 else ("warn" if worst_j > 30 else "ok")
        sections.append(f"""<section>
  <h2><span class="dot {state}"></span>{html.escape(target)}</h2>
  <p class="stats">{len(rows)} samples · mean {avg_all:.1f} ms ·
     peak jitter {worst_j:.1f} ms · {last.get('hops')} hops ·
     last {time.strftime('%H:%M', time.localtime(last['at']))}</p>
  {sparkline(rows)}
  <details><summary>per-hop detail (latest sample)</summary>{hop_table(rows)}</details>
</section>""")

    doc = f"""<title>Network path history</title>
<style>
  :root {{ --bg:#fbfbfa; --fg:#1a1a18; --mut:#6b6b66; --line:#e3e3df;
           --band:#c9dcf0; --avg:#2f6fb5; --ok:#2e7d4f; --warn:#b8860b; --bad:#b3261e; }}
  :root:not([data-theme="light"]) {{ }}
  @media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{
    --bg:#16161a; --fg:#e9e9e6; --mut:#9a9a94; --line:#2c2c31;
    --band:#24405c; --avg:#6ba7e5; --ok:#5fc98a; --warn:#e0b44a; --bad:#f1786d; }} }}
  :root[data-theme="dark"] {{ --bg:#16161a; --fg:#e9e9e6; --mut:#9a9a94; --line:#2c2c31;
    --band:#24405c; --avg:#6ba7e5; --ok:#5fc98a; --warn:#e0b44a; --bad:#f1786d; }}
  body {{ background:var(--bg); color:var(--fg); margin:0; padding:24px;
    font:14px/1.5 ui-sans-serif,-apple-system,"Segoe UI",Roboto,sans-serif; }}
  h1 {{ font-size:20px; margin:0 0 4px; }}
  h2 {{ font-size:15px; margin:0 0 2px; font-family:ui-monospace,monospace; }}
  .sub {{ color:var(--mut); margin:0 0 26px; }}
  section {{ border:1px solid var(--line); border-radius:8px; padding:14px 16px;
    margin-bottom:16px; }}
  .stats {{ color:var(--mut); margin:0 0 8px; font-size:12.5px; }}
  .chart {{ width:100%; height:auto; display:block; }}
  .band {{ fill:var(--band); opacity:.75; }}
  .avg {{ fill:none; stroke:var(--avg); stroke-width:1.6; }}
  .grid {{ stroke:var(--line); stroke-width:1; }}
  .ylab,.xlab {{ fill:var(--mut); font-size:9px; font-family:ui-monospace,monospace; }}
  .dot {{ display:inline-block; width:8px; height:8px; border-radius:50%;
    margin-right:7px; vertical-align:middle; }}
  .dot.ok{{background:var(--ok)}} .dot.warn{{background:var(--warn)}} .dot.bad{{background:var(--bad)}}
  details {{ margin-top:10px; }} summary {{ cursor:pointer; color:var(--mut); font-size:12.5px; }}
  table {{ border-collapse:collapse; margin-top:10px; width:100%;
    font-family:ui-monospace,monospace; font-size:12px; }}
  th,td {{ text-align:right; padding:3px 8px; border-bottom:1px solid var(--line); }}
  th:nth-child(2),td.host {{ text-align:left; }}
  th {{ color:var(--mut); font-weight:500; }}
  tr.warn td.j {{ color:var(--warn); font-weight:600; }}
  tr.bad td {{ color:var(--bad); }}
  .muted {{ color:var(--mut); }}
  .legend {{ color:var(--mut); font-size:12px; margin-top:20px; }}
</style>
<h1>Network path history</h1>
<p class="sub">LinuxCNC · last {a.hours:g} h · generated {time.strftime('%Y-%m-%d %H:%M')}</p>
{''.join(sections)}
<p class="legend">Shaded band spans best–worst per sample; the line is the mean.
A wide band under a flat mean is queueing delay, not a slow link. In the hop
tables, the highlighted row is where jitter first jumps — that is where it
enters the path, which is rarely the hop with the biggest number.</p>"""

    Path(a.out).write_text(doc)
    print(f"wrote {a.out} ({len(doc)//1024} KB, {sum(len(v) for v in data.values())} samples)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
