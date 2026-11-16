#!/usr/bin/env python3
"""Real-user beacon report from the nginx JSON access log.

  guidebook-rum-report.py                 last 24 hours, printed
  guidebook-rum-report.py --hours 72      a different window
  guidebook-rum-report.py --date 2026-11-16 --json        one UTC day as JSON
  guidebook-rum-report.py --rollup        write yesterday's JSON to /var/backups/guidebook/rum/

A view is a POST /rum from a browser (not a crawler, not internal) whose Referer is the site
itself. Beacons without an `ev` field (sent before 2026-11-16) count as views. Leave beacons
(ev=l) are deduplicated per (visitor, view id): the largest dwell/scroll wins.
"""
import argparse, collections as C, datetime as dt, glob, gzip, json, os, statistics, sys

LOGS = ["/var/log/nginx/access.log", "/var/log/nginx/access.log.1"] + sorted(glob.glob("/var/log/nginx/access.log.*.gz"), reverse=True)
OUT_DIR = "/var/backups/guidebook/rum"
GOALS = {"wa", "tel", "mail", "contact", "form"}


def read_rows(start, end):
    for path in LOGS:
        try:
            handle = gzip.open(path, "rt", errors="ignore") if path.endswith(".gz") else open(path, errors="ignore")
        except OSError:
            continue
        with handle:
            oldest = None
            for line in handle:
                if '"/rum"' not in line:
                    continue
                try:
                    row = json.loads(line)
                    when = dt.datetime.fromisoformat(row["timestamp"])
                except (ValueError, KeyError):
                    continue
                oldest = when if oldest is None or when < oldest else oldest
                if start <= when < end:
                    yield row


def pct(values, q):
    if not values:
        return None
    values = sorted(values)
    return values[min(len(values) - 1, int(len(values) * q))]


def build(start, end):
    own_hosts = ("central-asia.live",)
    rows = list(read_rows(start, end))
    beacons = [r for r in rows if r.get("method") == "POST" and r.get("uri") == "/rum"]
    stats = {"window": {"from": start.isoformat(), "to": end.isoformat()}, "beacons": len(beacons)}
    stats["rejected"] = dict(C.Counter(f'{r["status"]}:{r.get("traffic_class")}' for r in beacons if r["status"] not in (204, 499)))
    real = [r for r in beacons if r["status"] in (204, 499) and r.get("traffic_class") == "browser_or_other"
            and not r.get("internal") and any(h in (r.get("referer") or "") for h in own_hosts)]
    stats["spoofed_or_foreign_referer"] = sum(1 for r in beacons if r["status"] in (204, 499) and r.get("traffic_class") == "browser_or_other"
                                               and not any(h in (r.get("referer") or "") for h in own_hosts))
    vid = lambda r: (r.get("vid_got") or r.get("vid_set") or r["client_ip"]).replace("gb_vid=", "")
    views = [r for r in real if r.get("ev", "") in ("", "v")]
    leaves = [r for r in real if r.get("ev") == "l"]
    events = [r for r in real if r.get("ev") in ("wa", "tel", "mail", "contact", "lang", "more", "form")]

    per_visitor = C.Counter(vid(r) for r in views)
    stats["views"] = len(views)
    stats["visitors"] = len(per_visitor)
    stats["views_per_visitor"] = round(len(views) / len(per_visitor), 2) if per_visitor else 0
    stats["single_view_visitors"] = sum(1 for n in per_visitor.values() if n == 1)
    stats["new_visitors"] = len({vid(r) for r in views if r.get("new") == "1"})
    stats["sessions_started"] = sum(1 for r in views if r.get("sess") == "1")
    top = lambda counter, n=10: [[k, v] for k, v in counter.most_common(n)]
    stats["devices"] = top(C.Counter(r.get("dev") or "?" for r in views))
    stats["connections"] = top(C.Counter(r.get("conn") for r in views if r.get("conn")))
    stats["countries"] = top(C.Counter(r.get("country") for r in views))
    page = lambda r: r.get("page") or ""
    parts = lambda r: (page(r).split("/") + ["", "", ""])
    stats["languages"] = top(C.Counter(parts(r)[1] or "?" for r in views))
    stats["sections"] = top(C.Counter(parts(r)[2] or "home" for r in views))
    stats["top_pages"] = top(C.Counter(page(r) for r in views), 15)
    stats["referrers"] = top(C.Counter(r.get("ref") for r in views if r.get("ref")))
    stats["utm_source"] = top(C.Counter(r.get("utm_source") for r in views if r.get("utm_source")))
    stats["events"] = dict(C.Counter(r["ev"] for r in events))
    goal_visitors = {vid(r) for r in events if r["ev"] in GOALS}
    stats["visitors_with_contact_action"] = len(goal_visitors)

    best = {}
    for r in leaves:
        key = (vid(r), r.get("vi") or r["request_id"])
        cur = best.setdefault(key, {"dwell": 0, "scroll": 0, "dev": r.get("dev"), "lcp": None, "cls": None, "inp": None})
        num = lambda k: int(r[k]) if r.get(k, "") != "" else None
        for k in ("dwell", "scroll"):
            if num(k) is not None:
                cur[k] = max(cur[k], num(k))
        for k in ("lcp", "cls", "inp"):
            if num(k) is not None:
                cur[k] = num(k)
    dwell = [v["dwell"] for v in best.values()]
    scroll = [v["scroll"] for v in best.values()]
    stats["engagement"] = {
        "views_with_leave_beacon": len(best),
        "median_seconds_visible": statistics.median(dwell) if dwell else None,
        "median_scroll_percent": statistics.median(scroll) if scroll else None,
        "share_scrolled_50": round(sum(1 for s in scroll if s >= 50) / len(scroll), 3) if scroll else None,
    }
    vitals = {}
    for name, label in (("lcp", "lcp_ms"), ("cls", "cls_x1000"), ("inp", "inp_ms")):
        values = [v[name] for v in best.values() if v[name] is not None]
        vitals[label] = {"n": len(values), "p50": pct(values, .5), "p75": pct(values, .75)}
    by_device = {}
    for dev in ("m", "t", "d"):
        values = [v["lcp"] for v in best.values() if v["dev"] == dev and v["lcp"] is not None]
        by_device[dev] = {"n": len(values), "lcp_p75": pct(values, .75)}
    stats["web_vitals"] = {**vitals, "lcp_by_device": by_device}
    return stats


