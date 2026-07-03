import type { RefObject } from "react";
import type {
  ActivityComposer,
  ConversationStageRuntime,
  SelectedGroup,
} from "@/features/activity/components/activity-page/activity-conversation-stage/activity-selected-conversation-stage/types";
import { ConversationWorkspace } from "@/features/activity/components/conversation-workspace";
import type { MessageScrollHandle } from "@/features/activity/components/conversation-workspace/message-timeline/message-scroll.types";
import { GroupDetailPanel } from "@/features/activity/components/groups/group-detail-panel";
import type { ActivityWorkspace } from "@/features/activity/hooks/use-activity";
import type { ActivityParticipant } from "@/features/activity/lib/activity-contract";

interface GroupConversationStageProps {
  activity: ActivityWorkspace;
  composer: ActivityComposer;
  groupMessageScrollHandleRef: RefObject<MessageScrollHandle | null>;
  runtime: ConversationStageRuntime;
  selectedGroup: SelectedGroup;
  selectedGroupMemberId: string | null;
  onCloseGroupDetailPanel: () => void;
  onOpenCurrentPlanInGroupPanel: () => void;
  onOpenGroupMemberProfile: (participant: ActivityParticipant) => void;
  onSelectedGroupMemberIdChange: (memberId: string | null) => void;
  onToggleGroupDetailPanel: () => void;
}

export function GroupConversationStage({
  activity,
  composer,
  groupMessageScrollHandleRef,
  runtime,
  selectedGroup,
  selectedGroupMemberId,
  onCloseGroupDetailPanel,
  onOpenCurrentPlanInGroupPanel,
  onOpenGroupMemberProfile,
  onSelectedGroupMemberIdChange,
  onToggleGroupDetailPanel,
}: GroupConversationStageProps) {
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 overflow-hidden">
      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
        <ConversationWorkspace
          kind="group"
          data={selectedGroup}
          messages={activity.selectedGroupMessages}
          typingUsers={activity.typingUsers}
          focusedMessageId={activity.focusedMessageId}
          firstUnreadMessageId={activity.firstUnreadMessageId}
          hasOlderMessages={activity.hasOlderMessages}
          isLoadingMessages={runtime.messageTimeline.isLoading}
          isLoadingOlderMessages={activity.isLoadingOlderMessages}
          isMessageError={runtime.messageTimeline.isError}
          isOnline={runtime.isOnline}
          isActionOpen={activity.groups.isDetailPanelOpen}
          messageScrollHandleRef={groupMessageScrollHandleRef}
          onBack={activity.handleBack}
          onLoadOlderMessages={activity.loadOlderMessages}
          onRetryMessages={activity.retryMessageTimeline}
          onShowParticipantProfile={onOpenGroupMemberProfile}
          onToggleAction={onToggleGroupDetailPanel}
          onViewPlan={onOpenCurrentPlanInGroupPanel}
          onSendMessage={composer.handleSendMessage}
          sendError={composer.sendError}
          onClearSendError={composer.clearSendError}
        />
      </div>
      <GroupDetailPanel
        group={selectedGroup}
        isOpen={activity.groups.isDetailPanelOpen}
        focusedPlanId={activity.focusedPlanId}
        focusedProposalId={activity.focusedProposalId}
        selectedMemberId={selectedGroupMemberId}
        onSelectedMemberIdChange={onSelectedGroupMemberIdChange}
        onClose={onCloseGroupDetailPanel}
      />
    </div>
  );
}
