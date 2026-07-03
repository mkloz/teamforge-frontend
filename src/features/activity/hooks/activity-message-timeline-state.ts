import { buildSelectedGroupMessages } from "@/features/activity/hooks/activity-message-timeline-state/selected-group-messages";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import type { ActivityKind } from "@/shared/navigation/activity-navigation";

export {
  getChatUnreadCount,
  getFirstUnreadMessageId,
} from "@/features/activity/hooks/activity-message-timeline-state/unread-message";

interface CanLoadMessageTimelineInput {
  chatId: string | null;
  currentUserId: string | null;
  selectedParticipantCount: number;
}

interface MessageTimelineQueryStateInput {
  canLoadTimeline: boolean;
  hasMessageData: boolean;
  isError: boolean;
  isLoading: boolean;
}

interface SelectedGroupMessagesInput {
  flattenedMessages: UnifiedMessage[];
  proposalMessages: UnifiedMessage[];
  selectedKind: ActivityKind | null;
}

interface SelectedDirectMessagesInput {
  flattenedMessages: UnifiedMessage[];
  selectedKind: ActivityKind | null;
}

export function canLoadMessageTimeline({
  chatId,
  currentUserId,
  selectedParticipantCount,
}: CanLoadMessageTimelineInput) {
  return (
    Boolean(chatId) && selectedParticipantCount > 0 && currentUserId !== null
  );
}

export function getMessageTimelineQueryState({
  canLoadTimeline,
  hasMessageData,
  isError,
  isLoading,
}: MessageTimelineQueryStateInput) {
  return {
    isMessageTimelineError: canLoadTimeline && isError && !hasMessageData,
    isMessageTimelineLoading: canLoadTimeline && isLoading && !hasMessageData,
  };
}

export function getSelectedGroupMessages({
  flattenedMessages,
  proposalMessages,
  selectedKind,
}: SelectedGroupMessagesInput) {
  return selectedKind === "group"
    ? buildSelectedGroupMessages(flattenedMessages, proposalMessages)
    : [];
}

export function getSelectedDirectMessages({
  flattenedMessages,
  selectedKind,
}: SelectedDirectMessagesInput) {
  return selectedKind === "dm" ? flattenedMessages : [];
}

export function getSelectedTimelineMessages(
  selectedKind: ActivityKind | null,
  selectedGroupMessages: UnifiedMessage[],
  selectedDirectMessages: UnifiedMessage[],
) {
  if (selectedKind === "group") {
    return selectedGroupMessages;
  }

  if (selectedKind === "dm") {
    return selectedDirectMessages;
  }

  return [];
}
