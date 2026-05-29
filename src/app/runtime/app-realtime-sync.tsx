import { useEffect, useSyncExternalStore } from "react";

import { router } from "@/router";
import { authSession } from "@/shared/api/auth-session";
import {
  cancelDelay,
  cancelIdleTask,
  scheduleDelay,
  scheduleIdleTask,
} from "@/shared/lib/browser-scheduling";
import { warnInDevelopment } from "@/shared/lib/development-warning";

const DEFERRED_REALTIME_DELAY_MS = 12_000;

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

const deferredRealtimeRoutePrefixes = [
  "/explore",
  "/forge",
  "/groups/",
  "/home",
  "/profile",
  "/settings",
  "/users/",
] as const;

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
  if (!isRealtimeRoute(pathname)) {
    return null;
  }

  const isDeferredRoute = deferredRealtimeRoutePrefixes.some((prefix) =>
    doesPathMatchRoutePrefix(pathname, prefix),
  );

  return isDeferredRoute ? DEFERRED_REALTIME_DELAY_MS : 0;
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
    let delayTask: ReturnType<typeof scheduleDelay> | undefined;

    async function initializeRealtimeSync() {
      try {
        const {
          disconnectRealtimeSession,
          subscribeAppRealtimeEvents,
          subscribeRealtimeSessionSync,
          syncRealtimeSession,
        } = await import("@/app/runtime/app-realtime-events");

        if (cancelled) {
          return;
        }

        const unsubscribeSession = subscribeRealtimeSessionSync();
        const unsubscribeRealtimeEvents = subscribeAppRealtimeEvents();
        const handlePageHide = () => {
          disconnectRealtimeSession();
        };
        const handlePageShow = (event: PageTransitionEvent) => {
          if (event.persisted) {
            syncRealtimeSession();
          }
        };

        window.addEventListener("pagehide", handlePageHide);
        window.addEventListener("pageshow", handlePageShow);

        cleanup = () => {
          window.removeEventListener("pagehide", handlePageHide);
          window.removeEventListener("pageshow", handlePageShow);
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

    if (realtimeDelayMs > 0) {
      delayTask = scheduleDelay(scheduleRealtimeImport, realtimeDelayMs);
    } else {
      scheduleRealtimeImport();
    }

    return () => {
      cancelled = true;
      if (delayTask) {
        cancelDelay(delayTask);
      }
      if (idleTask) {
        cancelIdleTask(idleTask);
      }
      cleanup?.();
    };
  }, [hasAuthSession, realtimeDelayMs]);

  return null;
}
