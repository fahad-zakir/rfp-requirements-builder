import { NextResponse } from "next/server";
import { getAdminStats } from "@/lib/store";

export async function GET() {
  try {
    const stats = getAdminStats();
    return NextResponse.json(stats);
  } catch {
    return NextResponse.json(
      { error: "Failed to load stats" },
      { status: 500 }
    );
  }
}
