import { cn } from "@/shared/lib/utils";

import {
  DEFAULT_IMAGE_PLACEHOLDER,
  DEFAULT_LOADING_COMPONENT,
} from "./image/image-defaults";
import { ImageElement } from "./image/image-element";
import { OptionalImageFallbackLayer } from "./image/optional-image-fallback-layer";
import { OptionalImageLoaderLayer } from "./image/optional-image-loader-layer";
import type { ImageProps } from "./image/types";
import { useImageRenderState } from "./image/use-image-render-state";

export type { ImageProps } from "./image/types";

export function Image({
  src,
  fallbackSrc,
  alt,
  ref,
  className,
  loadingComponent = DEFAULT_LOADING_COMPONENT,
  loadingClassName,
  noImageComponent = DEFAULT_IMAGE_PLACEHOLDER,
  fallbackComponent = DEFAULT_IMAGE_PLACEHOLDER,
  wrapperClassName,
  showNoImage = true,
  showLoadingState = true,
  style,
  loading = "lazy",
  decoding = "async",
  onLoad,
  onError,
  ...props
}: ImageProps) {
  const {
    actualSrc,
    fallbackFailed,
    handleError,
    handleLoad,
    imageRef,
    isLoading,
    markImageLoaded,
    renderImage,
    showFallback,
    showLoader,
  } = useImageRenderState({
    fallbackSrc,
    onError,
    onLoad,
    showLoadingState,
    src,
  });

  return (
    <div className={cn("relative size-full overflow-hidden", wrapperClassName)}>
      <ImageElement
        {...props}
        actualSrc={actualSrc}
        alt={alt}
        className={className}
        decoding={decoding}
        forwardedRef={ref}
        imageRef={imageRef}
        isLoading={isLoading}
        loading={loading}
        onCompleteImageLoad={markImageLoaded}
        onError={handleError}
        onLoad={handleLoad}
        renderImage={renderImage}
        showLoadingState={showLoadingState}
        style={style}
      />

      <OptionalImageFallbackLayer
        className={className}
        fallbackComponent={fallbackComponent}
        fallbackFailed={fallbackFailed}
        noImageComponent={noImageComponent}
        showFallback={showFallback}
        showNoImage={showNoImage}
      />

      <OptionalImageLoaderLayer
        className={className}
        loadingClassName={loadingClassName}
        loadingComponent={loadingComponent}
        showLoader={showLoader}
      />
    </div>
  );
}

Image.displayName = "Image";
