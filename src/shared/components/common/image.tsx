import { Loader2 } from "lucide-react";
import {
  type ImgHTMLAttributes,
  type ReactNode,
  type Ref,
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
  const [isLoading, setIsLoading] = useState(
    showLoadingState && isSrcProvided && !hasLoadedImageSource(imageSrc),
  );
  const [error, setError] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const actualSrc = error && fallbackSrc ? fallbackSrc : imageSrc;

  useEffect(() => {
    setError(false);
    setFallbackFailed(false);
    setIsLoading(
      showLoadingState &&
        isSrcProvided &&
        !hasLoadedImageSource(imageSrc) &&
        !isCompleteImage(imageRef.current),
    );
  }, [imageSrc, isSrcProvided, showLoadingState]);

  useEffect(() => {
    if (!isSrcProvided || !imageRef.current) {
      return;
    }

    if (isCompleteImage(imageRef.current)) {
      rememberLoadedImage(imageRef.current, actualSrc);
      setIsLoading(false);
    }
  }, [actualSrc, isSrcProvided]);

  const handleLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    rememberLoadedImage(event.currentTarget, actualSrc);
    setIsLoading(false);
    onLoad?.(event);
  };

  const handleError = (event: SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false);

    if (fallbackSrc && actualSrc !== fallbackSrc) {
      setError(true);
    } else {
      setFallbackFailed(true);
    }

    onError?.(event);
  };

  const showFallback = fallbackFailed || !isSrcProvided;

  return (
    <div className={cn("relative size-full overflow-hidden", wrapperClassName)}>
      {isSrcProvided && !fallbackFailed ? (
        <>
          {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: Image load/error lifecycle handlers are not user interaction. */}
          <img
            ref={(node) => {
              imageRef.current = node;
              if (typeof ref === "function") {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }

              if (isCompleteImage(node)) {
                rememberLoadedImage(node, actualSrc);
                setIsLoading((current) => (current ? false : current));
              }
            }}
            src={actualSrc}
            alt={alt}
            style={style}
            className={cn(
              "size-full object-cover transition-all duration-700 ease-out",
              showLoadingState && isLoading ? "blur-sm" : "blur-none",
              className,
            )}
            loading={loading}
            decoding={decoding}
            onLoad={handleLoad}
            onError={handleError}
            {...props}
          />
        </>
      ) : null}

      {showFallback ? (
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
      ) : null}

      {showLoadingState && isLoading && isSrcProvided && !fallbackFailed ? (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-background/20",
            className,
            loadingClassName,
          )}
        >
          {loadingComponent}
        </div>
      ) : null}
    </div>
  );
}

Image.displayName = "Image";
