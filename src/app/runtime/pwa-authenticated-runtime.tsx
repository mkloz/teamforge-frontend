import type { QueryKey } from "@tanstack/react-query";
import { useEffect } from "react";

import { useUnreadNotificationCount } from "@/features/notifications/public/notification-drawer";
import { useAuthSessionState } from "@/shared/api/auth-session-state";
import { appQueryClient } from "@/shared/api/query-client";
import { invalidateNotificationSurfaces } from "@/shared/api/query-invalidation";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import { realtimeClient } from "@/shared/api/realtime-client";
import { useUnreadAppBadge } from "@/shared/hooks/use-unread-app-badge";
import { useUnreadDocumentTitleBadge } from "@/shared/hooks/use-unread-document-title-badge";
import { subscribeAppResumeEvents } from "@/shared/lib/app-resume-events";
import {
  getBrowserServiceWorker,
  isBrowserDocumentVisible,
  isBrowserOnline,
} from "@/shared/lib/browser-environment";
import { warnInDevelopment } from "@/shared/lib/development-warning";
import {
  isPwaServiceWorkerMessage,
  PWA_SERVICE_WORKER_MESSAGE_TYPES,
  type PwaServiceWorkerMessage,
} from "@/shared/lib/pwa-service-worker-messages";

const PWA_RESUME_REFRESH_COOLDOWN_MS = 12_000;

const PWA_RESUME_QUERY_KEYS = [
  APP_QUERY_KEYS.auth.currentUser,
  APP_QUERY_KEYS.notifications.list,
  APP_QUERY_KEYS.home.all,
  APP_QUERY_KEYS.activity.groups,
  APP_QUERY_KEYS.activity.chats,
  APP_QUERY_KEYS.activity.friendships,
  APP_QUERY_KEYS.activity.savedMessages,
  APP_QUERY_KEYS.groupPlanDetail.all,
  APP_QUERY_KEYS.settings.notificationPreferences,
  APP_QUERY_KEYS.settings.sessions,
  APP_QUERY_KEYS.settings.blockedUsers,
  APP_QUERY_KEYS.forge.friends,
  APP_QUERY_KEYS.forge.recentActivities,
  APP_QUERY_KEYS.webPush.subscriptions,
  ["activity-selection"],
  ["activity-messages"],
  ["explore"],
  ["explore-groups"],
] as const satisfies readonly QueryKey[];

let pwaRuntimeRefreshInFlight: Promise<void> | null = null;
let lastPwaRuntimeRefreshAt = 0;

export function PwaAuthenticatedRuntime() {
  return (
    <>
      <AppBadgeRuntime />
      <PwaServiceWorkerMessageRuntime />
      <PwaRealtimeConnectRefreshRuntime />
      <PwaResumeRefreshRuntime />
    </>
  );
}

function getPwaServiceWorkerMessageReason(message: PwaServiceWorkerMessage) {
  if (message.type === PWA_SERVICE_WORKER_MESSAGE_TYPES.notificationClick) {
    return `notification click to ${message.route}`;
  }

  return `push received for ${message.route}`;
}

function PwaServiceWorkerMessageRuntime() {
  const { isAuthenticated } = useAuthSessionState();

  useEffect(() => {
    const serviceWorker = getBrowserServiceWorker();

    if (!serviceWorker) {
      return undefined;
    }

    function handleServiceWorkerMessage(event: MessageEvent<unknown>) {
      if (!isPwaServiceWorkerMessage(event.data)) {
        return;
      }

      if (!isAuthenticated) {
        return;
      }

      const message = event.data;
      const reason = getPwaServiceWorkerMessageReason(message);

      void Promise.all([
        invalidateNotificationSurfaces(),
        refreshPwaResumeQueries(),
      ])
        .then(() => {
          return undefined;
        })
        .catch((error: unknown) => {
          warnInDevelopment(
            `PWA service worker message refresh failed after ${reason}.`,
            error,
          );
          return undefined;
        });
    }

    serviceWorker.addEventListener("message", handleServiceWorkerMessage);

    return () => {
      serviceWorker.removeEventListener("message", handleServiceWorkerMessage);
    };
  }, [isAuthenticated]);

  return null;
}

function isAppVisibleAndOnline() {
  return isBrowserDocumentVisible() && isBrowserOnline();
}

function resetPwaRuntimeSurfaceRefresh() {
  pwaRuntimeRefreshInFlight = null;
  lastPwaRuntimeRefreshAt = 0;
}

async function refreshPwaResumeQueries() {
  await Promise.all(
    PWA_RESUME_QUERY_KEYS.map((queryKey) =>
      appQueryClient.invalidateQueries({
        queryKey,
        refetchType: "active",
      }),
    ),
  );
}

function refreshPwaRuntimeSurfaces(reason: string) {
  if (!isAppVisibleAndOnline() || pwaRuntimeRefreshInFlight) {
    return;
  }

  const now = Date.now();

  if (now - lastPwaRuntimeRefreshAt < PWA_RESUME_REFRESH_COOLDOWN_MS) {
    return;
  }

  lastPwaRuntimeRefreshAt = now;

  const refreshPromise = refreshPwaResumeQueries()
    .then(() => {
      return undefined;
    })
    .catch((error: unknown) => {
      warnInDevelopment(`PWA runtime refresh failed after ${reason}.`, error);
      return undefined;
    });

  pwaRuntimeRefreshInFlight = refreshPromise;

  void refreshPromise.finally(() => {
    if (pwaRuntimeRefreshInFlight === refreshPromise) {
      pwaRuntimeRefreshInFlight = null;
    }
  });
}

function PwaRealtimeConnectRefreshRuntime() {
  const { isAuthenticated } = useAuthSessionState();

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    let hasEstablishedRealtimeConnection = realtimeClient.isConnected();

    return realtimeClient.onConnect(() => {
      if (!hasEstablishedRealtimeConnection) {
        hasEstablishedRealtimeConnection = true;
        return;
      }

      refreshPwaRuntimeSurfaces("socket reconnect");
    });
  }, [isAuthenticated]);

  return null;
}

function PwaResumeRefreshRuntime() {
  const { isAuthenticated } = useAuthSessionState();

  useEffect(() => {
    if (!isAuthenticated) {
      resetPwaRuntimeSurfaceRefresh();
      return undefined;
    }

    return subscribeAppResumeEvents(refreshPwaRuntimeSurfaces);
  }, [isAuthenticated]);

  return null;
}

function AppBadgeRuntime() {
  const { isAuthenticated } = useAuthSessionState();
  const { count, hasCountData, isError, isLoading } =
    useUnreadNotificationCount({
      enabled: isAuthenticated,
    });
  const badgeCount = isAuthenticated ? count : 0;
  const shouldSyncBadge =
    !isAuthenticated || hasCountData || (!isLoading && !isError);

  useUnreadAppBadge(badgeCount, {
    enabled: shouldSyncBadge,
  });
  useUnreadDocumentTitleBadge(badgeCount, {
    enabled: shouldSyncBadge,
  });

  return null;
}
