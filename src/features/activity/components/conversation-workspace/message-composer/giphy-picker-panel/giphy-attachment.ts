import type { IGif } from "@giphy/js-types";

import type { ActivityOutgoingGifAttachment } from "@/features/activity/lib/activity-contract";

function toNumber(value: number | string | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) ? parsed : null;
}

export function toOutgoingGiphyAttachment(
  gif: IGif,
): ActivityOutgoingGifAttachment | null {
  const rendition = getPreferredGiphyRendition(gif);
  const videoUrl = getGiphyVideoUrl(gif, rendition);

  if (!videoUrl) {
    return null;
  }

  return {
    height: toNumber(rendition?.height),
    previewUrl: getGiphyPreviewUrl(gif, rendition),
    provider: "giphy",
    providerId: String(gif.id),
    title: getGiphyAttachmentTitle(gif),
    url: videoUrl,
    width: toNumber(rendition?.width),
  };
}

function getPreferredGiphyRendition(gif: IGif) {
  return gif.images.fixed_width ?? gif.images.fixed_height;
}

type PreferredGiphyRendition = ReturnType<typeof getPreferredGiphyRendition>;

function getGiphyVideoUrl(gif: IGif, rendition: PreferredGiphyRendition) {
  return getFirstAvailableGiphyUrl([
    rendition?.mp4,
    gif.images.downsized_small?.mp4,
    gif.images.original_mp4?.mp4,
    gif.images.original?.mp4,
  ]);
}

function getGiphyPreviewUrl(gif: IGif, rendition: PreferredGiphyRendition) {
  return getFirstAvailableGiphyUrl([
    rendition?.webp,
    gif.images.fixed_width_still?.url,
    gif.images.preview_gif?.url,
    gif.images.original_still?.url,
  ]);
}

function getFirstAvailableGiphyUrl(urls: Array<string | undefined>) {
  return urls.find((url) => Boolean(url)) ?? null;
}

function getGiphyAttachmentTitle(gif: IGif) {
  return (gif.title || "GIPHY GIF").slice(0, 255);
}
