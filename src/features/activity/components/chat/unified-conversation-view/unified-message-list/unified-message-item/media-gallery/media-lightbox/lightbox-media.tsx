import type { UnifiedAttachment } from "@/features/activity/lib/activity-contract";
import { cacheMediaIntrinsicSize } from "@/features/activity/lib/media-intrinsic-size";
import { Image } from "@/shared/components/common/image";
import { useImageState } from "@/shared/hooks/use-image-state";
import { cn } from "@/shared/lib/utils";
import { ImageOff, Loader2 } from "lucide-react";
import { memo, useState } from "react";

export const LightboxImage = memo(function LightboxImage({
  media,
}: {
  media: UnifiedAttachment;
}) {
  const { state, onLoad, onError } = useImageState();

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {state === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2
            size={36}
            strokeWidth={1.5}
            className="text-white/40 animate-spin"
          />
        </div>
      )}

      {state === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <ImageOff size={28} strokeWidth={1} className="text-white/30" />
          </div>
          <p className="text-white/40 text-xs font-medium uppercase tracking-widest">
            Image unavailable
          </p>
        </div>
      )}

      <Image
        src={media.url}
        alt={media.name || "Shared image"}
        onLoad={(event) => {
          cacheMediaIntrinsicSize(
            media.id,
            event.currentTarget.naturalWidth,
            event.currentTarget.naturalHeight,
          );
          onLoad();
        }}
        onError={onError}
        wrapperClassName="flex h-full w-full items-center justify-center overflow-visible"
        className={cn(
          "max-w-full max-h-full object-contain select-none",
          "shadow-[0_30px_60px_-15px_rgba(0,0,0,1)] ring-1 ring-white/5",
          "transition-opacity duration-300",
          state === "loaded" ? "opacity-100" : "opacity-0",
        )}
        loading="eager"
        loadingComponent={null}
        fallbackComponent={null}
        showNoImage={false}
      />
    </div>
  );
});

export const LightboxVideo = memo(function LightboxVideo({
  media,
}: {
  media: UnifiedAttachment;
}) {
  const [hasMetadata, setHasMetadata] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {!hasMetadata && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2
            size={36}
            strokeWidth={1.5}
            className="text-white/40 animate-spin"
          />
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <ImageOff size={28} strokeWidth={1} className="text-white/30" />
          </div>
          <p className="text-white/40 text-xs font-medium uppercase tracking-widest">
            Video unavailable
          </p>
        </div>
      )}

      <video
        src={media.url}
        poster={media.thumbnailUrl || undefined}
        controls
        playsInline
        preload="metadata"
        onLoadedMetadata={(event) => {
          cacheMediaIntrinsicSize(
            media.id,
            event.currentTarget.videoWidth,
            event.currentTarget.videoHeight,
          );
          setHasMetadata(true);
        }}
        onError={() => setHasError(true)}
        className={cn(
          "max-w-full max-h-full select-none",
          "shadow-[0_30px_60px_-15px_rgba(0,0,0,1)] ring-1 ring-white/5",
          "transition-opacity duration-300",
          hasMetadata ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
});
