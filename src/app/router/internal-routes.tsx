import { createRoute } from "@tanstack/react-router";
import { lazy } from "react";

import { LazyPage } from "@/app/router/lazy-page";
import { rootRoute } from "@/app/router/root-route";
import { RouteErrorState } from "@/shared/components/route-error-state";
import { routeErrorScopes } from "@/shared/lib/telemetry-contract";

export const internalRoutes = (() => {
  if (!import.meta.env.DEV) {
    return [];
  }

  const DesignSystemPage = lazy(() =>
    import("@/features/design-system/design-system-page").then((m) => ({
      default: m.DesignSystemPage,
    })),
  );

  return [
    createRoute({
      getParentRoute: () => rootRoute,
      path: "/design-system",
      component: () => <LazyPage component={DesignSystemPage} />,
      errorComponent: ({ error, reset }) => (
        <RouteErrorState
          error={error}
          scope={routeErrorScopes.designSystem}
          fullPage
          title="Design system could not finish loading"
          description="The internal visual QA surface hit an unexpected issue while loading components or examples."
          fallbackTo="/home"
          fallbackLabel="Back to home"
          onRetry={reset}
        />
      ),
    }),
  ];
})();
