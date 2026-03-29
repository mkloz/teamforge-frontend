"use client";

import { cn } from "@/shared/lib/utils";
import { BellOff, Check, CheckCheck, Clock, FileEdit } from "lucide-react";
import type { UnifiedConversation } from "../types/unified-conversation.types";
import type {
  MessageStatus,
  OnlineStatus,
} from "@/features/activity/types/direct-chats.types";
import { memo } from "react";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffHours < 1) {
    const mins = Math.floor(diffMs / (1000 * 60));
    return mins < 1 ? "now" : `${mins}m`;
  }
  if (diffHours < 24) return `${Math.floor(diffHours)}h`;
  if (diffDays < 7)
    return date.toLocaleDateString("en-US", { weekday: "short" });
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatCountdown(isoString: string): string | null {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  if (diffMs < 0 || diffMs > 7 * 24 * 60 * 60 * 1000) return null;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 24) return `${diffHours}h`;
  return `${Math.ceil(diffHours / 24)}d`;
}

function StatusIndicator({ status }: { status: OnlineStatus }) {
  const colors = {
    ONLINE: "bg-forge-teal",
    AWAY: "bg-spark-amber",
    OFFLINE: "bg-slate-muted/40",
  };

  return (
    <span
      className={cn(
        "absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-background shadow-sm",
        colors[status],
      )}
    />
  );
}

function MsgStatusIcon({ status }: { status: MessageStatus }) {
  switch (status) {
    case "SENDING":
      return (
        <span className="w-3 h-3 rounded-full border border-slate-muted/40 border-t-transparent animate-spin" />
      );
    case "SENT":
      return <Check size={12} className="text-slate-muted" />;
    case "DELIVERED":
      return <CheckCheck size={12} className="text-slate-muted" />;
    case "READ":
      return <CheckCheck size={12} className="text-forge-teal" />;
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

interface UnifiedConversationListItemProps {
  item: UnifiedConversation;
  isSelected: boolean;
  onSelect: () => void;
}

/**
 * UnifiedConversationListItem - Renders a single conversation in the sidebar list.
 * Memoized to prevent redundant re-renders during search or scroll.
 */
export const UnifiedConversationListItem = memo(
  function UnifiedConversationListItem({
    item,
    isSelected,
    onSelect,
  }: UnifiedConversationListItemProps) {
    const hasUnread = item.unreadCount > 0;
    const isGroup = item.kind === "group";
    const countdown =
      isGroup && item.planDateTime ? formatCountdown(item.planDateTime) : null;
    const isDraft = isGroup && item.planStatus === "DRAFT";

    return (
      <button
        type="button"
        onClick={onSelect}
        role="option"
        aria-selected={isSelected}
        aria-label={`${item.title}${hasUnread ? `, ${item.unreadCount} unread` : ""}`}
        className={cn(
          "relative group flex items-center gap-3.5 px-4 py-3.5 select-none transition-all duration-200 outline-none",
          "before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-0.75 before:bg-forge-teal before:transition-all before:duration-300",
          isSelected
            ? "bg-muted/60 before:opacity-100"
            : "hover:bg-muted/30 before:opacity-0 hover:before:opacity-40",
        )}
      >
        {/* ── Avatar ── */}
        <div className="relative shrink-0">
          <div
            className={cn(
              "relative",
              isGroup ? "rounded-2xl" : "rounded-full",
              "overflow-hidden ring-1 ring-border/50 group-hover/item:ring-forge-teal/30 transition-all duration-200 shadow-sm",
            )}
          >
            <img
              src={item.avatarUrl}
              alt={item.title}
              className="w-13 h-13 object-cover bg-muted"
            />
          </div>

          {/* Group: plan cover thumbnail */}
          {isGroup && item.planCoverImage && (
            <div className="absolute -bottom-1 -right-1 ring-2 ring-background rounded-lg overflow-hidden shadow-sm">
              <img
                src={item.planCoverImage}
                alt=""
                className="w-5.5 h-5.5 object-cover"
              />
            </div>
          )}

          {/* DM: online status dot */}
          {!isGroup && item.onlineStatus && (
            <StatusIndicator status={item.onlineStatus} />
          )}
        </div>

        {/* ── Content ── */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          {/* Title row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <h3
                className={cn(
                  "text-sm font-bold truncate transition-colors",
                  isSelected
                    ? "text-ink"
                    : "text-ink/90 group-hover/item:text-ink",
                )}
              >
                {item.title}
              </h3>
              {!isGroup && item.isMuted && (
                <BellOff size={11} className="text-slate-muted/60 shrink-0" />
              )}
            </div>
            <time className="text-[10px] font-medium text-slate-muted/80 shrink-0 tabular-nums">
              {formatTimestamp(item.timestamp)}
            </time>
          </div>

          {/* Subtitle row */}
          <div className="flex items-center justify-between gap-2 mt-1">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              {/* Own-message status icon for DMs */}
              {!isGroup && item.lastMessageIsOwn && item.lastMessageStatus && (
                <MsgStatusIcon status={item.lastMessageStatus} />
              )}
              <p
                className={cn(
                  "text-[12.5px] truncate leading-tight",
                  item.isTyping
                    ? "text-forge-teal font-semibold italic animate-pulse"
                    : hasUnread
                      ? "text-ink font-bold"
                      : "text-slate-muted/80 group-hover/item:text-slate-muted",
                  item.lastMessageIsSystem && "italic text-slate-muted/60",
                )}
              >
                {item.subtitle}
              </p>
            </div>

            {hasUnread && (
              <span className="shrink-0 inline-flex items-center justify-center min-w-4.5 h-4.5 px-1.5 rounded-full bg-forge-teal text-[10px] font-black text-white shadow-sm shadow-forge-teal/20">
                {item.unreadCount > 99 ? "99+" : item.unreadCount}
              </span>
            )}
          </div>

          {/* Footer row (groups only) — countdown & status badges */}
          {isGroup &&
            (countdown || isDraft || (item.pendingProposals ?? 0) > 0) && (
              <div className="flex items-center gap-2.5 mt-2">
                {countdown && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-forge-teal/80">
                    <Clock size={11} strokeWidth={2.5} />
                    {countdown}
                  </span>
                )}
                {isDraft && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-spark-amber">
                    <FileEdit size={11} strokeWidth={2.5} />
                    Pending
                  </span>
                )}
                {(item.pendingProposals ?? 0) > 0 && (
                  <span className="text-[10px] font-black text-spark-amber uppercase tracking-wider">
                    {item.pendingProposals} proposal
                    {item.pendingProposals !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            )}
        </div>
      </button>
    );
  },
);
