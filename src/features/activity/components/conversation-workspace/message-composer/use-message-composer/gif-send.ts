import type {
  ActivityOutgoingGifAttachment,
  ActivitySendMessageInput,
} from "@/features/activity/lib/activity-contract";
import { warnInDevelopment } from "@/shared/lib/development-warning";
import { OFFLINE_MESSAGE_DESCRIPTION } from "./constants";
import type { OfflineActionGuard } from "./types";

export async function sendComposerGif({
  gif,
  guardOfflineAction,
  isGifSendDisabled,
  onSend,
  onSent,
  setIsSendingGif,
}: {
  gif: ActivityOutgoingGifAttachment;
  guardOfflineAction: OfflineActionGuard;
  isGifSendDisabled: boolean;
  onSend: (input: ActivitySendMessageInput) => Promise<void> | void;
  onSent: () => void;
  setIsSendingGif: (isSendingGif: boolean) => void;
}) {
  if (
    guardOfflineAction({
      id: "chat-gif-offline",
      description: OFFLINE_MESSAGE_DESCRIPTION,
    })
  ) {
    return;
  }

  if (isGifSendDisabled) {
    return;
  }

  setIsSendingGif(true);

  try {
    await onSend({
      content: "",
      gif,
    });
    onSent();
  } catch (error) {
    warnInDevelopment("GIF message send failed.", error);
  } finally {
    setIsSendingGif(false);
  }
}
