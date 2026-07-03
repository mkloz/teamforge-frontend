import { DirectConversationStage } from "@/features/activity/components/activity-page/activity-conversation-stage/activity-selected-conversation-stage/direct-conversation-stage";
import { EmptyConversationStage } from "@/features/activity/components/activity-page/activity-conversation-stage/activity-selected-conversation-stage/empty-conversation-stage";
import { GroupConversationStage } from "@/features/activity/components/activity-page/activity-conversation-stage/activity-selected-conversation-stage/group-conversation-stage";
import { SavedMessagesStage } from "@/features/activity/components/activity-page/activity-conversation-stage/activity-selected-conversation-stage/saved-messages-stage";
import {
  openDirectProfilePanel,
  openSavedMessage,
} from "@/features/activity/components/activity-page/activity-conversation-stage/activity-selected-conversation-stage/selected-stage-state";
import type { SelectedConversationStageContentProps } from "@/features/activity/components/activity-page/activity-conversation-stage/activity-selected-conversation-stage/types";

export function SelectedConversationStageContent({
  activity,
  composer,
  groupDetailPanelSelection,
  groupMessageScrollHandleRef,
  runtime,
  selectedStage,
  viewport,
}: SelectedConversationStageContentProps) {
  switch (selectedStage.kind) {
    case "saved":
      return (
        <SavedMessagesStage
          activity={activity}
          onOpenMessage={(snapshot) => openSavedMessage(activity, snapshot)}
        />
      );

    case "group":
      return (
        <GroupConversationStage
          activity={activity}
          composer={composer}
          groupMessageScrollHandleRef={groupMessageScrollHandleRef}
          runtime={runtime}
          selectedGroup={selectedStage.selectedGroup}
          selectedGroupMemberId={
            groupDetailPanelSelection.selectedGroupMemberId
          }
          onCloseGroupDetailPanel={
            groupDetailPanelSelection.closeGroupDetailPanel
          }
          onOpenCurrentPlanInGroupPanel={
            groupDetailPanelSelection.openCurrentPlanInGroupPanel
          }
          onOpenGroupMemberProfile={
            groupDetailPanelSelection.openGroupMemberProfile
          }
          onSelectedGroupMemberIdChange={
            groupDetailPanelSelection.setSelectedGroupMemberId
          }
          onToggleGroupDetailPanel={
            groupDetailPanelSelection.toggleGroupDetailPanel
          }
        />
      );

    case "dm":
      return (
        <DirectConversationStage
          activity={activity}
          composer={composer}
          runtime={runtime}
          selectedChat={selectedStage.selectedChat}
          viewport={viewport}
          onOpenDirectProfilePanel={() => openDirectProfilePanel(activity)}
        />
      );

    case "empty":
      return <EmptyConversationStage />;
  }

  return <EmptyConversationStage />;
}
