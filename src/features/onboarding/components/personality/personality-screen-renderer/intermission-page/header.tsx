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
      className="flex items-center justify-center gap-0 mb-12 w-full group"
    >
      <div className="relative w-20 h-20 flex items-center justify-center shrink-0 pr-6">
        <AnimatedCircularProgressBar
          max={totalQuestions}
          min={0}
          value={answeredCount}
          gaugePrimaryColor="var(--color-forge-teal)"
          gaugeSecondaryColor="rgba(148, 163, 184, 0.22)"
          className="w-full h-full text-[0px]"
        />
        <div className="absolute inset-0 flex items-center justify-center pr-6">
          <div className="w-10 h-10 rounded-2xl bg-card shadow-lg shadow-forge-teal/5 dark:shadow-[0_10px_24px_rgba(0,0,0,0.28)] border border-border flex items-center justify-center text-forge-teal z-10 transition-transform group-hover:scale-105 duration-300">
            <Icon size={20} strokeWidth={2.5} />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-start justify-center h-20 pl-6 border-l border-slate-200/80 dark:border-white/10">
        <span className="font-sans text-xs font-black uppercase tracking-[0.2em] text-forge-teal/80 mb-1">
          Quick Break
        </span>
        <div className="flex items-baseline gap-1.5">
          <span className="font-sans text-2xl font-black text-ink tracking-tighter">
            {answeredCount}
          </span>
          <span className="font-sans text-xs font-bold text-muted-foreground tracking-tight">
            / {totalQuestions} answered
          </span>
        </div>
      </div>
    </motion.div>
  );
}
