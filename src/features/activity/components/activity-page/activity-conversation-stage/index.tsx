import { lazy, type ReactNode, Suspense } from "react";
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

type ConversationStageState =
  | "empty"
  | "loading"
  | "missing"
  | "selected"
  | "selection-error";
type ConversationDataKind = Extract<
  NonNullable<ActivityWorkspace["selectedKind"]>,
  "dm" | "group"
>;

const SELECTED_CONVERSATION_DATA_PRESENT: Record<
  ConversationDataKind,
  (activity: ActivityWorkspace) => boolean
> = {
  dm: (activity) => Boolean(activity.selectedChat),
  group: (activity) => Boolean(activity.selectedGroup),
};

function getConversationStageState(
  activity: ActivityWorkspace,
  isOnline: boolean,
): ConversationStageState {
  if (isSelectionLoading(activity, isOnline)) {
    return "loading";
  }

  if (shouldShowSelectionError(activity, isOnline)) {
    return "selection-error";
  }

  if (isSelectedConversationMissing(activity)) {
    return "missing";
  }

  return activity.selectedKind && activity.selectedId ? "selected" : "empty";
}

function isSelectionLoading(activity: ActivityWorkspace, isOnline: boolean) {
  return (
    activity.hasSelection && activity.isSelectedConversationLoading && isOnline
  );
}

function shouldShowSelectionError(
  activity: ActivityWorkspace,
  isOnline: boolean,
) {
  return (
    activity.hasSelection &&
    (activity.isSelectedConversationError ||
      (!isOnline && activity.isSelectedConversationLoading))
  );
}

function isSelectedConversationMissing(activity: ActivityWorkspace) {
  if (
    !hasSelectedConversationReference(activity) ||
    !isConversationDataKind(activity.selectedKind)
  ) {
    return false;
  }

  return !SELECTED_CONVERSATION_DATA_PRESENT[activity.selectedKind](activity);
}

function hasSelectedConversationReference(activity: ActivityWorkspace) {
  return Boolean(activity.selectedKind && activity.selectedId);
}

function isConversationDataKind(
  selectedKind: ActivityWorkspace["selectedKind"],
): selectedKind is ConversationDataKind {
  return selectedKind === "group" || selectedKind === "dm";
}

function ConversationStageFrame({
  children,
  withMinWidth = true,
}: {
  children: ReactNode;
  withMinWidth?: boolean;
}) {
  return (
    <div
      className={
        withMinWidth
          ? "flex h-full min-h-0 min-w-0 flex-1 overflow-hidden"
          : "flex h-full min-h-0 min-w-0 flex-1"
      }
    >
      {children}
    </div>
  );
}

function LoadingConversationStage() {
  return (
    <ConversationStageFrame>
      <ActivityConversationStageSkeleton />
    </ConversationStageFrame>
  );
}

function SelectionErrorStage({
  activity,
  isOnline,
}: {
  activity: ActivityWorkspace;
  isOnline: boolean;
}) {
  return (
    <ConversationStageFrame>
      <ActivityConversationFeedback
        actionLabel="Try again"
        description={
          isOnline
            ? "We couldn't load this conversation. Try again."
            : "Reconnect to load this conversation."
        }
        title={isOnline ? "Conversation did not load" : "You are offline"}
        variant={isOnline ? "error" : "offline"}
        onAction={activity.retrySelectedConversation}
      />
    </ConversationStageFrame>
  );
}

function MissingConversationStage({
  activity,
}: {
  activity: ActivityWorkspace;
}) {
  return (
    <ConversationStageFrame>
      <ActivityConversationFeedback
        actionLabel="Back to list"
        description="It may have been removed, or you may no longer have access to it."
        title="Conversation unavailable"
        variant="missing"
        onAction={activity.handleBack}
      />
    </ConversationStageFrame>
  );
}

function SelectedConversationStage({
  activity,
  isMobile,
  isOnline,
}: ActivityConversationStageProps) {
  return (
    <Suspense fallback={<LoadingConversationStage />}>
      <ActivitySelectedConversationStage
        activity={activity}
        isMobile={isMobile}
        isOnline={isOnline}
      />
    </Suspense>
  );
}

export function ActivityConversationStage({
  activity,
  isMobile,
  isOnline,
}: ActivityConversationStageProps) {
  const stageState = getConversationStageState(activity, isOnline);

  if (stageState === "loading") {
    return <LoadingConversationStage />;
  }

  if (stageState === "selection-error") {
    return <SelectionErrorStage activity={activity} isOnline={isOnline} />;
  }

  if (stageState === "missing") {
    return <MissingConversationStage activity={activity} />;
  }

  if (stageState === "selected") {
    return (
      <SelectedConversationStage
        activity={activity}
        isMobile={isMobile}
        isOnline={isOnline}
      />
    );
  }

  return (
    <ConversationStageFrame withMinWidth={false}>
      <ActivityEmptyState />
    </ConversationStageFrame>
  );
}
