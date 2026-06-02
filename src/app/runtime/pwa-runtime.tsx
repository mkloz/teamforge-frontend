import { registerSW } from "virtual:pwa-register";
import type { QueryKey } from "@tanstack/react-query";
import { WifiOff } from "lucide-react";
import { useEffect, useRef } from "react";

import { useUnreadNotificationCount } from "@/features/notifications/hooks/use-unread-notification-count";
import { useAuthSessionState } from "@/shared/api/current-user-query";
import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import { useNetworkStatus } from "@/shared/hooks/use-network-status";
import { useUnreadAppBadge } from "@/shared/hooks/use-unread-app-badge";
import { warnInDevelopment } from "@/shared/lib/development-warning";
import {
  type BeforeInstallPromptEvent,
  clearPwaInstallPrompt,
  setPwaInstallPrompt,
} from "@/shared/lib/pwa-install-prompt";
import { recordPwaReconnectRefresh } from "@/shared/lib/pwa-runtime-diagnostics";
import {
  trackPwaAppInstalled,
  trackPwaInstallPromptAvailable,
  trackPwaServiceWorkerOfflineReady,
  trackPwaServiceWorkerUpdateReady,
} from "@/shared/lib/pwa-telemetry";

function isBeforeInstallPromptEvent(
  event: Event,
): event is BeforeInstallPromptEvent {
  return (
    "prompt" in event &&
    typeof event.prompt === "function" &&
    "userChoice" in event
  );
}

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

function registerPwaInstallPromptCapture() {
  function handleBeforeInstallPrompt(event: Event) {
    event.preventDefault();

    if (isBeforeInstallPromptEvent(event)) {
      setPwaInstallPrompt(event);
      trackPwaInstallPromptAvailable({
        platformCount: event.platforms.length,
        platforms: event.platforms.join(","),
        source: "runtime",
      });
    }
  }

  function handleAppInstalled() {
    clearPwaInstallPrompt();
    trackPwaAppInstalled({ source: "runtime" });
  }

  window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  window.addEventListener("appinstalled", handleAppInstalled);

  return () => {
    window.removeEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt,
    );
    window.removeEventListener("appinstalled", handleAppInstalled);
  };
}

function registerPwaServiceWorker() {
  let updateServiceWorker: ReturnType<typeof registerSW> | null = null;

  updateServiceWorker = registerSW({
    immediate: true,
    onNeedRefresh() {
      trackPwaServiceWorkerUpdateReady({ source: "runtime" });

      void import("@/shared/lib/app-toast").then(({ showAppInfoToast }) => {
        showAppInfoToast("A fresh TeamForge update is ready.", {
          id: "teamforge-pwa-update",
          description: "Refresh when you have a moment.",
          action: {
            label: "Refresh",
            onClick: () => {
              void updateServiceWorker?.(true);
            },
          },
        });

        return undefined;
      });
    },
    onOfflineReady() {
      trackPwaServiceWorkerOfflineReady({ source: "runtime" });

      void import("@/shared/lib/app-toast").then(({ showAppSuccessToast }) => {
        showAppSuccessToast("TeamForge is ready for offline launches.", {
          id: "teamforge-pwa-offline-ready",
        });

        return undefined;
      });
    },
    onRegisterError(error) {
      warnInDevelopment("PWA service worker registration failed.", error);
    },
  });
}

export function PwaRuntime() {
  useEffect(() => {
    const unregisterInstallPromptCapture = registerPwaInstallPromptCapture();

    registerPwaServiceWorker();

    return unregisterInstallPromptCapture;
  }, []);

  return (
    <>
      <AppBadgeRuntime />
      <PwaResumeRefreshRuntime />
      <OfflineConnectionBanner />
    </>
  );
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

  return null;
}

function OfflineConnectionBanner() {
  const isOnline = useNetworkStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div
      role="status"
      className="fixed inset-x-3 top-safe-banner z-100 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-spark-amber/45 bg-canvas px-4 py-3 font-medium text-ink text-sm shadow-2xl shadow-black/15"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-spark-amber/15 text-spark-amber">
        <WifiOff size={18} strokeWidth={2} aria-hidden="true" />
      </span>
      <span>
        You are offline. TeamForge will reconnect live activity when your
        connection returns.
      </span>
    </div>
  );
}
