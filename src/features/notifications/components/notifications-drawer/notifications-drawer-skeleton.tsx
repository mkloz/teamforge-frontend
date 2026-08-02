import { LoadingBlock } from "@/shared/components/loading/loading-block";
import { cn } from "@/shared/lib/utils";

const NOTIFICATION_SKELETON_ROWS = [
  "invite",
  "reply",
  "plan",
  "group",
] as const;

export function NotificationsDrawerSkeleton() {
  return (
    <div>
      <span className="sr-only">Loading notifications</span>
      <div className="sticky top-0 z-10 bg-canvas px-5 pt-4 pb-2">
        <LoadingBlock className="h-3 w-16 rounded-md" />
      </div>
      <div className="grouped-surface flex flex-col px-3 pb-4">
        {NOTIFICATION_SKELETON_ROWS.map((row, index) => (
          <div
            className="flex w-full items-start gap-3 bg-card px-4 py-3.5 text-left first:rounded-t-2xl last:rounded-b-2xl"
            key={row}
          >
            <LoadingBlock
              className={cn(
                "mt-0.5 size-10 shrink-0 rounded-md",
                index === 0 ? "bg-spark-amber/18" : "bg-forge-teal/12",
              )}
            />
            <div className="min-w-0 flex-1 flex-col gap-0.5">
              <LoadingBlock className="h-3.5 w-32 rounded-md" />
              <LoadingBlock className="h-3 w-full rounded-md" />
              <LoadingBlock
                className={cn(
                  "mt-1.5 h-3 rounded-md",
                  index % 2 === 0 ? "w-3/4" : "w-1/2",
                )}
              />
              <div className="mt-2 flex items-center gap-2">
                <LoadingBlock className="h-2.5 w-12 rounded-md" />
                {index === 0 ? (
                  <LoadingBlock className="size-2 rounded-full bg-forge-teal/35" />
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
