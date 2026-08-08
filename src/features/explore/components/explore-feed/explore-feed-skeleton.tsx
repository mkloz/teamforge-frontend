import { Skeleton } from "@/shared/components/ui/skeleton";

const EXPLORE_CARD_SKELETONS = ["lead", "secondary", "third"] as const;

export function ExploreFeedSkeleton() {
  return (
    <div aria-busy="true">
      <output className="sr-only">Loading explore groups</output>

      <div className="flex items-end justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-36" />
          <Skeleton className="mt-2 h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-4 w-20 shrink-0" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-12">
        {EXPLORE_CARD_SKELETONS.map((key, index) => (
          <div key={key} className={getSkeletonSlotClassName(index)}>
            <div className="relative size-full min-h-92 overflow-hidden rounded-[1.25rem] bg-card shadow-soft-sm md:min-h-0">
              <Skeleton
                className="absolute inset-0 size-full rounded-none"
                tone={index === 0 ? "teal" : "default"}
              />
              <div className="absolute inset-x-0 bottom-0 border-border/50 border-t bg-canvas/85 p-5">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="mt-3 h-8 w-4/5" />
                <Skeleton className="mt-3 h-4 w-full" />
                <div className="mt-4 grid grid-cols-2 gap-2 border-border/50 border-t pt-3">
                  <Skeleton className="h-4 w-32 max-w-full" />
                  <Skeleton className="h-4 w-24 max-w-full" />
                  <Skeleton className="h-4 w-28 max-w-full" />
                  <Skeleton className="h-4 w-16 max-w-full" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getSkeletonSlotClassName(index: number) {
  if (index === 0) {
    return "h-[29rem] md:col-span-7";
  }

  if (index === 1) {
    return "h-[29rem] md:col-span-5";
  }

  return "h-[24rem] md:col-span-4";
}
