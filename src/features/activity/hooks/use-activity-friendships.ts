import { useQuery } from "@tanstack/react-query";

import { ActivityQueryFactory } from "@/features/activity/api/activity-query-factory";

export function useActivityFriendships() {
  return useQuery(ActivityQueryFactory.friendships());
}
