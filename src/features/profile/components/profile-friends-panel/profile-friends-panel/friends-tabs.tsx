import { type KeyboardEvent, type ReactNode, useRef } from "react";
import {
  PUBLIC_FRIENDS_TAB_ITEMS,
  SELF_FRIENDS_TAB_ITEMS,
} from "@/features/profile/components/profile-friends-panel/profile-friends-panel/friends-panel-state";
import type {
  FriendsPanelTabItem,
  TabValue,
} from "@/features/profile/components/profile-friends-panel/profile-friends-panel/types";
import { cn } from "@/shared/lib/utils";
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
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) {
    const nextIndex = getNextTabIndex(event.key, currentIndex, items.length);

    if (nextIndex === null) {
      return;
    }

    const nextItem = items[nextIndex];

    if (!nextItem) {
      return;
    }

    event.preventDefault();
    tabRefs.current[nextIndex]?.focus();
    onTabChange(nextItem.value);
  }

  return (
    <div
      aria-label="Friends views"
      className="flex gap-2 border-border border-b pb-1"
      role="tablist"
    >
      {items.map((item, index) => (
        <FriendsTabButton
          key={item.value}
          activeTab={activeTab}
          controlsId={getFriendsTabPanelId(idBase)}
          id={getFriendsTabId(idBase, item.value)}
          item={item}
          tabRef={(element) => {
            tabRefs.current[index] = element;
          }}
          onTabChange={onTabChange}
          onKeyDown={(event) => handleTabKeyDown(event, index)}
        />
      ))}
    </div>
  );
}

function FriendsTabButton({
  activeTab,
  controlsId,
  id,
  item,
  onKeyDown,
  onTabChange,
  tabRef,
}: {
  activeTab: TabValue;
  controlsId: string;
  id: string;
  item: FriendsPanelTabItem;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  onTabChange: (tab: TabValue) => void;
  tabRef: (element: HTMLButtonElement | null) => void;
}) {
  const Icon = item.Icon;

  return (
    <TabButton
      active={activeTab === item.value}
      controlsId={controlsId}
      id={id}
      onClick={() => onTabChange(item.value)}
      onKeyDown={onKeyDown}
      icon={<Icon className="size-4" aria-hidden="true" />}
      label={item.label}
      tabRef={tabRef}
    />
  );
}

function TabButton({
  active,
  controlsId,
  id,
  icon,
  label,
  onClick,
  onKeyDown,
  tabRef,
}: {
  active: boolean;
  controlsId: string;
  id: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  tabRef: (element: HTMLButtonElement | null) => void;
}) {
  return (
    <button
      ref={tabRef}
      id={id}
      type="button"
      role="tab"
      onClick={onClick}
      onKeyDown={onKeyDown}
      aria-controls={controlsId}
      aria-selected={active}
      tabIndex={active ? 0 : -1}
      className={cn(
        "relative flex min-h-11 items-center gap-2 rounded-md px-3 py-2 font-semibold text-sm transition-colors [@media(pointer:fine)]:min-h-0",
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

function getNextTabIndex(key: string, currentIndex: number, itemCount: number) {
  if (key === "ArrowRight") {
    return (currentIndex + 1) % itemCount;
  }

  if (key === "ArrowLeft") {
    return (currentIndex - 1 + itemCount) % itemCount;
  }

  if (key === "Home") {
    return 0;
  }

  if (key === "End") {
    return itemCount - 1;
  }

  return null;
}
