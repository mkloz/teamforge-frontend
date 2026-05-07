import { Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

import { buildExploreNavigation } from "@/features/explore/lib/explore-route";
import { Button } from "@/shared/components/ui/button";

export function EmptyQueueItem() {
  return (
    <div className="flex min-w-0 items-center gap-3 px-1 py-4 sm:px-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center text-forge-teal">
          <CheckCircle2 className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-foreground">
            Nothing needs a decision.
          </p>
          <p className="mt-1 text-xs leading-relaxed font-medium text-muted-foreground">
            Your groups are quiet enough to look for a fresh opening.
          </p>
        </div>
      </div>
      <Button asChild variant="outline" size="sm" className="shrink-0">
        <Link {...buildExploreNavigation()}>Explore</Link>
      </Button>
    </div>
  );
}
