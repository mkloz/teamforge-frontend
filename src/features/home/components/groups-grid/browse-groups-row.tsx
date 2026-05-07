import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { buildExploreNavigation } from "@/features/explore/lib/explore-route";

interface BrowseGroupsRowProps {
  delay: number;
}

export function BrowseGroupsRow({ delay }: BrowseGroupsRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      role="listitem"
    >
      <Link
        {...buildExploreNavigation()}
        className="group flex h-16 items-center justify-between rounded-xl border-b border-border/55 px-1 py-3 text-xs font-bold text-muted-foreground transition-all duration-150 hover:bg-card/45 hover:text-forge-teal focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:px-3"
        aria-label="Browse and discover new groups"
      >
        <span>Browse more groups</span>
        <ArrowRight
          className="size-4 opacity-70 transition-transform duration-150 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </Link>
    </motion.div>
  );
}
