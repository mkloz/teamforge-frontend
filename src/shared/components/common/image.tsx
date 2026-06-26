import { Loader2 } from "lucide-react";
import {
  type Dispatch,
  type ImgHTMLAttributes,
  type ReactNode,
  type Ref,
  type SetStateAction,
  type SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/shared/lib/utils";

import { ImagePlaceholder } from "./image-placeholder";

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

const DefaultLoader = () => (
  <div className="flex size-8 items-center justify-center rounded-full bg-background/80 p-1 shadow-sm">
    <Loader2 className="size-4 animate-spin text-forge-teal" />
  </div>
);

const DEFAULT_LOADING_COMPONENT = <DefaultLoader />;
const DEFAULT_IMAGE_PLACEHOLDER = <ImagePlaceholder />;
const loadedImageSources = new Set<string>();

function getImageSourceKey(src?: string | null) {
  const key = src?.trim();
  return key || null;
}

function hasLoadedImageSource(src?: string | null) {
  const key = getImageSourceKey(src);
  return Boolean(key && loadedImageSources.has(key));
}

function rememberLoadedImageSource(src?: string | null) {
  const key = getImageSourceKey(src);

  if (key) {
    loadedImageSources.add(key);
  }
}

function rememberLoadedImage(image: HTMLImageElement, propSrc?: string) {
  rememberLoadedImageSource(propSrc);
  rememberLoadedImageSource(image.currentSrc);
  rememberLoadedImageSource(image.src);
}

function isCompleteImage(
  image: HTMLImageElement | null,
): image is HTMLImageElement {
  return Boolean(image?.complete && image.naturalWidth > 0);
}

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

function getResetImageLoadingState({
  image,
  imageSrc,
  isSrcProvided,
  showLoadingState,
}: {
  image: HTMLImageElement | null;
  imageSrc?: string;
  isSrcProvided: boolean;
  showLoadingState: boolean;
}) {
  return (
    getInitialImageLoadingState({
      imageSrc,
      isSrcProvided,
      showLoadingState,
    }) && !isCompleteImage(image)
  );
}

function syncCompleteImage({
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

function syncCompleteMountedImage({
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

function syncForwardedImageRef(
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

function shouldRenderImage({
  fallbackFailed,
  isSrcProvided,
}: {
  fallbackFailed: boolean;
  isSrcProvided: boolean;
}) {
  return isSrcProvided && !fallbackFailed;
}

function getImageRenderState({
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
}) {
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

interface ImageFallbackLayerProps {
  className?: string;
  fallbackComponent: ReactNode;
  fallbackFailed: boolean;
  noImageComponent: ReactNode;
  showNoImage: boolean;
}

interface OptionalImageFallbackLayerProps extends ImageFallbackLayerProps {
  showFallback: boolean;
}

interface ImageLoaderLayerProps {
  className?: string;
  loadingClassName?: string;
  loadingComponent: ReactNode;
}

interface OptionalImageLoaderLayerProps extends ImageLoaderLayerProps {
  showLoader: boolean;
}

interface ImageElementProps extends ImgHTMLAttributes<HTMLImageElement> {
  actualSrc?: string;
  alt: string;
  forwardedRef: Ref<HTMLImageElement> | undefined;
  imageRef: { current: HTMLImageElement | null };
  isLoading: boolean;
  onCompleteImageLoad: () => void;
  renderImage: boolean;
  showLoadingState: boolean;
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

function updateImageErrorState({
  actualSrc,
  fallbackSrc,
  setError,
  setFallbackFailed,
}: {
  actualSrc?: string;
  fallbackSrc?: string;
  setError: Dispatch<SetStateAction<boolean>>;
  setFallbackFailed: Dispatch<SetStateAction<boolean>>;
}) {
  if (shouldRetryWithFallback({ actualSrc, fallbackSrc })) {
    setError(true);
    return;
  }

  setFallbackFailed(true);
}

function ImageElement({
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

function ImageFallbackLayer({
  className,
  fallbackComponent,
  fallbackFailed,
  noImageComponent,
  showNoImage,
}: ImageFallbackLayerProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center",
        className,
      )}
    >
      {fallbackFailed
        ? fallbackComponent
        : showNoImage
          ? noImageComponent
          : null}
    </div>
  );
}

function OptionalImageFallbackLayer({
  showFallback,
  ...props
}: OptionalImageFallbackLayerProps) {
  return showFallback ? <ImageFallbackLayer {...props} /> : null;
}

function ImageLoaderLayer({
  className,
  loadingClassName,
  loadingComponent,
}: ImageLoaderLayerProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center bg-background/20",
        className,
        loadingClassName,
      )}
    >
      {loadingComponent}
    </div>
  );
}

function OptionalImageLoaderLayer({
  showLoader,
  ...props
}: OptionalImageLoaderLayerProps) {
  return showLoader ? <ImageLoaderLayer {...props} /> : null;
}

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
  const imageSrc = getImageSourceKey(src) ?? undefined;
  const isSrcProvided = Boolean(imageSrc);
  const [isLoading, setIsLoading] = useState(() =>
    getInitialImageLoadingState({
      imageSrc,
      isSrcProvided,
      showLoadingState,
    }),
  );
  const [error, setError] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const { actualSrc, showFallback, showLoader } = getImageRenderState({
    error,
    fallbackFailed,
    fallbackSrc,
    imageSrc,
    isLoading,
    showLoadingState,
  });
  const renderImage = shouldRenderImage({ fallbackFailed, isSrcProvided });

  useEffect(() => {
    setError(false);
    setFallbackFailed(false);
    setIsLoading(
      getResetImageLoadingState({
        image: imageRef.current,
        imageSrc,
        isSrcProvided,
        showLoadingState,
      }),
    );
  }, [imageSrc, isSrcProvided, showLoadingState]);

  useEffect(() => {
    syncCompleteMountedImage({
      actualSrc,
      image: imageRef.current,
      isSrcProvided,
      onLoaded: () => setIsLoading(false),
    });
  }, [actualSrc, isSrcProvided]);

  const handleLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    rememberLoadedImage(event.currentTarget, actualSrc);
    setIsLoading(false);
    onLoad?.(event);
  };

  const handleError = (event: SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false);
    updateImageErrorState({
      actualSrc,
      fallbackSrc,
      setError,
      setFallbackFailed,
    });
    onError?.(event);
  };

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
        onCompleteImageLoad={() =>
          setIsLoading((current) => (current ? false : current))
        }
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
