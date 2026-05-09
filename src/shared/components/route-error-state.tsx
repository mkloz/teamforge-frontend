import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

import { FeedbackState } from "@/shared/components/feedback-state";
import { Button } from "@/shared/components/ui/button";
import {
  getBrowserSessionStorageItem,
  reloadBrowserLocation,
  setBrowserSessionStorageItem,
} from "@/shared/lib/browser-environment";
import { captureException, trackEvent } from "@/shared/lib/telemetry";
import type { RouteErrorScope } from "@/shared/lib/telemetry-contract";
import {
  telemetryErrorScopes,
  trackedEventNames,
} from "@/shared/lib/telemetry-contract";

const DYNAMIC_IMPORT_RELOAD_KEY = "teamforge:dynamic-import-reload";
const DYNAMIC_IMPORT_RELOAD_COOLDOWN_MS = 30_000;

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

export function RouteErrorState({
  error,
  scope,
  title,
  description,
  retryLabel = "Try again",
  fallbackTo = "/home",
  fallbackLabel = "Back to safety",
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

    captureException(telemetryErrorScopes.routeError, error, {
      routeScope: scope,
    });
  }, [error, scope]);

  async function handleRetry() {
    if (!onRetry || isRetrying) {
      return;
    }

    setIsRetrying(true);
    trackEvent(trackedEventNames.routeErrorRecovery, {
      routeScope: scope,
      status: "started",
    });

    try {
      queryErrorResetBoundary.reset();
      onRetry();
      await router.invalidate();
      trackEvent(trackedEventNames.routeErrorRecovery, {
        routeScope: scope,
        status: "success",
      });
      setIsRetrying(false);
    } catch (retryError) {
      captureException(telemetryErrorScopes.routeError, retryError, {
        routeScope: scope,
        recovery: "retry",
      });
      trackEvent(trackedEventNames.routeErrorRecovery, {
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
      icon={<AlertTriangle size={22} />}
      iconClassName="bg-destructive/10 text-destructive"
      title={title}
      description={description}
      actions={
        <>
          {onRetry ? (
            <Button onClick={() => void handleRetry()} loading={isRetrying}>
              <RefreshCw size={16} />
              {retryLabel}
            </Button>
          ) : null}

          <Button asChild variant="outline">
            <Link to={fallbackTo}>{fallbackLabel}</Link>
          </Button>
        </>
      }
    />
  );
}
