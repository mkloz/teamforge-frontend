import { useEffect, useSyncExternalStore } from "react";

import { authSession } from "@/shared/api/auth-session";
import { warnInDevelopment } from "@/shared/lib/development-warning";

function useHasAuthSession() {
  return useSyncExternalStore(
    (listener) => authSession.subscribe(listener),
    () => authSession.hasTokens(),
    () => authSession.hasTokens(),
  );
}

export function AppRealtimeSync() {
  const hasAuthSession = useHasAuthSession();

  useEffect(() => {
    if (!hasAuthSession) {
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

    void initializeRealtimeSync();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [hasAuthSession]);

  return null;
}
