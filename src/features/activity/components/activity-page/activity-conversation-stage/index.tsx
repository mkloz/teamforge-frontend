import { useRef, useState } from "react";
import { ActivityConversationStageSkeleton } from "@/features/activity/components/activity-page/activity-page-skeleton";
import { SavedMessagesConversationView } from "@/features/activity/components/chat/saved-messages-conversation-view";
import { UnifiedConversationView } from "@/features/activity/components/chat/unified-conversation-view";
import type { MessageScrollHandle } from "@/features/activity/components/chat/unified-conversation-view/unified-message-list/message-scroll.types";
import {
  ProfilePanel,
  ProfilePanelMobile,
} from "@/features/activity/components/direct-chats/profile-panel";
import { GroupDetailPanel } from "@/features/activity/components/groups/group-detail-panel";
import type { ActivityWorkspace } from "@/features/activity/hooks/use-activity";
import type { ActivityParticipant } from "@/features/activity/lib/activity-contract";
import type { SavedMessageSnapshot } from "@/features/activity/lib/saved-message";
import { SAVED_MESSAGES_CONVERSATION_ID } from "@/features/activity/lib/saved-messages-identity";

import { ActivityConversationFeedback } from "./activity-conversation-feedback";
import { ActivityEmptyState } from "./activity-empty-state";

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
  const groupMessageScrollHandleRef = useRef<MessageScrollHandle | null>(null);
  const [selectedGroupMemberProfile, setSelectedGroupMemberProfile] = useState<{
    groupId: string;
    memberId: string;
  } | null>(null);
  const isSelectionLoading =
    activity.hasSelection && activity.isSelectedConversationLoading && isOnline;
  const shouldShowSelectionError =
    activity.hasSelection &&
    (activity.isSelectedConversationError ||
      (!isOnline && activity.isSelectedConversationLoading));
  const isMessageInitialLoading = isOnline && activity.isMessageTimelineLoading;
  const isMessageInitialError =
    activity.isMessageTimelineError ||
    (!isOnline && activity.isMessageTimelineLoading);
  const selectedGroupId = activity.selectedGroup?.id ?? null;
  const selectedGroupMemberId =
    selectedGroupMemberProfile?.groupId === selectedGroupId
      ? selectedGroupMemberProfile.memberId
      : null;

  function openGroupMemberProfile(participant: ActivityParticipant) {
    const selectedGroup = activity.selectedGroup;

    if (!selectedGroup) {
      return;
    }

    const member = selectedGroup.members?.find(
      (groupMember) => groupMember.userId === participant.id,
    );

    if (!member) {
      return;
    }

    setSelectedGroupMemberProfile({
      groupId: selectedGroup.id,
      memberId: member.userId,
    });

    if (!activity.groups.isDetailPanelOpen) {
      activity.toggleGroupDetail();
    }
  }

  function toggleGroupDetailPanel() {
    if (activity.groups.isDetailPanelOpen) {
      setSelectedGroupMemberProfile(null);
    }

    activity.toggleGroupDetail();
  }

  function closeGroupDetailPanel() {
    setSelectedGroupMemberProfile(null);
    activity.closeGroupDetail();
  }

  function setSelectedGroupMemberId(memberId: string | null) {
    if (!memberId || !selectedGroupId) {
      setSelectedGroupMemberProfile(null);
      return;
    }

    setSelectedGroupMemberProfile({ groupId: selectedGroupId, memberId });
  }

  function openDirectProfilePanel() {
    if (!activity.direct.isProfilePanelOpen) {
      activity.toggleProfilePanel();
    }
  }

  function openSavedMessage(snapshot: SavedMessageSnapshot) {
    activity.handleSelectItem(
      snapshot.conversationId,
      snapshot.conversationKind,
      {
        messageId: snapshot.message.id,
      },
    );
  }

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

  if (
    activity.selectedKind === "saved" &&
    activity.selectedId === SAVED_MESSAGES_CONVERSATION_ID
  ) {
    return (
      <div className="flex h-full min-h-0 min-w-0 flex-1 overflow-hidden">
        <SavedMessagesConversationView
          conversations={activity.allItems}
          isError={activity.isSavedMessagesError}
          isLoading={activity.isSavedMessagesLoading}
          isRetrying={activity.isSavedMessagesRetrying}
          savedMessages={activity.savedMessages}
          onBack={activity.handleBack}
          onOpenMessage={openSavedMessage}
          onRemoveMessage={activity.removeSavedMessage}
          onRetry={activity.retrySavedMessages}
        />
      </div>
    );
  }

  if (
    activity.selectedKind === "group" &&
    activity.selectedId &&
    activity.selectedGroup
  ) {
    return (
      <div className="flex h-full min-h-0 min-w-0 flex-1 overflow-hidden">
        <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
          <UnifiedConversationView
            kind="group"
            data={activity.selectedGroup}
            messages={activity.selectedGroupMessages}
            typingUsers={activity.typingUsers}
            focusedMessageId={activity.focusedMessageId}
            hasOlderMessages={activity.hasOlderMessages}
            isLoadingMessages={isMessageInitialLoading}
            isLoadingOlderMessages={activity.isLoadingOlderMessages}
            isMessageError={isMessageInitialError}
            isOnline={isOnline}
            isActionOpen={activity.groups.isDetailPanelOpen}
            messageScrollHandleRef={groupMessageScrollHandleRef}
            onBack={activity.handleBack}
            onLoadOlderMessages={activity.loadOlderMessages}
            onRetryMessages={activity.retryMessageTimeline}
            onShowParticipantProfile={openGroupMemberProfile}
            onToggleAction={toggleGroupDetailPanel}
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
          selectedMemberId={selectedGroupMemberId}
          onSelectedMemberIdChange={setSelectedGroupMemberId}
          onClose={closeGroupDetailPanel}
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
      <div className="flex h-full min-h-0 min-w-0 flex-1 overflow-hidden">
        <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
          <UnifiedConversationView
            kind="dm"
            data={activity.selectedChat}
            messages={activity.selectedDirectMessages}
            isTyping={activity.isTyping}
            focusedMessageId={activity.focusedMessageId}
            hasOlderMessages={activity.hasOlderMessages}
            isLoadingMessages={isMessageInitialLoading}
            isLoadingOlderMessages={activity.isLoadingOlderMessages}
            isMessageError={isMessageInitialError}
            isOnline={isOnline}
            isActionOpen={activity.direct.isProfilePanelOpen}
            onBack={activity.handleBack}
            onLoadOlderMessages={activity.loadOlderMessages}
            onRetryMessages={activity.retryMessageTimeline}
            onShowParticipantProfile={openDirectProfilePanel}
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
    <div className="flex h-full min-h-0 min-w-0 flex-1">
      <ActivityEmptyState />
    </div>
  );
}
