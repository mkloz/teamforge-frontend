import { Search } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Input } from "@/shared/components/ui/input";
import type { GroupPreview } from "../../types/groups.types";
import { ConversationListItem } from "./conversation-list-item";

interface ConversationListProps {
  groups: GroupPreview[];
  selectedGroupId: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectGroup: (groupId: string) => void;
}

export function ConversationList({
  groups,
  selectedGroupId,
  searchQuery,
  onSearchChange,
  onSelectGroup,
}: ConversationListProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header with search */}
      <div className="flex-shrink-0 p-4 border-b border-border">
        <h1 className="text-xl font-bold text-foreground mb-3">Groups</h1>
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
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto" role="listbox" aria-label="Group conversations">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <p className="text-muted-foreground text-sm">
              {searchQuery ? "No groups match your search" : "No groups yet"}
            </p>
            {!searchQuery && (
              <p className="text-muted-foreground text-xs mt-1">
                Forge your first group to get started!
              </p>
            )}
          </div>
        ) : (
          groups.map((group) => (
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
