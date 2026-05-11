import { Link } from "@tanstack/react-router";
import { EmptyProfileActivityLanesVisual } from "@/assets/empty-state/empty-profile-activity-lanes";
import { buildInterestsEditNavigation } from "@/features/onboarding/lib/onboarding-route";
import { Button } from "@/shared/components/ui/button";

export function EmptyActivityLanes() {
  return (
    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
      <EmptyProfileActivityLanesVisual className="w-16 shrink-0 text-foreground sm:w-20" />
      <div className="flex min-w-0 flex-col items-start gap-3">
        <p className="font-medium text-slate-muted text-sm">
          Add a few interests and TeamForge can turn them into activity lanes.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link
            {...buildInterestsEditNavigation({
              returnTo: "/profile",
            })}
          >
            Add interests
          </Link>
        </Button>
      </div>
    </div>
  );
}
