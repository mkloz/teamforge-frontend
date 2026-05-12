import { HomePageContent } from "@/features/home/home-page-content";
import type { PageLoadingProps } from "@/shared/components/loading/page-loading";
import {
  SkeletonAvatar,
  SkeletonButton,
  SkeletonCard,
  SkeletonList,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function HomePageLoading(_props: PageLoadingProps = {}) {
  return (
    <div aria-busy="true" aria-label="Loading home" role="status">
      <span className="sr-only">Loading home</span>
      <HomePageContent
        hero={<HomeHeroSkeleton />}
        attentionQueue={<HomeSectionSkeleton rows={2} />}
        upcomingPlans={<HomeSectionSkeleton rows={3} />}
        recommendedGroups={<HomeCardGridSkeleton />}
        groupsGrid={<HomeGroupsSkeleton />}
        friendsInvitation={<HomeInviteSkeleton />}
      />
    </div>
  );
}

function HomeHeroSkeleton() {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
      <div className="lg:home-hero-grid grid gap-6 lg:items-center">
        <div className="flex min-w-0 flex-col gap-5">
          <SkeletonText lines={3} widths={["w-32", "w-4/5", "w-2/3"]} />
          <div className="grid gap-3 sm:grid-cols-3">
            {["trust", "groups", "plans"].map((item) => (
              <SkeletonCard key={item} className="p-4">
                <SkeletonText lines={2} widths={["w-16", "w-24"]} />
              </SkeletonCard>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <SkeletonButton className="w-36" tone="teal" />
            <SkeletonButton className="w-28" />
          </div>
        </div>
        <SkeletonCard className="min-h-64 p-4">
          <div className="flex h-full flex-col justify-between gap-5">
            <div className="flex items-center justify-between gap-4">
              <SkeletonAvatar className="size-14" tone="teal" />
              <Skeleton shape="pill" className="h-8 w-24" tone="amber" />
            </div>
            <SkeletonText
              lines={4}
              widths={["w-3/4", "w-full", "w-5/6", "w-2/3"]}
            />
          </div>
        </SkeletonCard>
      </div>
    </section>
  );
}

function HomeSectionSkeleton({ rows }: { rows: number }) {
  return (
    <section className="flex flex-col gap-4">
      <SkeletonText lines={2} widths={["w-40", "w-72"]} />
      <SkeletonList count={rows} />
    </section>
  );
}

function HomeCardGridSkeleton() {
  return (
    <section className="flex flex-col gap-4">
      <SkeletonText lines={2} widths={["w-44", "w-64"]} />
      <div className="grid gap-3 md:grid-cols-2">
        {["one", "two"].map((item) => (
          <SkeletonCard key={item} className="min-h-44" />
        ))}
      </div>
    </section>
  );
}

function HomeGroupsSkeleton() {
  return (
    <SkeletonCard className="p-4">
      <SkeletonText lines={2} widths={["w-32", "w-48"]} />
      <div className="mt-4">
        <SkeletonList count={3} />
      </div>
    </SkeletonCard>
  );
}

function HomeInviteSkeleton() {
  return (
    <SkeletonCard className="p-4">
      <SkeletonText lines={3} widths={["w-28", "w-full", "w-3/4"]} />
      <div className="mt-4 flex gap-3">
        <SkeletonButton className="flex-1" tone="teal" />
        <SkeletonButton className="flex-1" />
      </div>
    </SkeletonCard>
  );
}
