import type { ActivityActionContext } from "@/features/activity/api/activity-action-context";
import {
  getActivityMutationKey,
  runExclusiveActivityMutation,
} from "@/features/activity/api/activity-mutation-lock";
import {
  applyMappedMessageCacheUpdate,
  applyMessageCacheUpdate,
} from "@/features/activity/api/message-actions/message-cache-commit";
import { recoverMessageMutationCaches } from "@/features/activity/api/message-actions/message-mutation-recovery";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import type { MessageApi } from "@/shared/schemas";

interface RunMappedMessageMutationInput {
  chatId: string;
  context: ActivityActionContext;
  createOptimisticMessage: (message: UnifiedMessage) => UnifiedMessage;
  kind: "group" | "dm";
  message: UnifiedMessage;
  mutationKeyPart: string;
  persist: () => Promise<MessageApi>;
  selectedId: string;
  syncPinned: boolean;
}

export function runMappedMessageMutation({
  chatId,
  context,
  createOptimisticMessage,
  kind,
  message,
  mutationKeyPart,
  persist,
  selectedId,
  syncPinned,
}: RunMappedMessageMutationInput) {
  return runExclusiveActivityMutation(
    getActivityMutationKey("message", chatId, message.id, mutationKeyPart),
    async () => {
      const { currentUser, currentUserParticipant } =
        await context.ensureBaseData();
      const participants = await context.resolveParticipants(
        kind,
        selectedId,
        currentUserParticipant,
      );
      const optimisticMessage = createOptimisticMessage(message);

      applyMessageCacheUpdate({
        chatId,
        context,
        message: optimisticMessage,
        syncPinned,
        targetMessageId: message.id,
      });

      const updatedMessage = await persist().catch(async (error: unknown) => {
        await recoverMessageMutationCaches({
          chatId,
          kind,
          selectedId,
        });
        throw error;
      });

      return applyMappedMessageCacheUpdate({
        chatId,
        context,
        currentUserId: currentUser.id,
        participants,
        rawMessage: updatedMessage,
        syncPinned,
        targetMessageId: message.id,
      });
    },
  );
}
