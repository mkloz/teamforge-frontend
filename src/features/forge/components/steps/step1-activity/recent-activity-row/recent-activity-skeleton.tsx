import {
  SkeletonCard,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function RecentActivitySkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading recent activities"
      className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3"
      role="status"
    >
      <span className="sr-only">Loading recent activities</span>
      {["first", "second", "third"].map((item, index) => (
        <SkeletonCard key={item} className="p-3">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <Skeleton
                shape="square"
                className="size-10"
                tone={index === 1 ? "teal" : "default"}
              />
              <Skeleton
                shape="pill"
                className="h-6 w-16"
                tone={index === 1 ? "amber" : "default"}
              />
            </div>
            <SkeletonText lines={3} widths={["w-3/5", "w-full", "w-2/3"]} />
          </div>
        </SkeletonCard>
      ))}
    </div>
  );
}
