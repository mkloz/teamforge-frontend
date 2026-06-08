import type { VoiceRecordingResult } from "./voice-recording.types";

export function createVoiceRecordingResult(
  chunks: Blob[],
  mimeType: string,
  durationSeconds: number,
): VoiceRecordingResult {
  const blob = new Blob(chunks, {
    type: mimeType || "audio/webm",
  });

  return {
    blob,
    durationSeconds,
    url: URL.createObjectURL(blob),
  };
}

export function formatRecordingTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
