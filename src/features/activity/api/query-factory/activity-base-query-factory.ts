import { ActivityQueryOptions } from "@/features/activity/api/activity-query-options";

export const ActivityBaseQueryFactory = {
  groups() {
    return ActivityQueryOptions.groups();
  },

  chats() {
    return ActivityQueryOptions.chats();
  },

  friendships() {
    return ActivityQueryOptions.friendships();
  },

  savedMessages() {
    return ActivityQueryOptions.savedMessages();
  },

  groupRatings(groupId: string) {
    return ActivityQueryOptions.groupRatings(groupId);
  },

  groupReviewState(groupId: string) {
    return ActivityQueryOptions.groupReviewState(groupId);
  },

  linkPreview(url: string) {
    return ActivityQueryOptions.linkPreview(url);
  },
};
