import { cn } from "@/shared/lib/utils";

import { syncCompleteImage, syncForwardedImageRef } from "./cache";
import type { ImageElementProps } from "./types";

function getImageClassName({
  className,
  isLoading,
  showLoadingState,
}: {
  className?: string;
  isLoading: boolean;
  showLoadingState: boolean;
}) {
  return cn(
    "size-full object-cover transition-all duration-700 ease-out",
    showLoadingState && isLoading ? "blur-sm" : "blur-none",
    className,
  );
}

export function ImageElement({
  actualSrc,
  alt,
  className,
  forwardedRef,
  imageRef,
  isLoading,
  onCompleteImageLoad,
  renderImage,
  showLoadingState,
  ...props
}: ImageElementProps) {
  if (!renderImage) {
    return null;
  }

  return (
    <img
      ref={(node) => {
        imageRef.current = node;
        syncForwardedImageRef(forwardedRef, node);

        syncCompleteImage({
          actualSrc,
          image: node,
          onLoaded: onCompleteImageLoad,
        });
      }}
      src={actualSrc}
      alt={alt}
      className={getImageClassName({
        className,
        isLoading,
        showLoadingState,
      })}
      {...props}
    />
  );
}
