import { ChevronRight, X } from "lucide-react";
import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";

import type {
  Plan,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";
import { cn } from "@/shared/lib/utils";

import { buildPinnedEntries } from "./chat-status-entries";
import { PagerDots } from "./pager-dots";
import { useChatStatusBarNavigation } from "./use-chat-status-bar-navigation";

export interface ChatStatusBarProps {
  plan?: Plan;
  pinnedMessages?: UnifiedMessage[];
  onViewDetails?: () => void;
  onUnpinPinnedMessage?: (messageId: string) => void;
  onActivatePinnedMessage?: (messageId: string) => void;
}

/**
 * ChatStatusBar — slim, single-line cycling pinned bar.
 *
 * Shows one entry at a time. Click to cycle. The plan status is always
 * entry 0 and cannot be dismissed. User-pinned messages follow it.
 */
export const ChatStatusBar = memo(function ChatStatusBar({
  plan,
  pinnedMessages = [],
  onViewDetails,
  onUnpinPinnedMessage,
  onActivatePinnedMessage,
}: ChatStatusBarProps) {
  const entries = buildPinnedEntries(plan, pinnedMessages);
  const {
    activeEntry,
    direction,
    handleBarClick,
    handleUnpin,
    safeActiveIndex,
    total,
  } = useChatStatusBarNavigation({
    entries,
    onActivatePinnedMessage,
    onUnpinPinnedMessage,
    onViewDetails,
  });

  if (total === 0 || !activeEntry) return null;

  const Icon = activeEntry.icon;

  return (
    <div
      className={cn(
        "relative flex items-center gap-2 pl-4 pr-2 py-1.5 min-h-0",
        "w-full shrink-0 z-90",
        "border-b border-border/50",
        "bg-canvas dark:bg-canvas",
      )}
    >
      <PagerDots
        total={total}
        activeIndex={safeActiveIndex}
        accentClass={activeEntry.accentClass}
      />

      <button
        type="button"
        aria-label={`${activeEntry.label}: ${activeEntry.body}. ${
          total > 1 ? "Show next pinned item." : "Open pinned item."
        }`}
        onClick={handleBarClick}
        className={cn(
          "group flex min-w-0 flex-1 items-center gap-2 text-left",
          "cursor-pointer select-none rounded-md",
          "transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-forge-teal/40",
        )}
      >
        <Icon
          size={13}
          strokeWidth={2}
          className={cn("shrink-0 opacity-90", activeEntry.colorClass)}
          aria-hidden
        />

        <span className="min-w-0 flex-1 overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            <motion.span
              key={activeEntry.id}
              custom={direction}
              variants={{
                enter: (d: number) => ({ opacity: 0, y: d * 6 }),
                center: { opacity: 1, y: 0 },
                exit: (d: number) => ({ opacity: 0, y: d * -6 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
              className="flex min-w-0 items-baseline gap-1.5"
            >
              <span
                className={cn(
                  "shrink-0 text-[10px] font-semibold uppercase tracking-widest leading-none",
                  activeEntry.colorClass,
                )}
              >
                {activeEntry.label}
              </span>

              <span className="shrink-0 text-slate-muted/50 text-[10px] leading-none">
                ·
              </span>

              <span className="truncate text-xs font-medium leading-none text-ink/75 dark:text-ink/65">
                {activeEntry.body}
              </span>
            </motion.span>
          </AnimatePresence>
        </span>
      </button>

      <div className="shrink-0 flex items-center">
        {activeEntry.isPlan ? (
          // Wrap in same w-6 h-6 as the unpin button so both branches
          // produce identical height, preventing the plan entry being shorter.
          <div className="flex items-center justify-center w-6 h-6">
            <ChevronRight
              size={14}
              strokeWidth={1.5}
              className="text-slate-muted/40 group-hover:text-slate-muted transition-colors duration-150"
              aria-hidden
            />
          </div>
        ) : (
          activeEntry.messageId && (
            <button
              type="button"
              aria-label="Unpin message"
              onClick={handleUnpin}
              className={cn(
                "flex items-center justify-center w-6 h-6 rounded-full",
                "text-slate-muted/60",
                "hover:text-ink hover:bg-muted/80",
                "transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/40",
              )}
            >
              <X size={12} strokeWidth={2} />
            </button>
          )
        )}
      </div>
    </div>
  );
});
