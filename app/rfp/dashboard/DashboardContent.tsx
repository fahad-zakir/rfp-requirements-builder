"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { computeReadinessScore, type CategoryWeights } from "@/lib/rfp";

interface RFPRecord {
  id: string;
  orgName: string;
  contactEmail: string;
  orgSize: string;
  budgetRange: string;
  orgType?: string;
  projectScope?: string;
  complianceContext?: string;
  categoryWeights: Record<string, number>;
  requirements: { id: string; text: string; category: string }[];
  createdAt: string;
}

const CHART_COLORS = ["#4F46E5", "#6366F1", "#818CF8", "#A5B4FC"];

export default function DashboardContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [data, setData] = useState<RFPRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Missing RFP ID");
      setLoading(false);
      return;
    }
    fetch(`/api/rfp/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setData)
      .catch(() => setError("Could not load RFP"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[var(--background)] px-4 py-16">
        <div className="mx-auto max-w-lg rounded-2xl border border-[var(--border)] bg-white p-8 text-center shadow-sm">
          <p className="text-[var(--text-muted)]">{error || "RFP not found."}</p>
          <Link href="/rfp" className="mt-4 inline-block rounded-xl bg-[var(--primary)] px-6 py-2.5 font-semibold text-white hover:bg-[var(--primary-light)]">
            Start RFP builder
          </Link>
        </div>
      </div>
    );
  }

  const readinessScore = computeReadinessScore(data.categoryWeights as unknown as CategoryWeights, data.requirements?.length ?? 0);
  const barData = Object.entries(data.categoryWeights || {}).map(([name, value], i) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: Number(value),
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/90 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] shadow-md transition-transform group-hover:scale-105">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-[var(--primary)] tracking-tight">Flowopta</span>
          </Link>
          <span className="text-sm font-semibold text-[var(--foreground)]">Scoring Dashboard</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Readiness dashboard</h1>
          <p className="mt-1 text-[var(--text-muted)]">
            {data.orgName} · {new Date(data.createdAt).toLocaleDateString()}
          </p>

          <div className="mt-8 flex flex-wrap gap-6">
            <div className="rounded-2xl border-2 border-[var(--primary)] bg-[var(--primary-muted)]/20 px-8 py-6 text-center">
              <div className="text-4xl font-bold text-[var(--primary)]">{readinessScore}</div>
              <div className="mt-1 text-sm font-medium text-[var(--text-muted)]">Readiness score (0–100)</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-white px-8 py-6 text-center">
              <div className="text-3xl font-bold text-[var(--foreground)]">{data.requirements?.length ?? 0}</div>
              <div className="mt-1 text-sm font-medium text-[var(--text-muted)]">Requirements</div>
            </div>
          </div>

          <div className="mt-10">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Category weights</h2>
            <div className="mt-4 h-64 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                  <YAxis domain={[0, 5]} tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
                  <Tooltip
                    content={({ payload }) =>
                      payload?.[0] ? (
                        <div className="rounded-lg border border-[var(--border)] bg-white p-3 shadow-sm">
                          <p className="font-medium text-[var(--foreground)]">{payload[0].payload.name}</p>
                          <p className="text-sm text-[var(--text-muted)]">Weight: {payload[0].value}/5</p>
                        </div>
                      ) : null
                    }
                  />
                  <Bar dataKey="value" name="Weight" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href={`/api/rfp/${id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-[var(--primary)] px-6 py-3 font-semibold text-white hover:bg-[var(--primary-light)]"
            >
              Download PDF draft
            </a>
            <a
              href={`/api/rfp/${id}/scoring-sheet`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl border border-[var(--primary)] px-6 py-3 font-semibold text-[var(--primary)] hover:bg-[var(--primary-muted)]"
            >
              Download scoring sheet (CSV)
            </a>
            <Link href={`/rfp/success?id=${id}`} className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] px-6 py-3 font-medium text-[var(--foreground)] hover:bg-[var(--primary-muted)]">
              Back to success
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
