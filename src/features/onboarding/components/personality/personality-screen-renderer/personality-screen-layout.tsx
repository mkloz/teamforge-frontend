import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import {
  fadeUpItem,
  staggerContainer,
} from "@/features/onboarding/constants/motion";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface PersonalityScreenShellProps {
  children: ReactNode;
  className?: string;
}

interface BackLinkProps {
  label?: string;
  onBack: () => void;
}

interface StepNavigationProps {
  backClassName?: string;
  className?: string;
  nextLabel?: string;
  onBack: () => void;
  onNext: () => void;
  backLabel?: string;
}

export function PersonalityScreenShell({
  children,
  className,
}: PersonalityScreenShellProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={cn(
        "mx-auto flex min-h-[calc(100dvh-6rem)] w-full flex-col justify-start gap-0 pt-4 sm:min-h-[calc(100dvh-5rem)] sm:pt-0",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

export function MotionStep({
  children,
  className,
}: PersonalityScreenShellProps) {
  return (
    <motion.div variants={fadeUpItem} className={className}>
      {children}
    </motion.div>
  );
}

export function BackLink({ label = "Back", onBack }: BackLinkProps) {
  return (
    <MotionStep className="mb-5 self-start">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="h-8 rounded-md px-2 font-bold text-muted-foreground text-sm underline-offset-4 hover:bg-transparent hover:text-ink hover:underline focus-visible:ring-forge-teal dark:hover:text-white"
      >
        <ArrowLeft size={15} strokeWidth={2.5} aria-hidden="true" />
        <span>{label}</span>
      </Button>
    </MotionStep>
  );
}

export function StepNavigation({
  backClassName,
  backLabel = "Back",
  className,
  nextLabel = "Next step",
  onBack,
  onNext,
}: StepNavigationProps) {
  return (
    <MotionStep
      className={cn(
        "mt-auto flex w-full flex-col-reverse items-stretch gap-3 pt-6 min-[430px]:flex-row min-[430px]:items-center",
        className,
      )}
    >
      <Button
        size="md"
        variant="outline"
        onClick={onBack}
        className={cn(
          "w-full min-w-0 min-[430px]:w-auto min-[430px]:shrink-0",
          backClassName,
        )}
      >
        <ArrowLeft size={16} strokeWidth={2.5} />
        <span className="truncate">{backLabel}</span>
      </Button>
      <Button
        size="md"
        onClick={onNext}
        className="w-full min-w-0 min-[430px]:flex-1"
      >
        <span className="truncate">{nextLabel}</span>
        <ArrowRight size={16} strokeWidth={2.5} />
      </Button>
    </MotionStep>
  );
}
