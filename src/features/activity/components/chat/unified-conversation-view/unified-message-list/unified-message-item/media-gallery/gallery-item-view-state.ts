import type { UnifiedAttachment } from "@/features/activity/lib/activity-contract";
import {
  isGifAttachment,
  isGifVideoAttachment,
} from "@/features/activity/lib/gif-attachments";
import type { MediaIntrinsicSize } from "@/features/activity/lib/media-intrinsic-size";
import type { ImageLoadState } from "@/shared/hooks/use-image-state";

interface GetGalleryItemViewStateInput {
  cachedSize: MediaIntrinsicSize | null;
  count: number;
  hasGifError: boolean;
  hasGifLoaded: boolean;
  imageState: ImageLoadState;
  index: number;
  media: UnifiedAttachment;
}

interface GalleryItemMediaFlags {
  hasVideoPoster: boolean;
  isGif: boolean;
  isVideo: boolean;
  isVideoBackedGif: boolean;
  shouldLoadImage: boolean;
}

interface VisibleMediaStateInput {
  hasGifError: boolean;
  hasGifLoaded: boolean;
  imageState: ImageLoadState;
  isVideoBackedGif: boolean;
  shouldLoadImage: boolean;
}

const GALLERY_ATTACHMENT_LABELS: Partial<
  Record<UnifiedAttachment["type"], string>
> = {
  GIF: "GIF",
  IMAGE: "image",
  VIDEO: "video",
};

export function getGalleryItemViewState({
  cachedSize,
  count,
  hasGifError,
  hasGifLoaded,
  imageState,
  index,
  media,
}: GetGalleryItemViewStateInput) {
  const mediaFlags = getGalleryItemMediaFlags(media);
  const visibleState = getVisibleMediaState({
    hasGifError,
    hasGifLoaded,
    imageState,
    isVideoBackedGif: mediaFlags.isVideoBackedGif,
    shouldLoadImage: mediaFlags.shouldLoadImage,
  });

  return {
    ariaLabel: getGalleryItemAriaLabel(media, mediaFlags, index),
    isGif: mediaFlags.isGif,
    isLastVisible: index === 3 && count > 4,
    isVideo: mediaFlags.isVideo,
    isVideoBackedGif: mediaFlags.isVideoBackedGif,
    shouldLoadImage: mediaFlags.shouldLoadImage,
    singleAspectRatioStyle: getSingleAspectRatioStyle(count, cachedSize),
    visibleState,
  };
}

function getGalleryItemMediaFlags(
  media: UnifiedAttachment,
): GalleryItemMediaFlags {
  const isVideoBackedGif = isGifVideoAttachment(media);
  const hasVideoPoster = Boolean(media.thumbnailUrl);

  return {
    hasVideoPoster,
    isGif: isGifAttachment(media),
    isVideo: media.type === "VIDEO",
    isVideoBackedGif,
    shouldLoadImage: shouldLoadGalleryItemImage(media, {
      hasVideoPoster,
      isVideoBackedGif,
    }),
  };
}

function shouldLoadGalleryItemImage(
  media: UnifiedAttachment,
  {
    hasVideoPoster,
    isVideoBackedGif,
  }: Pick<GalleryItemMediaFlags, "hasVideoPoster" | "isVideoBackedGif">,
) {
  return (
    !isVideoBackedGif &&
    (media.type === "IMAGE" || media.type === "GIF" || hasVideoPoster)
  );
}

function getGalleryItemAriaLabel(
  media: UnifiedAttachment,
  mediaFlags: GalleryItemMediaFlags,
  index: number,
) {
  return `Open ${getGalleryItemAttachmentLabel(media, mediaFlags)} attachment ${
    index + 1
  }`;
}

function getGalleryItemAttachmentLabel(
  media: UnifiedAttachment,
  mediaFlags: GalleryItemMediaFlags,
) {
  return mediaFlags.isGif
    ? "GIF"
    : (GALLERY_ATTACHMENT_LABELS[media.type] ?? "image");
}

function getSingleAspectRatioStyle(
  count: number,
  cachedSize: MediaIntrinsicSize | null,
) {
  return count === 1 && cachedSize
    ? {
        aspectRatio: `${cachedSize.width} / ${cachedSize.height}`,
      }
    : undefined;
}

function getVisibleMediaState({
  hasGifError,
  hasGifLoaded,
  imageState,
  isVideoBackedGif,
  shouldLoadImage,
}: VisibleMediaStateInput): ImageLoadState {
  if (isVideoBackedGif) {
    return getVideoBackedGifVisibleState({ hasGifError, hasGifLoaded });
  }

  return shouldLoadImage ? imageState : "loaded";
}

function getVideoBackedGifVisibleState({
  hasGifError,
  hasGifLoaded,
}: Pick<
  VisibleMediaStateInput,
  "hasGifError" | "hasGifLoaded"
>): ImageLoadState {
  if (hasGifError) {
    return "error";
  }

  return hasGifLoaded ? "loaded" : "loading";
}
