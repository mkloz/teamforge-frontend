import type { PageLoadingProps } from "@/shared/components/loading/page-loading";
import {
  SkeletonAvatar,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ProfileCoverBanner } from "./profile-cover-banner";

export function ProfilePageLoading(_props: PageLoadingProps = {}) {
  return (
    <div
      aria-busy="true"
      className="relative min-h-full overflow-x-clip bg-canvas pb-(--profile-cover-phase-reserve) [--personality-cover-type-opacity:0.82] [--personality-cover-type-scale:1] [--personality-cover-type-y:0px] [--profile-cover-collapsed-height:80px] [--profile-cover-expanded-height:160px] [--profile-cover-height:var(--profile-cover-expanded-height)] [--profile-cover-phase-offset:0px] [--profile-cover-phase-reserve:104px] [--profile-hero-z-index:40] [--profile-sidebar-sticky-top:var(--profile-cover-collapsed-height)] sm:[--profile-cover-expanded-height:168px] sm:[--profile-cover-phase-reserve:112px] md:[--profile-cover-expanded-height:152px] md:[--profile-cover-phase-reserve:96px] lg:[--profile-cover-collapsed-height:64px] lg:[--profile-cover-phase-reserve:112px]"
    >
      <output className="sr-only">Loading profile</output>
      <ProfileCoverBanner />
      <div className="absolute top-4 right-4 z-50 md:top-6 md:right-8">
        <Skeleton shape="circle" className="size-10 border border-white/15" />
      </div>
      <div className="transform-[translate3d(0,var(--profile-cover-phase-offset,0px),0)] relative z-(--profile-hero-z-index) mx-auto flex w-full max-w-lg flex-col gap-8 px-4 pt-24 pb-8 sm:max-w-6xl sm:px-6 md:px-8 md:pt-16 lg:gap-12 lg:pb-16">
        <ProfileHeroSkeleton />
        <ProfilePortraitSkeleton />
        <BestFirstGroupStripSkeleton />
        <div className="grid gap-9 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] lg:gap-16">
          <div className="flex min-w-0 flex-col gap-8 lg:gap-10">
            <GroupFitSkeleton />
            <ActivityLanesSkeleton />
            <MatchingSnapshotSkeleton />
          </div>
          <PsychometricsSkeleton />
        </div>
      </div>
    </div>
  );
}

function ProfileHeroSkeleton() {
  return (
    <section className="relative z-0 flex w-full flex-col pb-4 sm:px-0 sm:pb-8">
      <div className="flex w-full flex-col gap-5 sm:gap-6 lg:gap-9">
        <div className="flex w-full flex-col justify-between gap-5 sm:flex-row sm:items-start sm:gap-6">
          <div className="relative top-2 flex min-w-0 flex-1 flex-row items-start gap-4 sm:top-1 sm:gap-6 md:top-5">
            <SkeletonAvatar className="size-28 border-4 border-canvas shadow-xl sm:size-32 md:size-36" />
            <div className="flex min-w-0 flex-1 flex-col items-start justify-center pt-0">
              <Skeleton className="h-9 w-56 max-w-full sm:h-10 sm:w-72" />
              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                <Skeleton className="h-4 w-12" />
                <Skeleton shape="circle" className="size-1" />
                <Skeleton className="h-3 w-24" />
              </div>

              <div className="mt-2 flex w-full flex-col items-start justify-center gap-5 pb-1 sm:mt-5 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                <div className="flex flex-wrap justify-start gap-2">
                  <Skeleton shape="pill" className="h-8 w-20" tone="teal" />
                  <Skeleton shape="pill" className="h-8 w-24" />
                  <Skeleton shape="pill" className="h-8 w-16" tone="amber" />
                </div>
                <div className="hidden gap-3 lg:flex">
                  <Skeleton shape="pill" className="h-10 w-28" tone="teal" />
                  <Skeleton shape="pill" className="h-10 w-24" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 sm:gap-6">
          <SkeletonText
            className="max-w-136 sm:mx-0 sm:max-w-2xl"
            lineClassName="h-4 md:h-5"
            lines={3}
            widths={["w-full", "w-11/12", "w-2/3"]}
          />

          <div className="flex gap-3 lg:hidden">
            <Skeleton shape="pill" className="h-10 w-28" tone="teal" />
            <Skeleton shape="pill" className="h-10 w-24" />
          </div>
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
          <div
            key={item}
            className="flex min-w-0 flex-col gap-3 py-5 first:pt-0 last:pb-0 sm:py-4"
          >
            <div className="flex items-start gap-3">
              <Skeleton
                shape="circle"
                className="size-9 shrink-0"
                tone={index === 0 ? "teal" : "default"}
              />
              <SkeletonText lines={2} widths={["w-40", "w-32"]} />
            </div>
            <div className="flex min-w-0 flex-wrap gap-1.5 sm:gap-2">
              {["one", "two", "three", "four", "five"].map(
                (chip, chipIndex) => (
                  <Skeleton
                    key={chip}
                    shape="pill"
                    className={chipIndex === 4 ? "h-8 w-24" : "h-8 w-20"}
                    tone={chipIndex < 3 ? "teal" : "default"}
                  />
                ),
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function MatchingSnapshotSkeleton() {
  return (
    <section className="flex flex-col gap-4">
      <Skeleton className="h-3 w-36" tone="teal" />
      <div className="flex flex-wrap gap-2">
        {["activity", "social", "confidence"].map((item, index) => (
          <Skeleton
            key={item}
            shape="pill"
            className={index === 2 ? "h-9 w-40" : "h-9 w-36"}
            tone={index === 0 ? "teal" : index === 1 ? "amber" : "default"}
          />
        ))}
      </div>
    </section>
  );
}

function PsychometricsSkeleton() {
  return (
    <div className="flex min-w-0 shrink-0 flex-col border-border/70 lg:sticky lg:top-(--profile-sidebar-sticky-top) lg:self-start lg:border-l lg:pl-8 xl:pl-10">
      <aside className="grid w-full gap-8 md:grid-cols-2 lg:flex lg:flex-col lg:gap-10">
        <section className="flex min-w-0 flex-col border-border/60 border-t pt-6 lg:border-t-0 lg:pt-0">
          <div className="relative mx-auto aspect-square w-full max-w-72">
            <Skeleton className="absolute top-1/2 left-1/2 h-px w-4/5 -translate-x-1/2 -translate-y-1/2 rotate-12" />
            <Skeleton className="absolute top-1/2 left-1/2 h-px w-4/5 -translate-x-1/2 -translate-y-1/2 -rotate-45" />
            <Skeleton className="absolute top-1/2 left-1/2 h-px w-4/5 -translate-x-1/2 -translate-y-1/2 rotate-90" />
            <div className="absolute inset-12 rounded-full border border-border/70" />
            <div className="absolute inset-20 rounded-full border border-border/60" />
            <div className="absolute inset-x-16 top-16 bottom-16 rounded-full border-2 border-forge-teal/40" />
            <Skeleton
              shape="circle"
              className="absolute top-8 left-1/2 size-3 -translate-x-1/2"
              tone="teal"
            />
            <Skeleton
              shape="circle"
              className="absolute top-1/3 right-9 size-3"
              tone="teal"
            />
            <Skeleton
              shape="circle"
              className="absolute right-15 bottom-11 size-3"
              tone="teal"
            />
            <Skeleton
              shape="circle"
              className="absolute bottom-10 left-15 size-3"
              tone="teal"
            />
            <Skeleton
              shape="circle"
              className="absolute top-1/3 left-9 size-3"
              tone="teal"
            />
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
    </div>
  );
}
