import { SkeletonButton } from "@/shared/components/loading/skeleton-patterns";
import { GroupedMenuItem } from "@/shared/components/ui/grouped-menu";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

export function SettingsSessionRowSkeleton({
  active = false,
}: {
  active?: boolean;
}) {
  return (
    <GroupedMenuItem className={cn(active && "bg-(--grouped-menu-selected)")}>
      <div className="lg:main-action-grid grid gap-4 px-3 py-3 sm:px-5 sm:py-4 lg:items-center">
        <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-3">
          <Skeleton
            shape="circle"
            className="size-10"
            tone={active ? "teal" : "default"}
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton
                className="h-5 w-32"
                tone={active ? "teal" : "default"}
              />
              {active ? (
                <Skeleton shape="pill" className="h-5 w-16" tone="teal" />
              ) : null}
            </div>
            <div className="mt-2 flex gap-4">
              {[0, 1].map((metaItem) => (
                <div key={metaItem} className="flex min-w-0 items-center gap-2">
                  <Skeleton shape="circle" className="size-3.5 shrink-0" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </div>
            <Skeleton className="mt-2 h-3 w-full max-w-48" />
          </div>
        </div>
        <SkeletonButton className="h-9 w-full lg:w-24" />
      </div>
    </GroupedMenuItem>
  );
}
