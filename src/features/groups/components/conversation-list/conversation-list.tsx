import { useState } from "react";
import { Search, Sparkles, Users } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import type { GroupPreview } from "../../types/groups.types";
import { ConversationListItem } from "./conversation-list-item";

type FilterTab = "all" | "active" | "upcoming" | "unread";

interface ConversationListProps {
  groups: GroupPreview[];
  selectedGroupId: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectGroup: (groupId: string) => void;
}

const filterTabs: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "upcoming", label: "Upcoming" },
  { id: "unread", label: "Unread" },
];

export function ConversationList({
  groups,
  selectedGroupId,
  searchQuery,
  onSearchChange,
  onSelectGroup,
}: ConversationListProps) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  // Filter logic (design only - shows all for now)
  const filteredGroups = groups;
  const unreadCount = groups.filter((g) => g.unreadCount > 0).length;

  return (
    <div className="flex flex-col h-full">
      {/* Search and filters */}
      <div className="flex-shrink-0 p-3 pb-2">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="text"
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-10 bg-muted/50 border-transparent focus-visible:bg-background"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 mt-3 -mx-1 overflow-x-auto scrollbar-hide">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                activeFilter === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {tab.label}
              {tab.id === "unread" && unreadCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-primary-foreground/20 text-[10px]">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation list */}
      <div
        className="flex-1 overflow-y-auto"
        role="listbox"
        aria-label="Group conversations"
      >
        {filteredGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Users size={28} className="text-muted-foreground/60" />
            </div>
            <p className="text-foreground font-semibold">
              {searchQuery ? "No groups found" : "No groups yet"}
            </p>
            <p className="text-muted-foreground text-sm mt-1 max-w-[200px]">
              {searchQuery
                ? "Try adjusting your search"
                : "Forge your first group to meet new people!"}
            </p>
            {!searchQuery && (
              <Button className="mt-4 gap-2" size="sm">
                <Sparkles size={16} />
                Forge a Group
              </Button>
            )}
          </div>
        ) : (
          filteredGroups.map((group) => (
            <ConversationListItem
              key={group.id}
              group={group}
              isSelected={group.id === selectedGroupId}
              onSelect={() => onSelectGroup(group.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
