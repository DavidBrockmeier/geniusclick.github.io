# /// script
# requires-python = ">=3.11"
# dependencies = ["duckdb", "pandas", "matplotlib", "openpyxl", "tzdata"]
# ///
"""
Metrolink Santa Ana transfer reliability.

Trip: IEOC 827 arrives Santa Ana 6:09 PM  ->  transfer  ->  OC 627 departs 6:26 PM.
Scheduled transfer window: 17 minutes. Question: how often is 827 late enough to
blow the connection and strand the rider at Santa Ana?

Outputs every run:
  - metrolink_transfer.png   informative charts
  - metrolink_transfer.xlsx  Excel workbook (raw data + summary + embedded chart)

USAGE -- the easy way (no pip, no venv; uv reads the deps above and runs it):
    uv run metrolink_transfer.py --demo
    uv run metrolink_transfer.py --discover     # confirm archive schema / trip_id format
    uv run metrolink_transfer.py --days 60       # real run (needs open internet)
  Install uv once: https://docs.astral.sh/uv/  (curl -LsSf https://astral.sh/uv/install.sh | sh)

USAGE -- the manual way:
    pip install duckdb pandas matplotlib openpyxl tzdata
    python metrolink_transfer.py --days 60

Re-run any time; it overwrites the two output files with the latest window.

NOTE ON WINDOW LENGTH: Metrolink changed schedules on 2026-05-10. The "slack"
metric (627's real departure minus 827's real arrival) is schedule-proof and valid
across the whole window. The "delay vs 6:09 PM" metric only applies to days under
the CURRENT timetable, so those days are flagged; days before the change are
excluded from the delay histogram.
"""

import argparse
import os
from datetime import datetime, timedelta, time, date
from zoneinfo import ZoneInfo

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import pandas as pd

# ----------------------------------------------------------------------------- config
LA = ZoneInfo("America/Los_Angeles")

FEED_HASH = "YUhSMGNEb3ZMMk5rYmk1emFXMXdiR2xtZlhObGNuWnBZMlV1WTI5dEwzSmxjR2x6WlhVdVluSg"
BASE_URL = "http://parquet.gtfsrt.io/trip-updates"
SANTA_ANA_ID = "92004"

ARRIVING = {"label": "IEOC 827", "num": "827", "sched": time(18, 9)}   # arrives Santa Ana
DEPARTING = {"label": "OC 627",  "num": "627", "sched": time(18, 26)}  # departs Santa Ana

MIN_TRANSFER_MIN = 5    # minutes physically needed to make the cross-platform transfer
SCHED_BUFFER_MIN = 17   # the timetable's printed window, for reference lines
SCHEDULE_EFFECTIVE = date(2026, 5, 10)  # current timetable start; earlier days had other times

OUT_PNG = "metrolink_transfer.png"
OUT_XLSX = "metrolink_transfer.xlsx"


def url_for(date_str):
    return f"{BASE_URL}/date={date_str}/base64url={FEED_HASH}/data.parquet"


def weekdays(days):
    """Last `days` weekdays (Mon-Fri), most recent first -- the transfer is weekday service."""
    out, i, today = [], 1, datetime.now(LA)
    while len(out) < days:
        d = today - timedelta(days=i)
        if d.weekday() < 5:
            out.append(d.strftime("%Y-%m-%d"))
        i += 1
    return out


def sched_epoch(date_str, t):
    y, m, d = map(int, date_str.split("-"))
    return datetime(y, m, d, t.hour, t.minute, tzinfo=LA).timestamp()


# ----------------------------------------------------------------------------- data
def _connect():
    import duckdb
    return duckdb.connect()


def discover(conn):
    """Inspect the real schema + trip_id format on a recent day before trusting anything."""
    for date_str in weekdays(7):
        try:
            cols = conn.execute(
                f"DESCRIBE SELECT * FROM read_parquet('{url_for(date_str)}')"
            ).df()
        except Exception as e:
            print(f"  {date_str}: unreadable -> {str(e).splitlines()[0]}")
            continue
        print(f"\n=== schema for {date_str} ===")
        print(cols[["column_name", "column_type"]].to_string(index=False))
        try:
            ids = conn.execute(
                f"SELECT DISTINCT trip_id FROM read_parquet('{url_for(date_str)}') "
                f"WHERE trip_id LIKE '%827%' OR trip_id LIKE '%627%' LIMIT 50"
            ).df()
            print("\nsample matching trip_ids (confirm 827/627 are whole train numbers):")
            print(ids.to_string(index=False))
        except Exception as e:
            print(f"\n(trip_id not a top-level column: {str(e).splitlines()[0]})")
        return
    print("No readable archive day in the last week.")


