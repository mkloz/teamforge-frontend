import {
  PUBLIC_FRIENDS_TAB_ITEMS,
  SELF_FRIENDS_TAB_ITEMS,
} from "@/features/profile/components/profile-friends-panel/profile-friends-panel/friends-panel-state";
import type {
  FriendsPanelTabItem,
  TabValue,
} from "@/features/profile/components/profile-friends-panel/profile-friends-panel/types";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { getFriendsTabId, getFriendsTabPanelId } from "./friends-tab-ids";

export function PublicFriendsTabs({
  activeTab,
  idBase,
  onTabChange,
}: {
  activeTab: TabValue;
  idBase: string;
  onTabChange: (tab: TabValue) => void;
}) {
  return (
    <FriendsTabs
      activeTab={activeTab}
      idBase={idBase}
      items={PUBLIC_FRIENDS_TAB_ITEMS}
      onTabChange={onTabChange}
    />
  );
}

export function SelfFriendsTabs({
  activeTab,
  idBase,
  onTabChange,
}: {
  activeTab: TabValue;
  idBase: string;
  onTabChange: (tab: TabValue) => void;
}) {
  return (
    <FriendsTabs
      activeTab={activeTab}
      idBase={idBase}
      items={SELF_FRIENDS_TAB_ITEMS}
      onTabChange={onTabChange}
    />
  );
}

function FriendsTabs({
  activeTab,
  idBase,
  items,
  onTabChange,
}: {
  activeTab: TabValue;
  idBase: string;
  items: readonly FriendsPanelTabItem[];
  onTabChange: (tab: TabValue) => void;
}) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        const nextItem = items.find((item) => item.value === value);
        if (nextItem) onTabChange(nextItem.value);
      }}
    >
      <TabsList
        aria-label="Friends views"
        className="gap-2 border-border border-b pb-1"
        variant="line"
      >
        {items.map((item) => (
          <FriendsTabTrigger
            key={item.value}
            controlsId={getFriendsTabPanelId(idBase)}
            id={getFriendsTabId(idBase, item.value)}
            item={item}
          />
        ))}
      </TabsList>
    </Tabs>
  );
}

function FriendsTabTrigger({
  controlsId,
  id,
  item,
}: {
  controlsId: string;
  id: string;
  item: FriendsPanelTabItem;
}) {
  const Icon = item.Icon;

  return (
    <TabsTrigger
      aria-controls={controlsId}
      className="min-h-11 gap-2 rounded-md px-3 py-2 font-semibold text-sm group-data-[variant=line]/tabs-list:data-[state=active]:after:bg-forge-teal [@media(pointer:fine)]:min-h-0"
      id={id}
      value={item.value}
    >
      <Icon className="size-4" aria-hidden="true" />
      {item.label}
    </TabsTrigger>
  );
}
