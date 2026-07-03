import { UPCOMING_PLAN_ROW_KEYS } from "@/features/home/components/home-skeletons/home-skeleton-constants";
import { HomeSectionHeadingSkeleton } from "@/features/home/components/home-skeletons/shared-skeletons";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function HomeUpcomingPlansSkeleton() {
  return (
    <section aria-busy="true" className="flex w-full flex-col gap-4">
      <output className="sr-only">Loading upcoming plans</output>
      <HomeSectionHeadingSkeleton actionWidth="w-14" />
      <ul className="border-border/55 border-y">
        {UPCOMING_PLAN_ROW_KEYS.map((item, index) => (
          <li
            key={item}
            className="grid min-h-20 grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 border-border/55 border-b py-3.5 pr-1 last:border-b-0 sm:grid-cols-[4rem_minmax(0,1fr)_auto] sm:pr-3 md:gap-4"
          >
            <div className="relative flex h-full min-h-16 flex-col justify-center pl-9">
              <Skeleton
                shape="circle"
                className="absolute top-1/2 left-4 size-2.5 -translate-x-1/2 -translate-y-1/2"
                tone={index === 0 ? "teal" : "default"}
              />
              <Skeleton className="h-2.5 w-8" />
              <Skeleton className="mt-1 h-6 w-5" />
              <Skeleton className="mt-1 h-2.5 w-6" />
            </div>

            <div className="min-w-0">
              <Skeleton className="h-4 w-44 max-w-full" />
              <Skeleton className="mt-1.5 h-3 w-36 max-w-full" />
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-20" tone="teal" />
                <Skeleton className="h-3 w-14" />
                <Skeleton className="h-3 w-10" />
              </div>
            </div>

            <div className="col-start-2 flex items-center justify-end sm:col-start-3">
              <Skeleton className="h-4 w-14" tone="teal" />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
