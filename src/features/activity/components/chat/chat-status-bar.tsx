import {
  FileEdit,
  CheckCircle2,
  Check,
  ChevronRight,
  X,
  Pin,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type {
  Plan,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";
import { memo, useCallback, useMemo, useState } from "react";
import { formatChatFullDate } from "@/features/activity/lib/chat-utils";
import { AnimatePresence, motion } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ChatStatusBarProps {
  plan?: Plan;
  pinnedMessages?: UnifiedMessage[];
  onViewDetails?: () => void;
  onUnpinPinnedMessage?: (messageId: string) => void;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}

interface PinnedEntry {
  id: string;
  label: string;
  body: string;
  accentClass: string;
  colorClass: string;
  icon: React.ElementType;
  isPlan: boolean;
  messageId?: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const PLAN_CONFIG = {
  DRAFT: {
    icon: FileEdit,
    label: "Upcoming",
    accentClass: "bg-spark-amber",
    colorClass: "text-spark-amber",
  },
  CONFIRMED: {
    icon: CheckCircle2,
    label: "Confirmed",
    accentClass: "bg-forge-teal",
    colorClass: "text-forge-teal",
  },
  COMPLETED: {
    icon: Check,
    label: "Completed",
    accentClass: "bg-slate-muted/50",
    colorClass: "text-slate-muted",
  },
  PROPOSED: {
    icon: FileEdit,
    label: "Proposed",
    accentClass: "bg-spark-amber/70",
    colorClass: "text-spark-amber",
  },
  IN_PROGRESS: {
    icon: FileEdit,
    label: "In Progress",
    accentClass: "bg-forge-teal",
    colorClass: "text-forge-teal",
  },
  CANCELLED: {
    icon: X,
    label: "Cancelled",
    accentClass: "bg-red-500/50",
    colorClass: "text-red-500",
  },
} as const;

// ─── Pager dots (left-edge position indicator) ───────────────────────────────
//
// Small vertical dot stack replaces stacked lines.
// Active dot: accent colour, 5px; inactive: muted border, 3px.
// Centred in a fixed-width column so the rest of the bar never shifts.

function PagerDots({
  total,
  activeIndex,
  accentClass,
}: {
  total: number;
  activeIndex: number;
  accentClass: string;
}) {
  // Single entry — render one solid accent line (original Telegram style)
  if (total <= 1) {
    return (
      <div
        className={cn(
          "absolute left-0 inset-y-0 w-0.5 rounded-r-full",
          accentClass,
        )}
        aria-hidden
      />
    );
  }

  // Multiple entries — vertical dot pager
  return (
    <div
      className="absolute left-0 inset-y-0 w-3.5 flex flex-col items-center justify-center gap-1"
      aria-hidden
    >
      {Array.from({ length: total }, (_, i) => {
        const isActive = i === activeIndex;
        return (
          <div
            key={i}
            className={cn(
              "rounded-full transition-all duration-250",
              isActive ? cn("w-1.5 h-1.5", accentClass) : "w-1 h-1 bg-border",
            )}
          />
        );
      })}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

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
  scrollContainerRef,
}: ChatStatusBarProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  // Build ordered entry list (plan first)
  const entries = useMemo<PinnedEntry[]>(() => {
    const list: PinnedEntry[] = [];

    if (plan) {
      const cfg = PLAN_CONFIG[plan.status];
      list.push({
        id: `plan-${plan.id}`,
        label: cfg.label,
        body: `${plan.title} · ${plan.dateTime ? formatChatFullDate(plan.dateTime) : "Date TBD"} · ${plan.location || "Location TBD"}`,
        accentClass: cfg.accentClass,
        colorClass: cfg.colorClass,
        icon: cfg.icon,
        isPlan: true,
      });
    }

    for (const msg of pinnedMessages) {
      list.push({
        id: `pinned-${msg.id}`,
        label: "Pinned",
        body: msg.content,
        accentClass: "bg-forge-teal",
        colorClass: "text-forge-teal",
        icon: Pin,
        isPlan: false,
        messageId: msg.id,
      });
    }

    return list;
  }, [plan, pinnedMessages]);

  const total = entries.length;
  const safeActiveIndex =
    total > 0 ? Math.min(activeIndex, total - 1) : activeIndex;

  // Scroll to a pinned message and give it a brief ring highlight
  const scrollToMessage = useCallback(
    (messageId: string) => {
      const el =
        scrollContainerRef?.current?.querySelector<HTMLElement>(
          `#msg-${CSS.escape(messageId)}`,
        ) ?? document.getElementById(`msg-${messageId}`);

      if (!el) return;

      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-forge-teal/40", "rounded-xl");
      setTimeout(
        () => el.classList.remove("ring-2", "ring-forge-teal/40", "rounded-xl"),
        1400,
      );
    },
    [scrollContainerRef],
  );

  // Click → cycle → act
  const handleBarClick = useCallback(() => {
    if (total === 0) return;
    const current = entries[safeActiveIndex];

    if (total === 1) {
      if (current.isPlan) onViewDetails?.();
      else if (current.messageId) scrollToMessage(current.messageId);
      return;
    }

    const next = (safeActiveIndex + 1) % total;
    setDirection(1);
    setActiveIndex(next);

    const nextEntry = entries[next];
    if (!nextEntry.isPlan && nextEntry.messageId)
      scrollToMessage(nextEntry.messageId);
    else if (nextEntry.isPlan) onViewDetails?.();
  }, [total, safeActiveIndex, entries, onViewDetails, scrollToMessage]);

  // Unpin current non-plan entry
  const handleUnpin = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const active = entries[safeActiveIndex];
      if (!active.messageId) return;
      const newTotal = total - 1;
      if (newTotal > 0 && safeActiveIndex >= newTotal) {
        setDirection(-1);
        setActiveIndex(newTotal - 1);
      }
      onUnpinPinnedMessage?.(active.messageId);
    },
    [entries, safeActiveIndex, total, onUnpinPinnedMessage],
  );

  if (total === 0) return null;

  const active = entries[safeActiveIndex];
  const Icon = active.icon;

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
        accentClass={active.accentClass}
      />

      <button
        type="button"
        aria-label={`${active.label}: ${active.body}. ${
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
          className={cn("shrink-0 opacity-90", active.colorClass)}
          aria-hidden
        />

        <span className="min-w-0 flex-1 overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            <motion.span
              key={active.id}
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
                  active.colorClass,
                )}
              >
                {active.label}
              </span>

              <span className="shrink-0 text-slate-muted/50 text-[10px] leading-none">
                ·
              </span>

              <span className="truncate text-xs font-medium leading-none text-ink/75 dark:text-ink/65">
                {active.body}
              </span>
            </motion.span>
          </AnimatePresence>
        </span>
      </button>

      <div className="shrink-0 flex items-center">
        {active.isPlan ? (
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
          active.messageId && (
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
