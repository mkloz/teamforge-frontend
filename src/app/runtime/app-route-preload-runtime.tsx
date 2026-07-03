import { useEffect } from "react";

import { warmAuthenticatedAppRoutes } from "@/app/router/app-routes/route-preloading";
import { router } from "@/router";
import { useAuthSessionState } from "@/shared/api/auth-session-state";
import { appQueryClient } from "@/shared/api/query-client";
import {
  cancelDelay,
  cancelIdleTask,
  scheduleDelay,
  scheduleIdleTask,
} from "@/shared/lib/browser-scheduling";
import { warnInDevelopment } from "@/shared/lib/development-warning";

const CURRENT_ROUTE_SETTLE_DELAY_MS = 250;
const AUTHENTICATED_APP_ROUTE_PREFIXES = [
  "/activity",
  "/explore",
  "/forge",
  "/groups/",
  "/home",
  "/profile",
  "/settings",
  "/users/",
] as const;

let hasStartedAppRouteWarmup = false;

export function AppRoutePreloadRuntime() {
  const { isAuthenticated } = useAuthSessionState();

  useEffect(() => {
    if (!isAuthenticated || hasStartedAppRouteWarmup) {
      return undefined;
    }

    let cancelled = false;
    let idleTask: ReturnType<typeof scheduleIdleTask> | null = null;
    let settleTimer: ReturnType<typeof scheduleDelay> | null = null;
    let unsubscribeQueryCache: (() => void) | null = null;

    function clearSettleTimer() {
      if (!settleTimer) {
        return;
      }

      cancelDelay(settleTimer);
      settleTimer = null;
    }

    function scheduleWarmupOnIdle() {
      if (cancelled || hasStartedAppRouteWarmup) {
        return;
      }

      if (idleTask) {
        return;
      }

      idleTask = scheduleIdleTask(() => {
        if (cancelled || hasStartedAppRouteWarmup) {
          return;
        }

        hasStartedAppRouteWarmup = true;

        void warmAuthenticatedAppRoutes(router.state.location.pathname).catch(
          (error: unknown) => {
            warnInDevelopment("App route warmup failed.", error);
          },
        );
      });
    }

    function waitForActiveQueriesToSettle() {
      if (cancelled || hasStartedAppRouteWarmup) {
        return;
      }

      if (appQueryClient.isFetching({ type: "active" }) === 0) {
        unsubscribeQueryCache?.();
        unsubscribeQueryCache = null;
        scheduleWarmupOnIdle();
        return;
      }

      unsubscribeQueryCache ??= appQueryClient.getQueryCache().subscribe(() => {
        if (appQueryClient.isFetching({ type: "active" }) === 0) {
          waitForActiveQueriesToSettle();
        }
      });
    }

    function scheduleAfterCurrentRouteSettles() {
      if (
        cancelled ||
        hasStartedAppRouteWarmup ||
        router.state.isLoading ||
        !isAuthenticatedAppRoute(router.state.location.pathname)
      ) {
        return;
      }

      clearSettleTimer();
      settleTimer = scheduleDelay(
        waitForActiveQueriesToSettle,
        CURRENT_ROUTE_SETTLE_DELAY_MS,
      );
    }

    const unsubscribeRouter = router.subscribe(
      "onResolved",
      scheduleAfterCurrentRouteSettles,
    );

    scheduleAfterCurrentRouteSettles();

    return () => {
      cancelled = true;
      clearSettleTimer();
      unsubscribeQueryCache?.();
      unsubscribeRouter();

      if (idleTask) {
        cancelIdleTask(idleTask);
      }
    };
  }, [isAuthenticated]);

  return null;
}

function isAuthenticatedAppRoute(pathname: string) {
  return AUTHENTICATED_APP_ROUTE_PREFIXES.some((prefix) =>
    prefix.endsWith("/")
      ? pathname.startsWith(prefix)
      : pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
