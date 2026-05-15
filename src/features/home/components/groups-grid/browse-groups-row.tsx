import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { buildExploreNavigation } from "@/features/explore/lib/explore-route";

export function BrowseGroupsRow() {
  return (
    <li>
      <Link
        {...buildExploreNavigation()}
        className="group flex h-16 items-center justify-between rounded-xl border-border/55 border-b px-1 py-3 font-bold text-muted-foreground text-xs transition-all duration-150 hover:bg-card/45 hover:text-forge-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-3"
        aria-label="Browse and discover new groups"
      >
        <span>Browse more groups</span>
        <ArrowRight
          className="size-4 opacity-70 transition-transform duration-150 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </Link>
    </li>
  );
}
