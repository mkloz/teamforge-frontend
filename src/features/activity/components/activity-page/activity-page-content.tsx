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
      <ActivitySidebar activity={activity} isOnline={isOnline} />

      <main
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
      </main>
    </div>
  );
}
