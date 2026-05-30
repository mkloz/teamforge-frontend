import { ForgeLoadingMark } from "@/shared/components/loading/forge-loading-mark";

export function RouteLoadingFallback() {
  return (
    <div
      className="flex min-h-96 items-center justify-center bg-canvas px-6 py-10 text-ink"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <ForgeLoadingMark label="Loading page" size="md" />
    </div>
  );
}
