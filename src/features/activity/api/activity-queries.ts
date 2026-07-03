import { ActivityBaseQueryFactory } from "@/features/activity/api/query-factory/activity-base-query-factory";
import { ActivityFeedQueryFactory } from "@/features/activity/api/query-factory/activity-feed-query-factory";
import { ActivityMessageQueryFactory } from "@/features/activity/api/query-factory/activity-message-query-factory";
import { ActivitySelectionQueryFactory } from "@/features/activity/api/query-factory/activity-selection-query-factory";

export const activityQueries = {
  ...ActivityBaseQueryFactory,
  ...ActivityFeedQueryFactory,
  ...ActivitySelectionQueryFactory,
  ...ActivityMessageQueryFactory,
};
