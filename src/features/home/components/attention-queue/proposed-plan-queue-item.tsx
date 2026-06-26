import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { IconTile } from "@/shared/components/ui/icon-tile";

import type { AttentionQueuePlan } from "./attention-queue.types";
import { AttentionQueueMeta } from "./attention-queue-meta";
import { getProposedPlanQueueItemRenderState } from "./proposed-plan-queue-item-render-state";

export function ProposedPlanQueueItem({
  group,
}: {
  group: AttentionQueuePlan;
}) {
  const { compactActionLabel, model, navigation, PlanActionIcon, planMeta } =
    getProposedPlanQueueItemRenderState(group);

  return (
    <li className="group border-border/55 border-b px-1 py-3 transition-colors duration-150 last:border-b-0 hover:bg-spark-amber/5 sm:px-3">
      <Link
        {...navigation}
        className="flex min-w-0 items-center justify-between gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <IconTile icon={PlanActionIcon} size="lg" tone="amber" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-foreground text-sm transition-colors duration-150 group-hover:text-spark-amber">
              {group.plan.title}
            </p>
            <p className="mt-0.5 truncate font-medium text-muted-foreground text-xs">
              {model.description}
            </p>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5">
              {planMeta.map((item) => (
                <AttentionQueueMeta
                  key={item.label}
                  icon={item.icon}
                  className={item.isChanging ? "text-foreground" : undefined}
                  labelClassName={
                    item.isChanging
                      ? "underline decoration-spark-amber decoration-2 underline-offset-2"
                      : undefined
                  }
                >
                  {item.label}
                </AttentionQueueMeta>
              ))}
            </div>
          </div>
        </div>
        <span className="inline-flex h-9 shrink-0 items-center justify-center gap-1 rounded-full border border-border px-3 font-bold text-foreground text-sm transition-colors duration-150 group-hover:border-spark-amber/35 group-hover:text-spark-amber sm:px-4">
          <span className="hidden sm:inline">{model.actionLabel}</span>
          <span className="sm:hidden" aria-hidden="true">
            {compactActionLabel}
          </span>
          <span className="sr-only sm:hidden">{model.actionLabel}</span>
          <ArrowRight
            className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </span>
      </Link>
    </li>
  );
}
