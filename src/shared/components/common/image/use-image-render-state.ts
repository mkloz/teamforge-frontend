import {
  type SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getImageSourceKey,
  rememberLoadedImage,
  syncCompleteMountedImage,
} from "@/shared/components/common/image/cache";
import {
  getImageRenderState,
  getInitialImageStatusState,
  getResetImageStatusState,
  hasImageStatusInputChanged,
  shouldRenderImage,
  updateImageErrorState,
} from "@/shared/components/common/image/state";
import type { ImageProps } from "@/shared/components/common/image/types";

interface UseImageRenderStateInput {
  fallbackSrc: ImageProps["fallbackSrc"];
  onError: ImageProps["onError"];
  onLoad: ImageProps["onLoad"];
  showLoadingState: boolean;
  src: ImageProps["src"];
}

export function useImageRenderState({
  fallbackSrc,
  onError,
  onLoad,
  showLoadingState,
  src,
}: UseImageRenderStateInput) {
  const imageSrc = getImageSourceKey(src) ?? undefined;
  const isSrcProvided = Boolean(imageSrc);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageState, setImageState] = useState(() =>
    getInitialImageStatusState({
      imageSrc,
      isSrcProvided,
      showLoadingState,
    }),
  );

  let currentImageState = imageState;
  const nextImageInput = {
    imageSrc,
    isSrcProvided,
    showLoadingState,
  };

  if (hasImageStatusInputChanged(imageState, nextImageInput)) {
    currentImageState = getResetImageStatusState(nextImageInput);
    setImageState(currentImageState);
  }

  const { error, fallbackFailed, isLoading } = currentImageState;
  const { actualSrc, showFallback, showLoader } = getImageRenderState({
    error,
    fallbackFailed,
    fallbackSrc,
    imageSrc,
    isLoading,
    showLoadingState,
  });

  const markImageLoaded = useCallback(() => {
    setImageState((current) =>
      current.isLoading ? { ...current, isLoading: false } : current,
    );
  }, []);

  useEffect(() => {
    syncCompleteMountedImage({
      actualSrc,
      image: imageRef.current,
      isSrcProvided,
      onLoaded: markImageLoaded,
    });
  }, [actualSrc, isSrcProvided, markImageLoaded]);

  const handleLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    rememberLoadedImage(event.currentTarget, actualSrc);
    markImageLoaded();
    onLoad?.(event);
  };

  const handleError = (event: SyntheticEvent<HTMLImageElement>) => {
    setImageState((current) => ({
      ...current,
      ...updateImageErrorState({ actualSrc, fallbackSrc }),
      isLoading: false,
    }));
    onError?.(event);
  };

  return {
    actualSrc,
    fallbackFailed,
    handleError,
    handleLoad,
    imageRef,
    isLoading,
    markImageLoaded,
    renderImage: shouldRenderImage({ fallbackFailed, isSrcProvided }),
    showFallback,
    showLoader,
  };
}
