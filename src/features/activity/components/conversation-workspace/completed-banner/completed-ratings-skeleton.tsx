import { LoadingBlock } from "@/shared/components/loading/loading-block";

export function CompletedRatingsSkeleton() {
  return (
    <div className="flex flex-col gap-3 py-1">
      <span className="sr-only">Loading reviews</span>
      <div className="flex gap-2 overflow-hidden pb-1">
        <LoadingBlock className="h-8 w-24 shrink-0 rounded-lg bg-primary/12" />
        <LoadingBlock className="h-8 w-28 shrink-0 rounded-lg" />
        <LoadingBlock className="h-8 w-24 shrink-0 rounded-lg" />
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-border/70 bg-card/65 p-3">
        <div className="mb-3 flex items-center justify-center gap-1.5">
          <LoadingBlock className="size-6 rounded-full bg-accent/18" />
          <LoadingBlock className="size-6 rounded-full bg-accent/18" />
          <LoadingBlock className="size-6 rounded-full bg-accent/18" />
          <LoadingBlock className="size-6 rounded-full" />
          <LoadingBlock className="size-6 rounded-full" />
        </div>
        <LoadingBlock className="h-16 rounded-lg" />
      </div>
    </div>
  );
}
