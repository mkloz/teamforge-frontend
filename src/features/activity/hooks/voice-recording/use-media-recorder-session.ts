import { useEffect, useEffectEvent, useRef } from "react";
import {
  canRecordAudio,
  createAudioRecorder,
  requestAudioStream,
  stopMediaStream,
} from "@/shared/lib/browser-media";
import type {
  RecordingError,
  VoiceRecordingResult,
} from "./voice-recording.types";
import { createVoiceRecordingResult } from "./voice-recording-result";

type AudioRecorder = NonNullable<ReturnType<typeof createAudioRecorder>>;
type StartRecordingBlockReason = "active-recorder" | "not-supported";

interface UseMediaRecorderSessionOptions {
  clearTimer: () => void;
  getDurationSeconds: () => number;
  onError: (error: RecordingError | null) => void;
  onRecordingChange: (isRecording: boolean) => void;
  resetTimer: () => void;
  startTimer: () => void;
}

export function useMediaRecorderSession({
  clearTimer,
  getDurationSeconds,
  onError,
  onRecordingChange,
  resetTimer,
  startTimer,
}: UseMediaRecorderSessionOptions) {
  const mediaRecorderRef = useRef<ReturnType<
    typeof createAudioRecorder
  > | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  function stopStream() {
    stopMediaStream(streamRef.current);
    streamRef.current = null;
  }

  function resetRecorder() {
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    onRecordingChange(false);
    resetTimer();
  }

  const cleanupRecorderSession = useEffectEvent(() => {
    clearTimer();
    stopStream();
    mediaRecorderRef.current?.stop();
  });

  useEffect(() => {
    return () => cleanupRecorderSession();
  }, []);

  async function startRecording() {
    const blockReason = getStartRecordingBlockReason(mediaRecorderRef.current);

    if (blockReason === "active-recorder") {
      return;
    }

    if (blockReason === "not-supported") {
      onError("not-supported");
      return;
    }

    try {
      await startSupportedRecording();
    } catch (error) {
      handleStartRecordingError(error);
    }
  }

  async function startSupportedRecording() {
    onError(null);
    const stream = await requestAudioStream();
    const recorder = createAudioRecorder(stream);

    if (!recorder) {
      handleUnsupportedRecorder(stream);
      return;
    }

    prepareRecordingSession(stream, recorder);
    recorder.start(100);
    onRecordingChange(true);
    startTimer();
  }

  function handleUnsupportedRecorder(stream: MediaStream) {
    stopMediaStream(stream);
    onError("not-supported");
  }

  function prepareRecordingSession(
    stream: MediaStream,
    recorder: AudioRecorder,
  ) {
    streamRef.current = stream;
    mediaRecorderRef.current = recorder;
    chunksRef.current = [];
    recorder.ondataavailable = appendRecordedChunk;
  }

  function appendRecordedChunk(event: BlobEvent) {
    if (event.data.size > 0) {
      chunksRef.current.push(event.data);
    }
  }

  function handleStartRecordingError(error: unknown) {
    stopStream();
    mediaRecorderRef.current = null;

    if (isMicrophonePermissionDenied(error)) {
      onError("permission-denied");
      return;
    }

    onError("unknown");
  }

  function stopRecording(): Promise<VoiceRecordingResult | null> {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;

      if (!recorder || recorder.state === "inactive") {
        resolve(null);
        return;
      }

      const duration = getDurationSeconds();
      clearTimer();

      recorder.onstop = () => {
        const result = createVoiceRecordingResult(
          chunksRef.current,
          recorder.mimeType,
          duration,
        );

        stopStream();
        resetRecorder();
        resolve(result);
      };

      recorder.stop();
    });
  }

  function cancelRecording() {
    const recorder = mediaRecorderRef.current;
    clearTimer();

    if (recorder && recorder.state !== "inactive") {
      recorder.ondataavailable = null;
      recorder.onstop = null;
      recorder.stop();
    }

    stopStream();
    resetRecorder();
  }

  return {
    cancelRecording,
    startRecording,
    stopRecording,
  };
}

function getStartRecordingBlockReason(
  recorder: ReturnType<typeof createAudioRecorder>,
): StartRecordingBlockReason | null {
  if (recorder) {
    return "active-recorder";
  }

  if (!canRecordAudio()) {
    return "not-supported";
  }

  return null;
}

function isMicrophonePermissionDenied(error: unknown) {
  return error instanceof DOMException && error.name === "NotAllowedError";
}
