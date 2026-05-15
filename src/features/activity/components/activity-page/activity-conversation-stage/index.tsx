import { useRef } from "react";
import { UnifiedConversationView } from "@/features/activity/components/chat/unified-conversation-view";
import type { MessageScrollHandle } from "@/features/activity/components/chat/unified-conversation-view/unified-message-list/message-scroll.types";
import {
  ProfilePanel,
  ProfilePanelMobile,
} from "@/features/activity/components/direct-chats/profile-panel";
import { GroupDetailPanel } from "@/features/activity/components/groups/group-detail-panel";
import type { ActivityWorkspace } from "@/features/activity/hooks/use-activity";

import { ActivityEmptyState } from "./activity-empty-state";

interface ActivityConversationStageProps {
  activity: ActivityWorkspace;
  isMobile: boolean;
}

export function ActivityConversationStage({
  activity,
  isMobile,
}: ActivityConversationStageProps) {
  const groupMessageScrollHandleRef = useRef<MessageScrollHandle | null>(null);

  if (
    activity.selectedKind === "group" &&
    activity.selectedId &&
    activity.selectedGroup
  ) {
    return (
      <div className="flex flex-1 overflow-hidden">
        <div className="flex min-w-0 flex-1 flex-col">
          <UnifiedConversationView
            kind="group"
            data={activity.selectedGroup}
            messages={activity.selectedGroupMessages}
            typingUsers={activity.typingUsers}
            focusedMessageId={activity.focusedMessageId}
            hasOlderMessages={activity.hasOlderMessages}
            isLoadingOlderMessages={activity.isLoadingOlderMessages}
            isActionOpen={activity.groups.isDetailPanelOpen}
            messageScrollHandleRef={groupMessageScrollHandleRef}
            onBack={activity.handleBack}
            onLoadOlderMessages={activity.loadOlderMessages}
            onToggleAction={activity.toggleGroupDetail}
            onSendMessage={activity.handleSendMessage}
            sendError={activity.sendError}
            onClearSendError={activity.clearSendError}
          />
        </div>
        <GroupDetailPanel
          group={activity.selectedGroup}
          isOpen={activity.groups.isDetailPanelOpen}
          focusedPlanId={activity.focusedPlanId}
          focusedProposalId={activity.focusedProposalId}
          onClose={activity.closeGroupDetail}
          onJumpToMessage={(messageId) =>
            groupMessageScrollHandleRef.current?.scrollToMessage(messageId, {
              highlight: true,
            })
          }
        />
      </div>
    );
  }

  if (
    activity.selectedKind === "dm" &&
    activity.selectedId &&
    activity.selectedChat
  ) {
    return (
      <div className="flex flex-1 overflow-hidden">
        <div className="flex min-w-0 flex-1 flex-col">
          <UnifiedConversationView
            kind="dm"
            data={activity.selectedChat}
            messages={activity.selectedDirectMessages}
            isTyping={activity.isTyping}
            focusedMessageId={activity.focusedMessageId}
            hasOlderMessages={activity.hasOlderMessages}
            isLoadingOlderMessages={activity.isLoadingOlderMessages}
            isActionOpen={activity.direct.isProfilePanelOpen}
            onBack={activity.handleBack}
            onLoadOlderMessages={activity.loadOlderMessages}
            onToggleAction={activity.toggleProfilePanel}
            onSendMessage={activity.handleSendMessage}
            sendError={activity.sendError}
            onClearSendError={activity.clearSendError}
          />
        </div>
        <ProfilePanel
          chat={activity.selectedChat}
          isOpen={activity.direct.isProfilePanelOpen}
          onClose={activity.closeProfilePanel}
        />
        {isMobile && (
          <ProfilePanelMobile
            chat={activity.selectedChat}
            isOpen={activity.direct.isProfilePanelOpen}
            onClose={activity.closeProfilePanel}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-1">
      <ActivityEmptyState />
    </div>
  );
}
