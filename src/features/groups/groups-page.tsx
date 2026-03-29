import { cn } from "@/shared/lib/utils";
import { MessageSquare } from "lucide-react";
import { useCallback, useState } from "react";
import { ConversationList } from "./components/conversation-list/conversation-list";
import { ConversationView } from "./components/conversation-view/conversation-view";
import { GroupDetailPanel } from "./components/group-detail-panel/group-detail-panel";
import {
  MOCK_GROUP_PREVIEWS,
  MOCK_GROUPS,
  MOCK_MESSAGES,
} from "./data/mock-groups";
import type { GroupsPageState } from "./types/groups.types";

export function GroupsPage() {
  const [state, setState] = useState<GroupsPageState>({
    selectedGroupId: null,
    isDetailPanelOpen: false,
    searchQuery: "",
    draftMessages: {},
  });

  const selectedGroup = state.selectedGroupId
    ? MOCK_GROUPS[state.selectedGroupId]
    : null;
  const selectedMessages = state.selectedGroupId
    ? (MOCK_MESSAGES[state.selectedGroupId] ?? [])
    : [];

  const handleSelectGroup = useCallback((groupId: string) => {
    setState((prev) => ({
      ...prev,
      selectedGroupId: groupId,
      // On desktop, auto-open detail panel when selecting a group
      isDetailPanelOpen: window.innerWidth >= 1024,
    }));
  }, []);

  const handleBack = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedGroupId: null,
      isDetailPanelOpen: false,
    }));
  }, []);

  const handleToggleDetailPanel = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isDetailPanelOpen: !prev.isDetailPanelOpen,
    }));
  }, []);

  const handleCloseDetailPanel = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isDetailPanelOpen: false,
    }));
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setState((prev) => ({
      ...prev,
      searchQuery: query,
    }));
  }, []);

  const handleSendMessage = useCallback((content: string) => {
    // In a real app, this would send via API/WebSocket
    console.log("Sending message:", content);
  }, []);

  // Filter groups based on search query
  const filteredGroups = MOCK_GROUP_PREVIEWS.filter((group) =>
    group.planTitle.toLowerCase().includes(state.searchQuery.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 top-16 md:left-16 lg:left-60 pb-24 md:pb-0 flex bg-background">
      {/* Conversation List - always visible on desktop, conditional on mobile */}
      <div
        className={cn(
          "flex-shrink-0 border-r border-border bg-background",
          // Mobile: full width when no selection, hidden when selection
          "w-full",
          // Tablet+: fixed width sidebar
          "md:w-72 md:block",
          // Hide on mobile when a conversation is selected
          state.selectedGroupId && "hidden md:block",
        )}
      >
        <ConversationList
          groups={filteredGroups}
          selectedGroupId={state.selectedGroupId}
          searchQuery={state.searchQuery}
          onSearchChange={handleSearchChange}
          onSelectGroup={handleSelectGroup}
        />
      </div>

      {/* Conversation View - main chat area */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0",
          // Mobile: full width when selected, hidden when not
          !state.selectedGroupId && "hidden md:flex",
          // When detail panel is open on desktop, shrink
        )}
      >
        {state.selectedGroupId && selectedGroup ? (
          <ConversationView
            group={selectedGroup}
            messages={selectedMessages}
            onBack={handleBack}
            onToggleDetail={handleToggleDetailPanel}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center text-muted-foreground">
            <div className="text-center max-w-xs">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <MessageSquare size={28} className="text-muted-foreground/60" />
              </div>
              <p className="text-lg font-semibold text-foreground">
                Select a conversation
              </p>
              <p className="text-sm mt-2 text-muted-foreground leading-relaxed">
                Choose a group from the list to view messages and coordinate
                with your team
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Group Detail Panel - sidebar on desktop, sheet on mobile */}
      {selectedGroup && (
        <GroupDetailPanel
          group={selectedGroup}
          isOpen={state.isDetailPanelOpen}
          onClose={handleCloseDetailPanel}
        />
      )}
    </div>
  );
}
