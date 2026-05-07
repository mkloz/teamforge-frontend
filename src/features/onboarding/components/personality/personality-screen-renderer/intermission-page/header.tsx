import { motion } from "framer-motion";
import { AnimatedCircularProgressBar } from "@/shared/components/ui/animated-circular-progress-bar";
import { fadeUpItem } from "@/features/onboarding/constants/motion";
import type { LucideIcon } from "lucide-react";

interface IntermissionHeaderProps {
  totalQuestions: number;
  answeredCount: number;
  Icon: LucideIcon;
}

export function IntermissionHeader({
  totalQuestions,
  answeredCount,
  Icon,
}: IntermissionHeaderProps) {
  return (
    <motion.div
      variants={fadeUpItem}
      className="group mb-8 flex w-full items-center justify-center gap-0 sm:mb-12"
    >
      <div className="relative flex h-16 w-16 shrink-0 items-center justify-center pr-4 sm:h-22 sm:w-22 sm:pr-7">
        <AnimatedCircularProgressBar
          max={totalQuestions}
          min={0}
          value={answeredCount}
          gaugePrimaryColor="var(--color-forge-teal)"
          gaugeSecondaryColor="rgba(148, 163, 184, 0.22)"
          className="h-full w-full text-[0px]"
        />
        <div className="absolute inset-0 flex items-center justify-center pr-4 sm:pr-7">
          <div className="z-10 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-forge-teal shadow-lg shadow-forge-teal/5 transition-transform duration-300 group-hover:scale-105 sm:h-11 sm:w-11 dark:shadow-[0_10px_24px_rgba(0,0,0,0.28)]">
            <Icon size={18} strokeWidth={2.5} className="sm:size-[21px]" />
          </div>
        </div>
      </div>

      <div className="flex h-16 flex-col items-start justify-center border-l border-slate-200/80 pl-4 sm:h-22 sm:pl-7 dark:border-white/10">
        <span className="mb-1 font-sans text-[10px] font-black tracking-[0.18em] text-forge-teal/80 uppercase sm:text-xs">
          Quick Break
        </span>
        <div className="flex items-baseline gap-1.5">
          <span className="font-sans text-2xl font-black tracking-tighter text-ink sm:text-3xl">
            {answeredCount}
          </span>
          <span className="font-sans text-xs font-bold tracking-tight text-muted-foreground sm:text-sm">
            / {totalQuestions} answered
          </span>
        </div>
      </div>
    </motion.div>
  );
}
