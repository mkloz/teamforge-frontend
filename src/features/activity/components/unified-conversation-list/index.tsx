import { memo, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { useSearchHeaderFade } from "../../hooks/use-search-header-fade";
import type {
  FilterChip,
  UnifiedConversation,
} from "../../lib/activity-contract";
import { UnifiedConversationListItem } from "../unified-conversation-list-item";
import { EmptyState } from "./empty-state";
import { FilterHeader } from "./filter-header";
import { SearchHeader } from "./search-header";

interface UnifiedConversationListProps {
  items: UnifiedConversation[];
  selectedId: string | null;
  searchQuery: string;
  activeFilter: FilterChip;
  sidebarDensity: "default" | "compact";
  groupCount: number;
  dmCount: number;
  unreadCount: number;
  onSearchChange: (q: string) => void;
  onFilterChange: (f: FilterChip) => void;
  onDensityChange: (d: "default" | "compact") => void;
  onSelectItem: (id: string, kind: "group" | "dm") => void;
}

const FILTERS: { key: FilterChip; label: string }[] = [
  { key: "all", label: "All" },
  { key: "groups", label: "Groups" },
  { key: "direct", label: "DMs" },
  { key: "unread", label: "Unread" },
];

const SEARCH_H = 56;

export const UnifiedConversationList = memo(function UnifiedConversationList({
  items,
  selectedId,
  searchQuery,
  activeFilter,
  sidebarDensity,
  groupCount,
  dmCount,
  unreadCount,
  onSearchChange,
  onFilterChange,
  onDensityChange,
  onSelectItem,
}: UnifiedConversationListProps) {
  const { scrollRef, opacity, handleScroll, isPointerEnabled } =
    useSearchHeaderFade({
      headerHeight: SEARCH_H,
    });

  const emptyLabel = useMemo(() => {
    if (activeFilter === "groups") return "No groups found";
    if (activeFilter === "direct") return "No direct messages found";
    if (activeFilter === "unread") return "No unread conversations";
    if (searchQuery) return "No conversations match your search";
    return "No conversations yet";
  }, [activeFilter, searchQuery]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        role="listbox"
        aria-label="Conversations"
        className="flex-1 overflow-y-auto"
      >
        <SearchHeader
          opacity={opacity}
          isEnabled={isPointerEnabled}
          value={searchQuery}
          onChange={onSearchChange}
        />

        <FilterHeader
          filters={FILTERS}
          activeFilter={activeFilter}
          counts={{ groupCount, dmCount, unreadCount }}
          onFilterChange={onFilterChange}
          density={sidebarDensity}
          onDensityChange={onDensityChange}
        />

        <div className="flex flex-col pb-8 sm:pb-0">
          {items.length === 0 ? (
            <EmptyState
              label={emptyLabel}
              showForgeCta={!searchQuery && activeFilter === "all"}
            />
          ) : (
            <AnimatePresence mode="popLayout" initial={false}>
              {items.map((item) => (
                <UnifiedConversationListItem
                  key={`${item.kind}-${item.id}`}
                  item={item}
                  isSelected={item.id === selectedId}
                  density={sidebarDensity}
                  onSelect={() => onSelectItem(item.id, item.kind)}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
});
