export const API_MAX_PAGE = 500;
const API_MAX_LIMIT = 100;

export const EXPLORE_MAX_CATEGORY_FILTERS = 12;
export const EXPLORE_MIN_DISTANCE_KM = 2;
export const EXPLORE_MAX_DISTANCE_KM = 50;
export const EXPLORE_DEFAULT_DISTANCE_KM = 15;

export const IMAGE_UPLOAD_MAX_SIZE_BYTES = 30 * 1024 * 1024;
export const CHAT_ATTACHMENT_MAX_SIZE_BYTES = 40 * 1024 * 1024;
export const CHAT_ATTACHMENT_MAX_SIZE_LABEL = "40 MB";
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

export function clampApiPage(page: number) {
  return Math.min(Math.max(Math.trunc(page), 1), API_MAX_PAGE);
}

export function clampApiLimit(limit: number) {
  return Math.min(Math.max(Math.trunc(limit), 1), API_MAX_LIMIT);
}
