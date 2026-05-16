import { ActivityApi } from "@/features/activity/api/activity.api";
import type { ActivityActionContext } from "@/features/activity/api/activity-action-context";
import { ActivityMessageCache } from "@/features/activity/api/activity-message-cache";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { canPinMessage } from "@/features/activity/lib/message-action-capabilities";

export const ActivityPinnedMessageActions = {
  async pinMessage(
    context: ActivityActionContext,
    kind: "group" | "dm" | null,
    selectedId: string | null,
    message: UnifiedMessage,
  ) {
    if (!kind || !selectedId || !canPinMessage(message)) {
      return null;
    }

    const chatId = await context.resolveChatId(kind, selectedId);

    if (!chatId) {
      return null;
    }

    const { currentUser, currentUserParticipant } =
      await context.ensureBaseData();
    const participants = await context.resolveParticipants(
      kind,
      selectedId,
      currentUserParticipant,
    );
    const updatedMessage = await ActivityApi.pinMessage(chatId, message.id);
    const mappedMessage = context.mapMessages(
      [updatedMessage],
      participants,
      currentUser.id,
    )[0];

    ActivityMessageCache.replace(chatId, message.id, mappedMessage);
    context.syncPinnedMessage(chatId, mappedMessage);
    ActivityMessageCache.syncChatLastMessageFromMessagesCache(chatId);
    return mappedMessage;
  },

  async unpinMessage(
    context: ActivityActionContext,
    kind: "group" | "dm" | null,
    selectedId: string | null,
    message: UnifiedMessage,
  ) {
    if (!kind || !selectedId || !canPinMessage(message)) {
      return null;
    }

    const chatId = await context.resolveChatId(kind, selectedId);

    if (!chatId) {
      return null;
    }

    const { currentUser, currentUserParticipant } =
      await context.ensureBaseData();
    const participants = await context.resolveParticipants(
      kind,
      selectedId,
      currentUserParticipant,
    );
    const updatedMessage = await ActivityApi.unpinMessage(chatId, message.id);
    const mappedMessage = context.mapMessages(
      [updatedMessage],
      participants,
      currentUser.id,
    )[0];

    ActivityMessageCache.replace(chatId, message.id, mappedMessage);
    context.syncPinnedMessage(chatId, mappedMessage);
    ActivityMessageCache.syncChatLastMessageFromMessagesCache(chatId);
    return mappedMessage;
  },
};
