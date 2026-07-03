import { activityQueryOptions } from "@/features/activity/api/activity-query-options";

export const ActivityBaseQueryFactory = {
  groups() {
    return activityQueryOptions.groups();
  },

  chats() {
    return activityQueryOptions.chats();
  },

  friendships() {
    return activityQueryOptions.friendships();
  },

  savedMessages() {
    return activityQueryOptions.savedMessages();
  },

  groupRatings(groupId: string) {
    return activityQueryOptions.groupRatings(groupId);
  },

  groupReviewState(groupId: string) {
    return activityQueryOptions.groupReviewState(groupId);
  },

  linkPreview(url: string) {
    return activityQueryOptions.linkPreview(url);
  },
};
