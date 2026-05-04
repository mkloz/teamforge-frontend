import { AnimatePresence, motion } from "framer-motion";

import type { ForgeFooterChildProps } from "./types";

export function FooterValidationHints({ fw }: ForgeFooterChildProps) {
  return (
    <AnimatePresence>
      {fw.step === 3 &&
        !fw.canAdvanceStep2 &&
        fw.forgeValidationMessage &&
        (fw.planName.trim().length > 0 ||
          fw.planDate.length > 0 ||
          fw.planTime.length > 0 ||
          fw.locationType !== "TBD") && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <p className="text-xs text-muted-foreground/80 font-medium pl-3 border-l-2 border-primary/40">
              {fw.forgeValidationMessage}
            </p>
          </motion.div>
        )}
    </AnimatePresence>
  );
}
