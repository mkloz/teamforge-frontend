import {
  FileQuestion,
  RefreshCw,
  ShieldOff,
  TriangleAlert,
  WifiOff,
  Wrench,
} from "lucide-react";
import { isApiNetworkError } from "@/shared/api/api-network-error";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { getHttpErrorStatus } from "@/shared/lib/api-error-message";

export function OperatorLoading() {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 md:px-8 md:py-10">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-16 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
    </div>
  );
}

export function OperatorAccessState({
  error,
  onRetry,
  resource = "workspace",
}: {
  error: unknown;
  onRetry: () => void;
  resource?: "case" | "workspace";
}) {
  const status = getHttpErrorStatus(error);
  const accessEnded = status === 401 || status === 403;
  const caseUnavailable = resource === "case" && status === 404;
  const unconfigured =
    status === 501 || (resource === "workspace" && status === 404);
  const loadFailed = !accessEnded && !caseUnavailable && !unconfigured;
  const Icon = caseUnavailable
    ? FileQuestion
    : unconfigured
      ? Wrench
      : accessEnded
        ? ShieldOff
        : isApiNetworkError(error)
          ? WifiOff
          : TriangleAlert;
  const title = caseUnavailable
    ? "Case unavailable"
    : unconfigured
      ? "Moderation tools unavailable"
      : accessEnded
        ? "Moderation access ended"
        : "Moderation data could not be loaded";
  const description = caseUnavailable
    ? "This case is not available with your current admin access."
    : unconfigured
      ? "The moderation API is not available in this environment."
      : accessEnded
        ? "Sign in again with an approved admin account."
        : isApiNetworkError(error)
          ? "Check your connection, then try again."
          : "TeamForge could not load this moderation data. Try again in a moment.";

  return (
    <div className="mx-auto grid min-h-[60dvh] w-full max-w-xl place-items-center px-4 py-10 text-center">
      <div className="grid gap-4 rounded-2xl border border-border bg-card p-8">
        <Icon className="mx-auto size-9" aria-hidden="true" />
        <div className="grid gap-2">
          <h1 className="font-bold text-2xl text-ink">{title}</h1>
          <p className="text-pretty text-slate-muted text-sm leading-relaxed">
            {description}
          </p>
        </div>
        {accessEnded || loadFailed ? (
          <Button variant="outline" onClick={onRetry} className="mx-auto">
            <RefreshCw className="size-4" aria-hidden="true" />
            {accessEnded ? "Check access again" : "Try again"}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
