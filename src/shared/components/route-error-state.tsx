import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

import { ErrorAuthLinkVisual } from "@/assets/error-state/error-auth-link";
import { ErrorRouteLoadVisual } from "@/assets/error-state/error-route-load";
import { FeedbackState } from "@/shared/components/feedback-state";
import { Button } from "@/shared/components/ui/button";
import {
  getBrowserSessionStorageItem,
  reloadBrowserLocation,
  setBrowserSessionStorageItem,
} from "@/shared/lib/browser-environment";
import { warnInDevelopment } from "@/shared/lib/development-warning";
import type { RouteErrorScope } from "@/shared/lib/telemetry-contract";
import {
  telemetryErrorScopes,
  trackedEventNames,
} from "@/shared/lib/telemetry-contract";

const DYNAMIC_IMPORT_RELOAD_KEY = "findafew:dynamic-import-reload";
const DYNAMIC_IMPORT_RELOAD_COOLDOWN_MS = 30_000;

type RouteErrorTelemetryContext = Record<string, string | undefined>;

interface RouteErrorStateProps {
  error: unknown;
  scope: RouteErrorScope;
  title: string;
  description: string;
  retryLabel?: string;
  fallbackTo?: string;
  fallbackLabel?: string;
  fullPage?: boolean;
  onRetry?: () => void;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function isDynamicImportFetchError(error: unknown) {
  const message = getErrorMessage(error);

  return (
    message.includes("Failed to fetch dynamically imported module") ||
    message.includes("Importing a module script failed")
  );
}

function getRouteErrorVisual(scope: RouteErrorScope) {
  if (scope.startsWith("auth.")) {
    return <ErrorAuthLinkVisual className="h-36 w-auto text-foreground" />;
  }

  return <ErrorRouteLoadVisual className="h-36 w-auto text-foreground" />;
}

function recoverDynamicImportError() {
  const lastReload = Number(
    getBrowserSessionStorageItem(DYNAMIC_IMPORT_RELOAD_KEY) ?? 0,
  );
  const now = Date.now();

  if (now - lastReload < DYNAMIC_IMPORT_RELOAD_COOLDOWN_MS) {
    return false;
  }

  setBrowserSessionStorageItem(DYNAMIC_IMPORT_RELOAD_KEY, String(now));
  reloadBrowserLocation();

  return true;
}

async function captureRouteException(
  scope: string,
  error: unknown,
  context: RouteErrorTelemetryContext,
) {
  try {
    const { captureException } = await import("@/shared/lib/telemetry");

    captureException(scope, error, context);
  } catch (telemetryError) {
    warnInDevelopment("Route error telemetry failed.", telemetryError);
  }
}

async function trackRouteRecovery(context: RouteErrorTelemetryContext) {
  try {
    const { trackEvent } = await import("@/shared/lib/telemetry");

    trackEvent(trackedEventNames.routeErrorRecovery, context);
  } catch (telemetryError) {
    warnInDevelopment("Route recovery telemetry failed.", telemetryError);
  }
}

export function RouteErrorState({
  error,
  scope,
  title,
  description,
  retryLabel = "Try again",
  fallbackTo = "/home",
  fallbackLabel = "Back to home",
  fullPage = false,
  onRetry,
}: RouteErrorStateProps) {
  const router = useRouter();
  const queryErrorResetBoundary = useQueryErrorResetBoundary();
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    if (isDynamicImportFetchError(error) && recoverDynamicImportError()) {
      return;
    }

    void captureRouteException(telemetryErrorScopes.routeError, error, {
      routeScope: scope,
    });
  }, [error, scope]);

  async function handleRetry() {
    if (!onRetry || isRetrying) {
      return;
    }

    setIsRetrying(true);
    void trackRouteRecovery({
      routeScope: scope,
      status: "started",
    });

    try {
      queryErrorResetBoundary.reset();
      onRetry();
      await router.invalidate();
      void trackRouteRecovery({
        routeScope: scope,
        status: "success",
      });
      setIsRetrying(false);
    } catch (retryError) {
      void captureRouteException(telemetryErrorScopes.routeError, retryError, {
        routeScope: scope,
        recovery: "retry",
      });
      void trackRouteRecovery({
        routeScope: scope,
        status: "error",
      });
      setIsRetrying(false);
    }
  }

  return (
    <FeedbackState
      fullPage={fullPage}
      headingId="route-error-heading"
      visual={getRouteErrorVisual(scope)}
      title={title}
      description={description}
      actions={
        <>
          {onRetry ? (
            <Button
              className="min-w-36"
              onClick={() => void handleRetry()}
              loading={isRetrying}
            >
              <RefreshCw size={16} />
              {retryLabel}
            </Button>
          ) : null}

          <Button asChild variant="outline" className="min-w-36">
            <Link to={fallbackTo}>{fallbackLabel}</Link>
          </Button>
        </>
      }
    />
  );
}
