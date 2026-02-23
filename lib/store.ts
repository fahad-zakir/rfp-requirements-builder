/**
 * In-memory store for RFP submissions and consulting leads (demo).
 * Replace with MongoDB Atlas for production.
 */

import type { CategoryWeights } from "./rfp";

export interface RFPRequirementRecord {
  id: string;
  text: string;
  category: string;
  priority?: "must" | "should" | "nice";
}

export interface RFPRecord {
  id: string;
  orgName: string;
  contactEmail: string;
  orgSize: string;
  budgetRange: string;
  orgType?: string;
  projectScope?: string;
  complianceContext?: string;
  categoryWeights: CategoryWeights;
  requirements: RFPRequirementRecord[];
  createdAt: string;
}

export interface ConsultingLead {
  id: string;
  rfpId?: string;
  name: string;
  email: string;
  organization: string;
  message?: string;
  createdAt: string;
}

const rfps = new Map<string, RFPRecord>();
const consultingLeads = new Map<string, ConsultingLead>();

function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export function saveRFP(record: Omit<RFPRecord, "id" | "createdAt">): RFPRecord {
  const id = generateId("rfp");
  const createdAt = new Date().toISOString();
  const full: RFPRecord = { ...record, id, createdAt, requirements: record.requirements ?? [] };
  rfps.set(id, full);
  return full;
}

export function getRFP(id: string): RFPRecord | undefined {
  return rfps.get(id);
}

export function saveConsultingLead(lead: Omit<ConsultingLead, "id" | "createdAt">): ConsultingLead {
  const id = generateId("lead");
  const createdAt = new Date().toISOString();
  const full: ConsultingLead = { ...lead, id, createdAt };
  consultingLeads.set(id, full);
  return full;
}

export function getConsultingLeads(): ConsultingLead[] {
  return Array.from(consultingLeads.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getAdminStats(): {
  totalRfps: number;
  totalLeads: number;
  rfpsByCompliance: Record<string, number>;
} {
  const all = Array.from(rfps.values());
  const byCompliance: Record<string, number> = {};
  for (const r of all) {
    const key = r.complianceContext || "unspecified";
    byCompliance[key] = (byCompliance[key] || 0) + 1;
  }
  return {
    totalRfps: all.length,
    totalLeads: consultingLeads.size,
    rfpsByCompliance: byCompliance,
  };
}
