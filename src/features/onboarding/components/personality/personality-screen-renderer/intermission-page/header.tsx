import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { fadeUpItem } from "@/features/onboarding/constants/motion";
import { AnimatedCircularProgressBar } from "@/shared/components/ui/animated-circular-progress-bar";

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
      <div className="relative flex size-16 shrink-0 items-center justify-center pr-4 sm:h-22 sm:w-22 sm:pr-7">
        <AnimatedCircularProgressBar
          max={totalQuestions}
          min={0}
          value={answeredCount}
          gaugePrimaryColor="var(--color-forge-teal)"
          gaugeSecondaryColor="color-mix(in srgb, var(--color-slate-muted) 22%, transparent)"
          className="size-full text-transparent"
        />
        <div className="absolute inset-0 flex items-center justify-center pr-4 sm:pr-7">
          <div className="z-10 flex size-9 items-center justify-center rounded-lg border border-border bg-card text-forge-teal shadow-forge-teal/5 shadow-lg transition-transform duration-300 group-hover:scale-105 sm:h-11 sm:w-11 dark:shadow-xl">
            <Icon size={18} strokeWidth={2.5} className="sm:size-5.25" />
          </div>
        </div>
      </div>

      <div className="flex h-16 flex-col items-start justify-center border-border/80 border-l pl-4 sm:h-22 sm:pl-7 dark:border-white/10">
        <span className="mb-1 font-black font-sans text-forge-teal/80 text-xs uppercase tracking-widest">
          Quick Break
        </span>
        <div className="flex items-baseline gap-1.5">
          <span className="font-black font-sans text-2xl text-ink tracking-tighter sm:text-3xl">
            {answeredCount}
          </span>
          <span className="font-bold font-sans text-muted-foreground text-xs tracking-tight">
            / {totalQuestions} answered
          </span>
        </div>
      </div>
    </motion.div>
  );
}
