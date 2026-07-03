import {
  PreferenceRowSkeleton,
  SectionHeadingSkeleton,
  StatPillSkeleton,
} from "@/features/settings/settings-page/settings-page.loading/shared-skeletons";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function MatchingSectionSkeleton() {
  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <SectionHeadingSkeleton />
        <div className="grid gap-5 sm:grid-cols-2">
          <StatPillSkeleton />
          <StatPillSkeleton />
        </div>
      </div>

      <div className="grid gap-0 border-border border-t lg:grid-cols-[1fr_1.4fr] lg:gap-8">
        <PreferenceRowSkeleton tone="teal" />
        <div className="border-border border-b py-5 lg:border-b-0">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-4 h-2 w-full" tone="teal" />
          <div className="mt-3 flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>

      <div className="border-border border-t pt-6">
        <Skeleton className="h-3 w-20" />
        <div className="mt-3 flex flex-wrap gap-2">
          {["one", "two", "three", "four", "five"].map((item, index) => (
            <Skeleton
              key={item}
              shape="pill"
              className="h-7 w-24"
              tone={index === 0 ? "teal" : "default"}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
