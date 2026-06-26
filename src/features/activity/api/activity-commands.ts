import { ActivityFriendshipCommands } from "./commands/activity-friendship-commands";
import { ActivityGroupCommands } from "./commands/activity-group-commands";
import { ActivityMessageCommands } from "./commands/activity-message-commands";
import { ActivityPlanRatingCommands } from "./commands/activity-plan-rating-commands";
import { ActivitySurfaceCommands } from "./commands/activity-surface-commands";

export const ActivityCommands = {
  ...ActivitySurfaceCommands,
  ...ActivityMessageCommands,
  ...ActivityGroupCommands,
  ...ActivityPlanRatingCommands,
  ...ActivityFriendshipCommands,
};
