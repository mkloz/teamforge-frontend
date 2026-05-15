import { SkeletonText } from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function ExploreLensSkeleton() {
  return <ExploreLensSkeletonContent />;
}

function ExploreLensSkeletonContent() {
  return (
    <section
      aria-label="Loading explore lens"
      className="flex flex-col gap-4 px-1 py-1"
      role="status"
    >
      <div className="flex items-center gap-2.5">
        <Skeleton shape="circle" className="size-9 shrink-0" tone="teal" />
        <SkeletonText
          className="min-w-0 flex-1"
          lines={2}
          size="sm"
          widths={["w-28", "w-44"]}
        />
      </div>
      <SkeletonText lines={3} widths={["w-full", "w-11/12", "w-3/4"]} />
      <div className="flex flex-col gap-2">
        {["timing", "join", "place"].map((item) => (
          <div key={item} className="flex items-start gap-3">
            <Skeleton
              shape="circle"
              className="mt-1 size-3.5 shrink-0"
              tone="teal"
            />
            <Skeleton className="h-4 min-w-0 flex-1" />
          </div>
        ))}
      </div>
    </section>
  );
}
