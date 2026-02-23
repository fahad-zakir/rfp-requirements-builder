"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CATEGORIES,
  ORG_SIZES,
  BUDGET_RANGES,
  ORG_TYPES,
  PROJECT_SCOPES,
  COMPLIANCE_CONTEXT,
  defaultWeights,
  type CategoryWeights,
  type OrgSize,
  type BudgetRange,
  type OrgType,
  type ProjectScope,
  type ComplianceContext,
  type CategoryKey,
} from "@/lib/rfp";
import type { RFPRequirementRecord } from "@/lib/store";

const STEP_COUNT = 5;

export default function RFPWizard() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [orgName, setOrgName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [orgSize, setOrgSize] = useState<OrgSize | "">("");
  const [budgetRange, setBudgetRange] = useState<BudgetRange | "">("");
  const [orgType, setOrgType] = useState<OrgType | "">("");
  const [projectScope, setProjectScope] = useState<ProjectScope | "">("");
  const [complianceContext, setComplianceContext] = useState<ComplianceContext | "">("");
  const [categoryWeights, setCategoryWeights] = useState<CategoryWeights>(defaultWeights());
  const [requirements, setRequirements] = useState<RFPRequirementRecord[]>([]);

  const setWeight = (key: keyof CategoryWeights, value: number) => {
    setCategoryWeights((prev) => ({ ...prev, [key]: Math.max(1, Math.min(5, value)) }));
  };

  const addRequirement = useCallback((text: string, category: CategoryKey = "compliance", priority?: "must" | "should" | "nice") => {
    if (!text.trim()) return;
    setRequirements((prev) => [
      ...prev,
      {
        id: `req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        text: text.trim(),
        category,
        priority,
      },
    ]);
  }, []);

  const removeRequirement = useCallback((id: string) => {
    setRequirements((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const updateRequirement = useCallback((id: string, updates: Partial<Pick<RFPRequirementRecord, "text" | "category" | "priority">>) => {
    setRequirements((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  }, []);

  const handleAiSuggest = useCallback(async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/rfp/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: `${orgName || "Healthcare org"} – ${projectScope || "general"} – ${complianceContext || "HIPAA/FHIR"}`,
          category: "compliance",
          count: 5,
        }),
      });
      const data = await res.json();
      const list = data.suggestions || [];
      list.forEach((s: string) => addRequirement(s, "compliance"));
    } catch {
      addRequirement("Vendor must support FHIR R4 for clinical data exchange.", "compliance", "must");
      addRequirement("Solution shall provide audit logging for all PHI access (HIPAA).", "compliance", "must");
    } finally {
      setAiLoading(false);
    }
  }, [orgName, projectScope, complianceContext, addRequirement]);

  const profileValid = orgName.trim() && contactEmail.trim() && orgSize && budgetRange;

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/rfp/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgName: orgName.trim(),
          contactEmail: contactEmail.trim(),
          orgSize,
          budgetRange,
          orgType: orgType || undefined,
          projectScope: projectScope || undefined,
          complianceContext: complianceContext || undefined,
          categoryWeights,
          requirements,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      router.push(`/rfp/success?id=${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

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
          <span className="text-sm font-semibold text-[var(--foreground)]">RFP Requirements Builder</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 flex gap-1.5" role="tablist" aria-label="Wizard steps">
          {Array.from({ length: STEP_COUNT }, (_, i) => i + 1).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStep(s as 1 | 2 | 3 | 4 | 5)}
              className={`h-2 flex-1 rounded-full transition-colors ${
                step === s ? "bg-[var(--primary)]" : "bg-[var(--border)]"
              }`}
              aria-label={`Step ${s}`}
              aria-selected={step === s}
            />
          ))}
        </div>

        {/* Step 1 – Organization Setup */}
        {step === 1 && (
          <div className="rounded-2xl border border-[var(--border)] bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[var(--foreground)]">Step 1 – Organization setup</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Organization type, project scope, and compliance context (HIPAA/FHIR-aware).
            </p>
            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="orgName" className="block text-sm font-medium text-[var(--foreground)]">
                  Organization name <span className="text-red-500">*</span>
                </label>
                <input
                  id="orgName"
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  placeholder="Your organization"
                  aria-required="true"
                  aria-invalid={!!(orgName.length > 0 && orgName.length < 2)}
                />
                <p className="mt-1 text-xs text-[var(--text-muted)]">Required. Min 2 characters.</p>
              </div>
              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-[var(--foreground)]">
                  Contact email <span className="text-red-500">*</span>
                </label>
                <input
                  id="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  placeholder="you@org.com"
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor="orgSize" className="block text-sm font-medium text-[var(--foreground)]">
                  Organization size <span className="text-red-500">*</span>
                </label>
                <select
                  id="orgSize"
                  value={orgSize}
                  onChange={(e) => setOrgSize(e.target.value as OrgSize)}
                  className="mt-1 block w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  aria-required="true"
                >
                  <option value="">Select size</option>
                  {ORG_SIZES.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="budgetRange" className="block text-sm font-medium text-[var(--foreground)]">
                  Budget range <span className="text-red-500">*</span>
                </label>
                <select
                  id="budgetRange"
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value as BudgetRange)}
                  className="mt-1 block w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  aria-required="true"
                >
                  <option value="">Select budget</option>
                  {BUDGET_RANGES.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="orgType" className="block text-sm font-medium text-[var(--foreground)]">
                  Organization type
                </label>
                <select
                  id="orgType"
                  value={orgType}
                  onChange={(e) => setOrgType(e.target.value as OrgType)}
                  className="mt-1 block w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                >
                  <option value="">Select type</option>
                  {ORG_TYPES.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-[var(--text-muted)]">Hospital, clinic, payor, vendor, etc.</p>
              </div>
              <div>
                <label htmlFor="projectScope" className="block text-sm font-medium text-[var(--foreground)]">
                  Project scope
                </label>
                <select
                  id="projectScope"
                  value={projectScope}
                  onChange={(e) => setProjectScope(e.target.value as ProjectScope)}
                  className="mt-1 block w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                >
                  <option value="">Select scope</option>
                  {PROJECT_SCOPES.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="complianceContext" className="block text-sm font-medium text-[var(--foreground)]">
                  Compliance context
                </label>
                <select
                  id="complianceContext"
                  value={complianceContext}
                  onChange={(e) => setComplianceContext(e.target.value as ComplianceContext)}
                  className="mt-1 block w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                >
                  <option value="">Select context</option>
                  {COMPLIANCE_CONTEXT.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-[var(--text-muted)]">HIPAA/FHIR alignment for requirements.</p>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!profileValid}
                className="rounded-xl bg-[var(--primary)] px-6 py-2.5 font-semibold text-white hover:bg-[var(--primary-light)] disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2 – Category selection */}
        {step === 2 && (
          <div className="rounded-2xl border border-[var(--border)] bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[var(--foreground)]">Step 2 – Category selection</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Integration, Automation, Analytics, Compliance. You&apos;ll weight these next.
            </p>
            <ul className="mt-6 space-y-4">
              {CATEGORIES.map((c) => (
                <li key={c.key} className="rounded-lg border border-[var(--border)] bg-[var(--primary-muted)]/30 p-4">
                  <span className="font-semibold text-[var(--primary)]">{c.name}</span>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{c.description}</p>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex justify-between">
              <button type="button" onClick={() => setStep(1)} className="rounded-xl border border-[var(--border)] px-6 py-2.5 font-medium text-[var(--foreground)] hover:bg-[var(--primary-muted)]">Back</button>
              <button type="button" onClick={() => setStep(3)} className="rounded-xl bg-[var(--primary)] px-6 py-2.5 font-semibold text-white hover:bg-[var(--primary-light)]">Next</button>
            </div>
          </div>
        )}

        {/* Step 3 – Weighting */}
        {step === 3 && (
          <div className="rounded-2xl border border-[var(--border)] bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[var(--foreground)]">Step 3 – Weighting (1–5)</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">How important is each category? 1 = low, 5 = high.</p>
            <div className="mt-6 space-y-6">
              {CATEGORIES.map((c) => (
                <div key={c.key}>
                  <div className="flex items-center justify-between">
                    <label className="font-medium text-[var(--foreground)]">{c.name}</label>
                    <span className="text-[var(--primary)] font-semibold">{categoryWeights[c.key]}/5</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={categoryWeights[c.key]}
                    onChange={(e) => setWeight(c.key, Number(e.target.value))}
                    className="mt-2 h-2 w-full appearance-none rounded-full bg-[var(--border)] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--primary)]"
                    aria-valuemin={1}
                    aria-valuemax={5}
                    aria-valuenow={categoryWeights[c.key]}
                  />
                </div>
              ))}
            </div>
            <div className="mt-8 flex justify-between">
              <button type="button" onClick={() => setStep(2)} className="rounded-xl border border-[var(--border)] px-6 py-2.5 font-medium text-[var(--foreground)] hover:bg-[var(--primary-muted)]">Back</button>
              <button type="button" onClick={() => setStep(4)} className="rounded-xl bg-[var(--primary)] px-6 py-2.5 font-semibold text-white hover:bg-[var(--primary-light)]">Next</button>
            </div>
          </div>
        )}

        {/* Step 4 – Requirement Builder with AI */}
        {step === 4 && (
          <div className="rounded-2xl border border-[var(--border)] bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[var(--foreground)]">Step 4 – Requirement builder</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Add, edit, or remove requirements. Use AI to suggest healthcare best-practice requirements.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleAiSuggest}
                disabled={aiLoading}
                className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-light)] disabled:opacity-50"
              >
                {aiLoading ? "Suggesting…" : "Suggest with AI"}
              </button>
              <button
                type="button"
                onClick={() => addRequirement("New requirement – edit this text", "compliance")}
                className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--primary-muted)]"
              >
                Add requirement
              </button>
            </div>
            <ul className="mt-4 space-y-3">
              {requirements.map((r) => (
                <li key={r.id} className="flex items-start gap-2 rounded-lg border border-[var(--border)] bg-[var(--primary-muted)]/10 p-3">
                  <input
                    type="text"
                    value={r.text}
                    onChange={(e) => updateRequirement(r.id, { text: e.target.value })}
                    className="min-w-0 flex-1 rounded border border-[var(--border)] bg-white px-2 py-1.5 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    placeholder="Requirement text"
                  />
                  <select
                    value={r.category}
                    onChange={(e) => updateRequirement(r.id, { category: e.target.value as CategoryKey })}
                    className="rounded border border-[var(--border)] bg-white px-2 py-1.5 text-sm focus:border-[var(--primary)]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.key} value={c.key}>{c.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeRequirement(r.id)}
                    className="rounded p-1.5 text-red-600 hover:bg-red-50"
                    aria-label="Remove requirement"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </li>
              ))}
            </ul>
            {requirements.length === 0 && (
              <p className="mt-4 text-sm text-[var(--text-muted)]">No requirements yet. Click &quot;Suggest with AI&quot; or &quot;Add requirement&quot;.</p>
            )}
            <div className="mt-8 flex justify-between">
              <button type="button" onClick={() => setStep(3)} className="rounded-xl border border-[var(--border)] px-6 py-2.5 font-medium text-[var(--foreground)] hover:bg-[var(--primary-muted)]">Back</button>
              <button type="button" onClick={() => setStep(5)} className="rounded-xl bg-[var(--primary)] px-6 py-2.5 font-semibold text-white hover:bg-[var(--primary-light)]">Next</button>
            </div>
          </div>
        )}

        {/* Step 5 – Review & submit */}
        {step === 5 && (
          <div className="rounded-2xl border border-[var(--border)] bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[var(--foreground)]">Step 5 – Review & submit</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              We&apos;ll generate a PDF draft and scoring sheet (CSV). You can view the scoring dashboard after.
            </p>
            <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--primary-muted)]/20 p-4 text-sm">
              <p><strong>{orgName}</strong> · {contactEmail}</p>
              <p className="mt-2 text-[var(--text-muted)]">{orgSize} · {budgetRange}</p>
              {orgType && <p className="text-[var(--text-muted)]">Org type: {orgType}</p>}
              {projectScope && <p className="text-[var(--text-muted)]">Scope: {projectScope}</p>}
              {complianceContext && <p className="text-[var(--text-muted)]">Compliance: {complianceContext}</p>}
              <p className="mt-2 text-[var(--text-muted)]">
                Weights: Integration {categoryWeights.integration}, Automation {categoryWeights.automation},
                Analytics {categoryWeights.analytics}, Compliance {categoryWeights.compliance}
              </p>
              <p className="mt-2 text-[var(--text-muted)]">Requirements: {requirements.length}</p>
            </div>
            {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
            <div className="mt-8 flex justify-between">
              <button type="button" onClick={() => setStep(4)} className="rounded-xl border border-[var(--border)] px-6 py-2.5 font-medium text-[var(--foreground)] hover:bg-[var(--primary-muted)]">Back</button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-xl bg-[var(--primary)] px-6 py-2.5 font-semibold text-white hover:bg-[var(--primary-light)] disabled:opacity-50"
              >
                {submitting ? "Submitting…" : "Submit & get PDF"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
