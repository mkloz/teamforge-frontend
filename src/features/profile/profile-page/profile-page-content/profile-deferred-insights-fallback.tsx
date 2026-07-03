import { SkeletonAvatar } from "@/shared/components/loading/skeleton-patterns";

export function ProfileDeferredInsightsFallback() {
  return (
    <div className="profile-deferred-containment grid gap-9 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] lg:gap-16">
      <div className="flex min-w-0 flex-col gap-8 lg:gap-10">
        <section className="border-border/60 border-y py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
              <div className="h-3 w-24 rounded-full bg-spark-amber/20" />
              <div className="mt-2 h-6 w-72 max-w-full rounded-full bg-muted" />
              <div className="mt-2 h-4 w-full max-w-2xl rounded-full bg-muted" />
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-2 md:justify-end">
              <div className="h-9 w-36 rounded-full bg-muted" />
              <div className="h-9 w-44 rounded-full bg-muted" />
            </div>
          </div>
        </section>
        <section className="flex flex-col gap-6">
          <div className="h-3 w-24 rounded-full bg-forge-teal/15" />
          <div className="flex max-w-3xl flex-col gap-3">
            <div className="h-8 w-full max-w-xl rounded-full bg-muted md:h-9" />
            <div className="h-4 w-full rounded-full bg-muted md:h-5" />
            <div className="h-4 w-11/12 rounded-full bg-muted md:h-5" />
            <div className="h-4 w-3/4 rounded-full bg-muted md:h-5" />
          </div>
        </section>
      </div>
      <aside className="hidden min-w-0 shrink-0 border-border/70 lg:flex lg:flex-col lg:border-l lg:pl-8 xl:pl-10">
        <div className="relative mx-auto aspect-square w-full max-w-72">
          <div className="absolute inset-12 rounded-full border border-border/70" />
          <div className="absolute inset-20 rounded-full border border-border/60" />
          <div className="absolute inset-x-16 top-16 bottom-16 rounded-full border-2 border-forge-teal/30" />
          <SkeletonAvatar
            className="absolute top-8 left-1/2 size-3 -translate-x-1/2"
            tone="teal"
          />
        </div>
      </aside>
    </div>
  );
}
