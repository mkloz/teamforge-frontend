import { AnimatePresence, m } from "framer-motion";

import type { ForgeLoadingLabelProps } from "./types";

export function ForgeLoadingLabel({
  displayLabel,
  label,
  strikeCount,
}: ForgeLoadingLabelProps) {
  return (
    <div className="flex min-h-12 flex-col items-center justify-center gap-1 text-center">
      <AnimatePresence mode="wait" initial={false}>
        <m.p
          key={label ?? strikeCount}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
          className="font-black text-foreground text-sm"
        >
          {displayLabel}
        </m.p>
      </AnimatePresence>
      <p className="font-bold text-muted-foreground text-xs">Group forge</p>
      <div className="flex items-center gap-1.5 pt-1" aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <m.span
            key={index}
            className={
              index === 2
                ? "size-1.5 rounded-full bg-spark-amber"
                : "size-1.5 rounded-full bg-forge-teal"
            }
            animate={{
              opacity: [0.32, 1, 0.32],
              scale: [0.9, 1.08, 0.9],
            }}
            transition={{
              delay: index * 0.16,
              duration: 1,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          />
        ))}
      </div>
    </div>
  );
}
