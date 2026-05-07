import { Loader2 } from "lucide-react";

export function RouteLoadingFallback() {
  return (
    <div
      className="flex min-h-[min(32rem,calc(100vh-4rem))] items-center justify-center px-6 py-10"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative flex size-14 items-center justify-center rounded-2xl border border-forge-teal/20 bg-forge-teal/8 text-forge-teal shadow-teal-glow">
          <Loader2 className="size-6 animate-spin" strokeWidth={1.8} />
          <span className="absolute inset-0 rounded-2xl ring-1 ring-forge-teal/10" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-ink">Preparing TeamForge</p>
          <p className="text-xs font-medium text-slate-muted">
            Warming up this page.
          </p>
        </div>
      </div>
    </div>
  );
}
