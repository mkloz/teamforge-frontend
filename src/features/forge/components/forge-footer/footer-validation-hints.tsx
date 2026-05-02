import { AnimatePresence, motion } from "framer-motion";

import type { ForgeFooterChildProps } from "./types";

export function FooterValidationHints({ fw }: ForgeFooterChildProps) {
  return (
    <AnimatePresence>
      {fw.step === 2 &&
        !fw.canAdvanceStep2 &&
        fw.planName.trim().length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <p className="text-xs text-muted-foreground/80 font-medium pl-3 border-l-2 border-primary/40">
              Event title needs at least 3 characters to continue
            </p>
          </motion.div>
        )}
      {fw.step === 2 &&
        fw.planCost === "PAID" &&
        !fw.canAdvanceStep2 &&
        fw.planName.trim().length >= 3 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <p className="text-xs text-muted-foreground/80 font-medium pl-3 border-l-2 border-primary/40">
              Add a positive cost estimate, or mark the plan as free
            </p>
          </motion.div>
        )}
    </AnimatePresence>
  );
}
