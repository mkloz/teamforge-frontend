import type {
  ChatApi,
  FriendshipApi,
  FriendshipPrivateChatApi,
} from "@/shared/schemas";

import type {
  ActivityParticipant,
  DirectChat,
} from "@/features/activity/lib/activity-contract";
import { mapMessages } from "@/features/activity/api/projections/activity-message-projections";
import { mapFriendshipUserParticipant } from "@/features/activity/api/projections/activity-participant-projections";

function buildDirectChatParticipants(
  privateChat: FriendshipPrivateChatApi,
  counterpart: FriendshipApi["counterpart"],
  currentUser: ActivityParticipant,
) {
  const participant = mapFriendshipUserParticipant(counterpart);

  return [
    {
      userId: participant.id,
      chatId: privateChat.id,
      user: participant,
    },
    {
      userId: currentUser.id,
      chatId: privateChat.id,
      user: currentUser,
    },
  ];
}

export function mapDirectChat(
  friendship: FriendshipApi,
  currentUser: ActivityParticipant,
  chatSummary?: ChatApi | null,
): DirectChat | null {
  if (!friendship.privateChat) {
    return null;
  }

  const participants = buildDirectChatParticipants(
    friendship.privateChat,
    friendship.counterpart,
    currentUser,
  );

  return {
    id: friendship.privateChat.id,
    type: friendship.privateChat.type,
    createdAt: friendship.privateChat.createdAt,
    groupId: null,
    participants,
    pinnedMessages: mapMessages(
      chatSummary?.pinnedMessages ?? [],
      participants
        .map((item) => item.user)
        .filter((item): item is ActivityParticipant => item !== undefined),
      currentUser.id,
    ),
    isMuted: false,
    isBlocked: friendship.status === "BLOCKED",
    mutualGroups: [],
  };
}
