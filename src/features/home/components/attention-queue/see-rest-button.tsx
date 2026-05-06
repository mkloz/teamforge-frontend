import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { buildActivityNavigation } from "@/features/activity/lib/activity-route";
import { Button } from "@/shared/components/ui/button";

export function SeeRestButton() {
  return (
    <Button
      asChild
      variant="ghost"
      size="sm"
      className="m-2 justify-self-start"
    >
      <Link {...buildActivityNavigation()}>
        See the rest
        <ArrowRight className="size-4" />
      </Link>
    </Button>
  );
}
