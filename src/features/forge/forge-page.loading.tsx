import { ForgePageShell } from "@/features/forge/forge-page-content";
import type { PageLoadingProps } from "@/shared/components/loading/page-loading";
import {
  SkeletonButton,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function ForgePageLoading(_props: PageLoadingProps = {}) {
  return (
    <div aria-busy="true" aria-label="Loading forge" role="status">
      <span className="sr-only">Loading forge</span>
      <ForgePageLoadingFixture />
    </div>
  );
}

export function ForgePageLoadingFixture() {
  return (
    <ForgePageShell>
      <div className="flex flex-col gap-8 py-6 md:py-10">
        <section className="md:forge-hero-grid grid gap-7 border-border border-b pb-8 md:items-end md:pb-10">
          <div className="flex min-w-0 flex-col gap-7">
            <div className="flex flex-col gap-4">
              <Skeleton className="h-4 w-16" />
              <div className="flex max-w-3xl flex-col gap-3">
                <Skeleton className="h-11 w-full md:h-16" />
                <Skeleton className="h-11 w-4/5 md:h-16" />
              </div>
              <SkeletonText
                className="max-w-2xl"
                lines={3}
                widths={["w-full", "w-11/12", "w-3/4"]}
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <SkeletonButton className="h-14 w-full sm:w-48" tone="teal" />
              <SkeletonText
                className="max-w-sm"
                lines={2}
                size="sm"
                widths={["w-full", "w-3/4"]}
              />
            </div>
          </div>

          <aside
            aria-label="Loading example forge brief"
            className="rounded-xl border border-border bg-card"
          >
            <div className="flex items-center justify-between gap-4 border-border border-b px-4 py-3">
              <SkeletonText lines={2} size="sm" widths={["w-28", "w-36"]} />
              <Skeleton shape="circle" className="size-5" tone="teal" />
            </div>

            <dl className="divide-y divide-border">
              {["activity", "when", "where", "group"].map((item, index) => (
                <div
                  key={item}
                  className="avatar-body-grid-sm grid gap-3 px-4 py-3"
                >
                  <Skeleton className="h-3 w-14" />
                  <Skeleton
                    className={index === 2 ? "h-4 w-40" : "h-4 w-32"}
                    tone={index === 0 ? "teal" : "default"}
                  />
                </div>
              ))}
            </dl>
          </aside>
        </section>

        <section className="lg:forge-page-grid grid gap-5">
          <div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-2 h-8 w-96 max-w-full" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {["low", "active", "focused"].map((item) => (
              <article
                key={item}
                className="rounded-xl border border-border bg-card p-4"
              >
                <Skeleton className="h-4 w-20" tone="teal" />
                <div className="mt-3 grid gap-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-canvas p-5 md:p-6">
          <div className="lg:main-action-grid grid gap-6 lg:items-end">
            <div>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-2 h-8 w-112 max-w-full" />

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {["group", "invites", "chat"].map((item, index) => (
                  <div
                    key={item}
                    className="border-border border-t pt-4 first:border-t-0 first:pt-0 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4 first:sm:border-l-0 first:sm:pl-0"
                  >
                    <Skeleton
                      className="h-4 w-20"
                      tone={index === 0 ? "teal" : "default"}
                    />
                    <SkeletonText
                      className="mt-2"
                      lines={2}
                      size="sm"
                      widths={["w-full", "w-4/5"]}
                    />
                  </div>
                ))}
              </div>
            </div>

            <SkeletonButton className="h-12 w-full lg:w-44" tone="teal" />
          </div>
        </section>
      </div>
    </ForgePageShell>
  );
}
