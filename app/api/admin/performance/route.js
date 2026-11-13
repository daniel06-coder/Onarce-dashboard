import { NextResponse } from "next/server";
import { MetricServiceClient } from "@google-cloud/monitoring";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";

// export const dynamic = "force-dynamic";

// export async function GET() {
//   const snap = await adminDb.doc("adminStats/performance").get();
//   return Response.json(snap.data() ?? null);
// }

const projectId = process.env.FIREBASE_PROJECT_ID;
const creds = {
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};
const monitoring = new MetricServiceClient({ projectId, credentials: creds });
const ga = new BetaAnalyticsDataClient({ credentials: creds });

const FREE = { reads: 50000, writes: 20000, deletes: 20000 };

const safe = (p) =>
  p.catch((e) => {
    console.error(e.message);
    return null;
  });
const num = (v) => Number(String(v?.int64Value ?? v?.doubleValue ?? 0));
const pct = (used, limit) => Math.round((used / limit) * 1000) / 10;

// start of the current day in Pacific time (Firestore's quota day)
function pacificMidnight() {
  const now = new Date();
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles",
      hourCycle: "h23",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(now)
      .map((x) => [x.type, x.value]),
  );
  return now.getTime() - (+p.hour * 3600 + +p.minute * 60 + +p.second) * 1000;
}

async function metric(
  name,
  { start, end, aligner, reducer = "REDUCE_SUM", groupBy = [] },
) {
  const [series] = await monitoring.listTimeSeries({
    name: monitoring.projectPath(projectId),
    filter: `metric.type="firestore.googleapis.com/${name}"`,
    interval: {
      startTime: { seconds: Math.floor(start / 1000) },
      endTime: { seconds: Math.floor(end / 1000) },
    },
    aggregation: {
      alignmentPeriod: {
        seconds: Math.max(60, Math.floor((end - start) / 1000)),
      },
      perSeriesAligner: aligner,
      crossSeriesReducer: reducer,
      groupByFields: groupBy,
    },
  });
  return series;
}
const sum = (series) =>
  series.reduce(
    (t, s) => t + s.points.reduce((a, p) => a + num(p.value), 0),
    0,
  );

