import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { buildExploreNavigation } from "@/shared/navigation";

export function BrowseGroupsRow() {
  return (
    <li className="pt-1">
      <Link
        {...buildExploreNavigation()}
        className="group inline-flex min-h-10 items-center gap-2 rounded-xl px-3 py-1.5 font-bold text-forge-teal text-xs transition-colors duration-150 hover:bg-forge-teal/8 hover:text-forge-teal/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:text-secondary-foreground"
      >
        <span>Explore groups</span>
        <ArrowRight
          className="size-3.5 opacity-80 transition-transform duration-150 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </Link>
    </li>
  );
}
