"use client";

import { cn } from "@/shared/lib/utils";
import { MessageSquare, Search } from "lucide-react";
import type { FilterChip, UnifiedConversation } from "../types/unified-conversation.types";
import { UnifiedConversationListItem } from "./unified-conversation-list-item";

interface UnifiedConversationListProps {
  items: UnifiedConversation[];
  selectedId: string | null;
  searchQuery: string;
  activeFilter: FilterChip;
  groupCount: number;
  dmCount: number;
  unreadCount: number;
  onSearchChange: (q: string) => void;
  onFilterChange: (f: FilterChip) => void;
  onSelectItem: (id: string, kind: "group" | "dm") => void;
}

const FILTERS: { key: FilterChip; label: string }[] = [
  { key: "all",    label: "All" },
  { key: "groups", label: "Groups" },
  { key: "dms",    label: "DMs" },
  { key: "unread", label: "Unread" },
];

function filterBadge(key: FilterChip, groupCount: number, dmCount: number, unreadCount: number): number | null {
  if (key === "groups") return groupCount;
  if (key === "dms")    return dmCount;
  if (key === "unread") return unreadCount;
  return null;
}

export function UnifiedConversationList({
  items,
  selectedId,
  searchQuery,
  activeFilter,
  groupCount,
  dmCount,
  unreadCount,
  onSearchChange,
  onFilterChange,
  onSelectItem,
}: UnifiedConversationListProps) {
  const emptyLabel =
    activeFilter === "groups"
      ? "No groups found"
      : activeFilter === "dms"
        ? "No direct messages found"
        : activeFilter === "unread"
          ? "No unread conversations"
          : searchQuery
            ? "No conversations match your search"
            : "No conversations yet";

  return (
    <div className="flex flex-col h-full">
      {/* ── Sticky header ── */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3 space-y-3 border-b border-border">
        {/* Search */}
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            type="search"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={cn(
              "w-full h-9 pl-9 pr-3 rounded-xl text-sm bg-muted/50",
              "border border-transparent focus:border-border focus:bg-background",
              "focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all",
              "placeholder:text-muted-foreground/50",
            )}
          />
        </div>

        {/* Filter chips */}
        <div
          role="radiogroup"
          aria-label="Filter conversations"
          className="flex gap-1.5 overflow-x-auto scrollbar-hide"
        >
          {FILTERS.map(({ key, label }) => {
            const badge = filterBadge(key, groupCount, dmCount, unreadCount);
            const isActive = activeFilter === key;
            return (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => onFilterChange(key)}
                className={cn(
                  "flex-shrink-0 inline-flex items-center gap-1 h-7 px-2.5 rounded-lg text-xs font-semibold transition-all duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {label}
                {badge != null && badge > 0 && (
                  <span
                    className={cn(
                      "inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold leading-none",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-primary/15 text-primary",
                    )}
                  >
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Scrollable list ── */}
      <div
        role="listbox"
        aria-label="Conversations"
        className="flex-1 overflow-y-auto"
      >
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-16 px-6 text-center">
            <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center">
              <MessageSquare size={20} className="text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground">{emptyLabel}</p>
          </div>
        ) : (
          items.map((item) => (
            <UnifiedConversationListItem
              key={item.id}
              item={item}
              isSelected={item.id === selectedId}
              onSelect={() => onSelectItem(item.id, item.kind)}
            />
          ))
        )}
      </div>
    </div>
  );
}