async function cloudinaryUsage() {
  const auth = Buffer.from(
    `${process.env.CLOUDINARY_API_KEY}:${process.env.CLOUDINARY_API_SECRET}`,
  ).toString("base64");
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/usage`,
    { headers: { Authorization: `Basic ${auth}` }, cache: "no-store" },
  );
  if (!res.ok) throw new Error(`cloudinary ${res.status}`);
  const u = await res.json();
  const used =
    u.credits?.usage ??
    (u.storage?.credits_usage ?? 0) +
      (u.bandwidth?.credits_usage ?? 0) +
      (u.transformations?.credits_usage ?? 0);
  return {
    plan: u.plan,
    creditsUsed: used,
    creditsLimit: u.credits?.limit ?? 25, // Free plan = 25 credits
    storageBytes: u.storage?.usage ?? null,
    bandwidthBytes: u.bandwidth?.usage ?? null,
    transformations: u.transformations?.usage ?? null,
  };
}

async function ping(url) {
  const t = Date.now();
  try {
    const r = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    return { url, ok: r.ok, status: r.status, ms: Date.now() - t };
  } catch {
    return { url, ok: false, status: 0, ms: Date.now() - t };
  }
}

async function traffic() {
  const property = `properties/${process.env.GA4_PROPERTY_ID}`;
  const [week] = await ga.runReport({
    property,
    dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
    metrics: [
      { name: "activeUsers" },
      { name: "sessions" },
      { name: "screenPageViews" },
    ],
  });
  const [live] = await ga.runRealtimeReport({
    property,
    metrics: [{ name: "activeUsers" }],
  });
  const v = week.rows?.[0]?.metricValues?.map((m) => Number(m.value)) ?? [
    0, 0, 0,
  ];
  return {
    users7d: v[0],
    sessions7d: v[1],
    pageViews7d: v[2],
    liveUsers: Number(live.rows?.[0]?.metricValues?.[0]?.value ?? 0),
  };
}

async function activeStores() {
  const since = Timestamp.fromMillis(Date.now() - 7 * 24 * 3600 * 1000);
  const [o, p] = await Promise.all([
    adminDb
      .collection("orders")
      .where("createdAt", ">=", since)
      .select("storeId")
      .limit(500)
      .get(),
    adminDb
      .collection("products")
      .where("createdAt", ">=", since)
      .select("storeId")
      .limit(500)
      .get(),
  ]);
  return new Set([...o.docs, ...p.docs].map((d) => d.data().storeId)).size;
}

export async function GET(req) {
  if (
    req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const end = Date.now();
  const start = pacificMidnight();
  const hourAgo = end - 3600 * 1000;

  const [
    reads,
    writes,
    deletes,
    conns,
    listeners,
    p95,
    reqs,
    cloud,
    site,
    stores,
    hits,
  ] = await Promise.all([
    safe(metric("document/read_count", { start, end, aligner: "ALIGN_SUM" })),
    safe(metric("document/write_count", { start, end, aligner: "ALIGN_SUM" })),
    safe(metric("document/delete_count", { start, end, aligner: "ALIGN_SUM" })),
    safe(
      metric("network/active_connections", {
        start: hourAgo,
        end,
        aligner: "ALIGN_MAX",
        reducer: "REDUCE_MAX",
      }),
    ),
    safe(
      metric("network/snapshot_listeners", {
        start: hourAgo,
        end,
        aligner: "ALIGN_MAX",
        reducer: "REDUCE_MAX",
      }),
    ),
    safe(
      metric("api/request_latencies", {
        start: hourAgo,
        end,
        aligner: "ALIGN_PERCENTILE_95",
        reducer: "REDUCE_MAX",
      }),
    ),
    safe(
      metric("api/request_count", {
        start,
        end,
        aligner: "ALIGN_SUM",
        groupBy: ["metric.labels.response_code"],
      }),
    ),
    safe(cloudinaryUsage()),
    safe(
      Promise.all([
        ping(process.env.SITE_URL),
        ping(`${process.env.SITE_URL}/auth`),
      ]),
    ),
    safe(activeStores()),
    safe(traffic()),
  ]);

  const r = reads ? sum(reads) : null;
  const w = writes ? sum(writes) : null;
  const d = deletes ? sum(deletes) : null;
  const total = reqs ? sum(reqs) : null;
  const failed = reqs
    ? sum(reqs.filter((s) => s.metric?.labels?.response_code !== "OK"))
    : null;

  const ref = adminDb.doc("adminStats/performance");
  const prev = (await ref.get()).data();
  const history = [...(prev?.history ?? []), { t: end, r, w, d, failed }].slice(
    -168,
  );

  await ref.set({
    updatedAt: end,
    quotaDayStart: start,
    firestore: {
      reads:
        r !== null
          ? { used: r, limit: FREE.reads, pct: pct(r, FREE.reads) }
          : null,
      writes:
        w !== null
          ? { used: w, limit: FREE.writes, pct: pct(w, FREE.writes) }
          : null,
      deletes:
        d !== null
          ? { used: d, limit: FREE.deletes, pct: pct(d, FREE.deletes) }
          : null,
      activeConnectionsPeak1h: conns?.[0]?.points?.[0]
        ? num(conns[0].points[0].value)
        : null,
      snapshotListenersPeak1h: listeners?.[0]?.points?.[0]
        ? num(listeners[0].points[0].value)
        : null,
      p95LatencyMs: p95?.[0]?.points?.[0]
        ? Math.round(num(p95[0].points[0].value))
        : null,
      requests:
        total !== null
          ? { total, failed, failedPct: total ? pct(failed, total) : 0 }
          : null,
    },
    cloudinary: cloud,
    site,
    activeStores7d: stores,
    traffic: hits,
    history,
  });

  return NextResponse.json({ ok: true });
}
