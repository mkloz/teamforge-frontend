import type { PageLoadingProps } from "@/shared/components/loading/page-loading";
import {
  SkeletonButton,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function LandingPageLoading(_props: PageLoadingProps = {}) {
  return <LandingPageLoadingFixture />;
}

export function LandingPageLoadingFixture() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading TeamForge"
      className="bg-canvas font-sans text-ink antialiased"
      role="status"
    >
      <span className="sr-only">Loading TeamForge</span>
      <header className="dark fixed top-0 right-0 left-0 z-50 bg-hero-bg/95">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Skeleton shape="square" className="size-8" tone="teal" />
            <Skeleton className="h-5 w-28" tone="teal" />
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <SkeletonButton className="h-10 w-20" />
            <SkeletonButton className="h-10 w-28" tone="teal" />
          </div>
          <SkeletonButton className="size-10 md:hidden" />
        </div>
      </header>

      <main>
        <section className="dark relative flex min-h-screen items-center overflow-hidden bg-hero-bg">
          <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-28 pb-20 pl-6 md:pl-12">
            <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-8">
              <div className="flex max-w-xl flex-1 flex-col items-center text-center lg:items-start lg:text-left">
                <SkeletonText
                  className="mb-5 w-full max-w-lg gap-3"
                  lineClassName="h-12 sm:h-16"
                  lines={3}
                  widths={["w-full", "w-11/12", "w-72 max-w-full"]}
                />
                <SkeletonText
                  className="mb-8 w-full max-w-md"
                  lines={5}
                  widths={["w-full", "w-11/12", "w-full", "w-5/6", "w-2/3"]}
                />
                <div className="mb-10 flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
                  <SkeletonButton className="h-14 w-full sm:w-48" tone="teal" />
                  <SkeletonButton className="h-14 w-full sm:w-44" />
                </div>
              </div>

              <div className="flex flex-1 justify-center xl:justify-end">
                <div className="relative flex size-80 items-center justify-center sm:size-96">
                  <Skeleton
                    shape="circle"
                    className="absolute inset-4"
                    tone="teal"
                  />
                  <Skeleton shape="circle" className="size-44" tone="teal" />
                  <div className="absolute right-8 bottom-10 grid gap-2 rounded-xl border border-border/30 bg-card/20 p-4 backdrop-blur">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-story-scroll relative bg-canvas">
          <div className="sticky top-0 flex h-screen w-full flex-col items-center overflow-hidden md:flex-row">
            <div className="landing-story-spacer-lg relative z-10 order-2 flex w-full items-center justify-center p-6 md:order-1 md:h-full md:w-1/2 md:p-24">
              <div className="flex w-full max-w-md flex-col gap-5">
                <Skeleton className="h-3 w-16" tone="teal" />
                <Skeleton className="h-10 w-full" />
                <SkeletonText
                  lines={4}
                  widths={["w-full", "w-5/6", "w-full", "w-2/3"]}
                />
              </div>
            </div>
            <div className="landing-story-spacer relative order-1 flex w-full items-center justify-center md:order-2 md:h-full md:w-1/2">
              <Skeleton
                shape="circle"
                className="size-64 md:size-88"
                tone="teal"
              />
            </div>
          </div>
        </section>

        <section className="dark relative overflow-hidden bg-hero-bg py-24 md:py-36">
          <div className="relative mx-auto max-w-6xl px-6">
            <div className="mb-16 flex flex-col items-center gap-4 text-center md:mb-20">
              <Skeleton className="h-10 w-full max-w-lg" tone="teal" />
              <SkeletonText
                className="max-w-xl"
                lines={3}
                widths={["w-full", "w-11/12", "w-3/4"]}
              />
            </div>
            <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
              <Skeleton
                shape="circle"
                className="size-72 shrink-0"
                tone="teal"
              />
              <div className="grid w-full max-w-md gap-4">
                {["one", "two", "three"].map((item, index) => (
                  <div key={item} className="border-border/30 border-t py-4">
                    <Skeleton
                      className="h-6 w-20"
                      tone={index === 0 ? "teal" : "default"}
                    />
                    <Skeleton className="mt-3 h-4 w-full" />
                    <Skeleton className="mt-2 h-4 w-3/4" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
