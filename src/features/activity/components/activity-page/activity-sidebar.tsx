import type { ActivityWorkspace } from "@/features/activity/hooks/use-activity";
import { UnifiedConversationList } from "@/features/activity/components/unified-conversation-list";
import { cn } from "@/shared/lib/utils";

interface ActivitySidebarProps {
  activity: ActivityWorkspace;
}

export function ActivitySidebar({ activity }: ActivitySidebarProps) {
  return (
    <aside
      className={cn(
        "flex flex-col shrink-0 border-r border-border bg-canvas transition-colors duration-300",
        "w-full md:w-72 lg:w-80",
        activity.hasSelection && "hidden md:flex",
      )}
    >
      <UnifiedConversationList
        items={activity.filteredItems}
        selectedId={activity.selectedId}
        searchQuery={activity.searchQuery}
        activeFilter={activity.activeFilter}
        sidebarDensity={activity.sidebarDensity}
        groupCount={activity.groupCount}
        dmCount={activity.dmCount}
        unreadCount={activity.unreadCount}
        onSearchChange={activity.setSearchQuery}
        onFilterChange={activity.setActiveFilter}
        onDensityChange={activity.setSidebarDensity}
        onSelectItem={activity.handleSelectItem}
      />
    </aside>
  );
}
