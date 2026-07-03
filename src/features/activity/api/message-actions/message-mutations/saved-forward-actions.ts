import type { ActivityActionContext } from "@/features/activity/api/activity-action-context";
import {
  getActivityMutationKey,
  runExclusiveActivityMutation,
} from "@/features/activity/api/activity-mutation-lock";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { runSelectedMessageMutation } from "./run-selected-mutation";
import {
  forwardMessageFromChat,
  toggleSavedMessageInChat,
} from "./saved-forward";
import {
  getExistingMessageSelection,
  resolveSelectedChatId,
} from "./selection";

export function toggleSavedMessage(
  context: ActivityActionContext,
  kind: "group" | "dm" | null,
  selectedId: string | null,
  message: UnifiedMessage,
  isSaved: boolean,
) {
  const selection = getExistingMessageSelection(kind, selectedId, message.id);

  return runSelectedMessageMutation({
    context,
    getKeyParts: (chatId) => ["message", chatId, message.id, "saved"],
    mutation: (chatId, mutationSelection) =>
      toggleSavedMessageInChat({
        chatId,
        context,
        isSaved,
        message,
        selection: mutationSelection,
      }),
    selection,
  });
}

export async function forwardMessage(
  context: ActivityActionContext,
  kind: "group" | "dm" | null,
  selectedId: string | null,
  message: UnifiedMessage,
  targetChatId: string,
) {
  const selection = getExistingMessageSelection(kind, selectedId, message.id);

  if (!selection) {
    return null;
  }

  const sourceChatId = await resolveSelectedChatId(context, selection);

  if (!sourceChatId) {
    return null;
  }

  return runExclusiveActivityMutation(
    getActivityMutationKey(
      "message",
      sourceChatId,
      message.id,
      "forward",
      targetChatId,
    ),
    () =>
      forwardMessageFromChat({
        message,
        sourceChatId,
        targetChatId,
      }),
  );
}
