import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ChevronDown } from "lucide-react";
import { memo } from "react";
import { Button } from "@/shared/components/ui/button";

interface ScrollActionButtonsProps {
  showScrollToBottom: boolean;
  onScrollToBottom: () => void;
  hasProposalShortcut: boolean;
  onScrollToProposal: () => void;
}

export const ScrollActionButtons = memo(
  ({
    showScrollToBottom,
    onScrollToBottom,
    hasProposalShortcut,
    onScrollToProposal,
  }: ScrollActionButtonsProps) => (
    <AnimatePresence mode="popLayout">
      <div className="pointer-events-none absolute right-6 bottom-6 z-30 flex flex-col items-end gap-3">
        {showScrollToBottom && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="pointer-events-auto"
          >
            <Button
              onClick={() => onScrollToBottom()}
              variant="surface"
              size="icon"
              className="relative size-10 shrink-0 rounded-full"
            >
              <ChevronDown className="size-5 transition-transform group-hover:translate-y-0.5" />
              <div className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full border-2 border-canvas bg-spark-amber font-black text-ink text-xs">
                3
              </div>
            </Button>
          </motion.div>
        )}

        {hasProposalShortcut && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="pointer-events-auto"
          >
            <Button
              onClick={onScrollToProposal}
              variant="secondary"
              size="xs"
              className="rounded-full px-2.5 py-1.5"
            >
              <AlertCircle className="size-3.5 animate-pulse" />
              <span className="font-black text-xs tracking-wider">Vote</span>
            </Button>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  ),
);
