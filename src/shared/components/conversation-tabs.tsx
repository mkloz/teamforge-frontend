import { cn } from "@/shared/lib/utils";

export type ConversationTabType = "groups" | "direct";

interface ConversationTabsProps {
  activeTab: ConversationTabType;
  onTabChange: (tab: ConversationTabType) => void;
  groupsUnreadCount?: number;
  directUnreadCount?: number;
}

export function ConversationTabs({
  activeTab,
  onTabChange,
  groupsUnreadCount = 0,
  directUnreadCount = 0,
}: ConversationTabsProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
      <button
        onClick={() => onTabChange("groups")}
        className={cn(
          "relative flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all",
          activeTab === "groups"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        Groups
        {groupsUnreadCount > 0 && (
          <span
            className={cn(
              "absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold",
              activeTab === "groups"
                ? "bg-primary text-primary-foreground"
                : "bg-muted-foreground/20 text-muted-foreground",
            )}
          >
            {groupsUnreadCount > 99 ? "99+" : groupsUnreadCount}
          </span>
        )}
      </button>
      <button
        onClick={() => onTabChange("direct")}
        className={cn(
          "relative flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all",
          activeTab === "direct"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        Direct
        {directUnreadCount > 0 && (
          <span
            className={cn(
              "absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold",
              activeTab === "direct"
                ? "bg-primary text-primary-foreground"
                : "bg-muted-foreground/20 text-muted-foreground",
            )}
          >
            {directUnreadCount > 99 ? "99+" : directUnreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
