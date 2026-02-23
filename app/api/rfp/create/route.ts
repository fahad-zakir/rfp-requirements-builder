import { NextRequest, NextResponse } from "next/server";
import { saveRFP } from "@/lib/store";
import { validateWeights, defaultWeights, type CategoryWeights } from "@/lib/rfp";
import type { RFPRequirementRecord } from "@/lib/store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orgName,
      contactEmail,
      orgSize,
      budgetRange,
      orgType,
      projectScope,
      complianceContext,
      categoryWeights,
      requirements,
    } = body;

    if (!orgName || !contactEmail || !orgSize || !budgetRange) {
      return NextResponse.json(
        { error: "Missing required: orgName, contactEmail, orgSize, budgetRange" },
        { status: 400 }
      );
    }

    const weights: CategoryWeights = categoryWeights ?? defaultWeights();
    if (!validateWeights(weights)) {
      return NextResponse.json(
        { error: "categoryWeights must have integration, automation, analytics, compliance (each 1–5)" },
        { status: 400 }
      );
    }

    const reqList: RFPRequirementRecord[] = Array.isArray(requirements)
      ? requirements.map((r: { id?: string; text: string; category: string; priority?: string }) => ({
          id: r.id || `req_${Math.random().toString(36).slice(2, 9)}`,
          text: String(r.text).trim(),
          category: String(r.category || "compliance"),
          priority: r.priority === "must" || r.priority === "should" || r.priority === "nice" ? r.priority : undefined,
        }))
      : [];

    const record = saveRFP({
      orgName: String(orgName).trim(),
      contactEmail: String(contactEmail).trim(),
      orgSize: String(orgSize).trim(),
      budgetRange: String(budgetRange).trim(),
      orgType: orgType ? String(orgType).trim() : undefined,
      projectScope: projectScope ? String(projectScope).trim() : undefined,
      complianceContext: complianceContext ? String(complianceContext).trim() : undefined,
      categoryWeights: weights,
      requirements: reqList,
    });

    if (process.env.NODE_ENV === "development") {
      console.log("[RFP created]", { id: record.id, email: record.contactEmail });
    }

    return NextResponse.json({
      id: record.id,
      orgName: record.orgName,
      contactEmail: record.contactEmail,
      createdAt: record.createdAt,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
