import { lazy, Suspense } from "react";
import { ActivityConversationStageSkeleton } from "@/features/activity/components/activity-page/activity-page-skeleton";
import type { ActivityWorkspace } from "@/features/activity/hooks/use-activity";

import { ActivityConversationFeedback } from "./activity-conversation-feedback";
import { ActivityEmptyState } from "./activity-empty-state";

const ActivitySelectedConversationStage = lazy(() =>
  import("./activity-selected-conversation-stage").then((module) => ({
    default: module.ActivitySelectedConversationStage,
  })),
);

interface ActivityConversationStageProps {
  activity: ActivityWorkspace;
  isMobile: boolean;
  isOnline: boolean;
}

export function ActivityConversationStage({
  activity,
  isMobile,
  isOnline,
}: ActivityConversationStageProps) {
  const isSelectionLoading =
    activity.hasSelection && activity.isSelectedConversationLoading && isOnline;
  const shouldShowSelectionError =
    activity.hasSelection &&
    (activity.isSelectedConversationError ||
      (!isOnline && activity.isSelectedConversationLoading));

  if (isSelectionLoading) {
    return (
      <div className="flex h-full min-h-0 min-w-0 flex-1 overflow-hidden">
        <ActivityConversationStageSkeleton />
      </div>
    );
  }

  if (shouldShowSelectionError) {
    return (
      <div className="flex h-full min-h-0 min-w-0 flex-1 overflow-hidden">
        <ActivityConversationFeedback
          actionLabel="Try again"
          description={
            isOnline
              ? "Something interrupted this chat. Retry to load the latest details."
              : "This chat needs a fresh load before it can open. Reconnect and try again."
          }
          title={isOnline ? "Conversation did not load" : "You are offline"}
          variant={isOnline ? "error" : "offline"}
          onAction={activity.retrySelectedConversation}
        />
      </div>
    );
  }

  if (
    activity.selectedKind &&
    activity.selectedId &&
    activity.selectedKind !== "saved" &&
    ((activity.selectedKind === "group" && !activity.selectedGroup) ||
      (activity.selectedKind === "dm" && !activity.selectedChat))
  ) {
    return (
      <div className="flex h-full min-h-0 min-w-0 flex-1 overflow-hidden">
        <ActivityConversationFeedback
          actionLabel="Back to list"
          description="It may have been removed, or you may no longer have access to it."
          title="Conversation unavailable"
          variant="missing"
          onAction={activity.handleBack}
        />
      </div>
    );
  }

  if (activity.selectedKind && activity.selectedId) {
    return (
      <Suspense
        fallback={
          <div className="flex h-full min-h-0 min-w-0 flex-1 overflow-hidden">
            <ActivityConversationStageSkeleton />
          </div>
        }
      >
        <ActivitySelectedConversationStage
          activity={activity}
          isMobile={isMobile}
          isOnline={isOnline}
        />
      </Suspense>
    );
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1">
      <ActivityEmptyState />
    </div>
  );
}
