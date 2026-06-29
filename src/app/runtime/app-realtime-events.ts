import { ActivityCommands } from "@/features/activity/api/activity-commands";
import { ActivityRealtimeHandlers } from "@/features/activity/api/activity-realtime-handlers";
import { NotificationsRealtimeHandlers } from "@/features/notifications/api/notifications-realtime-handlers";
import { authSession } from "@/shared/api/auth-session";
import { CURRENT_USER_QUERY_KEY } from "@/shared/api/current-user-query";
import { appQueryClient } from "@/shared/api/query-client";
import { realtimeClient } from "@/shared/api/realtime-client";
import { shouldApplyRealtimeEvent } from "@/shared/lib/realtime-event-registry";
import {
  realtimeGroupUpdatedPayloadSchema,
  realtimeNotificationPayloadSchema,
} from "@/shared/schemas/realtime";
import type { User } from "@/shared/schemas/user";

// These exports are consumed by AppRealtimeSync through loadAppRealtimeEvents().
// Fallow does not trace the destructured API of that dynamic import.
function getCachedCurrentUser() {
  return appQueryClient.getQueryData<User>(CURRENT_USER_QUERY_KEY);
}

function handleNotificationPayload(payload: unknown) {
  const parsed = realtimeNotificationPayloadSchema.parse(payload);

  if (!shouldApplyRealtimeEvent(parsed)) {
    return;
  }

  NotificationsRealtimeHandlers.addIncomingNotification(parsed.notification);
}

function handleGroupUpdatedPayload(payload: unknown) {
  const parsed = realtimeGroupUpdatedPayloadSchema.parse(payload);

  if (!shouldApplyRealtimeEvent(parsed)) {
    return;
  }

  const currentUser = getCachedCurrentUser();

  if (!currentUser) {
    void ActivityCommands.invalidateGroupSurfaces();
    return;
  }

  ActivityRealtimeHandlers.applyGroupUpdate(currentUser.id, parsed.group);
}

function syncRealtimeSession() {
  realtimeClient.syncSession(authSession.getAccessToken());
}

// fallow-ignore-next-line unused-export
export function reconnectRealtimeSession() {
  realtimeClient.reconnectSession(authSession.getAccessToken());
}

// fallow-ignore-next-line unused-export
export function subscribeRealtimeSessionSync() {
  syncRealtimeSession();

  return authSession.subscribe(syncRealtimeSession);
}

// fallow-ignore-next-line unused-export
export function disconnectRealtimeSession() {
  realtimeClient.syncSession(null);
}

// fallow-ignore-next-line unused-export
export function subscribeAppRealtimeEvents() {
  const unsubscribeNotification = realtimeClient.on(
    "notification.new",
    handleNotificationPayload,
  );
  const unsubscribeGroupUpdate = realtimeClient.on(
    "group.updated",
    handleGroupUpdatedPayload,
  );

  return () => {
    unsubscribeGroupUpdate();
    unsubscribeNotification();
  };
}
