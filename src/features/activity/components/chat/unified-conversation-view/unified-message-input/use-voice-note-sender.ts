import type { Dispatch, SetStateAction } from "react";

import type { ActivitySendMessageInput } from "@/features/activity/lib/activity-contract";
import type { useVoiceRecording } from "@/features/activity/hooks/use-voice-recording";

import { getVoiceExtension } from "./message-composer-utils";

interface UseVoiceNoteSenderOptions {
  isDisabled: boolean;
  onSend: (input: ActivitySendMessageInput) => Promise<void> | void;
  onSent: () => void;
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;
  stopRecording: ReturnType<typeof useVoiceRecording>["stopRecording"];
}

export function useVoiceNoteSender({
  isDisabled,
  onSend,
  onSent,
  setIsSubmitting,
  stopRecording,
}: UseVoiceNoteSenderOptions) {
  return async function handleStopRecording() {
    const result = await stopRecording();

    if (!result || result.durationSeconds <= 0 || isDisabled) {
      return;
    }

    const mimeType = result.blob.type || "audio/webm";
    const extension = getVoiceExtension(mimeType);
    const voiceFile = new File(
      [result.blob],
      `voice-note-${Date.now()}.${extension}`,
      {
        type: mimeType,
      },
    );

    setIsSubmitting(true);

    try {
      await onSend({
        content: "",
        attachments: [
          {
            file: voiceFile,
            duration: result.durationSeconds,
          },
        ],
      });
      onSent();
    } catch {
      return;
    } finally {
      setIsSubmitting(false);
    }
  };
}
