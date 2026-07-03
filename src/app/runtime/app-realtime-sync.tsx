import { useEffect, useSyncExternalStore } from "react";

import { router } from "@/router";
import { authSession } from "@/shared/api/auth-session";
import {
  addBrowserDocumentEventListener,
  addBrowserWindowEventListener,
  getBrowserVisibilityState,
  isBrowserDocumentVisible,
  isBrowserOnline,
} from "@/shared/lib/browser-environment";
import {
  cancelIdleTask,
  scheduleIdleTask,
} from "@/shared/lib/browser-scheduling";
import { warnInDevelopment } from "@/shared/lib/development-warning";

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

function loadAppRealtimeEvents() {
  return import("@/app/runtime/app-realtime-events");
}

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
  return isBrowserDocumentVisible() && isBrowserOnline();
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
        } = await loadAppRealtimeEvents();

        if (cancelled) {
          return;
        }

        const unsubscribeSession = subscribeRealtimeSessionSync();
        const unsubscribeRealtimeEvents = subscribeAppRealtimeEvents();
        let lastResumeSyncAt = 0;
        const reconnectRealtimeWhenReady = () => {
          if (!isAppVisibleAndOnline()) {
            return;
          }

          const now = Date.now();

          if (now - lastResumeSyncAt < REALTIME_RESUME_SYNC_COOLDOWN_MS) {
            return;
          }

          lastResumeSyncAt = now;
          reconnectRealtimeSession();
        };
        const handlePageHide = () => {
          disconnectRealtimeSession();
        };
        const handleFocus = () => {
          reconnectRealtimeWhenReady();
        };
        const handleOnline = () => {
          reconnectRealtimeWhenReady();
        };
        const handlePageShow = (event: PageTransitionEvent) => {
          if (event.persisted) {
            reconnectRealtimeWhenReady();
          }
        };
        const handleVisibilityChange = () => {
          if (getBrowserVisibilityState() === "hidden") {
            disconnectRealtimeSession();
            return;
          }

          if (getBrowserVisibilityState() === "visible") {
            reconnectRealtimeWhenReady();
          }
        };

        const cleanupFocus = addBrowserWindowEventListener(
          "focus",
          handleFocus,
        );
        const cleanupOnline = addBrowserWindowEventListener(
          "online",
          handleOnline,
        );
        const cleanupPageHide = addBrowserWindowEventListener(
          "pagehide",
          handlePageHide,
        );
        const cleanupPageShow = addBrowserWindowEventListener(
          "pageshow",
          handlePageShow,
        );
        const cleanupVisibilityChange = addBrowserDocumentEventListener(
          "visibilitychange",
          handleVisibilityChange,
        );

        cleanup = () => {
          cleanupFocus();
          cleanupOnline();
          cleanupPageHide();
          cleanupPageShow();
          cleanupVisibilityChange();
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
