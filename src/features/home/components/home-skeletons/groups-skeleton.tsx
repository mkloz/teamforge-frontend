import { GROUP_ROW_KEYS } from "@/features/home/components/home-skeletons/home-skeleton-constants";
import {
  getFirstItemTone,
  getGroupRowTextWidths,
} from "@/features/home/components/home-skeletons/home-skeleton-helpers";
import { HomeSectionHeadingSkeleton } from "@/features/home/components/home-skeletons/shared-skeletons";
import {
  SkeletonAvatar,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import {
  GroupedMenuItem,
  GroupedMenuList,
} from "@/shared/components/ui/grouped-menu";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function HomeGroupsSkeleton() {
  return (
    <section aria-busy="true" className="flex flex-col gap-5 lg:pr-10">
      <output className="sr-only">Loading active groups</output>
      <HomeSectionHeadingSkeleton actionWidth="w-14" eyebrow={false} />
      <GroupedMenuList aria-label="Loading your groups">
        {GROUP_ROW_KEYS.map((item, index) => (
          <GroupedMenuItem
            key={item}
            className="grid min-h-24 grid-cols-[3.5rem_minmax(0,1fr)_2rem] items-center gap-x-3 px-3 py-3 sm:grid-cols-[4.25rem_minmax(0,1fr)_2rem] sm:gap-x-4"
          >
            <SkeletonAvatar
              className="size-14 rounded-full sm:size-16"
              tone={getFirstItemTone(index)}
            />
            <SkeletonText
              className="min-w-0 flex-1"
              lines={3}
              size="sm"
              widths={getGroupRowTextWidths(index)}
            />
            <Skeleton shape="circle" className="size-8" />
          </GroupedMenuItem>
        ))}
      </GroupedMenuList>
    </section>
  );
}
