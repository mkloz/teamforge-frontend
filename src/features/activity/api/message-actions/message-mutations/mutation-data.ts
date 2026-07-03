import type { ActivityActionContext } from "@/features/activity/api/activity-action-context";
import { applyMappedMessageCacheUpdate } from "@/features/activity/api/message-actions/message-cache-commit";
import type { MessageApi } from "@/shared/schemas";
import type { MessageSelectionContext } from "./types";

export async function getMessageMutationData(
  context: ActivityActionContext,
  selection: MessageSelectionContext,
) {
  const { currentUser, currentUserParticipant } =
    await context.ensureBaseData();
  const participants = await context.resolveParticipants(
    selection.kind,
    selection.selectedId,
    currentUserParticipant,
  );

  return { currentUser, currentUserParticipant, participants };
}

export function applyMappedSelectedMessageUpdate({
  chatId,
  context,
  currentUserId,
  participants,
  rawMessage,
  syncPinned,
  targetMessageId,
}: {
  chatId: string;
  context: ActivityActionContext;
  currentUserId: string;
  participants: Awaited<
    ReturnType<typeof getMessageMutationData>
  >["participants"];
  rawMessage: MessageApi;
  syncPinned: boolean;
  targetMessageId: string;
}) {
  return applyMappedMessageCacheUpdate({
    chatId,
    context,
    currentUserId,
    participants,
    rawMessage,
    syncPinned,
    targetMessageId,
  });
}
