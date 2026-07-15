import { createRootRoute, Outlet } from "@tanstack/react-router";
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";
import { lazy, Suspense } from "react";

import { createRouteErrorComponent } from "@/app/router/route-error-component";
import { routeErrorScopes } from "@/shared/lib/telemetry-contract";

const NotFoundRouteState = lazy(() =>
  import("@/app/router/not-found-route-state").then((module) => ({
    default: module.NotFoundRouteState,
  })),
);

export const rootRoute = createRootRoute({
  component: () => (
    <NuqsAdapter>
      <Outlet />
    </NuqsAdapter>
  ),
  errorComponent: createRouteErrorComponent({
    scope: routeErrorScopes.root,
    fullPage: true,
    title: "Something went wrong in TeamForge",
    description: "TeamForge could not load this screen.",
    fallbackTo: "/",
    fallbackLabel: "Back home",
  }),
  notFoundComponent: () => (
    <Suspense fallback={null}>
      <NotFoundRouteState />
    </Suspense>
  ),
});
