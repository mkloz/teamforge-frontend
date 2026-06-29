import { useQuery } from "@tanstack/react-query";
import { ActivityQueryFactory } from "@/features/activity/public/activity-query-factory";

export function useSavedMessageIds() {
  const savedMessagesQuery = useQuery(ActivityQueryFactory.savedMessages());

  return new Set(savedMessagesQuery.data?.map((item) => item.messageId) ?? []);
}
