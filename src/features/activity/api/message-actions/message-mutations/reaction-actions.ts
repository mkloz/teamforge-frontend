import type { ActivityActionContext } from "@/features/activity/api/activity-action-context";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";

import { toggleReactionInChat } from "./reactions";
import { runSelectedMessageMutation } from "./run-selected-mutation";
import { getMessageReactionSelection } from "./selection";

export function toggleReaction(
  context: ActivityActionContext,
  kind: "group" | "dm" | null,
  selectedId: string | null,
  message: UnifiedMessage,
  emoji: string,
) {
  const selection = getMessageReactionSelection(kind, selectedId, message);

  return runSelectedMessageMutation({
    context,
    getKeyParts: (chatId) => ["message", chatId, message.id, "reaction", emoji],
    mutation: (chatId, mutationSelection) =>
      toggleReactionInChat({
        chatId,
        context,
        emoji,
        message,
        selection: mutationSelection,
      }),
    selection,
  });
}
