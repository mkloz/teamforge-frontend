import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

import { Notice } from "@/shared/components/ui/notice";
import type { ForgeFooterChildProps } from "./types";

export function FooterValidationHints({ fw }: ForgeFooterChildProps) {
  const planValidationMessage = fw.forgeValidationMessage;
  const shouldShowPlanValidation = Boolean(
    fw.step === 3 &&
      !fw.canAdvanceStep2 &&
      planValidationMessage &&
      (fw.planName.trim().length > 0 ||
        fw.planDate.length > 0 ||
        fw.planTime.length > 0 ||
        fw.locationType !== "TBD"),
  );

  return (
    <AnimatePresence>
      {shouldShowPlanValidation && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
        >
          <Notice
            role="status"
            tone="warning"
            size="xs"
            icon={<AlertCircle aria-hidden="true" className="size-3.5" />}
            iconClassName="mt-0.5"
            className="rounded-xl border-spark-amber/20 bg-spark-amber/8 px-3 py-2.5"
            contentClassName="font-semibold text-muted-foreground/90 leading-snug"
          >
            <p>{planValidationMessage}</p>
          </Notice>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
