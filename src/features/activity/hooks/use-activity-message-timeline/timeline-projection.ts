import { useMemo } from "react";
import { activityQueries } from "@/features/activity/api/activity-queries";
import {
  getFirstUnreadMessageId,
  getSelectedDirectMessages,
  getSelectedGroupMessages,
  getSelectedTimelineMessages,
} from "@/features/activity/hooks/activity-message-timeline-state";
import type {
  TimelineMessagesProjectionInput,
  TimelineUnreadProjectionInput,
} from "@/features/activity/hooks/use-activity-message-timeline/types";

export function useTimelineMessagesProjection({
  currentUserId,
  messagesData,
  proposalMessages,
  selectedKind,
  selectedParticipants,
}: TimelineMessagesProjectionInput) {
  const flattenedApiMessages = useMemo(
    () => activityQueries.flattenMessagePages(messagesData),
    [messagesData],
  );
  const flattenedMessages = useMemo(
    () =>
      activityQueries.mapMessages(
        flattenedApiMessages,
        selectedParticipants,
        currentUserId,
      ),
    [currentUserId, flattenedApiMessages, selectedParticipants],
  );
  const selectedGroupMessages = useMemo(
    () =>
      getSelectedGroupMessages({
        flattenedMessages,
        proposalMessages,
        selectedKind,
      }),
    [flattenedMessages, proposalMessages, selectedKind],
  );
  const selectedDirectMessages = useMemo(
    () =>
      getSelectedDirectMessages({
        flattenedMessages,
        selectedKind,
      }),
    [flattenedMessages, selectedKind],
  );
  const selectedTimelineMessages = useMemo(
    () =>
      getSelectedTimelineMessages(
        selectedKind,
        selectedGroupMessages,
        selectedDirectMessages,
      ),
    [selectedDirectMessages, selectedGroupMessages, selectedKind],
  );

  return {
    flattenedMessages,
    selectedDirectMessages,
    selectedGroupMessages,
    selectedTimelineMessages,
  };
}

export function useTimelineUnreadProjection({
  chatId,
  chats,
  currentUserId,
  selectedTimelineMessages,
}: TimelineUnreadProjectionInput) {
  const chatSummary = useMemo(
    () => chats?.find((chat) => chat.id === chatId) ?? null,
    [chatId, chats],
  );
  const computedFirstUnreadMessageId = useMemo(
    () =>
      getFirstUnreadMessageId({
        chatSummary,
        currentUserId,
        messages: selectedTimelineMessages,
      }),
    [chatSummary, currentUserId, selectedTimelineMessages],
  );

  return {
    chatSummary,
    computedFirstUnreadMessageId,
  };
}
