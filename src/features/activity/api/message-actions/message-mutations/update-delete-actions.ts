import type { ActivityActionContext } from "@/features/activity/api/activity-action-context";
import { runSelectedMessageMutation } from "./run-selected-mutation";
import {
  getMessageDeleteSelection,
  getMessageUpdateSelection,
} from "./selection";
import { deleteMessageInChat, updateMessageInChat } from "./update-delete";

export function updateMessage(
  context: ActivityActionContext,
  kind: "group" | "dm" | null,
  selectedId: string | null,
  messageId: string,
  content: string,
) {
  const selection = getMessageUpdateSelection(kind, selectedId, messageId);

  return runSelectedMessageMutation({
    context,
    getKeyParts: (chatId) => ["message", chatId, messageId, "update"],
    mutation: (chatId, mutationSelection) =>
      updateMessageInChat({
        chatId,
        content,
        context,
        messageId,
        selection: mutationSelection,
      }),
    selection,
  });
}

export function deleteMessage(
  context: ActivityActionContext,
  kind: "group" | "dm" | null,
  selectedId: string | null,
  messageId: string,
) {
  const selection = getMessageDeleteSelection(kind, selectedId, messageId);

  return runSelectedMessageMutation({
    context,
    getKeyParts: (chatId) => ["message", chatId, messageId, "delete"],
    mutation: (chatId, mutationSelection) =>
      deleteMessageInChat({
        chatId,
        context,
        messageId,
        selection: mutationSelection,
      }),
    selection,
  });
}
