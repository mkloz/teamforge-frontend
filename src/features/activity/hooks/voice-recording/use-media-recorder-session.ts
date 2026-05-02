import { useEffect, useEffectEvent, useRef } from "react";

import { createVoiceRecordingResult } from "./voice-recording-result";
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
    if (mediaRecorderRef.current) {
      return;
    }

    if (!canRecordAudio()) {
      onError("not-supported");
      return;
    }

    try {
      onError(null);
      const stream = await requestAudioStream();
      const recorder = createAudioRecorder(stream);

      if (!recorder) {
        stopMediaStream(stream);
        onError("not-supported");
        return;
      }

      streamRef.current = stream;
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.start(100);
      onRecordingChange(true);
      startTimer();
    } catch (error) {
      stopStream();
      mediaRecorderRef.current = null;

      if (error instanceof DOMException && error.name === "NotAllowedError") {
        onError("permission-denied");
        return;
      }

      onError("unknown");
    }
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
