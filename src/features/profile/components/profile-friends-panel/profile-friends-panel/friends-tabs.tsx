import type { ReactNode } from "react";
import {
  PUBLIC_FRIENDS_TAB_ITEMS,
  SELF_FRIENDS_TAB_ITEMS,
} from "@/features/profile/components/profile-friends-panel/profile-friends-panel/friends-panel-state";
import type {
  FriendsPanelTabItem,
  TabValue,
} from "@/features/profile/components/profile-friends-panel/profile-friends-panel/types";
import { cn } from "@/shared/lib/utils";

export function PublicFriendsTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: TabValue;
  onTabChange: (tab: TabValue) => void;
}) {
  return (
    <FriendsTabs
      activeTab={activeTab}
      items={PUBLIC_FRIENDS_TAB_ITEMS}
      onTabChange={onTabChange}
    />
  );
}

export function SelfFriendsTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: TabValue;
  onTabChange: (tab: TabValue) => void;
}) {
  return (
    <FriendsTabs
      activeTab={activeTab}
      items={SELF_FRIENDS_TAB_ITEMS}
      onTabChange={onTabChange}
    />
  );
}

function FriendsTabs({
  activeTab,
  items,
  onTabChange,
}: {
  activeTab: TabValue;
  items: readonly FriendsPanelTabItem[];
  onTabChange: (tab: TabValue) => void;
}) {
  return (
    <div className="flex gap-2 border-border border-b pb-1">
      {items.map((item) => (
        <FriendsTabButton
          key={item.value}
          activeTab={activeTab}
          item={item}
          onTabChange={onTabChange}
        />
      ))}
    </div>
  );
}

function FriendsTabButton({
  activeTab,
  item,
  onTabChange,
}: {
  activeTab: TabValue;
  item: FriendsPanelTabItem;
  onTabChange: (tab: TabValue) => void;
}) {
  const Icon = item.Icon;

  return (
    <TabButton
      active={activeTab === item.value}
      onClick={() => onTabChange(item.value)}
      icon={<Icon className="size-4" />}
      label={item.label}
    />
  );
}

function TabButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex items-center gap-2 rounded-md px-3 py-2 font-semibold text-sm transition-colors",
        "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        active ? "text-foreground" : "text-muted-foreground",
      )}
    >
      {icon}
      {label}
      {active && (
        <span
          className="absolute right-0 bottom-[-1.25px] left-0 h-0.5 bg-forge-teal"
          aria-hidden="true"
        />
      )}
    </button>
  );
}
