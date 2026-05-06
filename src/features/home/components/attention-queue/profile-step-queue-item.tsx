import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

import type { HomeViewer } from "@/features/home/lib/home-contract";
import { Button } from "@/shared/components/ui/button";

import { ProfileStepAction } from "./profile-step-action";

export function ProfileStepQueueItem({
  nextStep,
}: {
  nextStep: NonNullable<HomeViewer["nextStep"]>;
}) {
  return (
    <motion.article
      role="listitem"
      key="profile-step"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex min-w-0 items-start gap-3 border-b border-border/55 px-1 py-4 transition-colors duration-150 hover:bg-forge-teal/5 last:border-b-0 sm:px-3"
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center text-forge-teal">
          <ShieldCheck className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-foreground">{nextStep.title}</p>
          <p className="mt-1 text-xs font-medium leading-relaxed text-muted-foreground">
            {nextStep.body}
          </p>
        </div>
      </div>
      <Button asChild variant="outline" size="sm" className="shrink-0">
        <ProfileStepAction nextStep={nextStep} />
      </Button>
    </motion.article>
  );
}
