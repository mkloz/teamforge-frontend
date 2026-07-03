import { Link } from "@tanstack/react-router";

import type { RecommendedGroupDetailsLinkProps } from "@/features/home/components/recommended-groups/recommended-group-card-parts/types";
import { buildGroupPlanDetailNavigation } from "@/shared/navigation";

export function RecommendedGroupDetailsLink({
  group,
}: RecommendedGroupDetailsLinkProps) {
  return (
    <Link
      {...buildGroupPlanDetailNavigation(group.id, { source: "home" })}
      aria-label={`View ${group.name} group details`}
      className="block size-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <span className="sr-only">View group details</span>
    </Link>
  );
}
