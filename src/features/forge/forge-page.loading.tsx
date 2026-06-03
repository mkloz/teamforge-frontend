import type { PageLoadingProps } from "@/shared/components/loading/page-loading";
import {
  SkeletonButton,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";

const BRIEF_ROW_SKELETONS = [
  { key: "activity", width: "w-36", tone: "teal" },
  { key: "when", width: "w-32", tone: "default" },
  { key: "where", width: "w-44", tone: "default" },
  { key: "group", width: "w-40", tone: "default" },
] as const;

const IDEA_CHIP_SKELETONS = [
  { key: "coffee", width: "w-40", tone: "teal" },
  { key: "climbing", width: "w-36", tone: "default" },
  { key: "games", width: "w-40", tone: "default" },
  { key: "cycle", width: "w-28", tone: "default" },
  { key: "revision", width: "w-36", tone: "default" },
  { key: "football", width: "w-40", tone: "default" },
  { key: "hack", width: "w-28", tone: "default" },
  { key: "walk", width: "w-32", tone: "default" },
  { key: "portfolio", width: "w-36", tone: "default" },
] as const;

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
    <div className="mx-auto flex size-full max-w-6xl flex-col gap-8 px-4 sm:px-6 md:px-8 md:pb-12">
      <div className="flex flex-col gap-10 py-5 lg:py-10">
        <section className="grid gap-7 border-border border-b pb-8 md:grid-cols-[minmax(0,1fr)_minmax(16rem,25rem)] md:items-end md:pb-10 lg:gap-12">
          <div className="flex min-w-0 flex-col gap-7">
            <div className="flex flex-col gap-4">
              <Skeleton className="h-4 w-16" />
              <div className="flex max-w-3xl flex-col gap-3">
                <Skeleton className="h-10 w-full md:h-16" />
                <Skeleton className="h-10 w-4/5 md:h-16" />
              </div>
              <SkeletonText
                className="max-w-xl"
                lineClassName="h-4"
                lines={2}
                widths={["w-full", "w-5/6"]}
              />
            </div>

            <SkeletonButton className="h-14 w-full sm:w-48" tone="teal" />
          </div>

          <aside
            aria-label="Loading example forge brief"
            className="overflow-hidden rounded-2xl border border-forge-teal/25 bg-forge-teal/6"
          >
            <div className="flex items-center justify-between gap-4 border-forge-teal/20 border-b px-4 py-3">
              <SkeletonText lines={2} size="sm" widths={["w-28", "w-40"]} />
              <div className="flex items-center gap-1">
                {["active", "next", "last"].map((item, index) => (
                  <Skeleton
                    key={item}
                    shape="circle"
                    className="size-1.5"
                    tone={index === 0 ? "teal" : "default"}
                  />
                ))}
              </div>
            </div>

            <dl className="divide-y divide-forge-teal/15">
              {BRIEF_ROW_SKELETONS.map(({ key, tone, width }) => (
                <div key={key} className="flex items-baseline gap-4 px-4 py-3">
                  <Skeleton className="h-3 w-16 shrink-0" />
                  <Skeleton className={`h-4 min-w-0 ${width}`} tone={tone} />
                </div>
              ))}
            </dl>
          </aside>
        </section>

        <section aria-label="Loading starter ideas">
          <div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-2 h-8 w-112 max-w-full" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {IDEA_CHIP_SKELETONS.map(({ key, tone, width }) => (
              <Skeleton
                key={key}
                shape="pill"
                className={`h-10 ${width}`}
                tone={tone}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
