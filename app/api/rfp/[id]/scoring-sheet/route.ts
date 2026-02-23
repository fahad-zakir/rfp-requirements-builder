import { NextRequest, NextResponse } from "next/server";
import { getRFP } from "@/lib/store";
import { CATEGORIES } from "@/lib/rfp";

/**
 * Mini RFP Scoring Sheet – CSV download (Excel-compatible)
 * Lead magnet after RFP submission per Flowopta spec.
 */
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

    const headers = ["Category", "Weight (1-5)", "Vendor Score (1-5)", "Weighted Score", "Notes"];
    const rows = CATEGORIES.map((c) => {
      const w = record.categoryWeights[c.key];
      return [c.name, w, "", "", ""];
    });
    const csv = [headers.join(","), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(","))].join("\n");
    const bom = "\uFEFF";
    const blob = new TextEncoder().encode(bom + csv);

    return new NextResponse(Buffer.from(blob), {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="flowopta-rfp-scoring-sheet-${id}.csv"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to generate scoring sheet" }, { status: 500 });
  }
}
