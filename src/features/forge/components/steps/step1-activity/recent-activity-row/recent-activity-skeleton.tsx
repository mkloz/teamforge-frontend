import { SkeletonText } from "@/shared/components/loading/skeleton-patterns";
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
        <div
          key={item}
          className="group flex h-14 min-w-0 overflow-hidden rounded-lg border border-border/40 bg-card text-left"
        >
          <Skeleton
            shape="square"
            className="h-full w-14 shrink-0 rounded-lg"
            tone={index === 1 ? "teal" : "default"}
          />
          <div className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-2">
            <SkeletonText
              className="min-w-0 flex-1 gap-1.5"
              lines={2}
              size="sm"
              widths={["w-4/5", "w-3/5"]}
            />
            {index === 1 ? (
              <Skeleton shape="circle" className="size-5" tone="amber" />
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
