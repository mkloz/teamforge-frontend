import { Skeleton } from "@/shared/components/ui/skeleton";

export function MatchingSectionSkeleton() {
  return (
    <section className="flex flex-col gap-4">
      <div className="rounded-2xl bg-card p-3 sm:p-5">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="mt-2 h-3 w-80 max-w-full" />
        <div className="mt-5 grid grid-cols-3 gap-2">
          {["personality", "trust", "interests"].map((signal) => (
            <div
              key={signal}
              className="rounded-xl bg-background/55 p-2 sm:p-3"
            >
              <Skeleton className="h-3 w-16" />
              <Skeleton className="mt-2 h-6 w-12" tone="teal" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-card p-3 sm:p-5">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="mt-2 h-3 w-72 max-w-full" />
        <Skeleton className="mt-6 h-2 w-full" tone="teal" />
        <div className="mt-5 grid grid-cols-4 gap-2">
          {["open", "balanced", "strong", "strict"].map((preset) => (
            <Skeleton key={preset} className="h-14 rounded-xl" />
          ))}
        </div>
      </div>

      {["proposals", "invitations"].map((section) => (
        <div key={section} className="rounded-2xl bg-card p-3 sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-6 w-24 rounded-full" tone="teal" />
          </div>
          <Skeleton className="mt-3 h-3 w-80 max-w-full" />
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        </div>
      ))}
    </section>
  );
}
