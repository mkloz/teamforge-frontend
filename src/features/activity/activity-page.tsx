import { useActivity } from "@/features/activity/hooks/use-activity";
import { cn } from "@/shared/lib/utils";
import { MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

import { useMediaQuery } from "@/shared/hooks/use-media-query";

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
    sidebarDensity,
    setSidebarDensity,
  } = useActivity();

  const isMobile = useMediaQuery("(max-width: 1024px)");

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
          sidebarDensity={sidebarDensity}
          groupCount={groupCount}
          dmCount={dmCount}
          unreadCount={unreadCount}
          onSearchChange={setSearchQuery}
          onFilterChange={setActiveFilter}
          onDensityChange={setSidebarDensity}
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
        <AnimatePresence mode="wait">
          {selectedKind === "group" && selectedId && selectedGroup ? (
            <motion.div
              key={`group-${selectedId}`}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex-1 flex overflow-hidden"
            >
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
            </motion.div>
          ) : selectedKind === "dm" && selectedId && selectedChat ? (
            <motion.div
              key={`dm-${selectedId}`}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex-1 flex overflow-hidden"
            >
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
              {isMobile && (
                <ProfilePanelMobile
                  chat={selectedChat}
                  isOpen={direct.isProfilePanelOpen}
                  onClose={closeProfilePanel}
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex"
            >
              <ActivityEmptyState />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function ActivityEmptyState() {
  return (
    <section className="flex-1 hidden md:flex items-center justify-center bg-canvas/30 backdrop-blur-sm">
      <div className="text-center max-w-sm px-6">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-forge-teal/8 flex items-center justify-center mb-6 shadow-sm border border-forge-teal/15">
          <MessageSquare
            size={28}
            className="text-forge-teal"
            strokeWidth={1.5}
          />
        </div>
        <h2 className="text-lg font-bold text-ink">
          Pick a conversation to begin.
        </h2>
        <p className="text-sm mt-2 text-slate-muted leading-relaxed">
          Select any group or direct message from the list to start chatting and
          planning activities together.
        </p>
      </div>
    </section>
  );
}
