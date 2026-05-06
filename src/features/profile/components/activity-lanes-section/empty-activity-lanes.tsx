import { Link } from "@tanstack/react-router";

import { buildInterestsEditNavigation } from "@/features/onboarding/lib/onboarding-route";
import { Button } from "@/shared/components/ui/button";

export function EmptyActivityLanes() {
  return (
    <div className="flex flex-col items-start gap-3">
      <p className="text-sm font-medium text-slate-muted">
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
  );
}
