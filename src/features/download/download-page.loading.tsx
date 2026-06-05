import type { PageLoadingProps } from "@/shared/components/loading/page-loading";
import {
  SkeletonButton,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function DownloadPageLoading(_props: PageLoadingProps = {}) {
  return (
    <main
      aria-busy="true"
      aria-label="Loading download page"
      className="min-h-screen bg-canvas text-ink"
      role="status"
    >
      <span className="sr-only">Loading download page</span>

      {/* Nav skeleton */}
      <header className="dark fixed top-0 right-0 left-0 z-50 border-white/5 border-b bg-hero-bg/95">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Skeleton shape="square" className="size-8" tone="teal" />
            <Skeleton className="h-5 w-28" tone="teal" />
          </div>
          <div className="flex gap-3">
            <SkeletonButton className="h-9 w-20" />
            <SkeletonButton className="h-9 w-28" tone="teal" />
          </div>
        </div>
      </header>

      {/* Hero skeleton */}
      <section className="dark bg-hero-bg pt-16">
        <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-6xl flex-col items-center gap-10 px-6 py-10 sm:py-12 lg:flex-row lg:gap-12">
          {/* Left */}
          <div className="flex max-w-xl flex-1 flex-col items-center gap-6 lg:items-start">
            <Skeleton shape="pill" className="h-6 w-28" tone="teal" />
            <SkeletonText
              className="w-full max-w-md gap-4"
              lineClassName="h-10 sm:h-14"
              lines={2}
              widths={["w-full", "w-3/4"]}
            />
            <SkeletonText
              className="w-full max-w-md"
              lines={3}
              size="lg"
              widths={["w-full", "w-11/12", "w-2/3"]}
            />
            <div className="flex w-full flex-col gap-3 sm:flex-row">
              <SkeletonButton className="h-14 w-full sm:w-52" tone="teal" />
              <SkeletonButton className="h-14 w-full sm:w-32" />
            </div>
          </div>

          {/* Right: phone silhouette */}
          <div className="flex flex-1 justify-center lg:justify-end">
            <Skeleton shape="square" className="h-104 w-56 rounded-4xl" />
          </div>
        </div>
      </section>

      {/* Install steps skeleton */}
      <section className="bg-canvas">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="mb-12">
            <Skeleton className="mb-3 h-3 w-24" tone="teal" />
            <SkeletonText
              lines={2}
              lineClassName="h-9"
              widths={["w-48", "w-36"]}
            />
          </div>
          <div className="divide-y divide-border/60">
            {[0, 1].map((item) => (
              <div key={item} className="flex items-start gap-6 py-8 sm:gap-10">
                <Skeleton
                  className="h-14 w-12 shrink-0 sm:h-20 sm:w-16"
                  shape="pill"
                  tone="teal"
                />
                <div className="flex flex-1 items-start gap-4">
                  <Skeleton
                    shape="circle"
                    className="mt-1 size-10 shrink-0"
                    tone="teal"
                  />
                  <div className="flex-1">
                    <Skeleton className="mb-2 h-5 w-40" />
                    <SkeletonText lines={2} widths={["w-full", "w-4/5"]} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="border-forge-teal/12 border-y bg-forge-teal/5">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-6 py-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <Skeleton shape="circle" className="size-11 shrink-0" tone="teal" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-40" />
              <SkeletonText lines={2} widths={["w-72", "w-56"]} />
            </div>
          </div>
          <SkeletonButton className="h-9 w-36" />
        </div>
      </div>

      {/* Capabilities skeleton */}
      <section className="bg-canvas">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <Skeleton className="mb-12 h-3 w-20" tone="teal" />
          <div className="divide-y divide-border/60">
            {[0, 1, 2, 3].map((item) => (
              <div
                key={item}
                className={`flex flex-row items-start gap-8 py-8 sm:items-center sm:gap-12 ${item % 2 !== 0 ? "sm:flex-row-reverse" : ""}`}
              >
                <Skeleton
                  shape="square"
                  className="size-12 shrink-0 rounded-2xl"
                  tone="teal"
                />
                <div className="hidden flex-1 border-border/40 border-t border-dashed sm:block" />
                <div
                  className={`flex max-w-sm flex-col items-start gap-2 ${item % 2 !== 0 ? "sm:items-end" : ""}`}
                >
                  <Skeleton className="h-5 w-40" />
                  <SkeletonText lines={2} widths={["w-72", "w-56"]} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
