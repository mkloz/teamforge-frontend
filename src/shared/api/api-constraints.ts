export const API_MAX_PAGE = 500;
export const API_MAX_LIMIT = 100;

export const EXPLORE_MAX_CATEGORY_FILTERS = 12;

export const IMAGE_UPLOAD_MAX_SIZE_BYTES = 30 * 1024 * 1024;
export const CHAT_ATTACHMENT_MAX_SIZE_BYTES = 40 * 1024 * 1024;
export const CHAT_MAX_ATTACHMENTS = 10;
export const CHAT_ATTACHMENT_MAX_DURATION_SECONDS = 12 * 60 * 60;

export const IMAGE_UPLOAD_ACCEPTED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

export const IMAGE_UPLOAD_ACCEPTED_EXTENSIONS = [
  ".jpeg",
  ".jpg",
  ".png",
  ".webp",
] as const;

export const CHAT_ATTACHMENT_ACCEPTED_TYPES = [
  ...IMAGE_UPLOAD_ACCEPTED_TYPES,
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip",
  "application/x-zip-compressed",
  "text/plain",
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/webm",
  "audio/ogg",
  "audio/wav",
  "audio/x-wav",
] as const;

export const CHAT_ATTACHMENT_ACCEPTED_EXTENSIONS = [
  ...IMAGE_UPLOAD_ACCEPTED_EXTENSIONS,
  ".doc",
  ".docx",
  ".m4a",
  ".mp3",
  ".ogg",
  ".pdf",
  ".ppt",
  ".pptx",
  ".txt",
  ".wav",
  ".webm",
  ".xls",
  ".xlsx",
  ".zip",
] as const;

export function clampApiPage(page: number) {
  return Math.min(Math.max(Math.trunc(page), 1), API_MAX_PAGE);
}

export function clampApiLimit(limit: number) {
  return Math.min(Math.max(Math.trunc(limit), 1), API_MAX_LIMIT);
}
