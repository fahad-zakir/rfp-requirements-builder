import { NextRequest, NextResponse } from "next/server";
import { saveConsultingLead } from "@/lib/store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, organization, message, rfpId } = body;

    if (!name?.trim() || !email?.trim() || !organization?.trim()) {
      return NextResponse.json(
        { error: "Missing required: name, email, organization" },
        { status: 400 }
      );
    }

    const lead = saveConsultingLead({
      name: String(name).trim(),
      email: String(email).trim(),
      organization: String(organization).trim(),
      message: message ? String(message).trim() : undefined,
      rfpId: rfpId ? String(rfpId) : undefined,
    });

    if (process.env.NODE_ENV === "development") {
      console.log("[Consulting lead]", { id: lead.id, email: lead.email });
    }

    return NextResponse.json({ id: lead.id, success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
