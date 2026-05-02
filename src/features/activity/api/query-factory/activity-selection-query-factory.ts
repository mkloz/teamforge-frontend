import { ACTIVITY_QUERY_OPTIONS_CONTEXT } from "@/features/activity/api/activity-context";
import { ActivityQueryOptions } from "@/features/activity/api/activity-query-options";

export const ActivitySelectionQueryFactory = {
  groupSelection(groupId: string) {
    return ActivityQueryOptions.groupSelection(
      ACTIVITY_QUERY_OPTIONS_CONTEXT,
      groupId,
    );
  },

  directSelection(chatId: string) {
    return ActivityQueryOptions.directSelection(
      ACTIVITY_QUERY_OPTIONS_CONTEXT,
      chatId,
    );
  },
};
