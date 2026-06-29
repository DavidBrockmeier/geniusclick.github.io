# Metrolink Santa Ana transfer reliability

A standalone analysis tool (unrelated to the website build) that checks how reliable a
specific Metrolink connection is, using the archived GTFS-RT feed at `parquet.gtfsrt.io`.

**The trip:** IEOC **827** arrives Santa Ana 6:09 PM → transfer → OC **627** departs 6:26 PM
(scheduled transfer window: 17 min). Question: how often is 827 late enough to blow the
connection and strand the rider at Santa Ana, where 827 is the last southbound IEOC train
of the day?

## Run it

The script declares its own dependencies inline (PEP 723), so [`uv`](https://docs.astral.sh/uv/)
runs it with no manual setup:

```bash
uv run metrolink_transfer.py --demo        # synthetic data; proves charts/Excel, no network
uv run metrolink_transfer.py --discover    # confirm the archive's schema + trip_id format
uv run metrolink_transfer.py --days 60      # the real run (needs open internet)
```

Install uv once: `curl -LsSf https://astral.sh/uv/install.sh | sh` (or `brew install uv`).

Prefer plain Python? `pip install duckdb pandas matplotlib openpyxl tzdata` then
`python metrolink_transfer.py --days 60`.

> Run `--discover` first. It prints the archive's real column layout and the actual
> `trip_id` strings so you can confirm 827/627 are matched as whole train numbers before
> trusting any output.

## Outputs (overwritten each run)

- `metrolink_transfer.png` — two charts: daily connection margin (green = made it,
  red = stranded) and the distribution of 827's lateness into Santa Ana.
- `metrolink_transfer.xlsx` — **Summary** sheet (stats + embedded chart) and a
  **Daily data** sheet (per-day actual times, delay, slack, made-it flag).

## How it measures "stranded"

- **Dedup:** GTFS-RT streams a fresh prediction every poll; the script keeps the *last*
  prediction per train per day as the actual time.
- **One opportunity per weekday:** 827's arrival vs 627's departure — no cartesian join.
- **Buffer:** "made it" means slack ≥ `MIN_TRANSFER_MIN` (5 min to physically cross the
  platform), not arrival-before-departure to the second.

## Schedule-change caveat

Metrolink changed schedules on **2026-05-10**. The **slack** metric (627's real departure
minus 827's real arrival) is schedule-proof and valid across the whole window. The
**delay vs 6:09 PM** metric only applies to days under the current timetable, so earlier
days are flagged and excluded from that histogram. Widen `--days` freely; just know older
days contribute only to the slack metric.

## Tuning

Constants at the top of `metrolink_transfer.py`: train numbers, scheduled times,
`SANTA_ANA_ID`, `MIN_TRANSFER_MIN`, `SCHED_BUFFER_MIN`, `SCHEDULE_EFFECTIVE`. Adjust if the
timetable changes or you want to analyze a different connection.
