import { Button } from "@/shared/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ChevronDown } from "lucide-react";
import { memo } from "react";

interface ScrollActionButtonsProps {
  showScrollToBottom: boolean;
  onScrollToBottom: () => void;
  hasUnvoted: boolean;
  onScrollToUnvoted: () => void;
}

export const ScrollActionButtons = memo(
  ({
    showScrollToBottom,
    onScrollToBottom,
    hasUnvoted,
    onScrollToUnvoted,
  }: ScrollActionButtonsProps) => (
    <AnimatePresence mode="popLayout">
      <div className="absolute bottom-6 right-6 flex flex-col gap-3 items-end z-30 pointer-events-none">
        {showScrollToBottom && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="pointer-events-auto"
          >
            <Button
              onClick={() => onScrollToBottom()}
              size="icon"
              className="h-10 w-10 rounded-full bg-canvas/90 backdrop-blur-md border border-border text-forge-teal hover:bg-white hover:scale-105 transition group relative shrink-0"
            >
              <ChevronDown
                size={22}
                className="group-hover:translate-y-0.5 transition-transform"
              />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-spark-amber rounded-full border-2 border-canvas text-nano text-ink font-black flex items-center justify-center">
                3
              </div>
            </Button>
          </motion.div>
        )}

        {hasUnvoted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="pointer-events-auto"
          >
            <button
              onClick={onScrollToUnvoted}
              className="group flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-spark-amber text-white border border-spark-amber/20 hover:scale-105 active:scale-95 transition-transform outline-none"
            >
              <AlertCircle size={14} className="animate-pulse" />
              <span className="text-micro font-black tracking-wider">Vote</span>
            </button>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  ),
);
