import { NextRequest, NextResponse } from "next/server";
import { getRFP } from "@/lib/store";
import { generateRFPPdf } from "@/lib/pdf";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const record = getRFP(id);
    if (!record) {
      return NextResponse.json({ error: "RFP not found" }, { status: 404 });
    }

    const pdfBytes = await generateRFPPdf({
      orgName: record.orgName,
      contactEmail: record.contactEmail,
      orgSize: record.orgSize,
      budgetRange: record.budgetRange,
      orgType: record.orgType,
      projectScope: record.projectScope,
      complianceContext: record.complianceContext,
      categoryWeights: record.categoryWeights,
      requirements: record.requirements?.map((r) => ({ text: r.text, category: r.category, priority: r.priority })),
      createdAt: record.createdAt,
    });

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="flowopta-rfp-draft-${id}.pdf"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
