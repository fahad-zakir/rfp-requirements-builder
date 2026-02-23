/**
 * RFP Requirements Builder v2 – categories, org setup, compliance context
 * HIPAA/FHIR-aware; healthcare best-practice requirements.
 */

export const CATEGORIES = [
  { key: "integration", name: "Integration", description: "EHR, scheduling, billing, and system-to-system data exchange" },
  { key: "automation", name: "Automation", description: "Workflow automation, rules, and process efficiency" },
  { key: "analytics", name: "Analytics", description: "Reporting, dashboards, and data-driven decision support" },
  { key: "compliance", name: "Compliance", description: "Regulatory, audit, and governance requirements" },
] as const;

export type CategoryKey = (typeof CATEGORIES)[number]["key"];

export const ORG_SIZES = [
  { value: "small", label: "Small (1–50 FTE)" },
  { value: "mid", label: "Mid-size (51–250 FTE)" },
  { value: "large", label: "Large (251+ FTE)" },
] as const;

export const BUDGET_RANGES = [
  { value: "under-100k", label: "Under $100K" },
  { value: "100k-500k", label: "$100K – $500K" },
  { value: "500k-1m", label: "$500K – $1M" },
  { value: "over-1m", label: "Over $1M" },
] as const;

export const ORG_TYPES = [
  { value: "hospital", label: "Hospital / Health system" },
  { value: "clinic", label: "Clinic / Physician group" },
  { value: "payor", label: "Payor / Payer" },
  { value: "vendor", label: "Vendor / Technology provider" },
  { value: "other", label: "Other" },
] as const;

export const PROJECT_SCOPES = [
  { value: "ehr-integration", label: "EHR / system integration" },
  { value: "workflow-automation", label: "Workflow automation" },
  { value: "analytics-reporting", label: "Analytics & reporting" },
  { value: "compliance-audit", label: "Compliance & audit" },
  { value: "multi", label: "Multiple areas" },
] as const;

export const COMPLIANCE_CONTEXT = [
  { value: "hipaa", label: "HIPAA alignment required" },
  { value: "fhir", label: "FHIR / interoperability focus" },
  { value: "both", label: "Both HIPAA and FHIR" },
  { value: "general", label: "General healthcare compliance" },
] as const;

export type OrgSize = (typeof ORG_SIZES)[number]["value"];
export type BudgetRange = (typeof BUDGET_RANGES)[number]["value"];
export type OrgType = (typeof ORG_TYPES)[number]["value"];
export type ProjectScope = (typeof PROJECT_SCOPES)[number]["value"];
export type ComplianceContext = (typeof COMPLIANCE_CONTEXT)[number]["value"];

export interface RFPProfile {
  orgName: string;
  contactEmail: string;
  orgSize: OrgSize;
  budgetRange: BudgetRange;
  orgType?: OrgType;
  projectScope?: ProjectScope;
  complianceContext?: ComplianceContext;
}

export interface CategoryWeights {
  integration: number;
  automation: number;
  analytics: number;
  compliance: number;
}

export interface RFPRequirement {
  id: string;
  text: string;
  category: CategoryKey;
  priority?: "must" | "should" | "nice";
}

export function defaultWeights(): CategoryWeights {
  return { integration: 3, automation: 3, analytics: 3, compliance: 3 };
}

export function validateWeights(w: CategoryWeights): boolean {
  const keys: CategoryKey[] = ["integration", "automation", "analytics", "compliance"];
  return keys.every((k) => typeof w[k] === "number" && w[k] >= 1 && w[k] <= 5);
}

/** Readiness score 0–100 from weights and requirement count */
export function computeReadinessScore(weights: CategoryWeights, requirementCount: number): number {
  const avgWeight = (weights.integration + weights.automation + weights.analytics + weights.compliance) / 4;
  const weightScore = (avgWeight / 5) * 60;
  const reqScore = Math.min(requirementCount * 2, 40);
  return Math.round(weightScore + reqScore);
}
