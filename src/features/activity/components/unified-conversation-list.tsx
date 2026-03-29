import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import { MessageSquare, Search } from "lucide-react";
import { memo, useCallback, useRef, useState } from "react";
import type {
  FilterChip,
  UnifiedConversation,
} from "../types/unified-conversation.types";
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
  { key: "all", label: "All" },
  { key: "groups", label: "Groups" },
  { key: "dms", label: "DMs" },
  { key: "unread", label: "Unread" },
];

// Height of the search bar block
const SEARCH_H = 56;

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [searchOpacity, setSearchOpacity] = useState(1);

  const handleScroll = useCallback(() => {
    const scrollTop = scrollRef.current?.scrollTop ?? 0;
    const fadeRange = SEARCH_H * 0.6;
    const opacity = Math.max(0, 1 - scrollTop / fadeRange);
    setSearchOpacity(opacity);
  }, []);

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
    <div className="flex flex-col h-full overflow-hidden">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        role="listbox"
        aria-label="Conversations"
        className="flex-1 overflow-y-auto"
      >
        {/* Search bar */}
        <div
          className="px-4 pt-3 pb-2 transition-opacity duration-75"
          style={{
            opacity: searchOpacity,
            pointerEvents: searchOpacity < 0.05 ? "none" : undefined,
          }}
        >
          <div className="relative group">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-forge-teal transition-colors pointer-events-none z-10"
            />
            <Input
              type="search"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 bg-muted/40 border-transparent focus:bg-background focus:border-border transition-all rounded-xl h-9"
            />
          </div>
        </div>

        {/* Filter chips */}
        <nav
          className={cn(
            "sticky top-0 z-20 px-4 py-2.5 border-b border-border/60",
            "bg-canvas/80 backdrop-blur-md",
          )}
        >
          <div
            role="radiogroup"
            aria-label="Filter conversations"
            className="flex gap-1.5 overflow-x-auto scrollbar-hide px-0.5"
          >
            {FILTERS.filter((f) => f.key !== "unread" || unreadCount > 0).map(
              ({ key, label }) => (
                <FilterChipItem
                  key={key}
                  type={key}
                  label={label}
                  isActive={activeFilter === key}
                  onClick={() => onFilterChange(key)}
                  badge={getBadgeCount(key, groupCount, dmCount, unreadCount)}
                />
              ),
            )}
          </div>
        </nav>

        {/* Conversation list */}
        <div className="flex flex-col">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20 px-6 text-center animate-in fade-in slide-in-from-bottom-2">
              <div className="w-14 h-14 rounded-2xl bg-muted/30 flex items-center justify-center opacity-40">
                <MessageSquare size={24} className="text-forge-teal" />
              </div>
              <p className="text-sm font-medium text-slate-muted">
                {emptyLabel}
              </p>
            </div>
          ) : (
            items.map((item) => (
              <UnifiedConversationListItem
                key={`${item.kind}-${item.id}`}
                item={item}
                isSelected={item.id === selectedId}
                onSelect={() => onSelectItem(item.id, item.kind)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function getBadgeCount(
  key: FilterChip,
  groupCount: number,
  dmCount: number,
  unreadCount: number,
): number | null {
  if (key === "groups") return groupCount;
  if (key === "dms") return dmCount;
  if (key === "unread") return unreadCount;
  return null;
}

interface FilterChipItemProps {
  type: FilterChip;
  label: string;
  isActive: boolean;
  onClick: () => void;
  badge: number | null;
}

const FilterChipItem = memo(function FilterChipItem({
  label,
  isActive,
  onClick,
  badge,
}: FilterChipItemProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isActive}
      onClick={onClick}
      className={cn(
        "shrink-0 inline-flex items-center gap-1.5 h-7.5 px-3 rounded-lg",
        "text-xs font-semibold whitespace-nowrap transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal",
        isActive
          ? "bg-forge-teal text-white shadow-md shadow-forge-teal/20"
          : "bg-muted/50 text-slate-muted hover:bg-muted hover:text-ink hover:shadow-sm",
      )}
    >
      {label}
      {badge != null && badge > 0 && (
        <span
          className={cn(
            "inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full text-[9px] font-bold leading-none transition-colors",
            isActive
              ? "bg-white/20 text-white"
              : "bg-forge-teal/10 text-forge-teal",
          )}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  );
});
