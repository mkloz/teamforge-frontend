import { useRef } from "react";
import { SelectedConversationStageContent } from "@/features/activity/components/activity-page/activity-conversation-stage/activity-selected-conversation-stage/selected-conversation-stage-content";
import {
  getConversationStageRuntime,
  getSelectedConversationStage,
} from "@/features/activity/components/activity-page/activity-conversation-stage/activity-selected-conversation-stage/selected-stage-state";
import type {
  ActivitySelectedConversationStageProps,
  ConversationStageViewport,
} from "@/features/activity/components/activity-page/activity-conversation-stage/activity-selected-conversation-stage/types";
import { useGroupDetailPanelSelection } from "@/features/activity/components/activity-page/activity-conversation-stage/activity-selected-conversation-stage/use-group-detail-panel-selection";
import type { MessageScrollHandle } from "@/features/activity/components/conversation-workspace/message-timeline/message-scroll.types";
import { useActivityComposer } from "@/features/activity/hooks/use-activity-composer";

export function ActivitySelectedConversationStage({
  activity,
  isMobile,
  isOnline,
}: ActivitySelectedConversationStageProps) {
  const composer = useActivityComposer();
  const groupMessageScrollHandleRef = useRef<MessageScrollHandle | null>(null);
  const runtime = getConversationStageRuntime(activity, isOnline);
  const viewport: ConversationStageViewport = isMobile ? "mobile" : "desktop";
  const selectedStage = getSelectedConversationStage(activity);
  const groupDetailPanelSelection = useGroupDetailPanelSelection(activity);

  return (
    <SelectedConversationStageContent
      activity={activity}
      composer={composer}
      groupDetailPanelSelection={groupDetailPanelSelection}
      groupMessageScrollHandleRef={groupMessageScrollHandleRef}
      runtime={runtime}
      selectedStage={selectedStage}
      viewport={viewport}
    />
  );
}
