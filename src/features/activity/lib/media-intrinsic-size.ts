export interface MediaIntrinsicSize {
  width: number;
  height: number;
  aspectRatio: number;
}

const mediaIntrinsicSizeCache = new Map<string, MediaIntrinsicSize>();
const MAX_MEDIA_INTRINSIC_SIZE_CACHE_ITEMS = 300;

export function getCachedMediaIntrinsicSize(mediaId: string) {
  return mediaIntrinsicSizeCache.get(mediaId) ?? null;
}

export function cacheMediaIntrinsicSize(
  mediaId: string,
  width: number,
  height: number,
) {
  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  ) {
    return null;
  }

  const nextSize = {
    width,
    height,
    aspectRatio: width / height,
  };

  if (
    !mediaIntrinsicSizeCache.has(mediaId) &&
    mediaIntrinsicSizeCache.size >= MAX_MEDIA_INTRINSIC_SIZE_CACHE_ITEMS
  ) {
    const oldestKey = mediaIntrinsicSizeCache.keys().next().value;

    if (oldestKey) {
      mediaIntrinsicSizeCache.delete(oldestKey);
    }
  }

  mediaIntrinsicSizeCache.set(mediaId, nextSize);
  return nextSize;
}
