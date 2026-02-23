import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const MOCK_SUGGESTIONS = [
  "Vendor must support FHIR R4 for clinical data exchange.",
  "Solution shall provide audit logging for all PHI access (HIPAA).",
  "System must support SSO (SAML 2.0 or OAuth 2.0) for enterprise identity.",
  "API response time for read operations shall be under 500ms at p95.",
  "Vendor shall provide BAA and evidence of HIPAA compliance program.",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { context = "", category = "compliance", count = 5 } = body;

    if (!openaiClient || !process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        suggestions: MOCK_SUGGESTIONS.slice(0, Math.min(count, 5)),
        source: "demo",
      });
    }

    const prompt = `You are a healthcare RFP expert. Suggest ${count} concise, actionable RFP requirements for a healthcare organization. Context: ${context || "general healthcare procurement"}. Category focus: ${category}. Each requirement should be one sentence, start with "Must" or "Shall" or "Should", and align with HIPAA/FHIR where relevant. Return only the requirement text, one per line, no numbering.`;

    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content?.trim() || "";
    const suggestions = content
      .split("\n")
      .map((s) => s.replace(/^\d+\.\s*/, "").trim())
      .filter(Boolean)
      .slice(0, count);

    return NextResponse.json({ suggestions, source: "openai" });
  } catch (err) {
    console.error("[ai-suggest]", err);
    return NextResponse.json(
      { error: "AI suggestion failed", suggestions: MOCK_SUGGESTIONS.slice(0, 5) },
      { status: 200 }
    );
  }
}
