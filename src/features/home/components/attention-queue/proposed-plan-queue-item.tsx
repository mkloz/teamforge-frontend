import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CalendarClock } from "lucide-react";

import { buildActivityGroupNavigation } from "@/features/activity/lib/activity-route";
import { getPlanTimingLabel } from "@/features/home/lib/home-insights";
import { Button } from "@/shared/components/ui/button";

import type { AttentionQueuePlan } from "./attention-queue.types";

export function ProposedPlanQueueItem({
  group,
}: {
  group: AttentionQueuePlan;
}) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex min-w-0 items-center gap-3 border-border/55 border-b px-1 py-4 transition-colors duration-150 last:border-b-0 hover:bg-forge-teal/5 sm:px-3"
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center text-spark-amber">
          <CalendarClock className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 font-black text-foreground text-sm leading-snug">
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
      <Button asChild variant="outline" size="sm" className="shrink-0">
        <Link
          {...buildActivityGroupNavigation(group.id, {
            panel: "group",
            plan: group.plan.id,
          })}
        >
          Open
        </Link>
      </Button>
    </motion.li>
  );
}
