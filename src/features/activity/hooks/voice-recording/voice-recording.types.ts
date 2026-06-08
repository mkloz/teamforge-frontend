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
