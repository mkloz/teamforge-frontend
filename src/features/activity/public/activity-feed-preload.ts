import { activityQueries } from "@/features/activity/api/activity-queries";

export function getActivityFeedPreloadQueries() {
  return [
    activityQueries.groups(),
    activityQueries.chats(),
    activityQueries.friendships(),
    activityQueries.savedMessages(),
  ] as const;
}
