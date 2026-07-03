import { useQuery } from "@tanstack/react-query";
import { activityQueries } from "@/features/activity/api/activity-queries";

export function useSavedMessageIds() {
  const savedMessagesQuery = useQuery(activityQueries.savedMessages());

  return new Set(savedMessagesQuery.data?.map((item) => item.messageId) ?? []);
}
