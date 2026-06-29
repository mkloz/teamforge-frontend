import { Link } from "@tanstack/react-router";
import { Home, LogIn, Plus, UserPlus } from "lucide-react";
import { useAuthSessionState } from "@/shared/api/auth-session-state";
import { NotFoundState } from "@/shared/components/not-found-state";
import { Button } from "@/shared/components/ui/button";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import { buildAuthRouteNavigation } from "@/shared/lib/auth-route";
import { createTeamForgePageMetadata } from "@/shared/lib/teamforge-page-metadata";
import { buildForgeLaunchNavigation } from "@/shared/navigation/forge-navigation";
import { buildHomeNavigation } from "@/shared/navigation/home-navigation";

const NOT_FOUND_METADATA = createTeamForgePageMetadata({
  title: "Page Not Found",
  description: "The page you are looking for does not exist on TeamForge.",
});

export function NotFoundRouteState() {
  usePageMetadata(NOT_FOUND_METADATA);
  const { isAuthenticated } = useAuthSessionState();

  return (
    <NotFoundState
      fullPage
      primaryAction={
        isAuthenticated ? (
          <Button asChild size="lg">
            <Link {...buildForgeLaunchNavigation()}>
              <Plus className="size-5" aria-hidden="true" />
              Forge my group
            </Link>
          </Button>
        ) : (
          <Button asChild size="lg">
            <Link {...buildAuthRouteNavigation("/auth/register", null)}>
              <UserPlus className="size-5" aria-hidden="true" />
              Create account
            </Link>
          </Button>
        )
      }
      secondaryAction={
        isAuthenticated ? (
          <Button asChild variant="outline" size="lg">
            <Link {...buildHomeNavigation()}>
              <Home className="size-5" aria-hidden="true" />
              Back home
            </Link>
          </Button>
        ) : (
          <Button asChild variant="outline" size="lg">
            <Link {...buildAuthRouteNavigation("/auth/login", null)}>
              <LogIn className="size-5" aria-hidden="true" />
              Sign in
            </Link>
          </Button>
        )
      }
    />
  );
}
