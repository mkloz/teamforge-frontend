import ky from "ky";
import type { UnifiedAttachment } from "@/features/activity/lib/activity-contract";

export function getDownloadCandidate(
  media: UnifiedAttachment | null,
  isDownloading: boolean,
) {
  if (isDownloading) {
    return null;
  }

  return media;
}

export async function downloadMedia(media: UnifiedAttachment) {
  const fileName = getDownloadFileName(media);

  try {
    const blob = await ky.get(media.url, { timeout: 30_000 }).blob();
    const objectUrl = URL.createObjectURL(blob);

    triggerDownload(objectUrl, fileName);
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  } catch {
    triggerDownload(media.url, fileName, { openInNewTab: true });
  }
}

function triggerDownload(
  url: string,
  fileName: string,
  options: { openInNewTab?: boolean } = {},
) {
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.rel = "noopener noreferrer";

  if (options.openInNewTab) {
    link.target = "_blank";
  }

  document.body.append(link);
  link.click();
  link.remove();
}

function getDownloadFileName(media: UnifiedAttachment) {
  const name = media.name?.trim();
  const extension = getExtensionFromMimeType(media.mimeType);

  if (name) {
    return hasFileExtension(name) ? name : `${name}${extension}`;
  }

  return `teamforge-media-${media.id}${extension}`;
}

function hasFileExtension(name: string) {
  return /\.[a-z0-9]{2,5}$/i.test(name);
}

function getExtensionFromMimeType(mimeType: string | null) {
  if (!mimeType) {
    return "";
  }

  const subtype = mimeType.split("/")[1]?.split(";")[0]?.trim();

  if (!subtype) {
    return "";
  }

  return `.${subtype === "jpeg" ? "jpg" : subtype}`;
}
