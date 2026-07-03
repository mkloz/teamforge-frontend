import type { Ref } from "react";

const loadedImageSources = new Set<string>();

export function getImageSourceKey(src?: string | null) {
  const key = src?.trim();
  return key || null;
}

export function hasLoadedImageSource(src?: string | null) {
  const key = getImageSourceKey(src);
  return Boolean(key && loadedImageSources.has(key));
}

function rememberLoadedImageSource(src?: string | null) {
  const key = getImageSourceKey(src);

  if (key) {
    loadedImageSources.add(key);
  }
}

export function rememberLoadedImage(image: HTMLImageElement, propSrc?: string) {
  rememberLoadedImageSource(propSrc);
  rememberLoadedImageSource(image.currentSrc);
  rememberLoadedImageSource(image.src);
}

function isCompleteImage(
  image: HTMLImageElement | null,
): image is HTMLImageElement {
  return Boolean(image?.complete && image.naturalWidth > 0);
}

export function syncCompleteImage({
  actualSrc,
  image,
  onLoaded,
}: {
  actualSrc?: string;
  image: HTMLImageElement | null;
  onLoaded: () => void;
}) {
  if (!isCompleteImage(image)) {
    return;
  }

  rememberLoadedImage(image, actualSrc);
  onLoaded();
}

export function syncCompleteMountedImage({
  actualSrc,
  image,
  isSrcProvided,
  onLoaded,
}: {
  actualSrc?: string;
  image: HTMLImageElement | null;
  isSrcProvided: boolean;
  onLoaded: () => void;
}) {
  if (!isSrcProvided) {
    return;
  }

  syncCompleteImage({ actualSrc, image, onLoaded });
}

export function syncForwardedImageRef(
  ref: Ref<HTMLImageElement> | undefined,
  node: HTMLImageElement | null,
) {
  if (typeof ref === "function") {
    ref(node);
    return;
  }

  if (ref) {
    ref.current = node;
  }
}
