import { SkeletonText } from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function ProfilePortraitSectionFallback() {
  return (
    <section
      aria-hidden="true"
      className="grid gap-5 border-border/60 border-t pt-6 sm:pt-8 lg:grid-cols-3 lg:items-stretch"
    >
      <div className="flex min-w-0 flex-col gap-5 lg:col-span-2">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-3 w-28" tone="teal" />
            <Skeleton shape="pill" className="h-7 w-24" />
          </div>
          <Skeleton className="h-8 w-full max-w-3xl md:h-9" />
          <SkeletonText
            className="max-w-2xl"
            lineClassName="h-4"
            lines={2}
            widths={["w-full", "w-4/5"]}
          />
        </div>

        <div className="grid max-w-3xl border-border/70 border-y md:grid-cols-3">
          {["first", "second", "third"].map((item, index) => (
            <div
              key={item}
              className="min-w-0 border-border/70 border-t py-4 first:border-t-0 md:border-t-0 md:border-l md:px-4 last:md:pr-0 first:md:border-l-0 first:md:pl-0"
            >
              <div className="flex min-w-0 items-center gap-2">
                <Skeleton
                  shape="circle"
                  className="size-7 shrink-0"
                  tone={index === 0 ? "teal" : "default"}
                />
                <Skeleton className="h-3 w-20" />
              </div>
              <SkeletonText
                className="mt-2"
                lines={2}
                size="sm"
                widths={["w-full", "w-4/5"]}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex h-full min-h-64 flex-col rounded-2xl bg-primary-soft p-4 shadow-soft-sm">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-3 w-28" />
          <Skeleton shape="circle" className="size-4" tone="teal" />
        </div>
        <div className="mt-5 flex flex-1 flex-col justify-between gap-4">
          {["visible", "present", "quiet"].map((item) => (
            <div key={item} className="min-w-0">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-2.5 w-20" />
                <Skeleton className="h-2.5 w-8" tone="teal" />
              </div>
              <Skeleton className="mt-2 h-4 w-4/5" />
              <div className="mt-2 grid grid-cols-6 gap-1.5">
                {["a", "b", "c", "d", "e", "f"].map((segment, index) => (
                  <Skeleton
                    key={segment}
                    className="h-1.5"
                    tone={index < 4 ? "teal" : "default"}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
