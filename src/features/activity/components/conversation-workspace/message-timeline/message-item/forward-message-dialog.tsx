import { useState } from "react";
import { getActivityPopupPanelClass } from "@/features/activity/components/activity-popup-styles";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import {
  ForwardDialogBody,
  ForwardDialogHeader,
} from "./forward-dialog-render-parts";
import { runForwardMessageAction } from "./forward-message-action";
import type {
  ForwardMessageDialogProps,
  ForwardTarget,
} from "./forward-message-dialog.types";
import { useForwardDialogModel } from "./use-forward-dialog-model";

export function ForwardMessageDialog({
  message,
  messages,
  isOnline = true,
  onForward,
  onForwardComplete,
  onOpenChange,
  open,
}: ForwardMessageDialogProps) {
  const [pendingTargetId, setPendingTargetId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const messagesToForward = getMessagesToForward({ message, messages });
  const sourceChatId = getForwardSourceChatId(messagesToForward);
  const forwardDialogModel = useForwardDialogModel({
    isOnline,
    sourceChatId,
  });

  async function handleForward(target: ForwardTarget) {
    if (!isOnline || !onForward || messagesToForward.length === 0) {
      return;
    }

    await runForwardMessageAction({
      messages: messagesToForward,
      onForward,
      onForwardComplete,
      onOpenChange,
      setPendingTargetId,
      target,
    });
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setQuery("");
    }
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={getActivityPopupPanelClass(
          "flex max-h-[min(36rem,calc(100dvh-1.5rem))] w-[calc(100%-1.5rem)] max-w-md flex-col gap-0 overflow-hidden rounded-2xl p-0 [&>button]:top-4 [&>button]:right-4 [&>button]:shadow-none",
        )}
      >
        <ForwardDialogHeader
          messageCount={messagesToForward.length}
          onQueryChange={setQuery}
          query={query}
        />
        <ForwardDialogBody
          forwardDialogModel={forwardDialogModel}
          isOnline={isOnline}
          onForward={handleForward}
          pendingTargetId={pendingTargetId}
          query={query}
        />
      </DialogContent>
    </Dialog>
  );
}

function getMessagesToForward({
  message,
  messages,
}: Pick<ForwardMessageDialogProps, "message" | "messages">) {
  return messages ?? (message ? [message] : []);
}

function getForwardSourceChatId(
  messagesToForward: NonNullable<ForwardMessageDialogProps["messages"]>,
) {
  return messagesToForward[0]?.chatId ?? "";
}
