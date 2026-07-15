import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";
import { ChevronRight, X } from "lucide-react";
import type { MouseEvent } from "react";

import type {
  Plan,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";

import { buildPinnedEntries } from "./chat-status-entries";
import { PagerDots } from "./pager-dots";
import { useChatStatusBarNavigation } from "./use-chat-status-bar-navigation";

type ChatStatusEntry = ReturnType<typeof buildPinnedEntries>[number];

interface ChatStatusBarProps {
  plan?: Plan;
  pinnedMessages?: UnifiedMessage[];
  onViewDetails?: () => void;
  onUnpinPinnedMessage?: (messageId: string) => void;
  onActivatePinnedMessage?: (messageId: string) => void;
}

const EMPTY_PINNED_MESSAGES: UnifiedMessage[] = [];

/**
 * Shows the plan status and pinned messages one at a time.
 * The plan status remains first and cannot be dismissed.
 */
export function ChatStatusBar({
  plan,
  pinnedMessages = EMPTY_PINNED_MESSAGES,
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
        "relative flex min-h-0 items-center gap-2 py-1.5 pr-2 pl-4",
        "z-90 w-full shrink-0",
        "border-border/50 border-b",
        "bg-canvas",
      )}
    >
      <PagerDots
        total={total}
        activeIndex={safeActiveIndex}
        accentClass={activeEntry.accentClass}
      />

      <Button
        type="button"
        variant="ghost"
        aria-label={getStatusBarActionLabel(activeEntry, total)}
        onClick={handleBarClick}
        className={cn(
          "group h-auto min-w-0 flex-1 justify-start gap-2 p-0 text-left",
          "select-none rounded-lg",
          "transition-colors duration-150",
          // oxlint-disable-next-line tailwindcss/consistent-variant-order -- Preserve this pre-existing class string in a behavior-only refactor.
          "hover:enabled:bg-transparent dark:hover:enabled:bg-transparent",
          "active:enabled:translate-y-0 active:enabled:scale-100 active:enabled:bg-transparent",
          "focus-visible:ring-primary/40 focus-visible:ring-inset",
        )}
      >
        <Icon
          strokeWidth={2}
          className={cn("size-3.5 shrink-0 opacity-90", activeEntry.colorClass)}
          aria-hidden
        />

        <span className="min-w-0 flex-1 overflow-hidden">
          <LazyMotion features={domAnimation}>
            <AnimatePresence
              mode="popLayout"
              initial={false}
              custom={direction}
            >
              <m.span
                key={activeEntry.id}
                custom={direction}
                variants={statusEntryMotionVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
                className="flex min-w-0 items-baseline gap-1.5"
              >
                <span
                  className={cn(
                    "shrink-0 font-semibold text-xs uppercase leading-none tracking-wider",
                    activeEntry.colorClass,
                  )}
                >
                  {activeEntry.label}
                </span>

                <span className="shrink-0 text-slate-muted/50 text-xs leading-none">
                  ·
                </span>

                <span className="truncate font-medium text-ink/75 text-xs leading-none dark:text-ink/65">
                  {activeEntry.body}
                </span>
              </m.span>
            </AnimatePresence>
          </LazyMotion>
        </span>
      </Button>

      <div className="flex shrink-0 items-center">
        <StatusBarTrailingAction
          activeEntry={activeEntry}
          onUnpin={handleUnpin}
        />
      </div>
    </div>
  );
}

function StatusBarTrailingAction({
  activeEntry,
  onUnpin,
}: {
  activeEntry: ChatStatusEntry;
  onUnpin: (event: MouseEvent) => void;
}) {
  if (activeEntry.isPlan) {
    return (
      // Wrap in same w-6 h-6 as the unpin button so both branches
      // produce identical height, preventing the plan entry being shorter.
      <div className="flex size-6 items-center justify-center">
        <ChevronRight
          strokeWidth={1.5}
          className="size-3.5 text-slate-muted/40 transition-colors duration-150 group-hover:text-slate-muted"
          aria-hidden
        />
      </div>
    );
  }

  if (!activeEntry.messageId) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="Unpin message"
          onClick={onUnpin}
          className={cn(
            "size-7 rounded-full",
            "text-slate-muted/60",
            "hover:bg-muted/80 hover:text-ink",
            "transition-colors duration-150",
            "focus-visible:ring-primary/40",
          )}
        >
          <X className="size-3.5" strokeWidth={2} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Unpin message</TooltipContent>
    </Tooltip>
  );
}

function getStatusBarActionLabel(activeEntry: ChatStatusEntry, total: number) {
  return `${activeEntry.label}: ${activeEntry.body}. ${
    total > 1 ? "Show next pinned item." : "Open pinned item."
  }`;
}

const statusEntryMotionVariants = {
  enter: (d: number) => ({ opacity: 0, y: d * 6 }),
  center: { opacity: 1, y: 0 },
  exit: (d: number) => ({ opacity: 0, y: d * -6 }),
};
