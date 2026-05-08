import type { Plan } from "@/features/activity/lib/activity-contract";
import type {
  ChatApi,
  FriendshipApi,
  GroupApi,
  MessageApi,
  OnlineStatus,
  PlanProposal,
  PlanUpdateKind,
} from "@/shared/schemas";
import { ACTIVITY_REALTIME_CONTEXT } from "./activity-context";
import type { ApplyRealtimeMessageOptions } from "./activity-realtime";
import { ActivityRealtime } from "./activity-realtime";

export const ActivityRealtimeHandlers = {
  applyMessage(
    chatId: string,
    message: MessageApi,
    options: ApplyRealtimeMessageOptions = {},
  ) {
    return ActivityRealtime.applyMessage(
      ACTIVITY_REALTIME_CONTEXT,
      chatId,
      message,
      options,
    );
  },

  applyChatRead(chat: ChatApi) {
    ActivityRealtime.applyChatRead(ACTIVITY_REALTIME_CONTEXT, chat);
  },

  applyPresenceChanged(userId: string, onlineStatus: OnlineStatus) {
    ActivityRealtime.applyPresenceChanged(userId, onlineStatus);
  },

  applyFriendshipUpdate(friendship: FriendshipApi) {
    ActivityRealtime.applyFriendshipUpdate(
      ACTIVITY_REALTIME_CONTEXT,
      friendship,
    );
  },

  removeFriendshipFromActivity(friendship: FriendshipApi) {
    ActivityRealtime.removeFriendshipFromActivity(
      ACTIVITY_REALTIME_CONTEXT,
      friendship,
    );
  },

  applyGroupUpdate(currentUserId: string, group: GroupApi) {
    ActivityRealtime.applyGroupUpdate(
      ACTIVITY_REALTIME_CONTEXT,
      currentUserId,
      group,
    );
  },

  handlePlanUpdated(groupId: string) {
    return ActivityRealtime.handlePlanUpdated(groupId);
  },

  applyPlanUpdate(
    groupId: string,
    plan: Plan,
    proposal: PlanProposal | null,
    kind: PlanUpdateKind,
  ) {
    ActivityRealtime.applyPlanUpdate(
      ACTIVITY_REALTIME_CONTEXT,
      groupId,
      plan,
      proposal,
      kind,
    );
  },
};
