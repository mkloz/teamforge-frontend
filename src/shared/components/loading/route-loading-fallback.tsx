import { ForgeLoadingMark } from "@/shared/components/loading/forge-loading-mark";

export function RouteLoadingFallback() {
  return (
    <div
      className="loading-canvas-glow flex min-h-dvh items-center justify-center px-6 py-10 text-ink"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <ForgeLoadingMark label="Loading page" size="md" />
    </div>
  );
}
