import { useState } from "react";

import { useMediaRecorderSession } from "@/features/activity/hooks/voice-recording/use-media-recorder-session";
import { useRecordingTimer } from "@/features/activity/hooks/voice-recording/use-recording-timer";
import type {
  RecordingError,
  UseVoiceRecordingReturn,
} from "@/features/activity/hooks/voice-recording/voice-recording.types";
import { formatRecordingTime } from "@/features/activity/hooks/voice-recording/voice-recording-result";

export type {
  RecordingError,
  UseVoiceRecordingReturn,
  VoiceRecordingResult,
} from "@/features/activity/hooks/voice-recording/voice-recording.types";

export function useVoiceRecording(): UseVoiceRecordingReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState<RecordingError | null>(
    null,
  );
  const {
    clearTimer,
    getDurationSeconds,
    recordingTime,
    resetTimer,
    startTimer,
  } = useRecordingTimer();
  const { cancelRecording, startRecording, stopRecording } =
    useMediaRecorderSession({
      clearTimer,
      getDurationSeconds,
      onError: setRecordingError,
      onRecordingChange: setIsRecording,
      resetTimer,
      startTimer,
    });

  return {
    isRecording,
    recordingTime,
    recordingError,
    startRecording,
    stopRecording,
    cancelRecording,
    formatRecordingTime,
  };
}
