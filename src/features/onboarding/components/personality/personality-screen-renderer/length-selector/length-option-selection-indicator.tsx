import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/shared/lib/utils";

interface LengthOptionSelectionIndicatorProps {
  isSelected: boolean;
}

export function LengthOptionSelectionIndicator({
  isSelected,
}: LengthOptionSelectionIndicatorProps) {
  return (
    <div
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300",
        isSelected ? "border-forge-teal" : "border-slate-muted/35",
      )}
    >
      <AnimatePresence mode="wait">
        {isSelected ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="size-2.5 rounded-full bg-forge-teal"
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
