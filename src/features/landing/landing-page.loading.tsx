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
      <span className="fixed top-4 left-4 z-100 -translate-y-24 rounded-lg bg-forge-teal px-4 py-2 text-white opacity-0">
        Skip to main content
      </span>
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
      <div className="fixed top-1/2 left-6 z-100 hidden -translate-y-1/2 flex-col items-center gap-5 lg:flex">
        {["hero", "people-problem", "cta"].map((item, index) => (
          <Skeleton
            key={item}
            shape="circle"
            className={index === 0 ? "size-2.5" : "size-1"}
            tone={index === 0 ? "teal" : "default"}
          />
        ))}
      </div>

      <main id="main-content">
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
          <Skeleton
            shape="circle"
            className="absolute bottom-7 left-1/2 size-10 -translate-x-1/2"
          />
        </section>

        <section className="dark relative overflow-hidden bg-hero-bg py-24 md:py-32">
          <div className="relative mx-auto max-w-7xl px-6">
            <div className="grid items-center gap-8 lg:grid-cols-12 xl:gap-10">
              <header className="max-w-xl lg:col-span-5">
                <Skeleton className="h-3 w-48" tone="teal" />
                <SkeletonText
                  className="mt-4 w-full gap-3"
                  lineClassName="h-10 md:h-12"
                  lines={3}
                  widths={["w-full", "w-11/12", "w-4/5"]}
                />
                <SkeletonText
                  className="mt-6 w-full"
                  lines={5}
                  widths={["w-full", "w-11/12", "w-full", "w-5/6", "w-2/3"]}
                />
                <div className="mt-8 border-forge-teal/45 border-l-2 pl-4">
                  <SkeletonText
                    lines={2}
                    widths={["w-full", "w-4/5"]}
                    className="max-w-lg"
                  />
                </div>
              </header>

              <div className="lg:col-span-7 lg:-mr-12 xl:-mr-20">
                <Skeleton className="mx-auto aspect-4/3 w-full max-w-4xl" />
              </div>
            </div>

            <div className="mt-14 grid border-white/10 border-y md:grid-cols-3 lg:mt-16">
              {["one", "two", "three"].map((item) => (
                <div
                  key={item}
                  className="border-white/10 border-b py-6 last:border-b-0 md:border-r md:border-b-0 md:px-8 last:md:border-r-0 last:md:pr-0 first:md:pl-0"
                >
                  <Skeleton className="h-5 w-36" tone="teal" />
                  <SkeletonText
                    className="mt-3 max-w-sm"
                    lines={2}
                    widths={["w-full", "w-4/5"]}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="dark relative overflow-hidden bg-hero-bg py-28 md:py-40">
          <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
            <SkeletonText
              className="mx-auto mb-6 max-w-3xl gap-3"
              lineClassName="h-10 sm:h-12"
              lines={2}
              widths={["w-full", "w-4/5 mx-auto"]}
            />
            <SkeletonText
              className="mx-auto mb-12 max-w-xl"
              lines={3}
              widths={["w-full", "w-11/12", "w-2/3 mx-auto"]}
            />
            <div className="mb-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <SkeletonButton className="h-14 w-full sm:w-48" tone="teal" />
              <SkeletonButton className="h-14 w-full sm:w-44" />
            </div>
            <Skeleton className="mx-auto h-3 w-44" />
          </div>
        </section>
      </main>

      <footer className="bg-hero-bg px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 border-white/10 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-4 w-32" tone="teal" />
          <div className="flex gap-5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </footer>
    </div>
  );
}
