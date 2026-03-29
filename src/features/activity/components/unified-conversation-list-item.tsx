"use client";

import { cn } from "@/shared/lib/utils";
import {
  BellOff,
  Check,
  CheckCheck,
  Clock,
  FileEdit,
  Users,
} from "lucide-react";
import type { UnifiedConversation } from "../types/unified-conversation.types";
import type { MessageStatus, OnlineStatus } from "@/features/direct-chats/types/direct-chats.types";

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

function onlineStatusColor(status: OnlineStatus): string {
  switch (status) {
    case "ONLINE": return "bg-green-500";
    case "AWAY":   return "bg-amber-500";
    case "OFFLINE":return "bg-muted-foreground/40";
  }
}

function MsgStatusIcon({ status }: { status: MessageStatus }) {
  switch (status) {
    case "SENDING":
      return (
        <span className="w-3 h-3 rounded-full border border-muted-foreground/40 border-t-transparent animate-spin" />
      );
    case "SENT":
      return <Check size={12} className="text-muted-foreground" />;
    case "DELIVERED":
      return <CheckCheck size={12} className="text-muted-foreground" />;
    case "READ":
      return <CheckCheck size={12} className="text-teal-500" />;
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  item: UnifiedConversation;
  isSelected: boolean;
  onSelect: () => void;
}

export function UnifiedConversationListItem({ item, isSelected, onSelect }: Props) {
  const hasUnread = item.unreadCount > 0;
  const isGroup = item.kind === "group";
  const countdown = isGroup && item.planDateTime ? formatCountdown(item.planDateTime) : null;
  const isDraft = isGroup && item.planStatus === "DRAFT";

  return (
    <button
      type="button"
      onClick={onSelect}
      role="option"
      aria-selected={isSelected}
      aria-label={`${item.title}${hasUnread ? `, ${item.unreadCount} unread` : ""}`}
      className={cn(
        "w-full flex items-start gap-3 px-4 py-3 text-left",
        "border-l-2 transition-all duration-150",
        "hover:bg-muted/50 active:bg-muted/70",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
        isSelected
          ? "bg-primary/5 hover:bg-primary/8"
          : "border-l-transparent",
        isGroup && !isSelected && "hover:border-l-teal-500/40",
        isGroup && isSelected && "border-l-teal-500",
        !isGroup && isSelected && "border-l-primary",
      )}
    >
      {/* ── Avatar ── */}
      <div className="relative flex-shrink-0">
        <img
          src={item.avatarUrl}
          alt={item.title}
          className={cn(
            "w-12 h-12 object-cover bg-muted",
            isGroup ? "rounded-xl" : "rounded-full",
          )}
        />

        {/* Group: plan cover thumbnail */}
        {isGroup && item.planCoverImage && (
          <img
            src={item.planCoverImage}
            alt=""
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-md object-cover ring-2 ring-background"
          />
        )}

        {/* DM: online status dot */}
        {!isGroup && item.onlineStatus && (
          <span
            aria-label={item.onlineStatus.toLowerCase()}
            className={cn(
              "absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-background",
              onlineStatusColor(item.onlineStatus),
            )}
          />
        )}

        {/* Kind pill — tiny, non-intrusive */}
        <span
          className={cn(
            "absolute -top-1 -left-1 text-[9px] font-bold uppercase tracking-wide px-1 py-0.5 rounded-md leading-none",
            isGroup
              ? "bg-teal-500/15 text-teal-600 dark:text-teal-400"
              : "bg-primary/10 text-primary",
          )}
        >
          {isGroup ? "G" : "DM"}
        </span>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 min-w-0">
        {/* Title row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className="text-sm font-semibold text-foreground truncate">
              {item.title}
            </h3>
            {!isGroup && item.isMuted && (
              <BellOff size={11} className="text-muted-foreground flex-shrink-0" />
            )}
          </div>
          <span className="text-[10px] text-muted-foreground flex-shrink-0">
            {formatTimestamp(item.timestamp)}
          </span>
        </div>

        {/* Subtitle row */}
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <div className="flex items-center gap-1 min-w-0 flex-1">
            {/* Own-message status icon for DMs */}
            {!isGroup && item.lastMessageIsOwn && item.lastMessageStatus && (
              <MsgStatusIcon status={item.lastMessageStatus} />
            )}
            <p
              className={cn(
                "text-xs truncate",
                item.isTyping
                  ? "text-teal-500 font-medium italic"
                  : hasUnread
                    ? "text-foreground font-medium"
                    : "text-muted-foreground",
                item.lastMessageIsSystem && "italic",
              )}
            >
              {item.subtitle}
            </p>
          </div>

          {hasUnread && (
            <span className="flex-shrink-0 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {item.unreadCount > 99 ? "99+" : item.unreadCount}
            </span>
          )}
        </div>

        {/* Footer row (groups only) */}
        {isGroup && (
          <div className="flex items-center justify-between mt-1.5">
            {/* Member avatars */}
            <div className="flex items-center gap-1">
              <div className="flex -space-x-1.5">
                {(item.memberAvatars ?? []).slice(0, 4).map((av, i) => (
                  <img
                    key={i}
                    src={av}
                    alt=""
                    className="w-4 h-4 rounded-full border border-background object-cover"
                  />
                ))}
              </div>
              <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                <Users size={9} />
                {item.memberCount}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {countdown && (
                <span className="flex items-center gap-0.5 text-[10px] font-medium text-teal-600 dark:text-teal-400">
                  <Clock size={10} />
                  {countdown}
                </span>
              )}
              {isDraft && (
                <span className="flex items-center gap-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                  <FileEdit size={10} />
                  Pending
                </span>
              )}
              {(item.pendingProposals ?? 0) > 0 && (
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  {item.pendingProposals} proposal{item.pendingProposals !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </button>
  );
}
