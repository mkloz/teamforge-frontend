import { mapMessages } from "@/features/activity/api/projections/activity-message-projections";
import { mapFriendshipUserParticipant } from "@/features/activity/api/projections/activity-participant-projections";
import type {
  ActivityParticipant,
  DirectChat,
} from "@/features/activity/lib/activity-contract";
import type {
  ChatApi,
  FriendshipApi,
  FriendshipPrivateChatApi,
} from "@/shared/schemas";
import { getChatIsMutedForUser } from "../chat-user-preferences";

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
    isMuted: getChatIsMutedForUser(chatSummary, currentUser.id),
    isBlocked: friendship.status === "BLOCKED",
    mutualGroups: [],
  };
}

export function mapNotesChat(
  chatSummary: ChatApi,
  currentUser: ActivityParticipant,
): DirectChat {
  const participants = [
    {
      userId: currentUser.id,
      chatId: chatSummary.id,
      user: currentUser,
    },
  ];

  return {
    id: chatSummary.id,
    type: chatSummary.type,
    createdAt: chatSummary.createdAt,
    groupId: null,
    participants,
    pinnedMessages: mapMessages(
      chatSummary.pinnedMessages ?? [],
      [currentUser],
      currentUser.id,
    ),
    isMuted: getChatIsMutedForUser(chatSummary, currentUser.id),
    isBlocked: false,
    mutualGroups: [],
  };
}
