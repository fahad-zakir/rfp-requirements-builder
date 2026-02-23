import Link from "next/link";
import AgentHero from "./components/AgentHero";
import Logo from "./components/Logo";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6 py-2">
          <Logo href="/" size="md" />
          <nav className="flex gap-1">
            <Link href="/rfp" className="rounded-xl px-4 py-2 text-sm font-semibold text-[var(--text-muted)] transition-colors hover:bg-[var(--primary-muted)] hover:text-[var(--primary)]">
              RFP Builder
            </Link>
            <Link href="/admin" className="rounded-xl px-4 py-2 text-sm font-semibold text-[var(--text-muted)] transition-colors hover:bg-[var(--primary-muted)] hover:text-[var(--primary)]">
              Admin
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <AgentHero />

        <section className="relative border-t border-[var(--border)] py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="text-center font-display text-2xl font-bold text-[var(--foreground)] sm:text-3xl" style={{ fontFamily: "var(--font-display)" }}>
              What you get
            </h2>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {[
                {
                  title: "Organization setup",
                  desc: "Org type, project scope, and HIPAA/FHIR compliance context.",
                },
                {
                  title: "Requirement builder",
                  desc: "Generate, adjust, and manage requirement sets with AI assist.",
                },
                {
                  title: "Scoring dashboard",
                  desc: "Visualize readiness with charts and summary metrics.",
                },
                {
                  title: "Consulting engagement",
                  desc: "Book an expert review and get tailored advice.",
                },
                {
                  title: "PDF & CSV export",
                  desc: "Draft document and scoring sheet (Excel-compatible).",
                },
                {
                  title: "Compliance",
                  desc: "No PHI stored; HIPAA-ready design for Enterprise tier.",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-lg transition hover:border-[var(--primary)]/30 hover:shadow-[var(--primary)]/5"
                >
                  <div className="text-xl font-semibold text-[var(--primary)]" style={{ fontFamily: "var(--font-display)" }}>
                    {card.title}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] bg-[var(--background-soft)] py-8">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-[var(--text-muted)]">
          FlowOpta – RFP Requirements Builder. Non-PHI data only. HIPAA/FHIR-aware.
        </div>
      </footer>
    </div>
  );
}
