import { Suspense } from "react";
import DashboardContent from "./DashboardContent";

function DashboardFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
      <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardContent />
    </Suspense>
  );
}
