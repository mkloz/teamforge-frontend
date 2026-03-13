import { useState, useCallback, useEffect } from "react";
import { cn } from "@/shared/lib/utils";
import { MessageSquare } from "lucide-react";
import { ConversationTabs, type ConversationTabType } from "@/shared/components/conversation-tabs";

// Groups imports
import { ConversationList } from "../groups/components/conversation-list/conversation-list";
import { ConversationView } from "../groups/components/conversation-view/conversation-view";
import { GroupDetailPanel } from "../groups/components/group-detail-panel/group-detail-panel";
import { MOCK_GROUP_PREVIEWS, MOCK_GROUPS, MOCK_MESSAGES } from "../groups/data/mock-groups";
import type { GroupsPageState } from "../groups/types/groups.types";

// Direct chats imports
import { DirectChatList } from "../direct-chats/components/direct-chat-list";
import { DirectChatView } from "../direct-chats/components/direct-chat-view";
import { ProfilePanel, ProfilePanelMobile } from "../direct-chats/components/profile-panel";
import {
  MOCK_DIRECT_CHAT_PREVIEWS,
  MOCK_DIRECT_CHATS,
  MOCK_DIRECT_MESSAGES,
} from "../direct-chats/data/mock-direct-chats";
import type { DirectChatsState } from "../direct-chats/types/direct-chats.types";

