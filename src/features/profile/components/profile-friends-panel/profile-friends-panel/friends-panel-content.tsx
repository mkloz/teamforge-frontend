import type { ReactNode } from "react";
import { FriendRequestsList } from "@/features/profile/components/profile-friends-panel/friend-requests-list";
import { FriendsList } from "@/features/profile/components/profile-friends-panel/friends-list";
import { MutualFriendsList } from "@/features/profile/components/profile-friends-panel/mutual-friends-list";
import type { TabValue } from "@/features/profile/components/profile-friends-panel/profile-friends-panel/types";
import { PublicFriendsList } from "@/features/profile/components/profile-friends-panel/public-friends-list";
import { getFriendsTabId, getFriendsTabPanelId } from "./friends-tab-ids";

export function PublicFriendsPanelContent({
  activeTab,
  idBase,
  userId,
}: {
  activeTab: TabValue;
  idBase: string | null;
  userId: string;
}) {
  return (
    <FriendsTabPanel activeTab={activeTab} idBase={idBase}>
      {activeTab === "friends" ? (
        <MutualFriendsList userId={userId} />
      ) : (
        <PublicFriendsList userId={userId} />
      )}
    </FriendsTabPanel>
  );
}

export function SelfFriendsPanelContent({
  activeTab,
  idBase,
}: {
  activeTab: TabValue;
  idBase: string;
}) {
  return (
    <FriendsTabPanel activeTab={activeTab} idBase={idBase}>
      {activeTab === "friends" ? <FriendsList /> : <FriendRequestsList />}
    </FriendsTabPanel>
  );
}

function FriendsTabPanel({
  activeTab,
  children,
  idBase,
}: {
  activeTab: TabValue;
  children: ReactNode;
  idBase: string | null;
}) {
  if (!idBase) {
    return <div className="min-h-64">{children}</div>;
  }

  return (
    <div
      aria-labelledby={getFriendsTabId(idBase, activeTab)}
      className="min-h-64"
      id={getFriendsTabPanelId(idBase)}
      role="tabpanel"
    >
      {children}
    </div>
  );
}
