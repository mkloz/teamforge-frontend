import {
  SkeletonCard,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function ExploreLensSkeleton() {
  return <ExploreLensSkeletonContent />;
}

function ExploreLensSkeletonContent() {
  return (
    <SkeletonCard
      aria-label="Loading explore lens"
      className="flex flex-col gap-5 p-4"
      role="status"
    >
      <SkeletonText lines={2} widths={["w-24", "w-44"]} />
      <div className="flex items-center gap-3">
        <Skeleton shape="circle" className="size-14" tone="teal" />
        <SkeletonText
          className="flex-1"
          lines={3}
          widths={["w-16", "w-full", "w-5/6"]}
        />
      </div>
      <SkeletonText
        lines={4}
        widths={["w-full", "w-11/12", "w-full", "w-3/4"]}
      />
      <div className="grid grid-cols-2 gap-2">
        {["one", "two", "three", "four"].map((item) => (
          <Skeleton key={item} className="h-16" />
        ))}
      </div>
    </SkeletonCard>
  );
}
