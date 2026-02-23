# RFP Requirements Builder (Product Spec v2.0)

A web app for healthcare organizations to create, customize, analyze, and export RFPs. HIPAA/FHIR-aware; consulting engagement triggers for lead conversion.

## Tech stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 (light health-tech theme, mobile responsive)
- **Charts:** Recharts (Scoring Dashboard, Admin analytics)
- **PDF/CSV:** pdf-lib (draft document, scoring sheet)
- **AI (optional):** OpenAI API for requirement suggestions (falls back to demo suggestions without key)
- **Data (demo):** In-memory store (replace with MongoDB Atlas for production)
- **Auth (optional):** NextAuth can be added for Landing & Auth; demo uses “Get started” onboarding

## Prerequisites

- Node.js v20 LTS (or v18+)
- npm 10+ or pnpm 8+
- Optional: `OPENAI_API_KEY` for AI requirement suggestions

## Quick start

```bash
cd rfp-requirements-builder
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Functional modules (v2.0)

1. **Landing & onboarding** – Trust copy, HIPAA/FHIR messaging, “Get started” CTA.
2. **Organization setup** – Org name, contact email, size, budget; org type, project scope, compliance context (HIPAA/FHIR).
3. **Requirement builder** – Add, edit, remove requirements; **Suggest with AI** (OpenAI or demo).
4. **Scoring dashboard** – Readiness score (0–100), category weights chart, PDF/CSV download.
5. **Consulting engagement** – “Book expert review” CTA on success page; lead stored (SendGrid optional).
6. **Admin dashboard** – Total RFPs, consulting leads, RFPs by compliance context (charts).

## How to use

1. **Home** – Click **Get started**.
2. **Step 1 – Organization setup** – Required: org name, email, size, budget. Optional: org type, project scope, compliance context. Inline help on fields.
3. **Step 2 – Category selection** – Review Integration, Automation, Analytics, Compliance.
4. **Step 3 – Weighting (1–5)** – Sliders for each category.
5. **Step 4 – Requirement builder** – Add requirements manually or click **Suggest with AI** (healthcare best-practice suggestions). Edit category per requirement; remove as needed.
6. **Step 5 – Review & submit** – Confirm and **Submit & get PDF**.
7. **Success** – Download **PDF draft**, **Scoring sheet (CSV)**, open **Scoring dashboard**. Optional: **Book expert review** (consulting lead form).
8. **Admin** – Visit `/admin` for analytics and consulting leads list.

## API

| Method | Endpoint | Purpose |
|--------|----------|--------|
| POST | `/api/rfp/create` | Save RFP; body: `orgName`, `contactEmail`, `orgSize`, `budgetRange`, optional `orgType`, `projectScope`, `complianceContext`, `categoryWeights`, `requirements[]`. Returns `{ id, orgName, contactEmail, createdAt }`. |
| GET | `/api/rfp/:id` | Get RFP by ID. |
| GET | `/api/rfp/:id/pdf` | Download PDF draft. |
| GET | `/api/rfp/:id/scoring-sheet` | Download CSV scoring sheet (Excel-compatible). |
| POST | `/api/rfp/ai-suggest` | AI requirement suggestions; body: `context`, `category`, `count`. Uses OpenAI if `OPENAI_API_KEY` set; else demo suggestions. |
| POST | `/api/consulting-lead` | Save consulting lead; body: `name`, `email`, `organization`, optional `message`, `rfpId`. |
| GET | `/api/admin/stats` | Admin stats: `totalRfps`, `totalLeads`, `rfpsByCompliance`. |
| GET | `/api/admin/leads` | List consulting leads. |

## Non-functional (v2.0)

- **Usability:** Inline validation and help on forms; mobile responsive (Tailwind).
- **Performance:** Page load and API response targets (optimize as needed for &lt;2s / &lt;800ms).
- **Security:** HTTPS in production; env vars for secrets; no PHI stored.
- **Compliance:** No PHI; HIPAA-ready design for Enterprise tier.
- **Maintainability:** TypeScript; APIs documented here (OpenAPI spec can be added).

## Production checklist

- [ ] NextAuth for authentication (credentials or OAuth).
- [ ] MongoDB Atlas (or other DB); replace `lib/store.ts`.
- [ ] OpenAI API key for AI suggestions (`OPENAI_API_KEY`).
- [ ] SendGrid (or similar) for consulting lead emails and optional RFP follow-up.
- [ ] Full accessibility audit and E2E QA before Vercel deployment.

## License

Internal / Flowopta use. See Flowopta Product Specification v2.0 (Feb 2026).
# rfp-requirements-builder
