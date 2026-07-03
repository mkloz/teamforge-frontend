import { SkeletonButton } from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function LandingLoadingHeader() {
  return (
    <>
      <span className="fixed top-4 left-4 z-100 -translate-y-24 rounded-lg bg-primary px-4 py-2 text-white opacity-0">
        Skip to main content
      </span>
      <header className="dark fixed top-0 right-0 left-0 z-50 bg-hero-bg/95">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Skeleton shape="square" className="size-8" tone="teal" />
            <Skeleton className="h-5 w-28" tone="teal" />
          </div>
          <div className="hidden items-center gap-6 md:flex">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-14" />
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <SkeletonButton className="h-10 w-20" />
            <SkeletonButton className="h-10 w-28" tone="teal" />
          </div>
          <SkeletonButton className="size-10 md:hidden" />
        </div>
      </header>
    </>
  );
}
