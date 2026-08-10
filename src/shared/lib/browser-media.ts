import { scenarioRuntime } from "virtual:scenario-runtime";
import { getBrowserNavigator } from "@/shared/lib/browser-environment";

const SUPPORTED_AUDIO_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/mp4",
];

function canRequestAudioStream() {
  return (
    scenarioRuntime.allows("media") &&
    typeof getBrowserNavigator()?.mediaDevices?.getUserMedia === "function"
  );
}

export function canRecordAudio() {
  return canRequestAudioStream() && typeof MediaRecorder !== "undefined";
}

export async function requestAudioStream() {
  const mediaDevices = getBrowserNavigator()?.mediaDevices;

  if (!mediaDevices) {
    throw new Error("Audio recording is unavailable in this browser.");
  }

  return mediaDevices.getUserMedia({ audio: true });
}

function getSupportedAudioRecordingMimeType() {
  if (typeof MediaRecorder === "undefined") {
    return "";
  }

  for (const type of SUPPORTED_AUDIO_MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return "";
}

export function createAudioRecorder(stream: MediaStream) {
  if (typeof MediaRecorder === "undefined") {
    return null;
  }

  const mimeType = getSupportedAudioRecordingMimeType();

  return new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
}

export function stopMediaStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => {
    track.stop();
  });
}
