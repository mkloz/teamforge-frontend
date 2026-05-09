import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { MAX_INTERESTS } from "@/features/onboarding/data/interests-data";
import { Button } from "@/shared/components/ui/button";
import {
  getInterestsProgressPercent,
  getInterestsProgressText,
} from "./interests-progress-model";

interface ProgressBarProps {
  backLabel?: string;
  selectedCount: number;
  canContinue: boolean;
  isAtMax: boolean;
  onBack: () => void;
  onContinue: () => void;
}

export function InterestsProgressBar({
  backLabel = "Back",
  selectedCount,
  canContinue,
  isAtMax,
  onBack,
  onContinue,
}: ProgressBarProps) {
  const pct = getInterestsProgressPercent(selectedCount);
  const progressText = getInterestsProgressText({
    selectedCount,
    canContinue,
    isAtMax,
  });

  return (
    <div
      className="w-full py-3.5"
      role="progressbar"
      aria-valuenow={selectedCount}
      aria-valuemin={0}
      aria-valuemax={MAX_INTERESTS}
      aria-label="Interests selection progress"
    >
      <div className="mb-3 h-1 w-full overflow-hidden rounded-full bg-slate-muted/10">
        <motion.div
          className="size-full origin-left bg-forge-teal"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: pct / 100 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <div className="flex flex-col gap-3 min-[430px]:flex-row min-[430px]:items-center min-[430px]:justify-between min-[430px]:gap-4">
        <div className="min-w-0">
          <span className="font-bold font-sans text-ink text-sm">
            {selectedCount}
            <span className="font-normal text-slate-muted/50">
              {" "}
              / {MAX_INTERESTS}
            </span>
          </span>
          <p className="mt-1 font-bold font-sans text-slate-muted/60 text-xs uppercase leading-none tracking-wider">
            {progressText}
          </p>
        </div>
        <div className="grid grid-cols-2 items-center gap-2 min-[430px]:flex min-[430px]:shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="min-w-0 shrink-0"
          >
            <ArrowLeft size={14} strokeWidth={2.5} />
            <span className="hidden sm:block">{backLabel}</span>
            <span className="block sm:hidden">Back</span>
          </Button>
          <Button
            size="sm"
            onClick={canContinue ? onContinue : undefined}
            disabled={!canContinue}
            className="min-w-0"
            aria-label={
              canContinue
                ? "Review your selected interests"
                : "Select more interests to continue"
            }
          >
            <span className="hidden sm:block">Review picks</span>
            <span className="block sm:hidden">Continue</span>
            <ArrowRight size={14} strokeWidth={1.5} />
          </Button>
        </div>
      </div>
    </div>
  );
}
