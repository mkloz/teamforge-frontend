import { hasLoadedImageSource } from "./cache";
import type {
  ImageRenderState,
  ImageStatusInput,
  ImageStatusState,
} from "./types";

function getInitialImageLoadingState({
  imageSrc,
  isSrcProvided,
  showLoadingState,
}: {
  imageSrc?: string;
  isSrcProvided: boolean;
  showLoadingState: boolean;
}) {
  return showLoadingState && isSrcProvided && !hasLoadedImageSource(imageSrc);
}

function shouldShowFallback({
  fallbackFailed,
  isSrcProvided,
}: {
  fallbackFailed: boolean;
  isSrcProvided: boolean;
}) {
  return fallbackFailed || !isSrcProvided;
}

function shouldShowLoader({
  fallbackFailed,
  isLoading,
  isSrcProvided,
  showLoadingState,
}: {
  fallbackFailed: boolean;
  isLoading: boolean;
  isSrcProvided: boolean;
  showLoadingState: boolean;
}) {
  return showLoadingState && isLoading && isSrcProvided && !fallbackFailed;
}

export function shouldRenderImage({
  fallbackFailed,
  isSrcProvided,
}: {
  fallbackFailed: boolean;
  isSrcProvided: boolean;
}) {
  return isSrcProvided && !fallbackFailed;
}

export function getImageRenderState({
  error,
  fallbackFailed,
  fallbackSrc,
  imageSrc,
  isLoading,
  showLoadingState,
}: {
  error: boolean;
  fallbackFailed: boolean;
  fallbackSrc?: string;
  imageSrc?: string;
  isLoading: boolean;
  showLoadingState: boolean;
}): ImageRenderState {
  const isSrcProvided = Boolean(imageSrc);
  const actualSrc = error && fallbackSrc ? fallbackSrc : imageSrc;

  return {
    actualSrc,
    isSrcProvided,
    showFallback: shouldShowFallback({ fallbackFailed, isSrcProvided }),
    showLoader: shouldShowLoader({
      fallbackFailed,
      isLoading,
      isSrcProvided,
      showLoadingState,
    }),
  };
}

function shouldRetryWithFallback({
  actualSrc,
  fallbackSrc,
}: {
  actualSrc?: string;
  fallbackSrc?: string;
}) {
  return Boolean(fallbackSrc && actualSrc !== fallbackSrc);
}

export function updateImageErrorState({
  actualSrc,
  fallbackSrc,
}: {
  actualSrc?: string;
  fallbackSrc?: string;
}): Pick<ImageStatusState, "error" | "fallbackFailed"> {
  if (shouldRetryWithFallback({ actualSrc, fallbackSrc })) {
    return { error: true, fallbackFailed: false };
  }

  return { error: true, fallbackFailed: true };
}

export function getInitialImageStatusState({
  imageSrc,
  isSrcProvided,
  showLoadingState,
}: ImageStatusInput): ImageStatusState {
  return {
    error: false,
    fallbackFailed: false,
    imageSrc,
    isLoading: getInitialImageLoadingState({
      imageSrc,
      isSrcProvided,
      showLoadingState,
    }),
    isSrcProvided,
    showLoadingState,
  };
}

export function getResetImageStatusState({
  imageSrc,
  isSrcProvided,
  showLoadingState,
}: ImageStatusInput): ImageStatusState {
  return {
    error: false,
    fallbackFailed: false,
    imageSrc,
    isLoading: getInitialImageLoadingState({
      imageSrc,
      isSrcProvided,
      showLoadingState,
    }),
    isSrcProvided,
    showLoadingState,
  };
}

export function hasImageStatusInputChanged(
  state: ImageStatusState,
  input: ImageStatusInput,
) {
  return (
    state.imageSrc !== input.imageSrc ||
    state.isSrcProvided !== input.isSrcProvided ||
    state.showLoadingState !== input.showLoadingState
  );
}
