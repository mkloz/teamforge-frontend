import { TeamForgeLogo } from "@/assets/logo";
import type { PageLoadingProps } from "@/shared/components/loading/page-loading";
import { SkeletonText } from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";

interface LegalPageLoadingProps extends PageLoadingProps {
  kind: "privacy" | "terms";
}

const legalLoadingSections = ["scope", "collection", "choices", "security"];

export function LegalPageLoading({ kind }: LegalPageLoadingProps) {
  return (
    <main
      aria-busy="true"
      aria-label={`Loading ${kind === "privacy" ? "privacy policy" : "terms"}`}
      className="min-h-screen bg-canvas text-ink"
      role="status"
    >
      <span className="sr-only">
        Loading {kind === "privacy" ? "privacy policy" : "terms"}
      </span>
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-4">
          <div className="inline-flex min-w-0 items-center gap-2">
            <TeamForgeLogo className="size-8" showBackground={false} />
            <Skeleton className="h-5 w-24" tone="teal" />
          </div>
          <Skeleton shape="pill" className="h-9 w-28" />
        </header>

        <section className="py-14 sm:py-18">
          <div className="grid gap-8 lg:grid-cols-3 lg:items-start">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton shape="pill" className="h-7 w-28" tone="teal" />
                <Skeleton className="h-3 w-36" />
              </div>

              <div className="mt-4 grid max-w-4xl gap-3">
                <Skeleton className="h-11 w-full max-w-3xl" tone="teal" />
                <Skeleton className="h-11 w-full max-w-2xl" tone="teal" />
              </div>
              <SkeletonText
                className="mt-5 max-w-3xl"
                lines={3}
                size="lg"
                widths={["w-full", "w-11/12", "w-3/4"]}
              />

              <div className="mt-6 flex max-w-3xl items-start gap-3 rounded-2xl border border-spark-amber/25 bg-spark-amber/8 p-4">
                <Skeleton
                  shape="circle"
                  className="mt-0.5 size-4"
                  tone="amber"
                />
                <SkeletonText
                  className="flex-1"
                  lines={2}
                  size="sm"
                  widths={["w-full", "w-5/6"]}
                />
              </div>
            </div>

            <aside className="rounded-2xl border border-border/70 bg-card/55 p-4 lg:sticky lg:top-6">
              <Skeleton className="h-3 w-24" />
              <div className="mt-3 grid gap-2">
                {legalLoadingSections.map((section, index) => (
                  <Skeleton
                    key={section}
                    className={index === 0 ? "h-6 w-4/5" : "h-6 w-full"}
                    tone={index === 0 ? "teal" : "default"}
                  />
                ))}
              </div>
              <div className="mt-4 border-border/70 border-t pt-4">
                <Skeleton shape="pill" className="h-9 w-full" />
              </div>
            </aside>
          </div>
        </section>

        <div className="grid gap-4 border-border/70 border-t pb-16">
          {legalLoadingSections.map((section, index) => (
            <section
              key={section}
              className="grid gap-5 border-border/70 border-b py-7 lg:grid-cols-[minmax(16rem,20rem)_minmax(0,1fr)] lg:gap-10"
            >
              <div className="flex min-w-0 items-start gap-3">
                <Skeleton shape="circle" className="size-6" tone="teal" />
                <Skeleton className="h-7 w-48 max-w-full" />
              </div>
              <div className="grid max-w-3xl gap-4">
                <SkeletonText
                  lines={2}
                  size="lg"
                  widths={["w-full", "w-4/5"]}
                />
                <div className="grid gap-2">
                  {[0, 1, 2].map((item) => (
                    <div key={item} className="flex items-start gap-2.5">
                      <Skeleton
                        shape="circle"
                        className="mt-1 size-3.5 shrink-0"
                        tone={index === 0 ? "teal" : "default"}
                      />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
