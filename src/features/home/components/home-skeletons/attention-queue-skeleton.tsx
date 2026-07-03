import { ATTENTION_QUEUE_ROW_KEYS } from "@/features/home/components/home-skeletons/home-skeleton-constants";
import {
  getAttentionAvatarTone,
  getAttentionButtonTone,
  getAttentionSquareTone,
  getAttentionTextWidths,
  shouldRenderAttentionBadge,
  shouldRenderAttentionSquare,
} from "@/features/home/components/home-skeletons/home-skeleton-helpers";
import { HomeSectionHeadingSkeleton } from "@/features/home/components/home-skeletons/shared-skeletons";
import {
  SkeletonAvatar,
  SkeletonButton,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function HomeAttentionQueueSkeleton() {
  return (
    <section className="scroll-mt-6">
      <HomeSectionHeadingSkeleton actionWidth="w-20" />
      <ul
        aria-label="Loading things that need attention"
        className="mt-4 grid min-w-0 list-none border-border/55 border-y p-0"
      >
        <HomeAttentionQueueRowsSkeleton />
      </ul>
    </section>
  );
}

export function HomeAttentionQueueRowsSkeleton() {
  return (
    <>
      {ATTENTION_QUEUE_ROW_KEYS.map((item, index) => (
        <li
          key={item}
          className="flex min-w-0 flex-col gap-3 border-border/55 border-b px-1 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:px-3"
        >
          <div className="flex min-w-0 flex-1 items-start gap-3">
            {shouldRenderAttentionSquare(index) ? (
              <Skeleton
                shape="square"
                className="size-10 shrink-0 rounded-lg"
                tone={getAttentionSquareTone(index)}
              />
            ) : (
              <SkeletonAvatar
                className="size-10 shrink-0"
                tone={getAttentionAvatarTone(index)}
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-36" />
              </div>
              <SkeletonText
                className="mt-1 min-w-0 flex-1"
                lines={1}
                size="sm"
                widths={getAttentionTextWidths(index)}
              />
              <div className="mt-2 flex flex-wrap gap-3">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <SkeletonButton
              className="h-9 w-24 rounded-full"
              tone={getAttentionButtonTone(index)}
            />
            {shouldRenderAttentionBadge(index) ? (
              <Skeleton shape="circle" className="size-9" tone="amber" />
            ) : null}
          </div>
        </li>
      ))}
      <li className="flex items-center gap-2 px-3 py-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton shape="circle" className="size-4" />
      </li>
    </>
  );
}
