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
      <div className="sticky top-0 z-10 border-border/60 border-b bg-canvas px-5 py-3">
        <LoadingBlock className="h-3 w-16 rounded-md" />
      </div>
      <div className="divide-y divide-border/55">
        {NOTIFICATION_SKELETON_ROWS.map((row, index) => (
          <div
            className="flex w-full items-start gap-3 px-5 py-4 text-left"
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
