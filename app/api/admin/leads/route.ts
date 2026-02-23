import { NextResponse } from "next/server";
import { getConsultingLeads } from "@/lib/store";

export async function GET() {
  try {
    const leads = getConsultingLeads();
    return NextResponse.json(leads);
  } catch {
    return NextResponse.json(
      { error: "Failed to load leads" },
      { status: 500 }
    );
  }
}
