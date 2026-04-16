import { Button } from "@/shared/components/ui/button";
import { motion } from "framer-motion";
import { MAX_INTERESTS, MIN_INTERESTS } from "../../../data/interests-data";

interface ProgressBarProps {
  selectedCount: number;
  canContinue: boolean;
  isAtMax: boolean;
  onContinue: () => void;
}

export function InterestsProgressBar({
  selectedCount,
  canContinue,
  isAtMax,
  onContinue,
}: ProgressBarProps) {
  const pct = Math.min((selectedCount / MAX_INTERESTS) * 100, 100);

  let progressText = "Ready to review";
  if (!canContinue) {
    progressText = `${MIN_INTERESTS - selectedCount} more for a complete profile`;
  } else if (isAtMax) {
    progressText = "Selection finalized";
  } else {
    // Dynamic text
    const ratio = selectedCount / MAX_INTERESTS;
    if (ratio >= 0.8) {
      progressText = "Solid profile foundation";
    } else if (ratio >= 0.5) {
      progressText = "Adding more dimensions";
    } else {
      progressText = "Defining your interests";
    }
  }

  return (
    <div
      className="w-full py-3.5"
      role="progressbar"
      aria-valuenow={selectedCount}
      aria-valuemin={0}
      aria-valuemax={MAX_INTERESTS}
      aria-label="Interests selection progress"
    >
      <div className="h-1 w-full bg-slate-muted/10 rounded-full mb-3 overflow-hidden">
        <motion.div
          className="h-full w-full bg-forge-teal origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: pct / 100 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="font-sans text-sm font-bold text-ink">
            {selectedCount}
            <span className="font-normal text-slate-muted/50">
              {" "}
              / {MAX_INTERESTS}
            </span>
          </span>
          <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-slate-muted/60 leading-none mt-1">
            {progressText}
          </p>
        </div>
        <Button
          onClick={canContinue ? onContinue : undefined}
          disabled={!canContinue}
          aria-label={
            canContinue
              ? "Review your selected interests"
              : "Select more interests to continue"
          }
          className="shrink-0"
        >
          Review picks
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M3 7h8M7.5 3.5L11 7l-3.5 3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>
      </div>
    </div>
  );
}
