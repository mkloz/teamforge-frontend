import { AnimatePresence, motion } from "framer-motion";
import { Reply, X } from "lucide-react";
import { memo } from "react";
import { Button } from "@/shared/components/ui/button";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";

interface ReplyPreviewProps {
  replyingTo: UnifiedMessage | null;
  onClear: () => void;
}

export const ReplyPreview = memo(
  ({ replyingTo, onClear }: ReplyPreviewProps) => (
    <AnimatePresence>
      {replyingTo && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden bg-muted/30 rounded-t-3xl"
        >
          <div className="flex items-start gap-3 px-4 py-2.5 border-b border-border/40">
            <div className="flex-1 min-w-0 flex gap-3 items-center">
              <div className="w-1 self-stretch bg-forge-teal rounded-full opacity-80" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Reply size={12} className="text-forge-teal" />
                  <span className="text-xs font-bold text-forge-teal truncate tracking-tight uppercase">
                    {replyingTo.sender?.name}
                  </span>
                </div>
                <p className="text-xs text-slate-muted truncate leading-relaxed">
                  {replyingTo.content}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 text-slate-muted hover:text-ink hover:bg-black/5 rounded-full transition-colors -mr-1"
              onClick={onClear}
            >
              <X size={15} />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  ),
);
