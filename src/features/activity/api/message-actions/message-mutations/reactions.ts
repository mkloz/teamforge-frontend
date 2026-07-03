import { ActivityApi } from "@/features/activity/api/activity.api";
import { applyMessageCacheUpdate } from "@/features/activity/api/message-actions/message-cache-commit";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import {
  getFreshReactionMessage,
  recoverSelectedMessageMutationCaches,
} from "./cache-recovery";
import {
  applyMappedSelectedMessageUpdate,
  getMessageMutationData,
} from "./mutation-data";
import type { ToggleReactionInChatInput } from "./types";

export async function toggleReactionInChat({
  chatId,
  context,
  emoji,
  message,
  selection,
}: ToggleReactionInChatInput) {
  const { currentUser, currentUserParticipant, participants } =
    await getMessageMutationData(context, selection);
  const baseMessage = getFreshReactionMessage(chatId, message);
  const hasReaction = hasUserReaction(baseMessage, emoji, currentUser.id);
  const optimisticMessage = toggleOptimisticReaction({
    currentUserId: currentUser.id,
    currentUserParticipant,
    emoji,
    hasReaction,
    message: baseMessage,
  });

  applyMessageCacheUpdate({
    chatId,
    context,
    message: optimisticMessage,
    syncPinned: true,
    targetMessageId: message.id,
  });

  const updatedMessage = await requestReactionToggle({
    chatId,
    emoji,
    hasReaction,
    messageId: message.id,
  }).catch(async (error: unknown) => {
    await recoverSelectedMessageMutationCaches({ chatId, selection });
    throw error;
  });

  return applyMappedSelectedMessageUpdate({
    chatId,
    context,
    currentUserId: currentUser.id,
    participants,
    rawMessage: updatedMessage,
    syncPinned: true,
    targetMessageId: message.id,
  });
}

function requestReactionToggle({
  chatId,
  emoji,
  hasReaction,
  messageId,
}: {
  chatId: string;
  emoji: string;
  hasReaction: boolean | undefined;
  messageId: string;
}) {
  return hasReaction
    ? ActivityApi.removeReaction(chatId, messageId, emoji)
    : ActivityApi.addReaction(chatId, messageId, emoji);
}

function hasUserReaction(
  message: UnifiedMessage,
  emoji: string,
  userId: string,
) {
  return message.reactions?.some(
    (reaction) => reaction.emoji === emoji && reaction.userId === userId,
  );
}

function toggleOptimisticReaction({
  currentUserId,
  currentUserParticipant,
  emoji,
  hasReaction,
  message,
}: {
  currentUserId: string;
  currentUserParticipant: NonNullable<UnifiedMessage["sender"]>;
  emoji: string;
  hasReaction: boolean | undefined;
  message: UnifiedMessage;
}): UnifiedMessage {
  const reactions = message.reactions ?? [];

  if (hasReaction) {
    return {
      ...message,
      reactions: reactions.filter(
        (reaction) =>
          reaction.emoji !== emoji || reaction.userId !== currentUserId,
      ),
    };
  }

  return {
    ...message,
    reactions: [
      ...reactions,
      {
        createdAt: new Date().toISOString(),
        emoji,
        messageId: message.id,
        user: currentUserParticipant,
        userId: currentUserId,
      },
    ],
  };
}
