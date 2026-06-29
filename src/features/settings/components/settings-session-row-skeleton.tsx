import { SkeletonButton } from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function SettingsSessionRowSkeleton({
  active = false,
}: {
  active?: boolean;
}) {
  return (
    <div className="md:main-action-grid grid gap-4 border-border border-b py-5 last:border-b-0 md:items-center">
      <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-4">
        <Skeleton
          shape="circle"
          className="size-10"
          tone={active ? "teal" : "default"}
        />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-5 w-32" tone={active ? "teal" : "default"} />
            {active ? (
              <Skeleton shape="pill" className="h-5 w-16" tone="teal" />
            ) : null}
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {[0, 1, 2].map((metaItem) => (
              <div key={metaItem} className="flex min-w-0 items-center gap-2">
                <Skeleton shape="circle" className="size-3.5 shrink-0" />
                <Skeleton className="h-3 min-w-0 flex-1" />
              </div>
            ))}
          </div>
          <Skeleton className="mt-3 h-3 w-full max-w-80" />
        </div>
      </div>
      <SkeletonButton className="h-10 w-24" />
    </div>
  );
}
