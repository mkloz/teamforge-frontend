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
  chatSummary?: ChatApi | null,
): NonNullable<DirectChat["participants"]> {
  const participant = mapFriendshipUserParticipant(counterpart);
  const readCursorByUserId = buildReadCursorByUserId(chatSummary);
  const participantLastReadMessageId =
    readCursorByUserId.get(participant.id) ?? null;
  const currentUserLastReadMessageId =
    readCursorByUserId.get(currentUser.id) ?? null;

  return [
    {
      userId: participant.id,
      chatId: privateChat.id,
      lastReadMessageId: participantLastReadMessageId,
      user: {
        ...participant,
        lastReadMessageId: participantLastReadMessageId,
      },
    },
    {
      userId: currentUser.id,
      chatId: privateChat.id,
      lastReadMessageId: currentUserLastReadMessageId,
      user: {
        ...currentUser,
        lastReadMessageId: currentUserLastReadMessageId,
      },
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
    chatSummary,
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
    isBlocked: false,
    mutualGroups: [],
  };
}

export function mapNotesChat(
  chatSummary: ChatApi,
  currentUser: ActivityParticipant,
): DirectChat {
  const currentUserLastReadMessageId =
    buildReadCursorByUserId(chatSummary).get(currentUser.id) ?? null;
  const participants: NonNullable<DirectChat["participants"]> = [
    {
      userId: currentUser.id,
      chatId: chatSummary.id,
      lastReadMessageId: currentUserLastReadMessageId,
      user: {
        ...currentUser,
        lastReadMessageId: currentUserLastReadMessageId,
      },
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

function buildReadCursorByUserId(chatSummary?: ChatApi | null) {
  return new Map(
    chatSummary?.participants?.map((participant) => [
      participant.userId,
      participant.lastReadMessageId,
    ]) ?? [],
  );
}
