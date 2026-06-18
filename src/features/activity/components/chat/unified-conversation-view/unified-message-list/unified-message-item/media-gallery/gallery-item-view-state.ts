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

export function getGalleryItemViewState({
  cachedSize,
  count,
  hasGifError,
  hasGifLoaded,
  imageState,
  index,
  media,
}: GetGalleryItemViewStateInput) {
  const isVideo = media.type === "VIDEO";
  const isGif = isGifAttachment(media);
  const isVideoBackedGif = isGifVideoAttachment(media);
  const hasVideoPoster = Boolean(media.thumbnailUrl);
  const shouldLoadImage =
    !isVideoBackedGif &&
    (media.type === "IMAGE" || media.type === "GIF" || hasVideoPoster);
  const visibleState = getVisibleMediaState({
    hasGifError,
    hasGifLoaded,
    imageState,
    isVideoBackedGif,
    shouldLoadImage,
  });
  const singleAspectRatioStyle =
    count === 1 && cachedSize
      ? {
          aspectRatio: `${cachedSize.width} / ${cachedSize.height}`,
        }
      : undefined;

  return {
    ariaLabel: `Open ${
      isGif ? "GIF" : media.type === "VIDEO" ? "video" : "image"
    } attachment ${index + 1}`,
    isGif,
    isLastVisible: index === 3 && count > 4,
    isVideo,
    isVideoBackedGif,
    shouldLoadImage,
    singleAspectRatioStyle,
    visibleState,
  };
}

function getVisibleMediaState({
  hasGifError,
  hasGifLoaded,
  imageState,
  isVideoBackedGif,
  shouldLoadImage,
}: {
  hasGifError: boolean;
  hasGifLoaded: boolean;
  imageState: ImageLoadState;
  isVideoBackedGif: boolean;
  shouldLoadImage: boolean;
}): ImageLoadState {
  if (isVideoBackedGif) {
    if (hasGifError) {
      return "error";
    }

    return hasGifLoaded ? "loaded" : "loading";
  }

  return shouldLoadImage ? imageState : "loaded";
}
