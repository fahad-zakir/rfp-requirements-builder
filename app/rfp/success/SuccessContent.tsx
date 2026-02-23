"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [data, setData] = useState<{ orgName: string; contactEmail: string; createdAt: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [consultingSubmitted, setConsultingSubmitted] = useState(false);
  const [consultingSubmitting, setConsultingSubmitting] = useState(false);
  const [consultingForm, setConsultingForm] = useState({ name: "", email: "", organization: "", message: "" });

  useEffect(() => {
    if (!id) {
      setError("Missing submission ID");
      setLoading(false);
      return;
    }
    fetch(`/api/rfp/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setData)
      .catch(() => setError("Could not load submission"))
      .finally(() => setLoading(false));
  }, [id]);

  const downloadPdf = useCallback(() => {
    if (!id) return;
    window.open(`/api/rfp/${id}/pdf`, "_blank", "noopener,noreferrer");
  }, [id]);

  const downloadScoringSheet = useCallback(() => {
    if (!id) return;
    window.open(`/api/rfp/${id}/scoring-sheet`, "_blank", "noopener,noreferrer");
  }, [id]);

  const submitConsultingLead = useCallback(async () => {
    if (!consultingForm.name.trim() || !consultingForm.email.trim() || !consultingForm.organization.trim()) return;
    setConsultingSubmitting(true);
    try {
      const res = await fetch("/api/consulting-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: consultingForm.name.trim(),
          email: consultingForm.email.trim(),
          organization: consultingForm.organization.trim(),
          message: consultingForm.message.trim() || undefined,
          rfpId: id || undefined,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) setConsultingSubmitted(true);
    } finally {
      setConsultingSubmitting(false);
    }
  }, [consultingForm, id]);

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
          <p className="text-[var(--text-muted)]">{error || "Submission not found."}</p>
          <Link
            href="/rfp"
            className="mt-4 inline-block rounded-xl bg-[var(--primary)] px-6 py-2.5 font-semibold text-white hover:bg-[var(--primary-light)]"
          >
            Start RFP builder
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/90 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] shadow-md transition-transform group-hover:scale-105">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-[var(--primary)] tracking-tight">Flowopta</span>
          </Link>
          <span className="text-sm font-semibold text-[var(--foreground)]">RFP Builder</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-8 shadow-sm text-center">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Submission received</h1>
          <p className="mt-2 text-[var(--text-muted)]">
            {data.orgName} · {new Date(data.createdAt).toLocaleDateString()}
          </p>
          <p className="mt-4 text-sm text-[var(--text-muted)]">
            Download your RFP draft and scoring sheet below. We&apos;ll follow up via email (when configured).
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={downloadPdf}
              className="inline-flex items-center justify-center rounded-xl bg-[var(--primary)] px-6 py-3 font-semibold text-white hover:bg-[var(--primary-light)]"
            >
              Download PDF draft
            </button>
            <button
              type="button"
              onClick={downloadScoringSheet}
              className="inline-flex items-center justify-center rounded-xl border border-[var(--primary)] bg-transparent px-6 py-3 font-semibold text-[var(--primary)] hover:bg-[var(--primary-muted)]"
            >
              Download scoring sheet (CSV)
            </button>
            {id && (
              <Link
                href={`/rfp/dashboard?id=${id}`}
                className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] px-6 py-3 font-semibold text-[var(--foreground)] hover:bg-[var(--primary-muted)]"
              >
                View scoring dashboard
              </Link>
            )}
          </div>

          {/* Consulting CTA – Book expert review */}
          <section className="mt-12 rounded-2xl border border-[var(--border)] bg-[var(--primary-muted)]/20 p-6 text-left">
            <h2 className="text-lg font-bold text-[var(--foreground)]">Book an expert review</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Schedule a 15-minute call with our team to review your RFP requirements and get tailored advice.
            </p>
            {consultingSubmitted ? (
              <p className="mt-4 text-sm font-medium text-[var(--primary)]">Thanks! We&apos;ll be in touch shortly.</p>
            ) : (
              <form
                onSubmit={(e) => { e.preventDefault(); submitConsultingLead(); }}
                className="mt-4 space-y-3"
              >
                <input
                  type="text"
                  placeholder="Your name *"
                  value={consultingForm.name}
                  onChange={(e) => setConsultingForm((f) => ({ ...f, name: e.target.value }))}
                  className="block w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  required
                />
                <input
                  type="email"
                  placeholder="Email *"
                  value={consultingForm.email}
                  onChange={(e) => setConsultingForm((f) => ({ ...f, email: e.target.value }))}
                  className="block w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  required
                />
                <input
                  type="text"
                  placeholder="Organization *"
                  value={consultingForm.organization}
                  onChange={(e) => setConsultingForm((f) => ({ ...f, organization: e.target.value }))}
                  className="block w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  required
                />
                <textarea
                  placeholder="Message (optional)"
                  value={consultingForm.message}
                  onChange={(e) => setConsultingForm((f) => ({ ...f, message: e.target.value }))}
                  rows={2}
                  className="block w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
                <button
                  type="submit"
                  disabled={consultingSubmitting}
                  className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-light)] disabled:opacity-50"
                >
                  {consultingSubmitting ? "Sending…" : "Request expert review"}
                </button>
              </form>
            )}
          </section>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/" className="text-sm font-medium text-[var(--primary)] hover:underline">
              Back to home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
