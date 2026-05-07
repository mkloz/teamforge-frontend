export function HomeHeroSkeleton() {
  return (
    <section aria-labelledby="home-hero-heading" className="w-full">
      <div className="flex w-full animate-pulse flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div
              id="home-hero-heading"
              className="h-8 w-48 rounded-md bg-muted sm:w-64"
            />
            <div className="mt-2 h-4 w-56 rounded-md bg-muted/80 sm:w-80" />
          </div>
          <div className="size-10 shrink-0 rounded-lg bg-muted sm:size-11" />
        </div>

        <div className="relative grid gap-4 overflow-hidden rounded-xl px-4 py-4 sm:gap-6 sm:px-5 sm:py-5 lg:px-6">
          <div className="absolute inset-y-0 left-0 w-full bg-[linear-gradient(112deg,rgba(20,184,166,0.08),rgba(20,184,166,0.03)_48%,transparent_76%)]" />
          <div className="absolute inset-y-5 left-2 w-px rounded-full bg-forge-teal/25 sm:inset-y-6 sm:left-3" />

          <div className="relative z-10 flex min-w-0 flex-col gap-4 pl-2 sm:gap-5 sm:pl-4">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="size-10 shrink-0 rounded-lg bg-muted sm:size-12 md:size-14" />
              <div className="min-w-0 flex-1">
                <div className="h-4 w-28 rounded-md bg-muted" />
                <div className="mt-2 h-7 w-3/4 rounded-md bg-muted sm:w-2/3" />
              </div>
            </div>
            <div className="h-12 max-w-xl rounded-md bg-muted/80" />
            <div className="flex flex-wrap gap-2">
              <div className="h-10 w-32 rounded-md bg-muted" />
              <div className="h-10 w-32 rounded-md bg-muted/80" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
