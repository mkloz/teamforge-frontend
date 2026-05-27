import { TeamForgeLogo } from "@/assets/logo";

export function RouteLoadingFallback() {
  return (
    <div
      className="flex min-h-96 items-center justify-center bg-canvas px-6 py-10 text-ink"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <div className="flex w-full max-w-sm flex-col items-center gap-5 text-center">
        <div className="relative flex size-24 items-center justify-center">
          <span
            className="absolute inset-0 rounded-full border border-forge-teal/15"
            aria-hidden="true"
          />
          <span
            className="absolute inset-2 animate-spin rounded-full border border-transparent border-t-forge-teal/70 border-r-spark-amber/70 motion-reduce:animate-none"
            aria-hidden="true"
          />
          <span
            className="absolute inset-5 animate-pulse-glow rounded-2xl border border-forge-teal/20 bg-forge-teal/8 shadow-teal-glow motion-reduce:animate-none"
            aria-hidden="true"
          />
          <TeamForgeLogo
            className="relative z-10 size-10"
            showBackground={false}
          />
          <span
            className="absolute top-5 -right-1 size-2 rounded-full bg-spark-amber"
            aria-hidden="true"
          />
          <span
            className="absolute bottom-4 left-2 size-1.5 rounded-full bg-forge-teal"
            aria-hidden="true"
          />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="font-black text-foreground text-sm">
            Opening TeamForge
          </p>
          <p className="max-w-52 font-medium text-slate-muted text-xs leading-relaxed">
            Preparing the next screen.
          </p>
        </div>
        <div
          className="flex items-center gap-1.5 text-forge-teal"
          aria-hidden="true"
        >
          <span className="size-1.5 animate-pulse rounded-full bg-current" />
          <span className="size-1.5 animate-pulse rounded-full bg-current opacity-70" />
          <span className="size-1.5 animate-pulse rounded-full bg-current opacity-40" />
        </div>
      </div>
    </div>
  );
}
