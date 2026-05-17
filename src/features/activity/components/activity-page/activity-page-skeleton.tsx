import { MessageListSkeletonPattern } from "@/features/activity/components/chat/unified-conversation-view/unified-message-list/message-list-skeleton-pattern";
import {
  SkeletonAvatar,
  SkeletonButton,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

interface ActivityPageSkeletonProps {
  contained?: boolean;
}

const CONVERSATION_ROWS = [
  "group",
  "direct",
  "plan",
  "quiet",
  "clay",
  "film",
  "tea",
  "museum",
  "run",
  "accessibility",
] as const;
const DETAIL_ROWS = ["members", "area", "joining", "created"] as const;

export function ActivityPageSkeleton({
  contained = false,
}: ActivityPageSkeletonProps) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading activity"
      className={cn(
        "top-0 flex h-dvh min-h-0 overflow-clip bg-canvas pb-app-bottom-nav md:pb-0",
        contained ? "absolute inset-0" : "fixed inset-0 md:left-14",
      )}
      role="status"
    >
      <span className="sr-only">Loading activity</span>
      <ActivitySidebarSkeleton />
      <ActivityConversationSkeleton />
    </div>
  );
}

function ActivitySidebarSkeleton() {
  return (
    <aside className="flex h-full min-h-0 w-full shrink-0 flex-col border-border border-r bg-canvas md:w-72 lg:w-80">
      <div className="flex-1 overflow-hidden">
        <div className="sticky top-0 z-10 bg-canvas/95 px-4 pt-2.5 pb-0.5 backdrop-blur">
          <Skeleton className="h-10 w-full rounded-full" />
        </div>

        <div className="border-border border-b px-2 py-1.5 md:px-4 md:py-1">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <Skeleton shape="pill" className="h-11 w-14 md:h-6" tone="teal" />
            <Skeleton shape="pill" className="h-11 w-20 md:h-6" />
            <Skeleton shape="pill" className="h-11 w-20 md:h-6" />
            <SkeletonButton className="ml-auto size-11 rounded-lg md:size-8" />
          </div>
        </div>

        <div className="flex flex-col pb-8">
          {CONVERSATION_ROWS.map((row, index) => (
            <div
              key={row}
              className={cn(
                "relative min-h-16 border-border border-b px-4 py-3",
                index === 0 && "bg-forge-teal/6",
              )}
            >
              {index === 0 ? (
                <span className="absolute inset-y-0 left-0 w-1 bg-forge-teal" />
              ) : null}
              <div className="flex items-start gap-3">
                <SkeletonAvatar
                  className="size-11 rounded-lg"
                  tone={index === 0 ? "teal" : "default"}
                />
                <div className="min-w-0 flex-1">
                  <SkeletonText
                    lines={2}
                    widths={
                      index % 2 === 0 ? ["w-2/3", "w-full"] : ["w-1/2", "w-4/5"]
                    }
                  />
                  {index > 3 ? (
                    <Skeleton className="mt-2 h-3 w-12" tone="teal" />
                  ) : null}
                </div>
                <Skeleton className="mt-1 h-3 w-8 shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function ActivityConversationSkeleton() {
  return (
    <main className="hidden min-w-0 flex-1 md:flex">
      <ActivityConversationStageSkeleton />
    </main>
  );
}

export function ActivityConversationStageSkeleton({
  showDetail = true,
}: {
  showDetail?: boolean;
} = {}) {
  return (
    <>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="fade-in flex h-full animate-in flex-col bg-canvas/40 duration-300">
          <header className="flex h-16 items-center justify-between gap-4 border-border border-b bg-card px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <SkeletonAvatar className="size-12 rounded-lg" tone="teal" />
              <Skeleton className="h-5 w-52 max-w-full" />
            </div>
            <div className="hidden gap-2 sm:flex">
              <SkeletonButton className="size-9" />
              <SkeletonButton className="size-9" />
            </div>
          </header>

          <div className="border-border border-b bg-card/70 px-4 py-2">
            <div className="flex min-h-9 items-center gap-3">
              <Skeleton className="h-5 w-20" tone="amber" />
              <Skeleton className="h-4 w-96 max-w-full" />
              <Skeleton shape="circle" className="ml-auto size-4" />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden bg-[radial-gradient(circle_at_1px_1px,color-mix(in_srgb,var(--color-ink)_22%,transparent)_1px,transparent_0)] bg-forge-teal/5 bg-size-[14px_14px]">
            <MessageListSkeletonPattern className="px-4 py-5" />
          </div>

          <footer className="border-border border-t bg-card p-4">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
              <Skeleton shape="circle" className="size-6" />
              <Skeleton className="h-5 flex-1" />
              <SkeletonButton className="size-9" />
              <SkeletonButton className="size-11" tone="teal" />
            </div>
          </footer>
        </div>
      </div>
      {showDetail ? <ActivityDetailSkeleton /> : null}
    </>
  );
}

function ActivityDetailSkeleton() {
  return (
    <aside className="hidden h-full w-96 flex-col border-border border-l bg-canvas lg:flex">
      <div className="flex h-16 items-center justify-between border-border border-b px-4 py-3">
        <Skeleton className="h-5 w-28" />
        <div className="flex gap-2">
          <SkeletonButton className="size-9" />
          <SkeletonButton className="size-9" />
        </div>
      </div>
      <div className="flex flex-col overflow-hidden">
        <div className="relative h-44 overflow-hidden border-border border-b">
          <Skeleton
            shape="square"
            className="absolute inset-0 rounded-lg"
            tone="teal"
          />
          <div className="absolute right-5 bottom-5 left-5 flex items-end gap-4">
            <Skeleton shape="square" className="size-20 shrink-0" tone="teal" />
            <SkeletonText lines={2} widths={["w-44", "w-32"]} />
          </div>
        </div>

        <div className="flex flex-col gap-5 p-4">
          <SkeletonText lines={2} widths={["w-full", "w-4/5"]} />

          <div className="grid grid-cols-2 gap-4">
            {DETAIL_ROWS.map((row, index) => (
              <div key={row} className="flex items-start gap-3">
                <Skeleton
                  shape="circle"
                  className="size-9"
                  tone={index === 0 ? "teal" : "default"}
                />
                <SkeletonText lines={2} size="sm" widths={["w-16", "w-24"]} />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1">
            {[0, 1, 2, 3, 4].map((item) => (
              <Skeleton
                key={item}
                className="h-2 flex-1"
                tone={item < 4 ? "teal" : "default"}
              />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <SkeletonButton className="h-11 w-full" />
            <SkeletonButton className="h-11 w-full" tone="teal" />
          </div>

          <section className="border-border border-t pt-5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-4 h-6 w-56" />
            <div className="mt-5 grid gap-4">
              <SkeletonText lines={2} widths={["w-36", "w-52"]} />
              <SkeletonText lines={2} widths={["w-32", "w-44"]} />
              <SkeletonText lines={2} widths={["w-24", "w-36"]} />
            </div>
          </section>
        </div>
      </div>
    </aside>
  );
}
