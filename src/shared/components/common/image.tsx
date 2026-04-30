import { Loader2 } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ImgHTMLAttributes,
  type ReactNode,
  type Ref,
  type SyntheticEvent,
} from "react";

import { cn } from "@/shared/lib/utils";

import { ImagePlaceholder } from "./image-placeholder";

export interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  fallbackSrc?: string;
  alt: string;
  ref?: Ref<HTMLImageElement>;
  blurAmount?: string;
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

export function Image({
  src,
  fallbackSrc,
  alt,
  ref,
  className,
  blurAmount = "0.5rem",
  loadingComponent = <DefaultLoader />,
  noImageComponent = <ImagePlaceholder />,
  fallbackComponent = <ImagePlaceholder />,
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

  useEffect(() => {
    setError(false);
    setFallbackFailed(false);
    setIsLoading(isSrcProvided);
  }, [isSrcProvided, src]);

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

  const imageStyle = {
    ...style,
    filter: isLoading ? `blur(${blurAmount})` : "none",
    transition: "filter 0.3s ease-in-out, opacity 0.2s ease-in-out",
  };

  const showFallback = fallbackFailed || !isSrcProvided;

  return (
    <div
      className={cn("relative h-full w-full overflow-hidden", wrapperClassName)}
    >
      {isSrcProvided && !fallbackFailed ? (
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
          style={imageStyle}
          className={cn("h-full w-full object-cover", className)}
          loading={loading}
          decoding={decoding}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
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
          )}
        >
          {loadingComponent}
        </div>
      ) : null}
    </div>
  );
}

Image.displayName = "Image";
