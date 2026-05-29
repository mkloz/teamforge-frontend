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
const skeletonMessageBackgroundClassName = [
  "pointer-events-none absolute inset-0 z-0 select-none overflow-hidden bg-canvas [contain:paint]",
  "bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-forge-teal)_3%,transparent)_0%,transparent_34%,transparent_68%,color-mix(in_srgb,var(--color-spark-amber)_3%,transparent)_100%)]",
  "dark:bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-forge-teal)_4%,transparent)_0%,transparent_36%,transparent_70%,color-mix(in_srgb,var(--color-spark-amber)_4%,transparent)_100%)]",
].join(" ");

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
    <aside className="flex size-full min-h-0 shrink-0 flex-col border-border border-r bg-canvas md:w-72 lg:w-80">
      <div className="flex-1 overflow-hidden">
        <div className="sticky top-0 z-10 bg-canvas/95 px-4 pt-2.5 pb-0.5 backdrop-blur">
          <Skeleton className="h-9 w-full rounded-full" />
        </div>

        <div className="sticky top-0 z-20 border-border/60 border-b bg-canvas/85 px-3 py-2 backdrop-blur-md">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex min-w-0 flex-1 gap-1.5 overflow-hidden py-0.5 pr-1">
              <Skeleton
                shape="pill"
                className="h-8 w-14 shrink-0 md:h-7"
                tone="teal"
              />
              <Skeleton shape="pill" className="h-8 w-20 shrink-0 md:h-7" />
              <Skeleton shape="pill" className="h-8 w-20 shrink-0 md:h-7" />
            </div>
            <div className="border-border/40 border-l pl-2">
              <SkeletonButton className="size-8 rounded-full" />
            </div>
          </div>
        </div>

        <div className="flex flex-col pb-8 sm:pb-0">
          {CONVERSATION_ROWS.map((row, index) => (
            <div
              key={row}
              className={cn(
                "group/item relative flex w-full items-center gap-3.5 px-4 py-3.5",
                index === 0 && "bg-muted/60",
              )}
            >
              {index === 0 ? (
                <span className="absolute inset-y-0 left-0 w-1 bg-forge-teal" />
              ) : null}
              <div className="flex w-full min-w-0 items-start gap-3">
                <SkeletonAvatar
                  className="size-11 rounded-lg"
                  tone={index === 0 ? "teal" : "default"}
                />
                <div className="min-w-0 flex-1 py-0.5">
                  <SkeletonText
                    className="gap-2.5"
                    lines={2}
                    size="sm"
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
    <main className="hidden h-full min-h-0 min-w-0 flex-1 overflow-hidden md:flex">
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
      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
        <div className="fade-in flex h-full min-h-0 flex-1 animate-in flex-col overflow-hidden bg-canvas/40 duration-300">
          <header className="sticky top-0 z-100 flex min-h-15 shrink-0 items-center gap-1.5 border-border border-b bg-canvas/80 px-2.5 pt-2 pb-2.5 backdrop-blur-md md:min-h-16 md:gap-2 md:px-3 md:pt-3 md:pb-3">
            <div className="flex min-w-0 flex-1 items-center">
              <div className="-m-1 flex min-w-0 flex-1 items-center gap-3 rounded-lg p-1">
                <SkeletonAvatar className="size-10 rounded-md" tone="teal" />
                <div className="flex h-10 min-w-0 flex-1 flex-col justify-center gap-1.5">
                  <Skeleton className="h-3.5 w-52 max-w-full" />
                  <Skeleton className="h-2.5 w-28 max-w-full" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 pr-0.5 md:gap-1.5 md:pr-1">
              <SkeletonButton className="size-9 rounded-full" />
              <SkeletonButton className="size-9 rounded-full" />
            </div>
          </header>

          <div className="relative z-90 flex w-full shrink-0 items-center gap-2 border-border/50 border-b bg-canvas py-1.5 pr-2 pl-4">
            <span className="absolute inset-y-0 left-0 w-0.5 rounded-r-full bg-spark-amber" />
            <Skeleton
              shape="square"
              className="size-3.5 shrink-0"
              tone="amber"
            />
            <div className="flex min-w-0 flex-1 items-center gap-1.5">
              <Skeleton className="h-2.5 w-16 shrink-0" tone="amber" />
              <Skeleton className="h-2.5 w-1.5 shrink-0" />
              <Skeleton className="h-2.5 w-96 max-w-full" />
            </div>
            <Skeleton shape="circle" className="size-6 shrink-0" />
          </div>

          <div className="relative min-h-0 flex-1 overflow-hidden bg-canvas">
            <div
              aria-hidden="true"
              className={skeletonMessageBackgroundClassName}
            />
            <MessageListSkeletonPattern className="relative z-10 px-2 pt-2.5 pb-0 sm:px-3 md:px-4 md:pt-3" />
          </div>

          <footer className="isolate z-30 min-h-16 shrink-0 overflow-visible border-border/60 border-t bg-canvas/90 px-2.5 pt-2 pb-safe-bottom backdrop-blur-xl sm:px-3">
            <div className="mx-auto flex w-full items-center gap-2 sm:gap-2.5">
              <div className="relative min-w-0 flex-1">
                <div className="relative flex min-h-11 min-w-0 flex-1 rounded-full border border-border/50 bg-card/60 shadow-sm">
                  <div className="flex h-11 shrink-0 items-center gap-0.5 pl-1 sm:pl-1.5">
                    <SkeletonButton className="size-9 rounded-full" />
                    <SkeletonButton className="size-9 rounded-full" />
                  </div>
                  <div className="relative flex min-h-11 flex-1 items-center px-1.5 py-2">
                    <Skeleton className="h-4 w-56 max-w-full" />
                  </div>
                </div>
              </div>
              <div className="flex h-11 shrink-0 items-center">
                <SkeletonButton className="size-11 rounded-full" tone="teal" />
              </div>
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
      <div className="z-20 flex h-16 shrink-0 items-center justify-between border-border/70 border-b bg-canvas/95 px-5 backdrop-blur-md">
        <Skeleton className="h-5 w-28" />
        <div className="flex items-center gap-1">
          <SkeletonButton className="size-9 rounded-lg" />
          <SkeletonButton className="size-9 rounded-lg" />
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="relative h-40 shrink-0 overflow-hidden">
          <Skeleton
            shape="square"
            className="absolute inset-0 rounded-none"
            tone="teal"
          />
        </div>

        <div className="flex flex-col gap-7 px-5 pt-0 pb-7">
          <section className="relative -mt-12 flex flex-col gap-4">
            <div className="flex items-end gap-4">
              <Skeleton
                shape="square"
                className="size-20 shrink-0 rounded-xl shadow-lg ring-4 ring-canvas"
                tone="teal"
              />
              <div className="relative min-w-0 flex-1 pr-10 pb-1">
                <Skeleton
                  className="absolute top-0 right-0 size-8 rounded-lg"
                  tone="teal"
                />
                <Skeleton className="h-7 w-56 max-w-full" />
                <Skeleton className="mt-2 h-3 w-40 max-w-full" tone="teal" />
              </div>
            </div>

            <SkeletonText lines={2} widths={["w-full", "w-4/5"]} />

            <div className="flex flex-col gap-3 border-border/70 border-y py-3">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {DETAIL_ROWS.map((row, index) => (
                  <div key={row} className="flex items-center gap-2">
                    <Skeleton
                      shape="square"
                      className="size-8 rounded-lg"
                      tone={
                        index === 0 ? "teal" : index === 3 ? "amber" : "default"
                      }
                    />
                    <SkeletonText
                      className="min-w-0 flex-1 gap-1.5"
                      lines={2}
                      size="sm"
                      widths={["w-16", "w-20"]}
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Skeleton className="h-2.5 w-12 shrink-0" />
                <div className="flex min-w-0 flex-1 gap-1">
                  {[0, 1, 2, 3, 4].map((item) => (
                    <Skeleton
                      key={item}
                      className="h-1.5 flex-1 rounded-full"
                      tone={item < 4 ? "teal" : "default"}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <SkeletonButton className="h-9 min-w-0 flex-1 basis-32" />
              <SkeletonButton
                className="h-9 min-w-0 flex-1 basis-32"
                tone="teal"
              />
            </div>
          </section>

          <section className="border-border/70 border-t pt-5">
            <div className="flex flex-col gap-3 border-border/70 border-b pb-4">
              <div className="flex items-start justify-between gap-3">
                <Skeleton className="h-3 w-24" />
                <div className="flex gap-1.5">
                  <Skeleton shape="pill" className="h-5 w-12" tone="amber" />
                  <Skeleton shape="pill" className="h-5 w-20" tone="amber" />
                </div>
              </div>
              <Skeleton className="h-6 w-56 max-w-full" />
            </div>
            <SkeletonText
              className="mt-4"
              lines={3}
              widths={["w-52", "w-64", "w-36"]}
            />
          </section>
        </div>
      </div>
    </aside>
  );
}
