import { lazy, Suspense } from "react";
import { ActivityEmptyState } from "@/features/activity/components/activity-page/activity-conversation-stage/activity-empty-state";
import { ActivityConversationStageSkeleton } from "@/features/activity/components/activity-page/activity-page-skeleton";
import { ActivitySidebar } from "@/features/activity/components/activity-page/activity-sidebar";
import type { ActivityWorkspace } from "@/features/activity/hooks/use-activity";
import { cn } from "@/shared/lib/utils";

const ActivityConversationStage = lazy(() =>
  import(
    "@/features/activity/components/activity-page/activity-conversation-stage"
  ).then((module) => ({
    default: module.ActivityConversationStage,
  })),
);

const ActivityRealtimeSync = lazy(() =>
  import(
    "@/features/activity/components/activity-page/activity-realtime-sync"
  ).then((module) => ({
    default: module.ActivityRealtimeSync,
  })),
);

interface ActivityPageContentProps {
  activity: ActivityWorkspace;
  contained?: boolean;
  isMobile: boolean;
  isOnline: boolean;
}

function getFrameClassName(contained: boolean, hasSelection: boolean) {
  return cn(
    "top-0 flex h-dvh min-h-0 overflow-clip bg-canvas",
    hasSelection ? "pb-0" : "pb-app-bottom-nav md:pb-0",
    contained ? "absolute inset-0" : "fixed inset-0 md:left-14",
  );
}

export function ActivityPageContent({
  activity,
  contained = false,
  isMobile,
  isOnline,
}: ActivityPageContentProps) {
  return (
    <div className={getFrameClassName(contained, activity.hasSelection)}>
      <h1 id="activity-heading" className="sr-only">
        Activity
      </h1>
      <ActivitySidebar activity={activity} isOnline={isOnline} />

      <section
        aria-labelledby="activity-heading"
        className={cn(
          "flex h-full min-h-0 min-w-0 flex-1 duration-300",
          !activity.hasSelection && "hidden md:flex",
        )}
      >
        {activity.hasSelection ? (
          <Suspense
            fallback={
              <div className="flex h-full min-h-0 min-w-0 flex-1 overflow-hidden">
                <ActivityConversationStageSkeleton />
              </div>
            }
          >
            <ActivityConversationStage
              activity={activity}
              isMobile={isMobile}
              isOnline={isOnline}
            />
          </Suspense>
        ) : (
          <ActivityEmptyState />
        )}
      </section>

      <Suspense fallback={null}>
        <ActivityRealtimeSync
          activeChatId={
            activity.selectedKind === "group"
              ? (activity.selectedGroup?.chat?.id ?? null)
              : activity.selectedKind === "dm"
                ? (activity.selectedChat?.id ?? null)
                : null
          }
          activeGroupId={
            activity.selectedKind === "group"
              ? (activity.selectedGroup?.id ?? null)
              : null
          }
          activePlanId={
            activity.selectedKind === "group"
              ? (activity.selectedGroup?.plan?.id ?? null)
              : null
          }
        />
      </Suspense>
    </div>
  );
}
