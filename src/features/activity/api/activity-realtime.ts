import { applyRealtimeMessage } from "@/features/activity/api/realtime/realtime-message-handler";
import {
  applyRealtimePlanUpdate,
  handleRealtimePlanUpdated,
} from "@/features/activity/api/realtime/realtime-plan-handlers";
import {
  applyRealtimeChatRead,
  applyRealtimeFriendshipUpdate,
  applyRealtimeGroupUpdate,
  applyRealtimePresenceChanged,
  removeRealtimeFriendshipFromActivity,
} from "@/features/activity/api/realtime/realtime-surface-handlers";

export type {
  ActivityRealtimeContext,
  ApplyRealtimeMessageOptions,
} from "@/features/activity/api/realtime/activity-realtime-types";

export const ActivityRealtime = {
  applyMessage: applyRealtimeMessage,

  applyChatRead: applyRealtimeChatRead,

  applyPresenceChanged: applyRealtimePresenceChanged,

  applyFriendshipUpdate: applyRealtimeFriendshipUpdate,

  removeFriendshipFromActivity: removeRealtimeFriendshipFromActivity,

  applyGroupUpdate: applyRealtimeGroupUpdate,

  handlePlanUpdated: handleRealtimePlanUpdated,

  applyPlanUpdate: applyRealtimePlanUpdate,
};
