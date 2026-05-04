import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

import { captureException, trackEvent } from "@/shared/lib/telemetry";
import type { RouteErrorScope } from "@/shared/lib/telemetry-contract";
import {
  telemetryErrorScopes,
  trackedEventNames,
} from "@/shared/lib/telemetry-contract";
import { Button } from "@/shared/components/ui/button";

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
    window.sessionStorage.getItem(DYNAMIC_IMPORT_RELOAD_KEY) ?? 0,
  );
  const now = Date.now();

  if (now - lastReload < DYNAMIC_IMPORT_RELOAD_COOLDOWN_MS) {
    return false;
  }

  window.sessionStorage.setItem(DYNAMIC_IMPORT_RELOAD_KEY, String(now));
  window.location.reload();

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
    if (
      typeof window !== "undefined" &&
      isDynamicImportFetchError(error) &&
      recoverDynamicImportError()
    ) {
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
    } catch (retryError) {
      captureException(telemetryErrorScopes.routeError, retryError, {
        routeScope: scope,
        recovery: "retry",
      });
      trackEvent(trackedEventNames.routeErrorRecovery, {
        routeScope: scope,
        status: "error",
      });
    } finally {
      setIsRetrying(false);
    }
  }

  return (
    <div
      className={
        fullPage
          ? "flex min-h-screen items-center justify-center bg-canvas px-4 py-10"
          : "flex min-h-[60vh] items-center justify-center px-4 py-10"
      }
    >
      <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle size={22} />
        </div>

        <h1 className="text-2xl font-bold text-ink">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-muted">
          {description}
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          {onRetry ? (
            <Button onClick={() => void handleRetry()} loading={isRetrying}>
              <RefreshCw size={16} />
              {retryLabel}
            </Button>
          ) : null}

          <Button asChild variant="outline">
            <Link to={fallbackTo}>{fallbackLabel}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
