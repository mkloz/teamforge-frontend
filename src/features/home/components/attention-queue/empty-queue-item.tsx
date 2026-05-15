import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { buildExploreNavigation } from "@/features/explore/lib/explore-route";
import { getAttentionQueueItemMotion } from "./attention-queue-motion";

export function EmptyQueueItem({
  animateOnInsert,
}: {
  animateOnInsert: boolean;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.li
      {...getAttentionQueueItemMotion({ animateOnInsert, shouldReduceMotion })}
    >
      <Link
        {...buildExploreNavigation()}
        className="group flex min-w-0 items-center gap-3 px-1 py-4 transition-colors duration-150 hover:bg-forge-teal/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-3"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center text-forge-teal">
            <CheckCircle2 className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-black text-foreground text-sm transition-colors duration-150 group-hover:text-forge-teal">
              Nothing needs a decision.
            </p>
            <p className="mt-1 font-medium text-muted-foreground text-xs leading-relaxed">
              Your groups are quiet enough to look for a fresh opening.
            </p>
          </div>
        </div>
        <span className="inline-flex h-9 shrink-0 items-center gap-1 rounded-lg border border-border px-3 font-bold text-foreground text-sm transition-colors duration-150 group-hover:border-forge-teal/30 group-hover:text-forge-teal">
          Explore
          <ArrowRight className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
        </span>
      </Link>
    </motion.li>
  );
}
