import { useEffect } from "react";

import { ActivityCommands } from "@/features/activity/api/activity-commands";
import { ActivityRealtimeHandlers } from "@/features/activity/api/activity-realtime-handlers";
import { NotificationsRealtimeHandlers } from "@/features/notifications/api/notifications-realtime-handlers";
import { authSession } from "@/shared/api/auth-session";
import { currentUserQueryOptions } from "@/shared/api/current-user-query";
import { appQueryClient } from "@/shared/api/query-client";
import { realtimeClient } from "@/shared/api/realtime-client";
import { shouldApplyRealtimeEvent } from "@/shared/lib/realtime-event-registry";
import {
  realtimeGroupUpdatedPayloadSchema,
  realtimeNotificationPayloadSchema,
} from "@/shared/schemas";

export function AppRealtimeSync() {
  useEffect(() => {
    const syncSession = () => {
      realtimeClient.syncSession(authSession.getAccessToken());
    };

    syncSession();

    const unsubscribeSession = authSession.subscribe(syncSession);
    const unsubscribeNotification = realtimeClient.on(
      "notification.new",
      (payload) => {
        const parsed = realtimeNotificationPayloadSchema.parse(payload);

        if (!shouldApplyRealtimeEvent(parsed)) {
          return;
        }

        NotificationsRealtimeHandlers.addIncomingNotification(
          parsed.notification,
        );
      },
    );
    const unsubscribeGroupUpdate = realtimeClient.on(
      "group.updated",
      (payload) => {
        const parsed = realtimeGroupUpdatedPayloadSchema.parse(payload);

        if (!shouldApplyRealtimeEvent(parsed)) {
          return;
        }

        const currentUser = appQueryClient.getQueryData(
          currentUserQueryOptions().queryKey,
        );

        if (!currentUser) {
          void ActivityCommands.invalidateGroupSurfaces();
          return;
        }

        ActivityRealtimeHandlers.applyGroupUpdate(currentUser.id, parsed.group);
      },
    );

    return () => {
      unsubscribeGroupUpdate();
      unsubscribeNotification();
      unsubscribeSession();
      realtimeClient.syncSession(null);
    };
  }, []);

  return null;
}
