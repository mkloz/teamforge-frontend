import { AnimatePresence, m } from "framer-motion";
import type { ReactNode } from "react";

import type { ForgeFooterChildProps } from "./types";

interface HintStripMessage {
  key: string;
  text: ReactNode;
}

const STEP_ONE_EMPTY_HINT: HintStripMessage = {
  key: "h1-empty",
  text: "Select a category to continue",
};
const STEP_ONE_SELECTED_HINT: HintStripMessage = {
  key: "h1-selected",
  text: "Next: add the plan details",
};
const STEP_FIVE_SUCCESS_HINT: HintStripMessage = {
  key: "h5-success",
  text: "Group formed. Add its name and photo next.",
};
const STATIC_STEP_HINTS: Partial<
  Record<ForgeFooterChildProps["fw"]["step"], HintStripMessage>
> = {
  2: { key: "h2", text: "Choose a starting point for this plan" },
  3: { key: "h3", text: "Next: tune who should find this group" },
  7: { key: "h7", text: "Final step. Invite people to the group." },
};

function HintText({ children }: { children: ReactNode }) {
  return (
    <m.p
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="px-4 text-center font-medium text-muted-foreground/70 text-xs"
    >
      {children}
    </m.p>
  );
}

function getStepOneHint(
  selectedActivity: ForgeFooterChildProps["fw"]["selectedActivity"],
) {
  return selectedActivity ? STEP_ONE_SELECTED_HINT : STEP_ONE_EMPTY_HINT;
}

function getHintStripMessage(
  fw: ForgeFooterChildProps["fw"],
): HintStripMessage | null {
  if (fw.step === 1) {
    return getStepOneHint(fw.selectedActivity);
  }

  return fw.step === 5 && fw.forgeResult === "SUCCESS"
    ? STEP_FIVE_SUCCESS_HINT
    : (STATIC_STEP_HINTS[fw.step] ?? null);
}

export function HintStrip({ fw }: ForgeFooterChildProps) {
  const hint = getHintStripMessage(fw);

  return (
    <div className="sticky bottom-app-bottom-nav border-border/40 border-t bg-transparent px-4 py-2 backdrop-blur-sm md:bottom-14 md:px-12">
      <div className="mx-auto flex min-h-5.5 max-w-2xl items-center justify-center">
        <AnimatePresence mode="wait">
          {hint ? <HintText key={hint.key}>{hint.text}</HintText> : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
