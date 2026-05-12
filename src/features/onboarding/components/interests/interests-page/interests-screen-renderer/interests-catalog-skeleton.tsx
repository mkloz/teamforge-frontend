import { SkeletonText } from "@/shared/components/loading/skeleton-patterns";
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
      <section className="flex flex-col gap-4 pt-2">
        <SkeletonText lines={2} widths={["w-32", "w-72"]} />
        <div className="flex flex-wrap gap-2">
          {["suggested", "local", "creative", "active"].map((item, index) => (
            <Skeleton
              key={item}
              shape="pill"
              className="h-9 w-24"
              tone={index === 0 ? "teal" : "default"}
            />
          ))}
        </div>
      </section>
      {["culture", "movement", "building"].map((item) => (
        <section key={item} className="border-border/70 border-t pt-5">
          <div className="flex items-center justify-between gap-3">
            <SkeletonText
              className="flex-1"
              lines={2}
              widths={["w-40", "w-56"]}
            />
            <Skeleton shape="circle" className="size-8" />
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <InterestChoiceSkeleton tone="teal" />
            <InterestChoiceSkeleton />
            <InterestChoiceSkeleton />
            <InterestChoiceSkeleton />
          </div>
        </section>
      ))}
    </div>
  );
}

function InterestChoiceSkeleton({
  tone = "default",
}: {
  tone?: "default" | "teal";
}) {
  return (
    <div className="flex h-12 items-center gap-3 rounded-xl border border-border/70 bg-card/50 px-3">
      <Skeleton shape="circle" className="size-5 shrink-0" tone={tone} />
      <Skeleton className="h-3 min-w-0 flex-1" tone={tone} />
    </div>
  );
}
