import type { ImgHTMLAttributes, ReactNode, Ref } from "react";

export interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  fallbackSrc?: string;
  alt: string;
  ref?: Ref<HTMLImageElement>;
  loadingClassName?: string;
  loadingComponent?: ReactNode;
  noImageComponent?: ReactNode;
  fallbackComponent?: ReactNode;
  wrapperClassName?: string;
  showNoImage?: boolean;
  showLoadingState?: boolean;
}

export interface ImageStatusState {
  error: boolean;
  fallbackFailed: boolean;
  imageSrc?: string;
  isLoading: boolean;
  isSrcProvided: boolean;
  showLoadingState: boolean;
}

export interface ImageStatusInput {
  imageSrc?: string;
  isSrcProvided: boolean;
  showLoadingState: boolean;
}

export interface ImageRenderState {
  actualSrc?: string;
  isSrcProvided: boolean;
  showFallback: boolean;
  showLoader: boolean;
}

export interface ImageElementProps extends ImgHTMLAttributes<HTMLImageElement> {
  actualSrc?: string;
  alt: string;
  forwardedRef: Ref<HTMLImageElement> | undefined;
  imageRef: { current: HTMLImageElement | null };
  isLoading: boolean;
  onCompleteImageLoad: () => void;
  renderImage: boolean;
  showLoadingState: boolean;
}

export interface ImageFallbackLayerProps {
  className?: string;
  fallbackComponent: ReactNode;
  fallbackFailed: boolean;
  noImageComponent: ReactNode;
  showNoImage: boolean;
}

export interface OptionalImageFallbackLayerProps
  extends ImageFallbackLayerProps {
  showFallback: boolean;
}

export interface ImageLoaderLayerProps {
  className?: string;
  loadingClassName?: string;
  loadingComponent: ReactNode;
}

export interface OptionalImageLoaderLayerProps extends ImageLoaderLayerProps {
  showLoader: boolean;
}
