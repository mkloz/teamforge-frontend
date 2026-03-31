import { useState, useRef, useEffect, useCallback } from "react";

export interface VoiceRecordingResult {
  blob: Blob;
  durationSeconds: number;
  url: string;
}

export type RecordingError =
  | "permission-denied"
  | "not-supported"
  | "already-recording"
  | "unknown";

export interface UseVoiceRecordingReturn {
  isRecording: boolean;
  recordingTime: number;
  recordingError: RecordingError | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<VoiceRecordingResult | null>;
  cancelRecording: () => void;
  formatRecordingTime: (seconds: number) => string;
}

/**
 * useVoiceRecording — drives the browser MediaRecorder API for voice messages.
 *
 * Behaviour:
 * - Requests mic permission on first call to startRecording().
 * - Accumulates audio chunks in a ref; resolves the result blob on stop.
 * - Cleans up streams and timers on cancel or unmount.
 * - Compatible with press-and-hold (mousedown/touchstart → mouseup/touchend).
 *
 * Supported formats (in priority order): audio/webm;codecs=opus, audio/webm,
 * audio/ogg;codecs=opus, audio/mp4 (Safari). Falls back to browser default.
 */
export function useVoiceRecording(): UseVoiceRecordingReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingError, setRecordingError] = useState<RecordingError | null>(
    null,
  );

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // ── resolve the best supported MIME type ──────────────────────────────────
  const getSupportedMimeType = useCallback((): string => {
    const candidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/mp4",
    ];
    for (const type of candidates) {
      if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return ""; // let the browser pick
  }, []);

  // ── cleanup helpers ────────────────────────────────────────────────────────
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
      stopStream();
      mediaRecorderRef.current?.stop();
    };
  }, [clearTimer, stopStream]);

  // ── startRecording ─────────────────────────────────────────────────────────
  const startRecording = useCallback(async (): Promise<void> => {
    if (mediaRecorderRef.current) return; // already recording

    if (!navigator.mediaDevices?.getUserMedia) {
      setRecordingError("not-supported");
      return;
    }

    try {
      setRecordingError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.start(100); // collect chunks every 100 ms for smooth waveform
      startTimeRef.current = Date.now();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(
          Math.floor((Date.now() - startTimeRef.current) / 1000),
        );
      }, 1000);
    } catch (err) {
      stopStream();
      mediaRecorderRef.current = null;
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setRecordingError("permission-denied");
      } else {
        setRecordingError("unknown");
      }
    }
  }, [getSupportedMimeType, stopStream]);

  // ── stopRecording — returns the captured blob ──────────────────────────────
  const stopRecording =
    useCallback((): Promise<VoiceRecordingResult | null> => {
      return new Promise((resolve) => {
        const recorder = mediaRecorderRef.current;
        if (!recorder || recorder.state === "inactive") {
          resolve(null);
          return;
        }

        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        clearTimer();

        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, {
            type: recorder.mimeType || "audio/webm",
          });
          const url = URL.createObjectURL(blob);
          stopStream();
          mediaRecorderRef.current = null;
          chunksRef.current = [];
          setIsRecording(false);
          setRecordingTime(0);
          resolve({ blob, durationSeconds: duration, url });
        };

        recorder.stop();
      });
    }, [clearTimer, stopStream]);

  // ── cancelRecording — discard the recording ────────────────────────────────
  const cancelRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    clearTimer();

    if (recorder && recorder.state !== "inactive") {
      recorder.ondataavailable = null;
      recorder.onstop = null;
      recorder.stop();
    }

    stopStream();
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    setIsRecording(false);
    setRecordingTime(0);
  }, [clearTimer, stopStream]);

  // ── formatRecordingTime ────────────────────────────────────────────────────
  const formatRecordingTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

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
