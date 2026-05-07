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
          className="overflow-hidden rounded-t-xl bg-muted/30"
        >
          <div className="flex items-start gap-3 border-b border-border/40 px-4 py-2.5">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="w-1 self-stretch rounded-full bg-forge-teal opacity-80" />
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center gap-1.5">
                  <Reply className="size-3 text-forge-teal" />
                  <span className="truncate text-xs font-bold tracking-tight text-forge-teal uppercase">
                    {replyingTo.sender?.name}
                  </span>
                </div>
                <p className="truncate text-xs leading-relaxed text-slate-muted">
                  {replyingTo.content}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="-mr-1 size-7 shrink-0 rounded-full text-slate-muted transition-colors hover:bg-black/5 hover:text-ink"
              onClick={onClear}
            >
              <X className="size-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  ),
);
