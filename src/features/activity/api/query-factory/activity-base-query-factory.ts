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

  groupRatings(groupId: string) {
    return ActivityQueryOptions.groupRatings(groupId);
  },

  linkPreview(url: string) {
    return ActivityQueryOptions.linkPreview(url);
  },
};
