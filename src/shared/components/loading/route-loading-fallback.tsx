import { LoadingBlock } from "@/shared/components/loading/loading-block";

export function RouteLoadingFallback() {
  return (
    <div
      className="flex min-h-96 items-center justify-center px-6 py-10"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <div className="flex w-full max-w-sm flex-col items-center gap-4 text-center">
        <div className="relative flex size-14 items-center justify-center rounded-2xl border border-forge-teal/20 bg-forge-teal/8 shadow-teal-glow">
          <LoadingBlock className="size-7 rounded-lg bg-forge-teal/24" />
        </div>
        <div className="flex w-full flex-col items-center gap-2">
          <LoadingBlock className="h-4 w-36 rounded-md" />
          <LoadingBlock className="h-3 w-48 rounded-md" />
        </div>
      </div>
    </div>
  );
}
