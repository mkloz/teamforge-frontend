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
type ConversationStageViewport = "desktop" | "mobile";
type GroupDetailPanelSelection = ReturnType<
  typeof useGroupDetailPanelSelection
>;

type SelectedConversationStage =
  | { kind: "dm"; selectedChat: SelectedChat }
  | { kind: "empty" }
  | { kind: "group"; selectedGroup: SelectedGroup }
  | { kind: "saved" };

const EMPTY_SELECTED_CONVERSATION_STAGE: SelectedConversationStage = {
  kind: "empty",
};

interface InitialMessageTimelineState {
  isError: boolean;
  isLoading: boolean;
}

interface ConversationStageRuntime {
  isOnline: boolean;
  messageTimeline: InitialMessageTimelineState;
}

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

interface SelectedConversationStageContentProps {
  activity: ActivityWorkspace;
  composer: ActivityComposer;
  groupDetailPanelSelection: GroupDetailPanelSelection;
  groupMessageScrollHandleRef: RefObject<MessageScrollHandle | null>;
  runtime: ConversationStageRuntime;
  selectedStage: SelectedConversationStage;
  viewport: ConversationStageViewport;
}

function SelectedConversationStageContent({
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

function EmptyConversationStage() {
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1">
      <ActivityEmptyState />
    </div>
  );
}

function getConversationStageRuntime(
  activity: ActivityWorkspace,
  isOnline: boolean,
): ConversationStageRuntime {
  return {
    isOnline,
    messageTimeline: {
      isError:
        activity.isMessageTimelineError ||
        (!isOnline && activity.isMessageTimelineLoading),
      isLoading: isOnline && activity.isMessageTimelineLoading,
    },
  };
}

function getSelectedConversationStage(
  activity: ActivityWorkspace,
): SelectedConversationStage {
  return (
    getSavedMessagesStage(activity) ??
    getGroupConversationStage(activity) ??
    getDirectConversationStage(activity) ??
    EMPTY_SELECTED_CONVERSATION_STAGE
  );
}

function getSavedMessagesStage(
  activity: ActivityWorkspace,
): SelectedConversationStage | null {
  if (isSavedMessagesStageSelected(activity)) {
    return { kind: "saved" };
  }

  return null;
}

function getGroupConversationStage(
  activity: ActivityWorkspace,
): SelectedConversationStage | null {
  if (
    activity.selectedKind === "group" &&
    activity.selectedId &&
    activity.selectedGroup
  ) {
    return { kind: "group", selectedGroup: activity.selectedGroup };
  }

  return null;
}

function getDirectConversationStage(
  activity: ActivityWorkspace,
): SelectedConversationStage | null {
  if (
    activity.selectedKind === "dm" &&
    activity.selectedId &&
    activity.selectedChat
  ) {
    return { kind: "dm", selectedChat: activity.selectedChat };
  }

  return null;
}

function isSavedMessagesStageSelected(activity: ActivityWorkspace) {
  return (
    activity.selectedKind === "saved" &&
    activity.selectedId === SAVED_MESSAGES_CONVERSATION_ID
  );
}

function openDirectProfilePanel(activity: ActivityWorkspace) {
  if (!activity.direct.isProfilePanelOpen) {
    activity.toggleProfilePanel();
  }
}

function openSavedMessage(
  activity: ActivityWorkspace,
  snapshot: SavedMessageSnapshot,
) {
  activity.handleSelectItem(
    snapshot.conversationId,
    snapshot.conversationKind,
    {
      messageId: snapshot.message.id,
    },
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
  runtime: ConversationStageRuntime;
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
        <UnifiedConversationView
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

interface DirectConversationStageProps {
  activity: ActivityWorkspace;
  composer: ActivityComposer;
  runtime: ConversationStageRuntime;
  selectedChat: SelectedChat;
  viewport: ConversationStageViewport;
  onOpenDirectProfilePanel: () => void;
}

function DirectConversationStage({
  activity,
  composer,
  runtime,
  selectedChat,
  viewport,
  onOpenDirectProfilePanel,
}: DirectConversationStageProps) {
  const isMobile = viewport === "mobile";

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
          isLoadingMessages={runtime.messageTimeline.isLoading}
          isLoadingOlderMessages={activity.isLoadingOlderMessages}
          isMessageError={runtime.messageTimeline.isError}
          isOnline={runtime.isOnline}
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
