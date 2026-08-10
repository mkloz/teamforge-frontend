import { LoadingBlock } from "@/shared/components/loading/loading-block";

export function CompletedRatingsSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3 py-1">
      <span className="sr-only">Loading completed plan details</span>
      <div className="flex w-full max-w-sm flex-col items-center gap-2">
        <LoadingBlock className="h-4 w-44 rounded-full bg-primary-soft" />
        <LoadingBlock className="h-3 w-64 max-w-full rounded-full" />
      </div>
      <div className="flex w-full justify-center gap-2">
        <LoadingBlock className="h-8 w-36 rounded-lg" />
        <LoadingBlock className="h-8 w-32 rounded-lg bg-primary-soft" />
      </div>
    </div>
  );
}
