import { SkeletonText } from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function InterestsCatalogSkeleton() {
  return <InterestsCatalogSkeletonContent />;
}

function InterestsCatalogSkeletonContent() {
  return (
    <div
      aria-busy="true"
      className="mx-auto flex w-full max-w-xl flex-col pb-8"
    >
      <output className="sr-only">Loading interests</output>
      <div className="mt-4 mb-6 flex flex-col gap-2 overflow-hidden pt-4">
        <Skeleton className="h-3 w-28" tone="teal" />
        <Skeleton className="h-8 w-80 max-w-full" />
        <SkeletonText lines={2} widths={["w-full", "w-4/5"]} />
      </div>

      <div className="flex flex-col gap-2">
        <section className="overflow-hidden rounded-xl border border-slate-muted/10 bg-canvas p-0.5">
          <div className="flex min-h-12 items-center gap-2 rounded-xl px-3 py-3 sm:px-4">
            <Skeleton shape="circle" className="size-3 shrink-0" tone="teal" />
            <Skeleton className="h-3 w-28" />
            <div className="ml-auto flex items-center gap-1.5">
              <Skeleton shape="circle" className="size-1" tone="teal" />
              <Skeleton className="h-3 w-4" />
              <Skeleton shape="circle" className="size-4" />
            </div>
          </div>

          <div className="flex flex-col gap-4 pb-6">
            <div className="flex flex-wrap gap-1.5 px-0 py-1.5 sm:gap-2 sm:p-1.5">
              {["film", "music", "food", "books", "design"].map(
                (item, index) => (
                  <Skeleton
                    key={item}
                    shape="pill"
                    className={index === 4 ? "h-9 w-28" : "h-9 w-24"}
                    tone={index === 0 ? "teal" : "default"}
                  />
                ),
              )}
            </div>

            <div className="flex flex-wrap gap-2 px-1.5">
              {["one", "two", "three", "four", "five", "six"].map(
                (item, index) => (
                  <InterestChoiceSkeleton
                    key={item}
                    tone={index === 0 ? "teal" : "default"}
                  />
                ),
              )}
            </div>
          </div>
        </section>

        {["movement", "building"].map((item, sectionIndex) => (
          <section
            key={item}
            className="overflow-hidden rounded-xl border border-slate-muted/10 bg-canvas p-0.5"
          >
            <div className="flex min-h-12 items-center gap-2 rounded-xl px-3 py-3 sm:px-4">
              <Skeleton
                shape="circle"
                className="size-3 shrink-0"
                tone={sectionIndex === 0 ? "amber" : "default"}
              />
              <Skeleton className="h-3 w-32" />
              <div className="ml-auto flex items-center gap-1.5">
                <Skeleton shape="circle" className="size-1" />
                <Skeleton className="h-3 w-4" />
                <Skeleton shape="circle" className="size-4" />
              </div>
            </div>
          </section>
        ))}

        <section className="mt-4 overflow-hidden rounded-xl border border-slate-muted/10 bg-canvas p-0.5">
          <div className="flex min-h-12 items-center gap-2 rounded-xl px-3 py-3 sm:px-4">
            <Skeleton shape="circle" className="size-3 shrink-0" tone="amber" />
            <Skeleton className="h-3 w-36" />
            <div className="ml-auto">
              <Skeleton shape="circle" className="size-4" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 px-3 pb-3">
            <Skeleton shape="pill" className="h-8 w-28" tone="amber" />
            <Skeleton shape="pill" className="h-8 w-24" />
          </div>
        </section>
      </div>
    </div>
  );
}

function InterestChoiceSkeleton({
  tone = "default",
}: {
  tone?: "default" | "teal";
}) {
  return (
    <div className="inline-flex h-9 items-center gap-2 rounded-full border border-border/70 bg-card/50 px-3">
      <Skeleton shape="circle" className="size-3 shrink-0" tone={tone} />
      <Skeleton className="h-3 w-20" tone={tone} />
    </div>
  );
}
