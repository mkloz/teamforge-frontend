import type { Dispatch, SetStateAction } from "react";

import type { useVoiceRecording } from "@/features/activity/hooks/use-voice-recording";
import type { ActivitySendMessageInput } from "@/features/activity/lib/activity-contract";

import { useVoiceNoteSender } from "../use-voice-note-sender";
import { guardComposerMessageOffline } from "./offline-actions";
import { isVoiceNoteSendDisabled } from "./state";
import type { OfflineActionGuard } from "./types";

interface UseComposerVoiceNoteSenderOptions {
  disabled: boolean;
  guardOfflineAction: OfflineActionGuard;
  isOnline: boolean;
  isSendingVoiceNote: boolean;
  onSend: (input: ActivitySendMessageInput) => Promise<void> | void;
  onSent: () => void;
  setIsSendingVoiceNote: Dispatch<SetStateAction<boolean>>;
  stopRecording: ReturnType<typeof useVoiceRecording>["stopRecording"];
  submitIsSubmitting: boolean;
}

export function useComposerVoiceNoteSender({
  disabled,
  guardOfflineAction,
  isOnline,
  isSendingVoiceNote,
  onSend,
  onSent,
  setIsSendingVoiceNote,
  stopRecording,
  submitIsSubmitting,
}: UseComposerVoiceNoteSenderOptions) {
  return useVoiceNoteSender({
    isDisabled: isVoiceNoteSendDisabled({
      disabled,
      isSendingVoiceNote,
      submitIsSubmitting,
    }),
    isOnline,
    onSend,
    onOfflineSubmit: () =>
      guardComposerMessageOffline(guardOfflineAction, {
        id: "chat-voice-note-offline",
      }),
    onSent,
    setIsSubmitting: setIsSendingVoiceNote,
    stopRecording,
  });
}
