import { RouteErrorState } from "@/shared/components/route-error-state";
import type { RouteErrorScope } from "@/shared/lib/telemetry-contract";

interface RouteErrorComponentOptions {
  description: string;
  fallbackLabel: string;
  fallbackTo: string;
  fullPage?: boolean;
  scope: RouteErrorScope;
  title: string;
}

export function createRouteErrorComponent({
  description,
  fallbackLabel,
  fallbackTo,
  fullPage,
  scope,
  title,
}: RouteErrorComponentOptions) {
  return function RouteErrorComponent({
    error,
    reset,
  }: {
    error: unknown;
    reset: () => void;
  }) {
    return (
      <RouteErrorState
        error={error}
        scope={scope}
        fullPage={fullPage}
        title={title}
        description={description}
        fallbackTo={fallbackTo}
        fallbackLabel={fallbackLabel}
        onRetry={reset}
      />
    );
  };
}
