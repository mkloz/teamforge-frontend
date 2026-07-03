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
import { Skeleton } from "@/shared/components/ui/skeleton";

export function HomeGroupsSkeleton() {
  return (
    <section aria-busy="true" className="flex flex-col gap-4">
      <output className="sr-only">Loading active groups</output>
      <HomeSectionHeadingSkeleton actionWidth="w-14" eyebrow={false} />
      <ul
        aria-label="Loading your groups"
        className="flex list-none flex-col gap-2 p-0"
      >
        {GROUP_ROW_KEYS.map((item, index) => (
          <li
            key={item}
            className="grid min-h-20 grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-x-3 rounded-xl px-2.5 py-2.5"
          >
            <SkeletonAvatar
              className="size-11"
              tone={getFirstItemTone(index)}
            />
            <SkeletonText
              className="min-w-0 flex-1"
              lines={3}
              size="sm"
              widths={getGroupRowTextWidths(index)}
            />
            <Skeleton shape="square" className="h-7 w-12 rounded-lg" />
          </li>
        ))}
        <li className="flex h-12 items-center justify-between gap-3 rounded-xl px-3 py-3">
          <Skeleton className="h-3 w-32" />
          <Skeleton shape="circle" className="size-4" />
        </li>
      </ul>
    </section>
  );
}
