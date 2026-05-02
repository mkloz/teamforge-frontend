import { GroupDetailPanel } from "@/features/activity/components/groups/group-detail-panel";
import {
  ProfilePanel,
  ProfilePanelMobile,
} from "@/features/activity/components/direct-chats/profile-panel";
import { UnifiedConversationView } from "@/features/activity/components/chat/unified-conversation-view";
import type { MessageScrollHandle } from "@/features/activity/components/chat/unified-conversation-view/unified-message-list/message-scroll.types";
import type { ActivityWorkspace } from "@/features/activity/hooks/use-activity";
import { AnimatePresence, motion } from "framer-motion";
import { useRef } from "react";

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

  return (
    <AnimatePresence mode="wait">
      {activity.selectedKind === "group" &&
      activity.selectedId &&
      activity.selectedGroup ? (
        <motion.div
          key={`group-${activity.selectedId}`}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex-1 flex overflow-hidden"
        >
          <div className="flex-1 flex flex-col min-w-0">
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
        </motion.div>
      ) : activity.selectedKind === "dm" &&
        activity.selectedId &&
        activity.selectedChat ? (
        <motion.div
          key={`dm-${activity.selectedId}`}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex-1 flex overflow-hidden"
        >
          <div className="flex-1 flex flex-col min-w-0">
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
        </motion.div>
      ) : (
        <motion.div
          key="empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex-1 flex"
        >
          <ActivityEmptyState />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
