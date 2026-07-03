import { Link } from "@tanstack/react-router";
import { Tags } from "lucide-react";
import { EmptyProfileActivityLanesVisual } from "@/features/profile/assets/empty-profile-activity-lanes";
import { Button } from "@/shared/components/ui/button";
import { buildInterestsEditNavigation } from "@/shared/navigation";

export function EmptyActivityLanes() {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-center sm:flex-row sm:gap-4 sm:text-left">
      <EmptyProfileActivityLanesVisual className="h-16 w-auto shrink-0 text-foreground" />
      <div className="flex min-w-0 flex-col items-center gap-3 sm:items-start">
        <p className="font-medium text-slate-muted text-sm">
          Add a few interests and TeamForge can turn them into activity lanes.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link
            {...buildInterestsEditNavigation({
              returnTo: "/profile",
            })}
          >
            <Tags className="size-4" aria-hidden="true" />
            Add interests
          </Link>
        </Button>
      </div>
    </div>
  );
}
