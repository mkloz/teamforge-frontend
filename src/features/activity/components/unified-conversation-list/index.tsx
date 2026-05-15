import { memo } from "react";
import { useSearchHeaderFade } from "@/features/activity/hooks/use-search-header-fade";
import type {
  FilterChip,
  UnifiedConversation,
} from "@/features/activity/lib/activity-contract";
import { EmptyState } from "./empty-state";
import { FilterHeader } from "./filter-header";
import { SearchHeader } from "./search-header";
import { UnifiedConversationListItem } from "./unified-conversation-list-item";

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

  const emptyLabel =
    activeFilter === "groups"
      ? "No groups found"
      : activeFilter === "direct"
        ? "No direct messages found"
        : activeFilter === "unread"
          ? "No unread conversations"
          : searchQuery
            ? "No conversations match your search"
            : "No conversations yet";
  const emptyArtwork =
    searchQuery || activeFilter !== "all" ? "filtered" : "default";

  return (
    <div className="flex h-full flex-col overflow-hidden">
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
              artwork={emptyArtwork}
              showForgeCta={!searchQuery && activeFilter === "all"}
              showExploreCta={!searchQuery && activeFilter !== "direct"}
            />
          ) : (
            items.map((item) => (
              <UnifiedConversationListItem
                key={`${item.kind}-${item.id}`}
                item={item}
                isSelected={item.id === selectedId}
                density={sidebarDensity}
                onSelect={() => onSelectItem(item.id, item.kind)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
});
