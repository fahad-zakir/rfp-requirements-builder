"use client";

import { useState } from "react";
import Link from "next/link";
import GuideAvatar from "./GuideAvatar";
import AgentBubble from "./AgentBubble";

const GREETING =
  "Hi! I'm your FlowOpta guide. I can help you create, customize, and analyze healthcare RFP requirements efficiently. Built-in HIPAA and FHIR awareness. You'll get a scoring dashboard, PDF export, and expert review options. How would you like to start?";

export default function AgentHero() {
  const [bubbleDone, setBubbleDone] = useState(true);

  return (
    <section className="relative min-h-[85vh] overflow-hidden">
      {/* Background: subtle mesh gradient */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -20%, var(--glow), transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 60%, rgba(16, 185, 129, 0.1), transparent 45%),
            radial-gradient(ellipse 50% 30% at 20% 80%, rgba(37, 99, 235, 0.08), transparent 40%)
          `,
        }}
      />
      <div className="relative mx-auto max-w-4xl px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28">
        <div className="flex flex-col items-center text-center">
          <GuideAvatar size="lg" animated className="mb-8" />
          <h1
            className="font-display text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl md:text-6xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            How can I help?
          </h1>
          <p className="mt-3 max-w-xl text-lg text-[var(--text-muted)]">
            Your RFP Requirements Builder—guided, fast, and insightful.
          </p>

          <div className="mt-10 w-full max-w-2xl text-left">
            <AgentBubble
              message={GREETING}
              onComplete={() => setBubbleDone(true)}
              typingDelay={8}
              showAvatar={true}
              instant={true}
            />
          </div>

          <div
            className={`mt-10 flex flex-col gap-4 sm:flex-row sm:gap-6 transition-all duration-300 ${
              bubbleDone ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <Link
              href="/rfp"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-[var(--primary)]/25 transition hover:bg-[var(--primary-light)] hover:shadow-[var(--primary)]/30 hover:scale-[1.02]"
            >
              <span>Guide me through it</span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/rfp"
              className="inline-flex items-center justify-center rounded-2xl border-2 border-[var(--border)] bg-transparent px-8 py-4 text-base font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:bg-[var(--primary-muted)] hover:text-[var(--primary)]"
            >
              I'll do it myself
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
