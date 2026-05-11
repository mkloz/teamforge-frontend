import { LoadingBlock } from "@/shared/components/loading/loading-block";

export function LoadingOlderIndicator() {
  return (
    <div className="absolute top-0 right-0 left-0 z-20 flex justify-center py-2">
      <div className="rounded-full border border-border/60 bg-canvas/90 px-3 py-1 shadow-sm backdrop-blur-sm">
        <span className="sr-only">Loading earlier messages</span>
        <LoadingBlock className="h-2.5 w-28 rounded-full" />
      </div>
    </div>
  );
}
