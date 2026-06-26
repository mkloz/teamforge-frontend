import { ActivityApi } from "@/features/activity/api/activity.api";
import type { ActivityActionContext } from "@/features/activity/api/activity-action-context";
import { runMappedMessageMutation } from "@/features/activity/api/message-actions/mapped-message-mutation-runner";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { canPinMessage } from "@/features/activity/lib/message-action-capabilities";

const PINNED_MESSAGE_MUTATION_KEY_PART = "pinned";

interface PinnedMessageActionInput {
  context: ActivityActionContext;
  isPinned: boolean;
  kind: "group" | "dm" | null;
  message: UnifiedMessage;
  persist: (
    chatId: string,
    messageId: string,
  ) => ReturnType<typeof ActivityApi.pinMessage>;
  selectedId: string | null;
}

export const ActivityPinnedMessageActions = {
  async pinMessage(
    context: ActivityActionContext,
    kind: "group" | "dm" | null,
    selectedId: string | null,
    message: UnifiedMessage,
  ) {
    return togglePinnedMessage({
      context,
      isPinned: true,
      kind,
      message,
      persist: ActivityApi.pinMessage,
      selectedId,
    });
  },

  async unpinMessage(
    context: ActivityActionContext,
    kind: "group" | "dm" | null,
    selectedId: string | null,
    message: UnifiedMessage,
  ) {
    return togglePinnedMessage({
      context,
      isPinned: false,
      kind,
      message,
      persist: ActivityApi.unpinMessage,
      selectedId,
    });
  },
};

async function togglePinnedMessage({
  context,
  isPinned,
  kind,
  message,
  persist,
  selectedId,
}: PinnedMessageActionInput) {
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
      isPinned,
    }),
    kind,
    message,
    mutationKeyPart: PINNED_MESSAGE_MUTATION_KEY_PART,
    persist: () => persist(chatId, message.id),
    selectedId,
    syncPinned: true,
  });
}
