import { ACTIVITY_QUERY_OPTIONS_CONTEXT } from "@/features/activity/api/activity-context";
import { activityQueryOptions } from "@/features/activity/api/activity-query-options";

export const ActivitySelectionQueryFactory = {
  groupSelection(groupId: string) {
    return activityQueryOptions.groupSelection(
      ACTIVITY_QUERY_OPTIONS_CONTEXT,
      groupId,
    );
  },

  directSelection(chatId: string) {
    return activityQueryOptions.directSelection(
      ACTIVITY_QUERY_OPTIONS_CONTEXT,
      chatId,
    );
  },
};
