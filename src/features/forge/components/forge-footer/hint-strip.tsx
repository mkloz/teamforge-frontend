import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

import type { ForgeFooterChildProps } from "./types";

function HintText({ children }: { children: ReactNode }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="px-4 text-center font-medium text-muted-foreground/70 text-xs"
    >
      {children}
    </motion.p>
  );
}

export function HintStrip({ fw }: ForgeFooterChildProps) {
  return (
    <div className="sticky bottom-app-bottom-nav border-border/40 border-t bg-transparent px-4 py-2 backdrop-blur-sm md:bottom-14 md:px-12">
      <div className="mx-auto flex min-h-5.5 max-w-2xl items-center justify-center">
        <AnimatePresence mode="wait">
          {fw.step === 1 && !fw.selectedActivity && (
            <HintText key="h1-empty">Select a category to continue</HintText>
          )}
          {fw.step === 1 && fw.selectedActivity && (
            <HintText key="h1-selected">Next: add the plan details</HintText>
          )}
          {fw.step === 2 && (
            <HintText key="h2">Choose a starting point for this plan</HintText>
          )}
          {fw.step === 3 && (
            <HintText key="h3">Next: tune who should find this group</HintText>
          )}
          {fw.step === 5 && fw.forgeResult === "SUCCESS" && (
            <HintText key="h5-success">
              Group formed — give it an identity next
            </HintText>
          )}
          {fw.step === 7 && (
            <HintText key="h7">Final step — send your invitations</HintText>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
