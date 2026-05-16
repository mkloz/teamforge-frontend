import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { buildForgeLaunchNavigation } from "@/features/forge/lib/forge-route";
import { NotFoundState } from "@/shared/components/not-found-state";
import { Button } from "@/shared/components/ui/button";

export function NotFoundRouteState() {
  return (
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
  );
}
