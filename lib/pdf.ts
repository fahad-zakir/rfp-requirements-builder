/**
 * PDF draft document for RFP Requirements Builder
 */

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import type { CategoryWeights } from "./rfp";

export interface RFPForPdf {
  orgName: string;
  contactEmail: string;
  orgSize: string;
  budgetRange: string;
  orgType?: string;
  projectScope?: string;
  complianceContext?: string;
  categoryWeights: CategoryWeights;
  requirements?: { text: string; category: string; priority?: string }[];
  createdAt: string;
}

const PRIMARY = { r: 0.31, g: 0.27, b: 0.9 };
const MUTED = { r: 0.39, g: 0.45, b: 0.58 };

const CATEGORY_LABELS: Record<keyof CategoryWeights, string> = {
  integration: "Integration",
  automation: "Automation",
  analytics: "Analytics",
  compliance: "Compliance",
};

export async function generateRFPPdf(data: RFPForPdf): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([595, 842]);
  const { height } = page.getSize();
  let y = height - 60;

  const draw = (text: string, x: number, size: number, bold = false, color = MUTED) => {
    const f = bold ? fontBold : font;
    page.drawText(text, { x, y, size, font: f, color: rgb(color.r, color.g, color.b) });
    y -= size + 4;
  };

  page.drawText("Flowopta", {
    x: 50,
    y,
    size: 22,
    font: fontBold,
    color: rgb(PRIMARY.r, PRIMARY.g, PRIMARY.b),
  });
  y -= 28;
  draw("RFP Requirements – Draft Document", 50, 14, true);
  y -= 24;

  draw("Organization profile", 50, 12, true, PRIMARY);
  draw(`Organization: ${data.orgName}`, 50, 10);
  draw(`Contact: ${data.contactEmail}`, 50, 10);
  draw(`Size: ${data.orgSize}`, 50, 10);
  draw(`Budget: ${data.budgetRange}`, 50, 10);
  if (data.orgType) draw(`Org type: ${data.orgType}`, 50, 10);
  if (data.projectScope) draw(`Project scope: ${data.projectScope}`, 50, 10);
  if (data.complianceContext) draw(`Compliance: ${data.complianceContext}`, 50, 10);
  y -= 16;

  draw("Category weightings (1–5)", 50, 12, true, PRIMARY);
  for (const [key, value] of Object.entries(data.categoryWeights)) {
    draw(`${CATEGORY_LABELS[key as keyof CategoryWeights]}: ${value}/5`, 50, 10);
  }
  y -= 20;

  if (data.requirements && data.requirements.length > 0) {
    draw("Requirements", 50, 12, true, PRIMARY);
    for (const r of data.requirements.slice(0, 20)) {
      const line = r.priority ? `[${r.priority}] ${r.text}` : r.text;
      if (line.length > 70) {
        draw(line.slice(0, 70), 50, 9);
        draw(line.slice(70, 140) || "", 50, 9);
      } else draw(line, 50, 9);
    }
    y -= 16;
  }

  draw(`Generated: ${new Date(data.createdAt).toLocaleString()}`, 50, 9);
  draw("This is a draft for discussion. Contact Flowopta for a full RFP template.", 50, 9);

  return doc.save();
}
