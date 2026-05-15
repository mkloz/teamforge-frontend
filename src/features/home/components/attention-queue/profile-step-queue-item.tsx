import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";

import type { HomeViewer } from "@/features/home/lib/home-contract";

import { getAttentionQueueItemMotion } from "./attention-queue-motion";
import { getProfileStepNavigation } from "./profile-step-action";

export function ProfileStepQueueItem({
  animateOnInsert,
  nextStep,
}: {
  animateOnInsert: boolean;
  nextStep: NonNullable<HomeViewer["nextStep"]>;
}) {
  const navigation = getProfileStepNavigation(nextStep);
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.li
      key="profile-step"
      {...getAttentionQueueItemMotion({ animateOnInsert, shouldReduceMotion })}
      className="group border-border/55 border-b transition-colors duration-150 last:border-b-0 hover:bg-forge-teal/5"
    >
      <Link
        {...navigation}
        aria-label={nextStep.label}
        className="flex min-w-0 items-start gap-3 px-1 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-3"
      >
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center text-forge-teal">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-black text-foreground text-sm transition-colors duration-150 group-hover:text-forge-teal">
              {nextStep.title}
            </p>
            <p className="mt-1 font-medium text-muted-foreground text-xs leading-relaxed">
              {nextStep.body}
            </p>
          </div>
        </div>
        <span className="inline-flex h-9 shrink-0 items-center gap-1 rounded-lg border border-border px-3 font-bold text-foreground text-sm transition-colors duration-150 group-hover:border-forge-teal/30 group-hover:text-forge-teal">
          {nextStep.label}
          <ArrowRight className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
        </span>
      </Link>
    </motion.li>
  );
}
