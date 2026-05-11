import { GeneratedSkeleton } from "@/shared/components/loading/generated-skeleton";
import type { FriendshipApi, FriendshipUserApi } from "@/shared/schemas";
import { ManualFriendInviteRow } from "./manual-friend-invite-row";

export const MANUAL_FRIENDS_SKELETON_NAME = "forge.manual-friends";

const noop = () => {};

export function ManualFriendsSkeleton() {
  const fixture = <ManualFriendsSkeletonFixture />;

  return (
    <GeneratedSkeleton
      name={MANUAL_FRIENDS_SKELETON_NAME}
      loading
      fixture={fixture}
      fallback={null}
    >
      {fixture}
    </GeneratedSkeleton>
  );
}

export function ManualFriendsSkeletonFixture() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading friends"
      className="flex flex-col gap-2"
      role="status"
    >
      <span className="sr-only">Loading friends</span>
      {manualFriendsFixture.map((friendshipItem, index) => (
        <ManualFriendInviteRow
          key={friendshipItem.counterpart.id}
          friendship={friendshipItem}
          selected={index === 1}
          disabled={false}
          onToggle={noop}
        />
      ))}
    </div>
  );
}

const manualFriendsFixture: FriendshipApi[] = [
  buildFriendship("friend-maya", "Maya Chen", "London", "ISFP", 88),
  buildFriendship("friend-cody", "Cody Rivera", "Camden", "INTJ", 91),
  buildFriendship("friend-noah", "Noah Patel", "Hackney", "ENTP", 84),
];

function buildFriendship(
  id: string,
  name: string,
  city: string,
  personalityType: FriendshipUserApi["personalityType"],
  trustScore: number,
): FriendshipApi {
  const user: FriendshipUserApi = {
    id,
    name,
    avatar: null,
    city,
    personalityType,
    trustScore,
    onlineStatus: "ONLINE",
  };
  const now = "2026-05-11T12:00:00.000Z";

  return {
    status: "ACCEPTED",
    createdAt: now,
    updatedAt: now,
    version: 1,
    requesterId: "viewer",
    receiverId: id,
    privateChatId: `chat-${id}`,
    requester: {
      id: "viewer",
      name: "You",
      avatar: null,
      city: "London",
      personalityType: "ENFP",
      trustScore: 92,
      onlineStatus: "ONLINE",
    },
    receiver: user,
    counterpart: user,
    privateChat: {
      id: `chat-${id}`,
      type: "PRIVATE",
      createdAt: now,
    },
  };
}
