const GIF_FILE_PATTERN = /\.gif(?:[?#]|$)/i;
const VIDEO_FILE_PATTERN = /\.(?:m4v|mov|mp4|webm)(?:[?#]|$)/i;

function hasFileNamePattern(value: string | null | undefined, pattern: RegExp) {
  return Boolean(value && pattern.test(value));
}

export function hasGifFileName(value: string | null | undefined) {
  return hasFileNamePattern(value, GIF_FILE_PATTERN);
}

export function hasVideoFileName(value: string | null | undefined) {
  return hasFileNamePattern(value, VIDEO_FILE_PATTERN);
}
