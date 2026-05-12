import type { PageLoadingProps } from "@/shared/components/loading/page-loading";
import {
  SkeletonAvatar,
  SkeletonCard,
  SkeletonList,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function ProfilePageLoading(_props: PageLoadingProps = {}) {
  return (
    <main
      aria-busy="true"
      aria-label="Loading profile"
      className="relative min-h-full overflow-x-hidden bg-canvas pb-32 md:pb-0"
      role="status"
    >
      <span className="sr-only">Loading profile</span>
      <Skeleton
        className="absolute inset-x-0 top-0 h-48 rounded-none"
        tone="teal"
      />
      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col gap-8 px-4 pt-14 pb-24 sm:max-w-6xl sm:px-6 sm:pt-16 md:px-8 md:pt-20 lg:gap-12 lg:pb-16">
        <ProfileHeroSkeleton />
        <SkeletonCard className="p-5">
          <SkeletonText
            lines={4}
            widths={["w-32", "w-full", "w-5/6", "w-2/3"]}
          />
        </SkeletonCard>
        <SkeletonCard className="p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            {["first", "second", "third"].map((item) => (
              <SkeletonText
                key={item}
                lines={3}
                widths={["w-20", "w-full", "w-3/4"]}
              />
            ))}
          </div>
        </SkeletonCard>
        <div className="lg:profile-page-grid grid gap-9 lg:gap-16">
          <div className="flex min-w-0 flex-col gap-8 lg:gap-10">
            <SkeletonList count={3} />
          </div>
          <SkeletonCard className="p-5">
            <SkeletonText lines={2} widths={["w-32", "w-48"]} />
            <div className="mt-5 flex flex-col gap-4">
              {["o", "c", "e", "a", "n"].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <Skeleton shape="circle" className="size-9" />
                  <Skeleton className="h-3 flex-1" />
                </div>
              ))}
            </div>
          </SkeletonCard>
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
    <SkeletonCard className="p-5 md:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
        <SkeletonAvatar className="size-24" tone="teal" />
        <div className="min-w-0 flex-1">
          <SkeletonText lines={3} widths={["w-28", "w-64", "w-full"]} />
        </div>
        <Skeleton shape="pill" className="h-10 w-24" tone="amber" />
      </div>
    </SkeletonCard>
  );
}
