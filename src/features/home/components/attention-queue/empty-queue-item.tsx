import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { buildExploreNavigation } from "@/shared/navigation";

export function EmptyQueueItem() {
  return (
    <li className="lg:col-span-2">
      <EmptyState
        icon={CheckCircle2}
        title="You're all caught up"
        description="No decisions are waiting for you."
        action={
          <Button asChild size="sm" variant="outline">
            <Link {...buildExploreNavigation()}>
              Explore
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          </Button>
        }
      />
    </li>
  );
}
