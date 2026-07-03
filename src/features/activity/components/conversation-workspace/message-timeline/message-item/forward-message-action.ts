import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { showAppSuccessToast } from "@/shared/lib/app-toast";
import { showAppErrorToast } from "@/shared/lib/error-toast";
import type {
  ForwardMessageDialogProps,
  ForwardMessageHandler,
  ForwardTarget,
} from "./forward-message-dialog.types";

export async function runForwardMessageAction({
  messages,
  onForward,
  onForwardComplete,
  onOpenChange,
  setPendingTargetId,
  target,
}: {
  messages: UnifiedMessage[];
  onForward: ForwardMessageHandler;
  onForwardComplete: ForwardMessageDialogProps["onForwardComplete"];
  onOpenChange: ForwardMessageDialogProps["onOpenChange"];
  setPendingTargetId: (targetId: string | null) => void;
  target: ForwardTarget;
}) {
  setPendingTargetId(target.chatId);

  try {
    await forwardMessagesSequentially({
      messages,
      onForward,
      targetChatId: target.chatId,
    });

    showForwardSuccessToast({
      messageCount: messages.length,
      targetTitle: target.title,
    });
    completeForwardDialog({ onForwardComplete, onOpenChange });
  } catch (error) {
    showForwardErrorToast(error);
  } finally {
    setPendingTargetId(null);
  }
}

function forwardMessagesSequentially({
  messages,
  onForward,
  targetChatId,
}: {
  messages: UnifiedMessage[];
  onForward: ForwardMessageHandler;
  targetChatId: string;
}) {
  return messages.reduce<Promise<void>>(
    (previousForward, message) =>
      previousForward.then(() =>
        forwardMessageToTarget({ message, onForward, targetChatId }),
      ),
    Promise.resolve(),
  );
}

async function forwardMessageToTarget({
  message,
  onForward,
  targetChatId,
}: {
  message: UnifiedMessage;
  onForward: ForwardMessageHandler;
  targetChatId: string;
}) {
  const result = await onForward(message, targetChatId);

  if (!result) {
    throw new Error("Forward target is no longer available.");
  }
}

function showForwardSuccessToast({
  messageCount,
  targetTitle,
}: {
  messageCount: number;
  targetTitle: string;
}) {
  showAppSuccessToast(getForwardSuccessMessage({ messageCount, targetTitle }), {
    id: "message-forwarded",
  });
}

function getForwardSuccessMessage({
  messageCount,
  targetTitle,
}: {
  messageCount: number;
  targetTitle: string;
}) {
  return messageCount === 1
    ? `Forwarded to ${targetTitle}.`
    : `Forwarded ${messageCount} messages to ${targetTitle}.`;
}

function showForwardErrorToast(error: unknown) {
  showAppErrorToast(error, {
    fallbackMessage: "We couldn't forward that message.",
  });
}

function completeForwardDialog({
  onForwardComplete,
  onOpenChange,
}: Pick<ForwardMessageDialogProps, "onForwardComplete" | "onOpenChange">) {
  onOpenChange(false);
  onForwardComplete?.();
}
