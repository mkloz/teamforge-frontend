import { Link } from "@tanstack/react-router";

import {
  buildGroupPlanDetailNavigation,
  createRouteFocusKey,
  withRouteFocusReturn,
} from "@/shared/navigation";
import type { ExploreGroup } from "@/shared/schemas";

interface ExploreGroupDetailsLinkProps {
  group: ExploreGroup;
}

export function ExploreGroupDetailsLink({
  group,
}: ExploreGroupDetailsLinkProps) {
  const routeFocusKey = createRouteFocusKey("explore-group", group.id);

  return (
    <Link
      {...buildGroupPlanDetailNavigation(group.id, { source: "explore" })}
      data-route-focus-key={routeFocusKey}
      state={(previousState) =>
        withRouteFocusReturn(previousState, routeFocusKey)
      }
      aria-label={`View ${group.name} group details`}
      className="block size-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <span className="sr-only">View group details</span>
    </Link>
  );
}
