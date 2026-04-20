import { useActivity } from "@/features/activity/hooks/use-activity";
import { cn } from "@/shared/lib/utils";
import { MessageSquare } from "lucide-react";

// Groups
import { GroupDetailPanel } from "@/features/activity/components/groups/group-detail-panel/group-detail-panel";

// Direct chats
import {
  ProfilePanel,
  ProfilePanelMobile,
} from "@/features/activity/components/direct-chats/profile-panel";

// Unified components
import { UnifiedConversationView } from "@/features/activity/components/chat/unified-conversation-view";
import { UnifiedConversationList } from "@/features/activity/components/unified-conversation-list";

/**
 * ActivityPage - The main feature orchestrator for Unified Conversations,
 * Groups and Direct Chats.
 */
export function ActivityPage() {
  const {
    // State
    searchQuery,
    activeFilter,
    selectedId,
    selectedKind,
    groups,
    direct,
    hasSelection,

    // Derived
    filteredItems,
    groupCount,
    dmCount,
    unreadCount,
    selectedGroup,
    selectedGroupMessages,
    selectedChat,
    selectedDirectMessages,
    isTyping,
    typingUsers,

    // Actions
    setSearchQuery,
    setActiveFilter,
    handleSelectItem,
    handleBack,
    toggleGroupDetail,
    closeGroupDetail,
    toggleProfilePanel,
    closeProfilePanel,
    handleSendMessage,
  } = useActivity();

  return (
    <div
      className={cn(
        "fixed inset-0 top-0 md:top-0 md:left-14 flex bg-canvas",
        !hasSelection ? "pb-12 md:pb-0" : "pb-0",
      )}
    >
      {/* Left sidebar — unified list */}
      <aside
        className={cn(
          "flex flex-col shrink-0 border-r border-border bg-canvas transition-colors duration-300",
          "w-full md:w-72 lg:w-80",
          hasSelection && "hidden md:flex",
        )}
      >
        <UnifiedConversationList
          items={filteredItems}
          selectedId={selectedId}
          searchQuery={searchQuery}
          activeFilter={activeFilter}
          groupCount={groupCount}
          dmCount={dmCount}
          unreadCount={unreadCount}
          onSearchChange={setSearchQuery}
          onFilterChange={setActiveFilter}
          onSelectItem={handleSelectItem}
        />
      </aside>

      {/* Main content area */}
      <main
        className={cn(
          "flex-1 flex min-w-0 duration-300",
          !hasSelection && "hidden md:flex",
        )}
      >
        {selectedKind === "group" && selectedId && selectedGroup ? (
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col min-w-0">
              <UnifiedConversationView
                kind="group"
                data={selectedGroup}
                messages={selectedGroupMessages}
                typingUsers={typingUsers}
                isActionOpen={groups.isDetailPanelOpen}
                onBack={handleBack}
                onToggleAction={toggleGroupDetail}
                onSendMessage={handleSendMessage}
              />
            </div>
            <GroupDetailPanel
              group={selectedGroup}
              isOpen={groups.isDetailPanelOpen}
              onClose={closeGroupDetail}
            />
          </div>
        ) : selectedKind === "dm" && selectedId && selectedChat ? (
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col min-w-0">
              <UnifiedConversationView
                kind="dm"
                data={selectedChat}
                messages={selectedDirectMessages}
                isTyping={isTyping}
                isActionOpen={direct.isProfilePanelOpen}
                onBack={handleBack}
                onToggleAction={toggleProfilePanel}
                onSendMessage={handleSendMessage}
              />
            </div>
            <ProfilePanel
              chat={selectedChat}
              isOpen={direct.isProfilePanelOpen}
              onClose={closeProfilePanel}
            />
            <ProfilePanelMobile
              chat={selectedChat}
              isOpen={direct.isProfilePanelOpen}
              onClose={closeProfilePanel}
            />
          </div>
        ) : (
          <ActivityEmptyState />
        )}
      </main>
    </div>
  );
}

function ActivityEmptyState() {
  return (
    <section className="flex-1 hidden md:flex items-center justify-center bg-canvas/30 backdrop-blur-sm">
      <div className="text-center max-w-sm px-6">
        <div className="mx-auto w-20 h-20 rounded-2xl bg-muted/20 flex items-center justify-center mb-6 shadow-sm">
          <MessageSquare size={32} className="text-muted-foreground/40" />
        </div>
        <h2 className="text-xl font-bold text-ink">
          Find your people, intelligently.
        </h2>
        <p className="text-sm mt-3 text-slate-muted leading-relaxed">
          Select any group or direct message from the list on the left to start
          chatting and planning activities together.
        </p>
      </div>
    </section>
  );
}
