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

  const createPage = () => {
    const page = doc.addPage([595, 842]);
    const { height } = page.getSize();
    let y = height - 60;

    const draw = (text: string, x: number, size: number, bold = false, color = MUTED) => {
      const f = bold ? fontBold : font;
      page.drawText(text, { x, y, size, font: f, color: rgb(color.r, color.g, color.b) });
      y -= size + 4;
    };

    return { page, height, getY: () => y, setY: (value: number) => (y = value), draw };
  };

  let { page, height, getY, setY, draw } = createPage();
  let y = getY();

  const ensureSpace = (linesNeeded: number) => {
    if (y - linesNeeded * 14 < 60) {
      ({ page, height, getY, setY, draw } = createPage());
      y = getY();
    }
  };

  // Header
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

  // Organization profile
  draw("Organization profile", 50, 12, true, PRIMARY);
  draw(`Organization: ${data.orgName}`, 50, 10);
  draw(`Contact: ${data.contactEmail}`, 50, 10);
  draw(`Size: ${data.orgSize}`, 50, 10);
  draw(`Budget: ${data.budgetRange}`, 50, 10);
  if (data.orgType) draw(`Org type: ${data.orgType}`, 50, 10);
  if (data.projectScope) draw(`Project scope: ${data.projectScope}`, 50, 10);
  if (data.complianceContext) draw(`Compliance: ${data.complianceContext}`, 50, 10);
  y -= 16;

  // Category weights
  draw("Category weightings (1–5)", 50, 12, true, PRIMARY);
  for (const [key, value] of Object.entries(data.categoryWeights)) {
    draw(`${CATEGORY_LABELS[key as keyof CategoryWeights]}: ${value}/5`, 50, 10);
  }
  y -= 20;

  // Requirements – show full AI-generated list, across pages if needed
  if (data.requirements && data.requirements.length > 0) {
    draw("AI-generated requirements (draft)", 50, 12, true, PRIMARY);
    y -= 4;

    for (const r of data.requirements) {
      const priorityLabel = r.priority ? r.priority.toUpperCase() : "INFO";
      const prefix = `[${priorityLabel}] [${r.category}] `;
      const line = `${prefix}${r.text}`;

      // Simple word-wrapping at ~90 chars
      const wrapAt = 90;
      const chunks: string[] = [];
      let remaining = line;
      while (remaining.length > wrapAt) {
        const idx = remaining.lastIndexOf(" ", wrapAt);
        const splitAt = idx > 40 ? idx : wrapAt;
        chunks.push(remaining.slice(0, splitAt).trim());
        remaining = remaining.slice(splitAt).trim();
      }
      if (remaining.length) chunks.push(remaining);

      ensureSpace(chunks.length + 1);
      for (const chunk of chunks) {
        draw(chunk, 50, 9);
        y = getY();
      }
      y -= 2;
      setY(y);
    }

    y -= 16;
  }

  // Footer
  draw(`Generated: ${new Date(data.createdAt).toLocaleString()}`, 50, 9);
  draw("This draft includes AI-generated requirements. For a full paid RFP engagement, contact Flowopta.", 50, 9);

  return doc.save();
}
