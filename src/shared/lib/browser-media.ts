const SUPPORTED_AUDIO_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/mp4",
];

export function canRequestAudioStream() {
  return Boolean(navigator.mediaDevices?.getUserMedia);
}

export function canRecordAudio() {
  return canRequestAudioStream() && typeof MediaRecorder !== "undefined";
}

export async function requestAudioStream() {
  return navigator.mediaDevices.getUserMedia({ audio: true });
}

export function getSupportedAudioRecordingMimeType() {
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
