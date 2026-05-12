import {
  SkeletonAvatar,
  SkeletonButton,
  SkeletonCard,
  SkeletonList,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

interface ActivityPageSkeletonProps {
  contained?: boolean;
}

const CONVERSATION_ROWS = ["group", "direct", "plan", "quiet"] as const;
const MESSAGE_ROWS = ["incoming-one", "own-one", "incoming-two"] as const;
const DETAIL_ROWS = ["members", "plan", "history"] as const;

export function ActivityPageSkeleton({
  contained = false,
}: ActivityPageSkeletonProps) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading activity"
      className={cn(
        "grid min-w-0 bg-background lg:grid-cols-12",
        contained ? "h-full" : "h-dvh",
      )}
      role="status"
    >
      <span className="sr-only">Loading activity</span>
      <ActivitySidebarSkeleton />
      <ActivityConversationSkeleton />
      <ActivityDetailSkeleton />
    </div>
  );
}

function ActivitySidebarSkeleton() {
  return (
    <aside className="hidden min-w-0 border-border border-r bg-card p-4 lg:col-span-3 lg:flex lg:flex-col lg:gap-4">
      <div className="flex items-center justify-between gap-3">
        <SkeletonText className="flex-1" lines={2} widths={["w-24", "w-36"]} />
        <SkeletonButton className="size-9" />
      </div>

      <Skeleton className="h-10 w-full" />

      <div className="flex gap-2">
        <Skeleton shape="pill" className="h-8 w-16" />
        <Skeleton shape="pill" className="h-8 w-20" />
        <Skeleton shape="pill" className="h-8 w-14" />
      </div>

      <div className="flex flex-col gap-2">
        {CONVERSATION_ROWS.map((row, index) => (
          <SkeletonCard
            key={row}
            className={cn(
              "p-3",
              index === 0 && "border-forge-teal/24 bg-forge-teal/6",
            )}
          >
            <div className="flex items-start gap-3">
              <SkeletonAvatar
                className="size-10"
                tone={index === 0 ? "teal" : "default"}
              />
              <div className="min-w-0 flex-1">
                <SkeletonText
                  lines={2}
                  widths={
                    index % 2 === 0 ? ["w-2/3", "w-full"] : ["w-1/2", "w-4/5"]
                  }
                />
              </div>
            </div>
          </SkeletonCard>
        ))}
      </div>
    </aside>
  );
}

function ActivityConversationSkeleton() {
  return (
    <main className="flex min-h-0 min-w-0 flex-col lg:col-span-9 xl:col-span-6">
      <header className="flex items-center justify-between gap-4 border-border border-b bg-card px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <SkeletonAvatar className="size-11" tone="teal" />
          <SkeletonText lines={2} widths={["w-36", "w-52"]} />
        </div>
        <div className="hidden gap-2 sm:flex">
          <SkeletonButton className="size-9" />
          <SkeletonButton className="size-9" />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-hidden bg-canvas px-4 py-5">
        {MESSAGE_ROWS.map((row, index) => (
          <div
            key={row}
            className={cn(
              "flex gap-3",
              index === 1 ? "justify-end" : "justify-start",
            )}
          >
            {index === 1 ? null : <SkeletonAvatar className="size-8" />}
            <div
              className={cn(
                "max-w-lg rounded-2xl border border-border bg-card p-3 shadow-sm",
                index === 1 && "bg-forge-teal/8",
              )}
            >
              <SkeletonText
                lines={index === 2 ? 3 : 2}
                widths={["w-48", "w-64", "w-40"]}
              />
            </div>
          </div>
        ))}
      </div>

      <footer className="border-border border-t bg-card p-4">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3">
          <Skeleton className="h-5 flex-1" />
          <SkeletonButton className="h-9 w-20" tone="teal" />
        </div>
      </footer>
    </main>
  );
}

function ActivityDetailSkeleton() {
  return (
    <aside className="hidden min-w-0 border-border border-l bg-card p-4 xl:col-span-3 xl:flex xl:flex-col xl:gap-4">
      <SkeletonCard className="p-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <SkeletonAvatar className="size-16" tone="teal" />
          <SkeletonText lines={2} widths={["w-36", "w-52"]} />
          <div className="flex gap-2">
            <Skeleton shape="pill" className="h-7 w-16" />
            <Skeleton shape="pill" className="h-7 w-20" tone="amber" />
          </div>
        </div>
      </SkeletonCard>

      <SkeletonList
        count={DETAIL_ROWS.length}
        renderItem={(index) => (
          <SkeletonCard className="p-4">
            <SkeletonText
              lines={index === 1 ? 4 : 3}
              widths={["w-1/3", "w-full", "w-4/5", "w-2/3"]}
            />
          </SkeletonCard>
        )}
      />
    </aside>
  );
}
