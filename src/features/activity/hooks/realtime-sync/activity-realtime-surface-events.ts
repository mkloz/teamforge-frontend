import { ActivityRealtimeHandlers } from "@/features/activity/api/activity-realtime-handlers";
import { shouldApplyRealtimeEvent } from "@/shared/lib/realtime-event-registry";
import {
  realtimeChatReadPayloadSchema,
  realtimeGroupUpdatedPayloadSchema,
  realtimePlanUpdatedPayloadSchema,
  realtimePresenceChangedPayloadSchema,
} from "@/shared/schemas";

export function handleRealtimeChatRead(payload: unknown) {
  const parsed = realtimeChatReadPayloadSchema.parse(payload);

  if (!shouldApplyRealtimeEvent(parsed)) {
    return;
  }

  ActivityRealtimeHandlers.applyChatRead(parsed.chat);
}

export function handleRealtimePresenceChanged(payload: unknown) {
  const parsed = realtimePresenceChangedPayloadSchema.parse(payload);

  ActivityRealtimeHandlers.applyPresenceChanged(
    parsed.user.id,
    parsed.onlineStatus,
    parsed.user.lastSeenAt,
  );
}

export function handleRealtimePlanUpdated(
  payload: unknown,
  activeGroupId?: string | null,
) {
  const parsed = realtimePlanUpdatedPayloadSchema.parse(payload);

  if (!shouldApplyRealtimeEvent(parsed)) {
    return;
  }

  if (!activeGroupId || parsed.groupId !== activeGroupId) {
    return;
  }

  ActivityRealtimeHandlers.applyPlanUpdate(
    parsed.groupId,
    parsed.plan,
    parsed.proposal,
    parsed.kind,
  );
}

export function handleRealtimeGroupUpdated(
  payload: unknown,
  currentUserId: string,
) {
  const parsed = realtimeGroupUpdatedPayloadSchema.parse(payload);

  if (!shouldApplyRealtimeEvent(parsed)) {
    return;
  }

  ActivityRealtimeHandlers.applyGroupUpdate(currentUserId, parsed.group);
}
