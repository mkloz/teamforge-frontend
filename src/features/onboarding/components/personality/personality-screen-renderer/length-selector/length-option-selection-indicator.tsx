import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";

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
        isSelected ? "border-brand-teal" : "border-slate-muted/35",
      )}
    >
      <LazyMotion features={domAnimation}>
        <AnimatePresence mode="wait">
          {isSelected ? (
            <m.div
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.75 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="size-2.5 rounded-full bg-brand-teal"
            />
          ) : null}
        </AnimatePresence>
      </LazyMotion>
    </div>
  );
}
