import { UPCOMING_PLAN_ROW_KEYS } from "@/features/home/components/home-skeletons/home-skeleton-constants";
import { HomeSectionHeadingSkeleton } from "@/features/home/components/home-skeletons/shared-skeletons";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function HomeUpcomingPlansSkeleton() {
  return (
    <section aria-busy="true" className="flex w-full flex-col gap-5">
      <output className="sr-only">Loading upcoming plans</output>
      <HomeSectionHeadingSkeleton actionWidth="w-14" />
      <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1.05fr)_minmax(19rem,0.95fr)]">
        <Skeleton
          shape="square"
          className="min-h-72 w-full rounded-2xl"
          tone="teal"
        />
        <ul className="grid list-none gap-0.5 overflow-hidden rounded-2xl p-0">
          {UPCOMING_PLAN_ROW_KEYS.slice(1).map((item, index) => (
            <li
              key={item}
              className="grid min-h-24 grid-cols-[4rem_minmax(0,1fr)_auto] items-center gap-3 bg-card px-3 py-3 first:rounded-t-2xl last:rounded-b-2xl"
            >
              <Skeleton
                shape="square"
                className="size-16 rounded-xl"
                tone={index === 0 ? "teal" : "default"}
              />

              <div className="min-w-0">
                <Skeleton className="h-4 w-40 max-w-full" />
                <Skeleton className="mt-1 h-3 w-28 max-w-full" />
                <div className="mt-2 flex items-center gap-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>

              <Skeleton shape="circle" className="size-4" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
