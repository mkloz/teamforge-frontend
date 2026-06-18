import { ActivityApi } from "@/features/activity/api/activity.api";
import type { ActivityActionContext } from "@/features/activity/api/activity-action-context";
import { runMappedMessageMutation } from "@/features/activity/api/message-actions/mapped-message-mutation-runner";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { canPinMessage } from "@/features/activity/lib/message-action-capabilities";

const PINNED_MESSAGE_MUTATION_KEY_PART = "pinned";

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

    return runMappedMessageMutation({
      chatId,
      context,
      createOptimisticMessage: (targetMessage) => ({
        ...targetMessage,
        isPinned: true,
      }),
      kind,
      message,
      mutationKeyPart: PINNED_MESSAGE_MUTATION_KEY_PART,
      persist: () => ActivityApi.pinMessage(chatId, message.id),
      selectedId,
      syncPinned: true,
    });
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

    return runMappedMessageMutation({
      chatId,
      context,
      createOptimisticMessage: (targetMessage) => ({
        ...targetMessage,
        isPinned: false,
      }),
      kind,
      message,
      mutationKeyPart: PINNED_MESSAGE_MUTATION_KEY_PART,
      persist: () => ActivityApi.unpinMessage(chatId, message.id),
      selectedId,
      syncPinned: true,
    });
  },
};
