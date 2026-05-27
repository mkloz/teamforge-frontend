import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ChevronDown } from "lucide-react";
import { memo } from "react";
import { Button } from "@/shared/components/ui/button";

interface ScrollActionButtonsProps {
  showScrollToBottom: boolean;
  onScrollToBottom: () => void;
  newMessageCount: number;
  hasProposalShortcut: boolean;
  onScrollToProposal: () => void;
}

export const ScrollActionButtons = memo(
  ({
    showScrollToBottom,
    onScrollToBottom,
    newMessageCount,
    hasProposalShortcut,
    onScrollToProposal,
  }: ScrollActionButtonsProps) => {
    const newMessageCountLabel =
      newMessageCount > 98 ? "99+" : String(newMessageCount);

    return (
      <>
        <AnimatePresence mode="popLayout">
          {hasProposalShortcut && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -8 }}
              className="pointer-events-none absolute top-4 right-4 z-30"
            >
              <Button
                onClick={onScrollToProposal}
                variant="secondary"
                size="xs"
                className="pointer-events-auto px-2.5 py-1.5 shadow-md"
                aria-label="Jump to proposal that needs your vote"
              >
                <AlertCircle className="size-3.5 animate-pulse motion-reduce:animate-none" />
                <span className="font-black text-xs tracking-wider">Vote</span>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="popLayout">
          {showScrollToBottom && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="pointer-events-none absolute right-6 bottom-6 z-30"
            >
              <Button
                onClick={() => onScrollToBottom()}
                variant="outline"
                size="icon"
                className="pointer-events-auto relative size-10 shrink-0 rounded-full"
                aria-label={
                  newMessageCount > 0
                    ? `Scroll to latest messages, ${newMessageCountLabel} new`
                    : "Scroll to latest messages"
                }
              >
                <ChevronDown className="size-5 transition-transform group-hover:translate-y-0.5" />
                {newMessageCount > 0 && (
                  <div className="type-signature-label absolute -top-1 -right-1 z-10 flex min-w-4 items-center justify-center rounded-full border border-spark-amber/40 bg-canvas px-1 font-black text-spark-amber leading-4 shadow-[inset_0_0_0_999px_color-mix(in_srgb,var(--color-spark-amber)_16%,transparent)] ring-2 ring-canvas">
                    {newMessageCountLabel}
                  </div>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  },
);
