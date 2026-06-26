import type { Dispatch, SetStateAction } from "react";
import type { useVoiceRecording } from "@/features/activity/hooks/use-voice-recording";
import type { ActivitySendMessageInput } from "@/features/activity/lib/activity-contract";

import { getVoiceExtension } from "./message-composer-utils";

interface UseVoiceNoteSenderOptions {
  isDisabled: boolean;
  isOnline: boolean;
  onSend: (input: ActivitySendMessageInput) => Promise<void> | void;
  onOfflineSubmit: () => void;
  onSent: () => void;
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;
  stopRecording: ReturnType<typeof useVoiceRecording>["stopRecording"];
}

type StopRecordingResult = Awaited<
  ReturnType<UseVoiceNoteSenderOptions["stopRecording"]>
>;

export function useVoiceNoteSender({
  isDisabled,
  isOnline,
  onSend,
  onOfflineSubmit,
  onSent,
  setIsSubmitting,
  stopRecording,
}: UseVoiceNoteSenderOptions) {
  return async function handleStopRecording() {
    const result = await stopRecording();

    if (!hasSendableRecordingResult(result, isDisabled)) {
      return;
    }

    if (!isOnline) {
      onOfflineSubmit();
      return;
    }

    const voiceFile = createVoiceNoteFile(result);

    setIsSubmitting(true);

    try {
      await onSend(createVoiceNoteMessageInput(voiceFile, result));
      onSent();
    } catch {
      return;
    } finally {
      setIsSubmitting(false);
    }
  };
}

function hasSendableRecordingResult(
  result: StopRecordingResult,
  isDisabled: boolean,
): result is NonNullable<StopRecordingResult> {
  return Boolean(result && result.durationSeconds > 0 && !isDisabled);
}

function createVoiceNoteFile(result: NonNullable<StopRecordingResult>) {
  const mimeType = result.blob.type || "audio/webm";
  const extension = getVoiceExtension(mimeType);

  return new File([result.blob], `voice-note-${Date.now()}.${extension}`, {
    type: mimeType,
  });
}

function createVoiceNoteMessageInput(
  voiceFile: File,
  result: NonNullable<StopRecordingResult>,
): ActivitySendMessageInput {
  return {
    content: "",
    attachments: [
      {
        file: voiceFile,
        duration: result.durationSeconds,
      },
    ],
  };
}
