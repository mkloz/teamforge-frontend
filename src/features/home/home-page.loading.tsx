import { HomePageContent } from "@/features/home/home-page-content";
import type { PageLoadingProps } from "@/shared/components/loading/page-loading";
import {
  SkeletonAvatar,
  SkeletonButton,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function HomePageLoading(_props: PageLoadingProps = {}) {
  return (
    <div aria-busy="true" aria-label="Loading home" role="status">
      <span className="sr-only">Loading home</span>
      <HomePageContent
        hero={<HomeHeroSkeleton />}
        attentionQueue={<HomeAttentionQueueSkeleton />}
        upcomingPlans={<HomeUpcomingPlansSkeleton />}
        recommendedGroups={<HomeRecommendedGroupsSkeleton />}
        groupsGrid={<HomeGroupsSkeleton />}
        friendsInvitation={<HomeInviteSkeleton />}
      />
    </div>
  );
}

function HomeHeroSkeleton() {
  return (
    <section className="w-full">
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

        <div className="2xl:home-hero-grid relative grid gap-4 overflow-hidden rounded-xl px-4 py-4 sm:gap-6 sm:px-5 sm:py-5 lg:px-6 2xl:min-h-80 2xl:items-center 2xl:gap-10">
          <div className="home-hero-wash absolute inset-y-0 left-0 w-full" />
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
              {["browse", "chat", "profile"].map((item) => (
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

function HomeAttentionQueueSkeleton() {
  return (
    <section className="scroll-mt-6">
      <HomeSectionHeadingSkeleton actionWidth="w-20" />
      <ul
        aria-label="Loading things that need attention"
        className="mt-4 grid min-w-0 list-none border-border/55 border-y p-0"
      >
        {["profile", "invite"].map((item, index) => (
          <li
            key={item}
            className="flex min-w-0 items-start gap-3 border-border/55 border-b px-1 py-4 last:border-b-0 sm:px-3"
          >
            <div className="flex min-w-0 flex-1 items-start gap-3">
              {index === 0 ? (
                <Skeleton
                  shape="square"
                  className="size-10 shrink-0"
                  tone="teal"
                />
              ) : (
                <SkeletonAvatar className="size-11 shrink-0" />
              )}
              <SkeletonText
                className="min-w-0 flex-1"
                lines={2}
                size="sm"
                widths={index === 0 ? ["w-40", "w-72"] : ["w-32", "w-64"]}
              />
            </div>
            <SkeletonButton className="h-8 w-28 shrink-0" />
          </li>
        ))}
      </ul>
    </section>
  );
}

function HomeUpcomingPlansSkeleton() {
  return (
    <section className="flex w-full flex-col gap-4">
      <HomeSectionHeadingSkeleton actionWidth="w-14" />
      <div className="flex items-center gap-3 border-border/70 border-y border-dashed bg-card/40 px-3 py-5">
        <Skeleton shape="square" className="h-14 w-16 shrink-0" tone="teal" />
        <SkeletonText
          className="min-w-0 flex-1"
          lines={2}
          size="sm"
          widths={["w-40", "w-80"]}
        />
      </div>
    </section>
  );
}

function HomeRecommendedGroupsSkeleton() {
  return (
    <section className="flex w-full flex-col gap-5">
      <HomeSectionHeadingSkeleton actionWidth="w-16" />
      <div className="w-full overflow-hidden md:hidden">
        <HomeRecommendedGroupCardSkeleton className="max-w-80" />
      </div>
      <ul className="hidden list-none p-0 md:grid md:grid-cols-2 md:gap-5 xl:grid-cols-3">
        {["first", "second", "third"].map((item, index) => (
          <li key={item} className="min-w-0">
            <HomeRecommendedGroupCardSkeleton
              tone={index === 0 ? "teal" : "default"}
            />
          </li>
        ))}
      </ul>
    </section>
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
            className="aspect-video w-full rounded-none border-border border-b-2"
            tone={tone}
          />
          <div className="flex min-w-0 grow flex-col bg-canvas p-4">
            <div className="mb-3 flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-2.5">
                <SkeletonAvatar className="size-7" tone={tone} />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton shape="pill" className="h-6 w-20" />
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

function HomeGroupsSkeleton() {
  return (
    <section className="flex flex-col gap-4">
      <HomeSectionHeadingSkeleton actionWidth="w-14" eyebrow={false} />
      <ul
        aria-label="Loading your groups"
        className="flex list-none flex-col p-0"
      >
        <li className="flex h-16 items-center gap-3 border-border/55 border-b px-1 py-3 sm:px-3">
          <SkeletonAvatar className="size-9" tone="teal" />
          <SkeletonText
            className="min-w-0 flex-1"
            lines={2}
            size="sm"
            widths={["w-28", "w-36"]}
          />
          <Skeleton shape="circle" className="size-4" />
        </li>
        <li className="flex h-16 items-center gap-3 border-border/55 border-b px-1 py-3 sm:px-3">
          <SkeletonAvatar className="size-9" />
          <SkeletonText
            className="min-w-0 flex-1"
            lines={2}
            size="sm"
            widths={["w-32", "w-28"]}
          />
          <Skeleton shape="circle" className="size-4" />
        </li>
      </ul>
    </section>
  );
}

function HomeInviteSkeleton() {
  return (
    <section className="flex w-full flex-col gap-4">
      <HomeSectionHeadingSkeleton actionWidth="w-0" eyebrow={false} />
      <div className="rounded-xl border border-border/45 bg-forge-teal/5 px-3 py-3">
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
          <div className="flex h-11 min-w-0 items-center gap-2 rounded-md border border-border/45 bg-background/70 px-3">
            <Skeleton className="h-3 min-w-0 flex-1" />
            <SkeletonButton className="size-10 rounded-md" />
          </div>
          <SkeletonButton className="h-11 rounded-md px-4" tone="teal" />
        </div>
      </div>
    </section>
  );
}
