import { SkeletonText } from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function RecentActivitySkeleton() {
  return (
    <div aria-busy="true" className="flex gap-2.5 overflow-hidden">
      <output className="sr-only">Loading recent activities</output>
      {["first", "second", "third"].map((item) => (
        <div
          key={item}
          className="flex h-16 min-w-[86%] overflow-hidden rounded-xl border border-border/40 bg-card sm:min-w-0 sm:flex-1"
        >
          <Skeleton className="h-full w-16 shrink-0 rounded-none" />
          <div className="flex min-w-0 flex-1 items-center px-3 py-2.5">
            <SkeletonText
              className="min-w-0 flex-1 gap-1.5"
              lines={2}
              size="sm"
              widths={["w-3/5", "w-2/5"]}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
