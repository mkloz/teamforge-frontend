import type { ActivityMessageActions } from "@/features/activity/components/conversation-workspace/message-selection-toolbar/types";
import { getSavedMessageToggleTargets } from "@/features/activity/components/conversation-workspace/message-selection-toolbar-state";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { showAppInfoToast } from "@/shared/lib/app-toast";
import { showAppErrorToast } from "@/shared/lib/error-toast";

export async function runSelectionMutation({
  fallbackMessage,
  onSuccess,
  run,
  setIsPending,
}: {
  fallbackMessage: string;
  onSuccess: () => void;
  run: () => Promise<void>;
  setIsPending: (isPending: boolean) => void;
}) {
  setIsPending(true);

  try {
    await run();
    onSuccess();
  } catch (error) {
    showAppErrorToast(error, {
      fallbackMessage,
    });
  } finally {
    setIsPending(false);
  }
}

export async function toggleSavedSelectedMessages({
  allSaveableMessagesSaved,
  messageActions,
  savedMessageIds,
  saveableMessages,
}: {
  allSaveableMessagesSaved: boolean;
  messageActions: ActivityMessageActions;
  savedMessageIds: ReadonlySet<string>;
  saveableMessages: UnifiedMessage[];
}) {
  const messagesToToggle = getSavedMessageToggleTargets({
    allSaveableMessagesSaved,
    savedMessageIds,
    saveableMessages,
  });

  await Promise.all(
    messagesToToggle.map((message) =>
      messageActions.toggleSaved(message, allSaveableMessagesSaved),
    ),
  );
}

export async function deleteSelectedMessages({
  messageActions,
  selectedMessages,
}: {
  messageActions: ActivityMessageActions;
  selectedMessages: UnifiedMessage[];
}) {
  await Promise.all(
    selectedMessages.map((message) => messageActions.deleteMessage(message)),
  );
}

export function showSelectionOfflineToastIfNeeded(
  isOnline: boolean,
  action: "delete" | "save",
) {
  if (isOnline) {
    return false;
  }

  showAppInfoToast("You're offline.", {
    id:
      action === "save"
        ? "selected-messages-save-offline"
        : "selected-messages-delete-offline",
    description:
      action === "save"
        ? "Reconnect before updating saved messages."
        : "Reconnect before deleting messages.",
  });

  return true;
}
