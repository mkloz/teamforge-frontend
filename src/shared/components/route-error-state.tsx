import { Link } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

import { captureException } from "@/shared/lib/telemetry";
import type { RouteErrorScope } from "@/shared/lib/telemetry-contract";
import { telemetryErrorScopes } from "@/shared/lib/telemetry-contract";
import { Button } from "@/shared/components/ui/button";

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
  useEffect(() => {
    captureException(telemetryErrorScopes.routeError, error, {
      routeScope: scope,
    });
  }, [error, scope]);

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
          {onRetry ? <Button onClick={onRetry}>{retryLabel}</Button> : null}

          <Button asChild variant="outline">
            <Link to={fallbackTo}>{fallbackLabel}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