export function ActivityPage() {
  const [activeTab, setActiveTab] = useState<ConversationTabType>("groups");
  
  // Groups state
  const [groupsState, setGroupsState] = useState<GroupsPageState>({
    selectedGroupId: null,
    isDetailPanelOpen: false,
    searchQuery: "",
    draftMessages: {},
  });

  // Direct chats state
  const [directState, setDirectState] = useState<DirectChatsState>({
    selectedChatId: null,
    isProfilePanelOpen: false,
    searchQuery: "",
    draftMessages: {},
  });

  // Check if we're on desktop
  const [_isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  // Calculate unread counts
  const groupsUnreadCount = MOCK_GROUP_PREVIEWS.filter((g) => g.unreadCount > 0).length;
  const directUnreadCount = MOCK_DIRECT_CHAT_PREVIEWS.filter((c) => c.unreadCount > 0).length;

  // Groups handlers
  const selectedGroup = groupsState.selectedGroupId ? MOCK_GROUPS[groupsState.selectedGroupId] : null;
  const selectedGroupMessages = groupsState.selectedGroupId ? MOCK_MESSAGES[groupsState.selectedGroupId] ?? [] : [];

  const handleSelectGroup = useCallback((groupId: string) => {
    setGroupsState((prev) => ({
      ...prev,
      selectedGroupId: groupId,
      isDetailPanelOpen: window.innerWidth >= 1024,
    }));
  }, []);

  const handleGroupBack = useCallback(() => {
    setGroupsState((prev) => ({
      ...prev,
      selectedGroupId: null,
      isDetailPanelOpen: false,
    }));
  }, []);

  const handleToggleGroupDetail = useCallback(() => {
    setGroupsState((prev) => ({
      ...prev,
      isDetailPanelOpen: !prev.isDetailPanelOpen,
    }));
  }, []);

  const handleCloseGroupDetail = useCallback(() => {
    setGroupsState((prev) => ({
      ...prev,
      isDetailPanelOpen: false,
    }));
  }, []);

  const handleGroupSearchChange = useCallback((query: string) => {
    setGroupsState((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const handleGroupSendMessage = useCallback((content: string) => {
    console.log("Sending group message:", content);
  }, []);

  // Direct chat handlers
  const selectedChat = directState.selectedChatId
    ? MOCK_DIRECT_CHATS[directState.selectedChatId]
    : null;
  const selectedDirectMessages = directState.selectedChatId
    ? MOCK_DIRECT_MESSAGES[directState.selectedChatId] ?? []
    : [];
  const selectedChatPreview = MOCK_DIRECT_CHAT_PREVIEWS.find(
    (c) => c.id === directState.selectedChatId,
  );

  const handleSelectChat = useCallback((chatId: string) => {
    setDirectState((s) => ({
      ...s,
      selectedChatId: chatId,
      isProfilePanelOpen: false,
    }));
  }, []);

  const handleChatBack = useCallback(() => {
    setDirectState((s) => ({
      ...s,
      selectedChatId: null,
      isProfilePanelOpen: false,
    }));
  }, []);

  const handleToggleProfile = useCallback(() => {
    setDirectState((s) => ({
      ...s,
      isProfilePanelOpen: !s.isProfilePanelOpen,
    }));
  }, []);

  const handleCloseProfile = useCallback(() => {
    setDirectState((s) => ({ ...s, isProfilePanelOpen: false }));
  }, []);

  const handleDirectSearchChange = useCallback((query: string) => {
    setDirectState((s) => ({ ...s, searchQuery: query }));
  }, []);

  const handleDirectSendMessage = useCallback((content: string) => {
    console.log("Sending direct message:", content);
  }, []);

  // Filter groups
  const filteredGroups = MOCK_GROUP_PREVIEWS.filter((group) =>
    group.planTitle.toLowerCase().includes(groupsState.searchQuery.toLowerCase()),
  );

  // Determine if we're showing a conversation (for mobile layout)
  const hasSelection = activeTab === "groups" 
    ? !!groupsState.selectedGroupId 
    : !!directState.selectedChatId;

  return (
    <div className="fixed inset-0 top-16 md:left-16 lg:left-60 pb-24 md:pb-0 flex bg-background">
      {/* Left sidebar - List with tabs */}
      <div
        className={cn(
          "flex-shrink-0 border-r border-border bg-background flex flex-col",
          "w-full md:w-72 lg:w-80",
          hasSelection && "hidden md:flex",
        )}
      >
        {/* Tabs */}
        <div className="flex-shrink-0 p-3 border-b border-border">
          <ConversationTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            groupsUnreadCount={groupsUnreadCount}
            directUnreadCount={directUnreadCount}
          />
        </div>

        {/* List content based on active tab */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "groups" ? (
            <ConversationList
              groups={filteredGroups}
              selectedGroupId={groupsState.selectedGroupId}
              searchQuery={groupsState.searchQuery}
              onSearchChange={handleGroupSearchChange}
              onSelectGroup={handleSelectGroup}
            />
          ) : (
            <DirectChatList
              chats={MOCK_DIRECT_CHAT_PREVIEWS}
              selectedChatId={directState.selectedChatId}
              searchQuery={directState.searchQuery}
              onSearchChange={handleDirectSearchChange}
              onSelectChat={handleSelectChat}
            />
          )}
        </div>
      </div>

      {/* Main content area */}
      <div
        className={cn(
          "flex-1 flex min-w-0",
          !hasSelection && "hidden md:flex",
        )}
      >
        {activeTab === "groups" ? (
          // Groups view
          <>
            {groupsState.selectedGroupId && selectedGroup ? (
              <div className="flex-1 flex">
                <div className="flex-1">
                  <ConversationView
                    group={selectedGroup}
                    messages={selectedGroupMessages}
                    onBack={handleGroupBack}
                    onToggleDetail={handleToggleGroupDetail}
                    onSendMessage={handleGroupSendMessage}
                  />
                </div>
                <GroupDetailPanel
                  group={selectedGroup}
                  isOpen={groupsState.isDetailPanelOpen}
                  onClose={handleCloseGroupDetail}
                />
              </div>
            ) : (
              <EmptyState message="Select a group to view messages" />
            )}
          </>
        ) : (
          // Direct chats view
          <>
            {directState.selectedChatId && selectedChat ? (
              <>
                <div className="flex-1">
                  <DirectChatView
                    chat={selectedChat}
                    messages={selectedDirectMessages}
                    isTyping={selectedChatPreview?.isTyping}
                    onBack={handleChatBack}
                    onToggleProfile={handleToggleProfile}
                    onSendMessage={handleDirectSendMessage}
                  />
                </div>
                <ProfilePanel
                  chat={selectedChat}
                  isOpen={directState.isProfilePanelOpen}
                  onClose={handleCloseProfile}
                />
                <ProfilePanelMobile
                  chat={selectedChat}
                  isOpen={directState.isProfilePanelOpen}
                  onClose={handleCloseProfile}
                />
              </>
            ) : (
              <EmptyState message="Select a conversation to start messaging" />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex-1 hidden md:flex items-center justify-center text-muted-foreground">
      <div className="text-center max-w-xs">
        <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <MessageSquare size={28} className="text-muted-foreground/60" />
        </div>
        <p className="text-lg font-semibold text-foreground">Select a conversation</p>
        <p className="text-sm mt-2 text-muted-foreground leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
}
