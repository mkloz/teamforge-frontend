import {
  SkeletonCard,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function InterestsCatalogSkeleton() {
  return <InterestsCatalogSkeletonContent />;
}

function InterestsCatalogSkeletonContent() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading interests"
      className="grid gap-4"
      role="status"
    >
      <span className="sr-only">Loading interests</span>
      <SkeletonCard className="p-4">
        <SkeletonText lines={2} widths={["w-32", "w-72"]} />
        <div className="mt-4 flex flex-wrap gap-2">
          {["suggested", "local", "creative", "active"].map((item, index) => (
            <Skeleton
              key={item}
              shape="pill"
              className="h-9 w-24"
              tone={index === 0 ? "teal" : "default"}
            />
          ))}
        </div>
      </SkeletonCard>
      {["culture", "movement", "building"].map((item) => (
        <SkeletonCard key={item} className="p-4">
          <div className="flex items-center justify-between gap-3">
            <SkeletonText
              className="flex-1"
              lines={2}
              widths={["w-40", "w-56"]}
            />
            <Skeleton shape="circle" className="size-8" />
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        </SkeletonCard>
      ))}
    </div>
  );
}
