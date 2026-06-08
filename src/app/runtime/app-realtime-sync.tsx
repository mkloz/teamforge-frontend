import { useEffect, useSyncExternalStore } from "react";

import { router } from "@/router";
import { authSession } from "@/shared/api/auth-session";
import {
  cancelIdleTask,
  scheduleIdleTask,
} from "@/shared/lib/browser-scheduling";
import { warnInDevelopment } from "@/shared/lib/development-warning";
import { recordPwaRealtimeResync } from "@/shared/lib/pwa-runtime-diagnostics";

const realtimeRoutePrefixes = [
  "/activity",
  "/explore",
  "/forge",
  "/groups/",
  "/home",
  "/profile",
  "/settings",
  "/users/",
] as const;

const REALTIME_RESUME_SYNC_COOLDOWN_MS = 12_000;

function useHasAuthSession() {
  return useSyncExternalStore(
    (listener) => authSession.subscribe(listener),
    () => authSession.hasTokens(),
    () => authSession.hasTokens(),
  );
}

function isRealtimeRoute(pathname: string) {
  return realtimeRoutePrefixes.some((prefix) =>
    doesPathMatchRoutePrefix(pathname, prefix),
  );
}

function doesPathMatchRoutePrefix(pathname: string, prefix: string) {
  return prefix.endsWith("/")
    ? pathname.startsWith(prefix)
    : pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function getRealtimeRouteDelayMs(pathname: string) {
  return isRealtimeRoute(pathname) ? 0 : null;
}

function isAppVisibleAndOnline() {
  return document.visibilityState !== "hidden" && navigator.onLine;
}

function useRealtimeRouteDelayMs() {
  return useSyncExternalStore(
    (listener) => router.subscribe("onResolved", listener),
    () => getRealtimeRouteDelayMs(router.state.location.pathname),
    () => null,
  );
}

export function AppRealtimeSync() {
  const hasAuthSession = useHasAuthSession();
  const realtimeDelayMs = useRealtimeRouteDelayMs();

  useEffect(() => {
    if (!hasAuthSession || realtimeDelayMs === null) {
      return undefined;
    }

    let cleanup: (() => void) | undefined;
    let cancelled = false;
    let idleTask: ReturnType<typeof scheduleIdleTask> | undefined;

    async function initializeRealtimeSync() {
      try {
        const {
          disconnectRealtimeSession,
          reconnectRealtimeSession,
          subscribeAppRealtimeEvents,
          subscribeRealtimeSessionSync,
        } = await import("@/app/runtime/app-realtime-events");

        if (cancelled) {
          return;
        }

        const unsubscribeSession = subscribeRealtimeSessionSync();
        recordPwaRealtimeResync("initial sync");
        const unsubscribeRealtimeEvents = subscribeAppRealtimeEvents();
        let lastResumeSyncAt = 0;
        const reconnectRealtimeWithDiagnostic = (reason: string) => {
          if (!isAppVisibleAndOnline()) {
            return;
          }

          const now = Date.now();

          if (now - lastResumeSyncAt < REALTIME_RESUME_SYNC_COOLDOWN_MS) {
            return;
          }

          lastResumeSyncAt = now;
          recordPwaRealtimeResync(reason);
          reconnectRealtimeSession();
        };
        const handlePageHide = () => {
          disconnectRealtimeSession();
        };
        const handleFocus = () => {
          reconnectRealtimeWithDiagnostic("window focus");
        };
        const handleOnline = () => {
          reconnectRealtimeWithDiagnostic("network reconnect");
        };
        const handlePageShow = (event: PageTransitionEvent) => {
          if (event.persisted) {
            reconnectRealtimeWithDiagnostic("page restore");
          }
        };
        const handleVisibilityChange = () => {
          if (document.visibilityState === "hidden") {
            disconnectRealtimeSession();
            return;
          }

          if (document.visibilityState === "visible") {
            reconnectRealtimeWithDiagnostic("app foreground");
          }
        };

        window.addEventListener("focus", handleFocus);
        window.addEventListener("online", handleOnline);
        window.addEventListener("pagehide", handlePageHide);
        window.addEventListener("pageshow", handlePageShow);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        cleanup = () => {
          window.removeEventListener("focus", handleFocus);
          window.removeEventListener("online", handleOnline);
          window.removeEventListener("pagehide", handlePageHide);
          window.removeEventListener("pageshow", handlePageShow);
          document.removeEventListener(
            "visibilitychange",
            handleVisibilityChange,
          );
          unsubscribeRealtimeEvents();
          unsubscribeSession();
          disconnectRealtimeSession();
        };
      } catch (error) {
        warnInDevelopment("Realtime sync failed to initialize.", error);
      }
    }

    function scheduleRealtimeImport() {
      idleTask = scheduleIdleTask(() => {
        void initializeRealtimeSync();
      });
    }

    scheduleRealtimeImport();

    return () => {
      cancelled = true;
      if (idleTask) {
        cancelIdleTask(idleTask);
      }
      cleanup?.();
    };
  }, [hasAuthSession, realtimeDelayMs]);

  return null;
}
