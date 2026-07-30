import { RECOMMENDED_GROUP_CARD_KEYS } from "@/features/home/components/home-skeletons/home-skeleton-constants";
import { getFirstItemTone } from "@/features/home/components/home-skeletons/home-skeleton-helpers";
import { HomeSectionHeadingSkeleton } from "@/features/home/components/home-skeletons/shared-skeletons";
import {
  SkeletonAvatar,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function HomeRecommendedGroupsSkeleton() {
  return (
    <section
      aria-busy="true"
      className="flex w-full flex-col gap-5 lg:border-border/60 lg:border-l lg:pl-10"
    >
      <output className="sr-only">Loading recommended groups</output>
      <HomeSectionHeadingSkeleton actionWidth="w-16" />
      <ul className="list-none p-0">
        {RECOMMENDED_GROUP_CARD_KEYS.map((item, index) => (
          <li
            key={item}
            className="grid min-h-24 grid-cols-[2.75rem_4rem_minmax(0,1fr)_auto] items-center gap-3 border-border/60 border-b py-3 first:border-t sm:grid-cols-[3.5rem_5rem_minmax(0,1fr)_auto] sm:gap-4 sm:py-4"
          >
            <Skeleton className="h-14 w-9 rounded-lg" />
            <SkeletonAvatar
              className="size-16 rounded-xl sm:size-20 sm:rounded-2xl"
              tone={getFirstItemTone(index)}
            />
            <SkeletonText
              className="min-w-0"
              lines={4}
              size="sm"
              widths={["w-3/4", "w-1/2", "w-2/3", "w-1/2"]}
            />
            <Skeleton shape="circle" className="size-9" />
          </li>
        ))}
      </ul>
    </section>
  );
}
