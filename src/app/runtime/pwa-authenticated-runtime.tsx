import type { QueryKey } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { useUnreadNotificationCount } from "@/features/notifications/hooks/use-unread-notification-count";
import { useAuthSessionState } from "@/shared/api/auth-session-state";
import { appQueryClient } from "@/shared/api/query-client";
import { invalidateNotificationSurfaces } from "@/shared/api/query-invalidation";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import { useUnreadAppBadge } from "@/shared/hooks/use-unread-app-badge";
import { useUnreadDocumentTitleBadge } from "@/shared/hooks/use-unread-document-title-badge";
import { warnInDevelopment } from "@/shared/lib/development-warning";
import {
  recordPwaReconnectRefresh,
  recordPwaServiceWorkerMessage,
} from "@/shared/lib/pwa-runtime-diagnostics";
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

export function PwaAuthenticatedRuntime() {
  return (
    <>
      <AppBadgeRuntime />
      <PwaServiceWorkerMessageRuntime />
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
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return undefined;
    }

    function handleServiceWorkerMessage(event: MessageEvent<unknown>) {
      if (!isPwaServiceWorkerMessage(event.data)) {
        return;
      }

      const message = event.data;
      const reason = getPwaServiceWorkerMessageReason(message);

      if (!isAuthenticated) {
        recordPwaServiceWorkerMessage("success", `${reason} while signed out`);
        return;
      }

      recordPwaServiceWorkerMessage("running", reason);

      void Promise.all([
        invalidateNotificationSurfaces(),
        refreshPwaResumeQueries(),
      ])
        .then(() => {
          recordPwaServiceWorkerMessage("success", reason);
          return undefined;
        })
        .catch((error: unknown) => {
          recordPwaServiceWorkerMessage("error", reason, error);
          warnInDevelopment(
            "PWA service worker message refresh failed.",
            error,
          );
          return undefined;
        });
    }

    navigator.serviceWorker.addEventListener(
      "message",
      handleServiceWorkerMessage,
    );

    return () => {
      navigator.serviceWorker.removeEventListener(
        "message",
        handleServiceWorkerMessage,
      );
    };
  }, [isAuthenticated]);

  return null;
}

function isAppVisibleAndOnline() {
  return document.visibilityState !== "hidden" && navigator.onLine;
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

function PwaResumeRefreshRuntime() {
  const { isAuthenticated } = useAuthSessionState();
  const inFlightRefreshRef = useRef<Promise<void> | null>(null);
  const lastRefreshAtRef = useRef(0);

  useEffect(() => {
    if (!isAuthenticated) {
      inFlightRefreshRef.current = null;
      lastRefreshAtRef.current = 0;
      return undefined;
    }

    function refreshAfterResume(reason: string) {
      if (!isAppVisibleAndOnline() || inFlightRefreshRef.current) {
        return;
      }

      const now = Date.now();

      if (now - lastRefreshAtRef.current < PWA_RESUME_REFRESH_COOLDOWN_MS) {
        return;
      }

      lastRefreshAtRef.current = now;
      recordPwaReconnectRefresh("running", reason);

      const refreshPromise = (async () => {
        try {
          await refreshPwaResumeQueries();
          recordPwaReconnectRefresh("success", reason);
        } catch (error) {
          recordPwaReconnectRefresh("error", reason, error);
          warnInDevelopment(
            `PWA resume refresh failed after ${reason}.`,
            error,
          );
        }
      })();

      inFlightRefreshRef.current = refreshPromise;

      void refreshPromise.finally(() => {
        if (inFlightRefreshRef.current === refreshPromise) {
          inFlightRefreshRef.current = null;
        }
      });
    }

    function handleFocus() {
      refreshAfterResume("window focus");
    }

    function handleOnline() {
      refreshAfterResume("network reconnect");
    }

    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        refreshAfterResume("page restore");
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        refreshAfterResume("app foreground");
      }
    }

    window.addEventListener("focus", handleFocus);
    window.addEventListener("online", handleOnline);
    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
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
