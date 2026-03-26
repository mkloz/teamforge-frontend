import { cn } from "@/shared/lib/utils";
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
    progressText = `${MIN_INTERESTS - selectedCount} more to unlock`;
  } else if (isAtMax) {
    progressText = "Maximum reached";
  } else {
    // Dynamic text
    const ratio = selectedCount / MAX_INTERESTS;
    if (ratio >= 0.8) {
      progressText = "Well rounded profile";
    } else if (ratio >= 0.5) {
      progressText = "Nice variety";
    } else {
      progressText = "Great start";
    }
  }

  return (
    <div className="bg-white border-t border-slate-200/80 px-4 lg:px-0 py-3 lg:max-w-lg lg:mx-auto w-full">
      <div className="h-0.5 w-full bg-slate-100 rounded-full mb-3 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-forge-teal"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
      </div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="font-sans text-sm font-semibold text-[#1C1C1A]">
            {selectedCount}
            <span className="font-normal text-slate-400">
              {" "}
              / {MAX_INTERESTS}
            </span>
          </span>
          <p className="font-sans text-[11px] text-slate-400 leading-none mt-0.5">
            {progressText}
          </p>
        </div>
        <motion.button
          type="button"
          onClick={canContinue ? onContinue : undefined}
          whileTap={canContinue ? { scale: 0.97 } : {}}
          className={cn(
            "flex items-center gap-2 font-sans text-sm font-semibold rounded-xl h-10 px-5 transition-all duration-200 shrink-0",
            canContinue
              ? "bg-forge-teal text-white shadow-[0_4px_16px_rgba(13,148,136,0.25)] hover:shadow-[0_6px_20px_rgba(13,148,136,0.35)]"
              : "bg-slate-100 text-slate-400 cursor-not-allowed",
          )}
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
        </motion.button>
      </div>
    </div>
  );
}
