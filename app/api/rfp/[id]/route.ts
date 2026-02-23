import { NextRequest, NextResponse } from "next/server";
import { getRFP } from "@/lib/store";

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
    return NextResponse.json(record);
  } catch {
    return NextResponse.json({ error: "Failed to retrieve RFP" }, { status: 500 });
  }
}
