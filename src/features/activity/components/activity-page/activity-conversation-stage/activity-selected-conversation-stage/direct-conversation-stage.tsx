import type {
  ActivityComposer,
  ConversationStageRuntime,
  ConversationStageViewport,
  SelectedChat,
} from "@/features/activity/components/activity-page/activity-conversation-stage/activity-selected-conversation-stage/types";
import { ConversationWorkspace } from "@/features/activity/components/conversation-workspace";
import {
  ProfilePanel,
  ProfilePanelMobile,
} from "@/features/activity/components/direct-chats/profile-panel";
import type { ActivityWorkspace } from "@/features/activity/hooks/use-activity";

interface DirectConversationStageProps {
  activity: ActivityWorkspace;
  composer: ActivityComposer;
  runtime: ConversationStageRuntime;
  selectedChat: SelectedChat;
  viewport: ConversationStageViewport;
  onOpenDirectProfilePanel: () => void;
}

export function DirectConversationStage({
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
        <ConversationWorkspace
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
