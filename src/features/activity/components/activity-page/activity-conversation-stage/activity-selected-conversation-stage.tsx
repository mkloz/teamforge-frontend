import { type RefObject, useRef, useState } from "react";
import { SavedMessagesConversationView } from "@/features/activity/components/chat/saved-messages-conversation-view";
import { UnifiedConversationView } from "@/features/activity/components/chat/unified-conversation-view";
import type { MessageScrollHandle } from "@/features/activity/components/chat/unified-conversation-view/unified-message-list/message-scroll.types";
import {
  ProfilePanel,
  ProfilePanelMobile,
} from "@/features/activity/components/direct-chats/profile-panel";
import { GroupDetailPanel } from "@/features/activity/components/groups/group-detail-panel";
import type { ActivityWorkspace } from "@/features/activity/hooks/use-activity";
import { useActivityComposer } from "@/features/activity/hooks/use-activity-composer";
import type { ActivityParticipant } from "@/features/activity/lib/activity-contract";
import type { SavedMessageSnapshot } from "@/features/activity/lib/saved-message";
import { SAVED_MESSAGES_CONVERSATION_ID } from "@/features/activity/lib/saved-messages-identity";

import { ActivityEmptyState } from "./activity-empty-state";

interface ActivitySelectedConversationStageProps {
  activity: ActivityWorkspace;
  isMobile: boolean;
  isOnline: boolean;
}

interface SelectedGroupMemberProfile {
  groupId: string;
  memberId: string;
}

type ActivityComposer = ReturnType<typeof useActivityComposer>;
type SelectedGroup = NonNullable<ActivityWorkspace["selectedGroup"]>;
type SelectedChat = NonNullable<ActivityWorkspace["selectedChat"]>;
type SelectedConversationStageKind = "dm" | "empty" | "group" | "saved";

function getSelectedGroupMemberId(
  selectedGroupMemberProfile: SelectedGroupMemberProfile | null,
  selectedGroupId: string | null,
) {
  return selectedGroupMemberProfile?.groupId === selectedGroupId
    ? selectedGroupMemberProfile.memberId
    : null;
}

function getGroupParticipantMemberId(
  selectedGroup: SelectedGroup,
  participant: ActivityParticipant,
) {
  return (
    selectedGroup.members?.find(
      (groupMember) => groupMember.userId === participant.id,
    )?.userId ?? null
  );
}

