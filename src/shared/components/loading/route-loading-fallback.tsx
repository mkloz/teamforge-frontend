import { PlanLoadingMark } from "@/shared/components/loading/plan-loading-mark";

export function RouteLoadingFallback() {
  return (
    <div className="loading-canvas-glow flex min-h-dvh items-center justify-center px-6 py-10 text-ink">
      <PlanLoadingMark label="Loading page" size="md" />
    </div>
  );
}