def render(s):
    out = [f'{s["window"]["from"][:16]} -> {s["window"]["to"][:16]} UTC',
           f'beacons {s["beacons"]} (rejected {s["rejected"] or "none"}, foreign referer {s["spoofed_or_foreign_referer"]})',
           f'views {s["views"]} | visitors {s["visitors"]} | views/visitor {s["views_per_visitor"]} | single-view visitors {s["single_view_visitors"]}',
           f'new visitors {s["new_visitors"]} | sessions started {s["sessions_started"]} | visitors with a contact action {s["visitors_with_contact_action"]}']
    for key in ("devices", "connections", "countries", "languages", "sections", "referrers", "utm_source", "top_pages"):
        out.append(f'{key}: ' + (", ".join(f"{k} {v}" for k, v in s[key]) or "-"))
    out.append(f'events: {s["events"] or "-"}')
    out.append(f'engagement: {s["engagement"]}')
    out.append(f'web vitals: {s["web_vitals"]}')
    return "\n".join(out)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--hours", type=float, default=24)
    ap.add_argument("--date", help="one UTC day, YYYY-MM-DD")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--rollup", action="store_true", help="write the JSON for --date (default yesterday) to " + OUT_DIR)
    args = ap.parse_args()
    now = dt.datetime.now(dt.timezone.utc)
    if args.date or args.rollup:
        day = dt.date.fromisoformat(args.date) if args.date else (now - dt.timedelta(days=1)).date()
        start = dt.datetime.combine(day, dt.time(), dt.timezone.utc)
        end = start + dt.timedelta(days=1)
    else:
        start, end = now - dt.timedelta(hours=args.hours), now
    stats = build(start, end)
    if args.rollup:
        os.makedirs(OUT_DIR, exist_ok=True)
        path = os.path.join(OUT_DIR, f"{start.date()}.json")
        with open(path, "w") as f:
            json.dump(stats, f, indent=1, ensure_ascii=False)
        print("wrote", path)
    elif args.json:
        json.dump(stats, sys.stdout, indent=1, ensure_ascii=False)
        print()
    else:
        print(render(stats))


if __name__ == "__main__":
    main()
