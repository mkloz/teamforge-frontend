import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { buildForgeLaunchNavigation } from "@/features/forge/lib/forge-route";
import { NotFoundState } from "@/shared/components/not-found-state";
import { Button } from "@/shared/components/ui/button";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import { createTeamForgePageMetadata } from "@/shared/lib/teamforge-page-metadata";

const NOT_FOUND_METADATA = createTeamForgePageMetadata({
  title: "Page Not Found",
  description: "The page you are looking for does not exist on TeamForge.",
});

export function NotFoundRouteState() {
  usePageMetadata(NOT_FOUND_METADATA);

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
