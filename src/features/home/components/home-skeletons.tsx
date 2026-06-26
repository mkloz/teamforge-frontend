import {
  SkeletonAvatar,
  SkeletonButton,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";

const HERO_STATUS_PILL_KEYS = ["browse", "chat", "profile"];
const ATTENTION_QUEUE_ROW_KEYS = [
  "invite-a",
  "invite-b",
  "request-a",
  "request-b",
  "plan-a",
  "plan-b",
];
const UPCOMING_PLAN_ROW_KEYS = ["first", "second", "third", "fourth"];
const RECOMMENDED_GROUP_CARD_KEYS = ["first", "second", "third"];
const GROUP_ROW_KEYS = ["first", "second", "third", "fourth"];

export function HomeHeroSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading home summary"
      className="w-full"
      role="status"
    >
      <span className="sr-only">Loading home summary</span>
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

export function HomeUpcomingPlansSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading upcoming plans"
      className="flex w-full flex-col gap-4"
      role="status"
    >
      <span className="sr-only">Loading upcoming plans</span>
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

export function HomeRecommendedGroupsSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading recommended groups"
      className="flex w-full flex-col gap-5"
      role="status"
    >
      <span className="sr-only">Loading recommended groups</span>
      <HomeSectionHeadingSkeleton actionWidth="w-16" />
      <div className="w-full overflow-hidden md:hidden">
        <HomeRecommendedGroupCardSkeleton className="w-full" />
      </div>
      <ul className="responsive-card-grid hidden list-none gap-5 p-0 md:grid">
        {RECOMMENDED_GROUP_CARD_KEYS.map((item, index) => (
          <li key={item} className="min-w-0">
            <HomeRecommendedGroupCardSkeleton tone={getFirstItemTone(index)} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function HomeGroupsSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading active groups"
      className="flex flex-col gap-4"
      role="status"
    >
      <span className="sr-only">Loading active groups</span>
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

export function HomeInviteSkeleton() {
  return (
    <section className="flex w-full flex-col gap-4">
      <HomeSectionHeadingSkeleton actionWidth="w-0" eyebrow={false} />
      <div className="rounded-xl border border-forge-teal/25 bg-forge-teal/10 px-3 py-3">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <SkeletonText
            className="min-w-0 flex-1"
            lines={2}
            size="sm"
            widths={["w-full", "w-4/5"]}
          />
          <div className="relative mt-0.5 flex h-9 w-14 shrink-0 items-center">
            <Skeleton
              shape="circle"
              className="absolute right-7 size-7"
              tone="teal"
            />
            <Skeleton
              shape="circle"
              className="absolute right-3.5 size-7"
              tone="amber"
            />
            <Skeleton shape="circle" className="absolute right-0 size-7" />
          </div>
        </div>

        <div className="main-action-grid mt-3 grid items-center gap-2">
          <div className="relative flex h-11 min-w-0 items-center rounded-md border border-border/45 bg-background/70 py-0 pr-12 pl-3">
            <Skeleton className="h-3 min-w-0 flex-1" />
            <SkeletonButton className="absolute top-1/2 right-1 size-9 -translate-y-1/2 rounded-md" />
          </div>
          <SkeletonButton className="h-11 rounded-md px-4" tone="teal" />
        </div>
      </div>
    </section>
  );
}

function shouldRenderAttentionSquare(index: number) {
  return index < 2 || index >= 4;
}

function shouldRenderAttentionBadge(index: number) {
  return index < 4;
}

function getAttentionSquareTone(index: number) {
  return index >= 4 ? "amber" : "teal";
}

function getAttentionAvatarTone(index: number) {
  return index < 2 ? "teal" : "default";
}

function getAttentionButtonTone(index: number) {
  return index >= 4 ? "default" : "teal";
}

function getAttentionTextWidths(index: number) {
  return index >= 4 ? ["w-56"] : index < 2 ? ["w-72"] : ["w-56"];
}

function getFirstItemTone(index: number) {
  return index === 0 ? "teal" : "default";
}

function getGroupRowTextWidths(index: number) {
  return index % 2 === 0 ? ["w-32", "w-44", "w-16"] : ["w-36", "w-40", "w-20"];
}

function HomeSectionHeadingSkeleton({
  actionWidth = "w-16",
  eyebrow = true,
}: {
  actionWidth?: string;
  eyebrow?: boolean;
}) {
  return (
    <div className="main-action-grid grid min-w-0 gap-x-4 gap-y-1.5">
      <div className="min-w-0">
        {eyebrow ? <Skeleton className="h-3 w-16" tone="teal" /> : null}
        <Skeleton className="mt-1 h-6 w-56 max-w-full sm:h-7" />
      </div>
      <div className="shrink-0 pt-1">
        <Skeleton className={`h-4 ${actionWidth}`} tone="teal" />
      </div>
      <Skeleton className="col-span-2 h-4 w-96 max-w-full" />
    </div>
  );
}

function HomeRecommendedGroupCardSkeleton({
  className,
  tone = "default",
}: {
  className?: string;
  tone?: "default" | "teal";
}) {
  return (
    <div className={className}>
      <div className="relative isolate z-10 flex w-full overflow-hidden rounded-xl border-2 border-border bg-card">
        <div className="flex w-full flex-col">
          <Skeleton
            shape="square"
            className="aspect-video w-full rounded-t-lg border-border border-b-2"
            tone={tone}
          />
          <div className="flex min-w-0 grow flex-col bg-canvas p-4">
            <div className="mb-3 flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-2.5">
                <SkeletonAvatar className="size-7" tone={tone} />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton shape="pill" className="h-6 w-7" />
            </div>
            <SkeletonText lines={3} widths={["w-full", "w-5/6", "w-2/3"]} />
            <div className="mt-4 h-px w-full bg-border/60" />
            <div className="mt-3 flex min-w-0 flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex">
                  <SkeletonAvatar className="size-7 border-2 border-canvas" />
                  <SkeletonAvatar className="-ml-2 size-7 border-2 border-canvas" />
                  <SkeletonAvatar className="-ml-2 size-7 border-2 border-canvas" />
                </div>
                <Skeleton className="h-3 w-20" />
              </div>
              <SkeletonButton className="h-9 w-20" tone="teal" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
