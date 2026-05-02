import { createRootRoute, Outlet } from "@tanstack/react-router";
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";

import { NotFoundState } from "@/shared/components/not-found-state";
import { RouteErrorState } from "@/shared/components/route-error-state";
import { routeErrorScopes } from "@/shared/lib/telemetry-contract";

export const rootRoute = createRootRoute({
  component: () => (
    <NuqsAdapter>
      <Outlet />
    </NuqsAdapter>
  ),
  errorComponent: ({ error, reset }) => (
    <RouteErrorState
      error={error}
      scope={routeErrorScopes.root}
      fullPage
      title="Something went wrong in TeamForge"
      description="The app hit an unexpected issue while loading this screen."
      fallbackTo="/"
      fallbackLabel="Back home"
      onRetry={reset}
    />
  ),
  notFoundComponent: () => <NotFoundState fullPage />,
});
