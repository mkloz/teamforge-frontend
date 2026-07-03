import { HERO_STATUS_PILL_KEYS } from "@/features/home/components/home-skeletons/home-skeleton-constants";
import {
  SkeletonButton,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function HomeHeroSkeleton() {
  return (
    <section aria-busy="true" className="w-full">
      <output className="sr-only">Loading home summary</output>
      <div className="flex w-full flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <SkeletonText
            className="min-w-0 flex-1 gap-2"
            lineClassName="rounded-lg"
            lines={2}
            size="lg"
            widths={["w-72 max-w-full", "w-80 max-w-full"]}
          />
          <SkeletonButton className="size-11" />
        </div>

        <div className="relative grid gap-4 overflow-hidden rounded-xl px-4 py-4 sm:gap-6 sm:px-5 sm:py-5 lg:px-6 2xl:min-h-80 2xl:grid-cols-[minmax(0,1fr)_minmax(17rem,20rem)] 2xl:items-center 2xl:gap-10">
          <div className="absolute inset-y-0 left-0 w-full [background:linear-gradient(112deg,color-mix(in_srgb,var(--color-forge-teal)_13%,transparent),color-mix(in_srgb,var(--color-forge-teal)_4%,transparent)_48%,transparent_76%)]" />
          <div className="absolute inset-y-5 left-2 w-px rounded-full bg-forge-teal/55 sm:inset-y-6 sm:left-3" />

          <div className="relative z-10 flex min-w-0 flex-col gap-4 pl-2 sm:gap-5 sm:pl-4">
            <div className="flex items-start gap-3 sm:gap-4">
              <Skeleton
                shape="square"
                className="size-10 shrink-0 sm:size-12 md:size-14"
                tone="teal"
              />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-3 w-28" tone="teal" />
                <Skeleton className="mt-2 h-7 w-80 max-w-full sm:h-8 lg:h-9" />
              </div>
            </div>

            <SkeletonText
              className="max-w-xl"
              lines={2}
              widths={["w-full", "w-4/5"]}
            />

            <div className="flex flex-row flex-wrap gap-2 sm:gap-3">
              <SkeletonButton className="h-11 w-40 max-w-full" tone="teal" />
              <SkeletonButton className="h-11 w-36 max-w-full" />
            </div>

            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
              <Skeleton shape="pill" className="h-9 w-32 sm:h-8" tone="teal" />
              {HERO_STATUS_PILL_KEYS.map((item) => (
                <Skeleton
                  key={item}
                  shape="pill"
                  className="h-11 w-24 sm:h-8"
                />
              ))}
            </div>
          </div>

          <div className="relative hidden min-h-72 overflow-hidden 2xl:block">
            <Skeleton
              shape="circle"
              className="absolute top-10 left-8 size-16"
              tone="teal"
            />
            <Skeleton
              shape="circle"
              className="absolute right-5 bottom-16 size-14"
              tone="amber"
            />
            <Skeleton className="absolute top-26 left-20 h-2 w-40 rotate-6" />
            <Skeleton className="absolute right-20 bottom-28 h-2 w-44 -rotate-6" />
            <div className="absolute inset-x-8 top-1/2 grid -translate-y-1/2 gap-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
