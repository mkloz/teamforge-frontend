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
}

const DefaultLoader = () => (
  <div className="flex size-8 items-center justify-center rounded-full bg-background/80 p-1 shadow-sm">
    <Loader2 className="size-4 animate-spin text-forge-teal" />
  </div>
);

const DEFAULT_LOADING_COMPONENT = <DefaultLoader />;
const DEFAULT_IMAGE_PLACEHOLDER = <ImagePlaceholder />;

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
  style,
  loading = "lazy",
  decoding = "async",
  onLoad,
  onError,
  ...props
}: ImageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const isSrcProvided = Boolean(src?.trim());
  const actualSrc = error && fallbackSrc ? fallbackSrc : src;

  // biome-ignore lint/correctness/useExhaustiveDependencies: src changes must reset image state even when isSrcProvided stays true.
  useEffect(() => {
    setError(false);
    setFallbackFailed(false);
    setIsLoading(isSrcProvided);
  }, [isSrcProvided, src]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: actualSrc changes when fallback handling swaps image URLs.
  useEffect(() => {
    if (!isSrcProvided || !imageRef.current) {
      return;
    }

    if (imageRef.current.complete) {
      setIsLoading(false);
    }
  }, [actualSrc, isSrcProvided]);

  const handleLoad = (event: SyntheticEvent<HTMLImageElement>) => {
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
            }}
            src={actualSrc}
            alt={alt}
            style={style}
            className={cn(
              "size-full object-cover transition-all duration-700 ease-out",
              isLoading ? "blur-sm" : "blur-none",
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

      {isLoading && isSrcProvided && !fallbackFailed ? (
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
