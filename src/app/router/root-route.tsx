import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";
import { createRouteErrorComponent } from "@/app/router/route-error-component";
import { buildForgeLaunchNavigation } from "@/features/forge/lib/forge-route";
import { NotFoundState } from "@/shared/components/not-found-state";
import { Button } from "@/shared/components/ui/button";
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
  notFoundComponent: () => (
    <NotFoundState
      fullPage
      primaryAction={
        <Button asChild size="lg">
          <Link {...buildForgeLaunchNavigation()}>
            <Plus className="size-5" aria-hidden="true" />
            Forge my group
          </Link>
        </Button>
      }
    />
  ),
});
