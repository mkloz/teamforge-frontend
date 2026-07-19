import { ConversationList } from "@/features/activity/components/conversation-list";
import type { ActivityWorkspace } from "@/features/activity/hooks/use-activity";
import { cn } from "@/shared/lib/utils";

interface ActivitySidebarProps {
  activity: ActivityWorkspace;
  isOnline: boolean;
  showTemplateStartingPoints: boolean;
}

export function ActivitySidebar({
  activity,
  isOnline,
  showTemplateStartingPoints,
}: ActivitySidebarProps) {
  const isOfflineInitialLoad = !isOnline && activity.isInitialLoading;

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 shrink-0 flex-col border-border border-r bg-canvas transition-colors duration-300",
        "w-full md:w-72 lg:w-80",
        activity.hasSelection && "hidden md:flex",
      )}
    >
      <ConversationList
        items={activity.filteredItems}
        savedMessages={activity.savedMessages}
        selectedId={activity.selectedId}
        selectedKind={activity.selectedKind}
        searchQuery={activity.searchQuery}
        activeFilter={activity.activeFilter}
        sidebarDensity={activity.sidebarDensity}
        pinnedCount={activity.pinnedCount}
        allUnreadMessageCount={activity.allUnreadMessageCount}
        groupUnreadMessageCount={activity.groupUnreadMessageCount}
        dmUnreadMessageCount={activity.dmUnreadMessageCount}
        pinnedUnreadMessageCount={activity.pinnedUnreadMessageCount}
        savedCount={activity.savedCount}
        showTemplateStartingPoints={showTemplateStartingPoints}
        isFeedError={activity.isFeedError || isOfflineInitialLoad}
        isFeedRetrying={activity.isFeedRetrying && !isOfflineInitialLoad}
        isOnline={isOnline}
        onSearchChange={activity.setSearchQuery}
        onFilterChange={activity.setActiveFilter}
        onDensityChange={activity.setSidebarDensity}
        onTogglePinnedItem={activity.togglePinnedConversation}
        onToggleMutedItem={activity.toggleMutedConversation}
        onMarkReadItem={activity.markConversationRead}
        onRemoveSavedMessage={activity.removeSavedMessage}
        onRetryFeed={activity.retryFeed}
        onSelectItem={activity.handleSelectItem}
      />
    </aside>
  );
}
