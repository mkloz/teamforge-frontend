import { createRootRoute, Outlet } from "@tanstack/react-router";
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";

import { NotFoundState } from "@/shared/components/not-found-state";
import { createRouteErrorComponent } from "@/app/router/route-error-component";
import { routeErrorScopes } from "@/shared/lib/telemetry-contract";

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
    description: "The app hit an unexpected issue while loading this screen.",
    fallbackTo: "/",
    fallbackLabel: "Back home",
  }),
  notFoundComponent: () => <NotFoundState fullPage />,
});
