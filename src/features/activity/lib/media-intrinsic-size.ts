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
  if (!hasUsableIntrinsicDimensions(width, height)) {
    return null;
  }

  const nextSize = createMediaIntrinsicSize(width, height);

  evictOldestIntrinsicSizeIfNeeded(mediaId);

  mediaIntrinsicSizeCache.set(mediaId, nextSize);
  return nextSize;
}

function hasUsableIntrinsicDimensions(width: number, height: number) {
  return (
    Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0
  );
}

function createMediaIntrinsicSize(
  width: number,
  height: number,
): MediaIntrinsicSize {
  return {
    width,
    height,
    aspectRatio: width / height,
  };
}

function evictOldestIntrinsicSizeIfNeeded(mediaId: string) {
  if (!shouldEvictOldestIntrinsicSize(mediaId)) {
    return;
  }

  const oldestKey = mediaIntrinsicSizeCache.keys().next().value;

  if (oldestKey) {
    mediaIntrinsicSizeCache.delete(oldestKey);
  }
}

function shouldEvictOldestIntrinsicSize(mediaId: string) {
  return (
    !mediaIntrinsicSizeCache.has(mediaId) &&
    mediaIntrinsicSizeCache.size >= MAX_MEDIA_INTRINSIC_SIZE_CACHE_ITEMS
  );
}
