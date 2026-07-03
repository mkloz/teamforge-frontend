import type { ActivityActionContext } from "@/features/activity/api/activity-action-context";
import {
  getActivityMutationKey,
  runExclusiveActivityMutation,
} from "@/features/activity/api/activity-mutation-lock";

import { resolveSelectedChatId } from "./selection";
import type { MessageSelectionContext } from "./types";

type MessageMutationKeyPart = boolean | number | string | null | undefined;

interface RunSelectedMessageMutationInput<T> {
  context: ActivityActionContext;
  getKeyParts: (chatId: string) => MessageMutationKeyPart[];
  mutation: (
    chatId: string,
    selection: MessageSelectionContext,
  ) => Promise<T> | T;
  selection: MessageSelectionContext | null;
}

export async function runSelectedMessageMutation<T>({
  context,
  getKeyParts,
  mutation,
  selection,
}: RunSelectedMessageMutationInput<T>) {
  if (!selection) {
    return null;
  }

  const chatId = await resolveSelectedChatId(context, selection);

  if (!chatId) {
    return null;
  }

  return runExclusiveActivityMutation(
    getActivityMutationKey(...getKeyParts(chatId)),
    () => mutation(chatId, selection),
  );
}
