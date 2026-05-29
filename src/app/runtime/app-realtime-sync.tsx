import { useEffect, useSyncExternalStore } from "react";

import { router } from "@/router";
import { authSession } from "@/shared/api/auth-session";
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

function useHasAuthSession() {
  return useSyncExternalStore(
    (listener) => authSession.subscribe(listener),
    () => authSession.hasTokens(),
    () => authSession.hasTokens(),
  );
}

function isRealtimeRoute(pathname: string) {
  return realtimeRoutePrefixes.some((prefix) =>
    prefix.endsWith("/")
      ? pathname.startsWith(prefix)
      : pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function useIsRealtimeRoute() {
  return useSyncExternalStore(
    (listener) => router.subscribe("onResolved", listener),
    () => isRealtimeRoute(router.state.location.pathname),
    () => false,
  );
}

export function AppRealtimeSync() {
  const hasAuthSession = useHasAuthSession();
  const isRealtimeEligible = useIsRealtimeRoute();

  useEffect(() => {
    if (!hasAuthSession || !isRealtimeEligible) {
      return undefined;
    }

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    async function initializeRealtimeSync() {
      try {
        const {
          disconnectRealtimeSession,
          subscribeAppRealtimeEvents,
          subscribeRealtimeSessionSync,
        } = await import("@/app/runtime/app-realtime-events");

        if (cancelled) {
          return;
        }

        const unsubscribeSession = subscribeRealtimeSessionSync();
        const unsubscribeRealtimeEvents = subscribeAppRealtimeEvents();

        cleanup = () => {
          unsubscribeRealtimeEvents();
          unsubscribeSession();
          disconnectRealtimeSession();
        };
      } catch (error) {
        warnInDevelopment("Realtime sync failed to initialize.", error);
      }
    }

    const idleTask = scheduleIdleTask(() => {
      void initializeRealtimeSync();
    });

    return () => {
      cancelled = true;
      cancelIdleTask(idleTask);
      cleanup?.();
    };
  }, [hasAuthSession, isRealtimeEligible]);

  return null;
}
