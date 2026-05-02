import type { LinkPreview as LinkPreviewData } from "@/shared/schemas";

export function getLinkPreviewHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function getLinkPreviewState(
  fallbackUrl: string,
  data: LinkPreviewData | undefined,
) {
  return {
    hasImage: Boolean(data?.image),
    hostname: getLinkPreviewHostname(data?.url ?? fallbackUrl),
  };
}
