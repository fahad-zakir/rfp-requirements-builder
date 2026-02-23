"use client";

import { useEffect, useState } from "react";
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
import Logo from "../components/Logo";

interface Stats {
  totalRfps: number;
  totalLeads: number;
  rfpsByCompliance: Record<string, number>;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  organization: string;
  message?: string;
  rfpId?: string;
  createdAt: string;
}

const CHART_COLORS = ["#2563EB", "#3B82F6", "#10B981", "#059669"];

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/stats").then((r) => r.json()),
      fetch("/api/admin/leads").then((r) => r.json()),
    ])
      .then(([s, l]) => {
        setStats(s);
        setLeads(Array.isArray(l) ? l : []);
      })
      .catch(() => {
        setStats({ totalRfps: 0, totalLeads: 0, rfpsByCompliance: {} });
        setLeads([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
      </div>
    );
  }

  const barData = stats?.rfpsByCompliance
    ? Object.entries(stats.rfpsByCompliance).map(([name, value], i) => ({
        name: name === "unspecified" ? "Unspecified" : name,
        value,
        fill: CHART_COLORS[i % CHART_COLORS.length],
      }))
    : [];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6 py-2">
          <Logo href="/" size="md" />
          <span className="text-sm font-semibold text-[var(--text-muted)]">Admin – Analytics & leads</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Admin dashboard</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Manage analytics and track consulting leads. No PHI stored; HIPAA-ready design.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
            <div className="text-3xl font-bold text-[var(--primary)]">{stats?.totalRfps ?? 0}</div>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Total RFPs</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
            <div className="text-3xl font-bold text-[var(--primary)]">{stats?.totalLeads ?? 0}</div>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Consulting leads</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
            <div className="text-lg font-semibold text-[var(--foreground)]">By compliance context</div>
            <p className="mt-1 text-xs text-[var(--text-muted)]">RFPs by HIPAA/FHIR context</p>
          </div>
        </div>

        {barData.length > 0 && (
          <div className="mt-8 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">RFPs by compliance context</h2>
            <div className="mt-4 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                  <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
                  <Tooltip
                    content={({ payload }) =>
                      payload?.[0] ? (
                        <div className="rounded-lg border border-[var(--border)] bg-white p-3 shadow-sm">
                          <p className="font-medium text-[var(--foreground)]">{payload[0].payload.name}</p>
                          <p className="text-sm text-[var(--text-muted)]">Count: {payload[0].value}</p>
                        </div>
                      ) : null
                    }
                  />
                  <Bar dataKey="value" name="RFPs" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="mt-10 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Consulting leads</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Expert review requests (SendGrid integration optional).</p>
          {leads.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--text-muted)]">No leads yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-[var(--border)]">
              {leads.map((lead) => (
                <li key={lead.id} className="py-4 first:pt-0">
                  <p className="font-medium text-[var(--foreground)]">{lead.name}</p>
                  <p className="text-sm text-[var(--text-muted)]">{lead.email} · {lead.organization}</p>
                  {lead.message && <p className="mt-1 text-sm text-[var(--text-muted)]">{lead.message}</p>}
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{new Date(lead.createdAt).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-8">
          <Link href="/" className="rounded-xl border border-[var(--border)] px-6 py-2.5 font-medium text-[var(--foreground)] hover:bg-[var(--primary-muted)]">
            Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
