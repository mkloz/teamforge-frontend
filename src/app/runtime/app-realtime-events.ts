import {
  applyActivityGroupUpdate,
  invalidateActivityGroupSurfaces,
} from "@/features/activity/public/activity-app-realtime";
import { addIncomingNotification } from "@/features/notifications/public/notification-realtime";
import { authSession } from "@/shared/api/auth-session";
import { CURRENT_USER_QUERY_KEY } from "@/shared/api/current-user-query";
import { appQueryClient } from "@/shared/api/query-client";
import { refreshAccessSensitiveSurfaces } from "@/shared/api/query-invalidation";
import { realtimeClient } from "@/shared/api/realtime-client";
import { shouldApplyRealtimeEvent } from "@/shared/lib/realtime-event-registry";
import {
  realtimeAccessChangedPayloadSchema,
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

  addIncomingNotification(parsed.notification);
}

function handleGroupUpdatedPayload(payload: unknown) {
  const parsed = realtimeGroupUpdatedPayloadSchema.parse(payload);

  if (!shouldApplyRealtimeEvent(parsed)) {
    return;
  }

  const currentUser = getCachedCurrentUser();

  if (!currentUser) {
    void invalidateActivityGroupSurfaces();
    return;
  }

  applyActivityGroupUpdate(currentUser.id, parsed.group);
}

function handleAccessChangedPayload(payload: unknown) {
  const parsed = realtimeAccessChangedPayloadSchema.parse(payload);

  if (!shouldApplyRealtimeEvent(parsed)) {
    return;
  }

  void refreshAccessSensitiveSurfaces();
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
  const unsubscribeAccessChange = realtimeClient.on(
    "access.changed",
    handleAccessChangedPayload,
  );
  const unsubscribeNotification = realtimeClient.on(
    "notification.new",
    handleNotificationPayload,
  );
  const unsubscribeGroupUpdate = realtimeClient.on(
    "group.updated",
    handleGroupUpdatedPayload,
  );

  return () => {
    unsubscribeAccessChange();
    unsubscribeGroupUpdate();
    unsubscribeNotification();
  };
}
