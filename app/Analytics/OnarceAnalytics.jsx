"use client";
import React, { useEffect, useState } from "react";
// import { doc, getDoc } from "firebase/firestore";
import { auth } from "@/lib/firebase";

const UsageBar = ({ label, used, limit }) => {
  const pct = limit ? Math.min(100, ((used ?? 0) / limit) * 100) : 0;
  const color =
    pct >= 85 ? "bg-red-500" : pct >= 60 ? "bg-amber-500" : "bg-green-500";
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span>
          {used?.toLocaleString() ?? "—"} / {limit?.toLocaleString() ?? "—"} ·{" "}
          {pct.toFixed(1)}%
        </span>
      </div>
      <div className="h-2 rounded bg-slate-200">
        <div className={`h-2 rounded ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div className="bg-slate-100 rounded-xl p-4">
    <p className="text-xs text-slate-500">{label}</p>
    <p className="font-semibold text-lg">{value ?? "—"}</p>
  </div>
);

const OnarceAnalytics = () => {
  const [perf, setPerf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


const load = async () => {
  try {
    setLoading(true);
    setError("");


    const user = auth.currentUser;

    if (!user) {
      throw new Error("Please sign in first.");
    }

    const token = await user.getIdToken();




    const res = await fetch("/api/admin/stats", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const contentType = res.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      const body = await res.text();

      console.error("Unexpected API response:", body.slice(0, 500));

      throw new Error(
        `Expected JSON but received ${contentType || "unknown content type"}.`,
      );
    }

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to load performance data.");
    }

    setPerf(data);
  } catch (e) {
    console.error("Analytics loading error:", e);
    setError(e.message || "Failed to load performance data.");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    load();
  }, []);

  if (loading) return <p className="p-4 animate-pulse">Loading analytics...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;
  if (!perf)
    return (
      <p className="p-4 text-slate-500">
        No data yet. Run /api/admin/performance once to create it.
      </p>
    );

  const f = perf.firestore ?? {};
  const c = perf.cloudinary;

  return (
    <main className="flex flex-col gap-6 p-4">
      <div className="flex justify-between items-center">
        <p className="text-xs text-slate-400">
          Updated {new Date(perf.updatedAt).toLocaleString()}
        </p>
        <button onClick={load} className="text-xs text-blue-600 underline">
          Refresh
        </button>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold">Firestore (daily free quota)</h2>
        <UsageBar
          label="Reads today"
          used={f.reads?.used}
          limit={f.reads?.limit ?? 50000}
        />
        <UsageBar
          label="Writes today"
          used={f.writes?.used}
          limit={f.writes?.limit ?? 20000}
        />
        <UsageBar
          label="Deletes today"
          used={f.deletes?.used}
          limit={f.deletes?.limit ?? 20000}
        />
      </section>

      <section className="grid grid-cols-2 gap-3">
        <Stat
          label="Active connections (peak 1h)"
          value={f.activeConnectionsPeak1h}
        />
        <Stat
          label="Snapshot listeners (peak 1h)"
          value={f.snapshotListenersPeak1h}
        />
        <Stat
          label="p95 latency"
          value={f.p95LatencyMs != null ? `${f.p95LatencyMs} ms` : null}
        />
        <Stat
          label="Failed requests today"
          value={
            f.requests
              ? `${f.requests.failed} / ${f.requests.total} (${f.requests.failedPct}%)`
              : null
          }
        />
      </section>

      {c && !c.error && (
        <section className="flex flex-col gap-3">
          <h2 className="font-semibold">Cloudinary</h2>
          <UsageBar
            label="Credits this month"
            used={c.creditsUsed}
            limit={c.creditsLimit}
          />
        </section>
      )}

      <section className="grid grid-cols-2 gap-3">
        <Stat label="Active stores (7d)" value={perf.activeStores7d} />
        <Stat label="Live users now" value={perf.traffic?.liveUsers} />
        <Stat label="Users (7d)" value={perf.traffic?.users7d} />
        <Stat label="Page views (7d)" value={perf.traffic?.pageViews7d} />
      </section>
    </main>
  );
};

export default OnarceAnalytics;
