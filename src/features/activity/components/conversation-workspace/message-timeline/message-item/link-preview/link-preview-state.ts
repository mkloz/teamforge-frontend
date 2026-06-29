import type { LinkPreview as LinkPreviewData } from "@/shared/schemas";

export function getLinkPreviewHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function hasLinkPreviewImage(data: LinkPreviewData | undefined) {
  return Boolean(data?.image);
}

function hasLinkPreviewMetadata(data: LinkPreviewData | undefined) {
  return [data?.title, data?.description, data?.siteName, data?.favicon].some(
    Boolean,
  );
}

export function getLinkPreviewState(
  fallbackUrl: string,
  data: LinkPreviewData | undefined,
) {
  return {
    hasImage: hasLinkPreviewImage(data),
    hasMetadata: hasLinkPreviewMetadata(data),
    hostname: getLinkPreviewHostname(data?.url ?? fallbackUrl),
  };
}
