import { motion } from "framer-motion";
import { cn } from "@/shared/lib/utils";

interface TopProgressBarProps {
  progress: number; // 0 to 1
  className?: string;
  isGradient?: boolean;
}

/**
 * A highly reusable, premium top-aligned progress bar for onboarding and auth flows.
 * Scales perfectly across mobile and desktop layouts.
 */
export function TopProgressBar({
  progress,
  className,
  isGradient = false, // Default to false now
}: TopProgressBarProps) {
  return (
    <div
      className={cn(
        "sticky top-0 left-0 right-0 h-1.5 z-100 pointer-events-none bg-black/5 dark:bg-white/5 overflow-hidden",
        className,
      )}
      aria-hidden="true"
    >
      <motion.div
        className={cn(
          "h-full transition-all duration-300 ease-out",
          isGradient
            ? "bg-linear-to-r from-forge-teal via-forge-teal to-spark-amber"
            : "bg-forge-teal",
        )}
        initial={{ width: "0%" }}
        animate={{ width: `${progress * 100}%` }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      />
    </div>
  );
}