def fetch_actuals(conn, date_str):
    """
    One ACTUAL time per train for this day, at Santa Ana.

    GTFS-RT streams a fresh prediction every poll; we keep the LAST prediction per
    trip (by feed timestamp) as the best estimate of what actually happened -- the
    dedup the original script lacked. Returns (arr_epoch_827, dep_epoch_627).
    """
    q = f"""
        WITH flat AS (
            SELECT trip_id, timestamp AS feed_ts,
                   u.stop_id AS stop_id,
                   u.arrival.time   AS arr,
                   u.departure.time AS dep
            FROM read_parquet('{url_for(date_str)}'), UNNEST(stop_time_update) AS t(u)
            WHERE u.stop_id = '{SANTA_ANA_ID}'
              AND (regexp_matches(trip_id, '(^|[^0-9])827([^0-9]|$)')
                OR regexp_matches(trip_id, '(^|[^0-9])627([^0-9]|$)'))
        ),
        ranked AS (
            SELECT *, row_number() OVER (PARTITION BY trip_id ORDER BY feed_ts DESC) rn
            FROM flat
        )
        SELECT trip_id, arr, dep FROM ranked WHERE rn = 1
    """
    arr = dep = None
    for trip_id, a, d in conn.execute(q).fetchall():
        if "827" in str(trip_id):
            arr = a
        elif "627" in str(trip_id):
            dep = d
    return arr, dep


def collect_real(days):
    import duckdb
    conn = _connect()
    records = []
    for date_str in weekdays(days):
        try:
            arr, dep = fetch_actuals(conn, date_str)
        except duckdb.IOException:
            continue  # archive missing for this day -- legitimately skip
        # schema-mismatch / other errors are NOT swallowed: let them raise loudly.
        if arr is None:
            continue
        records.append({"date": date_str, "arr_827": arr, "dep_627": dep})
    return records


# ----------------------------------------------------------------------------- analysis
def build_frame(records):
    rows = []
    for r in records:
        date_str = r["date"]
        sched_arr = sched_epoch(date_str, ARRIVING["sched"])
        sched_dep = sched_epoch(date_str, DEPARTING["sched"])
        arr = r["arr_827"]
        # If 627's real departure is known, judge against it; else against the timetable.
        dep_used = r["dep_627"] if r.get("dep_627") else sched_dep
        slack_min = (dep_used - arr) / 60.0
        rows.append({
            "date": pd.to_datetime(date_str),
            "arr_827_actual": datetime.fromtimestamp(arr, LA),
            "arr_827_delay_min": (arr - sched_arr) / 60.0,
            "dep_627_actual": datetime.fromtimestamp(dep_used, LA),
            "dep_627_was_realtime": bool(r.get("dep_627")),
            "slack_min": slack_min,
            "made_it": slack_min >= MIN_TRANSFER_MIN,
            # delay-vs-timetable only meaningful under the current schedule
            "current_schedule": datetime.strptime(date_str, "%Y-%m-%d").date() >= SCHEDULE_EFFECTIVE,
        })
    df = pd.DataFrame(rows).sort_values("date").reset_index(drop=True)
    return df


def summarize(df):
    n = len(df)
    missed = int((~df["made_it"]).sum())
    cur = df[df["current_schedule"]]      # delay-vs-timetable only valid here
    nc = len(cur)
    return pd.DataFrame({
        "Metric": [
            "Weekdays evaluated",
            "Successful connections",
            "Missed (stranded)",
            "Success rate %",
            "Scheduled buffer (min)",
            "Median real slack (min)",
            "Worst-day slack (min)",
            "Days under current schedule",
            "Median 827 arrival delay (min)*",
            "Max 827 arrival delay (min)*",
        ],
        "Value": [
            n,
            n - missed,
            missed,
            round((n - missed) / n * 100, 1) if n else 0,
            SCHED_BUFFER_MIN,
            round(df["slack_min"].median(), 1) if n else None,
            round(df["slack_min"].min(), 1) if n else None,
            nc,
            round(cur["arr_827_delay_min"].median(), 1) if nc else None,
            round(cur["arr_827_delay_min"].max(), 1) if nc else None,
        ],
    })


