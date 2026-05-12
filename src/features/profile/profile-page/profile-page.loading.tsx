import type { PageLoadingProps } from "@/shared/components/loading/page-loading";
import {
  SkeletonAvatar,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ProfileCoverBanner } from "./profile-cover-banner";

export function ProfilePageLoading(_props: PageLoadingProps = {}) {
  return (
    <main
      aria-busy="true"
      aria-label="Loading profile"
      className="relative min-h-full overflow-x-hidden bg-canvas pb-32 md:pb-0"
      role="status"
    >
      <span className="sr-only">Loading profile</span>
      <ProfileCoverBanner />
      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col gap-8 px-4 pt-14 pb-24 sm:max-w-6xl sm:px-6 sm:pt-16 md:px-8 md:pt-20 lg:gap-12 lg:pb-16">
        <ProfileHeroSkeleton />
        <ProfilePortraitSkeleton />
        <BestFirstGroupStripSkeleton />
        <div className="lg:profile-page-grid grid gap-9 lg:gap-16">
          <div className="flex min-w-0 flex-col gap-8 lg:gap-10">
            <GroupFitSkeleton />
            <ActivityLanesSkeleton />
            <MatchingSnapshotSkeleton />
          </div>
          <PsychometricsSkeleton />
        </div>
      </div>
    </main>
  );
}

export function ProfilePageFixture() {
  return <ProfilePageLoading />;
}

function ProfileHeroSkeleton() {
  return (
    <section className="relative z-0 flex w-full flex-col pb-4 sm:px-0 sm:pb-8">
      <div className="flex w-full flex-col gap-5 sm:gap-6">
        <div className="flex w-full flex-col justify-between gap-5 sm:flex-row sm:items-start sm:gap-6">
          <div className="relative top-2 flex min-w-0 flex-1 flex-col items-center gap-3 sm:top-1 sm:flex-row sm:items-start sm:gap-6 md:top-5">
            <SkeletonAvatar className="size-28 border-4 border-canvas shadow-xl sm:size-32 md:size-36" />
            <div className="flex min-w-0 flex-col items-center gap-3 pt-1 text-center sm:items-start sm:text-left">
              <Skeleton className="h-10 w-72 max-w-full" />
              <Skeleton className="h-4 w-52 max-w-full" />
              <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                <Skeleton shape="pill" className="h-8 w-20" tone="teal" />
                <Skeleton shape="pill" className="h-8 w-24" />
                <Skeleton shape="pill" className="h-8 w-16" tone="amber" />
              </div>
            </div>
          </div>
        </div>

        <SkeletonText
          className="mx-auto max-w-136 sm:mx-0 sm:max-w-2xl"
          lineClassName="h-4 md:h-5"
          lines={3}
          widths={["w-full", "w-11/12", "w-2/3"]}
        />

        <div className="flex gap-3 lg:hidden">
          <Skeleton shape="pill" className="h-10 w-28" tone="teal" />
          <Skeleton shape="pill" className="h-10 w-24" />
        </div>
      </div>
    </section>
  );
}

function ProfilePortraitSkeleton() {
  return (
    <section className="flex flex-col gap-5 border-border/60 border-t pt-6 sm:pt-8">
      <div className="flex max-w-4xl flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-3 w-28" tone="teal" />
          <Skeleton shape="pill" className="h-7 w-24" />
        </div>
        <Skeleton className="h-8 w-full max-w-3xl md:h-9" />
        <SkeletonText
          className="max-w-3xl"
          lineClassName="h-4 md:h-5"
          lines={3}
          widths={["w-full", "w-11/12", "w-3/4"]}
        />
      </div>

      <div className="grid max-w-3xl gap-4 sm:grid-cols-2 sm:gap-5">
        {["first", "second"].map((item) => (
          <div key={item} className="flex flex-col gap-2">
            <Skeleton className="h-3 w-20" />
            <SkeletonText lines={2} size="sm" widths={["w-full", "w-4/5"]} />
          </div>
        ))}
      </div>
    </section>
  );
}

function BestFirstGroupStripSkeleton() {
  return (
    <section className="border-border/60 border-y py-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <Skeleton className="h-4 w-24" tone="amber" />
          <Skeleton className="mt-2 h-6 w-72 max-w-full" />
          <Skeleton className="mt-2 h-4 w-full max-w-2xl" />
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-2 md:justify-end">
          <Skeleton shape="pill" className="h-9 w-36" />
          <Skeleton shape="pill" className="h-9 w-44" />
        </div>
      </div>
    </section>
  );
}

function GroupFitSkeleton() {
  return (
    <section className="flex flex-col gap-6">
      <Skeleton className="h-3 w-24" tone="teal" />
      <div className="flex max-w-3xl flex-col gap-3">
        <Skeleton className="h-8 w-full max-w-xl md:h-9" />
        <SkeletonText
          lineClassName="h-4 md:h-5"
          lines={3}
          widths={["w-full", "w-11/12", "w-3/4"]}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        {["best", "move", "avoid"].map((item, index) => (
          <div key={item} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Skeleton
                shape="circle"
                className="size-4"
                tone={index === 0 ? "teal" : "default"}
              />
              <Skeleton className="h-3 w-20" />
            </div>
            <SkeletonText lines={2} size="sm" widths={["w-full", "w-4/5"]} />
          </div>
        ))}
      </div>
    </section>
  );
}

function ActivityLanesSkeleton() {
  return (
    <section className="flex flex-col gap-5">
      <Skeleton className="h-3 w-28" tone="teal" />
      <div className="divide-y divide-border/70">
        {["first", "second"].map((item, index) => (
          <div key={item} className="lane-row-grid grid gap-4 py-4">
            <Skeleton
              shape="circle"
              className="size-10"
              tone={index === 0 ? "teal" : "default"}
            />
            <SkeletonText lines={2} widths={["w-40", "w-full"]} />
            <Skeleton shape="pill" className="h-8 w-20" />
          </div>
        ))}
      </div>
    </section>
  );
}

function MatchingSnapshotSkeleton() {
  return (
    <section className="flex flex-col gap-5">
      <Skeleton className="h-3 w-36" tone="teal" />
      <div className="grid gap-3 sm:grid-cols-2">
        {["signal", "signal-two", "signal-three", "signal-four"].map((item) => (
          <div key={item} className="border-border/70 border-t pt-4">
            <Skeleton className="h-3 w-24" />
            <SkeletonText
              className="mt-2"
              lines={2}
              size="sm"
              widths={["w-full", "w-3/4"]}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function PsychometricsSkeleton() {
  return (
    <aside className="grid w-full gap-8 md:grid-cols-2 lg:sticky lg:top-4 lg:flex lg:flex-col lg:gap-10">
      <section className="flex flex-col gap-5">
        <Skeleton className="h-3 w-28" tone="teal" />
        <div className="relative mx-auto aspect-square w-full max-w-72">
          <Skeleton shape="circle" className="absolute inset-0" tone="teal" />
          <Skeleton shape="circle" className="absolute inset-12" />
        </div>
      </section>
      <section className="flex flex-col gap-5">
        <Skeleton className="h-3 w-32" tone="teal" />
        {["mind", "energy", "nature", "tactics"].map((item, index) => (
          <div key={item} className="flex items-center gap-3">
            <Skeleton
              shape="circle"
              className="size-9"
              tone={index === 0 ? "teal" : "default"}
            />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-2 h-2.5 w-full" />
            </div>
          </div>
        ))}
      </section>
    </aside>
  );
}
