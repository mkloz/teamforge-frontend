import { FriendRequestsList } from "@/features/profile/components/profile-friends-panel/friend-requests-list";
import { FriendsList } from "@/features/profile/components/profile-friends-panel/friends-list";
import { MutualFriendsList } from "@/features/profile/components/profile-friends-panel/mutual-friends-list";
import type { TabValue } from "@/features/profile/components/profile-friends-panel/profile-friends-panel/types";
import { PublicFriendsList } from "@/features/profile/components/profile-friends-panel/public-friends-list";

export function PublicFriendsPanelContent({
  activeTab,
  userId,
}: {
  activeTab: TabValue;
  userId: string;
}) {
  return (
    <div className="min-h-64">
      {activeTab === "friends" ? (
        <MutualFriendsList userId={userId} />
      ) : (
        <PublicFriendsList userId={userId} />
      )}
    </div>
  );
}

export function SelfFriendsPanelContent({
  activeTab,
}: {
  activeTab: TabValue;
}) {
  return (
    <div className="min-h-64">
      {activeTab === "friends" ? <FriendsList /> : <FriendRequestsList />}
    </div>
  );
}
