import type { PageLoadingProps } from "@/shared/components/loading/page-loading";
import {
  SkeletonButton,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function LandingPageLoading(_props: PageLoadingProps = {}) {
  return <LandingPageLoadingFixture />;
}

function LandingPageLoadingFixture() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading TeamForge"
      className="bg-canvas font-sans text-ink antialiased"
      role="status"
    >
      <span className="sr-only">Loading TeamForge</span>
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
      <div className="fixed top-1/2 left-6 z-100 hidden -translate-y-1/2 flex-col items-center gap-5 lg:flex">
        {[
          "hero",
          "people-problem",
          "plan-to-group",
          "why-different",
          "group-feels-right",
          "trust-control",
          "cta",
        ].map((item, index) => (
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

        <section className="dark relative overflow-hidden bg-hero-bg pt-24 pb-20 md:pt-32 md:pb-28 lg:pt-36">
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

        <section className="dark relative overflow-hidden bg-hero-bg pt-20 pb-24 md:pt-24 md:pb-32">
          <div className="relative mx-auto max-w-7xl px-6">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
              <header className="max-w-2xl lg:col-span-6">
                <Skeleton className="h-3 w-40" tone="teal" />
                <SkeletonText
                  className="mt-4 w-full max-w-xl gap-3"
                  lineClassName="h-10 md:h-12"
                  lines={2}
                  widths={["w-full", "w-4/5"]}
                />
              </header>
              <SkeletonText
                className="max-w-xl lg:col-span-5 lg:col-start-8"
                lines={3}
                widths={["w-full", "w-11/12", "w-3/4"]}
              />
            </div>
          </div>

          <div className="relative mx-auto mt-12 max-w-7xl px-6 md:mt-14">
            <div className="overflow-hidden border-white/10 border-y">
              <Skeleton className="h-80 w-full sm:h-96 md:aspect-[2.4/1] md:h-auto" />
            </div>
          </div>

          <div className="relative mx-auto max-w-7xl px-6">
            <div className="grid border-white/10 border-b md:grid-cols-3 md:border-t">
              {["activity", "shape", "room"].map((item) => (
                <div
                  key={item}
                  className="border-white/10 border-t py-6 md:border-t-0 md:border-r md:px-8 last:md:border-r-0 last:md:pr-0 first:md:pl-0"
                >
                  <Skeleton className="h-5 w-40" tone="teal" />
                  <SkeletonText
                    className="mt-3 max-w-sm"
                    lines={2}
                    widths={["w-full", "w-3/4"]}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="dark relative overflow-hidden bg-hero-bg pt-20 pb-24 md:pt-28 md:pb-36">
          <div className="relative mx-auto max-w-7xl px-6">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
              <div className="overflow-hidden border-white/10 border-y lg:col-span-7">
                <Skeleton className="h-80 w-full sm:h-96 md:aspect-[1.55/1] md:h-auto" />
              </div>

              <div className="max-w-xl lg:col-span-5 lg:pl-6">
                <Skeleton className="h-3 w-44" tone="teal" />
                <SkeletonText
                  className="mt-4 w-full gap-3"
                  lineClassName="h-10 md:h-12"
                  lines={3}
                  widths={["w-full", "w-11/12", "w-4/5"]}
                />
                <SkeletonText
                  className="mt-6 w-full"
                  lines={4}
                  widths={["w-full", "w-11/12", "w-full", "w-3/4"]}
                />
                <SkeletonText
                  className="mt-8 w-full max-w-md"
                  lines={2}
                  widths={["w-full", "w-4/5"]}
                />
              </div>
            </div>

            <div className="mt-14 grid border-white/10 border-y md:grid-cols-2 lg:grid-cols-4">
              {["plans", "group", "search", "message"].map((item) => (
                <div
                  key={item}
                  className="border-white/10 border-b py-6 last:border-b-0 md:px-6 odd:md:border-r lg:border-r lg:border-b-0 lg:px-7 last:lg:border-r-0 last:lg:pr-0 first:lg:pl-0"
                >
                  <Skeleton className="h-5 w-36" tone="teal" />
                  <SkeletonText
                    className="mt-3"
                    lines={2}
                    widths={["w-full", "w-4/5"]}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="dark relative overflow-hidden bg-hero-bg pt-24 pb-20 md:pt-32 md:pb-28">
          <div className="relative mx-auto max-w-7xl px-6">
            <header className="mx-auto max-w-4xl text-center">
              <Skeleton className="mx-auto h-3 w-44" tone="teal" />
              <SkeletonText
                className="mx-auto mt-4 max-w-3xl gap-3"
                lineClassName="h-10 md:h-12"
                lines={2}
                widths={["w-full", "w-4/5 mx-auto"]}
              />
              <SkeletonText
                className="mx-auto mt-6 max-w-3xl"
                lines={3}
                widths={["w-full", "w-11/12 mx-auto", "w-3/4 mx-auto"]}
              />
            </header>

            <div className="relative mt-8 mb-6 overflow-hidden border-white/10 border-t md:mt-10">
              <Skeleton className="mx-auto aspect-2.25/1 w-full max-w-6xl" />
            </div>

            <SkeletonText
              className="mx-auto mt-6 max-w-xl"
              lines={2}
              widths={["w-full", "w-4/5 mx-auto"]}
            />

            <div className="mt-10 grid border-white/10 border-y md:grid-cols-2 lg:grid-cols-4">
              {["interests", "style", "fit", "trust"].map((item) => (
                <div
                  key={item}
                  className="border-white/10 border-b py-6 last:border-b-0 md:px-6 odd:md:border-r lg:border-r lg:border-b-0 lg:px-7 last:lg:border-r-0 last:lg:pr-0 first:lg:pl-0"
                >
                  <Skeleton className="h-5 w-36" tone="teal" />
                  <SkeletonText
                    className="mt-3"
                    lines={2}
                    widths={["w-full", "w-3/4"]}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="dark relative overflow-hidden bg-hero-bg pt-20 pb-28 md:pt-28 md:pb-36">
          <div className="relative mx-auto max-w-7xl px-6">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center xl:gap-12">
              <div className="max-w-xl lg:col-span-5">
                <Skeleton className="h-3 w-36" tone="teal" />
                <SkeletonText
                  className="mt-4 w-full gap-3"
                  lineClassName="h-10 md:h-12"
                  lines={2}
                  widths={["w-full", "w-4/5"]}
                />
                <SkeletonText
                  className="mt-6 w-full"
                  lines={4}
                  widths={["w-full", "w-11/12", "w-full", "w-3/4"]}
                />
                <div className="mt-8 border-forge-teal/45 border-l-2 pl-4">
                  <SkeletonText
                    lines={2}
                    widths={["w-full", "w-4/5"]}
                    className="max-w-lg"
                  />
                </div>
              </div>

              <div className="relative lg:col-span-7 lg:-mr-6 xl:-mr-12">
                <Skeleton className="mx-auto aspect-[1.55/1] w-full max-w-3xl lg:max-w-4xl" />
              </div>
            </div>

            <div className="mt-14 grid border-white/10 border-y md:grid-cols-2 lg:grid-cols-4">
              {["review", "decline", "leave", "reliability"].map((item) => (
                <div
                  key={item}
                  className="border-white/10 border-b py-6 last:border-b-0 md:px-6 odd:md:border-r lg:border-r lg:border-b-0 lg:px-7 last:lg:border-r-0 last:lg:pr-0 first:lg:pl-0"
                >
                  <Skeleton className="h-5 w-36" tone="teal" />
                  <SkeletonText
                    className="mt-3"
                    lines={2}
                    widths={["w-full", "w-4/5"]}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="dark relative overflow-hidden bg-hero-bg pt-24 pb-28 md:pt-36 md:pb-40">
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
