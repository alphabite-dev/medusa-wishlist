const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_S = 60 * 60;
const DAY_S = 24 * HOUR_S;
const WEEK_S = 7 * DAY_S;

export type TrendBucket = "hour" | "day" | "week";

/**
 * Postgres `to_char` format per bucket. The trend query truncates in UTC
 * (`created_at AT TIME ZONE 'UTC'`) and formats with these; `bucketLabel`
 * produces byte-identical strings so the zero-fill series matches the rows.
 */
export const TREND_SQL_FORMAT: Record<TrendBucket, string> = {
  hour: "YYYY-MM-DD HH24:MI",
  day: "YYYY-MM-DD",
  week: "YYYY-MM-DD",
};

/**
 * Pick the trend bucket for a window length: hour for ≈a day or less (the 24h
 * preset), day up to ~2 months, week beyond that.
 */
export function pickTrendBucket(periodMs: number): TrendBucket {
  if (periodMs <= 2 * DAY_MS) return "hour";
  if (periodMs <= 60 * DAY_MS) return "day";
  return "week";
}

const pad = (x: number): string => String(x).padStart(2, "0");

/**
 * Truncate `d` to the start of its bucket, in UTC, as epoch seconds. Weeks snap
 * back to Monday, matching Postgres `date_trunc('week', ...)`.
 */
function truncEpoch(d: Date, bucket: TrendBucket): number {
  if (bucket === "hour") {
    return Math.floor(d.getTime() / 1000 / HOUR_S) * HOUR_S;
  }
  const midnight =
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 1000;
  if (bucket === "day") return midnight;
  const backDays = (new Date(midnight * 1000).getUTCDay() + 6) % 7;
  return midnight - backDays * DAY_S;
}

function bucketLabel(epochS: number, bucket: TrendBucket): string {
  const d = new Date(epochS * 1000);
  const ymd = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  return bucket === "hour" ? `${ymd} ${pad(d.getUTCHours())}:00` : ymd;
}

/**
 * Ordered list of UTC bucket labels covering `[from, to)` — one per bucket,
 * including buckets with no rows. Labels match
 * `to_char(date_trunc(<bucket>, created_at AT TIME ZONE 'UTC'), <fmt>)`, so a
 * caller can zero-fill a sparse trend by looking each label up in its row map.
 */
export function trendBuckets(
  from: Date,
  to: Date,
  bucket: TrendBucket,
): string[] {
  const step = bucket === "hour" ? HOUR_S : bucket === "day" ? DAY_S : WEEK_S;
  const startEpoch = truncEpoch(from, bucket);
  const endEpoch = to.getTime() / 1000;
  const out: string[] = [];
  for (let e = startEpoch; e < endEpoch; e += step) {
    out.push(bucketLabel(e, bucket));
  }
  return out;
}