function useGroupDetailPanelSelection(activity: ActivityWorkspace) {
  const [selectedGroupMemberProfile, setSelectedGroupMemberProfile] =
    useState<SelectedGroupMemberProfile | null>(null);
  const selectedGroupId = activity.selectedGroup?.id ?? null;
  const selectedGroupMemberId = getSelectedGroupMemberId(
    selectedGroupMemberProfile,
    selectedGroupId,
  );

  function openGroupMemberProfile(participant: ActivityParticipant) {
    const selectedGroup = activity.selectedGroup;

    if (!selectedGroup) {
      return;
    }

    const memberId = getGroupParticipantMemberId(selectedGroup, participant);

    if (!memberId) {
      return;
    }

    setSelectedGroupMemberProfile({
      groupId: selectedGroup.id,
      memberId,
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

  function openCurrentPlanInGroupPanel() {
    const currentPlanId = activity.selectedGroup?.plan?.id;

    if (!currentPlanId) {
      if (!activity.groups.isDetailPanelOpen) {
        activity.toggleGroupDetail();
      }

      return;
    }

    setSelectedGroupMemberProfile(null);
    activity.focusGroupPlan(currentPlanId);
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

  return {
    closeGroupDetailPanel,
    openCurrentPlanInGroupPanel,
    openGroupMemberProfile,
    selectedGroupMemberId,
    setSelectedGroupMemberId,
    toggleGroupDetailPanel,
  };
}

export function ActivitySelectedConversationStage({
  activity,
  isMobile,
  isOnline,
}: ActivitySelectedConversationStageProps) {
  const composer = useActivityComposer();
  const groupMessageScrollHandleRef = useRef<MessageScrollHandle | null>(null);
  const { isMessageInitialError, isMessageInitialLoading } =
    getInitialMessageTimelineState(activity, isOnline);
  const selectedStageKind = getSelectedConversationStageKind(activity);
  const {
    closeGroupDetailPanel,
    openCurrentPlanInGroupPanel,
    openGroupMemberProfile,
    selectedGroupMemberId,
    setSelectedGroupMemberId,
    toggleGroupDetailPanel,
  } = useGroupDetailPanelSelection(activity);

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

  if (selectedStageKind === "saved") {
    return (
      <SavedMessagesStage
        activity={activity}
        onOpenMessage={openSavedMessage}
      />
    );
  }

  if (selectedStageKind === "group" && activity.selectedGroup) {
    const selectedGroup = activity.selectedGroup;

    return (
      <GroupConversationStage
        activity={activity}
        composer={composer}
        groupMessageScrollHandleRef={groupMessageScrollHandleRef}
        isMessageInitialError={isMessageInitialError}
        isMessageInitialLoading={isMessageInitialLoading}
        isOnline={isOnline}
        selectedGroup={selectedGroup}
        selectedGroupMemberId={selectedGroupMemberId}
        onCloseGroupDetailPanel={closeGroupDetailPanel}
        onOpenCurrentPlanInGroupPanel={openCurrentPlanInGroupPanel}
        onOpenGroupMemberProfile={openGroupMemberProfile}
        onSelectedGroupMemberIdChange={setSelectedGroupMemberId}
        onToggleGroupDetailPanel={toggleGroupDetailPanel}
      />
    );
  }

  if (selectedStageKind === "dm" && activity.selectedChat) {
    const selectedChat = activity.selectedChat;

    return (
      <DirectConversationStage
        activity={activity}
        composer={composer}
        isMessageInitialError={isMessageInitialError}
        isMessageInitialLoading={isMessageInitialLoading}
        isMobile={isMobile}
        isOnline={isOnline}
        selectedChat={selectedChat}
        onOpenDirectProfilePanel={openDirectProfilePanel}
      />
    );
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1">
      <ActivityEmptyState />
    </div>
  );
}

function getInitialMessageTimelineState(
  activity: ActivityWorkspace,
  isOnline: boolean,
) {
  return {
    isMessageInitialError:
      activity.isMessageTimelineError ||
      (!isOnline && activity.isMessageTimelineLoading),
    isMessageInitialLoading: isOnline && activity.isMessageTimelineLoading,
  };
}

function getSelectedConversationStageKind(
  activity: ActivityWorkspace,
): SelectedConversationStageKind {
  if (isSavedMessagesStageSelected(activity)) {
    return "saved";
  }

  if (isGroupStageSelected(activity)) {
    return "group";
  }

  if (isDirectStageSelected(activity)) {
    return "dm";
  }

  return "empty";
}

function isSavedMessagesStageSelected(activity: ActivityWorkspace) {
  return (
    activity.selectedKind === "saved" &&
    activity.selectedId === SAVED_MESSAGES_CONVERSATION_ID
  );
}

function isGroupStageSelected(activity: ActivityWorkspace) {
  return Boolean(
    activity.selectedKind === "group" &&
      activity.selectedId &&
      activity.selectedGroup,
  );
}

function isDirectStageSelected(activity: ActivityWorkspace) {
  return Boolean(
    activity.selectedKind === "dm" &&
      activity.selectedId &&
      activity.selectedChat,
  );
}

interface SavedMessagesStageProps {
  activity: ActivityWorkspace;
  onOpenMessage: (snapshot: SavedMessageSnapshot) => void;
}

function SavedMessagesStage({
  activity,
  onOpenMessage,
}: SavedMessagesStageProps) {
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 overflow-hidden">
      <SavedMessagesConversationView
        conversations={activity.allItems}
        isError={activity.isSavedMessagesError}
        isLoading={activity.isSavedMessagesLoading}
        isRetrying={activity.isSavedMessagesRetrying}
        savedMessages={activity.savedMessages}
        onBack={activity.handleBack}
        onOpenMessage={onOpenMessage}
        onRemoveMessage={activity.removeSavedMessage}
        onRetry={activity.retrySavedMessages}
      />
    </div>
  );
}

interface GroupConversationStageProps {
  activity: ActivityWorkspace;
  composer: ActivityComposer;
  groupMessageScrollHandleRef: RefObject<MessageScrollHandle | null>;
  isMessageInitialError: boolean;
  isMessageInitialLoading: boolean;
  isOnline: boolean;
  selectedGroup: SelectedGroup;
  selectedGroupMemberId: string | null;
  onCloseGroupDetailPanel: () => void;
  onOpenCurrentPlanInGroupPanel: () => void;
  onOpenGroupMemberProfile: (participant: ActivityParticipant) => void;
  onSelectedGroupMemberIdChange: (memberId: string | null) => void;
  onToggleGroupDetailPanel: () => void;
}

function GroupConversationStage({
  activity,
  composer,
  groupMessageScrollHandleRef,
  isMessageInitialError,
  isMessageInitialLoading,
  isOnline,
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
        <UnifiedConversationView
          kind="group"
          data={selectedGroup}
          messages={activity.selectedGroupMessages}
          typingUsers={activity.typingUsers}
          focusedMessageId={activity.focusedMessageId}
          firstUnreadMessageId={activity.firstUnreadMessageId}
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

interface DirectConversationStageProps {
  activity: ActivityWorkspace;
  composer: ActivityComposer;
  isMessageInitialError: boolean;
  isMessageInitialLoading: boolean;
  isMobile: boolean;
  isOnline: boolean;
  selectedChat: SelectedChat;
  onOpenDirectProfilePanel: () => void;
}

function DirectConversationStage({
  activity,
  composer,
  isMessageInitialError,
  isMessageInitialLoading,
  isMobile,
  isOnline,
  selectedChat,
  onOpenDirectProfilePanel,
}: DirectConversationStageProps) {
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 overflow-hidden">
      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
        <UnifiedConversationView
          kind="dm"
          data={selectedChat}
          messages={activity.selectedDirectMessages}
          isTyping={activity.isTyping}
          focusedMessageId={activity.focusedMessageId}
          firstUnreadMessageId={activity.firstUnreadMessageId}
          hasOlderMessages={activity.hasOlderMessages}
          isLoadingMessages={isMessageInitialLoading}
          isLoadingOlderMessages={activity.isLoadingOlderMessages}
          isMessageError={isMessageInitialError}
          isOnline={isOnline}
          isActionOpen={activity.direct.isProfilePanelOpen}
          openHeaderDetailsInPanel={isMobile}
          onBack={activity.handleBack}
          onLoadOlderMessages={activity.loadOlderMessages}
          onRetryMessages={activity.retryMessageTimeline}
          onShowParticipantProfile={onOpenDirectProfilePanel}
          onToggleAction={activity.toggleProfilePanel}
          onSendMessage={composer.handleSendMessage}
          sendError={composer.sendError}
          onClearSendError={composer.clearSendError}
        />
      </div>
      <ProfilePanel
        chat={selectedChat}
        isOpen={activity.direct.isProfilePanelOpen}
        onClose={activity.closeProfilePanel}
      />
      {isMobile && (
        <ProfilePanelMobile
          chat={selectedChat}
          isOpen={activity.direct.isProfilePanelOpen}
          onClose={activity.closeProfilePanel}
        />
      )}
    </div>
  );
}
