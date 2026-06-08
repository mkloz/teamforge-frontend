import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";

import type { HomeViewer } from "@/features/home/lib/home-contract";
import { IconTile } from "@/shared/components/ui/icon-tile";

import { getProfileStepMeta } from "./attention-queue-formatters";
import {
  AttentionQueueMeta,
  AttentionQueueTypeLabel,
} from "./attention-queue-meta";
import { getProfileStepNavigation } from "./profile-step-action";

export function ProfileStepQueueItem({
  nextStep,
}: {
  nextStep: NonNullable<HomeViewer["nextStep"]>;
}) {
  const navigation = getProfileStepNavigation(nextStep);
  const stepMeta = getProfileStepMeta(nextStep);

  return (
    <li className="group border-border/55 border-b px-1 py-3 transition-colors duration-150 last:border-b-0 hover:bg-forge-teal/5 sm:px-3">
      <Link
        {...navigation}
        aria-label={nextStep.label}
        className="flex min-w-0 items-center justify-between gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <IconTile
            icon={ShieldCheck}
            shape="circle"
            size="lg"
            tone="teal"
            className="bg-forge-teal/8"
          />
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <AttentionQueueTypeLabel icon={ShieldCheck} tone="teal">
                Setup
              </AttentionQueueTypeLabel>
              <p className="truncate font-bold text-foreground text-sm transition-colors duration-150 group-hover:text-forge-teal">
                {nextStep.title}
              </p>
            </div>
            <p className="mt-1 truncate font-medium text-muted-foreground text-xs">
              {nextStep.body}
            </p>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5">
              {stepMeta.map((item) => (
                <AttentionQueueMeta key={item} icon={CheckCircle2}>
                  {item}
                </AttentionQueueMeta>
              ))}
            </div>
          </div>
        </div>
        <span className="inline-flex h-9 shrink-0 items-center justify-center gap-1 rounded-full border border-border px-4 font-bold text-foreground text-sm transition-colors duration-150 group-hover:border-forge-teal/30 group-hover:text-forge-teal">
          {nextStep.label}
          <ArrowRight className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
        </span>
      </Link>
    </li>
  );
}
