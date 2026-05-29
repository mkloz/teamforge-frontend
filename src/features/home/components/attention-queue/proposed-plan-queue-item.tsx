import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CalendarClock } from "lucide-react";

import { buildActivityGroupNavigation } from "@/features/activity/lib/activity-route";
import { getPlanTimingLabel } from "@/features/home/lib/home-insights";

import type { AttentionQueuePlan } from "./attention-queue.types";
import { getAttentionQueueItemMotion } from "./attention-queue-motion";

export function ProposedPlanQueueItem({
  animateOnInsert,
  group,
}: {
  animateOnInsert: boolean;
  group: AttentionQueuePlan;
}) {
  const navigation = buildActivityGroupNavigation(group.id, {
    panel: "group",
    plan: group.plan.id,
  });
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.li
      {...getAttentionQueueItemMotion({ animateOnInsert, shouldReduceMotion })}
      className="group border-border/55 border-b transition-colors duration-150 last:border-b-0 hover:bg-forge-teal/5"
    >
      <Link
        {...navigation}
        className="flex min-w-0 items-center gap-3 px-1 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-3"
      >
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center text-spark-amber">
            <CalendarClock className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 font-black text-foreground text-sm leading-snug transition-colors duration-150 group-hover:text-forge-teal">
              {group.plan.title}
            </p>
            <p className="mt-1 font-medium text-muted-foreground text-xs leading-relaxed">
              {group.name}
            </p>
            <p className="mt-0.5 font-black text-spark-amber text-xs">
              {getPlanTimingLabel(group.plan)}
            </p>
          </div>
        </div>
        <span className="inline-flex h-9 shrink-0 items-center gap-1 rounded-lg border border-border px-3 font-bold text-foreground text-sm transition-colors duration-150 group-hover:border-forge-teal/30 group-hover:text-forge-teal">
          Open
          <ArrowRight className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
        </span>
      </Link>
    </motion.li>
  );
}