# ----------------------------------------------------------------------------- charts
def make_charts(df, png_path):
    made = df["made_it"]
    colors = ["#2e9e5b" if m else "#d23c3c" for m in made]
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(11, 8.5))
    fig.suptitle("Santa Ana transfer: IEOC 827 → OC 627  (need ≥ %d min)" % MIN_TRANSFER_MIN,
                 fontsize=15, fontweight="bold")

    # 1) Slack per day -- the headline chart.
    ax1.bar(df["date"], df["slack_min"], color=colors, width=0.7)
    ax1.axhline(MIN_TRANSFER_MIN, color="#444", ls="--", lw=1,
                label=f"min transfer ({MIN_TRANSFER_MIN} min)")
    ax1.axhline(SCHED_BUFFER_MIN, color="#888", ls=":", lw=1,
                label=f"scheduled buffer ({SCHED_BUFFER_MIN} min)")
    ax1.axhline(0, color="#d23c3c", lw=1)
    ax1.set_ylabel("Slack: 627 departs − 827 arrives (min)")
    ax1.set_title("Connection margin by day  (red = stranded)")
    ax1.legend(loc="upper right", fontsize=8)
    ax1.xaxis.set_major_formatter(mdates.DateFormatter("%m/%d"))
    ax1.tick_params(axis="x", rotation=45)

    # 2) How late 827 actually runs into Santa Ana (current-timetable days only).
    cur = df[df["current_schedule"]]
    ax2.hist(cur["arr_827_delay_min"], bins=12, color="#3b6fb0", edgecolor="white")
    ax2.axvline(SCHED_BUFFER_MIN, color="#d23c3c", ls="--", lw=1.5,
                label=f"lose the connection beyond ~{SCHED_BUFFER_MIN - MIN_TRANSFER_MIN} min late")
    ax2.set_xlabel("827 arrival delay vs 6:09 PM schedule (min, negative = early)")
    ax2.set_ylabel("Days")
    ax2.set_title(f"Distribution of 827's lateness into Santa Ana  "
                  f"({len(cur)} days under current schedule)")
    ax2.legend(loc="upper right", fontsize=8)

    rate = (made.sum() / len(df) * 100) if len(df) else 0
    fig.text(0.5, 0.005, f"Success rate over {len(df)} weekdays: {rate:.0f}%",
             ha="center", fontsize=12, fontweight="bold")
    fig.tight_layout(rect=[0, 0.02, 1, 0.96])
    fig.savefig(png_path, dpi=130)
    plt.close(fig)


# ----------------------------------------------------------------------------- excel
def export_excel(df, summary, png_path, xlsx_path):
    disp = df.copy()
    disp["date"] = disp["date"].dt.strftime("%Y-%m-%d (%a)")
    disp["arr_827_actual"] = disp["arr_827_actual"].dt.strftime("%I:%M:%S %p")
    disp["dep_627_actual"] = disp["dep_627_actual"].dt.strftime("%I:%M:%S %p")
    disp = disp.rename(columns={
        "date": "Date", "arr_827_actual": "827 arrived",
        "arr_827_delay_min": "827 delay (min)", "dep_627_actual": "627 departed",
        "dep_627_was_realtime": "627 realtime?", "slack_min": "Slack (min)",
        "made_it": "Made it?",
    })
    disp["827 delay (min)"] = disp["827 delay (min)"].round(1)
    disp["Slack (min)"] = disp["Slack (min)"].round(1)

    with pd.ExcelWriter(xlsx_path, engine="openpyxl") as writer:
        summary.to_excel(writer, sheet_name="Summary", index=False, startrow=0)
        disp.to_excel(writer, sheet_name="Daily data", index=False)
        # Embed the chart image into the Summary sheet.
        from openpyxl.drawing.image import Image as XLImage
        ws = writer.sheets["Summary"]
        if os.path.exists(png_path):
            img = XLImage(png_path)
            img.width, img.height = 720, 555
            ws.add_image(img, "D2")
        for col, w in {"A": 30, "B": 14}.items():
            ws.column_dimensions[col].width = w
        data_ws = writer.sheets["Daily data"]
        for col, w in {"A": 18, "B": 13, "C": 16, "D": 13, "E": 14, "F": 12, "G": 10}.items():
            data_ws.column_dimensions[col].width = w


# ----------------------------------------------------------------------------- demo
def demo_records(days=30):
    """Synthetic but realistic data so the graphics/Excel path runs with no network.
    827 usually a few min late, occasionally badly late; 627 assumed near-schedule."""
    import random
    rng = random.Random(42)
    recs = []
    for date_str in weekdays(days):
        sched_arr = sched_epoch(date_str, ARRIVING["sched"])
        delay = max(-2, rng.gauss(4, 5))
        if rng.random() < 0.12:            # ~1 in 8 days: a real incident
            delay += rng.uniform(12, 30)
        arr = sched_arr + delay * 60
        dep = sched_epoch(date_str, DEPARTING["sched"]) + rng.gauss(1, 2) * 60
        recs.append({"date": date_str, "arr_827": arr, "dep_627": dep})
    return recs


# ----------------------------------------------------------------------------- main
def run(records, label):
    if not records:
        print("No usable days. Run --discover: the trip_id format or schema likely differs.")
        return
    df = build_frame(records)
    summary = summarize(df)
    make_charts(df, OUT_PNG)
    export_excel(df, summary, OUT_PNG, OUT_XLSX)
    print(f"[{label}] {len(df)} weekdays analyzed")
    print(summary.to_string(index=False))
    print(f"\nWrote {OUT_PNG} and {OUT_XLSX}")


if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--discover", action="store_true", help="inspect schema + trip_id format")
    p.add_argument("--demo", action="store_true", help="synthetic data; no network needed")
    p.add_argument("--days", type=int, default=60,
                   help="weekday window to scan (default 60; slack metric is valid across "
                        "the 2026-05-10 schedule change, delay metric uses post-change days)")
    args = p.parse_args()

    if args.discover:
        discover(_connect())
    elif args.demo:
        run(demo_records(args.days), "DEMO")
    else:
        run(collect_real(args.days), "LIVE")
