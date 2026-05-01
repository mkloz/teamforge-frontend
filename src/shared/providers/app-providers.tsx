import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { Analytics } from "@vercel/analytics/react";
import { useEffect } from "react";
import { Toaster } from "sonner";

import { config } from "@/config/config";
import { ActivityCommands } from "@/features/activity/api/activity-commands";
import { ActivityRealtimeHandlers } from "@/features/activity/api/activity-realtime-handlers";
import { AuthQueries } from "@/features/auth/api/auth.queries";
import { NotificationsQueries } from "@/features/notifications/api/notifications.queries";
import {
  buildAuthRouteNavigation,
  buildRouteLocationHref,
} from "@/features/auth/lib/auth-return";
import { router } from "@/router";
import { realtimeClient } from "@/shared/api/realtime-client";
import { authSession } from "@/shared/api/auth-session";
import { appQueryClient } from "@/shared/api/query-client";
import { shouldApplyRealtimeEvent } from "@/shared/lib/realtime-event-registry";
import {
  realtimeGroupUpdatedPayloadSchema,
  realtimeNotificationPayloadSchema,
} from "@/shared/schemas";
import { useInitializeTheme } from "@/shared/store/theme.store";
import { captureException } from "@/shared/lib/telemetry";
import { telemetryErrorScopes } from "@/shared/lib/telemetry-contract";

export function AppProviders() {
  useInitializeTheme();

  useEffect(() => {
    const handleWindowError = (event: ErrorEvent) => {
      captureException(
        telemetryErrorScopes.windowError,
        event.error ?? new Error(event.message),
        {
          filename: event.filename,
          line: event.lineno,
          column: event.colno,
        },
      );
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      captureException(
        telemetryErrorScopes.windowUnhandledRejection,
        event.reason,
      );
    };

    window.addEventListener("error", handleWindowError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleWindowError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
    };
  }, []);

  useEffect(() => {
    return authSession.setUnauthorizedHandler(() => {
      AuthQueries.clearCurrentUserCache();
      const currentHref = buildRouteLocationHref(router.state.location);

      void router.navigate(
        buildAuthRouteNavigation("/auth/login", currentHref),
      );
    });
  }, []);

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

        NotificationsQueries.addIncomingNotification(parsed.notification);
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
          AuthQueries.currentUser().queryKey,
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

  const app = (
    <QueryClientProvider client={appQueryClient}>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" closeButton />
      <Analytics />
    </QueryClientProvider>
  );

  if (!config.googleClientId) {
    return app;
  }

  return (
    <GoogleOAuthProvider clientId={config.googleClientId}>
      {app}
    </GoogleOAuthProvider>
  );
}
