import {
  chatsQueryOptions,
  friendshipsQueryOptions,
  groupRatingsQueryOptions,
  groupReviewStateQueryOptions,
  groupsQueryOptions,
  linkPreviewQueryOptions,
} from "@/features/activity/api/query-options/activity-base-query-options";
import { conversationMessagesQueryOptions } from "@/features/activity/api/query-options/activity-message-query-options";
import type { ActivityQueryOptionsContext } from "@/features/activity/api/query-options/activity-query-options-context";
import {
  directSelectionQueryOptions,
  groupSelectionQueryOptions,
} from "@/features/activity/api/query-options/activity-selection-query-options";

export type { ActivityQueryOptionsContext } from "@/features/activity/api/query-options/activity-query-options-context";

export const ActivityQueryOptions = {
  groups() {
    return groupsQueryOptions();
  },

  chats() {
    return chatsQueryOptions();
  },

  friendships() {
    return friendshipsQueryOptions();
  },

  groupRatings(groupId: string) {
    return groupRatingsQueryOptions(groupId);
  },

  groupReviewState(groupId: string) {
    return groupReviewStateQueryOptions(groupId);
  },

  linkPreview(url: string) {
    return linkPreviewQueryOptions(url);
  },

  groupSelection(context: ActivityQueryOptionsContext, groupId: string) {
    return groupSelectionQueryOptions(context, groupId);
  },

  directSelection(context: ActivityQueryOptionsContext, chatId: string) {
    return directSelectionQueryOptions(context, chatId);
  },

  conversationMessages(chatId: string) {
    return conversationMessagesQueryOptions(chatId);
  },
};
