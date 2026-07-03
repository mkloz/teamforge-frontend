import { useQuery } from "@tanstack/react-query";

import { activityQueries } from "@/features/activity/api/activity-queries";

export function useActivityFriendships() {
  return useQuery(activityQueries.friendships());
}
